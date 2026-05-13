/**
 * AGTC Cert OG Generator — V3 dark · family-band — handles BOTH:
 *
 *   --mode=study     reads content/cert-tracker/*.md           subtitle "STUDY GUIDE"
 *                    writes static/images/og/certs/<slug>.jpg
 *   --mode=practice  reads ../../guided/src/content/certs/*.toml (READ-ONLY)
 *                    filtered to status == "live"               subtitle "PRACTICE EXAM"
 *                    writes static/images/og/practice/<slug>.jpg
 *
 * Pipeline: satori → SVG → @resvg/resvg-js → PNG buffer → sharp (mozjpeg JPG)
 * Format:   JPG @ q=85 + mozjpeg + 4:4:4 chroma + stripped metadata
 *
 * SLA-isolated per og-image-system.md § 6.8.
 */

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import matter from 'gray-matter';
import TOML from '@iarna/toml';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT  = path.resolve(__dirname, '..', '..');
const FONT_DIR   = path.join(__dirname, 'fonts');

const HUGO_CERT_TRACKER_DIR = path.join(REPO_ROOT, 'content', 'cert-tracker');
const GUIDED_CERTS_DIR      = path.resolve(REPO_ROOT, '..', 'guided', 'src', 'content', 'certs');

// ---------- CLI flags ----------
const MODE       = (process.argv.find(a => a.startsWith('--mode='))?.split('=')[1] || 'study').toLowerCase();
const DRY_RUN    = process.argv.includes('--dry-run');
const FORCE_ALL  = process.argv.includes('--force');

if (!['study', 'practice'].includes(MODE)) {
  console.error(`Unknown mode: ${MODE}. Use --mode=study or --mode=practice.`);
  process.exit(1);
}

const MODE_CONFIG = {
  study: {
    label:    'STUDY GUIDE',
    subtitle: 'STUDY GUIDE',
    outDir:   path.join(REPO_ROOT, 'static', 'images', 'og', 'certs'),
    cacheKey: '.og-cert-cache.json',
  },
  practice: {
    label:    'PRACTICE EXAM',
    subtitle: 'PRACTICE EXAM',
    outDir:   path.join(REPO_ROOT, 'static', 'images', 'og', 'practice'),
    cacheKey: '.og-practice-cache.json',
  },
};

const CFG       = MODE_CONFIG[MODE];
const CACHE_FILE = path.join(__dirname, CFG.cacheKey);

// ---------- Brand tokens (Zen design system) ----------
const TOKENS = {
  textPrimary:   '#1A1A1A',
  textSecondary: '#404040',
  textTertiary:  '#737373',
  accent:        '#6366F1',
};

const DARK_BG       = '#0F0F10';
const DARK_HERO     = '#FAFAFA';
const DARK_SUBTITLE = '#A3A3A3';

// ---------- Family palette (V3 locked) ----------
const FAMILY_PALETTE = {
  AZ:      '#FFD9C7',   // peach
  MS:      '#F9C4D2',   // pink
  AI:      '#E1D7F0',   // lavender
  SC:      '#CFD4F0',   // periwinkle
  MB:      '#C9E4DD',   // pale teal
  DEFAULT: '#EEF2FF',   // neutral indigo-tint (non-MS vendors)
};

function familyFromCode(examCode) {
  if (!examCode) return 'DEFAULT';
  const m = String(examCode).toUpperCase().match(/^([A-Z]+)/);
  if (!m) return 'DEFAULT';
  const prefix = m[1];
  if (prefix === 'AZ') return 'AZ';
  if (['MS', 'MD', 'PL'].includes(prefix)) return 'MS';
  if (['AI', 'DP', 'AB'].includes(prefix)) return 'AI';
  if (prefix === 'SC') return 'SC';
  if (prefix === 'MB') return 'MB';
  return 'DEFAULT';
}

// ---------- Adaptive font sizing for cert code hero ----------
function heroFontSize(text) {
  const len = text.length;
  if (len <= 6)  return 240;
  if (len <= 10) return 180;
  if (len <= 16) return 130;
  if (len <= 28) return 92;
  return 72;
}

