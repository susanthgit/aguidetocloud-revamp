// Mobile hamburger menu toggle + dropdown tap-to-toggle
document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.getElementById('hamburger-btn');
  const navLinks = document.getElementById('nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function() {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', isOpen);
    });
    navLinks.querySelectorAll('a:not(.dropdown-toggle)').forEach(link => {
      link.addEventListener('click', function() {
        navLinks.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('click', function(e) {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Dropdown tap-to-toggle (mobile & touch devices)
  document.querySelectorAll('.dropdown-toggle').forEach(function(toggle) {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      var parent = this.closest('.nav-dropdown');
      // Close other open dropdowns
      document.querySelectorAll('.nav-dropdown.open').forEach(function(dd) {
        if (dd !== parent) dd.classList.remove('open');
      });
      parent.classList.toggle('open');
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

  // Back-to-top button (site-wide, hidden if page has its own)
  var btt = document.getElementById('site-btt');
  if (btt && !document.getElementById('rdmap-btt')) {
    window.addEventListener('scroll', function() {
      btt.classList.toggle('site-btt-show', window.scrollY > 400);
    });
    btt.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  } else if (btt) {
    btt.style.display = 'none';
  }
});
