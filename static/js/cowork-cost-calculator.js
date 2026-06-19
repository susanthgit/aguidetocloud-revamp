// Cowork Cost Calculator — "the meter" instrument
// Namespace: cowcalc · Calibrated to Microsoft's Customer Cowork Estimator
// (default persona mixes ≈ $82–228 / user / month; credits @ $0.01 PayGo).

(function () {
  'use strict';

  // Credits per user / month (low–mid–high) per usage level, calibrated to
  // Microsoft's 2026 Customer Cowork Estimator workbook defaults.
  // Bands × $0.01 = $/user/month.
  const USAGE = {
    light:    { lo: 7000,  mid: 8225,  hi: 10000, cap: 'Light — lower-volume users, close to the manager / senior leader default mix in Microsoft\u2019s estimator.' },
    balanced: { lo: 14250, mid: 14625, hi: 15000, cap: 'Balanced — typical corporate or customer-facing knowledge worker mix from Microsoft\u2019s estimator defaults.' },
    heavy:    { lo: 20000, mid: 22800, hi: 26000, cap: 'Heavy — technical or power users with more frequent heavy prompts in the estimator defaults.' }
  };
  let LEVEL = 'balanced';

  const CREDIT_COST = 0.01;  // PayGo $ per Copilot Credit (USD)
  const SEAT = 30;           // M365 Copilot seat $/user/month (USD)
  const HEAVY_TASK_CREDITS = 1200; // one heavy Cowork run (estimator heavy band)

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
  const fmtN = (n) => Math.round(n).toLocaleString('en-US');
  const fmtMoney = (n) => cur().symbol + fmtN(n * cur().rate);
  function fmtCompact(n) {
    n = Math.round(n);
    if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M';
    if (n >= 1e3) return Math.round(n / 1e3) + 'K';
    return n.toLocaleString('en-US');
  }
  function num(el, fb) { const v = parseFloat(el && el.value); return isNaN(v) ? (fb || 0) : v; }

  // ── Count-up meter ──
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let meterRAF = null, meterCurrent = 0;
  function animateMeter(el, to) {
    if (!el) return;
    const symbol = cur().symbol;
    if (meterRAF) { cancelAnimationFrame(meterRAF); meterRAF = null; }
    const from = meterCurrent;
    if (reduceMotion || Math.abs(to - from) < 1) { meterCurrent = to; el.textContent = symbol + fmtN(to); el.dataset.val = to; return; }
    let start = null; const dur = 480;
    function step(ts) {
      if (!start) start = ts;
      const t = Math.min(1, (ts - start) / dur);
      const e = 1 - Math.pow(1 - t, 3);
      meterCurrent = from + (to - from) * e;
      el.textContent = symbol + fmtN(meterCurrent);
      if (t < 1) { meterRAF = requestAnimationFrame(step); }
      else { meterCurrent = to; el.textContent = symbol + fmtN(to); el.dataset.val = to; meterRAF = null; }
    }
    meterRAF = requestAnimationFrame(step);
  }

  function compute() {
    const users = Math.max(0, num($('num-users'), 0));
    const u = USAGE[LEVEL];

    const credLo = users * u.lo, credMid = users * u.mid, credHi = users * u.hi;
    const varLo = credLo * CREDIT_COST, varMid = credMid * CREDIT_COST, varHi = credHi * CREDIT_COST;
    const seats = users * SEAT;
    const allinMid = seats + varMid;
    const perLo = u.lo * CREDIT_COST, perHi = u.hi * CREDIT_COST;
    const mult = seats > 0 ? varMid / seats : 0;

    // Meter (typical, animated) + range
    animateMeter($('out-meter'), varMid * cur().rate);
    if ($('out-range')) $('out-range').textContent = 'range ' + fmtMoney(varLo) + ' – ' + fmtMoney(varHi) + ' · billed in Copilot Credits @ $0.01';

    // Seat-vs-meter split bar
    const total = seats + varMid || 1;
    const seatPct = Math.max(2, Math.min(98, seats / total * 100));
    if ($('split-seat')) $('split-seat').style.width = seatPct + '%';
    if ($('split-meter')) $('split-meter').style.width = (100 - seatPct) + '%';
    if ($('split-seat-val')) $('split-seat-val').textContent = fmtMoney(seats);
    if ($('split-meter-val')) $('split-meter-val').textContent = '~' + fmtMoney(varMid);
    if ($('split-allin')) $('split-allin').textContent = fmtMoney(allinMid);

    // Verdict (neutral, helpful)
    const v = $('out-verdict');
    if (v) {
      if (users === 0) v.innerHTML = 'Add a few users to run the meter.';
      else if (mult >= 1) v.innerHTML = 'At this usage, the Cowork meter is about <strong>' + (mult).toFixed(1) + '×</strong> your seat bill — worth modelling, and setting spend caps, before a broad rollout.';
      else v.innerHTML = 'At this usage, Cowork adds about <strong>' + Math.round(mult * 100) + '%</strong> on top of your seat bill. Set caps and review as usage grows.';
    }

    // Supporting
    if ($('out-credits')) $('out-credits').textContent = fmtCompact(credLo) + ' – ' + fmtCompact(credHi);
    if ($('out-peruser')) $('out-peruser').textContent = fmtMoney(perLo) + ' – ' + fmtMoney(perHi);
    if ($('out-seats-line')) $('out-seats-line').textContent = users.toLocaleString('en-US') + ' × ' + fmtMoney(SEAT);

    // Habit strip (fixed illustration of recurring heavy runs)
    setHabit('habit-month', HEAVY_TASK_CREDITS * 1);
    setHabit('habit-week', HEAVY_TASK_CREDITS * 4.33);
    setHabit('habit-day', HEAVY_TASK_CREDITS * 20);
    setHabit('habit-team', HEAVY_TASK_CREDITS * 4.33 * 20);

    if ($('out-meter-sr')) $('out-meter-sr').textContent = 'Estimated monthly Cowork usage ' + fmtMoney(varMid) + ' typical, range ' + fmtMoney(varLo) + ' to ' + fmtMoney(varHi) + '. All-in ' + fmtMoney(allinMid) + ' per month.';

    const fx = $('cowcalc-fx-note');
    if (fx) fx.textContent = CUR === 'USD'
      ? 'Microsoft bills Cowork in US dollars.'
      : 'Approximate: \u2248 ' + cur().rate + ' \u00d7 USD. Microsoft bills Cowork in USD — check regional pricing for exact local figures.';
  }
  function setHabit(id, credits) { const el = $(id); if (el) el.textContent = '~' + fmtMoney(credits * CREDIT_COST); }

  // ── Exact credit-cost check (independent of the estimate; currency-aware) ──
  function computeCredit() {
    const credits = Math.max(0, num($('cc-credits'), 0));
    const runs = Math.max(0, num($('cc-runs'), 0));
    const total = credits * runs;
    const cost = total * CREDIT_COST;
    const perRun = credits * CREDIT_COST;
    if ($('cc-cost')) $('cc-cost').textContent = fmtMoney(cost);
    if ($('cc-sub')) $('cc-sub').textContent = 'per month · ' + fmtCompact(total) + ' credits · ' + fmtMoney(perRun) + ' per run';
    if ($('cc-sr')) $('cc-sr').textContent = 'Exact credit cost ' + fmtMoney(cost) + ' per month — ' + runs + ' runs at ' + fmtCompact(credits) + ' credits each, ' + fmtMoney(perRun) + ' per run.';
  }

  function setLevel(level) {
    if (!USAGE[level]) return;
    LEVEL = level;
    document.querySelectorAll('.cowcalc-pill').forEach((p) => {
      const on = p.getAttribute('data-usage') === level;
      p.classList.toggle('active', on);
      p.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if ($('usage-caption')) $('usage-caption').textContent = USAGE[level].cap;
    compute();
  }

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
  window.cowcalcGotoDetails = function () { activateTab('patterns'); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  function init() {
    if ($('num-users')) $('num-users').addEventListener('input', compute);
    if ($('cowcalc-currency')) $('cowcalc-currency').addEventListener('change', (e) => { CUR = e.target.value; compute(); computeCredit(); });
    document.querySelectorAll('.cowcalc-pill').forEach((p) => {
      p.addEventListener('click', () => setLevel(p.getAttribute('data-usage')));
      p.addEventListener('mouseenter', () => { if ($('usage-caption')) $('usage-caption').textContent = USAGE[p.getAttribute('data-usage')].cap; });
      p.addEventListener('mouseleave', () => { if ($('usage-caption')) $('usage-caption').textContent = USAGE[LEVEL].cap; });
    });
    document.querySelectorAll('.cowcalc-tab').forEach((btn) => btn.addEventListener('click', () => activateTab(btn.getAttribute('data-tab'))));
    ['cc-credits', 'cc-runs'].forEach((id) => { const el = $(id); if (el) el.addEventListener('input', computeCredit); });
    setLevel('balanced');
    computeCredit();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
