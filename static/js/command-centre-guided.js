/**
 * Command Centre — Guided BI Dashboard
 * Lazy-loaded when a Guided tab is first accessed.
 * Three tabs: Sales & Revenue, Licences, Product Analytics.
 */
(function() {
  'use strict';

  // ── State ──
  var guidedAuthed = false;
  var salesData = null;
  var licenceData = null;
  var analyticsData = null;
  var _salesChart = null;
  var _quizChart = null;
  var salesRefreshTimer = null;

  // ── Utilities ──
  function esc(s) { var el = document.createElement('span'); el.textContent = s || ''; return el.innerHTML; }
  function numFmt(n) { return typeof n === 'number' ? n.toLocaleString('en-US') : String(n || 0); }
  function money(n, cur) { cur = (cur || 'usd').toUpperCase(); try { return new Intl.NumberFormat('en-US', { style:'currency', currency: cur, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n); } catch(e) { return '$' + n.toFixed(2); } }
  function fmtDate(iso) { if (!iso) return ''; var d = new Date(iso); return d.toLocaleDateString('en-NZ', { day:'numeric', month:'short', year:'numeric' }); }
  function fmtDateTime(iso) { if (!iso) return ''; var d = new Date(iso); return d.toLocaleDateString('en-NZ', { day:'numeric', month:'short' }) + ' ' + d.toLocaleTimeString('en-NZ', { hour:'2-digit', minute:'2-digit' }); }
  function pct(a, b) { return b > 0 ? Math.round((a / b) * 1000) / 10 : 0; }

  var TYPE_LABELS = { cert: 'Cert ($9)', vendor: 'Vendor ($59)', all: 'All Access ($149)' };
  var EMAIL_ICONS = { sent: '✅', no_record: '⚠️', unknown: '❓' };
  var EMAIL_LABELS = { sent: 'Sent', no_record: 'No record', unknown: 'Unknown' };
  var STATUS_COLORS = { active: 'var(--cc-green)', expired: 'var(--cc-red)' };

  // ── Auth ──
  function checkGuidedAuth() {
    return fetch('/guided/api/admin', { credentials: 'include' })
      .then(function(r) { return r.json(); })
      .then(function(d) { guidedAuthed = d.admin; return d.admin; })
      .catch(function() { return false; });
  }

  function showAuthModal(callback) {
    // Try silent auth with stored CC password first
    var storedPwd = null;
    try { storedPwd = sessionStorage.getItem('cc-p'); } catch(e) {}
    if (storedPwd) {
      fetch('/guided/api/admin', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: storedPwd })
      }).then(function(r) { return r.json(); }).then(function(d) {
        if (d.admin) { guidedAuthed = true; if (callback) callback(); }
        else { showAuthPrompt(callback); }
      }).catch(function() { showAuthPrompt(callback); });
      return;
    }
    showAuthPrompt(callback);
  }

  function showAuthPrompt(callback) {
    var modal = document.getElementById('cc-guided-auth');
    var passEl = document.getElementById('cc-guided-pass');
    var btn = document.getElementById('cc-guided-login');
    var errEl = document.getElementById('cc-guided-error');
    if (!modal) return;
    modal.style.display = 'flex';
    if (passEl) setTimeout(function() { passEl.focus(); }, 100);

    function doLogin() {
      if (!passEl) return;
      fetch('/guided/api/admin', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passEl.value })
      }).then(function(r) { return r.json(); }).then(function(d) {
        if (d.admin) {
          guidedAuthed = true;
          modal.style.display = 'none';
          passEl.value = '';
          if (callback) callback();
        } else {
          if (errEl) { errEl.style.display = 'block'; setTimeout(function() { errEl.style.display = 'none'; }, 2000); }
          passEl.value = '';
        }
      }).catch(function() {
        if (errEl) { errEl.style.display = 'block'; setTimeout(function() { errEl.style.display = 'none'; }, 2000); }
      });
    }

    // Clean up old listeners
    var newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', doLogin);

    var newPass = passEl; // keep reference
    newPass.onkeydown = function(ev) { if (ev.key === 'Enter') doLogin(); };
  }

  function requireAuth(callback) {
    if (guidedAuthed) { callback(); return; }
    checkGuidedAuth().then(function(ok) {
      if (ok) callback();
      else showAuthModal(callback);
    });
  }

  // ── KPI Cards ──
  function renderKPIs(containerId, items) {
    var el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = items.map(function(k) {
      var changeHtml = '';
      if (k.change !== undefined && k.change !== null) {
        var cls = k.change > 0 ? 'cc-kpi-up' : k.change < 0 ? 'cc-kpi-down' : '';
        changeHtml = '<span class="cc-kpi-change ' + cls + '">' + (k.change > 0 ? '↑' : k.change < 0 ? '↓' : '→') + ' ' + Math.abs(k.change) + '%</span>';
      }
      return '<div class="cc-kpi"><span class="cc-kpi-value">' + esc(String(k.value)) + '</span><span class="cc-kpi-label">' + esc(k.label) + '</span>' + changeHtml + '</div>';
    }).join('');
  }

  // ══════════════════════════════════════════════════════════
  // ── SALES TAB ──
  // ══════════════════════════════════════════════════════════

  function fetchSales() {
    var days = document.getElementById('cc-sales-days');
    var type = document.getElementById('cc-sales-type');
    var params = '?days=' + (days ? days.value : '30');
    if (type && type.value) params += '&type=' + type.value;

    fetch('/guided/api/cc/sales' + params, { credentials: 'include' })
      .then(function(r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function(data) { salesData = data; renderSales(data); })
      .catch(function(e) {
        var el = document.getElementById('cc-sales-table');
        if (el) el.innerHTML = '<p class="cc-err">Failed to load sales data: ' + esc(e.message) + '</p>';
      });
  }

  function renderSales(data) {
    if (!data) return;
    var s = data.summary;

    // KPIs
    var monthChange = s.lastMonthRevenue > 0 ? Math.round(((s.thisMonthRevenue - s.lastMonthRevenue) / s.lastMonthRevenue) * 100) : null;
    renderKPIs('cc-sales-kpis', [
      { value: money(s.totalRevenue), label: 'Total Revenue' },
      { value: money(s.thisMonthRevenue), label: 'This Month', change: monthChange },
      { value: numFmt(s.salesCount), label: 'Sales' },
      { value: money(s.avgOrder), label: 'Avg Order' }
    ]);

    // Revenue chart
    renderRevenueChart(data.revenueByDay);

    // Revenue by type
    renderRevenueByType(data.revenueByType);

    // Revenue by cert
    renderRevenueByCert(data.revenueByCert);

    // Sales table
    renderSalesTable(data.sales);
  }

  function renderRevenueChart(byDay) {
    var ctx = document.getElementById('cc-sales-chart');
    if (!ctx || !byDay || !byDay.length) return;
    if (_salesChart) { _salesChart.destroy(); _salesChart = null; }

    var labels = byDay.map(function(d) { return d.date.slice(5); });
    var values = byDay.map(function(d) { return d.amount; });

    _salesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: 'rgba(99,102,241,0.5)',
          borderColor: 'rgba(99,102,241,1)',
          borderWidth: 1,
          borderRadius: 3
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: function(c) { return '$' + c.parsed.y.toFixed(2); } } } },
        scales: {
          x: { ticks: { color: 'var(--text-muted)', maxTicksLimit: 10 }, grid: { display: false } },
          y: { beginAtZero: true, ticks: { color: 'var(--text-muted)', callback: function(v) { return '$' + v; } }, grid: { color: 'rgba(128,128,128,0.1)' } }
        }
      }
    });
  }

  function renderRevenueByType(byType) {
    var el = document.getElementById('cc-sales-by-type');
    if (!el || !byType) return;
    var types = Object.keys(byType).sort(function(a, b) { return byType[b] - byType[a]; });
    var total = types.reduce(function(s, t) { return s + byType[t]; }, 0);
    el.innerHTML = types.map(function(t) {
      var w = total > 0 ? Math.round((byType[t] / total) * 100) : 0;
      return '<div class="cc-bar-item"><div class="cc-bar-head"><span>' + esc(TYPE_LABELS[t] || t) + '</span><span>' + money(byType[t]) + '</span></div><div class="cc-bar-track"><div class="cc-bar-fill" style="width:' + w + '%"></div></div></div>';
    }).join('');
  }

  function renderRevenueByCert(byCert) {
    var el = document.getElementById('cc-sales-by-cert');
    if (!el || !byCert) return;
    var top = byCert.slice(0, 8);
    var maxAmt = top.length ? top[0].amount : 1;
    el.innerHTML = top.map(function(c) {
      var w = maxAmt > 0 ? Math.round((c.amount / maxAmt) * 100) : 0;
      return '<div class="cc-bar-item"><div class="cc-bar-head"><span>' + esc(c.cert.toUpperCase()) + ' <small>(' + c.count + ')</small></span><span>' + money(c.amount) + '</span></div><div class="cc-bar-track"><div class="cc-bar-fill" style="width:' + w + '%"></div></div></div>';
    }).join('') || '<p class="cc-muted">No cert-level sales yet</p>';
  }

  function renderSalesTable(sales) {
    var el = document.getElementById('cc-sales-table');
    if (!el) return;
    if (!sales || !sales.length) { el.innerHTML = '<p class="cc-muted">No transactions found</p>'; return; }

    var html = '<div class="cc-table"><div class="cc-table-header"><span class="cc-th cc-th-date">Date</span><span class="cc-th cc-th-name">Customer</span><span class="cc-th cc-th-cert">Cert</span><span class="cc-th cc-th-type">Type</span><span class="cc-th cc-th-amount">Amount</span><span class="cc-th cc-th-key">Key</span><span class="cc-th cc-th-email">Email</span><span class="cc-th cc-th-status">Status</span></div>';

    html += sales.map(function(s, i) {
      var emailIcon = EMAIL_ICONS[s.emailStatus] || '❓';
      var statusColor = new Date(s.keyExpiry) > new Date() ? STATUS_COLORS.active : STATUS_COLORS.expired;
      var statusLabel = new Date(s.keyExpiry) > new Date() ? 'Active' : 'Expired';

      var row = '<div class="cc-table-row cc-expandable" data-idx="' + i + '">'
        + '<span class="cc-td cc-th-date">' + fmtDateTime(s.date) + '</span>'
        + '<span class="cc-td cc-th-name" title="' + esc(s.customerName) + '">' + esc(s.customerName || s.customerEmail) + '</span>'
        + '<span class="cc-td cc-th-cert cc-cert-badge">' + esc(s.certCode.toUpperCase()) + '</span>'
        + '<span class="cc-td cc-th-type">' + esc(TYPE_LABELS[s.productType] || s.productType) + '</span>'
        + '<span class="cc-td cc-th-amount">' + money(s.amount, s.currency) + '</span>'
        + '<span class="cc-td cc-th-key cc-mono">' + esc(s.licenceKey || '—') + '</span>'
        + '<span class="cc-td cc-th-email" title="' + esc(EMAIL_LABELS[s.emailStatus]) + '">' + emailIcon + '</span>'
        + '<span class="cc-td cc-th-status" style="color:' + statusColor + '">' + statusLabel + '</span>'
        + '</div>';

      // Expandable detail
      row += '<div class="cc-expand-detail" id="cc-sale-detail-' + i + '" style="display:none">'
        + '<div class="cc-detail-grid">'
        + '<div><strong>Full Email:</strong> ' + esc(s.fullEmail) + '</div>'
        + '<div><strong>Licence Key:</strong> <code>' + esc(s.licenceKey || 'N/A') + '</code></div>'
        + '<div><strong>Expiry:</strong> ' + fmtDate(s.keyExpiry) + '</div>'
        + '<div><strong>Activations:</strong> ' + s.activations + '/' + s.maxActivations + '</div>'
        + '<div><strong>Payment Intent:</strong> ' + (s.paymentIntent ? '<a href="https://dashboard.stripe.com/payments/' + esc(s.paymentIntent) + '" target="_blank" rel="noopener">' + esc(s.paymentIntent.slice(0, 20)) + '…</a>' : 'N/A') + '</div>'
        + '<div><strong>Email Status:</strong> ' + emailIcon + ' ' + esc(EMAIL_LABELS[s.emailStatus]) + '</div>'
        + '<div><strong>Marketing:</strong> ' + (s.marketingConsent ? '✅ Yes' : '❌ No') + '</div>'
        + '<div><strong>Session:</strong> <code>' + esc(s.id.slice(0, 25)) + '…</code></div>'
        + '</div></div>';

      return row;
    }).join('');

    html += '</div>';
    el.innerHTML = html;

    // Wire expand/collapse
    el.querySelectorAll('.cc-expandable').forEach(function(row) {
      row.addEventListener('click', function() {
        var idx = row.dataset.idx;
        var detail = document.getElementById('cc-sale-detail-' + idx);
        if (detail) {
          var open = detail.style.display !== 'none';
          detail.style.display = open ? 'none' : 'block';
          row.classList.toggle('cc-expanded', !open);
        }
      });
    });
  }

  function exportSalesCSV() {
    if (!salesData || !salesData.sales || !salesData.sales.length) return;
    var header = 'Date,Customer,Email,Cert,Type,Amount,Currency,Licence Key,Expiry,Activations,Email Status,Marketing Consent\n';
    var rows = salesData.sales.map(function(s) {
      return [
        s.date, '"' + (s.customerName || '') + '"', s.fullEmail, s.certCode, s.productType,
        s.amount, s.currency, s.licenceKey || '', s.keyExpiry || '',
        s.activations + '/' + s.maxActivations, s.emailStatus, s.marketingConsent ? 'yes' : 'no'
      ].join(',');
    }).join('\n');
    var blob = new Blob([header + rows], { type: 'text/csv' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'guided-sales-' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
  }

  // ══════════════════════════════════════════════════════════
  // ── LICENCES TAB ──
  // ══════════════════════════════════════════════════════════

  function fetchLicences() {
    var status = document.getElementById('cc-lic-status');
    var search = document.getElementById('cc-lic-search');
    var params = '?status=' + (status ? status.value : 'all');
    if (search && search.value.trim()) params += '&search=' + encodeURIComponent(search.value.trim());

    fetch('/guided/api/cc/licences' + params, { credentials: 'include' })
      .then(function(r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function(data) { licenceData = data; renderLicences(data); })
      .catch(function(e) {
        var el = document.getElementById('cc-lic-table');
        if (el) el.innerHTML = '<p class="cc-err">Failed to load licence data: ' + esc(e.message) + '</p>';
      });
  }

  function renderLicences(data) {
    if (!data) return;
    var s = data.summary;

    renderKPIs('cc-lic-kpis', [
      { value: numFmt(s.total), label: 'Total Issued' },
      { value: numFmt(s.active), label: 'Active' },
      { value: numFmt(s.expired), label: 'Expired' },
      { value: String(s.avgActivations), label: 'Avg Activations' }
    ]);

    var el = document.getElementById('cc-lic-table');
    if (!el) return;
    if (!data.licences || !data.licences.length) { el.innerHTML = '<p class="cc-muted">No licences found</p>'; return; }

    var html = '<div class="cc-table"><div class="cc-table-header"><span class="cc-th cc-th-key-wide">Key</span><span class="cc-th cc-th-name">Customer</span><span class="cc-th cc-th-cert">Cert</span><span class="cc-th cc-th-type">Type</span><span class="cc-th cc-th-date">Created</span><span class="cc-th cc-th-date">Expires</span><span class="cc-th cc-th-act">Uses</span><span class="cc-th cc-th-status">Status</span></div>';

    html += data.licences.map(function(l, i) {
      var statusColor = STATUS_COLORS[l.status];
      var row = '<div class="cc-table-row cc-expandable" data-lic-idx="' + i + '">'
        + '<span class="cc-td cc-th-key-wide cc-mono">' + esc(l.key) + '</span>'
        + '<span class="cc-td cc-th-name" title="' + esc(l.email) + '">' + esc(l.customerName || l.email) + '</span>'
        + '<span class="cc-td cc-th-cert cc-cert-badge">' + esc(l.certCode.toUpperCase()) + '</span>'
        + '<span class="cc-td cc-th-type">' + esc(TYPE_LABELS[l.productType] || l.productType) + '</span>'
        + '<span class="cc-td cc-th-date">' + fmtDate(l.createdAt) + '</span>'
        + '<span class="cc-td cc-th-date">' + fmtDate(l.expiresAt) + '</span>'
        + '<span class="cc-td cc-th-act">' + l.activations + '/' + l.maxActivations + '</span>'
        + '<span class="cc-td cc-th-status" style="color:' + statusColor + '">' + l.status + '</span>'
        + '</div>';

      row += '<div class="cc-expand-detail" id="cc-lic-detail-' + i + '" style="display:none">'
        + '<div class="cc-detail-grid">'
        + '<div><strong>Full Email:</strong> ' + esc(l.fullEmail) + '</div>'
        + '<div><strong>Vendor:</strong> ' + esc(l.vendorSlug || 'N/A') + '</div>'
        + '<div><strong>Amount:</strong> ' + money(l.amountTotal / 100, l.currency) + '</div>'
        + '<div><strong>Stripe Session:</strong> <code>' + esc(l.stripeSessionId.slice(0, 25)) + '…</code></div>'
        + '<div><strong>Email Sent:</strong> ' + (l.resendEmailId ? '✅ Yes' : '⚠️ No record') + '</div>'
        + '<div><strong>Marketing:</strong> ' + (l.marketingConsent ? '✅ Yes' : '❌ No') + '</div>'
        + '</div></div>';

      return row;
    }).join('');

    html += '</div>';
    el.innerHTML = html;

    el.querySelectorAll('.cc-expandable').forEach(function(row) {
      row.addEventListener('click', function() {
        var idx = row.dataset.licIdx;
        var detail = document.getElementById('cc-lic-detail-' + idx);
        if (detail) {
          var open = detail.style.display !== 'none';
          detail.style.display = open ? 'none' : 'block';
          row.classList.toggle('cc-expanded', !open);
        }
      });
    });
  }

  // ══════════════════════════════════════════════════════════
  // ── ANALYTICS TAB ──
  // ══════════════════════════════════════════════════════════

  function fetchAnalytics() {
    var days = document.getElementById('cc-analytics-days');
    var params = '?days=' + (days ? days.value : '30');

    fetch('/guided/api/cc/analytics' + params, { credentials: 'include' })
      .then(function(r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function(data) { analyticsData = data; renderAnalytics(data); })
      .catch(function(e) {
        var el = document.getElementById('cc-cert-table');
        if (el) el.innerHTML = '<p class="cc-err">Failed to load analytics: ' + esc(e.message) + '</p>';
      });
  }

  function renderAnalytics(data) {
    if (!data) return;
    var s = data.summary;

    renderKPIs('cc-analytics-kpis', [
      { value: numFmt(s.totalQuizzes), label: 'Quizzes Taken' },
      { value: s.avgScore > 0 ? s.avgScore + '%' : '—', label: 'Avg Score' },
      { value: s.freePercent + '%', label: 'Free Users' },
      { value: s.conversionRate + '%', label: 'Conversion' }
    ]);

    // Message if using fallback
    var msgSection = document.getElementById('cc-analytics-msg-section');
    var msgEl = document.getElementById('cc-analytics-msg');
    if (data.message && msgEl && msgSection) {
      msgEl.textContent = data.message;
      msgSection.style.display = '';
    } else if (msgSection) {
      msgSection.style.display = 'none';
    }

    renderCertTable(data.certStats);
    renderFunnel(data.funnel);
    renderModeBreakdown(data.modeBreakdown);
    renderQuizTrend(data.dailyQuizzes);
  }

  function renderCertTable(certs) {
    var el = document.getElementById('cc-cert-table');
    if (!el) return;
    if (!certs || !certs.length) { el.innerHTML = '<p class="cc-muted">No cert data available</p>'; return; }

    var html = '<div class="cc-table"><div class="cc-table-header"><span class="cc-th cc-th-cert">Cert</span><span class="cc-th cc-th-num">Views</span><span class="cc-th cc-th-num">Quizzes</span><span class="cc-th cc-th-num">Free</span><span class="cc-th cc-th-num">Paid</span><span class="cc-th cc-th-num">Conv%</span><span class="cc-th cc-th-num">Avg Score</span><span class="cc-th cc-th-num">Avg Time</span></div>';

    html += certs.map(function(c) {
      var timeStr = c.avgTime > 0 ? Math.round(c.avgTime / 60) + 'm' : '—';
      return '<div class="cc-table-row">'
        + '<span class="cc-td cc-th-cert cc-cert-badge">' + esc(c.cert.toUpperCase()) + '</span>'
        + '<span class="cc-td cc-th-num">' + numFmt(c.views) + '</span>'
        + '<span class="cc-td cc-th-num">' + numFmt(c.quizzes) + '</span>'
        + '<span class="cc-td cc-th-num">' + numFmt(c.free) + '</span>'
        + '<span class="cc-td cc-th-num">' + numFmt(c.paid) + '</span>'
        + '<span class="cc-td cc-th-num" style="color:' + (c.conversion > 5 ? 'var(--cc-green)' : 'var(--text-secondary)') + '">' + c.conversion + '%</span>'
        + '<span class="cc-td cc-th-num">' + (c.avgScore > 0 ? c.avgScore + '%' : '—') + '</span>'
        + '<span class="cc-td cc-th-num">' + timeStr + '</span>'
        + '</div>';
    }).join('');

    html += '</div>';
    el.innerHTML = html;
  }

  function renderFunnel(funnel) {
    var el = document.getElementById('cc-funnel');
    if (!el || !funnel) return;

    var steps = [
      { label: 'Page Views', value: funnel.views },
      { label: 'Quiz Starts', value: funnel.starts },
      { label: 'Quiz Completes', value: funnel.completes },
      { label: 'Purchases', value: funnel.purchases }
    ];

    var maxVal = Math.max.apply(null, steps.map(function(s) { return s.value; })) || 1;

    el.innerHTML = steps.map(function(step, i) {
      var w = Math.max(20, Math.round((step.value / maxVal) * 100));
      var convRate = i > 0 && steps[i - 1].value > 0 ? pct(step.value, steps[i - 1].value) : 100;
      var convHtml = i > 0 ? '<span class="cc-funnel-conv">↓ ' + convRate + '%</span>' : '';
      return convHtml + '<div class="cc-funnel-step"><div class="cc-funnel-bar" style="width:' + w + '%"><span class="cc-funnel-label">' + esc(step.label) + '</span><span class="cc-funnel-value">' + numFmt(step.value) + '</span></div></div>';
    }).join('');
  }

  function renderModeBreakdown(modes) {
    var el = document.getElementById('cc-mode-breakdown');
    if (!el || !modes) return;
    var keys = Object.keys(modes);
    if (!keys.length) { el.innerHTML = '<p class="cc-muted">No mode data</p>'; return; }

    var total = keys.reduce(function(s, k) { return s + modes[k].count; }, 0);
    el.innerHTML = keys.map(function(k) {
      var m = modes[k];
      var w = total > 0 ? Math.round((m.count / total) * 100) : 0;
      return '<div class="cc-bar-item"><div class="cc-bar-head"><span>' + esc(k || 'unknown') + '</span><span>' + numFmt(m.count) + ' (' + w + '%) · ' + (m.avgScore > 0 ? m.avgScore + '% avg' : '') + '</span></div><div class="cc-bar-track"><div class="cc-bar-fill" style="width:' + w + '%"></div></div></div>';
    }).join('');
  }

  function renderQuizTrend(daily) {
    var ctx = document.getElementById('cc-quiz-trend');
    if (!ctx || !daily || !daily.length) return;
    if (_quizChart) { _quizChart.destroy(); _quizChart = null; }

    _quizChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: daily.map(function(d) { return d.date.slice(5); }),
        datasets: [{
          data: daily.map(function(d) { return d.count; }),
          borderColor: 'rgba(99,102,241,1)',
          backgroundColor: 'rgba(99,102,241,0.08)',
          fill: true, tension: 0.4, pointRadius: 2, borderWidth: 2
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { display: false }, y: { display: false, beginAtZero: true } }
      }
    });
  }

  // ══════════════════════════════════════════════════════════
  // ── TAB WIRING ──
  // ══════════════════════════════════════════════════════════

  var guidedViews = {
    'guided-sales': function() { if (!salesData) fetchSales(); },
    'guided-licences': function() { if (!licenceData) fetchLicences(); },
    'guided-analytics': function() { if (!analyticsData) fetchAnalytics(); }
  };

  // Listen for view switches
  document.querySelectorAll('.cc-view').forEach(function(btn) {
    if (!btn.dataset.view || btn.dataset.view.indexOf('guided-') !== 0) return;
    btn.addEventListener('click', function() {
      var view = btn.dataset.view;
      requireAuth(function() {
        if (guidedViews[view]) guidedViews[view]();

        // Start auto-refresh for sales
        if (view === 'guided-sales' && !salesRefreshTimer) {
          salesRefreshTimer = setInterval(function() { fetchSales(); }, 60000);
        }
      });
    });
  });

  // Wire filter controls
  var salesDays = document.getElementById('cc-sales-days');
  var salesType = document.getElementById('cc-sales-type');
  var salesCsv = document.getElementById('cc-sales-csv');
  if (salesDays) salesDays.addEventListener('change', function() { salesData = null; fetchSales(); });
  if (salesType) salesType.addEventListener('change', function() { salesData = null; fetchSales(); });
  if (salesCsv) salesCsv.addEventListener('click', exportSalesCSV);

  var licStatus = document.getElementById('cc-lic-status');
  var licSearch = document.getElementById('cc-lic-search');
  if (licStatus) licStatus.addEventListener('change', function() { licenceData = null; fetchLicences(); });
  if (licSearch) {
    var searchTimer;
    licSearch.addEventListener('input', function() {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function() { licenceData = null; fetchLicences(); }, 400);
    });
  }

  var analyticsDays = document.getElementById('cc-analytics-days');
  if (analyticsDays) analyticsDays.addEventListener('change', function() { analyticsData = null; fetchAnalytics(); });

  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    // G for Guided Sales, L for Licences, A for Analytics (only when not conflicting)
  });

  // Auto-load if a Guided tab is already active (e.g., switched before script loaded)
  var activePanel = document.querySelector('.cc-panel.active');
  if (activePanel && activePanel.id && activePanel.id.indexOf('cc-guided-') === 0) {
    var viewName = activePanel.id.replace('cc-', '');
    requireAuth(function() { if (guidedViews[viewName]) guidedViews[viewName](); });
  }

})();
