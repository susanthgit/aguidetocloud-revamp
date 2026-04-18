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
          <span class="polisher-pillar-name"><span class="polisher-craft-icon">${meta.icon}</span> ${meta.label}</span>
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

    var platformEl = document.getElementById('polisher-platform');
    var platform = platformEl ? platformEl.value : 'general';
    const polished = rewrite(text, analysis, platform);
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

    // Check for ?text= param (from Prompt Guide Builder)
    var urlText = new URLSearchParams(location.search).get('text');
    if (urlText && urlText.trim()) {
      $input.value = urlText.trim();
      $charCount.textContent = $input.value.length + ' characters';
      $btn.disabled = false;
      polish();
      // Clean URL
      history.replaceState(null, '', location.pathname);
    } else if (!$input.value.trim()) {
      // Auto-demo: show the email example polished on first visit
      $input.value = EXAMPLES[3].text;
      $charCount.textContent = $input.value.length + ' characters';
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

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
