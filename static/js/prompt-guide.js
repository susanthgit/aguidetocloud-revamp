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
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { return []; }
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
    const activeTab = params.get('tab') || 'learn';

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
          } catch { met = false; }
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
      } catch {}
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
     INIT
     ════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initFilters();
    initProgress();
    initMarkComplete();
    initSandbox();
    initTOC();
    initBuilder();
    initURLState();
  });
})();
