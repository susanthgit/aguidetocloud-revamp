#!/usr/bin/env node
/**
 * Zen Tool Auditor — Phase 14 triage sweep
 *
 * For every tool NOT yet zenified (per phases.md tracker), visits the live page
 * in 4 viewport+theme combos, captures screenshots, runs in-page Zen-guardrail
 * checks, scans the per-tool CSS for forbidden patterns, and outputs a triage
 * report classifying each tool as broken / polish-needed / clean.
 *
 * Usage:
 *   node scripts/zen-tool-audit.mjs                     # audit all queued (live site)
 *   node scripts/zen-tool-audit.mjs --base http://localhost:1314
 *   node scripts/zen-tool-audit.mjs --only qr-generator,pomodoro
 *   node scripts/zen-tool-audit.mjs --skip-screenshots  # CSS-only fast pass
 */
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import toml from '@iarna/toml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(REPO_ROOT, 'audit-output');
const NAV_TOML = path.join(REPO_ROOT, 'data', 'toolkit_nav.toml');
const CSS_DIR = path.join(REPO_ROOT, 'static', 'css');

// Tools already fully zenified (Phase 14 tracker rows 1–13, 29 Apr 2026)
const DONE_URLS = new Set([
  '/prompts/', '/copilot-matrix/', '/roi-calculator/', '/licence-picker/',
  '/ca-builder/', '/ai-mapper/', '/migration-planner/', '/ai-showdown/',
  '/cert-compass/', '/licensing/', '/agent-365-planner/', '/purview-starter/',
  '/ps-builder/',
]);

// Map URL slug → likely CSS file basename (best-effort)
const CSS_HINTS = {
  '/prompt-polisher/': 'polisher',
  '/m365-roadmap/': 'roadmap',
  '/ai-news/': 'ainews',
  '/deprecation-timeline/': 'deptime',
  '/world-clock/': 'world-clock',
  '/copilot-readiness/': 'readiness',
  '/agent-365-planner/': 'agent-planner',
  '/feature-roulette/': 'feature-roulette',
  '/admin-bingo/': 'admin-bingo',
  '/policy-tester/': 'policy-tester',
  '/site-analytics/': 'site-analytics',
};

const args = process.argv.slice(2);
const argMap = {};
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    const key = args[i].slice(2);
    const next = args[i + 1];
    if (next && !next.startsWith('--')) { argMap[key] = next; i++; } else { argMap[key] = true; }
  }
}
const BASE = (argMap.base || 'https://www.aguidetocloud.com').replace(/\/$/, '');
const ONLY = argMap.only ? new Set(argMap.only.split(',').map(s => s.trim())) : null;
const SKIP_SHOTS = !!argMap['skip-screenshots'];

