// Mobile hamburger menu toggle + dropdown tap-to-toggle
document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.getElementById('hamburger-btn');
  const navLinks = document.getElementById('nav-links');
  if (hamburger && navLinks) {
    hamburger.setAttribute('aria-controls', 'nav-links');
    hamburger.addEventListener('click', function() {
      var isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.classList.toggle('nav-open', isOpen);
      if (isOpen) {
        var firstLink = navLinks.querySelector('a');
        if (firstLink) firstLink.focus();
      }
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
    // Escape key closes mobile menu
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
        hamburger.focus();
      }
    });
    // Focus trap within mobile menu
    navLinks.addEventListener('keydown', function(e) {
      if (e.key !== 'Tab' || !navLinks.classList.contains('open')) return;
      var focusable = navLinks.querySelectorAll('a, button');
      if (focusable.length === 0) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  // Dropdown tap-to-toggle (mobile only — on desktop, clicks navigate)
  document.querySelectorAll('.dropdown-toggle').forEach(function(toggle) {
    toggle.setAttribute('aria-haspopup', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', function(e) {
      // On mobile (hamburger visible), toggle dropdown. On desktop, allow navigation.
      if (window.innerWidth <= 1024) {
        e.preventDefault();
        var parent = this.closest('.nav-dropdown');
        var wasOpen = parent.classList.contains('open');
        document.querySelectorAll('.nav-dropdown.open').forEach(function(dd) {
          if (dd !== parent) {
            dd.classList.remove('open');
            dd.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
          }
        });
        parent.classList.toggle('open');
        this.setAttribute('aria-expanded', !wasOpen);
      }
    });
    // Keyboard: Enter/Space opens dropdown, Escape closes
    toggle.addEventListener('keydown', function(e) {
      var parent = this.closest('.nav-dropdown');
      var menu = parent.querySelector('.dropdown-menu, .mega-dropdown');
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        var wasOpen = parent.classList.contains('open');
        document.querySelectorAll('.nav-dropdown.open').forEach(function(dd) {
          dd.classList.remove('open');
          dd.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
        });
        if (!wasOpen) {
          parent.classList.add('open');
          this.setAttribute('aria-expanded', 'true');
          // Focus first link in dropdown
          if (menu) {
            var firstLink = menu.querySelector('a');
            if (firstLink) firstLink.focus();
          }
        }
      }
      if (e.key === 'Escape') {
        parent.classList.remove('open');
        this.setAttribute('aria-expanded', 'false');
        this.focus();
      }
      // ArrowDown opens dropdown and focuses first item
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        parent.classList.add('open');
        this.setAttribute('aria-expanded', 'true');
        if (menu) {
          var firstLink = menu.querySelector('a');
          if (firstLink) firstLink.focus();
        }
      }
    });
  });

  // Keyboard navigation within dropdown menus
  document.querySelectorAll('.dropdown-menu, .mega-dropdown').forEach(function(menu) {
    menu.addEventListener('keydown', function(e) {
      var links = Array.from(this.querySelectorAll('a'));
      var idx = links.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (idx < links.length - 1) links[idx + 1].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (idx > 0) links[idx - 1].focus();
        else {
          var toggle = this.closest('.nav-dropdown').querySelector('.dropdown-toggle');
          if (toggle) toggle.focus();
        }
      } else if (e.key === 'Escape') {
        var parent = this.closest('.nav-dropdown');
        var toggle = parent.querySelector('.dropdown-toggle');
        parent.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
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

  // ── Mega-menu mobile accordion ──
  document.querySelectorAll('.mega-label').forEach(function(label) {
    label.addEventListener('click', function(e) {
      if (window.innerWidth > 1024) return; // Desktop: no accordion
      e.preventDefault();
      var group = this.nextElementSibling;
      if (!group || !group.classList.contains('mega-group')) return;
      var wasOpen = group.classList.contains('mega-group--open');
      // Close all other groups in this mega-menu
      var mega = this.closest('.mega-menu');
      if (mega) {
        mega.querySelectorAll('.mega-group--open').forEach(function(g) {
          g.classList.remove('mega-group--open');
        });
        mega.querySelectorAll('.mega-label[aria-expanded="true"]').forEach(function(l) {
          l.setAttribute('aria-expanded', 'false');
        });
      }
      // Toggle this group
      if (!wasOpen) {
        group.classList.add('mega-group--open');
        this.setAttribute('aria-expanded', 'true');
      }
    });
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
    // One-time entrance animation
    if (!prefersReduced) rayGrid.classList.add('hp-ray-animate');
    rayGrid.addEventListener('animationend', function() {
      rayGrid.classList.remove('hp-ray-animate');
    }, { once: true });
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
      // Only scrollIntoView the pill on desktop — on mobile it fights with touch scrolling
      if (window.innerWidth > 768) {
        pill.scrollIntoView({ behavior: prefersReduced ? 'instant' : 'smooth', inline: 'center', block: 'nearest' });
      }
      rayGrid.querySelectorAll('.hp-ray-card').forEach(function(card) {
        if (cat === 'all' || card.dataset.cat === cat) {
          card.setAttribute('data-hidden', 'false');
        } else {
          card.setAttribute('data-hidden', 'true');
        }
      });
      // Dynamic rows: mobile = always 1 row; desktop = 1 row if ≤4 visible, 2 rows otherwise
      var visibleCount = rayGrid.querySelectorAll('.hp-ray-card:not([data-hidden="true"])').length;
      var isMobile = window.innerWidth <= 768;
      rayGrid.style.gridTemplateRows = (isMobile || visibleCount <= 4) ? '1fr' : 'repeat(2, auto)';
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
      var canScroll = rayGrid.scrollWidth > rayGrid.clientWidth + 5;
      btnLeft.style.display = canScroll ? '' : 'none';
      btnRight.style.display = canScroll ? '' : 'none';
      if (canScroll) {
        btnLeft.disabled = rayGrid.scrollLeft <= 5;
        btnRight.disabled = rayGrid.scrollLeft + rayGrid.clientWidth >= rayGrid.scrollWidth - 5;
      }
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

  // ── Testimonials infinite scroll (clone cards for seamless loop) ──
  var testimonialScroll = document.querySelector('.hp-testimonials-scroll');
  if (testimonialScroll) {
    var items = testimonialScroll.innerHTML;
    testimonialScroll.innerHTML = items + items;
  }

  // ── Cursor glow effect (homepage only, desktop only) ──
  if (document.body.classList.contains('is-home') && window.innerWidth > 768 && !prefersReduced) {
    var glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    document.addEventListener('mousemove', function(e) {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    }, { passive: true });
  }
});
