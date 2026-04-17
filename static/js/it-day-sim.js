/* ============================================================
   IT Day Simulator — branching story game
   100 % client-side · no deps · IIFE
   ============================================================ */
(function () {
'use strict';

/* ═══════════════════════════════════════════════════
   DATA — loaded from TOML via template
   ═══════════════════════════════════════════════════ */
var scenarios = window.__scenarios || [];
var scoreTiers = window.__scoreTiers || [];

/* ═══════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════ */
function esc(s) {
  var d = document.createElement('div');
  d.appendChild(document.createTextNode(String(s)));
  return d.innerHTML;
}

function safeGet(key, fallback) {
  try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch (_) { return fallback; }
}
function safeSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) { /* quota / private */ }
}

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function formatId(id) {
  return id.replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
}

function findTier(score) {
  var s = Math.max(0, Math.min(100, score));
  for (var i = 0; i < scoreTiers.length; i++) {
    if (s >= scoreTiers[i].min && s <= scoreTiers[i].max) return scoreTiers[i];
  }
  return scoreTiers[scoreTiers.length - 1];
}

/* ═══════════════════════════════════════════════════
   TABS
   ═══════════════════════════════════════════════════ */
function initTabs(ns) {
  document.querySelectorAll('.' + ns + '-tab').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var tab = btn.getAttribute('data-tab');
      document.querySelectorAll('.' + ns + '-tab').forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.' + ns + '-panel').forEach(function (p) {
        p.classList.remove('active');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      var panel = document.getElementById('panel-' + tab);
      if (panel) panel.classList.add('active');
      if (tab === 'history') renderHistory();
    });
  });
}

/* ═══════════════════════════════════════════════════
   GAME STATE
   ═══════════════════════════════════════════════════ */
var G = {
  score: 0,
  scenarioIndex: 0,
  totalScenarios: 9,
  currentId: null,
  history: [],
  isDaily: false
};

var scenarioMap = new Map();
var lastResult = { score: 0, tier: null };
var choosing = false; // guard against double-clicks

var tagColors = {
  'security': '#3b82f6', 'discipline': '#10b981', 'self-care': '#a78bfa',
  'prepared': '#14b8a6', 'escalation': '#0ea5e9', 'incident-response': '#ef4444',
  'governance': '#8b5cf6', 'expertise': '#f59e0b', 'methodology': '#60a5fa',
  'documentation': '#34d399', 'recovery': '#fb923c', 'service': '#ec4899',
  'process': '#22d3ee', 'dedication': '#f472b6', 'pragmatic': '#d4a853',
  'measured': '#4ecdc4'
};

/* ═══════════════════════════════════════════════════
   BUILD MAP
   ═══════════════════════════════════════════════════ */
function buildScenarioMap() {
  var arr = scenarios;
  scenarioMap = new Map();
  for (var i = 0; i < arr.length; i++) scenarioMap.set(arr[i].id, arr[i]);
}

/* ═══════════════════════════════════════════════════
   START / CHALLENGE SCREENS
   ═══════════════════════════════════════════════════ */
function renderStartScreen() {
  var el = document.getElementById('story-area');
  if (!el) return;
  var html =
    '<div style="text-align:center;padding:2rem 1rem;">' +
      '<div style="font-size:4rem;margin-bottom:0.5rem;">\uD83D\uDDA5\uFE0F</div>' +
      '<h2 style="margin:0 0 0.5rem;font-size:1.6rem;">IT Day Simulator</h2>' +
      '<p style="max-width:440px;margin:0 auto 2rem;opacity:0.7;line-height:1.6;">' +
        'Survive a full day in the life of an IT admin. Every choice matters. Can you make it to 5\u202FPM with your sanity intact?' +
      '</p>' +
      '<div style="display:flex;flex-direction:column;gap:0.75rem;max-width:320px;margin:0 auto;">' +
        '<button class="itday-choice-btn" data-action="start" style="padding:0.9rem 1.5rem;font-size:1rem;font-weight:700;border-radius:12px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.06);color:#fff;cursor:pointer;">\u25B6\uFE0F  Start Game</button>' +
        '<button class="itday-choice-btn" data-action="daily" style="padding:0.9rem 1.5rem;font-size:1rem;font-weight:700;border-radius:12px;border:1px solid rgba(251,191,36,0.3);background:rgba(251,191,36,0.08);color:#fbbf24;cursor:pointer;">\uD83D\uDCC5  Daily Challenge</button>' +
      '</div>' +
    '</div>';
  el.innerHTML = html;
}

