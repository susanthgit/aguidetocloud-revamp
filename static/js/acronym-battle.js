/* ============================================================================
   Tech Acronym Battle — acronym-battle.js
   100% client-side, zero API calls
   ============================================================================ */
(function () {
  'use strict';

  const ALL = window.__acronyms || [];
  const QUICK_COUNT = 10;
  let mode = 'quick'; // quick | marathon | daily | learn
  let questions = [];
  let current = 0;
  let score = 0;
  let streak = 0;
  let bestStreak = 0;
  let totalCorrect = 0;
  let totalAnswered = 0;
  let answered = false;
  let stats = loadStats();
  let timer = null;
  let timerStart = 0;
  const TIMER_SECONDS = 10;

  // ── Seeded RNG ───────────────────────────────────────────────────────────
  function mulberry32(s) {
    return function () {
      s |= 0; s = s + 0x6D2B79F5 | 0;
      let t = Math.imul(s ^ s >>> 15, 1 | s);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function seedFromDate() {
    const d = new Date().toISOString().slice(0, 10);
    let h = 0;
    for (let i = 0; i < d.length; i++) h = Math.imul(31, h) + d.charCodeAt(i) | 0;
    return h;
  }

  function shuffle(arr, rng) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor((rng || Math.random)() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  // ── Filtered set ─────────────────────────────────────────────────────────
  function getFiltered() {
    const cat = document.getElementById('cat-filter').value;
    return cat === 'all' ? ALL : ALL.filter(a => a.category === cat);
  }

  // ── Generate distractors ─────────────────────────────────────────────────
  function generateOptions(correct, rng) {
    const correctAnswer = correct.accepted_answers[0];
    const others = ALL.filter(a => a.id !== correct.id).map(a => a.accepted_answers[0]);
    const distractors = shuffle(others, rng).slice(0, 3);
    const options = shuffle([correctAnswer, ...distractors], rng);
    return options;
  }

  // ── Start game ───────────────────────────────────────────────────────────
  function startGame() {
    const filtered = getFiltered();
    if (filtered.length < 4) {
      alert('Need at least 4 acronyms. Try "All Categories".');
      return;
    }

    score = 0; streak = 0; bestStreak = 0; current = 0;
    totalCorrect = 0; totalAnswered = 0;

    const rng = mode === 'daily' ? mulberry32(seedFromDate()) : null;
    const shuffled = shuffle(filtered, rng || Math.random);
    const count = mode === 'marathon' ? shuffled.length : QUICK_COUNT;
    questions = shuffled.slice(0, Math.min(count, shuffled.length));

    document.getElementById('acro-start').style.display = 'none';
    document.getElementById('acro-results').style.display = 'none';
    document.getElementById('acro-game').style.display = 'block';
    document.getElementById('hud-progress-wrap').style.display = mode === 'marathon' ? 'none' : '';

    showQuestion();
  }

  // ── Show question ────────────────────────────────────────────────────────
  function showQuestion() {
    if (current >= questions.length) { endGame(); return; }
    answered = false;
    stopTimer();
    const q = questions[current];
    document.getElementById('acro-acronym').textContent = q.acronym;
    document.getElementById('acro-category').textContent = q.category;
    document.getElementById('hud-score').textContent = score;
    document.getElementById('hud-streak').textContent = streak;
    if (mode !== 'marathon') {
      document.getElementById('hud-progress').textContent = `${current + 1}/${questions.length}`;
    }
    document.getElementById('acro-feedback').style.display = 'none';

    if (mode === 'learn') {
      // Learn mode: show answer immediately, no options
      const el = document.getElementById('acro-options');
      el.innerHTML = `<div class="acro-learn-answer">
        <div style="color:var(--acro-accent);font-weight:700;font-size:1.1rem;margin-bottom:0.3rem">${esc(q.accepted_answers[0])}</div>
        <div style="color:rgba(255,255,255,0.6);font-size:0.85rem">${esc(q.explanation || '')}</div>
        <button class="acro-btn acro-btn-primary" style="margin-top:0.8rem" onclick="document.getElementById('btn-next').click()">Next →</button>
      </div>`;
      hideTimerBar();
      return;
    }

    const options = generateOptions(q);
    const el = document.getElementById('acro-options');
    el.innerHTML = '';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'acro-option';
      btn.textContent = opt;
      btn.addEventListener('click', () => handleAnswer(opt, q, btn));
      el.appendChild(btn);
    });

    startTimer();
  }

  // ── Timer ────────────────────────────────────────────────────────────────
  function startTimer() {
    const bar = document.getElementById('acro-timer-bar');
    if (!bar) return;
    bar.style.display = 'block';
    timerStart = Date.now();
    const questionAtStart = current;
    bar.querySelector('.acro-timer-fill').style.width = '100%';
    bar.querySelector('.acro-timer-fill').style.transition = `width ${TIMER_SECONDS}s linear`;
    requestAnimationFrame(() => {
      bar.querySelector('.acro-timer-fill').style.width = '0%';
    });
    timer = setTimeout(() => {
      if (!answered && current === questionAtStart) handleTimeout();
    }, TIMER_SECONDS * 1000);
  }

  function stopTimer() {
    if (timer) { clearTimeout(timer); timer = null; }
  }

  function hideTimerBar() {
    const bar = document.getElementById('acro-timer-bar');
    if (bar) bar.style.display = 'none';
  }

  function handleTimeout() {
    if (answered) return;
    answered = true;
    totalAnswered++;
    streak = 0;
    document.querySelectorAll('.acro-option').forEach(o => {
      o.classList.add('disabled');
      const q = questions[current];
      if (q.accepted_answers.some(a => a.toLowerCase() === o.textContent.toLowerCase())) {
        o.classList.add('correct');
      }
    });
    document.getElementById('hud-streak').textContent = streak;
    document.getElementById('feedback-icon').textContent = '⏰';
    document.getElementById('feedback-answer').textContent = questions[current].accepted_answers[0];
    document.getElementById('feedback-explanation').textContent = 'Time\'s up! ' + (questions[current].explanation || '');
    const learnEl = document.getElementById('feedback-learn');
    if (learnEl) {
      const q = questions[current];
      const searchTerm = encodeURIComponent(q.acronym + ' ' + q.accepted_answers[0]);
      learnEl.innerHTML = `<a href="https://learn.microsoft.com/search/?terms=${searchTerm}" target="_blank" rel="noopener noreferrer" style="color:var(--acro-accent);font-size:0.8rem;text-decoration:none">📚 Learn more on Microsoft Learn ↗</a>`;
    }
    document.getElementById('acro-feedback').style.display = 'block';
  }

  // ── Handle answer ────────────────────────────────────────────────────────
  function handleAnswer(selected, question, btn) {
    if (answered) return;
    answered = true;
    stopTimer();
    totalAnswered++;

    const isCorrect = question.accepted_answers.some(
      a => a.toLowerCase() === selected.toLowerCase()
    );

    // Disable all options
    document.querySelectorAll('.acro-option').forEach(o => {
      o.classList.add('disabled');
      if (question.accepted_answers.some(a => a.toLowerCase() === o.textContent.toLowerCase())) {
        o.classList.add('correct');
      }
    });

    if (isCorrect) {
      score += 10 + streak;
      streak++;
      bestStreak = Math.max(bestStreak, streak);
      totalCorrect++;
      btn.classList.add('correct');
      document.getElementById('feedback-icon').textContent = '✅';
    } else {
      streak = 0;
      btn.classList.add('wrong');
      document.getElementById('feedback-icon').textContent = '❌';
    }

    // Track per-category
    const cat = question.category || 'general';
    if (!stats.categories) stats.categories = {};
    if (!stats.categories[cat]) stats.categories[cat] = { correct: 0, total: 0 };
    stats.categories[cat].total++;
    if (isCorrect) stats.categories[cat].correct++;

    document.getElementById('hud-score').textContent = score;
    document.getElementById('hud-streak').textContent = streak;
    document.getElementById('feedback-answer').textContent = question.accepted_answers[0];
    document.getElementById('feedback-explanation').textContent = question.explanation || '';

    // Learn more link
    const learnEl = document.getElementById('feedback-learn');
    if (learnEl) {
      if (!isCorrect && question.category) {
        const searchTerm = encodeURIComponent(question.acronym + ' ' + question.accepted_answers[0]);
        learnEl.innerHTML = `<a href="https://learn.microsoft.com/search/?terms=${searchTerm}" target="_blank" rel="noopener noreferrer" style="color:var(--acro-accent);font-size:0.8rem;text-decoration:none">📚 Learn more on Microsoft Learn ↗</a>`;
      } else {
        learnEl.innerHTML = '';
      }
    }

    document.getElementById('acro-feedback').style.display = 'block';
  }

  // ── Next question ────────────────────────────────────────────────────────
  function nextQuestion() {
    current++;
    showQuestion();
  }

  // ── End game ─────────────────────────────────────────────────────────────
  function endGame() {
    document.getElementById('acro-game').style.display = 'none';
    document.getElementById('acro-results').style.display = 'block';

    const pct = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
    let grade = '🏆';
    if (pct >= 90) grade = '🏆 Expert!';
    else if (pct >= 70) grade = '⭐ Great job!';
    else if (pct >= 50) grade = '👍 Good effort!';
    else grade = '📚 Keep learning!';

    document.getElementById('results-score').textContent = `${score} points`;
    document.getElementById('results-detail').innerHTML =
      `${esc(grade)}<br>${totalCorrect}/${totalAnswered} correct (${pct}%)<br>Best streak: ${bestStreak}🔥`;

    // Save stats
    stats.played++;
    stats.bestScore = Math.max(stats.bestScore, score);
    stats.bestStreak = Math.max(stats.bestStreak, bestStreak);
    stats.totalCorrect += totalCorrect;
    stats.totalAnswered += totalAnswered;
    saveStats();
    renderStats();
  }

  // ── Share ────────────────────────────────────────────────────────────────
  function shareScore() {
    const pct = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
    const text = `🧠 Tech Acronym Battle: ${score} pts | ${totalCorrect}/${totalAnswered} (${pct}%) | Streak: ${bestStreak}🔥\n\nTest yours: ${window.location.origin}/acronym-battle/`;
    if (navigator.share) {
      navigator.share({ title: 'Acronym Battle Score', text });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => alert('Score copied to clipboard!'));
    }
  }

  function generateShareCard() {
    const pct = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
    const canvas = document.createElement('canvas');
    canvas.width = 600; canvas.height = 340;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0a0a14'; ctx.fillRect(0, 0, 600, 340);
    ctx.fillStyle = '#9B59B6'; ctx.fillRect(0, 0, 600, 4);

    ctx.fillStyle = '#9B59B6'; ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillText('🧠 Tech Acronym Battle', 30, 50);

    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 64px Inter, sans-serif';
    ctx.fillText(`${pct}%`, 30, 130);

    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '18px Inter, sans-serif';
    ctx.fillText(`${totalCorrect}/${totalAnswered} correct · ${score} pts · Streak: ${bestStreak}🔥`, 30, 170);

    let grade = pct >= 90 ? 'Expert!' : pct >= 70 ? 'Great job!' : pct >= 50 ? 'Good effort!' : 'Keep learning!';
    ctx.fillStyle = pct >= 70 ? '#2ECC71' : '#F39C12'; ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillText(grade, 30, 210);

    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '14px Inter, sans-serif';
    ctx.fillText('aguidetocloud.com/acronym-battle', 30, 310);

    const link = document.createElement('a');
    link.download = 'acronym-score.png'; link.href = canvas.toDataURL('image/png'); link.click();
  }

  // ── Stats ────────────────────────────────────────────────────────────────
  function loadStats() {
    try {
      return JSON.parse(localStorage.getItem('acro_stats')) || defaultStats();
    } catch { return defaultStats(); }
  }
  function defaultStats() {
    return { played: 0, bestScore: 0, bestStreak: 0, totalCorrect: 0, totalAnswered: 0, categories: {} };
  }
  function saveStats() {
    try { localStorage.setItem('acro_stats', JSON.stringify(stats)); } catch {}
  }
  function renderStats() {
    document.getElementById('stat-played').textContent = stats.played;
    document.getElementById('stat-best').textContent = stats.bestScore;
    document.getElementById('stat-streak').textContent = stats.bestStreak;
    const acc = stats.totalAnswered > 0 ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) : 0;
    document.getElementById('stat-accuracy').textContent = acc + '%';

    // Category mastery
    const masteryEl = document.getElementById('category-mastery');
    if (masteryEl && stats.categories) {
      const cats = Object.entries(stats.categories).sort((a, b) => {
        const pctA = a[1].total > 0 ? a[1].correct / a[1].total : 0;
        const pctB = b[1].total > 0 ? b[1].correct / b[1].total : 0;
        return pctB - pctA;
      });
      if (cats.length > 0) {
        masteryEl.innerHTML = '<div style="color:rgba(255,255,255,0.5);font-size:0.8rem;margin-bottom:0.6rem;font-weight:600;text-transform:uppercase">Category Mastery</div>' +
          cats.map(([cat, d]) => {
            const pct = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
            const color = pct >= 80 ? '#2ECC71' : pct >= 50 ? '#F39C12' : '#E74C3C';
            return `<div style="margin-bottom:0.5rem">
              <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:rgba(255,255,255,0.7);margin-bottom:0.2rem">
                <span style="text-transform:capitalize">${cat}</span>
                <span>${pct}% (${d.correct}/${d.total})</span>
              </div>
              <div style="height:6px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden">
                <div style="height:100%;width:${pct}%;background:${color};border-radius:3px;transition:width 0.5s"></div>
              </div>
            </div>`;
          }).join('');
      }
    }
  }

  // ── Tabs ─────────────────────────────────────────────────────────────────
  function initTabs() {
    document.querySelectorAll('.acro-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.acro-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        document.querySelectorAll('.acro-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        const p = document.getElementById('panel-' + tab.dataset.tab);
        if (p) p.classList.add('active');
      });
    });
  }

  // ── Mode switching ───────────────────────────────────────────────────────
  function initModes() {
    document.querySelectorAll('.acro-mode').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.acro-mode').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        mode = btn.dataset.mode;
      });
    });
  }

  // ── Init ─────────────────────────────────────────────────────────────────
  function init() {
    initTabs();
    initModes();
    renderStats();

    document.getElementById('btn-start').addEventListener('click', startGame);
    document.getElementById('btn-next').addEventListener('click', nextQuestion);
    document.getElementById('btn-play-again').addEventListener('click', () => {
      document.getElementById('acro-results').style.display = 'none';
      document.getElementById('acro-start').style.display = 'block';
    });
    document.getElementById('btn-share-score').addEventListener('click', shareScore);
    document.getElementById('btn-share-card').addEventListener('click', generateShareCard);
    document.getElementById('btn-clear-stats').addEventListener('click', () => {
      if (confirm('Clear all stats?')) {
        stats = defaultStats(); saveStats(); renderStats();
      }
    });

    // Keyboard: Enter for next
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && answered && document.getElementById('acro-game').style.display !== 'none') {
        nextQuestion();
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
