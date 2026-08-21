#!/usr/bin/env node
/**
 * rhythm-audit.mjs — measures the ONE signal that actually separates
 * machine prose from human prose.
 *
 * WHY THIS EXISTS
 * ---------------
 * We nearly spent a session rewriting 2,533 em dashes. Then we read the
 * upstream standard's own false-positive corpus
 * (conorbronsdon/avoid-ai-writing, corpus/README.md, v3.22.0 2026-07-31)
 * and found the measurement inverts the advice:
 *
 *   Category      Human    Machine   Lift
 *   uniformity     2.1%     25.1%    11.7x   <- the real signal
 *   filler         2.4%      8.3%     3.4x
 *   low-ttr        6.4%      9.8%     1.5x
 *   tier1 (words)  8.0%      7.4%     0.9x   <- the 112-word list barely works
 *   em-dash        9.9%      1.9%     0.2x   <- INVERTED: dashes read HUMAN
 *
 * Maintainer's own words: "On this corpus an em dash is evidence the text
 * is *human*." Pooled ROC-AUC for the composite score is 0.501 — a coin flip.
 *
 * So: word lists and dashes are writing-style questions, not authorship
 * signals. Rhythm is the authorship signal, by an order of magnitude.
 *
 * The math below is ported faithfully from upstream detector/patterns.js
 * (sentence uniformity ~L1720, cross-para burstiness ~L1500, TTR ~L1745)
 * so our numbers are comparable to theirs rather than freshly invented.
 *
 * DETECT ONLY. Never rewrites. Rhythm is voice, and voice is Sush's.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const BLOG_DIR = join(process.cwd(), 'content', 'blog');

// ── thresholds, upstream values ─────────────────────────────────────
const UNIFORM_CV = 0.25;   // sentence-length CV below this = flat
const UNIFORM_MIN_AVG = 10;
const BURST_STD = 0.08;    // std-of-CV across paragraphs
const BURST_MEAN = 0.45;
const TTR_MIN_TOKENS = 200;
const TTR_FLOOR = 0.40;
const MATTR_WINDOW = 500;  // fixed window; see note below

/**
 * MEASURED CORRECTION TO UPSTREAM (2026-08-21)
 * --------------------------------------------
 * Upstream flags raw TTR < 0.40. Applied to whole documents that threshold
 * is a length artifact, not a vocabulary finding: raw TTR falls mechanically
 * as text lengthens because vocabulary saturates. Measured on this corpus:
 *
 *   corr(log words, raw TTR)   = -0.901   <- it is measuring length
 *   corr(log words, MATTR-500) = +0.395   <- length-invariant
 *   raw TTR   below 40%: 70 / 74 posts
 *   MATTR-500 below 40%:  0 / 74 posts
 *
 * Upstream's corpus is 875 *paragraphs*, so 0.40 was tuned at paragraph
 * scale and is correct there. Our unit is a 900-15,000 word document, so we
 * use a moving-average TTR over a fixed window instead — the standard
 * corpus-linguistics fix for exactly this bias. Same intent, right unit.
 */
function mattr(tokens, w = MATTR_WINDOW) {
  if (tokens.length < w) return new Set(tokens).size / tokens.length;
  let sum = 0;
  let n = 0;
  for (let i = 0; i + w <= tokens.length; i += 50) {
    sum += new Set(tokens.slice(i, i + w)).size / w;
    n++;
  }
  return sum / n;
}

