/* ═══════════════════════════════════════════════════════════════════════════
   🪐 BRAIN BAR — Decode launcher (decode.js)  ·  errno mode
   Vanilla. Keyboard-first. No framework. No fuzzy/Levenshtein — error codes
   are pasted, not typed in casual English, so deterministic match is enough.

   Tiers (deterministic):
     1 exact code or slug           → preselect, Enter auto-opens
     2 prefix on code               → preselect, Enter opens top
     3 substring on code            → preselect, Enter opens top
     4 substring on short / plain   → preselect, Enter opens top
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const STATE = {
    entries: [],
    results: [],
    selected: -1,
    ready: false,
    lastQuery: '',
  };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function lc(s) { return String(s || '').toLowerCase(); }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function highlight(value, needle) {
    if (!needle || !value) return escapeHtml(value);
    const lcVal = lc(value);
    const lcNeedle = lc(needle);
    const idx = lcVal.indexOf(lcNeedle);
    if (idx < 0) return escapeHtml(value);
    const before = String(value).slice(0, idx);
    const hit    = String(value).slice(idx, idx + lcNeedle.length);
    const after  = String(value).slice(idx + lcNeedle.length);
    return escapeHtml(before) + '<mark class="bb-mark">' + escapeHtml(hit) + '</mark>' + escapeHtml(after);
  }

  function search(query) {
    const q = lc(query.trim());
    if (!q) return [];

    const exact = [];
    const prefix = [];
    const subCode = [];
    const subText = [];
    const seen = new Set();

    for (const e of STATE.entries) {
      const code = lc(e.code);
      const slug = lc(e.slug);
      const short = lc(e.short);
      const body = lc(e.plain_english);

      if (code === q || slug === q) {
        if (!seen.has(slug)) { exact.push({ entry: e, tier: 1 }); seen.add(slug); }
        continue;
      }
      if (code.startsWith(q) || slug.startsWith(q)) {
        if (!seen.has(slug)) { prefix.push({ entry: e, tier: 2 }); seen.add(slug); }
        continue;
      }
      if (code.indexOf(q) !== -1) {
        if (!seen.has(slug)) { subCode.push({ entry: e, tier: 3 }); seen.add(slug); }
        continue;
      }
      if (short.indexOf(q) !== -1 || body.indexOf(q) !== -1) {
        if (!seen.has(slug)) { subText.push({ entry: e, tier: 4 }); seen.add(slug); }
      }
    }

    return exact.concat(prefix, subCode, subText).slice(0, 12);
  }

  function render(results, query) {
    const ul = $('#bb-results');
    if (!ul) return;
    ul.innerHTML = '';
    STATE.results = results;
    STATE.selected = results.length > 0 ? 0 : -1;

    if (results.length === 0) {
      const empty = $('#bb-empty');
      const emptyTerm = $('#bb-empty-term');
      const emptySuggest = $('#bb-empty-suggest');
      if (query && empty && emptyTerm) {
        emptyTerm.textContent = query;
        if (emptySuggest) {
          emptySuggest.href = 'https://www.aguidetocloud.com/feedback/?topic=' +
            encodeURIComponent('Brain Bar decode — please add: ' + query);
        }
        empty.hidden = false;
      } else if (empty) {
        empty.hidden = true;
      }
      return;
    }
    const empty = $('#bb-empty');
    if (empty) empty.hidden = true;

    results.forEach((r, i) => {
      const e = r.entry;
      const li = document.createElement('li');
      li.className = 'bb-result' + (i === STATE.selected ? ' bb-result-selected' : '');
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', i === STATE.selected ? 'true' : 'false');
      li.innerHTML =
        '<a class="bb-result-link" href="' + escapeHtml(e.url) + '">' +
          '<span class="bb-result-tier" aria-hidden="true">' + (r.tier === 1 ? '↵' : '·') + '</span>' +
          '<span class="bb-result-slug bb-result-slug-decode">' + highlight(e.code, query) + '</span>' +
          '<span class="bb-result-name">' + highlight(e.short, query) + '</span>' +
          '<span class="bb-result-meta">[ ' + escapeHtml(e.namespace) + ' ]</span>' +
        '</a>';
      ul.appendChild(li);
    });
  }

  function setSelected(idx) {
    const lis = Array.from(document.querySelectorAll('#bb-results .bb-result'));
    if (lis.length === 0) return;
    if (idx < 0) idx = lis.length - 1;
    if (idx >= lis.length) idx = 0;
    STATE.selected = idx;
    lis.forEach((li, i) => {
      const isSel = i === idx;
      li.classList.toggle('bb-result-selected', isSel);
      li.setAttribute('aria-selected', isSel ? 'true' : 'false');
    });
    lis[idx].scrollIntoView({ block: 'nearest' });
  }

  function openSelected() {
    if (STATE.selected < 0 || STATE.selected >= STATE.results.length) return false;
    const r = STATE.results[STATE.selected];
    if (!r || !r.entry || !r.entry.url) return false;
    window.location.assign(r.entry.url);
    return true;
  }

  function bindInput() {
    const input = $('#bb-input');
    if (!input) return;

    input.addEventListener('input', () => {
      const q = input.value;
      STATE.lastQuery = q;
      if (!STATE.ready) return;
      render(search(q), q.trim());
    });

    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'ArrowDown') {
        ev.preventDefault();
        setSelected(STATE.selected + 1);
      } else if (ev.key === 'ArrowUp') {
        ev.preventDefault();
        setSelected(STATE.selected - 1);
      } else if (ev.key === 'Enter') {
        if (STATE.results.length > 0) {
          ev.preventDefault();
          openSelected();
        }
      } else if (ev.key === 'Escape') {
        if (input.value) {
          ev.preventDefault();
          input.value = '';
          render([], '');
        }
      }
    });

    document.addEventListener('keydown', (ev) => {
      if (ev.key !== '/' || ev.metaKey || ev.ctrlKey || ev.altKey) return;
      const target = ev.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      ev.preventDefault();
      input.focus();
    });
  }

  function setStatus(text) {
    const s = $('#bb-input-status');
    if (s) s.textContent = text;
  }

  async function load() {
    const url = '/decode/decode-index.json?v=' + Date.now();
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const payload = await res.json();
      STATE.entries = Array.isArray(payload.entries) ? payload.entries : [];
      STATE.ready = true;
      setStatus(STATE.entries.length + ' codes · type to filter · / to focus');
      const input = $('#bb-input');
      if (input && input.value) render(search(input.value), input.value.trim());
    } catch (err) {
      setStatus('failed to load index — refresh to retry');
      // eslint-disable-next-line no-console
      console.error('decode index load failed', err);
    }
  }

  function init() {
    bindInput();
    load();

    const input = $('#bb-input');
    if (input) {
      try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
