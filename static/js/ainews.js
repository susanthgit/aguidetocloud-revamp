document.addEventListener('DOMContentLoaded', async function () {
  try {
    const response = await fetch('/data/ainews/latest.json');
    const data = await response.json();
    renderNews(data);
  } catch (e) {
    document.getElementById('news-grid').innerHTML =
      '<p style="color: var(--text-muted); text-align: center; grid-column: 1 / -1; padding: 3rem;">AI News data not available yet. Check back tomorrow!</p>';
  }
});

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return mins + 'm ago';
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + 'h ago';
  const days = Math.floor(hours / 24);
  if (days < 7) return days + 'd ago';
  return then.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderNews(data) {
  var articles = Array.isArray(data) ? data : (data.articles || []);
  var grid = document.getElementById('news-grid');
  var dateEl = document.getElementById('news-date');
  var statsEl = document.getElementById('news-stats');
  var filtersEl = document.getElementById('category-filters');

  // Build categories from category_name field
  var categories = [...new Set(articles.map(function (a) { return a.category_name || a.category || 'General'; }))];

  // Render date
  if (data.date) {
    dateEl.textContent = 'News for ' + data.date;
  } else if (articles.length > 0 && articles[0].published) {
    var d = new Date(articles[0].published);
    dateEl.textContent = 'News for ' + d.toLocaleDateString('en-NZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  } else {
    dateEl.textContent = 'Latest AI News';
  }

  // Render stats
  statsEl.textContent = articles.length + ' articles across ' + categories.length + ' categories';

  // Render category filters
  filtersEl.innerHTML = '<button class="ainews-filter active" data-cat="all">All</button>' +
    categories.map(function (cat) {
      var count = articles.filter(function (a) { return (a.category_name || a.category || 'General') === cat; }).length;
      return '<button class="ainews-filter" data-cat="' + escapeHtml(cat) + '">' + escapeHtml(cat) + ' (' + count + ')</button>';
    }).join('');

  // Add filter click handlers
  filtersEl.querySelectorAll('.ainews-filter').forEach(function (btn) {
    btn.addEventListener('click', function () {
      filtersEl.querySelectorAll('.ainews-filter').forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');
      var cat = this.dataset.cat;
      grid.querySelectorAll('.ainews-card').forEach(function (card) {
        card.style.display = (cat === 'all' || card.dataset.category === cat) ? '' : 'none';
      });
    });
  });

  // Render cards
  grid.innerHTML = articles.map(function (article) {
    var summary = article.ai_summary || article.snippet || article.description || '';
    var source = article.source || '';
    var cat = article.category_name || article.category || 'General';
    var emoji = article.category_emoji || '';
    var url = article.url || article.link || '#';
    var title = article.title || 'Untitled';
    var time = timeAgo(article.published);

    return '<a href="' + escapeHtml(url) + '" target="_blank" rel="noopener" class="ainews-card" data-category="' + escapeHtml(cat) + '">' +
      '<span class="ainews-cat">' + emoji + ' ' + escapeHtml(cat) + '</span>' +
      '<h3>' + escapeHtml(title) + '</h3>' +
      '<p class="ainews-summary">' + escapeHtml(summary) + '</p>' +
      '<div class="ainews-meta">' +
        '<span class="ainews-source">' + escapeHtml(source) + '</span>' +
        '<span class="ainews-time">' + time + '</span>' +
      '</div>' +
    '</a>';
  }).join('');
}
