/* ==================================================================
   Copilot ROI Calculator v2 — roi-calculator.js
   100 % client-side. Zero API calls.
   ================================================================== */

(function () {
  'use strict';

  /* ── CONSTANTS ────────────────────────────────────────────── */

  const PRICING = {
    'bus-std':  { label: 'Business Standard + Copilot', total: 42.50, base: 12.50, copilotRRP: 30.00 },
    'bus-prem': { label: 'Business Premium + Copilot',  total: 52.00, base: 22.00, copilotRRP: 30.00 },
    'e3':       { label: 'E3 + Copilot add-on',         total: 69.00, base: 39.00, copilotRRP: 30.00 },
    'e5':       { label: 'E5 + Copilot add-on',         total: 90.00, base: 60.00, copilotRRP: 30.00 },
    'e7':       { label: 'E7 (Frontier Suite)',          total: 99.00, base: 99.00, copilotRRP: 30.00 }
  };

  const ROLE_DATA = {
    'executive':  { label: 'Executive / Leadership', c: 2.0, m: 4.0, a: 6.0 },
    'sales':      { label: 'Sales',                  c: 1.5, m: 3.0, a: 5.0 },
    'marketing':  { label: 'Marketing',              c: 1.5, m: 3.0, a: 4.5 },
    'hr':         { label: 'HR',                     c: 1.0, m: 2.5, a: 4.0 },
    'finance':    { label: 'Finance / Accounting',   c: 1.0, m: 2.0, a: 3.5 },
    'it':         { label: 'IT Admin',               c: 1.5, m: 2.5, a: 4.0 },
    'developer':  { label: 'Developer',              c: 1.0, m: 2.0, a: 3.5 },
    'support':    { label: 'Customer Support',       c: 1.0, m: 2.0, a: 3.0 },
    'legal':      { label: 'Legal / Compliance',     c: 1.5, m: 3.0, a: 4.5 },
    'pm':         { label: 'Project Manager',        c: 1.5, m: 3.0, a: 4.5 },
    'general':    { label: 'General / Other',        c: 1.0, m: 2.0, a: 3.0 }
  };

  const ADOPTION = {
    conservative: [.15,.20,.30,.35,.40,.45,.48,.50,.52,.53,.54,.55,.56,.57,.57,.58,.58,.59,.59,.59,.60,.60,.60,.60,.61,.61,.62,.62,.63,.63,.64,.64,.64,.65,.65,.65],
    moderate:     [.30,.38,.50,.55,.60,.65,.68,.70,.72,.73,.74,.75,.76,.77,.77,.78,.78,.79,.79,.79,.80,.80,.80,.80,.81,.82,.82,.83,.83,.84,.84,.84,.85,.85,.85,.85],
    aggressive:   [.50,.58,.70,.74,.78,.80,.83,.85,.87,.88,.89,.90,.91,.91,.92,.92,.93,.93,.93,.94,.94,.94,.95,.95,.95,.95,.95,.95,.95,.95,.95,.95,.95,.95,.95,.95]
  };

  const FORRESTER_BENCHMARK = { smb: 353, enterprise: 116 };
  const WEEKS_PER_YEAR = 52;
  const HOURS_PER_WEEK = 40;
  const MONTHS_PER_YEAR = 12;

  /* ── UTILITIES ────────────────────────────────────────────── */

  const $ = id => document.getElementById(id);
  const $q = s => document.querySelector(s);
  const $qa = s => document.querySelectorAll(s);

  function fmt(n) {
    if (n < 0) return '-' + fmt(-n);
    if (n >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M';
    return '$' + Math.round(n).toLocaleString('en-US');
  }
  function fmtFull(n) { return (n < 0 ? '-$' : '$') + Math.abs(Math.round(n)).toLocaleString('en-US'); }
  function pct(n) { return Math.round(n) + '%'; }

  function hourlyRate(salary, overhead) {
    return (salary / (WEEKS_PER_YEAR * HOURS_PER_WEEK)) * overhead;
  }

  function getRoleHours(key, scenario) {
    const d = ROLE_DATA[key];
    if (!d) return 2.0;
    return scenario === 'conservative' ? d.c : scenario === 'aggressive' ? d.a : d.m;
  }

  function annualWithAdoption(users, hRate, hpw, curve, yearIdx) {
    let total = 0;
    const start = yearIdx * 12;
    for (let m = 0; m < 12; m++) {
      const idx = Math.min(start + m, curve.length - 1);
      total += users * hRate * hpw * curve[idx] * (WEEKS_PER_YEAR / MONTHS_PER_YEAR);
    }
    return total;
  }

  function paybackMonth(users, hRate, hpw, curve, monthlyCopilotCost, implCost) {
    let cs = 0, cc = implCost || 0;
    for (let m = 0; m < 36; m++) {
      cs += users * hRate * hpw * curve[Math.min(m, curve.length - 1)] * (WEEKS_PER_YEAR / MONTHS_PER_YEAR);
      cc += users * monthlyCopilotCost;
      if (cs >= cc) return m + 1;
    }
    return 0; // 36+
  }

  /* ── ANIMATION ────────────────────────────────────────────── */

  const _prev = {};
  function animVal(el, target, formatter) {
    const key = el.id || el.className;
    const from = _prev[key] || 0;
    _prev[key] = target;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = formatter(target);
      return;
    }
    const dur = 500, t0 = performance.now();
    (function step(ts) {
      const p = Math.min((ts - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = formatter(from + (target - from) * e);
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ── SHARED STATE ─────────────────────────────────────────── */

  const S = {
    users: 100, salary: 75000, plan: 'e3', scenario: 'moderate',
    overhead: 1.3, customCopilotCost: null,  // null = use RRP
    get copilotCost() {
      return this.customCopilotCost !== null ? this.customCopilotCost : PRICING[this.plan].copilotRRP;
    },
    get hRate() { return hourlyRate(this.salary, this.overhead); },
    get curve() { return ADOPTION[this.scenario]; },
    // impl costs
    training: 100, changeMgmt: 20000, dataGov: 40000, adminHours: 80, adminRate: 75,
    get implCost() { return (this.training * this.users) + this.changeMgmt + this.dataGov + (this.adminHours * this.adminRate); },
    // computed
    hpw(scenario) {
      scenario = scenario || this.scenario;
      // weighted average from default role mix
      const weights = [['executive',5],['sales',20],['marketing',10],['it',10],['hr',5],['finance',10],['support',15],['pm',5],['general',20]];
      let totalHC = 0, weightedH = 0;
      weights.forEach(([r, hc]) => { totalHC += hc; weightedH += hc * getRoleHours(r, scenario); });
      return totalHC > 0 ? weightedH / totalHC : 2.0;
    },
    y(yearIdx, scenario) {
      scenario = scenario || this.scenario;
      return annualWithAdoption(this.users, this.hRate, this.hpw(scenario), ADOPTION[scenario], yearIdx);
    },
    total3yr(scenario) { return this.y(0, scenario) + this.y(1, scenario) + this.y(2, scenario); },
    cost3yr(scenario) { return this.users * this.copilotCost * 36; },
    roi3yr(scenario) {
      const c = this.cost3yr(scenario) + this.implCost;
      return c > 0 ? ((this.total3yr(scenario) - c) / c) * 100 : 0;
    },
    net3yr(scenario) { return this.total3yr(scenario) - this.cost3yr(scenario) - this.implCost; },
    payback(scenario) {
      scenario = scenario || this.scenario;
      return paybackMonth(this.users, this.hRate, this.hpw(scenario), ADOPTION[scenario], this.copilotCost, this.implCost);
    }
  };

  /* ── URL STATE ────────────────────────────────────────────── */

  function stateToURL() {
    const p = new URLSearchParams();
    p.set('u', S.users); p.set('s', S.salary); p.set('p', S.plan); p.set('sc', S.scenario);
    if (S.customCopilotCost !== null) p.set('cc', S.customCopilotCost);
    if (S.overhead !== 1.3) p.set('oh', S.overhead);
    const url = new URL(window.location);
    url.search = p.toString();
    history.replaceState(null, '', url);
  }

  function stateFromURL() {
    const p = new URLSearchParams(window.location.search);
    if (p.has('u')) S.users = parseInt(p.get('u')) || 100;
    if (p.has('s')) S.salary = parseInt(p.get('s')) || 75000;
    if (p.has('p') && PRICING[p.get('p')]) S.plan = p.get('p');
    if (p.has('sc') && ADOPTION[p.get('sc')]) S.scenario = p.get('sc');
    if (p.has('cc')) S.customCopilotCost = parseFloat(p.get('cc'));
    if (p.has('oh')) S.overhead = parseFloat(p.get('oh')) || 1.3;
  }

  /* ── TAB SWITCHING ────────────────────────────────────────── */

  function initTabs() {
    const tabs = $qa('.roi-tab'), panels = $qa('.roi-panel');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => { t.classList.remove('roi-tab-active'); t.setAttribute('aria-selected', 'false'); });
        panels.forEach(p => { p.classList.remove('roi-panel-active'); p.hidden = true; });
        tab.classList.add('roi-tab-active'); tab.setAttribute('aria-selected', 'true');
        const panel = $(tab.getAttribute('aria-controls'));
        panel.classList.add('roi-panel-active'); panel.hidden = false;
        if (tab.dataset.tab === 'roles') calcRoles();
        if (tab.dataset.tab === 'costs') calcCosts();
        if (tab.dataset.tab === 'scenarios') calcScenarios();
        if (tab.dataset.tab === 'summary') buildSummary();
      });
      tab.addEventListener('keydown', e => {
        const all = Array.from(tabs), i = all.indexOf(tab);
        if (e.key === 'ArrowRight' && i < all.length - 1) { all[i + 1].focus(); e.preventDefault(); }
        if (e.key === 'ArrowLeft' && i > 0) { all[i - 1].focus(); e.preventDefault(); }
      });
    });
  }

  /* ── TAB 1: QUICK CALCULATOR ──────────────────────────────── */

  function readQuickInputs() {
    S.users = parseInt($('roi-users').value) || 100;
    S.salary = parseInt($('roi-salary').value) || 75000;
    S.plan = $('roi-plan').value;
    S.scenario = ($q('input[name="roi-scenario"]:checked') || {}).value || 'moderate';
    // custom cost
    const customEl = $('roi-custom-cost');
    if (customEl && $('roi-cost-toggle') && $('roi-cost-toggle').checked) {
      S.customCopilotCost = parseFloat(customEl.value) || null;
    } else {
      S.customCopilotCost = null;
    }
    // overhead
    const ohEl = $('roi-overhead');
    if (ohEl) S.overhead = parseFloat(ohEl.value) || 1.3;
  }

  function calcQuick() {
    readQuickInputs();
    const pricing = PRICING[S.plan];

    // update displays
    $('roi-hourly-rate').textContent = '$' + S.hRate.toFixed(2);
    $('roi-copilot-cost-display').textContent = '$' + S.copilotCost.toFixed(2);
    const rrpHint = $('roi-rrp-hint');
    if (rrpHint) {
      rrpHint.textContent = S.customCopilotCost !== null
        ? 'Custom price (RRP: $' + pricing.copilotRRP.toFixed(2) + ')'
        : 'RRP — using public list price';
    }

    const hpw = S.hpw();
    const y1 = S.y(0), y2 = S.y(1), y3 = S.y(2);
    const totalSavings = y1 + y2 + y3;
    const annualLicence = S.users * S.copilotCost * 12;
    const totalCost = annualLicence * 3;
    const monthlySavings = y1 / 12;
    const roi = totalCost > 0 ? ((totalSavings - totalCost) / totalCost) * 100 : 0;
    const netGain = totalSavings - totalCost;
    const pb = S.payback();

    // per-user metrics
    const netPerUserMonth = S.users > 0 ? netGain / 36 / S.users : 0;
    const savingsPerUserMonth = S.users > 0 ? monthlySavings / S.users : 0;
    // month 12 run rate
    const m12Adoption = S.curve[11];
    const m12RunRate = S.users * S.hRate * hpw * m12Adoption * (WEEKS_PER_YEAR / MONTHS_PER_YEAR);

    // update DOM
    const results = $('roi-results-live');
    if (results) results.setAttribute('aria-busy', 'true');

    animVal($('roi-monthly-savings'), monthlySavings, fmt);
    animVal($('roi-annual-savings'), y1, fmt);
    animVal($('roi-net-gain'), netGain, fmt);

    $('roi-percentage').textContent = pct(roi);
    const badge = $('roi-badge');
    if (roi < 50) { badge.textContent = 'Low'; badge.className = 'roi-metric-badge roi-badge-low'; }
    else if (roi < 150) { badge.textContent = 'Good'; badge.className = 'roi-metric-badge roi-badge-mid'; }
    else { badge.textContent = 'Strong'; badge.className = 'roi-metric-badge roi-badge-high'; }

    $('roi-payback').textContent = pb > 0 ? pb + ' mo' : '36+';

    // per-user metrics
    $('roi-per-user-savings').textContent = fmt(savingsPerUserMonth) + '/mo';
    $('roi-per-user-net').textContent = fmtFull(netPerUserMonth) + '/mo';
    $('roi-m12-runrate').textContent = fmt(m12RunRate) + '/mo';

    // mini chart
    const maxVal = Math.max(totalCost, totalSavings, 1);
    $('roi-bar-cost').style.width = (totalCost / maxVal * 100) + '%';
    $('roi-bar-savings').style.width = (totalSavings / maxVal * 100) + '%';
    $('roi-bar-cost-val').textContent = fmt(totalCost);
    $('roi-bar-savings-val').textContent = fmt(totalSavings);

    // benchmark comparison
    const benchRef = S.users > 300 ? FORRESTER_BENCHMARK.enterprise : FORRESTER_BENCHMARK.smb;
    const benchLabel = S.users > 300 ? 'Forrester enterprise benchmark' : 'Forrester SMB benchmark';
    const benchEl = $('roi-benchmark');
    if (benchEl) {
      if (roi > benchRef) {
        benchEl.innerHTML = '📈 <strong>Above</strong> ' + benchLabel + ' (' + pct(benchRef) + ' ROI)';
        benchEl.className = 'roi-benchmark roi-bench-above';
      } else {
        benchEl.innerHTML = '📉 <strong>Below</strong> ' + benchLabel + ' (' + pct(benchRef) + ' ROI)';
        benchEl.className = 'roi-benchmark roi-bench-below';
      }
    }

    // narrative
    const narrativeEl = $('roi-narrative');
    if (narrativeEl) {
      const planLabel = pricing.label;
      const paybackText = pb > 0 ? 'break even in <strong>' + pb + ' months</strong>' : '<strong>not break even within 36 months</strong>';
      let narrative = 'With <strong>' + S.users.toLocaleString() + ' users</strong> on ' + planLabel;
      if (S.customCopilotCost !== null) narrative += ' (at your negotiated <strong>$' + S.copilotCost.toFixed(2) + '</strong>/user/mo)';
      narrative += ' under a <strong>' + S.scenario + '</strong> adoption scenario, your organisation would ' + paybackText + '.';
      narrative += ' By Year 3, projected net gain is <strong>' + fmt(netGain) + '</strong>';
      narrative += ' — that\'s <strong>' + fmt(netPerUserMonth) + ' net value per user per month</strong>.';
      if (S.scenario === 'conservative') narrative += ' 💡 <em>Investing in adoption programmes could push you to moderate scenario and significantly improve ROI.</em>';
      narrativeEl.innerHTML = narrative;
    }

    if (results) setTimeout(() => results.setAttribute('aria-busy', 'false'), 100);
    stateToURL();
  }

  function initQuickCalc() {
    [['roi-users-range', 'roi-users'], ['roi-salary-range', 'roi-salary']].forEach(([rId, nId]) => {
      const r = $(rId), n = $(nId);
      r.addEventListener('input', () => { n.value = r.value; calcQuick(); });
      n.addEventListener('input', () => { r.value = n.value; calcQuick(); });
    });
    $('roi-plan').addEventListener('change', () => {
      // update RRP display and custom cost placeholder
      const p = PRICING[$('roi-plan').value];
      const cc = $('roi-custom-cost');
      if (cc) cc.placeholder = p.copilotRRP.toFixed(2);
      calcQuick();
    });
    $qa('input[name="roi-scenario"]').forEach(r => {
      r.addEventListener('change', () => {
        $qa('.roi-radio').forEach(l => l.classList.remove('roi-radio-selected'));
        r.closest('.roi-radio').classList.add('roi-radio-selected');
        calcQuick();
      });
    });

    // custom cost toggle
    const toggle = $('roi-cost-toggle');
    if (toggle) {
      toggle.addEventListener('change', () => {
        const wrap = $('roi-custom-cost-wrap');
        if (wrap) wrap.style.display = toggle.checked ? 'flex' : 'none';
        calcQuick();
      });
    }
    const ccInput = $('roi-custom-cost');
    if (ccInput) ccInput.addEventListener('input', calcQuick);

    // overhead selector
    const ohEl = $('roi-overhead');
    if (ohEl) ohEl.addEventListener('change', calcQuick);

    // presets
    $qa('.roi-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $('roi-users').value = btn.dataset.users; $('roi-users-range').value = btn.dataset.users;
        $('roi-salary').value = btn.dataset.salary; $('roi-salary-range').value = btn.dataset.salary;
        $('roi-plan').value = btn.dataset.plan;
        calcQuick();
      });
    });

    // share button
    const shareBtn = $('roi-share-url');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
          shareBtn.textContent = '✅ Link copied!';
          setTimeout(() => { shareBtn.textContent = '🔗 Share Link'; }, 2000);
        });
      });
    }
  }

  /* ── TAB 2: ROLE-BASED ────────────────────────────────────── */

  let roleIdN = 0;

  function addRoleRow(roleKey, headcount, salary) {
    roleKey = roleKey || 'general';
    headcount = headcount || 10;
    salary = salary || S.salary;
    const id = 'role-' + (++roleIdN);
    const scenario = $('roi-role-scenario').value || S.scenario;
    const hours = getRoleHours(roleKey, scenario);

    let opts = '';
    Object.entries(ROLE_DATA).forEach(([k, v]) => {
      opts += '<option value="' + k + '"' + (k === roleKey ? ' selected' : '') + '>' + v.label + '</option>';
    });

    const tr = document.createElement('tr'); tr.id = id;
    tr.innerHTML =
      '<td><select class="role-select" data-field="role" aria-label="Role">' + opts + '</select></td>' +
      '<td><input type="number" value="' + headcount + '" min="1" max="10000" data-field="headcount" aria-label="Headcount"></td>' +
      '<td><input type="number" value="' + salary + '" min="10000" max="500000" step="5000" data-field="salary" aria-label="Salary"></td>' +
      '<td><input type="number" value="' + hours + '" min="0" max="20" step="0.5" data-field="hours" aria-label="Hours saved/week"></td>' +
      '<td class="role-annual-savings">$0</td>' +
      '<td><button class="roi-role-remove" aria-label="Remove role">\u2715</button></td>';

    $('roi-roles-tbody').appendChild(tr);

    tr.querySelectorAll('input, select').forEach(el => {
      el.addEventListener('input', () => {
        if (el.dataset.field === 'role') {
          tr.querySelector('[data-field="hours"]').value = getRoleHours(el.value, $('roi-role-scenario').value);
        }
        calcRoles();
      });
    });
    tr.querySelector('.roi-role-remove').addEventListener('click', () => { tr.remove(); calcRoles(); });
    calcRoles();
  }

  function calcRoles() {
    const scenario = $('roi-role-scenario').value || S.scenario;
    const curve = ADOPTION[scenario];
    let totalHC = 0, totalSavings = 0;
    const results = [];

    $qa('#roi-roles-tbody tr').forEach(tr => {
      const hc = parseInt(tr.querySelector('[data-field="headcount"]').value) || 0;
      const sal = parseInt(tr.querySelector('[data-field="salary"]').value) || 0;
      const hrs = parseFloat(tr.querySelector('[data-field="hours"]').value) || 0;
      const name = tr.querySelector('[data-field="role"]').selectedOptions[0].text;
      const hR = hourlyRate(sal, S.overhead);
      const annual = annualWithAdoption(hc, hR, hrs, curve, 0);
      tr.querySelector('.role-annual-savings').textContent = fmt(annual);
      totalHC += hc; totalSavings += annual;
      results.push({ name, savings: annual, hc });
    });

    $('roi-roles-total-hc').textContent = totalHC;
    $('roi-roles-total-savings').innerHTML = '<strong>' + fmt(totalSavings) + '</strong>';

    // licence cost for these users
    const roleLicenceCost = totalHC * S.copilotCost * 12;
    const rolesNetEl = $('roi-roles-net');
    if (rolesNetEl) {
      const net = totalSavings - roleLicenceCost;
      rolesNetEl.innerHTML = 'Annual licence cost: ' + fmt(roleLicenceCost) + ' &nbsp;|&nbsp; <strong style="color:' + (net >= 0 ? 'var(--roi-green)' : 'var(--roi-red)') + '">Net: ' + fmt(net) + '/yr</strong>';
    }

    // top 3
    const sorted = [...results].sort((a, b) => b.savings - a.savings);
    const top3 = sorted.slice(0, 3);
    const topEl = $('roi-top-roles'), topList = $('roi-top-roles-list');
    if (top3.length && top3[0].savings > 0) {
      topEl.style.display = '';
      topList.innerHTML = top3.map(r =>
        '<div class="roi-top-role-item"><span class="roi-top-role-name">' + r.name + '</span><span class="roi-top-role-val">' + fmt(r.savings) + '/yr</span></div>'
      ).join('');
    } else { topEl.style.display = 'none'; }

    // bar chart
    const chart = $('roi-roles-chart');
    const mx = Math.max(...results.map(r => r.savings), 1);
    chart.innerHTML = results.map(r =>
      '<div class="roi-role-bar-row"><div class="roi-role-bar-name">' + r.name + '</div>' +
      '<div class="roi-role-bar-track"><div class="roi-role-bar-fill" style="width:' + (r.savings / mx * 100).toFixed(1) + '%"></div></div>' +
      '<span class="roi-role-bar-val">' + fmt(r.savings) + '</span></div>'
    ).join('');
  }

  function initRoles() {
    [['executive', 5], ['sales', 20], ['marketing', 10], ['it', 10], ['hr', 5], ['finance', 10], ['support', 15], ['pm', 5], ['general', 20]].forEach(([r, h]) => addRoleRow(r, h));
    $('roi-add-role').addEventListener('click', () => addRoleRow());
    $('roi-role-scenario').addEventListener('change', () => {
      const sc = $('roi-role-scenario').value;
      $qa('#roi-roles-tbody tr').forEach(tr => {
        const k = tr.querySelector('[data-field="role"]').value;
        tr.querySelector('[data-field="hours"]').value = getRoleHours(k, sc);
      });
      calcRoles();
    });
  }

  /* ── TAB 3: COST BREAKDOWN ────────────────────────────────── */

  function readCostInputs() {
    S.training = parseInt($('roi-training-range').value) || 0;
    S.changeMgmt = parseInt($('roi-change-mgmt-range').value) || 0;
    S.dataGov = parseInt($('roi-data-gov-range').value) || 0;
    S.adminHours = parseInt($('roi-admin-hours-range').value) || 0;
    S.adminRate = parseInt($('roi-admin-rate').value) || 75;
  }

  function calcCosts() {
    readCostInputs();
    const annualLicence = S.users * S.copilotCost * 12;
    const impl = S.implCost;
    const total3yrCost = (annualLicence * 3) + impl;
    const y1 = S.y(0), y2 = S.y(1), y3 = S.y(2);
    const totalValue = y1 + y2 + y3;

    $('roi-annual-licence').textContent = fmtFull(annualLicence);
    $('roi-impl-cost').textContent = fmtFull(impl);
    $('roi-total-cost').innerHTML = '<strong>' + fmtFull(total3yrCost) + '</strong>';
    $('roi-y1-savings').textContent = fmtFull(y1);
    $('roi-y2-savings').textContent = fmtFull(y2);
    $('roi-y3-savings').textContent = fmtFull(y3);
    $('roi-total-value').innerHTML = '<strong>' + fmtFull(totalValue) + '</strong>';

    const net = totalValue - total3yrCost;
    const netEl = $('roi-cost-net');
    netEl.innerHTML = '<strong>' + fmtFull(net) + '</strong>';
    netEl.style.color = net >= 0 ? 'var(--roi-green)' : 'var(--roi-red)';

    const pb = S.payback();
    $('roi-breakeven-months').textContent = pb > 0 ? pb : '36+';
    const pctPos = pb > 0 ? Math.min((pb / 36) * 100, 100) : 100;
    $('roi-timeline-marker').style.left = pctPos + '%';
    $('roi-timeline-fill').style.width = pctPos + '%';
  }

  function initCosts() {
    const displays = {
      'roi-training-range': v => $('roi-training-val').textContent = '$' + v,
      'roi-change-mgmt-range': v => $('roi-change-mgmt-val').textContent = '$' + parseInt(v).toLocaleString(),
      'roi-data-gov-range': v => $('roi-data-gov-val').textContent = '$' + parseInt(v).toLocaleString(),
      'roi-admin-hours-range': v => $('roi-admin-hours-val').textContent = v + ' hrs'
    };
    Object.entries(displays).forEach(([id, fn]) => {
      $(id).addEventListener('input', () => { fn($(id).value); calcCosts(); });
    });
    $('roi-admin-rate').addEventListener('input', calcCosts);
    $qa('.roi-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const t = $(chip.dataset.target);
        t.value = chip.dataset.val;
        t.dispatchEvent(new Event('input'));
        chip.parentElement.querySelectorAll('.roi-chip').forEach(c => c.classList.remove('roi-chip-active'));
        chip.classList.add('roi-chip-active');
      });
    });
  }

  /* ── TAB 4: SCENARIO COMPARISON ───────────────────────────── */

  function calcScenarios() {
    readCostInputs(); // ensure impl costs are current
    const labels = { conservative: '\uD83D\uDC22 Conservative', moderate: '\u2696\uFE0F Moderate', aggressive: '\uD83D\uDE80 Aggressive' };
    const grid = $('roi-scenario-grid');

    grid.innerHTML = ['conservative', 'moderate', 'aggressive'].map(s => {
      const y1 = S.y(0, s), y2 = S.y(1, s), y3 = S.y(2, s);
      const total = y1 + y2 + y3;
      const cost = S.cost3yr(s) + S.implCost;
      const roi = cost > 0 ? ((total - cost) / cost) * 100 : 0;
      const pb = S.payback(s);
      const hl = s === S.scenario ? ' roi-scenario-col-highlight' : '';
      const curve = ADOPTION[s];

      return '<div class="roi-scenario-col' + hl + '">' +
        '<div class="roi-scenario-name">' + labels[s] + '</div>' +
        '<div class="roi-scenario-stat"><span class="roi-scenario-stat-label">Adoption @ Month 12</span><span class="roi-scenario-stat-val">' + pct(curve[11] * 100) + '</span></div>' +
        '<div class="roi-scenario-stat"><span class="roi-scenario-stat-label">Year 1 Savings</span><span class="roi-scenario-stat-val">' + fmt(y1) + '</span></div>' +
        '<div class="roi-scenario-stat"><span class="roi-scenario-stat-label">3-Year Savings</span><span class="roi-scenario-stat-val roi-scenario-stat-val-accent">' + fmt(total) + '</span></div>' +
        '<div class="roi-scenario-stat"><span class="roi-scenario-stat-label">3-Year ROI (incl. impl.)</span><span class="roi-scenario-stat-val">' + pct(roi) + '</span></div>' +
        '<div class="roi-scenario-stat"><span class="roi-scenario-stat-label">Payback</span><span class="roi-scenario-stat-val">' + (pb > 0 ? pb + ' mo' : '36+') + '</span></div>' +
      '</div>';
    }).join('');

    // projection table
    const tbody = $('roi-projection-tbody');
    const rows = [
      ['Adoption @ Mo 12', s => pct(ADOPTION[s][11] * 100)],
      ['Year 1 Savings', s => fmt(S.y(0, s))],
      ['Year 2 Savings', s => fmt(S.y(1, s))],
      ['Year 3 Savings', s => fmt(S.y(2, s))],
      ['3-Year Savings', s => fmt(S.total3yr(s))],
      ['3-Year Cost (licence + impl.)', s => fmt(S.cost3yr(s) + S.implCost)],
      ['3-Year Net Gain', s => { const n = S.net3yr(s); return '<strong style="color:' + (n >= 0 ? 'var(--roi-green)' : 'var(--roi-red)') + '">' + fmt(n) + '</strong>'; }]
    ];
    tbody.innerHTML = rows.map(([label, fn]) =>
      '<tr><td>' + label + '</td>' + ['conservative', 'moderate', 'aggressive'].map(s => '<td>' + fn(s) + '</td>').join('') + '</tr>'
    ).join('');

    calcCustomScenario();
  }

  function calcCustomScenario() {
    const ca = parseInt($('roi-custom-adoption').value) / 100;
    $('roi-custom-adoption-val').textContent = pct(ca * 100);
    const curve = [];
    for (let m = 0; m < 36; m++) {
      if (m < 12) curve.push(ca * ((m + 1) / 12));
      else curve.push(Math.min(ca + (ca * 0.05 * ((m - 12) / 24)), 0.99));
    }
    const hpw = S.hpw();
    const y1 = annualWithAdoption(S.users, S.hRate, hpw, curve, 0);
    const y2 = annualWithAdoption(S.users, S.hRate, hpw, curve, 1);
    const y3 = annualWithAdoption(S.users, S.hRate, hpw, curve, 2);
    const total = y1 + y2 + y3;
    const cost = S.cost3yr() + S.implCost;
    const net = total - cost;
    const roi = cost > 0 ? ((total - cost) / cost) * 100 : 0;

    $('roi-custom-result').innerHTML =
      '<div style="display:flex;gap:2rem;flex-wrap:wrap">' +
      '<div><span style="color:var(--text-muted);font-size:0.75rem">3-Year Savings</span><br><strong style="font-size:1.1rem;color:var(--tool-accent-bright)">' + fmt(total) + '</strong></div>' +
      '<div><span style="color:var(--text-muted);font-size:0.75rem">3-Year ROI</span><br><strong style="font-size:1.1rem">' + pct(roi) + '</strong></div>' +
      '<div><span style="color:var(--text-muted);font-size:0.75rem">Net Gain</span><br><strong style="font-size:1.1rem;color:' + (net >= 0 ? 'var(--roi-green)' : 'var(--roi-red)') + '">' + fmt(net) + '</strong></div></div>';
  }

  function initScenarios() {
    $('roi-custom-adoption').addEventListener('input', calcCustomScenario);
  }

  /* ── TAB 5: EXECUTIVE SUMMARY ─────────────────────────────── */

  function buildSummary() {
    readCostInputs();
    const pricing = PRICING[S.plan];
    const annualLicence = S.users * S.copilotCost * 12;
    const impl = S.implCost;
    const y1 = S.y(0), y2 = S.y(1), y3 = S.y(2);
    const totalValue = y1 + y2 + y3;
    const totalCost = (annualLicence * 3) + impl;
    const net = totalValue - totalCost;
    const roi = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;
    const pb = S.payback();
    const netPerUserMo = S.users > 0 ? net / 36 / S.users : 0;
    const hpw = S.hpw();
    const curve = S.curve;

    // params
    $('roi-summary-params').innerHTML =
      '<div class="roi-summary-param"><span class="roi-summary-param-label">Users:</span><span class="roi-summary-param-val">' + S.users.toLocaleString() + '</span></div>' +
      '<div class="roi-summary-param"><span class="roi-summary-param-label">Plan:</span><span class="roi-summary-param-val">' + pricing.label + '</span></div>' +
      '<div class="roi-summary-param"><span class="roi-summary-param-label">Copilot cost:</span><span class="roi-summary-param-val">$' + S.copilotCost.toFixed(2) + '/user/mo' + (S.customCopilotCost !== null ? ' (custom)' : '') + '</span></div>' +
      '<div class="roi-summary-param"><span class="roi-summary-param-label">Scenario:</span><span class="roi-summary-param-val">' + S.scenario.charAt(0).toUpperCase() + S.scenario.slice(1) + '</span></div>' +
      '<div class="roi-summary-param"><span class="roi-summary-param-label">Avg Salary:</span><span class="roi-summary-param-val">' + fmtFull(S.salary) + '</span></div>';

    // metrics
    $('roi-summary-metrics').innerHTML =
      '<div class="roi-summary-metric"><span class="roi-summary-metric-label">3-Year ROI</span><span class="roi-summary-metric-val">' + pct(roi) + '</span></div>' +
      '<div class="roi-summary-metric"><span class="roi-summary-metric-label">3-Year Net Gain</span><span class="roi-summary-metric-val">' + fmt(net) + '</span></div>' +
      '<div class="roi-summary-metric"><span class="roi-summary-metric-label">Net / User / Month</span><span class="roi-summary-metric-val">' + fmtFull(netPerUserMo) + '</span></div>' +
      '<div class="roi-summary-metric"><span class="roi-summary-metric-label">Payback Period</span><span class="roi-summary-metric-val">' + (pb > 0 ? pb + ' mo' : '36+') + '</span></div>';

    // table
    $('roi-summary-tbody').innerHTML =
      '<tr><td>Licence Cost</td><td>' + fmtFull(annualLicence) + '</td><td>' + fmtFull(annualLicence) + '</td><td>' + fmtFull(annualLicence) + '</td><td>' + fmtFull(annualLicence * 3) + '</td></tr>' +
      '<tr><td>Implementation Cost</td><td>' + fmtFull(impl) + '</td><td>$0</td><td>$0</td><td>' + fmtFull(impl) + '</td></tr>' +
      '<tr><td><strong>Total Cost</strong></td><td><strong>' + fmtFull(annualLicence + impl) + '</strong></td><td><strong>' + fmtFull(annualLicence) + '</strong></td><td><strong>' + fmtFull(annualLicence) + '</strong></td><td><strong>' + fmtFull(totalCost) + '</strong></td></tr>' +
      '<tr class="roi-row-positive"><td>Productivity Savings</td><td>' + fmtFull(y1) + '</td><td>' + fmtFull(y2) + '</td><td>' + fmtFull(y3) + '</td><td>' + fmtFull(totalValue) + '</td></tr>' +
      '<tr class="roi-row-total"><td>Net Value</td><td>' + fmtFull(y1 - annualLicence - impl) + '</td><td>' + fmtFull(y2 - annualLicence) + '</td><td>' + fmtFull(y3 - annualLicence) + '</td><td>' + fmtFull(net) + '</td></tr>';

    // assumptions
    $('roi-summary-assumptions-list').innerHTML =
      '<li>Avg hours saved/week: ' + hpw.toFixed(1) + ' hours (' + S.scenario + ' scenario, weighted from role defaults)</li>' +
      '<li>Adoption at Month 12: ' + pct(curve[11] * 100) + '</li>' +
      '<li>Fully-loaded hourly rate: $' + S.hRate.toFixed(2) + ' (salary + ' + Math.round((S.overhead - 1) * 100) + '% overhead)</li>' +
      '<li>Copilot cost: $' + S.copilotCost.toFixed(2) + '/user/month' + (S.customCopilotCost !== null ? ' (custom negotiated price)' : ' (public list price)') + '</li>' +
      '<li>Implementation costs: ' + fmtFull(impl) + ' (one-time, Year 1)</li>' +
      '<li>Time savings data: Forrester TEI, UK Government trials, Microsoft Research</li>';
  }

  function initSummary() {
    $('roi-copy-summary').addEventListener('click', () => {
      const text = $('roi-summary-page').innerText;
      navigator.clipboard.writeText(text).then(() => {
        $('roi-copy-summary').textContent = '\u2705 Copied!';
        setTimeout(() => $('roi-copy-summary').textContent = '\uD83D\uDCCB Copy Summary', 2000);
      });
    });
    $('roi-print-summary').addEventListener('click', () => window.print());
    $('roi-save-history').addEventListener('click', () => {
      const entry = {
        date: new Date().toISOString(), users: S.users, salary: S.salary,
        plan: S.plan, scenario: S.scenario, overhead: S.overhead,
        customCopilotCost: S.customCopilotCost, training: S.training,
        changeMgmt: S.changeMgmt, dataGov: S.dataGov, adminHours: S.adminHours,
        adminRate: S.adminRate, roi: S.roi3yr(), netGain: S.net3yr()
      };
      const hist = JSON.parse(localStorage.getItem('roi-history') || '[]');
      hist.unshift(entry);
      if (hist.length > 10) hist.pop();
      localStorage.setItem('roi-history', JSON.stringify(hist));
      $('roi-save-history').textContent = '\u2705 Saved!';
      setTimeout(() => $('roi-save-history').textContent = '\uD83D\uDCBE Save to History', 2000);
      loadHistory();
    });
    $('roi-clear-history').addEventListener('click', () => { localStorage.removeItem('roi-history'); loadHistory(); });
    loadHistory();
  }

  function loadHistory() {
    const hist = JSON.parse(localStorage.getItem('roi-history') || '[]');
    const wrap = $('roi-history'), list = $('roi-history-list');
    if (!hist.length) { wrap.style.display = 'none'; return; }
    wrap.style.display = '';
    list.innerHTML = hist.map((h, i) => {
      const d = new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const pl = PRICING[h.plan] ? PRICING[h.plan].label : h.plan;
      return '<div class="roi-history-item" data-index="' + i + '"><span>' + (h.users || 0) + ' users \u2022 ' + pl + ' \u2022 ' + (h.scenario || '') + ' \u2022 ROI: ' + pct(h.roi || 0) + ' \u2022 Net: ' + fmt(h.netGain || 0) + '</span><span class="roi-history-date">' + d + '</span></div>';
    }).join('');

    list.querySelectorAll('.roi-history-item').forEach(item => {
      item.addEventListener('click', () => {
        const h = hist[item.dataset.index];
        if (!h) return;
        S.users = h.users || 100; S.salary = h.salary || 75000; S.plan = h.plan || 'e3';
        S.scenario = h.scenario || 'moderate'; S.overhead = h.overhead || 1.3;
        S.customCopilotCost = h.customCopilotCost || null;
        S.training = h.training || 100; S.changeMgmt = h.changeMgmt || 20000;
        S.dataGov = h.dataGov || 40000; S.adminHours = h.adminHours || 80; S.adminRate = h.adminRate || 75;
        // sync UI
        $('roi-users').value = S.users; $('roi-users-range').value = S.users;
        $('roi-salary').value = S.salary; $('roi-salary-range').value = S.salary;
        $('roi-plan').value = S.plan;
        const radio = $q('input[name="roi-scenario"][value="' + S.scenario + '"]');
        if (radio) { radio.checked = true; $qa('.roi-radio').forEach(l => l.classList.remove('roi-radio-selected')); radio.closest('.roi-radio').classList.add('roi-radio-selected'); }
        if ($('roi-overhead')) $('roi-overhead').value = S.overhead;
        const toggle = $('roi-cost-toggle');
        if (toggle) { toggle.checked = S.customCopilotCost !== null; $('roi-custom-cost-wrap').style.display = toggle.checked ? 'flex' : 'none'; }
        if ($('roi-custom-cost') && S.customCopilotCost !== null) $('roi-custom-cost').value = S.customCopilotCost;
        $('roi-training-range').value = S.training; $('roi-training-val').textContent = '$' + S.training;
        $('roi-change-mgmt-range').value = S.changeMgmt; $('roi-change-mgmt-val').textContent = '$' + S.changeMgmt.toLocaleString();
        $('roi-data-gov-range').value = S.dataGov; $('roi-data-gov-val').textContent = '$' + S.dataGov.toLocaleString();
        $('roi-admin-hours-range').value = S.adminHours; $('roi-admin-hours-val').textContent = S.adminHours + ' hrs';
        $('roi-admin-rate').value = S.adminRate;
        calcQuick();
        $q('[data-tab="quick"]').click();
      });
    });
  }

  /* ── INIT ─────────────────────────────────────────────────── */

  function init() {
    stateFromURL();
    initTabs();

    // sync state to UI from URL
    $('roi-users').value = S.users; $('roi-users-range').value = Math.min(S.users, 5000);
    $('roi-salary').value = S.salary; $('roi-salary-range').value = Math.min(S.salary, 300000);
    $('roi-plan').value = S.plan;
    const radio = $q('input[name="roi-scenario"][value="' + S.scenario + '"]');
    if (radio) { radio.checked = true; $qa('.roi-radio').forEach(l => l.classList.remove('roi-radio-selected')); radio.closest('.roi-radio').classList.add('roi-radio-selected'); }
    if ($('roi-overhead')) $('roi-overhead').value = S.overhead;
    if (S.customCopilotCost !== null) {
      const toggle = $('roi-cost-toggle');
      if (toggle) { toggle.checked = true; $('roi-custom-cost-wrap').style.display = 'flex'; $('roi-custom-cost').value = S.customCopilotCost; }
    }

    initQuickCalc();
    initRoles();
    initCosts();
    initScenarios();
    initSummary();
    calcQuick();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
