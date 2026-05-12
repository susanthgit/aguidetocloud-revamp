/**
 * AGTC Blog OG Generator — V3-blog "B2 Editorial-Light"
 *
 * Reads content/blog/*.md frontmatter, generates 1200×630 JPG covers,
 * writes to static/images/og/blog/<slug>.jpg.
 *
 * Pipeline: satori → SVG → @resvg/resvg-js → PNG buffer → sharp (mozjpeg JPG)
 *
 * SLA-isolated per og-image-system.md § 6.8.
 */

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import matter from 'gray-matter';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT  = path.resolve(__dirname, '..', '..');
const BLOG_DIR   = path.join(REPO_ROOT, 'content', 'blog');
const OUT_DIR    = path.join(REPO_ROOT, 'static', 'images', 'og', 'blog');
const FONT_DIR   = path.join(__dirname, 'fonts');
const CACHE_FILE = path.join(__dirname, '.og-blog-cache.json');
const DRY_RUN    = process.argv.includes('--dry-run');
const FORCE_ALL  = process.argv.includes('--force');

// ---------- Brand tokens (Zen design system) ----------
const TOKENS = {
  textPrimary:   '#1A1A1A',
  textTertiary:  '#737373',
  accent:        '#6366F1',
};
const LIGHT_BG = '#FAFAF8';  // warm white

// ---------- Adaptive font sizing for blog headlines ----------
function heroFontSize(text) {
  const len = text.length;
  if (len <= 14) return 132;
  if (len <= 24) return 108;
  if (len <= 36) return 84;
  if (len <= 48) return 72;
  return 64;
}

// ---------- Tiny line-art glyphs (built from satori-friendly div trees) ----------
function glyphCalendar(stroke) {
  return {
    type: 'div',
    props: {
      style: { display: 'flex', flexDirection: 'column', gap: '10px' },
      children: [0, 1, 2].map(() => ({
        type: 'div',
        props: {
          style: { display: 'flex', gap: '10px' },
          children: [0, 1, 2].map(() => ({
            type: 'div',
            props: { style: { width: '32px', height: '32px', border: `2px solid ${stroke}`, borderRadius: '4px' } },
          })),
        },
      })),
    },
  };
}
function glyphCompare(stroke) {
  return {
    type: 'div',
    props: {
      style: { display: 'flex', alignItems: 'flex-end', gap: '18px', height: '140px' },
      children: [
        { type: 'div', props: { style: { width: '24px', height: '80px',  border: `2px solid ${stroke}`, borderRadius: '4px' } } },
        { type: 'div', props: { style: { width: '24px', height: '128px', border: `2px solid ${stroke}`, borderRadius: '4px' } } },
        { type: 'div', props: { style: { width: '24px', height: '56px',  border: `2px solid ${stroke}`, borderRadius: '4px' } } },
      ],
    },
  };
}
function glyphLayers(stroke) {
  return {
    type: 'div',
    props: {
      style: { display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'flex-end' },
      children: [
        { type: 'div', props: { style: { width: '140px', height: '6px', background: stroke, borderRadius: '3px' } } },
        { type: 'div', props: { style: { width: '110px', height: '6px', background: stroke, borderRadius: '3px', opacity: 0.7 } } },
        { type: 'div', props: { style: { width:  '80px', height: '6px', background: stroke, borderRadius: '3px', opacity: 0.5 } } },
        { type: 'div', props: { style: { width:  '50px', height: '6px', background: stroke, borderRadius: '3px', opacity: 0.3 } } },
      ],
    },
  };
}
function glyphList(stroke) {
  return {
    type: 'div',
    props: {
      style: { display: 'flex', flexDirection: 'column', gap: '16px' },
      children: [0, 1, 2, 3].map(() => ({
        type: 'div',
        props: {
          style: { display: 'flex', alignItems: 'center', gap: '14px' },
          children: [
            { type: 'div', props: { style: { width: '14px', height: '14px', border: `2px solid ${stroke}`, borderRadius: '3px' } } },
            { type: 'div', props: { style: { width: '120px', height: '4px', background: stroke, borderRadius: '2px' } } },
          ],
        },
      })),
    },
  };
}
function glyphFor(kind, stroke) {
  switch (kind) {
    case 'calendar': return glyphCalendar(stroke);
    case 'compare':  return glyphCompare(stroke);
    case 'list':     return glyphList(stroke);
    case 'layers':
    default:         return glyphLayers(stroke);
  }
}

// ---------- Auto-detect glyph from frontmatter when og_glyph is absent ----------
function detectGlyph({ og_glyph, og_headline, card_tag }) {
  if (og_glyph) return og_glyph;
  const tag = String(card_tag || '').toLowerCase();
  const head = String(og_headline || '');
  if (tag.includes("what's new") || tag.includes('whats new')) return 'calendar';
  if (/\s+vs\s+/i.test(head)) return 'compare';
  if (/^\d/.test(head)) return 'list';
  return 'layers';
}

