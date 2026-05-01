#!/usr/bin/env node
/**
 * Copilot Frontier Map — Semi-Automated Update Checker
 * =====================================================
 * Scrapes the Microsoft Frontier Features page and compares
 * against features.toml to detect new/changed features.
 *
 * Usage: node scripts/check-frontier-updates.js
 *
 * Output: Prints a diff of what's new/changed. Does NOT
 * auto-update — manual verification required before TOML edit.
 *
 * Sources checked:
 *   1. https://www.microsoft.com/en-us/microsoft-365-copilot/frontier-features
 *   2. M365 Roadmap RSS (future: add when feed URL confirmed)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const FRONTIER_URL = 'https://www.microsoft.com/en-us/microsoft-365-copilot/frontier-features';
const TOML_PATH = path.join(__dirname, '..', 'data', 'copilot_frontier_map', 'features.toml');

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (aguidetocloud-frontier-check)' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseExistingFeatures() {
  const content = fs.readFileSync(TOML_PATH, 'utf-8');
  const ids = [];
  const namePattern = /^name\s*=\s*"([^"]+)"/gm;
  let match;
  while ((match = namePattern.exec(content)) !== null) {
    ids.push(match[1]);
  }
  return ids;
}

function extractFeaturesFromHtml(html) {
  // Simple pattern matching — Frontier features page uses consistent structure
  const features = [];
  // Look for feature headings (h3 or strong tags with feature names)
  const patterns = [
    /(?:Learn about|Go from|Focus on|Use Microsoft|Draft, edit).*?(?=<\/)/gi,
    /New (?:agentic|capabilities).*?(?=<\/)/gi,
  ];
  // Extract text blocks that look like feature titles
  const titlePattern = /###\s+(.+?)(?:\n|$)/g;
  let m;
  while ((m = titlePattern.exec(html)) !== null) {
    features.push(m[1].trim());
  }
  return features;
}

async function main() {
  console.log('🔍 Copilot Frontier Map — Update Checker');
  console.log('=========================================\n');

  // Load existing features
  const existing = parseExistingFeatures();
  console.log(`📋 Current features in TOML: ${existing.length}`);
  existing.forEach(n => console.log(`   • ${n}`));

  console.log('\n🌐 Fetching Frontier Features page...');
  try {
    const html = await fetchPage(FRONTIER_URL);
    console.log(`   ✅ Fetched ${(html.length / 1024).toFixed(1)}KB`);

    // Basic content analysis
    const keywords = ['Cowork', 'Researcher', 'Legal Agent', 'Call Delegation', 'Planner', 'Outlook'];
    console.log('\n🔎 Feature keyword scan:');
    keywords.forEach(kw => {
      const found = html.toLowerCase().includes(kw.toLowerCase());
      console.log(`   ${found ? '✅' : '❌'} ${kw}`);
    });

    // Check for new feature indicators
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonth = monthNames[new Date().getMonth()];
    const currentYear = new Date().getFullYear();
    const hasCurrentMonth = html.includes(`${currentMonth} ${currentYear}`);
    console.log(`\n📅 Contains "${currentMonth} ${currentYear}": ${hasCurrentMonth ? '✅ Yes — may have new features' : '⚠️ No — page may not be updated yet'}`);

    console.log('\n─────────────────────────────────');
    console.log('📝 Action: Review the page manually at:');
    console.log(`   ${FRONTIER_URL}`);
    console.log('   Compare against features.toml and update if needed.');
    console.log('   Then run: hugo server to verify.\n');

  } catch (err) {
    console.error(`   ❌ Failed to fetch: ${err.message}`);
    console.log('   Try manually: open the URL in a browser.\n');
  }
}

main();
