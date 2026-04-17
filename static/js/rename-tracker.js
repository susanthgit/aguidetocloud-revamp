/* ============================================================================
   M365 Rename Tracker — rename-tracker.js
   ============================================================================ */
(function () {
  'use strict';

  const ALL = window.__renameProducts || [];

  function esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

  // ── Search + filter ──────────────────────────────────────────────────────
  function getResults() {
    const q = (document.getElementById('rename-search').value || '').toLowerCase().trim();
    const cat = document.getElementById('cat-filter').value;

    return ALL.filter(p => {
      if (cat !== 'all' && p.category !== cat) return false;
      if (!q) return true;
      // Search current name, all old names, description
      if (p.current_name.toLowerCase().includes(q)) return true;
      if (p.description && p.description.toLowerCase().includes(q)) return true;
      if (p.renames) {
        for (const r of p.renames) {
          if (r.from.toLowerCase().includes(q) || r.to.toLowerCase().includes(q)) return true;
        }
      }
      return false;
    });
  }

  // ── Render results ───────────────────────────────────────────────────────
  function render() {
    const results = getResults();
    const el = document.getElementById('rename-results');
    document.getElementById('rename-count').textContent = `Showing ${results.length} of ${ALL.length} products`;

    if (results.length === 0) {
      el.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.4);padding:2rem">No products found. Try a different search term.</p>';
      return;
    }

    el.innerHTML = results.map(p => {
      const renames = (p.renames || []).sort((a, b) => b.date.localeCompare(a.date));
      const timeline = renames.map(r => `
        <div class="rename-event">
          <span class="rename-event-date">${esc(r.date)}</span>
          <div class="rename-event-names">
            <span class="old">${esc(r.from)}</span>
            <span class="arrow">→</span>
            <span>${esc(r.to)}</span>
          </div>
          ${r.note ? `<div class="rename-event-note">${esc(r.note)}</div>` : ''}
        </div>
      `).join('');

      return `
        <div class="rename-card">
          <div class="rename-card-header">
            <span class="rename-card-name">${esc(p.current_name)}</span>
            <span class="rename-card-cat">${esc(p.category)}</span>
          </div>
          ${p.description ? `<div class="rename-card-desc">${esc(p.description)}</div>` : ''}
          ${p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer" class="rename-card-link">Official docs ↗</a>` : ''}
          ${renames.length > 0 ? `<div class="rename-timeline">${timeline}</div>` : '<div style="color:rgba(255,255,255,0.3);font-size:0.8rem;margin-top:0.5rem">No recorded renames</div>'}
        </div>
      `;
    }).join('');
  }

  // ── Leaderboard ──────────────────────────────────────────────────────────
  function renderLeaderboard() {
    const sorted = [...ALL]
      .map(p => ({ name: p.current_name, count: (p.renames || []).length }))
      .filter(p => p.count > 0)
      .sort((a, b) => b.count - a.count);

    const el = document.getElementById('rename-leaderboard');
    el.innerHTML = '<h3 style="color:rgba(255,255,255,0.8);margin-bottom:1rem">🏆 Most Renamed Products</h3>' +
      sorted.map((p, i) => `
        <div class="rename-lb-item">
          <span class="rename-lb-rank">${i + 1}</span>
          <span class="rename-lb-name">${esc(p.name)}</span>
          <span class="rename-lb-count">${p.count} rename${p.count !== 1 ? 's' : ''}</span>
        </div>
      `).join('');
  }

  // ── Tabs ─────────────────────────────────────────────────────────────────
  function initTabs() {
    document.querySelectorAll('.rename-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.rename-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        document.querySelectorAll('.rename-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active'); tab.setAttribute('aria-selected', 'true');
        const p = document.getElementById('panel-' + tab.dataset.tab);
        if (p) p.classList.add('active');
      });
    });
  }

  // ── Init ─────────────────────────────────────────────────────────────────
  function init() {
    initTabs();
    render();
    renderLeaderboard();

    let debounce;
    document.getElementById('rename-search').addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(render, 200);
    });
    document.getElementById('cat-filter').addEventListener('change', render);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
