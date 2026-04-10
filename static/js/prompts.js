document.addEventListener('DOMContentLoaded', function () {
  // ── STATE ──────────────────────────────────────
  var activeFilters = { platform: 'all', role: 'all', surface: 'all' };
  var searchQuery = '';
  var favourites = JSON.parse(localStorage.getItem('prompt-favourites') || '[]');
  var copyCounts = JSON.parse(localStorage.getItem('prompt-copy-counts') || '{}');

  // ── ELEMENTS ───────────────────────────────────
  var searchInput = document.getElementById('prompts-search');
  var chips = document.querySelectorAll('.prompts-chip');
  var cards = document.querySelectorAll('.prompt-card');
  var countEl = document.getElementById('prompts-count');
  var emptyEl = document.getElementById('prompts-empty');
  var sortEl = document.getElementById('prompts-sort');
  var grid = document.querySelector('.prompts-grid');

  // ── INIT ───────────────────────────────────────
  initFavourites();
  initPopularBadges();
  updateFilterCounts();
  readURLState();

  // ── SEARCH ─────────────────────────────────────
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      searchQuery = this.value.toLowerCase().trim();
      filterCards();
    });
  }

  // ── FILTER CHIPS ───────────────────────────────
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var type = this.dataset.filterType;
      var value = this.dataset.filterValue;
      var row = this.closest('.prompts-filter-row');
      row.querySelectorAll('.prompts-chip').forEach(function (c) { c.classList.remove('active'); });
      this.classList.add('active');
      activeFilters[type] = value;
      filterCards();
      updateURL();
    });
  });

  // ── SORT ───────────────────────────────────────
  if (sortEl) {
    sortEl.addEventListener('change', function () {
      var value = this.value;
      var arr = Array.from(cards);
      arr.sort(function (a, b) {
        if (value === 'az') return (a.dataset.title || '').localeCompare(b.dataset.title || '');
        if (value === 'difficulty') {
          var d = { beginner: 1, intermediate: 2, advanced: 3 };
          return (d[a.dataset.difficulty] || 1) - (d[b.dataset.difficulty] || 1);
        }
        if (value === 'category') return (a.dataset.usecase || '').localeCompare(b.dataset.usecase || '');
        if (value === 'popular') {
          var ca = copyCounts[a.dataset.slug] || 0;
          var cb = copyCounts[b.dataset.slug] || 0;
          return cb - ca;
        }
        return 0;
      });
      arr.forEach(function (card) { grid.appendChild(card); });
    });
  }

  // ── DELEGATED CLICKS ───────────────────────────
  document.addEventListener('click', function (e) {
    // Copy buttons
    var copyBtn = e.target.closest('.prompt-copy-btn, .prompt-full-copy');
    if (copyBtn) { handleCopy(copyBtn); return; }

    // Favourite buttons
    var favBtn = e.target.closest('.prompt-fav-btn');
    if (favBtn) { e.preventDefault(); handleFavourite(favBtn); return; }

    // Random button
    if (e.target.closest('#prompts-random')) { handleRandom(); return; }

    // Open-in buttons (copy then navigate)
    var openBtn = e.target.closest('.prompt-open-btn');
    if (openBtn) {
      var prompt = document.querySelector('.prompt-full-text');
      if (prompt) navigator.clipboard.writeText(prompt.textContent.trim()).catch(function(){});
    }
  });

  // ── COPY WITH TRACKING ─────────────────────────
  function handleCopy(btn) {
    var text = btn.dataset.prompt;
    if (!text) return;

    // Track copy count
    var slug = btn.closest('.prompt-card, .prompt-single')?.dataset?.slug || '';
    if (slug) {
      copyCounts[slug] = (copyCounts[slug] || 0) + 1;
      try { localStorage.setItem('prompt-copy-counts', JSON.stringify(copyCounts)); } catch(e){}
      updatePopularBadge(slug);
    }

    navigator.clipboard.writeText(text).then(function () {
      showCopied(btn);
    }).catch(function () {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      showCopied(btn);
    });
  }

  function showCopied(btn) {
    var original = btn.textContent;
    btn.textContent = '✅ Copied!'; btn.classList.add('copied');
    setTimeout(function () { btn.textContent = original; btn.classList.remove('copied'); }, 2000);
  }

  // ── FAVOURITES ─────────────────────────────────
  function initFavourites() {
    document.querySelectorAll('.prompt-fav-btn').forEach(function (btn) {
      var slug = btn.dataset.slug;
      if (favourites.indexOf(slug) !== -1) {
        btn.classList.add('fav-active');
        btn.textContent = '❤️';
      }
    });
  }

  function handleFavourite(btn) {
    var slug = btn.dataset.slug;
    var idx = favourites.indexOf(slug);
    if (idx === -1) {
      favourites.push(slug);
      btn.classList.add('fav-active');
      btn.textContent = '❤️';
    } else {
      favourites.splice(idx, 1);
      btn.classList.remove('fav-active');
      btn.textContent = '♡';
    }
    try { localStorage.setItem('prompt-favourites', JSON.stringify(favourites)); } catch(e){}
  }

  // ── POPULAR BADGES ─────────────────────────────
  function initPopularBadges() {
    cards.forEach(function (card) {
      var slug = card.dataset.slug;
      if (slug && (copyCounts[slug] || 0) >= 5) {
        addPopularBadge(card);
      }
    });
  }

  function updatePopularBadge(slug) {
    if ((copyCounts[slug] || 0) >= 5) {
      var card = document.querySelector('.prompt-card[data-slug="' + slug + '"]');
      if (card && !card.querySelector('.prompt-popular')) addPopularBadge(card);
    }
  }

  function addPopularBadge(card) {
    if (card.querySelector('.prompt-popular')) return;
    var badge = document.createElement('span');
    badge.className = 'prompt-popular';
    badge.textContent = '🔥 Popular';
    card.querySelector('.prompt-card-header')?.appendChild(badge);
  }

  // ── RANDOM PROMPT ──────────────────────────────
  function handleRandom() {
    var visible = [];
    cards.forEach(function (c) { if (c.style.display !== 'none') visible.push(c); });
    if (visible.length === 0) return;
    var pick = visible[Math.floor(Math.random() * visible.length)];
    // Flash highlight and scroll
    pick.scrollIntoView({ behavior: 'smooth', block: 'center' });
    pick.classList.add('prompt-card-highlight');
    setTimeout(function () { pick.classList.remove('prompt-card-highlight'); }, 2000);
  }

  // ── FILTER COUNTS ──────────────────────────────
  function updateFilterCounts() {
    chips.forEach(function (chip) {
      var type = chip.dataset.filterType;
      var value = chip.dataset.filterValue;
      if (value === 'all') return;

      var count = 0;
      cards.forEach(function (card) {
        var match = false;
        if (type === 'platform') match = (card.dataset.platforms || '').split(' ').indexOf(value) !== -1;
        else if (type === 'role') match = (card.dataset.roles || '').split(' ').indexOf(value) !== -1;
        else if (type === 'surface') match = (card.dataset.surfaces || '').split(' ').indexOf(value) !== -1;
        if (match) count++;
      });

      // Append count
      var label = chip.textContent.replace(/\s*\(\d+\)$/, '');
      chip.textContent = label + ' (' + count + ')';
    });
  }

  // ── URL STATE ──────────────────────────────────
  function updateURL() {
    var params = new URLSearchParams();
    if (activeFilters.platform !== 'all') params.set('platform', activeFilters.platform);
    if (activeFilters.role !== 'all') params.set('role', activeFilters.role);
    if (activeFilters.surface !== 'all') params.set('surface', activeFilters.surface);
    if (searchQuery) params.set('q', searchQuery);
    var qs = params.toString();
    var url = window.location.pathname + (qs ? '?' + qs : '');
    history.replaceState(null, '', url);
  }

  function readURLState() {
    var params = new URLSearchParams(window.location.search);
    var changed = false;
    ['platform', 'role', 'surface'].forEach(function (key) {
      var val = params.get(key);
      if (val) {
        activeFilters[key] = val;
        // Activate the correct chip
        document.querySelectorAll('.prompts-chip[data-filter-type="' + key + '"]').forEach(function (c) {
          c.classList.remove('active');
          if (c.dataset.filterValue === val) c.classList.add('active');
        });
        changed = true;
      }
    });
    var q = params.get('q');
    if (q && searchInput) { searchInput.value = q; searchQuery = q.toLowerCase().trim(); changed = true; }
    if (changed) filterCards();
  }

  // ── FILTER LOGIC ───────────────────────────────
  function filterCards() {
    var visible = 0;
    cards.forEach(function (card) {
      var show = true;

      if (activeFilters.platform !== 'all') {
        if ((card.dataset.platforms || '').split(' ').indexOf(activeFilters.platform) === -1) show = false;
      }
      if (activeFilters.role !== 'all') {
        if ((card.dataset.roles || '').split(' ').indexOf(activeFilters.role) === -1) show = false;
      }
      if (activeFilters.surface !== 'all') {
        if ((card.dataset.surfaces || '').split(' ').indexOf(activeFilters.surface) === -1) show = false;
      }
      if (searchQuery) {
        if ((card.dataset.searchText || card.textContent).toLowerCase().indexOf(searchQuery) === -1) show = false;
      }

      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    if (countEl) countEl.textContent = visible;
    if (emptyEl) emptyEl.style.display = visible === 0 ? '' : 'none';
  }
});

// ── BACK TO TOP (independent — runs even if filters error) ──
(function () {
  var btt = document.getElementById('prompts-btt');
  if (!btt) return;
  window.addEventListener('scroll', function () {
    btt.classList.toggle('prompts-btt-show', window.scrollY > 400);
  });
  btt.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
