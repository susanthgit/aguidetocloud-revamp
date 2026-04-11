/* ============================================
   Microsoft Licensing Simplifier — JS Engine
   Tabs · Plan Cards · Compare · Quiz · Changelog
   ============================================ */

(function () {
  'use strict';

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

      html += `<div class="lic-category" id="cat-${cat.id}">`;
      html += `<div class="lic-category-header">
        <h2>${cat.emoji} ${cat.name}</h2>`;
      if (cat.m365maps_all) {
        html += `<a class="lic-category-link" href="${cat.m365maps_all}" target="_blank" rel="noopener">🗺️ View all on M365 Maps →</a>`;
      }
      html += `</div>`;
      html += `<p class="lic-category-desc">${cat.description}</p>`;
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
  }

  function renderPlanCard(plan) {
    const priceDisplay = plan.price === 0
      ? '<span class="price-unit">Free</span>'
      : `$${plan.price}<span class="price-unit">/user/mo</span>`;

    const noteHtml = plan.price_note
      ? `<span class="price-note">${plan.price_note}</span>`
      : '';

    const badgeHtml = plan.badge
      ? `<div class="lic-badge${plan.badge.includes('Coming') ? ' coming-soon' : ''}">${plan.badge}</div>`
      : '';

    // Build feature list (show key features from plan)
    let featHtml = '';
    if (plan.features && plan.features.length) {
      featHtml = '<ul class="lic-card-features">';
      plan.features.forEach(fid => {
        const feat = featureMap[fid];
        if (feat) {
          featHtml += `<li><span class="feat-yes">✓</span> ${feat.name}</li>`;
        }
      });
      featHtml += '</ul>';
    }

    // Build action buttons
    let actions = '';
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
        <input type="checkbox" class="lic-compare-input" value="${plan.id}" title="Add to comparison" aria-label="Compare ${plan.name}">
      </div>
      <div class="lic-card-head">
        <h3 class="lic-card-name">${plan.name}</h3>
        <div class="lic-card-price">${priceDisplay}${noteHtml}</div>
      </div>
      <p class="lic-card-tagline">${plan.tagline}</p>
      <p class="lic-card-who">${plan.who}</p>
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
      html += `<th>${p.name}<br><small style="color:#10B981">$${p.price}/mo</small></th>`;
    });
    html += '</tr></thead><tbody>';

    Object.keys(grouped).forEach(catName => {
      html += `<tr><td colspan="${selectedPlans.length + 1}" style="color:#10B981;font-weight:700;padding-top:1rem;">${catName}</td></tr>`;
      grouped[catName].forEach(feat => {
        html += `<tr><td>${feat.icon} ${feat.name}</td>`;
        selectedPlans.forEach(p => {
          const has = p.features && p.features.includes(feat.id);
          html += `<td class="${has ? 'feat-cell-yes' : 'feat-cell-no'}">${has ? '✅' : '—'}</td>`;
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
        <h3>Q${idx + 1}. ${q.text}</h3>
        <p class="lic-quiz-help">${q.help || ''}</p>
        <div class="lic-quiz-options">`;

      q.options.forEach((opt, oidx) => {
        const inputId = `${q.id}-opt${oidx}`;
        html += `<label class="lic-quiz-option" for="${inputId}">
          <input type="radio" id="${inputId}" name="${q.id}" value="${oidx}" class="lic-quiz-radio">
          ${opt.label}
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
        <div class="lic-result-name">${plan.name}</div>
        <div class="lic-result-price">${priceText}${plan.price_note ? ' · ' + plan.price_note : ''}</div>
        <p class="lic-result-why">${plan.description}</p>
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
          <strong style="color:#10B981;">💡 Copilot Add-on Recommended</strong>
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
        sourceHtml = `<a href="${entry.source}" target="_blank" rel="noopener" style="color:#10B981;font-size:0.8rem;">Source →</a>`;
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
    if (['compare', 'quiz', 'changelog'].includes(hash)) {
      const tab = $(`.lic-tab[data-tab="${hash}"]`);
      if (tab) tab.click();
    }
    // Highlight specific plan
    if (hash.startsWith('plan-')) {
      const card = $(`#${hash}`);
      if (card) {
        card.classList.add('highlighted');
        setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);
        setTimeout(() => card.classList.remove('highlighted'), 3000);
      }
    }
  }

  window.addEventListener('hashchange', handleHash);

  // ── INIT ────────────────────────────────────

  renderCompare();
  renderQuiz();
  renderChangelog();
  handleHash();

})();
