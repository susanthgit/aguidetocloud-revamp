/* admin-badges.js — IT Admin Achievement Badges tool
   100% client-side, zero dependencies, zero API calls */
(function () {
  'use strict';

  /* ── XSS helper ─────────────────────────────────────────── */
  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  }

  /* ── Seeded RNG (mulberry32) ────────────────────────────── */
  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /* ── Safe localStorage ──────────────────────────────────── */
  function safeGet(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) { return fallback; }
  }
  function safeSet(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) { /* private mode */ }
  }

  /* ── Data refs ──────────────────────────────────────────── */
  var badges = window.__badges || [];
  var categories = window.__badgeCategories || [];
  var rarities = window.__badgeRarities || [];

  var catMap = {};
  categories.forEach(function (c) { catMap[c.id] = c; });
  var rarMap = {};
  rarities.forEach(function (r) { rarMap[r.id] = r; });

  var STORE_KEY = 'badges_earned';
  var STORIES_KEY = 'badges_stories';
  var activeFilter = 'all';

  /* ── Earned state helpers ───────────────────────────────── */
  function getEarned() { return safeGet(STORE_KEY, []); }
  function setEarned(arr) { safeSet(STORE_KEY, arr); }

  function isEarned(id) {
    return getEarned().indexOf(id) !== -1;
  }

  function toggleBadge(id) {
    var earned = getEarned();
    var idx = earned.indexOf(id);
    if (idx !== -1) {
      if (!confirm('Remove this badge?')) return;
      earned.splice(idx, 1);
    } else {
      earned.push(id);
    }
    setEarned(earned);
    renderAllBadges(activeFilter);
    renderBadgeWall();
  }

  /* ── Tab switching ──────────────────────────────────────── */
  function initTabs(ns) {
    var tabs = document.querySelectorAll('.' + ns + '-tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.getAttribute('data-tab');
        tabs.forEach(function (t) {
          var active = t.getAttribute('data-tab') === target;
          t.classList.toggle('active', active);
          t.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        document.querySelectorAll('.' + ns + '-panel').forEach(function (p) {
          p.classList.toggle('active', p.id === 'panel-' + target);
        });
      });
    });
  }

  /* ── Daily challenge ────────────────────────────────────── */
  function getDailyChallenge() {
    var earned = getEarned();
    var unearned = badges.filter(function (b) { return earned.indexOf(b.id) === -1; });
    if (!unearned.length) return null;

    var dateSeed = parseInt(new Date().toISOString().slice(0, 10).replace(/-/g, ''), 10);
    var rng = mulberry32(dateSeed);
    var pick = Math.floor(rng() * unearned.length);
    return unearned[pick];
  }

  function renderDailyChallenge(container) {
    var challenge = getDailyChallenge();
    if (!challenge) {
      container.innerHTML = '<div class="badges-daily badges-daily--done">' +
        '<span class="badges-daily-emoji">🏆</span>' +
        '<div><strong>All badges earned!</strong><br><small>You\'ve collected every badge. Legend.</small></div>' +
        '</div>';
      return;
    }
    var rar = rarMap[challenge.rarity] || { label: '?', color: '#888' };
    var cat = catMap[challenge.category] || { name: '?', emoji: '❓' };
    container.innerHTML =
      '<div class="badges-daily">' +
        '<span class="badges-daily-label">Today\'s Challenge</span>' +
        '<div class="badges-daily-card">' +
          '<span class="badges-daily-emoji">' + esc(challenge.emoji) + '</span>' +
          '<div class="badges-daily-info">' +
            '<strong>' + esc(challenge.name) + '</strong>' +
            '<small>' + esc(challenge.desc) + '</small>' +
            '<span class="badges-rarity-badge" style="background:' + esc(rar.color) + '">' + esc(rar.label) + '</span> ' +
            '<span class="badges-cat-label">' + esc(cat.emoji) + ' ' + esc(cat.name) + '</span>' +
          '</div>' +
          '<button class="badges-earn-btn" data-id="' + esc(challenge.id) + '">Earn it</button>' +
        '</div>' +
      '</div>';

    var btn = container.querySelector('.badges-earn-btn');
    if (btn) {
      btn.addEventListener('click', function () {
        toggleBadge(challenge.id);
        renderDailyChallenge(container);
      });
    }
  }

  /* ── Share individual badge as PNG ────────────────────────── */
  function shareBadge(id) {
    var b = badges.find(function(x) { return x.id === id; });
    if (!b) return;
    var rar = rarMap[b.rarity] || { label: '?', color: '#888' };

    var W = 600, H = 400;
    var canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#030308';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, W - 32, H - 32);

    ctx.textAlign = 'center';
    ctx.font = '80px serif';
    ctx.fillText(b.emoji, W / 2, 120);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Inter, system-ui, sans-serif';
    ctx.fillText(b.name, W / 2, 175);

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '16px Inter, system-ui, sans-serif';
    var desc = b.desc.length > 60 ? b.desc.slice(0, 57) + '\u2026' : b.desc;
    ctx.fillText(desc, W / 2, 210);

    // Rarity pill
    ctx.fillStyle = rar.color;
    ctx.font = 'bold 14px Inter, system-ui, sans-serif';
    var rarText = rar.label.toUpperCase();
    var tw = ctx.measureText(rarText).width;
    var px = W / 2 - tw / 2 - 12;
    ctx.beginPath();
    ctx.roundRect(px, 230, tw + 24, 28, 14);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.fillText(rarText, W / 2, 250);

    // Earned by
    var stories = safeGet(STORIES_KEY, {});
    var username = stories._username || 'an IT Admin';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '14px Inter, system-ui, sans-serif';
    ctx.fillText('Earned by ' + username, W / 2, 300);

    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.fillText('aguidetocloud.com/admin-badges', W / 2, H - 24);

    canvas.toBlob(function(blob) {
      if (!blob) return;
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'badge-' + id + '.png';
      a.click();
      setTimeout(function() { URL.revokeObjectURL(url); }, 5000);
    }, 'image/png');
  }

  /* ── Suggested next badge ──────────────────────────────── */
  function getSuggestedBadge() {
    var earned = getEarned();
    if (earned.length >= badges.length) return null;

    // Count earned per category
    var catCount = {};
    earned.forEach(function(id) {
      var b = badges.find(function(x) { return x.id === id; });
      if (b) catCount[b.category] = (catCount[b.category] || 0) + 1;
    });

    // Sort categories by most earned
    var catsSorted = Object.keys(catCount).sort(function(a, b) { return catCount[b] - catCount[a]; });

    // Rarity order
    var rarOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

    // Try each category (most earned first), find lowest rarity un-earned
    for (var c = 0; c < catsSorted.length; c++) {
      var unearned = badges.filter(function(b) {
        return b.category === catsSorted[c] && earned.indexOf(b.id) === -1;
      });
      if (!unearned.length) continue;
      unearned.sort(function(a, b) {
        return rarOrder.indexOf(a.rarity) - rarOrder.indexOf(b.rarity);
      });
      return unearned[0];
    }

    // Fallback: any un-earned badge, lowest rarity
    var all = badges.filter(function(b) { return earned.indexOf(b.id) === -1; });
    all.sort(function(a, b) { return rarOrder.indexOf(a.rarity) - rarOrder.indexOf(b.rarity); });
    return all[0] || null;
  }

  function renderSuggested() {
    var slot = document.getElementById('badges-suggested-slot');
    if (!slot) {
      var filterBar = document.querySelector('.badges-filter-bar');
      if (filterBar) {
        slot = document.createElement('div');
        slot.id = 'badges-suggested-slot';
        filterBar.parentNode.insertBefore(slot, filterBar);
      }
    }
    if (!slot) return;

    var badge = getSuggestedBadge();
    if (!badge) { slot.innerHTML = ''; return; }
    var rar = rarMap[badge.rarity] || { label: '?', color: '#888' };
    slot.innerHTML = '<div class="badges-suggested">' +
      '\uD83C\uDFAF <strong>Next up:</strong> ' + esc(badge.emoji) + ' ' + esc(badge.name) +
      ' \u2014 ' + esc(badge.desc) +
      ' <span class="badges-rarity-badge" style="background:' + esc(rar.color) + ';margin-left:0.5rem;">' + esc(rar.label) + '</span>' +
    '</div>';
  }

  /* ── Badge card HTML ────────────────────────────────────── */
  function badgeCard(b, earned) {
    var rar = rarMap[b.rarity] || { label: '?', color: '#888' };
    var cat = catMap[b.category] || { name: '?', emoji: '❓', color: '#666' };
    var cls = 'badges-card' + (earned ? ' earned' : ' locked');
    var shareHtml = earned ? '<button class="badges-share-btn" data-id="' + esc(b.id) + '" aria-label="Share badge">\uD83D\uDCE4</button>' : '';
    return '<div class="' + cls + '" data-id="' + esc(b.id) + '" role="button" tabindex="0"' +
      ' aria-label="' + esc(b.name) + (earned ? ' (earned)' : ' (locked)') + '">' +
      shareHtml +
      '<span class="badges-emoji">' + esc(b.emoji) + '</span>' +
      '<strong class="badges-name">' + esc(b.name) + '</strong>' +
      '<small class="badges-desc">' + esc(b.desc) + '</small>' +
      '<div class="badges-card-meta">' +
        '<span class="badges-rarity-badge" style="background:' + esc(rar.color) + '">' + esc(rar.label) + '</span>' +
        '<span class="badges-cat-pill" style="border-color:' + esc(cat.color) + '">' +
          esc(cat.emoji) + ' ' + esc(cat.name) +
        '</span>' +
      '</div>' +
    '</div>';
  }

  /* ── Render All Badges grid ─────────────────────────────── */
  function renderAllBadges(filter) {
    activeFilter = filter || 'all';
    var grid = document.getElementById('all-badges-grid');
    if (!grid) return;

    var earned = getEarned();
    var filtered = badges.filter(function (b) {
      return activeFilter === 'all' || b.category === activeFilter;
    });

    // Sort: earned first, then by category
    filtered.sort(function (a, b) {
      var aE = earned.indexOf(a.id) !== -1 ? 0 : 1;
      var bE = earned.indexOf(b.id) !== -1 ? 0 : 1;
      if (aE !== bE) return aE - bE;
      if (a.category < b.category) return -1;
      if (a.category > b.category) return 1;
      return 0;
    });

    var html = '';
    filtered.forEach(function (b) {
      html += badgeCard(b, earned.indexOf(b.id) !== -1);
    });

    if (!filtered.length) {
      html = '<p class="badges-empty">No badges in this category.</p>';
    }

    grid.innerHTML = html;
    renderSuggested();

    // Update filter button active states
    document.querySelectorAll('.badges-filter').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-cat') === activeFilter);
    });
  }

  /* ── Render My Badge Wall ───────────────────────────────── */
  function renderBadgeWall() {
    var wall = document.getElementById('badge-wall');
    var counter = document.getElementById('badge-counter');
    if (!wall) return;

    var earned = getEarned();
    var earnedBadges = badges.filter(function (b) {
      return earned.indexOf(b.id) !== -1;
    });

    if (counter) {
      counter.textContent = earnedBadges.length + ' of ' + badges.length + ' badges earned';
    }

    if (!earnedBadges.length) {
      wall.innerHTML =
        '<div class="badges-empty-wall">' +
          '<span style="font-size:3rem">🎯</span>' +
          '<p><strong>No badges yet!</strong></p>' +
          '<p>Head to the <em>All Badges</em> tab and start earning.</p>' +
        '</div>';
      return;
    }

    var stories = safeGet(STORIES_KEY, {});
    var html = '';
    earnedBadges.forEach(function (b) {
      var story = stories[b.id] || '';
      html += '<div class="badges-wall-item" title="' + esc(b.name) + '">' +
        '<span class="badges-wall-emoji">' + esc(b.emoji) + '</span>' +
        '<span class="badges-wall-name">' + esc(b.name) + '</span>' +
        '<div class="badges-story" contenteditable="true" data-id="' + esc(b.id) + '" placeholder="How did you earn this?">' + esc(story) + '</div>' +
      '</div>';
    });
    wall.innerHTML = html;
  }

  /* ── Download badge wall as PNG ─────────────────────────── */
  function downloadWall() {
    var earned = getEarned();
    var earnedBadges = badges.filter(function (b) {
      return earned.indexOf(b.id) !== -1;
    });
    if (!earnedBadges.length) {
      alert('Earn some badges first!');
      return;
    }

    var W = 1200, H = 630;
    var canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#030308';
    ctx.fillRect(0, 0, W, H);

    // Subtle border
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, W - 40, H - 40);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('My IT Admin Badges', W / 2, 65);

    // Count
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '18px Inter, system-ui, sans-serif';
    ctx.fillText(earnedBadges.length + ' of ' + badges.length + ' badges earned', W / 2, 95);

    // Badge grid
    var cols = Math.min(earnedBadges.length, 8);
    var rows = Math.ceil(earnedBadges.length / cols);
    var cellW = (W - 100) / cols;
    var cellH = Math.min(70, (H - 140) / rows);
    var startY = 125;

    earnedBadges.forEach(function (b, i) {
      var col = i % cols;
      var row = Math.floor(i / cols);
      var x = 50 + col * cellW + cellW / 2;
      var y = startY + row * cellH;

      if (y + 30 > H - 30) return; // Don't overflow

      ctx.font = '24px serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(b.emoji, x, y + 5);

      ctx.font = '11px Inter, system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      var name = b.name.length > 16 ? b.name.slice(0, 15) + '…' : b.name;
      ctx.fillText(name, x, y + 24);
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('aguidetocloud.com/admin-badges', W / 2, H - 25);

    canvas.toBlob(function (blob) {
      if (!blob) return;
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'my-admin-badges.png';
      a.click();
      setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
    }, 'image/png');
  }

  /* ── Clear all earned badges ────────────────────────────── */
  function clearAll() {
    if (!confirm('Clear all earned badges? This cannot be undone.')) return;
    setEarned([]);
    renderAllBadges(activeFilter);
    renderBadgeWall();
  }

  /* ── Event delegation for badge cards ───────────────────── */
  function handleCardClick(e) {
    var shareBtn = e.target.closest('.badges-share-btn');
    if (shareBtn) {
      e.stopPropagation();
      var sid = shareBtn.getAttribute('data-id');
      if (sid) shareBadge(sid);
      return;
    }
    var card = e.target.closest('.badges-card');
    if (!card) return;
    var id = card.getAttribute('data-id');
    if (id) toggleBadge(id);
  }

  function handleCardKeydown(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var card = e.target.closest('.badges-card');
    if (!card) return;
    e.preventDefault();
    var id = card.getAttribute('data-id');
    if (id) toggleBadge(id);
  }

  /* ── Init ───────────────────────────────────────────────── */
  function init() {
    if (!badges.length) return;

    initTabs('badges');

    // Category filter buttons
    document.querySelectorAll('.badges-filter').forEach(function (btn) {
      btn.addEventListener('click', function () {
        renderAllBadges(btn.getAttribute('data-cat') || 'all');
      });
    });

    // Grid click delegation
    var grid = document.getElementById('all-badges-grid');
    if (grid) {
      grid.addEventListener('click', handleCardClick);
      grid.addEventListener('keydown', handleCardKeydown);
    }

    // Download wall button
    var dlBtn = document.getElementById('btn-download-wall');
    if (dlBtn) dlBtn.addEventListener('click', downloadWall);

    // Clear all button
    var clrBtn = document.getElementById('btn-clear-all');
    if (clrBtn) clrBtn.addEventListener('click', clearAll);

    // Daily challenge
    var dailySlot = document.getElementById('daily-challenge');
    if (dailySlot) renderDailyChallenge(dailySlot);

    // Story blur delegation (badge wall)
    var wall = document.getElementById('badge-wall');
    if (wall) {
      wall.addEventListener('focusout', function (e) {
        if (!e.target.classList.contains('badges-story')) return;
        var bid = e.target.getAttribute('data-id');
        if (!bid) return;
        var stories = safeGet(STORIES_KEY, {});
        var text = (e.target.textContent || '').trim();
        if (text) { stories[bid] = text; } else { delete stories[bid]; }
        safeSet(STORIES_KEY, stories);
      });
    }

    // Initial renders
    renderAllBadges('all');
    renderBadgeWall();
  }

  /* ── Boot ───────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
