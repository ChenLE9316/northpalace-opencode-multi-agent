import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const args = new Set(process.argv.slice(2));
const mode = args.has('--deployment') ? 'deployment' : 'canonical';
const projectArgIndex = process.argv.indexOf('--project');
const projectRoot = projectArgIndex >= 0 && process.argv[projectArgIndex + 1]
  ? path.resolve(process.argv[projectArgIndex + 1])
  : process.cwd();

const failures = [];
const warnings = [];
const passes = [];

function pass(message) { passes.push(message); }
function warn(message) { warnings.push(message); }
function check(condition, message) {
  if (condition) pass(message);
  else failures.push(message);
}
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function listMd(rel) {
  const dir = path.join(root, rel);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name)
    .sort();
}
function stripJsonComments(text) {
  let out = '';
  let inString = false;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (lineComment) {
      if (ch === '\n') { lineComment = false; out += ch; }
      continue;
    }
    if (blockComment) {
      if (ch === '*' && next === '/') { blockComment = false; i += 1; }
      continue;
    }
    if (inString) {
      out += ch;
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; out += ch; continue; }
    if (ch === '/' && next === '/') { lineComment = true; i += 1; continue; }
    if (ch === '/' && next === '*') { blockComment = true; i += 1; continue; }
    out += ch;
  }
  return out;
}
function parseJsonc(text, label) {
  try {
    const clean = stripJsonComments(text).replace(/,\s*([}\]])/g, '$1');
    return JSON.parse(clean);
  } catch (error) {
    failures.push(`${label} is not parseable JSONC: ${error.message}`);
    return {};
  }
}
function extractFrontmatter(text) {
  if (!text.startsWith('---\n')) return '';
  const end = text.indexOf('\n---', 4);
  return end >= 0 ? text.slice(4, end) : '';
}
function topScalar(fm, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = fm.match(new RegExp(`^${escaped}:\\s*(.*?)\\s*$`, 'm'));
  if (!match) return undefined;
  return match[1].replace(/^['"]|['"]$/g, '');
}
function taskPolicy(fm) {
  const lines = fm.split(/\r?\n/);
  const p = lines.findIndex((line) => /^permission:\s*$/.test(line));
  if (p < 0) return { type: 'missing', entries: {} };
  for (let i = p + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^\S/.test(line)) break;
    const task = line.match(/^\s{2}task:\s*(.*?)\s*$/);
    if (!task) continue;
    if (task[1]) return { type: 'scalar', value: task[1].replace(/^['"]|['"]$/g, ''), entries: {} };
    const entries = {};
    for (let j = i + 1; j < lines.length; j += 1) {
      const child = lines[j];
      if (/^\s{0,2}\S/.test(child)) break;
      const m = child.match(/^\s{4}(?:"([^"]+)"|'([^']+)'|([^:]+)):\s*(allow|deny|ask)\s*$/);
      if (m) entries[(m[1] || m[2] || m[3]).trim()] = m[4];
    }
    return { type: 'map', entries };
  }
  return { type: 'missing', entries: {} };
}
function globRegex(pattern) {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replaceAll('*', '.*');
  return new RegExp(`^${escaped}$`);
}
function resolveAllowed(policy, candidates) {
  if (policy.type !== 'map') return [];
  const allowed = new Set();
  for (const [pattern, decision] of Object.entries(policy.entries)) {
    if (decision !== 'allow' || pattern === '*') continue;
    if (pattern.includes('*')) {
      const re = globRegex(pattern);
      for (const candidate of candidates) if (re.test(candidate)) allowed.add(candidate);
    } else {
      allowed.add(pattern);
    }
  }
  return [...allowed].sort();
}
function sameSet(actual, expected) {
  return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
}

const config = parseJsonc(read('opencode.jsonc'), 'opencode.jsonc');
check(config.default_agent === 'build', 'default_agent is build');
check(config.subagent_depth === 2, 'V1 top-level subagent_depth is 2');
check(config.autoupdate === false, 'autoupdate is hard-disabled for runtime-stability');
check(config.compaction?.auto === true, 'V1 compaction auto is enabled');
check(Number.isInteger(config.compaction?.preserve_recent_tokens) && config.compaction.preserve_recent_tokens > 0,
  'V1 compaction preserve_recent_tokens is explicit for V2 migration');
check(Number.isInteger(config.compaction?.reserved) && config.compaction.reserved > 0,
  'V1 compaction reserved buffer is explicit');

const plan = config.agent?.plan;
check(plan?.mode === 'primary', 'plan remains a primary L1');
check(config.agent?.build?.mode === 'primary', 'build remains a primary L1');
check(plan?.permission?.edit === 'deny', 'Plan native edit is denied');
check(plan?.permission?.bash?.['*'] === 'deny', 'Plan arbitrary Bash is hard-denied');
const planMetadataGit = [
  'git status',
  'git status --short',
  'git status --porcelain',
  'git diff --name-only',
  'git diff --stat',
  'git rev-parse HEAD',
  'git ls-files',
  'git branch --show-current',
  'git describe',
];
for (const safe of planMetadataGit) {
  check(plan?.permission?.bash?.[safe] === 'allow', `Plan exact metadata-only Git route is allowed: ${safe}`);
}
const planAllowedGitKeys = Object.entries(plan?.permission?.bash || {})
  .filter(([key, value]) => key !== '*' && value === 'allow')
  .map(([key]) => key)
  .sort();
check(sameSet(planAllowedGitKeys, [...planMetadataGit].sort()), 'Plan Git shell allowlist contains only exact metadata commands');
for (const forbidden of ['git diff*', 'git log*', 'git show*', 'git grep*', 'git remote*', 'git rev-parse*', 'git ls-files*', 'git branch --show-current*', 'git describe*']) {
  check(plan?.permission?.bash?.[forbidden] !== 'allow', `Plan has no broad/content-bearing Git allow rule: ${forbidden}`);
}

const globalBash = config.permission?.bash || {};
for (const dangerous of [
  'git push*', 'git reset --hard*', 'git clean*', 'git checkout --*', 'git restore*',
  'gh pr merge*', 'gh release create*', 'gh release delete*', 'gh repo delete*',
  'docker push*', 'kubectl apply*', 'kubectl delete*', 'helm upgrade*',
  'terraform apply*', 'terraform destroy*', 'rm *', 'rmdir *', 'del *',
  'Remove-Item *', 'powershell*Remove-Item*', 'cmd *del *', 'cargo clean*',
  'npm publish*', 'pnpm publish*', 'bun publish*', 'cargo publish*'
]) {
  check(globalBash[dangerous] === 'deny', `high-risk shell route is hard-denied: ${dangerous}`);
}
check(config.permission?.['cua-driver_*'] === 'deny', 'CUA tools are hard-denied by the canonical baseline');
for (const tool of ['playwright_browser_run_code_unsafe', 'playwright_browser_file_upload', 'playwright_browser_drop', 'playwright_browser_evaluate']) {
  check(config.permission?.[tool] === 'deny', `global Playwright high-risk tool is denied: ${tool}`);
}
check(config.permission?.skill?.['northpalace-langfei-ni-token'] === 'deny', 'operator-only skill is denied to model-facing skill loading');

const agentFiles = listMd('agents');
const specialistNames = agentFiles.map((file) => file.replace(/\.md$/, ''));
if (mode === 'canonical') check(agentFiles.length === 34, 'canonical specialist count is 34');
else check(agentFiles.length > 0, 'deployment has specialist definitions');

const policies = new Map();
for (const file of agentFiles) {
  const text = read(`agents/${file}`);
  const fm = extractFrontmatter(text);
  const name = file.replace(/\.md$/, '');
  check(topScalar(fm, 'mode') === 'subagent', `${name} mode is subagent`);
  check(topScalar(fm, 'hidden') === 'false', `${name} hidden is false`);
  const permissionBlock = fm.slice(fm.indexOf('permission:'));
  check(/^\s{2}question:\s*deny\s*$/m.test(permissionBlock), `${name} question tool is denied`);
  policies.set(name, taskPolicy(fm));
}

const inlineNames = ['explore', 'general'];
const candidates = [...specialistNames, ...inlineNames];
const coordinators = specialistNames.filter((name) => policies.get(name)?.type === 'map').sort();
const canonicalCoordinators = ['agent-orchestrator', 'decision-analyst', 'planning-agent', 'product-manager', 'release-manager'].sort();
if (mode === 'canonical') check(sameSet(coordinators, canonicalCoordinators), 'canonical coordinator set is exact');
else check(coordinators.length > 0, 'deployment coordinator set is non-empty');

for (const name of specialistNames) {
  const policy = policies.get(name);
  if (!coordinators.includes(name)) check(policy?.type === 'scalar' && policy.value === 'deny', `${name} is a task-deny leaf`);
}
check(config.agent?.explore?.permission?.task === 'deny', 'inline explore is a task-deny leaf');
check(config.agent?.general?.permission?.task === 'deny', 'inline general is a task-deny leaf');

for (const coordinator of coordinators) {
  const targets = resolveAllowed(policies.get(coordinator), candidates);
  check(!targets.includes(coordinator), `${coordinator} has no self-delegation`);
  for (const target of targets) {
    check(candidates.includes(target), `${coordinator} target exists: ${target}`);
    const leaf = inlineNames.includes(target)
      ? config.agent?.[target]?.permission?.task === 'deny'
      : policies.get(target)?.type === 'scalar' && policies.get(target)?.value === 'deny';
    check(leaf, `${coordinator} target is task-deny leaf: ${target}`);
  }
}

if (mode === 'canonical') {
  const expectedEngineers = ['ai-ml-engineer', 'cli-engineer', 'db-engineer', 'devops-engineer', 'electron-engineer', 'frontend-engineer', 'rag-engineer', 'rust-engineer', 'tauri-engineer'];
  const actualEngineers = specialistNames.filter((name) => /-engineer$/.test(name)).sort();
  check(sameSet(actualEngineers, expectedEngineers.sort()), 'AO *-engineer resolution matches the reviewed nine-role baseline');

  const planExpected = ['explore','planning-agent','product-manager','researcher','api-designer','ui-designer','a11y-specialist','security-auditor','screen-context-agent','dependency-checker','error-analyzer','discussion-facilitator','multi-angle-researcher','decision-analyst','architect','review','handoff-drafter'].sort();
  const buildExpected = ['explore','general','architect','researcher','review','security-auditor','error-analyzer','dependency-checker','agent-orchestrator','frontend-engineer','rust-engineer','tauri-engineer','electron-engineer','test-runner','release-manager','knowledge-curator','handoff-drafter','e2e-tester'].sort();
  const mapAllowed = (obj = {}) => Object.entries(obj).filter(([key, value]) => key !== '*' && value === 'allow').map(([key]) => key).sort();
  check(sameSet(mapAllowed(config.agent?.plan?.permission?.task), planExpected), 'canonical Plan L2 allowlist matches 17 roles');
  check(sameSet(mapAllowed(config.agent?.build?.permission?.task), buildExpected), 'canonical Build L2 allowlist matches 18 roles');
}

const curator = read('agents/knowledge-curator.md');
check(curator.includes('"knowledge/**": allow') && curator.includes('"decisions/**": allow'), 'knowledge-curator can write canonical root knowledge/decisions');
check(!curator.includes('"**/knowledge/**": allow') && !curator.includes('"**/decisions/**": allow'), 'knowledge-curator has no nested project-wide knowledge/decisions wildcard');

const commandFiles = listMd('commands');
if (mode === 'canonical') check(commandFiles.length === 19, 'canonical command count is 19');
const skillDirs = fs.readdirSync(path.join(root, 'skills'), { withFileTypes: true }).filter((entry) => entry.isDirectory() && exists(`skills/${entry.name}/SKILL.md`)).map((entry) => entry.name).sort();
if (mode === 'canonical') check(skillDirs.length === 8, 'canonical skill count is 8');

const tauriVerify = read('commands/tauri-verify.md');
const tauriFm = extractFrontmatter(tauriVerify);
check(topScalar(tauriFm, 'agent') === 'build', '/tauri-verify executes in Build L1');
check(topScalar(tauriFm, 'subtask') === 'false', '/tauri-verify does not depend on command subtask semantics');
check(/fresh [`']?test-runner[`']?/i.test(tauriVerify) && /TaskEnvelope/.test(tauriVerify), '/tauri-verify explicitly delegates a fresh test-runner task');

const operatorSkill = read('skills/northpalace-langfei-ni-token/SKILL.md');
const operatorFm = extractFrontmatter(operatorSkill);
check(topScalar(operatorFm, 'slash') === 'false', 'operator-only skill is hidden from V2 slash activation');
check(/opencode\/autoinvoke:\s*false/.test(operatorFm), 'operator-only skill disables V2 model autoinvoke metadata');
check(/canonical topology/i.test(operatorSkill) && /stop without dispatch/i.test(operatorSkill), 'full sweep stops on canonical topology drift instead of adapting to incompatible coverage');
check(/stable final snapshot/i.test(operatorSkill), 'full sweep defines a stable final snapshot gate');
check(/fresh security/i.test(operatorSkill) && /final verification/i.test(operatorSkill), 'full sweep requires final verification and fresh security after writers settle');

check(exists('compat/v2/opencode.overlay.jsonc'), 'V2 compatibility overlay exists');
const v2 = parseJsonc(read('compat/v2/opencode.overlay.jsonc'), 'compat/v2/opencode.overlay.jsonc');
check(v2.autoupdate === false, 'V2 overlay disables autoupdate');
check(v2.experimental?.subagent_depth === 2, 'V2 overlay uses experimental.subagent_depth=2');
check(v2.compaction?.auto === true, 'V2 overlay enables compaction');
check(Number.isInteger(v2.compaction?.keep?.tokens) && v2.compaction.keep.tokens > 0, 'V2 overlay sets compaction.keep.tokens');
check(Number.isInteger(v2.compaction?.buffer) && v2.compaction.buffer > 0, 'V2 overlay sets compaction.buffer');
check(exists('scripts/opencode2-northpalace.sh'), 'V2 Bash launcher exists');
check(exists('RUNTIME_COMPATIBILITY.md'), 'runtime compatibility contract exists');

const criticalCommandCollision = path.join(projectRoot, '.opencode', 'commands', 'northpalace-langfei-ni-token.md');
const criticalSkillCollision = path.join(projectRoot, '.opencode', 'skills', 'northpalace-langfei-ni-token', 'SKILL.md');
if (path.resolve(projectRoot) !== path.resolve(root)) {
  check(!fs.existsSync(criticalCommandCollision), 'active project does not shadow the operator-only command');
  check(!fs.existsSync(criticalSkillCollision), 'active project does not shadow the operator-only skill');
}

const budgets = [
  ['AGENTS.md', 60],
  ['rules/orchestration.md', 90],
  ['prompts/build.md', 40],
  ['prompts/plan.md', 34],
];
for (const [file, maxLines] of budgets) {
  const lines = read(file).split(/\r?\n/).length;
  if (lines <= maxLines) pass(`${file} stays within ${maxLines} lines`);
  else warn(`${file} has ${lines} lines (budget ${maxLines})`);
}

for (const message of passes) console.log(`[OK] ${message}`);
for (const message of warnings) console.warn(`[WARN] ${message}`);
for (const message of failures) console.error(`[FAIL] ${message}`);
console.log(`\nNorthPalace governance validation: ${failures.length} FAIL, ${warnings.length} WARN, ${passes.length} OK (${mode}).`);
process.exit(failures.length ? 1 : 0);
