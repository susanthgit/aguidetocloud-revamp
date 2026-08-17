// Verification probe for the /feedback/ changes (Rule #14 + Gate B).
// Usage: node _verify-feedback.mjs <outDir> [baseUrl]
import { chromium } from 'playwright';
import fs from 'fs';

const outDir = process.argv[2];
const base = process.argv[3] || 'http://localhost:1314';
fs.mkdirSync(outDir, { recursive: true });

const results = [];
const check = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name} :: ${detail}`);
};

const browser = await chromium.launch();

// ── DESKTOP ───────────────────────────────────────────────────────────────
const dpage = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await dpage.goto(base + '/feedback/', { waitUntil: 'networkidle' });
await dpage.waitForTimeout(2500);

const d = await dpage.evaluate(() => {
  const rows = [...document.querySelectorAll('.feedback-acc')];
  const navLinks = [...document.querySelectorAll('.fb-nav-link')];
  const aside = document.querySelector('.zt-sidebar--tools');
  const box = el => { const r = el?.getBoundingClientRect(); return r ? Math.round(r.top + scrollY) : null; };
  return {
    rowCount: rows.length,
    firstRowText: (rows[0]?.querySelector('.feedback-acc-title')?.textContent || '').trim(),
    rowIds: rows.slice(0, 3).map(r => r.id),
    pinnedRows: document.querySelectorAll('.feedback-acc-pinned').length,
    navCount: navLinks.length,
    navCountBadge: document.getElementById('fb-nav-count')?.textContent,
    ariaLabel: aside?.getAttribute('aria-label'),
    hasToolsNav: !!document.querySelector('.zt-lic-nav-group summary')?.textContent?.includes('AI Tools'),
    navHtmlSafe: navLinks.every(a => !a.innerHTML.includes('<script')),
    heroTop: box(document.querySelector('.feedback-hero')),
    recentTop: box(document.querySelector('.feedback-recent')),
    backNavTop: box(document.querySelector('.feedback-container .back-nav')),
    titleFont: navLinks[0] ? getComputedStyle(navLinks[0].querySelector('.fb-nav-title')).fontSize : '',
    navInline: (() => {
      const a = navLinks[0];
      if (!a) return null;
      const n = a.querySelector('.fb-nav-num').getBoundingClientRect();
      const t = a.querySelector('.fb-nav-title').getBoundingClientRect();
      return { sameLine: Math.abs(n.top - t.top) < 6, numRight: Math.round(n.right), titleLeft: Math.round(t.left) };
    })(),
    navLinkAvgH: navLinks.length
      ? Math.round(navLinks.reduce((s, a) => s + a.getBoundingClientRect().height, 0) / navLinks.length)
      : null,
    navOverflow: navLinks.filter(a => {
      const t = a.querySelector('.fb-nav-title');
      return t && t.scrollWidth > t.clientWidth + 1;
    }).length,
  };
});

check('No pinned thread', d.pinnedRows === 0 && !d.firstRowText.includes('📌'), `pinned rows=${d.pinnedRows}, first="${d.firstRowText.slice(0, 50)}"`);
check('Newest thread first (#41)', d.firstRowText.includes('#41'), `first row = "${d.firstRowText.slice(0, 50)}"`);
check('Desktop: hero below the threads', d.heroTop && d.recentTop && d.heroTop > d.recentTop, `hero top=${d.heroTop}, threads top=${d.recentTop}`);
check('Desktop: hero above Back to Toolkit', d.heroTop && d.backNavTop && d.heroTop < d.backNavTop, `hero top=${d.heroTop}, back-nav top=${d.backNavTop}`);
check('Sidebar font reduced', parseFloat(d.titleFont) <= 12, `.fb-nav-title font-size=${d.titleFont}`);
check('Sidebar number inline with title', d.navInline?.sameLine === true, `num.right=${d.navInline?.numRight}, title.left=${d.navInline?.titleLeft}, sameLine=${d.navInline?.sameLine}`);
check('Sidebar rows are one line each (<=26px avg)', d.navLinkAvgH !== null && d.navLinkAvgH <= 26, `avg link height=${d.navLinkAvgH}px`);
check('All threads rendered (>=34)', d.rowCount >= 34, `${d.rowCount} rows in list`);
check('Rows have stable anchors', d.rowIds.every(i => i.startsWith('discussion-')), d.rowIds.join(', '));
check('Sidebar thread nav populated', d.navCount >= 34, `${d.navCount} links, badge="${d.navCountBadge}"`);
check('Sidebar landmark relabelled', d.ariaLabel === 'Feedback thread navigation', `aria-label="${d.ariaLabel}"`);
check('Tools nav replaced, not extended', !d.hasToolsNav, `AI Tools group present = ${d.hasToolsNav}`);
check('No script injection in nav', d.navHtmlSafe, 'all links textContent-built');

// Guardrail: .zt-lic-nav-link-name ships white-space:nowrap, which silently
// clipped thread titles mid-word on first deploy. Automated checks all passed;
// only vision QA caught it. Never again.
const clip = await dpage.evaluate(() => {
  const els = [...document.querySelectorAll('.fb-nav-title')];
  const cs = els[0] ? getComputedStyle(els[0]) : null;
  // Titles are single-line now, so overflow is expected — what must never
  // happen is overflow WITHOUT an ellipsis, or text escaping the sidebar box.
  const nav = document.getElementById('fb-nav-links');
  const navRight = nav ? nav.getBoundingClientRect().right : 0;
  const escaped = els.filter(el => el.getBoundingClientRect().right > navRight + 1);
  const truncated = els.filter(el => el.scrollWidth > el.clientWidth + 1);
  return {
    total: els.length,
    escaped: escaped.length,
    truncated: truncated.length,
    wrap: cs?.whiteSpace || '',
    ellipsis: cs?.textOverflow || '',
    overflow: cs?.overflow || '',
    sample: truncated[0]?.textContent?.slice(0, 40) || '',
  };
});
check('Sidebar titles truncate with an ellipsis, never a hard chop',
  clip.wrap === 'nowrap' && clip.ellipsis === 'ellipsis' && clip.overflow !== 'visible',
  `white-space=${clip.wrap}, text-overflow=${clip.ellipsis}, overflow=${clip.overflow}, ${clip.truncated}/${clip.total} truncated${clip.sample ? ', e.g. "' + clip.sample + '"' : ''}`);
check('Sidebar titles stay inside the sidebar', clip.escaped === 0,
  `${clip.escaped}/${clip.total} escaping the nav box`);

// Sidebar click → reveals + expands + scrolls
const targetNum = await dpage.evaluate(() => {
  const links = [...document.querySelectorAll('.fb-nav-link')];
  return links[links.length - 1]?.getAttribute('href')?.replace('#discussion-', '');
});
if (targetNum) {
  await dpage.click(`.fb-nav-link[href="#discussion-${targetNum}"]`);
  await dpage.waitForTimeout(1200);
  const nav = await dpage.evaluate((n) => {
    const row = document.getElementById('discussion-' + n);
    const body = row?.querySelector('.feedback-acc-body');
    const r = row?.getBoundingClientRect();
    return { expanded: body ? !body.hidden : false, inView: r ? r.top > -50 && r.top < window.innerHeight : false };
  }, targetNum);
  check('Sidebar click expands thread', nav.expanded, `#${targetNum} body visible = ${nav.expanded}`);
  check('Sidebar click scrolls into view', nav.inView, `#${targetNum} in viewport = ${nav.inView}`);
}

