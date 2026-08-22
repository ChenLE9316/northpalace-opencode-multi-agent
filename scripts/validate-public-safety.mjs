import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const passes = [];
const check = (condition, message) => (condition ? passes : failures).push(message);

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

function readJsonc(rel) {
  const text = fs.readFileSync(path.join(root, rel), 'utf8');
  return JSON.parse(stripJsonComments(text).replace(/,\s*([}\]])/g, '$1'));
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const config = readJsonc('opencode.jsonc');
const readPolicy = config.permission?.read || {};
const editPolicy = config.permission?.edit || {};
const sensitivePaths = [
  '.env','**/.env','~/.local/share/opencode/auth.json','**/.local/share/opencode/auth.json',
  '.ssh/**','**/.ssh/**','.npmrc','**/.npmrc','.git-credentials','**/.git-credentials',
  '.aws/**','**/.aws/**','.azure/**','**/.azure/**','.config/gcloud/**','**/.config/gcloud/**',
  '.config/gh/**','**/.config/gh/**','.kube/**','**/.kube/**','.docker/config.json','**/.docker/config.json',
  '.netrc','**/.netrc','*.pem','**/*.pem','*.key','**/*.key','credentials.json','**/credentials.json',
  'service-account*.json','**/service-account*.json'
];

check(readPolicy['*'] === 'allow', 'native read default remains explicit allow');
check(editPolicy['*'] === 'allow', 'native edit default remains explicit allow');
for (const rel of sensitivePaths) {
  check(readPolicy[rel] === 'deny', `sensitive native read is denied: ${rel}`);
  check(editPolicy[rel] === 'deny', `sensitive native edit is denied: ${rel}`);
}
check(readPolicy['.env.example'] === 'allow' && readPolicy['**/.env.example'] === 'allow', '.env.example remains readable');
check(editPolicy['.env.example'] === 'allow' && editPolicy['**/.env.example'] === 'allow', '.env.example remains editable');
check(config.share === 'disabled', 'OpenCode share surface is disabled by default');

const detectors = [
  ['Windows user home', /[A-Za-z]:\\Users\\(?!<|%)[^\\\r\n]+\\/g],
  ['macOS user home', /\/Users\/(?!<)[A-Za-z0-9._-]+\//g],
  ['Linux user home', /\/home\/(?!runner\/|<)[A-Za-z0-9._-]+\//g],
  ['GitHub classic token', /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g],
  ['OpenAI-style secret token', /\bsk-[A-Za-z0-9_-]{20,}\b/g],
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/g],
  ['private key block', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
];

const allowedExtensions = /\.(md|json|jsonc|mjs|js|ts|tsx|yml|yaml|toml|sh|ps1|txt|lock)$/i;
for (const full of walk(root)) {
  if (!allowedExtensions.test(full)) continue;
  const rel = path.relative(root, full).replaceAll('\\', '/');
  const text = fs.readFileSync(full, 'utf8');
  for (const [label, re] of detectors) {
    re.lastIndex = 0;
    const match = re.exec(text);
    check(!match, `${rel} contains no ${label}`);
  }
}

for (const message of passes) console.log(`[OK] ${message}`);
for (const message of failures) console.error(`[FAIL] ${message}`);
console.log(`\nNorthPalace public-safety validation: ${failures.length} FAIL, ${passes.length} OK.`);
process.exit(failures.length ? 1 : 0);
