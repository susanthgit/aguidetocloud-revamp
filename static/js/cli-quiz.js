/* cli-quiz.js — CLI Command Quiz  */
(function () {
  'use strict';

  /* ── Data ────────────────────────────────────────────────── */
  var DATA = window.__cliCommands;
  if (!Array.isArray(DATA) || !DATA.length) return;

  /* ── Helpers ─────────────────────────────────────────────── */
  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  }

  function $(id) { return document.getElementById(id); }

  function safeGet(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch (_) { return fallback; }
  }

  function safeSet(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) { /* private browsing */ }
  }

  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function shuffle(arr, rng) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor((rng || Math.random)() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function primaryCmdlet(cmd) {
    var m = (cmd || '').match(/^[\w][\w-]*/);
    return m ? m[0] : cmd;
  }

  function difficultyStars(n) {
    var s = '';
    for (var i = 0; i < 5; i++) s += i < n ? '★' : '☆';
    return s;
  }

  function dateSeed() {
    return parseInt(new Date().toISOString().slice(0, 10).replace(/-/g, ''), 10);
  }

  function fmtDate(iso) {
    try {
      var d = new Date(iso);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (_) { return iso; }
  }

  function pct(n, d) { return d ? Math.round((n / d) * 100) : 0; }

  /* ── Tabs ────────────────────────────────────────────────── */
  function initTabs() {
    var tabs = document.querySelectorAll('.cliquiz-tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.getAttribute('data-tab');
        tabs.forEach(function (t) {
          t.classList.toggle('active', t === tab);
          t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
        });
        document.querySelectorAll('.cliquiz-panel').forEach(function (p) {
          var isTarget = p.id === 'panel-' + target;
          p.classList.toggle('active', isTarget);
        });
        if (target === 'stats') renderStats();
      });
    });
  }

  /* ── Categories ──────────────────────────────────────────── */
  var CATEGORIES = [];
  (function buildCats() {
    var seen = {};
    DATA.forEach(function (c) {
      if (c.category && !seen[c.category]) {
        seen[c.category] = true;
        CATEGORIES.push(c.category);
      }
    });
    CATEGORIES.sort();
  })();

  /* ── Game state ──────────────────────────────────────────── */
  var G = {
    mode: 'quick10',
    category: 'all',
    questions: [],
    current: 0,
    score: 0,
    total: 0,
    questionIdx: 0,
    timer: null,
    timerStart: 0,
    answered: false,
    choices: [],
    hardInput: ''
  };

  var TIMER_DURATION = 10000; // 10 seconds

  /* ── Timer ───────────────────────────────────────────────── */
  function stopTimer() {
    if (G.timer) { cancelAnimationFrame(G.timer); G.timer = null; }
  }

  function startTimer() {
    stopTimer();
    G.timerStart = performance.now();
    var bar = $('cliquiz-timer-bar');
    if (!bar) return;
    bar.style.width = '100%';
    bar.classList.remove('cliquiz-timer-expired');

    var savedIdx = G.questionIdx;

    function tick(now) {
      if (savedIdx !== G.questionIdx) return; // race guard
      var elapsed = now - G.timerStart;
      var remaining = Math.max(0, 1 - elapsed / TIMER_DURATION);
      bar.style.width = (remaining * 100).toFixed(1) + '%';
      if (remaining <= 0.25) bar.classList.add('cliquiz-timer-warn');
      else bar.classList.remove('cliquiz-timer-warn');

      if (elapsed >= TIMER_DURATION) {
        bar.classList.add('cliquiz-timer-expired');
        if (!G.answered && savedIdx === G.questionIdx) {
          handleTimeout();
        }
        return;
      }
      G.timer = requestAnimationFrame(tick);
    }
    G.timer = requestAnimationFrame(tick);
  }

  function handleTimeout() {
    G.answered = true;
    stopTimer();
    var q = G.questions[G.current];
    revealAnswer(q, -1);
  }

  /* ── Start quiz ──────────────────────────────────────────── */
  function startQuiz(mode, category) {
    G.mode = mode || 'quick10';
    G.category = category || 'all';
    G.current = 0;
    G.score = 0;
    G.answered = false;

    var pool = DATA.slice();
    if (G.category !== 'all') {
      pool = pool.filter(function (c) { return c.category === G.category; });
    }
    if (!pool.length) { pool = DATA.slice(); }

    if (G.mode === 'daily') {
      var rng = mulberry32(dateSeed());
      pool = shuffle(pool, rng);
      G.questions = pool.slice(0, 10);
    } else if (G.mode === 'hard') {
      pool = shuffle(pool);
      G.questions = pool.slice(0, 10);
    } else if (G.mode === 'category') {
      G.questions = shuffle(pool);
    } else {
      pool = shuffle(pool);
      G.questions = pool.slice(0, 10);
    }

    G.total = G.questions.length;
    G.questionIdx = 0;

    renderQuizUI();
    showQuestion();
  }

  /* ── Render quiz UI skeleton ─────────────────────────────── */
  function renderQuizUI() {
    var area = $('quiz-area');
    if (!area) return;
    area.innerHTML =
      '<div id="cliquiz-progress"></div>' +
      '<div id="cliquiz-timer-wrap"><div id="cliquiz-timer-bar" class="cliquiz-timer-bar"></div></div>' +
      '<div id="cliquiz-question"></div>' +
      '<div id="cliquiz-choices"></div>' +
      '<div id="cliquiz-feedback"></div>' +
      '<div id="cliquiz-nav"></div>';
    updateScore();
  }

  /* ── Show question ───────────────────────────────────────── */
  function showQuestion() {
    if (G.current >= G.total) { showResults(); return; }

    G.answered = false;
    G.questionIdx = G.current;

    var q = G.questions[G.current];
    var qEl = $('cliquiz-question');
    var cEl = $('cliquiz-choices');
    var fbEl = $('cliquiz-feedback');
    var navEl = $('cliquiz-nav');
    if (!qEl || !cEl) return;

    // Progress
    var prog = $('cliquiz-progress');
    if (prog) {
      prog.innerHTML =
        '<span class="cliquiz-progress-text">Question ' + (G.current + 1) + ' of ' + G.total + '</span>' +
        '<div class="cliquiz-progress-bar"><div class="cliquiz-progress-fill" style="width:' +
        pct(G.current, G.total) + '%"></div></div>';
    }

    // Question
    qEl.innerHTML =
      '<div class="cliquiz-q-meta">' +
        '<span class="cliquiz-badge cliquiz-badge--cat">' + esc(q.category) + '</span>' +
        '<span class="cliquiz-badge cliquiz-badge--diff" title="Difficulty ' + (q.difficulty || 1) + '/5">' +
          difficultyStars(q.difficulty || 1) +
        '</span>' +
        (q.module ? '<span class="cliquiz-badge cliquiz-badge--mod">' + esc(q.module) + '</span>' : '') +
      '</div>' +
      '<p class="cliquiz-task">' + esc(q.task) + '</p>';

    // Feedback + nav clear
    if (fbEl) fbEl.innerHTML = '';
    if (navEl) navEl.innerHTML = '';

    // Hard mode: text input
    if (G.mode === 'hard') {
      cEl.innerHTML =
        '<div class="cliquiz-hard-input">' +
          '<label for="cliquiz-answer-input" class="sr-only">Type the command</label>' +
          '<input type="text" id="cliquiz-answer-input" class="cliquiz-input" ' +
            'placeholder="Type the command\u2026" autocomplete="off" autocapitalize="off" spellcheck="false">' +
          '<button id="cliquiz-submit-btn" class="cliquiz-btn cliquiz-btn--submit">Submit</button>' +
        '</div>';
      var inp = $('cliquiz-answer-input');
      var btn = $('cliquiz-submit-btn');
      if (inp) {
        inp.focus();
        inp.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') submitHard();
        });
      }
      if (btn) btn.addEventListener('click', submitHard);
    } else {
      // Multiple choice
      var correct = primaryCmdlet(q.command);
      var wrongs = DATA.filter(function (c) { return c.id !== q.id; });
      wrongs = shuffle(wrongs).slice(0, 3).map(function (c) { return primaryCmdlet(c.command); });

      // Ensure no duplicates with correct
      var seen = {};
      seen[correct.toLowerCase()] = true;
      var filtered = [];
      for (var i = 0; i < wrongs.length; i++) {
        var w = wrongs[i];
        if (!seen[w.toLowerCase()]) {
          seen[w.toLowerCase()] = true;
          filtered.push(w);
        }
      }
      // Backfill if duplicates removed
      if (filtered.length < 3) {
        var extra = DATA.filter(function (c) { return !seen[primaryCmdlet(c.command).toLowerCase()]; });
        extra = shuffle(extra);
        for (var j = 0; j < extra.length && filtered.length < 3; j++) {
          var ec = primaryCmdlet(extra[j].command);
          if (!seen[ec.toLowerCase()]) {
            seen[ec.toLowerCase()] = true;
            filtered.push(ec);
          }
        }
      }

      G.choices = shuffle([correct].concat(filtered.slice(0, 3)));

      var html = '';
      G.choices.forEach(function (ch, idx) {
        html += '<button class="cliquiz-choice" data-idx="' + idx + '">' +
          '<span class="cliquiz-choice-key">' + String.fromCharCode(65 + idx) + '</span>' +
          '<code>' + esc(ch) + '</code>' +
        '</button>';
      });
      cEl.innerHTML = html;
    }

    startTimer();
  }

  /* ── Hard mode submit ────────────────────────────────────── */
  function submitHard() {
    if (G.answered) return;
    var inp = $('cliquiz-answer-input');
    if (!inp) return;
    var answer = (inp.value || '').trim().toLowerCase();
    if (!answer) return;

    G.answered = true;
    stopTimer();
    inp.disabled = true;

    var q = G.questions[G.current];
    var accepted = (q.accepted_commands || []).map(function (c) { return c.toLowerCase().trim(); });
    accepted.push(q.command.toLowerCase().trim());
    accepted.push(primaryCmdlet(q.command).toLowerCase().trim());

    // Deduplicate
    var unique = [];
    var uSeen = {};
    accepted.forEach(function (a) {
      if (!uSeen[a]) { uSeen[a] = true; unique.push(a); }
    });

    var isCorrect = false;
    var isClose = false;

    for (var i = 0; i < unique.length; i++) {
      if (answer === unique[i]) { isCorrect = true; break; }
    }

    if (!isCorrect) {
      for (var j = 0; j < unique.length; j++) {
        if (unique[j].indexOf(answer) === 0 || answer.indexOf(unique[j]) === 0) {
          isClose = true; break;
        }
      }
    }

    if (isCorrect) {
      G.score++;
      inp.classList.add('cliquiz-input--correct');
    } else if (isClose) {
      inp.classList.add('cliquiz-input--close');
    } else {
      inp.classList.add('cliquiz-input--wrong');
    }

    var label = isCorrect ? 'Correct!' : isClose ? 'Close!' : 'Wrong';
    var cls = isCorrect ? 'correct' : isClose ? 'close' : 'wrong';

    showFeedback(q, cls, label);
    updateMastery(q.category, isCorrect);
    updateScore();
    showNextButton();
  }

  /* ── Select answer (multiple choice) ─────────────────────── */
  function selectAnswer(idx) {
    if (G.answered) return;
    G.answered = true;
    stopTimer();

    var q = G.questions[G.current];
    var correct = primaryCmdlet(q.command);
    var chosen = G.choices[idx];
    var isCorrect = chosen.toLowerCase() === correct.toLowerCase();

    if (isCorrect) G.score++;

    // Highlight choices
    var buttons = document.querySelectorAll('.cliquiz-choice');
    buttons.forEach(function (btn) {
      var bIdx = parseInt(btn.getAttribute('data-idx'), 10);
      btn.disabled = true;
      if (G.choices[bIdx].toLowerCase() === correct.toLowerCase()) {
        btn.classList.add('cliquiz-choice--correct');
      } else if (bIdx === idx) {
        btn.classList.add('cliquiz-choice--wrong');
      }
    });

    var label = isCorrect ? 'Correct!' : 'Wrong';
    var cls = isCorrect ? 'correct' : 'wrong';

    showFeedback(q, cls, label);
    updateMastery(q.category, isCorrect);
    updateScore();
    showNextButton();
  }

  /* ── Reveal on timeout ───────────────────────────────────── */
  function revealAnswer(q, chosenIdx) {
    if (G.mode === 'hard') {
      var inp = $('cliquiz-answer-input');
      if (inp) { inp.disabled = true; inp.classList.add('cliquiz-input--wrong'); }
    } else {
      var correct = primaryCmdlet(q.command);
      document.querySelectorAll('.cliquiz-choice').forEach(function (btn) {
        var bIdx = parseInt(btn.getAttribute('data-idx'), 10);
        btn.disabled = true;
        if (G.choices[bIdx].toLowerCase() === correct.toLowerCase()) {
          btn.classList.add('cliquiz-choice--correct');
        }
      });
    }

    showFeedback(q, 'wrong', 'Time\u2019s up!');
    updateMastery(q.category, false);
    updateScore();
    showNextButton();
  }

  /* ── Feedback card ───────────────────────────────────────── */
  function showFeedback(q, cls, label) {
    var fbEl = $('cliquiz-feedback');
    if (!fbEl) return;
    fbEl.innerHTML =
      '<div class="cliquiz-feedback cliquiz-feedback--' + cls + '">' +
        '<div class="cliquiz-feedback-label">' + esc(label) + '</div>' +
        '<div class="cliquiz-feedback-cmd"><code>' + esc(q.command) + '</code></div>' +
        (q.explanation ? '<p class="cliquiz-feedback-explain">' + esc(q.explanation) + '</p>' : '') +
        (q.learn_url ? '<a href="' + esc(q.learn_url) + '" target="_blank" rel="noopener noreferrer" class="cliquiz-learn-link">Learn more \u2192</a>' : '') +
      '</div>';
  }

  /* ── Next button ─────────────────────────────────────────── */
  function showNextButton() {
    var navEl = $('cliquiz-nav');
    if (!navEl) return;
    var isLast = G.current >= G.total - 1;
    navEl.innerHTML =
      '<button class="cliquiz-btn cliquiz-btn--next" id="cliquiz-next-btn">' +
        (isLast ? 'See Results' : 'Next \u2192') +
      '</button>';
    $('cliquiz-next-btn').addEventListener('click', nextQuestion);
  }

  function nextQuestion() {
    G.current++;
    G.answered = false;
    showQuestion();
  }

  /* ── Score display ───────────────────────────────────────── */
  function updateScore() {
    var el = $('quiz-score');
    if (!el) return;
    el.innerHTML =
      '<span class="cliquiz-score-num">' + G.score + '</span>' +
      '<span class="cliquiz-score-sep">/</span>' +
      '<span class="cliquiz-score-den">' + G.total + '</span>';
  }

  /* ── Mastery tracking ────────────────────────────────────── */
  function updateMastery(cat, correct) {
    var m = safeGet('cliquiz_mastery', {});
    if (!m[cat]) m[cat] = { correct: 0, total: 0 };
    m[cat].total++;
    if (correct) m[cat].correct++;
    safeSet('cliquiz_mastery', m);
  }

  /* ── Results screen ──────────────────────────────────────── */
  function showResults() {
    stopTimer();
    var area = $('quiz-area');
    if (!area) return;

    var percentage = pct(G.score, G.total);
    var emoji = percentage >= 90 ? '\uD83C\uDF1F' :
                percentage >= 70 ? '\uD83C\uDF89' :
                percentage >= 50 ? '\uD83D\uDC4D' : '\uD83D\uDCAA';

    // Per-category breakdown for this quiz
    var catBreak = {};
    G.questions.forEach(function (q, i) {
      if (!catBreak[q.category]) catBreak[q.category] = { correct: 0, total: 0 };
      catBreak[q.category].total++;
    });

    // Replay answers to compute per-category correct (approximate from mastery delta)
    // We track via the mastery store, but for this quiz we need session data
    // Simpler: re-check is not possible, so show overall only + category totals
    var breakdownHtml = '';
    var cats = Object.keys(catBreak).sort();
    if (cats.length > 1) {
      breakdownHtml = '<div class="cliquiz-result-breakdown"><h4>Categories covered</h4><ul>';
      cats.forEach(function (c) {
        breakdownHtml += '<li><span class="cliquiz-badge cliquiz-badge--cat">' + esc(c) + '</span> ' +
          catBreak[c].total + ' question' + (catBreak[c].total !== 1 ? 's' : '') + '</li>';
      });
      breakdownHtml += '</ul></div>';
    }

    area.innerHTML =
      '<div class="cliquiz-results">' +
        '<div class="cliquiz-results-emoji">' + emoji + '</div>' +
        '<div class="cliquiz-results-score">' + G.score + ' / ' + G.total + '</div>' +
        '<div class="cliquiz-results-pct">' + percentage + '%</div>' +
        '<p class="cliquiz-results-msg">' + resultMessage(percentage) + '</p>' +
        breakdownHtml +
        '<div class="cliquiz-results-actions">' +
          '<button class="cliquiz-btn cliquiz-btn--primary" id="cliquiz-replay">Play Again</button>' +
          '<button class="cliquiz-btn cliquiz-btn--ghost" id="cliquiz-to-stats">View Stats</button>' +
        '</div>' +
      '</div>';

    // Save history
    var history = safeGet('cliquiz_history', []);
    history.unshift({
      date: new Date().toISOString(),
      mode: G.mode,
      score: G.score,
      total: G.total,
      category: G.category,
      pct: percentage
    });
    if (history.length > 50) history = history.slice(0, 50);
    safeSet('cliquiz_history', history);

    // Bind actions
    var replay = $('cliquiz-replay');
    if (replay) replay.addEventListener('click', function () { startQuiz(G.mode, G.category); });
    var toStats = $('cliquiz-to-stats');
    if (toStats) toStats.addEventListener('click', function () {
      var statsTab = document.querySelector('.cliquiz-tab[data-tab="stats"]');
      if (statsTab) statsTab.click();
    });

    $('quiz-score').innerHTML = '';
  }

  function resultMessage(p) {
    if (p >= 90) return 'Outstanding! You really know your CLI commands.';
    if (p >= 70) return 'Great job! A few more to master.';
    if (p >= 50) return 'Not bad \u2014 keep practising and you\u2019ll nail them all.';
    return 'Keep at it! Every expert was once a beginner.';
  }

  /* ── Stats panel ─────────────────────────────────────────── */
  function renderStats() {
    var history = safeGet('cliquiz_history', []);
    var mastery = safeGet('cliquiz_mastery', {});

    // Overall stats
    var totalQuizzes = history.length;
    var totalAnswered = 0;
    var totalCorrect = 0;
    var bestPct = 0;
    history.forEach(function (h) {
      totalAnswered += h.total || 0;
      totalCorrect += h.score || 0;
      if ((h.pct || 0) > bestPct) bestPct = h.pct;
    });
    var avgPct = totalQuizzes ? Math.round(totalCorrect / totalAnswered * 100) : 0;

    var statsEl = $('quiz-stats');
    if (statsEl) {
      statsEl.innerHTML =
        '<div class="cliquiz-stats-grid">' +
          statCard('Quizzes Played', totalQuizzes) +
          statCard('Best Score', bestPct + '%') +
          statCard('Average', (avgPct || 0) + '%') +
          statCard('Commands Answered', totalAnswered) +
        '</div>';
    }

    // Category mastery
    var mastEl = $('category-mastery');
    if (mastEl) {
      var cats = Object.keys(mastery).sort();
      if (!cats.length) {
        mastEl.innerHTML = '<p class="cliquiz-empty">Play a quiz to see category mastery.</p>';
      } else {
        var html = '<div class="cliquiz-mastery-list">';
        cats.forEach(function (cat) {
          var m = mastery[cat];
          var p = pct(m.correct, m.total);
          html +=
            '<div class="cliquiz-mastery-row">' +
              '<span class="cliquiz-mastery-cat">' + esc(cat) + '</span>' +
              '<div class="cliquiz-mastery-bar-wrap">' +
                '<div class="cliquiz-mastery-bar" style="width:' + p + '%"></div>' +
              '</div>' +
              '<span class="cliquiz-mastery-val">' + m.correct + '/' + m.total + ' (' + p + '%)</span>' +
            '</div>';
        });
        html += '</div>';
        mastEl.innerHTML = html;
      }
    }

    // History
    var histEl = $('quiz-history');
    if (histEl) {
      if (!history.length) {
        histEl.innerHTML = '<p class="cliquiz-empty">No quiz history yet.</p>';
      } else {
        var rows = '';
        history.slice(0, 20).forEach(function (h) {
          var modeLbl = h.mode === 'quick10' ? 'Quick 10' :
                        h.mode === 'daily' ? 'Daily' :
                        h.mode === 'hard' ? 'Hard' :
                        h.mode === 'category' ? esc(h.category) : esc(h.mode);
          rows +=
            '<tr>' +
              '<td>' + fmtDate(h.date) + '</td>' +
              '<td>' + modeLbl + '</td>' +
              '<td>' + h.score + '/' + h.total + '</td>' +
              '<td>' + (h.pct || 0) + '%</td>' +
            '</tr>';
        });
        histEl.innerHTML =
          '<table class="cliquiz-history-table">' +
            '<thead><tr><th>Date</th><th>Mode</th><th>Score</th><th>%</th></tr></thead>' +
            '<tbody>' + rows + '</tbody>' +
          '</table>';
      }
    }
  }

  function statCard(label, value) {
    return '<div class="cliquiz-stat-card">' +
      '<div class="cliquiz-stat-val">' + esc(String(value)) + '</div>' +
      '<div class="cliquiz-stat-label">' + esc(label) + '</div>' +
    '</div>';
  }

  /* ── Render mode/category selectors ──────────────────────── */
  function renderModeArea() {
    var area = $('quiz-area');
    if (!area) return;

    var catChips = '<button class="cliquiz-chip active" data-cat="all">All</button>';
    CATEGORIES.forEach(function (c) {
      catChips += '<button class="cliquiz-chip" data-cat="' + esc(c) + '">' + esc(c) + '</button>';
    });

    area.innerHTML =
      '<div class="cliquiz-start-screen">' +
        '<h3 class="cliquiz-start-title">Choose your challenge</h3>' +
        '<p class="cliquiz-start-sub">' + DATA.length + ' real IT admin tasks across ' + CATEGORIES.length + ' categories</p>' +
        '<div class="cliquiz-mode-grid">' +
          modeCard('quick10', '\u26A1', 'Quick 10', '10 random commands, multiple choice') +
          modeCard('category', '\uD83D\uDCC2', 'By Category', 'Focus on a specific module') +
          modeCard('daily', '\uD83D\uDCC5', 'Daily Quiz', 'Same 10 questions for everyone today') +
          modeCard('hard', '\uD83D\uDD25', 'Hard Mode', 'No choices \u2014 type the command') +
        '</div>' +
        '<div class="cliquiz-cat-filter" id="cliquiz-cat-filter">' +
          '<label class="cliquiz-filter-label">Filter by category:</label>' +
          '<div class="cliquiz-chip-row">' + catChips + '</div>' +
        '</div>' +
        '<div class="cliquiz-sample">' +
          '<div class="cliquiz-sample-label">Sample question:</div>' +
          '<div class="cliquiz-sample-task">' + esc(DATA[0] ? DATA[0].task : '') + '</div>' +
        '</div>' +
      '</div>';

    bindStartHandlers();
  }

  function modeCard(mode, icon, title, desc) {
    return '<button class="cliquiz-mode-btn" data-mode="' + mode + '">' +
      '<span class="cliquiz-mode-icon">' + icon + '</span>' +
      '<span class="cliquiz-mode-title">' + esc(title) + '</span>' +
      '<span class="cliquiz-mode-desc">' + esc(desc) + '</span>' +
    '</button>';
  }

  /* ── Event binding ───────────────────────────────────────── */
  function bindStartHandlers() {
    document.querySelectorAll('.cliquiz-mode-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var mode = btn.getAttribute('data-mode');
        startQuiz(mode, G.category);
      });
    });

    document.querySelectorAll('.cliquiz-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        document.querySelectorAll('.cliquiz-chip').forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        G.category = chip.getAttribute('data-cat');
      });
    });
  }

  function bindChoiceClicks() {
    var area = $('quiz-area');
    if (!area) return;
    area.addEventListener('click', function (e) {
      var btn = e.target.closest('.cliquiz-choice');
      if (!btn) return;
      var idx = parseInt(btn.getAttribute('data-idx'), 10);
      if (!isNaN(idx)) selectAnswer(idx);
    });
  }

  /* Keyboard shortcuts: A/B/C/D for choices, Enter for next */
  function bindKeyboard() {
    document.addEventListener('keydown', function (e) {
      // Don't intercept if typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      // Don't intercept if not on play panel
      var playPanel = $('panel-play');
      if (!playPanel || !playPanel.classList.contains('active')) return;

      var key = e.key.toUpperCase();
      if (!G.answered && G.mode !== 'hard') {
        var idx = key.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
        if (idx >= 0 && idx <= 3 && G.choices[idx]) {
          e.preventDefault();
          selectAnswer(idx);
        }
      }

      if (G.answered && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        var nextBtn = $('cliquiz-next-btn');
        if (nextBtn) nextBtn.click();
      }
    });
  }

  /* ── Init ────────────────────────────────────────────────── */
  function init() {
    initTabs();
    bindChoiceClicks();
    bindKeyboard();
    renderModeArea();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