// Search must still work with every row present
await dpage.fill('#fb-search', 'zzzznotathing');
await dpage.waitForTimeout(400);
const noRes = await dpage.evaluate(() => ({
  visible: [...document.querySelectorAll('.feedback-acc')].filter(r => r.style.display !== 'none').length,
  msg: !document.getElementById('fb-no-results')?.hidden,
}));
check('Search filters all rows', noRes.visible === 0 && noRes.msg, `visible=${noRes.visible}, no-results shown=${noRes.msg}`);

// Sidebar click while a search is active must clear the filter and reveal
if (targetNum) {
  await dpage.click(`.fb-nav-link[href="#discussion-${targetNum}"]`);
  await dpage.waitForTimeout(900);
  const rescued = await dpage.evaluate((n) => {
    const row = document.getElementById('discussion-' + n);
    return { shown: row && row.style.display !== 'none', search: document.getElementById('fb-search')?.value };
  }, targetNum);
  check('Sidebar rescues a filtered-out thread', rescued.shown && rescued.search === '',
    `row shown=${rescued.shown}, search cleared="${rescued.search}"`);
}
await dpage.screenshot({ path: `${outDir}/AFTER-desktop.png`, fullPage: false });

// ── REGRESSION: another tool page must be untouched ───────────────────────
await dpage.goto(base + '/token-calculator/', { waitUntil: 'domcontentloaded' });
await dpage.waitForTimeout(800);
const other = await dpage.evaluate(() => ({
  aria: document.querySelector('.zt-sidebar--tools')?.getAttribute('aria-label'),
  groups: document.querySelectorAll('.zt-lic-nav-group').length,
  links: document.querySelectorAll('.zt-lic-nav-link').length,
  fbNav: document.querySelectorAll('.fb-nav-link').length,
}));
check('Other tool page sidebar intact', other.aria === 'Tool navigation' && other.groups === 4 && other.links > 50 && other.fbNav === 0,
  `aria="${other.aria}", groups=${other.groups}, links=${other.links}, strayFbLinks=${other.fbNav}`);
