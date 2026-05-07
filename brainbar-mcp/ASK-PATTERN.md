# The cmd_ask Pattern — reusable grounded NL Q&A for any planet

> Last updated: 7 May 2026
>
> This file documents the architecture cmd uses to expose a natural-language
> question-answering tool grounded in its own corpus, with citations, no
> hallucinations, on the Cloudflare Workers AI free tier. The pattern is
> reusable on any future planet (Plain AI, Shift, Roadmap, etc.) that has:
>
> 1. A static or queryable corpus of factual entries (TOML / JSON / markdown)
> 2. A way to surface that corpus as a JSON index (Hugo data adapter or similar)
> 3. A Cloudflare Worker (Pages Function works too) deployable via wrangler

## The architecture in one sentence

> Search the corpus for top-K relevant entries → pack them as user-message
> context → call Workers AI with a strict grounding system prompt → extract
> citations from the response → return the answer + the cited slugs to the UI.

## Why this works (and why simpler approaches don't)

| Approach | Risk |
|---|---|
| Fine-tuned model on corpus | Expensive, slow to iterate, doesn't update with corpus changes |
| RAG via vector store | Overkill for ≤500 entries; vector DB cost outweighs benefit |
| Naive LLM call (no grounding) | Hallucinations: invents Microsoft features, mis-quotes pricing |
| **Inline-context grounding (this pattern)** | Cheap, fast, accurate, citation-traceable |

Cmd has 55 entries × ~500 tokens each. Even sending the whole corpus would
fit in modern context windows (~30K tokens) — but that's wasteful. Top-6 by
relevance gives the model enough scaffolding while keeping the prompt small.

## The five components

### 1. The system prompt — REQUIRES grounding

```
You are <planet> — a <domain> decoder. Answer the user's question in plain
English using ONLY the entries provided below.

Rules:
1. Keep your answer to 120 words or less.
2. Cite EVERY entry you reference by its slug in [square-brackets].
3. If the provided entries don't cover the question, respond exactly:
   "I don't have a <planet> entry covering that — try `search <term>`."
4. No marketing fluff. Sysadmin tone.
5. Don't invent facts that aren't in the entries.
6. Surface real numbers from the entries when relevant.
```

The fallback message is **verbatim** — never paraphrase. This becomes a
reliable signal to the UI that "I don't know" was the intended answer.

### 2. The retrieval — top-K via existing ranker

```typescript
const candidates = await tool_search(question, 6);
// Optional: also pull token-substring matches for multi-term queries
for (const token of question.split(/\s+/).filter(t => t.length > 2)) {
  // ... add entries that match `token` in slug/abbreviations/aliases
}
```

Use whatever ranker the planet already has. Cmd uses a 6-tier ranker
(slug → abbreviation → alias → old-name → prefix → substring). Plain AI
might use Pagefind. Shift might use a simple field-weighted score. The
ranker doesn't need to be sophisticated — the LLM tolerates noise in the
retrieved set.

### 3. The user message — packed entry context

```
QUESTION:
{user_question}

ENTRIES:
[{slug}] {name}
kind: {kind} · domain: {domain}
plain: {plain_english}
{any other fields the LLM needs to answer}

[{slug2}] ...
```

The `[{slug}]` prefix is critical — it teaches the model the citation
format you want it to echo. Models reliably copy-paste the prefix structure.

### 4. The Workers AI call

```typescript
const aiResp = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
  messages: [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: USER_PROMPT },
  ],
  max_tokens: 320,
});
const answer = String(aiResp.response || '').trim();
```

Free tier limits: 10K neurons/day. Llama 3.1 8B is ~3 neurons/request.
That's ~3,000 questions/day per Worker. Fine for any planet's launch
phase. Bigger models (Llama 70B, Mistral Small) cost more neurons but
return better quality. Default to the cheapest that works.

### 5. The citation extraction — verify against corpus

```typescript
const citedSlugs: string[] = [];
const seen = new Set<string>();
const citeRe = /\[([a-z0-9][a-z0-9\-]*)\]/g;
let m: RegExpExecArray | null;
while ((m = citeRe.exec(answer)) !== null) {
  const slug = m[1];
  // Critical: only add if it's a REAL entry slug (no fake citations)
  if (!seen.has(slug) && idx.entries.some(e => e.slug === slug)) {
    citedSlugs.push(slug);
    seen.add(slug);
  }
}
```

If the model hallucinates a slug that doesn't exist, it's silently dropped
from the cited list. The UI won't render a broken link.

## Surfaces (you probably want both)

### MCP tool (for AI agents — Claude Desktop, Cursor, ChatGPT MCP)

```typescript
{
  name: '<planet>_ask',
  description: 'Natural-language question over the <planet> corpus...',
  inputSchema: { type: 'object', properties: { question: { type: 'string' } }, required: ['question'] },
}
```

