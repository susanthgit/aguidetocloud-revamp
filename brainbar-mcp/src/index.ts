/**
 * ════════════════════════════════════════════════════════════════════════════
 * 🪐 cmd MCP Server — first endpoint on the MCP Move planet
 * ────────────────────────────────────────────────────────────────────────────
 * 🔒 PAID-CONTENT FIREWALL (cosmos universal law #6)
 * ────────────────────────────────────────────────────────────────────────────
 * This server is allowed to fetch ONE upstream URL: cmd.aguidetocloud.com's
 * public cmd-index.json (free cmd entries — Microsoft jargon decoder).
 *
 * It MUST NEVER:
 *   ❌ Fetch from aguidetocloud.com/guided/data/questions/* (paid practice exams)
 *   ❌ Fetch any URL the user can authenticate against (Stripe, account APIs)
 *   ❌ Expose any data cmd itself wouldn't expose at its public URL
 *   ❌ Add tools that could be used to extract practice-exam content
 *
 * Adding any new fetch URL here requires verifying it points to free, public
 * cmd (or future free planet) data only. When in doubt, do not add it.
 *
 * The hard-coded INDEX_URL constant below is the only network egress allowed.
 * If you add another, add it to a documented allowlist with a justification.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * A Cloudflare Worker that speaks the Model Context Protocol (MCP) over HTTP,
 * exposing cmd as a knowledge tool for AI agents (Claude Desktop,
 * Cursor, Cline, Continue, ChatGPT with MCP support, etc.).
 *
 * Tools:
 *   1. cmd_search(query)     — search entries by slug, alias, name, kind
 *   2. cmd_get(slug)         — fetch a single entry's full record
 *   3. cmd_list_kinds(kind)  — list all entries of a kind (or all)
 *
 * Transports:
 *   - Streamable HTTP (POST /mcp) — current spec, March 2025+
 *   - JSON-RPC 2.0 message format
 *
 * Data:
 *   - Fetched from https://cmd.aguidetocloud.com/cmd-index.json (the same
 *     index the cmd launcher uses).
 *   - Cached in module scope for the lifetime of the isolate (Cloudflare
 *     reuses isolates across many requests). 5-minute TTL.
 *
 * No npm dependencies — pure protocol implementation. Keeps the bundle tiny
 * and avoids any Node-only transports from the official SDK.
 * ════════════════════════════════════════════════════════════════════════════
 */

const SERVER_NAME = 'brainbar';
const SERVER_VERSION = '0.1.0';
const PROTOCOL_VERSION = '2025-03-26';

// 🔒 Paid-content firewall: this is the ONLY upstream URL this server is
// allowed to fetch. See header comment for the full rule.
const ALLOWED_UPSTREAM_HOSTS = new Set(['cmd.aguidetocloud.com']);
const INDEX_URL = 'https://cmd.aguidetocloud.com/cmd-index.json';

const CACHE_TTL_MS = 5 * 60 * 1000;

// ── Types ─────────────────────────────────────────────────────────────────

interface BrainBarEntry {
  slug: string;
  name: string;
  kind: string;
  domain: string;
  abbreviations?: string[];
  aliases?: string[];
  old_names?: string[];
  plain_english?: string;
  status?: string;
  url: string;
  has_take?: boolean;
}

interface BrainBarIndex {
  version: string;
  generated_at: string;
  count: number;
  entries: BrainBarEntry[];
}

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id?: string | number | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

// ── Index loader (module-scoped cache) ────────────────────────────────────

let CACHED_INDEX: BrainBarIndex | null = null;
let CACHED_AT = 0;

