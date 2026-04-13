/**
 * Tool Usage Counter — animated social proof numbers
 * Reads base count from data attribute, animates on scroll into view.
 * Listens for tool_interact events to increment.
 * ~1.5KB minified.
 */
(function() {
  'use strict';

  var el = document.querySelector('.tool-counter');
  if (!el) return;

  var base = parseInt(el.dataset.base, 10) || 0;
  var numEl = el.querySelector('.tool-counter-num');
  if (!numEl) return;

  // Add small random offset so repeat visitors see slightly different numbers
  var offset = Math.floor(Math.random() * Math.ceil(base * 0.03));
  var target = base + offset;
  var animated = false;

  function formatNum(n) {
    return n.toLocaleString('en-US');
  }

  function animateCount() {
    if (animated) return;
    animated = true;

    var start = 0;
    var duration = 1800;
    var startTime = null;

    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      // Ease-out cubic
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(start + (target - start) * eased);
      numEl.textContent = formatNum(current);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      numEl.textContent = formatNum(target);
      return;
    }

    requestAnimationFrame(step);
  }

  // Animate when scrolled into view (or immediately if already visible)
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) {
        animateCount();
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    obs.observe(el);
  } else {
    // Fallback: animate immediately
    animateCount();
  }

  // Listen for tool interactions to bump counter +1
  window.addEventListener('tool-counter-increment', function() {
    target++;
    numEl.textContent = formatNum(target);
  });
})();
