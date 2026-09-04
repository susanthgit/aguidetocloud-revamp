'use strict';

/**
 * Single source of truth for cert-tracker meta descriptions.
 *
 * Ground truth (verified against guided/src/lib/access.ts):
 *   - Study guides are free forever.
 *   - Practice exams give FREE_QUESTION_LIMIT questions free, then cost
 *     `price_practice` for a one-year licence.
 *   - Certs with price_practice = 0 (e.g. az-900) are free outright and must
 *     never be described with a price.
 *
 * Why this file exists: three separate writers used to compose this sentence
 * independently (sync-cert-data.js, rewrite-cert-metas.ps1 and the weekly
 * cert-tracker bot), and they drifted into claiming a paid practice exam was
 * "Free". Anything that writes a cert description must import this.
 */

// Mirrors FREE_QUESTION_LIMIT in C:\ssClawy\guided\src\lib\access.ts.
const FREE_QUESTION_LIMIT = 20;

// Google truncates by pixel width, but the repo's SEO checks score >155 as 0.
const MAX_DESCRIPTION = 155;

/**
 * Build the meta description for a cert page.
 *
 * @param {object} cert          Cert record from cert_map (needs `name`,
 *                               `code`, `price_practice`).
 * @param {string} fallbackCode  Used only when the record has no `code`.
 * @returns {string}             Description of at most MAX_DESCRIPTION chars.
 */
function buildCertDescription(cert, fallbackCode) {
  const rawPrice = cert && cert.price_practice;
  const price = Number(rawPrice === undefined || rawPrice === null ? 9 : rawPrice);
  const name = String((cert && cert.name) || '').replace(/"/g, '').trim();
  // The canonical exam code lives in `code` (present on all 289 records).
  // Never fall back to the slug silently: "aws-aif-c01" would render as
  // "AWS-AIF-C01" when buyers actually search for "AIF-C01".
  const code = String((cert && cert.code) || fallbackCode || '').trim();

  const head = price === 0
    ? `Free ${code} study guide and full practice exam — no payment needed.`
    : `Free ${code} study guide. Try ${FREE_QUESTION_LIMIT} questions free. Full practice exam access: US$${price} for 1 year.`;

  // Append the certification name only while it still fits the snippet budget;
  // the page title already carries it, so dropping it loses nothing material.
  const withName = name ? `${head} ${name}.` : head;
  return withName.length <= MAX_DESCRIPTION ? withName : head;
}

/**
 * True if a description advertises a practice exam as free when it is not.
 *
 * Deliberately NOT proximity-based. An earlier version required "free" and
 * "practice exam" to sit within 40 characters of each other, which silently
 * passed 15 pages whose certification names are long enough to push the two
 * apart — e.g. "Free Databricks Certified Data Engineer Associate study guide
 * and 250-question practice exam". Detection is now price-aware instead.
 *
 * @param {string} description
 * @param {object} [opts]
 * @param {number} [opts.pricePractice] Price of the bank. 0 means genuinely
 *        free, so no claim about it can be false. Omit only when unknown, in
 *        which case the check is conservative and assumes the bank is paid.
 */
function claimsFreePracticeExam(description, opts) {
  const d = String(description || '').toLowerCase();
  const raw = opts && opts.pricePractice;
  const price = raw === undefined || raw === null ? null : Number(raw);

  // A bank that really is free cannot be falsely advertised as free.
  if (price === 0) return false;

  // Is the practice exam / question bank mentioned at all?
  if (!/practice (exam|test)|\d+\s*-?\s*question/.test(d)) return false;

  // Our own truthful wording always states the price or names the free tier.
  // These are controlled phrases emitted by buildCertDescription above.
  if (/us\$\s*\d/.test(d)) return false;
  if (/no payment needed/.test(d)) return false;

  // Strip truthful free-preview phrasing before looking for a "free" claim.
  const stripped = d
    .replace(/try \d+ questions free/g, '')
    .replace(/\d+ free questions/g, '')
    .replace(/\d+ questions free/g, '');

  return /\bfree\b/.test(stripped);
}

module.exports = {
  buildCertDescription,
  claimsFreePracticeExam,
  FREE_QUESTION_LIMIT,
  MAX_DESCRIPTION,
};
