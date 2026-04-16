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
  const LS_KEY = 'pvs_state';
  const LS_VER = 1;

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
    expandedKit: null
  };

  function saveState() {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ v: LS_VER, tab: S.tab, selectedKit: S.selectedKit })); } catch(e) {}
  }
  function loadState() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.v !== LS_VER) return;
      if (d.selectedKit) S.selectedKit = d.selectedKit;
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
    badge.style.display = S.selectedKit ? 'inline-flex' : 'none';
    badge.textContent = '✓';
  }

  /* ── Render Deploy Tab ── */
  function renderDeploy() {
    const empty = $('pvs-deploy-empty');
    const dash = $('pvs-deploy-dashboard');
    if (!empty || !dash) return;

    if (!S.selectedKit) {
      empty.style.display = '';
      dash.style.display = 'none';
      return;
    }

    const kit = getKit(S.selectedKit);
    if (!kit) return;

    empty.style.display = 'none';
    dash.style.display = '';

    $('pvs-deploy-kit-name').textContent = kit.name;
    renderDeploySteps();
    renderPowerShell(kit);
    renderEmails(kit);
    renderLicenceTable(kit);
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
        ps += generateDLPPS(rule, kit);
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
