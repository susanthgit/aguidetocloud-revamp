document.addEventListener('DOMContentLoaded', async function () {
  try {
    var response = await fetch('/data/ainews/latest.json');
    var data = await response.json();
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
      fetch('/data/ainews/latest.json')
        .then(function (r) { return r.json(); })
        .then(function (data) { renderNews(data, view); });
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

function sortByCategory(articles) {
  return articles.sort(function (a, b) {
    var catA = a.category_name || a.category || 'General';
    var catB = b.category_name || b.category || 'General';
    var idxA = CATEGORY_ORDER.indexOf(catA);
    var idxB = CATEGORY_ORDER.indexOf(catB);
    if (idxA === -1) idxA = 999;
    if (idxB === -1) idxB = 999;
    return idxA - idxB;
  });
}

function renderNews(data, view) {
  var allArticles = Array.isArray(data) ? data : (data.articles || []);
  var articles = allArticles.filter(isAiRelated);
  articles = applyLimits(articles);
  articles = sortByCategory(articles);

  var grid = document.getElementById('news-grid');
  var dateEl = document.getElementById('news-date');
  var statsEl = document.getElementById('news-stats');
  var filtersEl = document.getElementById('category-filters');

  // Ordered unique categories
  var categories = [];
  var seen = {};
  articles.forEach(function (a) {
    var cat = a.category_name || a.category || 'General';
    if (!seen[cat]) { categories.push(cat); seen[cat] = true; }
  });

  var viewLabel = view === 'weekly' ? "This Week's" : view === 'monthly' ? "This Month's" : "Today's";
  dateEl.textContent = viewLabel + ' AI News';
  statsEl.textContent = articles.length + ' articles across ' + categories.length + ' categories';

  // Category filters
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
      grid.querySelectorAll('.ainews-card, .ainews-section-header').forEach(function (el) {
        if (cat === 'all') { el.style.display = ''; return; }
        el.style.display = (el.dataset.category === cat) ? '' : 'none';
      });
    });
  });

  // Render cards with section headers
  var html = '';
  var currentCat = '';
  articles.forEach(function (article) {
    var cat = article.category_name || article.category || 'General';
    var emoji = article.category_emoji || '';

    if (cat !== currentCat) {
      currentCat = cat;
      html += '<div class="ainews-section-header" data-category="' + escapeHtml(cat) + '">' +
        emoji + ' ' + escapeHtml(cat) + '</div>';
    }

    var summary = article.ai_summary || article.snippet || article.description || '';
    var source = article.source || '';
    var url = article.url || article.link || '#';
    var title = article.title || 'Untitled';
    var time = timeAgo(article.published);

    html += '<a href="' + escapeHtml(url) + '" target="_blank" rel="noopener" class="ainews-card" data-category="' + escapeHtml(cat) + '">' +
      '<span class="ainews-cat">' + emoji + ' ' + escapeHtml(cat) + '</span>' +
      '<h3>' + escapeHtml(title) + '</h3>' +
      '<p class="ainews-summary">' + escapeHtml(summary) + '</p>' +
      '<div class="ainews-meta">' +
        '<span class="ainews-source">' + escapeHtml(source) + '</span>' +
        '<span class="ainews-time">' + time + '</span>' +
      '</div>' +
    '</a>';
  });

  grid.innerHTML = html || '<p class="ainews-loading">No articles found for this period.</p>';
}
