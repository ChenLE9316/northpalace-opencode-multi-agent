import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = new Set(process.argv.slice(2));
const mode = args.has('--deployment') ? 'deployment' : 'canonical';
const projectArgIndex = process.argv.indexOf('--project');
const projectRoot = projectArgIndex >= 0 && process.argv[projectArgIndex + 1]
  ? path.resolve(process.argv[projectArgIndex + 1])
  : process.cwd();

const failures = [];
const warnings = [];
const passes = [];
const pass = (message) => passes.push(message);
const warn = (message) => warnings.push(message);
const check = (condition, message) => (condition ? pass(message) : failures.push(message));
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

function listMd(rel) {
  const dir = path.join(root, rel);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name).sort();
}
function stripJsonComments(text) {
  let out = '', inString = false, escaped = false, lineComment = false, blockComment = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i], next = text[i + 1];
    if (lineComment) { if (ch === '\n') { lineComment = false; out += ch; } continue; }
    if (blockComment) { if (ch === '*' && next === '/') { blockComment = false; i += 1; } continue; }
    if (inString) { out += ch; if (escaped) escaped = false; else if (ch === '\\') escaped = true; else if (ch === '"') inString = false; continue; }
    if (ch === '"') { inString = true; out += ch; continue; }
    if (ch === '/' && next === '/') { lineComment = true; i += 1; continue; }
    if (ch === '/' && next === '*') { blockComment = true; i += 1; continue; }
    out += ch;
  }
  return out;
}
function parseJsonc(text, label) {
  try { return JSON.parse(stripJsonComments(text).replace(/,\s*([}\]])/g, '$1')); }
  catch (error) { failures.push(`${label} is not parseable JSONC: ${error.message}`); return {}; }
}
function extractFrontmatter(text) {
  if (!text.startsWith('---\n')) return '';
  const end = text.indexOf('\n---', 4);
  return end >= 0 ? text.slice(4, end) : '';
}
function topScalar(fm, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = fm.match(new RegExp(`^${escaped}:\\s*(.*?)\\s*$`, 'm'));
  return match?.[1]?.replace(/^['"]|['"]$/g, '');
}
function taskPolicy(fm) {
  const lines = fm.split(/\r?\n/);
  const p = lines.findIndex((line) => /^permission:\s*$/.test(line));
  if (p < 0) return { type: 'missing', entries: {} };
  for (let i = p + 1; i < lines.length; i += 1) {
    if (/^\S/.test(lines[i])) break;
    const task = lines[i].match(/^\s{2}task:\s*(.*?)\s*$/);
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
    } else allowed.add(pattern);
  }
  return [...allowed].sort();
}
function sameSet(actual, expected) {
  const a = [...actual].sort(), b = [...expected].sort();
  return a.length === b.length && a.every((value, index) => value === b[index]);
}
function sameObject(actual, expected) {
  return JSON.stringify(Object.entries(actual).sort()) === JSON.stringify(Object.entries(expected).sort());
}

const config = parseJsonc(read('opencode.jsonc'), 'opencode.jsonc');
check(config.default_agent === 'build', 'default_agent remains build');
check(config.subagent_depth === 2, 'V1 top-level subagent_depth is 2');
check(config.autoupdate === false, 'autoupdate is hard-disabled');
check(config.share === 'disabled', 'sharing remains disabled');
check(config.compaction?.auto === true, 'V1 compaction auto is enabled');
check(Number.isInteger(config.compaction?.preserve_recent_tokens) && config.compaction.preserve_recent_tokens > 0, 'V1 compaction preserve_recent_tokens is explicit');
check(Number.isInteger(config.compaction?.reserved) && config.compaction.reserved > 0, 'V1 compaction reserved buffer is explicit');

const plan = config.agent?.plan;
const build = config.agent?.build;
const loop = config.agent?.['northpace-loop'];
for (const [name, agent] of [['plan', plan], ['build', build], ['northpace-loop', loop]]) {
  check(agent?.mode === 'primary', `${name} is a primary L1`);
  check(agent?.permission?.task?.['*'] === 'ask', `${name} L1 Task wildcard fallback is ask`);
}
check(plan?.steps === 100, 'Plan steps remains 100');
check(build?.steps === 200, 'Build steps remains 200');
check(loop?.steps === undefined, 'NorthPace Loop has no repository steps ceiling');
check(plan?.permission?.edit === 'deny', 'Plan native edit is denied');
check(plan?.permission?.bash?.['*'] === 'deny', 'Plan arbitrary Bash is hard-denied');

const planMetadataGit = [
  'git status','git status --short','git status --porcelain','git diff --name-only','git diff --stat',
  'git rev-parse HEAD','git ls-files','git branch --show-current','git describe',
];
for (const safe of planMetadataGit) check(plan?.permission?.bash?.[safe] === 'allow', `Plan exact metadata Git route allowed: ${safe}`);
const planAllowedGit = Object.entries(plan?.permission?.bash || {}).filter(([k,v]) => k !== '*' && v === 'allow').map(([k]) => k);
check(sameSet(planAllowedGit, planMetadataGit), 'Plan shell allowlist contains only exact metadata Git commands');
for (const forbidden of ['git diff*','git log*','git show*','git grep*','git remote*','git rev-parse*','git ls-files*','git branch --show-current*','git describe*']) {
  check(plan?.permission?.bash?.[forbidden] !== 'allow', `Plan has no broad/content-bearing Git allow: ${forbidden}`);
}

const globalBash = config.permission?.bash || {};
for (const dangerous of [
  'git push*','git reset --hard*','git clean*','git checkout --*','git restore*',
  'gh pr merge*','gh release create*','gh release delete*','gh repo delete*',
  'docker push*','kubectl apply*','kubectl delete*','helm upgrade*','terraform apply*','terraform destroy*',
  'rm *','rmdir *','del *','Remove-Item *','powershell*Remove-Item*','cmd *del *','cargo clean*',
  'npm publish*','pnpm publish*','bun publish*','cargo publish*',
]) check(globalBash[dangerous] === 'deny', `high-risk shell route hard-denied: ${dangerous}`);

check(config.permission?.['cua-driver_*'] === 'deny', 'CUA is globally denied');
check(build?.permission?.['cua-driver_*'] === 'ask', 'Build CUA is supervised ask');
check(plan?.permission?.['cua-driver_*'] === 'deny', 'Plan CUA is explicitly denied');
check(loop?.permission?.['cua-driver_*'] === undefined, 'NorthPace Loop does not override global CUA deny');
check(config.mcp?.['cua-driver']?.enabled === true, 'CUA MCP is enabled for supervised Build use');
for (const tool of ['playwright_browser_run_code_unsafe','playwright_browser_file_upload','playwright_browser_drop','playwright_browser_evaluate']) {
  check(config.permission?.[tool] === 'deny', `global Playwright high-risk tool denied: ${tool}`);
}
check(config.permission?.skill?.['northpalace-langfei-ni-token'] === 'deny', 'operator-only skill denied to model-facing skill loading');

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
  if (mode === 'canonical') check(!fm.includes('cua-driver_'), `${name} has no canonical CUA override`);
  policies.set(name, taskPolicy(fm));
}

