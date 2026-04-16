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
        // Show error in YouTube view
        ['cc-yt-velocity','cc-yt-titles','cc-yt-projections','cc-yt-scorecard'].forEach(function(id) {
          var el = document.getElementById(id);
          if (el && !el.innerHTML.trim()) el.innerHTML = '<p style="color:var(--cc-amber);font-size:0.82rem">YouTube API: ' + esc(data.error.replace(/<[^>]*>/g, '').slice(0, 80)) + '</p>';
        });
        return;
      }
      ytData = data; renderYouTube(data); updateDashboardWithYT();
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
      parts.push('<strong>' + numFmt(ga4.today.views) + '</strong> views today');
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
    renderActions(ga4, gsc);

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
  }

  // ── INIT ──
  init();
  setInterval(function() { fetch(API + '?realtime=1').then(function(r) { return r.json(); }).then(function(rt) { var el = document.getElementById('cc-live'); var n = document.getElementById('cc-live-num'); if (el && rt.active > 0) { el.style.display = ''; n.textContent = rt.active; } else if (el) { el.style.display = 'none'; } }).catch(function(){}); }, 30000);
  setInterval(function() { fetch(API + '?range=30d').then(function(r) { return r.json(); }).then(function(d) { siteData = d; renderDashboard(d, { active: 0 }); }).catch(function(){}); }, 300000);
})();