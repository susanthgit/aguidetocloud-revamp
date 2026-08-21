#!/usr/bin/env node
/**
 * proof-of-thought-audit.mjs — the "sloppypasta" dimension.
 *
 * WHY THIS IS A SEPARATE SCRIPT FROM ai-writing-audit.mjs
 * They answer different questions and have different fixes:
 *
 *   ai-writing-audit.mjs   SURFACE  — do the WORDS look machine-made?
 *                                     (delve, tapestry, em dash density, bold)
 *   this file              SUBSTANCE — is there evidence a human did the work?
 *
 * A post can pass the first and fail this one badly: clean vocabulary, correct
 * facts, and still nothing showing the author ever touched the product.
 *
 * THE STANDARD (stopsloppypasta.ai) argues three things, and this measures all
 * three rather than paraphrasing them:
 *
 *   1. EFFORT ASYMMETRY — writing became free, reading did not. Length that is
 *      not repaid in substance is the core offence.
 *   2. WRITING IS THINKING — delegating it creates "cognitive debt"; the giveaway
 *      is prose with no first-hand experience in it.
 *   3. VERIFICATION TAX — LLMs write authoritatively regardless of whether
 *      anything was checked, so the reader must re-check everything. Visible
 *      sourcing and visible uncertainty are what buy trust back.
 *
 * Simon Willison's test, quoted on that page, is the one that matters:
 *   "I won't publish anything that will take someone longer to read than it
 *    took me to write."
 *
 * Write time is not measurable from a file. Its observable shadow is:
 *   LONG  +  NO FIRST-HAND EVIDENCE  =  the sloppypasta signature.
 * That ratio, not raw length, is what this script ranks on.
 *
 * DETECT ONLY. This never edits a post — voice is the author's.
 *   node scripts/proof-of-thought-audit.mjs
 *   node scripts/proof-of-thought-audit.mjs --post=<slug> --verbose
 */

import fs from 'node:fs';
import path from 'node:path';

const BLOG = path.join(process.cwd(), 'content', 'blog');
const args = process.argv.slice(2);
const ONLY = (args.find(a => a.startsWith('--post=')) || '').split('=')[1] || null;
const TOP = Number((args.find(a => a.startsWith('--top=')) || '--top=12').split('=')[1]);
const VERBOSE = args.includes('--verbose');

/* ── evidence patterns ────────────────────────────────────────────────────
   Deliberately conservative. A false "this post has proof of thought" is far
   worse than a missed one, because it would wave through the exact posts that
   need a human to look. Every pattern below requires a first-person subject or
   a concrete artefact — never a mere topic word. */

// 1. FIRST-HAND EXPERIENCE — the author personally did or saw something.
const EXPERIENCE = [
  /\bI (?:tried|tested|ran|asked|built|used|opened|clicked|checked|measured|watched|installed|configured|deployed|broke|rebuilt)\b/gi,
  /\bwhen I (?:tried|tested|ran|asked|opened|used|did|first)\b/gi,
  /\bin my (?:testing|experience|tenant|lab|demo|environment|case)\b/gi,
  /\bI (?:found|noticed|discovered|realised|realized|expected|assumed)\b/gi,
  /\b(?:my|our) (?:customer|customers|client|team|tenant|lab)\b/gi,
  /\bI (?:spent|sat|walked|showed|demo(?:ed|d)?)\b/gi,
];

