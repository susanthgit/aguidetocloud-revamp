/* ═══════════════════════════════════════════════════════════
   🌸 ZEN DIAGRAMS — Fullscreen toggle for Mermaid diagrams
   Simple: dot-grid container + one fullscreen button.
   No zoom, no pan — just clean diagrams.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function enhanceDiagrams() {
    var containers = document.querySelectorAll('.mermaid');
    containers.forEach(function (container) {
      if (container.dataset.ztEnhanced) return;
      var svg = container.querySelector('svg');
      if (!svg) return;

      container.dataset.ztEnhanced = 'true';

      // Fullscreen button
      var btn = document.createElement('button');
      btn.className = 'zt-diagram-fs';
      btn.setAttribute('aria-label', 'View fullscreen');
      btn.setAttribute('title', 'Fullscreen');
      btn.textContent = '⛶';

      btn.addEventListener('click', function () {
        if (document.fullscreenElement === container) {
          document.exitFullscreen();
        } else if (container.requestFullscreen) {
          container.requestFullscreen();
        } else {
          // iOS fallback
          container.classList.toggle('zt-diagram-fullscreen');
          if (container.classList.contains('zt-diagram-fullscreen')) {
            var esc = function (e) {
              if (e.key === 'Escape') {
                container.classList.remove('zt-diagram-fullscreen');
                document.removeEventListener('keydown', esc);
              }
            };
            document.addEventListener('keydown', esc);
          }
        }
      });

      container.appendChild(btn);
    });
  }

  // Mermaid renders async — observe for SVG insertion
  var observer = new MutationObserver(function (mutations) {
    var found = false;
    mutations.forEach(function (m) {
      m.addedNodes.forEach(function (n) {
        if (n.tagName === 'svg' || (n.querySelector && n.querySelector('svg'))) found = true;
      });
    });
    if (found) setTimeout(enhanceDiagrams, 300);
  });

  document.querySelectorAll('.mermaid').forEach(function (el) {
    observer.observe(el, { childList: true, subtree: true });
  });

  // Fallback in case Mermaid already rendered
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(enhanceDiagrams, 1000); });
  } else {
    setTimeout(enhanceDiagrams, 1000);
  }
})();
