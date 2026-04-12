/* ═══════════════════════════════════════════════════════
   CA Policy Builder — ca-builder.js
   100% client-side, zero API calls
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Data ── */
  const TEMPLATES = window.__cabTemplates || [];
  const CONDITIONS = window.__cabConditions || {};
  const COMPLIANCE = window.__cabCompliance || [];
  const LS_KEY = 'cab_policy_set';

  /* ── State ── */
  let policySet = loadPolicies();
  let wizardStep = 0;
  let wizardData = resetWizardData();
  let currentExportFormat = 'powershell';

  /* ── DOM refs ── */
  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  /* ═══════════════════════════════════════════════════════
     TABS
     ═══════════════════════════════════════════════════════ */
  $$('.cab-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.cab-tab').forEach(t => { t.classList.remove('cab-tab--active'); t.setAttribute('aria-selected', 'false'); });
      $$('.cab-panel').forEach(p => { p.classList.remove('cab-panel--active'); p.hidden = true; });
      tab.classList.add('cab-tab--active');
      tab.setAttribute('aria-selected', 'true');
      const panel = $('#panel-' + tab.dataset.tab);
      if (panel) { panel.classList.add('cab-panel--active'); panel.hidden = false; }
      if (tab.dataset.tab === 'review') renderReview();
      if (tab.dataset.tab === 'export') renderExport();
      updateURL();
    });
  });

  /* ═══════════════════════════════════════════════════════
     TEMPLATES TAB
     ═══════════════════════════════════════════════════════ */
  function renderTemplates(filter = '', tier = 'all') {
    const grid = $('#cab-tpl-grid');
    if (!grid) return;
    const lc = filter.toLowerCase();
    const filtered = TEMPLATES.filter(t => {
      if (tier !== 'all' && t.tier !== tier) return false;
      if (lc && !t.name.toLowerCase().includes(lc) && !t.description.toLowerCase().includes(lc)) return false;
      return true;
    });

    grid.innerHTML = filtered.map(t => `
      <div class="cab-policy-card" data-id="${t.id}">
        <div class="cab-policy-card__header">
          <h4 class="cab-policy-card__name">${t.name}</h4>
          <span class="cab-tier-badge cab-tier-badge--${tierClass(t.tier)}">${t.tier_label}</span>
        </div>
        <p class="cab-policy-card__desc">${t.description}</p>
        <p class="cab-policy-card__risk">💡 ${t.risk}</p>
        <div class="cab-policy-card__details">
          <div class="cab-detail-row"><span class="cab-detail-label">👥 Users</span><span class="cab-detail-value">${t.users}</span></div>
          <div class="cab-detail-row"><span class="cab-detail-label">🎯 Target</span><span class="cab-detail-value">${t.target_apps}</span></div>
          ${t.conditions.length ? `<div class="cab-detail-row"><span class="cab-detail-label">📋 Conditions</span><span class="cab-detail-value">${t.conditions.join(', ')}</span></div>` : ''}
          <div class="cab-detail-row"><span class="cab-detail-label">✅ Controls</span><span class="cab-detail-value">${t.grant_controls.join(', ')}</span></div>
          ${t.session_controls.length ? `<div class="cab-detail-row"><span class="cab-detail-label">⏱️ Session</span><span class="cab-detail-value">${t.session_controls.join(', ')}</span></div>` : ''}
          <div class="cab-detail-row"><span class="cab-detail-label">🚫 Excludes</span><span class="cab-detail-value">${t.exclusions.join(', ')}</span></div>
        </div>
        <div class="cab-policy-card__actions">
          <button class="cab-btn cab-btn--primary cab-btn--sm" onclick="window.__cab.addTemplate('${t.id}')">➕ Add to My Set</button>
          <a href="${t.learn_url}" target="_blank" rel="noopener" class="cab-btn cab-btn--secondary cab-btn--sm">📖 Learn More</a>
        </div>
      </div>
    `).join('');

    const count = $('#cab-tpl-count');
    if (count) count.textContent = `Showing ${filtered.length} of ${TEMPLATES.length}`;
  }

  function tierClass(tier) {
    if (tier === 'starting-point') return 'sp';
    if (tier === 'enterprise') return 'ent';
    return 'spec';
  }

  /* Search & filter listeners */
  const tplSearch = $('#cab-tpl-search');
  const tplTier = $('#cab-tpl-tier-filter');
  if (tplSearch) tplSearch.addEventListener('input', () => renderTemplates(tplSearch.value, tplTier.value));
  if (tplTier) tplTier.addEventListener('change', () => renderTemplates(tplSearch.value, tplTier.value));

  function addTemplate(id) {
    const t = TEMPLATES.find(x => x.id === id);
    if (!t) return;
    if (policySet.find(p => p.id === id)) { showToast('⚠️ Already in your set'); return; }
    policySet.push({
      id: t.id, name: t.name, tier: t.tier, tier_label: t.tier_label,
      description: t.description, users: t.users, exclusions: [...t.exclusions],
      target_apps: t.target_apps, conditions: [...t.conditions],
      grant_controls: [...t.grant_controls], grant_operator: t.grant_operator || 'OR',
      session_controls: [...t.session_controls], source: 'template'
    });
    savePolicies();
    updateBadge();
    showToast(`✅ Added: ${t.name}`);
  }

  /* ═══════════════════════════════════════════════════════
     BUILD TAB — 7 Step Wizard
     ═══════════════════════════════════════════════════════ */
  const WIZARD_STEPS = [
    { title: 'Name & Intent', render: renderStepName },
    { title: 'Who — Users & Groups', render: renderStepWho },
    { title: 'What — Target Apps', render: renderStepWhat },
    { title: 'When/Where — Conditions', render: renderStepConditions },
    { title: 'Then — Grant Controls', render: renderStepGrant },
    { title: 'Session Controls', render: renderStepSession },
    { title: 'Review & Add', render: renderStepSummary }
  ];

  function resetWizardData() {
    return {
      name: '', intent: '', users: 'all-users', userRoles: [], excludeBreakglass: true,
      excludeServiceAccounts: false, targetApp: 'all-cloud-apps', targetCustom: '',
      conditions: { platforms: [], locations: 'any', clientApps: [], signinRisk: [], userRisk: [], deviceFilter: '' },
      grantType: 'grant', grantControls: [], grantOperator: 'OR',
      session: { frequency: '', persistent: '', appEnforced: false, mcas: '' }
    };
  }

  function renderWizard() {
    const fill = $('#cab-wizard-fill');
    const label = $('#cab-wizard-step-label');
    const content = $('#cab-wizard-content');
    const prevBtn = $('#cab-wizard-prev');
    const nextBtn = $('#cab-wizard-next');
    if (!fill || !content) return;

    fill.style.width = ((wizardStep + 1) / WIZARD_STEPS.length * 100) + '%';
    label.textContent = `Step ${wizardStep + 1} of ${WIZARD_STEPS.length} — ${WIZARD_STEPS[wizardStep].title}`;
    prevBtn.disabled = wizardStep === 0;
    nextBtn.textContent = wizardStep === WIZARD_STEPS.length - 1 ? '✅ Add to My Set' : 'Next →';

    WIZARD_STEPS[wizardStep].render(content);
    updateBuildPreview();
  }

  if ($('#cab-wizard-next')) {
    $('#cab-wizard-next').addEventListener('click', () => {
      if (wizardStep < WIZARD_STEPS.length - 1) { wizardStep++; renderWizard(); }
      else { addCustomPolicy(); }
    });
    $('#cab-wizard-prev').addEventListener('click', () => {
      if (wizardStep > 0) { wizardStep--; renderWizard(); }
    });
  }

  /* ── Step Renderers ── */
  function renderStepName(el) {
    el.innerHTML = `
      <div class="cab-form-group">
        <label class="cab-form-label">Policy Name</label>
        <span class="cab-form-hint">What should this policy be called? E.g. "Require MFA for Finance Team"</span>
        <input class="cab-form-input" id="wiz-name" value="${esc(wizardData.name)}" placeholder="Enter a descriptive policy name...">
      </div>
      <div class="cab-form-group">
        <label class="cab-form-label">What are you protecting? (Intent)</label>
        <span class="cab-form-hint">Brief description of the security goal</span>
        <textarea class="cab-form-textarea" id="wiz-intent" placeholder="E.g. Ensure all users complete MFA before accessing corporate resources...">${esc(wizardData.intent)}</textarea>
      </div>
    `;
    bind('wiz-name', 'input', e => { wizardData.name = e.target.value; updateBuildPreview(); });
    bind('wiz-intent', 'input', e => { wizardData.intent = e.target.value; updateBuildPreview(); });
  }

  function renderStepWho(el) {
    const userTypes = CONDITIONS.user_types || [];
    el.innerHTML = `
      <div class="cab-form-group">
        <label class="cab-form-label">Assign to</label>
        <div class="cab-check-group">
          ${userTypes.map(u => `
            <div class="cab-check-item">
              <input type="radio" name="wiz-users" id="wiz-u-${u.id}" value="${u.id}" ${wizardData.users === u.id ? 'checked' : ''}>
              <label for="wiz-u-${u.id}">${u.label}</label>
              <span class="cab-check-desc">${u.description}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="cab-form-group">
        <label class="cab-form-label">Exclusions</label>
        <div class="cab-check-group">
          <div class="cab-check-item">
            <input type="checkbox" id="wiz-excl-bg" ${wizardData.excludeBreakglass ? 'checked' : ''}>
            <label for="wiz-excl-bg">Exclude break-glass emergency access accounts</label>
          </div>
          <div class="cab-check-item">
            <input type="checkbox" id="wiz-excl-sa" ${wizardData.excludeServiceAccounts ? 'checked' : ''}>
            <label for="wiz-excl-sa">Exclude service accounts</label>
          </div>
        </div>
      </div>
    `;
    $$('input[name="wiz-users"]').forEach(r => r.addEventListener('change', e => { wizardData.users = e.target.value; updateBuildPreview(); }));
    bind('wiz-excl-bg', 'change', e => { wizardData.excludeBreakglass = e.target.checked; updateBuildPreview(); });
    bind('wiz-excl-sa', 'change', e => { wizardData.excludeServiceAccounts = e.target.checked; updateBuildPreview(); });
  }

  function renderStepWhat(el) {
    const apps = CONDITIONS.target_apps || [];
    const actions = CONDITIONS.target_actions || [];
    el.innerHTML = `
      <div class="cab-form-group">
        <label class="cab-form-label">Target resources</label>
        <div class="cab-check-group">
          ${apps.map(a => `
            <div class="cab-check-item">
              <input type="radio" name="wiz-app" id="wiz-a-${a.id}" value="${a.id}" ${wizardData.targetApp === a.id ? 'checked' : ''}>
              <label for="wiz-a-${a.id}">${a.label}</label>
              <span class="cab-check-desc">${a.description}</span>
            </div>
          `).join('')}
          ${actions.map(a => `
            <div class="cab-check-item">
              <input type="radio" name="wiz-app" id="wiz-a-${a.id}" value="${a.id}" ${wizardData.targetApp === a.id ? 'checked' : ''}>
              <label for="wiz-a-${a.id}">📋 ${a.label}</label>
              <span class="cab-check-desc">${a.description}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    $$('input[name="wiz-app"]').forEach(r => r.addEventListener('change', e => { wizardData.targetApp = e.target.value; updateBuildPreview(); }));
  }

  function renderStepConditions(el) {
    const conds = CONDITIONS.conditions || [];
    el.innerHTML = `
      <div class="cab-form-group">
        <label class="cab-form-label">Conditions (optional — leave blank for "any")</label>
        <span class="cab-form-hint">Select conditions to narrow when this policy applies.</span>
        ${conds.map(c => `
          <details class="cab-cond-detail" style="margin-bottom:0.75rem">
            <summary style="cursor:pointer;padding:0.5rem;background:rgba(255,255,255,0.03);border-radius:6px;font-size:0.9rem;color:#fff">
              ${c.label} ${c.requires ? `<span style="font-size:0.75rem;color:#F59E0B">(${c.requires})</span>` : ''}
            </summary>
            <div class="cab-check-group" style="padding:0.5rem 0 0 1rem">
              ${c.options.map(o => `
                <div class="cab-check-item">
                  <input type="checkbox" class="wiz-cond" data-cond="${c.id}" value="${o}" ${isCondChecked(c.id, o) ? 'checked' : ''}>
                  <label>${o}</label>
                </div>
              `).join('')}
            </div>
          </details>
        `).join('')}
      </div>
    `;
    $$('.wiz-cond').forEach(cb => cb.addEventListener('change', () => {
      syncConditions();
      updateBuildPreview();
    }));
  }

  function isCondChecked(condId, option) {
    if (condId === 'device-platform') return wizardData.conditions.platforms.includes(option);
    if (condId === 'client-apps') return wizardData.conditions.clientApps.includes(option);
    if (condId === 'sign-in-risk') return wizardData.conditions.signinRisk.includes(option);
    if (condId === 'user-risk') return wizardData.conditions.userRisk.includes(option);
    return false;
  }

  function syncConditions() {
    wizardData.conditions.platforms = getCheckedValues('device-platform');
    wizardData.conditions.clientApps = getCheckedValues('client-apps');
    wizardData.conditions.signinRisk = getCheckedValues('sign-in-risk');
    wizardData.conditions.userRisk = getCheckedValues('user-risk');
    const locRadio = document.querySelector('.wiz-cond[data-cond="locations"]:checked');
    if (locRadio) wizardData.conditions.locations = locRadio.value;
    const devFilter = document.querySelector('.wiz-cond[data-cond="device-filter"]:checked');
    if (devFilter) wizardData.conditions.deviceFilter = devFilter.value;
  }

  function getCheckedValues(condId) {
    return [...$$('.wiz-cond[data-cond="' + condId + '"]:checked')].map(c => c.value);
  }

  function renderStepGrant(el) {
    const controls = (CONDITIONS.grant_controls || []).filter(c => !c.is_block);
    el.innerHTML = `
      <div class="cab-form-group">
        <label class="cab-form-label">Access decision</label>
        <div style="display:flex;gap:0.75rem;flex-wrap:wrap">
          <div class="cab-radio-card ${wizardData.grantType === 'block' ? 'cab-radio-card--selected' : ''}" onclick="window.__cab.setGrantType('block')">
            <span class="cab-radio-card__icon">🚫</span>
            <div><strong>Block access</strong><br><small style="color:var(--cab-text-dim)">Completely prevent access</small></div>
          </div>
          <div class="cab-radio-card ${wizardData.grantType === 'grant' ? 'cab-radio-card--selected' : ''}" onclick="window.__cab.setGrantType('grant')">
            <span class="cab-radio-card__icon">✅</span>
            <div><strong>Grant access with controls</strong><br><small style="color:var(--cab-text-dim)">Allow if conditions are met</small></div>
          </div>
        </div>
      </div>
      <div id="wiz-grant-controls" style="${wizardData.grantType === 'block' ? 'display:none' : ''}">
        <div class="cab-form-group">
          <label class="cab-form-label">Required controls</label>
          <div class="cab-check-group">
            ${controls.map(c => `
              <div class="cab-check-item">
                <input type="checkbox" class="wiz-gc" value="${c.id}" ${wizardData.grantControls.includes(c.id) ? 'checked' : ''}>
                <label>${c.label}</label>
                ${c.requires ? `<span class="cab-check-desc" style="color:#F59E0B">${c.requires}</span>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
        <div class="cab-form-group">
          <label class="cab-form-label">When multiple controls selected</label>
          <div class="cab-operator-toggle">
            <button class="cab-operator-btn ${wizardData.grantOperator === 'AND' ? 'cab-operator-btn--active' : ''}" onclick="window.__cab.setOperator('AND')">Require ALL (AND)</button>
            <button class="cab-operator-btn ${wizardData.grantOperator === 'OR' ? 'cab-operator-btn--active' : ''}" onclick="window.__cab.setOperator('OR')">Require ONE (OR)</button>
          </div>
        </div>
      </div>
    `;
    $$('.wiz-gc').forEach(cb => cb.addEventListener('change', () => {
      wizardData.grantControls = [...$$('.wiz-gc:checked')].map(c => c.value);
      updateBuildPreview();
    }));
  }

  function renderStepSession(el) {
    const sc = CONDITIONS.session_controls || [];
    el.innerHTML = `
      <div class="cab-form-group">
        <label class="cab-form-label">Session controls (optional)</label>
        <span class="cab-form-hint">Control how long sessions last and what users can do.</span>
        ${sc.map(s => `
          <div style="margin-bottom:0.75rem">
            <label class="cab-form-label" style="font-size:0.85rem">${s.label} ${s.requires ? `<span style="color:#F59E0B;font-size:0.75rem">(${s.requires})</span>` : ''}</label>
            <p style="font-size:0.8rem;color:var(--cab-text-dim);margin:0 0 0.4rem">${s.description}</p>
            <select class="cab-form-select wiz-session" data-sc="${s.id}" style="max-width:300px">
              <option value="">— Not configured —</option>
              ${s.options.map(o => `<option value="${o}" ${getSessionVal(s.id) === o ? 'selected' : ''}>${o}</option>`).join('')}
            </select>
          </div>
        `).join('')}
      </div>
    `;
    $$('.wiz-session').forEach(sel => sel.addEventListener('change', () => {
      syncSession();
      updateBuildPreview();
    }));
  }

  function getSessionVal(id) {
    if (id === 'sign-in-frequency') return wizardData.session.frequency;
    if (id === 'persistent-browser') return wizardData.session.persistent;
    if (id === 'mcas') return wizardData.session.mcas;
    return '';
  }

  function syncSession() {
    $$('.wiz-session').forEach(sel => {
      const id = sel.dataset.sc;
      if (id === 'sign-in-frequency') wizardData.session.frequency = sel.value;
      if (id === 'persistent-browser') wizardData.session.persistent = sel.value;
      if (id === 'app-enforced') wizardData.session.appEnforced = sel.value === 'Enabled';
      if (id === 'mcas') wizardData.session.mcas = sel.value;
    });
  }

  function renderStepSummary(el) {
    const p = buildPolicyFromWizard();
    el.innerHTML = `
      <h3 style="margin:0 0 1rem">📋 Policy Summary</h3>
      ${renderPolicyCardHTML(p)}
      <p style="margin-top:1rem;color:var(--cab-text-dim);font-size:0.85rem">
        Click <strong>"✅ Add to My Set"</strong> below to add this policy to your set. You can then review and export it.
      </p>
    `;
  }

  function buildPolicyFromWizard() {
    const d = wizardData;
    const userLabel = (CONDITIONS.user_types || []).find(u => u.id === d.users);
    const appLabel = [...(CONDITIONS.target_apps || []), ...(CONDITIONS.target_actions || [])].find(a => a.id === d.targetApp);
    const exclusions = [];
    if (d.excludeBreakglass) exclusions.push('Break-glass emergency access accounts');
    if (d.excludeServiceAccounts) exclusions.push('Service accounts');

    const conditions = [];
    if (d.conditions.platforms.length) conditions.push('Platforms: ' + d.conditions.platforms.join(', '));
    if (d.conditions.clientApps.length) conditions.push('Client apps: ' + d.conditions.clientApps.join(', '));
    if (d.conditions.signinRisk.length) conditions.push('Sign-in risk: ' + d.conditions.signinRisk.join(', '));
    if (d.conditions.userRisk.length) conditions.push('User risk: ' + d.conditions.userRisk.join(', '));
    if (d.conditions.deviceFilter) conditions.push('Device filter: ' + d.conditions.deviceFilter);

    const grantControls = d.grantType === 'block' ? ['Block access'] :
      d.grantControls.map(id => {
        const c = (CONDITIONS.grant_controls || []).find(gc => gc.id === id);
        return c ? c.label : id;
      });

    const sessionControls = [];
    if (d.session.frequency) sessionControls.push('Sign-in frequency: ' + d.session.frequency);
    if (d.session.persistent) sessionControls.push('Persistent browser: ' + d.session.persistent);
    if (d.session.appEnforced) sessionControls.push('App enforced restrictions');
    if (d.session.mcas) sessionControls.push('MCAS: ' + d.session.mcas);

    return {
      id: 'custom-' + Date.now(),
      name: d.name || 'Untitled Policy',
      tier: 'custom', tier_label: 'Custom',
      description: d.intent || '',
      users: userLabel ? userLabel.label : d.users,
      exclusions, target_apps: appLabel ? appLabel.label : d.targetApp,
      conditions, grant_controls: grantControls,
      grant_operator: d.grantOperator,
      session_controls: sessionControls, source: 'custom'
    };
  }

  function addCustomPolicy() {
    const p = buildPolicyFromWizard();
    if (!p.name || p.name === 'Untitled Policy') { showToast('⚠️ Please enter a policy name'); wizardStep = 0; renderWizard(); return; }
    policySet.push(p);
    savePolicies();
    updateBadge();
    showToast(`✅ Added: ${p.name}`);
    wizardData = resetWizardData();
    wizardStep = 0;
    renderWizard();
    $('[data-tab="review"]').click();
  }

  function updateBuildPreview() {
    const card = $('#cab-build-preview-card');
    if (!card) return;
    const p = buildPolicyFromWizard();
    if (!p.name && !p.description && p.grant_controls.length === 0) {
      card.innerHTML = '<p class="cab-preview-empty">Start filling in the wizard to see your policy preview here.</p>';
    } else {
      card.innerHTML = renderPolicyCardHTML(p, false);
    }
  }

  /* ═══════════════════════════════════════════════════════
     REVIEW TAB
     ═══════════════════════════════════════════════════════ */
  function renderReview() {
    const empty = $('#cab-review-empty');
    const dash = $('#cab-review-dashboard');
    if (!empty || !dash) return;

    if (policySet.length === 0) { empty.style.display = ''; dash.style.display = 'none'; return; }
    empty.style.display = 'none'; dash.style.display = '';

    renderZTScore();
    renderLinter();
    renderReviewPolicies();
  }

  function renderZTScore() {
    const sp = countTier('starting-point');
    const ent = countTier('enterprise');
    const spec = countTier('specialised');
    const spMax = 6, entMax = 8, specMax = 6;
    const spScore = Math.min(sp / spMax, 1) * 40;
    const entScore = Math.min(ent / entMax, 1) * 35;
    const specScore = Math.min(spec / specMax, 1) * 25;
    const total = Math.round(spScore + entScore + specScore);

    // Ring animation
    const ring = $('#cab-zt-ring-fill');
    const numEl = $('#cab-zt-score-num');
    if (ring) {
      const circ = 2 * Math.PI * 52;
      ring.style.strokeDashoffset = circ - (total / 100) * circ;
    }
    if (numEl) numEl.textContent = total;

    // Tier label
    const tierLabel = $('#cab-zt-tier-label');
    const tierDesc = $('#cab-zt-tier-desc');
    if (total >= 86) { tierLabel.textContent = '🌟 Comprehensive'; tierDesc.textContent = 'Excellent Zero Trust baseline alignment.'; }
    else if (total >= 71) { tierLabel.textContent = '🟢 Strong'; tierDesc.textContent = 'Covers most Microsoft recommendations.'; }
    else if (total >= 51) { tierLabel.textContent = '🟡 Developing'; tierDesc.textContent = 'Good foundation — gaps in advanced controls.'; }
    else if (total >= 31) { tierLabel.textContent = '🟠 Basic'; tierDesc.textContent = 'Starting Point only — needs Enterprise controls.'; }
    else { tierLabel.textContent = '🔴 Minimal'; tierDesc.textContent = 'Critical gaps — add more policies.'; }

    // Bars
    setBar('cab-zt-bar-sp', sp / spMax * 100, 'cab-zt-val-sp', `${sp}/${spMax}`);
    setBar('cab-zt-bar-ent', ent / entMax * 100, 'cab-zt-val-ent', `${ent}/${entMax}`);
    setBar('cab-zt-bar-spec', spec / specMax * 100, 'cab-zt-val-spec', `${spec}/${specMax}`);
  }

  function setBar(barId, pct, valId, text) {
    const bar = $('#' + barId); const val = $('#' + valId);
    if (bar) bar.style.width = Math.min(pct, 100) + '%';
    if (val) val.textContent = text;
  }

  function countTier(tier) {
    // Count unique template IDs matching tier
    const tplIds = TEMPLATES.filter(t => t.tier === tier).map(t => t.id);
    return policySet.filter(p => tplIds.includes(p.id)).length;
  }

  /* ── Safety Linter (8 checks) ── */
  function renderLinter() {
    const el = $('#cab-linter-results');
    if (!el) return;
    const checks = runLinter();
    el.innerHTML = checks.map(c => `
      <div class="cab-linter-item cab-linter-item--${c.level}">
        <span class="cab-linter-icon">${c.icon}</span>
        <span class="cab-linter-text"><strong>${c.title}</strong> — ${c.message}</span>
      </div>
    `).join('');
  }

  function runLinter() {
    const results = [];
    const allGrants = policySet.flatMap(p => p.grant_controls);
    const allUsers = policySet.map(p => p.users);
    const hasBreakglass = policySet.some(p => p.exclusions && p.exclusions.some(e => e.toLowerCase().includes('break-glass') || e.toLowerCase().includes('emergency')));
    const hasLegacyBlock = policySet.some(p => p.conditions && p.conditions.some(c => c.toLowerCase().includes('activesync') || c.toLowerCase().includes('other clients')));
    const hasAdminMFA = policySet.some(p => p.users && p.users.toLowerCase().includes('admin') && p.grant_controls.some(g => g.toLowerCase().includes('mfa') || g.toLowerCase().includes('multifactor')));
    const hasBlockAll = policySet.some(p => p.grant_controls.includes('Block access') && p.target_apps === 'All cloud apps' && p.users.includes('All users'));
    const hasMFA = allGrants.some(g => g.toLowerCase().includes('mfa') || g.toLowerCase().includes('multifactor'));
    const azureMgmt = policySet.some(p => p.target_apps && p.target_apps.toLowerCase().includes('azure'));

    // 1. Break-glass
    if (!hasBreakglass) results.push({ level: 'critical', icon: '🔴', title: 'No break-glass exclusion', message: 'No policy excludes emergency access accounts. You risk locking out ALL users including admins.' });
    else results.push({ level: 'pass', icon: '✅', title: 'Break-glass accounts excluded', message: 'At least one policy excludes emergency access accounts.' });

    // 2. Admin lockout
    if (hasBlockAll && !hasBreakglass) results.push({ level: 'critical', icon: '🔴', title: 'Admin lockout risk', message: 'A block policy targets all users + all apps with no break-glass exclusion. This WILL lock out admins.' });

    // 3. Overly broad block
    if (hasBlockAll) results.push({ level: 'warning', icon: '🟠', title: 'Broad block policy detected', message: 'A policy blocks all users from all cloud apps. Verify conditions narrow the scope (e.g. legacy auth only).' });

    // 4. Report-only recommendation
    results.push({ level: 'info', icon: '🔵', title: 'Deploy in Report-Only first', message: 'Always create new policies in Report-Only mode. Monitor sign-in logs for 1-2 weeks before enabling.' });

    // 5. Conflict detection
    const blocks = policySet.filter(p => p.grant_controls.includes('Block access'));
    const grants = policySet.filter(p => !p.grant_controls.includes('Block access'));
    blocks.forEach(bp => {
      grants.forEach(gp => {
        if (bp.users === gp.users && bp.target_apps === gp.target_apps) {
          results.push({ level: 'warning', icon: '🟠', title: 'Potential conflict', message: `"${bp.name}" blocks and "${gp.name}" grants for same users/apps. Block wins — the grant policy may never apply.` });
        }
      });
    });

    // 6. Coverage gaps
    if (!azureMgmt) results.push({ level: 'info', icon: '🔵', title: 'Azure Management not protected', message: 'No policy targets Azure portal/CLI/PowerShell. Consider adding protection for admin infrastructure access.' });

    // 7. Legacy auth
    if (!hasLegacyBlock) results.push({ level: 'warning', icon: '🟠', title: 'Legacy authentication not blocked', message: 'No policy blocks legacy protocols (IMAP, POP3, SMTP). These bypass MFA and are the #1 password spray vector.' });
    else results.push({ level: 'pass', icon: '✅', title: 'Legacy auth blocked', message: 'Your set includes a policy blocking legacy authentication protocols.' });

    // 8. Admin MFA
    if (!hasAdminMFA) results.push({ level: 'critical', icon: '🔴', title: 'No MFA for admins', message: 'No policy specifically requires MFA for admin roles. Admins are the highest-value targets.' });
    else results.push({ level: 'pass', icon: '✅', title: 'Admin MFA enforced', message: 'Your set includes MFA requirement for administrative roles.' });

    return results;
  }

  function renderReviewPolicies() {
    const grid = $('#cab-review-grid');
    const count = $('#cab-review-count');
    if (!grid) return;
    count.textContent = policySet.length;
    grid.innerHTML = policySet.map((p, i) => `
      <div class="cab-policy-card">
        ${renderPolicyCardHTML(p, false)}
        <div class="cab-policy-card__actions" style="margin-top:0.75rem">
          <button class="cab-btn cab-btn--danger cab-btn--sm" onclick="window.__cab.removePolicy(${i})">🗑️ Remove</button>
        </div>
      </div>
    `).join('');
  }

  /* ═══════════════════════════════════════════════════════
     EXPORT TAB
     ═══════════════════════════════════════════════════════ */
  function renderExport() {
    const empty = $('#cab-export-empty');
    const dash = $('#cab-export-dashboard');
    if (!empty || !dash) return;
    if (policySet.length === 0) { empty.style.display = ''; dash.style.display = 'none'; return; }
    empty.style.display = 'none'; dash.style.display = '';
    renderExportContent();
  }

  $$('.cab-export-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.cab-export-tab').forEach(t => t.classList.remove('cab-export-tab--active'));
      tab.classList.add('cab-export-tab--active');
      currentExportFormat = tab.dataset.format;
      renderExportContent();
    });
  });

  function renderExportContent() {
    const output = $('#cab-export-output');
    if (!output) return;
    switch (currentExportFormat) {
      case 'powershell': output.textContent = generatePowerShell(); break;
      case 'json': output.textContent = generateGraphJSON(); break;
      case 'csv': output.textContent = generateCSV(); break;
      case 'docs': output.textContent = generateDocs(); break;
      case 'rollout': output.textContent = generateRollout(); break;
    }
  }

  function generatePowerShell() {
    let ps = `# ═══════════════════════════════════════════════════════\n# Conditional Access Policies — PowerShell Deployment\n# Generated by CA Policy Builder (aguidetocloud.com/ca-builder)\n# ⚠️ DEPLOY IN REPORT-ONLY MODE FIRST\n# ═══════════════════════════════════════════════════════\n\n# Prerequisites\n# Install-Module Microsoft.Graph -Scope CurrentUser\n# Connect-MgGraph -Scopes "Policy.ReadWrite.ConditionalAccess"\n\n`;
    policySet.forEach((p, i) => {
      const num = String(i + 1).padStart(3, '0');
      const nameConv = `CA${num}-${tierShort(p.tier)}-${slugify(p.name)}`;
      const isBlock = p.grant_controls.includes('Block access');
      ps += `# ── Policy ${i + 1}: ${p.name} ──\n`;
      ps += `$params${i + 1} = @{\n`;
      ps += `    DisplayName = "${nameConv}"\n`;
      ps += `    State = "enabledForReportingButNotEnforced"  # Report-Only first!\n`;
      ps += `    Conditions = @{\n`;
      ps += `        Users = @{\n`;
      ps += `            IncludeUsers = @("All")\n`;
      if (p.exclusions && p.exclusions.length) ps += `            # ExcludeGroups = @("<break-glass-group-id>")  # TODO: Add your break-glass group ID\n`;
      ps += `        }\n`;
      ps += `        Applications = @{\n`;
      if (p.target_apps === 'All cloud apps') ps += `            IncludeApplications = @("All")\n`;
      else if (p.target_apps === 'Office 365') ps += `            IncludeApplications = @("Office365")\n`;
      else if (p.target_apps.includes('Azure')) ps += `            IncludeApplications = @("797f4846-ba00-4fd7-ba43-dac1f8f63013")\n`;
      else ps += `            IncludeApplications = @("All")  # TODO: Replace with specific app IDs\n`;
      ps += `        }\n`;
      if (p.conditions && p.conditions.length) {
        p.conditions.forEach(c => { ps += `        # Condition: ${c}\n`; });
      }
      ps += `    }\n`;
      ps += `    GrantControls = @{\n`;
      if (isBlock) {
        ps += `        BuiltInControls = @("block")\n`;
        ps += `        Operator = "OR"\n`;
      } else {
        const controls = p.grant_controls.map(g => {
          if (g.toLowerCase().includes('mfa') || g.toLowerCase().includes('multifactor')) return 'mfa';
          if (g.toLowerCase().includes('compliant')) return 'compliantDevice';
          if (g.toLowerCase().includes('hybrid')) return 'domainJoinedDevice';
          if (g.toLowerCase().includes('approved')) return 'approvedApplication';
          if (g.toLowerCase().includes('protection')) return 'compliantApplication';
          if (g.toLowerCase().includes('password')) return 'passwordChange';
          if (g.toLowerCase().includes('terms')) return 'termsOfUse';
          return 'mfa';
        });
        ps += `        BuiltInControls = @(${controls.map(c => `"${c}"`).join(', ')})\n`;
        ps += `        Operator = "${p.grant_operator || 'OR'}"\n`;
      }
      ps += `    }\n`;
      if (p.session_controls && p.session_controls.length) {
        ps += `    SessionControls = @{\n`;
        p.session_controls.forEach(s => { ps += `        # ${s}\n`; });
        ps += `    }\n`;
      }
      ps += `}\nNew-MgIdentityConditionalAccessPolicy -BodyParameter $params${i + 1}\n\n`;
    });
    return ps;
  }

  function generateGraphJSON() {
    const policies = policySet.map((p, i) => {
      const num = String(i + 1).padStart(3, '0');
      const isBlock = p.grant_controls.includes('Block access');
      return {
        displayName: `CA${num}-${tierShort(p.tier)}-${slugify(p.name)}`,
        state: 'enabledForReportingButNotEnforced',
        conditions: {
          users: { includeUsers: ['All'], excludeGroups: ['<break-glass-group-id>'] },
          applications: { includeApplications: p.target_apps === 'All cloud apps' ? ['All'] : p.target_apps === 'Office 365' ? ['Office365'] : ['All'] }
        },
        grantControls: {
          operator: isBlock ? 'OR' : (p.grant_operator || 'OR'),
          builtInControls: isBlock ? ['block'] : p.grant_controls.map(mapControl)
        }
      };
    });
    return `// Graph API JSON — POST to /identity/conditionalAccess/policies\n// ⚠️ Deploy in Report-Only mode first!\n\n` + JSON.stringify(policies, null, 2);
  }

  function mapControl(g) {
    if (g.toLowerCase().includes('mfa') || g.toLowerCase().includes('multifactor')) return 'mfa';
    if (g.toLowerCase().includes('compliant')) return 'compliantDevice';
    if (g.toLowerCase().includes('hybrid')) return 'domainJoinedDevice';
    if (g.toLowerCase().includes('approved')) return 'approvedApplication';
    if (g.toLowerCase().includes('protection')) return 'compliantApplication';
    return 'mfa';
  }

  function generateCSV() {
    let csv = 'Policy Name,Tier,Users,Target Apps,Conditions,Grant Controls,Session Controls,Exclusions\n';
    policySet.forEach(p => {
      csv += `"${p.name}","${p.tier_label}","${p.users}","${p.target_apps}","${(p.conditions || []).join('; ')}","${p.grant_controls.join('; ')}","${(p.session_controls || []).join('; ')}","${(p.exclusions || []).join('; ')}"\n`;
    });
    return csv;
  }

  function generateDocs() {
    let doc = `CONDITIONAL ACCESS POLICY DOCUMENTATION\n${'═'.repeat(45)}\nGenerated: ${new Date().toLocaleDateString()}\nTotal Policies: ${policySet.length}\nSource: CA Policy Builder (aguidetocloud.com/ca-builder)\n\n`;
    policySet.forEach((p, i) => {
      doc += `${'─'.repeat(45)}\nPOLICY ${i + 1}: ${p.name}\n${'─'.repeat(45)}\n`;
      doc += `Tier:             ${p.tier_label}\n`;
      doc += `Description:      ${p.description || 'N/A'}\n`;
      doc += `Users:            ${p.users}\n`;
      doc += `Exclusions:       ${(p.exclusions || []).join(', ') || 'None'}\n`;
      doc += `Target Apps:      ${p.target_apps}\n`;
      doc += `Conditions:       ${(p.conditions || []).join(', ') || 'None'}\n`;
      doc += `Grant Controls:   ${p.grant_controls.join(` ${p.grant_operator || 'OR'} `)}\n`;
      doc += `Session Controls: ${(p.session_controls || []).join(', ') || 'None'}\n\n`;
    });
    return doc;
  }

  function generateRollout() {
    return `CONDITIONAL ACCESS ROLLOUT PLAN\n${'═'.repeat(40)}\n\n` +
      `⚠️  CRITICAL: Follow this sequence to avoid lockouts.\n\n` +
      `PHASE 1: PREPARATION (Week 1)\n${'─'.repeat(40)}\n` +
      `□ Create 2 break-glass emergency access accounts (cloud-only, Global Admin)\n` +
      `□ Configure break-glass accounts with phishing-resistant MFA (FIDO2)\n` +
      `□ Create a security group for break-glass accounts\n` +
      `□ Document break-glass credentials securely (split knowledge)\n` +
      `□ Test break-glass sign-in works\n\n` +
      `PHASE 2: REPORT-ONLY (Weeks 2-3)\n${'─'.repeat(40)}\n` +
      policySet.map((p, i) => `□ Create "${p.name}" in REPORT-ONLY mode\n`).join('') +
      `□ Monitor sign-in logs daily for unexpected blocks\n` +
      `□ Check Report-Only insights in Entra portal\n` +
      `□ Document any policies that need adjustment\n\n` +
      `PHASE 3: PILOT (Weeks 4-5)\n${'─'.repeat(40)}\n` +
      `□ Create a "CA Pilot Users" security group (10-20 tech-savvy users)\n` +
      `□ Enable policies for pilot group only (change assignment from All Users)\n` +
      `□ Collect feedback from pilot users\n` +
      `□ Verify no service disruptions\n\n` +
      `PHASE 4: BROAD DEPLOYMENT (Week 6+)\n${'─'.repeat(40)}\n` +
      `□ Expand policies to all users (one policy at a time)\n` +
      `□ Start with least disruptive policies first:\n` +
      policySet.filter(p => p.tier === 'starting-point').map(p => `  1. ${p.name}\n`).join('') +
      policySet.filter(p => p.tier === 'enterprise').map(p => `  2. ${p.name}\n`).join('') +
      policySet.filter(p => p.tier === 'specialised' || p.tier === 'custom').map(p => `  3. ${p.name}\n`).join('') +
      `□ Monitor sign-in logs after each policy enablement\n` +
      `□ Have break-glass procedure ready\n\n` +
      `PHASE 5: ONGOING\n${'─'.repeat(40)}\n` +
      `□ Review policies quarterly\n` +
      `□ Test break-glass accounts monthly\n` +
      `□ Update policies when new features are available\n` +
      `□ Monitor Entra ID sign-in logs for policy hits\n`;
  }

  /* Export buttons */
  if ($('#cab-export-copy')) {
    $('#cab-export-copy').addEventListener('click', () => {
      const text = $('#cab-export-output').textContent;
      navigator.clipboard.writeText(text).then(() => showToast('📋 Copied to clipboard'));
    });
  }
  if ($('#cab-export-download')) {
    $('#cab-export-download').addEventListener('click', () => {
      const text = $('#cab-export-output').textContent;
      const ext = { powershell: 'ps1', json: 'json', csv: 'csv', docs: 'txt', rollout: 'txt' };
      const blob = new Blob([text], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `ca-policies.${ext[currentExportFormat] || 'txt'}`;
      a.click();
      URL.revokeObjectURL(a.href);
    });
  }

  /* ═══════════════════════════════════════════════════════
     SHARED HELPERS
     ═══════════════════════════════════════════════════════ */
  function renderPolicyCardHTML(p, showActions = false) {
    return `
      <div class="cab-policy-card__header">
        <h4 class="cab-policy-card__name">${esc(p.name || 'Untitled')}</h4>
        <span class="cab-tier-badge cab-tier-badge--${tierClass(p.tier)}">${p.tier_label || 'Custom'}</span>
      </div>
      ${p.description ? `<p class="cab-policy-card__desc">${esc(p.description)}</p>` : ''}
      <div class="cab-policy-card__details">
        <div class="cab-detail-row"><span class="cab-detail-label">👥 Users</span><span class="cab-detail-value">${esc(p.users || 'Not set')}</span></div>
        <div class="cab-detail-row"><span class="cab-detail-label">🎯 Target</span><span class="cab-detail-value">${esc(p.target_apps || 'Not set')}</span></div>
        ${(p.conditions || []).length ? `<div class="cab-detail-row"><span class="cab-detail-label">📋 Conditions</span><span class="cab-detail-value">${esc(p.conditions.join(', '))}</span></div>` : ''}
        <div class="cab-detail-row"><span class="cab-detail-label">✅ Controls</span><span class="cab-detail-value">${esc((p.grant_controls || []).join(` ${p.grant_operator || 'OR'} `))}</span></div>
        ${(p.session_controls || []).length ? `<div class="cab-detail-row"><span class="cab-detail-label">⏱️ Session</span><span class="cab-detail-value">${esc(p.session_controls.join(', '))}</span></div>` : ''}
        ${(p.exclusions || []).length ? `<div class="cab-detail-row"><span class="cab-detail-label">🚫 Excludes</span><span class="cab-detail-value">${esc(p.exclusions.join(', '))}</span></div>` : ''}
      </div>
    `;
  }

  function esc(s) { if (!s) return ''; const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  function bind(id, event, handler) {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, handler);
  }

  function tierShort(tier) {
    if (tier === 'starting-point') return 'SP';
    if (tier === 'enterprise') return 'ENT';
    if (tier === 'specialised') return 'SPEC';
    return 'CUST';
  }

  function slugify(s) { return (s || '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 30); }

  /* ── localStorage ── */
  function savePolicies() { try { localStorage.setItem(LS_KEY, JSON.stringify(policySet)); } catch (e) {} }
  function loadPolicies() { try { const d = localStorage.getItem(LS_KEY); return d ? JSON.parse(d) : []; } catch (e) { return []; } }

  function removePolicy(index) {
    policySet.splice(index, 1);
    savePolicies();
    updateBadge();
    renderReview();
    showToast('🗑️ Policy removed');
  }

  /* ── Badge ── */
  function updateBadge() {
    const badge = $('#cab-policy-count');
    if (badge) {
      badge.textContent = policySet.length;
      badge.style.display = policySet.length > 0 ? 'inline-flex' : 'none';
    }
  }

  /* ── Toast ── */
  function showToast(msg) {
    let toast = $('.cab-toast');
    if (!toast) { toast = document.createElement('div'); toast.className = 'cab-toast'; document.body.appendChild(toast); }
    toast.textContent = msg;
    toast.classList.add('cab-toast--show');
    setTimeout(() => toast.classList.remove('cab-toast--show'), 2500);
  }

  /* ── Grant type toggle ── */
  function setGrantType(type) {
    wizardData.grantType = type;
    renderWizard();
  }
  function setOperator(op) {
    wizardData.grantOperator = op;
    renderWizard();
  }

  /* ── URL State ── */
  function updateURL() {
    const activeTab = $('.cab-tab--active');
    if (activeTab) {
      const url = new URL(window.location);
      url.searchParams.set('tab', activeTab.dataset.tab);
      history.replaceState(null, '', url);
    }
  }

  function restoreURL() {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) {
      const tabBtn = $(`.cab-tab[data-tab="${tab}"]`);
      if (tabBtn) tabBtn.click();
    }
  }

  /* ── Clarity tracking ── */
  function trackEvent(name) { if (window.clarity) window.clarity('event', 'cab_' + name); }

  /* ── Expose to global for onclick handlers ── */
  window.__cab = { addTemplate, removePolicy, setGrantType, setOperator };

  /* ── Init ── */
  renderTemplates();
  renderWizard();
  updateBadge();
  restoreURL();
  trackEvent('load');
})();
