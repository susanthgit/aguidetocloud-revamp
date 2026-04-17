/* policy-tester.js — Password Policy Tester (client-side, zero deps) */
(function () {
  'use strict';

  /* ── Helpers ─────────────────────────────────────────────────── */

  function esc(s) {
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(s == null ? '' : String(s)));
    return d.innerHTML;
  }

  function safeGet(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch (_) { return null; }
  }

  function safeSet(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) { /* private mode */ }
  }

  function $(id) { return document.getElementById(id); }

  /* ── Tab switching ──────────────────────────────────────────── */

  function initTabs(ns) {
    var tabs = document.querySelectorAll('.' + ns + '-tab');
    var panels = document.querySelectorAll('.' + ns + '-panel');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.getAttribute('data-tab');
        tabs.forEach(function (t) {
          t.classList.toggle('active', t === tab);
          t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
        });
        panels.forEach(function (p) {
          var id = p.id.replace('panel-', '');
          var isActive = id === target;
          p.classList.toggle('active', isActive);
          p.style.display = isActive ? 'block' : 'none';
        });
      });
    });
  }

  /* ── Data accessors ─────────────────────────────────────────── */

  function getStandards() {
    return (window.__policyStandards || []);
  }

  function getScoringRules() {
    return (window.__scoringRules || []);
  }

  function findStandard(id) {
    var stds = getStandards();
    for (var i = 0; i < stds.length; i++) {
      if (stds[i].id === id) return stds[i];
    }
    return null;
  }

  /* ── Read form → policy object ──────────────────────────────── */

  function getPolicy() {
    return {
      min_length:          parseInt(($('min-length') || {}).value, 10) || 8,
      complexity_required: !!($('complexity') || {}).checked,
      expiry_days:         parseInt(($('expiry-days') || {}).value, 10) || 0,
      lockout_threshold:   parseInt(($('lockout-threshold') || {}).value, 10) || 0,
      mfa_required:        !!($('mfa-required') || {}).checked,
      history_count:       parseInt(($('history-count') || {}).value, 10) || 0
    };
  }

  /* ── Condition parser ───────────────────────────────────────── */

  function evalSingle(policy, expr) {
    expr = expr.trim();
    var m = expr.match(/^(\w+)\s*(>=|<=|==|!=|>|<)\s*(.+)$/);
    if (!m) return false;
    var field = m[1], op = m[2], rawVal = m[3].trim();

    var left = policy[field];
    if (left === undefined) return false;

    var right;
    if (rawVal === 'true') right = true;
    else if (rawVal === 'false') right = false;
    else right = parseFloat(rawVal);

    if (typeof left === 'boolean') {
      left = left ? 1 : 0;
      right = right === true ? 1 : right === false ? 0 : right;
    }

    switch (op) {
      case '>=': return left >= right;
      case '<=': return left <= right;
      case '==': return left == right; // intentional loose
      case '!=': return left != right;
      case '>':  return left > right;
      case '<':  return left < right;
      default:   return false;
    }
  }

  function evalCondition(policy, condition) {
    var parts = condition.split(/\s+AND\s+/i);
    for (var i = 0; i < parts.length; i++) {
      if (!evalSingle(policy, parts[i])) return false;
    }
    return true;
  }

  /* ── Scoring engine ─────────────────────────────────────────── */

  function scorePolicy(policy) {
    var rules = getScoringRules();
    var categories = [];
    var total = 0;
    var maxTotal = 0;

    rules.forEach(function (rule) {
      var catMax = 0;
      var catScore = 0;
      var checks = rule.checks || [];

      // Determine max possible for this category
      checks.forEach(function (c) { if (c.points > catMax) catMax = c.points; });

      // First matching condition wins
      for (var i = 0; i < checks.length; i++) {
        if (evalCondition(policy, checks[i].condition)) {
          catScore = checks[i].points;
          break;
        }
      }

      categories.push({
        name:  rule.category,
        score: catScore,
        max:   catMax,
        label: catScore + '/' + catMax
      });

      total += catScore;
      maxTotal += catMax;
    });

    // Normalise to 0-100
    var pct = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;

    // Generate recommendations
    var recs = buildRecommendations(policy);

    return { total: pct, categories: categories, recommendations: recs };
  }

  /* ── Recommendation engine ──────────────────────────────────── */

  function buildRecommendations(policy) {
    var recs = [];
    var nist = findStandard('nist');
    var cis  = findStandard('cis');
    var ms   = findStandard('microsoft');
    var e8   = findStandard('e8');

    // MFA — highest priority
    if (!policy.mfa_required) {
      recs.push({
        severity: 'critical',
        text: 'All major standards require MFA — this is your biggest security gap. Enable it immediately.'
      });
    }

    // Minimum length
    if (policy.min_length < 8) {
      recs.push({
        severity: 'critical',
        text: 'Your minimum length (' + policy.min_length + ') is below the absolute minimum of 8 characters required by every standard.'
      });
    } else if (policy.min_length < 14) {
      var who = [];
      if (cis && cis.recommended_length >= 14) who.push('CIS');
      if (ms && ms.recommended_length >= 14) who.push('Microsoft');
      if (who.length) {
        recs.push({
          severity: 'warning',
          text: esc(who.join(' and ')) + ' recommend a minimum of 14+ characters. Your current minimum is ' + policy.min_length + '.'
        });
      }
    }

    // Expiry
    if (policy.expiry_days > 0) {
      if (nist && nist.expiry_days === 0) {
        recs.push({
          severity: 'info',
          text: 'NIST 800-63B recommends removing forced password expiry unless there is evidence of compromise. Your policy expires every ' + policy.expiry_days + ' days.'
        });
      }
      if (policy.expiry_days < 60) {
        recs.push({
          severity: 'warning',
          text: 'Very short expiry periods (' + policy.expiry_days + ' days) lead to weaker passwords as users make small incremental changes.'
        });
      }
    }

    // Complexity
    if (policy.complexity_required && nist && !nist.complexity_required) {
      recs.push({
        severity: 'info',
        text: 'NIST recommends against forced complexity rules (e.g., "must include symbol"). Longer passphrases are more effective.'
      });
    }
    if (!policy.complexity_required && cis && cis.complexity_required) {
      recs.push({
        severity: 'info',
        text: 'CIS still recommends complexity requirements. Consider whether your users use passphrases or traditional passwords.'
      });
    }

    // Lockout
    if (policy.lockout_threshold === 0) {
      recs.push({
        severity: 'warning',
        text: 'No account lockout threshold is set. This leaves accounts vulnerable to brute-force attacks.'
      });
    } else if (policy.lockout_threshold > 10) {
      recs.push({
        severity: 'info',
        text: 'A lockout threshold of ' + policy.lockout_threshold + ' is lenient. Most standards recommend 3\u201310 attempts.'
      });
    }

    // History
    if (policy.history_count === 0) {
      recs.push({
        severity: 'info',
        text: 'No password history is enforced. Users can reuse previous passwords immediately.'
      });
    } else if (policy.history_count < 12 && ms && ms.history_count >= 24) {
      recs.push({
        severity: 'info',
        text: 'Microsoft recommends remembering at least 24 previous passwords. You currently enforce ' + policy.history_count + '.'
      });
    }

    // Positive reinforcement
    if (recs.length === 0) {
      recs.push({
        severity: 'success',
        text: 'Your policy aligns well with modern password standards. Keep it up!'
      });
    }

    return recs;
  }

  /* ── Render: score ring + categories + recommendations ─────── */

  function renderScore(result) {
    var scoreEl   = $('policy-score');
    var catEl     = $('category-breakdown');
    var recEl     = $('recommendations');
    if (!scoreEl || !catEl || !recEl) return;

    var s = result.total;
    var color = s >= 80 ? '#4ade80' : s >= 60 ? '#facc15' : s >= 40 ? '#fb923c' : '#ef4444';
    var label = s >= 80 ? 'Strong' : s >= 60 ? 'Moderate' : s >= 40 ? 'Weak' : 'Critical';

    // SVG score ring
    var r = 80, circ = 2 * Math.PI * r;
    var offset = circ - (circ * s / 100);
    scoreEl.innerHTML =
      '<div class="ptester-score-ring">' +
        '<svg width="200" height="200" viewBox="0 0 200 200">' +
          '<circle cx="100" cy="100" r="' + r + '" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="12"/>' +
          '<circle cx="100" cy="100" r="' + r + '" fill="none" stroke="' + esc(color) + '" stroke-width="12" ' +
            'stroke-linecap="round" stroke-dasharray="' + circ.toFixed(1) + '" ' +
            'stroke-dashoffset="' + offset.toFixed(1) + '" ' +
            'transform="rotate(-90 100 100)" class="ptester-ring-bar"/>' +
          '<text x="100" y="92" text-anchor="middle" fill="#fff" font-size="42" font-weight="700">' + s + '</text>' +
          '<text x="100" y="118" text-anchor="middle" fill="' + esc(color) + '" font-size="16" font-weight="600">' + esc(label) + '</text>' +
        '</svg>' +
      '</div>';

    // Category bars
    var catHtml = '';
    result.categories.forEach(function (c) {
      var pct = c.max > 0 ? Math.round((c.score / c.max) * 100) : 0;
      var barColor = pct >= 80 ? '#4ade80' : pct >= 50 ? '#facc15' : '#ef4444';
      catHtml +=
        '<div class="ptester-bar-row">' +
          '<span class="ptester-bar-label">' + esc(c.name) + '</span>' +
          '<div class="ptester-bar">' +
            '<div class="ptester-bar-fill" style="width:' + pct + '%;background:' + barColor + '"></div>' +
          '</div>' +
          '<span class="ptester-bar-score">' + esc(c.label) + '</span>' +
        '</div>';
    });
    catEl.innerHTML = '<div class="ptester-category-bars">' + catHtml + '</div>';

    // Recommendations
    var recHtml = '';
    result.recommendations.forEach(function (r) {
      var icon = r.severity === 'critical' ? '🔴' : r.severity === 'warning' ? '🟠' : r.severity === 'success' ? '🟢' : '🔵';
      recHtml +=
        '<div class="ptester-rec-card ptester-rec-' + esc(r.severity) + '">' +
          '<span class="ptester-rec-icon">' + icon + '</span>' +
          '<span class="ptester-rec-text">' + esc(r.text) + '</span>' +
        '</div>';
    });
    recEl.innerHTML = recHtml
      ? '<div class="ptester-recommendations">' + recHtml + '</div>'
      : '<p style="opacity:0.5">No recommendations — your policy looks great.</p>';
  }

  /* ── Render: comparison table ───────────────────────────────── */

  function renderCompare(policy) {
    var el = $('compare-standards');
    if (!el) return;

    var stds = getStandards();
    if (!stds.length) { el.innerHTML = '<p style="opacity:0.5">No standard data loaded.</p>'; return; }

    // Table header
    var hdr = '<tr><th class="ptester-tbl-setting">Setting</th><th>Your Policy</th>';
    stds.forEach(function (st) {
      hdr += '<th>' + esc(st.name) + '</th>';
    });
    hdr += '</tr>';

    var rows = [
      { label: 'Min Length',  key: 'min_length',        fmt: fmtNum,  cmp: cmpGte },
      { label: 'Complexity',  key: 'complexity_required',fmt: fmtBool, cmp: cmpBoolMatch },
      { label: 'Expiry (days)', key: 'expiry_days',     fmt: fmtExpiry, cmp: cmpExpiry },
      { label: 'Lockout',     key: 'lockout_threshold', fmt: fmtLockout, cmp: cmpLockout },
      { label: 'MFA Required',key: 'mfa_required',      fmt: fmtBool, cmp: cmpBoolReq },
      { label: 'History',     key: 'history_count',     fmt: fmtNum,  cmp: cmpGte }
    ];

    var cellMap = {green:'ptester-cell-pass', amber:'ptester-cell-partial', red:'ptester-cell-fail'};
    var body = '';
    rows.forEach(function (row) {
      var userVal = policy[row.key];
      body += '<tr><td class="ptester-tbl-setting">' + esc(row.label) + '</td>';
      body += '<td class="ptester-tbl-user">' + row.fmt(userVal) + '</td>';
      stds.forEach(function (st) {
        var stdVal = st[row.key];
        var cls = row.cmp(userVal, stdVal, row.key);
        body += '<td class="' + (cellMap[cls] || '') + '">' + row.fmt(stdVal) + '</td>';
      });
      body += '</tr>';
    });

    el.innerHTML =
      '<div class="ptester-tbl-scroll">' +
        '<table class="ptester-compare-table">' +
          '<thead>' + hdr + '</thead>' +
          '<tbody>' + body + '</tbody>' +
        '</table>' +
      '</div>';
  }

  /* ── Formatting helpers ─────────────────────────────────────── */

  function fmtNum(v) { return esc(String(v != null ? v : '\u2014')); }

  function fmtBool(v) { return v ? '✅ Yes' : '❌ No'; }

  function fmtExpiry(v) {
    if (v === 0 || v === null || v === undefined) return 'No expiry';
    return esc(v + ' days');
  }

  function fmtLockout(v) {
    if (v === 0 || v === null || v === undefined) return 'None';
    return esc(v + ' attempts');
  }

  /* ── Comparison logic (returns 'green', 'amber', 'red') ───── */

  function cmpGte(user, std) {
    if (std == null) return 'green';
    if (user >= std) return 'green';
    if (user >= std * 0.7) return 'amber';
    return 'red';
  }

  function cmpBoolReq(user, std) {
    if (!std) return 'green';       // standard doesn't require it
    return user ? 'green' : 'red';  // standard requires, user has/hasn't
  }

  function cmpBoolMatch(user, std) {
    if (std == null) return 'green';
    if (user === std) return 'green';
    return 'amber'; // complexity mismatch is advisory, not critical
  }

  function cmpExpiry(user, std) {
    // Lower or zero expiry is generally better (NIST)
    if (std === 0 || std === null) {
      // Standard says no expiry
      return user === 0 ? 'green' : 'amber';
    }
    // Standard has expiry
    if (user === 0) return 'green'; // user removed expiry = modern
    if (user <= std) return 'green';
    return 'red';
  }

  function cmpLockout(user, std) {
    if (std == null || std === 0) return 'green';
    if (user === 0) return 'red';             // no lockout vs standard has one
    if (user <= std) return 'green';          // tighter is better
    if (user <= std * 1.5) return 'amber';
    return 'red';
  }

  /* ── Value display sync ─────────────────────────────────────── */

  function syncDisplays() {
    var pairs = [
      ['min-length',        'min-length-value',        null],
      ['expiry-days',       'expiry-days-value',        function (v) { return v === '0' ? 'No expiry' : v + ' days'; }],
      ['lockout-threshold', 'lockout-threshold-value',  function (v) { return v === '0' ? 'None' : v + ' attempts'; }],
      ['history-count',     'history-count-value',      function (v) { return v === '0' ? 'None' : v + ' passwords'; }]
    ];
    pairs.forEach(function (p) {
      var inp = $(p[0]), disp = $(p[1]);
      if (inp && disp) {
        var v = inp.value;
        disp.textContent = p[2] ? p[2](v) : v;
      }
    });
  }

  /* ── URL state ──────────────────────────────────────────────── */

  function encodeURL(policy) {
    var params = new URLSearchParams();
    params.set('ml', policy.min_length);
    params.set('cx', policy.complexity_required ? '1' : '0');
    params.set('ex', policy.expiry_days);
    params.set('lo', policy.lockout_threshold);
    params.set('mf', policy.mfa_required ? '1' : '0');
    params.set('hi', policy.history_count);
    var url = location.pathname + '?' + params.toString();
    history.replaceState(null, '', url);
  }

  function restoreFromURL() {
    var params = new URLSearchParams(location.search);
    if (!params.has('ml')) return false;

    setVal('min-length',        clamp(parseInt(params.get('ml'), 10) || 8, 4, 64));
    setCheck('complexity',      params.get('cx') === '1');
    setVal('expiry-days',       clamp(parseInt(params.get('ex'), 10) || 0, 0, 365));
    setVal('lockout-threshold', clamp(parseInt(params.get('lo'), 10) || 0, 0, 100));
    setCheck('mfa-required',    params.get('mf') === '1');
    setVal('history-count',     clamp(parseInt(params.get('hi'), 10) || 0, 0, 24));
    return true;
  }

  function setVal(id, v) { var el = $(id); if (el) el.value = v; }
  function setCheck(id, v) { var el = $(id); if (el) el.checked = v; }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  /* ── Main update cycle ──────────────────────────────────────── */

  function update() {
    syncDisplays();
    var policy = getPolicy();
    var result = scorePolicy(policy);
    renderScore(result);
    renderCompare(policy);
    encodeURL(policy);
    safeSet('ptester_policy', policy);
  }

  /* ── Wire inputs ────────────────────────────────────────────── */

  function wireInputs() {
    var ids = [
      'min-length',        'complexity',        'expiry-days',
      'lockout-threshold', 'mfa-required',      'history-count'
    ];
    ids.forEach(function (id) {
      var el = $(id);
      if (!el) return;
      var evt = (el.type === 'checkbox') ? 'change' : 'input';
      el.addEventListener(evt, update);
    });
  }

  /* ── Restore defaults or saved state ────────────────────────── */

  function restoreDefaults() {
    var fromURL = restoreFromURL();
    if (fromURL) return;

    var saved = safeGet('ptester_policy');
    if (saved) {
      setVal('min-length',        clamp(saved.min_length || 8, 4, 64));
      setCheck('complexity',      !!saved.complexity_required);
      setVal('expiry-days',       clamp(saved.expiry_days || 90, 0, 365));
      setVal('lockout-threshold', clamp(saved.lockout_threshold || 5, 0, 100));
      setCheck('mfa-required',    !!saved.mfa_required);
      setVal('history-count',     clamp(saved.history_count || 0, 0, 24));
    }
    // Form defaults from HTML cover the remaining case
  }

  /* ── Init ───────────────────────────────────────────────────── */

  function init() {
    initTabs('ptester');
    restoreDefaults();
    wireInputs();
    var btn = $('assess-btn');
    if (btn) btn.addEventListener('click', update);

    // Presets
    var PRESETS = {
      'ad-default': { min_length: 7, complexity: true, expiry: 42, lockout: 0, mfa: false, history: 24 },
      'entra-default': { min_length: 8, complexity: true, expiry: 0, lockout: 10, mfa: false, history: 0 },
      'nist': { min_length: 15, complexity: false, expiry: 0, lockout: 100, mfa: true, history: 0 },
      'modern': { min_length: 14, complexity: false, expiry: 0, lockout: 10, mfa: true, history: 0 }
    };
    document.querySelectorAll('.ptester-preset').forEach(function (b) {
      b.addEventListener('click', function () {
        var p = PRESETS[b.dataset.preset];
        if (!p) return;
        setVal('min-length', p.min_length); setCheck('complexity', p.complexity);
        setVal('expiry-days', p.expiry); setVal('lockout-threshold', p.lockout);
        setCheck('mfa-required', p.mfa); setVal('history-count', p.history);
        syncDisplays(); update();
      });
    });

    update();
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