function showChallengeBanner(score, tier) {
  var el = document.getElementById('story-area');
  if (!el) return;
  var banner =
    '<div style="text-align:center;padding:0.75rem 1rem;margin-bottom:1rem;background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.25);border-radius:12px;">' +
      '<strong style="color:#fbbf24;">\uD83C\uDFC6 Challenge!</strong> Someone scored <strong>' + esc(String(score)) + '</strong> \u2014 ' + esc(String(tier)) + '. Can you beat them?' +
    '</div>';
  el.insertAdjacentHTML('afterbegin', banner);
}

/* ═══════════════════════════════════════════════════
   GAME LOGIC
   ═══════════════════════════════════════════════════ */
function startGame(daily) {
  G.score = 0;
  G.scenarioIndex = 0;
  G.totalScenarios = 9;
  G.history = [];
  G.isDaily = !!daily;
  G.currentId = 'morning-tickets';
  choosing = false;
  renderScenario();
}

function renderScenario() {
  var el = document.getElementById('story-area');
  if (!el) return;
  var scenario = scenarioMap.get(G.currentId);
  if (!scenario || !scenario.choices || !scenario.choices.length) { endGame(); return; }

  var pct = Math.min(Math.round(G.scenarioIndex / G.totalScenarios * 100), 100);
  var scoreColor = G.score >= 0 ? '#4ade80' : '#f87171';

  // Time of day based on scenario index
  var TIMES = ['8:00 AM','8:30 AM','9:15 AM','10:00 AM','10:45 AM','11:30 AM','12:00 PM','1:30 PM','2:15 PM','3:00 PM','3:45 PM','4:15 PM','4:55 PM','5:15 PM','5:30 PM'];
  var timeLabel = TIMES[Math.min(G.scenarioIndex, TIMES.length - 1)] || '5:30 PM';

  var html =
    /* header: time + score + step */
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem;">' +
      '<div style="font-size:0.85rem;color:rgba(255,255,255,0.5);">\u23F0 ' + timeLabel + '</div>' +
      '<div style="background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:0.35rem 1rem;display:inline-flex;align-items:center;gap:0.5rem;font-size:0.85rem;">' +
        '<span style="opacity:0.6;">Score</span> <span id="itday-live-score" style="font-weight:700;color:' + scoreColor + ';">' + G.score + '</span>' +
      '</div>' +
    '</div>' +

    /* progress bar */
    '<div id="story-progress" style="height:6px;border-radius:3px;background:rgba(255,255,255,0.08);margin-bottom:1.5rem;overflow:hidden;">' +
      '<div style="width:' + pct + '%;height:100%;border-radius:3px;background:linear-gradient(90deg,#3b82f6,#8b5cf6);transition:width 0.4s ease;"></div>' +
    '</div>' +

    /* daily badge */
    (G.isDaily ? '<div style="text-align:center;margin-bottom:0.75rem;"><span style="font-size:0.75rem;padding:0.2rem 0.7rem;border-radius:12px;background:rgba(251,191,36,0.12);border:1px solid rgba(251,191,36,0.25);color:#fbbf24;">\uD83D\uDCC5 Daily Challenge</span></div>' : '') +

    /* scenario text */
    '<div style="font-size:1.15rem;line-height:1.75;margin-bottom:1.75rem;padding:0 0.25rem;">' + esc(scenario.text) + '</div>' +

    /* choices */
    '<div class="itday-choices" style="display:flex;flex-direction:column;gap:0.65rem;">';

  for (var i = 0; i < scenario.choices.length; i++) {
    html +=
      '<button class="itday-choice-btn" data-idx="' + i + '" style="position:relative;width:100%;text-align:left;padding:1rem 1.25rem;font-size:0.95rem;line-height:1.5;border-radius:12px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:#fff;cursor:pointer;transition:border-color 0.2s,background 0.2s;overflow:visible;">' +
        esc(scenario.choices[i].text) +
      '</button>';
  }
  html += '</div>';
  el.innerHTML = html;
  choosing = false;
}

