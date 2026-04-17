/* ═══════════════════════════════════════════════════════════════
   Agent Instruction Builder — JS
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var PLATFORMS = window.__aginstPlatforms || [];
  var TEMPLATES = window.__aginstTemplates || [];
  var PRACTICES = window.__aginstPractices || [];
  var LS_KEY = 'aginst_practices_v1';

  var state = { platform: 'm365', step: 1 };

  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  function toast(msg) {
    var t = document.getElementById('aginst-toast');
    if (!t) { t = document.createElement('div'); t.id = 'aginst-toast'; t.className = 'aginst-toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 2000);
  }

  /* ── Tabs ── */
  function initTabs() {
    document.querySelectorAll('.aginst-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.aginst-tab').forEach(function (t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        document.querySelectorAll('.aginst-panel').forEach(function (p) { p.classList.remove('active'); });
        tab.classList.add('active'); tab.setAttribute('aria-selected', 'true');
        var panel = document.getElementById('panel-' + tab.dataset.tab);
        if (panel) panel.classList.add('active');
      });
    });
  }

  /* ── Platform Picker ── */
  function renderPlatforms() {
    var grid = document.getElementById('platform-grid');
    if (!grid) return;
    var html = '';
    PLATFORMS.forEach(function (p) {
      html += '<div class="aginst-platform-card' + (p.id === state.platform ? ' selected' : '') + '" data-pid="' + esc(p.id) + '">';
      html += '<div class="aginst-pc-icon">' + esc(p.icon) + '</div>';
      html += '<div class="aginst-pc-name">' + esc(p.name) + '</div>';
      html += '<div class="aginst-pc-desc">' + esc(p.char_limit.toLocaleString()) + ' chars · ' + esc(p.format) + '</div>';
      html += '</div>';
    });
    grid.innerHTML = html;
    grid.addEventListener('click', function (e) {
      var card = e.target.closest('.aginst-platform-card');
      if (!card) return;
      state.platform = card.dataset.pid;
      grid.querySelectorAll('.aginst-platform-card').forEach(function (c) { c.classList.remove('selected'); });
      card.classList.add('selected');
    });
  }

  /* ── Wizard Steps ── */
  function showStep(n) {
    state.step = n;
    document.querySelectorAll('.aginst-step').forEach(function (s) { s.classList.remove('active'); s.style.display = 'none'; });
    var el = document.getElementById('step-' + n);
    if (el) { el.classList.add('active'); el.style.display = 'block'; }
    document.querySelectorAll('.aginst-step-dot').forEach(function (d, i) {
      d.classList.remove('active', 'done');
      if (i + 1 === n) d.classList.add('active');
      else if (i + 1 < n) d.classList.add('done');
    });
    document.querySelectorAll('.aginst-step-labels span').forEach(function (s, i) {
      s.classList.toggle('active', i + 1 === n);
    });
  }

  function showOutput() {
    document.querySelectorAll('.aginst-step').forEach(function (s) { s.classList.remove('active'); s.style.display = 'none'; });
    var out = document.getElementById('step-output');
    if (out) out.style.display = 'block';
    document.querySelectorAll('.aginst-step-dot').forEach(function (d) { d.classList.add('done'); d.classList.remove('active'); });
  }

  function initWizardNav() {
    var bk = function (id, step) { var b = document.getElementById(id); if (b) b.addEventListener('click', function () { showStep(step); }); };
    var nx = function (id, step) { var b = document.getElementById(id); if (b) b.addEventListener('click', function () { showStep(step); }); };
    nx('btn-next-1', 2); nx('btn-next-2', 3); nx('btn-next-3', 4);
    bk('btn-back-2', 1); bk('btn-back-3', 2); bk('btn-back-4', 3);

    var genBtn = document.getElementById('btn-generate');
    if (genBtn) genBtn.addEventListener('click', generateInstructions);

    var editBtn = document.getElementById('btn-edit');
    if (editBtn) editBtn.addEventListener('click', function () { showStep(4); });

    var overBtn = document.getElementById('btn-start-over');
    if (overBtn) overBtn.addEventListener('click', function () {
      document.querySelectorAll('.aginst-input').forEach(function (i) { i.value = ''; });
      document.querySelectorAll('.aginst-toggle input').forEach(function (c) {
        c.checked = c.id === 'cap-knowledge' || c.id === 'safe-pii' || c.id === 'safe-fabricate' || c.id === 'safe-escalate';
      });
      showStep(1);
    });

    var copyBtn = document.getElementById('btn-copy');
    if (copyBtn) copyBtn.addEventListener('click', function () {
      var box = document.getElementById('output-box');
      if (box && navigator.clipboard) {
        navigator.clipboard.writeText(box.textContent).then(function () { toast('Copied to clipboard'); });
      }
    });

    var dlBtn = document.getElementById('btn-download');
    if (dlBtn) dlBtn.addEventListener('click', function () {
      var box = document.getElementById('output-box');
      if (!box) return;
      var blob = new Blob([box.textContent], { type: 'text/markdown' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'agent-instructions.md';
      a.click(); URL.revokeObjectURL(a.href);
    });

    // Step dots clickable
    document.querySelectorAll('.aginst-step-dot').forEach(function (dot) {
      dot.addEventListener('click', function () { showStep(parseInt(dot.dataset.step)); });
    });
  }

  /* ── Quick Picks ── */
  function initQuickPicks() {
    document.querySelectorAll('.aginst-pick').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var roleInput = document.getElementById('agent-role');
        var audInput = document.getElementById('agent-audience');
        if (roleInput) roleInput.value = btn.dataset.role;
        if (audInput) audInput.value = btn.dataset.audience;
      });
    });
  }

  /* ── Add Example ── */
  function initAddExample() {
    var btn = document.getElementById('btn-add-example');
    if (!btn) return;
    var idx = 2;
    btn.addEventListener('click', function () {
      var container = document.getElementById('examples-container');
      var div = document.createElement('div');
      div.className = 'aginst-example-pair';
      div.dataset.idx = idx;
      div.innerHTML = '<div class="aginst-field"><label>Example question ' + (idx + 1) + '</label>' +
        '<input type="text" class="aginst-input ex-user" placeholder="User question..." maxlength="300"></div>' +
        '<div class="aginst-field"><label>Ideal response</label>' +
        '<textarea class="aginst-input ex-agent" rows="3" placeholder="Agent response..." maxlength="800"></textarea></div>';
      container.appendChild(div);
      idx++;
    });
  }

  /* ── Generate Instructions ── */
  function generateInstructions() {
    var plat = PLATFORMS.find(function (p) { return p.id === state.platform; }) || PLATFORMS[0];
    var role = (document.getElementById('agent-role') || {}).value || 'assistant';
    var audience = (document.getElementById('agent-audience') || {}).value || 'users';
    var org = (document.getElementById('org-name') || {}).value || '';
    var scopeCan = (document.getElementById('scope-can') || {}).value || '';
    var scopeCannot = (document.getElementById('scope-cannot') || {}).value || '';
    var tone = (document.querySelector('input[name="tone"]:checked') || {}).value || 'professional';
    var verbosity = (document.querySelector('input[name="verbosity"]:checked') || {}).value || 'concise';
    var format = (document.querySelector('input[name="format"]:checked') || {}).value || 'bullets';
    var unknown = (document.querySelector('input[name="unknown"]:checked') || {}).value || 'ask';
    var customRules = (document.getElementById('custom-rules') || {}).value || '';

    var caps = {
      knowledge: document.getElementById('cap-knowledge') && document.getElementById('cap-knowledge').checked,
      web: document.getElementById('cap-web') && document.getElementById('cap-web').checked,
      actions: document.getElementById('cap-actions') && document.getElementById('cap-actions').checked,
      code: document.getElementById('cap-code') && document.getElementById('cap-code').checked,
      images: document.getElementById('cap-images') && document.getElementById('cap-images').checked
    };

    var safeRules = [];
    if (document.getElementById('safe-pii') && document.getElementById('safe-pii').checked)
      safeRules.push('NEVER share, display, or infer personal information about any user.');
    if (document.getElementById('safe-fabricate') && document.getElementById('safe-fabricate').checked)
      safeRules.push('NEVER fabricate information. If you do not have the answer, say so clearly.');
    if (document.getElementById('safe-medical') && document.getElementById('safe-medical').checked)
      safeRules.push('Do NOT provide medical advice. Direct health-related questions to a qualified professional.');
    if (document.getElementById('safe-legal') && document.getElementById('safe-legal').checked)
      safeRules.push('Do NOT provide legal advice. Direct legal questions to the legal department or a qualified professional.');
    if (document.getElementById('safe-financial') && document.getElementById('safe-financial').checked)
      safeRules.push('Do NOT provide financial or investment advice.');
    if (document.getElementById('safe-escalate') && document.getElementById('safe-escalate').checked)
      safeRules.push('If the user expresses frustration, offer to connect them with a human: "I want to make sure you get the help you need. Would you like me to connect you with a team member?"');

    // Collect examples
    var examples = [];
    document.querySelectorAll('.aginst-example-pair').forEach(function (pair) {
      var u = pair.querySelector('.ex-user');
      var a = pair.querySelector('.ex-agent');
      if (u && a && u.value.trim()) {
        examples.push({ user: u.value.trim(), agent: a.value.trim() });
      }
    });

    var unknownText = '';
    if (unknown === 'ask') unknownText = 'If you are unsure about the answer, ask the user to clarify their question. Say: "Could you give me a bit more detail so I can help you better?"';
    else if (unknown === 'redirect') unknownText = 'If you CANNOT answer the question, respond with exactly: "I don\'t have that information. Let me connect you with someone who can help." Then provide the appropriate contact or escalation path.';
    else unknownText = 'If you cannot answer directly, suggest related topics you CAN help with. Say: "I\'m not able to help with that specifically, but I can help you with [related topic]. Would that be useful?"';

    var toneDesc = { professional: 'professional and clear', friendly: 'friendly and approachable', technical: 'precise and technical', casual: 'casual and conversational' };
    var verbDesc = { concise: 'Keep responses brief — aim for 2-4 sentences unless more detail is needed.', balanced: 'Provide enough detail to be helpful without being overwhelming.', detailed: 'Provide thorough, comprehensive responses with explanations.' };
    var formatDesc = { bullets: 'Use bullet points for lists and multiple items.', steps: 'Use numbered steps for any sequential instructions.', paragraphs: 'Respond in clear, well-structured paragraphs.', mixed: 'Use the most appropriate format for each response — bullets for lists, steps for processes, paragraphs for explanations.' };

    // Build the instruction text
    var lines = [];
    var isMarkdown = plat.format === 'markdown';
    var h2 = isMarkdown ? '## ' : '';
    var h3 = isMarkdown ? '### ' : '';

    // Role
    lines.push(h2 + 'Role');
    var roleText = 'You are a ' + role;
    if (org) roleText += ' for ' + org;
    roleText += '. You help ' + audience + '.';
    lines.push(roleText);
    lines.push('');

    // Scope
    if (scopeCan || scopeCannot) {
      lines.push(h2 + 'Scope');
      if (scopeCan) {
        lines.push('You CAN help with:');
        scopeCan.split(',').forEach(function (item) {
          var t = item.trim();
          if (t) lines.push('- ' + t);
        });
        lines.push('');
      }
      if (scopeCannot) {
        lines.push('You must NOT help with:');
        scopeCannot.split(',').forEach(function (item) {
          var t = item.trim();
          if (t) lines.push('- ' + t);
        });
        lines.push('');
      }
    }

    // Capabilities
    var capLines = [];
    if (caps.knowledge) capLines.push('- Search company documents and knowledge bases for accurate answers');
    if (caps.web) capLines.push('- Search the web when company docs don\'t have the answer');
    if (caps.actions) capLines.push('- Perform actions like creating tickets or sending notifications when authorised');
    if (caps.code) capLines.push('- Run code and analyse data when needed');
    if (caps.images) capLines.push('- Generate images from descriptions when requested');
    if (capLines.length) {
      lines.push(h2 + 'Capabilities');
      lines.push('You have access to these tools:');
      capLines.forEach(function (l) { lines.push(l); });
      lines.push('');
    }

    // Tone & Format
    lines.push(h2 + 'Response Style');
    lines.push('Tone: ' + (toneDesc[tone] || tone) + '.');
    lines.push(verbDesc[verbosity] || '');
    lines.push(formatDesc[format] || '');
    lines.push('');

    // Examples
    if (examples.length) {
      lines.push(h2 + 'Examples');
      examples.forEach(function (ex, i) {
        if (isMarkdown) {
          lines.push(h3 + 'Example ' + (i + 1));
          lines.push('**User:** ' + ex.user);
          lines.push('**Agent:** ' + ex.agent);
        } else {
          lines.push('Example ' + (i + 1) + ':');
          lines.push('User: ' + ex.user);
          lines.push('Agent: ' + ex.agent);
        }
        lines.push('');
      });
    }

    // Guardrails
    lines.push(h2 + 'Guardrails');
    lines.push(unknownText);
    lines.push('');
    if (safeRules.length) {
      lines.push(h3 + 'Safety Rules');
      safeRules.forEach(function (r) { lines.push('- ' + r); });
      lines.push('');
    }
    if (customRules.trim()) {
      lines.push(h3 + 'Additional Rules');
      customRules.trim().split('\n').forEach(function (r) {
        if (r.trim()) lines.push('- ' + r.trim());
      });
      lines.push('');
    }

    var output = lines.join('\n').trim();

    // Show output
    var box = document.getElementById('output-box');
    if (box) box.textContent = output;

    // Char count
    var cc = document.getElementById('char-count');
    if (cc) {
      var len = output.length;
      cc.textContent = len.toLocaleString() + ' / ' + plat.char_limit.toLocaleString() + ' chars';
      cc.className = 'aginst-char-count';
      if (len > plat.char_limit) cc.classList.add('over');
      else if (len > plat.char_limit * 0.8) cc.classList.add('warn');
    }

    // Platform tips
    var tipsEl = document.getElementById('platform-tips');
    if (tipsEl && plat.tips) {
      var html = '<h4>Tips for ' + esc(plat.name) + '</h4><ul>';
      plat.tips.forEach(function (tip) { html += '<li>' + esc(tip) + '</li>'; });
      html += '</ul>';
      if (plat.doc_url) html += '<p style="margin-top:0.5rem"><a href="' + esc(plat.doc_url) + '" target="_blank" rel="noopener noreferrer" style="color:var(--aginst-accent)">Official documentation →</a></p>';
      tipsEl.innerHTML = html;
    }

    showOutput();
  }

  /* ── Templates Tab ── */
  function renderTemplates(filter) {
    var grid = document.getElementById('tpl-grid');
    if (!grid) return;
    var filtered = filter && filter !== 'all' ? TEMPLATES.filter(function (t) { return t.category === filter; }) : TEMPLATES;
    var html = '';
    filtered.forEach(function (tpl) {
      html += '<div class="aginst-tpl-card" data-tid="' + esc(tpl.id) + '">';
      html += '<div class="aginst-tpl-icon">' + esc(tpl.icon) + '</div>';
      html += '<div class="aginst-tpl-name">' + esc(tpl.name) + '</div>';
      html += '<div class="aginst-tpl-desc">' + esc(tpl.description) + '</div>';
      html += '<div class="aginst-tpl-meta">';
      html += '<span class="aginst-tpl-badge">' + esc(tpl.category) + '</span>';
      html += '<span class="aginst-tpl-badge">' + esc(tpl.difficulty) + '</span>';
      (tpl.platforms || []).forEach(function (p) {
        var plat = PLATFORMS.find(function (x) { return x.id === p; });
        if (plat) html += '<span class="aginst-tpl-badge">' + esc(plat.icon) + '</span>';
      });
      html += '</div>';
      html += '<div class="aginst-tpl-actions">';
      html += '<button class="aginst-tpl-btn" data-action="preview" data-tid="' + esc(tpl.id) + '">Preview</button>';
      html += '<button class="aginst-tpl-btn aginst-tpl-btn-primary" data-action="use" data-tid="' + esc(tpl.id) + '">Use This Template</button>';
      html += '</div>';
      html += '</div>';
    });
    grid.innerHTML = html || '<p style="color:rgba(255,255,255,0.4)">No templates found.</p>';
  }

  function loadTemplate(tid) {
    var tpl = TEMPLATES.find(function (t) { return t.id === tid; });
    if (!tpl) return;
    // Fill wizard fields
    var r = document.getElementById('agent-role'); if (r) r.value = tpl.role.replace('{org_name}', '').replace('for . ', 'for ').replace('for  ', '').trim();
    var a = document.getElementById('agent-audience'); if (a) a.value = tpl.audience || '';
    var sc = document.getElementById('scope-can'); if (sc) sc.value = tpl.scope_can || '';
    var scn = document.getElementById('scope-cannot'); if (scn) scn.value = tpl.scope_cannot || '';
    // Tone
    var toneRadio = document.querySelector('input[name="tone"][value="' + (tpl.tone || 'professional') + '"]');
    if (toneRadio) toneRadio.checked = true;
    var verbRadio = document.querySelector('input[name="verbosity"][value="' + (tpl.verbosity || 'balanced') + '"]');
    if (verbRadio) verbRadio.checked = true;
    var fmtRadio = document.querySelector('input[name="format"][value="' + (tpl.format || 'bullets') + '"]');
    if (fmtRadio) fmtRadio.checked = true;
    // Unknown
    var unkRadio = document.querySelector('input[name="unknown"][value="' + (tpl.unknown_action || 'ask') + '"]');
    if (unkRadio) unkRadio.checked = true;
    // Examples
    var pairs = document.querySelectorAll('.aginst-example-pair');
    if (pairs[0]) {
      var u1 = pairs[0].querySelector('.ex-user'); if (u1) u1.value = tpl.example_user_1 || '';
      var a1 = pairs[0].querySelector('.ex-agent'); if (a1) a1.value = tpl.example_agent_1 || '';
    }
    if (pairs[1]) {
      var u2 = pairs[1].querySelector('.ex-user'); if (u2) u2.value = tpl.example_user_2 || '';
      var a2 = pairs[1].querySelector('.ex-agent'); if (a2) a2.value = tpl.example_agent_2 || '';
    }
    // Switch to Build tab, step 1
    document.querySelectorAll('.aginst-tab').forEach(function (t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    document.querySelectorAll('.aginst-panel').forEach(function (p) { p.classList.remove('active'); });
    var buildTab = document.querySelector('.aginst-tab[data-tab="build"]');
    if (buildTab) { buildTab.classList.add('active'); buildTab.setAttribute('aria-selected', 'true'); }
    var buildPanel = document.getElementById('panel-build');
    if (buildPanel) buildPanel.classList.add('active');
    showStep(1);
    toast('Template loaded — customise and generate');
  }

  function previewTemplate(tid) {
    var tpl = TEMPLATES.find(function (t) { return t.id === tid; });
    if (!tpl) return;
    // Quick-generate from template data using M365 format
    state.platform = (tpl.platforms && tpl.platforms[0]) || 'm365';
    loadTemplate(tid);
    generateInstructions();
  }

  function initTemplates() {
    renderTemplates('all');
    var filter = document.getElementById('tpl-cat-filter');
    if (filter) filter.addEventListener('change', function () { renderTemplates(filter.value); });
    // Event delegation
    var grid = document.getElementById('tpl-grid');
    if (grid) grid.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      var tid = btn.dataset.tid;
      if (btn.dataset.action === 'use') loadTemplate(tid);
      else if (btn.dataset.action === 'preview') previewTemplate(tid);
    });
  }

  /* ── Platform Guide ── */
  function renderPlatformCompare() {
    var el = document.getElementById('platform-compare');
    if (!el) return;
    var html = '';
    PLATFORMS.forEach(function (p) {
      html += '<div class="aginst-compare-card">';
      html += '<div class="aginst-cc-icon">' + esc(p.icon) + '</div>';
      html += '<h4>' + esc(p.name) + '</h4>';
      html += '<div class="aginst-compare-row"><span class="aginst-compare-label">Char limit</span><span class="aginst-compare-val">' + p.char_limit.toLocaleString() + '</span></div>';
      html += '<div class="aginst-compare-row"><span class="aginst-compare-label">Format</span><span class="aginst-compare-val">' + esc(p.format) + '</span></div>';
      html += '<div class="aginst-compare-row"><span class="aginst-compare-label">Knowledge</span><span class="aginst-compare-val ' + (p.supports_knowledge ? 'aginst-cc-yes' : 'aginst-cc-no') + '">' + (p.supports_knowledge ? '✅' : '—') + '</span></div>';
      html += '<div class="aginst-compare-row"><span class="aginst-compare-label">Actions</span><span class="aginst-compare-val ' + (p.supports_actions ? 'aginst-cc-yes' : 'aginst-cc-no') + '">' + (p.supports_actions ? '✅' : '—') + '</span></div>';
      html += '<div class="aginst-compare-row"><span class="aginst-compare-label">Code</span><span class="aginst-compare-val ' + (p.supports_code_interpreter ? 'aginst-cc-yes' : 'aginst-cc-no') + '">' + (p.supports_code_interpreter ? '✅' : '—') + '</span></div>';
      html += '<div class="aginst-compare-row"><span class="aginst-compare-label">Images</span><span class="aginst-compare-val ' + (p.supports_image_gen ? 'aginst-cc-yes' : 'aginst-cc-no') + '">' + (p.supports_image_gen ? '✅' : '—') + '</span></div>';
      html += '<div class="aginst-compare-row"><span class="aginst-compare-label">Deploy to</span><span class="aginst-compare-val" style="font-size:0.7rem">' + esc(p.deployment) + '</span></div>';
      html += '<div style="margin-top:0.5rem"><a href="' + esc(p.doc_url) + '" target="_blank" rel="noopener noreferrer" style="color:var(--aginst-accent);font-size:0.78rem">Docs →</a></div>';
      html += '</div>';
    });
    el.innerHTML = html;
  }

  function renderDecider() {
    var el = document.getElementById('decider-q');
    if (!el) return;
    var questions = [
      { q: 'Where do your users work?', opts: [
        { text: 'Microsoft 365 (Teams, Outlook, etc.)', scores: { m365: 3, studio: 2, chatgpt: 0, claude: 0 } },
        { text: 'Everywhere — personal and work mixed', scores: { m365: 0, studio: 0, chatgpt: 3, claude: 2 } },
        { text: 'Primarily research and writing workflows', scores: { m365: 0, studio: 0, chatgpt: 1, claude: 3 } }
      ]},
      { q: 'How complex is the workflow?', opts: [
        { text: 'Simple Q&A from company docs', scores: { m365: 3, studio: 1, chatgpt: 2, claude: 2 } },
        { text: 'Multi-step with branching logic', scores: { m365: 1, studio: 3, chatgpt: 1, claude: 0 } },
        { text: 'Just needs good conversation skills', scores: { m365: 1, studio: 0, chatgpt: 2, claude: 3 } }
      ]},
      { q: 'Do you need enterprise controls?', opts: [
        { text: 'Yes — audit logs, governance, IT-managed', scores: { m365: 3, studio: 3, chatgpt: 0, claude: 0 } },
        { text: 'Nice to have but not critical', scores: { m365: 2, studio: 1, chatgpt: 1, claude: 1 } },
        { text: 'No — personal or small team use', scores: { m365: 0, studio: 0, chatgpt: 3, claude: 2 } }
      ]}
    ];
    var answers = [null, null, null];
    function render() {
      var html = '';
      questions.forEach(function (q, qi) {
        html += '<div class="aginst-dq-card"><h4>' + (qi + 1) + '. ' + esc(q.q) + '</h4><div class="aginst-dq-opts">';
        q.opts.forEach(function (opt, oi) {
          html += '<div class="aginst-dq-opt' + (answers[qi] === oi ? ' selected' : '') + '" data-qi="' + qi + '" data-oi="' + oi + '">' + esc(opt.text) + '</div>';
        });
        html += '</div></div>';
      });
      // If all answered, show result
      if (answers[0] !== null && answers[1] !== null && answers[2] !== null) {
        var scores = { m365: 0, studio: 0, chatgpt: 0, claude: 0 };
        answers.forEach(function (a, qi) {
          var s = questions[qi].opts[a].scores;
          Object.keys(s).forEach(function (k) { scores[k] += s[k]; });
        });
        var best = Object.keys(scores).sort(function (a, b) { return scores[b] - scores[a]; })[0];
        var bestPlat = PLATFORMS.find(function (p) { return p.id === best; });
        if (bestPlat) {
          html += '<div class="aginst-dq-result">';
          html += '<div style="font-size:1.5rem">' + esc(bestPlat.icon) + '</div>';
          html += '<h4>' + esc(bestPlat.name) + '</h4>';
          html += '<p>' + esc(bestPlat.description) + '</p>';
          html += '</div>';
        }
      }
      el.innerHTML = html;
    }
    render();
    el.addEventListener('click', function (e) {
      var opt = e.target.closest('.aginst-dq-opt');
      if (!opt) return;
      answers[parseInt(opt.dataset.qi)] = parseInt(opt.dataset.oi);
      render();
    });
  }

  /* ── Best Practices ── */
  function loadChecked() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveChecked(checked) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(checked)); } catch (e) { /* private browsing */ }
  }

  function renderPractices() {
    var grid = document.getElementById('practices-grid');
    var prog = document.getElementById('practices-progress');
    if (!grid) return;
    var checked = loadChecked();
    var total = PRACTICES.length;
    var done = Object.keys(checked).filter(function (k) { return checked[k]; }).length;

    if (prog) {
      var pct = total ? Math.round((done / total) * 100) : 0;
      prog.innerHTML = '<div class="aginst-pp-bar"><div class="aginst-pp-fill" style="width:' + pct + '%"></div></div>' +
        '<span class="aginst-pp-text">' + done + '/' + total + ' checked (' + pct + '%)</span>';
    }

    // Group by category
    var groups = {};
    PRACTICES.forEach(function (p) {
      if (!groups[p.category]) groups[p.category] = [];
      groups[p.category].push(p);
    });

    var html = '';
    Object.keys(groups).forEach(function (cat) {
      html += '<div style="margin-top:1rem"><h4 style="color:rgba(255,255,255,0.5);font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.5rem">' + esc(cat) + '</h4>';
      groups[cat].forEach(function (p) {
        var isChecked = checked[p.id];
        html += '<div class="aginst-practice-card" data-pid="' + esc(p.id) + '">';
        html += '<div class="aginst-practice-header">';
        html += '<div class="aginst-practice-check' + (isChecked ? ' checked' : '') + '" data-pid="' + esc(p.id) + '"></div>';
        html += '<span class="aginst-practice-title">' + esc(p.title) + '</span>';
        html += '<span class="aginst-practice-priority ' + esc(p.priority) + '">' + esc(p.priority) + '</span>';
        html += '</div>';
        html += '<div class="aginst-practice-detail">';
        html += '<p>' + esc(p.description) + '</p>';
        if (p.example) html += '<div class="aginst-practice-example">' + esc(p.example) + '</div>';
        html += '</div></div>';
      });
      html += '</div>';
    });
    grid.innerHTML = html;
  }

  function initPractices() {
    renderPractices();
    var grid = document.getElementById('practices-grid');
    if (!grid) return;
    grid.addEventListener('click', function (e) {
      var check = e.target.closest('.aginst-practice-check');
      if (check) {
        var pid = check.dataset.pid;
        var checked = loadChecked();
        checked[pid] = !checked[pid];
        saveChecked(checked);
        renderPractices();
        return;
      }
      var header = e.target.closest('.aginst-practice-header');
      if (header && !e.target.closest('.aginst-practice-check')) {
        var card = header.closest('.aginst-practice-card');
        if (card) {
          var detail = card.querySelector('.aginst-practice-detail');
          if (detail) detail.classList.toggle('open');
        }
      }
    });
  }

  /* ── Init ── */
  function init() {
    initTabs();
    renderPlatforms();
    initWizardNav();
    initQuickPicks();
    initAddExample();
    initTemplates();
    renderPlatformCompare();
    renderDecider();
    initPractices();
    showStep(1);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