// ---------- B2 Editorial-Light layout (LOCKED) ----------
const LOTUS_INK = `data:image/png;base64,${fs.readFileSync(path.join(FONT_DIR, 'lotus-ink.png')).toString('base64')}`;

function layoutB2({ headline, glyph }) {
  const heroPx = heroFontSize(headline);
  return {
    type: 'div',
    props: {
      style: {
        width: '1200px', height: '630px',
        background: LIGHT_BG,
        display: 'flex',
        fontFamily: 'Inter',
        position: 'relative',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              flex: 1,
              display: 'flex', flexDirection: 'column',
              justifyContent: 'center',
              padding: '88px 64px 88px 80px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: `${heroPx}px`,
                    fontWeight: 800,
                    color: TOKENS.textPrimary,
                    letterSpacing: '-1.5px',
                    lineHeight: 1.05,
                    maxWidth: '720px',
                  },
                  children: headline,
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    width: '64px', height: '5px',
                    background: TOKENS.accent,
                    marginTop: '32px',
                    borderRadius: '3px',
                  },
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              width: '320px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingRight: '64px',
            },
            children: [glyphFor(glyph, TOKENS.textTertiary)],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              bottom: '36px',
              left: '80px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            },
            children: [
              {
                type: 'img',
                props: {
                  src: LOTUS_INK,
                  width: 32, height: 32,
                  style: { display: 'block' },
                },
              },
              {
                type: 'div',
                props: {
                  style: { fontSize: '22px', fontWeight: 600, color: TOKENS.textPrimary, letterSpacing: '0.3px' },
                  children: 'aguidetocloud.com',
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
  return { pngBytes: pngBuffer.length, jpgBytes: jpgBuffer.length };
}

// ---------- Hash cache ----------
function loadCache() {
  try { return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); }
  catch { return {}; }
}
function saveCache(c) { fs.writeFileSync(CACHE_FILE, JSON.stringify(c, null, 2) + '\n'); }
function hashOf(obj) { return crypto.createHash('sha256').update(JSON.stringify(obj)).digest('hex').slice(0, 16); }

// ---------- Discovery: read every blog post's frontmatter ----------
function discoverBlogs() {
  if (!fs.existsSync(BLOG_DIR)) {
    console.error(`Blog dir not found: ${BLOG_DIR}`);
    process.exit(1);
  }
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md') && f !== '_index.md');
  return files.map(f => {
    const full = path.join(BLOG_DIR, f);
    const raw = fs.readFileSync(full, 'utf8');
    const { data } = matter(raw);
    const slug = f.replace(/\.md$/, '');
    return {
      slug,
      file:        full,
      title:       data.title || '',
      card_tag:    data.card_tag || '',
      og_headline: data.og_headline || '',
      og_glyph:    data.og_glyph || '',
    };
  });
}

// ---------- Main ----------
async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const cache = FORCE_ALL ? {} : loadCache();
  const posts = discoverBlogs();

  console.log(`AGTC blog OG generator — B2 Editorial-Light · V3-blog`);
  console.log(`Posts found: ${posts.length} · Output: ${path.relative(REPO_ROOT, OUT_DIR)}`);
  console.log(`${DRY_RUN ? 'DRY RUN — no files will be written.' : ''}\n`);

  let rendered = 0, skipped = 0, missing = 0;
  const totalBytesNew = { jpg: 0 };
  const t0 = Date.now();

  for (const p of posts) {
    if (!p.og_headline) {
      console.log(`  ⚠️  ${p.slug.padEnd(64)}  MISSING og_headline — skipping`);
      missing++;
      continue;
    }
    const glyph = detectGlyph(p);
    const key   = hashOf({ headline: p.og_headline, glyph, slug: p.slug });
    const out   = path.join(OUT_DIR, `${p.slug}.jpg`);

    if (!FORCE_ALL && cache[p.slug] === key && fs.existsSync(out)) {
      skipped++;
      continue;
    }
    if (DRY_RUN) {
      console.log(`  →  ${p.slug.padEnd(64)}  [${glyph}]  "${p.og_headline}"`);
      rendered++;
      continue;
    }

    const node = layoutB2({ headline: p.og_headline, glyph });
    const { jpgBytes } = await renderJpg(node, out);
    cache[p.slug] = key;
    totalBytesNew.jpg += jpgBytes;
    console.log(`  ✓  ${p.slug.padEnd(64)}  [${glyph}]  ${(jpgBytes / 1024).toFixed(0)} KB`);
    rendered++;
  }

  if (!DRY_RUN) saveCache(cache);
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n${rendered} rendered · ${skipped} cached · ${missing} missing  in ${elapsed}s`);
  if (missing > 0) {
    console.log(`\n⚠️  ${missing} post(s) need og_headline in frontmatter. Run with --dry-run to see which.`);
    process.exit(2);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
