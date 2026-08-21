#!/usr/bin/env node
/**
 * ai-writing-audit.mjs — audit blog prose against conorbronsdon/avoid-ai-writing (SKILL.md v3.25.0)
 *
 * Detect mode only. Reports per-post and aggregate. Never rewrites.
 * Scope: content/blog/*.md prose. Code, tables, shortcodes, HTML and URLs are excluded
 * from prose analysis per the skill's flag-don't-fix exemptions.
 *
 * Usage: node scripts/ai-writing-audit.mjs [--top N] [--post SLUG] [--verbose]
 */
import fs from 'node:fs';
import path from 'node:path';

const BLOG = path.join(process.cwd(), 'content', 'blog');
const args = process.argv.slice(2);
const TOP = Number((args.find(a => a.startsWith('--top=')) || '--top=15').split('=')[1]);
const ONLY = (args.find(a => a.startsWith('--post=')) || '').split('=')[1] || null;
const VERBOSE = args.includes('--verbose');

// ---------------------------------------------------------------- vocabulary
const TIER1A = ['delve','delving','delved','landscape','landscapes','tapestry','realm','realms','paradigm','paradigms','embark','embarking','embarked','beacon','testament to','robust','robustly','comprehensive','comprehensively','cutting-edge','leverage','leverages','leveraging','leveraged','pivotal','underscores','underscore','underscoring','meticulous','meticulously','seamless','seamlessly','game-changer','game-changing','hits different','hit differently','watershed moment','nestled','vibrant','thriving','showcasing','showcase','showcases','deep dive','dive into','diving into','unpack','unpacking','bustling','intricate','intricacies','complexities','ever-evolving','enduring','daunting','holistic','holistically','actionable','impactful','learnings','thought leader','thought leadership','best practices','at its core','synergy','synergies','interplay','symphony','load-bearing'];
const TIER1B = ['utilize','utilizes','utilizing','utilized','in order to','due to the fact that','serves as','serve as','boasts','boast','commence','ascertain','endeavor'];
const TIER2  = ['harness','harnessing','navigate','navigating','foster','fostering','elevate','elevating','unleash','unleashing','streamline','streamlining','streamlined','empower','empowering','empowers','bolster','bolstering','spearhead','spearheading','resonate','resonates','revolutionize','revolutionizes','facilitate','facilitates','facilitating','underpin','underpins','nuanced','crucial','crucially','multifaceted','ecosystem','ecosystems','myriad','plethora','encompass','encompasses','catalyze','reimagine','reimagining','galvanize','augment','cultivate','cultivating','illuminate','elucidate','juxtapose','paradigm-shifting','transformative','cornerstone','paramount','poised to','burgeoning','nascent','quintessential','overarching','underpinning','underpinnings'];
const TIER3  = ['significant','significantly','innovative','innovation','effective','effectively','dynamic','dynamics','scalable','scalability','compelling','unprecedented','exceptional','exceptionally','remarkable','remarkably','sophisticated','instrumental','world-class','state-of-the-art','best-in-class'];

