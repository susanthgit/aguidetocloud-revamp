/* ═══════════════════════════════════════════════════════════
   🌸 ZEN READING ENHANCEMENTS — Blog-only interactive features
   Z22: Font size controls (14/16/18px)
   Z23: Kindle warm tint toggle
   Z24: Focus mode toggle
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reading = document.querySelector('.zt-reading');
  if (!reading) return;

  /* ── Z22: Font size controls ──
     Pixel values live in CSS (zt-notebook.css), NOT here. This used to
     write `--reading-font-size: 16px` as an inline style, which beat
     every stylesheet rule and made any CSS-side size change a silent
     no-op. It now sets a semantic state only, which also allows the
     default to be responsive (20px desktop / 19px mobile). */
  var STATES = ['s', 'm', 'l'];
  var fontBtns = reading.querySelectorAll('[data-fontsize]');
  var savedSize = localStorage.getItem('zt-reading-size');
  if (STATES.indexOf(savedSize) === -1) {
    // migrate the pre-Aug-2026 numeric key (14/16/18); 16 was never stored
    var legacy = localStorage.getItem('zt-reading-font-size');
    savedSize = legacy === '14' ? 's' : (legacy === '18' ? 'l' : 'm');
    if (legacy) localStorage.removeItem('zt-reading-font-size');
  }
  var currentSize = savedSize;

  function applyFontSize(size) {
    if (STATES.indexOf(size) === -1) size = 'm';
    currentSize = size;
    if (size === 'm') {
      reading.removeAttribute('data-reading-size');
      localStorage.removeItem('zt-reading-size');
    } else {
      reading.setAttribute('data-reading-size', size);
      localStorage.setItem('zt-reading-size', size);
    }
    fontBtns.forEach(function (btn) {
      btn.classList.toggle('is-active', btn.dataset.fontsize === size);
    });
  }

  fontBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyFontSize(this.dataset.fontsize);
    });
  });

  // Apply saved size on load (supplement inline flash-prevention)
  applyFontSize(currentSize);

  /* ── Z23: Warm tint toggle ── */
  var warmBtn = reading.querySelector('.zt-warm-toggle');
  var isWarm = localStorage.getItem('zt-reading-warm') === '1';

  function applyWarm(warm) {
    isWarm = warm;
    reading.classList.toggle('zt-reading--warm', warm);
    if (warmBtn) warmBtn.classList.toggle('is-active', warm);
    localStorage.setItem('zt-reading-warm', warm ? '1' : '0');
  }

  if (warmBtn) {
    warmBtn.addEventListener('click', function () {
      applyWarm(!isWarm);
    });
  }

  // Apply saved state
  applyWarm(isWarm);

  /* ── Z24: Focus mode toggle ── */
  var focusBtn = reading.querySelector('.zt-focus-toggle');
  var isFocused = localStorage.getItem('zt-reading-focus') === '1';

  function applyFocus(focused) {
    isFocused = focused;
    reading.classList.toggle('zt-reading--focused', focused);
    if (focusBtn) focusBtn.classList.toggle('is-active', focused);
    localStorage.setItem('zt-reading-focus', focused ? '1' : '0');
  }

  if (focusBtn) {
    focusBtn.addEventListener('click', function () {
      applyFocus(!isFocused);
    });
  }

  // Apply saved state
  applyFocus(isFocused);
})();
