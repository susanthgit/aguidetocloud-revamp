/**
 * AGTC Tool OG Generator — T-A "Dark Tool Card" (V3-tool system)
 *
 * Generates 1200×630 JPG OG covers for every tool in toolkit_nav.toml +
 * extra_tools.toml. Writes to static/images/og/<slug>.jpg (overwrites prior
 * Python+Playwright output at the same path — no Hugo template change needed).
 *
 * Design (LOCKED 13 May 2026 AM NZST):
 *   - BG: charcoal #0F0F10 (matches cert V3)
 *   - LEFT col: "FREE TOOL" eyebrow (indigo) + tool name (Inter ExtraBold,
 *     adaptive 56-120 px) + indigo accent line + tagline (#A3A3A3)
 *   - RIGHT col: 300×300 rounded tile, soft tool-accent BG, white Lucide icon
 *   - BOTTOM 88 px: category band (copilot-ai=lavender, admin-security=
 *     periwinkle, certs=peach, utilities=teal, fallback=neutral) +
 *     wordmark left + ink lotus right
 *
 * Pipeline: satori → SVG → @resvg/resvg-js → PNG → sharp (mozjpeg 85, 4:4:4)
 *
 * SLA-isolated: NEVER part of `hugo build`. Per og-image-system.md § 6.8.
 *
 * Data sources (SAME as legacy scripts/og-generator/generate_og.py):
 *   - data/toolkit_nav.toml          tools + icon + category
 *   - data/tool_colours.toml         accent hex + friendly name
 *   - scripts/og-generator/taglines.toml   curated OG-friendly taglines
 *   - scripts/og-generator/extra_tools.toml   tools not yet in tool_colours
 */

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { parse as parseToml } from 'smol-toml';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT  = path.resolve(__dirname, '..', '..');
const DATA_DIR   = path.join(REPO_ROOT, 'data');
const LEGACY_GEN = path.join(REPO_ROOT, 'scripts', 'og-generator');
const OUT_DIR    = path.join(REPO_ROOT, 'static', 'images', 'og');
const FONT_DIR   = path.join(__dirname, 'fonts');
const CACHE_FILE = path.join(__dirname, '.og-tool-cache.json');
const LUCIDE_DIR = path.join(__dirname, 'node_modules', 'lucide-static', 'icons');

const DRY_RUN   = process.argv.includes('--dry-run');
const FORCE_ALL = process.argv.includes('--force');

// ──────────────────────── BRAND TOKENS ────────────────────────
const TOKENS = {
  textPrimary: '#1A1A1A',
  textMuted:   '#A3A3A3',
  bgDark:      '#0F0F10',
  accent:      '#6366F1',
  heroWhite:   '#FAFAFA',
};

// ──────────────────────── CATEGORY BAND PALETTE ────────────────────────
// Maps tool categories to the same family palette used by the cert V3 band.
// copilot-ai aligns with AI family; admin-security with SC family; certs with
// AZ family; utilities gets pale teal (sibling of MB but visually unique).
const CATEGORY_BAND = {
  'copilot-ai':     '#E1D7F0',
  'admin-security': '#CFD4F0',
  'certs':          '#FFD9C7',
  'utilities':      '#C9E4DD',
};
const CATEGORY_BAND_FALLBACK = '#EEF2FF';

// ──────────────────────── LUCIDE ICON RESOLUTION ────────────────────────
// Map non-standard names used in toolkit_nav.toml to nearest Lucide equivalent.
const ICON_ALIASES = {
  'boxing':       'swords',
  'robot':        'bot',
  'fishing':      'anchor',
  'tomato':       'apple',
  'dice':         'dices',
  'flask':        'flask-conical',
  'chart-bar':    'bar-chart-3',
  'bolt':         'zap',
  'gamepad':      'gamepad-2',
  'dollar':       'dollar-sign',
  'hospital':     'cross',
  'edit-3':       'pencil',
};

function resolveLucideName(name) {
  if (!name) return 'circle';
  const aliased = ICON_ALIASES[name] || name;
  // Try aliased first
  if (fs.existsSync(path.join(LUCIDE_DIR, `${aliased}.svg`))) return aliased;
  // Try original
  if (fs.existsSync(path.join(LUCIDE_DIR, `${name}.svg`)))    return name;
  // Final fallback
  return 'circle';
}

const ICON_CACHE = new Map();
async function lucideIconDataUri(iconName, sizePx, stroke, strokeWidth = 1.8) {
  const resolved = resolveLucideName(iconName);
  const key = `${resolved}|${sizePx}|${stroke}|${strokeWidth}`;
  if (ICON_CACHE.has(key)) return ICON_CACHE.get(key);

  const rawSvg = fs.readFileSync(path.join(LUCIDE_DIR, `${resolved}.svg`), 'utf8');
  // Lucide ships SVGs with stroke="currentColor". We replace with our stroke
  // colour and re-size by re-emitting the wrapper. Lucide icons all have
  // viewBox="0 0 24 24" and use stroke-linecap="round" stroke-linejoin="round".
  const innerMatch = rawSvg.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  const inner = innerMatch ? innerMatch[1] : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${sizePx}" height="${sizePx}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  const pngBuf = await sharp(Buffer.from(svg)).png().toBuffer();
  const uri = `data:image/png;base64,${pngBuf.toString('base64')}`;
  ICON_CACHE.set(key, uri);
  return uri;
}

