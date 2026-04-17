/* Incident Comms Generator – client-side, zero deps */
(function () {
  'use strict';

  /* ── XSS helper ───────────────────────────────────────── */
  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  /* ── Data ──────────────────────────────────────────────── */
  var templates = (window.__incidentTemplates || []);

  /* ── Placeholder token map ────────────────────────────── */
  var TOKEN_MAP = {
    '{eta}':         '[estimated time]',
    '{cause}':       '[root cause]',
    '{time}':        '[incident time]',
    '{duration}':    '[total duration]',
    '{region}':      '[affected region]',
    '{services}':    '[affected services]',
    '{impact}':      '[business impact]',
    '{scope}':       '[scope of impact]',
    '{next_update}': '[next update time]',
    '{location}':    '[location / environment]'
  };

  function fillTokens(str) {
    if (!str) return '';
    var out = str;
    Object.keys(TOKEN_MAP).forEach(function (tok) {
      out = out.split(tok).join(TOKEN_MAP[tok]);
    });
    return out;
  }

  /* ── Tab switching ────────────────────────────────────── */
  function initTabs(ns) {
    var tabs = document.querySelectorAll('.' + ns + '-tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.getAttribute('data-tab');
        tabs.forEach(function (t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        document.querySelectorAll('.' + ns + '-panel').forEach(function (p) { p.classList.remove('active'); });
        var panel = document.getElementById('panel-' + target);
        if (panel) panel.classList.add('active');
      });
    });
  }

  /* ── Toast ─────────────────────────────────────────────── */
  var toastTimer = null;
  function showToast(msg) {
    var el = document.getElementById('icomms-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'icomms-toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      el.style.cssText =
        'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);' +
        'background:rgba(20,184,166,.92);color:#fff;padding:.65rem 1.4rem;' +
        'border-radius:10px;font-size:.88rem;font-weight:600;z-index:9999;' +
        'pointer-events:none;opacity:0;transition:opacity .25s ease;' +
        'backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.style.opacity = '0'; }, 2200);
  }

  /* ── Copy to clipboard ─────────────────────────────────── */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast('Copied to clipboard ✓');
      }).catch(function () { fallbackCopy(text); });
    } else {
      fallbackCopy(text);
    }
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px;';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showToast('Copied to clipboard ✓'); }
    catch (_) { showToast('Copy failed — please select manually'); }
    document.body.removeChild(ta);
  }

  /* ── Mailto helper ─────────────────────────────────────── */
  function openMailto(subject, body) {
    var href = 'mailto:?subject=' + encodeURIComponent(subject) +
               '&body=' + encodeURIComponent(body);
    window.open(href, '_self');
  }

  /* ── Populate incident type dropdown ───────────────────── */
  function populateTypes() {
    var sel = document.getElementById('incident-type');
    if (!sel) return;
    sel.innerHTML = '<option value="">— Choose incident type —</option>';
    templates.forEach(function (t) {
      var opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = (t.icon || '') + ' ' + t.type;
      sel.appendChild(opt);
    });
  }

  /* ── Severity label helper ─────────────────────────────── */
  function sevLabel(sev) {
    var map = { P1: 'Critical', P2: 'High', P3: 'Moderate', P4: 'Low' };
    return map[sev] || sev;
  }

  /* ── Build one comms section card ──────────────────────── */
  function sectionCard(phase, subject, body) {
    var subjectLine = subject ? fillTokens(subject) : '';
    var bodyText = fillTokens(body);
    var subjectHtml = subjectLine
      ? '<div class="icomms-section-subject"><strong>Subject:</strong> ' + esc(subjectLine) + '</div>'
      : '';
    return (
      '<div class="icomms-section-card">' +
        '<div class="icomms-section-phase">' + esc(phase) + '</div>' +
        subjectHtml +
        '<pre class="icomms-section-body">' + esc(bodyText) + '</pre>' +
        '<div class="icomms-section-actions">' +
          '<button class="icomms-copy-btn" data-text="' + esc(bodyText) + '" aria-label="Copy ' + esc(phase) + '">📋 Copy</button>' +
          (subjectLine
            ? '<button class="icomms-mailto-btn" data-subject="' + esc(subjectLine) + '" data-body="' + esc(bodyText) + '" aria-label="Email ' + esc(phase) + '">✉️ Email</button>'
            : '') +
        '</div>' +
      '</div>'
    );
  }

  /* ── Generate comms output ─────────────────────────────── */
  function generateComms() {
    var out = document.getElementById('comms-output');
    if (!out) return;

    var typeId   = (document.getElementById('incident-type')     || {}).value;
    var severity = (document.getElementById('incident-severity') || {}).value;
    var audience = (document.getElementById('incident-audience')  || {}).value;
    var creative = (document.getElementById('creative-toggle')    || {}).checked;

    if (!typeId) {
      out.innerHTML = '<p class="icomms-placeholder">Select an incident type to generate communications.</p>';
      return;
    }

    var tpl = null;
    for (var i = 0; i < templates.length; i++) {
      if (templates[i].id === typeId) { tpl = templates[i]; break; }
    }
    if (!tpl || !tpl.blocks || !tpl.blocks.length) {
      out.innerHTML = '<p class="icomms-placeholder">No template data found.</p>';
      return;
    }

    var block = tpl.blocks[0];
    var sevText = severity || block.severity || 'P2';
    var audText = audience || block.audience || 'All Staff';
    var toneText = block.tone || 'Professional';

    var html = '';
    html += '<div class="icomms-meta">';
    html +=   '<span class="icomms-meta-pill icomms-sev-' + esc(sevText).toLowerCase() + '">' + esc(sevText) + ' — ' + esc(sevLabel(sevText)) + '</span>';
    html +=   '<span class="icomms-meta-pill">' + esc(audText) + '</span>';
    html +=   '<span class="icomms-meta-pill">' + esc(toneText) + '</span>';
    html += '</div>';

    html += sectionCard('📢 Initial Notification', block.subject || '', block.initial || '');
    html += sectionCard('🔍 Investigation Update', '', block.investigating || '');
    html += sectionCard('✅ Resolution Notice', '', block.resolved || '');

    if (creative && block.creative) {
      html += '<div class="icomms-creative-divider">🎨 Creative Version</div>';
      html += sectionCard('🎨 Creative Communication', block.subject || '', block.creative);
    }

    out.innerHTML = html;
  }

  /* ── Gallery rendering ─────────────────────────────────── */
  function renderGallery() {
    var gallery = document.getElementById('templates-gallery');
    if (!gallery) return;
    if (!templates.length) {
      gallery.innerHTML = '<p class="icomms-placeholder">No templates available.</p>';
      return;
    }

    var html = '<div class="icomms-gallery-grid">';
    templates.forEach(function (t) {
      var block = (t.blocks && t.blocks[0]) || {};
      var preview = fillTokens(block.initial || '').slice(0, 140);
      var hasCreative = !!block.creative;

      html += '<div class="icomms-gallery-card">';
      html +=   '<div class="icomms-gallery-icon">' + esc(t.icon || '📄') + '</div>';
      html +=   '<div class="icomms-gallery-name">' + esc(t.type || t.id) + '</div>';
      html +=   '<div class="icomms-gallery-preview">' + esc(preview) + (preview.length >= 140 ? '…' : '') + '</div>';
      if (hasCreative) {
        html += '<span class="icomms-gallery-badge">🎨 Creative</span>';
      }
      html +=   '<button class="icomms-gallery-use" data-type="' + esc(t.id) + '">Use Template</button>';
      html += '</div>';
    });
    html += '</div>';
    gallery.innerHTML = html;
  }

  /* ── Event delegation on output ────────────────────────── */
  function bindOutputEvents() {
    var out = document.getElementById('comms-output');
    if (out) {
      out.addEventListener('click', function (e) {
        var btn = e.target.closest('.icomms-copy-btn');
        if (btn) {
          copyText(btn.getAttribute('data-text') || '');
          return;
        }
        var mailto = e.target.closest('.icomms-mailto-btn');
        if (mailto) {
          openMailto(
            mailto.getAttribute('data-subject') || '',
            mailto.getAttribute('data-body') || ''
          );
        }
      });
    }
  }

  /* ── Event delegation on gallery ───────────────────────── */
  function bindGalleryEvents() {
    var gallery = document.getElementById('templates-gallery');
    if (!gallery) return;
    gallery.addEventListener('click', function (e) {
      var btn = e.target.closest('.icomms-gallery-use');
      if (!btn) return;
      var typeId = btn.getAttribute('data-type');
      var sel = document.getElementById('incident-type');
      if (sel) { sel.value = typeId; }
      // Switch to generate tab
      var genTab = document.querySelector('.icomms-tab[data-tab="generate"]');
      if (genTab) genTab.click();
      generateComms();
    });
  }

  /* ── Form change listeners ─────────────────────────────── */
  function bindForm() {
    var ids = ['incident-type', 'incident-severity', 'incident-audience', 'creative-toggle'];
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('change', generateComms);
    });
    var genBtn = document.getElementById('generate-btn');
    if (genBtn) genBtn.addEventListener('click', generateComms);
  }

  /* ── Init ──────────────────────────────────────────────── */
  function init() {
    initTabs('icomms');
    populateTypes();
    renderGallery();
    bindForm();
    bindOutputEvents();
    bindGalleryEvents();
    generateComms();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