// In-page audit script — runs in browser context, returns findings
const AUDIT_FN = `
(() => {
  const findings = {
    backdropFilters: 0,
    gradientBackgrounds: 0,
    boxShadowsRgba: 0,
    uniqueColors: new Set(),
    emojiCount: 0,
    mobileOverflowEls: 0,
    lowContrastPairs: 0,
    contrastSamples: 0,
    inlineStyleEls: 0,
  };
  const all = document.querySelectorAll('*');
  const vw = window.innerWidth;
  const palette = new Set();
  // Emoji regex (broad)
  const emojiRe = /[\\u{1F300}-\\u{1FAFF}\\u{2600}-\\u{27BF}\\u{1F000}-\\u{1F2FF}\\u{1F900}-\\u{1F9FF}]/gu;
  for (const el of all) {
    const cs = getComputedStyle(el);
    if (cs.backdropFilter && cs.backdropFilter !== 'none') findings.backdropFilters++;
    const bg = cs.backgroundImage || '';
    if (bg.includes('gradient')) findings.gradientBackgrounds++;
    const shadow = cs.boxShadow || '';
    if (/rgba\\(0,\\s*0,\\s*0,\\s*0?\\.[2-9]/.test(shadow)) findings.boxShadowsRgba++;
    if (cs.color && cs.color !== 'rgba(0, 0, 0, 0)') palette.add(cs.color);
    if (cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') palette.add(cs.backgroundColor);
    if (cs.borderTopColor && cs.borderTopColor !== 'rgba(0, 0, 0, 0)') palette.add(cs.borderTopColor);
    // Inline style with colours
    if (el.getAttribute('style') && /background|color/i.test(el.getAttribute('style'))) {
      findings.inlineStyleEls++;
    }
    // Mobile overflow check — only count if NOT inside an intentional overflow-x scroll container
    if (el.getBoundingClientRect && el.getBoundingClientRect().right > vw + 4) {
      let cur = el.parentElement;
      let inScrollContainer = false;
      while (cur && cur !== document.body) {
        const pcs = getComputedStyle(cur);
        if (pcs.overflowX === 'auto' || pcs.overflowX === 'scroll') { inScrollContainer = true; break; }
        cur = cur.parentElement;
      }
      if (!inScrollContainer) findings.mobileOverflowEls++;
    }
  }
  findings.uniqueColors = palette.size;
  // Emoji count — text content of body
  const text = document.body.innerText || '';
  findings.emojiCount = (text.match(emojiRe) || []).length;
  // Contrast sampling — 30 random text-bearing leaf elements
  const leaves = [...all].filter(el => {
    if (!el.textContent || !el.textContent.trim()) return false;
    if (el.children.length > 0) return false;
    if (el.offsetWidth === 0 || el.offsetHeight === 0) return false;
    return true;
  });
  const sample = leaves.sort(() => 0.5 - Math.random()).slice(0, 30);
  const parseRgb = s => {
    const m = s.match(/(\\d+(\\.\\d+)?)/g);
    if (!m) return null;
    return [parseFloat(m[0]), parseFloat(m[1]), parseFloat(m[2]), m[3] !== undefined ? parseFloat(m[3]) : 1];
  };
  const luminance = ([r,g,b]) => {
    const lin = c => { c = c/255; return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4); };
    return 0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b);
  };
  const findBg = el => {
    let cur = el;
    while (cur && cur !== document.body.parentElement) {
      const cs = getComputedStyle(cur);
      const bg = cs.backgroundColor;
      const rgb = parseRgb(bg);
      if (rgb && rgb[3] > 0.5) return rgb;
      cur = cur.parentElement;
    }
    return [255, 255, 255, 1];
  };
  for (const el of sample) {
    const cs = getComputedStyle(el);
    const fg = parseRgb(cs.color);
    if (!fg) continue;
    const bg = findBg(el);
    const l1 = luminance(fg);
    const l2 = luminance(bg);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    findings.contrastSamples++;
    if (ratio < 4.5) findings.lowContrastPairs++;
  }
  return findings;
})()
`;

async function loadTools() {
  const raw = await fs.readFile(NAV_TOML, 'utf8');
  const data = toml.parse(raw);
  const tools = (data.tools || []).filter(t => !t.external && !DONE_URLS.has(t.url));
  return tools;
}

