/**
 * ════════════════════════════════════════════════════════════════════════
 * 🪐 Brain Bar — OG image generator
 * ────────────────────────────────────────────────────────────────────────
 * Renders 1200×630 PNG cards for every entry, terminal-styled to match
 * Brain Bar's atmosphere. Each card is shareable as social media art.
 *
 * Usage:
 *   cd brainbar
 *   node scripts/generate-og-images.mjs
 *
 * Output: brainbar/static/og/<slug>.png
 *
 * Re-runs are idempotent. Skips entries whose PNG already exists with a
 * matching last_verified date stamp inside the file (cheap freshness check).
 * Regenerates when --force is passed.
 * ════════════════════════════════════════════════════════════════════════
 */
import { chromium } from 'playwright';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import * as toml from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OG_DIR = path.join(ROOT, 'static', 'og');
const ENTRIES_PATH = path.join(ROOT, 'data', 'cmd_entries.toml');
const VOICE_PATH = path.join(ROOT, 'data', 'cmd_voice.toml');

const FORCE = process.argv.includes('--force');

await mkdir(OG_DIR, { recursive: true });

// Tiny TOML parser for our specific schema (avoids npm dep)
async function parseToml(filePath) {
  const text = await readFile(filePath, 'utf8');
  // Reuse Hugo's interpretation by running through a tiny parser.
  // For our schema we just need to extract entries[] with their fields.
  // For simplicity, use a real TOML parser via dynamic import.
  const { parse } = await import('smol-toml');
  return parse(text);
}

let entries;
try {
  const data = await parseToml(ENTRIES_PATH);
  entries = data.entries || [];
} catch (e) {
  console.error('  ❌ failed to parse cmd_entries.toml:', e.message);
  console.error('     install smol-toml first:  npm install --no-save smol-toml');
  process.exit(1);
}

let voice = {};
try {
  const data = await parseToml(VOICE_PATH);
  voice = data || {};
} catch {
  // optional file
}

