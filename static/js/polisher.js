/**
 * ✨ Prompt Polisher — UI Controller
 * Analysis engine loaded from prompt-crafts-core.js (shared with Prompt Tester)
 * 100% client-side, zero API calls
 */
(function () {
  'use strict';

  // Shared CRAFTS engine (loaded before this script)
  var analyse = window.PromptCrafts.analyse;
  var rewrite = window.PromptCrafts.rewrite;
  var generateTips = window.PromptCrafts.generateTips;


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

  var PILLAR_META = window.PromptCrafts.PILLAR_META;

  function scoreClass(pct) {
    if (pct <= 0.25) return 'low';
    if (pct <= 0.5) return 'med';
    if (pct <= 0.8) return 'good';
    return 'great';
  }

  function totalScoreClass(score) {
    if (score <= 25) return 'polisher-score-low';
    if (score <= 50) return 'polisher-score-med';
    if (score <= 75) return 'polisher-score-good';
    return 'polisher-score-great';
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
          <span class="polisher-pillar-name">${meta.label}</span>
          <div class="polisher-pillar-bar">
            <div class="polisher-pillar-fill polisher-fill-${cls}" style="width: 0%" data-target="${Math.round(pct * 100)}"></div>
          </div>
          <span class="polisher-pillar-score polisher-score-${cls}">${p.score}/${p.max}</span>
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
        $delta.innerHTML = `<span class="polisher-delta-badge">Original: <strong>${analysis.total}</strong> → Polished: <strong class="polisher-score-good">${polishedAnalysis.total}</strong> <span class="polisher-delta-up">+${diff} points</span></span>`;
        $delta.hidden = false;
      } else {
        $delta.hidden = true;
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
      $tips.innerHTML = '<div class="polisher-no-tips">Your prompt covers all CRAFTS elements — nice work!</div>';
      return;
    }

    $tips.innerHTML = tips.map(t =>
      `<div class="polisher-tip">
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
      $output.hidden = true;
      if ($compare) $compare.hidden = false;
    } else {
      $output.hidden = false;
      if ($compare) $compare.hidden = true;
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
    if (!prompts) { $section.hidden = true; return; }
    $section.hidden = false;
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
      $section.hidden = true;
      return;
    }

    $section.hidden = false;
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

    var platformEl = document.getElementById('polisher-platform');
    var platform = platformEl ? platformEl.value : 'general';
    const polished = rewrite(text, analysis, platform);
    const polishedAnalysis = analyse(polished);
    const tips = generateTips(analysis);

    // Show results, hide "how it works"
    const $results = document.getElementById('polisher-results');
    $results.hidden = false;
    const $howItWorks = document.getElementById('polisher-how-it-works');
    if ($howItWorks) $howItWorks.hidden = true;

    renderScore(analysis, polishedAnalysis);
    renderTips(tips);
    renderOutput(text, polished);
    renderRelatedPrompts(analysis.domain);
    saveHistory(text, analysis.total);
    renderHistory();

    // Show clear button
    document.getElementById('polisher-clear').hidden = false;

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
      const words = this.value.trim() ? this.value.trim().split(/\s+/).length : 0;
      const tokens = Math.round(words * 1.3);
      $btn.disabled = len === 0;
      $charCount.textContent = len + ' characters · ~' + tokens + ' tokens';
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
      $charCount.textContent = '0 characters · ~0 tokens';
      document.getElementById('polisher-results').hidden = true;
      const $howItWorks = document.getElementById('polisher-how-it-works');
      if ($howItWorks) $howItWorks.hidden = false;
      this.hidden = true;
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
        this.textContent = 'Copied!';
        setTimeout(() => { this.textContent = 'Copy'; }, 2000);
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

    // Check for ?text= param (from Prompt Guide Builder)
    var urlText = new URLSearchParams(location.search).get('text');
    if (urlText && urlText.trim()) {
      $input.value = urlText.trim();
      $charCount.textContent = $input.value.length + ' characters · ~' + Math.round($input.value.trim().split(/\s+/).length * 1.3) + ' tokens';
      $btn.disabled = false;
      polish();
      // Clean URL
      history.replaceState(null, '', location.pathname);
    } else if (!$input.value.trim()) {
      // Auto-demo: show the email example polished on first visit
      $input.value = EXAMPLES[3].text;
      $charCount.textContent = $input.value.length + ' characters · ~' + Math.round($input.value.trim().split(/\s+/).length * 1.3) + ' tokens';
      $btn.disabled = false;
      polish();
    }
    // Keep page at top after auto-demo renders results
    window.scrollTo(0, 0);
    requestAnimationFrame(function() {
      window.scrollTo(0, 0);
      requestAnimationFrame(function() { window.scrollTo(0, 0); });
    });
    setTimeout(function() { window.scrollTo(0, 0); }, 100);
    setTimeout(function() { window.scrollTo(0, 0); }, 300);
  }

  /* ════════════════════════════════════════════
     GUIDED BUILDER
     ════════════════════════════════════════════ */

  const ROLE_MAP = {
    expert: 'Act as a subject-matter expert',
    teacher: 'Act as a patient teacher who explains concepts clearly',
    analyst: 'Act as a data analyst',
    writer: 'Act as a professional content writer',
    advisor: 'Act as a strategic advisor',
    developer: 'Act as a senior software developer',
    editor: 'Act as an experienced editor and proofreader',
    coach: 'Act as a supportive coach and mentor',
    researcher: 'Act as a thorough researcher',
    translator: 'Act as an expert translator'
  };

  const FORMAT_MAP = {
    bullets: 'Format the output as bullet points.',
    numbered: 'Format the output as a numbered list.',
    table: 'Format the output as a table.',
    email: 'Format the output as a professional email.',
    report: 'Format the output as a structured report with clear section headings.',
    code: 'Format the output as clean, commented code.',
    essay: 'Format the output as well-structured paragraphs.',
    checklist: 'Format the output as a checklist with checkboxes.',
    comparison: 'Format the output as a pros and cons comparison.',
    summary: 'Format the output as a concise summary (TL;DR style).'
  };

  const TONE_MAP = {
    professional: 'Use a professional tone.',
    casual: 'Use a casual, conversational tone.',
    technical: 'Use a technical tone with precise terminology.',
    beginner: 'Use a beginner-friendly tone — avoid jargon, explain acronyms.',
    executive: 'Use an executive tone — concise, data-driven, decision-focused.',
    academic: 'Use an academic tone with proper citations style.',
    persuasive: 'Use a persuasive, compelling tone.',
    empathetic: 'Use a warm, empathetic tone.'
  };

  function initBuilder() {
    const $copy = document.getElementById('builder-copy');
    const $toPolisher = document.getElementById('builder-to-polisher');
    const builderFields = ['builder-action', 'builder-context', 'builder-role', 'builder-role-custom', 'builder-format', 'builder-tone', 'builder-scope'];

    function assemblePrompt() {
      const context = (document.getElementById('builder-context') || {}).value || '';
      const roleKey = (document.getElementById('builder-role') || {}).value || '';
      const roleCustom = (document.getElementById('builder-role-custom') || {}).value || '';
      const action = (document.getElementById('builder-action') || {}).value || '';
      const formatKey = (document.getElementById('builder-format') || {}).value || '';
      const toneKey = (document.getElementById('builder-tone') || {}).value || '';
      const scope = (document.getElementById('builder-scope') || {}).value || '';

      if (!action.trim()) return '';

      var parts = [];
      var role = roleCustom.trim() ? 'Act as ' + roleCustom.trim() + '.' : (ROLE_MAP[roleKey] ? ROLE_MAP[roleKey] + '.' : '');
      if (role) parts.push(role);
      if (context.trim()) parts.push('Context: ' + context.trim());
      parts.push(action.trim());
      if (FORMAT_MAP[formatKey]) parts.push(FORMAT_MAP[formatKey]);
      if (TONE_MAP[toneKey]) parts.push(TONE_MAP[toneKey]);
      if (scope.trim()) parts.push('Constraints: ' + scope.trim());

      return parts.join('\n\n');
    }

    function updatePreview() {
      var prompt = assemblePrompt();
      var $output = document.getElementById('builder-prompt-output');
      var $section = document.getElementById('builder-output-section');
      var $score = document.getElementById('builder-score');
      var $tokens = document.getElementById('builder-tokens');

      if (!prompt) {
        if ($section) $section.hidden = true;
        return;
      }

      if ($output) $output.textContent = prompt;
      if ($section) $section.hidden = false;

      if (window.PromptCrafts && window.PromptCrafts.analyse) {
        var analysis = window.PromptCrafts.analyse(prompt);
        if ($score) {
          $score.textContent = analysis.total;
          $score.className = 'polisher-builder-score-value ' + totalScoreClass(analysis.total);
        }
      }

      var words = prompt.trim().split(/\s+/).length;
      if ($tokens) $tokens.textContent = '~' + Math.round(words * 1.3) + ' tokens';
    }

    // Live preview on any field change
    builderFields.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', updatePreview);
        el.addEventListener('change', updatePreview);
      }
    });

    // Copy
    if ($copy) {
      $copy.addEventListener('click', function () {
        var text = (document.getElementById('builder-prompt-output') || {}).textContent || '';
        if (!text) return;
        navigator.clipboard.writeText(text).then(function () {
          $copy.textContent = 'Copied!';
          setTimeout(function () { $copy.textContent = 'Copy Prompt'; }, 2000);
        }).catch(function () {});
      });
    }

    // Send to polisher
    if ($toPolisher) {
      $toPolisher.addEventListener('click', function () {
        var text = (document.getElementById('builder-prompt-output') || {}).textContent || '';
        if (!text) return;
        var $input = document.getElementById('polisher-input');
        if ($input) {
          $input.value = text;
          $input.dispatchEvent(new Event('input'));
        }
        // Switch to polisher tab
        document.querySelectorAll('.polisher-tab').forEach(function (t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        document.querySelectorAll('.polisher-panel').forEach(function (p) { p.classList.remove('active'); p.hidden = true; });
        var mainTab = document.querySelector('[data-tab="main"]');
        var mainPanel = document.getElementById('panel-main');
        if (mainTab) { mainTab.classList.add('active'); mainTab.setAttribute('aria-selected', 'true'); }
        if (mainPanel) { mainPanel.classList.add('active'); mainPanel.hidden = false; }
        // Polish it
        polish();
      });
    }
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); initBuilder(); });
  } else {
    init();
    initBuilder();
  }

})();
