import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const passes = [];
const warnings = [];
const requireHistory = process.argv.includes('--require-history');
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

function git(args) {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
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

const placeholderSecret = /(?:example|sample|dummy|placeholder|changeme|redacted|replace[_ -]?me|your[_ -]?(?:token|key|secret|password)|<[^>]+>|\$\{[^}]+\})/i;
const allowedEmail = /@(example\.(?:com|org|net)|users\.noreply\.github\.com)$/i;

const detectors = [
  { label: 'Windows user home', re: /[A-Za-z]:\\Users\\(?!<|%)[^\\\r\n]+\\/g },
  { label: 'macOS user home', re: /\/Users\/(?!<)[A-Za-z0-9._-]+\//g },
  { label: 'Linux user home', re: /\/home\/(?!runner\/|<)[A-Za-z0-9._-]+\//g },
  { label: 'Windows UNC machine/share path', re: /\\\\[A-Za-z0-9._-]+\\[A-Za-z0-9$._-]+\\/g },
  { label: 'Windows machine hostname', re: /\b(?:DESKTOP|LAPTOP)-[A-Z0-9]{5,}\b/gi },

  { label: 'email address', re: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,63}\b/gi, allow: value => allowedEmail.test(value) },
  { label: 'international phone-like number', re: /\+\d{1,3}[ .-]?(?:\(?\d{1,4}\)?[ .-]?){2,4}\d{2,4}\b/g },
  { label: '10-digit mobile-like number', re: /\b09\d{8}\b/g },

  { label: 'private IPv4 10/8', re: /\b10(?:\.\d{1,3}){3}\b/g },
  { label: 'private IPv4 172.16/12', re: /\b172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}\b/g },
  { label: 'private IPv4 192.168/16', re: /\b192\.168(?:\.\d{1,3}){2}\b/g },
  { label: 'private/local hostname', re: /\b(?:[A-Za-z0-9-]+\.)+(?:local|lan|internal)\b/gi, allow: value => /^(?:example|test)\./i.test(value) },

  { label: 'GitHub classic token', re: /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g },
  { label: 'GitHub fine-grained token', re: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/g },
  { label: 'OpenAI/Anthropic-style secret token', re: /\bsk-(?:ant-)?[A-Za-z0-9_-]{20,}\b/g },
  { label: 'AWS access key', re: /\bAKIA[0-9A-Z]{16}\b/g },
  { label: 'Google API key', re: /\bAIza[0-9A-Za-z_-]{35}\b/g },
  { label: 'Slack token', re: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/g },
  { label: 'npm access token', re: /\bnpm_[A-Za-z0-9]{30,}\b/g },
  { label: 'GitLab personal access token', re: /\bglpat-[A-Za-z0-9_-]{20,}\b/g },
  { label: 'Hugging Face token', re: /\bhf_[A-Za-z0-9]{20,}\b/g },
  { label: 'Stripe live secret', re: /\bsk_live_[A-Za-z0-9]{16,}\b/g },
  { label: 'JWT-like credential', re: /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g },
  { label: 'Bearer credential', re: /\bBearer\s+[A-Za-z0-9._~+\/-]{20,}={0,2}\b/g },
  { label: 'credential embedded in URL', re: /https?:\/\/[A-Za-z0-9._~%+-]+:[A-Za-z0-9._~%+\/-]+@[A-Za-z0-9.-]+/gi },
  { label: 'private key block', re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
  {
    label: 'literal secret assignment',
    re: /\b(?:api[_-]?key|access[_-]?token|auth[_-]?token|password|passwd|client[_-]?secret|secret)\b\s*[:=]\s*["'`]([^"'`\r\n]{16,})["'`]/gi,
    allow: (value, match) => placeholderSecret.test(match[1] || value),
  },
  { label: 'suspicious personal/private repository slug', re: /\b[A-Za-z0-9][A-Za-z0-9._-]{4,}(?:-to-me|-private|-personal)(?:\.git)?\b/gi },
];

function scanText(source, text) {
  if (text.includes('\0')) return;
  for (const detector of detectors) {
    detector.re.lastIndex = 0;
    let match;
    let clean = true;
    while ((match = detector.re.exec(text)) !== null) {
      const value = match[0];
      if (detector.allow?.(value, match, source)) continue;
      clean = false;
      break;
    }
    check(clean, `${source} contains no ${detector.label}`);
  }
}

const allowedExtensions = /\.(md|json|jsonc|mjs|js|ts|tsx|yml|yaml|toml|sh|ps1|txt|lock)$/i;
for (const full of walk(root)) {
  if (!allowedExtensions.test(full)) continue;
  const rel = path.relative(root, full).replaceAll('\\', '/');
  const text = fs.readFileSync(full, 'utf8');
  scanText(rel, text);
}

const gitDir = path.join(root, '.git');
if (fs.existsSync(gitDir)) {
  let shallow = true;
  try {
    shallow = git(['rev-parse', '--is-shallow-repository']).trim() === 'true';
  } catch {
    check(!requireHistory, 'Git history is readable when --require-history is requested');
  }

  if (shallow) {
    if (requireHistory) failures.push('full Git history is required but checkout is shallow');
    else warnings.push('Git checkout is shallow; historical deleted-content scan was skipped');
  } else {
    try {
      const history = git([
        'log', '--all', '--format=commit %H', '-p', '--no-ext-diff', '--text', '--', '.',
      ]);
      scanText('Git history patches (all reachable refs)', history);
      passes.push('full Git history patches were scanned for deleted/historical sensitive content');
    } catch {
      check(false, 'full Git history patches can be scanned');
    }
  }
} else if (requireHistory) {
  failures.push('full Git history is required but .git is unavailable');
} else {
  warnings.push('.git is unavailable; historical deleted-content scan was skipped');
}

for (const message of passes) console.log(`[OK] ${message}`);
for (const message of warnings) console.warn(`[WARN] ${message}`);
for (const message of failures) console.error(`[FAIL] ${message}`);
console.log(`\nNorthPalace public-safety validation: ${failures.length} FAIL, ${passes.length} OK, ${warnings.length} WARN.`);
process.exit(failures.length ? 1 : 0);