async function loadIndex(): Promise<BrainBarIndex> {
  const now = Date.now();
  if (CACHED_INDEX && now - CACHED_AT < CACHE_TTL_MS) return CACHED_INDEX;

  // 🔒 Paid-content firewall — refuse to fetch anything that isn't on the
  // allowlist of free upstream hosts. See header comment.
  const upstream = new URL(INDEX_URL);
  if (!ALLOWED_UPSTREAM_HOSTS.has(upstream.hostname)) {
    throw new Error(
      `firewall: refusing to fetch from non-allowlisted host '${upstream.hostname}'`
    );
  }

  const r = await fetch(INDEX_URL, {
    cf: { cacheEverything: true, cacheTtl: 300 },
  });
  if (!r.ok) {
    throw new Error(`failed to fetch cmd index: ${r.status} ${r.statusText}`);
  }
  const data = (await r.json()) as BrainBarIndex;
  CACHED_INDEX = data;
  CACHED_AT = now;
  return data;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// ── Tool implementations ──────────────────────────────────────────────────

interface SearchHit extends BrainBarEntry {
  match_reason: string;
  tier: number;
}

async function tool_search(query: string, limit = 10): Promise<SearchHit[]> {
  if (!query || typeof query !== 'string') return [];
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const idx = await loadIndex();
  const seen = new Set<string>();
  const hits: SearchHit[] = [];
  const push = (e: BrainBarEntry, tier: number, reason: string) => {
    if (seen.has(e.slug)) return;
    seen.add(e.slug);
    hits.push({ ...e, tier, match_reason: reason });
  };

  for (const e of idx.entries) {
    if (e.slug.toLowerCase() === q) push(e, 1, 'exact slug');
    else if ((e.abbreviations ?? []).some((a) => a.toLowerCase() === q)) push(e, 2, 'abbreviation');
    else if ((e.aliases ?? []).some((a) => a.toLowerCase() === q)) push(e, 3, 'alias');
    else if ((e.old_names ?? []).some((o) => slugify(o) === q)) push(e, 4, 'rebranded — old name');
  }
  for (const e of idx.entries) {
    if (seen.has(e.slug)) continue;
    if (e.slug.startsWith(q) || e.name.toLowerCase().startsWith(q)) push(e, 5, 'prefix');
  }
  for (const e of idx.entries) {
    if (seen.has(e.slug)) continue;
    if (
      e.slug.includes(q) ||
      e.name.toLowerCase().includes(q) ||
      (e.plain_english ?? '').toLowerCase().includes(q)
    ) {
      push(e, 6, 'substring');
    }
  }

  return hits.slice(0, limit);
}

async function tool_get(slug: string): Promise<BrainBarEntry | { error: string }> {
  if (!slug || typeof slug !== 'string') return { error: 'slug required' };
  const idx = await loadIndex();
  const target = slug.trim().toLowerCase();
  const direct = idx.entries.find((e) => e.slug.toLowerCase() === target);
  if (direct) return direct;
  // Fall back via aliases / abbreviations / old-names
  const indirect = idx.entries.find(
    (e) =>
      (e.abbreviations ?? []).some((a) => a.toLowerCase() === target) ||
      (e.aliases ?? []).some((a) => a.toLowerCase() === target) ||
      (e.old_names ?? []).some((o) => slugify(o) === target)
  );
  return indirect ?? { error: `no entry for '${slug}'` };
}

async function tool_list_kinds(kind?: string): Promise<{ kind: string; count: number; entries: { slug: string; name: string }[] }[]> {
  const idx = await loadIndex();
  const kinds = new Map<string, BrainBarEntry[]>();
  for (const e of idx.entries) {
    const k = e.kind || 'unknown';
    if (kind && k !== kind) continue;
    if (!kinds.has(k)) kinds.set(k, []);
    kinds.get(k)!.push(e);
  }
  return Array.from(kinds.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([k, entries]) => ({
      kind: k,
      count: entries.length,
      entries: entries.map((e) => ({ slug: e.slug, name: e.name })),
    }));
}

// ── MCP tool definitions (JSON Schema for inputs) ─────────────────────────

const TOOLS = [
  {
    name: 'cmd_search',
    description:
      'Search cmd for Microsoft cloud terminology — products, licenses, portals, features, certifications. Returns ranked matches with metadata. Use this when an agent encounters an ambiguous Microsoft acronym, license code, or product name and needs context.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search term — slug, abbreviation, alias, old name, or substring (e.g. "mde", "P1", "windows defender atp", "endpoint manager").',
        },
        limit: {
          type: 'number',
          description: 'Max results (1-50). Default 10.',
          minimum: 1,
          maximum: 50,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'cmd_get',
    description:
      'Fetch a single cmd entry by slug, alias, abbreviation, or old name. Returns full record including plain-English explainer, official Microsoft definition, plans, portal URL, learn URL, related certs, status, and rebrand history. Use after cmd_search to get the authoritative answer.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description: 'Canonical slug (e.g. "mde"), abbreviation ("E3"), alias ("foundry"), or slugified old name ("azure-ai-studio").',
        },
      },
      required: ['slug'],
    },
  },
  {
    name: 'cmd_list_kinds',
    description:
      'List cmd entries grouped by kind (product, portal, feature, license, cert, tool, disambiguation). Optionally filter to a single kind. Useful for discovery — "show me all Microsoft licenses cmd covers".',
    inputSchema: {
      type: 'object',
      properties: {
        kind: {
          type: 'string',
          description: 'Filter to one kind. One of: product, portal, feature, license, cert, tool, disambiguation, acronym-only. Omit to get all kinds.',
        },
      },
    },
  },
];

