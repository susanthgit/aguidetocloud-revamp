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

  // Separate by tier (quick links merged into deep dives)
  var headlines = articles.filter(function (a) { return a.tier === 'headline'; });
  var deepDives = articles.filter(function (a) { return a.tier !== 'headline'; });

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

  // Build HTML: search bar + category dropdown → articles
  var html = '';

  // 🔍 SEARCH + CATEGORY DROPDOWN (toolbar)
  html += '<div class="ainews-toolbar" style="grid-column:1/-1">';
  html += '<input type="text" id="ainews-search" class="ainews-search" placeholder="🔍 Search articles..." autocomplete="off" aria-label="Search articles">';
  html += '<select id="ainews-cat-select" class="ainews-select" aria-label="Filter by category">';
  html += '<option value="all">All Categories (' + articles.length + ')</option>';
  categories.forEach(function (cat) {
    var count = articles.filter(function (a) { return (a.category_name || a.category || 'General') === cat; }).length;
    var meta = CATEGORY_META[cat] || { emoji: '', color: '#888' };
    html += '<option value="' + escapeHtml(cat) + '">' + (meta.emoji ? meta.emoji + ' ' : '') + escapeHtml(cat) + ' (' + count + ')</option>';
  });
  html += '</select>';
  html += '</div>';

  // 📊 FILTER INFO
  html += '<div class="ainews-filter-info" id="ainews-filter-info" style="grid-column:1/-1"><span>Showing <b id="ainews-count">' + articles.length + '</b> of ' + articles.length + ' articles</span></div>';

  // 🔥 HEADLINES
  if (headlines.length > 0) {
    html += '<div class="ainews-tier-section">';
    html += '<div class="ainews-tier-header ainews-tier-headlines"><span>🔥</span> Headlines (' + headlines.length + ')</div>';
    html += '<div class="ainews-heroes" id="ainews-heroes">';
    headlines.forEach(function (article, i) {
      html += '<div class="ainews-loadmore-item"' + (i >= 6 ? ' style="display:none"' : '') + '>' + renderHeroCard(article) + '</div>';
    });
    html += '</div>';
    if (headlines.length > 6) {
      html += '<button class="ainews-show-more" data-target="ainews-heroes" data-step="6">Show ' + (headlines.length - 6) + ' more headlines</button>';
    }
    html += '</div>';
  }

  // 🧠 DEEP DIVES
  if (deepDives.length > 0) {
    html += '<div class="ainews-tier-section">';
    html += '<div class="ainews-tier-header ainews-tier-deepdives"><span>🧠</span> Deep Dives (' + deepDives.length + ')</div>';
    html += '<div class="ainews-deepdive-grid" id="ainews-deepdives">';
    deepDives.forEach(function (article, i) {
      html += '<div class="ainews-loadmore-item"' + (i >= 12 ? ' style="display:none"' : '') + '>' + renderCard(article) + '</div>';
    });
    html += '</div>';
    if (deepDives.length > 12) {
      html += '<button class="ainews-show-more" data-target="ainews-deepdives" data-step="12">Show ' + (deepDives.length - 12) + ' more deep dives</button>';
    }
    html += '</div>';
  }

  // Fallback: if no tiers assigned, render all as cards (backward compat)
  if (headlines.length === 0 && deepDives.length === 0 && articles.length > 0) {
    articles.forEach(function (article) {
      html += renderCard(article);
    });
  }

  grid.innerHTML = html || '<p class="ainews-loading">No articles found for this period.</p>';

  // Helper: update visible count display
  function updateAinewsCount() {
    var countEl = document.getElementById('ainews-count');
    if (!countEl) return;
    var visible = grid.querySelectorAll('.ainews-card:not([style*="display: none"]):not([style*="display:none"]), .ainews-card-hero:not([style*="display: none"]):not([style*="display:none"])');
    countEl.textContent = visible.length;
  }

  // Wire up category dropdown
  var catSelect = document.getElementById('ainews-cat-select');
  if (catSelect) {
    catSelect.addEventListener('change', function () {
      var cat = this.value;
      grid.querySelectorAll('.ainews-card, .ainews-card-hero, .ainews-section-header').forEach(function (el) {
        if (cat === 'all') { el.style.display = ''; return; }
        el.style.display = (el.dataset.category === cat) ? '' : 'none';
      });
      grid.querySelectorAll('.ainews-tier-section').forEach(function (sec) {
        var hasVisible = sec.querySelectorAll('.ainews-card:not([style*="display: none"]), .ainews-card-hero:not([style*="display: none"])');
        sec.style.display = hasVisible.length > 0 ? '' : 'none';
      });
      updateAinewsCount();
      syncAinewsUrl(cat, document.getElementById('ainews-search')?.value || '');
    });
  }

  // Search functionality (debounced)
  var searchInput = document.getElementById('ainews-search');
  if (searchInput) {
    var _searchTimer;
    searchInput.addEventListener('input', function () {
      clearTimeout(_searchTimer);
      var input = this;
      _searchTimer = setTimeout(function () {
        var q = input.value.toLowerCase();
        grid.querySelectorAll('.ainews-card, .ainews-card-hero').forEach(function (el) {
          var text = el.textContent.toLowerCase();
          el.style.display = (!q || text.indexOf(q) !== -1) ? '' : 'none';
        });
        // Show all load-more items when searching
        if (q) {
          grid.querySelectorAll('.ainews-loadmore-item').forEach(function (el) { el.style.display = ''; });
          grid.querySelectorAll('.ainews-show-more').forEach(function (btn) { btn.style.display = 'none'; });
        }
        updateAinewsCount();
        var activeBtn = document.querySelector('#category-filters .ainews-filter.active');
        syncAinewsUrl(activeBtn ? activeBtn.dataset.cat : 'all', input.value);
      }, 200);
    });
  }

  // "Show more" buttons
  grid.querySelectorAll('.ainews-show-more').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetId = this.dataset.target;
      var step = parseInt(this.dataset.step, 10);
      var container = document.getElementById(targetId);
      if (!container) return;
      var hidden = container.querySelectorAll('.ainews-loadmore-item[style*="display: none"], .ainews-loadmore-item[style*="display:none"]');
      var count = 0;
      hidden.forEach(function (el) {
        if (count < step) { el.style.display = ''; count++; }
      });
      var remaining = container.querySelectorAll('.ainews-loadmore-item[style*="display: none"], .ainews-loadmore-item[style*="display:none"]').length;
      if (remaining === 0) {
        btn.style.display = 'none';
      } else {
        btn.textContent = 'Show ' + remaining + ' more';
      }
    });
  });

  // Apply URL state after render (category + search)
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
    var sel = document.getElementById('ainews-cat-select');
    if (sel) { sel.value = cat; sel.dispatchEvent(new Event('change')); }
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
