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
    home:   { icon: '📶', heading: 'WiFi Password', qrFg: '#1e293b', qrBg: '#ffffff' },
    cafe:   { icon: '☕', heading: 'Free WiFi', qrFg: '#451a03', qrBg: '#fef3c7' },
    hotel:  { icon: '🏨', heading: 'Guest WiFi', qrFg: '#312e81', qrBg: '#ffffff' },
    office: { icon: '🏢', heading: 'Office WiFi', qrFg: '#1e293b', qrBg: '#ffffff' }
  };

  let currentTheme = 'home';
  let qrInstance = null;

  /* ── Theme switching ── */
  $$('.wifiqr-template-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.wifiqr-template-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTheme = btn.dataset.theme;
      const card = $('#wifiqr-card');
      if (card) {
        card.className = 'wifiqr-card theme-' + currentTheme;
      }
      updateCard();
    });
  });

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
    const theme = THEMES[currentTheme] || THEMES.home;
    const customHeading = ($('#wifiqr-custom-heading') || {}).value || '';

    // Update card text
    const iconEl = $('#wifiqr-card-icon');
    const headingEl = $('#wifiqr-card-heading');
    const networkEl = $('#wifiqr-card-network');
    if (iconEl) iconEl.textContent = theme.icon;
    if (headingEl) headingEl.textContent = customHeading || theme.heading;
    if (networkEl) networkEl.innerHTML = ssid ? `Network: <strong>${esc(ssid)}</strong>` : 'Network: <strong>—</strong>';

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
      type: 'svg',
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
  ['#wifiqr-enc', '#wifiqr-hidden'].forEach(sel => {
    const el = $(sel);
    if (el) el.addEventListener('change', debouncedUpdate);
  });

  /* ── Print ── */
  $('#wifiqr-print')?.addEventListener('click', () => {
    if (!getWifiData()) { toast('Enter WiFi details first'); return; }
    window.print();
  });

  /* ── Download PNG ── */
  $('#wifiqr-download')?.addEventListener('click', async () => {
    if (!qrInstance) { toast('Enter WiFi details first'); return; }
    // Use html2canvas-style approach: capture the card via canvas
    // Fallback: download just the QR
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
  updateCard();

})();
