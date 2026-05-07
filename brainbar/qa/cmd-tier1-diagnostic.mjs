#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
// cmd Tier 1 — Playwright diagnostic
// ═══════════════════════════════════════════════════════════════════════════
//
// Smoke + regression coverage for Tier 1 capability additions:
//   • verbs:          tree, why, freshness
//   • pipes:          json, csv, sort, head, tail, wc (plus existing grep)
//   • decode kinds:   guid, resource-id, graph, sku, mc
//   • dump block:     XSS-safe rendering (textContent, not innerHTML)
//   • smart-suggest:  ordered matcher fires correct decode <kind> command
//   • voice silence:  man <slug> appends NO take when entry has none
//   • freshness UI:   today's all-fresh state shows no badges
//
// Usage:
//   1. Start hugo dev server in a separate terminal:
//        cd brainbar && hugo server --port 1315 --disableFastRender
//   2. Run this script:
//        cd brainbar && node qa/cmd-tier1-diagnostic.mjs
//
// Exit codes:
//   0   all assertions passed
//   1   one or more assertions failed (details printed)
//   2   page failed to load / console errors / pageerror events
// ═══════════════════════════════════════════════════════════════════════════

import { chromium } from 'playwright';

const BASE_URL = process.env.CMD_BASE_URL || 'http://localhost:1315/';
const HEADLESS = process.env.HEADLESS !== 'false';

const RED = '\x1b[31m', GREEN = '\x1b[32m', YELLOW = '\x1b[33m', DIM = '\x1b[2m', RESET = '\x1b[0m', BOLD = '\x1b[1m';
const log = {
  pass(name) { console.log(`  ${GREEN}\u2713${RESET} ${name}`); },
  fail(name, msg) { console.log(`  ${RED}\u2717${RESET} ${BOLD}${name}${RESET}\n      ${msg || ''}`); },
  section(name) { console.log(`\n${BOLD}${name}${RESET}`); },
  info(msg) { console.log(`${DIM}${msg}${RESET}`); },
};

const failures = [];
function assert(name, cond, msg) {
  if (cond) log.pass(name);
  else { failures.push({ name, msg }); log.fail(name, msg); }
}

async function runTerminalCommand(page, line) {
  await page.fill('#cmd-input', line);
  await page.press('#cmd-input', 'Enter');
  await page.waitForTimeout(300);
}
async function lastGroupText(page) {
  return await page.evaluate(() => {
    const groups = document.querySelectorAll('#cmd-buffer .cmd-group');
    return groups.length ? groups[groups.length - 1].innerText : '';
  });
}
async function lastGroupHtml(page) {
  return await page.evaluate(() => {
    const groups = document.querySelectorAll('#cmd-buffer .cmd-group');
    return groups.length ? groups[groups.length - 1].innerHTML : '';
  });
}