const inlineNames = ['explore','general'];
const subagentCandidates = [...specialistNames, ...inlineNames];
const coordinators = specialistNames.filter((name) => policies.get(name)?.type === 'map').sort();
const canonicalCoordinators = ['agent-orchestrator','decision-analyst','planning-agent','product-manager','release-manager'];
if (mode === 'canonical') check(sameSet(coordinators, canonicalCoordinators), 'canonical coordinator set is exact');

for (const name of specialistNames) {
  if (!coordinators.includes(name)) {
    const p = policies.get(name);
    check(p?.type === 'scalar' && p.value === 'deny', `${name} remains a task-deny leaf`);
  }
}
check(config.agent?.explore?.permission?.task === 'deny', 'inline explore is task-deny leaf');
check(config.agent?.general?.permission?.task === 'deny', 'inline general is task-deny leaf');

const coordinatorExpected = {
  'agent-orchestrator': {'*':'deny','explore':'allow','general':'allow','*-engineer':'allow','refactorer':'allow','test-runner':'allow','test-writer':'allow','e2e-tester':'allow','doc-generator':'allow','ci-debugger':'allow'},
  'planning-agent': {'*':'deny','explore':'allow','researcher':'allow','multi-angle-researcher':'allow','discussion-facilitator':'allow'},
  'product-manager': {'*':'deny','researcher':'allow','multi-angle-researcher':'allow','discussion-facilitator':'allow','api-designer':'allow'},
  'decision-analyst': {'*':'deny','researcher':'allow','multi-angle-researcher':'allow','discussion-facilitator':'allow','dependency-checker':'allow'},
  'release-manager': {'*':'deny','security-auditor':'allow','dependency-checker':'allow'},
};
for (const [name, expected] of Object.entries(coordinatorExpected)) {
  const policy = policies.get(name);
  check(policy?.type === 'map' && sameObject(policy.entries, expected), `${name} exact coordinator Task map matches`);
  const targets = resolveAllowed(policy, subagentCandidates);
  check(!targets.includes(name), `${name} has no self-delegation`);
  check(!targets.some((target) => coordinators.includes(target)), `${name} has no coordinator-to-coordinator edge`);
  for (const target of targets) {
    const leaf = inlineNames.includes(target)
      ? config.agent?.[target]?.permission?.task === 'deny'
      : policies.get(target)?.type === 'scalar' && policies.get(target)?.value === 'deny';
    check(leaf, `${name} target is task-deny L3 leaf: ${target}`);
  }
}

