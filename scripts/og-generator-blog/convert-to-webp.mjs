// Convert PNGs in Sush's Downloads to WebP for blog use.
// Usage: node convert-to-webp.mjs <src.png> <dest.webp> [quality]
import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs';

const [src, dest, qStr] = process.argv.slice(2);
if (!src || !dest) {
  console.error('Usage: node convert-to-webp.mjs <src.png> <dest.webp> [quality=80]');
  process.exit(1);
}
const quality = qStr ? parseInt(qStr, 10) : 80;

const srcStat = fs.statSync(src);
await sharp(src)
  .webp({ quality })
  .toFile(dest);
const destStat = fs.statSync(dest);
const srcKB = (srcStat.size / 1024).toFixed(1);
const destKB = (destStat.size / 1024).toFixed(1);
const savedPct = ((1 - destStat.size / srcStat.size) * 100).toFixed(0);
console.log(`✓ ${path.basename(src)} (${srcKB} KB) → ${path.basename(dest)} (${destKB} KB) [saved ${savedPct}%]`);
