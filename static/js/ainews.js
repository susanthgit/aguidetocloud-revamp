document.addEventListener('DOMContentLoaded', async function () {
  var DATA_URLS = {
    daily: '/data/ainews/latest.json',
    weekly: '/data/ainews/weekly.json',
    monthly: '/data/ainews/monthly.json'
  };

  // SessionStorage cache — avoid re-fetching on tab switch / category pages
  var _cache = {};
  async function fetchJson(url) {
    if (_cache[url]) return _cache[url];
    var cached = sessionStorage.getItem('ainews_' + url);
    if (cached) {
      try {
        _cache[url] = JSON.parse(cached);
        return _cache[url];
      } catch (e) { /* parse error, re-fetch */ }
    }
    var resp = await fetch(url);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    var data = await resp.json();
    _cache[url] = data;
    try { sessionStorage.setItem('ainews_' + url, JSON.stringify(data)); } catch (e) { /* quota exceeded */ }
    return data;
  }

  async function loadView(view) {
    var grid = document.getElementById('news-grid');
    grid.innerHTML = '<div class="ainews-skeleton-wrap" style="grid-column:1/-1"><div class="ainews-skeleton-card"></div><div class="ainews-skeleton-card"></div><div class="ainews-skeleton-card"></div><div class="ainews-skeleton-card"></div><div class="ainews-skeleton-card"></div><div class="ainews-skeleton-card"></div></div>';
    try {
      var url = DATA_URLS[view] || DATA_URLS.daily;
      var raw = await fetchJson(url);
      var data = Array.isArray(raw) ? { articles: raw, generated_at: null } : raw;
      window.__ainewsData = data;
      renderNews(data, view);
      // Update freshness badge
      var badge = document.querySelector('.ainews-freshness');
      if (badge) badge.remove();
      renderFreshnessBadge(data.generated_at);
    } catch (e) {
      // If weekly/monthly not available yet, fall back to daily
      if (view !== 'daily') {
        grid.innerHTML = '<p style="color: var(--text-muted); text-align: center; grid-column: 1 / -1; padding: 3rem;">No ' + view + ' data available yet — showing today\'s news instead.</p>';
        setTimeout(function() { loadView('daily'); }, 1500);
      } else {
        grid.innerHTML = '<div style="color: var(--text-muted); text-align: center; grid-column: 1 / -1; padding: 3rem;"><p>⚠️ Could not load AI News data.</p><button onclick="location.reload()" style="margin-top:0.8rem;padding:0.4rem 1.2rem;border-radius:8px;border:1px solid var(--neon-cyan);background:rgba(102,255,255,0.08);color:var(--neon-cyan);cursor:pointer;font-weight:600">Retry</button></div>';
      }
    }
  }

  async function loadCategoryView(filter) {
    var SLUG_TO_NAME = {
      'microsoft': 'Microsoft', 'm365-copilot': 'M365 Copilot',
      'copilot-studio': 'Copilot Studio', 'github-copilot': 'GitHub Copilot',
      'ai-foundry': 'AI Foundry', 'openai': 'OpenAI', 'anthropic': 'Anthropic',
      'google': 'Google', 'meta': 'Meta', 'deepseek': 'DeepSeek',
      'mistral': 'Mistral', 'xai': 'xAI', 'perplexity': 'Perplexity',
      'nvidia': 'NVIDIA', 'apple': 'Apple', 'amazon': 'Amazon'
    };
    var categoryName = SLUG_TO_NAME[filter] || filter;
    var grid = document.getElementById('news-grid');

    // Fetch all three in parallel, use the one with most articles
    var urls = ['/data/ainews/monthly.json', '/data/ainews/weekly.json', '/data/ainews/latest.json'];
    var results = await Promise.allSettled(urls.map(function (u) { return fetchJson(u); }));
    var data = null;
    for (var i = 0; i < results.length; i++) {
      if (results[i].status === 'fulfilled' && results[i].value) {
        var raw = results[i].value;
        var candidate = Array.isArray(raw) ? { articles: raw } : raw;
        if (candidate.articles && candidate.articles.length > 0) {
          data = candidate;
          break;
        }
      }
    }

    if (!data || !data.articles) {
      grid.innerHTML = '<p style="color: var(--text-muted); text-align: center; grid-column: 1 / -1; padding: 3rem;">No articles available yet.</p>';
      return;
    }

    // Filter to ONLY this category (match on category_name or category_id)
    var targetLower = categoryName.toLowerCase();
    var filterLower = filter.toLowerCase();
    var filtered = data.articles.filter(function (a) {
      var name = (a.category_name || '').toLowerCase();
      var id = (a.category_id || '').toLowerCase();
      return name === targetLower || id === filterLower;
    });

    if (filtered.length === 0) {
      grid.innerHTML = '<p style="color: var(--text-muted); text-align: center; grid-column: 1 / -1; padding: 3rem;">No ' + categoryName + ' articles found this period. <a href="/ai-news/" style="color: var(--neon-cyan);">View all news →</a></p>';
      return;
    }

    // Render ONLY filtered articles
    window.__ainewsData = { articles: filtered, generated_at: data.generated_at };
    renderNews(window.__ainewsData, 'daily');
  }

  // Initial load
  if (window.__ainewsCategoryFilter) {
    // Category landing page — fetch, filter, render
    await loadCategoryView(window.__ainewsCategoryFilter);
  } else {
    // Main AI News page — load daily view
    await loadView('daily');

    // Pre-fetch tab counts for weekly/monthly
    updateTabCounts();
  }

  // Tab switching — only on main page (tabs don't exist on category pages)
  document.querySelectorAll('.ainews-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.ainews-tab').forEach(function (t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');
      var view = this.dataset.view;
      loadView(view);
    });
  });

