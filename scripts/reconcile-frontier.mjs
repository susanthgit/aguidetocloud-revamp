#!/usr/bin/env node
/**
 * Copilot Frontier Map — Reconcile Against Official Microsoft Feed
 * ================================================================
 * Purpose: make status drift IMPOSSIBLE to miss. Fetches Microsoft's own
 * structured Frontier feature feed and reconciles it against features.toml,
 * so the next person who updates this tracker sees — in one command — exactly
 * what changed on Microsoft's side and where our data is stale or unproven.
 *
 * Run:  node scripts/reconcile-frontier.mjs
 *       npm run verify:frontier
 *
 * What it reports (exit code 1 if any ACTION-NEEDED findings):
 *   1. NEW on Microsoft's feed, missing from our tracker   → add it
 *   2. In our tracker (linked), no longer on the feed       → verify: GA? withdrawn?
 *   3. Features with stale `last_verified` (> STALE_DAYS)   → re-check
 *   4. Features missing `stage_evidence` proof              → add a verbatim source quote
 *   5. Feed items whose label flipped to/from "in preview"  → review our status
 *
 * Data source: the same JSON the official Frontier page itself renders from.
 * No scraping of rendered HTML — this is Microsoft's structured content feed.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Minimal, dependency-free reader for the fields reconcile needs from features.toml.
// Avoids requiring `npm install` in a fresh checkout so `npm run verify` always works.
function readFeatures(tomlText) {
  const blocks = tomlText.split(/^\[\[features\]\]\s*$/m).slice(1);
  const scalar = (block, key) => {
    const m = block.match(new RegExp('^' + key + '\\s*=\\s*"([^"]*)"', 'm'));
    return m ? m[1] : '';
  };
  return blocks.map(b => ({
    id: scalar(b, 'id'),
    name: scalar(b, 'name'),
    status: scalar(b, 'status'),
    official_ref: scalar(b, 'official_ref'),
    also_covers: scalar(b, 'also_covers'),
    last_verified: scalar(b, 'last_verified'),
    stage_evidence: scalar(b, 'stage_evidence')
  }));
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..');
const FEATURES_TOML = path.join(REPO, 'data', 'copilot_frontier_map', 'features.toml');
const CACHE = path.join(REPO, 'data', 'copilot_frontier_map', '.official-feed-cache.json');

const FEED_URL = 'https://www.microsoft.com/mscascadesvlt/en-us/dynamic-search-results_content__microsoft__bade__en-us__microsoft-365-copilot__frontier-features.cascadecontent.json';
const STALE_DAYS = 45;

const C = { reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', cyan: '\x1b[36m', dim: '\x1b[2m', bold: '\x1b[1m' };
const color = (c, s) => (process.stdout.isTTY ? C[c] + s + C.reset : s);

async function fetchFeed(retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(FEED_URL, { headers: { 'User-Agent': 'Mozilla/5.0 (aguidetocloud-frontier-reconcile)' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      fs.writeFileSync(CACHE, JSON.stringify(json));
      return { json, live: true };
    } catch (e) {
      console.error(color('yellow', `  fetch attempt ${attempt}/${retries} failed: ${e.message}`));
      if (attempt < retries) await new Promise(r => setTimeout(r, 1500 * attempt));
    }
  }
  if (fs.existsSync(CACHE)) {
    console.error(color('yellow', '  Using cached feed (live fetch failed).'));
    return { json: JSON.parse(fs.readFileSync(CACHE, 'utf8')), live: false };
  }
  throw new Error('Could not fetch official feed and no cache available.');
}

// Recursively collect the feature records (objects with content{title,eyebrow} + name + filterTags)
function collectRecords(node, acc = []) {
  if (node == null || typeof node === 'string') return acc;
  if (Array.isArray(node)) { node.forEach(n => collectRecords(n, acc)); return acc; }
  if (typeof node === 'object') {
    const keys = Object.keys(node);
    if (keys.includes('content') && keys.includes('name') && keys.includes('filterTags') &&
        node.content && typeof node.content.title === 'string') {
      acc.push(node);
    }
    for (const k of keys) collectRecords(node[k], acc);
  }
  return acc;
}

function daysSince(dateStr) {
  if (!dateStr) return Infinity;
  const then = new Date(dateStr + 'T00:00:00Z').getTime();
  if (Number.isNaN(then)) return Infinity;
  return Math.floor((Date.now() - then) / 86400000);
}

function main() {
  return fetchFeed().then(({ json, live }) => {
    const records = collectRecords(json);
    const feedBySlug = new Map();
    for (const r of records) feedBySlug.set(r.name, { title: r.content.title, eyebrow: r.content.eyebrow || '' });

    const parsed = { features: readFeatures(fs.readFileSync(FEATURES_TOML, 'utf8')) };
    const features = parsed.features || [];

    const trackedRefs = new Map();
    for (const f of features) {
      if (f.official_ref) trackedRefs.set(f.official_ref, f);
      // "also_covers" lets a parent feature absorb related capability-updates from the
      // feed (e.g. Cowork absorbs "GPT-5.5 now in Cowork") so they aren't flagged as new.
      if (f.also_covers) {
        for (const extra of f.also_covers.split(',').map(s => s.trim()).filter(Boolean)) {
          trackedRefs.set(extra, f);
        }
      }
    }

    const findings = { add: [], removed: [], stale: [], noEvidence: [], previewFlip: [] };

    // 1. NEW on feed, not tracked
    for (const [slug, info] of feedBySlug) {
      if (!trackedRefs.has(slug)) findings.add.push({ slug, title: info.title, eyebrow: info.eyebrow });
    }
    // 2. Tracked (with a ref) but no longer on the feed
    for (const [slug, f] of trackedRefs) {
      if (!feedBySlug.has(slug)) findings.removed.push({ slug, name: f.name, status: f.status });
    }
    // 3/4/5. Per-feature hygiene
    for (const f of features) {
      if (daysSince(f.last_verified) > STALE_DAYS) findings.stale.push({ name: f.name, last_verified: f.last_verified || '(none)', days: daysSince(f.last_verified) });
      if (!f.stage_evidence || !String(f.stage_evidence).trim()) findings.noEvidence.push({ name: f.name, status: f.status });
      if (f.official_ref && feedBySlug.has(f.official_ref)) {
        const eyebrow = (feedBySlug.get(f.official_ref).eyebrow || '').toLowerCase();
        const feedSaysPreview = eyebrow.includes('preview');
        if (feedSaysPreview && f.status === 'ga') {
          findings.previewFlip.push({ name: f.name, note: 'Feed still labels this "in preview" but tracker says GA', eyebrow });
        }
      }
    }

    // ── Report ──
    console.log('\n' + color('bold', 'Copilot Frontier Map — Reconciliation Report'));
    console.log(color('dim', `Feed: ${live ? 'LIVE' : 'CACHED'} · ${records.length} official items · ${features.length} tracked features · stale threshold ${STALE_DAYS}d\n`));

    let actionNeeded = 0;

    if (findings.add.length) {
      actionNeeded += findings.add.length;
      console.log(color('red', `● ${findings.add.length} NEW on Microsoft's feed — not in tracker (ADD):`));
      findings.add.forEach(x => console.log(`    - [${x.eyebrow}] ${x.title}\n      ${color('dim', 'slug: ' + x.slug)}`));
      console.log('');
    }
    if (findings.removed.length) {
      actionNeeded += findings.removed.length;
      console.log(color('red', `● ${findings.removed.length} tracked but GONE from feed — verify GA/withdrawn:`));
      findings.removed.forEach(x => console.log(`    - ${x.name} ${color('dim', '(' + x.status + ', ref: ' + x.slug + ')')}`));
      console.log('');
    }
    if (findings.previewFlip.length) {
      console.log(color('yellow', `● ${findings.previewFlip.length} status differs from feed label (informational — verify intentional):`));
      findings.previewFlip.forEach(x => console.log(`    - ${x.name}: ${x.note}`));
      console.log('');
    }
    if (findings.noEvidence.length) {
      console.log(color('yellow', `● ${findings.noEvidence.length} features missing stage_evidence (add a verbatim source quote):`));
      findings.noEvidence.forEach(x => console.log(`    - ${x.name} ${color('dim', '(' + x.status + ')')}`));
      console.log('');
    }
    if (findings.stale.length) {
      console.log(color('cyan', `● ${findings.stale.length} features not verified in > ${STALE_DAYS} days (re-check):`));
      findings.stale.sort((a, b) => b.days - a.days).forEach(x => console.log(`    - ${x.name} ${color('dim', '(last verified ' + x.last_verified + ', ' + x.days + 'd ago)')}`));
      console.log('');
    }

    if (actionNeeded === 0 && findings.stale.length === 0 && findings.noEvidence.length === 0) {
      console.log(color('green', '✓ In sync with Microsoft\'s feed. No drift, all features verified and evidenced.\n'));
    } else {
      console.log(color('bold', `Summary: ${findings.add.length} to add · ${findings.removed.length} to verify · ${findings.previewFlip.length} status flags · ${findings.noEvidence.length} need evidence · ${findings.stale.length} stale\n`));
    }

    process.exitCode = actionNeeded > 0 ? 1 : 0;
  });
}

main().catch(e => { console.error(color('red', 'ERROR: ' + e.message)); process.exitCode = 2; });
