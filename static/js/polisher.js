/**
 * ✨ Prompt Polisher — CRAFTS Analysis & Rewrite Engine
 * 100% client-side, zero API calls
 */
(function () {
  'use strict';

  /* ════════════════════════════════════════════
     CRAFTS ANALYSIS ENGINE
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

  function detectDomain(text) {
    const lower = text.toLowerCase();
    let best = 'general';
    let bestScore = 0;
    for (const [domain, keywords] of Object.entries(DOMAINS)) {
      let score = 0;
      for (const kw of keywords) {
        if (lower.includes(kw)) score++;
      }
      if (score > bestScore) { bestScore = score; best = domain; }
    }
    return bestScore >= 1 ? best : 'general';
  }

  function analyseContext(text) {
    const max = 15;
    let score = 0;
    const lower = text.toLowerCase();
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
    const domain = detectDomain(text);

    // Domain keywords present
    if (domain !== 'general') score += 5;

    // Background phrases
    const bgPhrases = [/i(?:'m| am) (?:working|trying|building|creating)/i, /context:/i, /background:/i,
      /(?:my|our) (?:company|team|project|product|app|website|business)/i,
      /i (?:have|need|want) (?:a|to)/i, /for (?:my|our|a|the)\s/i,
      /(?:currently|right now)/i, /(?:situation|scenario|use case)/i];
    for (const p of bgPhrases) {
      if (p.test(text)) { score += 2; break; }
    }

    // Specific nouns or proper nouns (rough heuristic: uppercase words not at sentence start)
    const properNouns = text.match(/(?<!\.\s)(?<!^)\b[A-Z][a-z]{2,}/gm);
    if (properNouns && properNouns.length >= 2) score += 3;

    // Length bonus (longer prompts tend to have more context)
    if (sentences.length >= 3) score += 3;
    else if (sentences.length >= 2) score += 1;

    // Multiple clauses
    if (text.includes(',') && text.length > 80) score += 2;

    return { score: Math.min(score, max), max, domain };
  }

  function analyseRole(text) {
    const max = 20;
    let score = 0;
    for (const p of ROLE_PATTERNS) {
      if (p.test(text)) { score += 15; break; }
    }
    // Specific expertise keywords
    if (score > 0) {
      const specifics = ['senior', 'expert', 'experienced', 'specialist', 'professional', 'chief', 'lead'];
      for (const s of specifics) {
        if (text.toLowerCase().includes(s)) { score += 5; break; }
      }
    }
    return { score: Math.min(score, max), max };
  }

  function analyseAction(text) {
    const max = 25;
    let score = 0;
    const lower = text.toLowerCase().trim();
    const words = lower.split(/\s+/);

    // Starts with or contains a strong action verb
    let foundVerb = false;
    for (const v of ACTION_VERBS) {
      if (words.includes(v) || lower.includes(v)) { foundVerb = true; break; }
    }
    if (foundVerb) score += 10;

    // Specificity: longer prompts with detail
    if (words.length >= 15) score += 5;
    else if (words.length >= 8) score += 3;

    // Contains question mark or clear instruction
    if (text.includes('?') && words.length > 5) score += 3;

    // Multiple instructions (and, then, also, additionally)
    const multiInstruction = /\b(and|then|also|additionally|furthermore|next|after that)\b/i;
    if (multiInstruction.test(text) && words.length > 15) score += 4;

    // Vague penalty
    const vague = /^(help|tell|give|do|make|show)\s+(me|us)?\s/i;
    if (vague.test(text.trim())) score = Math.max(score - 5, 3);

    // Very short prompt penalty
    if (words.length <= 5) score = Math.min(score, 5);

    return { score: Math.min(score, max), max, hasVerb: foundVerb };
  }

  function analyseFormat(text) {
    const max = 15;
    let score = 0;
    let detected = null;
    for (const { re, fmt } of FORMAT_PATTERNS) {
      if (re.test(text)) { score += 12; detected = fmt; break; }
    }
    // Implicit format from action
    if (!detected) {
      if (/\blist\b/i.test(text)) { score += 6; detected = 'list (implicit)'; }
      else if (/\bcompare\b/i.test(text)) { score += 6; detected = 'comparison (implicit)'; }
    }
    // Extra points for explicit format instructions
    if (detected && /format|structure|organize|organise/i.test(text)) score += 3;
    return { score: Math.min(score, max), max, detected };
  }

  function analyseTone(text) {
    const max = 10;
    let score = 0;
    let detected = null;
    for (const { re, tone } of TONE_PATTERNS) {
      if (re.test(text)) { score += 8; detected = tone; break; }
    }
    // Audience specification
    if (/for (?:a |an )?(?:audience|reader|team|manager|client|developer|student|beginner|expert)/i.test(text)) {
      score += 5;
      if (!detected) detected = 'audience-aware';
    }
    return { score: Math.min(score, max), max, detected };
  }

  function analyseScope(text) {
    const max = 15;
    let score = 0;
    const found = [];
    for (const { re, type } of SCOPE_PATTERNS) {
      if (re.test(text)) { score += 4; found.push(type); }
    }
    // Bonus for multiple scope constraints
    if (found.length >= 3) score += 3;
    return { score: Math.min(score, max), max, found };
  }

  function analyse(text) {
    if (!text || !text.trim()) return null;
    const ctx = analyseContext(text);
    const role = analyseRole(text);
    const action = analyseAction(text);
    const format = analyseFormat(text);
    const tone = analyseTone(text);
    const scope = analyseScope(text);
    const total = ctx.score + role.score + action.score + format.score + tone.score + scope.score;
    const domain = ctx.domain;

    let label, desc;
    if (total <= 25) { label = 'Needs Work'; desc = 'This prompt is missing most CRAFTS elements — the AI will guess a lot.'; }
    else if (total <= 50) { label = 'Getting There'; desc = 'Some elements are present, but adding more structure will improve results.'; }
    else if (total <= 75) { label = 'Good Start'; desc = 'Solid foundation — a few tweaks will make this prompt really strong.'; }
    else if (total <= 90) { label = 'Strong'; desc = 'Well-structured prompt — the AI has clear direction.'; }
    else { label = 'Expert Level'; desc = 'Excellent — this prompt covers all CRAFTS elements.'; }

    return {
      total, label, desc, domain,
      pillars: {
        context: ctx, role, action, format, tone, scope
      }
    };
  }


  /* ════════════════════════════════════════════
     REWRITE ENGINE
     ════════════════════════════════════════════ */

  const ROLE_SUGGESTIONS = {
    tech: 'a senior software engineer with expertise in modern development practices',
    business: 'an experienced business strategist and management consultant',
    creative: 'a skilled content creator and copywriter',
    academic: 'an academic research expert with strong analytical skills',
    education: 'an experienced educator who explains complex topics simply',
    email: 'a professional communication specialist',
    data: 'a data analyst experienced in visualization and insights',
    general: 'a knowledgeable and helpful assistant'
  };

  const FORMAT_SUGGESTIONS = {
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

  const TONE_SUGGESTIONS = {
    tech: 'technical yet accessible',
    business: 'professional and results-oriented',
    creative: 'engaging and conversational',
    academic: 'formal and evidence-based',
    education: 'clear and beginner-friendly, using analogies where helpful',
    email: 'professional and courteous',
    data: 'precise and data-driven',
    general: 'clear and helpful'
  };

  function rewrite(text, analysis) {
    if (!analysis) return text;
    const parts = [];
    const { pillars, domain } = analysis;

    // ── Role injection ──
    if (pillars.role.score < 10) {
      const role = ROLE_SUGGESTIONS[domain] || ROLE_SUGGESTIONS.general;
      parts.push(`You are ${role}.`);
    }

    // ── Context injection (smart, not placeholder) ──
    if (pillars.context.score < 8) {
      const ctxSuggestion = generateContextSuggestion(text, domain);
      if (ctxSuggestion) parts.push(ctxSuggestion);
    }

    // ── Original prompt (cleaned up) ──
    let core = text.trim();
    // Capitalize first letter if not already
    if (core[0] && core[0] === core[0].toLowerCase()) {
      core = core[0].toUpperCase() + core.slice(1);
    }
    // Strengthen vague openers
    core = core.replace(/^(?:can you |could you |please |i need you to |i want you to )/i, '');
    if (core[0] && core[0] === core[0].toLowerCase()) {
      core = core[0].toUpperCase() + core.slice(1);
    }
    // Add period if missing
    if (!/[.!?]$/.test(core)) core += '.';
    // Expand very short prompts
    if (core.split(/\s+/).length <= 5) {
      core = expandShortPrompt(core, domain);
    }
    parts.push(core);

    // ── Format injection ──
    if (pillars.format.score < 8) {
      const firstWord = text.trim().split(/\s+/)[0].toLowerCase();
      const fmt = FORMAT_SUGGESTIONS[firstWord] || FORMAT_SUGGESTIONS.default;
      parts.push(`Format your response as ${fmt}.`);
    }

    // ── Tone injection ──
    if (pillars.tone.score < 5) {
      const tone = TONE_SUGGESTIONS[domain] || TONE_SUGGESTIONS.general;
      parts.push(`Use a ${tone} tone.`);
    }

    // ── Scope injection ──
    if (pillars.scope.score < 8) {
      const scopeSuggestion = generateScopeSuggestion(text, domain);
      parts.push(scopeSuggestion);
    }

    // ── Platform-specific tweaks ──
    const platform = getCurrentPlatform();
    if (platform !== 'general') {
      const hint = PLATFORM_HINTS[platform];
      if (hint) parts.push(hint);
    }

    return parts.join('\n\n');
  }

  function getCurrentPlatform() {
    const el = document.getElementById('polisher-platform');
    return el ? el.value : 'general';
  }

  const PLATFORM_HINTS = {
    copilot: 'Note: This prompt is optimised for Microsoft 365 Copilot. Keep it grounded — Copilot already has access to your org data, so focus on what you want done rather than providing context it already knows. Reference specific files, emails, or meetings by name when possible.',
    chatgpt: 'Note: This prompt is optimised for ChatGPT. Be explicit about the output format and provide examples of what good output looks like. ChatGPT responds well to detailed system-level instructions and step-by-step reasoning.',
    claude: 'Note: This prompt is optimised for Claude. Claude responds well to clear constraints, structured instructions, and explicit boundaries. If you want it to think step-by-step, say so. Be direct about what to include and exclude.',
    gemini: 'Note: This prompt is optimised for Gemini. Structure your request with clear numbered steps. Gemini handles multi-part tasks well — break complex requests into sub-tasks and specify the output format for each.'
  };

  function generateContextSuggestion(text, domain) {
    const lower = text.toLowerCase();
    const suggestions = {
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
    const lower = core.toLowerCase();
    // "Explain X" → "Explain X in detail, covering what it is, why it matters, and how it works"
    if (/^explain\s/i.test(core)) {
      return core.replace(/\.$/, '') + ' in detail, covering what it is, why it matters, and how it works in practice.';
    }
    // "Write X" → add specificity
    if (/^write\s/i.test(core)) {
      return core.replace(/\.$/, '') + ' Include key points, practical examples, and a clear structure.';
    }
    // "Help me with X" → reframe
    if (/^help\s/i.test(core)) {
      return core.replace(/^help\s+(me\s+)?(with\s+)?/i, 'Provide detailed guidance on ');
    }
    return core + ' Be thorough and include specific details, examples, and actionable recommendations.';
  }

  function generateScopeSuggestion(text, domain) {
    const wordCount = text.split(/\s+/).length;
    if (wordCount <= 10) {
      return 'Keep your response between 200-400 words. Focus on the most important points and be specific.';
    }
    return 'Keep your response focused and well-structured. Aim for completeness without unnecessary repetition.';
  }


  /* ════════════════════════════════════════════
     TIP GENERATOR
     ════════════════════════════════════════════ */

  function generateTips(analysis) {
    const tips = [];
    const { pillars, domain } = analysis;

    if (pillars.role.score < 10) {
      const role = ROLE_SUGGESTIONS[domain] || ROLE_SUGGESTIONS.general;
      tips.push({
        icon: '🎭',
        pillar: 'Role',
        text: `Add a role to guide the AI's expertise. Try starting with: <strong>"You are ${role}."</strong>`
      });
    }

    if (pillars.context.score < 8) {
      tips.push({
        icon: '📋',
        pillar: 'Context',
        text: `Give the AI some background. Who is this for? What's the situation? <strong>Add 1-2 sentences of context</strong> so the AI doesn't have to guess.`
      });
    }

    if (pillars.action.score < 15) {
      if (!pillars.action.hasVerb) {
        tips.push({
          icon: '🎯',
          pillar: 'Action',
          text: `Start with a clear action verb like <strong>Write, Create, Analyse, Compare, Explain, or List</strong>. Vague requests like "help me with" give vague results.`
        });
      } else {
        tips.push({
          icon: '🎯',
          pillar: 'Action',
          text: `Your task is visible but could be more specific. <strong>Add details</strong> — what exactly should be covered? What's the desired outcome?`
        });
      }
    }

    if (pillars.format.score < 8) {
      const firstWord = analysis.pillars.action.hasVerb ? '' : 'After adding an action verb, ';
      tips.push({
        icon: '📐',
        pillar: 'Format',
        text: `${firstWord}Tell the AI <strong>how to structure the output</strong> — bullet points, table, step-by-step, numbered list, or paragraphs with headings.`
      });
    }

    if (pillars.tone.score < 5) {
      tips.push({
        icon: '🎤',
        pillar: 'Tone',
        text: `Define your audience and tone. Try: <strong>"Use a professional tone suitable for IT managers"</strong> or <strong>"Explain in simple terms for beginners."</strong>`
      });
    }

    if (pillars.scope.score < 8) {
      tips.push({
        icon: '📏',
        pillar: 'Scope',
        text: `Set boundaries. Try: <strong>"Keep it under 300 words"</strong>, <strong>"Focus on the top 5 options"</strong>, or <strong>"Don't include pricing details."</strong>`
      });
    }

    return tips;
  }


  /* ════════════════════════════════════════════
     EXAMPLE PROMPTS
     ════════════════════════════════════════════ */

  const EXAMPLES = [
    { label: 'Vague blog request', text: 'write me a blog post about AI' },
    { label: 'Simple question', text: 'explain kubernetes' },
    { label: 'Resume help', text: 'help me improve my resume' },
    { label: 'Email draft', text: 'write an email to my boss about the project delay' },
    { label: 'Data analysis', text: 'analyze our sales data and give me insights' }
  ];


  /* ════════════════════════════════════════════
     HISTORY MANAGER
     ════════════════════════════════════════════ */

  const HISTORY_KEY = 'prompt-polisher-history';
  const MAX_HISTORY = 10;

  function saveHistory(text, score) {
    try {
      const history = loadHistory();
      // Don't save duplicates
      if (history.length > 0 && history[0].text === text) return;
      history.unshift({ text, score, time: Date.now() });
      if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) { /* localStorage might be full or disabled */ }
  }

  function loadHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    } catch (e) { return []; }
  }


  /* ════════════════════════════════════════════
     UI CONTROLLER
     ════════════════════════════════════════════ */

  const PILLAR_META = {
    context: { letter: 'C', label: 'Context', icon: '📋' },
    role:    { letter: 'R', label: 'Role',    icon: '🎭' },
    action:  { letter: 'A', label: 'Action',  icon: '🎯' },
    format:  { letter: 'F', label: 'Format',  icon: '📐' },
    tone:    { letter: 'T', label: 'Tone',    icon: '🎤' },
    scope:   { letter: 'S', label: 'Scope',   icon: '📏' }
  };

  function scoreClass(pct) {
    if (pct <= 0.25) return 'low';
    if (pct <= 0.5) return 'med';
    if (pct <= 0.8) return 'good';
    return 'great';
  }

  function totalScoreClass(score) {
    if (score <= 25) return 'score-low';
    if (score <= 50) return 'score-med';
    if (score <= 75) return 'score-good';
    return 'score-great';
  }

  let currentPolished = '';

  function renderScore(analysis, polishedAnalysis) {
    const $number = document.getElementById('polisher-score-number');
    const $label = document.getElementById('polisher-score-label');
    const $desc = document.getElementById('polisher-score-desc');
    const $pillars = document.getElementById('polisher-pillars');

    // Animate score count-up
    animateScore($number, analysis.total);
    $number.className = 'polisher-score-number ' + totalScoreClass(analysis.total);
    $label.textContent = analysis.label;
    $desc.textContent = analysis.desc;

    let html = '';
    for (const [key, meta] of Object.entries(PILLAR_META)) {
      const p = analysis.pillars[key];
      const pct = p.score / p.max;
      const cls = scoreClass(pct);
      // Start bars at 0 width, animate in via CSS transition
      html += `
        <div class="polisher-pillar">
          <span class="polisher-pillar-name"><span class="craft-icon">${meta.icon}</span> ${meta.label}</span>
          <div class="polisher-pillar-bar">
            <div class="polisher-pillar-fill fill-${cls}" style="width: 0%" data-target="${Math.round(pct * 100)}"></div>
          </div>
          <span class="polisher-pillar-score score-${cls}">${p.score}/${p.max}</span>
        </div>`;
    }
    $pillars.innerHTML = html;

    // Trigger bar animations after render
    requestAnimationFrame(() => {
      $pillars.querySelectorAll('.polisher-pillar-fill').forEach(bar => {
        bar.style.width = bar.dataset.target + '%';
      });
    });

    // Render polished score delta if available
    const $delta = document.getElementById('polisher-score-delta');
    if ($delta && polishedAnalysis) {
      const diff = polishedAnalysis.total - analysis.total;
      if (diff > 0) {
        $delta.innerHTML = `<span class="polisher-delta-badge">Original: <strong>${analysis.total}</strong> → Polished: <strong class="score-good">${polishedAnalysis.total}</strong> <span class="polisher-delta-up">+${diff} points</span></span>`;
        $delta.style.display = '';
      } else {
        $delta.style.display = 'none';
      }
    }
  }

  function animateScore(el, target) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = target;
      return;
    }
    const duration = 600;
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function renderTips(tips) {
    const $tips = document.getElementById('polisher-tips');
    const $section = document.getElementById('polisher-tips-section');

    if (tips.length === 0) {
      $tips.innerHTML = '<div class="polisher-no-tips">🎉 Your prompt covers all CRAFTS elements — nice work!</div>';
      return;
    }

    $tips.innerHTML = tips.map(t =>
      `<div class="polisher-tip">
        <span class="polisher-tip-icon">${t.icon}</span>
        <div><strong>${t.pillar}:</strong> ${t.text}</div>
      </div>`
    ).join('');
  }

  function renderOutput(original, polished) {
    const $output = document.getElementById('polisher-output');
    const $compareBefore = document.getElementById('polisher-compare-before');
    const $compareAfter = document.getElementById('polisher-compare-after');

    // Highlight added parts in green
    const originalLower = original.toLowerCase().trim();
    const lines = polished.split('\n\n');
    const htmlParts = lines.map(line => {
      const lineLower = line.toLowerCase().trim();
      const isOriginal = originalLower.includes(lineLower.replace(/\.$/, '').slice(0, 20));
      if (isOriginal && line.length < original.length * 1.5) {
        return escapeHtml(line);
      }
      return `<span class="polisher-added">${escapeHtml(line)}</span>`;
    });
    $output.innerHTML = htmlParts.join('\n\n');
    currentPolished = polished;

    // Populate compare view
    if ($compareBefore) $compareBefore.textContent = original;
    if ($compareAfter) $compareAfter.textContent = polished;

    // Reset to polished view
    showView('polished');
  }

  function showView(view) {
    const $output = document.getElementById('polisher-output');
    const $compare = document.getElementById('polisher-compare');
    const $toggle = document.getElementById('polisher-view-toggle');
    if (!$toggle) return;

    $toggle.querySelectorAll('.polisher-toggle-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });

    if (view === 'compare') {
      $output.style.display = 'none';
      if ($compare) $compare.style.display = '';
    } else {
      $output.style.display = '';
      if ($compare) $compare.style.display = 'none';
    }
  }

  /* ════════════════════════════════════════════
     RELATED PROMPTS
     ════════════════════════════════════════════ */

  const DOMAIN_TO_PROMPTS = {
    tech: [
      { title: 'Debug & Fix Code', path: '/prompts/data-analysis/debug-and-fix-code/' },
      { title: 'Deep Dive Research', path: '/prompts/research/deep-dive-research/' },
      { title: 'Professional Blog Post', path: '/prompts/writing/professional-blog-post/' }
    ],
    business: [
      { title: 'Executive Brief', path: '/prompts/summarising/executive-brief/' },
      { title: 'Slide Deck Builder', path: '/prompts/presentations/slide-deck-builder/' },
      { title: 'Strategic Brainstorm', path: '/prompts/brainstorming/strategic-brainstorm/' }
    ],
    creative: [
      { title: 'Blog Post Writer', path: '/prompts/writing/professional-blog-post/' },
      { title: 'Social Media Creator', path: '/prompts/writing/social-media-post-creator/' },
      { title: 'Creative Brainstorm', path: '/prompts/brainstorming/creative-brainstorm/' }
    ],
    email: [
      { title: 'Professional Email', path: '/prompts/email/professional-email-composer/' },
      { title: 'Follow-Up Email', path: '/prompts/email/follow-up-email/' },
      { title: 'Meeting Request', path: '/prompts/email/meeting-request/' }
    ],
    data: [
      { title: 'Data Analysis Report', path: '/prompts/data-analysis/data-analysis-report/' },
      { title: 'Excel Formula Helper', path: '/prompts/data-analysis/excel-formula-helper/' },
      { title: 'Meeting Notes Summary', path: '/prompts/summarising/meeting-notes-summariser/' }
    ],
    education: [
      { title: 'Deep Dive Research', path: '/prompts/research/deep-dive-research/' },
      { title: 'ELI5 Explainer', path: '/prompts/research/eli5-explainer/' },
      { title: 'Study Guide Creator', path: '/prompts/summarising/study-guide-creator/' }
    ],
    academic: [
      { title: 'Deep Dive Research', path: '/prompts/research/deep-dive-research/' },
      { title: 'Executive Brief', path: '/prompts/summarising/executive-brief/' },
      { title: 'Professional Writing', path: '/prompts/writing/professional-blog-post/' }
    ]
  };

  function renderRelatedPrompts(domain) {
    const $section = document.getElementById('polisher-related');
    if (!$section) return;
    const prompts = DOMAIN_TO_PROMPTS[domain];
    if (!prompts) { $section.style.display = 'none'; return; }
    $section.style.display = '';
    document.getElementById('polisher-related-list').innerHTML = prompts.map(p =>
      `<a href="${p.path}" class="polisher-related-item">
        <span>${escapeHtml(p.title)}</span><span class="polisher-related-arrow">→</span>
      </a>`
    ).join('');
  }

  function renderHistory() {
    const history = loadHistory();
    const $section = document.getElementById('polisher-history-section');
    const $list = document.getElementById('polisher-history');

    if (history.length === 0) {
      $section.style.display = 'none';
      return;
    }

    $section.style.display = '';
    $list.innerHTML = history.map((h, i) => {
      const cls = totalScoreClass(h.score);
      const preview = h.text.length > 70 ? h.text.slice(0, 70) + '…' : h.text;
      return `<div class="polisher-history-item" data-history="${i}" tabindex="0" role="button" aria-label="Load prompt: ${escapeHtml(preview)}">
        <span class="polisher-history-text">${escapeHtml(preview)}</span>
        <span class="polisher-history-score ${cls}">${h.score}/100</span>
      </div>`;
    }).join('');
  }

  function escapeHtml(text) {
    const el = document.createElement('span');
    el.textContent = text;
    return el.innerHTML;
  }

  function polish() {
    const $input = document.getElementById('polisher-input');
    const text = $input.value.trim();
    if (!text) return;

    const analysis = analyse(text);
    if (!analysis) return;

    const polished = rewrite(text, analysis);
    const polishedAnalysis = analyse(polished);
    const tips = generateTips(analysis);

    // Show results, hide "how it works"
    const $results = document.getElementById('polisher-results');
    $results.hidden = false;
    const $howItWorks = document.getElementById('polisher-how-it-works');
    if ($howItWorks) $howItWorks.style.display = 'none';

    renderScore(analysis, polishedAnalysis);
    renderTips(tips);
    renderOutput(text, polished);
    renderRelatedPrompts(analysis.domain);
    saveHistory(text, analysis.total);
    renderHistory();

    // Show clear button
    document.getElementById('polisher-clear').style.display = '';

    // Scroll to results
    $results.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Clarity tracking
    if (window.clarity) window.clarity('event', 'polisher_analyse');
  }


  /* ════════════════════════════════════════════
     INIT
     ════════════════════════════════════════════ */

  function init() {
    const $input = document.getElementById('polisher-input');
    const $btn = document.getElementById('polisher-btn');
    const $clear = document.getElementById('polisher-clear');
    const $charCount = document.getElementById('polisher-char-count');
    const $copy = document.getElementById('polisher-copy');
    const $examplesBtn = document.getElementById('polisher-examples-btn');
    const $examplesMenu = document.getElementById('polisher-examples-menu');

    // Enable/disable button based on input
    $input.addEventListener('input', function () {
      const len = this.value.length;
      $btn.disabled = len === 0;
      $charCount.textContent = len + ' character' + (len !== 1 ? 's' : '');
    });

    // Polish button
    $btn.addEventListener('click', polish);

    // Enter key (Ctrl+Enter to polish)
    $input.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        polish();
      }
    });

    // Clear button
    $clear.addEventListener('click', function () {
      $input.value = '';
      $btn.disabled = true;
      $charCount.textContent = '0 characters';
      document.getElementById('polisher-results').hidden = true;
      const $howItWorks = document.getElementById('polisher-how-it-works');
      if ($howItWorks) $howItWorks.style.display = '';
      this.style.display = 'none';
      $input.focus();
    });

    // Edit & re-polish button
    const $editBtn = document.getElementById('polisher-edit-btn');
    if ($editBtn) {
      $editBtn.addEventListener('click', function () {
        $input.focus();
        $input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }

    // Before/After toggle
    const $viewToggle = document.getElementById('polisher-view-toggle');
    if ($viewToggle) {
      $viewToggle.addEventListener('click', function (e) {
        const btn = e.target.closest('[data-view]');
        if (btn) showView(btn.dataset.view);
      });
    }

    // Copy button
    $copy.addEventListener('click', function () {
      if (!currentPolished) return;
      navigator.clipboard.writeText(currentPolished).then(() => {
        this.textContent = '✅ Copied!';
        setTimeout(() => { this.textContent = '📋 Copy'; }, 2000);
        if (window.clarity) window.clarity('event', 'polisher_copy');
      });
    });

    // Examples dropdown
    $examplesBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      $examplesMenu.hidden = !$examplesMenu.hidden;
    });

    $examplesMenu.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-example]');
      if (!btn) return;
      const idx = parseInt(btn.dataset.example, 10);
      if (EXAMPLES[idx]) {
        $input.value = EXAMPLES[idx].text;
        $input.dispatchEvent(new Event('input'));
        $examplesMenu.hidden = true;
        polish();
        if (window.clarity) window.clarity('event', 'polisher_example');
      }
    });

    // Close examples on outside click
    document.addEventListener('click', function () {
      $examplesMenu.hidden = true;
    });

    // History clicks + keyboard
    const $historyEl = document.getElementById('polisher-history');
    function loadHistoryItem(e) {
      const item = e.target.closest('[data-history]');
      if (!item) return;
      const history = loadHistory();
      const idx = parseInt(item.dataset.history, 10);
      if (history[idx]) {
        $input.value = history[idx].text;
        $input.dispatchEvent(new Event('input'));
        polish();
      }
    }
    $historyEl.addEventListener('click', loadHistoryItem);
    $historyEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        loadHistoryItem(e);
      }
    });

    // Load history on init
    renderHistory();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
