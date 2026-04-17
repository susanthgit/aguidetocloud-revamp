/* ============================================================================
   CERT COMPASS — Multi-Cloud Certification Navigator
   ============================================================================ */
(function () {
  'use strict';

  const PROVIDERS = window.__compassProviders || [];
  const CERTS = window.__compassCerts || [];
  const GROUPS = window.__compassGroups || [];
  const PATHS = window.__compassPaths || [];

  const providerMap = {};
  PROVIDERS.forEach(p => { providerMap[p.id] = p; });
  const certMap = {};
  CERTS.forEach(c => { certMap[c.id] = c; });

  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  // ── My Certs (localStorage) ───────────────────────────────────────────
  const MYCERTS_KEY = 'compass_mycerts_v1';
  let myCerts = new Set();
  try { const s = localStorage.getItem(MYCERTS_KEY); if (s) myCerts = new Set(JSON.parse(s)); } catch (e) {}

  function saveMyCerts() { try { localStorage.setItem(MYCERTS_KEY, JSON.stringify([...myCerts])); } catch (e) {} renderMyCertsBar(); }

  function toggleMyCert(id) {
    if (myCerts.has(id)) myCerts.delete(id); else myCerts.add(id);
    saveMyCerts();
    filterCerts(); // re-render to update button states
  }

  function renderMyCertsBar() {
    const bar = document.getElementById('mycerts-bar');
    const list = document.getElementById('mycerts-list');
    if (!myCerts.size) { bar.style.display = 'none'; return; }
    bar.style.display = 'flex';
    list.innerHTML = [...myCerts].map(id => {
      const c = certMap[id];
      if (!c) return '';
      return `<span class="compass-mycerts-chip" style="background:${providerColor(c.provider)}22;border-color:${providerColor(c.provider)}">${esc(c.exam_code)}</span>`;
    }).join('');
  }

  document.getElementById('mycerts-clear').addEventListener('click', () => { myCerts.clear(); saveMyCerts(); filterCerts(); });

  function diffDots(n) {
    let s = '';
    for (let i = 1; i <= 5; i++) s += `<span style="color:${i <= n ? '#FBBF24' : 'rgba(255,255,255,0.15)'}">●</span>`;
    return s;
  }

  function providerColor(pid) { return providerMap[pid] ? providerMap[pid].hex : '#6366F1'; }
  function providerName(pid) { return providerMap[pid] ? providerMap[pid].name : pid; }
  function providerEmoji(pid) { return providerMap[pid] ? providerMap[pid].emoji : ''; }

  // ── Tab Switching ─────────────────────────────────────────────────────
  const tabs = document.querySelectorAll('.compass-tab');
  const panels = document.querySelectorAll('.compass-panel');

  function switchTab(tabId) {
    tabs.forEach(t => { t.classList.toggle('active', t.dataset.tab === tabId); t.setAttribute('aria-selected', t.dataset.tab === tabId); });
    panels.forEach(p => { p.classList.toggle('active', p.id === 'panel-' + tabId); });
    const u = new URL(location); u.searchParams.set('tab', tabId); history.replaceState(null, '', u);
  }

  document.querySelector('.compass-tabs').addEventListener('click', e => {
    const t = e.target.closest('.compass-tab');
    if (t) switchTab(t.dataset.tab);
  });

  // ── Explore Tab ───────────────────────────────────────────────────────
  let activeProvider = 'all';
  const searchInput = document.getElementById('compass-search');
  const levelFilter = document.getElementById('level-filter');
  const domainFilter = document.getElementById('domain-filter');
  const certGrid = document.getElementById('cert-grid');
  const certCount = document.getElementById('cert-count');

  function filterCerts() {
    const q = (searchInput.value || '').toLowerCase();
    const level = levelFilter.value;
    const domain = domainFilter.value;

    const filtered = CERTS.filter(c => {
      if (activeProvider !== 'all' && c.provider !== activeProvider) return false;
      if (level !== 'all' && c.normalized_level !== level) return false;
      if (domain !== 'all' && (!c.focus_areas || !c.focus_areas.includes(domain))) return false;
      if (q) {
        const hay = (c.name + ' ' + c.exam_code + ' ' + c.provider + ' ' + (c.description || '') + ' ' + (c.focus_areas || []).join(' ')).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    certCount.textContent = filtered.length + ' of ' + CERTS.length + ' certifications';
    renderCertGrid(filtered);
  }

  function renderCertGrid(certs) {
    if (!certs.length) { certGrid.innerHTML = '<p style="color:rgba(255,255,255,0.4);text-align:center;padding:2rem">No certifications match your filters.</p>'; return; }
    certGrid.innerHTML = certs.map(c => {
      const pc = providerColor(c.provider);
      const validity = c.validity_override || (c.validity_years + ' year' + (c.validity_years !== 1 ? 's' : ''));
      const tracker = c.tracker_slug ? `<a href="/cert-tracker/${esc(c.tracker_slug)}/" class="compass-btn compass-btn-ms">Study Guide</a>` : '';
      const haveClass = myCerts.has(c.id) ? ' owned' : '';
      const haveLabel = myCerts.has(c.id) ? '✓ I Have This' : '+ I Have This';
      return `<div class="compass-card" data-id="${esc(c.id)}">
        <div class="compass-card-header">
          <div class="compass-card-provider" style="background:${pc}"></div>
          <div class="compass-card-info">
            <div class="compass-card-name">${providerEmoji(c.provider)} ${esc(c.name)}</div>
            <div class="compass-card-code">${esc(c.exam_code)}</div>
            <div class="compass-card-badges">
              <span class="compass-badge compass-badge-level">${esc(c.normalized_level)}</span>
              <span class="compass-badge compass-badge-fee">$${c.fee_usd}</span>
              <span class="compass-badge compass-badge-diff">${diffDots(c.difficulty)}</span>
            </div>
          </div>
          <span class="compass-card-expand">▼</span>
        </div>
        <div class="compass-card-body">
          <p class="compass-card-desc">${esc(c.description)}</p>
          <div class="compass-card-meta">
            <span><strong>Provider:</strong> ${esc(providerName(c.provider))}</span>
            <span><strong>Study:</strong> ${c.study_hours_min}–${c.study_hours_max}h</span>
            <span><strong>Validity:</strong> ${esc(validity)}</span>
            <span><strong>Focus:</strong> ${(c.focus_areas||[]).map(f => esc(f.replace(/-/g,' '))).join(', ')}</span>
          </div>
          <div class="compass-card-actions">
            <a href="${esc(c.official_url)}" target="_blank" rel="noopener noreferrer" class="compass-btn compass-btn-primary">Official Page</a>
            ${tracker}
            <button class="compass-btn compass-btn-have${haveClass}" onclick="event.stopPropagation();window.__compassToggleCert('${esc(c.id)}')">${haveLabel}</button>
            ${c.match_group ? `<button class="compass-btn compass-btn-outline" onclick="event.stopPropagation();window.__compassShowMatch('${esc(c.match_group)}')">Cross-Cloud Matches</button>` : ''}
          </div>
        </div>
      </div>`;
    }).join('');
  }

  // Expand/collapse cards via event delegation
  certGrid.addEventListener('click', e => {
    const header = e.target.closest('.compass-card-header');
    if (!header) return;
    if (e.target.closest('a') || e.target.closest('button')) return;
    header.closest('.compass-card').classList.toggle('open');
  });

  // Provider pills
  document.getElementById('provider-filter').addEventListener('click', e => {
    const pill = e.target.closest('.compass-pill');
    if (!pill) return;
    activeProvider = pill.dataset.provider;
    document.querySelectorAll('#provider-filter .compass-pill').forEach(p => p.classList.toggle('active', p.dataset.provider === activeProvider));
    filterCerts();
  });

  searchInput.addEventListener('input', filterCerts);
  levelFilter.addEventListener('change', filterCerts);
  domainFilter.addEventListener('change', filterCerts);

  // ── Closest Matches Tab ───────────────────────────────────────────────
  function renderMatches() {
    const grid = document.getElementById('matches-grid');
    grid.innerHTML = GROUPS.map(g => {
      const certs = (g.cert_ids || []).map(id => certMap[id]).filter(Boolean);
      const roleBadge = g.role_match === 'strong' ? '<span class="compass-badge compass-badge-role">Role: Strong</span>' : '<span class="compass-badge compass-badge-mixed">Role: ' + esc(g.role_match) + '</span>';
      const levelBadge = g.level_match === 'strong' ? '<span class="compass-badge compass-badge-role">Level: Strong</span>' : '<span class="compass-badge compass-badge-mixed">Level: ' + esc(g.level_match) + '</span>';

      const cols = certs.map(c => {
        const pc = providerColor(c.provider);
        const tracker = c.tracker_slug ? ` <a href="/cert-tracker/${esc(c.tracker_slug)}/" style="color:#60A5FA;font-size:0.7rem">[study guide]</a>` : '';
        return `<div class="compass-match-cert" style="border-left: 3px solid ${pc}">
          <div class="compass-match-cert-provider" style="color:${pc}">${esc(providerName(c.provider))}</div>
          <div class="compass-match-cert-name">${esc(c.name)}${tracker}</div>
          <div class="compass-match-cert-code">${esc(c.exam_code)}</div>
          <div class="compass-match-cert-stats">
            <span>$${c.fee_usd}</span>
            <span>${c.study_hours_min}–${c.study_hours_max}h</span>
            <span>${diffDots(c.difficulty)}</span>
          </div>
        </div>`;
      }).join('');

      const compareIds = certs.map(c => c.id).join(',');

      return `<div class="compass-match-card" id="match-${esc(g.id)}">
        <div class="compass-match-header">
          <span class="compass-match-icon">${g.icon || '📋'}</span>
          <span class="compass-match-title">${esc(g.name)}</span>
          <div class="compass-match-badges">${roleBadge} ${levelBadge}</div>
        </div>
        <p style="font-size:0.82rem;color:rgba(255,255,255,0.5);margin:0 0 0.75rem">${esc(g.description)}</p>
        <div class="compass-match-cols">${cols}</div>
        <div class="compass-match-notes">${esc(g.comparison_notes)}</div>
        <div class="compass-match-rec">💡 ${esc(g.recommendation)}</div>
        <div class="compass-match-cta" style="margin-top:0.75rem">
          <button class="compass-btn compass-btn-primary" onclick="window.__compassCompare('${esc(compareIds)}')">Deep Compare</button>
        </div>
      </div>`;
    }).join('');
  }

  window.__compassShowMatch = function (groupId) {
    switchTab('matches');
    setTimeout(() => {
      const el = document.getElementById('match-' + groupId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  window.__compassToggleCert = function (id) { toggleMyCert(id); };

  // ── Provider Stats ────────────────────────────────────────────────────
  function renderProviderStats() {
    PROVIDERS.forEach(p => {
      const count = CERTS.filter(c => c.provider === p.id).length;
      const el = document.querySelector(`.compass-pcard-stat[data-provider="${p.id}"]`);
      if (el) el.textContent = count + ' certifications';
    });
  }

  // ── Quick Start Scenarios ─────────────────────────────────────────────
  const SCENARIOS = {
    beginner: { level: 'foundational', provider: 'all', domain: 'all' },
    'azure-to-aws': { provider: 'aws', level: 'all', domain: 'all' },
    security: { domain: 'security', provider: 'all', level: 'all' },
    ai: { domain: 'ai-ml', provider: 'all', level: 'all' }
  };

  document.getElementById('quick-start').addEventListener('click', e => {
    const btn = e.target.closest('.compass-quick-btn');
    if (!btn) return;
    const s = SCENARIOS[btn.dataset.scenario];
    if (!s) return;
    if (s.provider) { activeProvider = s.provider; document.querySelectorAll('#provider-filter .compass-pill').forEach(p => p.classList.toggle('active', p.dataset.provider === s.provider)); }
    if (s.level) levelFilter.value = s.level;
    if (s.domain) domainFilter.value = s.domain;
    switchTab('explore');
    filterCerts();
  });

  // ── Career Paths Tab ──────────────────────────────────────────────────
  const careersGrid = document.getElementById('careers-grid');
  const careerDetail = document.getElementById('career-detail');

  function renderCareers() {
    careersGrid.innerHTML = PATHS.map(p => `
      <div class="compass-career-card" data-path="${esc(p.id)}">
        <div class="compass-career-icon">${p.icon || '📋'}</div>
        <div class="compass-career-name">${esc(p.name)}</div>
        <div class="compass-career-desc">${esc(p.description)}</div>
        <div class="compass-career-demand">${esc(p.demand)} Demand</div>
      </div>
    `).join('');
  }

  function showCareerDetail(pathId) {
    const path = PATHS.find(p => p.id === pathId);
    if (!path) return;

    careersGrid.querySelectorAll('.compass-career-card').forEach(c => c.classList.toggle('active', c.dataset.path === pathId));
    const tipCert = certMap[path.if_only_one];
    const tipName = tipCert ? (providerEmoji(tipCert.provider) + ' ' + tipCert.name + ' (' + tipCert.exam_code + ')') : path.if_only_one;

    let html = `<button class="compass-career-back" onclick="document.getElementById('career-detail').style.display='none'">← Back to all roles</button>`;
    html += `<h3 style="color:#fff;font-size:1.1rem;margin-bottom:1rem">${path.icon} ${esc(path.name)} — Certification Path</h3>`;

    (path.recommended_order || []).forEach(po => {
      const prov = providerMap[po.provider];
      if (!prov) return;
      const steps = (po.certs || []).map(cid => {
        const c = certMap[cid];
        if (!c) return '';
        const tracker = c.tracker_slug ? ` <a href="/cert-tracker/${esc(c.tracker_slug)}/" style="color:#60A5FA;font-size:0.72rem">[guide]</a>` : '';
        return `<div class="compass-career-step" style="border-left:3px solid ${prov.hex}">${esc(c.name)}<br><span style="font-size:0.7rem;color:rgba(255,255,255,0.4)">${esc(c.exam_code)} · $${c.fee_usd}</span>${tracker}</div>`;
      }).filter(Boolean);

      html += `<div class="compass-career-provider">
        <div class="compass-career-provider-name" style="color:${prov.hex}">${prov.emoji} ${esc(prov.name)}</div>
        <div class="compass-career-steps">${steps.join('<span class="compass-career-arrow">→</span>')}</div>
      </div>`;
    });

    html += `<div class="compass-career-tip"><strong>If you only have time for one:</strong> ${esc(tipName)}<br><span style="font-size:0.78rem;color:rgba(255,255,255,0.5)">${esc(path.if_only_one_reason)}</span></div>`;

    careerDetail.innerHTML = html;
    careerDetail.style.display = 'block';
    careerDetail.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  careersGrid.addEventListener('click', e => {
    const card = e.target.closest('.compass-career-card');
    if (card) showCareerDetail(card.dataset.path);
  });

  // ── Compare Tab ───────────────────────────────────────────────────────
  let selectedCompare = new Set();
  const MAX_COMPARE = 4;

  const PRESETS = {
    fundamentals: { label: 'Cloud Fundamentals', ids: ['ms-az-900', 'aws-cloud-practitioner', 'gcp-cloud-digital-leader'] },
    architect: { label: 'Architecture', ids: ['ms-az-305', 'aws-solutions-architect-assoc', 'gcp-prof-cloud-architect'] },
    security: { label: 'Security', ids: ['ms-az-500', 'aws-security-specialty', 'gcp-prof-cloud-security'] },
    data: { label: 'Data Engineering', ids: ['ms-dp-203', 'aws-data-engineer-assoc', 'gcp-prof-data-engineer'] },
    devops: { label: 'DevOps', ids: ['ms-az-400', 'aws-devops-pro', 'gcp-prof-cloud-devops'] }
  };

  function renderCompareSelect() {
    const wrap = document.getElementById('compare-select');
    wrap.innerHTML = CERTS.map(c => {
      const sel = selectedCompare.has(c.id) ? ' selected' : '';
      return `<span class="compass-chip${sel}" data-cid="${esc(c.id)}" style="--chip-accent:${providerColor(c.provider)}">${providerEmoji(c.provider)} ${esc(c.exam_code)}</span>`;
    }).join('');
  }

  function renderCompareTable() {
    const wrap = document.getElementById('compare-table-wrap');
    const ids = Array.from(selectedCompare);
    if (ids.length < 2) { wrap.innerHTML = '<p style="color:rgba(255,255,255,0.4);text-align:center;padding:2rem">Select at least 2 certifications above to compare.</p>'; return; }

    const certs = ids.map(id => certMap[id]).filter(Boolean);

    const rows = [
      { label: 'Provider', fn: c => `<span style="color:${providerColor(c.provider)}">${esc(providerName(c.provider))}</span>` },
      { label: 'Level', fn: c => esc(c.level) },
      { label: 'Exam Fee', fn: c => `$${c.fee_usd}` },
      { label: 'Study Hours', fn: c => `${c.study_hours_min}–${c.study_hours_max}` },
      { label: 'Difficulty', fn: c => diffDots(c.difficulty) },
      { label: 'Validity', fn: c => c.validity_override || (c.validity_years + ' year' + (c.validity_years !== 1 ? 's' : '')) },
      { label: 'Prerequisites', fn: c => (c.prerequisites && c.prerequisites.length) ? c.prerequisites.map(pid => { const p = certMap[pid]; return p ? esc(p.exam_code) : esc(pid); }).join(', ') : 'None' },
      { label: 'Focus Areas', fn: c => (c.focus_areas || []).map(f => esc(f.replace(/-/g, ' '))).join(', ') },
      { label: 'Official Page', fn: c => `<a href="${esc(c.official_url)}" target="_blank" rel="noopener noreferrer" style="color:var(--compass-accent)">View →</a>` },
      { label: 'Study Guide', fn: c => c.tracker_slug ? `<a href="/cert-tracker/${esc(c.tracker_slug)}/" style="color:#60A5FA">Available →</a>` : '<span style="color:rgba(255,255,255,0.3)">—</span>' }
    ];

    let html = '<table class="compass-compare-table"><thead><tr><th></th>';
    certs.forEach(c => { html += `<th class="compass-compare-header-cell"><span style="color:${providerColor(c.provider)}">${providerEmoji(c.provider)} ${esc(c.name)}</span><span class="compass-card-code">${esc(c.exam_code)}</span></th>`; });
    html += '</tr></thead><tbody>';
    rows.forEach(r => {
      html += `<tr><td>${esc(r.label)}</td>`;
      certs.forEach(c => { html += `<td>${r.fn(c)}</td>`; });
      html += '</tr>';
    });
    html += '</tbody></table>';
    wrap.innerHTML = html;
    syncCompareUrl();
  }

  function syncCompareUrl() {
    const u = new URL(location);
    if (selectedCompare.size) u.searchParams.set('compare', Array.from(selectedCompare).join(','));
    else u.searchParams.delete('compare');
    history.replaceState(null, '', u);
  }

  window.__compassCompare = function (idsStr) {
    selectedCompare = new Set(idsStr.split(',').filter(id => certMap[id]));
    switchTab('compare');
    renderCompareSelect();
    renderCompareTable();
    // Update preset active state
    document.querySelectorAll('.compass-preset').forEach(b => b.classList.remove('active'));
  };

  document.getElementById('compare-select').addEventListener('click', e => {
    const chip = e.target.closest('.compass-chip');
    if (!chip) return;
    const cid = chip.dataset.cid;
    if (selectedCompare.has(cid)) { selectedCompare.delete(cid); }
    else if (selectedCompare.size < MAX_COMPARE) { selectedCompare.add(cid); }
    renderCompareSelect();
    renderCompareTable();
    document.querySelectorAll('.compass-preset').forEach(b => b.classList.remove('active'));
  });

  document.getElementById('compare-presets').addEventListener('click', e => {
    const btn = e.target.closest('.compass-preset');
    if (!btn) return;
    const preset = PRESETS[btn.dataset.preset];
    if (!preset) return;
    selectedCompare = new Set(preset.ids.filter(id => certMap[id]));
    renderCompareSelect();
    renderCompareTable();
    document.querySelectorAll('.compass-preset').forEach(b => b.classList.toggle('active', b === btn));
  });

  // ── URL State Restore ─────────────────────────────────────────────────
  function restoreState() {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && document.querySelector(`.compass-tab[data-tab="${tab}"]`)) switchTab(tab);

    const compare = params.get('compare');
    if (compare) {
      selectedCompare = new Set(compare.split(',').filter(id => certMap[id]));
      if (selectedCompare.size >= 2 && !tab) switchTab('compare');
    }
  }

  // ── Init ──────────────────────────────────────────────────────────────
  function init() {
    renderProviderStats();
    renderMyCertsBar();
    filterCerts();
    renderMatches();
    renderCareers();
    renderCompareSelect();
    renderCompareTable();
    restoreState();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
