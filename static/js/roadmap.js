document.addEventListener('DOMContentLoaded', async function () {
  var DATA_URLS = {
    latest: '/data/roadmap/latest.json',
    weekly: '/data/roadmap/weekly.json',
    monthly: '/data/roadmap/monthly.json'
  };

  // SessionStorage cache
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
    try { sessionStorage.setItem('roadmap_' + url, JSON.stringify(data)); } catch (e) { /* quota */ }
    return data;
  }

  // Current state
  var currentData = null;
  var currentView = 'latest';
  var activeProductFilter = 'all';
  var activeStatusFilter = 'active';

  // Category display order + metadata
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
    'Rolling out':    { emoji: '🔵', color: '#2196F3' },
    'In development': { emoji: '🟡', color: '#FF9800' },
    'Launched':       { emoji: '🟢', color: '#4CAF50' },
    'Cancelled':      { emoji: '🔴', color: '#F44336' }
  };

  var CHANGE_BADGES = {
    'new':            { label: '🆕 NEW',    color: '#4CAF50' },
    'status_changed': { label: '🔄 STATUS', color: '#2196F3' },
    'date_changed':   { label: '📅 DATE',   color: '#FF9800' },
    'updated':        { label: '✏️ UPDATED', color: '#9C27B0' }
  };

  // --- DATA LOADING ---
  async function loadView(view) {
    currentView = view;
    var grid = document.getElementById('roadmap-grid');
    grid.innerHTML = '<div class="roadmap-skeleton-wrap"><div class="roadmap-skeleton-card"></div><div class="roadmap-skeleton-card"></div><div class="roadmap-skeleton-card"></div></div>';

    try {
      var url = DATA_URLS[view] || DATA_URLS.latest;
      var data = await fetchJson(url);
      currentData = data;
      renderStats(data);
      populateProductFilter(data.product_categories || []);
      renderCategoryPills(data.product_categories || []);
      renderItems(data);
      renderFreshness(data.generated_at);
    } catch (e) {
      if (view !== 'latest') {
        grid.innerHTML = '<p class="roadmap-empty">No ' + view + ' data available yet — showing latest instead.</p>';
        setTimeout(function () { loadView('latest'); }, 1500);
      } else {
        grid.innerHTML = '<p class="roadmap-empty">Roadmap data not available yet. Check back tomorrow!</p>';
      }
    }
  }

  // --- STATS BAR ---
  function renderStats(data) {
    var el = document.getElementById('roadmap-stats');
    var changes = data.changes_summary || {};
    var totalChanges = (changes.new_items || 0) + (changes.status_changes || 0) + (changes.date_changes || 0);

    var html = '<div class="roadmap-stat"><span class="roadmap-stat-num">' + (data.active_items || 0) + '</span><span class="roadmap-stat-label">Active Items</span></div>';
    html += '<div class="roadmap-stat"><span class="roadmap-stat-num">' + (data.status_counts ? (data.status_counts['Rolling out'] || 0) : 0) + '</span><span class="roadmap-stat-label">Rolling Out</span></div>';
    html += '<div class="roadmap-stat"><span class="roadmap-stat-num">' + (data.status_counts ? (data.status_counts['In development'] || 0) : 0) + '</span><span class="roadmap-stat-label">In Development</span></div>';
    if (totalChanges > 0) {
      html += '<div class="roadmap-stat roadmap-stat-highlight"><span class="roadmap-stat-num">' + totalChanges + '</span><span class="roadmap-stat-label">Changes Today</span></div>';
    }
    el.innerHTML = html;
  }

  // --- PRODUCT FILTER DROPDOWN ---
  function populateProductFilter(categories) {
    var select = document.getElementById('roadmap-product-filter');
    var currentVal = select.value;
    select.innerHTML = '<option value="all">All Products</option>';
    categories.forEach(function (cat) {
      if (cat.count > 0) {
        var opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.emoji + ' ' + cat.name + ' (' + cat.count + ')';
        select.appendChild(opt);
      }
    });
    select.value = currentVal || 'all';
  }

  // --- CATEGORY PILLS ---
  function renderCategoryPills(categories) {
    var el = document.getElementById('roadmap-categories');
    var html = '<button class="roadmap-pill active" data-cat="all">All</button>';
    categories.forEach(function (cat) {
      if (cat.count > 0) {
        var meta = CATEGORY_META[cat.id] || {};
        html += '<button class="roadmap-pill" data-cat="' + cat.id + '" style="--pill-color:' + (meta.color || '#888') + '">';
        html += '<span class="roadmap-pill-dot" style="background:' + (meta.color || '#888') + '"></span>';
        html += (meta.emoji || '') + ' ' + escapeHtml(cat.name) + ' <span class="roadmap-pill-count">' + cat.count + '</span>';
        html += '</button>';
      }
    });
    el.innerHTML = html;

    // Wire up pill clicks
    el.querySelectorAll('.roadmap-pill').forEach(function (btn) {
      btn.addEventListener('click', function () {
        el.querySelectorAll('.roadmap-pill').forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        activeProductFilter = this.dataset.cat;
        document.getElementById('roadmap-product-filter').value = activeProductFilter;
        applyFilters();
      });
    });
  }

  // --- RENDER ITEMS ---
  function renderItems(data) {
    var grid = document.getElementById('roadmap-grid');
    var items = data.items || [];
    var html = '';

    // Separate changed items for hero section
    var changedItems = items.filter(function (i) { return i.change_type !== null && i.change_type !== undefined; });
    var regularItems = items;

    // "What's Changed" hero section
    if (changedItems.length > 0) {
      html += '<div class="roadmap-section" data-section="changes">';
      html += '<div class="roadmap-section-header"><span>🔄</span> Recent Changes <span class="roadmap-section-count">' + changedItems.length + '</span></div>';
      html += '<div class="roadmap-changes-grid">';
      changedItems.slice(0, 12).forEach(function (item) {
        html += renderChangeCard(item);
      });
      html += '</div></div>';
    }

    // Main items grid
    html += '<div class="roadmap-section" data-section="all">';
    html += '<div class="roadmap-section-header"><span>📋</span> All Items <span class="roadmap-section-count" id="items-count">' + items.length + '</span></div>';
    html += '<div class="roadmap-items-grid">';
    regularItems.forEach(function (item) {
      html += renderCard(item);
    });
    html += '</div></div>';

    grid.innerHTML = html || '<p class="roadmap-empty">No items found.</p>';
    applyFilters();
  }

  // --- CARD RENDERERS ---
  function renderChangeCard(item) {
    var change = CHANGE_BADGES[item.change_type] || {};
    var status = STATUS_META[item.status] || { emoji: '⚪', color: '#999' };
    var catMeta = CATEGORY_META[item.product_category] || {};

    var changeDetail = '';
    if (item.change_type === 'status_changed' && item.previous_status) {
      changeDetail = '<div class="roadmap-change-detail">' + escapeHtml(item.previous_status) + ' → ' + escapeHtml(item.status) + '</div>';
    } else if (item.change_type === 'date_changed' && item.previous_ga_date) {
      changeDetail = '<div class="roadmap-change-detail">' + escapeHtml(item.previous_ga_date) + ' → ' + escapeHtml(item.ga_date) + '</div>';
    }

    return '<div class="roadmap-change-card" data-status="' + escapeHtml(item.status) + '" data-category="' + escapeHtml(item.product_category) + '" data-products="' + escapeHtml((item.products || []).join(',')) + '">'
      + '<div class="roadmap-change-badge" style="background:' + (change.color || '#888') + '">' + (change.label || '') + '</div>'
      + '<h4 class="roadmap-card-title"><a href="' + escapeHtml(item.roadmap_url) + '" target="_blank" rel="noopener">' + escapeHtml(item.title) + '</a></h4>'
      + changeDetail
      + '<div class="roadmap-card-meta">'
      + '<span class="roadmap-status-badge" style="background:' + status.color + '">' + status.emoji + ' ' + escapeHtml(item.status) + '</span>'
      + '<span class="roadmap-product-pill" style="border-color:' + (catMeta.color || '#888') + '">' + (catMeta.emoji || '') + ' ' + escapeHtml(item.product_category_name || '') + '</span>'
      + (item.ga_date ? '<span class="roadmap-ga-date">📅 ' + escapeHtml(item.ga_date) + '</span>' : '')
      + '</div></div>';
  }

  function renderCard(item) {
    var status = STATUS_META[item.status] || { emoji: '⚪', color: '#999' };
    var catMeta = CATEGORY_META[item.product_category] || {};
    var change = item.change_type ? CHANGE_BADGES[item.change_type] : null;

    var summary = item.ai_summary || '';
    if (!summary && item.description) {
      summary = item.description.length > 150 ? item.description.substring(0, 150) + '…' : item.description;
    }

    var platformIcons = (item.platforms || []).map(function (p) {
      var icons = { 'Web': '🌐', 'Desktop': '💻', 'iOS': '📱', 'Android': '🤖', 'Mac': '🍎', 'Linux': '🐧' };
      return icons[p] || '';
    }).filter(Boolean).join(' ');

    return '<div class="roadmap-card" data-status="' + escapeHtml(item.status) + '" data-category="' + escapeHtml(item.product_category) + '" data-all-cats="' + escapeHtml((item.all_categories || []).join(',')) + '" data-products="' + escapeHtml((item.products || []).join(',')) + '">'
      + '<div class="roadmap-card-top">'
      + '<span class="roadmap-status-badge" style="background:' + status.color + '">' + status.emoji + ' ' + escapeHtml(item.status) + '</span>'
      + (change ? '<span class="roadmap-change-indicator" style="color:' + change.color + '">' + change.label + '</span>' : '')
      + '</div>'
      + '<h4 class="roadmap-card-title"><a href="' + escapeHtml(item.roadmap_url) + '" target="_blank" rel="noopener">' + escapeHtml(item.title) + '</a></h4>'
      + (summary ? '<p class="roadmap-card-summary">' + escapeHtml(summary) + '</p>' : '')
      + '<div class="roadmap-card-meta">'
      + '<span class="roadmap-product-pill" style="border-color:' + (catMeta.color || '#888') + '">' + (catMeta.emoji || '') + ' ' + escapeHtml(item.product_category_name || '') + '</span>'
      + (item.ga_date ? '<span class="roadmap-ga-date">📅 ' + escapeHtml(item.ga_date) + '</span>' : '')
      + (platformIcons ? '<span class="roadmap-platforms">' + platformIcons + '</span>' : '')
      + '</div>'
      + '<div class="roadmap-card-footer">'
      + '<span class="roadmap-card-id">#' + item.id + '</span>'
      + '<span class="roadmap-card-modified">' + timeAgo(item.modified) + '</span>'
      + '</div>'
      + '</div>';
  }

  // --- FILTERING ---
  function applyFilters() {
    var searchQuery = (document.getElementById('roadmap-search').value || '').toLowerCase();
    var statusFilter = activeStatusFilter;
    var productFilter = activeProductFilter;

    var allCards = document.querySelectorAll('.roadmap-card, .roadmap-change-card');
    var visibleCount = 0;

    allCards.forEach(function (card) {
      var show = true;

      // Status filter
      var cardStatus = card.dataset.status || '';
      if (statusFilter === 'active') {
        if (cardStatus === 'Launched') show = false;
      } else if (statusFilter !== 'all') {
        if (cardStatus !== statusFilter) show = false;
      }

      // Product filter
      if (show && productFilter !== 'all') {
        var cardCat = card.dataset.category || '';
        var allCats = (card.dataset.allCats || '').split(',');
        if (cardCat !== productFilter && allCats.indexOf(productFilter) === -1) {
          show = false;
        }
      }

      // Search
      if (show && searchQuery) {
        var text = card.textContent.toLowerCase();
        var products = (card.dataset.products || '').toLowerCase();
        if (text.indexOf(searchQuery) === -1 && products.indexOf(searchQuery) === -1) {
          show = false;
        }
      }

      card.style.display = show ? '' : 'none';
      if (show) visibleCount++;
    });

    // Update count
    var countEl = document.getElementById('items-count');
    if (countEl) countEl.textContent = visibleCount;

    // Show/hide section headers based on visible children
    document.querySelectorAll('.roadmap-section').forEach(function (sec) {
      var hasVisible = sec.querySelectorAll('.roadmap-card:not([style*="display: none"]), .roadmap-change-card:not([style*="display: none"])');
      sec.style.display = hasVisible.length > 0 ? '' : 'none';
    });
  }

  // --- FRESHNESS BADGE ---
  function renderFreshness(generatedAt) {
    var existing = document.querySelector('.roadmap-freshness');
    if (existing) existing.remove();
    if (!generatedAt) return;

    var badge = document.createElement('div');
    badge.className = 'roadmap-freshness';
    badge.textContent = '🕐 Updated ' + timeAgo(generatedAt);
    var stats = document.getElementById('roadmap-stats');
    if (stats) stats.appendChild(badge);
  }

  // --- HELPERS ---
  function timeAgo(dateStr) {
    if (!dateStr) return '';
    var now = new Date();
    var then = new Date(dateStr);
    var diffMs = now - then;
    var mins = Math.floor(diffMs / 60000);
    if (mins < 60) return mins + 'm ago';
    var hours = Math.floor(mins / 60);
    if (hours < 24) return hours + 'h ago';
    var days = Math.floor(hours / 24);
    if (days < 7) return days + 'd ago';
    return then.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // --- EVENT WIRING ---

  // Tab switching
  document.querySelectorAll('.roadmap-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.roadmap-tab').forEach(function (t) { t.classList.remove('active'); });
      this.classList.add('active');
      loadView(this.dataset.view);
    });
  });

  // Status filter
  document.getElementById('roadmap-status-filter').addEventListener('change', function () {
    activeStatusFilter = this.value;
    applyFilters();
  });

  // Product filter dropdown (syncs with pills)
  document.getElementById('roadmap-product-filter').addEventListener('change', function () {
    activeProductFilter = this.value;
    // Sync pills
    document.querySelectorAll('.roadmap-pill').forEach(function (p) {
      p.classList.toggle('active', p.dataset.cat === activeProductFilter);
    });
    applyFilters();
  });

  // Search
  document.getElementById('roadmap-search').addEventListener('input', function () {
    applyFilters();
  });

  // Initial load
  await loadView('latest');
});
