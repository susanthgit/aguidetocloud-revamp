// Mobile hamburger menu toggle — V5.1: Whizlabs-style tab drawer
document.addEventListener('DOMContentLoaded', function() {
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hamburger = document.getElementById('hamburger-btn');
  const drawer = document.getElementById('nav-drawer');
  const backdrop = document.getElementById('nav-drawer-backdrop');

  function openDrawer() {
    if (drawer) drawer.classList.add('open');
    if (hamburger) { hamburger.classList.add('active'); hamburger.setAttribute('aria-expanded', 'true'); }
    document.body.classList.add('nav-open');
    if (backdrop) backdrop.classList.add('active');
  }
  function closeDrawer() {
    if (drawer) drawer.classList.remove('open');
    if (hamburger) { hamburger.classList.remove('active'); hamburger.setAttribute('aria-expanded', 'false'); }
    document.body.classList.remove('nav-open');
    if (backdrop) backdrop.classList.remove('active');
  }

  if (hamburger) {
    hamburger.addEventListener('click', function() {
      if (drawer && drawer.classList.contains('open')) closeDrawer();
      else openDrawer();
    });
  }
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  // Close drawer on link click
  if (drawer) {
    drawer.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', closeDrawer);
    });
  }

  // Close on Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
      closeDrawer();
      if (hamburger) hamburger.focus();
    }
  });

  // Close on outside click
  document.addEventListener('click', function(e) {
    if (drawer && drawer.classList.contains('open') &&
        !drawer.contains(e.target) && !hamburger.contains(e.target)) {
      closeDrawer();
    }
  });


  // ── Nav scroll enhancement: opacity + glow on scroll ──
  var siteNav = document.querySelector('.site-nav');
  if (siteNav) {
    var ticking = false;
    function updateNavScroll() {
      siteNav.classList.toggle('nav-scrolled', window.scrollY > 30);
    }
    updateNavScroll(); // set initial state on load
    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          updateNavScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }


  // ── Testimonials: static grid — no scroll animation needed ──

  // ── 🌸 Zen Theme Toggle ──
  var themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      var current = document.documentElement.getAttribute('data-theme') || 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch(e) {}
      // Update theme-color meta for mobile browsers
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.content = next === 'dark' ? '#0A0A0A' : '#FAFAFA';
    });
  }

  // ── Tool Fullscreen Toggle ──
  var fsBtn = document.getElementById('zt-fullscreen-toggle');
  if (fsBtn) {
    var wrapper = document.querySelector('.zt-reading--tool-detail');
    var isFullscreen = false;

    function toggleFullscreen() {
      isFullscreen = !isFullscreen;
      if (wrapper) wrapper.classList.toggle('zt-tool-fullscreen', isFullscreen);
      // Swap label text
      var label = fsBtn.querySelector('.zt-fs-label');
      if (label) label.textContent = isFullscreen ? 'Exit Focus' : 'Focus Mode';
      fsBtn.setAttribute('aria-label', isFullscreen ? 'Exit focus mode' : 'Enter focus mode');
      // Swap icon
      var svg = fsBtn.querySelector('svg');
      if (svg) {
        if (isFullscreen) {
          svg.innerHTML = '<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>';
        } else {
          svg.innerHTML = '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>';
        }
      }
      try { localStorage.removeItem('tool-fullscreen'); } catch(e) {}
    }

    fsBtn.addEventListener('click', toggleFullscreen);

    // Escape key exits fullscreen
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isFullscreen) toggleFullscreen();
    });
  }
});
