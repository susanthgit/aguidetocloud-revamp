// Cowork Cost Calculator — simple model (users × usage level)
// Namespace: cowcalc · Public GA credit guidance only.

(function () {
  'use strict';

  // Credits per user / month (low–mid–high) per usage level.
  // Derived from public GA guidance: light/medium/heavy task mix × typical
  // prompts-per-month, using typical credit bands (light 15-30, medium 75-150,
  // heavy 300-550 credits/prompt). Baked in so the tool stays simple.
  const USAGE = {
    light:    { lo: 1150, mid: 1530, hi: 2220, caption: 'Light — occasional use for quick briefs and simple coordination (roughly 30 prompts a month each, mostly light tasks).' },
    balanced: { lo: 3690, mid: 4920, hi: 7080, caption: 'Balanced — a typical mix of quick tasks and the occasional deep, multi-step job (roughly 60 prompts a month each).' },
    heavy:    { lo: 9600, mid: 12800, hi: 18200, caption: 'Heavy — power users running research and multi-tool work most days (roughly 100 prompts a month each, heavier tasks).' }
  };
  let LEVEL = 'balanced';

  const CREDIT_COST = 0.01;  // PayGo $ per Copilot Credit (USD)
  const SEAT = 30;           // M365 Copilot seat $/user/month (USD)

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
  const fmtMoney = (n) => cur().symbol + Math.round(n * cur().rate).toLocaleString('en-US');
  function fmtCompact(n) {
    n = Math.round(n);
    if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M';
    if (n >= 1e3) return Math.round(n / 1e3) + 'K';
    return n.toLocaleString('en-US');
  }
  function num(el, fb) { const v = parseFloat(el && el.value); return isNaN(v) ? (fb || 0) : v; }

  function compute() {
    const users = Math.max(0, num($('num-users'), 0));
    const u = USAGE[LEVEL];

    const cLo = users * u.lo, cMid = users * u.mid, cHi = users * u.hi;
    const varLo = cLo * CREDIT_COST, varMid = cMid * CREDIT_COST, varHi = cHi * CREDIT_COST;
    const seats = users * SEAT;
    const avgLo = u.lo * CREDIT_COST, avgHi = u.hi * CREDIT_COST;

    if ($('out-burn-range')) $('out-burn-range').textContent = fmtMoney(varLo) + ' – ' + fmtMoney(varHi);
    if ($('out-burn-mid')) $('out-burn-mid').textContent = '~' + fmtMoney(varMid) + ' typical · on top of your M365 Copilot seats';
    if ($('out-allin-range')) $('out-allin-range').textContent = fmtMoney(seats + varLo) + ' – ' + fmtMoney(seats + varHi);
    if ($('out-credits-range')) $('out-credits-range').textContent = fmtCompact(cLo) + ' – ' + fmtCompact(cHi);
    if ($('out-avg-user')) $('out-avg-user').textContent = '≈ ' + fmtMoney(avgLo) + ' – ' + fmtMoney(avgHi) + ' per user / month';

    const fx = $('cowcalc-fx-note');
    if (fx) fx.textContent = CUR === 'USD'
      ? 'Microsoft bills Cowork in US dollars.'
      : 'Approximate: ≈ ' + cur().rate + ' × USD. Microsoft bills Cowork in USD — check regional pricing for exact local figures.';
  }

  function setLevel(level) {
    if (!USAGE[level]) return;
    LEVEL = level;
    document.querySelectorAll('.cowcalc-pill').forEach((p) => {
      const on = p.getAttribute('data-usage') === level;
      p.classList.toggle('active', on);
      p.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if ($('usage-caption')) $('usage-caption').textContent = USAGE[level].caption;
    compute();
  }

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
  window.cowcalcGotoDetails = function () { activateTab('patterns'); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  function init() {
    if ($('num-users')) $('num-users').addEventListener('input', compute);
    if ($('cowcalc-currency')) $('cowcalc-currency').addEventListener('change', (e) => { CUR = e.target.value; compute(); });
    document.querySelectorAll('.cowcalc-pill').forEach((p) => p.addEventListener('click', () => setLevel(p.getAttribute('data-usage'))));
    document.querySelectorAll('.cowcalc-tab').forEach((btn) => btn.addEventListener('click', () => activateTab(btn.getAttribute('data-tab'))));
    setLevel('balanced');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
