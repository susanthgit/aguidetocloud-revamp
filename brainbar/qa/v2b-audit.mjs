// ════════════════════════════════════════════════════════════════════════
// Brain Bar — full UX audit (desktop × mobile × dark × light)
// ────────────────────────────────────────────────────────────────────────
// Drives the site like a first-time user; captures screenshots + computed
// styles for contrast/touch-target analysis. Writes findings to report.
// ════════════════════════════════════════════════════════════════════════

import { chromium } from 'playwright';
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';

const BASE = 'http://127.0.0.1:1316';
const SHOTS = path.resolve('audit-final');
await mkdir(SHOTS, { recursive: true });

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 900, isMobile: false },
  { name: 'mobile',  width: 390,  height: 844, isMobile: true },
];
const THEMES = ['dark', 'light'];

const browser = await chromium.launch({ headless: true });
const findings = [];
const note = (severity, where, what) => findings.push({ severity, where, what });

async function capture(page, name, opts = {}) {
  const file = path.join(SHOTS, `${name}.png`);
  await page.screenshot({ path: file, fullPage: opts.fullPage ?? false });
  return file;
}

async function setTheme(page, theme) {
  await page.evaluate((t) => {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('theme', t); } catch (e) { /* */ }
  }, theme);
  await page.waitForTimeout(80);
}

// Helpers — read computed contrast / sizes / touch-target dims
async function inspectLauncherInput(page) {
  return page.evaluate(() => {
    const input = document.querySelector('#bb-input');
    if (!input) return null;
    const cs = getComputedStyle(input);
    const r = input.getBoundingClientRect();
    return {
      width: r.width, height: r.height,
      fontSize: cs.fontSize, color: cs.color,
      bg: cs.backgroundColor, border: cs.border,
      placeholder: input.placeholder, value: input.value,
    };
  });
}

async function inspectFirstResult(page) {
  return page.evaluate(() => {
    const el = document.querySelector('#bb-results .bb-result');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return { height: r.height, fontSize: cs.fontSize, color: cs.color };
  });
}

async function inspectAllTouchTargets(page) {
  return page.evaluate(() => {
    const targets = Array.from(document.querySelectorAll(
      'a, button, input, [role="button"], [role="option"], [tabindex="0"]'
    ));
    const small = [];
    for (const t of targets) {
      if (t.offsetParent === null) continue; // hidden
      const r = t.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      if (r.width < 32 || r.height < 32) {
        small.push({
          tag: t.tagName.toLowerCase(),
          text: (t.textContent || '').trim().slice(0, 40),
          width: Math.round(r.width),
          height: Math.round(r.height),
          id: t.id || null,
          cls: (t.className || '').toString().split(/\s+/).slice(0, 2).join(' '),
        });
      }
    }
    return small;
  });
}