function makeChoice(idx) {
  if (choosing) return;
  var scenario = scenarioMap.get(G.currentId);
  if (!scenario || idx < 0 || idx >= scenario.choices.length) return;
  choosing = true;

  var choice = scenario.choices[idx];
  G.score += choice.score;
  G.history.push({ scenarioId: G.currentId, choiceText: choice.text, score: choice.score, tag: choice.tag });

  /* visual feedback */
  var btns = document.querySelectorAll('.itday-choice-btn');
  btns.forEach(function (b) { b.disabled = true; b.style.opacity = '0.35'; b.style.pointerEvents = 'none'; });

  var btn = document.querySelector('.itday-choice-btn[data-idx="' + idx + '"]');
  if (btn) {
    btn.style.opacity = '1';
    btn.style.borderColor = choice.score >= 0 ? '#4ade80' : '#f87171';
    btn.style.background = choice.score >= 0 ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)';

    /* score pop */
    var pop = document.createElement('span');
    pop.className = 'itday-score-pop';
    var label = choice.score >= 0 ? '+' + choice.score : String(choice.score);
    pop.textContent = label;
    pop.style.cssText = 'position:absolute;top:50%;right:1rem;transform:translateY(-50%);font-weight:700;font-size:1.1rem;color:' +
      (choice.score >= 0 ? '#4ade80' : '#f87171') + ';opacity:1;transition:opacity 0.45s ease,transform 0.45s ease;pointer-events:none;';
    btn.appendChild(pop);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        pop.style.opacity = '0';
        pop.style.transform = 'translateY(-80%) scale(1.4)';
      });
    });

    // Tag badge
    if (choice.tag) {
      var tagColor = tagColors[choice.tag] || 'rgba(255,255,255,0.3)';
      var tagBadge = document.createElement('span');
      tagBadge.className = 'itday-tag-badge';
      tagBadge.textContent = choice.tag;
      tagBadge.style.cssText = 'display:inline-block;margin-left:0.5rem;padding:0.15rem 0.5rem;border-radius:10px;font-size:0.7rem;font-weight:600;background:' + tagColor + '20;color:' + tagColor + ';border:1px solid ' + tagColor + '40;';
      btn.appendChild(tagBadge);
    }
  }

  /* expert tip: find the best choice for this scenario */
  var bestChoice = scenario.choices.reduce(function (a, b) { return b.score > a.score ? b : a; }, scenario.choices[0]);
  if (bestChoice && bestChoice.text !== choice.text) {
    var tipEl = document.createElement('div');
    tipEl.style.cssText = 'margin-top:0.8rem;padding:0.7rem 1rem;background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.2);border-radius:10px;font-size:0.82rem;color:rgba(255,255,255,0.7);';
    tipEl.innerHTML = '<strong style="color:#60a5fa;">\uD83D\uDCA1 Expert tip:</strong> The best move was "<em>' + esc(bestChoice.text) + '</em>" (+' + bestChoice.score + ' pts)';
    var choices = document.querySelector('.itday-choices');
    if (choices) choices.parentNode.insertBefore(tipEl, choices.nextSibling);
  }

  /* update live score */
  var scoreEl = document.getElementById('itday-live-score');
  if (scoreEl) {
    scoreEl.textContent = G.score;
    scoreEl.style.color = G.score >= 0 ? '#4ade80' : '#f87171';
  }

  G.currentId = choice.next;
  G.scenarioIndex++;

  setTimeout(function () { renderScenario(); }, 1200);
}

/* ═══════════════════════════════════════════════════
   END GAME
   ═══════════════════════════════════════════════════ */
