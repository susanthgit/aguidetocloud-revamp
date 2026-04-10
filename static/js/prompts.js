document.addEventListener('DOMContentLoaded', function () {
  var activeFilters = { platform: 'all', role: 'all', usecase: 'all' };
  var searchQuery = '';

  var searchInput = document.getElementById('prompts-search');
  var chips = document.querySelectorAll('.prompts-chip');
  var cards = document.querySelectorAll('.prompt-card');
  var countEl = document.getElementById('prompts-count');

  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      searchQuery = this.value.toLowerCase().trim();
      filterCards();
    });
  }

  // Filter chips
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var type = this.dataset.filterType;
      var value = this.dataset.filterValue;

      // Deactivate siblings in the same row
      var row = this.closest('.prompts-filter-row');
      row.querySelectorAll('.prompts-chip').forEach(function (c) {
        c.classList.remove('active');
      });
      this.classList.add('active');

      activeFilters[type] = value;
      filterCards();
    });
  });

  // Copy buttons (delegated)
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.prompt-copy-btn, .prompt-full-copy');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();

    var text = btn.dataset.prompt;
    if (!text) return;

    navigator.clipboard.writeText(text).then(function () {
      var original = btn.textContent;
      btn.textContent = '✅ Copied!';
      btn.classList.add('copied');
      setTimeout(function () {
        btn.textContent = original;
        btn.classList.remove('copied');
      }, 2000);
    }).catch(function () {
      // Fallback for older browsers
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      btn.textContent = '✅ Copied!';
      btn.classList.add('copied');
      setTimeout(function () {
        btn.textContent = '📋 Copy';
        btn.classList.remove('copied');
      }, 2000);
    });
  });

  function filterCards() {
    var visible = 0;
    var emptyEl = document.getElementById('prompts-empty');

    cards.forEach(function (card) {
      var show = true;

      // Platform filter
      if (activeFilters.platform !== 'all') {
        var platforms = (card.dataset.platforms || '').split(' ');
        if (platforms.indexOf(activeFilters.platform) === -1) show = false;
      }

      // Role filter
      if (activeFilters.role !== 'all') {
        var roles = (card.dataset.roles || '').split(' ');
        if (roles.indexOf(activeFilters.role) === -1) show = false;
      }

      // Use case filter
      if (activeFilters.usecase !== 'all') {
        if (card.dataset.usecase !== activeFilters.usecase) show = false;
      }

      // Text search
      if (searchQuery) {
        var searchable = (card.dataset.searchText || card.textContent).toLowerCase();
        if (searchable.indexOf(searchQuery) === -1) show = false;
      }

      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    if (countEl) countEl.textContent = visible;

    // Toggle empty state
    if (emptyEl) {
      emptyEl.style.display = visible === 0 ? '' : 'none';
    }
  }
});