// ── JSON-RPC dispatch ─────────────────────────────────────────────────────

async function handleRpc(req: JsonRpcRequest): Promise<JsonRpcResponse> {
  const id = req.id ?? null;
  try {
    switch (req.method) {
      case 'initialize': {
        return {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: PROTOCOL_VERSION,
            capabilities: { tools: {}, logging: {} },
            serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
            instructions:
              'cmd — Microsoft jargon decoder (cmd.aguidetocloud.com). Use cmd_search to find a term, then cmd_get to fetch its full record. Use cmd_list_kinds for discovery. All entries are Sush-curated, citation-backed (Microsoft Learn URLs), and freshness-validated.',
          },
        };
      }

      case 'notifications/initialized':
        return { jsonrpc: '2.0', id }; // notification ack — no result needed

      case 'tools/list':
        return { jsonrpc: '2.0', id, result: { tools: TOOLS } };

      case 'tools/call': {
        const name = (req.params?.name as string) ?? '';
        const args = (req.params?.arguments as Record<string, unknown>) ?? {};

        let payload: unknown;
        switch (name) {
          case 'cmd_search':
            payload = await tool_search(
              String(args.query ?? ''),
              typeof args.limit === 'number' ? args.limit : 10
            );
            break;
          case 'cmd_get':
            payload = await tool_get(String(args.slug ?? ''));
            break;
          case 'cmd_list_kinds':
            payload = await tool_list_kinds(
              typeof args.kind === 'string' ? args.kind : undefined
            );
            break;
          default:
            return {
              jsonrpc: '2.0',
              id,
              error: { code: -32601, message: `unknown tool: ${name}` },
            };
        }

        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              { type: 'text', text: JSON.stringify(payload, null, 2) },
            ],
            isError: false,
          },
        };
      }

      case 'ping':
        return { jsonrpc: '2.0', id, result: {} };

      default:
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `method not found: ${req.method}` },
        };
    }
  } catch (err) {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32603,
        message: 'internal error',
        data: err instanceof Error ? err.message : String(err),
      },
    };
  }
}

// ── HTTP entry point (Cloudflare Worker) ──────────────────────────────────

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Mcp-Session-Id',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id',
};

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
      ...(init.headers ?? {}),
    },
  });
}