// 2. HONEST LIMITS — the single hardest thing for an LLM to fake, because it
//    requires knowing where your own knowledge stops.
const HONESTY = [
  /\bI (?:don't|do not|didn't|did not|couldn't|could not|can't|cannot) (?:know|understand|get|find|see|manage|work out)\b/gi,
  /\bI (?:was|got it) wrong\b/gi, /\bI'd been wrong\b/gi,
  /\b(?:doesn't|does not|didn't|did not) (?:work|help|land|fire|show up)\b/gi,
  /\bno idea\b/gi, /\bstill (?:unclear|not clear|don't know|unsure)\b/gi,
  /\bhaven't (?:tested|tried|checked|seen)\b/gi,
  /\bhonest(?:ly)? (?:take|answer|verdict)?\b/gi,
  /\b(?:caveat|limitation|gotcha|catch)\b/gi,
  /\bto be fair\b/gi, /\bworth saying\b/gi,
];

// 3. VERIFICATION — the reader can see what was checked, and check it too.
const VERIFICATION = [
  /\bas of \w+ \d{4}\b/gi, /\bat the time of writing\b/gi,
  /\bMicrosoft (?:says|confirms|documents|states|announced)\b/gi,
  /\baccording to\b/gi, /\bI checked\b/gi, /\bverified\b/gi,
  /\bofficial (?:docs?|documentation|blog|announcement)\b/gi,
];

// 4. CONCRETE SPECIFICS — numbers, prices, versions, dates, UI paths.
const SPECIFIC = [
  /\b\$\d[\d,.]*\b/g,                       // prices
  /\b\d+(?:\.\d+)? ?(?:GB|MB|ms|s|min(?:utes)?|hours?|days?|weeks?|%)\b/gi,
  /\b\d{1,2} \w+ 20\d\d\b/g,                // real dates
  /\b(?:Settings|Admin|Portal|Home)\s*(?:→|>|->)\s*\w+/g,  // click paths
  /\bversion \d|\bv\d+\.\d+/gi,
];

// 5. UNEARNED AUTHORITY — confident framing that hides whether anything was
//    checked. This is the "polished response feels dismissive" failure.
const FALSE_AUTHORITY = [
  /\b(?:simply|just) (?:click|open|go to|run|type|select|add|enable|turn on)\b/gi,
  /\bit'?s (?:easy|simple|straightforward)\b/gi,
  /\bobviously\b/gi, /\bof course,/gi, /\bneedless to say\b/gi,
  /\bany(?:one|body) can\b/gi,
  /\bthere'?s no reason (?:not )?to\b/gi,
];

// 6. HOLLOW SCAFFOLDING — words spent announcing structure rather than carrying
//    content. Pure effort-asymmetry tax on the reader.
const SCAFFOLD = [
  /\bin this (?:section|post|article|guide|blog),? (?:we|I|you)(?:'ll| will)\b/gi,
  /\blet'?s (?:dive|jump|take a look|explore|unpack|break)\b/gi,
  /\bwe(?:'ll| will) (?:explore|cover|discuss|examine|look at)\b/gi,
  /\bby the end of this\b/gi,
  /\bit'?s (?:important|worth) (?:to note|noting|remembering) that\b/gi,
  /\bas (?:we|I) (?:mentioned|discussed|saw) (?:above|earlier|previously)\b/gi,
  /\bin (?:conclusion|summary),/gi, /\bto sum up\b/gi,
];

function strip(raw) {
  let s = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
  s = s.replace(/```[\s\S]*?```/g, ' ');
  s = s.replace(/`[^`\n]+`/g, ' ');
  s = s.replace(/\{\{[<%][\s\S]*?[>%]\}\}/g, ' ');
  s = s.replace(/<!--[\s\S]*?-->/g, ' ');
  s = s.replace(/<[^>]+>/g, ' ');
  return s;
}
const hits = (text, pats) => pats.reduce((a, p) => a + (text.match(p) || []).length, 0);
const samplesOf = (text, pats, n = 3) => {
  const out = [];
  for (const p of pats) for (const m of text.match(p) || []) if (out.length < n) out.push(m.trim());
  return out;
};

function analyse(file) {
  const raw = fs.readFileSync(path.join(BLOG, file), 'utf8');
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fm && /^draft:\s*true/m.test(fm[1])) return null;

  const text = strip(raw);
  const words = (text.match(/[A-Za-z][A-Za-z'-]*/g) || []).length;
  if (words < 300) return null;

  const per1k = n => +(n / (words / 1000)).toFixed(2);
  const experience = hits(text, EXPERIENCE);
  const honesty = hits(text, HONESTY);
  const verification = hits(text, VERIFICATION);
  const specific = hits(text, SPECIFIC);
  const authority = hits(text, FALSE_AUTHORITY);
  const scaffold = hits(text, SCAFFOLD);

  // Proof-of-thought density. Experience and honesty are weighted hardest:
  // they are the two an LLM cannot produce without the author having been there.
  const proof = experience * 3 + honesty * 3 + verification * 1.5 + specific * 0.5;
  const proofPer1k = per1k(proof);

  // The sloppypasta signature: long, and thin on first-hand evidence.
  // Scale the length penalty so a 3,000-word post with no experience ranks
  // worse than a 500-word one with none — the asymmetry is the whole point.
  const lengthTax = Math.log10(Math.max(words, 300) / 300) * 10;
  const risk = +(lengthTax / Math.max(proofPer1k, 0.3) + authority * 0.4 + per1k(scaffold) * 2).toFixed(1);

  return {
    file, slug: file.replace(/\.md$/, ''), words,
    readMin: Math.round(words / 238),        // 238 wpm, Medium's figure
    experience, honesty, verification, specific, authority, scaffold,
    proofPer1k, risk,
    expPer1k: per1k(experience), honPer1k: per1k(honesty), scafPer1k: per1k(scaffold),
    sAuth: samplesOf(text, FALSE_AUTHORITY), sScaf: samplesOf(text, SCAFFOLD),
    sExp: samplesOf(text, EXPERIENCE),
  };
}

const files = fs.readdirSync(BLOG)
  .filter(f => f.endsWith('.md') && f !== '_index.md')
  .filter(f => !ONLY || f.includes(ONLY));
const rows = files.map(analyse).filter(Boolean);
if (!rows.length) { console.log('No posts matched.'); process.exit(0); }

const sum = k => rows.reduce((a, r) => a + r[k], 0);
const words = sum('words');

console.log(`\n${'═'.repeat(74)}`);
console.log(`  PROOF-OF-THOUGHT AUDIT — the sloppypasta dimension`);
console.log(`  ${rows.length} posts · ${words.toLocaleString()} words · ~${Math.round(words / 238 / 60)}h of reading`);
console.log(`${'═'.repeat(74)}`);

console.log(`\nEVIDENCE THE AUTHOR DID THE WORK  (higher is better)`);
console.log(`  first-hand experience   ${String(sum('experience')).padStart(5)}   ${(sum('experience') / words * 1000).toFixed(2)}/1k`);
console.log(`  honest limits / doubt   ${String(sum('honesty')).padStart(5)}   ${(sum('honesty') / words * 1000).toFixed(2)}/1k`);
console.log(`  verification signals    ${String(sum('verification')).padStart(5)}   ${(sum('verification') / words * 1000).toFixed(2)}/1k`);
console.log(`  concrete specifics      ${String(sum('specific')).padStart(5)}   ${(sum('specific') / words * 1000).toFixed(2)}/1k`);

console.log(`\nREADER TAX  (lower is better)`);
console.log(`  unearned authority      ${String(sum('authority')).padStart(5)}   ${(sum('authority') / words * 1000).toFixed(2)}/1k`);
console.log(`  hollow scaffolding      ${String(sum('scaffold')).padStart(5)}   ${(sum('scaffold') / words * 1000).toFixed(2)}/1k`);

const noExp = rows.filter(r => r.experience === 0);
const noHon = rows.filter(r => r.honesty === 0);
console.log(`\nPOSTS WITH NO FIRST-HAND EVIDENCE AT ALL`);
console.log(`  zero experience markers  ${noExp.length} of ${rows.length}`);
console.log(`  zero honest-limit markers ${noHon.length} of ${rows.length}`);

console.log(`\n${'─'.repeat(74)}`);
console.log(`WILLISON RISK — long posts thin on first-hand evidence (worst ${TOP})`);
console.log(`${'─'.repeat(74)}`);
console.log(`  risk  words  read   exp/1k  hon/1k  scaf  auth  post`);
for (const r of [...rows].sort((a, b) => b.risk - a.risk).slice(0, TOP)) {
  console.log(`  ${String(r.risk).padStart(4)}  ${String(r.words).padStart(5)}  ${String(r.readMin + 'm').padStart(4)}   ${String(r.expPer1k).padStart(5)}   ${String(r.honPer1k).padStart(5)}  ${String(r.scaffold).padStart(4)}  ${String(r.authority).padStart(4)}  ${r.slug.slice(0, 40)}`);
}

console.log(`\n${'─'.repeat(74)}`);
console.log(`STRONGEST POSTS — most evidence of a human doing the work`);
console.log(`${'─'.repeat(74)}`);
for (const r of [...rows].sort((a, b) => b.proofPer1k - a.proofPer1k).slice(0, 5)) {
  console.log(`  proof ${String(r.proofPer1k).padStart(5)}/1k · ${String(r.words).padStart(5)}w · ${r.slug.slice(0, 46)}`);
}

if (VERBOSE) {
  console.log(`\n${'─'.repeat(74)}\nSAMPLES\n${'─'.repeat(74)}`);
  for (const r of [...rows].sort((a, b) => b.risk - a.risk).slice(0, 5)) {
    console.log(`\n${r.slug}  (risk ${r.risk})`);
    if (r.sExp.length) console.log(`   experience : ${r.sExp.join(' · ')}`);
    else console.log(`   experience : NONE — nothing shows the author used this`);
    if (r.sAuth.length) console.log(`   authority  : ${r.sAuth.join(' · ')}`);
    if (r.sScaf.length) console.log(`   scaffolding: ${r.sScaf.join(' · ')}`);
  }
}

console.log(`\n${'─'.repeat(74)}`);
console.log(`These are signals, not proof. A reference post can legitimately have no`);
console.log(`first-person content. Read the post before changing a word of it.`);
console.log(`${'─'.repeat(74)}\n`);
