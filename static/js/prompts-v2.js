document.addEventListener('DOMContentLoaded', function () {
  var activeFilter = 'all';
  var chips = document.querySelectorAll('.prompts-chip');
  var rows = document.querySelectorAll('.prompt-row');
  var groups = document.querySelectorAll('.prompts-category-group');
  var emptyEl = document.getElementById('prompts-empty');

  // ── PLATFORM FILTER ────────────────────────
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('active'); });
      this.classList.add('active');
      activeFilter = this.dataset.filterValue;
      filterRows();
    });
  });

  function filterRows() {
    var totalVisible = 0;

    // Filter individual rows
    rows.forEach(function (row) {
      if (activeFilter === 'all') {
        row.style.display = '';
        totalVisible++;
      } else {
        var platforms = (row.dataset.platforms || '').split(' ');
        var show = platforms.indexOf(activeFilter) !== -1;
        row.style.display = show ? '' : 'none';
        if (show) totalVisible++;
      }
    });

    // Hide empty category groups
    groups.forEach(function (group) {
      var visibleInGroup = group.querySelectorAll('.prompt-row:not([style*="display: none"])').length;
      // Also check rows without explicit style (visible by default)
      if (activeFilter === 'all') {
        group.style.display = '';
      } else {
        var hasVisible = false;
        group.querySelectorAll('.prompt-row').forEach(function (r) {
          if (r.style.display !== 'none') hasVisible = true;
        });
        group.style.display = hasVisible ? '' : 'none';
      }
    });

    if (emptyEl) emptyEl.style.display = totalVisible === 0 ? '' : 'none';
  }

  // ── ACCORDION TOGGLE ──────────────────────
  document.addEventListener('click', function (e) {
    // Copy button
    var copyBtn = e.target.closest('.prompt-copy-btn, .prompt-full-copy');
    if (copyBtn) {
      e.preventDefault();
      e.stopPropagation();
      var text = copyBtn.dataset.prompt;
      if (!text) return;
      navigator.clipboard.writeText(text).then(function () {
        copyBtn.textContent = '✅ Copied!';
        copyBtn.classList.add('copied');
        setTimeout(function () { copyBtn.textContent = '📋 Copy'; copyBtn.classList.remove('copied'); }, 2000);
      }).catch(function () {
        var ta = document.createElement('textarea');
        ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
        copyBtn.textContent = '✅ Copied!';
        setTimeout(function () { copyBtn.textContent = '📋 Copy'; }, 2000);
      });
      return;
    }

    // Accordion row toggle
    var rowHeader = e.target.closest('.prompt-row-header');
    if (rowHeader && !e.target.closest('a')) {
      var row = rowHeader.closest('.prompt-row');
      var body = row.querySelector('.prompt-row-body');
      var arrow = rowHeader.querySelector('.prompt-row-arrow');
      var isOpen = !body.hidden;
      body.hidden = isOpen;
      arrow.textContent = isOpen ? '▸' : '▾';
      rowHeader.setAttribute('aria-expanded', !isOpen);
    }
  });
});
