/* ═══════════════════════════════════════════════════════════════
   Copilot Studio Companion — JS
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var D = window.__cstudioDecision || {};
  var K = window.__cstudioKnowledge || {};
  var M = window.__cstudioModels || {};
  var AG = window.__cstudioAgents || {};
  var Q = window.__cstudioQuotas || {};
  var C = window.__cstudioCaps || {};
  var R = window.__cstudioRoles || {};
  var L = window.__cstudioLicensing || {};
  var INT = window.__cstudioIntegration || {};
  var RD = window.__cstudioReadiness || {};

  var PLATFORMS = D.platforms || [];
  var FEATURES = D.features || [];
  var TRIGGERS = D.upgrade_triggers || [];
  var SOURCES = K.sources || [];
  var MODELS = M.models || [];
  var MODEL_CATS = M.categories || [];
  var AGENT_TYPES = AG.agent_types || [];
  var ANTI_PATTERNS = AG.anti_patterns || [];
  var CAPABILITIES = C.capabilities || [];
  var CAP_CATS = C.categories || [];
  var GENAI_QUOTAS = Q.genai_quotas || [];
  var CHANNELS = Q.channels || [];
  var ROLES = R.roles || [];
  var LICENCES = L.licences || [];
  var CREDIT_RATES = L.credit_rates || [];
  var EST_SCENARIOS = (L.estimation || {}).scenarios || [];
  var READINESS_QS = RD.questions || [];
  var READINESS_TIERS = RD.tiers || [];

  var toggledFeatures = {};

  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  function toast(msg) {
    var t = document.getElementById('cstudio-toast');
    if (!t) { t = document.createElement('div'); t.id = 'cstudio-toast'; t.className = 'cstudio-toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 2200);
  }

  /* ═══ TABS ═══ */
  function initTabs() {
    document.querySelectorAll('.cstudio-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.cstudio-tab').forEach(function (t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        document.querySelectorAll('.cstudio-panel').forEach(function (p) { p.classList.remove('active'); });
        tab.classList.add('active'); tab.setAttribute('aria-selected', 'true');
        var panel = document.getElementById('panel-' + tab.dataset.tab);
        if (panel) panel.classList.add('active');
      });
    });
    // Sub-tabs
    var subContainer = document.getElementById('features-subtabs');
    if (subContainer) subContainer.addEventListener('click', function (e) {
      var btn = e.target.closest('.cstudio-subtab');
      if (!btn) return;
      subContainer.querySelectorAll('.cstudio-subtab').forEach(function (s) { s.classList.remove('active'); });
      document.querySelectorAll('.cstudio-subpanel').forEach(function (p) { p.classList.remove('active'); });
      btn.classList.add('active');
      var panel = document.getElementById('sub-' + btn.dataset.sub);
      if (panel) panel.classList.add('active');
    });
  }

  /* ═══ TAB 1: DECIDE ═══ */
  function renderFeatureChecker() {
    var el = document.getElementById('feature-checker');
    if (!el) return;
    var platIds = ['agent-builder', 'copilot-studio', 'ai-foundry'];
    var platNames = { 'agent-builder': 'Agent Builder', 'copilot-studio': 'Copilot Studio', 'ai-foundry': 'AI Foundry' };

    function render() {
      var html = '<div class="cstudio-checker">';
      html += '<div class="cstudio-check-row" style="font-weight:700;color:rgba(255,255,255,0.4);font-size:0.72rem;text-transform:uppercase;letter-spacing:0.03em">';
      html += '<span style="width:36px"></span><span class="cstudio-check-label">Feature</span>';
      platIds.forEach(function (p) { html += '<span style="width:60px;text-align:center">' + esc(platNames[p]) + '</span>'; });
      html += '</div>';
      FEATURES.forEach(function (f) {
        var on = toggledFeatures[f.id];
        html += '<div class="cstudio-check-row" data-fid="' + esc(f.id) + '">';
        html += '<div class="cstudio-check-toggle' + (on ? ' on' : '') + '" data-fid="' + esc(f.id) + '"></div>';
        html += '<span class="cstudio-check-label">' + esc(f.label) + '</span>';
        platIds.forEach(function (p) {
          var val = f[p.replace('-', '_')];
          var cls = on ? val : 'off';
          html += '<span class="cstudio-dot ' + cls + '" style="margin:0 auto" title="' + esc(val) + '"></span>';
        });
        html += '</div>';
      });
      html += '</div>';
      el.innerHTML = html;
    }
    render();
    el.addEventListener('click', function (e) {
      var toggle = e.target.closest('.cstudio-check-toggle');
      if (toggle) {
        var fid = toggle.dataset.fid;
        toggledFeatures[fid] = !toggledFeatures[fid];
        render();
        return;
      }
      var label = e.target.closest('.cstudio-check-label');
      if (label) {
        var row = label.closest('.cstudio-check-row');
        if (row && row.dataset.fid) {
          toggledFeatures[row.dataset.fid] = !toggledFeatures[row.dataset.fid];
          render();
        }
      }
    });
  }

  function renderUpgradeTriggers() {
    var el = document.getElementById('upgrade-triggers');
    if (!el) return;
    var html = '';
    TRIGGERS.forEach(function (t) {
      html += '<div class="cstudio-trigger-card">';
      html += '<span class="cstudio-badge cstudio-badge-' + esc(t.priority) + '">' + esc(t.priority) + '</span>';
      html += '<div><div class="cstudio-card-title" style="font-size:0.85rem">' + esc(t.trigger) + '</div>';
      html += '<div class="cstudio-card-desc">' + esc(t.detail) + '</div></div>';
      html += '</div>';
    });
    el.innerHTML = html;
  }

  function renderPlatformCards() {
    var el = document.getElementById('platform-cards');
    if (!el) return;
    var html = '<div class="cstudio-grid-3">';
    PLATFORMS.forEach(function (p) {
      html += '<div class="cstudio-platform-card">';
      html += '<div class="cstudio-card-icon">' + esc(p.icon) + '</div>';
      html += '<h4>' + esc(p.name) + '</h4>';
      html += '<p>' + esc(p.description) + '</p>';
      html += '<div style="margin-top:0.5rem;text-align:left">';
      (p.strengths || []).slice(0, 4).forEach(function (s) {
        html += '<div style="color:rgba(255,255,255,0.5);font-size:0.72rem;padding:0.1rem 0">✅ ' + esc(s) + '</div>';
      });
      html += '</div>';
      if (p.url) html += '<a href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer" class="cstudio-learn-link" style="display:block;margin-top:0.5rem">Learn more →</a>';
      html += '</div>';
    });
    html += '</div>';
    el.innerHTML = html;
  }

  /* ═══ TAB 2: FEATURES & LIMITS ═══ */
  function renderKnowledge() {
    var el = document.getElementById('knowledge-grid');
    if (!el) return;
    var html = '<div class="cstudio-grid-2">';
    SOURCES.forEach(function (s) {
      html += '<div class="cstudio-card cstudio-knowledge-card">';
      html += '<div class="cstudio-card-title"><span class="cstudio-card-icon">' + esc(s.icon) + '</span>' + esc(s.name) + '</div>';
      html += '<div class="cstudio-card-desc">' + esc(s.description) + '</div>';
      html += '<div style="margin-top:0.5rem">';
      if (s.max_files > 0) html += '<div class="cstudio-limit-row"><span class="cstudio-limit-label">Max files</span><span class="cstudio-limit-value">' + s.max_files.toLocaleString() + '</span></div>';
      if (s.max_folders > 0) html += '<div class="cstudio-limit-row"><span class="cstudio-limit-label">Max folders</span><span class="cstudio-limit-value">' + s.max_folders + '</span></div>';
      if (s.max_file_size_mb > 0) html += '<div class="cstudio-limit-row"><span class="cstudio-limit-label">Max file size</span><span class="cstudio-limit-value">' + s.max_file_size_mb + ' MB</span></div>';
      if (s.max_rows > 0) html += '<div class="cstudio-limit-row"><span class="cstudio-limit-label">Max rows</span><span class="cstudio-limit-value">' + s.max_rows.toLocaleString() + '</span></div>';
      if (s.max_sources_per_agent > 0) html += '<div class="cstudio-limit-row"><span class="cstudio-limit-label">Max sources</span><span class="cstudio-limit-value">' + s.max_sources_per_agent + ' per agent</span></div>';
      if (s.max_tables_per_source > 0) html += '<div class="cstudio-limit-row"><span class="cstudio-limit-label">Max tables</span><span class="cstudio-limit-value">' + s.max_tables_per_source + ' per source</span></div>';
      if (s.sync_frequency) html += '<div class="cstudio-limit-row"><span class="cstudio-limit-label">Sync</span><span class="cstudio-limit-value">' + esc(s.sync_frequency) + '</span></div>';
      if (s.supported_file_types && s.supported_file_types.length) html += '<div class="cstudio-limit-row"><span class="cstudio-limit-label">File types</span><span class="cstudio-limit-value">' + s.supported_file_types.join(', ') + '</span></div>';
      html += '</div>';
      if (s.gotchas && s.gotchas.length) {
        html += '<details><summary>Gotchas (' + s.gotchas.length + ')</summary><div class="cstudio-detail-content">';
        s.gotchas.forEach(function (g) { html += '<div class="cstudio-gotcha">' + esc(g) + '</div>'; });
        html += '</div></details>';
      }
      if (s.learn_url) html += '<a href="' + esc(s.learn_url) + '" target="_blank" rel="noopener noreferrer" class="cstudio-learn-link">MS Learn →</a>';
      html += '</div>';
    });
    html += '</div>';
    el.innerHTML = html;
  }

  function renderModels() {
    var el = document.getElementById('models-grid');
    if (!el) return;
    // Category cards
    var html = '<div class="cstudio-grid-4" style="margin-bottom:1.5rem">';
    MODEL_CATS.forEach(function (c) {
      html += '<div class="cstudio-card" style="text-align:center;padding:0.8rem">';
      html += '<div style="font-size:0.9rem;font-weight:700;color:#fff">' + esc(c.label) + '</div>';
      html += '<div style="color:rgba(255,255,255,0.5);font-size:0.72rem;margin-top:0.2rem">' + esc(c.description) + '</div>';
      html += '<div style="margin-top:0.4rem;font-size:0.7rem">';
      html += '<span style="color:rgba(255,255,255,0.4)">Speed: </span><span style="color:#fff">' + esc(c.speed) + '</span> · ';
      html += '<span style="color:rgba(255,255,255,0.4)">Cost: </span><span style="color:#fff">' + esc(c.cost) + '</span>';
      html += '</div></div>';
    });
    html += '</div>';
    // Model table
    html += '<div style="overflow-x:auto"><table class="cstudio-model-table"><thead><tr>';
    html += '<th>Model</th><th>Provider</th><th>Category</th><th>Status</th><th>Best For</th><th>Regions</th>';
    html += '</tr></thead><tbody>';
    MODELS.forEach(function (m) {
      var statusCls = m.status === 'GA' ? 'ga' : m.status === 'Preview' ? 'preview' : 'exp';
      html += '<tr>';
      html += '<td style="font-weight:600">' + esc(m.name) + (m.is_default ? ' <span class="cstudio-badge cstudio-badge-cs">Default</span>' : '') + '</td>';
      html += '<td>' + esc(m.provider) + '</td>';
      html += '<td>' + esc(m.category) + '</td>';
      html += '<td><span class="cstudio-badge cstudio-badge-' + statusCls + '">' + esc(m.status) + '</span></td>';
      html += '<td style="font-size:0.72rem;color:rgba(255,255,255,0.5)">' + (m.best_for || []).slice(0, 2).join(', ') + '</td>';
      html += '<td style="font-size:0.72rem">' + esc(m.regions) + (m.cross_geo ? ' <span style="color:#fbbf24">⚠ cross-geo</span>' : '') + '</td>';
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    // Notes
    var notes = M.notes || {};
    if (notes.anthropic_warning) html += '<div style="margin-top:1rem;padding:0.6rem;border-radius:8px;background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.2);color:rgba(255,255,255,0.7);font-size:0.78rem">⚠️ ' + esc(notes.anthropic_warning) + '</div>';
    if (notes.cross_geo_warning) html += '<div style="margin-top:0.5rem;padding:0.6rem;border-radius:8px;background:rgba(251,191,36,0.05);border:1px solid rgba(251,191,36,0.1);color:rgba(255,255,255,0.5);font-size:0.75rem">🌍 ' + esc(notes.cross_geo_warning) + '</div>';
    el.innerHTML = html;
  }

  function renderAgentTypes() {
    var el = document.getElementById('agents-grid');
    if (!el) return;
    var html = '';
    AGENT_TYPES.forEach(function (a) {
      html += '<div class="cstudio-card">';
      html += '<div class="cstudio-card-title"><span class="cstudio-card-icon">' + esc(a.icon) + '</span>' + esc(a.name) + '</div>';
      html += '<div class="cstudio-card-desc">' + esc(a.description) + '</div>';
      html += '<div style="margin-top:0.5rem">';
      html += '<div class="cstudio-limit-row"><span class="cstudio-limit-label">Orchestration</span><span class="cstudio-limit-value">' + esc(a.orchestration) + '</span></div>';
      html += '<div class="cstudio-limit-row"><span class="cstudio-limit-label">Context</span><span class="cstudio-limit-value">' + esc(a.context_sharing) + '</span></div>';
      html += '<div class="cstudio-limit-row"><span class="cstudio-limit-label">Deployment</span><span class="cstudio-limit-value" style="font-size:0.72rem">' + esc(a.deployment) + '</span></div>';
      html += '</div>';
      html += '<details><summary>When to use (' + (a.when_to_use || []).length + ' scenarios)</summary><div class="cstudio-detail-content">';
      (a.when_to_use || []).forEach(function (w) { html += '<div style="color:rgba(255,255,255,0.6);font-size:0.75rem;padding:0.15rem 0">• ' + esc(w) + '</div>'; });
      html += '</div></details>';
      if (a.considerations && a.considerations.length) {
        html += '<details><summary>Considerations</summary><div class="cstudio-detail-content">';
        a.considerations.forEach(function (c) { html += '<div class="cstudio-gotcha">' + esc(c) + '</div>'; });
        html += '</div></details>';
      }
      if (a.learn_url) html += '<a href="' + esc(a.learn_url) + '" target="_blank" rel="noopener noreferrer" class="cstudio-learn-link">MS Learn →</a>';
      html += '</div>';
    });
    // Anti-patterns
    if (ANTI_PATTERNS.length) {
      html += '<h4 style="color:rgba(255,255,255,0.5);font-size:0.78rem;text-transform:uppercase;margin-top:1.5rem;letter-spacing:0.03em">Common anti-patterns</h4>';
      ANTI_PATTERNS.forEach(function (ap) {
        html += '<div class="cstudio-card" style="border-left:3px solid #f87171">';
        html += '<div class="cstudio-card-title" style="color:#f87171">❌ ' + esc(ap.name) + '</div>';
        html += '<div class="cstudio-card-desc">' + esc(ap.description) + '</div>';
        html += '<div style="color:#4ade80;font-size:0.78rem;margin-top:0.3rem">✅ Fix: ' + esc(ap.fix) + '</div>';
        html += '</div>';
      });
    }
    // Best practices
    var bp = AG.best_practices;
    if (bp) {
      html += '<div class="cstudio-card" style="border-left:3px solid var(--cstudio-accent);margin-top:1rem">';
      html += '<div class="cstudio-card-title">💡 Rule of Thumb</div>';
      html += '<div class="cstudio-card-desc">' + esc(bp.tool_threshold_note) + '</div>';
      html += '<div style="color:var(--cstudio-accent);font-size:0.82rem;font-weight:600;margin-top:0.3rem">' + esc(bp.start_simple) + '</div>';
      html += '</div>';
    }
    el.innerHTML = html;
  }

  function renderQuotas() {
    var el = document.getElementById('quotas-grid');
    if (!el) return;
    var lim = (Q.limits || {});
    var web = lim.web_app || {};
    var teams = lim.teams_app || {};
    var html = '';
    // Agent limits table
    html += '<h4 style="color:rgba(255,255,255,0.5);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.03em;margin-bottom:0.5rem">Agent Limits (Web App)</h4>';
    html += '<div class="cstudio-card"><div style="font-size:0.82rem">';
    var webItems = [
      ['Instructions', web.instructions_chars ? web.instructions_chars.toLocaleString() + ' characters' : '—'],
      ['Topics per agent', web.topics_per_agent ? web.topics_per_agent.toLocaleString() : '—'],
      ['Trigger phrases per topic', web.trigger_phrases_per_topic || '—'],
      ['Skills per agent', web.skills_per_agent || '—'],
      ['Recommended max tools', (web.tools_recommended_max || '40') + ' (performance degrades beyond this)'],
      ['File upload size', (web.file_upload_size_mb || '512') + ' MB per file'],
      ['File upload count', web.file_upload_count || '500'],
      ['Connector payload', (web.connector_payload_mb || '5') + ' MB (public cloud) / ' + (web.connector_payload_gcc_kb || '450') + ' KB (GCC)']
    ];
    webItems.forEach(function (item) {
      html += '<div class="cstudio-limit-row"><span class="cstudio-limit-label">' + item[0] + '</span><span class="cstudio-limit-value">' + item[1] + '</span></div>';
    });
    html += '</div></div>';
    // GenAI quotas
    html += '<h4 style="color:rgba(255,255,255,0.5);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.03em;margin:1.5rem 0 0.5rem">GenAI Message Quotas</h4>';
    html += '<div style="overflow-x:auto"><table class="cstudio-model-table"><thead><tr>';
    html += '<th>Tier</th><th>RPM</th><th>RPH</th>';
    html += '</tr></thead><tbody>';
    GENAI_QUOTAS.forEach(function (q) {
      html += '<tr><td>' + esc(q.tier) + '</td>';
      html += '<td>' + (q.rpm ? q.rpm : esc(q.rpm_note || '—')) + '</td>';
      html += '<td>' + (q.rph ? q.rph.toLocaleString() : esc(q.rph_note || '—')) + '</td></tr>';
    });
    html += '</tbody></table></div>';
    // Channels
    html += '<h4 style="color:rgba(255,255,255,0.5);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.03em;margin:1.5rem 0 0.5rem">Channel Limits</h4>';
    html += '<div class="cstudio-grid-2">';
    CHANNELS.forEach(function (ch) {
      html += '<div class="cstudio-card">';
      html += '<div class="cstudio-card-title"><span class="cstudio-card-icon">' + esc(ch.icon) + '</span>' + esc(ch.name) + '</div>';
      html += '<div class="cstudio-limit-row"><span class="cstudio-limit-label">Limits</span><span class="cstudio-limit-value" style="font-size:0.72rem">' + esc(ch.limits) + '</span></div>';
      html += '<div class="cstudio-card-desc">' + esc(ch.notes) + '</div>';
      html += '</div>';
    });
    html += '</div>';
    el.innerHTML = html;
  }

  function renderCapabilities() {
    var el = document.getElementById('capabilities-grid');
    if (!el) return;
    var grouped = {};
    CAP_CATS.forEach(function (c) { grouped[c.id] = { label: c.label, icon: c.icon, items: [] }; });
    CAPABILITIES.forEach(function (cap) {
      if (grouped[cap.category]) grouped[cap.category].items.push(cap);
    });
    var html = '';
    Object.keys(grouped).forEach(function (catId) {
      var g = grouped[catId];
      if (!g.items.length) return;
      html += '<h4 style="color:rgba(255,255,255,0.5);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.03em;margin:1rem 0 0.5rem">' + esc(g.icon) + ' ' + esc(g.label) + '</h4>';
      html += '<div class="cstudio-grid-2">';
      g.items.forEach(function (cap) {
        html += '<div class="cstudio-card">';
        html += '<div class="cstudio-card-title">' + esc(cap.name);
        if (cap.cs_only) html += ' <span class="cstudio-badge cstudio-badge-cs">CS Only</span>';
        html += '</div>';
        html += '<div class="cstudio-card-desc">' + esc(cap.description) + '</div>';
        html += '<details><summary>Why it matters</summary><div class="cstudio-detail-content">';
        html += '<div style="color:rgba(255,255,255,0.6);font-size:0.78rem">' + esc(cap.why_it_matters) + '</div>';
        html += '</div></details>';
        if (cap.learn_url) html += '<a href="' + esc(cap.learn_url) + '" target="_blank" rel="noopener noreferrer" class="cstudio-learn-link">MS Learn →</a>';
        html += '</div>';
      });
      html += '</div>';
    });
    el.innerHTML = html;
  }

  /* ═══ TAB 3: PLAN (Wizard) ═══ */
  var planState = { step: 1, role: '', audience: '', channels: [], knowledge: [], actions: [], architecture: 'single' };

  function renderPlanWizard() {
    var stepsBar = document.getElementById('plan-steps-bar');
    var content = document.getElementById('plan-wizard-content');
    if (!stepsBar || !content) return;
    var totalSteps = 7;
    var barHtml = '';
    for (var i = 1; i <= totalSteps; i++) {
      if (i > 1) barHtml += '<div class="cstudio-step-line"></div>';
      barHtml += '<div class="cstudio-step-dot' + (i === planState.step ? ' active' : i < planState.step ? ' done' : '') + '" data-step="' + i + '">' + i + '</div>';
    }
    stepsBar.innerHTML = barHtml;
    stepsBar.querySelectorAll('.cstudio-step-dot').forEach(function (dot) {
      dot.addEventListener('click', function () { planState.step = parseInt(dot.dataset.step); renderPlanWizard(); });
    });

    var html = '';
    switch (planState.step) {
      case 1:
        html += '<div class="cstudio-wizard-step active"><h3 class="cstudio-section-title">What role will your agent play?</h3>';
        html += '<p class="cstudio-tip">Choose a template to pre-fill recommendations, or pick Custom to define everything yourself.</p>';
        html += '<div class="cstudio-grid-4">';
        ROLES.forEach(function (r) {
          html += '<div class="cstudio-card" style="cursor:pointer;text-align:center' + (planState.role === r.id ? ';border-color:var(--cstudio-accent)' : '') + '" data-role="' + esc(r.id) + '">';
          html += '<div style="font-size:1.5rem">' + esc(r.icon) + '</div>';
          html += '<div style="color:#fff;font-weight:600;font-size:0.82rem">' + esc(r.name) + '</div>';
          html += '<div style="color:rgba(255,255,255,0.4);font-size:0.7rem">' + esc(r.complexity) + ' complexity</div>';
          html += '</div>';
        });
        html += '</div>';
        html += '<div class="cstudio-nav-row"><span></span><button class="cstudio-btn cstudio-btn-primary" id="plan-next">Next →</button></div></div>';
        break;
      case 2:
        html += '<div class="cstudio-wizard-step active"><h3 class="cstudio-section-title">Who will use your agent?</h3>';
        html += '<div class="cstudio-radio-group">';
        ['Internal employees', 'External customers', 'Partners', 'Mixed'].forEach(function (a) {
          html += '<label class="cstudio-radio"><input type="radio" name="audience" value="' + esc(a) + '"' + (planState.audience === a ? ' checked' : '') + '> ' + esc(a) + '</label>';
        });
        html += '</div>';
        html += '<div class="cstudio-nav-row"><button class="cstudio-btn" id="plan-back">← Back</button><button class="cstudio-btn cstudio-btn-primary" id="plan-next">Next →</button></div></div>';
        break;
      case 3:
        html += '<div class="cstudio-wizard-step active"><h3 class="cstudio-section-title">Where will your agent live?</h3>';
        html += '<p class="cstudio-tip">Select all channels you plan to deploy to.</p>';
        var channelOpts = ['Teams', 'Web widget', 'Mobile app', 'Facebook', 'Dynamics 365 Omnichannel', 'Custom channel'];
        channelOpts.forEach(function (ch) {
          var checked = planState.channels.indexOf(ch) >= 0;
          html += '<label style="display:flex;gap:0.5rem;align-items:center;color:rgba(255,255,255,0.7);font-size:0.85rem;padding:0.3rem 0;cursor:pointer"><input type="checkbox" value="' + esc(ch) + '"' + (checked ? ' checked' : '') + ' style="accent-color:var(--cstudio-accent)"> ' + esc(ch) + '</label>';
        });
        html += '<div class="cstudio-nav-row"><button class="cstudio-btn" id="plan-back">← Back</button><button class="cstudio-btn cstudio-btn-primary" id="plan-next">Next →</button></div></div>';
        break;
      case 4:
        html += '<div class="cstudio-wizard-step active"><h3 class="cstudio-section-title">What data does your agent need?</h3>';
        var dataOpts = ['SharePoint sites/documents', 'OneDrive files', 'Dataverse tables', 'Uploaded files', 'Public websites', 'ServiceNow/Zendesk KB', 'Salesforce/Confluence', 'None — no external data'];
        dataOpts.forEach(function (d) {
          var checked = planState.knowledge.indexOf(d) >= 0;
          html += '<label style="display:flex;gap:0.5rem;align-items:center;color:rgba(255,255,255,0.7);font-size:0.85rem;padding:0.3rem 0;cursor:pointer"><input type="checkbox" value="' + esc(d) + '"' + (checked ? ' checked' : '') + ' style="accent-color:var(--cstudio-accent)"> ' + esc(d) + '</label>';
        });
        html += '<div class="cstudio-nav-row"><button class="cstudio-btn" id="plan-back">← Back</button><button class="cstudio-btn cstudio-btn-primary" id="plan-next">Next →</button></div></div>';
        break;
      case 5:
        html += '<div class="cstudio-wizard-step active"><h3 class="cstudio-section-title">What actions does your agent need?</h3>';
        var actionOpts = ['Create/update tickets', 'Send emails/notifications', 'Query CRM/ERP data', 'Run Power Automate flows', 'Update database records', 'Generate documents', 'Escalate to human agent', 'No actions — Q&A only'];
        actionOpts.forEach(function (a) {
          var checked = planState.actions.indexOf(a) >= 0;
          html += '<label style="display:flex;gap:0.5rem;align-items:center;color:rgba(255,255,255,0.7);font-size:0.85rem;padding:0.3rem 0;cursor:pointer"><input type="checkbox" value="' + esc(a) + '"' + (checked ? ' checked' : '') + ' style="accent-color:var(--cstudio-accent)"> ' + esc(a) + '</label>';
        });
        html += '<div class="cstudio-nav-row"><button class="cstudio-btn" id="plan-back">← Back</button><button class="cstudio-btn cstudio-btn-primary" id="plan-next">Next →</button></div></div>';
        break;
      case 6:
        html += '<div class="cstudio-wizard-step active"><h3 class="cstudio-section-title">Agent architecture</h3>';
        html += '<div class="cstudio-radio-group">';
        [['single', 'Single agent — one agent handles everything'], ['child', 'Parent + child agents — logical grouping within one solution'], ['connected', 'Connected agents — independent agents working together']].forEach(function (a) {
          html += '<label class="cstudio-radio" style="flex-basis:100%"><input type="radio" name="arch" value="' + a[0] + '"' + (planState.architecture === a[0] ? ' checked' : '') + '> ' + esc(a[1]) + '</label>';
        });
        html += '</div>';
        html += '<div class="cstudio-nav-row"><button class="cstudio-btn" id="plan-back">← Back</button><button class="cstudio-btn cstudio-btn-primary" id="plan-next">Generate Plan →</button></div></div>';
        break;
      case 7:
        html += renderPlanOutput();
        break;
    }
    content.innerHTML = html;
    // Wire up events
    var nextBtn = document.getElementById('plan-next');
    var backBtn = document.getElementById('plan-back');
    if (nextBtn) nextBtn.addEventListener('click', function () {
      collectStepData();
      planState.step = Math.min(planState.step + 1, 7);
      renderPlanWizard();
    });
    if (backBtn) backBtn.addEventListener('click', function () {
      planState.step = Math.max(planState.step - 1, 1);
      renderPlanWizard();
    });
    // Role selection
    content.querySelectorAll('[data-role]').forEach(function (card) {
      card.addEventListener('click', function () { planState.role = card.dataset.role; renderPlanWizard(); });
    });
  }

  function collectStepData() {
    var content = document.getElementById('plan-wizard-content');
    if (!content) return;
    switch (planState.step) {
      case 2:
        var aud = content.querySelector('input[name="audience"]:checked');
        if (aud) planState.audience = aud.value;
        break;
      case 3:
        planState.channels = [];
        content.querySelectorAll('input[type="checkbox"]:checked').forEach(function (c) { planState.channels.push(c.value); });
        break;
      case 4:
        planState.knowledge = [];
        content.querySelectorAll('input[type="checkbox"]:checked').forEach(function (c) { planState.knowledge.push(c.value); });
        break;
      case 5:
        planState.actions = [];
        content.querySelectorAll('input[type="checkbox"]:checked').forEach(function (c) { planState.actions.push(c.value); });
        break;
      case 6:
        var arch = content.querySelector('input[name="arch"]:checked');
        if (arch) planState.architecture = arch.value;
        break;
    }
  }

  function renderPlanOutput() {
    var role = ROLES.find(function (r) { return r.id === planState.role; }) || ROLES[ROLES.length - 1];
    var complexity = planState.actions.length > 4 || planState.channels.length > 2 ? 'High' : planState.actions.length > 1 ? 'Medium' : 'Low';
    var model = complexity === 'High' ? 'ChatGPT-5 or Claude Sonnet 4.6' : complexity === 'Medium' ? 'GPT-4.1' : 'GPT-4.1 mini (default)';
    var html = '<div class="cstudio-wizard-step active">';
    html += '<h3 class="cstudio-section-title">Your Agent Plan</h3>';
    html += '<div class="cstudio-card" style="border-color:var(--cstudio-accent)">';
    html += '<div class="cstudio-card-title" style="font-size:1.1rem">' + esc(role.icon) + ' ' + esc(role.name) + '</div>';
    html += '<div class="cstudio-limit-row"><span class="cstudio-limit-label">Complexity</span><span class="cstudio-limit-value">' + esc(complexity) + '</span></div>';
    html += '<div class="cstudio-limit-row"><span class="cstudio-limit-label">Audience</span><span class="cstudio-limit-value">' + esc(planState.audience || 'Not specified') + '</span></div>';
    html += '<div class="cstudio-limit-row"><span class="cstudio-limit-label">Channels</span><span class="cstudio-limit-value">' + (planState.channels.length ? planState.channels.join(', ') : 'Teams') + '</span></div>';
    html += '<div class="cstudio-limit-row"><span class="cstudio-limit-label">Knowledge</span><span class="cstudio-limit-value" style="font-size:0.72rem">' + (planState.knowledge.length ? planState.knowledge.join(', ') : 'None specified') + '</span></div>';
    html += '<div class="cstudio-limit-row"><span class="cstudio-limit-label">Actions</span><span class="cstudio-limit-value" style="font-size:0.72rem">' + (planState.actions.length ? planState.actions.join(', ') : 'Q&A only') + '</span></div>';
    html += '<div class="cstudio-limit-row"><span class="cstudio-limit-label">Architecture</span><span class="cstudio-limit-value">' + esc(planState.architecture) + '</span></div>';
    html += '<div class="cstudio-limit-row"><span class="cstudio-limit-label">Recommended model</span><span class="cstudio-limit-value">' + esc(model) + '</span></div>';
    html += '</div>';
    html += '<div class="cstudio-export-row" style="margin-top:1rem">';
    html += '<button class="cstudio-btn cstudio-btn-primary" id="plan-copy">Copy Plan</button>';
    html += '<button class="cstudio-btn" id="plan-download">Download .md</button>';
    html += '<button class="cstudio-btn" id="plan-restart">Start Over</button>';
    html += '</div></div>';
    return html;
  }

  /* ═══ TAB 4: BLUEPRINT ═══ */
  var topics = [];

  function renderBlueprint() {
    var el = document.getElementById('topic-map');
    if (!el) return;
    var html = '<div id="topic-list">';
    topics.forEach(function (t, i) {
      html += '<div class="cstudio-topic-item" data-idx="' + i + '">';
      html += '<span class="cstudio-topic-name">' + esc(t.name) + '</span>';
      html += '<span class="cstudio-topic-meta">' + (t.triggers || []).length + ' triggers</span>';
      html += '<button class="cstudio-topic-remove" data-idx="' + i + '" aria-label="Remove topic">×</button>';
      html += '</div>';
    });
    html += '</div>';
    html += '<div style="display:flex;gap:0.5rem;margin-top:0.75rem">';
    html += '<input type="text" id="new-topic-name" class="cstudio-input" placeholder="Topic name (e.g. Password Reset)" style="flex:1" aria-label="New topic name">';
    html += '<button class="cstudio-btn cstudio-btn-primary" id="btn-add-topic">Add Topic</button>';
    html += '</div>';
    el.innerHTML = html;
    var addBtn = document.getElementById('btn-add-topic');
    var nameInput = document.getElementById('new-topic-name');
    if (addBtn && nameInput) {
      addBtn.addEventListener('click', function () {
        var name = nameInput.value.trim();
        if (!name) return;
        topics.push({ name: name, triggers: [], intent: '', actions: [] });
        nameInput.value = '';
        renderBlueprint();
      });
      nameInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') addBtn.click(); });
    }
    var list = document.getElementById('topic-list');
    if (list) list.addEventListener('click', function (e) {
      var rm = e.target.closest('.cstudio-topic-remove');
      if (rm) { topics.splice(parseInt(rm.dataset.idx), 1); renderBlueprint(); }
    });
  }

  function renderIntegrationChecklist() {
    var el = document.getElementById('integration-checklist');
    if (!el) return;
    var items = [
      'Dataverse environment created and configured',
      'DLP policies reviewed for Power Platform',
      'Authentication method decided (SSO / Manual / None)',
      'Knowledge sources identified and accessible',
      'Connectors identified and tested',
      'Power Automate flows designed (if needed)',
      'Fallback / escalation path defined',
      'Test scenarios documented',
      'Stakeholder approval obtained',
      'Analytics requirements defined'
    ];
    var html = '';
    items.forEach(function (item, i) {
      html += '<label style="display:flex;gap:0.5rem;align-items:center;color:rgba(255,255,255,0.7);font-size:0.85rem;padding:0.4rem 0;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.04)"><input type="checkbox" id="int-check-' + i + '" style="accent-color:var(--cstudio-accent)"> ' + esc(item) + '</label>';
    });
    el.innerHTML = html;
  }

  /* ═══ TAB 5: LICENSING ═══ */
  function renderCreditsExplainer() {
    var el = document.getElementById('credits-explainer');
    if (!el) return;
    var html = '<div class="cstudio-grid-3">';
    CREDIT_RATES.forEach(function (cr) {
      html += '<div class="cstudio-card" style="text-align:center">';
      html += '<div style="font-size:2rem;font-weight:800;color:var(--cstudio-accent)">' + cr.rate + '</div>';
      html += '<div style="color:#fff;font-weight:600;font-size:0.85rem">' + esc(cr.type) + '</div>';
      html += '<div style="color:rgba(255,255,255,0.5);font-size:0.75rem;margin-top:0.3rem">' + esc(cr.example) + '</div>';
      html += '</div>';
    });
    html += '</div>';
    el.innerHTML = html;
  }

  function renderCreditsEstimator() {
    var el = document.getElementById('credits-estimator');
    if (!el) return;
    var html = '<div class="cstudio-estimator">';
    html += '<div class="cstudio-field"><label for="est-convos">Conversations per day</label>';
    html += '<input type="range" id="est-convos" min="1" max="2000" value="50" class="cstudio-input" style="padding:0"> <span id="est-convos-val" style="color:#fff;font-weight:600">50</span></div>';
    html += '<div class="cstudio-field"><label for="est-msgs">Messages per conversation</label>';
    html += '<input type="range" id="est-msgs" min="1" max="15" value="4" class="cstudio-input" style="padding:0"> <span id="est-msgs-val" style="color:#fff;font-weight:600">4</span></div>';
    html += '<div class="cstudio-field"><label for="est-genai">% using Generative AI</label>';
    html += '<input type="range" id="est-genai" min="0" max="100" value="60" class="cstudio-input" style="padding:0"> <span id="est-genai-val" style="color:#fff;font-weight:600">60%</span></div>';
    html += '<div class="cstudio-estimator-result" id="est-result"></div>';
    html += '</div>';
    el.innerHTML = html;
    function calc() {
      var convos = parseInt(document.getElementById('est-convos').value);
      var msgs = parseInt(document.getElementById('est-msgs').value);
      var genai = parseInt(document.getElementById('est-genai').value);
      document.getElementById('est-convos-val').textContent = convos;
      document.getElementById('est-msgs-val').textContent = msgs;
      document.getElementById('est-genai-val').textContent = genai + '%';
      var totalMsgs = convos * 30 * msgs;
      var genaiMsgs = Math.round(totalMsgs * genai / 100);
      var regularMsgs = totalMsgs - genaiMsgs;
      var credits = regularMsgs * 1 + genaiMsgs * 2;
      var included = 25000;
      var pct = Math.min(Math.round(credits / included * 100), 200);
      var barClass = pct > 100 ? 'over' : pct > 80 ? 'warn' : '';
      var resultEl = document.getElementById('est-result');
      if (resultEl) {
        resultEl.innerHTML = '<div class="cstudio-big-number">' + credits.toLocaleString() + '</div>' +
          '<div class="cstudio-small-text">estimated Copilot Credits / month</div>' +
          '<div class="cstudio-bar"><div class="cstudio-bar-fill ' + barClass + '" style="width:' + Math.min(pct, 100) + '%"></div></div>' +
          '<div class="cstudio-small-text" style="margin-top:0.3rem">' + pct + '% of included 25,000 credits' +
          (credits > included ? ' — <span style="color:#f87171">⚠ Additional packs or pay-as-you-go needed</span>' : ' — <span style="color:#4ade80">✅ Within included allocation</span>') + '</div>';
      }
    }
    ['est-convos', 'est-msgs', 'est-genai'].forEach(function (id) {
      document.getElementById(id).addEventListener('input', calc);
    });
    calc();
  }

  function renderLicenceComparison() {
    var el = document.getElementById('licence-comparison');
    if (!el) return;
    var html = '<div class="cstudio-grid-2">';
    LICENCES.forEach(function (lic) {
      html += '<div class="cstudio-card">';
      html += '<div class="cstudio-card-title">' + esc(lic.name) + '</div>';
      if (lic.price_usd !== undefined && lic.price_usd !== '') html += '<div style="color:var(--cstudio-accent);font-size:1.2rem;font-weight:800">$' + esc(lic.price_usd) + '<span style="font-size:0.7rem;color:rgba(255,255,255,0.4)">/user/mo</span></div>';
      else if (lic.price_note) html += '<div style="color:rgba(255,255,255,0.5);font-size:0.78rem">' + esc(lic.price_note) + '</div>';
      if (lic.credits_per_month > 0) html += '<div style="color:#fff;font-size:0.82rem;margin-top:0.3rem">' + lic.credits_per_month.toLocaleString() + ' credits/month</div>';
      html += '<div style="margin-top:0.5rem">';
      (lic.includes || []).forEach(function (inc) {
        html += '<div style="color:rgba(255,255,255,0.5);font-size:0.72rem;padding:0.1rem 0">• ' + esc(inc) + '</div>';
      });
      html += '</div>';
      if (lic.notes) html += '<div style="color:rgba(255,255,255,0.35);font-size:0.7rem;font-style:italic;margin-top:0.4rem">' + esc(lic.notes) + '</div>';
      html += '</div>';
    });
    html += '</div>';
    el.innerHTML = html;
  }

  /* ═══ INIT ═══ */
  function init() {
    initTabs();
    // Tab 1
    renderFeatureChecker();
    renderUpgradeTriggers();
    renderPlatformCards();
    // Tab 2
    renderKnowledge();
    renderModels();
    renderAgentTypes();
    renderQuotas();
    renderCapabilities();
    // Tab 3
    renderPlanWizard();
    // Tab 4
    renderBlueprint();
    renderIntegrationChecklist();
    // Tab 5
    renderCreditsExplainer();
    renderCreditsEstimator();
    renderLicenceComparison();

    // Blueprint export
    var exportBtn = document.getElementById('btn-export-blueprint');
    if (exportBtn) exportBtn.addEventListener('click', function () {
      var md = '# Agent Blueprint\n\n## Topics\n';
      topics.forEach(function (t) { md += '- ' + t.name + '\n'; });
      md += '\n## Integration Checklist\n';
      document.querySelectorAll('[id^="int-check-"]').forEach(function (cb) {
        md += (cb.checked ? '- [x] ' : '- [ ] ') + cb.parentElement.textContent.trim() + '\n';
      });
      var blob = new Blob([md], { type: 'text/markdown' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = 'agent-blueprint.md'; a.click(); URL.revokeObjectURL(a.href);
    });
    var copyBpBtn = document.getElementById('btn-copy-blueprint');
    if (copyBpBtn) copyBpBtn.addEventListener('click', function () {
      var md = '# Agent Blueprint\n\n## Topics\n';
      topics.forEach(function (t) { md += '- ' + t.name + '\n'; });
      if (navigator.clipboard) navigator.clipboard.writeText(md).then(function () { toast('Copied!'); });
    });

    // Plan copy/download/restart
    document.addEventListener('click', function (e) {
      if (e.target.id === 'plan-copy') {
        var text = 'Agent Plan: ' + planState.role + '\nAudience: ' + planState.audience + '\nChannels: ' + planState.channels.join(', ') + '\nKnowledge: ' + planState.knowledge.join(', ') + '\nActions: ' + planState.actions.join(', ') + '\nArchitecture: ' + planState.architecture;
        if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { toast('Copied!'); });
      }
      if (e.target.id === 'plan-download') {
        var md = '# Agent Plan\n\n- Role: ' + planState.role + '\n- Audience: ' + planState.audience + '\n- Channels: ' + planState.channels.join(', ') + '\n- Knowledge: ' + planState.knowledge.join(', ') + '\n- Actions: ' + planState.actions.join(', ') + '\n- Architecture: ' + planState.architecture + '\n';
        var blob = new Blob([md], { type: 'text/markdown' });
        var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'agent-plan.md'; a.click(); URL.revokeObjectURL(a.href);
      }
      if (e.target.id === 'plan-restart') {
        planState = { step: 1, role: '', audience: '', channels: [], knowledge: [], actions: [], architecture: 'single' };
        renderPlanWizard();
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
