// snap-about-qa.mjs — full SME+QA sweep
// 5 viewports × 2 themes = 10 shots, plus print preview, console errors,
// a11y structural checks, JSON-LD validation, SLA smoke.
//
// Usage: node snap-about-qa.mjs [BASE_URL] [OUT_DIR]
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const BASE = (process.argv[2] || 'https://www.aguidetocloud.com').replace(/\/$/, '');
const OUT  = resolve(process.argv[3] || 'C:/ssClawy/aguidetocloud-revamp/qa/qa-review');
mkdirSync(OUT, { recursive: true });
const URL = BASE + '/about/';

const viewports = [
  { name: 'iphone-se',     w: 320,  h: 568  }, // smallest common
  { name: 'mobile-390',    w: 390,  h: 844  }, // iPhone 12+
  { name: 'tablet-768',    w: 768,  h: 1024 }, // iPad portrait
  { name: 'desktop-1440',  w: 1440, h: 900  },
  { name: 'desktop-1920',  w: 1920, h: 1080 }, // wide desktop
];
const themes = ['light', 'dark'];

const findings = { url: URL, viewports: [], a11y: {}, jsonld: null, console: [], network: [], cosmosbar: null, print: null, sla: null };

function logFinding(label, ok, detail) {
  const tag = ok ? '✓' : '✗';
  console.log(`${tag} ${label}${detail ? ' — ' + detail : ''}`);
}

const browser = await chromium.launch();

