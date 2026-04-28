/* ═══════════════════════════════════════════════
   Copilot Feature Matrix — Interactive JS (v2)
   All improvements: counts, licence filter, URL state,
   descriptions, NEW badges, free view, cross-links,
   platform tags, print support
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── XSS Prevention ───
  // Note: escHtml function is defined later below. Using it as our escape function.

  const D = window.__cpData;
  if (!D) { console.error('[CopilotMatrix] No data found'); return; }

  // ── Lookup maps ──
  const tierMap = {};
  D.tiers.forEach(t => tierMap[t.id] = t);
  const appMap = {};
  D.apps.forEach(a => appMap[a.id] = a);
  const catMap = {};
  D.featureCategories.forEach(c => catMap[c.id] = c);

  const TIER_ORDER = ['free', 'chat', 'pro', 'm365'];
  const STATE_LABELS = { full: 'Full', partial: 'Partial', preview: 'Preview', none: 'N/A' };
  const NEW_DAYS = 60;

  // ── Data validation ──
  D.features.forEach(f => {
    if (!catMap[f.category]) console.warn(`[CopilotMatrix] Unknown category: ${f.category} in feature ${f.id}`);
    if (f.availability) {
      Object.keys(f.availability).forEach(appId => {
        if (!appMap[appId]) console.warn(`[CopilotMatrix] Unknown app: ${appId} in feature ${f.id}`);
        Object.keys(f.availability[appId]).forEach(tierId => {
          if (!tierMap[tierId]) console.warn(`[CopilotMatrix] Unknown tier: ${tierId} in feature ${f.id}`);
        });
      });
    }
  });

  // ── Detect which apps have features ──
  const activeApps = [];
  const appHasFeatures = {};
  D.features.forEach(f => {
    if (f.availability) {
      Object.keys(f.availability).forEach(appId => { appHasFeatures[appId] = true; });
    }
  });
  D.apps.forEach(a => { if (appHasFeatures[a.id]) activeApps.push(a); });

  // ── Feature counts per app ──
  function countFeaturesForApp(appId) {
    let count = 0;
    D.features.forEach(f => {
      if (!f.availability || !f.availability[appId]) return;
      const tiers = f.availability[appId];
      const hasAny = Object.values(tiers).some(c => {
        const st = typeof c === 'string' ? c : c.state;
        return st && st !== 'none';
      });
      if (hasAny) count++;
    });
    return count;
  }

  // ── Is feature "new"? (added in last N days) ──
  function isNew(feature) {
    if (!feature.added_date) return false;
    const added = new Date(feature.added_date);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - NEW_DAYS);
    return added >= cutoff;
  }

  // ── Check if feature has any "full" availability in free/chat tiers ──
  function isFreeFeature(feature) {
    if (!feature.availability) return false;
    return Object.values(feature.availability).some(appData => {
      const freeCell = appData.free || appData.chat;
      if (!freeCell) return false;
      const st = typeof freeCell === 'string' ? freeCell : freeCell.state;
      return st === 'full' || st === 'partial';
    });
  }

  // ── Check if feature is M365-exclusive (only available at m365 tier) ──
  function isM365Only(feature) {
    if (!feature.availability) return false;
    let hasM365 = false;
    let hasLower = false;
    Object.values(feature.availability).forEach(appData => {
      ['free', 'chat', 'pro'].forEach(tid => {
        const cell = appData[tid];
        if (cell) {
          const st = typeof cell === 'string' ? cell : cell.state;
          if (st && st !== 'none') hasLower = true;
        }
      });
      const m365Cell = appData.m365;
      if (m365Cell) {
        const st = typeof m365Cell === 'string' ? m365Cell : m365Cell.state;
        if (st && st !== 'none') hasM365 = true;
      }
    });
    return hasM365 && !hasLower;
  }

  // ═══════════════════════════════════════════════
  // URL State Management
  // ═══════════════════════════════════════════════

  function getUrlParams() {
    return new URLSearchParams(window.location.search);
  }

  function setUrlParam(key, value) {
    const url = new URL(window.location);
    if (value && value !== 'all' && value !== '') {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
    history.replaceState(null, '', url);
  }

  function setMultiUrlParams(params) {
    const url = new URL(window.location);
    Object.entries(params).forEach(([k, v]) => {
      if (v && v !== 'all' && v !== '') url.searchParams.set(k, v);
      else url.searchParams.delete(k);
    });
    history.replaceState(null, '', url);
  }

  // ── Tab Switching ──
  const tabs = document.querySelectorAll('.cpmatrix-tab');
  const panels = document.querySelectorAll('.cpmatrix-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      panels.forEach(p => { p.classList.remove('active'); p.hidden = true; });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const panel = document.getElementById('panel-' + target);
      if (panel) { panel.classList.add('active'); panel.hidden = false; }
      setUrlParam('tab', target);
    });
  });

  // ═══════════════════════════════════════════════
  // TAB 1: Feature Matrix
  // ═══════════════════════════════════════════════

  const gridEl = document.getElementById('cpmatrix-grid');
  const searchInput = document.getElementById('cpmatrix-search');
  const catFilter = document.getElementById('cpmatrix-cat-filter');
  const appFilter = document.getElementById('cpmatrix-app-filter');
  const licenceFilter = document.getElementById('cpmatrix-licence-filter');
  const mobileAppSelect = document.getElementById('cpmatrix-mobile-app');
  const noResults = document.getElementById('cpmatrix-no-results');
  const statsEl = document.getElementById('cpmatrix-stats');

  // Active quick filter
  let activeQuickFilter = null;

  // Populate filters
  D.featureCategories.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.name;
    catFilter.appendChild(opt);
  });

  activeApps.forEach(a => {
    const count = countFeaturesForApp(a.id);
    const opt1 = document.createElement('option');
    opt1.value = a.id;
    opt1.textContent = `${a.name} (${count})`;
    appFilter.appendChild(opt1);

    const opt2 = document.createElement('option');
    opt2.value = a.id;
    opt2.textContent = `${a.name} (${count})`;
    mobileAppSelect.appendChild(opt2);
  });

  // Quick filter buttons
  document.querySelectorAll('.cpmatrix-quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      if (filter === 'clear') {
        activeQuickFilter = null;
        searchInput.value = '';
        catFilter.value = 'all';
        appFilter.value = 'all';
        licenceFilter.value = 'all';
        document.querySelectorAll('.cpmatrix-quick-btn').forEach(b => b.classList.remove('active'));
        setMultiUrlParams({ q: '', cat: '', app: '', licence: '', qf: '' });
      } else {
        if (activeQuickFilter === filter) {
          activeQuickFilter = null;
          btn.classList.remove('active');
          setUrlParam('qf', '');
        } else {
          activeQuickFilter = filter;
          document.querySelectorAll('.cpmatrix-quick-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          setUrlParam('qf', filter);
        }
      }
      renderMatrix();
    });
  });

  function getCell(feature, appId, tierId) {
    if (!feature.availability || !feature.availability[appId]) return null;
    const cell = feature.availability[appId][tierId];
    if (!cell) return null;
    if (typeof cell === 'string') return { state: cell };
    return cell;
  }

  function isMobile() {
    return window.innerWidth <= 768;
  }

  function renderMatrix() {
    const query = (searchInput.value || '').toLowerCase().trim();
    const catVal = catFilter.value;
    const appVal = appFilter.value;
    const licenceVal = licenceFilter.value;
    const mobileApp = mobileAppSelect.value;

    // Update URL state
    setMultiUrlParams({ q: query, cat: catVal, app: appVal, licence: licenceVal });

    // Filter features
    let filtered = D.features.filter(f => {
      if (catVal !== 'all' && f.category !== catVal) return false;
      if (query) {
        const text = (f.name + ' ' + f.description + ' ' + f.category + ' ' + (f.platforms || []).join(' ')).toLowerCase();
        if (!text.includes(query)) return false;
      }
      // Quick filters
      if (activeQuickFilter === 'free-only' && !isFreeFeature(f)) return false;
      if (activeQuickFilter === 'm365-only' && !isM365Only(f)) return false;
      if (activeQuickFilter === 'new' && !isNew(f)) return false;
      return true;
    });

    // Determine visible app — single app at a time (not all 15)
    let selectedApp = appVal;
    if (selectedApp === 'all') selectedApp = 'teams'; // default to Teams
    let visibleApps = activeApps.filter(a => a.id === selectedApp);
    if (!visibleApps.length) visibleApps = [activeApps[0]];

    // Determine visible tiers
    let visibleTiers = TIER_ORDER;
    if (licenceVal !== 'all') {
      // Show the selected tier and all below it
      const idx = TIER_ORDER.indexOf(licenceVal);
      if (idx >= 0) visibleTiers = TIER_ORDER.slice(0, idx + 1);
    }

    // Filter features to those with data for visible apps
    if (appVal !== 'all' || isMobile()) {
      filtered = filtered.filter(f => {
        return visibleApps.some(a => f.availability && f.availability[a.id]);
      });
    }

    // Stats
    const totalFeatures = filtered.length;
    const newCount = filtered.filter(isNew).length;
    let statsHtml = `<span><strong>${totalFeatures}</strong> features shown</span>`;
    if (newCount > 0) statsHtml += `<span><strong>${newCount}</strong> new</span>`;
    if (activeQuickFilter) statsHtml += `<span class="cpmatrix-stats-filter">Filter: ${activeQuickFilter.replace('-', ' ')}</span>`;
    statsEl.innerHTML = statsHtml;

    if (!filtered.length) {
      gridEl.innerHTML = '';
      noResults.hidden = false;
      return;
    }
    noResults.hidden = true;

    // Group by category
    const groups = {};
    filtered.forEach(f => {
      if (!groups[f.category]) groups[f.category] = [];
      groups[f.category].push(f);
    });

    // Build table
    let html = '<table class="cpmatrix-table">';

    // Header row — use SVG icons for apps
    var matrixIcons = window.__cpIcons || {};
    html += '<thead><tr><th class="cpmatrix-feature-name">Feature</th>';
    visibleApps.forEach(app => {
      const count = countFeaturesForApp(app.id);
      const appIcon = matrixIcons[app.id] || '';
      html += `<th colspan="${visibleTiers.length}">`;
      html += `<span class="cpmatrix-app-icon">${appIcon}</span>${escHtml(app.name)}`;
      html += `<span class="cpmatrix-app-count">${count}</span>`;
      html += '</th>';
    });
    html += '</tr>';

    // Sub-header: tier names
    html += '<tr><th class="cpmatrix-feature-name"></th>';
    visibleApps.forEach(() => {
      visibleTiers.forEach(tid => {
        const tier = tierMap[tid];
        html += `<th class="cpmatrix-tier-subhdr">${tier.short_name}</th>`;
      });
    });
    html += '</tr></thead>';

    html += '<tbody>';

    const catOrder = D.featureCategories.map(c => c.id);
    catOrder.forEach(catId => {
      if (!groups[catId]) return;
      const cat = catMap[catId];
      const colSpan = 1 + visibleApps.length * visibleTiers.length;
      html += `<tr class="cpmatrix-cat-row"><td colspan="${colSpan}">${escHtml(cat.name)}</td></tr>`;

      groups[catId].forEach(f => {
        const fNew = isNew(f);
        html += `<tr class="${fNew ? 'cpmatrix-row-new' : ''}">`;

        // Feature name with description tooltip and platform tags
        const platformHtml = (f.platforms && f.platforms.length) ? `<span class="cpmatrix-platforms">${f.platforms.map(p => `<span class="cpmatrix-platform-tag">${p}</span>`).join('')}</span>` : '';
        const newBadge = fNew ? '<span class="cpmatrix-badge-new">NEW</span>' : '';
        html += `<td class="cpmatrix-feature-name">`;
        html += `<span class="cpmatrix-fname">${escHtml(f.name)}${newBadge}</span>`;
        html += `<span class="cpmatrix-fdesc">${escHtml(f.description)}</span>`;
        html += platformHtml;
        html += '</td>';

        visibleApps.forEach(app => {
          visibleTiers.forEach(tid => {
            const cell = getCell(f, app.id, tid);
            const state = cell ? (cell.state || 'none') : 'none';
            const note = cell ? (cell.note || '') : '';
            const label = STATE_LABELS[state] || '—';
            html += `<td class="cpmatrix-cell" data-state="${state}" tabindex="0" title="${escHtml(note)}">`;
            html += `<span class="cpmatrix-cell-text cpmatrix-cell-${state}">${label}</span>`;
            if (note) html += `<div class="cpmatrix-tooltip"><div class="cpmatrix-tooltip-state" data-state="${state}">${label}</div><div>${escHtml(note)}</div></div>`;
            html += '</td>';
          });
        });

        html += '</tr>';
      });
    });

    html += '</tbody></table>';
    gridEl.innerHTML = html;
  }

  // Event listeners
  let searchTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(renderMatrix, 200);
  });
  catFilter.addEventListener('change', renderMatrix);
  appFilter.addEventListener('change', renderMatrix);
  licenceFilter.addEventListener('change', renderMatrix);
  mobileAppSelect.addEventListener('change', renderMatrix);
  window.addEventListener('resize', debounce(renderMatrix, 300));

  // ═══════════════════════════════════════════════
  // TAB 2: Compare Tiers — Consumer vs Enterprise split (Zen)
  // ═══════════════════════════════════════════════

  function renderTiers() {
    var el = document.getElementById('cpmatrix-tiers');

    var consumerTiers = D.tiers.filter(function (t) { return t.id === 'free' || t.id === 'pro'; });
    var enterpriseTiers = D.tiers.filter(function (t) { return t.id === 'chat' || t.id === 'm365'; });

    var html = '';

    // Tier details at the top — ordered to match tables below: Consumer (Free, Pro) then Enterprise (Chat, M365)
    var tierDisplayOrder = ['free', 'pro', 'chat', 'm365'];
    var tiersByIdMap = {};
    D.tiers.forEach(function (t) { tiersByIdMap[t.id] = t; });

    html += '<details class="cpmatrix-tier-details" open><summary>Tier overview</summary>';
    html += '<div class="cpmatrix-tier-details-grid">';
    tierDisplayOrder.forEach(function (tid) {
      var t = tiersByIdMap[tid];
      if (!t) return;
      var isRec = t.id === 'm365';
      html += '<div class="cpmatrix-tier-detail-card' + (isRec ? ' cpmatrix-tier-detail-recommended' : '') + '">';
      html += '<div class="cpmatrix-tier-detail-name">' + escHtml(t.short_name) + '</div>';
      html += '<div class="cpmatrix-tier-detail-price">' + escHtml(t.price) + '</div>';
      html += '<div class="cpmatrix-tier-detail-note">' + escHtml(t.price_note) + '</div>';
      if (t.data_access) html += '<div class="cpmatrix-tier-detail-access">' + escHtml(t.data_access) + '</div>';
      if (t.important_note) html += '<div class="cpmatrix-tier-detail-warning">' + escHtml(t.important_note) + '</div>';
      html += '</div>';
    });
    html += '</div></details>';

    // Consumer vs Enterprise comparison tables
    html += '<div class="cpmatrix-compare-split">';

    // Consumer section
    html += '<div class="cpmatrix-compare-section">';
    html += '<div class="cpmatrix-compare-section-label">Consumer</div>';
    html += buildCompareTable(consumerTiers);
    html += '</div>';

    // Enterprise section
    html += '<div class="cpmatrix-compare-section">';
    html += '<div class="cpmatrix-compare-section-label">Enterprise</div>';
    html += buildCompareTable(enterpriseTiers);
    html += '</div>';

    html += '</div>';

    el.innerHTML = html;

    function buildCompareTable(tiers) {
      var tierIds = tiers.map(function (t) { return t.id; });
      var features = getCompareFeatures(tierIds);
      var stateLabels = { full: 'Full', partial: 'Partial', preview: 'Preview', none: '—' };
      var stateClasses = { full: 'cpmatrix-cell-full', partial: 'cpmatrix-cell-partial', preview: 'cpmatrix-cell-preview', none: 'cpmatrix-cell-none' };

      var h = '<div class="cpmatrix-compare-table">';

      // Header with tier name + price
      h += '<div class="cpmatrix-compare-header">';
      h += '<span>Feature</span>';
      tiers.forEach(function (t) {
        h += '<span class="cpmatrix-tier-hdr"><strong>' + escHtml(t.short_name) + '</strong><small>' + escHtml(t.price) + '</small></span>';
      });
      h += '</div>';

      // Feature rows
      features.forEach(function (row) {
        h += '<div class="cpmatrix-compare-row">';
        h += '<span class="cpmatrix-compare-feat">' + escHtml(row.name) + '</span>';
        tierIds.forEach(function (tid) {
          var st = row.states[tid] || 'none';
          h += '<span class="cpmatrix-compare-cell ' + stateClasses[st] + '">' + stateLabels[st] + '</span>';
        });
        h += '</div>';
      });

      h += '</div>';
      return h;
    }

    function getCompareFeatures(tierIds) {
      var rows = [];
      var seen = {};
      D.features.forEach(function (f) {
        if (!f.availability) return;
        var hasAny = false;
        var states = {};
        tierIds.forEach(function (tid) {
          var best = 'none';
          Object.values(f.availability).forEach(function (appData) {
            var cell = appData[tid];
            if (!cell) return;
            var st = typeof cell === 'string' ? cell : cell.state;
            if (st === 'full') best = 'full';
            else if (st === 'partial' && best !== 'full') best = st;
            else if (st === 'preview' && best === 'none') best = 'preview';
          });
          states[tid] = best;
          if (best !== 'none') hasAny = true;
        });
        if (hasAny && !seen[f.id]) {
          seen[f.id] = true;
          rows.push({ name: f.name, states: states });
        }
      });
      return rows;
    }
  }

  // ═══════════════════════════════════════════════
  // TAB 3: What Changed
  // ═══════════════════════════════════════════════

  const changeFilter = document.getElementById('cpmatrix-change-filter');

  function renderChangelog() {
    const el = document.getElementById('cpmatrix-timeline');
    const filter = changeFilter.value;

    const sorted = [...D.changelog].sort((a, b) => b.date.localeCompare(a.date));
    let items = sorted;
    if (filter === 'high') items = items.filter(e => e.impact === 'high');

    if (!items.length) {
      el.innerHTML = '<p style="color:var(--text-muted);text-align:center;">No changes match this filter.</p>';
      return;
    }

    let html = '';
    items.forEach(entry => {
      const d = new Date(entry.date + 'T00:00:00');
      const dateStr = d.toLocaleDateString('en-NZ', { year: 'numeric', month: 'long', day: 'numeric' });
      const isFuture = d > new Date();

      html += `<div class="cpmatrix-timeline-item" data-impact="${entry.impact}">`;
      html += `<div class="cpmatrix-timeline-date">${isFuture ? 'Upcoming: ' : ''}${dateStr}</div>`;
      html += `<span class="cpmatrix-timeline-type" data-type="${entry.type}">${entry.type}</span>`;
      html += `<span class="cpmatrix-timeline-scope">${escHtml(entry.scope)}</span>`;
      html += `<div class="cpmatrix-timeline-title">${escHtml(entry.title)}</div>`;
      html += `<div class="cpmatrix-timeline-summary">${escHtml(entry.summary)}</div>`;

      if (entry.apps && entry.apps.length) {
        html += '<div class="cpmatrix-timeline-apps">';
        var tlIcons = window.__cpIcons || {};
        entry.apps.forEach(appId => {
          const app = appMap[appId];
          const icon = tlIcons[appId] || '';
          const label = app ? `${icon} ${escHtml(app.name)}` : escHtml(appId);
          html += `<span class="cpmatrix-timeline-app-badge">${label}</span>`;
        });
        html += '</div>';
      }

      if (entry.source) {
        html += `<a href="${escHtml(entry.source)}" target="_blank" rel="noopener noreferrer" class="cpmatrix-timeline-source">Source →</a>`;
      }

      html += '</div>';
    });

    el.innerHTML = html;
  }

  changeFilter.addEventListener('change', renderChangelog);

  // ═══════════════════════════════════════════════
  // TAB: By App — app-focused vertical view (fix E)
  // ═══════════════════════════════════════════════

  function renderAppGrid() {
    var grid = document.getElementById('cpmatrix-app-grid');
    if (!grid) return;

    var html = '';
    var icons = window.__cpIcons || {};
    activeApps.forEach(function (a) {
      var count = countFeaturesForApp(a.id);
      var icon = icons[a.id] || escHtml(a.emoji);
      html += '<button class="cpmatrix-appgrid-btn" data-app="' + a.id + '">';
      html += '<span class="cpmatrix-appgrid-icon">' + icon + '</span>';
      html += '<span class="cpmatrix-appgrid-name">' + escHtml(a.name) + '</span>';
      html += '<span class="cpmatrix-appgrid-count">(' + count + ')</span>';
      html += '</button>';
    });

    grid.innerHTML = html;

    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('.cpmatrix-appgrid-btn');
      if (!btn) return;
      document.querySelectorAll('.cpmatrix-appgrid-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      renderAppDetail(btn.dataset.app);
    });

    // Auto-select Teams by default
    var teamsBtn = grid.querySelector('.cpmatrix-appgrid-btn[data-app="teams"]');
    if (teamsBtn) { teamsBtn.classList.add('active'); renderAppDetail('teams'); }
  }

  function renderAppDetail(appId) {
    var detail = document.getElementById('cpmatrix-app-detail');
    if (!detail) return;

    var app = appMap[appId];
    if (!app) return;

    var features = [];
    D.features.forEach(function (f) {
      if (!f.availability || !f.availability[appId]) return;
      var tiers = f.availability[appId];
      var hasAny = false;
      TIER_ORDER.forEach(function (tid) {
        var cell = tiers[tid];
        if (cell) {
          var st = typeof cell === 'string' ? cell : cell.state;
          if (st && st !== 'none') hasAny = true;
        }
      });
      if (hasAny) features.push(f);
    });

    var icons = window.__cpIcons || {};
    var appIcon = (icons[appId] || escHtml(app.emoji)).replace('width="16"', 'width="28"').replace('height="16"', 'height="28"');
    var stateLabels = { full: 'Full', partial: 'Partial', preview: 'Preview', none: '—' };

    var html = '<div class="cpmatrix-appdetail-header">';
    html += '<span class="cpmatrix-appdetail-icon">' + appIcon + '</span>';
    html += '<div><h3>' + escHtml(app.name) + '</h3>';
    html += '<p>' + escHtml(app.description) + ' · <strong>' + features.length + ' features</strong></p></div>';
    html += '</div>';

    html += '<div class="cpmatrix-appdetail-list">';
    html += '<div class="cpmatrix-appdetail-row cpmatrix-appdetail-hdr"><span>Feature</span>';
    TIER_ORDER.forEach(function (tid) {
      var t = tierMap[tid];
      html += '<span>' + t.short_name + '</span>';
    });
    html += '</div>';

    features.forEach(function (f) {
      html += '<div class="cpmatrix-appdetail-row">';
      html += '<span class="cpmatrix-appdetail-feat"><strong>' + escHtml(f.name) + '</strong><small>' + escHtml(f.description) + '</small></span>';
      TIER_ORDER.forEach(function (tid) {
        var cell = f.availability[appId][tid];
        var st = 'none';
        var note = '';
        if (cell) {
          st = typeof cell === 'string' ? cell : (cell.state || 'none');
          note = (typeof cell === 'object' && cell.note) ? cell.note : '';
        }
        html += '<span class="cpmatrix-appdetail-cell cpmatrix-cell-' + st + '" title="' + escHtml(note) + '">' + (stateLabels[st] || '—') + '</span>';
      });
      html += '</div>';
    });

    html += '</div>';

    detail.innerHTML = html;
    detail.style.display = '';
    detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ═══════════════════════════════════════════════
  // Quick Start Scenario Buttons (fix B)
  // ═══════════════════════════════════════════════
  document.querySelectorAll('.cpmatrix-qs-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var licence = btn.dataset.licence;
      // Highlight active button
      document.querySelectorAll('.cpmatrix-qs-btn').forEach(function (b) { b.classList.remove('active'); });
      if (licence !== 'all') btn.classList.add('active');
      // Switch to matrix tab and set licence filter
      var matrixTab = document.querySelector('.cpmatrix-tab[data-tab="matrix"]');
      if (matrixTab && !matrixTab.classList.contains('active')) matrixTab.click();
      licenceFilter.value = licence;
      licenceFilter.dispatchEvent(new Event('change'));
    });
  });

  // ═══════════════════════════════════════════════
  // Add count badges to quick filter buttons (fix G)
  // ═══════════════════════════════════════════════
  function updateQuickFilterCounts() {
    var freeCount = D.features.filter(function (f) { return isFreeFeature(f); }).length;
    var m365Count = D.features.filter(function (f) { return isM365Only(f); }).length;
    var newCount = D.features.filter(function (f) { return isNew(f); }).length;
    var freeBtn = document.querySelector('.cpmatrix-quick-btn[data-filter="free-only"]');
    var m365Btn = document.querySelector('.cpmatrix-quick-btn[data-filter="m365-only"]');
    var newBtn = document.querySelector('.cpmatrix-quick-btn[data-filter="new"]');
    if (freeBtn) freeBtn.textContent = 'Free (' + freeCount + ')';
    if (m365Btn) m365Btn.textContent = 'M365 Only (' + m365Count + ')';
    if (newBtn) newBtn.textContent = 'New (' + newCount + ')';
  }

  // ═══════════════════════════════════════════════
  // Restore state from URL and render
  // ═══════════════════════════════════════════════

  const params = getUrlParams();
  if (params.get('tab')) {
    const t = document.querySelector(`.cpmatrix-tab[data-tab="${params.get('tab')}"]`);
    if (t) t.click();
  }
  if (params.get('q')) searchInput.value = params.get('q');
  if (params.get('cat')) catFilter.value = params.get('cat');
  if (params.get('app')) appFilter.value = params.get('app');
  if (params.get('licence')) licenceFilter.value = params.get('licence');
  if (params.get('qf')) {
    activeQuickFilter = params.get('qf');
    const btn = document.querySelector(`.cpmatrix-quick-btn[data-filter="${activeQuickFilter}"]`);
    if (btn) btn.classList.add('active');
  }

  renderMatrix();
  renderTiers();
  renderAppGrid();
  renderChangelog();
  updateQuickFilterCounts();

  // ── Utilities ──
  function escHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function debounce(fn, ms) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

})();
