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

  // ─── State ─────────────────────────────────────────────────────────────
  const STATE = {
    entries: [],
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
      return [
        { type: 'warn', text: '// no entry yet for "' + term + '"' },
        { type: 'plain', html: '<span class="dim">// </span><a class="cmd-link" href="https://www.aguidetocloud.com/feedback/" target="_blank" rel="noopener">tell us what to add<span class="ext">↗</span></a>' },
      ];
    }
    rememberTrail(hit.entry.slug);
    const blocks = [];
    if (hit.via !== 'slug' && hit.via !== 'prefix') {
      blocks.push({ type: 'dim', text: '// "' + term + '" matched ' + hit.via + ' → ' + hit.entry.slug });
    }
    blocks.push({ type: 'man', entry: hit.entry });
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
    if (!args.length) return [{ type: 'err', text: 'usage: decode <code>' }];
    const code = args.join(' ');
    if (!STATE.decodeReady) {
      loadDecode().then(() => writeRaw('<span class="dim">// decode index loaded — re-run </span><a class="cmd-rerun" data-cmd="' + esc('decode ' + code) + '">decode ' + esc(code) + '</a>', 'cmd-line'));
      return [{ type: 'dim', text: '// loading errno index…' }];
    }
    const e = findErrno(code);
    if (!e) return [
      { type: 'warn', text: '// no decode for "' + code + '"' },
      { type: 'dim',  text: '// covers AADSTS, 0x HRESULT, KB articles, MDM enrolment failures' },
    ];
    return [{ type: 'errno', entry: e }];
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
  };
  function compareKey(a, b) {
    return [a, b].sort().join(':');
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
    return [
      { type: 'warn', text: '// compare not yet curated for ' + esc(a.entry.slug) + ' vs ' + esc(b.entry.slug) },
      { type: 'dim',  text: '// opening both entries side-by-side instead:' },
      { type: 'man', entry: a.entry },
      { type: 'man', entry: b.entry },
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

  function cmdHelp() {
    const features = [
      { title: 'man pages',  cmd: 'man mde',          desc: 'full entry as a unix manual' },
      { title: 'list all',   cmd: 'all',              desc: 'list every jargon entry' },
      { title: 'list errors',cmd: 'ls errno',         desc: 'list every error code' },
      { title: 'decode',     cmd: 'decode aadsts50011',desc: 'error code → plain english' },
      { title: 'aliases',    cmd: 'mdatp',            desc: 'old names resolve automatically' },
      { title: 'history',    cmd: 'history',          desc: 'cycle past commands · ↑↓' },
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
      { type: 'heading', text: '// cmd — quick reference  (click any to run)' },
      { type: 'plain', html: html },
      { type: 'dim', text: '// keys: ↑↓ history · tab complete · enter run · esc clear · ? this help' },
      { type: 'dim', text: '// shortcut: bare slug works — type "mde" instead of "search mde"' },
    ];
  }

  const COMMANDS = {
    search: cmdSearch, s: cmdSearch,
    man:    cmdMan,
    ls:     cmdLs, list: cmdLs,
    decode: cmdDecode, d: cmdDecode,
    compare:cmdCompare, cmp: cmdCompare, diff: cmdCompare,
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
    return [{ type: 'err', text: 'unknown pipe filter: ' + verb }];
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
      dl += '<dt>full entry</dt><dd><a class="cmd-link" href="' + esc(e.url) + '">' + esc(e.url) + '</a></dd>';
      div.innerHTML = '<h3>' + esc(e.slug) + '  <span class="cmd-man-name">·  ' + esc(e.name) + '</span></h3><dl>' + dl + '</dl>';
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
    if (ERROR_PATTERNS.some(p => p.test(v)) && !v.toLowerCase().startsWith('decode')) matches.push('decode ' + v);
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
    writeRaw('<span class="cmd-boot-ascii"> █▀▀ █▄ ▄█ █▀▄ </span>', 'cmd-line cmd-boot-line-in');
    writeRaw('<span class="cmd-boot-ascii"> █   █▀▄▀█ █ █ </span>', 'cmd-line cmd-boot-line-in');
    writeRaw('<span class="cmd-boot-ascii"> ▀▀▀ ▀   ▀ ▀▀  </span>', 'cmd-line cmd-boot-line-in');
  }
  function clickableSuggestions() {
    writeRaw('<span class="dim">// click any of these to run:</span>', 'cmd-line');
    writeRaw('<span class="dim">//   <a class="cmd-rerun key" data-cmd="mde">mde</a> · <a class="cmd-rerun key" data-cmd="pim">pim</a> · <a class="cmd-rerun key" data-cmd="all">all</a> · <a class="cmd-rerun key" data-cmd="?">?</a> · <a class="cmd-rerun key" data-cmd="about">about</a></span>', 'cmd-line');
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
      writeRaw(ln.html, 'cmd-line cmd-boot-line-in');
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

  // ─── Boot ──────────────────────────────────────────────────────────────
  loadTrail();
  updateStatus();
  loadIndex().then(() => {
    updateStatus();
    const q = loadFromUrl();
    if (q) execute(q);
    else bootBanner();
    input.focus();
    // Lazy-load decode in background
    setTimeout(() => loadDecode(), 1500);
  });
})();
