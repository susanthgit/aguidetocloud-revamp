// Category landing page — filter articles by category
document.addEventListener('DOMContentLoaded', async function () {
  var filter = window.__ainewsCategoryFilter;
  if (!filter) return;

  // Map URL slugs to category names
  var SLUG_TO_NAME = {
    'microsoft': 'Microsoft',
    'm365-copilot': 'M365 Copilot',
    'copilot-studio': 'Copilot Studio',
    'github-copilot': 'GitHub Copilot',
    'ai-foundry': 'AI Foundry',
    'openai': 'OpenAI',
    'anthropic': 'Anthropic',
    'google': 'Google',
    'meta': 'Meta',
    'deepseek': 'DeepSeek',
    'mistral': 'Mistral',
    'xai': 'xAI',
    'perplexity': 'Perplexity',
    'nvidia': 'NVIDIA',
    'apple': 'Apple',
    'amazon': 'Amazon'
  };

  var categoryName = SLUG_TO_NAME[filter] || filter;

  // Try monthly first (most articles), fall back to weekly, then daily
  var urls = ['/data/ainews/monthly.json', '/data/ainews/weekly.json', '/data/ainews/latest.json'];
  var data = null;

  for (var i = 0; i < urls.length; i++) {
    try {
      var resp = await fetch(urls[i]);
      if (resp.ok) {
        var raw = await resp.json();
        data = Array.isArray(raw) ? { articles: raw } : raw;
        if (data.articles && data.articles.length > 0) break;
      }
    } catch (e) { /* try next */ }
  }

  if (!data || !data.articles) {
    document.getElementById('news-grid').innerHTML =
      '<p style="color: var(--text-muted); text-align: center; grid-column: 1 / -1; padding: 3rem;">No articles available yet.</p>';
    return;
  }

  // Filter to this category only
  var filtered = data.articles.filter(function (a) {
    var cat = (a.category_name || a.category || '').toLowerCase();
    var catId = (a.category_id || '').toLowerCase();
    var target = categoryName.toLowerCase();
    return cat === target || catId === filter;
  });

  if (filtered.length === 0) {
    document.getElementById('news-grid').innerHTML =
      '<p style="color: var(--text-muted); text-align: center; grid-column: 1 / -1; padding: 3rem;">No ' + categoryName + ' articles found this period. <a href="/ai-news/" style="color: var(--neon-cyan);">View all news</a></p>';
    return;
  }

  // Render using the main ainews render functions
  window.__ainewsData = { articles: filtered, generated_at: data.generated_at };
  renderNews(window.__ainewsData, 'daily');
});
