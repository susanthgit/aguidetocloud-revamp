#!/usr/bin/env node
'use strict';

/**
 * migrate-cert-descriptions.js
 *
 * Repairs cert-tracker meta descriptions that advertise a PAID practice exam
 * as "free". Study guides are free forever; practice exams give 20 questions
 * free and then cost US$9 for a year.
 *
 * WHY THIS IS NOT A REGENERATION
 * ------------------------------
 * scripts/sync-cert-data.js deliberately refuses to touch existing pages
 * ("Never overwrite existing files"), and 54 cert pages carry `manual: true`
 * with hand-written FAQs and bespoke bodies. Regenerating would destroy them.
 * This script therefore rewrites exactly ONE LINE of front matter and leaves
 * the body byte-for-byte identical — asserted by SHA-256, not by inspection.
 *
 * Usage:
 *   node scripts/migrate-cert-descriptions.js            # dry run (default)
 *   node scripts/migrate-cert-descriptions.js --apply    # write changes
 *   node scripts/migrate-cert-descriptions.js --apply --limit 10
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const TOML = require('@iarna/toml');
const {
  buildCertDescription,
  claimsFreePracticeExam,
  MAX_DESCRIPTION,
} = require('./lib/cert-description');

const REPO = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(REPO, 'content', 'cert-tracker');
const CERTS_TOML = path.join(REPO, 'data', 'all_certs.toml');

const APPLY = process.argv.includes('--apply');
const limitIdx = process.argv.indexOf('--limit');
const LIMIT = limitIdx !== -1 ? parseInt(process.argv[limitIdx + 1], 10) : Infinity;

const sha = (s) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');

function loadCerts() {
  const data = TOML.parse(fs.readFileSync(CERTS_TOML, 'utf8'));
  const map = data.cert_map || {};
  if (!Object.keys(map).length) throw new Error('cert_map is empty — refusing to run');
  return map;
}

/** Split a file into [frontMatter, body] without normalising line endings. */
function splitFrontMatter(raw) {
  if (!raw.startsWith('---')) return null;
  // Find the closing delimiter of the front matter block.
  const close = raw.indexOf('\n---', 3);
  if (close === -1) return null;
  const afterDelim = raw.indexOf('\n', close + 1);
  if (afterDelim === -1) return null;
  return [raw.slice(0, afterDelim + 1), raw.slice(afterDelim + 1)];
}

const DESC_RE = /^description:[ \t]*"((?:[^"\\]|\\.)*)"[ \t]*$/gm;

function main() {
  const certs = loadCerts();
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md') && f !== '_index.md');

  const changed = [];
  const skipped = [];
  const errors = [];
  let overLength = 0;

  for (const file of files) {
    if (changed.length >= LIMIT) break;
    const full = path.join(CONTENT_DIR, file);
    const raw = fs.readFileSync(full, 'utf8');
    const slug = file.replace(/\.md$/, '');

    const parts = splitFrontMatter(raw);
    if (!parts) { errors.push(`${file}: no front matter`); continue; }
    const [fm, body] = parts;

    DESC_RE.lastIndex = 0;
    const matches = [...fm.matchAll(DESC_RE)];
    if (matches.length === 0) { skipped.push(`${file}: no quoted description line`); continue; }
    if (matches.length > 1) { errors.push(`${file}: ${matches.length} description lines`); continue; }

    const current = matches[0][1];
    const cert = certs[slug];

    // Only touch pages that actually make the false claim, judged against the
    // real price. With no cert record the check runs conservatively (assumes
    // the bank is paid) rather than guessing a price.
    if (!claimsFreePracticeExam(current, cert ? { pricePractice: cert.price_practice } : undefined)) {
      skipped.push(`${file}: already truthful`);
      continue;
    }

    // Reaching here means the page DOES make a false claim, so a missing cert
    // record is a genuine blocker: we cannot state a price we do not know.
    if (!cert) { errors.push(`${file}: claims a free exam but slug not in cert_map`); continue; }

    const next = buildCertDescription(cert, slug.toUpperCase());
    if (next.length > MAX_DESCRIPTION) overLength++;
    if (next === current) { skipped.push(`${file}: unchanged`); continue; }

    const newFm = fm.replace(DESC_RE, () => `description: "${next.replace(/"/g, '\\"')}"`);
    const newRaw = newFm + body;

    // Hard assertion: the body must be untouched.
    const bodyAfter = splitFrontMatter(newRaw)[1];
    if (sha(bodyAfter) !== sha(body)) {
      errors.push(`${file}: BODY HASH CHANGED — aborting this file`);
      continue;
    }

    changed.push({ file, manual: /^manual:\s*true/m.test(fm), current, next, len: next.length });
    if (APPLY) fs.writeFileSync(full, newRaw, 'utf8');
  }

  console.log(`\n${APPLY ? 'APPLIED' : 'DRY RUN'} — cert description migration\n`);
  console.log(`  scanned            : ${files.length}`);
  console.log(`  would change       : ${changed.length}`);
  console.log(`  skipped (truthful) : ${skipped.length}`);
  console.log(`  errors             : ${errors.length}`);
  console.log(`  over ${MAX_DESCRIPTION} chars      : ${overLength}`);

  const manualHit = changed.filter((c) => c.manual);
  if (manualHit.length) {
    console.log(`\n  NOTE: ${manualHit.length} page(s) carry manual: true — description line still corrected:`);
    manualHit.forEach((c) => console.log(`    - ${c.file}`));
  }

  if (errors.length) {
    console.log('\n  ERRORS:');
    errors.slice(0, 20).forEach((e) => console.log(`    ! ${e}`));
  }

  console.log('\n  Sample of changes:');
  changed.slice(0, 4).forEach((c) => {
    console.log(`\n    ${c.file}  (${c.len} chars)`);
    console.log(`      -  ${c.current}`);
    console.log(`      +  ${c.next}`);
  });

  if (errors.length) process.exitCode = 1;
}

main();
