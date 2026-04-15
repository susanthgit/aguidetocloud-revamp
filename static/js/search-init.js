// Pagefind search integration — replaces old search.js
(function() {
  var modal = document.getElementById('search-modal');
  var container = document.getElementById('pagefind-container');
  var openBtn = document.getElementById('search-btn');
  var closeBtn = document.getElementById('search-close');
  var pfInstance = null;

  if (!modal || !container) return;

  function initPagefind() {
    if (pfInstance) return;
    if (typeof PagefindUI === 'undefined') return;
    pfInstance = new PagefindUI({
      element: '#pagefind-container',
      showSubResults: true,
      showImages: false,
      excerptLength: 20,
      resetStyles: false,
      translations: {
        placeholder: 'Search tools, blog posts, prompts...',
        zero_results: 'No results — try different keywords',
        many_results: '{count} results',
        one_result: '1 result',
        searching: 'Searching...'
      }
    });
  }

  var openerEl = null;

  function openSearch() {
    initPagefind();
    openerEl = document.activeElement;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(function() {
      var input = container.querySelector('.pagefind-ui__search-input');
      if (input) { input.value = ''; input.focus(); }
    }, 100);
  }

  function closeSearch() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    if (openerEl && openerEl.focus) openerEl.focus();
  }

  // Focus trap within search modal
  modal.addEventListener('keydown', function(e) {
    if (e.key !== 'Tab') return;
    var focusable = modal.querySelectorAll('input, button, a[href], [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  if (openBtn) openBtn.addEventListener('click', openSearch);
  if (closeBtn) closeBtn.addEventListener('click', closeSearch);
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeSearch();
  });

  // Handle page-search partial clicks
  document.addEventListener('click', function(e) {
    var searchBox = e.target.closest('.page-search-box');
    if (searchBox) { e.preventDefault(); openSearch(); }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeSearch();
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
  });
})();
