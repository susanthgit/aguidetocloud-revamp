document.addEventListener('DOMContentLoaded', async function () {
  var DATA_URL = '/data/roadmap/latest.json';
  var CACHE_VERSION = 'v6';
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
  var STATUS_META = { 'Rolling out': { color: '#00CC33', label: 'Rolling Out' }, 'In development': { color: '#F59E0B', label: 'In Dev' }, 'Launched': { color: '#06B6D4', label: 'Launched' }, 'Cancelled': { color: '#EF4444', label: 'Cancelled' } };

  // URL state for shareable links
  function readUrl() { var p = new URLSearchParams(location.search); if (p.get('product')) activeProductFilter = p.get('product'); if (p.get('status')) activeStatusFilter = p.get('status'); if (p.get('q')) document.getElementById('rdmap-search').value = p.get('q'); }
  function syncUrl() { var p = new URLSearchParams(); if (activeProductFilter !== 'copilot') p.set('product', activeProductFilter); if (activeStatusFilter !== 'all') p.set('status', activeStatusFilter); var q = document.getElementById('rdmap-search').value; if (q) p.set('q', q); var s = p.toString(); history.replaceState(null, '', s ? '?' + s : location.pathname); }

  // ── LOAD ──
  async function init() {
    try {
      var data = await fetchData();
      if (!Array.isArray(data.items)) data.items = [];
      currentData = data;
      renderHero(data); populateProductFilter(data.product_categories || []);
      renderChips(data); render(); renderFreshness(data.generated_at); renderBrowse();
    } catch (e) {
      document.getElementById('rdmap-content').innerHTML = '<p class="rdmap-empty">Roadmap data not available yet. Check back tomorrow!</p>';
    }
  }

  // ── HERO ──
  function renderHero(data) {
    var sub = document.getElementById('rdmap-hero-sub');
    if (sub && data.items.length) {
      var cats = new Set(); data.items.forEach(function (i) { cats.add(i.product_category); });
      sub.textContent = 'Tracking ' + data.items.length.toLocaleString() + ' features across ' + cats.size + ' products';
    }
  }

  // ── STATUS BAR (clickable) ──
  function renderStatusBar(data) {
    var el = document.getElementById('rdmap-status-bar');
    var items = data.items || []; var sc = {}; items.forEach(function (i) { sc[i.status] = (sc[i.status] || 0) + 1; });
    var total = (sc['Rolling out'] || 0) + (sc['In development'] || 0) + (sc['Launched'] || 0) + (sc['Cancelled'] || 0);
    if (!total) { el.innerHTML = ''; return; }
    var segs = [{ s: 'Rolling out', c: sc['Rolling out'] || 0, col: '#00CC33' }, { s: 'In development', c: sc['In development'] || 0, col: '#F59E0B' }, { s: 'Launched', c: sc['Launched'] || 0, col: '#06B6D4' }, { s: 'Cancelled', c: sc['Cancelled'] || 0, col: '#EF4444' }];
    var html = '<div class="rdmap-bar-track">';
    segs.forEach(function (x) { if (x.c > 0) html += '<div class="rdmap-bar-seg" style="width:' + (x.c / total * 100).toFixed(1) + '%;background:' + x.col + '" title="' + x.s + ': ' + x.c + '" data-status="' + x.s + '"></div>'; });
    html += '</div><div class="rdmap-bar-legend">';
    segs.forEach(function (x) { if (x.c > 0) html += '<span class="rdmap-legend-item" data-status="' + x.s + '"><span class="rdmap-legend-dot" style="background:' + x.col + '"></span>' + x.s + ' <b>' + x.c + '</b></span>'; });
    el.innerHTML = html + '</div>';
    el.querySelectorAll('[data-status]').forEach(function (e) { e.style.cursor = 'pointer'; e.addEventListener('click', function () { activeStatusFilter = this.dataset.status; document.getElementById('rdmap-status-filter').value = activeStatusFilter; applyFilters(); }); });
  }

  function populateProductFilter(cats) { var sel = document.getElementById('rdmap-product-filter'), v = sel.value; sel.innerHTML = '<option value="all">All Products</option>'; cats.forEach(function (c) { if (c.count > 0) { var o = document.createElement('option'); o.value = c.id; o.textContent = c.name + ' (' + c.count + ')'; sel.appendChild(o); } }); sel.value = v || 'all'; }

  // ── CHIPS (dynamic counts) ──
  function renderChips(data) {
    var el = document.getElementById('rdmap-chips');
    var items = data.items || []; var cats = data.product_categories || [];
    var counts = {}; items.forEach(function (i) {
      if (activeStatusFilter === 'all' || (activeStatusFilter === 'active' && i.status !== 'Launched') || i.status === activeStatusFilter) {
        (i.all_categories || [i.product_category]).forEach(function (c) { counts[c] = (counts[c] || 0) + 1; });
      }
    });
    var html = '<button class="rdmap-chip' + (activeProductFilter === 'all' ? ' active' : '') + '" data-cat="all">All</button>';
    cats.forEach(function (c) { var cnt = counts[c.id] || 0; var m = CATEGORY_META[c.id] || {}; html += '<button class="rdmap-chip' + (activeProductFilter === c.id ? ' active' : '') + '" data-cat="' + c.id + '" style="--chip-c:' + (m.color || '#888') + '">' + (m.emoji || '') + ' ' + esc(c.name) + ' <span>' + cnt + '</span></button>'; });
    el.innerHTML = html;
    el.querySelectorAll('.rdmap-chip').forEach(function (b) { b.addEventListener('click', function () { el.querySelectorAll('.rdmap-chip').forEach(function (x) { x.classList.remove('active'); }); this.classList.add('active'); activeProductFilter = this.dataset.cat; document.getElementById('rdmap-product-filter').value = activeProductFilter; applyFilters(); }); });
  }

  // ── FILTER ──
  function getFiltered() {
    if (!currentData) return [];
    var q = (document.getElementById('rdmap-search').value || '').toLowerCase();
    return currentData.items.filter(function (i) {
      if (activeStatusFilter === 'active' && i.status === 'Launched') return false;
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
    if (!currentFiltered.length) { content.innerHTML = '<p class="rdmap-empty">No items match your filters.</p>'; return; }
    content.innerHTML = '<div class="rdmap-list-info">Showing <b>' + currentFiltered.length + '</b> items</div><div class="rdmap-list" id="rdmap-list"></div>';
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

  function listRow(item) {
    var st = STATUS_META[item.status] || { color: '#666', label: '?' };
    var cat = CATEGORY_META[item.product_category] || {};
    var summary = item.ai_summary || '';
    return '<a href="' + esc(item.roadmap_url) + '" target="_blank" rel="noopener" class="rdmap-row" data-id="' + item.id + '">'
      + '<div class="rdmap-row-status"><span class="rdmap-st" style="background:' + st.color + '">' + st.label + '</span></div>'
      + '<div class="rdmap-row-main">'
      + '<div class="rdmap-row-title">' + esc(item.title) + '</div>'
      + (summary ? '<div class="rdmap-row-desc">' + esc(summary) + '</div>' : '')
      + '</div>'
      + '<div class="rdmap-row-meta">'
      + '<span class="rdmap-row-product" style="color:' + (cat.color || '#888') + '">' + (cat.emoji || '') + ' ' + esc(item.product_category_name || '') + '</span>'
      + '<span class="rdmap-row-date">' + esc(item.ga_date || '\u2014') + (item.is_delayed ? ' <span class="rdmap-delayed">DELAYED</span>' : '') + '</span>'
      + '</div></a>';
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
  });

  // HELPERS
  function timeAgo(d) { if (!d) return ''; var ms = new Date() - new Date(d), m = Math.floor(ms / 60000); if (m < 60) return m + 'm ago'; var h = Math.floor(m / 60); if (h < 24) return h + 'h ago'; var days = Math.floor(h / 24); return days < 7 ? days + 'd ago' : new Date(d).toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' }); }
  function esc(s) { return s ? s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : ''; }

  // Back to top
  var btt = document.getElementById('rdmap-btt');
  if (btt) { window.addEventListener('scroll', function () { btt.classList.toggle('rdmap-btt-show', window.scrollY > 400); }); btt.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); }); }

  // Keyboard: / to focus search
  document.addEventListener('keydown', function (e) { if (e.key === '/' && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); document.getElementById('rdmap-search').focus(); } });

  // Events
  document.getElementById('rdmap-status-filter').addEventListener('change', function () { activeStatusFilter = this.value; applyFilters(); });
  document.getElementById('rdmap-product-filter').addEventListener('change', function () { activeProductFilter = this.value; document.querySelectorAll('.rdmap-chip').forEach(function (c) { c.classList.toggle('active', c.dataset.cat === activeProductFilter); }); applyFilters(); });
  document.getElementById('rdmap-search').addEventListener('input', debounce(applyFilters, 250));

  // Category page support
  if (window.__roadmapCategoryFilter) {
    activeProductFilter = window.__roadmapCategoryFilter;
  }

  // Init
  readUrl();
  document.getElementById('rdmap-status-filter').value = activeStatusFilter;
  await init();
});
