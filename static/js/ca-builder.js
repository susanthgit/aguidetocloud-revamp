/* ═══════════════════════════════════════════════════════
   CA Policy Builder — ca-builder.js  v2 (21 UX fixes)
   100% client-side, zero API calls
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const TEMPLATES = window.__cabTemplates || [];
  const CONDITIONS = window.__cabConditions || {};
  const COMPLIANCE = window.__cabCompliance || [];
  const LS_KEY = 'cab_policy_set';

  let policySet = loadPolicies();
  let wizardStep = 0;
  let wizardData = resetWizardData();
  let currentExportFormat = 'powershell';
  let lastRemoved = null;

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
      trackEvent('tab_' + tab.dataset.tab);
    });
  });

  /* ═══════════════════════════════════════════════════════
     TEMPLATES TAB  (#5 onboarding, #6 add-all, #12 collapse, #13 tier grouping, #9 customize)
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

    // #13: Group by tier with section headers + #6: Add All per tier
    const tiers = [
      { key: 'starting-point', label: '🟢 Starting Point — Minimum for all organisations', cls: 'sp' },
      { key: 'enterprise', label: '🟡 Enterprise — Managed devices & stronger posture', cls: 'ent' },
      { key: 'specialised', label: '🔴 Specialised — High-security & privileged access', cls: 'spec' }
    ];

    let html = '';
    const showAll = tier === 'all' && !lc;

    if (showAll) {
      tiers.forEach(t => {
        const tierItems = filtered.filter(f => f.tier === t.key);
        if (!tierItems.length) return;
        const allAdded = tierItems.every(ti => policySet.find(p => p.id === ti.id));
        html += `<div class="cab-tier-section">
          <div class="cab-tier-header cab-tier-header--${t.cls}">
            <h3>${t.label}</h3>
            <button class="cab-btn cab-btn--sm ${allAdded ? 'cab-btn--secondary' : 'cab-btn--primary'}" onclick="window.__cab.addAllTier('${t.key}')" ${allAdded ? 'disabled' : ''}>
              ${allAdded ? '✅ All Added' : `➕ Add All ${tierItems.length} Policies`}
            </button>
          </div>
          <div class="cab-tpl-tier-grid">
            ${tierItems.map(renderTemplateCard).join('')}
          </div>
        </div>`;
      });
    } else {
      html = `<div class="cab-tpl-tier-grid">${filtered.map(renderTemplateCard).join('')}</div>`;
    }

    grid.innerHTML = html;
    const count = $('#cab-tpl-count');
    if (count) count.textContent = `Showing ${filtered.length} of ${TEMPLATES.length}`;
  }

  // #12: Collapsed cards with toggle
  function renderTemplateCard(t) {
    const added = policySet.find(p => p.id === t.id);
    return `
      <div class="cab-policy-card cab-policy-card--${tierClass(t.tier)}" data-id="${t.id}">
        <div class="cab-policy-card__header">
          <h4 class="cab-policy-card__name">${t.name}</h4>
          <span class="cab-tier-badge cab-tier-badge--${tierClass(t.tier)}">${t.tier_label}</span>
        </div>
        <p class="cab-policy-card__desc">${t.description}</p>
        <p class="cab-policy-card__risk">💡 ${t.risk}</p>
        <details class="cab-card-details">
          <summary>Show policy details</summary>
          <div class="cab-policy-card__details">
            <div class="cab-detail-row"><span class="cab-detail-label">👥 Users</span><span class="cab-detail-value">${t.users}</span></div>
            <div class="cab-detail-row"><span class="cab-detail-label">🎯 Target</span><span class="cab-detail-value">${t.target_apps}</span></div>
            ${t.conditions.length ? `<div class="cab-detail-row"><span class="cab-detail-label">📋 When</span><span class="cab-detail-value">${t.conditions.join(', ')}</span></div>` : ''}
            <div class="cab-detail-row"><span class="cab-detail-label">✅ Controls</span><span class="cab-detail-value">${t.grant_controls.join(', ')}</span></div>
            ${t.session_controls.length ? `<div class="cab-detail-row"><span class="cab-detail-label">⏱️ Session</span><span class="cab-detail-value">${t.session_controls.join(', ')}</span></div>` : ''}
            <div class="cab-detail-row"><span class="cab-detail-label">🚫 Excludes</span><span class="cab-detail-value">${t.exclusions.join(', ')}</span></div>
          </div>
        </details>
        <div class="cab-policy-card__actions">
          <button class="cab-btn cab-btn--primary cab-btn--sm" onclick="window.__cab.addTemplate('${t.id}')" ${added ? 'disabled' : ''}>
            ${added ? '✅ Added' : '➕ Add to My Set'}
          </button>
          <button class="cab-btn cab-btn--secondary cab-btn--sm" onclick="window.__cab.customizeTemplate('${t.id}')">✏️ Customize & Add</button>
          <a href="${t.learn_url}" target="_blank" rel="noopener" class="cab-btn cab-btn--secondary cab-btn--sm">📖 Learn</a>
        </div>
      </div>`;
  }

  function tierClass(tier) {
    if (tier === 'starting-point') return 'sp';
    if (tier === 'enterprise') return 'ent';
    if (tier === 'specialised') return 'spec';
    return 'custom'; // #16: custom tier styling
  }

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
    savePolicies(); updateBadge();
    showToast(`✅ Added: ${t.name}`);
    renderTemplates(tplSearch ? tplSearch.value : '', tplTier ? tplTier.value : 'all');
    trackEvent('add_template');
  }

  // #6: Add all policies for a tier
  function addAllTier(tier) {
    const tierTemplates = TEMPLATES.filter(t => t.tier === tier);
    let added = 0;
    tierTemplates.forEach(t => {
      if (!policySet.find(p => p.id === t.id)) {
        policySet.push({
          id: t.id, name: t.name, tier: t.tier, tier_label: t.tier_label,
          description: t.description, users: t.users, exclusions: [...t.exclusions],
          target_apps: t.target_apps, conditions: [...t.conditions],
          grant_controls: [...t.grant_controls], grant_operator: t.grant_operator || 'OR',
          session_controls: [...t.session_controls], source: 'template'
        });
        added++;
      }
    });
    savePolicies(); updateBadge();
    showToast(`✅ Added ${added} ${tier} policies`);
    renderTemplates(tplSearch ? tplSearch.value : '', tplTier ? tplTier.value : 'all');
    trackEvent('add_all_' + tier);
  }

  // #9: Customize & Add — pre-fill wizard from template
  function customizeTemplate(id) {
    const t = TEMPLATES.find(x => x.id === id);
    if (!t) return;
    wizardData = resetWizardData();
    wizardData.name = t.name + ' (customized)';
    wizardData.intent = t.description;
    // Map template users to wizard selection
    if (t.users.includes('All users')) wizardData.users = 'all-users';
    else if (t.users.includes('Guest')) wizardData.users = 'all-guests';
    else if (t.users.includes('Directory roles') || t.users.toLowerCase().includes('admin')) { wizardData.users = 'directory-roles'; wizardData.userRolesText = t.users; }
    else wizardData.users = 'all-users';
    wizardData.excludeBreakglass = t.exclusions.some(e => e.toLowerCase().includes('break-glass'));
    wizardData.excludeServiceAccounts = t.exclusions.some(e => e.toLowerCase().includes('service'));
    // Map target
    if (t.target_apps === 'All cloud apps') wizardData.targetApp = 'all-cloud-apps';
    else if (t.target_apps === 'Office 365') wizardData.targetApp = 'office-365';
    else if (t.target_apps.includes('Azure')) wizardData.targetApp = 'azure-management';
    else wizardData.targetApp = 'all-cloud-apps';
    // Map grant
    if (t.grant_controls.includes('Block access')) wizardData.grantType = 'block';
    else {
      wizardData.grantType = 'grant';
      wizardData.grantControls = t.grant_controls.map(g => {
        const ctrl = (CONDITIONS.grant_controls || []).find(c => c.label === g);
        return ctrl ? ctrl.id : '';
      }).filter(Boolean);
    }
    wizardData.grantOperator = t.grant_operator || 'OR';
    wizardStep = 0;
    $('[data-tab="build"]').click();
    renderWizard();
    showToast('✏️ Template loaded — customize and add');
    trackEvent('customize_template');
  }

  /* ═══════════════════════════════════════════════════════
     BUILD TAB  (#2 specific inputs, #4 validation, #10 cond bug, #11 CAE, #20 clickable steps)
     ═══════════════════════════════════════════════════════ */
  const WIZARD_STEPS = [
    { title: 'Name & Intent', icon: '📝', render: renderStepName, validate: () => wizardData.name.trim().length >= 3 ? null : 'Policy name must be at least 3 characters' },
    { title: 'Users & Groups', icon: '👥', render: renderStepWho, validate: () => null },
    { title: 'Target Apps', icon: '🎯', render: renderStepWhat, validate: () => null },
    { title: 'Conditions', icon: '📋', render: renderStepConditions, validate: () => null },
    { title: 'Grant Controls', icon: '✅', render: renderStepGrant, validate: () => {
      if (wizardData.grantType === 'grant' && wizardData.grantControls.length === 0) return 'Select at least one grant control';
      return null;
    }},
    { title: 'Session', icon: '⏱️', render: renderStepSession, validate: () => null },
    { title: 'Review & Add', icon: '🚀', render: renderStepSummary, validate: () => null }
  ];

  function resetWizardData() {
    return {
      name: '', intent: '', users: 'all-users', userRolesText: '', groupsText: '', excludeBreakglass: true,
      excludeServiceAccounts: false, targetApp: 'all-cloud-apps', targetCustom: '',
      conditions: { platforms: [], locations: '', clientApps: [], signinRisk: [], userRisk: [], deviceFilter: '' },
      grantType: 'grant', grantControls: [], grantOperator: 'OR',
      session: { frequency: '', persistent: '', appEnforced: false, mcas: '', cae: '' }
    };
  }

  function renderWizard() {
    const fill = $('#cab-wizard-fill');
    const label = $('#cab-wizard-step-label');
    const content = $('#cab-wizard-content');
    const prevBtn = $('#cab-wizard-prev');
    const nextBtn = $('#cab-wizard-next');
    const stepsEl = $('#cab-wizard-steps');
    if (!fill || !content) return;

    fill.style.width = ((wizardStep + 1) / WIZARD_STEPS.length * 100) + '%';
    label.textContent = `Step ${wizardStep + 1} of ${WIZARD_STEPS.length} — ${WIZARD_STEPS[wizardStep].title}`;
    prevBtn.disabled = wizardStep === 0;
    nextBtn.textContent = wizardStep === WIZARD_STEPS.length - 1 ? '✅ Add to My Set' : 'Next →';

    // #20: Render clickable step indicators
    if (stepsEl) {
      stepsEl.innerHTML = WIZARD_STEPS.map((s, i) => `
        <button class="cab-wizard-step-btn ${i === wizardStep ? 'cab-wizard-step-btn--active' : ''} ${i < wizardStep ? 'cab-wizard-step-btn--done' : ''}"
          onclick="window.__cab.goToStep(${i})" title="${s.title}" aria-label="Go to step ${i+1}: ${s.title}">
          <span class="cab-step-icon">${i < wizardStep ? '✓' : s.icon}</span>
          <span class="cab-step-name">${s.title}</span>
        </button>
      `).join('');
    }

    WIZARD_STEPS[wizardStep].render(content);
    updateBuildPreview();
  }

  if ($('#cab-wizard-next')) {
    $('#cab-wizard-next').addEventListener('click', () => {
      // #4: Validation
      const err = WIZARD_STEPS[wizardStep].validate();
      if (err) { showToast('⚠️ ' + err); return; }
      if (wizardStep < WIZARD_STEPS.length - 1) { wizardStep++; renderWizard(); }
      else { addCustomPolicy(); }
    });
    $('#cab-wizard-prev').addEventListener('click', () => {
      if (wizardStep > 0) { wizardStep--; renderWizard(); }
    });
  }

  function goToStep(step) {
    if (step >= 0 && step < WIZARD_STEPS.length) { wizardStep = step; renderWizard(); }
  }

  /* ── Step Renderers ── */
  function renderStepName(el) {
    el.innerHTML = `
      <div class="cab-form-group">
        <label class="cab-form-label">Policy Name *</label>
        <span class="cab-form-hint">E.g. "Require MFA for Finance Team" (min 3 characters)</span>
        <input class="cab-form-input" id="wiz-name" value="${esc(wizardData.name)}" placeholder="Enter a descriptive policy name...">
      </div>
      <div class="cab-form-group">
        <label class="cab-form-label">What are you protecting? (Intent)</label>
        <span class="cab-form-hint">Brief description of the security goal</span>
        <textarea class="cab-form-textarea" id="wiz-intent" placeholder="E.g. Ensure all users complete MFA before accessing corporate resources...">${esc(wizardData.intent)}</textarea>
      </div>`;
    bind('wiz-name', 'input', e => { wizardData.name = e.target.value; updateBuildPreview(); });
    bind('wiz-intent', 'input', e => { wizardData.intent = e.target.value; updateBuildPreview(); });
  }

  // #2: Added text inputs for roles/groups
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
      <div class="cab-form-group" id="wiz-roles-group" style="${wizardData.users === 'directory-roles' ? '' : 'display:none'}">
        <label class="cab-form-label">Which directory roles?</label>
        <span class="cab-form-hint">Comma-separated role names, e.g. "Global Administrator, Security Administrator"</span>
        <input class="cab-form-input" id="wiz-roles-text" value="${esc(wizardData.userRolesText)}" placeholder="Global Administrator, Security Administrator...">
      </div>
      <div class="cab-form-group" id="wiz-groups-group" style="${wizardData.users === 'specific-groups' ? '' : 'display:none'}">
        <label class="cab-form-label">Which groups?</label>
        <span class="cab-form-hint">Comma-separated group names, e.g. "Finance Team, Marketing"</span>
        <input class="cab-form-input" id="wiz-groups-text" value="${esc(wizardData.groupsText)}" placeholder="Finance Team, Marketing...">
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
      </div>`;
    $$('input[name="wiz-users"]').forEach(r => r.addEventListener('change', e => {
      wizardData.users = e.target.value;
      const rolesG = $('#wiz-roles-group'); const groupsG = $('#wiz-groups-group');
      if (rolesG) rolesG.style.display = e.target.value === 'directory-roles' ? '' : 'none';
      if (groupsG) groupsG.style.display = e.target.value === 'specific-groups' ? '' : 'none';
      updateBuildPreview();
    }));
    bind('wiz-roles-text', 'input', e => { wizardData.userRolesText = e.target.value; updateBuildPreview(); });
    bind('wiz-groups-text', 'input', e => { wizardData.groupsText = e.target.value; updateBuildPreview(); });
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
      <div class="cab-form-group" id="wiz-app-custom" style="${wizardData.targetApp === 'selected-apps' ? '' : 'display:none'}">
        <label class="cab-form-label">Which apps?</label>
        <span class="cab-form-hint">Comma-separated app names, e.g. "Salesforce, ServiceNow"</span>
        <input class="cab-form-input" id="wiz-app-text" value="${esc(wizardData.targetCustom)}" placeholder="App names...">
      </div>`;
    $$('input[name="wiz-app"]').forEach(r => r.addEventListener('change', e => {
      wizardData.targetApp = e.target.value;
      const customG = $('#wiz-app-custom');
      if (customG) customG.style.display = e.target.value === 'selected-apps' ? '' : 'none';
      updateBuildPreview();
    }));
    bind('wiz-app-text', 'input', e => { wizardData.targetCustom = e.target.value; updateBuildPreview(); });
  }

  // #10: Fix conditions UI — radios for single-choice, checkboxes for multi
  function renderStepConditions(el) {
    const conds = CONDITIONS.conditions || [];
    el.innerHTML = `
      <div class="cab-form-group">
        <label class="cab-form-label">Conditions (optional — leave blank for "any")</label>
        <span class="cab-form-hint">Narrow when this policy applies.</span>
        ${conds.map(c => {
          const isSingle = !c.multi_select;
          return `
          <details class="cab-cond-detail" style="margin-bottom:0.75rem">
            <summary style="cursor:pointer;padding:0.5rem;background:rgba(255,255,255,0.03);border-radius:6px;font-size:0.9rem;color:#fff">
              ${c.label} ${c.requires ? `<span style="font-size:0.75rem;color:#F59E0B">(${c.requires})</span>` : ''}
            </summary>
            <div class="cab-check-group" style="padding:0.5rem 0 0 1rem">
              ${isSingle ? `<div class="cab-check-item"><input type="radio" name="wiz-cond-${c.id}" class="wiz-cond" data-cond="${c.id}" value=""><label>— None —</label></div>` : ''}
              ${c.options.map(o => `
                <div class="cab-check-item">
                  <input type="${isSingle ? 'radio' : 'checkbox'}" name="${isSingle ? 'wiz-cond-' + c.id : ''}" class="wiz-cond" data-cond="${c.id}" value="${o}" ${isCondChecked(c.id, o) ? 'checked' : ''}>
                  <label>${o}</label>
                </div>
              `).join('')}
            </div>
          </details>`;
        }).join('')}
      </div>`;
    $$('.wiz-cond').forEach(cb => cb.addEventListener('change', () => { syncConditions(); updateBuildPreview(); }));
  }

  function isCondChecked(condId, option) {
    const c = wizardData.conditions;
    if (condId === 'device-platform') return c.platforms.includes(option);
    if (condId === 'client-apps') return c.clientApps.includes(option);
    if (condId === 'sign-in-risk') return c.signinRisk.includes(option);
    if (condId === 'user-risk') return c.userRisk.includes(option);
    if (condId === 'locations') return c.locations === option;
    if (condId === 'device-filter') return c.deviceFilter === option;
    return false;
  }

  function syncConditions() {
    wizardData.conditions.platforms = getCheckedValues('device-platform');
    wizardData.conditions.clientApps = getCheckedValues('client-apps');
    wizardData.conditions.signinRisk = getCheckedValues('sign-in-risk');
    wizardData.conditions.userRisk = getCheckedValues('user-risk');
    // Single-choice via radio
    const locRadio = document.querySelector('input.wiz-cond[data-cond="locations"]:checked');
    wizardData.conditions.locations = locRadio ? locRadio.value : '';
    const devRadio = document.querySelector('input.wiz-cond[data-cond="device-filter"]:checked');
    wizardData.conditions.deviceFilter = devRadio ? devRadio.value : '';
  }

  function getCheckedValues(condId) {
    return [...$$('.wiz-cond[data-cond="' + condId + '"]:checked')].map(c => c.value).filter(Boolean);
  }

  function renderStepGrant(el) {
    const controls = (CONDITIONS.grant_controls || []).filter(c => !c.is_block);
    el.innerHTML = `
      <div class="cab-form-group">
        <label class="cab-form-label">Access decision *</label>
        <div style="display:flex;gap:0.75rem;flex-wrap:wrap">
          <div class="cab-radio-card ${wizardData.grantType === 'block' ? 'cab-radio-card--selected' : ''}" onclick="window.__cab.setGrantType('block')">
            <span class="cab-radio-card__icon">🚫</span>
            <div><strong>Block access</strong><br><small style="color:var(--cab-text-dim)">Completely prevent access</small></div>
          </div>
          <div class="cab-radio-card ${wizardData.grantType === 'grant' ? 'cab-radio-card--selected' : ''}" onclick="window.__cab.setGrantType('grant')">
            <span class="cab-radio-card__icon">✅</span>
            <div><strong>Grant with controls</strong><br><small style="color:var(--cab-text-dim)">Allow if conditions met</small></div>
          </div>
        </div>
      </div>
      <div id="wiz-grant-controls" style="${wizardData.grantType === 'block' ? 'display:none' : ''}">
        <div class="cab-form-group">
          <label class="cab-form-label">Required controls (select at least one)</label>
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
      </div>`;
    $$('.wiz-gc').forEach(cb => cb.addEventListener('change', () => {
      wizardData.grantControls = [...$$('.wiz-gc:checked')].map(c => c.value);
      updateBuildPreview();
    }));
  }

  // #11: Added CAE support
  function renderStepSession(el) {
    const sc = CONDITIONS.session_controls || [];
    el.innerHTML = `
      <div class="cab-form-group">
        <label class="cab-form-label">Session controls (optional)</label>
        <span class="cab-form-hint">Control session lifetime and capabilities.</span>
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
      </div>`;
    $$('.wiz-session').forEach(sel => sel.addEventListener('change', () => { syncSession(); updateBuildPreview(); }));
  }

  function getSessionVal(id) {
    if (id === 'sign-in-frequency') return wizardData.session.frequency;
    if (id === 'persistent-browser') return wizardData.session.persistent;
    if (id === 'mcas') return wizardData.session.mcas;
    if (id === 'cae') return wizardData.session.cae;
    return '';
  }

  function syncSession() {
    $$('.wiz-session').forEach(sel => {
      const id = sel.dataset.sc;
      if (id === 'sign-in-frequency') wizardData.session.frequency = sel.value;
      if (id === 'persistent-browser') wizardData.session.persistent = sel.value;
      if (id === 'app-enforced') wizardData.session.appEnforced = sel.value === 'Enabled';
      if (id === 'mcas') wizardData.session.mcas = sel.value;
      if (id === 'cae') wizardData.session.cae = sel.value;
    });
  }

  function renderStepSummary(el) {
    const p = buildPolicyFromWizard();
    el.innerHTML = `
      <h3 style="margin:0 0 1rem">📋 Policy Summary</h3>
      <div class="cab-policy-card">${renderPolicyCardHTML(p)}</div>
      <p style="margin-top:1rem;color:var(--cab-text-dim);font-size:0.85rem">
        Click <strong>"✅ Add to My Set"</strong> below to add this policy.
      </p>`;
  }

  // #1: Export-accurate policy builder
  function buildPolicyFromWizard() {
    const d = wizardData;
    const userLabel = (CONDITIONS.user_types || []).find(u => u.id === d.users);
    const appLabel = [...(CONDITIONS.target_apps || []), ...(CONDITIONS.target_actions || [])].find(a => a.id === d.targetApp);
    const exclusions = [];
    if (d.excludeBreakglass) exclusions.push('Break-glass emergency access accounts');
    if (d.excludeServiceAccounts) exclusions.push('Service accounts');

    // #2: Build accurate user string
    let usersStr = userLabel ? userLabel.label : d.users;
    if (d.users === 'directory-roles' && d.userRolesText) usersStr = 'Directory roles: ' + d.userRolesText;
    if (d.users === 'specific-groups' && d.groupsText) usersStr = 'Groups: ' + d.groupsText;

    // Accurate target string
    let targetStr = appLabel ? appLabel.label : d.targetApp;
    if (d.targetApp === 'selected-apps' && d.targetCustom) targetStr = 'Selected: ' + d.targetCustom;

    const conditions = [];
    if (d.conditions.platforms.length) conditions.push('Platforms: ' + d.conditions.platforms.join(', '));
    if (d.conditions.locations) conditions.push('Locations: ' + d.conditions.locations);
    if (d.conditions.clientApps.length) conditions.push('Client apps: ' + d.conditions.clientApps.join(', '));
    if (d.conditions.signinRisk.length) conditions.push('Sign-in risk: ' + d.conditions.signinRisk.join(', '));
    if (d.conditions.userRisk.length) conditions.push('User risk: ' + d.conditions.userRisk.join(', '));
    if (d.conditions.deviceFilter) conditions.push('Device filter: ' + d.conditions.deviceFilter);

    const grantControls = d.grantType === 'block' ? ['Block access'] :
      d.grantControls.map(id => { const c = (CONDITIONS.grant_controls || []).find(gc => gc.id === id); return c ? c.label : id; });

    const sessionControls = [];
    if (d.session.frequency) sessionControls.push('Sign-in frequency: ' + d.session.frequency);
    if (d.session.persistent) sessionControls.push('Persistent browser: ' + d.session.persistent);
    if (d.session.appEnforced) sessionControls.push('App enforced restrictions');
    if (d.session.mcas) sessionControls.push('MCAS: ' + d.session.mcas);
    if (d.session.cae) sessionControls.push('CAE: ' + d.session.cae);

    return {
      id: 'custom-' + Date.now(), name: d.name || 'Untitled Policy',
      tier: 'custom', tier_label: 'Custom', description: d.intent || '',
      users: usersStr, exclusions, target_apps: targetStr,
      conditions, grant_controls: grantControls, grant_operator: d.grantOperator,
      session_controls: sessionControls, source: 'custom',
      // Store raw wizard data for accurate export
      _raw: { users: d.users, userRolesText: d.userRolesText, groupsText: d.groupsText,
              targetApp: d.targetApp, targetCustom: d.targetCustom, grantControls: [...d.grantControls],
              conditions: JSON.parse(JSON.stringify(d.conditions)), session: {...d.session} }
    };
  }

  function addCustomPolicy() {
    const err = WIZARD_STEPS[wizardStep].validate();
    if (err) { showToast('⚠️ ' + err); return; }
    const p = buildPolicyFromWizard();
    if (!p.name || p.name === 'Untitled Policy') { showToast('⚠️ Please enter a policy name'); wizardStep = 0; renderWizard(); return; }
    policySet.push(p);
    savePolicies(); updateBadge();
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
      card.innerHTML = renderPolicyCardHTML(p);
    }
  }

  /* ═══════════════════════════════════════════════════════
     REVIEW TAB  (#3 linter accuracy, #7 custom score, #8 clear all, #14 ZT labels, #15 compliance, #18 summary)
     ═══════════════════════════════════════════════════════ */
  function renderReview() {
    const empty = $('#cab-review-empty');
    const dash = $('#cab-review-dashboard');
    if (!empty || !dash) return;
    if (policySet.length === 0) { empty.style.display = ''; dash.style.display = 'none'; return; }
    empty.style.display = 'none'; dash.style.display = '';
    renderZTScore();
    renderLinter();
    renderCompliance();
    renderReviewPolicies();
  }

  // #7: Custom policies contribute to ZT score via keyword matching
  function renderZTScore() {
    const sp = countTierPolicies('starting-point');
    const ent = countTierPolicies('enterprise');
    const spec = countTierPolicies('specialised');
    const spMax = 6, entMax = 8, specMax = 6;
    const spScore = Math.min(sp / spMax, 1) * 40;
    const entScore = Math.min(ent / entMax, 1) * 35;
    const specScore = Math.min(spec / specMax, 1) * 25;
    const total = Math.round(spScore + entScore + specScore);

    const ring = $('#cab-zt-ring-fill');
    const numEl = $('#cab-zt-score-num');
    if (ring) { const circ = 2 * Math.PI * 52; ring.style.strokeDashoffset = circ - (total / 100) * circ; }
    if (numEl) numEl.textContent = total;

    const tierLabel = $('#cab-zt-tier-label');
    const tierDesc = $('#cab-zt-tier-desc');
    if (total >= 86) { tierLabel.textContent = '🌟 Comprehensive'; tierDesc.textContent = 'Excellent Zero Trust baseline alignment.'; }
    else if (total >= 71) { tierLabel.textContent = '🟢 Strong'; tierDesc.textContent = 'Covers most Microsoft recommendations.'; }
    else if (total >= 51) { tierLabel.textContent = '🟡 Developing'; tierDesc.textContent = 'Good foundation — gaps in advanced controls.'; }
    else if (total >= 31) { tierLabel.textContent = '🟠 Basic'; tierDesc.textContent = 'Starting Point only — needs Enterprise controls.'; }
    else { tierLabel.textContent = '🔴 Minimal'; tierDesc.textContent = 'Critical gaps — add more policies.'; }

    // #14: Better labels
    const spPct = spMax > 0 ? Math.round(sp / spMax * 100) : 0;
    const entPct = entMax > 0 ? Math.round(ent / entMax * 100) : 0;
    const specPct = specMax > 0 ? Math.round(spec / specMax * 100) : 0;
    setBar('cab-zt-bar-sp', spPct, 'cab-zt-val-sp', `${sp} of ${spMax} (${spPct}%)`);
    setBar('cab-zt-bar-ent', entPct, 'cab-zt-val-ent', `${ent} of ${entMax} (${entPct}%)`);
    setBar('cab-zt-bar-spec', specPct, 'cab-zt-val-spec', `${spec} of ${specMax} (${specPct}%)`);
  }

  function setBar(barId, pct, valId, text) {
    const bar = $('#' + barId); const val = $('#' + valId);
    if (bar) bar.style.width = Math.min(pct, 100) + '%';
    if (val) val.textContent = text;
  }

  // #7: Count tier contributions including keyword-matched custom policies
  function countTierPolicies(tier) {
    const tplIds = TEMPLATES.filter(t => t.tier === tier).map(t => t.id);
    let count = policySet.filter(p => tplIds.includes(p.id)).length;
    // Keyword-match custom policies
    policySet.filter(p => p.source === 'custom').forEach(p => {
      const gc = (p.grant_controls || []).join(' ').toLowerCase();
      const users = (p.users || '').toLowerCase();
      const conds = (p.conditions || []).join(' ').toLowerCase();
      if (tier === 'starting-point') {
        if (gc.includes('mfa') || gc.includes('multifactor')) count += 0.5;
        if (gc.includes('block') && conds.includes('activesync')) count += 0.5;
      }
      if (tier === 'enterprise') {
        if (gc.includes('compliant')) count += 0.5;
        if (conds.includes('location')) count += 0.5;
      }
      if (tier === 'specialised') {
        if (gc.includes('phishing-resistant') || gc.includes('authentication strength')) count += 0.5;
      }
    });
    return Math.min(count, tier === 'starting-point' ? 6 : tier === 'enterprise' ? 8 : 6);
  }

  // #3: Improved linter with per-policy break-glass check & condition-aware conflicts
  function runLinter() {
    const results = [];
    const policiesWithoutBreakglass = policySet.filter(p => !p.exclusions || !p.exclusions.some(e => e.toLowerCase().includes('break-glass') || e.toLowerCase().includes('emergency')));
    const hasLegacyBlock = policySet.some(p => p.conditions && p.conditions.some(c => c.toLowerCase().includes('activesync') || c.toLowerCase().includes('other clients')));
    const adminPolicies = policySet.filter(p => p.users && (p.users.toLowerCase().includes('admin') || p.users.toLowerCase().includes('directory roles')));
    const hasAdminMFA = adminPolicies.some(p => p.grant_controls.some(g => g.toLowerCase().includes('mfa') || g.toLowerCase().includes('multifactor') || g.toLowerCase().includes('authentication strength')));
    const allUserMFA = policySet.some(p => p.users && p.users.toLowerCase().includes('all users') && p.grant_controls.some(g => g.toLowerCase().includes('mfa')));
    const hasBlockAll = policySet.some(p => p.grant_controls.includes('Block access') && p.target_apps === 'All cloud apps' && p.users.includes('All users'));
    const azureMgmt = policySet.some(p => p.target_apps && p.target_apps.toLowerCase().includes('azure'));

    // 1. Per-policy break-glass check
    if (policiesWithoutBreakglass.length === 0) {
      results.push({ level: 'pass', icon: '✅', title: 'Break-glass accounts excluded', message: 'All policies exclude emergency access accounts.' });
    } else if (policiesWithoutBreakglass.length === policySet.length) {
      results.push({ level: 'critical', icon: '🔴', title: 'No break-glass exclusion', message: 'No policy excludes emergency access accounts. You risk total lockout.' });
    } else {
      results.push({ level: 'warning', icon: '🟠', title: 'Partial break-glass coverage', message: `${policiesWithoutBreakglass.length} of ${policySet.length} policies don't exclude break-glass accounts: ${policiesWithoutBreakglass.map(p => '"' + p.name + '"').join(', ')}` });
    }

    // 2. Admin lockout
    if (hasBlockAll && policiesWithoutBreakglass.length > 0) results.push({ level: 'critical', icon: '🔴', title: 'Admin lockout risk', message: 'A block policy targets all users + all apps without break-glass exclusion.' });

    // 3. Broad block
    if (hasBlockAll) results.push({ level: 'warning', icon: '🟠', title: 'Broad block policy', message: 'A policy blocks all users from all apps. Verify conditions narrow scope.' });

    // 4. Report-only
    results.push({ level: 'info', icon: '🔵', title: 'Deploy in Report-Only first', message: 'Always start new policies in Report-Only mode for 1-2 weeks.' });

    // 5. Condition-aware conflict detection
    const blocks = policySet.filter(p => p.grant_controls.includes('Block access'));
    const grants = policySet.filter(p => !p.grant_controls.includes('Block access'));
    blocks.forEach(bp => {
      grants.forEach(gp => {
        const usersOverlap = bp.users === gp.users || bp.users.includes('All users') || gp.users.includes('All users');
        const appsOverlap = bp.target_apps === gp.target_apps || bp.target_apps === 'All cloud apps' || gp.target_apps === 'All cloud apps';
        if (usersOverlap && appsOverlap) {
          const bpConds = (bp.conditions || []).join(', ') || 'no conditions';
          const gpConds = (gp.conditions || []).join(', ') || 'no conditions';
          results.push({ level: 'warning', icon: '🟠', title: 'Potential conflict', message: `"${bp.name}" (${bpConds}) blocks vs "${gp.name}" (${gpConds}) grants for overlapping scope.` });
        }
      });
    });

    // 6. Coverage gaps
    if (!azureMgmt) results.push({ level: 'info', icon: '🔵', title: 'Azure Management unprotected', message: 'No policy targets Azure portal/CLI/PowerShell.' });

    // 7. Legacy auth
    if (!hasLegacyBlock) results.push({ level: 'warning', icon: '🟠', title: 'Legacy auth not blocked', message: 'No policy blocks legacy protocols — the #1 password spray vector.' });
    else results.push({ level: 'pass', icon: '✅', title: 'Legacy auth blocked', message: 'Your set blocks legacy authentication protocols.' });

    // 8. Admin MFA
    if (!hasAdminMFA && !allUserMFA) results.push({ level: 'critical', icon: '🔴', title: 'No MFA for admins', message: 'No policy requires MFA for admin roles or all users.' });
    else results.push({ level: 'pass', icon: '✅', title: 'Admin MFA enforced', message: hasAdminMFA ? 'Admin-specific MFA policy exists.' : 'All-user MFA covers admins.' });

    return results;
  }

  // #18: Linter with summary count
  function renderLinter() {
    const el = $('#cab-linter-results');
    if (!el) return;
    const checks = runLinter();
    const counts = { critical: 0, warning: 0, info: 0, pass: 0 };
    checks.forEach(c => counts[c.level] = (counts[c.level] || 0) + 1);
    let html = `<div class="cab-linter-summary">`;
    if (counts.critical) html += `<span class="cab-linter-count cab-linter-count--critical">🔴 ${counts.critical} Critical</span>`;
    if (counts.warning) html += `<span class="cab-linter-count cab-linter-count--warning">🟠 ${counts.warning} Warning</span>`;
    if (counts.info) html += `<span class="cab-linter-count cab-linter-count--info">🔵 ${counts.info} Info</span>`;
    if (counts.pass) html += `<span class="cab-linter-count cab-linter-count--pass">✅ ${counts.pass} Passed</span>`;
    html += `</div>`;
    html += checks.map(c => `
      <div class="cab-linter-item cab-linter-item--${c.level}">
        <span class="cab-linter-icon">${c.icon}</span>
        <span class="cab-linter-text"><strong>${c.title}</strong> — ${c.message}</span>
      </div>
    `).join('');
    el.innerHTML = html;
  }

  // #15: Render compliance mapping
  function renderCompliance() {
    const el = $('#cab-compliance-section');
    if (!el || !COMPLIANCE.length) return;
    let html = `<details class="cab-compliance-details"><summary><strong>📜 Compliance Framework Mapping (Illustrative)</strong></summary>
      <p style="font-size:0.8rem;color:var(--cab-text-dim);margin:0.5rem 0">⚠️ These show which control objectives your policies <em>support</em> — not certify.</p>
      <div class="cab-compliance-grid">`;
    COMPLIANCE.forEach(fw => {
      html += `<div class="cab-compliance-fw"><h4>${fw.name}</h4>`;
      (fw.controls || []).forEach(ctrl => {
        html += `<div class="cab-compliance-ctrl"><strong>${ctrl.label}</strong><br><span style="font-size:0.78rem;color:var(--cab-text-dim)">${ctrl.ca_relevance}</span></div>`;
      });
      html += `</div>`;
    });
    html += `</div></details>`;
    el.innerHTML = html;
  }

  // #8: Clear all + undo remove
  function renderReviewPolicies() {
    const grid = $('#cab-review-grid');
    const count = $('#cab-review-count');
    if (!grid) return;
    count.textContent = policySet.length;
    let html = `<div class="cab-review-actions">
      <button class="cab-btn cab-btn--danger cab-btn--sm" onclick="window.__cab.clearAll()">🗑️ Clear All Policies</button>
    </div>`;
    html += policySet.map((p, i) => `
      <div class="cab-policy-card cab-policy-card--${tierClass(p.tier)}">
        ${renderPolicyCardHTML(p)}
        <div class="cab-policy-card__actions" style="margin-top:0.75rem">
          <button class="cab-btn cab-btn--danger cab-btn--sm" onclick="window.__cab.removePolicy(${i})">🗑️ Remove</button>
        </div>
      </div>
    `).join('');
    grid.innerHTML = html;
  }

  /* ═══════════════════════════════════════════════════════
     EXPORT TAB  (#1 accurate export, #21 empty CTA)
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

  // #1: Accurate PowerShell export reflecting actual selections
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
      // Users — use actual selection
      ps += `        Users = @{\n`;
      if (p.users.includes('All users')) ps += `            IncludeUsers = @("All")\n`;
      else if (p.users.includes('Guest')) ps += `            IncludeUsers = @("GuestsOrExternalUsers")\n`;
      else if (p.users.includes('Directory roles')) ps += `            IncludeRoles = @("62e90394-69f5-4237-9190-012177145e10")  # TODO: Replace with actual role IDs — ${p.users}\n`;
      else if (p.users.includes('Groups:')) ps += `            IncludeGroups = @("<group-object-id>")  # TODO: Replace with group IDs — ${p.users}\n`;
      else ps += `            IncludeUsers = @("All")\n`;
      if (p.exclusions && p.exclusions.length) ps += `            ExcludeGroups = @("<break-glass-group-id>")  # TODO: Add your break-glass group object ID\n`;
      ps += `        }\n`;
      // Applications — use actual selection
      ps += `        Applications = @{\n`;
      if (p.target_apps === 'All cloud apps') ps += `            IncludeApplications = @("All")\n`;
      else if (p.target_apps === 'Office 365') ps += `            IncludeApplications = @("Office365")\n`;
      else if (p.target_apps.includes('Azure')) ps += `            IncludeApplications = @("797f4846-ba00-4fd7-ba43-dac1f8f63013")  # Azure Management\n`;
      else if (p.target_apps.includes('Admin')) ps += `            IncludeApplications = @("00000006-0000-0ff1-ce00-000000000000")  # TODO: Replace with admin portal app IDs\n`;
      else if (p.target_apps.includes('Selected:')) ps += `            IncludeApplications = @("<app-id>")  # TODO: Replace with app IDs — ${p.target_apps}\n`;
      else if (p.target_apps.includes('Register security')) ps += `            IncludeUserActions = @("urn:user:registersecurityinfo")\n`;
      else ps += `            IncludeApplications = @("All")\n`;
      ps += `        }\n`;
      // Conditions — emit actual conditions
      if (p.conditions && p.conditions.length) {
        p.conditions.forEach(c => {
          if (c.startsWith('Platforms:')) ps += `        Platforms = @{ IncludePlatforms = @(${c.replace('Platforms: ', '').split(', ').map(x => '"' + x.toLowerCase() + '"').join(', ')}) }\n`;
          else if (c.startsWith('Client apps:')) ps += `        ClientAppTypes = @(${c.replace('Client apps: ', '').split(', ').map(x => '"' + mapClientApp(x) + '"').join(', ')})\n`;
          else if (c.startsWith('Sign-in risk:')) ps += `        SignInRiskLevels = @(${c.replace('Sign-in risk: ', '').split(', ').map(x => '"' + x.toLowerCase() + '"').join(', ')})\n`;
          else if (c.startsWith('User risk:')) ps += `        UserRiskLevels = @(${c.replace('User risk: ', '').split(', ').map(x => '"' + x.toLowerCase() + '"').join(', ')})\n`;
          else ps += `        # ${c}\n`;
        });
      }
      ps += `    }\n`;
      // Grant controls
      ps += `    GrantControls = @{\n`;
      if (isBlock) {
        ps += `        BuiltInControls = @("block")\n`;
        ps += `        Operator = "OR"\n`;
      } else {
        const controls = p.grant_controls.map(mapControlToPS);
        ps += `        BuiltInControls = @(${controls.map(c => `"${c}"`).join(', ')})\n`;
        ps += `        Operator = "${p.grant_operator || 'OR'}"\n`;
      }
      ps += `    }\n`;
      // Session controls
      if (p.session_controls && p.session_controls.length) {
        ps += `    SessionControls = @{\n`;
        p.session_controls.forEach(s => {
          if (s.startsWith('Sign-in frequency:')) {
            const val = s.replace('Sign-in frequency: ', '');
            if (val === 'Every time') ps += `        SignInFrequency = @{ Value = 0; Type = "everyTime"; IsEnabled = $true }\n`;
            else { const hrs = parseInt(val); ps += `        SignInFrequency = @{ Value = ${hrs || 8}; Type = "hours"; IsEnabled = $true }\n`; }
          } else if (s.startsWith('Persistent browser:')) {
            ps += `        PersistentBrowser = @{ Mode = "${s.includes('Never') ? 'never' : 'always'}"; IsEnabled = $true }\n`;
          } else ps += `        # ${s}\n`;
        });
        ps += `    }\n`;
      }
      ps += `}\nNew-MgIdentityConditionalAccessPolicy -BodyParameter $params${i + 1}\n\n`;
    });
    return ps;
  }

  function mapClientApp(app) {
    if (app.includes('Browser')) return 'browser';
    if (app.includes('Mobile') || app.includes('desktop')) return 'mobileAppsAndDesktopClients';
    if (app.includes('ActiveSync')) return 'exchangeActiveSync';
    return 'other';
  }

  function mapControlToPS(g) {
    if (g.toLowerCase().includes('mfa') || g.toLowerCase().includes('multifactor')) return 'mfa';
    if (g.toLowerCase().includes('compliant device')) return 'compliantDevice';
    if (g.toLowerCase().includes('hybrid')) return 'domainJoinedDevice';
    if (g.toLowerCase().includes('approved')) return 'approvedApplication';
    if (g.toLowerCase().includes('app protection')) return 'compliantApplication';
    if (g.toLowerCase().includes('password')) return 'passwordChange';
    if (g.toLowerCase().includes('terms')) return 'termsOfUse';
    if (g.toLowerCase().includes('authentication strength')) return 'authenticationStrength';
    return 'mfa';
  }

  // #1: Accurate JSON export
  function generateGraphJSON() {
    const policies = policySet.map((p, i) => {
      const num = String(i + 1).padStart(3, '0');
      const isBlock = p.grant_controls.includes('Block access');
      const obj = {
        displayName: `CA${num}-${tierShort(p.tier)}-${slugify(p.name)}`,
        state: 'enabledForReportingButNotEnforced',
        conditions: {
          users: {},
          applications: {}
        },
        grantControls: {
          operator: isBlock ? 'OR' : (p.grant_operator || 'OR'),
          builtInControls: isBlock ? ['block'] : p.grant_controls.map(mapControlToPS)
        }
      };
      // Users
      if (p.users.includes('All users')) obj.conditions.users.includeUsers = ['All'];
      else if (p.users.includes('Guest')) obj.conditions.users.includeUsers = ['GuestsOrExternalUsers'];
      else if (p.users.includes('Directory roles')) { obj.conditions.users.includeRoles = ['<role-id>']; obj.conditions.users._note = p.users; }
      else if (p.users.includes('Groups:')) { obj.conditions.users.includeGroups = ['<group-id>']; obj.conditions.users._note = p.users; }
      else obj.conditions.users.includeUsers = ['All'];
      if (p.exclusions && p.exclusions.length) obj.conditions.users.excludeGroups = ['<break-glass-group-id>'];
      // Apps
      if (p.target_apps === 'All cloud apps') obj.conditions.applications.includeApplications = ['All'];
      else if (p.target_apps === 'Office 365') obj.conditions.applications.includeApplications = ['Office365'];
      else if (p.target_apps.includes('Azure')) obj.conditions.applications.includeApplications = ['797f4846-ba00-4fd7-ba43-dac1f8f63013'];
      else if (p.target_apps.includes('Selected:')) { obj.conditions.applications.includeApplications = ['<app-id>']; obj.conditions.applications._note = p.target_apps; }
      else obj.conditions.applications.includeApplications = ['All'];
      // Conditions
      if (p.conditions && p.conditions.length) {
        p.conditions.forEach(c => {
          if (c.startsWith('Platforms:')) obj.conditions.platforms = { includePlatforms: c.replace('Platforms: ', '').split(', ').map(x => x.toLowerCase()) };
          if (c.startsWith('Client apps:')) obj.conditions.clientAppTypes = c.replace('Client apps: ', '').split(', ').map(mapClientApp);
          if (c.startsWith('Sign-in risk:')) obj.conditions.signInRiskLevels = c.replace('Sign-in risk: ', '').split(', ').map(x => x.toLowerCase());
          if (c.startsWith('User risk:')) obj.conditions.userRiskLevels = c.replace('User risk: ', '').split(', ').map(x => x.toLowerCase());
        });
      }
      // Session
      if (p.session_controls && p.session_controls.length) {
        obj.sessionControls = {};
        p.session_controls.forEach(s => {
          if (s.startsWith('Sign-in frequency:')) {
            const val = s.replace('Sign-in frequency: ', '');
            obj.sessionControls.signInFrequency = val === 'Every time' ? { value: null, type: 'everyTime', isEnabled: true } : { value: parseInt(val) || 8, type: 'hours', isEnabled: true };
          }
          if (s.startsWith('Persistent browser:')) obj.sessionControls.persistentBrowser = { mode: s.includes('Never') ? 'never' : 'always', isEnabled: true };
        });
      }
      return obj;
    });
    return `// Graph API JSON — POST to /identity/conditionalAccess/policies\n// ⚠️ Deploy in Report-Only mode first!\n// Replace <role-id>, <group-id>, <app-id>, <break-glass-group-id> with actual object IDs\n\n` + JSON.stringify(policies, null, 2);
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
      doc += `Tier:             ${p.tier_label}\nDescription:      ${p.description || 'N/A'}\nUsers:            ${p.users}\nExclusions:       ${(p.exclusions || []).join(', ') || 'None'}\nTarget Apps:      ${p.target_apps}\nConditions:       ${(p.conditions || []).join(', ') || 'None'}\nGrant Controls:   ${p.grant_controls.join(` ${p.grant_operator || 'OR'} `)}\nSession Controls: ${(p.session_controls || []).join(', ') || 'None'}\n\n`;
    });
    return doc;
  }

  function generateRollout() {
    return `CONDITIONAL ACCESS ROLLOUT PLAN\n${'═'.repeat(40)}\n\n⚠️  CRITICAL: Follow this sequence.\n\nPHASE 1: PREPARATION\n${'─'.repeat(40)}\n□ Create 2 break-glass emergency access accounts (cloud-only, Global Admin)\n□ Configure with phishing-resistant MFA (FIDO2)\n□ Create security group for break-glass\n□ Document credentials securely (split knowledge)\n□ Test break-glass sign-in\n\nPHASE 2: REPORT-ONLY\n${'─'.repeat(40)}\n` +
      policySet.map(p => `□ Create "${p.name}" in REPORT-ONLY\n`).join('') +
      `□ Monitor sign-in logs daily\n□ Check Report-Only insights\n\nPHASE 3: PILOT\n${'─'.repeat(40)}\n□ Create "CA Pilot Users" group (10-20 users)\n□ Enable for pilot only\n□ Collect feedback\n\nPHASE 4: BROAD DEPLOYMENT\n${'─'.repeat(40)}\n□ Expand one policy at a time:\n` +
      policySet.filter(p => p.tier === 'starting-point').map(p => `  1. ${p.name}\n`).join('') +
      policySet.filter(p => p.tier === 'enterprise').map(p => `  2. ${p.name}\n`).join('') +
      policySet.filter(p => !['starting-point','enterprise'].includes(p.tier)).map(p => `  3. ${p.name}\n`).join('') +
      `□ Monitor after each enablement\n\nPHASE 5: ONGOING\n${'─'.repeat(40)}\n□ Review quarterly\n□ Test break-glass monthly\n□ Update when new features available\n`;
  }

  /* Export buttons */
  if ($('#cab-export-copy')) {
    $('#cab-export-copy').addEventListener('click', () => {
      navigator.clipboard.writeText($('#cab-export-output').textContent).then(() => showToast('📋 Copied to clipboard'));
    });
  }
  if ($('#cab-export-download')) {
    $('#cab-export-download').addEventListener('click', () => {
      const ext = { powershell: 'ps1', json: 'json', csv: 'csv', docs: 'txt', rollout: 'txt' };
      const blob = new Blob([$('#cab-export-output').textContent], { type: 'text/plain' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = `ca-policies.${ext[currentExportFormat] || 'txt'}`; a.click();
      URL.revokeObjectURL(a.href);
    });
  }

  /* ═══════════════════════════════════════════════════════
     SHARED HELPERS
     ═══════════════════════════════════════════════════════ */
  function renderPolicyCardHTML(p) {
    return `
      <div class="cab-policy-card__header">
        <h4 class="cab-policy-card__name">${esc(p.name || 'Untitled')}</h4>
        <span class="cab-tier-badge cab-tier-badge--${tierClass(p.tier)}">${p.tier_label || 'Custom'}</span>
      </div>
      ${p.description ? `<p class="cab-policy-card__desc">${esc(p.description)}</p>` : ''}
      <div class="cab-policy-card__details">
        <div class="cab-detail-row"><span class="cab-detail-label">👥 Users</span><span class="cab-detail-value">${esc(p.users || 'Not set')}</span></div>
        <div class="cab-detail-row"><span class="cab-detail-label">🎯 Target</span><span class="cab-detail-value">${esc(p.target_apps || 'Not set')}</span></div>
        ${(p.conditions || []).length ? `<div class="cab-detail-row"><span class="cab-detail-label">📋 When</span><span class="cab-detail-value">${esc(p.conditions.join(', '))}</span></div>` : ''}
        <div class="cab-detail-row"><span class="cab-detail-label">✅ Controls</span><span class="cab-detail-value">${esc((p.grant_controls || []).join(` ${p.grant_operator || 'OR'} `))}</span></div>
        ${(p.session_controls || []).length ? `<div class="cab-detail-row"><span class="cab-detail-label">⏱️ Session</span><span class="cab-detail-value">${esc(p.session_controls.join(', '))}</span></div>` : ''}
        ${(p.exclusions || []).length ? `<div class="cab-detail-row"><span class="cab-detail-label">🚫 Excludes</span><span class="cab-detail-value">${esc(p.exclusions.join(', '))}</span></div>` : ''}
      </div>`;
  }

  function esc(s) { if (!s) return ''; const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function bind(id, event, handler) { const el = document.getElementById(id); if (el) el.addEventListener(event, handler); }
  function tierShort(tier) { return { 'starting-point': 'SP', enterprise: 'ENT', specialised: 'SPEC' }[tier] || 'CUST'; }
  function slugify(s) { return (s || '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 30); }

  function savePolicies() { try { localStorage.setItem(LS_KEY, JSON.stringify(policySet)); } catch (e) {} }
  function loadPolicies() { try { const d = localStorage.getItem(LS_KEY); return d ? JSON.parse(d) : []; } catch (e) { return []; } }

  // #8: Remove with undo
  function removePolicy(index) {
    lastRemoved = { policy: policySet[index], index };
    policySet.splice(index, 1);
    savePolicies(); updateBadge(); renderReview();
    showToastWithUndo('🗑️ Policy removed', () => {
      if (lastRemoved) { policySet.splice(lastRemoved.index, 0, lastRemoved.policy); savePolicies(); updateBadge(); renderReview(); lastRemoved = null; }
    });
  }

  // #8: Clear all
  function clearAll() {
    if (!confirm('Remove all ' + policySet.length + ' policies from your set?')) return;
    const backup = [...policySet];
    policySet = []; savePolicies(); updateBadge(); renderReview();
    renderTemplates(tplSearch ? tplSearch.value : '', tplTier ? tplTier.value : 'all');
    showToastWithUndo('🗑️ All policies cleared', () => { policySet = backup; savePolicies(); updateBadge(); renderReview(); });
  }

  function updateBadge() {
    const badge = $('#cab-policy-count');
    if (badge) { badge.textContent = policySet.length; badge.style.display = policySet.length > 0 ? 'inline-flex' : 'none'; }
  }

  function showToast(msg) {
    let toast = $('.cab-toast');
    if (!toast) { toast = document.createElement('div'); toast.className = 'cab-toast'; document.body.appendChild(toast); }
    toast.innerHTML = esc(msg);
    toast.classList.add('cab-toast--show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('cab-toast--show'), 2500);
  }

  function showToastWithUndo(msg, undoFn) {
    let toast = $('.cab-toast');
    if (!toast) { toast = document.createElement('div'); toast.className = 'cab-toast'; document.body.appendChild(toast); }
    toast.innerHTML = `${esc(msg)} <button class="cab-toast-undo" onclick="this.parentElement._undoFn()">Undo</button>`;
    toast._undoFn = () => { undoFn(); toast.classList.remove('cab-toast--show'); };
    toast.classList.add('cab-toast--show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('cab-toast--show'), 5000);
  }

  function setGrantType(type) { wizardData.grantType = type; renderWizard(); }
  function setOperator(op) { wizardData.grantOperator = op; renderWizard(); }

  // #19: Shareable URL with policy set
  function updateURL() {
    const url = new URL(window.location);
    const activeTab = $('.cab-tab--active');
    if (activeTab) url.searchParams.set('tab', activeTab.dataset.tab);
    history.replaceState(null, '', url);
  }

  function restoreURL() {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) { const tabBtn = $(`.cab-tab[data-tab="${tab}"]`); if (tabBtn) tabBtn.click(); }
    // #19: Restore shared policy set
    const shared = params.get('set');
    if (shared && policySet.length === 0) {
      try { const ids = atob(shared).split(','); ids.forEach(id => addTemplate(id)); showToast('📋 Loaded shared policy set'); }
      catch (e) {}
    }
  }

  function getShareURL() {
    const url = new URL(window.location);
    url.searchParams.set('tab', 'review');
    const ids = policySet.filter(p => p.source === 'template').map(p => p.id);
    if (ids.length) url.searchParams.set('set', btoa(ids.join(',')));
    return url.toString();
  }

  function trackEvent(name) { if (window.clarity) window.clarity('event', 'cab_' + name); }

  // #5: Quick-start
  function quickStartBaseline() {
    addAllTier('starting-point');
    $('[data-tab="review"]').click();
    trackEvent('quickstart');
  }

  window.__cab = { addTemplate, removePolicy, setGrantType, setOperator, addAllTier, customizeTemplate, clearAll, goToStep, quickStartBaseline, getShareURL };

  /* ── Init ── */
  renderTemplates();
  renderWizard();
  updateBadge();
  restoreURL();
  trackEvent('load');
})();
