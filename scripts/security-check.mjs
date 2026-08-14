import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { extname } from 'node:path';

const files = execFileSync('git', ['ls-files', '-co', '--exclude-standard'], { encoding: 'utf8' }).split(/\r?\n/).filter(Boolean);
const textExtensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs', '.json', '.md', '.yml', '.yaml', '.prisma', '.sql', '.bat', '.ps1', '.example']);
const findings = [];
const rules = [
  ['private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['GitHub token', /\bgh[pousr]_[A-Za-z0-9_]{30,}\b/],
  ['hardcoded bearer', /Authorization\s*[:=]\s*["'`]Bearer\s+[A-Za-z0-9._-]{24,}/i],
  ['sensitive localStorage write', /localStorage\.setItem\([^\n]*(?:token|secret|private[_-]?key|password)/i],
];

for (const file of files) {
  if (file === 'scripts/security-check.mjs') continue;
  if (file.startsWith('Skills/')) continue;
  if (file === '.env.example' || file.endsWith('/.env.example')) continue;
  if (!textExtensions.has(extname(file)) || statSync(file).size > 1_000_000) continue;
  const content = readFileSync(file, 'utf8');
  for (const [name, pattern] of rules) if (pattern.test(content)) findings.push(`${file}: ${name}`);
}

if (findings.length) {
  process.stderr.write(`Security check failed:\n${findings.map((finding) => `- ${finding}`).join('\n')}\n`);
  process.exit(1);
}
process.stdout.write(`Security check passed (${files.length} files considered).\n`);
