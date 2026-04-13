/**
 * Site Analytics — lightweight anonymous event tracking (~1.5KB)
 * Sends events to /api/track. No PII, no cookies, fire-and-forget.
 */
(function() {
  'use strict';
  var API = '/api/track';
  var sent = {};

  function track(event, tool, meta) {
    var key = event + ':' + tool;
    if (sent[key]) return; // one event per type per page load
    sent[key] = true;
    try {
      var body = JSON.stringify({ event: event, tool: tool, meta: meta || undefined });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(API, new Blob([body], { type: 'application/json' }));
      } else {
        fetch(API, { method: 'POST', body: body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(function(){});
      }
    } catch (e) { /* silent fail */ }
  }

  // Detect current tool from body class
  var body = document.body;
  var toolMap = {
    'page-ainews': 'ai-news',
    'page-roadmap': 'm365-roadmap',
    'page-prompts': 'prompt-library',
    'page-licensing': 'licensing',
    'page-polisher': 'prompt-polisher',
    'page-readiness': 'copilot-readiness',
    'page-copilot-matrix': 'copilot-matrix',
    'page-deptime': 'deprecation-timeline',
    'page-feedback': 'feedback',
    'page-roi-calculator': 'roi-calculator',
    'page-ai-mapper': 'ai-mapper',
    'page-ai-showdown': 'ai-showdown',
    'page-ps-builder': 'ps-builder',
    'page-migration-planner': 'migration-planner',
    'page-prompt-guide': 'prompt-guide',
    'page-ca-builder': 'ca-builder',
    'page-world-clock': 'meeting-planner',
    'page-site-analytics': 'site-analytics'
  };

  var tool = null;
  var classList = body.className.split(/\s+/);
  for (var i = 0; i < classList.length; i++) {
    if (toolMap[classList[i]]) { tool = toolMap[classList[i]]; break; }
  }

  // Track page view for tools
  if (tool) {
    track('page_view', tool);
  }

  // Track search queries (hook into Pagefind)
  var searchObs = null;
  function watchSearch() {
    var input = document.querySelector('.pagefind-ui__search-input');
    if (!input || searchObs) return;
    var debounce = null;
    input.addEventListener('input', function() {
      clearTimeout(debounce);
      debounce = setTimeout(function() {
        var q = input.value.trim();
        if (q.length >= 3) {
          sent['search_query:global'] = false; // allow multiple searches
          track('search_query', 'global', q);
        }
      }, 2000); // wait 2s after typing stops
    });
    searchObs = true;
  }

  // Watch for search modal opening
  var modal = document.getElementById('search-modal');
  if (modal) {
    new MutationObserver(function() {
      if (modal.classList.contains('active')) watchSearch();
    }).observe(modal, { attributes: true, attributeFilter: ['class'] });
  }

  // Expose for tool-specific tracking
  window.__track = track;
})();
