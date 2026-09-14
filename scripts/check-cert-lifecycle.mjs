#!/usr/bin/env node
// Cert lifecycle guardrail.
// Fails when a cert page claims to be active while still carrying present-tense
// beta or beta-discount language, or when a page's status disagrees with latest.json.
// Historical phrasing ("went into beta", "after the beta") is deliberately allowed.
//
// KNOWN LIMITS — stated so nobody mistakes a pass for full coverage:
//  1. Check 3 only requires NON-active pages to exist in latest.json. A page marked
//     `active` that is missing from latest.json is invisible here, which is exactly
//     how AB-650 shipped mislabelled. ~13 active pages are currently in that blind
//     spot (AB-100/250/410/730/731/900, GH-*). Detecting those needs the upstream
//     truth, not local data, so it belongs in cert-lifecycle-probe.mjs, not here.
//  2. This file checks INTERNAL CONSISTENCY only — page copy vs latest.json. It can
//     never tell you the status is *correct*, only that our two stores agree.
//  3. claimIsAboutOtherExam resolves attribution by nearest preceding exam code plus
//     an explicit self-reference test. Pronoun self-reference still escapes:
//     "Unlike AI-102, it is currently in beta" reads as a claim about AI-102.
//     Deliberately biased toward false negatives — a noisy gate teaches --no-verify.
//  4. Check 4 reads data/all_certs.toml, but only claims that name an exam code
//     outright ("Microsoft's beta cert AB-250") or a beta-priced exam_cost. A
//     tagline that implies beta without naming a code is not detected.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PAGES_DIR = join(ROOT, 'content', 'cert-tracker');
const DATA_FILE = join(ROOT, 'static', 'data', 'cert-tracker', 'latest.json');
const REGISTRY_FILE = join(ROOT, 'data', 'all_certs.toml');

// Present-tense claims only — these are false once an exam is GA.
const STALE_CLAIMS = [
  { re: /\bis (?:currently )?(?:in|a) beta\b/i, msg: 'says the exam is in beta' },
  { re: /\bstill in beta\b/i, msg: 'says the exam is still in beta' },
  { re: /\bthis beta exam\b/i, msg: 'calls it "this beta exam"' },
  { re: /\bbeta exam\b(?!\s*(?:was|had))/i, msg: 'calls it a beta exam' },
  { re: /\bbeta cert(?:ification)?\b(?!\s*(?:was|had))/i, msg: 'calls it a beta cert' },
  { re: /\bbeta sittings are\b/i, msg: 'describes current beta sittings' },
  { re: /\bbeta seats are\b/i, msg: 'describes current beta seats' },
  { re: /\bcert-status-beta\b/, msg: 'has a hand-written beta status banner' },
];

// False on EVERY page regardless of status. Microsoft publishes no standing
// beta-discount percentage, so a specific figure is an invented claim.
const ALWAYS_FALSE_CLAIMS = [
  { re: /\b\d{1,2}\s*%\s*(?:off|discount)/i, msg: 'quotes a specific beta discount percentage' },
  { re: /beta exams are typically offered at/i, msg: 'claims a standing beta discount' },
];

function frontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return m ? m[1] : '';
}
function field(fm, name) {
  const m = fm.match(new RegExp(`^${name}:\\s*"?([^"\\n]*)"?\\s*$`, 'm'));
  return m ? m[1].trim() : null;
}

