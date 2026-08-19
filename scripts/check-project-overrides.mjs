import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const configRoot = path.resolve(here, '..');
const projectIndex = process.argv.indexOf('--project');
const start = path.resolve(projectIndex >= 0 && process.argv[projectIndex + 1] ? process.argv[projectIndex + 1] : process.cwd());

const failures = [];
const warnings = [];
const passes = [];
const operatorID = 'northpalace-langfei-ni-token';

function check(condition, message) {
  if (condition) passes.push(message);
  else failures.push(message);
}
function warn(message) { warnings.push(message); }
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
function parseJsonc(file) {
  try {
    const text = fs.readFileSync(file, 'utf8');
    return JSON.parse(stripJsonComments(text).replace(/,\s*([}\]])/g, '$1'));
  } catch (error) {
    failures.push(`${label(file)} is not parseable JSON/JSONC: ${error.message}`);
    return {};
  }
}
function findBoundary(startDir) {
  let cur = startDir;
  for (;;) {
    if (fs.existsSync(path.join(cur, '.git'))) return cur;
    const parent = path.dirname(cur);
    if (parent === cur) return startDir;
    cur = parent;
  }
}
function ancestry(boundary, leaf) {
  const dirs = [];
  let cur = leaf;
  for (;;) {
    dirs.push(cur);
    if (cur === boundary) break;
    const parent = path.dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  return dirs.reverse();
}
function label(file) {
  const rel = path.relative(boundary, file);
  return rel && !rel.startsWith('..') ? rel.replaceAll('\\', '/') : path.basename(file);
}
function listMarkdownIDs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name.replace(/\.md$/, ''));
}

if (start === configRoot) {
  console.log('[OK] project override preflight skipped for the NorthPalace config repository itself.');
  process.exit(0);
}

const boundary = findBoundary(start);
const dirs = ancestry(boundary, start);
const canonicalSpecialists = fs.readdirSync(path.join(configRoot, 'agents'), { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
  .map((entry) => entry.name.replace(/\.md$/, ''));
const protectedAgentIDs = new Set(['build', 'plan', 'explore', 'general', ...canonicalSpecialists]);

const configFiles = [];
for (const dir of dirs) {
  for (const candidate of [
    path.join(dir, 'opencode.json'),
    path.join(dir, 'opencode.jsonc'),
    path.join(dir, '.opencode', 'opencode.json'),
    path.join(dir, '.opencode', 'opencode.jsonc'),
  ]) {
    if (fs.existsSync(candidate)) configFiles.push(candidate);
  }
}

for (const file of configFiles) {
  const cfg = parseJsonc(file);
  const name = label(file);

  check(cfg.permission === undefined && cfg.permissions === undefined,
    `${name} does not override global permission/permissions policy`);
  check(cfg.subagent_depth === undefined || cfg.subagent_depth === 2,
    `${name} does not weaken V1 subagent_depth=2`);
  check(cfg.experimental?.subagent_depth === undefined || cfg.experimental.subagent_depth === 2,
    `${name} does not weaken V2 experimental.subagent_depth=2`);
  check(cfg.default_agent === undefined || cfg.default_agent === 'build',
    `${name} does not replace Build as default L1`);
  check(cfg.autoupdate === undefined || cfg.autoupdate === false,
    `${name} does not re-enable runtime autoupdate`);
  check(cfg.share === undefined || cfg.share === 'disabled',
    `${name} does not weaken canonical share=disabled`);
  check(cfg.compaction === undefined,
    `${name} does not override NorthPalace compaction/checkpoint assumptions`);

  const agentMaps = [cfg.agent, cfg.agents].filter((value) => value && typeof value === 'object' && !Array.isArray(value));
  for (const map of agentMaps) {
    for (const id of Object.keys(map)) {
      check(!protectedAgentIDs.has(id) && !/-engineer$/.test(id),
        `${name} does not override a protected/reachable agent id: ${id}`);
    }
  }

  for (const map of [cfg.command, cfg.commands]) {
    if (map && typeof map === 'object' && !Array.isArray(map)) {
      check(!Object.hasOwn(map, operatorID), `${name} does not override operator command id`);
    }
  }

  if (cfg.mcp?.playwright?.enabled === true) warn(`${name} enables Playwright; three specialists intentionally gain evaluate capability.`);
  if (cfg.mcp?.['cua-driver']?.enabled === true) warn(`${name} enables CUA server; canonical model tool permission remains hard deny and must be verified effectively.`);
}

for (const dir of dirs) {
  const oc = path.join(dir, '.opencode');
  for (const agentsDir of [path.join(oc, 'agents'), path.join(oc, 'agent'), path.join(oc, 'modes'), path.join(oc, 'mode')]) {
    for (const id of listMarkdownIDs(agentsDir)) {
      check(!protectedAgentIDs.has(id) && !/-engineer$/.test(id),
        `${label(path.join(agentsDir, `${id}.md`))} does not shadow a protected/reachable agent id`);
    }
  }
  for (const commandsDir of [path.join(oc, 'commands'), path.join(oc, 'command')]) {
    if (fs.existsSync(path.join(commandsDir, `${operatorID}.md`))) {
      failures.push(`${label(path.join(commandsDir, `${operatorID}.md`))} shadows the operator-only command id`);
    }
  }
  for (const skillsDir of [path.join(oc, 'skills'), path.join(oc, 'skill')]) {
    if (fs.existsSync(path.join(skillsDir, operatorID, 'SKILL.md'))) {
      failures.push(`${label(path.join(skillsDir, operatorID, 'SKILL.md'))} shadows the operator-only skill id`);
    }
  }
  if (fs.existsSync(path.join(dir, 'AGENTS.md'))) {
    warn(`${label(path.join(dir, 'AGENTS.md'))} is active project instruction context; review it as trusted project policy, not ordinary evidence.`);
  }
}

if (configFiles.length === 0) passes.push('no project OpenCode JSON/JSONC overrides detected along the active path');

for (const message of passes) console.log(`[OK] ${message}`);
for (const message of warnings) console.warn(`[WARN] ${message}`);
for (const message of failures) console.error(`[FAIL] ${message}`);
console.log(`\nNorthPalace project override preflight: ${failures.length} FAIL, ${warnings.length} WARN, ${passes.length} OK.`);
process.exit(failures.length ? 1 : 0);
