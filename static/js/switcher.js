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

  // V5.1: Drawer tab switching (Guided Platform / Explore)
  document.querySelectorAll('.drawer-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      var targetTab = this.dataset.tab;
      // Update tab buttons
      document.querySelectorAll('.drawer-tab').forEach(function(t) {
        t.classList.remove('active');
        t.setAttribute('aria-pressed', 'false');
      });
      this.classList.add('active');
      this.setAttribute('aria-pressed', 'true');
      // Update panels
      document.querySelectorAll('.drawer-panel').forEach(function(p) {
        p.classList.remove('active');
      });
      var panel = document.getElementById('drawer-panel-' + targetTab);
      if (panel) panel.classList.add('active');
    });
  });

  // V5.1: Expandable groups in drawer (Videos section etc.)
  document.querySelectorAll('.drawer-group-toggle').forEach(function(toggle) {
    toggle.addEventListener('click', function() {
      var expanded = this.getAttribute('aria-expanded') === 'true';
      // Accordion: close other groups in same panel
      var panel = this.closest('.drawer-panel');
      if (panel) {
        panel.querySelectorAll('.drawer-group-toggle[aria-expanded="true"]').forEach(function(other) {
          if (other !== toggle) {
            other.setAttribute('aria-expanded', 'false');
            var otherContent = other.nextElementSibling;
            if (otherContent) otherContent.classList.remove('open');
            other.closest('.drawer-group').classList.remove('drawer-group--open');
          }
        });
      }
      this.setAttribute('aria-expanded', !expanded);
      var content = this.nextElementSibling;
      if (content) content.classList.toggle('open');
      var group = this.closest('.drawer-group');
      if (group) group.classList.toggle('drawer-group--open');
    });
  });

  // ── Learn mega-menu: vendor tab switching ──
  document.querySelectorAll('.mega-vendor-tab').forEach(function(tab) {
    function switchVendor() {
      var vendor = tab.getAttribute('data-vendor');
      var mega = tab.closest('.mega-learn-layout');
      if (!mega) return;
      // Deactivate all tabs + panels
      mega.querySelectorAll('.mega-vendor-tab.active').forEach(function(t) { t.classList.remove('active'); });
      mega.querySelectorAll('.mega-cert-panel.active').forEach(function(p) { p.classList.remove('active'); });
      // Activate this tab + matching panel
      tab.classList.add('active');
      var panel = mega.querySelector('.mega-cert-panel[data-vendor="' + vendor + '"]');
      if (panel) panel.classList.add('active');
    }
    tab.addEventListener('mouseenter', switchVendor);
    tab.addEventListener('click', switchVendor);
    tab.addEventListener('focus', switchVendor);
  });

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

  // ── Generic horizontal scroll carousels (blog + video sections) ──
  function initCarousel(wrapper) {
    var track = wrapper.querySelector('.hp-hscroll-track');
    var btnLeft = wrapper.querySelector('.hp-hscroll-nav-left');
    var btnRight = wrapper.querySelector('.hp-hscroll-nav-right');
    if (!track) return;

    function updateNav() {
      if (!btnLeft || !btnRight) return;
      var canScroll = track.scrollWidth > track.clientWidth + 5;
      btnLeft.style.display = canScroll ? '' : 'none';
      btnRight.style.display = canScroll ? '' : 'none';
      if (canScroll) {
        btnLeft.disabled = track.scrollLeft <= 5;
        btnRight.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 5;
      }
    }

    updateNav();
    track.addEventListener('scroll', updateNav, { passive: true });

    if (btnLeft) btnLeft.addEventListener('click', function() {
      track.scrollBy({ left: -track.clientWidth * 0.8, behavior: prefersReduced ? 'instant' : 'smooth' });
    });
    if (btnRight) btnRight.addEventListener('click', function() {
      track.scrollBy({ left: track.clientWidth * 0.8, behavior: prefersReduced ? 'instant' : 'smooth' });
    });
  }

  document.querySelectorAll('.hp-hscroll-wrapper').forEach(initCarousel);

  // ── Content tabs: Articles / Videos toggle ──
  var contentTabs = document.querySelectorAll('.hp-content-tab');
  if (contentTabs.length) {
    contentTabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        var target = tab.dataset.tab;
        // Update tab active states
        contentTabs.forEach(function(t) {
          t.classList.toggle('active', t.dataset.tab === target);
          t.setAttribute('aria-selected', t.dataset.tab === target ? 'true' : 'false');
        });
        // Show/hide panels
        document.querySelectorAll('.hp-content-panel').forEach(function(panel) {
          panel.hidden = panel.dataset.panel !== target;
        });
        // Toggle section links (view all posts / view all videos)
        document.querySelectorAll('.hp-tab-link').forEach(function(link) {
          link.hidden = link.dataset.for !== target;
        });
        // Re-init carousels in newly visible panel (clientWidth was 0 while hidden)
        requestAnimationFrame(function() {
          var activePanel = document.querySelector('.hp-content-panel:not([hidden])');
          if (activePanel) {
            activePanel.querySelectorAll('.hp-hscroll-wrapper').forEach(initCarousel);
          }
        });
      });
    });
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