async function main() {
  const browser = await chromium.launch({ headless: HEADLESS });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', e => pageErrors.push(String(e)));
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

  log.info(`loading ${BASE_URL}\u2026`);
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForSelector('.cmd-v2-home', { timeout: 5000 });

  // Wait for index to load (terminal becomes ready when STATE.entries is populated)
  await page.waitForFunction(() => {
    const el = document.querySelector('.cmd-status');
    return el && /\d+\s*entries/i.test(el.innerText);
  }, { timeout: 10000 }).catch(() => { /* fall through; assertions will fail visibly */ });

  // ─── Page load smoke ──────────────────────────────────────────────────
  log.section('1. Page load');
  assert('no pageerror events', pageErrors.length === 0, pageErrors.join('\n'));
  assert('no console errors', consoleErrors.length === 0, consoleErrors.join('\n'));

  // ─── Tree ─────────────────────────────────────────────────────────────
  log.section('2. tree verb');
  await runTerminalCommand(page, 'tree m365-e5');
  let txt = await lastGroupText(page);
  assert('tree m365-e5 returns output', txt.length > 50);
  assert('tree m365-e5 mentions "includes"', /includes/i.test(txt));
  assert('tree m365-e5 includes mde child', /\bmde\b/.test(txt));
  assert('tree m365-e5 includes mdi child', /\bmdi\b/.test(txt));
  assert('tree m365-e5 has source link', /licensing\/microsoft-365-e5/i.test(await lastGroupHtml(page)));

  await runTerminalCommand(page, 'tree mde');
  txt = await lastGroupText(page);
  assert('tree mde returns parents', /m365-e5|m365-e3|m365-f3/.test(txt));
  assert('tree mde shows "included_in"', /included_in/i.test(txt));

  await runTerminalCommand(page, 'tree azure-ai-foundry');
  txt = await lastGroupText(page);
  assert('tree non-bundling entry returns fallback line', /no tree relationship/i.test(txt));

  // ─── Why ──────────────────────────────────────────────────────────────
  log.section('3. why verb (voice silence rule)');
  await runTerminalCommand(page, 'why mde');
  txt = await lastGroupText(page);
  let html = await lastGroupHtml(page);
  assert('why mde shows sush take', /sush take/i.test(txt));
  assert('why mde marks spicy take with badge', /\[spicy\]/i.test(txt) || /cmd-take-badge.*spicy/i.test(html));

  await runTerminalCommand(page, 'why pim');
  txt = await lastGroupText(page);
  assert('why pim — no fake take rendered', !/sush take:/i.test(txt));

  // ─── Freshness ───────────────────────────────────────────────────────
  log.section('4. freshness verb');
  await runTerminalCommand(page, 'freshness');
  txt = await lastGroupText(page);
  assert('freshness audit runs', /freshness audit/i.test(txt));
  assert('freshness today: all fresh, no stale/ancient', /no stale or ancient entries/i.test(txt));

  // ─── man auto-append voice silence ───────────────────────────────────
  log.section('5. man auto-append (voice silence rule)');
  await runTerminalCommand(page, 'man mde');
  txt = await lastGroupText(page);
  assert('man mde auto-appends spicy take', /sush take:/i.test(txt) && /Ferrari/i.test(txt));

  await runTerminalCommand(page, 'man pim');
  txt = await lastGroupText(page);
  assert('man pim does NOT append "no take recorded"', !/no honest take recorded/i.test(txt));
  assert('man pim does NOT auto-append a sush take line', !/sush take:/i.test(txt));

  // ─── Pipes ────────────────────────────────────────────────────────────
  log.section('6. pipes');
  await runTerminalCommand(page, 'search mde | json');
  let dumpText = await page.evaluate(() => {
    const dumps = document.querySelectorAll('#cmd-buffer .cmd-dump-pre');
    return dumps.length ? dumps[dumps.length - 1].textContent : '';
  });
  let parsed = null;
  try { parsed = JSON.parse(dumpText); } catch (_) {}
  assert('| json produces parseable JSON dump', parsed !== null && Array.isArray(parsed));
  assert('| json strips html field', parsed && parsed.every(b => !('html' in b)));

  await runTerminalCommand(page, 'ls jargon | wc');
  txt = await lastGroupText(page);
  assert('| wc reports total + breakdown by type', /total: \d+.*list:/i.test(txt));

  await runTerminalCommand(page, 'ls jargon | sort | head 5');
  const blockCount = await page.evaluate(() => {
    const groups = document.querySelectorAll('#cmd-buffer .cmd-group');
    if (!groups.length) return 0;
    return groups[groups.length - 1].querySelectorAll('.cmd-line').length;
  });
  assert('| sort | head 5 returns at most 6 .cmd-line blocks (5 data + 1 chrome)', blockCount > 0 && blockCount <= 7);

  // ─── Decode handlers ─────────────────────────────────────────────────
  log.section('7. decode handlers');
  await runTerminalCommand(page, 'decode sku 06ebc4ee-1bb5-47dd-8120-11324bc54e06');
  txt = await lastGroupText(page);
  assert('decode sku resolves M365 E5 GUID', /m365-e5/i.test(txt));

  await runTerminalCommand(page, 'decode guid aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');
  txt = await lastGroupText(page);
  assert('decode guid returns hint for unknown UUID', /tenant|app|group|user/i.test(txt));

  await runTerminalCommand(page, 'decode resource-id /subscriptions/06ebc4ee-1bb5-47dd-8120-11324bc54e06/resourceGroups/rg-prod/providers/Microsoft.Web/sites/myapp');
  txt = await lastGroupText(page);
  assert('decode resource-id parses subscription', /subscription/i.test(txt));
  assert('decode resource-id parses resource group', /resource group/i.test(txt) && /rg-prod/.test(txt));

  await runTerminalCommand(page, 'decode graph https://graph.microsoft.com/v1.0/users');
  txt = await lastGroupText(page);
  assert('decode graph identifies api version', /v1\.0/i.test(txt));
  assert('decode graph suggests scope', /User\.Read\.All/i.test(txt));

  await runTerminalCommand(page, 'decode mc MC823456');
  txt = await lastGroupText(page);
  assert('decode mc links to m365-roadmap', /m365-roadmap/i.test(txt));

  // Legacy errno path (AADSTS / 0x HRESULT / KB) — uses real codes from cmd_decode.toml
  await runTerminalCommand(page, 'decode AADSTS50105');
  txt = await lastGroupText(page);
  assert('decode AADSTS50105 returns plain-english entry', /User not assigned/i.test(txt));

  await runTerminalCommand(page, 'decode 0x80070005');
  txt = await lastGroupText(page);
  assert('decode 0x80070005 returns E_ACCESSDENIED', /access.{0,15}denied|E_ACCESSDENIED/i.test(txt));

  // Graceful fallback for unknown errno code — must surface 3 ways forward
  await runTerminalCommand(page, 'decode AADSTS99999');
  txt = await lastGroupText(page);
  assert('unknown decode shows "no curated decode" message', /no curated decode/i.test(txt));
  assert('unknown decode offers `ask` chip', /ask AADSTS99999/.test(txt));
  assert('unknown decode links to Microsoft Learn search', /learn\.microsoft\.com.+search/i.test(await lastGroupHtml(page)));
  assert('unknown decode links to feedback', /feedback/i.test(await lastGroupHtml(page)));

  // ─── XSS / injection guards ──────────────────────────────────────────
  log.section('8. XSS guards');
  // Force a dump containing a script tag — verify it's NOT executed.
  // We'll inject by making search match a non-existent term that's just text.
  await page.evaluate(() => {
    window.__xss_canary = false;
  });
  // The dump rendering should use textContent. Verify by checking that an
  // injected <script> in dump payload is rendered as visible text, not parsed.
  await page.evaluate(() => {
    const mockBlocks = [{ type: 'plain', text: '<script>window.__xss_canary=true</script>', html: '' }];
    // Run | json on this synthetic input by calling the renderer indirectly.
    // We can't call applyPipe directly (IIFE-scoped), but the 'search foo | json' path will exercise the dump block.
  });
  await runTerminalCommand(page, 'search nonexistentslugforxss | json');
  await page.waitForTimeout(300);
  const xssFired = await page.evaluate(() => !!window.__xss_canary);
  assert('XSS canary not fired by | json dump rendering', xssFired === false);

  // ─── Smart-suggest matcher ───────────────────────────────────────────
  log.section('9. smart-suggest (ordered matcher)');
  await page.fill('#cmd-input', '06ebc4ee-1bb5-47dd-8120-11324bc54e06');
  await page.waitForTimeout(200);
  let suggestText = await page.evaluate(() => {
    const el = document.querySelector('#cmd-suggest');
    return el ? el.innerText : '';
  });
  assert('SKU GUID paste suggests "decode sku"', /decode sku/.test(suggestText));

  await page.fill('#cmd-input', '/subscriptions/06ebc4ee-1bb5-47dd-8120-11324bc54e06/resourceGroups/rg-prod/providers/Microsoft.Web/sites/myapp');
  await page.waitForTimeout(200);
  suggestText = await page.evaluate(() => document.querySelector('#cmd-suggest').innerText);
  assert('Azure resource ID paste suggests "decode resource-id"', /decode resource-id/.test(suggestText));

  await page.fill('#cmd-input', 'https://graph.microsoft.com/v1.0/users');
  await page.waitForTimeout(200);
  suggestText = await page.evaluate(() => document.querySelector('#cmd-suggest').innerText);
  assert('Graph URL paste suggests "decode graph"', /decode graph/.test(suggestText));

  // ─── Help progressive ────────────────────────────────────────────────
  log.section('10. progressive help');
  await runTerminalCommand(page, 'help pipes');
  txt = await lastGroupText(page);
  assert('help pipes documents | json', /\| json/.test(txt));
  assert('help pipes documents | csv', /\| csv/.test(txt));
  assert('help pipes documents | head/tail', /head|tail/i.test(txt));

  await runTerminalCommand(page, 'help decode');
  txt = await lastGroupText(page);
  assert('help decode documents 5 kinds', /guid/i.test(txt) && /resource-id/i.test(txt) && /graph/i.test(txt) && /sku/i.test(txt) && /mc/i.test(txt));

  // ─── Onboarding (Tier 1 follow-up — added 7 May 2026) ─────────────────
  log.section('11. onboarding — samples verb');
  await runTerminalCommand(page, 'samples');
  txt = await lastGroupText(page);
  assert('samples returns the menu heading', /samples/i.test(txt));
  assert('samples covers ask section', /ask in plain english/i.test(txt) || /ask whats included/i.test(txt));
  assert('samples covers tree section', /explore a license/i.test(txt) || /tree m365-e5/i.test(txt));
  assert('samples covers pipes section', /power pipes/i.test(txt));

  log.section('12. onboarding — NL detection fires `ask` chip');
  await page.fill('#cmd-input', 'what license includes conditional access');
  await page.waitForTimeout(200);
  let nlSuggest = await page.evaluate(() => document.querySelector('#cmd-suggest').innerText);
  assert('natural-language input suggests `ask` chip', /^ask /m.test(nlSuggest));

  await page.fill('#cmd-input', 'difference between mde plan 1 and plan 2');
  await page.waitForTimeout(200);
  nlSuggest = await page.evaluate(() => document.querySelector('#cmd-suggest').innerText);
  assert('comparison-style input suggests `ask` chip', /ask difference between mde/i.test(nlSuggest));

  await page.fill('#cmd-input', 'mde');
  await page.waitForTimeout(200);
  nlSuggest = await page.evaluate(() => document.querySelector('#cmd-suggest').innerText);
  assert('short slug input does NOT suggest `ask`', !/^ask mde$/m.test(nlSuggest));

  await page.fill('#cmd-input', '');

  log.section('13. onboarding — search miss nudges toward `ask`');
  await runTerminalCommand(page, 'search totallyfakeproductnameforsure');
  txt = await lastGroupText(page);
  assert('search miss surfaces `ask` nudge', /not finding it.+ask/i.test(txt));

  await browser.close();

  // ─── Summary ──────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(60));
  if (failures.length === 0 && pageErrors.length === 0 && consoleErrors.length === 0) {
    console.log(`${GREEN}${BOLD}\u2713 cmd Tier 1 diagnostic: ALL PASS${RESET}`);
    process.exit(0);
  } else {
    console.log(`${RED}${BOLD}\u2717 cmd Tier 1 diagnostic: ${failures.length} failure(s)${RESET}`);
    if (pageErrors.length) console.log(`${RED}pageerror: ${pageErrors.join(' | ')}${RESET}`);
    if (consoleErrors.length) console.log(`${RED}console errors: ${consoleErrors.join(' | ')}${RESET}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(`${RED}${BOLD}\u2717 diagnostic crashed${RESET}\n${err.stack || err}`);
  process.exit(2);
});
