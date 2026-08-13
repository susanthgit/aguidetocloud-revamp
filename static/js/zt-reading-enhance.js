/* ═══════════════════════════════════════════════════════════
   🌸 ZEN READING ENHANCEMENTS — Blog-only interactive features
   Z21: Table containers
   Z22: Font size controls (14/16/18px)
   Z23: Kindle warm tint toggle
   Z24: Focus mode toggle
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reading = document.querySelector('.zt-reading');
  if (!reading) return;

  var body = reading.querySelector('.zt-reading-body');

  /* ── Z21: Wrap tables in scroll containers ── */
  if (body) {
    var tables = body.querySelectorAll(':scope > table');
    tables.forEach(function (table) {
      var wrapper = document.createElement('div');
      wrapper.className = 'zt-table-wrap';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);

      /* Mobile stacks each row into a card and hides <thead> entirely.
         That's fine for 2-column tables (col 1 already reads as the
         row's own label) but for 3+ column comparison tables the
         reader has no idea which column a value came from. Copy each
         header's text onto a data-label attribute on the matching
         body cells (skip column 1 — it's already styled as the row
         label) so CSS can show "COLUMN NAME" above each value on
         narrow screens. */
      var headerCells = table.querySelectorAll('thead th');
      if (headerCells.length > 1) {
        var headerText = Array.prototype.map.call(headerCells, function (th) {
          return th.textContent.trim();
        });
        table.querySelectorAll('tbody tr').forEach(function (tr) {
          var cells = tr.children;
          for (var i = 1; i < cells.length && i < headerText.length; i++) {
            if (headerText[i]) cells[i].setAttribute('data-label', headerText[i]);
          }
        });
      }
    });
  }

  /* ── Z22: Font size controls ── */
  var SIZES = [14, 16, 18];
  var fontBtns = reading.querySelectorAll('[data-fontsize]');
  var savedSize = localStorage.getItem('zt-reading-font-size');
  var currentSize = savedSize && SIZES.indexOf(parseInt(savedSize, 10)) !== -1
    ? parseInt(savedSize, 10) : 16;

  function applyFontSize(size) {
    currentSize = size;
    reading.style.setProperty('--reading-font-size', size + 'px');
    fontBtns.forEach(function (btn) {
      btn.classList.toggle('is-active', parseInt(btn.dataset.fontsize, 10) === size);
    });
    if (size === 16) {
      localStorage.removeItem('zt-reading-font-size');
    } else {
      localStorage.setItem('zt-reading-font-size', String(size));
    }
  }

  fontBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyFontSize(parseInt(this.dataset.fontsize, 10));
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
