/* ═══════════════════════════════════════════════════════════════
   Copilot Studio Companion — JS (v3)
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  function toast(msg) {
    var t = document.getElementById('cscomp-toast');
    if (!t) { t = document.createElement('div'); t.id = 'cscomp-toast'; t.className = 'cscomp-toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 2200);
  }

  /* ═══ TABS with deep links (#11) ═══ */
  function initTabs() {
    document.querySelectorAll('.cscomp-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        activateTab(tab.dataset.tab);
      });
    });
    // Restore from hash or localStorage
    var hash = window.location.hash.replace('#', '');
    var target = hash || null;
    try { if (!target) target = localStorage.getItem('cscomp-tab'); } catch (e) {}
    if (target) {
      var btn = document.querySelector('.cscomp-tab[data-tab="' + target + '"]');
      if (btn) activateTab(target);
    }
  }

  function activateTab(tabId) {
    document.querySelectorAll('.cscomp-tab').forEach(function (t) {
      t.classList.remove('active'); t.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.cscomp-panel').forEach(function (p) { p.classList.remove('active'); });
    var tab = document.querySelector('.cscomp-tab[data-tab="' + tabId + '"]');
    var panel = document.getElementById('panel-' + tabId);
    if (tab) { tab.classList.add('active'); tab.setAttribute('aria-selected', 'true'); }
    if (panel) panel.classList.add('active');
    try { localStorage.setItem('cscomp-tab', tabId); } catch (e) {}
    if (history.replaceState) history.replaceState(null, null, '#' + tabId);
  }

  /* ═══ PERSONA SWITCHER (#8) ═══ */
  function initPersona() {
    var bar = document.getElementById('persona-bar');
    if (!bar) return;
    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('.cscomp-persona-btn');
      if (!btn) return;
      bar.querySelectorAll('.cscomp-persona-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      document.body.dataset.persona = btn.dataset.persona;
      try { localStorage.setItem('cscomp-persona', btn.dataset.persona); } catch (e) {}
    });
    try {
      var saved = localStorage.getItem('cscomp-persona');
      if (saved) { var btn = bar.querySelector('[data-persona="' + saved + '"]'); if (btn) btn.click(); }
    } catch (e) {}
  }

  /* ═══ PAGE SEARCH (#12) ═══ */
  function initSearch() {
    var input = document.getElementById('cscomp-search');
    var results = document.getElementById('cscomp-search-results');
    if (!input || !results) return;

    var searchableItems = [];
    document.querySelectorAll('.cscomp-cap-section, .cscomp-gov-section, .cscomp-scenario-card, .cscomp-faq-item, .cscomp-antipattern-card, .cscomp-prereq-card, .cscomp-connector-card, .cscomp-pattern-detail').forEach(function (el) {
      searchableItems.push({ el: el, text: el.textContent.toLowerCase(), panel: el.closest('.cscomp-panel') });
    });

    input.addEventListener('input', function () {
      var q = input.value.toLowerCase().trim();
      if (q.length < 2) { results.style.display = 'none'; return; }

      var hits = [];
      searchableItems.forEach(function (item) {
        if (item.text.indexOf(q) !== -1) {
          var title = item.el.querySelector('h3, strong, summary strong');
          var panelId = item.panel ? item.panel.id.replace('panel-', '') : '';
          hits.push({ title: title ? title.textContent.trim() : 'Match', tab: panelId, el: item.el });
        }
      });

      if (hits.length === 0) {
        results.innerHTML = '<div class="cscomp-search-hit">No results found</div>';
      } else {
        results.innerHTML = hits.slice(0, 8).map(function (h) {
          return '<div class="cscomp-search-hit" data-tab="' + esc(h.tab) + '" data-id="' + (h.el.id || '') + '">' + esc(h.title) + ' <small>' + esc(h.tab) + '</small></div>';
        }).join('');
      }
      results.style.display = 'block';
    });

    results.addEventListener('click', function (e) {
      var hit = e.target.closest('.cscomp-search-hit');
      if (!hit) return;
      var tab = hit.dataset.tab;
      if (tab) activateTab(tab);
      var id = hit.dataset.id;
      if (id) { var el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      results.style.display = 'none'; input.value = '';
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.cscomp-search-bar')) results.style.display = 'none';
    });
  }

  /* ═══ EVALUATOR (Tab 1) ═══ */
  function initEvaluator() {
    var checks = document.querySelectorAll('.cscomp-eval-check');
    if (!checks.length) return;
    checks.forEach(function (cb) {
      cb.addEventListener('change', function () {
        var row = cb.closest('.cscomp-eval-row');
        if (cb.checked) { row.classList.add('checked'); } else { row.classList.remove('checked'); }
        updateEvaluator();
      });
    });
  }

  function updateEvaluator() {
    var checks = document.querySelectorAll('.cscomp-eval-check');
    var scores = { ab: { green: 0, amber: 0, red: 0 }, cs: { green: 0, amber: 0, red: 0 }, af: { green: 0, amber: 0, red: 0 } };
    var active = 0;
    checks.forEach(function (cb) {
      var row = cb.closest('.cscomp-eval-row');
      var dots = row.querySelectorAll('.cscomp-dot');
      if (cb.checked) {
        active++;
        scores.ab[cb.dataset.ab]++; scores.cs[cb.dataset.cs]++; scores.af[cb.dataset.af]++;
        dots[0].className = 'cscomp-dot ' + cb.dataset.ab;
        dots[1].className = 'cscomp-dot ' + cb.dataset.cs;
        dots[2].className = 'cscomp-dot ' + cb.dataset.af;
      } else {
        dots.forEach(function (d) { d.className = 'cscomp-dot'; });
      }
    });
    var verdict = document.getElementById('eval-verdict');
    if (!verdict) return;
    if (active === 0) { verdict.innerHTML = '<p>Toggle features above to see which platform fits your needs.</p>'; return; }
    verdict.innerHTML = buildVerdict(scores, active);
  }

  function buildVerdict(scores, total) {
    var abRed = scores.ab.red, csRed = scores.cs.red, afRed = scores.af.red;
    var parts = ['<div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-bottom:0.75rem">'];
    parts.push(platCard('Agent Builder', total - abRed, total, '#22c55e'));
    parts.push(platCard('Copilot Studio', total - csRed, total, '#9055E3'));
    parts.push(platCard('AI Foundry', total - afRed, total, '#38bdf8'));
    parts.push('</div>');
    if (abRed === 0 && csRed === 0) {
      parts.push('<p><strong>✅ Agent Builder</strong> can handle everything — start there.</p>');
      parts.push('<div style="text-align:center;margin-top:0.5rem"><a href="/agent-builder-guide/" style="color:#22c55e;font-size:0.82rem;font-weight:600">→ Open Agent Builder Guide</a></div>');
    } else if (csRed === 0 && abRed > 0) {
      parts.push('<p><strong>⚙️ Copilot Studio</strong> is the best fit — ' + abRed + ' feature' + (abRed > 1 ? 's' : '') + ' need Studio.</p>');
      parts.push('<div style="text-align:center;margin-top:0.5rem"><a href="https://copilotstudio.microsoft.com" target="_blank" style="color:#9055E3;font-size:0.82rem;font-weight:600">→ Open Copilot Studio</a></div>');
    } else if (afRed === 0 && csRed > 0) {
      parts.push('<p><strong>☁️ Azure AI Foundry</strong> may be needed — ' + csRed + ' requirement' + (csRed > 1 ? 's' : '') + ' go beyond Studio.</p>');
    } else {
      parts.push('<p><strong>⚙️ Copilot Studio</strong> covers most needs — check red dots for gaps.</p>');
    }
    return parts.join('');
  }

  function platCard(name, supported, total, color) {
    var pct = total > 0 ? Math.round((supported / total) * 100) : 0;
    return '<div style="text-align:center;min-width:100px"><div style="font-size:1.5rem;font-weight:700;color:' + esc(color) + '">' + pct + '%</div><div style="font-size:0.75rem;color:rgba(255,255,255,0.5)">' + esc(name) + '</div><div style="font-size:0.65rem;color:rgba(255,255,255,0.35)">' + supported + '/' + total + '</div></div>';
  }

  /* ═══ CUSTOM SCENARIO INPUT (#3) ═══ */
  function initCustomScenario() {
    var input = document.getElementById('custom-scenario');
    var result = document.getElementById('custom-scenario-result');
    if (!input || !result) return;

    var debounce;
    input.addEventListener('input', function () {
      clearTimeout(debounce);
      debounce = setTimeout(function () {
        var q = input.value.toLowerCase().trim();
        if (q.length < 3) { result.style.display = 'none'; return; }
        var cards = document.querySelectorAll('.cscomp-scenario-card');
        var best = null; var bestScore = 0;
        cards.forEach(function (card) {
          var kw = (card.dataset.keywords || '').toLowerCase();
          var words = q.split(/\s+/);
          var score = 0;
          words.forEach(function (w) { if (kw.indexOf(w) !== -1) score++; });
          if (score > bestScore) { bestScore = score; best = card; }
        });
        if (best && bestScore > 0) {
          var title = best.querySelector('h3');
          var badge = best.querySelector('.cscomp-verdict-badge');
          result.innerHTML = '<p>💡 Closest match: <strong>' + esc(title ? title.textContent : '') + '</strong> — ' + (badge ? badge.textContent : '') + '</p>';
          result.style.display = 'block';
        } else {
          result.innerHTML = '<p>No matching scenario found. Try the feature evaluator above for a custom assessment.</p>';
          result.style.display = 'block';
        }
      }, 300);
    });
  }

  /* ═══ SCENARIO FILTER ═══ */
  function initScenarioFilter() {
    var filterWrap = document.getElementById('scenario-filter');
    if (!filterWrap) return;
    filterWrap.addEventListener('click', function (e) {
      var btn = e.target.closest('.cscomp-filter-btn');
      if (!btn) return;
      filterWrap.querySelectorAll('.cscomp-filter-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var filter = btn.dataset.filter;
      document.querySelectorAll('.cscomp-scenario-card').forEach(function (card) {
        card.classList.toggle('hidden', filter !== 'all' && card.dataset.verdict !== filter);
      });
    });
  }

  /* ═══ SHAREABLE DECISION SUMMARY (#6) ═══ */
  function initShareSummary() {
    var btn = document.getElementById('btn-share-summary');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var checks = document.querySelectorAll('.cscomp-eval-check:checked');
      var md = '# Copilot Studio — Decision Summary\n\n';
      md += '## Selected Requirements (' + checks.length + ')\n';
      checks.forEach(function (cb) {
        var label = cb.closest('.cscomp-eval-label').querySelector('span');
        var ab = cb.dataset.ab, cs = cb.dataset.cs, af = cb.dataset.af;
        md += '- ' + (label ? label.textContent : '') + ' — AB: ' + ab + ' | CS: ' + cs + ' | AF: ' + af + '\n';
      });
      var verdict = document.getElementById('eval-verdict');
      if (verdict) { md += '\n## Recommendation\n' + verdict.textContent.trim() + '\n'; }
      md += '\n## Next Steps\n- Review prerequisites in the Governance tab\n- Estimate credit consumption in Plan & Estimate tab\n- Choose a design pattern from the Design Patterns tab\n';
      md += '\n---\nGenerated by Copilot Studio Companion — aguidetocloud.com/cs-companion/\n';
      try { navigator.clipboard.writeText(md).then(function () { toast('Decision summary copied!'); }); } catch (e) { toast('Copy failed'); }
    });
  }

  /* ═══ CONNECTOR EXPLORER (#15) ═══ */
  function initConnectorSearch() {
    var input = document.getElementById('connector-search');
    if (!input) return;
    input.addEventListener('input', function () {
      var q = input.value.toLowerCase().trim();
      document.querySelectorAll('.cscomp-connector-card').forEach(function (card) {
        var name = (card.dataset.name || '').toLowerCase();
        var cat = (card.dataset.cat || '').toLowerCase();
        card.classList.toggle('hidden', q.length > 0 && name.indexOf(q) === -1 && cat.indexOf(q) === -1);
      });
    });
  }

  /* ═══ PATTERN NAV ═══ */
  function initPatterns() {
    var nav = document.getElementById('pattern-nav');
    if (!nav) return;
    nav.addEventListener('click', function (e) {
      var btn = e.target.closest('.cscomp-pattern-btn');
      if (!btn) return;
      nav.querySelectorAll('.cscomp-pattern-btn').forEach(function (b) { b.classList.remove('active'); });
      document.querySelectorAll('.cscomp-pattern-detail').forEach(function (p) { p.classList.remove('active'); });
      btn.classList.add('active');
      var detail = document.getElementById('pattern-' + btn.dataset.pattern);
      if (detail) detail.classList.add('active');
    });
  }

  /* ═══ COPY PATTERN AS MARKDOWN ═══ */
  function initCopyPattern() {
    var btn = document.getElementById('btn-copy-pattern');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var active = document.querySelector('.cscomp-pattern-detail.active');
      if (!active) return;
      var title = active.querySelector('.cscomp-pattern-header p');
      var diagram = active.querySelector('.cscomp-ascii');
      var steps = active.querySelectorAll('.cscomp-pattern-steps li');
      var tips = active.querySelectorAll('.cscomp-pattern-tips li');
      var pills = active.querySelectorAll('.cscomp-component-pill');
      var md = '# ' + (title ? title.textContent.trim() : 'Design Pattern') + '\n\n';
      if (pills.length) { md += '## Components\n'; pills.forEach(function (p) { md += '- ' + p.textContent.trim() + '\n'; }); md += '\n'; }
      if (diagram) { md += '## Architecture\n```\n' + diagram.textContent + '\n```\n\n'; }
      if (steps.length) { md += '## Steps\n'; steps.forEach(function (s, i) { md += (i + 1) + '. ' + s.textContent.trim() + '\n'; }); md += '\n'; }
      if (tips.length) { md += '## Tips\n'; tips.forEach(function (t) { md += '- ' + t.textContent.trim() + '\n'; }); }
      try { navigator.clipboard.writeText(md).then(function () { toast('Pattern copied as Markdown!'); }); } catch (e) { toast('Copy failed'); }
    });
  }

  /* ═══ INTERACTIVE GOVERNANCE CHECKLISTS ═══ */
  function initChecklists() {
    var STORAGE_KEY = 'cscomp-checklist';
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (e) {}
    document.querySelectorAll('.cscomp-gov-checklist li').forEach(function (li, i) {
      var key = 'item-' + i; li.dataset.key = key;
      if (saved[key]) li.classList.add('checked');
      li.addEventListener('click', function () { li.classList.toggle('checked'); saveChecklistState(); });
    });
    function saveChecklistState() {
      var state = {};
      document.querySelectorAll('.cscomp-gov-checklist li').forEach(function (li) { if (li.classList.contains('checked')) state[li.dataset.key] = true; });
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
    }
    var exportBtn = document.getElementById('btn-export-checklist');
    if (exportBtn) exportBtn.addEventListener('click', function () {
      var md = '# Copilot Studio — Governance Checklist\n\n';
      document.querySelectorAll('.cscomp-gov-section').forEach(function (sec) {
        var title = sec.querySelector('.cscomp-gov-title');
        if (title) md += '## ' + title.textContent.trim() + '\n';
        sec.querySelectorAll('.cscomp-gov-checklist li').forEach(function (li) {
          md += '- [' + (li.classList.contains('checked') ? 'x' : ' ') + '] ' + li.textContent.trim() + '\n';
        });
        md += '\n';
      });
      try { navigator.clipboard.writeText(md).then(function () { toast('Checklists copied!'); }); } catch (e) { toast('Copy failed'); }
    });
    var resetBtn = document.getElementById('btn-reset-checklist');
    if (resetBtn) resetBtn.addEventListener('click', function () {
      document.querySelectorAll('.cscomp-gov-checklist li').forEach(function (li) { li.classList.remove('checked'); });
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      toast('Progress reset');
    });
  }

  /* ═══ PLANNER WIZARD (#1) ═══ */
  function initPlanner() {
    var wizard = document.getElementById('planner-wizard');
    if (!wizard) return;
    var currentStep = 1; var totalSteps = wizard.querySelectorAll('.cscomp-planner-question').length;
    if (totalSteps === 0) return;
    var answers = {};
    var prevBtn = document.getElementById('planner-prev');
    var nextBtn = document.getElementById('planner-next');
    if (!nextBtn) return;

    wizard.querySelectorAll('.cscomp-planner-option').forEach(function (opt) {
      opt.addEventListener('click', function () {
        var question = opt.closest('.cscomp-planner-question');
        var isMulti = question.dataset.multi === 'true';
        if (isMulti) {
          opt.classList.toggle('selected');
        } else {
          question.querySelectorAll('.cscomp-planner-option').forEach(function (o) { o.classList.remove('selected'); });
          opt.classList.add('selected');
        }
      });
    });

    nextBtn.addEventListener('click', function () {
      var q = wizard.querySelector('.cscomp-planner-question[data-step="' + currentStep + '"]');
      var selected = q.querySelectorAll('.cscomp-planner-option.selected');
      if (selected.length === 0) { toast('Please select an option'); return; }
      answers[q.dataset.id] = Array.from(selected).map(function (s) { return s.dataset.value; });

      var stepEl = wizard.querySelector('.cscomp-planner-step[data-step="' + currentStep + '"]');
      if (stepEl) { stepEl.classList.remove('active'); stepEl.classList.add('done'); }
      q.classList.remove('active');

      if (currentStep >= totalSteps) {
        wizard.style.display = 'none';
        generatePlan(answers);
        return;
      }
      currentStep++;
      var next = wizard.querySelector('.cscomp-planner-question[data-step="' + currentStep + '"]');
      var nextStep = wizard.querySelector('.cscomp-planner-step[data-step="' + currentStep + '"]');
      if (next) next.classList.add('active');
      if (nextStep) nextStep.classList.add('active');
      if (prevBtn) prevBtn.style.display = 'inline-flex';
    });

    if (prevBtn) prevBtn.addEventListener('click', function () {
      var q = wizard.querySelector('.cscomp-planner-question[data-step="' + currentStep + '"]');
      var stepEl = wizard.querySelector('.cscomp-planner-step[data-step="' + currentStep + '"]');
      q.classList.remove('active');
      if (stepEl) stepEl.classList.remove('active');
      currentStep--;
      var prev = wizard.querySelector('.cscomp-planner-question[data-step="' + currentStep + '"]');
      var prevStep = wizard.querySelector('.cscomp-planner-step[data-step="' + currentStep + '"]');
      if (prev) prev.classList.add('active');
      if (prevStep) { prevStep.classList.remove('done'); prevStep.classList.add('active'); }
      if (currentStep === 1 && prevBtn) prevBtn.style.display = 'none';
    });

    var restartBtn = document.getElementById('btn-restart-planner');
    if (restartBtn) restartBtn.addEventListener('click', function () {
      currentStep = 1; answers = {};
      wizard.style.display = 'block';
      document.getElementById('planner-output').style.display = 'none';
      wizard.querySelectorAll('.cscomp-planner-option').forEach(function (o) { o.classList.remove('selected'); });
      wizard.querySelectorAll('.cscomp-planner-step').forEach(function (s) { s.classList.remove('active', 'done'); });
      wizard.querySelectorAll('.cscomp-planner-question').forEach(function (q) { q.classList.remove('active'); });
      var first = wizard.querySelector('.cscomp-planner-step[data-step="1"]');
      var firstQ = wizard.querySelector('.cscomp-planner-question[data-step="1"]');
      if (first) first.classList.add('active');
      if (firstQ) firstQ.classList.add('active');
      if (prevBtn) prevBtn.style.display = 'none';
    });

    var copyPlanBtn = document.getElementById('btn-copy-plan');
    if (copyPlanBtn) copyPlanBtn.addEventListener('click', function () {
      var output = document.getElementById('planner-result');
      if (!output) return;
      try { navigator.clipboard.writeText(output.innerText).then(function () { toast('Plan copied!'); }); } catch (e) { toast('Copy failed'); }
    });
  }

  function generatePlan(answers) {
    var output = document.getElementById('planner-output');
    var result = document.getElementById('planner-result');
    if (!output || !result) return;

    var purposeMap = { faq: 'FAQ / Knowledge Agent', workflow: 'Workflow Automation Agent', integration: 'API Integration Agent', monitoring: 'Autonomous Monitoring Agent', support: 'Customer Support Agent' };
    var channelMap = { teams: 'Microsoft Teams', web: 'Website Widget', whatsapp: 'WhatsApp', m365: 'M365 Copilot Chat', dynamics: 'Dynamics 365 Omnichannel' };
    var intMap = { sharepoint: 'SharePoint / OneDrive', crm: 'CRM (Salesforce/Dynamics)', itsm: 'ITSM (ServiceNow/Jira)', database: 'Databases (SQL/Cosmos)', api: 'Custom REST APIs', none: 'No external systems' };

    var purpose = (answers.purpose || [])[0];
    var audience = (answers.audience || [])[0];
    var channels = answers.channels || [];
    var integrations = answers.integrations || [];
    var complexity = (answers.complexity || [])[0];

    var html = '';
    html += '<div class="cscomp-plan-section"><h4>📋 Purpose</h4><p>' + esc(purposeMap[purpose] || purpose) + '</p></div>';
    html += '<div class="cscomp-plan-section"><h4>👥 Audience & Channels</h4><p>Audience: ' + esc(audience) + '</p><ul>' + channels.map(function (c) { return '<li>' + esc(channelMap[c] || c) + '</li>'; }).join('') + '</ul></div>';
    html += '<div class="cscomp-plan-section"><h4>🔌 Integrations</h4><ul>' + integrations.map(function (i) { return '<li>' + esc(intMap[i] || i) + '</li>'; }).join('') + '</ul></div>';

    var platform = 'Copilot Studio';
    if (purpose === 'faq' && integrations.indexOf('none') !== -1 && complexity === 'simple') platform = 'Agent Builder (simpler option)';

    html += '<div class="cscomp-plan-section"><h4>🎯 Recommended Platform</h4><p><strong>' + esc(platform) + '</strong></p></div>';

    var nextSteps = ['Set up Power Platform environment (Dev/Test/Prod)', 'Review DLP policies for required connectors', 'Choose AI model (Mini for FAQ, General for workflows)'];
    if (audience === 'external' || audience === 'both') nextSteps.push('Configure web channel security');
    if (channels.indexOf('teams') !== -1) nextSteps.push('Submit to org app catalogue for admin approval');
    if (integrations.indexOf('crm') !== -1 || integrations.indexOf('itsm') !== -1) nextSteps.push('Set up Premium connector licensing');
    html += '<div class="cscomp-plan-section"><h4>🚀 Next Steps</h4><ol>' + nextSteps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol></div>';

    result.innerHTML = html;
    output.style.display = 'block';
    output.scrollIntoView({ behavior: 'smooth' });
  }

  /* ═══ CREDIT ESTIMATOR (#2) ═══ */
  function initEstimator() {
    var sliders = ['est-convos', 'est-genai', 'est-tools', 'est-auto'];
    var allExist = sliders.every(function (id) { return document.getElementById(id); });
    if (!allExist) return;
    sliders.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', function () {
        var val = document.getElementById(id + '-val');
        if (val) val.textContent = id === 'est-genai' || id === 'est-tools' ? el.value + '%' : el.value;
        calcCredits();
      });
    });
    calcCredits();
  }

  function calcCredits() {
    var convosEl = document.getElementById('est-convos');
    var genaiEl = document.getElementById('est-genai');
    var toolsEl = document.getElementById('est-tools');
    var autoEl = document.getElementById('est-auto');
    if (!convosEl || !genaiEl || !toolsEl || !autoEl) return;

    var convos = parseInt(convosEl.value) || 0;
    var genai = parseInt(genaiEl.value) || 0;
    var tools = parseInt(toolsEl.value) || 0;
    var auto = parseInt(autoEl.value) || 0;

    var classicPerDay = Math.round(convos * (1 - genai / 100) * (1 - tools / 100));
    var genaiPerDay = Math.round(convos * (genai / 100));
    var toolsPerDay = Math.round(convos * (tools / 100));

    var dailyCredits = (classicPerDay * 1) + (genaiPerDay * 2) + (toolsPerDay * 2) + (auto * 2);
    var monthly = dailyCredits * 30;

    var el = document.getElementById('est-credits');
    var detail = document.getElementById('est-detail');
    if (el) el.textContent = monthly.toLocaleString();
    if (detail) {
      var pct = Math.round((monthly / 25000) * 100);
      var cost = (monthly * 0.01).toFixed(0);
      var status = pct <= 80 ? '✅ Within 25K prepaid pack' : pct <= 100 ? '⚠️ Close to 25K limit' : '🔴 Exceeds 25K — need PAYG or extra pack';
      detail.innerHTML = status + '<br>' + pct + '% of prepaid pack · ~$' + cost + '/mo PAYG equivalent';
    }
  }

  /* ═══ INIT ═══ */
  function init() {
    initTabs(); initPersona(); initSearch();
    initEvaluator(); initCustomScenario(); initScenarioFilter(); initShareSummary();
    initConnectorSearch(); initPatterns(); initCopyPattern(); initChecklists();
    initPlanner(); initEstimator();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