// Init share button directly (no MutationObserver needed — tabs are in DOM from Hugo)
  // [REMOVED: share button — UX audit 2026-04-10]

  // Mark last visit timestamp for "new" badges
  var lastVisit = localStorage.getItem('ainews_last_visit');
  window.__ainewsLastVisit = lastVisit ? new Date(lastVisit) : null;
  localStorage.setItem('ainews_last_visit', new Date().toISOString());
});

// Microsoft-related categories get unlimited articles, others capped at 10
var MICROSOFT_CATS = ['microsoft', 'm365 copilot', 'copilot studio', 'ai foundry', 'github copilot'];
var MAX_OTHER = 10;

// Display order: Top Stories first, then Microsoft family, then rest
var CATEGORY_ORDER = [
  'Top Stories', 'Microsoft', 'M365 Copilot', 'Copilot Studio', 'GitHub Copilot', 'AI Foundry',
  'OpenAI', 'Anthropic', 'Google', 'Meta', 'DeepSeek', 'Mistral', 'xAI', 'Perplexity',
  'Apple', 'NVIDIA', 'Amazon', 'Open Source', 'Industry', 'Rumours & Gossip'
];

// Category colours and emojis for pills (prefer Hugo-injected config, fallback to defaults)
var CATEGORY_META = window.__ainewsCategoryConfig || {
  'Top Stories':       { emoji: '🔥', color: '#FF6B35' },
  'Microsoft':         { emoji: '🟦', color: '#0078D4' },
  'M365 Copilot':      { emoji: '✨', color: '#6264A7' },
  'Copilot Studio':    { emoji: '🛠️', color: '#742774' },
  'GitHub Copilot':    { emoji: '🤖', color: '#1F6FEB' },
  'AI Foundry':        { emoji: '🏭', color: '#008272' },
  'OpenAI':            { emoji: '🟩', color: '#10A37F' },
  'Anthropic':         { emoji: '🟧', color: '#D4A574' },
  'Google':            { emoji: '🟥', color: '#EA4335' },
  'Meta':              { emoji: '🟪', color: '#0668E1' },
  'DeepSeek':          { emoji: '🇨🇳', color: '#4D6BFE' },
  'Mistral':           { emoji: '🇪🇺', color: '#FF7000' },
  'xAI':               { emoji: '⚡', color: '#1DA1F2' },
  'Perplexity':        { emoji: '🔍', color: '#20808D' },
  'Apple':             { emoji: '🍎', color: '#A2AAAD' },
  'NVIDIA':            { emoji: '💚', color: '#76B900' },
  'Amazon':            { emoji: '📦', color: '#FF9900' },
  'Open Source':       { emoji: '⬛', color: '#333333' },
  'Industry':          { emoji: '🔵', color: '#4A90D9' },
  'Rumours & Gossip':  { emoji: '🗣️', color: '#9B59B6' }
};

