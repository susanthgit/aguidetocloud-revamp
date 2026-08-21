#!/usr/bin/env node
/**
 * debold-propose.mjs — measure a de-bolding RULE SET before applying it.
 *
 * Classifies every **bold** run in content/blog/*.md into keep / strip buckets,
 * reports the impact, and prints samples so the rules can be judged before any edit.
 *
 * Usage:
 *   node scripts/debold-propose.mjs                  # impact across all posts
 *   node scripts/debold-propose.mjs --post=SLUG      # one post
 *   node scripts/debold-propose.mjs --post=SLUG --samples   # show examples per bucket
 *   node scripts/debold-propose.mjs --post=SLUG --apply     # rewrite the file
 */
import fs from 'node:fs';
import path from 'node:path';

const BLOG = path.join(process.cwd(), 'content', 'blog');
const args = process.argv.slice(2);
const ONLY = (args.find(a => a.startsWith('--post=')) || '').split('=')[1] || null;
const APPLY = args.includes('--apply');
const SAMPLES = args.includes('--samples');
const CAP = Number((args.find(a => a.startsWith('--cap=')) || '--cap=0').split('=')[1]) || 0;

// A bold run is protected if the LINE it sits on is protected.
function lineProtected(line) {
  if (/^\s*\|/.test(line)) return 'table';                       // table row
  if (/^\s*#{1,6}\s/.test(line)) return 'heading';               // heading
  if (/\{\{[<%]/.test(line)) return 'shortcode';                 // callout / tip / warn
  return null;
}

// Decide a single bold run's fate given its line and position.
function classify(inner, line, idxInLine, seenTerms) {
  const norm = inner.toLowerCase().replace(/[*_`\[\]()]/g, '').replace(/\s+/g, ' ').trim();
  const wordCount = norm.split(/\s+/).filter(Boolean).length;

  // KEEP — structural lead-in: the bold is the first thing on the line (after any
  // blockquote marker, list bullet or decorative emoji) and prose follows it on the
  // same line. This is the notebook's **Why it matters:** / **Both can run at once.**
  // device — a label, not prose emphasis. Labels never consume the emphasis budget.
  const before = line.slice(0, idxInLine);
  const after = line.slice(idxInLine).replace(/^\*\*[^*]*\*\*/, '');
  const atLineStart = /^\s*(?:>\s*)*(?:[-*+]\s+|\d+\.\s+)?[^\w*]*$/u.test(before);
  if (atLineStart && /\S/.test(after)) return { verdict: 'keep', why: 'lead-in label' };

  // KEEP — a link. Bolding a link is a link-emphasis choice, not prose emphasis.
  if (/^\[.*\]\(.*\)$/.test(inner.trim())) return { verdict: 'keep', why: 'bolded link' };

  // STRIP — long run: emphasis on a clause or sentence rather than a term.
  if (wordCount > 5) return { verdict: 'strip', why: 'clause-length (>5 words)' };

  // STRIP — repeat mention: the same term was already bolded earlier in this post.
  if (seenTerms.has(norm)) return { verdict: 'strip', why: 'repeat mention' };

  // KEEP — first mention of a scannable term.
  seenTerms.add(norm);
  return { verdict: 'keep', why: 'first mention' };
}

function processFile(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const fmEnd = raw.indexOf('\n---', 4);
  const head = fmEnd > 0 ? raw.slice(0, fmEnd + 4) : '';
  const bodyStart = head.length;
  const body = raw.slice(bodyStart);

  // mask fenced code so we never touch it
  const fences = [];
  const masked = body.replace(/```[\s\S]*?```/g, m => {
    fences.push(m); return `\u0000FENCE${fences.length - 1}\u0000`;
  });

  const lines = masked.split(/\r?\n/);
  const seenTerms = new Set();
  const stats = { total: 0, keep: 0, strip: 0, byWhy: {}, samples: { strip: [], keep: [] } };

  const out = lines.map(line => {
    const prot = lineProtected(line);
    let keptOnLine = 0;
    return line.replace(/\*\*([^*\n]{1,160})\*\*/g, (m, inner, idx) => {
      stats.total++;
      if (prot) {
        stats.keep++;
        stats.byWhy[prot] = (stats.byWhy[prot] || 0) + 1;
        return m;
      }
      let { verdict, why } = classify(inner, line, idx, seenTerms);
      // density cap: at most CAP *emphasis* runs survive per line.
      // Structural lead-in labels and bolded links don't consume the budget.
      const structural = why === 'lead-in label' || why === 'bolded link';
      if (verdict === 'keep' && CAP > 0 && !structural) {
        if (keptOnLine >= CAP) { verdict = 'strip'; why = `over cap (>${CAP} per line)`; }
        else keptOnLine++;
      }
      stats[verdict]++;
      stats.byWhy[why] = (stats.byWhy[why] || 0) + 1;
      if (stats.samples[verdict].length < 8) {
        stats.samples[verdict].push({ inner, why, line: line.trim().slice(0, 130) });
      }
      return verdict === 'strip' ? inner : m;
    });
  }).join('\n');

  const restored = out.replace(/\u0000FENCE(\d+)\u0000/g, (_, i) => fences[Number(i)]);
  return { raw, next: head + restored, stats, slug: path.basename(file, '.md'), file };
}

const files = fs.readdirSync(BLOG)
  .filter(f => f.endsWith('.md') && f !== '_index.md')
  .filter(f => !ONLY || f.includes(ONLY))
  .map(f => path.join(BLOG, f));

let T = 0, K = 0, S = 0;
const perPost = [];
const whyAll = {};

for (const f of files) {
  const r = processFile(f);
  T += r.stats.total; K += r.stats.keep; S += r.stats.strip;
  for (const [k, v] of Object.entries(r.stats.byWhy)) whyAll[k] = (whyAll[k] || 0) + v;
  perPost.push(r);
  if (APPLY && r.stats.strip > 0) fs.writeFileSync(r.file, r.next, 'utf8');
}

console.log('='.repeat(72));
console.log(`DE-BOLD PROPOSAL — ${files.length} post(s)${APPLY ? '  [APPLIED]' : '  [dry run]'}`);
console.log('='.repeat(72));
console.log(`Bold runs found : ${T}`);
console.log(`  keep          : ${K}  (${((K / T) * 100).toFixed(1)}%)`);
console.log(`  strip         : ${S}  (${((S / T) * 100).toFixed(1)}%)`);
console.log('\nBreakdown by reason:');
for (const [k, v] of Object.entries(whyAll).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(v).padStart(5)}  ${k}`);
}

if (ONLY && SAMPLES) {
  const r = perPost[0];
  console.log('\n--- SAMPLES: WOULD STRIP ---');
  for (const s of r.stats.samples.strip) console.log(`  [${s.why}] **${s.inner}**\n      …${s.line}`);
  console.log('\n--- SAMPLES: WOULD KEEP ---');
  for (const s of r.stats.samples.keep) console.log(`  [${s.why}] **${s.inner}**\n      …${s.line}`);
}

if (!ONLY) {
  console.log('\n--- PER-POST (worst 15 by current density) ---');
  const withWords = perPost.map(r => {
    const w = (r.raw.match(/[A-Za-z][A-Za-z'-]*/g) || []).length;
    return { slug: r.slug, w, before: r.stats.total, after: r.stats.keep,
      b4: Math.round((r.stats.total / (w / 1000)) * 10) / 10,
      af: Math.round((r.stats.keep / (w / 1000)) * 10) / 10 };
  }).filter(x => x.w > 400).sort((a, b) => b.b4 - a.b4).slice(0, 15);
  console.log('before/1k  after/1k   bold before → after   post');
  for (const x of withWords) {
    console.log(`${String(x.b4).padStart(8)}  ${String(x.af).padStart(8)}   ${String(x.before).padStart(4)} → ${String(x.after).padStart(4)}          ${x.slug.slice(0, 44)}`);
  }
}
