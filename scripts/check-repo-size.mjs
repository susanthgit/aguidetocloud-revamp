#!/usr/bin/env node
// Advisory repo-weight guard. Every tracked byte stays in .git history forever
// (and in every clone Cloudflare Pages makes), so flag growth before it is pushed.
// Warns on: any added/changed file > 1 MB, or any top-2-level folder gaining > 10 MB.
// Never blocks (exit 0) unless --strict is passed.
import { execFileSync } from 'node:child_process';
import { statSync, existsSync } from 'node:fs';

const FILE_LIMIT = 1 * 1024 * 1024;
const DIR_LIMIT = 10 * 1024 * 1024;
const strict = process.argv.includes('--strict');

const git = (...a) => {
  try { return execFileSync('git', a, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }); }
  catch { return ''; }
};

const names = new Set([
  ...git('diff', '--name-only', '--diff-filter=AM', 'origin/main', 'HEAD').split('\n'),
  ...git('diff', '--name-only', '--diff-filter=AM', 'HEAD').split('\n'),
].filter(Boolean));

const bigFiles = [];
const dirTotals = new Map();
for (const f of names) {
  if (!existsSync(f)) continue;
  const size = statSync(f).size;
  const dir = f.split('/').slice(0, 2).join('/');
  dirTotals.set(dir, (dirTotals.get(dir) || 0) + size);
  if (size > FILE_LIMIT) bigFiles.push([f, size]);
}

const mb = (n) => (n / 1024 / 1024).toFixed(1) + ' MB';
const warnings = [
  ...bigFiles.map(([f, s]) => `file ${f} is ${mb(s)} (> 1 MB): compress/resize, or host it outside git`),
  ...[...dirTotals].filter(([, s]) => s > DIR_LIMIT)
    .map(([d, s]) => `folder ${d}/ gains ${mb(s)} in this push (> 10 MB)`),
];

if (warnings.length) {
  console.log('Repo size warnings (advisory):');
  warnings.forEach((w) => console.log('  - ' + w));
  process.exit(strict ? 1 : 0);
}
console.log('Repo size OK: no new file > 1 MB, no folder > 10 MB.');
