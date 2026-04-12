/* ================================================================
   AI SaaS Showdown — Interactive JS
   Tabs, Overview, Compare, Pricing, Strengths, Quiz, Enterprise, Changelog
   ================================================================ */
(function () {
  'use strict';

  // ── Escape helper ──
  function esc(s) {
    const e = document.createElement('span');
    e.textContent = s || '';
    return e.innerHTML;
  }

  // ── Data ──
  const PROVIDERS = window.__showdownProviders || {};
  const PLANS = window.__showdownPlans || {};
  const STRENGTHS = window.__showdownStrengths || {};
  const COMPLIANCE = window.__showdownCompliance || {};
  const QUIZ_DATA = window.__showdownQuiz || {};
  const CHANGELOG_DATA = window.__showdownChangelog || {};

  // sorted provider keys
  const providerKeys = Object.keys(PROVIDERS).sort((a, b) => (PROVIDERS[a].order || 99) - (PROVIDERS[b].order || 99));
  const planKeys = Object.keys(PLANS);

  // ── Stats ──
  const $providerCount = document.getElementById('providerCount');
  const $planCount = document.getElementById('planCount');
  if ($providerCount) $providerCount.textContent = providerKeys.length;
  if ($planCount) $planCount.textContent = planKeys.length;

  // ── Tab Switching ──
  const tabs = document.querySelectorAll('.showdown-tab');
  const panels = document.querySelectorAll('.showdown-panel');

  function switchTab(tabId) {
    tabs.forEach(t => { t.classList.toggle('active', t.dataset.tab === tabId); t.setAttribute('aria-selected', t.dataset.tab === tabId); });
    panels.forEach(p => p.classList.toggle('active', p.id === 'panel-' + tabId));
    history.replaceState(null, '', updateParam('tab', tabId === 'overview' ? null : tabId));
  }

  tabs.forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));

  // ── URL State ──
  function getParam(k) { return new URLSearchParams(location.search).get(k); }
  function updateParam(k, v) {
    const u = new URLSearchParams(location.search);
    if (v) u.set(k, v); else u.delete(k);
    const s = u.toString();
    return location.pathname + (s ? '?' + s : '');
  }

  // ── Toast helper ──
  function showToast(msg) {
    let toast = document.getElementById('showdownToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'showdownToast';
      toast.style.cssText = 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:#1a1a2e;border:1px solid var(--showdown-accent);color:var(--showdown-accent);padding:0.6rem 1.2rem;border-radius:8px;font-size:0.85rem;z-index:1000;opacity:0;transition:opacity 0.3s;pointer-events:none';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 2500);
  }

  // ══════════════════════════════════════════
  // TAB 1: OVERVIEW
  // ══════════════════════════════════════════
  function getLowestPrice(provKey) {
    let min = Infinity;
    for (const pk of planKeys) {
      const p = PLANS[pk];
      if (p.provider === provKey && p.monthly_price > 0) min = Math.min(min, p.monthly_price);
    }
    return min === Infinity ? null : min;
  }

  function renderOverview(filter) {
    const grid = document.getElementById('providerGrid');
    if (!grid) return;
    const f = (filter || '').toLowerCase();
    let html = '';
    for (const key of providerKeys) {
      const p = PROVIDERS[key];
      if (f && !p.name.toLowerCase().includes(f) && !p.product.toLowerCase().includes(f) && !p.tagline.toLowerCase().includes(f)) continue;
      const lowest = getLowestPrice(key);
      const priceLabel = lowest ? `From $${lowest}/mo` : 'Free / API';
      html += `
        <div class="showdown-provider-card" data-provider="${key}" tabindex="0" role="button" aria-label="Compare ${esc(p.name)}">
          <div class="showdown-provider-header">
            <span class="showdown-provider-emoji">${p.logo_emoji}</span>
            <div>
              <div class="showdown-provider-name">${esc(p.name)}</div>
              <div class="showdown-provider-product">${esc(p.product)} — <em>${esc(p.tagline)}</em></div>
            </div>
          </div>
          <div class="showdown-provider-desc">${esc(p.description)}</div>
          <div class="showdown-provider-meta">
            <span class="showdown-badge showdown-badge-price">${priceLabel}</span>
            <span class="showdown-badge showdown-badge-model">${esc(p.flagship_model)}</span>
            <span class="showdown-badge showdown-badge-context">📏 ${esc(p.context_window)}</span>
            ${p.open_source ? '<span class="showdown-badge showdown-badge-open">Open Source</span>' : ''}
          </div>
          <div class="showdown-card-actions">
            <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="showdown-card-link" onclick="event.stopPropagation()">Visit Site ↗</a>
            <a href="${p.pricing_url}" target="_blank" rel="noopener noreferrer" class="showdown-card-link" onclick="event.stopPropagation()">Pricing ↗</a>
          </div>
        </div>`;
    }
    grid.innerHTML = html || '<p style="color:#999">No providers match your search.</p>';

    // Make cards clickable → jump to compare with that provider selected
    grid.querySelectorAll('.showdown-provider-card').forEach(card => {
      card.addEventListener('click', () => {
        const pk = card.dataset.provider;
        if (!selectedProviders.includes(pk)) {
          if (selectedProviders.length >= 4) selectedProviders.shift();
          selectedProviders.push(pk);
        }
        renderCompareSelector();
        renderCompareGrid();
        switchTab('compare');
      });
    });
  }

  const $overviewSearch = document.getElementById('overviewSearch');
  if ($overviewSearch) $overviewSearch.addEventListener('input', () => renderOverview($overviewSearch.value));
  renderOverview();

  // ══════════════════════════════════════════
  // TAB 2: COMPARE
  // ══════════════════════════════════════════
  const PRESETS = {
    big3: ['openai', 'anthropic', 'google'],
    budget: ['mistral', 'deepseek', 'perplexity'],
    enterprise: ['microsoft', 'google', 'openai', 'anthropic'],
    coding: ['anthropic', 'openai', 'deepseek'],
    research: ['perplexity', 'xai', 'google']
  };
  let selectedProviders = [...PRESETS.big3];

  function renderCompareSelector() {
    const el = document.getElementById('compareSelector');
    if (!el) return;
    el.innerHTML = providerKeys.map(k => {
      const p = PROVIDERS[k];
      const sel = selectedProviders.includes(k) ? ' selected' : '';
      return `<label class="showdown-compare-check${sel}" data-key="${k}">
        <input type="checkbox" ${sel ? 'checked' : ''}>${p.logo_emoji} ${esc(p.product)}
      </label>`;
    }).join('');

    el.querySelectorAll('.showdown-compare-check').forEach(label => {
      label.addEventListener('click', (e) => {
        e.preventDefault();
        const k = label.dataset.key;
        if (selectedProviders.includes(k)) {
          selectedProviders = selectedProviders.filter(x => x !== k);
        } else if (selectedProviders.length < 4) {
          selectedProviders.push(k);
        } else {
          showToast('⚠️ Max 4 providers — deselect one first');
          return;
        }
        renderCompareSelector();
        renderCompareGrid();
      });
    });
  }

  const COMPARE_FEATURES = [
    { label: 'Starting Price', key: 'price' },
    { label: 'Flagship Model', key: 'flagship_model' },
    { label: 'Context Window', key: 'context_window' },
    { label: 'Free Tier', key: 'free_tier' },
    { label: 'Image Generation', key: 'image_generation' },
    { label: 'Voice Mode', key: 'voice_mode' },
    { label: 'Web Browsing', key: 'web_browsing' },
    { label: 'File Upload', key: 'file_upload' },
    { label: 'Memory', key: 'memory' },
    { label: 'Custom GPTs/Agents', key: 'custom_gpts' },
    { label: 'API Access', key: 'api_available' },
    { label: 'Open Source', key: 'open_source' },
    { label: 'Team Plan', key: 'team_plan' },
    { label: 'Enterprise Plan', key: 'enterprise_plan' },
    { label: 'SSO/SAML', key: 'sso' },
    { label: 'Data Residency', key: 'data_residency' }
  ];

  function getProviderBestPlan(provKey, tier) {
    return planKeys.find(pk => PLANS[pk].provider === provKey && PLANS[pk].tier === tier);
  }

  function getFeatureValue(provKey, featureKey) {
    const prov = PROVIDERS[provKey];
    const indPlan = getProviderBestPlan(provKey, 'individual') || getProviderBestPlan(provKey, 'free');
    const plan = indPlan ? PLANS[indPlan] : null;
    const comp = COMPLIANCE[provKey] || {};

    switch (featureKey) {
      case 'price': {
        const lowest = getLowestPrice(provKey);
        return lowest ? `$${lowest}/mo` : 'Free / Pay-per-use';
      }
      case 'flagship_model': return prov.flagship_model;
      case 'context_window': return prov.context_window;
      case 'free_tier': return getProviderBestPlan(provKey, 'free') ? '✅ Yes' : '❌ No';
      case 'image_generation': return plan && plan.image_generation ? '✅' : '❌';
      case 'voice_mode': return plan && plan.voice_mode ? '✅' : '❌';
      case 'web_browsing': return plan && plan.web_browsing ? '✅' : '❌';
      case 'file_upload': return plan && plan.file_upload ? '✅' : '❌';
      case 'memory': return plan && plan.memory ? '✅' : '❌';
      case 'custom_gpts': return plan && plan.custom_gpts ? '✅' : '❌';
      case 'api_available': return prov.api_available ? '✅' : '❌';
      case 'open_source': return prov.open_source ? '✅' : '❌';
      case 'team_plan': return getProviderBestPlan(provKey, 'team') ? '✅' : '❌';
      case 'enterprise_plan': return getProviderBestPlan(provKey, 'enterprise') ? '✅' : '❌';
      case 'sso': return comp.sso_saml ? '✅' : '❌';
      case 'data_residency': {
        const dr = comp.data_residency;
        return Array.isArray(dr) ? dr.join(', ') : (dr || '—');
      }
      default: return '—';
    }
  }

  function renderCompareGrid() {
    const grid = document.getElementById('compareGrid');
    if (!grid || selectedProviders.length < 2) {
      if (grid) grid.innerHTML = '<p style="color:#999">Select at least 2 providers to compare.</p>';
      return;
    }
    let html = '<table class="showdown-compare-table"><thead><tr><th>Feature</th>';
    for (const pk of selectedProviders) {
      html += `<th>${PROVIDERS[pk].logo_emoji} ${esc(PROVIDERS[pk].product)}</th>`;
    }
    html += '</tr></thead><tbody>';
    for (const feat of COMPARE_FEATURES) {
      html += `<tr><td>${feat.label}</td>`;
      for (const pk of selectedProviders) {
        html += `<td>${getFeatureValue(pk, feat.key)}</td>`;
      }
      html += '</tr>';
    }
    html += '</tbody></table>';
    grid.innerHTML = html;
  }

  // Presets
  document.querySelectorAll('.showdown-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.showdown-preset').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedProviders = [...PRESETS[btn.dataset.preset]];
      renderCompareSelector();
      renderCompareGrid();
    });
  });

  renderCompareSelector();
  renderCompareGrid();

  // ══════════════════════════════════════════
  // TAB 3: PRICING
  // ══════════════════════════════════════════
  function formatPrice(mp) {
    if (mp === 0) return { text: 'Free', cls: 'showdown-price-free' };
    if (mp > 0) return { text: `$${mp}`, cls: 'showdown-price-value' };
    return { text: 'Custom', cls: 'showdown-price-custom' };
  }

  function isCustomPricing(plan) {
    return plan.monthly_price === 0 && (plan.tier === 'enterprise' || plan.tier === 'team') && !plan.name.toLowerCase().includes('free');
  }

  function renderPricing() {
    const tbody = document.getElementById('pricingBody');
    if (!tbody) return;
    const tierFilter = document.getElementById('pricingTier').value;
    const sortBy = document.getElementById('pricingSort').value;

    let rows = planKeys.map(pk => ({ key: pk, ...PLANS[pk] }));
    if (tierFilter !== 'all') rows = rows.filter(r => r.tier === tierFilter);

    rows.sort((a, b) => {
      if (sortBy === 'price-asc') return (a.monthly_price || 0) - (b.monthly_price || 0);
      if (sortBy === 'price-desc') return (b.monthly_price || 0) - (a.monthly_price || 0);
      return (PROVIDERS[a.provider]?.order || 99) - (PROVIDERS[b.provider]?.order || 99);
    });

    tbody.innerHTML = rows.map(r => {
      const prov = PROVIDERS[r.provider] || {};
      const custom = isCustomPricing(r);
      const mp = r.monthly_price;
      const ap = r.annual_price_monthly;
      let priceText, priceClass;

      if (custom) {
        priceText = 'Contact Sales';
        priceClass = 'showdown-price-custom';
      } else if (mp === 0) {
        priceText = 'Free';
        priceClass = 'showdown-price-free';
      } else {
        priceText = `$${mp}`;
        priceClass = 'showdown-price-value';
      }

      const annualText = custom ? '—' : (ap === 0 ? '—' : (ap > 0 ? `$${ap}` : '—'));
      const savings = (!custom && mp > 0 && ap > 0 && ap < mp) ? ` <small style="color:var(--showdown-green)">(${Math.round((1 - ap / mp) * 100)}% off)</small>` : '';

      return `<tr>
        <td>${prov.logo_emoji || ''} ${esc(prov.name || r.provider)}</td>
        <td><strong>${esc(r.name)}</strong></td>
        <td class="${priceClass}">${priceText}</td>
        <td>${annualText}${savings}</td>
        <td style="font-size:0.78rem">${esc(r.message_limit || '—')}</td>
        <td style="font-size:0.78rem">${esc(r.best_for || '—')}</td>
      </tr>`;
    }).join('');
  }

  ['pricingTier', 'pricingSort'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', renderPricing);
  });
  renderPricing();

  // ══════════════════════════════════════════
  // TAB 4: STRENGTHS
  // ══════════════════════════════════════════
  function renderStrengths(filter) {
    const grid = document.getElementById('strengthsGrid');
    if (!grid) return;
    const f = (filter || '').toLowerCase();
    let html = '';

    for (const key of providerKeys) {
      const prov = PROVIDERS[key];
      const s = STRENGTHS[key];
      if (!s) continue;
      if (f && !prov.name.toLowerCase().includes(f) && !prov.product.toLowerCase().includes(f)) continue;

      // Show top 3 of each, with expand toggle
      const maxShow = 3;
      const mkList = (arr, cls) => {
        if (!arr || !arr.length) return '';
        const visible = arr.slice(0, maxShow).map(x => `<li>${esc(x)}</li>`).join('');
        const hidden = arr.length > maxShow ? arr.slice(maxShow).map(x => `<li>${esc(x)}</li>`).join('') : '';
        const more = arr.length > maxShow ? `<li class="showdown-show-more" style="cursor:pointer;color:var(--showdown-accent);font-weight:600;list-style:none;padding-left:0">+ ${arr.length - maxShow} more...</li>` : '';
        return `<ul class="showdown-strength-list showdown-list-${cls}">${visible}<span class="showdown-hidden-items" style="display:none">${hidden}</span>${more}</ul>`;
      };

      html += `
        <div class="showdown-strength-card">
          <div class="showdown-strength-header">
            <span style="font-size:1.5rem">${prov.logo_emoji}</span>
            <span class="showdown-strength-title">${esc(prov.name)} (${esc(prov.product)})</span>
          </div>
          <div class="showdown-strength-section">
            <div class="showdown-strength-label showdown-label-pros">✅ STRENGTHS</div>
            ${mkList(s.strengths, 'pros')}
          </div>
          <div class="showdown-strength-section">
            <div class="showdown-strength-label showdown-label-cons">❌ WEAKNESSES</div>
            ${mkList(s.weaknesses, 'cons')}
          </div>
          <div class="showdown-strength-section">
            <div class="showdown-strength-label showdown-label-bestfor">🎯 BEST FOR</div>
            ${mkList(s.best_for, 'bestfor')}
          </div>
          <div class="showdown-strength-section">
            <div class="showdown-strength-label showdown-label-watchout">⚠️ WATCH OUT</div>
            ${mkList(s.watch_out, 'watchout')}
          </div>
        </div>`;
    }
    grid.innerHTML = html || '<p style="color:#999">No providers match.</p>';

    // Toggle expand on "X more" links
    grid.querySelectorAll('.showdown-show-more').forEach(link => {
      link.addEventListener('click', () => {
        const hidden = link.previousElementSibling;
        if (hidden && hidden.classList.contains('showdown-hidden-items')) {
          hidden.style.display = hidden.style.display === 'none' ? 'contents' : 'none';
          link.textContent = hidden.style.display === 'none' ? link.textContent : '− Show less';
        }
      });
    });
  }

  const $strengthsSearch = document.getElementById('strengthsSearch');
  if ($strengthsSearch) $strengthsSearch.addEventListener('input', () => renderStrengths($strengthsSearch.value));
  renderStrengths();

  // ══════════════════════════════════════════
  // TAB 5: QUIZ
  // ══════════════════════════════════════════
  const questions = QUIZ_DATA.questions || [];
  const scoring = QUIZ_DATA.scoring || {};
  let quizAnswers = {};
  let quizIndex = 0;

  function renderQuizQuestion() {
    const container = document.getElementById('quizQuestion');
    const counter = document.getElementById('quizCounter');
    const progress = document.getElementById('quizProgressBar');
    const prevBtn = document.getElementById('quizPrev');
    const nextBtn = document.getElementById('quizNext');
    if (!container || !questions.length) return;

    const q = questions[quizIndex];
    container.innerHTML = `
      <h3>Q${quizIndex + 1}. ${q.text}</h3>
      <div class="showdown-quiz-options">
        ${q.options.map(o => `
          <button class="showdown-quiz-option${quizAnswers[q.id] === o.value ? ' selected' : ''}" data-value="${o.value}">
            ${o.label}
          </button>
        `).join('')}
      </div>`;

    container.querySelectorAll('.showdown-quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        quizAnswers[q.id] = btn.dataset.value;
        container.querySelectorAll('.showdown-quiz-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        // Auto-advance after 400ms delay
        setTimeout(() => {
          if (quizIndex < questions.length - 1) {
            quizIndex++;
            renderQuizQuestion();
          } else {
            renderQuizResults();
          }
        }, 400);
      });
    });

    if (counter) counter.textContent = `Question ${quizIndex + 1} of ${questions.length}`;
    if (progress) progress.style.width = `${((quizIndex + 1) / questions.length) * 100}%`;
    if (prevBtn) prevBtn.disabled = quizIndex === 0;
    if (nextBtn) nextBtn.textContent = quizIndex === questions.length - 1 ? 'See Results 🎉' : 'Next →';
  }

  function calculateQuizResults() {
    const scores = {};
    providerKeys.forEach(k => { scores[k] = 0; });

    for (const [qId, answer] of Object.entries(quizAnswers)) {
      const qScoring = scoring[qId];
      if (qScoring && qScoring[answer]) {
        for (const [prov, pts] of Object.entries(qScoring[answer])) {
          if (scores[prov] !== undefined) scores[prov] += pts;
        }
      }
    }

    return Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([key, score]) => ({ key, score, provider: PROVIDERS[key] }));
  }

  function renderQuizResults() {
    const results = calculateQuizResults();
    const container = document.getElementById('quizResults');
    const quizContainer = document.getElementById('quizContainer');
    if (!container) return;

    quizContainer.style.display = 'none';
    container.style.display = 'block';

    const ranks = ['showdown-rank-first', 'showdown-rank-second', 'showdown-rank-third'];
    const labels = ['🥇 Top Pick', '🥈 Runner Up', '🥉 Also Great'];
    const maxScore = results[0]?.score || 1;

    container.innerHTML = `
      <h3 style="text-align:center;color:#fff;margin-bottom:1.5rem">Your AI Recommendations</h3>
      ${results.map((r, i) => {
        const pct = Math.round((r.score / maxScore) * 100);
        return `
          <div class="showdown-result-card${i === 0 ? ' showdown-top-pick' : ''}">
            <div class="showdown-result-rank ${ranks[i]}">${labels[i]}</div>
            <div class="showdown-result-name">${r.provider.logo_emoji} ${esc(r.provider.name)} (${esc(r.provider.product)})</div>
            <div class="showdown-result-score">Match: ${pct}%</div>
            <div class="showdown-result-reason">${esc(r.provider.description)}</div>
            <div class="showdown-result-actions">
              <a href="${r.provider.url}" target="_blank" class="showdown-btn showdown-btn-primary" style="text-decoration:none">Try ${esc(r.provider.product)} →</a>
              <a href="${r.provider.pricing_url}" target="_blank" class="showdown-btn showdown-btn-secondary" style="text-decoration:none">See Pricing</a>
            </div>
          </div>`;
      }).join('')}
      <div style="text-align:center;margin-top:1.5rem">
        <button class="showdown-btn showdown-btn-secondary" id="quizRetake">🔄 Retake Quiz</button>
      </div>
      <div class="showdown-cross-tools">
        <p style="color:var(--showdown-text-dim);font-size:0.85rem;margin-top:2rem">🔗 <strong>Explore more tools:</strong></p>
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:0.5rem">
          <a href="/copilot-matrix/" class="showdown-btn showdown-btn-secondary" style="text-decoration:none;font-size:0.8rem">📊 Copilot Feature Matrix</a>
          <a href="/licensing/" class="showdown-btn showdown-btn-secondary" style="text-decoration:none;font-size:0.8rem">📜 M365 Licensing</a>
          <a href="/ai-mapper/" class="showdown-btn showdown-btn-secondary" style="text-decoration:none;font-size:0.8rem">🗺️ AI Service Mapper</a>
          <a href="/roi-calculator/" class="showdown-btn showdown-btn-secondary" style="text-decoration:none;font-size:0.8rem">💰 Copilot ROI Calculator</a>
        </div>
      </div>`;

    document.getElementById('quizRetake')?.addEventListener('click', () => {
      quizAnswers = {};
      quizIndex = 0;
      container.style.display = 'none';
      quizContainer.style.display = 'block';
      renderQuizQuestion();
    });
  }

  const $quizPrev = document.getElementById('quizPrev');
  const $quizNext = document.getElementById('quizNext');

  if ($quizPrev) $quizPrev.addEventListener('click', () => {
    if (quizIndex > 0) { quizIndex--; renderQuizQuestion(); }
  });
  if ($quizNext) $quizNext.addEventListener('click', () => {
    if (quizIndex < questions.length - 1) { quizIndex++; renderQuizQuestion(); }
    else renderQuizResults();
  });

  renderQuizQuestion();

  // ══════════════════════════════════════════
  // TAB 6: ENTERPRISE READINESS
  // ══════════════════════════════════════════
  const COMPLIANCE_COLS = [
    { key: 'soc2', label: 'SOC 2' },
    { key: 'hipaa', label: 'HIPAA' },
    { key: 'gdpr', label: 'GDPR' },
    { key: 'fedramp', label: 'FedRAMP' },
    { key: 'iso27001', label: 'ISO 27001' },
    { key: 'sso_saml', label: 'SSO/SAML' },
    { key: 'admin_console', label: 'Admin Console' },
    { key: 'audit_logs', label: 'Audit Logs' },
    { key: 'dlp', label: 'DLP' },
    { key: 'private_deployment', label: 'Private Deploy' },
    { key: 'zero_data_retention', label: 'Zero Retention' }
  ];

  let activeRequirements = [];

  function renderEnterpriseFilters() {
    const el = document.getElementById('enterpriseFilters');
    if (!el) return;
    el.innerHTML = COMPLIANCE_COLS.map(c =>
      `<label class="showdown-req-check${activeRequirements.includes(c.key) ? ' active' : ''}" data-key="${c.key}">
        <input type="checkbox" ${activeRequirements.includes(c.key) ? 'checked' : ''}>${c.label}
      </label>`
    ).join('');

    el.querySelectorAll('.showdown-req-check').forEach(label => {
      label.addEventListener('click', (e) => {
        e.preventDefault();
        const k = label.dataset.key;
        if (activeRequirements.includes(k)) activeRequirements = activeRequirements.filter(x => x !== k);
        else activeRequirements.push(k);
        renderEnterpriseFilters();
        renderEnterpriseTable();
      });
    });
  }

  function renderEnterpriseTable() {
    const thead = document.getElementById('enterpriseHead');
    const tbody = document.getElementById('enterpriseBody');
    if (!thead || !tbody) return;

    thead.innerHTML = `<tr><th>Provider</th>${COMPLIANCE_COLS.map(c => `<th>${c.label}</th>`).join('')}<th>Data Residency</th><th>SLA</th></tr>`;

    let filteredProviders = providerKeys;
    if (activeRequirements.length > 0) {
      filteredProviders = providerKeys.filter(pk => {
        const c = COMPLIANCE[pk] || {};
        return activeRequirements.every(req => c[req] === true);
      });
    }

    tbody.innerHTML = filteredProviders.map(pk => {
      const prov = PROVIDERS[pk];
      const c = COMPLIANCE[pk] || {};
      const cells = COMPLIANCE_COLS.map(col => {
        const v = c[col.key];
        if (v === true) return `<td class="showdown-compliance-yes">✅</td>`;
        if (v === false) return `<td class="showdown-compliance-no">❌</td>`;
        return `<td class="showdown-compliance-partial">⚠️</td>`;
      }).join('');
      const dr = Array.isArray(c.data_residency) ? c.data_residency.join(', ') : (c.data_residency || '—');
      return `<tr><td>${prov.logo_emoji} ${esc(prov.name)}</td>${cells}<td style="font-size:0.75rem">${esc(dr)}</td><td style="font-size:0.75rem">${esc(c.sla || '—')}</td></tr>`;
    }).join('');

    if (filteredProviders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="${COMPLIANCE_COLS.length + 3}" style="color:#999;text-align:center;padding:2rem">No providers meet all selected requirements.</td></tr>`;
    }
  }

  renderEnterpriseFilters();
  renderEnterpriseTable();

  // ══════════════════════════════════════════
  // TAB 7: CHANGELOG
  // ══════════════════════════════════════════
  const changelogEntries = CHANGELOG_DATA.entries || [];

  function populateChangelogProviderFilter() {
    const sel = document.getElementById('changelogProvider');
    if (!sel) return;
    const providers = [...new Set(changelogEntries.map(e => e.provider))];
    providers.forEach(p => {
      const prov = PROVIDERS[p];
      if (prov) {
        const opt = document.createElement('option');
        opt.value = p;
        opt.textContent = prov.name;
        sel.appendChild(opt);
      }
    });
  }

  const TYPE_LABELS = {
    price_change: '💰 Price Change',
    new_plan: '🆕 New Plan',
    new_model: '🤖 New Model',
    new_feature: '✨ New Feature',
    breaking: '⚠️ Breaking Change'
  };

  function renderChangelog() {
    const list = document.getElementById('changelogList');
    if (!list) return;
    const provFilter = document.getElementById('changelogProvider')?.value || 'all';
    const typeFilter = document.getElementById('changelogType')?.value || 'all';

    let entries = [...changelogEntries];
    if (provFilter !== 'all') entries = entries.filter(e => e.provider === provFilter);
    if (typeFilter !== 'all') entries = entries.filter(e => e.type === typeFilter);
    entries.sort((a, b) => b.date.localeCompare(a.date));

    list.innerHTML = entries.map(e => {
      const prov = PROVIDERS[e.provider] || {};
      return `
        <div class="showdown-changelog-entry">
          <div class="showdown-changelog-header">
            <span class="showdown-changelog-date">${e.date}</span>
            <span class="showdown-changelog-provider-badge">${prov.logo_emoji || ''} ${esc(prov.name || e.provider)}</span>
            <span class="showdown-changelog-type-badge showdown-type-${e.type}">${TYPE_LABELS[e.type] || esc(e.type)}</span>
            ${e.impact === 'high' ? '<span class="showdown-badge" style="background:rgba(239,68,68,0.15);color:#ef4444">🔴 High Impact</span>' : ''}
          </div>
          <div class="showdown-changelog-title">${esc(e.title)}</div>
          <div class="showdown-changelog-desc">${esc(e.description)}</div>
          ${e.source ? `<a href="${e.source}" target="_blank" rel="noopener noreferrer" class="showdown-changelog-source">📎 Source →</a>` : ''}
        </div>`;
    }).join('');

    if (entries.length === 0) {
      list.innerHTML = '<p style="color:#999;text-align:center;padding:2rem">No changes match your filters.</p>';
    }
  }

  populateChangelogProviderFilter();
  ['changelogProvider', 'changelogType'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', renderChangelog);
  });
  renderChangelog();

  // ── Restore tab from URL ──
  const initTab = getParam('tab');
  if (initTab) switchTab(initTab);

})();
