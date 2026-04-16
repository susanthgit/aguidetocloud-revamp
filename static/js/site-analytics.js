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

    renderInsights(generateInsights(data));
    renderMovers(data);
    renderActionQueue(data);
    renderRefreshTime(data);

    if (gsc && gsc.queries && gsc.queries.length) {
      renderGSCQueries(gsc.queries);
      renderPositionDistribution(gsc.queries);
      renderSEOOpportunities(gsc.queries);
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
    renderGrowthChart(ga4.trend);
    renderCumulative(ga4.totals);
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

  // ── INIT ──
  fetchData(currentRange);
  setInterval(function() { fetchData(currentRange); }, 300000);
})();