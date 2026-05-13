/**
 * AGTC Section OG Generator — S-A "Magazine Editorial" (V3-section system)
 *
 * Generates 1200×630 JPG OG covers for the 10 section landings +
 * the mind-maps INDEX page (which lives at /images/og/mind-maps.jpg,
 * NOT inside /sections/ — see § 6.14 of og-image-system.md).
 *
 * Design — locked 13 May 2026 PM NZST:
 *   - BG: warm white #FAFAF8 (matches blog B2)
 *   - Eyebrow (uppercase, tracked, indigo)
 *   - Section name CENTRED (Inter ExtraBold, adaptive 80-180 px)
 *   - Indigo accent line
 *   - Tagline (Inter Regular, 24 px, #525252)
 *   - Bottom-left: tiny lotus + wordmark inline (matches blog B2)
 *   - Bottom-right: small section glyph (Lucide, ~56 px, muted)
 *
 * Pipeline: satori → @resvg/resvg-js → sharp (mozjpeg 85, 4:4:4)
 * SLA-isolated: NEVER part of hugo build (og-image-system.md § 6.8).
 */

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT  = path.resolve(__dirname, '..', '..');
const CONTENT    = path.join(REPO_ROOT, 'content');
const OUT_DIR    = path.join(REPO_ROOT, 'static', 'images', 'og');
const FONT_DIR   = path.join(__dirname, 'fonts');
const CACHE_FILE = path.join(__dirname, '.og-section-cache.json');
const LUCIDE_DIR = path.join(__dirname, 'node_modules', 'lucide-static', 'icons');

const DRY_RUN   = process.argv.includes('--dry-run');
const FORCE_ALL = process.argv.includes('--force');

// ──────────────────────── BRAND TOKENS ────────────────────────
const TOKENS = {
  bgLight:      '#FAFAF8',
  textPrimary:  '#1A1A1A',
  textTertiary: '#525252',
  textMuted:    '#737373',
  accent:       '#6366F1',
};
const LOTUS_INK = `data:image/png;base64,${fs.readFileSync(path.join(FONT_DIR, 'lotus-ink.png')).toString('base64')}`;

// ──────────────────────── SECTION REGISTRY ────────────────────────
const SECTIONS = [
  { slug: 'homepage',       file: '_index.md',                  ogTitle: 'A Guide to Cloud & AI',  eyebrow: 'Free · For IT Pros',     icon: 'home',          outDir: 'sections' },
  { slug: 'about',          file: 'about.md',                   ogTitle: 'About',                  eyebrow: 'Meet · The Maker',       icon: 'user',          outDir: 'sections' },
  { slug: 'ai-hub',         file: 'ai-hub/_index.md',           ogTitle: 'AI Hub',                 eyebrow: 'Hands-on · AI',          icon: 'sparkles',      outDir: 'sections' },
  { slug: 'blog',           file: 'blog/_index.md',             ogTitle: 'Blog',                   eyebrow: 'Read · Learn',           icon: 'book-open',     outDir: 'sections' },
  { slug: 'certifications', file: 'certifications/_index.md',   ogTitle: 'Certifications',         eyebrow: 'Prepare · Pass',         icon: 'graduation-cap',outDir: 'sections' },
  { slug: 'cloud-labs',     file: 'cloud-labs/_index.md',       ogTitle: 'Cloud Labs',             eyebrow: 'Practice · Azure',       icon: 'flask-conical', outDir: 'sections' },
  { slug: 'exam-qa',        file: 'exam-qa/_index.md',          ogTitle: 'Exam Q&A',               eyebrow: 'Practice · Pass',        icon: 'help-circle',   outDir: 'sections' },
  { slug: 'free-tools',     file: 'free-tools/_index.md',       ogTitle: 'Cloud & AI Toolkit',     eyebrow: 'Free · No Sign-up',      icon: 'wrench',        outDir: 'sections' },
  { slug: 'interview-prep', file: 'interview-prep/_index.md',   ogTitle: 'Interview Prep',         eyebrow: 'Land · The Role',        icon: 'briefcase',     outDir: 'sections' },
  { slug: 'music',          file: 'music/_index.md',            ogTitle: 'Study Music',            eyebrow: 'Focus · Flow',           icon: 'music',         outDir: 'sections' },
  // hidden 11th file — mind-maps INDEX (lives at top of og/, not under sections/)
  { slug: 'mind-maps',      file: 'mind-maps/_index.md',        ogTitle: 'Mind Maps',              eyebrow: 'Visual · Branded',       icon: 'git-branch',    outDir: '' },
];

