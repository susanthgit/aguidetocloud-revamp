# cmd MCP Server — `mcp.aguidetocloud.com`

> *cmd inside Claude. Inside Cursor. Inside ChatGPT. Inside any MCP-aware AI.*

A Cloudflare Worker that speaks the [Model Context Protocol](https://modelcontextprotocol.io/)
and exposes cmd as a knowledge tool for AI agents. First endpoint on the
**MCP Move** star in the cosmos.

## 🔒 Paid-content firewall (cosmos universal law #6)

This server is allowed to fetch **exactly one upstream URL**:
`https://cmd.aguidetocloud.com/cmd-index.json` (free cmd entries).

It MUST NEVER:
- ❌ Fetch from `aguidetocloud.com/guided/data/questions/*` (paid practice exams)
- ❌ Fetch any URL that requires authentication
- ❌ Expose data cmd wouldn't expose at its public URL
- ❌ Add tools that could be used to extract paid content

The hard-coded `INDEX_URL` constant in `src/index.ts` plus the
`ALLOWED_UPSTREAM_HOSTS` allowlist enforce this. Any future edit that adds a
new fetch URL must verify it points to free, public planet data only — and
must be reviewed against the cosmos philosophy.

## 🛠️ Tools exposed

| Tool | What it does |
|---|---|
| `cmd_search(query, limit?)` | Search by slug, abbreviation, alias, old name, prefix, or substring. Returns ranked hits with tier + reason. |
| `cmd_get(slug)` | Fetch a single entry's full record. Resolves aliases, abbreviations, and slugified old names too. |
| `cmd_list_kinds(kind?)` | Group entries by kind (product, license, feature, portal, cert, tool, disambiguation). Optional filter. |

## 🚀 Local development

```pwsh
cd brainbar-mcp

# 1. Run the test suite (no install needed — Node 22+ strips TypeScript)
node --experimental-strip-types --test test/*.test.mjs

# 2. Run wrangler dev (only if you want to test against local cmd)
npm install                          # only required for wrangler
npm run dev                          # → http://localhost:8787
```

The tests mock `fetch()` to read from your local
`brainbar/public/cmd-index.json`, so they work fully offline (provided you
ran `cd ../brainbar && hugo` once to produce that file).

## 🌐 Deployment (Sush)

```pwsh
cd brainbar-mcp
npx wrangler login
npx wrangler deploy
```

Then in the Cloudflare dashboard:

1. Workers & Pages → `brainbar-mcp` Worker → Settings → Triggers → Custom Domains
2. Add `mcp.aguidetocloud.com`
3. Cloudflare auto-provisions SSL (Universal SSL, ~60s)

Confirm live:
```pwsh
curl https://mcp.aguidetocloud.com/health
# → {"ok":true,"server":"brainbar","version":"0.1.0"}
```

## 🔌 Connect from AI clients

### Claude Desktop

Add to `claude_desktop_config.json` (location below) and restart Claude
Desktop:

```json
{
  "mcpServers": {
    "brainbar": {
      "url": "https://mcp.aguidetocloud.com/mcp"
    }
  }
}
```

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

### Cursor

Settings → MCP → Add new server → URL: `https://mcp.aguidetocloud.com/mcp`

### Cline (VS Code)

In Cline's MCP settings UI, add a remote server pointing at the same URL.

### Any client that speaks MCP over Streamable HTTP

POST JSON-RPC 2.0 messages to `https://mcp.aguidetocloud.com/mcp`. See the
[MCP spec](https://modelcontextprotocol.io/specification/) for the full
message format.

## 📐 Architecture

- **Runtime:** Cloudflare Workers (V8 isolates, global edge)
- **Protocol:** MCP `2025-03-26` over Streamable HTTP transport
- **Wire format:** JSON-RPC 2.0 (single requests + batches supported)
- **Bundle size:** zero npm dependencies — pure protocol implementation
- **Cache:** module-scoped index cache, 5-minute TTL
- **Cold start:** sub-50ms typical; warm requests sub-1ms (data already cached)

## 🪐 Cosmos placement

```
☀️ The Sun (Copilot)
   │
   ├── 🌍 Earth (aguidetocloud.com — paid/free Earth feature)
   │      └── 🌑 Moon (Guided platform)
   │
   ├── 🪐 cmd (cmd.aguidetocloud.com)
   │      └── 📡 publishes cmd-index.json  ← this Worker reads it
   │
   └── ⭐ MCP Move (mcp.aguidetocloud.com)  ← THIS PROJECT
          ├── exposes cmd to AI agents
          └── future: Shift, Grandma when those planets exist
```

## 📊 Test coverage

15 offline tests:
- HTTP routing (homepage, health, /mcp endpoint, OPTIONS)
- Initialize → server capabilities
- tools/list → exact tool count
- cmd_search across all 6 ranking tiers
- cmd_get for slug, abbreviation, error path
- cmd_list_kinds (all + filtered)
- JSON-RPC error handling (unknown tool, unknown method)

Run with:
```pwsh
node --experimental-strip-types --test test/*.test.mjs
```

## 🛣️ Roadmap

- v0.1 (this) — read-only, 3 tools, single data source (cmd)
- v0.2 — add `brainbar_recent_changes()` and `brainbar_by_domain()` tools
- v0.3 — add Shift entries when the Shift planet ships (becomes a multi-source MCP)
- v1.0 — rate limiting, optional API keys, public usage stats dashboard

## 📝 License

Server code: SIL Open Font License terms do not apply (it's TypeScript). The
MIT license applies to all source in this directory unless otherwise noted.

cmd entries (the data this server serves) are © A Guide to Cloud and
licensed for read-only access via this MCP endpoint. AI agents using this
server are free to summarize and cite cmd entries. Bulk redistribution
of the dataset itself requires permission.

---

Part of the [A Guide to Cloud universe](https://www.aguidetocloud.com).
