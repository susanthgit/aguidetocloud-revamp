/**
 * M365 Deprecation Timeline — deptime.js
 * v2: Clickable stats, hide passed, sort, deep-links, monthly summary,
 *     critical banner, mobile filter drawer, keyboard shortcuts.
 */
(function () {
  'use strict';

  // ─── XSS Prevention ───
  function esc(s) {
    var e = document.createElement('span');
    e.textContent = s || '';
    return e.innerHTML;
  }

  const CACHE_KEY = 'deptime_v1';
  const CACHE_TTL = 10 * 60 * 1000;
  const DATA_URL = '/data/deprecation-timeline/latest.json';
  const PAGE_SIZE = 24;

  let allItems = [];
  let filteredItems = [];
  let displayedCount = 0;
  let currentView = 'timeline';
  let showPassed = false;
  let currentSort = 'deadline'; // [#4] sort options
  let actionOnlyFilter = false; // [#3] action required toggle

  const categoryOverride = window.__deptimeCategoryFilter || null;

  /* ─── Data Loading ─── */
  async function loadData() {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.ts < CACHE_TTL) return parsed.data;
      } catch (e) { /* ignore */ }
    }
    const resp = await fetch(DATA_URL);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
    return data;
  }

  /* ─── [#1] Clickable Stat Cards ─── */
  function renderStats(items) {
    const active = items.filter(i => i.status === 'active');
    const counts = { critical: 0, warning: 0, watch: 0, future: 0 };
    active.forEach(i => { if (counts[i.urgency] !== undefined) counts[i.urgency]++; });

    document.getElementById('stat-critical').textContent = counts.critical;
    document.getElementById('stat-warning').textContent = counts.warning;
    document.getElementById('stat-watch').textContent = counts.watch;
    document.getElementById('stat-future').textContent = counts.future;
    document.getElementById('stat-total').textContent = active.length;

    // Next deadline alert
    const upcoming = active
      .filter(i => i.days_remaining != null && i.days_remaining >= 0)
      .sort((a, b) => a.days_remaining - b.days_remaining);

    const alertEl = document.getElementById('deptime-next-alert');
    const alertText = document.getElementById('deptime-next-text');
    if (upcoming.length > 0) {
      const next = upcoming[0];
      alertText.innerHTML = `Next deadline: <strong>${esc(next.title)}</strong> — ${esc(next.urgency_label)} (${esc(next.deadline)})`;
      alertEl.style.display = 'flex';
    }

    // [#8] Critical banner — numbered list
    const banner = document.getElementById('deptime-critical-banner');
    if (counts.critical > 0 && banner) {
      const critItems = active.filter(i => i.urgency === 'critical');
      let listHtml = critItems.map((i, idx) =>
        `<li onclick="window.__deptimeShowDetail('${i.id}')">${idx + 1}. <strong>${esc(i.title)}</strong> — ${esc(i.urgency_label)}</li>`
      ).join('');
      banner.innerHTML = `<div class="deptime-banner-header"><span class="deptime-banner-icon">🚨</span> <strong>${counts.critical} critical item${counts.critical > 1 ? 's' : ''} need${counts.critical === 1 ? 's' : ''} immediate attention</strong></div>
        <ol class="deptime-banner-list">${listHtml}</ol>`;
      banner.style.display = 'block';
    }

    // [#7] Monthly summary
    renderMonthlySummary(active);
  }

  /* [#7] "What's Happening This Month" */
  function renderMonthlySummary(active) {
    const el = document.getElementById('deptime-month-summary');
    if (!el) return;
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonthKey = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;

    const thisMonthItems = active.filter(i => i.deadline && i.deadline.startsWith(thisMonth));
    const nextMonthItems = active.filter(i => i.deadline && i.deadline.startsWith(nextMonthKey));

    const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const nextMonthName = nextMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    let html = `<div class="deptime-month-header">📅 What's happening</div><div class="deptime-month-cols">`;
    html += `<div class="deptime-month-col">
      <div class="deptime-month-col-title">${monthName} <span class="deptime-month-count">${thisMonthItems.length}</span></div>`;
    if (thisMonthItems.length === 0) {
      html += '<div class="deptime-month-empty">Nothing this month 🎉</div>';
    } else {
      thisMonthItems.sort((a, b) => a.deadline.localeCompare(b.deadline)).forEach(i => {
        html += `<div class="deptime-month-item deptime-month-item-${i.urgency}" onclick="window.__deptimeShowDetail('${i.id}')">
          <span class="deptime-month-date">${i.deadline.substring(5)}</span> ${esc(i.title)}
        </div>`;
      });
    }
    html += '</div>';

    html += `<div class="deptime-month-col">
      <div class="deptime-month-col-title">${nextMonthName} <span class="deptime-month-count">${nextMonthItems.length}</span></div>`;
    if (nextMonthItems.length === 0) {
      html += '<div class="deptime-month-empty">Nothing next month 🎉</div>';
    } else {
      nextMonthItems.sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 5).forEach(i => {
        html += `<div class="deptime-month-item deptime-month-item-${i.urgency}" onclick="window.__deptimeShowDetail('${i.id}')">
          <span class="deptime-month-date">${i.deadline.substring(5)}</span> ${esc(i.title)}
        </div>`;
      });
      if (nextMonthItems.length > 5) html += `<div class="deptime-month-more">+${nextMonthItems.length - 5} more</div>`;
    }
    html += '</div></div>';
    el.innerHTML = html;
    el.style.display = 'block';
  }

  /* ─── [#6] Card Rendering (refined layout) ─── */
  function renderCard(item) {
    const urgencyClass = item.urgency || 'future';
    const actions = [];
    if (item.migration_url) actions.push(`<a href="${item.migration_url}" class="deptime-action-link" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">📖 Migration</a>`);
    if (item.official_url) actions.push(`<a href="${item.official_url}" class="deptime-action-link" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">🔗 Source</a>`);

    // [#5] Deep-link copy
    actions.push(`<button class="deptime-action-link deptime-share-btn" onclick="event.stopPropagation();window.__deptimeCopyLink('${item.id}')" title="Copy shareable link">🔗 Share</button>`);

    return `<div class="deptime-card" data-id="${item.id}" onclick="window.__deptimeShowDetail('${item.id}')">
      <div class="deptime-card-urgency deptime-card-urgency-${urgencyClass}"></div>
      <div class="deptime-card-top">
        <div class="deptime-card-countdown deptime-countdown-${urgencyClass}">
          ${item.days_remaining != null && item.days_remaining >= 0 ? `<span class="deptime-countdown-num">${item.days_remaining}</span><span class="deptime-countdown-unit">days</span>` : `<span class="deptime-countdown-num">${urgencyClass === 'passed' ? '✓' : '?'}</span><span class="deptime-countdown-unit">${urgencyClass === 'passed' ? 'passed' : 'TBD'}</span>`}
        </div>
        <div class="deptime-card-info">
          <div class="deptime-card-title">${esc(item.title)}</div>
          <div class="deptime-card-badges">
            <span class="deptime-badge deptime-badge-${urgencyClass}">${urgencyClass.toUpperCase()}</span>
            <span class="deptime-badge deptime-badge-type">${item.type_emoji || ''} ${esc(item.type_name || '')}</span>
            <span class="deptime-badge deptime-badge-type">${item.category_emoji || ''} ${esc(item.category_name || '')}</span>
          </div>
        </div>
      </div>
      <div class="deptime-card-desc">${esc(item.description || '')}</div>
      <div class="deptime-card-meta">
        <span class="deptime-meta-item">📅 ${item.deadline || 'TBD'}</span>
        ${item.mc_id ? `<span class="deptime-meta-item">📋 ${esc(item.mc_id)}</span>` : ''}
        ${item.impact ? `<span class="deptime-meta-item">Impact: ${esc(item.impact)}</span>` : ''}
        ${item.replacement ? `<span class="deptime-meta-item">➡️ ${esc(item.replacement)}</span>` : ''}
      </div>
      ${actions.length ? `<div class="deptime-card-actions">${actions.join('')}</div>` : ''}
    </div>`;
  }

  function renderGrid(items, append) {
    const grid = document.getElementById('deptime-grid');
    const loadMore = document.getElementById('deptime-load-more');
    if (!append) { grid.innerHTML = ''; displayedCount = 0; }

    const slice = items.slice(displayedCount, displayedCount + PAGE_SIZE);
    slice.forEach(item => { grid.insertAdjacentHTML('beforeend', renderCard(item)); });
    displayedCount += slice.length;

    if (items.length === 0) {
      grid.innerHTML = '<div class="deptime-loading">No items match your filters.</div>';
    }
    loadMore.style.display = displayedCount < items.length ? 'block' : 'none';

    // [#2] Passed toggle
    const passedCount = allItems.filter(i => i.status === 'passed').length;
    const toggle = document.getElementById('deptime-passed-toggle');
    if (toggle) {
      toggle.textContent = showPassed ? `Hide ${passedCount} passed items` : `Show ${passedCount} passed items`;
    }
  }

  function renderTimeline(items) {
    const track = document.getElementById('deptime-timeline-track');
    const activeItems = items.filter(i => i.deadline);
    const months = {};
    activeItems.forEach(item => {
      const monthKey = item.deadline.substring(0, 7);
      if (!months[monthKey]) months[monthKey] = [];
      months[monthKey].push(item);
    });

    const sortedMonths = Object.keys(months).sort();
    let html = '';
    sortedMonths.forEach(month => {
      const d = new Date(month + '-01');
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const monthItems = months[month].sort((a, b) => a.deadline.localeCompare(b.deadline));

      html += `<div class="deptime-timeline-month">
        <div class="deptime-timeline-month-label">${label} (${monthItems.length})</div>`;
      monthItems.forEach(item => {
        const day = item.deadline.substring(8, 10);
        html += `<div class="deptime-timeline-item deptime-timeline-item-${item.urgency}" onclick="window.__deptimeShowDetail('${item.id}')">
          <span class="deptime-timeline-date">${label.split(' ')[0]} ${parseInt(day)}</span>
          <span class="deptime-timeline-title">${esc(item.title)}</span>
        </div>`;
      });
      html += '</div>';
    });
    track.innerHTML = html || '<div class="deptime-loading">No items to display on timeline.</div>';
  }

  function renderResultsInfo() {
    const el = document.getElementById('deptime-results-info');
    const activeFiltered = filteredItems.filter(i => i.status === 'active').length;
    const passedFiltered = filteredItems.filter(i => i.status === 'passed').length;
    el.textContent = `Showing ${filteredItems.length} items (${activeFiltered} active${showPassed ? `, ${passedFiltered} passed` : ''})`;
  }

  /* ─── Filtering with [#2] hide passed, [#3] action only, [#4] sort ─── */
  function getFilters() {
    return {
      search: document.getElementById('deptime-search').value.toLowerCase().trim(),
      category: categoryOverride || document.getElementById('deptime-category-filter').value,
      urgency: document.getElementById('deptime-urgency-filter').value,
      type: document.getElementById('deptime-type-filter').value,
      impact: document.getElementById('deptime-impact-filter').value,
    };
  }

  function applyFilters() {
    const f = getFilters();

    filteredItems = allItems.filter(item => {
      // [#2] Hide passed unless toggled or explicitly filtering for passed
      if (!showPassed && item.status === 'passed' && f.urgency !== 'passed') return false;
      if (f.category && item.category !== f.category) return false;
      if (f.urgency && item.urgency !== f.urgency) return false;
      if (f.type && item.type !== f.type) return false;
      if (f.impact && item.impact !== f.impact) return false;
      // [#3] Action required toggle
      if (actionOnlyFilter && !item.action_required) return false;
      if (f.search) {
        const haystack = [
          item.title, item.description, item.mc_id,
          item.category_name, item.type_name, item.replacement,
          ...(item.services || []), ...(item.tags || [])
        ].filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(f.search)) return false;
      }
      return true;
    });

    // [#4] Sort
    sortItems();

    renderGrid(filteredItems, false);
    renderTimeline(filteredItems);
    renderResultsInfo();
    renderChips(f);
    updateURL(f);
  }

  function sortItems() {
    const urgencyOrder = { critical: 0, warning: 1, watch: 2, future: 3, passed: 4, unknown: 5 };
    filteredItems.sort((a, b) => {
      if (currentSort === 'deadline') {
        return (a.deadline || '9999').localeCompare(b.deadline || '9999');
      } else if (currentSort === 'urgency') {
        return (urgencyOrder[a.urgency] || 5) - (urgencyOrder[b.urgency] || 5);
      } else if (currentSort === 'impact') {
        const impactOrder = { high: 0, medium: 1, low: 2 };
        return (impactOrder[a.impact] ?? 3) - (impactOrder[b.impact] ?? 3);
      } else if (currentSort === 'category') {
        return (a.category_name || '').localeCompare(b.category_name || '');
      }
      return 0;
    });
  }

  /* [#1] Stat card click handler */
  function setStatFilter(urgencyLevel) {
    const select = document.getElementById('deptime-urgency-filter');
    if (select.value === urgencyLevel) {
      select.value = '';
    } else {
      select.value = urgencyLevel;
    }
    if (urgencyLevel === 'passed') showPassed = true;
    applyFilters();
    document.getElementById('deptime-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderChips(f) {
    const container = document.getElementById('deptime-active-filters');
    const chips = document.getElementById('deptime-chips');
    const hasFilters = f.search || f.category || f.urgency || f.type || f.impact || actionOnlyFilter;
    container.style.display = hasFilters ? 'flex' : 'none';
    chips.innerHTML = '';

    if (f.search) addChip(chips, `Search: "${f.search}"`, () => { document.getElementById('deptime-search').value = ''; applyFilters(); });
    if (f.category && !categoryOverride) addChip(chips, `Category: ${f.category}`, () => { document.getElementById('deptime-category-filter').value = ''; applyFilters(); });
    if (f.urgency) addChip(chips, `Urgency: ${f.urgency}`, () => { document.getElementById('deptime-urgency-filter').value = ''; applyFilters(); });
    if (f.type) addChip(chips, `Type: ${f.type}`, () => { document.getElementById('deptime-type-filter').value = ''; applyFilters(); });
    if (f.impact) addChip(chips, `Impact: ${f.impact}`, () => { document.getElementById('deptime-impact-filter').value = ''; applyFilters(); });
    if (actionOnlyFilter) addChip(chips, 'Action Required Only', () => { actionOnlyFilter = false; document.getElementById('deptime-action-toggle').classList.remove('active'); applyFilters(); });
  }

  function addChip(container, label, onRemove) {
    const chip = document.createElement('span');
    chip.className = 'deptime-chip';
    chip.innerHTML = `${esc(label)} <span class="deptime-chip-remove" onclick="event.stopPropagation()">✕</span>`;
    chip.querySelector('.deptime-chip-remove').addEventListener('click', onRemove);
    container.appendChild(chip);
  }

  /* ─── URL State + [#5] Deep-link to item ─── */
  function updateURL(f) {
    const params = new URLSearchParams();
    if (f.search) params.set('q', f.search);
    if (f.category && !categoryOverride) params.set('category', f.category);
    if (f.urgency) params.set('urgency', f.urgency);
    if (f.type) params.set('type', f.type);
    if (f.impact) params.set('impact', f.impact);
    if (currentSort !== 'deadline') params.set('sort', currentSort);
    const qs = params.toString();
    const url = window.location.pathname + (qs ? '?' + qs : '');
    history.replaceState(null, '', url);
  }

  function loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('q')) document.getElementById('deptime-search').value = params.get('q');
    if (params.get('category')) document.getElementById('deptime-category-filter').value = params.get('category');
    if (params.get('urgency')) document.getElementById('deptime-urgency-filter').value = params.get('urgency');
    if (params.get('type')) document.getElementById('deptime-type-filter').value = params.get('type');
    if (params.get('impact')) document.getElementById('deptime-impact-filter').value = params.get('impact');
    if (params.get('sort')) {
      currentSort = params.get('sort');
      const sortSel = document.getElementById('deptime-sort');
      if (sortSel) sortSel.value = currentSort;
    }
    // [#5] Deep-link to specific item
    if (params.get('item')) {
      setTimeout(() => { window.__deptimeShowDetail(params.get('item')); }, 300);
    }
    // Show passed if urgency=passed
    if (params.get('urgency') === 'passed') showPassed = true;
  }

  /* [#5] Copy shareable link */
  window.__deptimeCopyLink = function (id) {
    const url = `${window.location.origin}/deprecation-timeline/?item=${id}`;
    navigator.clipboard.writeText(url).then(() => {
      const btn = document.querySelector(`[data-id="${id}"] .deptime-share-btn`);
      if (btn) { const orig = btn.textContent; btn.textContent = '✓ Copied!'; setTimeout(() => { btn.textContent = orig; }, 1500); }
    });
  };

  /* ─── Detail Modal ─── */
  window.__deptimeShowDetail = function (id) {
    const item = allItems.find(i => i.id === id);
    if (!item) return;

    const modal = document.getElementById('deptime-modal');
    const body = document.getElementById('deptime-modal-body');
    const urgencyClass = item.urgency || 'future';
    const countdownBg = `deptime-countdown-${urgencyClass}`;

    let linksHtml = '';
    if (item.migration_url) linksHtml += `<a href="${item.migration_url}" class="deptime-modal-link" target="_blank" rel="noopener noreferrer">📖 Migration Guide</a>`;
    if (item.official_url) linksHtml += `<a href="${item.official_url}" class="deptime-modal-link" target="_blank" rel="noopener noreferrer">🔗 Official Source</a>`;
    if (item.lifecycle_url) linksHtml += `<a href="${item.lifecycle_url}" class="deptime-modal-link" target="_blank" rel="noopener noreferrer">📅 Lifecycle Page</a>`;
    linksHtml += `<button class="deptime-modal-link" onclick="window.__deptimeCopyLink('${item.id}')">📋 Copy Link</button>`;

    body.innerHTML = `
      <div class="deptime-modal-countdown ${countdownBg}">
        <div class="deptime-modal-countdown-number">${item.days_remaining != null ? (item.days_remaining >= 0 ? item.days_remaining : 'PASSED') : 'TBD'}</div>
        <div class="deptime-modal-countdown-label">${item.days_remaining != null && item.days_remaining >= 0 ? 'days remaining' : (item.days_remaining != null ? Math.abs(item.days_remaining) + ' days ago' : 'date to be determined')}</div>
      </div>
      <div class="deptime-modal-title">${esc(item.title)}</div>
      <div class="deptime-modal-badges">
        <span class="deptime-badge deptime-badge-${urgencyClass}">${urgencyClass.toUpperCase()}</span>
        <span class="deptime-badge deptime-badge-type">${item.type_emoji} ${esc(item.type_name)}</span>
        <span class="deptime-badge deptime-badge-type">${item.category_emoji} ${esc(item.category_name)}</span>
        ${item.impact ? `<span class="deptime-badge deptime-badge-type">Impact: ${esc(item.impact)}</span>` : ''}
        ${item.mc_id ? `<span class="deptime-badge deptime-badge-type">📋 ${esc(item.mc_id)}</span>` : ''}
      </div>
      <div class="deptime-modal-section"><h3>Description</h3><p>${esc(item.description || 'No description available.')}</p></div>
      <div class="deptime-modal-section"><h3>Deadline</h3><p>📅 ${item.deadline || 'TBD'}${item.announced_date ? ' (Announced: ' + esc(item.announced_date) + ')' : ''}</p></div>
      ${item.migration_path ? `<div class="deptime-modal-section"><h3>Migration Path</h3><p>${esc(item.migration_path)}</p></div>` : ''}
      ${item.replacement ? `<div class="deptime-modal-section"><h3>Replacement</h3><p>➡️ ${esc(item.replacement)}</p></div>` : ''}
      ${item.services && item.services.length ? `<div class="deptime-modal-section"><h3>Affected Services</h3><p>${(item.services || []).map(esc).join(', ')}</p></div>` : ''}
      ${linksHtml ? `<div class="deptime-modal-section"><h3>Links</h3><div class="deptime-modal-links">${linksHtml}</div></div>` : ''}`;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    // Update URL with item deep-link
    history.replaceState(null, '', `${window.location.pathname}?item=${id}`);
  };

  function closeModal() {
    document.getElementById('deptime-modal').style.display = 'none';
    document.body.style.overflow = '';
    // Remove item param from URL
    const params = new URLSearchParams(window.location.search);
    params.delete('item');
    const qs = params.toString();
    history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : ''));
  }

  /* ─── CSV Export ─── */
  function exportCSV() {
    const headers = ['Title', 'Category', 'Type', 'Urgency', 'Deadline', 'Days Remaining', 'Impact', 'MC ID', 'Services', 'Migration Path', 'Replacement', 'Official URL'];
    const rows = filteredItems.map(i => [
      `"${(i.title || '').replace(/"/g, '""')}"`,
      i.category_name || '', i.type_name || '', i.urgency || '',
      i.deadline || '', i.days_remaining ?? '', i.impact || '', i.mc_id || '',
      `"${(i.services || []).join(', ')}"`,
      `"${(i.migration_path || '').replace(/"/g, '""')}"`,
      i.replacement || '', i.official_url || ''
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `m365-deprecation-timeline-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ─── View Toggle ─── */
  function setView(view) {
    currentView = view;
    document.getElementById('deptime-view-grid').classList.toggle('active', view === 'grid');
    document.getElementById('deptime-view-timeline').classList.toggle('active', view === 'timeline');
    document.getElementById('deptime-grid').style.display = view === 'grid' ? 'grid' : 'none';
    document.getElementById('deptime-load-more').style.display = view === 'grid' && displayedCount < filteredItems.length ? 'block' : 'none';
    document.getElementById('deptime-timeline-view').style.display = view === 'timeline' ? 'block' : 'none';
  }

  /* ─── Populate Category Dropdown ─── */
  function populateCategories(items) {
    const select = document.getElementById('deptime-category-filter');
    const cats = {};
    items.forEach(i => {
      if (i.category && !cats[i.category]) cats[i.category] = { name: i.category_name, emoji: i.category_emoji };
    });
    Object.entries(cats).sort((a, b) => a[1].name.localeCompare(b[1].name)).forEach(([key, val]) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = `${val.emoji} ${val.name}`;
      select.appendChild(opt);
    });
    if (categoryOverride) { select.value = categoryOverride; select.disabled = true; }
  }

  /* ─── [#9] Mobile Filter Drawer ─── */
  function setupMobileFilters() {
    const toggleBtn = document.getElementById('deptime-filter-toggle');
    const drawer = document.getElementById('deptime-filter-drawer');
    if (!toggleBtn || !drawer) return;

    toggleBtn.addEventListener('click', () => {
      const open = drawer.classList.toggle('deptime-drawer-open');
      toggleBtn.textContent = open ? '✕ Close Filters' : 'Filters';
    });
  }

  /* ─── Init ─── */
  async function init() {
    // Tab switching
    var dtTabs = document.querySelectorAll('.deptime-tab');
    var dtPanels = document.querySelectorAll('.deptime-panel');
    dtTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        dtTabs.forEach(function (t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        dtPanels.forEach(function (p) { p.classList.remove('active'); p.hidden = true; });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        var panel = document.getElementById('panel-' + tab.dataset.tab);
        if (panel) { panel.classList.add('active'); panel.hidden = false; }
      });
    });

    try {
      const data = await loadData();
      allItems = data.items || [];

      renderStats(allItems);
      populateCategories(allItems);
      loadFromURL();
      applyFilters();

      // Action Required tab removed in V2 — action filter toggle handles it

      // Standard filter listeners
      document.getElementById('deptime-search').addEventListener('input', debounce(applyFilters, 300));
      ['deptime-category-filter', 'deptime-urgency-filter', 'deptime-type-filter', 'deptime-impact-filter'].forEach(id => {
        document.getElementById(id).addEventListener('change', applyFilters);
      });

      // [#4] Sort dropdown
      const sortSel = document.getElementById('deptime-sort');
      if (sortSel) {
        sortSel.addEventListener('change', () => { currentSort = sortSel.value; applyFilters(); });
      }

      // [#3] Action Required toggle
      const actionBtn = document.getElementById('deptime-action-toggle');
      if (actionBtn) {
        actionBtn.addEventListener('click', () => {
          actionOnlyFilter = !actionOnlyFilter;
          actionBtn.classList.toggle('active', actionOnlyFilter);
          applyFilters();
        });
      }

      // [#2] Passed toggle
      const passedBtn = document.getElementById('deptime-passed-toggle');
      if (passedBtn) {
        passedBtn.addEventListener('click', () => {
          showPassed = !showPassed;
          applyFilters();
        });
      }

      // [#1] Clickable stat cards
      document.getElementById('stat-critical').closest('.deptime-stat-card').addEventListener('click', () => setStatFilter('critical'));
      document.getElementById('stat-warning').closest('.deptime-stat-card').addEventListener('click', () => setStatFilter('warning'));
      document.getElementById('stat-watch').closest('.deptime-stat-card').addEventListener('click', () => setStatFilter('watch'));
      document.getElementById('stat-future').closest('.deptime-stat-card').addEventListener('click', () => setStatFilter('future'));
      document.getElementById('stat-total').closest('.deptime-stat-card').addEventListener('click', () => {
        document.getElementById('deptime-urgency-filter').value = '';
        applyFilters();
      });

      document.getElementById('deptime-clear-filters').addEventListener('click', () => {
        document.getElementById('deptime-search').value = '';
        if (!categoryOverride) document.getElementById('deptime-category-filter').value = '';
        document.getElementById('deptime-urgency-filter').value = '';
        document.getElementById('deptime-type-filter').value = '';
        document.getElementById('deptime-impact-filter').value = '';
        actionOnlyFilter = false;
        const ab = document.getElementById('deptime-action-toggle');
        if (ab) ab.classList.remove('active');
        applyFilters();
      });

      document.getElementById('deptime-load-btn').addEventListener('click', () => renderGrid(filteredItems, true));
      document.getElementById('deptime-view-grid').addEventListener('click', () => setView('grid'));
      document.getElementById('deptime-view-timeline').addEventListener('click', () => setView('timeline'));
      document.getElementById('deptime-modal-close').addEventListener('click', closeModal);
      document.getElementById('deptime-modal-overlay').addEventListener('click', closeModal);
      document.getElementById('deptime-export-csv').addEventListener('click', exportCSV);

      // [#10] Keyboard shortcuts
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT') return;
        if (e.key === 'c') setStatFilter('critical');
        if (e.key === 'w') setStatFilter('warning');
        if (e.key === 'g') setView('grid');
        if (e.key === 't') setView('timeline');
        if (e.key === '/') { e.preventDefault(); document.getElementById('deptime-search').focus(); }
      });

      // [#9] Mobile filter drawer
      setupMobileFilters();

    } catch (err) {
      console.error('Deprecation Timeline load error:', err);
      document.getElementById('deptime-grid').innerHTML =
        '<div class="deptime-loading">Failed to load data. Please try again later.</div>';
    }
  }

  function debounce(fn, ms) { let t; return function (...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), ms); }; }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
