#!/usr/bin/env node
/**
 * Licence-picker pricing invariants.
 *
 * Added 2026-09-14. The picker shipped a currency selector (USD/AUD/NZD/GBP/EUR)
 * whose 92 non-USD values were pure FX arithmetic off the USD price, not Microsoft
 * list prices — e.g. Office 365 E3 showed NZ$41.60 where Microsoft charges NZ$44.40.
 * Every one of the 92 was wrong. They were removed and the tool went USD-only.
 *
 * Two defects made that worse than a stale number, and this guard exists to stop
 * either coming back:
 *   1. getPrice() fell back to price_usd when a regional key was missing, while
 *      formatPrice() still stamped the selected symbol — so deleting the data
 *      alone would have rendered a US$26 price as "NZ$26.00".
 *   2. formatPrice() coerced a missing value with (amount || 0), inventing a
 *      plausible "$0.00" instead of showing a gap.
 *
 * Static parse. No browser, no dev server, milliseconds. Runs unconditionally.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import TOML from '@iarna/toml';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];
const FABRICATED = ['price_aud', 'price_nzd', 'price_gbp', 'price_eur'];

function read(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) { problems.push(`✗ missing file: ${rel}`); return null; }
  return fs.readFileSync(p, 'utf8');
}

// ── 1. Data: USD only, every price finite ──────────────────────────────
for (const [rel, key, floor] of [
  ['data/licence_picker/plans.toml', 'plans', 11],
  ['data/licence_picker/addons.toml', 'addons', 12],
]) {
  const raw = read(rel);
  if (raw === null) continue;

  let doc;
  try { doc = TOML.parse(raw); }
  catch (e) { problems.push(`✗ ${rel}: TOML parse failed — ${e.message}`); continue; }

  const entries = doc[key];
  if (!Array.isArray(entries)) { problems.push(`✗ ${rel}: no [[${key}]] array`); continue; }

  // Floor, not equality: deleting an entry is a bug, adding one is legitimate.
  if (entries.length < floor)
    problems.push(`✗ ${rel}: ${entries.length} ${key} — expected at least ${floor}. An entry was deleted.`);

  for (const e of entries) {
    const id = e.id || '(no id)';
    if (!Number.isFinite(e.price_usd))
      problems.push(`✗ ${rel}: ${id} has no finite price_usd (got ${JSON.stringify(e.price_usd)})`);
    // The ms_url link is the ONLY mitigation for having removed regional prices. A plan
    // without one silently inherits whichever link was rendered for the previous plan.
    if (key === 'plans' && !/^https:\/\/(www|learn)\.microsoft\.com\//.test(e.ms_url || ''))
      problems.push(`✗ ${rel}: ${id} has no valid Microsoft ms_url. That link is the authoritative pricing source now that regional prices are gone.`);
    for (const c of FABRICATED)
      if (c in e)
        problems.push(`✗ ${rel}: ${id} has ${c}. Microsoft's regional prices are not an FX multiple of USD — a converted figure is fabricated. Link to ms_url instead.`);
  }
}

// ── 2. JS: no currency machinery, no fail-open price formatting ─────────
const js = read('static/js/licence-picker.js');
if (js) {
  if (/currencySymbols/.test(js))
    problems.push('✗ licence-picker.js: currencySymbols map is back. A symbol map plus a USD-only dataset renders USD numbers under a foreign symbol.');

  if (/['"]price_['"]\s*\+|`price_\$\{/.test(js))
    problems.push('✗ licence-picker.js: dynamic "price_" + currency key lookup is back. Read item.price_usd directly.');

  if (/function formatPrice[\s\S]{0,200}?\|\|\s*0\s*\)\s*\.toFixed/.test(js))
    problems.push('✗ licence-picker.js: formatPrice coerces a missing price with (amount || 0), which invents "$0.00". Use Number.isFinite(amount) ? ... : "—".');

  if (!/function formatPrice[\s\S]{0,200}?Number\.isFinite/.test(js))
    problems.push('✗ licence-picker.js: formatPrice must guard with Number.isFinite and render an em-dash for a missing price.');

  if (!/function getPrice[\s\S]{0,200}?Number\.isFinite/.test(js))
    problems.push('✗ licence-picker.js: getPrice must guard with Number.isFinite and return NaN (never null/0) so a gap propagates through totals.');
}

// ── 3. Template: no currency selector ──────────────────────────────────
const html = read('layouts/licence-picker/list.html');
if (html) {
  if (/id=["']licpick-currency["']/.test(html))
    problems.push('✗ list.html: the currency selector is back. Restoring it requires a real per-region price source, not FX conversion.');
  if (!/licpick-price-note/.test(html))
    problems.push('✗ list.html: the indicative-pricing disclosure (.licpick-price-note) is missing. Prices must be labelled indicative USD with a link to Microsoft.');
  if (!/licpick-rec-msurl/.test(html))
    problems.push('✗ list.html: the "verify on Microsoft" link (#licpick-rec-msurl) is missing.');
}

// ── Result ─────────────────────────────────────────────────────────────
if (problems.length) {
  console.error('Licence-picker pricing invariants FAILED:\n');
  problems.forEach(p => console.error('  ' + p));
  console.error(`\n${problems.length} problem(s). Prices on a public tool must be real or absent — never inferred.`);
  process.exit(1);
}
console.log('✓ Licence picker: USD-only, all prices finite, no fabricated regional values');
process.exit(0);
