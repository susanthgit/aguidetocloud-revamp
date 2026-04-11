/* ──────────────────────────────────────────
   Microsoft Service Health Tracker — JS
   Loads latest.json, renders service cards +
   incident timeline with filters & modal.
   ────────────────────────────────────────── */

(function () {
  'use strict';

  const DATA_URL = '/data/service-health/latest.json';
  const INCIDENTS_URL = '/data/service-health/incidents/';
  const PAGE_SIZE = 30;
  const CACHE_KEY = 'shealth_v1';

  let allIssues = [];
  let allServices = [];
  let filtered = [];
  let displayCount = PAGE_SIZE;

  // ── Helpers ──
  function timeAgo(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const now = Date.now();
    const diff = Math.floor((now - d) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return diff + 'm ago';
    if (diff < 1440) return Math.floor(diff / 60) + 'h ago';
    return Math.floor(diff / 1440) + 'd ago';
  }

  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  function stripHtml(html) {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  function escHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ── Load Data ──
  async function loadData() {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts < 600000) { // 10 min cache
          return data;
        }
      }
    } catch (e) { /* ignore */ }

    const resp = await fetch(DATA_URL);
    if (!resp.ok) throw new Error('Failed to load data');
    const data = await resp.json();

    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
    } catch (e) { /* quota */ }

    return data;
  }

  // ── Render Summary Banner ──
  function renderSummary(data) {
    const el = document.getElementById('shealth-summary');
    if (!el) return;

    const activeCount = data.active_issues || 0;
    const totalServices = data.total_services || 0;
    const degradedCount = (data.services || []).filter(s => s.severity > 0).length;
    const totalIssues = data.total_issues || 0;

    if (degradedCount === 0) {
      el.innerHTML = `
        <div class="shealth-all-ok">✅ All ${totalServices} services operational</div>
        <div class="shealth-summary-item"><span class="shealth-summary-value accent">${totalIssues}</span> incidents tracked</div>
      `;
    } else {
      el.innerHTML = `
        <div class="shealth-summary-item"><span class="shealth-summary-value red">${activeCount}</span> active incidents</div>
        <div class="shealth-summary-item"><span class="shealth-summary-value red">${degradedCount}</span> services affected</div>
        <div class="shealth-summary-item"><span class="shealth-summary-value green">${totalServices - degradedCount}</span> operational</div>
        <div class="shealth-summary-item"><span class="shealth-summary-value accent">${totalIssues}</span> total tracked</div>
      `;
    }

    // Add freshness to summary
    const freshEl = document.getElementById('shealth-freshness');
    if (freshEl && data.generated_at) {
      freshEl.textContent = `Last updated: ${timeAgo(data.generated_at)} · Updates every 2 hours`;
    }
  }

  // ── Render Active Incidents ──
  function renderActiveIncidents() {
    const section = document.getElementById('shealth-active-section');
    const list = document.getElementById('shealth-active-list');
    const countEl = document.getElementById('shealth-active-count');
    if (!section || !list) return;

    const active = allIssues.filter(i => !i.is_resolved);

    if (active.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = '';
    if (countEl) countEl.textContent = active.length;
    list.innerHTML = active.map(renderIncident).join('');

    list.querySelectorAll('.shealth-incident').forEach(el => {
      el.addEventListener('click', () => openModal(el.dataset.id));
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(el.dataset.id); } });
    });
  }

  // ── Render Service Cards ──
  function renderServiceCards(services) {
    const grid = document.getElementById('shealth-status-grid');
    if (!grid) return;

    // Show top services — degraded first, then key services, cap at 16
    const priority = ['Microsoft Teams', 'Exchange Online', 'SharePoint Online',
      'Microsoft Entra', 'Microsoft OneDrive', 'Microsoft Copilot (Microsoft 365)',
      'Microsoft 365 Copilot Chat', 'Microsoft Intune', 'Microsoft Defender XDR',
      'Microsoft Purview', 'Power BI', 'Microsoft Viva', 'Microsoft 365 suite',
      'Microsoft 365 apps', 'Planner', 'Microsoft Power Automate'];

    const degraded = services.filter(s => s.severity > 0);
    const healthy = services.filter(s => s.severity === 0);

    // Sort healthy by priority order
    healthy.sort((a, b) => {
      const ai = priority.indexOf(a.service);
      const bi = priority.indexOf(b.service);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });

    const shown = [...degraded, ...healthy].slice(0, 16);

    grid.innerHTML = shown.map(s => `
      <div class="shealth-svc-card" data-severity="${s.severity}" data-service="${escHtml(s.service)}" title="${escHtml(s.service)}: ${escHtml(s.status_label)}" role="button" tabindex="0" aria-label="${escHtml(s.short_name)}: ${escHtml(s.status_label)}">
        <div class="shealth-svc-icon">${s.icon}</div>
        <div class="shealth-svc-name">${escHtml(s.short_name)}</div>
        <div class="shealth-svc-status" data-severity="${s.severity}">${s.status_icon} ${escHtml(s.status_label)}</div>
      </div>
    `).join('');

    // Click and keyboard to filter by service
    grid.querySelectorAll('.shealth-svc-card').forEach(card => {
      const handler = () => {
        const svc = card.dataset.service;
        const sel = document.getElementById('shealth-service-filter');
        if (sel) { sel.value = svc; applyFilters(); }
      };
      card.addEventListener('click', handler);
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); } });
    });
  }

  // ── Populate Service Filter ──
  function populateServiceFilter(services) {
    const sel = document.getElementById('shealth-service-filter');
    if (!sel) return;

    // Get services that have issues
    const svcsWithIssues = new Set(allIssues.map(i => i.service));
    const opts = services
      .filter(s => svcsWithIssues.has(s.service))
      .sort((a, b) => a.short_name.localeCompare(b.short_name));

    opts.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.service;
      opt.textContent = `${s.icon} ${s.short_name}`;
      sel.appendChild(opt);
    });
  }

  // ── Render Incident Card ──
  function renderIncident(i) {
    const active = !i.is_resolved;
    const statusStyle = `background:${i.status_color}22; color:${i.status_color}; border-color:${i.status_color}44`;

    return `
    <div class="shealth-incident" data-active="${active}" data-id="${escHtml(i.id)}" role="button" tabindex="0">
      <div class="shealth-incident-header">
        <div class="shealth-incident-left">
          <h3 class="shealth-incident-title">${escHtml(i.title)}</h3>
          <div class="shealth-incident-meta">
            <span class="shealth-badge shealth-badge-service">${i.service_icon} ${escHtml(i.service_short)}</span>
            <span class="shealth-badge shealth-badge-status" style="${statusStyle}">${i.status_icon} ${escHtml(i.status_label)}</span>
            ${i.regions && i.regions.length > 0 ? `<span class="shealth-badge" style="background:rgba(59,130,246,0.12);color:#60A5FA;border:1px solid rgba(59,130,246,0.25)">🌍 ${escHtml(i.regions.join(', '))}</span>` : ''}
            ${i.update_count > 0 ? `<span style="color:var(--sh-text-dim)">💬 ${i.update_count} updates</span>` : ''}
          </div>
        </div>
        <div class="shealth-incident-right">
          <span class="shealth-incident-time">${formatDate(i.start_time)}</span>
          ${i.duration ? `<span class="shealth-incident-duration">⏱ ${escHtml(i.duration)}</span>` : active ? '<span class="shealth-incident-duration" style="color:var(--sh-red)">⏱ Ongoing</span>' : ''}
        </div>
      </div>
      ${i.impact ? `<div class="shealth-incident-impact">${escHtml(stripHtml(i.impact))}</div>` : ''}
    </div>`;
  }

  // ── Render Timeline ──
  function renderTimeline() {
    const container = document.getElementById('shealth-timeline');
    const meta = document.getElementById('shealth-meta');
    const loadMore = document.getElementById('shealth-load-more');
    const clearBtn = document.getElementById('shealth-clear-btn');
    if (!container) return;

    // Show/hide clear button based on active filters
    const hasFilters = (document.getElementById('shealth-search')?.value || '').trim() !== ''
      || (document.getElementById('shealth-service-filter')?.value || 'all') !== 'all'
      || (document.getElementById('shealth-status-filter')?.value || 'all') !== 'all';
    if (clearBtn) clearBtn.style.display = hasFilters ? '' : 'none';

    // For the history section, show only resolved issues (active shown separately above)
    const historyFiltered = hasFilters ? filtered : filtered.filter(i => i.is_resolved);
    const showing = historyFiltered.slice(0, displayCount);
    const activeCount = filtered.filter(i => !i.is_resolved).length;

    if (meta) {
      meta.innerHTML = `
        <span><span class="shealth-meta-count">${historyFiltered.length}</span> incident${historyFiltered.length !== 1 ? 's' : ''}${hasFilters ? ' match filters' : ' in history'}${activeCount > 0 && hasFilters ? ` · <span style="color:var(--sh-red)">${activeCount} active</span>` : ''}</span>
      `;
    }

    if (showing.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--sh-text-dim)">No incidents match your filters</div>';
      if (loadMore) loadMore.style.display = 'none';
      return;
    }

    // Build HTML with month dividers
    let html = '';
    let currentMonth = '';
    for (const i of showing) {
      const dt = i.start_time ? new Date(i.start_time) : null;
      if (dt) {
        const monthKey = dt.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
        if (monthKey !== currentMonth) {
          currentMonth = monthKey;
          html += `<div class="shealth-month-divider">${monthKey}</div>`;
        }
      }
      html += renderIncident(i);
    }
    container.innerHTML = html;

    if (loadMore) {
      loadMore.style.display = historyFiltered.length > displayCount ? '' : 'none';
    }

    // Click handlers for incidents (Enter + Space)
    container.querySelectorAll('.shealth-incident').forEach(el => {
      el.addEventListener('click', () => openModal(el.dataset.id));
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(el.dataset.id); } });
    });
  }

  // ── Filters ──
  function clearFilters() {
    const search = document.getElementById('shealth-search');
    const svc = document.getElementById('shealth-service-filter');
    const status = document.getElementById('shealth-status-filter');
    if (search) search.value = '';
    if (svc) svc.value = 'all';
    if (status) status.value = 'all';
    applyFilters();
  }

  function applyFilters() {
    const search = (document.getElementById('shealth-search')?.value || '').toLowerCase().trim();
    const svcFilter = document.getElementById('shealth-service-filter')?.value || 'all';
    const statusFilter = document.getElementById('shealth-status-filter')?.value || 'all';

    filtered = allIssues.filter(i => {
      if (svcFilter !== 'all' && i.service !== svcFilter) return false;

      if (statusFilter === 'active' && i.is_resolved) return false;
      if (statusFilter === 'resolved' && !i.is_resolved) return false;
      if (statusFilter === 'advisory' && i.classification !== 'advisory') return false;
      if (statusFilter === 'incident' && i.classification !== 'incident') return false;

      if (search) {
        const hay = (i.title + ' ' + i.service + ' ' + i.service_short + ' ' + i.id + ' ' + (i.impact || '') + ' ' + (i.feature || '') + ' ' + (i.regions || []).join(' ')).toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    });

    displayCount = PAGE_SIZE;
    renderTimeline();
  }

  // ── Modal ──
  async function openModal(issueId) {
    const overlay = document.getElementById('shealth-modal-overlay');
    const body = document.getElementById('shealth-modal-body');
    if (!overlay || !body) return;

    // Find in current data first
    const issue = allIssues.find(i => i.id === issueId);
    if (!issue) return;

    // Show skeleton while loading detail
    body.innerHTML = '<div class="shealth-skeleton"><div class="shealth-skeleton-row"></div></div>';
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Store trigger for focus restore and move focus to close button
    closeModal._trigger = document.activeElement;
    setTimeout(() => document.getElementById('shealth-modal-close')?.focus(), 50);

    // Try to load per-incident detail (has update posts)
    let detail = null;
    try {
      const resp = await fetch(INCIDENTS_URL + issueId + '.json');
      if (resp.ok) detail = await resp.json();
    } catch (e) { /* fallback to summary */ }

    const d = detail || issue;
    const updates = d.updates || [];

    body.innerHTML = `
      <h2 class="shealth-modal-title">${escHtml(d.title)}</h2>
      <div class="shealth-modal-meta">
        <span class="shealth-badge shealth-badge-service">${issue.service_icon} ${escHtml(d.service_short || d.service)}</span>
        <span>${escHtml(d.classification || '')}</span>
        <span>ID: ${escHtml(d.id)}</span>
        ${d.feature ? `<span>Feature: ${escHtml(d.feature)}</span>` : ''}
      </div>
      <div class="shealth-modal-meta">
        <span>🕐 Started: ${formatDate(d.start_time)}</span>
        ${d.end_time ? `<span>✅ Ended: ${formatDate(d.end_time)}</span>` : '<span style="color:var(--sh-red)">🔴 Ongoing</span>'}
        ${d.duration ? `<span>⏱ Duration: ${escHtml(d.duration)}</span>` : ''}
      </div>
      ${d.impact ? `<div class="shealth-modal-impact">${escHtml(stripHtml(d.impact))}</div>` : ''}
      ${updates.length > 0 ? `
        <div class="shealth-updates-title">📋 Communication Timeline (${updates.length} update${updates.length !== 1 ? 's' : ''})</div>
        ${updates.map(u => `
          <div class="shealth-update">
            <div class="shealth-update-time">${formatDate(u.timestamp)}</div>
            <div class="shealth-update-content">${escHtml(stripHtml(u.content))}</div>
          </div>
        `).join('')}
      ` : ''}
    `;
  }

  function closeModal() {
    const overlay = document.getElementById('shealth-modal-overlay');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
    // Restore focus to the triggering element
    if (closeModal._trigger) {
      closeModal._trigger.focus();
      closeModal._trigger = null;
    }
  }

  // ── Freshness ──
  function renderFreshness(generatedAt) {
    const el = document.getElementById('shealth-freshness');
    if (!el || !generatedAt) return;
    el.textContent = `Last updated: ${timeAgo(generatedAt)} · Updates every 2 hours`;
  }

  // ── Init ──
  async function init() {
    try {
      const data = await loadData();

      allServices = data.services || [];
      allIssues = data.issues || [];
      filtered = [...allIssues];

      renderSummary(data);
      renderServiceCards(allServices);
      populateServiceFilter(allServices);
      renderActiveIncidents();
      renderTimeline();
      renderFreshness(data.generated_at);

      // Event listeners
      document.getElementById('shealth-search')?.addEventListener('input', debounce(applyFilters, 250));
      document.getElementById('shealth-service-filter')?.addEventListener('change', applyFilters);
      document.getElementById('shealth-status-filter')?.addEventListener('change', applyFilters);
      document.getElementById('shealth-clear-btn')?.addEventListener('click', clearFilters);
      document.getElementById('shealth-load-btn')?.addEventListener('click', () => {
        displayCount += PAGE_SIZE;
        renderTimeline();
      });
      document.getElementById('shealth-modal-close')?.addEventListener('click', closeModal);
      document.getElementById('shealth-modal-overlay')?.addEventListener('click', e => {
        if (e.target.id === 'shealth-modal-overlay') closeModal();
      });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    } catch (err) {
      console.error('Service Health init error:', err);
      const tl = document.getElementById('shealth-timeline');
      if (tl) tl.innerHTML = '<div style="text-align:center;padding:2rem;color:#EF4444">Failed to load service health data. Please try again later.</div>';
    }
  }

  function debounce(fn, ms) {
    let t;
    return function () { clearTimeout(t); t = setTimeout(fn, ms); };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
