/* ═══════════════════════════════════════════════════════════════════════════
   DEMO SCRIPT BUILDER — Script Assembly Engine (V3)
   V2: category filter, custom scenarios, practice mode, search,
       shareable URLs, markdown export, business value badges
   V3: before/after visualiser, Q&A prep, wizard, practice scorecard,
       recording mode
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var D = window.DEMO_DATA;
  if (!D) return;

  // ── State ────────────────────────────────────────────────────────────
  var state = {
    scenario: 'sales-pipeline',
    audience: 'business',
    duration: 15,
    risk: 'medium',
    apps: new Set(D.apps.map(function (a) { return a.id; })),
    catFilter: 'all',
    practiceMode: false,
    practiceStep: 0,
    stepRatings: [],
    stepTimes: [],
    stepStartTime: null
  };

  var riskMap = { low: ['low'], medium: ['low', 'medium'], high: ['low', 'medium', 'high'] };
  var practiceTimer = null;
  var practiceSeconds = 0;

  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return document.querySelectorAll(s); };

  // ── V3: Timing Map ──────────────────────────────────────────────────
  var timingMap = {
    'sales-pipeline': { without: '2 hours', with: '15 minutes', saving: '87%' },
    'sales-proposal': { without: '4 hours', with: '30 minutes', saving: '88%' },
    'hr-policy': { without: '15 minutes per query', with: '2 minutes per query', saving: '87%' },
    'hr-onboarding': { without: '3 days', with: '1 hour', saving: '96%' },
    'it-incident': { without: '2 hours', with: '20 minutes', saving: '83%' },
    'it-knowledge': { without: '90 minutes', with: '15 minutes', saving: '83%' },
    'finance-budget': { without: '3 hours', with: '20 minutes', saving: '89%' },
    'finance-quarterly': { without: '2 days', with: '1 hour', saving: '94%' },
    'marketing-campaign': { without: '1 day', with: '30 minutes', saving: '94%' },
    'exec-email': { without: '45 minutes/day', with: '10 minutes/day', saving: '78%' },
    'exec-meeting': { without: '30 minutes', with: '5 minutes', saving: '83%' },
    'legal-contract': { without: '4 hours', with: '45 minutes', saving: '81%' },
    'ops-supply': { without: '3 hours', with: '30 minutes', saving: '83%' },
    'cs-tickets': { without: '30 min/ticket', with: '8 min/ticket', saving: '73%' },
    'edu-lesson': { without: '2 hours', with: '30 minutes', saving: '75%' }
  };

  // ── URL Hash ─────────────────────────────────────────────────────────
  function readHash() {
    var h = location.hash.slice(1);
    if (!h) return;
    var p = new URLSearchParams(h);
    if (p.get('s') && D.scenarios.find(function (sc) { return sc.id === p.get('s'); })) state.scenario = p.get('s');
    if (['technical', 'business', 'executive'].indexOf(p.get('a')) !== -1) state.audience = p.get('a');
    if ([5, 15, 30].indexOf(Number(p.get('d'))) !== -1) state.duration = Number(p.get('d'));
    if (['low', 'medium', 'high'].indexOf(p.get('r')) !== -1) state.risk = p.get('r');
    syncUIFromState();
  }

  function writeHash() {
    var h = 's=' + state.scenario + '&a=' + state.audience + '&d=' + state.duration + '&r=' + state.risk;
    history.replaceState(null, '', '#' + h);
  }

  function syncUIFromState() {
    $$('.demoscr-scenario-card').forEach(function (c) { c.classList.toggle('active', c.dataset.scenario === state.scenario); });
    $$('[data-config="audience"] .demoscr-pill').forEach(function (p) { p.classList.toggle('active', p.dataset.value === state.audience); });
    $$('[data-config="duration"] .demoscr-pill').forEach(function (p) { p.classList.toggle('active', p.dataset.value === String(state.duration)); });
    $$('[data-config="risk"] .demoscr-pill').forEach(function (p) { p.classList.toggle('active', p.dataset.value === state.risk); });
    updateAppsForScenario();
  }

  // ── Tab switching ────────────────────────────────────────────────────
  $$('.demoscr-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      $$('.demoscr-tab').forEach(function (t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      $$('.demoscr-panel').forEach(function (p) { p.classList.remove('active'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      var panel = $('#panel-' + tab.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });

  // ── Category filter ──────────────────────────────────────────────────
  $$('.demoscr-cat-pill').forEach(function (pill) {
    pill.addEventListener('click', function () {
      $$('.demoscr-cat-pill').forEach(function (p) { p.classList.remove('active'); });
      pill.classList.add('active');
      state.catFilter = pill.dataset.cat;
      $$('.demoscr-scenario-card').forEach(function (card) {
        var show = state.catFilter === 'all' || card.dataset.category === state.catFilter;
        card.style.display = show ? '' : 'none';
      });
    });
  });

  // ── Scenario selection ───────────────────────────────────────────────
  $$('.demoscr-scenario-card').forEach(function (card) {
    card.addEventListener('click', function () {
      $$('.demoscr-scenario-card').forEach(function (c) { c.classList.remove('active'); });
      card.classList.add('active');
      state.scenario = card.dataset.scenario;
      updateAppsForScenario();
      renderScript();
      writeHash();
    });
  });

  // ── Config pill selection ────────────────────────────────────────────
  $$('.demoscr-pill-group').forEach(function (group) {
    group.querySelectorAll('.demoscr-pill').forEach(function (pill) {
      pill.addEventListener('click', function () {
        group.querySelectorAll('.demoscr-pill').forEach(function (p) { p.classList.remove('active'); });
        pill.classList.add('active');
        var key = group.dataset.config;
        state[key] = key === 'duration' ? parseInt(pill.dataset.value) : pill.dataset.value;
        renderScript();
        writeHash();
      });
    });
  });

  // ── App toggles ──────────────────────────────────────────────────────
  $$('.demoscr-app-toggle input').forEach(function (cb) {
    cb.addEventListener('change', function () {
      if (cb.checked) state.apps.add(cb.value);
      else state.apps.delete(cb.value);
      renderScript();
    });
  });

  function updateAppsForScenario() {
    var sc = D.scenarios.find(function (s) { return s.id === state.scenario; });
    if (!sc) return;
    $$('.demoscr-app-toggle input').forEach(function (cb) {
      cb.checked = sc.apps.indexOf(cb.value) !== -1;
      if (cb.checked) state.apps.add(cb.value);
      else state.apps.delete(cb.value);
    });
  }

  // ── Get filtered steps ───────────────────────────────────────────────
  function getSteps() {
    return D.steps
      .filter(function (s) { return s.scenario === state.scenario; })
      .filter(function (s) { return s.min_duration <= state.duration; })
      .filter(function (s) { return riskMap[state.risk].indexOf(s.risk) !== -1; })
      .filter(function (s) { return state.apps.has(s.app); })
      .sort(function (a, b) { return a.order - b.order; });
  }

  // ── Script rendering ─────────────────────────────────────────────────
  function renderScript() {
    var sc = D.scenarios.find(function (s) { return s.id === state.scenario; });
    if (!sc) return;
    var steps = getSteps();

    var titleEl = $('#script-title');
    var metaEl = $('#script-meta');
    var bodyEl = $('#script-body');

    if (titleEl) titleEl.textContent = sc.name + ' \u2014 Demo Script';

    var appNames = D.apps.filter(function (a) { return state.apps.has(a.id); }).map(function (a) { return a.icon + ' ' + a.name; }).join(' \u00b7 ');
    if (metaEl) {
      metaEl.innerHTML =
        '<span>\u23f1\ufe0f ' + state.duration + ' min</span>' +
        '<span>\ud83d\udc64 ' + cap(state.audience) + ' audience</span>' +
        '<span>' + riskLabel(state.risk) + '</span>' +
        '<span>\ud83d\udcf1 ' + appNames + '</span>' +
        '<span>\ud83d\udcca ' + steps.length + ' steps</span>';
    }

    if (!bodyEl) return;
    var html = '';

    html += '<div class="demoscr-intro"><h3>\ud83c\udfac Opening</h3><p>' + getIntro(sc, state.audience) + '</p></div>';
    html += '<div class="demoscr-timing-cue">\u23f1\ufe0f Start \u2014 0:00</div>';

    var elapsed = 0;
    var stepTime = state.duration / Math.max(steps.length + 1, 1);

    steps.forEach(function (step, i) {
      elapsed += stepTime;
      var talkKey = 'talk_' + state.audience;
      var talk = step[talkKey] || step.talk_business || '';

      html += '<div class="demoscr-step' + (step.wow ? ' wow' : '') + '" data-step-idx="' + i + '">';
      html += '<div class="demoscr-step-header">';
      html += '<span class="demoscr-step-num">' + (i + 1) + '</span>';
      html += '<span class="demoscr-step-title">' + esc(step.title) + '</span>';
      html += '<span class="demoscr-step-app">' + appIcon(step.app) + ' ' + appName(step.app) + '</span>';
      if (step.wow) html += '<span class="demoscr-wow-badge" title="Wow moment!">\u2b50</span>';
      html += '</div>';

      html += '<div class="demoscr-step-action">\ud83d\udc46 ' + esc(step.action) + '</div>';

      html += '<div class="demoscr-step-prompt">';
      html += '<div class="demoscr-step-prompt-label">\ud83d\udcac Type this prompt</div>';
      html += '<div class="demoscr-step-prompt-text">' + esc(step.prompt) + '</div>';
      html += '<button class="demoscr-copy-prompt" data-prompt="' + escAttr(step.prompt) + '">\ud83d\udccb Copy</button>';
      html += '</div>';

      html += '<div class="demoscr-step-expected"><strong>\u2705 Expected: </strong>' + esc(step.expected) + '</div>';
      html += '<div class="demoscr-step-talk"><strong>\ud83d\udde3\ufe0f Say this: </strong>' + esc(talk) + '</div>';

      html += '<details class="demoscr-step-fallback"><summary>\u26a0\ufe0f What if it doesn\'t work?</summary>';
      html += '<p>' + esc(step.fallback) + '</p></details>';

      html += '</div>';

      if ((i + 1) % 2 === 0 && i < steps.length - 1) {
        html += '<div class="demoscr-timing-cue">\u23f1\ufe0f ~' + Math.round(elapsed) + ':00 mark</div>';
      }
    });

    html += '<div class="demoscr-timing-cue">\u23f1\ufe0f Closing \u2014 ~' + state.duration + ':00</div>';
    html += '<div class="demoscr-closing"><h3>\ud83c\udfaf Closing</h3><p>' + getClosing(sc, state.audience) + '</p></div>';

    bodyEl.innerHTML = html;

    bodyEl.querySelectorAll('.demoscr-copy-prompt').forEach(function (btn) {
      btn.addEventListener('click', function (e) { e.stopPropagation(); copyText(btn.dataset.prompt, btn); });
    });

    // ── V3: Before/After Visualiser ──────────────────────────────────
    renderBeforeAfter();

    // ── V3: Q&A Prep ─────────────────────────────────────────────────
    renderQAPrep(sc);
  }

  // ── V3: Before/After Rendering ────────────────────────────────────
  function renderBeforeAfter() {
    var el = $('#before-after');
    if (!el) return;
    var timing = timingMap[state.scenario];
    if (!timing) { el.innerHTML = ''; return; }
    el.innerHTML =
      '<div class="demoscr-ba-container">' +
        '<div class="demoscr-ba-box demoscr-ba-without">' +
          '<div class="demoscr-ba-label">\u274c Without Copilot</div>' +
          '<div class="demoscr-ba-time">' + esc(timing.without) + '</div>' +
        '</div>' +
        '<div class="demoscr-ba-arrow">\u27a1\ufe0f</div>' +
        '<div class="demoscr-ba-box demoscr-ba-with">' +
          '<div class="demoscr-ba-label">\u2705 With Copilot</div>' +
          '<div class="demoscr-ba-time">' + esc(timing['with']) + '</div>' +
        '</div>' +
        '<div class="demoscr-ba-saving">' +
          '<span class="demoscr-ba-saving-badge">\ud83d\ude80 ' + timing.saving + ' time saved</span>' +
        '</div>' +
      '</div>';
  }

  // ── V3: Q&A Prep Rendering ────────────────────────────────────────
  function renderQAPrep(sc) {
    var el = $('#qa-prep');
    if (!el || !D.qa_prep || !sc) { if (el) el.innerHTML = ''; return; }
    var qaData = null;
    for (var i = 0; i < D.qa_prep.length; i++) {
      if (D.qa_prep[i].category === sc.category) { qaData = D.qa_prep[i]; break; }
    }
    if (!qaData) { el.innerHTML = ''; return; }
    var qaHtml = '<h3 class="demoscr-qa-title">' + qaData.icon + ' Predicted Q&A \u2014 ' + esc(qaData.category) + '</h3>';
    qaHtml += '<div class="demoscr-qa-list">';
    qaData.questions.forEach(function (item) {
      qaHtml += '<details class="demoscr-qa-item">';
      qaHtml += '<summary class="demoscr-qa-question">\u2753 ' + esc(item.q) + '</summary>';
      qaHtml += '<div class="demoscr-qa-answer">\ud83d\udca1 ' + esc(item.a) + '</div>';
      qaHtml += '</details>';
    });
    qaHtml += '</div>';
    el.innerHTML = qaHtml;
  }

  // ── Intro & closing generators ───────────────────────────────────────
  function getIntro(sc, aud) {
    var base = 'Let me show you how Microsoft 365 Copilot transforms ' + sc.name.toLowerCase() + '. ';
    var hooks = {
      technical: 'I\'ll walk through the technical integration \u2014 how Copilot uses Microsoft Graph, respects your security boundaries, and works across M365 apps.',
      business: sc.business_value + '. I\'ll show you the real workflow \u2014 from start to finish \u2014 so you can see exactly what your team would experience.',
      executive: 'The big picture: ' + sc.business_value + '. Let me show you what this looks like in practice, and you can imagine it multiplied across your entire organisation.'
    };
    return base + (hooks[aud] || hooks.business);
  }

  function getClosing(sc, aud) {
    var base = 'That\'s ' + sc.name.toLowerCase() + ' with Copilot. ';
    var closes = {
      technical: base + 'Behind the scenes, Copilot uses Microsoft Graph for data access, respects your existing security model, and integrates natively with M365. Every action I showed is available today with a Copilot licence. What questions do you have about the technical architecture?',
      business: base + sc.business_value + '. Now imagine that time saving across your entire team. What workflow would you want to try first?',
      executive: base + 'Think about the scale: if every person in your organisation experiences this level of productivity improvement, what does that mean for your strategic goals? The ROI isn\'t just time saved \u2014 it\'s better decisions, faster execution, and a competitive edge. What\'s the next step to making this real for your org?'
    };
    return closes[aud] || closes.business;
  }

  // ── Custom Scenario ──────────────────────────────────────────────────
  var customInput = $('#custom-input');
  var customResults = $('#custom-results');
  if (customInput) {
    var customDebounce;
    customInput.addEventListener('input', function () {
      clearTimeout(customDebounce);
      customDebounce = setTimeout(function () {
        var q = customInput.value.trim().toLowerCase();
        if (q.length < 3) { customResults.style.display = 'none'; return; }
        var words = q.split(/\s+/);
        var matches = D.steps.filter(function (s) {
          var haystack = (s.title + ' ' + s.prompt + ' ' + s.app + ' ' + s.scenario).toLowerCase();
          return words.some(function (w) { return haystack.indexOf(w) !== -1; });
        });
        var seen = {};
        var unique = [];
        matches.forEach(function (m) {
          var key = m.scenario + '-' + m.order;
          if (!seen[key]) { seen[key] = true; unique.push(m); }
        });
        unique = unique.slice(0, 8);
        if (unique.length === 0) {
          customResults.innerHTML = '<p class="demoscr-tip">No matching steps found. Try different keywords (e.g. "email", "budget", "meeting").</p>';
        } else {
          customResults.innerHTML = '<p class="demoscr-tip">' + unique.length + ' matching steps found. Click to load that scenario:</p>' +
            unique.map(function (s) {
              var sc = D.scenarios.find(function (sc2) { return sc2.id === s.scenario; });
              return '<button class="demoscr-custom-match" data-scenario="' + s.scenario + '">' +
                '<span>' + (sc ? sc.icon : '') + ' ' + esc(s.title) + '</span>' +
                '<span class="demoscr-custom-match-meta">' + appIcon(s.app) + ' ' + appName(s.app) + ' \u00b7 ' + (sc ? sc.name : s.scenario) + '</span>' +
                '</button>';
            }).join('');
        }
        customResults.style.display = 'block';
        customResults.querySelectorAll('.demoscr-custom-match').forEach(function (btn) {
          btn.addEventListener('click', function () {
            state.scenario = btn.dataset.scenario;
            $$('.demoscr-scenario-card').forEach(function (c) { c.classList.toggle('active', c.dataset.scenario === state.scenario); });
            updateAppsForScenario();
            renderScript();
            writeHash();
            customResults.style.display = 'none';
            customInput.value = '';
            var sw = document.getElementById('script-wrapper');
            if (sw) sw.scrollIntoView({ behavior: 'smooth' });
          });
        });
      }, 300);
    });
  }

  // ── Practice Mode ────────────────────────────────────────────────────
  var practiceBtn = $('#btn-practice');
  var practiceOverlay = $('#practice-overlay');
  var practiceBody = $('#practice-body');
  var practiceProgress = $('#practice-progress');
  var practiceTimerEl = $('#practice-timer');

  if (practiceBtn) {
    practiceBtn.addEventListener('click', function () {
      state.practiceMode = true;
      state.practiceStep = 0;
      practiceSeconds = 0;
      state.stepRatings = [];
      state.stepTimes = [];
      state.stepStartTime = Date.now();
      var scorecardEl = $('#practice-scorecard');
      if (scorecardEl) scorecardEl.style.display = 'none';
      if (practiceBody) practiceBody.style.display = '';
      if (practiceProgress) practiceProgress.style.display = '';
      renderPractice();
      if (practiceOverlay) practiceOverlay.style.display = 'block';
      document.body.style.overflow = 'hidden';
      practiceTimer = setInterval(function () {
        practiceSeconds++;
        var m = String(Math.floor(practiceSeconds / 60)).padStart(2, '0');
        var s = String(practiceSeconds % 60).padStart(2, '0');
        if (practiceTimerEl) practiceTimerEl.textContent = m + ':' + s;
      }, 1000);
    });
  }

  if ($('#practice-next')) {
    $('#practice-next').addEventListener('click', function () {
      var steps = getSteps();
      if (state.stepStartTime) {
        state.stepTimes[state.practiceStep] = Math.round((Date.now() - state.stepStartTime) / 1000);
      }
      if (!state.stepRatings[state.practiceStep]) {
        state.stepRatings[state.practiceStep] = 'unrated';
      }
      if (state.practiceStep < steps.length - 1) {
        state.practiceStep++;
        state.stepStartTime = Date.now();
        renderPractice();
      } else {
        renderScorecard(steps);
      }
    });
  }
  if ($('#practice-prev')) {
    $('#practice-prev').addEventListener('click', function () {
      if (state.practiceStep > 0) {
        if (state.stepStartTime) {
          state.stepTimes[state.practiceStep] = Math.round((Date.now() - state.stepStartTime) / 1000);
        }
        state.practiceStep--;
        state.stepStartTime = Date.now();
        renderPractice();
      }
    });
  }
  if ($('#practice-exit')) {
    $('#practice-exit').addEventListener('click', exitPractice);
  }

  document.addEventListener('keydown', function (e) {
    if (!state.practiceMode) return;
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); var nb = $('#practice-next'); if (nb) nb.click(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); var pb = $('#practice-prev'); if (pb) pb.click(); }
    if (e.key === 'Escape') exitPractice();
  });

  function exitPractice() {
    state.practiceMode = false;
    clearInterval(practiceTimer);
    if (practiceOverlay) practiceOverlay.style.display = 'none';
    document.body.style.overflow = '';
    var scorecardEl = $('#practice-scorecard');
    if (scorecardEl) scorecardEl.style.display = 'none';
    if (practiceBody) practiceBody.style.display = '';
    if (practiceProgress) practiceProgress.style.display = '';
  }

  function renderPractice() {
    var steps = getSteps();
    var sc = D.scenarios.find(function (s) { return s.id === state.scenario; });
    var step = steps[state.practiceStep];
    if (!step || !practiceBody) return;

    if (practiceProgress) practiceProgress.textContent = 'Step ' + (state.practiceStep + 1) + ' of ' + steps.length;

    var talkKey = 'talk_' + state.audience;
    var talk = step[talkKey] || step.talk_business || '';
    var currentRating = state.stepRatings[state.practiceStep] || '';

    practiceBody.innerHTML =
      '<div class="demoscr-practice-step">' +
      '<div class="demoscr-practice-step-num">' + (state.practiceStep + 1) + ' / ' + steps.length + '</div>' +
      (step.wow ? '<div class="demoscr-practice-wow">\u2b50 Wow Moment</div>' : '') +
      '<h2>' + esc(step.title) + '</h2>' +
      '<div class="demoscr-practice-app">' + appIcon(step.app) + ' ' + appName(step.app) + '</div>' +
      '<div class="demoscr-practice-action">\ud83d\udc46 ' + esc(step.action) + '</div>' +
      '<div class="demoscr-practice-prompt">' +
      '<div class="demoscr-step-prompt-label">\ud83d\udcac Type this prompt</div>' +
      '<div class="demoscr-practice-prompt-text">' + esc(step.prompt) + '</div>' +
      '<button class="demoscr-copy-prompt" data-prompt="' + escAttr(step.prompt) + '">\ud83d\udccb Copy</button>' +
      '</div>' +
      '<div class="demoscr-practice-expected">\u2705 <strong>Expected:</strong> ' + esc(step.expected) + '</div>' +
      '<div class="demoscr-practice-talk">\ud83d\udde3\ufe0f <strong>Say this:</strong> ' + esc(talk) + '</div>' +
      '<div class="demoscr-practice-fallback">\u26a0\ufe0f <strong>If it fails:</strong> ' + esc(step.fallback) + '</div>' +
      '<div class="demoscr-practice-rating">' +
        '<span class="demoscr-practice-rating-label">Rate this step:</span>' +
        '<button class="demoscr-rating-btn' + (currentRating === 'nailed' ? ' demoscr-rating-active' : '') + '" data-rating="nailed">\u2705 Nailed it</button>' +
        '<button class="demoscr-rating-btn' + (currentRating === 'ok' ? ' demoscr-rating-active' : '') + '" data-rating="ok">\ud83d\ude10 OK</button>' +
        '<button class="demoscr-rating-btn' + (currentRating === 'struggled' ? ' demoscr-rating-active' : '') + '" data-rating="struggled">\u274c Struggled</button>' +
      '</div>' +
      '</div>';

    practiceBody.querySelectorAll('.demoscr-copy-prompt').forEach(function (btn) {
      btn.addEventListener('click', function (e) { e.stopPropagation(); copyText(btn.dataset.prompt, btn); });
    });

    practiceBody.querySelectorAll('.demoscr-rating-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.stepRatings[state.practiceStep] = btn.dataset.rating;
        practiceBody.querySelectorAll('.demoscr-rating-btn').forEach(function (b) { b.classList.remove('demoscr-rating-active'); });
        btn.classList.add('demoscr-rating-active');
      });
    });
  }

  // ── V3: Practice Scorecard ──────────────────────────────────────────
  function renderScorecard(steps) {
    var scorecardEl = $('#practice-scorecard');
    if (!scorecardEl) return;

    if (practiceBody) practiceBody.style.display = 'none';
    if (practiceProgress) practiceProgress.style.display = 'none';

    var nailed = 0;
    var ok = 0;
    var struggled = 0;
    var unrated = 0;
    var totalTime = 0;

    steps.forEach(function (step, i) {
      var r = state.stepRatings[i] || 'unrated';
      if (r === 'nailed') nailed++;
      else if (r === 'ok') ok++;
      else if (r === 'struggled') struggled++;
      else unrated++;
      totalTime += (state.stepTimes[i] || 0);
    });

    var recommendedPace = steps.length > 0 ? Math.round((state.duration * 60) / steps.length) : 0;
    var avgTime = steps.length > 0 ? Math.round(totalTime / steps.length) : 0;

    var html = '<div class="demoscr-scorecard">';
    html += '<h2 class="demoscr-scorecard-title">\ud83c\udfc6 Practice Scorecard</h2>';

    html += '<div class="demoscr-scorecard-summary">';
    html += '<div class="demoscr-scorecard-stat demoscr-scorecard-nailed"><span class="demoscr-scorecard-num">' + nailed + '</span><span>\u2705 Nailed</span></div>';
    html += '<div class="demoscr-scorecard-stat demoscr-scorecard-ok"><span class="demoscr-scorecard-num">' + ok + '</span><span>\ud83d\ude10 OK</span></div>';
    html += '<div class="demoscr-scorecard-stat demoscr-scorecard-struggled"><span class="demoscr-scorecard-num">' + struggled + '</span><span>\u274c Struggled</span></div>';
    if (unrated > 0) {
      html += '<div class="demoscr-scorecard-stat demoscr-scorecard-unrated"><span class="demoscr-scorecard-num">' + unrated + '</span><span>\u2753 Unrated</span></div>';
    }
    html += '</div>';

    html += '<div class="demoscr-scorecard-timing">';
    html += '<div>\u23f1\ufe0f Total practice time: <strong>' + formatTime(practiceSeconds) + '</strong> (target: ' + state.duration + ' min)</div>';
    html += '<div>\u23f1\ufe0f Average per step: <strong>' + formatTime(avgTime) + '</strong> (recommended: ' + formatTime(recommendedPace) + ')</div>';
    html += '</div>';

    html += '<div class="demoscr-scorecard-breakdown"><h3>Step Breakdown</h3>';
    steps.forEach(function (step, i) {
      var rating = state.stepRatings[i] || 'unrated';
      var time = state.stepTimes[i] || 0;
      var ratingIcon = rating === 'nailed' ? '\u2705' : rating === 'ok' ? '\ud83d\ude10' : rating === 'struggled' ? '\u274c' : '\u2753';
      html += '<div class="demoscr-scorecard-row">';
      html += '<span class="demoscr-scorecard-step-num">' + (i + 1) + '</span>';
      html += '<span class="demoscr-scorecard-step-title">' + esc(step.title) + '</span>';
      html += '<span class="demoscr-scorecard-step-time">' + formatTime(time) + '</span>';
      html += '<span class="demoscr-scorecard-step-rating">' + ratingIcon + '</span>';
      html += '</div>';
    });
    html += '</div>';

    html += '<div class="demoscr-scorecard-actions">';
    html += '<button class="demoscr-scorecard-btn" id="scorecard-restart">\ud83d\udd04 Practice Again</button>';
    html += '<button class="demoscr-scorecard-btn" id="scorecard-exit">\u2716 Exit</button>';
    html += '</div>';
    html += '</div>';

    scorecardEl.innerHTML = html;
    scorecardEl.style.display = 'block';

    var restartBtn = $('#scorecard-restart');
    var exitBtn = $('#scorecard-exit');
    if (restartBtn) {
      restartBtn.addEventListener('click', function () {
        scorecardEl.style.display = 'none';
        if (practiceBody) practiceBody.style.display = '';
        if (practiceProgress) practiceProgress.style.display = '';
        state.practiceStep = 0;
        state.stepRatings = [];
        state.stepTimes = [];
        state.stepStartTime = Date.now();
        practiceSeconds = 0;
        if (practiceTimerEl) practiceTimerEl.textContent = '00:00';
        renderPractice();
      });
    }
    if (exitBtn) {
      exitBtn.addEventListener('click', function () {
        scorecardEl.style.display = 'none';
        if (practiceBody) practiceBody.style.display = '';
        if (practiceProgress) practiceProgress.style.display = '';
        exitPractice();
      });
    }
  }

  // ── Prompt Library ───────────────────────────────────────────────────
  function renderPrompts(filter) {
    var grid = $('#prompt-grid');
    if (!grid) return;
    var prompts = filter === 'all' ? D.prompts : D.prompts.filter(function (p) { return p.app === filter; });
    grid.innerHTML = prompts.map(function (p) {
      var app = D.apps.find(function (a) { return a.id === p.app; });
      return '<div class="demoscr-prompt-card">' +
        '<div class="demoscr-prompt-card-header">' +
        '<span class="demoscr-prompt-card-app">' + (app ? app.icon + ' ' : '') + (app ? app.name : p.app) + '</span>' +
        '<span class="demoscr-prompt-card-reliability demoscr-reliability-' + p.reliability + '">' +
        (p.reliability === 'high' ? '\u2705 Reliable' : '\u26a1 Impressive') + '</span></div>' +
        '<div class="demoscr-prompt-card-text">' + esc(p.prompt) + '</div>' +
        '<div class="demoscr-prompt-card-expected">\u2705 ' + esc(p.expected) + '</div>' +
        '<div class="demoscr-prompt-card-talk">\ud83d\udde3\ufe0f ' + esc(p.talk) + '</div>' +
        '<button class="demoscr-prompt-copy-btn" data-prompt="' + escAttr(p.prompt) + '">\ud83d\udccb Copy Prompt</button></div>';
    }).join('');
    grid.querySelectorAll('.demoscr-prompt-copy-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { copyText(btn.dataset.prompt, btn); });
    });
  }

  $$('.demoscr-filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      $$('.demoscr-filter-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      renderPrompts(btn.dataset.app);
    });
  });

  // ── Global Search ────────────────────────────────────────────────────
  var searchInput = $('#demoscr-search');
  var searchResults = $('#demoscr-search-results');
  if (searchInput) {
    var searchDebounce;
    searchInput.addEventListener('input', function () {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(function () {
        var q = searchInput.value.trim().toLowerCase();
        if (q.length < 2) { searchResults.style.display = 'none'; return; }

        var results = [];
        D.scenarios.forEach(function (sc) {
          if ((sc.name + sc.tagline + sc.category).toLowerCase().indexOf(q) !== -1) {
            results.push({ type: 'scenario', icon: sc.icon, title: sc.name, sub: sc.tagline, action: function () {
              state.scenario = sc.id; syncUIFromState(); renderScript(); writeHash();
              $$('.demoscr-tab').forEach(function (t) { t.classList.remove('active'); });
              $$('.demoscr-panel').forEach(function (p) { p.classList.remove('active'); });
              $$('.demoscr-tab')[0].classList.add('active');
              var bp = $('#panel-builder');
              if (bp) bp.classList.add('active');
            }});
          }
        });
        D.prompts.forEach(function (p) {
          if ((p.prompt + p.expected + p.talk + p.app).toLowerCase().indexOf(q) !== -1) {
            results.push({ type: 'prompt', icon: '\ud83d\udcac', title: p.prompt.slice(0, 60) + (p.prompt.length > 60 ? '...' : ''), sub: appName(p.app), action: function () {
              $$('.demoscr-tab').forEach(function (t) { t.classList.remove('active'); });
              $$('.demoscr-panel').forEach(function (pp) { pp.classList.remove('active'); });
              var tabs = $$('.demoscr-tab');
              if (tabs[1]) { tabs[1].classList.add('active'); tabs[1].setAttribute('aria-selected', 'true'); }
              var pp = $('#panel-prompts');
              if (pp) pp.classList.add('active');
            }});
          }
        });
        $$('.demoscr-faq-item').forEach(function (faq) {
          var text = faq.textContent.toLowerCase();
          if (text.indexOf(q) !== -1) {
            results.push({ type: 'faq', icon: '\u2753', title: faq.querySelector('summary') ? faq.querySelector('summary').textContent : 'FAQ', sub: 'FAQ', action: function () {
              $$('.demoscr-tab').forEach(function (t) { t.classList.remove('active'); });
              $$('.demoscr-panel').forEach(function (p) { p.classList.remove('active'); });
              var tabs = $$('.demoscr-tab');
              if (tabs[3]) { tabs[3].classList.add('active'); tabs[3].setAttribute('aria-selected', 'true'); }
              var fp = $('#panel-faq');
              if (fp) fp.classList.add('active');
            }});
          }
        });

        var limited = results.slice(0, 8);
        if (limited.length === 0) {
          searchResults.innerHTML = '<div class="demoscr-search-empty">No results for "' + esc(q) + '"</div>';
        } else {
          searchResults.innerHTML = limited.map(function (r, i) {
            return '<button class="demoscr-search-item" data-idx="' + i + '">' +
              '<span class="demoscr-search-icon">' + r.icon + '</span>' +
              '<div><strong>' + esc(r.title) + '</strong><span>' + esc(r.sub) + '</span></div>' +
              '<span class="demoscr-search-type">' + r.type + '</span></button>';
          }).join('');
          searchResults.querySelectorAll('.demoscr-search-item').forEach(function (el, i) {
            el.addEventListener('click', function () {
              limited[i].action();
              searchInput.value = '';
              searchResults.style.display = 'none';
            });
          });
        }
        searchResults.style.display = 'block';
      }, 250);
    });
    searchInput.addEventListener('blur', function () { setTimeout(function () { searchResults.style.display = 'none'; }, 200); });
    searchInput.addEventListener('focus', function () { if (searchInput.value.trim().length >= 2) searchResults.style.display = 'block'; });
  }

  // ── Copy & Export ────────────────────────────────────────────────────
  function copyText(text, btn) {
    try { navigator.clipboard.writeText(text); } catch (ignore) {
      var ta = document.createElement('textarea'); ta.value = text;
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    }
    if (btn) {
      var orig = btn.textContent;
      btn.textContent = '\u2705 Copied!';
      btn.classList.add('copied');
      setTimeout(function () { btn.textContent = orig; btn.classList.remove('copied'); }, 1500);
    }
  }

  var copyScriptBtn = $('#btn-copy-script');
  if (copyScriptBtn) copyScriptBtn.addEventListener('click', function () {
    var body = $('#script-body');
    if (body) copyText(body.innerText, copyScriptBtn);
  });

  var copyPromptsBtn = $('#btn-copy-prompts');
  if (copyPromptsBtn) copyPromptsBtn.addEventListener('click', function () {
    var steps = getSteps();
    var text = steps.map(function (s, i) { return (i + 1) + '. [' + appName(s.app) + '] ' + s.prompt; }).join('\n\n');
    copyText(text, copyPromptsBtn);
  });

  var shareBtn = $('#btn-share');
  if (shareBtn) shareBtn.addEventListener('click', function () {
    writeHash();
    copyText(location.href, shareBtn);
  });

  var exportBtn = $('#btn-export-md');
  if (exportBtn) exportBtn.addEventListener('click', function () {
    var sc = D.scenarios.find(function (s) { return s.id === state.scenario; });
    var steps = getSteps();
    if (!sc) return;
    var md = '# ' + sc.name + ' \u2014 Demo Script\n\n';
    md += '**Audience:** ' + cap(state.audience) + ' | **Duration:** ' + state.duration + ' min | **Wow Factor:** ' + cap(state.risk) + '\n\n';
    md += '---\n\n## Opening\n\n' + getIntro(sc, state.audience) + '\n\n---\n\n';
    steps.forEach(function (step, i) {
      var talk = step['talk_' + state.audience] || step.talk_business || '';
      md += '## Step ' + (i + 1) + ': ' + step.title + (step.wow ? ' \u2b50' : '') + '\n\n';
      md += '**App:** ' + appName(step.app) + '\n\n';
      md += '**Action:** ' + step.action + '\n\n';
      md += '**Prompt:**\n```\n' + step.prompt + '\n```\n\n';
      md += '**Expected:** ' + step.expected + '\n\n';
      md += '**Say this:** ' + talk + '\n\n';
      md += '**If it fails:** ' + step.fallback + '\n\n---\n\n';
    });
    md += '## Closing\n\n' + getClosing(sc, state.audience) + '\n';

    var blob = new Blob([md], { type: 'text/markdown' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = sc.id + '-demo-script.md';
    a.click();
    URL.revokeObjectURL(a.href);
    var orig = exportBtn.textContent;
    exportBtn.textContent = '\u2705 Downloaded!';
    exportBtn.classList.add('copied');
    setTimeout(function () { exportBtn.textContent = orig; exportBtn.classList.remove('copied'); }, 1500);
  });

  var printBtn = $('#btn-print');
  if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

  // ── V3: Wizard (works with Hugo-rendered HTML) ────────────────────
  var wizardOverlay = $('#wizard-overlay');
  var wizardResult = $('#wizard-result');
  var wizardRec = $('#wizard-recommendation');
  var wizardChoices = { industry: '', pain: '', duration: 15 };

  var painToScenarioMap = {
    'meetings': { Executive: 'exec-meeting', _default: 'exec-meeting' },
    'email': { Executive: 'exec-email', _default: 'exec-email' },
    'content': { Sales: 'sales-proposal', Marketing: 'marketing-campaign', _default: 'sales-proposal' },
    'data': { Finance: 'finance-budget', Operations: 'ops-supply', _default: 'finance-budget' },
    'search': { HR: 'hr-policy', IT: 'it-knowledge', _default: 'it-knowledge' },
    'comms': { IT: 'it-incident', Service: 'cs-tickets', _default: 'it-incident' }
  };

  var categoryFallback = {
    Sales: 'sales-pipeline', HR: 'hr-policy', IT: 'it-incident', Finance: 'finance-budget',
    Marketing: 'marketing-campaign', Executive: 'exec-meeting', Legal: 'legal-contract',
    Operations: 'ops-supply', Service: 'cs-tickets', Education: 'edu-lesson'
  };

  function initWizard() {
    var wizBtn = $('#btn-wizard');
    if (!wizBtn || !wizardOverlay) return;

    wizBtn.addEventListener('click', function () {
      wizardChoices = { industry: '', pain: '', duration: 15 };
      $$('.demoscr-wizard-step').forEach(function(s) { s.classList.remove('active'); });
      $$('.demoscr-wizard-opt').forEach(function(o) { o.classList.remove('selected'); });
      var step1 = $('.demoscr-wizard-step[data-wstep="1"]');
      if (step1) step1.classList.add('active');
      if (wizardResult) wizardResult.style.display = 'none';
      wizardOverlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });

    var closeBtn = $('#wizard-close');
    if (closeBtn) closeBtn.addEventListener('click', closeWizard);
    wizardOverlay.addEventListener('click', function (e) { if (e.target === wizardOverlay) closeWizard(); });

    // Step 1: Industry
    $$('#wiz-industry .demoscr-wizard-opt').forEach(function(btn) {
      btn.addEventListener('click', function() {
        $$('#wiz-industry .demoscr-wizard-opt').forEach(function(b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        wizardChoices.industry = btn.dataset.val;
        $$('.demoscr-wizard-step').forEach(function(s) { s.classList.remove('active'); });
        var step2 = $('.demoscr-wizard-step[data-wstep="2"]');
        if (step2) step2.classList.add('active');
      });
    });

    // Step 2: Pain point
    $$('#wiz-pain .demoscr-wizard-opt').forEach(function(btn) {
      btn.addEventListener('click', function() {
        $$('#wiz-pain .demoscr-wizard-opt').forEach(function(b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        wizardChoices.pain = btn.dataset.val;
        $$('.demoscr-wizard-step').forEach(function(s) { s.classList.remove('active'); });
        var step3 = $('.demoscr-wizard-step[data-wstep="3"]');
        if (step3) step3.classList.add('active');
      });
    });

    // Step 3: Duration -> show result
    $$('#wiz-duration .demoscr-wizard-opt').forEach(function(btn) {
      btn.addEventListener('click', function() {
        $$('#wiz-duration .demoscr-wizard-opt').forEach(function(b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        wizardChoices.duration = parseInt(btn.dataset.val);
        $$('.demoscr-wizard-step').forEach(function(s) { s.classList.remove('active'); });
        showWizardResult();
      });
    });

    // Apply button
    var applyBtn = $('#wizard-apply');
    if (applyBtn) {
      applyBtn.addEventListener('click', function() {
        closeWizard();
        var sw = document.getElementById('script-wrapper');
        if (sw) sw.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  function closeWizard() {
    if (wizardOverlay) wizardOverlay.style.display = 'none';
    document.body.style.overflow = '';
  }

  function showWizardResult() {
    var ind = wizardChoices.industry;
    var pain = wizardChoices.pain;
    var scenarioId = '';
    var mapping = painToScenarioMap[pain];
    if (mapping) scenarioId = mapping[ind] || mapping._default || '';
    if (!scenarioId) scenarioId = categoryFallback[ind] || 'sales-pipeline';

    var sc = D.scenarios.find(function(s) { return s.id === scenarioId; });
    if (!sc) { sc = D.scenarios[0]; scenarioId = sc.id; }

    var timing = timingMap[scenarioId];
    if (wizardRec) {
      wizardRec.innerHTML =
        '<div style="text-align:center;margin-bottom:0.75rem"><span style="font-size:2.5rem">' + sc.icon + '</span></div>' +
        '<div style="font-size:1.15rem;font-weight:700;color:#e2e8f0;text-align:center">' + esc(sc.name) + '</div>' +
        '<div style="color:#94a3b8;font-size:0.88rem;text-align:center;margin:0.35rem 0">' + esc(sc.tagline) + '</div>' +
        '<div style="color:#64748b;font-size:0.8rem;text-align:center">' +
        '\u23f1\ufe0f ' + wizardChoices.duration + ' min' +
        (timing ? ' \u00b7 \ud83d\ude80 ' + timing.saving + ' time saved' : '') +
        '</div>';
    }
    if (wizardResult) wizardResult.style.display = 'block';

    state.scenario = scenarioId;
    state.duration = wizardChoices.duration;
    state.audience = 'business';
    state.risk = 'medium';
    syncUIFromState();
    renderScript();
    writeHash();
  }

  // ── V3: Recording Mode ──────────────────────────────────────────────
  var recOverlay = $('#recording-overlay');
  var recTimerInterval = null;
  var recSeconds = 0;
  var recStep = 0;

  function initRecording() {
    var recBtn = $('#btn-record');
    if (!recBtn) return;

    recBtn.addEventListener('click', function () {
      var steps = getSteps();
      if (steps.length === 0) return;
      recStep = 0;
      recSeconds = 0;

      if (!recOverlay) {
        var bar = document.createElement('div');
        bar.id = 'recording-overlay';
        bar.className = 'demoscr-recording-bar';
        document.body.prepend(bar);
        recOverlay = bar;
      }

      recOverlay.style.display = 'flex';
      renderRecordingBar(steps);

      if (recTimerInterval) clearInterval(recTimerInterval);
      recTimerInterval = setInterval(function () {
        recSeconds++;
        var timerEl = $('#recording-timer');
        if (timerEl) {
          var m = String(Math.floor(recSeconds / 60)).padStart(2, '0');
          var s = String(recSeconds % 60).padStart(2, '0');
          timerEl.textContent = m + ':' + s;
        }
      }, 1000);
    });
  }

  function renderRecordingBar(steps) {
    if (!recOverlay) return;
    var step = steps[recStep];
    var m = String(Math.floor(recSeconds / 60)).padStart(2, '0');
    var s = String(recSeconds % 60).padStart(2, '0');

    recOverlay.innerHTML =
      '<span class="demoscr-rec-dot">\u25cf</span>' +
      '<span class="demoscr-rec-label">REC</span>' +
      '<span class="demoscr-rec-timer" id="recording-timer">' + m + ':' + s + '</span>' +
      '<span class="demoscr-rec-divider">\u2502</span>' +
      '<span class="demoscr-rec-progress">Step ' + (recStep + 1) + '/' + steps.length +
        (step ? ' \u2014 ' + esc(step.title) : '') + '</span>' +
      '<button class="demoscr-rec-next" id="recording-next">' +
        (recStep < steps.length - 1 ? 'Next \u25b6' : 'Done \u2713') + '</button>' +
      '<button class="demoscr-rec-stop" id="recording-stop">\u25a0 Stop</button>';

    var nextBtn = $('#recording-next');
    var stopBtn = $('#recording-stop');

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        if (recStep < steps.length - 1) {
          recStep++;
          renderRecordingBar(steps);
        } else {
          stopRecording();
        }
      });
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', stopRecording);
    }
  }

  function stopRecording() {
    clearInterval(recTimerInterval);
    recTimerInterval = null;
    if (recOverlay) recOverlay.style.display = 'none';
  }

  // ── Helpers ──────────────────────────────────────────────────────────
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
  function esc(s) { if (!s) return ''; var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function escAttr(s) { return esc(s).replace(/"/g, '&quot;'); }
  function riskLabel(r) { return r === 'low' ? '\ud83d\udfe2 Safe' : r === 'medium' ? '\ud83d\udfe1 Moderate' : '\ud83d\udd34 Bold'; }
  function appIcon(id) { var app = D.apps.find(function (a) { return a.id === id; }); return app ? app.icon : '\ud83d\udcf1'; }
  function appName(id) { var app = D.apps.find(function (a) { return a.id === id; }); return app ? app.name : id; }

  function formatTime(seconds) {
    if (seconds < 60) return seconds + 's';
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return m + 'm ' + s + 's';
  }

  // ── Init ─────────────────────────────────────────────────────────────
  readHash();
  renderScript();
  renderPrompts('all');
  initWizard();
  initRecording();
  window.addEventListener('hashchange', function () { readHash(); renderScript(); });

})();
