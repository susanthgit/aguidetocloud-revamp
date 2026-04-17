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
      if (cat === 'all') { rayGrid.classList.remove('hp-ray-filtered'); }
      else { rayGrid.classList.add('hp-ray-filtered'); }
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

// ── Smart Mega Menu: Search + Recent Tools ──────────────────────────────
(function(){
  const TOOLS = [
    {name:'Prompt Library',url:'/prompts/'},
    {name:'Prompt Polisher',url:'/prompt-polisher/'},
    {name:'Prompt Guide',url:'/prompt-guide/'},
    {name:'Advanced Prompt Lab',url:'/prompt-lab/'},
    {name:'Copilot Readiness',url:'/copilot-readiness/'},
    {name:'Copilot Features',url:'/copilot-matrix/'},
    {name:'ROI Calculator',url:'/roi-calculator/'},
    {name:'AI News',url:'/ai-news/'},
    {name:'M365 Roadmap',url:'/m365-roadmap/'},
    {name:'Service Health',url:'/service-health/'},
    {name:'Deprecation Timeline',url:'/deprecation-timeline/'},
    {name:'Feature Roulette',url:'/feature-roulette/'},
    {name:'Rename Tracker',url:'/rename-tracker/'},
    {name:'AI Service Mapper',url:'/ai-mapper/'},
    {name:'AI SaaS Showdown',url:'/ai-showdown/'},
    {name:'AI Cost Calculator',url:'/ai-cost-calculator/'},
    {name:'Licensing Simplifier',url:'/licensing/'},
    {name:'Migration Planner',url:'/migration-planner/'},
    {name:'CA Policy Builder',url:'/ca-builder/'},
    {name:'Purview Starter Kit',url:'/purview-starter/'},
    {name:'Security Toolkit',url:'/security-toolkit/'},
    {name:'PowerShell Builder',url:'/ps-builder/'},
    {name:'Agent 365 Planner',url:'/agent-365-planner/'},
    {name:'IT Admin Comms',url:'/admin-comms/'},
    {name:'Compliance Passport',url:'/compliance-passport/'},
    {name:'Phishing Simulator',url:'/phishing-test/'},
    {name:'Cert Study Guides',url:'/cert-tracker/'},
    {name:'Cert Compass',url:'/cert-compass/'},
    {name:'Meeting Planner',url:'/world-clock/'},
    {name:'QR Code Generator',url:'/qr-generator/'},
    {name:'WiFi QR Cards',url:'/wifi-qr/'},
    {name:'Password Generator',url:'/password-generator/'},
    {name:'Image Compressor',url:'/image-compressor/'},
    {name:'Typing Speed Test',url:'/typing-test/'},
    {name:'Countdown Timer',url:'/countdown/'},
    {name:'Colour Palette',url:'/color-palette/'},
    {name:'Pomodoro Timer',url:'/pomodoro/'},
    {name:'IT Admin Bingo',url:'/admin-bingo/'},
    {name:'Acronym Battle',url:'/acronym-battle/'},
    {name:'SLA Calculator',url:'/sla-calculator/'},
    {name:'IT Admin Badges',url:'/admin-badges/'},
    {name:'Password Policy Tester',url:'/policy-tester/'},
    {name:'Incident Comms',url:'/incident-comms/'},
    {name:'CLI Command Quiz',url:'/cli-quiz/'},
    {name:'My IT Day',url:'/it-day-sim/'},
    {name:'Site Analytics',url:'/site-analytics/'}
  ];
  const RECENT_KEY = 'nav_recent_tools';
  const MAX_RECENT = 5;

  function getRecent() {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch { return []; }
  }
  function saveRecent(url) {
    try {
      let r = getRecent().filter(u => u !== url);
      r.unshift(url);
      if (r.length > MAX_RECENT) r = r.slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_KEY, JSON.stringify(r));
    } catch {}
  }

  // Track current tool visit
  const path = window.location.pathname;
  if (TOOLS.some(t => t.url === path)) saveRecent(path);

  // Render recent
  function renderRecent() {
    const recent = getRecent();
    const section = document.getElementById('mega-recent-section');
    const list = document.getElementById('mega-recent-list');
    if (!section || !list || recent.length === 0) return;
    section.style.display = 'block';
    list.innerHTML = recent.map(url => {
      const tool = TOOLS.find(t => t.url === url);
      if (!tool) return '';
      return '<a href="' + url + '">' + tool.name + '</a>';
    }).join('');
  }

  // Search
  function initSearch() {
    const input = document.getElementById('mega-tool-search');
    const results = document.getElementById('mega-search-results');
    const body = document.getElementById('mega-smart-body');
    if (!input || !results || !body) return;

    let debounce;
    input.addEventListener('input', function() {
      clearTimeout(debounce);
      debounce = setTimeout(function() {
        const q = input.value.toLowerCase().trim();
        if (!q) {
          results.style.display = 'none';
          body.style.display = 'block';
          return;
        }
        const matches = TOOLS.filter(t => t.name.toLowerCase().includes(q));
        body.style.display = 'none';
        results.style.display = 'block';
        if (matches.length === 0) {
          results.innerHTML = '<div class="mega-search-empty">No tools found</div>';
        } else {
          results.innerHTML = matches.map(t => '<a href="' + t.url + '">' + t.name + '</a>').join('');
        }
      }, 150);
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    renderRecent();
    initSearch();
  });
})();
