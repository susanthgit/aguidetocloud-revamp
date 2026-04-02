// Site search — loads JSON index and filters client-side
(function() {
  let searchIndex = null;
  const modal = document.getElementById('search-modal');
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  const openBtn = document.getElementById('search-btn');
  const closeBtn = document.getElementById('search-close');

  if (!modal || !input || !results) return;

  async function loadIndex() {
    if (searchIndex) return;
    try {
      const res = await fetch('/index.json');
      searchIndex = await res.json();
    } catch (e) {
      searchIndex = [];
    }
  }

  function openSearch() {
    loadIndex();
    modal.classList.add('active');
    input.value = '';
    results.innerHTML = '';
    setTimeout(() => input.focus(), 100);
  }

  function closeSearch() {
    modal.classList.remove('active');
  }

  // Abbreviation/synonym map — expand shorthand to match full terms
  const SYNONYMS = {
    'w365': 'windows 365',
    'avd': 'azure virtual desktop',
    'm365': 'microsoft 365',
    'o365': 'office 365',
    'aad': 'azure active directory entra',
    'mfa': 'multi-factor authentication',
    'dlp': 'data loss prevention',
    'sso': 'single sign-on',
    'rbac': 'role-based access control',
    'nsg': 'network security group',
    'vnet': 'virtual network',
    'vm': 'virtual machine',
    'aks': 'azure kubernetes service',
    'aci': 'azure container instances',
    'acr': 'azure container registry',
    'swa': 'static web app',
    'cicd': 'continuous integration delivery devops pipeline',
    'ci/cd': 'continuous integration delivery devops pipeline',
    'k8s': 'kubernetes',
    'gpt': 'gpt openai copilot',
    'llm': 'large language model',
    'rag': 'retrieval augmented generation',
    'mcp': 'model context protocol',
    'pe': 'prompt engineering',
    'copilot studio lite': 'agent builder',
    'agent builder': 'copilot studio lite',
    'bizchat': 'business chat microsoft 365',
    'pim': 'privileged identity management',
    'purview': 'microsoft purview compliance',
    'sentinel': 'microsoft sentinel siem',
    'intune': 'microsoft intune endpoint',
    'devops': 'azure devops pipeline',
  };

  function expandQuery(q) {
    const lower = q.toLowerCase();
    const expansion = SYNONYMS[lower];
    return expansion ? lower + ' ' + expansion : lower;
  }

  function doSearch(query) {
    if (!searchIndex || !query.trim()) {
      results.innerHTML = '';
      return;
    }
    const expanded = expandQuery(query.trim());
    const terms = expanded.split(/\s+/);
    const matches = searchIndex.filter(item => {
      const text = (item.title + ' ' + item.card_tag + ' ' + item.description + ' ' + item.section).toLowerCase();
      return terms.some(t => text.includes(t));
    }).slice(0, 12);

    if (matches.length === 0) {
      results.innerHTML = '<div class="search-no-results">No results found</div>';
      return;
    }

    results.innerHTML = matches.map(item => `
      <a href="${item.url}" class="search-result-item">
        <span class="search-result-title">${item.title}</span>
        <div class="search-result-meta">
          ${item.card_tag ? `<span class="search-result-badge ${item.tag_class}">${item.card_tag}</span>` : ''}
          ${item.type && item.type !== 'video' ? `<span class="search-result-badge" style="border-color:var(--neon-magenta);color:var(--neon-magenta)">${item.type === 'section' ? '📂 Section' : '📄 Page'}</span>` : ''}
          ${item.date ? `<span class="search-result-date">${item.date}</span>` : ''}
        </div>
      </a>
    `).join('');
  }

  if (openBtn) openBtn.addEventListener('click', openSearch);
  if (closeBtn) closeBtn.addEventListener('click', closeSearch);
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeSearch();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeSearch();
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
  });
  input.addEventListener('input', function() {
    doSearch(this.value);
  });
})();
