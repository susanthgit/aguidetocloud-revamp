// Site search — loads JSON index and filters client-side
(function() {
  let searchIndex = null;
  const modal = document.getElementById('search-modal');
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  const openBtn = document.getElementById('search-btn');
  const closeBtn = document.getElementById('search-close');

  if (!modal || !input || !results) return;

  async function loadIndex() {
    if (searchIndex) return;
    try {
      const res = await fetch('/index.json');
      searchIndex = await res.json();
    } catch (e) {
      searchIndex = [];
    }
  }

  function openSearch() {
    loadIndex();
    modal.classList.add('active');
    input.value = '';
    results.innerHTML = '';
    setTimeout(() => input.focus(), 100);
  }

  function closeSearch() {
    modal.classList.remove('active');
  }

  function doSearch(query) {
    if (!searchIndex || !query.trim()) {
      results.innerHTML = '';
      return;
    }
    const q = query.toLowerCase();
    const matches = searchIndex.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.card_tag.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.section.toLowerCase().includes(q)
    ).slice(0, 12);

    if (matches.length === 0) {
      results.innerHTML = '<div class="search-no-results">No results found</div>';
      return;
    }

    results.innerHTML = matches.map(item => `
      <a href="${item.url}" class="search-result-item">
        <span class="search-result-title">${item.title}</span>
        <div class="search-result-meta">
          ${item.card_tag ? `<span class="search-result-badge ${item.tag_class}">${item.card_tag}</span>` : ''}
          <span class="search-result-date">${item.date}</span>
        </div>
      </a>
    `).join('');
  }

  if (openBtn) openBtn.addEventListener('click', openSearch);
  if (closeBtn) closeBtn.addEventListener('click', closeSearch);
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeSearch();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeSearch();
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
  });
  input.addEventListener('input', function() {
    doSearch(this.value);
  });
})();