async function tone(page) {
  // Sample a few text-on-background combos. Returns object { selector: { fg, bg, ratio } }
  return page.evaluate(() => {
    function rgbToLum(rgb) {
      const m = String(rgb).match(/\d+(?:\.\d+)?/g);
      if (!m || m.length < 3) return null;
      const [r, g, b] = m.map(Number);
      const norm = (v) => { v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
      return 0.2126 * norm(r) + 0.7152 * norm(g) + 0.0722 * norm(b);
    }
    function bgWalker(el) {
      let cur = el;
      while (cur) {
        const cs = getComputedStyle(cur);
        const bg = cs.backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg;
        cur = cur.parentElement;
      }
      return getComputedStyle(document.body).backgroundColor;
    }
    function ratio(fg, bg) {
      const lf = rgbToLum(fg), lb = rgbToLum(bg);
      if (lf === null || lb === null) return null;
      const [lo, hi] = lf > lb ? [lb, lf] : [lf, lb];
      return (hi + 0.05) / (lo + 0.05);
    }
    const samples = [
      { sel: '.bb-hero-title', label: 'hero title' },
      { sel: '.bb-hero-tagline', label: 'hero tagline' },
      { sel: '.bb-hero-prompt', label: 'hero prompt' },
      { sel: '#bb-input', label: 'launcher input value' },
      { sel: '.bb-launcher-status', label: 'launcher status' },
      { sel: '.bb-boot-line', label: 'boot line' },
      { sel: '.bb-boot-key', label: 'boot key (label)' },
      { sel: '.bb-boot-val', label: 'boot val' },
      { sel: '.bb-result-slug', label: 'result slug' },
      { sel: '.bb-result-name', label: 'result name' },
      { sel: '.bb-result-meta', label: 'result meta' },
      { sel: '.bb-result-hint', label: 'result hint (synonym/did-you-mean)' },
      { sel: '.bb-empty', label: 'empty state' },
      { sel: '.bb-tool-title', label: 'tool section title' },
      { sel: '.bb-tool-lede', label: 'tool section lede' },
      { sel: '.bb-tool-hint', label: 'tool section hint' },
    ];
    const out = [];
    for (const s of samples) {
      const el = document.querySelector(s.sel);
      if (!el) { out.push({ ...s, missing: true }); continue; }
      const cs = getComputedStyle(el);
      const fg = cs.color;
      const bg = bgWalker(el);
      const r = ratio(fg, bg);
      out.push({ ...s, fg, bg, ratio: r ? r.toFixed(2) : null, fontSize: cs.fontSize });
    }
    return out;
  });
}

async function audit() {
  for (const v of VIEWPORTS) {
    for (const theme of THEMES) {
      const ctx = await browser.newContext({
        viewport: { width: v.width, height: v.height },
        deviceScaleFactor: 1,
      });
      const page = await ctx.newPage();
      page.on('pageerror', (err) => note('error', `${v.name}/${theme}/console`, err.message));
      page.on('console', (msg) => {
        if (msg.type() === 'error' && !/Failed to load resource.*404/i.test(msg.text())) {
          note('error', `${v.name}/${theme}/console`, msg.text());
        }
      });

      const tag = `${v.name}-${theme}`;

      // ── 01 Home (default) ───────────────────────────────────────────
      await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => !!document.querySelector('#bb-input'));
      await page.waitForFunction(() =>
        document.querySelector('#bb-input-status')?.textContent?.includes('entries'));
      await setTheme(page, theme);
      await capture(page, `01-home-${tag}`);
      await capture(page, `01-home-full-${tag}`, { fullPage: true });

      // Capture computed styles on home
      const homeTone = await tone(page);
      const inp = await inspectLauncherInput(page);
      const homeTouch = v.isMobile ? await inspectAllTouchTargets(page) : null;
      await writeFile(path.join(SHOTS, `01-home-${tag}.json`),
        JSON.stringify({ tone: homeTone, input: inp, smallTouch: homeTouch }, null, 2));

      // ── 02 Search active — synonym (antivirus → mde) ────────────────
      await page.fill('#bb-input', 'antivirus');
      await page.waitForTimeout(150);
      await capture(page, `02-search-synonym-${tag}`);
      const synStyles = await tone(page);
      await writeFile(path.join(SHOTS, `02-synonym-${tag}.json`), JSON.stringify(synStyles, null, 2));

      // ── 03 Did-you-mean (intuune) ───────────────────────────────────
      await page.fill('#bb-input', 'intuune');
      await page.waitForTimeout(150);
      await capture(page, `03-did-you-mean-${tag}`);

      // ── 04 Substring with highlight (intu) ──────────────────────────
      await page.fill('#bb-input', 'intu');
      await page.waitForTimeout(150);
      await capture(page, `04-highlight-${tag}`);
      const firstRes = await inspectFirstResult(page);
      await writeFile(path.join(SHOTS, `04-result-${tag}.json`), JSON.stringify(firstRes, null, 2));

      // ── 05 Multi-token (defender for endpoint) ──────────────────────
      await page.fill('#bb-input', 'defender for endpoint');
      await page.waitForTimeout(150);
      await capture(page, `05-multi-token-${tag}`);

      // ── 06 Empty state (xyzzy) ──────────────────────────────────────
      await page.fill('#bb-input', 'xyzzy');
      await page.waitForTimeout(200);
      await capture(page, `06-empty-${tag}`);

      // ── 07 Recent searches (seed via localStorage) ──────────────────
      await page.fill('#bb-input', '');
      await page.evaluate(() => {
        localStorage.setItem('bb:recent', JSON.stringify([
          { q: 'antivirus', slug: 'mde', ts: Date.now() },
          { q: 'sso', slug: 'entra-p1', ts: Date.now() - 60000 },
          { q: 'pim', slug: 'pim', ts: Date.now() - 120000 },
        ]));
      });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => !!document.querySelector('#bb-input'));
      await setTheme(page, theme);
      await capture(page, `07-recent-${tag}`);
      const recentTouch = v.isMobile ? await inspectAllTouchTargets(page) : null;
      if (recentTouch) await writeFile(path.join(SHOTS, `07-recent-touch-${tag}.json`),
        JSON.stringify(recentTouch, null, 2));

      // Clear recent for next pages
      await page.evaluate(() => localStorage.removeItem('bb:recent'));

      // ── 08 Help overlay ─────────────────────────────────────────────
      await page.click('body');
      await page.waitForTimeout(50);
      await page.keyboard.press('?');
      await page.waitForTimeout(120);
      await capture(page, `08-help-${tag}`);
      const helpTouch = v.isMobile ? await inspectAllTouchTargets(page) : null;
      if (helpTouch) await writeFile(path.join(SHOTS, `08-help-touch-${tag}.json`),
        JSON.stringify(helpTouch, null, 2));
      // Close
      await page.keyboard.press('Escape');
      await page.waitForTimeout(80);

      // ── 09 Standard entry page (/mde/) ──────────────────────────────
      await page.goto(`${BASE}/mde/`, { waitUntil: 'domcontentloaded' });
      await setTheme(page, theme);
      await capture(page, `09-entry-mde-${tag}`);
      await capture(page, `09-entry-mde-full-${tag}`, { fullPage: true });
      const entryTone = await page.evaluate(() => {
        function rgbToLum(rgb) {
          const m = String(rgb).match(/\d+(?:\.\d+)?/g);
          if (!m || m.length < 3) return null;
          const [r, g, b] = m.map(Number);
          const norm = (v) => { v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
          return 0.2126 * norm(r) + 0.7152 * norm(g) + 0.0722 * norm(b);
        }
        function bgWalker(el) {
          let cur = el;
          while (cur) {
            const cs = getComputedStyle(cur);
            const bg = cs.backgroundColor;
            if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg;
            cur = cur.parentElement;
          }
          return getComputedStyle(document.body).backgroundColor;
        }
        function ratio(fg, bg) {
          const lf = rgbToLum(fg), lb = rgbToLum(bg);
          if (lf === null || lb === null) return null;
          const [lo, hi] = lf > lb ? [lb, lf] : [lf, lb];
          return (hi + 0.05) / (lo + 0.05);
        }
        const samples = [
          { sel: '.bb-entry-title', label: 'entry title' },
          { sel: '.bb-plain', label: 'plain english body' },
          { sel: '.bb-official', label: 'official body' },
          { sel: '.bb-voice-take', label: 'spicy take' },
          { sel: '.bb-section-title', label: 'section title' },
          { sel: '.bb-plans li', label: 'plans bullet' },
          { sel: '.bb-btn-primary', label: 'primary CTA' },
          { sel: '.bb-btn-secondary', label: 'secondary CTA' },
          { sel: '.bb-aliases code', label: 'alias code' },
          { sel: '.bb-verified', label: 'verified line' },
        ];
        const out = [];
        for (const s of samples) {
          const el = document.querySelector(s.sel);
          if (!el) { out.push({ ...s, missing: true }); continue; }
          const cs = getComputedStyle(el);
          out.push({ ...s, fg: cs.color, bg: bgWalker(el), ratio: (function(){
            const r = ratio(cs.color, bgWalker(el));
            return r ? r.toFixed(2) : null;
          })(), fontSize: cs.fontSize });
        }
        return out;
      });
      await writeFile(path.join(SHOTS, `09-entry-${tag}.json`), JSON.stringify(entryTone, null, 2));

      // ── 10 Disambiguation (/defender/) ──────────────────────────────
      await page.goto(`${BASE}/defender/`, { waitUntil: 'domcontentloaded' });
      await setTheme(page, theme);
      await capture(page, `10-disambig-${tag}`, { fullPage: true });

      // ── 11 /all/ catalogue ──────────────────────────────────────────
      await page.goto(`${BASE}/all/`, { waitUntil: 'domcontentloaded' });
      await setTheme(page, theme);
      await capture(page, `11-all-${tag}`);

      // ── 12 /about/ ──────────────────────────────────────────────────
      await page.goto(`${BASE}/about/`, { waitUntil: 'domcontentloaded' });
      await setTheme(page, theme);
      await capture(page, `12-about-${tag}`, { fullPage: true });

      // ── 13 /wishlist/ ───────────────────────────────────────────────
      await page.goto(`${BASE}/wishlist/`, { waitUntil: 'domcontentloaded' });
      await setTheme(page, theme);
      await capture(page, `13-wishlist-${tag}`);

      await ctx.close();
    }
  }
  await browser.close();
  await writeFile(path.join(SHOTS, 'findings.json'), JSON.stringify(findings, null, 2));
  console.log(`Captured ${VIEWPORTS.length}×${THEMES.length}×~13 = ${VIEWPORTS.length*THEMES.length*13} screenshots to ${SHOTS}/`);
  console.log(`Findings: ${findings.length}`);
}

await audit();


