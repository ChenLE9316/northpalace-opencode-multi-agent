import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const passes = [];
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const check = (condition, message) => (condition ? passes : failures).push(message);

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
function taskPolicy(fm) {
  const lines = fm.split(/\r?\n/);
  const p = lines.findIndex((line) => /^permission:\s*$/.test(line));
  if (p < 0) return { type: 'missing', entries: {} };
  for (let i = p + 1; i < lines.length; i += 1) {
    if (/^\S/.test(lines[i])) break;
    const task = lines[i].match(/^\s{2}task:\s*(.*?)\s*$/);
    if (!task) continue;
    if (task[1]) return { type: 'scalar', value: task[1], entries: {} };
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
function sameObject(a, b) {
  return JSON.stringify(Object.entries(a).sort()) === JSON.stringify(Object.entries(b).sort());
}
function hasPermissionDeny(fm, key) {
  const permission = fm.slice(fm.indexOf('permission:'));
  return new RegExp(`^\\s{2}${key}:\\s*deny\\s*$`, 'm').test(permission);
}
function hasToolDecision(fm, key, decision) {
  const permission = fm.slice(fm.indexOf('permission:'));
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^\\s{2}["']?${escaped}["']?:\\s*${decision}\\s*$`, 'm').test(permission);
}
function exactAllowedTaskMap(names, fallback = 'ask') {
  return Object.fromEntries([['*', fallback], ...names.map((name) => [name, 'allow'])]);
}

const config = parseJsonc(read('opencode.jsonc'), 'opencode.jsonc');
const specialistFiles = fs.readdirSync(path.join(root, 'agents')).filter((n) => n.endsWith('.md')).sort();
const specialistNames = specialistFiles.map((n) => n.replace(/\.md$/, ''));
const allSubagents = ['explore', 'general', ...specialistNames].sort();

check(config.default_agent === 'build', 'Build remains default startup primary');
for (const primary of ['plan', 'build', 'northpace-loop']) check(config.agent?.[primary]?.mode === 'primary', `${primary} remains a primary L1 identity`);
check(config.agent?.plan?.permission?.task?.['*'] === 'deny', 'Plan noncanonical Task fallback remains hard deny under Auto Mode');
check(config.agent?.build?.permission?.task?.['*'] === 'ask', 'Build noncanonical Task fallback is supervised ask');
check(config.agent?.['northpace-loop']?.permission?.task?.['*'] === 'ask', 'NorthPace Loop noncanonical Task fallback is supervised ask');
check(config.agent?.['northpace-loop']?.steps === undefined, 'NorthPace Loop has no repository steps ceiling');
check(config.agent?.['northpace-loop']?.model === undefined && config.agent?.['northpace-loop']?.variant === undefined && config.agent?.['northpace-loop']?.temperature === undefined, 'NorthPace Loop has no per-agent model/variant/temperature override; public inherited model is validated separately');
check(config.agent?.['northpace-loop']?.permission?.doom_loop === 'deny', 'NorthPace Loop hard-denies runtime doom_loop');

const loopTask = config.agent?.['northpace-loop']?.permission?.task ?? {};
check(sameObject(loopTask, exactAllowedTaskMap(allSubagents, 'ask')), 'NorthPace Loop exact direct L2 map allows all 36 canonical subagents with ask fallback for noncanonical targets');
check(allSubagents.length === 36, 'canonical subagent identity count for Loop is 36');
check(config.agent?.plan?.permission?.task?.['northpace-loop'] === undefined, 'Plan does not directly allow NorthPace Loop as a Task target');
check(config.agent?.build?.permission?.task?.['northpace-loop'] === undefined, 'Build does not directly allow NorthPace Loop as a Task target');

const coordinatorExpected = {
  'agent-orchestrator': { '*': 'deny', explore: 'allow', general: 'allow', '*-engineer': 'allow', refactorer: 'allow', 'test-runner': 'allow', 'test-writer': 'allow', 'e2e-tester': 'allow', 'doc-generator': 'allow', 'ci-debugger': 'allow' },
  'planning-agent': { '*': 'deny', explore: 'allow', researcher: 'allow', 'multi-angle-researcher': 'allow', 'discussion-facilitator': 'allow' },
  'product-manager': { '*': 'deny', researcher: 'allow', 'multi-angle-researcher': 'allow', 'discussion-facilitator': 'allow', 'api-designer': 'allow' },
  'decision-analyst': { '*': 'deny', researcher: 'allow', 'multi-angle-researcher': 'allow', 'discussion-facilitator': 'allow', 'dependency-checker': 'allow' },
  'release-manager': { '*': 'deny', 'security-auditor': 'allow', 'dependency-checker': 'allow' },
};
for (const [name, expected] of Object.entries(coordinatorExpected)) {
  const policy = taskPolicy(extractFrontmatter(read(`agents/${name}.md`)));
  check(policy.type === 'map', `${name} remains a coordinator Task map`);
  check(sameObject(policy.entries, expected), `${name} autonomous child allowlist is exact`);
  check(policy.entries['northpace-loop'] === undefined, `${name} cannot autonomously invoke NorthPace Loop`);
}

const explicitReadOnly = [
  'a11y-specialist','agent-orchestrator','api-designer','architect','decision-analyst',
  'dependency-checker','discussion-facilitator','error-analyzer','handoff-drafter',
  'multi-angle-researcher','planning-agent','product-manager','researcher','review',
  'screen-context-agent','security-auditor','ui-designer',
];
for (const name of explicitReadOnly) {
  const fm = extractFrontmatter(read(`agents/${name}.md`));
  check(hasPermissionDeny(fm, 'edit'), `${name} explicitly denies edit`);
  check(hasPermissionDeny(fm, 'bash'), `${name} explicitly denies bash`);
}

check(config.permission?.['playwright_*'] === 'deny', 'global Playwright remains denied');
check(config.permission?.['cua-driver_*'] === 'deny', 'global CUA remains denied');
for (const primary of ['build', 'northpace-loop']) {
  const p = config.agent?.[primary]?.permission ?? {};
  check(p['playwright_*'] === 'ask', `${primary} re-enables bounded browser automation as ask`);
  check(p['cua-driver_*'] === 'ask', `${primary} re-enables CUA as ask`);
  check(p.playwright_browser_run_code_unsafe === 'deny', `${primary} keeps unsafe Playwright code denied`);
  check(p.playwright_browser_file_upload === 'deny', `${primary} keeps Playwright upload denied`);
  check(p.playwright_browser_drop === 'deny', `${primary} keeps Playwright drop denied`);
  check(p.playwright_browser_evaluate === 'deny', `${primary} keeps Playwright evaluate denied`);
}
check(config.mcp?.playwright?.enabled === false, 'Playwright MCP transport stays disabled-by-default');
check(config.mcp?.['cua-driver']?.enabled === false, 'CUA MCP transport stays disabled-by-default');

const browserPolicy = {
  'frontend-engineer': { evaluate: 'deny', upload: 'deny' },
  'e2e-tester': { evaluate: 'ask', upload: 'ask' },
  'electron-engineer': { evaluate: 'ask', upload: 'deny' },
  'tauri-engineer': { evaluate: 'ask', upload: 'deny' },
};
for (const [name, expected] of Object.entries(browserPolicy)) {
  const fm = extractFrontmatter(read(`agents/${name}.md`));
  check(hasToolDecision(fm, 'playwright_*', 'ask'), `${name} has approval-gated browser automation`);
  check(hasToolDecision(fm, 'playwright_browser_run_code_unsafe', 'deny'), `${name} denies unsafe page code`);
  check(hasToolDecision(fm, 'playwright_browser_drop', 'deny'), `${name} denies Playwright drop`);
  check(hasToolDecision(fm, 'playwright_browser_evaluate', expected.evaluate), `${name} evaluate policy is ${expected.evaluate}`);
  check(hasToolDecision(fm, 'playwright_browser_file_upload', expected.upload), `${name} upload policy is ${expected.upload}`);
}
for (const file of specialistFiles) {
  const name = file.replace(/\.md$/, '');
  if (Object.hasOwn(browserPolicy, name)) continue;
  const fm = extractFrontmatter(read(`agents/${file}`));
  check(!hasToolDecision(fm, 'playwright_*', 'ask') && !hasToolDecision(fm, 'playwright_*', 'allow'), `${name} does not broaden browser automation`);
  check(!hasToolDecision(fm, 'cua-driver_*', 'ask') && !hasToolDecision(fm, 'cua-driver_*', 'allow'), `${name} does not gain CUA authority`);
}

const agentsDoc = read('AGENTS.md');
check(agentsDoc.includes('three Human-visible primary L1') && agentsDoc.includes('northpace-loop'), 'AGENTS documents three primary L1 trees');
check(agentsDoc.includes('Human Operator') && agentsDoc.includes('mixed-initiative'), 'AGENTS preserves Human Operator mixed-initiative control');
check(agentsDoc.includes('all 36 canonical subagent identities'), 'AGENTS documents Loop all-subagent L2 authority');
check(agentsDoc.includes('Plan keeps `permission.task["*"] = deny`') && agentsDoc.includes('Build and NorthPace Loop use `permission.task["*"] = ask`'), 'AGENTS documents asymmetric L1 Task fallback');
check(agentsDoc.includes('Auto Mode is therefore **Human preauthorization for `ask`, not a bypass of `deny`**'), 'AGENTS documents Auto Mode permission semantics');

const orchestration = read('rules/orchestration.md');
check(orchestration.includes('exactly `plan`, `build`, and `northpace-loop`'), 'orchestration defines exact three-primary set');
check(orchestration.includes('At most one mutating L1 owns the same objective at a time'), 'orchestration keeps single mutating-L1 owner invariant');
check(orchestration.includes('all 36 canonical subagents'), 'orchestration defines Loop 36-L2 authority');
check(orchestration.includes('No repository `steps` ceiling means unbounded horizon, not unbounded retry'), 'orchestration distinguishes unbounded horizon from retry loop');
check(orchestration.includes('Global Bash fallback is `ask`'), 'orchestration documents supervised Bash baseline');

const loopPrompt = read('prompts/northpace-loop.md');
check(loopPrompt.includes('Only the Human Operator may enter/select NorthPace Loop'), 'Loop prompt requires Human-only primary entry');
check(loopPrompt.includes('current Human prompt establishes the Root Goal'), 'Loop prompt captures next Human prompt as Root Goal when inactive');
check(loopPrompt.includes('later Human prompts are steering/constraints/evidence by default'), 'Loop prompt treats later prompts as steering by default');
check(loopPrompt.includes('Completing a task, fix, test, milestone, review, or one implementation slice is **not** completing the Root Goal'), 'Loop prompt does not stop at subtask completion');
check(loopPrompt.includes('unbounded goal horizon, **not infinite repetition**'), 'Loop prompt distinguishes horizon from infinite retry');
check(loopPrompt.includes('hard-denies `doom_loop`'), 'Loop prompt documents identical-call hard stop');
check(loopPrompt.includes('Human Operator may at any time steer'), 'Loop prompt preserves Human interruption/steering');

const buildPrompt = read('prompts/build.md');
check(buildPrompt.includes('bounded mutating L1 owner') && buildPrompt.includes('northpace-loop'), 'Build prompt recognizes Loop as alternate Human-selected mutating L1');
check(buildPrompt.includes('global shell fallback is approval-gated'), 'Build prompt understands supervised shell semantics');
const planPrompt = read('prompts/plan.md');
check(planPrompt.includes('Build or NorthPace Loop ownership'), 'Plan prompt can hand implementation to either mutating L1');

const planningAgent = read('agents/planning-agent.md');
check(planningAgent.includes('surface that requirement to the owning L1') && planningAgent.includes('If the owner is NorthPace Loop'), 'planning-agent works under Plan or Loop parent');
const curator = read('agents/knowledge-curator.md');
check(curator.includes('owning mutating L1 (`build` or `northpace-loop`)'), 'knowledge-curator accepts Build or Loop ownership');

const preflight = read('scripts/check-project-overrides.mjs');
check(preflight.includes("'northpace-loop'"), 'project preflight protects northpace-loop from shadowing');

const readme = read('README.md');
check(readme.startsWith('⚠️ **重要：這是一套由北宮冰玉'), 'README keeps the personal-specialization warning first');
check(readme.includes('AGENT_ARCHITECTURE.md') && readme.includes('RUNTIME_COMPATIBILITY.md') && readme.includes('rules/orchestration.md'), 'README routes detailed truth to canonical documentation');
check(readme.includes('sanitized public projection') && readme.includes('Public safety boundary'), 'README keeps public projection and safety boundary clear');

const architecture = read('AGENT_ARCHITECTURE.md');
check(architecture.includes('NorthPace Loop direct L2 count = **36**'), 'architecture locks Loop direct L2 count');
check(architecture.includes('Build-only-via-AO'), 'architecture renames old globally AO-only wording');
check(architecture.includes('Supervised automation permission architecture'), 'architecture documents permission model');

const verify = read('commands/verify-config.md');
check(verify.includes('validate-governance.mjs') && verify.includes('validate-model-routing.mjs') && verify.includes('validate-desktop-contract.mjs'), '/verify-config delegates canonical invariants to deterministic validators');
check(verify.includes('Auto Mode') && verify.includes('NorthPace Loop'), '/verify-config retains runtime permission and Loop smoke coverage');
const health = read('commands/opencode-healthcheck.md');
check(health.includes('observed runtime health and drift') && health.includes('validate-desktop-contract.mjs'), '/opencode-healthcheck focuses on observed runtime evidence after static preflight');
check(health.includes('Auto Mode') && health.includes('NorthPace Loop'), '/opencode-healthcheck retains targeted permission and Loop diagnostics');

const workflow = read('.github/workflows/governance-validation.yml');
check(workflow.includes('- "README.md"'), 'governance workflow triggers on README changes');
const launcher = read('scripts/opencode2-northpalace.sh');
check(launcher.includes('validate-model-routing.mjs') && launcher.includes('validate-desktop-contract.mjs'), 'V2 launcher runs public deterministic validators');
check(launcher.includes('OPENCODE_CONFIG_DIR'), 'V2 launcher binds intended config root');

for (const message of passes) console.log(`[OK] ${message}`);
for (const message of failures) console.error(`[FAIL] ${message}`);
console.log(`\nNorthPalace Desktop contract validation: ${failures.length} FAIL, ${passes.length} OK.`);
process.exit(failures.length ? 1 : 0);
