#!/usr/bin/env node
/**
 * Blog HTML hygiene + content guardrail
 * Run as part of pre-push-check.ps1 when content/blog/ changes detected.
 *
 * Catches (per the 2026-05-29 post-mortem):
 *   1. <img> alt attributes with unescaped inner quotes (broken HTML; screen reader regression)
 *   2. <img src=> pointing to a non-existent local file
 *   3. <img> with missing or empty alt attribute (accessibility fail)
 *   4. Monthly recap blogs with hardcoded feature counts in og_headline (decay bug)
 *   5. Monthly recap Quick Jump links referencing non-existent section numbers
 *
 * Exit 0 = clean. Exit 1 = blocking errors found.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const blogDir = join(repoRoot, 'content', 'blog')
const staticDir = join(repoRoot, 'static')

const errors = []
const warnings = []

const blogFiles = readdirSync(blogDir).filter(f => f.endsWith('.md'))

// Hardcoded-count patterns that have bitten us before (May OG: "40 updates" while body had 53)
const HARDCODED_COUNT_PATTERNS = [
  /\b\d+\s+(M365|Microsoft 365|Copilot)\s+(updates|features|new)\b/i,
  /—\s+\d+\s+M365/,
  /\b\d+\s+updates\b/i,
  /^\d+\s+M365/i,
]

// Attribute names that legitimately follow an `alt=`
const NEXT_ATTRS = ['loading', 'src', 'class', 'style', 'width', 'height', 'title', 'id', 'srcset', 'sizes', 'decoding', 'fetchpriority']

function isMonthlyRecap(fname) {
  return /microsoft-365-copilot-(january|february|march|april|may|june|july|august|september|october|november|december)-\d{4}-updates\.md/i.test(fname)
}

for (const fname of blogFiles) {
  const relPath = `content/blog/${fname}`
  const text = readFileSync(join(blogDir, fname), 'utf-8')

  // --- 1/2/3: <img> tag checks ---
  const imgTagRe = /<img\b[^>]*?\/?>/gi
  let imgMatch
  while ((imgMatch = imgTagRe.exec(text)) !== null) {
    const tag = imgMatch[0]
    const tagLineNo = text.substring(0, imgMatch.index).split('\n').length

    // src reachability (local files only)
    const srcMatch = tag.match(/\bsrc=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i)
    if (srcMatch) {
      const src = srcMatch[1] ?? srcMatch[2] ?? srcMatch[3] ?? ''
      if (src.startsWith('/') && !src.startsWith('//')) {
        const localPath = join(staticDir, src.slice(1))
        if (!existsSync(localPath)) {
          errors.push(`${relPath}:${tagLineNo} <img src="${src}"> → file not found at static${src}`)
        }
      }
    } else {
      errors.push(`${relPath}:${tagLineNo} <img> missing src attribute`)
    }

    // alt attribute well-formedness
    // Match the alt= and capture content lazily
    const altRe = /\balt=(?:"([^"]*?)"|'([^']*?)'|([^\s>]+))/i
    const altMatch = tag.match(altRe)
    if (!altMatch) {
      errors.push(`${relPath}:${tagLineNo} <img> missing alt attribute`)
      continue
    }
    const altContent = altMatch[1] ?? altMatch[2] ?? altMatch[3] ?? ''
    if (!altContent.trim()) {
      errors.push(`${relPath}:${tagLineNo} <img> has empty alt attribute`)
      continue
    }

    // Check for broken alt — unescaped inner quote.
    // If alt was double-quoted in source: alt="A "thing" desc"
    // The lazy regex captures `A ` and then what comes after isn't a valid next-attribute or tag-close.
    if (altMatch[1] !== undefined) {
      const altEnd = tag.indexOf(altMatch[0]) + altMatch[0].length
      const afterAlt = tag.substring(altEnd)
      const nextAttrRe = new RegExp(`^\\s+(${NEXT_ATTRS.join('|')})\\s*=`, 'i')
      const tagCloseRe = /^\s*\/?>/
      if (!nextAttrRe.test(afterAlt) && !tagCloseRe.test(afterAlt)) {
        errors.push(`${relPath}:${tagLineNo} <img> has UNESCAPED inner quote in alt — content silently truncates for screen readers. Fix: replace " with &quot; inside the alt value.`)
        errors.push(`  truncated alt: "${altContent.substring(0, 60)}..."`)
        errors.push(`  remainder leaking: "${afterAlt.substring(0, 60)}..."`)
      }
    }

    // Soft warn for very short alt (likely placeholder)
    if (altContent.trim().length < 30 && altMatch[1] !== undefined) {
      // re-check that this isn't a victim of the broken-quote issue we already caught
      const altEnd = tag.indexOf(altMatch[0]) + altMatch[0].length
      const afterAlt = tag.substring(altEnd)
      const nextAttrRe = new RegExp(`^\\s+(${NEXT_ATTRS.join('|')})\\s*=`, 'i')
      if (nextAttrRe.test(afterAlt) || /^\s*\/?>/.test(afterAlt)) {
        warnings.push(`${relPath}:${tagLineNo} <img> alt text <30 chars: "${altContent}"`)
      }
    }
  }

  // --- 4: monthly-recap-specific checks ---
  if (isMonthlyRecap(fname)) {
    const ogMatch = text.match(/^og_headline:\s*["']?(.+?)["']?\s*$/m)
    if (ogMatch) {
      const headline = ogMatch[1].replace(/^["']|["']$/g, '')
      for (const pat of HARDCODED_COUNT_PATTERNS) {
        if (pat.test(headline)) {
          errors.push(`${relPath} og_headline contains a hardcoded count that will decay: "${headline}" — counts grow as Microsoft adds Roadmap entries through the month. Use evergreen text like "What's New in Copilot — {Month} {Year}".`)
          break
        }
      }
    }

    // --- 5: Quick Jump anchor → section number presence ---
    // Extract numbered anchor targets from markdown like (#7-loop-notebooks-...)
    const anchorRefs = [...text.matchAll(/\(#(\d+)[a-z0-9-]*\)/gi)].map(m => parseInt(m[1], 10))
    const uniqueAnchorNums = new Set(anchorRefs)

    // Extract present section numbers from ## N. Heading
    const headingNums = new Set()
    for (const m of text.matchAll(/^##\s+(\d+)\.\s/gm)) {
      headingNums.add(parseInt(m[1], 10))
    }
    // Also gather connectors-table numbers (## New Copilot Connectors table)
    for (const m of text.matchAll(/^\|\s*(\d+)\s*\|/gm)) {
      headingNums.add(parseInt(m[1], 10))
    }

    const missing = [...uniqueAnchorNums].filter(n => !headingNums.has(n))
    if (missing.length > 0) {
      errors.push(`${relPath} Quick Jump anchors reference non-existent section numbers: ${missing.join(', ')}`)
    }
  }
}

console.log(`\n=== Blog HTML hygiene check ===`)
console.log(`Scope: content/blog/ (${blogFiles.length} files)`)
console.log(`Errors: ${errors.length} · Warnings: ${warnings.length}`)

if (errors.length) {
  console.log('\n❌ ERRORS (blocking):')
  for (const e of errors) console.log(`  - ${e}`)
}
if (warnings.length) {
  console.log('\n⚠️  WARNINGS (advisory):')
  for (const w of warnings) console.log(`  - ${w}`)
}

if (errors.length) {
  console.log('\n🔴 BLOCKED — fix errors before pushing.\n')
  process.exit(1)
}
console.log('\n🟢 All blog HTML hygiene checks passed.\n')
process.exit(0)
