document.addEventListener('DOMContentLoaded', async function () {
  var DATA_URLS = {
    latest: '/data/roadmap/latest.json',
    weekly: '/data/roadmap/weekly.json',
    monthly: '/data/roadmap/monthly.json'
  };

  var _cache = {};
  async function fetchJson(url) {
    if (_cache[url]) return _cache[url];
    var cached = sessionStorage.getItem('roadmap_' + url);
    if (cached) {
      try { _cache[url] = JSON.parse(cached); return _cache[url]; } catch (e) { /* re-fetch */ }
    }
    var resp = await fetch(url);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    var data = await resp.json();
    _cache[url] = data;
    // Only cache if payload < 2MB to avoid quota issues
    var str = JSON.stringify(data);
    if (str.length < 2000000) {
      try { sessionStorage.setItem('roadmap_' + url, str); } catch (e) { /* quota full */ }
    }
    return data;
  }

  // Debounce helper
  function debounce(fn, ms) {
    var timer; return function () { clearTimeout(timer); timer = setTimeout(fn, ms); };
  }

  // State
  var currentData = null;
  var activeLayout = 'list';
  var activeProductFilter = 'all';
  var activeStatusFilter = 'active';

  var CATEGORY_META = {
    'copilot':     { name: 'Copilot',              emoji: '🤖', color: '#7B68EE' },
    'teams':       { name: 'Teams',                emoji: '💬', color: '#6264A7' },
    'outlook':     { name: 'Outlook & Exchange',   emoji: '📧', color: '#0078D4' },
    'sharepoint':  { name: 'SharePoint & OneDrive', emoji: '📂', color: '#038387' },
    'office-apps': { name: 'Office Apps',           emoji: '📊', color: '#D83B01' },
    'purview':     { name: 'Purview & Security',   emoji: '🛡️', color: '#E74856' },
    'intune':      { name: 'Intune & Devices',     emoji: '📱', color: '#00BCF2' },
    'viva':        { name: 'Viva',                 emoji: '🏢', color: '#6C33A3' },
    'entra':       { name: 'Entra',                emoji: '👤', color: '#0078D4' },
    'admin':       { name: 'Admin & Platform',     emoji: '⚙️', color: '#5C2D91' },
    'edge-media':  { name: 'Edge & Media',         emoji: '🌐', color: '#3C8527' }
  };

  var STATUS_META = {
    'Rolling out':    { emoji: '🟢', color: '#00CC33', label: 'Rolling Out' },
    'In development': { emoji: '🟡', color: '#F59E0B', label: 'In Dev' },
    'Launched':       { emoji: '🔵', color: '#06B6D4', label: 'Launched' },
    'Cancelled':      { emoji: '🔴', color: '#EF4444', label: 'Cancelled' }
  };

  var CHANGE_BADGES = {
    'new':            { label: 'NEW',     color: '#10B981', icon: '●' },
    'status_changed': { label: 'STATUS',  color: '#06B6D4', icon: '↻' },
    'date_changed':   { label: 'DATE',    color: '#F59E0B', icon: '◷' },
    'updated':        { label: 'UPDATED', color: '#8B5CF6', icon: '✎' }
  };

  // ── DATA LOADING ──
  async function loadView(view) {
    var content = document.getElementById('rdmap-content');
    content.innerHTML = '<div class="rdmap-skeleton"><div class="rdmap-skeleton-row"></div><div class="rdmap-skeleton-row"></div><div class="rdmap-skeleton-row"></div></div>';
    try {
      var data = await fetchJson(DATA_URLS[view] || DATA_URLS.latest);
      currentData = data;
      // Guard: ensure items is an array
      if (!Array.isArray(data.items)) data.items = [];
      if (!Array.isArray(data.product_categories)) data.product_categories = [];
      renderStatusBar(data);
      renderMetrics(data);
      populateProductFilter(data.product_categories);
      renderChips(data.product_categories);
      renderTimeline(data.items);
      renderContent(data);
      renderFreshness(data.generated_at);
    } catch (e) {
      if (view !== 'latest') {
        content.innerHTML = '<p class="rdmap-empty">No ' + view + ' data yet — loading latest.</p>';
        setTimeout(function () { loadView('latest'); }, 1200);
      } else {
        content.innerHTML = '<p class="rdmap-empty">Roadmap data not available yet. Check back tomorrow!</p>';
      }
    }
  }

  // ── STATUS DISTRIBUTION BAR (hero) ──
  function renderStatusBar(data) {
    var el = document.getElementById('rdmap-status-bar');
    var sc = data.status_counts || {};
    var total = (sc['Rolling out'] || 0) + (sc['In development'] || 0) + (sc['Launched'] || 0) + (sc['Cancelled'] || 0);
    if (!total) { el.innerHTML = ''; return; }

    var segments = [
      { status: 'Rolling out', count: sc['Rolling out'] || 0, color: '#00CC33' },
      { status: 'In development', count: sc['In development'] || 0, color: '#F59E0B' },
      { status: 'Launched', count: sc['Launched'] || 0, color: '#06B6D4' },
      { status: 'Cancelled', count: sc['Cancelled'] || 0, color: '#EF4444' }
    ];

    var html = '<div class="rdmap-bar-track">';
    segments.forEach(function (s) {
      var pct = (s.count / total * 100).toFixed(1);
      if (s.count > 0) {
        html += '<div class="rdmap-bar-seg" style="width:' + pct + '%;background:' + s.color + '" title="' + s.status + ': ' + s.count + ' (' + pct + '%)"></div>';
      }
    });
    html += '</div><div class="rdmap-bar-legend">';
    segments.forEach(function (s) {
      if (s.count > 0) {
        html += '<span class="rdmap-legend-item"><span class="rdmap-legend-dot" style="background:' + s.color + '"></span>' + s.status + ' <b>' + s.count + '</b></span>';
      }
    });
    html += '</div>';
    el.innerHTML = html;
  }

  // ── METRICS ROW ──
  function renderMetrics(data) {
    var el = document.getElementById('rdmap-metrics');
    var changes = data.changes_summary || {};
    var totalChanges = (changes.new_items || 0) + (changes.status_changes || 0) + (changes.date_changes || 0);

    var metrics = [
      { value: data.active_items || 0, label: 'Active', icon: '⚡' },
      { value: data.status_counts ? (data.status_counts['Rolling out'] || 0) : 0, label: 'Rolling Out', icon: '🔵' },
      { value: data.status_counts ? (data.status_counts['In development'] || 0) : 0, label: 'In Dev', icon: '🟡' },
    ];
    if (totalChanges > 0) {
      metrics.push({ value: totalChanges, label: 'Changes', icon: '🔄', highlight: true });
    }

    el.innerHTML = metrics.map(function (m) {
      return '<div class="rdmap-metric' + (m.highlight ? ' rdmap-metric-hl' : '') + '"><span class="rdmap-metric-icon">' + m.icon + '</span><span class="rdmap-metric-val">' + m.value.toLocaleString() + '</span><span class="rdmap-metric-lbl">' + m.label + '</span></div>';
    }).join('');
  }

  // ── PRODUCT FILTER DROPDOWN ──
  function populateProductFilter(categories) {
    var select = document.getElementById('rdmap-product-filter');
    var val = select.value;
    select.innerHTML = '<option value="all">All Products</option>';
    categories.forEach(function (cat) {
      if (cat.count > 0) {
        var opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.emoji + ' ' + cat.name + ' (' + cat.count + ')';
        select.appendChild(opt);
      }
    });
    select.value = val || 'all';
  }

  // ── PRODUCT CHIPS ──
  function renderChips(categories) {
    var el = document.getElementById('rdmap-chips');
    var html = '<button class="rdmap-chip active" data-cat="all">All</button>';
    categories.forEach(function (cat) {
      if (cat.count > 0) {
        var meta = CATEGORY_META[cat.id] || {};
        html += '<button class="rdmap-chip" data-cat="' + cat.id + '" style="--chip-c:' + (meta.color || '#888') + '">'
          + (meta.emoji || '') + ' ' + escapeHtml(cat.name) + ' <span>' + cat.count + '</span></button>';
      }
    });
    el.innerHTML = html;
    el.querySelectorAll('.rdmap-chip').forEach(function (btn) {
      btn.addEventListener('click', function () {
        el.querySelectorAll('.rdmap-chip').forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        activeProductFilter = this.dataset.cat;
        document.getElementById('rdmap-product-filter').value = activeProductFilter;
        applyFilters();
      });
    });
  }

  // ── GA TIMELINE (unique to roadmap!) ──
  function renderTimeline(items) {
    var el = document.getElementById('rdmap-timeline');
    var months = {};
    items.forEach(function (item) {
      var gp = item.ga_date_parsed;
      if (gp && gp.length >= 7 && item.status !== 'Launched' && item.status !== 'Cancelled') {
        if (!months[gp]) months[gp] = 0;
        months[gp]++;
      }
    });

    var sorted = Object.keys(months).sort();
    if (sorted.length === 0) { el.innerHTML = ''; return; }

    // Only show upcoming months
    var now = new Date().toISOString().slice(0, 7);
    sorted = sorted.filter(function (m) { return m >= now; }).slice(0, 8);
    if (sorted.length === 0) { el.innerHTML = ''; return; }

    var maxCount = Math.max.apply(null, sorted.map(function (m) { return months[m]; }));
    var MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    var html = '<div class="rdmap-tl-label">📅 Upcoming GA Dates</div><div class="rdmap-tl-bars">';
    sorted.forEach(function (m, idx) {
      var count = months[m];
      var pct = Math.max(8, (count / maxCount) * 100);
      var parts = m.split('-');
      var label = MONTH_NAMES[parseInt(parts[1])] + ' ' + parts[0].slice(2);
      var isThisMonth = m === now;
      // Gradient: closer months warmer, further months cooler
      var barColors = ['#5B4A2E', '#4A3F30', '#3D3648', '#35304A', '#2E2B4D', '#28274F', '#232452', '#1F2155'];
      var barColor = isThisMonth ? '#E5A00D' : (barColors[idx] || '#2E2B4D');
      html += '<div class="rdmap-tl-col' + (isThisMonth ? ' rdmap-tl-now' : '') + '">'
        + '<div class="rdmap-tl-count">' + count + '</div>'
        + '<div class="rdmap-tl-fill" style="height:' + pct + '%;background:' + barColor + '"></div>'
        + '<div class="rdmap-tl-month">' + label + '</div>'
        + '</div>';
    });
    html += '</div>';
    el.innerHTML = html;
  }

  // ── RENDER CONTENT (list or cards) ──
  function renderContent(data) {
    if (activeLayout === 'list') renderList(data);
    else renderCards(data);
  }

  function renderList(data) {
    var content = document.getElementById('rdmap-content');
    var items = data.items || [];
    if (items.length === 0) { content.innerHTML = '<p class="rdmap-empty">No items found.</p>'; return; }

    // Changes section
    var changed = items.filter(function (i) { return i.change_type; });
    var html = '';

    if (changed.length > 0) {
      html += '<div class="rdmap-list-section" data-section="changes"><div class="rdmap-list-heading">🔄 Recent Changes <span>' + changed.length + '</span></div>';
      html += '<div class="rdmap-list">';
      changed.slice(0, 20).forEach(function (item) { html += renderListRow(item, true); });
      html += '</div></div>';
    }

    // All items
    html += '<div class="rdmap-list-section" data-section="all"><div class="rdmap-list-heading">📋 All Items <span id="rdmap-count">' + items.length + '</span></div>';
    html += '<div class="rdmap-list-header"><div class="rdmap-lh-status">Status</div><div class="rdmap-lh-title">Feature</div><div class="rdmap-lh-product">Product</div><div class="rdmap-lh-date">GA Date</div></div>';
    html += '<div class="rdmap-list">';
    items.forEach(function (item) { html += renderListRow(item, false); });
    html += '</div></div>';

    content.innerHTML = html;
    applyFilters();
  }

  function renderListRow(item, showChange) {
    var st = STATUS_META[item.status] || { color: '#666', label: '?', emoji: '⚪' };
    var cat = CATEGORY_META[item.product_category] || {};
    var change = item.change_type ? CHANGE_BADGES[item.change_type] : null;
    var summary = item.ai_summary || '';
    if (!summary && item.description) summary = item.description.length > 120 ? item.description.substring(0, 120) + '…' : item.description;

    var changeHtml = '';
    if (showChange && change) {
      var detail = '';
      if (item.change_type === 'status_changed' && item.previous_status) detail = ' · ' + escapeHtml(item.previous_status) + ' → ' + escapeHtml(item.status);
      else if (item.change_type === 'date_changed' && item.previous_ga_date) detail = ' · ' + escapeHtml(item.previous_ga_date) + ' → ' + escapeHtml(item.ga_date);
      changeHtml = '<span class="rdmap-change" style="color:' + change.color + '">' + change.icon + ' ' + change.label + detail + '</span>';
    } else if (change) {
      changeHtml = '<span class="rdmap-change-dot" style="background:' + change.color + '" title="' + change.label + '"></span>';
    }

    return '<div class="rdmap-row" data-status="' + escapeHtml(item.status) + '" data-category="' + escapeHtml(item.product_category) + '" data-all-cats="' + escapeHtml((item.all_categories || []).join(',')) + '" data-products="' + escapeHtml((item.products || []).join(',')) + '">'
      + '<div class="rdmap-row-status"><span class="rdmap-st" style="background:' + st.color + '">' + st.label + '</span></div>'
      + '<div class="rdmap-row-main">'
      + '<a href="' + escapeHtml(item.roadmap_url) + '" target="_blank" rel="noopener" class="rdmap-row-title">' + escapeHtml(item.title) + '</a>'
      + (summary ? '<div class="rdmap-row-desc">' + escapeHtml(summary) + '</div>' : '')
      + changeHtml
      + '</div>'
      + '<div class="rdmap-row-product"><span style="color:' + (cat.color || '#888') + '">' + (cat.emoji || '') + '</span> ' + escapeHtml(item.product_category_name || '') + '</div>'
      + '<div class="rdmap-row-date">' + escapeHtml(item.ga_date || '—') + (item.is_delayed ? ' <span class="rdmap-delayed">⚠️ DELAYED</span>' : '') + '</div>'
      + '</div>';
  }

  function renderCards(data) {
    var content = document.getElementById('rdmap-content');
    var items = data.items || [];
    if (items.length === 0) { content.innerHTML = '<p class="rdmap-empty">No items found.</p>'; return; }

    var html = '<div class="rdmap-cards-grid">';
    items.forEach(function (item) {
      var st = STATUS_META[item.status] || { color: '#666', label: '?', emoji: '⚪' };
      var cat = CATEGORY_META[item.product_category] || {};
      var change = item.change_type ? CHANGE_BADGES[item.change_type] : null;
      var summary = item.ai_summary || '';
      if (!summary && item.description) summary = item.description.length > 150 ? item.description.substring(0, 150) + '…' : item.description;

      html += '<div class="rdmap-card" data-status="' + escapeHtml(item.status) + '" data-category="' + escapeHtml(item.product_category) + '" data-all-cats="' + escapeHtml((item.all_categories || []).join(',')) + '" data-products="' + escapeHtml((item.products || []).join(',')) + '">'
        + '<div class="rdmap-card-accent" style="background:' + st.color + '"></div>'
        + '<div class="rdmap-card-body">'
        + '<div class="rdmap-card-top"><span class="rdmap-st" style="background:' + st.color + '">' + st.label + '</span>'
        + (change ? '<span class="rdmap-change-sm" style="color:' + change.color + '">' + change.icon + ' ' + change.label + '</span>' : '')
        + '</div>'
        + '<h4><a href="' + escapeHtml(item.roadmap_url) + '" target="_blank" rel="noopener">' + escapeHtml(item.title) + '</a></h4>'
        + (summary ? '<p>' + escapeHtml(summary) + '</p>' : '')
        + '<div class="rdmap-card-foot">'
        + '<span style="color:' + (cat.color || '#888') + '">' + (cat.emoji || '') + ' ' + escapeHtml(item.product_category_name || '') + '</span>'
        + (item.ga_date ? '<span>📅 ' + escapeHtml(item.ga_date) + (item.is_delayed ? ' <span class="rdmap-delayed">⚠️</span>' : '') + '</span>' : '')
        + '</div></div></div>';
    });
    html += '</div>';
    content.innerHTML = html;
    applyFilters();
  }

  // ── FILTERING ──
  function applyFilters() {
    var q = (document.getElementById('rdmap-search').value || '').toLowerCase();
    var rows = document.querySelectorAll('.rdmap-row, .rdmap-card');
    var visible = 0;

    rows.forEach(function (el) {
      var show = true;
      var s = el.dataset.status || '';
      if (activeStatusFilter === 'active') { if (s === 'Launched') show = false; }
      else if (activeStatusFilter !== 'all') { if (s !== activeStatusFilter) show = false; }

      if (show && activeProductFilter !== 'all') {
        var c = el.dataset.category || '';
        var all = (el.dataset.allCats || '').split(',');
        if (c !== activeProductFilter && all.indexOf(activeProductFilter) === -1) show = false;
      }

      if (show && q) {
        var txt = el.textContent.toLowerCase() + (el.dataset.products || '').toLowerCase();
        if (txt.indexOf(q) === -1) show = false;
      }

      el.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    var cnt = document.getElementById('rdmap-count');
    if (cnt) cnt.textContent = visible;

    document.querySelectorAll('.rdmap-list-section').forEach(function (sec) {
      var has = sec.querySelectorAll('.rdmap-row:not([style*="display: none"])');
      sec.style.display = has.length > 0 ? '' : 'none';
    });
  }

  // ── FRESHNESS ──
  function renderFreshness(dt) {
    var el = document.getElementById('rdmap-freshness');
    if (!dt) { el.textContent = ''; return; }
    el.textContent = 'Updated ' + timeAgo(dt);
  }

  // ── HELPERS ──
  function timeAgo(d) {
    if (!d) return '';
    var ms = new Date() - new Date(d);
    var m = Math.floor(ms / 60000);
    if (m < 60) return m + 'm ago';
    var h = Math.floor(m / 60);
    if (h < 24) return h + 'h ago';
    var days = Math.floor(h / 24);
    if (days < 7) return days + 'd ago';
    return new Date(d).toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' });
  }
  function escapeHtml(s) { return s ? s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : ''; }

  // ── EVENT WIRING ──
  document.querySelectorAll('.rdmap-tab').forEach(function (t) {
    t.addEventListener('click', function () {
      document.querySelectorAll('.rdmap-tab').forEach(function (x) { x.classList.remove('active'); x.setAttribute('aria-selected', 'false'); });
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');
      loadView(this.dataset.view);
    });
  });

  document.querySelectorAll('.rdmap-view-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.rdmap-view-btn').forEach(function (x) { x.classList.remove('active'); x.setAttribute('aria-pressed', 'false'); });
      this.classList.add('active');
      this.setAttribute('aria-pressed', 'true');
      activeLayout = this.dataset.layout;
      if (currentData) renderContent(currentData);
    });
  });

  document.getElementById('rdmap-status-filter').addEventListener('change', function () {
    activeStatusFilter = this.value;
    applyFilters();
  });

  document.getElementById('rdmap-product-filter').addEventListener('change', function () {
    activeProductFilter = this.value;
    document.querySelectorAll('.rdmap-chip').forEach(function (c) { c.classList.toggle('active', c.dataset.cat === activeProductFilter); });
    applyFilters();
  });

  document.getElementById('rdmap-search').addEventListener('input', debounce(applyFilters, 200));

  // ── CSV EXPORT ──
  function addExportButton() {
    var toolbar = document.querySelector('.rdmap-toolbar');
    if (!toolbar) return;
    var btn = document.createElement('button');
    btn.className = 'rdmap-csv-btn';
    btn.textContent = '⬇ Download CSV';
    btn.title = 'Download filtered items as CSV';
    btn.addEventListener('click', exportCSV);
    toolbar.appendChild(btn);
  }

  function exportCSV() {
    var rows = document.querySelectorAll('.rdmap-row:not([style*="display: none"]), .rdmap-card:not([style*="display: none"])');
    if (!currentData || !currentData.items) return;

    // Get visible item IDs from the DOM data attributes
    var cols = ['ID', 'Title', 'Status', 'Product', 'GA Date', 'Platforms', 'Delayed', 'Roadmap URL'];
    var csv = [cols.join(',')];
    var items = currentData.items;

    // Filter based on current active filters
    items.forEach(function (item) {
      var s = item.status || '';
      if (activeStatusFilter === 'active' && s === 'Launched') return;
      if (activeStatusFilter !== 'all' && activeStatusFilter !== 'active' && s !== activeStatusFilter) return;
      if (activeProductFilter !== 'all') {
        var cats = item.all_categories || [];
        if (item.product_category !== activeProductFilter && cats.indexOf(activeProductFilter) === -1) return;
      }
      var q = (document.getElementById('rdmap-search').value || '').toLowerCase();
      if (q && (item.title || '').toLowerCase().indexOf(q) === -1 && (item.products || []).join(' ').toLowerCase().indexOf(q) === -1) return;

      var row = [
        item.id,
        '"' + (item.title || '').replace(/"/g, '""') + '"',
        item.status || '',
        (item.products || []).join('; '),
        item.ga_date || '',
        (item.platforms || []).join('; '),
        item.is_delayed ? 'Yes' : '',
        item.roadmap_url || ''
      ];
      csv.push(row.join(','));
    });

    var blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'm365-roadmap-' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── CATEGORY PAGE SUPPORT ──
  async function loadCategoryView(filter) {
    var content = document.getElementById('rdmap-content');
    content.innerHTML = '<div class="rdmap-skeleton"><div class="rdmap-skeleton-row"></div><div class="rdmap-skeleton-row"></div></div>';
    try {
      var data = await fetchJson(DATA_URLS.latest);
      // Filter items to this category
      var filtered = (data.items || []).filter(function (i) {
        return i.product_category === filter || (i.all_categories || []).indexOf(filter) !== -1;
      });
      var catData = Object.assign({}, data, { items: filtered, total_items: filtered.length, active_items: filtered.filter(function (i) { return i.status !== 'Launched'; }).length });
      currentData = catData;
      renderStatusBar(catData);
      renderMetrics(catData);
      renderContent(catData);
      renderFreshness(data.generated_at);
    } catch (e) {
      content.innerHTML = '<p class="rdmap-empty">Data not available. <a href="/m365-roadmap/" style="color:#E5A00D">View full roadmap →</a></p>';
    }
  }

  // ── INIT ──
  addExportButton();
  if (window.__roadmapCategoryFilter) {
    await loadCategoryView(window.__roadmapCategoryFilter);
  } else {
    await loadView('latest');
  }
});
