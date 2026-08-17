#!/usr/bin/env node
/**
 * check-mobile-grid.test.mjs — bidirectional proof for the mobile grid guard.
 *
 * A guard nobody has tried to fool is a guard nobody knows works. Each fixture
 * below is a regression shape that must FAIL, or a legitimate shape that must
 * PASS. Run:  node scripts/check-mobile-grid.test.mjs
 *
 * Fixture origins: the 2026-06-19 regression itself, plus every false-pass /
 * false-fail raised in the 2026-08-17 Gate B review.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHECKER = path.join(__dirname, 'check-mobile-grid.mjs');
const RED = '\x1b[31m', GREEN = '\x1b[32m', DIM = '\x1b[2m', RESET = '\x1b[0m';

// Every fixture starts from the real base + shared mobile reset.
const BASE = `
.zt-reading { display: grid; grid-template-columns: 250px 1fr 280px; }
@media (max-width: 1024px) {
  .zt-reading { grid-template-columns: 1fr; }
}
`;

const CASES = [
  // ── must FAIL ──────────────────────────────────────────────────────────
  ['the original 2026-06-19 regression (late variant, no guard)', 'fail', `
    .zt-reading--tool-main { grid-template-columns: 250px minmax(0,1fr); }
  `],
  ['guard only reaches 768px, leaving 769-1024 broken', 'fail', `
    .zt-reading--tool-main { grid-template-columns: 250px 1fr; }
    @media (max-width: 768px) { .zt-reading.zt-reading--tool-main { grid-template-columns: 1fr; } }
  `],
  ['multi-track declared INSIDE a mobile media query', 'fail', `
    @media (max-width: 1024px) { .zt-reading--tool-main { grid-template-columns: 250px 1fr; } }
  `],
  ['guard requires a foreign class that is not on the wrapper', 'fail', `
    .zt-reading--tool-main { grid-template-columns: 250px 1fr; }
    @media (max-width: 1024px) { .foo.zt-reading--tool-main { grid-template-columns: 1fr; } }
  `],
  ['guard scoped by an ancestor selector', 'fail', `
    .zt-reading--tool-main { grid-template-columns: 250px 1fr; }
    @media (max-width: 1024px) { body.home .zt-reading.zt-reading--tool-main { grid-template-columns: 1fr; } }
  `],
  ['unresolvable var() track list', 'fail', `
    .zt-reading--tool-main { grid-template-columns: var(--cols, 250px 1fr); }
  `],
  ['repeat(auto-fill, ...) track list', 'fail', `
    .zt-reading--tool-main { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
  `],
  ['multi-track hidden inside @supports', 'fail', `
    @supports (display: grid) { .zt-reading--tool-main { grid-template-columns: 250px 1fr; } }
  `],
  ['guard hidden inside @supports (conditional, untrustworthy)', 'fail', `
    .zt-reading--tool-main { grid-template-columns: 250px 1fr; }
    @supports (display: grid) {
      @media (max-width: 1024px) { .zt-reading.zt-reading--tool-main { grid-template-columns: 1fr; } }
    }
  `],
  ['guard is print-only', 'fail', `
    .zt-reading--tool-main { grid-template-columns: 250px 1fr; }
    @media print and (max-width: 1024px) { .zt-reading.zt-reading--tool-main { grid-template-columns: 1fr; } }
  `],
  ['guard carries an extra media feature (orientation)', 'fail', `
    .zt-reading--tool-main { grid-template-columns: 250px 1fr; }
    @media (max-width: 1024px) and (orientation: portrait) { .zt-reading.zt-reading--tool-main { grid-template-columns: 1fr; } }
  `],
  ['late base .zt-reading rule beats the shared reset', 'fail', `
    .zt-reading--tool-main { grid-template-columns: 250px 1fr; }
    @media (max-width: 1024px) { .zt-reading.zt-reading--tool-main { grid-template-columns: 1fr; } }
    .zt-reading { grid-template-columns: 250px 1fr; }
  `],
  ['guard placed BEFORE the desktop rule at equal specificity', 'fail', `
    @media (max-width: 1024px) { .zt-reading--tool-main { grid-template-columns: 1fr; } }
    .zt-reading--tool-main { grid-template-columns: 250px 1fr; }
  `],
  ['desktop rule uses !important, guard does not', 'fail', `
    .zt-reading--tool-main { grid-template-columns: 250px 1fr !important; }
    @media (max-width: 1024px) { .zt-reading.zt-reading--tool-main { grid-template-columns: 1fr; } }
  `],

  // ── must PASS ──────────────────────────────────────────────────────────
  ['the shipped fix: compound guard at max-width 1024', 'pass', `
    .zt-reading--tool-main { grid-template-columns: 250px minmax(0,1fr); }
    @media (max-width: 1024px) { .zt-reading.zt-reading--tool-main { grid-template-columns: minmax(0, 1fr); } }
  `],
  ['equal-specificity guard that comes later in source order', 'pass', `
    .zt-reading--tool-main { grid-template-columns: 250px 1fr; }
    @media (max-width: 1024px) { .zt-reading--tool-main { grid-template-columns: 1fr; } }
  `],
  ['two guards tiling 0-768 and 769-1024', 'pass', `
    .zt-reading--tool-main { grid-template-columns: 250px 1fr; }
    @media (max-width: 768px) { .zt-reading.zt-reading--tool-main { grid-template-columns: 1fr; } }
    @media (min-width: 769px) and (max-width: 1024px) { .zt-reading.zt-reading--tool-main { grid-template-columns: 1fr; } }
  `],
  ['repeat(1, 1fr) is a single track, not two', 'pass', `
    .zt-reading--tool-main { grid-template-columns: 250px 1fr; }
    @media (max-width: 1024px) { .zt-reading.zt-reading--tool-main { grid-template-columns: repeat(1, 1fr); } }
  `],
  ['line-named single track', 'pass', `
    .zt-reading--tool-main { grid-template-columns: 250px 1fr; }
    @media (max-width: 1024px) { .zt-reading.zt-reading--tool-main { grid-template-columns: [full-start] 1fr [full-end]; } }
  `],
  ['multi-track confined to desktop by min-width', 'pass', `
    @media (min-width: 1025px) { .zt-reading--tool-main { grid-template-columns: 250px 1fr; } }
  `],
  ['guard wins by !important despite lower specificity', 'pass', `
    .zt-reading--tool-main { grid-template-columns: 250px 1fr; }
    @media (max-width: 1024px) { .zt-reading--tool-main { grid-template-columns: 1fr !important; } }
  `],
  ['multi-track that is print-only', 'pass', `
    @media print { .zt-reading--tool-main { grid-template-columns: 250px 1fr; } }
  `],
  ['unrelated .zt-reading-content grid is out of scope', 'pass', `
    .zt-reading-content { grid-template-columns: 250px 1fr; }
  `],
];

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mobilegrid-'));
let passed = 0;
const failures = [];

for (const [name, expect, css] of CASES) {
  const file = path.join(tmp, `${passed}-${Math.random().toString(36).slice(2)}.css`);
  fs.writeFileSync(file, BASE + css, 'utf8');
  let code = 0;
  try {
    execFileSync(process.execPath, [CHECKER, '--css', file], { stdio: 'pipe' });
  } catch (e) { code = e.status ?? 1; }
  const got = code === 0 ? 'pass' : 'fail';
  if (got === expect) { passed++; console.log(`${GREEN}✓${RESET} ${DIM}[must ${expect}]${RESET} ${name}`); }
  else { failures.push(`[expected ${expect}, got ${got}] ${name}`); console.log(`${RED}✗ [must ${expect}, got ${got}] ${name}${RESET}`); }
}

fs.rmSync(tmp, { recursive: true, force: true });

console.log('');
if (failures.length) {
  console.error(`${RED}❌ ${failures.length}/${CASES.length} guard self-tests failed${RESET}`);
  failures.forEach(f => console.error(`   ${f}`));
  process.exit(1);
}
console.log(`${GREEN}✓ ${passed}/${CASES.length} guard self-tests passed${RESET}\n`);
