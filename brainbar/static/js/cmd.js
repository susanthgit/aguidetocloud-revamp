/* ═══════════════════════════════════════════════════════════════════════════
   🪐 BRAIN BAR — Launcher (cmd.js)  ·  v2b: synonyms, did-you-mean, recents
   Vanilla. Keyboard-first. Layered search ranking. No framework.

   Tiers (deterministic):
     1 exact slug          → preselect, Enter auto-opens top
     2 exact abbreviation  → preselect, Enter auto-opens top
     3 exact alias         → preselect, Enter auto-opens + "redirects to canonical"
     4 exact old name      → preselect, Enter auto-opens + "rebranded — was X"
     5 exact synonym       → preselect, Enter opens selected + "matches synonym: X"
     6 prefix on slug/name → preselect, Enter opens selected
     7 substring           → preselect, Enter opens selected
     8 multi-token AND     → preselect, Enter opens selected (only if ≥2 tokens)
     9 Levenshtein ≤2      → NO preselect, must arrow ↓ first ("did you mean: X?")
                             (only if tiers 1-8 returned 0 AND query length ≥4)
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const STATE = {
    entries: [],
    results: [],
    selected: -1,
    ready: false,
    recent: [],          // [{q, slug, ts}, ...] max 5
    lastQuery: '',       // For highlight rendering
    mode: MODE_JARGON,   // Round 2 — current launcher mode
    decodeEntries: [],   // Round 2 — lazy-loaded errno index
    decodeReady: false,  // Round 2 — set true after first successful load
  };

  const RECENT_KEY = 'bb:recent';
  const RECENT_MAX = 5;
  const LEVENSHTEIN_MAX = 2;
  const LEVENSHTEIN_MIN_QUERY_LEN = 4;
  const TOKEN_MIN_LEN = 2;
  const MISS_RE = /^[a-z0-9][a-z0-9-]{0,49}$/;

  // Round 2 — mode chips + smart suggest
  const MODE_JARGON = 'jargon';
  const MODE_ERRNO  = 'errno';
  // Strict patterns ONLY — must NOT collide with any existing brainbar slug,
  // abbreviation, alias, or synonym. Verified against cmd_entries.toml.
  const SUGGEST_PATTERNS = [
    /^0x[0-9a-fA-F]{8}$/,   // HRESULT (Win32 / COM error)
    /^AADSTS\d+$/i,         // Entra error code
    /^KB\d+$/i,             // KB article
  ];

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function slugify(s) {
    return String(s || '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  function eq(a, b) { return String(a || '').toLowerCase() === String(b || '').toLowerCase(); }
  function lc(s) { return String(s || '').toLowerCase(); }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  // ── Match highlighting ────────────────────────────────────────────────
  // Segment-escape: find indices on RAW text, then escape prefix/match/suffix
  // separately and wrap only the escaped middle in <mark>. Never regex over
  // already-escaped HTML (that breaks on &amp;/&lt;/etc.).
  function highlightMatch(value, needle) {
    if (!needle || !value) return escapeHtml(value);
    const lcVal = String(value).toLowerCase();
    const lcNeedle = String(needle).toLowerCase();
    const idx = lcVal.indexOf(lcNeedle);
    if (idx < 0) return escapeHtml(value);
    const before = String(value).slice(0, idx);
    const hit    = String(value).slice(idx, idx + lcNeedle.length);
    const after  = String(value).slice(idx + lcNeedle.length);
    return escapeHtml(before) + '<mark class="bb-mark">' + escapeHtml(hit) + '</mark>' + escapeHtml(after);
  }

  // ── Levenshtein distance (capped, with early exit) ────────────────────
  function levenshtein(a, b, max) {
    a = String(a); b = String(b);
    if (a === b) return 0;
    const m = a.length, n = b.length;
    if (Math.abs(m - n) > max) return max + 1;
    if (m === 0) return n;
    if (n === 0) return m;
    let prev = new Array(n + 1);
    let curr = new Array(n + 1);
    for (let j = 0; j <= n; j++) prev[j] = j;
    for (let i = 1; i <= m; i++) {
      curr[0] = i;
      let rowMin = i;
      for (let j = 1; j <= n; j++) {
        const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
        curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
        if (curr[j] < rowMin) rowMin = curr[j];
      }
      if (rowMin > max) return max + 1;
      const tmp = prev; prev = curr; curr = tmp;
    }
    return prev[n];
  }

  // Find the closest term across all entries (slug/abbr/alias/synonym).
  // Returns { entry, term, distance } or null if nothing within threshold.
  function closestTerm(query) {
    let best = null;
    let bestDist = LEVENSHTEIN_MAX + 1;
    for (const e of STATE.entries) {
      const candidates = [];
      candidates.push(e.slug);
      for (const a of (e.abbreviations || [])) candidates.push(a.toLowerCase());
      for (const a of (e.aliases || []))       candidates.push(a.toLowerCase());
      for (const s of (e.synonyms || []))      candidates.push(slugify(s));
      for (const c of candidates) {
        if (!c) continue;
        const d = levenshtein(query, c, LEVENSHTEIN_MAX);
        if (d < bestDist) {
          bestDist = d;
          best = { entry: e, term: c, distance: d };
        }
      }
    }
    return best;
  }

  // ── Search ────────────────────────────────────────────────────────────
  function search(query) {
    const q = lc(query).trim();
    if (!q) return [];

    const out = [];
    const seen = new Set();
    const push = (e, tier, reason, hint) => {
      if (seen.has(e.slug)) return;
      seen.add(e.slug);
      out.push({ e, tier, reason, hint: hint || '' });
    };
    const qSlug = slugify(q);

    // Pass 1: exact matches (Tiers 1-5)
    for (const e of STATE.entries) {
      if (eq(e.slug, q)) { push(e, 1, 'exact slug'); continue; }
      if ((e.abbreviations || []).some(a => eq(a, q))) { push(e, 2, 'abbreviation'); continue; }
      if ((e.aliases || []).some(a => eq(a, q))) {
        push(e, 3, 'alias', 'redirects to canonical');
        continue;
      }
      const oldSlugs = (e.old_names || []).map(slugify);
      const oldHit = oldSlugs.findIndex(s => s === q || s === qSlug);
      if (oldHit >= 0) {
        push(e, 4, 'old name', 'rebranded — was ' + e.old_names[oldHit]);
        continue;
      }
      const syns = e.synonyms || [];
      const synHit = syns.find(s => eq(s, q) || slugify(s) === qSlug);
      if (synHit) {
        push(e, 5, 'synonym', 'matches synonym: ' + synHit);
        continue;
      }
    }

    // Pass 2: prefix on slug/name (Tier 6)
    for (const e of STATE.entries) {
      if (seen.has(e.slug)) continue;
      if (e.slug.startsWith(q) || lc(e.name).startsWith(q)) push(e, 6, 'prefix');
    }

    // Pass 3: substring (Tier 7)
    for (const e of STATE.entries) {
      if (seen.has(e.slug)) continue;
      if (e.slug.includes(q) || lc(e.name).includes(q) || lc(e.plain_english || '').includes(q)) {
        push(e, 7, 'fuzzy');
      }
    }

    // Pass 4: multi-token AND-match (Tier 8)
    const tokens = q.split(/\s+/).filter(t => t.length >= TOKEN_MIN_LEN);
    if (tokens.length >= 2) {
      for (const e of STATE.entries) {
        if (seen.has(e.slug)) continue;
        const hay = [
          e.slug,
          lc(e.name),
          lc(e.plain_english || ''),
          ...(e.abbreviations || []).map(lc),
          ...(e.aliases || []).map(lc),
          ...(e.synonyms || []).map(lc),
          ...(e.old_names || []).map(lc),
        ].join(' ');
        if (tokens.every(t => hay.includes(t))) push(e, 8, 'multi-token');
      }
    }

    // Pass 5: Levenshtein did-you-mean (Tier 9) — only if NOTHING else hit
    if (out.length === 0 && q.length >= LEVENSHTEIN_MIN_QUERY_LEN) {
      const best = closestTerm(q);
      if (best) {
        push(best.entry, 9, 'did-you-mean', 'did you mean: ' + best.term + '?');
      }
    }

    return out.sort((a, b) => a.tier - b.tier);
  }

  // ── Render ────────────────────────────────────────────────────────────
  const KIND_LABEL = {
    product: 'product', portal: 'portal', feature: 'feature',
    license: 'license', tool: 'tool', cert: 'cert',
    'acronym-only': 'acronym', 'disambiguation': 'disambiguation',
    errno: 'errno',
  };

  // Tiers where row 0 should be visually preselected (Enter still gated by
  // the existing `top.tier <= 4` auto-open logic for safety).
  function shouldPreselectTopRow(topTier) {
    return topTier >= 1 && topTier <= 8;
  }

  // Tiers where we highlight the matched substring within slug/name.
  function highlightTier(tier) {
    return tier === 1 || tier === 2 || tier === 6 || tier === 7;
  }

  function renderResults(results, query) {
    const list = $('#bb-results');
    const empty = $('#bb-empty');
    const boot = $('#bb-boot');
    if (!list) return;

    if (!query) {
      list.innerHTML = '';
      if (empty) empty.hidden = true;
      if (boot) boot.hidden = false;
      renderRecent();
      STATE.selected = -1;
      return;
    }
    if (boot) boot.hidden = true;
    hideRecent();

    if (!results.length) {
      list.innerHTML = '';
      if (empty) {
        empty.hidden = false;
        const issueUrl = 'https://github.com/susanthgit/aguidetocloud-revamp/issues/new?labels=brain-bar%2Csuggestion&title=' +
          encodeURIComponent('Brain Bar: suggest term “' + query + '”') +
          '&body=' + encodeURIComponent('Term: ' + query + '\n\nWhat it means / why it matters:\n\n');
        const link = $('#bb-empty-suggest');
        if (link) link.href = issueUrl;
        const term = $('#bb-empty-term');
        if (term) term.textContent = query;
      }
      STATE.selected = -1;
      if (STATE.mode === MODE_JARGON) logMiss(query);
      return;
    }

    if (empty) empty.hidden = true;
    STATE.lastQuery = query;

    const html = results.map((r, i) => {
      const e = r.e;
      const abbr = (e.abbreviations || [])[0];
      const status = e.status && e.status !== 'ga'
        ? `<span class="bb-result-status bb-status-${e.status}">${e.status}</span>` : '';
      const tier = `<span class="bb-result-tier" title="${escapeHtml(r.reason + (r.hint ? ' — ' + r.hint : ''))}">${r.tier <= 4 ? '↵' : '·'}</span>`;
      const hint = r.hint ? `<span class="bb-result-hint">// ${escapeHtml(r.hint)}</span>` : '';
      const stale = freshnessClass(e.last_verified);
      const staleDot = stale === 'stale' ? '<span class="bb-result-stale" title="Last verified more than 9 months ago — info may be out of date.">●</span>' : '';

      const hl = highlightTier(r.tier) ? lc(query) : '';
      const slugMarkup = hl ? highlightMatch(e.slug, hl) : escapeHtml(e.slug);
      const nameMarkup = hl ? highlightMatch(e.name, hl) : escapeHtml(e.name);
      const abbrMarkup = (abbr && abbr.toLowerCase() !== e.slug.toLowerCase())
        ? ' <em>(' + escapeHtml(abbr.toLowerCase()) + ')</em>' : '';

      return `
        <li class="bb-result${r._suggest ? ' bb-result-suggest' : ''}" data-idx="${i}" data-url="${escapeHtml(e.url)}" role="option" aria-selected="${i === STATE.selected}">
          <a href="${escapeHtml(e.url)}" class="bb-result-link">
            ${tier}
            <span class="bb-result-slug${(STATE.mode === MODE_ERRNO || r._suggest) ? ' bb-result-slug-decode' : ''}">${slugMarkup}${abbrMarkup}</span>
            <span class="bb-result-name">${nameMarkup}</span>
            <span class="bb-result-meta">[ ${KIND_LABEL[e.kind] || e.kind} :: ${escapeHtml(e.domain)} ]</span>
            ${status}
            ${staleDot}
            ${hint}
          </a>
        </li>
      `;
    }).join('');
    list.innerHTML = html;

    const topTier = results[0].tier;
    if (shouldPreselectTopRow(topTier)) {
      STATE.selected = 0;
      setSelected(0);
    } else {
      // Tier 9 (Levenshtein) — require explicit arrow nav before Enter opens
      STATE.selected = -1;
      // Visually no row selected; aria already false from initial markup.
    }
  }

  // ── Recent searches (localStorage) ────────────────────────────────────
  function loadRecent() {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      return arr
        .filter(x => x && typeof x === 'object' && typeof x.slug === 'string' && typeof x.q === 'string')
        .slice(0, RECENT_MAX);
    } catch (e) {
      return [];
    }
  }

  function saveRecent(query, slug) {
    if (!slug || !query) return;
    try {
      const trimmed = String(query).trim().slice(0, 80);
      if (!trimmed) return;
      // Dedupe by slug (most recent wins)
      const filtered = STATE.recent.filter(r => r.slug !== slug);
      const next = [{ q: trimmed, slug, ts: Date.now() }, ...filtered].slice(0, RECENT_MAX);
      STATE.recent = next;
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch (e) { /* private mode — ignore */ }
  }

  function clearRecent() {
    STATE.recent = [];
    try { localStorage.removeItem(RECENT_KEY); } catch (e) { /* ignore */ }
    renderRecent();
  }

  function renderRecent() {
    const wrap = $('#bb-recent');
    if (!wrap) return;
    if (!STATE.recent.length) { wrap.hidden = true; return; }
    const items = STATE.recent.map(r =>
      `<li><a class="bb-recent-chip" href="${escapeHtml('/' + r.slug + '/')}" data-recent-slug="${escapeHtml(r.slug)}"><span class="bb-recent-prompt">$</span> ${escapeHtml(r.slug)}</a></li>`
    ).join('');
    wrap.innerHTML = `
      <p class="bb-recent-label">// recent · stored in your browser only</p>
      <ul class="bb-recent-list">
        ${items}
        <li><button type="button" class="bb-recent-clear" data-recent-clear>// clear</button></li>
      </ul>
    `;
    wrap.hidden = false;
  }

  function hideRecent() {
    const wrap = $('#bb-recent');
    if (wrap) wrap.hidden = true;
  }

  // ── Freshness ─────────────────────────────────────────────────────────
  // Returns 'fresh' | 'amber' | 'stale' | '' (unknown)
  function freshnessClass(lastVerified) {
    if (!lastVerified) return '';
    const ms = Date.parse(lastVerified);
    if (!Number.isFinite(ms)) return '';
    const ageDays = Math.floor((Date.now() - ms) / 86400000);
    if (ageDays <= 90) return 'fresh';
    if (ageDays <= 270) return 'amber';
    return 'stale';
  }

  // ── Help overlay ──────────────────────────────────────────────────────
  function openHelp() {
    const help = $('#bb-help');
    if (!help) return;
    help.hidden = false;
    const closeBtn = $('.bb-help-close', help);
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }

  function closeHelp() {
    const help = $('#bb-help');
    if (!help) return;
    help.hidden = true;
    const input = $('#bb-input');
    if (input) input.focus({ preventScroll: true });
  }

  function isHelpOpen() {
    const help = $('#bb-help');
    return !!(help && !help.hidden);
  }

  // ── Privacy-safe miss tracking ────────────────────────────────────────
  // Same-shape rules as v1 (slug-shaped, dedupe per session). Server-side
  // also re-checks against the index AND synonyms before recording.
  function logMiss(rawTerm) {
    if (typeof rawTerm !== 'string') return;
    const term = rawTerm.trim().toLowerCase();
    if (!term || !MISS_RE.test(term)) return;
    try {
      const key = 'bb_miss:' + term;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
      fetch('/api/log-miss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term }),
        keepalive: true,
        credentials: 'omit',
      }).catch(() => {});
    } catch (e) { /* private mode — ignore */ }
  }

  // ── Selection / keyboard ──────────────────────────────────────────────
  function setSelected(idx) {
    const items = $$('#bb-results .bb-result');
    if (!items.length) { STATE.selected = -1; return; }
    if (idx < 0) {
      STATE.selected = -1;
      items.forEach(el => {
        el.setAttribute('aria-selected', 'false');
        el.classList.remove('is-selected');
      });
      return;
    }
    if (idx >= items.length) idx = 0;
    STATE.selected = idx;
    items.forEach((el, i) => {
      el.setAttribute('aria-selected', i === idx ? 'true' : 'false');
      el.classList.toggle('is-selected', i === idx);
    });
    items[idx].scrollIntoView({ block: 'nearest' });
  }

  // ══════════════════════════════════════════════════════════════════════
  // Round 2 — mode chips + decode dispatch + smart suggest
  // ══════════════════════════════════════════════════════════════════════

  // Load the decode index once. Cache forever (entries move only on deploy).
  function loadDecodeIndex() {
    if (STATE.decodeReady || STATE._decodeLoading) return Promise.resolve();
    STATE._decodeLoading = true;
    return fetch('/decode/decode-index.json', { cache: 'force-cache' })
      .then(r => r.json())
      .then(data => {
        STATE.decodeEntries = (data && data.entries) || [];
        STATE.decodeReady = true;
        STATE._decodeLoading = false;
      })
      .catch(err => {
        STATE._decodeLoading = false;
        console.error('[brainbar] failed to load decode-index.json', err);
      });
  }

  // Adapter — turn a decode index row into the same shape as a jargon row,
  // so renderResults() doesn't need a second render path.
  function decodeToResultEntry(d) {
    return {
      slug: d.code,                  // shown in the slug column (uppercase code)
      name: d.short,
      kind: 'errno',
      domain: d.namespace,
      abbreviations: [],
      aliases: [],
      old_names: [],
      synonyms: [],
      url: d.url,
      status: 'ga',
      last_verified: d.last_verified,
    };
  }

  // Errno-mode search — deterministic, no Levenshtein. Codes are pasted, not
  // typed in casual English; fuzzy isn't useful here.
  function searchDecode(query) {
    const q = lc(query.trim());
    if (!q) return [];
    const exact = [];
    const prefix = [];
    const subCode = [];
    const subText = [];
    const seen = new Set();

    for (const d of STATE.decodeEntries) {
      const code = lc(d.code);
      const slug = lc(d.slug);
      if (seen.has(slug)) continue;
      const e = decodeToResultEntry(d);
      if (code === q || slug === q) {
        exact.push({ e, tier: 1, reason: 'exact code', hint: '' });
        seen.add(slug);
        continue;
      }
      if (code.startsWith(q) || slug.startsWith(q)) {
        prefix.push({ e, tier: 6, reason: 'prefix on code', hint: '' });
        seen.add(slug);
        continue;
      }
      if (code.indexOf(q) !== -1) {
        subCode.push({ e, tier: 7, reason: 'substring on code', hint: '' });
        seen.add(slug);
        continue;
      }
      const short = lc(d.short);
      const body = lc(d.plain_english);
      if (short.indexOf(q) !== -1 || body.indexOf(q) !== -1) {
        subText.push({ e, tier: 7, reason: 'substring on description', hint: '' });
        seen.add(slug);
      }
    }
    return exact.concat(prefix, subCode, subText).slice(0, 12);
  }

  // Smart suggest — strict regex hit + 0 jargon results = prepend a single
  // "looks like an error code → /decode/<slug>/" row in the result list.
  function matchSuggestPattern(query) {
    const q = String(query || '').trim();
    if (!q) return null;
    for (const re of SUGGEST_PATTERNS) {
      if (re.test(q)) return q;
    }
    return null;
  }

  function smartSuggestEntry(query) {
    const matched = matchSuggestPattern(query);
    if (!matched) return null;
    const slug = matched.toLowerCase();
    // Prefer a real curated decode entry if one exists.
    let target = null;
    if (STATE.decodeReady) {
      target = STATE.decodeEntries.find(d => lc(d.slug) === slug || lc(d.code) === lc(matched));
    }
    if (target) {
      return {
        e: decodeToResultEntry(target),
        tier: 1,
        reason: 'looks like an error code',
        hint: 'switch to errno mode',
        _suggest: true,
      };
    }
    // Pattern matched but we don't have it curated yet — still surface the hint
    // and route to /decode/ so the user lands somewhere useful.
    return {
      e: {
        slug: matched.toUpperCase(),
        name: 'looks like an error code — search /decode/',
        kind: 'errno',
        domain: 'unknown',
        abbreviations: [],
        url: '/decode/?q=' + encodeURIComponent(matched),
        status: 'ga',
        last_verified: '',
      },
      tier: 1,
      reason: 'looks like an error code',
      hint: 'open /decode/',
      _suggest: true,
    };
  }

  // Single dispatcher used by every input handler — picks the right brain.
  function runSearch(query) {
    if (STATE.mode === MODE_ERRNO) {
      if (!STATE.decodeReady) {
        loadDecodeIndex();
        return [];
      }
      return searchDecode(query);
    }
    const jargon = search(query);
    if (jargon.length === 0) {
      const sugg = smartSuggestEntry(query);
      if (sugg) return [sugg];
    }
    return jargon;
  }

  // Switch between jargon ↔ errno. Updates chip aria, placeholder, container
  // attribute (drives boot-block CSS swap), re-runs current query.
  function setMode(newMode) {
    if (newMode !== MODE_JARGON && newMode !== MODE_ERRNO) return;
    if (STATE.mode === newMode) return;
    STATE.mode = newMode;
    const hero = document.querySelector('.bb-hero');
    if (hero) hero.setAttribute('data-bb-mode', newMode);
    const input = $('#bb-input');
    if (input) {
      input.setAttribute('placeholder', newMode === MODE_ERRNO
        ? 'paste an error code — try: AADSTS50105, 0x80070005, KB5034441'
        : 'type a microsoft term — try: mde, pim, e3, intune, foundry');
    }
    document.querySelectorAll('.bb-mode-chip').forEach(btn => {
      const isActive = btn.dataset.bbModeTarget === newMode;
      btn.classList.toggle('bb-mode-chip-active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    if (newMode === MODE_ERRNO && !STATE.decodeReady) loadDecodeIndex();
    // Recents are jargon-only — hide them when in errno mode to avoid
    // confusion (clicking a jargon recent in errno mode = empty results).
    if (newMode === MODE_ERRNO) {
      hideRecent();
    } else {
      renderRecent();
    }
    // Re-run the current query in the new mode (preserves user's typing).
    if (input && input.value) {
      STATE.results = runSearch(input.value);
      renderResults(STATE.results, input.value);
    } else {
      // Empty input — reveal the boot block (which CSS now flips by mode).
      const list = $('#bb-results');
      const empty = $('#bb-empty');
      const boot = $('#bb-boot');
      if (list) list.innerHTML = '';
      if (empty) empty.hidden = true;
      if (boot) boot.hidden = false;
      STATE.selected = -1;
    }
  }

  // ── Init / wiring ─────────────────────────────────────────────────────
  function init() {
    const input = $('#bb-input');
    if (!input) return;

    STATE.recent = loadRecent();
    renderRecent();

    try {
      if (!document.activeElement || document.activeElement === document.body) {
        input.focus({ preventScroll: true });
      }
    } catch (e) { /* older browsers — ignore */ }

    fetch('/cmd-index.json', { cache: 'force-cache' })
      .then(r => r.json())
      .then(data => {
        STATE.entries = data.entries || [];
        STATE.ready = true;
        const status = $('#bb-input-status');
        if (status) status.textContent = String(STATE.entries.length) + ' entries';

        const params = new URLSearchParams(location.search);
        const initialQ = params.get('q');
        if (initialQ) {
          input.value = initialQ;
          handleInput();
          if (STATE.results.length && STATE.results[0].tier <= 2) {
            const top = STATE.results[0];
            saveRecent(initialQ, top.e.slug);
            location.href = top.e.url;
          }
        }
      })
      .catch(err => {
        const status = $('#bb-input-status');
        if (status) status.textContent = 'index unavailable';
        console.error('[brainbar] failed to load cmd-index.json', err);
      });

    // Round 2 — load decode index in parallel so smart-suggest + errno mode
    // are immediately responsive on first interaction. Tiny payload (~6KB).
    loadDecodeIndex();

    // Round 2 — bind mode chip click handlers
    document.querySelectorAll('.bb-mode-chip').forEach(btn => {
      btn.addEventListener('click', (ev) => {
        ev.preventDefault();
        const target = btn.dataset.bbModeTarget;
        if (target) setMode(target);
        // Refocus the input so the user can keep typing without reaching for it
        const inp = $('#bb-input');
        if (inp) {
          try { inp.focus({ preventScroll: true }); } catch (e) { inp.focus(); }
        }
      });
    });

    function handleInput() {
      STATE.results = runSearch(input.value);
      renderResults(STATE.results, input.value);
    }

    input.addEventListener('input', handleInput);

    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'ArrowDown') {
        ev.preventDefault();
        const items = $$('#bb-results .bb-result');
        if (!items.length) return;
        const next = STATE.selected < 0 ? 0 : (STATE.selected + 1) % items.length;
        setSelected(next);
      } else if (ev.key === 'ArrowUp') {
        ev.preventDefault();
        const items = $$('#bb-results .bb-result');
        if (!items.length) return;
        const next = STATE.selected <= 0 ? items.length - 1 : STATE.selected - 1;
        setSelected(next);
      } else if (ev.key === 'Enter') {
        ev.preventDefault();
        if (!STATE.results.length) return;
        const top = STATE.results[0];
        if (top.tier <= 4 && STATE.selected <= 0) {
          // Tier 1-4: exact match — auto-open top
          saveRecent(input.value, top.e.slug);
          location.href = top.e.url;
        } else if (STATE.selected >= 0) {
          // User navigated OR top tier 5-8 with preselect 0
          const r = STATE.results[STATE.selected];
          saveRecent(input.value, r.e.slug);
          location.href = r.e.url;
        }
        // else: tier 9 (did-you-mean) with no preselect — do nothing.
      } else if (ev.key === 'Escape') {
        if (input.value) {
          input.value = '';
          handleInput();
        } else {
          input.blur();
        }
      }
    });

    // Save recent when user clicks a result link
    const resultsList = $('#bb-results');
    if (resultsList) {
      resultsList.addEventListener('click', (ev) => {
        const link = ev.target.closest('.bb-result-link');
        if (!link) return;
        const li = link.closest('.bb-result');
        if (!li) return;
        const idx = parseInt(li.dataset.idx, 10);
        const r = STATE.results[idx];
        if (r) saveRecent(input.value, r.e.slug);
      });
    }

    // Recent searches: clear button (delegated)
    const recentWrap = $('#bb-recent');
    if (recentWrap) {
      recentWrap.addEventListener('click', (ev) => {
        if (ev.target && ev.target.matches('[data-recent-clear]')) {
          ev.preventDefault();
          clearRecent();
        }
        // Recent chip clicks are native <a> navigations; no JS needed
      });
    }

    // Random entry link (in boot block)
    const randomLink = $('#bb-random');
    if (randomLink) {
      randomLink.addEventListener('click', (ev) => {
        ev.preventDefault();
        if (!STATE.entries.length) return;
        const pool = STATE.entries.filter(e => e.kind !== 'disambiguation');
        if (!pool.length) return;
        const pick = pool[Math.floor(Math.random() * pool.length)];
        location.href = pick.url;
      });
    }

    // Help-trigger link (visible alternative to `?` keyboard — needed on mobile
    // where the launcher auto-focuses and the keyboard handler never fires).
    const helpTrigger = $('#bb-help-trigger');
    if (helpTrigger) {
      helpTrigger.addEventListener('click', (ev) => {
        ev.preventDefault();
        openHelp();
      });
    }

    // Help overlay close handlers
    const helpOverlay = $('#bb-help');
    if (helpOverlay) {
      helpOverlay.addEventListener('click', (ev) => {
        if (ev.target === helpOverlay || ev.target.classList.contains('bb-help-backdrop')) {
          closeHelp();
        }
      });
      const closeBtn = $('.bb-help-close', helpOverlay);
      if (closeBtn) closeBtn.addEventListener('click', closeHelp);
    }

    // Global hotkeys
    document.addEventListener('keydown', (ev) => {
      // Esc closes help even when focused inside it
      if (ev.key === 'Escape' && isHelpOpen()) {
        ev.preventDefault();
        closeHelp();
        return;
      }

      if (ev.metaKey || ev.ctrlKey || ev.altKey) return;

      const tag = (document.activeElement && document.activeElement.tagName) || '';
      const inField = tag === 'INPUT' || tag === 'TEXTAREA';

      // "/" → focus input (Spotlight-style)
      if (ev.key === '/' && !inField && !isHelpOpen()) {
        ev.preventDefault();
        input.focus();
        input.select();
        return;
      }

      // "?" → open help (only when input not focused, mirrors GitHub)
      if (ev.key === '?' && !inField && !isHelpOpen()) {
        ev.preventDefault();
        openHelp();
        return;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
