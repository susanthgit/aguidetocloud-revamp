// SEO / Quality audit — surfaces what Google looks at when ranking and indexing pages.
// Covers indexability, title/desc/H1 health, structured data, canonical, OG/Twitter,
// HTTPS / mixed-content, viewport / lang, security headers.
//
// Output: audit-output/seo-quality.json + grouped console findings
//
// Usage:
//   node scripts/seo-quality-audit.mjs
//   node scripts/seo-quality-audit.mjs --only home,roi-calc

import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const OUT = path.join(REPO_ROOT, 'audit-output', 'seo-quality.json');

const PAGES = [
  ['/', 'home'],
  ['/free-tools/', 'tools-hub'],
  ['/blog/', 'blog-index'],
  ['/copilot-matrix/', 'copilot-matrix'],
  ['/roi-calculator/', 'roi-calc'],
  ['/licence-picker/', 'licence-picker'],
  ['/m365-roadmap/', 'roadmap'],
  ['/ai-news/', 'ainews'],
  ['/service-health/', 'service-health'],
  ['/cert-tracker/', 'cert-tracker'],
  ['/cert-tracker/az-900/', 'cert-page-az900'],
  ['/world-clock/', 'world-clock'],
  ['/color-palette/', 'color-palette'],
  ['/site-analytics/', 'site-analytics'],
  ['/copilot-readiness/', 'readiness'],
  ['/blog/how-microsoft-365-copilot-works-layer-by-layer/', 'blog-post'],
  ['/study-guides/', 'sg-index'],
];

const args = process.argv.slice(2);
const onlyIdx = args.indexOf('--only');
const ONLY = onlyIdx >= 0 && args[onlyIdx + 1] ? new Set(args[onlyIdx + 1].split(',').map(s => s.trim())) : null;
const TARGETS = ONLY ? PAGES.filter(([_, slug]) => ONLY.has(slug)) : PAGES;
const BASE = 'https://www.aguidetocloud.com';