function endGame() {
  var el = document.getElementById('story-area');
  if (!el) return;

  var clamped = Math.max(0, Math.min(100, G.score));
  var tier = findTier(clamped);
  lastResult = { score: clamped, tier: tier };

  /* save to history */
  var hist = safeGet('itday_history', []);
  hist.push({ date: new Date().toISOString(), score: clamped, tier: tier.title, isDaily: G.isDaily, choiceCount: G.history.length });
  if (hist.length > 50) hist = hist.slice(-50);
  safeSet('itday_history', hist);

  /* tally traits */
  var traits = {};
  G.history.forEach(function(h) {
    if (h.tag) traits[h.tag] = (traits[h.tag] || 0) + 1;
  });
  var traitList = Object.entries(traits).sort(function(a, b) { return b[1] - a[1]; });
  var traitHtml = '';
  if (traitList.length) {
    traitHtml = '<div class="itday-traits"><h4>Your Admin Traits</h4><div class="itday-trait-list">';
    traitList.forEach(function(t) {
      var color = tagColors[t[0]] || 'rgba(255,255,255,0.5)';
      traitHtml += '<span class="itday-trait-pill" style="background:' + color + '15;color:' + color + ';border:1px solid ' + color + '30;">' + esc(t[0]) + ' \u00D7' + t[1] + '</span>';
    });
    traitHtml += '</div></div>';
  }

  /* build result html */
  var html =
    '<div style="text-align:center;padding:1.5rem 0.5rem 1rem;">' +
      '<div style="font-size:4.5rem;line-height:1;">' + tier.emoji + '</div>' +
      '<h2 style="margin:0.5rem 0 0.25rem;font-size:1.5rem;">' + esc(tier.title) + '</h2>' +
      '<div style="font-size:2.2rem;font-weight:700;color:#60a5fa;margin:0.25rem 0;">' + clamped + '<span style="font-size:1rem;opacity:0.5;">/100</span></div>' +
      '<p style="max-width:400px;margin:0.5rem auto 1.5rem;opacity:0.7;line-height:1.6;">' + esc(tier.desc) + '</p>' +
      traitHtml +
    '</div>' +

    /* timeline */
    '<div style="max-width:520px;margin:0 auto 1.75rem;padding:0 0.5rem;">' +
      '<h3 style="font-size:1rem;margin-bottom:1rem;opacity:0.8;">Your Choices</h3>';

  for (var i = 0; i < G.history.length; i++) {
    var h = G.history[i];
    var dotColor = h.score >= 0 ? '#4ade80' : '#f87171';
    var scoreLbl = h.score >= 0 ? '+' + h.score : String(h.score);
    html +=
      '<div style="display:flex;gap:0.75rem;margin-bottom:0.75rem;align-items:flex-start;">' +
        '<div style="flex:0 0 12px;margin-top:6px;">' +
          '<div style="width:12px;height:12px;border-radius:50%;background:' + dotColor + ';"></div>' +
          (i < G.history.length - 1 ? '<div style="width:2px;height:28px;background:rgba(255,255,255,0.1);margin:4px auto 0;"></div>' : '') +
        '</div>' +
        '<div style="flex:1;min-width:0;">' +
          '<div style="font-size:0.75rem;opacity:0.5;margin-bottom:2px;">' + esc(formatId(h.scenarioId)) + '</div>' +
          '<div style="font-size:0.9rem;line-height:1.4;">' + esc(h.choiceText) +
            ' <span style="font-weight:700;font-size:0.8rem;color:' + dotColor + ';">' + esc(scoreLbl) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';
  }
  html += '</div>';

  /* action buttons */
  html +=
    '<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:0.6rem;padding:0 0.5rem 1rem;">' +
      '<button data-action="start"  style="padding:0.7rem 1.2rem;border-radius:10px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.06);color:#fff;cursor:pointer;font-size:0.85rem;font-weight:600;">\u25B6\uFE0F Play Again</button>' +
      '<button data-action="daily"  style="padding:0.7rem 1.2rem;border-radius:10px;border:1px solid rgba(251,191,36,0.3);background:rgba(251,191,36,0.08);color:#fbbf24;cursor:pointer;font-size:0.85rem;font-weight:600;">\uD83D\uDCC5 Daily Challenge</button>' +
      '<button data-action="download" style="padding:0.7rem 1.2rem;border-radius:10px;border:1px solid rgba(96,165,250,0.3);background:rgba(96,165,250,0.08);color:#60a5fa;cursor:pointer;font-size:0.85rem;font-weight:600;">\u2B07\uFE0F Download Scorecard</button>' +
      '<button data-action="share"  style="padding:0.7rem 1.2rem;border-radius:10px;border:1px solid rgba(168,85,247,0.3);background:rgba(168,85,247,0.08);color:#a855f7;cursor:pointer;font-size:0.85rem;font-weight:600;">\uD83D\uDD17 Share</button>' +
    '</div>';

  el.innerHTML = html;
}