// ---------- V3 cert layout (dark BG + family-band) ----------
const LOTUS_INK_B64 = `data:image/png;base64,${fs.readFileSync(path.join(FONT_DIR, 'lotus-ink.png')).toString('base64')}`;

function layoutV3({ hero, subtitle, family }) {
  const band   = FAMILY_PALETTE[family] ?? FAMILY_PALETTE.DEFAULT;
  const heroPx = heroFontSize(hero);
  return {
    type: 'div',
    props: {
      style: {
        width: '1200px', height: '630px',
        background: DARK_BG,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        fontFamily: 'Inter',
        position: 'relative',
        padding: '64px 96px',
      },
      children: [
        // Hero — giant cert code
        {
          type: 'div',
          props: {
            style: {
              fontSize: `${heroPx}px`,
              fontWeight: 800,
              color: DARK_HERO,
              letterSpacing: '-2px',
              lineHeight: 1.05,
              textAlign: 'center',
              maxWidth: '1008px',
            },
            children: hero,
          },
        },
        // Indigo accent line
        {
          type: 'div',
          props: {
            style: {
              width: '80px', height: '6px',
              background: TOKENS.accent,
              margin: '32px 0 28px 0',
              borderRadius: '3px',
            },
          },
        },
        // Subtitle (STUDY GUIDE / PRACTICE EXAM)
        {
          type: 'div',
          props: {
            style: {
              fontSize: '36px',
              fontWeight: 700,
              color: DARK_SUBTITLE,
              letterSpacing: '4px',
              textAlign: 'center',
            },
            children: subtitle,
          },
        },
        // Family-coloured band along bottom
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              bottom: 0, left: 0,
              width: '1200px', height: '96px',
              background: band,
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '64px',
              paddingRight: '48px',
              justifyContent: 'space-between',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { fontSize: '22px', fontWeight: 600, color: TOKENS.textPrimary, letterSpacing: '0.5px' },
                  children: 'aguidetocloud.com',
                },
              },
              {
                type: 'img',
                props: {
                  src: LOTUS_INK_B64,
                  width: 72, height: 72,
                  style: { display: 'block' },
                },
              },
            ],
          },
        },
      ],
    },
  };
}

// ---------- Font loader ----------
function loadFonts() {
  return [
    { name: 'Inter', data: fs.readFileSync(path.join(FONT_DIR, 'Inter-Regular.ttf')),   weight: 400, style: 'normal' },
    { name: 'Inter', data: fs.readFileSync(path.join(FONT_DIR, 'Inter-SemiBold.ttf')),  weight: 600, style: 'normal' },
    { name: 'Inter', data: fs.readFileSync(path.join(FONT_DIR, 'Inter-Bold.ttf')),      weight: 700, style: 'normal' },
    { name: 'Inter', data: fs.readFileSync(path.join(FONT_DIR, 'Inter-ExtraBold.ttf')), weight: 800, style: 'normal' },
  ];
}

// ---------- Renderer: SVG → PNG → JPG (mozjpeg, 4:4:4, no metadata) ----------
async function renderJpg(node, outPath) {
  const fonts = loadFonts();
  const svg = await satori(node, { width: 1200, height: 630, fonts });
  const pngBuffer = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  const jpgBuffer = await sharp(pngBuffer)
    .jpeg({
      quality: 85,
      mozjpeg: true,
      chromaSubsampling: '4:4:4',
    })
    .toBuffer();
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, jpgBuffer);
  return { jpgBytes: jpgBuffer.length };
}

// ---------- Hash cache ----------
function loadCache() {
  try { return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); }
  catch { return {}; }
}
function saveCache(c) { fs.writeFileSync(CACHE_FILE, JSON.stringify(c, null, 2) + '\n'); }
function hashOf(obj) { return crypto.createHash('sha256').update(JSON.stringify(obj)).digest('hex').slice(0, 16); }

