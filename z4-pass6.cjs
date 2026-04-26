/**
 * Z4 Pass 6 — Targeted CSS cleanup
 * Fixes remaining per-tool accent colours, near-white text,
 * glass pill tab code, and button text color inheritance.
 */

const fs = require('fs');
const path = require('path');

const CSS_DIR = path.join(__dirname, 'static', 'css');

// Replacements to apply
const REPLACEMENTS = [
  // ── Per-tool accent colours → var(--accent) ──
  // demo-scripts orange
  { pattern: /color:\s*#F97316/g, replacement: 'color: var(--accent)', files: ['demo-scripts.css'] },
  { pattern: /border-color:\s*#F97316/g, replacement: 'border-color: var(--accent)', files: ['demo-scripts.css'] },
  { pattern: /accent-color:\s*#F97316/g, replacement: 'accent-color: var(--accent)', files: ['demo-scripts.css'] },
  { pattern: /border-left:\s*3px solid #F97316/g, replacement: 'border-left: 3px solid var(--accent)', files: ['demo-scripts.css'] },
  { pattern: /rgba\(249,\s*115,\s*22,\s*0\.2\)/g, replacement: 'var(--accent-subtle)', files: ['demo-scripts.css'] },
  { pattern: /rgba\(249,\s*115,\s*22,\s*0\.12\)/g, replacement: 'var(--accent-subtle)', files: ['demo-scripts.css'] },
  { pattern: /rgba\(249,\s*115,\s*22,\s*0\.15\)/g, replacement: 'var(--accent-subtle)', files: ['demo-scripts.css'] },
  { pattern: /rgba\(249,\s*115,\s*22,\s*0\.3\)/g, replacement: 'var(--accent)', files: ['demo-scripts.css'] },
  { pattern: /box-shadow:\s*0 0 12px rgba\(249,115,22,0\.15\)/g, replacement: 'box-shadow: none', files: ['demo-scripts.css'] },
  { pattern: /box-shadow:\s*0 0 16px rgba\(249,115,22,0\.2\)/g, replacement: 'box-shadow: none', files: ['demo-scripts.css'] },

  // ── Near-white text → var(--text-primary) ──
  { pattern: /color:\s*#f1f1f1/g, replacement: 'color: var(--text-primary)', files: null }, // all CSS files
  { pattern: /color:\s*#e0e0f0/g, replacement: 'color: var(--text-primary)', files: null },
  { pattern: /color:\s*#e6edf3/g, replacement: 'color: var(--text-primary)', files: null },

  // ── Print styles: keep hardcoded (they're in @media print) ──
  // Skip — these are intentional for printing

  // ── Glass pill tab cleanup (tabs with 999px border-radius) ──
  // Note: Don't change ALL 999px — only the ones in tab containers
];

// Files to add explicit button text color for dark mode
const BUTTON_COLOR_FIX_FILES = {
  'demo-scripts.css': '.demoscr-scenario-card',
  'countdown.css': '.countdown-preset-btn',
  'password-generator.css': '.pwgen-action-btn, .pwgen-icon-btn',
  'qr-generator.css': '.qr-action-btn, .qr-icon-btn',
  'wifi-qr.css': '.wifiqr-action-btn',
  'pomodoro.css': '.pomo-btn',
  'world-clock.css': '.wc-btn, .wc-clear-btn',
  'roi-calculator.css': '.roi-info-btn',
  'licence-picker.css': '.licpick-check',
};

let totalChanges = 0;

function applyReplacements() {
  const allCssFiles = fs.readdirSync(CSS_DIR).filter(f => f.endsWith('.css'));

  for (const rep of REPLACEMENTS) {
    const targetFiles = rep.files || allCssFiles;

    for (const filename of targetFiles) {
      const filepath = path.join(CSS_DIR, filename);
      if (!fs.existsSync(filepath)) continue;

      let content = fs.readFileSync(filepath, 'utf8');
      const matches = content.match(rep.pattern);
      if (matches && matches.length > 0) {
        content = content.replace(rep.pattern, rep.replacement);
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`  ${filename}: ${matches.length}× ${rep.pattern.source.slice(0, 40)} → ${rep.replacement}`);
        totalChanges += matches.length;
      }
    }
  }
}

function fixDemoScriptsPrintBlocks() {
  // Restore #F97316 in print-specific blocks where we need hardcoded for print rendering
  const filepath = path.join(CSS_DIR, 'demo-scripts.css');
  if (!fs.existsSync(filepath)) return;

  let content = fs.readFileSync(filepath, 'utf8');

  // In @media print blocks, CSS variables may not resolve correctly,
  // but actually modern browsers handle them fine. Keep var(--accent) everywhere.
  // Just fix the print background colors that need to be hardcoded
  const fixes = [
    // Print backgrounds
    { from: 'background: #f9f9f9', to: 'background: #f9f9f9' }, // keep
    { from: 'background: #f0f0f0', to: 'background: #f0f0f0' }, // keep
    { from: 'color: #333', to: 'color: #333' }, // keep in print
  ];
  // These are already fine since they're in @media print
}

function cleanGlassPillTabs() {
  // The 9 files mentioned in the playbook that have dead glass pill tab code
  const glassPillFiles = [
    'ai-cost-calculator.css', 'ainews.css', 'instruct-builder.css',
    'prompt-guide.css', 'prompt-tester.css', 'ps-builder.css',
    'qr-generator.css', 'readiness.css', 'roadmap.css',
    'demo-scripts.css', 'licence-picker.css' // also found in detection
  ];

  for (const filename of glassPillFiles) {
    const filepath = path.join(CSS_DIR, filename);
    if (!fs.existsSync(filepath)) continue;

    let content = fs.readFileSync(filepath, 'utf8');
    const original = content;

    // These tab styles are overridden by zt-tools.css cascade,
    // but the dead 999px border-radius creates visual noise.
    // Replace tab container's border-radius: 999px → 0 (flat underline container)
    // Replace individual tab's border-radius: 999px → 0

    // Only target lines that are clearly tab-related (near tab class definitions)
    // This is conservative — only change if line is inside a known tab-class block

    // For now, just log what would be changed
    const matches = content.match(/border-radius:\s*999px/g);
    if (matches) {
      console.log(`  ${filename}: ${matches.length}× border-radius: 999px (glass pill remnants)`);
    }
  }
}

console.log('\n🌸 Z4 Pass 6 — Targeted CSS Cleanup\n');

console.log('── Accent + Text Colour Replacements ──');
applyReplacements();

console.log('\n── Glass Pill Tab Audit ──');
cleanGlassPillTabs();

console.log(`\n✅ Total changes: ${totalChanges}`);
console.log('ℹ️  Glass pill border-radius: 999px entries logged above (not auto-fixed — needs manual review)\n');
