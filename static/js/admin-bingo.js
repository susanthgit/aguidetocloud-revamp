/* ============================================================================
   IT Admin Bingo — admin-bingo.js
   100% client-side, zero API calls
   ============================================================================ */
(function () {
  'use strict';

  const ALL_SQUARES = window.__bingoSquares || [];
  const BOARD_SIZE = 5;
  const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE;
  const FREE_INDEX = 12; // center of 5x5

  let board = [];
  let marked = new Set();
  let currentSeed = null;
  let bingoFound = false;

  // ── Seeded RNG (mulberry32) ──────────────────────────────────────────────
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function seedFromString(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    }
    return h;
  }

  // ── Shuffle with seeded RNG ──────────────────────────────────────────────
  function shuffle(arr, rng) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ── Theme packs ──────────────────────────────────────────────────────────
  const THEMES = {
    all: { label: 'All', tags: null },
    meetings: { label: 'Meeting Madness', tags: ['m365', 'helpdesk'] },
    security: { label: 'Security Nightmare', tags: ['security'] },
    copilot: { label: 'Copilot Chaos', tags: ['ai'] },
    outage: { label: 'Outage Bingo', tags: ['incidents', 'network'] }
  };
  let activeTheme = 'all';

  // ── Filter squares by tag ────────────────────────────────────────────────
  function getFilteredSquares() {
    const tag = document.getElementById('tag-filter').value;
    const theme = THEMES[activeTheme];
    let pool = ALL_SQUARES;

    // Theme filter first
    if (theme && theme.tags) {
      pool = pool.filter(s => s.tags && s.tags.some(t => theme.tags.includes(t)));
    }
    // Then category dropdown
    if (tag !== 'all') {
      pool = pool.filter(s => s.tags && s.tags.includes(tag));
    }
    return pool;
  }

  // ── Generate board ───────────────────────────────────────────────────────
  function generateBoard(seed) {
    const filtered = getFilteredSquares();
    if (filtered.length < TOTAL_CELLS - 1) {
      alert('Not enough scenarios for this category. Try "All Categories".');
      return;
    }
    currentSeed = seed || Math.random().toString(36).slice(2, 10);
    const rng = mulberry32(seedFromString(currentSeed + '_v1'));
    const shuffled = shuffle(filtered, rng).slice(0, TOTAL_CELLS - 1);

    board = [];
    let si = 0;
    for (let i = 0; i < TOTAL_CELLS; i++) {
      if (i === FREE_INDEX) {
        board.push({ id: '__free__', text: '⭐ FREE SPACE', free: true });
      } else {
        board.push(shuffled[si++]);
      }
    }

    marked = new Set([FREE_INDEX]);
    bingoFound = false;
    renderBoard();
    updateScore();
    hideStatus();
    updateURL();
  }

  // ── Render board ─────────────────────────────────────────────────────────
  function renderBoard() {
    const el = document.getElementById('bingo-board');
    el.innerHTML = '';
    board.forEach((sq, i) => {
      const cell = document.createElement('div');
      cell.className = 'bingo-cell';
      cell.textContent = sq.text;
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-label', sq.text);
      cell.dataset.index = i;

      if (sq.free) {
        cell.classList.add('free-space', 'marked');
      }
      if (marked.has(i)) {
        cell.classList.add('marked');
      }
      el.appendChild(cell);
    });
  }

  // Event delegation for cell clicks (avoids listener leak on regenerate)
  document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('bingo-board');
    if (board) {
      board.addEventListener('click', (e) => {
        const cell = e.target.closest('.bingo-cell');
        if (!cell || cell.classList.contains('free-space')) return;
        const index = parseInt(cell.dataset.index, 10);
        if (!isNaN(index)) toggleCell(index);
      });
    }
  });

  // ── Toggle cell ──────────────────────────────────────────────────────────
  function toggleCell(index) {
    if (board[index].free) return;
    const cell = document.querySelector(`[data-index="${index}"]`);
    if (marked.has(index)) {
      marked.delete(index);
      cell.classList.remove('marked');
    } else {
      marked.add(index);
      cell.classList.add('marked');
    }
    updateScore();
    checkBingo();
  }

  // ── Check for bingo ──────────────────────────────────────────────────────
  function checkBingo() {
    if (bingoFound) return;
    const lines = [];
    // rows
    for (let r = 0; r < 5; r++) {
      lines.push([r*5, r*5+1, r*5+2, r*5+3, r*5+4]);
    }
    // cols
    for (let c = 0; c < 5; c++) {
      lines.push([c, c+5, c+10, c+15, c+20]);
    }
    // diagonals
    lines.push([0, 6, 12, 18, 24]);
    lines.push([4, 8, 12, 16, 20]);

    for (const line of lines) {
      if (line.every(i => marked.has(i))) {
        bingoFound = true;
        line.forEach(i => {
          const cell = document.querySelector(`[data-index="${i}"]`);
          if (cell) cell.classList.add('bingo-winner');
        });
        showStatus('🎉 BINGO! You win! Share your card to prove it.', 'win');
        launchConfetti();
        return;
      }
    }
  }

  // ── Score ────────────────────────────────────────────────────────────────
  function updateScore() {
    const m = marked.size - 1; // exclude free space
    document.getElementById('score-marked').textContent = m;
    document.getElementById('score-remaining').textContent = 24 - m;
  }

  // ── Status ───────────────────────────────────────────────────────────────
  function showStatus(text, type) {
    const el = document.getElementById('bingo-status');
    el.textContent = text;
    el.className = 'bingo-status show ' + (type || '');
  }
  function hideStatus() {
    document.getElementById('bingo-status').className = 'bingo-status';
  }

  // ── URL state ────────────────────────────────────────────────────────────
  function updateURL() {
    if (!currentSeed) return;
    const url = new URL(window.location);
    url.searchParams.set('card', currentSeed);
    history.replaceState(null, '', url);
  }

  function loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    const card = params.get('card');
    if (card && card.length <= 100) {
      generateBoard(card);
    } else {
      generateBoard();
    }
  }

  // ── Daily card ───────────────────────────────────────────────────────────
  function dailyCard() {
    const today = new Date().toISOString().slice(0, 10);
    generateBoard('daily-' + today);
  }

  // ── Share ────────────────────────────────────────────────────────────────
  function shareCard() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: 'IT Admin Bingo', text: bingoFound ? '🎉 I got BINGO!' : 'Can you beat my IT Admin Bingo card?', url });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => showStatus('📋 Card link copied!', ''));
    }
  }

  // ── Confetti ──────────────────────────────────────────────────────────────
  function launchConfetti() {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) { canvas.remove(); return; }
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#E91E8E', '#FF6B9D', '#C084FC', '#FCD34D', '#34D399', '#60A5FA', '#FB923C'];
    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      w: 6 + Math.random() * 6,
      h: 4 + Math.random() * 4,
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      gravity: 0.1 + Math.random() * 0.05
    }));

    let frame = 0;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      pieces.forEach(p => {
        p.x += p.vx;
        p.vy += p.gravity;
        p.y += p.vy;
        p.rot += p.rotV;
        if (p.y < canvas.height + 50) alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      frame++;
      if (alive && frame < 300) requestAnimationFrame(animate);
      else canvas.remove();
    }
    animate();
  }

  // ── Tab switching ────────────────────────────────────────────────────────
  function initTabs() {
    document.querySelectorAll('.bingo-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.bingo-tab').forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        document.querySelectorAll('.bingo-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        const panel = document.getElementById('panel-' + tab.dataset.tab);
        if (panel) panel.classList.add('active');
      });
    });
  }

  // ── Weekly card ──────────────────────────────────────────────────────────
  function weeklyCard() {
    const d = new Date();
    const week = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / 604800000);
    generateBoard('weekly-' + d.getFullYear() + '-w' + week);
  }

  // ── Init ─────────────────────────────────────────────────────────────────
  function init() {
    initTabs();
    loadFromURL();

    document.getElementById('btn-new-game').addEventListener('click', () => generateBoard());
    document.getElementById('btn-daily').addEventListener('click', dailyCard);
    document.getElementById('btn-weekly').addEventListener('click', weeklyCard);
    document.getElementById('btn-share').addEventListener('click', shareCard);
    document.getElementById('tag-filter').addEventListener('change', () => generateBoard());

    // Theme buttons
    document.querySelectorAll('.bingo-theme').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.bingo-theme').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeTheme = btn.dataset.theme;
        generateBoard();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