// ---------- Discovery: study mode reads Hugo cert-tracker frontmatter ----------
function discoverStudy() {
  if (!fs.existsSync(HUGO_CERT_TRACKER_DIR)) {
    console.error(`cert-tracker dir not found: ${HUGO_CERT_TRACKER_DIR}`);
    process.exit(1);
  }
  const entries = fs.readdirSync(HUGO_CERT_TRACKER_DIR, { withFileTypes: true })
    .filter(d => d.isFile() && d.name.endsWith('.md') && d.name !== '_index.md');

  return entries.map(d => {
    const full = path.join(HUGO_CERT_TRACKER_DIR, d.name);
    const raw  = fs.readFileSync(full, 'utf8');
    const { data } = matter(raw);
    const slug = d.name.replace(/\.md$/, '');
    const examCode = data.exam_code || slug.toUpperCase();
    return {
      slug,
      hero:    examCode,
      family:  familyFromCode(examCode),
      vendor:  data.vendor || '',
      status:  data.exam_status || '',
    };
  });
}

// ---------- Discovery: practice mode reads guided TOMLs (READ-ONLY) ----------
function discoverPractice() {
  if (!fs.existsSync(GUIDED_CERTS_DIR)) {
    console.error(`guided certs dir not found: ${GUIDED_CERTS_DIR}`);
    console.error(`Expected at: ${GUIDED_CERTS_DIR}`);
    process.exit(1);
  }
  const entries = fs.readdirSync(GUIDED_CERTS_DIR)
    .filter(f => f.endsWith('.toml'));

  const all = [];
  for (const f of entries) {
    const full = path.join(GUIDED_CERTS_DIR, f);
    let parsed;
    try { parsed = TOML.parse(fs.readFileSync(full, 'utf8')); }
    catch (e) {
      console.warn(`  ⚠️  could not parse ${f}: ${e.message}`);
      continue;
    }
    const slug = f.replace(/\.toml$/, '');
    const examCode = parsed.code || slug.toUpperCase();
    all.push({
      slug,
      hero:    examCode,
      family:  familyFromCode(examCode),
      vendor:  parsed.vendor || '',
      status:  parsed.status || '',
    });
  }
  // Filter to live only
  return all.filter(c => c.status === 'live');
}

// ---------- Main ----------
async function main() {
  fs.mkdirSync(CFG.outDir, { recursive: true });
  const cache = FORCE_ALL ? {} : loadCache();
  const certs = MODE === 'study' ? discoverStudy() : discoverPractice();

  console.log(`AGTC cert OG generator — V3 dark · family-band`);
  console.log(`Mode: ${MODE} (${CFG.label})`);
  console.log(`Output: ${path.relative(REPO_ROOT, CFG.outDir)}`);
  console.log(`Certs found: ${certs.length} ${DRY_RUN ? '· DRY RUN' : ''}\n`);

  // Family breakdown for visibility
  const breakdown = certs.reduce((acc, c) => { acc[c.family] = (acc[c.family] || 0) + 1; return acc; }, {});
  console.log(`Family breakdown: ${JSON.stringify(breakdown)}\n`);

  let rendered = 0, skipped = 0;
  const t0 = Date.now();

  for (const c of certs) {
    const key = hashOf({ hero: c.hero, subtitle: CFG.subtitle, family: c.family });
    const out = path.join(CFG.outDir, `${c.slug}.jpg`);

    if (!FORCE_ALL && cache[c.slug] === key && fs.existsSync(out)) {
      skipped++;
      continue;
    }
    if (DRY_RUN) {
      console.log(`  →  ${c.slug.padEnd(34)}  ${c.hero.padEnd(14)}  [${c.family}]`);
      rendered++;
      continue;
    }

    const node = layoutV3({ hero: c.hero, subtitle: CFG.subtitle, family: c.family });
    const { jpgBytes } = await renderJpg(node, out);
    cache[c.slug] = key;
    console.log(`  ✓  ${c.slug.padEnd(34)}  ${c.hero.padEnd(14)}  [${c.family.padEnd(7)}]  ${(jpgBytes / 1024).toFixed(0)} KB`);
    rendered++;
  }

  if (!DRY_RUN) saveCache(cache);
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n${rendered} rendered · ${skipped} cached  in ${elapsed}s`);
}

main().catch((err) => { console.error(err); process.exit(1); });
