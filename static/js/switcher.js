// Mobile hamburger menu toggle + dropdown tap-to-toggle
document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.getElementById('hamburger-btn');
  const navLinks = document.getElementById('nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function() {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.classList.toggle('nav-open', isOpen);
    });
    navLinks.querySelectorAll('a:not(.dropdown-toggle)').forEach(link => {
      link.addEventListener('click', function() {
        navLinks.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
      });
    });
    document.addEventListener('click', function(e) {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
      }
    });
  }

  // Dropdown tap-to-toggle (mobile only — on desktop, clicks navigate)
  document.querySelectorAll('.dropdown-toggle').forEach(function(toggle) {
    toggle.addEventListener('click', function(e) {
      // On mobile (hamburger visible), toggle dropdown. On desktop, allow navigation.
      if (window.innerWidth <= 1024) {
        e.preventDefault();
        var parent = this.closest('.nav-dropdown');
        document.querySelectorAll('.nav-dropdown.open').forEach(function(dd) {
          if (dd !== parent) dd.classList.remove('open');
        });
        parent.classList.toggle('open');
      }
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown.open').forEach(function(dd) {
        dd.classList.remove('open');
      });
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

  // ── Raycast toolkit category filter with sliding indicator ──
  var filterBar = document.querySelector('.hp-ray-filters');
  var rayGrid = document.getElementById('hp-ray-grid');
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (filterBar && rayGrid) {
    var indicator = document.createElement('div');
    indicator.className = 'hp-ray-indicator';
    filterBar.appendChild(indicator);

    function moveIndicator(pill) {
      indicator.style.width = pill.offsetWidth + 'px';
      indicator.style.transform = 'translateX(' + pill.offsetLeft + 'px)';
    }

    // Initialize position without transition, then enable it
    var initPill = filterBar.querySelector('.hp-ray-pill.active');
    if (initPill) {
      moveIndicator(initPill);
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          indicator.style.transition = prefersReduced
            ? 'none'
            : 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), width 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
        });
      });
    }

    // Re-position on resize
    window.addEventListener('resize', function() {
      var active = filterBar.querySelector('.hp-ray-pill.active');
      if (active) moveIndicator(active);
    });

    filterBar.addEventListener('click', function(e) {
      var pill = e.target.closest('.hp-ray-pill');
      if (!pill) return;
      var cat = pill.dataset.cat;
      filterBar.querySelectorAll('.hp-ray-pill').forEach(function(p) {
        p.classList.remove('active');
        p.setAttribute('aria-pressed', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-pressed', 'true');
      moveIndicator(pill);
      pill.scrollIntoView({ behavior: prefersReduced ? 'instant' : 'smooth', inline: 'center', block: 'nearest' });
      rayGrid.querySelectorAll('.hp-ray-card').forEach(function(card) {
        if (cat === 'all' || card.dataset.cat === cat) {
          card.setAttribute('data-hidden', 'false');
        } else {
          card.setAttribute('data-hidden', 'true');
        }
      });
      // Dynamic rows: 1 row if ≤4 visible, 2 rows otherwise
      var visibleCount = rayGrid.querySelectorAll('.hp-ray-card:not([data-hidden="true"])').length;
      rayGrid.style.gridTemplateRows = visibleCount <= 4 ? '1fr' : 'repeat(2, auto)';
      rayGrid.scrollLeft = 0;
      updateNavButtons();
    });
  }

  // ── Carousel scroll navigation ──
  var rayWrapper = document.querySelector('.hp-ray-wrapper');
  if (rayWrapper && rayGrid) {
    var btnLeft = rayWrapper.querySelector('.hp-ray-nav-left');
    var btnRight = rayWrapper.querySelector('.hp-ray-nav-right');

    function updateNavButtons() {
      if (!btnLeft || !btnRight) return;
      btnLeft.disabled = rayGrid.scrollLeft <= 5;
      btnRight.disabled = rayGrid.scrollLeft + rayGrid.clientWidth >= rayGrid.scrollWidth - 5;
    }

    updateNavButtons();
    rayGrid.addEventListener('scroll', updateNavButtons, { passive: true });

    if (btnLeft) btnLeft.addEventListener('click', function() {
      rayGrid.scrollBy({ left: -rayGrid.clientWidth * 0.8, behavior: prefersReduced ? 'instant' : 'smooth' });
    });
    if (btnRight) btnRight.addEventListener('click', function() {
      rayGrid.scrollBy({ left: rayGrid.clientWidth * 0.8, behavior: prefersReduced ? 'instant' : 'smooth' });
    });
  }
});
