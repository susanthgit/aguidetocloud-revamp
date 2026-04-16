/* ==================================================================
   AI Cost Calculator v1 — ai-cost-calculator.js
   100% client-side. Zero API calls.
   ================================================================== */

(function () {
  'use strict';

  /* ── DATA (injected from TOML via Hugo template) ──────────── */

  const P = window.__aicostPricing || {};
  const B = window.__aicostBenchmarks || {};
  const T = window.__aicostTokens || {};

  /* Build lookup maps from TOML arrays */
  const PLATFORMS = {};
  (P.platforms || []).forEach(function (p) { PLATFORMS[p.id] = p; });

  const BASE_PLANS = {};
  (P.base_plans || []).forEach(function (p) { BASE_PLANS[p.id] = p; });

  const MODELS = T.models || [];
  const USE_CASES = T.use_cases || [];
  const ACTIONS = (B.actions || []);
  const ADDONS = {};
  (P.addons || []).forEach(function (a) { ADDONS[a.id] = a; });

  const TRAINING = B.training || { self_serve: 50, train_the_trainer: 150, vendor_led: 300, training_hours_per_user: 4, annual_refresher: 25, avg_hourly_productivity_cost: 50 };
  const IMPL = B.implementation || {};
  const GOV = B.governance || {};
  const OPS = B.operations || {};
  const SCENARIOS = B.scenarios || {};
  const ROLLOUTS = B.rollout || {};

  /* ── UTILITIES ─────────────────────────────────────────────── */

  var CURRENCIES = {
    USD: { symbol: '$', rate: 1 },
    GBP: { symbol: '£', rate: 0.79 },
    EUR: { symbol: '€', rate: 0.92 },
    AUD: { symbol: 'A$', rate: 1.55 },
    NZD: { symbol: 'NZ$', rate: 1.70 }
  };

  var CONFIDENCE = { conservative: 1.25, expected: 1.0, optimistic: 0.8 };

  var PROFILES = {
    knowledge: { training: 1.0, ops: 1.0 },
    executive:  { training: 1.3, ops: 0.8 },
    technical:  { training: 0.7, ops: 1.2 },
    mixed:      { training: 1.1, ops: 1.0 }
  };

  var $ = function (id) { return document.getElementById(id); };
  var $q = function (s) { return document.querySelector(s); };
  var $qa = function (s) { return document.querySelectorAll(s); };

  function currSym() { return (CURRENCIES[S.currency] || CURRENCIES.USD).symbol; }
  function currRate() { return (CURRENCIES[S.currency] || CURRENCIES.USD).rate; }

  function fmt(n) {
    if (n == null || isNaN(n)) return currSym() + '0';
    var v = n * currRate();
    if (v < 0) return '-' + currSym() + Math.round(-v).toLocaleString('en-US');
    if (v >= 1e6) return currSym() + (v / 1e6).toFixed(1) + 'M';
    return currSym() + Math.round(v).toLocaleString('en-US');
  }
  function fmtDec(n) { if (n == null || !isFinite(n)) return currSym() + '0.00'; return currSym() + (n * currRate()).toFixed(2); }
  function fmtUSD(n) { if (n == null || isNaN(n)) return '$0'; return '$' + (typeof n === 'number' ? n.toFixed(2) : '0.00'); }
  function fmtK(n) { return n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(Math.round(n)); }
  function pct(n) { return Math.round(n) + '%'; }
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  function getImplBucket(users) {
    if (users < 100) return IMPL.small || {};
    if (users <= 1000) return IMPL.medium || {};
    return IMPL.large || {};
  }

  /* ── SHARED STATE ──────────────────────────────────────────── */

  var S = {
    users: 100,
    plan: 'e3',
    aiTools: ['m365-copilot'],
    rolloutPct: 30,
    training: 'train_the_trainer',
    support: 'internal_only',
    otherCost: 20,
    rolloutPreset: 'phased',
    includeBase: false,
    trainTiming: 'before',
    discount: 0,
    confidenceLevel: 'expected',
    currency: 'USD',
    userProfile: 'knowledge',
    hoursSaved: 2,
    // Computed
    costs: { licensing: 0, implementation: 0, training: 0, governance: 0, operations: 0 },
    year1: 0, year2: 0, year3: 0, total3yr: 0
  };

  /* ── CHARTS ────────────────────────────────────────────────── */

  var _donutChart = null;
  var _timelineChart = null;
  var _crossoverChart = null;

  /* ── TAB SWITCHING ─────────────────────────────────────────── */

  function initTabs() {
    $qa('.aicost-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tab = btn.getAttribute('data-tab');
        $qa('.aicost-tab').forEach(function (b) { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        $qa('.aicost-panel').forEach(function (p) { p.classList.remove('active'); });
        var panel = $('panel-' + tab);
        if (panel) panel.classList.add('active');

        // Lazy-render charts when tabs become visible
        if (tab === 'timeline') renderTimeline();
        if (tab === 'export') { renderScenarios(); renderActionCards(); renderCrossover(); renderBoardBullets(); renderExecSummary(); renderHistoryDelta(); }
        if (tab === 'tokens') renderTokenTable();
        if (tab === 'licence') renderLicenceOptimizer();
      });
    });
  }

  /* ── INPUT SYNC ────────────────────────────────────────────── */

  function syncRange(rangeId, numId) {
    var range = $(rangeId);
    var num = $(numId);
    if (!range || !num) return;
    range.addEventListener('input', function () { num.value = range.value; recalc(); });
    num.addEventListener('input', function () { range.value = num.value; recalc(); });
  }

  function initInputSync() {
    syncRange('in-users-range', 'in-users');
    syncRange('in-rollout-range', 'in-rollout');
    syncRange('tok-queries-range', 'tok-queries');
    syncRange('cpa-actions-range', 'cpa-actions');

    // Plan dropdown
    var planSel = $('in-plan');
    if (planSel) planSel.addEventListener('change', function () { S.plan = planSel.value; updateE7Bundling(); recalc(); });

    // Training radios
    $qa('input[name="training"]').forEach(function (r) {
      r.addEventListener('change', function () {
        S.training = r.value;
        $qa('.aicost-radio-group[aria-label="Training approach"] .aicost-radio').forEach(function (l) { l.classList.remove('selected'); });
        r.closest('.aicost-radio').classList.add('selected');
        recalc();
      });
    });

    // Support radios
    $qa('input[name="support"]').forEach(function (r) {
      r.addEventListener('change', function () {
        S.support = r.value;
        $qa('.aicost-radio-group[aria-label="Implementation support level"] .aicost-radio').forEach(function (l) { l.classList.remove('selected'); });
        r.closest('.aicost-radio').classList.add('selected');
        recalc();
      });
    });

    // AI strategy checkboxes
    var checkGroup = $('ai-strategy-checks');
    if (checkGroup) {
      checkGroup.addEventListener('change', function (e) {
        var cb = e.target;
        if (cb.type !== 'checkbox') return;
        var label = cb.closest('.aicost-check');
        if (cb.checked) label.classList.add('checked');
        else label.classList.remove('checked');

        // Show/hide other cost input
        if (cb.value === 'other') {
          var wrap = $('other-cost-wrap');
          if (wrap) wrap.style.display = cb.checked ? 'block' : 'none';
        }

        readInputs();
        recalc();
      });
    }

    // Other cost input
    var otherCost = $('in-other-cost');
    if (otherCost) otherCost.addEventListener('input', function () { S.otherCost = parseFloat(otherCost.value) || 0; recalc(); });

    // Rollout presets
    var rolloutWrap = $('rollout-presets');
    if (rolloutWrap) {
      rolloutWrap.addEventListener('click', function (e) {
        var btn = e.target.closest('.aicost-preset-btn');
        if (!btn) return;
        rolloutWrap.querySelectorAll('.aicost-preset-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        S.rolloutPreset = btn.getAttribute('data-preset');
        var desc = $('rollout-desc');
        var r = ROLLOUTS[S.rolloutPreset];
        if (desc && r) desc.textContent = r.description || '';
        renderTimeline();
      });
    }

    // Token tab inputs
    ['tok-queries', 'tok-days', 'tok-input-len', 'tok-output-len'].forEach(function (id) {
      var el = $(id);
      if (el) el.addEventListener('input', function () { _activeUseCaseMultiplier = 1; renderTokenTable(); });
      if (el) el.addEventListener('change', function () { _activeUseCaseMultiplier = 1; renderTokenTable(); });
    });

    // Token paste text
    var tokenText = $('token-text');
    if (tokenText) tokenText.addEventListener('input', debounce(function () { renderTokenTable(); }, 300));

    // CPA slider
    var cpa = $('cpa-actions');
    if (cpa) cpa.addEventListener('input', function () { renderActionCards(); renderCrossover(); });
    var cpaRange = $('cpa-actions-range');
    if (cpaRange) cpaRange.addEventListener('input', function () { if (cpa) cpa.value = cpaRange.value; renderActionCards(); renderCrossover(); });

    // Licence optimizer inputs
    var licPlan = $('lic-plan');
    var licUsers = $('lic-users');
    if (licPlan) licPlan.addEventListener('change', function () { renderLicenceOptimizer(); });
    if (licUsers) licUsers.addEventListener('input', function () { renderLicenceOptimizer(); });
    var licAddons = $('lic-addons');
    if (licAddons) licAddons.addEventListener('change', function (e) {
      var cb = e.target;
      if (cb.type !== 'checkbox') return;
      var label = cb.closest('.aicost-check');
      if (cb.checked) label.classList.add('checked');
      else label.classList.remove('checked');
      renderLicenceOptimizer();
    });

    // Category expand/collapse
    $qa('.aicost-category-header').forEach(function (h) {
      h.addEventListener('click', function () {
        h.closest('.aicost-category').classList.toggle('open');
      });
    });

    // Exec summary buttons
    var btnCopy = $('btn-copy-summary');
    if (btnCopy) btnCopy.addEventListener('click', copyExecSummary);
    var btnPrint = $('btn-print');
    if (btnPrint) btnPrint.addEventListener('click', function () { window.print(); });
    var btnShare = $('btn-share');
    if (btnShare) btnShare.addEventListener('click', shareUrl);

    // Org name for exec summary
    var orgName = $('org-name');
    if (orgName) orgName.addEventListener('input', debounce(function () { renderExecSummary(); }, 400));

    // Include base plan toggle
    var includeBase = $('in-include-base');
    if (includeBase) includeBase.addEventListener('change', function () { S.includeBase = includeBase.checked; recalc(); });

    // Currency selector
    var currencyEl = $('in-currency');
    if (currencyEl) currencyEl.addEventListener('change', function () { S.currency = currencyEl.value; recalc(); renderTokenTable(); });

    // Confidence toggle
    $qa('.aicost-conf-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $qa('.aicost-conf-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        S.confidenceLevel = btn.getAttribute('data-conf');
        recalc();
      });
    });

    // Discount slider
    syncRange('in-discount-range', 'in-discount');

    // User profile dropdown
    var profileEl = $('in-profile');
    if (profileEl) profileEl.addEventListener('change', function () { S.userProfile = profileEl.value; recalc(); });

    // Hours saved slider
    var hoursEl = $('in-hours');
    var hoursRange = $('in-hours-range');
    if (hoursRange && hoursEl) {
      hoursRange.addEventListener('input', function () { hoursEl.value = hoursRange.value; S.hoursSaved = parseFloat(hoursRange.value) || 2; recalc(); });
      hoursEl.addEventListener('input', function () { hoursRange.value = hoursEl.value; S.hoursSaved = parseFloat(hoursEl.value) || 2; recalc(); });
    }

    // Board-ready copy
    var btnBullets = $('btn-copy-bullets');
    if (btnBullets) btnBullets.addEventListener('click', copyBoardBullets);

    // Training timing radios (budget timeline)
    $qa('input[name="train-timing"]').forEach(function (r) {
      r.addEventListener('change', function () {
        S.trainTiming = r.value;
        $qa('.aicost-radio-group[aria-label="Training timing relative to rollout"] .aicost-radio').forEach(function (l) { l.classList.remove('selected'); });
        r.closest('.aicost-radio').classList.add('selected');
        renderTimeline();
      });
    });

    // Save to history
    var btnSaveHist = $('btn-save-history');
    if (btnSaveHist) btnSaveHist.addEventListener('click', saveToHistory);
    var btnClearHist = $('btn-clear-history');
    if (btnClearHist) btnClearHist.addEventListener('click', clearHistory);

    // Mobile tab scroll indicator
    var tabsEl = $q('.aicost-tabs');
    if (tabsEl) {
      tabsEl.addEventListener('scroll', function () {
        var atEnd = tabsEl.scrollLeft + tabsEl.clientWidth >= tabsEl.scrollWidth - 10;
        tabsEl.classList.toggle('scrolled-end', atEnd);
      });
    }
  }

  function debounce(fn, ms) {
    var timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(fn, ms);
    };
  }

  /* ── E7 BUNDLING DETECTION ─────────────────────────────────── */

  function updateE7Bundling() {
    var isE7 = S.plan === 'e7';
    var checks = $qa('#ai-strategy-checks .aicost-check');
    checks.forEach(function (label) {
      var cb = label.querySelector('input');
      var priceSpan = label.querySelector('.aicost-check-price');
      var includedSpan = label.querySelector('.aicost-check-included');
      if (!cb) return;

      var val = cb.value;
      var isIncluded = isE7 && cb.checked && (val === 'm365-copilot' || val === 'agent-365');

      // Remove any existing included badge
      if (includedSpan) includedSpan.remove();

      if (isIncluded && priceSpan) {
        priceSpan.style.display = 'none';
        var badge = document.createElement('span');
        badge.className = 'aicost-check-included';
        badge.textContent = 'Included in E7';
        label.appendChild(badge);
      } else if (priceSpan) {
        priceSpan.style.display = '';
      }
    });
  }

  /* ── READ INPUTS ───────────────────────────────────────────── */

  function readInputs() {
    S.users = parseInt($('in-users').value) || 100;
    S.plan = $('in-plan').value;
    S.rolloutPct = parseInt($('in-rollout').value) || 30;
    S.otherCost = parseFloat(($('in-other-cost') || {}).value) || 20;

    S.aiTools = [];
    $qa('#ai-strategy-checks input[type="checkbox"]').forEach(function (cb) {
      if (cb.checked) S.aiTools.push(cb.value);
    });

    var trainRadio = $q('input[name="training"]:checked');
    if (trainRadio) S.training = trainRadio.value;
    var supportRadio = $q('input[name="support"]:checked');
    if (supportRadio) S.support = supportRadio.value;
    var timingRadio = $q('input[name="train-timing"]:checked');
    if (timingRadio) S.trainTiming = timingRadio.value;
    var includeBaseEl = $('in-include-base');
    if (includeBaseEl) S.includeBase = includeBaseEl.checked;
    S.discount = parseInt(($('in-discount') || {}).value) || 0;
    var currencyEl = $('in-currency');
    if (currencyEl) S.currency = currencyEl.value;
    var profileEl = $('in-profile');
    if (profileEl) S.userProfile = profileEl.value;
    S.hoursSaved = parseFloat(($('in-hours') || {}).value) || 2;
  }

  /* ══════════════════════════════════════════════════════════════
     CORE CALCULATION ENGINE
     ══════════════════════════════════════════════════════════════ */

  function recalc() {
    readInputs();
    updateE7Bundling();

    var users = S.users;
    var rolloutUsers = Math.round(users * S.rolloutPct / 100);
    var isE7 = S.plan === 'e7';

    /* ── 1. Licensing ── */
    var licMonthly = 0;
    var licLines = [];

    S.aiTools.forEach(function (toolId) {
      var plat = PLATFORMS[toolId];
      if (!plat) {
        if (toolId === 'other') {
          var otherMonthly = rolloutUsers * S.otherCost;
          licLines.push({ product: 'Other AI Tools', users: rolloutUsers, perUser: S.otherCost, monthly: otherMonthly, annual: otherMonthly * 12, included: false });
          licMonthly += otherMonthly;
        }
        return;
      }

      // Check if included in E7
      var included = isE7 && (plat.included_in || []).indexOf('e7') !== -1;

      if (plat.type === 'per-user') {
        var m = included ? 0 : rolloutUsers * plat.price_per_user;
        licLines.push({ product: plat.name, users: rolloutUsers, perUser: plat.price_per_user, monthly: m, annual: m * 12, included: included });
        licMonthly += m;
      } else if (plat.type === 'per-tenant') {
        var m2 = plat.base_price;
        licLines.push({ product: plat.name, users: '1 tenant', perUser: plat.base_price, monthly: m2, annual: m2 * 12, included: false });
        licMonthly += m2;
      } else if (plat.type === 'token-based') {
        var est = (plat.estimated_monthly_per_user || 15) * rolloutUsers;
        licLines.push({ product: plat.name + ' (est.)', users: rolloutUsers, perUser: plat.estimated_monthly_per_user || 15, monthly: est, annual: est * 12, included: false });
        licMonthly += est;
      }
    });

    var licAnnual = licMonthly * 12;

    // Include base M365 plan cost if toggled
    var basePlanCostAnnual = 0;
    if (S.includeBase) {
      var basePlan = BASE_PLANS[S.plan] || {};
      basePlanCostAnnual = (basePlan.price || 0) * users * 12;
      licLines.unshift({ product: (basePlan.name || 'M365 Plan') + ' (base)', users: users, perUser: basePlan.price || 0, monthly: (basePlan.price || 0) * users, annual: basePlanCostAnnual, included: false });
      licAnnual += basePlanCostAnnual;
      licMonthly += (basePlan.price || 0) * users;
    }

    // Apply EA/CSP discount
    var discountMult = 1 - (S.discount / 100);
    licAnnual = licAnnual * discountMult;
    licMonthly = licMonthly * discountMult;

    S.costs.licensing = licAnnual;
    S._licLines = licLines;

    /* ── 2. Implementation (one-time) ── */
    var confMult = CONFIDENCE[S.confidenceLevel] || 1.0;
    var profileMult = PROFILES[S.userProfile] || PROFILES.knowledge;
    var bucket = getImplBucket(users);
    var multiplier = ((IMPL.support_multiplier || {})[S.support]) || 1.0;
    var implTotal = ((bucket.data_governance_audit || 0) + (bucket.security_configuration || 0) +
                     (bucket.pilot_planning || 0) + (bucket.integration_customisation || 0)) * multiplier * confMult;
    S.costs.implementation = implTotal;
    S._implBucket = bucket;
    S._implMultiplier = multiplier;

    /* ── 3. Training ── */
    var perUserTraining = TRAINING[S.training] || 150;
    var trainTotal = perUserTraining * rolloutUsers * profileMult.training * confMult;
    var prodLoss = TRAINING.training_hours_per_user * (TRAINING.avg_hourly_productivity_cost || 50) * rolloutUsers * confMult;
    var refresherAnnual = TRAINING.annual_refresher * rolloutUsers * profileMult.training;
    S.costs.training = trainTotal + prodLoss;
    S._trainPerUser = perUserTraining;
    S._trainProdLoss = prodLoss;
    S._refresherAnnual = refresherAnnual;

    /* ── 4. Governance ── */
    var govMonthly = 0;
    var govOneTime = 0;
    var govLines = [];

    // SharePoint Advanced Management
    if (S.aiTools.indexOf('m365-copilot') !== -1) {
      var samCost = (GOV.sharepoint_advanced_mgmt || 3) * rolloutUsers;
      govMonthly += samCost;
      govLines.push({ item: 'SharePoint Advanced Management', cost: samCost * 12, note: fmtDec(GOV.sharepoint_advanced_mgmt || 3) + '/user/mo — recommended for Copilot' });
    }

    // Purview add-on (if not in plan)
    var purviewIncluded = (GOV.purview_included_in || []).indexOf(S.plan) !== -1;
    if (!purviewIncluded && S.aiTools.length > 0) {
      var purviewCost = (GOV.purview_addon_price || 5) * rolloutUsers;
      govMonthly += purviewCost;
      govLines.push({ item: 'Purview Compliance Add-on', cost: purviewCost * 12, note: fmtDec(GOV.purview_addon_price || 5) + '/user/mo — for data governance' });
    } else if (purviewIncluded) {
      govLines.push({ item: 'Purview Compliance', cost: 0, note: 'Included in ' + (S.plan === 'e7' ? 'E7' : 'E5') });
    }

    // Admin time
    var govHours = ((GOV.agent_governance_hours_per_100 || 4) * users / 100) * 12;
    var govAdminCost = govHours * (OPS.average_admin_hourly_rate || 75);
    govLines.push({ item: 'Agent governance admin time', cost: govAdminCost, note: Math.round(govHours) + ' hrs/yr' });

    // Compliance review
    govLines.push({ item: 'Annual compliance review', cost: GOV.compliance_review_annual || 5000, note: 'Legal/compliance team time' });

    // Data classification (one-time)
    var dcKey = users < 100 ? 'small' : users <= 1000 ? 'medium' : 'large';
    var dcCost = ((GOV.data_classification || {})[dcKey]) || 5000;
    govOneTime = dcCost;
    govLines.push({ item: 'Data classification project', cost: dcCost, note: 'One-time — labelling sensitive data' });

    var govAnnual = govMonthly * 12 + govAdminCost + (GOV.compliance_review_annual || 5000);
    S.costs.governance = govAnnual + govOneTime;
    S._govRecurring = govAnnual;
    S._govLines = govLines;
    S._govOneTime = govOneTime;

    /* ── 5. Ongoing Operations ── */
    var adminFTE = (OPS.admin_fte_fraction_per_100_users || 0.05) * users / 100;
    var adminCost = adminFTE * (OPS.average_admin_hourly_rate || 75) * 2080 * profileMult.ops * confMult;
    var supportUplift = (OPS.support_uplift_percent || 10) / 100 * users * (OPS.average_support_hourly_rate || 50) * 2 * confMult;
    var quarterlyHours = (OPS.quarterly_update_hours || 8) * 4;
    var monthlyMonitoring = (OPS.monthly_monitoring_hours || 4) * 12;
    var updateCost = (quarterlyHours + monthlyMonitoring) * (OPS.average_admin_hourly_rate || 75);
    var opsAnnual = adminCost + supportUplift + updateCost;
    S.costs.operations = opsAnnual;
    S._opsAdmin = adminCost;
    S._opsSupport = supportUplift;
    S._opsUpdate = updateCost;
    S._adminFTE = adminFTE;

    /* ── Totals ── */
    S.year1 = licAnnual + implTotal + (trainTotal + prodLoss) + govAnnual + govOneTime + opsAnnual;
    S.year2 = licAnnual + refresherAnnual + (govAnnual) + opsAnnual;
    S.year3 = S.year2;
    S.total3yr = S.year1 + S.year2 + S.year3;

    /* ── Update UI ── */
    renderMetrics();
    renderDonut();
    renderBreakdownTables();
    renderNarrative();
    renderYearTotals();
    renderROI();
    renderWarnings();
    renderAssumptions();
    saveState();
  }

  /* ── RENDER: Hero Metrics ──────────────────────────────────── */

  function renderMetrics() {
    var monthly = S.year1 / 12;
    var perUser = S.users > 0 ? monthly / S.users : 0;
    setText('m-monthly', fmt(monthly));
    setText('m-annual', fmt(S.year1));
    setText('m-peruser', fmtDec(perUser));
    setText('m-3year', fmt(S.total3yr));
  }

  function setText(id, val) {
    var el = $(id);
    if (el) el.textContent = val;
  }

  /* ── RENDER: Donut Chart ───────────────────────────────────── */

  function renderDonut() {
    var canvas = $('chart-donut');
    if (!canvas) return;

    var data = [
      S.costs.licensing,
      S.costs.implementation,
      S.costs.training,
      S.costs.governance,
      S.costs.operations
    ];
    var labels = ['Licensing', 'Implementation', 'Training', 'Governance', 'Operations'];
    var colors = ['#22C55E', '#60A5FA', '#FB923C', '#A78BFA', '#94A3B8'];

    if (typeof Chart === 'undefined') {
      setText('donut-center-value', fmt(S.year1));
      return;
    }

    if (_donutChart) _donutChart.destroy();

    _donutChart = new Chart(canvas.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{ data: data, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '65%',
        plugins: {
          legend: { display: true, position: 'bottom', labels: { color: 'rgba(255,255,255,0.6)', font: { size: 11 }, padding: 12 } },
          tooltip: {
            callbacks: {
              label: function (ctx) { return ctx.label + ': ' + fmt(ctx.parsed) + ' (' + pct(ctx.parsed / S.year1 * 100) + ')'; }
            }
          }
        }
      }
    });

    setText('donut-center-value', fmt(S.year1));
  }

  /* ── RENDER: Breakdown Tables ──────────────────────────────── */

  function renderBreakdownTables() {
    // Licensing
    var licBody = $q('#table-licensing tbody');
    if (licBody) {
      licBody.innerHTML = '';
      (S._licLines || []).forEach(function (l) {
        var cls = l.included ? ' class="included"' : '';
        var priceCell = l.included ? '<td class="right included">Included in E7</td>' : '<td class="right">' + fmtDec(l.perUser) + '</td>';
        var monthlyCell = l.included ? '<td class="right strikethrough">' + fmt(l.users * l.perUser) + '</td>' : '<td class="right">' + fmt(l.monthly) + '</td>';
        var annualCell = l.included ? '<td class="right strikethrough">' + fmt(l.users * l.perUser * 12) + '</td>' : '<td class="right">' + fmt(l.annual) + '</td>';
        licBody.innerHTML += '<tr' + cls + '><td>' + esc(l.product) + '</td><td class="right">' + l.users + '</td>' + priceCell + monthlyCell + annualCell + '</tr>';
      });
      setText('cat-licensing-total', fmt(S.costs.licensing) + '/yr');
    }

    // Implementation
    var implBody = $q('#table-implementation tbody');
    if (implBody) {
      var bucket = S._implBucket || {};
      var m = S._implMultiplier || 1;
      var descs = (IMPL.descriptions || {});
      implBody.innerHTML = '';
      [
        ['Data governance audit', bucket.data_governance_audit, descs.data_governance_audit],
        ['Security configuration', bucket.security_configuration, descs.security_configuration],
        ['Pilot planning & execution', bucket.pilot_planning, descs.pilot_planning],
        ['Integration & customisation', bucket.integration_customisation, descs.integration_customisation]
      ].forEach(function (r) {
        var cost = (r[1] || 0) * m;
        implBody.innerHTML += '<tr><td>' + esc(r[0]) + '</td><td class="right">' + fmt(cost) + '</td><td>' + esc(r[2] || '') + '</td></tr>';
      });
      if (m !== 1) {
        implBody.innerHTML += '<tr><td colspan="3" style="color:rgba(255,255,255,0.4);font-size:0.75rem;padding-top:0.25rem">Support multiplier: ' + m + 'x (' + S.support.replace(/_/g, ' ') + ')</td></tr>';
      }
      setText('cat-implementation-total', fmt(S.costs.implementation) + ' (one-time)');
    }

    // Training
    var trainBody = $q('#table-training tbody');
    var rolloutUsers = Math.round(S.users * S.rolloutPct / 100);
    if (trainBody) {
      trainBody.innerHTML = '';
      trainBody.innerHTML += '<tr><td>Training programme (' + S.training.replace(/_/g, ' ') + ')</td><td class="right">' + fmt(S._trainPerUser * rolloutUsers) + '</td><td>' + fmtDec(S._trainPerUser) + '/user × ' + rolloutUsers + ' users</td></tr>';
      trainBody.innerHTML += '<tr><td>Productivity loss during training</td><td class="right">' + fmt(S._trainProdLoss) + '</td><td>' + TRAINING.training_hours_per_user + ' hrs/user × ' + fmtDec(TRAINING.avg_hourly_productivity_cost || 50) + '/hr</td></tr>';
      trainBody.innerHTML += '<tr><td>Annual refresher (Year 2+)</td><td class="right">' + fmt(S._refresherAnnual) + '/yr</td><td>' + fmtDec(TRAINING.annual_refresher || 25) + '/user/yr</td></tr>';
      setText('cat-training-total', fmt(S.costs.training) + ' (Year 1)');
    }

    // Governance
    var govBody = $q('#table-governance tbody');
    if (govBody) {
      govBody.innerHTML = '';
      (S._govLines || []).forEach(function (l) {
        var isOneTime = l.note && l.note.indexOf('One-time') !== -1;
        var suffix = l.cost === 0 ? '' : (isOneTime ? '' : '/yr');
        govBody.innerHTML += '<tr><td>' + esc(l.item) + '</td><td class="right">' + fmt(l.cost) + suffix + (isOneTime ? ' (one-time)' : '') + '</td><td>' + esc(l.note) + '</td></tr>';
      });
      setText('cat-governance-total', fmt(S.costs.governance) + '/yr');
    }

    // Operations
    var opsBody = $q('#table-operations tbody');
    if (opsBody) {
      opsBody.innerHTML = '';
      opsBody.innerHTML += '<tr><td>Admin FTE fraction</td><td class="right">' + fmt(S._opsAdmin) + '/yr</td><td>' + (S._adminFTE * 100).toFixed(1) + '% of 1 FTE</td></tr>';
      opsBody.innerHTML += '<tr><td>Support desk uplift</td><td class="right">' + fmt(S._opsSupport) + '/yr</td><td>' + (OPS.support_uplift_percent || 10) + '% increase during rollout</td></tr>';
      opsBody.innerHTML += '<tr><td>Updates & monitoring</td><td class="right">' + fmt(S._opsUpdate) + '/yr</td><td>Quarterly updates + monthly reporting</td></tr>';
      setText('cat-operations-total', fmt(S.costs.operations) + '/yr');
    }
  }

  /* ── RENDER: Year Totals ───────────────────────────────────── */

  function renderYearTotals() {
    setText('total-y1', fmt(S.year1));
    setText('total-y2', fmt(S.year2));
    setText('total-y3', fmt(S.year3));
    setText('total-3yr', fmt(S.total3yr));
  }

  /* ── RENDER: Smart Narrative ───────────────────────────────── */

  function renderNarrative() {
    var el = $('smart-narrative');
    if (!el) return;

    var rolloutUsers = Math.round(S.users * S.rolloutPct / 100);
    var planLabel = (BASE_PLANS[S.plan] || {}).name || S.plan;
    var toolNames = S.aiTools.map(function (id) { return (PLATFORMS[id] || {}).name || id.replace(/-/g, ' '); }).join(', ');
    var licPct = S.year1 > 0 ? Math.round(S.costs.licensing / S.year1 * 100) : 0;

    var biggest = 'licensing';
    var biggestVal = S.costs.licensing;
    ['implementation', 'training', 'governance', 'operations'].forEach(function (k) {
      if (S.costs[k] > biggestVal) { biggest = k; biggestVal = S.costs[k]; }
    });

    var text = 'For an organisation of <strong>' + S.users.toLocaleString() + ' users</strong> on ' +
      '<strong>' + esc(planLabel) + '</strong>, adding ' + esc(toolNames || 'AI tools') +
      ' for <strong>' + pct(S.rolloutPct) + '</strong> of staff (' + rolloutUsers + ' users) ' +
      'with <strong>' + S.training.replace(/_/g, ' ') + '</strong> training costs approximately ' +
      '<strong>' + fmt(S.year1) + '/year</strong>. ' +
      'Licensing represents ' + licPct + '% of Year 1 cost. ';

    if (biggest !== 'licensing') {
      text += 'The biggest cost category is <strong>' + biggest + '</strong> at ' + fmt(biggestVal) + '.';
    } else {
      text += 'Hidden costs (implementation, training, governance, operations) add <strong>' + fmt(S.year1 - S.costs.licensing) + '</strong> on top of licensing.';
    }

    el.innerHTML = text;
  }

  /* ══════════════════════════════════════════════════════════════
     TAB 2: TOKEN CALCULATOR
     ══════════════════════════════════════════════════════════════ */

  function renderTokenTable() {
    var body = $q('#table-tokens tbody');
    if (!body) return;

    // Get inputs
    var pastedText = ($('token-text') || {}).value || '';
    var queries = parseInt(($('tok-queries') || {}).value) || 100;
    var days = parseInt(($('tok-days') || {}).value) || 22;
    var inputTokens = parseInt(($('tok-input-len') || {}).value) || 500;
    var outputTokens = parseInt(($('tok-output-len') || {}).value) || 500;

    // Token count from pasted text (1 word ≈ 1.3 tokens)
    if (pastedText.trim()) {
      var words = pastedText.trim().split(/\s+/).length;
      var estTokens = Math.round(words * 1.3);
      setText('token-text-count', 'Approximately ' + estTokens.toLocaleString() + ' tokens (' + words.toLocaleString() + ' words)');
      inputTokens = estTokens;
      outputTokens = Math.round(estTokens * 0.8); // Estimate output as 80% of input
    } else {
      setText('token-text-count', '');
    }

    var monthlyQueries = queries * days;
    var useCaseMult = _activeUseCaseMultiplier || 1;

    // Calculate costs per model
    var rows = MODELS.map(function (model) {
      var inCost = (inputTokens / 1e6) * model.input_per_1m * monthlyQueries * useCaseMult;
      var outCost = (outputTokens / 1e6) * model.output_per_1m * monthlyQueries * useCaseMult;
      var monthly = inCost + outCost;
      return {
        provider: model.provider,
        model: model.model,
        input: model.input_per_1m,
        output: model.output_per_1m,
        monthly: monthly,
        annual: monthly * 12,
        tier: model.tier
      };
    });

    // Sort by monthly cost
    rows.sort(function (a, b) { return a.monthly - b.monthly; });

    // Show multiplier note if active
    var noteEl = $('token-text-count');
    if (useCaseMult > 1 && !pastedText.trim() && noteEl) {
      var existing = noteEl.textContent;
      if (existing.indexOf('multiplier') === -1) {
        noteEl.textContent = (existing ? existing + ' · ' : '') + 'Multi-turn multiplier: ' + useCaseMult + 'x applied';
      }
    }

    // Render
    body.innerHTML = '';
    rows.forEach(function (r, i) {
      var cls = i === 0 ? ' class="cheapest"' : (i === rows.length - 1 ? ' class="expensive"' : '');
      var badge = '';
      if (i === 0) badge = ' <span class="aicost-badge aicost-badge-green">Cheapest</span>';
      if (i === rows.length - 1) badge = ' <span class="aicost-badge aicost-badge-amber">Most Expensive</span>';

      body.innerHTML += '<tr' + cls + '>' +
        '<td>' + esc(r.provider) + badge + '</td>' +
        '<td>' + esc(r.model) + '</td>' +
        '<td class="right">' + fmtUSD(r.input) + '</td>' +
        '<td class="right">' + fmtUSD(r.output) + '</td>' +
        '<td class="right"><strong>' + fmt(r.monthly) + '</strong></td>' +
        '<td class="right">' + fmt(r.annual) + '</td>' +
        '</tr>';
    });
  }

  var _activeUseCaseMultiplier = 1;

  function setSelectClosest(sel, targetVal) {
    // Find closest option value
    var best = null, bestDist = Infinity;
    for (var i = 0; i < sel.options.length; i++) {
      var v = parseInt(sel.options[i].value);
      var dist = Math.abs(v - targetVal);
      if (dist < bestDist) { bestDist = dist; best = sel.options[i].value; }
    }
    if (best !== null) sel.value = best;
  }

  function initUseCasePresets() {
    var wrap = $('usecase-presets');
    if (!wrap) return;

    USE_CASES.forEach(function (uc) {
      var btn = document.createElement('button');
      btn.className = 'aicost-usecase-btn';
      btn.textContent = (uc.icon || '') + ' ' + uc.name;
      btn.setAttribute('aria-label', 'Use case preset: ' + uc.name);
      btn.addEventListener('click', function () {
        wrap.querySelectorAll('.aicost-usecase-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        var qEl = $('tok-queries');
        var qrEl = $('tok-queries-range');
        var ilEl = $('tok-input-len');
        var olEl = $('tok-output-len');

        if (qEl) qEl.value = uc.queries_per_day;
        if (qrEl) qrEl.value = Math.min(uc.queries_per_day, 10000);

        // Match to closest dropdown option, or add custom option
        if (ilEl) setSelectClosest(ilEl, uc.avg_input_tokens);
        if (olEl) setSelectClosest(olEl, uc.avg_output_tokens);

        // Store multiplier for this use case
        _activeUseCaseMultiplier = uc.multiplier || 1;

        renderTokenTable();
      });
      wrap.appendChild(btn);
    });
  }

  /* ══════════════════════════════════════════════════════════════
     TAB 3: LICENCE OPTIMIZER
     ══════════════════════════════════════════════════════════════ */

  function renderLicenceOptimizer() {
    var planId = ($('lic-plan') || {}).value || 'e3';
    var users = parseInt(($('lic-users') || {}).value) || 100;

    // Get selected add-ons
    var addons = [];
    $qa('#lic-addons input[type="checkbox"]').forEach(function (cb) {
      if (cb.checked) addons.push(cb.value);
    });

    var basePlan = BASE_PLANS[planId] || { price: 39 };
    var currentPerUser = basePlan.price;

    // Calculate add-on costs per user
    var addonPerUser = 0;
    var addonTenant = 0;
    if (addons.indexOf('m365-copilot') !== -1) addonPerUser += 30;
    if (addons.indexOf('agent-365') !== -1) addonPerUser += 15;
    if (addons.indexOf('sam') !== -1) addonPerUser += 3;
    if (addons.indexOf('purview') !== -1) addonPerUser += 5;
    if (addons.indexOf('copilot-studio') !== -1) addonTenant += 200;

    var currentTotal = (currentPerUser + addonPerUser) * users + addonTenant;
    var currentPerUserTotal = currentTotal / users;

    // Generate bundle options
    var bundles = [];

    // Current
    bundles.push({
      name: 'Current: ' + (basePlan.name || planId) + ' + add-ons',
      perUser: currentPerUserTotal,
      annual: currentTotal * 12,
      savings: 0,
      isCurrent: true
    });

    // E7 bundle (if not already on E7)
    if (planId !== 'e7') {
      var e7perUser = 99;
      var e7extras = 0;
      // E7 includes Copilot + Agent 365 + E5 features (incl Purview)
      // Only add costs NOT included in E7
      if (addons.indexOf('sam') !== -1) e7extras += 3;
      if (addons.indexOf('copilot-studio') !== -1) e7extras += 200 / users;

      var e7total = (e7perUser + e7extras) * users + (addons.indexOf('copilot-studio') !== -1 ? 0 : 0);
      var e7totalCorrected = e7perUser * users + (addons.indexOf('sam') !== -1 ? 3 * users : 0) + (addons.indexOf('copilot-studio') !== -1 ? 200 : 0);

      bundles.push({
        name: 'Microsoft 365 E7',
        perUser: e7totalCorrected / users,
        annual: e7totalCorrected * 12,
        savings: (currentTotal - e7totalCorrected) * 12,
        note: 'Includes E5 + Copilot + Agent 365 + Purview P2'
      });
    }

    // E5 + add-ons (if currently on E3 or lower)
    if (['e3', 'business-standard', 'business-premium', 'business-basic', 'none'].indexOf(planId) !== -1) {
      var e5perUser = 60;
      var e5addons = 0;
      if (addons.indexOf('m365-copilot') !== -1) e5addons += 30;
      if (addons.indexOf('agent-365') !== -1) e5addons += 15;
      if (addons.indexOf('sam') !== -1) e5addons += 3;
      // Purview included in E5
      var e5total = (e5perUser + e5addons) * users + (addons.indexOf('copilot-studio') !== -1 ? 200 : 0);

      bundles.push({
        name: 'E5 + current add-ons',
        perUser: e5total / users,
        annual: e5total * 12,
        savings: (currentTotal - e5total) * 12,
        note: 'E5 includes Purview — saves $5/user if you were paying separately'
      });
    }

    // Sort by annual cost
    bundles.sort(function (a, b) { return (a.annual - b.annual); });

    // Mark cheapest
    if (bundles.length > 0) bundles[0].isBest = true;

    // Render
    var container = $('licence-bundles');
    if (!container) return;
    container.innerHTML = '';

    bundles.forEach(function (b) {
      var cls = 'aicost-bundle-card' + (b.isBest ? ' best-deal' : '');
      var savingsHtml = '';
      if (!b.isCurrent && b.savings !== 0) {
        var savCls = b.savings > 0 ? 'positive' : 'negative';
        savingsHtml = '<span class="aicost-bundle-savings ' + savCls + '">' +
          (b.savings > 0 ? 'Save ' + fmt(b.savings) + '/yr' : 'Costs ' + fmt(-b.savings) + ' more/yr') +
          '</span>';
      }
      if (b.isCurrent) savingsHtml = '<span style="color:rgba(255,255,255,0.4);font-size:0.78rem">Current setup</span>';

      container.innerHTML += '<div class="' + cls + '">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem">' +
          '<span class="aicost-bundle-name">' + esc(b.name) + (b.isBest ? ' <span class="aicost-badge aicost-badge-green">Best Price</span>' : '') + '</span>' +
          '<span class="aicost-bundle-price">' + fmtDec(b.perUser) + '<span style="font-size:0.7rem;font-weight:400;color:rgba(255,255,255,0.5)">/user/mo</span></span>' +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center">' +
          '<span style="color:rgba(255,255,255,0.5);font-size:0.82rem">' + fmt(b.annual) + '/yr for ' + users + ' users</span>' +
          savingsHtml +
        '</div>' +
        (b.note ? '<div style="color:rgba(255,255,255,0.4);font-size:0.75rem;margin-top:0.5rem">' + esc(b.note) + '</div>' : '') +
      '</div>';
    });

    // Recommendations
    var recsContainer = $('licence-recommendations');
    if (!recsContainer) return;
    recsContainer.innerHTML = '';
    var recs = [];

    if (addons.indexOf('purview') !== -1 && ['e5', 'e7'].indexOf(planId) === -1) {
      recs.push('You\'re paying for Purview separately but it\'s included in E5/E7 — switch and save $5/user/month.');
    }
    if (users >= 500) {
      recs.push('At ' + users.toLocaleString() + '+ users, contact Microsoft for EA volume pricing (typically 10–15% discount).');
    }
    if (addons.indexOf('copilot-studio') !== -1) {
      var studioPerUser = (200 / users).toFixed(2);
      recs.push('Copilot Studio\'s $200/tenant base is fixed — at your size, that\'s only $' + studioPerUser + '/user/month.');
    }
    if (addons.indexOf('m365-copilot') !== -1 && addons.indexOf('agent-365') !== -1 && planId !== 'e7') {
      recs.push('You\'re paying for both Copilot ($30) and Agent 365 ($15) separately. E7 at $99 includes both — consider upgrading.');
    }

    if (recs.length === 0) {
      recs.push('Your current setup looks well-optimized. Check back when pricing changes.');
    }

    recs.forEach(function (r) {
      recsContainer.innerHTML += '<div class="aicost-recommendation">' + esc(r) + '</div>';
    });
  }

  /* ══════════════════════════════════════════════════════════════
     TAB 4: BUDGET TIMELINE
     ══════════════════════════════════════════════════════════════ */

  function renderTimeline() {
    var canvas = $('chart-timeline');
    if (!canvas || typeof Chart === 'undefined') return;

    var rollout = ROLLOUTS[S.rolloutPreset] || ROLLOUTS.phased || { phases: [15,15,40,40,70,100,100,100,100,100,100,100] };
    var phases = rollout.phases || [];
    var rolloutUsers = Math.round(S.users * S.rolloutPct / 100);

    var months = [];
    var licData = [], implData = [], trainData = [], govData = [], opsData = [];

    // Pre-calculate training timing eligible months to avoid overcount
    var trainEligible = [];
    for (var mp = 0; mp < 12; mp++) {
      var pp = (phases[mp] || 100) / 100;
      if (S.trainTiming === 'before') {
        if (mp < 2) trainEligible.push(mp);
      } else if (S.trainTiming === 'during') {
        if (mp < 6 && pp > 0) trainEligible.push(mp);
      } else {
        if (mp >= 2 && mp < 5) trainEligible.push(mp);
      }
    }
    var trainPerMonth = trainEligible.length > 0 ? S.costs.training / trainEligible.length : 0;

    for (var m = 0; m < 12; m++) {
      months.push('Month ' + (m + 1));
      var phasePct = (phases[m] || 100) / 100;
      var usersThisMonth = Math.round(rolloutUsers * phasePct);

      // Licensing scales with users active
      var licMonth = 0;
      S.aiTools.forEach(function (toolId) {
        var plat = PLATFORMS[toolId];
        if (!plat) {
          if (toolId === 'other') licMonth += usersThisMonth * S.otherCost;
          return;
        }
        var isE7 = S.plan === 'e7';
        var included = isE7 && (plat.included_in || []).indexOf('e7') !== -1;
        if (included) return;

        if (plat.type === 'per-user') licMonth += usersThisMonth * plat.price_per_user;
        else if (plat.type === 'per-tenant') licMonth += plat.base_price;
        else if (plat.type === 'token-based') licMonth += usersThisMonth * (plat.estimated_monthly_per_user || 15);
      });

      // Include base plan if toggle is on
      if (S.includeBase) {
        var basePlan = BASE_PLANS[S.plan] || {};
        licMonth += (basePlan.price || 0) * S.users;
      }

      licData.push(licMonth);

      // Implementation: spread over first 3 months
      implData.push(m < 3 ? S.costs.implementation / 3 : 0);

      // Training: timing-aware, exact split across eligible months
      trainData.push(trainEligible.indexOf(m) !== -1 ? trainPerMonth : 0);

      // Governance: starts month 2, steady
      govData.push(m >= 1 ? (S.costs.governance - (S._govOneTime || 0)) / 12 + (m === 1 ? (S._govOneTime || 0) : 0) : 0);

      // Operations: steady from month 1
      opsData.push(S.costs.operations / 12);
    }

    if (_timelineChart) _timelineChart.destroy();

    _timelineChart = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          { label: 'Licensing', data: licData, backgroundColor: '#22C55E' },
          { label: 'Implementation', data: implData, backgroundColor: '#60A5FA' },
          { label: 'Training', data: trainData, backgroundColor: '#FB923C' },
          { label: 'Governance', data: govData, backgroundColor: '#A78BFA' },
          { label: 'Operations', data: opsData, backgroundColor: '#94A3B8' }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { stacked: true, ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 } }, grid: { display: false } },
          y: { stacked: true, ticks: { color: 'rgba(255,255,255,0.5)', callback: function (v) { return fmt(v); } }, grid: { color: 'rgba(255,255,255,0.05)' } }
        },
        plugins: {
          legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.6)', font: { size: 11 }, padding: 12 } },
          tooltip: { callbacks: { label: function (ctx) { return ctx.dataset.label + ': ' + fmt(ctx.parsed.y); } } }
        }
      }
    });

    // Summary metrics
    var totals = months.map(function (_, i) { return licData[i] + implData[i] + trainData[i] + govData[i] + opsData[i]; });
    var y1Total = totals.reduce(function (a, b) { return a + b; }, 0);
    setText('tl-month1', fmt(totals[0]));
    setText('tl-steady', fmt(totals[11]));
    setText('tl-y1total', fmt(y1Total));
    setText('tl-avg', fmt(y1Total / 12));
  }

  /* ══════════════════════════════════════════════════════════════
     TAB 5: COMPARE & EXPORT — Scenarios
     ══════════════════════════════════════════════════════════════ */

  function renderScenarios() {
    var users = S.users;
    var rolloutUsers = Math.round(users * S.rolloutPct / 100);

    // Calculate costs for each scenario
    var scenarios = ['copilot_only', 'multi_ai', 'build_custom'];
    var results = {};

    scenarios.forEach(function (key) {
      var sc = SCENARIOS[key] || {};
      var govMult = sc.governance_multiplier || 1;
      var opsMult = sc.operations_multiplier || 1;

      var lic = 0;
      if (key === 'copilot_only') {
        lic = (PLATFORMS['m365-copilot'] ? PLATFORMS['m365-copilot'].price_per_user : 30) * rolloutUsers * 12;
      } else if (key === 'multi_ai') {
        var copilotPrice = PLATFORMS['m365-copilot'] ? PLATFORMS['m365-copilot'].price_per_user : 30;
        var agentPrice = PLATFORMS['agent-365'] ? PLATFORMS['agent-365'].price_per_user : 15;
        var studioPrice = PLATFORMS['copilot-studio'] ? PLATFORMS['copilot-studio'].base_price : 200;
        lic = (copilotPrice + agentPrice) * rolloutUsers * 12 + studioPrice * 12;
      } else {
        var aoaiPrice = PLATFORMS['azure-openai'] ? PLATFORMS['azure-openai'].estimated_monthly_per_user : 15;
        lic = aoaiPrice * rolloutUsers * 12;
      }

      var impl = S.costs.implementation * (key === 'build_custom' ? 2 : 1);
      var train = S.costs.training * (key === 'build_custom' ? 1.5 : 1);
      var govY1 = S.costs.governance * govMult;
      var govRecurring = (S._govRecurring || S.costs.governance) * govMult;
      var ops = S.costs.operations * opsMult;

      var y1 = lic + impl + train + govY1 + ops;
      var y2 = lic + S._refresherAnnual + govRecurring + ops;
      results[key] = {
        label: sc.label || key,
        desc: sc.description || '',
        y1: y1,
        y3: y1 + y2 * 2,
        perUser: y1 / 12 / users,
        ttv: sc.time_to_value_months || 3,
        complexity: sc.admin_complexity || 3,
        governance: sc.governance_load || 3,
        customisation: sc.customisation || 3,
        lock_in: sc.vendor_lock_in || 3
      };
    });

    // Scenario cards
    var cardsEl = $('scenario-cards');
    if (cardsEl) {
      cardsEl.innerHTML = '';
      scenarios.forEach(function (key) {
        var r = results[key];
        cardsEl.innerHTML += '<div class="aicost-scenario">' +
          '<div class="aicost-scenario-title">' + esc(r.label) + '</div>' +
          '<div class="aicost-scenario-desc">' + esc(r.desc) + '</div>' +
          '<div class="aicost-scenario-price">' + fmt(r.y1) + '</div>' +
          '<div class="aicost-scenario-price-sub">Year 1 &nbsp;|&nbsp; ' + fmtDec(r.perUser) + '/user/mo</div>' +
        '</div>';
      });
    }

    // Comparison table
    var tbody = $q('#table-compare tbody');
    if (tbody) {
      var co = results.copilot_only;
      var ma = results.multi_ai;
      var bc = results.build_custom;
      var yours = { y1: S.year1, y3: S.total3yr, perUser: S.year1 / 12 / S.users };

      function bestOf(vals) {
        var min = Math.min.apply(null, vals);
        return vals.map(function (v) { return v === min ? ' class="best"' : ''; });
      }

      var metrics = [
        ['Year 1 Cost', [co.y1, ma.y1, bc.y1, yours.y1], fmt],
        ['3-Year Total', [co.y3, ma.y3, bc.y3, yours.y3], fmt],
        ['Per User / Month', [co.perUser, ma.perUser, bc.perUser, yours.perUser], fmtDec],
        ['Time to Value', [co.ttv + ' mo', ma.ttv + ' mo', bc.ttv + ' mo', '—'], null],
        ['Admin Complexity', [starRating(co.complexity), starRating(ma.complexity), starRating(bc.complexity), '—'], null],
        ['Governance Load', [starRating(co.governance), starRating(ma.governance), starRating(bc.governance), '—'], null]
      ];

      tbody.innerHTML = '';
      metrics.forEach(function (row) {
        var html = '<tr><td>' + row[0] + '</td>';
        if (row[2]) {
          var cls = bestOf(row[1]);
          row[1].forEach(function (v, i) { html += '<td' + cls[i] + '>' + row[2](v) + '</td>'; });
        } else {
          row[1].forEach(function (v) { html += '<td>' + v + '</td>'; });
        }
        html += '</tr>';
        tbody.innerHTML += html;
      });
    }
  }

  function starRating(n) {
    var out = '';
    for (var i = 0; i < 5; i++) out += i < n ? '●' : '○';
    return '<span style="letter-spacing:2px;color:' + (n <= 2 ? '#22C55E' : n <= 3 ? '#F59E0B' : '#EF4444') + '">' + out + '</span>';
  }

  /* ── COST PER ACTION ───────────────────────────────────────── */

  function renderActionCards() {
    var container = $('action-cards');
    if (!container) return;

    var actionsPerDay = parseInt(($('cpa-actions') || {}).value) || 30;
    var actionsPerMonth = actionsPerDay * 22; // working days
    var copilotPerAction = 30 / actionsPerMonth;

    container.innerHTML = '';
    ACTIONS.forEach(function (action) {
      var tokens = action.est_tokens || 500;

      // Calculate per-action cost for representative models (read from TOML)
      var gpt4o = MODELS.find(function (m) { return m.model === 'GPT-4o'; }) || { input_per_1m: 2.50, output_per_1m: 10.00 };
      var claude = MODELS.find(function (m) { return m.model === 'Claude Sonnet 4.6'; }) || { input_per_1m: 3.00, output_per_1m: 15.00 };
      var mini = MODELS.find(function (m) { return m.model === 'GPT-4o mini'; }) || { input_per_1m: 0.15, output_per_1m: 0.60 };

      var costs = [
        { name: 'Copilot', cost: copilotPerAction },
        { name: 'GPT-4o', cost: (tokens / 1e6) * gpt4o.input_per_1m + (tokens * 0.8 / 1e6) * gpt4o.output_per_1m },
        { name: 'Claude', cost: (tokens / 1e6) * claude.input_per_1m + (tokens * 0.8 / 1e6) * claude.output_per_1m },
        { name: 'GPT-4o mini', cost: (tokens / 1e6) * mini.input_per_1m + (tokens * 0.8 / 1e6) * mini.output_per_1m }
      ];

      costs.sort(function (a, b) { return a.cost - b.cost; });

      var pillsHtml = costs.map(function (c, i) {
        var cls = i === 0 ? 'aicost-action-cost-pill cheapest' : 'aicost-action-cost-pill';
        return '<span class="' + cls + '">' + esc(c.name) + ': ' + (c.cost < 0.01 ? '<$0.01' : fmtDec(c.cost)) + '</span>';
      }).join('');

      container.innerHTML += '<div class="aicost-action-card">' +
        '<div class="aicost-action-icon">' + (action.icon || '🤖') + '</div>' +
        '<div class="aicost-action-name">' + esc(action.name) + '</div>' +
        '<div class="aicost-action-tokens">~' + action.est_tokens.toLocaleString() + ' tokens</div>' +
        '<div class="aicost-action-costs">' + pillsHtml + '</div>' +
      '</div>';
    });
  }

  /* ── CROSSOVER CHART: Copilot vs API ───────────────────────── */

  function renderCrossover() {
    var canvas = $('chart-crossover');
    var resultEl = $('crossover-result');
    if (!canvas || typeof Chart === 'undefined') return;

    var actionsPerDay = parseInt(($('cpa-actions') || {}).value) || 30;
    var copilotCost = PLATFORMS['m365-copilot'] ? PLATFORMS['m365-copilot'].price_per_user : 30;

    // Find GPT-4o mini pricing from TOML models
    var miniModel = MODELS.find(function (m) { return m.model === 'GPT-4o mini'; }) || { input_per_1m: 0.15, output_per_1m: 0.60 };
    var avgTokens = 600;
    var apiCostPerAction = (avgTokens / 1e6) * miniModel.input_per_1m + (avgTokens * 0.8 / 1e6) * miniModel.output_per_1m;

    var labels = [];
    var copilotData = [];
    var apiData = [];
    var crossoverPoint = 0;

    for (var d = 5; d <= 100; d += 5) {
      labels.push(d);
      copilotData.push(copilotCost);
      var apiMonthly = d * 22 * apiCostPerAction;
      apiData.push(apiMonthly);
      if (apiMonthly > copilotCost && crossoverPoint === 0) crossoverPoint = d;
    }

    if (_crossoverChart) _crossoverChart.destroy();

    _crossoverChart = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          { label: 'Copilot ($30 flat)', data: copilotData, borderColor: '#66C559', backgroundColor: 'rgba(102,197,89,0.1)', fill: true, tension: 0 },
          { label: 'API (GPT-4o mini)', data: apiData, borderColor: '#60A5FA', backgroundColor: 'rgba(96,165,250,0.1)', fill: true, tension: 0.3 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: 'Actions per user per day', color: 'rgba(255,255,255,0.5)' }, ticks: { color: 'rgba(255,255,255,0.5)' }, grid: { display: false } },
          y: { title: { display: true, text: 'Monthly cost per user ($)', color: 'rgba(255,255,255,0.5)' }, ticks: { color: 'rgba(255,255,255,0.5)', callback: function (v) { return '$' + v; } }, grid: { color: 'rgba(255,255,255,0.05)' } }
        },
        plugins: {
          legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.6)', font: { size: 11 } } }
        }
      }
    });

    // Verdict
    if (resultEl) {
      var apiNow = actionsPerDay * 22 * apiCostPerAction;
      var breakEvenText = '';
      if (crossoverPoint > 0) {
        breakEvenText = '<div class="aicost-breakeven-marker">Break-even point: ~' + crossoverPoint + ' actions/user/day</div>';
      }

      if (apiNow < copilotCost) {
        var aboveText = crossoverPoint > 0
          ? 'Copilot becomes cheaper above ~' + crossoverPoint + ' actions/day. '
          : 'At very high usage, Copilot may become cheaper. ';
        resultEl.innerHTML = breakEvenText +
          '<div class="verdict">At ' + actionsPerDay + ' actions/day, API costs ' + fmtDec(apiNow) + '/mo — <strong>cheaper than Copilot</strong> (' + fmtDec(copilotCost) + '/mo).</div>' +
          '<div style="color:rgba(255,255,255,0.5);font-size:0.82rem;margin-top:0.5rem">' + aboveText + 'But remember: Copilot includes built-in M365 integration, security, and governance that raw API does not.</div>';
      } else {
        resultEl.innerHTML = breakEvenText +
          '<div class="verdict">At ' + actionsPerDay + ' actions/day, Copilot at ' + fmtDec(copilotCost) + '/mo is <strong>better value</strong> than API at ' + fmtDec(apiNow) + '/mo.</div>' +
          '<div style="color:rgba(255,255,255,0.5);font-size:0.82rem;margin-top:0.5rem">Plus Copilot includes M365 integration, security guardrails, and enterprise governance — no extra setup needed.</div>';
      }
    }
  }

  /* ── RENDER: ROI Quick View ──────────────────────────────────── */

  function renderROI() {
    var rolloutUsers = Math.round(S.users * S.rolloutPct / 100);
    var hourlyRate = (OPS.average_admin_hourly_rate || 75);
    var annualSavings = S.hoursSaved * hourlyRate * rolloutUsers * 52;
    var netBenefitY1 = annualSavings - S.year1;

    // Payback month
    var paybackMonth = 0;
    var cumCost = 0, cumSavings = 0;
    for (var m = 0; m < 36; m++) {
      cumCost += S.year1 / 12;
      cumSavings += annualSavings / 12;
      if (cumSavings >= cumCost && paybackMonth === 0) { paybackMonth = m + 1; }
    }

    setText('roi-savings', fmt(annualSavings));
    setText('roi-net', fmt(netBenefitY1));
    setText('roi-payback', paybackMonth > 0 ? paybackMonth + ' months' : '36+ months');
  }

  /* ── RENDER: Smart Warnings ────────────────────────────────── */

  function renderWarnings() {
    var el = $('cost-warnings');
    if (!el) return;

    var warnings = [];
    var rolloutUsers = Math.round(S.users * S.rolloutPct / 100);

    if (S.rolloutPct > 60 && S.training === 'self_serve') {
      warnings.push('High rollout (' + pct(S.rolloutPct) + ') with self-serve training risks low adoption. Consider train-the-trainer for better results.');
    }
    if (S.aiTools.length > 3) {
      warnings.push(S.aiTools.length + ' AI tools selected. Multi-tool strategies increase governance complexity and admin overhead significantly.');
    }
    if (S.plan !== 'e7' && S.aiTools.indexOf('m365-copilot') !== -1 && S.aiTools.indexOf('agent-365') !== -1) {
      warnings.push('You\'re buying Copilot + Agent 365 separately. E7 bundles both — check the Licence Optimizer tab for savings.');
    }
    if (S.users > 500 && S.support === 'internal_only') {
      warnings.push('Large organisation (' + S.users.toLocaleString() + ' users) with internal-only support. At this scale, consider at least light consulting to de-risk the rollout.');
    }
    if (S.discount === 0 && S.users > 200) {
      warnings.push('No discount applied. Most organisations with ' + S.users.toLocaleString() + '+ users negotiate 10–15% off list price. Use the discount slider above.');
    }
    if (S.costs.licensing < S.costs.training + S.costs.implementation) {
      warnings.push('Your hidden costs (implementation + training) exceed licensing. This is common — budget for it or risk project delays.');
    }
    if (S.hoursSaved < 1 && S.aiTools.indexOf('m365-copilot') !== -1) {
      warnings.push('At ' + S.hoursSaved + ' hrs/wk saved, Copilot ROI is marginal. Invest in training to drive adoption above 2 hrs/wk.');
    }

    el.innerHTML = warnings.map(function (w) {
      return '<div class="aicost-warning"><span class="aicost-warning-icon">⚠️</span><span>' + esc(w) + '</span></div>';
    }).join('');
  }

  /* ── RENDER: Assumptions Drawer ────────────────────────────── */

  function renderAssumptions() {
    var el = $('assumptions-body');
    if (!el) return;

    var confLabel = S.confidenceLevel === 'conservative' ? 'Conservative (+25%)' : S.confidenceLevel === 'optimistic' ? 'Optimistic (-20%)' : 'Expected';
    var profileLabel = S.userProfile === 'executive' ? 'Executive-heavy (training ×1.3)' : S.userProfile === 'technical' ? 'Technical (training ×0.7, ops ×1.2)' : S.userProfile === 'mixed' ? 'Mixed (training ×1.1)' : 'Knowledge workers (baseline)';
    var perUserTrain = TRAINING[S.training] || 150;

    el.innerHTML = '<table>' +
      '<tr><td>Training cost/user</td><td>' + fmtUSD(perUserTrain) + ' (' + S.training.replace(/_/g, ' ') + ')</td></tr>' +
      '<tr><td>Training hours/user</td><td>' + TRAINING.training_hours_per_user + ' hours</td></tr>' +
      '<tr><td>Admin hourly rate</td><td>' + fmtUSD(OPS.average_admin_hourly_rate || 75) + '/hr</td></tr>' +
      '<tr><td>Support hourly rate</td><td>' + fmtUSD(OPS.average_support_hourly_rate || 50) + '/hr</td></tr>' +
      '<tr><td>Admin FTE per 100 users</td><td>' + ((OPS.admin_fte_fraction_per_100_users || 0.05) * 100).toFixed(0) + '%</td></tr>' +
      '<tr><td>Confidence level</td><td>' + confLabel + '</td></tr>' +
      '<tr><td>User profile</td><td>' + profileLabel + '</td></tr>' +
      '<tr><td>EA/CSP discount</td><td>' + S.discount + '%</td></tr>' +
      '<tr><td>Currency</td><td>' + S.currency + (S.currency !== 'USD' ? ' (rate: ' + currRate() + ')' : '') + '</td></tr>' +
      '<tr><td colspan="2" style="padding-top:0.5rem;color:rgba(255,255,255,0.4)">Sources: Forrester TEI, Microsoft Copilot Success Kit, Gartner AI TCO Framework</td></tr>' +
    '</table>';
  }

  /* ── RENDER: Board-Ready Bullets ────────────────────────────── */

  function renderBoardBullets() {
    var el = $('board-bullets-content');
    if (!el) return;

    var planLabel = (BASE_PLANS[S.plan] || {}).name || S.plan;
    var biggest = 'licensing';
    var biggestVal = S.costs.licensing;
    ['implementation', 'training', 'governance', 'operations'].forEach(function (k) {
      if (S.costs[k] > biggestVal) { biggest = k; biggestVal = S.costs[k]; }
    });

    var strategy = S.aiTools.length <= 1 ? 'Copilot-only' : S.aiTools.length <= 3 ? 'Multi-AI' : 'Broad AI';
    var bullets = [
      '<strong>Recommended path:</strong> ' + strategy + ' strategy on ' + esc(planLabel) + ' for ' + Math.round(S.users * S.rolloutPct / 100).toLocaleString() + ' users (' + pct(S.rolloutPct) + ' rollout).',
      '<strong>Year 1 budget:</strong> ' + fmt(S.year1) + ' total (' + fmtDec(S.year1 / 12 / S.users) + '/user/month). Steady state Year 2+: ' + fmt(S.year2) + '/year.',
      '<strong>Main hidden cost:</strong> ' + biggest.charAt(0).toUpperCase() + biggest.slice(1) + ' at ' + fmt(biggestVal) + '. Licensing is only ' + pct(S.costs.licensing / S.year1 * 100) + ' of Year 1 spend.'
    ];

    el.innerHTML = bullets.map(function (b, i) {
      return '<div class="aicost-board-bullet"><span class="num">' + (i + 1) + '</span><span>' + b + '</span></div>';
    }).join('');
  }

  function copyBoardBullets() {
    var planLabel = (BASE_PLANS[S.plan] || {}).name || S.plan;
    var biggest = 'licensing';
    var biggestVal = S.costs.licensing;
    ['implementation', 'training', 'governance', 'operations'].forEach(function (k) {
      if (S.costs[k] > biggestVal) { biggest = k; biggestVal = S.costs[k]; }
    });
    var strategy = S.aiTools.length <= 1 ? 'Copilot-only' : S.aiTools.length <= 3 ? 'Multi-AI' : 'Broad AI';

    var text = '1. Recommended path: ' + strategy + ' on ' + planLabel + ' for ' + pct(S.rolloutPct) + ' rollout (' + Math.round(S.users * S.rolloutPct / 100) + ' users)\n' +
      '2. Year 1 budget: ' + fmt(S.year1) + ' total. Steady state: ' + fmt(S.year2) + '/yr\n' +
      '3. Main hidden cost: ' + biggest + ' at ' + fmt(biggestVal) + ' — licensing is only ' + pct(S.costs.licensing / S.year1 * 100) + ' of Year 1\n';

    navigator.clipboard.writeText(text).then(function () {
      var btn = $('btn-copy-bullets');
      if (btn) { btn.textContent = 'Copied!'; setTimeout(function () { btn.textContent = 'Copy 3 Bullets'; }, 2000); }
    });
  }

  /* ── RENDER: History Delta ─────────────────────────────────── */

  function renderHistoryDelta() {
    var deltaEl = $('history-delta');
    if (!deltaEl) return;
    var history = [];
    try { history = JSON.parse(localStorage.getItem('aicost_history') || '[]'); } catch (e) {}
    if (history.length < 1) { deltaEl.innerHTML = ''; return; }

    var last = history[0];
    var dy1 = S.year1 - (last.year1 || 0);
    var d3yr = S.total3yr - (last.total3yr || 0);
    var dpu = (S.users > 0 ? S.year1 / 12 / S.users : 0) - (last.perUser || 0);

    function deltaCls(v) { return v > 0 ? 'aicost-delta-up' : v < 0 ? 'aicost-delta-down' : 'aicost-delta-same'; }
    function deltaFmt(v) { return (v > 0 ? '+' : '') + fmt(v); }

    deltaEl.innerHTML = '<div class="aicost-delta">' +
      '<div class="aicost-delta-title">vs last saved (' + esc(last.orgName || 'Previous') + ', ' + esc(last.date || '') + ')</div>' +
      '<div class="aicost-delta-row"><span>Year 1</span><span class="' + deltaCls(dy1) + '">' + deltaFmt(dy1) + '</span></div>' +
      '<div class="aicost-delta-row"><span>3-Year</span><span class="' + deltaCls(d3yr) + '">' + deltaFmt(d3yr) + '</span></div>' +
      '<div class="aicost-delta-row"><span>Per User/Mo</span><span class="' + deltaCls(dpu) + '">' + (dpu > 0 ? '+' : '') + fmtDec(dpu) + '</span></div>' +
    '</div>';
  }

  /* ── EXECUTIVE SUMMARY ─────────────────────────────────────── */

  function renderExecSummary() {
    var el = $('exec-summary');
    if (!el) return;

    var orgName = ($('org-name') || {}).value || 'Your Organisation';
    var planLabel = (BASE_PLANS[S.plan] || {}).name || S.plan;
    var toolNames = S.aiTools.map(function (id) { return (PLATFORMS[id] || {}).name || id; }).join(', ');
    var date = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    var recs = [];
    if (S.plan !== 'e7' && S.aiTools.indexOf('m365-copilot') !== -1 && S.aiTools.indexOf('agent-365') !== -1) {
      recs.push('Consider upgrading to E7 which bundles Copilot + Agent 365 at $99/user — may save vs buying separately.');
    }
    if (S.users > 500) {
      recs.push('At ' + S.users.toLocaleString() + '+ users, negotiate an Enterprise Agreement for volume discounts (typically 10-15% off list price).');
    }
    if (S.training === 'self_serve') {
      recs.push('Self-serve training has lowest upfront cost but typically achieves 40-60% adoption. Consider train-the-trainer for better ROI.');
    }

    el.innerHTML =
      '<div class="aicost-summary-header">' +
        '<div class="aicost-summary-title">AI Adoption Cost Estimate — ' + esc(orgName) + '</div>' +
        '<div class="aicost-summary-subtitle">Generated ' + date + '</div>' +
      '</div>' +

      '<div class="aicost-summary-section">' +
        '<h3>Investment Summary</h3>' +
        '<table class="aicost-table"><tbody>' +
          '<tr><td>Total 3-Year Investment</td><td class="right"><strong>' + fmt(S.total3yr) + '</strong></td></tr>' +
          '<tr><td>Year 1 (includes one-time costs)</td><td class="right">' + fmt(S.year1) + '</td></tr>' +
          '<tr><td>Annual Run Rate (Year 2+)</td><td class="right">' + fmt(S.year2) + '</td></tr>' +
          '<tr><td>Per-User Monthly Cost</td><td class="right">' + fmtDec(S.year1 / 12 / S.users) + '</td></tr>' +
        '</tbody></table>' +
      '</div>' +

      '<div class="aicost-summary-section">' +
        '<h3>Cost Breakdown (Year 1)</h3>' +
        '<table class="aicost-table"><tbody>' +
          '<tr><td>Licensing</td><td class="right">' + fmt(S.costs.licensing) + ' (' + pct(S.costs.licensing / S.year1 * 100) + ')</td></tr>' +
          '<tr><td>Implementation</td><td class="right">' + fmt(S.costs.implementation) + '</td></tr>' +
          '<tr><td>Training</td><td class="right">' + fmt(S.costs.training) + '</td></tr>' +
          '<tr><td>Governance</td><td class="right">' + fmt(S.costs.governance) + '</td></tr>' +
          '<tr><td>Operations</td><td class="right">' + fmt(S.costs.operations) + '</td></tr>' +
        '</tbody></table>' +
      '</div>' +

      '<div class="aicost-summary-section">' +
        '<h3>Key Assumptions</h3>' +
        '<table class="aicost-table"><tbody>' +
          '<tr><td>Organisation size</td><td class="right">' + S.users.toLocaleString() + ' users</td></tr>' +
          '<tr><td>AI rollout</td><td class="right">' + pct(S.rolloutPct) + ' in Year 1</td></tr>' +
          '<tr><td>Base plan</td><td class="right">' + esc(planLabel) + '</td></tr>' +
          '<tr><td>AI tools</td><td class="right">' + esc(toolNames || 'None selected') + '</td></tr>' +
          '<tr><td>Training approach</td><td class="right">' + S.training.replace(/_/g, ' ') + '</td></tr>' +
          '<tr><td>Implementation support</td><td class="right">' + S.support.replace(/_/g, ' ') + '</td></tr>' +
        '</tbody></table>' +
      '</div>' +

      (recs.length > 0 ? '<div class="aicost-summary-section"><h3>Recommendations</h3>' +
        recs.map(function (r) { return '<div class="aicost-recommendation">' + esc(r) + '</div>'; }).join('') +
      '</div>' : '') +

      '<div style="color:rgba(255,255,255,0.35);font-size:0.75rem;margin-top:2rem;padding-top:1rem;border-top:1px solid rgba(255,255,255,0.06)">' +
        'This estimate is based on published list prices as of ' + date + '. Actual costs vary based on EA/CSP agreements, regional pricing, and implementation complexity. Use as a planning tool, not a quote. Verify current pricing at official vendor pages.' +
      '</div>';
  }

  /* ── COPY / PRINT / SHARE ──────────────────────────────────── */

  function copyExecSummary() {
    var el = $('exec-summary');
    if (!el) return;

    var orgName = ($('org-name') || {}).value || 'Your Organisation';
    var planLabel = (BASE_PLANS[S.plan] || {}).name || S.plan;

    var md = '# AI Adoption Cost Estimate — ' + orgName + '\n\n' +
      '## Investment Summary\n' +
      '| Metric | Value |\n|--------|-------|\n' +
      '| 3-Year Total | ' + fmt(S.total3yr) + ' |\n' +
      '| Year 1 | ' + fmt(S.year1) + ' |\n' +
      '| Year 2+ Run Rate | ' + fmt(S.year2) + ' |\n' +
      '| Per User/Month | ' + fmtDec(S.year1 / 12 / S.users) + ' |\n\n' +
      '## Assumptions\n' +
      '- ' + S.users + ' users, ' + pct(S.rolloutPct) + ' rollout, ' + planLabel + '\n' +
      '- Training: ' + S.training.replace(/_/g, ' ') + '\n' +
      '- Support: ' + S.support.replace(/_/g, ' ') + '\n\n' +
      '*Generated by aguidetocloud.com/ai-cost-calculator/*\n';

    navigator.clipboard.writeText(md).then(function () {
      var btn = $('btn-copy-summary');
      if (btn) { btn.textContent = 'Copied!'; setTimeout(function () { btn.textContent = 'Copy as Markdown'; }, 2000); }
    });
  }

  function shareUrl() {
    var params = new URLSearchParams();
    params.set('u', S.users);
    params.set('p', S.plan);
    params.set('r', S.rolloutPct);
    params.set('t', S.training);
    params.set('s', S.support);
    params.set('ai', S.aiTools.join(','));
    if (S.aiTools.indexOf('other') !== -1) params.set('oc', S.otherCost);
    if (S.includeBase) params.set('ib', '1');
    if (S.trainTiming !== 'before') params.set('tt', S.trainTiming);

    var url = window.location.origin + window.location.pathname + '?' + params.toString();
    navigator.clipboard.writeText(url).then(function () {
      var btn = $('btn-share');
      if (btn) { btn.textContent = 'Link Copied!'; setTimeout(function () { btn.textContent = 'Share Link'; }, 2000); }
    });
  }

  /* ── SAVE TO HISTORY ─────────────────────────────────────────── */

  function saveToHistory() {
    try {
      var history = JSON.parse(localStorage.getItem('aicost_history') || '[]');
      var entry = {
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        orgName: ($('org-name') || {}).value || 'Untitled',
        users: S.users,
        plan: (BASE_PLANS[S.plan] || {}).name || S.plan,
        year1: S.year1,
        total3yr: S.total3yr,
        perUser: S.users > 0 ? S.year1 / 12 / S.users : 0
      };
      history.unshift(entry);
      if (history.length > 10) history = history.slice(0, 10);
      localStorage.setItem('aicost_history', JSON.stringify(history));
      renderHistory();
      var btn = $('btn-save-history');
      if (btn) { btn.textContent = 'Saved!'; setTimeout(function () { btn.textContent = 'Save to History'; }, 2000); }
    } catch (e) { /* private browsing */ }
  }

  function clearHistory() {
    try { localStorage.removeItem('aicost_history'); } catch (e) {}
    renderHistory();
  }

  function renderHistory() {
    var container = $('history-list');
    var wrap = $('calc-history');
    if (!container || !wrap) return;

    var history = [];
    try { history = JSON.parse(localStorage.getItem('aicost_history') || '[]'); } catch (e) {}

    if (history.length === 0) {
      wrap.style.display = 'none';
      return;
    }
    wrap.style.display = 'block';
    container.innerHTML = '';

    history.forEach(function (h, i) {
      container.innerHTML += '<div class="aicost-history-item">' +
        '<span class="label">' + esc(h.date) + ' — ' + esc(h.orgName) + ' (' + (h.users || 0).toLocaleString() + ' users, ' + esc(h.plan || '') + ')</span>' +
        '<span class="value">' + fmt(h.year1) + '/yr</span>' +
      '</div>';
    });
  }

  /* ── URL STATE & LOCALSTORAGE ──────────────────────────────── */

  function loadFromUrl() {
    var params = new URLSearchParams(window.location.search);
    if (!params.has('u')) return false;

    var usersEl = $('in-users');
    var usersRange = $('in-users-range');
    var planEl = $('in-plan');
    var rolloutEl = $('in-rollout');
    var rolloutRange = $('in-rollout-range');

    var u = parseInt(params.get('u'));
    if (u && usersEl) { usersEl.value = u; if (usersRange) usersRange.value = Math.min(u, 10000); }
    var p = params.get('p');
    if (p && planEl) planEl.value = p;
    var r = parseInt(params.get('r'));
    if (r && rolloutEl) { rolloutEl.value = r; if (rolloutRange) rolloutRange.value = r; }

    var t = params.get('t');
    if (t) {
      var radio = $q('input[name="training"][value="' + t + '"]');
      if (radio) { radio.checked = true; radio.dispatchEvent(new Event('change')); }
    }
    var s = params.get('s');
    if (s) {
      var sRadio = $q('input[name="support"][value="' + s + '"]');
      if (sRadio) { sRadio.checked = true; sRadio.dispatchEvent(new Event('change')); }
    }

    var ai = params.get('ai');
    if (ai) {
      var tools = ai.split(',');
      $qa('#ai-strategy-checks input[type="checkbox"]').forEach(function (cb) {
        cb.checked = tools.indexOf(cb.value) !== -1;
        var label = cb.closest('.aicost-check');
        if (cb.checked) label.classList.add('checked');
        else label.classList.remove('checked');
        if (cb.value === 'other' && cb.checked) {
          var wrap = $('other-cost-wrap');
          if (wrap) wrap.style.display = 'block';
        }
      });
    }

    var oc = params.get('oc');
    if (oc) {
      var ocEl = $('in-other-cost');
      if (ocEl) ocEl.value = oc;
    }

    if (params.get('ib') === '1') {
      var ibEl = $('in-include-base');
      if (ibEl) ibEl.checked = true;
    }
    var tt = params.get('tt');
    if (tt) {
      var ttRadio = $q('input[name="train-timing"][value="' + tt + '"]');
      if (ttRadio) { ttRadio.checked = true; ttRadio.dispatchEvent(new Event('change')); }
    }

    // Clean URL
    window.history.replaceState({}, '', window.location.pathname);
    return true;
  }

  function saveState() {
    try {
      localStorage.setItem('aicost_v1', JSON.stringify({
        users: S.users, plan: S.plan, aiTools: S.aiTools,
        rolloutPct: S.rolloutPct, training: S.training, support: S.support,
        otherCost: S.otherCost, includeBase: S.includeBase, trainTiming: S.trainTiming,
        discount: S.discount, confidenceLevel: S.confidenceLevel, currency: S.currency,
        userProfile: S.userProfile, hoursSaved: S.hoursSaved
      }));
    } catch (e) { /* private browsing */ }
  }

  function loadFromStorage() {
    try {
      var data = JSON.parse(localStorage.getItem('aicost_v1'));
      if (!data) return false;

      if (data.users) { $('in-users').value = data.users; $('in-users-range').value = Math.min(data.users, 10000); }
      if (data.plan) $('in-plan').value = data.plan;
      if (data.rolloutPct) { $('in-rollout').value = data.rolloutPct; $('in-rollout-range').value = data.rolloutPct; }
      if (data.training) {
        $qa('.aicost-radio-group[aria-label="Training approach"] .aicost-radio').forEach(function (l) { l.classList.remove('selected'); });
        var r = $q('input[name="training"][value="' + data.training + '"]');
        if (r) { r.checked = true; r.closest('.aicost-radio').classList.add('selected'); }
      }
      if (data.support) {
        $qa('.aicost-radio-group[aria-label="Implementation support level"] .aicost-radio').forEach(function (l) { l.classList.remove('selected'); });
        var sr = $q('input[name="support"][value="' + data.support + '"]');
        if (sr) { sr.checked = true; sr.closest('.aicost-radio').classList.add('selected'); }
      }
      if (data.aiTools) {
        $qa('#ai-strategy-checks input[type="checkbox"]').forEach(function (cb) {
          cb.checked = data.aiTools.indexOf(cb.value) !== -1;
          var label = cb.closest('.aicost-check');
          if (cb.checked) label.classList.add('checked');
          else label.classList.remove('checked');
          if (cb.value === 'other' && cb.checked) {
            var wrap = $('other-cost-wrap');
            if (wrap) wrap.style.display = 'block';
          }
        });
      }
      if (data.otherCost) { var oc = $('in-other-cost'); if (oc) oc.value = data.otherCost; }
      if (data.includeBase) { var ib = $('in-include-base'); if (ib) ib.checked = true; }
      if (data.trainTiming) {
        $qa('.aicost-radio-group[aria-label="Training timing relative to rollout"] .aicost-radio').forEach(function (l) { l.classList.remove('selected'); });
        var tt = $q('input[name="train-timing"][value="' + data.trainTiming + '"]');
        if (tt) { tt.checked = true; tt.closest('.aicost-radio').classList.add('selected'); }
      }
      if (data.discount) { var de = $('in-discount'); var dr = $('in-discount-range'); if (de) de.value = data.discount; if (dr) dr.value = data.discount; }
      if (data.currency) { var ce = $('in-currency'); if (ce) ce.value = data.currency; }
      if (data.userProfile) { var pe = $('in-profile'); if (pe) pe.value = data.userProfile; }
      if (data.hoursSaved) { var he = $('in-hours'); var hr2 = $('in-hours-range'); if (he) he.value = data.hoursSaved; if (hr2) hr2.value = data.hoursSaved; }
      if (data.confidenceLevel) {
        $qa('.aicost-conf-btn').forEach(function (b) { b.classList.remove('active'); });
        var cb2 = $q('.aicost-conf-btn[data-conf="' + data.confidenceLevel + '"]');
        if (cb2) cb2.classList.add('active');
      }

      return true;
    } catch (e) { return false; }
  }

  /* ── INIT ──────────────────────────────────────────────────── */

  function init() {
    initTabs();
    initInputSync();
    initUseCasePresets();

    // Load state: URL params > localStorage > defaults
    var loaded = loadFromUrl() || loadFromStorage();

    // Render saved history
    renderHistory();

    // Initial calculation (auto-calculates on page load with defaults)
    recalc();
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
