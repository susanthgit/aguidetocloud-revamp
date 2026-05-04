/* ═══════════════════════════════════════════════════════════════════════════
   🪐 Brain Bar — Wildcard subdomain handler (cmd.ms-style pattern)
   ───────────────────────────────────────────────────────────────────────────
   Cloudflare Pages middleware. Runs on EVERY request to the brainbar project.

   Behaviour:
     · Host = cmd.aguidetocloud.com           → next() (serve normal static)
     · Host = www.cmd.aguidetocloud.com       → 302 to apex (strip the www)
     · Host = <slug>.cmd.aguidetocloud.com    → 302 to https://cmd.aguidetocloud.com/<canonical>/
       where <slug> matches an entry slug, abbreviation, alias, or slugified old-name.
     · Host = <unknown>.cmd.aguidetocloud.com → 302 to https://cmd.aguidetocloud.com/?q=<unknown>
       (graceful fallback — drops user into the launcher with the term pre-filled)

   Index source: fetched from /cmd-index.json (same project), edge-cached for
   5 minutes via the Cloudflare cache API. Module-level memoization persists
   across same-isolate invocations for sub-millisecond warm responses.

   Required external setup (Sush):
     1. Cloudflare DNS → CNAME *.cmd → cmd.aguidetocloud.com (proxied)
     2. Pages → aguidetocloud-brainbar → Custom domains → add *.cmd.aguidetocloud.com
     3. Wait for SSL provisioning (usually <60s)
   ═══════════════════════════════════════════════════════════════════════════ */

const APEX_HOST = 'cmd.aguidetocloud.com';
const APEX_ORIGIN = 'https://cmd.aguidetocloud.com';
const INDEX_PATH = '/cmd-index.json';
const CACHE_TTL_MS = 5 * 60 * 1000;
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,62}$/i;

let SLUG_MAP = null;
let SLUG_MAP_AT = 0;

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function loadSlugMap(request) {
  const now = Date.now();
  if (SLUG_MAP && now - SLUG_MAP_AT < CACHE_TTL_MS) return SLUG_MAP;

  const indexUrl = new URL(INDEX_PATH, request.url).toString();
  const r = await fetch(indexUrl, {
    cf: { cacheEverything: true, cacheTtl: 300 },
  });
  if (!r.ok) {
    SLUG_MAP = SLUG_MAP || new Map();
    return SLUG_MAP;
  }
  const data = await r.json();
  const map = new Map();
  for (const e of data.entries || []) {
    if (!e || !e.slug || !e.url) continue;
    const target = e.url;
    map.set(e.slug.toLowerCase(), target);
    for (const a of e.abbreviations || []) map.set(String(a).toLowerCase(), target);
    for (const a of e.aliases || []) map.set(String(a).toLowerCase(), target);
    for (const o of e.old_names || []) {
      const sl = slugify(o);
      if (sl) map.set(sl, target);
    }
  }
  SLUG_MAP = map;
  SLUG_MAP_AT = now;
  return SLUG_MAP;
}

function redirect(target, request) {
  const url = new URL(request.url);
  const hasQuery = url.search && url.search.length > 1;
  const finalTarget = hasQuery && !target.includes('?')
    ? target + url.search
    : target;
  return new Response(null, {
    status: 302,
    headers: {
      Location: finalTarget,
      'Cache-Control': 'public, max-age=300',
      'X-Brain-Bar-Subdomain': 'wildcard-handler-v2.1',
    },
  });
}

export const onRequest = async (context) => {
  const { request, next } = context;
  const host = (request.headers.get('host') || '').toLowerCase();

  if (host === APEX_HOST) return next();

  const escaped = APEX_HOST.replace(/\./g, '\\.');
  const re = new RegExp('^([^.]+)\\.' + escaped + '$');
  const m = host.match(re);
  if (!m) return next();

  const prefix = m[1];

  if (prefix === 'www') {
    const url = new URL(request.url);
    return redirect(APEX_ORIGIN + url.pathname + url.search, request);
  }

  if (!SLUG_RE.test(prefix)) {
    return redirect(`${APEX_ORIGIN}/`, request);
  }

  const slugMap = await loadSlugMap(request);
  const target = slugMap.get(prefix);

  if (target) {
    return redirect(`${APEX_ORIGIN}${target}`, request);
  }

  return redirect(`${APEX_ORIGIN}/?q=${encodeURIComponent(prefix)}`, request);
};
