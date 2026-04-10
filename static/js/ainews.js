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
    grid.innerHTML = '<div class="ainews-skeleton-wrap" style="grid-column:1/-1"><div class="ainews-skeleton-card"></div><div class="ainews-skeleton-card"></div><div class="ainews-skeleton-card"></div></div>';
    try {
      var url = DATA_URLS[view] || DATA_URLS.daily;
      var raw = await fetchJson(url);
      var data = Array.isArray(raw) ? { articles: raw, generated_at: null } : raw;
      window.__ainewsData = data;
      renderNews(data, view);
      // Show trending topics for weekly view
      if (view === 'weekly' && data.trending_topics && data.trending_topics.length > 0) {
        renderTrendingBar(data.trending_topics);
      }
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
        grid.innerHTML = '<p style="color: var(--text-muted); text-align: center; grid-column: 1 / -1; padding: 3rem;">AI News data not available yet. Check back tomorrow!</p>';
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
      document.querySelectorAll('.ainews-tab').forEach(function (t) { t.classList.remove('active'); });
      this.classList.add('active');
      var view = this.dataset.view;
      loadView(view);
    });
  });

// Init share button directly (no MutationObserver needed — tabs are in DOM from Hugo)
  renderShareButton();

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

// Category colours and emojis for pills
var CATEGORY_META = {
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

function readingTime(text) {
  if (!text) return '1 min';
  var words = text.split(/\s+/).length;
  var mins = Math.max(1, Math.ceil(words / 200));
  return mins + ' min read';
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
  var deepDives = articles.filter(function (a) { return a.tier === 'deep_dive' || !a.tier; });
  var quickLinks = articles.filter(function (a) { return a.tier === 'quick'; });

  // Sort: articles with images first within each tier
  var imageFirst = function (a, b) {
    var aImg = a.image ? 1 : 0;
    var bImg = b.image ? 1 : 0;
    return bImg - aImg;
  };
  headlines.sort(imageFirst);
  deepDives.sort(imageFirst);

  // Category filters — merge always-show categories with those that have articles
  var categories = getOrderedCategories(articles);
  ALWAYS_SHOW_CATS.forEach(function (cat) {
    if (categories.indexOf(cat) === -1) categories.push(cat);
  });
  // Re-sort by CATEGORY_ORDER
  categories.sort(function (a, b) {
    var idxA = CATEGORY_ORDER.indexOf(a); if (idxA === -1) idxA = 999;
    var idxB = CATEGORY_ORDER.indexOf(b); if (idxB === -1) idxB = 999;
    return idxA - idxB;
  });

  // Build HTML: search bar → category filters → articles
  var html = '';

  // 🔍 SEARCH BAR
  html += '<div class="ainews-search-wrap" style="grid-column:1/-1"><input type="text" id="ainews-search" class="ainews-search" placeholder="🔍 Search articles..." autocomplete="off"></div>';

  // 📂 CATEGORY FILTERS (below search)
  html += '<div class="ainews-categories" id="category-filters" style="grid-column:1/-1">';
  html += '<button class="ainews-filter active" data-cat="all">All (' + articles.length + ')</button>';
  categories.forEach(function (cat) {
    var count = articles.filter(function (a) { return (a.category_name || a.category || 'General') === cat; }).length;
    var meta = CATEGORY_META[cat] || { emoji: '', color: '#888' };
    var pill = '<span class="ainews-pill-dot" style="background:' + meta.color + '"></span>';
    html += '<button class="ainews-filter" data-cat="' + escapeHtml(cat) + '" data-color="' + meta.color + '">' + pill + (meta.emoji ? meta.emoji + ' ' : '') + escapeHtml(cat) + ' (' + count + ')</button>';
  });
  html += '</div>';

  // 🔥 HEADLINES
  if (headlines.length > 0) {
    html += '<div class="ainews-tier-section">';
    html += '<div class="ainews-tier-header ainews-tier-headlines"><span>🔥</span> Headlines <div class="ainews-tier-desc">Major breaking news and industry-shaping announcements you need to know</div></div>';
    html += '<div class="ainews-heroes">';
    headlines.forEach(function (article) {
      html += renderHeroCard(article);
    });
    html += '</div></div>';
  }

  // 🧠 DEEP DIVES
  if (deepDives.length > 0) {
    html += '<div class="ainews-tier-section">';
    html += '<div class="ainews-tier-header ainews-tier-deepdives"><span>🧠</span> Deep Dives <div class="ainews-tier-desc">In-depth analysis and noteworthy developments worth reading in full</div></div>';
    html += '<div class="ainews-deepdive-grid">';
    deepDives.forEach(function (article) {
      html += renderCard(article);
    });
    html += '</div></div>';
  }

  // ⚡ QUICK LINKS
  if (quickLinks.length > 0) {
    html += '<div class="ainews-tier-section">';
    html += '<div class="ainews-tier-header ainews-tier-quick"><span>⚡</span> Quick Links <div class="ainews-tier-desc">Minor updates and niche topics — good to know at a glance</div></div>';
    html += '<div class="ainews-quick-list">';
    quickLinks.forEach(function (article) {
      html += renderQuickLink(article);
    });
    html += '</div></div>';
  }

  // Fallback: if no tiers assigned, render all as cards (backward compat)
  if (headlines.length === 0 && deepDives.length === 0 && quickLinks.length === 0 && articles.length > 0) {
    articles.forEach(function (article) {
      html += renderCard(article);
    });
  }

  grid.innerHTML = html || '<p class="ainews-loading">No articles found for this period.</p>';

  // Wire up category filter clicks
  var filtersEl = document.getElementById('category-filters');
  if (filtersEl) {
    filtersEl.querySelectorAll('.ainews-filter').forEach(function (btn) {
      btn.addEventListener('click', function () {
        filtersEl.querySelectorAll('.ainews-filter').forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        var cat = this.dataset.cat;
        grid.querySelectorAll('.ainews-card, .ainews-card-hero, .ainews-quick-item, .ainews-section-header').forEach(function (el) {
          if (cat === 'all') { el.style.display = ''; return; }
          el.style.display = (el.dataset.category === cat) ? '' : 'none';
        });
        grid.querySelectorAll('.ainews-tier-section').forEach(function (sec) {
          var hasVisible = sec.querySelectorAll('.ainews-card:not([style*="display: none"]), .ainews-card-hero:not([style*="display: none"]), .ainews-quick-item:not([style*="display: none"])');
          sec.style.display = hasVisible.length > 0 ? '' : 'none';
        });
      });
    });
  }

  // Search functionality
  var searchInput = document.getElementById('ainews-search');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      var q = this.value.toLowerCase();
      grid.querySelectorAll('.ainews-card, .ainews-card-hero, .ainews-quick-item').forEach(function (el) {
        var text = el.textContent.toLowerCase();
        el.style.display = (!q || text.indexOf(q) !== -1) ? '' : 'none';
      });
    });
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
    rtime: readingTime(article.ai_summary || article.snippet || ''),
    image: article.image || '',
    logo: getLogoUrl(article.url || article.link || ''),
    cluster: article.cluster || '',
    isNew: isNewSinceLastVisit(article.published)
  };
}

