// ═══════════════════════════════════════════════════════════════════════════
// cmd · pure functions
// ═══════════════════════════════════════════════════════════════════════════
//
// Pure (no DOM, no globals) functions extracted from cmd-terminal.js so they
// can be unit-tested with mocha + run unchanged in the browser. Importable
// in Node via `import * as Pure from './cmd-pure.mjs'`.
//
// Categories:
//   1. Includes graph    — normaliseIncludes, deriveIncludedIn, treeWalk
//   2. Freshness         — classifyFreshness, daysAgo
//   3. Ordered matcher   — buildMatcherRegistry, dispatchPattern
//   4. Pipe transforms   — pipeJson, pipeCsv, pipeSort, pipeHead, pipeTail, pipeWc
//
// ═══════════════════════════════════════════════════════════════════════════

// ─── 1. Includes graph ────────────────────────────────────────────────────

/**
 * Normalise a polymorphic includes[] array (string | {slug, note}) into
 * a uniform array of {slug, note} objects. Empty/null input → [].
 *
 * Examples:
 *   ["mde", "intune"]
 *     → [{slug: "mde", note: ""}, {slug: "intune", note: ""}]
 *   [{slug: "mde", note: "Plan 2 only"}, "intune"]
 *     → [{slug: "mde", note: "Plan 2 only"}, {slug: "intune", note: ""}]
 */
export function normaliseIncludes(rawIncludes) {
  if (!Array.isArray(rawIncludes)) return [];
  return rawIncludes
    .map(item => {
      if (typeof item === 'string') {
        return { slug: item.trim(), note: '' };
      }
      if (item && typeof item === 'object' && typeof item.slug === 'string') {
        return { slug: item.slug.trim(), note: String(item.note || '') };
      }
      return null;
    })
    .filter(x => x && x.slug);
}

/**
 * Build the inverse `included_in` index from all entries' `includes` arrays.
 * Returns a map: childSlug → [{slug: parentSlug, note: parentNote}, ...].
 *
 * The note attached to each parent edge is the same note as on the parent's
 * includes edge for the child — preserves the per-edge tier/qualifier info
 * (e.g., "Plan 1 only" propagates to child's parents view).
 *
 * Cycles are NOT resolved here — the validator catches them. This function
 * trusts the input.
 */
export function deriveIncludedIn(entries) {
  const result = new Map();
  for (const entry of entries) {
    const includes = normaliseIncludes(entry.includes);
    for (const edge of includes) {
      if (!result.has(edge.slug)) result.set(edge.slug, []);
      result.get(edge.slug).push({ slug: entry.slug, note: edge.note });
    }
  }
  return result;
}

/**
 * Walk a tree starting from a root slug. Returns nodes with depth + edge
 * notes. Cycle-safe (visited set). Default maxDepth = 2 (root → children →
 * 1 nested level), per the duck's tree-depth recommendation.
 *
 * direction: "children" walks `includes`; "parents" walks `included_in`.
 *
 * Returns a flat array: [{slug, note, depth, parents: [...], cycled: bool}].
 */
export function treeWalk(rootSlug, entriesBySlug, includedInMap, opts = {}) {
  const direction = opts.direction === 'parents' ? 'parents' : 'children';
  const maxDepth = typeof opts.maxDepth === 'number' ? opts.maxDepth : 2;
  const visited = new Set();
  const result = [];

  function visit(slug, note, depth, viaPath) {
    if (depth > maxDepth) return;
    const cycled = visited.has(slug);
    if (cycled) {
      result.push({ slug, note, depth, parents: viaPath.slice(), cycled: true });
      return;
    }
    visited.add(slug);
    result.push({ slug, note, depth, parents: viaPath.slice(), cycled: false });

    const entry = entriesBySlug.get(slug);
    if (!entry) return;

    const edges =
      direction === 'children'
        ? normaliseIncludes(entry.includes)
        : (includedInMap.get(slug) || []);

    for (const edge of edges) {
      visit(edge.slug, edge.note, depth + 1, [...viaPath, slug]);
    }
  }

  visit(rootSlug, '', 0, []);
  return result;
}

// ─── 2. Freshness ─────────────────────────────────────────────────────────

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Compute days between today and a YYYY-MM-DD verified date. Negative if
 * the date is in the future. NaN if input is malformed.
 */
export function daysAgo(verifiedDate, todayIso) {
  if (!verifiedDate || typeof verifiedDate !== 'string') return NaN;
  const verified = new Date(verifiedDate + 'T00:00:00Z');
  const today = new Date((todayIso || new Date().toISOString().slice(0, 10)) + 'T00:00:00Z');
  if (isNaN(verified.getTime()) || isNaN(today.getTime())) return NaN;
  return Math.floor((today.getTime() - verified.getTime()) / MS_PER_DAY);
}

