// ════════════════════════════════════════════════════════════════════════
// Brain Bar — v2b smoke test
// ────────────────────────────────────────────────────────────────────────
// Tests EVERY v2b feature against a running dev server (port 1316):
//   1. synonym tier (antivirus → mde with hint)
//   2. did-you-mean tier (intuune → intune typo correction)
//   3. multi-token tier (defender for endpoint → mde)
//   4. match highlighting (<mark> wraps matched chars)
//   5. recent searches save + restore + clear
//   6. help overlay open (?) / close (esc / backdrop / × button)
//   7. random entry link navigates to a real entry page
//   8. freshness dot rendered on entry page
//   9. existing v1 behaviour still works (mde → exact-open)
//  10. log-miss is NOT triggered for synonym hits
// Exit 0 = all pass, 1 = any fail.
// ════════════════════════════════════════════════════════════════════════

import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:1316';
const fails = [];
const passes = [];

function pass(name, detail = '') { passes.push({ name, detail }); }
function fail(name, detail = '') { fails.push({ name, detail }); }
function expect(cond, name, detail = '') { (cond ? pass : fail)(name, detail); }

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

// Track outbound miss-log requests
const missLogs = [];
page.on('request', (req) => {
  if (req.url().endsWith('/api/log-miss')) {
    missLogs.push({ method: req.method(), body: req.postData() });
  }
});

// Track console errors AND failed network requests
const errors = [];
const failedRequests = [];
page.on('pageerror', (err) => errors.push(err.message));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`[console] ${msg.text()}`);
});
page.on('response', (resp) => {
  if (resp.status() >= 400 && !resp.url().endsWith('/api/log-miss')) {
    failedRequests.push({ url: resp.url(), status: resp.status() });
  }
});

await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => !!document.querySelector('#bb-input'));
await page.waitForFunction(() => {
  const status = document.querySelector('#bb-input-status');
  return status && status.textContent.includes('entries');
});

// ── Test 1: synonym tier — "antivirus" → mde ────────────────────────────
async function typeQuery(q) {
  await page.fill('#bb-input', '');
  await page.fill('#bb-input', q);
  await page.waitForTimeout(80);
}

await typeQuery('antivirus');
const synResults = await page.$$eval('#bb-results .bb-result', els =>
  els.map(el => ({
    slug: el.querySelector('.bb-result-slug')?.textContent?.trim(),
    hint: el.querySelector('.bb-result-hint')?.textContent?.trim() || '',
  }))
);
expect(synResults.length > 0 && synResults[0].slug.startsWith('mde'),
  'T1 synonym antivirus → mde',
  `got: ${JSON.stringify(synResults.slice(0, 2))}`);
expect(synResults[0]?.hint?.includes('synonym'),
  'T1 synonym hint shown',
  `hint: ${synResults[0]?.hint}`);

// ── Test 2: did-you-mean — "intuune" → intune ───────────────────────────
await typeQuery('intuune');
const dymResults = await page.$$eval('#bb-results .bb-result', els =>
  els.map(el => ({
    slug: el.querySelector('.bb-result-slug')?.textContent?.trim(),
    hint: el.querySelector('.bb-result-hint')?.textContent?.trim() || '',
  }))
);
expect(dymResults.length === 1 && dymResults[0].slug.startsWith('intune'),
  'T2 typo intuune → intune',
  `got: ${JSON.stringify(dymResults)}`);
expect(dymResults[0]?.hint?.includes('did you mean'),
  'T2 did-you-mean hint shown',
  `hint: ${dymResults[0]?.hint}`);

// ── Test 2b: did-you-mean does NOT preselect (Enter does nothing) ───────
await page.keyboard.press('Enter');
await page.waitForTimeout(150);
const stillOnHome = page.url().endsWith('/') || page.url().endsWith('/?q=');
expect(stillOnHome,
  'T2b did-you-mean does not auto-navigate on Enter',
  `url after Enter: ${page.url()}`);

// User arrows down then Enter — should navigate
await page.keyboard.press('ArrowDown');
await page.waitForTimeout(50);
await page.keyboard.press('Enter');
await page.waitForURL('**/intune/', { timeout: 5000 }).catch(() => {});
await page.waitForLoadState('domcontentloaded');
expect(page.url().includes('/intune/'),
  'T2c did-you-mean Enter after arrow → navigates',
  `url: ${page.url()}`);

// ── Test 3: multi-token — "defender for endpoint" → mde ─────────────────
await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => document.querySelector('#bb-input'));
await typeQuery('defender for endpoint');
const tokResults = await page.$$eval('#bb-results .bb-result', els =>
  els.map(el => el.querySelector('.bb-result-slug')?.textContent?.trim())
);
expect(tokResults.some(s => s?.startsWith('mde')),
  'T3 multi-token defender for endpoint → mde in results',
  `got: ${JSON.stringify(tokResults.slice(0, 3))}`);