await dpage.screenshot({ path: `${outDir}/AFTER-other-tool.png`, fullPage: false });

// ── MOBILE ────────────────────────────────────────────────────────────────
const mpage = await (await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
await mpage.goto(base + '/feedback/', { waitUntil: 'networkidle' });
await mpage.waitForTimeout(2500);

const m = await mpage.evaluate(() => {
  const box = el => { const r = el?.getBoundingClientRect(); return r ? { top: Math.round(r.top + scrollY), h: Math.round(r.height) } : null; };
  const tw = document.querySelector('.feedback-recent-title-wrap');
  return {
    hero: box(document.querySelector('.feedback-hero')),
    tabs: box(document.querySelector('.feedback-tabs')),
    panel: box(document.querySelector('#panel-submit')),
    backNav: box(document.querySelector('.feedback-container .back-nav')),
    rows: document.querySelectorAll('.feedback-acc').length,
    sidebarVisible: !!document.querySelector('.zt-sidebar--tools')?.offsetParent,
    introHidden: tw ? getComputedStyle(tw).display === 'none' : null,
    searchVisible: !!document.getElementById('fb-search')?.offsetParent,
    docH: document.body.scrollHeight,
  };
});

check('Mobile: threads intro hidden', m.introHidden === true, `.feedback-recent-title-wrap display:none = ${m.introHidden}`);
check('Mobile: search still usable', m.searchVisible === true, `search box visible = ${m.searchVisible}`);
check('Mobile: hero moved below the form', m.hero && m.panel && m.hero.top > m.panel.top,
  `hero top=${m.hero?.top}, panel top=${m.panel?.top}`);
check('Mobile: hero above Back to Toolkit', m.hero && m.backNav && m.hero.top < m.backNav.top,
  `hero top=${m.hero?.top}, back-nav top=${m.backNav?.top}`);
check('Mobile: tabs now near top of page', m.tabs && m.tabs.top < 420, `tabs top=${m.tabs?.top}`);
check('Mobile: all threads present', m.rows >= 34, `${m.rows} rows`);
check('Mobile: sidebar correctly hidden', !m.sidebarVisible, `sidebar rendered = ${m.sidebarVisible}`);

await mpage.screenshot({ path: `${outDir}/AFTER-mobile-firstscreen.png`, fullPage: false });
await mpage.screenshot({ path: `${outDir}/AFTER-mobile-full.png`, fullPage: true });

await browser.close();

const failed = results.filter(r => !r.pass);
console.log(`\n${failed.length ? '🔴 ' + failed.length + ' FAILED' : '🟢 ALL ' + results.length + ' CHECKS PASS'}`);
fs.writeFileSync(`${outDir}/verify-results.json`, JSON.stringify(results, null, 2));
process.exit(failed.length ? 1 : 0);
