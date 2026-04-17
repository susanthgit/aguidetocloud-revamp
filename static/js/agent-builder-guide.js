/* ═══════════════════════════════════════════════════════════════
   M365 Agent Builder Guide — JS
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  // ── Tab switching ──
  const tabs = document.querySelectorAll('.abguide-tab');
  const panels = document.querySelectorAll('.abguide-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const panel = document.getElementById('panel-' + tab.dataset.tab);
      if (panel) panel.classList.add('active');
      history.replaceState(null, '', '#' + tab.dataset.tab);
    });
  });

  // Restore tab from URL hash
  const hash = location.hash.replace('#', '');
  if (hash) {
    const t = document.querySelector('.abguide-tab[data-tab="' + hash + '"]');
    if (t) t.click();
  }

  // ── Tier selection (Tab 1) ──
  const tierCards = document.querySelectorAll('.abguide-tier-card');
  const matrixEl = document.getElementById('capability-matrix');
  const matrixTitle = document.getElementById('matrix-title');
  const capGrid = document.getElementById('cap-grid');

  // Capability data is injected as data attributes or we parse from scenario badges
  // For simplicity, we define capabilities inline (matching the TOML)
  const CAPABILITIES = [
    { id: 'web_search', name: 'Web search knowledge', desc: 'Ground agents in public web content', free: true, paygo: true, paid: true },
    { id: 'web_urls', name: 'Public website URLs (up to 4)', desc: 'Add specific public URLs as knowledge', free: true, paygo: true, paid: true },
    { id: 'sharepoint', name: 'SharePoint knowledge', desc: 'Ground agents in SharePoint sites, folders, files', free: false, paygo: true, paid: true },
    { id: 'file_upload', name: 'Upload files (up to 20)', desc: 'Upload documents from your device', free: false, paygo: true, paid: true },
    { id: 'teams', name: 'Teams chat knowledge', desc: 'Ground agents in Teams chats, channels, transcripts', free: false, paygo: true, paid: true },
    { id: 'email', name: 'Outlook email knowledge', desc: 'Search your entire mailbox', free: false, paygo: true, paid: true },
    { id: 'graph', name: 'Enterprise Graph grounding', desc: 'Access files, emails, calendar, Teams across M365', free: false, paygo: true, paid: true },
    { id: 'connectors', name: 'M365 Copilot connectors', desc: 'Connect to admin-configured data sources', free: false, paygo: true, paid: true },
    { id: 'image_gen', name: 'Image generation (DALL-E)', desc: 'Create images within conversations', free: false, paygo: true, paid: true },
    { id: 'code_interpreter', name: 'Code interpreter', desc: 'Generate charts, analyse data, run calculations', free: false, paygo: true, paid: true },
    { id: 'share', name: 'Share with organisation', desc: 'Share agents with specific users or everyone', free: false, paygo: true, paid: true },
    { id: 'copy_to_studio', name: 'Copy to Copilot Studio', desc: 'Move your agent for advanced capabilities', free: true, paygo: true, paid: true }
  ];

  const TIER_LABELS = { free: 'Copilot Chat (Free)', paygo: 'Copilot Chat + Usage Billing', paid: 'M365 Copilot (Licensed)' };

  tierCards.forEach(card => {
    card.addEventListener('click', () => {
      const tier = card.dataset.tier;
      tierCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      matrixTitle.textContent = TIER_LABELS[tier] + ' — Capabilities';
      capGrid.innerHTML = '';

      CAPABILITIES.forEach(cap => {
        const available = cap[tier];
        const item = document.createElement('div');
        item.className = 'abguide-cap-item';
        item.setAttribute('data-available', String(available));
        item.innerHTML = '<span class="abguide-cap-icon"></span>' +
          '<div><span class="abguide-cap-name">' + esc(cap.name) + '</span>' +
          '<br><span class="abguide-cap-desc">' + esc(cap.desc) + '</span></div>';
        capGrid.appendChild(item);
      });

      matrixEl.style.display = 'block';
      matrixEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });

  // ── Scenario badges ──
  document.querySelectorAll('.abguide-scenario-badge').forEach(badge => {
    const req = badge.dataset.req;
    badge.textContent = req === 'free' ? 'Free tier' : 'Paid licence';
  });

  // Auto-select the "paid" tier to show value immediately
  const paidCard = document.querySelector('.abguide-tier-card[data-tier="paid"]');
  if (paidCard) paidCard.click();
})();
