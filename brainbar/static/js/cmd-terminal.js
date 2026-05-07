/* ═══════════════════════════════════════════════════════════════════════════
   cmd — Terminal Mode (cmd-terminal.js) · v1.0
   Loads from /cmd-index.json (+ decode-index.json lazily). XSS-safe rendering.
   Sibling to cmd.js — which still powers entry/decode pages.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // ─── Config ────────────────────────────────────────────────────────────
  const STORAGE = {
    boot:    'cmd:boot:seen',
    history: 'cmd:terminal:history',
    trail:   'cmd:terminal:trail',
    legacy:  'bb:recent',
  };
  const ERROR_PATTERNS = [
    /^0x[0-9a-fA-F]{4,8}$/,
    /^AADSTS\d+$/i,
    /^KB\d+$/i,
  ];

  // ─── Pure helpers (MIRROR of static/js/cmd-pure.mjs — keep in sync) ─────
  // The .mjs version is the canonical, unit-tested source. These are inlined
  // here because cmd-terminal.js is an IIFE, not an ES module. Future refactor:
  // load cmd-pure.mjs as a module and remove these duplicates.
  function normaliseIncludes(rawIncludes) {
    if (!Array.isArray(rawIncludes)) return [];
    return rawIncludes
      .map(item => {
        if (typeof item === 'string') return { slug: item.trim(), note: '' };
        if (item && typeof item === 'object' && typeof item.slug === 'string') {
          return { slug: item.slug.trim(), note: String(item.note || '') };
        }
        return null;
      })
      .filter(x => x && x.slug);
  }
  const MS_PER_DAY = 86400000;
  function daysAgo(verifiedDate, todayIso) {
    if (!verifiedDate || typeof verifiedDate !== 'string') return NaN;
    const verified = new Date(verifiedDate + 'T00:00:00Z');
    const today = new Date((todayIso || new Date().toISOString().slice(0, 10)) + 'T00:00:00Z');
    if (isNaN(verified.getTime()) || isNaN(today.getTime())) return NaN;
    return Math.floor((today.getTime() - verified.getTime()) / MS_PER_DAY);
  }
  function classifyFreshness(verifiedDate, todayIso) {
    const d = daysAgo(verifiedDate, todayIso);
    if (isNaN(d) || d < 0) return 'unknown';
    if (d < 30) return 'fresh';
    if (d <= 90) return 'stale';
    return 'ancient';
  }
  function todayIso() { return new Date().toISOString().slice(0, 10); }

  // Ordered matcher registry — specific patterns beat generic. Built lazily
  // because STATE.skus is populated after fetch.
  function buildMatcherRegistry() {
    const skus = STATE.skus || {};
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const RESOURCE_ID_RE = /^\/subscriptions\/[0-9a-f-]{36}\/resourceGroups\/[^\/]+\/providers\/[^\/]+\/[^\/]+\/[^\/]+/i;
    const GRAPH_URL_RE = /^https?:\/\/graph\.microsoft\.com\/(v1\.0|beta)\//i;
    const MC_RE = /^MC\d{6,}$/i;
    const AADSTS_RE = /^AADSTS\d+$/i;
    const HRESULT_RE = /^0x[0-9a-fA-F]{4,8}$/;
    const KB_RE = /^KB\d+$/i;
    return [
      { id: 'sku-guid', kind: 'sku', priority: 100, test(v) { const t = String(v || '').trim().toLowerCase(); if (!UUID_RE.test(t)) return null; if (Object.prototype.hasOwnProperty.call(skus, t)) return { kind: 'sku', input: t, slug: skus[t] }; return null; } },
      { id: 'resource-id', kind: 'resource-id', priority: 90, test(v) { const t = String(v || '').trim(); if (!RESOURCE_ID_RE.test(t)) return null; return { kind: 'resource-id', input: t }; } },
      { id: 'graph', kind: 'graph', priority: 80, test(v) { const t = String(v || '').trim(); if (!GRAPH_URL_RE.test(t)) return null; return { kind: 'graph', input: t }; } },
      { id: 'mc', kind: 'mc', priority: 70, test(v) { const t = String(v || '').trim(); if (!MC_RE.test(t)) return null; return { kind: 'mc', input: t.toUpperCase() }; } },
      { id: 'guid', kind: 'guid', priority: 50, test(v) { const t = String(v || '').trim(); if (!UUID_RE.test(t)) return null; return { kind: 'guid', input: t }; } },
      { id: 'aadsts', kind: 'aadsts', priority: 40, test(v) { const t = String(v || '').trim(); if (!AADSTS_RE.test(t)) return null; return { kind: 'aadsts', input: t.toUpperCase() }; } },
      { id: 'hresult', kind: 'hresult', priority: 30, test(v) { const t = String(v || '').trim(); if (!HRESULT_RE.test(t)) return null; return { kind: 'hresult', input: t.toLowerCase() }; } },
      { id: 'kb', kind: 'kb', priority: 20, test(v) { const t = String(v || '').trim(); if (!KB_RE.test(t)) return null; return { kind: 'kb', input: t.toUpperCase() }; } },
    ].sort((a, b) => b.priority - a.priority);
  }
  function dispatchPattern(input, registry) {
    for (const rule of registry) { const m = rule.test(input); if (m) return m; }
    return null;
  }

  // Pipe transforms — XSS-safe (dump block uses textContent), CSV neutralises
  // formula-prefix injection (=+-@). Schemas locked per block kind in plan.md.
  const CHROME_TYPES = new Set(['heading', 'dim']);
  const FORMULA_PREFIX_RE = /^[=+\-@\t\r]/;
  function csvEscape(value) {
    if (value === undefined || value === null) return '';
    let s = Array.isArray(value) ? value.join(';') : String(value);
    if (FORMULA_PREFIX_RE.test(s)) s = "'" + s;
    if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
      s = '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }
  function pipeJson(blocks) {
    const cleaned = (blocks || []).map(b => { const c = Object.assign({}, b); delete c.html; return c; });
    return [{ type: 'dump', text: JSON.stringify(cleaned, null, 2), ariaAnnounce: false }];
  }
  function pipeCsv(blocks) {
    const lines = []; let header = null;
    function setHeader(h) { if (!header) { header = h; lines.push(h.map(csvEscape).join(',')); } }
    for (const block of blocks || []) {
      if (CHROME_TYPES.has(block.type)) continue;
      if (block.type === 'man' || block.type === 'list' || block.type === 'tree') {
        setHeader(['type', 'slug', 'name', 'kind', 'domain', 'status', 'last_verified', 'url', 'plain_english']);
        const e = block.entry || {};
        lines.push([block.type, e.slug || block.slug || '', e.name || '', e.kind || '', e.domain || '', e.status || '', e.lastVerified || e.last_verified || '', e.url || '', e.plain || e.plain_english || ''].map(csvEscape).join(','));
      } else if (block.type === 'compare' && Array.isArray(block.rows)) {
        const hdr = ['row_label'].concat(block.cols ? block.cols.slice(1) : ['left', 'right']);
        setHeader(hdr);
        for (const row of block.rows) lines.push(row.map(csvEscape).join(','));
      } else if (block.type === 'errno') {
        setHeader(['type', 'code', 'short', 'plain_english', 'fix']);
        const e = block.entry || {};
        lines.push(['errno', e.code || '', e.short || e.title || '', e.plain || e.plain_english || '', e.fix || e.fix_path || ''].map(csvEscape).join(','));
      } else {
        setHeader(['type', 'text']);
        lines.push([block.type || '', block.text || ''].map(csvEscape).join(','));
      }
    }
    return [{ type: 'dump', text: lines.join('\n'), ariaAnnounce: false }];
  }
  function pipeSort(blocks, field) {
    const key = field || 'slug';
    const chrome = []; const data = [];
    for (const b of blocks || []) (CHROME_TYPES.has(b.type) ? chrome : data).push(b);
    data.sort((a, b) => {
      const av = (a.entry && a.entry[key]) || a[key] || a.text || '';
      const bv = (b.entry && b.entry[key]) || b[key] || b.text || '';
      return String(av).localeCompare(String(bv));
    });
    return [].concat(chrome, data);
  }
  function pipeHead(blocks, n) {
    const limit = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 10;
    const out = []; let dataCount = 0;
    for (const b of blocks || []) {
      if (CHROME_TYPES.has(b.type)) { out.push(b); continue; }
      if (dataCount >= limit) break;
      out.push(b); dataCount++;
    }
    return out;
  }
  function pipeTail(blocks, n) {
    const limit = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 10;
    const data = (blocks || []).filter(b => !CHROME_TYPES.has(b.type));
    return data.slice(-limit);
  }
  function pipeWc(blocks) {
    const total = (blocks || []).length; const byType = {};
    for (const b of blocks || []) byType[b.type || 'unknown'] = (byType[b.type || 'unknown'] || 0) + 1;
    const breakdown = Object.entries(byType).sort(function (a, b) { return b[1] - a[1]; }).map(function (kv) { return kv[0] + ': ' + kv[1]; }).join(', ');
    return [{ type: 'dim', text: '// total: ' + total + ' (' + breakdown + ')' }];
  }

  // ─── State ─────────────────────────────────────────────────────────────
  const STATE = {
    entries: [],
    skus:    {},
    decode:  [],
    ready:   false,
    decodeReady: false,
    history: [],
    histIdx: -1,
    draft:   '',
    trail:   [],
    firstCommandRun: false,
    bootDone: false,
  };

  // ─── XSS-safe helpers ─────────────────────────────────────────────────
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function urlSafe(href) {
    try {
      const u = new URL(href, window.location.origin);
      if (u.protocol === 'http:' || u.protocol === 'https:') return u.href;
    } catch (_) {}
    return null;
  }

  // ─── DOM refs ──────────────────────────────────────────────────────────
  const root = $('.cmd-v2-home');
  if (!root) return; // not the new homepage — bail
  const buf       = $('#cmd-buffer', root);
  const input     = $('#cmd-input', root);
  const suggest   = $('#cmd-suggest', root);
  const wrap      = $('#cmd-term-wrap', root);
  const monitor   = $('#cmd-crt', root);
  const fsToggle  = $('#cmd-fs-toggle', root);
  const clearLink = $('#cmd-clear-link', root);
  const quickStrip= $('#cmd-quick-strip', root);
  const stickyBar = $('#cmd-sticky-bar');
  const stickyBack= $('#cmd-sticky-back');
  const firstHint = $('#cmd-first-hint', root);
  const titleLabel= $('.cmd-titlebar .cmd-title-label', root);

  if (!buf || !input || !wrap) return; // template missing parts — bail

  // ─── localStorage helpers ──────────────────────────────────────────────
  function readJSON(key) {
    try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch (_) { return null; }
  }
  function writeJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) {}
  }
  // Migrate legacy bb:recent → cmd:terminal:trail one-time
  function loadTrail() {
    let t = readJSON(STORAGE.trail);
    if (!t) {
      const legacy = readJSON(STORAGE.legacy);
      if (Array.isArray(legacy)) {
        t = legacy.map(r => (r && r.slug) ? r.slug : null).filter(Boolean).slice(0, 8);
        if (t.length) writeJSON(STORAGE.trail, t);
      }
    }
    STATE.trail = Array.isArray(t) ? t : [];
  }
  function rememberTrail(slug) {
    if (!slug) return;
    STATE.trail = [slug, ...STATE.trail.filter(s => s !== slug)].slice(0, 8);
    writeJSON(STORAGE.trail, STATE.trail);
  }

  // ─── Data loading ──────────────────────────────────────────────────────
  function indexUrl() { return root.getAttribute('data-cmd-index') || '/cmd-index.json'; }
  function decodeUrl() { return root.getAttribute('data-decode-index') || '/decode/decode-index.json'; }

  function loadIndex() {
    return fetch(indexUrl(), { credentials: 'omit' })
      .then(r => r.ok ? r.json() : null)
      .then(j => {
        if (j && Array.isArray(j.entries)) {
          STATE.entries = j.entries.map(normalizeEntry);
          STATE.skus = j.skus && typeof j.skus === 'object' ? j.skus : {};
          STATE.ready = true;
          updateStatus();
        }
      })
      .catch(() => {});
  }

  function loadDecode() {
    if (STATE.decodeReady) return Promise.resolve();
    return fetch(decodeUrl(), { credentials: 'omit' })
      .then(r => r.ok ? r.json() : null)
      .then(j => {
        if (j && Array.isArray(j.entries)) {
          STATE.decode = j.entries;
          STATE.decodeReady = true;
          updateStatus();
        }
      })
      .catch(() => {});
  }

  // Normalise the live JSON shape to the renderer's expected shape
  function normalizeEntry(raw) {
    return {
      slug:         raw.slug || '',
      name:         raw.name || raw.slug || '',
      kind:         raw.kind || '',
      domain:       raw.domain || '',
      plain:        raw.plain_english || '',
      official:     raw.official || '',
      plans:        Array.isArray(raw.plans) ? raw.plans : [],
      portalUrl:    raw.portal_url || '',
      learnUrl:     raw.learn_url || '',
      watch:        raw.watch || '',
      abbreviations:Array.isArray(raw.abbreviations) ? raw.abbreviations : [],
      aliases:      Array.isArray(raw.aliases) ? raw.aliases : [],
      oldNames:     Array.isArray(raw.old_names) ? raw.old_names : [],
      synonyms:     Array.isArray(raw.synonyms) ? raw.synonyms : [],
      url:          raw.url || ('/' + (raw.slug || '') + '/'),
      status:       raw.status || 'ga',
      lastVerified: raw.last_verified || '',
      includes:     normaliseIncludes(raw.includes),
      includedIn:   normaliseIncludes(raw.included_in),
      includesSource: raw.includes_source || '',
      voice:        raw.voice && typeof raw.voice === 'object' ? raw.voice : { sush_take: '', sush_take_status: '', mascot: '' },
    };
  }

  // ─── Layered search (pure functions) ──────────────────────────────────
  function findEntry(term) {
    const t = String(term || '').toLowerCase().trim();
    if (!t || !STATE.entries.length) return null;
    for (const e of STATE.entries) if (e.slug.toLowerCase() === t) return { entry: e, via: 'slug' };
    for (const e of STATE.entries) if (e.abbreviations.some(a => String(a).toLowerCase() === t)) return { entry: e, via: 'abbreviation' };
    for (const e of STATE.entries) if (e.aliases.some(a => String(a).toLowerCase() === t)) return { entry: e, via: 'alias' };
    for (const e of STATE.entries) if (e.oldNames.some(a => String(a).toLowerCase() === t)) return { entry: e, via: 'old name' };
    for (const e of STATE.entries) if (e.synonyms.some(a => String(a).toLowerCase() === t)) return { entry: e, via: 'synonym' };
    for (const e of STATE.entries) if (e.slug.toLowerCase().startsWith(t)) return { entry: e, via: 'prefix' };
    for (const e of STATE.entries) if (e.name.toLowerCase().includes(t)) return { entry: e, via: 'substring' };
    return null;
  }
  function findErrno(code) {
    const c = String(code || '').toUpperCase().trim();
    if (!c || !STATE.decode.length) return null;
    return STATE.decode.find(e => String(e.code || '').toUpperCase() === c) ||
           STATE.decode.find(e => String(e.code || '').toUpperCase().startsWith(c)) || null;
  }

  // ─── Buffer write helpers (XSS-safe by default) ───────────────────────
  function writeRaw(html, cls) {
    const div = document.createElement('div');
    if (cls) div.className = cls;
    div.innerHTML = html; // ALL callers must pre-escape dynamic content
    buf.appendChild(div);
    buf.scrollTop = buf.scrollHeight;
    return div;
  }
  function writeText(text, cls) {
    const div = document.createElement('div');
    div.className = 'cmd-line ' + (cls || 'ok');
    div.textContent = text || '';
    buf.appendChild(div);
    buf.scrollTop = buf.scrollHeight;
  }
  function writeBlank() { writeRaw('&nbsp;', 'cmd-line'); }
  function writeEcho(cmd) {
    writeRaw('<span class="prompt">$</span><span class="text">' + esc(cmd) + '</span>', 'cmd-line echo');
  }

  // ─── Commands ─────────────────────────────────────────────────────────
  function cmdSearch(args) {
    const term = args.join(' ').trim();
    if (!term) return [{ type: 'err', text: 'usage: search <term>' }];
    if (!STATE.ready) return [{ type: 'warn', text: '// loading jargon index — try again in a sec' }];
    const hit = findEntry(term);
    if (!hit) {
      // try errno with lazy load
      if (!STATE.decodeReady) loadDecode().then(() => {
        if (findErrno(term)) {
          writeRaw('<span class="dim">// found in errno index — </span><a class="cmd-rerun" data-cmd="' + esc('decode ' + term) + '">decode ' + esc(term) + '</a>', 'cmd-line');
        }
      });
      const err = findErrno(term);
      if (err) return cmdDecode([term]);
      // No-result fallback: nudge toward `ask` for natural-language synthesis.
      return [
        { type: 'warn', text: '// no entry yet for "' + term + '"' },
        { type: 'plain', html: '<span class="dim">// not finding it? try </span><a class="cmd-rerun accent" data-cmd="' + esc('ask ' + term) + '">ask ' + esc(term) + '</a><span class="dim"> for a natural-language answer (grounded in cmd entries)</span>' },
        { type: 'plain', html: '<span class="dim">// </span><a class="cmd-link" href="https://www.aguidetocloud.com/feedback/" target="_blank" rel="noopener">tell us what to add<span class="ext">↗</span></a>' },
      ];
    }
    rememberTrail(hit.entry.slug);
    const blocks = [];
    if (hit.via !== 'slug' && hit.via !== 'prefix') {
      blocks.push({ type: 'dim', text: '// "' + term + '" matched ' + hit.via + ' → ' + hit.entry.slug });
    }
    blocks.push({ type: 'man', entry: hit.entry });
    // Weak-match nudge: when the only match is a substring (tier 6), the answer
    // may not be what the user actually wanted. Offer `ask` as a synthesis path.
    if (hit.via === 'substring') {
      blocks.push({ type: 'plain', html: '<span class="dim">// substring match. for a synthesised answer try </span><a class="cmd-rerun accent" data-cmd="' + esc('ask ' + term) + '">ask ' + esc(term) + '</a>' });
    }
    return blocks;
  }

  function cmdMan(args) {
    if (!args.length) return [{ type: 'err', text: 'usage: man <slug>' }];
    if (!STATE.ready) return [{ type: 'warn', text: '// loading — try again' }];
    const hit = findEntry(args.join(' '));
    if (!hit) return [{ type: 'err', text: 'no manual entry for ' + args.join(' ') }];
    rememberTrail(hit.entry.slug);
    return [{ type: 'man', entry: hit.entry }];
  }

  function cmdLs(args) {
    const kind = String(args[0] || 'jargon').toLowerCase();
    if (kind === 'errno' || kind === 'decode') {
      if (!STATE.decodeReady) {
        loadDecode().then(() => writeRaw('<span class="dim">// decode index loaded — re-run </span><a class="cmd-rerun" data-cmd="ls errno">ls errno</a>', 'cmd-line'));
        return [{ type: 'dim', text: '// loading errno index — re-run in a sec' }];
      }
      return [
        { type: 'dim', text: '// ' + STATE.decode.length + ' error codes' },
        ...STATE.decode.slice(0, 50).map(e => ({
          type: 'list',
          slug: e.code || '',
          text: e.short || e.title || '',
          rerun: 'decode ' + (e.code || ''),
          accent: 'err',
        })),
        ...(STATE.decode.length > 50 ? [{ type: 'dim', text: '// ...' + (STATE.decode.length - 50) + ' more' }] : []),
      ];
    }
    if (kind === 'jargon' || kind === 'all') {
      return [
        { type: 'dim', text: '// ' + STATE.entries.length + ' jargon entries' },
        ...STATE.entries.map(e => ({
          type: 'list',
          slug: e.slug,
          text: e.name + (e.oldNames.length ? '  (formerly ' + e.oldNames[0] + ')' : ''),
          rerun: 'man ' + e.slug,
          accent: 'accent',
        })),
      ];
    }
    return [{ type: 'err', text: "unknown kind: " + kind + " — try 'jargon' or 'errno'" }];
  }

  function cmdDecode(args) {
    if (!args.length) return [{ type: 'err', text: 'usage: decode <code>  ·  decode guid|resource-id|graph|sku|mc <input>' }];
    const kind = (args[0] || '').toLowerCase();
    if (kind === 'guid')        return cmdDecodeGuid(args.slice(1));
    if (kind === 'resource-id' || kind === 'resourceid') return cmdDecodeResourceId(args.slice(1));
    if (kind === 'graph')       return cmdDecodeGraph(args.slice(1));
    if (kind === 'sku')         return cmdDecodeSku(args.slice(1));
    if (kind === 'mc')          return cmdDecodeMc(args.slice(1));
    // Default: existing errno decode (AADSTS / 0x HRESULT / KB)
    const code = args.join(' ');
    if (!STATE.decodeReady) {
      loadDecode().then(() => writeRaw('<span class="dim">// decode index loaded — re-run </span><a class="cmd-rerun" data-cmd="' + esc('decode ' + code) + '">decode ' + esc(code) + '</a>', 'cmd-line'));
      return [{ type: 'dim', text: '// loading errno index…' }];
    }
    const e = findErrno(code);
    if (!e) return [
      { type: 'warn', text: '// no decode for "' + code + '"' },
      { type: 'dim',  text: '// covers AADSTS, 0x HRESULT, KB articles, MDM enrolment failures' },
      { type: 'dim',  text: '// other decode kinds: decode guid <id>  ·  decode resource-id <id>  ·  decode graph <url>  ·  decode sku <guid>  ·  decode mc <id>' },
    ];
    return [{ type: 'errno', entry: e }];
  }

  // ─── Decode handlers (Tier 1 Batch 3) ─────────────────────────────────
  function cmdDecodeGuid(args) {
    const id = (args[0] || '').toLowerCase();
    if (!id) return [{ type: 'err', text: 'usage: decode guid <uuid>' }];
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_RE.test(id)) return [{ type: 'warn', text: '// "' + id + '" doesn\'t look like a UUID' }];
    const skuSlug = STATE.skus[id];
    const blocks = [{ type: 'heading', text: '// decode guid ' + id }];
    if (skuSlug) {
      blocks.push({ type: 'plain', html: '<span class="ok">looks like a license SKU GUID — </span><a class="cmd-rerun accent" data-cmd="' + esc('man ' + skuSlug) + '">' + esc(skuSlug) + '</a>' });
      blocks.push({ type: 'dim', text: '// confirm with: Get-MgSubscribedSku | ?{ $_.SkuId -eq "' + id + '" }' });
      return blocks;
    }
    blocks.push({ type: 'plain', html: '<span class="dim">// looks like a UUID. Microsoft uses UUIDs for: tenant IDs, app registration IDs, group IDs, user object IDs, role IDs, license SKU IDs.</span>' });
    blocks.push({ type: 'dim', text: '// resolve via Graph: Get-MgOrganization -OrganizationId ' + id + '  (tenant)' });
    blocks.push({ type: 'dim', text: '// or:               Get-MgUser -UserId ' + id + '  ·  Get-MgGroup -GroupId ' + id + '  ·  Get-MgApplication -Filter "AppId eq \'' + id + '\'"' });
    return blocks;
  }
  function cmdDecodeResourceId(args) {
    const id = args.join(' ').trim();
    if (!id) return [{ type: 'err', text: 'usage: decode resource-id /subscriptions/<uuid>/resourceGroups/<rg>/providers/<rp>/<type>/<name>' }];
    const RESOURCE_ID_RE = /^\/subscriptions\/([0-9a-f-]{36})\/resourceGroups\/([^\/]+)\/providers\/([^\/]+)\/(.+)$/i;
    const m = id.match(RESOURCE_ID_RE);
    if (!m) return [{ type: 'warn', text: '// not an Azure resource ID' }];
    const sub = m[1], rg = m[2], provider = m[3], rest = m[4];
    const restParts = rest.split('/');
    const blocks = [
      { type: 'heading', text: '// decode resource-id' },
      { type: 'plain', html: '<span class="dim">\u251c\u2500</span> subscription   <span class="accent">' + esc(sub) + '</span>' },
      { type: 'plain', html: '<span class="dim">\u251c\u2500</span> resource group <span class="accent">' + esc(rg) + '</span>' },
      { type: 'plain', html: '<span class="dim">\u251c\u2500</span> provider       <span class="accent">' + esc(provider) + '</span>' },
    ];
    for (let i = 0; i + 1 < restParts.length; i += 2) {
      const last = i + 2 >= restParts.length;
      const branch = last ? '\u2514\u2500' : '\u251c\u2500';
      blocks.push({ type: 'plain', html: '<span class="dim">' + branch + '</span> ' + esc(restParts[i]) + '<span class="dim"> = </span><span class="accent">' + esc(restParts[i + 1]) + '</span>' });
    }
    blocks.push({ type: 'dim', text: '// view in portal: https://portal.azure.com/#@/resource' + id });
    return blocks;
  }
  // Static map of common Graph endpoints → required least-privilege scope (best-effort, not exhaustive)
  const GRAPH_SCOPE_MAP = [
    { re: /\/users(\/|$|\?)/i,           scope: 'User.Read.All' },
    { re: /\/groups(\/|$|\?)/i,          scope: 'Group.Read.All' },
    { re: /\/applications(\/|$|\?)/i,    scope: 'Application.Read.All' },
    { re: /\/servicePrincipals(\/|$|\?)/i, scope: 'Application.Read.All' },
    { re: /\/devices(\/|$|\?)/i,         scope: 'Device.Read.All' },
    { re: /\/directoryRoles(\/|$|\?)/i,  scope: 'RoleManagement.Read.Directory' },
    { re: /\/auditLogs\//i,              scope: 'AuditLog.Read.All' },
    { re: /\/me(\/|$|\?)/i,              scope: 'User.Read' },
    { re: /\/messages(\/|$|\?)/i,        scope: 'Mail.Read' },
    { re: /\/calendar/i,                 scope: 'Calendars.Read' },
    { re: /\/sites(\/|$|\?)/i,           scope: 'Sites.Read.All' },
    { re: /\/drives(\/|$|\?)/i,          scope: 'Files.Read.All' },
    { re: /\/teams(\/|$|\?)/i,           scope: 'Team.ReadBasic.All' },
    { re: /\/security\//i,               scope: 'SecurityEvents.Read.All' },
    { re: /\/security\/incidents/i,      scope: 'SecurityIncident.Read.All' },
    { re: /\/identityProtection\//i,     scope: 'IdentityRiskEvent.Read.All' },
    { re: /\/policies\//i,               scope: 'Policy.Read.All' },
  ];
  function cmdDecodeGraph(args) {
    const url = args.join(' ').trim();
    if (!url) return [{ type: 'err', text: 'usage: decode graph https://graph.microsoft.com/v1.0/<endpoint>' }];
    let parsed;
    try { parsed = new URL(url); } catch (_) { return [{ type: 'warn', text: '// not a valid URL' }]; }
    if (parsed.host.toLowerCase() !== 'graph.microsoft.com') return [{ type: 'warn', text: '// not a Microsoft Graph URL' }];
    const versionMatch = parsed.pathname.match(/^\/(v1\.0|beta)\//);
    const version = versionMatch ? versionMatch[1] : 'unknown';
    const endpoint = parsed.pathname.replace(/^\/(v1\.0|beta)/, '');
    let scope = 'unknown — check the endpoint docs';
    for (const m of GRAPH_SCOPE_MAP) { if (m.re.test(endpoint)) { scope = m.scope; break; } }
    return [
      { type: 'heading', text: '// decode graph' },
      { type: 'plain', html: '<span class="dim">api version: </span><span class="accent">' + esc(version) + '</span>' + (version === 'beta' ? '<span class="warn">  · beta — not for production</span>' : '') },
      { type: 'plain', html: '<span class="dim">endpoint:    </span><span class="accent">' + esc(endpoint) + '</span>' },
      { type: 'plain', html: '<span class="dim">least-priv scope (best-effort): </span><span class="ok">' + esc(scope) + '</span>' },
      { type: 'plain', html: '<span class="dim">// try in </span><a class="cmd-link" href="https://developer.microsoft.com/graph/graph-explorer?request=' + esc(encodeURIComponent(endpoint.replace(/^\//, ''))) + '" target="_blank" rel="noopener">Graph Explorer<span class="ext">\u2197</span></a>' },
    ];
  }
  function cmdDecodeSku(args) {
    const id = (args[0] || '').toLowerCase();
    if (!id) return [{ type: 'err', text: 'usage: decode sku <guid>' }];
    const slug = STATE.skus[id];
    if (!slug) return [
      { type: 'warn', text: '// no curated SKU mapping for ' + id },
      { type: 'dim',  text: '// raw lookup: Get-MgSubscribedSku | ?{ $_.SkuId -eq "' + id + '" }' },
      { type: 'plain', html: '<span class="dim">// Microsoft\'s published SKU reference: </span><a class="cmd-link" href="https://learn.microsoft.com/en-us/entra/identity/users/licensing-service-plan-reference" target="_blank" rel="noopener">licensing-service-plan-reference<span class="ext">\u2197</span></a>' },
    ];
    return [
      { type: 'heading', text: '// decode sku ' + id },
      { type: 'plain', html: '<span class="ok">resolves to: </span><a class="cmd-rerun accent" data-cmd="' + esc('man ' + slug) + '">' + esc(slug) + '</a>' },
      { type: 'plain', html: '<span class="dim">// see also: </span><a class="cmd-rerun accent" data-cmd="' + esc('tree ' + slug) + '">tree ' + esc(slug) + '</a>' },
    ];
  }
  function cmdDecodeMc(args) {
    const id = (args[0] || '').toUpperCase();
    if (!id) return [{ type: 'err', text: 'usage: decode mc MC######' }];
    if (!/^MC\d{6,}$/.test(id)) return [{ type: 'warn', text: '// "' + id + '" doesn\'t look like an MC ID' }];
    return [
      { type: 'heading', text: '// decode mc ' + id },
      { type: 'plain', html: '<span class="dim">// Message Center ID — track via the M365 Roadmap tool: </span><a class="cmd-link" href="https://www.aguidetocloud.com/m365-roadmap/?mc=' + esc(id) + '" target="_blank" rel="noopener">/m365-roadmap/<span class="ext">\u2197</span></a>' },
      { type: 'plain', html: '<span class="dim">// or admin centre: </span><a class="cmd-link" href="https://admin.microsoft.com/Adminportal/Home#/MessageCenter/:/messages/' + esc(id) + '" target="_blank" rel="noopener">admin.microsoft.com\u2026/messages/' + esc(id) + '<span class="ext">\u2197</span></a>' },
      { type: 'dim', text: '// rich Message Center decode is on the Tier 2 roadmap — meantime the M365 Roadmap tool covers most rollouts' },
    ];
  }

  // ─── Curated comparisons (real data) ─────────────────────────────────
  const CURATED_COMPARES = {
    'm365-e3:m365-e5': {
      title: 'Microsoft 365 E3 vs E5',
      cols: ['feature', 'E3', 'E5'],
      rows: [
        ['Office apps + Windows 11 Enterprise', 'yes', 'yes'],
        ['Entra ID P1 (Conditional Access · group licensing)', 'yes', 'yes'],
        ['Entra ID P2 (PIM · Identity Protection · risk-based CA)', 'no', 'yes'],
        ['Defender for Endpoint P1 (preventative)', 'yes', 'yes'],
        ['Defender for Endpoint P2 (EDR + auto-investigate)', 'no', 'yes'],
        ['Defender for Identity', 'no', 'yes'],
        ['Defender for Office 365 P2', 'no', 'yes'],
        ['Defender for Cloud Apps', 'no', 'yes'],
        ['Power BI Pro', 'no', 'yes'],
        ['Audio Conferencing + Phone System', 'no', 'yes'],
        ['Insider Risk Management + eDiscovery Premium', 'no', 'yes'],
        ['Information Protection — auto-labeling + records mgmt', 'no', 'yes'],
        ['Customer Lockbox + Privileged Access Mgmt', 'no', 'yes'],
      ],
      note: 'List price: ~$36/user/mo (E3) → ~$57/user/mo (E5). E5 bundles ~$25/mo of standalone security + voice add-ons that you can also buy a la carte.',
    },
    'entra-p1:entra-p2': {
      title: 'Microsoft Entra ID P1 vs P2',
      cols: ['feature', 'P1', 'P2'],
      rows: [
        ['Conditional Access (rules-based)', 'yes', 'yes'],
        ['Group-based licence assignment', 'yes', 'yes'],
        ['SSPR with on-prem writeback', 'yes', 'yes'],
        ['Dynamic groups', 'yes', 'yes'],
        ['MFA + Conditional Access policies', 'yes', 'yes'],
        ['Identity Protection (risk-based CA · sign-in/user risk)', 'no', 'yes'],
        ['PIM — Privileged Identity Management', 'no', 'yes'],
        ['PIM for Groups', 'no', 'yes'],
        ['Access Reviews', 'no', 'yes'],
        ['Entitlement Management (access packages)', 'no', 'yes'],
      ],
      note: 'P1 included in M365 E3/F3/Business Premium. P2 in M365 E5 + add-ons. Standalone P1 ~$6/user/mo, P2 ~$9/user/mo.',
    },
    'm365-business-premium:m365-f3': {
      title: 'Microsoft 365 Business Premium vs M365 F3 (Frontline)',
      cols: ['feature', 'BizPrem', 'F3'],
      rows: [
        ['Office desktop apps (full Word/Excel/PowerPoint)', 'yes', 'no'],
        ['Office web + mobile only', 'no', 'yes'],
        ['Email — mailbox storage', '50 GB', '2 GB'],
        ['OneDrive', '1 TB', '2 GB'],
        ['Windows 11 Enterprise', 'yes', 'no'],
        ['Windows 10/11 Enterprise E3 (kiosk)', 'no', 'yes'],
        ['Entra ID P1', 'yes', 'yes'],
        ['Intune (full)', 'yes', 'yes'],
        ['Defender for Business', 'yes', 'no'],
        ['Defender XDR (basic threat protection)', 'no', 'yes'],
        ['Teams Phone', 'no', 'no (add-on)'],
        ['Compliance — DLP, Information Protection', 'partial', 'partial'],
      ],
      note: 'Business Premium ~$22/user/mo (max 300 seats). F3 ~$8/user/mo (frontline workers — shift workers, retail, manufacturing — typically without dedicated PCs).',
    },
  };
  function compareKey(a, b) {
    return [a, b].sort().join(':');
  }

  // ─── Dynamic auto-compare (when no curated pair exists) ─────────────
  // Builds a diff table from each entry's normalized fields. Less detailed
  // than curated but better than just showing both man pages.
  function buildAutoCompare(a, b) {
    const rows = [];
    function row(label, va, vb) {
      const av = String(va || '—').slice(0, 80);
      const bv = String(vb || '—').slice(0, 80);
      rows.push([label, av, bv]);
    }
    row('name',          a.name, b.name);
    row('kind',          a.kind, b.kind);
    row('domain',        a.domain, b.domain);
    row('formerly',      a.oldNames.join(', '), b.oldNames.join(', '));
    row('abbreviations', a.abbreviations.join(', '), b.abbreviations.join(', '));
    row('plans',         a.plans.join(' · '), b.plans.join(' · '));
    row('portal',        a.portalUrl ? a.portalUrl.replace(/^https?:\/\//,'').replace(/\/$/,'') : '—',
                         b.portalUrl ? b.portalUrl.replace(/^https?:\/\//,'').replace(/\/$/,'') : '—');
    row('watch',         a.watch, b.watch);
    return {
      title: a.slug + ' vs ' + b.slug + ' (auto-built from data)',
      cols: ['field', a.slug, b.slug],
      rows,
      note: 'Auto-compare from each entry\'s fields. For a curated diff with feature-by-feature checkmarks, ask Sush to add a CURATED_COMPARES entry.',
    };
  }

  function cmdCompare(args) {
    if (args.length < 2) return [{ type: 'err', text: 'usage: compare <a> <b>' }];
    if (!STATE.ready) return [{ type: 'warn', text: '// loading — try again' }];
    const a = findEntry(args[0]);
    const b = findEntry(args[1]);
    if (!a || !b) return [{ type: 'err', text: 'compare: one or both entries not found (' + esc(args[0]) + ', ' + esc(args[1]) + ')' }];
    if (a.entry.slug === b.entry.slug) return [{ type: 'err', text: 'compare: pick two different entries' }];

    const key = compareKey(a.entry.slug, b.entry.slug);
    const curated = CURATED_COMPARES[key];

    if (curated) {
      // Map columns to the actual slug order requested by the user
      const userOrder = [a.entry.slug, b.entry.slug];
      const fixtureOrder = key.split(':');
      const isReversed = userOrder[0] !== fixtureOrder[0];
      let cols = curated.cols.slice();
      let rows = curated.rows.map(r => r.slice());
      if (isReversed) {
        cols = [cols[0], cols[2], cols[1]];
        rows = rows.map(r => [r[0], r[2], r[1]]);
      }
      return [
        { type: 'heading', text: '// ' + curated.title },
        { type: 'compare', cols: cols, rows: rows },
        { type: 'dim', text: '// ' + curated.note },
      ];
    }

    // Auto-built fallback — diff table from entry data
    const auto = buildAutoCompare(a.entry, b.entry);
    return [
      { type: 'heading', text: '// ' + auto.title },
      { type: 'compare', cols: auto.cols, rows: auto.rows },
      { type: 'dim', text: '// ' + auto.note },
    ];
  }

  function cmdHistory() {
    if (!STATE.history.length) return [{ type: 'dim', text: '// no commands yet this session' }];
    return STATE.history.map((c, i) => ({
      type: 'plain',
      html: '<span class="dim">' + esc(String(i + 1).padStart(3, ' ')) + '</span>  ' + esc(c)
    }));
  }

  function cmdWhoami() {
    if (!STATE.trail.length) return [{ type: 'dim', text: "// you haven't viewed any entries yet — try `mde` or `pim`" }];
    return [
      { type: 'heading', text: 'you are: the curious admin' },
      { type: 'ok',      text: "you've been investigating:" },
      ...STATE.trail.map(s => ({
        type: 'plain',
        html: '  <span class="key">→</span> <a class="cmd-rerun" data-cmd="' + esc('man ' + s) + '">' + esc(s) + '</a>'
      })),
      { type: 'dim',     text: '// stored in your browser only.' },
    ];
  }

  function cmdClear() { buf.innerHTML = ''; bootBannerFast(); return []; }

  function cmdCowsay(args) {
    const msg = (args.join(' ') || 'moo').slice(0, 80);
    const top = ' ' + '_'.repeat(msg.length + 2);
    const mid = '< ' + msg + ' >';
    const bot = ' ' + '-'.repeat(msg.length + 2);
    const cow = [top, mid, bot,
      '        \\   ^__^', '         \\  (oo)\\_______',
      '            (__)\\       )\\/\\', '                ||----w |',
      '                ||     ||'].join('\n');
    return [{ type: 'plain', html: '<span class="cow">' + esc(cow) + '</span>' }];
  }

  function cmdAbout() {
    return [
      { type: 'heading', text: '// about cmd' },
      { type: 'ok',  text: 'cmd is a microsoft jargon and error code decoder.' },
      { type: 'ok',  text: 'goal: stop you from googling microsoft. type a term, get plain english.' },
      { type: 'plain', html: '<span class="dim">// part of the </span><a class="cmd-link" href="https://www.aguidetocloud.com" target="_blank" rel="noopener">aguidetocloud<span class="ext">↗</span></a><span class="dim"> cosmos — 🪐 cmd is its own planet</span>' },
      { type: 'plain', html: '<span class="dim">// also available as MCP server: </span><a class="cmd-link" href="https://mcp.aguidetocloud.com" target="_blank" rel="noopener">mcp.aguidetocloud.com<span class="ext">↗</span></a><span class="dim"> — works inside Claude / ChatGPT</span>' },
      { type: 'plain', html: '<span class="dim">// </span><a class="cmd-link" href="https://www.aguidetocloud.com/feedback/" target="_blank" rel="noopener">give feedback<span class="ext">↗</span></a><span class="dim"> · </span><a class="cmd-link" href="/changelog/">/changelog/</a><span class="dim"> · </span><a class="cmd-link" href="/watch/">/watch/</a>' },
    ];
  }

  function cmdHelp(args) {
    const topic = ((args && args[0]) || '').toLowerCase();
    if (topic === 'pipes')      return cmdHelpPipes();
    if (topic === 'decode')     return cmdHelpDecode();
    if (topic === 'tree')       return cmdHelpTree();
    if (topic === 'freshness')  return cmdHelpFreshness();
    if (topic === 'csv')        return cmdHelpCsv();
    if (topic === 'why')        return cmdHelpWhy();
    const features = [
      { title: 'man pages',  cmd: 'man mde',          desc: 'full entry as a unix manual' },
      { title: 'samples',    cmd: 'samples',          desc: 'feature catalogue \u2014 click any line' },
      { title: 'ask',        cmd: 'ask whats in m365 e5', desc: 'natural-language question \u2014 grounded answer with citations' },
      { title: 'tree',       cmd: 'tree m365-e5',     desc: 'what\u2019s included / what includes this' },
      { title: 'why',        cmd: 'why mde',          desc: 'sush\u2019s honest take (when there is one)' },
      { title: 'list all',   cmd: 'all',              desc: 'list every jargon entry' },
      { title: 'list errors',cmd: 'ls errno',         desc: 'list every error code' },
      { title: 'decode',     cmd: 'decode aadsts50011',desc: 'error code \u2192 plain english' },
      { title: 'freshness',  cmd: 'freshness',        desc: 'audit \u2014 which entries need re-verifying?' },
      { title: 'pipes',      cmd: 'help pipes',       desc: 'unix-style filters (json, csv, sort, head, tail, wc, grep)' },
      { title: 'decode kinds',cmd: 'help decode',     desc: 'guid, resource-id, graph, sku, mc' },
      { title: 'aliases',    cmd: 'mdatp',            desc: 'old names resolve automatically' },
      { title: 'history',    cmd: 'history',          desc: 'cycle past commands \u00b7 \u2191\u2193' },
      { title: 'whoami',     cmd: 'whoami',           desc: 'your search trail' },
      { title: 'compare',    cmd: 'compare e3 e5',    desc: 'side-by-side (preview)' },
      { title: 'about',      cmd: 'about',            desc: 'about cmd + MCP server' },
      { title: 'clear',      cmd: 'clear',            desc: 'clear the buffer' },
    ];
    let html = '<div class="cmd-help-grid">';
    for (const f of features) {
      html += '<div class="cmd-help-card"><strong>' + esc(f.title) + '</strong><a class="cmd-rerun" data-cmd="' + esc(f.cmd) + '"><code>' + esc(f.cmd) + '</code></a><span>' + esc(f.desc) + '</span></div>';
    }
    html += '</div>';
    return [
      { type: 'heading', text: '// cmd \u2014 quick reference  (click any to run)' },
      { type: 'plain', html: html },
      { type: 'dim', text: '// keys: \u2191\u2193 history \u00b7 tab complete \u00b7 enter run \u00b7 esc clear \u00b7 ? this help' },
      { type: 'dim', text: '// shortcut: bare slug works \u2014 type "mde" instead of "search mde"' },
      { type: 'dim', text: '// deeper help: help pipes \u00b7 help decode \u00b7 help tree \u00b7 help freshness \u00b7 help csv' },
    ];
  }
  function cmdHelpPipes() {
    return [
      { type: 'heading', text: '// cmd \u2014 pipes' },
      { type: 'dim', text: '// pipe model: everything is a block. pipes filter or transform blocks.' },
      { type: 'plain', html: '<code>... | grep &lt;term&gt;</code> <span class="dim">substring filter on output text</span>' },
      { type: 'plain', html: '<code>... | json</code>           <span class="dim">serialise to pretty JSON (xss-safe dump block)</span>' },
      { type: 'plain', html: '<code>... | csv</code>            <span class="dim">tabular CSV (RFC 4180-escaped, formula prefix neutralised)</span>' },
      { type: 'plain', html: '<code>... | sort [field]</code>   <span class="dim">sort blocks by entry.&lt;field&gt; (default: slug)</span>' },
      { type: 'plain', html: '<code>... | head N</code>         <span class="dim">first N data blocks (chrome preserved at top)</span>' },
      { type: 'plain', html: '<code>... | tail N</code>         <span class="dim">last N data blocks</span>' },
      { type: 'plain', html: '<code>... | wc</code>             <span class="dim">count, broken down by type</span>' },
      { type: 'plain', html: '<code>... | history</code>        <span class="dim">extract entry.watch from a man block</span>' },
      { type: 'dim', text: '// examples: ls jargon | sort | head 5  ·  search mde | json  ·  ls jargon | wc' },
      { type: 'dim', text: '// see also: help csv (column schemas)' },
    ];
  }
  function cmdHelpDecode() {
    return [
      { type: 'heading', text: '// cmd \u2014 decode kinds' },
      { type: 'plain', html: '<code>decode &lt;code&gt;</code>             <span class="dim">errno: AADSTS / 0x HRESULT / KB / MDM</span>' },
      { type: 'plain', html: '<code>decode guid &lt;uuid&gt;</code>        <span class="dim">resolve license SKU; otherwise, hint at PowerShell lookups</span>' },
      { type: 'plain', html: '<code>decode resource-id &lt;id&gt;</code>   <span class="dim">parse Azure resource ID into components</span>' },
      { type: 'plain', html: '<code>decode graph &lt;url&gt;</code>        <span class="dim">label endpoint + suggest least-priv scope</span>' },
      { type: 'plain', html: '<code>decode sku &lt;guid&gt;</code>         <span class="dim">resolve license SKU GUID to entry</span>' },
      { type: 'plain', html: '<code>decode mc &lt;id&gt;</code>            <span class="dim">jump to M365 Roadmap tool / admin centre</span>' },
      { type: 'dim', text: '// smart-suggest fires automatically when you paste a recognisable input \u2014 click the chip to run.' },
    ];
  }
  function cmdHelpTree() {
    return [
      { type: 'heading', text: '// cmd \u2014 tree' },
      { type: 'plain', html: '<code>tree &lt;slug&gt;</code> <span class="dim">bidirectional bundling graph</span>' },
      { type: 'dim', text: '// shows what an entry includes (children via includes[]) AND what includes it (parents via included_in[]).' },
      { type: 'dim', text: '// edge notes preserve plan-tier scoping (e.g., \"Plan 2 only\").' },
      { type: 'dim', text: '// source URL links to Sush\u2019s licensing-docs page for verification.' },
      { type: 'plain', html: '<span class="dim">try: </span><a class="cmd-rerun accent" data-cmd="tree m365-e5">tree m365-e5</a><span class="dim">  \u00b7  </span><a class="cmd-rerun accent" data-cmd="tree mde">tree mde</a>' },
    ];
  }
  function cmdHelpFreshness() {
    return [
      { type: 'heading', text: '// cmd \u2014 freshness' },
      { type: 'plain', html: '<code>freshness</code> <span class="dim">audit \u2014 which entries need re-verifying?</span>' },
      { type: 'dim', text: '// last_verified = fact/source last verified (NOT entry last edited).' },
      { type: 'dim', text: '// buckets: <30d = fresh (no badge) \u00b7 30\u201390d = [stale] amber \u00b7 >90d = [ancient] amber + warning' },
      { type: 'dim', text: '// today: every entry is <30d \u2014 the freshness verb returns empty. As entries age, badges appear automatically.' },
    ];
  }
  function cmdHelpCsv() {
    return [
      { type: 'heading', text: '// cmd \u2014 csv schemas' },
      { type: 'dim', text: '// per-block-type column locks. Arrays joined with semicolons. Formula prefix (=+-@) neutralised.' },
      { type: 'plain', html: '<span class="accent">man / list / tree:</span> <code>type,slug,name,kind,domain,status,last_verified,url,plain_english</code>' },
      { type: 'plain', html: '<span class="accent">compare:</span>           <code>row_label,&lt;left_slug&gt;,&lt;right_slug&gt;</code>' },
      { type: 'plain', html: '<span class="accent">errno:</span>             <code>type,code,short,plain_english,fix</code>' },
      { type: 'plain', html: '<span class="accent">plain / dim / err:</span> <code>type,text</code>' },
    ];
  }
  function cmdHelpWhy() {
    return [
      { type: 'heading', text: '// cmd \u2014 why' },
      { type: 'plain', html: '<code>why &lt;slug&gt;</code> <span class="dim">sush\u2019s honest take, when there is one</span>' },
      { type: 'dim', text: '// voice silence rule: man <slug> appends a take ONLY when one exists (never \"no take recorded\").' },
      { type: 'dim', text: '// why <slug> standalone: shows mascot + take + [spicy/neutral] badge, OR a dim \"no take yet\" line.' },
    ];
  }

  // ─── samples: discoverable feature catalogue (Tier 1 onboarding) ──────
  // First-time visitors won't read `help`. They'll glance at the prompt and
  // either type or leave. `samples` is the discoverable "everything cmd can
  // do" menu — categorised, click-to-run, no chrome.
  function cmdSamples() {
    const sections = [
      {
        title: '\ud83d\udcd6  Decode an acronym',
        rows: [
          { cmd: 'mde',                desc: 'Microsoft Defender for Endpoint' },
          { cmd: 'pim',                desc: 'Privileged Identity Management' },
          { cmd: 'man entra-p2',       desc: 'full record for Entra ID P2' },
        ],
      },
      {
        title: '\ud83c\udf33  Explore a license',
        rows: [
          { cmd: 'tree m365-e5',       desc: 'what\'s bundled in E5 \u2014 every component clickable' },
          { cmd: 'tree mde',           desc: 'reverse \u2014 what licenses include MDE' },
          { cmd: 'compare e3 e5',      desc: 'side-by-side feature diff' },
        ],
      },
      {
        title: '\ud83e\udd16  Ask in plain english (NEW)',
        rows: [
          { cmd: 'ask whats included in m365 e5',                       desc: 'grounded answer with citations' },
          { cmd: 'ask difference between mde plan 1 and plan 2',        desc: 'comparison-style answer' },
          { cmd: 'ask what license do i need for conditional access',   desc: 'licensing recommendation' },
        ],
      },
      {
        title: '\ud83d\udd0d  Decode error codes & ids',
        rows: [
          { cmd: 'decode AADSTS50058',                desc: 'sign-in error \u2014 plain english + fix' },
          { cmd: 'decode 0xC0000005',                 desc: 'HRESULT' },
          { cmd: 'decode resource-id /subscriptions/06ebc4ee-1bb5-47dd-8120-11324bc54e06/resourceGroups/rg-prod/providers/Microsoft.Web/sites/myapp', desc: 'parse Azure resource ID into segments' },
        ],
      },
      {
        title: '\ud83d\udd27  Power pipes (UNIX-style)',
        rows: [
          { cmd: 'search defender | json',     desc: 'structured JSON dump' },
          { cmd: 'ls jargon | sort | head 5',  desc: 'alphabetical top-5' },
          { cmd: 'ls jargon | wc',             desc: 'count by type' },
        ],
      },
      {
        title: '\ud83d\udc40  Sush\'s take + freshness',
        rows: [
          { cmd: 'why mde',           desc: 'Sush\'s honest take on MDE (when there is one)' },
          { cmd: 'freshness',         desc: 'which entries need re-verifying' },
          { cmd: 'help',              desc: 'full reference + progressive sub-helps' },
        ],
      },
    ];
    const blocks = [
      { type: 'heading', text: '// cmd \u2014 samples  (click any line to run)' },
      { type: 'dim',     text: '// 6 categories. tap whichever interests you. when done, just type to search.' },
    ];
    for (const sec of sections) {
      blocks.push({ type: 'heading', text: '   ' + sec.title });
      for (const row of sec.rows) {
        blocks.push({
          type: 'plain',
          html: '      <span class="dim">$</span> <a class="cmd-rerun accent cmd-samples-cmd" data-cmd="' + esc(row.cmd) + '"><code>' + esc(row.cmd.length > 78 ? row.cmd.slice(0, 75) + '\u2026' : row.cmd) + '</code></a><span class="cmd-samples-desc dim">  \u00b7  ' + esc(row.desc) + '</span>',
        });
      }
    }
    blocks.push({ type: 'dim', text: '// keys \u2191\u2193 cycle history \u00b7 tab to complete \u00b7 esc to clear input \u00b7 \u26a1 just type and press enter' });
    return blocks;
  }
  function cmdTree(args) {
    if (!args.length) return [{ type: 'err', text: 'usage: tree <slug>' }];
    if (!STATE.ready) return [{ type: 'warn', text: '// loading — try again' }];
    const hit = findEntry(args.join(' '));
    if (!hit) return [{ type: 'err', text: 'no entry for ' + args.join(' ') }];
    const entry = hit.entry;
    rememberTrail(entry.slug);
    const children = entry.includes || [];
    const parents = entry.includedIn || [];
    if (!children.length && !parents.length) {
      return [
        { type: 'heading', text: '// tree ' + entry.slug },
        { type: 'dim', text: '// no tree relationship for this kind \u2014 try `man ' + entry.slug + '`' },
      ];
    }
    const blocks = [{ type: 'heading', text: '// tree ' + entry.slug + '  \u00b7  ' + entry.name }];
    function renderEdge(edge, last, rerunPrefix) {
      const branch = last ? '\u2514\u2500 ' : '\u251c\u2500 ';
      const childEntry = STATE.entries.find(e => e.slug === edge.slug);
      const childName = childEntry ? childEntry.name : edge.slug;
      const noteText = edge.note ? '  \u00b7 ' + edge.note : '';
      return {
        type: 'plain',
        html: '<span class="dim">' + branch + '</span><a class="cmd-rerun accent" data-cmd="' + esc(rerunPrefix + edge.slug) + '">' + esc(edge.slug) + '</a><span class="dim">  \u00b7 ' + esc(childName) + '</span>' + (noteText ? '<span class="cmd-tree-note">' + esc(noteText) + '</span>' : ''),
      };
    }
    if (children.length) {
      blocks.push({ type: 'dim', text: '// includes (' + children.length + ' direct ' + (children.length === 1 ? 'child' : 'children') + ')' });
      children.forEach((child, i) => blocks.push(renderEdge(child, i === children.length - 1, 'man ')));
    }
    if (parents.length) {
      blocks.push({ type: 'dim', text: '// included_in (' + parents.length + ' direct ' + (parents.length === 1 ? 'parent' : 'parents') + ')' });
      parents.forEach((parent, i) => blocks.push(renderEdge(parent, i === parents.length - 1, 'tree ')));
    }
    if (entry.includesSource) {
      blocks.push({ type: 'plain', html: '<span class="dim">// source: </span><a class="cmd-link" href="' + esc(entry.includesSource) + '" target="_blank" rel="noopener">' + esc(entry.includesSource) + '<span class="ext">\u2197</span></a>' });
    }
    return blocks;
  }

  // ─── why: surface sush's voice take (silence > forced fit) ─────────────
  function cmdWhy(args) {
    if (!args.length) return [{ type: 'err', text: 'usage: why <slug>' }];
    if (!STATE.ready) return [{ type: 'warn', text: '// loading — try again' }];
    const hit = findEntry(args.join(' '));
    if (!hit) return [{ type: 'err', text: 'no entry for ' + args.join(' ') }];
    const entry = hit.entry;
    rememberTrail(entry.slug);
    const v = entry.voice || {};
    const blocks = [{ type: 'heading', text: '// why ' + entry.slug + '  \u00b7  ' + entry.name }];
    if (v.mascot) {
      blocks.push({ type: 'plain', html: '<span class="dim">// mascot: </span>' + esc(v.mascot) });
    }
    if (v.sush_take) {
      const isSpicy = v.sush_take_status === 'spicy';
      const cls = isSpicy ? 'cmd-take spicy' : 'cmd-take neutral';
      const badge = isSpicy ? '<span class="cmd-take-badge spicy">[spicy]</span>' : '<span class="cmd-take-badge neutral">[neutral]</span>';
      blocks.push({
        type: 'plain',
        html: '<span class="' + cls + '">// sush take: ' + esc(v.sush_take) + '</span> ' + badge,
      });
    } else {
      // Voice silence rule (brain-bar-lessons.md lesson #6): no fake take. Dim line, never styled as a take.
      blocks.push({ type: 'dim', text: '// no honest take recorded yet for this slug. silence > forced fit.' });
    }
    return blocks;
  }

  // ─── ask: natural-language question with grounded citations (Tier ASK) ──
  function cmdAsk(args) {
    const q = (args || []).join(' ').trim();
    if (!q) return [{ type: 'err', text: 'usage: ask <natural language question>  ·  e.g. ask whats the difference between mde plan 1 and plan 2' }];
    const askUrl = 'https://mcp.aguidetocloud.com/ask';
    fetch(askUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'omit',
      body: JSON.stringify({ question: q }),
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) {
          writeRaw('<span class="warn">// ask failed \u2014 try again, or use `search` to browse manually</span>', 'cmd-line');
          return;
        }
        const answer = String(data.answer || '');
        const entriesUsed = Array.isArray(data.entries_used) ? data.entries_used : [];
        // Linkify [slug] citations to clickable rerun buttons.
        const safe = esc(answer);
        const linkified = safe.replace(/\[([a-z0-9][a-z0-9\-]*)\]/g, function (_m, slug) {
          return '<a class="cmd-rerun accent" data-cmd="man ' + esc(slug) + '">[' + esc(slug) + ']</a>';
        });
        let html = '<div class="cmd-ask-answer">' + linkified + '</div>';
        if (entriesUsed.length) {
          html += '<div class="cmd-ask-meta dim">// entries given as context: ' +
            entriesUsed.map(function (e) { return '<a class="cmd-rerun" data-cmd="man ' + esc(e.slug) + '">' + esc(e.slug) + '</a>'; }).join(', ') +
            '</div>';
        }
        if (data.model) {
          html += '<div class="cmd-ask-meta dim">// model: ' + esc(data.model) + '  \u00b7  grounded: each [slug] is a real cmd entry</div>';
        }
        writeRaw(html, 'cmd-ask');
      })
      .catch(function (err) {
        writeRaw('<span class="warn">// ask failed: ' + esc(String(err && err.message || err)) + '</span>', 'cmd-line');
      });
    return [
      { type: 'heading', text: '// ask: ' + q },
      { type: 'dim', text: '// thinking via Cloudflare Workers AI \u2014 the answer will append below in 2-5 seconds...' },
      { type: 'dim', text: '// grounded in cmd entries \u00b7 every [slug] in the answer is clickable' },
    ];
  }
  function cmdFreshness() {
    if (!STATE.ready) return [{ type: 'warn', text: '// loading — try again' }];
    const today = todayIso();
    const stale = [];
    const ancient = [];
    for (const e of STATE.entries) {
      const bucket = classifyFreshness(e.lastVerified, today);
      const d = daysAgo(e.lastVerified, today);
      if (bucket === 'stale') stale.push({ entry: e, days: d });
      if (bucket === 'ancient') ancient.push({ entry: e, days: d });
    }
    if (!stale.length && !ancient.length) {
      return [
        { type: 'heading', text: '// freshness audit' },
        { type: 'dim', text: '// all ' + STATE.entries.length + ' entries verified within 30 days \u2014 no stale or ancient entries' },
        { type: 'dim', text: '// freshness shows up here automatically as entries naturally age past 30d (stale) and 90d (ancient)' },
      ];
    }
    const blocks = [{ type: 'heading', text: '// freshness audit' }];
    if (ancient.length) {
      blocks.push({ type: 'dim', text: '// ancient (>90 days) \u2014 ' + ancient.length });
      ancient.forEach(({ entry, days }) => {
        blocks.push({
          type: 'plain',
          html: '<span class="cmd-fresh-warn" aria-hidden="true">\u26a0</span> <a class="cmd-rerun warn" data-cmd="' + esc('man ' + entry.slug) + '">' + esc(entry.slug) + '</a><span class="dim">  \u00b7 ' + esc(entry.name) + '  \u00b7 ancient: verified ' + days + 'd ago</span>',
        });
      });
    }
    if (stale.length) {
      blocks.push({ type: 'dim', text: '// stale (30\u201390 days) \u2014 ' + stale.length });
      stale.forEach(({ entry, days }) => {
        blocks.push({
          type: 'plain',
          html: '<a class="cmd-rerun warn" data-cmd="' + esc('man ' + entry.slug) + '">' + esc(entry.slug) + '</a><span class="dim">  \u00b7 ' + esc(entry.name) + '  \u00b7 stale: verified ' + days + 'd ago</span>',
        });
      });
    }
    return blocks;
  }

  const COMMANDS = {
    search: cmdSearch, s: cmdSearch,
    man:    cmdMan,
    ls:     cmdLs, list: cmdLs,
    decode: cmdDecode, d: cmdDecode,
    compare:cmdCompare, cmp: cmdCompare, diff: cmdCompare,
    tree:   cmdTree,
    why:    cmdWhy,
    freshness: cmdFreshness, fresh: cmdFreshness,
    ask:    cmdAsk,
    samples: cmdSamples, examples: cmdSamples, demo: cmdSamples, tour: cmdSamples,
    history:cmdHistory, hist: cmdHistory,
    whoami: cmdWhoami, who: cmdWhoami,
    clear:  cmdClear, cls: cmdClear,
    cowsay: cmdCowsay,
    about:  cmdAbout,
    all:    function() { return cmdLs(['jargon']); },
    help:   cmdHelp, '?': cmdHelp,
    watch:  function() { return [
      { type: 'heading', text: '// watch — microsoft rebrand & GA radar' },
      { type: 'plain', html: '<span class="dim">// see </span><a class="cmd-link" href="/watch/">/watch/</a><span class="dim"> for the full curated list</span>' },
    ]; },
    changelog: function() { return [
      { type: 'heading', text: '// changelog — what cmd shipped' },
      { type: 'plain', html: '<span class="dim">// see </span><a class="cmd-link" href="/changelog/">/changelog/</a><span class="dim"> for the full curated list</span>' },
    ]; },
    log: function() { return COMMANDS.changelog(); },
  };

  // ─── Pipes ─────────────────────────────────────────────────────────────
  function applyPipe(blocks, filter) {
    const parts = filter.trim().split(/\s+/);
    const verb = parts[0];
    if (verb === 'grep') {
      const needle = parts.slice(1).join(' ').toLowerCase();
      if (!needle) return [{ type: 'err', text: 'usage: ... | grep <term>' }];
      return blocks.filter(b => {
        const t = String(b.text || b.html || '').toLowerCase();
        return t.includes(needle);
      });
    }
    if (verb === 'history') {
      // Pull the watch field if there's a man block — that's the closest to "history" in real data
      const manBlock = blocks.find(b => b.type === 'man');
      if (manBlock && manBlock.entry && manBlock.entry.watch) {
        return [
          { type: 'heading', text: '// ' + manBlock.entry.slug + ' — watch / on-the-radar' },
          { type: 'plain', html: '<span class="ok">' + esc(manBlock.entry.watch) + '</span>' },
        ];
      }
      return [{ type: 'dim', text: '// no rebrand-watch note for this entry yet' }];
    }
    if (verb === 'json')  return pipeJson(blocks);
    if (verb === 'csv')   return pipeCsv(blocks);
    if (verb === 'sort')  return pipeSort(blocks, parts[1]);
    if (verb === 'head')  return pipeHead(blocks, parseInt(parts[1] || '10', 10));
    if (verb === 'tail')  return pipeTail(blocks, parseInt(parts[1] || '10', 10));
    if (verb === 'wc')    return pipeWc(blocks);
    return [{ type: 'err', text: 'unknown pipe filter: ' + verb + '  ·  try grep / json / csv / sort / head / tail / wc / history' }];
  }

  // ─── Render ────────────────────────────────────────────────────────────
  function renderBlocks(blocks) {
    if (!blocks || !blocks.length) return;
    const group = document.createElement('div');
    group.className = 'cmd-group';
    for (const b of blocks) group.appendChild(renderBlock(b));
    buf.appendChild(group);
    buf.scrollTop = buf.scrollHeight;
  }

  function renderBlock(b) {
    const div = document.createElement('div');
    if (b.type === 'man') {
      const e = b.entry;
      div.className = 'cmd-man';
      let dl = '<dt>plain english</dt><dd>' + esc(e.plain) + '</dd>';
      if (e.oldNames.length)      dl += '<dt>formerly</dt><dd>' + e.oldNames.map(x => '<a class="cmd-rerun warn" data-cmd="' + esc(x) + '">' + esc(x) + '</a>').join('<span class="dim">, </span>') + '</dd>';
      if (e.aliases.length)       dl += '<dt>also known as</dt><dd>' + e.aliases.map(a => '<a class="cmd-rerun dim" data-cmd="' + esc(a) + '">' + esc(a) + '</a>').join('<span class="dim"> · </span>') + '</dd>';
      if (e.abbreviations.length) dl += '<dt>abbreviation</dt><dd>' + e.abbreviations.map(esc).join(' · ') + '</dd>';
      if (e.plans.length)         dl += '<dt>plans</dt><dd>' + e.plans.map(p => '<div>' + esc(p) + '</div>').join('') + '</dd>';
      const portalSafe = urlSafe(e.portalUrl);
      if (portalSafe)             dl += '<dt>portal</dt><dd><a class="cmd-link" href="' + esc(portalSafe) + '" target="_blank" rel="noopener">' + esc(e.portalUrl) + '<span class="ext">↗</span></a></dd>';
      const learnSafe = urlSafe(e.learnUrl);
      if (learnSafe)              dl += '<dt>learn more</dt><dd><a class="cmd-link" href="' + esc(learnSafe) + '" target="_blank" rel="noopener">' + esc(e.learnUrl) + '<span class="ext">↗</span></a></dd>';
      if (e.kind)                 dl += '<dt>kind</dt><dd><span class="dim">' + esc(e.kind) + (e.domain ? ' · ' + esc(e.domain) : '') + '</span></dd>';
      if (e.watch)                dl += '<dt>watch</dt><dd><span class="warn">' + esc(e.watch) + '</span></dd>';
      // tree breadcrumb if entry has bundling relationships
      if ((e.includes && e.includes.length) || (e.includedIn && e.includedIn.length)) {
        dl += '<dt>tree</dt><dd><a class="cmd-rerun accent" data-cmd="' + esc('tree ' + e.slug) + '">tree ' + esc(e.slug) + '</a><span class="dim">  ·  ' + (e.includes ? e.includes.length : 0) + ' children · ' + (e.includedIn ? e.includedIn.length : 0) + ' parents</span></dd>';
      }
      dl += '<dt>full entry</dt><dd><a class="cmd-link" href="' + esc(e.url) + '">' + esc(e.url) + '</a></dd>';
      // Freshness badge in heading row (text-labelled for a11y; >30d only — silence under 30d)
      const fb = classifyFreshness(e.lastVerified, todayIso());
      const dAgo = daysAgo(e.lastVerified, todayIso());
      let freshBadge = '';
      if (fb === 'ancient') freshBadge = ' <span class="cmd-fresh-badge ancient" aria-label="ancient: verified ' + dAgo + ' days ago">[ancient \u26a0]</span>';
      else if (fb === 'stale') freshBadge = ' <span class="cmd-fresh-badge stale" aria-label="stale: verified ' + dAgo + ' days ago">[stale]</span>';
      div.innerHTML = '<h3>' + esc(e.slug) + freshBadge + '  <span class="cmd-man-name">·  ' + esc(e.name) + '</span></h3><dl>' + dl + '</dl>';
      // Voice silence rule: ONLY append a sush_take line when one actually exists.
      // No "no take recorded" filler — that's reserved for explicit `why` calls.
      if (e.voice && e.voice.sush_take) {
        const isSpicy = e.voice.sush_take_status === 'spicy';
        const takeCls = isSpicy ? 'cmd-take spicy' : 'cmd-take neutral';
        const takeDiv = document.createElement('div');
        takeDiv.className = takeCls;
        takeDiv.textContent = '// sush take: ' + e.voice.sush_take;
        div.appendChild(takeDiv);
      }
      return div;
    }
    if (b.type === 'errno') {
      const e = b.entry;
      div.className = 'cmd-man';
      const portalCell = (e.portal_url || e.portal)
        ? (function () {
            const safe = urlSafe(e.portal_url || e.portal);
            return safe
              ? '<a class="cmd-link" href="' + esc(safe) + '" target="_blank" rel="noopener">' + esc(e.portal_url || e.portal) + '<span class="ext">↗</span></a>'
              : '<span class="dim">' + esc(e.portal_url || e.portal) + '</span>';
          })()
        : '<span class="dim">—</span>';
      div.innerHTML = '<h3 class="cmd-err-h3">' + esc(e.code || '') + '  <span class="cmd-man-name">·  ' + esc(e.short || e.title || '') + '</span></h3>' +
        '<dl><dt>plain english</dt><dd>' + esc(e.plain || e.plain_english || '') + '</dd>' +
        '<dt>fix</dt><dd>' + esc(e.fix || e.fix_path || '') + '</dd>' +
        '<dt>portal</dt><dd>' + portalCell + '</dd></dl>';
      return div;
    }
    if (b.type === 'list') {
      div.className = 'cmd-line';
      div.innerHTML = '  <a class="cmd-rerun ' + (b.accent || 'accent') + '" data-cmd="' + esc(b.rerun || b.slug) + '">' + esc(b.slug) + '</a>'
                    + '<span class="dim">  ·  </span>' + esc(b.text);
      return div;
    }
    if (b.type === 'compare') {
      div.className = 'cmd-line';
      let html = '<table class="cmd-cmp"><thead><tr>';
      for (const c of b.cols) html += '<th>' + esc(c) + '</th>';
      html += '</tr></thead><tbody>';
      for (const r of b.rows) {
        html += '<tr>';
        r.forEach((cell, i) => {
          if (i === 0) html += '<td class="ok">' + esc(cell) + '</td>';
          else if (cell === 'yes') html += '<td class="yes">✓</td>';
          else if (cell === 'no')  html += '<td class="no">—</td>';
          else html += '<td>' + esc(cell) + '</td>';
        });
        html += '</tr>';
      }
      html += '</tbody></table>';
      div.innerHTML = html;
      return div;
    }
    if (b.type === 'plain') {
      div.className = 'cmd-line';
      div.innerHTML = b.html || '';
      return div;
    }
    if (b.type === 'dump') {
      // XSS-safe rendering: textContent only, no innerHTML. Used by | json / | csv pipes.
      // ariaAnnounce=false suppresses screen reader announcement for large dumps.
      div.className = 'cmd-dump';
      if (b.ariaAnnounce === false) div.setAttribute('aria-live', 'off');
      const pre = document.createElement('pre');
      pre.className = 'cmd-dump-pre';
      pre.textContent = b.text || '';
      div.appendChild(pre);
      // Copy-friendly affordance — small dim button using event delegation
      const copyBtn = document.createElement('button');
      copyBtn.className = 'cmd-dump-copy';
      copyBtn.type = 'button';
      copyBtn.textContent = 'copy';
      copyBtn.setAttribute('aria-label', 'copy dump to clipboard');
      copyBtn.onclick = function () {
        try {
          navigator.clipboard.writeText(b.text || '').then(
            function () { copyBtn.textContent = 'copied'; setTimeout(function () { copyBtn.textContent = 'copy'; }, 1500); },
            function () { copyBtn.textContent = 'fail'; }
          );
        } catch (_) { copyBtn.textContent = 'fail'; }
      };
      div.appendChild(copyBtn);
      return div;
    }
    div.className = 'cmd-line ' + (b.type || 'ok');
    div.textContent = b.text || '';
    return div;
  }

  // ─── Execute (with permalinks + quick strip + dynamic title) ──────────
  function execute(line) {
    line = String(line || '').trim();
    if (!line) return;
    STATE.history.push(line);
    STATE.histIdx = -1;
    const wasFirstThisSession = !STATE.firstCommandRun;
    STATE.firstCommandRun = true;
    updateStatus();
    showQuickStrip();

    writeEcho(line);

    const parts = line.split('|').map(s => s.trim()).filter(Boolean);
    const head = parts[0]; const filters = parts.slice(1);
    const tokens = head.split(/\s+/);
    const verb = tokens[0].toLowerCase();
    const args = tokens.slice(1);

    let blocks;
    if (Object.prototype.hasOwnProperty.call(COMMANDS, verb)) {
      blocks = COMMANDS[verb](args) || [];
    } else {
      blocks = cmdSearch(tokens);
    }
    for (const f of filters) blocks = applyPipe(blocks, f);
    renderBlocks(blocks);

    // Post-first-command nudge — appears once per session, after the very
    // first user command. Skip if their first command was already discovery
    // (samples / help / ? / about) so we don't double-up.
    if (wasFirstThisSession) {
      const discoveryVerbs = new Set(['samples', 'examples', 'demo', 'tour', 'help', '?', 'about', 'clear', 'cls']);
      if (!discoveryVerbs.has(verb)) {
        writeBlank();
        writeRaw('<span class="cmd-nudge dim">// nice. cmd does a lot more \u2014 try </span><a class="cmd-rerun key cmd-nudge-link" data-cmd="samples">samples</a><span class="cmd-nudge dim"> for the full feature catalogue.</span>', 'cmd-line cmd-first-nudge');
      }
    }

    updateTitleBar(line);
    try {
      const params = new URLSearchParams();
      if (line !== 'clear' && line !== '?' && line !== 'help') params.set('q', line);
      const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
      history.replaceState(null, '', newUrl);
    } catch (_) {}
  }

  // ─── Suggest + completion ─────────────────────────────────────────────
  function allCompletions() {
    const verbs = Object.keys(COMMANDS).filter(v => v.length > 1);
    const slugs = STATE.entries.map(e => e.slug);
    const codes = STATE.decode.map(e => String(e.code || '').toLowerCase());
    return Array.from(new Set([...verbs, ...slugs, ...codes])).filter(Boolean);
  }
  function refreshSuggestions() {
    if (!suggest) return;
    suggest.innerHTML = '';
    const v = input.value.trim();
    if (!v) return;
    const matches = [];
    // Ordered matcher: SKU GUID > resource ID > graph URL > MC ID > generic UUID > AADSTS/HRESULT/KB
    if (!v.toLowerCase().startsWith('decode')) {
      const registry = buildMatcherRegistry();
      const m = dispatchPattern(v, registry);
      if (m) {
        if (m.kind === 'sku')         matches.push('decode sku ' + v);
        else if (m.kind === 'resource-id') matches.push('decode resource-id ' + v);
        else if (m.kind === 'graph')  matches.push('decode graph ' + v);
        else if (m.kind === 'mc')     matches.push('decode mc ' + v);
        else if (m.kind === 'guid')   matches.push('decode guid ' + v);
        else                          matches.push('decode ' + v); // aadsts / hresult / kb
      }
    }
    // Natural-language detection — fires "ask <input>" when the input looks
    // like a question rather than a slug. Catches users who type "what is X"
    // expecting an answer, without knowing the `ask` verb exists.
    {
      const tokens = v.split(/\s+/);
      const lc = v.toLowerCase();
      const KNOWN_VERBS = new Set(['search','s','man','ls','list','decode','d','compare','cmp','diff','tree','why','freshness','fresh','ask','samples','examples','demo','tour','history','hist','whoami','who','clear','cls','cowsay','about','all','help','watch','changelog','log']);
      const startsWithVerb = KNOWN_VERBS.has(tokens[0].toLowerCase()) || lc.startsWith('?');
      const QUESTION_WORDS = /^(what|how|why|when|which|can|should|is|are|does|do|will|would|could)\b/i;
      const hasQuestionWord = QUESTION_WORDS.test(lc);
      const endsWithQuestion = lc.endsWith('?');
      const hasComparator = /\b(vs|versus|difference|compare)\b/i.test(lc);
      const looksLikeQuestion =
        !startsWithVerb &&
        tokens.length >= 4 &&
        (hasQuestionWord || endsWithQuestion || hasComparator);
      if (looksLikeQuestion) {
        matches.push('ask ' + v);
      }
    }
    const tokens = v.split(/\s+/);
    if (tokens.length === 2 && STATE.ready) {
      const a = findEntry(tokens[0]); const b = findEntry(tokens[1]);
      if (a && b && a.entry.slug !== b.entry.slug) matches.push('compare ' + a.entry.slug + ' ' + b.entry.slug);
    }
    const last = (tokens[tokens.length - 1] || '').toLowerCase();
    if (last) matches.push(...allCompletions().filter(x => x.startsWith(last)).slice(0, 6));
    const seen = new Set();
    const final = matches.filter(m => { if (seen.has(m)) return false; seen.add(m); return true; }).slice(0, 8);
    if (!final.length) return;
    for (const m of final) {
      const chip = document.createElement('span');
      chip.className = 'cmd-schip';
      chip.textContent = m;
      chip.onclick = () => {
        if (m.includes(' ')) input.value = m + ' ';
        else { const t = input.value.split(/\s+/); t[t.length - 1] = m; input.value = t.join(' ') + ' '; }
        input.focus(); suggest.innerHTML = '';
      };
      suggest.appendChild(chip);
    }
  }
  function tabComplete() {
    const v = input.value;
    if (!v) return;
    const tokens = v.split(/\s+/);
    const last = (tokens[tokens.length - 1] || '').toLowerCase();
    if (!last) return;
    const matches = allCompletions().filter(x => x.startsWith(last));
    if (!matches.length) return;
    if (matches.length === 1) {
      tokens[tokens.length - 1] = matches[0];
      input.value = tokens.join(' ') + ' ';
      suggest.innerHTML = '';
      return;
    }
    let prefix = matches[0];
    for (const m of matches) while (!m.startsWith(prefix)) prefix = prefix.slice(0, -1);
    if (prefix.length > last.length) {
      tokens[tokens.length - 1] = prefix;
      input.value = tokens.join(' ');
    }
    refreshSuggestions();
  }
  function histPrev() {
    if (!STATE.history.length) return;
    if (STATE.histIdx === -1) STATE.draft = input.value;
    STATE.histIdx = Math.min(STATE.history.length - 1, STATE.histIdx + 1);
    input.value = STATE.history[STATE.history.length - 1 - STATE.histIdx];
  }
  function histNext() {
    if (STATE.histIdx === -1) return;
    STATE.histIdx -= 1;
    if (STATE.histIdx === -1) input.value = STATE.draft;
    else input.value = STATE.history[STATE.history.length - 1 - STATE.histIdx];
  }

  // ─── Fullscreen + power-cycle ──────────────────────────────────────────
  function setFullscreen(on) {
    const led = $('.cmd-led', root);
    wrap.classList.add('cmd-power-cycle');
    if (led) led.classList.add('cycling');
    setTimeout(() => {
      wrap.classList.remove('cmd-power-cycle');
      if (led) led.classList.remove('cycling');
    }, 600);
    if (on) {
      wrap.classList.remove('embed');
      wrap.classList.add('fullscreen');
      if (monitor) monitor.classList.add('fullscreen-active');
      document.body.classList.add('cmd-fs-locked');
      if (fsToggle) fsToggle.textContent = '↙ exit full-screen';
    } else {
      wrap.classList.remove('fullscreen');
      wrap.classList.add('embed');
      if (monitor) monitor.classList.remove('fullscreen-active');
      document.body.classList.remove('cmd-fs-locked');
      if (fsToggle) fsToggle.textContent = '⤢ open full-screen';
      setTimeout(() => wrap.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
    input.focus();
  }

  // ─── Status + title bar + quick strip + sticky bar ────────────────────
  function updateStatus() {
    const counts = $('#cmd-stat-counts', root);
    const hist   = $('#cmd-stat-hist', root);
    if (counts) counts.innerHTML = '<span class="lbl">data</span>' + STATE.entries.length + ' jargon · ' + STATE.decode.length + ' errno';
    if (hist)   hist.innerHTML   = '<span class="lbl">hist</span>' + STATE.history.length;
  }
  function updateTitleBar(line) {
    if (!titleLabel) return;
    const slug = (line || 'terminal').split(/\s+/).slice(-1)[0];
    titleLabel.innerHTML = 'cmd <span class="cwd">:: ~/' + esc(slug) + '</span>';
  }
  function showQuickStrip() {
    if (quickStrip && !quickStrip.classList.contains('visible')) quickStrip.classList.add('visible');
  }

  // Quick-strip + top-nav + sticky bar wiring
  if (quickStrip) {
    quickStrip.addEventListener('click', (e) => {
      const t = e.target.closest('.cmd-quick-cmd'); if (!t) return;
      e.preventDefault();
      const cmd = t.dataset.cmd || t.textContent.trim(); if (!cmd) return;
      input.focus();
      execute(cmd);
    });
  }
  document.querySelectorAll('.cmd-topnav-cmd').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const cmd = a.dataset.cmd; if (!cmd) return;
      input.focus();
      execute(cmd);
    });
  });
  let stickyTicking = false;
  window.addEventListener('scroll', () => {
    if (stickyTicking) return;
    stickyTicking = true;
    requestAnimationFrame(() => {
      if (wrap && stickyBar) {
        const rect = wrap.getBoundingClientRect();
        if (rect.bottom < 24) stickyBar.classList.add('visible');
        else stickyBar.classList.remove('visible');
      }
      stickyTicking = false;
    });
  });
  if (stickyBack) stickyBack.addEventListener('click', (e) => {
    e.preventDefault();
    wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => input.focus(), 400);
  });
  if (firstHint) {
    const hide = () => firstHint.classList.add('gone');
    setTimeout(hide, 5500);
    input.addEventListener('focus', hide, { once: true });
    input.addEventListener('input', hide, { once: true });
  }

  // Buffer click delegation — click slugs/aliases to re-run
  buf.addEventListener('click', (e) => {
    const t = e.target.closest('.cmd-rerun');
    if (!t) return;
    const cmd = t.dataset.cmd || t.textContent.trim();
    if (!cmd) return;
    e.preventDefault();
    input.focus();
    execute(cmd);
  });
  // Refocus on click in wrap (terminal feel)
  wrap.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
    if (e.target.closest('.cmd-rerun, .cmd-link')) return;
    if (window.getSelection && String(window.getSelection())) return;
    input.focus();
  });
  if (fsToggle) fsToggle.addEventListener('click', (e) => { e.preventDefault(); setFullscreen(!wrap.classList.contains('fullscreen')); });
  if (clearLink) clearLink.addEventListener('click', (e) => { e.preventDefault(); cmdClear(); });

  // Keyboard
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); const v = input.value; input.value = ''; suggest.innerHTML = ''; execute(v); }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); histPrev(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); histNext(); }
    else if (e.key === 'Tab')       { e.preventDefault(); tabComplete(); }
    else if (e.key === 'Escape') {
      if (wrap.classList.contains('fullscreen')) { setFullscreen(false); return; }
      input.value = ''; suggest.innerHTML = '';
    } else if (e.key === '?' && input.value === '') { e.preventDefault(); execute('?'); }
  });
  input.addEventListener('input', refreshSuggestions);

  // ─── Boot sequence + banner ────────────────────────────────────────────
  function asciiLogo() {
    const lines = [
      '<span class="cmd-boot-ascii"> █▀▀ █▄ ▄█ █▀▄ </span>',
      '<span class="cmd-boot-ascii"> █   █▀▄▀█ █ █ </span>',
      '<span class="cmd-boot-ascii"> ▀▀▀ ▀   ▀ ▀▀  </span>',
    ];
    for (const html of lines) {
      const d = writeRaw(html, 'cmd-line cmd-boot-line-in');
      if (d) d.setAttribute('aria-hidden', 'true'); // decorative for screen readers
    }
  }
  function clickableSuggestions() {
    writeRaw('<span class="dim">// new here? \u00bb </span><a class="cmd-rerun key cmd-suggest-headline" data-cmd="samples">samples</a><span class="dim"> for the full feature catalogue, or click any below:</span>', 'cmd-line');
    writeRaw('<span class="dim">//   </span>' +
      '<a class="cmd-rerun key" data-cmd="mde">mde</a><span class="dim"> \u00b7 </span>' +
      '<a class="cmd-rerun key" data-cmd="tree m365-e5">tree m365-e5</a><span class="dim"> \u00b7 </span>' +
      '<a class="cmd-rerun key" data-cmd="ask whats in m365 e5">ask whats in m365 e5</a><span class="dim"> \u00b7 </span>' +
      '<a class="cmd-rerun key" data-cmd="all">all</a><span class="dim"> \u00b7 </span>' +
      '<a class="cmd-rerun key" data-cmd="?">?</a>',
      'cmd-line');
    writeBlank();
  }
  function bootBannerFast() {
    asciiLogo();
    writeRaw('<span class="dim">' + STATE.entries.length + ' jargon · ' + STATE.decode.length + ' errno · MCP-ready</span>', 'cmd-line');
    writeBlank();
    clickableSuggestions();
  }
  async function bootSequence() {
    let skipped = false;
    const skip = () => { skipped = true; };
    document.addEventListener('click', skip);
    document.addEventListener('keydown', skip);

    asciiLogo();
    if (!skipped) await new Promise(r => setTimeout(r, 80));
    if (!skipped) writeBlank();
    if (!skipped) await new Promise(r => setTimeout(r, 120));

    const lines = [
      { html: '<span class="dim">[BIOS]</span> <span class="ok">cmd · power-on self-test ............</span> <span class="ok-tag">OK</span>', delay: 220 },
      { html: '<span class="dim">[ <span class="ok-tag">OK</span> ]</span> loading jargon index ................. ' + STATE.entries.length + ' entries', delay: 200 },
      { html: '<span class="dim">[ <span class="ok-tag">OK</span> ]</span> mounting /dev/clipboard ............... <span class="ok-tag">OK</span>', delay: 180 },
      { html: '<span class="dim">[ <span class="ok-tag">OK</span> ]</span> history daemon ........................ <span class="ok-tag">OK</span>', delay: 180 },
      { html: '<span class="dim">[ <span class="ok-tag">OK</span> ]</span> mcp bridge ......................... <span class="ok-tag">ready</span>', delay: 200 },
    ];
    for (const ln of lines) {
      if (skipped) break;
      const d = writeRaw(ln.html, 'cmd-line cmd-boot-line-in');
      if (d) d.setAttribute('aria-hidden', 'true'); // BIOS/[OK] noise hidden from SR
      if (ln.delay) await new Promise(r => setTimeout(r, ln.delay));
    }
    document.removeEventListener('click', skip);
    document.removeEventListener('keydown', skip);

    if (skipped) writeRaw('<span class="dim">// (boot skipped)</span>', 'cmd-line');
    if (!STATE.firstCommandRun) {
      writeRaw('<span class="ready-tag">[READY]</span> <span class="dim">type a command — or click any below ↓</span>', 'cmd-line');
      writeBlank();
      clickableSuggestions();
    }
    try { localStorage.setItem(STORAGE.boot, '1'); } catch (_) {}
  }
  function bootBanner() {
    if (STATE.bootDone) { bootBannerFast(); return; }
    STATE.bootDone = true;
    let seen = false;
    try { seen = !!localStorage.getItem(STORAGE.boot); } catch (_) {}
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (seen || reduced) bootBannerFast();
    else bootSequence();
  }

  function loadFromUrl() {
    try {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q && q.length > 0 && q.length < 200) {
        STATE.bootDone = true;
        bootBannerFast();
        return q;
      }
    } catch (_) {}
    return null;
  }

  // ─── Placeholder rotation (onboarding hint cycle) ─────────────────────
  // Silently rotates the input placeholder through 5 hints while the input
  // is empty + unfocused. Pauses the moment the user types. No animation,
  // no chrome, no surprise — just a passing nudge that broader use cases
  // exist beyond "type a slug".
  const PLACEHOLDER_HINTS = [
    'type a Microsoft acronym \u2014 try: mde \u00b7 pim \u00b7 aadsts50011 \u00b7 ?',
    'or paste an error code \u2014 try: 0xC0000005 \u00b7 KB5028166',
    "or `ask whats included in m365 e5` \u2014 grounded answer with citations",
    'or `tree m365-e5` \u2014 see what\'s bundled in a license',
    'or paste an Azure resource id \u2014 cmd parses every segment',
    "type `samples` for the full feature catalogue",
  ];
  function startPlaceholderRotation() {
    if (!input) return;
    let i = 0;
    let stopped = false;
    function stop() { stopped = true; }
    input.addEventListener('input', stop, { once: true });
    input.addEventListener('keydown', stop, { once: true });
    setInterval(function () {
      if (stopped) return;
      if (input.value.length > 0) return; // user has typed something
      if (document.activeElement === input) return; // user is composing
      i = (i + 1) % PLACEHOLDER_HINTS.length;
      input.placeholder = PLACEHOLDER_HINTS[i];
    }, 5000);
  }

  // ─── Boot ──────────────────────────────────────────────────────────────
  loadTrail();
  updateStatus();

  // Auto-open express <details> on mobile so search is reachable without scrolling/tapping
  if (window.innerWidth < 720) {
    const expr = document.getElementById('cmd-express');
    if (expr) expr.open = true;
  }

  loadIndex().then(() => {
    updateStatus();
    const q = loadFromUrl();
    if (q) execute(q);
    else bootBanner();
    input.focus();
    startPlaceholderRotation();
    // Lazy-load decode in background
    setTimeout(() => loadDecode(), 1500);
  });
})();