// Categories that always appear in filter bar even with 0 articles
var ALWAYS_SHOW_CATS = ['M365 Copilot', 'Copilot Studio'];

// Only show articles related to AI
var AI_KEYWORDS = [
  'ai ', ' ai', 'artificial intelligence', 'machine learning', 'deep learning',
  'llm', 'large language model', 'gpt', 'copilot', 'chatgpt', 'gemini', 'claude',
  'neural', 'transformer', 'openai', 'anthropic', 'generative', 'gen ai',
  'foundation model', 'diffusion', 'midjourney', 'stable diffusion', 'dall-e',
  'agent', 'agentic', 'rag', 'vector', 'embedding', 'prompt', 'fine-tun',
  'foundry', 'azure ai', 'cognitive', 'nlp', 'computer vision',
  'chatbot', 'automation', 'copilot studio', 'ai safety', 'ai regulation',
  'ai act', 'superintelligence', 'agi', 'multimodal', 'reasoning',
  'meta llama', 'mistral', 'mixtral', 'phi-', 'deepseek', 'hugging face',
  'langchain', 'semantic kernel', 'autogen', 'crew ai', 'mcp server',
  'model context protocol', 'ai adoption', 'ai strategy', 'ai tool',
  'apple intelligence', 'siri', 'nvidia', 'cuda', 'gpu', 'inference',
  'bedrock', 'sagemaker', 'amazon q', 'amazon nova', 'trainium',
  'github copilot', 'copilot cli', 'code completion', 'coding agent', 'copilot workspace',
  'grok', 'xai', 'perplexity', 'le chat', 'pixtral', 'glasswing'
];

