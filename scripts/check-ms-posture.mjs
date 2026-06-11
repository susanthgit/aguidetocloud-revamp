#!/usr/bin/env node
/**
 * Microsoft posture guardrail
 * Scans content/ for phrasings that demean / criticise / take a snarky
 * tone about Microsoft. Sush works at Microsoft NZ; everything under
 * aguidetocloud.com reads as coming from a Microsoft employee.
 *
 * Rule source: learning-docs/docs/reference/voice-and-tone.md
 *              § Microsoft posture (MANDATORY — set 11 Jun 2026)
 *
 * Born 11 Jun 2026 from the Work IQ Day-1 GA blog cleanup — 9 anti-MS
 * phrasings had to be scrubbed before publish. User asked to make this
 * a permanent guardrail so it never happens again.
 *
 * Severities:
 *   ERROR — exact phrasing patterns that have been flagged in real
 *           edits; high confidence the writer means to be critical
 *           (blocks the push)
 *   WARN  — patterns that COULD be neutral in context but are common
 *           smell signals; surface, don't block (writer to confirm)
 *
 * Escape hatch:
 *   Add `<!-- ms-posture-allow -->` on the line directly above the
 *   match if the phrasing is legitimately neutral in context.
 *
 * Growing guardrail:
 *   Every new violation found in production MUST be added as a new
 *   pattern before the fix is deployed. The pattern set only grows.
 *
 * Run modes:
 *   node scripts/check-ms-posture.mjs          # scan all content/
 *   node scripts/check-ms-posture.mjs --quiet  # only print summary
 *
 * Exit codes:
 *   0  — no errors (warnings may still appear)
 *   1  — at least one ERROR-severity match found
 *   2  — script error (e.g. content/ not found)
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const contentDir = join(repoRoot, 'content')
const quiet = process.argv.includes('--quiet')

let contentExists = true
try {
  statSync(contentDir)
} catch {
  contentExists = false
}
if (!contentExists) {
  console.error(`Content directory not found: ${contentDir}`)
  process.exit(2)
}

/**
 * Pattern shape:
 *   { id, severity, regex, fix, since }
 *
 * id        — short stable identifier (used if Sush wants to add an
 *             allowlist marker someday — `<!-- ms-posture-allow: id -->`)
 * severity  — 'error' or 'warn'
 * regex     — case-insensitive; should NOT span newlines unless explicit
 * fix       — short suggested replacement framing for the violation
 * since     — YYYY-MM-DD provenance when pattern was added
 */