/* ═══════════════════════════════════════════════════
   SCORECARD (canvas → PNG)
   ═══════════════════════════════════════════════════ */
function downloadScorecard() {
  var t = lastResult.tier;
  if (!t) return;
  var W = 1200, H = 630;
  var c = document.createElement('canvas'); c.width = W; c.height = H;
  var ctx = c.getContext('2d');
  if (!ctx) return;

  /* bg */
  ctx.fillStyle = '#030308';
  ctx.fillRect(0, 0, W, H);
  var grd = ctx.createRadialGradient(600, 300, 80, 600, 300, 500);
  grd.addColorStop(0, 'rgba(96,165,250,0.12)');
  grd.addColorStop(1, 'transparent');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  /* title */
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '600 28px Inter,system-ui,sans-serif';
  ctx.fillText('IT Day Simulator', W / 2, 60);

  /* emoji */
  ctx.font = '80px serif';
  ctx.fillText(t.emoji, W / 2, 180);

  /* tier + score */
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 48px Inter,system-ui,sans-serif';
  ctx.fillText(t.title, W / 2, 250);
  ctx.fillStyle = '#60a5fa';
  ctx.font = '700 64px Inter,system-ui,sans-serif';
  ctx.fillText(lastResult.score + ' / 100', W / 2, 330);

  /* choice highlights */
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '400 20px Inter,system-ui,sans-serif';
  var highlights = G.history.slice(0, 4);
  for (var i = 0; i < highlights.length; i++) {
    var h = highlights[i];
    var lbl = (h.score >= 0 ? '+' : '') + h.score + '  ' + h.choiceText;
    if (lbl.length > 70) lbl = lbl.substring(0, 67) + '\u2026';
    ctx.fillText(lbl, 80, 400 + i * 32);
  }

  /* date + branding */
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = '400 18px Inter,system-ui,sans-serif';
  ctx.fillText(new Date().toLocaleDateString() + '  \u00B7  aguidetocloud.com', W - 60, H - 30);

  /* daily badge */
  if (G.isDaily) {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fbbf24';
    ctx.font = '600 20px Inter,system-ui,sans-serif';
    ctx.fillText('\uD83D\uDCC5 Daily Challenge', 60, H - 30);
  }

  /* download */
  try {
    var link = document.createElement('a');
    link.download = 'it-day-scorecard.png';
    link.href = c.toDataURL('image/png');
    link.click();
  } catch (_) { /* canvas tainted / security */ }
}

/* ═══════════════════════════════════════════════════
   SHARE
   ═══════════════════════════════════════════════════ */
function shareResult() {
  var t = lastResult.tier;
  if (!t) return;
  var url = window.location.origin + window.location.pathname +
    '?score=' + lastResult.score + '&tier=' + encodeURIComponent(t.title);
  var text = 'I scored ' + lastResult.score + ' in the IT Day Simulator \u2014 ' + t.title + ' ' + t.emoji + '! Can you beat me?';

  if (navigator.share) {
    navigator.share({ title: 'IT Day Simulator', text: text, url: url }).catch(function () {});
  } else if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(function () { showToast('Link copied!'); }).catch(function () {});
  }
}