// A line is exempt when it is an FAQ question (reader phrasing, not a site claim)
// or when the beta mention is explicitly negated or set in the past.
const EXEMPT = [
  /^\s*-\s*question:/i,
  /\(it isn'?t\)|\bit isn'?t\b|\bis not (?:in|a) beta\b|\bno longer in beta\b/i,
  /\bhas since gone\b|\bnow generally available\b|\bwent into beta\b|\bentered beta\b|\bduring the beta\b|\bafter (?:the|its) beta\b|\bwas cancelled\b/i,
];
const isExempt = line => EXEMPT.some(re => re.test(line));

// A beta claim that is clearly about a *different* exam is not this page's problem.
// Attribute each claim to the nearest exam code appearing before it on the line, so
// "AB-410 is GA, but its sibling AB-620 is still in beta" is correctly exempt.
// The exception is an explicit self-reference between that code and the claim
// ("Migrating from AI-102? This exam is currently in beta") — there the subject has
// switched back to this page's own exam, so the claim does count against us.
const CODE_SRC = '\\b(?:AZ|AI|DP|SC|MS|MB|PL|AB|GH|MD|MO)-\\d{3}\\b';
const SELF_REF = /\bthis (?:exam|cert|certification|one)\b/i;
function claimIsAboutOtherExam(line, ownCode, re) {
  const hit = line.match(re);
  if (!hit || hit.index === undefined) return false;
  let nearest = null;
  for (const m of line.matchAll(new RegExp(CODE_SRC, 'gi'))) {
    if (m.index < hit.index) nearest = m;
  }
  if (!nearest || nearest[0].toUpperCase() === ownCode) return false;
  if (SELF_REF.test(line.slice(nearest.index + nearest[0].length, hit.index))) return false;
  return true;
}

const failures = [];

// --- Check 1: active pages must not carry present-tense beta/discount claims ---
const files = readdirSync(PAGES_DIR).filter(f => f.endsWith('.md') && f !== '_index.md');
const pageStatus = new Map();

for (const file of files) {
  const raw = readFileSync(join(PAGES_DIR, file), 'utf8');
  const fm = frontmatter(raw);
  const status = field(fm, 'exam_status') || 'active';
  const code = (field(fm, 'exam_code') || basename(file, '.md')).toUpperCase();
  pageStatus.set(code, status);

  const lines = raw.split(/\r?\n/);

  // Price-figure claims are false on every page, beta or not.
  for (const { re, msg } of ALWAYS_FALSE_CLAIMS) {
    const idx = lines.findIndex(l => re.test(l) && !isExempt(l) && !claimIsAboutOtherExam(l, code, re));
    if (idx !== -1) {
      failures.push(`${file}:${idx + 1}  ${msg}\n      → ${lines[idx].trim().slice(0, 150)}`);
    }
  }

  if (status !== 'active') continue;

  for (const { re, msg } of STALE_CLAIMS) {
    const idx = lines.findIndex(l => re.test(l) && !isExempt(l) && !claimIsAboutOtherExam(l, code, re));
    if (idx !== -1) {
      failures.push(`${file}:${idx + 1}  status=active but ${msg}\n      → ${lines[idx].trim().slice(0, 150)}`);
    }
  }
}

// --- Check 2: page status must agree with the data the index renders from ---
const MS_CODE = /^(?:AZ|AI|DP|SC|MS|MB|PL|AB|GH|MD|MO)-\d{3}$/;
if (existsSync(DATA_FILE)) {
  const data = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
  const inData = new Set();
  for (const exam of data.exams || []) {
    const code = String(exam.code).toUpperCase();
    inData.add(code);
    const ps = pageStatus.get(code);
    if (!ps) continue;
    if (ps !== exam.status) {
      failures.push(`${code}  status mismatch: page says "${ps}" but latest.json says "${exam.status}"`);
    }
  }

  // --- Check 3: the reverse direction, which is how the original bug shipped ---
  // The index merges latest.json over all_certs.toml, and all_certs cannot express
  // "beta" (its schema allows live|coming-soon|planned|retired). So a page with a
  // non-active status that is MISSING from latest.json silently renders as active
  // on the index while the detail page shows a beta/retired banner.
  for (const [code, status] of pageStatus) {
    if (status === 'active' || !MS_CODE.test(code)) continue;
    if (!inData.has(code)) {
      failures.push(`${code}  page says "${status}" but the exam is missing from latest.json — the index will render it as active`);
    }
  }
} else {
  failures.push(`missing data file: ${DATA_FILE}`);
}

// --- Check 4: the registry the index renders from must not describe a non-beta
// exam as beta. Pages and latest.json were both corrected for AB-250 while
// data/all_certs.toml still called it "Microsoft's beta cert AB-250" and priced
// it at the beta rate, so the index kept publishing the stale claim. Only claims
// that name a code outright are checked, which makes attribution unambiguous.
if (existsSync(REGISTRY_FILE)) {
  const betaCodes = new Set();
  for (const [code, status] of pageStatus) if (status === 'beta') betaCodes.add(code);
  if (existsSync(DATA_FILE)) {
    for (const exam of JSON.parse(readFileSync(DATA_FILE, 'utf8')).exams || []) {
      if (exam.status === 'beta') betaCodes.add(String(exam.code).toUpperCase());
    }
  }

  const NAMED_BETA = /\bbeta (?:cert(?:ification)?|exam) ((?:AZ|AI|DP|SC|MS|MB|PL|AB|GH|MD|MO)-\d{3})\b/gi;
  const lines = readFileSync(REGISTRY_FILE, 'utf8').split(/\r?\n/);
  const seen = new Set();
  let blockCode = null;

  lines.forEach((line, i) => {
    const codeDecl = line.match(/^\s*code\s*=\s*"([^"]+)"/);
    if (codeDecl) blockCode = codeDecl[1].toUpperCase();

    for (const m of line.matchAll(NAMED_BETA)) {
      const code = m[1].toUpperCase();
      if (betaCodes.has(code)) continue;
      const key = `named:${code}`;
      if (seen.has(key)) continue;
      seen.add(key);
      failures.push(`${code}  data/all_certs.toml:${i + 1} calls it a beta exam, but it is not beta`);
    }

    if (/^\s*exam_cost\s*=\s*"\s*Beta\b/i.test(line) && blockCode && !betaCodes.has(blockCode)) {
      const key = `cost:${blockCode}`;
      if (seen.has(key)) return;
      seen.add(key);
      failures.push(`${blockCode}  data/all_certs.toml:${i + 1} still quotes beta pricing, but it is not beta`);
    }
  });
} else {
  failures.push(`missing registry file: ${REGISTRY_FILE}`);
}

if (failures.length) {
  console.error(`\n[cert-lifecycle] ${failures.length} problem(s) found:\n`);
  for (const f of failures) console.error('  ✗ ' + f);
  console.error('\nFix the page copy or the status data before pushing.\n');
  process.exit(1);
}
console.log(`[cert-lifecycle] OK — ${files.length} cert pages consistent with latest.json and all_certs.toml`);
