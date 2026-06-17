// Cowork Cost Calculator — persona consumption model + multi-currency
// Namespace: cowcalc · Public GA credit guidance only (typical bands).

(function () {
  'use strict';

  const PERSONAS = [
    { id: 'corp', label: 'Corporate knowledge' },
    { id: 'mgmt', label: 'Management & leaders' },
    { id: 'cust', label: 'Customer-facing' },
    { id: 'tech', label: 'Technical' }
  ];

  // Typical credit band PER PROMPT (low–mid–high) around published mids.
  const CREDITS = {
    light:  { lo: 15,  mid: 20,  hi: 30 },
    medium: { lo: 75,  mid: 100, hi: 150 },
    heavy:  { lo: 300, mid: 400, hi: 550 }
  };
  const CREDIT_COST = 0.01;   // PayGo $ per Copilot Credit (USD)
  const SEAT = 30;            // M365 Copilot seat $/user/month (USD)

  // Same currency table the site's other calculators use.
  const CURRENCIES = {
    USD: { symbol: '$',   rate: 1 },
    GBP: { symbol: '£',   rate: 0.79 },
    EUR: { symbol: '€',   rate: 0.92 },
    AUD: { symbol: 'A$',  rate: 1.55 },
    NZD: { symbol: 'NZ$', rate: 1.70 }
  };
  let CUR = 'USD';

  const $ = (id) => document.getElementById(id);
  const cur = () => CURRENCIES[CUR] || CURRENCIES.USD;

  // ── Formatters ──
  const fmtMoney = (n) => cur().symbol + Math.round(n * cur().rate).toLocaleString('en-US');
  function fmtCompact(n) {
    n = Math.round(n);
    if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M';
    if (n >= 1e3) return Math.round(n / 1e3) + 'K';
    return n.toLocaleString('en-US');
  }
  function num(el, fb) { const v = parseFloat(el && el.value); return isNaN(v) ? (fb || 0) : v; }

  function getIntensity(pid) {
    const l = Math.max(0, num($('int-' + pid + '-light'), 0));
    const m = Math.max(0, num($('int-' + pid + '-medium'), 0));
    const h = Math.max(0, num($('int-' + pid + '-heavy'), 0));
    return { l: l, m: m, h: h, sum: l + m + h };
  }
  function setSum(elId, sum) {
    const el = $(elId); if (!el) return;
    const ok = Math.round(sum) === 100;
    el.textContent = ok ? '✓ 100%' : (Math.round(sum) + '%');
    el.classList.toggle('cowcalc-sum-ok', ok);
    el.classList.toggle('cowcalc-sum-bad', !ok);
  }

  function compute() {
    const promptsDay = Math.max(0, num($('prompts-day'), 3));
    const workDays = Math.max(1, num($('work-days'), 20));
    const ppm = promptsDay * workDays;

    let totalUsers = 0, cLo = 0, cMid = 0, cHi = 0;
    const rows = [];

    PERSONAS.forEach((p) => {
      const users = Math.max(0, num($('users-' + p.id), 0));
      totalUsers += users;
      const it = getIntensity(p.id);
      setSum('sum-' + p.id, it.sum);
      if (users === 0 || it.sum === 0) { rows.push({ label: p.label, users: users, credMid: 0, costMid: 0 }); return; }
      const fL = it.l / it.sum, fM = it.m / it.sum, fH = it.h / it.sum;
      const pm = users * ppm;
      const lo = pm * (fL * CREDITS.light.lo + fM * CREDITS.medium.lo + fH * CREDITS.heavy.lo);
      const mid = pm * (fL * CREDITS.light.mid + fM * CREDITS.medium.mid + fH * CREDITS.heavy.mid);
      const hi = pm * (fL * CREDITS.light.hi + fM * CREDITS.medium.hi + fH * CREDITS.heavy.hi);
      cLo += lo; cMid += mid; cHi += hi;
      rows.push({ label: p.label, users: users, credMid: mid, costMid: mid * CREDIT_COST });
    });

    const varLo = cLo * CREDIT_COST, varMid = cMid * CREDIT_COST, varHi = cHi * CREDIT_COST;
    const seats = totalUsers * SEAT;
    const credPerDay = cMid / workDays;
    const avgLo = totalUsers ? varLo / totalUsers : 0;
    const avgHi = totalUsers ? varHi / totalUsers : 0;

    if ($('total-users')) $('total-users').textContent = totalUsers.toLocaleString('en-US');
    if ($('out-burn-range')) $('out-burn-range').textContent = fmtMoney(varLo) + ' – ' + fmtMoney(varHi);
    if ($('out-burn-mid')) $('out-burn-mid').textContent = '~' + fmtMoney(varMid) + ' typical · on top of your M365 Copilot seats';
    if ($('out-credits-range')) $('out-credits-range').textContent = fmtCompact(cLo) + ' – ' + fmtCompact(cHi);
    if ($('out-credits-day')) $('out-credits-day').textContent = '~' + fmtCompact(credPerDay);
    if ($('out-seats')) $('out-seats').textContent = totalUsers.toLocaleString('en-US') + ' × ' + fmtMoney(SEAT) + ' = ' + fmtMoney(seats);
    if ($('out-avg-user')) $('out-avg-user').textContent = fmtMoney(avgLo) + ' – ' + fmtMoney(avgHi) + '/mo';
    if ($('out-allin-range')) $('out-allin-range').textContent = fmtMoney(seats + varLo) + ' – ' + fmtMoney(seats + varHi);

    const tb = $('persona-breakdown');
    if (tb) tb.innerHTML = rows.map((r) =>
      '<tr><td>' + r.label + '</td><td class="cowcalc-right">' + r.users + '</td>' +
      '<td class="cowcalc-right">' + fmtCompact(r.credMid) + '</td>' +
      '<td class="cowcalc-right cowcalc-metered">' + fmtMoney(r.costMid) + '</td></tr>'
    ).join('');

    const fx = $('cowcalc-fx-note');
    if (fx) fx.textContent = CUR === 'USD'
      ? 'Microsoft bills Cowork in US dollars.'
      : 'Approximate: ≈ ' + cur().rate + ' × USD. Microsoft bills Cowork in USD — check regional pricing for exact local figures.';

    updatePresetBurns();
  }

  function applyStandardSplit() {
    const l = num($('split-light'), 60), m = num($('split-medium'), 30), h = num($('split-heavy'), 10);
    PERSONAS.forEach((p) => {
      if ($('int-' + p.id + '-light')) $('int-' + p.id + '-light').value = l;
      if ($('int-' + p.id + '-medium')) $('int-' + p.id + '-medium').value = m;
      if ($('int-' + p.id + '-heavy')) $('int-' + p.id + '-heavy').value = h;
    });
    compute();
  }

  const SCENARIOS = {
    pilot:    { corp: 12, mgmt: 3, cust: 6, tech: 4, split: [70, 25, 5] },
    balanced: { corp: 45, mgmt: 8, cust: 22, tech: 10, split: [60, 30, 10] },
    power:    { corp: 15, mgmt: 5, cust: 20, tech: 30, split: [40, 40, 20] },
    runaway:  { corp: 50, mgmt: 10, cust: 25, tech: 25, split: [30, 40, 30] }
  };
  function scenarioCost(s) {
    const ppm = 3 * 20; let mid = 0;
    PERSONAS.forEach((p) => {
      const users = s[p.id] || 0;
      const sum = s.split[0] + s.split[1] + s.split[2];
      const fL = s.split[0] / sum, fM = s.split[1] / sum, fH = s.split[2] / sum;
      mid += users * ppm * (fL * CREDITS.light.mid + fM * CREDITS.medium.mid + fH * CREDITS.heavy.mid);
    });
    return mid * CREDIT_COST;
  }
  function updatePresetBurns() {
    Object.keys(SCENARIOS).forEach((key) => {
      const el = document.querySelector('.cowcalc-preset[data-preset="' + key + '"] [data-burn]');
      if (el) el.textContent = '~' + fmtMoney(scenarioCost(SCENARIOS[key])) + '/mo';
    });
  }

  window.loadPreset = function (name) {
    const s = SCENARIOS[name]; if (!s) return;
    PERSONAS.forEach((p) => { if ($('users-' + p.id)) $('users-' + p.id).value = s[p.id] || 0; });
    if ($('split-light')) $('split-light').value = s.split[0];
    if ($('split-medium')) $('split-medium').value = s.split[1];
    if ($('split-heavy')) $('split-heavy').value = s.split[2];
    setSum('split-sum', s.split[0] + s.split[1] + s.split[2]);
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

  function init() {
    PERSONAS.forEach((p) => {
      ['users-' + p.id, 'int-' + p.id + '-light', 'int-' + p.id + '-medium', 'int-' + p.id + '-heavy'].forEach((id) => {
        const el = $(id); if (el) el.addEventListener('input', compute);
      });
    });
    ['prompts-day', 'work-days', 'split-light', 'split-medium', 'split-heavy'].forEach((id) => {
      const el = $(id);
      if (el) el.addEventListener('input', () => {
        if (id.indexOf('split-') === 0) setSum('split-sum', num($('split-light'), 0) + num($('split-medium'), 0) + num($('split-heavy'), 0));
        compute();
      });
    });
    if ($('apply-split')) $('apply-split').addEventListener('click', applyStandardSplit);
    if ($('cowcalc-currency')) $('cowcalc-currency').addEventListener('change', (e) => { CUR = e.target.value; compute(); });

    document.querySelectorAll('.cowcalc-tab').forEach((btn) => btn.addEventListener('click', () => activateTab(btn.getAttribute('data-tab'))));
    document.querySelectorAll('.cowcalc-preset').forEach((card) => {
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.loadPreset(card.getAttribute('data-preset')); }
      });
    });

    setSum('split-sum', num($('split-light'), 60) + num($('split-medium'), 30) + num($('split-heavy'), 10));
    compute();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
