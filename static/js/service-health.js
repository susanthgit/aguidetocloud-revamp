/* ──────────────────────────────────────────
   Microsoft Service Health Tracker — JS
   Loads latest.json, renders service cards +
   incident timeline with filters & modal.
   ────────────────────────────────────────── */

(function () {
  'use strict';

  const DATA_URL = '/data/service-health/latest.json';
  const STATS_URL = '/data/service-health/stats.json';
  const INCIDENTS_URL = '/data/service-health/incidents/';
  const PAGE_SIZE = 30;
  const CACHE_KEY = 'shealth_v2';

  let allIssues = [];
  let allServices = [];
  let statsData = null;
  let filtered = [];
  let displayCount = PAGE_SIZE;

  // ── Helpers ──
  function esc(s) {
    const e = document.createElement('span');
    e.textContent = s || '';
    return e.innerHTML;
  }

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
        <div class="shealth-summary-item"><span class="shealth-summary-value shealth-accent">${totalIssues}</span> incidents tracked</div>
      `;
    } else {
      el.innerHTML = `
        <div class="shealth-summary-item"><span class="shealth-summary-value shealth-red">${activeCount}</span> active incidents</div>
        <div class="shealth-summary-item"><span class="shealth-summary-value shealth-red">${degradedCount}</span> services affected</div>
        <div class="shealth-summary-item"><span class="shealth-summary-value shealth-green">${totalServices - degradedCount}</span> operational</div>
        <div class="shealth-summary-item"><span class="shealth-summary-value shealth-accent">${totalIssues}</span> total tracked</div>
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
      list.innerHTML = '';
      if (countEl) countEl.textContent = '0';
      var noActive = document.getElementById('shealth-no-active');
      if (noActive) noActive.style.display = '';
      return;
    }

    var noActive2 = document.getElementById('shealth-no-active');
    if (noActive2) noActive2.style.display = 'none';
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
      <div class="shealth-svc-card" data-severity="${s.severity}" data-service="${esc(s.service)}" title="${esc(s.service)}: ${esc(s.status_label)}" role="button" tabindex="0" aria-label="${esc(s.short_name)}: ${esc(s.status_label)}">
        <div class="shealth-svc-icon">${s.icon}</div>
        <div class="shealth-svc-name">${esc(s.short_name)}</div>
        <div class="shealth-svc-status" data-severity="${s.severity}">${s.status_icon} ${esc(s.status_label)}</div>
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

  // ── Duration Bar Helper ──
  function parseDurationMinutes(dur) {
    if (!dur) return 0;
    let mins = 0;
    const d = dur.match(/(\d+)d/); if (d) mins += parseInt(d[1]) * 1440;
    const h = dur.match(/(\d+)h/); if (h) mins += parseInt(h[1]) * 60;
    const m = dur.match(/(\d+)m/); if (m) mins += parseInt(m[1]);
    return mins;
  }

  function renderDurationBar(duration) {
    const mins = parseDurationMinutes(duration);
    if (mins <= 0) return '';
    // Scale: 0-60min = green, 60-360min = yellow, 360+ = red. Max bar at 24h (1440min)
    const pct = Math.min((mins / 1440) * 100, 100);
    const color = mins < 60 ? 'var(--sh-green)' : mins < 360 ? 'var(--sh-yellow)' : 'var(--sh-red)';
    return `<div class="shealth-duration-bar"><div class="shealth-duration-fill" style="width:${pct}%;background:${color}"></div></div>`;
  }

  // ── Render Incident Card ──
  function renderIncident(i) {
    const active = !i.is_resolved;
    const statusStyle = `background:${i.status_color}22; color:${i.status_color}; border-color:${i.status_color}44`;

    return `
    <div class="shealth-incident" data-active="${active}" data-id="${esc(i.id)}" role="button" tabindex="0">
      <div class="shealth-incident-header">
        <div class="shealth-incident-left">
          <h3 class="shealth-incident-title">${esc(i.title)}</h3>
          <div class="shealth-incident-meta">
            <span class="shealth-badge shealth-badge-service">${i.service_icon} ${esc(i.service_short)}</span>
            <span class="shealth-badge shealth-badge-status" style="${statusStyle}">${i.status_icon} ${esc(i.status_label)}</span>
            ${i.regions && i.regions.length > 0 ? `<span class="shealth-badge" style="background:rgba(59,130,246,0.12);color:#60A5FA;border:1px solid rgba(59,130,246,0.25)">🌍 ${esc(i.regions.join(', '))}</span>` : ''}
            ${i.feature ? `<span class="shealth-badge" style="background:rgba(167,139,250,0.12);color:#A78BFA;border:1px solid rgba(167,139,250,0.25)">${esc(i.feature)}</span>` : ''}
            ${i.update_count > 0 ? `<span style="color:var(--sh-text-dim)">💬 ${i.update_count} updates</span>` : ''}
          </div>
        </div>
        <div class="shealth-incident-right">
          <span class="shealth-incident-time">${formatDate(i.start_time)}</span>
          ${i.duration ? `<span class="shealth-incident-duration">⏱ ${esc(i.duration)}</span>` : active ? '<span class="shealth-incident-duration" style="color:var(--sh-red)">⏱ Ongoing</span>' : ''}
        </div>
      </div>
      ${i.impact ? `<div class="shealth-incident-impact">${esc(stripHtml(i.impact))}</div>` : ''}
      ${i.duration ? renderDurationBar(i.duration) : ''}
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
    writeUrlState();
  }

  // ── Modal ──
  let _modalController = null;
  async function openModal(issueId) {
    const overlay = document.getElementById('shealth-modal-overlay');
    const body = document.getElementById('shealth-modal-body');
    if (!overlay || !body) return;

    // Cancel any in-flight modal fetch
    if (_modalController) _modalController.abort();
    _modalController = new AbortController();
    const signal = _modalController.signal;

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
      const resp = await fetch(INCIDENTS_URL + issueId + '.json', { signal });
      if (resp.ok) detail = await resp.json();
    } catch (e) { if (e.name === 'AbortError') return; /* fallback to summary */ }

    const d = detail || issue;
    const updates = d.updates || [];

    body.innerHTML = `
      <h2 class="shealth-modal-title">${esc(d.title)}</h2>
      <div class="shealth-modal-meta">
        <span class="shealth-badge shealth-badge-service">${issue.service_icon} ${esc(d.service_short || d.service)}</span>
        <span>${esc(d.classification || '')}</span>
        <span>ID: ${esc(d.id)}</span>
        ${d.feature ? `<span>Feature: ${esc(d.feature)}</span>` : ''}
      </div>
      <div class="shealth-modal-meta">
        <span>🕐 Started: ${formatDate(d.start_time)}</span>
        ${d.end_time ? `<span>✅ Ended: ${formatDate(d.end_time)}</span>` : '<span style="color:var(--sh-red)">🔴 Ongoing</span>'}
        ${d.duration ? `<span>⏱ Duration: ${esc(d.duration)}</span>` : ''}
      </div>
      ${d.impact ? `<div class="shealth-modal-impact">${esc(stripHtml(d.impact))}</div>` : ''}
      ${updates.length > 0 ? `
        <div class="shealth-updates-title">📋 Communication Timeline (${updates.length} update${updates.length !== 1 ? 's' : ''})</div>
        ${updates.map(u => `
          <div class="shealth-update">
            <div class="shealth-update-time">${formatDate(u.timestamp)}</div>
            <div class="shealth-update-content">${esc(stripHtml(u.content))}</div>
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

  // ── Trend Chart ──
  function renderTrendChart(stats) {
    const el = document.getElementById('shealth-trend');
    if (!el || !stats?.monthly?.length) return;

    const months = stats.monthly.slice(0, 6).reverse(); // last 6 months, oldest first
    const maxCount = Math.max(...months.map(m => m.incident_count), 1);

    el.innerHTML = `
      <div class="shealth-trend-title">📈 Monthly Incident Trend</div>
      <div class="shealth-trend-bars">
        ${months.map(m => {
          const pct = Math.max((m.incident_count / maxCount) * 100, 3);
          const label = new Date(m.month + '-01').toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
          return `<div class="shealth-trend-bar-wrap">
            <span class="shealth-trend-bar-val">${m.incident_count}</span>
            <div class="shealth-trend-bar" style="height:${pct}%" title="${esc(m.month)}: ${m.incident_count} incidents across ${m.services_affected} services"></div>
            <span class="shealth-trend-bar-label">${label}</span>
          </div>`;
        }).join('')}
      </div>
    `;
  }

  // ── Most Affected Widget ──
  function renderMostAffected(stats) {
    const el = document.getElementById('shealth-most-affected');
    if (!el || !stats?.services?.length) return;

    const top5 = stats.services.slice(0, 5);
    const maxInc = top5[0]?.total_incidents || 1;

    el.innerHTML = `
      <div class="shealth-ma-title">🏆 Most Affected Services</div>
      ${top5.map((s, i) => `
        <div class="shealth-ma-item">
          <span class="shealth-ma-rank shealth-r${i + 1}">${i + 1}</span>
          <span class="shealth-ma-name">${s.icon} ${esc(s.short_name)}</span>
          <span class="shealth-ma-count">${s.total_incidents}</span>
          <div class="shealth-ma-bar-track"><div class="shealth-ma-bar-fill" style="width:${(s.total_incidents / maxInc) * 100}%"></div></div>
        </div>
      `).join('')}
    `;
  }

  // ── Scorecard ──
  function renderScorecard(stats) {
    const el = document.getElementById('shealth-scorecard');
    if (!el || !stats) return;

    const total = stats.total_incidents_tracked || 0;
    const services = stats.services || [];
    const totalDurations = services.reduce((a, s) => a + (s.avg_duration_minutes * s.total_incidents), 0);
    const avgRes = total > 0 ? Math.round(totalDurations / total) : 0;
    const avgResStr = avgRes < 60 ? avgRes + 'm' : Math.round(avgRes / 60) + 'h ' + (avgRes % 60) + 'm';
    const thisMonth = stats.monthly?.[0] || {};
    const lastMonth = stats.monthly?.[1] || {};
    const trend = thisMonth.incident_count > lastMonth.incident_count ? '📈 Up' : thisMonth.incident_count < lastMonth.incident_count ? '📉 Down' : '➡️ Same';

    el.innerHTML = `
      <div class="shealth-sc-title">📋 Quick Stats</div>
      <div class="shealth-sc-item"><span class="shealth-sc-label">Total incidents tracked</span><span class="shealth-sc-value">${total}</span></div>
      <div class="shealth-sc-item"><span class="shealth-sc-label">Services with issues</span><span class="shealth-sc-value">${services.length}</span></div>
      <div class="shealth-sc-item"><span class="shealth-sc-label">Avg resolution time</span><span class="shealth-sc-value">${avgResStr}</span></div>
      <div class="shealth-sc-item"><span class="shealth-sc-label">This month vs last</span><span class="shealth-sc-value">${trend} (${thisMonth.incident_count || 0} vs ${lastMonth.incident_count || 0})</span></div>
      <div class="shealth-sc-item"><span class="shealth-sc-label">History since</span><span class="shealth-sc-value">${stats.monthly?.length ? stats.monthly[stats.monthly.length - 1].month : 'N/A'}</span></div>
    `;
  }

  // ── Date Lookup ──
  function dateLookup() {
    const datePicker = document.getElementById('shealth-date-picker');
    const svcSelect = document.getElementById('shealth-date-service');
    const resultEl = document.getElementById('shealth-date-result');
    if (!datePicker?.value || !resultEl) return;

    const targetDate = datePicker.value; // YYYY-MM-DD
    const svcFilter = svcSelect?.value || 'all';

    const matches = allIssues.filter(i => {
      if (svcFilter !== 'all' && i.service !== svcFilter) return false;
      if (!i.start_time) return false;
      const start = i.start_time.substring(0, 10);
      const end = i.end_time ? i.end_time.substring(0, 10) : start;
      return targetDate >= start && targetDate <= end;
    });

    if (matches.length === 0) {
      resultEl.innerHTML = `<div class="shealth-date-result-msg shealth-date-result-ok">✅ No incidents found ${svcFilter !== 'all' ? 'for this service ' : ''}on ${targetDate}. All clear!</div>`;
    } else {
      resultEl.innerHTML = `
        <div class="shealth-date-result-msg shealth-date-result-bad">
          ⚠️ <strong>${matches.length} incident${matches.length !== 1 ? 's' : ''}</strong> ${svcFilter !== 'all' ? 'for this service ' : ''}on ${targetDate}:
          ${matches.map(m => `<div style="margin-top:0.4rem;padding-left:1rem">• ${m.service_icon} <strong>${esc(m.service_short)}</strong>: ${esc(m.title)} <span style="color:var(--sh-text-dim)">(${esc(m.duration || 'ongoing')})</span></div>`).join('')}
        </div>`;
    }
  }

  // ── CSV Export ──
  function exportCSV() {
    const data = (filtered.length ? filtered : allIssues);
    const rows = [['ID', 'Service', 'Title', 'Status', 'Classification', 'Start', 'End', 'Duration', 'Regions', 'Impact']];
    data.forEach(i => {
      rows.push([
        i.id, i.service, `"${(i.title || '').replace(/"/g, '""')}"`, i.status_label,
        i.classification, i.start_time || '', i.end_time || '', i.duration || '',
        (i.regions || []).join('; '), `"${(stripHtml(i.impact) || '').replace(/"/g, '""').substring(0, 200)}"`
      ]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `service-health-${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── URL State ──
  function readUrlState() {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('q') || '';
    const svc = params.get('service') || 'all';
    const status = params.get('status') || 'all';

    if (search) { const el = document.getElementById('shealth-search'); if (el) el.value = search; }
    if (svc !== 'all') { const el = document.getElementById('shealth-service-filter'); if (el) el.value = svc; }
    if (status !== 'all') { const el = document.getElementById('shealth-status-filter'); if (el) el.value = status; }
  }

  function writeUrlState() {
    const search = (document.getElementById('shealth-search')?.value || '').trim();
    const svc = document.getElementById('shealth-service-filter')?.value || 'all';
    const status = document.getElementById('shealth-status-filter')?.value || 'all';

    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (svc !== 'all') params.set('service', svc);
    if (status !== 'all') params.set('status', status);

    const qs = params.toString();
    const url = window.location.pathname + (qs ? '?' + qs : '');
    window.history.replaceState(null, '', url);
  }

  // ── Init ──
  async function init() {
    // Tab switching
    var shTabs = document.querySelectorAll('.shealth-tab');
    var shPanels = document.querySelectorAll('.shealth-panel');
    shTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        shTabs.forEach(function (t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        shPanels.forEach(function (p) { p.classList.remove('active'); p.hidden = true; });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        var panel = document.getElementById('panel-' + tab.dataset.tab);
        if (panel) { panel.classList.add('active'); panel.hidden = false; }
      });
    });

    try {
      const data = await loadData();

      allServices = data.services || [];
      allIssues = data.issues || [];
      filtered = [...allIssues];

      // Load stats (non-blocking)
      fetch(STATS_URL).then(r => r.ok ? r.json() : null).then(s => {
        if (s) {
          statsData = s;
          renderTrendChart(s);
          renderMostAffected(s);
          renderScorecard(s);
        }
      }).catch(() => {});

      renderSummary(data);
      renderServiceCards(allServices);
      populateServiceFilter(allServices);

      // Also populate date lookup service dropdown
      const dateSvc = document.getElementById('shealth-date-service');
      if (dateSvc) {
        allServices.filter(s => allIssues.some(i => i.service === s.service))
          .sort((a, b) => a.short_name.localeCompare(b.short_name))
          .forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.service;
            opt.textContent = `${s.icon} ${s.short_name}`;
            dateSvc.appendChild(opt);
          });
      }

      // Read URL state before rendering
      readUrlState();
      applyFilters();
      renderActiveIncidents();
      renderFreshness(data.generated_at);

      // Event listeners
      document.getElementById('shealth-search')?.addEventListener('input', debounce(applyFilters, 250));
      document.getElementById('shealth-service-filter')?.addEventListener('change', applyFilters);
      document.getElementById('shealth-status-filter')?.addEventListener('change', applyFilters);
      document.getElementById('shealth-clear-btn')?.addEventListener('click', clearFilters);
      document.getElementById('shealth-date-btn')?.addEventListener('click', dateLookup);
      document.getElementById('shealth-csv-btn')?.addEventListener('click', exportCSV);
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
