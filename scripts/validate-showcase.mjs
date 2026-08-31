import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const pass = (ok, message) => ok ? console.log(`[OK] ${message}`) : failures.push(message);
const exists = rel => fs.existsSync(path.join(root, rel));

const requiredAgents = [
  'planner','research-lead','delivery-lead','review-lead',
  'architect','fullstack-engineer','ai-product-engineer','domain-specialist',
  'creative-producer','risk-specialist','verifier',
  'atomic-code','atomic-research','atomic-verification'
];

for (const agent of requiredAgents) {
  pass(exists(`.opencode/agents/${agent}.md`), `agent exists: ${agent}`);
}

for (const rel of [
  'README.md','AGENTS.md','SECURITY.md','PUBLIC_RELEASE_POLICY.md','opencode.jsonc',
  'governance/contracts/task-envelope.schema.json',
  'governance/contracts/result-envelope.schema.json',
  'governance/contracts/evidence.schema.json',
  'governance/policies/runtime-boundary.md',
  'governance/policies/topology.md',
  'governance/policies/risk-and-hitl.md',
  'docs/architecture/overview.md',
  'docs/architecture/agent-topology.md',
  'docs/architecture/public-projection-boundary.md'
]) pass(exists(rel), `required public surface exists: ${rel}`);

for (const rel of [
  'governance/backlog.md','governance/traceability','docs/report',
  'docs/design-reference','runtime-evidence','sessions','backups'
]) pass(!exists(rel), `private/operational surface omitted: ${rel}`);

const configText = fs.readFileSync(path.join(root, 'opencode.jsonc'), 'utf8');
pass(!/"model"\s*:/.test(configText), 'public config does not pin a private/provider model');
pass(!/"plugin"\s*:/.test(configText), 'public config does not publish plugin configuration');
pass(!/"mcp"\s*:/.test(configText), 'public config does not publish MCP configuration');
pass(/"share"\s*:\s*"disabled"/.test(configText), 'public config disables sharing by default');

const leafAgents = ['atomic-code','atomic-research','atomic-verification'];
for (const agent of leafAgents) {
  const text = fs.readFileSync(path.join(root, `.opencode/agents/${agent}.md`), 'utf8');
  pass(/must not delegate|must not call `task`|no delegation/i.test(text), `${agent} is explicitly a leaf`);
}

for (const message of failures) console.error(`[FAIL] ${message}`);
console.log(`\nNorthPalace public showcase validation: ${failures.length} FAIL.`);
process.exit(failures.length ? 1 : 0);
