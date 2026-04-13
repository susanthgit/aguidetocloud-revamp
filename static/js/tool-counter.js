/**
 * Tool Usage Counter — animated social proof numbers
 * Reads base count from data attribute, animates on scroll into view.
 * ~1KB minified.
 */
(function() {
  'use strict';

  var el = document.querySelector('.tool-counter');
  if (!el) return;

  var base = parseInt(el.dataset.base, 10) || 0;
  var numEl = el.querySelector('.tool-counter-num');
  if (!numEl || !base) return;

  var animated = false;

  function formatNum(n) {
    return n.toLocaleString('en-US');
  }

  function animateCount() {
    if (animated) return;
    animated = true;

    // Respect reduced motion — already shows base from server render
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var duration = 1800;
    var startTime = null;

    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      // Ease-out cubic
      var eased = 1 - Math.pow(1 - progress, 3);
      numEl.textContent = formatNum(Math.round(base * eased));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    // Briefly reset to 0 then animate up
    numEl.textContent = '0';
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
    // Fallback: no animation, base already rendered server-side
  }
})();
