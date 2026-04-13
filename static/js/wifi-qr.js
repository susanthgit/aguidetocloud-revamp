/* ══════════════════════════════════════════════════════════
   WiFi QR Code Generator — wifi-qr.js
   Focused tool: WiFi → beautiful printable card
   Uses: qr-code-styling via CDN
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const escWifi = s => s.replace(/([\\;,:"'])/g, '\\$1');

  /* ── Card themes ── */
  const THEMES = {
    home:   { icon: '📶', heading: 'WiFi Password', instruction: 'Point your phone camera at the QR code to connect', qrFg: '#1e293b', qrBg: '#ffffff' },
    cafe:   { icon: '☕', heading: 'Free WiFi', instruction: 'Scan with your phone camera — enjoy free WiFi!', qrFg: '#451a03', qrBg: '#fef3c7' },
    hotel:  { icon: '🏨', heading: 'Guest WiFi', instruction: 'Welcome! Scan to connect to our WiFi network', qrFg: '#312e81', qrBg: '#ffffff' },
    office: { icon: '🏢', heading: 'Office WiFi', instruction: 'Scan with your phone to join the network', qrFg: '#1e293b', qrBg: '#ffffff' }
  };

  let currentTheme = 'home';
  let qrInstance = null;

  /* ── Theme switching ── */
  $$('.wifiqr-template-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.wifiqr-template-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTheme = btn.dataset.theme;
      applyCardClasses();
      updateCard();
    });
  });

  /* ── Apply all card classes (theme + layout + border) ── */
  function applyCardClasses() {
    const card = $('#wifiqr-card');
    if (!card) return;
    const layout = ($('#wifiqr-layout') || {}).value || 'portrait';
    const border = ($('#wifiqr-border') || {}).value || 'rounded';
    let cls = `wifiqr-card theme-${currentTheme}`;
    if (layout === 'landscape') cls += ' landscape';
    if (border !== 'rounded') cls += ` border-${border}`;
    card.className = cls;
  }

  /* ── Password toggle ── */
  const passToggle = $('#wifiqr-pass-toggle');
  const passInput = $('#wifiqr-pass');
  if (passToggle && passInput) {
    passToggle.addEventListener('click', () => {
      const showing = passInput.type === 'text';
      passInput.type = showing ? 'password' : 'text';
      passToggle.textContent = showing ? '👁️' : '🙈';
    });
  }

  /* ── Build WiFi QR data ── */
  function getWifiData() {
    const ssid = ($('#wifiqr-ssid') || {}).value || '';
    const pass = ($('#wifiqr-pass') || {}).value || '';
    const enc = ($('#wifiqr-enc') || {}).value || 'WPA';
    const hidden = ($('#wifiqr-hidden') || {}).checked ? 'H:true' : '';
    if (!ssid) return '';
    return `WIFI:T:${enc};S:${escWifi(ssid)};P:${escWifi(pass)};${hidden};`;
  }

  /* ── Update card preview ── */
  let updateTimeout = null;
  function debouncedUpdate() {
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(updateCard, 200);
  }

  function updateCard() {
    const data = getWifiData();
    const ssid = ($('#wifiqr-ssid') || {}).value || '';
    const pass = ($('#wifiqr-pass') || {}).value || '';
    const theme = THEMES[currentTheme] || THEMES.home;
    const customHeading = ($('#wifiqr-custom-heading') || {}).value || '';
    const showPassOnCard = ($('#wifiqr-show-pass-on-card') || {}).checked !== false;
    const customBgEnabled = ($('#wifiqr-custom-bg-enable') || {}).checked;
    const customBg = ($('#wifiqr-custom-bg') || {}).value || '#1e293b';

    // Apply card classes (layout + border + theme)
    applyCardClasses();

    // Custom background override
    const card = $('#wifiqr-card');
    if (card) {
      card.style.background = customBgEnabled ? customBg : '';
    }

    // Update card text
    const iconEl = $('#wifiqr-card-icon');
    const headingEl = $('#wifiqr-card-heading');
    const instrEl = $('#wifiqr-card-instruction');
    const networkEl = $('#wifiqr-card-network');
    const passEl = $('#wifiqr-card-password');
    if (iconEl) iconEl.textContent = theme.icon;
    if (headingEl) headingEl.textContent = customHeading || theme.heading;
    if (instrEl) instrEl.textContent = theme.instruction;
    if (networkEl) networkEl.innerHTML = ssid ? `Network: <strong>${esc(ssid)}</strong>` : 'Network: <strong>—</strong>';
    if (passEl) {
      if (pass && showPassOnCard) {
        passEl.innerHTML = `Password: <strong>${esc(pass)}</strong>`;
        passEl.style.display = '';
      } else if (pass && !showPassOnCard) {
        passEl.innerHTML = 'Password: <strong>••••••••</strong>';
        passEl.style.display = '';
      } else {
        passEl.style.display = 'none';
      }
    }

    // Generate QR
    const qrBox = $('#wifiqr-card-qr');
    if (!qrBox) return;

    if (!data) {
      qrBox.innerHTML = '<div style="color:rgba(0,0,0,0.3); font-size:0.85rem; padding:2rem">Enter your WiFi details</div>';
      qrInstance = null;
      return;
    }

    qrBox.innerHTML = '';
    qrInstance = new QRCodeStyling({
      width: 180,
      height: 180,
      type: 'canvas',
      data: data,
      dotsOptions: { color: theme.qrFg, type: 'rounded' },
      cornersSquareOptions: { color: theme.qrFg, type: 'extra-rounded' },
      cornersDotOptions: { color: theme.qrFg, type: 'dot' },
      backgroundOptions: { color: theme.qrBg },
      qrOptions: { errorCorrectionLevel: 'Q' }
    });
    qrInstance.append(qrBox);
  }

  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  /* ── Listen to inputs ── */
  ['#wifiqr-ssid', '#wifiqr-pass', '#wifiqr-custom-heading'].forEach(sel => {
    const el = $(sel);
    if (el) el.addEventListener('input', debouncedUpdate);
  });
  ['#wifiqr-enc', '#wifiqr-hidden', '#wifiqr-show-pass-on-card', '#wifiqr-layout', '#wifiqr-border'].forEach(sel => {
    const el = $(sel);
    if (el) el.addEventListener('change', debouncedUpdate);
  });

  /* ── Custom background colour ── */
  const bgEnable = $('#wifiqr-custom-bg-enable');
  const bgPicker = $('#wifiqr-custom-bg');
  const bgHex = $('#wifiqr-custom-bg-hex');
  if (bgEnable) {
    bgEnable.addEventListener('change', () => {
      const on = bgEnable.checked;
      if (bgPicker) bgPicker.disabled = !on;
      if (bgHex) bgHex.disabled = !on;
      debouncedUpdate();
    });
  }
  if (bgPicker && bgHex) {
    bgPicker.addEventListener('input', () => { bgHex.value = bgPicker.value; debouncedUpdate(); });
    bgHex.addEventListener('input', () => {
      if (/^#[0-9a-fA-F]{6}$/.test(bgHex.value)) { bgPicker.value = bgHex.value; debouncedUpdate(); }
    });
  }

  /* ── Print ── */
  $('#wifiqr-print')?.addEventListener('click', () => {
    if (!getWifiData()) { toast('Enter WiFi details first'); return; }
    window.print();
  });

  /* ── Print 4-up ── */
  $('#wifiqr-print-multi')?.addEventListener('click', () => {
    if (!getWifiData()) { toast('Enter WiFi details first'); return; }
    const card = $('#wifiqr-card');
    if (!card) return;
    // Create print window with 4 copies
    const w = window.open('', '_blank');
    const cardHtml = card.outerHTML;
    const styles = document.querySelector('link[href*="wifi-qr.css"]');
    const styleHref = styles ? styles.href : '';
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>WiFi Cards — 4-up Print</title>
      <link rel="stylesheet" href="${styleHref}">
      <style>
        body { margin: 0; padding: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background: #fff; }
        .wifiqr-card { break-inside: avoid; min-height: auto !important; }
        @media print {
          body { padding: 0.5cm; gap: 0.5cm; }
          .wifiqr-card, .wifiqr-card * { visibility: visible !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style></head><body>
      ${cardHtml}${cardHtml}${cardHtml}${cardHtml}
    </body></html>`);
    w.document.close();
    setTimeout(() => { w.print(); }, 500);
  });

  /* ── Download full card as PNG via html2canvas ── */
  $('#wifiqr-download-card')?.addEventListener('click', async () => {
    if (!getWifiData()) { toast('Enter WiFi details first'); return; }
    const card = $('#wifiqr-card');
    if (!card || typeof html2canvas === 'undefined') {
      toast('Card capture not available — downloading QR only');
      if (qrInstance) qrInstance.download({ name: 'wifi-qr-code', extension: 'png' });
      return;
    }
    toast('Capturing card...');
    try {
      const canvas = await html2canvas(card, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false
      });
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'wifi-card.png';
      a.click();
      toast('Card downloaded!');
    } catch (e) {
      toast('Capture failed — downloading QR only');
      if (qrInstance) qrInstance.download({ name: 'wifi-qr-code', extension: 'png' });
    }
  });

  /* ── Download QR only ── */
  $('#wifiqr-download')?.addEventListener('click', async () => {
    if (!qrInstance) { toast('Enter WiFi details first'); return; }
    qrInstance.download({ name: 'wifi-qr-code', extension: 'png' });
    toast('QR code downloaded!');
  });

  /* ── Share (no password in URL) ── */
  $('#wifiqr-share')?.addEventListener('click', () => {
    const ssid = ($('#wifiqr-ssid') || {}).value || '';
    const params = new URLSearchParams();
    if (ssid) params.set('ssid', ssid);
    params.set('theme', currentTheme);
    const heading = ($('#wifiqr-custom-heading') || {}).value || '';
    if (heading) params.set('heading', heading);
    // Password intentionally omitted
    const url = window.location.origin + window.location.pathname + '?' + params.toString();
    navigator.clipboard.writeText(url)
      .then(() => toast('Share link copied! (password not included for security)'))
      .catch(() => toast('Could not copy link'));
  });

  /* ── Load from URL ── */
  function loadFromURL() {
    const p = new URLSearchParams(window.location.search);
    if (p.has('ssid') && $('#wifiqr-ssid')) $('#wifiqr-ssid').value = p.get('ssid');
    if (p.has('heading') && $('#wifiqr-custom-heading')) $('#wifiqr-custom-heading').value = p.get('heading');
    if (p.has('theme') && THEMES[p.get('theme')]) {
      const btn = $(`.wifiqr-template-btn[data-theme="${p.get('theme')}"]`);
      if (btn) btn.click();
    }
  }

  /* ── Toast ── */
  function toast(msg) {
    const existing = document.querySelector('.wifiqr-toast');
    if (existing) existing.remove();
    const el = document.createElement('div');
    el.className = 'wifiqr-toast';
    el.textContent = msg;
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.style.cssText = 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:#22D3EE;color:#0f172a;padding:0.6rem 1.5rem;border-radius:8px;font-size:0.85rem;font-weight:600;z-index:9999;';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }

  /* ── Init ── */
  loadFromURL();
  // Pre-fill example so users see a beautiful card immediately
  const p = new URLSearchParams(window.location.search);
  if (!p.has('ssid')) {
    if ($('#wifiqr-ssid') && !$('#wifiqr-ssid').value) $('#wifiqr-ssid').value = 'MyWiFi';
    if ($('#wifiqr-pass') && !$('#wifiqr-pass').value) $('#wifiqr-pass').value = 'MyPassword123';
  }
  updateCard();

})();
