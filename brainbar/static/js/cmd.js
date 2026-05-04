/* ═══════════════════════════════════════════════════════════════════════════
   🪐 BRAIN BAR — Launcher (cmd.js)
   Vanilla. Keyboard-first. Layered search ranking. No framework.
   Tiers (deterministic, never auto-opens on fuzzy matches):
     1 exact slug          → auto-open on Enter
     2 exact abbreviation  → auto-open on Enter
     3 exact alias         → auto-open on Enter (with "did you mean" hint)
     4 exact old name      → auto-open on Enter (with rebrand hint)
     5 prefix on slug/name → list only, click to open
     6 substring           → list only, click to open
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const STATE = { entries: [], results: [], selected: -1, ready: false };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function slugify(s) {
    return String(s || '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  function eq(a, b) { return String(a || '').toLowerCase() === String(b || '').toLowerCase(); }
  function lc(s) { return String(s || '').toLowerCase(); }

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

    for (const e of STATE.entries) {
      if (eq(e.slug, q)) { push(e, 1, 'exact slug'); continue; }
      if ((e.abbreviations || []).some(a => eq(a, q))) { push(e, 2, 'abbreviation'); continue; }
      if ((e.aliases || []).some(a => eq(a, q))) {
        push(e, 3, 'alias', 'redirects to canonical');
        continue;
      }
      const oldSlugs = (e.old_names || []).map(slugify);
      if (oldSlugs.some(s => s === q)) {
        const oldName = e.old_names[oldSlugs.indexOf(q)];
        push(e, 4, 'old name', 'rebranded — was ' + oldName);
        continue;
      }
    }
    for (const e of STATE.entries) {
      if (seen.has(e.slug)) continue;
      if (e.slug.startsWith(q) || lc(e.name).startsWith(q)) push(e, 5, 'prefix');
    }
    for (const e of STATE.entries) {
      if (seen.has(e.slug)) continue;
      if (e.slug.includes(q) || lc(e.name).includes(q) || lc(e.plain_english || '').includes(q)) {
        push(e, 6, 'fuzzy');
      }
    }
    return out.sort((a, b) => a.tier - b.tier);
  }

  // ── Render ────────────────────────────────────────────────────────────
  const KIND_LABEL = {
    product: 'product', portal: 'portal', feature: 'feature',
    license: 'license', tool: 'tool', cert: 'cert',
    'acronym-only': 'acronym', 'disambiguation': 'disambiguation'
  };

  function renderResults(results, query) {
    const list = $('#bb-results');
    const empty = $('#bb-empty');
    const boot = $('#bb-boot');
    if (!list) return;

    if (!query) {
      list.innerHTML = '';
      if (empty) empty.hidden = true;
      if (boot) boot.hidden = false;
      STATE.selected = -1;
      return;
    }
    if (boot) boot.hidden = true;

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
      logMiss(query);                     // ← privacy-safe aggregate, deduped per session
      return;
    }

    if (empty) empty.hidden = true;

    const html = results.map((r, i) => {
      const e = r.e;
      const abbr = (e.abbreviations || [])[0];
      const status = e.status && e.status !== 'ga'
        ? `<span class="bb-result-status bb-status-${e.status}">${e.status}</span>` : '';
      const tier = `<span class="bb-result-tier" title="${r.reason}${r.hint ? ' — ' + r.hint : ''}">${r.tier <= 4 ? '↵' : '·'}</span>`;
      const hint = r.hint ? `<span class="bb-result-hint">// ${r.hint}</span>` : '';
      return `
        <li class="bb-result" data-idx="${i}" data-url="${e.url}" role="option" aria-selected="${i === STATE.selected}">
          <a href="${e.url}" class="bb-result-link">
            ${tier}
            <span class="bb-result-slug">${e.slug}${abbr && abbr.toLowerCase() !== e.slug.toLowerCase() ? ' <em>(' + abbr.toLowerCase() + ')</em>' : ''}</span>
            <span class="bb-result-name">${escapeHtml(e.name)}</span>
            <span class="bb-result-meta">[ ${KIND_LABEL[e.kind] || e.kind} :: ${e.domain} ]</span>
            ${status}
            ${hint}
          </a>
        </li>
      `;
    }).join('');
    list.innerHTML = html;
    STATE.selected = 0;
    setSelected(0);
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  // ── Privacy-safe miss tracking ────────────────────────────────────────
  // Fire-and-forget POST to /api/log-miss when a search returns zero hits.
  // De-dupe per (term, session) via sessionStorage so backspace-retyping
  // doesn't multiply the count. Term shape gated by the same regex the
  // server uses (slug-shaped, 1..50 chars).
  const MISS_RE = /^[a-z0-9][a-z0-9-]{0,49}$/;
  function logMiss(rawTerm) {
    if (typeof rawTerm !== 'string') return;
    const term = rawTerm.trim().toLowerCase();
    if (!term || !MISS_RE.test(term)) return;
    try {
      const key = 'bb_miss:' + term;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
      // keepalive: true → request survives the page navigating away.
      fetch('/api/log-miss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term }),
        keepalive: true,
        credentials: 'omit',
      }).catch(() => {});
    } catch (e) {
      /* sessionStorage may be unavailable in private modes — silently ignore */
    }
  }

  function setSelected(idx) {
    const items = $$('#bb-results .bb-result');
    if (!items.length) { STATE.selected = -1; return; }
    if (idx < 0) idx = items.length - 1;
    if (idx >= items.length) idx = 0;
    STATE.selected = idx;
    items.forEach((el, i) => {
      el.setAttribute('aria-selected', i === idx ? 'true' : 'false');
      el.classList.toggle('is-selected', i === idx);
    });
    items[idx].scrollIntoView({ block: 'nearest' });
  }

  // ── Wire up ───────────────────────────────────────────────────────────
  function init() {
    const input = $('#bb-input');
    if (!input) return;

    // Auto-focus the launcher on page load (unless user has already
    // started typing or focused another field). The deep-link branch
    // below also handles ?q= prefill.
    try {
      if (!document.activeElement || document.activeElement === document.body) {
        input.focus({ preventScroll: true });
      }
    } catch (e) { /* older browsers — silently ignore */ }

    fetch('/cmd-index.json', { cache: 'force-cache' })
      .then(r => r.json())
      .then(data => {
        STATE.entries = data.entries || [];
        STATE.ready = true;
        const status = $('#bb-input-status');
        if (status) status.textContent = String(STATE.entries.length) + ' entries';

        // ?q= deep-link
        const params = new URLSearchParams(location.search);
        const initialQ = params.get('q');
        if (initialQ) {
          input.value = initialQ;
          handleInput();
          // Auto-open on tier 1/2 exact-match deep-links
          if (STATE.results.length && STATE.results[0].tier <= 2) {
            location.href = STATE.results[0].e.url;
          }
        }
      })
      .catch(err => {
        const status = $('#bb-input-status');
        if (status) status.textContent = 'index unavailable';
        console.error('[brainbar] failed to load cmd-index.json', err);
      });

    function handleInput() {
      STATE.results = search(input.value);
      renderResults(STATE.results, input.value);
    }

    input.addEventListener('input', handleInput);

    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'ArrowDown') {
        ev.preventDefault(); setSelected(STATE.selected + 1);
      } else if (ev.key === 'ArrowUp') {
        ev.preventDefault(); setSelected(STATE.selected - 1);
      } else if (ev.key === 'Enter') {
        ev.preventDefault();
        if (!STATE.results.length) return;
        const top = STATE.results[0];
        if (top.tier <= 4 && STATE.selected <= 0) {
          // Tier 1-4: exact match (slug/abbr/alias/old-name) → open
          location.href = top.e.url;
        } else if (STATE.selected >= 0) {
          location.href = STATE.results[STATE.selected].e.url;
        }
      } else if (ev.key === 'Escape') {
        if (input.value) {
          input.value = '';
          handleInput();
        } else {
          input.blur();
        }
      }
    });

    // "/" global hotkey to focus input (Spotlight-style)
    document.addEventListener('keydown', (ev) => {
      if (ev.key !== '/') return;
      const tag = (document.activeElement && document.activeElement.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
      ev.preventDefault();
      input.focus();
      input.select();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
