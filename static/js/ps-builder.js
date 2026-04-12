/**
 * ⚡ PowerShell Command Builder
 * 100% client-side, zero API calls
 */
(function () {
  'use strict';

  /* ════════════════════════════════════════════
     DATA & STATE
     ════════════════════════════════════════════ */

  const D = window.__psBuilderData || { modules: [], cmdlets: [], recipes: [] };
  const HISTORY_KEY = 'psb_history';
  const MAX_HISTORY = 20;

  const S = {
    activeTab: 'recipes',
    selectedModule: null,
    selectedCmdlet: null,
    recipeFilter: 'all',
    difficultyFilter: 'all',
    recipeSearch: '',
    refSearch: ''
  };

  /* ════════════════════════════════════════════
     HELPERS
     ════════════════════════════════════════════ */

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; };

  function moduleById(id) { return D.modules.find(m => m.id === id); }
  function cmdletsForModule(modId) { return D.cmdlets.filter(c => c.module === modId); }
  function serviceForModule(modId) { const m = moduleById(modId); return m ? m.display_name : ''; }

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

  /* ════════════════════════════════════════════
     HISTORY (localStorage)
     ════════════════════════════════════════════ */

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

  function renderHistory() {
    const list = $('#psb-history-list');
    const btn = $('#psb-clear-history');
    const h = getHistory();
    if (!h.length) {
      list.innerHTML = '<p class="psb-history-empty">No commands yet. Build or use a recipe to get started.</p>';
      if (btn) btn.hidden = true;
      return;
    }
    if (btn) btn.hidden = false;
    list.innerHTML = h.map((item, i) => `
      <div class="psb-history-item" data-idx="${i}" tabindex="0" role="button" aria-label="Copy: ${esc(item.label || item.cmd.substring(0, 50))}">
        <div class="psb-history-cmd">${esc(item.cmd.split('\n')[0])}</div>
        <div class="psb-history-time">${timeAgo(item.time)}</div>
      </div>
    `).join('');
  }

  function timeAgo(ts) {
    const d = Date.now() - ts;
    if (d < 60000) return 'just now';
    if (d < 3600000) return Math.floor(d / 60000) + 'm ago';
    if (d < 86400000) return Math.floor(d / 3600000) + 'h ago';
    return Math.floor(d / 86400000) + 'd ago';
  }

  function esc(s) {
    if (!s) return '';
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ════════════════════════════════════════════
     TAB SWITCHING
     ════════════════════════════════════════════ */

  function switchTab(tab) {
    S.activeTab = tab;
    $$('.psb-tab').forEach(t => {
      const isActive = t.dataset.tab === tab;
      t.classList.toggle('active', isActive);
      t.setAttribute('aria-selected', isActive);
    });
    $$('.psb-panel').forEach(p => {
      const isActive = p.id === 'psb-panel-' + tab;
      p.classList.toggle('active', isActive);
      p.hidden = !isActive;
    });
    updateURL();
  }

  /* ════════════════════════════════════════════
     RECIPES TAB
     ════════════════════════════════════════════ */

  function renderRecipeFilters() {
    const container = $('#psb-recipe-filters');
    const services = [...new Set(D.recipes.map(r => r.service))].sort();
    const existing = container.querySelector('[data-filter="all"]');
    services.forEach(svc => {
      const mod = D.modules.find(m => m.display_name === svc);
      const btn = el('button', 'psb-pill');
      btn.dataset.filter = svc;
      btn.textContent = (mod ? mod.emoji + ' ' : '') + svc;
      container.appendChild(btn);
    });
  }

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

    countEl.textContent = `${filtered.length} recipe${filtered.length !== 1 ? 's' : ''}`;

    if (!filtered.length) {
      grid.innerHTML = '<p style="color:var(--psb-text-dim);text-align:center;padding:2rem;">No recipes match your filters. Try broadening your search.</p>';
      return;
    }

    grid.innerHTML = filtered.map(r => `
      <div class="psb-recipe-card" data-recipe="${r.id}">
        <div class="psb-recipe-header">
          <span class="psb-recipe-title">${esc(r.title)}</span>
          <div class="psb-recipe-badges">
            <span class="psb-badge psb-badge-service">${esc(r.service)}</span>
            <span class="psb-badge psb-badge-${r.difficulty}">${r.difficulty}</span>
          </div>
        </div>
        <div class="psb-recipe-desc">${esc(r.description)}</div>
        <div class="psb-recipe-detail">
          <div class="psb-recipe-command">
            <pre class="psb-output-code">${highlightPS(r.command)}</pre>
          </div>
          <div class="psb-recipe-explanation">${esc(r.explanation)}</div>
          ${r.prerequisites ? `<div class="psb-recipe-prereq"><strong>Prerequisites:</strong> ${esc(r.prerequisites)}</div>` : ''}
          <div class="psb-recipe-actions">
            <button class="psb-btn-copy" data-copy="${esc(r.command)}">📋 Copy</button>
            <button class="psb-btn-download" data-dl="${esc(r.command)}" data-name="${r.id}.ps1">💾 .ps1</button>
            <button class="psb-btn-secondary psb-customise-btn" data-module="${r.module}" style="font-size:0.8rem;padding:0.4rem 0.8rem;">🔧 Customise →</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  /* ════════════════════════════════════════════
     BUILD TAB
     ════════════════════════════════════════════ */

  function renderModuleGrid() {
    const grid = $('#psb-module-grid');
    grid.innerHTML = D.modules.map(m => `
      <div class="psb-module-card" data-module="${m.id}" tabindex="0" role="button">
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
      html += `<div class="psb-module-info-row"><span class="psb-module-info-label">Docs:</span><a href="${mod.learn_url}" target="_blank" rel="noopener noreferrer" class="psb-module-info-link">Microsoft Learn ↗</a></div>`;
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

    list.innerHTML = filtered.map(c => `
      <div class="psb-cmdlet-item" data-cmdlet="${c.id}" tabindex="0" role="button">
        <span class="psb-cmdlet-name">${esc(c.name)}</span>
        <span class="psb-cmdlet-desc">${esc(c.description)}</span>
      </div>
    `).join('');

    if (!filtered.length) {
      list.innerHTML = '<p style="color:var(--psb-text-dim);padding:1rem;">No cmdlets found.</p>';
    }
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
      const req = p.required ? ' required' : '';
      const reqBadge = p.required ? '<span class="psb-param-required-badge">REQUIRED</span>' : '';
      let input = '';

      if (p.type === 'switch') {
        input = `<div class="psb-param-switch"><input type="checkbox" id="psb-p-${i}" data-param="${esc(p.name)}" data-type="switch"><label for="psb-p-${i}">Enable -${esc(p.name)}</label></div>`;
      } else if (p.type === 'select' && p.options) {
        input = `<select class="psb-param-select" id="psb-p-${i}" data-param="${esc(p.name)}" data-type="select"><option value="">— Select —</option>${p.options.map(o => `<option value="${esc(o)}">${esc(o)}</option>`).join('')}</select>`;
      } else {
        input = `<input type="text" class="psb-param-input" id="psb-p-${i}" data-param="${esc(p.name)}" data-type="${p.type || 'string'}" placeholder="${esc(p.placeholder || p.example || '')}"${req}>`;
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
  }

  function buildCommand() {
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
          // Quote strings that contain spaces or special chars
          if (val.includes(' ') || val.includes('@') || val.includes("'")) {
            params.push(`-${name} "${val}"`);
          } else if (val.startsWith('$') || val.startsWith('(') || val.startsWith('@') || val === 'Unlimited' || val === '$true' || val === '$false') {
            params.push(`-${name} ${val}`);
          } else {
            params.push(`-${name} "${val}"`);
          }
        }
      }
    });

    let command = cmdlet.name;
    if (params.length) command += ' ' + params.join(' ');

    // Add prerequisites as comments
    let fullCommand = '';
    if (mod.install_command) fullCommand += `# ${mod.install_command}\n`;
    if (mod.connect_command) fullCommand += `# ${mod.connect_command}\n\n`;
    fullCommand += command;

    const outputEl = $('#psb-output-code');
    outputEl.innerHTML = highlightPS(fullCommand);

    $('#psb-output-section').hidden = false;
    $('#psb-output-section').scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Store for copy/download
    outputEl.dataset.raw = fullCommand;
    outputEl.dataset.cmdOnly = command;

    addHistory(command, `${cmdlet.name} (${mod.display_name})`);
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

  /* ════════════════════════════════════════════
     REFERENCE TAB
     ════════════════════════════════════════════ */

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
            <span class="psb-module-emoji">${mod.emoji}</span>
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
                  ${c.learn_url ? `<a href="${c.learn_url}" target="_blank" rel="noopener noreferrer" class="psb-ref-learn-link">Docs ↗</a>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  /* ════════════════════════════════════════════
     SYNTAX HIGHLIGHTING (client-side)
     ════════════════════════════════════════════ */

  function highlightPS(code) {
    if (!code) return '';
    return esc(code)
      // Comments
      .replace(/(#[^\n]*)/g, '<span class="psb-syn-comment">$1</span>')
      // Variables
      .replace(/(\$\w+)/g, '<span class="psb-syn-variable">$1</span>')
      // Pipe
      .replace(/(\|)/g, '<span class="psb-syn-pipe">$1</span>')
      // Cmdlet names (Verb-Noun pattern)
      .replace(/\b([A-Z][a-z]+-[A-Z]\w+)/g, '<span class="psb-syn-cmdlet">$1</span>')
      // Parameters
      .replace(/(\s)(-[A-Za-z]+)/g, '$1<span class="psb-syn-param">$2</span>')
      // Quoted strings
      .replace(/(&quot;[^&]*&quot;)/g, '<span class="psb-syn-value">$1</span>')
      // Single-quoted strings
      .replace(/('(?:[^'\\]|\\.)*')/g, '<span class="psb-syn-value">$1</span>');
  }

  /* ════════════════════════════════════════════
     URL STATE
     ════════════════════════════════════════════ */

  function updateURL() {
    const p = new URLSearchParams();
    if (S.activeTab !== 'recipes') p.set('tab', S.activeTab);
    if (S.recipeFilter !== 'all') p.set('service', S.recipeFilter);
    if (S.recipeSearch) p.set('q', S.recipeSearch);
    if (S.selectedModule) p.set('module', S.selectedModule);
    if (S.selectedCmdlet) p.set('cmdlet', S.selectedCmdlet);
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
  }

  /* ════════════════════════════════════════════
     EVENT HANDLERS
     ════════════════════════════════════════════ */

  function bindEvents() {
    // Tabs
    document.addEventListener('click', e => {
      const tab = e.target.closest('.psb-tab');
      if (tab) { switchTab(tab.dataset.tab); return; }

      // Recipe filters
      const pill = e.target.closest('.psb-pill');
      if (pill && pill.closest('#psb-recipe-filters')) {
        S.recipeFilter = pill.dataset.filter;
        $$('#psb-recipe-filters .psb-pill').forEach(p => p.classList.toggle('active', p.dataset.filter === S.recipeFilter));
        renderRecipes();
        updateURL();
        return;
      }

      // Difficulty filters
      const dpill = e.target.closest('.psb-pill-sm');
      if (dpill && dpill.closest('#psb-difficulty-filters')) {
        S.difficultyFilter = dpill.dataset.difficulty;
        $$('#psb-difficulty-filters .psb-pill-sm').forEach(p => p.classList.toggle('active', p.dataset.difficulty === S.difficultyFilter));
        renderRecipes();
        return;
      }

      // Recipe card toggle
      const card = e.target.closest('.psb-recipe-card');
      if (card && !e.target.closest('.psb-btn-copy') && !e.target.closest('.psb-btn-download') && !e.target.closest('.psb-customise-btn')) {
        card.classList.toggle('expanded');
        return;
      }

      // Copy button
      const copyBtn = e.target.closest('.psb-btn-copy');
      if (copyBtn) {
        const text = copyBtn.dataset.copy || ($('#psb-output-code') || {}).dataset?.raw || '';
        if (text) copyText(text);
        return;
      }

      // Download button
      const dlBtn = e.target.closest('.psb-btn-download');
      if (dlBtn) {
        const text = dlBtn.dataset.dl || ($('#psb-output-code') || {}).dataset?.raw || '';
        const name = dlBtn.dataset.name || 'command.ps1';
        if (text) downloadPS1(text, name);
        return;
      }

      // Share button
      if (e.target.closest('.psb-btn-share') || e.target.id === 'psb-share-btn') {
        copyText(location.href);
        return;
      }

      // Customise button (recipe → build)
      const custBtn = e.target.closest('.psb-customise-btn');
      if (custBtn) {
        const modId = custBtn.dataset.module;
        switchTab('build');
        if (modId) selectModule(modId);
        return;
      }

      // Module card
      const modCard = e.target.closest('.psb-module-card');
      if (modCard) { selectModule(modCard.dataset.module); return; }

      // Cmdlet item
      const cmdItem = e.target.closest('.psb-cmdlet-item');
      if (cmdItem) { selectCmdlet(cmdItem.dataset.cmdlet); return; }

      // Build button
      if (e.target.id === 'psb-build-btn') { buildCommand(); return; }

      // Reset button
      if (e.target.id === 'psb-reset-btn') { resetBuild(); return; }

      // Copy from output section
      if (e.target.id === 'psb-copy-btn') {
        const raw = ($('#psb-output-code') || {}).dataset?.raw || '';
        if (raw) copyText(raw);
        return;
      }

      // Download from output section
      if (e.target.id === 'psb-download-btn') {
        const raw = ($('#psb-output-code') || {}).dataset?.raw || '';
        const cmdlet = D.cmdlets.find(c => c.id === S.selectedCmdlet);
        downloadPS1(raw, (cmdlet ? cmdlet.id : 'command') + '.ps1');
        return;
      }

      // Reference accordion
      const refHeader = e.target.closest('.psb-ref-module-header');
      if (refHeader) {
        refHeader.closest('.psb-ref-module').classList.toggle('open');
        return;
      }

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
    if (recipeSearch) {
      recipeSearch.addEventListener('input', () => {
        S.recipeSearch = recipeSearch.value;
        renderRecipes();
      });
    }

    const cmdletSearch = $('#psb-cmdlet-search');
    if (cmdletSearch) {
      cmdletSearch.addEventListener('input', () => renderCmdletList());
    }

    const refSearch = $('#psb-ref-search');
    if (refSearch) {
      refSearch.addEventListener('input', () => {
        S.refSearch = refSearch.value;
        renderReference();
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      // Ctrl+Enter → build
      if (e.ctrlKey && e.key === 'Enter' && S.activeTab === 'build' && S.selectedCmdlet) {
        e.preventDefault();
        buildCommand();
      }
      // / → focus search (if not in input)
      if (e.key === '/' && !e.target.closest('input, textarea, select')) {
        e.preventDefault();
        const search = S.activeTab === 'recipes' ? recipeSearch : S.activeTab === 'reference' ? refSearch : null;
        if (search) search.focus();
      }
    });
  }

  /* ════════════════════════════════════════════
     INIT
     ════════════════════════════════════════════ */

  function init() {
    readURL();

    // Populate recipe search from URL
    const recipeSearch = $('#psb-recipe-search');
    if (recipeSearch && S.recipeSearch) recipeSearch.value = S.recipeSearch;

    // Render all sections
    renderRecipeFilters();
    renderRecipes();
    renderModuleGrid();
    renderReference();
    renderHistory();

    // Activate correct tab
    switchTab(S.activeTab);

    // Restore build state from URL
    if (S.selectedModule) {
      selectModule(S.selectedModule);
      if (S.selectedCmdlet) {
        setTimeout(() => selectCmdlet(S.selectedCmdlet), 50);
      }
    }

    // Activate correct recipe filter
    if (S.recipeFilter !== 'all') {
      $$('#psb-recipe-filters .psb-pill').forEach(p => p.classList.toggle('active', p.dataset.filter === S.recipeFilter));
      renderRecipes();
    }

    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
