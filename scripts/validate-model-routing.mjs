import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractFrontmatter } from './frontmatter.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const passes = [];
const check = (condition, message) => (condition ? passes : failures).push(message);
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

function stripJsonComments(text) {
  let out = '', inString = false, escaped = false, line = false, block = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i], next = text[i + 1];
    if (line) { if (ch === '\n') { line = false; out += ch; } continue; }
    if (block) { if (ch === '*' && next === '/') { block = false; i += 1; } continue; }
    if (inString) {
      out += ch;
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; out += ch; continue; }
    if (ch === '/' && next === '/') { line = true; i += 1; continue; }
    if (ch === '/' && next === '*') { block = true; i += 1; continue; }
    out += ch;
  }
  return out;
}
function parseJsonc(text, label) {
  try { return JSON.parse(stripJsonComments(text).replace(/,\s*([}\]])/g, '$1')); }
  catch (error) { failures.push(`${label} parse failed: ${error.message}`); return {}; }
}
function scalar(fm, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = fm.match(new RegExp(`^${escaped}:\\s*(.*?)\\s*$`, 'm'));
  if (!match) return undefined;
  return match[1].replace(/^['"]|['"]$/g, '');
}
function numberScalar(fm, key) {
  const value = scalar(fm, key);
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

const MUSE = 'opencode-go/muse-spark-1.2-contributor';
const MIMO = 'opencode-go/mimo-v2.5';
const HY3 = 'opencode-go/hy3';
const allowed = new Set([MUSE, MIMO, HY3]);
const museVariants = new Set(['minimal', 'low', 'medium', 'high', 'xhigh']);
const hy3Variants = new Set(['none', 'low', 'high']);

const expected = {
  'a11y-specialist': [MIMO, null, 0.15],
  'agent-orchestrator': [MUSE, 'xhigh', 0.15],
  'ai-ml-engineer': [MUSE, 'high', 0.20],
  'api-designer': [MUSE, 'high', 0.15],
  'architect': [MUSE, 'xhigh', 0.20],
  'ci-debugger': [MUSE, 'high', 0.10],
  'cli-engineer': [HY3, 'low', 0.90],
  'db-engineer': [MUSE, 'high', 0.15],
  'decision-analyst': [MUSE, 'xhigh', 0.15],
  'dependency-checker': [MUSE, 'low', 0.10],
  'devops-engineer': [MUSE, 'high', 0.15],
  'discussion-facilitator': [MUSE, 'medium', 0.35],
  'doc-generator': [MIMO, null, 0.20],
  'e2e-tester': [MIMO, null, 0.15],
  'electron-engineer': [MUSE, 'high', 0.20],
  'error-analyzer': [MUSE, 'high', 0.10],
  'frontend-engineer': [MUSE, 'high', 0.20],
  'handoff-drafter': [MUSE, 'minimal', 0.10],
  'knowledge-curator': [MIMO, null, 0.10],
  'multi-angle-researcher': [MUSE, 'high', 0.30],
  'planning-agent': [MUSE, 'xhigh', 0.20],
  'product-manager': [MUSE, 'medium', 0.20],
  'rag-engineer': [MUSE, 'high', 0.20],
  'refactorer': [MUSE, 'xhigh', 0.10],
  'release-manager': [HY3, 'low', 0.90],
  'researcher': [MIMO, null, 0.20],
  'review': [MUSE, 'xhigh', 0.10],
  'rust-engineer': [MUSE, 'high', 0.20],
  'screen-context-agent': [MIMO, null, 0.10],
  'security-auditor': [MUSE, 'high', 0.10],
  'tauri-engineer': [MUSE, 'high', 0.20],
  'test-runner': [HY3, 'none', 0.90],
  'test-writer': [HY3, 'low', 0.90],
  'ui-designer': [MIMO, null, 0.35],
};

const configText = read('opencode.jsonc');
const config = parseJsonc(configText, 'opencode.jsonc');
check(config.model === undefined, 'root primary model is unpinned');
check(config.small_model === MIMO, 'small_model is MiMo V2.5');
for (const primary of ['plan', 'build', 'northpace-loop']) {
  const item = config.agent?.[primary] || {};
  check(item.model === undefined && item.variant === undefined && item.temperature === undefined,
    `${primary} primary model/variant/temperature are unpinned`);
}
check(config.agent?.explore?.model === MIMO, 'inline explore routes to MiMo');
check(config.agent?.explore?.variant === undefined, 'inline explore has no variant');
check(config.agent?.general?.model === HY3, 'inline general routes to Hy3');
check(config.agent?.general?.variant === 'low', 'inline general uses Hy3 low');
check(config.agent?.general?.temperature === 0.9 && config.agent?.general?.top_p === 1.0,
  'inline general sampling is canonical');
check(!/ox-alpha-free|x-preview-f-free/i.test(configText), 'root config contains no legacy Free model route');

const files = fs.readdirSync(path.join(root, 'agents')).filter((x) => x.endsWith('.md')).sort();
const names = files.map((x) => x.replace(/\.md$/, ''));
const expectedNames = Object.keys(expected).sort();
check(JSON.stringify(names) === JSON.stringify(expectedNames), 'specialist identity set matches canonical 34-role map');

const counts = { [MUSE]: 0, [MIMO]: 0, [HY3]: 0 };
const usedMuse = new Set();
const usedHy3 = new Set();
for (const file of files) {
  const name = file.replace(/\.md$/, '');
  const fm = extractFrontmatter(read(`agents/${file}`));
  const model = scalar(fm, 'model');
  const variant = scalar(fm, 'variant');
  const temp = numberScalar(fm, 'temperature');
  const topP = numberScalar(fm, 'top_p');
  const [wantModel, wantVariant, wantTemp] = expected[name] || [];

  check(allowed.has(model), `${name} uses an approved three-model route`);
  check(!/-free|preview/i.test(String(model)), `${name} does not use a Free/preview route`);
  check(model === wantModel, `${name} model matches canonical routing`);
  check((variant ?? null) === wantVariant, `${name} variant matches canonical routing`);
  check(Object.is(temp, wantTemp), `${name} temperature matches canonical routing`);
  check(scalar(fm, 'mode') === 'subagent', `${name} remains subagent`);

  if (allowed.has(model)) counts[model] += 1;
  if (model === MUSE) {
    check(museVariants.has(variant), `${name} Muse variant is supported`);
    check(topP === undefined, `${name} Muse does not pin top_p`);
    usedMuse.add(variant);
  } else if (model === MIMO) {
    check(variant === undefined, `${name} MiMo has no variant`);
    check(topP === undefined, `${name} MiMo does not pin top_p`);
  } else if (model === HY3) {
    check(hy3Variants.has(variant), `${name} Hy3 variant is supported`);
    check(topP === 1.0, `${name} Hy3 top_p is 1.0`);
    usedHy3.add(variant);
  }
}

check(counts[MUSE] === 23, 'Muse specialist count is 23');
check(counts[MIMO] === 7, 'MiMo specialist count is 7');
check(counts[HY3] === 4, 'Hy3 specialist count is 4');
check([...['minimal','low','medium','high','xhigh']].every((v) => usedMuse.has(v)), 'Muse routing exercises all five canonical tiers');
check(usedHy3.has('none') && usedHy3.has('low'), 'Hy3 routing exercises canonical none|low tiers');

for (const message of passes) console.log(`[OK] ${message}`);
for (const message of failures) console.error(`[FAIL] ${message}`);
console.log(`\nNorthPalace no-Free model routing validation: ${failures.length} FAIL, ${passes.length} OK.`);
process.exit(failures.length ? 1 : 0);