async function auditPage(browser, url, slug) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const mixedContent = [];
  const failedResources = [];
  let responseHeaders = {};

  page.on('response', resp => {
    const u = resp.url();
    if (u === url) {
      responseHeaders = resp.headers();
    }
    if (u.startsWith('http://') && !u.startsWith('http://localhost')) {
      mixedContent.push(u.slice(0, 100));
    }
    if (resp.status() >= 400) {
      failedResources.push({ status: resp.status(), url: u.slice(0, 100) });
    }
  });

  try {
    const navResp = await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    try { await page.waitForLoadState('networkidle', { timeout: 5000 }); } catch (e) {}
    await page.waitForTimeout(1000);

    const httpStatus = navResp.status();
    const probe = await page.evaluate(() => {
      const out = {};
      const head = document.head;

      // Title
      out.title = (document.title || '').trim();
      out.titleLength = out.title.length;

      // Meta description
      const desc = head.querySelector('meta[name="description"]');
      out.description = desc ? (desc.content || '').trim() : '';
      out.descriptionLength = out.description.length;

      // Canonical
      const canon = head.querySelector('link[rel="canonical"]');
      out.canonical = canon ? canon.href : '';

      // Robots meta
      const robotsM = head.querySelector('meta[name="robots"]');
      out.robotsMeta = robotsM ? robotsM.content : '';
      out.noindex = /noindex/i.test(out.robotsMeta);
      out.nofollow = /nofollow/i.test(out.robotsMeta);

      // viewport
      const vp = head.querySelector('meta[name="viewport"]');
      out.viewport = vp ? vp.content : '';

      // lang
      out.lang = document.documentElement.getAttribute('lang') || '';

      // H1 tags
      const h1s = document.querySelectorAll('h1');
      out.h1Count = h1s.length;
      out.h1Texts = Array.from(h1s).slice(0, 3).map(h => (h.textContent || '').trim().slice(0, 100));

      // Heading hierarchy (h1->h2->h3 should not skip)
      const allHeadings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const headingSkips = [];
      let lastLevel = 0;
      for (const h of allHeadings) {
        const level = parseInt(h.tagName[1]);
        if (lastLevel > 0 && level > lastLevel + 1) {
          headingSkips.push({ from: 'h' + lastLevel, to: h.tagName.toLowerCase(), text: (h.textContent || '').trim().slice(0, 60) });
        }
        lastLevel = level;
      }
      out.headingSkips = headingSkips.slice(0, 5);

      // OG / Twitter
      const ogTitle = head.querySelector('meta[property="og:title"]');
      const ogDesc = head.querySelector('meta[property="og:description"]');
      const ogImg = head.querySelector('meta[property="og:image"]');
      const ogImgW = head.querySelector('meta[property="og:image:width"]');
      const ogImgH = head.querySelector('meta[property="og:image:height"]');
      const ogUrl = head.querySelector('meta[property="og:url"]');
      const twCard = head.querySelector('meta[name="twitter:card"]');
      out.ogTitle = ogTitle ? (ogTitle.content || '').trim() : '';
      out.ogDescription = ogDesc ? (ogDesc.content || '').trim() : '';
      out.ogImage = ogImg ? ogImg.content : '';
      out.ogImageWidth = ogImgW ? parseInt(ogImgW.content) : 0;
      out.ogImageHeight = ogImgH ? parseInt(ogImgH.content) : 0;
      out.ogUrl = ogUrl ? ogUrl.content : '';
      out.twitterCard = twCard ? twCard.content : '';

      // JSON-LD
      const jsonLdScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      out.jsonLdCount = jsonLdScripts.length;
      out.jsonLdSchemaTypes = [];
      out.jsonLdParseErrors = [];
      for (const s of jsonLdScripts) {
        try {
          const data = JSON.parse(s.textContent || '{}');
          const types = Array.isArray(data) ? data.map(d => d['@type']).filter(Boolean) : [data['@type']].filter(Boolean);
          out.jsonLdSchemaTypes.push(...types.flat());
        } catch (e) {
          out.jsonLdParseErrors.push(String(e.message).slice(0, 80));
        }
      }

      // hreflang
      out.hreflangCount = head.querySelectorAll('link[rel="alternate"][hreflang]').length;

      // External links missing rel=noopener
      const extLinks = Array.from(document.querySelectorAll('a[target="_blank"]'));
      out.externalLinksTotal = extLinks.length;
      out.externalLinksMissingNoopener = extLinks.filter(a => !(a.rel || '').includes('noopener')).length;

      // Internal link count
      const allLinks = Array.from(document.querySelectorAll('a[href]'));
      const origin = location.origin;
      const internal = allLinks.filter(a => {
        const href = a.getAttribute('href') || '';
        return href.startsWith('/') || href.startsWith(origin);
      });
      out.internalLinkCount = internal.length;

      // Word count (body text)
      const bodyText = (document.body.innerText || '').trim();
      out.wordCount = bodyText.split(/\s+/).filter(Boolean).length;

      // favicon
      out.hasFavicon = !!head.querySelector('link[rel*="icon"]');

      // Theme color
      const tc = head.querySelector('meta[name="theme-color"]');
      out.themeColor = tc ? tc.content : '';

      return out;
    });

    await ctx.close();
    return {
      slug, url, httpStatus,
      ...probe,
      mixedContent: mixedContent.slice(0, 5),
      failedResources: failedResources.slice(0, 5),
      headers: {
        contentType: responseHeaders['content-type'] || '',
        cacheControl: responseHeaders['cache-control'] || '',
        contentSecurityPolicy: !!responseHeaders['content-security-policy'],
        xFrameOptions: responseHeaders['x-frame-options'] || '',
        xContentTypeOptions: responseHeaders['x-content-type-options'] || '',
        strictTransportSecurity: responseHeaders['strict-transport-security'] || '',
        referrerPolicy: responseHeaders['referrer-policy'] || '',
        permissionsPolicy: responseHeaders['permissions-policy'] || '',
      },
    };
  } catch (e) {
    try { await ctx.close(); } catch {}
    return { slug, url, error: String(e.message || e) };
  }
}

