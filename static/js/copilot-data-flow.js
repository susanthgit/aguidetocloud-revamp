/* ═══════════════════════════════════════════════
   Copilot Data Flow Map — Interactive Engine
   ═══════════════════════════════════════════════ */
(function () {
  'use strict';

  var D = window.__cdfData;
  if (!D) return;

  var scenarios = D.scenarios || [];
  var certifications = D.certifications || [];
  var controls = D.controls || [];
  var checklist = D.checklist || [];
  var regions = D.regions || [];
  var riskRatings = D.riskRatings || {};
  var graphAccess = D.graphAccess || [];

  /* Brand-recognizable SVG icons (simplified geometric, 28x28) */
  var stepIcons = {
    user: '<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="10" r="5" stroke="currentColor" stroke-width="2"/><path d="M4 26c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    entra: '<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 3l9 5v8c0 5-4 8-9 10C9 24 5 21 5 16V8l9-5z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M10 14l3 3 5-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    orchestrator: '<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 4L22 8v5.5c0 4.7-3.4 9-8 10.5-4.6-1.5-8-5.8-8-10.5V8l8-4z" fill="#6366F1" opacity="0.15" stroke="#6366F1" stroke-width="1.5"/><path d="M10.5 13l2 4.5 5-7" stroke="#6366F1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="20" cy="7" r="3" fill="#6366F1"/><path d="M19 6.5l1.2 1.2L22 5.5" stroke="white" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    graph: '<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="3" y="3" width="10" height="10" rx="1" fill="#F25022" opacity="0.85"/><rect x="15" y="3" width="10" height="10" rx="1" fill="#7FBA00" opacity="0.85"/><rect x="3" y="15" width="10" height="10" rx="1" fill="#00A4EF" opacity="0.85"/><rect x="15" y="15" width="10" height="10" rx="1" fill="#FFB900" opacity="0.85"/></svg>',
    llm: '<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="11" stroke="#10A37F" stroke-width="2"/><path d="M14 7v4M14 17v4M7 14h4M17 14h4M9.5 9.5l2.8 2.8M15.7 15.7l2.8 2.8M9.5 18.5l2.8-2.8M15.7 12.3l2.8-2.8" stroke="#10A37F" stroke-width="1.5" stroke-linecap="round"/></svg>',
    response: '<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="11" stroke="currentColor" stroke-width="2"/><path d="M9 14l3.5 3.5L19 11" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    bing: '<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M6 4l5 1.8v14.4l7-4.2-4.5-2.1L18 11l6 3.5-10.5 6.5L6 17V4z" fill="#008373"/></svg>',
    anthropic: '<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M16.2 5h4L14 23h-4l6.2-18zM8 5h4l-4 11.5L5.5 11 8 5z" fill="#D4A574"/></svg>'
  };

  var boundaryLabels = {
    'your-device': 'Your Device',
    'microsoft': 'Microsoft',
    'external': 'External',
    'sub-processor': 'Sub-processor'
  };

  /* ── Tab switching ── */
  var tabs = document.querySelectorAll('.cdf-tab');
  var panels = document.querySelectorAll('.cdf-panel');
  var tabList = document.querySelector('.cdf-tabs');

  function activateTab(tab) {
    tabs.forEach(function (t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); t.setAttribute('tabindex', '-1'); });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    tab.setAttribute('tabindex', '0');
    tab.focus();
    panels.forEach(function (p) { p.style.display = 'none'; });
    var target = document.getElementById('panel-' + tab.dataset.tab);
    if (target) target.style.display = '';
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () { activateTab(tab); });
  });

  if (tabList) {
    tabList.addEventListener('keydown', function (e) {
      var tabArr = Array.from(tabs);
      var idx = tabArr.indexOf(document.activeElement);
      if (idx < 0) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault(); activateTab(tabArr[(idx + 1) % tabArr.length]);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault(); activateTab(tabArr[(idx - 1 + tabArr.length) % tabArr.length]);
      }
    });
  }

  /* ═══ SCENARIO PICKER ═══ */
  function renderScenarios() {
    var container = document.getElementById('cdf-scenarios');
    if (!container) return;
    var html = '';
    scenarios.forEach(function (s) {
      var tags = [];
      if (s.uses_web) tags.push('🌐 Web');
      if (s.uses_anthropic) tags.push('🔮 Claude');
      var risk = riskRatings[s.id];
      var riskHtml = risk ? '<span class="cdf-risk-badge cdf-risk-' + esc(risk.level) + '">' + esc(risk.level) + ' risk</span>' : '';
      html += '<button class="cdf-scenario-btn" data-id="' + esc(s.id) + '">' +
        '<div><span>' + esc(s.short || s.name) + '</span>' +
        (tags.length ? '<span style="font-size:11px;color:var(--text-muted);display:block">' + tags.join(' ') + '</span>' : '') +
        '</div>' + riskHtml +
        '</button>';
    });
    container.innerHTML = html;

    container.querySelectorAll('.cdf-scenario-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        container.querySelectorAll('.cdf-scenario-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        renderFlow(btn.dataset.id);
      });
    });

    /* Auto-select first scenario */
    var first = container.querySelector('.cdf-scenario-btn');
    if (first) { first.classList.add('active'); renderFlow(first.dataset.id); }
  }

  /* ═══ DATA FLOW VISUALISATION ═══ */
  function renderFlow(scenarioId) {
    var scenario = scenarios.find(function (s) { return s.id === scenarioId; });
    if (!scenario) return;

    var container = document.getElementById('cdf-flow');
    var steps = scenario.steps || [];
    var risk = riskRatings[scenario.id];

    /* Group steps by boundary for zone rendering */
    var zones = [];
    var currentZone = null;
    steps.forEach(function (step, i) {
      if (!currentZone || currentZone.boundary !== step.boundary) {
        currentZone = { boundary: step.boundary, steps: [], startIdx: i };
        zones.push(currentZone);
      }
      currentZone.steps.push({ step: step, idx: i });
    });

    var html = '';

    /* Flow pipeline with boundary zones */
    html += '<div class="cdf-flow-pipeline">';
    steps.forEach(function (step, i) {
      if (i > 0) {
        html += '<div class="cdf-flow-arrow">🔒<span class="cdf-arrow-text">→</span></div>';
      }
      html += '<div class="cdf-flow-step" data-idx="' + i + '" data-boundary="' + esc(step.boundary) + '" role="button" tabindex="0">';
      html += '<div class="cdf-flow-node cdf-b-' + esc(step.boundary) + '">';
      html += stepIcons[step.id] || '📦';
      html += '</div>';
      html += '<div class="cdf-flow-label">' + esc(step.label) + '</div>';
      html += '<div class="cdf-flow-boundary cdf-b-' + esc(step.boundary) + '">' + esc(boundaryLabels[step.boundary] || step.boundary) + '</div>';
      html += '</div>';
    });
    html += '</div>';

    /* Animated data packet */
    html += '<div class="cdf-packet"></div>';

    /* Boundary zone bar — coloured segments showing where data is */
    html += '<div class="cdf-zone-bar">';
    var totalSteps = steps.length;
    zones.forEach(function (z) {
      var pct = (z.steps.length / totalSteps * 100).toFixed(1);
      html += '<div class="cdf-zone-segment cdf-zs-' + esc(z.boundary) + '" style="flex:' + z.steps.length + '">';
      html += '<span>' + esc(boundaryLabels[z.boundary] || z.boundary) + '</span>';
      html += '</div>';
    });
    html += '</div>';

    /* Narrative — the copy-pasteable summary */
    if (scenario.narrative) {
      html += '<div class="cdf-narrative">';
      html += '<div class="cdf-narrative-header">📝 Security Summary <button class="cdf-narrative-copy" id="cdf-copy-narrative">Copy</button></div>';
      html += '<p>' + esc(scenario.narrative) + '</p>';
      html += '</div>';
    }

    /* What's NOT sent */
    if (scenario.not_sent && scenario.not_sent.length) {
      html += '<div class="cdf-not-sent">';
      html += '<div class="cdf-not-sent-header">🛡️ What is NOT sent outside your boundary</div>';
      html += '<ul>';
      scenario.not_sent.forEach(function (item) {
        html += '<li>' + esc(item) + '</li>';
      });
      html += '</ul>';
      html += '</div>';
    }

    container.innerHTML = html;

    /* Animate steps sequentially */
    var flowSteps = container.querySelectorAll('.cdf-flow-step');
    var arrows = container.querySelectorAll('.cdf-flow-arrow');
    flowSteps.forEach(function (el, i) {
      el.style.opacity = '0';
      setTimeout(function () {
        el.style.opacity = '1';
        el.classList.add('cdf-step-animated');
      }, i * 250);
    });
    arrows.forEach(function (el, i) {
      el.style.opacity = '0';
      setTimeout(function () {
        el.style.opacity = '1';
        el.classList.add('cdf-arrow-animated');
      }, i * 250 + 125);
    });

    /* Step click → detail */
    flowSteps.forEach(function (el) {
      el.addEventListener('click', function () {
        flowSteps.forEach(function (s) { s.classList.remove('active'); });
        el.classList.add('active');
        showStepDetail(steps[parseInt(el.dataset.idx)]);
      });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
      });
    });

    /* Copy narrative button */
    var copyNarr = document.getElementById('cdf-copy-narrative');
    if (copyNarr) {
      copyNarr.addEventListener('click', function (e) {
        e.stopPropagation();
        navigator.clipboard.writeText(scenario.narrative).then(function () {
          copyNarr.textContent = '✓ Copied';
          setTimeout(function () { copyNarr.textContent = 'Copy'; }, 2000);
        }).catch(function () {});
      });
    }

    /* Auto-show first step detail */
    if (steps.length) showStepDetail(steps[0]);
  }

  function showStepDetail(step) {
    var el = document.getElementById('cdf-step-detail');
    if (!el || !step) return;

    var html = '<div class="cdf-step-detail-title">' + (stepIcons[step.id] || '') + ' ' + esc(step.label) + '</div>';
    html += '<div class="cdf-step-detail-desc">' + esc(step.detail) + '</div>';
    html += '<div class="cdf-step-detail-grid">';
    html += '<div class="cdf-step-detail-item"><h4>Data Passed</h4><p>' + esc(step.data_passed) + '</p></div>';
    html += '<div class="cdf-step-detail-item"><h4>Security</h4><p>' + esc(step.security) + '</p></div>';
    html += '</div>';

    el.innerHTML = html;
    el.style.display = '';
  }

  /* ═══ CONTROLS TAB ═══ */
  function renderControls() {
    var grid = document.getElementById('cdf-controls-grid');
    if (!grid) return;

    var html = '';
    controls.forEach(function (c) {
      html += '<div class="cdf-control-card">';
      html += '<div class="cdf-control-header">';
      html += '<span class="cdf-control-cat">' + esc(c.category || '').replace(/-/g, ' ') + '</span>';
      html += '<h3>' + esc(c.name) + '</h3>';
      html += '</div>';
      html += '<p>' + esc(c.description) + '</p>';
      if (c.admin_action) {
        html += '<div class="cdf-control-action"><strong>Where:</strong> ' + esc(c.admin_action) + '</div>';
      }
      if (c.impact) {
        html += '<div class="cdf-control-impact">' + esc(c.impact) + '</div>';
      }
      if (c.url) {
        html += '<a href="' + esc(c.url) + '" class="cdf-control-link" target="_blank" rel="noopener">Microsoft docs →</a>';
      }
      html += '</div>';
    });
    grid.innerHTML = html;
  }

  /* ═══ COMPLIANCE TAB ═══ */
  function renderCompliance() {
    var grid = document.getElementById('cdf-cert-grid');
    if (!grid) return;

    var html = '';
    certifications.forEach(function (c) {
      var statusClass = 'cdf-cert-status-' + (c.status || 'certified');
      html += '<div class="cdf-cert-card">';
      html += '<div class="cdf-cert-header">';
      html += '<span class="cdf-cert-name">' + esc(c.name) + '</span>';
      html += '<span class="cdf-cert-status ' + statusClass + '">' + esc(capitalise(c.status || '')) + '</span>';
      html += '</div>';
      html += '<div class="cdf-cert-desc">' + esc(c.description) + '</div>';
      html += '<div class="cdf-cert-scope">' + esc(c.scope || '') + '</div>';
      if (c.notes) html += '<div class="cdf-cert-notes">' + esc(c.notes) + '</div>';
      html += '</div>';
    });
    grid.innerHTML = html;
  }

  /* ═══ WHAT CAN COPILOT SEE? ═══ */
  function renderAccess() {
    var grid = document.getElementById('cdf-access-grid');
    if (!grid) return;
    var html = '';
    graphAccess.forEach(function (g) {
      var riskClass = (g.risk || '').toLowerCase().indexOf('high') >= 0 ? 'cdf-risk-high' :
                      (g.risk || '').toLowerCase().indexOf('medium') >= 0 ? 'cdf-risk-medium' : 'cdf-risk-low';
      html += '<div class="cdf-access-card">';
      html += '<div class="cdf-access-header">';
      html += '<span class="cdf-access-icon">' + (g.icon || '📦') + '</span>';
      html += '<span class="cdf-access-name">' + esc(g.name) + '</span>';
      html += '<span class="cdf-access-risk"><span class="cdf-risk-badge ' + riskClass + '">' + esc(g.risk || '') + '</span></span>';
      html += '</div>';
      html += '<div class="cdf-access-desc">' + esc(g.description) + '</div>';
      html += '<div class="cdf-access-restrict"><strong>How to restrict:</strong>' + esc(g.how_to_restrict) + '</div>';
      html += '</div>';
    });
    grid.innerHTML = html;
  }

  /* ═══ DATA RESIDENCY ═══ */
  function renderResidency() {
    var select = document.getElementById('cdf-region-select');
    var resultEl = document.getElementById('cdf-residency-result');
    if (!select || !resultEl) return;

    var optHtml = '';
    regions.forEach(function (r) {
      var selected = r.id === 'au' ? ' selected' : '';
      optHtml += '<option value="' + esc(r.id) + '"' + selected + '>' + esc(r.name) + '</option>';
    });
    select.innerHTML = optHtml;

    function showRegion(regionId) {
      var r = regions.find(function (x) { return x.id === regionId; });
      if (!r) return;
      var html = '';
      html += '<div class="cdf-residency-card">';
      html += '<h3>OpenAI Models (GPT)</h3>';
      html += '<div class="cdf-residency-row"><strong>Processing location</strong><span>' + esc(r.openai_processing) + '</span></div>';
      html += '<div class="cdf-residency-row"><strong>EU Data Boundary</strong><span>' + (r.eu_data_boundary ? '✅ Yes' : '—') + '</span></div>';
      html += '<div class="cdf-residency-row"><strong>Default status</strong><span>Always enabled</span></div>';
      html += '</div>';

      html += '<div class="cdf-residency-card">';
      html += '<h3>Anthropic Models (Claude)</h3>';
      html += '<div class="cdf-residency-row"><strong>Processing location</strong><span>' + esc(r.anthropic_processing) + '</span></div>';
      html += '<div class="cdf-residency-row"><strong>EU Data Boundary</strong><span>❌ Excluded</span></div>';
      html += '<div class="cdf-residency-row"><strong>Default status</strong><span>' + capitalise(esc(r.anthropic_default)) + '</span></div>';
      if (r.notes) {
        html += '<div class="cdf-residency-note">⚠️ ' + esc(r.notes) + '</div>';
      }
      html += '</div>';
      resultEl.innerHTML = html;
    }

    select.addEventListener('change', function () { showRegion(select.value); });
    showRegion(select.value);
  }

  /* ═══ READINESS CHECKLIST ═══ */
  var checkedItems = {};
  try { checkedItems = JSON.parse(localStorage.getItem('cdf-checklist') || '{}'); } catch (e) {}

  function renderChecklist() {
    var container = document.getElementById('cdf-checklist-items');
    if (!container) return;
    var html = '';
    checklist.forEach(function (item) {
      var isChecked = checkedItems[item.id] ? ' checked' : '';
      html += '<div class="cdf-checklist-item' + isChecked + '" data-id="' + esc(item.id) + '">';
      html += '<div class="cdf-check-box">' + (checkedItems[item.id] ? '✓' : '') + '</div>';
      html += '<div class="cdf-check-content">';
      html += '<div class="cdf-check-name">' + esc(item.name) + '</div>';
      html += '<div class="cdf-check-desc">' + esc(item.description) + '</div>';
      html += '</div>';
      html += '<span class="cdf-check-priority cdf-priority-' + esc(item.priority) + '">' + esc(item.priority) + '</span>';
      html += '</div>';
    });
    container.innerHTML = html;

    container.querySelectorAll('.cdf-checklist-item').forEach(function (el) {
      el.addEventListener('click', function () {
        var id = el.dataset.id;
        checkedItems[id] = !checkedItems[id];
        if (!checkedItems[id]) delete checkedItems[id];
        try { localStorage.setItem('cdf-checklist', JSON.stringify(checkedItems)); } catch (e) {}
        renderChecklist();
        updateScore();
      });
    });
    updateScore();
  }

  function updateScore() {
    var total = checklist.length;
    var done = Object.keys(checkedItems).length;
    var pct = total ? Math.round((done / total) * 100) : 0;
    var fill = document.getElementById('cdf-score-fill');
    var text = document.getElementById('cdf-score-text');
    if (fill) {
      fill.style.width = pct + '%';
      fill.className = 'cdf-score-fill' + (pct >= 75 ? ' score-high' : pct >= 40 ? ' score-medium' : ' score-low');
    }
    if (text) text.textContent = done + ' / ' + total + ' complete (' + pct + '%)';
  }

  /* Copy Security Brief */
  var copyBrief = document.getElementById('cdf-copy-brief');
  if (copyBrief) {
    copyBrief.addEventListener('click', function () {
      var lines = [
        'Microsoft 365 Copilot — Security Assessment Summary',
        '='.repeat(52),
        '',
        'READINESS CHECKLIST',
        ''
      ];
      checklist.forEach(function (item) {
        var status = checkedItems[item.id] ? '[✅ DONE]' : '[⬜ TODO]';
        lines.push(status + ' ' + item.name + ' (' + item.priority + ')');
        lines.push('    ' + item.description);
        lines.push('');
      });
      lines.push('');
      lines.push('KEY PRIVACY COMMITMENTS');
      lines.push('• Microsoft does NOT train AI models on your data');
      lines.push('• Prompts and responses are encrypted in transit (TLS) and at rest (AES-256)');
      lines.push('• All interactions logged in Microsoft Purview Audit');
      lines.push('• User-level permissions enforced via Microsoft Graph');
      lines.push('');
      lines.push('MODEL PROVIDERS');
      lines.push('• OpenAI (Azure): Processing inside Microsoft boundary');
      lines.push('• Anthropic (Claude): Sub-processor, data crosses boundary. Under Microsoft DPA.');
      lines.push('  Disabled by default in EU/EFTA/UK. Admin toggle available.');
      lines.push('');
      lines.push('CERTIFICATIONS: ISO 27001, ISO 27018, ISO 42001 (AI), SOC 1/2, GDPR, HIPAA');
      lines.push('');
      lines.push('Source: aguidetocloud.com/copilot-data-flow/');
      lines.push('Generated: ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));

      var brief = lines.join('\n');
      navigator.clipboard.writeText(brief).then(function () {
        copyBrief.textContent = '✓ Copied — paste into your security assessment';
        setTimeout(function () { copyBrief.textContent = '📋 Copy Security Brief'; }, 3000);
      }).catch(function () {
        var ta = document.createElement('textarea');
        ta.value = brief;
        ta.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:80%;height:400px;z-index:9999;font-family:monospace;font-size:12px;padding:16px;border:2px solid var(--accent);border-radius:8px;background:var(--bg-surface);color:var(--text-primary);';
        document.body.appendChild(ta);
        ta.select();
        ta.addEventListener('blur', function () { document.body.removeChild(ta); });
      });
    });
  }

  /* ═══ ARCHITECTURE TAB ═══ */
  var archLayers = D.archLayers || [];

  function renderArchitecture() {
    var stack = document.getElementById('cdf-arch-stack');
    if (!stack || !archLayers.length) return;

    /* Sort by order */
    var sorted = archLayers.slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); });

    var html = '';
    sorted.forEach(function (layer, i) {
      var typeClass = layer.type === 'cross-cutting' ? 'cdf-arch-type-cross-cutting' : 'cdf-arch-type-core';
      var typeLabel = layer.type === 'cross-cutting' ? 'Cross-cutting' : 'Core';

      /* Arrow between layers */
      if (i > 0) {
        html += '<div class="cdf-arch-arrow"><svg viewBox="0 0 20 20" fill="none"><path d="M10 4v12M5 11l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>';
      }

      html += '<div class="cdf-arch-layer" data-layer="' + esc(layer.id) + '">';

      /* Header */
      html += '<div class="cdf-arch-header" role="button" tabindex="0" aria-expanded="false">';
      html += '<div class="cdf-arch-number">' + (i + 1) + '</div>';
      html += '<div class="cdf-arch-titles">';
      html += '<div class="cdf-arch-title">' + esc(layer.title) + '</div>';
      html += '<div class="cdf-arch-subtitle">' + esc(layer.subtitle) + '</div>';
      html += '</div>';
      if (layer.prompt_stage) {
        html += '<div class="cdf-arch-prompt-pill" title="' + esc(layer.prompt_stage) + '">' + esc(truncate(layer.prompt_stage, 40)) + '</div>';
      }
      html += '<span class="cdf-arch-type-badge ' + typeClass + '">' + typeLabel + '</span>';
      html += '<svg class="cdf-arch-chevron" viewBox="0 0 20 20" fill="none"><path d="M5 7l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      html += '</div>';

      /* Body */
      html += '<div class="cdf-arch-body">';
      html += '<div class="cdf-arch-content">';

      /* Summary */
      html += '<p class="cdf-arch-desc"><strong>' + esc(layer.summary) + '</strong></p>';

      /* Full description */
      html += '<p class="cdf-arch-desc">' + esc(layer.description) + '</p>';

      /* Prompt transformation */
      if (layer.prompt_stage) {
        html += '<div class="cdf-arch-prompt-stage"><strong>Prompt at this stage:</strong> ' + esc(layer.prompt_stage) + '</div>';
      }

      /* Detail grid */
      html += '<div class="cdf-arch-detail-grid">';
      if (layer.inputs) {
        html += '<div class="cdf-arch-detail-card"><h4>What enters</h4><p>' + esc(layer.inputs) + '</p></div>';
      }
      if (layer.outputs) {
        html += '<div class="cdf-arch-detail-card"><h4>What leaves</h4><p>' + esc(layer.outputs) + '</p></div>';
      }
      if (layer.security) {
        html += '<div class="cdf-arch-detail-card"><h4>Security at this layer</h4><p>' + esc(layer.security) + '</p></div>';
      }
      if (layer.admin_takeaway) {
        html += '<div class="cdf-arch-detail-card cdf-arch-admin-card"><h4>IT Admin takeaway</h4><p>' + esc(layer.admin_takeaway) + '</p></div>';
      }
      html += '</div>';

      /* Sub-components */
      var subs = layer.subcomponents || [];
      if (subs.length) {
        html += '<div class="cdf-arch-subs-heading">Components</div>';
        html += '<div class="cdf-arch-subs">';
        subs.forEach(function (sub) {
          html += '<div class="cdf-arch-sub">';
          html += '<div class="cdf-arch-sub-name">' + esc(sub.name) + '</div>';
          html += '<div class="cdf-arch-sub-detail">' + esc(sub.detail) + '</div>';
          html += '</div>';
        });
        html += '</div>';
      }

      /* Deep dive (grounding layer) */
      var dd = layer.deep_dive;
      if (dd) {
        html += '<div class="cdf-arch-deep-dive">';
        html += '<div class="cdf-arch-deep-dive-title">' + esc(dd.title || 'Deep Dive') + '</div>';
        html += '<p>' + esc(dd.content) + '</p>';
        if (dd.analogy) {
          html += '<em>' + esc(dd.analogy) + '</em>';
        }
        html += '</div>';
      }

      /* Source links */
      var sources = layer.source_urls || [];
      if (sources.length) {
        html += '<div class="cdf-arch-sources">';
        sources.forEach(function (url) {
          var domain = 'Microsoft Docs';
          try { domain = new URL(url).hostname.replace('learn.microsoft.com', 'Microsoft Learn'); } catch (e) {}
          html += '<a href="' + esc(url) + '" class="cdf-arch-source" target="_blank" rel="noopener">' + esc(domain) + ' →</a>';
        });
        html += '</div>';
      }

      html += '</div>'; /* content */
      html += '</div>'; /* body */
      html += '</div>'; /* layer */
    });

    stack.innerHTML = html;

    /* Prompt evolution strip labels */
    var evoLabels = ['Raw prompt', 'Authenticated', 'Planned', 'Grounded', 'Generated', 'Filtered', 'Delivered'];

    /* Render prompt evolution strip */
    var evoTrack = document.getElementById('cdf-arch-evo-track');
    if (evoTrack) {
      var evoHtml = '';
      evoLabels.forEach(function (label, i) {
        evoHtml += '<div class="cdf-arch-evo-step' + (i === 0 ? ' active' : '') + '" data-evo="' + i + '">' + esc(label) + '</div>';
      });
      evoTrack.innerHTML = evoHtml;
    }

    function updateEvoStrip(layerIdx) {
      if (!evoTrack) return;
      var steps = evoTrack.querySelectorAll('.cdf-arch-evo-step');
      steps.forEach(function (s, i) {
        s.classList.remove('active', 'passed');
        if (i < layerIdx) s.classList.add('passed');
        else if (i === layerIdx) s.classList.add('active');
      });
    }

    /* Overview mini-map */
    var overview = document.getElementById('cdf-arch-overview');
    var ovLayers = overview ? overview.querySelectorAll('.cdf-arch-ov-layer') : [];

    function updateOverview(layerId) {
      ovLayers.forEach(function (ov) {
        ov.classList.toggle('active', ov.dataset.target === layerId);
      });
    }

    /* Accordion: one layer open at a time */
    var layers = stack.querySelectorAll('.cdf-arch-layer');

    function activateLayer(el, layerIdx) {
      var isActive = el.classList.contains('active');
      layers.forEach(function (l) {
        l.classList.remove('active');
        var h = l.querySelector('.cdf-arch-header');
        if (h) h.setAttribute('aria-expanded', 'false');
      });
      if (!isActive) {
        el.classList.add('active');
        var header = el.querySelector('.cdf-arch-header');
        if (header) header.setAttribute('aria-expanded', 'true');
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        updateEvoStrip(layerIdx);
        updateOverview(el.dataset.layer);
      }
    }

    layers.forEach(function (el, idx) {
      var header = el.querySelector('.cdf-arch-header');
      header.addEventListener('click', function () { activateLayer(el, idx); });
      header.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activateLayer(el, idx); }
      });
    });

    /* Overview click → scroll to layer */
    ovLayers.forEach(function (ov) {
      ov.addEventListener('click', function () {
        var targetId = ov.dataset.target;
        var targetLayer = stack.querySelector('[data-layer="' + targetId + '"]');
        if (targetLayer) {
          var idx = Array.from(layers).indexOf(targetLayer);
          activateLayer(targetLayer, idx);
        }
      });
    });

    /* Auto-expand first layer */
    if (layers.length) {
      layers[0].classList.add('active');
      var firstH = layers[0].querySelector('.cdf-arch-header');
      if (firstH) firstH.setAttribute('aria-expanded', 'true');
      updateOverview(sorted[0].id);
      updateEvoStrip(0);
    }
  }

  /* Copy Architecture Summary */
  var copyArch = document.getElementById('cdf-copy-arch');
  if (copyArch) {
    copyArch.addEventListener('click', function () {
      var sorted = archLayers.slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
      var lines = [
        'Microsoft 365 Copilot — Architecture Summary',
        '='.repeat(48),
        ''
      ];
      sorted.forEach(function (layer, i) {
        lines.push('LAYER ' + (i + 1) + ': ' + layer.title.toUpperCase());
        lines.push(layer.summary);
        lines.push('');
        if (layer.inputs) lines.push('  What enters:   ' + layer.inputs);
        if (layer.outputs) lines.push('  What leaves:   ' + layer.outputs);
        if (layer.security) lines.push('  Security:      ' + layer.security);
        if (layer.admin_takeaway) lines.push('  Admin action:  ' + layer.admin_takeaway);
        lines.push('');
      });
      lines.push('Source: aguidetocloud.com/copilot-data-flow/');
      lines.push('Generated: ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));

      var summary = lines.join('\n');
      navigator.clipboard.writeText(summary).then(function () {
        copyArch.textContent = '✓ Copied — paste into your assessment';
        setTimeout(function () { copyArch.textContent = 'Copy Architecture Summary'; }, 3000);
      }).catch(function () {
        var ta = document.createElement('textarea');
        ta.value = summary;
        ta.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:80%;height:400px;z-index:9999;font-family:monospace;font-size:12px;padding:16px;border:2px solid var(--accent);border-radius:8px;background:var(--bg-surface);color:var(--text-primary);';
        document.body.appendChild(ta);
        ta.select();
        ta.addEventListener('blur', function () { document.body.removeChild(ta); });
      });
    });
  }

  /* ═══ DOCS HUB ═══ */
  function renderDocsHub() {
    var grid = document.getElementById('cdf-docs-grid');
    if (!grid) return;
    var docsHub = D.docsHub || [];
    var html = '';
    docsHub.forEach(function (cat) {
      html += '<div class="cdf-docs-category">';
      html += '<div class="cdf-docs-cat-header">' + esc(cat.category) + '</div>';
      html += '<div class="cdf-docs-links">';
      (cat.links || []).forEach(function (link) {
        html += '<a href="' + esc(link.url) + '" class="cdf-docs-link" target="_blank" rel="noopener">';
        html += '<div class="cdf-docs-link-name">' + esc(link.name) + ' →</div>';
        html += '<div class="cdf-docs-link-desc">' + esc(link.description) + '</div>';
        html += '</a>';
      });
      html += '</div></div>';
    });
    grid.innerHTML = html;
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
  function truncate(s, len) { return s && s.length > len ? s.substring(0, len) + '…' : s || ''; }

  /* ── Init ── */
  renderScenarios();
  renderControls();
  renderCompliance();
  renderAccess();
  renderResidency();
  renderChecklist();
  renderArchitecture();
  renderDocsHub();

})();
