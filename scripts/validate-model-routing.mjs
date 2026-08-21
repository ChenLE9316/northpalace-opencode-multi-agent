import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const passes = [];
const check = (ok, message) => (ok ? passes : failures).push(message);
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

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
function scalar(fm, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = fm.match(new RegExp(`^${escaped}:\\s*(.*?)\\s*$`, 'm'));
  return match?.[1]?.replace(/^['"]|['"]$/g, '');
}
function num(fm, key) {
  const v = scalar(fm, key);
  return v === undefined ? undefined : Number(v);
}

const NEMOTRON = 'opencode/nemotron-3.5-lightning-free';
const OX = 'opencode/x-preview-f-free';
const MUSE = 'opencode/muse-spark-1.2-contributor-free';
const MIMO = 'opencode/mimo-v2.5-free';
const allowedModels = new Set([NEMOTRON, OX, MUSE, MIMO]);

const expected = {
  'a11y-specialist': [NEMOTRON, 'medium', 0.15],
  'agent-orchestrator': [OX, 'high', 0.30],
  'ai-ml-engineer': [NEMOTRON, 'high', 0.20],
  'api-designer': [OX, 'high', 0.20],
  'architect': [OX, 'max', 0.30],
  'ci-debugger': [NEMOTRON, 'high', 0.10],
  'cli-engineer': [NEMOTRON, 'medium', 0.20],
  'db-engineer': [NEMOTRON, 'high', 0.15],
  'decision-analyst': [MUSE, 'xhigh', 0.20],
  'dependency-checker': [NEMOTRON, 'medium', 0.10],
  'devops-engineer': [NEMOTRON, 'high', 0.20],
  'discussion-facilitator': [MUSE, 'medium', 0.30],
  'doc-generator': [NEMOTRON, 'low', 0.20],
  'e2e-tester': [MIMO, null, 0.20],
  'electron-engineer': [NEMOTRON, 'high', 0.20],
  'error-analyzer': [NEMOTRON, 'high', 0.10],
  'frontend-engineer': [MIMO, null, 0.20],
  'handoff-drafter': [NEMOTRON, 'low', 0.10],
  'knowledge-curator': [NEMOTRON, 'low', 0.20],
  'multi-angle-researcher': [NEMOTRON, 'medium', 0.30],
  'planning-agent': [OX, 'high', 0.30],
  'product-manager': [OX, 'high', 0.30],
  'rag-engineer': [NEMOTRON, 'high', 0.20],
  'refactorer': [NEMOTRON, 'high', 0.10],
  'release-manager': [OX, 'high', 0.20],
  'researcher': [NEMOTRON, 'medium', 0.30],
  'review': [MUSE, 'xhigh', 0.10],
  'rust-engineer': [NEMOTRON, 'high', 0.15],
  'screen-context-agent': [MIMO, null, 0.30],
  'security-auditor': [MUSE, 'xhigh', 0.10],
  'tauri-engineer': [NEMOTRON, 'high', 0.15],
  'test-runner': [NEMOTRON, 'low', 0.10],
  'test-writer': [NEMOTRON, 'medium', 0.15],
  'ui-designer': [MIMO, null, 0.30],
};

const config = parseJsonc(read('opencode.jsonc'), 'opencode.jsonc');
check(config.model === OX, 'global primary model is Ox Alpha Free');
check(config.small_model === NEMOTRON, 'small_model is Nemotron 3.5 Lightning Free');
check(config.agent?.build?.mode === 'primary' && config.agent?.build?.reasoningEffort === 'high', 'Build inherits Ox Alpha at high');
check(config.agent?.plan?.mode === 'primary' && config.agent?.plan?.reasoningEffort === 'max', 'Plan inherits Ox Alpha at max');
check(config.agent?.['northpace-loop']?.mode === 'primary' && config.agent?.['northpace-loop']?.reasoningEffort === 'high', 'NorthPace Loop inherits Ox Alpha at high');
check(config.agent?.['northpace-loop']?.model === undefined, 'NorthPace Loop has no separate model override');
check(config.agent?.['northpace-loop']?.steps === undefined, 'NorthPace Loop has no repository steps ceiling');
check(config.agent?.plan?.steps === 100, 'Plan keeps 100 steps');
check(config.agent?.build?.steps === 200, 'Build keeps 200 steps');
check(config.agent?.explore?.model === NEMOTRON && config.agent?.explore?.reasoningEffort === 'low', 'inline explore uses Nemotron low');
check(config.agent?.general?.model === NEMOTRON && config.agent?.general?.reasoningEffort === 'medium', 'inline general uses Nemotron medium');

const files = fs.readdirSync(path.join(root, 'agents'), { withFileTypes: true })
  .filter((e) => e.isFile() && e.name.endsWith('.md')).map((e) => e.name).sort();
const names = files.map((f) => f.replace(/\.md$/, ''));
check(JSON.stringify(names) === JSON.stringify(Object.keys(expected).sort()), 'routing map covers exactly 34 specialist agents');
const counts = new Map([[NEMOTRON, 0], [OX, 0], [MUSE, 0], [MIMO, 0]]);

for (const file of files) {
  const name = file.replace(/\.md$/, '');
  const fm = extractFrontmatter(read(`agents/${file}`));
  const model = scalar(fm, 'model');
  const effort = scalar(fm, 'reasoningEffort');
  const temperature = num(fm, 'temperature');
  const [expectedModel, expectedEffort, expectedTemp] = expected[name] ?? [];

  check(allowedModels.has(model), `${name} uses an approved public Free route`);
  check(model === expectedModel, `${name} model route is exact`);
  check((effort ?? null) === expectedEffort, `${name} reasoning tier is ${expectedEffort ?? 'fixed/default'}`);
  check(Math.abs(temperature - expectedTemp) < 1e-9, `${name} temperature remains ${expectedTemp}`);
  if (model === MIMO) check(effort === undefined, `${name} MiMo route has no artificial reasoning tier`);
  counts.set(model, (counts.get(model) ?? 0) + 1);
}

check(counts.get(NEMOTRON) === 20, 'exactly 20 specialists use Nemotron 3.5 Lightning Free');
check(counts.get(OX) === 6, 'exactly 6 specialists use Ox Alpha Free');
check(counts.get(MUSE) === 4, 'exactly 4 specialists use Muse Spark 1.2 Contributor Free');
check(counts.get(MIMO) === 4, 'exactly 4 specialists use MiMo V2.5 Free');

for (const message of passes) console.log(`[OK] ${message}`);
for (const message of failures) console.error(`[FAIL] ${message}`);
console.log(`\nNorthPalace public Free model routing validation: ${failures.length} FAIL, ${passes.length} OK.`);
process.exit(failures.length ? 1 : 0);
