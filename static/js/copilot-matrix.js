/* ═══════════════════════════════════════════════
   Copilot Feature Matrix — Interactive JS
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

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
  const STATE_ICONS = { full: '✅', partial: '⚡', preview: '🔮', none: '—' };
  const STATE_LABELS = { full: 'Full', partial: 'Partial', preview: 'Preview', none: 'N/A' };

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

  // ── Detect which apps actually have features ──
  const activeApps = [];
  const appHasFeatures = {};
  D.features.forEach(f => {
    if (f.availability) {
      Object.keys(f.availability).forEach(appId => { appHasFeatures[appId] = true; });
    }
  });
  D.apps.forEach(a => { if (appHasFeatures[a.id]) activeApps.push(a); });

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
      // Update URL
      const url = new URL(window.location);
      url.searchParams.set('tab', target);
      history.replaceState(null, '', url);
    });
  });

  // ── Restore tab from URL ──
  const urlTab = new URLSearchParams(window.location.search).get('tab');
  if (urlTab) {
    const t = document.querySelector(`.cpmatrix-tab[data-tab="${urlTab}"]`);
    if (t) t.click();
  }

  // ═══════════════════════════════════════════════
  // TAB 1: Feature Matrix
  // ═══════════════════════════════════════════════

  const gridEl = document.getElementById('cpmatrix-grid');
  const searchInput = document.getElementById('cpmatrix-search');
  const catFilter = document.getElementById('cpmatrix-cat-filter');
  const appFilter = document.getElementById('cpmatrix-app-filter');
  const mobileAppSelect = document.getElementById('cpmatrix-mobile-app');
  const noResults = document.getElementById('cpmatrix-no-results');

  // Populate category filter
  D.featureCategories.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.emoji} ${c.name}`;
    catFilter.appendChild(opt);
  });

  // Populate app filter (desktop)
  activeApps.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a.id;
    opt.textContent = `${a.emoji} ${a.name}`;
    appFilter.appendChild(opt);
  });

  // Populate mobile app picker
  activeApps.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a.id;
    opt.textContent = `${a.emoji} ${a.name}`;
    mobileAppSelect.appendChild(opt);
  });

  function getCell(feature, appId, tierId) {
    if (!feature.availability || !feature.availability[appId]) return null;
    const cell = feature.availability[appId][tierId];
    if (!cell) return null;
    // Handle both object and string formats
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
    const mobileApp = mobileAppSelect.value;

    // Filter features
    let filtered = D.features.filter(f => {
      if (catVal !== 'all' && f.category !== catVal) return false;
      if (query) {
        const text = (f.name + ' ' + f.description + ' ' + f.category).toLowerCase();
        if (!text.includes(query)) return false;
      }
      return true;
    });

    // Determine visible apps
    let visibleApps;
    if (isMobile()) {
      visibleApps = activeApps.filter(a => a.id === mobileApp);
      if (!visibleApps.length) visibleApps = [activeApps[0]];
    } else {
      visibleApps = appVal === 'all' ? activeApps : activeApps.filter(a => a.id === appVal);
    }

    // If app filter active, further filter features to those with data for visible apps
    if (appVal !== 'all' || isMobile()) {
      filtered = filtered.filter(f => {
        return visibleApps.some(a => f.availability && f.availability[a.id]);
      });
    }

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

    // Header row — for each visible app, show tiers as sub-columns
    html += '<thead><tr><th class="cpmatrix-feature-name">Feature</th>';
    visibleApps.forEach(app => {
      html += `<th colspan="${TIER_ORDER.length}">`;
      html += `<span class="cpmatrix-app-emoji">${app.emoji}</span>${app.name}`;
      html += '</th>';
    });
    html += '</tr>';

    // Sub-header: tier names under each app
    html += '<tr><th class="cpmatrix-feature-name"></th>';
    visibleApps.forEach(() => {
      TIER_ORDER.forEach(tid => {
        const tier = tierMap[tid];
        html += `<th style="color:${tier.colour};font-size:0.7rem;">${tier.short_name}</th>`;
      });
    });
    html += '</tr></thead>';

    html += '<tbody>';

    const catOrder = D.featureCategories.map(c => c.id);
    catOrder.forEach(catId => {
      if (!groups[catId]) return;
      const cat = catMap[catId];
      const colSpan = 1 + visibleApps.length * TIER_ORDER.length;
      html += `<tr class="cpmatrix-cat-row"><td colspan="${colSpan}">${cat.emoji} ${cat.name}</td></tr>`;

      groups[catId].forEach(f => {
        html += '<tr>';
        html += `<td class="cpmatrix-feature-name" title="${escHtml(f.description)}">${escHtml(f.name)}</td>`;

        visibleApps.forEach(app => {
          TIER_ORDER.forEach(tid => {
            const cell = getCell(f, app.id, tid);
            if (!cell) {
              html += '<td class="cpmatrix-cell" data-state="none"><span class="cpmatrix-cell-inner"><span class="cpmatrix-cell-dot"></span></span></td>';
              return;
            }
            const state = cell.state || 'none';
            const note = cell.note || '';
            html += `<td class="cpmatrix-cell" data-state="${state}" tabindex="0">`;
            html += `<span class="cpmatrix-cell-inner"><span class="cpmatrix-cell-dot"></span></span>`;
            // Tooltip
            const ttNote = note ? `<div>${escHtml(note)}</div>` : '';
            html += `<div class="cpmatrix-tooltip"><div class="cpmatrix-tooltip-state" data-state="${state}">${STATE_LABELS[state]}</div>${ttNote}</div>`;
            html += '</td>';
          });
        });

        html += '</tr>';
      });
    });

    html += '</tbody></table>';
    gridEl.innerHTML = html;
  }

  // Debounced search
  let searchTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(renderMatrix, 200);
  });
  catFilter.addEventListener('change', renderMatrix);
  appFilter.addEventListener('change', renderMatrix);
  mobileAppSelect.addEventListener('change', renderMatrix);
  window.addEventListener('resize', debounce(renderMatrix, 300));

  renderMatrix();

  // ═══════════════════════════════════════════════
  // TAB 2: Compare Tiers
  // ═══════════════════════════════════════════════

  function renderTiers() {
    const el = document.getElementById('cpmatrix-tiers');
    let html = '';

    D.tiers.forEach(tier => {
      // Count features per tier
      let fullCount = 0, partialCount = 0;
      D.features.forEach(f => {
        if (!f.availability) return;
        Object.values(f.availability).forEach(appData => {
          const cell = appData[tier.id];
          if (!cell) return;
          const st = typeof cell === 'string' ? cell : cell.state;
          if (st === 'full') fullCount++;
          else if (st === 'partial' || st === 'preview') partialCount++;
        });
      });

      // Count apps with at least one feature
      const appCount = new Set();
      D.features.forEach(f => {
        if (!f.availability) return;
        Object.keys(f.availability).forEach(appId => {
          const cell = f.availability[appId][tier.id];
          if (!cell) return;
          const st = typeof cell === 'string' ? cell : cell.state;
          if (st !== 'none') appCount.add(appId);
        });
      });

      const isRecommended = tier.id === 'm365';

      html += `<div class="cpmatrix-tier-card${isRecommended ? ' recommended' : ''}">`;
      if (isRecommended) html += '<div class="cpmatrix-tier-badge">Most Complete</div>';
      html += `<div class="cpmatrix-tier-emoji">${tier.emoji}</div>`;
      html += `<div class="cpmatrix-tier-name">${tier.name}</div>`;
      html += `<div class="cpmatrix-tier-price" style="color:${tier.colour}">${tier.price}</div>`;
      html += `<div class="cpmatrix-tier-price-note">${escHtml(tier.price_note)}</div>`;
      html += `<div class="cpmatrix-tier-desc">${escHtml(tier.description)}</div>`;

      html += '<ul class="cpmatrix-tier-highlights">';
      tier.highlights.forEach(h => {
        html += `<li>${escHtml(h)}</li>`;
      });
      html += '</ul>';

      html += '<div class="cpmatrix-tier-stats">';
      html += `<div class="cpmatrix-tier-stat"><span class="cpmatrix-tier-stat-num" style="color:${tier.colour}">${fullCount}</span><span class="cpmatrix-tier-stat-label">Full Features</span></div>`;
      html += `<div class="cpmatrix-tier-stat"><span class="cpmatrix-tier-stat-num" style="color:var(--cp-partial)">${partialCount}</span><span class="cpmatrix-tier-stat-label">Partial</span></div>`;
      html += `<div class="cpmatrix-tier-stat"><span class="cpmatrix-tier-stat-num">${appCount.size}</span><span class="cpmatrix-tier-stat-label">Apps</span></div>`;
      html += '</div>';

      html += `<div class="cpmatrix-tier-bestfor">💡 Best for: ${escHtml(tier.best_for)}</div>`;

      if (tier.important_note) {
        html += `<div class="cpmatrix-tier-note">⚠️ ${escHtml(tier.important_note)}</div>`;
      }

      html += '</div>';
    });

    el.innerHTML = html;
  }

  renderTiers();

  // ═══════════════════════════════════════════════
  // TAB 3: What Changed
  // ═══════════════════════════════════════════════

  const changeFilter = document.getElementById('cpmatrix-change-filter');

  function renderChangelog() {
    const el = document.getElementById('cpmatrix-timeline');
    const filter = changeFilter.value;

    // Sort by date descending
    const sorted = [...D.changelog].sort((a, b) => b.date.localeCompare(a.date));

    let items = sorted;
    if (filter === 'high') items = items.filter(e => e.impact === 'high');

    if (!items.length) {
      el.innerHTML = '<p style="color:var(--cp-text-muted);text-align:center;">No changes match this filter.</p>';
      return;
    }

    let html = '';
    items.forEach(entry => {
      const d = new Date(entry.date + 'T00:00:00');
      const dateStr = d.toLocaleDateString('en-NZ', { year: 'numeric', month: 'long', day: 'numeric' });
      const isFuture = d > new Date();

      html += `<div class="cpmatrix-timeline-item" data-impact="${entry.impact}">`;
      html += `<div class="cpmatrix-timeline-date">${isFuture ? '🔮 Upcoming: ' : ''}${dateStr}</div>`;
      html += `<span class="cpmatrix-timeline-type" data-type="${entry.type}">${entry.type}</span>`;
      html += `<span style="font-size:0.75rem;color:var(--cp-text-muted);">${entry.scope}</span>`;
      html += `<div class="cpmatrix-timeline-title">${escHtml(entry.title)}</div>`;
      html += `<div class="cpmatrix-timeline-summary">${escHtml(entry.summary)}</div>`;

      if (entry.apps && entry.apps.length) {
        html += '<div class="cpmatrix-timeline-apps">';
        entry.apps.forEach(appId => {
          const app = appMap[appId];
          const label = app ? `${app.emoji} ${app.name}` : appId;
          html += `<span class="cpmatrix-timeline-app-badge">${label}</span>`;
        });
        html += '</div>';
      }

      if (entry.source) {
        html += `<a href="${escHtml(entry.source)}" target="_blank" rel="noopener" class="cpmatrix-timeline-source">📖 Source →</a>`;
      }

      html += '</div>';
    });

    el.innerHTML = html;
  }

  changeFilter.addEventListener('change', renderChangelog);
  renderChangelog();

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
