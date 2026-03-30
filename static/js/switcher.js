// Theme & Layout Switcher
document.addEventListener('DOMContentLoaded', function() {
  // Mobile hamburger menu toggle
  const hamburger = document.getElementById('hamburger-btn');
  const navLinks = document.getElementById('nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function() {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', isOpen);
    });
    // Close menu when a nav link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', function() {
        navLinks.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
    // Close menu on outside click
    document.addEventListener('click', function(e) {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Theme buttons
  document.querySelectorAll('.theme-picker button[data-theme]').forEach(btn => {
    btn.addEventListener('click', function() {
      const theme = this.dataset.theme;
      document.body.className = document.body.className.replace(/theme-\S+/g, '').trim();
      if (theme !== 'default') {
        document.body.classList.add('theme-' + theme);
      }
      document.querySelectorAll('.theme-picker button[data-theme]').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Layout buttons
  document.querySelectorAll('.layout-picker button').forEach(btn => {
    btn.addEventListener('click', function() {
      const layout = this.dataset.layout;
      document.body.className = document.body.className.replace(/layout-\S+/g, '').trim();
      if (layout !== 'default') {
        document.body.classList.add('layout-' + layout);
      }
      document.querySelectorAll('.layout-picker button').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });
});
