/* ════════════════════════════════════════════════════════════════════════════
   Agent 365 Planner — JavaScript Engine (Phase 1)
   100% client-side. Zero API calls. TOML data injected via Hugo.
   ════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var D = window.__agplanData || {};
  var PASS_HASH = 'a0f4bce166a10c8e88d29f5b4a8d4d tried';

  // ── Utils ──────────────────────────────────────────────────────────────
  function esc(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }

  function lsGet(k) {
    try { return JSON.parse(localStorage.getItem(k)); } catch (_) { return null; }
  }
  function lsSet(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) { /* private browsing */ }
  }

  function $(id) { return document.getElementById(id); }

  // ── Password Gate ──────────────────────────────────────────────────────
  var GATE_KEY = 'agplan_auth_ts';
  var GATE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

  function sha256(str) {
    var buf = new TextEncoder().encode(str);
    return crypto.subtle.digest('SHA-256', buf).then(function (h) {
      return Array.from(new Uint8Array(h)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    });
  }

  function unlockDashboard() {
    var gate = $('agplan-gate');
    var dash = $('agplan-dashboard');
    if (gate) gate.style.display = 'none';
    if (dash) dash.style.display = '';
    initTool();
  }

  function checkAuth() {
    var ts = lsGet(GATE_KEY);
    if (ts && Date.now() - ts < GATE_TTL) {
      unlockDashboard();
      return;
    }
    // Show gate
    var submit = $('agplan-gate-submit');
    var input = $('agplan-gate-pass');
    var error = $('agplan-gate-error');
    if (!submit || !input) return;

    function tryUnlock() {
      var val = input.value;
      sha256(val).then(function (hash) {
        if (hash === '0579d11899d8171a96c04302aa2f2f7250adfce591e1a118f332f40c70027be8') {
          lsSet(GATE_KEY, Date.now());
          if (error) error.style.display = 'none';
          unlockDashboard();
        } else {
          if (error) error.style.display = 'block';
          input.value = '';
          input.focus();
        }
      });
    }

    submit.addEventListener('click', tryUnlock);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') tryUnlock(); });
    input.focus();
  }

  // ── Tab Switching ──────────────────────────────────────────────────────
  function initTabs() {
    var tabs = document.querySelectorAll('.agplan-tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        document.querySelectorAll('.agplan-panel').forEach(function (p) { p.classList.remove('active'); });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        var panel = $('panel-' + tab.dataset.tab);
        if (panel) panel.classList.add('active');
      });
    });
  }

  function switchToTab(tabName) {
    var tab = document.querySelector('.agplan-tab[data-tab="' + tabName + '"]');
    if (tab) tab.click();
  }

  // ── Tab 1: Overview — Persona Selector (now NAVIGATES to tabs) ───────
  function initPersonaSelector() {
    var cards = document.querySelectorAll('.agplan-persona-card');
    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        var goto = card.dataset.goto;
        if (goto) {
          cards.forEach(function (c) { c.classList.remove('active'); });
          card.classList.add('active');
          lsSet('agplan_persona', card.dataset.persona);
          // Navigate to the target tab
          setTimeout(function () { switchToTab(goto); }, 200);
        }
      });
    });
    // Highlight saved persona (but don't navigate)
    var saved = lsGet('agplan_persona');
    if (saved) {
      cards.forEach(function (c) { c.classList.toggle('active', c.dataset.persona === saved); });
    }

    // "Go to assessment" CTA
    var gotoBtn = $('agplan-goto-assessment');
    if (gotoBtn) gotoBtn.addEventListener('click', function () { switchToTab('assessment'); });
  }

  // ── Tab 2: Readiness Assessment ────────────────────────────────────────
  var assess = {
    questions: [],
    answers: {},
    currentIdx: 0,
    pillars: [],
    advanceTimer: null
  };
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function flattenAssessment() {
    if (!D.assessment || !D.assessment.pillars) return;
    assess.pillars = D.assessment.pillars;
    assess.questions = [];
    D.assessment.pillars.forEach(function (pillar) {
      (pillar.questions || []).forEach(function (q) {
        assess.questions.push({
          id: q.id,
          text: q.text,
          options: q.options,
          recommendation_low: q.recommendation_low,
          recommendation_high: q.recommendation_high,
          learn_url: q.learn_url,
          pillarId: pillar.id,
          pillarName: pillar.name,
          pillarIcon: pillar.icon
        });
      });
    });
    // Restore saved answers
    var saved = lsGet('agplan_assess_answers');
    if (saved) assess.answers = saved;
  }

  function renderAssessQuestion() {
    var q = assess.questions[assess.currentIdx];
    if (!q) return;
    var total = assess.questions.length;
    var pctW = ((assess.currentIdx + 1) / total) * 100;

    var fill = $('agplan-progress-fill');
    var text = $('agplan-progress-text');
    if (fill) fill.style.width = pctW + '%';
    if (text) text.textContent = 'Question ' + (assess.currentIdx + 1) + ' of ' + total;

    var pIcon = $('agplan-pillar-icon');
    var pName = $('agplan-pillar-name');
    if (pIcon) pIcon.textContent = q.pillarIcon;
    if (pName) pName.textContent = q.pillarName;

    var qText = $('agplan-question-text');
    if (qText) qText.textContent = q.text;

    var optWrap = $('agplan-options');
    if (!optWrap) return;
    optWrap.innerHTML = '';
    q.options.forEach(function (opt, i) {
      var btn = document.createElement('button');
      btn.className = 'agplan-option';
      btn.textContent = opt.label;
      if (assess.answers[q.id] === i) btn.classList.add('selected');
      btn.addEventListener('click', function () {
        assess.answers[q.id] = i;
        lsSet('agplan_assess_answers', assess.answers);
        optWrap.querySelectorAll('.agplan-option').forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        $('agplan-next-btn').disabled = false;
        // Auto-advance after short delay (skip if reduced motion)
        if (assess.advanceTimer) clearTimeout(assess.advanceTimer);
        if (!prefersReducedMotion) {
          assess.advanceTimer = setTimeout(function () {
            assess.advanceTimer = null;
            advanceAssessment();
          }, 400);
        }
      });
      optWrap.appendChild(btn);
    });

    $('agplan-prev-btn').disabled = assess.currentIdx === 0;
    $('agplan-next-btn').disabled = assess.answers[q.id] === undefined;
  }

  function advanceAssessment() {
    if (assess.currentIdx < assess.questions.length - 1) {
      assess.currentIdx++;
      renderAssessQuestion();
    } else {
      showAssessResults();
    }
  }

  function showAssessResults() {
    var ui = $('agplan-assess-ui');
    var results = $('agplan-assess-results');
    if (ui) ui.style.display = 'none';
    if (results) results.hidden = false;

    // Calculate scores per pillar
    var pillarScores = {};
    assess.pillars.forEach(function (p) { pillarScores[p.id] = { earned: 0, max: 0, name: p.name, icon: p.icon }; });

    var totalEarned = 0;
    var totalMax = 0;
    assess.questions.forEach(function (q) {
      var ansIdx = assess.answers[q.id];
      var pts = (ansIdx !== undefined && q.options[ansIdx]) ? q.options[ansIdx].value : 0;
      var maxPts = Math.max.apply(null, q.options.map(function (o) { return o.value; }));
      if (pillarScores[q.pillarId]) {
        pillarScores[q.pillarId].earned += pts;
        pillarScores[q.pillarId].max += maxPts;
      }
      totalEarned += pts;
      totalMax += maxPts;
    });

    var scaledScore = totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0;

    // Find tier
    var tiers = (D.assessment && D.assessment.tiers) || [];
    var tier = tiers.find(function (t) { return scaledScore >= t.min && scaledScore <= t.max; }) || { label: 'Unknown', emoji: '❓', description: '' };

    // Animate score ring
    var ringFg = $('agplan-ring-fg');
    if (ringFg) {
      var circumference = 2 * Math.PI * 52; // r=52
      var offset = circumference - (scaledScore / 100) * circumference;
      setTimeout(function () { ringFg.style.strokeDashoffset = offset; }, 100);
    }

    var scoreNum = $('agplan-score-number');
    if (scoreNum) animateNumber(scoreNum, 0, scaledScore, 800);

    var scoreLabel = $('agplan-score-label');
    if (scoreLabel) scoreLabel.textContent = tier.emoji + ' ' + tier.label;

    var scoreDesc = $('agplan-score-desc');
    if (scoreDesc) scoreDesc.textContent = tier.description;

    // Pillar bars
    var barsList = $('agplan-pillar-bars-list');
    if (barsList) {
      barsList.innerHTML = '';
      assess.pillars.forEach(function (p) {
        var ps = pillarScores[p.id];
        var pct = ps.max > 0 ? Math.round((ps.earned / ps.max) * 100) : 0;
        var row = document.createElement('div');
        row.className = 'agplan-pillar-bar-row';
        row.innerHTML = '<span class="agplan-pillar-bar-label">' + esc(p.icon + ' ' + p.name) + '</span>' +
          '<div class="agplan-pillar-bar-track"><div class="agplan-pillar-bar-fill" style="width:0"></div></div>' +
          '<span class="agplan-pillar-bar-pct">' + pct + '%</span>';
        barsList.appendChild(row);
        setTimeout(function () {
          row.querySelector('.agplan-pillar-bar-fill').style.width = pct + '%';
        }, 200);
      });
    }

    // Recommendations
    var recsList = $('agplan-recs-list');
    if (recsList) {
      recsList.innerHTML = '';
      assess.questions.forEach(function (q) {
        var ansIdx = assess.answers[q.id];
        var pts = (ansIdx !== undefined && q.options[ansIdx]) ? q.options[ansIdx].value : 0;
        var maxPts = Math.max.apply(null, q.options.map(function (o) { return o.value; }));
        if (pts < maxPts) {
          var rec = document.createElement('div');
          rec.className = 'agplan-rec-item';
          rec.innerHTML = '<strong>' + esc(q.pillarName) + ':</strong> ' + esc(q.recommendation_low) +
            (q.learn_url ? ' <a href="' + esc(q.learn_url) + '" target="_blank" rel="noopener noreferrer">Learn more →</a>' : '');
          recsList.appendChild(rec);
        }
      });
      if (!recsList.children.length) {
        recsList.innerHTML = '<p style="color:rgba(255,255,255,0.5);font-size:0.88rem">Outstanding — no major gaps identified. Keep your governance strong!</p>';
      }
    }

    // Shareable URL
    var pillarPcts = assess.pillars.map(function (p) {
      var ps = pillarScores[p.id];
      return ps.max > 0 ? Math.round((ps.earned / ps.max) * 100) : 0;
    });
    assess._lastShareParams = '?score=' + scaledScore + '&pillars=' + pillarPcts.join(',');
    assess._lastPlanData = { score: scaledScore, tier: tier, pillarScores: pillarScores };
  }

  function animateNumber(el, from, to, duration) {
    if (prefersReducedMotion) { el.textContent = to; return; }
    var start = performance.now();
    function step(ts) {
      var progress = Math.min((ts - start) / duration, 1);
      el.textContent = Math.round(from + (to - from) * easeOut(progress));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function generateGovernancePlan(score, tier, pillarScores) {
    var lines = [];
    lines.push('# Agent 365 Governance Plan');
    lines.push('Generated: ' + new Date().toLocaleDateString());
    lines.push('');
    lines.push('## Overall Readiness Score: ' + score + '/100 — ' + tier.emoji + ' ' + tier.label);
    lines.push(tier.description);
    lines.push('');
    lines.push('## Pillar Breakdown');
    lines.push('');
    assess.pillars.forEach(function (p) {
      var ps = pillarScores[p.id];
      var pct = ps.max > 0 ? Math.round((ps.earned / ps.max) * 100) : 0;
      lines.push('### ' + p.icon + ' ' + p.name + ' — ' + pct + '%');
      // Per-pillar recs
      assess.questions.filter(function (q) { return q.pillarId === p.id; }).forEach(function (q) {
        var ansIdx = assess.answers[q.id];
        var pts = (ansIdx !== undefined && q.options[ansIdx]) ? q.options[ansIdx].value : 0;
        var maxPts = Math.max.apply(null, q.options.map(function (o) { return o.value; }));
        var status = pts === maxPts ? '✅' : pts > 0 ? '⚠️' : '❌';
        lines.push('- ' + status + ' ' + q.text);
        if (pts < maxPts) lines.push('  → ' + q.recommendation_low);
        if (q.learn_url) lines.push('  📚 ' + q.learn_url);
      });
      lines.push('');
    });

    lines.push('## Quick Wins (address first)');
    assess.questions.forEach(function (q) {
      var ansIdx = assess.answers[q.id];
      var pts = (ansIdx !== undefined && q.options[ansIdx]) ? q.options[ansIdx].value : 0;
      if (pts === 0) lines.push('- ❌ ' + q.text + ' (' + q.pillarName + ')');
    });
    lines.push('');
    lines.push('---');
    lines.push('Generated by Agent 365 Planner — aguidetocloud.com/agent-365-planner/');

    var md = lines.join('\n');
    var blob = new Blob([md], { type: 'text/markdown' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'agent-365-governance-plan.md';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function initAssessment() {
    flattenAssessment();
    if (!assess.questions.length) return;
    renderAssessQuestion();

    // Bind result action handlers ONCE (not per-results-render)
    var shareBtn = $('agplan-share-btn');
    if (shareBtn) shareBtn.addEventListener('click', function () {
      var url = window.location.origin + window.location.pathname + (assess._lastShareParams || '');
      navigator.clipboard.writeText(url).then(function () {
        shareBtn.textContent = '✓ Link Copied!';
        setTimeout(function () { shareBtn.textContent = 'Copy Shareable Link'; }, 2000);
      });
    });
    var downloadBtn = $('agplan-download-plan');
    if (downloadBtn) downloadBtn.addEventListener('click', function () {
      var d = assess._lastPlanData;
      if (d) generateGovernancePlan(d.score, d.tier, d.pillarScores);
    });

    var prevBtn = $('agplan-prev-btn');
    var nextBtn = $('agplan-next-btn');

    if (prevBtn) prevBtn.addEventListener('click', function () {
      if (assess.advanceTimer) { clearTimeout(assess.advanceTimer); assess.advanceTimer = null; }
      if (assess.currentIdx > 0) {
        assess.currentIdx--;
        renderAssessQuestion();
      }
    });

    if (nextBtn) nextBtn.addEventListener('click', function () {
      if (assess.advanceTimer) { clearTimeout(assess.advanceTimer); assess.advanceTimer = null; }
      advanceAssessment();
    });

    var restartBtn = $('agplan-restart-btn');
    if (restartBtn) restartBtn.addEventListener('click', function () {
      assess.answers = {};
      assess.currentIdx = 0;
      lsSet('agplan_assess_answers', null);
      var ui = $('agplan-assess-ui');
      var results = $('agplan-assess-results');
      if (ui) ui.style.display = '';
      if (results) results.hidden = true;
      renderAssessQuestion();
    });

    // Check URL for shared score
    var params = new URLSearchParams(window.location.search);
    if (params.has('score')) {
      switchToTab('assessment');
      var sharedScore = Math.max(0, Math.min(100, parseInt(params.get('score'), 10) || 0));
      var tiers = (D.assessment && D.assessment.tiers) || [];
      var tier = tiers.find(function (t) { return sharedScore >= t.min && sharedScore <= t.max; }) || {};
      var ui = $('agplan-assess-ui');
      var results = $('agplan-assess-results');
      if (ui) ui.style.display = 'none';
      if (results) results.hidden = false;

      var ringFg = $('agplan-ring-fg');
      if (ringFg) {
        var circ = 2 * Math.PI * 52;
        setTimeout(function () { ringFg.style.strokeDashoffset = circ - (sharedScore / 100) * circ; }, 100);
      }
      var scoreNum = $('agplan-score-number');
      if (scoreNum) animateNumber(scoreNum, 0, sharedScore, 800);
      var scoreLabel = $('agplan-score-label');
      if (scoreLabel) scoreLabel.textContent = (tier.emoji || '') + ' ' + (tier.label || 'Score');
      var scoreDesc = $('agplan-score-desc');
      if (scoreDesc) scoreDesc.textContent = tier.description || '';

      // Pillar bars from URL
      var pillarPcts = (params.get('pillars') || '').split(',').map(function (v) { return Math.max(0, Math.min(100, Number(v) || 0)); });
      var barsList = $('agplan-pillar-bars-list');
      if (barsList && assess.pillars.length) {
        barsList.innerHTML = '';
        assess.pillars.forEach(function (p, i) {
          var pct = pillarPcts[i] || 0;
          var row = document.createElement('div');
          row.className = 'agplan-pillar-bar-row';
          row.innerHTML = '<span class="agplan-pillar-bar-label">' + esc(p.icon + ' ' + p.name) + '</span>' +
            '<div class="agplan-pillar-bar-track"><div class="agplan-pillar-bar-fill" style="width:0"></div></div>' +
            '<span class="agplan-pillar-bar-pct">' + pct + '%</span>';
          barsList.appendChild(row);
          setTimeout(function () { row.querySelector('.agplan-pillar-bar-fill').style.width = pct + '%'; }, 200);
        });
      }
    }
  }

  // ── Tab 3: Governance Checklist ────────────────────────────────────────
  var CHECKLIST_KEY = 'agplan_checklist';
  var STATES = ['not-done', 'partial', 'done'];
  var STATE_LABELS = { 'not-done': '❌', partial: '⚠️', done: '✅' };

  function initChecklist() {
    if (!D.bestPractices || !D.bestPractices.categories) return;
    var container = $('agplan-checklist');
    if (!container) return;

    var saved = lsGet(CHECKLIST_KEY) || {};

    D.bestPractices.categories.forEach(function (cat) {
      var section = document.createElement('div');
      section.className = 'agplan-checklist-category';

      var title = document.createElement('h3');
      title.className = 'agplan-checklist-cat-title';
      title.textContent = cat.name;
      section.appendChild(title);

      if (cat.description) {
        var desc = document.createElement('p');
        desc.className = 'agplan-checklist-cat-desc';
        desc.textContent = cat.description;
        section.appendChild(desc);
      }

      (cat.items || []).forEach(function (item) {
        var state = saved[item.id] || 'not-done';
        var row = document.createElement('div');
        row.className = 'agplan-checklist-item';

        var toggle = document.createElement('button');
        toggle.className = 'agplan-checklist-toggle';
        toggle.setAttribute('data-state', state);
        toggle.setAttribute('data-id', item.id);
        toggle.textContent = STATE_LABELS[state];
        toggle.setAttribute('aria-label', 'Status: ' + state + '. Click to change.');
        toggle.addEventListener('click', function () {
          var cur = toggle.getAttribute('data-state');
          var next = STATES[(STATES.indexOf(cur) + 1) % STATES.length];
          toggle.setAttribute('data-state', next);
          toggle.textContent = STATE_LABELS[next];
          toggle.setAttribute('aria-label', 'Status: ' + next + '. Click to change.');
          saved[item.id] = next;
          lsSet(CHECKLIST_KEY, saved);
          updateChecklistScore();
        });

        var textDiv = document.createElement('div');
        textDiv.className = 'agplan-checklist-text';
        textDiv.innerHTML = '<strong>' + esc(item.text) + '</strong>' +
          (item.detail ? '<span>' + esc(item.detail) + '</span>' : '') +
          (item.learn_url ? '<br><a href="' + esc(item.learn_url) + '" target="_blank" rel="noopener noreferrer" style="color:var(--agplan-accent);font-size:0.78rem;text-decoration:none">Learn more →</a>' : '');

        row.appendChild(toggle);
        row.appendChild(textDiv);

        if (item.severity) {
          var badge = document.createElement('span');
          badge.className = 'agplan-checklist-severity agplan-severity-' + item.severity;
          badge.textContent = item.severity;
          row.appendChild(badge);
        }

        section.appendChild(row);
      });

      container.appendChild(section);
    });

    updateChecklistScore();

    // Export CSV
    var exportBtn = $('agplan-export-checklist');
    if (exportBtn) exportBtn.addEventListener('click', function () {
      var rows = ['Category,Item,Status,Severity,Learn URL'];
      D.bestPractices.categories.forEach(function (cat) {
        (cat.items || []).forEach(function (item) {
          var state = saved[item.id] || 'not-done';
          rows.push([cat.name, '"' + item.text.replace(/"/g, '""') + '"', state, item.severity || '', item.learn_url || ''].join(','));
        });
      });
      var blob = new Blob([rows.join('\n')], { type: 'text/csv' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'agent-365-governance-checklist.csv';
      a.click();
      URL.revokeObjectURL(a.href);
    });

    // Reset
    var resetBtn = $('agplan-reset-checklist');
    if (resetBtn) resetBtn.addEventListener('click', function () {
      if (!confirm('Reset all checklist items? This cannot be undone.')) return;
      saved = {};
      lsSet(CHECKLIST_KEY, saved);
      document.querySelectorAll('.agplan-checklist-toggle').forEach(function (t) {
        t.setAttribute('data-state', 'not-done');
        t.textContent = STATE_LABELS['not-done'];
      });
      updateChecklistScore();
    });
  }

  function updateChecklistScore() {
    var saved = lsGet(CHECKLIST_KEY) || {};
    var total = 0;
    var earned = 0;
    D.bestPractices.categories.forEach(function (cat) {
      (cat.items || []).forEach(function (item) {
        total += 2;
        var state = saved[item.id] || 'not-done';
        if (state === 'done') earned += 2;
        else if (state === 'partial') earned += 1;
      });
    });
    var pct = total > 0 ? Math.round((earned / total) * 100) : 0;
    var fill = $('agplan-gov-score-fill');
    var text = $('agplan-gov-score-text');
    if (fill) fill.style.width = pct + '%';
    if (text) text.textContent = pct + '% complete (' + Math.round(earned / 2) + ' of ' + Math.round(total / 2) + ' items addressed)';
  }

  // ── Tab 4: Decision Tree ───────────────────────────────────────────────
  var tree = {
    nodes: {},
    currentId: 'q1',
    history: []
  };

  function initDecisionTree() {
    if (!D.decisionTree || !D.decisionTree.nodes) return;
    D.decisionTree.nodes.forEach(function (n) { tree.nodes[n.id] = n; });
    renderTreeNode('q1');

    var restartBtn = $('agplan-tree-restart');
    if (restartBtn) restartBtn.addEventListener('click', function () {
      tree.currentId = 'q1';
      tree.history = [];
      $('agplan-tree-container').style.display = '';
      $('agplan-tree-result').hidden = true;
      $('agplan-tree-history').innerHTML = '';
      renderTreeNode('q1');
    });
  }

  function renderTreeNode(nodeId) {
    var node = tree.nodes[nodeId];
    if (!node) return;
    tree.currentId = nodeId;

    if (node.type === 'result') {
      $('agplan-tree-container').style.display = 'none';
      var resultDiv = $('agplan-tree-result');
      resultDiv.hidden = false;
      var card = $('agplan-tree-result-card');
      var steps = (node.next_steps || []).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('');
      card.innerHTML =
        '<div class="agplan-tree-result-icon">' + esc(node.icon) + '</div>' +
        '<div class="agplan-tree-result-title">' + esc(node.title) + '</div>' +
        '<div class="agplan-tree-result-desc">' + esc(node.description) + '</div>' +
        '<div class="agplan-tree-result-meta">' +
          (node.build_location ? '<span><strong>Build in:</strong> ' + esc(node.build_location) + '</span>' : '') +
          (node.licence ? '<span><strong>Licence:</strong> ' + esc(node.licence) + '</span>' : '') +
        '</div>' +
        (steps ? '<div><strong style="color:#fff;font-size:0.88rem">Next Steps:</strong><ol class="agplan-tree-result-steps">' + steps + '</ol></div>' : '') +
        (node.learn_url ? '<a href="' + esc(node.learn_url) + '" target="_blank" rel="noopener noreferrer" class="agplan-tree-result-link">Official Docs →</a>' : '');
      return;
    }

    // Question node
    var qText = $('agplan-tree-question');
    var btnWrap = $('agplan-tree-buttons');
    if (qText) qText.textContent = node.text;
    if (!btnWrap) return;
    btnWrap.innerHTML = '';

    if (node.yes) {
      var yesBtn = document.createElement('button');
      yesBtn.className = 'agplan-tree-btn agplan-tree-yes';
      yesBtn.textContent = 'Yes';
      yesBtn.addEventListener('click', function () {
        addTreeHistory(node.text, 'Yes');
        renderTreeNode(node.yes);
      });
      btnWrap.appendChild(yesBtn);
    }
    if (node.no) {
      var noBtn = document.createElement('button');
      noBtn.className = 'agplan-tree-btn agplan-tree-no';
      noBtn.textContent = 'No';
      noBtn.addEventListener('click', function () {
        addTreeHistory(node.text, 'No');
        renderTreeNode(node.no);
      });
      btnWrap.appendChild(noBtn);
    }
  }

  function addTreeHistory(question, answer) {
    tree.history.push({ q: question, a: answer });
    var historyDiv = $('agplan-tree-history');
    if (!historyDiv) return;
    var item = document.createElement('div');
    item.className = 'agplan-tree-history-item';
    item.innerHTML = '<span class="agplan-tree-history-q">' + esc(question) + '</span><span class="agplan-tree-history-a">' + esc(answer) + '</span>';
    historyDiv.appendChild(item);
  }

  // ── Init ───────────────────────────────────────────────────────────────
  function initTool() {
    initTabs();
    initPersonaSelector();
    initAssessment();
    initChecklist();
    initDecisionTree();
  }

  // ── Entry Point ────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAuth);
  } else {
    checkAuth();
  }
})();
