/**
 * ⚡ PowerShell Command Builder v2
 * 100% client-side, zero API calls
 * Addresses all 20 UX improvements
 */
(function () {
  'use strict';

  const D = window.__psBuilderData || { modules: [], cmdlets: [], recipes: [] };
  const HISTORY_KEY = 'psb_history';
  const MAX_HISTORY = 20;

  // Popular recipe IDs for Quick Start section
  const POPULAR_IDS = [
    'exo-shared-mailbox-create', 'ad-locked-accounts', 'graph-all-users',
    'win-disk-space', 'az-list-vms', 'exo-forwarding-check',
    'gpo-backup-all', 'teams-guest-report'
  ];

  const S = {
    activeTab: 'recipes',
    selectedModule: null,
    selectedCmdlet: null,
    recipeFilter: 'all',
    difficultyFilter: 'all',
    recipeSearch: '',
    refSearch: '',
    moduleCat: 'all',
    expandedRecipe: null
  };

  /* ═══════ HELPERS ═══════ */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; };
  function moduleById(id) { return D.modules.find(m => m.id === id); }
  function cmdletsForModule(modId) { return D.cmdlets.filter(c => c.module === modId); }
  function recipeById(id) { return D.recipes.find(r => r.id === id); }

  function esc(s) {
    if (!s) return '';
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function toast(msg) {
    let t = $('.psb-toast');
    if (!t) { t = el('div', 'psb-toast'); document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
  }

  function copyText(text) {
    navigator.clipboard.writeText(text).then(() => toast('✅ Copied to clipboard!'));
  }

  function downloadPS1(text, filename) {
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename || 'command.ps1';
    a.click();
    URL.revokeObjectURL(a.href);
    toast('💾 Downloaded!');
  }

  function timeAgo(ts) {
    const d = Date.now() - ts;
    if (d < 60000) return 'just now';
    if (d < 3600000) return Math.floor(d / 60000) + 'm ago';
    if (d < 86400000) return Math.floor(d / 3600000) + 'h ago';
    return Math.floor(d / 86400000) + 'd ago';
  }

  // #11 — Build full command with prerequisites as comments
  function fullCommandText(command, modId) {
    const mod = moduleById(modId);
    if (!mod) return command;
    let full = '';
    if (mod.install_command) full += `# ${mod.install_command}\n`;
    if (mod.connect_command) full += `# ${mod.connect_command}\n\n`;
    full += command;
    return full;
  }

  /* ═══════ STATS BANNER (#5) ═══════ */
  function renderStats() {
    const rs = $('#psb-stat-recipes');
    const cs = $('#psb-stat-cmdlets');
    const ms = $('#psb-stat-modules');
    if (rs) rs.textContent = D.recipes.length;
    if (cs) cs.textContent = D.cmdlets.length;
    if (ms) ms.textContent = D.modules.length;
  }

  /* ═══════ HISTORY ═══════ */
  function getHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch { return []; }
  }

  function addHistory(cmd, label) {
    const h = getHistory();
    h.unshift({ cmd, label, time: Date.now() });
    if (h.length > MAX_HISTORY) h.length = MAX_HISTORY;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
    renderHistory();
  }

  function clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
  }

  // #7 — History as collapsible <details> with badge count
  function renderHistory() {
    const list = $('#psb-history-list');
    const btn = $('#psb-clear-history');
    const badge = $('#psb-history-badge');
    const h = getHistory();

    if (badge) badge.textContent = h.length ? `(${h.length})` : '';

    if (!h.length) {
      list.innerHTML = '<p class="psb-history-empty">No commands yet. Build or use a recipe to get started.</p>';
      if (btn) btn.hidden = true;
      return;
    }
    if (btn) btn.hidden = false;
    list.innerHTML = h.map((item, i) => `
      <div class="psb-history-item" data-idx="${i}" tabindex="0" role="button" aria-label="Copy command">
        <div class="psb-history-cmd">${esc(item.cmd.split('\n')[0].substring(0, 80))}</div>
        <div class="psb-history-time">${timeAgo(item.time)}</div>
      </div>
    `).join('');
  }

  /* ═══════ TABS (#17 smooth transition) ═══════ */
  function switchTab(tab) {
    S.activeTab = tab;
    $$('.psb-tab').forEach(t => {
      const isActive = t.dataset.tab === tab;
      t.classList.toggle('active', isActive);
      t.setAttribute('aria-selected', isActive);
    });
    $$('.psb-panel').forEach(p => {
      const isActive = p.id === 'psb-panel-' + tab;
      if (isActive) {
        p.hidden = false;
        p.classList.remove('psb-fade-in');
        void p.offsetWidth; // reflow
        p.classList.add('active', 'psb-fade-in');
      } else {
        p.classList.remove('active', 'psb-fade-in');
        p.hidden = true;
      }
    });
    updateURL();
  }

  /* ═══════ QUICK START (#10) ═══════ */
  function renderQuickStart() {
    const container = $('#psb-quick-start');
    if (!container) return;
    const popular = POPULAR_IDS.map(id => recipeById(id)).filter(Boolean);
    if (!popular.length) return;

    container.innerHTML = `
      <div class="psb-quick-header">🔥 Most Common Tasks</div>
      <div class="psb-quick-grid">
        ${popular.map(r => {
          const mod = moduleById(r.module);
          return `<button class="psb-quick-item" data-recipe="${r.id}" tabindex="0">
            <span class="psb-quick-emoji">${mod ? mod.emoji : '📋'}</span>
            <span class="psb-quick-label">${esc(r.title)}</span>
          </button>`;
        }).join('')}
      </div>
    `;
  }

  /* ═══════ RECIPES TAB ═══════ */

  // #6 — Recipe count per service pill
  function renderRecipeFilters() {
    const container = $('#psb-recipe-filters');
    const services = [...new Set(D.recipes.map(r => r.service))].sort();
    const counts = {};
    D.recipes.forEach(r => { counts[r.service] = (counts[r.service] || 0) + 1; });

    services.forEach(svc => {
      const mod = D.modules.find(m => m.display_name === svc);
      const btn = el('button', 'psb-pill');
      btn.dataset.filter = svc;
      btn.textContent = (mod ? mod.emoji + ' ' : '') + svc + ` (${counts[svc]})`;
      container.appendChild(btn);
    });
  }

  // #4 — Expand chevron, #9 — Related recipes, #11 — Prerequisites in copy,
  // #14 — Sort beginner first, #18 — Keyboard nav, #19 — Deep-links
  function renderRecipes() {
    const grid = $('#psb-recipe-grid');
    const countEl = $('#psb-recipe-count');
    const q = S.recipeSearch.toLowerCase().trim();

    let filtered = D.recipes;
    if (S.recipeFilter !== 'all') filtered = filtered.filter(r => r.service === S.recipeFilter);
    if (S.difficultyFilter !== 'all') filtered = filtered.filter(r => r.difficulty === S.difficultyFilter);
    if (q) filtered = filtered.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      (r.tags && r.tags.some(t => t.toLowerCase().includes(q))) ||
      r.command.toLowerCase().includes(q)
    );

    // #14 — Sort: beginner first, then intermediate, then advanced
    const diffOrder = { beginner: 0, intermediate: 1, advanced: 2 };
    filtered.sort((a, b) => (diffOrder[a.difficulty] || 0) - (diffOrder[b.difficulty] || 0));

    countEl.textContent = `${filtered.length} recipe${filtered.length !== 1 ? 's' : ''}`;

    if (!filtered.length) {
      grid.innerHTML = '<p style="color:var(--psb-text-dim);text-align:center;padding:2rem;">No recipes match your filters. Try broadening your search.</p>';
      return;
    }

    grid.innerHTML = filtered.map(r => {
      const isExpanded = S.expandedRecipe === r.id;
      const mod = moduleById(r.module);

      // #9 — Related recipes
      let relatedHTML = '';
      if (r.related_recipes && r.related_recipes.length) {
        const related = r.related_recipes.map(id => recipeById(id)).filter(Boolean);
        if (related.length) {
          relatedHTML = `<div class="psb-recipe-related"><strong>Related:</strong> ${related.map(rr => `<a href="?recipe=${rr.id}" class="psb-related-link" data-goto-recipe="${rr.id}">${esc(rr.title)}</a>`).join(', ')}</div>`;
        }
      }

      return `
      <div class="psb-recipe-card${isExpanded ? ' expanded' : ''}" data-recipe="${r.id}" tabindex="0" role="button" aria-expanded="${isExpanded}">
        <div class="psb-recipe-header">
          <span class="psb-recipe-title">${esc(r.title)}</span>
          <div class="psb-recipe-badges">
            <span class="psb-badge psb-badge-service">${esc(r.service)}</span>
            <span class="psb-badge psb-badge-${r.difficulty}">${r.difficulty}</span>
          </div>
          <span class="psb-recipe-chevron">${isExpanded ? '▾' : '▸'}</span>
        </div>
        <div class="psb-recipe-desc">${esc(r.description)}</div>
        <div class="psb-recipe-detail">
          <div class="psb-recipe-command">
            <pre class="psb-output-code">${highlightPS(r.command)}</pre>
          </div>
          <div class="psb-recipe-explanation">${esc(r.explanation)}</div>
          ${r.prerequisites ? `<div class="psb-recipe-prereq"><strong>Prerequisites:</strong> ${esc(r.prerequisites)}</div>` : ''}
          ${relatedHTML}
          <div class="psb-recipe-actions">
            <button class="psb-btn-copy" data-recipe-id="${r.id}">📋 Copy</button>
            <button class="psb-btn-copy" data-recipe-id="${r.id}" data-with-prereqs="1">📋 Copy with Prerequisites</button>
            <button class="psb-btn-download" data-recipe-id="${r.id}">💾 .ps1</button>
            <button class="psb-btn-secondary psb-customise-btn" data-recipe-id="${r.id}" style="font-size:0.8rem;padding:0.4rem 0.8rem;">🔧 Customise →</button>
          </div>
        </div>
      </div>
      `;
    }).join('');
  }

  /* ═══════ BUILD TAB ═══════ */

  // #16 — Module category tabs
  function renderModuleGrid() {
    const grid = $('#psb-module-grid');
    const cat = S.moduleCat;
    const filtered = cat === 'all' ? D.modules : D.modules.filter(m => m.category === cat);

    grid.innerHTML = filtered.map(m => `
      <div class="psb-module-card${S.selectedModule === m.id ? ' active' : ''}" data-module="${m.id}" tabindex="0" role="button">
        <span class="psb-module-emoji">${m.emoji}</span>
        <div class="psb-module-name">${esc(m.display_name)}</div>
        <div class="psb-module-desc">${esc(m.description).substring(0, 60)}…</div>
      </div>
    `).join('');
  }

  function selectModule(modId) {
    S.selectedModule = modId;
    S.selectedCmdlet = null;
    $$('.psb-module-card').forEach(c => c.classList.toggle('active', c.dataset.module === modId));

    const mod = moduleById(modId);
    const info = $('#psb-module-info');
    info.hidden = false;

    let html = `<div class="psb-module-info-title">${mod.emoji} ${esc(mod.display_name)} — Setup</div>`;
    if (mod.install_command) {
      html += `<div class="psb-module-info-row"><span class="psb-module-info-label">Install:</span><code class="psb-module-info-value">${esc(mod.install_command)}</code></div>`;
    }
    if (mod.connect_command) {
      html += `<div class="psb-module-info-row"><span class="psb-module-info-label">Connect:</span><code class="psb-module-info-value">${esc(mod.connect_command)}</code></div>`;
    }
    if (mod.learn_url) {
      html += `<div class="psb-module-info-row"><span class="psb-module-info-label">Docs:</span><a href="${mod.learn_url}" target="_blank" rel="noopener" class="psb-module-info-link">Microsoft Learn ↗</a></div>`;
    }
    if (mod.install_note) {
      html += `<div class="psb-module-info-note">💡 ${esc(mod.install_note)}</div>`;
    }
    info.innerHTML = html;

    renderCmdletList();
    $('#psb-step-cmdlet').hidden = false;
    $('#psb-step-params').hidden = true;
    $('#psb-output-section').hidden = true;
  }

  function renderCmdletList() {
    const list = $('#psb-cmdlet-list');
    const cmdlets = cmdletsForModule(S.selectedModule);
    const q = ($('#psb-cmdlet-search') || {}).value || '';
    const filtered = q ? cmdlets.filter(c => c.name.toLowerCase().includes(q.toLowerCase()) || c.description.toLowerCase().includes(q.toLowerCase())) : cmdlets;

    list.innerHTML = filtered.length ? filtered.map(c => `
      <div class="psb-cmdlet-item${S.selectedCmdlet === c.id ? ' active' : ''}" data-cmdlet="${c.id}" tabindex="0" role="button">
        <span class="psb-cmdlet-name">${esc(c.name)}</span>
        <span class="psb-cmdlet-desc">${esc(c.description)}</span>
      </div>
    `).join('') : '<p style="color:var(--psb-text-dim);padding:1rem;">No cmdlets found.</p>';
  }

  function selectCmdlet(cmdletId) {
    S.selectedCmdlet = cmdletId;
    $$('.psb-cmdlet-item').forEach(c => c.classList.toggle('active', c.dataset.cmdlet === cmdletId));
    renderParamForm();
    $('#psb-step-params').hidden = false;
    $('#psb-output-section').hidden = true;
  }

  function renderParamForm() {
    const cmdlet = D.cmdlets.find(c => c.id === S.selectedCmdlet);
    if (!cmdlet || !cmdlet.parameters) return;

    const form = $('#psb-params-form');
    form.innerHTML = cmdlet.parameters.map((p, i) => {
      const reqBadge = p.required ? '<span class="psb-param-required-badge">REQUIRED</span>' : '';
      let input = '';

      if (p.type === 'switch') {
        input = `<div class="psb-param-switch"><input type="checkbox" id="psb-p-${i}" data-param="${esc(p.name)}" data-type="switch"><label for="psb-p-${i}">Enable -${esc(p.name)}</label></div>`;
      } else if (p.type === 'select' && p.options) {
        input = `<select class="psb-param-select" id="psb-p-${i}" data-param="${esc(p.name)}" data-type="select"><option value="">— Select —</option>${p.options.map(o => `<option value="${esc(o)}">${esc(o)}</option>`).join('')}</select>`;
      } else {
        input = `<input type="text" class="psb-param-input" id="psb-p-${i}" data-param="${esc(p.name)}" data-type="${p.type || 'string'}" placeholder="${esc(p.placeholder || p.example || '')}"${p.required ? ' required' : ''}>`;
      }

      return `
        <div class="psb-param-group${p.required ? ' required' : ''}">
          <div class="psb-param-header">
            <span class="psb-param-name">-${esc(p.name)}</span>
            ${reqBadge}
            <span class="psb-param-type">${esc(p.type || 'string')}</span>
          </div>
          <div class="psb-param-desc">${esc(p.description)}</div>
          ${input}
        </div>
      `;
    }).join('');

    // #8 — Auto-preview: listen for input changes
    form.addEventListener('input', debounce(autoPreview, 300));
    form.addEventListener('change', debounce(autoPreview, 100));
  }

  // #8 — Live auto-preview as user types
  function autoPreview() {
    if (!S.selectedCmdlet) return;
    buildCommand(true);
  }

  let _debounceTimer;
  function debounce(fn, ms) {
    return function () {
      clearTimeout(_debounceTimer);
      _debounceTimer = setTimeout(fn, ms);
    };
  }

  function buildCommand(isAutoPreview) {
    const cmdlet = D.cmdlets.find(c => c.id === S.selectedCmdlet);
    if (!cmdlet) return;

    const mod = moduleById(S.selectedModule);
    const params = [];

    $$('#psb-params-form [data-param]').forEach(input => {
      const name = input.dataset.param;
      const type = input.dataset.type;

      if (type === 'switch') {
        if (input.checked) params.push(`-${name}`);
      } else if (type === 'select') {
        if (input.value) params.push(`-${name} ${input.value}`);
      } else {
        const val = input.value.trim();
        if (val) {
          if (val.startsWith('$') || val.startsWith('(') || val.startsWith('@{') || val === 'Unlimited' || val === '$true' || val === '$false') {
            params.push(`-${name} ${val}`);
          } else {
            params.push(`-${name} "${val}"`);
          }
        }
      }
    });

    let command = cmdlet.name;
    if (params.length) command += ' ' + params.join(' ');

    const fullCmd = fullCommandText(command, S.selectedModule);
    const outputEl = $('#psb-output-code');
    outputEl.innerHTML = highlightPS(fullCmd);
    outputEl.dataset.raw = fullCmd;
    outputEl.dataset.cmdOnly = command;

    $('#psb-output-section').hidden = false;
    if (!isAutoPreview) {
      $('#psb-output-section').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      addHistory(command, `${cmdlet.name} (${mod.display_name})`);
    }
  }

  function resetBuild() {
    S.selectedModule = null;
    S.selectedCmdlet = null;
    $$('.psb-module-card').forEach(c => c.classList.remove('active'));
    $('#psb-module-info').hidden = true;
    $('#psb-step-cmdlet').hidden = true;
    $('#psb-step-params').hidden = true;
    $('#psb-output-section').hidden = true;
    const search = $('#psb-cmdlet-search');
    if (search) search.value = '';
  }

  /* ═══════ REFERENCE TAB ═══════ */
  function renderReference() {
    const container = $('#psb-ref-modules');
    const q = S.refSearch.toLowerCase().trim();

    container.innerHTML = D.modules.map(mod => {
      let cmdlets = cmdletsForModule(mod.id);
      if (q) cmdlets = cmdlets.filter(c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
      if (!cmdlets.length && q) return '';

      return `
        <div class="psb-ref-module${q ? ' open' : ''}">
          <div class="psb-ref-module-header">
            <span class="psb-module-emoji" style="font-size:1.2rem;margin:0">${mod.emoji}</span>
            <span class="psb-ref-module-title">${esc(mod.display_name)}</span>
            <span class="psb-ref-module-count">${cmdlets.length} cmdlets</span>
            <span class="psb-ref-module-arrow">▸</span>
          </div>
          <div class="psb-ref-module-body">
            ${cmdlets.map(c => `
              <div class="psb-ref-cmdlet">
                <span class="psb-ref-cmdlet-name">${esc(c.name)}</span>
                <span class="psb-ref-cmdlet-desc">${esc(c.description)}</span>
                <div class="psb-ref-cmdlet-actions">
                  <button class="psb-ref-load-btn" data-load-module="${c.module}" data-load-cmdlet="${c.id}">Load →</button>
                  ${c.learn_url ? `<a href="${c.learn_url}" target="_blank" rel="noopener" class="psb-ref-learn-link">Docs ↗</a>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).filter(Boolean).join('');
  }

  /* ═══════ SYNTAX HIGHLIGHTING ═══════ */
  function highlightPS(code) {
    if (!code) return '';
    return esc(code)
      .replace(/(#[^\n]*)/g, '<span class="psb-syn-comment">$1</span>')
      .replace(/(\$\w+)/g, '<span class="psb-syn-variable">$1</span>')
      .replace(/(\|)/g, '<span class="psb-syn-pipe">$1</span>')
      .replace(/\b([A-Z][a-z]+-[A-Z]\w+)/g, '<span class="psb-syn-cmdlet">$1</span>')
      .replace(/(\s)(-[A-Za-z]+)/g, '$1<span class="psb-syn-param">$2</span>')
      .replace(/(&quot;[^&]*&quot;)/g, '<span class="psb-syn-value">$1</span>')
      .replace(/('(?:[^'\\]|\\.)*')/g, '<span class="psb-syn-value">$1</span>');
  }

  /* ═══════ URL STATE (#19 recipe deep-links) ═══════ */
  function updateURL() {
    const p = new URLSearchParams();
    if (S.activeTab !== 'recipes') p.set('tab', S.activeTab);
    if (S.recipeFilter !== 'all') p.set('service', S.recipeFilter);
    if (S.recipeSearch) p.set('q', S.recipeSearch);
    if (S.selectedModule) p.set('module', S.selectedModule);
    if (S.selectedCmdlet) p.set('cmdlet', S.selectedCmdlet);
    if (S.expandedRecipe) p.set('recipe', S.expandedRecipe);
    const qs = p.toString();
    history.replaceState(null, '', qs ? '?' + qs : location.pathname);
  }

  function readURL() {
    const p = new URLSearchParams(location.search);
    if (p.get('tab')) S.activeTab = p.get('tab');
    if (p.get('service')) S.recipeFilter = p.get('service');
    if (p.get('q')) S.recipeSearch = p.get('q');
    if (p.get('module')) S.selectedModule = p.get('module');
    if (p.get('cmdlet')) S.selectedCmdlet = p.get('cmdlet');
    if (p.get('recipe')) S.expandedRecipe = p.get('recipe');
  }

  /* ═══════ #13 — Export all recipes per service ═══════ */
  function exportServiceRecipes(service) {
    const recipes = D.recipes.filter(r => r.service === service);
    if (!recipes.length) return;
    const mod = D.modules.find(m => m.display_name === service);
    let text = `# ${service} PowerShell Recipes\n# Generated by aguidetocloud.com/ps-builder/\n# ${new Date().toISOString().split('T')[0]}\n\n`;
    if (mod && mod.install_command) text += `# Setup: ${mod.install_command}\n`;
    if (mod && mod.connect_command) text += `# Setup: ${mod.connect_command}\n\n`;
    text += recipes.map(r => `# ── ${r.title} ──\n# ${r.description}\n${r.command}\n`).join('\n');
    downloadPS1(text, `${service.toLowerCase().replace(/\s+/g, '-')}-recipes.ps1`);
  }

  /* ═══════ EVENT HANDLERS ═══════ */
  function bindEvents() {
    document.addEventListener('click', e => {
      // Tabs
      const tab = e.target.closest('.psb-tab');
      if (tab) { switchTab(tab.dataset.tab); return; }

      // Recipe service filters
      const pill = e.target.closest('#psb-recipe-filters .psb-pill');
      if (pill) {
        S.recipeFilter = pill.dataset.filter;
        $$('#psb-recipe-filters .psb-pill').forEach(p => p.classList.toggle('active', p.dataset.filter === S.recipeFilter));
        renderRecipes();
        updateURL();
        return;
      }

      // Difficulty filters
      const dpill = e.target.closest('#psb-difficulty-filters .psb-pill-sm');
      if (dpill) {
        S.difficultyFilter = dpill.dataset.difficulty;
        $$('#psb-difficulty-filters .psb-pill-sm').forEach(p => p.classList.toggle('active', p.dataset.difficulty === S.difficultyFilter));
        renderRecipes();
        return;
      }

      // #16 — Module category filters
      const mcatPill = e.target.closest('#psb-module-cats .psb-pill-sm');
      if (mcatPill) {
        S.moduleCat = mcatPill.dataset.cat;
        $$('#psb-module-cats .psb-pill-sm').forEach(p => p.classList.toggle('active', p.dataset.cat === S.moduleCat));
        renderModuleGrid();
        return;
      }

      // Quick Start item
      const quickItem = e.target.closest('.psb-quick-item');
      if (quickItem) {
        const id = quickItem.dataset.recipe;
        S.expandedRecipe = id;
        renderRecipes();
        updateURL();
        setTimeout(() => {
          const card = document.querySelector(`.psb-recipe-card[data-recipe="${id}"]`);
          if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
        return;
      }

      // #9 — Related recipe link
      const relatedLink = e.target.closest('.psb-related-link');
      if (relatedLink) {
        e.preventDefault();
        const id = relatedLink.dataset.gotoRecipe;
        S.expandedRecipe = id;
        renderRecipes();
        updateURL();
        setTimeout(() => {
          const card = document.querySelector(`.psb-recipe-card[data-recipe="${id}"]`);
          if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
        return;
      }

      // #2 — Copy button (reads from data array, not HTML attribute)
      const copyBtn = e.target.closest('.psb-btn-copy');
      if (copyBtn) {
        if (copyBtn.dataset.recipeId) {
          const recipe = recipeById(copyBtn.dataset.recipeId);
          if (recipe) {
            // #11 — Copy with prerequisites option
            const text = copyBtn.dataset.withPrereqs ? fullCommandText(recipe.command, recipe.module) : recipe.command;
            copyText(text);
          }
        } else {
          const raw = ($('#psb-output-code') || {}).dataset?.raw || '';
          if (raw) copyText(raw);
        }
        return;
      }

      // Download button
      const dlBtn = e.target.closest('.psb-btn-download');
      if (dlBtn) {
        if (dlBtn.dataset.recipeId) {
          const recipe = recipeById(dlBtn.dataset.recipeId);
          if (recipe) downloadPS1(fullCommandText(recipe.command, recipe.module), recipe.id + '.ps1');
        } else {
          const raw = ($('#psb-output-code') || {}).dataset?.raw || '';
          const cmdlet = D.cmdlets.find(c => c.id === S.selectedCmdlet);
          downloadPS1(raw, (cmdlet ? cmdlet.id : 'command') + '.ps1');
        }
        return;
      }

      // Share button
      if (e.target.closest('.psb-btn-share') || e.target.id === 'psb-share-btn') {
        copyText(location.href);
        return;
      }

      // #3 — Customise button (selects module AND finds matching cmdlet)
      const custBtn = e.target.closest('.psb-customise-btn');
      if (custBtn) {
        const recipe = recipeById(custBtn.dataset.recipeId);
        if (recipe) {
          switchTab('build');
          selectModule(recipe.module);
          // Try to match the cmdlet from the recipe command
          const cmdMatch = recipe.command.match(/^([A-Z][a-z]+-[A-Z]\w+)/);
          if (cmdMatch) {
            const cmdlet = D.cmdlets.find(c => c.name === cmdMatch[1] && c.module === recipe.module);
            if (cmdlet) setTimeout(() => selectCmdlet(cmdlet.id), 100);
          }
        }
        return;
      }

      // Recipe card toggle (#4 — chevron, #18 — keyboard)
      const card = e.target.closest('.psb-recipe-card');
      if (card && !e.target.closest('.psb-btn-copy, .psb-btn-download, .psb-customise-btn, .psb-related-link')) {
        const id = card.dataset.recipe;
        S.expandedRecipe = S.expandedRecipe === id ? null : id;
        renderRecipes();
        updateURL();
        return;
      }

      // Module card
      const modCard = e.target.closest('.psb-module-card');
      if (modCard) { selectModule(modCard.dataset.module); return; }

      // Cmdlet item
      const cmdItem = e.target.closest('.psb-cmdlet-item');
      if (cmdItem) { selectCmdlet(cmdItem.dataset.cmdlet); return; }

      // Build/Reset buttons
      if (e.target.id === 'psb-build-btn') { buildCommand(false); return; }
      if (e.target.id === 'psb-reset-btn') { resetBuild(); return; }

      // Output copy/download
      if (e.target.id === 'psb-copy-btn') {
        const raw = ($('#psb-output-code') || {}).dataset?.raw || '';
        if (raw) copyText(raw);
        return;
      }
      if (e.target.id === 'psb-download-btn') {
        const raw = ($('#psb-output-code') || {}).dataset?.raw || '';
        const cmdlet = D.cmdlets.find(c => c.id === S.selectedCmdlet);
        downloadPS1(raw, (cmdlet ? cmdlet.id : 'command') + '.ps1');
        return;
      }

      // Reference accordion
      const refHeader = e.target.closest('.psb-ref-module-header');
      if (refHeader) { refHeader.closest('.psb-ref-module').classList.toggle('open'); return; }

      // Reference load button
      const loadBtn = e.target.closest('.psb-ref-load-btn');
      if (loadBtn) {
        switchTab('build');
        selectModule(loadBtn.dataset.loadModule);
        setTimeout(() => selectCmdlet(loadBtn.dataset.loadCmdlet), 100);
        return;
      }

      // Clear history
      if (e.target.id === 'psb-clear-history') { clearHistory(); return; }

      // History item
      const histItem = e.target.closest('.psb-history-item');
      if (histItem) {
        const h = getHistory();
        const item = h[parseInt(histItem.dataset.idx)];
        if (item) copyText(item.cmd);
        return;
      }
    });

    // Search inputs
    const recipeSearch = $('#psb-recipe-search');
    if (recipeSearch) recipeSearch.addEventListener('input', () => { S.recipeSearch = recipeSearch.value; renderRecipes(); });

    const cmdletSearch = $('#psb-cmdlet-search');
    if (cmdletSearch) cmdletSearch.addEventListener('input', () => renderCmdletList());

    const refSearch = $('#psb-ref-search');
    if (refSearch) refSearch.addEventListener('input', () => { S.refSearch = refSearch.value; renderReference(); });

    // #18 — Keyboard shortcuts & recipe keyboard nav
    document.addEventListener('keydown', e => {
      if (e.ctrlKey && e.key === 'Enter' && S.activeTab === 'build' && S.selectedCmdlet) {
        e.preventDefault();
        buildCommand(false);
      }
      // / → focus search
      if (e.key === '/' && !e.target.closest('input, textarea, select')) {
        e.preventDefault();
        const search = S.activeTab === 'recipes' ? recipeSearch : S.activeTab === 'reference' ? refSearch : null;
        if (search) search.focus();
      }
      // Enter on focused recipe card
      if (e.key === 'Enter' && e.target.closest('.psb-recipe-card')) {
        const card = e.target.closest('.psb-recipe-card');
        const id = card.dataset.recipe;
        S.expandedRecipe = S.expandedRecipe === id ? null : id;
        renderRecipes();
        updateURL();
      }
    });
  }

  /* ═══════ #20 — PRINT STYLES ═══════ */
  // Print is handled via CSS @media print in the stylesheet

  /* ═══════ INIT ═══════ */
  function init() {
    readURL();

    const recipeSearch = $('#psb-recipe-search');
    if (recipeSearch && S.recipeSearch) recipeSearch.value = S.recipeSearch;

    renderStats();
    renderQuickStart();
    renderRecipeFilters();
    renderRecipes();
    renderModuleGrid();
    renderReference();
    renderHistory();

    switchTab(S.activeTab);

    if (S.selectedModule) {
      selectModule(S.selectedModule);
      if (S.selectedCmdlet) setTimeout(() => selectCmdlet(S.selectedCmdlet), 50);
    }

    if (S.recipeFilter !== 'all') {
      $$('#psb-recipe-filters .psb-pill').forEach(p => p.classList.toggle('active', p.dataset.filter === S.recipeFilter));
      renderRecipes();
    }

    // #19 — Auto-expand and scroll to deep-linked recipe
    if (S.expandedRecipe) {
      setTimeout(() => {
        const card = document.querySelector(`.psb-recipe-card[data-recipe="${S.expandedRecipe}"]`);
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    }

    bindEvents();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();