// ── Test 4: match highlighting — <mark> wraps matched chars ─────────────
await typeQuery('intu');
const markCount = await page.$$eval('#bb-results .bb-mark', els => els.length);
expect(markCount > 0,
  'T4 match highlighting renders <mark> tags',
  `mark count: ${markCount}`);

// ── Test 5a: recent search saved on Enter navigation ────────────────────
await typeQuery('mde');
await page.keyboard.press('Enter');
await page.waitForURL('**/mde/', { timeout: 5000 }).catch(() => {});
await page.waitForLoadState('domcontentloaded');
expect(page.url().includes('/mde/'),
  'T5a Enter on exact match navigates',
  `url: ${page.url()}`);

// Go back home, recent should appear
await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => !!document.querySelector('#bb-input'));
await page.waitForTimeout(100);  // allow JS to render recent block
const recentVisible = await page.$eval('#bb-recent', el => !el.hidden && el.children.length > 0).catch(() => false);
expect(recentVisible,
  'T5b recent searches block visible after navigation',
  `visible: ${recentVisible}`);

const recentChips = await page.$$eval('.bb-recent-chip', els => els.map(el => el.textContent?.trim()));
expect(recentChips.some(t => t?.includes('mde')),
  'T5c mde appears in recent chips',
  `chips: ${JSON.stringify(recentChips)}`);

// ── Test 5d: clear recent ───────────────────────────────────────────────
await page.click('[data-recent-clear]');
await page.waitForTimeout(50);
const recentAfterClear = await page.$eval('#bb-recent', el => el.hidden).catch(() => true);
expect(recentAfterClear,
  'T5d clear button hides recent block',
  `hidden after clear: ${recentAfterClear}`);

// ── Test 6: help overlay opens with ? then closes with esc ──────────────
// Click outside input first to ensure not focused
await page.click('body');
await page.waitForTimeout(50);
await page.keyboard.press('?');
await page.waitForTimeout(80);
const helpOpenAfterQ = await page.$eval('#bb-help', el => !el.hidden).catch(() => false);
expect(helpOpenAfterQ,
  'T6a help overlay opens on ?',
  `open: ${helpOpenAfterQ}`);

await page.keyboard.press('Escape');
await page.waitForTimeout(80);
const helpClosedAfterEsc = await page.$eval('#bb-help', el => el.hidden).catch(() => true);
expect(helpClosedAfterEsc,
  'T6b help overlay closes on Esc',
  `hidden: ${helpClosedAfterEsc}`);

// ── Test 6c: × button closes overlay ────────────────────────────────────
await page.click('body');
await page.waitForTimeout(50);
await page.keyboard.press('?');
await page.waitForTimeout(80);
await page.click('.bb-help-close');
await page.waitForTimeout(80);
const helpClosedByBtn = await page.$eval('#bb-help', el => el.hidden);
expect(helpClosedByBtn, 'T6c help overlay closes on × click');

// ── Test 7: random entry link navigates to a real entry ─────────────────
await page.click('#bb-random');
await page.waitForLoadState('domcontentloaded');
const randomUrl = page.url();
const isRealEntry = /\/[a-z0-9-]+\/$/.test(randomUrl) && !randomUrl.endsWith('/all/') && !randomUrl.endsWith('/about/');
expect(isRealEntry,
  'T7 random link goes to a real entry page',
  `url: ${randomUrl}`);

// ── Test 8: freshness dot rendered on entry header ──────────────────────
await page.goto(`${BASE}/mde/`, { waitUntil: 'domcontentloaded' });
const freshDotClass = await page.$eval('.bb-fresh-dot', el => el.className).catch(() => '');
expect(/bb-fresh-(fresh|amber|stale)/.test(freshDotClass),
  'T8 freshness dot rendered with state class',
  `class: ${freshDotClass}`);

// ── Test 9: existing v1 — exact match still auto-opens ──────────────────
await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => !!document.querySelector('#bb-input'));
await page.waitForFunction(() => {
  const status = document.querySelector('#bb-input-status');
  return status && status.textContent.includes('entries');
});
await page.fill('#bb-input', 'pim');
await page.waitForTimeout(80);
await page.keyboard.press('Enter');
await page.waitForURL('**/pim/', { timeout: 5000 }).catch(() => {});
await page.waitForLoadState('domcontentloaded');
expect(page.url().includes('/pim/'),
  'T9 exact slug "pim" + Enter → /pim/',
  `url: ${page.url()}`);

// ── Test 10: synonym hits should NOT trigger /api/log-miss ──────────────
await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => !!document.querySelector('#bb-input'));
await page.waitForFunction(() => {
  const status = document.querySelector('#bb-input-status');
  return status && status.textContent.includes('entries');
});
const logsBefore = missLogs.length;
await typeQuery('antivirus');           // synonym → resolves
await page.waitForTimeout(200);
const logsAfter = missLogs.length;
expect(logsAfter === logsBefore,
  'T10 synonym hit does not trigger log-miss',
  `before: ${logsBefore}, after: ${logsAfter}`);

