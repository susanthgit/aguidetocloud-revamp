// Cowork Cost Calculator — persona consumption model
// Namespace: cowcalc
// Public GA credit guidance only (typical bands around published mids).

(function () {
  'use strict';

  // ── Personas (our public taxonomy — also in the pricing spoke) ──
  const PERSONAS = [
    { id: 'corp', defUsers: 25 },
    { id: 'mgmt', defUsers: 5 },
    { id: 'cust', defUsers: 12 },
    { id: 'tech', defUsers: 8 }
  ];

  // Typical credit band PER PROMPT (low–mid–high) around our published mids.
  // Full possible range (5–1000+) noted in methodology; these are the "typical" band.
  const CREDITS = {
    light:  { lo: 15,  mid: 20,  hi: 30 },
    medium: { lo: 75,  mid: 100, hi: 150 },
    heavy:  { lo: 300, mid: 400, hi: 550 }
  };
  const CREDIT_COST = 0.01;   // PayGo $ per Copilot Credit
  const SEAT = 30;            // M365 Copilot seat $/user/month

  const $ = (id) => document.getElementById(id);

  // ── Formatters ──
  const fmtUSD = (n) => '$' + Math.round(n).toLocaleString('en-US');
  function fmtCompact(n) {
    n = Math.round(n);
    if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(n >= 1e5 ? 0 : 0) + 'K';
    return n.toLocaleString('en-US');
  }

  // ── Read inputs ──
  function num(el, fallback) {
    const v = parseFloat(el && el.value);
    return isNaN(v) ? (fallback || 0) : v;
  }

  function getIntensity(pid) {
    const l = Math.max(0, num($('int-' + pid + '-light'), 0));
    const m = Math.max(0, num($('int-' + pid + '-medium'), 0));
    const h = Math.max(0, num($('int-' + pid + '-heavy'), 0));
    return { l: l, m: m, h: h, sum: l + m + h };
  }

  function setSumIndicator(elId, sum) {
    const el = $(elId);
    if (!el) return;
    const ok = Math.round(sum) === 100;
    el.textContent = ok ? '✓ 100%' : (Math.round(sum) + '%');
    el.classList.toggle('cowcalc-sum-ok', ok);
    el.classList.toggle('cowcalc-sum-bad', !ok);
  }

  // ── Core calculation ──
  function compute() {
    const promptsDay = Math.max(0, num($('prompts-day'), 3));
    const workDays = Math.max(1, num($('work-days'), 20));
    const promptsPerUserMonth = promptsDay * workDays;

    let totalUsers = 0;
    let cLo = 0, cMid = 0, cHi = 0;
    const rows = [];

    PERSONAS.forEach((p) => {
      const users = Math.max(0, num($('users-' + p.id), 0));
      totalUsers += users;
      const it = getIntensity(p.id);
      setSumIndicator('sum-' + p.id, it.sum);

      if (users === 0 || it.sum === 0) {
        rows.push({ id: p.id, users: users, credMid: 0, costMid: 0 });
        return;
      }
      const fL = it.l / it.sum, fM = it.m / it.sum, fH = it.h / it.sum;
      const promptsMonth = users * promptsPerUserMonth;

      const pLo = promptsMonth * (fL * CREDITS.light.lo + fM * CREDITS.medium.lo + fH * CREDITS.heavy.lo);
      const pMid = promptsMonth * (fL * CREDITS.light.mid + fM * CREDITS.medium.mid + fH * CREDITS.heavy.mid);
      const pHi = promptsMonth * (fL * CREDITS.light.hi + fM * CREDITS.medium.hi + fH * CREDITS.heavy.hi);

      cLo += pLo; cMid += pMid; cHi += pHi;
      rows.push({ id: p.id, users: users, credMid: pMid, costMid: pMid * CREDIT_COST });
    });

    const varLo = cLo * CREDIT_COST, varMid = cMid * CREDIT_COST, varHi = cHi * CREDIT_COST;
    const seats = totalUsers * SEAT;
    const allInLo = seats + varLo, allInHi = seats + varHi;
    const credPerDay = cMid / workDays;
    const avgLo = totalUsers ? varLo / totalUsers : 0;
    const avgHi = totalUsers ? varHi / totalUsers : 0;

    // ── Render ──
    if ($('total-users')) $('total-users').textContent = totalUsers.toLocaleString('en-US');
    if ($('out-burn-range')) $('out-burn-range').textContent = fmtUSD(varLo) + ' – ' + fmtUSD(varHi);
    if ($('out-burn-mid')) $('out-burn-mid').textContent = '~' + fmtUSD(varMid) + ' typical · on top of your M365 Copilot seats';

    if ($('out-credits-range')) $('out-credits-range').textContent = fmtCompact(cLo) + ' – ' + fmtCompact(cHi);
    if ($('out-credits-day')) $('out-credits-day').textContent = '~' + fmtCompact(credPerDay);
    if ($('out-seats')) $('out-seats').textContent = totalUsers.toLocaleString('en-US') + ' × $30 = ' + fmtUSD(seats);
    if ($('out-avg-user')) $('out-avg-user').textContent = fmtUSD(avgLo) + ' – ' + fmtUSD(avgHi) + '/mo';
    if ($('out-allin-range')) $('out-allin-range').textContent = fmtUSD(allInLo) + ' – ' + fmtUSD(allInHi);

    // Per-persona breakdown
    const tb = $('persona-breakdown');
    if (tb) {
      const labels = { corp: 'Corporate knowledge', mgmt: 'Management & leaders', cust: 'Customer-facing', tech: 'Technical' };
      tb.innerHTML = rows.map((r) =>
        '<tr><td>' + labels[r.id] + '</td><td class="cowcalc-right">' + r.users + '</td>' +
        '<td class="cowcalc-right">' + fmtCompact(r.credMid) + '</td>' +
        '<td class="cowcalc-right cowcalc-metered">' + fmtUSD(r.costMid) + '</td></tr>'
      ).join('');
    }

    updatePresetBurns();
  }

  // ── Standard split → apply to all personas ──
  function applyStandardSplit() {
    const l = num($('split-light'), 60), m = num($('split-medium'), 30), h = num($('split-heavy'), 10);
    PERSONAS.forEach((p) => {
      if ($('int-' + p.id + '-light')) $('int-' + p.id + '-light').value = l;
      if ($('int-' + p.id + '-medium')) $('int-' + p.id + '-medium').value = m;
      if ($('int-' + p.id + '-heavy')) $('int-' + p.id + '-heavy').value = h;
    });
    compute();
  }

  // ── Scenario presets (set personas + split, then show on Calculator tab) ──
  const SCENARIOS = {
    pilot:    { corp: 12, mgmt: 3, cust: 6, tech: 4, split: [70, 25, 5] },
    balanced: { corp: 45, mgmt: 8, cust: 22, tech: 10, split: [60, 30, 10] },
    power:    { corp: 15, mgmt: 5, cust: 20, tech: 30, split: [40, 40, 20] },
    runaway:  { corp: 50, mgmt: 10, cust: 25, tech: 25, split: [30, 40, 30] }
  };

  function scenarioCost(s) {
    const promptsMonth = 3 * 20; // preset display uses default cadence
    let mid = 0, total = 0;
    PERSONAS.forEach((p) => {
      const users = s[p.id] || 0; total += users;
      const sum = s.split[0] + s.split[1] + s.split[2];
      const fL = s.split[0] / sum, fM = s.split[1] / sum, fH = s.split[2] / sum;
      mid += users * promptsMonth * (fL * CREDITS.light.mid + fM * CREDITS.medium.mid + fH * CREDITS.heavy.mid);
    });
    return { cost: mid * CREDIT_COST, users: total };
  }

  function updatePresetBurns() {
    Object.keys(SCENARIOS).forEach((key) => {
      const el = document.querySelector('.cowcalc-preset[data-preset="' + key + '"] [data-burn]');
      if (el) el.textContent = '~' + fmtUSD(scenarioCost(SCENARIOS[key]).cost) + '/mo';
    });
  }

  window.loadPreset = function (name) {
    const s = SCENARIOS[name];
    if (!s) return;
    PERSONAS.forEach((p) => { if ($('users-' + p.id)) $('users-' + p.id).value = s[p.id] || 0; });
    if ($('split-light')) $('split-light').value = s.split[0];
    if ($('split-medium')) $('split-medium').value = s.split[1];
    if ($('split-heavy')) $('split-heavy').value = s.split[2];
    applyStandardSplit();

    document.querySelectorAll('.cowcalc-preset').forEach((c) => c.classList.remove('active'));
    const card = document.querySelector('.cowcalc-preset[data-preset="' + name + '"]');
    if (card) card.classList.add('active');
    activateTab('calculator');
  };

  // ── Tabs ──
  function activateTab(name) {
    document.querySelectorAll('.cowcalc-tab').forEach((t) => {
      const on = t.getAttribute('data-tab') === name;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    document.querySelectorAll('.cowcalc-panel').forEach((p) => p.classList.remove('active'));
    const panel = $('panel-' + name);
    if (panel) panel.classList.add('active');
  }
  function initTabs() {
    document.querySelectorAll('.cowcalc-tab').forEach((btn) => {
      btn.addEventListener('click', () => activateTab(btn.getAttribute('data-tab')));
    });
  }

  // ── Wire up ──
  function init() {
    PERSONAS.forEach((p) => {
      ['users-' + p.id, 'int-' + p.id + '-light', 'int-' + p.id + '-medium', 'int-' + p.id + '-heavy'].forEach((id) => {
        const el = $(id);
        if (el) el.addEventListener('input', compute);
      });
    });
    ['prompts-day', 'work-days', 'split-light', 'split-medium', 'split-heavy'].forEach((id) => {
      const el = $(id);
      if (el) el.addEventListener('input', () => {
        if (id.indexOf('split-') === 0) setSumIndicator('split-sum', num($('split-light'), 0) + num($('split-medium'), 0) + num($('split-heavy'), 0));
        compute();
      });
    });
    const applyBtn = $('apply-split');
    if (applyBtn) applyBtn.addEventListener('click', applyStandardSplit);

    document.querySelectorAll('.cowcalc-preset').forEach((card) => {
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.loadPreset(card.getAttribute('data-preset')); }
      });
    });

    setSumIndicator('split-sum', num($('split-light'), 60) + num($('split-medium'), 30) + num($('split-heavy'), 10));
    initTabs();
    compute();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
