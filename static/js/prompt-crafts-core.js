/**
 * 🧠 Prompt CRAFTS Core — Shared Analysis & Rewrite Engine
 * Used by: Prompt Polisher, Prompt Tester (and future prompt tools)
 * 100% client-side, zero API calls
 *
 * Exposes: window.PromptCrafts = { analyse, rewrite, generateTips, PILLAR_META }
 */
(function () {
  'use strict';

  /* ════════════════════════════════════════════
     DOMAIN DETECTION
     ════════════════════════════════════════════ */

  const DOMAINS = {
    tech: ['code', 'programming', 'api', 'database', 'cloud', 'azure', 'aws', 'gcp', 'kubernetes', 'docker',
      'python', 'javascript', 'typescript', 'react', 'sql', 'git', 'devops', 'cicd', 'terraform', 'bicep',
      'server', 'linux', 'windows', 'powershell', 'bash', 'algorithm', 'microservice', 'rest', 'graphql',
      'html', 'css', 'backend', 'frontend', 'deploy', 'infrastructure', 'security', 'network', 'vpn',
      'firewall', 'dns', 'ssl', 'certificate', 'endpoint', 'intune', 'sccm', 'active directory', 'entra'],
    business: ['strategy', 'marketing', 'sales', 'revenue', 'kpi', 'quarterly', 'stakeholder', 'budget',
      'roi', 'project management', 'agile', 'scrum', 'meeting', 'presentation', 'proposal', 'client',
      'customer', 'competitor', 'market', 'growth', 'pipeline', 'forecast', 'business plan', 'startup'],
    creative: ['story', 'poem', 'creative', 'fiction', 'blog', 'content', 'social media', 'tweet', 'post',
      'instagram', 'youtube', 'video', 'script', 'headline', 'tagline', 'slogan', 'brand', 'copy',
      'newsletter', 'article', 'editorial', 'novel', 'character'],
    academic: ['research', 'thesis', 'study', 'literature', 'academic', 'citation', 'journal', 'peer review',
      'hypothesis', 'methodology', 'abstract', 'dissertation', 'paper', 'scholarly'],
    education: ['teach', 'learn', 'student', 'lesson', 'course', 'curriculum', 'explain', 'beginner',
      'tutorial', 'training', 'workshop', 'module', 'quiz', 'exam', 'study guide'],
    email: ['email', 'e-mail', 'reply', 'follow up', 'follow-up', 'subject line', 'dear', 'regards',
      'boss', 'manager', 'colleague', 'team', 'cc', 'bcc', 'inbox'],
    data: ['data', 'analytics', 'dashboard', 'chart', 'graph', 'spreadsheet', 'excel', 'csv', 'report',
      'metrics', 'statistics', 'visualization', 'power bi', 'tableau', 'pandas', 'numpy']
  };

  /* ════════════════════════════════════════════
     PATTERN LIBRARIES
     ════════════════════════════════════════════ */

  const ROLE_PATTERNS = [
    /you are(?: a| an)?\s/i, /act as(?: a| an)?\s/i, /pretend you(?:'re| are)\s/i,
    /as a(?: an)?\s.*(?:expert|specialist|professional|writer|developer|engineer|analyst|consultant|coach|advisor|manager)/i,
    /your role is/i, /imagine you(?:'re| are)\s/i, /take (?:on )?the role/i,
    /respond as/i, /you(?:'re| are) (?:a |an )?(?:senior|expert|experienced|professional)/i
  ];

  const ACTION_VERBS = [
    'write', 'create', 'generate', 'build', 'design', 'develop', 'draft', 'compose', 'craft',
    'analyze', 'analyse', 'compare', 'evaluate', 'assess', 'review', 'audit', 'examine',
    'explain', 'describe', 'outline', 'summarize', 'summarise', 'list', 'enumerate',
    'translate', 'convert', 'transform', 'rewrite', 'edit', 'proofread', 'refactor',
    'plan', 'propose', 'recommend', 'suggest', 'advise', 'optimize', 'improve',
    'calculate', 'estimate', 'forecast', 'project', 'predict',
    'troubleshoot', 'debug', 'diagnose', 'fix', 'resolve', 'solve'
  ];

  const FORMAT_PATTERNS = [
    { re: /bullet\s*points?/i, fmt: 'bullet points' },
    { re: /numbered\s*list/i, fmt: 'numbered list' },
    { re: /table/i, fmt: 'table' },
    { re: /json/i, fmt: 'JSON' },
    { re: /markdown/i, fmt: 'markdown' },
    { re: /code(?:\s*block)?/i, fmt: 'code' },
    { re: /paragraph/i, fmt: 'paragraphs' },
    { re: /essay/i, fmt: 'essay format' },
    { re: /email/i, fmt: 'email' },
    { re: /report/i, fmt: 'report format' },
    { re: /step[- ]by[- ]step/i, fmt: 'step-by-step' },
    { re: /outline/i, fmt: 'outline' },
    { re: /presentation|slides?/i, fmt: 'presentation slides' },
    { re: /csv/i, fmt: 'CSV' },
    { re: /(?:heading|section|structure)/i, fmt: 'structured sections' }
  ];

  const TONE_PATTERNS = [
    { re: /professional/i, tone: 'professional' },
    { re: /casual|informal/i, tone: 'casual' },
    { re: /formal/i, tone: 'formal' },
    { re: /friendly|warm/i, tone: 'friendly' },
    { re: /technical/i, tone: 'technical' },
    { re: /simple|plain|easy/i, tone: 'simple' },
    { re: /eli5|like i(?:'m| am) (?:5|five)|for (?:a )?(?:child|kid)/i, tone: 'ELI5' },
    { re: /beginner|newbie|noob|starter/i, tone: 'beginner-friendly' },
    { re: /executive|c-suite|leadership/i, tone: 'executive' },
    { re: /academic|scholarly/i, tone: 'academic' },
    { re: /humorous|funny|witty/i, tone: 'humorous' },
    { re: /persuasive|convincing/i, tone: 'persuasive' },
    { re: /concise|brief|short/i, tone: 'concise' }
  ];

  const SCOPE_PATTERNS = [
    { re: /\b\d+\s*words?\b/i, type: 'word count' },
    { re: /\b\d+\s*(?:sentence|paragraph|point|item|bullet|step|section|page)s?\b/i, type: 'length' },
    { re: /(?:focus|concentrate)\s+on/i, type: 'focus' },
    { re: /(?:don'?t|do not|avoid|exclude|skip|ignore|without)\s/i, type: 'exclusion' },
    { re: /(?:limit|keep|maximum|max|at most|under|no more than)/i, type: 'limit' },
    { re: /(?:at least|minimum|min)/i, type: 'minimum' },
    { re: /(?:include|cover|mention|address)/i, type: 'inclusion' },
    { re: /(?:only|just|specifically|exactly)/i, type: 'specificity' }
  ];

  /* ════════════════════════════════════════════
     CRAFTS ANALYSIS ENGINE
     ════════════════════════════════════════════ */

  function detectDomain(text) {
    var lower = text.toLowerCase();
    var best = 'general';
    var bestScore = 0;
    for (var domain in DOMAINS) {
      var score = 0;
      var keywords = DOMAINS[domain];
      for (var i = 0; i < keywords.length; i++) {
        if (lower.includes(keywords[i])) score++;
      }
      if (score > bestScore) { bestScore = score; best = domain; }
    }
    return bestScore >= 1 ? best : 'general';
  }

  function analyseContext(text) {
    var max = 15;
    var score = 0;
    var sentences = text.split(/[.!?]+/).filter(function(s) { return s.trim().length > 5; });
    var domain = detectDomain(text);

    if (domain !== 'general') score += 5;

    var bgPhrases = [/i(?:'m| am) (?:working|trying|building|creating)/i, /context:/i, /background:/i,
      /(?:my|our) (?:company|team|project|product|app|website|business)/i,
      /i (?:have|need|want) (?:a|to)/i, /for (?:my|our|a|the)\s/i,
      /(?:currently|right now)/i, /(?:situation|scenario|use case)/i];
    for (var i = 0; i < bgPhrases.length; i++) {
      if (bgPhrases[i].test(text)) { score += 2; break; }
    }

    var properNouns = text.match(/(?<!\.\s)(?<!^)\b[A-Z][a-z]{2,}/gm);
    if (properNouns && properNouns.length >= 2) score += 3;

    if (sentences.length >= 3) score += 3;
    else if (sentences.length >= 2) score += 1;

    if (text.includes(',') && text.length > 80) score += 2;

    return { score: Math.min(score, max), max: max, domain: domain };
  }

  function analyseRole(text) {
    var max = 20;
    var score = 0;
    for (var i = 0; i < ROLE_PATTERNS.length; i++) {
      if (ROLE_PATTERNS[i].test(text)) { score += 15; break; }
    }
    if (score > 0) {
      var specifics = ['senior', 'expert', 'experienced', 'specialist', 'professional', 'chief', 'lead'];
      for (var j = 0; j < specifics.length; j++) {
        if (text.toLowerCase().includes(specifics[j])) { score += 5; break; }
      }
    }
    return { score: Math.min(score, max), max: max };
  }

  function analyseAction(text) {
    var max = 25;
    var score = 0;
    var lower = text.toLowerCase().trim();
    var words = lower.split(/\s+/);

    var foundVerb = false;
    for (var i = 0; i < ACTION_VERBS.length; i++) {
      if (words.includes(ACTION_VERBS[i]) || lower.includes(ACTION_VERBS[i])) { foundVerb = true; break; }
    }
    if (foundVerb) score += 10;

    if (words.length >= 15) score += 5;
    else if (words.length >= 8) score += 3;

    if (text.includes('?') && words.length > 5) score += 3;

    var multiInstruction = /\b(and|then|also|additionally|furthermore|next|after that)\b/i;
    if (multiInstruction.test(text) && words.length > 15) score += 4;

    var vague = /^(help|tell|give|do|make|show)\s+(me|us)?\s/i;
    if (vague.test(text.trim())) score = Math.max(score - 5, 3);

    if (words.length <= 5) score = Math.min(score, 5);

    return { score: Math.min(score, max), max: max, hasVerb: foundVerb };
  }

  function analyseFormat(text) {
    var max = 15;
    var score = 0;
    var detected = null;
    for (var i = 0; i < FORMAT_PATTERNS.length; i++) {
      if (FORMAT_PATTERNS[i].re.test(text)) { score += 12; detected = FORMAT_PATTERNS[i].fmt; break; }
    }
    if (!detected) {
      if (/\blist\b/i.test(text)) { score += 6; detected = 'list (implicit)'; }
      else if (/\bcompare\b/i.test(text)) { score += 6; detected = 'comparison (implicit)'; }
    }
    if (detected && /format|structure|organize|organise/i.test(text)) score += 3;
    return { score: Math.min(score, max), max: max, detected: detected };
  }

  function analyseTone(text) {
    var max = 10;
    var score = 0;
    var detected = null;
    for (var i = 0; i < TONE_PATTERNS.length; i++) {
      if (TONE_PATTERNS[i].re.test(text)) { score += 8; detected = TONE_PATTERNS[i].tone; break; }
    }
    if (/for (?:a |an )?(?:audience|reader|team|manager|client|developer|student|beginner|expert)/i.test(text)) {
      score += 5;
      if (!detected) detected = 'audience-aware';
    }
    return { score: Math.min(score, max), max: max, detected: detected };
  }

  function analyseScope(text) {
    var max = 15;
    var score = 0;
    var found = [];
    for (var i = 0; i < SCOPE_PATTERNS.length; i++) {
      if (SCOPE_PATTERNS[i].re.test(text)) { score += 4; found.push(SCOPE_PATTERNS[i].type); }
    }
    if (found.length >= 3) score += 3;
    return { score: Math.min(score, max), max: max, found: found };
  }

  function analyse(text) {
    if (!text || !text.trim()) return null;
    var ctx = analyseContext(text);
    var role = analyseRole(text);
    var action = analyseAction(text);
    var format = analyseFormat(text);
    var tone = analyseTone(text);
    var scope = analyseScope(text);
    var total = ctx.score + role.score + action.score + format.score + tone.score + scope.score;
    var domain = ctx.domain;

    var label, desc;
    if (total <= 25) { label = 'Needs Work'; desc = 'This prompt is missing most CRAFTS elements — the AI will guess a lot.'; }
    else if (total <= 50) { label = 'Getting There'; desc = 'Some elements are present, but adding more structure will improve results.'; }
    else if (total <= 75) { label = 'Good Start'; desc = 'Solid foundation — a few tweaks will make this prompt really strong.'; }
    else if (total <= 90) { label = 'Strong'; desc = 'Well-structured prompt — the AI has clear direction.'; }
    else { label = 'Expert Level'; desc = 'Excellent — this prompt covers all CRAFTS elements.'; }

    return {
      total: total, label: label, desc: desc, domain: domain,
      pillars: {
        context: ctx, role: role, action: action, format: format, tone: tone, scope: scope
      }
    };
  }

  /* ════════════════════════════════════════════
     REWRITE ENGINE
     ════════════════════════════════════════════ */

  var ROLE_SUGGESTIONS = {
    tech: 'a senior software engineer with expertise in modern development practices',
    business: 'an experienced business strategist and management consultant',
    creative: 'a skilled content creator and copywriter',
    academic: 'an academic research expert with strong analytical skills',
    education: 'an experienced educator who explains complex topics simply',
    email: 'a professional communication specialist',
    data: 'a data analyst experienced in visualization and insights',
    general: 'a knowledgeable and helpful assistant'
  };

  var FORMAT_SUGGESTIONS = {
    write: 'structured paragraphs with clear headings',
    create: 'a well-organized document with sections',
    list: 'a numbered list with brief explanations for each item',
    compare: 'a comparison table with clear columns',
    explain: 'a step-by-step explanation with examples',
    summarize: 'a concise summary using bullet points',
    summarise: 'a concise summary using bullet points',
    analyze: 'a structured analysis with key findings and recommendations',
    analyse: 'a structured analysis with key findings and recommendations',
    review: 'structured feedback with specific suggestions for improvement',
    plan: 'an actionable plan with numbered steps and timelines',
    troubleshoot: 'a diagnostic checklist with solutions for each issue',
    debug: 'a systematic debugging walkthrough',
    default: 'clear, well-structured sections with bullet points where appropriate'
  };

  var TONE_SUGGESTIONS = {
    tech: 'technical yet accessible',
    business: 'professional and results-oriented',
    creative: 'engaging and conversational',
    academic: 'formal and evidence-based',
    education: 'clear and beginner-friendly, using analogies where helpful',
    email: 'professional and courteous',
    data: 'precise and data-driven',
    general: 'clear and helpful'
  };

  var PLATFORM_HINTS = {
    copilot: 'Note: This prompt is optimised for Microsoft 365 Copilot. Keep it grounded — Copilot already has access to your org data, so focus on what you want done rather than providing context it already knows. Reference specific files, emails, or meetings by name when possible.',
    chatgpt: 'Note: This prompt is optimised for ChatGPT. Be explicit about the output format and provide examples of what good output looks like. ChatGPT responds well to detailed system-level instructions and step-by-step reasoning.',
    claude: 'Note: This prompt is optimised for Claude. Claude responds well to clear constraints, structured instructions, and explicit boundaries. If you want it to think step-by-step, say so. Be direct about what to include and exclude.',
    gemini: 'Note: This prompt is optimised for Gemini. Structure your request with clear numbered steps. Gemini handles multi-part tasks well — break complex requests into sub-tasks and specify the output format for each.'
  };

  function generateContextSuggestion(text, domain) {
    var suggestions = {
      tech: 'I am working on a software project and need technical guidance for a production environment.',
      business: 'This is for a business context where clear, actionable recommendations are needed for decision-making.',
      creative: 'I am creating content for a general audience and want it to be engaging and shareable.',
      academic: 'This is for an academic context where accuracy, proper structure, and evidence-based reasoning are important.',
      education: 'I am preparing learning material for someone who is new to this topic and needs clear explanations.',
      email: 'This is a workplace email where professionalism and clarity are important.',
      data: 'I need to work with data and want clear, actionable insights that non-technical stakeholders can understand.',
      general: 'I need a well-thought-out response that I can use directly.'
    };
    return suggestions[domain] || suggestions.general;
  }

  function expandShortPrompt(core, domain) {
    if (/^explain\s/i.test(core)) {
      return core.replace(/\.$/, '') + ' in detail, covering what it is, why it matters, and how it works in practice.';
    }
    if (/^write\s/i.test(core)) {
      return core.replace(/\.$/, '') + ' Include key points, practical examples, and a clear structure.';
    }
    if (/^help\s/i.test(core)) {
      return core.replace(/^help\s+(me\s+)?(with\s+)?/i, 'Provide detailed guidance on ');
    }
    return core + ' Be thorough and include specific details, examples, and actionable recommendations.';
  }

  function generateScopeSuggestion(text, domain) {
    var wordCount = text.split(/\s+/).length;
    if (wordCount <= 10) {
      return 'Keep your response between 200-400 words. Focus on the most important points and be specific.';
    }
    return 'Keep your response focused and well-structured. Aim for completeness without unnecessary repetition.';
  }

  /**
   * Rewrite a prompt to improve weak CRAFTS areas.
   * @param {string} text - Original prompt text
   * @param {object} analysis - Result from analyse()
   * @param {string} [platform] - Optional platform: 'general', 'copilot', 'chatgpt', 'claude', 'gemini'
   * @returns {string} Rewritten prompt
   */
  function rewrite(text, analysis, platform) {
    if (!analysis) return text;
    var parts = [];
    var pillars = analysis.pillars;
    var domain = analysis.domain;
    if (platform === undefined) platform = 'general';

    // Role injection
    if (pillars.role.score < 10) {
      var role = ROLE_SUGGESTIONS[domain] || ROLE_SUGGESTIONS.general;
      parts.push('You are ' + role + '.');
    }

    // Context injection
    if (pillars.context.score < 8) {
      var ctxSuggestion = generateContextSuggestion(text, domain);
      if (ctxSuggestion) parts.push(ctxSuggestion);
    }

    // Original prompt (cleaned up)
    var core = text.trim();
    if (core[0] && core[0] === core[0].toLowerCase()) {
      core = core[0].toUpperCase() + core.slice(1);
    }
    core = core.replace(/^(?:can you |could you |please |i need you to |i want you to )/i, '');
    if (core[0] && core[0] === core[0].toLowerCase()) {
      core = core[0].toUpperCase() + core.slice(1);
    }
    if (!/[.!?]$/.test(core)) core += '.';
    if (core.split(/\s+/).length <= 5) {
      core = expandShortPrompt(core, domain);
    }
    parts.push(core);

    // Format injection
    if (pillars.format.score < 8) {
      var firstWord = text.trim().split(/\s+/)[0].toLowerCase();
      var fmt = FORMAT_SUGGESTIONS[firstWord] || FORMAT_SUGGESTIONS.default;
      parts.push('Format your response as ' + fmt + '.');
    }

    // Tone injection
    if (pillars.tone.score < 5) {
      var tone = TONE_SUGGESTIONS[domain] || TONE_SUGGESTIONS.general;
      parts.push('Use a ' + tone + ' tone.');
    }

    // Scope injection
    if (pillars.scope.score < 8) {
      var scopeSuggestion = generateScopeSuggestion(text, domain);
      parts.push(scopeSuggestion);
    }

    // Platform-specific tweaks
    if (platform !== 'general') {
      var hint = PLATFORM_HINTS[platform];
      if (hint) parts.push(hint);
    }

    return parts.join('\n\n');
  }

  /* ════════════════════════════════════════════
     TIP GENERATOR
     ════════════════════════════════════════════ */

  function generateTips(analysis) {
    var tips = [];
    var pillars = analysis.pillars;
    var domain = analysis.domain;

    if (pillars.role.score < 10) {
      var role = ROLE_SUGGESTIONS[domain] || ROLE_SUGGESTIONS.general;
      tips.push({
        icon: 'R', pillar: 'Role',
        text: 'Add a role to guide the AI\'s expertise. Try starting with: <strong>"You are ' + role + '."</strong>'
      });
    }

    if (pillars.context.score < 8) {
      tips.push({
        icon: 'C', pillar: 'Context',
        text: 'Give the AI some background. Who is this for? What\'s the situation? <strong>Add 1-2 sentences of context</strong> so the AI doesn\'t have to guess.'
      });
    }

    if (pillars.action.score < 15) {
      if (!pillars.action.hasVerb) {
        tips.push({
          icon: 'A', pillar: 'Action',
          text: 'Start with a clear action verb like <strong>Write, Create, Analyse, Compare, Explain, or List</strong>. Vague requests like "help me with" give vague results.'
        });
      } else {
        tips.push({
          icon: 'A', pillar: 'Action',
          text: 'Your task is visible but could be more specific. <strong>Add details</strong> — what exactly should be covered? What\'s the desired outcome?'
        });
      }
    }

    if (pillars.format.score < 8) {
      var firstWord = pillars.action.hasVerb ? '' : 'After adding an action verb, ';
      tips.push({
        icon: 'F', pillar: 'Format',
        text: firstWord + 'Tell the AI <strong>how to structure the output</strong> — bullet points, table, step-by-step, numbered list, or paragraphs with headings.'
      });
    }

    if (pillars.tone.score < 5) {
      tips.push({
        icon: 'T', pillar: 'Tone',
        text: 'Define your audience and tone. Try: <strong>"Use a professional tone suitable for IT managers"</strong> or <strong>"Explain in simple terms for beginners."</strong>'
      });
    }

    if (pillars.scope.score < 8) {
      tips.push({
        icon: 'S', pillar: 'Scope',
        text: 'Set boundaries. Try: <strong>"Keep it under 300 words"</strong>, <strong>"Focus on the top 5 options"</strong>, or <strong>"Don\'t include pricing details."</strong>'
      });
    }

    return tips;
  }

  /* ════════════════════════════════════════════
     SHARED METADATA
     ════════════════════════════════════════════ */

  var PILLAR_META = {
    context: { letter: 'C', label: 'Context', weight: '20%' },
    role:    { letter: 'R', label: 'Role',    weight: '15%' },
    action:  { letter: 'A', label: 'Action',  weight: '20%' },
    format:  { letter: 'F', label: 'Format',  weight: '15%' },
    tone:    { letter: 'T', label: 'Tone',    weight: '15%' },
    scope:   { letter: 'S', label: 'Scope',   weight: '15%' }
  };

  /* ════════════════════════════════════════════
     EXPORT
     ════════════════════════════════════════════ */

  window.PromptCrafts = {
    analyse: analyse,
    rewrite: rewrite,
    generateTips: generateTips,
    PILLAR_META: PILLAR_META
  };

})();