// ──────────────────────── HELPERS ────────────────────────
function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function heroFontSize(name) {
  const n = name.length;
  if (n <= 8)  return 120;
  if (n <= 14) return 96;
  if (n <= 20) return 80;
  if (n <= 28) return 64;
  return 56;
}

function taglineFontSize(text) {
  return text.length > 70 ? 22 : 26;
}

// ──────────────────────── LAYOUT — T-A DARK TOOL CARD (LOCKED) ────────────────────────
const LOTUS_INK = `data:image/png;base64,${fs.readFileSync(path.join(FONT_DIR, 'lotus-ink.png')).toString('base64')}`;

function layoutA({ name, tagline, accent, category, iconUri }) {
  const heroPx = heroFontSize(name);
  const taglinePx = taglineFontSize(tagline);
  const bandColor = CATEGORY_BAND[category] || CATEGORY_BAND_FALLBACK;
  return {
    type: 'div',
    props: {
      style: {
        width: '1200px', height: '630px',
        background: TOKENS.bgDark,
        display: 'flex',
        fontFamily: 'Inter',
        position: 'relative',
      },
      children: [
        // LEFT col — text
        {
          type: 'div',
          props: {
            style: {
              flex: 1,
              display: 'flex', flexDirection: 'column',
              justifyContent: 'center',
              padding: '64px 24px 120px 80px',
            },
            children: [
              { type: 'div', props: { style: { fontSize: '20px', fontWeight: 700, color: TOKENS.accent, letterSpacing: '4px', marginBottom: '24px' }, children: 'FREE TOOL' } },
              { type: 'div', props: { style: { fontSize: `${heroPx}px`, fontWeight: 800, color: TOKENS.heroWhite, letterSpacing: '-1.5px', lineHeight: 1.02, maxWidth: '600px' }, children: name } },
              { type: 'div', props: { style: { width: '72px', height: '5px', background: TOKENS.accent, marginTop: '28px', marginBottom: '24px', borderRadius: '3px' } } },
              { type: 'div', props: { style: { fontSize: `${taglinePx}px`, fontWeight: 400, color: TOKENS.textMuted, lineHeight: 1.35, maxWidth: '600px' }, children: tagline } },
            ],
          },
        },
        // RIGHT col — icon tile
        {
          type: 'div',
          props: {
            style: {
              width: '440px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              paddingBottom: '96px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    width: '300px', height: '300px',
                    background: hexToRgba(accent, 0.16),
                    borderRadius: '40px',
                    border: `2px solid ${hexToRgba(accent, 0.3)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  },
                  children: [{ type: 'img', props: { src: iconUri, width: 168, height: 168, style: { display: 'block' } } }],
                },
              },
            ],
          },
        },
        // BOTTOM — category band
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute', bottom: 0, left: 0,
              width: '1200px', height: '88px',
              background: bandColor,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingLeft: '80px', paddingRight: '48px',
            },
            children: [
              { type: 'div', props: { style: { fontSize: '22px', fontWeight: 600, color: TOKENS.textPrimary, letterSpacing: '0.3px' }, children: 'aguidetocloud.com' } },
              { type: 'img', props: { src: LOTUS_INK, width: 64, height: 64, style: { display: 'block' } } },
            ],
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

// ──────────────────────── DATA LOAD ────────────────────────
// Slug strategy (matches legacy Python generator behaviour):
//   1. tool_colours.toml's `slug` field is the CANONICAL slug — it determines
//      the output filename and any references from frontmatter.
//   2. For each canonical slug, attempt to match a toolkit_nav.toml entry by
//      trying several heuristics (URL last segment, lowercased name, lowercased
//      short). This handles external = true entries (e.g. Brain Bar →
//      https://cmd.aguidetocloud.com/) where naïve URL parsing fails.
//   3. extra_tools.toml provides slugs not yet in tool_colours.toml (community
//      tools mid-integration).
function slugify(text) {
  return String(text || '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function loadAllTools() {
  const navRaw     = fs.readFileSync(path.join(DATA_DIR, 'toolkit_nav.toml'), 'utf8');
  const coloursRaw = fs.readFileSync(path.join(DATA_DIR, 'tool_colours.toml'), 'utf8');
  const taglinesRaw = fs.readFileSync(path.join(LEGACY_GEN, 'taglines.toml'), 'utf8');
  const extraRaw   = fs.existsSync(path.join(LEGACY_GEN, 'extra_tools.toml'))
    ? fs.readFileSync(path.join(LEGACY_GEN, 'extra_tools.toml'), 'utf8')
    : '';

  const nav      = (parseToml(navRaw).tools     || []).filter(t => t.is_tool !== false);
  const colours  = parseToml(coloursRaw).tools || [];
  const taglines = parseToml(taglinesRaw).tools || {};
  const extras   = extraRaw ? (parseToml(extraRaw).tools || []) : [];

  // Build multiple nav lookup tables so external-URL tools can be matched.
  const navByUrlSlug = {};
  const navByName    = {};
  const navByShort   = {};
  for (const t of nav) {
    if (t.url) {
      const last = t.url.replace(/^\/+|\/+$/g, '').split('/').pop();
      if (last) navByUrlSlug[last] = t;
    }
    if (t.name)  navByName[slugify(t.name)]   = t;
    if (t.short) navByShort[slugify(t.short)] = t;
  }
  function findNavBySlug(slug) {
    return navByUrlSlug[slug] || navByName[slug] || navByShort[slug] || null;
  }

  // Source of truth = tool_colours.toml `slug` field.
  const tools = [];
  const seen  = new Set();
  for (const c of colours) {
    const slug = c.slug;
    if (!slug || seen.has(slug)) continue;
    const n = findNavBySlug(slug) || {};
    const tl = taglines[slug] || {};
    tools.push({
      slug,
      name:     n.name || c.name || slug,
      tagline:  tl.tagline || n.desc || 'Free tool from A Guide to Cloud & AI.',
      accent:   (n.color || c.hex || '#6366F1').toLowerCase(),
      category: n.category || c.category || 'utilities',
      icon:     n.icon || 'circle',
    });
    seen.add(slug);
  }
  // Then add community/legacy tools that exist only in extra_tools.toml.
  for (const e of extras) {
    if (!e.slug || seen.has(e.slug)) continue;
    const n = findNavBySlug(e.slug) || {};
    const tl = taglines[e.slug] || {};
    tools.push({
      slug:     e.slug,
      name:     n.name || e.name || e.slug,
      tagline:  tl.tagline || n.desc || 'Free tool from A Guide to Cloud & AI.',
      accent:   (n.color || e.hex || '#6366F1').toLowerCase(),
      category: n.category || (e.category || 'utilities').toLowerCase().replace(/\s+/g, '-'),
      icon:     n.icon || 'circle',
    });
    seen.add(e.slug);
  }
  return tools;
}

// ──────────────────────── MAIN ────────────────────────
async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const cache = FORCE_ALL ? {} : loadCache();
  const tools = loadAllTools();

  console.log(`AGTC tool OG generator — T-A Dark Tool Card · V3-tool`);
  console.log(`Tools found: ${tools.length} · Output: ${path.relative(REPO_ROOT, OUT_DIR)}`);
  if (DRY_RUN) console.log('DRY RUN — no files will be written.');
  console.log('');

  let rendered = 0, skipped = 0;
  const writtenPaths = [];
  const t0 = Date.now();

  for (const tool of tools) {
    const key = hashOf({
      name: tool.name, tagline: tool.tagline, accent: tool.accent,
      category: tool.category, icon: tool.icon,
    });
    const out = path.join(OUT_DIR, `${tool.slug}.jpg`);

    if (!FORCE_ALL && cache[tool.slug] === key && fs.existsSync(out)) {
      skipped++;
      continue;
    }
    if (DRY_RUN) {
      console.log(`  →  ${tool.slug.padEnd(28)}  ${tool.category.padEnd(16)}  ${tool.icon.padEnd(16)}  ${tool.accent}`);
      rendered++;
      continue;
    }

    const iconUri = await lucideIconDataUri(tool.icon, 256, '#FFFFFF', 1.8);
    const node = layoutA({ ...tool, iconUri });
    const bytes = await renderJpg(node, out);
    cache[tool.slug] = key;
    writtenPaths.push(out);
    console.log(`  ✓  ${tool.slug.padEnd(28)}  ${tool.category.padEnd(16)}  ${tool.icon.padEnd(16)}  ${(bytes / 1024).toFixed(0)} KB`);
    rendered++;
  }

  if (!DRY_RUN) saveCache(cache);
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n${rendered} rendered · ${skipped} cached  in ${elapsed}s`);

  // Print explicit paths for parallel-safe git add
  if (writtenPaths.length > 0) {
    const relPaths = writtenPaths.map(p => path.relative(REPO_ROOT, p).replace(/\\/g, '/'));
    fs.writeFileSync(path.join(__dirname, '.last-run-paths.txt'), relPaths.join('\n') + '\n');
    console.log(`Wrote ${relPaths.length} file path(s) to .last-run-paths.txt for explicit git add.`);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
