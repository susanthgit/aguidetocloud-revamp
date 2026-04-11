/* ============================================================
   AI Service Mapper — Interactive Engine
   All filtering, compare, quiz, pricing, glossary logic
   ============================================================ */

(function() {
  'use strict';

  const DATA = window.__aimapData;
  if (!DATA) return;

  const services = DATA.services || [];
  const categories = DATA.categories || {};
  const quizData = DATA.quiz || {};
  const quizQuestions = quizData.questions || [];

  // State
  let compareSet = new Set();
  let activeFilters = { provider: [], category: [], pricing: [], capabilities: [], enterprise: [], integration: [] };
  let searchQuery = '';
  let sortBy = 'name';
  let quizAnswers = {};
  let quizStep = 0;

  // ---- INIT ----
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setupTabs();
    buildProviderFilters();
    buildCategoryFilters();
    renderCards();
    setupSearch();
    setupFilterListeners();
    setupSort();
    setupCompareBtn();
    setupMobileFilterToggle();
    setupComparePickers();
    setupQuiz();
    renderPricingTable();
    renderGlossary();
    restoreFromURL();
  }

  // ---- TABS ----
  function setupTabs() {
    document.querySelectorAll('.aimap-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.aimap-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        document.querySelectorAll('.aimap-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        const panel = document.getElementById('panel-' + tab.dataset.tab);
        if (panel) panel.classList.add('active');
        if (tab.dataset.tab === 'compare') renderCompareTable();
      });
    });
  }

  function switchToTab(tabName) {
    const tab = document.querySelector(`.aimap-tab[data-tab="${tabName}"]`);
    if (tab) tab.click();
  }

  // ---- PROVIDER FILTERS (dynamic) ----
  function buildProviderFilters() {
    const providers = [...new Set(services.map(s => s.provider))].sort();
    const container = document.getElementById('filter-provider');
    if (!container) return;
    container.innerHTML = providers.map(p =>
      `<label class="aimap-filter-check"><input type="checkbox" value="${p}"> ${p}</label>`
    ).join('');
  }

  function buildCategoryFilters() {
    const container = document.getElementById('filter-category');
    if (!container) return;
    const catEntries = Object.entries(categories).sort((a,b) => (a[1].order||99) - (b[1].order||99));
    container.innerHTML = catEntries.map(([id, cat]) =>
      `<label class="aimap-filter-check"><input type="checkbox" value="${id}"> ${cat.emoji} ${cat.name}</label>`
    ).join('');
  }

  // ---- CARDS ----
  function renderCards() {
    const grid = document.getElementById('aimap-grid');
    const noResults = document.getElementById('aimap-no-results');
    const countEl = document.getElementById('aimap-count');
    if (!grid) return;

    let filtered = getFilteredServices();

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'provider') return (a.provider || '').localeCompare(b.provider || '');
      if (sortBy === 'category') return (a.category || '').localeCompare(b.category || '');
      return (a.name || '').localeCompare(b.name || '');
    });

    if (countEl) countEl.textContent = `${filtered.length} service${filtered.length !== 1 ? 's' : ''}`;

    if (filtered.length === 0) {
      grid.innerHTML = '';
      if (noResults) noResults.style.display = 'block';
      return;
    }
    if (noResults) noResults.style.display = 'none';

    grid.innerHTML = filtered.map(s => cardHTML(s)).join('');

    // Attach compare checkboxes
    grid.querySelectorAll('.aimap-card-compare').forEach(cb => {
      cb.checked = compareSet.has(cb.dataset.id);
      cb.addEventListener('change', () => {
        if (cb.checked) {
          if (compareSet.size >= 4) { cb.checked = false; return; }
          compareSet.add(cb.dataset.id);
        } else {
          compareSet.delete(cb.dataset.id);
        }
        updateCompareBtn();
      });
    });
  }

  function cardHTML(s) {
    const cat = categories[s.category] || {};
    const catColor = cat.colour || '#3B82F6';

    // Capability badges
    const caps = [
      { key: 'text_generation', label: '💬 Text', val: s.text_generation },
      { key: 'code_generation', label: '💻 Code', val: s.code_generation },
      { key: 'image_generation', label: '🎨 Image', val: s.image_generation },
      { key: 'audio_speech', label: '🎙️ Audio', val: s.audio_speech },
      { key: 'video_generation', label: '🎬 Video', val: s.video_generation },
      { key: 'reasoning', label: '🧠 Reasoning', val: s.reasoning },
    ].filter(c => c.val > 0);

    const capsHTML = caps.map(c =>
      `<span class="aimap-cap-badge${c.val >= 4 ? ' strong' : ''}">${c.label} ${c.val}/5</span>`
    ).join('');

    // Best-for
    const bestHTML = (s.best_for || []).map(b =>
      `<span class="aimap-best-tag">${b}</span>`
    ).join('');

    // Price display
    let priceClass = 'paid';
    let priceText = s.price_note || s.pricing_model || '';
    if (s.free_tier && s.pricing_model === 'free') { priceClass = 'free'; priceText = '🆓 Free'; }
    else if (s.free_tier) { priceClass = 'free'; priceText = '🆓 Free tier available'; }
    else if (s.pricing_model === 'subscription') { priceClass = 'sub'; }

    return `<div class="aimap-card" style="--card-cat-color: ${catColor}">
      <div class="aimap-card-top">
        <div class="aimap-card-identity">
          <span class="aimap-card-provider">${s.provider}</span>
          <span class="aimap-card-category">${cat.emoji || ''} ${cat.name || s.category}</span>
        </div>
        <input type="checkbox" class="aimap-card-compare" data-id="${s.id}" title="Add to compare" aria-label="Compare ${s.name}">
      </div>
      <h3 class="aimap-card-name">${s.name}</h3>
      <p class="aimap-card-desc">${s.description || ''}</p>
      <div class="aimap-card-caps">${capsHTML}</div>
      <div class="aimap-card-best">${bestHTML}</div>
      <div class="aimap-card-footer">
        <span class="aimap-card-price ${priceClass}">${priceText}</span>
        <a href="${s.url}" target="_blank" rel="noopener" class="aimap-card-link">Visit →</a>
      </div>
    </div>`;
  }

  // ---- FILTERING ----
  function getFilteredServices() {
    return services.filter(s => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const haystack = `${s.name} ${s.provider} ${s.description} ${(s.tags||[]).join(' ')} ${(s.use_cases||[]).join(' ')} ${(s.best_for||[]).join(' ')}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      // Provider
      if (activeFilters.provider.length && !activeFilters.provider.includes(s.provider)) return false;
      // Category
      if (activeFilters.category.length && !activeFilters.category.includes(s.category)) return false;
      // Pricing
      if (activeFilters.pricing.length) {
        const matches = activeFilters.pricing.some(p => {
          if (p === 'free') return s.free_tier;
          return s.pricing_model === p;
        });
        if (!matches) return false;
      }
      // Capabilities
      if (activeFilters.capabilities.length) {
        const matches = activeFilters.capabilities.every(cap => (s[cap] || 0) >= 3);
        if (!matches) return false;
      }
      // Enterprise
      if (activeFilters.enterprise.length) {
        const matches = activeFilters.enterprise.every(e => s[e]);
        if (!matches) return false;
      }
      // Integration
      if (activeFilters.integration.length) {
        const matches = activeFilters.integration.some(i => s[i]);
        if (!matches) return false;
      }
      return true;
    });
  }

  function setupSearch() {
    const input = document.getElementById('aimap-search');
    if (!input) return;
    let timeout;
    input.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        searchQuery = input.value.trim();
        renderCards();
        updateURL();
      }, 200);
    });
  }

  function setupFilterListeners() {
    const filterMap = {
      'filter-provider': 'provider',
      'filter-category': 'category',
      'filter-pricing': 'pricing',
      'filter-capabilities': 'capabilities',
      'filter-enterprise': 'enterprise',
      'filter-integration': 'integration',
    };

    Object.entries(filterMap).forEach(([containerId, filterKey]) => {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.addEventListener('change', () => {
        activeFilters[filterKey] = Array.from(container.querySelectorAll('input:checked')).map(i => i.value);
        renderCards();
        updateURL();
      });
    });

    // Clear filters
    const clearBtn = document.getElementById('aimap-clear-filters');
    const clearLink = document.getElementById('aimap-clear-link');
    [clearBtn, clearLink].forEach(el => {
      if (!el) return;
      el.addEventListener('click', clearAllFilters);
    });
  }

  function clearAllFilters() {
    document.querySelectorAll('.aimap-filters input[type="checkbox"]').forEach(cb => cb.checked = false);
    const searchInput = document.getElementById('aimap-search');
    if (searchInput) searchInput.value = '';
    searchQuery = '';
    Object.keys(activeFilters).forEach(k => activeFilters[k] = []);
    renderCards();
    updateURL();
  }

  function setupSort() {
    const select = document.getElementById('aimap-sort-select');
    if (!select) return;
    select.addEventListener('change', () => {
      sortBy = select.value;
      renderCards();
    });
  }

  function setupMobileFilterToggle() {
    const toggle = document.getElementById('aimap-mobile-filter-toggle');
    const filters = document.querySelector('.aimap-filters');
    if (!toggle || !filters) return;
    toggle.addEventListener('click', () => filters.classList.toggle('open'));
  }

  // ---- COMPARE ----
  function updateCompareBtn() {
    const btn = document.getElementById('aimap-open-compare');
    const count = document.getElementById('aimap-compare-count');
    if (btn) btn.disabled = compareSet.size < 2;
    if (count) count.textContent = compareSet.size;
  }

  function setupCompareBtn() {
    const btn = document.getElementById('aimap-open-compare');
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (compareSet.size >= 2) switchToTab('compare');
    });
  }

  function setupComparePickers() {
    const container = document.getElementById('aimap-compare-pickers');
    if (!container) return;
    for (let i = 0; i < 4; i++) {
      const sel = document.createElement('select');
      sel.innerHTML = `<option value="">Select service ${i+1}...</option>` +
        services.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
      sel.addEventListener('change', () => {
        syncPickersToCompareSet();
        renderCompareTable();
      });
      container.appendChild(sel);
    }
  }

  function syncPickersToCompareSet() {
    const pickers = document.querySelectorAll('#aimap-compare-pickers select');
    compareSet.clear();
    pickers.forEach(sel => { if (sel.value) compareSet.add(sel.value); });
    updateCompareBtn();
    // Sync checkboxes on cards
    document.querySelectorAll('.aimap-card-compare').forEach(cb => {
      cb.checked = compareSet.has(cb.dataset.id);
    });
  }

  function renderCompareTable() {
    const wrap = document.getElementById('aimap-compare-table-wrap');
    const empty = document.getElementById('aimap-compare-empty');
    const actions = document.getElementById('aimap-compare-actions');
    if (!wrap) return;

    // Sync pickers with compareSet
    const pickers = document.querySelectorAll('#aimap-compare-pickers select');
    const ids = [...compareSet];
    pickers.forEach((sel, i) => { sel.value = ids[i] || ''; });

    if (compareSet.size < 2) {
      if (empty) empty.style.display = 'block';
      if (actions) actions.style.display = 'none';
      const table = wrap.querySelector('.aimap-compare-table');
      if (table) table.remove();
      return;
    }
    if (empty) empty.style.display = 'none';
    if (actions) actions.style.display = 'flex';

    const selected = ids.map(id => services.find(s => s.id === id)).filter(Boolean);

    const rows = [
      { label: 'Provider', key: s => s.provider },
      { label: 'Category', key: s => { const c = categories[s.category]; return c ? `${c.emoji} ${c.name}` : s.category; }},
      { label: 'Pricing Model', key: s => s.pricing_model || 'N/A' },
      { label: 'Free Tier', key: s => s.free_tier ? `✅ ${s.free_tier_detail || ''}` : '❌' },
      { label: 'Price (Input/1M)', key: s => s.price_input || 'N/A' },
      { label: 'Price (Output/1M)', key: s => s.price_output || 'N/A' },
      { label: 'Price Note', key: s => s.price_note || '' },
      { label: 'Text Generation', key: s => capBar(s.text_generation) },
      { label: 'Code Generation', key: s => capBar(s.code_generation) },
      { label: 'Image Generation', key: s => capBar(s.image_generation) },
      { label: 'Voice / Audio', key: s => capBar(s.audio_speech) },
      { label: 'Video Generation', key: s => capBar(s.video_generation) },
      { label: 'Reasoning', key: s => capBar(s.reasoning) },
      { label: 'Context Window', key: s => s.context_window || 'N/A' },
      { label: 'Multimodal', key: s => s.multimodal ? '✅' : '❌' },
      { label: 'Fine-tuning', key: s => s.fine_tuning ? '✅' : '❌' },
      { label: 'Function Calling', key: s => s.function_calling ? '✅' : '❌' },
      { label: 'Data Residency', key: s => s.data_residency ? `✅ ${(s.regions||[]).join(', ')}` : '❌' },
      { label: 'SOC 2', key: s => s.soc2 ? '✅' : '❌' },
      { label: 'HIPAA', key: s => s.hipaa ? '✅' : '❌' },
      { label: 'GDPR', key: s => s.gdpr ? '✅' : '❌' },
      { label: 'Private Networking', key: s => s.private_networking ? '✅' : '❌' },
      { label: 'SLA', key: s => s.sla || 'N/A' },
      { label: 'M365 Integration', key: s => s.integration_m365 ? '✅' : '❌' },
      { label: 'Azure Integration', key: s => s.integration_azure ? '✅' : '❌' },
      { label: 'AWS Integration', key: s => s.integration_aws ? '✅' : '❌' },
      { label: 'GCP Integration', key: s => s.integration_gcp ? '✅' : '❌' },
      { label: 'Best For', key: s => (s.best_for||[]).join(', ') },
      { label: 'Use Cases', key: s => (s.use_cases||[]).join(', ') },
    ];

    let html = `<table class="aimap-compare-table">
      <thead><tr><th></th>${selected.map(s => `<th>${s.name}</th>`).join('')}</tr></thead>
      <tbody>`;

    rows.forEach(row => {
      const vals = selected.map(s => row.key(s));
      const allSame = vals.every(v => v === vals[0]);
      html += `<tr>
        <th>${row.label}</th>
        ${vals.map(v => `<td${allSame ? '' : ' class="diff-highlight"'}>${v}</td>`).join('')}
      </tr>`;
    });

    html += '</tbody></table>';
    // Remove old table
    const old = wrap.querySelector('.aimap-compare-table');
    if (old) old.remove();
    wrap.insertAdjacentHTML('beforeend', html);

    // Copy + share
    setupCopyCompare(selected, rows);
    setupShareCompare();
  }

  function capBar(val) {
    if (!val || val === 0) return '<span style="color:#666">—</span>';
    const filled = '█'.repeat(val);
    const empty = '░'.repeat(5 - val);
    const color = val >= 4 ? '#3B82F6' : val >= 2 ? '#fbbf24' : '#666';
    return `<span style="color:${color}">${filled}${empty}</span> ${val}/5`;
  }

  function setupCopyCompare(selected, rows) {
    const btn = document.getElementById('aimap-copy-compare');
    if (!btn) return;
    btn.onclick = () => {
      let md = `| Feature | ${selected.map(s => s.name).join(' | ')} |\n`;
      md += `|---|${selected.map(() => '---').join('|')}|\n`;
      rows.forEach(row => {
        const vals = selected.map(s => {
          const v = row.key(s);
          return typeof v === 'string' ? v.replace(/[█░]/g, '').trim() : String(v);
        });
        md += `| ${row.label} | ${vals.join(' | ')} |\n`;
      });
      navigator.clipboard.writeText(md).then(() => {
        btn.textContent = '✅ Copied!';
        setTimeout(() => btn.textContent = '📋 Copy as Markdown', 2000);
      });
    };
  }

  function setupShareCompare() {
    const btn = document.getElementById('aimap-share-compare');
    if (!btn) return;
    btn.onclick = () => {
      const ids = [...compareSet].join(',');
      const url = `${location.origin}${location.pathname}?tab=compare&compare=${ids}`;
      navigator.clipboard.writeText(url).then(() => {
        btn.textContent = '✅ Link copied!';
        setTimeout(() => btn.textContent = '🔗 Share comparison', 2000);
      });
    };
  }

  // ---- QUIZ ----
  function setupQuiz() {
    const startBtn = document.getElementById('aimap-quiz-start');
    const retakeBtn = document.getElementById('aimap-quiz-retake');
    const compareBtn = document.getElementById('aimap-quiz-compare-results');

    if (startBtn) startBtn.addEventListener('click', startQuiz);
    if (retakeBtn) retakeBtn.addEventListener('click', () => { quizAnswers = {}; quizStep = 0; startQuiz(); });
    if (compareBtn) compareBtn.addEventListener('click', () => {
      const resultCards = document.querySelectorAll('.aimap-quiz-result-card');
      compareSet.clear();
      resultCards.forEach(card => {
        const id = card.dataset.id;
        if (id) compareSet.add(id);
      });
      updateCompareBtn();
      switchToTab('compare');
    });
  }

  function startQuiz() {
    document.getElementById('aimap-quiz-intro').style.display = 'none';
    document.getElementById('aimap-quiz-results').style.display = 'none';
    document.getElementById('aimap-quiz-step').style.display = 'block';
    quizStep = 0;
    renderQuizStep();
  }

  function renderQuizStep() {
    if (quizStep >= quizQuestions.length) { showQuizResults(); return; }
    const q = quizQuestions[quizStep];
    document.getElementById('aimap-quiz-question').textContent = q.text;

    // Progress dots
    const progressEl = document.getElementById('aimap-quiz-progress');
    progressEl.innerHTML = quizQuestions.map((_, i) =>
      `<div class="aimap-quiz-progress-dot ${i < quizStep ? 'done' : i === quizStep ? 'current' : ''}"></div>`
    ).join('');

    // Options
    const optionsEl = document.getElementById('aimap-quiz-options');
    optionsEl.innerHTML = (q.options || []).map(opt =>
      `<button class="aimap-quiz-option" data-value="${opt.value}">
        <span class="aimap-quiz-option-icon">${opt.icon || ''}</span>
        <span>${opt.label}</span>
      </button>`
    ).join('');

    optionsEl.querySelectorAll('.aimap-quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        quizAnswers[q.id] = btn.dataset.value;
        quizStep++;
        renderQuizStep();
      });
    });
  }

  function showQuizResults() {
    document.getElementById('aimap-quiz-step').style.display = 'none';
    document.getElementById('aimap-quiz-results').style.display = 'block';

    // Score services
    const scored = services.map(s => ({ service: s, score: scoreService(s, quizAnswers) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const medals = ['🥇', '🥈', '🥉'];
    const resultsEl = document.getElementById('aimap-quiz-results-list');
    resultsEl.innerHTML = scored.map((item, i) => {
      const s = item.service;
      const cat = categories[s.category] || {};
      return `<div class="aimap-quiz-result-card" data-id="${s.id}">
        <div class="aimap-quiz-result-medal">${medals[i]}</div>
        <div class="aimap-quiz-result-info">
          <h3>${s.name}</h3>
          <p>${s.provider} · ${cat.emoji || ''} ${cat.name || s.category}</p>
          <p>${s.description || ''}</p>
          <span class="aimap-quiz-result-score">${item.score} point match</span>
        </div>
      </div>`;
    }).join('');
  }

  function scoreService(s, answers) {
    let score = 0;

    // Primary need
    const needMap = { text: 'text_generation', code: 'code_generation', images: 'image_generation',
      documents: 'reasoning', voice: 'audio_speech', agents: 'function_calling',
      search: 'reasoning', video: 'video_generation' };
    const needKey = needMap[answers['primary-need']];
    if (needKey) {
      const val = s[needKey];
      if (typeof val === 'number') score += val * 4;
      else if (val === true) score += 16;
    }

    // Category bonus for need
    const catMap = { text: 'llm-platform', code: 'code-development', images: 'image-generation',
      documents: 'document-processing', voice: 'voice-audio', agents: 'agent-platform',
      search: 'search-knowledge', video: 'video-generation' };
    if (s.category === catMap[answers['primary-need']]) score += 10;

    // Cloud provider
    const provMap = { azure: 'integration_azure', aws: 'integration_aws', gcp: 'integration_gcp' };
    const provKey = provMap[answers['cloud-provider']];
    if (provKey && s[provKey]) score += 12;
    if (answers['cloud-provider'] === 'none') score += 3;

    // Budget
    if (answers.budget === 'free' && s.free_tier) score += 10;
    if (answers.budget === 'free' && s.pricing_model === 'free') score += 5;
    if (answers.budget === 'enterprise' && s.sla && s.sla !== 'N/A') score += 8;

    // Compliance
    if (answers.compliance === 'strict') {
      if (s.hipaa) score += 5;
      if (s.gdpr) score += 5;
      if (s.data_residency) score += 5;
    } else if (answers.compliance === 'basic') {
      if (s.soc2) score += 5;
      if (s.gdpr) score += 3;
    }

    // Technical level
    if (answers['technical-level'] === 'non-technical') {
      if (['subscription', 'free'].includes(s.pricing_model)) score += 6;
      if (s.category === 'agent-platform') score += 4;
    }
    if (answers['technical-level'] === 'developer') {
      if (s.function_calling) score += 4;
      if (s.fine_tuning) score += 3;
    }

    // Ecosystem
    const ecoMap = { m365: 'integration_m365', 'google-workspace': 'integration_gcp',
      github: 'integration_azure', 'aws-ecosystem': 'integration_aws' };
    const ecoKey = ecoMap[answers.ecosystem];
    if (ecoKey && s[ecoKey]) score += 8;

    // Data location
    if (answers['data-location'] !== 'anywhere' && s.data_residency) {
      const regionMap = { us: 'US', eu: 'EU', apac: ['Australia', 'Japan', 'Singapore'] };
      const needed = regionMap[answers['data-location']];
      if (needed && s.regions) {
        const regs = Array.isArray(needed) ? needed : [needed];
        if (regs.some(r => s.regions.includes(r))) score += 8;
      }
    }

    return score;
  }

  // ---- PRICING TABLE ----
  function renderPricingTable() {
    const tbody = document.getElementById('aimap-pricing-tbody');
    if (!tbody) return;

    const render = (freeOnly) => {
      let data = [...services];
      if (freeOnly) data = data.filter(s => s.free_tier);
      data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

      tbody.innerHTML = data.map(s => `<tr>
        <td><strong>${s.name}</strong></td>
        <td>${s.provider}</td>
        <td>${s.free_tier ? '<span class="price-free">✅ Yes</span>' : '❌ No'}</td>
        <td>${s.price_input || 'N/A'}</td>
        <td>${s.price_output || 'N/A'}</td>
        <td>${s.pricing_model || 'N/A'}</td>
        <td>${s.pricing_url ? `<a href="${s.pricing_url}" target="_blank" rel="noopener">Pricing →</a>` : ''}</td>
      </tr>`).join('');
    };

    render(false);

    // Free-only filter
    const freeCheck = document.getElementById('pricing-free-only');
    if (freeCheck) freeCheck.addEventListener('change', () => render(freeCheck.checked));

    // Sortable headers
    document.querySelectorAll('.aimap-pricing-table th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const key = th.dataset.sort;
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const idx = Array.from(th.parentNode.children).indexOf(th);
        const dir = th.classList.contains('sort-asc') ? -1 : 1;
        th.parentNode.querySelectorAll('th').forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
        th.classList.add(dir === 1 ? 'sort-asc' : 'sort-desc');
        rows.sort((a, b) => {
          const aText = a.children[idx]?.textContent || '';
          const bText = b.children[idx]?.textContent || '';
          return aText.localeCompare(bText) * dir;
        });
        rows.forEach(r => tbody.appendChild(r));
      });
    });
  }

  // ---- GLOSSARY ----
  function renderGlossary() {
    const glossary = [
      { term: 'LLM (Large Language Model)', def: 'A type of AI trained on massive amounts of text data. Think of it as a very advanced autocomplete that can write essays, answer questions, and generate code. Examples: GPT-4, Claude, Gemini.' },
      { term: 'Token', def: 'The unit AI models use to measure text. Roughly 1 token = ¾ of a word in English. "Hello world" = 2 tokens. Pricing is usually per million tokens.' },
      { term: 'Context Window', def: 'How much text an AI can "remember" in a single conversation. A 128K context window means it can process about 100,000 words at once — like reading a full novel.' },
      { term: 'RAG (Retrieval-Augmented Generation)', def: 'A technique where the AI searches your documents first, then generates an answer based on what it found. Like giving the AI a textbook before asking it a question.' },
      { term: 'Embedding', def: 'Converting text into numbers (vectors) that capture meaning. Used for semantic search — finding documents that are conceptually similar, not just keyword matches.' },
      { term: 'Fine-tuning', def: 'Customising a pre-trained model with your own data to make it better at a specific task. Like specialising a general doctor into a cardiologist.' },
      { term: 'Function Calling / Tool Use', def: 'An AI model\'s ability to call external tools, APIs, or code. Instead of just generating text, it can take actions — check weather, query databases, send emails.' },
      { term: 'Multimodal', def: 'AI that can understand and generate multiple types of content — text, images, audio, video. A multimodal model can describe a photo or generate an image from text.' },
      { term: 'Inference', def: 'When an AI model processes your input and generates a response. Every time you send a message to ChatGPT, that\'s inference. You\'re charged per inference (per token).' },
      { term: 'Prompt', def: 'The instruction you give an AI model. A good prompt includes context, role, action, format, and scope. Better prompts = better AI responses.' },
      { term: 'Agent', def: 'An AI system that can plan, reason, and take actions autonomously. Unlike a chatbot that just responds, an agent can break down tasks, use tools, and work through multi-step processes.' },
      { term: 'Orchestration', def: 'Coordinating multiple AI models, tools, and data sources to complete complex tasks. Like a conductor managing an orchestra — each instrument plays its part.' },
      { term: 'Guardrails', def: 'Safety mechanisms that prevent AI from generating harmful, biased, or off-topic content. Think of guardrails on a highway — they keep the AI on the safe path.' },
      { term: 'Data Residency', def: 'The requirement that your data must be stored and processed in a specific geographic region. Important for compliance (GDPR requires EU data to stay in the EU).' },
      { term: 'SLA (Service Level Agreement)', def: 'A guarantee of uptime and availability. "99.9% SLA" means the service promises to be available 99.9% of the time (about 8.7 hours of downtime per year max).' },
      { term: 'Pay-per-use', def: 'Pricing model where you only pay for what you consume — per token, per API call, per page processed. No monthly commitment. Great for unpredictable workloads.' },
      { term: 'Reasoning', def: 'An AI model\'s ability to think step-by-step, solve complex problems, and show its work. Models like o3 and DeepSeek-R1 specialise in chain-of-thought reasoning.' },
      { term: 'Grounding', def: 'Connecting AI responses to real data sources so it gives factual, sourced answers instead of making things up. RAG is one way to achieve grounding.' },
      { term: 'Hallucination', def: 'When an AI confidently generates information that\'s incorrect or completely made up. Grounding, RAG, and citations help reduce hallucinations.' },
      { term: 'Vector Database', def: 'A database optimised for storing and searching embeddings (vectors). Used in RAG systems to quickly find relevant documents. Examples: Azure AI Search, Pinecone, Weaviate.' },
    ];

    const listEl = document.getElementById('aimap-glossary-list');
    const searchEl = document.getElementById('aimap-glossary-search');
    if (!listEl) return;

    const render = (filter) => {
      const q = (filter || '').toLowerCase();
      const filtered = q ? glossary.filter(g => g.term.toLowerCase().includes(q) || g.def.toLowerCase().includes(q)) : glossary;
      listEl.innerHTML = filtered.map(g =>
        `<div class="aimap-glossary-item">
          <div class="aimap-glossary-term">${g.term}</div>
          <div class="aimap-glossary-def">${g.def}</div>
        </div>`
      ).join('') || '<p style="text-align:center;color:#999;padding:2rem;">No matching terms found.</p>';
    };

    render('');
    if (searchEl) {
      let timeout;
      searchEl.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => render(searchEl.value), 200);
      });
    }
  }

  // ---- URL STATE ----
  function updateURL() {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    Object.entries(activeFilters).forEach(([key, vals]) => {
      if (vals.length) params.set(key, vals.join(','));
    });
    if (compareSet.size) params.set('compare', [...compareSet].join(','));
    const tab = document.querySelector('.aimap-tab.active');
    if (tab && tab.dataset.tab !== 'explore') params.set('tab', tab.dataset.tab);

    const newURL = params.toString() ? `${location.pathname}?${params}` : location.pathname;
    history.replaceState(null, '', newURL);
  }

  function restoreFromURL() {
    const params = new URLSearchParams(location.search);

    // Tab
    const tab = params.get('tab');
    if (tab) switchToTab(tab);

    // Search
    const q = params.get('q');
    if (q) {
      searchQuery = q;
      const input = document.getElementById('aimap-search');
      if (input) input.value = q;
    }

    // Filters
    Object.keys(activeFilters).forEach(key => {
      const val = params.get(key);
      if (val) {
        activeFilters[key] = val.split(',');
        // Check corresponding checkboxes
        const containerMap = { provider: 'filter-provider', category: 'filter-category', pricing: 'filter-pricing',
          capabilities: 'filter-capabilities', enterprise: 'filter-enterprise', integration: 'filter-integration' };
        const container = document.getElementById(containerMap[key]);
        if (container) {
          activeFilters[key].forEach(v => {
            const cb = container.querySelector(`input[value="${v}"]`);
            if (cb) cb.checked = true;
          });
        }
      }
    });

    // Compare
    const compare = params.get('compare');
    if (compare) {
      compare.split(',').forEach(id => compareSet.add(id));
      updateCompareBtn();
      if (tab === 'compare') setTimeout(() => renderCompareTable(), 100);
    }

    renderCards();
  }

})();
