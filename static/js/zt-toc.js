/* ═══════════════════════════════════════════════════════════
   🌸 ZEN TOC — Active heading highlight via IntersectionObserver
   Progressive enhancement: TOC works without JS. This adds
   active-state highlighting as the reader scrolls.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var sidebar = document.querySelector('.zt-toc #TableOfContents');
  if (!sidebar) return;

  var headings = document.querySelectorAll(
    '.zt-reading-body h2[id], .zt-reading-body h3[id], .zt-reading-body h4[id]'
  );
  if (!headings.length) return;

  var links = sidebar.querySelectorAll('a');
  var linkMap = {};
  links.forEach(function (a) {
    var href = a.getAttribute('href');
    if (href && href.charAt(0) === '#') {
      linkMap[href.slice(1)] = a;
    }
  });

  function setActive(id) {
    links.forEach(function (a) { a.classList.remove('active'); });
    if (id && linkMap[id]) {
      linkMap[id].classList.add('active');
    }
  }

  // Use IntersectionObserver for efficient scroll tracking
  var currentId = '';
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          currentId = entry.target.id;
          setActive(currentId);
        }
      });
    },
    {
      rootMargin: '-80px 0px -70% 0px',
      threshold: 0
    }
  );

  headings.forEach(function (h) {
    observer.observe(h);
  });

  // Reading progress bar
  var progressBar = document.querySelector('.zt-reading-progress');
  if (progressBar) {
    var article = document.querySelector('.zt-reading-body');
    if (article) {
      window.addEventListener('scroll', function () {
        var rect = article.getBoundingClientRect();
        var total = article.scrollHeight - window.innerHeight;
        var scrolled = -rect.top;
        var pct = Math.min(Math.max(scrolled / total * 100, 0), 100);
        progressBar.style.width = pct + '%';
      }, { passive: true });
    }
  }
})();