// ── Pass 1 — every viewport × theme ────────────────────────────
for (const vp of viewports) {
  for (const theme of themes) {
    const ctx = await browser.newContext({
      viewport: { width: vp.w, height: vp.h },
      colorScheme: theme,
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    const consoleMsgs = [];
    const failedReqs = [];
    page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') consoleMsgs.push({ type: m.type(), text: m.text().slice(0, 200) }); });
    page.on('requestfailed', r => failedReqs.push({ url: r.url(), error: r.failure()?.errorText }));
    page.on('response', r => {
      const u = r.url();
      // Track 4xx/5xx for assets we care about
      if (r.status() >= 400 && (u.includes('aguidetocloud.com') || u.includes('cosmos'))) {
        failedReqs.push({ url: u, status: r.status() });
      }
    });

    await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.evaluate((t) => {
      document.documentElement.dataset.theme = t;
      try { localStorage.setItem('theme', t); } catch {}
    }, theme);
    await page.waitForTimeout(500);

    const file = `${OUT}/about__${vp.name}__${theme}.png`;
    await page.screenshot({ path: file, fullPage: true });

    // A11y / structural checks per viewport (only do once per VP at light theme)
    if (theme === 'light') {
      const checks = await page.evaluate(() => {
        const get = (sel) => Array.from(document.querySelectorAll(sel));
        return {
          h1Count: get('h1').length,
          h1Text: get('h1').map(h => h.textContent?.trim()).filter(Boolean),
          mainCount: get('main, [role=main]').length,
          navCount: get('nav, [role=navigation]').length,
          asideCount: get('aside, [role=complementary]').length,
          stamp: !!document.querySelector('.zt-about-stamp'),
          stampLabel: document.querySelector('.zt-about-stamp')?.getAttribute('aria-label') || null,
          cosmosCtaHref: document.querySelector('.zt-about-cta-cosmos')?.getAttribute('href') || null,
          cosmosCtaLabel: document.querySelector('.zt-about-cta-cosmos')?.getAttribute('aria-label') || null,
          chipsCount: get('.zt-about-chip').length,
          chipsLabel: document.querySelector('.zt-about-chips')?.getAttribute('aria-label') || null,
          marginPresent: !!document.querySelector('.zt-about-margin'),
          marginText: document.querySelector('.zt-about-margin')?.textContent?.trim() || null,
          planetsCount: get('.zt-about-planet').length,
          planetsVisible: (() => {
            const el = document.querySelector('.zt-about-planets');
            if (!el) return false;
            const cs = getComputedStyle(el);
            return cs.display !== 'none' && cs.visibility !== 'hidden';
          })(),
          resumeLinkPresent: !!document.querySelector('.zt-about-resume-link a'),
          resumeLinkHref: document.querySelector('.zt-about-resume-link a')?.getAttribute('href') || null,
          companionPlanets: !!document.querySelector('.zt-companion-planets'),
          companionPlanetsCount: get('.zt-companion-planets .zt-companion-link').length,
          oldDownloadButton: get('.zt-about-btn').length, // should be 0
          oldExploreCta: get('.zt-companion-cta-btn').length, // should be 0
          // Pagefind
          pagefindIgnored: get('[data-pagefind-ignore]').length,
          // Image alt
          headshotAlt: document.querySelector('.zt-about-headshot')?.getAttribute('alt') || null,
          // External links security
          externalChips: get('.zt-about-chip[href^="http"]').map(a => ({
            href: a.href, target: a.getAttribute('target'), rel: a.getAttribute('rel')
          })),
          externalPlanets: get('.zt-about-planet[href^="http"]').map(a => ({
            href: a.href, target: a.getAttribute('target'), rel: a.getAttribute('rel')
          })),
          // Cosmos-bar mounted?
          cosmosBarTag: !!document.querySelector('cosmos-bar'),
          cosmosBarActive: document.querySelector('cosmos-bar')?.getAttribute('active') || null,
          // JSON-LD
          jsonldRaw: get('script[type="application/ld+json"]').map(s => s.textContent),
        };
      });

      // Save findings for first VP only (structural checks are viewport-independent for most things)
      if (vp.name === 'desktop-1440') {
        findings.a11y = checks;
        // Try to parse JSON-LD
        try {
          findings.jsonld = checks.jsonldRaw.map(j => { try { return JSON.parse(j); } catch (e) { return { _parseError: e.message, _raw: j.slice(0, 80) }; } });
        } catch (e) { findings.jsonld = { error: e.message }; }
      }

      findings.viewports.push({
        viewport: vp.name,
        h1OK: checks.h1Count === 1,
        plantsVisible: checks.planetsVisible,
        oldButtonsAbsent: checks.oldDownloadButton === 0 && checks.oldExploreCta === 0,
        chipsCount: checks.chipsCount,
        planetsCount: checks.planetsCount,
        consoleErrors: consoleMsgs.filter(m => m.type === 'error').length,
        failedRequests: failedReqs.length,
      });
    }

    findings.console.push(...consoleMsgs.map(m => ({ vp: vp.name, theme, ...m })));
    findings.network.push(...failedReqs.map(r => ({ vp: vp.name, theme, ...r })));
    await ctx.close();
  }
}

// ── Pass 2 — print preview ──────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 }, colorScheme: 'light' });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.emulateMedia({ media: 'print' });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/about__print.png`, fullPage: true });
  // Validate cosmos surfaces hidden in print
  const printChecks = await page.evaluate(() => {
    const isHidden = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      return getComputedStyle(el).display === 'none';
    };
    return {
      stampHidden: isHidden('.zt-about-stamp'),
      ctaRowHidden: isHidden('.zt-about-cta-row'),
      marginHidden: isHidden('.zt-about-margin'),
      planetsHidden: isHidden('.zt-about-planets'),
      companionPlanetsHidden: isHidden('.zt-companion-planets'),
      resumeVisible: !isHidden('.zt-about-resume-link'),
    };
  });
  findings.print = printChecks;
  await ctx.close();
}

// ── Pass 3 — cosmos-bar runtime mount + SLA smoke ──────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  // Wait extra for cosmos-bar.js to upgrade the custom element
  await page.waitForTimeout(2000);
  const barCheck = await page.evaluate(() => {
    const el = document.querySelector('cosmos-bar');
    if (!el) return { present: false };
    return {
      present: true,
      defined: !!customElements.get('cosmos-bar'),
      hasShadowDom: !!el.shadowRoot,
      activeAttr: el.getAttribute('active'),
      childCount: el.shadowRoot ? el.shadowRoot.children.length : 0,
    };
  });
  findings.cosmosbar = barCheck;
  await ctx.close();
}

