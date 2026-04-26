/**
 * Z4 Visual QA — Per-Tool Playwright Checker
 * Screenshots each tool in light/dark, clicks all tabs, runs contrast checks.
 * Usage: node z4-visual-qa.cjs [batch_number]
 *   batch_number: 1-11 (tools divided into batches of 5)
 *   If omitted, runs ALL tools.
 * Output: z4-screenshots/{slug}/ with light/dark screenshots + JSON report
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:1314';
const SCREENSHOT_DIR = path.join(__dirname, 'z4-screenshots');

const ALL_TOOLS = [
  // batch 1
  { slug: 'acronym-battle', batch: 1 },
  { slug: 'admin-badges', batch: 1 },
  { slug: 'admin-bingo', batch: 1 },
  { slug: 'admin-comms', batch: 1 },
  { slug: 'agent-365-planner', batch: 1 },
  // batch 2
  { slug: 'agent-builder-guide', batch: 2 },
  { slug: 'ai-cost-calculator', batch: 2 },
  { slug: 'ai-mapper', batch: 2 },
  { slug: 'ai-news', batch: 2 },
  { slug: 'ai-showdown', batch: 2 },
  // batch 3
  { slug: 'ca-builder', batch: 3 },
  { slug: 'cc', batch: 3 },
  { slug: 'cert-compass', batch: 3 },
  { slug: 'cert-tracker', batch: 3 },
  { slug: 'cli-quiz', batch: 3 },
  // batch 4
  { slug: 'color-palette', batch: 4 },
  { slug: 'compliance-passport', batch: 4 },
  { slug: 'copilot-matrix', batch: 4 },
  { slug: 'copilot-readiness', batch: 4 },
  { slug: 'countdown', batch: 4 },
  // batch 5
  { slug: 'cs-companion', batch: 5 },
  { slug: 'demo-scripts', batch: 5 },
  { slug: 'deprecation-timeline', batch: 5 },
  { slug: 'feature-roulette', batch: 5 },
  { slug: 'feedback', batch: 5 },
  // batch 6
  { slug: 'image-compressor', batch: 6 },
  { slug: 'incident-comms', batch: 6 },
  { slug: 'instruct-builder', batch: 6 },
  { slug: 'it-day-sim', batch: 6 },
  { slug: 'licence-picker', batch: 6 },
  // batch 7
  { slug: 'licensing', batch: 7 },
  { slug: 'm365-roadmap', batch: 7 },
  { slug: 'migration-planner', batch: 7 },
  { slug: 'password-generator', batch: 7 },
  { slug: 'phishing-test', batch: 7 },
  // batch 8
  { slug: 'policy-tester', batch: 8 },
  { slug: 'pomodoro', batch: 8 },
  { slug: 'prompt-guide', batch: 8 },
  { slug: 'prompt-lab', batch: 8 },
  { slug: 'prompt-polisher', batch: 8 },
  // batch 9
  { slug: 'prompt-tester', batch: 9 },
  { slug: 'prompts', batch: 9 },
  { slug: 'ps-builder', batch: 9 },
  { slug: 'purview-starter', batch: 9 },
  { slug: 'qr-generator', batch: 9 },
  // batch 10
  { slug: 'rename-tracker', batch: 10 },
  { slug: 'roi-calculator', batch: 10 },
  { slug: 'security-toolkit', batch: 10 },
  { slug: 'service-health', batch: 10 },
  { slug: 'sla-calculator', batch: 10 },
  // batch 11
  { slug: 'typing-test', batch: 11 },
  { slug: 'wifi-qr', batch: 11 },
  { slug: 'world-clock', batch: 11 },
];

// Contrast check: find light-text-on-light-bg issues
async function contrastCheck(page, mode) {
  return page.evaluate((m) => {
    const problems = [];
    const selectors = 'h1,h2,h3,h4,p,span,a,li,label,button,select,option,td,th,summary,input,textarea';
    document.querySelectorAll(selectors).forEach(el => {
      if (el.offsetHeight === 0 || el.offsetWidth === 0) return;
      const s = getComputedStyle(el);
      const cm = s.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!cm) return;
      const textLum = 0.299 * +cm[1] + 0.587 * +cm[2] + 0.114 * +cm[3];

      // Get effective background
      let bgEl = el;
      let bgColor = null;
      while (bgEl) {
        const bs = getComputedStyle(bgEl);
        const bgm = bs.backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/);
        if (bgm && (+bgm[4] || 1) > 0.1) {
          bgColor = bgm;
          break;
        }
        bgEl = bgEl.parentElement;
      }

      if (m === 'light') {
        // Light mode: light text on light bg = bad
        if (textLum > 200) {
          const bgLum = bgColor ? (0.299 * +bgColor[1] + 0.587 * +bgColor[2] + 0.114 * +bgColor[3]) : 250;
          if (bgLum > 200) {
            const txt = el.textContent?.trim().slice(0, 50);
            if (txt) {
              problems.push({
                tag: el.tagName,
                text: txt,
                color: s.color,
                bg: bgColor ? `rgb(${bgColor[1]},${bgColor[2]},${bgColor[3]})` : 'inherited-white',
                severity: 'critical'
              });
            }
          }
        }
      } else {
        // Dark mode: dark text on dark bg = bad
        if (textLum < 50) {
          const bgLum = bgColor ? (0.299 * +bgColor[1] + 0.587 * +bgColor[2] + 0.114 * +bgColor[3]) : 10;
          if (bgLum < 50) {
            const txt = el.textContent?.trim().slice(0, 50);
            if (txt) {
              problems.push({
                tag: el.tagName,
                text: txt,
                color: s.color,
                bg: bgColor ? `rgb(${bgColor[1]},${bgColor[2]},${bgColor[3]})` : 'inherited-dark',
                severity: 'critical'
              });
            }
          }
        }
      }
    });
    // Dedupe by text
    const seen = new Set();
    return problems.filter(p => {
      const key = p.text + p.tag;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, mode);
}

// Check for backdrop-filter usage (computed)
async function checkBackdropFilter(page) {
  return page.evaluate(() => {
    const issues = [];
    document.querySelectorAll('*').forEach(el => {
      const s = getComputedStyle(el);
      const bf = s.backdropFilter || s.webkitBackdropFilter;
      if (bf && bf !== 'none') {
        issues.push({
          tag: el.tagName,
          class: el.className?.toString().slice(0, 60),
          value: bf
        });
      }
    });
    return issues;
  });
}

// Check tab style (should be underline, not pill)
async function checkTabStyle(page) {
  return page.evaluate(() => {
    const tabs = document.querySelectorAll('[role="tab"]');
    const issues = [];
    tabs.forEach(tab => {
      const s = getComputedStyle(tab);
      const br = parseFloat(s.borderRadius) || 0;
      if (br > 20) {
        issues.push({
          text: tab.textContent?.trim().slice(0, 30),
          borderRadius: s.borderRadius,
          issue: 'pill-style-tab'
        });
      }
    });
    return { tabCount: tabs.length, issues };
  });
}

// Get all tab buttons on a page
async function getTabButtons(page) {
  return page.evaluate(() => {
    const tabs = document.querySelectorAll('[role="tab"]');
    return Array.from(tabs).map((t, i) => ({
      index: i,
      text: t.textContent?.trim().slice(0, 30),
      ariaSelected: t.getAttribute('aria-selected')
    }));
  });
}

async function qaToolPage(page, slug, outDir) {
  const result = {
    slug,
    url: `${BASE}/${slug}/`,
    light: { contrast: [], backdrop: [], tabs: null },
    dark: { contrast: [], backdrop: [], tabs: null },
    tabScreenshots: [],
    status: 'GOOD',
    errors: []
  };

  try {
    // Navigate to the tool page
    const response = await page.goto(`${BASE}/${slug}/`, { waitUntil: 'networkidle', timeout: 15000 });
    if (!response || response.status() >= 400) {
      result.status = 'ERROR';
      result.errors.push(`HTTP ${response?.status() || 'no response'}`);
      return result;
    }

    // Wait for content to render
    await page.waitForTimeout(800);

    // === LIGHT MODE ===
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(outDir, `${slug}-light.png`), fullPage: false });

    result.light.contrast = await contrastCheck(page, 'light');
    result.light.backdrop = await checkBackdropFilter(page);
    result.light.tabs = await checkTabStyle(page);

    // === DARK MODE ===
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(outDir, `${slug}-dark.png`), fullPage: false });

    result.dark.contrast = await contrastCheck(page, 'dark');
    result.dark.backdrop = await checkBackdropFilter(page);
    result.dark.tabs = await checkTabStyle(page);

    // === TAB SCREENSHOTS ===
    const tabs = await getTabButtons(page);
    if (tabs.length > 1) {
      for (const tab of tabs) {
        try {
          // Reset to light mode for tab screenshots
          await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
          await page.waitForTimeout(200);

          // Click the tab
          const tabEls = await page.$$('[role="tab"]');
          if (tabEls[tab.index]) {
            await tabEls[tab.index].click();
            await page.waitForTimeout(400);

            const tabSlug = tab.text.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 20);
            await page.screenshot({
              path: path.join(outDir, `${slug}-tab-${tabSlug}-light.png`),
              fullPage: false
            });

            // Check contrast on this tab content
            const tabContrast = await contrastCheck(page, 'light');
            if (tabContrast.length > 0) {
              result.tabScreenshots.push({ tab: tab.text, mode: 'light', contrastIssues: tabContrast });
            }

            // Dark mode for this tab
            await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
            await page.waitForTimeout(300);
            await page.screenshot({
              path: path.join(outDir, `${slug}-tab-${tabSlug}-dark.png`),
              fullPage: false
            });

            const tabContrastDark = await contrastCheck(page, 'dark');
            if (tabContrastDark.length > 0) {
              result.tabScreenshots.push({ tab: tab.text, mode: 'dark', contrastIssues: tabContrastDark });
            }
          }
        } catch (tabErr) {
          result.errors.push(`Tab "${tab.text}": ${tabErr.message}`);
        }
      }
    }

    // === DETERMINE STATUS ===
    const lightCritical = result.light.contrast.filter(c => c.severity === 'critical').length;
    const darkCritical = result.dark.contrast.filter(c => c.severity === 'critical').length;
    const tabCritical = result.tabScreenshots.reduce((sum, t) =>
      sum + (t.contrastIssues?.filter(c => c.severity === 'critical').length || 0), 0);
    const backdropIssues = result.light.backdrop.length + result.dark.backdrop.length;
    const tabStyleIssues = (result.light.tabs?.issues?.length || 0) + (result.dark.tabs?.issues?.length || 0);

    const totalCritical = lightCritical + darkCritical + tabCritical;

    if (totalCritical > 5 || backdropIssues > 0) {
      result.status = 'FAIL';
    } else if (totalCritical > 0 || tabStyleIssues > 0) {
      result.status = 'WARN';
    }

  } catch (err) {
    result.status = 'ERROR';
    result.errors.push(err.message);
  }

  return result;
}

async function main() {
  const batchArg = process.argv[2] ? parseInt(process.argv[2]) : null;
  const tools = batchArg ? ALL_TOOLS.filter(t => t.batch === batchArg) : ALL_TOOLS;

  console.log(`\n🌸 Z4 Visual QA — ${tools.length} tools${batchArg ? ` (batch ${batchArg})` : ' (ALL)'}\n`);

  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  // Suppress console noise from the pages
  page.on('console', () => {});
  page.on('pageerror', () => {});

  const results = [];

  for (const tool of tools) {
    const toolDir = path.join(SCREENSHOT_DIR, tool.slug);
    fs.mkdirSync(toolDir, { recursive: true });

    process.stdout.write(`  ${tool.slug.padEnd(25)}`);
    const result = await qaToolPage(page, tool.slug, toolDir);
    results.push(result);

    const icon = result.status === 'GOOD' ? '✅' : result.status === 'WARN' ? '⚠️' : result.status === 'FAIL' ? '❌' : '💥';
    const lightC = result.light.contrast.length;
    const darkC = result.dark.contrast.length;
    const tabCount = result.light.tabs?.tabCount || 0;
    const bd = result.light.backdrop.length + result.dark.backdrop.length;

    console.log(`${icon} ${result.status.padEnd(5)} | tabs:${tabCount} | contrast: L${lightC}/D${darkC} | backdrop:${bd}`);
  }

  await browser.close();

  // Summary
  const good = results.filter(r => r.status === 'GOOD').length;
  const warn = results.filter(r => r.status === 'WARN').length;
  const fail = results.filter(r => r.status === 'FAIL').length;
  const err = results.filter(r => r.status === 'ERROR').length;

  console.log(`\n${'─'.repeat(70)}`);
  console.log(`✅ ${good} GOOD | ⚠️ ${warn} WARN | ❌ ${fail} FAIL | 💥 ${err} ERROR`);
  console.log(`${'─'.repeat(70)}\n`);

  // Write detailed report
  const reportPath = path.join(SCREENSHOT_DIR, batchArg ? `report-batch${batchArg}.json` : 'report-all.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`📄 Report: ${reportPath}`);

  // Print issues for WARN/FAIL tools
  const issues = results.filter(r => r.status !== 'GOOD');
  if (issues.length > 0) {
    console.log('\n🔍 Issues:\n');
    for (const r of issues) {
      console.log(`  ${r.slug} (${r.status}):`);
      if (r.light.contrast.length > 0) {
        console.log(`    Light contrast: ${r.light.contrast.map(c => `${c.tag}:"${c.text}"`).join(', ')}`);
      }
      if (r.dark.contrast.length > 0) {
        console.log(`    Dark contrast: ${r.dark.contrast.map(c => `${c.tag}:"${c.text}"`).join(', ')}`);
      }
      if (r.light.backdrop.length > 0) {
        console.log(`    Backdrop-filter: ${r.light.backdrop.map(b => b.class).join(', ')}`);
      }
      if (r.light.tabs?.issues?.length > 0) {
        console.log(`    Pill tabs: ${r.light.tabs.issues.map(t => t.text).join(', ')}`);
      }
      if (r.tabScreenshots.length > 0) {
        for (const ts of r.tabScreenshots) {
          if (ts.contrastIssues?.length > 0) {
            console.log(`    Tab "${ts.tab}" (${ts.mode}): ${ts.contrastIssues.map(c => `${c.tag}:"${c.text}"`).join(', ')}`);
          }
        }
      }
      if (r.errors.length > 0) {
        console.log(`    Errors: ${r.errors.join(', ')}`);
      }
    }
  }

  process.exit(fail > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(2);
});
