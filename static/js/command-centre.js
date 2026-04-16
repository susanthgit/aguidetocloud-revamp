/**
 * Command Centre — Operations Intelligence Engine
 * Dense, action-first, terminal-inspired dashboard
 */
(function() {
  'use strict';
  var API = '/api/stats';
  var siteData = null;
  var ytData = null;
  var _sitePulse = null;
  var _ytPulse = null;
  var _growthChart = null;

  var TOOLS = {
    'ai-news':'AI News','m365-roadmap':'M365 Roadmap','prompt-library':'Prompt Library',
    'licensing':'Licensing Simplifier','prompt-polisher':'Prompt Polisher','copilot-readiness':'Copilot Readiness',
    'copilot-matrix':'Copilot Feature Matrix','deprecation-timeline':'Deprecation Timeline',
    'service-health':'Service Health','cert-tracker':'Cert Guides','roi-calculator':'ROI Calculator',
    'ai-mapper':'AI Service Mapper','ai-showdown':'AI SaaS Showdown','ps-builder':'PowerShell Builder',
    'migration-planner':'Migration Planner','prompt-guide':'Prompt Guide',
    'ca-builder':'CA Policy Builder','meeting-planner':'Meeting Planner','feedback':'Feedback',
    'site-analytics':'Site Analytics','qr-generator':'QR Generator','wifi-qr':'WiFi QR',
    'password-generator':'Password Generator','image-compressor':'Image Compressor',
    'typing-test':'Typing Test','countdown':'Countdown','color-palette':'Colour Palette','pomodoro':'Pomodoro'
  };
  var SEO_IGNORE = ['karamatura','marawhara','hiking','track','trail','mount donald','tramping'];

  function esc(s) { var el = document.createElement('span'); el.textContent = s || ''; return el.innerHTML; }
  function numFmt(n) { return typeof n === 'number' ? n.toLocaleString('en-US') : String(n || 0); }
  function roundK(n) { return n >= 1000000 ? (n/1000000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : String(n); }

  // View switching
  document.querySelectorAll('.cc-view').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.cc-view').forEach(function(b) { b.classList.remove('active'); });
      document.querySelectorAll('.cc-panel').forEach(function(p) { p.classList.remove('active'); });
      btn.classList.add('active');
      var panel = document.getElementById('cc-' + btn.dataset.view);
      if (panel) panel.classList.add('active');
      if (btn.dataset.view === 'youtube' && !ytData) fetchYT();
      if (btn.dataset.view === 'seo' && siteData) renderSEO(siteData);
    });
  });

  // Fetch all data
  function init() {
    Promise.all([
      fetch(API + '?range=30d').then(function(r) { return r.json(); }),
      fetch(API + '?realtime=1').then(function(r) { return r.json(); }).catch(function() { return { active: 0 }; })
    ]).then(function(results) {
      siteData = results[0];
      renderDashboard(results[0], results[1]);
      // Pre-fetch YouTube in background
      fetchYT();
    }).catch(function() {});
  }

  function fetchYT() {
    if (ytData) { renderYouTube(ytData); return; }
    fetch(API + '?youtube=1').then(function(r) { return r.json(); }).then(function(data) {
      if (data.error) {
        // Try localStorage cache as fallback
        var cached = getCachedYT();
        if (cached) { ytData = cached; renderYouTube(cached); updateDashboardWithYT(); renderStreak(); return; }
        ['cc-yt-velocity','cc-yt-titles','cc-yt-projections','cc-yt-scorecard'].forEach(function(id) {
          var el = document.getElementById(id);
          if (el && !el.innerHTML.trim()) el.innerHTML = '<p style="color:var(--cc-amber);font-size:0.82rem">YouTube API: ' + esc(data.error.replace(/<[^>]*>/g, '').slice(0, 80)) + '</p>';
        });
        return;
      }
      ytData = data; cacheYTData(data); renderYouTube(data); updateDashboardWithYT(); renderStreak();
    }).catch(function() {});
  }

  // ── DASHBOARD VIEW ──
  function renderDashboard(data, realtime) {
    var ga4 = data.ga4;
    var gsc = data.gsc;
    if (!ga4) return;

    // Live count
    var liveEl = document.getElementById('cc-live');
    var liveNum = document.getElementById('cc-live-num');
    if (liveEl && realtime.active > 0) { liveEl.style.display = ''; liveNum.textContent = realtime.active; }

    // Health score
    var score = computeHealth(ga4, gsc);
    var healthEl = document.getElementById('cc-health-badge');
    if (healthEl) {
      var c = score >= 80 ? 'var(--cc-green)' : score >= 60 ? 'var(--cc-amber)' : 'var(--cc-red)';
      healthEl.textContent = score + '/100';
      healthEl.style.color = c;
      healthEl.style.background = (score >= 80 ? 'rgba(34,197,94,' : score >= 60 ? 'rgba(245,158,11,' : 'rgba(239,68,68,') + '0.12)';
    }

    // Updated
    var updEl = document.getElementById('cc-updated');
    if (updEl && data.updated) {
      var ago = Math.round((Date.now() - new Date(data.updated).getTime()) / 60000);
      updEl.textContent = (ago < 1 ? 'just now' : ago + 'm ago');
    }

    // Status strip
    var statusEl = document.getElementById('cc-status');
    if (statusEl) {
      var parts = [];
      parts.push('<strong>' + numFmt(ga4.today.views) + '</strong> views today' + getTimeContext(ga4.today.views, ga4.trend));
      parts.push('<strong>' + numFmt(ga4.totals.views) + '</strong> total (30d)');
      if (ga4.wow && ga4.wow.change) {
        var wc = ga4.wow.change.views;
        parts.push('WoW <span class="' + (wc >= 0 ? 'cc-up' : 'cc-down') + '">' + (wc >= 0 ? '+' : '') + wc + '%</span>');
      }
      // Since last visit
      var prev; try { prev = JSON.parse(localStorage.getItem('cc_last_visit')); } catch(e) {}
      if (prev && prev.views) {
        var dv = ga4.totals.views - prev.views;
        if (dv > 0) parts.push('Since last visit: <span class="cc-up">+' + numFmt(dv) + '</span>');
      }
      try { localStorage.setItem('cc_last_visit', JSON.stringify({ views: ga4.totals.views, time: Date.now() })); } catch(e) {}
      statusEl.innerHTML = parts.join(' &middot; ');
    }

    // Actions
    renderWoWRow(ga4);
    renderActions(ga4, gsc);
    renderStreak();

    // Site pulse chart
    if (ga4.trend && ga4.trend.length) {
      var ctx = document.getElementById('cc-site-pulse');
      if (ctx) {
        if (_sitePulse) { _sitePulse.destroy(); _sitePulse = null; }
        _sitePulse = new Chart(ctx, {
          type: 'line',
          data: { labels: ga4.trend.map(function(d) { return d.date.slice(5); }), datasets: [{ data: ga4.trend.map(function(d) { return d.views; }), borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.08)', fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 }] },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
        });
      }
    }

    // What's working
    var workingEl = document.getElementById('cc-working');
    if (workingEl && ga4.leaderboard) {
      workingEl.innerHTML = ga4.leaderboard.slice(0, 5).map(function(t) {
        return '<div class="cc-item"><span class="cc-item-name">' + esc(TOOLS[t.tool] || t.tool) + '</span><span class="cc-item-num" style="color:var(--cc-green)">' + roundK(t.views) + '</span></div>';
      }).join('');
    }

    // What needs fixing
    var fixingEl = document.getElementById('cc-fixing');
    if (fixingEl) {
      var fixes = [];
      if (gsc && gsc.queries) {
        gsc.queries.filter(function(q) { return q.position < 10 && q.ctr < 10 && q.impressions > 10 && !SEO_IGNORE.some(function(w) { return q.query.indexOf(w) > -1; }); }).slice(0, 2).forEach(function(q) {
          fixes.push('<div class="cc-item"><span class="cc-item-name">"' + esc(q.query) + '" pos ' + q.position + '</span><span class="cc-item-num" style="color:var(--cc-red)">' + q.ctr + '% CTR</span></div>');
        });
      }
      var lowTools = ga4.leaderboard ? ga4.leaderboard.filter(function(t) { return t.views < 10 && t.tool !== 'site-analytics' && t.tool !== 'feedback'; }) : [];
      if (lowTools.length) fixes.push('<div class="cc-item"><span class="cc-item-name">' + lowTools.length + ' tools &lt;10 views</span><span class="cc-item-num" style="color:var(--cc-amber)">promote</span></div>');
      fixingEl.innerHTML = fixes.length ? fixes.join('') : '<p style="color:var(--cc-muted);font-size:0.82rem">Nothing urgent</p>';
    }

    // Content bets
    renderContentBets(ga4, gsc);

    // Growth chart (full timeline)
    fetch(API + '?range=all').then(function(r) { return r.json(); }).then(function(allData) {
      if (!allData.ga4 || !allData.ga4.trend) return;
      var ctx = document.getElementById('cc-growth-chart');
      if (!ctx) return;
      if (_growthChart) { _growthChart.destroy(); _growthChart = null; }
      var trend = allData.ga4.trend;
      _growthChart = new Chart(ctx, {
        type: 'line',
        data: { labels: trend.map(function(d) { return d.date.slice(5); }), datasets: [{ label: 'Views', data: trend.map(function(d) { return d.views; }), borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.08)', fill: true, tension: 0.4, pointRadius: 2, borderWidth: 2 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: 'rgba(255,255,255,0.3)', maxTicksLimit: 10 }, grid: { color: 'rgba(255,255,255,0.04)' } }, y: { beginAtZero: true, ticks: { color: 'rgba(255,255,255,0.3)' }, grid: { color: 'rgba(255,255,255,0.04)' } } } }
      });
      // Growth stats
      var statsEl = document.getElementById('cc-growth-stats');
      if (statsEl && allData.ga4.weekly && allData.ga4.weekly.length) {
        var w = allData.ga4.weekly;
        var lastWeek = w[w.length - 1];
        statsEl.innerHTML = '<div class="cc-metric"><span class="cc-metric-num">' + numFmt(allData.ga4.totals.views) + '</span><span class="cc-metric-label">Total Views</span></div>'
          + '<div class="cc-metric"><span class="cc-metric-num">' + numFmt(allData.ga4.totals.users) + '</span><span class="cc-metric-label">Total Users</span></div>'
          + '<div class="cc-metric"><span class="cc-metric-num">' + w.length + '</span><span class="cc-metric-label">Weeks Active</span></div>'
          + '<div class="cc-metric"><span class="cc-metric-num">' + numFmt(lastWeek.views) + '</span><span class="cc-metric-label">This Week</span></div>';
      }
    }).catch(function() {});
  }

  function renderActions(ga4, gsc) {
    var el = document.getElementById('cc-actions');
    if (!el) return;
    var actions = [];
    // SEO fixes
    if (gsc && gsc.queries) {
      gsc.queries.filter(function(q) { return q.position < 10 && q.ctr < 8 && q.impressions > 15 && !SEO_IGNORE.some(function(w) { return q.query.indexOf(w) > -1; }); }).slice(0, 2).forEach(function(q) {
        actions.push({ p: 'high', tag: 'SEO', text: 'Rewrite meta for "' + q.query + '" \u2014 pos ' + q.position + ' but only ' + q.ctr + '% CTR' });
      });
    }
    // Low tools
    if (ga4.leaderboard) {
      var low = ga4.leaderboard.filter(function(t) { return t.views < 10 && t.tool !== 'site-analytics' && t.tool !== 'feedback'; });
      if (low.length > 2) actions.push({ p: 'medium', tag: 'SITE', text: 'Promote ' + low.slice(0,3).map(function(t) { return TOOLS[t.tool] || t.tool; }).join(', ') + ' \u2014 fewer than 10 views' });
    }
    // Content idea from GSC
    if (gsc && gsc.queries) {
      var rising = gsc.queries.filter(function(q) { return q.impressions > 30 && q.clicks < 3; }).slice(0, 1);
      if (rising.length) actions.push({ p: 'medium', tag: 'CONTENT', text: 'Write about "' + rising[0].query + '" \u2014 ' + rising[0].impressions + ' impressions but ' + rising[0].clicks + ' clicks' });
    }
    if (!actions.length) actions.push({ p: 'low', tag: 'OK', text: 'No urgent actions \u2014 keep publishing consistently' });
    el.innerHTML = actions.map(function(a) {
      return '<div class="cc-action cc-action-' + a.p + '"><span class="cc-action-tag">' + a.tag + '</span><span>' + esc(a.text) + '</span></div>';
    }).join('');
  }

  function renderContentBets(ga4, gsc) {
    var el = document.getElementById('cc-bets');
    if (!el) return;
    var bets = [];
    // From GSC: high impression queries with low clicks
    if (gsc && gsc.queries) {
      gsc.queries.filter(function(q) { return q.impressions > 20 && !SEO_IGNORE.some(function(w) { return q.query.indexOf(w) > -1; }); })
        .sort(function(a, b) { return b.impressions - a.impressions; }).slice(0, 3).forEach(function(q) {
          bets.push({ topic: q.query, reason: q.impressions + ' Google impressions, pos ' + q.position + ' \u2014 search demand exists', format: q.impressions > 50 ? 'BLOG + VIDEO' : 'BLOG' });
        });
    }
    // From top tools: create content about what works
    if (ga4.leaderboard && ga4.leaderboard.length > 2) {
      var top = ga4.leaderboard[0];
      bets.push({ topic: (TOOLS[top.tool] || top.tool) + ' deep dive', reason: 'Your #1 tool with ' + numFmt(top.views) + ' views \u2014 capitalize on momentum', format: 'VIDEO + BLOG' });
    }
    if (!bets.length) { el.innerHTML = '<p style="color:var(--cc-muted);font-size:0.82rem">Need more data to generate content bets</p>'; return; }
    el.innerHTML = bets.map(function(b, i) {
      return '<div class="cc-bet"><span class="cc-bet-rank">' + (i + 1) + '</span><div class="cc-bet-body"><div class="cc-bet-topic">' + esc(b.topic) + '</div><div class="cc-bet-reason">' + esc(b.reason) + '</div><span class="cc-bet-format">' + b.format + '</span></div></div>';
    }).join('');
  }

  function updateDashboardWithYT() {
    if (!ytData) return;
    // YT pulse chart
    if (ytData.analytics && !ytData.analytics.error && ytData.analytics.daily && ytData.analytics.daily.length) {
      var ctx = document.getElementById('cc-yt-pulse');
      if (ctx) {
        if (_ytPulse) { _ytPulse.destroy(); _ytPulse = null; }
        _ytPulse = new Chart(ctx, {
          type: 'line',
          data: { labels: ytData.analytics.daily.map(function(d) { return d.date.slice(5); }), datasets: [{ data: ytData.analytics.daily.map(function(d) { return d.views; }), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)', fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 }] },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
        });
      }
    }
  }

  function computeHealth(ga4, gsc) {
    var s = 0;
    var wv = (ga4.wow && ga4.wow.change) ? ga4.wow.change.views : 0;
    s += wv > 50 ? 25 : wv > 20 ? 20 : wv > 0 ? 15 : wv > -10 ? 10 : 5;
    if (gsc && gsc.queries && gsc.queries.length) { var ap = gsc.queries.reduce(function(x,q){return x+q.position;},0)/gsc.queries.length; s += ap < 5 ? 20 : ap < 10 ? 15 : ap < 20 ? 10 : 5; } else { s += 10; }
    if (ga4.totals.views > 0) { var r = ga4.totals.users / ga4.totals.views; s += r > 0.5 ? 25 : r > 0.35 ? 20 : r > 0.25 ? 15 : r > 0.15 ? 10 : 5; } else { s += 5; }
    s += ga4.totals.views > 5000 ? 25 : ga4.totals.views > 2000 ? 20 : ga4.totals.views > 500 ? 15 : ga4.totals.views > 100 ? 10 : 5;
    return s;
  }

  // ── YOUTUBE VIEW ──
  function renderYouTube(yt) {
    // Channel stats
    if (yt.main) renderMetrics('cc-yt-main', [{ n: roundK(yt.main.subscribers), l: 'Subs' }, { n: roundK(yt.main.totalViews), l: 'Views' }, { n: yt.main.videoCount, l: 'Videos' }]);
    if (yt.bites) renderMetrics('cc-yt-bites', [{ n: roundK(yt.bites.subscribers), l: 'Subs' }, { n: roundK(yt.bites.totalViews), l: 'Views' }, { n: yt.bites.videoCount, l: 'Videos' }]);
    // Scorecard
    if (yt.weeklyScorecard) {
      var sc = yt.weeklyScorecard;
      var el = document.getElementById('cc-yt-scorecard');
      if (el) {
        var gc = sc.grade.charAt(0) === 'A' ? 'var(--cc-green)' : sc.grade === 'B' ? 'var(--cc-amber)' : 'var(--cc-red)';
        var metrics = [
          { l: 'Views', tw: numFmt(sc.thisWeek.views), lw: numFmt(sc.lastWeek.views), c: sc.changes.views },
          { l: 'Watch', tw: numFmt(sc.thisWeek.watch)+'m', lw: numFmt(sc.lastWeek.watch)+'m', c: sc.changes.watch },
          { l: 'Net Subs', tw: sc.thisWeek.subs, lw: sc.lastWeek.subs, c: sc.changes.subs },
          { l: 'Likes', tw: numFmt(sc.thisWeek.likes), lw: numFmt(sc.lastWeek.likes), c: sc.changes.likes }
        ];
        el.innerHTML = '<div class="cc-sc-grade" style="color:' + gc + '">' + sc.grade + '</div>'
          + '<div class="cc-scorecard"><span class="cc-sc-header"></span><span class="cc-sc-header">This Wk</span><span class="cc-sc-header">Last Wk</span><span class="cc-sc-header">Change</span>'
          + metrics.map(function(m) {
            var cls = m.c > 0 ? 'cc-up' : m.c < 0 ? 'cc-down' : '';
            return '<span class="cc-sc-cell cc-sc-label">' + m.l + '</span><span class="cc-sc-cell">' + m.tw + '</span><span class="cc-sc-cell">' + m.lw + '</span><span class="cc-sc-cell ' + cls + '">' + (m.c >= 0 ? '+' : '') + m.c + '%</span>';
          }).join('') + '</div>';
      }
    }
    // Velocity leaderboard
    if (yt.mainVideos) {
      var el = document.getElementById('cc-yt-velocity');
      if (el) {
        var sorted = yt.mainVideos.slice().sort(function(a,b) { return b.viewsPerDay - a.viewsPerDay; });
        el.innerHTML = sorted.slice(0, 15).map(function(v, i) {
          var sc = v.engagement > 5 ? 'cc-score-good' : v.engagement > 2 ? 'cc-score-ok' : 'cc-score-bad';
          return '<div class="cc-lb-item"><span class="cc-lb-rank">' + (i+1) + '</span><span class="cc-lb-name"><a href="https://youtube.com/watch?v=' + esc(v.id) + '" target="_blank" rel="noopener">' + esc(v.title.length > 50 ? v.title.slice(0,47) + '...' : v.title) + '</a></span><span class="cc-lb-stats">' + v.viewsPerDay + '/d</span><span class="cc-lb-score ' + sc + '">' + v.engagement + '%</span></div>';
        }).join('');
      }
    }
    // Title scores
    if (yt.titleScores) {
      var el = document.getElementById('cc-yt-titles');
      if (el) {
        el.innerHTML = yt.titleScores.map(function(t) {
          var sc = t.score >= 70 ? 'cc-score-good' : t.score >= 50 ? 'cc-score-ok' : 'cc-score-bad';
          var issues = t.issues && t.issues.length ? '<div class="cc-title-issues">' + t.issues.map(function(i) { return '<span class="cc-title-issue">' + esc(i) + '</span>'; }).join('') + '</div>' : '';
          return '<div class="cc-lb-item" style="flex-wrap:wrap"><span class="cc-lb-score ' + sc + '">' + t.score + '</span><span class="cc-lb-name" style="flex:1;min-width:200px"><a href="https://youtube.com/watch?v=' + esc(t.id) + '" target="_blank" rel="noopener">' + esc(t.title) + '</a></span><span class="cc-lb-stats">' + roundK(t.views) + '</span>' + issues + '</div>';
        }).join('');
      }
    }
    // Projections
    if (yt.milestoneProjections) {
      var el = document.getElementById('cc-yt-projections');
      var p = yt.milestoneProjections;
      if (el) {
        var html = '<div class="cc-metrics-row" style="margin-bottom:1rem"><div class="cc-metric"><span class="cc-metric-num">' + numFmt(p.currentTotal) + '</span><span class="cc-metric-label">Combined Subs</span></div><div class="cc-metric"><span class="cc-metric-num" style="color:var(--cc-green)">' + p.netPerDay + '</span><span class="cc-metric-label">Net/Day</span></div><div class="cc-metric"><span class="cc-metric-num">' + numFmt(p.netPerMonth) + '</span><span class="cc-metric-label">Net/Month</span></div></div>';
        if (p.targets) {
          html += p.targets.map(function(t) {
            var label = t.target >= 1000000 ? (t.target/1000000)+'M' : (t.target/1000)+'K';
            var pct = Math.min(100, Math.round((p.currentTotal / t.target) * 100));
            var c = pct >= 80 ? 'var(--cc-green)' : pct >= 50 ? 'var(--cc-amber)' : 'var(--cc-muted)';
            return '<div class="cc-proj"><div class="cc-proj-header"><span class="cc-proj-label">' + label + '</span><span class="cc-proj-pct" style="color:' + c + '">' + pct + '%</span></div><div class="cc-proj-bar"><div class="cc-proj-fill" style="width:' + pct + '%;background:' + c + '"></div></div><div class="cc-proj-meta"><span>' + numFmt(p.currentTotal) + ' / ' + numFmt(t.target) + '</span><span>' + (t.reachable ? t.daysNeeded + ' days (' + t.date + ')' : 'Not at current rate') + '</span></div></div>';
          }).join('');
        }
        el.innerHTML = html;
      }
    }
  }

  function renderMetrics(id, items) {
    var el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = items.map(function(m) {
      return '<div class="cc-metric"><span class="cc-metric-num">' + m.n + '</span><span class="cc-metric-label">' + m.l + '</span></div>';
    }).join('');
  }

  // ── SEO VIEW ──
  function renderSEO(data) {
    var gsc = data.gsc;
    if (!gsc || !gsc.queries) return;
    var filter = document.getElementById('cc-seo-filter');
    var queries = gsc.queries;
    if (filter && filter.checked) queries = queries.filter(function(q) { return !SEO_IGNORE.some(function(w) { return q.query.indexOf(w) > -1; }); });

    // Opportunities
    var oppsEl = document.getElementById('cc-seo-opps');
    if (oppsEl) {
      var opps = queries.filter(function(q) { return q.position < 10 && q.ctr < 10 && q.impressions > 10; });
      oppsEl.innerHTML = opps.length ? opps.map(function(q) {
        var est = Math.round(q.impressions * 0.2) - q.clicks;
        return '<div class="cc-opp"><div class="cc-opp-query">' + esc(q.query) + '</div><div class="cc-opp-meta">pos ' + q.position + ' \u00B7 ' + q.ctr + '% CTR \u00B7 ' + q.impressions + ' imp</div><div class="cc-opp-uplift">+' + est + ' clicks/mo potential</div></div>';
      }).join('') : '<p style="color:var(--cc-muted);font-size:0.82rem">No gaps found \u2014 titles look solid</p>';
    }

    // All queries
    var qEl = document.getElementById('cc-seo-queries');
    if (qEl) {
      qEl.innerHTML = queries.map(function(q) {
        var pc = q.position <= 3 ? 'cc-pos-top3' : q.position <= 10 ? 'cc-pos-top10' : q.position <= 20 ? 'cc-pos-top20' : 'cc-pos-deep';
        return '<div class="cc-lb-item"><span class="cc-pos ' + pc + '">' + q.position + '</span><span class="cc-lb-name" style="font-family:var(--cc-mono);font-size:0.82rem">' + esc(q.query) + '</span><span class="cc-lb-stats">' + q.clicks + 'c \u00B7 ' + q.impressions + 'i \u00B7 ' + q.ctr + '%</span></div>';
      }).join('');
    }

    // Content gaps
    var gapsEl = document.getElementById('cc-seo-gaps');
    if (gapsEl) {
      var cats = { copilot:['copilot','m365 copilot'], licensing:['licensing','license','e3','e5'], security:['conditional access','security','zero trust'], migration:['migration','migrate'], powershell:['powershell','script'], certification:['az-900','az-104','certification','exam'], ai:['ai','openai','claude','chatgpt'] };
      var qText = queries.map(function(q) { return q.query.toLowerCase(); });
      var gaps = [];
      Object.keys(cats).forEach(function(cat) {
        var has = cats[cat].some(function(kw) { return qText.some(function(q) { return q.indexOf(kw) > -1; }); });
        if (!has) gaps.push(cat);
      });
      gapsEl.innerHTML = gaps.length ? gaps.map(function(g) {
        return '<div class="cc-gap"><span class="cc-gap-cat">' + esc(g) + '</span><span class="cc-gap-hint">No ranking queries \u2014 content opportunity</span></div>';
      }).join('') : '<p style="color:var(--cc-green);font-size:0.82rem">\u2713 Good coverage across all categories</p>';
    }

    // Wire filter
    if (filter) {
      filter.onchange = function() { renderSEO(siteData); };
    }
    renderSEOQuickWins(queries);
  }

  // ── V2: TIME CONTEXT (#1) ──
  function getTimeContext(todayViews, trend) {
    if (!trend || trend.length < 7) return '';
    var hour = new Date().getHours();
    var dayAvg = trend.reduce(function(s, d) { return s + d.views; }, 0) / trend.length;
    // Estimate daily total based on current hour (assuming uniform distribution)
    var projected = hour > 0 ? Math.round(todayViews * (24 / hour)) : 0;
    var paceStr = projected > 0 ? ' (on track for ~' + numFmt(projected) + ' today)' : '';
    var vsAvg = dayAvg > 0 ? Math.round((todayViews / (dayAvg * hour / 24)) * 100) : 100;
    var paceClass = vsAvg >= 120 ? 'cc-up' : vsAvg < 80 ? 'cc-down' : '';
    return paceStr + (paceClass ? ' <span class="' + paceClass + '">' + vsAvg + '% of typical pace</span>' : '');
  }

  // ── V2: WOW COMPARISON ROW (#5) ──
  function renderWoWRow(ga4) {
    var el = document.getElementById('cc-wow-row');
    if (!el || !ga4.wow) return;
    var ch = ga4.wow.change;
    var tw = ga4.wow.thisWeek;
    var lw = ga4.wow.lastWeek;
    var items = [
      { label: 'Views', tw: tw.views, lw: lw.views, chg: ch.views },
      { label: 'Users', tw: tw.users, lw: lw.users, chg: ch.users },
      { label: 'Sessions', tw: tw.sessions, lw: lw.sessions, chg: ch.sessions }
    ];
    el.innerHTML = items.map(function(m) {
      var cls = m.chg > 0 ? 'cc-wow-up' : m.chg < 0 ? 'cc-wow-down' : 'cc-wow-flat';
      var arrow = m.chg > 0 ? '\u2191' : m.chg < 0 ? '\u2193' : '\u2192';
      return '<div class="cc-wow-item ' + cls + '"><span class="cc-wow-val">' + numFmt(m.tw) + '</span><span class="cc-wow-label">' + m.label + '</span><span class="cc-wow-chg">' + arrow + ' ' + Math.abs(m.chg) + '% vs ' + numFmt(m.lw) + '</span></div>';
    }).join('');
  }

  // ── V2: PUBLISH STREAK (#3) ──
  function renderStreak() {
    var section = document.getElementById('cc-streak-section');
    var el = document.getElementById('cc-streak');
    if (!el || !section) return;
    // Compute from YouTube data if available
    var lastVideo = null;
    if (ytData && ytData.mainVideos && ytData.mainVideos.length) {
      var sorted = ytData.mainVideos.slice().sort(function(a, b) { return b.published > a.published ? 1 : -1; });
      lastVideo = sorted[0];
    }
    var parts = [];
    if (lastVideo) {
      var daysSince = Math.round((Date.now() - new Date(lastVideo.published + 'T12:00:00Z').getTime()) / 86400000);
      var cls = daysSince <= 3 ? 'cc-up' : daysSince <= 7 ? 'cc-amber-text' : 'cc-down';
      parts.push('Last video: <span class="' + cls + '">' + daysSince + ' days ago</span>');
    }
    if (siteData && siteData.ga4 && siteData.ga4.blog_pages && siteData.ga4.blog_pages.length) {
      parts.push(siteData.ga4.blog_pages.length + ' blog posts getting traffic');
    }
    if (!parts.length) { section.style.display = 'none'; return; }
    section.style.display = '';
    el.innerHTML = '<div class="cc-streak-bar">' + parts.join(' \u00B7 ') + '</div>';
  }

  // ── V2: YT LOCALSTORAGE CACHE (#4) ──
  function cacheYTData(data) {
    try { localStorage.setItem('cc_yt_cache', JSON.stringify({ data: data, time: Date.now() })); } catch(e) {}
  }
  function getCachedYT() {
    try {
      var cached = JSON.parse(localStorage.getItem('cc_yt_cache'));
      if (cached && cached.data && Date.now() - cached.time < 86400000) return cached.data;
    } catch(e) {}
    return null;
  }

  // ── V2: GOAL PACE LINE (#6) ──
  // Integrated into growth chart — adds dashed target line

  // ── V2: SEO QUICK WINS (#7) ──
  function renderSEOQuickWins(queries) {
    var el = document.getElementById('cc-seo-quickwins');
    if (!el) return;
    // Queries at position 8-20 with decent impressions — one push to page 1
    var wins = queries.filter(function(q) {
      return q.position > 7 && q.position <= 20 && q.impressions > 10 && !SEO_IGNORE.some(function(w) { return q.query.indexOf(w) > -1; });
    }).sort(function(a, b) { return a.position - b.position; }).slice(0, 5);
    if (!wins.length) { el.innerHTML = '<p style="color:var(--cc-muted);font-size:0.82rem">All your key queries are already on page 1</p>'; return; }
    el.innerHTML = wins.map(function(q) {
      var gap = Math.round(q.position - 10);
      return '<div class="cc-opp"><div class="cc-opp-query">' + esc(q.query) + '</div><div class="cc-opp-meta">pos ' + q.position + ' \u00B7 ' + q.impressions + ' imp \u00B7 needs to move ' + Math.abs(gap) + ' positions</div><div class="cc-opp-uplift">Add internal links + update content to push to page 1</div></div>';
    }).join('');
  }

  // ── V2: KEYBOARD SHORTCUTS (#8) ──
  document.addEventListener('keydown', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    var key = e.key.toLowerCase();
    if (key === 'd') switchView('dashboard');
    else if (key === 'y') switchView('youtube');
    else if (key === 's') switchView('seo');
    else if (key === 't') switchView('strategy');
    else if (key === 'r') { e.preventDefault(); location.reload(); }
  });
  function switchView(name) {
    document.querySelectorAll('.cc-view').forEach(function(b) { b.classList.remove('active'); if (b.dataset.view === name) b.classList.add('active'); });
    document.querySelectorAll('.cc-panel').forEach(function(p) { p.classList.remove('active'); });
    var panel = document.getElementById('cc-' + name);
    if (panel) panel.classList.add('active');
    if (name === 'youtube' && !ytData) fetchYT();
    if (name === 'seo' && siteData) renderSEO(siteData);
    if (name === 'strategy') renderStrategy();
  }

  // ── V2: COPY WEEKLY REPORT (#9) ──
  function copyWeeklyReport() {
    if (!siteData || !siteData.ga4) return;
    var ga4 = siteData.ga4;
    var lines = ['WEEKLY REPORT \u2014 ' + new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), ''];
    lines.push('SITE: ' + numFmt(ga4.totals.views) + ' views, ' + numFmt(ga4.totals.users) + ' users (30d)');
    if (ga4.wow) lines.push('WoW: views ' + (ga4.wow.change.views >= 0 ? '+' : '') + ga4.wow.change.views + '%, users ' + (ga4.wow.change.users >= 0 ? '+' : '') + ga4.wow.change.users + '%');
    lines.push('');
    lines.push('TOP TOOLS:');
    if (ga4.leaderboard) ga4.leaderboard.slice(0, 5).forEach(function(t, i) { lines.push('  ' + (i+1) + '. ' + (TOOLS[t.tool] || t.tool) + ': ' + numFmt(t.views) + ' views'); });
    if (ytData && ytData.main) {
      lines.push('');
      lines.push('YOUTUBE: ' + roundK(ytData.main.subscribers) + ' subs, ' + roundK(ytData.main.totalViews) + ' views');
      if (ytData.weeklyScorecard) lines.push('Grade: ' + ytData.weeklyScorecard.grade);
    }
    if (siteData.gsc && siteData.gsc.queries) {
      lines.push('');
      lines.push('SEO: ' + siteData.gsc.queries.length + ' ranking queries');
    }
    var text = lines.join('\n');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function() {
        var btn = document.getElementById('cc-copy-report');
        if (btn) { btn.textContent = 'Copied!'; setTimeout(function() { btn.textContent = 'Copy Report'; }, 2000); }
      });
    }
  }
  var reportBtn = document.getElementById('cc-copy-report');
  if (reportBtn) reportBtn.addEventListener('click', copyWeeklyReport);

  // ── V3: STRATEGY VIEW ──
  function renderStrategy() {
    renderTopicClusters();
    renderContentCalendar();
    renderPredictions();
    renderCompetitors();
    renderPortfolio();
  }

  // ── V3: TOPIC CLUSTERS ──
  var TOPIC_MAP = {
    'copilot': { keywords: ['copilot','m365 copilot','copilot chat','copilot studio'], label: 'Copilot' },
    'azure': { keywords: ['azure','az-','cloud','iaas','vm','virtual machine'], label: 'Azure' },
    'security': { keywords: ['security','conditional access','zero trust','mfa','entra','purview','dlp'], label: 'Security' },
    'licensing': { keywords: ['licensing','license','e3','e5','e7','plan','pricing','sku'], label: 'Licensing' },
    'teams': { keywords: ['teams','meeting','collaboration'], label: 'Teams' },
    'intune': { keywords: ['intune','endpoint','device','mdm','sccm'], label: 'Intune/Endpoint' },
    'certification': { keywords: ['az-900','az-104','az-305','sc-','ms-102','exam','certification','study'], label: 'Certifications' },
    'ai': { keywords: ['ai ','artificial intelligence','openai','chatgpt','claude','gemini','foundry'], label: 'AI & ML' },
    'admin': { keywords: ['admin','powershell','exchange','sharepoint','migration','tenant'], label: 'IT Admin' }
  };

  function renderTopicClusters() {
    var el = document.getElementById('cc-clusters');
    if (!el) return;
    var clusters = {};
    Object.keys(TOPIC_MAP).forEach(function(k) { clusters[k] = { label: TOPIC_MAP[k].label, videos: [], siteViews: 0, queries: 0 }; });
    clusters['other'] = { label: 'Other', videos: [], siteViews: 0, queries: 0 };
    // Assign videos to clusters
    if (ytData && ytData.mainVideos) {
      ytData.mainVideos.forEach(function(v) {
        var matched = false;
        var tl = v.title.toLowerCase();
        Object.keys(TOPIC_MAP).forEach(function(k) {
          if (!matched && TOPIC_MAP[k].keywords.some(function(kw) { return tl.indexOf(kw) > -1; })) {
            clusters[k].videos.push(v); matched = true;
          }
        });
        if (!matched) clusters['other'].videos.push(v);
      });
    }
    // Assign site tool views to clusters
    if (siteData && siteData.ga4 && siteData.ga4.leaderboard) {
      var toolClusterMap = { 'copilot-readiness':'copilot','copilot-matrix':'copilot','roi-calculator':'copilot','licensing':'licensing','ca-builder':'security','service-health':'admin','ps-builder':'admin','migration-planner':'admin','ai-mapper':'ai','ai-showdown':'ai','cert-tracker':'certification','prompt-library':'ai','prompt-polisher':'ai','prompt-guide':'ai' };
      siteData.ga4.leaderboard.forEach(function(t) {
        var ck = toolClusterMap[t.tool] || 'other';
        if (clusters[ck]) clusters[ck].siteViews += t.views;
      });
    }
    // Assign GSC queries
    if (siteData && siteData.gsc && siteData.gsc.queries) {
      siteData.gsc.queries.forEach(function(q) {
        var ql = q.query.toLowerCase();
        var matched = false;
        Object.keys(TOPIC_MAP).forEach(function(k) {
          if (!matched && TOPIC_MAP[k].keywords.some(function(kw) { return ql.indexOf(kw) > -1; })) {
            clusters[k].queries++; matched = true;
          }
        });
      });
    }
    // Render
    var sorted = Object.keys(clusters).filter(function(k) { return clusters[k].videos.length > 0 || clusters[k].siteViews > 0; })
      .map(function(k) { var c = clusters[k]; var totalViews = c.videos.reduce(function(s,v){return s+v.views;},0); var avgEng = c.videos.length ? c.videos.reduce(function(s,v){return s+v.engagement;},0)/c.videos.length : 0; return { key: k, label: c.label, vids: c.videos.length, totalViews: totalViews, avgEng: Math.round(avgEng*100)/100, siteViews: c.siteViews, queries: c.queries, score: totalViews + c.siteViews * 2 }; })
      .sort(function(a,b) { return b.score - a.score; });
    var maxScore = sorted.length ? sorted[0].score : 1;
    el.innerHTML = sorted.map(function(c) {
      var pct = Math.round((c.score / maxScore) * 100);
      var barColor = pct >= 60 ? 'var(--cc-green)' : pct >= 30 ? 'var(--cc-amber)' : 'var(--cc-red)';
      return '<div class="cc-cluster"><div class="cc-cluster-head"><span class="cc-cluster-label">' + esc(c.label) + '</span><span class="cc-cluster-stats">' + c.vids + ' vids \u00B7 ' + roundK(c.totalViews) + ' YT views \u00B7 ' + roundK(c.siteViews) + ' site views \u00B7 ' + c.queries + ' queries</span></div><div class="cc-proj-bar"><div class="cc-proj-fill" style="width:' + pct + '%;background:' + barColor + '"></div></div></div>';
    }).join('');
  }

  // ── V3: CONTENT CALENDAR ──
  function renderContentCalendar() {
    var el = document.getElementById('cc-calendar');
    if (!el) return;
    var plans; try { plans = JSON.parse(localStorage.getItem('cc_calendar')) || []; } catch(e) { plans = []; }
    // Show next 14 days
    var days = [];
    var now = new Date();
    for (var i = 0; i < 14; i++) {
      var d = new Date(now); d.setDate(now.getDate() + i);
      var dateStr = d.toISOString().split('T')[0];
      var dayName = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
      var planned = plans.filter(function(p) { return p.date === dateStr; });
      days.push({ date: dateStr, day: dayName, isToday: i === 0, planned: planned });
    }
    el.innerHTML = '<div class="cc-cal-grid">' + days.map(function(d) {
      var cls = d.isToday ? ' cc-cal-today' : '';
      var content = d.planned.length ? d.planned.map(function(p) {
        return '<div class="cc-cal-item cc-cal-' + (p.type || 'blog') + '" title="' + esc(p.title) + '">' + esc(p.title.length > 20 ? p.title.slice(0,18) + '..' : p.title) + '</div>';
      }).join('') : '';
      return '<div class="cc-cal-day' + cls + '" data-date="' + d.date + '"><span class="cc-cal-date">' + d.day + ' ' + d.date.slice(5) + '</span>' + content + '</div>';
    }).join('') + '</div>';
    // Add button handler
    var addBtn = document.getElementById('cc-cal-add');
    if (addBtn) addBtn.onclick = function() {
      var title = prompt('Content title:');
      if (!title) return;
      var date = prompt('Date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
      if (!date) return;
      var type = prompt('Type (blog/video/both):', 'blog');
      plans.push({ title: title, date: date, type: type || 'blog' });
      try { localStorage.setItem('cc_calendar', JSON.stringify(plans)); } catch(e) {}
      renderContentCalendar();
    };
  }

  // ── V3: GROWTH PREDICTIONS ──
  function renderPredictions() {
    var el = document.getElementById('cc-predictions');
    if (!el) return;
    // Use YouTube subscriber data if available
    var currentSubs = 0; var netPerDay = 0;
    if (ytData && ytData.milestoneProjections) {
      currentSubs = ytData.milestoneProjections.currentTotal;
      netPerDay = ytData.milestoneProjections.netPerDay;
    } else if (ytData && ytData.main && ytData.bites) {
      currentSubs = (ytData.main.subscribers || 0) + (ytData.bites.subscribers || 0);
    }
    // Site growth
    var siteViewsPerDay = 0;
    if (siteData && siteData.ga4 && siteData.ga4.trend && siteData.ga4.trend.length) {
      siteViewsPerDay = Math.round(siteData.ga4.trend.reduce(function(s,d){return s+d.views;},0) / siteData.ga4.trend.length);
    }
    var scenarios = [
      { name: 'Current pace', subsMult: 1, viewsMult: 1 },
      { name: 'Double output', subsMult: 1.8, viewsMult: 1.8 },
      { name: '10x effort', subsMult: 5, viewsMult: 5 }
    ];
    var targets = [100000, 500000, 1000000];
    el.innerHTML = '<div class="cc-pred-grid">'
      + '<div class="cc-pred-header"><span></span>' + scenarios.map(function(s) { return '<span>' + s.name + '</span>'; }).join('') + '</div>'
      + targets.map(function(t) {
        var label = t >= 1000000 ? '1M subs' : (t/1000) + 'K subs';
        return '<div class="cc-pred-row"><span class="cc-pred-label">' + label + '</span>' + scenarios.map(function(sc) {
          var rate = netPerDay * sc.subsMult;
          var needed = t - currentSubs;
          if (rate <= 0 || needed <= 0) return '<span class="cc-pred-cell">' + (needed <= 0 ? '\u2705 Done' : '\u274C') + '</span>';
          var days = Math.ceil(needed / rate);
          var date = new Date(Date.now() + days * 86400000);
          var dateStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          return '<span class="cc-pred-cell">' + dateStr + ' <small>(' + Math.round(days/30) + 'mo)</small></span>';
        }).join('') + '</div>';
      }).join('')
      + '</div>'
      + '<p class="cc-hint" style="margin-top:0.75rem">Site: ' + numFmt(siteViewsPerDay) + ' views/day \u00B7 YouTube: ' + (netPerDay > 0 ? '+' : '') + netPerDay + ' subs/day \u00B7 Combined: ' + numFmt(currentSubs) + ' subs</p>';
  }

  // ── V3: COMPETITOR WATCH ──
  function renderCompetitors() {
    var el = document.getElementById('cc-competitors');
    if (!el) return;
    var comps; try { comps = JSON.parse(localStorage.getItem('cc_competitors')) || []; } catch(e) { comps = []; }
    if (!comps.length) {
      el.innerHTML = '<p style="color:var(--cc-muted);font-size:0.82rem">No competitors added yet. Click "+ Add Channel" to track competitor YouTube channels.</p>';
    } else {
      el.innerHTML = comps.map(function(c) {
        return '<div class="cc-item"><span class="cc-item-name">' + esc(c.name || c.id) + '</span><span class="cc-item-num">' + (c.subscribers ? roundK(c.subscribers) + ' subs' : 'loading...') + '</span></div>';
      }).join('');
    }
    // Add button handler
    var addBtn = document.getElementById('cc-comp-add');
    if (addBtn) addBtn.onclick = function() {
      var id = prompt('YouTube Channel ID (e.g. UCxxxxxxxx):');
      if (!id) return;
      var name = prompt('Channel name (for display):');
      comps.push({ id: id.trim(), name: name || id.trim() });
      try { localStorage.setItem('cc_competitors', JSON.stringify(comps)); } catch(e) {}
      renderCompetitors();
      // Try to fetch their stats
      fetch(API + '?youtube=1').catch(function() {}); // just to warm up the API — competitor fetch would need separate implementation
    };
  }

  // ── V3: PORTFOLIO HEALTH ──
  function renderPortfolio() {
    var el = document.getElementById('cc-portfolio');
    if (!el) return;
    var items = [];
    // Score each content type
    var blogScore = 0; var toolScore = 0; var videoScore = 0;
    if (siteData && siteData.ga4) {
      var ga4 = siteData.ga4;
      if (ga4.blog_pages && ga4.blog_pages.length) {
        var avgBlogViews = ga4.blog_pages.reduce(function(s,p){return s+p.views;},0) / ga4.blog_pages.length;
        blogScore = avgBlogViews > 50 ? 90 : avgBlogViews > 20 ? 70 : avgBlogViews > 5 ? 50 : 30;
        items.push({ label: 'Blog Posts', score: blogScore, detail: ga4.blog_pages.length + ' posts, avg ' + Math.round(avgBlogViews) + ' views' });
      }
      if (ga4.leaderboard && ga4.leaderboard.length) {
        var activateTools = ga4.leaderboard.filter(function(t) { return t.views > 10; }).length;
        var totalTools = ga4.leaderboard.length;
        toolScore = Math.round((activateTools / totalTools) * 100);
        items.push({ label: 'Tools', score: toolScore, detail: activateTools + '/' + totalTools + ' tools with >10 views' });
      }
    }
    if (ytData && ytData.mainVideos && ytData.mainVideos.length) {
      var avgVpd = ytData.mainVideos.reduce(function(s,v){return s+v.viewsPerDay;},0) / ytData.mainVideos.length;
      videoScore = avgVpd > 20 ? 90 : avgVpd > 10 ? 70 : avgVpd > 3 ? 50 : 30;
      items.push({ label: 'YouTube Videos', score: videoScore, detail: ytData.mainVideos.length + ' videos, avg ' + Math.round(avgVpd*10)/10 + ' views/day' });
    }
    // SEO coverage
    if (siteData && siteData.gsc && siteData.gsc.queries) {
      var top10 = siteData.gsc.queries.filter(function(q) { return q.position <= 10; }).length;
      var seoScore = Math.min(100, Math.round((top10 / siteData.gsc.queries.length) * 100));
      items.push({ label: 'SEO Coverage', score: seoScore, detail: top10 + '/' + siteData.gsc.queries.length + ' queries in top 10' });
    }
    if (!items.length) { el.innerHTML = '<p style="color:var(--cc-muted);font-size:0.82rem">Need more data</p>'; return; }
    var overallScore = Math.round(items.reduce(function(s,i){return s+i.score;},0) / items.length);
    var oc = overallScore >= 70 ? 'var(--cc-green)' : overallScore >= 50 ? 'var(--cc-amber)' : 'var(--cc-red)';
    el.innerHTML = '<div style="text-align:center;margin-bottom:1rem"><span style="font-family:var(--cc-mono);font-size:2.5rem;font-weight:800;color:' + oc + '">' + overallScore + '</span><span style="color:var(--cc-muted);font-size:0.78rem;display:block">Portfolio Score</span></div>'
      + items.map(function(item) {
        var c = item.score >= 70 ? 'var(--cc-green)' : item.score >= 50 ? 'var(--cc-amber)' : 'var(--cc-red)';
        return '<div class="cc-proj"><div class="cc-proj-header"><span class="cc-proj-label">' + esc(item.label) + '</span><span class="cc-proj-pct" style="color:' + c + '">' + item.score + '%</span></div><div class="cc-proj-bar"><div class="cc-proj-fill" style="width:' + item.score + '%;background:' + c + '"></div></div><div class="cc-proj-meta"><span>' + esc(item.detail) + '</span></div></div>';
      }).join('');
  }

  // ── V2: ANIMATED COUNTERS (#10) ──
  function animateCounter(el, target) {
    if (!el) return;
    var start = parseInt(el.textContent.replace(/,/g, '')) || 0;
    if (start === target) return;
    var dur = 800;
    var t0 = null;
    function tick(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var ease = 1 - Math.pow(1 - p, 3);
      el.textContent = numFmt(Math.round(start + (target - start) * ease));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ── INIT ──
  init();
  setInterval(function() { fetch(API + '?realtime=1').then(function(r) { return r.json(); }).then(function(rt) { var el = document.getElementById('cc-live'); var n = document.getElementById('cc-live-num'); if (el && rt.active > 0) { el.style.display = ''; n.textContent = rt.active; } else if (el) { el.style.display = 'none'; } }).catch(function(){}); }, 30000);
  setInterval(function() { fetch(API + '?range=30d').then(function(r) { return r.json(); }).then(function(d) { siteData = d; renderDashboard(d, { active: 0 }); }).catch(function(){}); }, 300000);
})();