// ── Pass 4 — SLA smoke (quick HTTP HEAD via fetch) ────────────
{
  try {
    const r1 = await fetch(BASE + '/guided/data/questions/az-900.json', { method: 'GET' });
    const j = await r1.text();
    const json = JSON.parse(j); // throws if invalid
    const r2 = await fetch(BASE + '/guided/az-900/practice/');
    const html = await r2.text();
    findings.sla = {
      jsonStatus: r1.status,
      jsonSizeKB: Math.round(j.length / 1024),
      jsonValid: Array.isArray(json),
      jsonFirstCert: json[0]?.meta?.cert || null,
      practiceStatus: r2.status,
      practiceSizeKB: Math.round(html.length / 1024),
      practiceUnder50KB: html.length < 50000,
      dataUrlPattern: /\/data\/questions\//.test(html),
    };
  } catch (e) {
    findings.sla = { error: e.message };
  }
}

writeFileSync(`${OUT}/findings.json`, JSON.stringify(findings, null, 2));
await browser.close();

// ── Print summary ─────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════════');
console.log(' QA Findings Summary');
console.log('══════════════════════════════════════════════════════════');
console.log(`URL: ${URL}\n`);

console.log('— Per-viewport structural —');
for (const v of findings.viewports) {
  console.log(`  ${v.viewport.padEnd(15)} h1OK=${v.h1OK} planets=${v.plantsVisible?'shown':'hidden'} chips=${v.chipsCount} planetCards=${v.planetsCount} oldRemoved=${v.oldButtonsAbsent} consoleErr=${v.consoleErrors} netFail=${v.failedRequests}`);
}

console.log('\n— A11y structure (1440px) —');
const a = findings.a11y;
console.log(`  H1 count: ${a.h1Count}    H1: ${(a.h1Text||[]).join(' | ')}`);
console.log(`  Landmarks: main=${a.mainCount} nav=${a.navCount} aside=${a.asideCount}`);
console.log(`  Headshot alt: "${a.headshotAlt}"`);
console.log(`  Stamp aria: "${a.stampLabel}"`);
console.log(`  Cosmos CTA: ${a.cosmosCtaHref} aria-label="${a.cosmosCtaLabel}"`);
console.log(`  Resume link href: ${a.resumeLinkHref}`);
console.log(`  Old "Download Resume" button count: ${a.oldDownloadButton} (must be 0)`);
console.log(`  Old explore CTA button count: ${a.oldExploreCta} (must be 0)`);
console.log(`  External chip target=_blank+rel=noopener:`);
for (const c of (a.externalChips||[])) console.log(`    ${c.href.padEnd(60)} target=${c.target} rel=${c.rel}`);
console.log(`  External planet target=_blank+rel=noopener:`);
for (const p of (a.externalPlanets||[])) console.log(`    ${p.href.padEnd(60)} target=${p.target} rel=${p.rel}`);

console.log('\n— Print preview —');
console.log(`  ${JSON.stringify(findings.print)}`);

console.log('\n— Cosmos-bar runtime —');
console.log(`  ${JSON.stringify(findings.cosmosbar)}`);

console.log('\n— SLA smoke (practice product) —');
console.log(`  ${JSON.stringify(findings.sla)}`);

console.log('\n— Console errors (across all viewports) —');
const errs = findings.console.filter(c => c.type === 'error');
if (errs.length === 0) console.log('  (none) ✓');
else for (const e of errs.slice(0, 10)) console.log(`  [${e.vp}/${e.theme}] ${e.text}`);

console.log('\n— Network failures —');
if (findings.network.length === 0) console.log('  (none) ✓');
else for (const n of findings.network.slice(0, 10)) console.log(`  [${n.vp}/${n.theme}] ${n.url} ${n.status||n.error}`);

console.log('\n— JSON-LD —');
console.log(`  ${(findings.jsonld||[]).length} block(s) on page`);
for (const j of (findings.jsonld||[])) {
  if (j._parseError) console.log(`    ✗ parse error: ${j._parseError}`);
  else console.log(`    ✓ @type=${j['@type']||'(unknown)'}`);
}

console.log('\nFull findings saved → findings.json');
