/**
 * ════════════════════════════════════════════════════════════════════════════
 * 🔍 Brain Bar — POST /api/log-miss
 * ────────────────────────────────────────────────────────────────────────────
 * Privacy-safe aggregate of missed terms (searches that returned no results).
 *
 * Privacy model:
 *   · No IP stored. No User-Agent stored. No session ID stored.
 *   · Only the term + the day (YYYY-MM-DD UTC) is recorded.
 *   · Schema (composite primary key on term + day) means a single user
 *     spamming the same term in one day adds to one row, not many.
 *   · Client-side de-dupes per session via sessionStorage (see cmd.js) so
 *     hitting Backspace + retyping doesn't multiply the count.
 *
 * Validation:
 *   · Term length 1..50 chars, [a-z0-9-]+ only (slug-shaped — same shape
 *     wildcard subdomains accept).
 *   · Origin must be cmd.aguidetocloud.com or *.cmd.aguidetocloud.com (or
 *     local dev). Prevents cross-origin misuse from third-party sites.
 *   · Term must NOT already exist in cmd-index — a "miss" by definition.
 *
 * Graceful fallback:
 *   · If the D1 binding (env.MISSES) isn't present (local dev / staging),
 *     the function logs to console and returns 204 — no error.
 *   · This means deploys without D1 still work; the analytics simply pause.
 *
 * Required setup (Sush, when ready to enable):
 *   wrangler d1 create brainbar-misses
 *   wrangler d1 execute brainbar-misses --command \\
 *     "CREATE TABLE IF NOT EXISTS missed (term TEXT NOT NULL, day TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 1, first_seen TEXT NOT NULL, last_seen TEXT NOT NULL, PRIMARY KEY(term, day));"
 *   Then in Cloudflare Pages dashboard:
 *     Settings → Functions → D1 database bindings → add MISSES → brainbar-misses
 * ════════════════════════════════════════════════════════════════════════════
 */

const TERM_RE = /^[a-z0-9][a-z0-9-]{0,49}$/;
const ALLOWED_ORIGINS = [
  'https://cmd.aguidetocloud.com',
  'http://127.0.0.1:1316',
  'http://localhost:1316',
];

function corsHeaders(origin) {
  const ok = ALLOWED_ORIGINS.includes(origin) || /^https?:\/\/[^.]+\.cmd\.aguidetocloud\.com$/.test(origin || '');
  return {
    'Access-Control-Allow-Origin': ok ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

function noContent(extraHeaders = {}) {
  return new Response(null, { status: 204, headers: extraHeaders });
}

export const onRequestOptions = (ctx) =>
  new Response(null, { status: 204, headers: corsHeaders(ctx.request.headers.get('origin')) });

export const onRequestPost = async (ctx) => {
  const origin = ctx.request.headers.get('origin') || '';
  const cors = corsHeaders(origin);

  // Reject untrusted origins (silent — return 204 to not leak info)
  const okOrigin = ALLOWED_ORIGINS.includes(origin) || /^https?:\/\/[^.]+\.cmd\.aguidetocloud\.com$/.test(origin);
  if (!okOrigin) return noContent(cors);

  // Parse body (silent on parse error)
  let body;
  try {
    body = await ctx.request.json();
  } catch {
    return noContent(cors);
  }

  const term = String(body?.term || '').trim().toLowerCase();
  if (!term || !TERM_RE.test(term)) return noContent(cors);

  // Ignore terms that resolve in the index (not actually a miss)
  try {
    const indexUrl = new URL('/cmd-index.json', ctx.request.url).toString();
    const r = await fetch(indexUrl, { cf: { cacheEverything: true, cacheTtl: 300 } });
    if (r.ok) {
      const data = await r.json();
      for (const e of data.entries || []) {
        if (e.slug?.toLowerCase() === term) return noContent(cors);
        if ((e.abbreviations || []).some(a => a.toLowerCase() === term)) return noContent(cors);
        if ((e.aliases || []).some(a => a.toLowerCase() === term)) return noContent(cors);
        if ((e.old_names || []).some(o =>
          String(o).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') === term
        )) return noContent(cors);
      }
    }
  } catch {
    // If the index fetch fails, fall through and still record the miss.
  }

  // No D1 binding? Log + return — graceful fallback for local/preview.
  if (!ctx.env || !ctx.env.MISSES) {
    console.log(`[log-miss] would record: ${term} (no D1 binding present)`);
    return noContent(cors);
  }

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
  const now = new Date().toISOString();

  try {
    await ctx.env.MISSES
      .prepare(`
        INSERT INTO missed (term, day, count, first_seen, last_seen)
        VALUES (?1, ?2, 1, ?3, ?3)
        ON CONFLICT(term, day) DO UPDATE SET
          count = count + 1,
          last_seen = excluded.last_seen
      `)
      .bind(term, today, now)
      .run();
  } catch (err) {
    console.error('[log-miss] D1 insert failed:', err);
    // Don't leak the error — return 204 anyway.
  }

  return noContent(cors);
};