const HOMEPAGE_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>cmd MCP Server</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{background:#0B0E14;color:#E6EDF3;font-family:'JetBrains Mono',ui-monospace,monospace;margin:0;padding:48px 24px;line-height:1.55}
  main{max-width:680px;margin:0 auto}
  h1{color:#34D399;font-size:1.75rem;margin:0 0 8px;font-weight:600}
  h2{color:#7D8590;font-size:0.75rem;text-transform:lowercase;letter-spacing:0.05em;margin:32px 0 8px;font-weight:500}
  h2::before{content:"// ";color:#545D68}
  p{color:#B1BAC4}
  code{color:#34D399;background:rgba(52,211,153,0.10);padding:1px 6px;border-radius:2px}
  pre{background:#0F1218;border:1px solid #21262D;border-radius:4px;padding:12px;overflow-x:auto;font-size:0.875rem;color:#E6EDF3}
  a{color:#34D399}
  .tag{display:inline-block;color:#34D399;border:1px solid #10B981;padding:1px 6px;border-radius:2px;font-size:0.75rem;margin-right:8px}
</style>
</head><body><main>
  <p style="color:#7D8590;margin:0 0 8px"><span class="tag">running</span><span class="tag">cosmos: mcp move</span></p>
  <h1>$_ brainbar-mcp</h1>
  <p>cmd exposed as a remote Model Context Protocol server. Connect from Claude Desktop, Cursor, Cline, Continue, or any MCP-aware AI agent.</p>

  <h2>endpoint</h2>
  <pre>POST https://mcp.aguidetocloud.com/mcp
Content-Type: application/json</pre>

  <h2>tools</h2>
  <pre>cmd_search(query, limit?)
cmd_get(slug)
cmd_list_kinds(kind?)</pre>

  <h2>connect from claude desktop</h2>
  <pre>{
  "mcpServers": {
    "brainbar": {
      "url": "https://mcp.aguidetocloud.com/mcp"
    }
  }
}</pre>
  <p>Add to <code>~/Library/Application Support/Claude/claude_desktop_config.json</code> (macOS) or <code>%APPDATA%\\Claude\\claude_desktop_config.json</code> (Windows). Restart Claude Desktop.</p>

  <h2>data source</h2>
  <p>Live from <a href="https://cmd.aguidetocloud.com">cmd.aguidetocloud.com</a> · 35+ entries · validated · citation-backed.</p>
  <p>part of the <a href="https://www.aguidetocloud.com/">a guide to cloud</a> universe</p>
</main></body></html>`;

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (url.pathname === '/' && request.method === 'GET') {
      return new Response(HOMEPAGE_HTML, {
        headers: { 'Content-Type': 'text/html; charset=utf-8', ...CORS_HEADERS },
      });
    }

    if (url.pathname === '/health') {
      return jsonResponse({ ok: true, server: SERVER_NAME, version: SERVER_VERSION });
    }

    if (url.pathname === '/mcp' && request.method === 'POST') {
      const body = await request.json().catch(() => null);
      if (!body || typeof body !== 'object') {
        return jsonResponse(
          { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'parse error' } },
          { status: 400 }
        );
      }

      // Single request OR batch
      if (Array.isArray(body)) {
        const responses = await Promise.all(body.map((r) => handleRpc(r as JsonRpcRequest)));
        // Filter out empty responses for notifications (id absent)
        const filtered = responses.filter((r) => r.id !== undefined);
        if (filtered.length === 0) return new Response(null, { status: 202, headers: CORS_HEADERS });
        return jsonResponse(filtered);
      }

      const response = await handleRpc(body as JsonRpcRequest);
      // For notifications (no id), the spec asks for 202 Accepted with no body.
      if ((body as JsonRpcRequest).id === undefined) {
        return new Response(null, { status: 202, headers: CORS_HEADERS });
      }
      return jsonResponse(response);
    }

    if (url.pathname === '/mcp' && request.method === 'GET') {
      // Stateless mode: we don't keep a session. Tell client SSE not supported.
      return new Response('SSE streaming not enabled on this stateless server. Use POST /mcp.', {
        status: 405,
        headers: { Allow: 'POST', ...CORS_HEADERS },
      });
    }

    return jsonResponse(
      { error: 'not found', endpoints: ['GET /', 'GET /health', 'POST /mcp'] },
      { status: 404 }
    );
  },
};
