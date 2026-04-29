/* ==================================================================
   Token Calculator v3 — token-calculator.js
   World-class: verdict, tier filter, budget cap, cached/batch pricing,
   conversation calc, smart routing, context window fit, capability
   filter, share URL, trust badge. 100% client-side.
   ================================================================== */

(function () {
  'use strict';

  var T = window.__tokCalcData || {};
  var MODELS = T.models || [];
  var USE_CASES = T.use_cases || [];

  var CURRENCIES = {
    USD: { symbol: '$', rate: 1 },
    GBP: { symbol: '£', rate: 0.79 },
    EUR: { symbol: '€', rate: 0.92 },
    AUD: { symbol: 'A$', rate: 1.55 },
    NZD: { symbol: 'NZ$', rate: 1.70 }
  };

  var S = { currency: 'USD', mult: 1, tierFilter: 'all', useCached: false, useBatch: false, budgetCap: 0, requiredCaps: [] };

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
    if (v >= 1000) return currSym() + Math.round(v).toLocaleString('en-US');
    if (v >= 1) return currSym() + v.toFixed(2);
    if (v >= 0.01) return currSym() + v.toFixed(3);
    return currSym() + v.toFixed(4);
  }
  function fmtUSD(n) { return '$' + (typeof n === 'number' ? n.toFixed(2) : '0.00'); }
  function fmtK(n) { return n >= 1e6 ? (n / 1e6).toFixed(0) + 'M' : n >= 1000 ? (n / 1000).toFixed(0) + 'K' : String(n); }
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function setText(id, t) { var el = $(id); if (el) el.textContent = t; }
  function debounce(fn, ms) { var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; }

  function syncRange(rangeId, numId, cb) {
    var range = $(rangeId), num = $(numId);
    if (!range || !num) return;
    range.addEventListener('input', function () { num.value = range.value; cb(); });
    num.addEventListener('input', function () { range.value = num.value; cb(); });
  }

  function setSelectClosest(sel, targetVal) {
    var best = null, bestDist = Infinity;
    for (var i = 0; i < sel.options.length; i++) {
      var v = parseInt(sel.options[i].value);
      var dist = Math.abs(v - targetVal);
      if (dist < bestDist) { bestDist = dist; best = sel.options[i].value; }
    }
    if (best !== null) sel.value = best;
  }

  /* ── FILTER MODELS ── */

  function filterModels() {
    return MODELS.filter(function (m) {
      if (S.tierFilter !== 'all' && m.tier !== S.tierFilter && m.tier !== S.tierFilter + '-budget') return false;
      if (S.requiredCaps.length > 0) {
        var caps = m.capabilities || [];
        for (var i = 0; i < S.requiredCaps.length; i++) {
          if (caps.indexOf(S.requiredCaps[i]) === -1) return false;
        }
      }
      return true;
    });
  }

  function getModelPrice(m) {
    var inP = m.input_per_1m;
    if (S.useBatch && m.batch_input_per_1m) inP = m.batch_input_per_1m;
    else if (S.useCached && m.cached_input_per_1m) inP = m.cached_input_per_1m;
    var outP = m.output_per_1m;
    if (S.useBatch && m.batch_output_per_1m) outP = m.batch_output_per_1m;
    return { input: inP, output: outP };
  }

  /* ── INPUTS ── */

  function getInputs() {
    var txt = ($('token-text') || {}).value || '';
    var queries = parseInt(($('tok-queries') || {}).value) || 100;
    var days = parseInt(($('tok-days') || {}).value) || 22;
    var inTok = parseInt(($('tok-input-len') || {}).value) || 500;
    var outTok = parseInt(($('tok-output-len') || {}).value) || 500;
    if (txt.trim()) {
      var w = txt.trim().split(/\s+/).length;
      var est = Math.round(w * 1.3);
      setText('token-text-count', est.toLocaleString() + ' tokens (' + w.toLocaleString() + ' words)');
      inTok = est; outTok = Math.round(est * 0.8);
    } else { setText('token-text-count', ''); }
    return { inTok: inTok, outTok: outTok, queries: queries, days: days, monthly: queries * days, txt: txt };
  }

  function computeRows(inp, models) {
    var mult = S.mult || 1;
    return (models || filterModels()).map(function (m) {
      var p = getModelPrice(m);
      var inC = (inp.inTok / 1e6) * p.input * inp.monthly * mult;
      var outC = (inp.outTok / 1e6) * p.output * inp.monthly * mult;
      var mo = inC + outC;
      return { provider: m.provider, model: m.model, input: p.input, output: p.output, monthly: mo, annual: mo * 12, tier: m.tier, context: m.context_window || 0, source_url: m.source_url || '', caps: m.capabilities || [] };
    }).sort(function (a, b) { return a.monthly - b.monthly; });
  }

  /* ── RENDER ALL ── */

  function renderAll() {
    var inp = getInputs();
    var rows = computeRows(inp);
    renderTable(rows, inp);
    renderMetrics(rows, inp);
    renderVerdict(rows, inp);
    renderContextFit(inp, rows);
    if (S.mult > 1 && !inp.txt.trim()) {
      var n = $('token-text-count');
      if (n && n.textContent.indexOf('multiplier') === -1) n.textContent = (n.textContent ? n.textContent + ' · ' : '') + S.mult + 'x multi-turn multiplier';
    }
  }

  /* ── TABLE ── */

  function renderTable(rows) {
    var body = $q('#table-tokens tbody');
    if (!body) return;
    var budget = S.budgetCap > 0 ? S.budgetCap / currRate() : 0;
    body.innerHTML = '';
    rows.forEach(function (r, i) {
      var over = budget > 0 && r.monthly > budget;
      var cls = [];
      if (i === 0) cls.push('cheapest');
      if (i === rows.length - 1 && rows.length > 1) cls.push('expensive');
      if (over) cls.push('over-budget');
      var badge = '';
      if (i === 0) badge = ' <span class="tokcalc-badge tokcalc-badge-green">Cheapest</span>';
      if (i === rows.length - 1 && rows.length > 1) badge = ' <span class="tokcalc-badge tokcalc-badge-amber">Priciest</span>';
      var srcLink = r.source_url ? ' <a href="' + esc(r.source_url) + '" target="_blank" rel="noopener" class="tokcalc-src-link" title="Official pricing page">src</a>' : '';
      body.innerHTML += '<tr' + (cls.length ? ' class="' + cls.join(' ') + '"' : '') + '>' +
        '<td>' + esc(r.provider) + badge + srcLink + '</td>' +
        '<td>' + esc(r.model) + '</td>' +
        '<td class="right">' + fmtUSD(r.input) + '</td>' +
        '<td class="right">' + fmtUSD(r.output) + '</td>' +
        '<td class="right"><strong>' + fmt(r.monthly) + '</strong></td>' +
        '<td class="right">' + fmt(r.annual) + '</td>' +
        '</tr>';
    });
  }

  function renderMetrics(rows, inp) {
    if (rows.length > 0) { setText('m-cheapest', fmt(rows[0].monthly)); setText('m-expensive', fmt(rows[rows.length - 1].monthly)); }
    setText('m-queries', inp.monthly.toLocaleString());
    setText('m-tokens', (inp.inTok + inp.outTok).toLocaleString());
  }

  /* ── VERDICT ── */

  function renderVerdict(rows, inp) {
    var el = $('verdict-card');
    if (!el || rows.length < 1) return;
    var c = rows[0];
    var flagship = rows.find(function (r) { return r.tier === 'flagship'; });
    var reasoning = rows.find(function (r) { return r.tier === 'reasoning' || r.tier === 'reasoning-budget'; });
    var lines = [];
    lines.push('For <strong>' + inp.monthly.toLocaleString() + ' queries/month</strong>: <strong>' + esc(c.model) + '</strong> is cheapest at <strong>' + fmt(c.monthly) + '/mo</strong>.');
    if (flagship && flagship.model !== c.model) { var sv = flagship.monthly - c.monthly; if (sv > 0) lines.push('Saves <strong>' + fmt(sv) + '/mo</strong> vs ' + esc(flagship.model) + '.'); }
    if (reasoning) lines.push('Cheapest reasoning: <strong>' + esc(reasoning.model) + '</strong> at <strong>' + fmt(reasoning.monthly) + '/mo</strong>.');
    if (S.budgetCap > 0) { var b = S.budgetCap / currRate(); var af = rows.filter(function (r) { return r.monthly <= b; }); lines.push(af.length === 0 ? '<span class="tokcalc-verdict-warn">No models fit your budget — reduce queries or use shorter prompts.</span>' : af.length + ' of ' + rows.length + ' models fit your budget.'); }
    if (S.useBatch) lines.push('Batch API pricing applied — 50% savings on supported models.');
    else if (S.useCached) lines.push('Cached input pricing applied — ideal for RAG workloads.');
    el.innerHTML = lines.join(' ');
  }

  /* ── CONTEXT WINDOW FIT CHECK (Feature 2) ── */

  function renderContextFit(inp, rows) {
    var el = $('context-fit-bars');
    if (!el) return;
    var totalTok = (inp.inTok + inp.outTok) * (S.mult || 1);
    if (totalTok < 100) { el.innerHTML = '<p class="tokcalc-field-hint">Set a usage profile or paste text to see context window utilisation.</p>'; return; }
    var models = filterModels();
    var items = models.map(function (m) { return { model: m.model, provider: m.provider, ctx: m.context_window || 128000 }; });
    items.sort(function (a, b) { return a.ctx - b.ctx; });
    var seen = {};
    items = items.filter(function (m) { var k = m.model; if (seen[k]) return false; seen[k] = true; return true; });
    var html = '';
    items.forEach(function (m) {
      var pct = Math.min((totalTok / m.ctx) * 100, 100);
      var fits = totalTok <= m.ctx;
      var color = fits ? (pct < 50 ? 'var(--success, #22C55E)' : 'var(--warning, #F59E0B)') : 'var(--error, #EF4444)';
      var label = fits ? Math.round(pct) + '% used' : 'Needs ' + Math.ceil(totalTok / m.ctx) + ' chunks';
      html += '<div class="tokcalc-ctx-row">' +
        '<span class="tokcalc-ctx-model">' + esc(m.model) + ' <span class="tokcalc-ctx-window">' + fmtK(m.ctx) + '</span></span>' +
        '<div class="tokcalc-ctx-bar-wrap"><div class="tokcalc-ctx-bar" style="width:' + Math.min(pct, 100) + '%;background:' + color + '"></div></div>' +
        '<span class="tokcalc-ctx-label">' + label + '</span></div>';
    });
    el.innerHTML = html;
  }

  /* ── SMART ROUTING (Feature 1-new) ── */

  function initRouting() {
    var simSel = $('route-simple-model');
    var comSel = $('route-complex-model');
    if (!simSel || !comSel) return;
    MODELS.forEach(function (m) {
      var o1 = document.createElement('option'); o1.value = m.model; o1.textContent = m.provider + ' — ' + m.model;
      var o2 = o1.cloneNode(true);
      simSel.appendChild(o1); comSel.appendChild(o2);
    });
    var budgetModel = MODELS.find(function (m) { return m.tier === 'budget' && m.provider === 'Google'; });
    var flagshipModel = MODELS.find(function (m) { return m.tier === 'flagship' && m.provider === 'OpenAI'; });
    if (budgetModel) simSel.value = budgetModel.model;
    if (flagshipModel) comSel.value = flagshipModel.model;

    var split = $('route-split-range');
    if (split) split.addEventListener('input', function () { setText('route-simple-pct', split.value + '%'); setText('route-complex-pct', (100 - parseInt(split.value)) + '%'); renderRouting(); });
    if (simSel) simSel.addEventListener('change', renderRouting);
    if (comSel) comSel.addEventListener('change', renderRouting);
    syncRange('route-queries-range', 'route-queries', renderRouting);
    var rq = $('route-queries');
    if (rq) rq.addEventListener('input', renderRouting);
  }

  function renderRouting() {
    var simName = ($('route-simple-model') || {}).value;
    var comName = ($('route-complex-model') || {}).value;
    var splitPct = parseInt(($('route-split-range') || {}).value) || 70;
    var qpd = parseInt(($('route-queries') || {}).value) || 500;
    var days = parseInt(($('tok-days') || {}).value) || 22;
    var inTok = parseInt(($('tok-input-len') || {}).value) || 500;
    var outTok = parseInt(($('tok-output-len') || {}).value) || 500;
    var monthly = qpd * days;

    var simM = MODELS.find(function (m) { return m.model === simName; });
    var comM = MODELS.find(function (m) { return m.model === comName; });
    if (!simM || !comM) return;

    var sp = getModelPrice(simM), cp = getModelPrice(comM);
    function costFor(p, q) { return (inTok / 1e6) * p.input * q + (outTok / 1e6) * p.output * q; }

    var simQ = Math.round(monthly * splitPct / 100);
    var comQ = monthly - simQ;
    var blended = costFor(sp, simQ) + costFor(cp, comQ);
    var allSimple = costFor(sp, monthly);
    var allComplex = costFor(cp, monthly);
    var savings = allComplex - blended;

    setText('route-blended', fmt(blended));
    setText('route-all-simple', fmt(allSimple));
    setText('route-all-complex', fmt(allComplex));
    setText('route-savings', fmt(savings));

    var verdict = $('routing-verdict');
    if (verdict) {
      var savePct = allComplex > 0 ? Math.round((savings / allComplex) * 100) : 0;
      verdict.innerHTML = 'Routing <strong>' + splitPct + '%</strong> to ' + esc(simM.model) + ' and <strong>' + (100 - splitPct) + '%</strong> to ' + esc(comM.model) + ' saves <strong>' + fmt(savings) + '/mo</strong> (' + savePct + '%) vs all-' + esc(comM.model) + '.';
    }
  }

  /* ── CONVERSATION CALCULATOR ── */

  function renderConversation() {
    var turns = parseInt(($('conv-turns') || {}).value) || 5;
    var msgLen = parseInt(($('conv-msg-len') || {}).value) || 200;
    var el = $('conv-results');
    if (!el) return;
    var inTok = msgLen * 1.3; var outTok = msgLen * 1.3 * 1.5;
    var totalIn = inTok * turns; var totalOut = outTok * turns;
    var models = filterModels();
    var costs = models.map(function (m) {
      var p = getModelPrice(m);
      return { provider: m.provider, model: m.model, cost: (totalIn / 1e6) * p.input + (totalOut / 1e6) * p.output, tier: m.tier };
    }).sort(function (a, b) { return a.cost - b.cost; });
    setText('conv-total-tokens', Math.round(totalIn + totalOut).toLocaleString() + ' tokens per conversation');
    var html = '<table class="tokcalc-table"><thead><tr><th>Provider</th><th>Model</th><th class="right">Cost / Conversation</th><th class="right">Cost / 1,000</th></tr></thead><tbody>';
    costs.forEach(function (c, i) {
      var cls = i === 0 ? ' class="cheapest"' : (i === costs.length - 1 && costs.length > 1 ? ' class="expensive"' : '');
      var badge = i === 0 ? ' <span class="tokcalc-badge tokcalc-badge-green">Cheapest</span>' : '';
      html += '<tr' + cls + '><td>' + esc(c.provider) + badge + '</td><td>' + esc(c.model) + '</td><td class="right">' + fmt(c.cost) + '</td><td class="right">' + fmt(c.cost * 1000) + '</td></tr>';
    });
    el.innerHTML = html + '</tbody></table>';
  }

  /* ── USE CASE PRESETS ── */

  function initUseCasePresets() {
    var wrap = $('usecase-presets');
    if (!wrap) return;
    USE_CASES.forEach(function (uc) {
      var btn = document.createElement('button');
      btn.className = 'tokcalc-usecase-btn';
      btn.textContent = uc.name;
      btn.addEventListener('click', function () {
        wrap.querySelectorAll('.tokcalc-usecase-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var qEl = $('tok-queries'), qrEl = $('tok-queries-range'), ilEl = $('tok-input-len'), olEl = $('tok-output-len');
        if (qEl) qEl.value = uc.queries_per_day;
        if (qrEl) qrEl.value = Math.min(uc.queries_per_day, 10000);
        if (ilEl) setSelectClosest(ilEl, uc.avg_input_tokens);
        if (olEl) setSelectClosest(olEl, uc.avg_output_tokens);
        S.mult = uc.multiplier || 1;
        renderAll();
      });
      wrap.appendChild(btn);
    });
  }

  /* ── TIER FILTER ── */

  function initTierFilter() {
    var wrap = $('tier-filters');
    if (!wrap) return;
    wrap.addEventListener('click', function (e) {
      var btn = e.target.closest('.tokcalc-tier-btn');
      if (!btn) return;
      wrap.querySelectorAll('.tokcalc-tier-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      S.tierFilter = btn.getAttribute('data-tier');
      renderAll();
    });
  }

  /* ── CAPABILITY FILTER (Feature 4) ── */

  function initCapFilter() {
    var wrap = $('capability-filters');
    if (!wrap) return;
    wrap.addEventListener('change', function () {
      S.requiredCaps = [];
      wrap.querySelectorAll('input:checked').forEach(function (cb) { S.requiredCaps.push(cb.value); });
      renderAll();
    });
  }

  /* ── SHARE URL (Feature 5) ── */

  function initShare() {
    var btn = $('btn-share-url');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var params = new URLSearchParams();
      var q = $('tok-queries'); if (q && q.value !== '100') params.set('q', q.value);
      var d = $('tok-days'); if (d && d.value !== '22') params.set('d', d.value);
      var il = $('tok-input-len'); if (il && il.value !== '500') params.set('il', il.value);
      var ol = $('tok-output-len'); if (ol && ol.value !== '500') params.set('ol', ol.value);
      if (S.currency !== 'USD') params.set('c', S.currency);
      if (S.tierFilter !== 'all') params.set('t', S.tierFilter);
      if (S.useCached) params.set('cached', '1');
      if (S.useBatch) params.set('batch', '1');
      if (S.budgetCap > 0) params.set('budget', String(S.budgetCap));
      var hash = params.toString();
      var url = window.location.origin + window.location.pathname + (hash ? '#' + hash : '');
      navigator.clipboard.writeText(url).then(function () {
        setText('share-status', 'Copied!');
        setTimeout(function () { setText('share-status', ''); }, 2000);
      }).catch(function () {
        setText('share-status', 'Copy failed — use browser copy');
      });
    });
  }

  function loadFromHash() {
    var hash = window.location.hash.slice(1);
    if (!hash) return;
    try {
      var p = new URLSearchParams(hash);
      if (p.get('q')) { var el = $('tok-queries'); if (el) el.value = p.get('q'); var r = $('tok-queries-range'); if (r) r.value = p.get('q'); }
      if (p.get('d')) { var el2 = $('tok-days'); if (el2) el2.value = p.get('d'); }
      if (p.get('il')) { var el3 = $('tok-input-len'); if (el3) el3.value = p.get('il'); }
      if (p.get('ol')) { var el4 = $('tok-output-len'); if (el4) el4.value = p.get('ol'); }
      if (p.get('c')) { S.currency = p.get('c'); var ce = $('tok-currency'); if (ce) ce.value = S.currency; }
      if (p.get('t')) { S.tierFilter = p.get('t'); $qa('.tokcalc-tier-btn').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-tier') === S.tierFilter); }); }
      if (p.get('cached') === '1') { S.useCached = true; var cb = $('tok-cached'); if (cb) cb.checked = true; }
      if (p.get('batch') === '1') { S.useBatch = true; var bb = $('tok-batch'); if (bb) bb.checked = true; }
      if (p.get('budget')) { S.budgetCap = parseFloat(p.get('budget')); var be = $('tok-budget'); if (be) be.value = S.budgetCap; }
    } catch (e) { /* ignore malformed hash */ }
  }

  /* ── INIT ── */

  function init() {
    try { initTabs(); } catch (e) { console.error('initTabs failed:', e); }

    try {
      loadFromHash();
      syncRange('tok-queries-range', 'tok-queries', renderAll);

      ['tok-queries', 'tok-days', 'tok-input-len', 'tok-output-len'].forEach(function (id) {
        var el = $(id);
        if (el) { el.addEventListener('input', function () { S.mult = 1; renderAll(); }); el.addEventListener('change', function () { S.mult = 1; renderAll(); }); }
      });

      var tokenText = $('token-text');
      if (tokenText) tokenText.addEventListener('input', debounce(renderAll, 300));

      var currencyEl = $('tok-currency');
      if (currencyEl) currencyEl.addEventListener('change', function () { S.currency = currencyEl.value; renderAll(); renderConversation(); renderRouting(); });

      var budgetEl = $('tok-budget');
      if (budgetEl) budgetEl.addEventListener('input', function () { S.budgetCap = parseFloat(budgetEl.value) || 0; renderAll(); });

      var cachedEl = $('tok-cached');
      if (cachedEl) cachedEl.addEventListener('change', function () { S.useCached = cachedEl.checked; if (S.useCached) { S.useBatch = false; var bb = $('tok-batch'); if (bb) bb.checked = false; } renderAll(); renderConversation(); renderRouting(); });

      var batchEl = $('tok-batch');
      if (batchEl) batchEl.addEventListener('change', function () { S.useBatch = batchEl.checked; if (S.useBatch) { S.useCached = false; var cc = $('tok-cached'); if (cc) cc.checked = false; } renderAll(); renderConversation(); renderRouting(); });

      initTierFilter();
      initCapFilter();
      initUseCasePresets();
      initRouting();
      initShare();

      ['conv-turns', 'conv-msg-len'].forEach(function (id) { var el = $(id); if (el) el.addEventListener('input', renderConversation); });
      syncRange('conv-turns-range', 'conv-turns', renderConversation);

      renderAll();
    } catch (e) {
      console.error('Token Calculator init error:', e);
    }
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