// -------------------------------------------------------------- phrase rules
const PHRASE_RULES = [
  ['chatbot artifact',      /\b(I hope this helps|Certainly!|Absolutely!|Great question|Feel free to reach out|Let me know if you need anything|let's dive in|in this (?:article|post), we(?:'ll| will) explore)\b/gi],
  ['sycophantic tone',      /\b(Great question!|Excellent point!|You're absolutely right|that's a really insightful)\b/gi],
  ["\"let's\" construction",/\b(let'?s (?:explore|take a look|break this down|examine|dig in|get started|walk through))\b/gi],
  ['transition filler',     /(^|[.!?]\s+|\n\s*)(Moreover|Furthermore|Additionally|In conclusion|In summary|To summarize|At the end of the day|That being said)\b/g],
  ['"when it comes to"',    /\bwhen it comes to\b/gi],
  ['"in today\'s X"',       /\b(in today'?s\s+\w+|in an era where|in the (?:rapidly )?evolving world of)\b/gi],
  ['hollow intensifier',    /\b(genuinely|quite frankly|to be honest|let'?s be clear|it'?s worth noting that|truly)\b/gi],
  ['hedging',               /\b(perhaps|could potentially|it'?s important to note that|to be clear)\b/gi],
  ['hedge-stacked prediction',/\b(could potentially|may eventually|might ultimately|could ultimately|may potentially)\s+\w+/gi],
  ['vague attribution',     /\b(experts believe|studies show|research suggests|industry leaders agree|analysts agree|studies consistently show|independent testing confirms)\b/gi],
  ['copula avoidance',      /\b(serves as|serve as|boasts|presents a|represents a)\b/gi],
  ['significance inflation',/\b(watershed moment|marking a pivotal moment|a pivotal moment in the evolution)\b/gi],
  ['generic conclusion',    /\b(the future looks bright|only time will tell|one thing is certain|as we move forward)\b/gi],
  ['rhetorical q opener',   /(^|\n)\s*(?:#{1,6}\s*)?(But what does this mean|So why should you care|What'?s next\?|Why does this matter\?)/gi],
  ['infomercial hook',      /(^|[.!?]\s+|\n\s*)(The catch\?|The kicker\?|Here'?s the thing[.,]|But here'?s the kicker|The best part\?|Plot twist:|The result\?)/gi],
  ['emotional flatline',    /\b(what surprised me most|I was fascinated to discover|what struck me was|I was excited to learn|the most interesting part)\b/gi],
  ['lingering attention',   /\b(I keep coming back to|I can'?t stop thinking about|still thinking about this)\b/gi],
  ['narrated candor',       /\b(I want to be upfront|to be fully transparent|rather than bury this)\b/gi],
  ['reasoning-chain leak',  /\b(let me think step by step|here'?s my thought process|to approach this systematically|working through this logically)\b/gi],
  ['cutoff disclaimer',     /\b(as of my last update|I don'?t have access to real-time|based on available information)\b/gi],
  ['speculative opener',    /\b(imagine a world where|picture a future in which|envision a world where)\b/gi],
  ['false concession',      /\b(while [\w\s]{3,30} is impressive,|although [\w\s]{3,30} has made strides,)/gi],
  ['template "whether you\'re"',/\bwhether you'?re an? [\w\s-]{2,30} or an? [\w\s-]{2,30}\b/gi],
  ['"worth [verb]ing"',     /\bworth (?:reading|paying attention to|a look|exploring|checking out|your time)\b/gi],
  ['aphorism formula',      /\b(is the language of|is the currency of|the architecture of trust|is not a tool but)\b/gi],
  ['novelty inflation',     /\b(the failure mode nobody'?s naming|a problem nobody talks about|the insight everyone'?s missing|what nobody tells you about)\b/gi],
  ['numbered-list inflation',/\b(three key takeaways|five things to know|here are the top \w+)\b/gi],
  ['promotional language',  /\b(a vibrant hub|breathtaking|a thriving ecosystem)\b/gi],
  ['unfilled placeholder',  /(\[(?:Insert|Enter|Specify)[^\]]{2,40}\]|\b\d{4}-XX-XX\b|<!--\s*(?:todo|add|fill in|insert))/gi],
  ['chat citation leak',    /(citeturn\d|contentReference\[oaicite|oai_citation|\[attached_file:\d)/gi],
  ['AI utm param',          /utm_source=(?:chatgpt\.com|copilot\.com|openai|claude\.ai|perplexity\.ai)|referrer=grok\.com/gi],
];

// --------------------------------------------------------------- text prep
function strip(raw) {
  let t = raw;
  const cut = s => ' '.repeat(0);
  t = t.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');       // frontmatter
  t = t.replace(/```[\s\S]*?```/g, ' ');                      // fenced code
  t = t.replace(/`[^`\n]*`/g, ' ');                           // inline code
  t = t.replace(/\{\{[<%][\s\S]*?[>%]\}\}/g, ' ');            // hugo shortcodes
  t = t.replace(/<(?:img|figure|figcaption|div|span|table|iframe|br|hr)[^>]*>/gi, ' ');
  t = t.replace(/<\/(?:figure|div|span|table)>/gi, ' ');
  // ORDER MATTERS — link targets must go BEFORE bare URLs.
  // Fixed 2026-08-21 after Gate A caught it. Previously the bare-URL regex
  // ran first, and because \S+ is greedy it also ate the closing ")" of a
  // markdown link, leaving a dangling "](" for the link-target regex to
  // consume forward until the NEXT ")" anywhere in the document — swallowing
  // visible prose. Measured cost of the old order across these 74 posts:
  // 962 em dashes and 70,789 words silently dropped, which is why every
  // dash count produced before this fix was too low.
  t = t.replace(/\]\([^)]*\)/g, '] ');                        // link targets
  t = t.replace(/https?:\/\/\S+/g, ' ');                      // bare URLs
  return t;
}
function splitTables(t) {
  const lines = t.split(/\r?\n/);
  const prose = [], tables = [];
  for (const l of lines) (/^\s*\|/.test(l) ? tables : prose).push(l);
  return { prose: prose.join('\n'), tables: tables.join('\n') };
}
const words = s => (s.match(/[A-Za-z][A-Za-z'-]*/g) || []).length;

function countTerms(text, terms) {
  const hits = {};
  for (const term of terms) {
    const esc = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(term.includes(' ') || term.includes('-') ? `\\b${esc}\\b` : `\\b${esc}\\b`, 'gi');
    const m = text.match(re);
    if (m) hits[term] = m.length;
  }
  return hits;
}
const total = o => Object.values(o).reduce((a, b) => a + b, 0);

// ------------------------------------------------------------------ analyse
function analyse(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const fm = (raw.match(/^---\r?\n([\s\S]*?)\r?\n---/) || [])[1] || '';
  const body = strip(raw);
  const { prose, tables } = splitTables(body);
  const w = words(prose);
  if (w < 400) return null;

  const per1k = n => Math.round((n / (w / 1000)) * 10) / 10;

  // em dashes, with the list-item carve-out
  const proseLines = prose.split(/\r?\n/);
  let emProse = 0, emList = 0;
  for (const l of proseLines) {
    const n = (l.match(/—/g) || []).length;
    if (!n) continue;
    if (/^\s*[-*+]\s+(\*\*[^*]+\*\*|\[[^\]]+\])\s*—/.test(l)) { emList += n; continue; }
    emProse += n;
  }
  const emDoubleHyphen = (prose.match(/(?<=\s)--(?=\s)/g) || []).length;

  // bold
  const bold = (prose.match(/\*\*[^*\n]{1,120}\*\*/g) || []).length;

  // headings
  const headings = raw.split(/\r?\n/).filter(l => /^#{2,6}\s/.test(l));
  const hEmoji = headings.filter(h => /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/u.test(h)).length;
  const hEmDash = headings.filter(h => /—/.test(h)).length;
  const hTitleCase = headings.filter(h => {
    const txt = h.replace(/^#{2,6}\s*/, '').replace(/[^\w\s]/g, ' ').trim();
    const ws = txt.split(/\s+/).filter(x => x.length > 3);
    if (ws.length < 3) return false;
    return ws.filter(x => /^[A-Z]/.test(x)).length / ws.length > 0.8;
  }).length;

  // "it's not X — it's Y"
  const notXbutY = (prose.match(/\b(?:it'?s|this is|that'?s) not (?:about )?[^.!?\n]{3,60}[—,] (?:it'?s|but)\b/gi) || []).length;

  // rule of three: "a, b, and c" adjective triads
  const ruleOfThree = (prose.match(/\b\w+ly?, \w+, and \w+\b/g) || []).length;

  // list-label periods:  - **Label.** gloss
  const labelPeriod = (raw.match(/^\s*[-*+]\s+\*\*[^*\n]{2,40}\.\*\*\s+\S/gm) || []).length;

  // bare-NP bullet runs (5+ consecutive short verbless bullets)
  const bulletLines = raw.split(/\r?\n/);
  let run = 0, bareNP = 0;
  const VERB = /\b(is|are|was|were|has|have|had|can|will|does|do|makes?|lets?|gives?|runs?|uses?|shows?|adds?|needs?|keeps?|works?|takes?|turns?|sends?|gets?)\b/i;
  for (const l of bulletLines) {
    const m = l.match(/^\s*[-*+]\s+(.{1,80})$/);
    if (m && !VERB.test(m[1]) && m[1].split(/\s+/).length <= 6) { run++; if (run >= 5) bareNP++; }
    else run = 0;
  }

  // hashtags — exclude Hugo heading anchors {#id} and in-page links (#id)
  const hashSrc = prose.replace(/\{#[\w-]+\}/g, ' ').replace(/\(#[\w-]+\)/g, ' ').replace(/(?:^|\s)#[\w-]+-[\w-]+/g, ' ');
  let hashtags = (hashSrc.match(/(?<![\w#])#[A-Za-z][A-Za-z0-9_]{2,}/g) || []).filter(h => !/^#(?:include|define|ifdef)$/i.test(h)).length;

  // paragraph-length uniformity (coefficient of variation)
  const paras = prose.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 60 && !/^[-*+|>#]/.test(p));
  const lens = paras.map(p => words(p));
  const mean = lens.reduce((a, b) => a + b, 0) / (lens.length || 1);
  const sd = Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / (lens.length || 1));
  const cv = mean ? Math.round((sd / mean) * 100) / 100 : 0;

  const t1a = countTerms(prose, TIER1A);
  const t1b = countTerms(prose, TIER1B);
  const t2  = countTerms(prose, TIER2);
  const t3  = countTerms(prose, TIER3);

  // tier2 clusters: 2+ distinct tier-2 words in one paragraph
  let t2Clusters = 0;
  for (const p of paras) {
    const distinct = new Set(Object.keys(countTerms(p, TIER2)));
    if (distinct.size >= 2) t2Clusters++;
  }

  const phrases = {};
  for (const [name, re] of PHRASE_RULES) {
    const m = prose.match(re);
    if (m) phrases[name] = m.length;
  }

  return {
    slug: path.basename(file, '.md'), words: w,
    emProse, emList, emDoubleHyphen, emPer1k: per1k(emProse),
    bold, boldPer1k: per1k(bold),
    headings: headings.length, hEmoji, hEmDash, hTitleCase,
    t1a, t1aN: total(t1a), t1b, t1bN: total(t1b),
    t2, t2N: total(t2), t2Clusters, t3, t3N: total(t3), t3Pct: Math.round((total(t3) / w) * 1000) / 10,
    notXbutY, ruleOfThree, labelPeriod, bareNP, hashtags, cv, paras: paras.length,
    phrases, phraseN: total(phrases),
    tableRows: tables.split(/\r?\n/).filter(Boolean).length,
  };
}

// --------------------------------------------------------------------- run
const files = fs.readdirSync(BLOG).filter(f => f.endsWith('.md') && f !== '_index.md')
  .filter(f => !ONLY || f.includes(ONLY))
  .map(f => path.join(BLOG, f));

const rows = files.map(analyse).filter(Boolean);

// severity score — 1A/phrases are authorship evidence; 1B is weighted like tier2 per the skill
const score = r => r.t1aN * 3 + r.phraseN * 3 + r.t2Clusters * 2 + r.t1bN * 1 + r.t2N * 0.5
  + r.notXbutY * 2 + r.emProse * 0.15 + Math.max(0, r.boldPer1k - 8) * 0.5 + r.hEmoji * 0.5 + r.hTitleCase * 0.5;
rows.forEach(r => r.score = Math.round(score(r) * 10) / 10);
rows.sort((a, b) => b.score - a.score);

const agg = (k) => rows.reduce((a, r) => a + r[k], 0);
const mergeCounts = (k) => {
  const out = {};
  for (const r of rows) for (const [term, n] of Object.entries(r[k])) out[term] = (out[term] || 0) + n;
  return Object.entries(out).sort((a, b) => b[1] - a[1]);
};

console.log('='.repeat(78));
console.log('AI-WRITING AUDIT — conorbronsdon/avoid-ai-writing v3.25.0 (detect mode)');
console.log(`Scope: content/blog/ — ${rows.length} posts, ${agg('words').toLocaleString()} words of prose`);
console.log('Excluded from prose analysis: code, tables, shortcodes, HTML, URLs');
console.log('='.repeat(78));

console.log('\n--- STYLE SIGNALS (Tier 1A + pattern categories) ---');
console.log('NOT authorship evidence. The standard\'s own human-control corpus measured its');
console.log('112-word table at 0.9x lift — it fires slightly MORE on human writing. Treat every');
console.log('number below as writing advice. Rhythm is the authorship signal: rhythm-audit.mjs');
console.log(`Tier 1A "AI frequency marker" words : ${agg('t1aN')}  (${(agg('t1aN')/(agg('words')/1000)).toFixed(2)} per 1k words)`);
console.log(`Pattern-category phrase hits        : ${agg('phraseN')}`);
console.log(`"It's not X — it's Y" constructions  : ${agg('notXbutY')}`);
console.log(`Tier 2 clusters (2+ in a paragraph) : ${agg('t2Clusters')}`);

console.log('\n--- CLARITY / STYLE (NOT authorship evidence per the skill) ---');
console.log(`Tier 1B clarity words               : ${agg('t1bN')}`);
console.log(`Tier 2 words (total)                : ${agg('t2N')}`);
console.log(`Tier 3 words                        : ${agg('t3N')}  (${((agg('t3N')/agg('words'))*100).toFixed(2)}% of prose — flag threshold 3%)`);

console.log('\n--- FORMATTING (style only — see note below) ---');
console.log(`Em dashes in prose                  : ${agg('emProse')}  (${(agg('emProse')/(agg('words')/1000)).toFixed(1)} per 1k)`);
console.log('  ^ INVERTED SIGNAL. Measured 9.9% human vs 1.9% machine (0.2x lift) — an em dash');
console.log('    is evidence of HUMAN authorship. Do not strip these to look less AI-written.');
console.log('    House rule is paragraphs with 3+ dashes only. See blog-voice-guide.md Rule 2.');
console.log(`Em dashes carved out (list items)   : ${agg('emList')}`);
console.log(`"--" double-hyphen substitutes       : ${agg('emDoubleHyphen')}`);
console.log(`Bold runs                           : ${agg('bold')}  (${(agg('bold')/(agg('words')/1000)).toFixed(1)} per 1k)`);
console.log(`Headings with emoji                 : ${agg('hEmoji')} / ${agg('headings')}`);
console.log(`Headings with em dash               : ${agg('hEmDash')} / ${agg('headings')}`);
console.log(`Title Case headings                 : ${agg('hTitleCase')} / ${agg('headings')}`);
console.log(`Bold-label-with-period bullets      : ${agg('labelPeriod')}`);
console.log(`Bare-noun-phrase bullet runs (5+)   : ${agg('bareNP')}`);
console.log(`Rule-of-three triads                : ${agg('ruleOfThree')}`);
console.log(`Hashtag stuffing (6+ per post)      : ${rows.filter(r => r.hashtags >= 6).length} posts`);

const t1aTop = mergeCounts('t1a');
if (t1aTop.length) {
  console.log('\n--- TIER 1A HITS (always replace — the strongest word-level signal) ---');
  for (const [t, n] of t1aTop.slice(0, 30)) console.log(`  ${String(n).padStart(4)}  ${t}`);
}
const phTop = Object.entries(rows.reduce((a, r) => { for (const [k, v] of Object.entries(r.phrases)) a[k] = (a[k] || 0) + v; return a; }, {})).sort((a, b) => b[1] - a[1]);
if (phTop.length) {
  console.log('\n--- PATTERN-CATEGORY HITS ---');
  for (const [t, n] of phTop) console.log(`  ${String(n).padStart(4)}  ${t}`);
}
const t1bTop = mergeCounts('t1b');
if (t1bTop.length) {
  console.log('\n--- TIER 1B (clarity only — explicitly NOT authorship evidence) ---');
  for (const [t, n] of t1bTop.slice(0, 15)) console.log(`  ${String(n).padStart(4)}  ${t}`);
}

console.log(`\n--- WORST ${TOP} POSTS BY WEIGHTED SCORE ---`);
console.log('score  1A  phr  clu  em/1k  bold/1k  cv    post');
for (const r of rows.slice(0, TOP)) {
  console.log(
    String(r.score).padStart(5) + '  ' +
    String(r.t1aN).padStart(2) + '  ' + String(r.phraseN).padStart(3) + '  ' +
    String(r.t2Clusters).padStart(3) + '  ' + String(r.emPer1k).padStart(5) + '  ' +
    String(r.boldPer1k).padStart(7) + '  ' + String(r.cv).padStart(4) + '  ' + r.slug.slice(0, 46)
  );
}

if (VERBOSE) {
  console.log('\n--- PER-POST DETAIL ---');
  for (const r of rows) {
    if (!r.t1aN && !r.phraseN) continue;
    console.log(`\n${r.slug}  (${r.words} words, score ${r.score})`);
    if (r.t1aN) console.log('   1A: ' + Object.entries(r.t1a).map(([k, v]) => `${k}×${v}`).join(', '));
    if (r.phraseN) console.log('   pattern: ' + Object.entries(r.phrases).map(([k, v]) => `${k}×${v}`).join(', '));
  }
}

console.log('\n' + '='.repeat(78));
console.log('Reminder from the skill: "signals, not proof". These patterns also fire on');
console.log('second-language writers, deadline-pressed humans, and technical genres.');
console.log('='.repeat(78));