### Direct HTTP POST endpoint (for the planet's own UI)

```typescript
if (url.pathname === '/ask' && request.method === 'POST') {
  const { question } = await request.json();
  const result = await tool_ask(question, env);
  return jsonResponse(result);  // CORS headers per existing pattern
}
```

Both call the same internal `tool_ask(question, env)`. Single source of truth.

## Cmd's specific implementation

See `brainbar-mcp/src/index.ts`:
- `tool_ask()` function — the core handler
- `cmd_ask` MCP tool registration in TOOLS array
- `POST /ask` HTTP endpoint
- `BrainBarEntry` interface — extended with includes/included_in/voice/etc
- `Env` interface — types the AI binding

And `brainbar/static/js/cmd-terminal.js`:
- `cmdAsk()` verb — POSTs to mcp.aguidetocloud.com/ask
- Renders placeholder blocks immediately
- On fetch resolve: linkifies `[slug]` citations into clickable `man <slug>` actions

## How to apply this to a new planet

1. **Identify the corpus.** Whatever the planet's primary entity collection is.
   Plain AI: lessons. Shift: roles. Roadmap: features. Connect: meeting notes.
2. **Verify the JSON adapter exposes a queryable index.** It should serve
   /index.json or similar, with each entry having a stable slug + readable fields.
3. **Add `[ai] binding = "AI"` to wrangler.toml.** Free tier; no extra credentials.
4. **Copy `tool_ask()` to the planet's MCP server.** Adjust:
   - The system prompt (replace `<planet>` and `<domain>`)
   - The fallback message
   - The entry-context formatter (which fields to include)
   - The ranker (use whatever the planet has)
5. **Register the MCP tool** as `<planet>_ask`.
6. **Add the HTTP `/ask` endpoint** for the planet's own UI to call.
7. **Add the UI verb / chat affordance.** Match the planet's design language;
   the architecture doesn't care.
8. **Copy the unit tests** from brainbar-mcp/test/index.test.mjs:
   - "without AI binding returns binding-required message"
   - "with mock AI returns grounded answer with citations"
   - "empty question returns usage error"
   - "POST /ask works directly"
   - "POST /ask without question returns 400"

## Hallucination guards — the layered defence

1. **System prompt** REQUIRES grounded answers. Most attempts to make the
   model "fix up" gaps in the corpus get rejected at this layer.
2. **Restricted context window** — only top-6 entries packed, no internet
   access, no other tools — limits what the model has to work with.
3. **Fallback message** is verbatim and tested for. UI can detect the exact
   string and skip rendering citations.
4. **Citation validation** — every `[slug]` extracted from the answer is
   matched against the actual entry list. Fake citations silently dropped.
5. **No tool calls within the model response** — single-turn, no agency.
   The model can only echo what it's given.

This stack makes hallucinations cosmetic at worst (bad-but-bounded answers
get returned, but they don't link to fake content).

## What this pattern is NOT

- **NOT a chatbot.** Single-turn, no conversation history. Stateless.
- **NOT a search engine.** Use the existing ranker (cmd_search etc) for that.
  ask is for synthesised answers spanning multiple entries.
- **NOT a replacement for the corpus.** Always link back to the canonical
  entry pages so users can verify.
- **NOT free-form generation.** Constrained to grounded citations.
- **NOT for sensitive data.** Cloudflare Workers AI may log requests. Don't
  pipe authenticated/PII data through it.

## Cost expectations

- Free tier: 10K neurons/day, ~3,000 questions on llama-3.1-8b.
- Beyond free: ~$0.30 per 1M neurons. 10K extra questions ≈ $1/day.
- Latency: ~1-3s per question on llama-3.1-8b. Llama 3.3 70B ≈ 4-8s.

If a planet hits the free-tier limit consistently, that's a strong success
signal — graduate to a paid plan or move to a smaller model.

## Future hardening (not blocking)

- **Per-IP rate limiting** via Cloudflare Worker limits or KV-backed counter.
- **Caching of repeated questions** in KV for the question-string-hash.
- **Streaming responses** — Workers AI supports streaming; UI would render
  tokens as they arrive instead of waiting for the full answer.
- **Multiple model fallback** — try llama-3.1-8b first, if response is
  empty/refused, retry with llama-3.3-70b.
- **Telemetry** — log question + cited slugs to a KV namespace; surfaces
  what users are actually asking and which entries get cited most.

## See also

- `brainbar-mcp/src/index.ts` — reference implementation
- `brainbar/static/js/cmd-terminal.js` `cmdAsk()` — UI integration
- Cloudflare Workers AI catalog: https://developers.cloudflare.com/workers-ai/models/
- MCP spec: https://spec.modelcontextprotocol.io/
