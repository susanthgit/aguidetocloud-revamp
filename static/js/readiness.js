/* ── Copilot Readiness Checker v2 — Assessment Engine ──
   30 questions across 7 pillars, 0–3 points each.
   100% client-side, zero API calls.
   v2: localStorage, pillar nav, score delta, confetti, swipe,
       keyboard hints, benchmarks, next-steps resources.
*/

(function () {
  'use strict';

  // ─── Industry Benchmarks (approximate, based on field experience) ───
  const BENCHMARKS = {
    licensing: 72, identity: 65, data: 45, security: 52,
    network: 68, change: 40, monitoring: 35, overall: 54
  };

  // ─── Question Data ───
  const PILLARS = [
    { id: 'licensing', icon: '🔑', name: 'Licensing & Subscription', weight: 1 },
    { id: 'identity',  icon: '🛡️', name: 'Identity & Access',       weight: 1 },
    { id: 'data',      icon: '📂', name: 'Data Governance',         weight: 1 },
    { id: 'security',  icon: '🔒', name: 'Security & Compliance',   weight: 1 },
    { id: 'network',   icon: '🌐', name: 'Network & Apps',          weight: 1 },
    { id: 'change',    icon: '👥', name: 'Change Management',       weight: 1 },
    { id: 'monitoring',icon: '📊', name: 'Monitoring & Optimisation', weight: 1 }
  ];

  const QUESTIONS = [
    // ── Pillar 1: Licensing & Subscription (5 questions) ──
    {
      pillar: 'licensing',
      text: 'What is your organisation\'s base Microsoft 365 licence?',
      context: 'Copilot requires a qualifying base licence before adding the Copilot add-on.',
      options: [
        { label: 'Microsoft 365 E5 / A5 / G5', points: 3 },
        { label: 'Microsoft 365 E3 / A3 / G3 / Business Premium', points: 3 },
        { label: 'Microsoft 365 Business Standard / Basic', points: 2 },
        { label: 'Office 365 E1 / F1 / F3 or standalone plans', points: 1 },
        { label: 'Not sure / None of the above', points: 0 }
      ]
    },
    {
      pillar: 'licensing',
      text: 'Have you purchased Microsoft 365 Copilot add-on licences?',
      context: 'Copilot is an add-on licence ($30/user/month) on top of qualifying base plans.',
      options: [
        { label: 'Yes — assigned to all target users', points: 3 },
        { label: 'Yes — purchased but not all assigned yet', points: 2 },
        { label: 'In procurement or trial', points: 1 },
        { label: 'No, not yet', points: 0 }
      ]
    },
    {
      pillar: 'licensing',
      text: 'How are you assigning Copilot licences to users?',
      context: 'Group-based licensing via Entra ID is recommended for scale and governance.',
      options: [
        { label: 'Group-based licensing via Microsoft Entra ID', points: 3 },
        { label: 'Direct assignment in Microsoft 365 admin centre', points: 2 },
        { label: 'Mixed methods / not decided yet', points: 1 },
        { label: 'Not sure how licence assignment works', points: 0 }
      ]
    },
    {
      pillar: 'licensing',
      text: 'Do you have a licence reclamation strategy?',
      context: 'Reassigning unused Copilot licences maximises ROI — review after 60-90 days.',
      options: [
        { label: 'Yes — monitoring usage and will reassign inactive licences', points: 3 },
        { label: 'Planning to review after the pilot phase', points: 2 },
        { label: 'No formal plan yet', points: 1 },
        { label: 'Haven\'t considered this', points: 0 }
      ]
    },
    {
      pillar: 'licensing',
      text: 'Have you reviewed the Copilot readiness report in the M365 admin centre?',
      context: 'The built-in readiness report shows prerequisite coverage, app usage, and recommended actions.',
      options: [
        { label: 'Yes — all prerequisites met', points: 3 },
        { label: 'Yes — some gaps identified that we\'re addressing', points: 2 },
        { label: 'Haven\'t checked it yet', points: 1 },
        { label: 'Don\'t know where to find it', points: 0 }
      ]
    },

    // ── Pillar 2: Identity & Access (4 questions) ──
    {
      pillar: 'identity',
      text: 'Are all target users managed in Microsoft Entra ID?',
      context: 'Copilot requires users with Entra ID (formerly Azure AD) accounts.',
      options: [
        { label: 'Yes — all users are cloud-only or synced via Entra Connect', points: 3 },
        { label: 'Most users — some are on-premises only', points: 2 },
        { label: 'Partial — migration in progress', points: 1 },
        { label: 'No / not sure', points: 0 }
      ]
    },
    {
      pillar: 'identity',
      text: 'Is multi-factor authentication (MFA) enforced for all users?',
      context: 'MFA is a critical security baseline — Microsoft recommends it for all Copilot users.',
      options: [
        { label: 'Yes — via Conditional Access policies', points: 3 },
        { label: 'Yes — via Security Defaults', points: 2 },
        { label: 'For admins and some users only', points: 1 },
        { label: 'No MFA enforced / not sure', points: 0 }
      ]
    },
    {
      pillar: 'identity',
      text: 'Do you have Conditional Access policies beyond basic MFA?',
      context: 'Policies covering device compliance, location-based access, and risk-based sign-in add important layers.',
      options: [
        { label: 'Yes — comprehensive policies (device, location, risk-based)', points: 3 },
        { label: 'Basic policies (MFA + block legacy authentication)', points: 2 },
        { label: 'Planning to implement', points: 1 },
        { label: 'No — using Security Defaults only or nothing', points: 0 }
      ]
    },
    {
      pillar: 'identity',
      text: 'Have you reviewed guest and external access settings?',
      context: 'External users can surface content through Copilot — review sharing settings before rollout.',
      options: [
        { label: 'Yes — recently audited and restricted appropriately', points: 3 },
        { label: 'Partially reviewed', points: 2 },
        { label: 'Not reviewed recently', points: 1 },
        { label: 'No — default settings untouched', points: 0 }
      ]
    },

    // ── Pillar 3: Data Governance (5 questions) ──
    {
      pillar: 'data',
      text: 'Have you audited SharePoint and OneDrive for oversharing?',
      context: 'Copilot surfaces content users have access to — overshared sites mean Copilot exposes data it shouldn\'t.',
      options: [
        { label: 'Yes — comprehensive oversharing audit completed', points: 3 },
        { label: 'Partial audit — addressed the high-risk sites', points: 2 },
        { label: 'Planning to audit', points: 1 },
        { label: 'No — haven\'t started', points: 0 }
      ]
    },
    {
      pillar: 'data',
      text: 'Are Microsoft Purview sensitivity labels deployed?',
      context: 'Sensitivity labels protect confidential content from being surfaced by Copilot inappropriately.',
      options: [
        { label: 'Yes — widely applied across documents and emails', points: 3 },
        { label: 'Published but adoption is low', points: 2 },
        { label: 'Configured but not yet published to users', points: 1 },
        { label: 'No sensitivity labels configured', points: 0 }
      ]
    },
    {
      pillar: 'data',
      text: 'Do you have Data Loss Prevention (DLP) policies in place?',
      context: 'DLP policies prevent Copilot from generating or sharing content with sensitive data types.',
      options: [
        { label: 'Yes — covering sensitive data types relevant to our org', points: 3 },
        { label: 'Basic DLP policies in place', points: 2 },
        { label: 'Planning to implement', points: 1 },
        { label: 'No DLP policies', points: 0 }
      ]
    },
    {
      pillar: 'data',
      text: 'Have you addressed ROT content (Redundant, Obsolete, Trivial)?',
      context: 'Old/duplicate content degrades Copilot quality — clean the top 20-30% most accessed content first.',
      options: [
        { label: 'Yes — completed a content lifecycle cleanup', points: 3 },
        { label: 'Partially cleaned up high-priority areas', points: 2 },
        { label: 'Aware of the need but haven\'t started', points: 1 },
        { label: 'What\'s ROT content?', points: 0 }
      ]
    },
    {
      pillar: 'data',
      text: 'Is Restricted SharePoint Search (RSS) configured if needed?',
      context: 'RSS limits which sites Copilot can ground responses on — useful during initial rollout.',
      options: [
        { label: 'Yes — or not needed (we\'re confident in our permissions)', points: 3 },
        { label: 'Planning to enable for initial rollout', points: 2 },
        { label: 'Not sure what Restricted SharePoint Search is', points: 1 },
        { label: 'No — haven\'t considered it', points: 0 }
      ]
    },

    // ── Pillar 4: Security & Compliance (4 questions) ──
    {
      pillar: 'security',
      text: 'What is your Microsoft Secure Score?',
      context: 'Secure Score measures your security posture — higher is better for safe Copilot deployment.',
      options: [
        { label: '80% or above', points: 3 },
        { label: '60–79%', points: 2 },
        { label: '40–59%', points: 1 },
        { label: 'Below 40% or don\'t know', points: 0 }
      ]
    },
    {
      pillar: 'security',
      text: 'Is audit logging enabled for Copilot interactions?',
      context: 'Microsoft Purview Audit captures Copilot activities — essential for compliance.',
      options: [
        { label: 'Yes — Purview Audit captures Copilot activities', points: 3 },
        { label: 'Standard audit logging is enabled', points: 2 },
        { label: 'Planning to enable', points: 1 },
        { label: 'Not sure / audit logging is disabled', points: 0 }
      ]
    },
    {
      pillar: 'security',
      text: 'Are you using Microsoft Defender for Cloud Apps to monitor Copilot?',
      context: 'Defender for Cloud Apps can monitor and govern Copilot usage patterns.',
      options: [
        { label: 'Yes — with Copilot-specific monitoring policies', points: 3 },
        { label: 'Yes — basic Defender for Cloud Apps configuration', points: 2 },
        { label: 'Planning to deploy', points: 1 },
        { label: 'No', points: 0 }
      ]
    },
    {
      pillar: 'security',
      text: 'Is eDiscovery ready for Copilot-generated content?',
      context: 'Copilot-generated content must be discoverable for legal and compliance requirements.',
      options: [
        { label: 'Yes — tested and confirmed Copilot content is discoverable', points: 3 },
        { label: 'Standard eDiscovery is in place', points: 2 },
        { label: 'Haven\'t tested for Copilot-specific content', points: 1 },
        { label: 'No eDiscovery capabilities', points: 0 }
      ]
    },

    // ── Pillar 5: Network & Apps (4 questions) ──
    {
      pillar: 'network',
      text: 'What update channel are your Microsoft 365 Apps on?',
      context: 'Copilot requires Current Channel or Monthly Enterprise Channel — Semi-Annual may not work.',
      options: [
        { label: 'Current Channel or Monthly Enterprise Channel', points: 3 },
        { label: 'Semi-Annual Enterprise Channel', points: 1 },
        { label: 'Mixed channels across the org', points: 1 },
        { label: 'Not sure', points: 0 }
      ]
    },
    {
      pillar: 'network',
      text: 'Are Microsoft 365 Apps deployed and up to date on target devices?',
      context: 'Copilot integrates directly into M365 desktop and web apps — they must be current.',
      options: [
        { label: 'Yes — latest versions across all target devices', points: 3 },
        { label: 'Mostly — some users on older versions', points: 2 },
        { label: 'Partial deployment', points: 1 },
        { label: 'Not deployed or unsure', points: 0 }
      ]
    },
    {
      pillar: 'network',
      text: 'Have you verified network connectivity for Copilot endpoints?',
      context: 'Copilot uses Microsoft 365 endpoints — proxies and firewalls must allow them.',
      options: [
        { label: 'Yes — all required endpoints are allowed', points: 3 },
        { label: 'Partially verified', points: 2 },
        { label: 'Planning to check', points: 1 },
        { label: 'No / not sure which endpoints are needed', points: 0 }
      ]
    },
    {
      pillar: 'network',
      text: 'Do your proxies/firewalls support WebSocket (WSS) connections?',
      context: 'Copilot requires WSS connections to *.cloud.microsoft and *.office.com for real-time features.',
      options: [
        { label: 'Yes — verified WSS for *.cloud.microsoft and *.office.com', points: 3 },
        { label: 'Believe so but haven\'t explicitly tested', points: 2 },
        { label: 'Not sure', points: 1 },
        { label: 'No — WSS is blocked or not supported', points: 0 }
      ]
    },

    // ── Pillar 6: Change Management & Adoption (4 questions) ──
    {
      pillar: 'change',
      text: 'Do you have an executive sponsor for the Copilot rollout?',
      context: 'An engaged executive sponsor is the #1 predictor of successful technology adoption.',
      options: [
        { label: 'Yes — actively engaged and visible to the org', points: 3 },
        { label: 'Identified but not yet engaged', points: 2 },
        { label: 'Discussing potential sponsors', points: 1 },
        { label: 'No executive sponsor', points: 0 }
      ]
    },
    {
      pillar: 'change',
      text: 'Have you selected a pilot group for initial Copilot deployment?',
      context: 'Start with 20-50 diverse power users who are heavy M365 users with good data hygiene.',
      options: [
        { label: 'Yes — diverse roles with high M365 usage', points: 3 },
        { label: 'Yes — but limited role diversity', points: 2 },
        { label: 'Planning to select', points: 1 },
        { label: 'No pilot group planned', points: 0 }
      ]
    },
    {
      pillar: 'change',
      text: 'Is a training plan ready for Copilot users?',
      context: 'Effective training includes Microsoft Learn paths, prompt guides, and role-specific examples.',
      options: [
        { label: 'Yes — with Learn paths, prompt libraries, and role-specific guides', points: 3 },
        { label: 'Basic training materials prepared', points: 2 },
        { label: 'Planning to create', points: 1 },
        { label: 'No training plan', points: 0 }
      ]
    },
    {
      pillar: 'change',
      text: 'Have you defined success metrics for the Copilot deployment?',
      context: 'Track usage rate, time saved, user satisfaction, and business outcomes.',
      options: [
        { label: 'Yes — specific KPIs (usage, time saved, satisfaction, business outcomes)', points: 3 },
        { label: 'General goals defined', points: 2 },
        { label: 'Planning to define', points: 1 },
        { label: 'No success metrics defined', points: 0 }
      ]
    },

    // ── Pillar 7: Monitoring & Optimisation (4 questions) ──
    {
      pillar: 'monitoring',
      text: 'Have you set up Copilot usage reporting in the M365 admin centre?',
      context: 'The Copilot usage dashboard shows adoption, active users, and feature usage trends.',
      options: [
        { label: 'Yes — dashboards configured and reviewed regularly', points: 3 },
        { label: 'Planning to set up after deployment', points: 2 },
        { label: 'Aware it exists but haven\'t configured it', points: 1 },
        { label: 'Not sure how to access Copilot reports', points: 0 }
      ]
    },
    {
      pillar: 'monitoring',
      text: 'Do you have an ROI tracking methodology for Copilot?',
      context: 'Measure hours saved × hourly rate, quality improvements, and business outcome examples.',
      options: [
        { label: 'Yes — with specific metrics and tracking methodology', points: 3 },
        { label: 'General plan to measure value', points: 2 },
        { label: 'Planning to create one', points: 1 },
        { label: 'No ROI tracking planned', points: 0 }
      ]
    },
    {
      pillar: 'monitoring',
      text: 'Is there a plan for licence optimisation after the pilot?',
      context: 'Review after 60-90 days: expand to power users, reclaim from inactive users.',
      options: [
        { label: 'Yes — review planned after 60-90 days to expand or reduce', points: 3 },
        { label: 'General plan to review', points: 2 },
        { label: 'Will figure it out later', points: 1 },
        { label: 'No plan for licence review', points: 0 }
      ]
    },
    {
      pillar: 'monitoring',
      text: 'Do you have a process to track new Copilot features and agents?',
      context: 'Microsoft ships Copilot updates frequently — staying current maximises value.',
      options: [
        { label: 'Yes — following M365 Roadmap and release notes actively', points: 3 },
        { label: 'Informally keeping up with announcements', points: 2 },
        { label: 'Not actively tracking', points: 1 },
        { label: 'No process in place', points: 0 }
      ]
    }
  ];

  // ─── Score Tiers ───
  const TIERS = [
    { min: 0,  max: 30,  label: '🔴 Not Ready',      color: '#EF4444', desc: 'Critical gaps need immediate attention before deploying Copilot. Focus on licensing, security, and data governance first.' },
    { min: 31, max: 50,  label: '🟠 Early Stage',     color: '#F97316', desc: 'Foundation is building but significant work remains. Good for planning — not yet ready for pilot.' },
    { min: 51, max: 70,  label: '🟡 Getting Ready',   color: '#EAB308', desc: 'Good progress! You\'re ready for a controlled pilot — address the highlighted gaps before scaling.' },
    { min: 71, max: 85,  label: '🟢 Nearly Ready',    color: '#22C55E', desc: 'Strong position — minor improvements needed. You\'re ready for a broader phased rollout.' },
    { min: 86, max: 100, label: '🌟 Copilot Ready!',  color: '#3B82F6', desc: 'Excellent readiness — you\'re positioned for fast scaling and maximum value from Copilot.' }
  ];

  // ─── Recommendations per pillar (shown when score is low) ───
  const RECOMMENDATIONS = {
    licensing: {
      high: [
        { title: 'Verify qualifying base licences', desc: 'Check that all target users have an E3/E5, Business Standard/Premium, or equivalent base licence. <a href="/licensing/">Use our Licensing Simplifier</a> to compare plans.' },
        { title: 'Purchase and assign Copilot licences', desc: 'Buy Copilot add-on licences ($30/user/month) and assign them — ideally via group-based licensing in Entra ID.' }
      ],
      medium: [
        { title: 'Review the Copilot readiness report', desc: 'Go to M365 admin centre → Reports → Usage → Copilot Readiness to see prerequisite coverage and gaps.' },
        { title: 'Plan licence reclamation', desc: 'Set a 60-90 day review to reassign unused Copilot licences based on usage data.' }
      ],
      good: '✅ Licensing is in good shape — you have qualifying licences and Copilot assigned.'
    },
    identity: {
      high: [
        { title: 'Enforce MFA for all users', desc: 'Enable Conditional Access policies requiring MFA — this is Microsoft\'s #1 security recommendation. <a href="https://learn.microsoft.com/entra/identity/conditional-access/overview" target="_blank" rel="noopener noreferrer">Learn more</a>.' },
        { title: 'Ensure all users are in Entra ID', desc: 'Copilot requires Entra ID accounts. Sync on-premises users with Entra Connect if needed.' }
      ],
      medium: [
        { title: 'Upgrade from Security Defaults to Conditional Access', desc: 'Conditional Access gives granular control over device compliance, location, and risk-based sign-in.' },
        { title: 'Audit external and guest access', desc: 'Review who has guest access to your tenant — external users can surface content through Copilot.' }
      ],
      good: '✅ Identity & access controls are well configured — MFA is enforced and access is governed.'
    },
    data: {
      high: [
        { title: 'Run an oversharing audit immediately', desc: 'Use SharePoint Advanced Management to find sites shared with "Everyone except external users". Copilot will surface this content. <a href="https://learn.microsoft.com/sharepoint/data-access-governance-reports" target="_blank" rel="noopener noreferrer">Learn how</a>.' },
        { title: 'Deploy sensitivity labels', desc: 'Configure and publish Microsoft Purview sensitivity labels to protect confidential content from Copilot exposure.' }
      ],
      medium: [
        { title: 'Clean up ROT content', desc: 'Remove or archive redundant, obsolete, and trivial content — especially in the top 20-30% most accessed SharePoint sites.' },
        { title: 'Enable Restricted SharePoint Search', desc: 'Limit which sites Copilot can ground on during initial rollout — expand as governance matures.' }
      ],
      good: '✅ Data governance is solid — sensitivity labels, DLP, and access controls are in place.'
    },
    security: {
      high: [
        { title: 'Improve your Secure Score', desc: 'Target 60%+ before Copilot rollout. Review recommendations in Microsoft Defender portal → Secure Score.' },
        { title: 'Enable audit logging for Copilot', desc: 'Turn on Purview Audit to capture Copilot interactions — required for compliance. <a href="https://learn.microsoft.com/purview/audit-copilot" target="_blank" rel="noopener noreferrer">Setup guide</a>.' }
      ],
      medium: [
        { title: 'Configure Defender for Cloud Apps', desc: 'Set up Copilot-specific monitoring policies to detect unusual AI usage patterns.' },
        { title: 'Test eDiscovery with Copilot content', desc: 'Ensure Copilot-generated content is discoverable via Content Search and eDiscovery cases.' }
      ],
      good: '✅ Security posture is strong — audit logging and monitoring are active.'
    },
    network: {
      high: [
        { title: 'Switch to Current or Monthly Enterprise Channel', desc: 'Semi-Annual Channel may not support Copilot features. <a href="https://learn.microsoft.com/deployoffice/updates/overview-update-channels" target="_blank" rel="noopener noreferrer">Update channel guide</a>.' },
        { title: 'Allow required M365 endpoints', desc: 'Ensure your firewall/proxy allows all endpoints listed in the <a href="https://learn.microsoft.com/microsoft-365/enterprise/urls-and-ip-address-ranges" target="_blank" rel="noopener noreferrer">Microsoft 365 URL list</a>.' }
      ],
      medium: [
        { title: 'Test WebSocket connectivity', desc: 'Copilot requires WSS connections to *.cloud.microsoft and *.office.com — verify these aren\'t blocked by your proxy.' },
        { title: 'Update Microsoft 365 Apps', desc: 'Ensure all target devices are running the latest M365 Apps version.' }
      ],
      good: '✅ Network and apps are configured correctly for Copilot.'
    },
    change: {
      high: [
        { title: 'Get an executive sponsor engaged', desc: 'The #1 predictor of successful tech adoption. Find a C-level champion who will advocate visibly for Copilot.' },
        { title: 'Select and brief a pilot group', desc: 'Choose 20-50 power users across diverse roles — people who use M365 heavily and will give honest feedback.' }
      ],
      medium: [
        { title: 'Build a training programme', desc: 'Prepare Microsoft Learn paths, role-specific prompt guides, and a prompt library. <a href="/prompts/">See our Prompt Library</a> for inspiration.' },
        { title: 'Define success metrics now', desc: 'Agree on KPIs before launch: adoption rate, time saved, NPS, business outcomes. You can\'t improve what you don\'t measure.' }
      ],
      good: '✅ Change management is well planned — sponsor, pilot group, training, and metrics are ready.'
    },
    monitoring: {
      high: [
        { title: 'Set up Copilot usage dashboards', desc: 'Go to M365 admin centre → Reports → Usage → Microsoft 365 Copilot to monitor adoption post-launch.' },
        { title: 'Create an ROI tracking plan', desc: 'Measure hours saved per user per week × hourly rate. Track quality improvements and business outcomes.' }
      ],
      medium: [
        { title: 'Plan licence optimisation reviews', desc: 'Schedule 60 and 90-day reviews to expand Copilot to power users and reclaim from inactive ones.' },
        { title: 'Follow the M365 Roadmap', desc: 'New Copilot features ship frequently. <a href="/m365-roadmap/">Use our M365 Roadmap Tracker</a> to stay current.' }
      ],
      good: '✅ Monitoring and optimisation plans are in place — you\'re set for continuous improvement.'
    }
  };

  // ─── Precompute pillar question ranges ───
  const PILLAR_RANGES = {};
  PILLARS.forEach(p => { PILLAR_RANGES[p.id] = { start: -1, count: 0 }; });
  QUESTIONS.forEach((q, i) => {
    const r = PILLAR_RANGES[q.pillar];
    if (r.start === -1) r.start = i;
    r.count++;
  });

  // ─── State ───
  let currentQuestion = 0;
  let answers = new Array(QUESTIONS.length).fill(-1);
  let touchStartX = 0;

  const $ = id => document.getElementById(id);
  const STORAGE_KEY = 'copilot-readiness-answers';
  const HISTORY_KEY = 'copilot-readiness-history';

  // ─── Init ───
  function init() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('score')) { loadSharedResults(params); return; }

    // Restore from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === QUESTIONS.length) {
          answers = parsed;
          const lastAnswered = answers.reduce((acc, v, i) => v >= 0 ? i : acc, -1);
          if (lastAnswered >= 0) currentQuestion = Math.min(lastAnswered + 1, QUESTIONS.length - 1);
        }
      } catch (e) { /* ignore */ }
    }
    // Auto-start assessment (no intro gate)
    renderPillarNav();
    renderQuestion();

    // Populate Resources tab
    renderResourcesTab();

    $('readiness-prev-btn').addEventListener('click', prevQuestion);
    $('readiness-next-btn').addEventListener('click', nextQuestion);
    $('readiness-share-btn').addEventListener('click', shareResults);
    $('readiness-print-btn').addEventListener('click', () => window.print());
    $('readiness-restart-btn').addEventListener('click', restart);

    // Keyboard nav
    document.addEventListener('keydown', e => {
      if ($('readiness-assessment').hidden) return;
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (!$('readiness-next-btn').disabled) nextQuestion();
      } else if (e.key === 'ArrowLeft') {
        if (!$('readiness-prev-btn').disabled) prevQuestion();
      } else if (e.key >= '1' && e.key <= '5') {
        const opts = document.querySelectorAll('.readiness-option');
        if (opts[parseInt(e.key) - 1]) opts[parseInt(e.key) - 1].click();
      }
    });

    // Mobile swipe on question card
    const card = $('readiness-question-card');
    if (card) {
      card.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
      card.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(dx) > 60) {
          if (dx < 0 && !$('readiness-next-btn').disabled) nextQuestion();
          if (dx > 0 && !$('readiness-prev-btn').disabled) prevQuestion();
        }
      }, { passive: true });
    }
  }

  // ─── Populate Resources Tab (reuses NEXT_STEPS data) ───
  function renderResourcesTab() {
    const container = $('readiness-resources-steps');
    if (!container) return;
    container.innerHTML = '';
    NEXT_STEPS.forEach(phase => {
      const section = document.createElement('div');
      section.className = 'readiness-ns-phase';
      section.innerHTML = `<h3>${phase.phase}</h3><p class="readiness-ns-desc">${phase.desc}</p>`;
      const grid = document.createElement('div');
      grid.className = 'readiness-ns-grid';
      phase.items.forEach(item => {
        const isExternal = item.url.startsWith('http');
        const card = document.createElement('a');
        card.href = item.url;
        card.className = 'readiness-ns-card';
        if (isExternal) { card.target = '_blank'; card.rel = 'noopener'; }
        card.innerHTML = `
          <span class="readiness-ns-icon">${item.icon}</span>
          <div class="readiness-ns-text">
            <strong>${item.title}</strong>
            <small>${item.desc}</small>
          </div>
          ${isExternal ? '<span class="readiness-ns-ext">↗</span>' : ''}
        `;
        grid.appendChild(card);
      });
      section.appendChild(grid);
      container.appendChild(section);
    });
  }

  // ─── Pillar Nav (skip-to-pillar) ───
  function renderPillarNav() {
    const nav = $('readiness-pillar-nav');
    if (!nav) return;
    nav.innerHTML = '';
    PILLARS.forEach((p, i) => {
      const btn = document.createElement('button');
      btn.className = 'readiness-rpn-item';
      btn.dataset.pillar = p.id;
      btn.innerHTML = `<span class="readiness-rpn-icon">${p.icon}</span><span class="readiness-rpn-score" id="rpn-score-${p.id}"></span>`;
      btn.title = p.name;
      btn.addEventListener('click', () => jumpToPillar(p.id));
      nav.appendChild(btn);
    });
    updatePillarNav();
  }

  function updatePillarNav() {
    PILLARS.forEach(p => {
      const range = PILLAR_RANGES[p.id];
      const btn = document.querySelector(`.readiness-rpn-item[data-pillar="${p.id}"]`);
      if (!btn) return;

      // Check if all questions in this pillar are answered
      let allAnswered = true, earned = 0, max = range.count * 3;
      for (let i = range.start; i < range.start + range.count; i++) {
        if (answers[i] < 0) { allAnswered = false; }
        else { earned += QUESTIONS[i].options[answers[i]].points; }
      }

      const scoreEl = $(`rpn-score-${p.id}`);
      const currentPillar = QUESTIONS[currentQuestion].pillar;
      btn.classList.toggle('rpn-active', currentPillar === p.id);
      btn.classList.toggle('rpn-done', allAnswered);

      if (allAnswered) {
        const pct = Math.round((earned / max) * 100);
        scoreEl.textContent = pct + '%';
        scoreEl.style.color = pct >= 80 ? '#22C55E' : pct >= 60 ? '#EAB308' : pct >= 40 ? '#F97316' : '#EF4444';
      } else {
        scoreEl.textContent = '';
      }
    });
  }

  function jumpToPillar(pillarId) {
    const range = PILLAR_RANGES[pillarId];
    if (range) {
      currentQuestion = range.start;
      renderQuestion();
    }
  }

  // ─── Render Question ───
  function renderQuestion() {
    const q = QUESTIONS[currentQuestion];
    const pillar = PILLARS.find(p => p.id === q.pillar);
    const range = PILLAR_RANGES[q.pillar];
    const qInPillar = currentQuestion - range.start + 1;

    // Progress
    const pct = ((currentQuestion + 1) / QUESTIONS.length) * 100;
    $('readiness-progress-fill').style.width = pct + '%';
    $('readiness-progress-text').textContent = `Q${qInPillar} of ${range.count} in ${pillar.name} · ${currentQuestion + 1}/${QUESTIONS.length} overall`;

    // Pillar indicator
    $('readiness-current-pillar-icon').textContent = pillar.icon;
    $('readiness-current-pillar-name').textContent = pillar.name;

    // Question text
    $('readiness-question-text').textContent = q.text;

    // "Why this matters" expandable context
    const ctxEl = $('readiness-question-context');
    ctxEl.innerHTML = `<button class="readiness-why-toggle" aria-expanded="false">💡 Why this matters <span class="readiness-why-arrow">▸</span></button><div class="readiness-why-detail" hidden>${q.context}</div>`;
    ctxEl.querySelector('.readiness-why-toggle').addEventListener('click', function() {
      const detail = this.nextElementSibling;
      const expanded = detail.hidden;
      detail.hidden = !expanded;
      this.setAttribute('aria-expanded', expanded);
      this.querySelector('.readiness-why-arrow').textContent = expanded ? '▾' : '▸';
    });

    // Options
    const optContainer = $('readiness-options');
    optContainer.innerHTML = '';
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'readiness-option' + (answers[currentQuestion] === i ? ' selected' : '');
      btn.innerHTML = `<span class="readiness-option-radio"></span><span>${opt.label}</span>`;
      btn.addEventListener('click', () => selectOption(i));
      optContainer.appendChild(btn);
    });

    // Nav buttons
    $('readiness-prev-btn').disabled = currentQuestion === 0;
    updateNextButton();
    updatePillarNav();
  }

  function selectOption(idx) {
    answers[currentQuestion] = idx;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));

    document.querySelectorAll('.readiness-option').forEach((btn, i) => {
      btn.classList.toggle('selected', i === idx);
    });
    updateNextButton();

    setTimeout(() => {
      if (currentQuestion < QUESTIONS.length - 1) nextQuestion();
    }, 400);
  }

  function updateNextButton() {
    const btn = $('readiness-next-btn');
    const isLast = currentQuestion === QUESTIONS.length - 1;
    const isAnswered = answers[currentQuestion] >= 0;
    btn.disabled = !isAnswered;
    btn.textContent = isLast ? '✨ See Results' : 'Next →';
  }

  function nextQuestion() {
    if (currentQuestion < QUESTIONS.length - 1) { currentQuestion++; renderQuestion(); }
    else showResults();
  }

  function prevQuestion() {
    if (currentQuestion > 0) { currentQuestion--; renderQuestion(); }
  }

  // ─── Calculate Scores ───
  function calculateScores() {
    const pillarScores = {};
    const investigateItems = [];
    PILLARS.forEach(p => { pillarScores[p.id] = { earned: 0, max: 0 }; });

    QUESTIONS.forEach((q, i) => {
      const ps = pillarScores[q.pillar];
      ps.max += 3;
      if (answers[i] >= 0) {
        const opt = q.options[answers[i]];
        ps.earned += opt.points;
        // Track "not sure" answers (typically the last option with 0 points)
        if (opt.points === 0 && opt.label.toLowerCase().includes('not sure')) {
          investigateItems.push({ pillar: q.pillar, question: q.text });
        }
      }
    });

    let totalEarned = 0, totalMax = 0;
    Object.values(pillarScores).forEach(s => { totalEarned += s.earned; totalMax += s.max; });
    const overallScore = Math.round((totalEarned / totalMax) * 100);
    return { pillarScores, overallScore, investigateItems };
  }

  // ─── Show Results ───
  function showResults() {
    $('readiness-assessment').hidden = true;
    $('readiness-results').hidden = false;

    const { pillarScores, overallScore, investigateItems } = calculateScores();
    const tier = TIERS.find(t => overallScore >= t.min && overallScore <= t.max) || TIERS[0];

    // Save to history for re-assessment delta
    saveScoreHistory(overallScore, pillarScores);
    const previousScore = getPreviousScore();

    // Animate score ring
    const circumference = 2 * Math.PI * 52;
    const ring = $('readiness-ring-fg');
    ring.style.stroke = tier.color;

    const scoreEl = $('readiness-score-number');
    const startTime = performance.now();
    function animateScore(now) {
      const progress = Math.min((now - startTime) / 1500, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      scoreEl.textContent = Math.round(eased * overallScore);
      ring.style.strokeDashoffset = circumference - (eased * overallScore / 100) * circumference;
      if (progress < 1) requestAnimationFrame(animateScore);
    }
    requestAnimationFrame(animateScore);

    // Score label + delta
    $('readiness-score-label').textContent = tier.label;
    let descHtml = tier.desc;
    if (previousScore !== null && previousScore !== overallScore) {
      const delta = overallScore - previousScore;
      const deltaClass = delta > 0 ? 'readiness-delta-up' : 'readiness-delta-down';
      const deltaIcon = delta > 0 ? '📈' : '📉';
      descHtml += ` <span class="readiness-delta ${deltaClass}">${deltaIcon} ${delta > 0 ? '+' : ''}${delta} points since last assessment</span>`;
    }
    $('readiness-score-desc').innerHTML = descHtml;

    // Benchmark comparison
    const benchEl = $('readiness-benchmark');
    if (benchEl) {
      const diff = overallScore - BENCHMARKS.overall;
      benchEl.innerHTML = diff >= 0
        ? `📊 You're <strong>${diff} points above</strong> the typical organisation score of ${BENCHMARKS.overall}`
        : `📊 The typical organisation scores ${BENCHMARKS.overall} — you're <strong>${Math.abs(diff)} points below</strong>. Focus on the red areas below.`;
      benchEl.className = 'readiness-benchmark ' + (diff >= 0 ? 'readiness-bench-above' : 'readiness-bench-below');
    }

    // Confetti on high score
    if (overallScore >= 86) setTimeout(launchConfetti, 800);

    // Pillar bars with benchmarks
    const barsContainer = $('readiness-pillar-bars');
    barsContainer.innerHTML = '';
    PILLARS.forEach(p => {
      const ps = pillarScores[p.id];
      const pct = Math.round((ps.earned / ps.max) * 100);
      const bench = BENCHMARKS[p.id] || 50;
      const barColor = pct >= 80 ? '#22C55E' : pct >= 60 ? '#EAB308' : pct >= 40 ? '#F97316' : '#EF4444';

      const row = document.createElement('div');
      row.className = 'readiness-pillar-row';
      row.id = `pillar-${p.id}`;
      row.innerHTML = `
        <span class="readiness-pillar-label">${p.icon} ${p.name}</span>
        <div class="readiness-bar-track">
          <div class="readiness-bar-fill" style="background:${barColor}"></div>
          <div class="readiness-bar-benchmark" style="left:${bench}%" title="Typical: ${bench}%"></div>
        </div>
        <span class="readiness-pillar-pct" style="color:${barColor}">${pct}%</span>
      `;
      barsContainer.appendChild(row);
      setTimeout(() => { row.querySelector('.readiness-bar-fill').style.width = pct + '%'; }, 300);
    });

    // Recommendations with deep-link IDs
    const recsContainer = $('readiness-recommendations-list');
    recsContainer.innerHTML = '';
    let recIdx = 0;

    PILLARS.forEach(p => {
      const ps = pillarScores[p.id];
      const pct = Math.round((ps.earned / ps.max) * 100);
      const rec = RECOMMENDATIONS[p.id];

      if (pct >= 80) {
        appendRec(recsContainer, 'good', p.icon, p.name, rec.good, recIdx++);
      } else if (pct < 50) {
        rec.high.forEach(r => appendRec(recsContainer, 'high', '🔴', r.title, r.desc, recIdx++));
      } else {
        rec.medium.forEach(r => appendRec(recsContainer, 'medium', '🟠', r.title, r.desc, recIdx++));
      }
    });

    // "Investigate" items from "Not sure" answers
    if (investigateItems.length > 0) {
      const header = document.createElement('div');
      header.className = 'readiness-rec-item readiness-priority-investigate';
      header.innerHTML = `
        <span class="readiness-rec-icon">🔍</span>
        <div class="readiness-rec-content">
          <div class="readiness-rec-title">Items to Investigate</div>
          <div class="readiness-rec-desc">You answered "Not sure" on ${investigateItems.length} question${investigateItems.length > 1 ? 's' : ''}. These need investigation before deployment:<ul>${investigateItems.map(item => `<li>${item.question}</li>`).join('')}</ul></div>
        </div>
      `;
      recsContainer.appendChild(header);
    }

    // Render Next Steps resource section
    renderNextSteps(overallScore);

    $('readiness-results').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function appendRec(container, priority, icon, title, desc, idx) {
    const item = document.createElement('div');
    item.className = `readiness-rec-item readiness-priority-${priority}`;
    item.id = `rec-${idx}`;
    item.innerHTML = `
      <span class="readiness-rec-icon">${icon}</span>
      <div class="readiness-rec-content">
        <div class="readiness-rec-title">${title}</div>
        <div class="readiness-rec-desc">${desc}</div>
      </div>
    `;
    container.appendChild(item);
  }

  // ─── Next Steps Resources ───
  const NEXT_STEPS = [
    {
      phase: '🔍 Phase 1 — Get Ready',
      desc: 'Assess your current state and prepare your environment',
      items: [
        { icon: '📊', title: 'Copilot Optimisation Assessment', desc: 'Official Microsoft assessment for data governance maturity and security controls', url: 'https://www.microsoft.com/solutionassessments/' },
        { icon: '🛡️', title: 'Configure Secure Data Foundation', desc: 'Remediate oversharing, apply sensitivity labels, set up DLP', url: 'https://learn.microsoft.com/copilot/microsoft-365/configure-secure-governed-data-foundation-microsoft-365-copilot' },
        { icon: '📂', title: 'SharePoint Advanced Management', desc: 'Permission reports, access reviews, restricted access control', url: 'https://learn.microsoft.com/sharepoint/get-ready-copilot-sharepoint-advanced-management' },
        { icon: '📋', title: 'Copilot Readiness Report', desc: 'Built-in report in M365 admin centre showing prerequisite coverage', url: 'https://learn.microsoft.com/microsoft-365/admin/activity-reports/microsoft-365-copilot-readiness' }
      ]
    },
    {
      phase: '🚀 Phase 2 — Deploy',
      desc: 'Set up Copilot and assign licences',
      items: [
        { icon: '⚙️', title: 'Copilot Setup Guide (Admin)', desc: 'Step-by-step: update channels, MFA, audit logging, licence assignment', url: 'https://learn.microsoft.com/copilot/microsoft-365/microsoft-365-copilot-setup' },
        { icon: '🔑', title: 'Licensing Options', desc: 'All qualifying base plans + Copilot add-on details', url: 'https://learn.microsoft.com/copilot/microsoft-365/microsoft-365-copilot-licensing' },
        { icon: '🌐', title: 'App & Network Requirements', desc: 'Required endpoints, WebSocket support, update channels', url: 'https://learn.microsoft.com/copilot/microsoft-365/microsoft-365-copilot-requirements' },
        { icon: '🔄', title: 'Change Update Channel for Copilot', desc: 'Switch from Semi-Annual to Current or Monthly Enterprise', url: 'https://learn.microsoft.com/microsoft-365-apps/updates/change-channel-for-copilot' }
      ]
    },
    {
      phase: '📣 Phase 3 — Adopt',
      desc: 'Drive user adoption and enablement',
      items: [
        { icon: '📖', title: 'Copilot Adoption Guide', desc: '5-step adoption framework: ready, licence, apps, setup, welcome', url: 'https://learn.microsoft.com/copilot/microsoft-365/microsoft-365-copilot-enablement-resources' },
        { icon: '🎯', title: 'Microsoft Adoption Portal', desc: 'Success Kit, Launch Day kit, Interactive Scenario Library', url: 'https://adoption.microsoft.com/copilot' },
        { icon: '👋', title: 'Welcome Users & Enable Feedback', desc: 'Welcome email templates and feedback collection setup', url: 'https://learn.microsoft.com/copilot/microsoft-365/microsoft-365-copilot-enable-users' },
        { icon: '💡', title: 'Copilot Prompt Gallery', desc: 'Official prompt examples across Word, Excel, Teams, Outlook', url: 'https://copilot.cloud.microsoft/prompts' }
      ]
    },
    {
      phase: '🔒 Phase 4 — Govern & Optimise',
      desc: 'Monitor, protect, and maximise value',
      items: [
        { icon: '🛡️', title: 'Microsoft Purview for Copilot', desc: 'Sensitivity labels, DLP, audit, eDiscovery for Copilot content', url: 'https://learn.microsoft.com/purview/ai-microsoft-365-copilot' },
        { icon: '📊', title: 'Copilot Usage Reports', desc: 'Admin centre dashboards: adoption, active users, feature usage', url: 'https://learn.microsoft.com/copilot/microsoft-365/microsoft-365-copilot-reports-for-admins' },
        { icon: '🔐', title: 'Security Copilot in E5', desc: 'Included Security Copilot compute units for E5 customers', url: 'https://learn.microsoft.com/copilot/security/security-copilot-inclusion' },
        { icon: '📋', title: 'Copilot Deployment Blueprint', desc: 'End-to-end deployment guide with security and governance', url: 'https://learn.microsoft.com/copilot/microsoft-365/secure-govern-copilot-foundational-deployment-guidance' }
      ]
    },
    {
      phase: '🎓 Training Modules',
      desc: 'Free Microsoft Learn courses for your team',
      items: [
        { icon: '📚', title: 'Implement Microsoft 365 Copilot', desc: 'Prerequisites, SAM, data prep, licence assignment, extensibility', url: 'https://learn.microsoft.com/training/modules/implement-microsoft-365-copilot/' },
        { icon: '🌟', title: 'Explore Possibilities with Copilot', desc: 'Practical usage across M365 apps for all users', url: 'https://learn.microsoft.com/training/modules/explore-possibilities-microsoft-365-copilot/' },
        { icon: '📜', title: 'Our Licensing Simplifier', desc: 'Compare M365 plans, take a quiz, find the right licence', url: '/licensing/' },
        { icon: '💡', title: 'Our AI Prompt Library', desc: '84 tested prompts across 8 platforms — ready to use', url: '/prompts/' }
      ]
    }
  ];

  function renderNextSteps(score) {
    const container = $('readiness-next-steps');
    if (!container) return;
    container.innerHTML = '';

    // Highlight which phases matter most based on score
    NEXT_STEPS.forEach(phase => {
      const section = document.createElement('div');
      section.className = 'readiness-ns-phase';
      section.innerHTML = `<h3>${phase.phase}</h3><p class="readiness-ns-desc">${phase.desc}</p>`;

      const grid = document.createElement('div');
      grid.className = 'readiness-ns-grid';

      phase.items.forEach(item => {
        const isExternal = item.url.startsWith('http');
        const card = document.createElement('a');
        card.href = item.url;
        card.className = 'readiness-ns-card';
        if (isExternal) { card.target = '_blank'; card.rel = 'noopener'; }
        card.innerHTML = `
          <span class="readiness-ns-icon">${item.icon}</span>
          <div class="readiness-ns-text">
            <strong>${item.title}</strong>
            <small>${item.desc}</small>
          </div>
          ${isExternal ? '<span class="readiness-ns-ext">↗</span>' : ''}
        `;
        grid.appendChild(card);
      });

      section.appendChild(grid);
      container.appendChild(section);
    });
  }

  // ─── Score History (re-assessment delta) ───
  function saveScoreHistory(score, pillarScores) {
    try {
      const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      const entry = {
        date: new Date().toISOString(),
        score: score,
        pillars: {}
      };
      PILLARS.forEach(p => {
        const ps = pillarScores[p.id];
        entry.pillars[p.id] = Math.round((ps.earned / ps.max) * 100);
      });
      history.push(entry);
      // Keep last 10
      if (history.length > 10) history.splice(0, history.length - 10);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) { /* ignore */ }
  }

  function getPreviousScore() {
    try {
      const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      if (history.length >= 2) return history[history.length - 2].score;
    } catch (e) { /* ignore */ }
    return null;
  }

  // ─── Confetti ───
  function launchConfetti() {
    const container = document.createElement('div');
    container.className = 'readiness-confetti';
    document.body.appendChild(container);
    const colors = ['#3B82F6', '#22C55E', '#EAB308', '#F97316', '#A78BFA', '#FF6B6B'];
    for (let i = 0; i < 60; i++) {
      const piece = document.createElement('div');
      piece.className = 'readiness-confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = Math.random() * 0.5 + 's';
      piece.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
      container.appendChild(piece);
    }
    setTimeout(() => container.remove(), 4000);
  }

  // ─── Share ───
  function shareResults() {
    const { pillarScores, overallScore } = calculateScores();
    const pillarPcts = PILLARS.map(p => {
      const ps = pillarScores[p.id];
      return Math.round((ps.earned / ps.max) * 100);
    }).join(',');

    const url = new URL(window.location.href.split('?')[0]);
    url.searchParams.set('score', overallScore);
    url.searchParams.set('pillars', pillarPcts);

    navigator.clipboard.writeText(url.toString()).then(() => {
      showToast('🔗 Link copied to clipboard!');
    }).catch(() => { prompt('Copy this link:', url.toString()); });
  }

  // ─── Load Shared Results ───
  function loadSharedResults(params) {
    const score = parseInt(params.get('score'));
    const pillarPcts = (params.get('pillars') || '').split(',').map(Number);
    if (isNaN(score)) return;

    $('readiness-assessment').hidden = true;
    $('readiness-results').hidden = false;

    const tier = TIERS.find(t => score >= t.min && score <= t.max) || TIERS[0];
    const circumference = 2 * Math.PI * 52;
    const ring = $('readiness-ring-fg');
    ring.style.stroke = tier.color;

    const scoreEl = $('readiness-score-number');
    const startTime = performance.now();
    function animateScore(now) {
      const progress = Math.min((now - startTime) / 1500, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      scoreEl.textContent = Math.round(eased * score);
      ring.style.strokeDashoffset = circumference - (eased * score / 100) * circumference;
      if (progress < 1) requestAnimationFrame(animateScore);
    }
    requestAnimationFrame(animateScore);

    // Benchmark
    const benchEl = $('readiness-benchmark');
    if (benchEl) {
      const diff = score - BENCHMARKS.overall;
      benchEl.innerHTML = diff >= 0
        ? `📊 This org is <strong>${diff} points above</strong> the typical score of ${BENCHMARKS.overall}`
        : `📊 This org is <strong>${Math.abs(diff)} points below</strong> the typical score of ${BENCHMARKS.overall}`;
      benchEl.className = 'readiness-benchmark ' + (diff >= 0 ? 'readiness-bench-above' : 'readiness-bench-below');
    }

    if (score >= 86) setTimeout(launchConfetti, 800);

    $('readiness-score-label').textContent = tier.label;
    $('readiness-score-desc').textContent = tier.desc;

    const barsContainer = $('readiness-pillar-bars');
    barsContainer.innerHTML = '';
    PILLARS.forEach((p, i) => {
      const pct = pillarPcts[i] || 0;
      const bench = BENCHMARKS[p.id] || 50;
      const barColor = pct >= 80 ? '#22C55E' : pct >= 60 ? '#EAB308' : pct >= 40 ? '#F97316' : '#EF4444';
      const row = document.createElement('div');
      row.className = 'readiness-pillar-row';
      row.innerHTML = `
        <span class="readiness-pillar-label">${p.icon} ${p.name}</span>
        <div class="readiness-bar-track">
          <div class="readiness-bar-fill" style="background:${barColor}"></div>
          <div class="readiness-bar-benchmark" style="left:${bench}%" title="Typical: ${bench}%"></div>
        </div>
        <span class="readiness-pillar-pct" style="color:${barColor}">${pct}%</span>
      `;
      barsContainer.appendChild(row);
      setTimeout(() => { row.querySelector('.readiness-bar-fill').style.width = pct + '%'; }, 300);
    });

    const recsContainer = $('readiness-recommendations-list');
    recsContainer.innerHTML = '<div class="readiness-rec-item readiness-priority-low"><span class="readiness-rec-icon">ℹ️</span><div class="readiness-rec-content"><div class="readiness-rec-title">Shared results view</div><div class="readiness-rec-desc">This is a shared score. To get personalised recommendations, <a href="/copilot-readiness/">take the full assessment</a>.</div></div></div>';

    // Still render Next Steps for shared view
    renderNextSteps(score);

    $('readiness-share-btn').style.display = 'none';
    $('readiness-print-btn').style.display = 'none';
    $('readiness-restart-btn').textContent = '🚀 Take the Full Assessment';
    $('readiness-restart-btn').addEventListener('click', () => {
      window.location.href = '/copilot-readiness/';
    });
  }

  // ─── Restart ───
  function restart() {
    answers = new Array(QUESTIONS.length).fill(-1);
    currentQuestion = 0;
    localStorage.removeItem(STORAGE_KEY);

    $('readiness-results').hidden = true;
    $('readiness-assessment').hidden = false;
    renderPillarNav();
    renderQuestion();

    if (window.location.search) history.replaceState(null, '', window.location.pathname);
  }

  // ─── Toast ───
  function showToast(msg) {
    let toast = document.querySelector('.readiness-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'readiness-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // ─── Boot ───
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