/** Strip everything that is not the author's running prose. */
function toProse(raw) {
  let t = raw;
  t = t.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');   // frontmatter
  t = t.replace(/```[\s\S]*?```/g, '');                   // fenced code
  t = t.replace(/^\s*\|.*\|\s*$/gm, '');                  // table rows
  t = t.replace(/\{\{[<%][\s\S]*?[>%]\}\}/g, '');         // Hugo shortcodes
  t = t.replace(/^#{1,6}\s.*$/gm, '');                    // headings
  t = t.replace(/^\s*>.*$/gm, '');                        // blockquotes
  t = t.replace(/!\[[^\]]*\]\([^)]*\)/g, '');             // images
  t = t.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');          // links -> text
  t = t.replace(/^\s*[-*+]\s+/gm, '');                    // bullet markers
  t = t.replace(/^\s*\d+\.\s+/gm, '');                    // ordered markers
  t = t.replace(/[*_`]/g, '');                            // inline emphasis
  t = t.replace(/<[^>]+>/g, '');                          // raw html
  return t;
}

/** Paragraphs = blank-line separated blocks with real prose in them. */
function getParagraphs(prose) {
  return prose
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter((p) => p.length > 0);
}

/**
 * Sentence split. Abbreviation-aware so "e.g." and "Dr." do not create
 * one-word fragments that would fake variance we have not earned.
 */
const ABBREV = /\b(?:e\.g|i\.e|etc|vs|Dr|Mr|Mrs|Ms|Prof|Inc|Ltd|Co|St|approx|Fig|No|Jr|Sr|U\.S|a\.m|p\.m)\.$/i;
function getSentences(text) {
  const parts = text.split(/(?<=[.!?])\s+/);
  const out = [];
  for (const p of parts) {
    const prev = out[out.length - 1];
    if (prev && ABBREV.test(prev.trim())) out[out.length - 1] = `${prev} ${p}`;
    else out.push(p);
  }
  return out.map((s) => s.trim()).filter((s) => countWords(s) > 0);
}

const countWords = (s) => (s.match(/\b[\w'-]+\b/g) || []).length;

function cv(lengths) {
  if (!lengths.length) return null;
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  if (mean === 0) return null;
  const v = lengths.reduce((s, l) => s + (l - mean) ** 2, 0) / lengths.length;
  return { mean, cv: Math.sqrt(v) / mean };
}

function analyse(raw) {
  const prose = toProse(raw);
  const paragraphs = getParagraphs(prose);
  const sentences = getSentences(prose.replace(/\s+/g, ' '));
  const flags = [];

  // 1. Sentence-length uniformity — the 11.7x signal.
  let sentCv = null;
  let avgLen = null;
  if (sentences.length >= 5) {
    const stats = cv(sentences.map(countWords));
    if (stats) {
      sentCv = stats.cv;
      avgLen = stats.mean;
      if (stats.cv < UNIFORM_CV && stats.mean > UNIFORM_MIN_AVG) {
        flags.push({
          type: 'uniformity',
          detail: `sentences cluster at ~${Math.round(stats.mean)} words (CV ${stats.cv.toFixed(2)} < ${UNIFORM_CV})`,
        });
      }
    }
  }

  // 2. Cross-paragraph burstiness — is every paragraph the same shape?
  let sigmaCv = null;
  if (paragraphs.length >= 4) {
    const cvs = paragraphs
      .map((p) => {
        const s = getSentences(p);
        if (s.length < 3) return null;
        const st = cv(s.map(countWords));
        return st ? st.cv : null;
      })
      .filter((c) => c !== null);
    if (cvs.length >= 4) {
      const st = cv(cvs);
      const mean = cvs.reduce((a, b) => a + b, 0) / cvs.length;
      const variance = cvs.reduce((s, c) => s + (c - mean) ** 2, 0) / cvs.length;
      sigmaCv = Math.sqrt(variance);
      if (sigmaCv < BURST_STD && mean < BURST_MEAN) {
        flags.push({
          type: 'cross-para-burstiness',
          detail: `every paragraph has the same internal rhythm (sigmaCV ${sigmaCv.toFixed(3)} < ${BURST_STD})`,
        });
      }
      void st;
    }
  }

  // 3. Vocabulary diversity — MATTR, not raw TTR. See note above.
  const tokens = (prose.toLowerCase().match(/\b[a-z'-]+\b/g) || []);
  let ttr = null;
  if (tokens.length >= TTR_MIN_TOKENS) {
    ttr = mattr(tokens);
    if (ttr < TTR_FLOOR) {
      flags.push({
        type: 'low-ttr',
        detail: `vocabulary diversity ${(ttr * 100).toFixed(1)}% MATTR-${MATTR_WINDOW} (< ${TTR_FLOOR * 100}%)`,
      });
    }
  }

  return {
    words: countWords(prose),
    sentences: sentences.length,
    paragraphs: paragraphs.length,
    sentCv,
    avgLen,
    sigmaCv,
    ttr,
    flags,
  };
}

// ── run ─────────────────────────────────────────────────────────────
const only = process.argv.find((a) => a.startsWith('--post='))?.split('=')[1];
const verbose = process.argv.includes('--verbose');

let files;
try {
  files = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md') && f !== '_index.md');
} catch {
  console.error(`Cannot read ${BLOG_DIR} — run from the repo root.`);
  process.exit(2);
}
if (only) files = files.filter((f) => f.includes(only));

const results = [];
for (const f of files) {
  const r = analyse(readFileSync(join(BLOG_DIR, f), 'utf8'));
  if (r.words < 300) continue; // too short to have a rhythm
  results.push({ file: f, ...r });
}

results.sort((a, b) => (a.sentCv ?? 9) - (b.sentCv ?? 9));

const flagged = results.filter((r) => r.flags.length > 0);

console.log('\nRHYTHM AUDIT — the signal that actually discriminates (11.7x lift)');
console.log('='.repeat(70));
console.log(`Posts analysed : ${results.length}`);
console.log(`Posts flagged  : ${flagged.length}`);

const cvs = results.map((r) => r.sentCv).filter((v) => v !== null).sort((a, b) => a - b);
if (cvs.length) {
  const median = cvs[Math.floor(cvs.length / 2)];
  console.log(`Median sentence-length CV : ${median.toFixed(3)}  (flat < ${UNIFORM_CV}; human prose usually 0.4-0.8)`);
  console.log(`Range                     : ${cvs[0].toFixed(3)} - ${cvs[cvs.length - 1].toFixed(3)}`);
}
const ttrs = results.map((r) => r.ttr).filter((v) => v !== null).sort((a, b) => a - b);
if (ttrs.length) {
  console.log(`Median vocabulary diversity : ${(ttrs[Math.floor(ttrs.length / 2)] * 100).toFixed(1)}%  MATTR-${MATTR_WINDOW} (flat < ${TTR_FLOOR * 100}%)`);
}

if (flagged.length) {
  console.log('\nFLAGGED');
  console.log('-'.repeat(70));
  for (const r of flagged) {
    console.log(`\n  ${r.file}  (${r.words} words)`);
    for (const f of r.flags) console.log(`    [${f.type}] ${f.detail}`);
  }
} else {
  console.log('\nNo post trips the uniformity, burstiness or vocabulary thresholds.');
}

if (verbose) {
  console.log('\nFLATTEST 10 BY SENTENCE-LENGTH CV (closest to the machine end)');
  console.log('-'.repeat(70));
  for (const r of results.slice(0, 10)) {
    const cvS = r.sentCv === null ? '  n/a' : r.sentCv.toFixed(3);
    const sig = r.sigmaCv === null ? ' n/a ' : r.sigmaCv.toFixed(3);
    const tt = r.ttr === null ? ' n/a ' : `${(r.ttr * 100).toFixed(1)}%`;
    console.log(`  CV ${cvS}  sigmaCV ${sig}  TTR ${tt}  ${r.file.slice(0, 44)}`);
  }
}

console.log('\nDetect only. Rhythm is voice — nothing here is auto-edited.\n');
process.exit(0);