function showToast(msg) {
  var existing = document.querySelector('.itday-toast');
  if (existing) existing.remove();
  var d = document.createElement('div');
  d.className = 'itday-toast';
  d.textContent = msg;
  d.setAttribute('role', 'status');
  d.style.cssText = 'position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);padding:0.6rem 1.4rem;border-radius:10px;background:rgba(0,0,0,0.85);border:1px solid rgba(255,255,255,0.15);color:#fff;font-size:0.85rem;z-index:9999;opacity:1;transition:opacity 0.4s ease;';
  document.body.appendChild(d);
  setTimeout(function () { d.style.opacity = '0'; }, 1800);
  setTimeout(function () { d.remove(); }, 2300);
}

/* ═══════════════════════════════════════════════════
   HISTORY
   ═══════════════════════════════════════════════════ */
function renderHistory() {
  var el = document.getElementById('results-history');
  if (!el) return;
  var hist = safeGet('itday_history', []);

  if (!hist.length) {
    el.innerHTML = '<p style="text-align:center;padding:2.5rem 1rem;opacity:0.5;">No games played yet. Start your first IT day!</p>';
    return;
  }

  var html = '<div style="display:flex;flex-direction:column;gap:0.65rem;max-width:520px;margin:0 auto;">';
  for (var i = hist.length - 1; i >= 0; i--) {
    var entry = hist[i];
    var tierObj = findTier(entry.score);
    html +=
      '<div style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem 1rem;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);">' +
        '<span style="font-size:1.6rem;">' + tierObj.emoji + '</span>' +
        '<div style="flex:1;min-width:0;">' +
          '<div style="font-weight:600;">' + esc(entry.tier || tierObj.title) + ' <span style="color:#60a5fa;font-weight:700;">' + entry.score + '</span></div>' +
          '<div style="font-size:0.78rem;opacity:0.55;">' +
            new Date(entry.date).toLocaleDateString() + ' \u00B7 ' + entry.choiceCount + ' choices' +
            (entry.isDaily ? ' \u00B7 <span style="color:#fbbf24;">\uD83D\uDCC5 Daily</span>' : '') +
          '</div>' +
        '</div>' +
      '</div>';
  }
  html += '</div>';
  html += '<div style="text-align:center;margin-top:1.25rem;">' +
    '<button data-action="clear-history" style="padding:0.5rem 1.2rem;border-radius:8px;border:1px solid rgba(248,113,113,0.25);background:rgba(248,113,113,0.08);color:#f87171;cursor:pointer;font-size:0.8rem;">Clear History</button>' +
  '</div>';
  el.innerHTML = html;
}

/* ═══════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════ */
function init() {
  buildScenarioMap();
  initTabs('itday');

  /* event delegation — story area (play + actions) */
  var storyArea = document.getElementById('story-area');
  if (storyArea) {
    storyArea.addEventListener('click', function (e) {
      /* choice buttons */
      var choiceBtn = e.target.closest('.itday-choice-btn');
      if (choiceBtn) {
        var idx = choiceBtn.getAttribute('data-idx');
        if (idx !== null) { makeChoice(parseInt(idx, 10)); return; }
      }
      /* action buttons */
      var actionBtn = e.target.closest('[data-action]');
      if (!actionBtn) return;
      var action = actionBtn.getAttribute('data-action');
      if (action === 'start')    startGame(false);
      else if (action === 'daily')    startGame(true);
      else if (action === 'download') downloadScorecard();
      else if (action === 'share')    shareResult();
    });
  }

  /* event delegation — history panel */
  var histEl = document.getElementById('results-history');
  if (histEl) {
    histEl.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action="clear-history"]');
      if (btn && confirm('Clear all game history?')) {
        safeSet('itday_history', []);
        renderHistory();
      }
    });
  }

  /* share URL challenge banner */
  var params = new URLSearchParams(window.location.search);
  var sharedScore = params.get('score');
  var sharedTier  = params.get('tier');

  renderStartScreen();

  if (sharedScore !== null && sharedTier !== null) {
    showChallengeBanner(sharedScore, sharedTier);
    try { history.replaceState(null, '', window.location.pathname); } catch (_) {}
  }
}

/* boot */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
