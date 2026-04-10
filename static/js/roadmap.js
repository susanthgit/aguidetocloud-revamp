document.addEventListener('DOMContentLoaded', async function () {
  var DATA_URLS = { latest: '/data/roadmap/latest.json', weekly: '/data/roadmap/weekly.json', monthly: '/data/roadmap/monthly.json' };
  var CACHE_VERSION = 'v5';
  var PAGE_SIZE = 50; // Load-more pagination
  var _cache = {};

  async function fetchJson(url) {
    var ck = 'rdmap_' + CACHE_VERSION + '_' + url;
    if (_cache[url]) return _cache[url];
    var c = sessionStorage.getItem(ck);
    if (c) { try { _cache[url] = JSON.parse(c); return _cache[url]; } catch (e) {} }
    var r = await fetch(url); if (!r.ok) throw new Error('HTTP ' + r.status);
    var d = await r.json(); _cache[url] = d;
    var s = JSON.stringify(d); if (s.length < 2000000) { try { sessionStorage.setItem(ck, s); } catch (e) {} }
    return d;
  }
  function debounce(fn, ms) { var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; }

  var currentData = null, currentFiltered = [], renderedCount = 0;
  var activeLayout = 'list', activeProductFilter = 'copilot', activeStatusFilter = 'all', activeSort = 'default';
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
  var STATUS_META = { 'Rolling out': { color: '#00CC33', label: 'Rolling Out' }, 'In development': { color: '#F59E0B', label: 'In Dev' }, 'Launched': { color: '#06B6D4', label: 'Launched' }, 'Cancelled': { color: '#EF4444', label: 'Cancelled' } };
  var CHANGE_BADGES = { 'new': { label: 'NEW', color: '#10B981', icon: '\u25CF' }, 'status_changed': { label: 'STATUS', color: '#06B6D4', icon: '\u21BB' }, 'date_changed': { label: 'DATE', color: '#F59E0B', icon: '\u25F7' }, 'updated': { label: 'UPDATED', color: '#8B5CF6', icon: '\u270E' } };
  var PLAT = { 'Web': '\u{1F310}', 'Desktop': '\u{1F4BB}', 'iOS': '\u{1F4F1}', 'Android': '\u{1F916}', 'Mac': '\u{1F34E}', 'Linux': '\u{1F427}' };

  // URL state
  function readUrl() { var p = new URLSearchParams(location.search); if (p.get('product')) activeProductFilter = p.get('product'); if (p.get('status')) activeStatusFilter = p.get('status'); if (p.get('q')) document.getElementById('rdmap-search').value = p.get('q'); if (p.get('sort')) activeSort = p.get('sort'); }
  function syncUrl() { var p = new URLSearchParams(); if (activeProductFilter !== 'copilot') p.set('product', activeProductFilter); if (activeStatusFilter !== 'all') p.set('status', activeStatusFilter); var q = document.getElementById('rdmap-search').value; if (q) p.set('q', q); if (activeSort !== 'default') p.set('sort', activeSort); var s = p.toString(); history.replaceState(null, '', s ? '?' + s : location.pathname); }

  // ── LOAD ──
  async function loadView(view) {
    var content = document.getElementById('rdmap-content');
    // #1: Show skeleton on tab switch
    content.innerHTML = '<div class="rdmap-skeleton"><div class="rdmap-skeleton-row"></div><div class="rdmap-skeleton-row"></div><div class="rdmap-skeleton-row"></div><div class="rdmap-skeleton-row"></div></div>';
    try {
      var data = await fetchJson(DATA_URLS[view] || DATA_URLS.latest);
      if (!Array.isArray(data.items)) data.items = [];
      if (!Array.isArray(data.product_categories)) data.product_categories = [];
      currentData = data;
      renderHeroStats(data); renderStatusBar(data); renderMetrics(data);
      populateProductFilter(data.product_categories); renderChips(data);
      renderTimeline(data.items); renderContent(data); renderFreshness(data.generated_at);
      renderBrowseByProduct();
    } catch (e) {
      if (view !== 'latest') { content.innerHTML = '<p class="rdmap-empty">No ' + view + ' data yet.</p>'; setTimeout(function () { loadView('latest'); }, 1200); }
      else { content.innerHTML = '<p class="rdmap-empty">Roadmap data not available yet. Check back tomorrow!</p>'; }
    }
  }

  // #9: Hero subtitle with live count
  function renderHeroStats(data) {
    var sub = document.querySelector('.rdmap-hero p');
    if (sub && data.items) {
      var cats = new Set(); data.items.forEach(function (i) { cats.add(i.product_category); });
      sub.textContent = 'Tracking ' + data.items.length.toLocaleString() + ' features across ' + cats.size + ' products \u2014 AI-summarised, updated daily';
    }
  }

  // STATUS BAR (clickable)
  function renderStatusBar(data) {
    var el = document.getElementById('rdmap-status-bar');
    var items = data.items || []; var sc = {}; items.forEach(function (i) { sc[i.status] = (sc[i.status] || 0) + 1; });
    var total = (sc['Rolling out'] || 0) + (sc['In development'] || 0) + (sc['Launched'] || 0) + (sc['Cancelled'] || 0);
    if (!total) { el.innerHTML = ''; return; }
    var segs = [{ s: 'Rolling out', c: sc['Rolling out'] || 0, col: '#00CC33' }, { s: 'In development', c: sc['In development'] || 0, col: '#F59E0B' }, { s: 'Launched', c: sc['Launched'] || 0, col: '#06B6D4' }, { s: 'Cancelled', c: sc['Cancelled'] || 0, col: '#EF4444' }];
    var html = '<div class="rdmap-bar-track">';
    segs.forEach(function (x) { if (x.c > 0) html += '<div class="rdmap-bar-seg" style="width:' + (x.c / total * 100).toFixed(1) + '%;background:' + x.col + '" title="' + x.s + ': ' + x.c + '" data-status="' + x.s + '"></div>'; });
    html += '</div><div class="rdmap-bar-legend">';
    segs.forEach(function (x) { if (x.c > 0) html += '<span class="rdmap-legend-item" data-status="' + x.s + '" style="cursor:pointer"><span class="rdmap-legend-dot" style="background:' + x.col + '"></span>' + x.s + ' <b>' + x.c + '</b></span>'; });
    el.innerHTML = html + '</div>';
    el.querySelectorAll('[data-status]').forEach(function (e) { e.addEventListener('click', function () { activeStatusFilter = this.dataset.status; document.getElementById('rdmap-status-filter').value = activeStatusFilter; applyFilters(); syncUrl(); }); });
  }

  // METRICS (animated)
  function renderMetrics(data) {
    var el = document.getElementById('rdmap-metrics'); var items = data.items || [];
    var sc = {}; items.forEach(function (i) { sc[i.status] = (sc[i.status] || 0) + 1; });
    var active = items.filter(function (i) { return i.status !== 'Launched'; }).length;
    var delayed = items.filter(function (i) { return i.is_delayed; }).length;
    var changed = items.filter(function (i) { return i.change_type; }).length;
    var ms = [{ v: active, l: 'Active', i: '\u26A1' }, { v: sc['Rolling out'] || 0, l: 'Rolling Out', i: '\u{1F7E2}' }, { v: sc['In development'] || 0, l: 'In Dev', i: '\u{1F7E1}' }];
    if (delayed > 0) ms.push({ v: delayed, l: 'Delayed', i: '\u26A0\uFE0F', h: true });
    if (changed > 0) ms.push({ v: changed, l: 'Changes', i: '\u{1F504}', h: true });
    el.innerHTML = ms.map(function (m) { return '<div class="rdmap-metric' + (m.h ? ' rdmap-metric-hl' : '') + '"><span class="rdmap-metric-icon">' + m.i + '</span><span class="rdmap-metric-val" data-target="' + m.v + '">0</span><span class="rdmap-metric-lbl">' + m.l + '</span></div>'; }).join('');
    el.querySelectorAll('[data-target]').forEach(function (e) {
      var tgt = parseInt(e.dataset.target), t0 = null;
      function step(ts) { if (!t0) t0 = ts; var p = Math.min((ts - t0) / 600, 1); e.textContent = Math.floor(p * tgt).toLocaleString(); if (p < 1) requestAnimationFrame(step); else e.textContent = tgt.toLocaleString(); }
      requestAnimationFrame(step);
    });
  }

  function populateProductFilter(cats) { var sel = document.getElementById('rdmap-product-filter'), v = sel.value; sel.innerHTML = '<option value="all">All Products</option>'; cats.forEach(function (c) { if (c.count > 0) { var o = document.createElement('option'); o.value = c.id; o.textContent = c.emoji + ' ' + c.name + ' (' + c.count + ')'; sel.appendChild(o); } }); sel.value = v || 'all'; }

  // #4: Chips with dynamic counts based on current status filter
  function renderChips(data) {
    var el = document.getElementById('rdmap-chips');
    var items = data.items || []; var cats = data.product_categories || [];
    // Count items per category AFTER status filter
    var counts = {}; items.forEach(function (i) {
      if (activeStatusFilter === 'all' || (activeStatusFilter === 'active' && i.status !== 'Launched') || i.status === activeStatusFilter) {
        (i.all_categories || [i.product_category]).forEach(function (c) { counts[c] = (counts[c] || 0) + 1; });
      }
    });
    var html = '<button class="rdmap-chip' + (activeProductFilter === 'all' ? ' active' : '') + '" data-cat="all">All</button>';
    var favCount = Object.keys(favorites).length;
    if (favCount > 0) html += '<button class="rdmap-chip' + (activeProductFilter === 'favs' ? ' active' : '') + '" data-cat="favs" style="--chip-c:#E040FB">\u2B50 Favourites <span>' + favCount + '</span></button>';
    cats.forEach(function (c) { var cnt = counts[c.id] || 0; var m = CATEGORY_META[c.id] || {}; html += '<button class="rdmap-chip' + (activeProductFilter === c.id ? ' active' : '') + '" data-cat="' + c.id + '" style="--chip-c:' + (m.color || '#888') + '">' + (m.emoji || '') + ' ' + esc(c.name) + ' <span>' + cnt + '</span></button>'; });
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
    var bc = ['#5B4A2E', '#4A3F30', '#3D3648', '#35304A', '#2E2B4D', '#28274F', '#232452', '#1F2155'];
    var html = '<div class="rdmap-tl-label">Upcoming GA Dates</div><div class="rdmap-tl-bars">';
    sorted.forEach(function (m, i) { var c = months[m], pct = Math.max(8, (c / max) * 100), p = m.split('-'), lbl = MN[parseInt(p[1])] + ' ' + p[0].slice(2), cur = m === now;
      html += '<div class="rdmap-tl-col' + (cur ? ' rdmap-tl-now' : '') + '"><div class="rdmap-tl-count">' + c + '</div><div class="rdmap-tl-fill" style="height:' + pct + '%;background:' + (cur ? '#E5A00D' : (bc[i] || '#2E2B4D')) + '"></div><div class="rdmap-tl-month">' + lbl + '</div></div>';
    });
    el.innerHTML = html + '</div>';
  }

  // SORT
  function sortItems(items) {
    var s = items.slice();
    if (activeSort === 'ga-asc') s.sort(function (a, b) { return (a.ga_date_parsed || 'z').localeCompare(b.ga_date_parsed || 'z'); });
    else if (activeSort === 'ga-desc') s.sort(function (a, b) { return (b.ga_date_parsed || '').localeCompare(a.ga_date_parsed || ''); });
    else if (activeSort === 'modified') s.sort(function (a, b) { return (b.modified || '').localeCompare(a.modified || ''); });
    else if (activeSort === 'title') s.sort(function (a, b) { return (a.title || '').localeCompare(b.title || ''); });
    return s;
  }

  // FILTER items first, then render
  function getFilteredItems() {
    if (!currentData) return [];
    var q = (document.getElementById('rdmap-search').value || '').toLowerCase();
    return sortItems(currentData.items.filter(function (i) {
      if (activeStatusFilter === 'active' && i.status === 'Launched') return false;
      if (activeStatusFilter !== 'all' && activeStatusFilter !== 'active' && i.status !== activeStatusFilter) return false;
      if (activeProductFilter === 'favs') { if (!favorites[i.id]) return false; }
      else if (activeProductFilter !== 'all') { if (i.product_category !== activeProductFilter && (i.all_categories || []).indexOf(activeProductFilter) === -1) return false; }
      if (q) { var t = ((i.title || '') + ' ' + (i.ai_summary || '') + ' ' + (i.products || []).join(' ')).toLowerCase(); if (t.indexOf(q) === -1) return false; }
      return true;
    }));
  }

  // #5: RENDER with load-more pagination
  function renderContent(data) {
    currentFiltered = getFilteredItems();
    renderedCount = 0;
    var content = document.getElementById('rdmap-content');

    // #10: "Rolling out this month" highlight
    var now = new Date().toISOString().slice(0, 7);
    var thisMonth = currentFiltered.filter(function (i) { return i.status === 'Rolling out' && i.ga_date_parsed === now; });

    var html = '';
    if (thisMonth.length > 0) {
      html += '<div class="rdmap-list-section"><div class="rdmap-list-heading">\u{1F7E2} Rolling Out This Month <span>' + thisMonth.length + '</span></div><div class="rdmap-list">';
      thisMonth.slice(0, 10).forEach(function (i) { html += listRow(i, false); });
      html += '</div></div>';
    }

    // Changed items section
    var changed = currentFiltered.filter(function (i) { return i.change_type; });
    if (changed.length > 0) {
      html += '<div class="rdmap-list-section"><div class="rdmap-list-heading">\u{1F504} Recent Changes <span>' + changed.length + '</span></div><div class="rdmap-list">';
      changed.slice(0, 15).forEach(function (i) { html += listRow(i, true); });
      html += '</div></div>';
    }

    // All items (paginated)
    html += '<div class="rdmap-list-section"><div class="rdmap-list-heading">All Items <span id="rdmap-count">' + currentFiltered.length + '</span></div>';
    if (activeLayout === 'list') {
      html += '<div class="rdmap-list-header"><div class="rdmap-lh-status">Status</div><div class="rdmap-lh-title">Feature</div><div class="rdmap-lh-product">Product</div><div class="rdmap-lh-date">GA Date</div></div>';
    }
    html += '<div id="rdmap-items-container" class="' + (activeLayout === 'list' ? 'rdmap-list' : 'rdmap-cards-grid') + '">';
    html += '</div></div>';

    // #7: Empty state for favourites
    if (activeProductFilter === 'favs' && currentFiltered.length === 0) {
      html = '<div class="rdmap-empty-state"><span>\u2B50</span><h3>No favourites yet</h3><p>Click the \u2606 star on any item to add it to your watchlist</p></div>';
    } else if (currentFiltered.length === 0) {
      html = '<p class="rdmap-empty">No items match your filters.</p>';
    }

    content.innerHTML = html;

    // Render first page
    loadMoreItems();

    // Filter info
    updateFilterInfo();
    wireItemEvents();
  }

  function loadMoreItems() {
    var container = document.getElementById('rdmap-items-container');
    if (!container) return;
    var end = Math.min(renderedCount + PAGE_SIZE, currentFiltered.length);
    var fragment = '';
    for (var i = renderedCount; i < end; i++) {
      fragment += (activeLayout === 'list') ? listRow(currentFiltered[i], false) : cardHtml(currentFiltered[i]);
    }
    container.insertAdjacentHTML('beforeend', fragment);
    renderedCount = end;
    wireItemEvents();

    // Remove old load-more button
    var old = document.getElementById('rdmap-load-more');
    if (old) old.remove();

    // Add load-more button if there are more
    if (renderedCount < currentFiltered.length) {
      var btn = document.createElement('button');
      btn.id = 'rdmap-load-more';
      btn.className = 'rdmap-load-more';
      btn.textContent = 'Load more (' + (currentFiltered.length - renderedCount) + ' remaining)';
      btn.addEventListener('click', loadMoreItems);
      container.parentNode.appendChild(btn);
    }
  }

  // HELPERS
  function daysUntilGa(gp) { if (!gp || gp.length < 7) return ''; var p = gp.split('-'), d = new Date(parseInt(p[0]), parseInt(p[1]) - 1, 1), diff = Math.ceil((d - new Date()) / 86400000); if (diff < 0) return ''; if (diff <= 30) return '~' + diff + 'd'; return '~' + Math.ceil(diff / 30) + 'mo'; }
  function mcUrl(t) { var c = (t || '').replace(/^[^:]+:\s*/, '').replace(/[\u2013\u2014|]/g, ' ').trim(); return 'https://admin.microsoft.com/Adminportal/Home#/MessageCenter/:/search/' + encodeURIComponent(c.split(/\s+/).slice(0, 6).join(' ')); }
  function favBtn(id) { var f = favorites[id]; return '<button class="rdmap-fav' + (f ? ' rdmap-fav-on' : '') + '" data-fav="' + id + '" title="' + (f ? 'Remove' : 'Add to') + ' favourites">' + (f ? '\u2605' : '\u2606') + '</button>'; }
  function plats(ps) { if (!ps || !ps.length) return ''; return '<span class="rdmap-plats">' + ps.map(function (p) { return PLAT[p] || ''; }).filter(Boolean).join('') + '</span>'; }
  function timeAgo(d) { if (!d) return ''; var ms = new Date() - new Date(d), m = Math.floor(ms / 60000); if (m < 60) return m + 'm ago'; var h = Math.floor(m / 60); if (h < 24) return h + 'h ago'; var days = Math.floor(h / 24); return days < 7 ? days + 'd ago' : new Date(d).toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' }); }
  function esc(s) { return s ? s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : ''; }

  function listRow(item, showCh) {
    var st = STATUS_META[item.status] || { color: '#666', label: '?' }, cat = CATEGORY_META[item.product_category] || {}, ch = item.change_type ? CHANGE_BADGES[item.change_type] : null;
    var summary = item.ai_summary || '', chHtml = '', countdown = daysUntilGa(item.ga_date_parsed);
    if (showCh && ch) { var det = ''; if (item.change_type === 'status_changed' && item.previous_status) det = ' \u00B7 ' + esc(item.previous_status) + ' \u2192 ' + esc(item.status); else if (item.change_type === 'date_changed' && item.previous_ga_date) det = ' \u00B7 ' + esc(item.previous_ga_date) + ' \u2192 ' + esc(item.ga_date); chHtml = '<span class="rdmap-change" style="color:' + ch.color + '">' + ch.icon + ' ' + ch.label + det + '</span>'; }
    else if (ch) { chHtml = '<span class="rdmap-change-dot" style="background:' + ch.color + '" title="' + ch.label + '"></span>'; }
    return '<div class="rdmap-row" data-id="' + item.id + '">'
      + '<div class="rdmap-row-status"><span class="rdmap-st" style="background:' + st.color + '">' + st.label + '</span></div>'
      + '<div class="rdmap-row-main">'
      + '<div class="rdmap-row-title-row">' + favBtn(item.id) + ' <a href="' + esc(item.roadmap_url) + '" target="_blank" rel="noopener" class="rdmap-row-title">' + esc(item.title) + '</a>'
      + '<a href="' + mcUrl(item.title) + '" target="_blank" rel="noopener" class="rdmap-mc-link">\u{1F4EC} Message Center</a></div>'
      + (summary ? '<div class="rdmap-row-desc">' + esc(summary) + '</div>' : '')
      + chHtml + plats(item.platforms) + '</div>'
      + '<div class="rdmap-row-product"><span style="color:' + (cat.color || '#888') + '">' + (cat.emoji || '') + '</span> ' + esc(item.product_category_name || '') + '</div>'
      + '<div class="rdmap-row-date">' + esc(item.ga_date || '\u2014') + (item.is_delayed ? ' <span class="rdmap-delayed">\u26A0\uFE0F DELAYED</span>' : (countdown ? ' <span class="rdmap-countdown">' + countdown + '</span>' : '')) + '</div></div>';
  }

  function cardHtml(item) {
    var st = STATUS_META[item.status] || { color: '#666', label: '?' }, cat = CATEGORY_META[item.product_category] || {}, ch = item.change_type ? CHANGE_BADGES[item.change_type] : null;
    var summary = item.ai_summary || '', countdown = daysUntilGa(item.ga_date_parsed);
    return '<div class="rdmap-card" data-id="' + item.id + '"><div class="rdmap-card-accent" style="background:' + st.color + '"></div><div class="rdmap-card-body">'
      + '<div class="rdmap-card-top"><span class="rdmap-st" style="background:' + st.color + '">' + st.label + '</span>' + favBtn(item.id)
      + (ch ? '<span class="rdmap-change-sm" style="color:' + ch.color + '">' + ch.icon + ' ' + ch.label + '</span>' : '') + '</div>'
      + '<h4><a href="' + esc(item.roadmap_url) + '" target="_blank" rel="noopener">' + esc(item.title) + '</a> <a href="' + mcUrl(item.title) + '" target="_blank" rel="noopener" class="rdmap-mc-link">\u{1F4EC} MC</a></h4>'
      + (summary ? '<p>' + esc(summary) + '</p>' : '')
      + '<div class="rdmap-card-foot"><span style="color:' + (cat.color || '#888') + '">' + (cat.emoji || '') + ' ' + esc(item.product_category_name || '') + '</span>'
      + (item.ga_date ? '<span>' + esc(item.ga_date) + (item.is_delayed ? ' <span class="rdmap-delayed">\u26A0\uFE0F</span>' : (countdown ? ' <span class="rdmap-countdown">' + countdown + '</span>' : '')) + '</span>' : '')
      + plats(item.platforms) + '</div></div></div>';
  }

  // FAVORITES
  function wireItemEvents() {
    document.querySelectorAll('.rdmap-fav:not([data-wired])').forEach(function (b) {
      b.setAttribute('data-wired', '1');
      b.addEventListener('click', function (e) {
        e.stopPropagation(); var id = this.dataset.fav;
        if (favorites[id]) { delete favorites[id]; this.classList.remove('rdmap-fav-on'); this.textContent = '\u2606'; }
        else { favorites[id] = true; this.classList.add('rdmap-fav-on'); this.textContent = '\u2605'; }
        localStorage.setItem('rdmap_favs', JSON.stringify(favorites));
        if (currentData) renderChips(currentData);
      });
    });
  }

  // FILTER INFO + CLEAR
  function updateFilterInfo() {
    var info = document.getElementById('rdmap-filter-info');
    var total = currentData ? currentData.items.length : 0;
    var q = document.getElementById('rdmap-search').value;
    if (activeProductFilter !== 'copilot' || activeStatusFilter !== 'all' || q) {
      // #11: Share button
      info.innerHTML = 'Showing <b>' + currentFiltered.length + '</b> of ' + total + ' items '
        + '<button class="rdmap-share-btn" id="rdmap-share" title="Copy link to this filtered view">\u{1F517} Share</button> '
        + '<button class="rdmap-clear-btn" id="rdmap-clear">\u2715 Clear</button>';
      info.style.display = '';
      document.getElementById('rdmap-clear').addEventListener('click', function () {
        activeProductFilter = 'copilot'; activeStatusFilter = 'all'; document.getElementById('rdmap-search').value = '';
        document.getElementById('rdmap-status-filter').value = 'all'; document.getElementById('rdmap-product-filter').value = 'copilot';
        if (currentData) { renderChips(currentData); renderContent(currentData); } syncUrl();
      });
      document.getElementById('rdmap-share').addEventListener('click', function () {
        syncUrl(); navigator.clipboard.writeText(location.href).then(function () { var b = document.getElementById('rdmap-share'); b.textContent = '\u2705 Copied!'; setTimeout(function () { b.textContent = '\u{1F517} Share'; }, 2000); });
      });
    } else { info.style.display = 'none'; }
  }

  function applyFilters() {
    currentFiltered = getFilteredItems(); renderedCount = 0;
    renderContent(currentData);
    if (currentData) renderChips(currentData); // #4: update chip counts
    syncUrl();
  }

  function renderFreshness(dt) { var el = document.getElementById('rdmap-freshness'); if (!dt) return; el.textContent = 'Updated ' + timeAgo(dt); }

  // #12: Browse by product footer
  function renderBrowseByProduct() {
    var src = document.querySelector('.rdmap-source'); if (!src) return;
    var existing = document.querySelector('.rdmap-browse'); if (existing) existing.remove();
    var div = document.createElement('div'); div.className = 'rdmap-browse';
    var html = '<strong>Browse by product:</strong> ';
    Object.keys(CATEGORY_META).forEach(function (k, i) { var m = CATEGORY_META[k]; if (i > 0) html += ' \u00B7 '; html += '<a href="/m365-roadmap/' + k + '/">' + m.emoji + ' ' + m.name + '</a>'; });
    div.innerHTML = html;
    src.parentNode.insertBefore(div, src);
  }

  // CSV
  function addExportButton() {
    var tb = document.querySelector('.rdmap-toolbar-right'); if (!tb) return;
    var btn = document.createElement('button'); btn.className = 'rdmap-csv-btn'; btn.textContent = '\u2B07 Download CSV';
    btn.addEventListener('click', function () {
      if (!currentFiltered.length) return;
      var csv = ['ID,Title,Status,Product,GA Date,Platforms,Delayed,Summary,Roadmap URL'];
      currentFiltered.forEach(function (i) {
        csv.push([i.id, '"' + (i.title || '').replace(/"/g, '""') + '"', i.status, (i.products || []).join('; '), i.ga_date || '', (i.platforms || []).join('; '), i.is_delayed ? 'Yes' : '', '"' + (i.ai_summary || '').replace(/"/g, '""') + '"', i.roadmap_url || ''].join(','));
      });
      var b = new Blob([csv.join('\n')], { type: 'text/csv' }), u = URL.createObjectURL(b), a = document.createElement('a'); a.href = u; a.download = 'm365-roadmap-' + new Date().toISOString().slice(0, 10) + '.csv'; a.click(); URL.revokeObjectURL(u);
    });
    tb.insertBefore(btn, tb.firstChild);
  }

  // CATEGORY PAGE
  async function loadCategoryView(filter) {
    try {
      var data = await fetchJson(DATA_URLS.latest);
      var f = (data.items || []).filter(function (i) { return i.product_category === filter || (i.all_categories || []).indexOf(filter) !== -1; });
      currentData = Object.assign({}, data, { items: f, total_items: f.length, active_items: f.filter(function (i) { return i.status !== 'Launched'; }).length });
      renderHeroStats(currentData); renderStatusBar(currentData); renderMetrics(currentData); renderContent(currentData); renderFreshness(data.generated_at);
    } catch (e) { document.getElementById('rdmap-content').innerHTML = '<p class="rdmap-empty">Data not available. <a href="/m365-roadmap/">View full roadmap</a></p>'; }
  }

  // BACK TO TOP
  var btt = document.getElementById('rdmap-btt');
  if (btt) { window.addEventListener('scroll', function () { btt.classList.toggle('rdmap-btt-show', window.scrollY > 400); }); btt.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); }); }

  // #6: Keyboard: / to focus search
  document.addEventListener('keydown', function (e) { if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'SELECT') { e.preventDefault(); document.getElementById('rdmap-search').focus(); } });

  // EVENTS
  document.querySelectorAll('.rdmap-tab').forEach(function (t) { t.addEventListener('click', function () { document.querySelectorAll('.rdmap-tab').forEach(function (x) { x.classList.remove('active'); x.setAttribute('aria-selected', 'false'); }); this.classList.add('active'); this.setAttribute('aria-selected', 'true'); loadView(this.dataset.view); }); });
  document.querySelectorAll('.rdmap-view-btn').forEach(function (b) { b.addEventListener('click', function () { document.querySelectorAll('.rdmap-view-btn').forEach(function (x) { x.classList.remove('active'); x.setAttribute('aria-pressed', 'false'); }); this.classList.add('active'); this.setAttribute('aria-pressed', 'true'); activeLayout = this.dataset.layout; if (currentData) renderContent(currentData); }); });
  document.getElementById('rdmap-status-filter').addEventListener('change', function () { activeStatusFilter = this.value; applyFilters(); });
  document.getElementById('rdmap-product-filter').addEventListener('change', function () { activeProductFilter = this.value; applyFilters(); });
  document.getElementById('rdmap-search').addEventListener('input', debounce(applyFilters, 250));
  var sortSel = document.getElementById('rdmap-sort');
  if (sortSel) sortSel.addEventListener('change', function () { activeSort = this.value; if (currentData) renderContent(currentData); syncUrl(); });

  // INIT
  readUrl();
  document.getElementById('rdmap-status-filter').value = activeStatusFilter;
  if (activeSort !== 'default' && sortSel) sortSel.value = activeSort;
  addExportButton();
  if (window.__roadmapCategoryFilter) { await loadCategoryView(window.__roadmapCategoryFilter); }
  else { await loadView('latest'); }
});
