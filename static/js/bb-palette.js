/* ════════════════════════════════════════════════════════════════════════
   🪐 Brain Bar Command Palette — Earth's portal to the planet
   ────────────────────────────────────────────────────────────────────────
   Vanilla, no framework. Loads cmd-index.json from cmd.aguidetocloud.com
   on first activation (lazy — saves bytes on pages where palette isn't used).
   Same 6-tier ranking as Brain Bar's own launcher.
   Triggers:
     · Click on .bb-launch-btn
     · "/" key from anywhere (unless an input is focused)
     · "Cmd+K" / "Ctrl+K" (industry-standard)
   Closes:
     · "esc"
     · Click on backdrop
     · Selecting a result (opens in new tab)
   ════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var INDEX_URL = 'https://cmd.aguidetocloud.com/cmd-index.json';
  var BB_ORIGIN = 'https://cmd.aguidetocloud.com';
  var STATE = { entries: null, loading: false, results: [], selected: -1 };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function lc(s) { return String(s || '').toLowerCase(); }
  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function slugify(s) {
    return lc(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  // ── Load (lazy, cached forever per session) ────────────────────────────
  function loadIndex() {
    if (STATE.entries) return Promise.resolve(STATE.entries);
    if (STATE.loading) return STATE.loading;
    STATE.loading = fetch(INDEX_URL, { cache: 'force-cache', credentials: 'omit' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        STATE.entries = (data && data.entries) || [];
        STATE.loading = false;
        return STATE.entries;
      })
      .catch(function () {
        STATE.entries = [];
        STATE.loading = false;
        return STATE.entries;
      });
    return STATE.loading;
  }

  // ── Layered search (same 6 tiers as Brain Bar's own launcher) ───────────
  function search(query, entries) {
    var q = lc(query).trim();
    if (!q) return [];
    var seen = {};
    var out = [];
    function push(e, tier, reason, hint) {
      if (seen[e.slug]) return;
      seen[e.slug] = true;
      out.push({ e: e, tier: tier, reason: reason, hint: hint || '' });
    }
    var i, e, abbrs, alis, olds;
    for (i = 0; i < entries.length; i++) {
      e = entries[i];
      if (lc(e.slug) === q) { push(e, 1, 'exact slug'); continue; }
      abbrs = e.abbreviations || [];
      if (abbrs.some(function (a) { return lc(a) === q; })) { push(e, 2, 'abbreviation'); continue; }
      alis = e.aliases || [];
      if (alis.some(function (a) { return lc(a) === q; })) { push(e, 3, 'alias', 'redirects to canonical'); continue; }
      olds = e.old_names || [];
      if (olds.map(slugify).indexOf(q) >= 0) {
        var idx = olds.map(slugify).indexOf(q);
        push(e, 4, 'old name', 'rebranded — was ' + olds[idx]);
        continue;
      }
    }
    for (i = 0; i < entries.length; i++) {
      e = entries[i];
      if (seen[e.slug]) continue;
      if (e.slug.indexOf(q) === 0 || lc(e.name).indexOf(q) === 0) push(e, 5, 'prefix');
    }
    for (i = 0; i < entries.length; i++) {
      e = entries[i];
      if (seen[e.slug]) continue;
      if (e.slug.indexOf(q) >= 0 || lc(e.name).indexOf(q) >= 0 || lc(e.plain_english || '').indexOf(q) >= 0) {
        push(e, 6, 'fuzzy');
      }
    }
    return out.sort(function (a, b) { return a.tier - b.tier; });
  }

  // ── Render ──────────────────────────────────────────────────────────────
  var KIND_LABEL = { product: 'product', portal: 'portal', feature: 'feature', license: 'license', tool: 'tool', cert: 'cert', 'acronym-only': 'acronym', disambiguation: 'disambiguation' };

  function renderResults(results, query) {
    var list = $('#bb-palette-results');
    var hello = $('#bb-palette-hello');
    var empty = $('#bb-palette-empty');
    var footer = $('.bb-palette-footer');
    if (!list) return;

    if (!query) {
      list.innerHTML = '';
      if (hello) hello.hidden = false;
      if (empty) empty.hidden = true;
      if (footer) footer.hidden = false;
      STATE.selected = -1;
      return;
    }
    if (hello) hello.hidden = true;
    if (footer) footer.hidden = true;

    if (!results.length) {
      list.innerHTML = '';
      if (empty) {
        empty.hidden = false;
        var t = $('#bb-palette-empty-term');
        if (t) t.textContent = query;
        var s = $('#bb-palette-suggest');
        if (s) {
          s.href = 'https://github.com/susanthgit/aguidetocloud-revamp/issues/new?labels=brain-bar%2Csuggestion&title=' +
            encodeURIComponent('Brain Bar: suggest term "' + query + '"') +
            '&body=' + encodeURIComponent('Term: ' + query + '\n\nWhat it means / why it matters:\n\n');
        }
      }
      STATE.selected = -1;
      return;
    }
    if (empty) empty.hidden = true;

    var html = results.map(function (r, i) {
      var e = r.e;
      var abbr = (e.abbreviations || [])[0];
      var tier = '<span class="bb-palette-tier" title="' + escapeHtml(r.reason + (r.hint ? ' — ' + r.hint : '')) + '">' + (r.tier <= 4 ? '↵' : '·') + '</span>';
      var hint = r.hint ? '<span class="bb-palette-hint">// ' + escapeHtml(r.hint) + '</span>' : '';
      var abbrSpan = (abbr && lc(abbr) !== lc(e.slug)) ? ' <em>(' + escapeHtml(lc(abbr)) + ')</em>' : '';
      return '<li class="bb-palette-result" data-idx="' + i + '" data-url="' + escapeHtml(BB_ORIGIN + e.url) + '" role="option" aria-selected="' + (i === STATE.selected) + '">' +
        '<a class="bb-palette-result-link" href="' + escapeHtml(BB_ORIGIN + e.url) + '" target="_blank" rel="noopener">' +
        tier +
        '<span class="bb-palette-slug">' + escapeHtml(e.slug) + abbrSpan + '</span>' +
        '<span class="bb-palette-name">' + escapeHtml(e.name) + '</span>' +
        '<span class="bb-palette-meta">[ ' + escapeHtml(KIND_LABEL[e.kind] || e.kind) + ' :: ' + escapeHtml(e.domain) + ' ]</span>' +
        hint +
      '</a></li>';
    }).join('');
    list.innerHTML = html;
    STATE.selected = 0;
    setSelected(0);
  }

  function setSelected(i) {
    var items = $$('.bb-palette-result');
    if (!items.length) { STATE.selected = -1; return; }
    if (i < 0) i = items.length - 1;
    if (i >= items.length) i = 0;
    STATE.selected = i;
    items.forEach(function (el, idx) {
      el.setAttribute('aria-selected', idx === i ? 'true' : 'false');
      el.classList.toggle('is-selected', idx === i);
    });
    items[i].scrollIntoView({ block: 'nearest' });
  }

  // ── Open / close ────────────────────────────────────────────────────────
  function open() {
    var palette = $('#bb-palette');
    if (!palette || !palette.hidden === false) {/* already open */}
    palette.hidden = false;
    document.body.style.overflow = 'hidden';
    var input = $('#bb-palette-input');
    setTimeout(function () { input && input.focus(); input && input.select(); }, 10);
    loadIndex();
  }

  function close() {
    var palette = $('#bb-palette');
    if (!palette) return;
    palette.hidden = true;
    document.body.style.overflow = '';
    var input = $('#bb-palette-input');
    if (input) input.value = '';
    renderResults([], '');
  }

  // ── Init ────────────────────────────────────────────────────────────────
  function init() {
    var btn = $('#bb-launch-btn');
    var input = $('#bb-palette-input');
    var palette = $('#bb-palette');
    if (!btn || !input || !palette) return;

    btn.addEventListener('click', function () { open(); });

    palette.addEventListener('click', function (ev) {
      if (ev.target && ev.target.matches('[data-bb-close]')) close();
    });

    input.addEventListener('input', function () {
      var q = input.value;
      loadIndex().then(function (entries) {
        STATE.results = search(q, entries || []);
        renderResults(STATE.results, q);
      });
    });

    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowDown') { ev.preventDefault(); setSelected(STATE.selected + 1); return; }
      if (ev.key === 'ArrowUp')   { ev.preventDefault(); setSelected(STATE.selected - 1); return; }
      if (ev.key === 'Escape')    { ev.preventDefault(); close(); return; }
      if (ev.key === 'Enter') {
        ev.preventDefault();
        if (!STATE.results.length) return;
        var top = STATE.results[0];
        var pick;
        if (top.tier <= 4 && STATE.selected <= 0) {
          pick = top.e;
        } else if (STATE.selected >= 0) {
          pick = STATE.results[STATE.selected].e;
        }
        if (pick) {
          window.open(BB_ORIGIN + pick.url, '_blank', 'noopener');
          close();
        }
      }
    });

    // "/" / Cmd+K / Ctrl+K from anywhere
    document.addEventListener('keydown', function (ev) {
      var ae = document.activeElement;
      var typing = ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable);
      var isPaletteOpen = palette && !palette.hidden;

      if ((ev.metaKey || ev.ctrlKey) && (ev.key === 'k' || ev.key === 'K')) {
        ev.preventDefault();
        if (isPaletteOpen) close(); else open();
        return;
      }
      if (ev.key === '/' && !typing && !isPaletteOpen && !ev.metaKey && !ev.ctrlKey && !ev.altKey) {
        ev.preventDefault();
        open();
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
