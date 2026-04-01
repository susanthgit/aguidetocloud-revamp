document.addEventListener('DOMContentLoaded', async function () {
  try {
    var response = await fetch('/data/ainews/latest.json');
    var raw = await response.json();
    // Support both old (bare array) and new (object with articles key) format
    var data = Array.isArray(raw) ? { articles: raw, generated_at: null } : raw;
    window.__ainewsData = data;
    renderNews(data, 'daily');
  } catch (e) {
    document.getElementById('news-grid').innerHTML =
      '<p style="color: var(--text-muted); text-align: center; grid-column: 1 / -1; padding: 3rem;">AI News data not available yet. Check back tomorrow!</p>';
  }

  // Tab switching
  document.querySelectorAll('.ainews-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.ainews-tab').forEach(function (t) { t.classList.remove('active'); });
      this.classList.add('active');
      var view = this.dataset.view;
      if (window.__ainewsData) renderNews(window.__ainewsData, view);
    });
  });
});

// Microsoft-related categories get unlimited articles, others capped at 10
var MICROSOFT_CATS = ['microsoft', 'm365 copilot', 'copilot studio', 'ai foundry', 'azure ai'];
var MAX_OTHER = 10;

// Display order: Top Stories first, then Microsoft family, then rest
var CATEGORY_ORDER = [
  'Top Stories', 'Microsoft', 'M365 Copilot', 'Copilot Studio', 'AI Foundry',
  'OpenAI', 'Google', 'Meta', 'Anthropic', 'Open Source', 'Industry', 'Rumours'
];

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
  'meta llama', 'mistral', 'phi-', 'deepseek', 'hugging face',
  'langchain', 'semantic kernel', 'autogen', 'crew ai', 'mcp server',
  'model context protocol', 'ai adoption', 'ai strategy', 'ai tool'
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