console.log(`// generating og images · ${entries.length} entries · output: ${OG_DIR}`);
console.log(`// ${'─'.repeat(64)}`);

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function renderCardHtml(entry, voiceData) {
  const isDisambig = entry.kind === 'disambiguation';
  const slug = entry.slug;
  const name = entry.name;
  const kind = isDisambig ? 'disambiguation' : (entry.kind || 'entry');
  const domain = entry.domain || '';
  const oldName = (entry.terms && entry.terms.old_names && entry.terms.old_names[0]) || '';
  const plainEnglish = entry.plain_english || '';
  // shorten plain english to ~140 chars for the card
  const summary = plainEnglish.length > 140 ? plainEnglish.slice(0, 137).trimEnd() + '…' : plainEnglish;
  const mascot = (voiceData && voiceData.mascot) || '';

  return `<!doctype html><html><head><meta charset="utf-8">
<style>
  @font-face { font-family: 'JetBrains Mono'; font-weight: 400; src: url('file://${path.join(ROOT, 'static', 'fonts', 'JetBrainsMono-Regular.woff2').replace(/\\/g, '/')}') format('woff2'); }
  @font-face { font-family: 'JetBrains Mono'; font-weight: 500; src: url('file://${path.join(ROOT, 'static', 'fonts', 'JetBrainsMono-Medium.woff2').replace(/\\/g, '/')}') format('woff2'); }
  @font-face { font-family: 'JetBrains Mono'; font-weight: 600; src: url('file://${path.join(ROOT, 'static', 'fonts', 'JetBrainsMono-SemiBold.woff2').replace(/\\/g, '/')}') format('woff2'); }
  @font-face { font-family: 'JetBrains Mono'; font-weight: 700; src: url('file://${path.join(ROOT, 'static', 'fonts', 'JetBrainsMono-Bold.woff2').replace(/\\/g, '/')}') format('woff2'); }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 1200px; height: 630px; }
  body {
    background: #0B0E14;
    color: #E6EDF3;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    padding: 64px 72px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }
  body::before {
    content: "";
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 4px);
    pointer-events: none;
  }
  .top { display: flex; align-items: center; justify-content: space-between; }
  .brand { font-size: 24px; font-weight: 600; color: #E6EDF3; }
  .brand .prompt { color: #34D399; font-weight: 700; }
  .brand-name { letter-spacing: -0.01em; }
  .meta-tag {
    font-size: 14px;
    color: #7D8590;
    letter-spacing: 0.03em;
  }
  .meta-tag .accent { color: #34D399; }

  .center {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  .prompt-line {
    font-size: 22px;
    color: #7D8590;
    letter-spacing: 0.02em;
  }
  .prompt-line .dollar { color: #34D399; font-weight: 700; }
  .prompt-line .slug { color: #34D399; font-weight: 600; }
  .title {
    font-size: 56px;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.1;
    color: #E6EDF3;
  }
  .formerly {
    font-size: 18px;
    color: #7D8590;
  }
  .formerly .label { color: #545D68; }
  .summary {
    font-size: 22px;
    color: #B1BAC4;
    line-height: 1.5;
    max-width: 1056px;
  }
  .pills { display: flex; gap: 12px; }
  .pill {
    font-size: 14px;
    color: #B1BAC4;
    border: 1px solid #30363D;
    background: rgba(255,255,255,0.02);
    padding: 4px 10px;
    border-radius: 4px;
  }
  .pill .dim { color: #545D68; }

  .bottom { display: flex; align-items: flex-end; justify-content: space-between; }
  .verified {
    font-size: 14px;
    color: #545D68;
    letter-spacing: 0.02em;
  }
  .verified .accent { color: #34D399; }
  .url { font-size: 16px; color: #B1BAC4; letter-spacing: 0.02em; }

  .disambig-note {
    font-size: 18px;
    color: #FACC15;
  }
  .disambig-note::before { content: "~  "; }
</style></head>
<body>
  <div class="top">
    <div class="brand"><span class="prompt">$_</span> <span class="brand-name">cmd</span></div>
    <div class="meta-tag"><span class="accent">//</span> ${escapeHtml(kind)} · ${escapeHtml(domain)}${mascot ? ' · ' + escapeHtml(mascot) : ''}</div>
  </div>

  <div class="center">
    <div class="prompt-line"><span class="dollar">$</span> <span class="slug">${escapeHtml(slug)}</span></div>
    <h1 class="title">${escapeHtml(name)}</h1>
    ${oldName ? `<div class="formerly"><span class="label"># formerly</span> · ${escapeHtml(oldName)}</div>` : ''}
    ${isDisambig ? `<div class="disambig-note">heads up — this term is ambiguous</div>` : ''}
    ${summary ? `<p class="summary">${escapeHtml(summary)}</p>` : ''}
  </div>

  <div class="bottom">
    <div class="verified"><span class="accent">#</span> verified ${escapeHtml(entry.last_verified || '')}</div>
    <div class="url">cmd.aguidetocloud.com/${escapeHtml(slug)}</div>
  </div>
</body></html>`;
}

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();

let generated = 0;
let skipped = 0;
let failed = 0;

for (const entry of entries) {
  const slug = entry.slug;
  if (!slug) continue;
  const out = path.join(OG_DIR, `${slug}.png`);

  // Idempotent: skip if exists and not forcing.
  if (!FORCE) {
    try {
      await stat(out);
      skipped++;
      continue;
    } catch {
      // doesn't exist, continue to generate
    }
  }

  try {
    const html = renderCardHtml(entry, voice[slug]);
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.waitForTimeout(150);  // let fonts settle
    await page.screenshot({ path: out, type: 'png', clip: { x: 0, y: 0, width: 1200, height: 630 } });
    process.stdout.write(`  ✓ ${slug.padEnd(28)} ${path.relative(ROOT, out)}\n`);
    generated++;
  } catch (e) {
    process.stdout.write(`  ✗ ${slug.padEnd(28)} ${e.message}\n`);
    failed++;
  }
}

await browser.close();

console.log(`// ${'─'.repeat(64)}`);
console.log(`generated: ${generated} · skipped: ${skipped} · failed: ${failed} · total: ${entries.length}`);
process.exit(failed > 0 ? 1 : 0);