// ── Test 10b: a true zero-result query DOES trigger log-miss ────────────
// (use a slug-shaped term that's nowhere in the index)
await typeQuery('xyzzyfoobar');
await page.waitForTimeout(200);
const logsFinal = missLogs.length;
expect(logsFinal > logsAfter,
  'T10b true miss DOES trigger log-miss',
  `logs: ${logsFinal} (was ${logsAfter})`);

// ── Test 12: /watch/ page renders + lists entries ──────────────────────
await page.goto(`${BASE}/watch/`, { waitUntil: 'domcontentloaded' });
const watchItems = await page.$$eval('.bb-watch-item', els => els.length);
expect(watchItems >= 5,
  'T12 /watch/ lists ≥5 entries with watch values',
  `count: ${watchItems}`);

const watchHasPriceRise = await page.evaluate(() =>
  !!document.body.textContent.match(/list price rises/i));
expect(watchHasPriceRise,
  'T12 /watch/ shows price-rise watch text');

// ── Test 13: JSON-LD on entry pages ─────────────────────────────────────
await page.goto(`${BASE}/mde/`, { waitUntil: 'domcontentloaded' });
const ldRaw = await page.$eval('script[type="application/ld+json"]', el => el.textContent).catch(() => '');
let ld = null;
try { ld = JSON.parse(ldRaw); } catch (e) { /* */ }
expect(ld && ld['@type'] === 'DefinedTerm' && ld.termCode === 'mde',
  'T13 mde has DefinedTerm JSON-LD with termCode',
  `parsed: ${ld ? JSON.stringify({ type: ld['@type'], termCode: ld.termCode }) : 'parse failed'}`);
expect(ld && Array.isArray(ld.alternateName) && ld.alternateName.includes('MDE'),
  'T13 alternateName array includes MDE');
expect(ld && ld.sameAs && ld.sameAs.includes('defender-endpoint'),
  'T13 sameAs links to MS Learn');

// ── Test 14: JSON-LD on disambiguation page ─────────────────────────────
await page.goto(`${BASE}/defender/`, { waitUntil: 'domcontentloaded' });
const disambigLdRaw = await page.$eval('script[type="application/ld+json"]', el => el.textContent).catch(() => '');
let disambigLd = null;
try { disambigLd = JSON.parse(disambigLdRaw); } catch (e) { /* */ }
expect(disambigLd && disambigLd['@type'] === 'WebPage' && Array.isArray(disambigLd.mentions),
  'T14 defender disambig has WebPage JSON-LD with mentions',
  `parsed: ${disambigLd ? JSON.stringify({ type: disambigLd['@type'], mentions: disambigLd.mentions?.length }) : 'parse failed'}`);

// ── Test 15: Boot block has //what's coming link ────────────────────────
await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => !!document.querySelector('#bb-input'));
const bootHasWatch = await page.$$eval('a', els =>
  els.some(a => a.getAttribute('href') === '/watch/'));
expect(bootHasWatch,
  'T15 boot block has /watch/ link');

// ── Test 16: watch banner uses raw text (no humanize) ──────────────────
await page.goto(`${BASE}/m365-e3/`, { waitUntil: 'domcontentloaded' });
const watchBannerText = await page.$eval('.bb-banner-watch', el => el.textContent.trim()).catch(() => '');
expect(watchBannerText.includes('List price rises'),
  'T16 m365-e3 watch banner shows raw human-readable text',
  `text: ${watchBannerText.slice(0, 100)}`);

// ── Test 11: only ignorable console errors (favicon 404 acceptable) ────
// Chromium logs a generic "Failed to load resource: 404" for any 404,
// without the URL. Use the response listener to filter out favicon-only.
const non404ConsoleErrors = errors.filter(e => !/Failed to load resource.*404/i.test(e));
const non404FailedReqs = failedRequests.filter(r => !/favicon/i.test(r.url));
const allOk = non404ConsoleErrors.length === 0 && non404FailedReqs.length === 0;
expect(allOk,
  'T11 no real console errors / non-favicon 404s',
  allOk ? `clean (favicon 404 expected — v2d backlog)` :
    `console: ${JSON.stringify(non404ConsoleErrors)} | requests: ${JSON.stringify(non404FailedReqs)}`);

// ── Report ──────────────────────────────────────────────────────────────
await browser.close();

console.log('\n═══ PASSES (' + passes.length + ') ═══');
for (const p of passes) console.log('  ✓ ' + p.name);

if (fails.length) {
  console.log('\n═══ FAILS (' + fails.length + ') ═══');
  for (const f of fails) console.log('  ✗ ' + f.name + (f.detail ? ' — ' + f.detail : ''));
  process.exit(1);
}
console.log('\n🟢 ALL ' + passes.length + ' v2b CHECKS PASSED');