// ──────────────────────── FRONTMATTER PARSING ────────────────────────
function loadDescription(mdPath) {
  if (!fs.existsSync(mdPath)) return null;
  const text = fs.readFileSync(mdPath, 'utf8');
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const fm = m[1];
  const dm = fm.match(/^description\s*:\s*"([^"]+)"\s*$/m) || fm.match(/^description\s*:\s*'([^']+)'\s*$/m);
  return dm ? dm[1] : null;
}

// ──────────────────────── LUCIDE ICON ────────────────────────
const ICON_CACHE = new Map();
async function lucideIconDataUri(iconName, sizePx, stroke, strokeWidth = 1.6) {
  let resolved = iconName;
  if (!fs.existsSync(path.join(LUCIDE_DIR, `${resolved}.svg`))) resolved = 'circle';
  const key = `${resolved}|${sizePx}|${stroke}|${strokeWidth}`;
  if (ICON_CACHE.has(key)) return ICON_CACHE.get(key);
  const rawSvg = fs.readFileSync(path.join(LUCIDE_DIR, `${resolved}.svg`), 'utf8');
  const inner = (rawSvg.match(/<svg[^>]*>([\s\S]*)<\/svg>/) || [])[1] || '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${sizePx}" height="${sizePx}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  const pngBuf = await sharp(Buffer.from(svg)).png().toBuffer();
  const uri = `data:image/png;base64,${pngBuf.toString('base64')}`;
  ICON_CACHE.set(key, uri);
  return uri;
}

// ──────────────────────── ADAPTIVE SIZING ────────────────────────
function sectionHeroSize(text) {
  const n = text.length;
  if (n <= 5)  return 180;
  if (n <= 8)  return 156;
  if (n <= 14) return 124;
  if (n <= 20) return 100;
  if (n <= 26) return 84;
  return 72;
}

