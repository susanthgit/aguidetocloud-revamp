/* ═══════════════════════════════════════════════════════════════
   PURVIEW STARTER KIT — purview-starter.js
   100% client-side. Zero API calls.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const D = window.__pvs || {};
  const KITS = D.kits || [];
  const STEPS = D.steps || [];
  const EMAILS = D.emails || [];
  const LICENSING = D.licensing || {};
  const SCENARIOS = D.scenarios || [];
  const LS_KEY = 'pvs_state';
  const LS_VER = 2;

  /* ── Utility ── */
  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function psEsc(s) { return String(s || '').replace(/'/g, "''"); }
  function $(id) { return document.getElementById(id); }
  function toast(msg) {
    const t = document.querySelector('.pvs-toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('pvs-toast--show');
    setTimeout(() => t.classList.remove('pvs-toast--show'), 2800);
  }
  function copyText(text) {
    navigator.clipboard.writeText(text).then(() => toast('Copied to clipboard!')).catch(() => {});
  }

  /* ── State ── */
  let S = {
    tab: 'kits',
    selectedKit: null,
    expandedKit: null,
    customLabels: [],
    enabledScenarios: [],
    editingLabelIdx: -1,
    deploySource: 'kit'
  };

  let _nextLabelId = 1;
  function genLabelId() { return 'custom-' + (_nextLabelId++); }

  function saveState() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        v: LS_VER, tab: S.tab, selectedKit: S.selectedKit,
        customLabels: S.customLabels, enabledScenarios: S.enabledScenarios,
        deploySource: S.deploySource
      }));
    } catch(e) {}
  }
  function loadState() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.v !== LS_VER) { localStorage.removeItem(LS_KEY); return; }
      if (d.selectedKit) S.selectedKit = d.selectedKit;
      if (d.deploySource) S.deploySource = d.deploySource;
      if (Array.isArray(d.customLabels)) S.customLabels = d.customLabels;
      if (Array.isArray(d.enabledScenarios)) S.enabledScenarios = d.enabledScenarios;
    } catch(e) {}
  }

  /* ── URL state ── */
  function readURL() {
    const p = new URLSearchParams(window.location.search);
    if (p.get('kit')) S.selectedKit = p.get('kit');
    if (p.get('tab')) S.tab = p.get('tab');
  }
  function writeURL() {
    const p = new URLSearchParams();
    if (S.selectedKit) p.set('kit', S.selectedKit);
    if (S.tab !== 'kits') p.set('tab', S.tab);
    const qs = p.toString();
    const url = window.location.pathname + (qs ? '?' + qs : '');
    history.replaceState(null, '', url);
  }

  /* ── Tab switching ── */
  function switchTab(tab) {
    S.tab = tab;
    document.querySelectorAll('.pvs-tab').forEach(t => {
      const active = t.dataset.tab === tab;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', active);
    });
    document.querySelectorAll('.pvs-panel').forEach(p => {
      p.classList.toggle('active', p.id === 'panel-' + tab);
    });
    writeURL();
    saveState();
  }

  /* ── Licence badge HTML ── */
  function licBadge(lic) {
    const map = {
      'e3': ['E3', 'pvs-licence-e3'],
      'e5': ['E5', 'pvs-licence-e5'],
      'e5-compliance': ['E5 Compliance', 'pvs-licence-e5-compliance'],
      'e5-security': ['E5 Security', 'pvs-licence-e5-compliance']
    };
    const [label, cls] = map[lic] || ['E3', 'pvs-licence-e3'];
    return '<span class="pvs-kit-licence ' + cls + '">' + esc(label) + '</span>';
  }

  /* ── Workload short names ── */
  function wlBadge(wl) {
    const map = { exchange: 'Email', sharepoint: 'SPO', onedrive: 'ODfB', teams: 'Teams', endpoint: 'Endpoint', powerbi: 'Power BI' };
    return '<span class="pvs-dlp-wl">' + esc(map[wl] || wl) + '</span>';
  }

  /* ── Render Starter Kits ── */
  function renderKits() {
    const grid = $('pvs-kits-grid');
    if (!grid || !KITS.length) return;

    grid.innerHTML = KITS.map(kit => {
      const isSelected = S.selectedKit === kit.id;
      const isExpanded = S.expandedKit === kit.id;
      return `
        <div class="pvs-kit-card${isSelected ? ' pvs-kit-selected' : ''}${isExpanded ? ' pvs-kit-expanded' : ''}" data-kit="${esc(kit.id)}">
          <div class="pvs-kit-header">
            <span class="pvs-kit-emoji">${esc(kit.emoji)}</span>
            <div>
              <div class="pvs-kit-title">${esc(kit.name)}</div>
              <div class="pvs-kit-target">${esc(kit.target)}</div>
            </div>
          </div>
          <div class="pvs-kit-desc">${esc(kit.description)}</div>
          <div class="pvs-kit-stats">
            <span class="pvs-kit-stat pvs-kit-stat--labels">🏷️ ${kit.labels ? kit.labels.length : kit.label_count} labels</span>
            <span class="pvs-kit-stat pvs-kit-stat--dlp">🛡️ ${kit.dlp_rules ? kit.dlp_rules.length : kit.dlp_count} DLP rules</span>
            ${licBadge(kit.licence)}
          </div>
          <div class="pvs-kit-details">
            ${renderKitLabels(kit)}
            ${renderKitDLP(kit)}
            <div class="pvs-kit-cta">
              <button class="pvs-btn pvs-btn--primary pvs-select-kit" data-kit="${esc(kit.id)}">
                ${isSelected ? '✓ Selected — View Deploy Plan' : 'Add to My Plan'}
              </button>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  function initKitGrid() {
    const grid = $('pvs-kits-grid');
    if (!grid) return;
    grid.addEventListener('click', e => {
      const card = e.target.closest('.pvs-kit-card');
      if (!card) return;

      const selectBtn = e.target.closest('.pvs-select-kit');
      if (selectBtn) {
        e.stopPropagation();
        const kitId = selectBtn.dataset.kit;
        S.selectedKit = kitId;
        saveState();
        renderKits();
        renderDeploy();
        updateDeployBadge();
        switchTab('deploy');
        toast(getKit(kitId).name + ' kit selected — here\'s your deploy plan');
        return;
      }

      const kitId = card.dataset.kit;
      S.expandedKit = S.expandedKit === kitId ? null : kitId;
      renderKits();
    });
  }

  function getKit(id) {
    return KITS.find(k => k.id === id) || null;
  }

  function renderKitLabels(kit) {
    if (!kit.labels || !kit.labels.length) return '';
    const parents = kit.labels.filter(l => !l.parent_id);
    let html = '<div class="pvs-kit-section-title">Sensitivity Labels</div><div class="pvs-label-tree">';

    parents.forEach(label => {
      html += renderLabelItem(label, false);
      const children = kit.labels.filter(l => l.parent_id === label.id);
      children.forEach(child => {
        html += renderLabelItem(child, true);
      });
    });

    html += '</div>';
    return html;
  }

  function renderLabelItem(label, isChild) {
    const badges = [];
    if (label.encrypt) badges.push('<span class="pvs-label-badge pvs-label-badge--encrypt">🔒 Encrypted</span>');
    if (label.mark) badges.push('<span class="pvs-label-badge pvs-label-badge--mark">📝 Marked</span>');
    if (label.auto_apply) badges.push('<span class="pvs-label-badge pvs-label-badge--auto">⚡ Auto</span>');

    return `<div class="pvs-label-item${isChild ? ' pvs-label-item--child' : ''} pvs-label-colour-${esc(label.colour)}">
      <span class="pvs-label-name">${isChild ? '└ ' : ''}${esc(label.name)}</span>
      <div class="pvs-label-badges">${badges.join('')}</div>
    </div>`;
  }

  function renderKitDLP(kit) {
    if (!kit.dlp_rules || !kit.dlp_rules.length) return '';
    let html = '<div class="pvs-kit-section-title">DLP Rules</div><div class="pvs-dlp-list">';

    kit.dlp_rules.forEach(rule => {
      html += `<div class="pvs-dlp-item">
        <span class="pvs-dlp-action pvs-dlp-action--${esc(rule.action)}">${esc(rule.action)}</span>
        <span class="pvs-dlp-desc">${esc(rule.description)}</span>
        <div class="pvs-dlp-workloads">${(rule.workloads || []).map(wlBadge).join('')}</div>
      </div>`;
    });

    html += '</div>';
    return html;
  }

  /* ── Update Deploy badge ── */
  function updateDeployBadge() {
    const badge = $('pvs-deploy-badge');
    if (!badge) return;
    const hasContent = S.selectedKit || S.customLabels.length > 0 || S.enabledScenarios.length > 0;
    badge.style.display = hasContent ? 'inline-flex' : 'none';
    badge.textContent = '✓';
  }

  /* ── Render Deploy Tab ── */
  function renderDeploy() {
    const empty = $('pvs-deploy-empty');
    const dash = $('pvs-deploy-dashboard');
    if (!empty || !dash) return;

    const hasKit = S.selectedKit && getKit(S.selectedKit);
    const hasCustom = S.customLabels.length > 0 || S.enabledScenarios.length > 0;

    if (!hasKit && !hasCustom) {
      empty.style.display = '';
      dash.style.display = 'none';
      return;
    }

    empty.style.display = 'none';
    dash.style.display = '';

    // Determine source
    const useCustom = S.deploySource === 'custom' && hasCustom;
    const kit = useCustom ? null : getKit(S.selectedKit);
    const labels = useCustom ? S.customLabels : (kit ? kit.labels : []);
    const dlpRules = useCustom ? S.enabledScenarios.map(id => SCENARIOS.find(s => s.id === id)).filter(Boolean) : (kit ? kit.dlp_rules : []);
    const planName = useCustom ? 'Custom Plan' : (kit ? kit.name : 'Plan');

    $('pvs-deploy-kit-name').textContent = planName;

    // Source toggle if both available
    const header = $('pvs-deploy-kit-name').parentElement;
    let toggleEl = header.querySelector('.pvs-deploy-source-toggle');
    if (hasKit && hasCustom) {
      if (!toggleEl) {
        toggleEl = document.createElement('div');
        toggleEl.className = 'pvs-deploy-source-toggle';
        header.insertBefore(toggleEl, header.querySelector('.pvs-btn'));
      }
      toggleEl.innerHTML =
        '<button class="pvs-btn pvs-btn--sm ' + (!useCustom ? 'pvs-btn--primary' : 'pvs-btn--secondary') + '" data-source="kit">Kit: ' + esc(getKit(S.selectedKit).name) + '</button>' +
        '<button class="pvs-btn pvs-btn--sm ' + (useCustom ? 'pvs-btn--primary' : 'pvs-btn--secondary') + '" data-source="custom">Custom Plan</button>';
      toggleEl.querySelectorAll('button').forEach(b => {
        b.addEventListener('click', () => {
          S.deploySource = b.dataset.source;
          saveState();
          renderDeploy();
        });
      });
    } else if (toggleEl) {
      toggleEl.remove();
    }

    renderDeploySteps();
    renderPowerShell({ name: planName, labels: labels || [], dlp_rules: dlpRules || [], licence: kit ? kit.licence : 'e5' });
    renderEmails({ name: planName, labels: labels || [], dlp_rules: dlpRules || [] });
    renderLicenceTable({ labels: labels || [], dlp_rules: dlpRules || [], licence: kit ? kit.licence : 'e5' });
  }

  function renderDeploySteps() {
    const el = $('pvs-deploy-steps');
    if (!el || !STEPS.length) return;

    el.innerHTML = STEPS.map(step => `
      <div class="pvs-step-card">
        <div class="pvs-step-num">${step.order}</div>
        <div class="pvs-step-content">
          <div class="pvs-step-title">${esc(step.title)}</div>
          <div class="pvs-step-desc">${esc(step.description)}</div>
          <div class="pvs-step-duration">⏱️ ${esc(step.duration)}</div>
        </div>
      </div>
    `).join('');
  }

  /* ── PowerShell Generation ── */
  function renderPowerShell(kit) {
    const el = $('pvs-ps-output');
    if (!el) return;

    let ps = '# ═══════════════════════════════════════════════════════════\n';
    ps += '# Purview Starter Kit — ' + kit.name + '\n';
    ps += '# Generated by aguidetocloud.com/purview-starter/\n';
    ps += '# ═══════════════════════════════════════════════════════════\n';
    ps += '# IMPORTANT: Review and customise before running in production.\n';
    ps += '# This is a starter scaffold, not a deploy-ready script.\n';
    ps += '# ═══════════════════════════════════════════════════════════\n\n';

    ps += '# Step 0: Connect to Security & Compliance PowerShell\n';
    ps += '# Install-Module ExchangeOnlineManagement -Force\n';
    ps += 'Connect-IPPSSession -UserPrincipalName admin@yourdomain.com\n\n';

    // Step 1: Create labels
    ps += '# ── Step 1: Create Sensitivity Labels ──\n\n';
    if (kit.labels) {
      const parents = kit.labels.filter(l => !l.parent_id);
      parents.forEach(label => {
        ps += generateLabelPS(label, kit);
        const children = kit.labels.filter(l => l.parent_id === label.id);
        children.forEach(child => {
          ps += generateLabelPS(child, kit);
        });
      });
    }

    // Step 2: Publish labels
    ps += '\n# ── Step 2: Publish Labels ──\n\n';
    const labelNames = (kit.labels || []).filter(l => !l.parent_id).map(l => "'" + psEsc(l.name) + "'").join(',');
    ps += "New-LabelPolicy -Name '" + psEsc(kit.name) + " Label Policy' `\n";
    ps += '  -Labels @(' + labelNames + ') `\n';
    ps += "  -ExchangeLocation 'All' `\n";
    ps += "  -Comment 'Published by Purview Starter Kit'\n\n";
    ps += '# NOTE: Labels take up to 24 hours to appear in Office apps\n\n';

    // Step 3: Create DLP policies (test mode)
    ps += '# ── Step 3: Create DLP Policies (Test Mode) ──\n\n';
    if (kit.dlp_rules) {
      kit.dlp_rules.forEach(rule => {
        // Handle both kit dlp_rules and DLP scenarios (different shapes)
        const r = {
          name: rule.name,
          description: rule.description || '',
          workloads: rule.workloads || [],
          action: rule.action || 'log',
          condition_summary: rule.condition_summary || rule.description || ''
        };
        ps += generateDLPPS(r, kit);
      });
    }

    ps += '\n# ── Step 4: Monitor for 2 weeks ──\n';
    ps += '# Check alerts at: https://compliance.microsoft.com/datalossprevention\n';
    ps += '# Get-DlpCompliancePolicy | Select-Object Name, Mode | Format-Table\n\n';

    ps += '# ── Step 5: Switch to Enforce (after testing) ──\n';
    ps += '# Set-DlpCompliancePolicy -Identity "Policy Name" -Mode "Enable"\n';
    ps += '# Enable ONE policy at a time. Monitor for 48h before enabling the next.\n';

    el.textContent = ps;
  }

  function generateLabelPS(label, kit) {
    let ps = '# Label: ' + label.name + '\n';
    ps += 'New-Label `\n';
    ps += "  -DisplayName '" + psEsc(label.name) + "' `\n";
    ps += "  -Name '" + psEsc(label.id) + "' `\n";
    ps += "  -Tooltip '" + psEsc(label.tooltip || '') + "' `\n";

    if (label.parent_id) {
      ps += "  -ParentId (Get-Label -Identity '" + psEsc(label.parent_id) + "').Guid `\n";
    }

    if (label.mark && label.mark_header) {
      ps += '  -ApplyContentMarkingHeaderEnabled $true `\n';
      ps += "  -ApplyContentMarkingHeaderText '" + psEsc(label.mark_header) + "' `\n";
    }
    if (label.mark && label.mark_footer) {
      ps += '  -ApplyContentMarkingFooterEnabled $true `\n';
      ps += "  -ApplyContentMarkingFooterText '" + psEsc(label.mark_footer) + "' `\n";
    }
    if (label.mark && label.mark_watermark) {
      ps += '  -ApplyWaterMarkingEnabled $true `\n';
      ps += "  -ApplyWaterMarkingText '" + psEsc(label.mark_watermark) + "' `\n";
    }
    if (label.encrypt) {
      ps += '  -EncryptionEnabled $true `\n';
      if (label.encrypt_scope === 'org-only') {
        ps += "  -EncryptionProtectionType 'Template' `\n";
        ps += '  # TODO: Set EncryptionRightsDefinitions for org-only access\n';
      } else {
        ps += "  -EncryptionProtectionType 'UserDefined' `\n";
        ps += '  # TODO: Configure user-defined encryption permissions\n';
      }
    }

    ps += "  -Comment 'Created by Purview Starter Kit'\n\n";
    return ps;
  }

  function generateDLPPS(rule) {
    let ps = '# DLP: ' + rule.name + '\n';
    ps += '# ' + rule.description + '\n';
    ps += 'New-DlpCompliancePolicy `\n';
    ps += "  -Name '" + psEsc(rule.name) + "' `\n";
    ps += "  -Mode 'TestWithNotifications' `\n";

    const locs = (rule.workloads || []);
    if (locs.includes('exchange')) ps += "  -ExchangeLocation 'All' `\n";
    if (locs.includes('sharepoint')) ps += "  -SharePointLocation 'All' `\n";
    if (locs.includes('onedrive')) ps += "  -OneDriveLocation 'All' `\n";
    if (locs.includes('teams')) ps += "  -TeamsLocation 'All' `\n";
    if (locs.includes('endpoint')) ps += "  -EndpointDlpLocation 'All' `\n";

    ps += "  -Comment 'Created by Purview Starter Kit'\n\n";

    ps += 'New-DlpComplianceRule `\n';
    ps += "  -Name '" + psEsc(rule.name) + " Rule' `\n";
    ps += "  -Policy '" + psEsc(rule.name) + "' `\n";

    if (rule.action === 'block') {
      ps += '  -BlockAccess $true `\n';
    } else if (rule.action === 'warn') {
      ps += "  -NotifyUser 'SiteAdmin' `\n";
    }

    ps += '  # TODO: Add conditions — ' + (rule.condition_summary || '') + '\n';
    ps += "  -Comment 'Created by Purview Starter Kit'\n\n";
    return ps;
  }

  /* ── Render Emails ── */
  function renderEmailBody(email, kit) {
    let body = email.body || '';
    const replacements = {
      '{kit_name}': kit.name,
      '{policy_name}': kit.name + ' Label Policy',
      '{label_summary}': (kit.labels || []).map(l => '- ' + l.name + (l.encrypt ? ' (encrypted)' : '')).join('\n'),
      '{dlp_summary}': (kit.dlp_rules || []).map(r => '- ' + r.name + ' [' + r.action.toUpperCase() + ']').join('\n')
    };
    for (const [k, v] of Object.entries(replacements)) {
      body = body.split(k).join(v);
    }
    return body;
  }

  function renderEmails(kit) {
    const el = $('pvs-emails');
    if (!el || !EMAILS.length) return;

    el.innerHTML = EMAILS.map(email => {
      const body = renderEmailBody(email, kit);
      return `<div class="pvs-email-card">
        <button class="pvs-email-header" aria-expanded="false">
          <div class="pvs-email-title">
            <span class="pvs-email-name">${esc(email.name)}</span>
            <span class="pvs-email-audience">For: ${esc(email.audience)}</span>
          </div>
          <span class="pvs-email-chevron">▼</span>
        </button>
        <div class="pvs-email-body">
          <div class="pvs-email-subject">Subject: ${esc(email.subject)}</div>
          <div class="pvs-email-content">${esc(body)}</div>
          <div class="pvs-email-actions">
            <button class="pvs-btn pvs-btn--sm pvs-btn--secondary pvs-copy-email" data-email-id="${esc(email.id)}">Copy Email</button>
          </div>
        </div>
      </div>`;
    }).join('');

    // Accordion toggle
    el.querySelectorAll('.pvs-email-header').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.pvs-email-card');
        const expanded = card.classList.toggle('pvs-email-expanded');
        btn.setAttribute('aria-expanded', expanded);
      });
    });

    // Copy handlers
    el.querySelectorAll('.pvs-copy-email').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const emailId = btn.dataset.emailId;
        const email = EMAILS.find(em => em.id === emailId);
        if (!email) return;
        const body = renderEmailBody(email, kit);
        copyText('Subject: ' + email.subject + '\n\n' + body);
      });
    });
  }

  /* ── Render Licence Table ── */
  function renderLicenceTable(kit) {
    const el = $('pvs-licence-table');
    if (!el) return;

    // Collect all features used by this kit
    const features = [];

    (kit.labels || []).forEach(label => {
      if (label.encrypt) features.push({ name: 'Encryption on "' + label.name + '"', tier: label.encrypt_scope === 'specific-people' ? 'e3' : 'e3' });
      if (label.mark) features.push({ name: 'Content marking on "' + label.name + '"', tier: 'e3' });
      if (label.auto_apply) features.push({ name: 'Auto-labeling for "' + label.name + '"', tier: 'e5' });
    });

    (kit.dlp_rules || []).forEach(rule => {
      features.push({ name: rule.name, tier: rule.licence || 'e3' });
    });

    // Dedupe by tier
    const byTier = {};
    features.forEach(f => {
      if (!byTier[f.tier]) byTier[f.tier] = [];
      byTier[f.tier].push(f);
    });

    let html = '<table><thead><tr><th>Feature</th><th>Licence Required</th></tr></thead><tbody>';
    features.forEach(f => {
      html += '<tr><td>' + esc(f.name) + '</td><td>' + licBadge(f.tier) + '</td></tr>';
    });
    html += '</tbody></table>';

    // Summary
    const highestTier = kit.licence;
    html += '<p style="margin-top:1rem;color:rgba(255,255,255,0.5);font-size:0.85rem">Minimum licence for full kit: ' + licBadge(highestTier) + '</p>';

    el.innerHTML = html;
  }

  /* ── Copy button handler ── */
  function initCopyButtons() {
    document.querySelectorAll('.pvs-copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.copy;
        const el = $(targetId);
        if (el) copyText(el.textContent);
      });
    });
  }

  /* ── Change kit button ── */
  function initChangeKit() {
    const btn = $('pvs-change-kit');
    if (btn) {
      btn.addEventListener('click', () => switchTab('kits'));
    }
  }

  /* ═══ LABEL BUILDER (Phase 2) ═══ */

  function renderLabelTemplates() {
    const el = $('pvs-lb-templates');
    if (!el) return;
    el.innerHTML = KITS.map(kit =>
      '<button class="pvs-lb-tpl-btn" data-kit="' + esc(kit.id) + '">' + esc(kit.emoji) + ' ' + esc(kit.name) + '</button>'
    ).join('');
  }

  function initLabelBuilder() {
    const tplContainer = $('pvs-lb-templates');
    const addBtn = $('pvs-lb-add');
    const clearBtn = $('pvs-lb-clear');
    const toDeployBtn = $('pvs-lb-to-deploy');

    if (tplContainer) {
      tplContainer.addEventListener('click', e => {
        const btn = e.target.closest('.pvs-lb-tpl-btn');
        if (!btn) return;
        const kit = getKit(btn.dataset.kit);
        if (!kit || !kit.labels) return;
        S.customLabels = kit.labels.map(l => ({ ...l, id: genLabelId(), parent_id: '' }));
        // Re-link parent IDs for sublabels
        const idMap = {};
        kit.labels.forEach((orig, i) => { idMap[orig.id] = S.customLabels[i].id; });
        S.customLabels.forEach((l, i) => {
          if (kit.labels[i].parent_id && idMap[kit.labels[i].parent_id]) {
            l.parent_id = idMap[kit.labels[i].parent_id];
          }
        });
        saveState();
        renderLabelTree();
        renderLabelPreview();
        toast(kit.name + ' labels loaded — customise below');
      });
    }

    if (addBtn) addBtn.addEventListener('click', () => openLabelModal(-1));
    if (clearBtn) clearBtn.addEventListener('click', () => {
      if (!S.customLabels.length) return;
      S.customLabels = [];
      saveState();
      renderLabelTree();
      renderLabelPreview();
      toast('Labels cleared');
    });
    if (toDeployBtn) toDeployBtn.addEventListener('click', () => {
      S.deploySource = 'custom';
      saveState();
      renderDeploy();
      updateDeployBadge();
      switchTab('deploy');
      toast('Custom labels ready for deploy');
    });

    initLabelModal();
  }

  function renderLabelTree() {
    const tree = $('pvs-lb-tree');
    const empty = $('pvs-lb-empty');
    const cta = $('pvs-lb-deploy-cta');
    if (!tree) return;

    if (!S.customLabels.length) {
      if (empty) empty.style.display = '';
      if (cta) cta.style.display = 'none';
      // Clear except the empty msg
      tree.querySelectorAll('.pvs-lb-card').forEach(c => c.remove());
      return;
    }
    if (empty) empty.style.display = 'none';
    if (cta) cta.style.display = '';

    const parents = S.customLabels.filter(l => !l.parent_id);
    let html = '';
    parents.forEach(label => {
      html += renderLBCard(label, false);
      S.customLabels.filter(l => l.parent_id === label.id).forEach(child => {
        html += renderLBCard(child, true);
      });
    });
    // Remove old cards, keep empty div
    tree.querySelectorAll('.pvs-lb-card').forEach(c => c.remove());
    tree.insertAdjacentHTML('beforeend', html);
  }

  function renderLBCard(label, isChild) {
    const idx = S.customLabels.indexOf(label);
    const badges = [];
    if (label.encrypt) badges.push('<span class="pvs-label-badge pvs-label-badge--encrypt">🔒</span>');
    if (label.mark) badges.push('<span class="pvs-label-badge pvs-label-badge--mark">📝</span>');
    if (label.auto_apply) badges.push('<span class="pvs-label-badge pvs-label-badge--auto">⚡</span>');
    return '<div class="pvs-lb-card' + (isChild ? ' pvs-lb-card--child' : '') + ' pvs-label-colour-' + esc(label.colour) + '" data-idx="' + idx + '">' +
      '<span class="pvs-lb-card-name">' + (isChild ? '└ ' : '') + esc(label.name || 'Untitled') + '</span>' +
      '<div class="pvs-lb-card-badges">' + badges.join('') + '</div>' +
      '<div class="pvs-lb-card-actions">' +
        '<button class="pvs-lb-card-btn pvs-lb-edit" data-idx="' + idx + '" aria-label="Edit label" title="Edit">✎</button>' +
        '<button class="pvs-lb-card-btn pvs-lb-move-up" data-idx="' + idx + '" aria-label="Move up" title="Move up">▲</button>' +
        '<button class="pvs-lb-card-btn pvs-lb-move-down" data-idx="' + idx + '" aria-label="Move down" title="Move down">▼</button>' +
        '<button class="pvs-lb-card-btn pvs-lb-card-btn--del pvs-lb-del" data-idx="' + idx + '" aria-label="Delete label" title="Delete">✕</button>' +
      '</div></div>';
  }

  function initLabelTree() {
    const tree = $('pvs-lb-tree');
    if (!tree) return;
    tree.addEventListener('click', e => {
      const editBtn = e.target.closest('.pvs-lb-edit');
      if (editBtn) { openLabelModal(+editBtn.dataset.idx); return; }
      const delBtn = e.target.closest('.pvs-lb-del');
      if (delBtn) {
        const idx = +delBtn.dataset.idx;
        const label = S.customLabels[idx];
        if (!label) return;
        // Remove children first, then the label itself
        S.customLabels = S.customLabels.filter(l => l.parent_id !== label.id && l !== label);
        saveState(); renderLabelTree(); renderLabelPreview();
        return;
      }
      const upBtn = e.target.closest('.pvs-lb-move-up');
      if (upBtn) { moveLabel(+upBtn.dataset.idx, -1); return; }
      const downBtn = e.target.closest('.pvs-lb-move-down');
      if (downBtn) { moveLabel(+downBtn.dataset.idx, 1); return; }
      // Click card to edit
      const card = e.target.closest('.pvs-lb-card');
      if (card && !e.target.closest('.pvs-lb-card-actions')) {
        openLabelModal(+card.dataset.idx);
      }
    });
  }

  function moveLabel(idx, dir) {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= S.customLabels.length) return;
    [S.customLabels[idx], S.customLabels[newIdx]] = [S.customLabels[newIdx], S.customLabels[idx]];
    saveState(); renderLabelTree(); renderLabelPreview();
  }

  function renderLabelPreview() {
    const dropdown = $('pvs-lb-ribbon-dropdown');
    if (!dropdown) return;
    if (!S.customLabels.length) {
      dropdown.innerHTML = '<div class="pvs-lb-ribbon-item" style="color:rgba(255,255,255,0.3);font-style:italic">No labels yet</div>';
      return;
    }
    const parents = S.customLabels.filter(l => !l.parent_id);
    let html = '';
    parents.forEach(label => {
      html += '<div class="pvs-lb-ribbon-item"><span class="pvs-lb-ribbon-dot pvs-lb-ribbon-dot--' + esc(label.colour) + '"></span>' + esc(label.name || 'Untitled') + '</div>';
      S.customLabels.filter(l => l.parent_id === label.id).forEach(child => {
        html += '<div class="pvs-lb-ribbon-item pvs-lb-ribbon-item--child"><span class="pvs-lb-ribbon-dot pvs-lb-ribbon-dot--' + esc(child.colour) + '"></span>' + esc(child.name || 'Untitled') + '</div>';
      });
    });
    dropdown.innerHTML = html;
  }

  /* ── Label Modal ── */
  function openLabelModal(idx) {
    S.editingLabelIdx = idx;
    const modal = $('pvs-lb-modal');
    if (!modal) return;
    const isEdit = idx >= 0 && S.customLabels[idx];
    const label = isEdit ? S.customLabels[idx] : { name: '', colour: 'blue', encrypt: false, encrypt_scope: 'org-only', mark: false, mark_header: '', mark_footer: '', mark_watermark: '', auto_apply: false, auto_pattern: 'pii', parent_id: '', tooltip: '' };

    $('pvs-lb-modal-title').textContent = isEdit ? 'Edit Label' : 'Add Label';
    $('pvs-lb-name').value = label.name || '';
    // Set colour
    document.querySelectorAll('.pvs-lb-colour-btn').forEach(b => b.classList.toggle('active', b.dataset.colour === label.colour));
    $('pvs-lb-encrypt').checked = !!label.encrypt;
    $('pvs-lb-encrypt-scope').value = label.encrypt_scope || 'org-only';
    $('pvs-lb-encrypt-scope').style.display = label.encrypt ? '' : 'none';
    $('pvs-lb-mark').checked = !!label.mark;
    $('pvs-lb-mark-fields').style.display = label.mark ? '' : 'none';
    $('pvs-lb-mark-header').value = label.mark_header || '';
    $('pvs-lb-mark-footer').value = label.mark_footer || '';
    $('pvs-lb-mark-watermark').value = label.mark_watermark || '';
    $('pvs-lb-auto').checked = !!label.auto_apply;
    $('pvs-lb-auto-pattern').value = label.auto_pattern || 'pii';
    $('pvs-lb-auto-pattern').style.display = label.auto_apply ? '' : 'none';

    // Parent selector
    const parentSelect = $('pvs-lb-parent');
    parentSelect.innerHTML = '<option value="">None — top-level label</option>';
    S.customLabels.forEach((l, i) => {
      if (i === idx || l.parent_id) return;
      parentSelect.innerHTML += '<option value="' + esc(l.id) + '"' + (label.parent_id === l.id ? ' selected' : '') + '>' + esc(l.name || 'Untitled') + '</option>';
    });

    modal.style.display = '';
    $('pvs-lb-name').focus();
  }

  function closeLabelModal() {
    const modal = $('pvs-lb-modal');
    if (modal) modal.style.display = 'none';
    S.editingLabelIdx = -1;
  }

  function saveLabelFromModal() {
    const name = $('pvs-lb-name').value.trim();
    if (!name) { $('pvs-lb-name').focus(); return; }
    const activeColour = document.querySelector('.pvs-lb-colour-btn.active');
    const label = {
      id: S.editingLabelIdx >= 0 ? S.customLabels[S.editingLabelIdx].id : genLabelId(),
      name: name,
      colour: activeColour ? activeColour.dataset.colour : 'blue',
      tooltip: name,
      encrypt: $('pvs-lb-encrypt').checked,
      encrypt_scope: $('pvs-lb-encrypt-scope').value,
      mark: $('pvs-lb-mark').checked,
      mark_header: $('pvs-lb-mark-header').value.trim(),
      mark_footer: $('pvs-lb-mark-footer').value.trim(),
      mark_watermark: $('pvs-lb-mark-watermark').value.trim(),
      auto_apply: $('pvs-lb-auto').checked,
      auto_pattern: $('pvs-lb-auto-pattern').value,
      parent_id: $('pvs-lb-parent').value
    };
    if (S.editingLabelIdx >= 0) {
      S.customLabels[S.editingLabelIdx] = label;
    } else {
      S.customLabels.push(label);
    }
    saveState();
    closeLabelModal();
    renderLabelTree();
    renderLabelPreview();
  }

  function initLabelModal() {
    const modal = $('pvs-lb-modal');
    if (!modal) return;
    $('pvs-lb-modal-close').addEventListener('click', closeLabelModal);
    $('pvs-lb-modal-cancel').addEventListener('click', closeLabelModal);
    $('pvs-lb-modal-save').addEventListener('click', saveLabelFromModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeLabelModal(); });

    // Colour buttons
    document.querySelectorAll('.pvs-lb-colour-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pvs-lb-colour-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Toggle visibility
    $('pvs-lb-encrypt').addEventListener('change', function() {
      $('pvs-lb-encrypt-scope').style.display = this.checked ? '' : 'none';
    });
    $('pvs-lb-mark').addEventListener('change', function() {
      $('pvs-lb-mark-fields').style.display = this.checked ? '' : 'none';
    });
    $('pvs-lb-auto').addEventListener('change', function() {
      $('pvs-lb-auto-pattern').style.display = this.checked ? '' : 'none';
    });

    // Enter to save
    $('pvs-lb-name').addEventListener('keydown', e => {
      if (e.key === 'Enter') saveLabelFromModal();
    });
    // Escape to close
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.style.display !== 'none') closeLabelModal();
    });
  }

  /* ═══ DLP SCENARIOS (Phase 2) ═══ */
  const DLP_CATEGORIES = [
    { id: 'protect', name: 'Protect Sensitive Data', emoji: '🔒' },
    { id: 'sharing', name: 'Control File Sharing', emoji: '📁' },
    { id: 'collaboration', name: 'Secure Collaboration', emoji: '💬' },
    { id: 'endpoint', name: 'Endpoint Protection', emoji: '💻' }
  ];

  function renderDLPScenarios() {
    const el = $('pvs-dlp-scenarios');
    if (!el || !SCENARIOS.length) return;

    el.innerHTML = DLP_CATEGORIES.map(cat => {
      const items = SCENARIOS.filter(s => s.category === cat.id);
      if (!items.length) return '';
      return '<div class="pvs-dlp-cat">' +
        '<div class="pvs-dlp-cat-title">' + esc(cat.emoji + ' ' + cat.name) + '</div>' +
        '<div class="pvs-dlp-cat-grid">' +
        items.map(s => {
          const enabled = S.enabledScenarios.includes(s.id);
          return '<div class="pvs-dlp-scenario-card' + (enabled ? ' pvs-dlp-enabled' : '') + '" data-scenario="' + esc(s.id) + '">' +
            '<div class="pvs-dlp-scenario-toggle">' +
              '<input type="checkbox" class="pvs-toggle pvs-dlp-toggle" data-scenario="' + esc(s.id) + '"' + (enabled ? ' checked' : '') + ' aria-label="' + esc(s.name) + '">' +
            '</div>' +
            '<div class="pvs-dlp-scenario-body">' +
              '<div class="pvs-dlp-scenario-name">' + esc(s.name) + '</div>' +
              '<div class="pvs-dlp-scenario-desc">' + esc(s.description) + '</div>' +
              '<div class="pvs-dlp-scenario-meta">' +
                '<span class="pvs-dlp-action pvs-dlp-action--' + esc(s.action) + '">' + esc(s.action) + '</span>' +
                (s.workloads || []).map(wlBadge).join('') +
                licBadge(s.licence) +
              '</div>' +
            '</div>' +
          '</div>';
        }).join('') +
        '</div></div>';
    }).join('');

    updateDLPSummary();
  }

  function initDLPScenarios() {
    const el = $('pvs-dlp-scenarios');
    if (!el) return;
    el.addEventListener('change', e => {
      const toggle = e.target.closest('.pvs-dlp-toggle');
      if (!toggle) return;
      const id = toggle.dataset.scenario;
      const card = toggle.closest('.pvs-dlp-scenario-card');
      if (toggle.checked) {
        if (!S.enabledScenarios.includes(id)) S.enabledScenarios.push(id);
        if (card) card.classList.add('pvs-dlp-enabled');
      } else {
        S.enabledScenarios = S.enabledScenarios.filter(s => s !== id);
        if (card) card.classList.remove('pvs-dlp-enabled');
      }
      saveState();
      updateDLPSummary();
    });

    // Click card to toggle
    el.addEventListener('click', e => {
      if (e.target.closest('.pvs-dlp-scenario-toggle')) return;
      const card = e.target.closest('.pvs-dlp-scenario-card');
      if (!card) return;
      const toggle = card.querySelector('.pvs-dlp-toggle');
      if (toggle) { toggle.checked = !toggle.checked; toggle.dispatchEvent(new Event('change', { bubbles: true })); }
    });

    const toDeployBtn = $('pvs-dlp-to-deploy');
    if (toDeployBtn) {
      toDeployBtn.addEventListener('click', () => {
        S.deploySource = 'custom';
        saveState();
        renderDeploy();
        updateDeployBadge();
        switchTab('deploy');
        toast('DLP scenarios ready for deploy');
      });
    }
  }

  function updateDLPSummary() {
    const countEl = $('pvs-dlp-summary-count');
    const btn = $('pvs-dlp-to-deploy');
    const n = S.enabledScenarios.length;
    if (countEl) countEl.textContent = n + ' scenario' + (n !== 1 ? 's' : '') + ' selected';
    if (btn) btn.style.display = n > 0 ? '' : 'none';
  }

  /* ── Init ── */
  const VALID_TABS = ['kits', 'labels', 'dlp', 'deploy', 'faq'];
  const VALID_KITS = KITS.map(k => k.id);

  function init() {
    // Add toast element
    if (!document.querySelector('.pvs-toast')) {
      const t = document.createElement('div');
      t.className = 'pvs-toast';
      t.setAttribute('role', 'status');
      t.setAttribute('aria-live', 'polite');
      document.body.appendChild(t);
    }

    loadState();
    readURL();

    // Validate state
    if (!VALID_TABS.includes(S.tab)) S.tab = 'kits';
    if (S.selectedKit && !VALID_KITS.includes(S.selectedKit)) S.selectedKit = null;

    // Tab switching
    document.querySelectorAll('.pvs-tab').forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    initKitGrid();
    renderKits();
    renderDeploy();
    updateDeployBadge();
    initCopyButtons();
    initChangeKit();

    // Phase 2: Label Builder
    renderLabelTemplates();
    initLabelBuilder();
    initLabelTree();
    renderLabelTree();
    renderLabelPreview();

    // Phase 2: DLP Scenarios
    renderDLPScenarios();
    initDLPScenarios();

    // "Go to kits" buttons (placeholders + empty states)
    document.querySelectorAll('.pvs-goto-kits').forEach(btn => {
      btn.addEventListener('click', () => switchTab('kits'));
    });

    // Set initial tab from state
    if (S.tab !== 'kits') switchTab(S.tab);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
