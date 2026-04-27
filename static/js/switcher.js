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
});
