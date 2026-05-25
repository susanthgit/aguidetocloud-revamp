// Blur specific rectangular regions of an image.
// Usage: node blur-regions.mjs <src> <dest> <regions-file.json>
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const [src, dest, regionsFile] = process.argv.slice(2);
if (!src || !dest || !regionsFile) {
  console.error('Usage: node blur-regions.mjs <src.png> <dest.png> <regions-file.json>');
  process.exit(1);
}
const regions = JSON.parse(fs.readFileSync(regionsFile, 'utf8'));

const meta = await sharp(src).metadata();
console.log(`Image: ${meta.width} x ${meta.height}`);

const composites = [];
for (const r of regions) {
  const blurred = await sharp(src)
    .extract({ left: r.x, top: r.y, width: r.width, height: r.height })
    .blur(15)
    .toBuffer();
  composites.push({ input: blurred, left: r.x, top: r.y });
  console.log(`  blurring ${r.x},${r.y} ${r.width}x${r.height}`);
}

await sharp(src).composite(composites).toFile(dest);
console.log(`✓ Wrote ${path.basename(dest)}`);