// ──────────────────────── S-A LAYOUT (LOCKED) ────────────────────────
function layoutS_A({ name, tagline, iconUri, eyebrow }) {
  const heroPx = sectionHeroSize(name);
  return {
    type: 'div',
    props: {
      style: {
        width: '1200px', height: '630px',
        background: TOKENS.bgLight,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Inter',
        position: 'relative',
        padding: '48px 80px 96px 80px',
      },
      children: [
        { type: 'div', props: { style: { fontSize: '18px', fontWeight: 700, color: TOKENS.accent, letterSpacing: '5px', marginBottom: '24px' }, children: eyebrow.toUpperCase() } },
        { type: 'div', props: { style: { fontSize: `${heroPx}px`, fontWeight: 800, color: TOKENS.textPrimary, letterSpacing: '-2px', lineHeight: 0.98, textAlign: 'center', maxWidth: '1040px' }, children: name } },
        { type: 'div', props: { style: { width: '72px', height: '5px', background: TOKENS.accent, borderRadius: '3px', margin: '28px 0 24px 0' } } },
        { type: 'div', props: { style: { fontSize: '24px', fontWeight: 400, color: TOKENS.textTertiary, textAlign: 'center', lineHeight: 1.35, maxWidth: '880px' }, children: tagline } },
        {
          type: 'div',
          props: {
            style: { position: 'absolute', bottom: '32px', left: '80px', display: 'flex', alignItems: 'center', gap: '12px' },
            children: [
              { type: 'img', props: { src: LOTUS_INK, width: 28, height: 28, style: { display: 'block' } } },
              { type: 'div', props: { style: { fontSize: '20px', fontWeight: 600, color: TOKENS.textPrimary, letterSpacing: '0.3px' }, children: 'aguidetocloud.com' } },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: { position: 'absolute', bottom: '28px', right: '80px', display: 'flex', opacity: 0.55 },
            children: [{ type: 'img', props: { src: iconUri, width: 56, height: 56, style: { display: 'block' } } }],
          },
        },
      ],
    },
  };
}

// ──────────────────────── FONT LOADER ────────────────────────
function loadFonts() {
  return [
    { name: 'Inter', data: fs.readFileSync(path.join(FONT_DIR, 'Inter-Regular.ttf')),   weight: 400, style: 'normal' },
    { name: 'Inter', data: fs.readFileSync(path.join(FONT_DIR, 'Inter-SemiBold.ttf')),  weight: 600, style: 'normal' },
    { name: 'Inter', data: fs.readFileSync(path.join(FONT_DIR, 'Inter-Bold.ttf')),      weight: 700, style: 'normal' },
    { name: 'Inter', data: fs.readFileSync(path.join(FONT_DIR, 'Inter-ExtraBold.ttf')), weight: 800, style: 'normal' },
  ];
}

// ──────────────────────── RENDERER ────────────────────────
async function renderJpg(node, outPath) {
  const fonts = loadFonts();
  const svg = await satori(node, { width: 1200, height: 630, fonts });
  const pngBuf = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  const jpgBuf = await sharp(pngBuf)
    .jpeg({ quality: 85, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toBuffer();
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, jpgBuf);
  return jpgBuf.length;
}

// ──────────────────────── HASH CACHE ────────────────────────
function loadCache() { try { return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); } catch { return {}; } }
function saveCache(c) { fs.writeFileSync(CACHE_FILE, JSON.stringify(c, null, 2) + '\n'); }
function hashOf(obj) { return crypto.createHash('sha256').update(JSON.stringify(obj)).digest('hex').slice(0, 16); }

// ──────────────────────── MAIN ────────────────────────
async function main() {
  const cache = FORCE_ALL ? {} : loadCache();

  console.log(`AGTC section OG generator — S-A Magazine Editorial · V3-section`);
  console.log(`Sections: ${SECTIONS.length} · Output base: ${path.relative(REPO_ROOT, OUT_DIR)}`);
  if (DRY_RUN) console.log('DRY RUN — no files will be written.');
  console.log('');

  let rendered = 0, skipped = 0, missing = 0;
  const writtenPaths = [];
  const t0 = Date.now();

  for (const s of SECTIONS) {
    const tagline = loadDescription(path.join(CONTENT, s.file));
    if (!tagline) {
      console.log(`  WARN  ${s.slug.padEnd(18)}  no description in ${s.file} — skipping`);
      missing++;
      continue;
    }

    const outPath = s.outDir
      ? path.join(OUT_DIR, s.outDir, `${s.slug}.jpg`)
      : path.join(OUT_DIR, `${s.slug}.jpg`);

    const key = hashOf({ ogTitle: s.ogTitle, eyebrow: s.eyebrow, icon: s.icon, tagline });
    if (!FORCE_ALL && cache[s.slug] === key && fs.existsSync(outPath)) {
      skipped++;
      continue;
    }
    if (DRY_RUN) {
      console.log(`  ->  ${s.slug.padEnd(18)}  [${s.icon.padEnd(15)}]  "${s.ogTitle}"`);
      rendered++;
      continue;
    }

    const iconUri = await lucideIconDataUri(s.icon, 256, '#737373', 1.4);
    const node = layoutS_A({ name: s.ogTitle, tagline, iconUri, eyebrow: s.eyebrow });
    const bytes = await renderJpg(node, outPath);
    cache[s.slug] = key;
    writtenPaths.push(outPath);
    const relOut = path.relative(REPO_ROOT, outPath).replace(/\\/g, '/');
    console.log(`  OK    ${s.slug.padEnd(18)}  [${s.icon.padEnd(15)}]  ${(bytes / 1024).toFixed(0)} KB  ->  ${relOut}`);
    rendered++;
  }

  if (!DRY_RUN) saveCache(cache);
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n${rendered} rendered · ${skipped} cached · ${missing} missing  in ${elapsed}s`);

  if (writtenPaths.length > 0) {
    const relPaths = writtenPaths.map(p => path.relative(REPO_ROOT, p).replace(/\\/g, '/'));
    fs.writeFileSync(path.join(__dirname, '.last-run-paths.txt'), relPaths.join('\n') + '\n');
    console.log(`Wrote ${relPaths.length} file path(s) to .last-run-paths.txt for explicit git add.`);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
