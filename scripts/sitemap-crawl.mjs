// Sitemap crawl — fetches every URL in /sitemap.xml in parallel batches,
// records HTTP status + content-length + basic meta presence (title, desc, h1).
// Flags any URL that is not 200, missing canonical, missing title, etc.
//
// Output: audit-output/sitemap-crawl.json + console summary

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const OUT = path.join(REPO_ROOT, 'audit-output', 'sitemap-crawl.json');

const BASE = 'https://www.aguidetocloud.com';
const BATCH_SIZE = 30; // parallel requests

async function checkUrl(url) {
  try {
    const r = await fetch(url, { redirect: 'follow' });
    const html = await r.text();
    const titleM = html.match(/<title>([^<]*)<\/title>/i);
    const descM = html.match(/<meta\s+name=["']?description["']?\s+content=["']?([^"']*)["']?/i);
    const canonM = html.match(/<link\s+rel=["']?canonical["']?\s+href=["']?([^"']*)["']?/i);
    const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
    const ogImgM = html.match(/<meta\s+property=["']?og:image["']?\s+content=["']?([^"']*)["']?/i);
    const jsonLdCount = (html.match(/<script[^>]*type=["']?application\/ld\+json["']?/gi) || []).length;
    return {
      url,
      status: r.status,
      finalUrl: r.url !== url ? r.url : undefined,
      title: titleM ? titleM[1].trim() : '',
      titleLen: titleM ? titleM[1].trim().length : 0,
      desc: descM ? descM[1].trim().slice(0, 80) : '',
      descLen: descM ? descM[1].trim().length : 0,
      canonical: canonM ? canonM[1] : '',
      h1Count,
      ogImage: ogImgM ? !!ogImgM[1] : false,
      jsonLdCount,
      bytes: html.length,
    };
  } catch (e) {
    return { url, error: String(e.message).slice(0, 100) };
  }
}

async function batch(items, size, fn) {
  const results = [];
  for (let i = 0; i < items.length; i += size) {
    const chunk = items.slice(i, i + size);
    const out = await Promise.all(chunk.map(fn));
    results.push(...out);
    if (i % 100 === 0) process.stdout.write(`  ${i + chunk.length}/${items.length}\r`);
  }
  console.log('');
  return results;
}

(async () => {
  await fs.mkdir(path.dirname(OUT), { recursive: true });
  console.log('Fetching sitemap.xml...');
  const sm = await (await fetch(BASE + '/sitemap.xml')).text();
  const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  console.log(`Found ${urls.length} URLs.\nCrawling in batches of ${BATCH_SIZE}...`);
  const t0 = Date.now();
  const results = await batch(urls, BATCH_SIZE, checkUrl);
  const dt = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`Crawled ${results.length} URLs in ${dt}s.\n`);

  await fs.writeFile(OUT, JSON.stringify({ generated: new Date().toISOString(), total: results.length, results }, null, 2));

  // ── Findings ──
  const errors = results.filter(r => r.error);
  const non200 = results.filter(r => !r.error && r.status !== 200);
  const redirects = results.filter(r => !r.error && r.finalUrl);
  const missingTitle = results.filter(r => !r.error && r.status === 200 && !r.title);
  const longTitle = results.filter(r => !r.error && r.status === 200 && r.titleLen > 60);
  const missingDesc = results.filter(r => !r.error && r.status === 200 && !r.desc);
  const longDesc = results.filter(r => !r.error && r.status === 200 && r.descLen > 160);
  const missingCanon = results.filter(r => !r.error && r.status === 200 && !r.canonical);
  const noH1 = results.filter(r => !r.error && r.status === 200 && r.h1Count === 0);
  const multipleH1 = results.filter(r => !r.error && r.status === 200 && r.h1Count > 1);
  const missingOg = results.filter(r => !r.error && r.status === 200 && !r.ogImage);
  const missingJsonLd = results.filter(r => !r.error && r.status === 200 && r.jsonLdCount === 0);

  console.log('=== 🔴 BLOCKERS ===');
  console.log(`  Fetch errors:           ${errors.length}`);
  console.log(`  Non-200 status:         ${non200.length}`);
  console.log(`  Redirects (3xx):        ${redirects.length}`);
  console.log(`  Missing <title>:        ${missingTitle.length}`);
  console.log(`  No H1 tag:              ${noH1.length}`);
  console.log(`  Multiple H1:            ${multipleH1.length}`);
  console.log(`  Missing canonical:      ${missingCanon.length}`);

  console.log('\n=== 🟡 QUALITY ===');
  console.log(`  Title >60 chars:        ${longTitle.length}`);
  console.log(`  Missing description:    ${missingDesc.length}`);
  console.log(`  Description >160 chars: ${longDesc.length}`);
  console.log(`  Missing og:image:       ${missingOg.length}`);
  console.log(`  Missing JSON-LD:        ${missingJsonLd.length}`);

  // Sample problem URLs (first 5 each)
  const sample = (name, list) => {
    if (list.length === 0) return;
    console.log(`\n--- Sample ${name} ---`);
    for (const r of list.slice(0, 5)) {
      const detail = r.error ? `error: ${r.error}` : r.status !== 200 ? `status ${r.status}` : `len ${r.titleLen}/${r.descLen}`;
      console.log(`  ${r.url}  (${detail})`);
    }
  };
  sample('errors', errors);
  sample('non-200', non200);
  sample('redirects', redirects);
  sample('missing title', missingTitle);
  sample('long titles', longTitle);
  sample('long descriptions', longDesc);
  sample('no H1', noH1);
  sample('multiple H1', multipleH1);
  sample('missing canonical', missingCanon);

  // Total page weight distribution
  const ok = results.filter(r => !r.error && r.status === 200);
  ok.sort((a, b) => b.bytes - a.bytes);
  console.log('\n=== 📦 HEAVIEST HTML PAYLOADS (top 5) ===');
  for (const r of ok.slice(0, 5)) {
    console.log(`  ${(r.bytes / 1024).toFixed(0).padStart(4)} KB  ${r.url.replace(BASE, '')}`);
  }
  console.log(`\nTotal pages crawled: ${results.length}`);
  console.log(`Wrote ${OUT}`);
})();
