/**
 * realtime-cron — Cloudflare Worker on a 1-min Cron Trigger.
 *
 * Why this exists:
 *   The earlier scheduler (.github/workflows/realtime-refresh.yml on a 5-min
 *   GHA cron) dropped 90%+ of scheduled runs on shared GHA runners (observed
 *   1.5–4.5 hour gaps between actual runs on 17–18 May 2026). Each gap pushed
 *   the KV-backed realtime snapshot past the 30-min `tooStale` threshold in
 *   handleRealtime / handleRealtimeCosmos, hiding the live pill for most of
 *   the day.
 *
 *   Cloudflare Cron Triggers run on CF's own infra and fire with sub-minute
 *   precision, so a `* * * * *` cron produces ~60 invocations/hour, every
 *   hour, reliably.
 *
 *   This Worker is the ONLY scheduled caller of /api/stats?refresh=realtime
 *   going forward. The GHA workflow is kept as a manual fallback
 *   (workflow_dispatch only, schedule disabled).
 *
 * What it does (per scheduled tick):
 *   1. POST https://www.aguidetocloud.com/api/stats?refresh=realtime
 *      with Authorization: Bearer ${env.ADMIN_PASSWORD}
 *   2. Log the response status + counts. (CF Workers logs are tail-able with
 *      `wrangler tail aguidetocloud-realtime-cron` or via dashboard.)
 *   3. No retry — the next cron tick is only 60s away.
 *
 * Bindings (Worker secrets):
 *   ADMIN_PASSWORD  - plaintext, must match env.ADMIN_PASSWORD_HASH on the
 *                     aguidetocloud-revamp Pages project (SHA-256 of this
 *                     plaintext is what the Pages function compares against).
 * Bindings (plain text):
 *   REFRESH_URL     - https://www.aguidetocloud.com/api/stats?refresh=realtime
 *
 * Cost / quota:
 *   - CF Workers free tier: 100k requests/day. We use ~1.4k/day (60/hour).
 *   - The downstream GA4 quota burn is unchanged from the 16 May architecture:
 *     ~120 GA4 reports/hour, well under per-property quota.
 *
 * Built: 19 May 2026 (commit TBD). See:
 *   - functions/api/stats.js :: handleRealtimeRefresh — the endpoint we call
 *   - learning-docs/docs/reference/realtime-counter-playbook.md
 */

const USER_AGENT = 'aguidetocloud-realtime-cron/1.0';

async function refresh(env) {
  const url = env.REFRESH_URL || 'https://www.aguidetocloud.com/api/stats?refresh=realtime';
  const started = Date.now();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.ADMIN_PASSWORD}`,
        'User-Agent': USER_AGENT,
      },
      // Skip CF cache — this MUST hit the origin every time.
      cf: { cacheTtl: 0, cacheEverything: false },
    });
    const body = await res.json().catch(() => null);
    const elapsedMs = Date.now() - started;
    return {
      ok: res.ok && body?.ok === true,
      http: res.status,
      elapsed_ms: elapsedMs,
      active: body?.active ?? null,
      pages_count: body?.pages_count ?? null,
      error: body?.error || null,
      partial_active_only: body?.partial_active_only || false,
      partial_pages_only: body?.partial_pages_only || false,
      generated_at: body?.generated_at || null,
    };
  } catch (err) {
    return {
      ok: false,
      http: 0,
      elapsed_ms: Date.now() - started,
      error: `fetch-failed: ${err?.message || String(err)}`,
    };
  }
}

export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(
      refresh(env).then(r => {
        const status = r.ok ? '🟢' : '🔴';
        console.log(
          `${status} cron tick — http=${r.http} active=${r.active} pages=${r.pages_count} ` +
          `partial_active=${r.partial_active_only} partial_pages=${r.partial_pages_only} ` +
          `err=${r.error || 'none'} elapsed=${r.elapsed_ms}ms`
        );
      })
    );
  },

  async fetch(request, env, _ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/__trigger') {
      const result = await refresh(env);
      return new Response(JSON.stringify(result, null, 2), {
        status: result.ok ? 200 : 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(
      'aguidetocloud-realtime-cron: cron-only. POST /__trigger to test manually.\n',
      { status: 200, headers: { 'Content-Type': 'text/plain' } }
    );
  },
};
