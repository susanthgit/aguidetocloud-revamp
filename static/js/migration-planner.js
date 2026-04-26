/* =========================================================
   M365 Migration Planner — Client-side Logic  (v2)
   ========================================================= */
(function () {
  'use strict';

  const D = window.__migplanData;
  if (!D) return console.error('Migration Planner: data not loaded');

  /* =========================================================
     Section 1 — State
     ========================================================= */
  const S = {
    scenario: null, reason: null, userCount: null, workloads: [],
    dataVolume: null, largestMailbox: null, customApps: null,
    compliance: null, deadline: null, multiGeo: null,
    directory: null, experience: null,
    complexityScore: 0, complexityTier: '', approach: '',
    workloadScores: {}, workloadBreakdowns: {},
    risks: [], timelineWeeks: 0,
    currentTab: 'wizard', wizardStep: 0, wizardDone: false,
    scoreBreakdown: [], phaseEstimates: [],
    confidenceLevel: 0,       // count of 'unsure' answers
    discoveryData: {},         // V3 discovery import keyed by workload id
    discoveryApplied: false
  };

  /* =========================================================
     Section 2 — Human-readable label helper  (#5)
     ========================================================= */
  const HUMAN_LABELS = {
    reason: { merger: 'Merger / Acquisition', divestiture: 'Divestiture', modernise: 'Modernisation', compliance: 'Compliance / Regulatory', cost: 'Cost Reduction', consolidation: 'Consolidation' },
    deadline: { '1m': '1 Month', '3m': '3 Months', '6m': '6 Months', '12m': '12 Months', none: 'Flexible' },
    compliance: { none: 'Standard', basic: 'Basic (DLP)', advanced: 'Advanced (Legal holds, eDiscovery)', regulated: 'Regulated Industry' },
    multiGeo: { single: 'Single Region', multi: 'Multiple Regions', residency: 'Data Residency Required' },
    directory: { 'onprem-ad': 'On-Premises AD', hybrid: 'Hybrid AD + Entra', 'cloud-entra': 'Cloud-Only Entra ID', google: 'Google Directory' },
    experience: { first: 'First Migration', 'done-one': 'Some Experience', experienced: 'Experienced Team' },
    userCount: { tiny: '< 50', small: '50 – 500', medium: '500 – 5,000', large: '5,000 – 50,000', enterprise: '50,000+' },
    dataVolume: { tiny: 'Under 100 GB', small: '100 GB – 1 TB', medium: '1 – 10 TB', large: '10 – 50 TB', massive: '50 TB+' },
    customApps: { none: 'None', few: 'A Few (< 10)', many: 'Many (10 – 50)', complex: 'Complex (50+)', unsure: 'Not sure yet' }
  };

  function humanLabel(key, value) {
    if (!value) return '—';
    if (HUMAN_LABELS[key] && HUMAN_LABELS[key][value]) return HUMAN_LABELS[key][value];
    // Fallback — capitalise
    return String(value).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  /* =========================================================
     Section 3 — Wizard Questions  (with #9 "Not sure" options)
     ========================================================= */
  const QUESTIONS = [
    {
      id: 'scenario', question: 'What type of migration are you planning?',
      tip: '💡 Choose the scenario that best matches your situation.',
      options: [
        { value: 'onprem-cloud', emoji: '🏢', label: 'On-Premises → Cloud', desc: 'Exchange, SharePoint, file servers to M365' },
        { value: 'tenant-tenant', emoji: '🔄', label: 'Tenant-to-Tenant', desc: 'M365 to M365 (M&A, divestiture)' },
        { value: 'google-m365', emoji: '🔀', label: 'Google Workspace → M365', desc: 'Gmail, Drive, Groups to Microsoft 365' },
        { value: 'hybrid', emoji: '🔗', label: 'Hybrid Setup', desc: 'Long-term on-prem + cloud coexistence' },
        { value: 'other-source', emoji: '📦', label: 'Other Source', desc: 'Lotus Notes, Zimbra, etc.' }
      ]
    },
    {
      id: 'reason', question: 'What is driving this migration?',
      tip: '💡 This helps identify compliance and timeline risks.',
      options: [
        { value: 'merger', emoji: '🤝', label: 'Merger / Acquisition' },
        { value: 'divestiture', emoji: '✂️', label: 'Divestiture / Spin-off' },
        { value: 'modernise', emoji: '🚀', label: 'Modernisation' },
        { value: 'compliance', emoji: '📋', label: 'Compliance / Regulatory' },
        { value: 'cost', emoji: '💰', label: 'Cost Reduction' },
        { value: 'consolidation', emoji: '🔗', label: 'Tenant Consolidation' }
      ]
    },
    {
      id: 'userCount', question: 'How many users are you migrating?',
      tip: '💡 Include service accounts, shared mailboxes, and room mailboxes in your count.',
      options: [
        { value: 'tiny', emoji: '👤', label: 'Under 50', desc: 'Small team or startup' },
        { value: 'small', emoji: '👥', label: '50 – 500', desc: 'Small to mid-size org' },
        { value: 'medium', emoji: '🏢', label: '500 – 5,000', desc: 'Mid-size organisation' },
        { value: 'large', emoji: '🏙️', label: '5,000 – 50,000', desc: 'Large enterprise' },
        { value: 'enterprise', emoji: '🌍', label: '50,000+', desc: 'Global enterprise' }
      ]
    },
    {
      id: 'workloads', question: 'Which workloads are in scope?',
      tip: '💡 Select all that apply. More workloads = more complexity.',
      multi: true,
      options: D.workloads.map(w => ({ value: w.id, emoji: w.emoji, label: w.name }))
    },
    {
      id: 'dataVolume', question: 'What is your estimated total data volume?',
      tip: '💡 Include email, SharePoint, OneDrive, and file shares. Check admin center for usage reports.',
      options: [
        { value: 'tiny', emoji: '📁', label: 'Under 100 GB' },
        { value: 'small', emoji: '📂', label: '100 GB – 1 TB' },
        { value: 'medium', emoji: '💾', label: '1 – 10 TB' },
        { value: 'large', emoji: '🗄️', label: '10 – 50 TB' },
        { value: 'massive', emoji: '☁️', label: '50 TB+' },
        { value: 'unsure', emoji: '🤷', label: "I'm not sure yet" }
      ]
    },
    {
      id: 'largestMailbox', question: 'What is your largest mailbox size?',
      tip: '💡 Mailboxes over 50 GB need special handling. Check with Get-MailboxStatistics.',
      options: [
        { value: 'small', emoji: '📧', label: 'Under 2 GB' },
        { value: 'medium', emoji: '📧', label: '2 – 10 GB' },
        { value: 'large', emoji: '📧', label: '10 – 50 GB' },
        { value: 'xlarge', emoji: '📧', label: '50 – 100 GB' },
        { value: 'xxlarge', emoji: '📧', label: '100 GB+' },
        { value: 'unsure', emoji: '🤷', label: "I'm not sure yet" }
      ]
    },
    {
      id: 'customApps', question: 'How many custom apps and integrations do you have?',
      tip: '💡 Include Power Apps, Power Automate flows, Teams apps, third-party connectors, and LOB integrations.',
      options: [
        { value: 'none', emoji: '✨', label: 'None', desc: 'Standard M365 usage' },
        { value: 'few', emoji: '🔧', label: 'A Few (< 10)', desc: 'Some custom workflows' },
        { value: 'many', emoji: '⚙️', label: 'Many (10 – 50)', desc: 'Significant automation' },
        { value: 'complex', emoji: '🏗️', label: 'Complex (50+)', desc: 'Heavy customisation' },
        { value: 'unsure', emoji: '🤷', label: "I'm not sure yet" }
      ]
    },
    {
      id: 'compliance', question: 'What are your compliance requirements?',
      tip: '💡 This affects data handling, retention, and legal hold strategy.',
      options: [
        { value: 'none', emoji: '✅', label: 'Standard', desc: 'No special requirements' },
        { value: 'basic', emoji: '📋', label: 'Basic', desc: 'DLP, basic retention' },
        { value: 'advanced', emoji: '⚖️', label: 'Advanced', desc: 'Legal holds, eDiscovery, audit' },
        { value: 'regulated', emoji: '🏛️', label: 'Regulated Industry', desc: 'HIPAA, SOX, GDPR, etc.' },
        { value: 'unsure', emoji: '🤷', label: "I'm not sure yet" }
      ]
    },
    {
      id: 'deadline', question: 'Do you have a migration deadline?',
      tip: '💡 Deadlines affect approach selection and risk tolerance.',
      options: [
        { value: 'none', emoji: '🕐', label: 'No Deadline', desc: 'Flexible timeline' },
        { value: '1m', emoji: '⚡', label: '1 Month', desc: 'Urgent' },
        { value: '3m', emoji: '📅', label: '3 Months', desc: 'Standard' },
        { value: '6m', emoji: '📆', label: '6 Months', desc: 'Comfortable' },
        { value: '12m', emoji: '🗓️', label: '12 Months', desc: 'Long-term' }
      ]
    },
    {
      id: 'multiGeo', question: 'What is your geographic scope?',
      tip: '💡 Multi-geo and data residency requirements add complexity and cost.',
      options: [
        { value: 'single', emoji: '📍', label: 'Single Region', desc: 'One country/region' },
        { value: 'multi', emoji: '🌏', label: 'Multiple Regions', desc: 'Offices in several countries' },
        { value: 'residency', emoji: '🏛️', label: 'Data Residency Required', desc: 'Sovereignty/regulation' }
      ]
    },
    {
      id: 'directory', question: 'What is your current directory setup?',
      tip: '💡 This determines identity migration complexity.',
      options: [
        { value: 'onprem-ad', emoji: '🖥️', label: 'On-Prem AD Only' },
        { value: 'hybrid', emoji: '🔗', label: 'Hybrid AD + Entra' },
        { value: 'cloud-entra', emoji: '☁️', label: 'Cloud-Only (Entra ID)' },
        { value: 'google', emoji: '🔀', label: 'Google Directory' }
      ]
    },
    {
      id: 'experience', question: 'What is your team\'s migration experience?',
      tip: '💡 This helps tailor recommendations and risk assessment.',
      options: [
        { value: 'first', emoji: '🌱', label: 'First Time', desc: 'Never done an M365 migration' },
        { value: 'done-one', emoji: '✅', label: 'Done One Before', desc: 'Some experience' },
        { value: 'experienced', emoji: '🎯', label: 'Experienced', desc: 'Multiple migrations completed' }
      ]
    }
  ];

  /* =========================================================
     Section 4 — Adaptive Wizard helpers  (#8, #9)
     ========================================================= */
  function shouldSkip(qIndex) {
    const q = QUESTIONS[qIndex];
    if (!q) return false;
    // Skip largestMailbox (index 5) if exchange not in workloads
    if (q.id === 'largestMailbox' && !(S.workloads || []).includes('exchange')) return true;
    // Skip directory (index 10) if Google scenario — always Google directory
    if (q.id === 'directory' && S.scenario === 'google-m365') {
      S.directory = 'google';
      return true;
    }
    return false;
  }

  function nextVisibleStep(from, direction) {
    let step = from + direction;
    while (step >= 0 && step < QUESTIONS.length) {
      if (!shouldSkip(step)) return step;
      step += direction;
    }
    return direction > 0 ? QUESTIONS.length : 0; // boundary
  }

  function countUnsure() {
    let c = 0;
    ['dataVolume', 'largestMailbox', 'customApps', 'compliance'].forEach(k => {
      if (S[k] === 'unsure') c++;
    });
    S.confidenceLevel = c;
  }

  function confidenceBadge() {
    if (S.discoveryApplied) return '<span style="background:rgba(16,185,129,0.15);color:#10B981;padding:0.2rem 0.6rem;border-radius:6px;font-size:0.78rem;font-weight:700">🟢 High — based on actual discovery data</span>';
    if (S.confidenceLevel === 0) return '<span style="background:rgba(16,185,129,0.15);color:#10B981;padding:0.2rem 0.6rem;border-radius:6px;font-size:0.78rem;font-weight:700">🟢 High confidence</span>';
    if (S.confidenceLevel <= 2) return '<span style="background:rgba(234,179,8,0.15);color:#EAB308;padding:0.2rem 0.6rem;border-radius:6px;font-size:0.78rem;font-weight:700">🟡 Moderate — some estimates</span>';
    return '<span style="background:rgba(249,115,22,0.15);color:#F97316;padding:0.2rem 0.6rem;border-radius:6px;font-size:0.78rem;font-weight:700">🟠 Low — refine with discovery data</span>';
  }

  /* =========================================================
     Section 5 — Complexity Scoring
     ========================================================= */
  const SCORE_MAP = {
    scenario: { 'onprem-cloud': 12, 'tenant-tenant': 16, 'google-m365': 14, 'hybrid': 15, 'other-source': 18 },
    userCount: { tiny: 2, small: 6, medium: 12, large: 16, enterprise: 20 },
    dataVolume: { tiny: 1, small: 4, medium: 8, large: 12, massive: 15, unsure: 8 },
    customApps: { none: 0, few: 3, many: 7, complex: 10, unsure: 5 },
    compliance: { none: 0, basic: 3, advanced: 7, regulated: 10, unsure: 5 },
    multiGeo: { single: 0, multi: 3, residency: 5 },
    deadline: { none: 0, '12m': 1, '6m': 2, '3m': 4, '1m': 5 },
    largestMailbox: { small: 0, medium: 1, large: 2, xlarge: 3, xxlarge: 4, unsure: 2 },
    reason: { merger: 3, divestiture: 4, modernise: 1, compliance: 3, cost: 1, consolidation: 2 },
    experience: { first: 4, 'done-one': 1, experienced: 0 },
    directory: { 'onprem-ad': 3, hybrid: 2, 'cloud-entra': 0, google: 2 }
  };

  const SCORE_LABELS = {
    scenario: 'Migration type', userCount: 'Organisation size', dataVolume: 'Data volume',
    workloads: 'Workload count', customApps: 'Custom apps', compliance: 'Compliance requirements',
    multiGeo: 'Geographic scope', deadline: 'Deadline pressure', largestMailbox: 'Largest mailbox',
    reason: 'Migration driver', experience: 'Team experience', directory: 'Directory complexity'
  };

  function calcComplexity() {
    S.scoreBreakdown = [];
    let score = 0;
    const add = (key, val) => { if (val > 0) { S.scoreBreakdown.push({ label: SCORE_LABELS[key] || key, points: val }); score += val; } };
    add('scenario', SCORE_MAP.scenario[S.scenario] || 0);
    add('userCount', SCORE_MAP.userCount[S.userCount] || 0);
    add('dataVolume', SCORE_MAP.dataVolume[S.dataVolume] || 0);
    add('workloads', Math.min(S.workloads.length * 2, 15));
    add('customApps', SCORE_MAP.customApps[S.customApps] || 0);
    add('compliance', SCORE_MAP.compliance[S.compliance] || 0);
    add('multiGeo', SCORE_MAP.multiGeo[S.multiGeo] || 0);
    add('deadline', SCORE_MAP.deadline[S.deadline] || 0);
    add('largestMailbox', SCORE_MAP.largestMailbox[S.largestMailbox] || 0);
    add('reason', SCORE_MAP.reason[S.reason] || 0);
    add('experience', SCORE_MAP.experience[S.experience] || 0);
    add('directory', SCORE_MAP.directory[S.directory] || 0);
    S.scoreBreakdown.sort((a, b) => b.points - a.points);
    S.complexityScore = Math.min(score, 100);
    if (score <= 25) S.complexityTier = 'simple';
    else if (score <= 50) S.complexityTier = 'moderate';
    else if (score <= 75) S.complexityTier = 'complex';
    else S.complexityTier = 'critical';
  }

  /* =========================================================
     Section 6 — Approach Selection  (#2 bigbang fix)
     ========================================================= */
  function getApproach() {
    const sc = D.scenarios.find(s => s.id === S.scenario);
    if (!sc) return 'phased';
    const size = { tiny: 1, small: 2, medium: 3, large: 4, enterprise: 5 }[S.userCount] || 3;
    // #2 — bigbang for tiny orgs with tight deadlines
    if (size <= 1 && (S.deadline === '1m' || S.deadline === '3m') && sc.approaches.includes('bigbang')) return 'bigbang';
    // Cutover only for tiny orgs
    if (size <= 1 && sc.approaches.includes('cutover')) return 'cutover';
    // Staged for small orgs
    if (size <= 2 && sc.approaches.includes('staged')) return 'staged';
    // Phased for medium+
    if (sc.approaches.includes('phased')) return 'phased';
    // Hybrid if available for large+
    if (size >= 4 && sc.approaches.includes('hybrid')) return 'hybrid';
    return 'phased';
  }

  function getTierLabel(tier) {
    return { simple: '🟢 Simple Migration', moderate: '🟡 Moderate Migration', complex: '🟠 Complex Migration', critical: '🔴 Critical Migration' }[tier] || tier;
  }

  function tierColor(tier) {
    return { simple: '#10B981', moderate: '#EAB308', complex: '#F97316', critical: '#EF4444' }[tier] || '#fff';
  }

  /* =========================================================
     Section 7 — Workload Scoring  (#12 breakdown)
     ========================================================= */
  function scoreWorkloads() {
    S.workloadScores = {};
    S.workloadBreakdowns = {};
    S.workloads.forEach(wid => {
      const w = D.workloads.find(x => x.id === wid);
      if (!w) return;
      let base = 75;
      const bd = []; // breakdown
      if (S.complexityScore > 50) { base -= 15; bd.push({ reason: 'High overall complexity (>50)', delta: -15 }); }
      if (S.complexityScore > 75) { base -= 15; bd.push({ reason: 'Critical complexity (>75)', delta: -15 }); }
      if (wid === 'exchange' && (S.largestMailbox === 'xlarge' || S.largestMailbox === 'xxlarge')) { base -= 10; bd.push({ reason: 'Very large mailboxes', delta: -10 }); }
      if (wid === 'sharepoint' && S.customApps === 'complex') { base -= 15; bd.push({ reason: 'Complex custom apps affect SP', delta: -15 }); }
      if (wid === 'teams' && S.scenario === 'google-m365') { base -= 10; bd.push({ reason: 'Google→M365 Teams migration gap', delta: -10 }); }
      if (wid === 'identity' && S.directory === 'onprem-ad') { base -= 10; bd.push({ reason: 'On-prem AD directory migration', delta: -10 }); }
      if (wid === 'security' && (S.compliance === 'advanced' || S.compliance === 'regulated')) { base -= 15; bd.push({ reason: 'Advanced/regulated compliance', delta: -15 }); }
      if (wid === 'power' && S.customApps !== 'none' && S.customApps !== 'unsure') { base -= 10; bd.push({ reason: 'Custom apps impact Power Platform', delta: -10 }); }

      // Discovery data adjustments (#14)
      if (S.discoveryApplied && S.discoveryData[wid]) {
        const dd = S.discoveryData[wid];
        if (wid === 'exchange') {
          if (dd.mailboxCount > 5000) { base -= 5; bd.push({ reason: 'Discovery: >5K mailboxes', delta: -5 }); }
          if (dd.avgMailboxSizeGB > 20) { base -= 5; bd.push({ reason: 'Discovery: avg mailbox >20 GB', delta: -5 }); }
          if (dd.sharedMailboxes > 100) { base -= 3; bd.push({ reason: 'Discovery: >100 shared mailboxes', delta: -3 }); }
        }
        if (wid === 'sharepoint') {
          if (dd.siteCount > 500) { base -= 5; bd.push({ reason: 'Discovery: >500 SP sites', delta: -5 }); }
          if (dd.totalDataTB > 5) { base -= 8; bd.push({ reason: 'Discovery: >5 TB SP data', delta: -8 }); }
          if (dd.customSolutions > 20) { base -= 5; bd.push({ reason: 'Discovery: >20 custom solutions', delta: -5 }); }
        }
        if (wid === 'onedrive') {
          if (dd.avgStorageGB > 50) { base -= 5; bd.push({ reason: 'Discovery: avg OD storage >50 GB', delta: -5 }); }
        }
        if (wid === 'teams') {
          if (dd.teamCount > 500) { base -= 5; bd.push({ reason: 'Discovery: >500 Teams', delta: -5 }); }
          if (dd.channelCount > 2000) { base -= 5; bd.push({ reason: 'Discovery: >2K channels', delta: -5 }); }
        }
        if (wid === 'identity') {
          if (dd.guestCount > 500) { base -= 5; bd.push({ reason: 'Discovery: >500 guests', delta: -5 }); }
          if (dd.caPolicyCount > 30) { base -= 3; bd.push({ reason: 'Discovery: >30 CA policies', delta: -3 }); }
        }
        if (wid === 'power') {
          if (dd.appCount > 50) { base -= 5; bd.push({ reason: 'Discovery: >50 Power Apps', delta: -5 }); }
          if (dd.flowCount > 100) { base -= 5; bd.push({ reason: 'Discovery: >100 Power Automate flows', delta: -5 }); }
        }
      }

      S.workloadScores[wid] = Math.max(20, Math.min(95, base));
      S.workloadBreakdowns[wid] = bd;
    });
  }

  /* =========================================================
     Section 8 — Risk Filtering  (#3 google-source fix)
     ========================================================= */
  function filterRisks() {
    const userFactors = new Set();
    if (S.dataVolume === 'large' || S.dataVolume === 'massive') userFactors.add('large-data-volume');
    if (S.customApps === 'many' || S.customApps === 'complex') userFactors.add('many-custom-apps');
    if (S.experience === 'first') userFactors.add('first-migration');
    if (S.compliance === 'regulated') userFactors.add('regulated-industry');
    if (S.compliance === 'advanced' || S.compliance === 'regulated') userFactors.add('active-legal-holds');
    if (S.userCount === 'large' || S.userCount === 'enterprise') userFactors.add('large-user-count');
    if (S.multiGeo === 'multi' || S.multiGeo === 'residency') userFactors.add('multi-geo');
    // #3 — only add google-source for google-m365, NOT other-source
    if (S.scenario === 'google-m365') userFactors.add('google-source');
    if (S.scenario === 'other-source') userFactors.add('other-source');
    if (S.deadline === '1m' || S.deadline === '3m') userFactors.add('tight-deadline');

    S.risks = D.risks.filter(r => {
      if (r.scenarios && r.scenarios.length && !r.scenarios.includes(S.scenario)) return false;
      if (r.workloads && r.workloads.length && !r.workloads.some(w => S.workloads.includes(w))) return false;
      return true;
    }).map(r => {
      let boosted = r.severity;
      if (r.likelihood_factors && r.likelihood_factors.some(f => userFactors.has(f))) {
        const sev = { low: 'medium', medium: 'high' };
        boosted = sev[r.severity] || r.severity;
      }
      return { ...r, displaySeverity: boosted };
    });

    const sev = { critical: 0, high: 1, medium: 2, low: 3 };
    S.risks.sort((a, b) => (sev[a.displaySeverity] || 9) - (sev[b.displaySeverity] || 9));
  }

  /* =========================================================
     Section 9 — Timeline Estimation  (#10 approach-aware, #11 throughput)
     ========================================================= */
  function estimateTimeline() {
    const tier = S.userCount || 'small';
    const dataMultiplier = { tiny: 0.8, small: 1, medium: 1.2, large: 1.5, massive: 2, unsure: 1.2 }[S.dataVolume] || 1;
    const workloadMultiplier = S.workloads.length <= 2 ? 0.8 : S.workloads.length <= 4 ? 1 : S.workloads.length <= 6 ? 1.3 : 1.5;
    const complianceMultiplier = { none: 1, basic: 1.1, advanced: 1.3, regulated: 1.5, unsure: 1.2 }[S.compliance] || 1;
    const appsMultiplier = { none: 1, few: 1.1, many: 1.3, complex: 1.5, unsure: 1.2 }[S.customApps] || 1;
    const experienceMultiplier = { first: 1.3, 'done-one': 1, experienced: 0.85 }[S.experience] || 1;

    // #10 — approach modifiers
    const isCutoverBigbang = S.approach === 'cutover' || S.approach === 'bigbang';
    const isHybrid = S.approach === 'hybrid';
    const isPhased = S.approach === 'phased';

    // #11 — throughput floor for production phase
    let estDataGB = { tiny: 50, small: 500, medium: 5000, large: 25000, massive: 100000, unsure: 5000 }[S.dataVolume] || 5000;
    // Use discovery data if available
    if (S.discoveryApplied) {
      let discoveredGB = 0;
      Object.values(S.discoveryData).forEach(dd => {
        if (dd.totalDataTB) discoveredGB += dd.totalDataTB * 1024;
        if (dd.mailboxCount && dd.avgMailboxSizeGB) discoveredGB += dd.mailboxCount * dd.avgMailboxSizeGB;
        if (dd.userCount && dd.avgStorageGB) discoveredGB += dd.userCount * dd.avgStorageGB;
      });
      if (discoveredGB > 0) estDataGB = discoveredGB;
    }
    const avgThroughputGBperHour = 10;
    const migrationHours = estDataGB / avgThroughputGBperHour;
    const throughputFloorWeeks = Math.ceil(migrationHours / (10 * 5)); // 10 hrs/day, 5 days/week

    let totalWeeks = 0;
    const phases = [];

    // #10 — if hybrid approach, inject coexistence setup phase
    if (isHybrid) {
      phases.push({ id: 'coexistence', name: 'Coexistence Setup', emoji: '🔗', description: 'Configure hybrid coexistence: cross-tenant routing, shared calendars, address book sync.', weeks: 4, milestones: ['Cross-tenant mail routing configured', 'Free/busy sharing established', 'Address book sync validated', 'Coexistence tested end-to-end'] });
      totalWeeks += 4;
    }

    D.timeline.phases.forEach(p => {
      let weeks = p.duration_by_size[tier] || 2;

      // #10 — approach adjustments
      if (isCutoverBigbang && p.id === 'pilot') return; // skip pilot
      if (isCutoverBigbang && p.id === 'planning') weeks = Math.ceil(weeks * 0.5); // halve planning
      if (isCutoverBigbang && p.id === 'production') weeks = Math.ceil(weeks * 2); // double risk factor

      // Standard multipliers
      if (p.id === 'discovery') weeks = Math.ceil(weeks * workloadMultiplier * complianceMultiplier);
      else if (p.id === 'planning') weeks = Math.ceil(weeks * appsMultiplier * complianceMultiplier * experienceMultiplier);
      else if (p.id === 'production') {
        weeks = Math.ceil(weeks * dataMultiplier * workloadMultiplier);
        if (isPhased) weeks = Math.ceil(weeks * 1.3); // #10 more waves
        // #11 throughput floor
        weeks = Math.max(weeks, throughputFloorWeeks);
      }
      else if (p.id === 'post-migration') weeks = Math.ceil(weeks * experienceMultiplier);

      totalWeeks += weeks;
      phases.push({ ...p, weeks });
    });

    S.phaseEstimates = phases;
    S.timelineWeeks = totalWeeks;
  }

  function getDeadlineWeeks() {
    return { '1m': 4, '3m': 13, '6m': 26, '12m': 52, none: 999 }[S.deadline] || 999;
  }

  /* =========================================================
     Section 10 — Tool Filtering  (#4 org_size filter)
     ========================================================= */
  function getUserSizeRanges() {
    // Map S.userCount to size range keys that overlap with tool org_size
    const mapping = {
      tiny: ['small', 'any'],
      small: ['small', 'small-medium', 'any'],
      medium: ['small-medium', 'medium', 'medium-enterprise', 'any'],
      large: ['medium-enterprise', 'large', 'enterprise', 'any'],
      enterprise: ['enterprise', 'large', 'medium-enterprise', 'any']
    };
    return mapping[S.userCount] || ['any'];
  }

  function filterTools() {
    const sizeRanges = getUserSizeRanges();
    return D.tools.filter(t => {
      if (t.scenarios && t.scenarios.length && !t.scenarios.includes(S.scenario)) return false;
      if (t.workloads && t.workloads.length && !t.workloads.some(w => S.workloads.includes(w))) return false;
      // #4 — org_size filter
      if (t.org_size && t.org_size !== 'any' && !sizeRanges.includes(t.org_size)) return false;
      return true;
    });
  }

  /* =========================================================
     Section 11 — Tab Switching
     ========================================================= */
  function switchTab(tab) {
    S.currentTab = tab;
    document.querySelectorAll('.migplan-tab').forEach(t => {
      t.setAttribute('aria-selected', t.dataset.tab === tab ? 'true' : 'false');
    });
    document.querySelectorAll('.migplan-panel').forEach(p => {
      p.classList.toggle('active', p.id === 'panel-' + tab);
    });
    updateURL();
    if (window.clarity) window.clarity('event', 'migplan_tab_' + tab);
  }

  /* =========================================================
     Section 12 — URL State
     ========================================================= */
  function updateURL() {
    if (!S.wizardDone) return;
    const p = new URLSearchParams();
    p.set('scenario', S.scenario || '');
    p.set('reason', S.reason || '');
    p.set('users', S.userCount || '');
    p.set('workloads', S.workloads.join(','));
    p.set('data', S.dataVolume || '');
    p.set('mailbox', S.largestMailbox || '');
    p.set('apps', S.customApps || '');
    p.set('compliance', S.compliance || '');
    p.set('deadline', S.deadline || '');
    p.set('geo', S.multiGeo || '');
    p.set('dir', S.directory || '');
    p.set('exp', S.experience || '');
    p.set('tab', S.currentTab);
    history.replaceState(null, '', '?' + p.toString());
  }

  function loadFromURL() {
    const p = new URLSearchParams(location.search);
    if (p.has('scenario') && p.get('scenario')) {
      S.scenario = p.get('scenario');
      S.reason = p.get('reason') || null;
      S.userCount = p.get('users') || null;
      S.workloads = p.get('workloads') ? p.get('workloads').split(',').filter(Boolean) : [];
      S.dataVolume = p.get('data') || null;
      S.largestMailbox = p.get('mailbox') || null;
      S.customApps = p.get('apps') || null;
      S.compliance = p.get('compliance') || null;
      S.deadline = p.get('deadline') || null;
      S.multiGeo = p.get('geo') || null;
      S.directory = p.get('dir') || null;
      S.experience = p.get('exp') || null;
      if (S.userCount && S.workloads.length > 0) {
        S.wizardDone = true;
        runCalculations();
        renderAllPanels();
      }
    }
    if (p.has('tab')) {
      const tab = p.get('tab');
      if (['wizard', 'workloads', 'timeline', 'risks', 'tools', 'summary'].includes(tab)) {
        switchTab(tab);
      }
    }
  }

  /* =========================================================
     Section 13 — Calculation + Render helpers
     ========================================================= */
  function runCalculations() {
    countUnsure();
    calcComplexity();
    S.approach = getApproach();
    scoreWorkloads();
    filterRisks();
    estimateTimeline();
  }

  function renderAllPanels() {
    renderResults();
    renderWorkloads();
    renderTimeline();
    renderRisks();
    renderTools();
    renderSummary();
  }

  /* =========================================================
     Section 14 — Wizard Renderer  (#7 Recent Plans, #8 adaptive)
     ========================================================= */
  function renderWizard() {
    const el = document.getElementById('migplan-wizard');
    if (!el) return;

    if (S.wizardDone) {
      renderResults();
      return;
    }

    const q = QUESTIONS[S.wizardStep];
    const total = QUESTIONS.length;
    const progress = ((S.wizardStep) / total * 100).toFixed(0);

    // #7 — Recent Plans UI (show only at step 0 with no answers)
    let recentPlansHtml = '';
    if (S.wizardStep === 0 && !S.scenario) {
      try {
        const hist = JSON.parse(localStorage.getItem(LS_HISTORY) || '[]');
        if (hist.length > 0) {
          const cards = hist.slice(0, 3).map((h, i) => {
            const sc = D.scenarios.find(s => s.id === h.scenario);
            const emoji = sc ? sc.emoji : '📦';
            const name = sc ? sc.name : h.scenario;
            const date = h.savedAt ? new Date(h.savedAt).toLocaleDateString() : '';
            return `<button class="migplan-option" data-restore="${i}" style="text-align:left;padding:0.75rem 1rem">
              <span class="migplan-option-emoji">${emoji}</span>
              <span class="migplan-option-label">${name}</span>
              <span class="migplan-option-desc">Score: ${h.complexityScore || '?'} · ${date}</span>
            </button>`;
          }).join('');
          recentPlansHtml = `
            <div style="margin-bottom:2rem;padding:1.25rem;background:rgba(99,102,241,0.06);border:1px solid rgba(99,102,241,0.12);border-radius:12px">
              <div style="font-size:0.85rem;font-weight:700;color:#fff;margin-bottom:0.75rem">📋 Recent Plans</div>
              <div style="display:flex;flex-direction:column;gap:0.5rem">${cards}</div>
            </div>`;
        }
      } catch (e) { /* ignore */ }
    }

    let optionsHtml = q.options.map((o, oi) => {
      const isSelected = q.multi
        ? (S[q.id] || []).includes(o.value)
        : S[q.id] === o.value;
      return `<button class="migplan-option ${q.multi ? 'multi-select' : ''} ${isSelected ? 'selected' : ''}"
        data-value="${o.value}" role="option" aria-selected="${isSelected}">
        <span class="migplan-option-emoji">${o.emoji}</span>
        <span class="migplan-option-label">${o.label}${!q.multi ? ' <span style="font-size:0.65rem;opacity:0.4;margin-left:0.3rem">[' + (oi + 1) + ']</span>' : ''}</span>
        ${o.desc ? `<span class="migplan-option-desc">${o.desc}</span>` : ''}
      </button>`;
    }).join('');

    const canNext = q.multi ? (S[q.id] || []).length > 0 : S[q.id] != null;
    const isLast = nextVisibleStep(S.wizardStep, 1) >= QUESTIONS.length;

    // Live preview after step 3
    let livePreviewHtml = '';
    if (S.wizardStep >= 3 && S.scenario && S.userCount) {
      const prevScore = (SCORE_MAP.scenario[S.scenario] || 0) + (SCORE_MAP.userCount[S.userCount] || 0) +
        (SCORE_MAP.dataVolume[S.dataVolume] || 0) + Math.min((S.workloads || []).length * 2, 15) +
        (SCORE_MAP.customApps[S.customApps] || 0) + (SCORE_MAP.compliance[S.compliance] || 0) +
        (SCORE_MAP.reason[S.reason] || 0) + (SCORE_MAP.experience[S.experience] || 0);
      const prevTier = prevScore <= 25 ? '🟢 Simple' : prevScore <= 50 ? '🟡 Moderate' : prevScore <= 75 ? '🟠 Complex' : '🔴 Critical';
      livePreviewHtml = `
        <div style="background:rgba(99,102,241,0.06);border:1px solid rgba(99,102,241,0.12);border-radius:10px;padding:0.75rem 1rem;margin-bottom:1.5rem;display:flex;justify-content:space-around;text-align:center;flex-wrap:wrap;gap:0.5rem">
          <div><div style="font-size:1.2rem;font-weight:800;color:var(--accent)">${Math.min(prevScore, 100)}</div><div style="font-size:0.7rem;color:var(--text-muted)">Score so far</div></div>
          <div><div style="font-size:0.9rem;font-weight:700;color:#fff">${prevTier}</div><div style="font-size:0.7rem;color:var(--text-muted)">Complexity</div></div>
          <div><div style="font-size:0.9rem;font-weight:700;color:#fff">${(S.workloads || []).length}</div><div style="font-size:0.7rem;color:var(--text-muted)">Workloads</div></div>
        </div>`;
    }

    el.innerHTML = `
      ${recentPlansHtml}
      <div class="migplan-wizard-progress">
        <span class="migplan-wizard-step-label">Question ${S.wizardStep + 1} of ${total}</span>
        <div class="migplan-wizard-progress-bar">
          <div class="migplan-wizard-progress-fill" style="width:${progress}%"></div>
        </div>
      </div>
      ${livePreviewHtml}
      <div class="migplan-question">${q.question}</div>
      <div class="migplan-question-tip"><span class="tip-icon">${q.tip}</span></div>
      <div class="migplan-options" role="listbox" aria-label="${q.question}">
        ${optionsHtml}
      </div>
      <div class="migplan-wizard-nav">
        ${S.wizardStep > 0
          ? '<button class="migplan-btn migplan-btn-secondary" id="wizard-back">← Back</button>'
          : '<div></div>'}
        <button class="migplan-btn migplan-btn-primary" id="wizard-next" ${canNext ? '' : 'disabled'}>
          ${isLast ? '🚀 Generate Plan' : 'Next →'}
        </button>
      </div>
    `;

    // Option click handlers
    el.querySelectorAll('.migplan-option[data-value]').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.value;
        if (q.multi) {
          if (!S[q.id]) S[q.id] = [];
          const idx = S[q.id].indexOf(val);
          if (idx >= 0) S[q.id].splice(idx, 1);
          else S[q.id].push(val);
        } else {
          S[q.id] = val;
        }
        saveToStorage();
        renderWizard();
      });
    });

    // #7 — Restore plan click handlers
    el.querySelectorAll('[data-restore]').forEach(btn => {
      btn.addEventListener('click', () => {
        try {
          const hist = JSON.parse(localStorage.getItem(LS_HISTORY) || '[]');
          const plan = hist[parseInt(btn.dataset.restore)];
          if (!plan) return;
          const keys = ['scenario', 'reason', 'userCount', 'workloads', 'dataVolume', 'largestMailbox', 'customApps', 'compliance', 'deadline', 'multiGeo', 'directory', 'experience'];
          keys.forEach(k => { if (plan[k] !== undefined) S[k] = plan[k]; });
          S.wizardDone = true;
          runCalculations();
          renderAllPanels();
          updateURL();
          saveToStorage();
          if (window.clarity) window.clarity('event', 'migplan_restore_plan');
        } catch (e) { /* ignore */ }
      });
    });

    // Nav handlers with #8 adaptive skip
    const backBtn = el.querySelector('#wizard-back');
    const nextBtn = el.querySelector('#wizard-next');
    if (backBtn) backBtn.addEventListener('click', () => {
      S.wizardStep = nextVisibleStep(S.wizardStep, -1);
      saveToStorage();
      renderWizard();
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
      const nextStep = nextVisibleStep(S.wizardStep, 1);
      if (nextStep >= QUESTIONS.length) { finishWizard(); }
      else { S.wizardStep = nextStep; saveToStorage(); renderWizard(); }
    });
  }

  function finishWizard() {
    S.wizardDone = true;
    runCalculations();
    renderAllPanels();
    updateURL();
    saveToStorage();
    if (window.clarity) window.clarity('event', 'migplan_wizard_complete');
  }

  /* =========================================================
     Section 15 — Results Card  (#6 Edit Answers)
     ========================================================= */
  function renderResults() {
    const el = document.getElementById('migplan-wizard');
    if (!el) return;
    const sc = D.scenarios.find(s => s.id === S.scenario);
    const ap = D.approaches.find(a => a.id === S.approach);
    const userLabel = humanLabel('userCount', S.userCount);

    const breakdownHtml = (S.scoreBreakdown || []).slice(0, 6).map(b =>
      `<div style="display:flex;justify-content:space-between;align-items:center;padding:0.25rem 0;border-bottom:1px solid rgba(255,255,255,0.04)">
        <span style="font-size:0.8rem;color:#aaa">${b.label}</span>
        <span style="font-size:0.8rem;font-weight:700;color:var(--accent)">+${b.points}</span>
      </div>`
    ).join('');

    el.innerHTML = `
      <div class="migplan-score-card">
        <div class="migplan-score-number" style="color:${tierColor(S.complexityTier)}">${S.complexityScore}</div>
        <div class="migplan-score-label">Complexity Score (out of 100)</div>
        <div class="migplan-score-tier ${S.complexityTier}">${getTierLabel(S.complexityTier)}</div>
        <div style="text-align:center;margin:0.5rem 0">${confidenceBadge()}</div>
        <div class="migplan-score-meta">
          <span>${sc ? sc.emoji : ''} <strong>${sc ? sc.name : S.scenario}</strong></span>
          <span>👥 <strong>${userLabel} users</strong></span>
          <span>📦 <strong>${S.workloads.length} workloads</strong></span>
          <span>📋 <strong>${ap ? ap.name : S.approach}</strong></span>
        </div>
        <div class="migplan-score-narrative">${generateNarrative()}</div>

        <button class="migplan-toggle-btn" style="margin:1rem auto;display:block;font-size:0.85rem" onclick="this.nextElementSibling.classList.toggle('open');this.textContent=this.nextElementSibling.classList.contains('open')?'▲ Hide score breakdown':'📊 Why this score?'">📊 Why this score?</button>
        <div class="migplan-toggle-content" style="max-width:400px;margin:0 auto;background:rgba(99,102,241,0.06);border-radius:10px;padding:1rem">
          <div style="font-size:0.78rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:0.5rem">Score Breakdown</div>
          ${breakdownHtml}
          <div style="display:flex;justify-content:space-between;padding:0.4rem 0;margin-top:0.3rem;border-top:1px solid rgba(99,102,241,0.2)">
            <span style="font-size:0.85rem;font-weight:700;color:#fff">Total</span>
            <span style="font-size:0.85rem;font-weight:700;color:${tierColor(S.complexityTier)}">${S.complexityScore}</span>
          </div>
        </div>

        <div class="migplan-score-actions">
          <button class="migplan-btn migplan-btn-primary" onclick="MIGPLAN.switchTab('workloads')">📊 View Workloads</button>
          <button class="migplan-btn migplan-btn-primary" onclick="MIGPLAN.switchTab('timeline')">📅 View Timeline</button>
          <button class="migplan-btn migplan-btn-primary" onclick="MIGPLAN.switchTab('summary')">📄 Executive Summary</button>
          <button class="migplan-btn migplan-btn-secondary" onclick="MIGPLAN.editAnswers()">✏️ Edit Answers</button>
          <button class="migplan-btn migplan-btn-secondary" onclick="MIGPLAN.restart()">🔄 Start Over</button>
        </div>
      </div>
    `;
  }

  function generateNarrative() {
    const parts = [];
    const sc = D.scenarios.find(s => s.id === S.scenario);
    if (sc) parts.push(`Your ${sc.name.toLowerCase()} migration`);
    else parts.push('Your migration');

    if (S.complexityTier === 'simple') parts.push('is relatively straightforward.');
    else if (S.complexityTier === 'moderate') parts.push('requires solid planning and coordination.');
    else if (S.complexityTier === 'complex') parts.push('has significant complexity — consider engaging specialist help.');
    else parts.push('is high-risk and requires experienced migration partners.');

    if (S.workloads.length > 5) parts.push(`With ${S.workloads.length} workloads in scope, a phased approach is recommended.`);
    if (S.compliance === 'regulated') parts.push('Regulated industry compliance adds constraints that must be addressed early.');
    if (S.deadline === '1m') parts.push('⚠️ Your 1-month deadline is extremely aggressive — consider negotiating more time.');
    if (S.deadline === '3m' && S.complexityScore > 50) parts.push('⚠️ A 3-month deadline for this complexity level will require parallel workstreams.');
    if (S.customApps === 'complex') parts.push('Your extensive custom apps will need thorough testing and remediation.');
    if (S.reason === 'merger' || S.reason === 'divestiture') parts.push('M&A migrations often have hard deadlines — start domain transfer planning early.');
    if (S.reason === 'compliance') parts.push('Compliance-driven migrations require thorough documentation of every step.');
    if (S.experience === 'first') parts.push('Since this is your first migration, consider engaging Microsoft FastTrack (free for 150+ licences) or a certified partner.');
    if (S.experience === 'experienced') parts.push('Your experience will help, but every environment has surprises — don\'t skip the pilot phase.');
    if (S.directory === 'onprem-ad') parts.push('Your on-premises AD will need Entra Connect setup — plan this in the preparation phase.');
    if (S.directory === 'google' && S.scenario !== 'google-m365') parts.push('Your Google directory will need to be migrated to Entra ID.');
    if (S.confidenceLevel >= 3) parts.push('⚠️ Several answers are estimated — run a discovery assessment to increase plan accuracy.');

    return parts.join(' ');
  }

  /* =========================================================
     Section 16 — Workloads Renderer  (#12 score breakdown, #14 discovery)
     ========================================================= */
  function renderWorkloads() {
    const el = document.getElementById('migplan-workloads-content');
    if (!el || !S.wizardDone) return;

    // #14 — Discovery Import panel
    const discoveryFields = {
      exchange: [
        { key: 'mailboxCount', label: 'Mailbox count', type: 'number', placeholder: 'e.g. 2500' },
        { key: 'avgMailboxSizeGB', label: 'Avg mailbox size (GB)', type: 'number', placeholder: 'e.g. 5' },
        { key: 'sharedMailboxes', label: 'Shared mailboxes', type: 'number', placeholder: 'e.g. 50' }
      ],
      sharepoint: [
        { key: 'siteCount', label: 'Site count', type: 'number', placeholder: 'e.g. 200' },
        { key: 'totalDataTB', label: 'Total data (TB)', type: 'number', placeholder: 'e.g. 2.5' },
        { key: 'customSolutions', label: 'Custom solutions', type: 'number', placeholder: 'e.g. 10' }
      ],
      onedrive: [
        { key: 'userCount', label: 'User count', type: 'number', placeholder: 'e.g. 1000' },
        { key: 'avgStorageGB', label: 'Avg storage (GB)', type: 'number', placeholder: 'e.g. 15' }
      ],
      teams: [
        { key: 'teamCount', label: 'Team count', type: 'number', placeholder: 'e.g. 150' },
        { key: 'channelCount', label: 'Channel count', type: 'number', placeholder: 'e.g. 500' }
      ],
      identity: [
        { key: 'userCount', label: 'User count', type: 'number', placeholder: 'e.g. 5000' },
        { key: 'guestCount', label: 'Guest count', type: 'number', placeholder: 'e.g. 200' },
        { key: 'caPolicyCount', label: 'CA policy count', type: 'number', placeholder: 'e.g. 15' }
      ],
      power: [
        { key: 'appCount', label: 'Power App count', type: 'number', placeholder: 'e.g. 25' },
        { key: 'flowCount', label: 'Flow count', type: 'number', placeholder: 'e.g. 60' }
      ]
    };

    let discoveryHtml = '';
    const discoveryWorkloads = S.workloads.filter(wid => discoveryFields[wid]);
    if (discoveryWorkloads.length > 0) {
      const fieldsHtml = discoveryWorkloads.map(wid => {
        const w = D.workloads.find(x => x.id === wid);
        const fields = discoveryFields[wid];
        const existing = S.discoveryData[wid] || {};
        return `<div style="margin-bottom:1rem">
          <div style="font-size:0.85rem;font-weight:700;color:#fff;margin-bottom:0.5rem">${w ? w.emoji + ' ' + w.name : wid}</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:0.5rem">
            ${fields.map(f => `<div>
              <label style="font-size:0.72rem;color:var(--text-muted);display:block;margin-bottom:0.2rem">${f.label}</label>
              <input type="number" class="migplan-discovery-input" data-wid="${wid}" data-key="${f.key}"
                value="${existing[f.key] || ''}" placeholder="${f.placeholder}"
                style="width:100%;padding:0.4rem 0.6rem;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:0.82rem">
            </div>`).join('')}
          </div>
        </div>`;
      }).join('');

      discoveryHtml = `
        <div style="margin-bottom:1.5rem">
          <button class="migplan-toggle-btn" style="font-size:0.85rem;margin-bottom:0.75rem" id="discovery-toggle">📥 Refine with actual data${S.discoveryApplied ? ' <span style="background:rgba(16,185,129,0.15);color:#10B981;padding:0.15rem 0.5rem;border-radius:4px;font-size:0.7rem;margin-left:0.5rem">📊 Applied</span>' : ''}</button>
          <div class="migplan-toggle-content" id="discovery-panel" style="background:rgba(99,102,241,0.06);border:1px solid rgba(99,102,241,0.12);border-radius:12px;padding:1.25rem">
            <p style="font-size:0.82rem;color:#999;margin-bottom:1rem">Enter numbers from your discovery assessment to get more precise scores and timelines. All processing stays in your browser — nothing is sent anywhere.</p>
            ${fieldsHtml}
            <button class="migplan-btn migplan-btn-primary" id="apply-discovery" style="margin-top:0.75rem">✅ Apply Discovery Data</button>
          </div>
        </div>`;
    }

    const cards = S.workloads.map(wid => {
      const w = D.workloads.find(x => x.id === wid);
      if (!w) return '';
      const score = S.workloadScores[wid] || 50;
      const scoreLabel = score >= 70 ? 'Ready' : score >= 40 ? 'Needs Work' : 'At Risk';
      const scoreColor = score >= 70 ? '#10B981' : score >= 40 ? '#EAB308' : '#EF4444';

      const migrateHtml = w.migrates.slice(0, 4).map(m => `<li>✅ ${m}</li>`).join('');
      const noMigrateHtml = w.does_not_migrate.slice(0, 4).map(m => `<li>❌ ${m}</li>`).join('');
      const blockerHtml = w.common_blockers.slice(0, 3).map(b => `<li>⚠️ ${b}</li>`).join('');
      const checklistHtml = (w.assessment_items || []).map(item =>
        `<li style="padding:0.3rem 0">☐ <strong>${item.label}</strong><br><span style="font-size:0.75rem;color:#777">${item.tip}</span></li>`
      ).join('');

      // #12 — Workload score breakdown
      const bd = S.workloadBreakdowns[wid] || [];
      let breakdownToggle = '';
      if (bd.length > 0) {
        const bdRows = bd.map(b =>
          `<div style="display:flex;justify-content:space-between;padding:0.2rem 0;border-bottom:1px solid rgba(255,255,255,0.04)">
            <span style="font-size:0.75rem;color:#aaa">${b.reason}</span>
            <span style="font-size:0.75rem;font-weight:700;color:#EF4444">${b.delta}</span>
          </div>`
        ).join('');
        breakdownToggle = `
          <button class="migplan-toggle-btn" style="font-size:0.78rem;margin-top:0.5rem"
            onclick="this.nextElementSibling.classList.toggle('open');this.textContent=this.nextElementSibling.classList.contains('open')?'▲ Hide score detail':'📊 Why this score?'">📊 Why this score?</button>
          <div class="migplan-toggle-content" style="background:rgba(99,102,241,0.06);border-radius:8px;padding:0.75rem;margin-top:0.25rem">
            <div style="display:flex;justify-content:space-between;padding:0.2rem 0;margin-bottom:0.3rem"><span style="font-size:0.75rem;color:var(--text-muted)">Base score</span><span style="font-size:0.75rem;font-weight:700;color:#10B981">75</span></div>
            ${bdRows}
            <div style="display:flex;justify-content:space-between;padding:0.3rem 0;margin-top:0.3rem;border-top:1px solid rgba(99,102,241,0.2)"><span style="font-size:0.78rem;font-weight:700;color:#fff">Final</span><span style="font-size:0.78rem;font-weight:700;color:${scoreColor}">${score}</span></div>
          </div>`;
      }

      return `
        <div class="migplan-workload-card">
          <div class="migplan-workload-header">
            <span class="migplan-workload-name">${w.emoji} ${w.name}</span>
            <span class="migplan-workload-score-badge" style="background:${scoreColor}20;color:${scoreColor}">${score} — ${scoreLabel}</span>
          </div>
          <div class="migplan-workload-bar">
            <div class="migplan-workload-bar-fill" style="width:${score}%;background:${scoreColor}"></div>
          </div>
          ${breakdownToggle}
          <div style="margin-top:0.5rem">
            <strong style="font-size:0.8rem;color:#aaa;">What Migrates:</strong>
            <ul class="migplan-workload-items">${migrateHtml}</ul>
          </div>
          <button class="migplan-toggle-btn" onclick="this.nextElementSibling.classList.toggle('open');this.textContent=this.nextElementSibling.classList.contains('open')?'▲ Less detail':'▼ More detail'">▼ More detail</button>
          <div class="migplan-toggle-content">
            <div style="margin-top:0.5rem">
              <strong style="font-size:0.8rem;color:var(--accent);">📋 Discovery Checklist:</strong>
              <ul class="migplan-workload-items">${checklistHtml}</ul>
            </div>
            <div style="margin-top:0.5rem">
              <strong style="font-size:0.8rem;color:#aaa;">What Doesn't Migrate:</strong>
              <ul class="migplan-workload-items">${noMigrateHtml}</ul>
            </div>
            <div style="margin-top:0.5rem">
              <strong style="font-size:0.8rem;color:#aaa;">Common Blockers:</strong>
              <ul class="migplan-workload-items">${blockerHtml}</ul>
            </div>
          </div>
        </div>
      `;
    }).join('');

    el.innerHTML = `
      <h2 class="migplan-section-title">📊 Workload Assessment</h2>
      <p class="migplan-section-subtitle">Readiness score for each workload in your migration scope</p>
      <p class="migplan-count">Showing ${S.workloads.length} workloads</p>
      ${discoveryHtml}
      <div class="migplan-workload-grid">${cards}</div>
    `;

    // Discovery panel toggle
    const discToggle = el.querySelector('#discovery-toggle');
    const discPanel = el.querySelector('#discovery-panel');
    if (discToggle && discPanel) {
      discToggle.addEventListener('click', () => discPanel.classList.toggle('open'));
    }

    // Apply discovery data handler
    const applyBtn = el.querySelector('#apply-discovery');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        S.discoveryData = {};
        el.querySelectorAll('.migplan-discovery-input').forEach(inp => {
          const wid = inp.dataset.wid;
          const key = inp.dataset.key;
          const val = parseFloat(inp.value);
          if (!isNaN(val) && val > 0) {
            if (!S.discoveryData[wid]) S.discoveryData[wid] = {};
            S.discoveryData[wid][key] = val;
          }
        });
        S.discoveryApplied = Object.keys(S.discoveryData).length > 0;
        runCalculations();
        renderAllPanels();
        saveToStorage();
        if (window.clarity) window.clarity('event', 'migplan_discovery_applied');
      });
    }
  }

  /* =========================================================
     Section 17 — Timeline Renderer
     ========================================================= */
  function renderTimeline() {
    const el = document.getElementById('migplan-timeline-content');
    if (!el || !S.wizardDone) return;

    const phasesHtml = S.phaseEstimates.map(p => {
      const pct = (p.weeks / S.timelineWeeks * 100).toFixed(0);
      const milestonesHtml = p.milestones.map(m => `<li>${m}</li>`).join('');
      return `
        <div class="migplan-phase">
          <div class="migplan-phase-header">
            <span class="migplan-phase-name">${p.emoji} ${p.name}</span>
            <span class="migplan-phase-duration">${p.weeks} week${p.weeks > 1 ? 's' : ''}</span>
          </div>
          <p class="migplan-phase-desc">${p.description}</p>
          <div class="migplan-phase-bar">
            <div class="migplan-phase-bar-fill" style="width:${pct}%">${p.weeks}w</div>
          </div>
          <button class="migplan-toggle-btn" onclick="this.nextElementSibling.classList.toggle('open');this.textContent=this.nextElementSibling.classList.contains('open')?'▲ Hide milestones':'▼ Show milestones'">▼ Show milestones</button>
          <div class="migplan-toggle-content">
            <ul class="migplan-milestones">${milestonesHtml}</ul>
          </div>
        </div>
      `;
    }).join('');

    const deadlineWeeks = getDeadlineWeeks();
    let feasibility = 'feasible', feasLabel = '✅ Feasible';
    if (S.timelineWeeks > deadlineWeeks) { feasibility = 'risky'; feasLabel = '🔴 Timeline exceeds deadline'; }
    else if (S.timelineWeeks > deadlineWeeks * 0.8) { feasibility = 'tight'; feasLabel = '🟡 Tight — minimal buffer'; }

    el.innerHTML = `
      <h2 class="migplan-section-title">📅 Estimated Timeline</h2>
      <p class="migplan-section-subtitle">Phase-by-phase migration timeline based on your organisation profile</p>
      <div class="migplan-timeline">${phasesHtml}</div>
      <div class="migplan-timeline-total">
        <div class="migplan-timeline-total-label">Estimated Total Duration</div>
        <div class="migplan-timeline-total-value">${S.timelineWeeks} weeks</div>
        ${S.deadline !== 'none' ? `<span class="migplan-timeline-feasibility ${feasibility}">${feasLabel}</span>` : ''}
      </div>
    `;
  }

  /* =========================================================
     Section 18 — Risk Renderer  (#1 use displaySeverity)
     ========================================================= */
  function renderRisks() {
    const el = document.getElementById('migplan-risks-content');
    if (!el || !S.wizardDone) return;

    const categories = [...new Set(S.risks.map(r => r.category))];
    const filterHtml = `<button class="migplan-filter-chip active" data-cat="all">All (${S.risks.length})</button>` +
      categories.map(c => {
        const count = S.risks.filter(r => r.category === c).length;
        return `<button class="migplan-filter-chip" data-cat="${c}">${c.replace(/-/g, ' ')} (${count})</button>`;
      }).join('');

    const cardsHtml = S.risks.map(r => `
      <div class="migplan-risk-card ${r.displaySeverity}" data-cat="${r.category}">
        <div class="migplan-risk-severity ${r.displaySeverity}">${r.displaySeverity.toUpperCase()}${r.displaySeverity !== r.severity ? ' <span style="font-size:0.65rem;opacity:0.6">(elevated)</span>' : ''}</div>
        <div class="migplan-risk-title">${r.title}</div>
        <div class="migplan-risk-desc">${r.description}</div>
        <div class="migplan-risk-mitigation">
          <strong>Mitigation</strong>
          ${r.mitigation}
        </div>
        ${r.learn_url ? `<a class="migplan-risk-link" href="${r.learn_url}" target="_blank" rel="noopener noreferrer">📚 Learn more →</a>` : ''}
      </div>
    `).join('');

    el.innerHTML = `
      <h2 class="migplan-section-title">⚠️ Risk Assessment</h2>
      <p class="migplan-section-subtitle">${S.risks.length} risks identified for your migration scenario</p>
      <div class="migplan-risk-filters">${filterHtml}</div>
      <div class="migplan-risk-grid">${cardsHtml}</div>
    `;

    el.querySelectorAll('.migplan-filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        el.querySelectorAll('.migplan-filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const cat = chip.dataset.cat;
        el.querySelectorAll('.migplan-risk-card').forEach(card => {
          card.style.display = (cat === 'all' || card.dataset.cat === cat) ? '' : 'none';
        });
      });
    });
  }

  /* =========================================================
     Section 19 — Tools Renderer  (#4 org_size filter)
     ========================================================= */
  function renderTools() {
    const el = document.getElementById('migplan-tools-content');
    if (!el || !S.wizardDone) return;

    const relevant = filterTools();
    const estUsers = { tiny: 25, small: 250, medium: 2500, large: 25000, enterprise: 75000 }[S.userCount] || 1000;

    const nativeTools = relevant.filter(t => t.type === 'native');
    const thirdParty = relevant.filter(t => t.type === 'third-party');
    const minCost = thirdParty.length > 0 ? Math.min(...thirdParty.map(t => t.cost_per_user || 0)) * estUsers : 0;
    const maxCost = thirdParty.length > 0 ? Math.max(...thirdParty.map(t => t.cost_per_user || 0)) * estUsers : 0;
    const costEstHtml = `
      <div style="background:rgba(99,102,241,0.06);border:1px solid rgba(99,102,241,0.15);border-radius:12px;padding:1.25rem;margin-bottom:1.5rem">
        <div style="font-size:0.85rem;font-weight:700;color:#fff;margin-bottom:0.5rem">💰 Estimated Tool Costs (${estUsers.toLocaleString()} users)</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;text-align:center">
          <div>
            <div style="font-size:1.3rem;font-weight:800;color:#10B981">$0</div>
            <div style="font-size:0.75rem;color:var(--text-muted)">Native tools only</div>
          </div>
          <div>
            <div style="font-size:1.3rem;font-weight:800;color:var(--accent)">$${(minCost).toLocaleString()}</div>
            <div style="font-size:0.75rem;color:var(--text-muted)">Low estimate</div>
          </div>
          <div>
            <div style="font-size:1.3rem;font-weight:800;color:#F97316">$${(maxCost).toLocaleString()}</div>
            <div style="font-size:0.75rem;color:var(--text-muted)">High estimate</div>
          </div>
        </div>
        <div style="font-size:0.75rem;color:#666;margin-top:0.5rem;text-align:center">Based on per-user tool pricing × estimated user count. Actual costs depend on licensing model.</div>
      </div>
    `;

    const cardsHtml = relevant.map(t => {
      const prosHtml = t.pros.slice(0, 3).map(p => `<li>${p}</li>`).join('');
      const consHtml = t.cons.slice(0, 3).map(c => `<li>${c}</li>`).join('');
      const workloadBadges = t.workloads.map(w => {
        const wd = D.workloads.find(x => x.id === w);
        return wd ? `<span style="font-size:0.72rem;background:rgba(255,255,255,0.06);padding:0.15rem 0.4rem;border-radius:4px;margin-right:0.3rem;">${wd.emoji} ${wd.name}</span>` : '';
      }).join('');

      return `
        <div class="migplan-tool-card">
          <div class="migplan-tool-header">
            <div>
              <div class="migplan-tool-name">${t.name}</div>
              <div class="migplan-tool-vendor">${t.vendor}</div>
            </div>
            <span class="migplan-tool-badge ${t.type}">${t.type === 'native' ? '🟢 Native' : '🟣 3rd Party'}</span>
          </div>
          <div class="migplan-tool-cost">${t.cost_model}${t.cost_per_user > 0 ? ` (~$${t.cost_per_user}/user)` : ''}</div>
          <div style="margin-bottom:0.5rem">${workloadBadges}</div>
          <div style="font-size:0.82rem;color:#999;margin-bottom:0.75rem">${t.best_for}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem">
            <div><ul class="migplan-tool-pros">${prosHtml}</ul></div>
            <div><ul class="migplan-tool-cons">${consHtml}</ul></div>
          </div>
          <a class="migplan-tool-link" href="${t.url}" target="_blank" rel="noopener noreferrer">🔗 Visit tool page →</a>
        </div>
      `;
    }).join('');

    el.innerHTML = `
      <h2 class="migplan-section-title">🔧 Tool Recommendations</h2>
      <p class="migplan-section-subtitle">${relevant.length} tools matched to your scenario and workloads</p>
      ${costEstHtml}
      <div class="migplan-tool-grid">${cardsHtml}</div>
    `;
  }

  /* =========================================================
     Section 20 — Executive Summary  (#1 displaySeverity, #5 humanLabel, #13 CIO enhancements)
     ========================================================= */
  function renderSummary() {
    const el = document.getElementById('migplan-summary-content');
    if (!el || !S.wizardDone) return;
    const sc = D.scenarios.find(s => s.id === S.scenario);
    const ap = D.approaches.find(a => a.id === S.approach);
    const userLabel = humanLabel('userCount', S.userCount);

    // #1 — use displaySeverity for risk counts
    const criticalRisks = S.risks.filter(r => r.displaySeverity === 'critical');
    const highRisks = S.risks.filter(r => r.displaySeverity === 'high');

    // #13 — Decision Status
    let decisionStatus;
    if (S.complexityScore <= 40) decisionStatus = { icon: '🟢', label: 'GO', desc: 'Low complexity, proceed with standard planning' };
    else if (S.complexityScore <= 65) decisionStatus = { icon: '🟡', label: 'GO WITH CONDITIONS', desc: 'Engage specialist support for complex workloads' };
    else if (S.complexityScore <= 80) decisionStatus = { icon: '🟠', label: 'CONDITIONAL', desc: 'High complexity requires experienced migration partner' };
    else decisionStatus = { icon: '🔴', label: 'NOT RECOMMENDED', desc: 'without significant preparation' };

    // #13 — Budget Estimate (reuse tool costs)
    const estUsers = { tiny: 25, small: 250, medium: 2500, large: 25000, enterprise: 75000 }[S.userCount] || 1000;
    const relevant = filterTools();
    const thirdParty = relevant.filter(t => t.type === 'third-party');
    const minCost = thirdParty.length > 0 ? Math.min(...thirdParty.map(t => t.cost_per_user || 0)) * estUsers : 0;
    const maxCost = thirdParty.length > 0 ? Math.max(...thirdParty.map(t => t.cost_per_user || 0)) * estUsers : 0;

    // #13 — Deadline Feasibility prose
    const deadlineWeeks = getDeadlineWeeks();
    let feasProse = 'No deadline set — timeline is flexible.';
    if (S.deadline !== 'none') {
      const diff = S.timelineWeeks - deadlineWeeks;
      if (diff > 0) feasProse = `🔴 Not credible — timeline exceeds deadline by ${diff} week${diff > 1 ? 's' : ''}. Reduce scope or negotiate more time.`;
      else if (S.timelineWeeks > deadlineWeeks * 0.7) feasProse = '🟡 Feasible with parallel workstreams and aggressive scheduling.';
      else feasProse = '✅ Feasible within the stated deadline.';
    }

    // #13 — Key Assumptions
    const assumptions = [];
    if (!S.workloads.includes('teams') || S.scenario !== 'tenant-tenant') assumptions.push('Assumes no Teams chat history migration required');
    if (S.compliance === 'none' || S.compliance === 'unsure') assumptions.push('Assumes standard retention policies');
    if (!S.workloads.includes('power')) assumptions.push('Assumes no Power Platform migration');
    if (S.experience !== 'first') assumptions.push('Assumes team has baseline migration knowledge');
    if (S.multiGeo === 'single') assumptions.push('Assumes single-region deployment — no Multi-Geo licensing');
    if (S.customApps === 'none' || S.customApps === 'unsure') assumptions.push('Assumes minimal custom app remediation');
    if (S.dataVolume !== 'massive') assumptions.push('Assumes no special large-file handling requirements');

    // #13 — Disruption Level
    let disruption;
    const sizeNum = { tiny: 1, small: 2, medium: 3, large: 4, enterprise: 5 }[S.userCount] || 3;
    if (S.scenario === 'hybrid' || (sizeNum <= 2 && S.complexityScore <= 40)) disruption = { level: 'Low', desc: 'Minimal user impact — most users won\'t notice' };
    else if (S.scenario === 'google-m365' || S.scenario === 'other-source') disruption = { level: 'High', desc: 'Significant workflow changes — new tools, interfaces, and processes' };
    else if (sizeNum >= 4 || S.complexityScore > 60) disruption = { level: 'Medium-High', desc: 'Some retraining needed, temporary productivity dip expected' };
    else disruption = { level: 'Medium', desc: 'Some retraining needed for affected workloads' };

    // Workload bars
    const workloadBars = S.workloads.map(wid => {
      const w = D.workloads.find(x => x.id === wid);
      const score = S.workloadScores[wid] || 50;
      const color = score >= 70 ? '#10B981' : score >= 40 ? '#EAB308' : '#EF4444';
      return `<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.3rem">
        <span style="font-size:0.78rem;color:#aaa;width:100px">${w ? w.emoji + ' ' + w.name : wid}</span>
        <div style="flex:1;height:8px;background:rgba(255,255,255,0.06);border-radius:4px;overflow:hidden">
          <div style="width:${score}%;height:100%;background:${color};border-radius:4px"></div>
        </div>
        <span style="font-size:0.78rem;color:${color};width:30px;text-align:right">${score}</span>
      </div>`;
    }).join('');

    // #1 — Top risks with displaySeverity
    const topRisks = S.risks.slice(0, 5).map(r => {
      const icon = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' }[r.displaySeverity] || '⚪';
      return `<div style="margin-bottom:0.5rem"><span>${icon}</span> <strong style="color:#fff;font-size:0.85rem">${r.title}</strong><br><span style="font-size:0.78rem;color:#999">${r.mitigation.substring(0, 120)}...</span></div>`;
    }).join('');

    el.innerHTML = `
      <div class="migplan-summary">
        <h2 class="migplan-section-title" style="text-align:center;margin-bottom:2rem">📄 Executive Migration Summary</h2>

        <!-- #13 Decision Status -->
        <div style="text-align:center;padding:1.25rem;background:rgba(99,102,241,0.06);border:1px solid rgba(99,102,241,0.15);border-radius:12px;margin-bottom:1.5rem">
          <div style="font-size:1.5rem;font-weight:900">${decisionStatus.icon} ${decisionStatus.label}</div>
          <div style="font-size:0.85rem;color:#999;margin-top:0.3rem">${decisionStatus.desc}</div>
          <div style="margin-top:0.75rem">${confidenceBadge()}</div>
        </div>

        <div class="migplan-summary-section">
          <h3>Overview</h3>
          <div class="migplan-summary-grid">
            <div class="migplan-summary-stat">
              <div class="migplan-summary-stat-value" style="color:${tierColor(S.complexityTier)}">${S.complexityScore}</div>
              <div class="migplan-summary-stat-label">Complexity Score</div>
            </div>
            <div class="migplan-summary-stat">
              <div class="migplan-summary-stat-value">${userLabel}</div>
              <div class="migplan-summary-stat-label">Users</div>
            </div>
            <div class="migplan-summary-stat">
              <div class="migplan-summary-stat-value">${S.workloads.length}</div>
              <div class="migplan-summary-stat-label">Workloads</div>
            </div>
            <div class="migplan-summary-stat">
              <div class="migplan-summary-stat-value">${S.timelineWeeks}w</div>
              <div class="migplan-summary-stat-label">Est. Duration</div>
            </div>
          </div>
        </div>

        <div class="migplan-summary-section">
          <h3>Migration Profile</h3>
          <table style="width:100%;font-size:0.85rem;border-collapse:collapse">
            <tr><td style="color:var(--text-muted);padding:0.4rem 0">Scenario</td><td style="color:#fff;padding:0.4rem 0">${sc ? sc.emoji + ' ' + sc.name : S.scenario}</td></tr>
            <tr><td style="color:var(--text-muted);padding:0.4rem 0">Approach</td><td style="color:#fff;padding:0.4rem 0">${ap ? ap.name : S.approach}</td></tr>
            <tr><td style="color:var(--text-muted);padding:0.4rem 0">Driver</td><td style="color:#fff;padding:0.4rem 0">${humanLabel('reason', S.reason)}</td></tr>
            <tr><td style="color:var(--text-muted);padding:0.4rem 0">Deadline</td><td style="color:#fff;padding:0.4rem 0">${humanLabel('deadline', S.deadline)}</td></tr>
            <tr><td style="color:var(--text-muted);padding:0.4rem 0">Compliance</td><td style="color:#fff;padding:0.4rem 0">${humanLabel('compliance', S.compliance)}</td></tr>
            <tr><td style="color:var(--text-muted);padding:0.4rem 0">Geography</td><td style="color:#fff;padding:0.4rem 0">${humanLabel('multiGeo', S.multiGeo)}</td></tr>
            <tr><td style="color:var(--text-muted);padding:0.4rem 0">Directory</td><td style="color:#fff;padding:0.4rem 0">${humanLabel('directory', S.directory)}</td></tr>
            <tr><td style="color:var(--text-muted);padding:0.4rem 0">Experience</td><td style="color:#fff;padding:0.4rem 0">${humanLabel('experience', S.experience)}</td></tr>
          </table>
        </div>

        <!-- #13 Budget Estimate -->
        <div class="migplan-summary-section">
          <h3>💰 Budget Estimate</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;text-align:center;margin-bottom:0.75rem">
            <div><div style="font-size:1.1rem;font-weight:800;color:#10B981">$0</div><div style="font-size:0.72rem;color:var(--text-muted)">Native only</div></div>
            <div><div style="font-size:1.1rem;font-weight:800;color:var(--accent)">$${minCost.toLocaleString()}</div><div style="font-size:0.72rem;color:var(--text-muted)">Low estimate</div></div>
            <div><div style="font-size:1.1rem;font-weight:800;color:#F97316">$${maxCost.toLocaleString()}</div><div style="font-size:0.72rem;color:var(--text-muted)">High estimate</div></div>
          </div>
          <div style="font-size:0.75rem;color:#666;text-align:center">Tool licensing only. Excludes labour, training, and change management.</div>
        </div>

        <!-- #13 Deadline Feasibility -->
        <div class="migplan-summary-section">
          <h3>⏰ Deadline Feasibility</h3>
          <p style="font-size:0.85rem;color:#bbb">${feasProse}</p>
          ${S.deadline !== 'none' ? `<div style="font-size:0.82rem;color:var(--text-muted);margin-top:0.3rem">Deadline: ${humanLabel('deadline', S.deadline)} · Estimated: ${S.timelineWeeks} weeks</div>` : ''}
        </div>

        <!-- #13 Disruption Level -->
        <div class="migplan-summary-section">
          <h3>📢 Disruption Level</h3>
          <p style="font-size:0.85rem;color:#bbb"><strong style="color:#fff">${disruption.level}</strong> — ${disruption.desc}</p>
        </div>

        <div class="migplan-summary-section">
          <h3>Workload Readiness</h3>
          ${workloadBars}
        </div>

        <div class="migplan-summary-section">
          <h3>Top 5 Risks</h3>
          ${topRisks}
          <p style="font-size:0.78rem;color:#666;margin-top:0.5rem">${criticalRisks.length} critical · ${highRisks.length} high · ${S.risks.length} total risks identified</p>
        </div>

        <!-- #13 Key Assumptions -->
        <div class="migplan-summary-section">
          <h3>📌 Key Assumptions</h3>
          <ul style="font-size:0.82rem;color:#999;line-height:1.8;padding-left:1.2rem">
            ${assumptions.map(a => `<li>${a}</li>`).join('')}
          </ul>
        </div>

        <div class="migplan-summary-section">
          <h3>Recommended Next Steps</h3>
          <ol style="font-size:0.85rem;color:#bbb;line-height:1.8;padding-left:1.2rem">
            <li>Complete detailed discovery and data inventory</li>
            <li>Address all <span style="color:#EF4444">critical</span> risks before proceeding</li>
            <li>Set up target tenant and configure security policies</li>
            <li>Select and license migration tools</li>
            <li>Run pilot migration with 5-10% of users</li>
            <li>Develop change management and communication plan</li>
            <li>Execute production migration in planned waves</li>
            <li>Validate data and decommission source environment</li>
          </ol>
        </div>

        <div class="migplan-summary-actions">
          <button class="migplan-btn migplan-btn-primary" onclick="MIGPLAN.copyMarkdown()">📋 Copy as Markdown</button>
          <button class="migplan-btn migplan-btn-primary" onclick="window.print()">🖨️ Print</button>
          <button class="migplan-btn migplan-btn-secondary" onclick="MIGPLAN.shareURL()">🔗 Share Link</button>
          <button class="migplan-btn migplan-btn-secondary" onclick="MIGPLAN.editAnswers()">✏️ Edit Answers</button>
        </div>

        <div style="margin-top:2rem;text-align:center;font-size:0.78rem;color:#666">
          Generated by <a href="https://www.aguidetocloud.com/migration-planner/" style="color:var(--accent)">aguidetocloud.com/migration-planner</a> · ${new Date().toLocaleDateString()}
        </div>
      </div>
    `;
  }

  /* =========================================================
     Section 21 — Copy as Markdown  (#1 displaySeverity, #5 humanLabel)
     ========================================================= */
  function copyMarkdown() {
    const sc = D.scenarios.find(s => s.id === S.scenario);
    const ap = D.approaches.find(a => a.id === S.approach);
    const userLabel = humanLabel('userCount', S.userCount);

    let md = `# M365 Migration Plan — Executive Summary\n\n`;
    md += `**Complexity Score:** ${S.complexityScore}/100 (${S.complexityTier})\n`;
    md += `**Scenario:** ${sc ? sc.name : S.scenario}\n`;
    md += `**Approach:** ${ap ? ap.name : S.approach}\n`;
    md += `**Users:** ${userLabel}\n`;
    md += `**Driver:** ${humanLabel('reason', S.reason)}\n`;
    md += `**Deadline:** ${humanLabel('deadline', S.deadline)}\n`;
    md += `**Compliance:** ${humanLabel('compliance', S.compliance)}\n`;
    md += `**Geography:** ${humanLabel('multiGeo', S.multiGeo)}\n`;
    md += `**Directory:** ${humanLabel('directory', S.directory)}\n`;
    md += `**Experience:** ${humanLabel('experience', S.experience)}\n`;
    md += `**Workloads:** ${S.workloads.length}\n`;
    md += `**Est. Duration:** ${S.timelineWeeks} weeks\n\n`;

    md += `## Workload Readiness\n\n`;
    S.workloads.forEach(wid => {
      const w = D.workloads.find(x => x.id === wid);
      md += `- ${w ? w.name : wid}: ${S.workloadScores[wid] || 50}/100\n`;
    });

    // #1 — use displaySeverity in markdown export
    md += `\n## Top Risks\n\n`;
    S.risks.slice(0, 5).forEach(r => {
      md += `- **[${r.displaySeverity.toUpperCase()}]** ${r.title}: ${r.mitigation.substring(0, 100)}...\n`;
    });

    md += `\n## Timeline\n\n`;
    S.phaseEstimates.forEach(p => {
      md += `- ${p.name}: ${p.weeks} week${p.weeks > 1 ? 's' : ''}\n`;
    });
    md += `- **Total: ${S.timelineWeeks} weeks**\n`;

    md += `\n---\n*Generated by [aguidetocloud.com/migration-planner](https://www.aguidetocloud.com/migration-planner/) on ${new Date().toLocaleDateString()}*\n`;

    navigator.clipboard.writeText(md).then(() => {
      const btn = document.querySelector('.migplan-summary-actions .migplan-btn-primary');
      if (btn) { btn.textContent = '✅ Copied!'; setTimeout(() => { btn.textContent = '📋 Copy as Markdown'; }, 2000); }
    });
    if (window.clarity) window.clarity('event', 'migplan_copy_markdown');
  }

  function shareURL() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      const btn = document.querySelector('.migplan-summary-actions .migplan-btn-secondary');
      if (btn) { btn.textContent = '✅ Link Copied!'; setTimeout(() => { btn.textContent = '🔗 Share Link'; }, 2000); }
    });
    if (window.clarity) window.clarity('event', 'migplan_share_url');
  }

  /* =========================================================
     Section 22 — Edit Answers  (#6)
     ========================================================= */
  function editAnswers() {
    S.wizardDone = false;
    S.wizardStep = 0;
    // Keep all existing answers — user clicks through to change one
    switchTab('wizard');
    renderWizard();
    if (window.clarity) window.clarity('event', 'migplan_edit_answers');
  }

  /* =========================================================
     Section 23 — Restart
     ========================================================= */
  function restart() {
    Object.keys(S).forEach(k => {
      if (Array.isArray(S[k])) S[k] = [];
      else if (typeof S[k] === 'number') S[k] = 0;
      else if (typeof S[k] === 'boolean') S[k] = false;
      else if (typeof S[k] === 'object' && S[k] !== null) S[k] = {};
      else S[k] = null;
    });
    S.workloads = [];
    S.risks = [];
    S.workloadScores = {};
    S.workloadBreakdowns = {};
    S.discoveryData = {};
    S.phaseEstimates = [];
    S.scoreBreakdown = [];
    S.currentTab = 'wizard';
    S.wizardStep = 0;
    S.wizardDone = false;
    S.discoveryApplied = false;
    S.confidenceLevel = 0;
    history.replaceState(null, '', location.pathname);
    try { localStorage.removeItem(LS_KEY); } catch (e) {}
    switchTab('wizard');
    renderWizard();
    ['workloads', 'timeline', 'risks', 'tools', 'summary'].forEach(tab => {
      const el = document.getElementById('migplan-' + tab + '-content');
      if (el) el.innerHTML = `<div class="migplan-empty"><div class="migplan-empty-icon">🧙‍♂️</div><div class="migplan-empty-text">Complete the Migration Wizard first.</div><button class="migplan-empty-cta" onclick="MIGPLAN.switchTab('wizard')">→ Start the Wizard</button></div>`;
    });
    if (window.clarity) window.clarity('event', 'migplan_restart');
  }

  /* =========================================================
     Section 24 — Keyboard Navigation
     ========================================================= */
  function handleKeyboard(e) {
    if (!S.wizardDone && S.currentTab === 'wizard') {
      const q = QUESTIONS[S.wizardStep];
      if (!q) return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= q.options.length) {
        const val = q.options[num - 1].value;
        if (q.multi) {
          if (!S[q.id]) S[q.id] = [];
          const idx = S[q.id].indexOf(val);
          if (idx >= 0) S[q.id].splice(idx, 1);
          else S[q.id].push(val);
        } else {
          S[q.id] = val;
        }
        renderWizard();
      }
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        const nextBtn = document.getElementById('wizard-next');
        if (nextBtn && !nextBtn.disabled) nextBtn.click();
      }
      if (e.key === 'ArrowLeft') {
        const backBtn = document.getElementById('wizard-back');
        if (backBtn) backBtn.click();
      }
    }
  }

  /* =========================================================
     Section 25 — localStorage Save/Resume
     ========================================================= */
  const LS_KEY = 'migplan_state';
  const LS_HISTORY = 'migplan_history';

  function saveToStorage() {
    const data = {
      scenario: S.scenario, reason: S.reason, userCount: S.userCount,
      workloads: S.workloads, dataVolume: S.dataVolume, largestMailbox: S.largestMailbox,
      customApps: S.customApps, compliance: S.compliance, deadline: S.deadline,
      multiGeo: S.multiGeo, directory: S.directory, experience: S.experience,
      wizardStep: S.wizardStep, wizardDone: S.wizardDone,
      discoveryData: S.discoveryData, discoveryApplied: S.discoveryApplied,
      savedAt: new Date().toISOString()
    };
    try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch (e) {}
    if (S.wizardDone) {
      try {
        const hist = JSON.parse(localStorage.getItem(LS_HISTORY) || '[]');
        // Avoid duplicate entries for the same scenario + user combo
        const sig = S.scenario + '|' + S.userCount + '|' + S.workloads.join(',');
        const filtered = hist.filter(h => (h.scenario + '|' + h.userCount + '|' + (h.workloads || []).join(',')) !== sig);
        filtered.unshift({ ...data, complexityScore: S.complexityScore, complexityTier: S.complexityTier });
        localStorage.setItem(LS_HISTORY, JSON.stringify(filtered.slice(0, 5)));
      } catch (e) {}
    }
  }

  function loadFromStorage() {
    if (location.search.includes('scenario=')) return false;
    try {
      const data = JSON.parse(localStorage.getItem(LS_KEY));
      if (!data || !data.scenario) return false;
      Object.keys(data).forEach(k => { if (k in S) S[k] = data[k]; });
      // Restore discovery data if present
      if (data.discoveryData) S.discoveryData = data.discoveryData;
      if (data.discoveryApplied) S.discoveryApplied = data.discoveryApplied;
      return true;
    } catch (e) { return false; }
  }

  /* =========================================================
     Section 26 — Init
     ========================================================= */
  function init() {
    document.querySelectorAll('.migplan-tab').forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
    document.addEventListener('keydown', handleKeyboard);

    // Load state: URL params > localStorage > fresh start
    loadFromURL();
    if (!S.wizardDone) {
      const restored = loadFromStorage();
      if (restored && S.wizardDone) {
        runCalculations();
        renderAllPanels();
      }
    }
    renderWizard();
  }

  /* =========================================================
     Section 27 — Public API
     ========================================================= */
  window.MIGPLAN = { switchTab, restart, copyMarkdown, shareURL, editAnswers };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
