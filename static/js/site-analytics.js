/**
 * Site Analytics Dashboard JS
 * Fetches /api/stats and renders charts + leaderboards
 */
(function() {
  'use strict';
  var API = '/api/stats';

  // Tool display names and colours (matches Tool Registry)
  var TOOLS = {
    'ai-news':              { name: 'AI News',               color: '#ff66ff', emoji: '📰' },
    'm365-roadmap':         { name: 'M365 Roadmap',          color: '#E5A00D', emoji: '🗺️' },
    'prompt-library':       { name: 'Prompt Library',        color: '#A78BFA', emoji: '💡' },
    'licensing':            { name: 'Licensing Simplifier',  color: '#F43F5E', emoji: '📜' },
    'prompt-polisher':      { name: 'Prompt Polisher',       color: '#EC4899', emoji: '✨' },
    'copilot-readiness':    { name: 'Copilot Readiness',     color: '#3B82F6', emoji: '🎯' },
    'copilot-matrix':       { name: 'Copilot Feature Matrix',color: '#60A5FA', emoji: '📊' },
    'deprecation-timeline': { name: 'Deprecation Timeline',  color: '#DC2626', emoji: '⏰' },
    'service-health':       { name: 'Service Health',        color: '#EA580C', emoji: '🏥' },
    'cert-tracker':         { name: 'Cert Study Guides',     color: '#10B981', emoji: '📖' },
    'roi-calculator':       { name: 'ROI Calculator',        color: '#14B8A6', emoji: '💰' },
    'ai-mapper':            { name: 'AI Service Mapper',     color: '#38BDF8', emoji: '☁️' },
    'ai-showdown':          { name: 'AI SaaS Showdown',      color: '#D4A853', emoji: '🥊' },
    'ps-builder':           { name: 'PowerShell Builder',    color: '#4ADE80', emoji: '⚡' },
    'migration-planner':    { name: 'Migration Planner',     color: '#6478CC', emoji: '🔄' },
    'prompt-guide':         { name: 'Prompt Guide',          color: '#84CC16', emoji: '🎓' },
    'ca-builder':           { name: 'CA Policy Builder',     color: '#7C3AED', emoji: '🛡️' },
    'meeting-planner':      { name: 'Meeting Planner',       color: '#0EA5E9', emoji: '🌍' },
    'feedback':             { name: 'Community Feedback',    color: '#FBBF24', emoji: '💬' },
    'site-analytics':       { name: 'Site Analytics',        color: '#64748B', emoji: '📊' }
  };

  function esc(s) { var el = document.createElement('span'); el.textContent = s || ''; return el.innerHTML; }

  function roundDisplay(n) {
    if (!n || n < 100) return String(n || 0);
    if (n < 1000) return String(Math.round(n / 10) * 10);
    if (n < 10000) return (n / 1000).toFixed(1) + 'K';
    return Math.round(n / 1000) + 'K+';
  }

  function getToolInfo(key) {
    return TOOLS[key] || { name: key, color: '#64748B', emoji: '🔧' };
  }

  // Tabs
  document.querySelectorAll('.siteana-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.siteana-tab').forEach(function(t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      document.querySelectorAll('.siteana-panel').forEach(function(p) { p.classList.remove('active'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      var panel = document.getElementById('panel-' + tab.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });

  // Fetch and render
  fetch(API).then(function(r) { return r.json(); }).then(render).catch(function() {
    showEmptyState();
  });

  function showEmptyState() {
    ['sa-leaderboard', 'sa-most-viewed', 'sa-most-used', 'sa-searches'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el && !el.innerHTML.trim()) el.innerHTML = '<div class="siteana-empty">📊 No data yet — check back after a few days of traffic.</div>';
    });
    // Hide chart canvases when empty
    ['sa-trend-chart', 'sa-activity-chart'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.parentElement.innerHTML = '<div class="siteana-empty">📈 Charts will appear once data starts flowing.</div>';
    });
  }

  function render(data) {
    // Stats bar — use GA4 data if available
    var ga4 = data.ga4;
    var gsc = data.gsc;
    var custom = data.custom;
    var el;

    if (ga4) {
      el = document.getElementById('sa-total-views');
      if (el) el.textContent = roundDisplay(ga4.totals.views);
      el = document.getElementById('sa-total-actions');
      if (el) el.textContent = roundDisplay(ga4.totals.users);
      el = document.getElementById('sa-today-views');
      if (el) el.textContent = roundDisplay(ga4.today.views);
      var actionLabel = document.querySelectorAll('.siteana-stat-label')[1];
      if (actionLabel) actionLabel.textContent = 'Unique Users';
    } else {
      el = document.getElementById('sa-total-views');
      if (el) el.textContent = '—';
      el = document.getElementById('sa-total-actions');
      if (el) el.textContent = '—';
      el = document.getElementById('sa-today-views');
      if (el) el.textContent = '—';
    }

    var leaderboard = ga4 ? ga4.leaderboard : (custom && custom.leaderboard ? custom.leaderboard.map(function(t) {
      return { tool: t.tool, views: t.views, users: t.actions, total: t.views + t.actions };
    }) : []);

    var hasData = leaderboard && leaderboard.length > 0;

    if (hasData) {
      renderTrendChart(ga4 ? ga4.trend : null);
      renderActivityChart(leaderboard);
      renderLeaderboard(leaderboard);
      renderTopList('sa-most-viewed', leaderboard, 'views');
      renderTopList('sa-most-used', leaderboard, 'users');
    } else {
      showEmptyState();
    }

    // GA4 extras
    if (ga4) {
      renderExtraSection('sa-countries', ga4.countries, 'country', 'users', '🌍 Top Countries');
      renderExtraSection('sa-devices', ga4.devices, 'device', 'users', '📱 Devices');
      renderExtraSection('sa-sources', ga4.sources, 'source', 'sessions', '🔗 Traffic Sources');
    }

    // Search queries — prefer GSC
    if (gsc && gsc.queries && gsc.queries.length > 0) {
      renderGSCQueries(gsc.queries);
    } else if (custom && custom.top_searches && custom.top_searches.length > 0) {
      renderSearches(custom.top_searches);
    } else {
      var sc = document.getElementById('sa-searches');
      if (sc) sc.innerHTML = '<div class="siteana-empty">🔍 Search data will appear once Google indexes the site more deeply.</div>';
    }
  }

  function renderTrendChart(trend) {
    var ctx = document.getElementById('sa-trend-chart');
    if (!ctx || !trend || !trend.length) return;
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: trend.map(function(d) { return d.date.slice(5); }), // MM-DD
        datasets: [
          {
            label: 'Views',
            data: trend.map(function(d) { return d.views; }),
            borderColor: '#64748B',
            backgroundColor: 'rgba(6,182,212,0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 3
          },
          {
            label: 'Actions',
            data: trend.map(function(d) { return d.actions; }),
            borderColor: '#ff66ff',
            backgroundColor: 'rgba(255,102,255,0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: 'rgba(255,255,255,0.6)', font: { family: 'Inter' } } } },
        scales: {
          x: { ticks: { color: 'rgba(255,255,255,0.4)' }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { beginAtZero: true, ticks: { color: 'rgba(255,255,255,0.4)' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  }

  function renderActivityChart(leaderboard) {
    var ctx = document.getElementById('sa-activity-chart');
    if (!ctx || !leaderboard || !leaderboard.length) return;
    var top8 = leaderboard.slice(0, 8);
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: top8.map(function(t) { return getToolInfo(t.tool).name; }),
        datasets: [{
          data: top8.map(function(t) { return t.total; }),
          backgroundColor: top8.map(function(t) { return getToolInfo(t.tool).color; }),
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: 'rgba(255,255,255,0.6)', font: { family: 'Inter', size: 11 }, padding: 8 }
          }
        }
      }
    });
  }

  function renderLeaderboard(leaderboard) {
    var container = document.getElementById('sa-leaderboard');
    if (!container || !leaderboard) return;
    if (!leaderboard.length) {
      container.innerHTML = '<div class="siteana-empty">No data yet</div>';
      return;
    }
    var maxTotal = leaderboard[0].total || 1;
    container.innerHTML = leaderboard.map(function(item, i) {
      var info = getToolInfo(item.tool);
      var pct = Math.round((item.total / maxTotal) * 100);
      var rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
      return '<div class="siteana-lb-item">'
        + '<span class="siteana-lb-rank ' + rankClass + '">' + (i + 1) + '</span>'
        + '<div class="siteana-lb-info"><span class="siteana-lb-name">' + esc(info.emoji + ' ' + info.name) + '</span>'
        + '<span class="siteana-lb-count">' + esc(roundDisplay(item.views)) + ' views · ' + esc(roundDisplay(item.actions)) + ' actions</span></div>'
        + '<div class="siteana-lb-bar-wrap"><div class="siteana-lb-bar" style="width:' + pct + '%;background:' + info.color + '"></div></div>'
        + '<span class="siteana-lb-total">' + esc(roundDisplay(item.total)) + '</span>'
        + '</div>';
    }).join('');
  }

  function renderTopList(containerId, leaderboard, field) {
    var container = document.getElementById(containerId);
    if (!container || !leaderboard) return;
    var sorted = leaderboard.filter(function(t) { return t[field] > 0; })
      .sort(function(a, b) { return b[field] - a[field]; })
      .slice(0, 5);
    if (!sorted.length) {
      container.innerHTML = '<div class="siteana-empty">No data yet</div>';
      return;
    }
    container.innerHTML = sorted.map(function(item, i) {
      var info = getToolInfo(item.tool);
      return '<div class="siteana-lb-item">'
        + '<span class="siteana-lb-rank">' + (i + 1) + '</span>'
        + '<span class="siteana-lb-name">' + esc(info.emoji + ' ' + info.name) + '</span>'
        + '<span class="siteana-lb-total">' + esc(roundDisplay(item[field])) + '</span>'
        + '</div>';
    }).join('');
  }

  function renderSearches(searches) {
    var container = document.getElementById('sa-searches');
    if (!container) return;
    if (!searches || !searches.length) {
      container.innerHTML = '<div class="siteana-empty">No search queries recorded yet. Data will appear once visitors start using the search.</div>';
      return;
    }
    container.innerHTML = searches.map(function(s) {
      return '<div class="siteana-search-item">'
        + '<span class="siteana-search-query">"' + esc(s.query) + '"</span>'
        + '<span class="siteana-search-count">' + s.count + '×</span>'
        + '</div>';
    }).join('');
  }

  function renderGSCQueries(queries) {
    var container = document.getElementById('sa-searches');
    if (!container || !queries.length) return;
    // Update title to indicate this is real Google Search data
    var title = container.parentElement.querySelector('.siteana-card-title');
    if (title) title.textContent = '🔍 Google Search Queries';
    var hint = container.parentElement.querySelector('.siteana-hint');
    if (hint) hint.textContent = 'What people search on Google to find this site (last 30 days)';

    container.innerHTML = queries.map(function(q) {
      return '<div class="siteana-search-item">'
        + '<span class="siteana-search-query">"' + esc(q.query) + '"</span>'
        + '<span class="siteana-search-count">' + q.clicks + ' clicks · ' + q.impressions + ' imp · ' + q.ctr + '% CTR</span>'
        + '</div>';
    }).join('');
  }

  function renderExtraSection(containerId, items, labelKey, valueKey, title) {
    var container = document.getElementById(containerId);
    if (!container || !items || !items.length) return;
    var max = items[0][valueKey] || 1;
    container.innerHTML = items.map(function(item) {
      var pct = Math.round((item[valueKey] / max) * 100);
      return '<div class="siteana-lb-item">'
        + '<span class="siteana-lb-name">' + esc(item[labelKey]) + '</span>'
        + '<div class="siteana-lb-bar-wrap"><div class="siteana-lb-bar" style="width:' + pct + '%;background:#64748B"></div></div>'
        + '<span class="siteana-lb-total">' + item[valueKey] + '</span>'
        + '</div>';
    }).join('');
  }

  // Auto-refresh every 5 minutes
  setInterval(function() {
    fetch(API).then(function(r) { return r.json(); }).then(render).catch(function(){});
  }, 300000);
})();