const PATTERNS = [
  // ============ ERROR — high-confidence anti-MS phrasings ============
  {
    id: 'doesnt-lead-with',
    severity: 'error',
    regex: /microsoft\b[^.\n]{0,40}doesn[\u2019']?t\s+(?:always\s+)?(?:lead|mention|admit|tell|share)\b/i,
    fix: 'Describe the topic directly without implying Microsoft is hiding it. E.g. "What comes after the headlines is..."',
    since: '2026-06-11',
  },
  {
    id: 'trust-then-verify',
    severity: 'error',
    regex: /trust[\s\-]{1,6}then[\s\-]{1,6}verify/i,
    fix: 'Drop the trust-then-verify framing — implies Microsoft\'s numbers shouldn\'t be trusted. Instead: "Microsoft\'s published numbers — I\'m planning to measure directionally on my own tenant"',
    since: '2026-06-11',
  },
  {
    id: 'docs-understate',
    severity: 'error',
    regex: /microsoft\b[^.\n]{0,40}(?:docs?|documentation)[^.\n]{0,30}under[\s\-]?states?/i,
    fix: 'Don\'t call MS docs incomplete. Use: "the live prompt itself is the source of truth"',
    since: '2026-06-11',
  },
  {
    id: 'documentation-bug',
    severity: 'error',
    regex: /\b(?:documentation\s+bug|doc\s+bug)\b/i,
    fix: 'Describe the discrepancy neutrally: "the table directly below shows X — X is the count to use in your design notes"',
    since: '2026-06-11',
  },
  {
    id: 'whats-the-catch',
    severity: 'error',
    regex: /what[\u2019']?s\s+the\s+catch[?]/i,
    fix: 'Use neutral framing: "What should I watch out for?" or "What should I plan around?"',
    since: '2026-06-11',
  },
  {
    id: 'catches-by-surprise',
    severity: 'error',
    regex: /catch(?:es)?\b[^.\n]{1,30}by\s+surprise/i,
    fix: 'Don\'t frame the product as surprising people. Use: "the constraint to plan around when migrating"',
    since: '2026-06-11',
  },
  {
    id: 'pricing-transparency-not-fully',
    severity: 'error',
    regex: /pricing\s+transparency\b[^.\n]{0,40}(?:isn[\u2019']?t|is\s+not)[^.\n]{0,15}(?:fully|completely|there\s+yet|all\s+the\s+way)/i,
    fix: 'Use neutral framing: "Pricing details are still rolling out" or "Pricing details are still being finalised pre-GA"',
    since: '2026-06-11',
  },
  {
    id: 'microsoft-will-probably-fix',
    severity: 'error',
    regex: /microsoft\s+(?:will|should|may)\s+(?:probably|likely|eventually)\s+(?:fix|patch|sort|address|sort\s+out)/i,
    fix: 'Use neutral framing: "Keep an eye on the GitHub repo — this kind of thing usually gets patched quickly"',
    since: '2026-06-11',
  },
  {
    id: 'could-plausibly-be-true',
    severity: 'error',
    regex: /(?:could|may)\s+plausibly\s+be\s+true/i,
    fix: 'State the architectural reason positively: "the architectural reason they\'re plausible is solid: [substantive explanation]"',
    since: '2026-06-11',
  },
  {
    id: 'silently-ignored-microsoft',
    severity: 'error',
    regex: /microsoft\b[^.\n]{0,30}silently\s+(?:ignor|defaul|drop|swallow|fail)/i,
    fix: 'Don\'t frame MS behavior as sneaky. Be specific: "in the version we tested, the X didn\'t pick up Y — it defaulted to Z"',
    since: '2026-06-11',
  },
  {
    id: 'tone-prefix-microsoft',
    severity: 'error',
    regex: /\b(?:annoyingly|frustratingly|sadly|unfortunately|disappointingly),?\s+microsoft\b/i,
    fix: 'Drop the emotional prefix. State the technical reality without editorialising.',
    since: '2026-06-11',
  },
  {
    id: 'microsoft-still-hasnt',
    severity: 'error',
    regex: /microsoft\s+(?:still\s+)?hasn[\u2019']?t\s+(?:shipped|delivered|fixed|sorted)/i,
    fix: 'State the current capability gap factually: "X is not yet generally available; check Microsoft Learn for the GA date"',
    since: '2026-06-11',
  },
  {
    id: 'vendor-first-party-benchmark',
    severity: 'error',
    regex: /vendor[\u2019']?s?\s+(?:own\s+|first[\s\-]?party\s+)?benchmarks?/i,
    fix: 'Don\'t frame MS as just-another-vendor with self-serving numbers. Use: "Microsoft\'s published numbers — the architectural reason they\'re plausible is solid"',
    since: '2026-06-11',
  },
  {
    id: 'microsoft-owes',
    severity: 'error',
    regex: /microsoft\b[^.\n]{0,30}(?:\bowes\b|should\s+have\s+(?:fixed|shipped|admitted)|ought\s+to\s+(?:fix|ship|admit))/i,
    fix: 'Avoid blame framing. Describe the user-facing reality and what to do about it.',
    since: '2026-06-11',
  },

  // ============ WARN — context-dependent smells ============
  {
    id: 'microsoft-real-risk',
    severity: 'warn',
    regex: /microsoft\b[^.\n]{0,40}\breal\s+risk\b/i,
    fix: 'Reads as alarmist when MS is the actor. Soften to "worth knowing if..." unless the risk is genuinely critical.',
    since: '2026-06-11',
  },
  {
    id: 'microsoft-deserves',
    severity: 'warn',
    regex: /microsoft[\u2019']?s?\s+(?:own\s+)?(?:pricing|docs?|page|guide)[^.\n]{0,30}deserves?\s+to\s+be/i,
    fix: 'Implies the doc/pricing should be better than it is. State the recommendation neutrally.',
    since: '2026-06-11',
  },
  {
    id: 'microsoft-marketing',
    severity: 'warn',
    regex: /microsoft\b[^.\n]{0,30}(?:marketing\s+speak|launch\s+marketing|press\s+release)/i,
    fix: 'Don\'t contrast "marketing" with the truth. Describe what the doc actually says without the editorial.',
    since: '2026-06-11',
  },
]

// Inline-skip helpers: skip code fences ``` ... ``` and HTML comments
function buildSkipMask(text) {
  // mask[i] = true means "skip this character"
  const mask = new Uint8Array(text.length)
  // Fenced code blocks
  const fenceRe = /```[\s\S]*?```/g
  let m
  while ((m = fenceRe.exec(text)) !== null) {
    for (let i = m.index; i < m.index + m[0].length; i++) mask[i] = 1
  }
  // HTML comments
  const commentRe = /<!--[\s\S]*?-->/g
  while ((m = commentRe.exec(text)) !== null) {
    for (let i = m.index; i < m.index + m[0].length; i++) mask[i] = 1
  }
  // Inline code spans `...`
  const inlineRe = /`[^`\n]+`/g
  while ((m = inlineRe.exec(text)) !== null) {
    for (let i = m.index; i < m.index + m[0].length; i++) mask[i] = 1
  }
  return mask
}

function isMasked(mask, start, length) {
  // Treat the match as masked if its midpoint is masked (cheap heuristic)
  const mid = start + Math.floor(length / 2)
  return mask[mid] === 1
}

function hasAllowMarker(text, matchIndex) {
  // Look up to two lines above the match for <!-- ms-posture-allow -->
  // (with or without an `id:` suffix). Cheap textual scan.
  const before = text.slice(0, matchIndex)
  const lastTwoLines = before.split('\n').slice(-3, -1).join('\n')
  return /<!--\s*ms-posture-allow\b[^>]*-->/i.test(lastTwoLines)
}

function getLineNumber(text, index) {
  let n = 1
  for (let i = 0; i < index; i++) if (text.charCodeAt(i) === 10) n++
  return n
}

function previewAround(text, matchStart, matchLen) {
  const lineStart = text.lastIndexOf('\n', matchStart) + 1
  const lineEnd = text.indexOf('\n', matchStart + matchLen)
  const line = text.slice(lineStart, lineEnd === -1 ? text.length : lineEnd)
  if (line.length <= 110) return line.trim()
  // Truncate around the match with ellipses
  const matchOffsetInLine = matchStart - lineStart
  const halfWindow = 50
  const start = Math.max(0, matchOffsetInLine - halfWindow)
  const end = Math.min(line.length, matchOffsetInLine + matchLen + halfWindow)
  const prefix = start > 0 ? '…' : ''
  const suffix = end < line.length ? '…' : ''
  return (prefix + line.slice(start, end).trim() + suffix).trim()
}

function walkMarkdown(dir, out) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    let s
    try { s = statSync(full) } catch { continue }
    if (s.isDirectory()) {
      walkMarkdown(full, out)
    } else if (name.endsWith('.md')) {
      out.push(full)
    }
  }
}

const files = []
walkMarkdown(contentDir, files)

const errors = []
const warns = []
let filesScanned = 0
let totalChars = 0

for (const file of files) {
  let text
  try {
    text = readFileSync(file, 'utf-8')
  } catch {
    continue
  }
  filesScanned++
  totalChars += text.length
  const mask = buildSkipMask(text)
  const relPath = relative(repoRoot, file).replace(/\\/g, '/')

  for (const p of PATTERNS) {
    // Use a fresh regex with `g` flag to find all matches in this file
    const flags = p.regex.flags.includes('g') ? p.regex.flags : p.regex.flags + 'g'
    const gr = new RegExp(p.regex.source, flags)
    let m
    while ((m = gr.exec(text)) !== null) {
      if (isMasked(mask, m.index, m[0].length)) continue
      if (hasAllowMarker(text, m.index)) continue
      const line = getLineNumber(text, m.index)
      const preview = previewAround(text, m.index, m[0].length)
      const finding = {
        file: relPath,
        line,
        id: p.id,
        severity: p.severity,
        match: m[0],
        preview,
        fix: p.fix,
      }
      if (p.severity === 'error') errors.push(finding)
      else warns.push(finding)
    }
  }
}

// ============ output ============
console.log('')
console.log('=== Microsoft posture guardrail ===')
console.log(`Scope: content/ (${filesScanned} markdown files, ${(totalChars / 1024).toFixed(0)} KB)`)
console.log(`Patterns: ${PATTERNS.length} (${PATTERNS.filter(p => p.severity === 'error').length} error, ${PATTERNS.filter(p => p.severity === 'warn').length} warn)`)
console.log(`Errors: ${errors.length} · Warnings: ${warns.length}`)

function printFinding(f) {
  console.log(`  ${f.severity === 'error' ? '🔴' : '🟡'} ${f.file}:${f.line}  [${f.id}]`)
  console.log(`     match:  ${JSON.stringify(f.match)}`)
  if (!quiet) {
    console.log(`     preview: ${f.preview}`)
    console.log(`     fix:    ${f.fix}`)
  }
}

if (errors.length > 0) {
  console.log('')
  console.log('🔴 Errors (block push):')
  for (const f of errors) printFinding(f)
}
if (warns.length > 0) {
  console.log('')
  console.log('🟡 Warnings (review, do not block):')
  for (const f of warns) printFinding(f)
}

console.log('')
if (errors.length > 0) {
  console.log('🔴 BLOCKED — fix Microsoft-posture errors before pushing.')
  console.log('   Escape hatch: add <!-- ms-posture-allow --> on the line above the match')
  console.log('   if the phrasing is legitimately neutral in this context.')
  console.log('')
  process.exit(1)
}
console.log('🟢 No Microsoft-posture violations found.')
console.log('')
process.exit(0)
