// scripts/build-images.mjs — auto-discover all WebPs under static/images/ and
// emit AVIF siblings. Adapted from cosmos-atlas/scripts/build-images.mjs.
//
// Why: AVIF compresses ~30% smaller than WebP at the same visual quality. The
// site has ~80 WebPs across about, blog, and tool-previews. Generating AVIF
// siblings + serving via <picture> means modern browsers download the smaller
// file and old browsers fall back to WebP. Zero JS, zero CDN cost, win-win.
//
// Behaviour:
//   - Walks `static/images/` recursively for `.webp` files.
//   - Emits `<basename>.avif` next to each `<basename>.webp`.
//   - Re-runnable. If the AVIF is newer than the WebP, skips (idempotent).
//   - Logs before/after byte counts and per-file savings.
//   - Network errors / missing source = warning, not fatal.
//
// Usage:
//   node scripts/build-images.mjs                # default — incremental
//   node scripts/build-images.mjs --force        # regenerate every AVIF
//
// CI hook (optional): wire into a Hugo prebuild step. For now Sush runs it
// manually before pushing, or it lives as a one-off optimisation pass.

import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const STATIC_IMAGES = path.join(ROOT, 'static', 'images');

const argv = new Set(process.argv.slice(2));
const FORCE = argv.has('--force');
const QUALITY = 70;       // sharp default sweet spot — visually identical to WebP q80
const EFFORT = 6;         // 0 (fastest) — 9 (smallest). 6 is the build/perf tradeoff.

async function* walkWebp(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      yield* walkWebp(full);
    } else if (ent.isFile() && full.toLowerCase().endsWith('.webp')) {
      yield full;
    }
  }
}

async function maybeBuild(webpAbs) {
  const avifAbs = webpAbs.replace(/\.webp$/i, '.avif');
  const webpStat = await fs.stat(webpAbs);
  let avifStat = null;
  try { avifStat = await fs.stat(avifAbs); } catch {}

  if (!FORCE && avifStat && avifStat.mtimeMs >= webpStat.mtimeMs) {
    return { skipped: true, webp: webpAbs, avif: avifAbs, srcSize: webpStat.size, outSize: avifStat.size };
  }

  try {
    await sharp(webpAbs)
      .avif({ quality: QUALITY, effort: EFFORT, chromaSubsampling: '4:4:4' })
      .toFile(avifAbs);
    const out = await fs.stat(avifAbs);
    return { skipped: false, webp: webpAbs, avif: avifAbs, srcSize: webpStat.size, outSize: out.size };
  } catch (err) {
    return { error: err.message ?? String(err), webp: webpAbs };
  }
}

async function main() {
  const results = [];
  for await (const w of walkWebp(STATIC_IMAGES)) {
    results.push(await maybeBuild(w));
  }

  const built = results.filter((r) => !r.error && !r.skipped);
  const skipped = results.filter((r) => r.skipped);
  const errors = results.filter((r) => r.error);

  for (const r of built) {
    const rel = path.relative(ROOT, r.avif).replace(/\\/g, '/');
    const saved = r.srcSize - r.outSize;
    const pct = Math.round((saved / r.srcSize) * 100);
    console.log(`✓ ${rel} — ${r.srcSize} → ${r.outSize} (saved ${saved} · ${pct}%)`);
  }
  for (const r of skipped) {
    const rel = path.relative(ROOT, r.avif).replace(/\\/g, '/');
    console.log(`· ${rel} (up to date)`);
  }
  for (const r of errors) {
    console.warn(`⚠️  ${path.relative(ROOT, r.webp).replace(/\\/g, '/')}: ${r.error}`);
  }

  const totalIn = built.reduce((a, r) => a + r.srcSize, 0);
  const totalOut = built.reduce((a, r) => a + r.outSize, 0);
  const totalSaved = totalIn - totalOut;
  const pct = totalIn ? Math.round((totalSaved / totalIn) * 100) : 0;
  console.log(`\nBuilt ${built.length} · skipped ${skipped.length} · errors ${errors.length}`);
  if (built.length > 0) console.log(`Total: ${totalIn} → ${totalOut} bytes (saved ${totalSaved} · ${pct}%)`);
}

main().catch((err) => {
  console.error('build-images.mjs failed:', err);
  process.exit(1);
});
