/* ══════════════════════════════════════════════════════════
   QR Code Generator — qr-generator.js
   100% client-side, zero API calls
   Uses: qr-code-styling, jsQR, JSZip (all via CDN)
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Helpers ── */
  const $ = (s, p) => (p || document).querySelector(s);
  const $$ = (s, p) => [...(p || document).querySelectorAll(s)];
  const esc = s => { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; };

  /* ── WiFi field escaping (per QR WiFi spec) ── */
  function escWifi(s) { return s.replace(/([\\;,:"'])/g, '\\$1'); }

  /* ── State ── */
  const S = {
    type: 'url',
    qr: null,
    logoDataUrl: null,
    ec: 'Q',
    size: 400,
    logoSize: 0.3,
    preset: 'classic',
    fgColor: '#EC4899',
    bgColor: '#1a1a2e',
    dotType: 'rounded',
    cornerSquareType: 'extra-rounded',
    batchCodes: []
  };

  /* ── Style Presets ── */
  const PRESETS = {
    classic: { fg: '#EC4899', bg: '#1a1a2e', dot: 'rounded', corner: 'extra-rounded' },
    neon:    { fg: '#00ff88', bg: '#0a0a0a', dot: 'dots', corner: 'dot' },
    gradient:{ fg: '#8B5CF6', bg: '#1e1b4b', dot: 'classy-rounded', corner: 'extra-rounded' },
    minimal: { fg: '#ffffff', bg: '#111111', dot: 'square', corner: 'square' }
  };

  /* ── Tabs ── */
  $$('.qrgen-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.qrgen-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      $$('.qrgen-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const panel = $(`#panel-${tab.dataset.tab}`);
      if (panel) panel.classList.add('active');
    });
  });

  /* ── Content Type Switching ── */
  $$('.qrgen-type-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      $$('.qrgen-type-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      S.type = pill.dataset.type;
      // Show/hide forms
      $$('[id^="qrgen-form-"]').forEach(f => f.classList.add('qrgen-hidden'));
      const form = $(`#qrgen-form-${S.type}`);
      if (form) form.classList.remove('qrgen-hidden');
      debouncedGenerate();
    });
  });

  /* ── Style Toggle ── */
  const styleToggle = $('#qrgen-style-toggle');
  const styleBody = $('#qrgen-style-body');
  const styleChevron = $('#qrgen-style-chevron');
  if (styleToggle) {
    styleToggle.addEventListener('click', () => {
      const open = styleBody.classList.toggle('open');
      styleToggle.setAttribute('aria-expanded', open);
      styleChevron.textContent = open ? '▼' : '▶';
    });
  }

  /* ── Presets ── */
  $$('.qrgen-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = PRESETS[btn.dataset.preset];
      if (!p) return;
      $$('.qrgen-preset').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      S.preset = btn.dataset.preset;
      S.fgColor = p.fg; S.bgColor = p.bg; S.dotType = p.dot; S.cornerSquareType = p.corner;
      // Sync UI
      $('#qrgen-fg-color').value = p.fg; $('#qrgen-fg-hex').value = p.fg;
      $('#qrgen-bg-color').value = p.bg; $('#qrgen-bg-hex').value = p.bg;
      $('#qrgen-dot-style').value = p.dot;
      $('#qrgen-corner-style').value = p.corner;
      debouncedGenerate();
    });
  });

  /* ── Colour sync ── */
  function syncColor(pickerId, hexId, stateKey) {
    const picker = $(pickerId), hex = $(hexId);
    if (!picker || !hex) return;
    picker.addEventListener('input', () => {
      hex.value = picker.value; S[stateKey] = picker.value;
      clearPresetActive(); debouncedGenerate();
    });
    hex.addEventListener('input', () => {
      if (/^#[0-9a-fA-F]{6}$/.test(hex.value)) {
        picker.value = hex.value; S[stateKey] = hex.value;
        clearPresetActive(); debouncedGenerate();
      }
    });
  }
  syncColor('#qrgen-fg-color', '#qrgen-fg-hex', 'fgColor');
  syncColor('#qrgen-bg-color', '#qrgen-bg-hex', 'bgColor');

  function clearPresetActive() {
    $$('.qrgen-preset').forEach(b => b.classList.remove('active'));
    S.preset = 'custom';
  }

  /* ── Style dropdowns ── */
  const dotSelect = $('#qrgen-dot-style');
  const cornerSelect = $('#qrgen-corner-style');
  if (dotSelect) dotSelect.addEventListener('change', () => { S.dotType = dotSelect.value; clearPresetActive(); debouncedGenerate(); });
  if (cornerSelect) cornerSelect.addEventListener('change', () => { S.cornerSquareType = cornerSelect.value; clearPresetActive(); debouncedGenerate(); });

  /* ── Error Correction ── */
  $$('.qrgen-ec-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      $$('.qrgen-ec-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      S.ec = pill.dataset.ec;
      debouncedGenerate();
    });
  });

  /* ── Size slider ── */
  const sizeSlider = $('#qrgen-size');
  const sizeVal = $('#qrgen-size-val');
  if (sizeSlider) {
    sizeSlider.addEventListener('input', () => {
      S.size = parseInt(sizeSlider.value);
      sizeVal.textContent = S.size + 'px';
      updateSizeInfo();
      debouncedGenerate();
    });
  }

  /* ── Logo upload ── */
  const logoArea = $('#qrgen-logo-area');
  const logoInput = $('#qrgen-logo-input');
  const logoContent = $('#qrgen-logo-content');
  const logoSizeWrap = $('#qrgen-logo-size-wrap');
  const logoSizeSlider = $('#qrgen-logo-size');
  const logoSizeVal = $('#qrgen-logo-size-val');

  if (logoArea && logoInput) {
    logoArea.addEventListener('click', () => logoInput.click());
    logoArea.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); logoInput.click(); } });
    logoArea.addEventListener('dragover', e => { e.preventDefault(); logoArea.classList.add('dragover'); });
    logoArea.addEventListener('dragleave', () => logoArea.classList.remove('dragover'));
    logoArea.addEventListener('drop', e => {
      e.preventDefault(); logoArea.classList.remove('dragover');
      if (e.dataTransfer.files.length) handleLogoFile(e.dataTransfer.files[0]);
    });
    logoInput.addEventListener('change', () => {
      if (logoInput.files.length) handleLogoFile(logoInput.files[0]);
    });
  }

  function handleLogoFile(file) {
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
      showToast('Please use PNG, JPG, or WebP (SVG not supported for security)');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast('Logo must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      S.logoDataUrl = e.target.result;
      logoContent.innerHTML = `<img src="${esc(S.logoDataUrl)}" class="qrgen-logo-preview" alt="Logo preview"><div class="qrgen-logo-hint">Click to change</div><button class="qrgen-logo-remove" id="qrgen-logo-remove" title="Remove logo">✕</button>`;
      logoArea.classList.add('has-logo');
      logoSizeWrap.classList.remove('qrgen-hidden');
      // Remove button
      const removeBtn = $('#qrgen-logo-remove');
      if (removeBtn) removeBtn.addEventListener('click', (ev) => { ev.stopPropagation(); removeLogo(); });
      // Auto bump EC to Q or H when logo present
      if (S.ec === 'L' || S.ec === 'M') {
        S.ec = 'Q';
        $$('.qrgen-ec-pill').forEach(p => p.classList.remove('active'));
        $(`.qrgen-ec-pill[data-ec="Q"]`).classList.add('active');
      }
      debouncedGenerate();
    };
    reader.readAsDataURL(file);
  }

  function removeLogo() {
    S.logoDataUrl = null;
    logoContent.innerHTML = '<div class="qrgen-logo-hint">📎 Drop an image here or click to upload</div>';
    logoArea.classList.remove('has-logo');
    logoSizeWrap.classList.add('qrgen-hidden');
    logoInput.value = '';
    debouncedGenerate();
  }

  if (logoSizeSlider) {
    logoSizeSlider.addEventListener('input', () => {
      S.logoSize = parseInt(logoSizeSlider.value) / 100;
      logoSizeVal.textContent = logoSizeSlider.value + '%';
      debouncedGenerate();
    });
  }

  /* ── Build QR data string from form ── */
  function getQRData() {
    switch (S.type) {
      case 'url': return ($('#qrgen-url') || {}).value || '';
      case 'text': return ($('#qrgen-text') || {}).value || '';
      case 'wifi': {
        const ssid = ($('#qrgen-wifi-ssid') || {}).value || '';
        const pass = ($('#qrgen-wifi-pass') || {}).value || '';
        const enc = ($('#qrgen-wifi-enc') || {}).value || 'WPA';
        const hidden = ($('#qrgen-wifi-hidden') || {}).checked ? 'H:true' : '';
        return `WIFI:T:${enc};S:${escWifi(ssid)};P:${escWifi(pass)};${hidden};`;
      }
      case 'email': {
        const to = ($('#qrgen-email-to') || {}).value || '';
        const subj = ($('#qrgen-email-subject') || {}).value || '';
        const body = ($('#qrgen-email-body') || {}).value || '';
        let mailto = `mailto:${to}`;
        const params = [];
        if (subj) params.push(`subject=${encodeURIComponent(subj)}`);
        if (body) params.push(`body=${encodeURIComponent(body)}`);
        if (params.length) mailto += '?' + params.join('&');
        return mailto;
      }
      case 'phone': return `tel:${($('#qrgen-phone') || {}).value || ''}`;
      case 'vcard': {
        const fn = ($('#qrgen-vcard-fn') || {}).value || '';
        const ln = ($('#qrgen-vcard-ln') || {}).value || '';
        const org = ($('#qrgen-vcard-org') || {}).value || '';
        const title = ($('#qrgen-vcard-title') || {}).value || '';
        const phone = ($('#qrgen-vcard-phone') || {}).value || '';
        const email = ($('#qrgen-vcard-email') || {}).value || '';
        const url = ($('#qrgen-vcard-url') || {}).value || '';
        if (!fn && !ln) return '';
        let v = `BEGIN:VCARD\nVERSION:3.0\nN:${ln};${fn}\nFN:${fn} ${ln}`.trim();
        if (org) v += `\nORG:${org}`;
        if (title) v += `\nTITLE:${title}`;
        if (phone) v += `\nTEL:${phone}`;
        if (email) v += `\nEMAIL:${email}`;
        if (url) v += `\nURL:${url}`;
        v += `\nEND:VCARD`;
        return v;
      }
      default: return '';
    }
  }

  /* ── Scanability check ── */
  function checkScanability() {
    const warnings = [];
    // Contrast check
    const fgLum = luminance(S.fgColor);
    const bgLum = luminance(S.bgColor);
    const ratio = (Math.max(fgLum, bgLum) + 0.05) / (Math.min(fgLum, bgLum) + 0.05);
    if (ratio < 3) warnings.push('Low contrast between foreground and background — may not scan reliably.');
    // Logo size check
    if (S.logoDataUrl && S.logoSize > 0.35 && (S.ec === 'L' || S.ec === 'M')) {
      warnings.push('Large logo with low error correction — increase EC to Q or H for reliable scanning.');
    }
    const warningEl = $('#qrgen-warning');
    const warningText = $('#qrgen-warning-text');
    if (warnings.length && warningEl && warningText) {
      warningText.textContent = warnings[0];
      warningEl.classList.add('visible');
    } else if (warningEl) {
      warningEl.classList.remove('visible');
    }
  }

  function luminance(hex) {
    const r = parseInt(hex.slice(1,3), 16) / 255;
    const g = parseInt(hex.slice(3,5), 16) / 255;
    const b = parseInt(hex.slice(5,7), 16) / 255;
    const srgb = [r, g, b].map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  }

  /* ── Generate QR Code ── */
  let generateTimeout = null;
  function debouncedGenerate() {
    clearTimeout(generateTimeout);
    generateTimeout = setTimeout(generateQR, 250);
  }

  function generateQR() {
    const data = getQRData();
    const warningEl = $('#qrgen-warning');
    if (!data || data.length < 1) {
      const box = $('#qrgen-preview-box');
      if (box) box.innerHTML = '<div class="qrgen-preview-placeholder">Enter content to generate a QR code</div>';
      if (warningEl) warningEl.classList.remove('visible');
      return;
    }

    checkScanability();

    const opts = {
      width: S.size,
      height: S.size,
      type: 'svg',
      data: data,
      dotsOptions: { color: S.fgColor, type: S.dotType },
      cornersSquareOptions: { color: S.fgColor, type: S.cornerSquareType },
      cornersDotOptions: { color: S.fgColor, type: 'dot' },
      backgroundOptions: { color: S.bgColor },
      qrOptions: { errorCorrectionLevel: S.ec }
    };

    if (S.logoDataUrl) {
      opts.image = S.logoDataUrl;
      opts.imageOptions = {
        crossOrigin: 'anonymous',
        margin: 6,
        imageSize: S.logoSize,
        hideBackgroundDots: true
      };
    }

    // Clean up old QR
    const box = $('#qrgen-preview-box');
    if (!box) return;
    box.innerHTML = '';

    try {
      S.qr = new QRCodeStyling(opts);
      S.qr.append(box);
      updateSizeInfo();
      updateMobilePreview();
    } catch (e) {
      box.innerHTML = '<div class="qrgen-preview-placeholder">⚠️ Error generating QR code</div>';
    }
  }

  /* ── Flush pending debounce before action ── */
  function flushGenerate() {
    if (generateTimeout) { clearTimeout(generateTimeout); generateTimeout = null; generateQR(); }
  }

  /* ── Download handlers ── */
  $('#qrgen-download-png')?.addEventListener('click', () => {
    flushGenerate();
    if (S.qr) S.qr.download({ name: 'qr-code', extension: 'png' });
  });

  $('#qrgen-download-svg')?.addEventListener('click', () => {
    flushGenerate();
    if (S.qr) S.qr.download({ name: 'qr-code', extension: 'svg' });
  });

  /* ── Copy image to clipboard ── */
  $('#qrgen-copy-img')?.addEventListener('click', async () => {
    flushGenerate();
    if (!S.qr) return;
    try {
      const blob = await S.qr.getRawData('png');
      if (blob) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        showToast('Image copied to clipboard!');
      }
    } catch {
      showToast('Copy failed — try downloading instead');
    }
  });

  /* ── Share URL ── */
  $('#qrgen-share')?.addEventListener('click', () => {
    const params = new URLSearchParams();
    const data = getQRData();
    // Never include WiFi passwords in share URL
    if (S.type === 'wifi') {
      params.set('type', 'wifi');
      params.set('ssid', ($('#qrgen-wifi-ssid') || {}).value || '');
      // Password intentionally omitted
    } else {
      params.set('type', S.type);
      params.set('data', data);
    }
    if (S.preset !== 'custom') {
      params.set('preset', S.preset);
    } else {
      params.set('fg', S.fgColor);
      params.set('bg', S.bgColor);
      params.set('dot', S.dotType);
      params.set('corner', S.cornerSquareType);
    }
    params.set('ec', S.ec);
    const url = window.location.origin + window.location.pathname + '?' + params.toString();
    navigator.clipboard.writeText(url).then(() => showToast('Share link copied!')).catch(() => showToast('Could not copy link'));
  });

  /* ── Load from URL params ── */
  function loadFromURL() {
    const p = new URLSearchParams(window.location.search);
    if (!p.has('type')) return;

    const type = p.get('type');
    if (['url', 'text', 'wifi', 'email', 'phone', 'vcard'].includes(type)) {
      // Activate type pill
      $$('.qrgen-type-pill').forEach(pill => pill.classList.remove('active'));
      const pill = $(`.qrgen-type-pill[data-type="${type}"]`);
      if (pill) pill.classList.add('active');
      S.type = type;
      $$('[id^="qrgen-form-"]').forEach(f => f.classList.add('qrgen-hidden'));
      const form = $(`#qrgen-form-${type}`);
      if (form) form.classList.remove('qrgen-hidden');

      // Set data
      const data = p.get('data') || '';
      switch (type) {
        case 'url': if ($('#qrgen-url')) $('#qrgen-url').value = data; break;
        case 'text': if ($('#qrgen-text')) $('#qrgen-text').value = data; break;
        case 'email':
          if (data.startsWith('mailto:')) {
            try {
              const url = new URL(data);
              if ($('#qrgen-email-to')) $('#qrgen-email-to').value = url.pathname;
              if ($('#qrgen-email-subject')) $('#qrgen-email-subject').value = url.searchParams.get('subject') || '';
              if ($('#qrgen-email-body')) $('#qrgen-email-body').value = url.searchParams.get('body') || '';
            } catch { if ($('#qrgen-email-to')) $('#qrgen-email-to').value = data; }
          }
          break;
        case 'phone': if ($('#qrgen-phone')) $('#qrgen-phone').value = data.replace('tel:', ''); break;
        case 'wifi':
          if (p.has('ssid') && $('#qrgen-wifi-ssid')) $('#qrgen-wifi-ssid').value = p.get('ssid');
          break;
      }
    }

    // Style
    if (p.has('preset') && PRESETS[p.get('preset')]) {
      const presetBtn = $(`.qrgen-preset[data-preset="${p.get('preset')}"]`);
      if (presetBtn) presetBtn.click();
    } else {
      if (p.has('fg')) { S.fgColor = p.get('fg'); $('#qrgen-fg-color').value = S.fgColor; $('#qrgen-fg-hex').value = S.fgColor; }
      if (p.has('bg')) { S.bgColor = p.get('bg'); $('#qrgen-bg-color').value = S.bgColor; $('#qrgen-bg-hex').value = S.bgColor; }
      if (p.has('dot') && $('#qrgen-dot-style')) { S.dotType = p.get('dot'); $('#qrgen-dot-style').value = S.dotType; }
      if (p.has('corner') && $('#qrgen-corner-style')) { S.cornerSquareType = p.get('corner'); $('#qrgen-corner-style').value = S.cornerSquareType; }
      clearPresetActive();
    }

    if (p.has('ec')) {
      S.ec = p.get('ec');
      $$('.qrgen-ec-pill').forEach(pill => pill.classList.remove('active'));
      const ecPill = $(`.qrgen-ec-pill[data-ec="${S.ec}"]`);
      if (ecPill) ecPill.classList.add('active');
    }
  }

  /* ── Listen to all inputs for live preview ── */
  ['#qrgen-url', '#qrgen-text', '#qrgen-wifi-ssid', '#qrgen-wifi-pass',
   '#qrgen-email-to', '#qrgen-email-subject', '#qrgen-email-body', '#qrgen-phone',
   '#qrgen-vcard-fn', '#qrgen-vcard-ln', '#qrgen-vcard-org', '#qrgen-vcard-title',
   '#qrgen-vcard-phone', '#qrgen-vcard-email', '#qrgen-vcard-url'
  ].forEach(sel => {
    const el = $(sel);
    if (el) el.addEventListener('input', debouncedGenerate);
  });
  ['#qrgen-wifi-enc', '#qrgen-wifi-hidden'].forEach(sel => {
    const el = $(sel);
    if (el) el.addEventListener('change', debouncedGenerate);
  });

  /* ── WiFi password show/hide toggle ── */
  const passToggle = $('#qrgen-wifi-pass-toggle');
  const passInput = $('#qrgen-wifi-pass');
  if (passToggle && passInput) {
    passToggle.addEventListener('click', () => {
      const showing = passInput.type === 'text';
      passInput.type = showing ? 'password' : 'text';
      passToggle.textContent = showing ? '👁️' : '🙈';
      passToggle.title = showing ? 'Show password' : 'Hide password';
    });
  }

  /* ── Try-it Quick Start cards ── */
  const TRY_DATA = {
    website: { type: 'url', data: { '#qrgen-url': 'https://www.example.com' } },
    wifi: { type: 'wifi', data: { '#qrgen-wifi-ssid': 'MyHomeWiFi', '#qrgen-wifi-pass': 'SecurePassword123' } },
    vcard: { type: 'vcard', data: { '#qrgen-vcard-fn': 'John', '#qrgen-vcard-ln': 'Doe', '#qrgen-vcard-org': 'Acme Corp', '#qrgen-vcard-title': 'Software Engineer', '#qrgen-vcard-phone': '+1234567890', '#qrgen-vcard-email': 'john@example.com', '#qrgen-vcard-url': 'https://www.example.com' } }
  };

  $$('.qrgen-try-card').forEach(card => {
    card.addEventListener('click', () => {
      const tryKey = card.dataset.try;
      const cfg = TRY_DATA[tryKey];
      if (!cfg) return;
      // Switch type
      S.type = cfg.type;
      $$('.qrgen-type-pill').forEach(p => p.classList.remove('active'));
      $(`.qrgen-type-pill[data-type="${cfg.type}"]`)?.classList.add('active');
      $$('[id^="qrgen-form-"]').forEach(f => f.classList.add('qrgen-hidden'));
      $(`#qrgen-form-${cfg.type}`)?.classList.remove('qrgen-hidden');
      // Fill data
      for (const [sel, val] of Object.entries(cfg.data)) {
        const el = $(sel);
        if (el) el.value = val;
      }
      debouncedGenerate();
      showToast(`Loaded "${card.querySelector('.qrgen-try-name').textContent}" example`);
    });
  });

  /* ── Preview background toggle (dark/light/transparent) ── */
  $$('.qrgen-bg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.qrgen-bg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const box = $('#qrgen-preview-box');
      if (!box) return;
      box.classList.remove('bg-light', 'bg-transparent');
      if (btn.dataset.bg === 'light') box.classList.add('bg-light');
      else if (btn.dataset.bg === 'transparent') box.classList.add('bg-transparent');
    });
  });

  /* ── Size info display ── */
  function updateSizeInfo() {
    const info = $('#qrgen-size-info');
    if (info) info.textContent = `${S.size} × ${S.size} px`;
  }

  /* ── Mobile mini-preview ── */
  function updateMobilePreview() {
    const mobileBox = $('#qrgen-mobile-preview-box');
    if (!mobileBox || !S.qr) return;
    // Only update on mobile
    if (window.innerWidth > 640) return;
    mobileBox.innerHTML = '';
    const miniQR = new QRCodeStyling({
      width: 80, height: 80, type: 'svg', data: getQRData(),
      dotsOptions: { color: S.fgColor, type: S.dotType },
      cornersSquareOptions: { color: S.fgColor, type: S.cornerSquareType },
      cornersDotOptions: { color: S.fgColor, type: 'dot' },
      backgroundOptions: { color: S.bgColor },
      qrOptions: { errorCorrectionLevel: S.ec }
    });
    miniQR.append(mobileBox);
  }

  // Tap mobile preview to scroll to full preview
  $('#qrgen-mobile-preview')?.addEventListener('click', () => {
    // On mobile, show the full preview card temporarily
    const card = $('.qrgen-preview-card');
    if (card) {
      card.style.display = 'block';
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => { if (window.innerWidth <= 640) card.style.display = ''; }, 5000);
    }
  });

  /* ══════════════════════════════════════════════════════════
     BATCH TAB
     ══════════════════════════════════════════════════════════ */

  /* ── Build payload from batch type ── */
  function buildBatchPayload(data, type) {
    switch ((type || '').toLowerCase()) {
      case 'email': return `mailto:${data}`;
      case 'phone': return `tel:${data}`;
      case 'wifi': return data;
      case 'vcard': return data;
      default: return data;
    }
  }

  /* ── Simple CSV line parser (handles quoted fields) ── */
  function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
        else if (ch === '"') { inQuotes = false; }
        else { current += ch; }
      } else {
        if (ch === '"') { inQuotes = true; }
        else if (ch === ',') { result.push(current.trim()); current = ''; }
        else { current += ch; }
      }
    }
    result.push(current.trim());
    return result;
  }

  $('#qrgen-batch-generate')?.addEventListener('click', async () => {
    const input = ($('#qrgen-batch-input') || {}).value || '';
    const lines = input.trim().split('\n').filter(l => l.trim());
    if (!lines.length) { showToast('Paste some data first'); return; }

    const preview = $('#qrgen-batch-preview');
    const progress = $('#qrgen-batch-progress');
    const progressBar = $('#qrgen-batch-progress-bar');
    if (!preview) return;

    preview.innerHTML = '';
    S.batchCodes = [];
    progress?.classList.add('visible');

    for (let i = 0; i < lines.length; i++) {
      const parts = parseCSVLine(lines[i]);
      const rawData = parts[0] || '';
      const type = parts[1] || 'url';
      const label = parts[2] || parts[0] || `QR ${i + 1}`;
      const data = buildBatchPayload(rawData, type);

      if (!data) continue;

      const card = document.createElement('div');
      card.className = 'qrgen-batch-card';
      preview.appendChild(card);

      const qr = new QRCodeStyling({
        width: 200, height: 200, type: 'svg', data: data,
        dotsOptions: { color: S.fgColor, type: S.dotType },
        cornersSquareOptions: { color: S.fgColor, type: S.cornerSquareType },
        cornersDotOptions: { color: S.fgColor, type: 'dot' },
        backgroundOptions: { color: S.bgColor },
        qrOptions: { errorCorrectionLevel: S.ec }
      });

      qr.append(card);
      card.innerHTML += `<div class="qrgen-batch-card-label">${esc(label)}</div>`;
      S.batchCodes.push({ qr, label, data });

      if (progressBar) progressBar.style.width = `${((i + 1) / lines.length) * 100}%`;
      // Yield to UI
      await new Promise(r => setTimeout(r, 50));
    }

    if (progressBar) progressBar.style.width = '100%';
    setTimeout(() => progress?.classList.remove('visible'), 1000);
    showToast(`Generated ${S.batchCodes.length} QR codes`);
  });

  /* ── Batch ZIP download ── */
  $('#qrgen-batch-download-zip')?.addEventListener('click', async () => {
    if (!S.batchCodes.length) { showToast('Generate codes first'); return; }
    if (typeof JSZip === 'undefined') { showToast('JSZip not loaded'); return; }

    const zip = new JSZip();
    showToast('Creating ZIP...');

    for (let i = 0; i < S.batchCodes.length; i++) {
      const { qr, label } = S.batchCodes[i];
      try {
        const blob = await qr.getRawData('png');
        if (blob) {
          const safeName = label.replace(/[^a-zA-Z0-9-_ ]/g, '').trim().replace(/\s+/g, '-') || `qr-${i + 1}`;
          zip.file(`${safeName}.png`, blob);
        }
      } catch { /* skip failed */ }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = 'qr-codes.zip';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('ZIP downloaded!');
  });

  /* ── Batch template ── */
  $('#qrgen-batch-template')?.addEventListener('click', () => {
    const csv = 'data,type,label\nhttps://www.example.com,url,Example Website\nhttps://www.google.com,url,Google\nHello World,text,Greeting\n+1234567890,phone,Support Line';
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'qr-batch-template.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  /* ── Batch upload CSV ── */
  const batchFileInput = $('#qrgen-batch-file');
  $('#qrgen-batch-upload')?.addEventListener('click', () => batchFileInput?.click());
  batchFileInput?.addEventListener('change', () => {
    const file = batchFileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const textarea = $('#qrgen-batch-input');
      if (textarea) {
        let text = e.target.result;
        // Skip header row if it looks like one
        const lines = text.trim().split('\n');
        if (lines[0] && lines[0].toLowerCase().includes('data') && lines[0].toLowerCase().includes('type')) {
          text = lines.slice(1).join('\n');
        }
        textarea.value = text;
      }
    };
    reader.readAsText(file);
  });

  /* ── Batch clear ── */
  $('#qrgen-batch-clear')?.addEventListener('click', () => {
    const textarea = $('#qrgen-batch-input');
    const preview = $('#qrgen-batch-preview');
    if (textarea) textarea.value = '';
    if (preview) preview.innerHTML = '';
    S.batchCodes = [];
  });

  /* ══════════════════════════════════════════════════════════
     SCAN TAB
     ══════════════════════════════════════════════════════════ */

  const scanDrop = $('#qrgen-scan-drop');
  const scanFile = $('#qrgen-scan-file');

  if (scanDrop && scanFile) {
    scanDrop.addEventListener('click', () => scanFile.click());
    scanDrop.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scanFile.click(); } });
    scanDrop.addEventListener('dragover', e => { e.preventDefault(); scanDrop.classList.add('dragover'); });
    scanDrop.addEventListener('dragleave', () => scanDrop.classList.remove('dragover'));
    scanDrop.addEventListener('drop', e => {
      e.preventDefault(); scanDrop.classList.remove('dragover');
      if (e.dataTransfer.files.length) scanImage(e.dataTransfer.files[0]);
    });
    scanFile.addEventListener('change', () => {
      if (scanFile.files.length) scanImage(scanFile.files[0]);
    });
  }

  // Paste from clipboard
  document.addEventListener('paste', (e) => {
    // Only handle if scan tab is active
    if (!$('#panel-scan')?.classList.contains('active')) return;
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const blob = item.getAsFile();
        if (blob) scanImage(blob);
        break;
      }
    }
  });

  function scanImage(file) {
    if (!file.type.startsWith('image/')) { showToast('Please upload an image file'); return; }
    if (typeof jsQR === 'undefined') { showToast('Scanner not loaded'); return; }

    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        const result = $('#qrgen-scan-result');
        const resultText = $('#qrgen-scan-result-text');
        const openBtn = $('#qrgen-scan-open');

        if (code && code.data) {
          if (result) result.classList.add('visible');
          if (resultText) resultText.textContent = code.data;
          if (openBtn) openBtn.style.display = isSafeUrl(code.data) ? 'inline-flex' : 'none';
          showToast('QR code detected!');
        } else {
          if (result) result.classList.remove('visible');
          showToast('No QR code found in image');
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  /* ── Safe URL check ── */
  function isSafeUrl(str) {
    try { const u = new URL(str); return ['http:', 'https:', 'mailto:', 'tel:'].includes(u.protocol); } catch { return false; }
  }

  /* ── Scan result actions ── */
  $('#qrgen-scan-copy')?.addEventListener('click', () => {
    const text = ($('#qrgen-scan-result-text') || {}).textContent || '';
    navigator.clipboard.writeText(text).then(() => showToast('Copied!')).catch(() => showToast('Copy failed'));
  });

  $('#qrgen-scan-open')?.addEventListener('click', () => {
    const text = ($('#qrgen-scan-result-text') || {}).textContent || '';
    if (isSafeUrl(text)) window.open(text, '_blank', 'noopener,noreferrer');
    else showToast('Not a safe URL');
  });

  $('#qrgen-scan-create')?.addEventListener('click', () => {
    const text = ($('#qrgen-scan-result-text') || {}).textContent || '';
    if (!text) return;
    // Switch to Create tab with this data
    $$('.qrgen-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    $$('.qrgen-panel').forEach(p => p.classList.remove('active'));
    const createTab = $(`.qrgen-tab[data-tab="create"]`);
    if (createTab) { createTab.classList.add('active'); createTab.setAttribute('aria-selected', 'true'); }
    $('#panel-create')?.classList.add('active');
    // Set as URL or text
    try {
      new URL(text);
      S.type = 'url';
      if ($('#qrgen-url')) $('#qrgen-url').value = text;
    } catch {
      S.type = 'text';
      if ($('#qrgen-text')) $('#qrgen-text').value = text;
    }
    $$('.qrgen-type-pill').forEach(p => p.classList.remove('active'));
    $(`.qrgen-type-pill[data-type="${S.type}"]`)?.classList.add('active');
    $$('[id^="qrgen-form-"]').forEach(f => f.classList.add('qrgen-hidden'));
    $(`#qrgen-form-${S.type}`)?.classList.remove('qrgen-hidden');
    debouncedGenerate();
  });

  /* ── Toast notifications ── */
  function showToast(msg) {
    const existing = $('.qrgen-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'qrgen-toast';
    toast.textContent = msg;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.style.cssText = 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:#EC4899;color:#fff;padding:0.6rem 1.5rem;border-radius:8px;font-size:0.85rem;z-index:9999;animation:fadeInUp 0.3s ease;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }

  /* ── Init ── */
  loadFromURL();
  generateQR();

  // Tab from URL hash
  const hash = window.location.hash.replace('#', '');
  if (['batch', 'scan'].includes(hash)) {
    const tab = $(`.qrgen-tab[data-tab="${hash}"]`);
    if (tab) tab.click();
  }

})();