/**
 * Classify a `last_verified` date into a freshness bucket.
 * Buckets:
 *   <30d  → "fresh"   (no badge — the absence of a badge IS the signal)
 *   30-90d → "stale"  ([stale: verified Xd ago] amber)
 *   >90d  → "ancient" ([ancient: verified Xd ago] amber + ⚠️)
 *   future / NaN → "unknown"
 */
export function classifyFreshness(verifiedDate, todayIso) {
  const d = daysAgo(verifiedDate, todayIso);
  if (isNaN(d) || d < 0) return 'unknown';
  if (d < 30) return 'fresh';
  if (d <= 90) return 'stale';
  return 'ancient';
}

// ─── 3. Ordered matcher ───────────────────────────────────────────────────

/**
 * Build the ordered pattern matcher registry. Higher priority patterns run
 * first; specific patterns beat generic ones. The first match wins.
 *
 * Each rule: { id, kind, test(input) → match | null, priority (higher = first) }.
 * Caller passes a context object with `skus` map (for SKU GUID exact match).
 */
export function buildMatcherRegistry(ctx = {}) {
  const skus = ctx.skus || {};
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const RESOURCE_ID_RE = /^\/subscriptions\/[0-9a-f-]{36}\/resourceGroups\/[^\/]+\/providers\/[^\/]+\/[^\/]+\/[^\/]+/i;
  const GRAPH_URL_RE = /^https?:\/\/graph\.microsoft\.com\/(v1\.0|beta)\//i;
  const MC_RE = /^MC\d{6,}$/i;
  const AADSTS_RE = /^AADSTS\d+$/i;
  const HRESULT_RE = /^0x[0-9a-fA-F]{4,8}$/;
  const KB_RE = /^KB\d+$/i;

  return [
    {
      id: 'sku-guid',
      kind: 'sku',
      priority: 100,
      test(input) {
        const t = String(input || '').trim().toLowerCase();
        if (!UUID_RE.test(t)) return null;
        if (Object.prototype.hasOwnProperty.call(skus, t)) {
          return { kind: 'sku', input: t, slug: skus[t] };
        }
        return null;
      },
    },
    {
      id: 'resource-id',
      kind: 'resource-id',
      priority: 90,
      test(input) {
        const t = String(input || '').trim();
        if (!RESOURCE_ID_RE.test(t)) return null;
        return { kind: 'resource-id', input: t };
      },
    },
    {
      id: 'graph-url',
      kind: 'graph',
      priority: 80,
      test(input) {
        const t = String(input || '').trim();
        if (!GRAPH_URL_RE.test(t)) return null;
        return { kind: 'graph', input: t };
      },
    },
    {
      id: 'mc-id',
      kind: 'mc',
      priority: 70,
      test(input) {
        const t = String(input || '').trim();
        if (!MC_RE.test(t)) return null;
        return { kind: 'mc', input: t };
      },
    },
    {
      id: 'uuid-generic',
      kind: 'guid',
      priority: 50,
      test(input) {
        const t = String(input || '').trim();
        if (!UUID_RE.test(t)) return null;
        return { kind: 'guid', input: t };
      },
    },
    {
      id: 'aadsts',
      kind: 'aadsts',
      priority: 40,
      test(input) {
        const t = String(input || '').trim();
        if (!AADSTS_RE.test(t)) return null;
        return { kind: 'aadsts', input: t.toUpperCase() };
      },
    },
    {
      id: 'hresult',
      kind: 'hresult',
      priority: 30,
      test(input) {
        const t = String(input || '').trim();
        if (!HRESULT_RE.test(t)) return null;
        return { kind: 'hresult', input: t.toLowerCase() };
      },
    },
    {
      id: 'kb',
      kind: 'kb',
      priority: 20,
      test(input) {
        const t = String(input || '').trim();
        if (!KB_RE.test(t)) return null;
        return { kind: 'kb', input: t.toUpperCase() };
      },
    },
  ].sort((a, b) => b.priority - a.priority);
}

/**
 * Dispatch a raw input against a matcher registry. Returns the first match
 * (highest priority wins) or null.
 */
export function dispatchPattern(input, registry) {
  for (const rule of registry) {
    const match = rule.test(input);
    if (match) return match;
  }
  return null;
}

// ─── 4. Pipe transforms ───────────────────────────────────────────────────

/**
 * Block schema reference (for transform clients):
 *   { type: 'heading' | 'plain' | 'dim' | 'err' | 'man' | 'list' | 'tree' | 'compare' | 'errno' | 'dump',
 *     text?: string,    // plain text content (always escaped before render)
 *     html?: string,    // pre-escaped HTML content (render via innerHTML — sanitiser pre-applied)
 *     entry?: object,   // structured entry data when available (used by | json / | csv)
 *     slug?: string,
 *     rows?: array,     // for compare/list blocks
 *     code?: string,    // for errno blocks
 *   }
 *
 * Chrome blocks: heading, dim. Data blocks: man, list, tree, compare, errno,
 * plain, err, dump.
 */

const CHROME_TYPES = new Set(['heading', 'dim']);

