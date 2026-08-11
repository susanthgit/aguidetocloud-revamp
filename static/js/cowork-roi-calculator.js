// Cowork Credit Value Calculator — "is this task worth its credits?"
// Namespace: cwroi · Honest, task-level. Break-even minutes is the hero;
// value-to-credit ratio is secondary and never called "ROI".
// Volume cancels out of the ratio, so we model ONE completed task, not a tenant.

(function () {
  'use strict';

  var DEF_PRICE = 0.01;   // $ per Copilot Credit (PAYGO, public — editable)
  var DEF_RATE  = 72;     // illustrative loaded $/hr (Microsoft ROI Model default)

  // Optional "starting point" minutes-saved-per-task, as compiled in Microsoft's
  // open-source Cowork ROI Model. These are EXTERNAL study priors, NOT Cowork
  // measurements — surfaced only to help a first estimate. Users should measure.
  var BENCH = {
    analysis: { min: 67, label: 'Analysis & research' },
    document: { min: 24, label: 'Document & content creation' },
    meeting:  { min: 24, label: 'Meeting workflows' },
    code:     { min: 56, label: 'Write or debug code' },
    special:  { min: 25, label: 'Specialized workflows' },
    email:    { min: 5,  label: 'Email workflows' },
    comms:    { min: 4,  label: 'Communication workflows' },
    general:  { min: 5,  label: 'General assistance / other' }
  };

  var share = 0.5; // usable share of saved time (default 50%)

  var $ = function (id) { return document.getElementById(id); };
  function num(el, fb) { var v = parseFloat(el && el.value); return isNaN(v) ? (fb || 0) : v; }

  function money(n) {
    if (!isFinite(n)) return '\u2014';
    var v = Math.round(n * 100) / 100;
    return '$' + v.toLocaleString('en-US', {
      minimumFractionDigits: Math.abs(v) < 100 ? 2 : 0,
      maximumFractionDigits: 2
    });
  }
  function mins(n) {
    if (!isFinite(n)) return '\u2014';
    return (Math.round(n * 10) / 10).toLocaleString('en-US') + ' min';
  }
  // Gross minutes a task must save so its capacity value covers its credit cost.
  function breakEven(costUSD, rate, sh) {
    return (rate > 0 && sh > 0) ? (costUSD * 60) / (rate * sh) : Infinity;
  }

  function compute() {
    var credits = Math.max(0, num($('cwroi-credits'), 0));
    var price   = Math.max(0, num($('cwroi-price'), DEF_PRICE));
    var rate    = Math.max(0, num($('cwroi-rate'), DEF_RATE));
    var minutes = Math.max(0, num($('cwroi-minutes'), 0));

    var cost = credits * price;                 // $ per completed task
    var be   = breakEven(cost, rate, share);    // minutes needed to break even

    // ── Hero: break-even minutes ──
    if ($('cwroi-be')) $('cwroi-be').textContent = (credits > 0 && isFinite(be)) ? mins(be) : '\u2014';
    if ($('cwroi-be-sub')) $('cwroi-be-sub').textContent = (credits > 0)
      ? 'to cover this task\u2019s ' + money(cost) + ' of credits, at ' + Math.round(share * 100) + '% usable time'
      : 'Enter the credits this task used to see its break-even.';

    // ── Supporting figures (only meaningful once minutes are entered) ──
    var cap = minutes * share * rate / 60;      // modelled capacity value ($)
    var vpd = cost > 0 ? cap / cost : 0;        // value per $1 of credits (NOT ROI)
    if ($('cwroi-creditcost')) $('cwroi-creditcost').textContent = money(cost);
    if ($('cwroi-capvalue'))   $('cwroi-capvalue').textContent   = minutes > 0 ? money(cap) : '\u2014';
    if ($('cwroi-vpd'))        $('cwroi-vpd').textContent        = (minutes > 0 && cost > 0) ? (Math.round(vpd * 10) / 10) + '\u00d7' : '\u2014';

    // ── Status line ──
    var st = $('cwroi-status');
    if (st) {
      var cls = 'cwroi-status';
      if (credits <= 0) {
        st.innerHTML = 'Enter the task\u2019s credits to begin.';
      } else if (minutes <= 0) {
        st.innerHTML = 'Now add the minutes it saved (net of your own time) to test it against break-even \u2014 or pick a benchmark to start.';
      } else if (minutes >= be) {
        st.innerHTML = 'Clears break-even \u2014 it saves about <strong>' + mins(minutes - be) + '</strong> more than its credits cost, at ' + Math.round(share * 100) + '% usable.';
        cls += ' cwroi-status-ok';
      } else {
        st.innerHTML = 'Below break-even \u2014 about <strong>' + mins(be - minutes) + '</strong> short of covering its credits, at ' + Math.round(share * 100) + '% usable.';
        cls += ' cwroi-status-warn';
      }
      st.className = cls;
    }

    // ── Sensitivity: break-even minutes at 25 / 50 / 100% usable ──
    [[25, 0.25], [50, 0.5], [100, 1]].forEach(function (p) {
      var beP = breakEven(cost, rate, p[1]);
      var cell = $('cwroi-sens-' + p[0]);
      if (!cell) return;
      var mark = '';
      if (minutes > 0 && isFinite(beP)) {
        mark = minutes >= beP
          ? ' <span class="cwroi-tick cwroi-tick-ok">clears</span>'
          : ' <span class="cwroi-tick cwroi-tick-no">short</span>';
      }
      cell.innerHTML = (credits > 0 && isFinite(beP) ? mins(beP) : '\u2014') + mark;
    });

    if ($('cwroi-sr')) $('cwroi-sr').textContent = credits > 0
      ? 'Break-even ' + mins(be) + ' to cover ' + money(cost) + ' of credits at ' + Math.round(share * 100) + ' percent usable time.' + (minutes > 0 ? (minutes >= be ? ' Your estimate clears it.' : ' Your estimate is below it.') : '')
      : 'Enter credits to compute break-even.';
  }

  function setShare(sh) {
    share = sh;
    var pct = Math.round(sh * 100);
    document.querySelectorAll('.cwroi-share-pill').forEach(function (p) {
      var on = parseFloat(p.getAttribute('data-share')) === pct;
      p.classList.toggle('active', on);
      p.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    var cap = $('cwroi-share-caption');
    if (cap) cap.textContent = sh === 0.25
      ? 'Conservative — only a quarter of freed time turns into useful output.'
      : (sh === 1
        ? 'Upper bound — every freed minute becomes useful output (rarely true in practice).'
        : 'Working assumption — about half of freed time turns into useful output. An editorial estimate, not a research figure.');
    compute();
  }

  function init() {
    ['cwroi-credits', 'cwroi-minutes', 'cwroi-rate', 'cwroi-price'].forEach(function (id) {
      var el = $(id); if (el) el.addEventListener('input', compute);
    });
    var b = $('cwroi-benchmark');
    if (b) b.addEventListener('change', function () {
      var m = $('cwroi-minutes');
      if (BENCH[b.value] && m) m.value = BENCH[b.value].min;
      compute();
    });
    document.querySelectorAll('.cwroi-share-pill').forEach(function (p) {
      p.addEventListener('click', function () { setShare(parseFloat(p.getAttribute('data-share')) / 100); });
    });
    setShare(0.5);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
