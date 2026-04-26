/**
 * Z4 Pass 7 — Eliminate ALL :root alias variables (Trap 3 fix)
 * 
 * CSS custom properties defined at :root that alias Zen tokens
 * resolve against the LEGACY :root --text-primary: #e0e0f0,
 * not the body.zen-migrated override. This causes invisible text.
 *
 * Fix: Replace var(--alias) → var(--zen-token) everywhere,
 * then delete the :root alias declarations.
 */

const fs = require('fs');
const path = require('path');

const CSS_DIR = path.join(__dirname, 'static', 'css');

// Map of file → aliases to eliminate
// Format: { aliasVar: zenToken }
const FILE_ALIASES = {
  'ai-mapper.css': {
    '--aimap-card-bg': '--bg-surface',
    '--aimap-text': '--text-primary',
    '--aimap-border': '--border',
  },
  'ca-builder.css': {
    '--cab-card-bg': '--bg-surface',
    '--cab-border': '--border',
    '--cab-text': '--text-primary',
    '--cab-text-dim': '--text-secondary',
  },
  'cert-tracker.css': {
    '--cert-card': '--bg-surface',
    '--cert-card-hover': '--bg-elevated',
    '--cert-border': '--border',
    '--cert-text': '--text-primary',
    '--cert-text-dim': '--text-secondary',
  },
  'color-palette.css': {
    '--palette-glass': '--bg-elevated',
    '--palette-glass-border': '--border',
    '--palette-text': '--text-primary',
    '--palette-text-dim': '--text-secondary',
  },
  'countdown.css': {
    '--cdown-card': '--bg-surface',
    '--cdown-card-hover': '--bg-elevated',
    '--cdown-border': '--border',
    '--cdown-text': '--text-primary',
    '--cdown-text-dim': '--text-secondary',
  },
  'deptime.css': {
    '--dt-card': '--bg-surface',
    '--dt-text': '--text-primary',
    '--dt-text-dim': '--text-secondary',
  },
  'feedback.css': {
    '--fb-card': '--bg-surface',
    '--fb-card-hover': '--bg-elevated',
    '--fb-border': '--border',
    '--fb-text': '--text-primary',
    '--fb-text-dim': '--text-secondary',
  },
  'licence-picker.css': {
    '--lp-glass': '--bg-elevated',
    '--lp-glass-border': '--border',
    '--lp-glass-hover': '--border',
    '--lp-text': '--text-primary',
    '--lp-text-dim': '--text-secondary',
    '--lp-surface': '--bg-surface',
    '--lp-card': '--bg-surface',
  },
  'pomodoro.css': {
    '--pomo-card': '--bg-surface',
    '--pomo-card-hover': '--bg-elevated',
    '--pomo-border': '--border',
    '--pomo-text': '--text-primary',
    '--pomo-text-dim': '--text-secondary',
  },
  'prompt-guide.css': {
    '--bg-card': '--bg-elevated',
    '--bg-card-hover': '--border',
    '--border-subtle': '--border',
  },
  'service-health.css': {
    '--sh-card': '--bg-surface',
    '--sh-card-hover': '--bg-elevated',
    '--sh-border': '--border',
    '--sh-text': '--text-primary',
    '--sh-text-dim': '--text-secondary',
  },
  'showdown.css': {
    '--showdown-card-bg': '--bg-surface',
    '--showdown-card-border': '--border',
    '--showdown-text': '--text-primary',
    '--showdown-text-dim': '--text-secondary',
  },
  'world-clock.css': {
    '--wclk-card': '--bg-surface',
    '--wclk-card-hover': '--bg-elevated',
    '--wclk-border': '--border',
    '--wclk-text': '--text-primary',
    '--wclk-text-dim': '--text-secondary',
  },
};

let totalReplacements = 0;
let totalDeclarations = 0;

for (const [filename, aliases] of Object.entries(FILE_ALIASES)) {
  const filepath = path.join(CSS_DIR, filename);
  if (!fs.existsSync(filepath)) {
    console.log(`  ⚠ ${filename} not found, skipping`);
    continue;
  }

  let content = fs.readFileSync(filepath, 'utf8');
  let fileReplacements = 0;
  let fileDeclarations = 0;

  // Sort aliases by length (longest first) to avoid partial matches
  // e.g., --psb-text-dim before --psb-text
  const sortedAliases = Object.entries(aliases).sort((a, b) => b[0].length - a[0].length);

  for (const [aliasVar, zenToken] of sortedAliases) {
    // Replace all var(--alias) → var(--zen-token)
    const varPattern = new RegExp(`var\\(${aliasVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g');
    const matches = content.match(varPattern);
    if (matches) {
      content = content.replace(varPattern, `var(${zenToken})`);
      fileReplacements += matches.length;
    }

    // Remove the :root declaration line
    // Match: --alias-var: var(--zen-token); or --alias-var: var(--zen-token, fallback);
    const declPattern = new RegExp(`\\s*${aliasVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:\\s*var\\([^)]+\\);?`, 'g');
    const declMatches = content.match(declPattern);
    if (declMatches) {
      content = content.replace(declPattern, '');
      fileDeclarations += declMatches.length;
    }
  }

  // Clean up empty :root blocks that might remain
  content = content.replace(/:root\s*\{\s*\}/g, '');
  // Clean up :root blocks with only whitespace/newlines
  content = content.replace(/:root\s*\{\s*\n\s*\}/g, '');

  if (fileReplacements > 0 || fileDeclarations > 0) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`  ${filename}: ${fileReplacements} var() replacements, ${fileDeclarations} declarations removed`);
    totalReplacements += fileReplacements;
    totalDeclarations += fileDeclarations;
  } else {
    console.log(`  ${filename}: no changes needed`);
  }
}

console.log(`\n✅ Total: ${totalReplacements} var() replacements, ${totalDeclarations} declarations removed`);