function buildThumbHtml(v) {
  if (v.image) {
    return '<img src="' + escapeHtml(v.image) + '" alt="" class="ainews-thumb-img" loading="lazy">';
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
  return '<a href="' + escapeHtml(v.url) + '" target="_blank" rel="noopener" class="ainews-card-hero" data-category="' + escapeHtml(v.cat) + '"' + buildClickAttr(v) + '>' +
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
      '<span class="ainews-rtime">' + v.rtime + '</span>' +
      '<span class="ainews-time">' + v.time + '</span>' +
    '</div></div>' +
  '</a>';
}

function renderCard(article) {
  var v = getArticleVars(article);
  var isRumour = v.cat.toLowerCase().indexOf('rumour') !== -1;
  var extraClass = isRumour ? ' ainews-card-rumour' : '';
  return '<a href="' + escapeHtml(v.url) + '" target="_blank" rel="noopener" class="ainews-card' + extraClass + '" data-category="' + escapeHtml(v.cat) + '"' + buildClickAttr(v) + '>' +
    '<div class="ainews-thumb-wrap">' + buildThumbHtml(v) + '</div>' +
    (v.isNew ? '<span class="ainews-new-badge">NEW</span>' : '') +
    '<span class="ainews-cat">' + v.emoji + ' ' + escapeHtml(v.cat) + '</span>' +
    (v.cluster ? '<span class="ainews-cluster">🔗 ' + escapeHtml(v.cluster.replace(/-/g, ' ')) + '</span>' : '') +
    '<h3>' + escapeHtml(v.title) + '</h3>' +
    '<p class="ainews-summary">' + escapeHtml(v.summary) + '</p>' +
    (v.whyMatters ? '<p class="ainews-why"><strong>Why it matters:</strong> ' + escapeHtml(v.whyMatters) + '</p>' : '') +
    '<div class="ainews-meta">' +
      (v.favicon ? '<img src="' + v.favicon + '" alt="" class="ainews-favicon" loading="lazy">' : '') +
      '<span class="ainews-source">' + escapeHtml(v.source) + '</span>' +
      '<span class="ainews-rtime">' + v.rtime + '</span>' +
      '<span class="ainews-time">' + v.time + '</span>' +
    '</div>' +
  '</a>';
}

function renderQuickLink(article) {
  var v = getArticleVars(article);
  return '<a href="' + escapeHtml(v.url) + '" target="_blank" rel="noopener" class="ainews-quick-item" data-category="' + escapeHtml(v.cat) + '"' + buildClickAttr(v) + '>' +
    '<span class="ainews-quick-emoji">' + v.emoji + '</span>' +
    '<span class="ainews-quick-title">' + escapeHtml(v.title) + '</span>' +
    (v.whyMatters ? '<span class="ainews-quick-why">' + escapeHtml(v.whyMatters) + '</span>' : '') +
    '<span class="ainews-quick-meta">' +
      (v.favicon ? '<img src="' + v.favicon + '" alt="" class="ainews-favicon" loading="lazy">' : '') +
      escapeHtml(v.source) + ' · ' + v.time +
    '</span>' +
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

function countCategories(articles) {
  var seen = {};
  articles.forEach(function (a) { seen[a.category_name || a.category || 'General'] = true; });
  return Object.keys(seen).length;
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
  var DATA_URLS = {
    weekly: '/data/ainews/weekly.json',
    monthly: '/data/ainews/monthly.json'
  };
  // Fetch both in parallel
  var keys = Object.keys(DATA_URLS);
  var results = await Promise.allSettled(keys.map(function (k) {
    // Use cached data if available (from sessionStorage or memory)
    var cached = sessionStorage.getItem('ainews_' + DATA_URLS[k]);
    if (cached) return Promise.resolve(JSON.parse(cached));
    return fetch(DATA_URLS[k]).then(function (r) { return r.ok ? r.json() : null; });
  }));
  keys.forEach(function (view, i) {
    if (results[i].status !== 'fulfilled' || !results[i].value) return;
    var raw = results[i].value;
    var articles = (raw.articles || []).filter(isAiRelated);
    var tab = document.querySelector('.ainews-tab[data-view="' + view + '"]');
    if (tab) {
      var labels = { weekly: '📊 This Week', monthly: '📈 This Month' };
      tab.textContent = labels[view] + ' (' + articles.length + ')';
    }
  });
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

// === SHARE BUTTON ===
function renderShareButton() {
  var container = document.querySelector('.ainews-tabs');
  if (!container || document.getElementById('ainews-share-btn')) return;
  var btn = document.createElement('button');
  btn.id = 'ainews-share-btn';
  btn.className = 'ainews-share-btn';
  btn.innerHTML = '📤 Share';
  btn.title = 'Copy link to clipboard';
  btn.addEventListener('click', function () {
    var url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () {
        btn.innerHTML = '✅ Copied!';
        setTimeout(function () { btn.innerHTML = '📤 Share'; }, 2000);
      });
    } else {
      prompt('Copy this link:', url);
    }
  });
  container.appendChild(btn);
}

// === CLICK ANALYTICS (Microsoft Clarity) ===
function trackArticleClick(category, title) {
  if (window.clarity) {
    window.clarity('event', 'ainews_click', { category: category, title: title.substring(0, 50) });
  }
}

// === TRENDING TOPICS BAR ===
function renderTrendingBar(topics) {
  // Remove any existing trending bar
  var existing = document.getElementById('ainews-trending-bar');
  if (existing) existing.remove();

  var grid = document.getElementById('news-grid');
  var bar = document.createElement('div');
  bar.id = 'ainews-trending-bar';
  bar.className = 'ainews-trending-bar';
  bar.style.cssText = 'grid-column:1/-1;display:flex;flex-wrap:wrap;align-items:center;gap:0.5rem;padding:0.8rem 1rem;background:rgba(255,0,255,0.06);border:1px solid rgba(255,0,255,0.15);border-radius:8px;margin-bottom:0.5rem;';
  var html = '<span style="font-weight:700;color:#ff00ff;margin-right:0.3rem;">🔥 Trending This Week:</span>';
  topics.forEach(function (topic) {
    html += '<span style="background:rgba(255,0,255,0.12);color:#ff88ff;padding:2px 8px;border-radius:12px;font-size:0.78rem;font-weight:600;">' + escapeHtml(topic) + '</span>';
  });
  bar.innerHTML = html;
  grid.insertBefore(bar, grid.firstChild);
}
