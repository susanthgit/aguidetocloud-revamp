/* ============================================================================
   Phishing Simulator — phishing-test.js
   ============================================================================ */
(function () {
  'use strict';

  const ALL = window.__phishScenarios || [];
  let difficulty = 'all';
  let questions = [];
  let current = 0;
  let score = 0;
  let streak = 0;
  let bestStreak = 0;
  let correct = 0;
  let answered = false;
  let results = []; // track each answer for post-game report

  function esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

  // Seeded RNG for daily challenge
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
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

  let isDaily = false;

  function getFiltered() {
    if (difficulty === 'all') return ALL;
    return ALL.filter(s => String(s.difficulty) === difficulty);
  }

  function startGame() {
    const filtered = getFiltered();
    if (filtered.length === 0) { alert('No scenarios for this difficulty. Try "All Levels".'); return; }
    const rng = isDaily ? mulberry32(seedFromDate()) : null;
    questions = shuffle(filtered, rng).slice(0, Math.min(10, filtered.length));
    if (questions.length === 0) return;
    isDaily = false;
    current = 0; score = 0; streak = 0; bestStreak = 0; correct = 0; results = [];

    document.getElementById('phish-start').style.display = 'none';
    document.getElementById('phish-results').style.display = 'none';
    document.getElementById('phish-game').style.display = 'block';
    showQuestion();
  }

  function showQuestion() {
    if (current >= questions.length) { endGame(); return; }
    answered = false;
    const s = questions[current];

    document.getElementById('email-from').textContent = s.sender_name;
    document.getElementById('email-addr').textContent = '<' + s.sender_email + '>';
    document.getElementById('email-subject').textContent = s.subject;
    document.getElementById('email-body').textContent = s.body;

    document.getElementById('hud-score').textContent = score;
    document.getElementById('hud-streak').textContent = streak;
    document.getElementById('hud-progress').textContent = `${current + 1}/${questions.length}`;

    document.getElementById('phish-feedback').style.display = 'none';
    document.querySelectorAll('.phish-choice').forEach(c => {
      c.classList.remove('disabled', 'correct', 'wrong');
    });
  }

  function handleChoice(chosen) {
    if (answered) return;
    answered = true;
    const s = questions[current];
    const isCorrect = chosen === s.verdict;

    // Highlight buttons
    document.querySelectorAll('.phish-choice').forEach(c => {
      c.classList.add('disabled');
      if (c.dataset.answer === s.verdict) c.classList.add('correct');
    });
    if (!isCorrect) {
      document.querySelector(`[data-answer="${chosen}"]`).classList.add('wrong');
    }

    if (isCorrect) {
      score += 10 + streak * 2;
      streak++;
      bestStreak = Math.max(bestStreak, streak);
      correct++;
    } else {
      streak = 0;
    }

    results.push({ scenario: s, chosen, isCorrect, verdict: s.verdict });

    document.getElementById('hud-score').textContent = score;
    document.getElementById('hud-streak').textContent = streak;

    // Feedback
    const fv = document.getElementById('feedback-verdict');
    fv.textContent = isCorrect ? '✅ Correct!' : `❌ Wrong — it was ${s.verdict.toUpperCase()}`;
    fv.className = 'phish-feedback-verdict ' + (isCorrect ? 'correct' : 'wrong');

    document.getElementById('feedback-explanation').textContent = s.explanation || '';

    const flagsEl = document.getElementById('feedback-flags');
    const flags = s.red_flags || [];
    if (flags.length > 0) {
      flagsEl.innerHTML = '<div style="color:rgba(255,255,255,0.5);font-size:0.75rem;margin-bottom:0.3rem">Red flags to remember:</div>' +
        flags.map(f => `<div class="phish-flag">${esc(f)}</div>`).join('');

      // Highlight red flags in the email body
      highlightRedFlags(s);
    } else {
      flagsEl.innerHTML = '<div style="color:rgba(46,204,113,0.7);font-size:0.8rem">✅ This is a legitimate email — no red flags.</div>';
    }

    document.getElementById('phish-feedback').style.display = 'block';
  }

  // ── Highlight red flags in email after answer ────────────────────────────
  // SAFETY: bodyText is esc()'d first, then we inject trusted CSS class spans.
  // Scenario data is server-rendered from TOML — never from URL params or user input.
  function highlightRedFlags(scenario) {
    const bodyEl = document.getElementById('email-body');
    const addrEl = document.getElementById('email-addr');
    let bodyText = scenario.body;

    // Highlight suspicious domain in sender
    if (scenario.verdict === 'phishing' && scenario.sender_email) {
      const domain = scenario.sender_email.split('@')[1] || '';
      if (domain) {
        addrEl.innerHTML = '&lt;' + esc(scenario.sender_email.split('@')[0]) + '@<span class="phish-highlight">' + esc(domain) + '</span>&gt;';
      }
    }

    // Highlight suspicious URLs in body
    bodyText = esc(bodyText).replace(/(https?:\/\/[^\s\n]+)/g, (url) => {
      if (scenario.verdict === 'phishing') {
        return `<span class="phish-highlight">${url}</span>`;
      }
      return `<span class="phish-safe-highlight">${url}</span>`;
    });

    // Highlight urgency keywords
    if (scenario.verdict === 'phishing') {
      const urgency = ['URGENT', 'immediately', 'within 24 hours', 'within 48 hours', 'end of business today', 'permanently disabled', 'forfeited', 'Act now', 'today'];
      urgency.forEach(word => {
        const regex = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        bodyText = bodyText.replace(regex, '<span class="phish-urgency-highlight">$1</span>');
      });
    }

    bodyEl.innerHTML = bodyText;
  }

  function nextQuestion() {
    current++;
    showQuestion();
  }

  function endGame() {
    document.getElementById('phish-game').style.display = 'none';
    document.getElementById('phish-results').style.display = 'block';

    const pct = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    let grade = '';
    if (pct >= 90) grade = '🛡️ Security Expert!';
    else if (pct >= 70) grade = '🔒 Good Eye!';
    else if (pct >= 50) grade = '⚠️ Needs Practice';
    else grade = '🎣 Easy Catch — Keep Learning!';

    document.getElementById('results-score').textContent = `${score} points`;

    // Build detailed report
    const missed = results.filter(r => !r.isCorrect);
    const phishMissed = missed.filter(r => r.verdict === 'phishing').length;
    const legitMissed = missed.filter(r => r.verdict === 'legit').length;
    const verifyMissed = missed.filter(r => r.verdict === 'verify').length;

    let reportHtml = `${esc(grade)}<br>${correct}/${questions.length} correct (${pct}%)<br>Best streak: ${bestStreak}🔥`;

    if (missed.length > 0) {
      // Weakness analysis
      let weakness = '';
      if (phishMissed >= legitMissed && phishMissed >= verifyMissed) weakness = 'Missed phishing — you may be too trusting of emails. Always check sender domains.';
      else if (legitMissed >= phishMissed) weakness = 'Flagged legitimate emails — you may be overly cautious. Check sender domains before assuming the worst.';
      else weakness = 'Missed verify scenarios — not every email is clearly safe or dangerous. When in doubt, verify via a separate channel.';

      reportHtml += `<div class="phish-report-weakness">${esc(weakness)}</div>`;

      // Missed scenario cards
      reportHtml += `<div class="phish-report-section">Scenarios you missed:</div>`;
      reportHtml += missed.map(r => {
        const flags = (r.scenario.red_flags || []).slice(0, 3);
        return `<div class="phish-report-card">
          <div class="phish-report-card-subject">${esc(r.scenario.subject)}</div>
          <div class="phish-report-card-meta">
            You said: <strong>${esc(r.chosen)}</strong> · Correct: <strong>${esc(r.verdict)}</strong>
          </div>
          ${flags.length > 0 ? '<div class="phish-report-card-flags">' + flags.map(f => '<span class="phish-report-flag">🚩 ' + esc(f) + '</span>').join('') + '</div>' : ''}
        </div>`;
      }).join('');
    } else {
      reportHtml += `<div class="phish-report-weakness" style="color:#2ECC71">Perfect score! You spotted every threat and trusted every legitimate email.</div>`;
    }

    document.getElementById('results-detail').innerHTML = reportHtml;
  }

  function shareScore() {
    const pct = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    const text = `🎣 Phishing Simulator: ${score} pts | ${correct}/${questions.length} (${pct}%)\n\nCan you do better? ${window.location.origin}/phishing-test/`;
    if (navigator.share) {
      navigator.share({ title: 'Phishing Test Results', text });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => alert('Score copied!'));
    }
  }

  function generateShareCard() {
    const pct = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    const canvas = document.createElement('canvas');
    canvas.width = 600; canvas.height = 340;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, 600, 340);

    // Accent bar
    ctx.fillStyle = '#E74C3C';
    ctx.fillRect(0, 0, 600, 4);

    // Title
    ctx.fillStyle = '#E74C3C';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillText('🎣 Is This Phishing?', 30, 50);

    // Score
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px Inter, sans-serif';
    ctx.fillText(`${pct}%`, 30, 130);

    // Details
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '18px Inter, sans-serif';
    ctx.fillText(`${correct}/${questions.length} correct · ${score} points · Streak: ${bestStreak}🔥`, 30, 170);

    // Grade
    let grade = pct >= 90 ? 'Security Expert' : pct >= 70 ? 'Good Eye' : pct >= 50 ? 'Needs Practice' : 'Keep Learning';
    ctx.fillStyle = pct >= 70 ? '#2ECC71' : '#F39C12';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillText(grade, 30, 210);

    // URL
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText('aguidetocloud.com/phishing-test', 30, 310);

    // Download
    const link = document.createElement('a');
    link.download = 'phishing-score.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  // Tabs with keyboard nav
  function initTabs() {
    const tabs = document.querySelectorAll('.phish-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab));
      tab.addEventListener('keydown', (e) => {
        const arr = [...tabs];
        const idx = arr.indexOf(tab);
        if (e.key === 'ArrowRight') { e.preventDefault(); arr[(idx + 1) % arr.length].focus(); arr[(idx + 1) % arr.length].click(); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); arr[(idx - 1 + arr.length) % arr.length].focus(); arr[(idx - 1 + arr.length) % arr.length].click(); }
      });
    });
    function switchTab(tab) {
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      document.querySelectorAll('.phish-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active'); tab.setAttribute('aria-selected', 'true');
      const p = document.getElementById('panel-' + tab.dataset.tab);
      if (p) p.classList.add('active');
    }
  }

  function init() {
    initTabs();

    // Difficulty selector
    document.querySelectorAll('.phish-diff').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.phish-diff').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        difficulty = btn.dataset.diff;
      });
    });

    // Choice buttons
    document.querySelectorAll('.phish-choice').forEach(btn => {
      btn.addEventListener('click', () => handleChoice(btn.dataset.answer));
    });

    document.getElementById('btn-start').addEventListener('click', startGame);
    document.getElementById('btn-daily').addEventListener('click', () => { isDaily = true; startGame(); });
    document.getElementById('btn-next').addEventListener('click', nextQuestion);
    document.getElementById('btn-retry').addEventListener('click', () => {
      document.getElementById('phish-results').style.display = 'none';
      document.getElementById('phish-start').style.display = 'block';
    });
    document.getElementById('btn-share').addEventListener('click', shareScore);
    document.getElementById('btn-share-card').addEventListener('click', generateShareCard);

    // Enter for next
    document.addEventListener('keydown', e => {
      if (e.key === 'Enter' && answered && document.getElementById('phish-game').style.display !== 'none') nextQuestion();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
