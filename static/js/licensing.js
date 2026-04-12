/* ============================================
   Microsoft Licensing Simplifier — JS Engine
   Tabs · Plan Cards · Compare · Quiz · Changelog
   ============================================ */

(function () {
  'use strict';

  // ─── XSS Prevention ───
  function esc(s) {
    var e = document.createElement('span');
    e.textContent = s || '';
    return e.innerHTML;
  }

  const D = window.__licData;
  if (!D) return;

  const { plans, categories, features, quiz, changelog } = D;

  // ── HELPERS ─────────────────────────────────

  const $ = (s, p) => (p || document).querySelector(s);
  const $$ = (s, p) => [...(p || document).querySelectorAll(s)];

  const featureMap = {};
  features.forEach(f => { featureMap[f.id] = f; });

  const planMap = {};
  plans.forEach(p => { planMap[p.id] = p; });

  // Selected plans for comparison
  let compareSet = new Set();

  // ── TABS ────────────────────────────────────

  $$('.lic-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.lic-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      $$('.lic-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const panel = $('#panel-' + tab.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });

  // ── COMPARE TAB: PLAN CARDS ─────────────────

  function renderCompare() {
    const container = $('#lic-compare-content');
    if (!container) return;

    let html = '';
    categories.forEach(cat => {
      const catPlans = plans.filter(p => p.category === cat.id);
      if (!catPlans.length) return;

      // Sort plans by price descending (highest first)
      catPlans.sort((a, b) => b.price - a.price);

      const accent = cat.accent || '#F43F5E';

      html += `<div class="lic-category" id="cat-${cat.id}" style="--cat-accent:${accent}">`;
      html += `<div class="lic-category-header">
        <h2 class="lic-category-toggle" data-cat="${cat.id}">${cat.emoji} ${esc(cat.name)} <span style="color:#475569;font-size:0.85rem;font-weight:400;">(${catPlans.length})</span></h2>`;
      if (cat.m365maps_all) {
        html += `<a class="lic-category-link" href="${cat.m365maps_all}" target="_blank" rel="noopener">🗺️ View all on M365 Maps →</a>`;
      }
      html += `</div>`;
      html += `<p class="lic-category-desc">${esc(cat.description)}</p>`;
      html += `<div class="lic-cards">`;

      catPlans.forEach(plan => {
        html += renderPlanCard(plan);
      });

      html += `</div></div>`;
    });

    container.innerHTML = html;

    // Attach compare checkbox events
    $$('.lic-compare-input').forEach(cb => {
      cb.addEventListener('change', () => {
        if (cb.checked) compareSet.add(cb.value);
        else compareSet.delete(cb.value);
        updateCompareBar();
      });
    });

    // Attach category toggle events
    $$('.lic-category-toggle').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const catEl = toggle.closest('.lic-category');
        catEl.classList.toggle('collapsed');
      });
    });
  }

  function renderPlanCard(plan) {
    const priceDisplay = plan.price === 0
      ? '<span class="lic-price-unit">Free</span>'
      : `$${plan.price}<span class="lic-price-unit">/user/mo</span>`;

    const noteHtml = plan.price_note
      ? `<span class="lic-price-note">${esc(plan.price_note)}</span>`
      : '';

    const badgeHtml = plan.badge
      ? `<div class="lic-badge${plan.badge.includes('Coming') ? ' coming-soon' : ''}">${esc(plan.badge)}</div>`
      : '';

    // Build feature list (show top 5, then "and X more")
    let featHtml = '';
    if (plan.features && plan.features.length) {
      const resolved = plan.features.map(fid => featureMap[fid]).filter(Boolean);
      const show = resolved.slice(0, 5);
      const extra = resolved.length - show.length;
      featHtml = '<ul class="lic-card-features">';
      show.forEach(feat => {
        featHtml += `<li><span class="lic-feat-yes">✓</span> ${esc(feat.name)}</li>`;
      });
      if (extra > 0) {
        featHtml += `<li class="lic-feat-more">+ ${extra} more</li>`;
      }
      featHtml += '</ul>';
    }

    // Build action buttons
    let actions = '';
    if (plan.detail_url) {
      actions += `<a class="lic-btn lic-btn-primary" href="${plan.detail_url}">📖 View Details</a>`;
    }
    if (plan.m365maps) {
      actions += `<a class="lic-btn" href="${plan.m365maps}" target="_blank" rel="noopener">🗺️ M365 Maps</a>`;
    }
    if (plan.ms_official) {
      actions += `<a class="lic-btn" href="${plan.ms_official}" target="_blank" rel="noopener">📄 Microsoft</a>`;
    }

    return `
    <div class="lic-card" id="plan-${plan.id}" data-plan-id="${plan.id}">
      ${badgeHtml}
      <div class="lic-compare-check">
        <label class="lic-compare-label">
          <input type="checkbox" class="lic-compare-input" value="${plan.id}" aria-label="Compare ${esc(plan.name)}">
          <span>Compare</span>
        </label>
      </div>
      <div class="lic-card-head">
        <h3 class="lic-card-name">${esc(plan.name)}</h3>
        <div class="lic-card-price">${priceDisplay}${noteHtml}</div>
      </div>
      <p class="lic-card-tagline">${esc(plan.tagline)}</p>
      <p class="lic-card-who">${esc(plan.who)}</p>
      ${featHtml}
      <div class="lic-card-actions">${actions}</div>
    </div>`;
  }

  // ── COMPARE BAR & TABLE ─────────────────────

  function updateCompareBar() {
    const bar = $('#lic-compare-bar');
    const countEl = $('#lic-compare-count');
    if (compareSet.size >= 2) {
      bar.classList.add('visible');
      countEl.textContent = compareSet.size;
    } else {
      bar.classList.remove('visible');
      hideCompareTable();
    }
  }

  function buildCompareTable() {
    const selectedPlans = [...compareSet].map(id => planMap[id]).filter(Boolean);
    if (selectedPlans.length < 2) return;

    // Collect all features across selected plans
    const allFeatureIds = new Set();
    selectedPlans.forEach(p => {
      if (p.features) p.features.forEach(f => allFeatureIds.add(f));
    });

    // Group features by category
    const grouped = {};
    allFeatureIds.forEach(fid => {
      const feat = featureMap[fid];
      if (!feat) return;
      if (!grouped[feat.category]) grouped[feat.category] = [];
      grouped[feat.category].push(feat);
    });

    // Build table
    let html = '<thead><tr><th>Feature</th>';
    selectedPlans.forEach(p => {
      html += `<th>${esc(p.name)}<br><small style="color:#F43F5E">$${p.price}/mo</small></th>`;
    });
    html += '</tr></thead><tbody>';

    Object.keys(grouped).forEach(catName => {
      html += `<tr><td colspan="${selectedPlans.length + 1}" style="color:#F43F5E;font-weight:700;padding-top:1rem;">${esc(catName)}</td></tr>`;
      grouped[catName].forEach(feat => {
        html += `<tr><td>${feat.icon} ${esc(feat.name)}</td>`;
        selectedPlans.forEach(p => {
          const has = p.features && p.features.includes(feat.id);
          html += `<td class="${has ? 'lic-feat-cell-yes' : 'lic-feat-cell-no'}">${has ? '✅' : '—'}</td>`;
        });
        html += '</tr>';
      });
    });

    html += '</tbody>';

    const table = $('#lic-compare-table');
    table.innerHTML = html;
    $('#lic-compare-table-section').style.display = 'block';

    // Scroll to table
    $('#lic-compare-table-section').scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Update URL for sharing
    const ids = [...compareSet].join(',');
    const url = new URL(window.location);
    url.searchParams.set('compare', ids);
    url.hash = '';
    history.replaceState(null, '', url);

    // Show share link
    const shareHtml = `<div style="margin-top:1rem;text-align:center;">
      <button class="lic-btn" id="lic-share-compare" style="font-size:0.8rem;">🔗 Copy Share Link</button>
    </div>`;
    const existingShare = $('#lic-share-compare');
    if (!existingShare) {
      $('#lic-compare-table-section').insertAdjacentHTML('beforeend', shareHtml);
      setTimeout(() => {
        const btn = $('#lic-share-compare');
        if (btn) btn.addEventListener('click', () => {
          navigator.clipboard.writeText(url.toString()).then(() => {
            btn.textContent = '✅ Link copied!';
            setTimeout(() => { btn.textContent = '🔗 Copy Share Link'; }, 2000);
          });
        });
      }, 50);
    }
  }

  function hideCompareTable() {
    const section = $('#lic-compare-table-section');
    if (section) section.style.display = 'none';
  }

  function clearCompare() {
    compareSet.clear();
    $$('.lic-compare-input').forEach(cb => { cb.checked = false; });
    updateCompareBar();
    hideCompareTable();
  }

  // Compare bar buttons
  const goBtn = $('#lic-compare-go');
  const clearBtn = $('#lic-compare-clear');
  const clearBtn2 = $('#lic-clear-compare');
  if (goBtn) goBtn.addEventListener('click', buildCompareTable);
  if (clearBtn) clearBtn.addEventListener('click', clearCompare);
  if (clearBtn2) clearBtn2.addEventListener('click', clearCompare);

  // ── QUIZ TAB ────────────────────────────────

  const quizAnswers = {};

  function renderQuiz() {
    const container = $('#lic-quiz-questions');
    const progressEl = $('#lic-quiz-progress');
    if (!container || !quiz) return;

    // Sort questions by order
    const sorted = [...quiz].sort((a, b) => a.order - b.order);

    // Progress dots
    progressEl.innerHTML = sorted.map(q =>
      `<div class="lic-quiz-dot" data-q="${q.id}"></div>`
    ).join('');

    // Render questions
    let html = '';
    sorted.forEach((q, idx) => {
      html += `<div class="lic-quiz-question" data-qid="${q.id}">
        <h3>Q${idx + 1}. ${esc(q.text)}</h3>
        <p class="lic-quiz-help">${esc(q.help || '')}</p>
        <div class="lic-quiz-options">`;

      q.options.forEach((opt, oidx) => {
        const inputId = `${q.id}-opt${oidx}`;
        html += `<label class="lic-quiz-option" for="${inputId}">
          <input type="radio" id="${inputId}" name="${q.id}" value="${oidx}" class="lic-quiz-radio">
          ${esc(opt.label)}
        </label>`;
      });

      html += `</div></div>`;
    });

    container.innerHTML = html;

    // Radio change events
    $$('.lic-quiz-radio').forEach(radio => {
      radio.addEventListener('change', () => {
        const qid = radio.name;
        quizAnswers[qid] = parseInt(radio.value);
        // Style selected option
        const questionEl = radio.closest('.lic-quiz-question');
        $$('.lic-quiz-option', questionEl).forEach(o => o.classList.remove('selected'));
        radio.closest('.lic-quiz-option').classList.add('selected');
        // Update progress
        updateQuizProgress(sorted);
      });
    });
  }

  function updateQuizProgress(sorted) {
    sorted.forEach(q => {
      const dot = $(`.lic-quiz-dot[data-q="${q.id}"]`);
      if (dot) {
        dot.classList.toggle('answered', quizAnswers[q.id] !== undefined);
      }
    });

    const answered = Object.keys(quizAnswers).length;
    const total = sorted.length;
    const submitBtn = $('#lic-quiz-submit');
    const resetBtn = $('#lic-quiz-reset');

    if (answered >= total) {
      submitBtn.style.display = '';
    }
    if (answered > 0) {
      resetBtn.style.display = '';
    }
  }

  function calculateQuizResults() {
    const scores = {};
    const sorted = [...quiz].sort((a, b) => a.order - b.order);

    sorted.forEach(q => {
      const ansIdx = quizAnswers[q.id];
      if (ansIdx === undefined) return;
      const option = q.options[ansIdx];
      if (!option || !option.scores) return;

      Object.entries(option.scores).forEach(([planId, points]) => {
        scores[planId] = (scores[planId] || 0) + points;
      });
    });

    // Sort by score, take top 3
    const ranked = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return ranked.map(([planId, score]) => ({
      plan: planMap[planId],
      score
    })).filter(r => r.plan);
  }

  function renderQuizResults() {
    const results = calculateQuizResults();
    const container = $('#lic-quiz-results');
    if (!container) return;

    if (!results.length) {
      container.innerHTML = '<p style="color:#94a3b8;text-align:center;">Please answer all questions to see recommendations.</p>';
      return;
    }

    const maxScore = results[0].score;
    const labels = ['🥇 Best Match', '🥈 Runner Up', '🥉 Also Consider'];

    let html = '<h2 style="color:#e2e8f0;text-align:center;margin-bottom:1.5rem;">Your Recommended Plans</h2>';

    results.forEach((r, idx) => {
      const pct = Math.round((r.score / maxScore) * 100);
      const plan = r.plan;

      const priceText = plan.price === 0 ? 'Free' : `$${plan.price}/user/month`;

      let actions = '';
      if (plan.m365maps) {
        actions += `<a class="lic-btn" href="${plan.m365maps}" target="_blank" rel="noopener">🗺️ Feature Map</a>`;
      }
      if (plan.ms_official) {
        actions += `<a class="lic-btn" href="${plan.ms_official}" target="_blank" rel="noopener">📄 Official Page</a>`;
      }
      actions += `<button class="lic-btn" onclick="document.getElementById('plan-${plan.id}')?.scrollIntoView({behavior:'smooth'});document.querySelector('[data-tab=compare]')?.click();">🔍 View in Compare</button>`;

      html += `
      <div class="lic-result-card">
        <div class="lic-result-rank">${labels[idx] || 'Also Consider'} — ${pct}% match</div>
        <div class="lic-result-name">${esc(plan.name)}</div>
        <div class="lic-result-price">${priceText}${plan.price_note ? ' · ' + esc(plan.price_note) : ''}</div>
        <p class="lic-result-why">${esc(plan.description)}</p>
        <div class="lic-card-actions">${actions}</div>
      </div>`;
    });

    // Copilot recommendation (if user chose "Yes" to Copilot)
    const copilotQ = quiz.find(q => q.id === 'q5');
    if (copilotQ && quizAnswers['q5'] === 0) {
      const topPlan = results[0]?.plan;
      if (topPlan && topPlan.id !== 'm365-e7' && !topPlan.features?.includes('copilot-full')) {
        html += `
        <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.3);border-radius:12px;padding:1.2rem;margin-top:1rem;">
          <strong style="color:#F43F5E;">💡 Copilot Add-on Recommended</strong>
          <p style="color:#94a3b8;font-size:0.9rem;margin:0.4rem 0 0;">Since you want Copilot, add the <strong>Microsoft 365 Copilot</strong> add-on ($30/user/month) to your plan. Or consider <strong>Microsoft 365 E7</strong> ($99/user/month) which includes Copilot built in.</p>
        </div>`;
      }
    }

    container.innerHTML = html;
    container.scrollIntoView({ behavior: 'smooth' });
  }

  // Quiz buttons
  const submitBtn = $('#lic-quiz-submit');
  const resetBtn = $('#lic-quiz-reset');
  if (submitBtn) submitBtn.addEventListener('click', renderQuizResults);
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      Object.keys(quizAnswers).forEach(k => delete quizAnswers[k]);
      $$('.lic-quiz-radio').forEach(r => { r.checked = false; });
      $$('.lic-quiz-option').forEach(o => o.classList.remove('selected'));
      $$('.lic-quiz-dot').forEach(d => d.classList.remove('answered'));
      $('#lic-quiz-results').innerHTML = '';
      submitBtn.style.display = 'none';
      resetBtn.style.display = 'none';
    });
  }

  // ── CHANGELOG TAB ───────────────────────────

  function renderChangelog() {
    const container = $('#lic-changelog-content');
    if (!container || !changelog) return;

    // Sort by date descending
    const sorted = [...changelog].sort((a, b) => b.date.localeCompare(a.date));

    let html = '<h2 style="color:#e2e8f0;margin-bottom:1.5rem;">Microsoft Licensing Changes</h2>';

    sorted.forEach(entry => {
      const dateStr = formatDate(entry.date);
      const isFuture = new Date(entry.date) > new Date();

      let tagsHtml = '';
      if (entry.affected && entry.affected.length) {
        tagsHtml = '<div class="lic-change-affected">';
        entry.affected.forEach(pid => {
          const plan = planMap[pid];
          const label = plan ? plan.name : pid;
          tagsHtml += `<span class="lic-change-tag">${label}</span>`;
        });
        tagsHtml += '</div>';
      }

      let sourceHtml = '';
      if (entry.source) {
        sourceHtml = `<a href="${entry.source}" target="_blank" rel="noopener" style="color:#F43F5E;font-size:0.8rem;">Source →</a>`;
      }

      html += `
      <div class="lic-change">
        <div class="lic-change-dot ${entry.severity || ''}"></div>
        <div class="lic-change-date">${dateStr}${isFuture ? ' · Upcoming' : ''}</div>
        <div class="lic-change-title">${entry.title}</div>
        <p class="lic-change-desc">${entry.description}</p>
        ${tagsHtml}
        ${sourceHtml}
      </div>`;
    });

    container.innerHTML = html;
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  // ── URL STATE (tab from hash) ───────────────

  function handleHash() {
    const hash = window.location.hash.replace('#', '');
    if (['compare', 'calculator', 'addons', 'quiz', 'changelog'].includes(hash)) {
      const tab = $(`.lic-tab[data-tab="${hash}"]`);
      if (tab) tab.click();
    }
    // Highlight specific plan
    if (hash.startsWith('plan-')) {
      scrollToPlan(hash.replace('plan-', ''));
    }
    // Handle preset compare from URL
    const params = new URLSearchParams(window.location.search);
    if (params.has('compare')) {
      const ids = params.get('compare').split(',');
      triggerPresetCompare(ids);
    }
  }

  window.addEventListener('hashchange', handleHash);

  // ── SEARCH ──────────────────────────────────

  function initSearch() {
    const input = $('#lic-search');
    const resultsEl = $('#lic-search-results');
    if (!input || !resultsEl) return;

    // Build search index with aliases
    const searchIndex = plans.map(p => {
      const cat = categories.find(c => c.id === p.category);
      return {
        id: p.id,
        name: p.name,
        tagline: p.tagline,
        category: cat ? cat.name : p.category,
        price: p.price,
        searchText: [p.name, p.tagline, p.who, p.description, p.id, p.category].join(' ').toLowerCase()
      };
    });

    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      if (q.length < 2) { resultsEl.classList.remove('visible'); return; }

      const matches = searchIndex.filter(p => p.searchText.includes(q)).slice(0, 10);
      if (!matches.length) {
        resultsEl.innerHTML = '<div class="lic-search-result"><span class="lic-search-result-name">No plans found</span></div>';
        resultsEl.classList.add('visible');
        return;
      }

      resultsEl.innerHTML = matches.map(m => `
        <div class="lic-search-result" data-plan-id="${m.id}">
          <div>
            <span class="lic-search-result-name">${m.name}</span>
            <span class="lic-search-result-cat">${m.category}</span>
          </div>
          <span class="lic-search-result-price">${m.price === 0 ? 'Free' : '$' + m.price}</span>
        </div>
      `).join('');
      resultsEl.classList.add('visible');

      // Click to jump to plan
      $$('.lic-search-result', resultsEl).forEach(r => {
        r.addEventListener('click', () => {
          const planId = r.dataset.planId;
          if (planId) scrollToPlan(planId);
          input.value = '';
          resultsEl.classList.remove('visible');
        });
      });
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.lic-search-wrap')) resultsEl.classList.remove('visible');
    });

    // Close on Escape
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { input.value = ''; resultsEl.classList.remove('visible'); }
    });
  }

  function scrollToPlan(planId) {
    // Ensure Compare tab is active
    const compareTab = $(`.lic-tab[data-tab="compare"]`);
    if (compareTab && !compareTab.classList.contains('active')) compareTab.click();

    const card = $(`#plan-${planId}`);
    if (!card) return;

    // Expand the category if collapsed
    const catEl = card.closest('.lic-category');
    if (catEl && catEl.classList.contains('collapsed')) {
      catEl.classList.remove('collapsed');
    }

    // Scroll and highlight
    setTimeout(() => {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add('highlighted');
      setTimeout(() => card.classList.remove('highlighted'), 3000);
    }, 100);
  }

  // ── PRESET COMPARISONS ─────────────────────

  function initPresets() {
    $$('.lic-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const ids = btn.dataset.plans.split(',');
        triggerPresetCompare(ids);
      });
    });
  }

  function triggerPresetCompare(planIds) {
    // Ensure Compare tab is active
    const compareTab = $(`.lic-tab[data-tab="compare"]`);
    if (compareTab && !compareTab.classList.contains('active')) compareTab.click();

    // Clear existing
    compareSet.clear();
    $$('.lic-compare-input').forEach(cb => { cb.checked = false; });

    // Check the preset plans
    planIds.forEach(id => {
      const cb = $(`.lic-compare-input[value="${id}"]`);
      if (cb) { cb.checked = true; compareSet.add(id); }
    });

    updateCompareBar();

    // Auto-trigger the comparison table
    setTimeout(() => buildCompareTable(), 100);
  }

  // ── ADD-ONS ADVISOR ─────────────────────────

  const addonMatrix = {
    'm365-e3': {
      has: ['Desktop Apps', 'Exchange 100GB', 'Teams', 'Intune P1', 'Entra P1', 'Defender Endpoint P1', 'Defender O365 P1', 'Windows E3', 'DLP Basic', 'eDiscovery Standard'],
      addons: [
        { need: 'AI assistant in Office apps', addon: 'Microsoft 365 Copilot', price: 30, id: 'copilot-addon' },
        { need: 'Teams Phone (PSTN calling)', addon: 'Teams Phone Standard', price: 8, id: 'teams-phone-standard' },
        { need: 'Full EDR + threat hunting', addon: 'Defender for Endpoint P2', price: 5.20, id: 'defender-endpoint-p2' },
        { need: 'PIM + risk-based identity', addon: 'Entra ID P2', price: 9, id: 'entra-p2' },
        { need: 'Insider Risk + advanced compliance', addon: 'Purview Suite', price: 12, id: 'purview-suite' },
        { need: 'Advanced endpoint management', addon: 'Intune Suite', price: 10, id: 'intune-suite' },
        { need: 'Employee experience platform', addon: 'Viva Suite', price: 12, id: 'viva-suite' },
        { need: 'Power BI dashboards', addon: 'Power BI Pro', price: 10, id: 'powerbi-pro' },
        { need: 'AI meeting recaps + branding', addon: 'Teams Premium', price: 10, id: 'teams-premium' },
      ],
      upgrade: { plan: 'Microsoft 365 E5', price: 60, id: 'm365-e5', note: 'Includes Defender P2, Entra P2, Teams Phone, Power BI Pro, Insider Risk, and more. Often cheaper than E3 + multiple add-ons.' }
    },
    'm365-e5': {
      has: ['Everything in E3', 'Entra P2 (PIM)', 'Defender Endpoint P2', 'Defender O365 P2', 'CASB', 'Teams Phone', 'Power BI Pro', 'Insider Risk', 'eDiscovery Premium', 'Windows E5'],
      addons: [
        { need: 'AI assistant in Office apps', addon: 'Microsoft 365 Copilot', price: 30, id: 'copilot-addon' },
        { need: 'Advanced endpoint management', addon: 'Intune Suite', price: 10, id: 'intune-suite' },
        { need: 'Employee experience platform', addon: 'Viva Suite', price: 12, id: 'viva-suite' },
        { need: 'AI meeting recaps + branding', addon: 'Teams Premium', price: 10, id: 'teams-premium' },
      ],
      upgrade: { plan: 'Microsoft 365 E7', price: 99, id: 'm365-e7', note: 'Includes Copilot ($30 value) + Agent 365 + full Entra Suite. Only $9 more than E5+Copilot.' }
    },
    'biz-standard': {
      has: ['Desktop Apps', 'Exchange 50GB', 'Teams', 'OneDrive 1TB', 'SharePoint'],
      addons: [
        { need: 'AI assistant in Office apps', addon: 'Microsoft 365 Copilot', price: 30, id: 'copilot-addon' },
        { need: 'Device management + security', addon: 'Upgrade to Business Premium', price: 22, id: 'biz-premium', isUpgrade: true },
      ],
      upgrade: { plan: 'Business Premium', price: 22, id: 'biz-premium', note: 'Adds Intune, Defender, Entra P1, and DLP for just $8 more. Best security deal for SMBs.' }
    },
    'biz-premium': {
      has: ['Desktop Apps', 'Exchange 50GB', 'Teams', 'Intune P1', 'Defender for Business', 'Entra P1', 'DLP'],
      addons: [
        { need: 'AI assistant in Office apps', addon: 'Microsoft 365 Copilot', price: 30, id: 'copilot-addon' },
        { need: 'AI meeting recaps + branding', addon: 'Teams Premium', price: 10, id: 'teams-premium' },
        { need: 'Employee experience platform', addon: 'Viva Suite', price: 12, id: 'viva-suite' },
      ],
      upgrade: null
    },
    'o365-e3': {
      has: ['Desktop Apps', 'Exchange 100GB', 'Teams', 'DLP Basic', 'eDiscovery Standard'],
      addons: [
        { need: 'Device management + identity', addon: 'EMS E3 (Intune + Entra P1)', price: 12, id: 'ems-e3' },
        { need: 'Full security + device mgmt', addon: 'Upgrade to Microsoft 365 E3', price: 39, id: 'm365-e3', isUpgrade: true },
        { need: 'AI assistant in Office apps', addon: 'Microsoft 365 Copilot', price: 30, id: 'copilot-addon', note: 'Requires M365 E3+ base' },
      ],
      upgrade: { plan: 'Microsoft 365 E3', price: 39, id: 'm365-e3', note: 'Includes Intune P1, Entra P1, Defender P1, and Windows E3. The $13 upgrade gets you enterprise security.' }
    },
    'o365-e5': {
      has: ['Desktop Apps', 'Exchange 100GB', 'Teams', 'Teams Phone', 'Power BI Pro', 'eDiscovery Premium'],
      addons: [
        { need: 'Device management + identity', addon: 'EMS E5 (Intune + Entra P2)', price: 18, id: 'ems-e5' },
        { need: 'Full security + compliance', addon: 'Upgrade to Microsoft 365 E5', price: 60, id: 'm365-e5', isUpgrade: true },
      ],
      upgrade: { plan: 'Microsoft 365 E5', price: 60, id: 'm365-e5', note: 'Includes full Defender suite, Intune, Entra P2, and Insider Risk. Better value than O365 E5 + EMS E5 separately.' }
    }
  };

  function initAddonsAdvisor() {
    const select = $('#lic-addons-base');
    if (!select) return;

    select.addEventListener('change', () => {
      const planId = select.value;
      renderAddonsResults(planId);
    });
  }

  function renderAddonsResults(planId) {
    const container = $('#lic-addons-results');
    if (!container) return;

    if (!planId || !addonMatrix[planId]) {
      container.innerHTML = '';
      return;
    }

    const data = addonMatrix[planId];
    const plan = planMap[planId];

    let html = '';

    // What's already included
    html += '<div style="margin-bottom:1.5rem;">';
    html += '<h3 style="color:#22c55e;font-size:1rem;margin-bottom:0.6rem;">✅ Already included in ' + plan.name + '</h3>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:0.4rem;">';
    data.has.forEach(item => {
      html += `<span style="padding:0.25rem 0.6rem;border-radius:99px;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.2);color:#22c55e;font-size:0.78rem;">${item}</span>`;
    });
    html += '</div></div>';

    // Available add-ons
    html += '<h3 style="color:#e2e8f0;font-size:1rem;margin-bottom:0.8rem;">🧩 Available Add-ons</h3>';

    data.addons.forEach(addon => {
      const detailUrl = planMap[addon.id]?.detail_url || '';
      html += `<div class="lic-addon-card">
        <div class="lic-addon-info">
          <div class="lic-addon-need">${addon.need}</div>
          <div class="lic-addon-name">${addon.isUpgrade ? '⬆️ ' : ''}${addon.addon}</div>
          ${addon.note ? `<div class="lic-addon-desc">${addon.note}</div>` : ''}
        </div>
        <div style="text-align:right;">
          <div class="lic-addon-price">${addon.isUpgrade ? '' : '+'}$${addon.price}/mo</div>
          ${detailUrl ? `<a href="${detailUrl}" class="lic-btn" style="margin-top:0.4rem;font-size:0.75rem;">Details →</a>` : ''}
        </div>
      </div>`;
    });

    // Upgrade suggestion
    if (data.upgrade) {
      const u = data.upgrade;
      html += `<div class="lic-addons-upgrade">
        <strong>💡 Consider upgrading to ${u.plan} ($${u.price}/mo)</strong>
        <p>${u.note}</p>
        <a href="${planMap[u.id]?.detail_url || '/licensing/'}" class="lic-btn lic-btn-primary" style="margin-top:0.5rem;">View ${u.plan} Details →</a>
      </div>`;
    }

    container.innerHTML = html;
  }

  // ── BUILD YOUR STACK CALCULATOR ─────────────

  let calcRows = [];
  let calcNextId = 0;

  function initCalculator() {
    const addBtn = $('#lic-calc-add');
    const copyBtn = $('#lic-calc-copy');
    const resetBtn = $('#lic-calc-reset');

    if (addBtn) addBtn.addEventListener('click', () => addCalcRow());
    if (copyBtn) copyBtn.addEventListener('click', copyCalcSummary);
    if (resetBtn) resetBtn.addEventListener('click', resetCalc);

    // Start with one empty row
    addCalcRow();
  }

  function addCalcRow(preselectedId) {
    const id = calcNextId++;
    calcRows.push({ id, planId: preselectedId || '', users: 0 });

    const container = $('#lic-calc-rows');
    if (!container) return;

    // Build plan dropdown options grouped by category
    let options = '<option value="">Select a plan...</option>';
    categories.forEach(cat => {
      const catPlans = plans.filter(p => p.category === cat.id && p.price > 0);
      if (!catPlans.length) return;
      options += `<optgroup label="${cat.emoji} ${cat.name}">`;
      catPlans.sort((a, b) => b.price - a.price);
      catPlans.forEach(p => {
        const sel = (p.id === preselectedId) ? ' selected' : '';
        options += `<option value="${p.id}"${sel}>$${p.price} — ${p.name}</option>`;
      });
      options += '</optgroup>';
    });

    const rowHtml = `
    <div class="lic-calc-row" data-row-id="${id}">
      <select class="lic-calc-select" data-row="${id}">${options}</select>
      <input type="number" class="lic-calc-users" data-row="${id}" placeholder="Users" min="0" value="${preselectedId ? 1 : ''}">
      <div class="lic-calc-line-cost" data-row="${id}">$0</div>
      <button class="lic-calc-remove" data-row="${id}" aria-label="Remove">&times;</button>
    </div>`;

    container.insertAdjacentHTML('beforeend', rowHtml);

    // Events for this row
    const row = container.querySelector(`[data-row-id="${id}"]`);
    row.querySelector('.lic-calc-select').addEventListener('change', e => {
      const r = calcRows.find(r => r.id === id);
      if (r) r.planId = e.target.value;
      updateCalcTotals();
    });
    row.querySelector('.lic-calc-users').addEventListener('input', e => {
      const r = calcRows.find(r => r.id === id);
      if (r) r.users = parseInt(e.target.value) || 0;
      updateCalcTotals();
    });
    row.querySelector('.lic-calc-remove').addEventListener('click', () => {
      calcRows = calcRows.filter(r => r.id !== id);
      row.remove();
      updateCalcTotals();
    });

    updateCalcTotals();
  }

  function updateCalcTotals() {
    const totalsEl = $('#lic-calc-totals');
    if (!totalsEl) return;

    const activeRows = calcRows.filter(r => r.planId && r.users > 0);

    if (!activeRows.length) {
      totalsEl.innerHTML = '<div class="lic-calc-empty">Add plans above to see your estimated cost</div>';
      return;
    }

    let totalMonthly = 0;
    let totalUsers = 0;
    let summaryRows = '';

    activeRows.forEach(r => {
      const plan = planMap[r.planId];
      if (!plan) return;
      const lineCost = plan.price * r.users;
      totalMonthly += lineCost;
      totalUsers += r.users;

      summaryRows += `<div class="lic-calc-summary-row">
        <span class="lic-plan-name">${plan.name} × ${r.users} users</span>
        <span class="lic-plan-cost">$${lineCost.toLocaleString()}/mo</span>
      </div>`;

      // Update line cost display
      const lineEl = $(`.lic-calc-line-cost[data-row="${r.id}"]`);
      if (lineEl) lineEl.textContent = `$${lineCost.toLocaleString()}`;
    });

    // Clear line costs for empty rows
    calcRows.filter(r => !r.planId || r.users <= 0).forEach(r => {
      const lineEl = $(`.lic-calc-line-cost[data-row="${r.id}"]`);
      if (lineEl) lineEl.textContent = '$0';
    });

    const totalAnnual = totalMonthly * 12;
    const avgPerUser = totalUsers > 0 ? (totalMonthly / totalUsers).toFixed(2) : 0;

    let html = `
    <div class="lic-calc-totals-grid">
      <div class="lic-calc-total-box">
        <h3>Monthly Cost</h3>
        <div class="lic-calc-amount">$${totalMonthly.toLocaleString()}</div>
        <div style="color:#64748b;font-size:0.78rem;">${totalUsers} users</div>
      </div>
      <div class="lic-calc-total-box">
        <h3>Annual Cost</h3>
        <div class="lic-calc-amount annual">$${totalAnnual.toLocaleString()}</div>
        <div style="color:#64748b;font-size:0.78rem;">12 months</div>
      </div>
      <div class="lic-calc-total-box">
        <h3>Avg per User</h3>
        <div class="lic-calc-amount annual">$${avgPerUser}</div>
        <div style="color:#64748b;font-size:0.78rem;">per month</div>
      </div>
    </div>
    <div class="lic-calc-summary">${summaryRows}</div>`;

    // July 2026 price impact estimate
    const julyNote = activeRows.some(r => {
      const p = planMap[r.planId];
      return p && ['m365-e3', 'm365-e5', 'biz-basic', 'biz-standard', 'o365-e3', 'o365-e5'].includes(p.id);
    });

    if (julyNote) {
      html += `
      <div class="lic-calc-impact">
        <div class="lic-calc-impact-title">⚠️ July 2026 Price Changes</div>
        <p class="lic-calc-impact-detail">Some of your selected plans have price increases effective July 1, 2026. The prices shown above reflect the new pricing. Check the <a href="/licensing/#changelog" style="color:var(--lic-accent);">changelog</a> for details on what changed.</p>
      </div>`;
    }

    totalsEl.innerHTML = html;
  }

  function copyCalcSummary() {
    const activeRows = calcRows.filter(r => r.planId && r.users > 0);
    if (!activeRows.length) return;

    let text = 'Microsoft Licensing Stack Estimate\n';
    text += '='.repeat(40) + '\n\n';

    let total = 0;
    activeRows.forEach(r => {
      const plan = planMap[r.planId];
      if (!plan) return;
      const cost = plan.price * r.users;
      total += cost;
      text += `${plan.name}\n  ${r.users} users × $${plan.price}/mo = $${cost.toLocaleString()}/mo\n\n`;
    });

    text += '-'.repeat(40) + '\n';
    text += `Total: $${total.toLocaleString()}/month · $${(total * 12).toLocaleString()}/year\n`;
    text += `\nGenerated at aguidetocloud.com/licensing/\n`;
    text += `Prices in USD · April 2026 · Check official Microsoft pricing for latest rates\n`;

    navigator.clipboard.writeText(text).then(() => {
      const btn = $('#lic-calc-copy');
      if (btn) { btn.textContent = '✅ Copied!'; setTimeout(() => { btn.textContent = '📋 Copy Summary'; }, 2000); }
    });
  }

  function resetCalc() {
    calcRows = [];
    calcNextId = 0;
    const container = $('#lic-calc-rows');
    if (container) container.innerHTML = '';
    const totals = $('#lic-calc-totals');
    if (totals) totals.innerHTML = '<div class="lic-calc-empty">Add plans above to see your estimated cost</div>';
    addCalcRow();
  }

  // ── INIT ────────────────────────────────────

  try {
    renderCompare();
    renderQuiz();
    renderChangelog();
    initSearch();
    initPresets();
    initCalculator();
    initAddonsAdvisor();
    handleHash();
  } catch (e) {
    console.error('[Licensing Simplifier] Init error:', e);
    const container = document.querySelector('#lic-compare-content');
    if (container) container.innerHTML = '<p style="color:#ef4444;padding:2rem;text-align:center;">Something went wrong loading the licensing data. Please try refreshing the page (Ctrl+Shift+R).</p>';
  }

})();
