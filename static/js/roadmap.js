document.addEventListener('DOMContentLoaded', async function () {
  var DATA_URL = '/data/roadmap/latest.json';
  var CACHE_VERSION = 'v7';
  var PAGE_SIZE = 50;
  var _cache = null;

  async function fetchData() {
    if (_cache) return _cache;
    var ck = 'rdmap_' + CACHE_VERSION;
    var c = sessionStorage.getItem(ck);
    if (c) { try { _cache = JSON.parse(c); return _cache; } catch (e) {} }
    var r = await fetch(DATA_URL); if (!r.ok) throw new Error('HTTP ' + r.status);
    var d = await r.json(); _cache = d;
    var s = JSON.stringify(d); if (s.length < 2000000) { try { sessionStorage.setItem(ck, s); } catch (e) {} }
    return d;
  }

  function debounce(fn, ms) { var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; }

  var currentData = null, currentFiltered = [], renderedCount = 0;
  var activeProductFilter = 'copilot', activeStatusFilter = 'all';

  var CATEGORY_META = {
    'copilot': { name: 'Copilot', emoji: '\u{1F916}', color: '#7B68EE' },
    'teams': { name: 'Teams', emoji: '\u{1F4AC}', color: '#6264A7' },
    'outlook': { name: 'Outlook & Exchange', emoji: '\u{1F4E7}', color: '#0078D4' },
    'sharepoint': { name: 'SharePoint & OneDrive', emoji: '\u{1F4C2}', color: '#038387' },
    'office-apps': { name: 'Office Apps', emoji: '\u{1F4CA}', color: '#D83B01' },
    'purview': { name: 'Purview & Security', emoji: '\u{1F6E1}\uFE0F', color: '#E74856' },
    'intune': { name: 'Intune & Devices', emoji: '\u{1F4F1}', color: '#00BCF2' },
    'viva': { name: 'Viva', emoji: '\u{1F3E2}', color: '#6C33A3' },
    'entra': { name: 'Entra', emoji: '\u{1F464}', color: '#0078D4' },
    'admin': { name: 'Admin & Platform', emoji: '\u2699\uFE0F', color: '#5C2D91' },
    'edge-media': { name: 'Edge & Media', emoji: '\u{1F310}', color: '#3C8527' }
  };
  var STATUS_META = { 'Rolling out': { color: '#059669', label: 'Rolling Out' }, 'In development': { color: '#D97706', label: 'In Dev' }, 'Launched': { color: '#0891B2', label: 'Launched' }, 'Cancelled': { color: '#DC2626', label: 'Cancelled' } };

  // URL state for shareable links
  function readUrl() { var p = new URLSearchParams(location.search); if (p.get('product')) activeProductFilter = p.get('product'); if (p.get('status')) activeStatusFilter = p.get('status'); if (p.get('q')) document.getElementById('rdmap-search').value = p.get('q'); }
  function syncUrl() { var p = new URLSearchParams(); if (activeProductFilter !== 'all') p.set('product', activeProductFilter); if (activeStatusFilter !== 'all') p.set('status', activeStatusFilter); var q = document.getElementById('rdmap-search').value; if (q) p.set('q', q); var s = p.toString(); history.replaceState(null, '', s ? '?' + s : location.pathname); }

  // ── LOAD ──
  async function init() {
    try {
      var data = await fetchData();
      if (!Array.isArray(data.items)) data.items = [];
      currentData = data;
      populateProductFilter(data.product_categories || []);
      renderChips(data); render(); renderFreshness(data.generated_at); renderBrowse();
    } catch (e) {
      document.getElementById('rdmap-content').innerHTML = '<div class="rdmap-empty"><p>⚠️ Roadmap data could not be loaded.</p><button onclick="location.reload()" class="rdmap-clear-btn" style="margin-top:0.8rem">Retry</button></div>';
    }
  }

  function populateProductFilter() { /* Dropdown removed in V2 audit — chips are the primary filter */ }

  // ── CHIPS ──
  function renderChips(data) {
    var el = document.getElementById('rdmap-chips');
    var cats = data.product_categories || [];
    var html = '<button class="rdmap-chip' + (activeProductFilter === 'all' ? ' active' : '') + '" data-cat="all" aria-pressed="' + (activeProductFilter === 'all') + '">All</button>';
    cats.forEach(function (c) { var m = CATEGORY_META[c.id] || {}; var isActive = activeProductFilter === c.id; html += '<button class="rdmap-chip' + (isActive ? ' active' : '') + '" data-cat="' + c.id + '" aria-pressed="' + isActive + '" style="--chip-c:' + (m.color || '#888') + '">' + (m.emoji || '') + ' ' + esc(c.name) + '</button>'; });
    el.innerHTML = html;
    el.querySelectorAll('.rdmap-chip').forEach(function (b) { b.addEventListener('click', function () { el.querySelectorAll('.rdmap-chip').forEach(function (x) { x.classList.remove('active'); x.setAttribute('aria-pressed', 'false'); }); this.classList.add('active'); this.setAttribute('aria-pressed', 'true'); activeProductFilter = this.dataset.cat; applyFilters(); }); });
  }

  // ── FILTER ──
  function getFiltered() {
    if (!currentData) return [];
    var q = (document.getElementById('rdmap-search').value || '').toLowerCase();
    return currentData.items.filter(function (i) {
      if (activeStatusFilter === 'active' && (i.status === 'Launched' || i.status === 'Cancelled')) return false;
      if (activeStatusFilter !== 'all' && activeStatusFilter !== 'active' && i.status !== activeStatusFilter) return false;
      if (activeProductFilter !== 'all') { if (i.product_category !== activeProductFilter && (i.all_categories || []).indexOf(activeProductFilter) === -1) return false; }
      if (q) { var t = ((i.title || '') + ' ' + (i.ai_summary || '') + ' ' + (i.products || []).join(' ')).toLowerCase(); if (t.indexOf(q) === -1) return false; }
      return true;
    });
  }

  // ── RENDER ──
  function render() {
    currentFiltered = getFiltered();
    renderedCount = 0;
    var content = document.getElementById('rdmap-content');
    if (!currentFiltered.length) {
      content.innerHTML = '<p class="rdmap-empty">No items match your filters. <button class="rdmap-clear-btn" id="rdmap-clear">Clear filters</button></p>';
      var clearBtn = document.getElementById('rdmap-clear');
      if (clearBtn) clearBtn.addEventListener('click', clearAllFilters);
      return;
    }
    var clearHtml = (activeProductFilter !== 'all' || activeStatusFilter !== 'all' || document.getElementById('rdmap-search').value) ? ' <button class="rdmap-clear-btn" id="rdmap-clear">✕ Clear filters</button>' : '';
    content.innerHTML = '<div class="rdmap-list-info">Showing <b>' + currentFiltered.length + '</b> of <b>' + currentData.items.length + '</b> items' + clearHtml + '</div><div class="rdmap-list" id="rdmap-list"></div>';
    var clearBtn2 = document.getElementById('rdmap-clear');
    if (clearBtn2) clearBtn2.addEventListener('click', clearAllFilters);
    loadMore();
  }

  function loadMore() {
    var container = document.getElementById('rdmap-list');
    if (!container) return;
    var end = Math.min(renderedCount + PAGE_SIZE, currentFiltered.length);
    var html = '';
    for (var i = renderedCount; i < end; i++) html += listRow(currentFiltered[i]);
    container.insertAdjacentHTML('beforeend', html);
    renderedCount = end;
    var old = document.getElementById('rdmap-load-more');
    if (old) old.remove();
    if (renderedCount < currentFiltered.length) {
      var btn = document.createElement('button'); btn.id = 'rdmap-load-more'; btn.className = 'rdmap-load-more';
      btn.textContent = 'Load more (' + (currentFiltered.length - renderedCount) + ' remaining)';
      btn.addEventListener('click', loadMore);
      container.parentNode.appendChild(btn);
    }
  }

  // Favourites (localStorage)
  var _favKey = 'rdmap_favourites';
  var _favs = {};
  try { _favs = JSON.parse(localStorage.getItem(_favKey) || '{}'); } catch(e) { _favs = {}; }
  function isFav(id) { return !!_favs[id]; }
  function toggleFav(id) {
    if (_favs[id]) { delete _favs[id]; } else { _favs[id] = true; }
    try { localStorage.setItem(_favKey, JSON.stringify(_favs)); } catch(e) {}
  }

  function listRow(item) {
    var st = STATUS_META[item.status] || { color: '#666', label: '?' };
    var cat = CATEGORY_META[item.product_category] || {};
    var summary = item.ai_summary || '';
    var favClass = isFav(item.id) ? ' rdmap-fav-active' : '';
    return '<div class="rdmap-row-wrap">'
      + '<button class="rdmap-fav' + favClass + '" data-fav-id="' + item.id + '" aria-label="Favourite" title="Watch this item">★</button>'
      + '<a href="' + esc(item.roadmap_url) + '" target="_blank" rel="noopener noreferrer" class="rdmap-row" data-id="' + item.id + '" style="border-left:3px solid ' + (cat.color || '#3D3648') + '">'
      + '<div class="rdmap-row-status"><span class="rdmap-st" style="background:' + st.color + '">' + st.label + '</span></div>'
      + '<div class="rdmap-row-main">'
      + '<div class="rdmap-row-title">' + esc(item.title) + '</div>'
      + (summary ? '<div class="rdmap-row-desc">' + esc(summary) + '</div>' : '')
      + '</div>'
      + '<div class="rdmap-row-meta">'
      + '<span class="rdmap-row-product" style="color:' + (cat.color || '#888') + '">' + (cat.emoji || '') + ' ' + esc(item.product_category_name || '') + '</span>'
      + '<span class="rdmap-row-date">' + esc(item.ga_date || '\u2014') + (item.is_delayed ? ' <span class="rdmap-delayed">DELAYED</span>' : '') + '</span>'
      + '</div></a></div>';
  }

  function clearAllFilters() {
    activeProductFilter = 'all'; activeStatusFilter = 'all';
    document.getElementById('rdmap-search').value = '';
    document.getElementById('rdmap-status-filter').value = 'all';
    applyFilters();
  }

  function applyFilters() {
    render();
    if (currentData) renderChips(currentData);
    syncUrl();
  }

  function renderFreshness(dt) { var el = document.getElementById('rdmap-freshness'); if (dt) el.textContent = 'Updated ' + timeAgo(dt); }

  function renderBrowse() {
    var el = document.getElementById('rdmap-browse');
    var html = '';
    Object.keys(CATEGORY_META).forEach(function (k, i) { var m = CATEGORY_META[k]; if (i > 0) html += ' \u00B7 '; html += '<a href="/m365-roadmap/' + k + '/">' + m.emoji + ' ' + m.name + '</a>'; });
    el.innerHTML = html;
  }

  // CSV
  document.getElementById('rdmap-csv').addEventListener('click', function () {
    if (!currentFiltered.length) return;
    var csv = ['ID,Title,Status,Product,GA Date,Delayed,Summary,URL'];
    currentFiltered.forEach(function (i) { csv.push([i.id, '"' + (i.title || '').replace(/"/g, '""') + '"', i.status, (i.products || []).join('; '), i.ga_date || '', i.is_delayed ? 'Yes' : '', '"' + (i.ai_summary || '').replace(/"/g, '""') + '"', i.roadmap_url || ''].join(',')); });
    var b = new Blob([csv.join('\n')], { type: 'text/csv' }), u = URL.createObjectURL(b), a = document.createElement('a'); a.href = u; a.download = 'm365-roadmap-' + new Date().toISOString().slice(0, 10) + '.csv'; a.click(); URL.revokeObjectURL(u);
    if (window.clarity) window.clarity('event', 'roadmap_csv_export');
  });

  // HELPERS
  function timeAgo(d) { if (!d) return ''; var ms = new Date() - new Date(d), m = Math.floor(ms / 60000); if (m < 60) return m + 'm ago'; var h = Math.floor(m / 60); if (h < 24) return h + 'h ago'; var days = Math.floor(h / 24); return days < 7 ? days + 'd ago' : new Date(d).toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' }); }
  function esc(s) { return s ? s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : ''; }

  // Back-to-top is now global (baseof.html)

  // Keyboard: / to focus search
  document.addEventListener('keydown', function (e) { if (e.key === '/' && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); document.getElementById('rdmap-search').focus(); } });

  // Events
  document.getElementById('rdmap-status-filter').addEventListener('change', function () { activeStatusFilter = this.value; applyFilters(); });
  document.getElementById('rdmap-search').addEventListener('input', debounce(applyFilters, 250));

  // Favourite clicks (delegated)
  document.addEventListener('click', function (e) {
    var favBtn = e.target.closest('.rdmap-fav');
    if (!favBtn) return;
    e.preventDefault();
    e.stopPropagation();
    var id = favBtn.dataset.favId;
    toggleFav(id);
    favBtn.classList.toggle('rdmap-fav-active');
    if (window.clarity) window.clarity('event', 'roadmap_favourite');
  });

  // Category page support
  if (window.__roadmapCategoryFilter) {
    activeProductFilter = window.__roadmapCategoryFilter;
  }

  // Init
  readUrl();
  document.getElementById('rdmap-status-filter').value = activeStatusFilter;
  await init();
});
