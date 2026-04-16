/**
 * Site Analytics Intelligence Dashboard
 * Fetches /api/stats, renders charts, insights, growth, sparklines, matrix
 */
(function() {
  'use strict';
  var API = '/api/stats';

  // ── TOOLS ──
  var TOOLS = {
    'ai-news':              { name: 'AI News',               color: '#ff66ff' },
    'm365-roadmap':         { name: 'M365 Roadmap',          color: '#E5A00D' },
    'prompt-library':       { name: 'Prompt Library',        color: '#A78BFA' },
    'licensing':            { name: 'Licensing Simplifier',  color: '#F43F5E' },
    'prompt-polisher':      { name: 'Prompt Polisher',       color: '#EC4899' },
    'copilot-readiness':    { name: 'Copilot Readiness',     color: '#3B82F6' },
    'copilot-matrix':       { name: 'Copilot Feature Matrix',color: '#60A5FA' },
    'deprecation-timeline': { name: 'Deprecation Timeline',  color: '#DC2626' },
    'service-health':       { name: 'Service Health',        color: '#EA580C' },
    'cert-tracker':         { name: 'Cert Study Guides',     color: '#10B981' },
    'roi-calculator':       { name: 'ROI Calculator',        color: '#14B8A6' },
    'ai-mapper':            { name: 'AI Service Mapper',     color: '#38BDF8' },
    'ai-showdown':          { name: 'AI SaaS Showdown',      color: '#D4A853' },
    'ps-builder':           { name: 'PowerShell Builder',    color: '#4ADE80' },
    'migration-planner':    { name: 'Migration Planner',     color: '#6478CC' },
    'prompt-guide':         { name: 'Prompt Guide',          color: '#84CC16' },
    'ca-builder':           { name: 'CA Policy Builder',     color: '#7C3AED' },
    'meeting-planner':      { name: 'Meeting Planner',       color: '#0EA5E9' },
    'feedback':             { name: 'Community Feedback',    color: '#FBBF24' },
    'site-analytics':       { name: 'Site Analytics',        color: '#64748B' },
    'qr-generator':         { name: 'QR Code Generator',    color: '#EC4899' },
    'wifi-qr':              { name: 'WiFi QR Cards',         color: '#22D3EE' },
    'password-generator':   { name: 'Password Generator',   color: '#D946EF' },
    'image-compressor':     { name: 'Image Compressor',     color: '#818CF8' },
    'typing-test':          { name: 'Typing Speed Test',    color: '#34D399' },
    'countdown':            { name: 'Countdown Timer',      color: '#FB923C' },
    'color-palette':        { name: 'Colour Palette',       color: '#F472B6' },
    'pomodoro':             { name: 'Pomodoro Timer',        color: '#EF4444' }
  };

  var MILESTONES = [
    { date: '2026-03-30', label: 'GA4 Started',            color: '#64748B', type: 'tech' },
    { date: '2026-04-09', label: 'Soft Launch',             color: '#10B981', type: 'launch' },
    { date: '2026-04-10', label: 'AI News v3 + Roadmap',   color: '#ff66ff', type: 'launch' },
    { date: '2026-04-10', label: 'AI News Launch Post',     color: '#0EA5E9', type: 'blog' },
    { date: '2026-04-13', label: '8 New Tools',             color: '#EC4899', type: 'launch' },
    { date: '2026-04-13', label: 'Train-the-Trainer Blog',  color: '#0EA5E9', type: 'blog' },
    { date: '2026-04-14', label: 'Glassmorphism Redesign',  color: '#38BDF8', type: 'tech' },
    { date: '2026-04-15', label: 'Copilot Chat Blog',       color: '#0EA5E9', type: 'blog' },
    { date: '2026-04-16', label: 'V2 Audit Complete',       color: '#14B8A6', type: 'tech' }
  ];

  var GOALS_DEFAULT = [
    { metric: 'weekly_users', target: 500, label: '500 users/week', deadline: '2026-05-15' },
    { metric: 'weekly_users', target: 1000, label: '1K users/week', deadline: '2026-07-01' },
    { metric: 'total_users', target: 10000, label: '10K total users', deadline: '2026-09-01' }
  ];

  // ── STATE ──
  var currentRange = '30d';
  var currentData = null;
  var allTimeData = null;
  var _trendChart = null;
  var _activityChart = null;
  var _growthChart = null;
  var _matrixChart = null;
  var _positionChart = null;
  var _toolDetailChart = null;

  // ── UTILITIES ──
  function esc(s) { var el = document.createElement('span'); el.textContent = s || ''; return el.innerHTML; }

  function roundDisplay(n) {
    if (!n || n < 100) return String(n || 0);
    if (n < 1000) return String(Math.round(n / 10) * 10);
    if (n < 10000) return (n / 1000).toFixed(1) + 'K';
    return Math.round(n / 1000) + 'K+';
  }

  function numFmt(n) {
    if (typeof n !== 'number' || isNaN(n)) return '0';
    return n.toLocaleString('en-US');
  }

  function getToolInfo(key) { return TOOLS[key] || { name: key, color: '#64748B' }; }

  // ── TABS ──
  document.querySelectorAll('.siteana-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.siteana-tab').forEach(function(t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      document.querySelectorAll('.siteana-panel').forEach(function(p) { p.classList.remove('active'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      var panel = document.getElementById('panel-' + tab.dataset.tab);
      if (panel) panel.classList.add('active');
      if (tab.dataset.tab === 'growth') fetchGrowthData();
      if (tab.dataset.tab === 'command') renderCommandCentre();
    });
  });

  // ── DATE RANGE ──
  document.querySelectorAll('.siteana-range-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.siteana-range-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentRange = btn.dataset.range;
      var lbl = document.getElementById('sa-views-label');
      if (lbl) {
        var m = { '7d': '7d', '30d': '30d', '90d': '90d', 'all': 'All Time' };
        lbl.textContent = 'Page Views (' + (m[currentRange] || currentRange) + ')';
      }
      allTimeData = null;
      fetchData(currentRange);
    });
  });

  // ── FETCH ──
  function fetchData(range) {
    fetch(API + '?range=' + encodeURIComponent(range))
      .then(function(r) { return r.json(); })
      .then(render)
      .catch(function() { showEmptyState(); });
  }

  function showEmptyState() {
    ['sa-leaderboard','sa-most-viewed','sa-most-used','sa-searches','sa-top-pages','sa-blog-pages'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el && !el.innerHTML.trim()) el.innerHTML = '<div class="siteana-empty">No data yet</div>';
    });
  }

  // ── RENDER MAIN ──
  function render(data) {
    currentData = data;
    if (currentRange === 'all') allTimeData = data;
    var ga4 = data.ga4;
    var gsc = data.gsc;

    renderStats(ga4);

    if (ga4) {
      try { renderTrendChart(ga4.trend); } catch(e) { console.error('Trend chart:', e); }
      try { renderActivityChart(ga4.leaderboard); } catch(e) { console.error('Activity chart:', e); }
      renderExtraSection('sa-countries', ga4.countries, 'country', 'users');
      renderExtraSection('sa-devices', ga4.devices, 'device', 'users');
      renderExtraSection('sa-sources', ga4.sources, 'source', 'sessions');
      renderLeaderboard(ga4.leaderboard, ga4.tool_trends);
      renderTopList('sa-most-viewed', ga4.leaderboard, 'views');
      renderTopList('sa-most-used', ga4.leaderboard, 'users');
      try { renderToolMatrix(ga4.leaderboard); } catch(e) { console.error('Matrix:', e); }
      if (ga4.top_pages) renderTopPages(ga4.top_pages);
      if (ga4.blog_pages) renderBlogPages(ga4.blog_pages);
    } else {
      // Clear stale data from previous range
      if (_trendChart) { _trendChart.destroy(); _trendChart = null; }
      if (_activityChart) { _activityChart.destroy(); _activityChart = null; }
      if (_matrixChart) { _matrixChart.destroy(); _matrixChart = null; }
      ['sa-countries','sa-devices','sa-sources','sa-leaderboard','sa-most-viewed','sa-most-used','sa-top-pages','sa-blog-pages'].forEach(function(id) {
        var el = document.getElementById(id); if (el) el.innerHTML = '';
      });
      showEmptyState();
    }

    renderMorningBrief(data);
    renderSinceLastVisit(data);
    renderHealthScoreInline(data);
    renderInsights(generateInsights(data));
    renderMovers(data);
    renderActionQueue(data);
    renderRefreshTime(data);

    // Command Centre auto-renders if active
    var cmdPanel = document.getElementById('panel-command');
    if (cmdPanel && cmdPanel.classList.contains('active')) renderCommandCentre();

    if (gsc && gsc.queries && gsc.queries.length) {
      renderGSCQueries(gsc.queries);
      renderPositionDistribution(gsc.queries);
      renderSEOOpportunities(gsc.queries);
      renderContentGaps(data);
    } else {
      var sc = document.getElementById('sa-searches');
      if (sc) sc.innerHTML = '<div class="siteana-empty">Search data will appear once Google indexes the site more deeply.</div>';
      if (_positionChart) { _positionChart.destroy(); _positionChart = null; }
      var oppEl = document.getElementById('sa-seo-opps');
      if (oppEl) oppEl.innerHTML = '';
    }

    var growthPanel = document.getElementById('panel-growth');
    if (growthPanel && growthPanel.classList.contains('active')) fetchGrowthData();
  }

  // ── STATS BAR ──
  function renderStats(ga4) {
    var el;
    if (ga4) {
      el = document.getElementById('sa-total-views');  if (el) el.textContent = roundDisplay(ga4.totals.views);
      el = document.getElementById('sa-total-users');  if (el) el.textContent = roundDisplay(ga4.totals.users);
      el = document.getElementById('sa-total-sessions'); if (el) el.textContent = roundDisplay(ga4.totals.sessions);
      el = document.getElementById('sa-today-views');  if (el) el.textContent = roundDisplay(ga4.today.views);
      if (ga4.wow && ga4.wow.change) {
        renderWoWBadge('sa-wow-views', ga4.wow.change.views);
        renderWoWBadge('sa-wow-users', ga4.wow.change.users);
        renderWoWBadge('sa-wow-sessions', ga4.wow.change.sessions);
      }
    } else {
      ['sa-total-views','sa-total-users','sa-total-sessions','sa-today-views'].forEach(function(id) {
        el = document.getElementById(id); if (el) el.textContent = '\u2014';
      });
    }
  }

  function renderWoWBadge(id, pct) {
    var el = document.getElementById(id);
    if (!el) return;
    var arrow = pct > 0 ? '\u2191' : pct < 0 ? '\u2193' : '\u2192';
    var cls = pct > 0 ? 'siteana-wow-up' : pct < 0 ? 'siteana-wow-down' : 'siteana-wow-flat';
    el.className = 'siteana-wow ' + cls;
    el.textContent = arrow + ' ' + Math.abs(pct) + '%';
    el.style.display = 'inline-block';
  }

  // ── TREND CHART (Overview) ──
  function buildMilestoneAnnotations(labels) {
    var anns = {};
    MILESTONES.forEach(function(ms, i) {
      var lbl = ms.date.slice(5);
      if (labels.indexOf(lbl) > -1) {
        var isBlog = ms.type === 'blog';
        anns['ms' + i] = {
          type: 'line', xMin: lbl, xMax: lbl,
          borderColor: ms.color, borderWidth: isBlog ? 1 : 1, borderDash: isBlog ? [2, 3] : [4, 4],
          label: {
            display: true, content: (isBlog ? '\u270E ' : '') + ms.label, position: 'start',
            backgroundColor: ms.color, color: '#fff',
            font: { size: 9, family: 'Inter', style: isBlog ? 'italic' : 'normal' },
            padding: { top: 2, bottom: 2, left: 4, right: 4 }, borderRadius: 3
          }
        };
      }
    });
    return anns;
  }

  function renderTrendChart(trend) {
    var ctx = document.getElementById('sa-trend-chart');
    if (!ctx || !trend || !trend.length) return;
    if (_trendChart) { _trendChart.destroy(); _trendChart = null; }
    var labels = trend.map(function(d) { return d.date.slice(5); });
    _trendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          { label: 'Views', data: trend.map(function(d) { return d.views; }), borderColor: '#64748B', backgroundColor: 'rgba(100,116,139,0.1)', fill: true, tension: 0.4, pointRadius: 3 },
          { label: 'Users', data: trend.map(function(d) { return d.users; }), borderColor: '#ff66ff', backgroundColor: 'rgba(255,102,255,0.1)', fill: true, tension: 0.4, pointRadius: 3 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: 'rgba(255,255,255,0.6)', font: { family: 'Inter' } } },
          annotation: { annotations: buildMilestoneAnnotations(labels) }
        },
        scales: {
          x: { ticks: { color: 'rgba(255,255,255,0.4)', maxTicksLimit: 10 }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { beginAtZero: true, ticks: { color: 'rgba(255,255,255,0.4)' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  }

  function renderActivityChart(leaderboard) {
    var ctx = document.getElementById('sa-activity-chart');
    if (!ctx || !leaderboard || !leaderboard.length) return;
    var top8 = leaderboard.slice(0, 8);
    if (_activityChart) { _activityChart.destroy(); _activityChart = null; }
    _activityChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: top8.map(function(t) { return getToolInfo(t.tool).name; }),
        datasets: [{ data: top8.map(function(t) { return t.total; }), backgroundColor: top8.map(function(t) { return getToolInfo(t.tool).color; }), borderWidth: 0 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'right', labels: { color: 'rgba(255,255,255,0.6)', font: { family: 'Inter', size: 11 }, padding: 8 } } }
      }
    });
  }

  // ── INSIGHTS ──
  function generateInsights(data) {
    var ins = [];
    var ga4 = data.ga4;
    if (!ga4) return ins;
    if (ga4.wow && ga4.wow.change) {
      var vc = ga4.wow.change.views;
      if (Math.abs(vc) > 10) ins.push({ icon: vc > 0 ? '\uD83D\uDCC8' : '\uD83D\uDCC9', text: 'Traffic ' + (vc > 0 ? 'up' : 'down') + ' ' + Math.abs(vc) + '% week-over-week' });
    }
    if (ga4.leaderboard && ga4.leaderboard.length) {
      var top = ga4.leaderboard[0];
      ins.push({ icon: '\uD83C\uDFC6', text: getToolInfo(top.tool).name + ' leads with ' + roundDisplay(top.views) + ' views' });
    }
    if (ga4.countries && ga4.countries.length) {
      var c = ga4.countries[0];
      var pct = ga4.totals.users > 0 ? Math.round((c.users / ga4.totals.users) * 100) : 0;
      ins.push({ icon: '\uD83C\uDF0D', text: c.country + ' is #1 audience (' + pct + '% of users)' });
    }
    if (ga4.leaderboard) {
      var low = ga4.leaderboard.filter(function(t) { return t.views < 10; });
      if (low.length > 0) ins.push({ icon: '\uD83D\uDCA1', text: low.length + ' tool' + (low.length > 1 ? 's have' : ' has') + ' fewer than 10 views \u2014 consider promoting' });
    }
    if (ga4.blog_pages && ga4.totals) {
      var bv = ga4.blog_pages.reduce(function(s, p) { return s + p.views; }, 0);
      var bp = ga4.totals.views > 0 ? Math.round((bv / ga4.totals.views) * 100) : 0;
      if (bp > 40) ins.push({ icon: '\uD83D\uDCDD', text: 'Blog drives ' + bp + '% of traffic \u2014 content strategy working' });
    }
    if (ga4.today && ga4.trend && ga4.trend.length > 1) {
      var avg = ga4.trend.reduce(function(s, d) { return s + d.views; }, 0) / ga4.trend.length;
      if (avg > 0 && ga4.today.views > avg * 1.5) ins.push({ icon: '\uD83D\uDD25', text: 'Hot day! Today is ' + Math.round(ga4.today.views / avg * 100) + '% of average' });
    }
    if (data.gsc && data.gsc.queries) {
      var opps = data.gsc.queries.filter(function(q) { return q.position < 8 && q.ctr < 10 && q.impressions > 10; });
      if (opps.length) ins.push({ icon: '\uD83D\uDD0D', text: opps.length + ' search quer' + (opps.length > 1 ? 'ies rank' : 'y ranks') + ' well but get few clicks \u2014 improve titles' });
    }
    return ins;
  }

  function renderInsights(insights) {
    var card = document.getElementById('sa-insights-card');
    var container = document.getElementById('sa-insights');
    if (!card || !container) return;
    if (!insights.length) { card.style.display = 'none'; return; }
    card.style.display = '';
    container.innerHTML = insights.map(function(ins) {
      return '<div class="siteana-insight-pill"><span class="siteana-insight-icon">' + ins.icon + '</span><span>' + esc(ins.text) + '</span></div>';
    }).join('');
  }

  // ── TOOLS: LEADERBOARD + SPARKLINES ──
  function renderLeaderboard(leaderboard, toolTrends) {
    var container = document.getElementById('sa-leaderboard');
    if (!container || !leaderboard) return;
    if (!leaderboard.length) { container.innerHTML = '<div class="siteana-empty">No data yet</div>'; return; }
    var maxTotal = leaderboard[0].total || 1;
    container.innerHTML = leaderboard.map(function(item, i) {
      var info = getToolInfo(item.tool);
      var pct = Math.round((item.total / maxTotal) * 100);
      var rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
      var sparkHtml = (toolTrends && toolTrends[item.tool]) ? '<canvas class="siteana-sparkline" id="spark-' + item.tool + '" width="60" height="20"></canvas>' : '';
      return '<div class="siteana-lb-item">'
        + '<span class="siteana-lb-rank ' + rankClass + '">' + (i + 1) + '</span>'
        + '<div class="siteana-lb-info"><div class="siteana-lb-name-row"><span class="siteana-lb-name" style="color:' + info.color + '">' + esc(info.name) + '</span>' + sparkHtml + '</div>'
        + '<span class="siteana-lb-count">' + esc(roundDisplay(item.views)) + ' views \u00B7 ' + esc(roundDisplay(item.users)) + ' users</span></div>'
        + '<div class="siteana-lb-bar-wrap"><div class="siteana-lb-bar" style="width:' + pct + '%;background:' + info.color + '"></div></div>'
        + '<span class="siteana-lb-total">' + esc(roundDisplay(item.total)) + '</span>'
        + '</div>';
    }).join('');
    if (toolTrends) {
      leaderboard.forEach(function(item) {
        if (toolTrends[item.tool]) {
          var c = document.getElementById('spark-' + item.tool);
          if (c) drawSparkline(c, toolTrends[item.tool], getToolInfo(item.tool).color);
        }
      });
    }
  }

  function drawSparkline(canvas, data, color) {
    if (!canvas || !data || data.length < 2) return;
    var w = 60, h = 20;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    var max = Math.max.apply(null, data);
    var min = Math.min.apply(null, data);
    var range = max - min || 1;
    ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.lineJoin = 'round';
    for (var i = 0; i < data.length; i++) {
      var x = (i / (data.length - 1)) * w;
      var y = h - ((data[i] - min) / range) * (h - 4) - 2;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
    ctx.globalAlpha = 0.15; ctx.fillStyle = color; ctx.fill(); ctx.globalAlpha = 1;
  }

  function renderTopList(containerId, leaderboard, field) {
    var container = document.getElementById(containerId);
    if (!container || !leaderboard) return;
    var sorted = leaderboard.filter(function(t) { return t[field] > 0; })
      .sort(function(a, b) { return b[field] - a[field]; }).slice(0, 5);
    if (!sorted.length) { container.innerHTML = '<div class="siteana-empty">No data yet</div>'; return; }
    container.innerHTML = sorted.map(function(item, i) {
      var info = getToolInfo(item.tool);
      return '<div class="siteana-lb-item">'
        + '<span class="siteana-lb-rank">' + (i + 1) + '</span>'
        + '<span class="siteana-lb-name" style="color:' + info.color + '">' + esc(info.name) + '</span>'
        + '<span class="siteana-lb-total">' + esc(roundDisplay(item[field])) + '</span></div>';
    }).join('');
  }

  // ── TOOL MATRIX (2x2 scatter) ──
  function renderToolMatrix(leaderboard) {
    var ctx = document.getElementById('sa-matrix-chart');
    if (!ctx || !leaderboard) return;
    var tools = leaderboard.filter(function(t) { return t.views > 0 && t.users > 0; });
    if (tools.length < 3) return;
    var viewsArr = tools.map(function(t) { return t.views; }).sort(function(a, b) { return a - b; });
    var engArr = tools.map(function(t) { return t.users / t.views; }).sort(function(a, b) { return a - b; });
    var medViews = viewsArr[Math.floor(viewsArr.length / 2)];
    var medEng = engArr[Math.floor(engArr.length / 2)];
    if (_matrixChart) { _matrixChart.destroy(); _matrixChart = null; }
    _matrixChart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: tools.map(function(t) {
          var info = getToolInfo(t.tool);
          return {
            label: info.name,
            data: [{ x: t.views, y: Math.min(t.users / t.views, 1) }],
            backgroundColor: info.color,
            pointRadius: Math.max(5, Math.min(14, Math.sqrt(t.views) / 2)),
            pointHoverRadius: 16
          };
        })
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: function(c) { return c.dataset.label + ': ' + c.parsed.x + ' views, ' + Math.round(c.parsed.y * 100) + '% engagement'; } } },
          annotation: {
            annotations: {
              vLine: { type: 'line', xMin: medViews, xMax: medViews, borderColor: 'rgba(255,255,255,0.12)', borderDash: [3, 3], borderWidth: 1 },
              hLine: { type: 'line', yMin: medEng, yMax: medEng, borderColor: 'rgba(255,255,255,0.12)', borderDash: [3, 3], borderWidth: 1 }
            }
          }
        },
        scales: {
          x: { title: { display: true, text: 'Total Views', color: 'rgba(255,255,255,0.5)', font: { family: 'Inter', size: 11 } }, ticks: { color: 'rgba(255,255,255,0.4)' }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { title: { display: true, text: 'Engagement', color: 'rgba(255,255,255,0.5)', font: { family: 'Inter', size: 11 } }, ticks: { color: 'rgba(255,255,255,0.4)', callback: function(v) { return Math.round(v * 100) + '%'; } }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  }

  // ── GROWTH TAB ──
  function fetchGrowthData() {
    if (allTimeData) { renderGrowthContent(allTimeData); return; }
    fetch(API + '?range=all').then(function(r) { return r.json(); }).then(function(data) {
      allTimeData = data;
      renderGrowthContent(data);
    }).catch(function() {});
  }

  function renderGrowthContent(data) {
    if (!data || !data.ga4) return;
    var ga4 = data.ga4;
    renderSmartAlerts(data);
    renderGrowthChart(ga4.trend);
    renderCumulative(ga4.totals);
    renderHeatmap(ga4.trend);
    renderWeeklyTable(ga4.weekly, ga4.trend, ga4.tool_trends);
    renderMilestoneTimeline();
    renderBeforeAfter(ga4.trend);
    renderGoals(data);
  }

  function renderGrowthChart(trend) {
    var ctx = document.getElementById('sa-growth-chart');
    if (!ctx || !trend || !trend.length) return;
    if (_growthChart) { _growthChart.destroy(); _growthChart = null; }
    var labels = trend.map(function(d) { return d.date.slice(5); });
    _growthChart = new Chart(ctx, {
      data: {
        labels: labels,
        datasets: [
          { type: 'line', label: 'Views', data: trend.map(function(d) { return d.views; }), borderColor: '#64748B', backgroundColor: 'rgba(100,116,139,0.1)', fill: true, tension: 0.4, pointRadius: 2, yAxisID: 'y' },
          { type: 'bar', label: 'Users', data: trend.map(function(d) { return d.users; }), backgroundColor: 'rgba(255,102,255,0.3)', borderRadius: 3, yAxisID: 'y1' }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: 'rgba(255,255,255,0.6)', font: { family: 'Inter' } } },
          annotation: { annotations: buildMilestoneAnnotations(labels) }
        },
        scales: {
          x: { ticks: { color: 'rgba(255,255,255,0.4)', maxTicksLimit: 12 }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { beginAtZero: true, position: 'left', ticks: { color: 'rgba(255,255,255,0.4)' }, grid: { color: 'rgba(255,255,255,0.05)' }, title: { display: true, text: 'Views', color: 'rgba(255,255,255,0.4)', font: { family: 'Inter', size: 11 } } },
          y1: { beginAtZero: true, position: 'right', ticks: { color: 'rgba(255,255,255,0.4)' }, grid: { display: false }, title: { display: true, text: 'Users', color: 'rgba(255,255,255,0.4)', font: { family: 'Inter', size: 11 } } }
        }
      }
    });
  }

  function renderCumulative(totals) {
    var el = document.getElementById('sa-cumul-count');
    if (!el || !totals) return;
    var target = totals.users || 0;
    var start = 0;
    var dur = 1200;
    var t0 = null;
    function animate(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var ease = 1 - Math.pow(1 - p, 3);
      el.textContent = numFmt(Math.round(start + (target - start) * ease));
      if (p < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }

  function renderWeeklyTable(weekly, trend, toolTrends) {
    var container = document.getElementById('sa-weekly-table');
    if (!container || !weekly || !weekly.length) return;
    var maxGrowthIdx = -1;
    var maxGrowth = -Infinity;

    // Build date→index map from trend for top tool lookup
    var dateIdx = {};
    if (trend) trend.forEach(function(d, i) { dateIdx[d.date] = i; });

    var rows = weekly.map(function(w, i) {
      var change = null;
      if (i > 0 && weekly[i - 1].views > 0) {
        change = Math.round(((w.views - weekly[i - 1].views) / weekly[i - 1].views) * 100);
        if (change > maxGrowth) { maxGrowth = change; maxGrowthIdx = i; }
      }
      // Find top tool for this week
      var topTool = '';
      if (toolTrends && trend) {
        var bestTool = ''; var bestViews = 0;
        Object.keys(toolTrends).forEach(function(tid) {
          var arr = toolTrends[tid];
          var sum = 0;
          // Sum views for days in this week's range
          trend.forEach(function(d, idx) {
            if (d.date >= w.start && d.date <= w.end && arr[idx] !== undefined) sum += arr[idx];
          });
          if (sum > bestViews) { bestViews = sum; bestTool = tid; }
        });
        if (bestTool) topTool = getToolInfo(bestTool).name;
      }
      return { w: w, change: change, idx: i, topTool: topTool };
    });
    var html = '<table class="siteana-table"><thead><tr><th>Week</th><th>Dates</th><th>Views</th><th>Users</th><th>Top Tool</th><th>Change</th></tr></thead><tbody>';
    rows.forEach(function(r) {
      var w = r.w;
      var partial = w.days < 7;
      var hl = r.idx === maxGrowthIdx ? ' class="siteana-row-highlight"' : '';
      var cs = r.change === null ? '\u2014' : (r.change >= 0 ? '+' : '') + r.change + '%' + (partial ? ' *' : '');
      var cc = r.change > 0 ? 'siteana-change-up' : r.change < 0 ? 'siteana-change-down' : '';
      html += '<tr' + hl + '><td>W' + (r.idx + 1) + '</td><td>' + w.start.slice(5) + ' \u2013 ' + w.end.slice(5) + '</td><td>' + numFmt(w.views) + '</td><td>' + numFmt(w.users) + '</td><td class="siteana-top-tool">' + esc(r.topTool || '\u2014') + '</td><td class="' + cc + '">' + cs + '</td></tr>';
    });
    html += '</tbody></table>';
    if (weekly.some(function(w) { return w.days < 7; })) html += '<p class="siteana-hint">* Partial week</p>';
    container.innerHTML = html;
  }

  function renderMilestoneTimeline() {
    var container = document.getElementById('sa-milestones');
    if (!container) return;
    container.innerHTML = '<div class="siteana-ms-track">' + MILESTONES.map(function(ms) {
      return '<div class="siteana-ms-item">'
        + '<div class="siteana-ms-dot" style="background:' + ms.color + ';box-shadow:0 0 8px ' + ms.color + '60" title="' + esc(ms.label) + '"></div>'
        + '<div class="siteana-ms-date">' + ms.date.slice(5) + '</div>'
        + '<div class="siteana-ms-label">' + esc(ms.label) + '</div>'
        + '</div>';
    }).join('') + '</div>';
  }

  function renderBeforeAfter(trend) {
    var select = document.getElementById('sa-ba-milestone');
    var container = document.getElementById('sa-before-after');
    if (!select || !container || !trend || !trend.length) return;
    select.innerHTML = '<option value="">Choose a milestone...</option>' + MILESTONES.map(function(ms, i) {
      return '<option value="' + i + '">' + ms.date.slice(5) + ' \u2014 ' + esc(ms.label) + '</option>';
    }).join('');
    select.onchange = function() {
      var idx = parseInt(select.value);
      if (isNaN(idx)) { container.innerHTML = ''; return; }
      var ms = MILESTONES[idx];
      var msDate = new Date(ms.date + 'T12:00:00Z');
      var before = { views: 0, users: 0, sessions: 0 };
      var after = { views: 0, users: 0, sessions: 0 };
      trend.forEach(function(d) {
        var dd = new Date(d.date + 'T12:00:00Z');
        var diff = Math.round((dd - msDate) / 86400000);
        if (diff >= -7 && diff < 0) { before.views += d.views; before.users += d.users; before.sessions += d.sessions || 0; }
        else if (diff >= 0 && diff < 7) { after.views += d.views; after.users += d.users; after.sessions += d.sessions || 0; }
      });
      function pctC(a, b) { return b > 0 ? Math.round(((a - b) / b) * 100) : (a > 0 ? 100 : 0); }
      var metrics = [
        { label: 'Views', b: before.views, a: after.views },
        { label: 'Users', b: before.users, a: after.users },
        { label: 'Sessions', b: before.sessions, a: after.sessions }
      ];
      container.innerHTML = '<div class="siteana-ba-grid">'
        + '<div class="siteana-ba-header"><span></span><span>7 Days Before</span><span>7 Days After</span><span>Change</span></div>'
        + metrics.map(function(m) {
          var chg = pctC(m.a, m.b);
          var cls = chg > 0 ? 'siteana-change-up' : chg < 0 ? 'siteana-change-down' : '';
          return '<div class="siteana-ba-row"><span class="siteana-ba-label">' + m.label + '</span><span>' + numFmt(m.b) + '</span><span>' + numFmt(m.a) + '</span><span class="' + cls + '">' + (chg >= 0 ? '+' : '') + chg + '%</span></div>';
        }).join('') + '</div>';
    };
  }

  function renderGoals(data) {
    var container = document.getElementById('sa-goals');
    if (!container) return;
    var goals;
    try { goals = JSON.parse(localStorage.getItem('siteana_goals')); } catch(e) {}
    if (!goals || !goals.length) goals = GOALS_DEFAULT;
    var ga4 = data.ga4;
    var latestWeek = 0, totalUsers = 0;
    if (ga4) {
      totalUsers = ga4.totals.users || 0;
      if (ga4.weekly && ga4.weekly.length) {
        // Use last COMPLETE week (7 days) for goal tracking, not partial current week
        for (var wi = ga4.weekly.length - 1; wi >= 0; wi--) {
          if (ga4.weekly[wi].days >= 7) { latestWeek = ga4.weekly[wi].users; break; }
        }
        if (!latestWeek && ga4.weekly.length) latestWeek = ga4.weekly[ga4.weekly.length - 1].users;
      }
    }
    container.innerHTML = goals.map(function(g) {
      var current = g.metric === 'weekly_users' ? latestWeek : g.metric === 'total_users' ? totalUsers : 0;
      var pct = Math.min(100, Math.round((current / g.target) * 100));
      var daysLeft = Math.max(0, Math.ceil((new Date(g.deadline) - new Date()) / 86400000));
      var barColor = pct >= 100 ? '#10B981' : '#64748B';
      return '<div class="siteana-goal">'
        + '<div class="siteana-goal-header"><span class="siteana-goal-label">' + esc(g.label) + '</span><span class="siteana-goal-pct">' + pct + '%</span></div>'
        + '<div class="siteana-goal-track"><div class="siteana-goal-fill" style="width:' + pct + '%;background:' + barColor + '"></div></div>'
        + '<div class="siteana-goal-meta"><span>' + numFmt(current) + ' / ' + numFmt(g.target) + '</span><span>' + daysLeft + ' days left</span></div>'
        + '</div>';
    }).join('');
  }

  // ── PAGES ──
  function renderTopPages(pages) {
    var container = document.getElementById('sa-top-pages');
    if (!container || !pages || !pages.length) return;
    var max = pages[0].views || 1;
    container.innerHTML = pages.slice(0, 20).map(function(p, i) {
      var pct = Math.round((p.views / max) * 100);
      var name = p.path === '/' ? 'Homepage' : p.path.replace(/\//g, ' ').trim();
      return '<div class="siteana-lb-item">'
        + '<span class="siteana-lb-rank">' + (i + 1) + '</span>'
        + '<span class="siteana-lb-name"><a href="' + esc(p.path) + '" style="color:rgba(255,255,255,0.75);text-decoration:none">' + esc(name) + '</a></span>'
        + '<div class="siteana-lb-bar-wrap"><div class="siteana-lb-bar" style="width:' + pct + '%;background:#64748B"></div></div>'
        + '<span class="siteana-lb-total">' + roundDisplay(p.views) + '</span></div>';
    }).join('');
  }

  function renderBlogPages(pages) {
    var container = document.getElementById('sa-blog-pages');
    if (!container || !pages || !pages.length) { if (container) container.innerHTML = '<div class="siteana-empty">No blog traffic yet.</div>'; return; }
    var max = pages[0].views || 1;
    container.innerHTML = pages.map(function(p, i) {
      var pct = Math.round((p.views / max) * 100);
      var slug = p.path.replace('/blog/', '').replace(/\//g, '');
      var name = slug.replace(/-/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); });
      if (name.length > 60) name = name.slice(0, 57) + '...';
      return '<div class="siteana-lb-item">'
        + '<span class="siteana-lb-rank">' + (i + 1) + '</span>'
        + '<span class="siteana-lb-name"><a href="' + esc(p.path) + '" style="color:rgba(255,255,255,0.75);text-decoration:none">' + esc(name) + '</a></span>'
        + '<div class="siteana-lb-bar-wrap"><div class="siteana-lb-bar" style="width:' + pct + '%;background:#0EA5E9"></div></div>'
        + '<span class="siteana-lb-total">' + roundDisplay(p.views) + '</span></div>';
    }).join('');
  }

  // ── SEO TAB ──
  function renderGSCQueries(queries) {
    var container = document.getElementById('sa-searches');
    if (!container) return;
    if (!queries || !queries.length) { container.innerHTML = '<div class="siteana-empty">Search data will appear once Google indexes the site more deeply.</div>'; return; }
    container.innerHTML = '<table class="siteana-table siteana-seo-table"><thead><tr><th>Query</th><th>Clicks</th><th>Imp</th><th>CTR</th><th>Pos</th></tr></thead><tbody>'
      + queries.map(function(q) {
        var pc = q.position <= 3 ? 'siteana-pos-top3' : q.position <= 10 ? 'siteana-pos-top10' : q.position <= 20 ? 'siteana-pos-top20' : 'siteana-pos-deep';
        var cw = Math.min(100, q.ctr * 3);
        return '<tr><td class="siteana-seo-query">' + esc(q.query) + '</td><td>' + q.clicks + '</td><td>' + q.impressions + '</td>'
          + '<td><div class="siteana-ctr-bar-wrap"><div class="siteana-ctr-bar" style="width:' + cw + '%"></div><span>' + q.ctr + '%</span></div></td>'
          + '<td><span class="siteana-pos-badge ' + pc + '">' + q.position + '</span></td></tr>';
      }).join('') + '</tbody></table>';
  }

  function renderPositionDistribution(queries) {
    var ctx = document.getElementById('sa-position-chart');
    if (!ctx || !queries || !queries.length) return;
    var b = { top3: 0, top10: 0, page2: 0, deep: 0 };
    queries.forEach(function(q) {
      if (q.position <= 3) b.top3++; else if (q.position <= 10) b.top10++; else if (q.position <= 20) b.page2++; else b.deep++;
    });
    if (_positionChart) { _positionChart.destroy(); _positionChart = null; }
    _positionChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Top 3', 'Top 10', 'Page 2', 'Deep (20+)'],
        datasets: [{ data: [b.top3, b.top10, b.page2, b.deep], backgroundColor: ['#10B981', '#FBBF24', '#FB923C', '#EF4444'], borderWidth: 0, borderRadius: 6 }]
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, ticks: { color: 'rgba(255,255,255,0.4)', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: 'rgba(255,255,255,0.6)' }, grid: { display: false } }
        }
      }
    });
  }

  function renderSEOOpportunities(queries) {
    var container = document.getElementById('sa-seo-opps');
    if (!container) return;
    var opps = queries.filter(function(q) { return q.position < 10 && q.ctr < 10 && q.impressions > 10; });
    if (!opps.length) { container.innerHTML = '<p class="siteana-hint">No obvious gaps found \u2014 titles look good!</p>'; return; }
    container.innerHTML = opps.map(function(q) {
      var est = Math.round(q.impressions * 0.2);
      var uplift = est - q.clicks;
      return '<div class="siteana-opp-item">'
        + '<div class="siteana-opp-query">' + esc(q.query) + '</div>'
        + '<div class="siteana-opp-stats">Pos ' + q.position + ' \u00B7 CTR ' + q.ctr + '% \u00B7 ' + q.impressions + ' imp</div>'
        + '<div class="siteana-opp-uplift">Potential: +' + uplift + ' clicks/mo if CTR reaches 20%</div>'
        + '</div>';
    }).join('');
  }

  // ── EXTRA SECTIONS ──
  function renderExtraSection(containerId, items, labelKey, valueKey) {
    var container = document.getElementById(containerId);
    if (!container || !items || !items.length) return;
    var max = items[0][valueKey] || 1;
    container.innerHTML = items.map(function(item) {
      var pct = Math.round((item[valueKey] / max) * 100);
      return '<div class="siteana-lb-item">'
        + '<span class="siteana-lb-name">' + esc(item[labelKey]) + '</span>'
        + '<div class="siteana-lb-bar-wrap"><div class="siteana-lb-bar" style="width:' + pct + '%;background:#64748B"></div></div>'
        + '<span class="siteana-lb-total">' + item[valueKey] + '</span></div>';
    }).join('');
  }

  // ── GOAL EDITING MODAL ──
  function openGoalModal() {
    var modal = document.getElementById('sa-goal-modal');
    if (!modal) return;
    var goals;
    try { goals = JSON.parse(localStorage.getItem('siteana_goals')); } catch(e) {}
    if (!goals || !goals.length) goals = JSON.parse(JSON.stringify(GOALS_DEFAULT));
    renderGoalForm(goals);
    modal.style.display = 'flex';
  }

  function closeGoalModal() {
    var modal = document.getElementById('sa-goal-modal');
    if (modal) modal.style.display = 'none';
  }

  function renderGoalForm(goals) {
    var form = document.getElementById('sa-goal-form');
    if (!form) return;
    form.innerHTML = goals.map(function(g, i) {
      return '<div class="siteana-goal-row" data-idx="' + i + '">'
        + '<input type="text" value="' + esc(g.label) + '" placeholder="Label" class="siteana-ginput siteana-ginput-label" aria-label="Goal label">'
        + '<select class="siteana-ginput siteana-ginput-metric" aria-label="Metric type">'
        + '<option value="weekly_users"' + (g.metric === 'weekly_users' ? ' selected' : '') + '>Weekly Users</option>'
        + '<option value="total_users"' + (g.metric === 'total_users' ? ' selected' : '') + '>Total Users</option>'
        + '</select>'
        + '<input type="number" value="' + g.target + '" placeholder="Target" class="siteana-ginput siteana-ginput-target" min="1" aria-label="Target value">'
        + '<input type="date" value="' + g.deadline + '" class="siteana-ginput siteana-ginput-date" aria-label="Deadline">'
        + '<button class="siteana-goal-remove" data-idx="' + i + '" aria-label="Remove goal">\u00D7</button>'
        + '</div>';
    }).join('');
    form.querySelectorAll('.siteana-goal-remove').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var row = btn.closest('.siteana-goal-row');
        if (row) row.remove();
      });
    });
  }

  function readGoalsFromForm() {
    var rows = document.querySelectorAll('.siteana-goal-row');
    var goals = [];
    rows.forEach(function(row) {
      var label = row.querySelector('.siteana-ginput-label');
      var metric = row.querySelector('.siteana-ginput-metric');
      var target = row.querySelector('.siteana-ginput-target');
      var deadline = row.querySelector('.siteana-ginput-date');
      if (label && metric && target && deadline && target.value) {
        goals.push({
          label: label.value || 'Goal',
          metric: metric.value,
          target: parseInt(target.value) || 100,
          deadline: deadline.value || '2026-12-31'
        });
      }
    });
    return goals;
  }

  // Wire up modal buttons
  var editBtn = document.getElementById('sa-goals-edit');
  if (editBtn) editBtn.addEventListener('click', openGoalModal);

  var closeBtn = document.getElementById('sa-goal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeGoalModal);

  var modalOverlay = document.getElementById('sa-goal-modal');
  if (modalOverlay) modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) closeGoalModal();
  });

  var saveBtn = document.getElementById('sa-goal-save');
  if (saveBtn) saveBtn.addEventListener('click', function() {
    var goals = readGoalsFromForm();
    try { localStorage.setItem('siteana_goals', JSON.stringify(goals)); } catch(e) {}
    closeGoalModal();
    if (allTimeData) renderGoals(allTimeData);
  });

  var addBtn = document.getElementById('sa-goal-add');
  if (addBtn) addBtn.addEventListener('click', function() {
    var form = document.getElementById('sa-goal-form');
    if (!form) return;
    var idx = form.children.length;
    var row = document.createElement('div');
    row.className = 'siteana-goal-row';
    row.dataset.idx = idx;
    row.innerHTML = '<input type="text" value="" placeholder="Label" class="siteana-ginput siteana-ginput-label" aria-label="Goal label">'
      + '<select class="siteana-ginput siteana-ginput-metric" aria-label="Metric type"><option value="weekly_users">Weekly Users</option><option value="total_users">Total Users</option></select>'
      + '<input type="number" value="100" placeholder="Target" class="siteana-ginput siteana-ginput-target" min="1" aria-label="Target value">'
      + '<input type="date" value="2026-12-31" class="siteana-ginput siteana-ginput-date" aria-label="Deadline">'
      + '<button class="siteana-goal-remove" aria-label="Remove goal">\u00D7</button>';
    row.querySelector('.siteana-goal-remove').addEventListener('click', function() { row.remove(); });
    form.appendChild(row);
  });

  var resetBtn = document.getElementById('sa-goal-reset');
  if (resetBtn) resetBtn.addEventListener('click', function() {
    try { localStorage.removeItem('siteana_goals'); } catch(e) {}
    renderGoalForm(JSON.parse(JSON.stringify(GOALS_DEFAULT)));
  });

  // ── BIGGEST MOVERS (#1) ──
  function renderMovers(data) {
    var card = document.getElementById('sa-movers-card');
    var container = document.getElementById('sa-movers');
    if (!card || !container) return;
    var ga4 = data.ga4;
    if (!ga4 || !ga4.tool_trends || !ga4.trend || ga4.trend.length < 2) { card.style.display = 'none'; return; }
    var movers = [];
    var len = ga4.trend.length;
    Object.keys(ga4.tool_trends).forEach(function(tid) {
      var arr = ga4.tool_trends[tid];
      if (!arr || arr.length < 2) return;
      var today = arr[arr.length - 1] || 0;
      var yesterday = arr[arr.length - 2] || 0;
      var diff = today - yesterday;
      var pct = yesterday > 0 ? Math.round((diff / yesterday) * 100) : (today > 0 ? 100 : 0);
      if (diff !== 0) movers.push({ tool: tid, diff: diff, pct: pct, today: today });
    });
    movers.sort(function(a, b) { return Math.abs(b.diff) - Math.abs(a.diff); });
    var top = movers.slice(0, 6);
    if (!top.length) { card.style.display = 'none'; return; }
    card.style.display = '';
    container.innerHTML = top.map(function(m) {
      var info = getToolInfo(m.tool);
      var cls = m.diff > 0 ? 'siteana-mover-up' : 'siteana-mover-down';
      var arrow = m.diff > 0 ? '\u2191' : '\u2193';
      return '<div class="siteana-mover ' + cls + '">'
        + '<span class="siteana-mover-name" style="color:' + info.color + '">' + esc(info.name) + '</span>'
        + '<span class="siteana-mover-diff">' + arrow + ' ' + Math.abs(m.diff) + ' views</span>'
        + '<span class="siteana-mover-pct">' + (m.pct >= 0 ? '+' : '') + m.pct + '%</span>'
        + '</div>';
    }).join('');
  }

  // ── ACTION QUEUE (#4) ──
  function renderActionQueue(data) {
    var card = document.getElementById('sa-actions-card');
    var container = document.getElementById('sa-actions');
    if (!card || !container) return;
    var actions = [];
    var ga4 = data.ga4;
    var gsc = data.gsc;
    // Low-CTR queries worth fixing
    if (gsc && gsc.queries) {
      var lowCtr = gsc.queries.filter(function(q) { return q.position < 10 && q.ctr < 8 && q.impressions > 15; }).slice(0, 2);
      lowCtr.forEach(function(q) {
        actions.push({ icon: '\uD83D\uDD0D', priority: 'high', text: 'Improve title/desc for "' + q.query + '" \u2014 pos ' + q.position + ' but only ' + q.ctr + '% CTR', action: 'Update meta tags in content file' });
      });
    }
    // Underperforming tools
    if (ga4 && ga4.leaderboard) {
      var low = ga4.leaderboard.filter(function(t) { return t.views < 10 && t.tool !== 'site-analytics' && t.tool !== 'feedback'; });
      if (low.length > 0) {
        var names = low.slice(0, 3).map(function(t) { return getToolInfo(t.tool).name; }).join(', ');
        actions.push({ icon: '\uD83D\uDCE3', priority: 'medium', text: 'Promote ' + names + ' \u2014 fewer than 10 views each', action: 'Share on social or cross-link from blog' });
      }
    }
    // Blog content opportunity
    if (ga4 && ga4.blog_pages && ga4.totals) {
      var bv = ga4.blog_pages.reduce(function(s, p) { return s + p.views; }, 0);
      var bp = ga4.totals.views > 0 ? Math.round((bv / ga4.totals.views) * 100) : 0;
      if (bp > 40) actions.push({ icon: '\uD83D\uDCDD', priority: 'medium', text: 'Blog drives ' + bp + '% of traffic \u2014 publish more content on trending topics', action: 'Check SEO opportunities for post ideas' });
      if (bp < 15) actions.push({ icon: '\uD83D\uDCDD', priority: 'medium', text: 'Blog only ' + bp + '% of traffic \u2014 consider writing about your most popular tools', action: 'Write a blog post about your top 3 tools' });
    }
    // WoW decline warning
    if (ga4 && ga4.wow && ga4.wow.change && ga4.wow.change.views < -15) {
      actions.push({ icon: '\u26A0\uFE0F', priority: 'high', text: 'Traffic down ' + Math.abs(ga4.wow.change.views) + '% week-over-week \u2014 investigate cause', action: 'Check if a content update or external link was lost' });
    }
    // New milestone suggestion
    if (ga4 && ga4.trend && ga4.trend.length > 3) {
      var last3 = ga4.trend.slice(-3);
      var avg3 = last3.reduce(function(s, d) { return s + d.views; }, 0) / 3;
      var allAvg = ga4.trend.reduce(function(s, d) { return s + d.views; }, 0) / ga4.trend.length;
      if (avg3 > allAvg * 1.5) actions.push({ icon: '\uD83C\uDF1F', priority: 'low', text: 'Last 3 days averaged ' + Math.round(avg3) + ' views \u2014 50%+ above normal!', action: 'Consider adding this as a milestone' });
    }
    if (!actions.length) { card.style.display = 'none'; return; }
    card.style.display = '';
    container.innerHTML = actions.map(function(a) {
      return '<div class="siteana-action siteana-action-' + a.priority + '">'
        + '<span class="siteana-action-icon">' + a.icon + '</span>'
        + '<div class="siteana-action-body">'
        + '<div class="siteana-action-text">' + esc(a.text) + '</div>'
        + '<div class="siteana-action-how">' + esc(a.action) + '</div>'
        + '</div></div>';
    }).join('');
  }

  // ── TOOL DEEP-DIVE (#5) ──
  function setupToolDeepDive() {
    var lb = document.getElementById('sa-leaderboard');
    if (!lb) return;
    lb.addEventListener('click', function(e) {
      var item = e.target.closest('.siteana-lb-item');
      if (!item) return;
      var nameEl = item.querySelector('.siteana-lb-name');
      if (!nameEl) return;
      var toolName = nameEl.textContent;
      var toolId = '';
      Object.keys(TOOLS).forEach(function(k) { if (TOOLS[k].name === toolName) toolId = k; });
      if (!toolId || !currentData || !currentData.ga4) return;
      openToolDetail(toolId);
    });

    var closeBtn = document.getElementById('sa-tool-close');
    if (closeBtn) closeBtn.addEventListener('click', closeToolDetail);
    var overlay = document.getElementById('sa-tool-modal');
    if (overlay) overlay.addEventListener('click', function(e) { if (e.target === overlay) closeToolDetail(); });
  }

  function openToolDetail(toolId) {
    var modal = document.getElementById('sa-tool-modal');
    var title = document.getElementById('sa-tool-detail-title');
    var statsEl = document.getElementById('sa-tool-detail-stats');
    if (!modal || !title || !statsEl) return;
    var info = getToolInfo(toolId);
    var ga4 = currentData.ga4;
    title.textContent = info.name;
    title.style.color = info.color;
    // Find tool in leaderboard
    var toolData = null;
    if (ga4.leaderboard) ga4.leaderboard.forEach(function(t) { if (t.tool === toolId) toolData = t; });
    // Stats
    var statsHtml = '<div class="siteana-grid-2" style="gap:1rem">';
    if (toolData) {
      statsHtml += '<div class="siteana-stat" style="background:rgba(255,255,255,0.03)"><span class="siteana-stat-num" style="color:' + info.color + '">' + numFmt(toolData.views) + '</span><span class="siteana-stat-label">Views</span></div>';
      statsHtml += '<div class="siteana-stat" style="background:rgba(255,255,255,0.03)"><span class="siteana-stat-num" style="color:' + info.color + '">' + numFmt(toolData.users) + '</span><span class="siteana-stat-label">Users</span></div>';
    }
    statsHtml += '</div>';
    // Rank
    if (ga4.leaderboard && toolData) {
      var rank = ga4.leaderboard.indexOf(toolData) + 1;
      var engagement = toolData.views > 0 ? Math.round((toolData.users / toolData.views) * 100) : 0;
      statsHtml += '<p class="siteana-hint" style="margin-top:1rem">Rank #' + rank + ' of ' + ga4.leaderboard.length + ' tools \u00B7 ' + engagement + '% engagement ratio</p>';
    }
    // Link
    var pathMap = {}; Object.keys(TOOLS).forEach(function(k) { pathMap[k] = '/' + k.replace('prompt-library', 'prompts').replace('licensing', 'licensing').replace('meeting-planner', 'world-clock') + '/'; });
    statsHtml += '<a href="' + (pathMap[toolId] || '/' + toolId + '/') + '" style="color:' + info.color + ';font-size:0.88rem;font-weight:600" target="_blank" rel="noopener">Visit tool \u2192</a>';
    statsEl.innerHTML = statsHtml;
    // Chart
    var ctx = document.getElementById('sa-tool-detail-chart');
    if (ctx && ga4.tool_trends && ga4.tool_trends[toolId] && ga4.trend) {
      if (_toolDetailChart) { _toolDetailChart.destroy(); _toolDetailChart = null; }
      var trendData = ga4.tool_trends[toolId];
      var labels = ga4.trend.slice(0, trendData.length).map(function(d) { return d.date.slice(5); });
      _toolDetailChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{ label: 'Daily Views', data: trendData, backgroundColor: info.color + '80', borderColor: info.color, borderWidth: 1, borderRadius: 3 }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: 'rgba(255,255,255,0.4)', maxTicksLimit: 10 }, grid: { color: 'rgba(255,255,255,0.05)' } },
            y: { beginAtZero: true, ticks: { color: 'rgba(255,255,255,0.4)' }, grid: { color: 'rgba(255,255,255,0.05)' } }
          }
        }
      });
    }
    modal.style.display = 'flex';
  }

  function closeToolDetail() {
    var modal = document.getElementById('sa-tool-modal');
    if (modal) modal.style.display = 'none';
    if (_toolDetailChart) { _toolDetailChart.destroy(); _toolDetailChart = null; }
  }

  setupToolDeepDive();

  // ── EXPORT REPORT (#8) ──
  function exportReport() {
    if (!currentData || !currentData.ga4) return;
    var ga4 = currentData.ga4;
    var gsc = currentData.gsc;
    var lines = [];
    lines.push('SITE ANALYTICS REPORT');
    lines.push('Generated: ' + new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    lines.push('Range: ' + currentRange);
    lines.push('');
    lines.push('SUMMARY');
    lines.push('  Views:    ' + numFmt(ga4.totals.views));
    lines.push('  Users:    ' + numFmt(ga4.totals.users));
    lines.push('  Sessions: ' + numFmt(ga4.totals.sessions));
    if (ga4.wow && ga4.wow.change) {
      lines.push('  WoW:      Views ' + (ga4.wow.change.views >= 0 ? '+' : '') + ga4.wow.change.views + '%, Users ' + (ga4.wow.change.users >= 0 ? '+' : '') + ga4.wow.change.users + '%');
    }
    lines.push('');
    lines.push('TOP 10 TOOLS');
    if (ga4.leaderboard) ga4.leaderboard.slice(0, 10).forEach(function(t, i) {
      lines.push('  ' + (i + 1) + '. ' + getToolInfo(t.tool).name + ' — ' + numFmt(t.views) + ' views, ' + numFmt(t.users) + ' users');
    });
    lines.push('');
    lines.push('TOP 5 PAGES');
    if (ga4.top_pages) ga4.top_pages.slice(0, 5).forEach(function(p, i) {
      lines.push('  ' + (i + 1) + '. ' + p.path + ' — ' + numFmt(p.views) + ' views');
    });
    if (gsc && gsc.queries) {
      lines.push('');
      lines.push('TOP SEARCH QUERIES');
      gsc.queries.slice(0, 10).forEach(function(q, i) {
        lines.push('  ' + (i + 1) + '. "' + q.query + '" — ' + q.clicks + ' clicks, pos ' + q.position);
      });
    }
    lines.push('');
    lines.push('TOP COUNTRIES');
    if (ga4.countries) ga4.countries.slice(0, 5).forEach(function(c) {
      lines.push('  ' + c.country + ': ' + numFmt(c.users) + ' users');
    });
    var text = lines.join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        var btn = document.getElementById('sa-export');
        if (btn) { var orig = btn.textContent; btn.textContent = 'Copied!'; setTimeout(function() { btn.textContent = orig; }, 2000); }
      });
    } else {
      var ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    }
  }

  var exportBtn = document.getElementById('sa-export');
  if (exportBtn) exportBtn.addEventListener('click', exportReport);

  // ── ENHANCED REFRESH (#3) ──
  function renderRefreshTime(data) {
    var el = document.getElementById('sa-refreshed');
    if (!el || !data.updated) return;
    var d = new Date(data.updated);
    var ago = Math.round((Date.now() - d.getTime()) / 60000);
    var agoStr = ago < 1 ? 'just now' : ago + 'm ago';
    // GSC data typically lags 2-3 days
    var gscNote = data.gsc && data.gsc.queries && data.gsc.queries.length > 0 ? 'GSC: ~2 day lag' : 'GSC: no data';
    el.innerHTML = 'GA4: ' + agoStr + ' \u00B7 ' + gscNote + ' \u00B7 <button class="siteana-refresh-btn" id="sa-refresh-now" aria-label="Refresh now">Refresh</button>';
    var rb = document.getElementById('sa-refresh-now');
    if (rb) rb.addEventListener('click', function() {
      el.innerHTML = 'Refreshing...';
      fetchData(currentRange);
    });
  }

  // ── MORNING BRIEF (#1) ──
  function renderMorningBrief(data) {
    var el = document.getElementById('sa-brief');
    if (!el) return;
    var ga4 = data.ga4; var gsc = data.gsc;
    if (!ga4 || !ga4.totals || !ga4.trend || !ga4.trend.length) { el.style.display = 'none'; return; }
    var parts = [];
    // Yesterday's performance
    var last = ga4.trend[ga4.trend.length - 1];
    var avg = ga4.trend.reduce(function(s, d) { return s + d.views; }, 0) / ga4.trend.length;
    var pctAvg = avg > 0 ? Math.round((last.views / avg) * 100) : 0;
    parts.push('<strong>' + last.date.slice(5) + '</strong>: ' + numFmt(last.views) + ' views (' + pctAvg + '% of avg).');
    // WoW
    if (ga4.wow && ga4.wow.change) {
      var wc = ga4.wow.change.views;
      parts.push('Traffic ' + (wc >= 0 ? 'up' : 'down') + ' <strong>' + Math.abs(wc) + '%</strong> week-over-week.');
    }
    // Top tool
    if (ga4.leaderboard && ga4.leaderboard.length) {
      var t = ga4.leaderboard[0];
      var pct = ga4.totals.views > 0 ? Math.round((t.views / ga4.totals.views) * 100) : 0;
      parts.push(getToolInfo(t.tool).name + ' leads at ' + pct + '% of traffic.');
    }
    // SEO opportunity
    if (gsc && gsc.queries) {
      var opps = gsc.queries.filter(function(q) { return q.position < 10 && q.ctr < 10 && q.impressions > 10; });
      if (opps.length) parts.push(opps.length + ' SEO opportunit' + (opps.length > 1 ? 'ies' : 'y') + ' — queries ranking well but under-clicked.');
    }
    // Goal progress
    var goals; try { goals = JSON.parse(localStorage.getItem('siteana_goals')); } catch(e) {}
    if (!goals || !goals.length) goals = GOALS_DEFAULT;
    var weeklyGoal = goals.find(function(g) { return g.metric === 'weekly_users'; });
    if (weeklyGoal && ga4.weekly && ga4.weekly.length) {
      var lastComplete = null;
      for (var i = ga4.weekly.length - 1; i >= 0; i--) { if (ga4.weekly[i].days >= 7) { lastComplete = ga4.weekly[i]; break; } }
      if (lastComplete) {
        var gPct = Math.round((lastComplete.users / weeklyGoal.target) * 100);
        parts.push(gPct + '% toward ' + weeklyGoal.label + ' goal.');
      }
    }
    // Anomaly check
    if (last.views > avg * 2) parts.push('\uD83D\uDD25 Anomaly: last day was ' + Math.round(last.views / avg) + 'x the average!');
    else if (last.views < avg * 0.4 && avg > 20) parts.push('\u26A0\uFE0F Anomaly: last day was only ' + pctAvg + '% of average.');
    el.style.display = '';
    el.innerHTML = '<div class="siteana-brief-inner">\uD83D\uDCCA ' + parts.join(' ') + '</div>';
  }

  // ── SINCE LAST VISIT (#2) ──
  function renderSinceLastVisit(data) {
    var el = document.getElementById('sa-since');
    if (!el) return;
    var ga4 = data.ga4;
    if (!ga4 || !ga4.totals) { el.style.display = 'none'; return; }
    var key = 'siteana_last_visit';
    var prev; try { prev = JSON.parse(localStorage.getItem(key)); } catch(e) {}
    // Save current visit
    var now = { time: Date.now(), views: ga4.totals.views, users: ga4.totals.users, sessions: ga4.totals.sessions };
    try { localStorage.setItem(key, JSON.stringify(now)); } catch(e) {}
    if (!prev || !prev.time) { el.style.display = 'none'; return; }
    var ago = Date.now() - prev.time;
    var agoStr = ago < 3600000 ? Math.round(ago / 60000) + 'm ago' : ago < 86400000 ? Math.round(ago / 3600000) + 'h ago' : Math.round(ago / 86400000) + 'd ago';
    var dv = ga4.totals.views - (prev.views || 0);
    var du = ga4.totals.users - (prev.users || 0);
    if (dv <= 0 && du <= 0) { el.style.display = 'none'; return; }
    el.style.display = '';
    el.innerHTML = '<div class="siteana-since-inner">Since your last visit (' + agoStr + '): <strong>+' + numFmt(dv) + ' views</strong>, <strong>+' + numFmt(du) + ' users</strong></div>';
  }

  // ── HEATMAP CALENDAR (#3) ──
  function renderHeatmap(trend) {
    var container = document.getElementById('sa-heatmap');
    if (!container || !trend || !trend.length) return;
    var max = Math.max.apply(null, trend.map(function(d) { return d.views; })) || 1;
    // Build day cells
    var html = '<div class="siteana-heatmap-grid">';
    trend.forEach(function(d) {
      var intensity = Math.min(1, d.views / max);
      var alpha = 0.1 + intensity * 0.8;
      var title = d.date + ': ' + numFmt(d.views) + ' views';
      html += '<div class="siteana-hm-cell" style="background:rgba(100,116,139,' + alpha.toFixed(2) + ')" title="' + esc(title) + '"><span class="siteana-hm-label">' + d.date.slice(8) + '</span></div>';
    });
    html += '</div>';
    // Legend
    html += '<div class="siteana-hm-legend"><span>Less</span>';
    for (var l = 0; l < 5; l++) {
      var a = 0.1 + (l / 4) * 0.8;
      html += '<div class="siteana-hm-cell siteana-hm-legend-cell" style="background:rgba(100,116,139,' + a.toFixed(2) + ')"></div>';
    }
    html += '<span>More</span></div>';
    container.innerHTML = html;
  }

  // ── LIVE HEARTBEAT (#4) ──
  function fetchAndRenderHeartbeat() {
    fetch(API + '?realtime=1').then(function(r) { return r.json(); }).then(function(rt) {
      var wrap = document.getElementById('sa-heartbeat');
      var countEl = document.getElementById('sa-live-count');
      if (!wrap || !countEl) return;
      if (rt.active > 0) {
        wrap.style.display = '';
        countEl.textContent = rt.active;
        wrap.title = (rt.pages || []).map(function(p) { return p.page + ' (' + p.users + ')'; }).join(', ');
      } else {
        wrap.style.display = 'none';
      }
    }).catch(function() {});
  }

  // ── HEALTH SCORE (#5) ──
  function renderHealthScore(data) {
    var el = document.getElementById('sa-health');
    var numEl = document.getElementById('sa-health-num');
    var subEl = document.getElementById('sa-health-sub');
    var canvas = document.getElementById('sa-health-ring');
    if (!el || !numEl || !canvas) return;
    var ga4 = data.ga4; var gsc = data.gsc;
    if (!ga4 || !ga4.totals) { el.style.display = 'none'; return; }
    var score = 0; var breakdown = [];
    // Growth (0-25): based on WoW
    var growth = 12;
    if (ga4.wow && ga4.wow.change) {
      var wv = ga4.wow.change.views;
      growth = wv > 50 ? 25 : wv > 20 ? 20 : wv > 0 ? 15 : wv > -10 ? 10 : 5;
    }
    score += growth; breakdown.push('Growth: ' + growth + '/25');
    // SEO (0-25): based on avg position + CTR
    var seo = 10;
    if (gsc && gsc.queries && gsc.queries.length) {
      var avgPos = gsc.queries.reduce(function(s, q) { return s + q.position; }, 0) / gsc.queries.length;
      var avgCtr = gsc.queries.reduce(function(s, q) { return s + q.ctr; }, 0) / gsc.queries.length;
      seo = avgPos < 5 ? 20 : avgPos < 10 ? 15 : avgPos < 20 ? 10 : 5;
      if (avgCtr > 10) seo += 5;
    }
    score += seo; breakdown.push('SEO: ' + seo + '/25');
    // Engagement (0-25): users/views ratio
    var eng = 12;
    if (ga4.totals.views > 0) {
      var ratio = ga4.totals.users / ga4.totals.views;
      eng = ratio > 0.5 ? 25 : ratio > 0.35 ? 20 : ratio > 0.25 ? 15 : ratio > 0.15 ? 10 : 5;
    }
    score += eng; breakdown.push('Engagement: ' + eng + '/25');
    // Reach (0-25): based on total views
    var reach = 12;
    if (ga4.totals.views > 5000) reach = 25;
    else if (ga4.totals.views > 2000) reach = 20;
    else if (ga4.totals.views > 500) reach = 15;
    else if (ga4.totals.views > 100) reach = 10;
    else reach = 5;
    score += reach; breakdown.push('Reach: ' + reach + '/25');
    // Draw ring
    var color = score >= 80 ? '#10B981' : score >= 60 ? '#FBBF24' : score >= 40 ? '#FB923C' : '#EF4444';
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var size = 140;
    canvas.width = size * dpr; canvas.height = size * dpr;
    canvas.style.width = size + 'px'; canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);
    var cx = size / 2, lw = 10;
    ctx.clearRect(0, 0, size, size);
    ctx.beginPath(); ctx.arc(cx, cx, cx - lw, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = lw; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cx, cx - lw, -Math.PI / 2, -Math.PI / 2 + (score / 100) * Math.PI * 2);
    ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke();
    numEl.textContent = score;
    numEl.style.color = color;
    if (subEl) subEl.textContent = breakdown.join(' \u00B7 ');
    el.style.display = '';
  }

  // ── SMART ALERTS (#8) ──
  function renderSmartAlerts(data) {
    var el = document.getElementById('sa-alerts');
    if (!el) return;
    var alerts = [];
    var ga4 = data.ga4;
    if (!ga4) { el.style.display = 'none'; return; }
    // Check stored thresholds
    var thresholds; try { thresholds = JSON.parse(localStorage.getItem('siteana_alerts')); } catch(e) {}
    if (!thresholds) thresholds = { min_daily_views: 100, min_weekly_users: 200 };
    // Check latest day
    if (ga4.trend && ga4.trend.length) {
      var last = ga4.trend[ga4.trend.length - 1];
      if (last.views < thresholds.min_daily_views) {
        alerts.push({ level: 'warn', text: 'Daily views (' + last.views + ') below threshold (' + thresholds.min_daily_views + ')' });
      }
    }
    // Check weekly users
    if (ga4.weekly && ga4.weekly.length) {
      var lastWeek = ga4.weekly[ga4.weekly.length - 1];
      if (lastWeek.users < thresholds.min_weekly_users && lastWeek.days >= 5) {
        alerts.push({ level: 'warn', text: 'Weekly users (' + lastWeek.users + ') below threshold (' + thresholds.min_weekly_users + ')' });
      }
    }
    // Check for zero-traffic tools (3+ days)
    if (ga4.tool_trends) {
      Object.keys(ga4.tool_trends).forEach(function(tid) {
        var arr = ga4.tool_trends[tid];
        if (arr && arr.length >= 3) {
          var last3 = arr.slice(-3);
          if (last3.every(function(v) { return v === 0; })) {
            alerts.push({ level: 'info', text: getToolInfo(tid).name + ' had 0 views for 3 consecutive days' });
          }
        }
      });
    }
    if (!alerts.length) { el.style.display = 'none'; return; }
    el.style.display = '';
    el.innerHTML = alerts.map(function(a) {
      var icon = a.level === 'warn' ? '\u26A0\uFE0F' : '\u2139\uFE0F';
      return '<div class="siteana-alert siteana-alert-' + a.level + '">' + icon + ' ' + esc(a.text) + '</div>';
    }).join('');
  }

  // ── TOOL DECAY WARNING (#10) — integrated into leaderboard via CSS class ──
  // Decay detection happens in renderMovers — tools with negative day-over-day get a visual indicator

  // ── AUDIENCE PERSONA (#11) — integrated into Morning Brief ──

  // ── CONTENT GAPS (#14) ──
  function renderContentGaps(data) {
    var el = document.getElementById('sa-content-gaps');
    if (!el) return;
    var gsc = data.gsc; var ga4 = data.ga4;
    if (!gsc || !gsc.queries || !ga4 || !ga4.leaderboard) { el.innerHTML = '<p class="siteana-hint">Not enough data yet</p>'; return; }
    // Map tool categories to check coverage
    var categories = {
      'copilot': ['copilot', 'microsoft 365 copilot', 'm365 copilot'],
      'licensing': ['licensing', 'license', 'e3', 'e5', 'plan'],
      'security': ['conditional access', 'security', 'zero trust', 'mfa'],
      'migration': ['migration', 'migrate', 'tenant'],
      'powershell': ['powershell', 'script', 'command'],
      'certification': ['az-900', 'az-104', 'certification', 'exam', 'study guide'],
      'ai': ['ai', 'artificial intelligence', 'openai', 'claude', 'chatgpt']
    };
    var queryTexts = gsc.queries.map(function(q) { return q.query.toLowerCase(); });
    var gaps = [];
    Object.keys(categories).forEach(function(cat) {
      var keywords = categories[cat];
      var hasQuery = keywords.some(function(kw) { return queryTexts.some(function(q) { return q.indexOf(kw) > -1; }); });
      if (!hasQuery) gaps.push(cat);
    });
    if (!gaps.length) { el.innerHTML = '<p class="siteana-hint">Good coverage — you rank for queries in all major categories</p>'; return; }
    el.innerHTML = gaps.map(function(g) {
      return '<div class="siteana-gap-item"><span class="siteana-gap-cat">' + esc(g) + '</span><span class="siteana-gap-hint">No ranking queries yet — consider writing content about this topic</span></div>';
    }).join('');
  }

  // ── YOUTUBE INTELLIGENCE TAB ──
  var _ytAnalyticsChart = null;
  var _ytTrafficChart = null;
  var _ytDayChart = null;
  var ytDataCache = null;

  function fetchYouTubeData() {
    if (ytDataCache) { renderYouTubeTab(ytDataCache); return; }
    var el = document.getElementById('panel-youtube');
    if (el && !el.querySelector('.siteana-empty')) {
      el.insertAdjacentHTML('afterbegin', '<div class="siteana-empty" id="sa-yt-loading">Loading YouTube data...</div>');
    }
    fetch(API + '?youtube=1').then(function(r) { return r.json(); }).then(function(yt) {
      var ldg = document.getElementById('sa-yt-loading'); if (ldg) ldg.remove();
      if (yt && !yt.error) { ytDataCache = yt; renderYouTubeTab(yt); }
      else {
        var p = document.getElementById('panel-youtube');
        if (p) p.innerHTML = '<div class="siteana-empty">YouTube: ' + esc(yt.error || 'No data') + '</div>';
      }
    }).catch(function(e) {
      var ldg = document.getElementById('sa-yt-loading'); if (ldg) ldg.remove();
    });
  }

  function renderYouTubeTab(yt) {
    // Brief
    renderYouTubeBrief(yt);
    // Recommendations
    var recsCard = document.getElementById('sa-yt-recs-card');
    var recsEl = document.getElementById('sa-yt-recs');
    if (recsCard && recsEl && yt.recommendations && yt.recommendations.length) {
      recsCard.style.display = '';
      recsEl.innerHTML = yt.recommendations.map(function(r) {
        return '<div class="siteana-action siteana-action-medium"><span class="siteana-action-icon">' + r.icon + '</span><div class="siteana-action-body"><div class="siteana-action-text">' + esc(r.text) + '</div></div></div>';
      }).join('');
    }
    // Channel stats
    if (yt.main) renderChannelCard('sa-yt-main', yt.main);
    if (yt.bites) renderChannelCard('sa-yt-bites', yt.bites);
    // Analytics charts (from OAuth2 YouTube Analytics)
    if (yt.analytics && !yt.analytics.error && yt.analytics.daily) {
      renderYTAnalyticsChart(yt.analytics.daily);
      if (yt.analytics.trafficSources) renderYTTrafficChart(yt.analytics.trafficSources);
    }
    // Leaderboard (main channel, sorted by velocity)
    renderYTLeaderboard(yt.mainVideos, yt.mainAnalysis);
    // Publish day chart
    if (yt.mainAnalysis && yt.mainAnalysis.dayDist) renderYTDayChart(yt.mainAnalysis.dayDist);
    // Hot topics
    renderYTTopics(yt.mainAnalysis);
    // Underperformers
    renderYTUnderperformers(yt.mainAnalysis);
    // Weekly Scorecard
    renderYTScorecard(yt.weeklyScorecard);
    // Milestone Projector
    renderYTMilestones(yt.milestoneProjections);
    // Title Scorecards
    renderYTTitles(yt.titleScores);
    // Bites top
    renderYTBitesTop(yt.bitesVideos);
  }

  function renderYouTubeBrief(yt) {
    var el = document.getElementById('sa-yt-brief');
    if (!el) return;
    var parts = [];
    if (yt.main) parts.push('Main: <strong>' + roundDisplay(yt.main.subscribers) + ' subs</strong>, ' + roundDisplay(yt.main.totalViews) + ' lifetime views, ' + yt.main.videoCount + ' videos.');
    if (yt.bites) parts.push('Bites: <strong>' + roundDisplay(yt.bites.subscribers) + ' subs</strong>, ' + roundDisplay(yt.bites.totalViews) + ' lifetime views.');
    if (yt.analytics && !yt.analytics.error && yt.analytics.daily && yt.analytics.daily.length) {
      var d = yt.analytics.daily;
      var totalViews28 = d.reduce(function(s, r) { return s + r.views; }, 0);
      var totalWatch = d.reduce(function(s, r) { return s + r.watchMinutes; }, 0);
      parts.push('Last 28 days: <strong>' + numFmt(totalViews28) + ' views</strong>, ' + numFmt(totalWatch) + ' min watched.');
    }
    if (yt.mainAnalysis && yt.mainAnalysis.topByVelocity && yt.mainAnalysis.topByVelocity.length) {
      var top = yt.mainAnalysis.topByVelocity[0];
      parts.push('Fastest growing: "' + top.title.slice(0, 50) + '..." at ' + top.viewsPerDay + ' views/day.');
    }
    if (!parts.length) { el.style.display = 'none'; return; }
    el.style.display = '';
    el.innerHTML = '<div class="siteana-brief-inner" style="border-color:rgba(239,68,68,0.25);background:linear-gradient(135deg,rgba(239,68,68,0.08),rgba(239,68,68,0.02))">\uD83C\uDFAC ' + parts.join(' ') + '</div>';
  }

  function renderChannelCard(containerId, ch) {
    var el = document.getElementById(containerId);
    if (!el || !ch) return;
    el.innerHTML = '<div class="siteana-yt-stats">'
      + '<div class="siteana-stat"><span class="siteana-stat-num" style="color:#EF4444">' + roundDisplay(ch.subscribers) + '</span><span class="siteana-stat-label">Subscribers</span></div>'
      + '<div class="siteana-stat"><span class="siteana-stat-num" style="color:#EF4444">' + roundDisplay(ch.totalViews) + '</span><span class="siteana-stat-label">Total Views</span></div>'
      + '<div class="siteana-stat"><span class="siteana-stat-num" style="color:#EF4444">' + ch.videoCount + '</span><span class="siteana-stat-label">Videos</span></div>'
      + '</div>';
  }

  function renderYTAnalyticsChart(daily) {
    var ctx = document.getElementById('sa-yt-analytics-chart');
    if (!ctx || !daily.length) return;
    if (_ytAnalyticsChart) { _ytAnalyticsChart.destroy(); _ytAnalyticsChart = null; }
    _ytAnalyticsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: daily.map(function(d) { return d.date.slice(5); }),
        datasets: [
          { label: 'Views', data: daily.map(function(d) { return d.views; }), borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.4, pointRadius: 2, yAxisID: 'y' },
          { label: 'Watch (min)', data: daily.map(function(d) { return d.watchMinutes; }), borderColor: '#FBBF24', backgroundColor: 'rgba(251,191,36,0.1)', fill: false, tension: 0.4, pointRadius: 2, yAxisID: 'y1' }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: 'rgba(255,255,255,0.6)' } } },
        scales: {
          x: { ticks: { color: 'rgba(255,255,255,0.4)', maxTicksLimit: 8 }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { beginAtZero: true, position: 'left', ticks: { color: 'rgba(255,255,255,0.4)' }, grid: { color: 'rgba(255,255,255,0.05)' }, title: { display: true, text: 'Views', color: 'rgba(255,255,255,0.4)' } },
          y1: { beginAtZero: true, position: 'right', ticks: { color: 'rgba(255,255,255,0.4)' }, grid: { display: false }, title: { display: true, text: 'Watch min', color: 'rgba(255,255,255,0.4)' } }
        }
      }
    });
  }

  function renderYTTrafficChart(sources) {
    var ctx = document.getElementById('sa-yt-traffic-chart');
    if (!ctx || !sources.length) return;
    if (_ytTrafficChart) { _ytTrafficChart.destroy(); _ytTrafficChart = null; }
    var colors = ['#EF4444','#FBBF24','#10B981','#3B82F6','#8B5CF6','#EC4899','#FB923C','#14B8A6'];
    _ytTrafficChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: sources.map(function(s) { return s.source.replace('_', ' '); }),
        datasets: [{ data: sources.map(function(s) { return s.views; }), backgroundColor: colors.slice(0, sources.length), borderWidth: 0 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'right', labels: { color: 'rgba(255,255,255,0.6)', font: { size: 10 }, padding: 6 } } }
      }
    });
  }

  function renderYTLeaderboard(videos, analysis) {
    var el = document.getElementById('sa-yt-leaderboard');
    if (!el || !videos || !videos.length) return;
    var sorted = videos.slice().sort(function(a, b) { return b.viewsPerDay - a.viewsPerDay; });
    var maxVpd = sorted[0].viewsPerDay || 1;
    el.innerHTML = sorted.slice(0, 20).map(function(v, i) {
      var pct = Math.round((v.viewsPerDay / maxVpd) * 100);
      var engBadge = v.engagement > 5 ? 'siteana-pos-top3' : v.engagement > 3 ? 'siteana-pos-top10' : v.engagement > 1 ? 'siteana-pos-top20' : 'siteana-pos-deep';
      return '<div class="siteana-lb-item" style="cursor:default">'
        + '<span class="siteana-lb-rank">' + (i + 1) + '</span>'
        + '<div class="siteana-lb-info"><a class="siteana-lb-name" href="https://youtube.com/watch?v=' + esc(v.id) + '" target="_blank" rel="noopener" style="color:rgba(255,255,255,0.85);text-decoration:none">' + esc(v.title.length > 55 ? v.title.slice(0, 52) + '...' : v.title) + '</a>'
        + '<span class="siteana-lb-count">' + numFmt(v.views) + ' views \u00B7 ' + v.viewsPerDay + '/day \u00B7 ' + v.daysSince + 'd old</span></div>'
        + '<span class="siteana-pos-badge ' + engBadge + '">' + v.engagement + '%</span>'
        + '<div class="siteana-lb-bar-wrap"><div class="siteana-lb-bar" style="width:' + pct + '%;background:#EF4444"></div></div>'
        + '</div>';
    }).join('');
  }

  function renderYTDayChart(dayDist) {
    var ctx = document.getElementById('sa-yt-day-chart');
    if (!ctx) return;
    if (_ytDayChart) { _ytDayChart.destroy(); _ytDayChart = null; }
    var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    var maxDay = Math.max.apply(null, dayDist);
    _ytDayChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: days,
        datasets: [{ data: dayDist, backgroundColor: dayDist.map(function(v) { return v === maxDay ? '#EF4444' : 'rgba(239,68,68,0.3)'; }), borderWidth: 0, borderRadius: 6 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: 'rgba(255,255,255,0.6)' }, grid: { display: false } },
          y: { beginAtZero: true, ticks: { color: 'rgba(255,255,255,0.4)', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  }

  function renderYTTopics(analysis) {
    var el = document.getElementById('sa-yt-topics');
    if (!el || !analysis || !analysis.topWords || !analysis.topWords.length) return;
    el.innerHTML = analysis.topWords.map(function(w) {
      var size = Math.max(0.75, Math.min(1.4, 0.75 + (w.count / analysis.topWords[0].count) * 0.65));
      return '<span class="siteana-topic-pill" style="font-size:' + size + 'rem">' + esc(w.word) + ' <small>' + w.count + '</small></span>';
    }).join(' ');
  }

  function renderYTUnderperformers(analysis) {
    var card = document.getElementById('sa-yt-under-card');
    var el = document.getElementById('sa-yt-underperformers');
    if (!card || !el || !analysis || !analysis.underperformers || !analysis.underperformers.length) { if (card) card.style.display = 'none'; return; }
    card.style.display = '';
    el.innerHTML = analysis.underperformers.map(function(v) {
      return '<div class="siteana-opp-item">'
        + '<div class="siteana-opp-query"><a href="https://youtube.com/watch?v=' + esc(v.id) + '" target="_blank" rel="noopener" style="color:rgba(255,255,255,0.85);text-decoration:none">' + esc(v.title) + '</a></div>'
        + '<div class="siteana-opp-stats">' + numFmt(v.views) + ' views \u00B7 ' + v.viewsPerDay + ' views/day \u00B7 ' + v.daysSince + ' days old</div>'
        + '<div class="siteana-opp-uplift">Consider: update title/thumbnail, create a follow-up, or reshare</div>'
        + '</div>';
    }).join('');
  }

  // ── WEEKLY SCORECARD ──
  function renderYTScorecard(sc) {
    var card = document.getElementById('sa-yt-scorecard-card');
    var el = document.getElementById('sa-yt-scorecard');
    if (!card || !el || !sc) { if (card) card.style.display = 'none'; return; }
    card.style.display = '';
    var gradeColor = sc.grade === 'A+' || sc.grade === 'A' ? '#10B981' : sc.grade === 'B' ? '#FBBF24' : '#EF4444';
    var metrics = [
      { label: 'Views', tw: numFmt(sc.thisWeek.views), lw: numFmt(sc.lastWeek.views), chg: sc.changes.views },
      { label: 'Watch Time', tw: numFmt(sc.thisWeek.watch) + 'm', lw: numFmt(sc.lastWeek.watch) + 'm', chg: sc.changes.watch },
      { label: 'Net Subs', tw: sc.thisWeek.subs, lw: sc.lastWeek.subs, chg: sc.changes.subs },
      { label: 'Likes', tw: numFmt(sc.thisWeek.likes), lw: numFmt(sc.lastWeek.likes), chg: sc.changes.likes }
    ];
    el.innerHTML = '<div class="siteana-scorecard-grade" style="color:' + gradeColor + '">Grade: ' + sc.grade + '</div>'
      + '<div class="siteana-ba-grid" style="grid-template-columns:1fr 1fr 1fr 1fr">'
      + '<div class="siteana-ba-header"><span></span><span>This Week</span><span>Last Week</span><span>Change</span></div>'
      + metrics.map(function(m) {
        var cls = m.chg > 0 ? 'siteana-change-up' : m.chg < 0 ? 'siteana-change-down' : '';
        var chgStr = m.chg !== null ? (m.chg >= 0 ? '+' : '') + m.chg + '%' : '\u2014';
        return '<div class="siteana-ba-row"><span class="siteana-ba-label">' + m.label + '</span><span>' + m.tw + '</span><span>' + m.lw + '</span><span class="' + cls + '">' + chgStr + '</span></div>';
      }).join('') + '</div>';
  }

  // ── SUBSCRIBER MILESTONE PROJECTOR ──
  function renderYTMilestones(proj) {
    var card = document.getElementById('sa-yt-milestones-card');
    var el = document.getElementById('sa-yt-milestones');
    if (!card || !el || !proj) { if (card) card.style.display = 'none'; return; }
    card.style.display = '';
    var html = '<div class="siteana-cumulative" style="margin-bottom:1rem;padding:1rem;border-radius:12px">'
      + '<span class="siteana-cumul-num" style="font-size:2rem">' + numFmt(proj.currentTotal) + '</span>'
      + '<span class="siteana-cumul-label">combined subscribers \u00B7 ' + (proj.netPerDay >= 0 ? '+' : '') + proj.netPerDay + '/day \u00B7 ' + (proj.netPerMonth >= 0 ? '+' : '') + numFmt(proj.netPerMonth) + '/month</span>'
      + '</div>';
    if (proj.targets && proj.targets.length) {
      html += proj.targets.map(function(t) {
        var label = t.target >= 1000000 ? (t.target / 1000000) + 'M' : (t.target / 1000) + 'K';
        var pct = Math.min(100, Math.round((proj.currentTotal / t.target) * 100));
        var timeStr = t.reachable ? t.daysNeeded + ' days (' + t.date + ')' : 'Not reachable at current rate';
        var barColor = pct >= 80 ? '#10B981' : pct >= 50 ? '#FBBF24' : '#64748B';
        return '<div class="siteana-goal">'
          + '<div class="siteana-goal-header"><span class="siteana-goal-label">' + label + ' subscribers</span><span class="siteana-goal-pct">' + pct + '%</span></div>'
          + '<div class="siteana-goal-track"><div class="siteana-goal-fill" style="width:' + pct + '%;background:' + barColor + '"></div></div>'
          + '<div class="siteana-goal-meta"><span>' + numFmt(proj.currentTotal) + ' / ' + numFmt(t.target) + '</span><span>' + timeStr + '</span></div>'
          + '</div>';
      }).join('');
    }
    el.innerHTML = html;
  }

  // ── TITLE SCORECARDS ──
  function renderYTTitles(scores) {
    var el = document.getElementById('sa-yt-titles');
    if (!el || !scores || !scores.length) return;
    el.innerHTML = scores.map(function(s) {
      var scoreColor = s.score >= 75 ? '#10B981' : s.score >= 55 ? '#FBBF24' : s.score >= 35 ? '#FB923C' : '#EF4444';
      var issueHtml = s.issues && s.issues.length ? '<div class="siteana-title-issues">' + s.issues.map(function(i) { return '<span class="siteana-title-issue">' + esc(i) + '</span>'; }).join('') + '</div>' : '';
      return '<div class="siteana-title-card">'
        + '<div class="siteana-title-header">'
        + '<span class="siteana-title-score" style="background:' + scoreColor + '">' + s.score + '</span>'
        + '<a class="siteana-title-name" href="https://youtube.com/watch?v=' + esc(s.id) + '" target="_blank" rel="noopener">' + esc(s.title) + '</a>'
        + '</div>'
        + '<div class="siteana-title-meta">' + numFmt(s.views) + ' views \u00B7 ' + s.engagement + '% engagement</div>'
        + issueHtml
        + '</div>';
    }).join('');
  }

  function renderYTBitesTop(videos) {
    var el = document.getElementById('sa-yt-bites-top');
    if (!el || !videos || !videos.length) return;
    el.innerHTML = videos.slice(0, 10).map(function(v, i) {
      return '<div class="siteana-lb-item" style="cursor:default">'
        + '<span class="siteana-lb-rank">' + (i + 1) + '</span>'
        + '<span class="siteana-lb-name"><a href="https://youtube.com/watch?v=' + esc(v.id) + '" target="_blank" rel="noopener" style="color:rgba(255,255,255,0.75);text-decoration:none">' + esc(v.title.length > 55 ? v.title.slice(0, 52) + '...' : v.title) + '</a></span>'
        + '<span class="siteana-lb-total">' + roundDisplay(v.views) + '</span></div>';
    }).join('');
  }

  // Wire YouTube tab lazy-load
  document.querySelectorAll('.siteana-tab').forEach(function(tab) {
    if (tab.dataset.tab === 'youtube') {
      tab.addEventListener('click', fetchYouTubeData);
    }
  });

  // ── HEALTH SCORE INLINE (stats bar) ──
  function renderHealthScoreInline(data) {
    var el = document.getElementById('sa-health-stat');
    var numEl = document.getElementById('sa-health-num-inline');
    if (!el || !numEl) return;
    var ga4 = data.ga4; var gsc = data.gsc;
    if (!ga4 || !ga4.totals) { el.style.display = 'none'; return; }
    var score = 0;
    var growth = 12;
    if (ga4.wow && ga4.wow.change) { var wv = ga4.wow.change.views; growth = wv > 50 ? 25 : wv > 20 ? 20 : wv > 0 ? 15 : wv > -10 ? 10 : 5; }
    score += growth;
    var seo = 10;
    if (gsc && gsc.queries && gsc.queries.length) { var avgPos = gsc.queries.reduce(function(s, q) { return s + q.position; }, 0) / gsc.queries.length; seo = avgPos < 5 ? 20 : avgPos < 10 ? 15 : avgPos < 20 ? 10 : 5; var avgCtr = gsc.queries.reduce(function(s, q) { return s + q.ctr; }, 0) / gsc.queries.length; if (avgCtr > 10) seo += 5; }
    score += seo;
    var eng = 12; if (ga4.totals.views > 0) { var ratio = ga4.totals.users / ga4.totals.views; eng = ratio > 0.5 ? 25 : ratio > 0.35 ? 20 : ratio > 0.25 ? 15 : ratio > 0.15 ? 10 : 5; }
    score += eng;
    var reach = 12; if (ga4.totals.views > 5000) reach = 25; else if (ga4.totals.views > 2000) reach = 20; else if (ga4.totals.views > 500) reach = 15; else if (ga4.totals.views > 100) reach = 10; else reach = 5;
    score += reach;
    var color = score >= 80 ? '#10B981' : score >= 60 ? '#FBBF24' : score >= 40 ? '#FB923C' : '#EF4444';
    numEl.textContent = score;
    numEl.style.color = color;
    el.style.display = '';
    el.style.borderColor = color + '40';
    el.style.background = color + '10';
    // Store for Command Centre
    currentData._healthScore = score;
    currentData._healthColor = color;
  }

  // ── SEO QUERY FILTER ──
  var SEO_IGNORE = ['karamatura','marawhara','hiking','track','trail','mount donald','tramping','walk'];
  var seoFilterEl = document.getElementById('sa-seo-hide-legacy');
  if (seoFilterEl) {
    seoFilterEl.addEventListener('change', function() {
      if (currentData && currentData.gsc && currentData.gsc.queries) {
        var filtered = seoFilterEl.checked ? currentData.gsc.queries.filter(function(q) { return !SEO_IGNORE.some(function(w) { return q.query.toLowerCase().indexOf(w) > -1; }); }) : currentData.gsc.queries;
        renderGSCQueries(filtered);
        renderPositionDistribution(filtered);
        renderSEOOpportunities(filtered);
      }
    });
  }

  // ── COMMAND CENTRE ──
  var _cmdPulseChart = null;

  function renderCommandCentre() {
    if (!currentData || !currentData.ga4) return;
    var ga4 = currentData.ga4;
    var gsc = currentData.gsc;

    // Daily Briefing (merged Brief + Since Last Visit)
    var briefEl = document.getElementById('sa-cmd-brief');
    if (briefEl) {
      var parts = [];
      // Since last visit
      var prev; try { prev = JSON.parse(localStorage.getItem('siteana_last_visit')); } catch(e) {}
      if (prev && prev.time) {
        var ago = Date.now() - prev.time;
        var agoStr = ago < 3600000 ? Math.round(ago / 60000) + 'm' : ago < 86400000 ? Math.round(ago / 3600000) + 'h' : Math.round(ago / 86400000) + 'd';
        var dv = ga4.totals.views - (prev.views || 0);
        if (dv > 0) parts.push('Since ' + agoStr + ' ago: <strong>+' + numFmt(dv) + ' views</strong>.');
      }
      // Today
      if (ga4.today) parts.push('Today: <strong>' + numFmt(ga4.today.views) + ' views</strong>.');
      // WoW
      if (ga4.wow && ga4.wow.change) parts.push('WoW: ' + (ga4.wow.change.views >= 0 ? '+' : '') + ga4.wow.change.views + '% views.');
      // Top tool
      if (ga4.leaderboard && ga4.leaderboard.length) parts.push(getToolInfo(ga4.leaderboard[0].tool).name + ' leads.');
      // YouTube (if loaded)
      if (ytDataCache && ytDataCache.main) parts.push('YouTube: ' + roundDisplay(ytDataCache.main.subscribers) + ' subs.');
      // Health
      if (currentData._healthScore) parts.push('Health: <strong>' + currentData._healthScore + '/100</strong>.');
      briefEl.style.display = parts.length ? '' : 'none';
      briefEl.innerHTML = '<div class="siteana-cmd-brief-inner">' + parts.join(' ') + '</div>';
    }

    // Vital Signs
    var vitalsEl = document.getElementById('sa-cmd-vitals');
    if (vitalsEl) {
      var vitals = [
        { num: numFmt(ga4.today.views), label: 'Site Today', color: '#64748B' },
        { num: roundDisplay(ga4.totals.views), label: 'Period Views', color: '#64748B' }
      ];
      if (ytDataCache && ytDataCache.analytics && !ytDataCache.analytics.error && ytDataCache.analytics.daily && ytDataCache.analytics.daily.length) {
        var ytToday = ytDataCache.analytics.daily[ytDataCache.analytics.daily.length - 1];
        vitals.push({ num: numFmt(ytToday ? ytToday.views : 0), label: 'YT Today', color: '#EF4444' });
      }
      var rtEl = document.getElementById('sa-live-count');
      vitals.push({ num: rtEl ? rtEl.textContent : '0', label: 'Live Now', color: '#EF4444' });
      if (currentData._healthScore) vitals.push({ num: currentData._healthScore, label: 'Health', color: currentData._healthColor || '#64748B' });
      if (ytDataCache && ytDataCache.weeklyScorecard) vitals.push({ num: ytDataCache.weeklyScorecard.grade, label: 'YT Grade', color: ytDataCache.weeklyScorecard.grade.charAt(0) === 'A' ? '#10B981' : ytDataCache.weeklyScorecard.grade === 'B' ? '#FBBF24' : '#EF4444' });
      vitalsEl.innerHTML = vitals.map(function(v) {
        return '<div class="siteana-stat"><span class="siteana-stat-num" style="color:' + v.color + '">' + v.num + '</span><span class="siteana-stat-label">' + v.label + '</span></div>';
      }).join('');
    }

    // Top Site Tools (by momentum)
    var toolsEl = document.getElementById('sa-cmd-top-tools');
    if (toolsEl && ga4.leaderboard) {
      var top5 = ga4.leaderboard.slice(0, 5);
      toolsEl.innerHTML = top5.map(function(t, i) {
        var info = getToolInfo(t.tool);
        return '<div class="siteana-lb-item"><span class="siteana-lb-rank">' + (i + 1) + '</span><span class="siteana-lb-name" style="color:' + info.color + '">' + esc(info.name) + '</span><span class="siteana-lb-total">' + roundDisplay(t.views) + '</span></div>';
      }).join('');
    }

    // Top YouTube Videos
    var ytEl = document.getElementById('sa-cmd-top-yt');
    if (ytEl) {
      if (ytDataCache && ytDataCache.mainAnalysis && ytDataCache.mainAnalysis.topByVelocity) {
        var topYt = ytDataCache.mainAnalysis.topByVelocity.slice(0, 5);
        ytEl.innerHTML = topYt.map(function(v, i) {
          return '<div class="siteana-lb-item"><span class="siteana-lb-rank">' + (i + 1) + '</span><span class="siteana-lb-name"><a href="https://youtube.com/watch?v=' + esc(v.id) + '" target="_blank" rel="noopener" style="color:rgba(255,255,255,0.75);text-decoration:none">' + esc(v.title.length > 45 ? v.title.slice(0, 42) + '...' : v.title) + '</a></span><span class="siteana-lb-total">' + v.viewsPerDay + '/d</span></div>';
        }).join('');
      } else {
        ytEl.innerHTML = '<p class="siteana-hint">Click YouTube tab first to load data</p>';
      }
    }

    // Growth Pulse (site + YouTube on same chart)
    var pulseCtx = document.getElementById('sa-cmd-pulse-chart');
    if (pulseCtx && ga4.trend && ga4.trend.length) {
      if (_cmdPulseChart) { _cmdPulseChart.destroy(); _cmdPulseChart = null; }
      var labels = ga4.trend.map(function(d) { return d.date.slice(5); });
      var datasets = [{ type: 'line', label: 'Site Views', data: ga4.trend.map(function(d) { return d.views; }), borderColor: '#64748B', backgroundColor: 'rgba(100,116,139,0.1)', fill: true, tension: 0.4, pointRadius: 2 }];
      if (ytDataCache && ytDataCache.analytics && !ytDataCache.analytics.error && ytDataCache.analytics.daily) {
        var ytDaily = ytDataCache.analytics.daily;
        var ytMap = {};
        ytDaily.forEach(function(d) { ytMap[d.date.slice(5)] = d.views; });
        datasets.push({ type: 'line', label: 'YouTube Views', data: labels.map(function(l) { return ytMap[l] || 0; }), borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.4, pointRadius: 2 });
      }
      _cmdPulseChart = new Chart(pulseCtx, {
        data: { labels: labels, datasets: datasets },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: 'rgba(255,255,255,0.6)' } } }, scales: { x: { ticks: { color: 'rgba(255,255,255,0.4)', maxTicksLimit: 10 }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { beginAtZero: true, ticks: { color: 'rgba(255,255,255,0.4)' }, grid: { color: 'rgba(255,255,255,0.05)' } } } }
      });
    }

    // Priority Actions (combined site + YouTube)
    var fixCard = document.getElementById('sa-cmd-fix-card');
    var fixEl = document.getElementById('sa-cmd-fixes');
    if (fixCard && fixEl) {
      var fixes = [];
      // SEO opportunities
      if (gsc && gsc.queries) {
        var opps = gsc.queries.filter(function(q) { return q.position < 10 && q.ctr < 8 && q.impressions > 15 && !SEO_IGNORE.some(function(w) { return q.query.toLowerCase().indexOf(w) > -1; }); });
        opps.slice(0, 2).forEach(function(q) { fixes.push({ priority: 'high', text: 'SEO: Improve title for "' + q.query + '" (pos ' + q.position + ', ' + q.ctr + '% CTR)' }); });
      }
      // YouTube title scores
      if (ytDataCache && ytDataCache.titleScores) {
        var weak = ytDataCache.titleScores.filter(function(t) { return t.score < 50; });
        if (weak.length) fixes.push({ priority: 'medium', text: 'YouTube: ' + weak.length + ' video titles scoring below 50 — rewrite for better CTR' });
      }
      // Low-traffic tools
      if (ga4.leaderboard) {
        var low = ga4.leaderboard.filter(function(t) { return t.views < 10 && t.tool !== 'site-analytics' && t.tool !== 'feedback'; });
        if (low.length) fixes.push({ priority: 'low', text: 'Site: ' + low.length + ' tools with <10 views — share on social or cross-link' });
      }
      fixCard.style.display = fixes.length ? '' : 'none';
      fixEl.innerHTML = fixes.map(function(f) {
        return '<div class="siteana-action siteana-action-' + f.priority + '"><div class="siteana-action-body"><div class="siteana-action-text">' + esc(f.text) + '</div></div></div>';
      }).join('');
    }

    // Site Audience
    var siteAudEl = document.getElementById('sa-cmd-site-audience');
    if (siteAudEl && ga4.countries && ga4.sources) {
      var topCountries = ga4.countries.slice(0, 3).map(function(c) { return c.country; }).join(', ');
      var topSource = ga4.sources.length ? ga4.sources[0].source : 'unknown';
      siteAudEl.innerHTML = '<p style="color:rgba(255,255,255,0.7);font-size:0.88rem;line-height:1.6">Top countries: <strong>' + esc(topCountries) + '</strong><br>Primary source: <strong>' + esc(topSource) + '</strong> (' + (ga4.sources.length ? ga4.sources[0].sessions : 0) + ' sessions)<br>Devices: ' + (ga4.devices || []).map(function(d) { return d.device + ' ' + d.users; }).join(', ') + '</p>';
    }

    // YouTube Audience
    var ytAudEl = document.getElementById('sa-cmd-yt-audience');
    if (ytAudEl) {
      if (ytDataCache && ytDataCache.analytics && ytDataCache.analytics.trafficSources && ytDataCache.analytics.trafficSources.length) {
        var sources = ytDataCache.analytics.trafficSources.slice(0, 5);
        ytAudEl.innerHTML = sources.map(function(s) {
          return '<div class="siteana-lb-item"><span class="siteana-lb-name">' + esc(s.source.replace(/_/g, ' ')) + '</span><span class="siteana-lb-total">' + numFmt(s.views) + '</span></div>';
        }).join('');
      } else {
        ytAudEl.innerHTML = '<p class="siteana-hint">Click YouTube tab first to load analytics</p>';
      }
    }
  }

  // Auto-render Command Centre on first load
  setTimeout(function() {
    var cmdPanel = document.getElementById('panel-command');
    if (cmdPanel && cmdPanel.classList.contains('active') && currentData) renderCommandCentre();
  }, 2000);

  // ── INIT ──
  fetchData(currentRange);
  fetchAndRenderHeartbeat();
  setInterval(function() { fetchData(currentRange); }, 300000);
  setInterval(fetchAndRenderHeartbeat, 30000);
})();