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

  // Loading spinner
  var SPINNER = '<div class="cc-loading"><div class="cc-spinner"></div><span>Loading…</span></div>';
  function showLoading(ids) { ids.forEach(function(id) { var el = document.getElementById(id); if (el && !el.innerHTML.trim()) el.innerHTML = SPINNER; }); }

  // Fetch with timeout (15s default)
  function fetchWithTimeout(url, opts, timeoutMs) {
    timeoutMs = timeoutMs || 15000;
    var controller = new AbortController();
    var timer = setTimeout(function() { controller.abort(); }, timeoutMs);
    opts = opts || {};
    opts.signal = controller.signal;
    return fetch(url, opts).finally(function() { clearTimeout(timer); });
  }

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

    showLoading(['cc-sales-kpis', 'cc-sales-table']);
    fetchWithTimeout('/guided/api/cc/sales' + params, { credentials: 'include' }, 20000)
      .then(function(r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function(data) { salesData = data; renderSales(data); })
      .catch(function(e) {
        var msg = e.name === 'AbortError' ? 'Request timed out — try a shorter date range' : 'Failed to load: ' + e.message;
        var el = document.getElementById('cc-sales-table');
        if (el) el.innerHTML = '<p class="cc-err">' + esc(msg) + '</p>';
      });
  }

  function renderSales(data) {
    if (!data) return;
    var s = data.summary;

    // KPIs with month-over-month comparison
    var monthChange = s.lastMonthRevenue > 0 ? Math.round(((s.thisMonthRevenue - s.lastMonthRevenue) / s.lastMonthRevenue) * 100) : null;
    var countChange = s.lastMonthCount > 0 ? Math.round(((s.thisMonthCount - s.lastMonthCount) / s.lastMonthCount) * 100) : null;
    renderKPIs('cc-sales-kpis', [
      { value: money(s.totalRevenue), label: 'Total Revenue' },
      { value: money(s.thisMonthRevenue), label: 'This Month', change: monthChange },
      { value: numFmt(s.thisMonthCount), label: 'Sales This Month', change: countChange },
      { value: money(s.avgOrder), label: 'Avg Order' }
    ]);

    // Revenue projection
    renderProjection(data);

    // Alerts
    renderAlerts(data);

    // Revenue chart
    renderRevenueChart(data.revenueByDay);

    // Revenue by type
    renderRevenueByType(data.revenueByType);

    // Revenue by cert
    renderRevenueByCert(data.revenueByCert);

    // Activation funnel
    renderActivationFunnel(data.activationFunnel);

    // Geo revenue
    renderGeoRevenue(data.revenueByCurrency);

    // Customer intelligence
    renderCustomers(data.customers);

    // Marketing export
    renderMarketing(data.customers);

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

  // ── Revenue Projection ──
  function renderProjection(data) {
    var el = document.getElementById('cc-sales-projection');
    if (!el || !data.revenueByDay) return;

    var now = new Date();
    var daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    var dayOfMonth = now.getDate();

    // Get this month's daily revenue
    var monthPrefix = now.toISOString().slice(0, 7); // "2026-04"
    var monthDays = data.revenueByDay.filter(function(d) { return d.date.indexOf(monthPrefix) === 0; });
    var monthTotal = monthDays.reduce(function(s, d) { return s + d.amount; }, 0);
    var dailyRate = dayOfMonth > 0 ? monthTotal / dayOfMonth : 0;
    var projected = Math.round(dailyRate * daysInMonth * 100) / 100;

    // Best day this month
    var bestDay = monthDays.reduce(function(best, d) { return d.amount > (best ? best.amount : 0) ? d : best; }, null);
    var salesDays = monthDays.filter(function(d) { return d.amount > 0; }).length;
    var zeroDays = dayOfMonth - salesDays;

    var html = '<div class="cc-projection">';
    html += '<div class="cc-proj-main"><span class="cc-proj-amount">' + money(projected) + '</span>';
    html += '<span class="cc-proj-label">Projected this month</span></div>';
    html += '<div class="cc-proj-details">';
    html += '<span>' + money(dailyRate) + '/day avg</span>';
    html += '<span>' + salesDays + ' sale days / ' + zeroDays + ' zero days</span>';
    if (bestDay) html += '<span>Best: ' + bestDay.date.slice(5) + ' (' + money(bestDay.amount) + ')</span>';
    html += '</div>';

    // Progress bar: actual vs projected
    var pctDone = projected > 0 ? Math.min(100, Math.round((monthTotal / projected) * 100)) : 0;
    html += '<div class="cc-proj-progress"><div class="cc-proj-progress-fill" style="width:' + pctDone + '%"></div></div>';
    html += '<div class="cc-proj-footer"><span>' + money(monthTotal) + ' earned</span><span>' + pctDone + '% of projection</span><span>' + (daysInMonth - dayOfMonth) + ' days left</span></div>';
    html += '</div>';
    el.innerHTML = html;
  }

  // ── Alerts ──
  function renderAlerts(data) {
    var section = document.getElementById('cc-sales-alerts-section');
    var el = document.getElementById('cc-sales-alerts');
    if (!el || !section) return;

    var alerts = [];

    // Check for email delivery issues
    if (data.sales) {
      var noEmail = data.sales.filter(function(s) { return s.emailStatus === 'no_record'; });
      if (noEmail.length > 0) {
        alerts.push({ type: 'warning', text: noEmail.length + ' sale(s) with no email delivery record — check Resend logs', icon: '📧' });
      }
    }

    // Check for zero-sale streaks
    if (data.revenueByDay) {
      var recent = data.revenueByDay.slice(-7);
      var zeroStreak = 0;
      for (var i = recent.length - 1; i >= 0; i--) {
        if (recent[i].count === 0) zeroStreak++;
        else break;
      }
      if (zeroStreak >= 3) {
        alerts.push({ type: 'danger', text: zeroStreak + '-day zero-sale streak — consider promotion or outreach', icon: '📉' });
      }
    }

    // Revenue anomaly: today much lower than average
    if (data.revenueByDay && data.revenueByDay.length > 7) {
      var avg7d = data.revenueByDay.slice(-8, -1).reduce(function(s, d) { return s + d.amount; }, 0) / 7;
      var today = data.revenueByDay[data.revenueByDay.length - 1];
      if (avg7d > 0 && today && today.amount < avg7d * 0.3 && new Date().getHours() > 18) {
        alerts.push({ type: 'info', text: 'Today\'s revenue (' + money(today.amount) + ') is well below 7-day average (' + money(avg7d) + ')', icon: '💡' });
      }
    }

    // Dormant keys (purchased but never activated)
    if (data.dormantKeys && data.dormantKeys.length > 0) {
      var dormant = data.dormantKeys;
      alerts.push({ type: 'danger', text: dormant.length + ' key(s) never activated — customers paid but aren\'t using the product. Oldest: ' + dormant[0].daysSince + ' days ago (' + dormant[0].email + ', ' + dormant[0].certCode.toUpperCase() + ')', icon: '🔑' });
    }

    // No alerts = good news
    if (!alerts.length) {
      section.style.display = 'none';
      return;
    }

    section.style.display = '';
    el.innerHTML = alerts.map(function(a) {
      return '<div class="cc-alert cc-alert-' + a.type + '"><span class="cc-alert-icon">' + a.icon + '</span><span>' + esc(a.text) + '</span></div>';
    }).join('');
  }

  // ── Activation Funnel ──
  function renderActivationFunnel(funnel) {
    var el = document.getElementById('cc-activation-funnel');
    if (!el || !funnel) return;
    var steps = [
      { label: 'Keys Generated', value: funnel.generated, icon: '🔑' },
      { label: 'Emails Sent', value: funnel.emailed, icon: '📧' },
      { label: 'Keys Activated', value: funnel.activated, icon: '✅' }
    ];
    var maxVal = Math.max.apply(null, steps.map(function(s) { return s.value; })) || 1;
    el.innerHTML = steps.map(function(step, i) {
      var w = Math.max(25, Math.round((step.value / maxVal) * 100));
      var rate = i > 0 && steps[i - 1].value > 0 ? ' (' + pct(step.value, steps[i - 1].value) + '%)' : '';
      return '<div class="cc-mini-funnel-step"><span class="cc-mini-funnel-icon">' + step.icon + '</span><div class="cc-mini-funnel-bar" style="width:' + w + '%"><span>' + numFmt(step.value) + '</span></div><span class="cc-mini-funnel-label">' + step.label + rate + '</span></div>';
    }).join('');
  }

  // ── Geo Revenue ──
  function renderGeoRevenue(byCurrency) {
    var el = document.getElementById('cc-geo-revenue');
    if (!el || !byCurrency) return;
    var currencies = Object.keys(byCurrency).sort(function(a, b) { return byCurrency[b] - byCurrency[a]; });
    if (!currencies.length) { el.innerHTML = '<p class="cc-muted">No data</p>'; return; }
    var total = currencies.reduce(function(s, c) { return s + byCurrency[c]; }, 0);
    el.innerHTML = currencies.map(function(c) {
      var w = total > 0 ? Math.round((byCurrency[c] / total) * 100) : 0;
      return '<div class="cc-bar-item"><div class="cc-bar-head"><span>' + esc(c) + '</span><span>' + money(byCurrency[c]) + ' (' + w + '%)</span></div><div class="cc-bar-track"><div class="cc-bar-fill" style="width:' + w + '%"></div></div></div>';
    }).join('');
  }

  // ── Customer Intelligence ──
  function renderCustomers(customers) {
    var el = document.getElementById('cc-customers');
    if (!el || !customers) return;
    var html = '<div class="cc-cust-stats">';
    html += '<div class="cc-cust-stat"><span class="cc-cust-num">' + numFmt(customers.total) + '</span> unique customers</div>';
    html += '<div class="cc-cust-stat"><span class="cc-cust-num">' + numFmt(customers.repeat) + '</span> repeat buyers';
    if (customers.total > 0) html += ' (' + pct(customers.repeat, customers.total) + '%)';
    html += '</div></div>';
    if (customers.repeatList && customers.repeatList.length) {
      html += '<div class="cc-cust-repeat"><strong>Upgrade paths:</strong>';
      customers.repeatList.forEach(function(c) {
        html += '<div class="cc-cust-row"><span>' + esc(c.email) + '</span><span>' + c.purchases + ' purchases · ' + money(c.totalSpent) + ' · ' + c.types.join(' → ') + '</span></div>';
      });
      html += '</div>';
    }
    el.innerHTML = html;
  }

  // ── Marketing Export ──
  function renderMarketing(customers) {
    var el = document.getElementById('cc-marketing');
    if (!el || !customers) return;
    var html = '<div class="cc-cust-stats">';
    html += '<div class="cc-cust-stat"><span class="cc-cust-num">' + numFmt(customers.marketingConsent) + '</span> opted in to marketing</div>';
    html += '</div>';
    html += '<button class="cc-export-btn cc-marketing-btn" id="cc-export-marketing">Export Marketing List (CSV)</button>';
    el.innerHTML = html;
    var btn = document.getElementById('cc-export-marketing');
    if (btn) btn.addEventListener('click', exportMarketingCSV);
  }

  function exportMarketingCSV() {
    if (!salesData || !salesData.sales) return;
    var consented = salesData.sales.filter(function(s) { return s.marketingConsent; });
    var seen = {};
    var unique = consented.filter(function(s) { if (seen[s.fullEmail]) return false; seen[s.fullEmail] = true; return true; });
    var header = 'Email,Name,Cert,Product Type,Purchase Date\n';
    var rows = unique.map(function(s) {
      return [s.fullEmail, '"' + (s.customerName || '') + '"', s.certCode, s.productType, s.date.slice(0, 10)].join(',');
    }).join('\n');
    var blob = new Blob([header + rows], { type: 'text/csv' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'guided-marketing-list-' + new Date().toISOString().slice(0, 10) + '.csv';
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

    showLoading(['cc-lic-kpis', 'cc-lic-table']);
    fetchWithTimeout('/guided/api/cc/licences' + params, { credentials: 'include' }, 20000)
      .then(function(r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function(data) { licenceData = data; renderLicences(data); })
      .catch(function(e) {
        var msg = e.name === 'AbortError' ? 'Request timed out — KV may have many records' : 'Failed to load: ' + e.message;
        var el = document.getElementById('cc-lic-table');
        if (el) el.innerHTML = '<p class="cc-err">' + esc(msg) + '</p>';
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
      var statusText = l.status;
      // Highlight expiring soon (within 30 days)
      if (l.status === 'active') {
        var daysLeft = Math.round((new Date(l.expiresAt).getTime() - Date.now()) / 86400000);
        if (daysLeft <= 30) { statusText = daysLeft + 'd left'; statusColor = 'var(--cc-amber)'; }
      }
      var row = '<div class="cc-table-row cc-expandable" data-lic-idx="' + i + '">'
        + '<span class="cc-td cc-th-key-wide cc-mono">' + esc(l.key) + '</span>'
        + '<span class="cc-td cc-th-name" title="' + esc(l.email) + '">' + esc(l.customerName || l.email) + '</span>'
        + '<span class="cc-td cc-th-cert cc-cert-badge">' + esc(l.certCode.toUpperCase()) + '</span>'
        + '<span class="cc-td cc-th-type">' + esc(TYPE_LABELS[l.productType] || l.productType) + '</span>'
        + '<span class="cc-td cc-th-date">' + fmtDate(l.createdAt) + '</span>'
        + '<span class="cc-td cc-th-date">' + fmtDate(l.expiresAt) + '</span>'
        + '<span class="cc-td cc-th-act">' + l.activations + '/' + l.maxActivations + '</span>'
        + '<span class="cc-td cc-th-status" style="color:' + statusColor + '">' + statusText + '</span>'
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

    showLoading(['cc-analytics-kpis', 'cc-cert-table', 'cc-funnel']);
    fetchWithTimeout('/guided/api/cc/analytics' + params, { credentials: 'include' }, 20000)
      .then(function(r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function(data) { analyticsData = data; renderAnalytics(data); })
      .catch(function(e) {
        var msg = e.name === 'AbortError' ? 'Request timed out — try a shorter date range' : 'Failed to load: ' + e.message;
        var el = document.getElementById('cc-cert-table');
        if (el) el.innerHTML = '<p class="cc-err">' + esc(msg) + '</p>';
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
    fetchGuidedTraffic(); // GA4 data from main site stats
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

  // ── GA4 Traffic for Guided pages ──
  var guidedTrafficLoaded = false;
  function fetchGuidedTraffic() {
    if (guidedTrafficLoaded) return;
    guidedTrafficLoaded = true;
    var el = document.getElementById('cc-guided-traffic');
    if (!el) return;
    el.innerHTML = SPINNER;

    fetchWithTimeout('/api/stats?range=30d', {}, 10000)
      .then(function(r) { return r.json(); })
      .then(function(data) { renderGuidedTraffic(data, el); })
      .catch(function() { el.innerHTML = '<p class="cc-muted">GA4 data unavailable</p>'; });
  }

  function renderGuidedTraffic(data, el) {
    if (!data || !data.ga4) { el.innerHTML = '<p class="cc-muted">No GA4 data</p>'; return; }
    var ga4 = data.ga4;

    // Extract /guided/ pages from GA4 page data
    var guidedPages = [];
    if (ga4.pages) {
      guidedPages = ga4.pages.filter(function(p) { return p.path && p.path.indexOf('/guided/') === 0; });
    }

    var totalViews = guidedPages.reduce(function(s, p) { return s + (p.views || 0); }, 0);
    var totalUsers = guidedPages.reduce(function(s, p) { return s + (p.users || 0); }, 0);

    var html = '<div class="cc-traffic-summary">';
    html += '<div class="cc-traffic-stat"><span class="cc-traffic-num">' + numFmt(totalViews) + '</span><span class="cc-traffic-label">Guided Page Views (30d)</span></div>';
    html += '<div class="cc-traffic-stat"><span class="cc-traffic-num">' + numFmt(totalUsers) + '</span><span class="cc-traffic-label">Unique Users</span></div>';

    // Site-wide context
    if (ga4.totals) {
      var pctOfSite = ga4.totals.views > 0 ? pct(totalViews, ga4.totals.views) : 0;
      html += '<div class="cc-traffic-stat"><span class="cc-traffic-num">' + pctOfSite + '%</span><span class="cc-traffic-label">of Total Site Traffic</span></div>';
    }
    html += '</div>';

    // Top guided pages
    if (guidedPages.length) {
      guidedPages.sort(function(a, b) { return (b.views || 0) - (a.views || 0); });
      html += '<div class="cc-traffic-pages">';
      guidedPages.slice(0, 10).forEach(function(p) {
        var name = p.path.replace('/guided/', '').replace(/\/$/, '') || 'home';
        html += '<div class="cc-bar-item"><div class="cc-bar-head"><span>' + esc(name) + '</span><span>' + numFmt(p.views) + ' views</span></div>';
        var w = totalViews > 0 ? Math.max(5, Math.round((p.views / totalViews) * 100)) : 0;
        html += '<div class="cc-bar-track"><div class="cc-bar-fill" style="width:' + w + '%"></div></div></div>';
      });
      html += '</div>';
    } else {
      html += '<p class="cc-muted">No /guided/ pages found in GA4 data</p>';
    }

    el.innerHTML = html;
  }

  // ══════════════════════════════════════════════════════════
  // ── KO-FI & TOTAL REVENUE TABS ──
  // ══════════════════════════════════════════════════════════

  var revenueData = null;
  var _kofiChart = null;
  var _totalChart = null;

  function fetchRevenue() {
    showLoading(['cc-kofi-kpis', 'cc-total-kpis']);
    fetchWithTimeout('/guided/api/cc/revenue?days=730', { credentials: 'include' }, 25000)
      .then(function(r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function(data) { revenueData = data; renderKofi(data); renderTotalRevenue(data); })
      .catch(function(e) {
        var msg = e.name === 'AbortError' ? 'Request timed out' : 'Failed: ' + e.message;
        ['cc-kofi-kpis', 'cc-total-kpis'].forEach(function(id) {
          var el = document.getElementById(id); if (el) el.innerHTML = '<p class="cc-err">' + esc(msg) + '</p>';
        });
      });
  }

  function renderKofi(data) {
    if (!data) return;
    var s = data.summary;

    renderKPIs('cc-kofi-kpis', [
      { value: money(s.kofiRevenue), label: 'Ko-fi Total' },
      { value: money(s.kofiOneTimeRevenue), label: 'Downloads & Tips' },
      { value: money(s.kofiMembershipRevenue), label: 'Memberships' },
      { value: numFmt(s.kofiCount), label: 'Transactions' }
    ]);

    // Ko-fi daily chart
    renderKofiChart(data.kofiByDay);

    // Price tiers
    var tierEl = document.getElementById('cc-kofi-tiers');
    if (tierEl && data.kofiTiers) {
      var maxTier = data.kofiTiers.length ? data.kofiTiers[0].total : 1;
      tierEl.innerHTML = data.kofiTiers.map(function(t) {
        var w = Math.max(10, Math.round((t.total / maxTier) * 100));
        return '<div class="cc-bar-item"><div class="cc-bar-head"><span>$' + t.amount + ' tier</span><span>' + t.count + ' sales · ' + money(t.total) + '</span></div><div class="cc-bar-track"><div class="cc-bar-fill" style="width:' + w + '%"></div></div></div>';
      }).join('');
    }

    // Products (from webhook enrichment)
    var prodEl = document.getElementById('cc-kofi-products');
    if (prodEl) {
      if (data.kofiProducts && data.kofiProducts.length) {
        prodEl.innerHTML = data.kofiProducts.map(function(p) {
          return '<div class="cc-bar-item"><div class="cc-bar-head"><span>' + esc(p.name) + '</span><span>' + p.count + ' · ' + money(p.revenue) + '</span></div></div>';
        }).join('');
      } else {
        prodEl.innerHTML = '<p class="cc-muted">No webhook data yet — set webhook URL in Ko-fi settings to:<br><code>https://www.aguidetocloud.com/guided/api/kofi/webhook</code></p>';
      }
    }

    // Monthly breakdown
    renderKofiMonthly(data.months);
  }

  function renderKofiChart(byDay) {
    var ctx = document.getElementById('cc-kofi-chart');
    if (!ctx || !byDay || !byDay.length) return;
    if (_kofiChart) { _kofiChart.destroy(); _kofiChart = null; }

    // Aggregate to weekly for readability if > 60 days
    var chartData = byDay;
    if (byDay.length > 60) {
      var weekly = {};
      byDay.forEach(function(d) {
        var dt = new Date(d.date);
        var weekStart = new Date(dt); weekStart.setDate(dt.getDate() - dt.getDay());
        var wk = weekStart.toISOString().slice(0, 10);
        if (!weekly[wk]) weekly[wk] = { date: wk, amount: 0 };
        weekly[wk].amount += d.amount;
      });
      chartData = Object.values(weekly);
    }

    _kofiChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: chartData.map(function(d) { return d.date.slice(2, 10); }),
        datasets: [{
          data: chartData.map(function(d) { return d.amount; }),
          backgroundColor: 'rgba(255,95,31,0.5)', borderColor: 'rgba(255,95,31,1)',
          borderWidth: 1, borderRadius: 2
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: function(c) { return '$' + c.parsed.y.toFixed(2); } } } },
        scales: { x: { ticks: { color: 'var(--text-muted)', maxTicksLimit: 12 }, grid: { display: false } }, y: { beginAtZero: true, ticks: { color: 'var(--text-muted)', callback: function(v) { return '$' + v; } }, grid: { color: 'rgba(128,128,128,0.1)' } } }
      }
    });
  }

  function renderKofiMonthly(months) {
    var el = document.getElementById('cc-kofi-monthly');
    if (!el || !months) return;
    var kofiMonths = months.filter(function(m) { return m.kofi > 0 || m.membership > 0; });
    if (!kofiMonths.length) { el.innerHTML = '<p class="cc-muted">No monthly data</p>'; return; }

    var html = '<div class="cc-table"><div class="cc-table-header"><span class="cc-th" style="width:80px">Month</span><span class="cc-th cc-th-num">Downloads</span><span class="cc-th cc-th-num">Memberships</span><span class="cc-th cc-th-num">Total</span></div>';
    kofiMonths.reverse().forEach(function(m) {
      html += '<div class="cc-table-row" style="cursor:default"><span class="cc-td" style="width:80px">' + m.month + '</span><span class="cc-td cc-th-num">' + money(m.kofi) + '</span><span class="cc-td cc-th-num">' + money(m.membership) + '</span><span class="cc-td cc-th-num" style="font-weight:700">' + money(m.kofi + m.membership) + '</span></div>';
    });
    html += '</div>';
    el.innerHTML = html;
  }

  // ── Total Revenue ──
  function renderTotalRevenue(data) {
    if (!data) return;
    var s = data.summary;

    var kofiPct = s.totalRevenue > 0 ? Math.round((s.kofiRevenue / s.totalRevenue) * 100) : 0;
    var guidedPct = s.totalRevenue > 0 ? Math.round((s.guidedRevenue / s.totalRevenue) * 100) : 0;

    renderKPIs('cc-total-kpis', [
      { value: money(s.totalRevenue), label: 'All-Time Revenue' },
      { value: money(s.kofiRevenue), label: 'Ko-fi (' + kofiPct + '%)' },
      { value: money(s.guidedRevenue), label: 'Guided (' + guidedPct + '%)' },
      { value: numFmt(s.kofiCount + s.guidedCount), label: 'Total Sales' }
    ]);

    // Revenue split bars
    var splitEl = document.getElementById('cc-revenue-split');
    if (splitEl) {
      var sources = [
        { name: '☕ Ko-fi Downloads & Tips', amount: s.kofiOneTimeRevenue, color: 'rgba(255,95,31,0.7)' },
        { name: '☕ Ko-fi Memberships', amount: s.kofiMembershipRevenue, color: 'rgba(255,95,31,0.4)' },
        { name: '🎓 Guided Sales', amount: s.guidedRevenue, color: 'rgba(99,102,241,0.7)' }
      ];
      if (s.testRevenue > 0) sources.push({ name: '🧪 Test Purchases', amount: s.testRevenue, color: 'rgba(128,128,128,0.3)' });
      var maxAmt = Math.max.apply(null, sources.map(function(s) { return s.amount; })) || 1;
      splitEl.innerHTML = sources.map(function(src) {
        var w = Math.max(5, Math.round((src.amount / maxAmt) * 100));
        var pctOfTotal = s.totalRevenue > 0 ? pct(src.amount, s.totalRevenue + s.testRevenue) : 0;
        return '<div class="cc-bar-item"><div class="cc-bar-head"><span>' + src.name + '</span><span>' + money(src.amount) + ' (' + pctOfTotal + '%)</span></div><div class="cc-bar-track"><div class="cc-bar-fill" style="width:' + w + '%;background:' + src.color + '"></div></div></div>';
      }).join('');
    }

    // Stacked monthly chart
    renderTotalChart(data.months);

    // Monthly table
    renderMonthlyTable(data.months);
  }

  function renderTotalChart(months) {
    var ctx = document.getElementById('cc-total-chart');
    if (!ctx || !months || !months.length) return;
    if (_totalChart) { _totalChart.destroy(); _totalChart = null; }

    _totalChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months.map(function(m) { return m.month; }),
        datasets: [
          { label: 'Ko-fi', data: months.map(function(m) { return m.kofi; }), backgroundColor: 'rgba(255,95,31,0.6)' },
          { label: 'Membership', data: months.map(function(m) { return m.membership; }), backgroundColor: 'rgba(255,95,31,0.3)' },
          { label: 'Guided', data: months.map(function(m) { return m.guided; }), backgroundColor: 'rgba(99,102,241,0.6)' }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: 'var(--text-muted)', font: { size: 11 } } } },
        scales: {
          x: { stacked: true, ticks: { color: 'var(--text-muted)' }, grid: { display: false } },
          y: { stacked: true, beginAtZero: true, ticks: { color: 'var(--text-muted)', callback: function(v) { return '$' + v; } }, grid: { color: 'rgba(128,128,128,0.1)' } }
        }
      }
    });
  }

  function renderMonthlyTable(months) {
    var el = document.getElementById('cc-monthly-table');
    if (!el || !months) return;
    var html = '<div class="cc-table"><div class="cc-table-header"><span class="cc-th" style="width:80px">Month</span><span class="cc-th cc-th-num">Ko-fi</span><span class="cc-th cc-th-num">Membership</span><span class="cc-th cc-th-num">Guided</span><span class="cc-th cc-th-num">Total</span></div>';
    months.slice().reverse().forEach(function(m) {
      html += '<div class="cc-table-row" style="cursor:default"><span class="cc-td" style="width:80px">' + m.month + '</span><span class="cc-td cc-th-num">' + money(m.kofi) + '</span><span class="cc-td cc-th-num">' + money(m.membership) + '</span><span class="cc-td cc-th-num">' + money(m.guided) + '</span><span class="cc-td cc-th-num" style="font-weight:700">' + money(m.total) + '</span></div>';
    });
    html += '</div>';
    el.innerHTML = html;
  }

  // ══════════════════════════════════════════════════════════
  // ── TAB WIRING ──
  // ══════════════════════════════════════════════════════════

  var guidedViews = {
    'guided-sales': function() { if (!salesData) fetchSales(); },
    'guided-licences': function() { if (!licenceData) fetchLicences(); },
    'guided-analytics': function() { if (!analyticsData) fetchAnalytics(); },
    'guided-kofi': function() { if (!revenueData) fetchRevenue(); else renderKofi(revenueData); },
    'guided-total': function() { if (!revenueData) fetchRevenue(); else renderTotalRevenue(revenueData); }
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