/**
 * | json — serialise blocks to a single dump block containing pretty-printed
 * JSON. Strips `html` field (render-only). Preserves entry / slug / rows / etc.
 */
export function pipeJson(blocks) {
  const cleaned = (blocks || []).map(b => {
    const copy = { ...b };
    delete copy.html;
    return copy;
  });
  return [
    {
      type: 'dump',
      text: JSON.stringify(cleaned, null, 2),
      ariaAnnounce: false,
    },
  ];
}

const FORMULA_PREFIX_RE = /^[=+\-@\t\r]/;

/**
 * Escape a CSV cell value. Quotes are doubled per RFC 4180. Cells beginning
 * with formula prefixes (= + - @) get a single-quote prefix to neutralise
 * Excel/Sheets formula injection.
 */
export function csvEscape(value) {
  if (value === undefined || value === null) return '';
  let s = Array.isArray(value) ? value.join(';') : String(value);
  if (FORMULA_PREFIX_RE.test(s)) s = "'" + s;
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    s = '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

/**
 * | csv — serialise blocks to a single dump block with explicit per-block
 * type schemas. See plan.md for column locks.
 */
export function pipeCsv(blocks) {
  const lines = [];
  let header = null;

  function setHeader(h) {
    if (!header) {
      header = h;
      lines.push(h.map(csvEscape).join(','));
    }
  }

  for (const block of blocks || []) {
    if (CHROME_TYPES.has(block.type)) continue;
    if (block.type === 'man' || block.type === 'list' || block.type === 'tree') {
      setHeader(['type', 'slug', 'name', 'kind', 'domain', 'status', 'last_verified', 'url', 'plain_english']);
      const e = block.entry || {};
      lines.push([
        block.type,
        e.slug || block.slug || '',
        e.name || '',
        e.kind || '',
        e.domain || '',
        e.status || '',
        e.last_verified || '',
        e.url || '',
        e.plain_english || '',
      ].map(csvEscape).join(','));
    } else if (block.type === 'compare' && Array.isArray(block.rows)) {
      const left = block.left_slug || 'left';
      const right = block.right_slug || 'right';
      setHeader(['row_label', left, right]);
      for (const row of block.rows) {
        lines.push([row.label || '', row.left || '', row.right || ''].map(csvEscape).join(','));
      }
    } else if (block.type === 'errno') {
      setHeader(['type', 'code', 'namespace', 'one_liner', 'suggested_action']);
      lines.push([
        'errno',
        block.code || '',
        block.namespace || '',
        block.one_liner || block.text || '',
        block.suggested_action || '',
      ].map(csvEscape).join(','));
    } else {
      setHeader(['type', 'text']);
      lines.push([block.type || '', block.text || ''].map(csvEscape).join(','));
    }
  }

  return [{ type: 'dump', text: lines.join('\n'), ariaAnnounce: false }];
}

/**
 * | sort [field] — sort blocks by entry.<field> if entry present (default
 * 'slug'), else alphabetical by text. Chrome blocks preserved at top.
 */
export function pipeSort(blocks, field) {
  const key = field || 'slug';
  const chrome = [];
  const data = [];
  for (const b of blocks || []) {
    if (CHROME_TYPES.has(b.type)) chrome.push(b);
    else data.push(b);
  }
  data.sort((a, b) => {
    const av = (a.entry && a.entry[key]) || a[key] || a.text || '';
    const bv = (b.entry && b.entry[key]) || b[key] || b.text || '';
    return String(av).localeCompare(String(bv));
  });
  return [...chrome, ...data];
}

/**
 * | head N — first N data blocks (chrome preserved at top by default).
 * If opts.includeChrome is true, the count includes chrome blocks.
 */
export function pipeHead(blocks, n, opts = {}) {
  const limit = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 10;
  if (opts.includeChrome) return (blocks || []).slice(0, limit);
  const out = [];
  let dataCount = 0;
  for (const b of blocks || []) {
    if (CHROME_TYPES.has(b.type)) {
      out.push(b);
      continue;
    }
    if (dataCount >= limit) break;
    out.push(b);
    dataCount++;
  }
  return out;
}

/**
 * | tail N — last N data blocks. Chrome blocks NOT preserved (the chrome
 * is conceptually attached to the head of the original output).
 */
export function pipeTail(blocks, n) {
  const limit = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 10;
  const data = (blocks || []).filter(b => !CHROME_TYPES.has(b.type));
  return data.slice(-limit);
}

/**
 * | wc — count blocks broken down by type. Returns a single dim block
 * with the breakdown.
 */
export function pipeWc(blocks) {
  const total = (blocks || []).length;
  const byType = {};
  for (const b of blocks || []) {
    byType[b.type || 'unknown'] = (byType[b.type || 'unknown'] || 0) + 1;
  }
  const breakdown = Object.entries(byType)
    .sort(([, a], [, b]) => b - a)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');
  return [
    { type: 'dim', text: `// total: ${total} (${breakdown})` },
  ];
}
