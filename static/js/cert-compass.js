/* ============================================================================
   CERT COMPASS — Multi-Cloud Certification Navigator
   ============================================================================ */
(function () {
  'use strict';

  const PROVIDERS = window.__compassProviders || [];
  const CERTS = window.__compassCerts || [];
  const GROUPS = window.__compassGroups || [];
  const PATHS = window.__compassPaths || [];
  const SIGNALS = window.__compassSignals || [];
  const QUIZ_Q = window.__compassQuiz || [];
  const TOPIC_DEFS = window.__compassTopicDefs || [];
  const CERT_TOPICS = window.__compassCertTopics || [];

  // Build topic lookup maps
  const topicNameMap = {};
  TOPIC_DEFS.forEach(t => { topicNameMap[t.id] = t.name; });
  const certTopicMap = {};
  CERT_TOPICS.forEach(ct => { certTopicMap[ct.cert_id] = ct.topics || []; });

  const providerMap = {};
  PROVIDERS.forEach(p => { providerMap[p.id] = p; });
  const certMap = {};
  CERTS.forEach(c => { certMap[c.id] = c; });

  // Merge market signals into certs
  const signalMap = {};
  SIGNALS.forEach(s => { signalMap[s.cert_id] = s; });
  CERTS.forEach(c => {
    const s = signalMap[c.id];
    if (s) { c.demand_score = s.demand_score; c.trending = s.trending; c.salary_premium = s.salary_premium; }
  });

  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  // ── My Certs (localStorage) ───────────────────────────────────────────
  const MYCERTS_KEY = 'compass_mycerts_v1';
  let myCerts = new Set();
  try { const s = localStorage.getItem(MYCERTS_KEY); if (s) myCerts = new Set(JSON.parse(s)); } catch (e) {}

  function saveMyCerts() { try { localStorage.setItem(MYCERTS_KEY, JSON.stringify([...myCerts])); } catch (e) {} renderMyCertsBar(); renderDashboard(); }

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
    for (let i = 1; i <= 5; i++) s += `<span style="color:${i <= n ? 'var(--accent)' : 'var(--border)'}">●</span>`;
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
    if (!certs.length) { certGrid.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem">No certifications match your filters.</p>'; return; }
    certGrid.innerHTML = certs.map(c => {
      const pc = providerColor(c.provider);
      const validity = c.validity_override || (c.validity_years + ' year' + (c.validity_years !== 1 ? 's' : ''));
      const tracker = c.tracker_slug ? `<a href="/cert-tracker/${esc(c.tracker_slug)}/" class="compass-btn compass-btn-ms">Study Guide</a>` : '';
            const guided = c.guided_slug ? `<a href="/guided/${esc(c.guided_slug)}/practice/" class="compass-btn compass-btn-guided">Practice Exam</a>` : '';
      const haveClass = myCerts.has(c.id) ? ' owned' : '';
      const haveLabel = myCerts.has(c.id) ? '✓ I Have This' : '+ I Have This';
      const trendIcon = c.trending === 'up' ? '↑' : c.trending === 'down' ? '↓' : '';
      const demandBadge = c.demand_score ? `<span class="compass-badge compass-badge-demand">${c.demand_score} ${trendIcon}</span>` : '';
      const salaryBadge = c.salary_premium ? `<span class="compass-badge compass-badge-salary">+$${(c.salary_premium/1000).toFixed(0)}K</span>` : '';
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
              ${demandBadge}${salaryBadge}
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
            ${guided}
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
  // ── Skills Translator ───────────────────────────────────────────────────
  function calcOverlap(certA, certB) {
    const tA = new Set(certTopicMap[certA] || []);
    const tB = new Set(certTopicMap[certB] || []);
    if (!tA.size || !tB.size) return { pct: 0, shared: [], onlyA: [], onlyB: [] };
    const shared = [...tA].filter(t => tB.has(t));
    const onlyA = [...tA].filter(t => !tB.has(t));
    const onlyB = [...tB].filter(t => !tA.has(t));
    const union = new Set([...tA, ...tB]);
    return { pct: Math.round((shared.length / union.size) * 100), shared, onlyA, onlyB };
  }

  function renderSkillsTranslator(certs) {
    if (certs.length < 2) return '';
    // Build pairwise overlaps
    const pairs = [];
    for (let i = 0; i < certs.length; i++) {
      for (let j = i + 1; j < certs.length; j++) {
        const ov = calcOverlap(certs[i].id, certs[j].id);
        pairs.push({ a: certs[i], b: certs[j], ...ov });
      }
    }
    if (!pairs.length || pairs.every(p => p.pct === 0)) return '';

    const pairHtml = pairs.map(p => {
      const avgStudy = Math.round(((p.a.study_hours_min + p.a.study_hours_max) / 2 + (p.b.study_hours_min + p.b.study_hours_max) / 2) / 2);
      const savedHours = Math.round(avgStudy * p.pct / 100);
      const barColor = p.pct >= 70 ? 'var(--success)' : p.pct >= 40 ? 'var(--warning)' : 'var(--error)';
      return `<div class="compass-skill-pair">
        <div class="compass-skill-pair-header">
          <span style="color:var(--text-secondary)">${esc(p.a.exam_code)}</span>
          <span class="compass-skill-arrow">↔</span>
          <span style="color:var(--text-secondary)">${esc(p.b.exam_code)}</span>
          <span class="compass-skill-pct" style="color:${barColor}">${p.pct}% overlap</span>
        </div>
        <div class="compass-skill-bar"><div class="compass-skill-bar-fill" style="width:${p.pct}%;background:${barColor}"></div></div>
        <div class="compass-skill-detail">
          <div class="compass-skill-col">
            <strong style="color:var(--success)">Shared skills (${p.shared.length})</strong>
            ${p.shared.map(t => `<span class="compass-skill-tag compass-skill-shared">${esc(topicNameMap[t] || t)}</span>`).join('')}
          </div>
          ${p.onlyB.length ? `<div class="compass-skill-col">
            <strong style="color:var(--badge-amber)">New to learn for ${esc(p.b.exam_code)} (${p.onlyB.length})</strong>
            ${p.onlyB.map(t => `<span class="compass-skill-tag compass-skill-new">${esc(topicNameMap[t] || t)}</span>`).join('')}
          </div>` : ''}
          ${p.onlyA.length ? `<div class="compass-skill-col">
            <strong style="color:var(--badge-amber)">New to learn for ${esc(p.a.exam_code)} (${p.onlyA.length})</strong>
            ${p.onlyA.map(t => `<span class="compass-skill-tag compass-skill-new">${esc(topicNameMap[t] || t)}</span>`).join('')}
          </div>` : ''}
        </div>
        ${savedHours > 0 ? `<div class="compass-skill-savings">~${savedHours}h study time transferable from existing knowledge</div>` : ''}
      </div>`;
    }).join('');

    return `<details class="compass-skill-translator">
      <summary><strong>🔄 Translate My Skills</strong> — see topic overlap between these certs</summary>
      ${pairHtml}
    </details>`;
  }

  function renderMatches() {
    const grid = document.getElementById('matches-grid');
    grid.innerHTML = GROUPS.map(g => {
      const certs = (g.cert_ids || []).map(id => certMap[id]).filter(Boolean);
      const roleBadge = g.role_match === 'strong' ? '<span class="compass-badge compass-badge-role">Role: Strong</span>' : '<span class="compass-badge compass-badge-mixed">Role: ' + esc(g.role_match) + '</span>';
      const levelBadge = g.level_match === 'strong' ? '<span class="compass-badge compass-badge-role">Level: Strong</span>' : '<span class="compass-badge compass-badge-mixed">Level: ' + esc(g.level_match) + '</span>';

      const cols = certs.map(c => {
        const pc = providerColor(c.provider);
        const tracker = c.tracker_slug ? ` <a href="/cert-tracker/${esc(c.tracker_slug)}/" style="color:var(--accent);font-size:0.7rem">[study guide]</a>` : '';
        const guided = c.guided_slug ? ` <a href="/guided/${esc(c.guided_slug)}/practice/" style="color:var(--accent);font-size:0.7rem">[practice exam]</a>` : '';
        return `<div class="compass-match-cert" style="border-left: 3px solid ${pc}">
          <div class="compass-match-cert-provider" style="color:var(--text-primary)">${esc(providerName(c.provider))}</div>
          <div class="compass-match-cert-name">${esc(c.name)}${tracker}${guided}</div>
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
        <p style="font-size:0.82rem;color:var(--text-tertiary);margin:0 0 0.75rem">${esc(g.description)}</p>
        <div class="compass-match-cols">${cols}</div>
        <div class="compass-match-notes">${esc(g.comparison_notes)}</div>
        <div class="compass-match-rec">💡 ${esc(g.recommendation)}</div>
        ${renderSkillsTranslator(certs)}
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

  window.__compassSwitchTab = switchTab;

  // ── Dashboard ─────────────────────────────────────────────────────────
  function renderDashboard() {
    const empty = document.getElementById('dashboard-empty');
    const content = document.getElementById('dashboard-content');
    if (!myCerts.size) { empty.style.display = ''; content.style.display = 'none'; return; }
    empty.style.display = 'none'; content.style.display = '';

    const owned = [...myCerts].map(id => certMap[id]).filter(Boolean);
    const totalCost = owned.reduce((s, c) => s + (c.fee_usd || 0), 0);
    const totalHours = owned.reduce((s, c) => s + ((c.study_hours_min + c.study_hours_max) / 2), 0);

    // Stats bar
    document.getElementById('dash-stats').innerHTML = `
      <div class="compass-dash-stat"><span class="compass-dash-stat-num">${owned.length}</span><span class="compass-dash-stat-label">Certs Held</span></div>
      <div class="compass-dash-stat"><span class="compass-dash-stat-num">${new Set(owned.map(c=>c.provider)).size}</span><span class="compass-dash-stat-label">Providers</span></div>
      <div class="compass-dash-stat"><span class="compass-dash-stat-num">$${totalCost}</span><span class="compass-dash-stat-label">Invested</span></div>
      <div class="compass-dash-stat"><span class="compass-dash-stat-num">~${Math.round(totalHours)}h</span><span class="compass-dash-stat-label">Studied</span></div>
    `;

    // Progress rings per provider
    document.getElementById('dash-rings').innerHTML = PROVIDERS.map(p => {
      const total = CERTS.filter(c => c.provider === p.id).length;
      const have = owned.filter(c => c.provider === p.id).length;
      const pct = Math.round((have / total) * 100);
      const r = 40, circ = 2 * Math.PI * r, offset = circ - (circ * pct / 100);
      return `<div class="compass-dash-ring-card">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="${r}" fill="none" stroke="var(--border)" stroke-width="8"/>
          <circle cx="50" cy="50" r="${r}" fill="none" stroke="${p.hex}" stroke-width="8" stroke-dasharray="${circ}" stroke-dashoffset="${offset}" transform="rotate(-90 50 50)" stroke-linecap="round"/>
          <text x="50" y="48" text-anchor="middle" fill="var(--text-primary)" font-size="18" font-weight="700">${pct}%</text>
          <text x="50" y="64" text-anchor="middle" fill="var(--text-tertiary)" font-size="10">${have}/${total}</text>
        </svg>
        <span style="color:var(--text-primary);font-weight:600;font-size:0.82rem">${p.emoji} ${p.name}</span>
      </div>`;
    }).join('');

    // Gaps — find equivalent certs the user is missing
    const ownedIds = new Set(myCerts);
    const gaps = [];
    GROUPS.forEach(g => {
      const groupCerts = (g.cert_ids || []).map(id => certMap[id]).filter(Boolean);
      const have = groupCerts.filter(c => ownedIds.has(c.id));
      const missing = groupCerts.filter(c => !ownedIds.has(c.id));
      if (have.length > 0 && missing.length > 0) {
        gaps.push({ group: g, have, missing });
      }
    });
    document.getElementById('dash-gaps').innerHTML = gaps.length ? gaps.map(g => `
      <div class="compass-dash-gap">
        <strong>${g.group.icon} ${esc(g.group.name)}</strong>
        <span style="color:var(--text-tertiary);font-size:0.78rem">You have: ${g.have.map(c => `<span style="color:var(--text-secondary)">${esc(c.exam_code)}</span>`).join(', ')}</span>
        <span style="color:var(--text-tertiary);font-size:0.78rem">Missing: ${g.missing.map(c => `<span style="color:var(--text-secondary)">${esc(c.exam_code)} ($${c.fee_usd})</span>`).join(', ')}</span>
      </div>
    `).join('') : '<p style="color:var(--text-muted)">No cross-cloud gaps detected. Nice coverage!</p>';

    // Recommended next
    const notOwned = CERTS.filter(c => !ownedIds.has(c.id));
    const scored = notOwned.map(c => {
      let score = c.demand_score || 50;
      if (c.trending === 'up') score += 10;
      // Boost certs in same groups as owned
      const inGroup = GROUPS.find(g => g.cert_ids && g.cert_ids.includes(c.id) && g.cert_ids.some(id => ownedIds.has(id)));
      if (inGroup) score += 15;
      // Boost associate over foundational if user has foundational
      const hasFoundational = owned.some(o => o.normalized_level === 'foundational' && o.provider === c.provider);
      if (hasFoundational && c.normalized_level === 'associate') score += 10;
      return { cert: c, score };
    }).sort((a, b) => b.score - a.score).slice(0, 3);

    document.getElementById('dash-recommended').innerHTML = scored.map(s => {
      const c = s.cert;
      return `<div class="compass-dash-rec-card" style="border-left:3px solid ${providerColor(c.provider)}">
        <strong>${providerEmoji(c.provider)} ${esc(c.name)}</strong> <span class="compass-card-code">${esc(c.exam_code)}</span>
        <div style="font-size:0.78rem;color:var(--text-tertiary);margin-top:0.3rem">$${c.fee_usd} · ${c.study_hours_min}–${c.study_hours_max}h · Demand: ${c.demand_score || '?'}/100${c.trending === 'up' ? ' ↑' : ''}</div>
        ${c.tracker_slug ? `<a href="/cert-tracker/${esc(c.tracker_slug)}/" style="color:var(--accent);font-size:0.75rem">Study guide available →</a>` : ''}
      </div>`;
    }).join('');

    // Investment
    const salaryBoost = owned.reduce((s, c) => s + (c.salary_premium || 0), 0);
    document.getElementById('dash-investment').innerHTML = `
      <div class="compass-dash-invest-grid">
        <div class="compass-dash-invest-card"><span class="compass-dash-stat-num">$${totalCost}</span><span>Exam Fees Spent</span></div>
        <div class="compass-dash-invest-card"><span class="compass-dash-stat-num">~${Math.round(totalHours)}h</span><span>Study Hours</span></div>
        <div class="compass-dash-invest-card" style="border-color:var(--success)"><span class="compass-dash-stat-num" style="color:var(--success)">+$${(salaryBoost/1000).toFixed(0)}K</span><span>Est. Salary Premium</span></div>
        <div class="compass-dash-invest-card" style="border-color:var(--success)"><span class="compass-dash-stat-num" style="color:var(--success)">${salaryBoost > 0 ? ((salaryBoost / totalCost) * 100).toFixed(0) + '×' : '—'}</span><span>ROI (premium ÷ cost)</span></div>
      </div>
    `;
  }

  // ── Plan My Journey Calculator ────────────────────────────────────────
  function showCareerDetail(pathId) {
    const path = PATHS.find(p => p.id === pathId);
    if (!path) return;

    careersGrid.querySelectorAll('.compass-career-card').forEach(c => c.classList.toggle('active', c.dataset.path === pathId));
    const tipCert = certMap[path.if_only_one];
    const tipName = tipCert ? (providerEmoji(tipCert.provider) + ' ' + tipCert.name + ' (' + tipCert.exam_code + ')') : path.if_only_one;

    let html = `<button class="compass-career-back" onclick="document.getElementById('career-detail').style.display='none'">← Back to all roles</button>`;
    html += `<h3 style="color:var(--text-primary);font-size:1.1rem;margin-bottom:1rem">${path.icon} ${esc(path.name)} — Certification Path</h3>`;

    // Cost/time comparison table
    const providerCosts = (path.recommended_order || []).map(po => {
      const prov = providerMap[po.provider];
      if (!prov) return null;
      const certs = (po.certs || []).map(cid => certMap[cid]).filter(Boolean);
      const totalFee = certs.reduce((s, c) => s + c.fee_usd, 0);
      const totalHoursMin = certs.reduce((s, c) => s + c.study_hours_min, 0);
      const totalHoursMax = certs.reduce((s, c) => s + c.study_hours_max, 0);
      const renewalYearly = certs.reduce((s, c) => {
        if (c.provider === 'microsoft') return s; // free renewal
        return s + (c.fee_usd / (c.validity_years || 3));
      }, 0);
      const threeYearCost = totalFee + Math.round(renewalYearly * 2); // initial + 2 renewal cycles
      return { prov, certs, totalFee, totalHoursMin, totalHoursMax, renewalYearly: Math.round(renewalYearly), threeYearCost };
    }).filter(Boolean);

    html += `<div class="compass-cost-compare"><table class="compass-compare-table">
      <thead><tr><th></th>${providerCosts.map(pc => `<th style="color:var(--text-primary)">${pc.prov.emoji} ${esc(pc.prov.name)}</th>`).join('')}</tr></thead>
      <tbody>
        <tr><td>Exams</td>${providerCosts.map(pc => `<td>${pc.certs.length}</td>`).join('')}</tr>
        <tr><td>Exam Fees</td>${providerCosts.map(pc => `<td>$${pc.totalFee}</td>`).join('')}</tr>
        <tr><td>Study Hours</td>${providerCosts.map(pc => `<td>${pc.totalHoursMin}–${pc.totalHoursMax}h</td>`).join('')}</tr>
        <tr><td>Yearly Renewal</td>${providerCosts.map(pc => `<td>${pc.renewalYearly === 0 ? 'Free' : '$' + pc.renewalYearly + '/yr'}</td>`).join('')}</tr>
        <tr style="font-weight:700"><td>3-Year Total</td>${providerCosts.map(pc => `<td style="color:var(--success)">$${pc.threeYearCost}</td>`).join('')}</tr>
      </tbody>
    </table></div>`;

    (path.recommended_order || []).forEach(po => {
      const prov = providerMap[po.provider];
      if (!prov) return;
      const steps = (po.certs || []).map(cid => {
        const c = certMap[cid];
        if (!c) return '';
        const tracker = c.tracker_slug ? ` <a href="/cert-tracker/${esc(c.tracker_slug)}/" style="color:var(--accent);font-size:0.72rem">[guide]</a>` : '';
        return `<div class="compass-career-step" style="border-left:3px solid ${prov.hex}">${esc(c.name)}<br><span style="font-size:0.7rem;color:var(--text-muted)">${esc(c.exam_code)} · $${c.fee_usd}</span>${tracker}</div>`;
      }).filter(Boolean);

      html += `<div class="compass-career-provider">
        <div class="compass-career-provider-name" style="color:var(--text-primary)">${prov.emoji} ${esc(prov.name)}</div>
        <div class="compass-career-steps">${steps.join('<span class="compass-career-arrow">→</span>')}</div>
      </div>`;
    });

    html += `<div class="compass-career-tip"><strong>If you only have time for one:</strong> ${esc(tipName)}<br><span style="font-size:0.78rem;color:var(--text-tertiary)">${esc(path.if_only_one_reason)}</span></div>`;

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
    if (ids.length < 2) { wrap.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem">Select at least 2 certifications above to compare.</p>'; return; }

    const certs = ids.map(id => certMap[id]).filter(Boolean);

    const rows = [
      { label: 'Provider', fn: c => `<span style="color:var(--text-primary)">${esc(providerName(c.provider))}</span>` },
      { label: 'Level', fn: c => esc(c.level) },
      { label: 'Exam Fee', fn: c => `$${c.fee_usd}` },
      { label: 'Study Hours', fn: c => `${c.study_hours_min}–${c.study_hours_max}` },
      { label: 'Difficulty', fn: c => diffDots(c.difficulty) },
      { label: 'Validity', fn: c => c.validity_override || (c.validity_years + ' year' + (c.validity_years !== 1 ? 's' : '')) },
      { label: 'Prerequisites', fn: c => (c.prerequisites && c.prerequisites.length) ? c.prerequisites.map(pid => { const p = certMap[pid]; return p ? esc(p.exam_code) : esc(pid); }).join(', ') : 'None' },
      { label: 'Focus Areas', fn: c => (c.focus_areas || []).map(f => esc(f.replace(/-/g, ' '))).join(', ') },
      { label: 'Official Page', fn: c => `<a href="${esc(c.official_url)}" target="_blank" rel="noopener noreferrer" style="color:var(--compass-accent)">View →</a>` },
      { label: 'Study Guide', fn: c => c.tracker_slug ? `<a href="/cert-tracker/${esc(c.tracker_slug)}/" style="color:var(--accent)">Available →</a>` : '<span style="color:var(--text-muted)">—</span>' },
      { label: 'Practice Exam', fn: c => c.guided_slug ? `<a href="/guided/${esc(c.guided_slug)}/practice/" style="color:var(--accent)">200 Questions →</a>` : '<span style="color:var(--text-muted)">—</span>' }
    ];

    let html = '<table class="compass-compare-table"><thead><tr><th></th>';
    certs.forEach(c => { html += `<th class="compass-compare-header-cell"><span style="color:var(--text-primary)">${providerEmoji(c.provider)} ${esc(c.name)}</span><span class="compass-card-code">${esc(c.exam_code)}</span></th>`; });
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

  // ── Quiz: Which Cert Next? ─────────────────────────────────────────────
  let quizAnswers = {};

  function renderQuiz() {
    const container = document.getElementById('quiz-container');
    const results = document.getElementById('quiz-results');
    results.style.display = 'none';

    container.innerHTML = QUIZ_Q.map((q, i) => `
      <div class="compass-quiz-q" data-qid="${esc(q.id)}">
        <div class="compass-quiz-num">${i + 1} / ${QUIZ_Q.length}</div>
        <div class="compass-quiz-text">${esc(q.text)}</div>
        <div class="compass-quiz-options">
          ${(q.options || []).map(o => `<button class="compass-quiz-opt" data-qid="${esc(q.id)}" data-val="${esc(o.value)}">${esc(o.label)}</button>`).join('')}
        </div>
      </div>
    `).join('') + `<button class="compass-btn compass-btn-primary compass-quiz-submit" id="quiz-submit" style="margin-top:1rem" disabled>Get Recommendations</button>`;
  }

  document.getElementById('quiz-container').addEventListener('click', e => {
    const opt = e.target.closest('.compass-quiz-opt');
    if (!opt) return;
    const qid = opt.dataset.qid;
    quizAnswers[qid] = opt.dataset.val;
    // Highlight selected
    opt.closest('.compass-quiz-options').querySelectorAll('.compass-quiz-opt').forEach(b => b.classList.toggle('selected', b === opt));
    // Enable submit if all answered
    const btn = document.getElementById('quiz-submit');
    if (btn) btn.disabled = Object.keys(quizAnswers).length < QUIZ_Q.length;
  });

  document.getElementById('quiz-container').addEventListener('click', e => {
    if (e.target.id !== 'quiz-submit') return;
    scoreQuiz();
  });

  function scoreQuiz() {
    const role = quizAnswers['current-role'] || 'admin';
    const exp = quizAnswers['experience'] || 'beginner';
    const cloud = quizAnswers['cloud-preference'] || 'multi';
    const goal = quizAnswers['goal'] || 'skills';
    const time = quizAnswers['time'] || 'moderate';
    const budget = quizAnswers['budget'] || 'medium';
    const existing = quizAnswers['existing-certs'] || 'none';

    // Treat "none" (not sure) same as "multi" for scoring
    const effectiveCloud = (cloud === 'none') ? 'multi' : cloud;

    const maxHours = time === 'minimal' ? 40 : time === 'moderate' ? 100 : 300;
    const maxUsd = budget === 'low' ? 150 : budget === 'medium' ? 300 : budget === 'high' ? 1000 : 9999;

    // Score each cert
    const scored = CERTS.filter(c => !myCerts.has(c.id)).map(c => {
      let score = c.demand_score || 50;

      // Provider preference
      if (effectiveCloud === c.provider) score += 25;
      else if (effectiveCloud === 'multi') score += 5;

      // Role match
      const roleMap = { admin: ['admin','architecture'], developer: ['developer'], architect: ['architecture'], security: ['security'], data: ['data-engineering'], devops: ['devops'], manager: ['cloud-fundamentals','architecture'], 'career-switch': ['cloud-fundamentals'] };
      if ((roleMap[role] || []).some(f => (c.focus_areas || []).includes(f))) score += 20;

      // Experience → level match
      const levelMap = { none: 'foundational', beginner: 'foundational', intermediate: 'associate', advanced: 'professional' };
      if (c.normalized_level === levelMap[exp]) score += 15;
      if (existing === 'none' && c.normalized_level === 'foundational') score += 10;
      if (existing === 'fundamentals' && c.normalized_level === 'associate') score += 10;
      if (existing === 'associate' && (c.normalized_level === 'professional' || c.normalized_level === 'expert')) score += 10;

      // Budget/time fit
      if (c.fee_usd <= maxUsd) score += 5;
      if (c.study_hours_max <= maxHours) score += 10;

      // Trending bonus
      if (c.trending === 'up') score += 5;

      // Goal-based scoring
      if (goal === 'multi-cloud' && effectiveCloud !== c.provider && effectiveCloud !== 'multi') score += 15;
      if (goal === 'job') score += Math.round((c.demand_score || 50) * 0.15); // boost high-demand certs
      if (goal === 'specialise' && (c.normalized_level === 'professional' || c.normalized_level === 'expert' || c.normalized_level === 'specialty')) score += 12;
      if (goal === 'leadership' && c.normalized_level === 'foundational') score += 8; // leaders need breadth

      // Study guide bonus (Microsoft advantage)
      if (c.tracker_slug) score += 3;
      // Practice exam bonus (guided platform)
      if (c.guided_slug) score += 2;

      return { cert: c, score };
    }).sort((a, b) => b.score - a.score).slice(0, 3);

    // Render results
    const results = document.getElementById('quiz-results');
    results.style.display = '';
    results.innerHTML = `<h3 style="color:var(--compass-accent);margin-bottom:1rem">Your Top 3 Recommendations</h3>` +
      scored.map((s, i) => {
        const c = s.cert;
        const medal = ['🥇', '🥈', '🥉'][i];
        return `<div class="compass-dash-rec-card" style="border-left:3px solid ${providerColor(c.provider)}">
          <div style="display:flex;align-items:center;gap:0.5rem">
            <span style="font-size:1.5rem">${medal}</span>
            <div>
              <strong>${providerEmoji(c.provider)} ${esc(c.name)}</strong> <span class="compass-card-code">${esc(c.exam_code)}</span>
              <div style="font-size:0.78rem;color:var(--text-tertiary);margin-top:0.2rem">$${c.fee_usd} · ${c.study_hours_min}–${c.study_hours_max}h · Demand: ${c.demand_score || '?'}/100</div>
            </div>
          </div>
          <p style="font-size:0.82rem;color:var(--text-secondary);margin:0.5rem 0 0">${esc(c.description)}</p>
          <div style="margin-top:0.5rem;display:flex;gap:0.4rem">
            <a href="${esc(c.official_url)}" target="_blank" rel="noopener noreferrer" class="compass-btn compass-btn-primary" style="font-size:0.75rem">Official Page</a>
            ${c.tracker_slug ? `<a href="/cert-tracker/${esc(c.tracker_slug)}/" class="compass-btn compass-btn-ms" style="font-size:0.75rem">Study Guide</a>` : ''}
            ${c.guided_slug ? `<a href="/guided/${esc(c.guided_slug)}/practice/" class="compass-btn compass-btn-guided" style="font-size:0.75rem">Practice Exam</a>` : ''}
            <button class="compass-btn compass-btn-outline" style="font-size:0.75rem" onclick="window.__compassCompare('${scored.map(x=>x.cert.id).join(',')}')">Compare All 3</button>
          </div>
        </div>`;
      }).join('') +
      `<button class="compass-btn compass-btn-outline" style="margin-top:1rem" onclick="window.__compassRetakeQuiz()">Retake Quiz</button>`;

    results.scrollIntoView({ behavior: 'smooth' });
  }

  // ── Keyboard Shortcuts ────────────────────────────────────────────────
  window.__compassRetakeQuiz = function () { quizAnswers = {}; renderQuiz(); document.getElementById('quiz-results').style.display = 'none'; };
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === '/') { e.preventDefault(); const s = document.getElementById('compass-search'); if (s) { switchTab('explore'); s.focus(); } }
    const tabKeys = { '1': 'explore', '2': 'matches', '3': 'careers', '4': 'compare', '5': 'dashboard', '6': 'quiz', '7': 'faq' };
    if (tabKeys[e.key]) switchTab(tabKeys[e.key]);
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

    // Default compare: Cloud Fundamentals preset if nothing selected
    if (!selectedCompare.size) {
      selectedCompare = new Set(['ms-az-900', 'aws-cloud-practitioner', 'gcp-cloud-digital-leader'].filter(id => certMap[id]));
      renderCompareSelect();
      renderCompareTable();
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
    renderDashboard();
    renderQuiz();
    restoreState();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
