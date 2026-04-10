document.addEventListener('DOMContentLoaded', async function () {
  var DATA_URLS = { latest: '/data/roadmap/latest.json', weekly: '/data/roadmap/weekly.json', monthly: '/data/roadmap/monthly.json' };
  var CACHE_VERSION = 'v4';
  var _cache = {};

  async function fetchJson(url) {
    var ck = 'rdmap_' + CACHE_VERSION + '_' + url;
    if (_cache[url]) return _cache[url];
    var c = sessionStorage.getItem(ck);
    if (c) { try { _cache[url] = JSON.parse(c); return _cache[url]; } catch (e) {} }
    var r = await fetch(url); if (!r.ok) throw new Error('HTTP ' + r.status);
    var d = await r.json(); _cache[url] = d;
    var s = JSON.stringify(d); if (s.length < 2000000) { try { sessionStorage.setItem(ck, s); } catch (e) {} }
    try { sessionStorage.removeItem('roadmap_' + url); sessionStorage.removeItem('rdmap_v2_' + url); } catch (e) {}
    return d;
  }

  function debounce(fn, ms) { var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; }

  // State
  var currentData = null, activeLayout = 'list', activeProductFilter = 'all', activeStatusFilter = 'active', activeSort = 'default';
  var favorites = JSON.parse(localStorage.getItem('rdmap_favs') || '{}');

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
  var STATUS_META = {
    'Rolling out': { color: '#00CC33', label: 'Rolling Out' },
    'In development': { color: '#F59E0B', label: 'In Dev' },
    'Launched': { color: '#06B6D4', label: 'Launched' },
    'Cancelled': { color: '#EF4444', label: 'Cancelled' }
  };
  var CHANGE_BADGES = {
    'new': { label: 'NEW', color: '#10B981', icon: '\u25CF' },
    'status_changed': { label: 'STATUS', color: '#06B6D4', icon: '\u21BB' },
    'date_changed': { label: 'DATE', color: '#F59E0B', icon: '\u25F7' },
    'updated': { label: 'UPDATED', color: '#8B5CF6', icon: '\u270E' }
  };
  var PLAT_ICONS = { 'Web': '\u{1F310}', 'Desktop': '\u{1F4BB}', 'iOS': '\u{1F4F1}', 'Android': '\u{1F916}', 'Mac': '\u{1F34E}', 'Linux': '\u{1F427}' };

  // URL state
  function readUrlParams() {
    var p = new URLSearchParams(window.location.search);
    if (p.get('product')) activeProductFilter = p.get('product');
    if (p.get('status')) activeStatusFilter = p.get('status');
    if (p.get('q')) document.getElementById('rdmap-search').value = p.get('q');
    if (p.get('sort')) activeSort = p.get('sort');
  }
  function syncUrl() {
    var p = new URLSearchParams();
    if (activeProductFilter !== 'all') p.set('product', activeProductFilter);
    if (activeStatusFilter !== 'active') p.set('status', activeStatusFilter);
    var q = document.getElementById('rdmap-search').value;
    if (q) p.set('q', q);
    if (activeSort !== 'default') p.set('sort', activeSort);
    var str = p.toString();
    history.replaceState(null, '', str ? '?' + str : window.location.pathname);
  }

  // ── LOAD ──
  async function loadView(view) {
    var content = document.getElementById('rdmap-content');
    content.innerHTML = '<div class="rdmap-skeleton"><div class="rdmap-skeleton-row"></div><div class="rdmap-skeleton-row"></div><div class="rdmap-skeleton-row"></div></div>';
    try {
      var data = await fetchJson(DATA_URLS[view] || DATA_URLS.latest);
      if (!Array.isArray(data.items)) data.items = [];
      if (!Array.isArray(data.product_categories)) data.product_categories = [];
      currentData = data;
      renderStatusBar(data); renderMetrics(data);
      populateProductFilter(data.product_categories); renderChips(data.product_categories);
      renderTimeline(data.items); renderContent(data); renderFreshness(data.generated_at);
    } catch (e) {
      if (view !== 'latest') { content.innerHTML = '<p class="rdmap-empty">No ' + view + ' data yet.</p>'; setTimeout(function () { loadView('latest'); }, 1200); }
      else { content.innerHTML = '<p class="rdmap-empty">Roadmap data not available yet. Check back tomorrow!</p>'; }
    }
  }

  // ── STATUS BAR (clickable segments) ──
  function renderStatusBar(data) {
    var el = document.getElementById('rdmap-status-bar');
    // Compute from actual items in this view
    var items = data.items || [];
    var sc = {}; items.forEach(function (i) { var s = i.status || '?'; sc[s] = (sc[s] || 0) + 1; });
    var total = (sc['Rolling out'] || 0) + (sc['In development'] || 0) + (sc['Launched'] || 0) + (sc['Cancelled'] || 0);
    if (!total) { el.innerHTML = ''; return; }
    var segs = [
      { status: 'Rolling out', count: sc['Rolling out'] || 0, color: '#00CC33' },
      { status: 'In development', count: sc['In development'] || 0, color: '#F59E0B' },
      { status: 'Launched', count: sc['Launched'] || 0, color: '#06B6D4' },
      { status: 'Cancelled', count: sc['Cancelled'] || 0, color: '#EF4444' }
    ];
    var html = '<div class="rdmap-bar-track">';
    segs.forEach(function (s) { if (s.count > 0) { var pct = (s.count / total * 100).toFixed(1); html += '<div class="rdmap-bar-seg" style="width:' + pct + '%;background:' + s.color + '" title="' + s.status + ': ' + s.count + '" data-status="' + s.status + '"></div>'; } });
    html += '</div><div class="rdmap-bar-legend">';
    segs.forEach(function (s) { if (s.count > 0) html += '<span class="rdmap-legend-item" data-status="' + s.status + '"><span class="rdmap-legend-dot" style="background:' + s.color + '"></span>' + s.status + ' <b>' + s.count + '</b></span>'; });
    html += '</div>';
    el.innerHTML = html;
    // Click segments/legends to filter
    el.querySelectorAll('[data-status]').forEach(function (e) {
      e.style.cursor = 'pointer';
      e.addEventListener('click', function () {
        activeStatusFilter = this.dataset.status;
        document.getElementById('rdmap-status-filter').value = activeStatusFilter;
        applyFilters(); syncUrl();
      });
    });
  }

  // ── METRICS (animated counters) ──
  function renderMetrics(data) {
    var el = document.getElementById('rdmap-metrics');
    // Compute stats from actual items in this view (not pre-computed totals)
    var items = data.items || [];
    var sc = {}; items.forEach(function (i) { var s = i.status || '?'; sc[s] = (sc[s] || 0) + 1; });
    var active = items.filter(function (i) { return i.status !== 'Launched'; }).length;
    var delayed = items.filter(function (i) { return i.is_delayed; }).length;
    var changed = items.filter(function (i) { return i.change_type; }).length;
    var metrics = [
      { value: active, label: 'Active', icon: '\u26A1' },
      { value: sc['Rolling out'] || 0, label: 'Rolling Out', icon: '\u{1F7E2}' },
      { value: sc['In development'] || 0, label: 'In Dev', icon: '\u{1F7E1}' },
    ];
    if (delayed > 0) metrics.push({ value: delayed, label: 'Delayed', icon: '\u26A0\uFE0F', highlight: true });
    if (changed > 0) metrics.push({ value: changed, label: 'Changes', icon: '\u{1F504}', highlight: true });
    el.innerHTML = metrics.map(function (m) {
      return '<div class="rdmap-metric' + (m.highlight ? ' rdmap-metric-hl' : '') + '"><span class="rdmap-metric-icon">' + m.icon + '</span><span class="rdmap-metric-val" data-target="' + m.value + '">0</span><span class="rdmap-metric-lbl">' + m.label + '</span></div>';
    }).join('');
    // Animate counters
    el.querySelectorAll('[data-target]').forEach(function (el) {
      var target = parseInt(el.dataset.target), start = 0, dur = 600, t0 = null;
      function step(ts) { if (!t0) t0 = ts; var p = Math.min((ts - t0) / dur, 1); el.textContent = Math.floor(p * target).toLocaleString(); if (p < 1) requestAnimationFrame(step); else el.textContent = target.toLocaleString(); }
      requestAnimationFrame(step);
    });
  }

  function populateProductFilter(cats) { var sel = document.getElementById('rdmap-product-filter'); var v = sel.value; sel.innerHTML = '<option value="all">All Products</option>'; cats.forEach(function (c) { if (c.count > 0) { var o = document.createElement('option'); o.value = c.id; o.textContent = c.emoji + ' ' + c.name + ' (' + c.count + ')'; sel.appendChild(o); } }); sel.value = v || 'all'; }

  function renderChips(cats) {
    var el = document.getElementById('rdmap-chips');
    var html = '<button class="rdmap-chip' + (activeProductFilter === 'all' ? ' active' : '') + '" data-cat="all">All</button>';
    // Add Favorites chip
    var favCount = Object.keys(favorites).length;
    if (favCount > 0) html += '<button class="rdmap-chip' + (activeProductFilter === 'favs' ? ' active' : '') + '" data-cat="favs" style="--chip-c:#E040FB">\u2B50 Favourites <span>' + favCount + '</span></button>';
    cats.forEach(function (c) { if (c.count > 0) { var m = CATEGORY_META[c.id] || {}; html += '<button class="rdmap-chip' + (activeProductFilter === c.id ? ' active' : '') + '" data-cat="' + c.id + '" style="--chip-c:' + (m.color || '#888') + '">' + (m.emoji || '') + ' ' + esc(c.name) + ' <span>' + c.count + '</span></button>'; } });
    el.innerHTML = html;
    el.querySelectorAll('.rdmap-chip').forEach(function (b) { b.addEventListener('click', function () { el.querySelectorAll('.rdmap-chip').forEach(function (x) { x.classList.remove('active'); }); this.classList.add('active'); activeProductFilter = this.dataset.cat; document.getElementById('rdmap-product-filter').value = activeProductFilter === 'favs' ? 'all' : activeProductFilter; applyFilters(); syncUrl(); }); });
  }

  function renderTimeline(items) {
    var el = document.getElementById('rdmap-timeline'); var months = {};
    items.forEach(function (i) { var g = i.ga_date_parsed; if (g && g.length >= 7 && i.status !== 'Launched' && i.status !== 'Cancelled') { months[g] = (months[g] || 0) + 1; } });
    var now = new Date().toISOString().slice(0, 7); var sorted = Object.keys(months).sort().filter(function (m) { return m >= now; }).slice(0, 8);
    if (!sorted.length) { el.innerHTML = ''; return; }
    var max = Math.max.apply(null, sorted.map(function (m) { return months[m]; }));
    var MN = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var barColors = ['#5B4A2E', '#4A3F30', '#3D3648', '#35304A', '#2E2B4D', '#28274F', '#232452', '#1F2155'];
    var html = '<div class="rdmap-tl-label">Upcoming GA Dates</div><div class="rdmap-tl-bars">';
    sorted.forEach(function (m, idx) { var c = months[m], pct = Math.max(8, (c / max) * 100), parts = m.split('-'), lbl = MN[parseInt(parts[1])] + ' ' + parts[0].slice(2), isCur = m === now;
      html += '<div class="rdmap-tl-col' + (isCur ? ' rdmap-tl-now' : '') + '"><div class="rdmap-tl-count">' + c + '</div><div class="rdmap-tl-fill" style="height:' + pct + '%;background:' + (isCur ? '#E5A00D' : (barColors[idx] || '#2E2B4D')) + '"></div><div class="rdmap-tl-month">' + lbl + '</div></div>';
    });
    el.innerHTML = html + '</div>';
  }

  // ── SORT ──
  function sortItems(items) {
    var sorted = items.slice();
    if (activeSort === 'ga-asc') sorted.sort(function (a, b) { return (a.ga_date_parsed || 'z').localeCompare(b.ga_date_parsed || 'z'); });
    else if (activeSort === 'ga-desc') sorted.sort(function (a, b) { return (b.ga_date_parsed || '').localeCompare(a.ga_date_parsed || ''); });
    else if (activeSort === 'modified') sorted.sort(function (a, b) { return (b.modified || '').localeCompare(a.modified || ''); });
    else if (activeSort === 'title') sorted.sort(function (a, b) { return (a.title || '').localeCompare(b.title || ''); });
    return sorted;
  }

  // ── RENDER ──
  function renderContent(data) { if (activeLayout === 'list') renderList(data); else renderCards(data); }

  function daysUntilGa(gaParsed) {
    if (!gaParsed || gaParsed.length < 7) return '';
    var parts = gaParsed.split('-'); var gaDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
    var diff = Math.ceil((gaDate - new Date()) / 86400000);
    if (diff < 0) return '';
    if (diff === 0) return 'This month';
    if (diff <= 30) return '~' + diff + 'd';
    return '~' + Math.ceil(diff / 30) + 'mo';
  }

  function mcUrl(title) { var c = (title || '').replace(/^[^:]+:\s*/, '').replace(/[\u2013\u2014|]/g, ' ').trim(); return 'https://admin.microsoft.com/Adminportal/Home#/MessageCenter/:/search/' + encodeURIComponent(c.split(/\s+/).slice(0, 6).join(' ')); }

  function favBtn(id) {
    var isFav = favorites[id];
    return '<button class="rdmap-fav' + (isFav ? ' rdmap-fav-on' : '') + '" data-fav="' + id + '" title="' + (isFav ? 'Remove from favourites' : 'Add to favourites') + '">' + (isFav ? '\u2605' : '\u2606') + '</button>';
  }

  function platformIcons(platforms) {
    if (!platforms || !platforms.length) return '';
    return '<span class="rdmap-plats">' + platforms.map(function (p) { return PLAT_ICONS[p] || ''; }).filter(Boolean).join('') + '</span>';
  }

  function renderList(data) {
    var content = document.getElementById('rdmap-content');
    var items = sortItems(data.items || []);
    if (!items.length) { content.innerHTML = '<p class="rdmap-empty">No items found.</p>'; return; }
    var changed = items.filter(function (i) { return i.change_type; });
    var html = '';
    if (changed.length > 0) {
      html += '<div class="rdmap-list-section" data-section="changes"><div class="rdmap-list-heading">\u{1F504} Recent Changes <span>' + changed.length + '</span></div><div class="rdmap-list">';
      changed.slice(0, 20).forEach(function (i) { html += listRow(i, true); });
      html += '</div></div>';
    }
    html += '<div class="rdmap-list-section" data-section="all"><div class="rdmap-list-heading">All Items <span id="rdmap-count">' + items.length + '</span></div>';
    html += '<div class="rdmap-list-header"><div class="rdmap-lh-status">Status</div><div class="rdmap-lh-title">Feature</div><div class="rdmap-lh-product">Product</div><div class="rdmap-lh-date">GA Date</div></div>';
    html += '<div class="rdmap-list">';
    items.forEach(function (i) { html += listRow(i, false); });
    html += '</div></div>';
    content.innerHTML = html;
    wireItemEvents(); applyFilters();
  }

  function listRow(item, showChange) {
    var st = STATUS_META[item.status] || { color: '#666', label: '?' };
    var cat = CATEGORY_META[item.product_category] || {};
    var ch = item.change_type ? CHANGE_BADGES[item.change_type] : null;
    var summary = item.ai_summary || '';
    var chHtml = '';
    if (showChange && ch) {
      var det = ''; if (item.change_type === 'status_changed' && item.previous_status) det = ' \u00B7 ' + esc(item.previous_status) + ' \u2192 ' + esc(item.status);
      else if (item.change_type === 'date_changed' && item.previous_ga_date) det = ' \u00B7 ' + esc(item.previous_ga_date) + ' \u2192 ' + esc(item.ga_date);
      chHtml = '<span class="rdmap-change" style="color:' + ch.color + '">' + ch.icon + ' ' + ch.label + det + '</span>';
    } else if (ch) { chHtml = '<span class="rdmap-change-dot" style="background:' + ch.color + '" title="' + ch.label + '"></span>'; }
    var countdown = daysUntilGa(item.ga_date_parsed);
    return '<div class="rdmap-row" data-status="' + esc(item.status) + '" data-category="' + esc(item.product_category) + '" data-all-cats="' + esc((item.all_categories || []).join(',')) + '" data-products="' + esc((item.products || []).join(',')) + '" data-id="' + item.id + '">'
      + '<div class="rdmap-row-status"><span class="rdmap-st" style="background:' + st.color + '">' + st.label + '</span></div>'
      + '<div class="rdmap-row-main">'
      + '<div class="rdmap-row-title-row">' + favBtn(item.id) + ' <a href="' + esc(item.roadmap_url) + '" target="_blank" rel="noopener" class="rdmap-row-title">' + esc(item.title) + '</a>'
      + '<a href="' + mcUrl(item.title) + '" target="_blank" rel="noopener" class="rdmap-mc-link">\u{1F4EC} Message Center</a></div>'
      + (summary ? '<div class="rdmap-row-desc">' + esc(summary) + '</div>' : '')
      + chHtml + platformIcons(item.platforms)
      + '</div>'
      + '<div class="rdmap-row-product"><span style="color:' + (cat.color || '#888') + '">' + (cat.emoji || '') + '</span> ' + esc(item.product_category_name || '') + '</div>'
      + '<div class="rdmap-row-date">' + esc(item.ga_date || '\u2014') + (item.is_delayed ? ' <span class="rdmap-delayed">\u26A0\uFE0F DELAYED</span>' : (countdown ? ' <span class="rdmap-countdown">' + countdown + '</span>' : '')) + '</div>'
      + '</div>';
  }

  function renderCards(data) {
    var content = document.getElementById('rdmap-content');
    var items = sortItems(data.items || []);
    if (!items.length) { content.innerHTML = '<p class="rdmap-empty">No items found.</p>'; return; }
    var html = '<div class="rdmap-cards-grid">';
    items.forEach(function (item) {
      var st = STATUS_META[item.status] || { color: '#666', label: '?' }; var cat = CATEGORY_META[item.product_category] || {};
      var ch = item.change_type ? CHANGE_BADGES[item.change_type] : null;
      var summary = item.ai_summary || ''; if (!summary && item.description) summary = item.description.length > 150 ? item.description.substring(0, 150) + '\u2026' : item.description;
      var countdown = daysUntilGa(item.ga_date_parsed);
      html += '<div class="rdmap-card" data-status="' + esc(item.status) + '" data-category="' + esc(item.product_category) + '" data-all-cats="' + esc((item.all_categories || []).join(',')) + '" data-products="' + esc((item.products || []).join(',')) + '" data-id="' + item.id + '">'
        + '<div class="rdmap-card-accent" style="background:' + st.color + '"></div><div class="rdmap-card-body">'
        + '<div class="rdmap-card-top"><span class="rdmap-st" style="background:' + st.color + '">' + st.label + '</span>' + favBtn(item.id)
        + (ch ? '<span class="rdmap-change-sm" style="color:' + ch.color + '">' + ch.icon + ' ' + ch.label + '</span>' : '') + '</div>'
        + '<h4><a href="' + esc(item.roadmap_url) + '" target="_blank" rel="noopener">' + esc(item.title) + '</a> <a href="' + mcUrl(item.title) + '" target="_blank" rel="noopener" class="rdmap-mc-link">\u{1F4EC} MC</a></h4>'
        + (summary ? '<p>' + esc(summary) + '</p>' : '')
        + '<div class="rdmap-card-foot"><span style="color:' + (cat.color || '#888') + '">' + (cat.emoji || '') + ' ' + esc(item.product_category_name || '') + '</span>'
        + (item.ga_date ? '<span>' + esc(item.ga_date) + (item.is_delayed ? ' <span class="rdmap-delayed">\u26A0\uFE0F</span>' : (countdown ? ' <span class="rdmap-countdown">' + countdown + '</span>' : '')) + '</span>' : '')
        + platformIcons(item.platforms) + '</div></div></div>';
    });
    content.innerHTML = html + '</div>';
    wireItemEvents(); applyFilters();
  }

  // ── FAVORITES ──
  function wireItemEvents() {
    document.querySelectorAll('.rdmap-fav').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation(); var id = this.dataset.fav;
        if (favorites[id]) { delete favorites[id]; this.classList.remove('rdmap-fav-on'); this.textContent = '\u2606'; }
        else { favorites[id] = true; this.classList.add('rdmap-fav-on'); this.textContent = '\u2605'; }
        localStorage.setItem('rdmap_favs', JSON.stringify(favorites));
        renderChips(currentData.product_categories || []);
      });
    });
  }

  // ── FILTER ──
  function applyFilters() {
    var q = (document.getElementById('rdmap-search').value || '').toLowerCase();
    var rows = document.querySelectorAll('.rdmap-row, .rdmap-card'); var visible = 0, total = rows.length;
    rows.forEach(function (el) {
      var show = true, s = el.dataset.status || '';
      if (activeStatusFilter === 'active') { if (s === 'Launched') show = false; }
      else if (activeStatusFilter !== 'all') { if (s !== activeStatusFilter) show = false; }
      if (show && activeProductFilter === 'favs') { if (!favorites[el.dataset.id]) show = false; }
      else if (show && activeProductFilter !== 'all') { var c = el.dataset.category || '', all = (el.dataset.allCats || '').split(','); if (c !== activeProductFilter && all.indexOf(activeProductFilter) === -1) show = false; }
      if (show && q) { var txt = el.textContent.toLowerCase() + (el.dataset.products || '').toLowerCase(); if (txt.indexOf(q) === -1) show = false; }
      el.classList.toggle('rdmap-hidden', !show);
      if (show) visible++;
    });
    var cnt = document.getElementById('rdmap-count'); if (cnt) cnt.textContent = visible;
    // Filter info bar
    var info = document.getElementById('rdmap-filter-info');
    if (activeProductFilter !== 'all' || activeStatusFilter !== 'active' || q) {
      info.innerHTML = 'Showing <b>' + visible + '</b> of ' + total + ' items <button class="rdmap-clear-btn" id="rdmap-clear-filters">\u2715 Clear filters</button>';
      info.style.display = '';
      document.getElementById('rdmap-clear-filters').addEventListener('click', function () {
        activeProductFilter = 'all'; activeStatusFilter = 'active';
        document.getElementById('rdmap-search').value = '';
        document.getElementById('rdmap-status-filter').value = 'active';
        document.getElementById('rdmap-product-filter').value = 'all';
        renderChips(currentData.product_categories || []);
        applyFilters(); syncUrl();
      });
    } else { info.style.display = 'none'; }
    document.querySelectorAll('.rdmap-list-section').forEach(function (s) { var has = s.querySelectorAll('.rdmap-row:not(.rdmap-hidden)'); s.style.display = has.length > 0 ? '' : 'none'; });
    syncUrl();
  }

  function renderFreshness(dt) { var el = document.getElementById('rdmap-freshness'); if (!dt) { el.textContent = ''; return; } el.textContent = 'Updated ' + timeAgo(dt); }

  // ── HELPERS ──
  function timeAgo(d) { if (!d) return ''; var ms = new Date() - new Date(d), m = Math.floor(ms / 60000); if (m < 60) return m + 'm ago'; var h = Math.floor(m / 60); if (h < 24) return h + 'h ago'; var days = Math.floor(h / 24); return days < 7 ? days + 'd ago' : new Date(d).toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' }); }
  function esc(s) { return s ? s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : ''; }

  // ── CSV ──
  function addExportButton() {
    var tb = document.querySelector('.rdmap-toolbar-right'); if (!tb) return;
    var btn = document.createElement('button'); btn.className = 'rdmap-csv-btn'; btn.textContent = '\u2B07 Download CSV'; btn.title = 'Download filtered items as CSV';
    btn.addEventListener('click', function () {
      if (!currentData) return; var csv = ['ID,Title,Status,Product,GA Date,Platforms,Delayed,Roadmap URL'];
      currentData.items.forEach(function (i) {
        var s = i.status || ''; if (activeStatusFilter === 'active' && s === 'Launched') return; if (activeStatusFilter !== 'all' && activeStatusFilter !== 'active' && s !== activeStatusFilter) return;
        if (activeProductFilter !== 'all' && activeProductFilter !== 'favs') { var cats = i.all_categories || []; if (i.product_category !== activeProductFilter && cats.indexOf(activeProductFilter) === -1) return; }
        if (activeProductFilter === 'favs' && !favorites[i.id]) return;
        var q = (document.getElementById('rdmap-search').value || '').toLowerCase(); if (q && (i.title || '').toLowerCase().indexOf(q) === -1) return;
        csv.push([i.id, '"' + (i.title || '').replace(/"/g, '""') + '"', i.status, (i.products || []).join('; '), i.ga_date || '', (i.platforms || []).join('; '), i.is_delayed ? 'Yes' : '', i.roadmap_url || ''].join(','));
      });
      var blob = new Blob([csv.join('\n')], { type: 'text/csv' }); var url = URL.createObjectURL(blob);
      var a = document.createElement('a'); a.href = url; a.download = 'm365-roadmap-' + new Date().toISOString().slice(0, 10) + '.csv'; a.click(); URL.revokeObjectURL(url);
    });
    tb.insertBefore(btn, tb.firstChild);
  }

  // ── CATEGORY PAGE ──
  async function loadCategoryView(filter) {
    var content = document.getElementById('rdmap-content');
    try {
      var data = await fetchJson(DATA_URLS.latest);
      var filtered = (data.items || []).filter(function (i) { return i.product_category === filter || (i.all_categories || []).indexOf(filter) !== -1; });
      currentData = Object.assign({}, data, { items: filtered, total_items: filtered.length, active_items: filtered.filter(function (i) { return i.status !== 'Launched'; }).length });
      renderStatusBar(currentData); renderMetrics(currentData); renderContent(currentData); renderFreshness(data.generated_at);
    } catch (e) { content.innerHTML = '<p class="rdmap-empty">Data not available. <a href="/m365-roadmap/" style="color:#E5A00D">View full roadmap</a></p>'; }
  }

  // ── BACK TO TOP ──
  var btt = document.getElementById('rdmap-btt');
  if (btt) {
    window.addEventListener('scroll', function () { btt.classList.toggle('rdmap-btt-show', window.scrollY > 400); });
    btt.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  // ── EVENTS ──
  document.querySelectorAll('.rdmap-tab').forEach(function (t) { t.addEventListener('click', function () { document.querySelectorAll('.rdmap-tab').forEach(function (x) { x.classList.remove('active'); x.setAttribute('aria-selected', 'false'); }); this.classList.add('active'); this.setAttribute('aria-selected', 'true'); loadView(this.dataset.view); }); });
  document.querySelectorAll('.rdmap-view-btn').forEach(function (b) { b.addEventListener('click', function () { document.querySelectorAll('.rdmap-view-btn').forEach(function (x) { x.classList.remove('active'); x.setAttribute('aria-pressed', 'false'); }); this.classList.add('active'); this.setAttribute('aria-pressed', 'true'); activeLayout = this.dataset.layout; if (currentData) renderContent(currentData); }); });
  document.getElementById('rdmap-status-filter').addEventListener('change', function () { activeStatusFilter = this.value; applyFilters(); });
  document.getElementById('rdmap-product-filter').addEventListener('change', function () { activeProductFilter = this.value; document.querySelectorAll('.rdmap-chip').forEach(function (c) { c.classList.toggle('active', c.dataset.cat === activeProductFilter); }); applyFilters(); });
  document.getElementById('rdmap-search').addEventListener('input', debounce(applyFilters, 200));
  var sortSel = document.getElementById('rdmap-sort');
  if (sortSel) sortSel.addEventListener('change', function () { activeSort = this.value; if (currentData) renderContent(currentData); syncUrl(); });

  // ── INIT ──
  readUrlParams();
  if (activeStatusFilter !== 'active') document.getElementById('rdmap-status-filter').value = activeStatusFilter;
  if (activeSort !== 'default' && sortSel) sortSel.value = activeSort;
  addExportButton();
  if (window.__roadmapCategoryFilter) { await loadCategoryView(window.__roadmapCategoryFilter); }
  else { await loadView('latest'); }
});
