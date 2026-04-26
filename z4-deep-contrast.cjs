/**
 * Z4 Deep Contrast Audit
 * More thorough than the basic QA — checks WCAG contrast ratios,
 * catches "barely readable" text, and outputs a detailed report.
 *
 * Usage: node z4-deep-contrast.cjs [slug]
 *   If slug provided, checks only that tool. Otherwise checks ALL.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:1314';
const REPORT_PATH = path.join(__dirname, 'z4-screenshots', 'deep-contrast-report.json');

const ALL_SLUGS = [
  'acronym-battle','admin-badges','admin-bingo','admin-comms',
  'agent-365-planner','agent-builder-guide','ai-cost-calculator',
  'ai-mapper','ai-news','ai-showdown','ca-builder','cc',
  'cert-compass','cert-tracker','cli-quiz','color-palette',
  'compliance-passport','copilot-matrix','copilot-readiness',
  'countdown','cs-companion','demo-scripts','deprecation-timeline',
  'feature-roulette','feedback','image-compressor','incident-comms',
  'instruct-builder','it-day-sim','licence-picker','licensing',
  'm365-roadmap','migration-planner','password-generator',
  'phishing-test','policy-tester','pomodoro','prompt-guide',
  'prompt-lab','prompt-polisher','prompt-tester','prompts',
  'ps-builder','purview-starter','qr-generator','rename-tracker',
  'roi-calculator','security-toolkit','service-health',
  'sla-calculator','typing-test','wifi-qr','world-clock'
];

// Calculate relative luminance per WCAG 2.1
function sRGBtoLinear(c) {
  c = c / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function luminance(r, g, b) {
  return 0.2126 * sRGBtoLinear(r) + 0.7152 * sRGBtoLinear(g) + 0.0722 * sRGBtoLinear(b);
}
function contrastRatio(l1, l2) {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

async function deepContrastCheck(page, mode) {
  return page.evaluate((m) => {
    function sRGBtoLinear(c) {
      c = c / 255;
      return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    }
    function luminance(r, g, b) {
      return 0.2126 * sRGBtoLinear(r) + 0.7152 * sRGBtoLinear(g) + 0.0722 * sRGBtoLinear(b);
    }
    function contrastRatio(l1, l2) {
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    }
    function parseColor(str) {
      const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (!m) return null;
      return { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? +m[4] : 1 };
    }
    function getEffectiveBg(el) {
      let current = el;
      while (current) {
        const s = getComputedStyle(current);
        const c = parseColor(s.backgroundColor);
        if (c && c.a > 0.1) return c;
        current = current.parentElement;
      }
      // Default page bg
      return m === 'light' ? { r: 250, g: 250, b: 250 } : { r: 10, g: 10, b: 10 };
    }

    const issues = [];
    const seen = new Set();
    const selectors = 'h1,h2,h3,h4,h5,p,span,a,li,label,button,select,option,td,th,summary,input,textarea,dt,dd,strong,em,code,pre,figcaption,legend,small';

    document.querySelectorAll(selectors).forEach(el => {
      if (el.offsetHeight === 0 || el.offsetWidth === 0) return;
      const rect = el.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      // Skip hidden/clipped elements
      const s = getComputedStyle(el);
      if (s.visibility === 'hidden' || s.display === 'none' || s.opacity === '0') return;

      const textColor = parseColor(s.color);
      if (!textColor || textColor.a < 0.1) return;

      const bgColor = getEffectiveBg(el);
      if (!bgColor) return;

      const textLum = luminance(textColor.r, textColor.g, textColor.b);
      const bgLum = luminance(bgColor.r, bgColor.g, bgColor.b);
      const ratio = contrastRatio(textLum, bgLum);

      const text = el.textContent?.trim().slice(0, 60);
      if (!text || text.length < 1) return;

      const key = text + '|' + el.tagName;
      if (seen.has(key)) return;
      seen.add(key);

      const fontSize = parseFloat(s.fontSize);
      const isBold = parseInt(s.fontWeight) >= 700;
      const isLargeText = fontSize >= 18 || (fontSize >= 14 && isBold);

      // WCAG AA: 4.5:1 normal text, 3:1 large text
      const aaThreshold = isLargeText ? 3 : 4.5;

      let severity = null;
      if (ratio < 1.5) severity = 'critical';       // invisible
      else if (ratio < 2.5) severity = 'serious';    // barely readable
      else if (ratio < aaThreshold) severity = 'moderate'; // below WCAG AA

      if (severity) {
        issues.push({
          tag: el.tagName,
          text: text,
          color: `rgb(${textColor.r},${textColor.g},${textColor.b})`,
          bg: `rgb(${bgColor.r},${bgColor.g},${bgColor.b})`,
          ratio: Math.round(ratio * 100) / 100,
          fontSize: Math.round(fontSize),
          isLargeText,
          severity,
          wcagAA: aaThreshold,
          selector: el.className?.toString().split(' ')[0] || el.id || el.tagName.toLowerCase()
        });
      }
    });

    return issues;
  }, mode);
}

async function main() {
  const slugArg = process.argv[2];
  const slugs = slugArg ? [slugArg] : ALL_SLUGS;

  console.log(`\n🔍 Z4 Deep Contrast Audit — ${slugs.length} tool(s)\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('console', () => {});
  page.on('pageerror', () => {});

  const results = [];
  let totalCritical = 0, totalSerious = 0, totalModerate = 0;

  for (const slug of slugs) {
    const result = { slug, light: [], dark: [], status: 'OK' };

    try {
      const res = await page.goto(`${BASE}/${slug}/`, { waitUntil: 'networkidle', timeout: 20000 });
      if (!res || res.status() >= 400) {
        result.status = 'HTTP_ERROR';
        results.push(result);
        continue;
      }
      await page.waitForTimeout(500);

      // Light mode
      await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
      await page.waitForTimeout(300);
      result.light = await deepContrastCheck(page, 'light');

      // Dark mode
      await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
      await page.waitForTimeout(300);
      result.dark = await deepContrastCheck(page, 'dark');

      const crit = result.light.filter(i => i.severity === 'critical').length + result.dark.filter(i => i.severity === 'critical').length;
      const serious = result.light.filter(i => i.severity === 'serious').length + result.dark.filter(i => i.severity === 'serious').length;
      const moderate = result.light.filter(i => i.severity === 'moderate').length + result.dark.filter(i => i.severity === 'moderate').length;

      totalCritical += crit;
      totalSerious += serious;
      totalModerate += moderate;

      if (crit > 0) result.status = 'CRITICAL';
      else if (serious > 0) result.status = 'SERIOUS';
      else if (moderate > 0) result.status = 'MODERATE';

      const icon = result.status === 'OK' ? '✅' :
                   result.status === 'CRITICAL' ? '🔴' :
                   result.status === 'SERIOUS' ? '🟠' :
                   result.status === 'MODERATE' ? '🟡' : '💥';

      const lightSummary = result.light.length > 0 ? `L:${result.light.length}` : '';
      const darkSummary = result.dark.length > 0 ? `D:${result.dark.length}` : '';
      const details = [lightSummary, darkSummary].filter(Boolean).join(' ');

      console.log(`  ${icon} ${slug.padEnd(25)} ${result.status.padEnd(10)} ${details}`);

      // Show critical/serious details inline
      for (const issue of [...result.light, ...result.dark]) {
        if (issue.severity === 'critical' || issue.severity === 'serious') {
          const mode = result.light.includes(issue) ? 'LIGHT' : 'DARK';
          console.log(`     ⚠ [${mode}] ${issue.tag}:"${issue.text.slice(0,35)}" ratio:${issue.ratio} (need ${issue.wcagAA}:1) color:${issue.color} on ${issue.bg}`);
        }
      }
    } catch (err) {
      result.status = 'ERROR';
      console.log(`  💥 ${slug.padEnd(25)} ERROR: ${err.message.slice(0, 60)}`);
    }

    results.push(result);
  }

  await browser.close();

  console.log(`\n${'─'.repeat(70)}`);
  console.log(`🔴 ${totalCritical} CRITICAL | 🟠 ${totalSerious} SERIOUS | 🟡 ${totalModerate} MODERATE`);
  console.log(`${'─'.repeat(70)}\n`);

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(results, null, 2));
  console.log(`📄 Full report: ${REPORT_PATH}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(2);
});