if (mode === 'canonical') {
  const expectedEngineers = ['ai-ml-engineer','cli-engineer','db-engineer','devops-engineer','electron-engineer','frontend-engineer','rag-engineer','rust-engineer','tauri-engineer'];
  check(sameSet(specialistNames.filter((n) => /-engineer$/.test(n)), expectedEngineers), 'AO *-engineer resolves to reviewed nine engineers');

  const planExpected = ['explore','planning-agent','product-manager','researcher','api-designer','ui-designer','a11y-specialist','security-auditor','screen-context-agent','dependency-checker','error-analyzer','discussion-facilitator','multi-angle-researcher','decision-analyst','architect','review','handoff-drafter'];
  const buildExpected = ['explore','general','architect','researcher','review','security-auditor','error-analyzer','dependency-checker','agent-orchestrator','frontend-engineer','rust-engineer','tauri-engineer','electron-engineer','test-runner','release-manager','knowledge-curator','handoff-drafter','e2e-tester'];
  const loopExpected = [...subagentCandidates];
  const allowed = (obj = {}) => Object.entries(obj).filter(([k,v]) => k !== '*' && v === 'allow').map(([k]) => k);
  check(sameSet(allowed(plan?.permission?.task), planExpected), 'Plan exact 17 direct auto-allowed L2 routes match');
  check(sameSet(allowed(build?.permission?.task), buildExpected), 'Build exact 18 direct auto-allowed L2 routes match');
  check(sameSet(allowed(loop?.permission?.task), loopExpected), 'NorthPace Loop exact 36 direct auto-allowed L2 routes match');
  check(loopExpected.length === 36, 'Loop canonical subagent target count is 36');
  check(plan?.permission?.task?.['northpace-loop'] === undefined && build?.permission?.task?.['northpace-loop'] === undefined, 'Plan/Build do not explicitly allow NorthPace Loop as a Task target');
}

const curator = read('agents/knowledge-curator.md');
check(curator.includes('"knowledge/**": allow') && curator.includes('"decisions/**": allow'), 'knowledge-curator can write canonical root knowledge/decisions');
check(!curator.includes('"**/knowledge/**": allow') && !curator.includes('"**/decisions/**": allow'), 'knowledge-curator has no nested project-wide wildcard');

const commandFiles = listMd('commands');
if (mode === 'canonical') check(commandFiles.length === 19, 'canonical command count is 19');
const skillDirs = fs.readdirSync(path.join(root, 'skills'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && exists(`skills/${entry.name}/SKILL.md`)).map((entry) => entry.name).sort();
if (mode === 'canonical') check(skillDirs.length === 8, 'canonical skill count is 8');

const tauriVerify = read('commands/tauri-verify.md');
const tauriFm = extractFrontmatter(tauriVerify);
check(topScalar(tauriFm, 'agent') === 'build', '/tauri-verify executes in Build L1');
check(topScalar(tauriFm, 'subtask') === 'false', '/tauri-verify does not depend on command subtask semantics');
check(/fresh [`']?test-runner[`']?/i.test(tauriVerify) && /TaskEnvelope/.test(tauriVerify), '/tauri-verify explicitly delegates fresh test-runner');

const operatorCommand = read('commands/northpalace-langfei-ni-token.md');
check(/Plan\/Build/i.test(operatorCommand) && /NorthPace Loop is intentionally not a target/.test(operatorCommand), 'operator full sweep is explicitly Plan/Build-only');
const operatorSkill = read('skills/northpalace-langfei-ni-token/SKILL.md');
const operatorFm = extractFrontmatter(operatorSkill);
check(topScalar(operatorFm, 'slash') === 'false', 'operator-only skill hidden from V2 slash activation');
check(/opencode\/autoinvoke:\s*false/.test(operatorFm), 'operator-only skill disables V2 model autoinvoke metadata');
check(/canonical topology/i.test(operatorSkill) && /stop without dispatch/i.test(operatorSkill), 'full sweep stops on canonical topology drift');
check(/stable final snapshot/i.test(operatorSkill), 'full sweep defines stable final snapshot');
check(/fresh security/i.test(operatorSkill) && /final verification/i.test(operatorSkill), 'full sweep requires final verification and fresh security');

check(exists('prompts/northpace-loop.md'), 'NorthPace Loop primary prompt exists');
check(exists('decisions/northpace-loop-goal-mode.md'), 'NorthPace Loop architecture decision exists');
check(exists('scripts/validate-model-routing.mjs'), 'public model routing validator exists');
check(exists('scripts/validate-desktop-contract.mjs'), 'Desktop contract validator exists');

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
  check(!fs.existsSync(criticalCommandCollision), 'active project does not shadow operator-only command');
  check(!fs.existsSync(criticalSkillCollision), 'active project does not shadow operator-only skill');
}

const budgets = [
  ['AGENTS.md', 75],
  ['rules/orchestration.md', 140],
  ['prompts/build.md', 55],
  ['prompts/plan.md', 45],
  ['prompts/northpace-loop.md', 80],
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
