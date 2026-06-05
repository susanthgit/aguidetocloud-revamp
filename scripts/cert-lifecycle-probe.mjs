#!/usr/bin/env node
/**
 * cert-lifecycle-probe.mjs — EXTERNAL change detector for Microsoft cert pages.
 *
 * Companion to morning-standup.ps1's Check-CertLifecycle (LOCAL drift detector).
 * Class bug being addressed: no continuous cert lifecycle radar — past Atlas had
 * to be told by Sush hearing about cert changes in other channels.
 *
 * For each Microsoft cert in data/all_certs.toml:
 *   1. Fetch https://learn.microsoft.com/en-us/credentials/certifications/exams/{code}/
 *   2. Extract stable subset: <title>, Retirement date text, Skills domains +
 *      percentages, beta marker, ms.date metadata
 *   3. Hash that subset
 *   4. Compare against previous run's state in .cert-lifecycle-state.json
 *   5. Report changes (new, changed, disappeared)
 *
 * First run mode: if state file doesn't exist or cert is unseen, just baseline.
 * Don't alert on first observation — would be a 37-issue storm.
 *
 * Storm suppression: if >20% of cert fetches fail, emit one summary
 * `cert-lifecycle-probe-broken` event instead of per-cert events.
 *
 * Output to stdout (line-prefixed):
 *   STATE_CHANGED:1 (if state file written)
 *   EVENT:<type>:<code>:<details>   for each change (consumed by workflow)
 *
 * Exit codes: 0 = healthy run (no fatal errors), 2 = fatal (file read failure)
 *
 * Usage: node scripts/cert-lifecycle-probe.mjs [--dry-run]
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const ALL_CERTS = resolve(REPO_ROOT, 'data/all_certs.toml');
const STATE_FILE = resolve(REPO_ROOT, '.cert-lifecycle-state.json');
const DRY_RUN = process.argv.includes('--dry-run');

const FETCH_DELAY_MS = 5000;  // polite — 5s between requests
const FAILURE_STORM_PCT = 0.20;  // if >20% fail, switch to storm mode
const CONSECUTIVE_404_THRESHOLD = 2;  // need 2 consecutive 404s before marking disappeared
const REQUEST_TIMEOUT_MS = 15000;
const USER_AGENT = 'agtc-cert-lifecycle-probe/1.0 (+https://github.com/susanthgit/aguidetocloud-revamp)';

// ── TOML parser (minimal — just for our [[cert]] / [cert_map."x"] structure) ──
// We don't need full TOML parsing; we just need to walk the [[cert]] blocks and
// extract code + vendor for each. Avoids adding @iarna/toml as a runtime dep.
function parseAllCerts(tomlText) {
  const certs = [];
  let current = null;
  for (const line of tomlText.split(/\r?\n/)) {
    if (/^\[\[cert\]\]/.test(line)) {
      if (current) certs.push(current);
      current = {};
    } else if (/^\[cert_map\./.test(line) || /^\[\[?/.test(line)) {
      // We only want the flat [[cert]] array — stop on cert_map or any other top-level
      if (current) certs.push(current);
      current = null;
    } else if (current) {
      const m = line.match(/^(\w+)\s*=\s*"([^"]+)"/);
      if (m) current[m[1]] = m[2];
    }
  }
  if (current) certs.push(current);
  return certs.filter(c => c.code && c.vendor);
}

// ── Extract the stable hashable subset from a Microsoft Learn cert page ──
// Strips chrome (nav, breadcrumbs, related links, scripts) and normalises
// whitespace. We hash this so unrelated page changes don't false-alarm.
//
// Microsoft Learn serves two page shapes depending on cert maturity:
//   - Beta / recent exams: /exams/{code}/ stays — has "Assessed on this exam"
//     section with `<li>Heading (NN-NN%)</li>` weighted skills
//   - GA-vintage certs: /exams/{code}/ → /{cert-name}/ — has cert page with
//     `<li>Heading</li>` un-weighted skills under "Skills measured"
// Both shapes are hashed; we capture whatever the page exposes.
function extractStableSubset(html, code) {
  const fields = {};

  // Page title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) fields.title = titleMatch[1].trim();

  // Retirement date — appears in HTML as `Retirement date:</strong>\n   <value>\n</p>`
  const retireMatch = html.match(/Retirement date:[\s\S]{0,80}?<\/strong>\s*([^\n<]+)/i)
                   || html.match(/Retirement date:\s*([^\n<]+)/i);
  if (retireMatch) {
    const val = retireMatch[1].trim();
    fields.retirementDate = val === 'none' ? null : val;
  }

  // Beta marker — appears in the title and headings
  fields.isBeta = /\(beta\)/i.test(fields.title || '') || /Beta exam/i.test(html);

  // Skills measured — HTML-structure-aware. Walk every <li>...</li> in the page,
  // accept those that LOOK like skill headings. Reject menu items, nav, etc.
  // by length + content filter.
  const skills = [];
  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let li;
  while ((li = liRegex.exec(html)) !== null) {
    // Inner text — strip nested tags, collapse whitespace
    const text = li[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!text) continue;
    // Form 1: "Heading (NN-NN%)" or "Heading (NN%)"
    const weighted = text.match(/^(.+?)\s*\((\d+(?:[\u2013\-]\d+)?%)\)\s*$/);
    if (weighted) {
      const h = weighted[1].trim();
      if (h.length >= 8 && h.length <= 150 && !/^price|^cost|^currency|^tax/i.test(h)) {
        skills.push(`${h}|${weighted[2]}`);
        continue;
      }
    }
    // Form 2: bare heading on a GA cert page (no weighting). Must start with a
    // skill-verb prefix that Microsoft consistently uses, OR be a short phrase
    // that looks like a domain title. Heuristic: starts with Describe / Identify /
    // Implement / Configure / Manage / Design / Deploy / Build / Develop / Create.
    if (/^(Describe|Identify|Implement|Configure|Manage|Design|Deploy|Build|Develop|Create|Plan|Define|Maintain|Monitor|Secure|Migrate|Integrate|Apply|Use|Work with|Prove that)\b/i.test(text)) {
      if (text.length >= 12 && text.length <= 200) {
        skills.push(text);
      }
    }
  }
  fields.skills = [...new Set(skills)].sort();

  // Last-updated tip if present (English language version was updated on ...)
  const lastUpdatedMatch = html.match(/English language version of this exam was updated on ([^.]+)\./i);
  if (lastUpdatedMatch) fields.examLastUpdatedText = lastUpdatedMatch[1].trim();

  return fields;
}

function hashSubset(subset) {
  // Sort keys for stable hashing across runs
  const stable = JSON.stringify(subset, Object.keys(subset).sort());
  return createHash('sha256').update(stable).digest('hex').slice(0, 16);
}

async function fetchCertPage(code) {
  const url = `https://learn.microsoft.com/en-us/credentials/certifications/exams/${code.toLowerCase()}/`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, 'Accept': 'text/html' },
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timer);
    if (!res.ok) {
      return { ok: false, status: res.status, url };
    }
    const text = await res.text();
    return { ok: true, status: res.status, body: text, url };
  } catch (e) {
    clearTimeout(timer);
    return { ok: false, status: 0, error: String(e.message || e), url };
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function loadState() {
  if (!existsSync(STATE_FILE)) {
    return { lastRun: null, certs: {} };
  }
  try {
    return JSON.parse(readFileSync(STATE_FILE, 'utf8'));
  } catch (e) {
    console.error(`State file corrupt, treating as fresh: ${e.message}`);
    return { lastRun: null, certs: {} };
  }
}

function saveState(state) {
  if (DRY_RUN) {
    console.log('DRY_RUN: would write state file');
    return;
  }
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n', 'utf8');
}

function emitEvent(type, code, details) {
  // Workflow consumes these via stdout grep
  const payload = JSON.stringify({ type, code, details });
  console.log(`EVENT:${type}:${code}:${payload}`);
}

async function main() {
  if (!existsSync(ALL_CERTS)) {
    console.error(`FATAL: ${ALL_CERTS} not found`);
    process.exit(2);
  }
  const tomlText = readFileSync(ALL_CERTS, 'utf8');
  const allCerts = parseAllCerts(tomlText);
  const msCerts = allCerts.filter(c => c.vendor === 'microsoft');
  console.log(`Loaded ${allCerts.length} certs, ${msCerts.length} Microsoft (probing only Microsoft)`);

  const state = loadState();
  const isFirstRun = !state.lastRun;
  if (isFirstRun) {
    console.log('FIRST RUN — establishing baseline, no per-cert alerts (storm suppression)');
  }

  let okCount = 0;
  let failCount = 0;
  const events = [];

  for (let i = 0; i < msCerts.length; i++) {
    const cert = msCerts[i];
    const code = cert.code.toLowerCase();
    const prev = state.certs[code] || {};
    process.stderr.write(`[${i + 1}/${msCerts.length}] ${code}... `);

    const res = await fetchCertPage(code);
    if (!res.ok) {
      failCount++;
      const consecutive = (prev.consecutive404 || 0) + 1;
      state.certs[code] = {
        ...prev,
        consecutive404: consecutive,
        lastFailStatus: res.status,
        lastFailAt: new Date().toISOString(),
      };
      process.stderr.write(`FAIL ${res.status} (consec=${consecutive})\n`);
      // Only flag as "disappeared" if we've previously seen this cert live (has a hash).
      // Certs that have never been live (e.g. SC-500 pre-GA) are just "still pending"
      // and surface via the standup function from a different angle.
      const everSeenOK = prev.hash || prev.lastSeenOK;
      if (!isFirstRun && everSeenOK && consecutive >= CONSECUTIVE_404_THRESHOLD && (prev.consecutive404 || 0) < CONSECUTIVE_404_THRESHOLD) {
        events.push({ type: 'disappeared', code, details: { status: res.status, url: res.url, consecutive, lastSeenOK: prev.lastSeenOK } });
      }
    } else {
      okCount++;
      const subset = extractStableSubset(res.body, code);
      const hash = hashSubset(subset);
      const next = {
        hash,
        title: subset.title || prev.title,
        retirementDate: subset.retirementDate || null,
        isBeta: subset.isBeta || false,
        examLastUpdatedText: subset.examLastUpdatedText || null,
        skills: subset.skills || [],
        lastSeenOK: new Date().toISOString(),
        consecutive404: 0,
      };
      state.certs[code] = next;
      process.stderr.write(`ok hash=${hash}\n`);

      if (!isFirstRun && prev.hash && prev.hash !== hash) {
        // Detect what changed for the issue body
        const diff = {};
        if (prev.title !== next.title) diff.title = { from: prev.title, to: next.title };
        if (prev.retirementDate !== next.retirementDate) diff.retirementDate = { from: prev.retirementDate, to: next.retirementDate };
        if (prev.examLastUpdatedText !== next.examLastUpdatedText) diff.examLastUpdatedText = { from: prev.examLastUpdatedText, to: next.examLastUpdatedText };
        if (prev.isBeta !== next.isBeta) diff.isBeta = { from: prev.isBeta, to: next.isBeta };
        const prevSkills = JSON.stringify((prev.skills || []).sort());
        const nextSkills = JSON.stringify((next.skills || []).sort());
        if (prevSkills !== nextSkills) diff.skills = { from: prev.skills, to: next.skills };
        events.push({ type: 'changed', code, details: { prevHash: prev.hash, hash, diff, url: res.url } });
      } else if (!prev.hash && !isFirstRun) {
        // New Microsoft cert appeared in our toml AND has a live MS Learn page
        events.push({ type: 'new', code, details: { hash, url: res.url, title: next.title } });
      }
    }

    // Polite pacing (skip on last iteration)
    if (i < msCerts.length - 1) await sleep(FETCH_DELAY_MS);
  }

  // Storm suppression
  const failPct = failCount / msCerts.length;
  if (failPct > FAILURE_STORM_PCT) {
    console.log(`STORM_MODE: ${failCount}/${msCerts.length} (${(failPct * 100).toFixed(0)}%) fetches failed, suppressing per-cert events`);
    // Drop per-cert events, emit single summary
    emitEvent('probe-storm', 'aggregate', {
      failCount,
      totalCount: msCerts.length,
      failPct: Math.round(failPct * 100),
      sampleFailures: Object.entries(state.certs).filter(([_, v]) => v.consecutive404 > 0).slice(0, 5).map(([k, v]) => ({ code: k, status: v.lastFailStatus })),
    });
  } else {
    for (const ev of events) emitEvent(ev.type, ev.code, ev.details);
  }

  state.lastRun = new Date().toISOString();
  saveState(state);
  console.log(`STATE_CHANGED:1`);
  console.log(`SUMMARY: ${okCount} ok, ${failCount} failed, ${events.length} events emitted${failPct > FAILURE_STORM_PCT ? ' (suppressed by storm mode)' : ''}, first_run=${isFirstRun}`);
  process.exit(0);
}

main().catch(e => {
  console.error(`FATAL: ${e.stack || e}`);
  process.exit(2);
});