function renderNews(data, view) {
  var allArticles = data.articles || [];
  var generatedAt = data.generated_at;
  var articles = allArticles.filter(isAiRelated);
  articles = applyLimits(articles);

  var grid = document.getElementById('news-grid');
  var dateEl = document.getElementById('news-date');
  var statsEl = document.getElementById('news-stats');
  var filtersEl = document.getElementById('category-filters');

  // Separate by tier
  var headlines = articles.filter(function (a) { return a.tier === 'headline'; });
  var deepDives = articles.filter(function (a) { return a.tier === 'deep_dive' || !a.tier; });
  var quickLinks = articles.filter(function (a) { return a.tier === 'quick'; });

  var viewLabel = view === 'weekly' ? "This Week's" : view === 'monthly' ? "This Month's" : "Today's";
  dateEl.textContent = viewLabel + ' AI News';

  // Updated timestamp
  var updatedStr = '';
  if (generatedAt) {
    updatedStr = ' · Updated ' + timeAgo(generatedAt);
  }
  statsEl.textContent = articles.length + ' articles across ' + countCategories(articles) + ' categories' + updatedStr;

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
  filtersEl.innerHTML = '<button class="ainews-filter active" data-cat="all">All (' + articles.length + ')</button>' +
    categories.map(function (cat) {
      var count = articles.filter(function (a) { return (a.category_name || a.category || 'General') === cat; }).length;
      return '<button class="ainews-filter" data-cat="' + escapeHtml(cat) + '">' + escapeHtml(cat) + ' (' + count + ')</button>';
    }).join('');

  filtersEl.querySelectorAll('.ainews-filter').forEach(function (btn) {
    btn.addEventListener('click', function () {
      filtersEl.querySelectorAll('.ainews-filter').forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');
      var cat = this.dataset.cat;
      grid.querySelectorAll('.ainews-card, .ainews-card-hero, .ainews-quick-item, .ainews-section-header').forEach(function (el) {
        if (cat === 'all') { el.style.display = ''; return; }
        el.style.display = (el.dataset.category === cat) ? '' : 'none';
      });
      // Also show/hide section headers
      grid.querySelectorAll('.ainews-tier-section').forEach(function (sec) {
        var hasVisible = sec.querySelectorAll('.ainews-card:not([style*="display: none"]), .ainews-card-hero:not([style*="display: none"]), .ainews-quick-item:not([style*="display: none"])');
        sec.style.display = hasVisible.length > 0 ? '' : 'none';
      });
    });
  });

  // Build 3-tier HTML
  var html = '';

  // 🔥 HEADLINES
  if (headlines.length > 0) {
    html += '<div class="ainews-tier-section">';
    html += '<div class="ainews-tier-header ainews-tier-headlines"><span>🔥</span> Headlines</div>';
    html += '<div class="ainews-heroes">';
    headlines.forEach(function (article) {
      html += renderHeroCard(article);
    });
    html += '</div></div>';
  }

  // 🧠 DEEP DIVES
  if (deepDives.length > 0) {
    html += '<div class="ainews-tier-section">';
    html += '<div class="ainews-tier-header ainews-tier-deepdives"><span>🧠</span> Deep Dives</div>';
    deepDives.forEach(function (article) {
      html += renderCard(article);
    });
    html += '</div>';
  }

  // ⚡ QUICK LINKS
  if (quickLinks.length > 0) {
    html += '<div class="ainews-tier-section">';
    html += '<div class="ainews-tier-header ainews-tier-quick"><span>⚡</span> Quick Links</div>';
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
}

function renderHeroCard(article) {
  var cat = article.category_name || article.category || 'General';
  var emoji = article.category_emoji || '';
  var summary = article.ai_summary || article.snippet || '';
  var whyMatters = article.why_it_matters || '';
  var source = article.source || '';
  var url = article.url || article.link || '#';
  var title = article.title || 'Untitled';
  var time = timeAgo(article.published);
  var favicon = getFaviconUrl(url);

  return '<a href="' + escapeHtml(url) + '" target="_blank" rel="noopener" class="ainews-card-hero" data-category="' + escapeHtml(cat) + '">' +
    '<span class="ainews-cat">' + emoji + ' ' + escapeHtml(cat) + '</span>' +
    '<h3>' + escapeHtml(title) + '</h3>' +
    '<p class="ainews-summary">' + escapeHtml(summary) + '</p>' +
    (whyMatters ? '<p class="ainews-why"><strong>Why it matters:</strong> ' + escapeHtml(whyMatters) + '</p>' : '') +
    '<div class="ainews-meta">' +
      (favicon ? '<img src="' + favicon + '" alt="" class="ainews-favicon" loading="lazy">' : '') +
      '<span class="ainews-source">' + escapeHtml(source) + '</span>' +
      '<span class="ainews-time">' + time + '</span>' +
    '</div>' +
  '</a>';
}

function renderCard(article) {
  var cat = article.category_name || article.category || 'General';
  var emoji = article.category_emoji || '';
  var summary = article.ai_summary || article.snippet || '';
  var whyMatters = article.why_it_matters || '';
  var source = article.source || '';
  var url = article.url || article.link || '#';
  var title = article.title || 'Untitled';
  var time = timeAgo(article.published);
  var favicon = getFaviconUrl(url);

  return '<a href="' + escapeHtml(url) + '" target="_blank" rel="noopener" class="ainews-card" data-category="' + escapeHtml(cat) + '">' +
    '<span class="ainews-cat">' + emoji + ' ' + escapeHtml(cat) + '</span>' +
    '<h3>' + escapeHtml(title) + '</h3>' +
    '<p class="ainews-summary">' + escapeHtml(summary) + '</p>' +
    (whyMatters ? '<p class="ainews-why"><strong>Why it matters:</strong> ' + escapeHtml(whyMatters) + '</p>' : '') +
    '<div class="ainews-meta">' +
      (favicon ? '<img src="' + favicon + '" alt="" class="ainews-favicon" loading="lazy">' : '') +
      '<span class="ainews-source">' + escapeHtml(source) + '</span>' +
      '<span class="ainews-time">' + time + '</span>' +
    '</div>' +
  '</a>';
}

function renderQuickLink(article) {
  var cat = article.category_name || article.category || 'General';
  var emoji = article.category_emoji || '';
  var source = article.source || '';
  var url = article.url || article.link || '#';
  var title = article.title || 'Untitled';
  var time = timeAgo(article.published);
  var whyMatters = article.why_it_matters || '';
  var favicon = getFaviconUrl(url);

  return '<a href="' + escapeHtml(url) + '" target="_blank" rel="noopener" class="ainews-quick-item" data-category="' + escapeHtml(cat) + '">' +
    '<span class="ainews-quick-emoji">' + emoji + '</span>' +
    '<span class="ainews-quick-title">' + escapeHtml(title) + '</span>' +
    (whyMatters ? '<span class="ainews-quick-why">' + escapeHtml(whyMatters) + '</span>' : '') +
    '<span class="ainews-quick-meta">' +
      (favicon ? '<img src="' + favicon + '" alt="" class="ainews-favicon" loading="lazy">' : '') +
      escapeHtml(source) + ' · ' + time +
    '</span>' +
  '</a>';
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
