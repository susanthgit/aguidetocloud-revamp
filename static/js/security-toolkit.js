/* ── M365 Security Toolkit v1 — Assessment, Email Security, Actions ──
   50-question CIS-aligned security assessment, email DNS record generator,
   prioritised remediation actions with risk quantifier.
   100% client-side, zero API calls.
*/
(function () {
  'use strict';

  var DATA = window.__secToolData || {};
  var ASSESS = DATA.assessment || {};
  var EMAIL = DATA.emailSecurity || {};
  var RISK = DATA.risk || {};

  var CATEGORIES = ASSESS.categories || [];
  var TIERS = ASSESS.tiers || [];
  var PROVIDERS = EMAIL.providers || [];
  var DMARC_TIMELINE = EMAIL.dmarc_timeline || [];
  var RISK_CATS = RISK.risk_categories || [];
  var BENCHMARKS = RISK.benchmarks || {};
  var EFFORT_LEVELS = (RISK.effort_levels || {});
  var IMPACT_LEVELS = (RISK.impact_levels || {});

  // Flatten questions from categories
  var QUESTIONS = [];
  var CAT_RANGES = {};
  CATEGORIES.forEach(function (cat) {
    CAT_RANGES[cat.id] = { start: QUESTIONS.length, count: (cat.questions || []).length, cat: cat };
    (cat.questions || []).forEach(function (q) {
      q._catId = cat.id;
      q._catName = cat.name;
      q._catIcon = cat.icon;
      q._catWeight = cat.weight || 1;
      QUESTIONS.push(q);
    });
  });

  var TOTAL_Q = QUESTIONS.length;
  var STORAGE_KEY = 'sectool_v1';
  var HISTORY_KEY = 'sectool_v1_history';
  var CRITICAL_RISK_THRESHOLD = 9;
  var CRITICAL_CAP = 60;
  var QUICK_THRESHOLD = 7;

  // Build quick-scan question indices (risk_score >= 7)
  var QUICK_INDICES = [];
  QUESTIONS.forEach(function (q, i) {
    if (q.risk_score >= QUICK_THRESHOLD) QUICK_INDICES.push(i);
  });

  // ─── State ───
  var S = {
    currentQ: 0,
    answers: new Array(TOTAL_Q).fill(-1),
    completed: false,
    scanMode: 'quick',
    orgSizeMultiplier: 1.0,
    spfEnforcement: 'soft'
  };

  // Active question set based on scan mode
  function activeIndices() { return S.scanMode === 'quick' ? QUICK_INDICES : QUESTIONS.map(function (_, i) { return i; }); }
  function activePos() {
    var indices = activeIndices();
    var pos = indices.indexOf(S.currentQ);
    return pos >= 0 ? pos : 0;
  }

  var $ = function (id) { return document.getElementById(id); };

  function esc(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // ─── localStorage helpers ───
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: 1,
        updatedAt: new Date().toISOString(),
        answers: S.answers,
        completed: S.completed
      }));
    } catch (e) { /* private browsing */ }
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (!data || data.version !== 1) return;
      if (Array.isArray(data.answers) && data.answers.length === TOTAL_Q) {
        S.answers = data.answers;
        S.completed = !!data.completed;
        var lastAnswered = S.answers.reduce(function (acc, v, i) { return v >= 0 ? i : acc; }, -1);
        if (lastAnswered >= 0 && !S.completed) {
          S.currentQ = Math.min(lastAnswered + 1, TOTAL_Q - 1);
        }
      }
    } catch (e) { /* ignore corrupt data */ }
  }

  function saveHistory(score) {
    try {
      var hist = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      hist.push({ score: score, date: new Date().toISOString() });
      if (hist.length > 20) hist = hist.slice(-20);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
    } catch (e) { /* private browsing */ }
  }

  function getLastScore() {
    try {
      var hist = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      return hist.length > 1 ? hist[hist.length - 2].score : null;
    } catch (e) { return null; }
  }

  // ══════════════════════════════════════════════════════════════
  // ASSESSMENT ENGINE
  // ══════════════════════════════════════════════════════════════

  function initAssessment() {
    var params = new URLSearchParams(window.location.search);
    if (params.has('score')) {
      loadSharedResults(params);
      return;
    }
    loadState();
    buildCatNav();
    if (S.completed) {
      showResults();
    } else {
      renderQuestion();
    }
    bindAssessmentEvents();
  }

  function buildCatNav() {
    var nav = $('sectool-cat-nav');
    if (!nav) return;
    var html = '';
    CATEGORIES.forEach(function (cat) {
      var range = CAT_RANGES[cat.id];
      html += '<button class="sectool-cat-nav-btn" data-cat="' + cat.id + '">'
        + cat.icon + ' ' + esc(cat.name)
        + '<span class="sectool-cat-nav-score" data-cat-score="' + cat.id + '"></span>'
        + '</button>';
    });
    nav.innerHTML = html;
    updateCatNav();
  }

  function updateCatNav() {
    CATEGORIES.forEach(function (cat) {
      var range = CAT_RANGES[cat.id];
      var btn = document.querySelector('.sectool-cat-nav-btn[data-cat="' + cat.id + '"]');
      if (!btn) return;
      var answered = 0;
      for (var i = range.start; i < range.start + range.count; i++) {
        if (S.answers[i] >= 0) answered++;
      }
      btn.classList.toggle('active', S.currentQ >= range.start && S.currentQ < range.start + range.count);
      var scoreEl = btn.querySelector('.sectool-cat-nav-score');
      if (scoreEl) scoreEl.textContent = answered + '/' + range.count;
    });
  }

  function renderQuestion() {
    var indices = activeIndices();
    var pos = activePos();
    var totalActive = indices.length;
    // Check if we've gone past the end
    if (pos >= totalActive) { showResults(); return; }
    var qi = indices[pos];
    var q = QUESTIONS[qi];
    S.currentQ = qi;
    var qText = $('sectool-question-text');
    var qOpts = $('sectool-options');
    var qRefs = $('sectool-compliance-refs');
    var qCtx = $('sectool-question-context');
    var catIcon = $('sectool-current-cat-icon');
    var catName = $('sectool-current-cat-name');
    var progFill = $('sectool-progress-fill');
    var progText = $('sectool-progress-text');

    if (qText) qText.textContent = q.text;
    if (catIcon) catIcon.textContent = q._catIcon;
    if (catName) catName.textContent = q._catName;
    if (progFill) progFill.style.width = ((pos + 1) / totalActive * 100) + '%';
    if (progText) progText.textContent = 'Question ' + (pos + 1) + ' of ' + totalActive;

    // Context: why this matters + where to check
    if (qCtx) {
      var ctx = '';
      if (q.why_it_matters) {
        ctx = q.why_it_matters;
      } else {
        // Auto-generate from existing data
        var riskLabel = q.risk_score >= 9 ? 'Critical control' : q.risk_score >= 7 ? 'High-impact control' : q.risk_score >= 4 ? 'Recommended control' : 'Good practice';
        ctx = riskLabel + '.';
        // Find related risk category for mitigation summary
        RISK_CATS.forEach(function (rc) {
          if (rc.related_questions && rc.related_questions.indexOf(q.id) >= 0 && rc.mitigation_summary) {
            ctx += ' ' + rc.mitigation_summary + '.';
          }
        });
        if (q.remediation_path) ctx += ' Check: ' + q.remediation_path + '.';
      }
      qCtx.textContent = ctx;
      qCtx.hidden = !ctx;
    }

    // Compliance references
    if (qRefs) {
      var refs = '';
      if (q.cis_ref) refs += '<span class="sectool-ref-badge">CIS ' + esc(q.cis_ref) + '</span>';
      if (q.nist_ref) refs += '<span class="sectool-ref-badge">NIST ' + esc(q.nist_ref) + '</span>';
      if (q.iso_ref) refs += '<span class="sectool-ref-badge">ISO ' + esc(q.iso_ref) + '</span>';
      if (q.e8_ref) refs += '<span class="sectool-ref-badge">E8: ' + esc(q.e8_ref) + '</span>';
      qRefs.innerHTML = refs;
    }

    // Options — add "Not sure / Need to check" if missing
    var opts = (q.options || []).slice();
    var hasUnsure = opts.some(function (o) {
      var lbl = (o.label || '').toLowerCase();
      return lbl.indexOf("don't know") >= 0 || lbl.indexOf('not sure') >= 0 || lbl.indexOf('n/a') >= 0;
    });
    if (!hasUnsure) {
      opts.push({ label: "Not sure / Need to check", value: 0 });
    }

    if (qOpts) {
      var optHtml = '';
      opts.forEach(function (opt, oi) {
        var sel = S.answers[S.currentQ] === oi ? ' selected' : '';
        optHtml += '<div class="sectool-option' + sel + '" data-idx="' + oi + '" role="button" tabindex="0">'
          + esc(opt.label) + '</div>';
      });
      qOpts.innerHTML = optHtml;
    }

    // Buttons
    var prevBtn = $('sectool-prev-btn');
    var nextBtn = $('sectool-next-btn');
    if (prevBtn) prevBtn.disabled = pos === 0;
    if (nextBtn) {
      nextBtn.disabled = S.answers[qi] < 0;
      nextBtn.textContent = pos === totalActive - 1 ? 'View Results' : 'Next';
    }

    updateCatNav();
  }

  function selectOption(idx) {
    S.answers[S.currentQ] = idx;
    saveState();
    renderQuestion();
    // Enable Next button immediately — user clicks when ready (no auto-advance)
  }

  function bindAssessmentEvents() {
    // Option clicks (event delegation)
    var optsContainer = $('sectool-options');
    if (optsContainer) {
      optsContainer.addEventListener('click', function (e) {
        var opt = e.target.closest('.sectool-option');
        if (opt) selectOption(parseInt(opt.dataset.idx, 10));
      });
      optsContainer.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          var opt = e.target.closest('.sectool-option');
          if (opt) { e.preventDefault(); selectOption(parseInt(opt.dataset.idx, 10)); }
        }
      });
    }

    // Nav buttons
    var prevBtn = $('sectool-prev-btn');
    var nextBtn = $('sectool-next-btn');
    if (prevBtn) prevBtn.addEventListener('click', function () {
      if (S.currentQ > 0) { S.currentQ--; renderQuestion(); }
    });
    if (nextBtn) nextBtn.addEventListener('click', function () {
      if (S.currentQ < TOTAL_Q - 1) { S.currentQ++; renderQuestion(); }
      else showResults();
    });

    // Category nav jumps
    var catNav = $('sectool-cat-nav');
    if (catNav) catNav.addEventListener('click', function (e) {
      var btn = e.target.closest('.sectool-cat-nav-btn');
      if (btn) {
        var catId = btn.dataset.cat;
        var range = CAT_RANGES[catId];
        if (range) { S.currentQ = range.start; renderQuestion(); }
      }
    });

    // Restart button
    var restartBtn = $('sectool-restart-btn');
    if (restartBtn) restartBtn.addEventListener('click', function () {
      S.answers = new Array(TOTAL_Q).fill(-1);
      S.currentQ = 0;
      S.completed = false;
      saveState();
      $('sectool-assessment').hidden = false;
      $('sectool-results').hidden = true;
      renderQuestion();
    });

    // Share button
    var shareBtn = $('sectool-share-btn');
    if (shareBtn) shareBtn.addEventListener('click', shareResults);

    // Actions button
    var actionsBtn = $('sectool-actions-btn');
    if (actionsBtn) actionsBtn.addEventListener('click', function () {
      var tab = document.querySelector('.sectool-tab[data-tab="actions"]');
      if (tab) tab.click();
    });

    // "Start Assessment" from actions gate
    document.querySelectorAll('.sectool-goto-assessment').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tab = document.querySelector('.sectool-tab[data-tab="assessment"]');
        if (tab) tab.click();
      });
    });
  }

  // ─── Scoring ───
  function computeScores() {
    var catScores = {};
    var hasCriticalGap = false;

    CATEGORIES.forEach(function (cat) {
      var range = CAT_RANGES[cat.id];
      var earned = 0, max = 0;
      for (var i = range.start; i < range.start + range.count; i++) {
        var q = QUESTIONS[i];
        var opts = q.options || [];
        var maxVal = 0;
        opts.forEach(function (o) { if (o.value > maxVal) maxVal = o.value; });
        max += maxVal;
        if (S.answers[i] >= 0 && S.answers[i] < opts.length) {
          earned += opts[S.answers[i]].value;
        }
        // Check for critical gap
        if (q.risk_score >= CRITICAL_RISK_THRESHOLD && S.answers[i] >= 0) {
          var chosenVal = opts[S.answers[i]] ? opts[S.answers[i]].value : 0;
          if (chosenVal === 0) hasCriticalGap = true;
        }
      }
      catScores[cat.id] = {
        earned: earned, max: max,
        pct: max > 0 ? Math.round((earned / max) * 100) : 0,
        weight: cat.weight || 1,
        name: cat.name, icon: cat.icon
      };
    });

    // Weighted average
    var totalWeightedPct = 0, totalWeight = 0;
    Object.keys(catScores).forEach(function (k) {
      totalWeightedPct += catScores[k].pct * catScores[k].weight;
      totalWeight += catScores[k].weight;
    });
    var overall = totalWeight > 0 ? Math.round(totalWeightedPct / totalWeight) : 0;

    // Critical-control cap (from rubber-duck critique)
    if (hasCriticalGap && overall > CRITICAL_CAP) {
      overall = CRITICAL_CAP;
    }

    return { overall: overall, categories: catScores, hasCriticalGap: hasCriticalGap };
  }

  function getTier(score) {
    for (var i = 0; i < TIERS.length; i++) {
      if (score >= TIERS[i].min && score <= TIERS[i].max) return TIERS[i];
    }
    return TIERS[0];
  }

  // ─── Results Display ───
  function showResults() {
    S.completed = true;
    saveState();
    var scores = computeScores();
    var tier = getTier(scores.overall);

    $('sectool-assessment').hidden = true;
    $('sectool-results').hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Score ring animation
    var ringFg = $('sectool-ring-fg');
    var scoreNum = $('sectool-score-number');
    var scoreLabel = $('sectool-score-label');
    var scoreDesc = $('sectool-score-desc');

    if (ringFg) {
      var circumference = 2 * Math.PI * 52;
      var offset = circumference - (scores.overall / 100) * circumference;
      ringFg.style.stroke = tier.color;
      setTimeout(function () { ringFg.style.strokeDashoffset = offset; }, 100);
    }

    // Animated counter
    if (scoreNum) animateCounter(scoreNum, scores.overall, 1200);
    if (scoreLabel) {
      scoreLabel.textContent = tier.emoji + ' ' + tier.label;
      scoreLabel.style.color = tier.color;
    }
    if (scoreDesc) scoreDesc.textContent = tier.desc;

    // Delta tracking
    var prev = getLastScore();
    var deltaEl = $('sectool-delta');
    if (deltaEl && prev !== null) {
      var diff = scores.overall - prev;
      if (diff > 0) {
        deltaEl.innerHTML = '<span class="up">↑ ' + diff + ' points</span> since your last assessment';
      } else if (diff < 0) {
        deltaEl.innerHTML = '<span class="down">↓ ' + Math.abs(diff) + ' points</span> since your last assessment';
      } else {
        deltaEl.textContent = 'Same score as your last assessment';
      }
    }
    saveHistory(scores.overall);

    // Category bars
    var barsEl = $('sectool-cat-bars');
    if (barsEl) {
      var barsHtml = '';
      CATEGORIES.forEach(function (cat) {
        var cs = scores.categories[cat.id];
        var color = cs.pct >= 80 ? '#22C55E' : cs.pct >= 60 ? '#EAB308' : cs.pct >= 40 ? '#F97316' : '#EF4444';
        barsHtml += '<div class="sectool-cat-bar-row">'
          + '<span class="sectool-cat-bar-label">' + cat.icon + ' ' + esc(cat.name) + '</span>'
          + '<div class="sectool-cat-bar-track"><div class="sectool-cat-bar-fill" style="width:' + cs.pct + '%;background:' + color + '"></div></div>'
          + '<span class="sectool-cat-bar-pct">' + cs.pct + '%</span>'
          + '</div>';
      });
      barsHtml = barsHtml; // already safe, all esc'd
      barsEl.innerHTML = barsHtml;
    }

    // Priority banner — lowest category
    var bannerEl = $('sectool-priority-banner');
    if (bannerEl) {
      var lowest = null;
      CATEGORIES.forEach(function (cat) {
        var cs = scores.categories[cat.id];
        if (!lowest || cs.pct < lowest.pct) lowest = { name: cat.name, pct: cs.pct, icon: cat.icon };
      });
      if (lowest && lowest.pct < 70) {
        bannerEl.innerHTML = '<strong>Your #1 priority:</strong> ' + lowest.icon + ' ' + esc(lowest.name)
          + ' (' + lowest.pct + '%). Focus remediation efforts here first for maximum security improvement.';
        bannerEl.hidden = false;
      } else {
        bannerEl.hidden = true;
      }
    }

    // Risk summary
    renderRiskSummary(scores);

    // Critical cap warning
    if (scores.hasCriticalGap && bannerEl) {
      bannerEl.innerHTML += '<br><br><strong>Score capped at ' + CRITICAL_CAP + ':</strong> '
        + 'One or more critical controls (MFA, audit logging, legacy auth blocking) scored zero. '
        + 'Fix these first — they represent the highest-impact security gaps.';
    }

    // Populate actions tab
    renderActions(scores);
  }

  function animateCounter(el, target, duration) {
    var start = 0, startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function shareResults() {
    var scores = computeScores();
    var catPcts = CATEGORIES.map(function (c) { return scores.categories[c.id].pct; }).join(',');
    var url = location.origin + location.pathname + '?score=' + scores.overall + '&cats=' + catPcts;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () {
        var btn = $('sectool-share-btn');
        if (btn) { btn.textContent = 'Copied!'; setTimeout(function () { btn.textContent = 'Copy Shareable Link'; }, 2000); }
      });
    }
  }

  function loadSharedResults(params) {
    var score = parseInt(params.get('score'), 10);
    if (isNaN(score) || score < 0 || score > 100) return;
    var catStr = params.get('cats') || '';
    var catPcts = catStr.split(',').map(function (s) { return parseInt(s, 10); });

    // Validate
    if (catPcts.length !== CATEGORIES.length) return;
    for (var i = 0; i < catPcts.length; i++) {
      if (isNaN(catPcts[i]) || catPcts[i] < 0 || catPcts[i] > 100) return;
    }

    var tier = getTier(score);
    $('sectool-assessment').hidden = true;
    $('sectool-results').hidden = false;

    var ringFg = $('sectool-ring-fg');
    if (ringFg) {
      var circumference = 2 * Math.PI * 52;
      ringFg.style.stroke = tier.color;
      setTimeout(function () { ringFg.style.strokeDashoffset = circumference - (score / 100) * circumference; }, 100);
    }

    var scoreNum = $('sectool-score-number');
    if (scoreNum) animateCounter(scoreNum, score, 1200);
    var scoreLabel = $('sectool-score-label');
    if (scoreLabel) { scoreLabel.textContent = tier.emoji + ' ' + tier.label; scoreLabel.style.color = tier.color; }
    var scoreDesc = $('sectool-score-desc');
    if (scoreDesc) scoreDesc.textContent = tier.desc + ' (Shared result — complete the assessment yourself for personalised actions.)';

    // Category bars
    var barsEl = $('sectool-cat-bars');
    if (barsEl) {
      var barsHtml = '';
      CATEGORIES.forEach(function (cat, ci) {
        var pct = catPcts[ci] || 0;
        var color = pct >= 80 ? '#22C55E' : pct >= 60 ? '#EAB308' : pct >= 40 ? '#F97316' : '#EF4444';
        barsHtml += '<div class="sectool-cat-bar-row">'
          + '<span class="sectool-cat-bar-label">' + cat.icon + ' ' + esc(cat.name) + '</span>'
          + '<div class="sectool-cat-bar-track"><div class="sectool-cat-bar-fill" style="width:' + pct + '%;background:' + color + '"></div></div>'
          + '<span class="sectool-cat-bar-pct">' + pct + '%</span></div>';
      });
      barsEl.innerHTML = barsHtml;
    }

    // Clean URL
    history.replaceState(null, '', location.pathname);
  }

  // ══════════════════════════════════════════════════════════════
  // EMAIL SECURITY GENERATOR
  // ══════════════════════════════════════════════════════════════

  function initEmailSecurity() {
    renderExtraProviders();
    bindEmailEvents();
    // Show example on load
    var domainInput = $('sectool-domain');
    if (domainInput) domainInput.value = 'example.com';
    var tenantInput = $('sectool-tenant');
    if (tenantInput) tenantInput.value = 'example';
    generateEmailRecords();
  }

  function renderExtraProviders() {
    var container = $('sectool-extra-providers');
    if (!container) return;
    var sendingProviders = PROVIDERS.filter(function (p) { return p.type === 'sending'; });
    var html = '';
    sendingProviders.forEach(function (p) {
      html += '<label class="sectool-checkbox-item" data-provider="' + p.id + '">'
        + '<input type="checkbox" value="' + p.id + '">'
        + esc(p.name) + '</label>';
    });
    container.innerHTML = html;

    container.addEventListener('click', function (e) {
      var item = e.target.closest('.sectool-checkbox-item');
      if (item) {
        var cb = item.querySelector('input');
        if (cb && e.target !== cb) cb.checked = !cb.checked;
        item.classList.toggle('checked', cb.checked);
      }
    });
  }

  var _emailDebounce = null;
  function bindEmailEvents() {
    var genBtn = $('sectool-generate-btn');
    if (genBtn) genBtn.addEventListener('click', generateEmailRecords);

    // Auto-generate on domain/tenant input with debounce
    ['sectool-domain', 'sectool-tenant'].forEach(function (id) {
      var el = $(id);
      if (el) el.addEventListener('input', function () {
        clearTimeout(_emailDebounce);
        _emailDebounce = setTimeout(generateEmailRecords, 400);
      });
    });

    // Show/hide tenant field based on provider
    var providerSel = $('sectool-provider');
    if (providerSel) {
      providerSel.addEventListener('change', function () {
        var tenantGroup = $('sectool-tenant-group');
        if (tenantGroup) {
          var needsTenant = providerSel.value === 'microsoft365' || providerSel.value === 'both';
          tenantGroup.style.display = needsTenant ? 'block' : 'none';
        }
        generateEmailRecords();
      });
    }
  }

  function generateEmailRecords() {
    var domain = ($('sectool-domain') || {}).value || '';
    domain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    var domainInput = $('sectool-domain');
    var validationMsg = $('sectool-domain-validation');

    // Validate domain
    var domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;
    if (!domain || !domainRegex.test(domain)) {
      var results = $('sectool-email-results');
      if (results) results.hidden = true;
      if (domainInput && domain.length > 0) domainInput.classList.add('sectool-input-error');
      if (validationMsg && domain.length > 0) {
        validationMsg.textContent = 'Enter a valid domain like contoso.com';
        validationMsg.hidden = false;
      }
      return;
    }
    if (domainInput) domainInput.classList.remove('sectool-input-error');
    if (validationMsg) validationMsg.hidden = true;

    var provider = ($('sectool-provider') || {}).value || 'microsoft365';
    var domainDash = domain.replace(/\./g, '-');
    var tenant = ($('sectool-tenant') || {}).value || '';
    tenant = tenant.trim().toLowerCase().replace(/\.onmicrosoft\.com$/, '');
    if (!tenant) tenant = domain.split('.')[0];

    // Gather selected extra providers
    var extras = [];
    document.querySelectorAll('#sectool-extra-providers input:checked').forEach(function (cb) {
      extras.push(cb.value);
    });

    var customInclude = ($('sectool-custom-include') || {}).value || '';

    // ── SPF ──
    var spfIncludes = [];
    var addInclude = function (inc) {
      if (inc && spfIncludes.indexOf(inc) === -1) spfIncludes.push(inc);
    };

    if (provider === 'microsoft365' || provider === 'both') {
      var m365 = PROVIDERS.find(function (p) { return p.id === 'microsoft365'; });
      if (m365) addInclude(m365.spf_include);
    }
    if (provider === 'google' || provider === 'both') {
      var google = PROVIDERS.find(function (p) { return p.id === 'google'; });
      if (google) addInclude(google.spf_include);
    }

    extras.forEach(function (eid) {
      var ep = PROVIDERS.find(function (p) { return p.id === eid; });
      if (ep && ep.spf_include) addInclude(ep.spf_include);
    });

    if (customInclude.trim()) {
      customInclude.split(/[,;\s]+/).forEach(function (ci) {
        ci = ci.trim();
        if (ci) addInclude(ci.indexOf(':') > -1 ? ci : 'include:' + ci);
      });
    }

    var spfRecord = 'v=spf1 ' + spfIncludes.join(' ') + ' ~all';
    var lookupCount = spfIncludes.filter(function (i) { return i.startsWith('include:'); }).length;

    // SPF lookup warning
    var warnEl = $('sectool-spf-lookup-warning');
    if (warnEl) {
      if (lookupCount >= 8) {
        warnEl.innerHTML = '<strong>Warning:</strong> SPF allows a maximum of 10 DNS lookups. '
          + 'You have ' + lookupCount + ' includes. Adding more may cause SPF validation failures. '
          + 'Consider SPF flattening tools to reduce lookup count.';
        warnEl.hidden = false;
      } else {
        warnEl.hidden = true;
      }
    }

    var spfValueEl = $('sectool-spf-value');
    if (spfValueEl) spfValueEl.textContent = spfRecord;

    var spfExplainEl = $('sectool-spf-explain');
    if (spfExplainEl) {
      spfExplainEl.textContent = 'This record allows '
        + spfIncludes.map(function (i) { return i.replace('include:', ''); }).join(', ')
        + ' to send email on behalf of ' + domain
        + '. The ~all means soft-fail for unlisted servers (recommended while building your SPF). '
        + 'Change to -all (hard fail) once you have confirmed all legitimate senders are listed. '
        + 'DNS lookups: ' + lookupCount + ' of 10 maximum.';
    }

    // ── DKIM ──
    var dkimEl = $('sectool-dkim-records');
    if (dkimEl) {
      var dkimHtml = '';
      if (provider === 'microsoft365' || provider === 'both') {
        dkimHtml += '<div class="sectool-dkim-record">'
          + '<small>Selector 1 (CNAME)</small>'
          + '<code>selector1._domainkey.' + esc(domain) + '</code>'
          + '<code>→ selector1-' + esc(domainDash) + '._domainkey.' + esc(tenant) + '.onmicrosoft.com</code>'
          + '</div>'
          + '<div class="sectool-dkim-record">'
          + '<small>Selector 2 (CNAME)</small>'
          + '<code>selector2._domainkey.' + esc(domain) + '</code>'
          + '<code>→ selector2-' + esc(domainDash) + '._domainkey.' + esc(tenant) + '.onmicrosoft.com</code>'
          + '</div>'
          + '<div class="sectool-record-explain">Add these 2 CNAME records in your DNS provider, '
          + 'then enable DKIM in Microsoft Defender → Email authentication → DKIM → Select your domain → Enable. '
          + 'Your tenant name (' + esc(tenant) + '.onmicrosoft.com) is used in the CNAME target. '
          + 'Find yours at: Microsoft 365 admin centre → Settings → Domains.</div>';
      }
      if (provider === 'google' || provider === 'both') {
        dkimHtml += '<div class="sectool-dkim-record">'
          + '<small>Google Workspace DKIM (TXT)</small>'
          + '<code>google._domainkey.' + esc(domain) + '</code>'
          + '<code>→ Generated in Google Admin Console</code>'
          + '</div>'
          + '<div class="sectool-record-explain">Go to Google Admin → Apps → Gmail → Authenticate email → '
          + 'Generate new record → Add the TXT record to your DNS.</div>';
      }
      if (provider === 'other') {
        dkimHtml += '<div class="sectool-record-explain">DKIM configuration is provider-specific. '
          + 'Check your email provider\'s documentation for DKIM selector and record setup instructions.</div>';
      }
      dkimEl.innerHTML = dkimHtml;
    }

    // ── DMARC ──
    var dmarcEmail = 'dmarc@' + domain;
    var dmarcRecord = 'v=DMARC1; p=none; rua=mailto:' + dmarcEmail + '; ruf=mailto:' + dmarcEmail + '; pct=100';
    var dmarcValueEl = $('sectool-dmarc-value');
    if (dmarcValueEl) dmarcValueEl.textContent = dmarcRecord;

    var dmarcExplainEl = $('sectool-dmarc-explain');
    if (dmarcExplainEl) {
      dmarcExplainEl.textContent = 'Start with p=none (monitor mode) to collect reports without affecting email delivery. '
        + 'Aggregate reports (rua) will be sent to ' + dmarcEmail + '. Review these reports to identify all legitimate '
        + 'senders before progressing to quarantine and then reject.';
    }

    // DMARC progression timeline
    var timelineEl = $('sectool-dmarc-timeline');
    if (timelineEl && DMARC_TIMELINE.length) {
      var tlHtml = '<h4 style="font-size:0.88rem;color:#fff;margin:0 0 0.75rem">DMARC Progression Timeline</h4>';
      DMARC_TIMELINE.forEach(function (step) {
        tlHtml += '<div class="sectool-dmarc-step">'
          + '<span class="sectool-dmarc-week">Week ' + step.week_start + '-' + step.week_end + '</span>'
          + '<span class="sectool-dmarc-policy-badge ' + step.policy + '">p=' + step.policy + '</span>'
          + '<span class="sectool-dmarc-action">' + esc(step.action) + '</span>'
          + '</div>';
      });
      timelineEl.innerHTML = tlHtml;
    }

    // Show results
    var resultsEl = $('sectool-email-results');
    if (resultsEl) resultsEl.hidden = false;
  }

  // ══════════════════════════════════════════════════════════════
  // ACTIONS & SCRIPTS
  // ══════════════════════════════════════════════════════════════

  function renderActions(scores) {
    var gateEl = $('sectool-actions-gate');
    var contentEl = $('sectool-actions-content');
    if (!gateEl || !contentEl) return;

    // Check if assessment is complete
    var allAnswered = S.answers.every(function (a) { return a >= 0; });
    if (!allAnswered && !S.completed) {
      gateEl.hidden = false;
      contentEl.hidden = true;
      return;
    }

    gateEl.hidden = true;
    contentEl.hidden = false;

    // Collect findings (questions where score < max)
    var findings = [];
    QUESTIONS.forEach(function (q, qi) {
      var opts = q.options || [];
      var maxVal = 0;
      opts.forEach(function (o) { if (o.value > maxVal) maxVal = o.value; });
      var chosen = S.answers[qi] >= 0 && S.answers[qi] < opts.length ? opts[S.answers[qi]].value : 0;
      if (chosen < maxVal) {
        var gap = maxVal - chosen;
        var riskScore = q.risk_score || 1;
        var effortKey = q.remediation_effort || 'halfday';
        var effortScore = effortKey === 'quick' ? 1 : effortKey === 'halfday' ? 3 : 7;

        // Severity band (two-step sort per rubber-duck critique)
        var severity = riskScore >= 9 ? 'critical' : riskScore >= 7 ? 'high' : riskScore >= 4 ? 'medium' : 'low';
        var severityOrder = severity === 'critical' ? 0 : severity === 'high' ? 1 : severity === 'medium' ? 2 : 3;
        var quickWinRatio = riskScore / effortScore;

        findings.push({
          q: q,
          gap: gap,
          chosen: chosen,
          maxVal: maxVal,
          riskScore: riskScore,
          effortKey: effortKey,
          effortScore: effortScore,
          severity: severity,
          severityOrder: severityOrder,
          quickWinRatio: quickWinRatio
        });
      }
    });

    // Sort: severity band first, then quick-win ratio within band
    findings.sort(function (a, b) {
      if (a.severityOrder !== b.severityOrder) return a.severityOrder - b.severityOrder;
      return b.quickWinRatio - a.quickWinRatio;
    });

    // Render action cards
    var listEl = $('sectool-actions-list');
    if (listEl) {
      if (findings.length === 0) {
        listEl.innerHTML = '<div style="text-align:center;padding:2rem;color:rgba(255,255,255,0.5)">'
          + '<span style="font-size:2rem;display:block;margin-bottom:0.5rem">🌟</span>'
          + 'Excellent! No remediation actions needed. Keep up the great security posture.</div>';
      } else {
        var cardsHtml = '';
        findings.forEach(function (f, fi) {
          var q = f.q;
          var effortLabel = f.effortKey === 'quick' ? '⚡ Quick Win' : f.effortKey === 'halfday' ? '🔧 Half-Day' : '📋 Project';
          var impactClass = f.severity;

          cardsHtml += '<div class="sectool-action-card ' + f.severity + '">'
            + '<div class="sectool-action-header">'
            + '<span class="sectool-action-title">' + (fi + 1) + '. ' + esc(q.remediation_title || q.text) + '</span>'
            + '<div class="sectool-action-badges">'
            + '<span class="sectool-badge sectool-badge-impact ' + impactClass + '">' + esc(f.severity) + '</span>'
            + '<span class="sectool-badge sectool-badge-effort">' + effortLabel + '</span>'
            + '</div></div>';

          if (q.risk_score >= 7) {
            cardsHtml += '<div class="sectool-action-why">Risk score: ' + q.risk_score + '/10. ';
            // Find related risk category description
            RISK_CATS.forEach(function (rc) {
              if (rc.related_questions && rc.related_questions.indexOf(q.id) >= 0) {
                cardsHtml += esc(rc.mitigation_summary);
              }
            });
            cardsHtml += '</div>';
          }

          if (q.remediation_path) {
            cardsHtml += '<div class="sectool-action-path">Admin path: <code>' + esc(q.remediation_path) + '</code></div>';
          }

          // Compliance references
          var refs = '';
          if (q.cis_ref) refs += '<span class="sectool-ref-badge">CIS ' + esc(q.cis_ref) + '</span>';
          if (q.nist_ref) refs += '<span class="sectool-ref-badge">NIST ' + esc(q.nist_ref) + '</span>';
          if (q.iso_ref) refs += '<span class="sectool-ref-badge">ISO ' + esc(q.iso_ref) + '</span>';
          if (q.e8_ref) refs += '<span class="sectool-ref-badge">E8: ' + esc(q.e8_ref) + '</span>';
          if (refs) cardsHtml += '<div class="sectool-action-compliance">' + refs + '</div>';

          // Script toggle
          if (q.remediation_script) {
            var scriptId = 'script-' + fi;
            cardsHtml += '<button class="sectool-script-toggle" data-script="' + scriptId + '">Show PowerShell Script ▾</button>'
              + '<div class="sectool-script-block" id="' + scriptId + '">'
              + '<pre></pre>'
              + '<button class="sectool-copy-btn" data-script-copy="' + scriptId + '" style="position:static;margin-top:0.5rem">Copy Script</button>'
              + '</div>';
          }

          cardsHtml += '</div>';
        });
        listEl.innerHTML = cardsHtml;

        // Populate script blocks with textContent (XSS safe)
        findings.forEach(function (f, fi) {
          var scriptId = 'script-' + fi;
          var block = $(scriptId);
          if (block && f.q.remediation_script) {
            var pre = block.querySelector('pre');
            if (pre) pre.textContent = f.q.remediation_script;
          }
        });

        // Script toggle events
        listEl.addEventListener('click', function (e) {
          var toggle = e.target.closest('.sectool-script-toggle');
          if (toggle) {
            var block = $(toggle.dataset.script);
            if (block) {
              block.classList.toggle('open');
              toggle.textContent = block.classList.contains('open') ? 'Hide PowerShell Script ▴' : 'Show PowerShell Script ▾';
            }
          }
          var copyBtn = e.target.closest('[data-script-copy]');
          if (copyBtn) {
            var block2 = $(copyBtn.dataset.scriptCopy);
            if (block2) {
              var pre = block2.querySelector('pre');
              if (pre && navigator.clipboard) {
                navigator.clipboard.writeText(pre.textContent).then(function () {
                  copyBtn.textContent = 'Copied!';
                  setTimeout(function () { copyBtn.textContent = 'Copy Script'; }, 2000);
                });
              }
            }
          }
        });
      }
    }

    // Risk quantifier
    renderRiskQuantifier(findings);
  }

  function renderRiskSummary(scores) {
    var el = $('sectool-risk-summary');
    if (!el) return;

    var totalALE = 0;
    RISK_CATS.forEach(function (rc) {
      // Determine risk level based on related question scores
      var relatedGap = false;
      (rc.related_questions || []).forEach(function (qId) {
        for (var i = 0; i < QUESTIONS.length; i++) {
          if (QUESTIONS[i].id === qId && S.answers[i] >= 0) {
            var opts = QUESTIONS[i].options || [];
            var chosen = opts[S.answers[i]] ? opts[S.answers[i]].value : 0;
            var maxVal = 0;
            opts.forEach(function (o) { if (o.value > maxVal) maxVal = o.value; });
            if (chosen < maxVal) relatedGap = true;
          }
        }
      });
      if (relatedGap) {
        var aro = rc.aro_medium || 0.05;
        totalALE += (rc.sle || 0) * aro;
      }
    });

    if (totalALE > 0) {
      var low = Math.round(totalALE * 0.6);
      var high = Math.round(totalALE * 1.5);
      el.innerHTML = '<h3>Estimated Risk Exposure</h3>'
        + '<p>Based on your assessment gaps and industry benchmarks:</p>'
        + '<p class="sectool-risk-amount">$' + formatNum(low) + ' – $' + formatNum(high) + ' annual exposure</p>'
        + '<p style="font-size:0.78rem;color:rgba(255,255,255,0.4);margin-top:0.5rem;font-style:italic">'
        + 'Illustrative estimate based on IBM Cost of Data Breach and Verizon DBIR benchmarks. '
        + 'Use for prioritisation and business cases, not as actuarial data.</p>';
      el.hidden = false;
    } else {
      el.hidden = true;
    }
  }

  function renderRiskQuantifier(findings) {
    var el = $('sectool-risk-quantifier');
    if (!el || findings.length === 0) { if (el) el.hidden = true; return; }

    var totalALE = 0;
    var topRisks = [];
    RISK_CATS.forEach(function (rc) {
      var hasGap = false;
      (rc.related_questions || []).forEach(function (qId) {
        findings.forEach(function (f) {
          if (f.q.id === qId) hasGap = true;
        });
      });
      if (hasGap) {
        var ale = (rc.sle || 0) * (rc.aro_medium || 0.05);
        totalALE += ale;
        topRisks.push({ title: rc.title, ale: ale, mitigation: rc.mitigation_summary });
      }
    });

    topRisks.sort(function (a, b) { return b.ale - a.ale; });

    var html = '<h3>Risk Quantifier</h3>';
    html += '<div class="sectool-risk-row"><span class="sectool-risk-label">Total estimated annual exposure</span>'
      + '<span class="sectool-risk-value">$' + formatNum(Math.round(totalALE * 0.6)) + ' – $' + formatNum(Math.round(totalALE * 1.5)) + '</span></div>';

    topRisks.slice(0, 3).forEach(function (r) {
      html += '<div class="sectool-risk-row"><span class="sectool-risk-label">' + esc(r.title) + '</span>'
        + '<span class="sectool-risk-value">$' + formatNum(Math.round(r.ale)) + '/yr</span></div>';
    });

    // Reduction estimate
    var top5Reduction = 0;
    topRisks.slice(0, 5).forEach(function (r) { top5Reduction += r.ale; });
    if (top5Reduction > 0) {
      var pct = totalALE > 0 ? Math.round((top5Reduction / totalALE) * 100) : 0;
      html += '<div class="sectool-risk-row"><span class="sectool-risk-label">Fixing top 5 risks reduces exposure by</span>'
        + '<span class="sectool-risk-value" style="color:#22C55E">~' + pct + '%</span></div>';
    }

    html += '<p class="sectool-risk-disclaimer">Estimates use industry benchmarks (IBM Cost of Data Breach 2024, Verizon DBIR 2024). '
      + 'These are directional planning figures to help prioritise security investment and build business cases, '
      + 'not actuarial calculations. Actual risk varies by industry, size, and threat landscape.</p>';

    el.innerHTML = html;
    el.hidden = false;
  }

  function formatNum(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
    return n.toString();
  }

  // ══════════════════════════════════════════════════════════════
  // COPY BUTTONS (email records)
  // ══════════════════════════════════════════════════════════════

  function initCopyButtons() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.sectool-copy-btn[data-target]');
      if (btn) {
        var target = $(btn.dataset.target);
        if (target && navigator.clipboard) {
          navigator.clipboard.writeText(target.textContent).then(function () {
            btn.textContent = 'Copied!';
            setTimeout(function () { btn.textContent = 'Copy'; }, 2000);
          });
        }
      }
    });
  }

  // ══════════════════════════════════════════════════════════════
  // INIT
  // ══════════════════════════════════════════════════════════════

  function init() {
    initAssessment();
    initEmailSecurity();
    initCopyButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
