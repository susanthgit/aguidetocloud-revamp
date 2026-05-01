/* ═══════════════════════════════════════════════
   Copilot Model Map — Interactive Engine
   Pure vanilla JS, no dependencies
   ═══════════════════════════════════════════════ */
(function () {
  'use strict';

  const D = window.__cmmData;
  const ICONS = window.__cmmIcons || {};
  if (!D) return;

  const { models, features, relationships, patterns } = D;

  /* ── Lookup helpers ── */
  const modelMap = {};
  models.forEach(m => { modelMap[m.id] = m; });
  const featureMap = {};
  features.forEach(f => { featureMap[f.id] = f; });

  /* Build adjacency: feature→models, model→features */
  const feat2rels = {};
  const model2rels = {};
  relationships.forEach(r => {
    if (!feat2rels[r.feature]) feat2rels[r.feature] = [];
    feat2rels[r.feature].push(r);
    if (!model2rels[r.model]) model2rels[r.model] = [];
    model2rels[r.model].push(r);
  });

  /* Unique model IDs sorted by provider then name */
  const modelIds = [...new Set(relationships.map(r => r.model))]
    .sort((a, b) => {
      const ma = modelMap[a], mb = modelMap[b];
      if (!ma || !mb) return 0;
      if (ma.provider !== mb.provider) return ma.provider.localeCompare(mb.provider);
      return ma.name.localeCompare(mb.name);
    });

  /* Category labels */
  const catLabels = { core: 'Core', apps: 'Office Apps', agents: 'Agents', studio: 'Studio' };

  /* ── Tab switching ── */
  const tabs = document.querySelectorAll('.cmm-tab');
  const panels = document.querySelectorAll('.cmm-panel');
  const tabList = document.querySelector('.cmm-tabs');

  function activateTab(tab) {
    tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); t.setAttribute('tabindex', '-1'); });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    tab.setAttribute('tabindex', '0');
    tab.focus();
    panels.forEach(p => { p.style.display = 'none'; });
    var target = document.getElementById('panel-' + tab.dataset.tab);
    if (target) target.style.display = '';
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () { activateTab(tab); });
  });

  /* Arrow-key navigation for tabs (WAI-ARIA pattern) */
  if (tabList) {
    tabList.addEventListener('keydown', function (e) {
      var tabArr = Array.from(tabs);
      var idx = tabArr.indexOf(document.activeElement);
      if (idx < 0) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        activateTab(tabArr[(idx + 1) % tabArr.length]);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        activateTab(tabArr[(idx - 1 + tabArr.length) % tabArr.length]);
      } else if (e.key === 'Home') {
        e.preventDefault();
        activateTab(tabArr[0]);
      } else if (e.key === 'End') {
        e.preventDefault();
        activateTab(tabArr[tabArr.length - 1]);
      }
    });
  }

  /* ── Filter buttons ── */
  let currentFilter = 'all';
  const filterBtns = document.querySelectorAll('.cmm-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderMatrix();
      renderVisual();
    });
  });

  /* ── View toggle ── */
  const viewBtns = document.querySelectorAll('.cmm-view-btn');
  const matrixView = document.getElementById('cmm-matrix');
  const visualView = document.getElementById('cmm-visual');
  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (btn.dataset.view === 'matrix') {
        matrixView.style.display = '';
        visualView.style.display = 'none';
      } else {
        matrixView.style.display = 'none';
        visualView.style.display = '';
        renderVisual();
      }
    });
  });

  /* ════════════════════════════════════════════
     MATRIX VIEW
     ════════════════════════════════════════════ */
  function getFilteredFeatures() {
    if (currentFilter === 'all') return features;
    return features.filter(f => f.category === currentFilter);
  }

  function renderMatrix() {
    const fList = getFilteredFeatures();
    const thead = document.querySelector('.cmm-matrix-table thead tr');
    const tbody = document.getElementById('cmm-matrix-body');

    /* Header */
    let headerHtml = '<th class="cmm-matrix-corner">Feature</th>';
    modelIds.forEach(mid => {
      const m = modelMap[mid];
      if (!m) return;
      headerHtml += '<th class="cmm-matrix-model-th" data-model="' + mid + '">' +
        '<div class="cmm-model-header">' +
        '<span class="cmm-model-header-name">' + esc(m.short || m.name) + '</span>' +
        '<span class="cmm-model-header-provider">' + esc(m.provider) + '</span>' +
        '</div></th>';
    });
    thead.innerHTML = headerHtml;

    /* Rows */
    let rowsHtml = '';
    fList.forEach(f => {
      const rels = feat2rels[f.id] || [];
      const relByModel = {};
      rels.forEach(r => { relByModel[r.model] = r; });

      rowsHtml += '<tr data-feature="' + f.id + '">';
      rowsHtml += '<td><div class="cmm-feature-cell">';
      if (ICONS[f.id]) rowsHtml += ICONS[f.id];
      rowsHtml += '<span class="cmm-feature-name">' + esc(f.short || f.name) + '</span>';
      rowsHtml += '</div></td>';

      modelIds.forEach(mid => {
        const rel = relByModel[mid];
        if (rel) {
          const roleClass = 'cmm-role-' + rel.role;
          const sourceClass = 'cmm-source-' + rel.source;
          rowsHtml += '<td class="cmm-cell" data-feature="' + f.id + '" data-model="' + mid + '">' +
            '<span class="cmm-role-badge ' + roleClass + '">' + capitalise(rel.role) +
            '<span class="cmm-source-dot ' + sourceClass + '" title="' + capitalise(rel.source) + '"></span>' +
            '</span></td>';
        } else {
          rowsHtml += '<td class="cmm-cell-empty">—</td>';
        }
      });
      rowsHtml += '</tr>';
    });
    tbody.innerHTML = rowsHtml;

    /* Cell click → detail */
    tbody.querySelectorAll('.cmm-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        showDetail(cell.dataset.feature, cell.dataset.model);
      });
    });

    /* Row click → feature detail */
    tbody.querySelectorAll('tr').forEach(row => {
      row.querySelector('td:first-child')?.addEventListener('click', () => {
        showFeatureDetail(row.dataset.feature);
      });
    });

    /* Column hover highlight */
    thead.querySelectorAll('.cmm-matrix-model-th').forEach(th => {
      th.addEventListener('mouseenter', () => {
        const mid = th.dataset.model;
        document.querySelectorAll('[data-model="' + mid + '"]').forEach(el => el.classList.add('cmm-col-highlight'));
        th.classList.add('cmm-col-highlight');
      });
      th.addEventListener('mouseleave', () => {
        document.querySelectorAll('.cmm-col-highlight').forEach(el => el.classList.remove('cmm-col-highlight'));
      });
      th.addEventListener('click', () => {
        showModelDetail(th.dataset.model);
      });
    });
  }

  /* ════════════════════════════════════════════
     VISUAL MAP VIEW
     ════════════════════════════════════════════ */
  function renderVisual() {
    const fList = getFilteredFeatures();
    const fCol = document.getElementById('cmm-vis-features');
    const mCol = document.getElementById('cmm-vis-models');
    const svg = document.getElementById('cmm-vis-svg');

    /* Feature nodes — grouped by category */
    let fHtml = '';
    var lastCat = '';
    var sortedFeatures = fList.slice().sort(function (a, b) {
      var catOrder = { core: 0, apps: 1, agents: 2, studio: 3 };
      return (catOrder[a.category] || 9) - (catOrder[b.category] || 9);
    });
    sortedFeatures.forEach(f => {
      if (f.category !== lastCat) {
        fHtml += '<div class="cmm-vis-category-label">' + (catLabels[f.category] || f.category) + '</div>';
        lastCat = f.category;
      }
      fHtml += '<div class="cmm-vis-node cmm-vis-feature" data-id="' + f.id + '" role="button" tabindex="0" aria-label="' + esc(f.short || f.name) + '">' +
        (ICONS[f.id] ? ICONS[f.id] : '') +
        '<div><span class="cmm-vis-node-name">' + esc(f.short || f.name) + '</span></div></div>';
    });
    fCol.innerHTML = fHtml;

    /* Model nodes — grouped by provider */
    let mHtml = '';
    var lastProvider = '';
    var sortedModelIds = modelIds.slice().sort(function (a, b) {
      var provOrder = { 'OpenAI': 0, 'Anthropic': 1, 'Microsoft': 2 };
      var ma = modelMap[a], mb = modelMap[b];
      if (!ma || !mb) return 0;
      return (provOrder[ma.provider] || 9) - (provOrder[mb.provider] || 9);
    });
    sortedModelIds.forEach(mid => {
      const m = modelMap[mid];
      if (!m) return;
      if (m.provider !== lastProvider) {
        mHtml += '<div class="cmm-vis-provider-label">' + esc(m.provider) + '</div>';
        lastProvider = m.provider;
      }
      mHtml += '<div class="cmm-vis-node cmm-vis-model" data-id="' + mid + '" role="button" tabindex="0" aria-label="' + esc(m.short || m.name) + ' by ' + esc(m.provider) + '">' +
        '<div><span class="cmm-vis-node-name">' + esc(m.short || m.name) + '</span></div></div>';
    });
    mCol.innerHTML = mHtml;

    /* Draw lines after layout settles */
    requestAnimationFrame(() => { requestAnimationFrame(() => drawLines(fList)); });

    /* Interaction */
    fCol.querySelectorAll('.cmm-vis-feature').forEach(node => {
      node.addEventListener('click', () => highlightVisual('feature', node.dataset.id));
      node.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); highlightVisual('feature', node.dataset.id); } });
    });
    mCol.querySelectorAll('.cmm-vis-model').forEach(node => {
      node.addEventListener('click', () => highlightVisual('model', node.dataset.id));
      node.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); highlightVisual('model', node.dataset.id); } });
    });
  }

  /* Resize observer for visual map lines */
  if (typeof ResizeObserver !== 'undefined') {
    var visContainer = document.querySelector('.cmm-visual-container');
    if (visContainer) {
      new ResizeObserver(function () {
        if (visContainer.offsetParent !== null) {
          drawLines(getFilteredFeatures());
        }
      }).observe(visContainer);
    }
  }

  function drawLines(fList) {
    var svg = document.getElementById('cmm-vis-svg');
    var container = svg.parentElement;
    if (!container) return;
    var rect = container.getBoundingClientRect();

    var paths = '';
    var sortedFeatures = fList.slice().sort(function (a, b) {
      var catOrder = { core: 0, apps: 1, agents: 2, studio: 3 };
      return (catOrder[a.category] || 9) - (catOrder[b.category] || 9);
    });
    sortedFeatures.forEach(function (f) {
      var fNode = container.querySelector('.cmm-vis-feature[data-id="' + f.id + '"]');
      if (!fNode) return;
      var fRect = fNode.getBoundingClientRect();
      var fy = fRect.top + fRect.height / 2 - rect.top;
      var fx = fRect.right - rect.left;

      (feat2rels[f.id] || []).forEach(function (rel) {
        var mNode = container.querySelector('.cmm-vis-model[data-id="' + rel.model + '"]');
        if (!mNode) return;
        var mRect = mNode.getBoundingClientRect();
        var my = mRect.top + mRect.height / 2 - rect.top;
        var mx = mRect.left - rect.left;

        /* Curved bezier — control points at 40% and 60% of the horizontal distance */
        var dx = mx - fx;
        var cp1x = fx + dx * 0.4;
        var cp2x = fx + dx * 0.6;
        var primaryClass = rel.role === 'primary' ? ' cmm-line-primary' : '';
        paths += '<path d="M' + fx + ',' + fy + ' C' + cp1x + ',' + fy + ' ' + cp2x + ',' + my + ' ' + mx + ',' + my + '" data-feature="' + f.id + '" data-model="' + rel.model + '" data-role="' + rel.role + '" class="' + primaryClass + '"/>';
      });
    });
    svg.innerHTML = paths;
  }

  function highlightVisual(type, id) {
    const container = document.querySelector('.cmm-visual-container');
    const nodes = container.querySelectorAll('.cmm-vis-node');
    const lines = container.querySelectorAll('path');

    /* Reset */
    nodes.forEach(n => { n.classList.remove('cmm-node-active', 'cmm-node-dim'); });
    lines.forEach(l => { l.classList.remove('cmm-line-active-primary', 'cmm-line-active-other'); });

    /* Get connected IDs */
    let connectedIds = new Set();
    connectedIds.add(id);

    if (type === 'feature') {
      (feat2rels[id] || []).forEach(r => connectedIds.add(r.model));
    } else {
      (model2rels[id] || []).forEach(r => connectedIds.add(r.feature));
    }

    /* Apply highlight */
    nodes.forEach(n => {
      if (connectedIds.has(n.dataset.id)) {
        n.classList.add('cmm-node-active');
      } else {
        n.classList.add('cmm-node-dim');
      }
    });
    lines.forEach(l => {
      var isMatch = (type === 'feature' && l.dataset.feature === id) ||
                    (type === 'model' && l.dataset.model === id);
      if (isMatch) {
        if (l.dataset.role === 'primary') {
          l.classList.add('cmm-line-active-primary');
        } else {
          l.classList.add('cmm-line-active-other');
        }
      }
    });
  }

  /* ════════════════════════════════════════════
     DETAIL PANELS
     ════════════════════════════════════════════ */
  const detailEl = document.getElementById('cmm-detail');
  const detailContent = document.getElementById('cmm-detail-content');
  const detailClose = document.getElementById('cmm-detail-close');
  if (detailClose) detailClose.addEventListener('click', () => { detailEl.style.display = 'none'; });

  function showDetail(featureId, modelId) {
    const f = featureMap[featureId];
    const m = modelMap[modelId];
    const rel = (feat2rels[featureId] || []).find(r => r.model === modelId);
    if (!f || !m || !rel) return;

    let html = '<div class="cmm-detail-title">' + esc(f.name) + ' × ' + esc(m.name) + '</div>';
    html += '<div class="cmm-detail-desc">' + esc(f.description) + '</div>';
    html += '<div class="cmm-detail-section">';
    html += '<h4>Role</h4>';
    html += '<span class="cmm-role-badge cmm-role-' + rel.role + '">' + capitalise(rel.role) + '</span>';
    html += ' <span class="cmm-role-badge cmm-role-' + routingBadge(rel.routing) + '">' + routingLabel(rel.routing) + '</span>';
    html += '</div>';
    html += '<div class="cmm-detail-section">';
    html += '<h4>Admin Control</h4>';
    html += '<span class="cmm-admin-badge cmm-badge-' + rel.admin_control + '">' + controlLabel(rel.admin_control) + '</span>';
    html += '</div>';
    if (rel.admin_notes) {
      html += '<div class="cmm-detail-admin-note">' + esc(rel.admin_notes) + '</div>';
    }
    html += '<div class="cmm-detail-section" style="margin-top:var(--space-4)">';
    html += '<h4>Source</h4>';
    html += '<span class="cmm-source-dot cmm-source-' + rel.source + '"></span> ' + capitalise(rel.source);
    html += ' · Verified ' + esc(rel.last_verified || 'N/A');
    html += '</div>';

    detailContent.innerHTML = html;
    detailEl.style.display = '';
    detailEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function showFeatureDetail(featureId) {
    const f = featureMap[featureId];
    if (!f) return;
    const rels = feat2rels[featureId] || [];

    let html = '<div class="cmm-detail-title">' + esc(f.name) + '</div>';
    html += '<div class="cmm-detail-desc">' + esc(f.description) + '</div>';
    html += '<div class="cmm-detail-section"><h4>Models Used</h4><div class="cmm-detail-models">';
    rels.forEach(r => {
      const m = modelMap[r.model];
      if (!m) return;
      html += '<div class="cmm-detail-model-tag"><span class="cmm-role-badge cmm-role-' + r.role + '">' + capitalise(r.role) + '</span> ' + esc(m.name) + ' <span style="color:var(--text-muted)">(' + esc(m.provider) + ')</span></div>';
    });
    html += '</div></div>';

    /* Admin control summary */
    const controls = [...new Set(rels.map(r => r.admin_control))];
    const topControl = controls.includes('full') ? 'full' : controls.includes('limited') ? 'limited' : 'none';
    html += '<div class="cmm-detail-section"><h4>Admin Control</h4>';
    html += '<span class="cmm-admin-badge cmm-badge-' + topControl + '">' + controlLabel(topControl) + '</span>';
    html += '</div>';

    if (rels[0]?.admin_notes) {
      html += '<div class="cmm-detail-admin-note">' + esc(rels[0].admin_notes) + '</div>';
    }

    if (f.doc_url) {
      html += '<div style="margin-top:var(--space-4)"><a href="' + esc(f.doc_url) + '" target="_blank" rel="noopener" class="cmm-admin-link">Microsoft docs →</a></div>';
    }

    detailContent.innerHTML = html;
    detailEl.style.display = '';
  }

  function showModelDetail(modelId) {
    const m = modelMap[modelId];
    if (!m) return;
    const rels = model2rels[modelId] || [];

    let html = '<div class="cmm-detail-title">' + esc(m.name) + '</div>';
    html += '<div class="cmm-detail-desc">' + esc(m.description) + '</div>';
    html += '<div class="cmm-detail-section"><h4>Used By</h4><div class="cmm-detail-models">';
    rels.forEach(r => {
      const f = featureMap[r.feature];
      if (!f) return;
      html += '<div class="cmm-detail-model-tag"><span class="cmm-role-badge cmm-role-' + r.role + '">' + capitalise(r.role) + '</span> ' + esc(f.short || f.name) + '</div>';
    });
    html += '</div></div>';

    if (m.learn_more) {
      html += '<div style="margin-top:var(--space-4)"><a href="' + esc(m.learn_more) + '" target="_blank" rel="noopener" class="cmm-admin-link">Learn more →</a></div>';
    }

    detailContent.innerHTML = html;
    detailEl.style.display = '';
  }

  /* ════════════════════════════════════════════
     MODELS TAB
     ════════════════════════════════════════════ */
  function renderModelsTab() {
    const grid = document.getElementById('cmm-models-grid');
    if (!grid) return;

    let html = '';
    models.forEach(m => {
      const rels = model2rels[m.id] || [];
      html += '<div class="cmm-model-card">';
      html += '<div class="cmm-model-card-header">';
      html += '<span class="cmm-model-name">' + esc(m.name) + '</span>';
      html += '<span class="cmm-model-provider">' + esc(m.provider) + '</span>';
      html += '</div>';
      html += '<div class="cmm-model-type">' + esc(m.type) + '</div>';
      html += '<div class="cmm-model-desc">' + esc(m.description) + '</div>';

      /* Strengths */
      if (m.strengths && m.strengths.length) {
        html += '<div class="cmm-model-strengths">';
        m.strengths.forEach(s => {
          html += '<span class="cmm-model-strength">' + esc(s) + '</span>';
        });
        html += '</div>';
      }

      /* Meta */
      html += '<div class="cmm-model-meta">';
      html += '<div class="cmm-model-meta-item"><span class="cmm-model-meta-label">Context</span><span class="cmm-model-meta-value">' + esc(m.context_window || 'N/A') + '</span></div>';
      html += '<div class="cmm-model-meta-item"><span class="cmm-model-meta-label">Speed</span><span class="cmm-model-meta-value">' + speedLabel(m.speed) + '</span></div>';
      html += '<div class="cmm-model-meta-item"><span class="cmm-model-meta-label">Multimodal</span><span class="cmm-model-meta-value">' + (m.multimodal ? 'Yes' : 'No') + '</span></div>';
      html += '<div class="cmm-model-meta-item"><span class="cmm-model-meta-label">Since</span><span class="cmm-model-meta-value">' + esc(m.launched || 'N/A') + '</span></div>';
      html += '</div>';

      /* Features that use this model */
      if (rels.length) {
        html += '<div class="cmm-model-features-used"><h4>Powers these features</h4><div class="cmm-model-feature-list">';
        rels.forEach(r => {
          const f = featureMap[r.feature];
          if (!f) return;
          html += '<span class="cmm-model-feature-tag">' + esc(f.short || f.name) + ' (' + r.role + ')</span>';
        });
        html += '</div></div>';
      }

      html += '</div>';
    });
    grid.innerHTML = html;
  }

  /* ════════════════════════════════════════════
     PATTERNS TAB
     ════════════════════════════════════════════ */
  function renderPatternsTab() {
    const grid = document.getElementById('cmm-patterns-grid');
    if (!grid) return;

    const patternKeys = Object.keys(patterns);
    let html = '';
    patternKeys.forEach(key => {
      const p = patterns[key];
      if (!p || !p.name) return;

      html += '<div class="cmm-pattern-card">';
      html += '<div class="cmm-pattern-name">' + esc(p.name) + '</div>';
      html += '<div class="cmm-pattern-desc">' + esc(p.description) + '</div>';

      /* How it works — split by → */
      html += '<div class="cmm-pattern-flow">';
      html += '<div class="cmm-pattern-flow-title">How it works</div>';
      const steps = (p.how_it_works || '').split('→').map(s => s.trim()).filter(Boolean);
      if (steps.length > 1) {
        html += '<ol class="cmm-pattern-flow-steps">';
        steps.forEach((step, i) => {
          html += '<li><span class="cmm-pattern-step-num">' + (i + 1) + '</span> ' + esc(step) + '</li>';
        });
        html += '</ol>';
      } else {
        html += '<div class="cmm-pattern-flow-text">' + esc(p.how_it_works || '') + '</div>';
      }
      html += '</div>';

      /* Benefit */
      if (p.benefit) {
        html += '<div class="cmm-pattern-benefit"><span class="cmm-pattern-benefit-text">💡 ' + esc(p.benefit) + '</span></div>';
      }

      /* Features using this pattern */
      if (p.features_using && p.features_using.length) {
        html += '<div class="cmm-pattern-features">';
        html += '<span class="cmm-pattern-features-label">Used by:</span>';
        p.features_using.forEach(fid => {
          const f = featureMap[fid];
          html += '<span class="cmm-pattern-feature-tag">' + esc(f ? (f.short || f.name) : fid) + '</span>';
        });
        html += '</div>';
      }

      html += '</div>';
    });
    grid.innerHTML = html;
  }

  /* ════════════════════════════════════════════
     SEARCH
     ════════════════════════════════════════════ */
  var searchInput = document.getElementById('cmm-search');
  var searchTimer = null;
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        var q = searchInput.value.toLowerCase().trim();
        var rows = document.querySelectorAll('#cmm-matrix-body tr');
        var anyMatch = false;
        rows.forEach(function (row) {
          var fId = row.dataset.feature;
          var f = featureMap[fId];
          var rels = feat2rels[fId] || [];
          var haystack = (f ? (f.name + ' ' + f.short + ' ' + f.description + ' ' + f.category) : '').toLowerCase();
          rels.forEach(function (r) {
            var m = modelMap[r.model];
            if (m) haystack += ' ' + m.name + ' ' + m.short + ' ' + m.provider;
          });
          if (!q || haystack.indexOf(q) >= 0) {
            row.style.display = '';
            if (q) { row.style.background = 'var(--accent-subtle)'; anyMatch = true; }
            else { row.style.background = ''; }
          } else {
            row.style.display = 'none';
          }
        });
      }, 200);
    });
  }

  /* ════════════════════════════════════════════
     EXPORT: PNG
     ════════════════════════════════════════════ */
  var exportPng = document.getElementById('cmm-export-png');
  if (exportPng) {
    exportPng.addEventListener('click', function () {
      var table = document.querySelector('.cmm-matrix-table');
      if (!table) return;
      try {
        var canvas = document.createElement('canvas');
        var scale = 2;
        canvas.width = table.scrollWidth * scale;
        canvas.height = table.scrollHeight * scale;
        var ctx = canvas.getContext('2d');
        ctx.scale(scale, scale);
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-page').trim() || '#FAFAFA';
        ctx.fillRect(0, 0, table.scrollWidth, table.scrollHeight);
        ctx.font = '13px Inter, system-ui, sans-serif';
        var rows = table.querySelectorAll('tr');
        var y = 0;
        rows.forEach(function (row) {
          var cells = row.querySelectorAll('th, td');
          var x = 0;
          var cellH = 36;
          cells.forEach(function (cell) {
            var w = cell.offsetWidth;
            var isHeader = cell.tagName === 'TH';
            ctx.fillStyle = isHeader ? (getComputedStyle(document.documentElement).getPropertyValue('--bg-elevated').trim() || '#F5F5F5') : (getComputedStyle(document.documentElement).getPropertyValue('--bg-surface').trim() || '#FFFFFF');
            ctx.fillRect(x, y, w, cellH);
            ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#E5E5E5';
            ctx.strokeRect(x, y, w, cellH);
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#1A1A1A';
            if (isHeader) ctx.font = 'bold 13px Inter, system-ui, sans-serif';
            else ctx.font = '13px Inter, system-ui, sans-serif';
            var text = cell.textContent.trim().substring(0, 30);
            ctx.fillText(text, x + 8, y + cellH / 2 + 4);
            x += w;
          });
          y += cellH;
        });
        canvas.toBlob(function (blob) {
          if (!blob) return;
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = 'copilot-model-map.png';
          a.click();
          URL.revokeObjectURL(url);
        });
      } catch (e) {
        alert('Export failed. Try taking a screenshot instead.');
      }
    });
  }

  /* ════════════════════════════════════════════
     EXPORT: COPY AS TABLE
     ════════════════════════════════════════════ */
  var exportTable = document.getElementById('cmm-export-table');
  if (exportTable) {
    exportTable.addEventListener('click', function () {
      var fList = getFilteredFeatures();
      /* Build header */
      var cols = ['Feature'];
      modelIds.forEach(function (mid) {
        var m = modelMap[mid];
        if (m) cols.push(m.short || m.name);
      });

      /* Measure column widths */
      var widths = cols.map(function (c) { return c.length; });
      var rows = [];
      fList.forEach(function (f) {
        var row = [f.short || f.name];
        var rels = feat2rels[f.id] || [];
        var relByModel = {};
        rels.forEach(function (r) { relByModel[r.model] = r; });
        modelIds.forEach(function (mid, ci) {
          var rel = relByModel[mid];
          var cell = rel ? capitalise(rel.role) : '—';
          row.push(cell);
          if (cell.length > widths[ci + 1]) widths[ci + 1] = cell.length;
        });
        if (row[0].length > widths[0]) widths[0] = row[0].length;
        rows.push(row);
      });

      /* Format with padding */
      function pad(s, w) { return s + ' '.repeat(Math.max(0, w - s.length)); }
      var header = '| ' + cols.map(function (c, i) { return pad(c, widths[i]); }).join(' | ') + ' |';
      var divider = '|' + widths.map(function (w) { return '-'.repeat(w + 2); }).join('|') + '|';
      var body = rows.map(function (row) {
        return '| ' + row.map(function (c, i) { return pad(c, widths[i]); }).join(' | ') + ' |';
      }).join('\n');

      var table = 'Copilot Model Map — Which AI Powers What\n' + '='.repeat(44) + '\n\n' + header + '\n' + divider + '\n' + body + '\n\nSource: aguidetocloud.com/copilot-model-map/\n';

      navigator.clipboard.writeText(table).then(function () {
        exportTable.textContent = '✓ Copied — paste into Word or email';
        setTimeout(function () { exportTable.textContent = '⎘ Copy as Table'; }, 3000);
      }).catch(function () {
        /* Fallback */
        var ta = document.createElement('textarea');
        ta.value = table;
        ta.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:80%;height:300px;z-index:9999;font-family:monospace;font-size:12px;padding:16px;border:2px solid var(--accent);border-radius:8px;background:var(--bg-surface);color:var(--text-primary);';
        ta.setAttribute('readonly', '');
        document.body.appendChild(ta);
        ta.select();
        ta.addEventListener('blur', function () { document.body.removeChild(ta); });
      });
    });
  }

  /* ════════════════════════════════════════════
     STUDIO HELPER (QUIZ)
     ════════════════════════════════════════════ */
  var quizData = D.studioHelper || {};
  var quizQuestions = quizData.questions || [];
  var quizRecs = quizData.recommendations || {};
  var quizAnswers = {};
  var quizStep = 0;

  function renderQuiz() {
    var progressEl = document.getElementById('cmm-quiz-progress');
    var bodyEl = document.getElementById('cmm-quiz-body');
    var resultEl = document.getElementById('cmm-quiz-result');
    if (!progressEl || !bodyEl) return;

    /* Progress bar */
    var progHtml = '';
    for (var i = 0; i < quizQuestions.length; i++) {
      var cls = i < quizStep ? 'done' : i === quizStep ? 'active' : '';
      progHtml += '<div class="cmm-quiz-step ' + cls + '"></div>';
    }
    progressEl.innerHTML = progHtml;

    if (quizStep >= quizQuestions.length) {
      bodyEl.style.display = 'none';
      resultEl.style.display = '';
      renderQuizResult();
      return;
    }

    bodyEl.style.display = '';
    resultEl.style.display = 'none';

    var q = quizQuestions[quizStep];
    var html = '<div class="cmm-quiz-question">' + esc(q.text) + '</div>';
    html += '<div class="cmm-quiz-options">';
    (q.options || []).forEach(function (opt, oi) {
      var sel = quizAnswers[q.id] === oi ? ' selected' : '';
      html += '<button class="cmm-quiz-option' + sel + '" data-qi="' + oi + '">' + esc(opt.label) + '</button>';
    });
    html += '</div>';

    html += '<div class="cmm-quiz-nav">';
    if (quizStep > 0) html += '<button class="btn-secondary" id="cmm-quiz-prev">← Back</button>';
    else html += '<span></span>';
    html += '</div>';

    bodyEl.innerHTML = html;

    /* Option click */
    bodyEl.querySelectorAll('.cmm-quiz-option').forEach(function (btn) {
      btn.addEventListener('click', function () {
        quizAnswers[q.id] = parseInt(btn.dataset.qi);
        quizStep++;
        renderQuiz();
      });
    });

    var prevBtn = document.getElementById('cmm-quiz-prev');
    if (prevBtn) prevBtn.addEventListener('click', function () { quizStep--; renderQuiz(); });
  }

  function renderQuizResult() {
    var resultEl = document.getElementById('cmm-quiz-result');
    if (!resultEl) return;

    /* Tally scores */
    var scores = {};
    Object.keys(quizAnswers).forEach(function (qId) {
      var q = quizQuestions.find(function (x) { return x.id === qId; });
      if (!q) return;
      var opt = q.options[quizAnswers[qId]];
      if (!opt || !opt.weights) return;
      Object.keys(opt.weights).forEach(function (modelId) {
        scores[modelId] = (scores[modelId] || 0) + opt.weights[modelId];
      });
    });

    /* Sort by score */
    var ranked = Object.keys(scores).sort(function (a, b) { return scores[b] - scores[a]; });

    var html = '';
    if (ranked.length > 0) {
      var topId = ranked[0];
      var topRec = quizRecs[topId] || {};
      var topModel = modelMap[topId];

      html += '<h3 style="font-size:var(--text-body);color:var(--text-secondary);font-weight:500;margin-bottom:var(--space-4)">Our recommendation</h3>';
      html += '<div class="cmm-quiz-result-card">';
      html += '<div class="cmm-quiz-result-headline">' + esc(topRec.headline || (topModel ? topModel.name : topId)) + '</div>';
      html += '<div class="cmm-quiz-result-why">' + esc(topRec.why || '') + '</div>';
      html += '<div class="cmm-quiz-result-meta">';
      if (topRec.best_for) html += '<div><strong>Best for:</strong> ' + esc(topRec.best_for) + '</div>';
      if (topRec.consider) html += '<div><strong>Consider:</strong> ' + esc(topRec.consider) + '</div>';
      html += '</div></div>';

      /* Runners up */
      if (ranked.length > 1) {
        html += '<div class="cmm-quiz-runners"><h4>Also worth considering</h4>';
        for (var ri = 1; ri < Math.min(ranked.length, 4); ri++) {
          var rId = ranked[ri];
          var rRec = quizRecs[rId] || {};
          var rModel = modelMap[rId];
          html += '<div class="cmm-quiz-runner"><span class="cmm-quiz-runner-name">' + esc(rRec.headline || (rModel ? rModel.name : rId)) + '</span> — ' + esc(rRec.why || '') + '</div>';
        }
        html += '</div>';
      }
    }

    html += '<div class="cmm-quiz-restart"><button class="btn-secondary" id="cmm-quiz-restart">↻ Start over</button></div>';
    resultEl.innerHTML = html;

    var restartBtn = document.getElementById('cmm-quiz-restart');
    if (restartBtn) restartBtn.addEventListener('click', function () {
      quizAnswers = {};
      quizStep = 0;
      renderQuiz();
    });
  }

  /* ════════════════════════════════════════════
     TIMELINE
     ════════════════════════════════════════════ */
  function renderTimeline() {
    var container = document.getElementById('cmm-timeline');
    if (!container) return;
    var entries = (D.changelog || []).slice().sort(function (a, b) {
      return (b.date || '').localeCompare(a.date || '');
    });

    var html = '';
    entries.forEach(function (entry) {
      html += '<div class="cmm-timeline-entry">';
      html += '<div class="cmm-timeline-dot type-' + esc(entry.type || 'change') + '"></div>';
      html += '<div class="cmm-timeline-date">' + esc(entry.date || '') + '</div>';
      html += '<div class="cmm-timeline-title">' + esc(entry.title || '') + '</div>';
      html += '<div class="cmm-timeline-desc">' + esc(entry.description || '') + '</div>';
      if (entry.features && entry.features.length) {
        html += '<div class="cmm-timeline-features">';
        entry.features.forEach(function (fid) {
          var f = featureMap[fid];
          html += '<span class="cmm-timeline-feature-tag">' + esc(f ? (f.short || f.name) : fid) + '</span>';
        });
        html += '</div>';
      }
      if (entry.source) {
        html += '<a href="' + esc(entry.source) + '" class="cmm-timeline-source" target="_blank" rel="noopener">Source →</a>';
      }
      html += '</div>';
    });
    container.innerHTML = html;
  }

  /* ════════════════════════════════════════════
     HELPERS
     ════════════════════════════════════════════ */
  function esc(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function capitalise(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

  function controlLabel(c) {
    switch (c) {
      case 'full': return 'Full Control';
      case 'limited': return 'Limited Control';
      case 'none': return 'No Control';
      default: return c || 'Unknown';
    }
  }

  function routingBadge(r) {
    switch (r) {
      case 'auto': return 'secondary';
      case 'fixed': return 'fallback';
      case 'user-selectable': return 'selectable';
      default: return 'secondary';
    }
  }

  function routingLabel(r) {
    switch (r) {
      case 'auto': return 'Auto-routed';
      case 'fixed': return 'Fixed';
      case 'user-selectable': return 'Selectable';
      default: return r || '';
    }
  }

  function speedLabel(s) {
    switch (s) {
      case 'very-fast': return '⚡ Very Fast';
      case 'fast': return '🟢 Fast';
      case 'medium': return '🟡 Medium';
      case 'slow': return '🔴 Deliberate';
      default: return s || 'N/A';
    }
  }

  /* ── Init ── */
  renderMatrix();
  renderVisual();
  renderModelsTab();
  renderPatternsTab();
  renderQuiz();
  renderTimeline();

  /* Auto-select Cowork so the visual has impact on load */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      var cowork = document.querySelector('.cmm-vis-feature[data-id="cowork"]');
      if (cowork) highlightVisual('feature', 'cowork');
    });
  });

})();
