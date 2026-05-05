// ═══════════════════════════════════════════════════════════════════════════
// COSMOS NAV — Browse popover behaviour (5 May 2026)
// ─────────────────────────────────────────────────────────────────────────
// Handles open/close + keyboard for the "Browse ▾" popover in nav.html.
// Defensive: no-op if elements missing. Doesn't touch existing $_ palette
// or hamburger drawer JS — those run independently from switcher.js and
// bb-palette.js. Single-overlay arbitration is light-touch:
//   - Opening Browse closes the mobile drawer (browse is desktop, drawer is
//     mobile, but defensive in case of split breakpoints)
//   - Pressing `/` or Cmd+K closes Browse (the palette JS will then open
//     itself as usual)
// ═══════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var trigger = document.getElementById('nav-browse-trigger');
    var panel = document.getElementById('nav-browse-panel');
    if (!trigger || !panel) return;

    function isOpen() {
      return panel.dataset.open === 'true';
    }

    function open() {
      // Close mobile drawer if open (defensive — browse is desktop only via CSS)
      var drawer = document.getElementById('nav-drawer');
      var hamburger = document.getElementById('hamburger-btn');
      if (drawer && drawer.classList.contains('open') && hamburger) {
        hamburger.click();
      }
      panel.dataset.open = 'true';
      trigger.setAttribute('aria-expanded', 'true');
    }

    function close(returnFocus) {
      panel.dataset.open = 'false';
      trigger.setAttribute('aria-expanded', 'false');
      if (returnFocus) trigger.focus();
    }

    // Click on trigger toggles
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      isOpen() ? close() : open();
    });

    // Keyboard on trigger: Space + Enter
    trigger.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        isOpen() ? close() : open();
      }
    });

    // Click outside closes
    document.addEventListener('click', function (e) {
      if (isOpen() && !panel.contains(e.target) && e.target !== trigger) {
        close();
      }
    });

    // Click any link inside closes
    panel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { close(); });
    });

    // Tab away from last link closes (focus moves to next nav element)
    var links = panel.querySelectorAll('a');
    if (links.length) {
      var last = links[links.length - 1];
      last.addEventListener('keydown', function (e) {
        if (e.key === 'Tab' && !e.shiftKey) {
          close();
        }
      });
    }

    // Esc closes + return focus to trigger
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) {
        close(true);
      }
    });

    // Defensive overlay arbitration: `/` or Cmd+K closes Browse
    // (palette JS will then open itself). Match the same conditions
    // bb-palette.js uses to avoid closing when user is typing.
    document.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      var ae = document.activeElement;
      var typing = ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable);
      if (typing) return;
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        close();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        close();
        return;
      }
    });
  });
})();
