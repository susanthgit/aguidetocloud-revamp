/* ═══════════════════════════════════════════════
   M365 Licence Picker — JS Engine v4
   Feature picker + recommendation algorithm
   V4: regional pricing, SKU codes, cost chart,
   print view, multi-segment planning
   ═══════════════════════════════════════════════ */
(function () {
  'use strict';

  const D = window.__licpickData;
  if (!D) return;

  const { plans, features, categories, combos, addons, scenarios } = D;

  // ── V4: Currency system ─────────────────────
  const currencySymbols = { usd: '$', aud: 'A$', nzd: 'NZ$', gbp: '£', eur: '€' };
  let currency = 'nzd';

  function getPrice(item) {
    var key = 'price_' + currency;
    return (typeof item[key] === 'number') ? item[key] : item.price_usd;
  }

  function formatPrice(amount) {
    return currencySymbols[currency] + (amount || 0).toFixed(2);
  }

  function getCurrencyLabel() {
    return currency.toUpperCase();
  }

  // ── Build lookup maps ────────────────────────
  const planMap = {};
  plans.forEach(p => { planMap[p.id] = p; });

  const featureMap = {};
  features.forEach(f => { featureMap[f.id] = f; });

  const addonMap = {};
  addons.forEach(a => { addonMap[a.id] = a; });

  // Build supersedence graph with transitive closure
  const supersedes = {};
  features.forEach(f => { supersedes[f.id] = new Set(f.supersedes || []); });
  let changed = true;
  while (changed) {
    changed = false;
    features.forEach(f => {
      const s = supersedes[f.id];
      const toAdd = [];
      s.forEach(sub => {
        if (supersedes[sub]) {
          supersedes[sub].forEach(x => { if (!s.has(x)) toAdd.push(x); });
        }
      });
      toAdd.forEach(x => { s.add(x); changed = true; });
    });
  }

  // Feature dependency map: calling-plan needs teams-phone
  const featureDeps = {
    'calling-plan': ['teams-phone'],
    'intune-p2': ['intune-p1'],
    'ediscovery-premium': ['ediscovery-standard'],
    'defender-endpoint-p2': ['defender-endpoint-p1'],
    'defender-o365-p2': ['defender-o365-p1'],
    'entra-p2': ['entra-p1'],
    'entra-governance': ['entra-p2']
  };

  // V3: Outcome shortcuts mapping
  const outcomeMap = {
    'secure-signin': ['entra-p1'],
    'enable-copilot': ['teams', 'exchange', 'desktop-apps', 'm365-copilot'],
    'replace-phone': ['teams', 'teams-phone', 'audio-conferencing', 'calling-plan'],
    'full-security': ['defender-o365-p2', 'defender-endpoint-p2', 'defender-identity', 'defender-cloud-apps', 'entra-p2'],
    'compliance-ready': ['dlp', 'information-protection', 'insider-risk', 'audit-premium', 'ediscovery-premium'],
    'remote-workers': ['teams', 'desktop-apps', 'entra-p1', 'intune-p1', 'autopilot', 'windows-enterprise']
  };

  // V3: Scenario → feature mapping for "Try this"
  const scenarioFeatureMap = {
    'cheapest-copilot': ['teams', 'exchange', 'desktop-apps', 'm365-copilot'],
    'e3-vs-e5': ['teams', 'exchange', 'desktop-apps', 'entra-p1', 'intune-p1', 'defender-endpoint-p1'],
    'full-security-stack': ['defender-o365-p2', 'defender-endpoint-p2', 'defender-identity', 'defender-cloud-apps', 'entra-p2'],
    'conditional-access-plan': ['entra-p1'],
    'small-business': ['teams', 'exchange', 'desktop-apps', 'sharepoint', 'onedrive'],
    'what-is-f3': ['teams', 'sharepoint', 'onedrive', 'exchange', 'web-mobile-apps', 'entra-p1', 'intune-p1', 'windows-enterprise'],
    'e3-addons-vs-e5': ['teams', 'exchange', 'desktop-apps', 'entra-p2', 'defender-endpoint-p2', 'defender-o365-p2'],
    'what-is-e7': features.map(function(f) { return f.id; })
  };

  // V3: Persona highlights mapping
  const personaMap = {
    'all': [],
    'knowledge': ['desktop-apps', 'teams', 'exchange', 'sharepoint', 'onedrive', 'm365-copilot'],
    'frontline': ['teams', 'web-mobile-apps', 'exchange'],
    'executives': ['desktop-apps', 'teams', 'm365-copilot', 'entra-p2', 'power-bi-pro'],
    'security': ['defender-o365-p1', 'defender-o365-p2', 'defender-endpoint-p1', 'defender-endpoint-p2', 'defender-identity', 'defender-cloud-apps', 'entra-p2', 'insider-risk']
  };

  function planCovers(plan) {
    const covered = new Set(plan.features || []);
    (plan.features || []).forEach(fid => {
      if (supersedes[fid]) supersedes[fid].forEach(sub => covered.add(sub));
    });
    return covered;
  }

  const planCoverage = {};
  plans.forEach(p => { planCoverage[p.id] = planCovers(p); });

  // ── State ────────────────────────────────────
  const selected = new Set();
  let addonBasePlan = null;
  const addonSelected = new Set();
  let seatCount = 0;
  let includePreview = true;

  // ── Tab switching ────────────────────────────
  const tabs = document.querySelectorAll('.licpick-tab');
  const panels = document.querySelectorAll('.licpick-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      panels.forEach(p => { p.style.display = 'none'; p.classList.remove('active'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const panel = document.getElementById('tab-' + tab.dataset.tab);
      if (panel) { panel.style.display = ''; panel.classList.add('active'); }
    });
  });

  // ── Tab 1: Feature Picker ────────────────────
  function buildFeatureGrid() {
    // Clear existing tiles first (for re-renders on currency change)
    document.querySelectorAll('.licpick-feature-grid').forEach(function(grid) { grid.innerHTML = ''; });
    features.forEach(f => {
      const grid = document.getElementById('grid-' + f.category);
      if (!grid) return;

      const tile = document.createElement('div');
      tile.className = 'licpick-tile';
      tile.dataset.feature = f.id;
      tile.dataset.search = (f.name + ' ' + f.description + ' ' + f.id).toLowerCase();
      tile.setAttribute('role', 'checkbox');
      tile.setAttribute('aria-checked', 'false');
      tile.setAttribute('aria-label', f.name + ': ' + f.description);
      tile.tabIndex = 0;
      // Tooltip with full detail (description, plans, add-on price, deps)
      var plansIncluding = plans.filter(function(p) { return planCoverage[p.id] && planCoverage[p.id].has(f.id); }).map(function(p) { return p.short; });
      var addonInfo = addons.filter(function(a) { return (a.provides || []).includes(f.id); });
      var deps = featureDeps[f.id];
      var tooltipHTML = '<div class="licpick-tooltip">' +
        '<span class="licpick-tooltip-name">' + esc(f.name) + '</span>' +
        '<span>' + esc(f.description) + '</span>' +
        (deps ? '<div class="licpick-tooltip-dep">Requires ' + deps.map(d => featureMap[d] ? featureMap[d].name : d).join(', ') + '</div>' : '') +
        '<div class="licpick-tooltip-plans">Included in: ' + (plansIncluding.length ? esc(plansIncluding.join(', ')) : 'No base plan') + '</div>' +
        (addonInfo.length ? '<div class="licpick-tooltip-addon">Add-on: ' + formatPrice(getPrice(addonInfo[0])) + '/mo (' + esc(addonInfo[0].name) + ')</div>' : '') +
        '</div>';

      // Compact tile: name + checkbox only (description in tooltip)
      tile.innerHTML =
        '<span class="licpick-tile-name">' + esc(f.name) + '</span>' +
        '<span class="licpick-tile-check">\u2713</span>' +
        tooltipHTML;
      tile.addEventListener('click', () => toggleFeature(f.id));
      tile.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFeature(f.id); } });
      grid.appendChild(tile);
    });
  }

  // ── Feature search ───────────────────────────
  function initSearch() {
    const searchBox = document.getElementById('licpick-search');
    if (!searchBox) return;
    searchBox.addEventListener('input', () => {
      const q = searchBox.value.toLowerCase().trim();
      document.querySelectorAll('.licpick-tile').forEach(tile => {
        const match = !q || tile.dataset.search.includes(q);
        tile.style.display = match ? '' : 'none';
      });
      // Hide empty categories
      document.querySelectorAll('.licpick-category').forEach(cat => {
        const visible = cat.querySelectorAll('.licpick-tile[style=""], .licpick-tile:not([style])');
        const hasVisible = [...cat.querySelectorAll('.licpick-tile')].some(t => t.style.display !== 'none');
        cat.style.display = hasVisible ? '' : 'none';
      });
    });
  }

  function toggleFeature(fid) {
    if (selected.has(fid)) {
      selected.delete(fid);
    } else {
      selected.add(fid);
      // Auto-add dependencies
      if (featureDeps[fid]) {
        featureDeps[fid].forEach(dep => {
          if (!selected.has(dep)) {
            selected.add(dep);
            showToast(esc(featureMap[dep] ? featureMap[dep].name : dep) + ' auto-added (required)');
          }
        });
      }
    }
    // V3: Pulse animation
    const tile = document.querySelector('.licpick-tile[data-feature="' + fid + '"]');
    if (tile) { tile.classList.remove('licpick-pulse'); void tile.offsetWidth; tile.classList.add('licpick-pulse'); }
    updateTileStates();
    updateResults();
    saveToLocalStorage();
    syncPickerToSegment();
  }

  function setFeatures(fids) {
    selected.clear();
    fids.forEach(f => { if (featureMap[f]) selected.add(f); });
    // Auto-add dependencies for all selected
    fids.forEach(f => {
      if (featureDeps[f]) {
        featureDeps[f].forEach(dep => { if (featureMap[dep]) selected.add(dep); });
      }
    });
    updateTileStates();
    updateResults();
    saveToLocalStorage();
  }

  function updateTileStates() {
    document.querySelectorAll('.licpick-tile').forEach(tile => {
      const on = selected.has(tile.dataset.feature);
      tile.classList.toggle('selected', on);
      tile.setAttribute('aria-checked', on ? 'true' : 'false');
      // V3: Screen reader state text
      let srSpan = tile.querySelector('.licpick-sr-state');
      if (!srSpan) {
        srSpan = document.createElement('span');
        srSpan.className = 'licpick-sr-state';
        srSpan.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);';
        tile.appendChild(srSpan);
      }
      srSpan.textContent = on ? 'Selected' : 'Not selected';
    });
    const countEl = document.getElementById('licpick-count');
    if (countEl) {
      const oldVal = parseInt(countEl.textContent, 10) || 0;
      countEl.textContent = selected.size;
      // V3: Count bump animation
      if (selected.size !== oldVal) {
        countEl.classList.remove('licpick-count-bump');
        void countEl.offsetWidth;
        countEl.classList.add('licpick-count-bump');
        setTimeout(function() { countEl.classList.remove('licpick-count-bump'); }, 200);
      }
    }

    // Update combo button states
    document.querySelectorAll('.licpick-combo-btn').forEach(btn => {
      if (btn.dataset.combo === 'clear') return;
      const combo = combos.find(c => c.id === btn.dataset.combo);
      if (!combo) return;
      const match = combo.features.length === selected.size &&
                    combo.features.every(f => selected.has(f));
      btn.classList.toggle('active', match);
    });
  }

  // ── Recommendation Engine ────────────────────
  function updateResults() {
    const empty = document.querySelector('.licpick-results-empty');
    const active = document.querySelector('.licpick-results-active');
    if (!selected.size) {
      empty.style.display = '';
      active.style.display = 'none';
      return;
    }
    const wasHidden = active.style.display === 'none';
    empty.style.display = 'none';
    active.style.display = '';
    // V3: Slide-in animation on first appearance
    if (wasHidden) {
      active.classList.remove('licpick-slide-in');
      void active.offsetWidth;
      active.classList.add('licpick-slide-in');
    }

    const needed = [...selected];
    const results = findBestCombos(needed);

    if (!results.length) {
      // Guided recovery: find which features are hardest to cover
      const uncoverable = needed.filter(fid => {
        return !plans.some(p => planCoverage[p.id].has(fid)) &&
               !addons.some(a => (a.provides || []).includes(fid));
      });
      let msg = '<p style="margin:0 0 8px"><strong>No plan combination covers all selected features.</strong></p>';
      if (uncoverable.length) {
        msg += '<p style="margin:0;font-size:0.8rem">These features have no available plan or add-on: <strong>' +
          uncoverable.map(f => esc(featureMap[f] ? featureMap[f].name : f)).join(', ') + '</strong></p>';
      }
      if (seatCount > 300) {
        msg += '<p class="licpick-tip-note">Business plans are excluded because you set >300 users.</p>';
      }
      if (!includePreview) {
        msg += '<p class="licpick-tip-note">Preview plans (E7) are excluded. Toggle "Include preview" to see more options.</p>';
      }
      document.getElementById('licpick-rec-name').textContent = 'No plan found';
      document.getElementById('licpick-rec-price').textContent = '—';
      document.getElementById('licpick-rec-nzd').textContent = '';
      var annualNoRes = document.getElementById('licpick-rec-annual');
      if (annualNoRes) annualNoRes.innerHTML = '';
      document.getElementById('licpick-rec-breakdown').innerHTML = msg;
      document.getElementById('licpick-rec-coverage').innerHTML = '';
      document.getElementById('licpick-alt-list').innerHTML = '';
      document.getElementById('licpick-tips').innerHTML = '';
      var chartNoRes = document.getElementById('licpick-chart');
      if (chartNoRes) chartNoRes.innerHTML = '';
      return;
    }

    const best = results[0];
    renderRecommendation(best, needed, results);
    renderAlternatives(results.slice(1, 4), needed, best);
    renderCostChart(results);
    renderTips(results, needed);
    // V4: Show print button when results visible
    var printBtn = document.getElementById('licpick-print');
    if (printBtn) printBtn.style.display = '';
  }

  function findBestCombos(needed) {
    const results = [];
    const eligible = plans.filter(p => {
      if (p.status === 'preview' && !includePreview) return false;
      if (p.status !== 'ga' && p.status !== 'preview') return false;
      if (seatCount > 0 && p.seat_max > 0 && seatCount > p.seat_max) return false;
      return true;
    });

    for (const plan of eligible) {
      const planCov = planCoverage[plan.id];
      const missing = needed.filter(f => !planCov.has(f));

      if (!missing.length) {
        results.push({
          plan: plan,
          addons: [],
          total: getPrice(plan),
          coverage: needed.length,
          missing: [],
          extras: countExtras(planCov, needed)
        });
        continue;
      }

      const validAddons = addons.filter(a =>
        a.requires_base.includes(plan.id) &&
        !a.already_in.includes(plan.id)
      );

      if (!validAddons.length) continue;

      const n = validAddons.length;
      const limit = Math.min(1 << n, 4096);
      let bestCombo = null;

      for (let mask = 1; mask < limit; mask++) {
        const combo = [];
        let comboPrice = getPrice(plan);
        const comboCov = new Set(planCov);

        for (let i = 0; i < n; i++) {
          if (mask & (1 << i)) {
            const a = validAddons[i];
            combo.push(a);
            comboPrice += getPrice(a);
            (a.provides || []).forEach(f => {
              comboCov.add(f);
              if (supersedes[f]) supersedes[f].forEach(s => comboCov.add(s));
            });
          }
        }

        const stillMissing = needed.filter(f => !comboCov.has(f));
        if (stillMissing.length) continue;

        if (!bestCombo || comboPrice < bestCombo.total || (comboPrice === bestCombo.total && combo.length < bestCombo.addons.length)) {
          bestCombo = {
            plan: plan,
            addons: combo,
            total: comboPrice,
            coverage: needed.length,
            missing: [],
            extras: countExtras(comboCov, needed)
          };
        }
      }

      if (bestCombo) results.push(bestCombo);
    }

    results.sort((a, b) => a.total - b.total || a.addons.length - b.addons.length);
    return results;
  }

  function countExtras(coverageSet, needed) {
    const neededSet = new Set(needed);
    let extras = 0;
    coverageSet.forEach(f => { if (!neededSet.has(f)) extras++; });
    return extras;
  }

  function renderRecommendation(rec, needed, allResults) {
    const name = rec.addons.length
      ? rec.plan.short + ' + ' + rec.addons.map(a => a.name).join(' + ')
      : rec.plan.short;
    document.getElementById('licpick-rec-name').innerHTML = esc(name) + (rec.plan.sku ? ' <span class="licpick-sku">SKU: ' + esc(rec.plan.sku) + '</span>' : '');
    document.getElementById('licpick-rec-price').textContent = formatPrice(rec.total);
    document.getElementById('licpick-rec-nzd').textContent = formatPrice(rec.total) + '/user/month (' + getCurrencyLabel() + ')';

    // V4: Annual + team cost (all in selected currency)
    var annualEl = document.getElementById('licpick-rec-annual');
    if (annualEl) {
      var annual = rec.total * 12;
      var html = '<div>' + formatPrice(annual) + '/user/year (' + getCurrencyLabel() + ')</div>';
      if (seatCount > 0) {
        var teamMonthly = rec.total * seatCount;
        var teamAnnual = teamMonthly * 12;
        html += '<div class="licpick-annual-team">Total for ' + seatCount + ' users: ' + formatPrice(teamMonthly) + '/month · ' + formatPrice(teamAnnual) + '/year</div>';
      }
      annualEl.innerHTML = html;
    }

    // Breakdown
    let bd = '<div class="licpick-bd-line"><span>' + esc(rec.plan.name) + '</span><span>' + formatPrice(getPrice(rec.plan)) + '</span></div>';
    rec.addons.forEach(a => {
      bd += '<div class="licpick-bd-line"><span>+ ' + esc(a.name) + '</span><span>' + formatPrice(getPrice(a)) + '</span></div>';
    });
    bd += '<div class="licpick-bd-line licpick-bd-total"><span>Total</span><span>' + formatPrice(rec.total) + '/user/month</span></div>';
    document.getElementById('licpick-rec-breakdown').innerHTML = bd;

    // Why this plan + extras
    let covHTML = '';
    const covPct = Math.round((rec.coverage / needed.length) * 100);
    covHTML += '<div>Covers all ' + rec.coverage + ' selected features</div>';

    // Show bonus features user gets for free
    if (rec.extras > 0) {
      const neededSet = new Set(needed);
      const bonusFeats = [];
      const covSet = rec.addons.length ? (() => {
        const s = new Set(planCoverage[rec.plan.id]);
        rec.addons.forEach(a => (a.provides || []).forEach(f => { s.add(f); if (supersedes[f]) supersedes[f].forEach(x => s.add(x)); }));
        return s;
      })() : planCoverage[rec.plan.id];
      covSet.forEach(f => {
        if (!neededSet.has(f) && featureMap[f]) bonusFeats.push(featureMap[f].name);
      });
      if (bonusFeats.length) {
        covHTML += '<div class="licpick-bonus-note"><strong>Bonus features included:</strong> ' + bonusFeats.slice(0, 8).join(', ') + (bonusFeats.length > 8 ? ' +' + (bonusFeats.length - 8) + ' more' : '') + '</div>';
      }
    }

    // Warnings
    if (rec.plan.seat_max) covHTML += '<div class="licpick-coverage-note">' + esc(rec.plan.name) + ' is limited to ' + rec.plan.seat_max + ' users</div>';
    if (rec.plan.status === 'preview') covHTML += '<div class="licpick-coverage-note">' + esc(rec.plan.name) + ' is in preview (GA May 2026)</div>';

    // Why cheaper plans failed
    if (allResults.length > 0) {
      const cheaperPlans = plans.filter(p => getPrice(p) < getPrice(rec.plan) && p.status === 'ga');
      if (cheaperPlans.length && !rec.addons.length) {
        const example = cheaperPlans[cheaperPlans.length - 1];
        const exMissing = needed.filter(f => !planCoverage[example.id].has(f));
        if (exMissing.length) {
          covHTML += '<div class="licpick-bonus-note"><strong>Why not ' + esc(example.short) + ' (' + formatPrice(getPrice(example)) + ')?</strong> Missing: ' + exMissing.slice(0, 3).map(f => featureMap[f] ? featureMap[f].name : f).join(', ') + (exMissing.length > 3 ? ' +' + (exMissing.length - 3) + ' more' : '') + '</div>';
        }
      }
    }

    document.getElementById('licpick-rec-coverage').innerHTML = covHTML;
  }

  function renderAlternatives(alts, needed, best) {
    const container = document.getElementById('licpick-alt-list');
    if (!alts.length) { container.innerHTML = ''; return; }
    container.innerHTML = alts.map(alt => {
      const name = alt.addons.length
        ? alt.plan.short + ' + ' + alt.addons.length + ' add-on' + (alt.addons.length > 1 ? 's' : '')
        : alt.plan.short;
      const diff = alt.total - best.total;
      const diffStr = diff > 0 ? '+' + formatPrice(diff) + '/mo more' : (diff < 0 ? '-' + formatPrice(Math.abs(diff)) + '/mo less' : 'same price');
      const isOverkill = alt.extras > needed.length * 0.5;
      return '<div class="licpick-alt-card' + (isOverkill ? ' licpick-alt-overkill' : '') + '">' +
        '<div class="licpick-alt-header">' +
          '<span class="licpick-alt-name">' + esc(name) + '</span>' +
          '<span class="licpick-alt-price">' + formatPrice(alt.total) + '/mo</span>' +
        '</div>' +
        '<div class="licpick-alt-note">' +
          '<span style="color:#fbbf24">' + esc(diffStr) + '</span> · ' +
          esc(alt.plan.tagline) +
          (alt.addons.length ? ' + ' + alt.addons.map(a => a.name).join(', ') : '') +
          (alt.plan.seat_max ? ' · Max ' + alt.plan.seat_max + ' seats' : '') +
          (alt.extras > 0 ? ' · +' + alt.extras + ' bonus features' : '') +
        '</div>' +
      '</div>';
    }).join('');
  }

  function renderTips(results, needed) {
    const tips = [];
    const best = results[0];

    // If recommended is a big plan, check if base+addons is cheaper
    if (!best.addons.length && results.length > 1) {
      const cheaperCombo = results.find(r => r.addons.length > 0 && r.total < best.total);
      if (cheaperCombo) {
        tips.push('<strong>' + esc(cheaperCombo.plan.short) + ' + add-ons</strong> is ' + formatPrice(best.total - cheaperCombo.total) + '/mo cheaper than ' + esc(best.plan.short));
      }
    }

    // If recommended has add-ons, check if a bigger plan is only slightly more
    if (best.addons.length && results.length > 1) {
      const simpler = results.find(r => r.addons.length === 0 && r.total <= best.total * 1.15);
      if (simpler && simpler !== best) {
        tips.push('<strong>' + esc(simpler.plan.short) + '</strong> (' + formatPrice(simpler.total) + ') covers everything with zero add-ons — only ' + formatPrice(simpler.total - best.total) + '/mo more');
      }
    }

    // Seat limit warning
    if (best.plan.seat_max) {
      tips.push('' + esc(best.plan.name) + ' is limited to ' + best.plan.seat_max + ' users. Need more? Look at Enterprise plans.');
    }

    // E3+addons vs E5 breakpoint
    const e3combo = results.find(r => r.plan.id === 'm365-e3' && r.addons.length > 0);
    const e5solo = results.find(r => r.plan.id === 'm365-e5' && r.addons.length === 0);
    if (e3combo && e5solo && e3combo.total > e5solo.total) {
      tips.push('E3 + add-ons (' + formatPrice(e3combo.total) + ') > E5 (' + formatPrice(e5solo.total) + '). <strong>Go with E5!</strong>');
    }

    // Matching scenario hint
    const scenarioMatch = scenarios.find(s => {
      const words = s.title.toLowerCase();
      return needed.some(f => words.includes((featureMap[f] || {}).name?.toLowerCase() || ''));
    });
    if (scenarioMatch) {
      tips.push('Related scenario: <strong>' + esc(scenarioMatch.title) + '</strong> — check the Scenarios tab');
    }

    const el = document.getElementById('licpick-tips');
    el.innerHTML = tips.join('<br>');
  }

  // ── Quick-select combos ──────────────────────
  document.querySelectorAll('.licpick-combo-btn, .licpick-inline-combo').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.combo;
      if (id === 'clear') { setFeatures([]); clearLocalStorage(); return; }
      const combo = combos.find(c => c.id === id);
      if (combo) setFeatures(combo.features);
    });
  });

  // ── Tab 2: Plan Comparison ───────────────────
  function buildComparisonTable(filterCat) {
    const head = document.getElementById('licpick-compare-head');
    const body = document.getElementById('licpick-compare-body');
    if (!head || !body) return;

    const sortedPlans = [...plans].sort((a, b) => getPrice(a) - getPrice(b));
    const diffOnly = document.getElementById('licpick-diff-only');
    const showDiffOnly = diffOnly && diffOnly.checked;

    // V3: Determine recommended plan column for highlighting
    let recPlanId = null;
    if (selected.size) {
      const needed = [...selected];
      const results = findBestCombos(needed);
      if (results.length) recPlanId = results[0].plan.id;
    }

    // Header
    let hRow = '<tr><th>Feature</th>';
    sortedPlans.forEach(p => {
      let badge = '';
      if (p.badge === 'Most Popular') badge = '<span class="licpick-plan-badge licpick-badge-popular">Popular</span>';
      else if (p.badge === 'New') badge = '<span class="licpick-plan-badge licpick-badge-new">New</span>';
      else if (p.badge === 'Best Security') badge = '<span class="licpick-plan-badge licpick-badge-security">Security</span>';
      const colHL = p.id === recPlanId ? ' class="licpick-col-highlight"' : '';
      hRow += '<th' + colHL + '>' + esc(p.short) + (p.sku ? '<br><span class="licpick-sku">' + esc(p.sku) + '</span>' : '') + badge + '</th>';
    });
    hRow += '</tr>';
    head.innerHTML = hRow;

    // Price row
    let rows = '<tr class="lp-price-row"><td><strong>Price/user/month</strong></td>';
    sortedPlans.forEach(p => {
      const colHL = p.id === recPlanId ? ' class="licpick-col-highlight"' : '';
      rows += '<td' + colHL + '>' + formatPrice(getPrice(p)) + '</td>';
    });
    rows += '</tr>';

    // Group features by category
    const catGroups = {};
    categories.forEach(c => { catGroups[c.id] = { label: c.label, features: [] }; });
    features.forEach(f => {
      if (filterCat !== 'all' && f.category !== filterCat) return;
      if (catGroups[f.category]) catGroups[f.category].features.push(f);
    });

    categories.forEach(cat => {
      const group = catGroups[cat.id];
      if (!group || !group.features.length) return;

      // V3: Check if any feature in this category differs or is selected (for diff-only)
      var catHasVisibleRows = false;
      var catRows = '';

      group.features.forEach(f => {
        const vals = sortedPlans.map(p => planCoverage[p.id].has(f.id));
        const allSame = vals.every(v => v === vals[0]);
        if (showDiffOnly && allSame) return;
        catHasVisibleRows = true;

        const isSelected = selected.has(f.id);
        const rowHL = isSelected ? ' class="licpick-row-highlight"' : '';
        catRows += '<tr' + rowHL + '><td>' + esc(f.name) + '</td>';
        sortedPlans.forEach(p => {
          const has = planCoverage[p.id].has(f.id);
          const colHL = p.id === recPlanId ? ' licpick-col-highlight' : '';
          catRows += '<td class="' + (has ? 'lp-yes' : 'lp-no') + colHL + '">' + (has ? 'Yes' : '—') + '</td>';
        });
        catRows += '</tr>';
      });

      if (!catHasVisibleRows) return;
      rows += '<tr class="lp-cat-row"><td colspan="' + (sortedPlans.length + 1) + '">' + group.label + '</td></tr>';
      rows += catRows;
    });

    body.innerHTML = rows;
  }

  const catFilter = document.getElementById('licpick-cat-filter');
  if (catFilter) {
    catFilter.addEventListener('change', () => buildComparisonTable(catFilter.value));
  }
  // V3: Diff-only toggle
  const diffOnlyToggle = document.getElementById('licpick-diff-only');
  if (diffOnlyToggle) {
    diffOnlyToggle.addEventListener('change', () => {
      const cf = document.getElementById('licpick-cat-filter');
      buildComparisonTable(cf ? cf.value : 'all');
    });
  }

  // ── Tab 3: Add-on Calculator ─────────────────
  function buildAddonCalculator() {
    const baseCont = document.getElementById('licpick-base-plans');
    const addonCont = document.getElementById('licpick-addon-cards');
    if (!baseCont || !addonCont) return;

    // Base plan buttons
    baseCont.innerHTML = plans.map(p =>
      '<button class="licpick-base-btn" data-plan="' + p.id + '">' +
        '<span class="licpick-base-btn-name">' + esc(p.short) + '</span>' +
        '<span class="licpick-base-btn-price">' + formatPrice(getPrice(p)) + '/mo</span>' +
      '</button>'
    ).join('');

    baseCont.querySelectorAll('.licpick-base-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        addonBasePlan = btn.dataset.plan;
        addonSelected.clear();
        baseCont.querySelectorAll('.licpick-base-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        renderAddonCards();
        updateAddonTotal();
      });
    });
  }

  function renderAddonCards() {
    const cont = document.getElementById('licpick-addon-cards');
    if (!cont || !addonBasePlan) return;
    const plan = planMap[addonBasePlan];
    if (!plan) return;

    // V3: Sort add-ons: eligible first, then conflict (already included), then disabled
    const sorted = [...addons].sort((a, b) => {
      const aElig = a.requires_base.includes(addonBasePlan) && !a.already_in.includes(addonBasePlan);
      const bElig = b.requires_base.includes(addonBasePlan) && !b.already_in.includes(addonBasePlan);
      const aConf = a.already_in.includes(addonBasePlan);
      const bConf = b.already_in.includes(addonBasePlan);
      const aScore = aElig ? 0 : (aConf ? 1 : 2);
      const bScore = bElig ? 0 : (bConf ? 1 : 2);
      return aScore - bScore;
    });

    cont.innerHTML = sorted.map(a => {
      const eligible = a.requires_base.includes(addonBasePlan);
      const alreadyIn = a.already_in.includes(addonBasePlan);
      const cls = alreadyIn ? 'conflict' : (!eligible ? 'disabled' : '');
      // V3: Reason why unavailable
      let reasonHTML = '';
      if (!eligible && !alreadyIn) {
        const reqNames = a.requires_base.map(id => planMap[id] ? planMap[id].short : id).slice(0, 3).join(', ');
        reasonHTML = '<div class="licpick-addon-reason">Requires: ' + esc(reqNames) + (a.requires_base.length > 3 ? ' +more' : '') + '</div>';
      }
      // V3: Show what features this add-on unlocks
      const unlocksHTML = (a.provides && a.provides.length)
        ? '<div class="licpick-addon-unlocks">Unlocks: ' + a.provides.map(fid => featureMap[fid] ? esc(featureMap[fid].name) : fid).join(', ') + '</div>'
        : '';
      return '<div class="licpick-addon-card ' + cls + '" data-addon="' + a.id + '" role="checkbox" aria-checked="false" tabindex="' + (cls ? '-1' : '0') + '">' +
        '<div class="licpick-addon-head">' +
          '<span class="licpick-addon-name">' + esc(a.name) + '</span>' +
          '<span class="licpick-addon-price">' + (alreadyIn ? 'Included' : (!eligible ? 'N/A' : '+' + formatPrice(getPrice(a)))) + '</span>' +
        '</div>' +
        '<p class="licpick-addon-desc">' + esc(a.description) + '</p>' +
        (alreadyIn ? '<div class="licpick-addon-conflict-msg">Already included in ' + esc(plan.short) + ' — don\'t buy separately!</div>' : '') +
        reasonHTML +
        (a.note && !alreadyIn ? '<div class="licpick-addon-conflict-msg">' + esc(a.note) + '</div>' : '') +
        unlocksHTML +
      '</div>';
    }).join('');

    cont.querySelectorAll('.licpick-addon-card:not(.disabled):not(.conflict)').forEach(card => {
      card.style.cursor = 'pointer';
      function toggleAddonCard() {
        const aid = card.dataset.addon;
        if (addonSelected.has(aid)) {
          addonSelected.delete(aid);
          card.classList.remove('selected');
          card.setAttribute('aria-checked', 'false');
        } else {
          addonSelected.add(aid);
          card.classList.add('selected');
          card.setAttribute('aria-checked', 'true');
        }
        updateAddonTotal();
      }
      card.addEventListener('click', toggleAddonCard);
      card.addEventListener('keydown', function(e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleAddonCard(); } });
    });
  }

  function updateAddonTotal() {
    const cont = document.getElementById('licpick-stack-summary');
    if (!cont || !addonBasePlan) return;
    const plan = planMap[addonBasePlan];
    if (!plan) return;

    let html = '<div class="licpick-stack-line"><span>' + esc(plan.name) + '</span><span>' + formatPrice(getPrice(plan)) + '</span></div>';
    let total = getPrice(plan);

    // V3: Collect all covered features
    const coveredFeats = new Set(planCoverage[plan.id] || []);

    addonSelected.forEach(aid => {
      const a = addons.find(x => x.id === aid);
      if (a) {
        html += '<div class="licpick-stack-line"><span>+ ' + esc(a.name) + '</span><span>' + formatPrice(getPrice(a)) + '</span></div>';
        total += getPrice(a);
        (a.provides || []).forEach(fid => {
          coveredFeats.add(fid);
          if (supersedes[fid]) supersedes[fid].forEach(s => coveredFeats.add(s));
        });
      }
    });

    html += '<div class="licpick-stack-total"><span>Total</span><span>' + formatPrice(total) + '/user/mo</span></div>';
    html += '<div class="licpick-stack-annual">= ' + formatPrice(total * 12) + '/user/year (' + getCurrencyLabel() + ')</div>';

    // V3: Running feature list
    const featNames = [];
    coveredFeats.forEach(fid => { if (featureMap[fid]) featNames.push(featureMap[fid].name); });
    if (featNames.length) {
      featNames.sort();
      html += '<div class="licpick-stack-features"><strong>Features covered (' + featNames.length + '):</strong>' + featNames.join(', ') + '</div>';
    }

    cont.innerHTML = html;
  }

  // ── Copy & Share (async clipboard) ────────────
  const copyBtn = document.getElementById('licpick-copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const name = document.getElementById('licpick-rec-name').textContent;
      const price = document.getElementById('licpick-rec-price').textContent;
      const feats = [...selected].map(f => featureMap[f] ? featureMap[f].name : f).join(', ');
      const text = 'M365 Licence Recommendation\n' +
        'Plan: ' + name + '\n' +
        'Cost: ' + price + '/user/month (' + getCurrencyLabel() + ')\n' +
        'Features: ' + feats + '\n' +
        'Generated by aguidetocloud.com/licence-picker/';
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy Summary'; }, 2000);
      }).catch(() => { copyBtn.textContent = 'Failed'; setTimeout(() => { copyBtn.textContent = 'Copy Summary'; }, 2000); });
    });
  }

  const shareBtn = document.getElementById('licpick-share');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const params = new URLSearchParams();
      params.set('f', [...selected].join(','));
      if (seatCount > 0) params.set('seats', seatCount);
      if (currency !== 'nzd') params.set('cur', currency);
      const url = location.origin + '/licence-picker/?' + params.toString();
      navigator.clipboard.writeText(url).then(() => {
        shareBtn.textContent = 'Link copied!';
        setTimeout(() => { shareBtn.textContent = 'Share Link'; }, 2000);
      }).catch(() => { shareBtn.textContent = 'Failed'; setTimeout(() => { shareBtn.textContent = 'Share Link'; }, 2000); });
    });
  }

  // ── URL state restore ────────────────────────
  function restoreFromURL() {
    const params = new URLSearchParams(location.search);
    const f = params.get('f');
    const seats = params.get('seats');
    const cur = params.get('cur');
    if (cur && currencySymbols[cur]) {
      currency = cur;
      var curSel = document.getElementById('licpick-currency');
      if (curSel) curSel.value = currency;
    }
    if (seats) {
      seatCount = parseInt(seats, 10) || 0;
      const seatInput = document.getElementById('licpick-seats');
      if (seatInput) seatInput.value = seatCount;
    }
    if (f) {
      const fids = f.split(',').filter(id => featureMap[id]);
      if (fids.length) setFeatures(fids);
    }
  }

  // ── Seat count & preview toggle ──────────────
  function initControls() {
    const seatInput = document.getElementById('licpick-seats');
    if (seatInput) {
      seatInput.addEventListener('input', () => {
        seatCount = parseInt(seatInput.value, 10) || 0;
        updateResults();
        saveToLocalStorage();
      });
    }
    const previewToggle = document.getElementById('licpick-preview-toggle');
    if (previewToggle) {
      previewToggle.checked = includePreview;
      previewToggle.addEventListener('change', () => {
        includePreview = previewToggle.checked;
        updateResults();
        saveToLocalStorage();
      });
    }
  }

  // ── Toast notifications ──────────────────────
  function showToast(msg) {
    let toast = document.getElementById('licpick-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'licpick-toast';
      toast.className = 'licpick-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // ── Utility ──────────────────────────────────
  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  }

  // ══════════════════════════════════════════════
  // V3 FEATURES
  // ══════════════════════════════════════════════

  // ── V3: LocalStorage save/restore ───────────
  var LS_KEY = 'licpick-selected';

  function saveToLocalStorage() {
    try {
      var data = {
        features: [...selected],
        seats: seatCount,
        preview: includePreview,
        currency: currency
      };
      localStorage.setItem(LS_KEY, JSON.stringify(data));
    } catch (e) { /* quota exceeded or private browsing */ }
  }

  function clearLocalStorage() {
    try { localStorage.removeItem(LS_KEY); } catch (e) { /* ignore */ }
  }

  function restoreFromLocalStorage() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (!raw) return false;
      var data = JSON.parse(raw);
      if (!data || !data.features || !data.features.length) return false;
      data.features.forEach(function(f) { if (featureMap[f]) selected.add(f); });
      if (typeof data.seats === 'number' && data.seats > 0) {
        seatCount = data.seats;
        var seatInput = document.getElementById('licpick-seats');
        if (seatInput) seatInput.value = seatCount;
      }
      if (typeof data.preview === 'boolean') {
        includePreview = data.preview;
        var pt = document.getElementById('licpick-preview-toggle');
        if (pt) pt.checked = includePreview;
      }
      if (data.currency && currencySymbols[data.currency]) {
        currency = data.currency;
        var curSel = document.getElementById('licpick-currency');
        if (curSel) curSel.value = currency;
      }
      updateTileStates();
      updateResults();
      return true;
    } catch (e) { return false; }
  }

  // ── V3: Outcome shortcuts ───────────────────
  function initOutcomes() {
    document.querySelectorAll('.licpick-outcome-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var outcome = btn.dataset.outcome;
        var feats = outcomeMap[outcome];
        if (feats) setFeatures(feats);
      });
    });
  }

  // ── V3: Scenario "Try this" buttons ─────────
  function initScenarioTry() {
    document.querySelectorAll('.licpick-scenario-try').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var sid = btn.dataset.scenario;
        var feats = scenarioFeatureMap[sid];
        if (feats) {
          // Switch to Tab 1
          var pickerTab = document.querySelector('.licpick-tab[data-tab="picker"]');
          if (pickerTab) pickerTab.click();
          setFeatures(feats);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });
  }

  // ── V3: Persona mode ───────────────────────
  function initPersona() {
    var sel = document.getElementById('licpick-persona');
    if (!sel) return;
    sel.addEventListener('change', function() {
      var persona = sel.value;
      var highlights = personaMap[persona] || [];
      document.querySelectorAll('.licpick-tile').forEach(function(tile) {
        var fid = tile.dataset.feature;
        tile.classList.toggle('licpick-persona-highlight', highlights.includes(fid));
      });
    });
  }

  // ── V3: Tab keyboard navigation (a11y) ─────
  function initTabKeyNav() {
    var tabList = document.querySelector('.licpick-tabs[role="tablist"]');
    if (!tabList) return;
    tabList.addEventListener('keydown', function(e) {
      var tabBtns = [...tabList.querySelectorAll('.licpick-tab')];
      var idx = tabBtns.indexOf(document.activeElement);
      if (idx < 0) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        var next = e.key === 'ArrowRight' ? (idx + 1) % tabBtns.length : (idx - 1 + tabBtns.length) % tabBtns.length;
        tabBtns[next].focus();
        tabBtns[next].click();
      }
    });
  }

  // ── V3: Procurement email generator ─────────
  function initEmailGenerator() {
    var emailBtn = document.getElementById('licpick-email');
    var modal = document.getElementById('licpick-email-modal');
    var closeBtn = document.getElementById('licpick-modal-close');
    var bodyEl = document.getElementById('licpick-email-body');
    var copyBtn = document.getElementById('licpick-email-copy');
    var mailtoBtn = document.getElementById('licpick-email-mailto');
    if (!emailBtn || !modal) return;

    emailBtn.addEventListener('click', function() {
      var planName = document.getElementById('licpick-rec-name').textContent || 'TBD';
      var recPrice = document.getElementById('licpick-rec-price').textContent || formatPrice(0);
      var needed = [...selected];
      var results = findBestCombos(needed);
      var best = results[0];
      var total = best ? best.total : 0;
      var annual = (total * 12).toFixed(2);
      var feats = [...selected].map(function(f) { return featureMap[f] ? featureMap[f].name : f; });
      var skuText = best && best.plan.sku ? ' (SKU: ' + best.plan.sku + ')' : '';

      var body = 'Subject: Microsoft 365 Licensing Recommendation \u2014 ' + planName + '\n\n' +
        'Hi [Procurement Team],\n\n' +
        'I\'ve evaluated our Microsoft 365 licensing needs and recommend the following:\n\n' +
        'Plan: ' + planName + skuText + '\n' +
        'Cost: ' + formatPrice(total) + '/user/month (' + getCurrencyLabel() + ')\n' +
        'Annual: ' + formatPrice(total * 12) + '/user/year\n';

      if (seatCount > 0) {
        var totalMo = total * seatCount;
        var totalYr = totalMo * 12;
        body += 'Total for ' + seatCount + ' users: ' + formatPrice(totalMo) + '/month (' + formatPrice(totalYr) + '/year)\n';
      }

      body += '\nFeatures covered:\n';
      feats.forEach(function(f) { body += '- ' + f + '\n'; });

      body += '\nThis recommendation was generated using the M365 Licence Picker at aguidetocloud.com/licence-picker/\n\n' +
        'Please let me know if you need any additional information.\n\n' +
        'Best regards,\n[Your Name]';

      bodyEl.value = body;
      modal.style.display = '';

      // mailto link
      var subject = encodeURIComponent('Microsoft 365 Licensing Recommendation \u2014 ' + planName);
      var mailBody = encodeURIComponent(body);
      mailtoBtn.href = 'mailto:?subject=' + subject + '&body=' + mailBody;
    });

    closeBtn.addEventListener('click', function() { modal.style.display = 'none'; });
    modal.addEventListener('click', function(e) { if (e.target === modal) modal.style.display = 'none'; });

    copyBtn.addEventListener('click', function() {
      navigator.clipboard.writeText(bodyEl.value).then(function() {
        copyBtn.textContent = 'Copied!';
        setTimeout(function() { copyBtn.textContent = 'Copy to Clipboard'; }, 2000);
      }).catch(function() {
        copyBtn.textContent = 'Failed';
        setTimeout(function() { copyBtn.textContent = 'Copy to Clipboard'; }, 2000);
      });
    });
  }

  // ── V3: Refresh comparison table when tab switches ──
  function initCompareRefresh() {
    document.querySelectorAll('.licpick-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        if (tab.dataset.tab === 'compare') {
          var cf = document.getElementById('licpick-cat-filter');
          buildComparisonTable(cf ? cf.value : 'all');
        }
      });
    });
  }

  // ══════════════════════════════════════════════
  // V4 FEATURES
  // ══════════════════════════════════════════════

  // ── V4: Currency dropdown init ──────────────
  function initCurrency() {
    var curSel = document.getElementById('licpick-currency');
    if (!curSel) return;
    curSel.addEventListener('change', function() {
      currency = curSel.value;
      refreshAllPrices();
      saveToLocalStorage();
    });
  }

  function refreshAllPrices() {
    // Re-render feature grid tooltips
    buildFeatureGrid();
    updateTileStates();
    // Re-render results if active
    if (selected.size) updateResults();
    // Re-render comparison table
    var cf = document.getElementById('licpick-cat-filter');
    buildComparisonTable(cf ? cf.value : 'all');
    // Re-render add-on calculator
    if (addonBasePlan) {
      renderAddonCards();
      updateAddonTotal();
    } else {
      buildAddonCalculator();
    }
    // Re-render segments
    renderSegments();
  }

  // ── V4: Cost Chart ──────────────────────────
  function renderCostChart(results) {
    var el = document.getElementById('licpick-chart');
    if (!el) return;
    if (!results || !results.length) { el.innerHTML = ''; return; }

    var top5 = results.slice(0, 5);
    var maxPrice = Math.max.apply(null, top5.map(function(r) { return r.total; }));
    if (maxPrice <= 0) { el.innerHTML = ''; return; }

    var html = '<div class="licpick-chart-title">Cost Comparison (per user/month)</div>';
    top5.forEach(function(r, i) {
      var pct = (r.total / maxPrice) * 100;
      var label = r.addons.length ? r.plan.short + ' +' + r.addons.length : r.plan.short;
      var barClass = i === 0 ? 'cheapest' : 'other';
      html += '<div class="licpick-chart-row">' +
        '<span class="licpick-chart-label">' + esc(label) + '</span>' +
        '<div class="licpick-chart-bar-wrap"><div class="licpick-chart-bar ' + barClass + '" style="width:' + pct + '%"></div></div>' +
        '<span class="licpick-chart-price">' + formatPrice(r.total) + '</span>' +
      '</div>';
    });
    el.innerHTML = html;
  }

  // ── V4: Print handler ──────────────────────
  function initPrint() {
    var printBtn = document.getElementById('licpick-print');
    if (printBtn) {
      printBtn.addEventListener('click', function() { window.print(); });
    }
  }

  // ── V4: Multi-Segment Planning ─────────────
  var segments = [];
  var activeSegmentId = null;

  function addSegment() {
    var id = 'seg-' + Date.now();
    segments.push({ id: id, name: 'Segment ' + (segments.length + 1), count: 0, features: new Set() });
    activeSegmentId = id;
    renderSegments();
    syncSegmentToPicker();
    updateSeatVisibility();
  }

  function removeSegment(id) {
    var idx = segments.findIndex(function(s) { return s.id === id; });
    if (idx >= 0) segments.splice(idx, 1);
    if (activeSegmentId === id) activeSegmentId = segments.length ? segments[0].id : null;
    renderSegments();
    syncSegmentToPicker();
    updateSeatVisibility();
  }

  function syncPickerToSegment() {
    if (!activeSegmentId) return;
    var seg = segments.find(function(s) { return s.id === activeSegmentId; });
    if (seg) { seg.features = new Set(selected); }
    renderSegments();
  }

  function syncSegmentToPicker() {
    if (!activeSegmentId) return;
    var seg = segments.find(function(s) { return s.id === activeSegmentId; });
    if (seg) { setFeatures([...seg.features]); }
  }

  function updateSeatVisibility() {
    var seatWrap = document.getElementById('licpick-seat-wrap');
    if (seatWrap) {
      seatWrap.style.display = segments.length ? 'none' : '';
    }
  }

  function renderSegments() {
    var list = document.getElementById('licpick-segments-list');
    var totalEl = document.getElementById('licpick-segments-total');
    if (!list) return;

    if (!segments.length) {
      list.innerHTML = '<p class="licpick-hint">No segments. The tool works in single-user mode. Add segments to plan for different user groups.</p>';
      if (totalEl) totalEl.style.display = 'none';
      return;
    }

    var orgMonthly = 0;
    list.innerHTML = segments.map(function(seg) {
      var isActive = seg.id === activeSegmentId;
      var needed = [...seg.features];
      var results = needed.length ? findBestCombos(needed) : [];
      var best = results[0];
      var perUser = best ? best.total : 0;
      var segTotal = perUser * (seg.count || 0);
      orgMonthly += segTotal;
      var price = formatPrice(perUser);

      return '<div class="licpick-segment-card' + (isActive ? ' active' : '') + '" data-segment="' + seg.id + '">' +
        '<div class="licpick-segment-header">' +
          '<input class="licpick-segment-name" value="' + esc(seg.name) + '" data-seg="' + seg.id + '">' +
          '<button class="licpick-segment-remove" data-seg="' + seg.id + '" title="Remove segment">✕</button>' +
        '</div>' +
        '<div class="licpick-segment-body">' +
          '<div class="licpick-segment-count-row">' +
            '<label>Users:</label>' +
            '<input type="number" class="licpick-segment-count" value="' + (seg.count || '') + '" data-seg="' + seg.id + '" placeholder="0" min="0">' +
          '</div>' +
          '<div class="licpick-segment-info">' +
            '<span>' + seg.features.size + ' features</span>' +
            '<span>' + (best ? esc(best.plan.short) + (best.addons.length ? ' +' + best.addons.length : '') : 'No plan') + '</span>' +
            '<span>' + price + '/user/mo</span>' +
          '</div>' +
          (seg.count > 0 ? '<div class="licpick-segment-total">Segment: ' + formatPrice(segTotal) + '/month</div>' : '') +
        '</div>' +
      '</div>';
    }).join('');

    // Total org cost
    if (totalEl && segments.some(function(s) { return s.count > 0; })) {
      totalEl.style.display = '';
      totalEl.innerHTML = '<strong>Total Organisation Cost:</strong> ' + formatPrice(orgMonthly) + '/month · ' + formatPrice(orgMonthly * 12) + '/year';
    } else if (totalEl) {
      totalEl.style.display = 'none';
    }

    // Event listeners for segment cards
    list.querySelectorAll('.licpick-segment-card').forEach(function(card) {
      card.addEventListener('click', function(e) {
        if (e.target.classList.contains('licpick-segment-remove') || e.target.tagName === 'INPUT') return;
        syncPickerToSegment();
        activeSegmentId = card.dataset.segment;
        syncSegmentToPicker();
        renderSegments();
      });
    });
    list.querySelectorAll('.licpick-segment-name').forEach(function(input) {
      input.addEventListener('input', function() {
        var seg = segments.find(function(s) { return s.id === input.dataset.seg; });
        if (seg) seg.name = input.value;
      });
    });
    list.querySelectorAll('.licpick-segment-count').forEach(function(input) {
      input.addEventListener('input', function() {
        var seg = segments.find(function(s) { return s.id === input.dataset.seg; });
        if (seg) { seg.count = parseInt(input.value, 10) || 0; renderSegments(); }
      });
    });
    list.querySelectorAll('.licpick-segment-remove').forEach(function(btn) {
      btn.addEventListener('click', function() { removeSegment(btn.dataset.seg); });
    });
  }

  function initSegments() {
    var addBtn = document.getElementById('licpick-add-segment');
    if (addBtn) {
      addBtn.addEventListener('click', function() { addSegment(); });
    }
    renderSegments();
  }

  // ── Init ─────────────────────────────────────
  buildFeatureGrid();
  initSearch();
  initControls();
  buildComparisonTable('all');
  buildAddonCalculator();

  // V3: Restore state (URL takes priority over localStorage)
  var urlParams = new URLSearchParams(location.search);
  if (urlParams.get('f')) {
    restoreFromURL();
  } else {
    if (restoreFromLocalStorage()) {
      showToast('Restored from last session');
    }
  }

  // V3: Init new features
  initOutcomes();
  initScenarioTry();
  initPersona();
  initTabKeyNav();
  initEmailGenerator();
  initCompareRefresh();

  // V4: Init new features
  initCurrency();
  initPrint();
  initSegments();

})();
