document.addEventListener('DOMContentLoaded', function () {
  var activeFilter = 'all';
  var activeCategory = 'all';
  var searchQuery = '';
  var chips = document.querySelectorAll('.prompts-chip');
  var rows = document.querySelectorAll('.prompt-row');
  var groups = document.querySelectorAll('.prompts-category-group');
  var emptyEl = document.getElementById('prompts-empty');
  var searchInput = document.getElementById('prompts-search');
  var categorySelect = document.getElementById('prompts-category');
  var countEl = document.getElementById('prompts-count');
  var clearBtn = document.getElementById('prompts-clear');

  // ── SEARCH ─────────────────────────────────
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      searchQuery = this.value.toLowerCase().trim();
      filterAll();
    });
  }

  // ── CATEGORY DROPDOWN ──────────────────────
  if (categorySelect) {
    categorySelect.addEventListener('change', function () {
      activeCategory = this.value;
      filterAll();
    });
  }

  // ── PLATFORM CHIPS ─────────────────────────
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('active'); });
      this.classList.add('active');
      activeFilter = this.dataset.filterValue;
      filterAll();
    });
  });

  function filterAll() {
    var totalVisible = 0;

    rows.forEach(function (row) {
      var show = true;

      // Platform filter
      if (activeFilter !== 'all') {
        var platforms = (row.dataset.platforms || '').split(' ');
        if (platforms.indexOf(activeFilter) === -1) show = false;
      }

      // Search
      if (searchQuery && show) {
        var text = (row.dataset.searchText || '').toLowerCase();
        if (text.indexOf(searchQuery) === -1) show = false;
      }

      row.style.display = show ? '' : 'none';
      if (show) totalVisible++;
    });

    // Show/hide category groups
    groups.forEach(function (group) {
      var cat = group.dataset.category;

      // Category dropdown filter
      if (activeCategory !== 'all' && cat !== activeCategory) {
        group.style.display = 'none';
        return;
      }

      // Check if any rows visible in this group
      var hasVisible = false;
      group.querySelectorAll('.prompt-row').forEach(function (r) {
        if (r.style.display !== 'none') hasVisible = true;
      });
      group.style.display = hasVisible ? '' : 'none';
    });

    if (emptyEl) emptyEl.style.display = totalVisible === 0 ? '' : 'none';
    if (countEl) countEl.textContent = totalVisible;
    var hasFilters = activeFilter !== 'all' || activeCategory !== 'all' || searchQuery;
    if (clearBtn) clearBtn.style.display = hasFilters ? '' : 'none';
  }

  // ── CLEAR FILTERS ─────────────────────
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      activeFilter = 'all'; activeCategory = 'all'; searchQuery = '';
      if (searchInput) searchInput.value = '';
      if (categorySelect) categorySelect.value = 'all';
      chips.forEach(function (c) { c.classList.remove('active'); });
      var allChip = document.querySelector('.prompts-chip[data-filter-value="all"]');
      if (allChip) allChip.classList.add('active');
      filterAll();
    });
  }

  // ── ACCORDION TOGGLE + COPY ────────────────
  document.addEventListener('click', function (e) {
    // Copy button
    var copyBtn = e.target.closest('.prompt-copy-btn, .prompt-full-copy');
    if (copyBtn) {
      e.preventDefault();
      e.stopPropagation();
      var text = copyBtn.dataset.prompt;
      if (!text) return;
      navigator.clipboard.writeText(text).then(function () {
        copyBtn.textContent = '✅ Copied!';
        copyBtn.classList.add('copied');
        setTimeout(function () { copyBtn.textContent = '📋 Copy'; copyBtn.classList.remove('copied'); }, 2000);
      }).catch(function () {
        var ta = document.createElement('textarea');
        ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
        copyBtn.textContent = '✅ Copied!';
        setTimeout(function () { copyBtn.textContent = '📋 Copy'; }, 2000);
      });
      return;
    }

    // Accordion row toggle
    var rowHeader = e.target.closest('.prompt-row-header');
    if (rowHeader && !e.target.closest('a')) {
      var row = rowHeader.closest('.prompt-row');
      var body = row.querySelector('.prompt-row-body');
      var arrow = rowHeader.querySelector('.prompt-row-arrow');
      var isOpen = !body.hidden;
      body.hidden = isOpen;
      arrow.textContent = isOpen ? '▸' : '▾';
      rowHeader.setAttribute('aria-expanded', !isOpen);
    }

    // Open-in-platform buttons (copy prompt then navigate)
    var openBtn = e.target.closest('.prompt-open-btn');
    if (openBtn) {
      var promptEl = document.querySelector('.prompt-full-text');
      if (promptEl) navigator.clipboard.writeText(promptEl.textContent.trim()).catch(function(){});
    }
  });
});
