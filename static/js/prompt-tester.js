/**
 * 🔬 Prompt Tester — A/B Comparison UI Engine
 * Uses shared PromptCrafts core for analysis + rewrite
 */
(function () {
  'use strict';

  var analyse = window.PromptCrafts.analyse;
  var rewrite = window.PromptCrafts.rewrite;
  var PILLAR_META = window.PromptCrafts.PILLAR_META;

  /* ════════════════════════════════════════════
     EXAMPLE COMPARISONS
     ════════════════════════════════════════════ */

  var EXAMPLES = [
    {
      label: 'Vague vs Structured email',
      a: 'write an email to my boss about the project delay',
      b: 'You are a professional communication specialist. Write an email to my manager explaining that the Azure migration project will be delayed by 2 weeks due to unexpected licensing issues. Use a professional and reassuring tone. Include a revised timeline and next steps. Keep it under 200 words.'
    },
    {
      label: 'Basic vs Detailed blog post',
      a: 'write a blog post about AI',
      b: 'You are an experienced tech blogger. Write a 600-word blog post explaining how small businesses can start using AI tools like Microsoft Copilot. Use a friendly, beginner-friendly tone. Structure with headings, bullet points, and a practical "Getting Started" section. Avoid jargon and don\'t mention pricing.'
    },
    {
      label: 'Minimal vs Expert code review',
      a: 'review my code',
      b: 'You are a senior software engineer specializing in Python best practices. Review the following code for security vulnerabilities, performance issues, and PEP 8 compliance. Format your feedback as a numbered list with severity ratings (Critical/Warning/Info). Focus on the top 5 issues only.'
    },
    {
      label: 'Simple vs Rich data analysis',
      a: 'analyze our sales data and give me insights',
      b: 'You are a data analyst experienced in retail analytics. Analyze the Q1 2026 sales data focusing on: revenue trends by region, top 5 performing products, and customer retention rate. Present findings in a structured report with a summary table, 3 key insights, and 2 actionable recommendations. Use a professional tone suitable for the executive team. Keep the report under 500 words.'
    },
    {
      label: 'Weak vs Strong meeting prep',
      a: 'help me prepare for my meeting',
      b: 'You are an experienced business consultant. I have a quarterly business review meeting with my VP next Tuesday. Help me prepare by creating: (1) a 5-item agenda with time allocations, (2) 3 talking points highlighting our team\'s wins, and (3) 2 questions to proactively address risks. Format as a structured document with clear headings. Keep it concise — no more than 1 page.'
    }
  ];

  /* ════════════════════════════════════════════
     HISTORY
     ════════════════════════════════════════════ */

  var HISTORY_KEY = 'prompt-tester-history';
  var MAX_HISTORY = 10;

  function loadHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
    catch (e) { return []; }
  }

  function saveComparison(a, b, scoreA, scoreB) {
    try {
      var history = loadHistory();
      var entry = { a: a, b: b, scoreA: scoreA, scoreB: scoreB, time: Date.now() };
      if (history.length > 0 && history[0].a === a && history[0].b === b) return;
      history.unshift(entry);
      if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) { /* localStorage full or disabled */ }
  }

  function clearHistory() {
    try { localStorage.removeItem(HISTORY_KEY); } catch (e) {}
  }

  /* ════════════════════════════════════════════
     WORD-LEVEL DIFF (LCS-based)
     ════════════════════════════════════════════ */

  function tokenize(text) {
    return text.trim().split(/(\s+)/).filter(function(t) { return t.length > 0; });
  }

  function wordDiff(textA, textB) {
    var tokA = tokenize(textA);
    var tokB = tokenize(textB);
    var m = tokA.length, n = tokB.length;

    // LCS table (O(m*n) — acceptable for prompt-length texts)
    var dp = [];
    for (var i = 0; i <= m; i++) {
      dp[i] = [];
      for (var j = 0; j <= n; j++) {
        if (i === 0 || j === 0) dp[i][j] = 0;
        else if (tokA[i-1] === tokB[j-1]) dp[i][j] = dp[i-1][j-1] + 1;
        else dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
      }
    }

    // Backtrack to get diff operations
    var result = [];
    i = m; j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && tokA[i-1] === tokB[j-1]) {
        result.unshift({ type: 'same', text: tokA[i-1] });
        i--; j--;
      } else if (j > 0 && (i === 0 || dp[i][j-1] >= dp[i-1][j])) {
        result.unshift({ type: 'add', text: tokB[j-1] });
        j--;
      } else {
        result.unshift({ type: 'del', text: tokA[i-1] });
        i--;
      }
    }
    return result;
  }

  function similarity(textA, textB) {
    var tokA = textA.toLowerCase().split(/\s+/);
    var tokB = textB.toLowerCase().split(/\s+/);
    var setA = new Set(tokA);
    var setB = new Set(tokB);
    var intersection = 0;
    setA.forEach(function(w) { if (setB.has(w)) intersection++; });
    var union = new Set(tokA.concat(tokB)).size;
    return union === 0 ? 0 : intersection / union;
  }

  /* ════════════════════════════════════════════
     SCORING HELPERS
     ════════════════════════════════════════════ */

  function scoreClass(total) {
    if (total <= 25) return 'ptest-score-low';
    if (total <= 50) return 'ptest-score-med';
    if (total <= 75) return 'ptest-score-good';
    return 'ptest-score-great';
  }

  function pillarPctClass(pct) {
    if (pct <= 0.25) return 'ptest-score-low';
    if (pct <= 0.5) return 'ptest-score-med';
    if (pct <= 0.8) return 'ptest-score-good';
    return 'ptest-score-great';
  }

  function escapeHtml(text) {
    var el = document.createElement('span');
    el.textContent = text;
    return el.innerHTML;
  }

  function animateScore(el, target) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = target;
      return;
    }
    var duration = 600;
    var start = performance.now();
    function tick(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ════════════════════════════════════════════
     COMPARISON ENGINE
     ════════════════════════════════════════════ */

  var lastAnalysisA = null;
  var lastAnalysisB = null;
  var lastTextA = '';
  var lastTextB = '';

  function compare() {
    var textA = document.getElementById('ptest-input-a').value.trim();
    var textB = document.getElementById('ptest-input-b').value.trim();
    if (!textA || !textB) return;

    lastTextA = textA;
    lastTextB = textB;
    lastAnalysisA = analyse(textA);
    lastAnalysisB = analyse(textB);
    if (!lastAnalysisA || !lastAnalysisB) return;

    var $results = document.getElementById('ptest-results');
    $results.hidden = false;

    renderScores(lastAnalysisA, lastAnalysisB);
    renderBreakdown(lastAnalysisA, lastAnalysisB);
    renderRadar(lastAnalysisA, lastAnalysisB);
    renderExplanation(lastAnalysisA, lastAnalysisB);
    renderDiff(textA, textB);
    saveComparison(textA, textB, lastAnalysisA.total, lastAnalysisB.total);
    renderHistoryTab();

    document.getElementById('ptest-clear-btn').style.display = '';
    document.getElementById('ptest-improved').style.display = 'none';

    // Confetti for high scores
    if (lastAnalysisA.total >= 90 || lastAnalysisB.total >= 90) {
      launchConfetti();
    }

    $results.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (window.clarity) window.clarity('event', 'ptest_compare');
  }

  function renderScores(a, b) {
    var $scoreA = document.getElementById('ptest-score-a');
    var $scoreB = document.getElementById('ptest-score-b');
    animateScore($scoreA, a.total);
    animateScore($scoreB, b.total);
    $scoreA.className = 'ptest-score-number ' + scoreClass(a.total);
    $scoreB.className = 'ptest-score-number ' + scoreClass(b.total);
    document.getElementById('ptest-label-a').textContent = a.label;
    document.getElementById('ptest-label-b').textContent = b.label;

    var diff = b.total - a.total;
    var $verdictText = document.getElementById('ptest-verdict-text');
    var $verdictDelta = document.getElementById('ptest-verdict-delta');
    var $verdict = document.getElementById('ptest-verdict');

    if (Math.abs(diff) < 5) {
      $verdictText.textContent = '🤝 Too close to call';
      $verdictText.className = 'ptest-verdict-text ptest-verdict-tie';
      $verdictDelta.textContent = 'Difference: ' + Math.abs(diff) + ' point' + (Math.abs(diff) !== 1 ? 's' : '');
    } else if (diff > 0) {
      $verdictText.textContent = '🏆 Prompt B is more complete';
      $verdictText.className = 'ptest-verdict-text ptest-verdict-win';
      $verdictDelta.textContent = '+' + diff + ' points';
    } else {
      $verdictText.textContent = '🏆 Prompt A is more complete';
      $verdictText.className = 'ptest-verdict-text ptest-verdict-win';
      $verdictDelta.textContent = '+' + Math.abs(diff) + ' points';
    }
  }

  function renderBreakdown(a, b) {
    var html = '';
    var keys = ['context', 'role', 'action', 'format', 'tone', 'scope'];
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var meta = PILLAR_META[key];
      var pa = a.pillars[key];
      var pb = b.pillars[key];
      var pctA = Math.round((pa.score / pa.max) * 100);
      var pctB = Math.round((pb.score / pb.max) * 100);
      var betterA = pa.score > pb.score;
      var betterB = pb.score > pa.score;
      var clsA = betterA ? 'ptest-criterion-better' : (betterB ? 'ptest-criterion-worse' : '');
      var clsB = betterB ? 'ptest-criterion-better' : (betterA ? 'ptest-criterion-worse' : '');

      html += '<div class="ptest-criterion">' +
        '<span class="ptest-criterion-name">' + meta.icon + ' ' + meta.label + '</span>' +
        '<div class="ptest-criterion-bar ptest-bar-a"><div class="ptest-criterion-fill" style="width:0%" data-target="' + pctA + '"></div></div>' +
        '<span class="ptest-criterion-score ' + clsA + '">' + pa.score + '/' + pa.max + '</span>' +
        '<div class="ptest-criterion-bar ptest-bar-b"><div class="ptest-criterion-fill" style="width:0%" data-target="' + pctB + '"></div></div>' +
        '<span class="ptest-criterion-score ' + clsB + '">' + pb.score + '/' + pb.max + '</span>' +
        '</div>';
    }
    var $breakdown = document.getElementById('ptest-breakdown');
    $breakdown.innerHTML = html;

    requestAnimationFrame(function() {
      var bars = $breakdown.querySelectorAll('.ptest-criterion-fill');
      for (var j = 0; j < bars.length; j++) {
        bars[j].style.width = bars[j].getAttribute('data-target') + '%';
      }
    });
  }

  function renderExplanation(a, b) {
    var lines = [];
    var keys = ['context', 'role', 'action', 'format', 'tone', 'scope'];
    var improved = [];
    var regressed = [];
    var tied = [];

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var meta = PILLAR_META[key];
      var da = a.pillars[key].score;
      var db = b.pillars[key].score;
      if (db > da) improved.push(meta.label + ' (+' + (db - da) + ')');
      else if (da > db) regressed.push(meta.label + ' (−' + (da - db) + ')');
      else tied.push(meta.label);
    }

    var diff = b.total - a.total;
    if (Math.abs(diff) < 5) {
      lines.push('<strong>These prompts are similarly complete.</strong> The CRAFTS scores are within 5 points of each other.');
    } else if (diff > 0) {
      lines.push('<strong>Prompt B is more CRAFTS-complete.</strong>');
    } else {
      lines.push('<strong>Prompt A is more CRAFTS-complete.</strong>');
    }

    if (improved.length > 0) lines.push('📈 <strong>B scores higher on:</strong> ' + improved.join(', '));
    if (regressed.length > 0) lines.push('📉 <strong>A scores higher on:</strong> ' + regressed.join(', '));
    if (tied.length > 0) lines.push('🤝 <strong>Tied on:</strong> ' + tied.join(', '));

    // V3: AI-powered detailed explanation
    var details = generateDetailedExplanation(a, b);
    var detailHtml = details.length > 0 ? '<div class="ptest-explanation-detail">' + details.join('<br>') + '</div>' : '';

    document.getElementById('ptest-explanation').innerHTML = lines.join('<br>') + detailHtml;
  }

  function renderDiff(textA, textB) {
    var $section = document.getElementById('ptest-diff-section');
    var sim = similarity(textA, textB);

    if (sim < 0.15) {
      $section.style.display = 'none';
      return;
    }

    var diffs = wordDiff(textA, textB);
    var html = '';
    for (var i = 0; i < diffs.length; i++) {
      var d = diffs[i];
      if (d.type === 'same') html += escapeHtml(d.text);
      else if (d.type === 'add') html += '<span class="ptest-diff-add">' + escapeHtml(d.text) + '</span>';
      else html += '<span class="ptest-diff-del">' + escapeHtml(d.text) + '</span>';
    }

    document.getElementById('ptest-diff').innerHTML = html;
    $section.style.display = '';
  }

  /* ════════════════════════════════════════════
     LIVE SCORING (debounced)
     ════════════════════════════════════════════ */

  var debounceTimerA = null;
  var debounceTimerB = null;

  function liveScore(inputId, displayId) {
    var text = document.getElementById(inputId).value.trim();
    var $display = document.getElementById(displayId);
    if (!text) { $display.innerHTML = ''; return; }
    var result = analyse(text);
    if (!result) { $display.innerHTML = ''; return; }
    var cls = scoreClass(result.total).replace('ptest-', '');
    $display.innerHTML = 'CRAFTS: <span class="ptest-live-val ptest-' + cls + '">' + result.total + '/100</span> — ' + result.label;
  }

  /* ════════════════════════════════════════════
     HISTORY TAB
     ════════════════════════════════════════════ */

  function renderHistoryTab() {
    var history = loadHistory();
    var $list = document.getElementById('ptest-history-list');

    if (history.length === 0) {
      $list.innerHTML = '<p class="ptest-empty">No comparisons yet. Compare two prompts to see them here.</p>';
      return;
    }

    var html = '';
    for (var i = 0; i < history.length; i++) {
      var h = history[i];
      var date = new Date(h.time);
      var dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
      var previewA = h.a.length > 50 ? h.a.slice(0, 50) + '…' : h.a;
      var previewB = h.b.length > 50 ? h.b.slice(0, 50) + '…' : h.b;
      var clsA = scoreClass(h.scoreA).replace('ptest-', '');
      var clsB = scoreClass(h.scoreB).replace('ptest-', '');

      html += '<div class="ptest-history-card" data-history="' + i + '" tabindex="0" role="button">' +
        '<div class="ptest-history-top">' +
        '<span class="ptest-history-scores">A: <span class="ptest-' + clsA + '">' + h.scoreA + '</span> vs B: <span class="ptest-' + clsB + '">' + h.scoreB + '</span></span>' +
        '<span class="ptest-history-date">' + dateStr + '</span>' +
        '</div>' +
        '<div class="ptest-history-previews">' +
        '<span class="ptest-history-preview">' + escapeHtml(previewA) + '</span>' +
        '<span class="ptest-history-preview">' + escapeHtml(previewB) + '</span>' +
        '</div></div>';
    }
    $list.innerHTML = html;

    // V3: Also render chart and heatmap
    renderHistoryChart();
    renderWeaknessHeatmap();
  }

  function exportHistory() {
    var history = loadHistory();
    if (history.length === 0) return;
    var lines = ['Prompt Tester — Comparison History', '='.repeat(40), ''];
    for (var i = 0; i < history.length; i++) {
      var h = history[i];
      var date = new Date(h.time).toLocaleString();
      lines.push('--- Comparison ' + (i + 1) + ' (' + date + ') ---');
      lines.push('Prompt A (Score: ' + h.scoreA + '/100):');
      lines.push(h.a);
      lines.push('');
      lines.push('Prompt B (Score: ' + h.scoreB + '/100):');
      lines.push(h.b);
      lines.push('');
    }
    var blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'prompt-tester-history.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  /* ════════════════════════════════════════════
     IMPROVE WEAKER PROMPT
     ════════════════════════════════════════════ */

  function improveWeaker() {
    if (!lastAnalysisA || !lastAnalysisB) return;
    var weaker, weakerAnalysis;
    if (lastAnalysisA.total <= lastAnalysisB.total) {
      weaker = lastTextA;
      weakerAnalysis = lastAnalysisA;
    } else {
      weaker = lastTextB;
      weakerAnalysis = lastAnalysisB;
    }

    var platformEl = document.getElementById('ptest-platform');
    var platform = platformEl ? platformEl.value : 'general';
    var improved = rewrite(weaker, weakerAnalysis, platform);
    var improvedAnalysis = analyse(improved);

    var $section = document.getElementById('ptest-improved');
    $section.style.display = '';
    document.getElementById('ptest-original-text').textContent = weaker;
    document.getElementById('ptest-improved-text').textContent = improved;

    if (improvedAnalysis) {
      var delta = improvedAnalysis.total - weakerAnalysis.total;
      document.getElementById('ptest-improved-score').innerHTML =
        'Original: ' + weakerAnalysis.total + '/100 → Improved: <strong>' + improvedAnalysis.total + '/100</strong>' +
        (delta > 0 ? ' <span style="color:#22c55e">(+' + delta + ' points)</span>' : '') +
        (platform !== 'general' ? ' <em style="color:rgba(255,255,255,0.4)">(' + platform + ')</em>' : '');
    }

    $section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (window.clarity) window.clarity('event', 'ptest_improve');
  }

  /* ════════════════════════════════════════════
     V2: RADAR CHART (SVG)
     ════════════════════════════════════════════ */

  function renderRadar(a, b) {
    var svg = document.getElementById('ptest-radar');
    if (!svg) return;
    var keys = ['context', 'role', 'action', 'format', 'tone', 'scope'];
    var labels = ['C', 'R', 'A', 'F', 'T', 'S'];
    var cx = 150, cy = 135, r = 100, n = 6;
    var angleStep = (2 * Math.PI) / n;
    var startAngle = -Math.PI / 2;

    function point(i, pct) {
      var angle = startAngle + i * angleStep;
      return { x: cx + r * pct * Math.cos(angle), y: cy + r * pct * Math.sin(angle) };
    }

    var html = '';
    // Grid rings
    for (var ring = 0.25; ring <= 1; ring += 0.25) {
      var pts = [];
      for (var i = 0; i < n; i++) {
        var p = point(i, ring);
        pts.push(p.x.toFixed(1) + ',' + p.y.toFixed(1));
      }
      html += '<polygon points="' + pts.join(' ') + '" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>';
    }
    // Axis lines + labels
    for (var i = 0; i < n; i++) {
      var p = point(i, 1);
      html += '<line x1="' + cx + '" y1="' + cy + '" x2="' + p.x.toFixed(1) + '" y2="' + p.y.toFixed(1) + '" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>';
      var lp = point(i, 1.18);
      html += '<text x="' + lp.x.toFixed(1) + '" y="' + lp.y.toFixed(1) + '" text-anchor="middle" dominant-baseline="central" fill="rgba(255,255,255,0.5)" font-size="11" font-weight="700">' + labels[i] + '</text>';
    }
    // Data polygons
    function dataPolygon(analysis, color, opacity) {
      var pts = [];
      for (var i = 0; i < n; i++) {
        var pillar = analysis.pillars[keys[i]];
        var pct = pillar.score / pillar.max;
        var p = point(i, Math.max(pct, 0.05));
        pts.push(p.x.toFixed(1) + ',' + p.y.toFixed(1));
      }
      return '<polygon points="' + pts.join(' ') + '" fill="' + color + '" fill-opacity="' + opacity + '" stroke="' + color + '" stroke-width="2" stroke-linejoin="round"/>';
    }
    html += dataPolygon(a, '#F97316', '0.15');
    html += dataPolygon(b, '#60a5fa', '0.15');
    // Data dots
    for (var i = 0; i < n; i++) {
      var pa = a.pillars[keys[i]];
      var pb = b.pillars[keys[i]];
      var da = point(i, Math.max(pa.score / pa.max, 0.05));
      var db = point(i, Math.max(pb.score / pb.max, 0.05));
      html += '<circle cx="' + da.x.toFixed(1) + '" cy="' + da.y.toFixed(1) + '" r="3.5" fill="#F97316"/>';
      html += '<circle cx="' + db.x.toFixed(1) + '" cy="' + db.y.toFixed(1) + '" r="3.5" fill="#60a5fa"/>';
    }
    svg.innerHTML = html;
  }

  /* ════════════════════════════════════════════
     V2: CONFETTI
     ════════════════════════════════════════════ */

  function launchConfetti() {
    var canvas = document.getElementById('ptest-confetti');
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var pieces = [];
    var colors = ['#F97316', '#60a5fa', '#22c55e', '#f59e0b', '#ec4899', '#a78bfa'];
    for (var i = 0; i < 80; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 200,
        w: 6 + Math.random() * 6,
        h: 4 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 3,
        vy: 2 + Math.random() * 3,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.2
      });
    }
    var frame = 0;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var alive = false;
      for (var i = 0; i < pieces.length; i++) {
        var p = pieces[i];
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.vy += 0.05;
        if (p.y < canvas.height + 20) alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - frame / 120);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      frame++;
      if (alive && frame < 120) requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    requestAnimationFrame(draw);
  }

  /* ════════════════════════════════════════════
     V2: FIX BOTH & RE-COMPARE
     ════════════════════════════════════════════ */

  function fixBoth() {
    if (!lastAnalysisA || !lastAnalysisB) return;
    var platformEl = document.getElementById('ptest-platform');
    var platform = platformEl ? platformEl.value : 'general';

    var fixedA = rewrite(lastTextA, lastAnalysisA, platform);
    var fixedB = rewrite(lastTextB, lastAnalysisB, platform);

    document.getElementById('ptest-input-a').value = fixedA;
    document.getElementById('ptest-input-b').value = fixedB;
    document.getElementById('ptest-input-a').dispatchEvent(new Event('input'));
    document.getElementById('ptest-input-b').dispatchEvent(new Event('input'));
    compare();
    if (window.clarity) window.clarity('event', 'ptest_fixboth');
  }

  /* ════════════════════════════════════════════
     V2: SHARE VIA URL
     ════════════════════════════════════════════ */

  function shareComparison() {
    if (!lastTextA || !lastTextB) return;
    var url = new URL(window.location.href.split('?')[0]);
    url.searchParams.set('a', lastTextA);
    url.searchParams.set('b', lastTextB);
    var shareUrl = url.toString();
    navigator.clipboard.writeText(shareUrl).then(function() {
      var btn = document.getElementById('ptest-share');
      btn.textContent = '✅ Link copied!';
      setTimeout(function() { btn.textContent = '🔗 Share'; }, 2000);
    });
    if (window.clarity) window.clarity('event', 'ptest_share');
  }

  function loadFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var a = params.get('a');
    var b = params.get('b');
    if (a && b) {
      document.getElementById('ptest-input-a').value = a;
      document.getElementById('ptest-input-b').value = b;
      document.getElementById('ptest-input-a').dispatchEvent(new Event('input'));
      document.getElementById('ptest-input-b').dispatchEvent(new Event('input'));
      compare();
      history.replaceState(null, '', window.location.pathname);
      return true;
    }
    return false;
  }

  /* ════════════════════════════════════════════
     V2: EXPORT AS IMAGE (Canvas)
     ════════════════════════════════════════════ */

  function exportImage() {
    if (!lastAnalysisA || !lastAnalysisB) return;
    var W = 800, H = 500;
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var ctx = c.getContext('2d');

    // Background
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, W, H);

    // Header
    ctx.fillStyle = '#F97316';
    ctx.font = 'bold 24px Inter, system-ui, sans-serif';
    ctx.fillText('🔬 Prompt Tester — CRAFTS Comparison', 30, 40);

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.fillText('aguidetocloud.com/prompt-tester', 30, 60);

    // Score boxes
    function drawScoreBox(x, label, score, scoreLabel) {
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.beginPath();
      ctx.roundRect(x, 80, 230, 100, 12);
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x + 115, 100);

      ctx.fillStyle = score <= 25 ? '#ef4444' : score <= 50 ? '#f59e0b' : score <= 75 ? '#22c55e' : '#10b981';
      ctx.font = 'bold 48px Inter, system-ui, sans-serif';
      ctx.fillText(score, x + 115, 150);

      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '13px Inter, system-ui, sans-serif';
      ctx.fillText(scoreLabel, x + 115, 172);
      ctx.textAlign = 'left';
    }
    drawScoreBox(30, 'PROMPT A', lastAnalysisA.total, lastAnalysisA.label);
    drawScoreBox(540, 'PROMPT B', lastAnalysisB.total, lastAnalysisB.label);

    // Verdict
    var diff = lastAnalysisB.total - lastAnalysisA.total;
    ctx.textAlign = 'center';
    ctx.font = 'bold 16px Inter, system-ui, sans-serif';
    ctx.fillStyle = Math.abs(diff) < 5 ? '#f59e0b' : '#22c55e';
    var verdictStr = Math.abs(diff) < 5 ? '🤝 Too close to call' :
      (diff > 0 ? '🏆 Prompt B wins by ' + diff + ' pts' : '🏆 Prompt A wins by ' + Math.abs(diff) + ' pts');
    ctx.fillText(verdictStr, W / 2, 140);
    ctx.textAlign = 'left';

    // CRAFTS bars
    var keys = ['context', 'role', 'action', 'format', 'tone', 'scope'];
    var barY = 210;
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var meta = PILLAR_META[key];
      var pa = lastAnalysisA.pillars[key];
      var pb = lastAnalysisB.pillars[key];
      var pctA = pa.score / pa.max;
      var pctB = pb.score / pb.max;
      var y = barY + i * 42;

      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = 'bold 12px Inter, system-ui, sans-serif';
      ctx.fillText(meta.icon + ' ' + meta.label, 30, y + 12);

      // A bar
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.beginPath(); ctx.roundRect(140, y, 260, 14, 4); ctx.fill();
      ctx.fillStyle = '#F97316';
      ctx.beginPath(); ctx.roundRect(140, y, Math.max(260 * pctA, 4), 14, 4); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '10px Inter, system-ui, sans-serif';
      ctx.fillText(pa.score + '/' + pa.max, 406, y + 11);

      // B bar
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.beginPath(); ctx.roundRect(460, y, 260, 14, 4); ctx.fill();
      ctx.fillStyle = '#60a5fa';
      ctx.beginPath(); ctx.roundRect(460, y, Math.max(260 * pctB, 4), 14, 4); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText(pb.score + '/' + pb.max, 726, y + 11);
    }

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = '10px Inter, system-ui, sans-serif';
    ctx.fillText('Generated by Prompt Tester — aguidetocloud.com', 30, H - 15);

    // Download
    c.toBlob(function(blob) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'prompt-comparison.png';
      a.click();
      URL.revokeObjectURL(a.href);
    });
    if (window.clarity) window.clarity('event', 'ptest_export');
  }

  /* ════════════════════════════════════════════
     V3: PROMPT TEMPLATES
     ════════════════════════════════════════════ */

  var TEMPLATES = [
    { label: '📧 Email', text: 'Write an email to [recipient] about [topic].' },
    { label: '📝 Blog Post', text: 'Write a blog post about [topic].' },
    { label: '💻 Code Review', text: 'Review my code for [language/framework].' },
    { label: '📊 Data Analysis', text: 'Analyze [dataset] and give me insights.' },
    { label: '📋 Meeting Prep', text: 'Help me prepare for my [meeting type] meeting.' },
    { label: '📄 Report', text: 'Write a report about [topic] for [audience].' }
  ];

  /* ════════════════════════════════════════════
     V3: BLIND MODE
     ════════════════════════════════════════════ */

  var blindActive = false;
  var blindSwapped = false;

  function toggleBlind() {
    blindActive = !blindActive;
    var $page = document.querySelector('.ptest-page');
    var $bar = document.getElementById('ptest-blind-bar');
    var $toggle = document.getElementById('ptest-blind-toggle');

    if (blindActive) {
      blindSwapped = Math.random() < 0.5;
      $page.classList.add('ptest-blind-active');
      $page.classList.remove('ptest-blind-revealed');
      $bar.style.display = '';
      $toggle.textContent = '🎲 Exit Blind';
      // Swap visually if randomized
      if (blindSwapped) {
        var $la = document.querySelector('[for="ptest-input-a"]');
        var $lb = document.querySelector('[for="ptest-input-b"]');
        if ($la) $la.textContent = 'Prompt 2';
        if ($lb) $lb.textContent = 'Prompt 1';
      }
      // Remove old result
      var old = document.getElementById('ptest-blind-result-msg');
      if (old) old.remove();
    } else {
      $page.classList.remove('ptest-blind-active', 'ptest-blind-revealed');
      $bar.style.display = 'none';
      $toggle.textContent = '🎲 Blind Mode';
      var $la = document.querySelector('[for="ptest-input-a"]');
      var $lb = document.querySelector('[for="ptest-input-b"]');
      if ($la) $la.textContent = 'Prompt A';
      if ($lb) $lb.textContent = 'Prompt B';
      var old = document.getElementById('ptest-blind-result-msg');
      if (old) old.remove();
    }
  }

  function blindGuess(guessedLeft) {
    if (!lastAnalysisA || !lastAnalysisB) return;
    var $page = document.querySelector('.ptest-page');
    $page.classList.remove('ptest-blind-active');
    $page.classList.add('ptest-blind-revealed');

    // Determine actual winner
    var aIsLeft = !blindSwapped;
    var leftScore = aIsLeft ? lastAnalysisA.total : lastAnalysisB.total;
    var rightScore = aIsLeft ? lastAnalysisB.total : lastAnalysisA.total;
    var leftActuallyBetter = leftScore > rightScore;
    var correct = (guessedLeft && leftActuallyBetter) || (!guessedLeft && !leftActuallyBetter);
    if (leftScore === rightScore) correct = true; // tie = always correct

    var msg = document.createElement('div');
    msg.id = 'ptest-blind-result-msg';
    msg.className = 'ptest-blind-result ' + (correct ? 'ptest-blind-correct' : 'ptest-blind-wrong');
    msg.textContent = correct
      ? '✅ Correct! You identified the stronger prompt.'
      : '❌ Surprise! The other prompt actually scored higher. Check the breakdown to see why.';
    var $bar = document.getElementById('ptest-blind-bar');
    $bar.parentNode.insertBefore(msg, $bar.nextSibling);
    $bar.style.display = 'none';

    // Restore labels
    var $la = document.querySelector('[for="ptest-input-a"]');
    var $lb = document.querySelector('[for="ptest-input-b"]');
    if ($la) $la.textContent = 'Prompt A';
    if ($lb) $lb.textContent = 'Prompt B';
  }

  /* ════════════════════════════════════════════
     V3: PROMPT DUEL / CHALLENGE
     ════════════════════════════════════════════ */

  var DUEL_TASKS = [
    { task: 'Write a prompt that asks an AI to draft a project status update email to your manager.', ref: 'You are a professional communication specialist. Write a concise project status update email to my manager covering: current progress (75% complete), one blocker (vendor API delay), and next steps. Use a professional tone. Keep under 150 words.' },
    { task: 'Write a prompt that asks an AI to explain Kubernetes to a non-technical manager.', ref: 'You are an experienced cloud educator. Explain Kubernetes to a non-technical manager using a simple analogy (like a restaurant kitchen). Cover what it does, why companies use it, and when they need it. Use a friendly, jargon-free tone. Keep under 300 words. Use bullet points for key benefits.' },
    { task: 'Write a prompt that asks an AI to create a security checklist for a new Azure deployment.', ref: 'You are a senior cloud security architect. Create a 10-item security checklist for a new Azure deployment covering: identity (Entra ID), networking (NSGs, firewalls), encryption (at-rest, in-transit), monitoring (Defender, Sentinel), and compliance. Format as a numbered checklist with priority levels (Critical/High/Medium). Focus on Azure-specific best practices.' },
    { task: 'Write a prompt that asks an AI to compare three project management tools.', ref: 'You are an IT project management consultant. Compare Jira, Asana, and Monday.com across these criteria: pricing for 50 users, key features, integrations with Microsoft 365, learning curve, and best-fit use case. Format as a comparison table. Use a neutral, data-driven tone. Include a final recommendation for a mid-size IT team.' },
    { task: 'Write a prompt that asks an AI to create onboarding documentation for a new team member.', ref: 'You are an experienced HR and IT onboarding specialist. Create a first-week onboarding guide for a new IT support team member. Include: Day 1 setup tasks, key tools and access they need, team contacts, first-week learning goals, and a 30-day checkpoint list. Format with clear day-by-day sections. Use a welcoming, supportive tone. Keep under 500 words.' }
  ];

  var duelTimer = null;
  var duelSeconds = 60;
  var currentDuel = null;

  function startDuel() {
    currentDuel = DUEL_TASKS[Math.floor(Math.random() * DUEL_TASKS.length)];
    duelSeconds = 60;
    document.getElementById('ptest-duel').style.display = '';
    document.getElementById('ptest-duel-task').textContent = '📋 Your task: ' + currentDuel.task;
    document.getElementById('ptest-duel-timer').textContent = '60';
    document.getElementById('ptest-duel-timer').classList.remove('ptest-timer-warn');
    document.getElementById('ptest-duel-input').value = '';
    document.getElementById('ptest-duel-result').style.display = 'none';
    document.getElementById('ptest-duel-submit').disabled = false;
    document.getElementById('ptest-duel-input').focus();

    clearInterval(duelTimer);
    duelTimer = setInterval(function() {
      duelSeconds--;
      var $t = document.getElementById('ptest-duel-timer');
      $t.textContent = duelSeconds;
      if (duelSeconds <= 10) $t.classList.add('ptest-timer-warn');
      if (duelSeconds <= 0) {
        clearInterval(duelTimer);
        submitDuel();
      }
    }, 1000);
  }

  function submitDuel() {
    clearInterval(duelTimer);
    if (!currentDuel) return;
    var userText = document.getElementById('ptest-duel-input').value.trim();
    if (!userText) userText = '(no prompt written)';
    var userAnalysis = analyse(userText);
    var refAnalysis = analyse(currentDuel.ref);
    var userScore = userAnalysis ? userAnalysis.total : 0;
    var refScore = refAnalysis ? refAnalysis.total : 0;

    document.getElementById('ptest-duel-submit').disabled = true;
    var $result = document.getElementById('ptest-duel-result');
    $result.style.display = '';

    var emoji = userScore >= refScore ? '🏆' : userScore >= refScore - 10 ? '💪' : '📈';
    var msg = userScore >= refScore ? 'Amazing! You beat the reference prompt!'
      : userScore >= refScore - 10 ? 'So close! Just ' + (refScore - userScore) + ' points behind.'
      : 'Room to grow! Check the reference to see what CRAFTS elements you missed.';

    $result.innerHTML =
      '<div class="ptest-duel-your-score">' + emoji + ' Your score: <span class="' + scoreClass(userScore) + '">' + userScore + '</span>/100</div>' +
      '<div class="ptest-duel-ref">Reference score: ' + refScore + '/100 — ' + msg + '</div>' +
      '<details style="margin-top:0.8rem;text-align:left"><summary style="cursor:pointer;color:var(--tool-accent);font-size:0.82rem">Show reference prompt</summary>' +
      '<div style="margin-top:0.5rem;padding:0.6rem;background:rgba(255,255,255,0.04);border-radius:8px;font-size:0.8rem;color:rgba(255,255,255,0.7);white-space:pre-wrap">' + escapeHtml(currentDuel.ref) + '</div></details>' +
      '<button class="ptest-btn-secondary" onclick="document.getElementById(\'ptest-input-a\').value=document.getElementById(\'ptest-duel-input\').value;' +
      'document.getElementById(\'ptest-input-b\').value=' + JSON.stringify(currentDuel.ref) + ';' +
      'document.getElementById(\'ptest-input-a\').dispatchEvent(new Event(\'input\'));' +
      'document.getElementById(\'ptest-input-b\').dispatchEvent(new Event(\'input\'));' +
      'document.getElementById(\'ptest-duel\').style.display=\'none\'" style="margin-top:0.6rem">🔬 Compare in Tester</button>';

    if (window.clarity) window.clarity('event', 'ptest_duel');
  }

  function closeDuel() {
    clearInterval(duelTimer);
    document.getElementById('ptest-duel').style.display = 'none';
  }

  /* ════════════════════════════════════════════
     V3: PRESENTER MODE
     ════════════════════════════════════════════ */

  var presenterActive = false;
  function togglePresenter() {
    presenterActive = !presenterActive;
    document.querySelector('.ptest-page').classList.toggle('ptest-presenter-mode', presenterActive);
    document.getElementById('ptest-presenter').textContent = presenterActive ? '📺 Exit Presenter' : '📺 Presenter';
  }

  /* ════════════════════════════════════════════
     V3: SCORE HISTORY CHART (SVG)
     ════════════════════════════════════════════ */

  function renderHistoryChart() {
    var history = loadHistory();
    var $section = document.getElementById('ptest-chart-section');
    if (history.length < 3) { $section.style.display = 'none'; return; }
    $section.style.display = '';

    var svg = document.getElementById('ptest-chart');
    var W = 600, H = 200, pad = 40, n = Math.min(history.length, 10);
    var data = history.slice(0, n).reverse(); // oldest first
    var stepX = (W - pad * 2) / (n - 1);

    var html = '';
    // Grid lines
    for (var g = 0; g <= 100; g += 25) {
      var y = pad + (1 - g / 100) * (H - pad * 2);
      html += '<line x1="' + pad + '" y1="' + y + '" x2="' + (W - pad) + '" y2="' + y + '" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>';
      html += '<text x="' + (pad - 5) + '" y="' + (y + 4) + '" text-anchor="end" fill="rgba(255,255,255,0.3)" font-size="10">' + g + '</text>';
    }

    // Lines + dots
    function drawLine(key, color) {
      var points = [];
      for (var i = 0; i < n; i++) {
        var x = pad + i * stepX;
        var val = key === 'a' ? data[i].scoreA : data[i].scoreB;
        var y = pad + (1 - val / 100) * (H - pad * 2);
        points.push(x.toFixed(1) + ',' + y.toFixed(1));
      }
      html += '<polyline points="' + points.join(' ') + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linejoin="round"/>';
      for (var i = 0; i < n; i++) {
        var x = pad + i * stepX;
        var val = key === 'a' ? data[i].scoreA : data[i].scoreB;
        var y = pad + (1 - val / 100) * (H - pad * 2);
        html += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3.5" fill="' + color + '"/>';
      }
    }
    drawLine('a', '#F97316');
    drawLine('b', '#60a5fa');

    // X axis labels
    for (var i = 0; i < n; i++) {
      var x = pad + i * stepX;
      html += '<text x="' + x.toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-size="9">#' + (i + 1) + '</text>';
    }

    svg.innerHTML = html;
  }

  /* ════════════════════════════════════════════
     V3: CRAFTS WEAKNESS HEATMAP
     ════════════════════════════════════════════ */

  function renderWeaknessHeatmap() {
    var history = loadHistory();
    var $section = document.getElementById('ptest-heatmap-section');
    if (history.length < 3) { $section.style.display = 'none'; return; }
    $section.style.display = '';

    var keys = ['context', 'role', 'action', 'format', 'tone', 'scope'];
    var totals = {};
    var counts = 0;
    keys.forEach(function(k) { totals[k] = 0; });

    // Analyze Prompt A entries (the "before" / weaker prompts)
    for (var i = 0; i < history.length; i++) {
      var a = analyse(history[i].a);
      if (!a) continue;
      counts++;
      keys.forEach(function(k) {
        totals[k] += a.pillars[k].score / a.pillars[k].max;
      });
    }

    if (counts === 0) { $section.style.display = 'none'; return; }

    var html = '';
    keys.forEach(function(k) {
      var avg = (totals[k] / counts) * 100;
      var heat = avg < 25 ? 'cold' : avg < 50 ? 'cool' : avg < 75 ? 'warm' : 'hot';
      var meta = PILLAR_META[k];
      html += '<div class="ptest-heatmap-cell ptest-heat-' + heat + '">' +
        '<span class="ptest-heatmap-letter">' + meta.letter + '</span>' +
        '<span class="ptest-heatmap-label">' + meta.label + '</span>' +
        '<span class="ptest-heatmap-pct">' + Math.round(avg) + '%</span>' +
        '</div>';
    });
    document.getElementById('ptest-heatmap').innerHTML = html;
  }

  /* ════════════════════════════════════════════
     V3: AI-POWERED EXPLANATIONS
     ════════════════════════════════════════════ */

  function generateDetailedExplanation(a, b) {
    var keys = ['context', 'role', 'action', 'format', 'tone', 'scope'];
    var details = [];

    var explanations = {
      context: {
        better: 'provides richer background information — specific details about the situation, project, or domain help the AI understand what you need',
        worse: 'lacks background context — the AI has to guess your situation, industry, and requirements'
      },
      role: {
        better: 'assigns a specific expert role, which guides the AI to respond with the right depth and perspective',
        worse: 'doesn\'t specify who the AI should be — adding "You are a [role]" dramatically improves response quality'
      },
      action: {
        better: 'has clearer, more specific instructions with strong action verbs and detailed requirements',
        worse: 'uses vague language — replacing "help me with" with specific verbs like "create", "analyze", or "compare" gives much better results'
      },
      format: {
        better: 'explicitly requests a specific output format (table, bullet points, step-by-step), so the response is structured and usable',
        worse: 'doesn\'t specify how the output should be structured — add format instructions like "format as a table" or "use bullet points"'
      },
      tone: {
        better: 'defines the audience and voice, ensuring the response matches who will actually read it',
        worse: 'doesn\'t mention tone or audience — adding "for beginners" or "in a professional tone" makes a big difference'
      },
      scope: {
        better: 'sets clear boundaries (word count, focus areas, exclusions) that keep the AI focused',
        worse: 'has no scope limits — the AI might produce too much, too little, or cover irrelevant areas'
      }
    };

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var da = a.pillars[key].score;
      var db = b.pillars[key].score;
      var meta = PILLAR_META[key];
      if (db > da && (db - da) >= 4) {
        details.push(meta.icon + ' <strong>' + meta.label + ':</strong> Prompt B ' + explanations[key].better + '.');
      } else if (da > db && (da - db) >= 4) {
        details.push(meta.icon + ' <strong>' + meta.label + ':</strong> Prompt A ' + explanations[key].better + '.');
      }
    }

    // Find the weakest pillar across both prompts for a learning tip
    var weakest = null;
    var weakestScore = 999;
    for (var i = 0; i < keys.length; i++) {
      var minScore = Math.min(a.pillars[keys[i]].score / a.pillars[keys[i]].max, b.pillars[keys[i]].score / b.pillars[keys[i]].max);
      if (minScore < weakestScore) { weakestScore = minScore; weakest = keys[i]; }
    }
    if (weakest && weakestScore < 0.4) {
      var meta = PILLAR_META[weakest];
      details.push('💡 <strong>Tip:</strong> Both prompts are weak on <strong>' + meta.label + '</strong> — ' + explanations[weakest].worse + '.');
    }

    return details;
  }

  /* ════════════════════════════════════════════
     INIT
     ════════════════════════════════════════════ */

  function init() {
    var $inputA = document.getElementById('ptest-input-a');
    var $inputB = document.getElementById('ptest-input-b');
    var $compareBtn = document.getElementById('ptest-compare-btn');
    var $clearBtn = document.getElementById('ptest-clear-btn');
    var $swapBtn = document.getElementById('ptest-swap');
    var $examplesBtn = document.getElementById('ptest-examples-btn');
    var $examplesMenu = document.getElementById('ptest-examples-menu');

    // Tab switching
    var tabs = document.querySelectorAll('.ptest-tab');
    for (var t = 0; t < tabs.length; t++) {
      tabs[t].addEventListener('click', function() {
        var tabId = this.getAttribute('data-tab');
        for (var i = 0; i < tabs.length; i++) {
          tabs[i].classList.remove('active');
          tabs[i].setAttribute('aria-selected', 'false');
        }
        this.classList.add('active');
        this.setAttribute('aria-selected', 'true');
        var panels = document.querySelectorAll('.ptest-panel');
        for (var j = 0; j < panels.length; j++) {
          panels[j].classList.toggle('active', panels[j].id === 'panel-' + tabId);
        }
      });
    }

    // Enable compare button when both have text
    function checkInputs() {
      $compareBtn.disabled = !($inputA.value.trim() && $inputB.value.trim());
    }

    $inputA.addEventListener('input', function() {
      document.getElementById('ptest-count-a').textContent = this.value.length + ' chars';
      checkInputs();
      clearTimeout(debounceTimerA);
      debounceTimerA = setTimeout(function() { liveScore('ptest-input-a', 'ptest-live-a'); }, 500);
    });

    $inputB.addEventListener('input', function() {
      document.getElementById('ptest-count-b').textContent = this.value.length + ' chars';
      checkInputs();
      clearTimeout(debounceTimerB);
      debounceTimerB = setTimeout(function() { liveScore('ptest-input-b', 'ptest-live-b'); }, 500);
    });

    // Compare
    $compareBtn.addEventListener('click', compare);

    // Ctrl+Enter to compare
    function ctrlEnter(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        compare();
      }
    }
    $inputA.addEventListener('keydown', ctrlEnter);
    $inputB.addEventListener('keydown', ctrlEnter);

    // Swap
    $swapBtn.addEventListener('click', function() {
      var tmp = $inputA.value;
      $inputA.value = $inputB.value;
      $inputB.value = tmp;
      $inputA.dispatchEvent(new Event('input'));
      $inputB.dispatchEvent(new Event('input'));
    });

    // Clear
    $clearBtn.addEventListener('click', function() {
      $inputA.value = '';
      $inputB.value = '';
      document.getElementById('ptest-count-a').textContent = '0 chars';
      document.getElementById('ptest-count-b').textContent = '0 chars';
      document.getElementById('ptest-live-a').innerHTML = '';
      document.getElementById('ptest-live-b').innerHTML = '';
      document.getElementById('ptest-results').hidden = true;
      document.getElementById('ptest-improved').style.display = 'none';
      $compareBtn.disabled = true;
      this.style.display = 'none';
      $inputA.focus();
    });

    // Examples dropdown
    var exHtml = '';
    for (var i = 0; i < EXAMPLES.length; i++) {
      exHtml += '<button class="ptest-example-item" data-example="' + i + '">' + escapeHtml(EXAMPLES[i].label) + '</button>';
    }
    $examplesMenu.innerHTML = exHtml;

    $examplesBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      $examplesMenu.hidden = !$examplesMenu.hidden;
    });

    $examplesMenu.addEventListener('click', function(e) {
      var btn = e.target.closest('[data-example]');
      if (!btn) return;
      var idx = parseInt(btn.getAttribute('data-example'), 10);
      if (EXAMPLES[idx]) {
        $inputA.value = EXAMPLES[idx].a;
        $inputB.value = EXAMPLES[idx].b;
        $inputA.dispatchEvent(new Event('input'));
        $inputB.dispatchEvent(new Event('input'));
        $examplesMenu.hidden = true;
        compare();
        if (window.clarity) window.clarity('event', 'ptest_example');
      }
    });

    document.addEventListener('click', function() { $examplesMenu.hidden = true; });

    // Copy winner
    document.getElementById('ptest-copy-winner').addEventListener('click', function() {
      if (!lastAnalysisA || !lastAnalysisB) return;
      var winner = lastAnalysisA.total >= lastAnalysisB.total ? lastTextA : lastTextB;
      navigator.clipboard.writeText(winner).then(function() {
        var btn = document.getElementById('ptest-copy-winner');
        btn.textContent = '✅ Copied!';
        setTimeout(function() { btn.textContent = '📋 Copy Stronger Prompt'; }, 2000);
      });
    });

    // Improve weaker
    document.getElementById('ptest-improve').addEventListener('click', improveWeaker);

    // V2: Fix both & re-compare
    document.getElementById('ptest-fix-both').addEventListener('click', fixBoth);

    // V2: Share comparison
    document.getElementById('ptest-share').addEventListener('click', shareComparison);

    // V2: Export as image
    document.getElementById('ptest-export-img').addEventListener('click', exportImage);

    // V3: Presenter mode
    document.getElementById('ptest-presenter').addEventListener('click', togglePresenter);

    // V3: Templates dropdown
    var $templateBtn = document.getElementById('ptest-template-btn');
    var $templateMenu = document.getElementById('ptest-template-menu');
    var tmplHtml = '';
    for (var ti = 0; ti < TEMPLATES.length; ti++) {
      tmplHtml += '<button class="ptest-example-item" data-template="' + ti + '">' + escapeHtml(TEMPLATES[ti].label) + '</button>';
    }
    $templateMenu.innerHTML = tmplHtml;
    $templateBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      $templateMenu.hidden = !$templateMenu.hidden;
    });
    $templateMenu.addEventListener('click', function(e) {
      var btn = e.target.closest('[data-template]');
      if (!btn) return;
      var idx = parseInt(btn.getAttribute('data-template'), 10);
      if (TEMPLATES[idx]) {
        $inputA.value = TEMPLATES[idx].text;
        $inputA.dispatchEvent(new Event('input'));
        $templateMenu.hidden = true;
        $inputB.focus();
      }
    });
    document.addEventListener('click', function() { $templateMenu.hidden = true; });

    // V3: Blind mode
    document.getElementById('ptest-blind-toggle').addEventListener('click', toggleBlind);
    document.getElementById('ptest-blind-guess-a').addEventListener('click', function() { blindGuess(true); });
    document.getElementById('ptest-blind-guess-b').addEventListener('click', function() { blindGuess(false); });

    // V3: Prompt Duel
    document.getElementById('ptest-duel-btn').addEventListener('click', startDuel);
    document.getElementById('ptest-duel-submit').addEventListener('click', submitDuel);
    document.getElementById('ptest-duel-close').addEventListener('click', closeDuel);

    // Copy improved
    document.getElementById('ptest-copy-improved').addEventListener('click', function() {
      var text = document.getElementById('ptest-improved-text').textContent;
      navigator.clipboard.writeText(text).then(function() {
        var btn = document.getElementById('ptest-copy-improved');
        btn.textContent = '✅ Copied!';
        setTimeout(function() { btn.textContent = '📋 Copy Improved'; }, 2000);
      });
    });

    // History tab: click to reload
    document.getElementById('ptest-history-list').addEventListener('click', function(e) {
      var card = e.target.closest('[data-history]');
      if (!card) return;
      var history = loadHistory();
      var idx = parseInt(card.getAttribute('data-history'), 10);
      if (history[idx]) {
        $inputA.value = history[idx].a;
        $inputB.value = history[idx].b;
        $inputA.dispatchEvent(new Event('input'));
        $inputB.dispatchEvent(new Event('input'));
        // Switch to compare tab
        var compareTabs = document.querySelectorAll('.ptest-tab');
        for (var i = 0; i < compareTabs.length; i++) {
          compareTabs[i].classList.toggle('active', compareTabs[i].getAttribute('data-tab') === 'compare');
          compareTabs[i].setAttribute('aria-selected', compareTabs[i].getAttribute('data-tab') === 'compare' ? 'true' : 'false');
        }
        var panels = document.querySelectorAll('.ptest-panel');
        for (var j = 0; j < panels.length; j++) {
          panels[j].classList.toggle('active', panels[j].id === 'panel-compare');
        }
        compare();
      }
    });

    // Export history
    document.getElementById('ptest-export-history').addEventListener('click', exportHistory);

    // Clear history
    document.getElementById('ptest-clear-history').addEventListener('click', function() {
      clearHistory();
      renderHistoryTab();
    });

    // Initial render
    renderHistoryTab();

    // V2: Check for URL params first, then auto-demo
    var loadedFromUrl = loadFromUrl();
    if (!loadedFromUrl && !$inputA.value.trim() && !$inputB.value.trim()) {
      $inputA.value = EXAMPLES[0].a;
      $inputB.value = EXAMPLES[0].b;
      $inputA.dispatchEvent(new Event('input'));
      $inputB.dispatchEvent(new Event('input'));
      compare();
    }

    window.scrollTo(0, 0);
    requestAnimationFrame(function() { window.scrollTo(0, 0); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
