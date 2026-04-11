/**
 * M365 Deprecation Timeline — deptime.js
 * Loads deprecation data, renders grid + timeline, handles filters/search/URL state.
 */
(function () {
  'use strict';

  const CACHE_KEY = 'deptime_v1';
  const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  const DATA_URL = '/data/deprecation-timeline/latest.json';
  const PAGE_SIZE = 24;

  let allItems = [];
  let filteredItems = [];
  let displayedCount = 0;
  let currentView = 'grid';

  // Category filter override (for category pages)
  const categoryOverride = window.__deptimeCategoryFilter || null;

  /* ─── Data Loading ─── */
  async function loadData() {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.ts < CACHE_TTL) {
          return parsed.data;
        }
      } catch (e) { /* ignore */ }
    }

    const resp = await fetch(DATA_URL);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
    return data;
  }

  /* ─── Rendering ─── */
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
      alertText.innerHTML = `Next deadline: <strong>${next.title}</strong> — ${next.urgency_label} (${next.deadline})`;
      alertEl.style.display = 'flex';
    }
  }

  function renderCard(item) {
    const urgencyClass = item.urgency || 'future';
    const mcLabel = item.mc_id ? `<span class="deptime-meta-item">📋 ${item.mc_id}</span>` : '';
    const impactLabel = item.impact ? `<span class="deptime-meta-item">💥 ${item.impact.charAt(0).toUpperCase() + item.impact.slice(1)}</span>` : '';

    const actions = [];
    if (item.migration_url) actions.push(`<a href="${item.migration_url}" class="deptime-action-link" target="_blank" rel="noopener" onclick="event.stopPropagation()">📖 Migration Guide</a>`);
    if (item.official_url) actions.push(`<a href="${item.official_url}" class="deptime-action-link" target="_blank" rel="noopener" onclick="event.stopPropagation()">🔗 Official Source</a>`);

    return `<div class="deptime-card" data-id="${item.id}" onclick="window.__deptimeShowDetail('${item.id}')">
      <div class="deptime-card-urgency deptime-card-urgency-${urgencyClass}"></div>
      <div class="deptime-card-header">
        <div class="deptime-card-badges">
          <span class="deptime-badge deptime-badge-${urgencyClass}">${urgencyClass.toUpperCase()}</span>
          <span class="deptime-badge deptime-badge-type">${item.type_emoji || ''} ${item.type_name || ''}</span>
        </div>
      </div>
      <div class="deptime-card-title">${item.title}</div>
      <div class="deptime-card-desc">${item.description || ''}</div>
      <div class="deptime-card-meta">
        <span class="deptime-meta-item">${item.category_emoji || ''} ${item.category_name || ''}</span>
        <span class="deptime-meta-item">📅 ${item.deadline || 'TBD'}</span>
        ${mcLabel}
        ${impactLabel}
      </div>
      <div class="deptime-card-countdown deptime-countdown-${urgencyClass}">
        ${item.urgency_label || ''}
      </div>
      ${actions.length ? `<div class="deptime-card-actions">${actions.join('')}</div>` : ''}
    </div>`;
  }

  function renderGrid(items, append) {
    const grid = document.getElementById('deptime-grid');
    const loadMore = document.getElementById('deptime-load-more');

    if (!append) {
      grid.innerHTML = '';
      displayedCount = 0;
    }

    const slice = items.slice(displayedCount, displayedCount + PAGE_SIZE);
    slice.forEach(item => {
      grid.insertAdjacentHTML('beforeend', renderCard(item));
    });
    displayedCount += slice.length;

    if (items.length === 0) {
      grid.innerHTML = '<div class="deptime-loading">No items match your filters.</div>';
    }

    loadMore.style.display = displayedCount < items.length ? 'block' : 'none';
  }

  function renderTimeline(items) {
    const track = document.getElementById('deptime-timeline-track');
    const active = items.filter(i => i.status === 'active' && i.deadline);

    // Group by month
    const months = {};
    active.forEach(item => {
      const monthKey = item.deadline.substring(0, 7); // YYYY-MM
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
        <div class="deptime-timeline-month-label">${label}</div>`;

      monthItems.forEach(item => {
        const day = item.deadline.substring(8, 10);
        html += `<div class="deptime-timeline-item deptime-timeline-item-${item.urgency}" onclick="window.__deptimeShowDetail('${item.id}')">
          <span class="deptime-timeline-date">${label.split(' ')[0]} ${parseInt(day)}</span>
          <span class="deptime-timeline-title">${item.title}</span>
        </div>`;
      });

      html += '</div>';
    });

    track.innerHTML = html;
  }

  function renderResultsInfo() {
    const el = document.getElementById('deptime-results-info');
    const activeFiltered = filteredItems.filter(i => i.status === 'active').length;
    const passedFiltered = filteredItems.filter(i => i.status === 'passed').length;
    el.textContent = `Showing ${filteredItems.length} items (${activeFiltered} active, ${passedFiltered} passed)`;
  }

  /* ─── Filtering ─── */
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
      if (f.category && item.category !== f.category) return false;
      if (f.urgency && item.urgency !== f.urgency) return false;
      if (f.type && item.type !== f.type) return false;
      if (f.impact && item.impact !== f.impact) return false;
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

    renderGrid(filteredItems, false);
    renderTimeline(filteredItems);
    renderResultsInfo();
    renderChips(f);
    updateURL(f);
  }

  function renderChips(f) {
    const container = document.getElementById('deptime-active-filters');
    const chips = document.getElementById('deptime-chips');
    const hasFilters = f.search || f.category || f.urgency || f.type || f.impact;

    container.style.display = hasFilters ? 'flex' : 'none';
    chips.innerHTML = '';

    if (f.search) addChip(chips, `Search: "${f.search}"`, () => { document.getElementById('deptime-search').value = ''; applyFilters(); });
    if (f.category && !categoryOverride) addChip(chips, `Category: ${f.category}`, () => { document.getElementById('deptime-category-filter').value = ''; applyFilters(); });
    if (f.urgency) addChip(chips, `Urgency: ${f.urgency}`, () => { document.getElementById('deptime-urgency-filter').value = ''; applyFilters(); });
    if (f.type) addChip(chips, `Type: ${f.type}`, () => { document.getElementById('deptime-type-filter').value = ''; applyFilters(); });
    if (f.impact) addChip(chips, `Impact: ${f.impact}`, () => { document.getElementById('deptime-impact-filter').value = ''; applyFilters(); });
  }

  function addChip(container, label, onRemove) {
    const chip = document.createElement('span');
    chip.className = 'deptime-chip';
    chip.innerHTML = `${label} <span class="deptime-chip-remove" onclick="event.stopPropagation()">✕</span>`;
    chip.querySelector('.deptime-chip-remove').addEventListener('click', onRemove);
    container.appendChild(chip);
  }

  /* ─── URL State ─── */
  function updateURL(f) {
    const params = new URLSearchParams();
    if (f.search) params.set('q', f.search);
    if (f.category && !categoryOverride) params.set('category', f.category);
    if (f.urgency) params.set('urgency', f.urgency);
    if (f.type) params.set('type', f.type);
    if (f.impact) params.set('impact', f.impact);
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
  }

  /* ─── Detail Modal ─── */
  window.__deptimeShowDetail = function (id) {
    const item = allItems.find(i => i.id === id);
    if (!item) return;

    const modal = document.getElementById('deptime-modal');
    const body = document.getElementById('deptime-modal-body');

    const urgencyClass = item.urgency || 'future';
    const countdownBg = `deptime-countdown-${urgencyClass}`;

    let linksHtml = '';
    if (item.migration_url) linksHtml += `<a href="${item.migration_url}" class="deptime-modal-link" target="_blank" rel="noopener">📖 Migration Guide</a>`;
    if (item.official_url) linksHtml += `<a href="${item.official_url}" class="deptime-modal-link" target="_blank" rel="noopener">🔗 Official Source</a>`;
    if (item.lifecycle_url) linksHtml += `<a href="${item.lifecycle_url}" class="deptime-modal-link" target="_blank" rel="noopener">📅 Lifecycle Page</a>`;

    body.innerHTML = `
      <div class="deptime-modal-countdown ${countdownBg}">
        <div class="deptime-modal-countdown-number">${item.days_remaining != null ? (item.days_remaining >= 0 ? item.days_remaining : 'PASSED') : 'TBD'}</div>
        <div class="deptime-modal-countdown-label">${item.days_remaining != null && item.days_remaining >= 0 ? 'days remaining' : (item.days_remaining != null ? `${Math.abs(item.days_remaining)} days ago` : 'date to be determined')}</div>
      </div>
      <div class="deptime-modal-title">${item.title}</div>
      <div class="deptime-modal-badges">
        <span class="deptime-badge deptime-badge-${urgencyClass}">${urgencyClass.toUpperCase()}</span>
        <span class="deptime-badge deptime-badge-type">${item.type_emoji} ${item.type_name}</span>
        <span class="deptime-badge deptime-badge-type">${item.category_emoji} ${item.category_name}</span>
        ${item.impact ? `<span class="deptime-badge deptime-badge-type">Impact: ${item.impact}</span>` : ''}
        ${item.mc_id ? `<span class="deptime-badge deptime-badge-type">📋 ${item.mc_id}</span>` : ''}
      </div>
      <div class="deptime-modal-section">
        <h3>Description</h3>
        <p>${item.description || 'No description available.'}</p>
      </div>
      <div class="deptime-modal-section">
        <h3>Deadline</h3>
        <p>📅 ${item.deadline || 'TBD'}${item.announced_date ? ` (Announced: ${item.announced_date})` : ''}</p>
      </div>
      ${item.migration_path ? `<div class="deptime-modal-section">
        <h3>Migration Path</h3>
        <p>${item.migration_path}</p>
      </div>` : ''}
      ${item.replacement ? `<div class="deptime-modal-section">
        <h3>Replacement</h3>
        <p>➡️ ${item.replacement}</p>
      </div>` : ''}
      ${item.services && item.services.length ? `<div class="deptime-modal-section">
        <h3>Affected Services</h3>
        <p>${item.services.join(', ')}</p>
      </div>` : ''}
      ${linksHtml ? `<div class="deptime-modal-section">
        <h3>Links</h3>
        <div class="deptime-modal-links">${linksHtml}</div>
      </div>` : ''}
    `;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  };

  function closeModal() {
    document.getElementById('deptime-modal').style.display = 'none';
    document.body.style.overflow = '';
  }

  /* ─── CSV Export ─── */
  function exportCSV() {
    const headers = ['Title', 'Category', 'Type', 'Urgency', 'Deadline', 'Days Remaining', 'Impact', 'MC ID', 'Services', 'Migration Path', 'Replacement', 'Official URL'];
    const rows = filteredItems.map(i => [
      `"${(i.title || '').replace(/"/g, '""')}"`,
      i.category_name || '',
      i.type_name || '',
      i.urgency || '',
      i.deadline || '',
      i.days_remaining ?? '',
      i.impact || '',
      i.mc_id || '',
      `"${(i.services || []).join(', ')}"`,
      `"${(i.migration_path || '').replace(/"/g, '""')}"`,
      i.replacement || '',
      i.official_url || ''
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
      if (i.category && !cats[i.category]) {
        cats[i.category] = { name: i.category_name, emoji: i.category_emoji };
      }
    });

    Object.entries(cats)
      .sort((a, b) => a[1].name.localeCompare(b[1].name))
      .forEach(([key, val]) => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = `${val.emoji} ${val.name}`;
        select.appendChild(opt);
      });

    if (categoryOverride) {
      select.value = categoryOverride;
      select.disabled = true;
    }
  }

  /* ─── Init ─── */
  async function init() {
    try {
      const data = await loadData();
      allItems = data.items || [];

      renderStats(allItems);
      populateCategories(allItems);
      loadFromURL();
      applyFilters();

      // Event listeners
      document.getElementById('deptime-search').addEventListener('input', debounce(applyFilters, 300));
      document.getElementById('deptime-category-filter').addEventListener('change', applyFilters);
      document.getElementById('deptime-urgency-filter').addEventListener('change', applyFilters);
      document.getElementById('deptime-type-filter').addEventListener('change', applyFilters);
      document.getElementById('deptime-impact-filter').addEventListener('change', applyFilters);

      document.getElementById('deptime-clear-filters').addEventListener('click', () => {
        document.getElementById('deptime-search').value = '';
        if (!categoryOverride) document.getElementById('deptime-category-filter').value = '';
        document.getElementById('deptime-urgency-filter').value = '';
        document.getElementById('deptime-type-filter').value = '';
        document.getElementById('deptime-impact-filter').value = '';
        applyFilters();
      });

      document.getElementById('deptime-load-btn').addEventListener('click', () => renderGrid(filteredItems, true));

      document.getElementById('deptime-view-grid').addEventListener('click', () => setView('grid'));
      document.getElementById('deptime-view-timeline').addEventListener('click', () => setView('timeline'));

      document.getElementById('deptime-modal-close').addEventListener('click', closeModal);
      document.getElementById('deptime-modal-overlay').addEventListener('click', closeModal);
      document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

      document.getElementById('deptime-export-csv').addEventListener('click', exportCSV);

    } catch (err) {
      console.error('Deprecation Timeline load error:', err);
      document.getElementById('deptime-grid').innerHTML =
        '<div class="deptime-loading">Failed to load data. Please try again later.</div>';
    }
  }

  function debounce(fn, ms) {
    let t;
    return function (...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), ms); };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
