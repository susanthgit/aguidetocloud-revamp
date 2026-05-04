/**
 * ════════════════════════════════════════════════════════════════════════════
 * 🔍 Brain Bar — GET /api/popular-misses
 * ────────────────────────────────────────────────────────────────────────────
 * Returns the top N missed terms over the last 30 days (or configured window).
 * Public endpoint — the data is intentionally transparent (signals what
 * Brain Bar should cover next).
 *
 * Threshold: only return terms with total count >= 2 to avoid amplifying
 * one-off typos and to slightly mitigate Streisand effect.
 *
 * Query params:
 *   ?days=30      lookback window (default 30, max 365)
 *   ?limit=20     max rows (default 20, max 100)
 *   ?min=2        minimum count threshold (default 2)
 * ════════════════════════════════════════════════════════════════════════════
 */

const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=300, s-maxage=300',
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { ...CACHE_HEADERS, ...(init.headers || {}) },
  });
}

function clamp(v, lo, hi, def) {
  const n = parseInt(v, 10);
  if (!Number.isFinite(n)) return def;
  return Math.max(lo, Math.min(hi, n));
}

export const onRequestGet = async (ctx) => {
  const url = new URL(ctx.request.url);
  const days = clamp(url.searchParams.get('days'), 1, 365, 30);
  const limit = clamp(url.searchParams.get('limit'), 1, 100, 20);
  const min = clamp(url.searchParams.get('min'), 1, 1000, 2);

  if (!ctx.env || !ctx.env.MISSES) {
    return jsonResponse({
      ok: false,
      message: 'D1 not bound — analytics paused on this environment.',
      window_days: days,
      threshold: min,
      results: [],
    });
  }

  // YYYY-MM-DD for "today minus N days"
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString().slice(0, 10);

  try {
    const { results } = await ctx.env.MISSES
      .prepare(`
        SELECT term,
               SUM(count) AS total,
               MIN(first_seen) AS first_seen,
               MAX(last_seen) AS last_seen
        FROM missed
        WHERE day >= ?1
        GROUP BY term
        HAVING total >= ?2
        ORDER BY total DESC, last_seen DESC
        LIMIT ?3
      `)
      .bind(since, min, limit)
      .all();

    return jsonResponse({
      ok: true,
      window_days: days,
      threshold: min,
      generated_at: new Date().toISOString(),
      results: results || [],
    });
  } catch (err) {
    console.error('[popular-misses] D1 query failed:', err);
    return jsonResponse(
      { ok: false, message: 'query failed', results: [] },
      { status: 500 }
    );
  }
};
