/**
 * 🎓 Prompt Engineering Guide — Interactive JS
 * Handles: tabs, filters, progress, sandbox, builder, localStorage
 * 100% client-side, zero API calls
 */
(function () {
  'use strict';

  const LS_KEY = 'pguide_completed';
  const LS_BUILDER = 'pguide_builder_state';

  /* ════════════════════════════════════════
     UTILITY
     ════════════════════════════════════════ */
  function getCompleted() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch (e) { return []; }
  }
  function setCompleted(arr) {
    localStorage.setItem(LS_KEY, JSON.stringify(arr));
  }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  /* ════════════════════════════════════════
     TABS
     ════════════════════════════════════════ */
  function initTabs() {
    const tabs = $$('.pguide-tab');
    const panels = $$('.pguide-panel');
    if (!tabs.length) return;

    // Restore from URL
    const params = new URLSearchParams(location.search);
    const activeTab = params.get('tab') || 'builder';

    function switchTab(name) {
      tabs.forEach(t => {
        const isActive = t.dataset.tab === name;
        t.classList.toggle('active', isActive);
        t.setAttribute('aria-selected', isActive);
      });
      panels.forEach(p => p.classList.toggle('active', p.id === 'panel-' + name));
      const url = new URL(location);
      url.searchParams.set('tab', name);
      history.replaceState(null, '', url);
    }

    switchTab(activeTab);
    tabs.forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));
  }

  /* ════════════════════════════════════════
     FILTERS (hub page)
     ════════════════════════════════════════ */
  function initFilters() {
    const filters = $$('.pguide-filter');
    const cards = $$('.pguide-card');
    if (!filters.length) return;

    filters.forEach(f => f.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      f.classList.add('active');
      const diff = f.dataset.difficulty;
      cards.forEach(c => {
        c.classList.toggle('pguide-card-hidden', diff !== 'all' && c.dataset.difficulty !== diff);
      });
    }));
  }

  /* ════════════════════════════════════════
     PROGRESS TRACKING (hub page)
     ════════════════════════════════════════ */
  function initProgress() {
    const fill = $('#pguide-progress-fill');
    const text = $('#pguide-progress-text');
    const cards = $$('.pguide-card');
    if (!fill || !cards.length) return;

    const completed = getCompleted();
    let count = 0;

    cards.forEach(c => {
      if (completed.includes(c.dataset.technique)) {
        c.classList.add('completed');
        count++;
      }
    });

    const total = cards.length;
    const pct = Math.round((count / total) * 100);
    fill.style.width = pct + '%';
    text.textContent = count + ' of ' + total + ' techniques explored';
  }

  /* ════════════════════════════════════════
     MARK COMPLETE (single page)
     ════════════════════════════════════════ */
  function initMarkComplete() {
    const btn = $('#pguide-mark-btn');
    if (!btn) return;

    const id = btn.dataset.technique;
    const completed = getCompleted();
    const isCompleted = completed.includes(id);

    function updateBtn(done) {
      btn.classList.toggle('completed', done);
      const icon = $('.pguide-mark-icon', btn);
      if (icon) icon.textContent = done ? '☑' : '☐';
      btn.childNodes[btn.childNodes.length - 1].textContent = done ? ' Explored ✓' : ' Mark as explored';
    }

    updateBtn(isCompleted);

    btn.addEventListener('click', () => {
      const list = getCompleted();
      const idx = list.indexOf(id);
      if (idx === -1) {
        list.push(id);
      } else {
        list.splice(idx, 1);
      }
      setCompleted(list);
      updateBtn(idx === -1);
    });
  }

  /* ════════════════════════════════════════
     SANDBOX (single page)
     ════════════════════════════════════════ */
  function initSandbox() {
    const input = $('#pguide-sandbox-input');
    const criteria = $$('.pguide-criterion');
    const feedback = $('#pguide-sandbox-feedback');
    if (!input || !criteria.length) return;

    const data = window.__pguideData;
    if (!data || !data.sandboxCriteria) return;

    input.addEventListener('input', () => {
      const text = input.value.trim();
      let metCount = 0;

      criteria.forEach((el, i) => {
        const spec = data.sandboxCriteria[i];
        if (!spec) return;

        let met = false;
        if (spec.check) {
          // Special checks
          const parts = spec.check.split(':');
          if (parts[0] === 'minWords') {
            met = text.split(/\s+/).filter(Boolean).length >= parseInt(parts[1]);
          }
        } else if (spec.pattern) {
          try {
            met = new RegExp(spec.pattern, 'i').test(text);
          } catch (e) { met = false; }
        }

        el.classList.toggle('met', met);
        if (met) metCount++;
      });

      // Feedback
      if (!text) {
        feedback.className = 'pguide-sandbox-feedback';
        feedback.textContent = '';
      } else if (metCount === criteria.length) {
        feedback.className = 'pguide-sandbox-feedback show success';
        feedback.textContent = '🎉 Great job! Your prompt hits all the criteria. Try applying this technique to your own work!';
      } else if (metCount > 0) {
        feedback.className = 'pguide-sandbox-feedback show partial';
        feedback.textContent = '👍 Good start! You\'ve got ' + metCount + ' of ' + criteria.length + ' — keep going!';
      } else {
        feedback.className = 'pguide-sandbox-feedback';
        feedback.textContent = '';
      }
    });
  }

  /* ════════════════════════════════════════
     TABLE OF CONTENTS (single page)
     ════════════════════════════════════════ */
  function initTOC() {
    const tocList = $('#pguide-toc-list');
    const content = $('.pguide-technique-content');
    if (!tocList || !content) return;

    const headings = $$('h2', content);
    headings.forEach(h => {
      if (!h.id) h.id = h.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent.replace(/^[^\w]*/, '');
      li.appendChild(a);
      tocList.appendChild(li);
    });
  }

  /* ════════════════════════════════════════
     PROMPT BUILDER
     ════════════════════════════════════════ */
  function initBuilder() {
    const preview = $('#pguide-preview');
    const copyBtn = $('#pguide-copy-btn');
    const techCount = $('#pguide-tech-count');
    const wordCount = $('#pguide-word-count');
    const templateSelect = $('#pguide-template-select');
    if (!preview) return;

    const fields = {
      goal: $('#pguide-goal'),
      role: $('#pguide-role'),
      context: $('#pguide-context'),
      audience: $('#pguide-audience'),
      tone: $('#pguide-tone'),
    };

    const TEMPLATES = {
      email: {
        goal: 'Draft a professional follow-up email to a client who hasn\'t responded to our proposal in 2 weeks',
        role: 'You are a senior account manager with excellent client relationship skills',
        context: 'The client is a mid-sized company. We proposed a cloud migration project. They seemed interested but haven\'t replied.',
        format: 'email format',
        audience: 'the client',
        tone: 'professional'
      },
      summary: {
        goal: 'Write a concise summary of today\'s project meeting including decisions made and action items',
        role: 'You are an experienced project coordinator',
        context: 'Weekly 30-minute standup for the M365 rollout project. 6 team members attended.',
        format: 'bullet points',
        audience: 'my team',
        tone: 'professional'
      },
      analysis: {
        goal: 'Analyse the Q1 sales data and identify the top 3 trends',
        role: 'You are a data analyst with expertise in sales performance',
        context: 'We have 3 months of sales data across 4 regions. Revenue is up 12% overall but some regions underperformed.',
        format: 'table',
        audience: 'executive leadership',
        tone: 'confident'
      },
      troubleshoot: {
        goal: 'Diagnose why users are unable to access SharePoint sites and provide a step-by-step fix',
        role: 'You are a senior M365 administrator with 10 years of experience',
        context: 'Multiple users reported access issues since this morning. No recent changes were made. MFA is enabled.',
        format: 'numbered list',
        audience: 'my team',
        tone: 'professional'
      },
      presentation: {
        goal: 'Create slide content for a 10-minute presentation on our cloud migration progress',
        role: 'You are a presentation coach who helps executives communicate complex projects simply',
        context: 'We\'re 60% through migrating 500 users to Microsoft 365. On track for the June deadline. Budget is 5% under.',
        format: 'bullet points',
        audience: 'executive leadership',
        tone: 'confident'
      },
      document: {
        goal: 'Write a 1-page project brief for the new employee onboarding automation initiative',
        role: 'You are a technical project manager who writes clear documentation',
        context: 'We want to automate the IT onboarding process — account creation, licence assignment, device setup. Currently takes 4 hours per new hire.',
        format: '',
        audience: 'my manager',
        tone: 'professional'
      },
      brainstorm: {
        goal: 'Generate 10 creative ideas for improving our team\'s monthly all-hands meeting',
        role: 'You are an organisational culture consultant who specialises in employee engagement',
        context: 'Our monthly all-hands has 50 attendees, runs 1 hour, and attendance/engagement is declining. Currently just leadership updates.',
        format: 'numbered list',
        audience: 'my team',
        tone: 'friendly'
      }
    };

    function applyTemplate(name) {
      const t = TEMPLATES[name];
      if (!t) return;
      if (fields.goal) fields.goal.value = t.goal || '';
      if (fields.role) fields.role.value = t.role || '';
      if (fields.context) fields.context.value = t.context || '';
      if (fields.audience) fields.audience.value = t.audience || '';
      if (fields.tone) fields.tone.value = t.tone || '';
      // Format radio
      $$('input[name="pguide-format"]').forEach(r => { r.checked = r.value === (t.format || ''); });
      updatePreview();
    }

    if (templateSelect) {
      templateSelect.addEventListener('change', () => {
        if (templateSelect.value) applyTemplate(templateSelect.value);
      });
    }

    function getFormat() {
      const checked = $('input[name="pguide-format"]:checked');
      return checked ? checked.value : '';
    }

    function getConstraints() {
      const parts = [];
      $$('.pguide-toggle input[type="checkbox"]:checked').forEach(cb => {
        const c = cb.dataset.constraint;
        if (c === 'word-limit') {
          const val = $('.pguide-constraint-val[data-for="word-limit"]');
          const num = val ? val.value : '150';
          parts.push('Maximum ' + (num || '150') + ' words');
        } else if (c === 'no-jargon') {
          parts.push('Use plain English — no jargon');
        } else if (c === 'no-opinions') {
          parts.push('Stick to facts only — no opinions');
        }
      });
      return parts;
    }

    function updatePreview() {
      const parts = [];
      let techs = 0;

      const role = (fields.role && fields.role.value.trim()) || '';
      const context = (fields.context && fields.context.value.trim()) || '';
      const goal = (fields.goal && fields.goal.value.trim()) || '';
      const format = getFormat();
      const constraints = getConstraints();
      const audience = (fields.audience && fields.audience.value) || '';
      const tone = (fields.tone && fields.tone.value) || '';

      if (role) { parts.push(role + (role.endsWith('.') ? '' : '.')); techs++; }
      if (context) { parts.push('\n' + context + (context.endsWith('.') ? '' : '.')); techs++; }
      if (goal) { parts.push('\n' + goal + (goal.endsWith('.') ? '' : '.')); techs++; }
      if (format) { parts.push('\nFormat the response as ' + format + '.'); techs++; }
      if (audience || tone) {
        let atPart = '';
        if (audience && tone) atPart = 'Write this for ' + audience + ' in a ' + tone + ' tone.';
        else if (audience) atPart = 'Write this for ' + audience + '.';
        else atPart = 'Use a ' + tone + ' tone.';
        parts.push('\n' + atPart);
        techs++;
      }
      if (constraints.length) { parts.push('\n' + constraints.join('. ') + '.'); techs++; }

      const text = parts.join('').trim();

      if (text) {
        preview.textContent = text;
        preview.classList.remove('pguide-preview-placeholder');
      } else {
        preview.innerHTML = '<p class="pguide-preview-placeholder">Start filling in the steps to see your prompt build in real time...</p>';
      }

      if (techCount) techCount.textContent = techs;
      if (wordCount) wordCount.textContent = text.split(/\s+/).filter(Boolean).length;

      // Save state
      try {
        localStorage.setItem(LS_BUILDER, JSON.stringify({ goal: goal, role: role, context: context }));
      } catch (e) {}
    }

    // Listen to all inputs
    Object.values(fields).forEach(f => {
      if (f) f.addEventListener('input', updatePreview);
    });
    $$('input[name="pguide-format"]').forEach(r => r.addEventListener('change', updatePreview));
    $$('.pguide-toggle input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => {
        const val = $('.pguide-constraint-val[data-for="' + cb.dataset.constraint + '"]');
        if (val) val.style.display = cb.checked ? 'inline-block' : 'none';
        updatePreview();
      });
    });
    $$('.pguide-constraint-val').forEach(v => v.addEventListener('input', updatePreview));
    if (fields.audience) fields.audience.addEventListener('change', updatePreview);
    if (fields.tone) fields.tone.addEventListener('change', updatePreview);

    // Copy button
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const text = preview.textContent;
        if (!text || text.includes('Start filling')) return;
        navigator.clipboard.writeText(text).then(() => {
          const orig = copyBtn.textContent;
          copyBtn.textContent = '✅ Copied!';
          setTimeout(() => { copyBtn.textContent = orig; }, 2000);
        });
      });
    }

    // Polish It → send prompt to Prompt Polisher
    const polishBtn = $('#pguide-polish-btn');
    if (polishBtn) {
      polishBtn.addEventListener('click', () => {
        const text = preview.textContent;
        if (!text || text.includes('Start filling')) {
          window.location.href = '/prompt-polisher/';
          return;
        }
        window.location.href = '/prompt-polisher/?text=' + encodeURIComponent(text);
      });
    }

    // Find Similar → search Prompt Library by keywords
    const similarBtn = $('#pguide-similar-btn');
    if (similarBtn) {
      similarBtn.addEventListener('click', () => {
        const goal = (fields.goal && fields.goal.value || '').trim();
        const keywords = goal.split(/\s+/).filter(w => w.length > 3).slice(0, 4).join(' ');
        window.location.href = '/prompts/' + (keywords ? '?q=' + encodeURIComponent(keywords) : '');
      });
    }
  }

  /* ════════════════════════════════════════
     URL STATE
     ════════════════════════════════════════ */
  function initURLState() {
    const params = new URLSearchParams(location.search);
    const diff = params.get('difficulty');
    if (diff) {
      const filter = $(`.pguide-filter[data-difficulty="${diff}"]`);
      if (filter) filter.click();
    }
  }

  /* ════════════════════════════════════════
     SANDBOX RESET (fix #15)
     ════════════════════════════════════════ */
  function initSandboxReset() {
    const btn = $('#pguide-sandbox-reset');
    const input = $('#pguide-sandbox-input');
    if (!btn || !input) return;
    btn.addEventListener('click', () => {
      input.value = '';
      input.dispatchEvent(new Event('input'));
    });
  }

  /* ════════════════════════════════════════
     COPY SMALL BUTTONS (fix #10)
     ════════════════════════════════════════ */
  function initCopyButtons() {
    document.addEventListener('click', e => {
      const btn = e.target.closest('.pguide-copy-small');
      if (!btn) return;
      const text = btn.dataset.copy || (btn.previousElementSibling && btn.previousElementSibling.textContent);
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
        const orig = btn.textContent;
        btn.textContent = '✅ Copied!';
        setTimeout(() => { btn.textContent = orig; }, 1500);
      });
    });
  }

  /* ════════════════════════════════════════
     FIX THIS PROMPT — V2
     ════════════════════════════════════════ */
  function initFixExercise() {
    const input = $('#pguide-fix-input');
    const criteria = $$('.pguide-fix-issue');
    const feedback = $('#pguide-fix-feedback');
    if (!input || !criteria.length) return;

    input.addEventListener('input', () => {
      const text = input.value.trim();
      let met = 0;
      criteria.forEach(el => {
        const pat = el.dataset.pattern;
        let ok = false;
        try { ok = new RegExp(pat, 'i').test(text); } catch (e) {}
        el.classList.toggle('met', ok);
        if (ok) met++;
      });
      if (!text) { feedback.className = 'pguide-sandbox-feedback'; feedback.textContent = ''; }
      else if (met === criteria.length) {
        feedback.className = 'pguide-sandbox-feedback show success';
        feedback.textContent = '🎉 Excellent fix! You identified and resolved all the issues!';
      } else if (met > 0) {
        feedback.className = 'pguide-sandbox-feedback show partial';
        feedback.textContent = '👍 Getting there! Fixed ' + met + ' of ' + criteria.length + ' issues.';
      } else { feedback.className = 'pguide-sandbox-feedback'; feedback.textContent = ''; }
    });
  }

  /* ════════════════════════════════════════
     CERTIFICATE — V2
     ════════════════════════════════════════ */
  function initCertificate() {
    const certEl = $('#pguide-certificate');
    const btn = $('#pguide-cert-btn');
    const nameInput = $('#pguide-cert-name');
    const card = $('#pguide-cert-card');
    const display = $('#pguide-cert-display');
    const dateEl = $('#pguide-cert-date');
    const copyBtn = $('#pguide-cert-copy');
    if (!certEl || !btn) return;

    // Show certificate section when all 8 complete
    const completed = getCompleted();
    const cards = $$('.pguide-card');
    if (completed.length >= (cards.length || 8)) {
      certEl.style.display = '';
    }

    btn.addEventListener('click', () => {
      const name = nameInput.value.trim();
      if (!name) { nameInput.focus(); return; }
      display.textContent = name;
      dateEl.textContent = new Date().toLocaleDateString('en-NZ', { year: 'numeric', month: 'long', day: 'numeric' });
      card.style.display = '';
    });

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const name = display.textContent;
        const date = dateEl.textContent;
        const text = `🎓 Prompt Engineering Certificate\n\nAwarded to: ${name}\nDate: ${date}\n\nCompleted all 8 prompt engineering techniques:\n✅ Clear Instructions · Role · Context · Format · Examples · Step-by-Step · Constraints · Audience & Tone\n\nIssued by: A Guide to Cloud & AI\nhttps://www.aguidetocloud.com/prompt-guide/`;
        navigator.clipboard.writeText(text).then(() => {
          copyBtn.textContent = '✅ Copied!';
          setTimeout(() => { copyBtn.textContent = '📋 Copy as Text'; }, 2000);
        });
      });
    }
  }

  /* ════════════════════════════════════════
     QUIZ — "Which Technique?" — V2
     ════════════════════════════════════════ */
  function initQuiz() {
    const body = $('#pguide-quiz-body');
    const results = $('#pguide-quiz-results');
    if (!body) return;

    const QUESTIONS = [
      { q: 'What are you trying to do?', opts: [
        { text: 'Write or draft something', techs: { 'give-clear-instructions': 3, 'set-a-role': 1, 'specify-audience-and-tone': 2 } },
        { text: 'Analyse or evaluate something', techs: { 'think-step-by-step': 3, 'add-context': 2, 'set-constraints': 1 } },
        { text: 'Categorise or sort items', techs: { 'give-examples': 3, 'define-the-format': 2, 'give-clear-instructions': 1 } },
        { text: 'Make a decision', techs: { 'think-step-by-step': 3, 'add-context': 2, 'set-a-role': 1 } }
      ]},
      { q: 'Who will read the AI\'s output?', opts: [
        { text: 'Executives or leadership', techs: { 'specify-audience-and-tone': 3, 'set-constraints': 2, 'define-the-format': 1 } },
        { text: 'My team or colleagues', techs: { 'specify-audience-and-tone': 2, 'give-clear-instructions': 1 } },
        { text: 'Customers or clients', techs: { 'specify-audience-and-tone': 3, 'set-a-role': 2, 'set-constraints': 1 } },
        { text: 'Just me', techs: { 'give-clear-instructions': 2, 'define-the-format': 1 } }
      ]},
      { q: 'What\'s your biggest problem right now?', opts: [
        { text: 'AI responses are too vague', techs: { 'give-clear-instructions': 3, 'add-context': 2 } },
        { text: 'Wrong tone or style', techs: { 'specify-audience-and-tone': 3, 'set-a-role': 2 } },
        { text: 'Output format is wrong', techs: { 'define-the-format': 3, 'give-examples': 2 } },
        { text: 'Reasoning or accuracy issues', techs: { 'think-step-by-step': 3, 'set-constraints': 1 } }
      ]},
      { q: 'How complex is the task?', opts: [
        { text: 'Simple — one clear ask', techs: { 'give-clear-instructions': 2, 'define-the-format': 1 } },
        { text: 'Medium — needs some context', techs: { 'add-context': 2, 'set-a-role': 1, 'set-constraints': 1 } },
        { text: 'Complex — multiple factors', techs: { 'think-step-by-step': 3, 'add-context': 2, 'set-constraints': 1 } }
      ]},
      { q: 'Do you have examples of what "good" looks like?', opts: [
        { text: 'Yes, I can show the AI what I want', techs: { 'give-examples': 3 } },
        { text: 'Not really, I\'ll describe it', techs: { 'give-clear-instructions': 2, 'define-the-format': 2 } },
        { text: 'I know the pattern but it\'s hard to describe', techs: { 'give-examples': 3, 'define-the-format': 1 } }
      ]}
    ];

    const TECH_INFO = {
      'give-clear-instructions': { emoji: '🎯', name: 'Give Clear Instructions', url: '/prompt-guide/give-clear-instructions/' },
      'set-a-role': { emoji: '🎭', name: 'Set a Role', url: '/prompt-guide/set-a-role/' },
      'add-context': { emoji: '📋', name: 'Add Context', url: '/prompt-guide/add-context/' },
      'define-the-format': { emoji: '📐', name: 'Define the Format', url: '/prompt-guide/define-the-format/' },
      'give-examples': { emoji: '💡', name: 'Give Examples', url: '/prompt-guide/give-examples/' },
      'think-step-by-step': { emoji: '🧠', name: 'Think Step by Step', url: '/prompt-guide/think-step-by-step/' },
      'set-constraints': { emoji: '🚧', name: 'Set Constraints', url: '/prompt-guide/set-constraints/' },
      'specify-audience-and-tone': { emoji: '🗣️', name: 'Specify Audience & Tone', url: '/prompt-guide/specify-audience-and-tone/' }
    };

    let answers = [];

    function renderQuiz() {
      body.innerHTML = QUESTIONS.map((q, i) =>
        `<div class="pguide-quiz-q" data-qi="${i}">
          <h3><span class="pguide-quiz-num">Q${i + 1}.</span> ${q.q}</h3>
          <div class="pguide-quiz-options">
            ${q.opts.map((o, j) => `<button class="pguide-quiz-opt" data-qi="${i}" data-oi="${j}">${o.text}</button>`).join('')}
          </div>
        </div>`
      ).join('') + `<button class="pguide-btn pguide-btn-primary" id="pguide-quiz-submit" style="margin-top:1rem" disabled>🧭 Get My Recommendations</button>`;

      body.addEventListener('click', e => {
        const opt = e.target.closest('.pguide-quiz-opt');
        if (!opt) return;
        const qi = +opt.dataset.qi;
        $$(`[data-qi="${qi}"] .pguide-quiz-opt`).forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        answers[qi] = +opt.dataset.oi;
        // Fix F: visual checkmark + auto-advance
        const qCard = opt.closest('.pguide-quiz-q');
        if (qCard) qCard.classList.add('pguide-quiz-answered');
        const allAnswered = QUESTIONS.every((_, i) => answers[i] !== undefined);
        const sub = $('#pguide-quiz-submit');
        if (sub) sub.disabled = !allAnswered;
        // Auto-scroll to next unanswered or submit
        if (allAnswered) {
          if (sub) sub.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          const nextQ = $(`.pguide-quiz-q:not(.pguide-quiz-answered)`);
          if (nextQ) setTimeout(() => nextQ.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
        }
      });

      const submitCheck = setInterval(() => {
        const sub = $('#pguide-quiz-submit');
        if (!sub) { clearInterval(submitCheck); return; }
        sub.addEventListener('click', showResults);
        clearInterval(submitCheck);
      }, 100);
    }

    function showResults() {
      const scores = {};
      answers.forEach((oi, qi) => {
        const opt = QUESTIONS[qi].opts[oi];
        const techs = (opt && opt.techs) || {};
        Object.entries(techs).forEach(([k, v]) => { scores[k] = (scores[k] || 0) + v; });
      });
      const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 3);
      results.style.display = '';
      results.innerHTML = '<h3>🎯 Your Top Recommended Techniques</h3>' +
        sorted.map(([id, score], i) => {
          const t = TECH_INFO[id];
          return `<div class="pguide-quiz-result-card">
            <div class="pguide-quiz-result-rank">#${i + 1}</div>
            <div class="pguide-quiz-result-info">
              <strong>${t.emoji} ${t.name}</strong>
              <p>Relevance score: ${score} points</p>
              <a href="${t.url}">Learn this technique →</a>
            </div>
          </div>`;
        }).join('') +
        `<button class="pguide-btn pguide-btn-secondary" style="margin-top:1rem" onclick="location.reload()">🔄 Retake Quiz</button>`;
      results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    renderQuiz();
  }

  /* ════════════════════════════════════════
     CHALLENGES — V2
     ════════════════════════════════════════ */
  function initChallenges() {
    const list = $('#pguide-challenge-list');
    if (!list) return;

    const CHALLENGES = [
      {
        title: '📧 The Follow-Up Email',
        scenario: 'Your client hasn\'t responded to your proposal in 2 weeks. Write a prompt that gets AI to draft the perfect follow-up email — polite but with urgency.',
        techniques: ['give-clear-instructions', 'set-a-role', 'specify-audience-and-tone', 'set-constraints']
      },
      {
        title: '🔧 The Outage Report',
        scenario: 'Your company had a 2-hour Teams outage this morning. You need to communicate to both customers AND your IT team. Write a prompt that produces both versions.',
        techniques: ['specify-audience-and-tone', 'add-context', 'define-the-format', 'set-constraints']
      },
      {
        title: '📊 The Migration Decision',
        scenario: 'Your boss asks: "Should we move from on-prem Exchange to M365?" Write a prompt that gets AI to give a thorough, well-reasoned analysis.',
        techniques: ['think-step-by-step', 'add-context', 'set-a-role', 'define-the-format']
      },
      {
        title: '📋 The Ticket Sorter',
        scenario: 'You have 50 support tickets to categorize. Write a prompt that teaches AI your exact categorization system with examples.',
        techniques: ['give-examples', 'give-clear-instructions', 'define-the-format']
      }
    ];

    const TECH_PATTERNS = {
      'give-clear-instructions': { label: '🎯 Clear', re: /\b(write|create|draft|compose|generate|summarize|analyse|explain|list)\b/i },
      'set-a-role': { label: '🎭 Role', re: /(?:you are|act as|as a|your role)/i },
      'add-context': { label: '📋 Context', re: /(?:\d+|week|month|team|project|company|users?|employees?|budget|\$)/i },
      'define-the-format': { label: '📐 Format', re: /\b(table|bullet|numbered|email|paragraph|list|heading|column)\b/i },
      'give-examples': { label: '💡 Examples', re: /(?:example|e\.g\.|for instance|like this|→|->)/i },
      'think-step-by-step': { label: '🧠 Steps', re: /\b(step.by.step|walk me through|think through|break down|reason|first.*then|1\.|2\.)/i },
      'set-constraints': { label: '🚧 Constraints', re: /\b(maximum|max|no more|under \d|don.?t|avoid|plain English|without)\b/i },
      'specify-audience-and-tone': { label: '🗣️ Tone', re: /\b(for (?:my|the|our)|tone|professional|friendly|formal|audience|readers?)\b/i }
    };

    list.innerHTML = CHALLENGES.map((c, i) =>
      `<div class="pguide-challenge-card" data-ci="${i}">
        <div class="pguide-challenge-header">
          <h3>${c.title}</h3>
          <span class="pguide-challenge-diff">Uses ${c.techniques.length} techniques</span>
        </div>
        <div class="pguide-challenge-scenario">${c.scenario}</div>
        <div class="pguide-challenge-input-wrap">
          <span class="pguide-challenge-live-badge">⚡ Live scoring — start typing</span>
          <textarea class="pguide-sandbox-textarea pguide-challenge-input" data-ci="${i}" rows="5" placeholder="Start typing your prompt here — we detect techniques in real time as you write..."></textarea>
        </div>
        <div class="pguide-challenge-score" data-ci="${i}">
          ${c.techniques.map(t => `<span class="pguide-challenge-tag" data-tech="${t}">${TECH_PATTERNS[t].label}</span>`).join('')}
        </div>
        <div class="pguide-challenge-feedback" data-ci="${i}"></div>
      </div>`
    ).join('');

    list.addEventListener('input', e => {
      const ta = e.target.closest('.pguide-challenge-input');
      if (!ta) return;
      const ci = ta.dataset.ci;
      const text = ta.value.trim();
      const challenge = CHALLENGES[ci];
      const tags = $$(`.pguide-challenge-score[data-ci="${ci}"] .pguide-challenge-tag`);
      let detected = 0;

      tags.forEach(tag => {
        const tech = tag.dataset.tech;
        const pat = TECH_PATTERNS[tech];
        const found = pat && pat.re.test(text);
        tag.classList.toggle('detected', found);
        if (found) detected++;
      });

      const fb = $(`.pguide-challenge-feedback[data-ci="${ci}"]`);
      if (!text) { fb.textContent = ''; fb.style.color = ''; }
      else if (detected === challenge.techniques.length) {
        fb.textContent = `🏆 Perfect! You used all ${detected} recommended techniques!`;
        fb.style.color = '#A3E635';
      } else if (detected > 0) {
        fb.textContent = `👍 ${detected}/${challenge.techniques.length} techniques detected — keep going!`;
        fb.style.color = '#FBBF24';
      } else {
        fb.textContent = 'Start writing — we\'ll detect which techniques you use...';
        fb.style.color = 'rgba(255,255,255,0.4)';
      }
    });
  }

  /* ════════════════════════════════════════
     FIX A: REORDER SECTIONS — move sandbox before Platform Tips
     ════════════════════════════════════════ */
  function initSectionReorder() {
    const content = $('.pguide-technique-content');
    const sandbox = $('#pguide-sandbox');
    const fixEx = $('.pguide-fix-exercise');
    if (!content || !sandbox) return;

    // Find the "Platform Tips" H2
    const headings = $$('h2', content);
    let platformH2 = null;
    for (const h of headings) {
      if (/platform\s*tips/i.test(h.textContent)) { platformH2 = h; break; }
    }
    if (!platformH2) return;

    // Move sandbox (and fix exercise) before Platform Tips
    content.insertBefore(sandbox, platformH2);
    if (fixEx) content.insertBefore(fixEx, platformH2);
  }

  /* ════════════════════════════════════════
     FIX B: COLLAPSIBLE PLATFORM TIPS
     ════════════════════════════════════════ */
  function initPlatformAccordions() {
    const content = $('.pguide-technique-content');
    if (!content) return;

    const headings = $$('h2', content);
    let platformH2 = null;
    for (const h of headings) {
      if (/platform\s*tips/i.test(h.textContent)) { platformH2 = h; break; }
    }
    if (!platformH2) return;

    // Collect all H3s under Platform Tips (until next H2)
    let el = platformH2.nextElementSibling;
    const platforms = [];
    let current = null;

    while (el && el.tagName !== 'H2') {
      if (el.tagName === 'H3') {
        if (current) platforms.push(current);
        current = { title: el.textContent, elements: [], h3: el };
      } else if (current) {
        current.elements.push(el);
      }
      el = el.nextElementSibling;
    }
    if (current) platforms.push(current);
    if (!platforms.length) return;

    // Build accordion
    const accordion = document.createElement('div');
    accordion.className = 'pguide-platform-accordion';

    platforms.forEach((p, i) => {
      const details = document.createElement('details');
      details.className = 'pguide-platform-item';
      if (i === 0) details.open = true; // M365 Copilot open by default

      const summary = document.createElement('summary');
      summary.textContent = p.title;
      details.appendChild(summary);

      const body = document.createElement('div');
      body.className = 'pguide-platform-body';
      p.elements.forEach(e => body.appendChild(e));
      details.appendChild(body);

      accordion.appendChild(details);

      // Remove original H3
      p.h3.remove();
    });

    // Insert accordion after Platform Tips H2
    platformH2.after(accordion);
  }

  /* ════════════════════════════════════════
     FIX C: COPY BUTTONS ON AFTER EXAMPLES
     ════════════════════════════════════════ */
  function initAfterCopyButtons() {
    const content = $('.pguide-technique-content');
    if (!content) return;

    // Find "After" H3 headings, then their blockquotes
    const h3s = $$('h3', content);
    h3s.forEach(h3 => {
      if (!/after/i.test(h3.textContent)) return;
      let el = h3.nextElementSibling;
      while (el && el.tagName !== 'H2' && el.tagName !== 'H3') {
        if (el.tagName === 'BLOCKQUOTE') {
          const text = el.textContent.trim();
          if (text && !el.querySelector('.pguide-copy-small')) {
            const btn = document.createElement('button');
            btn.className = 'pguide-copy-small';
            btn.dataset.copy = text;
            btn.textContent = '📋 Copy';
            btn.title = 'Copy this prompt';
            el.appendChild(btn);
          }
        }
        el = el.nextElementSibling;
      }
    });
  }

  /* ════════════════════════════════════════
     FIX D: REMOVE INLINE RELATED TECHNIQUES
     ════════════════════════════════════════ */
  function initRemoveInlineRelated() {
    const content = $('.pguide-technique-content');
    if (!content) return;

    // Related Techniques appear as: paragraph text "After mastering..." followed by a <ul> with /prompt-guide/ links
    // OR as standalone links at the end of content before the sandbox
    const allLinks = $$('a[href^="/prompt-guide/"]', content);
    if (allLinks.length < 2) return;

    // Find the last cluster of /prompt-guide/ links that are in a <ul> (the Related Techniques section)
    const lists = $$('ul', content);
    lists.forEach(function (ul) {
      const links = $$('a[href^="/prompt-guide/"]', ul);
      if (links.length >= 2) {
        // This is the Related Techniques list — hide it and any preceding paragraph
        ul.style.display = 'none';
        const prev = ul.previousElementSibling;
        if (prev && prev.tagName === 'P' && /level up|related|after mastering/i.test(prev.textContent)) {
          prev.style.display = 'none';
        }
      }
    });
  }

  /* ════════════════════════════════════════
     FIX E: LOADING SKELETONS FOR QUIZ/CHALLENGES
     ════════════════════════════════════════ */
  function initLoadingSkeletons() {
    var quizBody = $('#pguide-quiz-body');
    var challengeList = $('#pguide-challenge-list');
    if (quizBody && !quizBody.innerHTML.trim()) {
      quizBody.innerHTML = '<p style="color:rgba(255,255,255,0.4);text-align:center;padding:2rem">Loading quiz questions...</p>';
    }
    if (challengeList && !challengeList.innerHTML.trim()) {
      challengeList.innerHTML = '<p style="color:rgba(255,255,255,0.4);text-align:center;padding:2rem">Loading challenges...</p>';
    }
  }

  /* ════════════════════════════════════════
     FIX J: "OPEN IN CHATGPT" LINKS ON AFTER EXAMPLES
     ════════════════════════════════════════ */
  function initOpenInLinks() {
    var content = $('.pguide-technique-content');
    if (!content) return;

    var h3s = $$('h3', content);
    h3s.forEach(function (h3) {
      if (!/after/i.test(h3.textContent)) return;
      var el = h3.nextElementSibling;
      while (el && el.tagName !== 'H2' && el.tagName !== 'H3') {
        if (el.tagName === 'BLOCKQUOTE') {
          var text = el.textContent.trim();
          if (text && !el.querySelector('.pguide-open-links')) {
            var div = document.createElement('div');
            div.className = 'pguide-open-links';
            var encoded = encodeURIComponent(text);
            div.innerHTML = '<a href="https://chatgpt.com/?q=' + encoded + '" target="_blank" rel="noopener noreferrer" class="pguide-open-link">Try in ChatGPT ↗</a>' +
              '<a href="https://copilot.microsoft.com/?q=' + encoded + '" target="_blank" rel="noopener noreferrer" class="pguide-open-link">Try in Copilot ↗</a>';
            el.appendChild(div);
          }
        }
        el = el.nextElementSibling;
      }
    });
  }

  /* ════════════════════════════════════════
     FIX H: BUILDER STATE RESTORE
     ════════════════════════════════════════ */
  function initBuilderRestore() {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_BUILDER));
      if (!saved) return;
      const fields = { goal: $('#pguide-goal'), role: $('#pguide-role'), context: $('#pguide-context') };
      if (saved.goal && fields.goal) fields.goal.value = saved.goal;
      if (saved.role && fields.role) fields.role.value = saved.role;
      if (saved.context && fields.context) fields.context.value = saved.context;
      // Trigger preview update after a tick
      setTimeout(() => {
        const goal = fields.goal;
        if (goal && goal.value) goal.dispatchEvent(new Event('input'));
      }, 100);
    } catch (e) {}
  }

  /* ════════════════════════════════════════
     FIX N: AUTO-MARK EXPLORED on sandbox completion
     ════════════════════════════════════════ */
  function initAutoMark() {
    const feedback = $('#pguide-sandbox-feedback');
    const btn = $('#pguide-mark-btn');
    if (!feedback || !btn) return;

    const observer = new MutationObserver(() => {
      if (feedback.classList.contains('success') && !btn.classList.contains('completed')) {
        // Auto-mark as explored when all sandbox criteria met
        const id = btn.dataset.technique;
        const list = getCompleted();
        if (!list.includes(id)) {
          list.push(id);
          setCompleted(list);
          btn.classList.add('completed');
          const icon = $('.pguide-mark-icon', btn);
          if (icon) icon.textContent = '☑';
          btn.childNodes[btn.childNodes.length - 1].textContent = ' Explored ✓';
          // Brief celebration flash
          btn.style.transition = 'transform 0.3s';
          btn.style.transform = 'scale(1.1)';
          setTimeout(() => { btn.style.transform = ''; }, 300);
        }
      }
    });
    observer.observe(feedback, { attributes: true, attributeFilter: ['class'] });
  }

  /* ════════════════════════════════════════
     FIX L: SECTION DIVIDERS
     ════════════════════════════════════════ */
  function initSectionDividers() {
    const content = $('.pguide-technique-content');
    if (!content) return;
    $$('h2', content).forEach(h2 => {
      if (!h2.classList.contains('pguide-section-divided')) {
        h2.classList.add('pguide-section-divided');
      }
    });
  }

  /* ════════════════════════════════════════
     V3: CHALLENGE DIFFICULTY BADGES (fix G)
     ════════════════════════════════════════ */
  // Integrated into challenge rendering — see updated initChallenges

  /* ════════════════════════════════════════
     INIT
     ════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', () => {
    // Core
    initTabs();
    initFilters();
    initProgress();
    initMarkComplete();
    initSandbox();
    initSandboxReset();
    initTOC();
    initBuilder();
    initBuilderRestore();
    initURLState();
    initCopyButtons();
    initFixExercise();
    initCertificate();
    initLoadingSkeletons();
    initQuiz();
    initChallenges();

    // V3 fixes — technique page enhancements
    initSectionReorder();        // Fix A: sandbox before platform tips
    initPlatformAccordions();    // Fix B: collapsible platform tips
    initAfterCopyButtons();      // Fix C: copy on After examples
    initRemoveInlineRelated();   // Fix D: hide inline Related Techniques
    initOpenInLinks();           // Fix J: "Open in ChatGPT" links
    initSectionDividers();       // Fix L: visual section dividers
    initAutoMark();              // Fix N: auto-mark on sandbox complete
  });
})();