function isAiRelated(article) {
  var text = ((article.title || '') + ' ' + (article.ai_summary || '') + ' ' + (article.snippet || '')).toLowerCase();
  return AI_KEYWORDS.some(function (kw) { return text.indexOf(kw) !== -1; });
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  var now = new Date();
  var then = new Date(dateStr);
  var diffMs = now - then;
  var mins = Math.floor(diffMs / 60000);
  if (mins < 60) return mins + 'm ago';
  var hours = Math.floor(mins / 60);
  if (hours < 24) return hours + 'h ago';
  var days = Math.floor(hours / 24);
  if (days < 7) return days + 'd ago';
  return then.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function isMicrosoftCat(cat) {
  var lower = cat.toLowerCase();
  return MICROSOFT_CATS.some(function (m) { return lower.indexOf(m) !== -1; });
}

function applyLimits(articles) {
  var grouped = {};
  articles.forEach(function (a) {
    var cat = a.category_name || a.category || 'General';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(a);
  });

  var result = [];
  Object.keys(grouped).forEach(function (cat) {
    var items = grouped[cat];
    if (isMicrosoftCat(cat)) {
      result = result.concat(items);
    } else {
      result = result.concat(items.slice(0, MAX_OTHER));
    }
  });
  return result;
}

function getFaviconUrl(articleUrl) {
  try {
    var domain = new URL(articleUrl).hostname;
    return 'https://www.google.com/s2/favicons?domain=' + domain + '&sz=16';
  } catch (e) {
    return '';
  }
}

function getLogoUrl(articleUrl) {
  try {
    var domain = new URL(articleUrl).hostname;
    return 'https://www.google.com/s2/favicons?domain=' + domain + '&sz=64';
  } catch (e) {
    return '';
  }
}

function renderNews(data, view) {
  var allArticles = data.articles || [];
  var articles = allArticles.filter(isAiRelated);
  articles = applyLimits(articles);

  var grid = document.getElementById('news-grid');

  // Separate by tier
  var headlines = articles.filter(function (a) { return a.tier === 'headline'; });
  var deepDives = articles.filter(function (a) { return a.tier !== 'headline'; });

  // Sort: articles with images first for headlines
  headlines.sort(function (a, b) { return (b.image ? 1 : 0) - (a.image ? 1 : 0); });

  // Display caps
  var maxHeadlines = 8;
  var maxCompact = view === 'monthly' ? 100 : view === 'weekly' ? 50 : 20;

  // Category data for pills
  var categories = getOrderedCategories(articles);
  ALWAYS_SHOW_CATS.forEach(function (cat) {
    if (categories.indexOf(cat) === -1) categories.push(cat);
  });
  categories.sort(function (a, b) {
    var idxA = CATEGORY_ORDER.indexOf(a); if (idxA === -1) idxA = 999;
    var idxB = CATEGORY_ORDER.indexOf(b); if (idxB === -1) idxB = 999;
    return idxA - idxB;
  });

  var catCounts = {};
  articles.forEach(function (a) {
    var cat = a.category_name || a.category || 'General';
    catCounts[cat] = (catCounts[cat] || 0) + 1;
  });

  // === BUILD HTML ===
  var html = '';

  // 🔍 SEARCH BAR
  html += '<div class="ainews-toolbar" style="grid-column:1/-1">';
  html += '<input type="text" id="ainews-search" class="ainews-search" placeholder="🔍 Search articles..." autocomplete="off" aria-label="Search articles">';
  html += '</div>';

  // 📡 VENDOR PILLS (replaces dropdown)
  html += '<div class="ainews-pills" id="ainews-pills" style="grid-column:1/-1">';
  html += '<button class="ainews-pill ainews-pill-active" data-cat="all">All (' + articles.length + ')</button>';
  categories.forEach(function (cat) {
    var count = catCounts[cat] || 0;
    if (count === 0 && ALWAYS_SHOW_CATS.indexOf(cat) === -1) return;
    var meta = CATEGORY_META[cat] || { emoji: '', color: '#888' };
    html += '<button class="ainews-pill" data-cat="' + escapeHtml(cat) + '" style="--pill-color:' + meta.color + '">';
    html += (meta.emoji ? meta.emoji + ' ' : '') + escapeHtml(cat) + (count ? ' (' + count + ')' : '');
    html += '</button>';
  });
  html += '</div>';

  // 📊 COUNT INFO
  html += '<div class="ainews-filter-info" id="ainews-filter-info" style="grid-column:1/-1"><span>Showing <b id="ainews-count">' + articles.length + '</b> of ' + articles.length + ' articles</span></div>';

  // 🔥 HEADLINES (large cards, max 8)
  var visibleHL = headlines.slice(0, maxHeadlines);
  if (visibleHL.length > 0) {
    html += '<div class="ainews-tier-section" id="ainews-hl-section">';
    html += '<div class="ainews-tier-header ainews-tier-headlines"><span>🔥</span> Headlines (' + visibleHL.length + ')</div>';
    html += '<div class="ainews-heroes" id="ainews-heroes">';
    visibleHL.forEach(function (article) {
      html += '<div class="ainews-loadmore-item">' + renderHeroCard(article) + '</div>';
    });
    html += '</div>';
    html += '</div>';
  }

  // 📋 MORE STORIES (compact list with accordion)
  var compactItems = deepDives.slice(0, maxCompact);
  if (compactItems.length > 0) {
    var initialShow = Math.min(compactItems.length, view === 'monthly' ? 50 : 20);
    html += '<div class="ainews-tier-section" id="ainews-compact-section">';
    html += '<div class="ainews-tier-header ainews-tier-deepdives"><span>📋</span> More Stories (' + compactItems.length + ')</div>';
    html += '<div class="ainews-compact-list" id="ainews-compact">';
    compactItems.forEach(function (article, i) {
      var v = getArticleVars(article);
      var isRumour = v.cat.toLowerCase().indexOf('rumour') !== -1;
      var hidden = i >= initialShow ? ' style="display:none"' : '';
      html += '<div class="ainews-compact-row ainews-loadmore-item' + (isRumour ? ' ainews-compact-rumour' : '') + '" data-category="' + escapeHtml(v.cat) + '"' + hidden + '>';
      html += '<div class="ainews-compact-header">';
      html += '<span class="ainews-compact-cat" style="--pill-color:' + (CATEGORY_META[v.cat] || {color:'#888'}).color + '">' + v.emoji + ' ' + escapeHtml(v.cat) + '</span>';
      html += '<a href="' + escapeHtml(v.url) + '" target="_blank" rel="noopener noreferrer" class="ainews-compact-title"' + buildClickAttr(v) + '>';
      html += (v.isNew ? '<span class="ainews-new-badge">NEW</span> ' : '') + escapeHtml(v.title);
      html += '</a>';
      html += '<span class="ainews-compact-time">' + v.time + '</span>';
      html += '<button class="ainews-compact-expand" aria-label="Show details" aria-expanded="false">▼</button>';
      html += '</div>';
      html += '<div class="ainews-compact-detail" hidden>';
      html += '<p class="ainews-summary">' + escapeHtml(v.summary) + '</p>';
      if (v.whyMatters) html += '<p class="ainews-why"><strong>Why it matters:</strong> ' + escapeHtml(v.whyMatters) + '</p>';
      html += '<div class="ainews-meta">';
      if (v.favicon) html += '<img src="' + v.favicon + '" alt="" class="ainews-favicon" loading="lazy">';
      html += '<span class="ainews-source">' + escapeHtml(v.source) + '</span>';
      html += '<a href="' + escapeHtml(v.url) + '" target="_blank" rel="noopener noreferrer" class="ainews-compact-readmore">Read full article →</a>';
      html += '</div></div>';
      html += '</div>';
    });
    html += '</div>';
    if (compactItems.length > initialShow) {
      html += '<button class="ainews-show-more" data-target="ainews-compact" data-step="' + initialShow + '">Show ' + (compactItems.length - initialShow) + ' more stories</button>';
    }
    html += '</div>';
  }

  // Fallback
  if (headlines.length === 0 && deepDives.length === 0 && articles.length > 0) {
    articles.forEach(function (article) { html += renderCard(article); });
  }

  grid.innerHTML = html || '<p class="ainews-loading">No articles found for this period.</p>';

  // === EVENT DELEGATION (single listener for pills, accordion, show-more) ===
  grid.addEventListener('click', function (e) {
    // Vendor pills
    var pill = e.target.closest('.ainews-pill');
    if (pill) {
      e.preventDefault();
      grid.querySelectorAll('.ainews-pill').forEach(function (p) { p.classList.remove('ainews-pill-active'); });
      pill.classList.add('ainews-pill-active');
      var cat = pill.dataset.cat;
      filterByCategory(cat);
      syncAinewsUrl(cat, document.getElementById('ainews-search')?.value || '');
      return;
    }
    // Compact row accordion expand
    var expandBtn = e.target.closest('.ainews-compact-expand');
    if (expandBtn) {
      e.preventDefault();
      var row = expandBtn.closest('.ainews-compact-row');
      var detail = row.querySelector('.ainews-compact-detail');
      var isOpen = !detail.hidden;
      detail.hidden = isOpen;
      expandBtn.textContent = isOpen ? '▼' : '▲';
      expandBtn.setAttribute('aria-expanded', !isOpen);
      return;
    }
    // Show more
    var showMoreBtn = e.target.closest('.ainews-show-more');
    if (showMoreBtn) {
      var targetId = showMoreBtn.dataset.target;
      var step = parseInt(showMoreBtn.dataset.step, 10);
      var container = document.getElementById(targetId);
      if (!container) return;
      var hidden = container.querySelectorAll('.ainews-loadmore-item[style*="display: none"], .ainews-loadmore-item[style*="display:none"]');
      var count = 0;
      hidden.forEach(function (el) { if (count < step) { el.style.display = ''; count++; } });
      var remaining = container.querySelectorAll('.ainews-loadmore-item[style*="display: none"], .ainews-loadmore-item[style*="display:none"]').length;
      if (remaining === 0) showMoreBtn.style.display = 'none';
      else showMoreBtn.textContent = 'Show ' + remaining + ' more stories';
    }
  });

  // === FILTER BY CATEGORY ===
  function filterByCategory(cat) {
    // Filter headlines
    grid.querySelectorAll('.ainews-card-hero').forEach(function (el) {
      el.closest('.ainews-loadmore-item').style.display = (cat === 'all' || el.dataset.category === cat) ? '' : 'none';
    });
    // Filter compact rows
    grid.querySelectorAll('.ainews-compact-row').forEach(function (el) {
      el.style.display = (cat === 'all' || el.dataset.category === cat) ? '' : 'none';
    });
    // Hide empty sections
    grid.querySelectorAll('.ainews-tier-section').forEach(function (sec) {
      var hasVisible = sec.querySelectorAll('.ainews-card-hero:not([style*="display: none"]), .ainews-compact-row:not([style*="display: none"])');
      if (hasVisible.length === 0) hasVisible = sec.querySelectorAll('.ainews-loadmore-item:not([style*="display: none"])');
      sec.style.display = hasVisible.length > 0 ? '' : 'none';
    });
    updateAinewsCount();
  }

  // === COUNT UPDATE ===
  function updateAinewsCount() {
    var countEl = document.getElementById('ainews-count');
    if (!countEl) return;
    var visible = grid.querySelectorAll('.ainews-card-hero:not([style*="display: none"]):not([style*="display:none"])').length +
                  grid.querySelectorAll('.ainews-compact-row:not([style*="display: none"]):not([style*="display:none"])').length;
    countEl.textContent = visible;
  }

  // === SEARCH ===
  var searchInput = document.getElementById('ainews-search');
  if (searchInput) {
    var _searchTimer;
    searchInput.addEventListener('input', function () {
      clearTimeout(_searchTimer);
      var input = this;
      _searchTimer = setTimeout(function () {
        var q = input.value.toLowerCase();
        // Search headlines
        grid.querySelectorAll('.ainews-card-hero').forEach(function (el) {
          var text = el.textContent.toLowerCase();
          el.closest('.ainews-loadmore-item').style.display = (!q || text.indexOf(q) !== -1) ? '' : 'none';
        });
        // Search compact rows (search header + hidden detail text)
        grid.querySelectorAll('.ainews-compact-row').forEach(function (el) {
          var text = el.textContent.toLowerCase();
          el.style.display = (!q || text.indexOf(q) !== -1) ? '' : 'none';
        });
        // Show all hidden items when searching
        if (q) {
          grid.querySelectorAll('.ainews-loadmore-item[style*="display: none"]').forEach(function (el) {
            var text = el.textContent.toLowerCase();
            if (text.indexOf(q) !== -1) el.style.display = '';
          });
          grid.querySelectorAll('.ainews-show-more').forEach(function (btn) { btn.style.display = 'none'; });
        }
        updateAinewsCount();
        var activePill = grid.querySelector('.ainews-pill-active');
        syncAinewsUrl(activePill ? activePill.dataset.cat : 'all', input.value);
      }, 200);
    });
  }

  // Apply URL state
  readAinewsUrl();
}

// === URL STATE (shareable links) ===
function syncAinewsUrl(cat, q) {
  var p = new URLSearchParams();
  if (cat && cat !== 'all') p.set('cat', cat);
  if (q) p.set('q', q);
  var s = p.toString();
  history.replaceState(null, '', s ? '?' + s : location.pathname);
}

function readAinewsUrl() {
  var p = new URLSearchParams(location.search);
  var cat = p.get('cat');
  var q = p.get('q');
  if (cat) {
    // Activate the matching pill
    var pills = document.querySelectorAll('.ainews-pill');
    pills.forEach(function (pill) {
      if (pill.dataset.cat === cat) {
        pill.classList.add('ainews-pill-active');
        pill.click();
      } else if (pill.dataset.cat === 'all') {
        pill.classList.remove('ainews-pill-active');
      }
    });
  }
  if (q) {
    var searchInput = document.getElementById('ainews-search');
    if (searchInput) { searchInput.value = q; searchInput.dispatchEvent(new Event('input')); }
  }
}
// === SHARED RENDER HELPERS ===
function getArticleVars(article) {
  var cat = article.category_name || article.category || 'General';
  return {
    cat: cat,
    emoji: article.category_emoji || '',
    summary: article.ai_summary || article.snippet || '',
    whyMatters: article.why_it_matters || '',
    source: article.source || '',
    url: article.url || article.link || '#',
    title: article.title || 'Untitled',
    time: timeAgo(article.published),
    favicon: getFaviconUrl(article.url || article.link || ''),
    image: article.image || '',
    logo: getLogoUrl(article.url || article.link || ''),
    cluster: article.cluster || '',
    isNew: isNewSinceLastVisit(article.published)
  };
}

function buildThumbHtml(v) {
  if (v.image) {
    return '<img src="' + escapeHtml(v.image) + '" alt="" class="ainews-thumb-img" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
      '<div class="ainews-thumb ainews-thumb-logo" style="display:none">' +
      '<span class="ainews-logo-fallback" style="display:flex"><span class="ainews-thumb-emoji">' + v.emoji + '</span></span>' +
      '<span class="ainews-thumb-source">' + escapeHtml(v.source) + '</span></div>';
  }
  return '<div class="ainews-thumb ainews-thumb-logo">' +
    (v.logo ? '<img src="' + escapeHtml(v.logo) + '" alt="" class="ainews-logo-img" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' : '') +
    '<span class="ainews-logo-fallback" style="' + (v.logo ? 'display:none' : 'display:flex') + '"><span class="ainews-thumb-emoji">' + v.emoji + '</span></span>' +
    '<span class="ainews-thumb-source">' + escapeHtml(v.source) + '</span>' +
  '</div>';
}

function buildClickAttr(v) {
  return ' onclick="trackArticleClick(\'' + escapeHtml(v.cat).replace(/'/g, '') + '\',\'' + escapeHtml(v.title).replace(/'/g, '').substring(0, 50) + '\')"';
}

function renderHeroCard(article) {
  var v = getArticleVars(article);
  return '<a href="' + escapeHtml(v.url) + '" target="_blank" rel="noopener noreferrer" class="ainews-card-hero" data-category="' + escapeHtml(v.cat) + '"' + buildClickAttr(v) + '>' +
    '<div class="ainews-thumb-wrap">' + buildThumbHtml(v) + '</div>' +
    '<div class="ainews-card-body">' +
    (v.isNew ? '<span class="ainews-new-badge">NEW</span>' : '') +
    '<span class="ainews-cat">' + v.emoji + ' ' + escapeHtml(v.cat) + '</span>' +
    '<h3>' + escapeHtml(v.title) + '</h3>' +
    '<p class="ainews-summary">' + escapeHtml(v.summary) + '</p>' +
    (v.whyMatters ? '<p class="ainews-why"><strong>Why it matters:</strong> ' + escapeHtml(v.whyMatters) + '</p>' : '') +
    '<div class="ainews-meta">' +
      (v.favicon ? '<img src="' + v.favicon + '" alt="" class="ainews-favicon" loading="lazy">' : '') +
      '<span class="ainews-source">' + escapeHtml(v.source) + '</span>' +
      '<span class="ainews-time">' + v.time + '</span>' +
    '</div></div>' +
  '</a>';
}

function renderCard(article) {
  var v = getArticleVars(article);
  var isRumour = v.cat.toLowerCase().indexOf('rumour') !== -1;
  var extraClass = isRumour ? ' ainews-card-rumour' : '';
  return '<a href="' + escapeHtml(v.url) + '" target="_blank" rel="noopener noreferrer" class="ainews-card' + extraClass + '" data-category="' + escapeHtml(v.cat) + '"' + buildClickAttr(v) + '>' +
    '<div class="ainews-thumb-wrap">' + buildThumbHtml(v) + '</div>' +
    (v.isNew ? '<span class="ainews-new-badge">NEW</span>' : '') +
    '<span class="ainews-cat">' + v.emoji + ' ' + escapeHtml(v.cat) + '</span>' +
    '<h3>' + escapeHtml(v.title) + '</h3>' +
    '<p class="ainews-summary">' + escapeHtml(v.summary) + '</p>' +
    (v.whyMatters ? '<p class="ainews-why"><strong>Why it matters:</strong> ' + escapeHtml(v.whyMatters) + '</p>' : '') +
    '<div class="ainews-meta">' +
      (v.favicon ? '<img src="' + v.favicon + '" alt="" class="ainews-favicon" loading="lazy">' : '') +
      '<span class="ainews-source">' + escapeHtml(v.source) + '</span>' +
      '<span class="ainews-time">' + v.time + '</span>' +
    '</div>' +
  '</a>';
}

function renderFreshnessBadge(generatedAt) {
  if (!generatedAt) return;
  var badge = document.createElement('div');
  badge.className = 'ainews-freshness';
  var now = new Date();
  var gen = new Date(generatedAt);
  var diffMs = now - gen;
  var hours = Math.floor(diffMs / 3600000);
  var label, statusClass;
  if (hours < 6) {
    label = 'Updated ' + (hours < 1 ? 'just now' : hours + 'h ago');
    statusClass = 'ainews-fresh';
  } else if (hours < 18) {
    label = 'Updated ' + hours + 'h ago';
    statusClass = 'ainews-stale';
  } else {
    var days = Math.floor(hours / 24);
    label = 'Updated ' + (days < 1 ? hours + 'h' : days + 'd') + ' ago';
    statusClass = 'ainews-old';
  }
  badge.innerHTML = '<span class="ainews-fresh-dot ' + statusClass + '"></span> ' + label;
  var tabsEl = document.querySelector('.ainews-tabs');
  if (tabsEl) tabsEl.appendChild(badge);
}

function getOrderedCategories(articles) {
  var categories = [];
  var seen = {};
  // Sort articles by category order first
  var sorted = articles.slice().sort(function (a, b) {
    var catA = a.category_name || a.category || 'General';
    var catB = b.category_name || b.category || 'General';
    var idxA = CATEGORY_ORDER.indexOf(catA); if (idxA === -1) idxA = 999;
    var idxB = CATEGORY_ORDER.indexOf(catB); if (idxB === -1) idxB = 999;
    return idxA - idxB;
  });
  sorted.forEach(function (a) {
    var cat = a.category_name || a.category || 'General';
    if (!seen[cat]) { categories.push(cat); seen[cat] = true; }
  });
  return categories;
}

// === TAB COUNTS ===
async function updateTabCounts() {
  // Fetch monthly count
  try {
    var cached = sessionStorage.getItem('ainews_/data/ainews/monthly.json');
    var raw = cached ? JSON.parse(cached) : await fetch('/data/ainews/monthly.json').then(function (r) { return r.ok ? r.json() : null; });
    if (raw) {
      var articles = (raw.articles || []).filter(isAiRelated);
      var tab = document.querySelector('.ainews-tab[data-view="monthly"]');
      if (tab) tab.textContent = '📈 This Month (' + articles.length + ')';
    }
  } catch (e) { /* ignore */ }
  // Update daily count from already loaded data
  if (window.__ainewsData) {
    var dailyArticles = (window.__ainewsData.articles || []).filter(isAiRelated);
    var dailyTab = document.querySelector('.ainews-tab[data-view="daily"]');
    if (dailyTab) dailyTab.textContent = '📅 Today (' + dailyArticles.length + ')';
  }
}

// === "NEW" BADGES ===
function isNewSinceLastVisit(publishedStr) {
  if (!window.__ainewsLastVisit || !publishedStr) return false;
  try {
    return new Date(publishedStr) > window.__ainewsLastVisit;
  } catch (e) { return false; }
}

// === CLICK ANALYTICS (Microsoft Clarity) ===
function trackArticleClick(category, title) {
  if (window.clarity) {
    window.clarity('event', 'ainews_click', { category: category, title: title.substring(0, 50) });
  }
}

// === CSV EXPORT ===
var ainewsCsvBtn = document.getElementById('ainews-csv');
if (ainewsCsvBtn) {
  ainewsCsvBtn.addEventListener('click', function () {
    var data = window.__ainewsData;
    if (!data || !data.articles || !data.articles.length) return;
    var csv = ['Title,Category,Source,URL,Published'];
    data.articles.forEach(function (a) {
      csv.push(['"' + (a.title || '').replace(/"/g, '""') + '"', a.category_name || a.category || '', a.source || '', a.url || a.link || '', a.published || ''].join(','));
    });
    var b = new Blob([csv.join('\n')], { type: 'text/csv' }), u = URL.createObjectURL(b), el = document.createElement('a');
    el.href = u; el.download = 'ai-news-' + new Date().toISOString().slice(0, 10) + '.csv'; el.click(); URL.revokeObjectURL(u);
    if (window.clarity) window.clarity('event', 'ainews_csv_export');
  });
}

// Back-to-top is now global (baseof.html)
