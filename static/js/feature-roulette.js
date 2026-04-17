/* ============================================================================
   M365 Feature Roulette — feature-roulette.js
   Reads existing roadmap data (latest.json). Zero new data needed.
   ============================================================================ */
(function () {
  'use strict';

  let allItems = [];
  let filtered = [];
  let currentItem = null;
  let tracking = loadTracking();
  let dataLoaded = false;
  let dataLoading = false;
  let pendingProduct = null;

  function esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

  // ── Load roadmap data (lazy — only on first spin) ────────────────────────
  async function loadData() {
    if (dataLoaded || dataLoading) return dataLoaded;
    dataLoading = true;
    showLoading(true);
    try {
      const resp = await fetch('/data/roadmap/latest.json');
      if (!resp.ok) throw new Error('Failed to load');
      const data = await resp.json();
      allItems = (data.items || data || []).filter(item =>
        item.title && item.title.trim() &&
        item.status !== 'Cancelled' &&
        item.ai_summary && item.ai_summary.length > 20
      );
      buildProductFilter();
      updateCounts();
      dataLoaded = true;
    } catch (e) {
      console.error('Failed to load roadmap data:', e);
      showLoading(false);
      var card = document.getElementById('roulette-card');
      card.style.display = 'block';
      card.innerHTML = '<p style="color:#E74C3C;text-align:center;padding:2rem">Failed to load roadmap data. Please refresh.</p>';
    }
    dataLoading = false;
    showLoading(false);
    return dataLoaded;
  }

  function showLoading(show) {
    const btn = document.getElementById('btn-spin');
    if (show) {
      btn.textContent = '⏳ Loading...';
      btn.disabled = true;
    } else {
      btn.textContent = '🎰 Spin';
      btn.disabled = false;
    }
  }

  // ── Lobby ───────────────────────────────────────────────────────────────
  function hideLobby() {
    var lobby = document.getElementById('roulette-lobby');
    if (lobby) lobby.style.display = 'none';
    var controls = document.getElementById('roulette-controls');
    if (controls) controls.style.display = '';
  }

  function renderLobbyStats() {
    var el = document.getElementById('roulette-lobby-stats');
    if (!el) return;
    if (tracking.known.length > 0 || tracking.newToMe.length > 0) {
      el.style.display = '';
      document.getElementById('rl-known').textContent = tracking.known.length;
      document.getElementById('rl-new').textContent = tracking.newToMe.length;
    }
  }

  // ── Build product dropdown ───────────────────────────────────────────────
  function buildProductFilter() {
    const products = new Set();
    allItems.forEach(item => {
      const p = item.product_category_name || item.products || '';
      if (typeof p === 'string' && p.trim()) products.add(p.trim());
      if (Array.isArray(p)) p.forEach(t => products.add(t));
    });
    const select = document.getElementById('product-filter');
    [...products].sort().forEach(p => {
      const opt = document.createElement('option');
      opt.value = p; opt.textContent = p;
      select.appendChild(opt);
    });
  }

  // ── Filter ───────────────────────────────────────────────────────────────
  function getFiltered() {
    const product = document.getElementById('product-filter').value;
    if (product === 'all') return allItems;
    return allItems.filter(item => {
      const p = item.product_category_name || item.products || '';
      if (typeof p === 'string') return p === product;
      if (Array.isArray(p)) return p.includes(product);
      return false;
    });
  }

  // ── Spin ─────────────────────────────────────────────────────────────────
  async function spin() {
    hideLobby();
    const btn = document.getElementById('btn-spin');
    if (!dataLoaded) {
      btn.disabled = true;
      btn.textContent = '⏳ Loading...';
      const ok = await loadData();
      if (!ok) return;
    }

    if (pendingProduct) {
      const select = document.getElementById('product-filter');
      select.value = pendingProduct;
      if (!select.value) select.value = 'all';
      pendingProduct = null;
    }

    filtered = getFiltered();
    if (filtered.length === 0) { alert('No features found. Try a different filter.'); return; }

    // Prefer unseen items
    const unseen = filtered.filter(i => !tracking.known.includes(i.id) && !tracking.newToMe.includes(i.id));
    const pool = unseen.length > 0 ? unseen : filtered;
    currentItem = pool[Math.floor(Math.random() * pool.length)];

    const card = document.getElementById('roulette-card');
    card.style.display = 'block';
    card.style.animation = 'none';
    card.offsetHeight; // trigger reflow
    card.style.animation = '';

    document.getElementById('card-product').textContent = currentItem.product_category_name || currentItem.products || 'M365';
    document.getElementById('card-title').textContent = currentItem.title;
    document.getElementById('card-desc').textContent = (currentItem.ai_summary || '').slice(0, 300);
    document.getElementById('card-status').textContent = currentItem.status || '';
    document.getElementById('card-date').textContent = currentItem.modified || '';

    // Roadmap link
    const linkEl = document.getElementById('card-link');
    if (linkEl && currentItem.roadmap_url) {
      linkEl.href = currentItem.roadmap_url;
      linkEl.style.display = 'inline-block';
    } else if (linkEl) {
      linkEl.style.display = 'none';
    }
  }

  // ── Track ────────────────────────────────────────────────────────────────
  function markKnown() {
    if (!currentItem) return;
    const id = currentItem.id || currentItem.title;
    if (!tracking.known.includes(id)) tracking.known.push(id);
    tracking.newToMe = tracking.newToMe.filter(i => i !== id);
    saveTracking();
    updateCounts();
    spin();
  }

  function markNew() {
    if (!currentItem) return;
    const id = currentItem.id || currentItem.title;
    if (!tracking.newToMe.includes(id)) tracking.newToMe.push(id);
    tracking.known = tracking.known.filter(i => i !== id);
    saveTracking();
    updateCounts();
    spin();
  }

  // ── Persistence ──────────────────────────────────────────────────────────
  function loadTracking() {
    try {
      return JSON.parse(localStorage.getItem('roulette_tracking')) || { known: [], newToMe: [] };
    } catch { return { known: [], newToMe: [] }; }
  }
  function saveTracking() {
    try { localStorage.setItem('roulette_tracking', JSON.stringify(tracking)); } catch {}
  }
  function updateCounts() {
    document.getElementById('known-count').textContent = tracking.known.length;
    document.getElementById('new-count').textContent = tracking.newToMe.length;
  }

  // ── Tabs ─────────────────────────────────────────────────────────────────
  function initTabs() {
    document.querySelectorAll('.roulette-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.roulette-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        document.querySelectorAll('.roulette-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active'); tab.setAttribute('aria-selected', 'true');
        const p = document.getElementById('panel-' + tab.dataset.tab);
        if (p) p.classList.add('active');
      });
    });
  }

  // ── Init ─────────────────────────────────────────────────────────────────
  function init() {
    initTabs();
    updateCounts();
    renderLobbyStats();

    document.getElementById('btn-spin').addEventListener('click', spin);
    document.getElementById('btn-knew').addEventListener('click', markKnown);
    document.getElementById('btn-new').addEventListener('click', markNew);
    document.getElementById('product-filter').addEventListener('change', () => { filtered = getFiltered(); });

    // Lobby spin button
    document.getElementById('btn-lobby-spin').addEventListener('click', spin);

    // Product quick-picks
    document.querySelectorAll('.roulette-pick').forEach(function (pick) {
      pick.addEventListener('click', function () {
        pendingProduct = pick.dataset.product;
        spin();
      });
    });

    // Spacebar to spin
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !e.target.matches('input,textarea,select,button')) {
        e.preventDefault(); spin();
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