async function checkSiteWide() {
  const out = {};
  // robots.txt
  try {
    const r = await fetch(BASE + '/robots.txt');
    out.robotsTxt = { status: r.status, body: (await r.text()).slice(0, 800) };
  } catch (e) { out.robotsTxt = { error: String(e.message) }; }
  // sitemap.xml
  try {
    const r = await fetch(BASE + '/sitemap.xml');
    const body = await r.text();
    const urlCount = (body.match(/<loc>/g) || []).length;
    out.sitemap = { status: r.status, urlCount, sample: body.slice(0, 500) };
  } catch (e) { out.sitemap = { error: String(e.message) }; }
  // 404 behaviour
  try {
    const r = await fetch(BASE + '/this-page-does-not-exist-' + Date.now());
    out.notFoundBehaviour = { status: r.status };
  } catch (e) { out.notFoundBehaviour = { error: String(e.message) }; }
  return out;
}

(async () => {
  await fs.mkdir(path.dirname(OUT), { recursive: true });
  const browser = await chromium.launch();
  const results = [];

  console.log('slug              status  title-len  desc-len  h1  canon  og-img  ld  noindex  hreflang  ext-nopr');
  console.log('-'.repeat(110));
  for (const [route, slug] of TARGETS) {
    const url = BASE + route;
    const r = await auditPage(browser, url, slug);
    if (r.error) {
      console.log(slug.padEnd(16), 'ERROR', r.error.slice(0, 80));
    } else {
      const ldOK = r.jsonLdCount > 0 ? r.jsonLdCount : 'NONE';
      const ogImgOK = r.ogImage ? '✓' : 'MISS';
      const canonOK = r.canonical ? '✓' : 'MISS';
      const nidx = r.noindex ? '!!NOINDEX!!' : '-';
      const extNopr = r.externalLinksMissingNoopener > 0 ? r.externalLinksMissingNoopener + '!' : '-';
      console.log(
        slug.padEnd(16),
        String(r.httpStatus).padStart(6),
        String(r.titleLength).padStart(9),
        String(r.descriptionLength).padStart(9),
        String(r.h1Count).padStart(3),
        canonOK.padStart(6),
        ogImgOK.padStart(7),
        String(ldOK).padStart(4),
        nidx.padStart(11),
        String(r.hreflangCount).padStart(8),
        extNopr.padStart(9),
      );
    }
    results.push(r);
  }
  await browser.close();
  const siteWide = await checkSiteWide();

  await fs.writeFile(OUT, JSON.stringify({ generated: new Date().toISOString(), base: BASE, results, siteWide }, null, 2));
  console.log('\nWrote ' + OUT);

  // ── Findings ──
  console.log('\n=== 🔴 BLOCKERS (Google won\'t show / will demote) ===');
  for (const r of results) {
    if (r.error) continue;
    if (r.noindex) console.log(`  ${r.slug}: NOINDEX meta tag detected (${r.robotsMeta})`);
    if (r.httpStatus >= 400) console.log(`  ${r.slug}: HTTP ${r.httpStatus}`);
    if (!r.canonical) console.log(`  ${r.slug}: missing canonical URL`);
    if (r.h1Count === 0) console.log(`  ${r.slug}: NO H1 tag`);
    if (r.h1Count > 1) console.log(`  ${r.slug}: ${r.h1Count} H1 tags (should be 1)`);
    if (!r.title || r.titleLength < 10) console.log(`  ${r.slug}: title too short or missing (${r.titleLength} chars)`);
    if (!r.viewport) console.log(`  ${r.slug}: missing viewport meta`);
    if (!r.lang) console.log(`  ${r.slug}: missing lang attribute`);
    if (r.mixedContent.length > 0) console.log(`  ${r.slug}: mixed content (${r.mixedContent.length} http:// resources)`);
  }

  console.log('\n=== 🟡 SEO QUALITY ISSUES (ranking impact) ===');
  for (const r of results) {
    if (r.error) continue;
    if (r.titleLength > 60) console.log(`  ${r.slug}: title ${r.titleLength} chars (>60 = truncated in SERPs): "${r.title.slice(0, 80)}..."`);
    if (r.titleLength > 0 && r.titleLength < 30) console.log(`  ${r.slug}: title ${r.titleLength} chars (<30 = under-utilized): "${r.title}"`);
    if (r.descriptionLength > 160) console.log(`  ${r.slug}: description ${r.descriptionLength} chars (>160 = truncated)`);
    if (r.descriptionLength > 0 && r.descriptionLength < 50) console.log(`  ${r.slug}: description ${r.descriptionLength} chars (<50 = under-utilized)`);
    if (r.descriptionLength === 0) console.log(`  ${r.slug}: MISSING meta description`);
    if (!r.ogImage) console.log(`  ${r.slug}: missing og:image (social share won't render thumbnail)`);
    if (r.ogImage && (r.ogImageWidth !== 1200 || r.ogImageHeight !== 630)) console.log(`  ${r.slug}: og:image ${r.ogImageWidth}x${r.ogImageHeight} (Google prefers 1200x630)`);
    if (r.jsonLdCount === 0) console.log(`  ${r.slug}: no JSON-LD structured data`);
    if (r.jsonLdParseErrors.length > 0) console.log(`  ${r.slug}: JSON-LD parse error: ${r.jsonLdParseErrors[0]}`);
    if (r.externalLinksMissingNoopener > 0) console.log(`  ${r.slug}: ${r.externalLinksMissingNoopener}/${r.externalLinksTotal} external links missing rel="noopener" (security/perf)`);
    if (r.headingSkips.length > 0) console.log(`  ${r.slug}: heading hierarchy skip — ${r.headingSkips.map(s => s.from + '→' + s.to).join(', ')}`);
    if (r.wordCount < 300 && !r.slug.startsWith('blog-')) console.log(`  ${r.slug}: only ${r.wordCount} words (thin content threshold)`);
  }

  // Title uniqueness
  console.log('\n=== TITLE UNIQUENESS ===');
  const titleMap = new Map();
  for (const r of results) {
    if (r.error || !r.title) continue;
    if (!titleMap.has(r.title)) titleMap.set(r.title, []);
    titleMap.get(r.title).push(r.slug);
  }
  for (const [title, slugs] of titleMap) {
    if (slugs.length > 1) console.log(`  DUPE: "${title}" — used by: ${slugs.join(', ')}`);
  }

  // Description uniqueness
  const descMap = new Map();
  for (const r of results) {
    if (r.error || !r.description) continue;
    if (!descMap.has(r.description)) descMap.set(r.description, []);
    descMap.get(r.description).push(r.slug);
  }
  for (const [desc, slugs] of descMap) {
    if (slugs.length > 1) console.log(`  DUPE DESC: "${desc.slice(0, 60)}..." — used by: ${slugs.join(', ')}`);
  }

  console.log('\n=== 🛡️ SECURITY HEADERS (from response of first audited page) ===');
  const firstOK = results.find(r => !r.error);
  if (firstOK) {
    const h = firstOK.headers;
    console.log(`  Content-Security-Policy:    ${h.contentSecurityPolicy ? '✓' : '✗ missing'}`);
    console.log(`  X-Frame-Options:            ${h.xFrameOptions || '✗ missing'}`);
    console.log(`  X-Content-Type-Options:     ${h.xContentTypeOptions || '✗ missing'}`);
    console.log(`  Strict-Transport-Security:  ${h.strictTransportSecurity ? '✓' : '✗ missing'}`);
    console.log(`  Referrer-Policy:            ${h.referrerPolicy || '✗ missing'}`);
    console.log(`  Permissions-Policy:         ${h.permissionsPolicy ? '✓' : '✗ missing'}`);
  }

  console.log('\n=== 🌐 SITE-WIDE CHECKS ===');
  console.log(`  robots.txt status:   ${siteWide.robotsTxt.status}`);
  console.log(`  sitemap URL count:   ${siteWide.sitemap.urlCount || 'N/A'} (status ${siteWide.sitemap.status})`);
  console.log(`  404 page returns:    HTTP ${siteWide.notFoundBehaviour.status} ${siteWide.notFoundBehaviour.status === 404 ? '✓' : '⚠️ (Google needs 404 for missing pages)'}`);
})();
