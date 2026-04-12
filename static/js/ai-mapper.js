/* ============================================================
   AI Service Mapper v2 — Full Interactive Engine
   Features: scenarios, heatmap, modal, favourites, filter counts,
   quiz reasoning, presets, cost estimator, glossary x-links,
   changelog, status badges, last-updated, alternatives
   ============================================================ */

(function() {
  'use strict';

  // ─── XSS Prevention ───
  function esc(s) {
    var e = document.createElement('span');
    e.textContent = s || '';
    return e.innerHTML;
  }

  const DATA = window.__aimapData;
  if (!DATA) return;

  const services = DATA.services || [];
  const categories = DATA.categories || {};
  const quizData = DATA.quiz || {};
  const quizQuestions = quizData.questions || [];
  const changelogData = DATA.changelog || {};
  const changelogEntries = changelogData.entries || [];

  // State
  let compareSet = new Set();
  let activeFilters = { provider: [], category: [], pricing: [], capabilities: [], enterprise: [], integration: [], status: [] };
  let searchQuery = '';
  let sortBy = 'name';
  let quizAnswers = {};
  let quizStep = 0;
  let favourites = loadFavourites();
  let currentView = 'cards';

  // Glossary terms for cross-linking (#14)
  const glossaryTerms = [
    { term: 'LLM', full: 'Large Language Model', def: 'A type of AI trained on massive amounts of text. Think of it as a very advanced autocomplete that can write, answer questions, and code. Examples: GPT-4, Claude, Gemini.' },
    { term: 'Token', full: 'Token', def: 'The unit AI models use to measure text. Roughly 1 token = 3/4 of a word. "Hello world" = 2 tokens. Pricing is usually per million tokens.' },
    { term: 'Context Window', full: 'Context Window', def: 'How much text an AI can "remember" in a conversation. 128K context = ~100,000 words = a full novel.' },
    { term: 'RAG', full: 'Retrieval-Augmented Generation', def: 'The AI searches your documents first, then generates an answer based on what it found. Like giving the AI a textbook before asking a question.' },
    { term: 'Embedding', full: 'Embedding', def: 'Converting text into numbers (vectors) that capture meaning. Used for semantic search — finding documents that are conceptually similar.' },
    { term: 'Fine-tuning', full: 'Fine-tuning', def: 'Customising a pre-trained model with your own data for a specific task. Like specialising a GP into a cardiologist.' },
    { term: 'Function Calling', full: 'Function Calling / Tool Use', def: "An AI model's ability to call external tools and APIs. Instead of just generating text, it can check weather, query databases, send emails." },
    { term: 'Multimodal', full: 'Multimodal', def: 'AI that understands multiple content types — text, images, audio, video. Can describe photos or generate images from text.' },
    { term: 'Inference', full: 'Inference', def: "When an AI processes your input and generates a response. Every ChatGPT message is inference. You're charged per inference." },
    { term: 'Prompt', full: 'Prompt', def: 'The instruction you give an AI. A good prompt includes context, role, action, format, and scope. Better prompts = better responses.' },
    { term: 'Agent', full: 'AI Agent', def: 'An AI system that plans, reasons, and acts autonomously. Unlike a chatbot, an agent breaks down tasks and uses tools to complete them.' },
    { term: 'Orchestration', full: 'Orchestration', def: 'Coordinating multiple AI models and tools to complete complex tasks. Like a conductor managing an orchestra.' },
    { term: 'Guardrails', full: 'Guardrails', def: 'Safety mechanisms preventing harmful or off-topic AI outputs. Like guardrails on a highway — keeps AI on the safe path.' },
    { term: 'Data Residency', full: 'Data Residency', def: 'Requirement that data stays in a specific region. GDPR requires EU data to stay in the EU.' },
    { term: 'SLA', full: 'Service Level Agreement', def: 'Uptime guarantee. 99.9% SLA = max ~8.7 hours downtime per year.' },
    { term: 'Pay-per-use', full: 'Pay-per-use', def: 'Only pay for what you consume — per token, per API call, per page. No monthly commitment.' },
    { term: 'Reasoning', full: 'Reasoning', def: "An AI's ability to think step-by-step and solve complex problems. Models like o3 and DeepSeek-R1 specialise in chain-of-thought reasoning." },
    { term: 'Grounding', full: 'Grounding', def: 'Connecting AI responses to real data sources for factual, sourced answers instead of making things up.' },
    { term: 'Hallucination', full: 'Hallucination', def: 'When AI confidently generates incorrect information. Grounding, RAG, and citations help reduce this.' },
    { term: 'Vector Database', full: 'Vector Database', def: 'Database for storing and searching embeddings. Used in RAG to find relevant documents. Examples: Azure AI Search, Pinecone.' },
  ];

  // Comparison presets (#9)
  const PRESETS = {
    'big3-llm': ['azure-openai', 'aws-bedrock', 'google-vertex-ai'],
    'agents': ['copilot-studio', 'azure-ai-foundry', 'amazon-q'],
    'coding': ['github-copilot', 'amazon-q', 'openai-api'],
    'consumer-chat': ['chatgpt', 'claude-ai', 'google-gemini', 'perplexity'],
    'documents': ['azure-ai-document-intelligence', 'amazon-textract'],
  };

  // Scenario filters (#1)
  const SCENARIOS = {
    enterprise: { capabilities: ['text_generation', 'reasoning'], enterprise: ['soc2', 'data_residency'] },
    coding: { capabilities: ['code_generation'] },
    images: { capabilities: ['image_generation'] },
    free: { pricing: ['free'] },
    agents: { category: ['agent-platform'] },
    voice: { capabilities: ['audio_speech'] },
    documents: { category: ['document-processing'] },
  };

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
    renderChangelog();
    setupScenarios();
    setupViewToggle();
    setupModal();
    setupPresets();
    setupCostEstimator();
    renderFavBar();
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
    const tab = document.querySelector('.aimap-tab[data-tab="' + tabName + '"]');
    if (tab) tab.click();
  }

  // ---- SCENARIOS (#1) ----
  function setupScenarios() {
    document.querySelectorAll('.aimap-scenario-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const scenario = SCENARIOS[btn.dataset.scenario];
        if (!scenario) return;
        clearAllFilters(true);
        // Apply scenario filters
        Object.entries(scenario).forEach(([key, vals]) => {
          activeFilters[key] = vals;
          const containerMap = { provider: 'filter-provider', category: 'filter-category', pricing: 'filter-pricing',
            capabilities: 'filter-capabilities', enterprise: 'filter-enterprise', integration: 'filter-integration', status: 'filter-status' };
          const container = document.getElementById(containerMap[key]);
          if (container) vals.forEach(v => { const cb = container.querySelector('input[value="' + v + '"]'); if (cb) cb.checked = true; });
        });
        // Highlight active scenario
        document.querySelectorAll('.aimap-scenario-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderCards();
        updateURL();
      });
    });
  }

  // ---- VIEW TOGGLE (#7 heatmap) ----
  function setupViewToggle() {
    document.querySelectorAll('.aimap-view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.aimap-view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentView = btn.dataset.view;
        document.getElementById('aimap-grid').style.display = currentView === 'cards' ? '' : 'none';
        document.getElementById('aimap-heatmap').style.display = currentView === 'heatmap' ? '' : 'none';
        if (currentView === 'heatmap') renderHeatmap();
      });
    });
  }

  function renderHeatmap() {
    const container = document.getElementById('aimap-heatmap');
    if (!container) return;
    const filtered = getFilteredServices().sort((a,b) => (a.name||'').localeCompare(b.name||''));
    const caps = ['text_generation','code_generation','image_generation','audio_speech','video_generation','reasoning'];
    const capLabels = ['💬 Text','💻 Code','🎨 Image','🎙️ Audio','🎬 Video','🧠 Reason'];

    let html = '<div class="aimap-heatmap-scroll"><table class="aimap-heatmap-table"><thead><tr><th>Service</th><th>Provider</th>';
    capLabels.forEach(l => html += '<th>' + l + '</th>');
    html += '<th>Free</th><th>Multimodal</th></tr></thead><tbody>';

    filtered.forEach(s => {
      html += '<tr class="aimap-heatmap-row" data-id="' + s.id + '">';
      html += '<td class="aimap-hm-name">' + s.name + '</td>';
      html += '<td class="aimap-hm-provider">' + s.provider + '</td>';
      caps.forEach(cap => {
        const v = s[cap] || 0;
        const cls = v >= 4 ? 'aimap-hm-high' : v >= 2 ? 'aimap-hm-med' : v > 0 ? 'aimap-hm-low' : 'aimap-hm-none';
        html += '<td class="aimap-hm-cell ' + cls + '">' + (v || '—') + '</td>';
      });
      html += '<td class="aimap-hm-cell ' + (s.free_tier ? 'aimap-hm-high' : 'aimap-hm-none') + '">' + (s.free_tier ? '✅' : '—') + '</td>';
      html += '<td class="aimap-hm-cell ' + (s.multimodal ? 'aimap-hm-med' : 'aimap-hm-none') + '">' + (s.multimodal ? '✅' : '—') + '</td>';
      html += '</tr>';
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;

    // Click row to open modal
    container.querySelectorAll('.aimap-heatmap-row').forEach(row => {
      row.style.cursor = 'pointer';
      row.addEventListener('click', () => openModal(row.dataset.id));
    });
  }

  // ---- PROVIDER/CATEGORY FILTERS with counts (#6) ----
  function buildProviderFilters() {
    const providers = [...new Set(services.map(s => s.provider))].sort();
    const container = document.getElementById('filter-provider');
    if (!container) return;
    container.innerHTML = providers.map(p => {
      const count = services.filter(s => s.provider === p).length;
      return '<label class="aimap-filter-check"><input type="checkbox" value="' + p + '"> ' + esc(p) + ' <span class="aimap-filter-count">(' + count + ')</span></label>';
    }).join('');
  }

  function buildCategoryFilters() {
    const container = document.getElementById('filter-category');
    if (!container) return;
    const catEntries = Object.entries(categories).sort((a,b) => (a[1].order||99) - (b[1].order||99));
    container.innerHTML = catEntries.map(function(entry) {
      var id = entry[0], cat = entry[1];
      var count = services.filter(function(s) { return s.category === id; }).length;
      return '<label class="aimap-filter-check"><input type="checkbox" value="' + id + '"> ' + cat.emoji + ' ' + esc(cat.name) + ' <span class="aimap-filter-count">(' + count + ')</span></label>';
    }).join('');
  }

  // ---- CARDS with favourites, status badges, last_updated ----
  function renderCards() {
    const grid = document.getElementById('aimap-grid');
    const noResults = document.getElementById('aimap-no-results');
    const countEl = document.getElementById('aimap-count');
    if (!grid) return;

    var filtered = getFilteredServices();
    filtered.sort(function(a, b) {
      if (sortBy === 'provider') return (a.provider || '').localeCompare(b.provider || '');
      if (sortBy === 'category') return (a.category || '').localeCompare(b.category || '');
      return (a.name || '').localeCompare(b.name || '');
    });

    if (countEl) countEl.textContent = filtered.length + ' service' + (filtered.length !== 1 ? 's' : '');

    if (filtered.length === 0) {
      grid.innerHTML = '';
      if (noResults) noResults.style.display = 'block';
      return;
    }
    if (noResults) noResults.style.display = 'none';

    grid.innerHTML = filtered.map(function(s) { return cardHTML(s); }).join('');

    // Attach events
    grid.querySelectorAll('.aimap-card-compare').forEach(function(cb) {
      cb.checked = compareSet.has(cb.dataset.id);
      cb.addEventListener('change', function() {
        if (cb.checked) { if (compareSet.size >= 4) { cb.checked = false; return; } compareSet.add(cb.dataset.id); }
        else { compareSet.delete(cb.dataset.id); }
        updateCompareBtn();
      });
    });

    // Card click -> modal (#2)
    grid.querySelectorAll('.aimap-card-name-link').forEach(function(link) {
      link.addEventListener('click', function(e) { e.preventDefault(); openModal(link.dataset.id); });
    });

    // Favourite buttons (#5)
    grid.querySelectorAll('.aimap-fav-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleFavourite(btn.dataset.id);
        btn.classList.toggle('active');
        btn.textContent = favourites.has(btn.dataset.id) ? '★' : '☆';
        renderFavBar();
      });
    });

    if (currentView === 'heatmap') renderHeatmap();
  }

  function cardHTML(s) {
    var cat = categories[s.category] || {};
    var catColor = cat.colour || '#8B5CF6';
    var isFav = favourites.has(s.id);

    // Status badge (#10)
    var statusBadge = '';
    if (s.status === 'preview') statusBadge = '<span class="aimap-status-badge preview">🧪 Preview</span>';
    else if (s.status === 'deprecated') statusBadge = '<span class="aimap-status-badge deprecated">⚠️ Deprecated</span>';

    // Capability badges
    var caps = [
      { label: '💬', val: s.text_generation }, { label: '💻', val: s.code_generation },
      { label: '🎨', val: s.image_generation }, { label: '🎙️', val: s.audio_speech },
      { label: '🎬', val: s.video_generation }, { label: '🧠', val: s.reasoning },
    ].filter(function(c) { return c.val > 0; });

    var capsHTML = caps.map(function(c) {
      return '<span class="aimap-cap-badge' + (c.val >= 4 ? ' strong' : '') + '" title="' + c.val + '/5">' + c.label + '<span class="aimap-cap-dots">' + '●'.repeat(c.val) + '○'.repeat(5-c.val) + '</span></span>';
    }).join('');

    var bestHTML = (s.best_for || []).map(function(b) { return '<span class="aimap-best-tag">' + esc(b) + '</span>'; }).join('');

    var priceClass = 'aimap-paid', priceText = esc(s.price_note || s.pricing_model || '');
    if (s.free_tier && s.pricing_model === 'free') { priceClass = 'aimap-free'; priceText = '🆓 Free'; }
    else if (s.free_tier) { priceClass = 'aimap-free'; priceText = '🆓 Free tier'; }
    else if (s.pricing_model === 'subscription') { priceClass = 'aimap-sub'; }

    // Last updated (#8)
    var updatedHTML = s.last_updated ? '<span class="aimap-card-updated" title="Data last verified">✓ ' + esc(s.last_updated) + '</span>' : '';

    return '<div class="aimap-card" style="--card-cat-color:' + catColor + '">' +
      '<div class="aimap-card-top">' +
        '<div class="aimap-card-identity">' +
          '<span class="aimap-card-provider">' + esc(s.provider) + '</span>' +
          statusBadge +
        '</div>' +
        '<div class="aimap-card-actions">' +
          '<button class="aimap-fav-btn' + (isFav ? ' active' : '') + '" data-id="' + s.id + '" title="' + (isFav ? 'Remove from' : 'Add to') + ' shortlist">' + (isFav ? '★' : '☆') + '</button>' +
          '<input type="checkbox" class="aimap-card-compare" data-id="' + s.id + '" title="Add to compare" aria-label="Compare ' + esc(s.name) + '">' +
        '</div>' +
      '</div>' +
      '<a href="#" class="aimap-card-name-link" data-id="' + s.id + '"><h3 class="aimap-card-name">' + esc(s.name) + '</h3></a>' +
      '<span class="aimap-card-category">' + (cat.emoji || '') + ' ' + esc(cat.name || s.category) + '</span>' +
      '<p class="aimap-card-desc">' + esc(s.description || '') + '</p>' +
      '<div class="aimap-card-caps">' + capsHTML + '</div>' +
      '<div class="aimap-card-best">' + bestHTML + '</div>' +
      '<div class="aimap-card-footer">' +
        '<span class="aimap-card-price ' + priceClass + '">' + priceText + '</span>' +
        updatedHTML +
      '</div>' +
    '</div>';
  }

  // ---- DETAIL MODAL (#2) with alternatives (#4) ----
  function setupModal() {
    var overlay = document.getElementById('aimap-modal-overlay');
    var closeBtn = document.getElementById('aimap-modal-close');
    if (!overlay || !closeBtn) return;
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });
  }

  function openModal(serviceId) {
    var s = services.find(function(x) { return x.id === serviceId; });
    if (!s) return;
    var cat = categories[s.category] || {};
    var content = document.getElementById('aimap-modal-content');
    var overlay = document.getElementById('aimap-modal-overlay');

    var caps = [
      { label: 'Text Generation', val: s.text_generation }, { label: 'Code Generation', val: s.code_generation },
      { label: 'Image Generation', val: s.image_generation }, { label: 'Voice / Audio', val: s.audio_speech },
      { label: 'Video Generation', val: s.video_generation }, { label: 'Reasoning', val: s.reasoning },
    ];

    var capsHTML = '<div class="aimap-modal-caps">' + caps.map(function(c) {
      return '<div class="aimap-modal-cap-row"><span class="aimap-modal-cap-label">' + c.label + '</span>' +
        '<div class="aimap-modal-cap-bar"><div class="aimap-modal-cap-fill" style="width:' + ((c.val||0)*20) + '%;background:' + (c.val >= 4 ? '#8B5CF6' : c.val >= 2 ? '#fbbf24' : '#666') + '"></div></div>' +
        '<span class="aimap-modal-cap-val">' + (c.val||0) + '/5</span></div>';
    }).join('') + '</div>';

    var features = [
      { label: 'Multimodal', val: s.multimodal }, { label: 'Fine-tuning', val: s.fine_tuning },
      { label: 'Function Calling', val: s.function_calling }, { label: 'Data Residency', val: s.data_residency },
      { label: 'SOC 2', val: s.soc2 }, { label: 'HIPAA', val: s.hipaa },
      { label: 'GDPR', val: s.gdpr }, { label: 'Private Networking', val: s.private_networking },
    ];
    var featHTML = '<div class="aimap-modal-features">' + features.map(function(f) {
      return '<span class="aimap-modal-feat ' + (f.val ? 'yes' : 'no') + '">' + (f.val ? '✅' : '❌') + ' ' + f.label + '</span>';
    }).join('') + '</div>';

    // Alternatives (#4)
    var altHTML = '';
    if (s.compare_with && s.compare_with.length) {
      var alts = s.compare_with.map(function(id) { return services.find(function(x) { return x.id === id; }); }).filter(Boolean);
      if (alts.length) {
        altHTML = '<div class="aimap-modal-alts"><h4>Similar Services</h4><div class="aimap-modal-alt-cards">' +
          alts.map(function(a) {
            var aCat = categories[a.category] || {};
            return '<div class="aimap-modal-alt-card" data-id="' + a.id + '">' +
              '<strong>' + esc(a.name) + '</strong><br><span style="color:#999;font-size:0.8rem">' + esc(a.provider) + ' · ' + (aCat.emoji||'') + ' ' + esc(aCat.name||'') + '</span></div>';
          }).join('') + '</div></div>';
      }
    }

    var statusBadge = '';
    if (s.status === 'preview') statusBadge = ' <span class="aimap-status-badge preview">🧪 Preview</span>';
    else if (s.status === 'deprecated') statusBadge = ' <span class="aimap-status-badge deprecated">⚠️ Deprecated</span>';

    content.innerHTML =
      '<div class="aimap-modal-header">' +
        '<span class="aimap-card-provider">' + esc(s.provider) + '</span>' + statusBadge +
        '<span class="aimap-card-category">' + (cat.emoji||'') + ' ' + esc(cat.name||'') + '</span>' +
        (s.last_updated ? '<span class="aimap-card-updated">✓ Verified ' + esc(s.last_updated) + '</span>' : '') +
      '</div>' +
      '<h2>' + esc(s.name) + '</h2>' +
      '<p style="color:#ccc;line-height:1.6">' + esc(s.description||'') + '</p>' +
      capsHTML +
      '<div class="aimap-modal-section"><h4>💰 Pricing</h4>' +
        '<p>' + esc(s.price_note || s.pricing_model || 'N/A') + '</p>' +
        (s.free_tier ? '<p style="color:#4ade80">🆓 ' + esc(s.free_tier_detail || 'Free tier available') + '</p>' : '') +
        (s.pricing_url ? '<a href="' + s.pricing_url + '" target="_blank" rel="noopener noreferrer" class="aimap-card-link">View pricing page →</a>' : '') +
      '</div>' +
      '<div class="aimap-modal-section"><h4>🔧 Features</h4>' + featHTML + '</div>' +
      (s.context_window ? '<div class="aimap-modal-section"><h4>📏 Context Window</h4><p>' + esc(s.context_window) + '</p></div>' : '') +
      (s.regions && s.regions.length ? '<div class="aimap-modal-section"><h4>🌍 Available Regions</h4><p>' + (s.regions||[]).map(esc).join(', ') + '</p></div>' : '') +
      (s.sla ? '<div class="aimap-modal-section"><h4>📊 SLA</h4><p>' + esc(s.sla) + '</p></div>' : '') +
      '<div class="aimap-modal-section"><h4>🏷️ Best For</h4><div class="aimap-card-best">' + (s.best_for||[]).map(function(b) { return '<span class="aimap-best-tag">' + esc(b) + '</span>'; }).join('') + '</div></div>' +
      '<div class="aimap-modal-section"><h4>🎯 Use Cases</h4><div class="aimap-card-best">' + (s.use_cases||[]).map(function(u) { return '<span class="aimap-best-tag">' + esc(u.replace(/-/g,' ')) + '</span>'; }).join('') + '</div></div>' +
      altHTML +
      '<div class="aimap-modal-actions">' +
        '<a href="' + (s.url||'#') + '" target="_blank" rel="noopener noreferrer" class="aimap-btn aimap-btn-primary">Visit ' + esc(s.name) + ' →</a>' +
        (s.docs_url ? '<a href="' + s.docs_url + '" target="_blank" rel="noopener noreferrer" class="aimap-btn">📄 Documentation</a>' : '') +
      '</div>';

    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Alt card clicks
    content.querySelectorAll('.aimap-modal-alt-card').forEach(function(card) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', function() { openModal(card.dataset.id); });
    });
  }

  function closeModal() {
    var overlay = document.getElementById('aimap-modal-overlay');
    if (overlay) overlay.style.display = 'none';
    document.body.style.overflow = '';
  }

  // ---- FAVOURITES (#5) ----
  function loadFavourites() {
    try { return new Set(JSON.parse(localStorage.getItem('aimap_favourites') || '[]')); }
    catch(e) { return new Set(); }
  }
  function saveFavourites() {
    localStorage.setItem('aimap_favourites', JSON.stringify([...favourites]));
  }
  function toggleFavourite(id) {
    if (favourites.has(id)) favourites.delete(id); else favourites.add(id);
    saveFavourites();
  }
  function renderFavBar() {
    var bar = document.getElementById('aimap-fav-bar');
    var items = document.getElementById('aimap-fav-bar-items');
    if (!bar || !items) return;
    if (favourites.size === 0) { bar.style.display = 'none'; return; }
    bar.style.display = 'flex';
    items.innerHTML = [...favourites].map(function(id) {
      var s = services.find(function(x) { return x.id === id; });
      if (!s) return '';
      return '<span class="aimap-fav-chip" data-id="' + id + '">' + s.name + ' <button class="aimap-fav-chip-x" data-id="' + id + '">×</button></span>';
    }).join('');
    items.querySelectorAll('.aimap-fav-chip-x').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleFavourite(btn.dataset.id);
        renderFavBar();
        renderCards();
      });
    });
    items.querySelectorAll('.aimap-fav-chip').forEach(function(chip) {
      chip.addEventListener('click', function() { openModal(chip.dataset.id); });
    });
    var clearBtn = document.getElementById('aimap-fav-clear');
    if (clearBtn) clearBtn.onclick = function() { favourites.clear(); saveFavourites(); renderFavBar(); renderCards(); };
  }

  // ---- FILTERING ----
  function getFilteredServices() {
    return services.filter(function(s) {
      if (searchQuery) {
        var q = searchQuery.toLowerCase();
        var haystack = (s.name + ' ' + s.provider + ' ' + s.description + ' ' + (s.tags||[]).join(' ') + ' ' + (s.use_cases||[]).join(' ') + ' ' + (s.best_for||[]).join(' ')).toLowerCase();
        if (haystack.indexOf(q) === -1) return false;
      }
      if (activeFilters.provider.length && activeFilters.provider.indexOf(s.provider) === -1) return false;
      if (activeFilters.category.length && activeFilters.category.indexOf(s.category) === -1) return false;
      if (activeFilters.pricing.length) {
        var matches = activeFilters.pricing.some(function(p) { return p === 'free' ? s.free_tier : s.pricing_model === p; });
        if (!matches) return false;
      }
      if (activeFilters.capabilities.length) {
        if (!activeFilters.capabilities.every(function(cap) { return (s[cap]||0) >= 3; })) return false;
      }
      if (activeFilters.enterprise.length) {
        if (!activeFilters.enterprise.every(function(e) { return s[e]; })) return false;
      }
      if (activeFilters.integration.length) {
        if (!activeFilters.integration.some(function(i) { return s[i]; })) return false;
      }
      if (activeFilters.status.length) {
        if (activeFilters.status.indexOf(s.status || 'ga') === -1) return false;
      }
      return true;
    });
  }

  function setupSearch() {
    var input = document.getElementById('aimap-search');
    if (!input) return;
    var timeout;
    input.addEventListener('input', function() {
      clearTimeout(timeout);
      timeout = setTimeout(function() { searchQuery = input.value.trim(); renderCards(); updateURL(); }, 200);
    });
  }

  function setupFilterListeners() {
    var filterMap = {
      'filter-provider': 'provider', 'filter-category': 'category', 'filter-pricing': 'pricing',
      'filter-capabilities': 'capabilities', 'filter-enterprise': 'enterprise', 'filter-integration': 'integration', 'filter-status': 'status'
    };
    Object.keys(filterMap).forEach(function(containerId) {
      var filterKey = filterMap[containerId];
      var container = document.getElementById(containerId);
      if (!container) return;
      container.addEventListener('change', function() {
        activeFilters[filterKey] = Array.from(container.querySelectorAll('input:checked')).map(function(i) { return i.value; });
        // Clear scenario highlight
        document.querySelectorAll('.aimap-scenario-btn').forEach(function(b) { b.classList.remove('active'); });
        renderCards();
        updateURL();
      });
    });
    [document.getElementById('aimap-clear-filters'), document.getElementById('aimap-clear-link')].forEach(function(el) {
      if (el) el.addEventListener('click', function() { clearAllFilters(); });
    });
  }

  function clearAllFilters(silent) {
    document.querySelectorAll('.aimap-filters input[type="checkbox"]').forEach(function(cb) { cb.checked = false; });
    var searchInput = document.getElementById('aimap-search');
    if (searchInput) searchInput.value = '';
    searchQuery = '';
    Object.keys(activeFilters).forEach(function(k) { activeFilters[k] = []; });
    document.querySelectorAll('.aimap-scenario-btn').forEach(function(b) { b.classList.remove('active'); });
    if (!silent) { renderCards(); updateURL(); }
  }

  function setupSort() {
    var select = document.getElementById('aimap-sort-select');
    if (!select) return;
    select.addEventListener('change', function() { sortBy = select.value; renderCards(); });
  }

  function setupMobileFilterToggle() {
    var toggle = document.getElementById('aimap-mobile-filter-toggle');
    var filters = document.querySelector('.aimap-filters');
    if (!toggle || !filters) return;
    toggle.addEventListener('click', function() { filters.classList.toggle('open'); });
  }

  // ---- COMPARE with PRESETS (#9) ----
  function updateCompareBtn() {
    var btn = document.getElementById('aimap-open-compare');
    var count = document.getElementById('aimap-compare-count');
    if (btn) btn.disabled = compareSet.size < 2;
    if (count) count.textContent = compareSet.size;
  }

  function setupCompareBtn() {
    var btn = document.getElementById('aimap-open-compare');
    if (btn) btn.addEventListener('click', function() { if (compareSet.size >= 2) switchToTab('compare'); });
  }

  function setupComparePickers() {
    var container = document.getElementById('aimap-compare-pickers');
    if (!container) return;
    for (var i = 0; i < 4; i++) {
      var sel = document.createElement('select');
      sel.innerHTML = '<option value="">Select service ' + (i+1) + '...</option>' + services.map(function(s) { return '<option value="' + s.id + '">' + s.name + '</option>'; }).join('');
      sel.addEventListener('change', function() { syncPickersToCompareSet(); renderCompareTable(); });
      container.appendChild(sel);
    }
  }

  function setupPresets() {
    document.querySelectorAll('.aimap-preset-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var ids = PRESETS[btn.dataset.preset];
        if (!ids) return;
        compareSet.clear();
        ids.forEach(function(id) { compareSet.add(id); });
        updateCompareBtn();
        renderCompareTable();
      });
    });
  }

  function syncPickersToCompareSet() {
    var pickers = document.querySelectorAll('#aimap-compare-pickers select');
    compareSet.clear();
    pickers.forEach(function(sel) { if (sel.value) compareSet.add(sel.value); });
    updateCompareBtn();
    document.querySelectorAll('.aimap-card-compare').forEach(function(cb) { cb.checked = compareSet.has(cb.dataset.id); });
  }

  function renderCompareTable() {
    var wrap = document.getElementById('aimap-compare-table-wrap');
    var empty = document.getElementById('aimap-compare-empty');
    var actions = document.getElementById('aimap-compare-actions');
    if (!wrap) return;

    var pickers = document.querySelectorAll('#aimap-compare-pickers select');
    var ids = [...compareSet];
    pickers.forEach(function(sel, i) { sel.value = ids[i] || ''; });

    if (compareSet.size < 2) {
      if (empty) empty.style.display = 'block';
      if (actions) actions.style.display = 'none';
      var oldTable = wrap.querySelector('.aimap-compare-table');
      if (oldTable) oldTable.remove();
      return;
    }
    if (empty) empty.style.display = 'none';
    if (actions) actions.style.display = 'flex';

    var selected = ids.map(function(id) { return services.find(function(s) { return s.id === id; }); }).filter(Boolean);

    var rows = [
      { label: 'Provider', key: function(s) { return s.provider; } },
      { label: 'Status', key: function(s) { var st = s.status || 'ga'; return st === 'ga' ? '✅ GA' : st === 'preview' ? '🧪 Preview' : '⚠️ ' + st; } },
      { label: 'Pricing Model', key: function(s) { return s.pricing_model || 'N/A'; } },
      { label: 'Free Tier', key: function(s) { return s.free_tier ? '✅ ' + (s.free_tier_detail || '') : '❌'; } },
      { label: 'Input / 1M tokens', key: function(s) { return s.price_input || 'N/A'; } },
      { label: 'Output / 1M tokens', key: function(s) { return s.price_output || 'N/A'; } },
      { label: 'Text Generation', key: function(s) { return capBar(s.text_generation); } },
      { label: 'Code Generation', key: function(s) { return capBar(s.code_generation); } },
      { label: 'Image Generation', key: function(s) { return capBar(s.image_generation); } },
      { label: 'Voice / Audio', key: function(s) { return capBar(s.audio_speech); } },
      { label: 'Video', key: function(s) { return capBar(s.video_generation); } },
      { label: 'Reasoning', key: function(s) { return capBar(s.reasoning); } },
      { label: 'Context Window', key: function(s) { return s.context_window || 'N/A'; } },
      { label: 'Multimodal', key: function(s) { return s.multimodal ? '✅' : '❌'; } },
      { label: 'Fine-tuning', key: function(s) { return s.fine_tuning ? '✅' : '❌'; } },
      { label: 'Function Calling', key: function(s) { return s.function_calling ? '✅' : '❌'; } },
      { label: 'Data Residency', key: function(s) { return s.data_residency ? '✅ ' + (s.regions||[]).join(', ') : '❌'; } },
      { label: 'SOC 2 / HIPAA / GDPR', key: function(s) { return [s.soc2?'SOC2':'', s.hipaa?'HIPAA':'', s.gdpr?'GDPR':''].filter(Boolean).join(', ') || '❌ None'; } },
      { label: 'Private Networking', key: function(s) { return s.private_networking ? '✅' : '❌'; } },
      { label: 'SLA', key: function(s) { return s.sla || 'N/A'; } },
      { label: 'M365', key: function(s) { return s.integration_m365 ? '✅' : '❌'; } },
      { label: 'Azure', key: function(s) { return s.integration_azure ? '✅' : '❌'; } },
      { label: 'AWS', key: function(s) { return s.integration_aws ? '✅' : '❌'; } },
      { label: 'GCP', key: function(s) { return s.integration_gcp ? '✅' : '❌'; } },
      { label: 'Best For', key: function(s) { return (s.best_for||[]).join(', '); } },
    ];

    var html = '<table class="aimap-compare-table"><thead><tr><th></th>' + selected.map(function(s) { return '<th>' + s.name + '</th>'; }).join('') + '</tr></thead><tbody>';
    rows.forEach(function(row) {
      var vals = selected.map(function(s) { return row.key(s); });
      var allSame = vals.every(function(v) { return v === vals[0]; });
      html += '<tr><th>' + row.label + '</th>' + vals.map(function(v) { return '<td' + (allSame ? '' : ' class="aimap-diff-highlight"') + '>' + v + '</td>'; }).join('') + '</tr>';
    });
    html += '</tbody></table>';

    var old = wrap.querySelector('.aimap-compare-table');
    if (old) old.remove();
    wrap.insertAdjacentHTML('beforeend', html);
    setupCopyCompare(selected, rows);
    setupShareCompare();
  }

  function capBar(val) {
    if (!val) return '<span style="color:#555">—</span>';
    var color = val >= 4 ? '#8B5CF6' : val >= 2 ? '#fbbf24' : '#666';
    return '<span style="color:' + color + '">' + '●'.repeat(val) + '○'.repeat(5-val) + '</span> ' + val + '/5';
  }

  function setupCopyCompare(selected, rows) {
    var btn = document.getElementById('aimap-copy-compare');
    if (!btn) return;
    btn.onclick = function() {
      var md = '| Feature | ' + selected.map(function(s) { return s.name; }).join(' | ') + ' |\n';
      md += '|---|' + selected.map(function() { return '---'; }).join('|') + '|\n';
      rows.forEach(function(row) {
        var vals = selected.map(function(s) { return String(row.key(s)).replace(/[●○]/g, '').trim(); });
        md += '| ' + row.label + ' | ' + vals.join(' | ') + ' |\n';
      });
      navigator.clipboard.writeText(md).then(function() { btn.textContent = '✅ Copied!'; setTimeout(function() { btn.textContent = '📋 Copy as Markdown'; }, 2000); });
    };
  }

  function setupShareCompare() {
    var btn = document.getElementById('aimap-share-compare');
    if (!btn) return;
    btn.onclick = function() {
      var ids = [...compareSet].join(',');
      var url = location.origin + location.pathname + '?tab=compare&compare=' + ids;
      navigator.clipboard.writeText(url).then(function() { btn.textContent = '✅ Link copied!'; setTimeout(function() { btn.textContent = '🔗 Share comparison'; }, 2000); });
    };
  }

  // ---- QUIZ with reasoning (#3) ----
  function setupQuiz() {
    var startBtn = document.getElementById('aimap-quiz-start');
    var retakeBtn = document.getElementById('aimap-quiz-retake');
    var compareBtn = document.getElementById('aimap-quiz-compare-results');
    if (startBtn) startBtn.addEventListener('click', startQuiz);
    if (retakeBtn) retakeBtn.addEventListener('click', function() { quizAnswers = {}; quizStep = 0; startQuiz(); });
    if (compareBtn) compareBtn.addEventListener('click', function() {
      var cards = document.querySelectorAll('.aimap-quiz-result-card');
      compareSet.clear();
      cards.forEach(function(c) { if (c.dataset.id) compareSet.add(c.dataset.id); });
      updateCompareBtn(); switchToTab('compare');
    });
  }

  function startQuiz() {
    document.getElementById('aimap-quiz-intro').style.display = 'none';
    document.getElementById('aimap-quiz-results').style.display = 'none';
    document.getElementById('aimap-quiz-step').style.display = 'block';
    quizStep = 0; renderQuizStep();
  }

  function renderQuizStep() {
    if (quizStep >= quizQuestions.length) { showQuizResults(); return; }
    var q = quizQuestions[quizStep];
    document.getElementById('aimap-quiz-question').textContent = q.text;
    document.getElementById('aimap-quiz-progress').innerHTML = quizQuestions.map(function(_, i) {
      return '<div class="aimap-quiz-progress-dot ' + (i < quizStep ? 'done' : i === quizStep ? 'current' : '') + '"></div>';
    }).join('');
    document.getElementById('aimap-quiz-options').innerHTML = (q.options||[]).map(function(opt) {
      return '<button class="aimap-quiz-option" data-value="' + opt.value + '"><span class="aimap-quiz-option-icon">' + (opt.icon||'') + '</span><span>' + opt.label + '</span></button>';
    }).join('');
    document.querySelectorAll('.aimap-quiz-option').forEach(function(btn) {
      btn.addEventListener('click', function() { quizAnswers[q.id] = btn.dataset.value; quizStep++; renderQuizStep(); });
    });
  }

  function showQuizResults() {
    document.getElementById('aimap-quiz-step').style.display = 'none';
    document.getElementById('aimap-quiz-results').style.display = 'block';

    var scored = services.map(function(s) {
      var result = scoreService(s, quizAnswers);
      return { service: s, score: result.score, reasons: result.reasons };
    }).sort(function(a,b) { return b.score - a.score; }).slice(0, 3);

    var medals = ['🥇','🥈','🥉'];
    document.getElementById('aimap-quiz-results-list').innerHTML = scored.map(function(item, i) {
      var s = item.service;
      var cat = categories[s.category] || {};
      // Reasoning text (#3)
      var reasonsHTML = '<div class="aimap-quiz-reasons">' + item.reasons.map(function(r) {
        return '<span class="aimap-quiz-reason">' + r + '</span>';
      }).join('') + '</div>';
      return '<div class="aimap-quiz-result-card" data-id="' + s.id + '">' +
        '<div class="aimap-quiz-result-medal">' + medals[i] + '</div>' +
        '<div class="aimap-quiz-result-info"><h3>' + s.name + '</h3>' +
        '<p>' + s.provider + ' · ' + (cat.emoji||'') + ' ' + (cat.name||'') + '</p>' +
        '<p style="color:#ccc;font-size:0.85rem">' + (s.description||'') + '</p>' +
        reasonsHTML +
        '<span class="aimap-quiz-result-score">' + item.score + ' point match</span></div></div>';
    }).join('');
  }

  function scoreService(s, answers) {
    var score = 0;
    var reasons = [];

    var needMap = { text: 'text_generation', code: 'code_generation', images: 'image_generation',
      documents: 'reasoning', voice: 'audio_speech', agents: 'function_calling', search: 'reasoning', video: 'video_generation' };
    var needLabels = { text: 'text generation', code: 'coding', images: 'image generation', documents: 'document processing',
      voice: 'voice/audio', agents: 'agent capabilities', search: 'search/knowledge', video: 'video generation' };
    var needKey = needMap[answers['primary-need']];
    if (needKey) {
      var val = s[needKey];
      if (typeof val === 'number' && val >= 3) { score += val * 4; reasons.push('✅ Strong ' + (needLabels[answers['primary-need']]||'') + ' (' + val + '/5)'); }
      else if (val === true) { score += 16; reasons.push('✅ Supports ' + (needLabels[answers['primary-need']]||'')); }
    }

    var catMap = { text: 'llm-platform', code: 'code-development', images: 'image-generation',
      documents: 'document-processing', voice: 'voice-audio', agents: 'agent-platform', search: 'search-knowledge', video: 'video-generation' };
    if (s.category === catMap[answers['primary-need']]) { score += 10; reasons.push('✅ Purpose-built for this use case'); }

    var provMap = { azure: 'integration_azure', aws: 'integration_aws', gcp: 'integration_gcp' };
    var provLabels = { azure: 'Azure', aws: 'AWS', gcp: 'Google Cloud' };
    var provKey = provMap[answers['cloud-provider']];
    if (provKey && s[provKey]) { score += 12; reasons.push('✅ Integrates with ' + (provLabels[answers['cloud-provider']]||'')); }

    if (answers.budget === 'free' && s.free_tier) { score += 10; reasons.push('✅ Has free tier'); }
    if (answers.budget === 'free' && s.pricing_model === 'free') { score += 5; }
    if (answers.budget === 'enterprise' && s.sla && s.sla !== 'N/A') { score += 8; reasons.push('✅ Enterprise SLA (' + s.sla + ')'); }

    if (answers.compliance === 'strict') {
      var complianceHits = [];
      if (s.hipaa) { score += 5; complianceHits.push('HIPAA'); }
      if (s.gdpr) { score += 5; complianceHits.push('GDPR'); }
      if (s.data_residency) { score += 5; complianceHits.push('data residency'); }
      if (complianceHits.length) reasons.push('✅ Compliance: ' + complianceHits.join(', '));
    } else if (answers.compliance === 'basic') {
      if (s.soc2) { score += 5; }
      if (s.gdpr) { score += 3; }
      if (s.soc2 || s.gdpr) reasons.push('✅ Basic compliance (SOC 2/GDPR)');
    }

    if (answers['technical-level'] === 'non-technical') {
      if (['subscription','free'].includes(s.pricing_model)) { score += 6; reasons.push('✅ Ready-to-use (no API needed)'); }
    }
    if (answers['technical-level'] === 'developer') {
      if (s.function_calling) { score += 4; }
      if (s.fine_tuning) { score += 3; reasons.push('✅ Supports fine-tuning & API access'); }
    }

    var ecoMap = { m365: 'integration_m365', 'google-workspace': 'integration_gcp', github: 'integration_azure', 'aws-ecosystem': 'integration_aws' };
    var ecoLabels = { m365: 'Microsoft 365', 'google-workspace': 'Google Workspace', github: 'GitHub/Azure', 'aws-ecosystem': 'AWS' };
    var ecoKey = ecoMap[answers.ecosystem];
    if (ecoKey && s[ecoKey]) { score += 8; reasons.push('✅ Works with ' + (ecoLabels[answers.ecosystem]||'')); }

    if (answers['data-location'] !== 'anywhere' && s.data_residency) {
      var regionMap = { us: ['US'], eu: ['EU'], apac: ['Australia','Japan','Singapore'] };
      var needed = regionMap[answers['data-location']];
      if (needed && s.regions && needed.some(function(r) { return s.regions.indexOf(r) >= 0; })) {
        score += 8; reasons.push('✅ Available in your required region');
      }
    }

    return { score: score, reasons: reasons };
  }

  // ---- PRICING TABLE + COST ESTIMATOR (#13) ----
  function renderPricingTable() {
    var tbody = document.getElementById('aimap-pricing-tbody');
    if (!tbody) return;

    function render(freeOnly) {
      var data = services.slice();
      if (freeOnly) data = data.filter(function(s) { return s.free_tier; });
      data.sort(function(a,b) { return (a.name||'').localeCompare(b.name||''); });
      tbody.innerHTML = data.map(function(s) {
        return '<tr><td><strong>' + s.name + '</strong></td><td>' + s.provider + '</td>' +
          '<td>' + (s.free_tier ? '<span class="aimap-price-free">✅</span>' : '❌') + '</td>' +
          '<td>' + (s.price_input||'N/A') + '</td><td>' + (s.price_output||'N/A') + '</td>' +
          '<td>' + (s.pricing_model||'N/A') + '</td>' +
          '<td>' + (s.pricing_url ? '<a href="' + s.pricing_url + '" target="_blank" rel="noopener noreferrer">Pricing →</a>' : '') + '</td></tr>';
      }).join('');
    }
    render(false);
    var freeCheck = document.getElementById('pricing-free-only');
    if (freeCheck) freeCheck.addEventListener('change', function() { render(freeCheck.checked); });

    // Sortable headers
    document.querySelectorAll('.aimap-pricing-table th[data-sort]').forEach(function(th) {
      th.addEventListener('click', function() {
        var idx = Array.from(th.parentNode.children).indexOf(th);
        var rows = Array.from(tbody.querySelectorAll('tr'));
        var dir = th.classList.contains('sort-asc') ? -1 : 1;
        th.parentNode.querySelectorAll('th').forEach(function(h) { h.classList.remove('sort-asc','sort-desc'); });
        th.classList.add(dir === 1 ? 'sort-asc' : 'sort-desc');
        rows.sort(function(a,b) { return (a.children[idx]?.textContent||'').localeCompare(b.children[idx]?.textContent||'') * dir; });
        rows.forEach(function(r) { tbody.appendChild(r); });
      });
    });
  }

  function setupCostEstimator() {
    var calcBtn = document.getElementById('aimap-cost-calc');
    if (!calcBtn) return;
    calcBtn.addEventListener('click', function() {
      var msgs = parseInt(document.getElementById('aimap-cost-messages').value) || 100;
      var tokensPerMsg = parseInt(document.getElementById('aimap-cost-tokens').value) || 1500;
      var resultsDiv = document.getElementById('aimap-cost-results');
      if (!resultsDiv) return;

      var monthlyMsgs = msgs * 30;
      var inputTokens = monthlyMsgs * tokensPerMsg;
      var outputTokens = monthlyMsgs * (tokensPerMsg * 0.75); // assume 75% output ratio

      var estimates = services.filter(function(s) { return s.price_input && s.price_input !== 'N/A' && s.price_input !== 'Varies' && s.price_input !== 'Free'; })
        .map(function(s) {
          var inPrice = parseFloat(s.price_input.replace('$','')) || 0;
          var outPrice = parseFloat(s.price_output.replace('$','')) || 0;
          var monthlyCost = ((inputTokens / 1000000) * inPrice) + ((outputTokens / 1000000) * outPrice);
          return { name: s.name, provider: s.provider, cost: monthlyCost, id: s.id };
        }).sort(function(a,b) { return a.cost - b.cost; });

      resultsDiv.style.display = 'block';
      resultsDiv.innerHTML = '<h4>Estimated monthly cost for ' + monthlyMsgs.toLocaleString() + ' messages</h4>' +
        '<p style="color:#999;font-size:0.8rem">Based on ~' + tokensPerMsg.toLocaleString() + ' tokens/message (input) + ~' + Math.round(tokensPerMsg*0.75).toLocaleString() + ' tokens (output)</p>' +
        '<div class="aimap-cost-cards">' + estimates.map(function(e) {
          return '<div class="aimap-cost-card">' +
            '<span class="aimap-cost-card-name">' + e.name + '</span>' +
            '<span class="aimap-cost-card-provider">' + e.provider + '</span>' +
            '<span class="aimap-cost-card-price">$' + e.cost.toFixed(2) + '<span style="color:#999;font-size:0.7rem">/month</span></span>' +
          '</div>';
        }).join('') + '</div>';
    });
  }

  // ---- GLOSSARY with cross-linking (#14) ----
  function renderGlossary() {
    var listEl = document.getElementById('aimap-glossary-list');
    var searchEl = document.getElementById('aimap-glossary-search');
    if (!listEl) return;

    function render(filter) {
      var q = (filter||'').toLowerCase();
      var filtered = q ? glossaryTerms.filter(function(g) { return g.term.toLowerCase().indexOf(q) >= 0 || g.def.toLowerCase().indexOf(q) >= 0; }) : glossaryTerms;
      listEl.innerHTML = filtered.map(function(g) {
        return '<div class="aimap-glossary-item" id="glossary-' + g.term.toLowerCase().replace(/[^a-z0-9]/g,'-') + '">' +
          '<div class="aimap-glossary-term">' + g.full + '</div>' +
          '<div class="aimap-glossary-def">' + g.def + '</div></div>';
      }).join('') || '<p style="text-align:center;color:#999;padding:2rem">No matching terms.</p>';
    }
    render('');
    if (searchEl) {
      var timeout;
      searchEl.addEventListener('input', function() { clearTimeout(timeout); timeout = setTimeout(function() { render(searchEl.value); }, 200); });
    }
  }

  // ---- CHANGELOG (#12) ----
  function renderChangelog() {
    var listEl = document.getElementById('aimap-changelog-list');
    if (!listEl || !changelogEntries.length) return;

    var typeEmoji = { launch: '🚀', added: '➕', updated: '🔄', removed: '🗑️', fixed: '🐛' };
    listEl.innerHTML = changelogEntries.map(function(e) {
      return '<div class="aimap-changelog-entry">' +
        '<span class="aimap-changelog-date">' + e.date + '</span>' +
        '<span class="aimap-changelog-type">' + (typeEmoji[e.type]||'📝') + '</span>' +
        '<span class="aimap-changelog-text">' + e.text + '</span></div>';
    }).join('');
  }

  // ---- URL STATE ----
  function updateURL() {
    var params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    Object.keys(activeFilters).forEach(function(key) {
      if (activeFilters[key].length) params.set(key, activeFilters[key].join(','));
    });
    if (compareSet.size) params.set('compare', [...compareSet].join(','));
    var tab = document.querySelector('.aimap-tab.active');
    if (tab && tab.dataset.tab !== 'explore') params.set('tab', tab.dataset.tab);
    var newURL = params.toString() ? location.pathname + '?' + params : location.pathname;
    history.replaceState(null, '', newURL);
  }

  function restoreFromURL() {
    var params = new URLSearchParams(location.search);
    var tab = params.get('tab');
    if (tab) switchToTab(tab);
    var q = params.get('q');
    if (q) { searchQuery = q; var input = document.getElementById('aimap-search'); if (input) input.value = q; }
    Object.keys(activeFilters).forEach(function(key) {
      var val = params.get(key);
      if (val) {
        activeFilters[key] = val.split(',');
        var containerMap = { provider: 'filter-provider', category: 'filter-category', pricing: 'filter-pricing',
          capabilities: 'filter-capabilities', enterprise: 'filter-enterprise', integration: 'filter-integration', status: 'filter-status' };
        var container = document.getElementById(containerMap[key]);
        if (container) activeFilters[key].forEach(function(v) { var cb = container.querySelector('input[value="' + v + '"]'); if (cb) cb.checked = true; });
      }
    });
    var compare = params.get('compare');
    if (compare) { compare.split(',').forEach(function(id) { compareSet.add(id); }); updateCompareBtn(); if (tab === 'compare') setTimeout(renderCompareTable, 100); }
    renderCards();
  }

})();
