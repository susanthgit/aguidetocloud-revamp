// Diagnostic: click errno chip on live site, see what happens
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'https://cmd.aguidetocloud.com/';

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

const errors = [];
const consoleMsgs = [];
page.on('pageerror', e => errors.push(`PAGEERROR: ${e.message}\n${e.stack || ''}`));
page.on('console', m => consoleMsgs.push(`[${m.type()}] ${m.text()}`));

console.log(`Loading ${BASE} ...`);
await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });

// 1. Are chips visible?
const jargonChip = await page.locator('.bb-mode-chip-jargon').count();
const errnoChip = await page.locator('.bb-mode-chip-errno').count();
console.log(`Chips found: jargon=${jargonChip}, errno=${errnoChip}`);

// 2. State BEFORE click
const stateBefore = await page.evaluate(() => ({
  mode: document.querySelector('.bb-hero')?.getAttribute('data-bb-mode') || null,
  jargonActive: document.querySelector('.bb-mode-chip-jargon')?.classList.contains('bb-mode-chip-active') || false,
  errnoActive: document.querySelector('.bb-mode-chip-errno')?.classList.contains('bb-mode-chip-active') || false,
  inputPlaceholder: document.querySelector('#bb-input')?.getAttribute('placeholder') || null,
  jargonBootDisplay: getComputedStyle(document.querySelector('.bb-boot-jargon')).display,
  decodeBootDisplay: getComputedStyle(document.querySelector('.bb-boot-decode')).display,
}));
console.log('STATE BEFORE click:');
console.log(JSON.stringify(stateBefore, null, 2));

// 3. Click errno chip
console.log('\nClicking [ ! errno ] chip ...');
await page.click('.bb-mode-chip-errno');
await page.waitForTimeout(500);

// 4. State AFTER click
const stateAfter = await page.evaluate(() => ({
  mode: document.querySelector('.bb-hero')?.getAttribute('data-bb-mode') || null,
  jargonActive: document.querySelector('.bb-mode-chip-jargon')?.classList.contains('bb-mode-chip-active') || false,
  errnoActive: document.querySelector('.bb-mode-chip-errno')?.classList.contains('bb-mode-chip-active') || false,
  inputPlaceholder: document.querySelector('#bb-input')?.getAttribute('placeholder') || null,
  jargonBootDisplay: getComputedStyle(document.querySelector('.bb-boot-jargon')).display,
  decodeBootDisplay: getComputedStyle(document.querySelector('.bb-boot-decode')).display,
}));
console.log('\nSTATE AFTER click:');
console.log(JSON.stringify(stateAfter, null, 2));

// 5. Diff
console.log('\n=== DIFF ===');
const changed = Object.keys(stateBefore).filter(k => stateBefore[k] !== stateAfter[k]);
if (changed.length === 0) {
  console.log('🔴 NOTHING CHANGED');
} else {
  changed.forEach(k => console.log(`  ${k}: ${stateBefore[k]} -> ${stateAfter[k]}`));
}

// 6. Errors
if (errors.length > 0) {
  console.log('\n=== JS ERRORS ===');
  errors.forEach(e => console.log(e));
} else {
  console.log('\nNo JS errors.');
}

const consoleErrs = consoleMsgs.filter(m => m.startsWith('[error]'));
if (consoleErrs.length > 0) {
  console.log('\n=== CONSOLE ERRORS ===');
  consoleErrs.forEach(m => console.log(m));
}

// 7. Test smart-suggest in jargon mode (need to first switch back)
console.log('\n=== Testing smart-suggest in jargon mode ===');
await page.click('.bb-mode-chip-jargon');
await page.waitForTimeout(300);
await page.fill('#bb-input', '0x80070005');
await page.waitForTimeout(800);
const results = await page.evaluate(() => {
  const items = Array.from(document.querySelectorAll('#bb-results .bb-result'));
  return items.map(li => ({
    classes: li.className,
    text: (li.textContent || '').trim().slice(0, 100),
  }));
});
console.log(`Results count: ${results.length}`);
results.forEach((r, i) => console.log(`  [${i}] ${r.classes} :: ${r.text}`));

await browser.close();
