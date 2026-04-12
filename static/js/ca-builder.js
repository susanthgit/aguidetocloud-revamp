/* ═══════════════════════════════════════════════════════
   CA Policy Builder — ca-builder.js  v3 (19 enhancements)
   100% client-side, zero API calls
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const TEMPLATES = window.__cabTemplates || [];
  const CONDITIONS = window.__cabConditions || {};
  const COMPLIANCE = window.__cabCompliance || [];
  const LS_KEY = 'cab_policy_set';
  const LS_SETS_KEY = 'cab_saved_sets';

  let policySet = loadPolicies();
  let wizardStep = 0;
  let wizardData = resetWizardData();
  let editingIndex = -1; // #5: edit mode
  let currentExportFormat = 'powershell';
  let lastRemoved = null;
  let codeTheme = 'dark'; // #17

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  /* ── Scenario Presets (Big Idea) ── */
  const SCENARIOS = [
    { id: 'small-biz', label: '🏢 Small Business', desc: 'Under 100 users, no Intune, M365 Business Premium', count: 6,
      templates: ['sp-mfa-all', 'sp-block-legacy', 'sp-mfa-admins', 'sp-secure-registration', 'sp-block-high-risk', 'sp-mfa-medium-risk'] },
    { id: 'enterprise', label: '🏦 Enterprise', desc: 'Intune-managed devices, E3/E5 licences', count: 14,
      templates: ['sp-mfa-all', 'sp-block-legacy', 'sp-mfa-admins', 'sp-secure-registration', 'sp-block-high-risk', 'sp-mfa-medium-risk',
                  'ent-compliant-device', 'ent-block-unsupported', 'ent-sign-in-frequency', 'ent-no-persistent-unmanaged', 'ent-approved-apps', 'ent-guest-mfa', 'ent-location-block', 'ent-terms-of-use'] },
    { id: 'education', label: '🏫 Education', desc: 'Students + staff, mixed devices, A3/A5', count: 10,
      templates: ['sp-mfa-all', 'sp-block-legacy', 'sp-mfa-admins', 'sp-secure-registration', 'sp-block-high-risk', 'sp-mfa-medium-risk',
                  'ent-approved-apps', 'ent-guest-mfa', 'ent-sign-in-frequency', 'ent-terms-of-use'] },
    { id: 'high-security', label: '🔒 High Security', desc: 'Finance, healthcare, government — full Zero Trust', count: 18,
      templates: ['sp-mfa-all', 'sp-block-legacy', 'sp-mfa-admins', 'sp-secure-registration', 'sp-block-high-risk', 'sp-mfa-medium-risk',
                  'ent-compliant-device', 'ent-block-unsupported', 'ent-sign-in-frequency', 'ent-no-persistent-unmanaged', 'ent-approved-apps', 'ent-guest-mfa', 'ent-location-block', 'ent-terms-of-use',
                  'spec-phishing-resistant-admins', 'spec-compliant-all-apps', 'spec-token-lifetime', 'spec-azure-management'] }
  ];

  // #13: Popular templates (static — could track via Clarity)
  const POPULAR_IDS = ['sp-mfa-all', 'sp-block-legacy', 'sp-mfa-admins', 'ent-compliant-device', 'ent-guest-mfa', 'spec-phishing-resistant-admins'];

  /* ═══════════════════════════════════════════════════════
     TABS
     ═══════════════════════════════════════════════════════ */
  $$('.cab-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.cab-tab').forEach(t => { t.classList.remove('cab-tab--active'); t.setAttribute('aria-selected', 'false'); });
      $$('.cab-panel').forEach(p => { p.classList.remove('cab-panel--active'); p.hidden = true; });
      tab.classList.add('cab-tab--active'); tab.setAttribute('aria-selected', 'true');
      const panel = $('#panel-' + tab.dataset.tab);
      if (panel) { panel.classList.add('cab-panel--active'); panel.hidden = false; }
      if (tab.dataset.tab === 'review') renderReview();
      if (tab.dataset.tab === 'export') renderExport();
      updateURL(); trackEvent('tab_' + tab.dataset.tab);
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
              ${allAdded ? '✅ All Added' : `➕ Add All ${tierItems.length}`}
            </button>
          </div>
          <div class="cab-tpl-tier-grid">${tierItems.map(renderTemplateCard).join('')}</div>
        </div>`;
      });
    } else {
      html = `<div class="cab-tpl-tier-grid">${filtered.map(renderTemplateCard).join('')}</div>`;
    }

    grid.innerHTML = html;
    const count = $('#cab-tpl-count');
    if (count) count.textContent = `Showing ${filtered.length} of ${TEMPLATES.length}`;

    // #1: Hide quickstart if SP added, show nudge
    updateQuickstart();
  }

  function renderTemplateCard(t) {
    const added = policySet.find(p => p.id === t.id);
    const popular = POPULAR_IDS.includes(t.id);
    // #9: Dependency hints
    const deps = [];
    if (t.grant_controls.some(g => g.includes('compliant'))) deps.push('Intune');
    if (t.conditions.some(c => c.includes('risk'))) deps.push('Entra ID P2');
    if (t.session_controls.some(s => s.includes('Cloud Apps'))) deps.push('Defender for Cloud Apps');

    return `
      <div class="cab-policy-card cab-policy-card--${tierClass(t.tier)}" data-id="${t.id}">
        <div class="cab-policy-card__header">
          <h4 class="cab-policy-card__name">${t.name}</h4>
          <div class="cab-card-badges">
            ${popular ? '<span class="cab-popular-badge">⭐ Popular</span>' : ''}
            <span class="cab-tier-badge cab-tier-badge--${tierClass(t.tier)}">${t.tier_label}</span>
          </div>
        </div>
        <p class="cab-policy-card__desc">${t.description}</p>
        ${deps.length ? `<p class="cab-dep-hint">🔗 Requires: ${deps.join(', ')}</p>` : ''}
        <p class="cab-policy-card__risk">💡 ${t.risk}</p>
        <details class="cab-card-details"><summary>Show policy details</summary>
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
          <button class="cab-btn cab-btn--primary cab-btn--sm" onclick="window.__cab.addTemplate('${t.id}')" ${added ? 'disabled' : ''}>${added ? '✅ Added' : '➕ Add'}</button>
          <button class="cab-btn cab-btn--secondary cab-btn--sm" onclick="window.__cab.customizeTemplate('${t.id}')">✏️ Customize</button>
          <a href="${t.learn_url}" target="_blank" rel="noopener" class="cab-btn cab-btn--secondary cab-btn--sm">📖</a>
        </div>
      </div>`;
  }

  // #1: Update quickstart visibility + #2: Next nudge
  function updateQuickstart() {
    const qs = $('#cab-quickstart');
    if (!qs) return;
    const spTemplates = TEMPLATES.filter(t => t.tier === 'starting-point');
    const spAdded = spTemplates.every(t => policySet.find(p => p.id === t.id));
    const entTemplates = TEMPLATES.filter(t => t.tier === 'enterprise');
    const entAdded = entTemplates.every(t => policySet.find(p => p.id === t.id));

    if (policySet.length === 0) {
      qs.innerHTML = `<div class="cab-quickstart-content">
        <h2>🚀 Quick Start — Choose Your Scenario</h2>
        <p>Select your organisation type to get the right policy mix, or browse individual templates below.</p>
        <div class="cab-scenario-grid">
          ${SCENARIOS.map(s => `
            <button class="cab-scenario-btn" onclick="window.__cab.applyScenario('${s.id}')">
              <span class="cab-scenario-icon">${s.label.split(' ')[0]}</span>
              <strong>${s.label.substring(s.label.indexOf(' ') + 1)}</strong>
              <span class="cab-scenario-desc">${s.desc}</span>
              <span class="cab-scenario-count">${s.count} policies</span>
            </button>
          `).join('')}
        </div>
        <p class="cab-quickstart-or">or browse individual templates below ↓</p>
      </div>`;
      qs.style.display = '';
    } else if (spAdded && !entAdded) {
      qs.innerHTML = `<div class="cab-quickstart-content cab-nudge">
        <p>✅ <strong>Starting Point baseline added!</strong> Ready for the next level?</p>
        <button class="cab-btn cab-btn--primary cab-btn--sm" onclick="window.__cab.addAllTier('enterprise')">🟡 Add All Enterprise Policies →</button>
        <button class="cab-btn cab-btn--secondary cab-btn--sm" onclick="document.querySelector('[data-tab=review]').click()">🔍 Review My Set</button>
      </div>`;
      qs.style.display = '';
    } else if (policySet.length > 0) {
      qs.innerHTML = `<div class="cab-quickstart-content cab-nudge">
        <p>🛡️ <strong>${policySet.length} policies</strong> in your set.
          <button class="cab-btn cab-btn--primary cab-btn--sm" style="margin-left:0.5rem" onclick="document.querySelector('[data-tab=review]').click()">🔍 Review & Export</button>
        </p>
      </div>`;
      qs.style.display = '';
    }
  }

  function applyScenario(id) {
    const scenario = SCENARIOS.find(s => s.id === id);
    if (!scenario) return;
    let added = 0;
    scenario.templates.forEach(tId => {
      const t = TEMPLATES.find(x => x.id === tId);
      if (t && !policySet.find(p => p.id === tId)) {
        policySet.push({ id: t.id, name: t.name, tier: t.tier, tier_label: t.tier_label, description: t.description, users: t.users, exclusions: [...t.exclusions], target_apps: t.target_apps, conditions: [...t.conditions], grant_controls: [...t.grant_controls], grant_operator: t.grant_operator || 'OR', session_controls: [...t.session_controls], source: 'template' });
        added++;
      }
    });
    savePolicies(); updateBadge();
    showToast(`✅ ${scenario.label} — added ${added} policies`);
    renderTemplates(tplSearch ? tplSearch.value : '', tplTier ? tplTier.value : 'all');
    trackEvent('scenario_' + id);
  }

  function tierClass(tier) { return { 'starting-point': 'sp', enterprise: 'ent', specialised: 'spec' }[tier] || 'custom'; }

  const tplSearch = $('#cab-tpl-search');
  const tplTier = $('#cab-tpl-tier-filter');
  if (tplSearch) tplSearch.addEventListener('input', () => renderTemplates(tplSearch.value, tplTier.value));
  if (tplTier) tplTier.addEventListener('change', () => renderTemplates(tplSearch.value, tplTier.value));

  function addTemplate(id) {
    const t = TEMPLATES.find(x => x.id === id);
    if (!t) return;
    if (policySet.find(p => p.id === id)) { showToast('⚠️ Already in your set'); return; }
    policySet.push({ id: t.id, name: t.name, tier: t.tier, tier_label: t.tier_label, description: t.description, users: t.users, exclusions: [...t.exclusions], target_apps: t.target_apps, conditions: [...t.conditions], grant_controls: [...t.grant_controls], grant_operator: t.grant_operator || 'OR', session_controls: [...t.session_controls], source: 'template' });
    savePolicies(); updateBadge();
    showToast(`✅ Added: ${t.name}`);
    renderTemplates(tplSearch ? tplSearch.value : '', tplTier ? tplTier.value : 'all');
    trackEvent('add_template');
  }

  function addAllTier(tier) {
    const tierTpls = TEMPLATES.filter(t => t.tier === tier);
    let added = 0;
    tierTpls.forEach(t => {
      if (!policySet.find(p => p.id === t.id)) {
        policySet.push({ id: t.id, name: t.name, tier: t.tier, tier_label: t.tier_label, description: t.description, users: t.users, exclusions: [...t.exclusions], target_apps: t.target_apps, conditions: [...t.conditions], grant_controls: [...t.grant_controls], grant_operator: t.grant_operator || 'OR', session_controls: [...t.session_controls], source: 'template' });
        added++;
      }
    });
    savePolicies(); updateBadge();
    showToast(`✅ Added ${added} ${tier} policies`);
    renderTemplates(tplSearch ? tplSearch.value : '', tplTier ? tplTier.value : 'all');
  }

  function customizeTemplate(id) {
    const t = TEMPLATES.find(x => x.id === id);
    if (!t) return;
    wizardData = resetWizardData();
    wizardData.name = t.name + ' (customized)';
    wizardData.intent = t.description;
    if (t.users.includes('All users')) wizardData.users = 'all-users';
    else if (t.users.includes('Guest')) wizardData.users = 'all-guests';
    else if (t.users.toLowerCase().includes('admin') || t.users.includes('Directory roles')) { wizardData.users = 'directory-roles'; wizardData.userRolesText = t.users; }
    wizardData.excludeBreakglass = t.exclusions.some(e => e.toLowerCase().includes('break-glass'));
    if (t.target_apps === 'Office 365') wizardData.targetApp = 'office-365';
    else if (t.target_apps.includes('Azure')) wizardData.targetApp = 'azure-management';
    if (t.grant_controls.includes('Block access')) wizardData.grantType = 'block';
    else { wizardData.grantControls = t.grant_controls.map(g => { const c = (CONDITIONS.grant_controls || []).find(gc => gc.label === g); return c ? c.id : ''; }).filter(Boolean); }
    wizardData.grantOperator = t.grant_operator || 'OR';
    editingIndex = -1;
    wizardStep = 0;
    $('[data-tab="build"]').click();
    renderWizard();
    showToast('✏️ Template loaded — customize and add');
  }

  /* ═══════════════════════════════════════════════════════
     BUILD TAB
     ═══════════════════════════════════════════════════════ */
  const WIZARD_STEPS = [
    { title: 'Name & Intent', icon: '📝', render: renderStepName, validate: () => wizardData.name.trim().length >= 3 ? null : 'Policy name must be at least 3 characters' },
    { title: 'Users & Groups', icon: '👥', render: renderStepWho, validate: () => null },
    { title: 'Target Apps', icon: '🎯', render: renderStepWhat, validate: () => null },
    { title: 'Conditions', icon: '📋', render: renderStepConditions, validate: () => null },
    { title: 'Grant Controls', icon: '✅', render: renderStepGrant, validate: () => wizardData.grantType === 'grant' && wizardData.grantControls.length === 0 ? 'Select at least one grant control' : null },
    { title: 'Session', icon: '⏱️', render: renderStepSession, validate: () => null },
    { title: 'Review & Add', icon: '🚀', render: renderStepSummary, validate: () => null }
  ];

  function resetWizardData() {
    return { name: '', intent: '', users: 'all-users', userRolesText: '', groupsText: '', excludeBreakglass: true, excludeServiceAccounts: false, targetApp: 'all-cloud-apps', targetCustom: '', conditions: { platforms: [], locations: '', clientApps: [], signinRisk: [], userRisk: [], deviceFilter: '' }, grantType: 'grant', grantControls: [], grantOperator: 'OR', session: { frequency: '', persistent: '', appEnforced: false, mcas: '', cae: '' } };
  }

  function renderWizard() {
    const fill = $('#cab-wizard-fill'), label = $('#cab-wizard-step-label'), content = $('#cab-wizard-content'), prevBtn = $('#cab-wizard-prev'), nextBtn = $('#cab-wizard-next'), stepsEl = $('#cab-wizard-steps'), mobileLabel = $('#cab-wizard-mobile-label');
    if (!fill || !content) return;
    fill.style.width = ((wizardStep + 1) / WIZARD_STEPS.length * 100) + '%';
    label.textContent = `Step ${wizardStep + 1} of ${WIZARD_STEPS.length} — ${WIZARD_STEPS[wizardStep].title}`;
    prevBtn.disabled = wizardStep === 0;
    nextBtn.textContent = wizardStep === WIZARD_STEPS.length - 1 ? (editingIndex >= 0 ? '✅ Save Changes' : '✅ Add to My Set') : 'Next →';
    // #6: Mobile step label
    if (mobileLabel) mobileLabel.textContent = WIZARD_STEPS[wizardStep].title;
    if (stepsEl) {
      stepsEl.innerHTML = WIZARD_STEPS.map((s, i) => `
        <button class="cab-wizard-step-btn ${i === wizardStep ? 'cab-wizard-step-btn--active' : ''} ${i < wizardStep ? 'cab-wizard-step-btn--done' : ''}"
          onclick="window.__cab.goToStep(${i})" title="${s.title}">
          <span class="cab-step-icon">${i < wizardStep ? '✓' : s.icon}</span>
          <span class="cab-step-name">${s.title}</span>
        </button>`).join('');
    }
    WIZARD_STEPS[wizardStep].render(content);
    updateBuildPreview();
  }

  if ($('#cab-wizard-next')) {
    $('#cab-wizard-next').addEventListener('click', () => {
      const err = WIZARD_STEPS[wizardStep].validate();
      if (err) { showToast('⚠️ ' + err); return; }
      if (wizardStep < WIZARD_STEPS.length - 1) { wizardStep++; renderWizard(); }
      else { editingIndex >= 0 ? saveEditedPolicy() : addCustomPolicy(); }
    });
    $('#cab-wizard-prev').addEventListener('click', () => { if (wizardStep > 0) { wizardStep--; renderWizard(); } });
  }

  function goToStep(step) { if (step >= 0 && step < WIZARD_STEPS.length) { wizardStep = step; renderWizard(); } }

  function renderStepName(el) {
    el.innerHTML = `<div class="cab-form-group"><label class="cab-form-label">Policy Name *</label><span class="cab-form-hint">Min 3 characters</span><input class="cab-form-input" id="wiz-name" value="${esc(wizardData.name)}" placeholder="E.g. Require MFA for Finance Team..."></div>
      <div class="cab-form-group"><label class="cab-form-label">Intent</label><span class="cab-form-hint">What security goal does this achieve?</span><textarea class="cab-form-textarea" id="wiz-intent" placeholder="E.g. Ensure all users complete MFA...">${esc(wizardData.intent)}</textarea></div>`;
    bind('wiz-name', 'input', e => { wizardData.name = e.target.value; updateBuildPreview(); });
    bind('wiz-intent', 'input', e => { wizardData.intent = e.target.value; updateBuildPreview(); });
  }

  function renderStepWho(el) {
    const ut = CONDITIONS.user_types || [];
    el.innerHTML = `<div class="cab-form-group"><label class="cab-form-label">Assign to</label><div class="cab-check-group">${ut.map(u => `<div class="cab-check-item"><input type="radio" name="wiz-users" id="wiz-u-${u.id}" value="${u.id}" ${wizardData.users === u.id ? 'checked' : ''}><label for="wiz-u-${u.id}">${u.label}</label><span class="cab-check-desc">${u.description}</span></div>`).join('')}</div></div>
      <div class="cab-form-group" id="wiz-roles-group" style="${wizardData.users === 'directory-roles' ? '' : 'display:none'}"><label class="cab-form-label">Which roles?</label><input class="cab-form-input" id="wiz-roles-text" value="${esc(wizardData.userRolesText)}" placeholder="Global Administrator, Security Administrator..."></div>
      <div class="cab-form-group" id="wiz-groups-group" style="${wizardData.users === 'specific-groups' ? '' : 'display:none'}"><label class="cab-form-label">Which groups?</label><input class="cab-form-input" id="wiz-groups-text" value="${esc(wizardData.groupsText)}" placeholder="Finance Team, Marketing..."></div>
      <div class="cab-form-group"><label class="cab-form-label">Exclusions</label><div class="cab-check-group"><div class="cab-check-item"><input type="checkbox" id="wiz-excl-bg" ${wizardData.excludeBreakglass ? 'checked' : ''}><label for="wiz-excl-bg">Exclude break-glass accounts</label></div><div class="cab-check-item"><input type="checkbox" id="wiz-excl-sa" ${wizardData.excludeServiceAccounts ? 'checked' : ''}><label for="wiz-excl-sa">Exclude service accounts</label></div></div></div>`;
    $$('input[name="wiz-users"]').forEach(r => r.addEventListener('change', e => { wizardData.users = e.target.value; const rg = $('#wiz-roles-group'), gg = $('#wiz-groups-group'); if(rg) rg.style.display = e.target.value === 'directory-roles' ? '' : 'none'; if(gg) gg.style.display = e.target.value === 'specific-groups' ? '' : 'none'; updateBuildPreview(); }));
    bind('wiz-roles-text', 'input', e => { wizardData.userRolesText = e.target.value; updateBuildPreview(); });
    bind('wiz-groups-text', 'input', e => { wizardData.groupsText = e.target.value; updateBuildPreview(); });
    bind('wiz-excl-bg', 'change', e => { wizardData.excludeBreakglass = e.target.checked; updateBuildPreview(); });
    bind('wiz-excl-sa', 'change', e => { wizardData.excludeServiceAccounts = e.target.checked; updateBuildPreview(); });
  }

  function renderStepWhat(el) {
    const apps = CONDITIONS.target_apps || [], actions = CONDITIONS.target_actions || [];
    el.innerHTML = `<div class="cab-form-group"><label class="cab-form-label">Target resources</label><div class="cab-check-group">${apps.map(a => `<div class="cab-check-item"><input type="radio" name="wiz-app" value="${a.id}" ${wizardData.targetApp === a.id ? 'checked' : ''}><label>${a.label}</label><span class="cab-check-desc">${a.description}</span></div>`).join('')}${actions.map(a => `<div class="cab-check-item"><input type="radio" name="wiz-app" value="${a.id}" ${wizardData.targetApp === a.id ? 'checked' : ''}><label>📋 ${a.label}</label><span class="cab-check-desc">${a.description}</span></div>`).join('')}</div></div>
      <div class="cab-form-group" id="wiz-app-custom" style="${wizardData.targetApp === 'selected-apps' ? '' : 'display:none'}"><label class="cab-form-label">Which apps?</label><input class="cab-form-input" id="wiz-app-text" value="${esc(wizardData.targetCustom)}" placeholder="Salesforce, ServiceNow..."></div>`;
    $$('input[name="wiz-app"]').forEach(r => r.addEventListener('change', e => { wizardData.targetApp = e.target.value; const c = $('#wiz-app-custom'); if(c) c.style.display = e.target.value === 'selected-apps' ? '' : 'none'; updateBuildPreview(); }));
    bind('wiz-app-text', 'input', e => { wizardData.targetCustom = e.target.value; updateBuildPreview(); });
  }

  function renderStepConditions(el) {
    const conds = CONDITIONS.conditions || [];
    el.innerHTML = `<div class="cab-form-group"><label class="cab-form-label">Conditions (optional)</label><span class="cab-form-hint">Leave blank = any</span>${conds.map(c => { const single = !c.multi_select; return `<details class="cab-cond-detail" style="margin-bottom:0.75rem"><summary style="cursor:pointer;padding:0.5rem;background:rgba(255,255,255,0.03);border-radius:6px;font-size:0.9rem;color:#fff">${c.label} ${c.requires ? `<span style="font-size:0.75rem;color:#F59E0B">(${c.requires})</span>` : ''}</summary><div class="cab-check-group" style="padding:0.5rem 0 0 1rem">${single ? `<div class="cab-check-item"><input type="radio" name="wiz-cond-${c.id}" class="wiz-cond" data-cond="${c.id}" value=""><label>— None —</label></div>` : ''}${c.options.map(o => `<div class="cab-check-item"><input type="${single ? 'radio' : 'checkbox'}" name="${single ? 'wiz-cond-' + c.id : ''}" class="wiz-cond" data-cond="${c.id}" value="${o}" ${isCondChecked(c.id, o) ? 'checked' : ''}><label>${o}</label></div>`).join('')}</div></details>`; }).join('')}</div>`;
    $$('.wiz-cond').forEach(cb => cb.addEventListener('change', () => { syncConditions(); updateBuildPreview(); }));
  }

  function isCondChecked(id, o) { const c = wizardData.conditions; return id === 'device-platform' ? c.platforms.includes(o) : id === 'client-apps' ? c.clientApps.includes(o) : id === 'sign-in-risk' ? c.signinRisk.includes(o) : id === 'user-risk' ? c.userRisk.includes(o) : id === 'locations' ? c.locations === o : id === 'device-filter' ? c.deviceFilter === o : false; }

  function syncConditions() {
    wizardData.conditions.platforms = gCV('device-platform'); wizardData.conditions.clientApps = gCV('client-apps'); wizardData.conditions.signinRisk = gCV('sign-in-risk'); wizardData.conditions.userRisk = gCV('user-risk');
    const lr = document.querySelector('input.wiz-cond[data-cond="locations"]:checked'); wizardData.conditions.locations = lr ? lr.value : '';
    const dr = document.querySelector('input.wiz-cond[data-cond="device-filter"]:checked'); wizardData.conditions.deviceFilter = dr ? dr.value : '';
  }
  function gCV(id) { return [...$$('.wiz-cond[data-cond="' + id + '"]:checked')].map(c => c.value).filter(Boolean); }

  function renderStepGrant(el) {
    const ctrls = (CONDITIONS.grant_controls || []).filter(c => !c.is_block);
    el.innerHTML = `<div class="cab-form-group"><label class="cab-form-label">Access decision *</label><div style="display:flex;gap:0.75rem;flex-wrap:wrap"><div class="cab-radio-card ${wizardData.grantType === 'block' ? 'cab-radio-card--selected' : ''}" onclick="window.__cab.setGrantType('block')"><span class="cab-radio-card__icon">🚫</span><div><strong>Block</strong><br><small style="color:var(--cab-text-dim)">Prevent access</small></div></div><div class="cab-radio-card ${wizardData.grantType === 'grant' ? 'cab-radio-card--selected' : ''}" onclick="window.__cab.setGrantType('grant')"><span class="cab-radio-card__icon">✅</span><div><strong>Grant with controls</strong><br><small style="color:var(--cab-text-dim)">Allow if met</small></div></div></div></div>
      <div id="wiz-grant-controls" style="${wizardData.grantType === 'block' ? 'display:none' : ''}"><div class="cab-form-group"><label class="cab-form-label">Required controls (≥1)</label><div class="cab-check-group">${ctrls.map(c => `<div class="cab-check-item"><input type="checkbox" class="wiz-gc" value="${c.id}" ${wizardData.grantControls.includes(c.id) ? 'checked' : ''}><label>${c.label}</label>${c.requires ? `<span class="cab-check-desc" style="color:#F59E0B">${c.requires}</span>` : ''}</div>`).join('')}</div></div><div class="cab-form-group"><label class="cab-form-label">Multiple controls</label><div class="cab-operator-toggle"><button class="cab-operator-btn ${wizardData.grantOperator === 'AND' ? 'cab-operator-btn--active' : ''}" onclick="window.__cab.setOperator('AND')">ALL (AND)</button><button class="cab-operator-btn ${wizardData.grantOperator === 'OR' ? 'cab-operator-btn--active' : ''}" onclick="window.__cab.setOperator('OR')">ONE (OR)</button></div></div></div>`;
    $$('.wiz-gc').forEach(cb => cb.addEventListener('change', () => { wizardData.grantControls = [...$$('.wiz-gc:checked')].map(c => c.value); updateBuildPreview(); }));
  }

  function renderStepSession(el) {
    const sc = CONDITIONS.session_controls || [];
    el.innerHTML = `<div class="cab-form-group"><label class="cab-form-label">Session controls (optional)</label>${sc.map(s => `<div style="margin-bottom:0.75rem"><label class="cab-form-label" style="font-size:0.85rem">${s.label} ${s.requires ? `<span style="color:#F59E0B;font-size:0.75rem">(${s.requires})</span>` : ''}</label><p style="font-size:0.8rem;color:var(--cab-text-dim);margin:0 0 0.4rem">${s.description}</p><select class="cab-form-select wiz-session" data-sc="${s.id}" style="max-width:300px"><option value="">— Not configured —</option>${s.options.map(o => `<option value="${o}" ${getSV(s.id) === o ? 'selected' : ''}>${o}</option>`).join('')}</select></div>`).join('')}</div>`;
    $$('.wiz-session').forEach(sel => sel.addEventListener('change', () => { syncSession(); updateBuildPreview(); }));
  }

  function getSV(id) { const s = wizardData.session; return { 'sign-in-frequency': s.frequency, 'persistent-browser': s.persistent, mcas: s.mcas, cae: s.cae }[id] || ''; }
  function syncSession() { $$('.wiz-session').forEach(sel => { const id = sel.dataset.sc; if (id === 'sign-in-frequency') wizardData.session.frequency = sel.value; if (id === 'persistent-browser') wizardData.session.persistent = sel.value; if (id === 'app-enforced') wizardData.session.appEnforced = sel.value === 'Enabled'; if (id === 'mcas') wizardData.session.mcas = sel.value; if (id === 'cae') wizardData.session.cae = sel.value; }); }

  function renderStepSummary(el) {
    const p = buildPolicyFromWizard();
    el.innerHTML = `<h3 style="margin:0 0 1rem">📋 ${editingIndex >= 0 ? 'Edit' : 'New'} Policy Summary</h3><div class="cab-policy-card">${renderPolicyCardHTML(p)}</div><p style="margin-top:1rem;color:var(--cab-text-dim);font-size:0.85rem">Click the button below to ${editingIndex >= 0 ? 'save changes' : 'add to your set'}.</p>`;
  }

  function buildPolicyFromWizard() {
    const d = wizardData;
    const uL = (CONDITIONS.user_types || []).find(u => u.id === d.users);
    const aL = [...(CONDITIONS.target_apps || []), ...(CONDITIONS.target_actions || [])].find(a => a.id === d.targetApp);
    const excl = []; if (d.excludeBreakglass) excl.push('Break-glass emergency access accounts'); if (d.excludeServiceAccounts) excl.push('Service accounts');
    let usersStr = uL ? uL.label : d.users; if (d.users === 'directory-roles' && d.userRolesText) usersStr = 'Directory roles: ' + d.userRolesText; if (d.users === 'specific-groups' && d.groupsText) usersStr = 'Groups: ' + d.groupsText;
    let targetStr = aL ? aL.label : d.targetApp; if (d.targetApp === 'selected-apps' && d.targetCustom) targetStr = 'Selected: ' + d.targetCustom;
    const conds = []; if (d.conditions.platforms.length) conds.push('Platforms: ' + d.conditions.platforms.join(', ')); if (d.conditions.locations) conds.push('Locations: ' + d.conditions.locations); if (d.conditions.clientApps.length) conds.push('Client apps: ' + d.conditions.clientApps.join(', ')); if (d.conditions.signinRisk.length) conds.push('Sign-in risk: ' + d.conditions.signinRisk.join(', ')); if (d.conditions.userRisk.length) conds.push('User risk: ' + d.conditions.userRisk.join(', ')); if (d.conditions.deviceFilter) conds.push('Device filter: ' + d.conditions.deviceFilter);
    const gc = d.grantType === 'block' ? ['Block access'] : d.grantControls.map(id => { const c = (CONDITIONS.grant_controls || []).find(x => x.id === id); return c ? c.label : id; });
    const sc = []; if (d.session.frequency) sc.push('Sign-in frequency: ' + d.session.frequency); if (d.session.persistent) sc.push('Persistent browser: ' + d.session.persistent); if (d.session.appEnforced) sc.push('App enforced restrictions'); if (d.session.mcas) sc.push('MCAS: ' + d.session.mcas); if (d.session.cae) sc.push('CAE: ' + d.session.cae);
    return { id: editingIndex >= 0 ? policySet[editingIndex].id : 'custom-' + Date.now(), name: d.name || 'Untitled', tier: 'custom', tier_label: 'Custom', description: d.intent || '', users: usersStr, exclusions: excl, target_apps: targetStr, conditions: conds, grant_controls: gc, grant_operator: d.grantOperator, session_controls: sc, source: 'custom' };
  }

  // #4: Duplicate detection
  function addCustomPolicy() {
    const p = buildPolicyFromWizard();
    if (!p.name || p.name === 'Untitled') { showToast('⚠️ Enter a policy name'); wizardStep = 0; renderWizard(); return; }
    const dupe = policySet.find(x => x.name.toLowerCase() === p.name.toLowerCase());
    if (dupe && !confirm(`A policy named "${dupe.name}" already exists. Add anyway?`)) return;
    policySet.push(p); savePolicies(); updateBadge();
    showToast(`✅ Added: ${p.name}`); wizardData = resetWizardData(); editingIndex = -1; wizardStep = 0; renderWizard();
    $('[data-tab="review"]').click();
  }

  // #5: Save edited policy
  function saveEditedPolicy() {
    const p = buildPolicyFromWizard();
    policySet[editingIndex] = p; savePolicies(); updateBadge();
    showToast(`✅ Updated: ${p.name}`); wizardData = resetWizardData(); editingIndex = -1; wizardStep = 0; renderWizard();
    $('[data-tab="review"]').click();
  }

  // #5: Edit policy — load into wizard
  function editPolicy(index) {
    const p = policySet[index];
    wizardData = resetWizardData();
    wizardData.name = p.name; wizardData.intent = p.description;
    if (p.users.includes('All users')) wizardData.users = 'all-users';
    else if (p.users.includes('Guest')) wizardData.users = 'all-guests';
    else if (p.users.includes('Directory roles')) { wizardData.users = 'directory-roles'; wizardData.userRolesText = p.users.replace('Directory roles: ', ''); }
    else if (p.users.includes('Groups:')) { wizardData.users = 'specific-groups'; wizardData.groupsText = p.users.replace('Groups: ', ''); }
    wizardData.excludeBreakglass = (p.exclusions || []).some(e => e.toLowerCase().includes('break-glass'));
    wizardData.excludeServiceAccounts = (p.exclusions || []).some(e => e.toLowerCase().includes('service'));
    if (p.target_apps === 'Office 365') wizardData.targetApp = 'office-365';
    else if (p.target_apps.includes('Azure')) wizardData.targetApp = 'azure-management';
    else if (p.target_apps.includes('Selected:')) { wizardData.targetApp = 'selected-apps'; wizardData.targetCustom = p.target_apps.replace('Selected: ', ''); }
    if (p.grant_controls.includes('Block access')) wizardData.grantType = 'block';
    else { wizardData.grantType = 'grant'; wizardData.grantControls = p.grant_controls.map(g => { const c = (CONDITIONS.grant_controls || []).find(x => x.label === g); return c ? c.id : ''; }).filter(Boolean); }
    wizardData.grantOperator = p.grant_operator || 'OR';
    editingIndex = index; wizardStep = 0;
    $('[data-tab="build"]').click(); renderWizard();
    showToast('✏️ Editing: ' + p.name);
  }

  function updateBuildPreview() {
    const card = $('#cab-build-preview-card');
    const cardM = $('#cab-build-preview-card-mobile');
    const p = buildPolicyFromWizard();
    const html = (!p.name && !p.description && p.grant_controls.length === 0) ? '<p class="cab-preview-empty">Preview appears as you build.</p>' : renderPolicyCardHTML(p);
    if (card) card.innerHTML = html;
    if (cardM) cardM.innerHTML = html;
  }

  /* ═══════════════════════════════════════════════════════
     REVIEW TAB
     ═══════════════════════════════════════════════════════ */
  function renderReview() {
    const empty = $('#cab-review-empty'), dash = $('#cab-review-dashboard');
    if (!empty || !dash) return;
    if (policySet.length === 0) { empty.style.display = ''; dash.style.display = 'none'; return; }
    empty.style.display = 'none'; dash.style.display = '';
    renderZTScore(); renderLinter(); renderCompliance(); renderReviewPolicies();
  }

  function renderZTScore() {
    const sp = countTP('starting-point'), ent = countTP('enterprise'), spec = countTP('specialised');
    const spM = 6, entM = 8, specM = 6;
    const total = Math.round(Math.min(sp / spM, 1) * 40 + Math.min(ent / entM, 1) * 35 + Math.min(spec / specM, 1) * 25);
    const ring = $('#cab-zt-ring-fill'), numEl = $('#cab-zt-score-num');
    if (ring) { const c = 2 * Math.PI * 52; ring.style.strokeDashoffset = c - (total / 100) * c; }
    if (numEl) numEl.textContent = total;
    const tL = $('#cab-zt-tier-label'), tD = $('#cab-zt-tier-desc');
    if (total >= 86) { tL.textContent = '🌟 Comprehensive'; tD.textContent = 'Excellent Zero Trust alignment.'; }
    else if (total >= 71) { tL.textContent = '🟢 Strong'; tD.textContent = 'Covers most recommendations.'; }
    else if (total >= 51) { tL.textContent = '🟡 Developing'; tD.textContent = 'Good foundation — some gaps.'; }
    else if (total >= 31) { tL.textContent = '🟠 Basic'; tD.textContent = 'Needs Enterprise controls.'; }
    else { tL.textContent = '🔴 Minimal'; tD.textContent = 'Critical gaps.'; }
    setBar('cab-zt-bar-sp', sp / spM * 100, 'cab-zt-val-sp', `${sp} of ${spM} (${Math.round(sp / spM * 100)}%)`);
    setBar('cab-zt-bar-ent', ent / entM * 100, 'cab-zt-val-ent', `${ent} of ${entM} (${Math.round(ent / entM * 100)}%)`);
    setBar('cab-zt-bar-spec', spec / specM * 100, 'cab-zt-val-spec', `${spec} of ${specM} (${Math.round(spec / specM * 100)}%)`);
  }
  function setBar(b, p, v, t) { const be = $('#' + b), ve = $('#' + v); if (be) be.style.width = Math.min(p, 100) + '%'; if (ve) ve.textContent = t; }
  function countTP(tier) { const ids = TEMPLATES.filter(t => t.tier === tier).map(t => t.id); let c = policySet.filter(p => ids.includes(p.id)).length; policySet.filter(p => p.source === 'custom').forEach(p => { const gc = (p.grant_controls || []).join(' ').toLowerCase(), co = (p.conditions || []).join(' ').toLowerCase(); if (tier === 'starting-point') { if (gc.includes('mfa') || gc.includes('multifactor')) c += 0.5; if (gc.includes('block') && co.includes('activesync')) c += 0.5; } if (tier === 'enterprise') { if (gc.includes('compliant')) c += 0.5; if (co.includes('location')) c += 0.5; } if (tier === 'specialised') { if (gc.includes('phishing') || gc.includes('authentication strength')) c += 0.5; } }); return Math.min(c, tier === 'starting-point' ? 6 : tier === 'enterprise' ? 8 : 6); }

  function runLinter() {
    const r = [], noBG = policySet.filter(p => !p.exclusions || !p.exclusions.some(e => e.toLowerCase().includes('break-glass') || e.toLowerCase().includes('emergency'))),
      hasLB = policySet.some(p => p.conditions && p.conditions.some(c => c.toLowerCase().includes('activesync') || c.toLowerCase().includes('other clients'))),
      adminMFA = policySet.some(p => p.users && (p.users.toLowerCase().includes('admin') || p.users.toLowerCase().includes('directory roles')) && p.grant_controls.some(g => g.toLowerCase().includes('mfa') || g.toLowerCase().includes('authentication strength'))),
      allMFA = policySet.some(p => p.users && p.users.toLowerCase().includes('all users') && p.grant_controls.some(g => g.toLowerCase().includes('mfa'))),
      blockAll = policySet.some(p => p.grant_controls.includes('Block access') && p.target_apps === 'All cloud apps' && p.users.includes('All users')),
      azMgmt = policySet.some(p => p.target_apps && p.target_apps.toLowerCase().includes('azure'));
    // Break-glass
    if (noBG.length === 0) r.push({ level: 'pass', icon: '✅', title: 'Break-glass excluded', message: 'All policies exclude emergency accounts.' });
    else if (noBG.length === policySet.length) r.push({ level: 'critical', icon: '🔴', title: 'No break-glass exclusion', message: 'No policy excludes emergency accounts.' });
    else r.push({ level: 'warning', icon: '🟠', title: 'Partial break-glass', message: `${noBG.length} policies missing: ${noBG.map(p => '"' + p.name + '"').slice(0, 3).join(', ')}${noBG.length > 3 ? '...' : ''}` });
    if (blockAll && noBG.length > 0) r.push({ level: 'critical', icon: '🔴', title: 'Admin lockout risk', message: 'Block-all policy without break-glass exclusion.' });
    if (blockAll) r.push({ level: 'warning', icon: '🟠', title: 'Broad block', message: 'Blocks all users from all apps — verify conditions narrow scope.' });
    r.push({ level: 'info', icon: '🔵', title: 'Report-Only first', message: 'Deploy new policies in Report-Only mode for 1-2 weeks.' });
    // Conflicts
    const blocks = policySet.filter(p => p.grant_controls.includes('Block access')), grants = policySet.filter(p => !p.grant_controls.includes('Block access'));
    blocks.forEach(bp => grants.forEach(gp => { if ((bp.users === gp.users || bp.users.includes('All users') || gp.users.includes('All users')) && (bp.target_apps === gp.target_apps || bp.target_apps === 'All cloud apps' || gp.target_apps === 'All cloud apps')) r.push({ level: 'warning', icon: '🟠', title: 'Conflict', message: `"${bp.name}" blocks vs "${gp.name}" grants for overlapping scope.` }); }));
    if (!azMgmt) r.push({ level: 'info', icon: '🔵', title: 'Azure unprotected', message: 'No policy targets Azure portal/CLI.' });
    if (!hasLB) r.push({ level: 'warning', icon: '🟠', title: 'Legacy auth open', message: 'No legacy auth block — #1 spray vector.' });
    else r.push({ level: 'pass', icon: '✅', title: 'Legacy blocked', message: 'Legacy protocols blocked.' });
    if (!adminMFA && !allMFA) r.push({ level: 'critical', icon: '🔴', title: 'No admin MFA', message: 'No MFA for admins or all users.' });
    else r.push({ level: 'pass', icon: '✅', title: 'Admin MFA', message: adminMFA ? 'Admin-specific MFA exists.' : 'All-user MFA covers admins.' });
    return r;
  }

  function renderLinter() {
    const el = $('#cab-linter-results'); if (!el) return;
    const checks = runLinter(), counts = { critical: 0, warning: 0, info: 0, pass: 0 };
    checks.forEach(c => counts[c.level]++);
    let h = `<div class="cab-linter-summary">${counts.critical ? `<span class="cab-linter-count cab-linter-count--critical">🔴 ${counts.critical}</span>` : ''}${counts.warning ? `<span class="cab-linter-count cab-linter-count--warning">🟠 ${counts.warning}</span>` : ''}${counts.info ? `<span class="cab-linter-count cab-linter-count--info">🔵 ${counts.info}</span>` : ''}${counts.pass ? `<span class="cab-linter-count cab-linter-count--pass">✅ ${counts.pass}</span>` : ''}</div>`;
    h += checks.map(c => `<div class="cab-linter-item cab-linter-item--${c.level}"><span class="cab-linter-icon">${c.icon}</span><span class="cab-linter-text"><strong>${c.title}</strong> — ${c.message}</span></div>`).join('');
    el.innerHTML = h;
  }

  function renderCompliance() { const el = $('#cab-compliance-section'); if (!el || !COMPLIANCE.length) return; let h = `<details class="cab-compliance-details"><summary><strong>📜 Compliance Mapping (Illustrative)</strong></summary><p style="font-size:0.8rem;color:var(--cab-text-dim);margin:0.5rem 0">⚠️ Shows objectives your policies <em>support</em> — not certify.</p><div class="cab-compliance-grid">`; COMPLIANCE.forEach(fw => { h += `<div class="cab-compliance-fw"><h4>${fw.name}</h4>`; (fw.controls || []).forEach(c => { h += `<div class="cab-compliance-ctrl"><strong>${c.label}</strong><br><span style="font-size:0.78rem;color:var(--cab-text-dim)">${c.ca_relevance}</span></div>`; }); h += `</div>`; }); h += `</div></details>`; el.innerHTML = h; }

  function renderReviewPolicies() {
    const grid = $('#cab-review-grid'), cnt = $('#cab-review-count'); if (!grid) return;
    cnt.textContent = policySet.length;
    // #9: Dependency hints in review
    let h = `<div class="cab-review-actions"><button class="cab-btn cab-btn--danger cab-btn--sm" onclick="window.__cab.clearAll()">🗑️ Clear All</button></div>`;
    h += policySet.map((p, i) => {
      const deps = [];
      if ((p.grant_controls || []).some(g => g.includes('compliant'))) deps.push('Intune');
      if ((p.conditions || []).some(c => c.toLowerCase().includes('risk'))) deps.push('Entra ID P2');
      return `<div class="cab-policy-card cab-policy-card--${tierClass(p.tier)}">${renderPolicyCardHTML(p)}${deps.length ? `<p class="cab-dep-hint">🔗 Requires: ${deps.join(', ')}</p>` : ''}<div class="cab-policy-card__actions" style="margin-top:0.75rem"><button class="cab-btn cab-btn--secondary cab-btn--sm" onclick="window.__cab.editPolicy(${i})">✏️ Edit</button><button class="cab-btn cab-btn--danger cab-btn--sm" onclick="window.__cab.removePolicy(${i})">🗑️</button></div></div>`;
    }).join('');
    grid.innerHTML = h;
  }

  /* ═══════════════════════════════════════════════════════
     EXPORT TAB — #7 syntax highlight, #10 what-to-do-next, #17 theme
     ═══════════════════════════════════════════════════════ */
  function renderExport() {
    const empty = $('#cab-export-empty'), dash = $('#cab-export-dashboard');
    if (!empty || !dash) return;
    if (policySet.length === 0) { empty.style.display = ''; dash.style.display = 'none'; return; }
    empty.style.display = 'none'; dash.style.display = '';
    renderExportContent();
  }

  $$('.cab-export-tab').forEach(tab => tab.addEventListener('click', () => {
    $$('.cab-export-tab').forEach(t => t.classList.remove('cab-export-tab--active'));
    tab.classList.add('cab-export-tab--active');
    currentExportFormat = tab.dataset.format;
    renderExportContent();
  }));

  function renderExportContent() {
    const output = $('#cab-export-output'), nextSteps = $('#cab-export-next-steps');
    if (!output) return;
    let raw = '';
    switch (currentExportFormat) {
      case 'powershell': raw = generatePowerShell(); break;
      case 'json': raw = generateGraphJSON(); break;
      case 'csv': raw = generateCSV(); break;
      case 'docs': raw = generateDocs(); break;
      case 'rollout': raw = generateRollout(); break;
    }
    // #7: Syntax highlighting
    if (currentExportFormat === 'powershell' || currentExportFormat === 'json') {
      output.innerHTML = highlightSyntax(raw, currentExportFormat);
    } else {
      output.textContent = raw;
    }
    // #10: What to do next
    if (nextSteps) {
      if (currentExportFormat === 'powershell') {
        nextSteps.innerHTML = `<div class="cab-next-steps"><h4>📋 What to do next</h4><ol><li>Open PowerShell as admin</li><li>Run <code>Install-Module Microsoft.Graph -Scope CurrentUser</code></li><li>Run <code>Connect-MgGraph -Scopes "Policy.ReadWrite.ConditionalAccess"</code></li><li>Paste and run each policy command</li><li>Check <strong>Report-Only insights</strong> in Entra portal after 1 week</li><li>If clean, switch policies from Report-Only to <strong>On</strong></li></ol></div>`;
      } else if (currentExportFormat === 'json') {
        nextSteps.innerHTML = `<div class="cab-next-steps"><h4>📋 What to do next</h4><ol><li>Replace all <code>&lt;role-id&gt;</code>, <code>&lt;group-id&gt;</code>, <code>&lt;app-id&gt;</code> placeholders</li><li>POST each object to <code>https://graph.microsoft.com/v1.0/identity/conditionalAccess/policies</code></li><li>Use Graph Explorer or your automation tool</li><li>Verify in Entra portal → Conditional Access → Report-Only</li></ol></div>`;
      } else nextSteps.innerHTML = '';
    }
  }

  // #7: Basic syntax highlighting
  function highlightSyntax(code, lang) {
    let h = esc(code);
    if (lang === 'powershell') {
      h = h.replace(/(#[^\n]*)/g, '<span class="cab-syn-comment">$1</span>');
      h = h.replace(/("(?:[^"\\]|\\.)*")/g, '<span class="cab-syn-string">$1</span>');
      h = h.replace(/\b(New-MgIdentityConditionalAccessPolicy|Connect-MgGraph|Install-Module)\b/g, '<span class="cab-syn-keyword">$1</span>');
      h = h.replace(/(\$\w+)/g, '<span class="cab-syn-var">$1</span>');
    } else if (lang === 'json') {
      h = h.replace(/(\/\/[^\n]*)/g, '<span class="cab-syn-comment">$1</span>');
      h = h.replace(/("(?:[^"\\]|\\.)*")\s*:/g, '<span class="cab-syn-key">$1</span>:');
      h = h.replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <span class="cab-syn-string">$1</span>');
    }
    return h;
  }

  function generatePowerShell() {
    let ps = `# ═══════════════════════════════════════════════════════\n# Conditional Access Policies — PowerShell\n# Generated: ${new Date().toLocaleDateString()} by aguidetocloud.com/ca-builder\n# ⚠️ DEPLOY IN REPORT-ONLY MODE FIRST\n# ═══════════════════════════════════════════════════════\n\n# Install-Module Microsoft.Graph -Scope CurrentUser\n# Connect-MgGraph -Scopes "Policy.ReadWrite.ConditionalAccess"\n\n`;
    policySet.forEach((p, i) => {
      const num = String(i + 1).padStart(3, '0'), nm = `CA${num}-${tierShort(p.tier)}-${slugify(p.name)}`, isBlock = p.grant_controls.includes('Block access');
      ps += `# ── Policy ${i + 1}: ${p.name} ──\n$params${i + 1} = @{\n    DisplayName = "${nm}"\n    State = "enabledForReportingButNotEnforced"\n    Conditions = @{\n`;
      ps += `        Users = @{\n`;
      if (p.users.includes('All users')) ps += `            IncludeUsers = @("All")\n`;
      else if (p.users.includes('Guest')) ps += `            IncludeUsers = @("GuestsOrExternalUsers")\n`;
      else if (p.users.includes('Directory roles')) ps += `            IncludeRoles = @("62e90394-69f5-4237-9190-012177145e10")  # TODO: ${p.users}\n`;
      else if (p.users.includes('Groups:')) ps += `            IncludeGroups = @("<group-id>")  # TODO: ${p.users}\n`;
      else ps += `            IncludeUsers = @("All")\n`;
      if (p.exclusions && p.exclusions.length) ps += `            ExcludeGroups = @("<break-glass-group-id>")\n`;
      ps += `        }\n        Applications = @{\n`;
      if (p.target_apps === 'All cloud apps') ps += `            IncludeApplications = @("All")\n`;
      else if (p.target_apps === 'Office 365') ps += `            IncludeApplications = @("Office365")\n`;
      else if (p.target_apps.includes('Azure')) ps += `            IncludeApplications = @("797f4846-ba00-4fd7-ba43-dac1f8f63013")\n`;
      else if (p.target_apps.includes('Register security')) ps += `            IncludeUserActions = @("urn:user:registersecurityinfo")\n`;
      else ps += `            IncludeApplications = @("All")  # TODO: ${p.target_apps}\n`;
      ps += `        }\n`;
      if (p.conditions && p.conditions.length) p.conditions.forEach(c => {
        if (c.startsWith('Platforms:')) ps += `        Platforms = @{ IncludePlatforms = @(${c.replace('Platforms: ', '').split(', ').map(x => '"' + x.toLowerCase() + '"').join(', ')}) }\n`;
        else if (c.startsWith('Client apps:')) ps += `        ClientAppTypes = @(${c.replace('Client apps: ', '').split(', ').map(mapCA).map(x => '"' + x + '"').join(', ')})\n`;
        else if (c.startsWith('Sign-in risk:')) ps += `        SignInRiskLevels = @(${c.replace('Sign-in risk: ', '').split(', ').map(x => '"' + x.toLowerCase() + '"').join(', ')})\n`;
        else ps += `        # ${c}\n`;
      });
      ps += `    }\n    GrantControls = @{\n`;
      if (isBlock) ps += `        BuiltInControls = @("block")\n        Operator = "OR"\n`;
      else { const ctrls = p.grant_controls.map(mapCtrl); ps += `        BuiltInControls = @(${ctrls.map(c => '"' + c + '"').join(', ')})\n        Operator = "${p.grant_operator || 'OR'}"\n`; }
      ps += `    }\n`;
      if (p.session_controls && p.session_controls.length) {
        ps += `    SessionControls = @{\n`;
        p.session_controls.forEach(s => {
          if (s.startsWith('Sign-in frequency:')) { const v = s.replace('Sign-in frequency: ', ''); ps += v === 'Every time' ? `        SignInFrequency = @{ Value = 0; Type = "everyTime"; IsEnabled = $true }\n` : `        SignInFrequency = @{ Value = ${parseInt(v) || 8}; Type = "hours"; IsEnabled = $true }\n`; }
          else if (s.startsWith('Persistent browser:')) ps += `        PersistentBrowser = @{ Mode = "${s.includes('Never') ? 'never' : 'always'}"; IsEnabled = $true }\n`;
          else ps += `        # ${s}\n`;
        });
        ps += `    }\n`;
      }
      ps += `}\nNew-MgIdentityConditionalAccessPolicy -BodyParameter $params${i + 1}\n\n`;
    });
    return ps;
  }

  function mapCA(a) { return a.includes('Browser') ? 'browser' : a.includes('Mobile') || a.includes('desktop') ? 'mobileAppsAndDesktopClients' : a.includes('ActiveSync') ? 'exchangeActiveSync' : 'other'; }
  function mapCtrl(g) { const l = g.toLowerCase(); return l.includes('mfa') || l.includes('multifactor') ? 'mfa' : l.includes('compliant device') ? 'compliantDevice' : l.includes('hybrid') ? 'domainJoinedDevice' : l.includes('approved') ? 'approvedApplication' : l.includes('app protection') ? 'compliantApplication' : l.includes('password') ? 'passwordChange' : l.includes('terms') ? 'termsOfUse' : l.includes('authentication strength') ? 'authenticationStrength' : 'mfa'; }

  function generateGraphJSON() {
    const policies = policySet.map((p, i) => { const n = String(i + 1).padStart(3, '0'), isB = p.grant_controls.includes('Block access'), o = { displayName: `CA${n}-${tierShort(p.tier)}-${slugify(p.name)}`, state: 'enabledForReportingButNotEnforced', conditions: { users: {}, applications: {} }, grantControls: { operator: isB ? 'OR' : (p.grant_operator || 'OR'), builtInControls: isB ? ['block'] : p.grant_controls.map(mapCtrl) } };
      if (p.users.includes('All users')) o.conditions.users.includeUsers = ['All']; else if (p.users.includes('Guest')) o.conditions.users.includeUsers = ['GuestsOrExternalUsers']; else if (p.users.includes('Directory roles')) { o.conditions.users.includeRoles = ['<role-id>']; o.conditions.users._note = p.users; } else if (p.users.includes('Groups:')) { o.conditions.users.includeGroups = ['<group-id>']; o.conditions.users._note = p.users; } else o.conditions.users.includeUsers = ['All'];
      if (p.exclusions && p.exclusions.length) o.conditions.users.excludeGroups = ['<break-glass-group-id>'];
      if (p.target_apps === 'All cloud apps') o.conditions.applications.includeApplications = ['All']; else if (p.target_apps === 'Office 365') o.conditions.applications.includeApplications = ['Office365']; else if (p.target_apps.includes('Azure')) o.conditions.applications.includeApplications = ['797f4846-ba00-4fd7-ba43-dac1f8f63013']; else o.conditions.applications.includeApplications = ['All'];
      if (p.conditions && p.conditions.length) p.conditions.forEach(c => { if (c.startsWith('Platforms:')) o.conditions.platforms = { includePlatforms: c.replace('Platforms: ', '').split(', ').map(x => x.toLowerCase()) }; if (c.startsWith('Client apps:')) o.conditions.clientAppTypes = c.replace('Client apps: ', '').split(', ').map(mapCA); if (c.startsWith('Sign-in risk:')) o.conditions.signInRiskLevels = c.replace('Sign-in risk: ', '').split(', ').map(x => x.toLowerCase()); });
      if (p.session_controls && p.session_controls.length) { o.sessionControls = {}; p.session_controls.forEach(s => { if (s.startsWith('Sign-in frequency:')) { const v = s.replace('Sign-in frequency: ', ''); o.sessionControls.signInFrequency = v === 'Every time' ? { type: 'everyTime', isEnabled: true } : { value: parseInt(v) || 8, type: 'hours', isEnabled: true }; } if (s.startsWith('Persistent browser:')) o.sessionControls.persistentBrowser = { mode: s.includes('Never') ? 'never' : 'always', isEnabled: true }; }); }
      return o; });
    return `// Graph API JSON — POST /identity/conditionalAccess/policies\n// Replace <role-id>, <group-id>, <break-glass-group-id>\n\n` + JSON.stringify(policies, null, 2);
  }

  function generateCSV() { let c = 'Policy Name,Tier,Users,Target,Conditions,Controls,Session,Exclusions\n'; policySet.forEach(p => { c += `"${p.name}","${p.tier_label}","${p.users}","${p.target_apps}","${(p.conditions || []).join('; ')}","${p.grant_controls.join('; ')}","${(p.session_controls || []).join('; ')}","${(p.exclusions || []).join('; ')}"\n`; }); return c; }
  function generateDocs() { let d = `CONDITIONAL ACCESS POLICY DOCUMENTATION\n${'═'.repeat(45)}\nGenerated: ${new Date().toLocaleDateString()}\nPolicies: ${policySet.length}\n\n`; policySet.forEach((p, i) => { d += `${'─'.repeat(45)}\nPOLICY ${i + 1}: ${p.name}\n${'─'.repeat(45)}\nTier: ${p.tier_label}\nIntent: ${p.description || 'N/A'}\nUsers: ${p.users}\nExclusions: ${(p.exclusions || []).join(', ') || 'None'}\nTarget: ${p.target_apps}\nConditions: ${(p.conditions || []).join(', ') || 'None'}\nControls: ${p.grant_controls.join(' ' + (p.grant_operator || 'OR') + ' ')}\nSession: ${(p.session_controls || []).join(', ') || 'None'}\n\n`; }); return d; }
  function generateRollout() { return `ROLLOUT PLAN\n${'═'.repeat(40)}\n\n⚠️ Follow this sequence.\n\n1. PREPARE\n${'─'.repeat(30)}\n□ Create 2 break-glass accounts (Global Admin, FIDO2)\n□ Create break-glass security group\n□ Test break-glass sign-in\n\n2. REPORT-ONLY\n${'─'.repeat(30)}\n` + policySet.map(p => `□ "${p.name}" → Report-Only\n`).join('') + `□ Monitor 1-2 weeks\n\n3. PILOT\n${'─'.repeat(30)}\n□ Create pilot group (10-20 users)\n□ Enable for pilot only\n\n4. DEPLOY\n${'─'.repeat(30)}\n` + policySet.filter(p => p.tier === 'starting-point').map(p => `  1. ${p.name}\n`).join('') + policySet.filter(p => p.tier === 'enterprise').map(p => `  2. ${p.name}\n`).join('') + policySet.filter(p => !['starting-point', 'enterprise'].includes(p.tier)).map(p => `  3. ${p.name}\n`).join('') + `\n5. ONGOING\n${'─'.repeat(30)}\n□ Review quarterly\n□ Test break-glass monthly\n`; }

  // #14: Import from JSON
  function importPolicies(jsonStr) {
    try {
      const arr = JSON.parse(jsonStr);
      if (!Array.isArray(arr)) throw new Error('Expected array');
      let added = 0;
      arr.forEach(p => {
        if (p.displayName) {
          policySet.push({ id: 'imported-' + Date.now() + '-' + added, name: p.displayName, tier: 'custom', tier_label: 'Imported', description: '', users: (p.conditions?.users?.includeUsers || []).join(', ') || 'Unknown', exclusions: (p.conditions?.users?.excludeGroups || []).length ? ['Excluded groups configured'] : [], target_apps: (p.conditions?.applications?.includeApplications || []).join(', ') || 'Unknown', conditions: [], grant_controls: (p.grantControls?.builtInControls || []), grant_operator: p.grantControls?.operator || 'OR', session_controls: [], source: 'imported' });
          added++;
        }
      });
      savePolicies(); updateBadge();
      showToast(`✅ Imported ${added} policies`);
      $('[data-tab="review"]').click();
    } catch (e) { showToast('⚠️ Invalid JSON: ' + e.message); }
  }

  // #15: Compare sets
  function saveCurrentSet(name) {
    const sets = JSON.parse(localStorage.getItem(LS_SETS_KEY) || '[]');
    sets.push({ name: name || `Set ${sets.length + 1}`, date: new Date().toISOString(), policies: JSON.parse(JSON.stringify(policySet)) });
    localStorage.setItem(LS_SETS_KEY, JSON.stringify(sets));
    showToast('💾 Set saved: ' + (name || `Set ${sets.length}`));
  }

  /* Export buttons */
  if ($('#cab-export-copy')) $('#cab-export-copy').addEventListener('click', () => { const el = $('#cab-export-output'); navigator.clipboard.writeText(el.textContent || el.innerText).then(() => showToast('📋 Copied!')); });
  if ($('#cab-export-download')) $('#cab-export-download').addEventListener('click', () => { const ext = { powershell: 'ps1', json: 'json', csv: 'csv', docs: 'txt', rollout: 'txt' }; const el = $('#cab-export-output'); const b = new Blob([el.textContent || el.innerText], { type: 'text/plain' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `ca-policies.${ext[currentExportFormat] || 'txt'}`; a.click(); URL.revokeObjectURL(a.href); });

  /* ═══════════════════════════════════════════════════════
     HELPERS
     ═══════════════════════════════════════════════════════ */
  function renderPolicyCardHTML(p) { return `<div class="cab-policy-card__header"><h4 class="cab-policy-card__name">${esc(p.name || 'Untitled')}</h4><span class="cab-tier-badge cab-tier-badge--${tierClass(p.tier)}">${p.tier_label || 'Custom'}</span></div>${p.description ? `<p class="cab-policy-card__desc">${esc(p.description)}</p>` : ''}<div class="cab-policy-card__details"><div class="cab-detail-row"><span class="cab-detail-label">👥</span><span class="cab-detail-value">${esc(p.users || 'Not set')}</span></div><div class="cab-detail-row"><span class="cab-detail-label">🎯</span><span class="cab-detail-value">${esc(p.target_apps || 'Not set')}</span></div>${(p.conditions || []).length ? `<div class="cab-detail-row"><span class="cab-detail-label">📋</span><span class="cab-detail-value">${esc(p.conditions.join(', '))}</span></div>` : ''}<div class="cab-detail-row"><span class="cab-detail-label">✅</span><span class="cab-detail-value">${esc((p.grant_controls || []).join(' ' + (p.grant_operator || 'OR') + ' '))}</span></div>${(p.session_controls || []).length ? `<div class="cab-detail-row"><span class="cab-detail-label">⏱️</span><span class="cab-detail-value">${esc(p.session_controls.join(', '))}</span></div>` : ''}${(p.exclusions || []).length ? `<div class="cab-detail-row"><span class="cab-detail-label">🚫</span><span class="cab-detail-value">${esc(p.exclusions.join(', '))}</span></div>` : ''}</div>`; }

  function esc(s) { if (!s) return ''; const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function bind(id, ev, fn) { const el = document.getElementById(id); if (el) el.addEventListener(ev, fn); }
  function tierShort(t) { return { 'starting-point': 'SP', enterprise: 'ENT', specialised: 'SPEC' }[t] || 'CUST'; }
  function slugify(s) { return (s || '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 30); }
  function savePolicies() { try { localStorage.setItem(LS_KEY, JSON.stringify(policySet)); } catch (e) {} }
  function loadPolicies() { try { const d = localStorage.getItem(LS_KEY); return d ? JSON.parse(d) : []; } catch (e) { return []; } }
  function removePolicy(i) { lastRemoved = { p: policySet[i], i }; policySet.splice(i, 1); savePolicies(); updateBadge(); renderReview(); showToastUndo('🗑️ Removed', () => { if (lastRemoved) { policySet.splice(lastRemoved.i, 0, lastRemoved.p); savePolicies(); updateBadge(); renderReview(); lastRemoved = null; } }); }
  function clearAll() { if (!confirm('Remove all ' + policySet.length + ' policies?')) return; const bk = [...policySet]; policySet = []; savePolicies(); updateBadge(); renderReview(); renderTemplates(tplSearch ? tplSearch.value : '', tplTier ? tplTier.value : 'all'); showToastUndo('🗑️ Cleared all', () => { policySet = bk; savePolicies(); updateBadge(); renderReview(); }); }
  function updateBadge() { const b = $('#cab-policy-count'); if (b) { b.textContent = policySet.length; b.style.display = policySet.length > 0 ? 'inline-flex' : 'none'; } }
  function showToast(m) { let t = $('.cab-toast'); if (!t) { t = document.createElement('div'); t.className = 'cab-toast'; document.body.appendChild(t); } t.innerHTML = esc(m); t.classList.add('cab-toast--show'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('cab-toast--show'), 2500); }
  function showToastUndo(m, fn) { let t = $('.cab-toast'); if (!t) { t = document.createElement('div'); t.className = 'cab-toast'; document.body.appendChild(t); } t.innerHTML = `${esc(m)} <button class="cab-toast-undo" onclick="this.parentElement._u()">Undo</button>`; t._u = () => { fn(); t.classList.remove('cab-toast--show'); }; t.classList.add('cab-toast--show'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('cab-toast--show'), 5000); }
  function setGrantType(t) { wizardData.grantType = t; renderWizard(); }
  function setOperator(o) { wizardData.grantOperator = o; renderWizard(); }
  function updateURL() { const u = new URL(window.location), a = $('.cab-tab--active'); if (a) u.searchParams.set('tab', a.dataset.tab); history.replaceState(null, '', u); }
  function restoreURL() { const p = new URLSearchParams(window.location.search), tab = p.get('tab'); if (tab) { const b = $(`.cab-tab[data-tab="${tab}"]`); if (b) b.click(); } const s = p.get('set'); if (s && policySet.length === 0) { try { atob(s).split(',').forEach(id => addTemplate(id)); showToast('📋 Loaded shared set'); } catch (e) {} } }
  function getShareURL() { const u = new URL(window.location); u.searchParams.set('tab', 'review'); const ids = policySet.filter(p => p.source === 'template').map(p => p.id); if (ids.length) u.searchParams.set('set', btoa(ids.join(','))); return u.toString(); }
  function trackEvent(n) { if (window.clarity) window.clarity('event', 'cab_' + n); }

  window.__cab = { addTemplate, removePolicy, setGrantType, setOperator, addAllTier, customizeTemplate, clearAll, goToStep, editPolicy, applyScenario, importPolicies, saveCurrentSet, getShareURL };

  renderTemplates(); renderWizard(); updateBadge(); restoreURL(); trackEvent('load');
})();
