/* ============================================================================
   IT Admin Comms Templates — admin-comms.js
   ============================================================================ */
(function () {
  'use strict';

  const ALL = window.__commsTemplates || [];
  let activeTemplate = null;
  let savedValues = loadSaved();

  function esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

  // ── Render grid ──────────────────────────────────────────────────────────
  function renderGrid() {
    const cat = document.getElementById('cat-filter').value;
    const filtered = cat === 'all' ? ALL : ALL.filter(t => t.category === cat);
    const el = document.getElementById('comms-grid');
    el.innerHTML = filtered.map(t => `
      <div class="comms-card" data-id="${esc(t.id)}">
        <div class="comms-card-cat">${esc(t.category)}</div>
        <div class="comms-card-title">${esc(t.title)}</div>
        <div class="comms-card-hint">${esc(t.when_to_use || '')}</div>
      </div>
    `).join('');

    el.querySelectorAll('.comms-card').forEach(card => {
      card.addEventListener('click', () => {
        const t = ALL.find(x => x.id === card.dataset.id);
        if (t) openEditor(t);
      });
    });
  }

  // ── Open editor ──────────────────────────────────────────────────────────
  function openEditor(template) {
    activeTemplate = template;
    document.getElementById('editor-title').textContent = template.title;
    document.getElementById('editor-cat').textContent = template.category;
    document.getElementById('editor-hint').textContent = template.when_to_use || '';

    // Build placeholder inputs
    const ph = document.getElementById('editor-placeholders');
    ph.innerHTML = (template.placeholders || []).map(p => {
      const saved = savedValues[p] || '';
      const label = p.replace(/_/g, ' ');
      return `
        <div class="comms-field">
          <label for="ph-${esc(p)}">${esc(label)}</label>
          <input type="text" id="ph-${esc(p)}" data-placeholder="${esc(p)}" value="${esc(saved)}" placeholder="${esc(label)}">
        </div>
      `;
    }).join('');

    // Live preview on input
    ph.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', () => {
        savedValues[input.dataset.placeholder] = input.value;
        saveSaved();
        updatePreview();
      });
    });

    updatePreview();

    // Switch to editor tab
    document.querySelectorAll('.comms-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    document.querySelectorAll('.comms-panel').forEach(p => p.classList.remove('active'));
    document.querySelector('[data-tab="editor"]').classList.add('active');
    document.querySelector('[data-tab="editor"]').setAttribute('aria-selected', 'true');
    document.getElementById('panel-editor').classList.add('active');
  }

  // ── Preview ──────────────────────────────────────────────────────────────
  function getRenderedSubject() {
    if (!activeTemplate) return '';
    let subj = activeTemplate.subject || '';
    (activeTemplate.placeholders || []).forEach(p => {
      const val = savedValues[p] || `{{${p}}}`;
      subj = subj.replace(new RegExp(`\\{\\{${p}\\}\\}`, 'g'), val);
    });
    return subj;
  }

  function updatePreview() {
    if (!activeTemplate) return;
    const subj = getRenderedSubject();
    let text = activeTemplate.body || '';
    (activeTemplate.placeholders || []).forEach(p => {
      const val = savedValues[p] || `{{${p}}}`;
      text = text.replace(new RegExp(`\\{\\{${p}\\}\\}`, 'g'), val);
    });
    document.getElementById('editor-preview').textContent = `Subject: ${subj}\n\n${text}`;
  }

  function getRenderedText() {
    if (!activeTemplate) return '';
    const subj = getRenderedSubject();
    let text = activeTemplate.body || '';
    (activeTemplate.placeholders || []).forEach(p => {
      const val = savedValues[p] || `{{${p}}}`;
      text = text.replace(new RegExp(`\\{\\{${p}\\}\\}`, 'g'), val);
    });
    return `Subject: ${subj}\n\n${text}`;
  }

  // ── Copy ─────────────────────────────────────────────────────────────────
  function copyPlain() {
    const text = getRenderedText();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => toast('Copied as plain text!'));
    }
  }

  function openInOutlook() {
    if (!activeTemplate) return;
    const subj = encodeURIComponent(getRenderedSubject());
    let body = activeTemplate.body || '';
    (activeTemplate.placeholders || []).forEach(p => {
      const val = savedValues[p] || `{{${p}}}`;
      body = body.replace(new RegExp(`\\{\\{${p}\\}\\}`, 'g'), val);
    });
    const bodyEnc = encodeURIComponent(body);
    window.location.href = `mailto:?subject=${subj}&body=${bodyEnc}`;
  }
  function copyMarkdown() {
    let text = getRenderedText();
    // Bold **text** patterns
    text = text.replace(/\*\*(.*?)\*\*/g, '**$1**');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => toast('Copied as Markdown!'));
    }
  }

  function toast(msg) {
    const el = document.createElement('div');
    el.textContent = msg;
    el.style.cssText = 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:var(--comms-accent);color:#fff;padding:0.6rem 1.2rem;border-radius:8px;font-size:0.85rem;z-index:9999;';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  }

  // ── Persistence ──────────────────────────────────────────────────────────
  function loadSaved() {
    try { return JSON.parse(localStorage.getItem('comms_values')) || {}; } catch { return {}; }
  }
  function saveSaved() {
    try { localStorage.setItem('comms_values', JSON.stringify(savedValues)); }
    catch { toast('Could not save — localStorage may be full or disabled'); }
  }

  // ── Tabs ─────────────────────────────────────────────────────────────────
  function initTabs() {
    document.querySelectorAll('.comms-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.comms-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        document.querySelectorAll('.comms-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active'); tab.setAttribute('aria-selected', 'true');
        const p = document.getElementById('panel-' + tab.dataset.tab);
        if (p) p.classList.add('active');
      });
    });
  }

  function init() {
    initTabs();
    renderGrid();
    document.getElementById('cat-filter').addEventListener('change', renderGrid);
    document.getElementById('btn-copy-plain').addEventListener('click', copyPlain);
    document.getElementById('btn-copy-md').addEventListener('click', copyMarkdown);
    document.getElementById('btn-outlook').addEventListener('click', openInOutlook);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
