/* ═══════════════════════════════════════════════════════════════════════════
   PROMPT LAB — Advanced Prompt Engineering
   Namespace: plab  |  Zero CDN deps  |  100% client-side
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var STORAGE_KEY = 'plab_v1';
  var T = window.__plabTechniques || [];
  var EX = window.__plabExercises || [];
  var COMBOS = window.__plabCombinations || [];
  var QUIZ = window.__plabQuiz || [];

  var S = {
    explored: {},
    exerciseDone: {},
    activeTab: 'techniques',
    labTechnique: '',
    quizStep: 0,
    quizAnswers: {}
  };

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function $(id) { return document.getElementById(id); }
  function qa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  /* ── Persistence ──────────────────────────────────────────────────────── */
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        explored: S.explored,
        exerciseDone: S.exerciseDone
      }));
    } catch (e) { /* private browsing */ }
  }

  function load() {
    try {
      var d = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (d) {
        S.explored = d.explored || {};
        S.exerciseDone = d.exerciseDone || {};
      }
    } catch (e) { /* ignore */ }
  }

  /* ── Tabs ──────────────────────────────────────────────────────────────── */
  function setupTabs() {
    qa('.plab-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tab = btn.dataset.tab;
        switchTab(tab);
      });
    });
  }

  function switchTab(tab) {
    S.activeTab = tab;
    qa('.plab-tab').forEach(function (b) {
      var isActive = b.dataset.tab === tab;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-selected', isActive);
    });
    qa('.plab-panel').forEach(function (p) {
      p.classList.toggle('active', p.id === 'panel-' + tab);
    });
    updateUrl();
  }

  /* ── URL State ─────────────────────────────────────────────────────────── */
  function updateUrl() {
    var params = new URLSearchParams();
    if (S.activeTab !== 'techniques') params.set('tab', S.activeTab);
    if (S.labTechnique) params.set('technique', S.labTechnique);
    var qs = params.toString();
    var url = window.location.pathname + (qs ? '?' + qs : '');
    history.replaceState(null, '', url);
  }

  function restoreUrl() {
    var p = new URLSearchParams(window.location.search);
    var validTabs = ['techniques', 'lab', 'combine', 'quiz', 'faq'];
    var tab = p.get('tab');
    if (tab && validTabs.indexOf(tab) !== -1) switchTab(tab);
    var tech = p.get('technique');
    if (tech && T.some(function (t) { return t.id === tech; })) {
      S.labTechnique = tech;
      var picker = $('lab-technique-picker');
      if (picker) picker.value = S.labTechnique;
      renderExercises();
      if (tab !== 'lab') switchTab('lab');
    }
  }

  /* ── Technique Cards (Learn Tab) ───────────────────────────────────────── */
  function renderTechniques() {
    var intermediate = T.filter(function (t) { return t.tier === 'intermediate'; });
    var expert = T.filter(function (t) { return t.tier === 'expert'; });
    renderTechGroup($('grid-intermediate'), intermediate);
    renderTechGroup($('grid-expert'), expert);
    updateProgress();
  }

  function renderTechGroup(container, techs) {
    if (!container) return;
    container.innerHTML = techs.map(function (t) {
      var explored = S.explored[t.id];
      var diffLabel = t.difficulty === 1 ? 'Easy' : t.difficulty === 2 ? 'Medium' : 'Hard';
      return '<div class="plab-card' + (explored ? ' explored' : '') + '" data-id="' + esc(t.id) + '">' +
        '<div class="plab-card-header">' +
          '<span class="plab-card-emoji">' + esc(t.emoji) + '</span>' +
          '<div class="plab-card-info">' +
            '<div class="plab-card-name">' + esc(t.name) + '</div>' +
            '<div class="plab-card-tagline">' + esc(t.tagline) + '</div>' +
          '</div>' +
          '<div class="plab-card-badges">' +
            (explored ? '<span class="plab-badge plab-badge-explored">✓</span>' : '') +
            '<span class="plab-badge plab-badge-diff-' + t.difficulty + '">' + diffLabel + '</span>' +
          '</div>' +
          '<span class="plab-card-chevron">▸</span>' +
        '</div>' +
        '<div class="plab-card-body">' + renderCardBody(t) + '</div>' +
      '</div>';
    }).join('');
  }

  function safeUrl(url) {
    if (!url) return '/prompt-guide/';
    if (url.charAt(0) === '/' || url.indexOf('https://') === 0 || url.indexOf('http://') === 0) return url;
    return '/prompt-guide/';
  }

  function renderCardBody(t) {
    var h = '';

    if (t.prerequisite) {
      h += '<p class="plab-prereq">Builds on: <a href="' + esc(safeUrl(t.prerequisite_url)) + '">' + esc(t.prerequisite) + '</a> from the Prompt Guide</p>';
    }

    h += '<p style="font-size:0.82rem;color:rgba(255,255,255,0.7);line-height:1.5;margin:0.5rem 0">' + esc(t.description) + '</p>';

    h += '<h4>When to Use</h4><ul class="plab-when-list">';
    (t.when_to_use || []).forEach(function (w) {
      h += '<li>' + esc(w) + '</li>';
    });
    h += '</ul>';

    h += '<h4>The Pattern</h4><div class="plab-pattern-box">' + esc(t.pattern) + '</div>';

    h += '<h4>Before & After</h4><div class="plab-ba-grid">';
    h += '<div class="plab-ba-card plab-ba-before"><div class="plab-ba-label">Before</div><div class="plab-ba-prompt">' + esc(t.before_prompt) + '</div><div class="plab-ba-note">' + esc(t.before_note) + '</div></div>';
    h += '<div class="plab-ba-card plab-ba-after"><div class="plab-ba-label">After</div><div class="plab-ba-prompt">' + esc(t.after_prompt) + '</div><div class="plab-ba-note">' + esc(t.after_note) + '</div></div>';
    h += '</div>';

    h += '<h4>Platform Tips</h4><div class="plab-platform-tips">';
    if (t.copilot_tip) h += '<div class="plab-tip"><strong>M365 Copilot</strong>' + esc(t.copilot_tip) + '</div>';
    if (t.chatgpt_tip) h += '<div class="plab-tip"><strong>ChatGPT</strong>' + esc(t.chatgpt_tip) + '</div>';
    if (t.claude_tip) h += '<div class="plab-tip"><strong>Claude</strong>' + esc(t.claude_tip) + '</div>';
    if (t.gemini_tip) h += '<div class="plab-tip"><strong>Gemini</strong>' + esc(t.gemini_tip) + '</div>';
    h += '</div>';

    h += '<div class="plab-card-actions">' +
      '<button class="plab-btn" data-action="try-lab" data-technique="' + esc(t.id) + '">Try in Lab →</button>' +
      '<button class="plab-btn-outline" data-action="copy-pattern" data-technique="' + esc(t.id) + '">Copy Pattern</button>' +
    '</div>';

    if (t.academic_name) {
      h += '<p style="font-size:0.7rem;color:rgba(255,255,255,0.3);margin-top:0.5rem">' + esc(t.academic_name) + '</p>';
    }

    return h;
  }

  function updateProgress() {
    var count = Object.keys(S.explored).length;
    var total = T.length;
    var pct = total ? Math.round((count / total) * 100) : 0;
    var fill = $('progress-fill');
    var text = $('progress-text');
    if (fill) fill.style.width = pct + '%';
    if (text) text.textContent = count + ' of ' + total + ' explored';
  }

  /* ── Lab Tab ──────────────────────────────────────────────────────────── */
  function setupLab() {
    var picker = $('lab-technique-picker');
    if (!picker) return;

    var intermediate = T.filter(function (t) { return t.tier === 'intermediate'; });
    var expert = T.filter(function (t) { return t.tier === 'expert'; });

    var optHtml = '<option value="">— Select a technique —</option>';
    optHtml += '<optgroup label="Intermediate">';
    intermediate.forEach(function (t) {
      optHtml += '<option value="' + esc(t.id) + '">' + esc(t.emoji + ' ' + t.name) + '</option>';
    });
    optHtml += '</optgroup><optgroup label="Expert">';
    expert.forEach(function (t) {
      optHtml += '<option value="' + esc(t.id) + '">' + esc(t.emoji + ' ' + t.name) + '</option>';
    });
    optHtml += '</optgroup>';
    picker.innerHTML = optHtml;

    picker.addEventListener('change', function () {
      S.labTechnique = picker.value;
      renderExercises();
      updateUrl();
    });
  }

  function renderExercises() {
    var container = $('lab-exercises');
    var empty = $('lab-empty');
    var count = $('lab-exercise-count');
    if (!container) return;

    if (!S.labTechnique) {
      container.innerHTML = '';
      if (empty) empty.style.display = '';
      if (count) count.textContent = '';
      return;
    }
    if (empty) empty.style.display = 'none';

    var exercises = EX.filter(function (e) { return e.technique_id === S.labTechnique; });
    if (count) count.textContent = exercises.length + ' exercises';

    container.innerHTML = exercises.map(function (ex, idx) {
      var diffLabel = ex.difficulty === 1 ? 'Easy' : ex.difficulty === 2 ? 'Medium' : 'Hard';
      var h = '<div class="plab-exercise" data-exercise="' + esc(ex.id) + '">';
      h += '<div class="plab-exercise-header">';
      h += '<span class="plab-badge plab-badge-diff-' + ex.difficulty + '">' + diffLabel + '</span>';
      h += '<span class="plab-exercise-title">' + esc(ex.title) + '</span>';
      h += '</div>';
      h += '<div class="plab-exercise-scenario">' + esc(ex.scenario) + '</div>';
      h += '<div class="plab-exercise-starter">' + esc(ex.starter_prompt) + '</div>';
      h += '<p class="plab-exercise-task">' + esc(ex.task) + '</p>';

      // Hints
      if (ex.hints && ex.hints.length) {
        h += '<button class="plab-hints-toggle" data-action="toggle-hints">Show hints</button>';
        h += '<ol class="plab-hints-list" style="display:none">';
        ex.hints.forEach(function (hint) { h += '<li>' + esc(hint) + '</li>'; });
        h += '</ol>';
      }

      // Textarea
      h += '<textarea class="plab-textarea" placeholder="Write your improved prompt here..." aria-label="Your prompt attempt for ' + esc(ex.title) + '" data-exercise-input="' + esc(ex.id) + '"></textarea>';

      // Criteria
      if (ex.criteria && ex.criteria.length) {
        h += '<ul class="plab-criteria" data-criteria="' + esc(ex.id) + '">';
        ex.criteria.forEach(function (c, ci) {
          h += '<li data-idx="' + ci + '">' + esc(c) + '</li>';
        });
        h += '</ul>';
      }

      // Actions
      h += '<div style="display:flex;gap:0.5rem;flex-wrap:wrap">';
      h += '<button class="plab-btn-outline" data-action="show-answer" data-exercise="' + esc(ex.id) + '">Show Sample Answer</button>';
      h += '<button class="plab-btn-outline" data-action="copy-answer" data-exercise="' + esc(ex.id) + '">Copy Sample</button>';
      h += '</div>';

      // Answer reveal
      h += '<div class="plab-answer-box" data-answer="' + esc(ex.id) + '">';
      h += '<div class="plab-answer-label">Sample Answer</div>';
      h += '<div class="plab-answer-text">' + esc(ex.sample_answer) + '</div>';
      h += '</div>';

      h += '</div>';
      return h;
    }).join('');

    setupCriteriaListeners();
  }

  function setupCriteriaListeners() {
    qa('.plab-textarea[data-exercise-input]').forEach(function (textarea) {
      textarea.addEventListener('input', function () {
        var exId = textarea.dataset.exerciseInput;
        checkCriteria(exId, textarea.value);
      });
    });
  }

  function checkCriteria(exId, text) {
    var ex = EX.find(function (e) { return e.id === exId; });
    if (!ex || !ex.keywords) return;
    var lower = text.toLowerCase();
    var criteriaEl = document.querySelector('[data-criteria="' + exId + '"]');
    if (!criteriaEl) return;

    var items = qa('li', criteriaEl);
    items.forEach(function (li, idx) {
      if (!ex.keywords[idx]) return;
      var kws = ex.keywords[idx].toLowerCase().split(',');
      var met = kws.some(function (kw) { return lower.indexOf(kw.trim()) !== -1; });
      li.classList.toggle('met', met);
    });
  }

  /* ── Combine Tab ──────────────────────────────────────────────────────── */
  function renderCombos() {
    var grid = $('combo-grid');
    if (!grid) return;

    grid.innerHTML = COMBOS.map(function (c) {
      var flowHtml = '';
      (c.techniques || []).forEach(function (tid, i) {
        var tech = T.find(function (t) { return t.id === tid; });
        var label = (c.flow_labels && c.flow_labels[i]) || (tech ? tech.name : tid);
        if (i > 0) flowHtml += '<span class="plab-combo-arrow">→</span>';
        flowHtml += '<span class="plab-combo-step">' + esc(label) + '</span>';
      });

      return '<div class="plab-combo-card" data-combo="' + esc(c.id) + '">' +
        '<div class="plab-combo-icon">' + esc(c.icon) + '</div>' +
        '<div class="plab-combo-name">' + esc(c.name) + '</div>' +
        '<div class="plab-combo-desc">' + esc(c.description) + '</div>' +
        '<div class="plab-combo-flow">' + flowHtml + '</div>' +
        '<div class="plab-combo-expanded">' +
          '<div class="plab-combo-usecase">Best for: ' + esc(c.use_case) + '</div>' +
          '<div class="plab-combo-template">' + esc(c.template) + '</div>' +
          '<button class="plab-btn" data-action="copy-combo" data-combo="' + esc(c.id) + '">Copy Template</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function setupCustomCombo() {
    var selects = ['custom-t1', 'custom-t2', 'custom-t3'].map($);
    var btn = $('btn-gen-combo');
    if (!selects[0] || !btn) return;

    var opts = '<option value="">—</option>';
    T.forEach(function (t) {
      opts += '<option value="' + esc(t.id) + '">' + esc(t.emoji + ' ' + t.name) + '</option>';
    });
    selects.forEach(function (sel) {
      if (sel) sel.innerHTML = sel === selects[2]
        ? '<option value="">(Optional) Step 3...</option>' + opts.replace('<option value="">—</option>', '')
        : opts;
    });

    function checkReady() {
      var v1 = selects[0].value, v2 = selects[1].value, v3 = selects[2] ? selects[2].value : '';
      var vals = [v1, v2, v3].filter(Boolean);
      var unique = vals.filter(function (v, i) { return vals.indexOf(v) === i; });
      var hasDupes = vals.length !== unique.length;
      btn.disabled = !v1 || !v2 || hasDupes;
      btn.textContent = hasDupes ? 'Remove duplicates first' : 'Generate Combined Template';
    }
    selects.forEach(function (sel) {
      if (sel) sel.addEventListener('change', checkReady);
    });

    btn.addEventListener('click', function () {
      var ids = selects.map(function (s) { return s ? s.value : ''; }).filter(Boolean);
      generateCustomCombo(ids);
    });
  }

  function generateCustomCombo(techIds) {
    var result = $('custom-combo-result');
    if (!result) return;

    var techs = techIds.map(function (id) {
      return T.find(function (t) { return t.id === id; });
    }).filter(Boolean);

    if (techs.length < 2) return;

    var template = techs.map(function (t, i) {
      return '--- Step ' + (i + 1) + ': ' + t.name + ' ---\n' + t.pattern;
    }).join('\n\n');

    var flowHtml = techs.map(function (t, i) {
      return (i > 0 ? ' <span class="plab-combo-arrow">→</span> ' : '') +
        '<span class="plab-combo-step">' + esc(t.emoji + ' ' + t.name) + '</span>';
    }).join('');

    result.innerHTML = '<div class="plab-combo-flow" style="margin-bottom:0.75rem">' + flowHtml + '</div>' +
      '<div class="plab-combo-template">' + esc(template) + '</div>' +
      '<button class="plab-btn" data-action="copy-custom">Copy Combined Template</button>';
    result.style.display = 'block';
  }

  /* ── Quiz Tab ──────────────────────────────────────────────────────────── */
  function renderQuiz() {
    S.quizStep = 0;
    S.quizAnswers = {};
    renderQuizStep();
  }

  function renderQuizStep() {
    var container = $('quiz-container');
    var results = $('quiz-results');
    var progress = $('quiz-progress');
    if (!container) return;

    if (results) results.style.display = 'none';
    container.style.display = '';

    // Progress dots
    if (progress) {
      progress.innerHTML = QUIZ.map(function (q, i) {
        var cls = i < S.quizStep ? 'done' : i === S.quizStep ? 'active' : '';
        return '<div class="plab-quiz-dot ' + cls + '"></div>';
      }).join('');
    }

    if (S.quizStep >= QUIZ.length) {
      showQuizResults();
      return;
    }

    var q = QUIZ[S.quizStep];
    var h = '<div class="plab-quiz-question">' + esc(q.text) + '</div>';
    h += '<div class="plab-quiz-options">';
    (q.options || []).forEach(function (opt) {
      h += '<button class="plab-quiz-option" data-action="quiz-answer" data-value="' + esc(opt.value) + '" data-qid="' + esc(q.id) + '">' + esc(opt.label) + '</button>';
    });
    h += '</div>';
    container.innerHTML = h;
  }

  function handleQuizAnswer(value, qid) {
    S.quizAnswers[qid] = value;
    S.quizStep++;

    var motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (motionOk) {
      setTimeout(renderQuizStep, 300);
    } else {
      renderQuizStep();
    }
  }

  function showQuizResults() {
    var container = $('quiz-container');
    var results = $('quiz-results');
    if (!results) return;
    if (container) container.style.display = 'none';
    results.style.display = '';

    // Tally scores
    var scores = {};
    T.forEach(function (t) { scores[t.id] = 0; });

    Object.keys(S.quizAnswers).forEach(function (qid) {
      var q = QUIZ.find(function (qq) { return qq.id === qid; });
      if (!q) return;
      var val = S.quizAnswers[qid];
      var opt = (q.options || []).find(function (o) { return o.value === val; });
      if (!opt || !opt.weights) return;
      Object.keys(opt.weights).forEach(function (tid) {
        if (scores[tid] !== undefined) scores[tid] += (Number(opt.weights[tid]) || 0);
      });
    });

    // Sort and get top 3
    var sorted = Object.keys(scores).sort(function (a, b) { return scores[b] - scores[a]; });
    var top3 = sorted.slice(0, 3);

    var h = '<h2 class="plab-results-title">Your Top Techniques</h2>';
    top3.forEach(function (tid, i) {
      var t = T.find(function (tt) { return tt.id === tid; });
      if (!t) return;
      h += '<div class="plab-result-card">';
      h += '<div class="plab-result-rank' + (i === 0 ? ' gold' : '') + '">#' + (i + 1) + '</div>';
      h += '<div>';
      h += '<div class="plab-result-name">' + esc(t.emoji + ' ' + t.name) + '</div>';
      h += '<div class="plab-result-score">Score: ' + scores[tid] + ' points</div>';
      h += '<div class="plab-result-why">' + esc(t.tagline) + '</div>';
      h += '<div style="margin-top:0.5rem"><button class="plab-btn" data-action="try-lab" data-technique="' + esc(tid) + '" style="font-size:0.78rem;padding:0.35rem 0.75rem">Try in Lab →</button></div>';
      h += '</div></div>';
    });

    h += '<div style="margin-top:1rem"><button class="plab-btn-outline" data-action="retake-quiz">Retake Quiz</button></div>';
    results.innerHTML = h;
  }

  /* ── Event Delegation ──────────────────────────────────────────────────── */
  function setupEvents() {
    document.addEventListener('click', function (e) {
      var target = e.target;

      // Technique card toggle
      var card = target.closest('.plab-card');
      if (card && !target.closest('.plab-card-body') && !target.closest('button')) {
        card.classList.toggle('open');
        if (card.classList.contains('open')) {
          var id = card.dataset.id;
          if (id && !S.explored[id]) {
            S.explored[id] = true;
            card.classList.add('explored');
            var badges = card.querySelector('.plab-card-badges');
            if (badges && !badges.querySelector('.plab-badge-explored')) {
              badges.insertAdjacentHTML('afterbegin', '<span class="plab-badge plab-badge-explored">✓</span>');
            }
            save();
            updateProgress();
          }
        }
        return;
      }

      // Combo card toggle
      var combo = target.closest('.plab-combo-card');
      if (combo && !target.closest('button')) {
        combo.classList.toggle('open');
        return;
      }

      // Button actions
      var action = target.dataset.action;
      if (!action) {
        var btn = target.closest('[data-action]');
        if (btn) { action = btn.dataset.action; target = btn; }
      }
      if (!action) return;

      switch (action) {
        case 'try-lab':
          var tid = target.dataset.technique;
          S.labTechnique = tid;
          var picker = $('lab-technique-picker');
          if (picker) picker.value = tid;
          renderExercises();
          switchTab('lab');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          break;

        case 'copy-pattern':
          var tech = T.find(function (t) { return t.id === target.dataset.technique; });
          if (tech) copyText(tech.pattern);
          break;

        case 'show-answer':
          var box = document.querySelector('[data-answer="' + target.dataset.exercise + '"]');
          if (box) box.classList.toggle('visible');
          break;

        case 'copy-answer':
          var ex = EX.find(function (e) { return e.id === target.dataset.exercise; });
          if (ex) copyText(ex.sample_answer);
          break;

        case 'copy-combo':
          var c = COMBOS.find(function (co) { return co.id === target.dataset.combo; });
          if (c) copyText(c.template);
          break;

        case 'copy-custom':
          var tmpl = document.querySelector('#custom-combo-result .plab-combo-template');
          if (tmpl) copyText(tmpl.textContent);
          break;

        case 'toggle-hints':
          var hints = target.nextElementSibling;
          if (hints) {
            var vis = hints.style.display === 'none';
            hints.style.display = vis ? '' : 'none';
            target.textContent = vis ? 'Hide hints' : 'Show hints';
          }
          break;

        case 'quiz-answer':
          handleQuizAnswer(target.dataset.value, target.dataset.qid);
          break;

        case 'retake-quiz':
          renderQuiz();
          break;
      }
    });
  }

  /* ── Copy ──────────────────────────────────────────────────────────────── */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast('Copied!'); }).catch(function () { fallbackCopy(text); });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); toast('Copied!'); } catch (e) { toast('Copy failed — select manually'); }
    document.body.removeChild(ta);
  }

  /* ── Toast ─────────────────────────────────────────────────────────────── */
  var _toastEl;
  function toast(msg) {
    if (!_toastEl) {
      _toastEl = document.createElement('div');
      _toastEl.className = 'plab-toast';
      _toastEl.setAttribute('role', 'status');
      _toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(_toastEl);
    }
    _toastEl.textContent = msg;
    _toastEl.classList.add('show');
    setTimeout(function () { _toastEl.classList.remove('show'); }, 2000);
  }

  /* ── Init ──────────────────────────────────────────────────────────────── */
  function init() {
    load();
    setupTabs();
    renderTechniques();
    setupLab();
    renderCombos();
    setupCustomCombo();
    renderQuiz();
    setupEvents();
    restoreUrl();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
