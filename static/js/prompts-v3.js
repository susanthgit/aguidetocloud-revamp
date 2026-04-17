/* ============================================
   AI Prompt Library V3 — prompts-v3.js
   Features: Multi-filters, Variable Wizard,
   Favorites, Card Grid, Prompt of the Day
   ============================================ */
(function () {
  'use strict';

  var PROMPTS = window.__prompts || [];
  var PLATFORMS = window.__platforms || {};
  var TOTAL = PROMPTS.length;

  // XSS prevention
  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  // Humanize slug: "project-management" → "Project Management"
  function humanize(s) {
    return s.replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  // Date-seeded PRNG (mulberry32)
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // === STATE ===
  var S = {
    search: '',
    platform: '',
    difficulty: '',
    role: '',
    view: 'list',
    tab: 'browse',
    favorites: []
  };

  // === DOM CACHE ===
  var D = {};
  function cacheDom() {
    D.search = document.getElementById('prompts-search');
    D.count = document.getElementById('prompts-count');
    D.clear = document.getElementById('prompts-clear');
    D.listView = document.getElementById('prompts-list-view');
    D.empty = document.getElementById('prompts-empty');
    D.potd = document.getElementById('prompts-potd');
    D.favBadge = document.getElementById('fav-badge');
    D.myPrompts = document.getElementById('my-prompts-content');
    D.wizOverlay = document.getElementById('wizard-overlay');
    D.wizBody = document.getElementById('wizard-body');
    D.wizClose = document.getElementById('wizard-close');
    D.wizCopy = document.getElementById('wizard-copy');
    D.wizPolish = document.getElementById('wizard-polish');
    D.wizTitle = document.getElementById('wizard-title');
    D.live = document.getElementById('prompts-live');
    D.filterPlatform = document.getElementById('filter-platform');
    D.filterDifficulty = document.getElementById('filter-difficulty');
    D.filterRole = document.getElementById('filter-role');
    D.rows = document.querySelectorAll('#prompts-list-view .prompt-row');
    D.groups = document.querySelectorAll('#prompts-list-view .prompts-category-group');
  }

  // === LOCALSTORAGE ===
  function loadState() {
    try {
      S.favorites = JSON.parse(localStorage.getItem('prompts_favorites') || '[]');
      S.view = localStorage.getItem('prompts_view') || 'list';
    } catch (e) { /* private browsing */ }
  }
  function saveState() {
    try {
      localStorage.setItem('prompts_favorites', JSON.stringify(S.favorites));
      localStorage.setItem('prompts_view', S.view);
    } catch (e) { /* quota or private */ }
  }

  // === BUILD FILTER DROPDOWNS ===
  function buildFilterDropdowns() {
    // Role dropdown (populated from data)
    if (!D.filterRole) return;
    var roleSet = {};
    for (var r = 0; r < PROMPTS.length; r++) {
      var roles = PROMPTS[r].roles || [];
      for (var ri = 0; ri < roles.length; ri++) roleSet[roles[ri]] = true;
    }
    var roleKeys = Object.keys(roleSet).sort();
    var html = '<option value="">All Roles</option>';
    for (var rk = 0; rk < roleKeys.length; rk++) {
      html += '<option value="' + esc(roleKeys[rk]) + '">' + esc(humanize(roleKeys[rk])) + '</option>';
    }
    D.filterRole.innerHTML = html;
  }

  // === FILTER LOGIC ===
  function getFilteredPrompts() {
    return PROMPTS.filter(function (p) {
      if (S.search) {
        var q = S.search.toLowerCase();
        var txt = (p.title + ' ' + p.description + ' ' + p.prompt + ' ' + (p.tags || []).join(' ')).toLowerCase();
        if (txt.indexOf(q) === -1) return false;
      }
      if (S.platform && (p.platforms || []).indexOf(S.platform) === -1) return false;
      if (S.difficulty && p.difficulty !== S.difficulty) return false;
      if (S.role && (p.roles || []).indexOf(S.role) === -1) return false;
      return true;
    });
  }

  function applyFilters() {
    var filtered = getFilteredPrompts();
    var filteredIds = {};
    for (var f = 0; f < filtered.length; f++) filteredIds[filtered[f].id] = true;

    // Update list view (show/hide server-rendered rows)
    if (D.listView) {
      D.rows.forEach(function (row) {
        row.style.display = filteredIds[row.dataset.pid] ? '' : 'none';
      });
      // Update category group visibility + counts
      D.groups.forEach(function (group) {
        var visible = 0;
        group.querySelectorAll('.prompt-row').forEach(function (r) {
          if (r.style.display !== 'none') visible++;
        });
        group.style.display = visible > 0 ? '' : 'none';
        var countEl = group.querySelector('.prompts-category-count');
        if (countEl) countEl.textContent = visible;
      });
    }

    // Update grid view
    if (S.view === 'grid') renderGridView(filtered);

    // Clear button
    var hasFilters = S.search || S.platform || S.difficulty || S.role;
    if (D.clear) D.clear.hidden = !hasFilters;

    syncUrl();
  }

  // === FAVORITES ===
  function toggleFavorite(pid) {
    var idx = S.favorites.indexOf(pid);
    if (idx === -1) S.favorites.push(pid);
    else S.favorites.splice(idx, 1);
    saveState();
    updateFavButtons();
    updateFavBadge();
  }

  function updateFavButtons() {
    document.querySelectorAll('.prompt-fav-btn').forEach(function (btn) {
      var pid = btn.dataset.pid;
      var isFav = S.favorites.indexOf(pid) !== -1;
      btn.textContent = isFav ? '★' : '☆';
      btn.classList.toggle('active', isFav);
      btn.setAttribute('aria-pressed', isFav);
    });
  }

  function updateFavBadge() {
    if (!D.favBadge) return;
    var count = S.favorites.length;
    D.favBadge.textContent = count;
    D.favBadge.hidden = count === 0;
  }

  function renderMyPrompts() {
    if (!D.myPrompts) return;
    if (S.favorites.length === 0) {
      D.myPrompts.innerHTML =
        '<div class="prompts-my-empty">' +
          '<p style="font-size:2rem;margin-bottom:0.5rem">☆</p>' +
          '<h3>No saved prompts yet</h3>' +
          '<p>Star any prompt with ☆ to save it here for quick access.</p>' +
        '</div>';
      return;
    }
    var favPrompts = [];
    for (var i = 0; i < PROMPTS.length; i++) {
      if (S.favorites.indexOf(PROMPTS[i].id) !== -1) favPrompts.push(PROMPTS[i]);
    }
    var html = '<div class="prompts-my-header">' +
      '<h2 style="color:#A78BFA;margin:0">Your Saved Prompts</h2>' +
      '<span style="color:rgba(255,255,255,0.5);font-size:0.85rem">' + favPrompts.length + ' prompt' + (favPrompts.length !== 1 ? 's' : '') + '</span>' +
      '<button class="prompts-export-btn" id="export-favs">Export as Markdown</button>' +
    '</div>';
    html += '<div class="prompts-grid">';
    for (var j = 0; j < favPrompts.length; j++) {
      var p = favPrompts[j];
      var hasVars = /\[[A-Z]/.test(p.prompt);
      html += '<div class="prompts-card" data-pid="' + esc(p.id) + '">' +
        '<div class="prompts-card-top">' +
          '<button class="prompt-fav-btn active" data-pid="' + esc(p.id) + '" aria-label="Remove from favorites" aria-pressed="true">★</button>' +
          '<span class="prompt-diff-badge" data-level="' + esc(p.difficulty) + '">' + esc(humanize(p.difficulty)) + '</span>' +
        '</div>' +
        '<h3 class="prompts-card-title"><a href="' + esc(p.url) + '">' + esc(p.title) + '</a></h3>' +
        '<p class="prompts-card-desc">' + esc(p.description) + '</p>' +
        '<div class="prompts-card-actions">' +
          (hasVars ? '<button class="prompt-customize-btn" data-pid="' + esc(p.id) + '">Customize</button>' : '') +
          '<button class="prompt-copy-btn" data-pid="' + esc(p.id) + '">Copy</button>' +
          '<a class="prompt-polish-btn" href="/prompt-polisher/?text=' + encodeURIComponent(p.prompt) + '">Polish</a>' +
        '</div>' +
      '</div>';
    }
    html += '</div>';
    D.myPrompts.innerHTML = html;
  }

  function exportFavorites() {
    var favPrompts = PROMPTS.filter(function (p) { return S.favorites.indexOf(p.id) !== -1; });
    var md = '# My Saved Prompts\n\nExported from [A Guide to Cloud & AI](https://www.aguidetocloud.com/prompts/)\n\n';
    for (var i = 0; i < favPrompts.length; i++) {
      var p = favPrompts[i];
      md += '## ' + p.title + '\n\n';
      md += '**Category:** ' + p.categoryTitle + ' | **Difficulty:** ' + humanize(p.difficulty) + '\n\n';
      md += '```\n' + p.prompt + '\n```\n\n';
      if (p.description) md += '*' + p.description + '*\n\n';
      md += '---\n\n';
    }
    var blob = new Blob([md], { type: 'text/markdown' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'my-prompts.md';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // === VARIABLE WIZARD ===
  var wizardPrompt = null;
  var wizardFields = [];

  function parseVariables(text) {
    var regex = /\[([A-Z][A-Z0-9_ \/—–,.-]*(?:\s*—\s*[^\]]*)?)\]/g;
    var vars = [], seen = {}, m;
    while ((m = regex.exec(text)) !== null) {
      var full = m[1];
      var parts = full.split(/\s*—\s*/);
      var name = parts[0].trim();
      var hint = parts.length > 1 ? parts.slice(1).join(' — ').trim() : '';
      if (!seen[name]) {
        seen[name] = true;
        vars.push({ name: name, hint: hint, full: m[0] });
      }
    }
    return vars;
  }

  // Known dropdown options for common variables
  var SMART_TYPES = {
    'TONE': ['Professional', 'Friendly', 'Formal', 'Urgent', 'Diplomatic', 'Casual', 'Authoritative'],
    'FORMAT': ['Email', 'Report', 'Memo', 'Presentation', 'Summary', 'Bullet Points', 'Table'],
    'LANGUAGE': ['English', 'Spanish', 'French', 'German', 'Japanese', 'Mandarin', 'Portuguese']
  };

  function openWizard(pid) {
    var prompt = null;
    for (var i = 0; i < PROMPTS.length; i++) {
      if (PROMPTS[i].id === pid) { prompt = PROMPTS[i]; break; }
    }
    if (!prompt) return;
    wizardPrompt = prompt;
    wizardFields = parseVariables(prompt.prompt);
    if (wizardFields.length === 0) return;

    if (D.wizTitle) D.wizTitle.textContent = 'Customize: ' + prompt.title;

    // Load saved values
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem('prompts_wiz_' + pid) || '{}'); } catch (e) {}

    var html = '<div class="wiz-fields">';
    for (var f = 0; f < wizardFields.length; f++) {
      var v = wizardFields[f];
      var label = humanize(v.name.toLowerCase());
      var savedVal = saved[v.name] || '';
      var smartOpts = SMART_TYPES[v.name];

      html += '<div class="wiz-field">';
      html += '<label for="wiz-f-' + f + '">' + esc(label) + '</label>';
      if (smartOpts) {
        html += '<select id="wiz-f-' + f + '" class="wiz-input" data-var="' + esc(v.name) + '">';
        html += '<option value="">Choose...</option>';
        for (var si = 0; si < smartOpts.length; si++) {
          html += '<option value="' + esc(smartOpts[si]) + '"' + (savedVal === smartOpts[si] ? ' selected' : '') + '>' + esc(smartOpts[si]) + '</option>';
        }
        html += '</select>';
      } else {
        html += '<input type="text" id="wiz-f-' + f + '" class="wiz-input" data-var="' + esc(v.name) + '" value="' + esc(savedVal) + '"' +
          (v.hint ? ' placeholder="e.g., ' + esc(v.hint) + '"' : ' placeholder="Enter ' + esc(label.toLowerCase()) + '"') + '>';
      }
      html += '</div>';
    }
    html += '</div>';
    html += '<div class="wiz-preview-label">Preview</div>';
    html += '<div class="wiz-preview" id="wiz-preview"></div>';

    D.wizBody.innerHTML = html;
    updateWizardPreview();

    // Bind field changes
    D.wizBody.querySelectorAll('.wiz-input').forEach(function (inp) {
      inp.addEventListener('input', updateWizardPreview);
      inp.addEventListener('change', updateWizardPreview);
    });

    D.wizOverlay.hidden = false;
    document.body.style.overflow = 'hidden';

    // Focus first field
    var firstField = D.wizBody.querySelector('.wiz-input');
    if (firstField) setTimeout(function () { firstField.focus(); }, 50);
  }

  function updateWizardPreview() {
    if (!wizardPrompt) return;
    var text = wizardPrompt.prompt;
    var values = {};
    D.wizBody.querySelectorAll('.wiz-input').forEach(function (inp) {
      values[inp.dataset['var']] = inp.value;
    });

    for (var i = 0; i < wizardFields.length; i++) {
      var v = wizardFields[i];
      var val = values[v.name] || '';
      var replacement = val || '<span class="wiz-placeholder">[' + esc(v.name) + ']</span>';
      text = text.split(v.full).join(val ? esc(val) : replacement);
    }

    var previewEl = document.getElementById('wiz-preview');
    if (previewEl) previewEl.innerHTML = '<div class="prompt-text">' + text + '</div>';
  }

  function getFilledPrompt() {
    if (!wizardPrompt) return '';
    var text = wizardPrompt.prompt;
    var values = {};
    D.wizBody.querySelectorAll('.wiz-input').forEach(function (inp) {
      values[inp.dataset['var']] = inp.value;
    });
    for (var i = 0; i < wizardFields.length; i++) {
      var v = wizardFields[i];
      var val = values[v.name] || v.full;
      text = text.split(v.full).join(val);
    }
    // Save values for next time
    try { localStorage.setItem('prompts_wiz_' + wizardPrompt.id, JSON.stringify(values)); } catch (e) {}
    return text;
  }

  function closeWizard() {
    if (D.wizOverlay) D.wizOverlay.hidden = true;
    document.body.style.overflow = '';
    wizardPrompt = null;
    wizardFields = [];
  }

  // === PROMPT OF THE DAY ===
  function renderPOTD() {
    if (!D.potd || PROMPTS.length === 0) return;
    var today = new Date();
    var seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    var rng = mulberry32(seed);
    var idx = Math.floor(rng() * PROMPTS.length);
    var p = PROMPTS[idx];
    var hasVars = /\[[A-Z]/.test(p.prompt);

    D.potd.innerHTML =
      '<div class="prompts-potd-card">' +
        '<div class="prompts-potd-label">Prompt of the Day</div>' +
        '<h3 class="prompts-potd-title"><a href="' + esc(p.url) + '">' + esc(p.title) + '</a></h3>' +
        '<p class="prompts-potd-desc">' + esc(p.description) + '</p>' +
        '<div class="prompts-potd-actions">' +
          (hasVars ? '<button class="prompt-customize-btn" data-pid="' + esc(p.id) + '">Customize</button>' : '') +
          '<button class="prompt-copy-btn" data-pid="' + esc(p.id) + '">Copy</button>' +
          '<a href="' + esc(p.url) + '" class="prompts-potd-link">View full prompt →</a>' +
        '</div>' +
      '</div>';
  }

  // === TABS ===
  function switchTab(tabId) {
    S.tab = tabId;
    document.querySelectorAll('.prompts-tab-btn').forEach(function (t) {
      var isActive = t.dataset.tab === tabId;
      t.classList.toggle('active', isActive);
      t.setAttribute('aria-selected', isActive);
    });
    document.querySelectorAll('.prompts-panel').forEach(function (p) {
      p.classList.remove('active');
    });
    var panel = document.getElementById('panel-' + tabId);
    if (panel) panel.classList.add('active');

    if (tabId === 'my-prompts') renderMyPrompts();
  }

  // === COPY ===
  function getPromptById(pid) {
    for (var i = 0; i < PROMPTS.length; i++) {
      if (PROMPTS[i].id === pid) return PROMPTS[i].prompt;
    }
    return '';
  }

  function copyText(text, btn) {
    navigator.clipboard.writeText(text).then(function () {
      showCopied(btn);
      if (D.live) D.live.textContent = 'Prompt copied to clipboard';
      if (window.clarity) window.clarity('event', 'prompt_copy');
    }).catch(function () {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      showCopied(btn);
    });
  }

  function showCopied(btn) {
    if (!btn) return;
    var orig = btn.textContent;
    btn.textContent = '✅ Copied!';
    btn.classList.add('copied');
    setTimeout(function () { btn.textContent = orig; btn.classList.remove('copied'); }, 2000);
  }

  // === URL STATE ===
  function syncUrl() {
    var p = new URLSearchParams();
    if (S.search) p.set('q', S.search);
    if (S.platform) p.set('platform', S.platform);
    if (S.difficulty) p.set('difficulty', S.difficulty);
    if (S.role) p.set('role', S.role);
    if (S.tab !== 'browse') p.set('tab', S.tab);
    var str = p.toString();
    history.replaceState(null, '', str ? '?' + str : location.pathname);
  }

  function readUrl() {
    var p = new URLSearchParams(location.search);
    if (p.get('q') && D.search) { S.search = p.get('q'); D.search.value = S.search; }
    if (p.get('platform')) { S.platform = p.get('platform'); if (D.filterPlatform) D.filterPlatform.value = S.platform; }
    if (p.get('difficulty')) { S.difficulty = p.get('difficulty'); if (D.filterDifficulty) D.filterDifficulty.value = S.difficulty; }
    if (p.get('role')) { S.role = p.get('role'); if (D.filterRole) D.filterRole.value = S.role; }
    if (p.get('tab')) S.tab = p.get('tab');
  }

  // === EVENT BINDING ===
  function bindEvents() {
    // Search (debounced)
    var searchTimer;
    if (D.search) {
      D.search.addEventListener('input', function () {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(function () {
          S.search = D.search.value.trim();
          applyFilters();
        }, 200);
      });
    }

    // Dropdown filters
    if (D.filterPlatform) D.filterPlatform.addEventListener('change', function () {
      S.platform = this.value; applyFilters();
    });
    if (D.filterDifficulty) D.filterDifficulty.addEventListener('change', function () {
      S.difficulty = this.value; applyFilters();
    });
    if (D.filterRole) D.filterRole.addEventListener('change', function () {
      S.role = this.value; applyFilters();
    });

    // Clear filters
    if (D.clear) D.clear.addEventListener('click', function () {
      S.search = ''; S.platform = ''; S.difficulty = ''; S.role = '';
      if (D.search) D.search.value = '';
      if (D.filterPlatform) D.filterPlatform.value = '';
      if (D.filterDifficulty) D.filterDifficulty.value = '';
      if (D.filterRole) D.filterRole.value = '';
      applyFilters();
    });

    // View toggle
    if (D.viewBtn) D.viewBtn.addEventListener('click', function () {
      setView(S.view === 'list' ? 'grid' : 'list');
    });

    // Tabs
    document.querySelectorAll('.prompts-tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { switchTab(btn.dataset.tab); });
    });

    // Global click delegation
    document.addEventListener('click', function (e) {
      // Favorite
      var favBtn = e.target.closest('.prompt-fav-btn');
      if (favBtn) { e.preventDefault(); e.stopPropagation(); toggleFavorite(favBtn.dataset.pid); return; }

      // Copy
      var copyBtn = e.target.closest('.prompt-copy-btn');
      if (copyBtn) {
        e.preventDefault(); e.stopPropagation();
        var pid = copyBtn.dataset.pid;
        if (pid) {
          copyText(getPromptById(pid), copyBtn);
        } else if (copyBtn.dataset.prompt) {
          // Fallback for category sub-pages (no JSON data)
          copyText(copyBtn.dataset.prompt, copyBtn);
        }
        return;
      }

      // Full copy button on single pages
      var fullCopy = e.target.closest('.prompt-full-copy');
      if (fullCopy) {
        e.preventDefault();
        copyText(fullCopy.dataset.prompt, fullCopy);
        return;
      }

      // Customize (wizard)
      var custBtn = e.target.closest('.prompt-customize-btn');
      if (custBtn) { e.preventDefault(); e.stopPropagation(); openWizard(custBtn.dataset.pid); return; }

      // Accordion toggle
      var rowHeader = e.target.closest('.prompt-row-header');
      if (rowHeader && !e.target.closest('a, button')) {
        var row = rowHeader.closest('.prompt-row');
        var body = row.querySelector('.prompt-row-body');
        var arrow = rowHeader.querySelector('.prompt-row-arrow');
        var isOpen = !body.hidden;
        body.hidden = isOpen;
        arrow.textContent = isOpen ? '▸' : '▾';
        rowHeader.setAttribute('aria-expanded', !isOpen);
      }

      // Open-in-platform buttons
      var openBtn = e.target.closest('.prompt-open-btn');
      if (openBtn) {
        var promptEl = document.querySelector('.prompt-full-text');
        if (promptEl) navigator.clipboard.writeText(promptEl.textContent.trim()).catch(function () {});
      }

      // Export favorites
      if (e.target.id === 'export-favs') { exportFavorites(); return; }
    });

    // Keyboard: accordion Enter/Space
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && D.wizOverlay && !D.wizOverlay.hidden) {
        closeWizard(); return;
      }
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var header = e.target.closest('.prompt-row-header');
      if (!header || e.target.closest('a, button')) return;
      e.preventDefault();
      header.click();
    });

    // Wizard close
    if (D.wizClose) D.wizClose.addEventListener('click', closeWizard);
    if (D.wizOverlay) D.wizOverlay.addEventListener('click', function (e) {
      if (e.target === D.wizOverlay) closeWizard();
    });

    // Wizard copy
    if (D.wizCopy) D.wizCopy.addEventListener('click', function () {
      var filled = getFilledPrompt();
      copyText(filled, D.wizCopy);
    });

    // Wizard polish (use sessionStorage for privacy)
    if (D.wizPolish) D.wizPolish.addEventListener('click', function () {
      var filled = getFilledPrompt();
      try { sessionStorage.setItem('polisher_prefill', filled); } catch (e) {}
      window.open('/prompt-polisher/?from=wizard', '_blank');
    });
  }

  // === INIT ===
  function init() {
    cacheDom();
    loadState();
    buildFilterDropdowns();
    renderPOTD();
    readUrl();
    if (S.tab !== 'browse') switchTab(S.tab);
    applyFilters();
    updateFavButtons();
    updateFavBadge();
    bindEvents();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
/* deploy-fix: 2026041818 */