async function findCssFile(slug) {
  // Try direct match: /qr-generator/ -> qr-generator.css
  const base = slug.replace(/^\//, '').replace(/\/$/, '');
  const candidates = [
    `${base}.css`,
    `${CSS_HINTS[slug] || ''}.css`,
  ].filter(c => c && c !== '.css');
  for (const c of candidates) {
    const full = path.join(CSS_DIR, c);
    try { await fs.access(full); return full; } catch {}
  }
  return null;
}

async function scanCss(cssFile) {
  if (!cssFile) return { exists: false };
  const src = await fs.readFile(cssFile, 'utf8');
  const lines = src.split('\n').length;
  const findings = {
    exists: true,
    file: path.basename(cssFile),
    lines,
    backdropFilter: (src.match(/backdrop-filter\s*:/g) || []).length,
    linearGradient: (src.match(/linear-gradient\(/g) || []).length,
    rgbaShadows: (src.match(/box-shadow:[^;]*rgba\(0,\s*0,\s*0/g) || []).length,
    hardcodedHex: (src.match(/#[0-9a-fA-F]{3,8}\b/g) || []).filter(h => h.length > 1).length,
    fontWeight7or8: (src.match(/font-weight:\s*[78]00/g) || []).length,
    over15Padding: (src.match(/padding[^;]*\b(1[6-9]|2[0-9]|3[0-9])px/g) || []).length,
    rgbaColors: (src.match(/rgba\(/g) || []).length,
    emInsteadOfTokens: (src.match(/\b0?\.\d+rem/g) || []).length,
  };
  return findings;
}

async function captureCombo(context, url, theme, viewport, outPath) {
  const page = await context.newPage();
  await page.addInitScript(([t]) => {
    try { localStorage.setItem('theme', t); } catch {}
  }, [theme]);
  await page.setViewportSize(viewport);
  let nav = { ok: false, status: 0, error: null };
  try {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    nav.status = resp ? resp.status() : 0;
    nav.ok = resp && resp.ok();
    // Let CSS settle
    await page.waitForTimeout(800);
  } catch (e) {
    nav.error = String(e.message || e);
    await page.close();
    return { nav, findings: null };
  }
  let findings = null;
  try {
    findings = await page.evaluate(AUDIT_FN);
  } catch (e) {
    findings = { error: String(e.message || e) };
  }
  if (!SKIP_SHOTS) {
    try { await page.screenshot({ path: outPath, fullPage: false }); } catch {}
  }
  await page.close();
  return { nav, findings };
}

function classify(tool, runtime, css) {
  // Severity scoring
  let score = 0;
  const reasons = [];
  // Runtime — average across 4 combos
  const ld = runtime['light-desktop']?.findings;
  const lm = runtime['light-mobile']?.findings;
  const dd = runtime['dark-desktop']?.findings;
  const dm = runtime['dark-mobile']?.findings;
  const any = ld || lm || dd || dm;
  if (!any) {
    return { severity: 'unknown', score: 999, reasons: ['Page failed to load in all 4 combos'] };
  }
  const avg = (key) => {
    const vals = [ld?.[key], lm?.[key], dd?.[key], dm?.[key]].filter(v => typeof v === 'number');
    if (!vals.length) return 0;
    return vals.reduce((a,b)=>a+b,0) / vals.length;
  };
  const max = (key) => {
    const vals = [ld?.[key], lm?.[key], dd?.[key], dm?.[key]].filter(v => typeof v === 'number');
    if (!vals.length) return 0;
    return Math.max(...vals);
  };
  const bd = max('backdropFilters');
  if (bd > 0) { score += bd * 4; reasons.push(`backdrop-filter on ${bd} elements (banned)`); }
  const grad = max('gradientBackgrounds');
  if (grad > 2) { score += (grad - 2) * 2; reasons.push(`${grad} gradient backgrounds (>2)`); }
  const shadows = max('boxShadowsRgba');
  if (shadows > 5) { score += (shadows - 5); reasons.push(`${shadows} rgba box-shadows`); }
  const palette = max('uniqueColors');
  if (palette > 35) { score += Math.floor((palette - 35) / 5); reasons.push(`${palette} unique colours (>35 = hardcoded leakage)`); }
  const emoji = avg('emojiCount');
  if (emoji > 10) { score += Math.floor((emoji - 10) / 5); reasons.push(`${Math.round(emoji)} emoji (target: SVG icons or text)`); }
  const inline = max('inlineStyleEls');
  if (inline > 5) { score += Math.floor(inline / 3); reasons.push(`${inline} inline-style colour overrides`); }
  // Mobile overflow (only check the mobile findings)
  const mOverflow = Math.max(lm?.mobileOverflowEls || 0, dm?.mobileOverflowEls || 0);
  if (mOverflow > 0) { score += mOverflow; reasons.push(`${mOverflow} elements overflow mobile viewport`); }
  // Contrast — pull dark-mode results separately, that's where the regressions live
  const contrastFails = Math.max(dd?.lowContrastPairs || 0, dm?.lowContrastPairs || 0);
  if (contrastFails > 2) { score += contrastFails; reasons.push(`${contrastFails}/30 low-contrast text in dark mode`); }
  // CSS file
  if (css.exists) {
    if (css.backdropFilter > 0) { score += css.backdropFilter * 3; reasons.push(`CSS: ${css.backdropFilter} backdrop-filter rules`); }
    if (css.linearGradient > 0) { score += css.linearGradient; reasons.push(`CSS: ${css.linearGradient} linear-gradient rules`); }
    if (css.rgbaShadows > 0) { score += css.rgbaShadows; reasons.push(`CSS: ${css.rgbaShadows} rgba shadows`); }
    if (css.hardcodedHex > 8) { score += Math.floor((css.hardcodedHex - 8) / 4); reasons.push(`CSS: ${css.hardcodedHex} hardcoded hex (target ≤8)`); }
    if (css.fontWeight7or8 > 0) { score += css.fontWeight7or8; reasons.push(`CSS: ${css.fontWeight7or8} font-weight 700/800 (target ≤600)`); }
    if (css.over15Padding > 5) { score += Math.floor((css.over15Padding - 5) / 3); reasons.push(`CSS: ${css.over15Padding} paddings ≥16px (over-spaced)`); }
    if (css.rgbaColors > 4) { score += Math.floor((css.rgbaColors - 4) / 3); reasons.push(`CSS: ${css.rgbaColors} rgba()`); }
  } else {
    reasons.push('No dedicated CSS file (uses style.css or shared)');
  }
  let severity;
  if (score >= 25) severity = 'broken';
  else if (score >= 8) severity = 'polish';
  else severity = 'clean';
  return { severity, score, reasons };
}

async function run() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const tools = await loadTools();
  const filtered = ONLY ? tools.filter(t => ONLY.has(t.url.replace(/^\/|\/$/g, ''))) : tools;
  console.log(`📋 Auditing ${filtered.length} tool(s) against ${BASE}`);
  console.log(`   Output: ${OUT_DIR}`);
  console.log('');

  const browser = await chromium.launch();
  const results = [];
  let i = 0;
  for (const tool of filtered) {
    i++;
    const slug = tool.url.replace(/^\/|\/$/g, '');
    const url = BASE + tool.url;
    process.stdout.write(`[${i}/${filtered.length}] ${tool.name.padEnd(28)} ${slug.padEnd(28)}`);
    const slugDir = path.join(OUT_DIR, 'screenshots', slug);
    await fs.mkdir(slugDir, { recursive: true });
    const cssFile = await findCssFile(tool.url);
    const css = await scanCss(cssFile);
    const runtime = {};
    const combos = [
      ['light-desktop', 'light', { width: 1440, height: 900 }],
      ['light-mobile',  'light', { width: 390,  height: 844 }],
      ['dark-desktop',  'dark',  { width: 1440, height: 900 }],
      ['dark-mobile',   'dark',  { width: 390,  height: 844 }],
    ];
    for (const [comboName, theme, vp] of combos) {
      const ctx = await browser.newContext({ colorScheme: theme, viewport: vp });
      const out = path.join(slugDir, `${comboName}.png`);
      const r = await captureCombo(ctx, url, theme, vp, out);
      runtime[comboName] = r;
      await ctx.close();
    }
    const cls = classify(tool, runtime, css);
    const result = { ...tool, slug, runtime, css, severity: cls.severity, score: cls.score, reasons: cls.reasons };
    results.push(result);
    const symbol = { broken: '🔴', polish: '🟡', clean: '🟢', unknown: '⚫' }[cls.severity] || '?';
    console.log(`  ${symbol} ${cls.severity.padEnd(7)} score:${String(cls.score).padStart(3)}`);
  }
  await browser.close();

  // Write findings.json
  await fs.writeFile(path.join(OUT_DIR, 'findings.json'), JSON.stringify(results, null, 2));

  // Write triage.md
  const sorted = [...results].sort((a, b) => b.score - a.score);
  const groups = { broken: [], polish: [], clean: [], unknown: [] };
  for (const r of sorted) groups[r.severity].push(r);
  const lines = [];
  lines.push('# Zen Tool Audit — Triage Report');
  lines.push('');
  lines.push(`Audited: **${results.length} tools** against \`${BASE}\` on ${new Date().toISOString().slice(0, 16)}Z`);
  lines.push('');
  lines.push(`- 🔴 **Broken** (score ≥25): **${groups.broken.length}**`);
  lines.push(`- 🟡 **Polish** (score 8–24): **${groups.polish.length}**`);
  lines.push(`- 🟢 **Clean** (score <8): **${groups.clean.length}**`);
  if (groups.unknown.length) lines.push(`- ⚫ **Unknown** (failed to load): **${groups.unknown.length}**`);
  lines.push('');
  lines.push('---');
  lines.push('');
  for (const sev of ['broken', 'polish', 'clean', 'unknown']) {
    const g = groups[sev];
    if (!g.length) continue;
    const header = { broken: '🔴 Broken — fix first', polish: '🟡 Polish — quick wins', clean: '🟢 Clean — low priority', unknown: '⚫ Unknown — investigate' }[sev];
    lines.push(`## ${header} (${g.length})`);
    lines.push('');
    lines.push('| Score | Tool | URL | Top issues |');
    lines.push('|------:|------|-----|------------|');
    for (const r of g) {
      const top = r.reasons.slice(0, 3).join('; ').replace(/\|/g, '\\|') || 'no major issues';
      lines.push(`| ${r.score} | ${r.name} | \`${r.url}\` | ${top} |`);
    }
    lines.push('');
  }
  lines.push('---');
  lines.push('');
  lines.push('## Per-tool detail');
  lines.push('');
  for (const r of sorted) {
    const sym = { broken: '🔴', polish: '🟡', clean: '🟢', unknown: '⚫' }[r.severity];
    lines.push(`### ${sym} ${r.name} (\`${r.url}\`) — score ${r.score}`);
    lines.push('');
    if (r.css.exists) {
      lines.push(`**CSS** \`${r.css.file}\` (${r.css.lines} lines): bd=${r.css.backdropFilter}, grad=${r.css.linearGradient}, rgbaShadow=${r.css.rgbaShadows}, hex=${r.css.hardcodedHex}, fw7/8=${r.css.fontWeight7or8}, over15px=${r.css.over15Padding}, rgba=${r.css.rgbaColors}`);
    } else {
      lines.push('**CSS** — no dedicated file');
    }
    const ld = r.runtime['light-desktop']?.findings;
    const dm = r.runtime['dark-mobile']?.findings;
    if (ld) lines.push(`**Runtime light-desktop**: bd=${ld.backdropFilters}, grad=${ld.gradientBackgrounds}, palette=${ld.uniqueColors}, emoji=${ld.emojiCount}, inline=${ld.inlineStyleEls}`);
    if (dm) lines.push(`**Runtime dark-mobile**: overflow=${dm.mobileOverflowEls}, contrastFails=${dm.lowContrastPairs}/${dm.contrastSamples}`);
    if (r.reasons.length) {
      lines.push('');
      lines.push('Issues:');
      for (const reason of r.reasons) lines.push(`- ${reason}`);
    }
    lines.push('');
    lines.push(`Screenshots: \`audit-output/screenshots/${r.slug}/\``);
    lines.push('');
  }
  await fs.writeFile(path.join(OUT_DIR, 'triage.md'), lines.join('\n'));
  console.log('');
  console.log(`✅ Wrote ${path.relative(REPO_ROOT, path.join(OUT_DIR, 'triage.md'))}`);
  console.log(`✅ Wrote ${path.relative(REPO_ROOT, path.join(OUT_DIR, 'findings.json'))}`);
  console.log('');
  console.log(`Summary: 🔴 ${groups.broken.length}  🟡 ${groups.polish.length}  🟢 ${groups.clean.length}  ⚫ ${groups.unknown.length}`);
}

run().catch(e => {
  console.error('Audit failed:', e);
  process.exit(1);
});
