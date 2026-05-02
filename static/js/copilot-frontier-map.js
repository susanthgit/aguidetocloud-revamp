/* ═══════════════════════════════════════════════
   Copilot Frontier Map — Client-Side Logic
   v2: changelog, timeline, compare, region filter,
       copy card, days counter, cross-links
   ═══════════════════════════════════════════════ */
(function () {
  'use strict';

  var D = window.__cfmData;
  if (!D || !D.features) return;

  var features = D.features;
  var statuses = D.statuses || [];
  var events = D.events || [];
  var crosslinks = D.crosslinks || [];
  var cioDescs = D.cioDescs || {};
  var competitors = D.competitors || {};
  var prereqs = D.prereqs || [];
  var adminEmail = D.adminEmail || {};
  var statusMap = {};
  statuses.forEach(function (s) { statusMap[s.id] = s; });
  var isCioMode = false;
  var votes = {};
  var watched = {};
  try { votes = JSON.parse(localStorage.getItem('cfm-votes') || '{}'); } catch (_) {}
  try { watched = JSON.parse(localStorage.getItem('cfm-watched') || '{}'); } catch (_) {}

  /* ── Helpers ── */
  function esc(str) {
    var d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }
  function formatDate(iso) {
    if (!iso || iso === 'TBA') return 'TBA';
    try {
      var d = new Date(iso + 'T00:00:00');
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (_) { return iso; }
  }
  function daysSince(iso) {
    if (!iso || iso === 'TBA') return null;
    try {
      var d = new Date(iso + 'T00:00:00');
      var now = new Date();
      return Math.floor((now - d) / 86400000);
    } catch (_) { return null; }
  }
  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return Array.from(document.querySelectorAll(sel)); }
  function featureById(id) { return features.find(function (f) { return f.id === id; }); }
  function relativeTime(iso) {
    if (!iso || iso === 'TBA') return '';
    try {
      var d = new Date(iso + 'T00:00:00');
      var diff = Math.floor((new Date() - d) / 86400000);
      if (diff === 0) return 'today';
      if (diff === 1) return 'yesterday';
      if (diff < 7) return diff + ' days ago';
      if (diff < 30) return Math.floor(diff / 7) + ' weeks ago';
      if (diff < 365) return Math.floor(diff / 30) + ' months ago';
      return Math.floor(diff / 365) + ' years ago';
    } catch (_) { return ''; }
  }
  function isNew(iso) {
    if (!iso) return false;
    try { return daysSince(iso) <= 14; } catch (_) { return false; }
  }

  var eventTypeLabels = {
    entered_frontier: 'Entered Frontier',
    graduated_ga: 'Graduated to GA',
    paused: 'Paused',
    withdrawn: 'Withdrawn',
    moved_to_expected: 'Expected'
  };

  /* ── Stats ── */
  function renderStats() {
    var el = $('#cfm-stats');
    if (!el) return;
    var frontier = features.filter(function (f) { return f.status === 'frontier'; }).length;
    var ga = features.filter(function (f) { return f.status === 'ga'; }).length;
    var total = features.length;
    el.innerHTML =
      '<div class="cfm-stat"><span class="cfm-stat-num">' + frontier + '</span> in Frontier</div>' +
      '<div class="cfm-stat"><span class="cfm-stat-num">' + ga + '</span> graduated to GA</div>' +
      '<div class="cfm-stat"><span class="cfm-stat-num">' + total + '</span> total tracked</div>';
  }

  /* ── What's New — single inline line ── */
  function renderWhatsNew() {
    var el = $('#cfm-wn-list');
    if (!el || !events.length) { var p = $('#cfm-whats-new'); if (p) p.style.display = 'none'; return; }
    var sorted = events.slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
    var latest = sorted[0];
    var sameDay = sorted.filter(function (ev) { return ev.date === latest.date && ev.event_type === latest.event_type; });
    var names = sameDay.map(function (ev) { var f = featureById(ev.feature_id); return f ? f.name : ev.feature_id; });
    var label = eventTypeLabels[latest.event_type] || latest.event_type;
    el.innerHTML = '<div class="cfm-wn-item">' +
      '<span class="cfm-wn-badge" data-type="' + esc(latest.event_type) + '">' + esc(label) + '</span>' +
      '<span class="cfm-wn-text">' + esc(names.join(', ')) + ' <span class="cfm-wn-date">(' + formatDate(latest.date) + ')</span></span>' +
      '</div>';
  }

  /* ── Pipeline Tab ── */
  function renderPipelineCard(f) {
    var newBadge = isNew(f.last_status_change) ? '<span class="cfm-new-badge">NEW</span>' : '';
    var days = daysSince(f.frontier_date);
    var daysHtml = days !== null && f.status === 'frontier'
      ? '<span class="cfm-days-badge">' + days + 'd</span>'
      : '';
    var preview = '<div class="cfm-pipe-preview">' + esc((isCioMode && cioDescs[f.id]) ? cioDescs[f.id] : f.value_prop || f.description) + '</div>';
    return '<div class="cfm-pipe-card" data-id="' + esc(f.id) + '" tabindex="0" role="button" aria-label="View details for ' + esc(f.name) + '">' +
      preview +
      '<div class="cfm-pipe-card-name">' + esc(f.name) + newBadge + daysHtml + '</div>' +
      '<div class="cfm-pipe-card-app">' + esc(f.app) + '</div>' +
      '</div>';
  }

  function renderPipeline() {
    var buckets = { frontier: [], expected: [], ga: [], paused: [], withdrawn: [] };
    features.forEach(function (f) {
      var s = f.status || 'frontier';
      if (buckets[s]) buckets[s].push(f);
    });

    // Hide Expected column + its arrow if empty
    var expectedCol = document.querySelector('.cfm-pipeline-col[data-status="expected"]');
    var arrows = $$('.cfm-pipeline-arrow');
    if (expectedCol && buckets.expected.length === 0) {
      expectedCol.style.display = 'none';
      if (arrows[0]) arrows[0].style.display = 'none';
      // Switch to 2-column layout
      var pipeline = $('#cfm-pipeline');
      if (pipeline) pipeline.style.gridTemplateColumns = '1fr auto 1fr';
    }

    Object.keys(buckets).forEach(function (status) {
      var container = $('#cfm-cards-' + status);
      if (!container) return;
      buckets[status].sort(function (a, b) { return (b.last_status_change || b.frontier_date || '').localeCompare(a.last_status_change || a.frontier_date || ''); });
      if (buckets[status].length === 0) {
        if (status !== 'expected') container.innerHTML = '<div class="cfm-col-empty">None currently</div>';
      } else {
        container.innerHTML = buckets[status].map(renderPipelineCard).join('');
      }
      var counter = $('#cfm-count-' + status);
      if (counter) counter.textContent = buckets[status].length;
    });

    var offEl = $('#cfm-offramps');
    if (offEl && buckets.paused.length === 0 && buckets.withdrawn.length === 0) {
      offEl.style.display = 'none';
    }

    $$('.cfm-pipe-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var id = card.getAttribute('data-id');
        switchTab('explorer');
        setTimeout(function () { expandFeature(id); }, 100);
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
      });
    });
  }

  /* ── Cross-links (#12) ── */
  function renderCrosslinks() {
    return '<div class="cfm-crosslinks">' +
      crosslinks.map(function (cl) {
        return '<a href="' + esc(cl.url) + '" class="cfm-crosslink">' + esc(cl.name) + ' →</a>';
      }).join('') +
      '</div>';
  }

  /* ── Copy Feature (#3) ── */
  function buildCopyText(f) {
    var sm = statusMap[f.status] || {};
    var lines = [
      f.name + ' — ' + (sm.label || f.status),
      'App: ' + f.app,
      'Frontier: ' + formatDate(f.frontier_date) + ' | Expected GA: ' + formatDate(f.expected_ga),
      f.actual_ga ? 'Actual GA: ' + formatDate(f.actual_ga) : '',
      '',
      f.description,
      '',
      'AI Models: ' + (f.ai_models || []).join(', '),
      'Licensing: ' + (f.licensing_prereqs || 'N/A'),
      f.admin_action_required ? 'Admin Action: ' + f.admin_action_required : '',
      f.availability_scope ? 'Availability: ' + f.availability_scope : '',
      '',
      'Source: ' + (f.source_urls || []).join(', '),
      'Last verified: ' + formatDate(f.last_verified)
    ];
    return lines.filter(function (l) { return l !== ''; }).join('\n');
  }

  /* ── Explorer Tab ── */
  function renderFeatureCard(f) {
    var sm = statusMap[f.status] || {};
    var useCases = (f.use_cases || []).map(function (u) { return '<li>' + esc(u) + '</li>'; }).join('');
    var whoList = (f.who_benefits || []).map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('');
    var modelBadges = (f.ai_models || []).map(function (m) { return '<span class="cfm-model-badge">' + esc(m) + '</span>'; }).join('');
    var skillsList = (f.skills || []).filter(function (s) { return s; });
    var skillsHtml = skillsList.length > 0
      ? '<div class="cfm-feature-section"><h4>Built-in Skills</h4><ul>' + skillsList.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul></div>'
      : '';
    var sources = (f.source_urls || []).map(function (u, i) {
      var label = 'Source ' + (i + 1);
      try { label = new URL(u).hostname.replace('www.', ''); } catch (_) {}
      return '<a class="cfm-source-link" href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(label) + '</a>';
    }).join('');
    var adminHtml = f.admin_action_required
      ? '<div class="cfm-feature-admin"><div class="cfm-feature-admin-title">⚙️ Admin Action Required</div><div class="cfm-feature-admin-text">' + esc(f.admin_action_required) + '</div></div>'
      : '';
    var days = daysSince(f.frontier_date);
    var daysHtml = days !== null && f.status === 'frontier'
      ? '<div class="cfm-meta-item"><strong>Days in Frontier</strong>' + days + ' days</div>'
      : '';

    return '<div class="cfm-feature-card" data-id="' + esc(f.id) + '" data-status="' + esc(f.status) + '" data-app="' + esc(f.app) + '" data-models="' + esc((f.ai_models || []).join(',')) + '" data-scope="' + esc(f.availability_scope || '') + '">' +
      '<div class="cfm-feature-header">' +
        '<span class="cfm-feature-status-dot" data-status="' + esc(f.status) + '"></span>' +
        '<span class="cfm-feature-name">' + esc(f.name) + '</span>' +
        '<span class="cfm-feature-app-badge">' + esc(f.app) + '</span>' +
        '<span class="cfm-feature-status-badge" data-status="' + esc(f.status) + '">' + (sm.emoji || '') + ' ' + (sm.label || f.status) + '</span>' +
        '<span class="cfm-feature-expand" aria-hidden="true">▸</span>' +
      '</div>' +
      '<div class="cfm-feature-body">' +
        '<p class="cfm-feature-desc">' + esc(isCioMode && cioDescs[f.id] ? cioDescs[f.id] : f.description) + '</p>' +
        (f.value_prop ? '<div class="cfm-feature-value">💡 ' + esc(f.value_prop) + '</div>' : '') +
        renderCompetitor(f.id) +
        '<div class="cfm-feature-meta">' +
          '<div class="cfm-meta-item"><strong>Frontier Date</strong>' + formatDate(f.frontier_date) + '</div>' +
          '<div class="cfm-meta-item"><strong>Expected GA</strong>' + formatDate(f.expected_ga) + '</div>' +
          (f.actual_ga ? '<div class="cfm-meta-item"><strong>Actual GA</strong>' + formatDate(f.actual_ga) + '</div>' : '') +
          daysHtml +
          '<div class="cfm-meta-item"><strong>Licensing</strong>' + esc(f.licensing_prereqs || 'N/A') + '</div>' +
          '<div class="cfm-meta-item"><strong>Availability</strong>' + esc(f.availability_scope || 'Global') + '</div>' +
          '<div class="cfm-meta-item"><strong>AI Models</strong>' + (modelBadges || 'Not specified') + '</div>' +
        '</div>' +
        adminHtml +
        renderPrereqs(f.id) +
        '<div class="cfm-feature-grid">' +
          (useCases ? '<div class="cfm-feature-section"><h4>Use Cases</h4><ul>' + useCases + '</ul></div>' : '') +
          (whoList ? '<div class="cfm-feature-section"><h4>Who Benefits</h4><ul>' + whoList + '</ul></div>' : '') +
        '</div>' +
        skillsHtml +
        (f.notes ? '<p class="cfm-feature-desc"><strong>Note:</strong> ' + esc(f.notes) + '</p>' : '') +
        '<div class="cfm-feature-sources">' + sources + '</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">' +
          '<button class="cfm-copy-btn" data-id="' + esc(f.id) + '">📋 Copy summary</button>' +
          (f.status === 'frontier' ? '<button class="cfm-ask-admin-btn" data-id="' + esc(f.id) + '">📧 Ask Your Admin</button>' : '') +
        '</div>' +
        '<div class="cfm-feature-verified">Last verified: ' + formatDate(f.last_verified) + '</div>' +
      '</div>' +
    '</div>';
  }

  function renderExplorer(filtered) {
    var list = filtered || features;
    var grid = $('#cfm-explorer-grid');
    var countEl = $('#cfm-explorer-count');
    if (!grid) return;
    grid.innerHTML = list.map(renderFeatureCard).join('');
    if (countEl) {
      countEl.textContent = 'Showing ' + list.length + ' of ' + features.length + ' features';
    }
    // Expand/collapse
    $$('.cfm-feature-header').forEach(function (header) {
      header.addEventListener('click', function () {
        header.closest('.cfm-feature-card').classList.toggle('expanded');
      });
    });
    // Copy buttons
    $$('.cfm-copy-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var f = featureById(btn.getAttribute('data-id'));
        if (!f) return;
        var text = buildCopyText(f);
        navigator.clipboard.writeText(text).then(function () {
          btn.textContent = '✅ Copied!';
          btn.classList.add('copied');
          setTimeout(function () { btn.textContent = '📋 Copy summary'; btn.classList.remove('copied'); }, 2000);
        }).catch(function () {
          btn.textContent = '❌ Failed';
          setTimeout(function () { btn.textContent = '📋 Copy summary'; }, 2000);
        });
      });
    });
  }

  function expandFeature(id) {
    var card = document.querySelector('.cfm-feature-card[data-id="' + id + '"]');
    if (!card) return;
    card.classList.add('expanded');
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ── Filters (#7 region) ── */
  function populateFilters() {
    var apps = [];
    var models = [];
    features.forEach(function (f) {
      if (f.app && apps.indexOf(f.app) === -1) apps.push(f.app);
      (f.ai_models || []).forEach(function (m) { if (models.indexOf(m) === -1) models.push(m); });
    });
    var appSelect = $('#cfm-filter-app');
    var modelSelect = $('#cfm-filter-model');
    if (appSelect) apps.sort().forEach(function (a) { var o = document.createElement('option'); o.value = a; o.textContent = a; appSelect.appendChild(o); });
    if (modelSelect) models.sort().forEach(function (m) { var o = document.createElement('option'); o.value = m; o.textContent = m; modelSelect.appendChild(o); });
  }

  function applyFilters() {
    var status = ($('#cfm-filter-status') || {}).value || 'all';
    var app = ($('#cfm-filter-app') || {}).value || 'all';
    var model = ($('#cfm-filter-model') || {}).value || 'all';
    var region = ($('#cfm-filter-region') || {}).value || 'all';

    var filtered = features.filter(function (f) {
      if (status !== 'all' && f.status !== status) return false;
      if (app !== 'all' && f.app !== app) return false;
      if (model !== 'all' && (f.ai_models || []).indexOf(model) === -1) return false;
      if (region !== 'all') {
        var scope = (f.availability_scope || '').toLowerCase();
        if (region === 'eu' && (scope.indexOf('eu') === -1 || scope.indexOf('opt-in') !== -1 || scope.indexOf('excluded') !== -1)) return false;
        if (region === 'global' && scope.indexOf('requires') !== -1) return false;
        if (region === 'teams-phone' && scope.indexOf('teams phone') === -1) return false;
      }
      return true;
    });
    renderExplorer(filtered);
  }

  /* ── Timeline (#5) ── */
  function renderTimeline() {
    var el = $('#cfm-timeline');
    if (!el || !events.length) return;
    var sorted = events.slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
    el.innerHTML = sorted.map(function (ev) {
      var f = featureById(ev.feature_id);
      var fname = f ? f.name : ev.feature_id;
      return '<div class="cfm-tl-item">' +
        '<div class="cfm-tl-dot" data-type="' + esc(ev.event_type) + '"></div>' +
        '<div class="cfm-tl-date">' + formatDate(ev.date) + '</div>' +
        '<div class="cfm-tl-content">' +
          '<div class="cfm-tl-feature">' + esc(fname) + ' <span class="cfm-wn-badge" data-type="' + esc(ev.event_type) + '">' + esc(eventTypeLabels[ev.event_type] || ev.event_type) + '</span></div>' +
          '<div class="cfm-tl-note">' + esc(ev.note) + '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  /* ── Compare (#8) ── */
  function populateCompare() {
    ['cfm-compare-a', 'cfm-compare-b'].forEach(function (id) {
      var sel = document.getElementById(id);
      if (!sel) return;
      features.forEach(function (f) {
        var o = document.createElement('option');
        o.value = f.id;
        o.textContent = f.name + ' (' + f.app + ')';
        sel.appendChild(o);
      });
      sel.addEventListener('change', renderComparison);
    });
  }

  function renderComparison() {
    var aId = ($('#cfm-compare-a') || {}).value;
    var bId = ($('#cfm-compare-b') || {}).value;
    var result = $('#cfm-compare-result');
    if (!result) return;
    if (!aId || !bId) {
      result.innerHTML = '<div class="cfm-compare-empty">Select two features above to compare them side by side.</div>';
      return;
    }
    var a = featureById(aId);
    var b = featureById(bId);
    if (!a || !b) return;

    var rows = [
      ['Status', (statusMap[a.status] || {}).label || a.status, (statusMap[b.status] || {}).label || b.status],
      ['App', a.app, b.app],
      ['AI Models', (a.ai_models || []).join(', '), (b.ai_models || []).join(', ')],
      ['Frontier Date', formatDate(a.frontier_date), formatDate(b.frontier_date)],
      ['Expected GA', formatDate(a.expected_ga), formatDate(b.expected_ga)],
      ['Days in Frontier', (function () { var d = daysSince(a.frontier_date); return d !== null ? d + ' days' : 'N/A'; })(), (function () { var d = daysSince(b.frontier_date); return d !== null ? d + ' days' : 'N/A'; })()],
      ['Licensing', a.licensing_prereqs || 'N/A', b.licensing_prereqs || 'N/A'],
      ['Admin Action', a.admin_action_required || 'None', b.admin_action_required || 'None'],
      ['Availability', a.availability_scope || 'Global', b.availability_scope || 'Global'],
      ['Description', a.description, b.description]
    ];

    result.innerHTML = '<table class="cfm-compare-table">' +
      '<thead><tr><th class="cfm-compare-label"></th><th>' + esc(a.name) + '</th><th>' + esc(b.name) + '</th></tr></thead>' +
      '<tbody>' + rows.map(function (r) {
        return '<tr><td class="cfm-compare-label">' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td></tr>';
      }).join('') + '</tbody></table>';
  }

  /* ── Tabs ── */
  function switchTab(tabId) {
    $$('.cfm-tab').forEach(function (t) {
      var isActive = t.getAttribute('data-tab') === tabId;
      t.classList.toggle('active', isActive);
      t.setAttribute('aria-selected', isActive ? 'true' : 'false');
      t.setAttribute('tabindex', isActive ? '0' : '-1');
    });
    $$('.cfm-panel').forEach(function (p) {
      p.style.display = p.id === 'panel-' + tabId ? '' : 'none';
    });
    history.replaceState(null, '', '#' + tabId);
  }

  /* ── Tier Banner Toggle (auto-collapse after first visit) ── */
  function initTierBanner() {
    var toggle = $('#cfm-tier-toggle');
    var content = $('#cfm-tier-content');
    if (!toggle || !content) return;
    var seen = false;
    try { seen = localStorage.getItem('cfm-tier-seen') === '1'; } catch (_) {}
    if (seen) {
      toggle.setAttribute('aria-expanded', 'false');
      content.style.display = 'none';
    } else {
      try { localStorage.setItem('cfm-tier-seen', '1'); } catch (_) {}
    }
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      content.style.display = expanded ? 'none' : 'block';
    });
  }

  /* ── Tab Counts ── */
  function updateTabCounts() {
    var counts = {
      pipeline: features.length,
      explorer: features.length,
      timeline: events.length,
      compare: features.length,
      faq: document.querySelectorAll('.cfm-faq-item').length
    };
    Object.keys(counts).forEach(function (tab) {
      var btn = document.getElementById('tab-' + tab);
      if (!btn) return;
      var existing = btn.querySelector('.cfm-tab-count');
      if (existing) existing.remove();
      var span = document.createElement('span');
      span.className = 'cfm-tab-count';
      span.textContent = counts[tab];
      btn.appendChild(span);
    });
  }

  /* ── Search ── */
  function initSearch() {
    var input = document.getElementById('cfm-search');
    if (!input) return;
    input.addEventListener('input', function () {
      var q = input.value.toLowerCase().trim();
      if (!q) { applyFilters(); return; }
      var filtered = features.filter(function (f) {
        return f.name.toLowerCase().indexOf(q) !== -1 ||
               f.app.toLowerCase().indexOf(q) !== -1 ||
               f.description.toLowerCase().indexOf(q) !== -1 ||
               (f.value_prop || '').toLowerCase().indexOf(q) !== -1;
      });
      renderExplorer(filtered);
      // Also highlight matching pipeline cards
      $$('.cfm-pipe-card').forEach(function (card) {
        var id = card.getAttribute('data-id');
        var f = featureById(id);
        var match = f && (f.name.toLowerCase().indexOf(q) !== -1 || f.app.toLowerCase().indexOf(q) !== -1);
        card.style.opacity = match ? '1' : '0.3';
      });
    });
    // Keyboard shortcut: / to focus search
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'SELECT') {
        e.preventDefault();
        input.focus();
      }
    });
  }

  /* ── Relative Time Footer ── */
  function updateRelativeTime() {
    var el = document.getElementById('cfm-last-updated');
    if (!el) return;
    var date = el.textContent;
    var rel = relativeTime(date);
    if (rel) el.textContent = date + ' (' + rel + ')';
  }

  /* ── Suggested Comparison ── */
  function renderSuggestedComparison() {
    var result = $('#cfm-compare-result');
    if (!result) return;
    // Pre-select Cowork vs Researcher by default
    var selA = $('#cfm-compare-a');
    var selB = $('#cfm-compare-b');
    if (selA && selB && selA.value === '' && selB.value === '') {
      selA.value = 'copilot-cowork';
      selB.value = 'researcher-multi-model';
      renderComparison();
    }
  }

  /* ── Counter Animation ── */
  function initCounterAnimation() {
    var counters = $$('.tool-counter');
    if (!counters.length) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target.querySelector('.tool-counter-num');
        var target = parseInt(entry.target.getAttribute('data-base'), 10) || 0;
        if (!el || el.dataset.animated) return;
        el.dataset.animated = '1';
        var start = 0;
        var duration = 800;
        var startTime = null;
        function step(ts) {
          if (!startTime) startTime = ts;
          var pct = Math.min((ts - startTime) / duration, 1);
          el.textContent = Math.floor(pct * target).toLocaleString();
          if (pct < 1) requestAnimationFrame(step);
          else el.textContent = target.toLocaleString();
        }
        requestAnimationFrame(step);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
    counters.forEach(function (c) { observer.observe(c); });
  }

  /* ── Chart (#M) ── */
  function renderChart() {
    var el = $('#cfm-chart');
    if (!el) return;
    var counts = { frontier: 0, expected: 0, ga: 0 };
    features.forEach(function (f) { if (counts[f.status] !== undefined) counts[f.status]++; });
    var max = Math.max.apply(null, Object.values(counts)) || 1;
    var labels = { frontier: '🔬 Frontier', expected: '📅 Expected', ga: '✅ GA' };
    var bars = '';
    ['frontier', 'expected', 'ga'].forEach(function (s) {
      var h = Math.max(counts[s] / max * 100, counts[s] > 0 ? 20 : 8);
      bars += '<div style="flex:1;text-align:center">' +
        '<div style="height:60px;display:flex;align-items:end;justify-content:center">' +
          '<div class="cfm-chart-bar" data-status="' + s + '" style="height:' + h + '%;width:100%"><span class="cfm-chart-label">' + counts[s] + '</span></div>' +
        '</div>' +
        '<div style="font-size:0.65rem;color:var(--text-muted);margin-top:4px">' + labels[s] + '</div>' +
      '</div>';
    });
    el.innerHTML = bars;
  }

  /* ── Voting (#D) ── */
  function getVoteCount(id) { return (votes[id] || 0); }
  function toggleVote(id) {
    votes[id] = votes[id] ? 0 : 1;
    try { localStorage.setItem('cfm-votes', JSON.stringify(votes)); } catch (_) {}
  }

  /* ── Watch/Notify (#E) ── */
  function isWatched(id) { return !!watched[id]; }
  function toggleWatch(id) {
    if (watched[id]) { delete watched[id]; }
    else {
      watched[id] = { since: new Date().toISOString() };
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
    try { localStorage.setItem('cfm-watched', JSON.stringify(watched)); } catch (_) {}
  }

  /* ── CIO Mode (#F) ── */
  function initCioMode() {
    var toggle = document.getElementById('cfm-cio-mode');
    if (!toggle) return;
    try { isCioMode = localStorage.getItem('cfm-cio-mode') === '1'; } catch (_) {}
    toggle.checked = isCioMode;
    toggle.addEventListener('change', function () {
      isCioMode = toggle.checked;
      try { localStorage.setItem('cfm-cio-mode', isCioMode ? '1' : '0'); } catch (_) {}
      renderExplorer();
    });
  }

  /* ── Ask Admin Email (#A) ── */
  function generateAdminEmail(f) {
    var cio = cioDescs[f.id] || f.description;
    var prereqData = prereqs.find(function (p) { return p.feature_id === f.id; });
    var prereqList = prereqData ? prereqData.steps.map(function (s) { return '  ' + s.step + '. ' + s.label + (s.condition ? ' (' + s.condition + ')' : ''); }).join('\n') : '  (Check Microsoft documentation)';
    var tmpl = (adminEmail.body_template || '')
      .replace('{feature_name}', f.name)
      .replace('{cio_description}', cio)
      .replace('{prerequisites_list}', prereqList)
      .replace('{value_prop}', f.value_prop || '')
      .replace('{source_url}', (f.source_urls || [])[0] || '')
      .replace('{admin_name}', '[IT Admin Name]')
      .replace('{user_name}', '[Your Name]');
    return tmpl;
  }

  /* ── CIO Export (#C) ── */
  function generateCioExport() {
    var lines = [
      'COPILOT FRONTIER MAP — Executive Summary',
      'Generated: ' + new Date().toLocaleDateString('en-GB'),
      '═'.repeat(50),
      '',
      'CURRENTLY IN FRONTIER EARLY ACCESS (' + features.filter(function (f) { return f.status === 'frontier'; }).length + ' features):',
      ''
    ];
    features.filter(function (f) { return f.status === 'frontier'; }).forEach(function (f) {
      lines.push('▸ ' + f.name + ' (' + f.app + ')');
      lines.push('  ' + (cioDescs[f.id] || f.value_prop || f.description));
      lines.push('  Status: In Frontier since ' + formatDate(f.frontier_date) + ' | GA: ' + formatDate(f.expected_ga));
      var comp = competitors[f.id];
      if (comp) lines.push('  vs Competition: ' + comp.feature + ' (' + comp.vendor + ')');
      lines.push('');
    });
    var gaFeatures = features.filter(function (f) { return f.status === 'ga'; });
    if (gaFeatures.length > 0) {
      lines.push('RECENTLY GRADUATED TO GA (' + gaFeatures.length + '):');
      lines.push('');
      gaFeatures.forEach(function (f) {
        lines.push('✅ ' + f.name + ' — GA since ' + formatDate(f.actual_ga));
        lines.push('  ' + (cioDescs[f.id] || f.value_prop || ''));
        lines.push('');
      });
    }
    lines.push('─'.repeat(50));
    lines.push('Source: aguidetocloud.com/copilot-frontier-map/');
    lines.push('All data sourced from public Microsoft documentation.');
    return lines.join('\n');
  }

  /* ── Prerequisites Graph (#I) ── */
  function renderPrereqs(featureId) {
    var p = prereqs.find(function (pr) { return pr.feature_id === featureId; });
    if (!p || !p.steps || !p.steps.length) return '';
    var readinessKey = 'cfm-ready-' + featureId;
    var checked = {};
    try { checked = JSON.parse(localStorage.getItem(readinessKey) || '{}'); } catch (_) {}
    return '<div class="cfm-readiness" data-feature="' + esc(featureId) + '">' +
      '<div class="cfm-readiness-title">🔍 Can You Use This Feature?</div>' +
      p.steps.map(function (s, i) {
        var isChecked = checked[s.step];
        return (i > 0 ? '<div class="cfm-prereq-arrow">↓</div>' : '') +
          '<div class="cfm-prereq-step">' +
            '<span class="cfm-prereq-check' + (isChecked ? ' checked' : '') + '" data-feature="' + esc(featureId) + '" data-step="' + s.step + '" role="checkbox" aria-checked="' + (isChecked ? 'true' : 'false') + '" tabindex="0">' + (isChecked ? '✓' : '') + '</span>' +
            '<span>' + esc(s.label) + (s.condition ? ' <span class="cfm-prereq-condition">(' + esc(s.condition) + ')</span>' : '') + '</span>' +
          '</div>';
      }).join('') +
    '</div>';
  }

  /* ── Competitor badge (#G) ── */
  function renderCompetitor(featureId) {
    var c = competitors[featureId];
    if (!c) return '';
    return '<div class="cfm-competitor">' +
      '<span class="cfm-competitor-label">vs ' + esc(c.vendor) + ':</span>' +
      '<span class="cfm-competitor-value">' + esc(c.feature) + '</span>' +
      '<span class="cfm-competitor-note">' + esc(c.note) + '</span>' +
    '</div>';
  }

  /* ── Init ── */
  function init() {
    renderStats();
    renderChart();
    renderWhatsNew();
    renderPipeline();
    populateFilters();
    initCioMode();
    renderExplorer();
    renderTimeline();
    populateCompare();
    renderComparison();
    initTierBanner();
    initCounterAnimation();
    initSearch();
    updateTabCounts();
    updateRelativeTime();
    renderSuggestedComparison();

    $$('.cfm-tab').forEach(function (tab) {
      tab.addEventListener('click', function () { switchTab(tab.getAttribute('data-tab')); });
    });

    ['cfm-filter-status', 'cfm-filter-app', 'cfm-filter-model', 'cfm-filter-region'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('change', applyFilters);
    });

    var resetBtn = $('#cfm-filter-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        ['cfm-filter-status', 'cfm-filter-app', 'cfm-filter-model', 'cfm-filter-region'].forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.value = 'all';
        });
        renderExplorer();
      });
    }

    var hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById('panel-' + hash)) switchTab(hash);

    // CIO Export button
    var exportBtn = $('#cfm-export-cio');
    if (exportBtn) {
      exportBtn.addEventListener('click', function () {
        var text = generateCioExport();
        navigator.clipboard.writeText(text).then(function () {
          exportBtn.textContent = '✅ Copied to clipboard!';
          setTimeout(function () { exportBtn.textContent = '📊 Export for CIO'; }, 2000);
        }).catch(function () {
          exportBtn.textContent = '❌ Failed';
          setTimeout(function () { exportBtn.textContent = '📊 Export for CIO'; }, 2000);
        });
      });
    }

    // Embed toggle
    var embedBtn = $('#cfm-show-embed');
    var embedCode = $('#cfm-embed-code');
    if (embedBtn && embedCode) {
      embedBtn.addEventListener('click', function () {
        embedCode.style.display = embedCode.style.display === 'none' ? 'block' : 'none';
      });
    }
    var copyEmbedBtn = $('#cfm-copy-embed');
    if (copyEmbedBtn) {
      copyEmbedBtn.addEventListener('click', function () {
        var snippet = document.querySelector('.cfm-embed-snippet');
        if (!snippet) return;
        navigator.clipboard.writeText(snippet.textContent).then(function () {
          copyEmbedBtn.textContent = '✅ Copied!';
          setTimeout(function () { copyEmbedBtn.textContent = '📋 Copy embed code'; }, 2000);
        }).catch(function () {});
      });
    }

    // Readiness checker click delegation
    document.addEventListener('click', function (e) {
      var check = e.target.closest('.cfm-prereq-check');
      if (!check) return;
      var fId = check.getAttribute('data-feature');
      var step = check.getAttribute('data-step');
      var key = 'cfm-ready-' + fId;
      var checked = {};
      try { checked = JSON.parse(localStorage.getItem(key) || '{}'); } catch (_) {}
      if (checked[step]) { delete checked[step]; check.classList.remove('checked'); check.textContent = ''; check.setAttribute('aria-checked', 'false'); }
      else { checked[step] = true; check.classList.add('checked'); check.textContent = '✓'; check.setAttribute('aria-checked', 'true'); }
      try { localStorage.setItem(key, JSON.stringify(checked)); } catch (_) {}
    });

    // Vote + Watch click delegation
    document.addEventListener('click', function (e) {
      var voteBtn = e.target.closest('.cfm-vote-btn');
      if (voteBtn) {
        var id = voteBtn.getAttribute('data-id');
        toggleVote(id);
        voteBtn.classList.toggle('voted', !!votes[id]);
        voteBtn.querySelector('.cfm-vote-count').textContent = getVoteCount(id) ? '1' : '0';
        return;
      }
      var watchBtn = e.target.closest('.cfm-watch-btn');
      if (watchBtn) {
        var wid = watchBtn.getAttribute('data-id');
        toggleWatch(wid);
        watchBtn.classList.toggle('watching', isWatched(wid));
        watchBtn.textContent = isWatched(wid) ? '🔔 Watching' : '🔕 Watch';
        return;
      }
      var askBtn = e.target.closest('.cfm-ask-admin-btn');
      if (askBtn) {
        var aid = askBtn.getAttribute('data-id');
        var f = featureById(aid);
        if (!f) return;
        var email = generateAdminEmail(f);
        navigator.clipboard.writeText(email).then(function () {
          askBtn.textContent = '✅ Email copied!';
          setTimeout(function () { askBtn.textContent = '📧 Ask Your Admin'; }, 2000);
        }).catch(function () {});
      }
    });

    var tabList = $('.cfm-tabs');
    if (tabList) {
      tabList.addEventListener('keydown', function (e) {
        var tabs = $$('.cfm-tab');
        var cur = tabs.indexOf(document.activeElement);
        if (cur === -1) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); var n = (cur + 1) % tabs.length; tabs[n].focus(); tabs[n].click(); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); var p = (cur - 1 + tabs.length) % tabs.length; tabs[p].focus(); tabs[p].click(); }
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
