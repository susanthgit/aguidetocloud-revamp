/* ══════════════════════════════════════════════════════════════
   Copilot ROI Calculator — roi-calculator.js
   100% client-side. Zero API calls.
   ══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── CONSTANTS ──────────────────────────────────────────────

  const PRICING = {
    'bus-std':  { label: 'Business Standard + Copilot', copilot: 42.50, base: 12.50, copilotOnly: 30.00 },
    'bus-prem': { label: 'Business Premium + Copilot',  copilot: 52.00, base: 22.00, copilotOnly: 30.00 },
    'e3':       { label: 'E3 + Copilot add-on',         copilot: 69.00, base: 39.00, copilotOnly: 30.00 },
    'e5':       { label: 'E5 + Copilot add-on',         copilot: 90.00, base: 60.00, copilotOnly: 30.00 },
    'e7':       { label: 'E7 (Frontier Suite)',          copilot: 99.00, base: 99.00, copilotOnly: 99.00 }
  };

  // Hours saved per week by role (conservative / moderate / aggressive)
  const ROLE_DATA = {
    'executive':  { label: 'Executive/Leadership',   c: 2.0, m: 4.0, a: 6.0 },
    'sales':      { label: 'Sales',                  c: 1.5, m: 3.0, a: 5.0 },
    'marketing':  { label: 'Marketing',              c: 1.5, m: 3.0, a: 4.5 },
    'hr':         { label: 'HR',                     c: 1.0, m: 2.5, a: 4.0 },
    'finance':    { label: 'Finance/Accounting',     c: 1.0, m: 2.0, a: 3.5 },
    'it':         { label: 'IT Admin',               c: 1.5, m: 2.5, a: 4.0 },
    'developer':  { label: 'Developer',              c: 1.0, m: 2.0, a: 3.5 },
    'support':    { label: 'Customer Support',       c: 1.0, m: 2.0, a: 3.0 },
    'legal':      { label: 'Legal/Compliance',       c: 1.5, m: 3.0, a: 4.5 },
    'pm':         { label: 'Project Manager',        c: 1.5, m: 3.0, a: 4.5 },
    'general':    { label: 'General/Other',          c: 1.0, m: 2.0, a: 3.0 }
  };

  // Monthly adoption rates (% of users actively using Copilot)
  const ADOPTION = {
    conservative: [0.15, 0.20, 0.30, 0.35, 0.40, 0.45, 0.48, 0.50, 0.52, 0.53, 0.54, 0.55,
                   0.56, 0.57, 0.57, 0.58, 0.58, 0.59, 0.59, 0.59, 0.60, 0.60, 0.60, 0.60,
                   0.61, 0.61, 0.62, 0.62, 0.63, 0.63, 0.64, 0.64, 0.64, 0.65, 0.65, 0.65],
    moderate:     [0.30, 0.38, 0.50, 0.55, 0.60, 0.65, 0.68, 0.70, 0.72, 0.73, 0.74, 0.75,
                   0.76, 0.77, 0.77, 0.78, 0.78, 0.79, 0.79, 0.79, 0.80, 0.80, 0.80, 0.80,
                   0.81, 0.82, 0.82, 0.83, 0.83, 0.84, 0.84, 0.84, 0.85, 0.85, 0.85, 0.85],
    aggressive:   [0.50, 0.58, 0.70, 0.74, 0.78, 0.80, 0.83, 0.85, 0.87, 0.88, 0.89, 0.90,
                   0.91, 0.91, 0.92, 0.92, 0.93, 0.93, 0.93, 0.94, 0.94, 0.94, 0.95, 0.95,
                   0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95]
  };

  const OVERHEAD_MULTIPLIER = 1.3; // 30% benefits/overhead on base salary
  const WEEKS_PER_YEAR = 52;
  const HOURS_PER_WEEK = 40;
  const MONTHS_PER_YEAR = 12;

  // ── UTILITIES ──────────────────────────────────────────────

  function $(id) { return document.getElementById(id); }
  function $q(sel) { return document.querySelector(sel); }
  function $qa(sel) { return document.querySelectorAll(sel); }

  function fmt(n) {
    if (Math.abs(n) >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M';
    if (Math.abs(n) >= 1e3) return '$' + Math.round(n).toLocaleString('en-US');
    return '$' + Math.round(n).toLocaleString('en-US');
  }

  function fmtFull(n) { return '$' + Math.round(n).toLocaleString('en-US'); }

  function pct(n) { return Math.round(n) + '%'; }

  function hourlyRate(salary) {
    return (salary / (WEEKS_PER_YEAR * HOURS_PER_WEEK)) * OVERHEAD_MULTIPLIER;
  }

  function getScenarioKey() {
    const checked = document.querySelector('input[name="roi-scenario"]:checked');
    return checked ? checked.value : 'moderate';
  }

  function getRoleHours(roleKey, scenario) {
    const d = ROLE_DATA[roleKey];
    if (!d) return 2.0;
    return scenario === 'conservative' ? d.c : scenario === 'aggressive' ? d.a : d.m;
  }

  // Average hours/week for the "quick" calculator (weighted by research: ~2h/week moderate)
  function avgHoursPerWeek(scenario) {
    return scenario === 'conservative' ? 1.2 : scenario === 'aggressive' ? 3.5 : 2.0;
  }

  // Calculate annual savings with monthly adoption curve
  function annualSavingsWithAdoption(users, hourlyR, hoursPerWeek, adoptionCurve, yearIndex) {
    let total = 0;
    const startMonth = yearIndex * 12;
    for (let m = 0; m < 12; m++) {
      const monthIdx = Math.min(startMonth + m, adoptionCurve.length - 1);
      const adoption = adoptionCurve[monthIdx];
      const weeklySavings = users * hourlyR * hoursPerWeek * adoption;
      total += weeklySavings * (WEEKS_PER_YEAR / MONTHS_PER_YEAR);
    }
    return total;
  }

  // ── TAB SWITCHING ──────────────────────────────────────────

  function initTabs() {
    const tabs = $qa('.roi-tab');
    const panels = $qa('.roi-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => { t.classList.remove('roi-tab-active'); t.setAttribute('aria-selected', 'false'); });
        panels.forEach(p => { p.classList.remove('roi-panel-active'); p.hidden = true; });

        tab.classList.add('roi-tab-active');
        tab.setAttribute('aria-selected', 'true');
        const panel = $(tab.getAttribute('aria-controls'));
        panel.classList.add('roi-panel-active');
        panel.hidden = false;

        // Recalculate active tab
        if (tab.dataset.tab === 'roles') calcRoles();
        if (tab.dataset.tab === 'costs') calcCosts();
        if (tab.dataset.tab === 'scenarios') calcScenarios();
        if (tab.dataset.tab === 'summary') buildSummary();
      });

      // Keyboard navigation
      tab.addEventListener('keydown', e => {
        const idx = Array.from(tabs).indexOf(tab);
        if (e.key === 'ArrowRight' && idx < tabs.length - 1) { tabs[idx + 1].focus(); e.preventDefault(); }
        if (e.key === 'ArrowLeft' && idx > 0) { tabs[idx - 1].focus(); e.preventDefault(); }
      });
    });
  }

  // ── TAB 1: QUICK CALCULATOR ────────────────────────────────

  function getQuickInputs() {
    return {
      users: parseInt($('roi-users').value) || 100,
      salary: parseInt($('roi-salary').value) || 75000,
      plan: $('roi-plan').value,
      scenario: getScenarioKey()
    };
  }

  function calcQuick() {
    const { users, salary, plan, scenario } = getQuickInputs();
    const pricing = PRICING[plan];
    const curve = ADOPTION[scenario];
    const hRate = hourlyRate(salary);
    const hpw = avgHoursPerWeek(scenario);

    // Update hourly rate display
    $('roi-hourly-rate').textContent = '$' + hRate.toFixed(2);
    $('roi-copilot-cost').textContent = '$' + pricing.copilotOnly.toFixed(2);

    // Calculate 3-year savings with adoption curve
    const y1 = annualSavingsWithAdoption(users, hRate, hpw, curve, 0);
    const y2 = annualSavingsWithAdoption(users, hRate, hpw, curve, 1);
    const y3 = annualSavingsWithAdoption(users, hRate, hpw, curve, 2);
    const totalSavings3yr = y1 + y2 + y3;

    const annualLicenceCost = users * pricing.copilotOnly * MONTHS_PER_YEAR;
    const totalCost3yr = annualLicenceCost * 3;

    const monthlySavings = y1 / 12; // approximate current month
    const annualSavings = y1;
    const roi3yr = totalCost3yr > 0 ? ((totalSavings3yr - totalCost3yr) / totalCost3yr) * 100 : 0;
    const netGain = totalSavings3yr - totalCost3yr;
    const paybackMonths = monthlySavings > 0 ? Math.ceil((annualLicenceCost / 12) / (monthlySavings / users) * users / monthlySavings * (annualLicenceCost / 12)) : 0;

    // Simpler payback: month where cumulative savings > cumulative cost
    let cumulSavings = 0, cumulCost = 0, payback = 0;
    for (let m = 0; m < 36; m++) {
      const monthIdx = Math.min(m, curve.length - 1);
      const monthSavings = users * hRate * hpw * curve[monthIdx] * (WEEKS_PER_YEAR / MONTHS_PER_YEAR);
      cumulSavings += monthSavings;
      cumulCost += users * pricing.copilotOnly;
      if (cumulSavings >= cumulCost && payback === 0) {
        payback = m + 1;
      }
    }

    // Update DOM
    animateValue($('roi-monthly-savings'), monthlySavings, fmt);
    animateValue($('roi-annual-savings'), annualSavings, fmt);
    animateValue($('roi-net-gain'), netGain, fmt);

    $('roi-percentage').textContent = pct(roi3yr);
    const badge = $('roi-badge');
    if (roi3yr < 50) { badge.textContent = 'Low'; badge.className = 'roi-metric-badge roi-badge-low'; }
    else if (roi3yr < 150) { badge.textContent = 'Good'; badge.className = 'roi-metric-badge roi-badge-mid'; }
    else { badge.textContent = 'Strong'; badge.className = 'roi-metric-badge roi-badge-high'; }

    $('roi-payback').textContent = payback > 0 ? payback + ' months' : '36+ months';

    // Mini bar chart
    const maxVal = Math.max(totalCost3yr, totalSavings3yr, 1);
    $('roi-bar-cost').style.width = (totalCost3yr / maxVal * 100) + '%';
    $('roi-bar-savings').style.width = (totalSavings3yr / maxVal * 100) + '%';
    $('roi-bar-cost-val').textContent = fmt(totalCost3yr);
    $('roi-bar-savings-val').textContent = fmt(totalSavings3yr);

    // Store for other tabs
    window._roiState = { users, salary, plan, scenario, hRate, y1, y2, y3, totalSavings3yr, totalCost3yr, annualLicenceCost, netGain, roi3yr, payback };
  }

  function animateValue(el, target, formatter) {
    // Skip animation for reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = formatter(target);
      return;
    }
    const duration = 600;
    const start = performance.now();
    const from = 0;
    function step(ts) {
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = formatter(from + (target - from) * eased);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initQuickCalc() {
    // Sync range ↔ number inputs
    const syncPairs = [
      ['roi-users-range', 'roi-users'],
      ['roi-salary-range', 'roi-salary']
    ];
    syncPairs.forEach(([rangeId, numId]) => {
      const range = $(rangeId), num = $(numId);
      range.addEventListener('input', () => { num.value = range.value; calcQuick(); });
      num.addEventListener('input', () => { range.value = num.value; calcQuick(); });
    });

    // Plan and scenario
    $('roi-plan').addEventListener('change', calcQuick);
    $qa('input[name="roi-scenario"]').forEach(r => {
      r.addEventListener('change', () => {
        $qa('.roi-radio').forEach(l => l.classList.remove('roi-radio-selected'));
        r.closest('.roi-radio').classList.add('roi-radio-selected');
        calcQuick();
      });
    });

    // Presets
    $qa('.roi-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $('roi-users').value = btn.dataset.users;
        $('roi-users-range').value = btn.dataset.users;
        $('roi-salary').value = btn.dataset.salary;
        $('roi-salary-range').value = btn.dataset.salary;
        $('roi-plan').value = btn.dataset.plan;
        calcQuick();
      });
    });

    calcQuick();
  }

  // ── TAB 2: ROLE-BASED ──────────────────────────────────────

  let roleRows = [];
  let roleIdCounter = 0;

  function addRoleRow(roleKey, headcount, salary) {
    roleKey = roleKey || 'general';
    headcount = headcount || 10;
    salary = salary || (window._roiState ? window._roiState.salary : 75000);
    const id = 'role-' + (++roleIdCounter);
    const scenario = $('roi-role-scenario').value;

    const tr = document.createElement('tr');
    tr.id = id;

    // Role select
    let roleOptions = '';
    Object.entries(ROLE_DATA).forEach(([key, val]) => {
      roleOptions += `<option value="${key}"${key === roleKey ? ' selected' : ''}>${val.label}</option>`;
    });

    const hours = getRoleHours(roleKey, scenario);

    tr.innerHTML = `
      <td><select class="role-select" data-field="role" aria-label="Role">${roleOptions}</select></td>
      <td><input type="number" value="${headcount}" min="1" max="10000" data-field="headcount" aria-label="Headcount"></td>
      <td><input type="number" value="${salary}" min="10000" max="500000" step="5000" data-field="salary" aria-label="Salary"></td>
      <td><input type="number" value="${hours}" min="0" max="20" step="0.5" data-field="hours" aria-label="Hours saved per week"></td>
      <td class="role-annual-savings">$0</td>
      <td><button class="roi-role-remove" aria-label="Remove role">✕</button></td>
    `;

    $('roi-roles-tbody').appendChild(tr);
    roleRows.push(id);

    // Events
    tr.querySelectorAll('input, select').forEach(el => {
      el.addEventListener('input', () => {
        // If role select changed, update hours
        if (el.dataset.field === 'role') {
          const hoursInput = tr.querySelector('[data-field="hours"]');
          hoursInput.value = getRoleHours(el.value, $('roi-role-scenario').value);
        }
        calcRoles();
      });
    });

    tr.querySelector('.roi-role-remove').addEventListener('click', () => {
      tr.remove();
      roleRows = roleRows.filter(r => r !== id);
      calcRoles();
    });

    calcRoles();
  }

  function calcRoles() {
    const scenario = $('roi-role-scenario').value;
    const curve = ADOPTION[scenario];
    let totalHC = 0, totalSavings = 0;
    const roleResults = [];

    $qa('#roi-roles-tbody tr').forEach(tr => {
      const hc = parseInt(tr.querySelector('[data-field="headcount"]').value) || 0;
      const sal = parseInt(tr.querySelector('[data-field="salary"]').value) || 0;
      const hrs = parseFloat(tr.querySelector('[data-field="hours"]').value) || 0;
      const roleName = tr.querySelector('[data-field="role"]').selectedOptions[0].text;
      const hRate = hourlyRate(sal);
      const annual = annualSavingsWithAdoption(hc, hRate, hrs, curve, 0);

      tr.querySelector('.role-annual-savings').textContent = fmt(annual);
      totalHC += hc;
      totalSavings += annual;
      roleResults.push({ name: roleName, savings: annual, hc });
    });

    $('roi-roles-total-hc').textContent = totalHC;
    $('roi-roles-total-savings').innerHTML = '<strong>' + fmt(totalSavings) + '</strong>';

    // Top 3 roles
    const top3 = roleResults.sort((a, b) => b.savings - a.savings).slice(0, 3);
    const topEl = $('roi-top-roles');
    const topList = $('roi-top-roles-list');
    if (top3.length > 0 && top3[0].savings > 0) {
      topEl.style.display = '';
      topList.innerHTML = top3.map(r =>
        `<div class="roi-top-role-item"><span class="roi-top-role-name">${r.name}</span><span class="roi-top-role-val">${fmt(r.savings)}/yr</span></div>`
      ).join('');
    } else {
      topEl.style.display = 'none';
    }

    // Bar chart
    const chart = $('roi-roles-chart');
    const maxSavings = Math.max(...roleResults.map(r => r.savings), 1);
    chart.innerHTML = roleResults.map(r =>
      `<div class="roi-role-bar-row">
        <div class="roi-role-bar-name">${r.name}</div>
        <div class="roi-role-bar-track"><div class="roi-role-bar-fill" style="width:${(r.savings / maxSavings * 100).toFixed(1)}%"></div></div>
        <span class="roi-role-bar-val">${fmt(r.savings)}</span>
      </div>`
    ).join('');
  }

  function initRoles() {
    // Add default roles
    const defaults = [
      ['executive', 5], ['sales', 20], ['marketing', 10], ['it', 10],
      ['hr', 5], ['finance', 10], ['support', 15], ['pm', 5], ['general', 20]
    ];
    defaults.forEach(([role, hc]) => addRoleRow(role, hc));

    $('roi-add-role').addEventListener('click', () => addRoleRow());
    $('roi-role-scenario').addEventListener('change', () => {
      // Update all hours
      const scenario = $('roi-role-scenario').value;
      $qa('#roi-roles-tbody tr').forEach(tr => {
        const roleKey = tr.querySelector('[data-field="role"]').value;
        tr.querySelector('[data-field="hours"]').value = getRoleHours(roleKey, scenario);
      });
      calcRoles();
    });
  }

  // ── TAB 3: COST BREAKDOWN ──────────────────────────────────

  function calcCosts() {
    const state = window._roiState || {};
    const users = state.users || 100;
    const plan = state.plan || 'e3';
    const scenario = state.scenario || 'moderate';
    const pricing = PRICING[plan];
    const curve = ADOPTION[scenario];
    const hRate = state.hRate || hourlyRate(75000);
    const hpw = avgHoursPerWeek(scenario);

    const training = parseInt($('roi-training-range').value) || 0;
    const changeMgmt = parseInt($('roi-change-mgmt-range').value) || 0;
    const dataGov = parseInt($('roi-data-gov-range').value) || 0;
    const adminHours = parseInt($('roi-admin-hours-range').value) || 0;
    const adminRate = parseInt($('roi-admin-rate').value) || 75;

    const annualLicence = users * pricing.copilotOnly * 12;
    const implCost = (training * users) + changeMgmt + dataGov + (adminHours * adminRate);
    const totalCost3yr = (annualLicence * 3) + implCost;

    const y1 = annualSavingsWithAdoption(users, hRate, hpw, curve, 0);
    const y2 = annualSavingsWithAdoption(users, hRate, hpw, curve, 1);
    const y3 = annualSavingsWithAdoption(users, hRate, hpw, curve, 2);
    const totalValue = y1 + y2 + y3;

    $('roi-annual-licence').textContent = fmtFull(annualLicence);
    $('roi-impl-cost').textContent = fmtFull(implCost);
    $('roi-total-cost').innerHTML = '<strong>' + fmtFull(totalCost3yr) + '</strong>';
    $('roi-y1-savings').textContent = fmtFull(y1);
    $('roi-y2-savings').textContent = fmtFull(y2);
    $('roi-y3-savings').textContent = fmtFull(y3);
    $('roi-total-value').innerHTML = '<strong>' + fmtFull(totalValue) + '</strong>';

    const net = totalValue - totalCost3yr;
    const netEl = $('roi-cost-net');
    netEl.innerHTML = '<strong>' + fmtFull(net) + '</strong>';
    netEl.style.color = net >= 0 ? 'var(--roi-green)' : 'var(--roi-red)';

    // Break-even
    let cumulSavings = 0, cumulCost = implCost, payback = 0;
    for (let m = 0; m < 36; m++) {
      const monthIdx = Math.min(m, curve.length - 1);
      cumulSavings += users * hRate * hpw * curve[monthIdx] * (WEEKS_PER_YEAR / MONTHS_PER_YEAR);
      cumulCost += users * pricing.copilotOnly;
      if (cumulSavings >= cumulCost && payback === 0) payback = m + 1;
    }

    $('roi-breakeven-months').textContent = payback > 0 ? payback : '36+';

    // Timeline marker
    const markerPct = payback > 0 ? Math.min((payback / 36) * 100, 100) : 100;
    $('roi-timeline-marker').style.left = markerPct + '%';
    $('roi-timeline-fill').style.width = markerPct + '%';

    // Store extended state
    window._roiCostState = { implCost, totalCost3yr, y1, y2, y3, totalValue, net, payback, annualLicence };
  }

  function initCosts() {
    // Sync ranges
    const rangeDisplays = {
      'roi-training-range': v => $('roi-training-val').textContent = '$' + v,
      'roi-change-mgmt-range': v => $('roi-change-mgmt-val').textContent = '$' + parseInt(v).toLocaleString(),
      'roi-data-gov-range': v => $('roi-data-gov-val').textContent = '$' + parseInt(v).toLocaleString(),
      'roi-admin-hours-range': v => $('roi-admin-hours-val').textContent = v + ' hrs'
    };

    Object.entries(rangeDisplays).forEach(([id, display]) => {
      $(id).addEventListener('input', () => { display($(id).value); calcCosts(); });
    });

    $('roi-admin-rate').addEventListener('input', calcCosts);

    // Preset chips
    $qa('.roi-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const target = $(chip.dataset.target);
        target.value = chip.dataset.val;
        target.dispatchEvent(new Event('input'));
        // Update active chip
        chip.parentElement.querySelectorAll('.roi-chip').forEach(c => c.classList.remove('roi-chip-active'));
        chip.classList.add('roi-chip-active');
      });
    });
  }

  // ── TAB 4: SCENARIO COMPARISON ──────────────────────────────

  function calcScenarios() {
    const state = window._roiState || {};
    const users = state.users || 100;
    const salary = state.salary || 75000;
    const plan = state.plan || 'e3';
    const pricing = PRICING[plan];
    const hRate = hourlyRate(salary);

    const scenarios = ['conservative', 'moderate', 'aggressive'];
    const labels = { conservative: '🐢 Conservative', moderate: '⚖️ Moderate', aggressive: '🚀 Aggressive' };
    const grid = $('roi-scenario-grid');

    grid.innerHTML = scenarios.map(s => {
      const curve = ADOPTION[s];
      const hpw = avgHoursPerWeek(s);
      const y1 = annualSavingsWithAdoption(users, hRate, hpw, curve, 0);
      const y2 = annualSavingsWithAdoption(users, hRate, hpw, curve, 1);
      const y3 = annualSavingsWithAdoption(users, hRate, hpw, curve, 2);
      const totalSavings = y1 + y2 + y3;
      const totalCost = users * pricing.copilotOnly * 12 * 3;
      const roi = totalCost > 0 ? ((totalSavings - totalCost) / totalCost) * 100 : 0;

      let payback = 0, cs = 0, cc = 0;
      for (let m = 0; m < 36; m++) {
        cs += users * hRate * hpw * curve[Math.min(m, curve.length - 1)] * (WEEKS_PER_YEAR / MONTHS_PER_YEAR);
        cc += users * pricing.copilotOnly;
        if (cs >= cc && payback === 0) payback = m + 1;
      }

      const highlight = s === 'moderate' ? ' roi-scenario-col-highlight' : '';

      return `<div class="roi-scenario-col${highlight}">
        <div class="roi-scenario-name">${labels[s]}</div>
        <div class="roi-scenario-stat">
          <span class="roi-scenario-stat-label">Adoption @ Month 12</span>
          <span class="roi-scenario-stat-val">${pct(curve[11] * 100)}</span>
        </div>
        <div class="roi-scenario-stat">
          <span class="roi-scenario-stat-label">Annual Savings (Yr 1)</span>
          <span class="roi-scenario-stat-val">${fmt(y1)}</span>
        </div>
        <div class="roi-scenario-stat">
          <span class="roi-scenario-stat-label">3-Year Total Savings</span>
          <span class="roi-scenario-stat-val roi-scenario-stat-val-accent">${fmt(totalSavings)}</span>
        </div>
        <div class="roi-scenario-stat">
          <span class="roi-scenario-stat-label">3-Year ROI</span>
          <span class="roi-scenario-stat-val">${pct(roi)}</span>
        </div>
        <div class="roi-scenario-stat">
          <span class="roi-scenario-stat-label">Payback</span>
          <span class="roi-scenario-stat-val">${payback > 0 ? payback + ' months' : '36+'}</span>
        </div>
      </div>`;
    }).join('');

    // 3-year projection table
    const tbody = $('roi-projection-tbody');
    const rows = [
      { label: 'Adoption @ Month 12', fn: (s) => { const c = ADOPTION[s]; return pct(c[11] * 100); } },
      { label: 'Year 1 Savings', fn: (s) => { return fmt(annualSavingsWithAdoption(users, hRate, avgHoursPerWeek(s), ADOPTION[s], 0)); } },
      { label: 'Year 2 Savings', fn: (s) => { return fmt(annualSavingsWithAdoption(users, hRate, avgHoursPerWeek(s), ADOPTION[s], 1)); } },
      { label: 'Year 3 Savings', fn: (s) => { return fmt(annualSavingsWithAdoption(users, hRate, avgHoursPerWeek(s), ADOPTION[s], 2)); } },
      { label: '3-Year Total', fn: (s) => {
        const c = ADOPTION[s], h = avgHoursPerWeek(s);
        return fmt(annualSavingsWithAdoption(users, hRate, h, c, 0) + annualSavingsWithAdoption(users, hRate, h, c, 1) + annualSavingsWithAdoption(users, hRate, h, c, 2));
      }},
      { label: '3-Year Licence Cost', fn: () => fmt(users * pricing.copilotOnly * 36) },
      { label: '3-Year Net Gain', fn: (s) => {
        const c = ADOPTION[s], h = avgHoursPerWeek(s);
        const total = annualSavingsWithAdoption(users, hRate, h, c, 0) + annualSavingsWithAdoption(users, hRate, h, c, 1) + annualSavingsWithAdoption(users, hRate, h, c, 2);
        return fmt(total - users * pricing.copilotOnly * 36);
      }}
    ];

    tbody.innerHTML = rows.map(r =>
      `<tr><td>${r.label}</td>${scenarios.map(s => `<td>${r.fn(s)}</td>`).join('')}</tr>`
    ).join('');

    // Custom scenario
    calcCustomScenario();
  }

  function calcCustomScenario() {
    const state = window._roiState || {};
    const users = state.users || 100;
    const hRate = state.hRate || hourlyRate(75000);
    const plan = state.plan || 'e3';
    const pricing = PRICING[plan];
    const customAdoption = parseInt($('roi-custom-adoption').value) / 100;
    $('roi-custom-adoption-val').textContent = pct(customAdoption * 100);

    // Build custom curve (linear ramp to target at month 12, then gradual to +5% at month 36)
    const customCurve = [];
    for (let m = 0; m < 36; m++) {
      if (m < 12) customCurve.push(customAdoption * ((m + 1) / 12));
      else customCurve.push(Math.min(customAdoption + (customAdoption * 0.05 * ((m - 12) / 24)), 0.99));
    }

    const hpw = 2.0; // moderate baseline
    const y1 = annualSavingsWithAdoption(users, hRate, hpw, customCurve, 0);
    const y2 = annualSavingsWithAdoption(users, hRate, hpw, customCurve, 1);
    const y3 = annualSavingsWithAdoption(users, hRate, hpw, customCurve, 2);
    const total = y1 + y2 + y3;
    const cost = users * pricing.copilotOnly * 36;
    const net = total - cost;
    const roi = cost > 0 ? ((total - cost) / cost) * 100 : 0;

    const result = $('roi-custom-result');
    result.innerHTML = `
      <div style="display:flex;gap:2rem;flex-wrap:wrap">
        <div><span style="color:var(--text-muted);font-size:0.75rem">3-Year Savings</span><br><strong style="font-size:1.1rem;color:var(--tool-accent-bright)">${fmt(total)}</strong></div>
        <div><span style="color:var(--text-muted);font-size:0.75rem">3-Year ROI</span><br><strong style="font-size:1.1rem">${pct(roi)}</strong></div>
        <div><span style="color:var(--text-muted);font-size:0.75rem">Net Gain</span><br><strong style="font-size:1.1rem;color:${net >= 0 ? 'var(--roi-green)' : 'var(--roi-red)'}">${fmt(net)}</strong></div>
      </div>`;
  }

  function initScenarios() {
    $('roi-custom-adoption').addEventListener('input', calcCustomScenario);
  }

  // ── TAB 5: EXECUTIVE SUMMARY ───────────────────────────────

  function buildSummary() {
    const state = window._roiState || {};
    const costState = window._roiCostState || {};
    const users = state.users || 100;
    const plan = state.plan || 'e3';
    const scenario = state.scenario || 'moderate';
    const pricing = PRICING[plan];
    const hRate = state.hRate || hourlyRate(75000);
    const curve = ADOPTION[scenario];
    const hpw = avgHoursPerWeek(scenario);

    // Recalculate if cost state not available
    const implCost = costState.implCost || 0;
    const annualLicence = users * pricing.copilotOnly * 12;
    const y1 = annualSavingsWithAdoption(users, hRate, hpw, curve, 0);
    const y2 = annualSavingsWithAdoption(users, hRate, hpw, curve, 1);
    const y3 = annualSavingsWithAdoption(users, hRate, hpw, curve, 2);
    const totalValue = y1 + y2 + y3;
    const totalCost = (annualLicence * 3) + implCost;
    const net = totalValue - totalCost;
    const roi = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

    // Payback
    let payback = 0, cs = 0, cc = implCost;
    for (let m = 0; m < 36; m++) {
      cs += users * hRate * hpw * curve[Math.min(m, curve.length - 1)] * (WEEKS_PER_YEAR / MONTHS_PER_YEAR);
      cc += users * pricing.copilotOnly;
      if (cs >= cc && payback === 0) payback = m + 1;
    }

    // Params
    $('roi-summary-params').innerHTML = `
      <div class="roi-summary-param"><span class="roi-summary-param-label">Users:</span><span class="roi-summary-param-val">${users.toLocaleString()}</span></div>
      <div class="roi-summary-param"><span class="roi-summary-param-label">Plan:</span><span class="roi-summary-param-val">${pricing.label}</span></div>
      <div class="roi-summary-param"><span class="roi-summary-param-label">Scenario:</span><span class="roi-summary-param-val">${scenario.charAt(0).toUpperCase() + scenario.slice(1)}</span></div>
      <div class="roi-summary-param"><span class="roi-summary-param-label">Avg Salary:</span><span class="roi-summary-param-val">${fmtFull(state.salary || 75000)}</span></div>
    `;

    // Metrics
    $('roi-summary-metrics').innerHTML = `
      <div class="roi-summary-metric"><span class="roi-summary-metric-label">3-Year ROI</span><span class="roi-summary-metric-val">${pct(roi)}</span></div>
      <div class="roi-summary-metric"><span class="roi-summary-metric-label">3-Year Net Gain</span><span class="roi-summary-metric-val">${fmt(net)}</span></div>
      <div class="roi-summary-metric"><span class="roi-summary-metric-label">Annual Savings</span><span class="roi-summary-metric-val">${fmt(y1)}</span></div>
      <div class="roi-summary-metric"><span class="roi-summary-metric-label">Payback Period</span><span class="roi-summary-metric-val">${payback > 0 ? payback + ' mo' : '36+'}</span></div>
    `;

    // Table
    $('roi-summary-tbody').innerHTML = `
      <tr><td>Licence Cost</td><td>${fmtFull(annualLicence)}</td><td>${fmtFull(annualLicence)}</td><td>${fmtFull(annualLicence)}</td><td>${fmtFull(annualLicence * 3)}</td></tr>
      <tr><td>Implementation Cost</td><td>${fmtFull(implCost)}</td><td>$0</td><td>$0</td><td>${fmtFull(implCost)}</td></tr>
      <tr><td><strong>Total Cost</strong></td><td><strong>${fmtFull(annualLicence + implCost)}</strong></td><td><strong>${fmtFull(annualLicence)}</strong></td><td><strong>${fmtFull(annualLicence)}</strong></td><td><strong>${fmtFull(totalCost)}</strong></td></tr>
      <tr class="roi-row-positive"><td>Productivity Savings</td><td>${fmtFull(y1)}</td><td>${fmtFull(y2)}</td><td>${fmtFull(y3)}</td><td>${fmtFull(totalValue)}</td></tr>
      <tr class="roi-row-total"><td>Net Value</td><td>${fmtFull(y1 - annualLicence - implCost)}</td><td>${fmtFull(y2 - annualLicence)}</td><td>${fmtFull(y3 - annualLicence)}</td><td>${fmtFull(net)}</td></tr>
    `;

    // Assumptions
    $('roi-summary-assumptions-list').innerHTML = `
      <li>Average hours saved per week: ${hpw} hours (${scenario} scenario)</li>
      <li>Adoption rate at Month 12: ${pct(curve[11] * 100)}</li>
      <li>Fully-loaded hourly rate: $${hRate.toFixed(2)} (base salary + 30% overhead)</li>
      <li>Copilot licence cost: $${pricing.copilotOnly}/user/month</li>
      <li>Implementation costs: ${fmtFull(implCost)} (one-time, Year 1 only)</li>
      <li>Time savings data sourced from Forrester TEI, UK Government trials, and Microsoft Research</li>
    `;
  }

  function initSummary() {
    // Copy summary
    $('roi-copy-summary').addEventListener('click', () => {
      const text = $('roi-summary-page').innerText;
      navigator.clipboard.writeText(text).then(() => {
        $('roi-copy-summary').textContent = '✅ Copied!';
        setTimeout(() => $('roi-copy-summary').textContent = '📋 Copy Summary', 2000);
      });
    });

    // Print
    $('roi-print-summary').addEventListener('click', () => window.print());

    // Save to history
    $('roi-save-history').addEventListener('click', () => {
      const state = window._roiState || {};
      const entry = {
        date: new Date().toISOString(),
        users: state.users,
        plan: state.plan,
        scenario: state.scenario,
        roi: state.roi3yr,
        netGain: state.netGain
      };
      const history = JSON.parse(localStorage.getItem('roi-history') || '[]');
      history.unshift(entry);
      if (history.length > 10) history.pop();
      localStorage.setItem('roi-history', JSON.stringify(history));
      $('roi-save-history').textContent = '✅ Saved!';
      setTimeout(() => $('roi-save-history').textContent = '💾 Save to History', 2000);
      loadHistory();
    });

    // Clear history
    $('roi-clear-history').addEventListener('click', () => {
      localStorage.removeItem('roi-history');
      loadHistory();
    });

    loadHistory();
  }

  function loadHistory() {
    const history = JSON.parse(localStorage.getItem('roi-history') || '[]');
    const container = $('roi-history');
    const list = $('roi-history-list');

    if (history.length === 0) { container.style.display = 'none'; return; }

    container.style.display = '';
    list.innerHTML = history.map((h, i) => {
      const d = new Date(h.date);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const planLabel = PRICING[h.plan] ? PRICING[h.plan].label : h.plan;
      return `<div class="roi-history-item" data-index="${i}">
        <span>${h.users} users • ${planLabel} • ${h.scenario} • ROI: ${pct(h.roi || 0)} • Net: ${fmt(h.netGain || 0)}</span>
        <span class="roi-history-date">${dateStr}</span>
      </div>`;
    }).join('');

    // Click to load
    list.querySelectorAll('.roi-history-item').forEach(item => {
      item.addEventListener('click', () => {
        const h = history[item.dataset.index];
        if (h) {
          $('roi-users').value = h.users; $('roi-users-range').value = h.users;
          $('roi-plan').value = h.plan;
          const radio = document.querySelector(`input[name="roi-scenario"][value="${h.scenario}"]`);
          if (radio) { radio.checked = true; radio.dispatchEvent(new Event('change')); }
          calcQuick();
          // Switch to Quick tab
          document.querySelector('[data-tab="quick"]').click();
        }
      });
    });
  }

  // ── INIT ───────────────────────────────────────────────────

  function init() {
    initTabs();
    initQuickCalc();
    initRoles();
    initCosts();
    initScenarios();
    initSummary();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
