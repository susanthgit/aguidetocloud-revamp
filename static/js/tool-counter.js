/**
 * Tool Usage Counter + Freshness Badge
 * Counter: animated social proof numbers from data attribute.
 * Freshness: fetches JSON timestamp, shows "Updated X ago".
 * ~2KB minified.
 */
(function() {
  'use strict';

  // === COUNTER ===
  var el = document.querySelector('.tool-counter');
  if (el) {
    var base = parseInt(el.dataset.base, 10) || 0;
    var numEl = el.querySelector('.tool-counter-num');
    if (numEl && base) {
      var animated = false;
      function formatNum(n) { return n.toLocaleString('en-US'); }
      function animateCount() {
        if (animated) return;
        animated = true;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        var duration = 1800, startTime = null;
        function step(ts) {
          if (!startTime) startTime = ts;
          var progress = Math.min((ts - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          numEl.textContent = formatNum(Math.round(base * eased));
          if (progress < 1) requestAnimationFrame(step);
        }
        numEl.textContent = '0';
        requestAnimationFrame(step);
      }
      if ('IntersectionObserver' in window) {
        var obs = new IntersectionObserver(function(entries) {
          if (entries[0].isIntersecting) { animateCount(); obs.disconnect(); }
        }, { threshold: 0.5 });
        obs.observe(el);
      }
    }
  }

  // === FRESHNESS BADGE ===
  var badge = document.querySelector('.tool-freshness');
  if (badge && badge.dataset.src) {
    fetch(badge.dataset.src, { cache: 'no-store' })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var gen = (data.metadata && data.metadata.generated) || data.generated;
        if (!gen) return;
        var dt = new Date(gen);
        var diff = (Date.now() - dt.getTime()) / 1000;
        var ago;
        if (diff < 3600) ago = Math.round(diff / 60) + 'min ago';
        else if (diff < 86400) ago = Math.round(diff / 3600) + 'h ago';
        else ago = Math.round(diff / 86400) + 'd ago';
        badge.textContent = '🟢 Updated ' + ago;
        badge.classList.add('tool-freshness-loaded');
      })
      .catch(function() {});
  }
})();
