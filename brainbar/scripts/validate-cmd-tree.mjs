#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
// cmd · License relationship validator
// ═══════════════════════════════════════════════════════════════════════════
//
// Validates the `includes`/`included_in` graph in cmd_entries.toml + cmd_skus.toml.
// Runs as part of pre-push checklist. Exit non-zero on failure.
//
// Rules enforced (from plan.md · duck blocker #1):
//   1. Every includes[].slug references an existing entry slug
//   2. No self-edges (entry can't include itself)
//   3. No duplicate children within one entry's includes[]
//   4. No circular display loops (DFS cycle detection)
//   5. included_in[] MUST NOT appear in TOML (build-derived only)
//   6. includes MUST appear before [entries.terms] in raw TOML text
//   7. Every cmd_skus.toml entry's slug (if non-empty) must reference an existing entry
//
// Run: node scripts/validate-cmd-tree.mjs
// ═══════════════════════════════════════════════════════════════════════════

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'smol-toml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ANSI colour helpers
const RED = '\x1b[31m', GREEN = '\x1b[32m', YELLOW = '\x1b[33m', DIM = '\x1b[2m', RESET = '\x1b[0m', BOLD = '\x1b[1m';
const ok = (msg) => console.log(`${GREEN}✓${RESET} ${msg}`);
const fail = (msg) => console.log(`${RED}✗${RESET} ${BOLD}${msg}${RESET}`);
const warn = (msg) => console.log(`${YELLOW}⚠${RESET} ${msg}`);
const info = (msg) => console.log(`${DIM}${msg}${RESET}`);

const errors = [];
const warnings = [];

function err(rule, message) {
  errors.push({ rule, message });
  fail(`[rule ${rule}] ${message}`);
}

// ─── Load files ──────────────────────────────────────────────────────────
const entriesPath = resolve(ROOT, 'data/cmd_entries.toml');
const skusPath = resolve(ROOT, 'data/cmd_skus.toml');

const entriesText = readFileSync(entriesPath, 'utf-8');
const skusText = readFileSync(skusPath, 'utf-8');

let entriesData, skusData;
try {
  entriesData = parse(entriesText);
} catch (e) {
  err('parse', `cmd_entries.toml failed to parse: ${e.message}`);
  process.exit(1);
}
try {
  skusData = parse(skusText);
} catch (e) {
  err('parse', `cmd_skus.toml failed to parse: ${e.message}`);
  process.exit(1);
}

const entries = Array.isArray(entriesData.entries) ? entriesData.entries : [];
const skus = Array.isArray(skusData.skus) ? skusData.skus : [];
const slugSet = new Set(entries.map(e => e.slug));

info(`loaded ${entries.length} entries, ${skus.length} sku mappings`);

// ─── Rule 5: included_in must not appear in TOML ──────────────────────────
for (const entry of entries) {
  if ('included_in' in entry) {
    err(5, `entry "${entry.slug}" has hand-authored included_in[] — this field is build-derived only, remove from TOML`);
  }
}

// ─── Rule 6: includes must appear before [entries.terms] in raw TOML ──────
// Walk entries blocks in raw text and check ordering
{
  const entryBlockRe = /\[\[entries\]\][^\[]*?(?=\[\[entries\]\]|$)/gs;
  let m;
  while ((m = entryBlockRe.exec(entriesText)) !== null) {
    const block = m[0];
    const slugMatch = block.match(/^slug = "([^"]+)"/m);
    if (!slugMatch) continue;
    const slug = slugMatch[1];
    const includesIdx = block.indexOf('\nincludes ');
    const termsIdx = block.indexOf('\n[entries.terms]');
    if (includesIdx === -1) continue; // entry has no includes — fine
    if (termsIdx === -1) continue; // entry has no terms — odd but valid
    if (includesIdx > termsIdx) {
      err(6, `entry "${slug}": includes[] appears AFTER [entries.terms] (TOML scoping bug — includes will attach to terms, not entry). Move includes BEFORE [entries.terms].`);
    }
  }
}

// ─── Rules 1-4 + helper: collect normalised edges per entry ───────────────
const includesBySlug = new Map();
function normaliseIncludes(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map(item => {
    if (typeof item === 'string') return { slug: item, note: '' };
    if (item && typeof item === 'object' && typeof item.slug === 'string') {
      return { slug: item.slug, note: String(item.note || '') };
    }
    return null;
  }).filter(x => x && x.slug);
}

for (const entry of entries) {
  if (!entry.includes) continue;
  const norm = normaliseIncludes(entry.includes);
  includesBySlug.set(entry.slug, norm);

  // Rule 1: every child slug exists
  for (const edge of norm) {
    if (!slugSet.has(edge.slug)) {
      err(1, `entry "${entry.slug}" includes unknown slug "${edge.slug}"`);
    }
  }
  // Rule 2: no self-edges
  for (const edge of norm) {
    if (edge.slug === entry.slug) {
      err(2, `entry "${entry.slug}" includes itself`);
    }
  }
  // Rule 3: no duplicate children
  const seen = new Set();
  for (const edge of norm) {
    if (seen.has(edge.slug)) {
      err(3, `entry "${entry.slug}" has duplicate child "${edge.slug}" in includes[]`);
    }
    seen.add(edge.slug);
  }
}

// ─── Rule 4: cycle detection via DFS ──────────────────────────────────────
function detectCycles() {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const colour = new Map();
  for (const slug of slugSet) colour.set(slug, WHITE);

  function visit(slug, path) {
    if (colour.get(slug) === GRAY) {
      err(4, `cycle detected: ${path.concat(slug).join(' → ')}`);
      return;
    }
    if (colour.get(slug) === BLACK) return;
    colour.set(slug, GRAY);
    const edges = includesBySlug.get(slug) || [];
    for (const edge of edges) {
      visit(edge.slug, path.concat(slug));
    }
    colour.set(slug, BLACK);
  }

  for (const slug of slugSet) {
    if (colour.get(slug) === WHITE) visit(slug, []);
  }
}
detectCycles();

// ─── Rule 7: SKU map slugs must reference real entries ────────────────────
for (const sku of skus) {
  if (!sku.slug) continue; // empty slug = "no cmd entry yet" — allowed
  if (!slugSet.has(sku.slug)) {
    err(7, `sku ${sku.guid} (${sku.sku}) references unknown slug "${sku.slug}"`);
  }
}

// ─── Summary ──────────────────────────────────────────────────────────────
console.log('');
if (errors.length === 0) {
  ok(`validator clean — ${entries.length} entries, ${[...includesBySlug.values()].reduce((n, v) => n + v.length, 0)} includes edges, ${skus.length} sku mappings, 0 issues`);
  // Also print quick stats
  const licenseEntries = entries.filter(e => e.kind === 'license');
  info(`  license entries with includes: ${licenseEntries.filter(e => e.includes && e.includes.length).length}/${licenseEntries.length}`);
  process.exit(0);
} else {
  fail(`validator failed — ${errors.length} error(s)`);
  process.exit(1);
}
