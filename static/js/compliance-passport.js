/* ============================================================================
   Compliance Passport — compliance-passport.js
   ============================================================================ */
(function () {
  'use strict';

  const DATA = window.__passportData || { frameworks: [], questions: [] };
  let answers = {};

  // Industry presets — pre-fill quiz answers
  const PRESETS = {
    healthcare: { q1: 'us', q2: 'no', q3: 'yes', q4: 'no', q5: 'no', q6: 'no', q7: 'no', q8: 'planning' },
    financial:  { q1: 'global', q2: 'yes', q3: 'no', q4: 'yes', q5: 'yes', q6: 'no', q7: 'yes', q8: 'yes' },
    education:  { q1: 'us', q2: 'no', q3: 'some', q4: 'no', q5: 'no', q6: 'no', q7: 'yes', q8: 'no' },
    government: { q1: 'us', q2: 'no', q3: 'no', q4: 'no', q5: 'no', q6: 'yes', q7: 'no', q8: 'yes' },
    anz_enterprise: { q1: 'anz', q2: 'yes', q3: 'no', q4: 'third-party', q5: 'sometimes', q6: 'no', q7: 'no', q8: 'planning' }
  };

  function esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

  // ── Render quiz ──────────────────────────────────────────────────────────
  function renderQuiz() {
    const el = document.getElementById('passport-quiz');
    el.innerHTML = DATA.questions.map((q, i) => {
      const opts = (q.options || []).map(o => `
        <label class="passport-q-opt" data-qid="${esc(q.id)}" data-value="${esc(o.value)}">
          <input type="radio" name="q-${esc(q.id)}" value="${esc(o.value)}">
          ${esc(o.label)}
        </label>
      `).join('');
      return `
        <div class="passport-q-card">
          <div class="passport-q-num">Question ${i + 1} of ${DATA.questions.length}</div>
          <div class="passport-q-text">${esc(q.text)}</div>
          <div class="passport-q-options">${opts}</div>
        </div>
      `;
    }).join('');

    // Click handlers
    el.querySelectorAll('.passport-q-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        const qid = opt.dataset.qid;
        const val = opt.dataset.value;
        // Deselect siblings
        opt.closest('.passport-q-options').querySelectorAll('.passport-q-opt').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        opt.querySelector('input').checked = true;
        answers[qid] = val;
        // Show generate button when all answered
        if (Object.keys(answers).length === DATA.questions.length) {
          document.getElementById('quiz-actions').style.display = 'block';
        }
      });
    });
  }

  // ── Generate passport ────────────────────────────────────────────────────
  function generatePassport() {
    // Collect all triggers
    const activeTriggers = new Set();
    DATA.questions.forEach(q => {
      const ans = answers[q.id];
      if (!ans) return;
      const opt = (q.options || []).find(o => o.value === ans);
      if (opt && opt.triggers) opt.triggers.forEach(t => activeTriggers.add(t));
    });

    // Score each framework
    const results = DATA.frameworks.map(fw => {
      const fwTriggers = fw.triggers || [];
      const matched = fwTriggers.filter(t => activeTriggers.has(t)).length;
      const ratio = fwTriggers.length > 0 ? matched / fwTriggers.length : 0;
      let level = 'unlikely';
      if (ratio >= 0.5) level = 'likely';
      else if (matched > 0) level = 'possibly';
      return { ...fw, matched, ratio, level };
    });

    // Sort: likely → possibly → unlikely
    const order = { likely: 0, possibly: 1, unlikely: 2 };
    results.sort((a, b) => order[a.level] - order[b.level]);

    renderResult(results);

    // Switch to passport tab
    document.querySelectorAll('.passport-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    document.querySelectorAll('.passport-panel').forEach(p => p.classList.remove('active'));
    document.querySelector('[data-tab="passport"]').classList.add('active');
    document.querySelector('[data-tab="passport"]').setAttribute('aria-selected', 'true');
    document.getElementById('panel-passport').classList.add('active');
    document.getElementById('panel-passport').scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.querySelector('[data-tab="passport"]').focus();
  }

  // ── Render result ────────────────────────────────────────────────────────
  function renderResult(results) {
    const el = document.getElementById('passport-result');
    const likely = results.filter(r => r.level === 'likely').length;
    const possibly = results.filter(r => r.level === 'possibly').length;

    let html = `<div style="text-align:center;margin-bottom:1.5rem">
      <div style="font-size:1.3rem;font-weight:700;color:#fff;margin-bottom:0.3rem">Your Compliance Passport</div>
      <div style="color:rgba(255,255,255,0.5);font-size:0.85rem">${likely} likely · ${possibly} possibly · ${results.length - likely - possibly} unlikely</div>
    </div>`;

    html += results.map(r => {
      const features = (r.m365_features || []).map(f => {
        const searchUrl = 'https://learn.microsoft.com/search/?terms=' + encodeURIComponent(f);
        return `<a href="${searchUrl}" target="_blank" rel="noopener noreferrer" class="passport-feature-pill">${esc(f)}</a>`;
      }).join('');
      return `
        <div class="passport-card ${r.level}">
          <div class="passport-card-header">
            <span class="passport-card-name">${esc(r.name)}</span>
            <span class="passport-card-badge ${r.level}">${r.level}</span>
          </div>
          <div class="passport-card-region">${esc(r.full_name)} · ${esc(r.region)}</div>
          <div class="passport-card-desc">${esc(r.description)}</div>
          ${features ? `<div style="margin-bottom:0.3rem;color:rgba(255,255,255,0.4);font-size:0.7rem">M365 features that help:</div><div class="passport-card-features">${features}</div>` : ''}
          ${r.url ? `<a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer" class="passport-card-link">Learn more ↗</a>` : ''}
        </div>
      `;
    }).join('');

    html += `<div class="passport-result-actions">
      <button class="passport-btn" onclick="window.print()">🖨️ Print Passport</button>
      <button class="passport-btn" id="btn-share-passport">🔗 Share</button>
    </div>`;

    el.innerHTML = html;

    document.getElementById('btn-share-passport')?.addEventListener('click', () => {
      const text = `My Compliance Passport: ${likely} likely, ${possibly} possibly applicable frameworks.\n\nGenerate yours: ${window.location.origin}/compliance-passport/`;
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => alert('Copied!'));
    });
  }

  // ── Tabs ─────────────────────────────────────────────────────────────────
  function initTabs() {
    document.querySelectorAll('.passport-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.passport-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        document.querySelectorAll('.passport-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active'); tab.setAttribute('aria-selected', 'true');
        const p = document.getElementById('panel-' + tab.dataset.tab);
        if (p) p.classList.add('active');
      });
    });
  }

  function applyPreset(presetKey) {
    const preset = PRESETS[presetKey];
    if (!preset) return;
    answers = { ...preset };
    // Update UI to reflect preset selections
    DATA.questions.forEach(q => {
      const val = preset[q.id];
      if (!val) return;
      const opts = document.querySelectorAll(`[data-qid="${q.id}"]`);
      opts.forEach(o => {
        o.classList.remove('selected');
        if (o.dataset.value === val) {
          o.classList.add('selected');
          o.querySelector('input').checked = true;
        }
      });
    });
    document.getElementById('quiz-actions').style.display = 'block';
  }

  function init() {
    initTabs();
    renderQuiz();
    document.getElementById('btn-generate').addEventListener('click', generatePassport);

    // Preset buttons
    document.querySelectorAll('.passport-preset').forEach(btn => {
      btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
