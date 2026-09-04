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

// A real exam code is short and vendor-issued: 1Z0-1147, SPLK-5002, AIF-C01.
// 90 cert_map records instead carry the slug upper-cased as their `code`
// (ORACLE-DB-AZURE-ARCHITECT-PROFESSIONAL). For most that is harmless because
// the slug IS the code (GH-900, SNOWPRO-CORE), but where the vendor publishes
// a genuine code it is the term buyers actually search for, so it must survive.
const REAL_CODE = /\b([A-Z0-9]{2,6}-[A-Z0-9]{2,7})\b/;

function looksLikePlaceholderCode(code, slug) {
  if (!code || !slug) return false;
  return code.toUpperCase() === String(slug).toUpperCase().replace(/-/g, '-') &&
         code.length > 14;
}

/**
 * Choose the exam code to advertise.
 *
 * Prefers cert_map's `code`, but when that is merely the slug shouted back it
 * recovers the vendor's real code from the description already on the page.
 * Returns '' when no real code exists, so the caller can lead with the name.
 */
function pickExamCode(cert, fallbackCode, opts) {
  const code = String((cert && cert.code) || fallbackCode || '').trim();
  // cert_map is KEYED by slug and carries no `slug` field (verified: 0 of 289),
  // so the slug must be handed in. Same trap as `display_code`, which existed
  // on 0 records and silently rendered the slug on 136 pages.
  const slug = String((opts && opts.slug) || (cert && cert.slug) || '').trim();
  if (!looksLikePlaceholderCode(code, slug)) return code;

  const found = String((opts && opts.existingDescription) || '').match(REAL_CODE);
  if (found && found[1].toUpperCase() !== code.toUpperCase()) return found[1];
  return '';
}

// Vendor display names. cert_map stores lowercase keys, and 153 of 289 cert
// names omit the vendor entirely ("Certified Data Analyst Associate"), which
// is ambiguous in a SERP and weak for search. Used only when leading with the
// name because no real exam code exists.
const VENDOR_DISPLAY = {
  aws: 'AWS', cisco: 'Cisco', cncf: 'CNCF', comptia: 'CompTIA',
  confluent: 'Confluent', databricks: 'Databricks', eccouncil: 'EC-Council',
  fortinet: 'Fortinet', gcp: 'Google Cloud', github: 'GitHub',
  hashicorp: 'HashiCorp', isaca: 'ISACA', isc2: 'ISC2', juniper: 'Juniper',
  microsoft: 'Microsoft', mongodb: 'MongoDB', nutanix: 'Nutanix',
  nvidia: 'NVIDIA', oracle: 'Oracle', paloalto: 'Palo Alto',
  salesforce: 'Salesforce', snowflake: 'Snowflake', splunk: 'Splunk',
};

/** Prefix the vendor unless the name already names it. */
function withVendor(name, vendor) {
  const n = String(name || '').trim();
  const v = VENDOR_DISPLAY[String(vendor || '').toLowerCase()];
  if (!n || !v) return n;
  if (n.toLowerCase().startsWith(v.toLowerCase())) return n;
  if (n.toLowerCase().includes(v.toLowerCase())) return n;
  return `${v} ${n}`;
}

/**
 * Build the meta description for a cert page.
 *
 * @param {object} cert          Cert record from cert_map (needs `name`,
 *                               `code`, `price_practice`).
 * @param {string} fallbackCode  Used only when the record has no `code`.
 * @param {object} [opts]
 * @param {string} [opts.existingDescription]  Current page description, used
 *                               only to recover a real code from a placeholder.
 * @returns {string}             Description of at most MAX_DESCRIPTION chars.
 */
function buildCertDescription(cert, fallbackCode, opts) {
  const rawPrice = cert && cert.price_practice;
  const price = Number(rawPrice === undefined || rawPrice === null ? 9 : rawPrice);
  const name = String((cert && cert.name) || '').replace(/"/g, '').trim();
  // The canonical exam code lives in `code` (present on all 289 records).
  // Never fall back to the slug silently: "aws-aif-c01" would render as
  // "AWS-AIF-C01" when buyers actually search for "AIF-C01".
  const code = pickExamCode(cert, fallbackCode, opts);

  // Without a real code, lead with the certification name — never shout the
  // slug. "Free ORACLE-DB-AZURE-ARCHITECT-PROFESSIONAL study guide" reads as
  // a database error; "Free Oracle AI Database@Azure Architect Professional
  // study guide" reads as a product.
  const subject = code || withVendor(name, cert && cert.vendor);
  const head = price === 0
    ? `Free ${subject} study guide and full practice exam — no payment needed.`
    : `Free ${subject} study guide. Try ${FREE_QUESTION_LIMIT} questions free. Full practice exam access: US$${price} for 1 year.`;

  // A handful of certification names are long enough to blow the snippet
  // budget on their own. Shorten the offer clause rather than truncate the
  // name — the price must survive, since stating it is the whole point.
  const terse = price === 0
    ? `Free ${subject} study guide and full practice exam.`
    : `Free ${subject} study guide. Practice exam: US$${price} for 1 year.`;

  // The name is already the subject when there is no code — never repeat it.
  if (!code) return head.length <= MAX_DESCRIPTION ? head : terse;

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

/**
 * True if a description sells the practice exam by question count without
 * disclosing that it costs money.
 *
 * These pages never say "free", so the price-aware check above correctly lets
 * them through — but "250-question practice exam" is still an unpriced sales
 * claim, and the count is a static number that decays as banks grow. Sush:
 * "we are adding all the time so the quantity will be obsolete".
 *
 * @param {string} description
 * @param {object} [opts]
 * @param {number} [opts.pricePractice]  0 means genuinely free, so exempt.
 */
function claimsUnpricedQuantity(description, opts) {
  const desc = String(description || '');
  const price = Number((opts && opts.pricePractice) === undefined ? 9 : opts.pricePractice);
  if (price === 0) return false;
  if (!/\d{2,4}[-\s]question/i.test(desc)) return false;
  // Already priced honestly (our own wording carries "US$9").
  if (/us\$\s?\d/i.test(desc)) return false;
  return true;
}

module.exports = {
  buildCertDescription,
  claimsFreePracticeExam,
  claimsUnpricedQuantity,
  pickExamCode,
  FREE_QUESTION_LIMIT,
  MAX_DESCRIPTION,
};
