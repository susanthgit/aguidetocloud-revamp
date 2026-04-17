/* admin-badges.js — IT Admin Achievement Badges V2
   Earn modal with stories, career levels, improved UX
   100% client-side, zero dependencies, zero API calls */
(function () {
  'use strict';

  function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function safeGet(key, fb) { try { var r = localStorage.getItem(key); return r ? JSON.parse(r) : fb; } catch (_) { return fb; } }
  function safeSet(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (_) {} }

  var badges = window.__badges || [];
  var categories = window.__badgeCategories || [];
  var rarities = window.__badgeRarities || [];
  var stories = window.__badgeStories || {};
  var careerTiers = window.__careerTiers || [];

  var catMap = {}; categories.forEach(function (c) { catMap[c.id] = c; });
  var rarMap = {}; rarities.forEach(function (r) { rarMap[r.id] = r; });

  var STORE_KEY = 'badges_earned';
  var activeFilter = 'all';

  function getEarned() { return safeGet(STORE_KEY, []); }
  function setEarned(arr) { safeSet(STORE_KEY, arr); }
  function isEarned(id) { return getEarned().indexOf(id) !== -1; }

  /* ── Career Level ───────────────────────────────────────── */
  function getCareerLevel() {
    var earned = getEarned();
    var pts = 0;
    earned.forEach(function (id) {
      var b = badges.find(function (x) { return x.id === id; });
      if (b) {
        var r = rarMap[b.rarity];
        pts += (r && r.points) ? r.points : 1;
      }
    });
    var tier = careerTiers[0] || { title: 'Newcomer', emoji: '🐣', min_points: 0 };
    for (var i = careerTiers.length - 1; i >= 0; i--) {
      if (pts >= careerTiers[i].min_points) { tier = careerTiers[i]; break; }
    }
    var nextTier = null;
    for (var j = 0; j < careerTiers.length; j++) {
      if (careerTiers[j].min_points > pts) { nextTier = careerTiers[j]; break; }
    }
    return { points: pts, tier: tier, nextTier: nextTier };
  }

  /* ── Earn Modal ─────────────────────────────────────────── */
  function showEarnModal(id) {
    var b = badges.find(function (x) { return x.id === id; });
    if (!b) return;
    var rar = rarMap[b.rarity] || { label: '?', color: '#888' };
    var st = stories[id] || {};
    var storyText = st.story || b.desc;
    var confirmText = st.confirm || ('I have earned: ' + b.name);

    var overlay = document.getElementById('badges-modal');
    var content = document.getElementById('badges-modal-content');
    content.innerHTML =
      '<button class="badges-modal-close" id="modal-close" aria-label="Close">&times;</button>' +
      '<div class="badges-modal-emoji">' + esc(b.emoji) + '</div>' +
      '<div class="badges-modal-name">' + esc(b.name) + '</div>' +
      '<div class="badges-modal-rarity" style="color:' + esc(rar.color) + '">' + esc(rar.label) + '</div>' +
      '<div class="badges-modal-story">' + esc(storyText) + '</div>' +
      '<div class="badges-modal-confirm">' + esc(confirmText) + '</div>' +
      '<div class="badges-modal-actions">' +
        '<button class="badges-modal-earn" id="modal-earn">Yes, I earned this! \uD83C\uDFC6</button>' +
        '<button class="badges-modal-skip" id="modal-skip">Not yet \uD83D\uDE05</button>' +
      '</div>';

    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    document.getElementById('modal-earn').addEventListener('click', function () {
      earnBadge(id);
      closeModal();
    });
    document.getElementById('modal-skip').addEventListener('click', closeModal);
    document.getElementById('modal-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
  }

  function closeModal() {
    var overlay = document.getElementById('badges-modal');
    if (overlay) overlay.style.display = 'none';
    document.body.style.overflow = '';
  }

  function earnBadge(id) {
    var earned = getEarned();
    if (earned.indexOf(id) === -1) earned.push(id);
    setEarned(earned);
    renderAllBadges(activeFilter);
    renderBadgeWall();
  }

  function removeBadge(id) {
    if (!confirm('Remove this badge?')) return;
    var earned = getEarned();
    var idx = earned.indexOf(id);
    if (idx !== -1) earned.splice(idx, 1);
    setEarned(earned);
    renderAllBadges(activeFilter);
    renderBadgeWall();
  }

  /* ── Tab switching ──────────────────────────────────────── */
  function initTabs(ns) {
    document.querySelectorAll('.' + ns + '-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.getAttribute('data-tab');
        document.querySelectorAll('.' + ns + '-tab').forEach(function (t) {
          t.classList.toggle('active', t.getAttribute('data-tab') === target);
          t.setAttribute('aria-selected', t.getAttribute('data-tab') === target ? 'true' : 'false');
        });
        document.querySelectorAll('.' + ns + '-panel').forEach(function (p) {
          p.classList.toggle('active', p.id === 'panel-' + target);
        });
      });
    });
  }

  /* ── Daily Challenge ────────────────────────────────────── */
  function renderDailyChallenge(container) {
    var earned = getEarned();
    var unearned = badges.filter(function (b) { return earned.indexOf(b.id) === -1; });
    if (!unearned.length) {
      container.innerHTML = '<div class="badges-daily badges-daily--done">' +
        '<span class="badges-daily-emoji">\uD83C\uDFC6</span>' +
        '<div><strong>All badges earned!</strong><br><small>You\'ve collected every badge. Legend.</small></div></div>';
      return;
    }
    var dateSeed = parseInt(new Date().toISOString().slice(0, 10).replace(/-/g, ''), 10);
    var rng = mulberry32(dateSeed);
    var challenge = unearned[Math.floor(rng() * unearned.length)];
    var rar = rarMap[challenge.rarity] || { label: '?', color: '#888' };
    var st = stories[challenge.id] || {};
    var preview = (st.story || challenge.desc || '').slice(0, 100);
    if ((st.story || '').length > 100) preview += '\u2026';

    container.innerHTML =
      '<div class="badges-daily">' +
        '<span class="badges-daily-label">Today\'s Challenge</span>' +
        '<div class="badges-daily-card" data-id="' + esc(challenge.id) + '" role="button" tabindex="0">' +
          '<span class="badges-daily-emoji">' + esc(challenge.emoji) + '</span>' +
          '<div class="badges-daily-info">' +
            '<strong>' + esc(challenge.name) + '</strong>' +
            '<p class="badges-daily-preview">' + esc(preview) + '</p>' +
            '<span class="badges-rarity-badge" style="background:' + esc(rar.color) + '">' + esc(rar.label) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';

    container.querySelector('.badges-daily-card').addEventListener('click', function () {
      showEarnModal(challenge.id);
    });
  }

  /* ── Share badge as PNG ─────────────────────────────────── */
  function shareBadge(id) {
    var b = badges.find(function (x) { return x.id === id; });
    if (!b) return;
    var rar = rarMap[b.rarity] || { label: '?', color: '#888' };
    var career = getCareerLevel();

    var W = 600, H = 400;
    var canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#030308'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, W - 32, H - 32);
    ctx.textAlign = 'center';
    ctx.font = '80px serif'; ctx.fillText(b.emoji, W / 2, 120);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 24px Inter, system-ui, sans-serif';
    ctx.fillText(b.name, W / 2, 175);
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '16px Inter, system-ui, sans-serif';
    var desc = b.desc.length > 60 ? b.desc.slice(0, 57) + '\u2026' : b.desc;
    ctx.fillText(desc, W / 2, 210);
    ctx.fillStyle = rar.color; ctx.font = 'bold 14px Inter, system-ui, sans-serif';
    var rarText = rar.label.toUpperCase();
    var tw = ctx.measureText(rarText).width;
    ctx.beginPath(); ctx.roundRect(W / 2 - tw / 2 - 12, 230, tw + 24, 28, 14); ctx.fill();
    ctx.fillStyle = '#000'; ctx.fillText(rarText, W / 2, 250);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '14px Inter, system-ui, sans-serif';
    ctx.fillText(career.tier.emoji + ' ' + career.tier.title + ' \u00b7 ' + career.points + ' pts', W / 2, 300);
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.fillText('aguidetocloud.com/admin-badges', W / 2, H - 24);

    canvas.toBlob(function (blob) {
      if (!blob) return;
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a'); a.href = url; a.download = 'badge-' + id + '.png'; a.click();
      setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
    }, 'image/png');
  }

  /* ── Badge card HTML ────────────────────────────────────── */
  function badgeCard(b, earned) {
    var rar = rarMap[b.rarity] || { label: '?', color: '#888' };
    var cls = 'badges-card' + (earned ? ' earned' : ' locked');
    var shareHtml = earned ? '<button class="badges-share-btn" data-id="' + esc(b.id) + '" aria-label="Share badge">\uD83D\uDCE4</button>' : '';
    return '<div class="' + cls + '" data-id="' + esc(b.id) + '" role="button" tabindex="0"' +
      ' aria-label="' + esc(b.name) + (earned ? ' (earned)' : ' (locked)') + '"' +
      ' style="border-top:3px solid ' + esc(rar.color) + '">' +
      shareHtml +
      '<span class="badges-emoji">' + esc(b.emoji) + '</span>' +
      '<strong class="badges-name">' + esc(b.name) + '</strong>' +
      '<small class="badges-desc">' + esc(b.desc) + '</small>' +
    '</div>';
  }

  /* ── Render All Badges ──────────────────────────────────── */
  function renderAllBadges(filter) {
    activeFilter = filter || 'all';
    var grid = document.getElementById('all-badges-grid');
    if (!grid) return;

    var earned = getEarned();
    var filtered = badges.filter(function (b) {
      return activeFilter === 'all' || b.category === activeFilter;
    });

    var career = getCareerLevel();
    var totalEarned = earned.length;
    var totalPct = badges.length > 0 ? Math.round(totalEarned / badges.length * 100) : 0;
    var nextInfo = career.nextTier
      ? (career.nextTier.min_points - career.points) + ' pts to ' + career.nextTier.emoji + ' ' + career.nextTier.title
      : 'Max level reached!';

    var html =
      '<div class="badges-career-bar">' +
        '<div class="badges-career-level">' + esc(career.tier.emoji) + ' ' + esc(career.tier.title) + '</div>' +
        '<div class="badges-career-pts">' + career.points + ' pts</div>' +
        '<div class="badges-career-next">' + esc(nextInfo) + '</div>' +
      '</div>' +
      '<div class="badges-total-progress">' +
        '<span class="badges-total-count">' + totalEarned + ' / ' + badges.length + '</span>' +
        '<div class="badges-total-bar"><div class="badges-total-bar-fill" style="width:' + totalPct + '%"></div></div>' +
        '<span class="badges-total-label">' + totalPct + '%</span>' +
      '</div>';

    if (activeFilter === 'all') {
      categories.forEach(function (cat) {
        var catBadges = filtered.filter(function (b) { return b.category === cat.id; });
        if (!catBadges.length) return;
        var catEarned = catBadges.filter(function (b) { return earned.indexOf(b.id) !== -1; }).length;
        var catPct = catBadges.length > 0 ? Math.round(catEarned / catBadges.length * 100) : 0;

        html += '<div class="badges-category-group">' +
          '<div class="badges-cat-header">' +
            '<span class="badges-cat-header-name">' + esc(cat.emoji) + ' ' + esc(cat.name) + '</span>' +
            '<span class="badges-cat-header-count">' + catEarned + ' / ' + catBadges.length + '</span>' +
            '<div class="badges-cat-progress"><div class="badges-cat-progress-fill" style="width:' + catPct + '%"></div></div>' +
          '</div><div class="badges-grid">';
        catBadges.sort(function (a, b) {
          return (earned.indexOf(a.id) !== -1 ? 0 : 1) - (earned.indexOf(b.id) !== -1 ? 0 : 1);
        });
        catBadges.forEach(function (b) { html += badgeCard(b, earned.indexOf(b.id) !== -1); });
        html += '</div></div>';
      });
    } else {
      filtered.sort(function (a, b) {
        return (earned.indexOf(a.id) !== -1 ? 0 : 1) - (earned.indexOf(b.id) !== -1 ? 0 : 1);
      });
      html += '<div class="badges-grid">';
      filtered.forEach(function (b) { html += badgeCard(b, earned.indexOf(b.id) !== -1); });
      html += '</div>';
    }

    if (!filtered.length) html = '<p class="badges-empty">No badges in this category.</p>';
    grid.innerHTML = html;

    document.querySelectorAll('.badges-filter').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-cat') === activeFilter);
    });
  }

  /* ── Badge Wall (My Badges) ─────────────────────────────── */
  function renderBadgeWall() {
    var wall = document.getElementById('badge-wall');
    var counter = document.getElementById('badge-counter');
    if (!wall) return;

    var earned = getEarned();
    var earnedBadges = badges.filter(function (b) { return earned.indexOf(b.id) !== -1; });
    var career = getCareerLevel();

    if (counter) {
      counter.innerHTML =
        '<div class="badges-career-display">' +
          '<span style="font-size:2rem">' + esc(career.tier.emoji) + '</span>' +
          '<div class="badges-big-number">' + career.tier.title + '</div>' +
          '<div class="badges-counter-label">' + earnedBadges.length + ' of ' + badges.length + ' badges \u00b7 ' + career.points + ' pts</div>' +
        '</div>';
    }

    if (!earnedBadges.length) {
      wall.innerHTML =
        '<div class="badges-empty-wall">' +
          '<span style="font-size:3rem">\uD83C\uDFAF</span>' +
          '<p><strong>No badges yet!</strong></p>' +
          '<p>Head to the <em>All Badges</em> tab and start earning.</p>' +
        '</div>';
      return;
    }

    var html = '<div class="badges-wall">';
    earnedBadges.forEach(function (b) {
      html += '<div class="badges-wall-item" title="' + esc(b.name) + ': ' + esc(b.desc) + '">' +
        '<span class="badges-wall-emoji">' + esc(b.emoji) + '</span>' +
        '<span class="badges-wall-name">' + esc(b.name) + '</span>' +
      '</div>';
    });
    html += '</div>';
    wall.innerHTML = html;
  }

  /* ── Download badge wall PNG ────────────────────────────── */
  function downloadWall() {
    var earned = getEarned();
    var earnedBadges = badges.filter(function (b) { return earned.indexOf(b.id) !== -1; });
    if (!earnedBadges.length) { alert('Earn some badges first!'); return; }
    var career = getCareerLevel();

    var W = 1200, H = 630;
    var canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#030308'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, W - 40, H - 40);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 32px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(career.tier.emoji + ' ' + career.tier.title, W / 2, 60);
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '18px Inter, system-ui, sans-serif';
    ctx.fillText(earnedBadges.length + ' of ' + badges.length + ' badges \u00b7 ' + career.points + ' pts', W / 2, 90);

    var cols = Math.min(earnedBadges.length, 8);
    var rows = Math.ceil(earnedBadges.length / cols);
    var cellW = (W - 100) / cols;
    var cellH = Math.min(70, (H - 140) / rows);
    var startY = 125;
    earnedBadges.forEach(function (b, i) {
      var col = i % cols, row = Math.floor(i / cols);
      var x = 50 + col * cellW + cellW / 2, y = startY + row * cellH;
      if (y + 30 > H - 30) return;
      ctx.font = '24px serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
      ctx.fillText(b.emoji, x, y + 5);
      ctx.font = '11px Inter, system-ui, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.fillText(b.name.length > 16 ? b.name.slice(0, 15) + '\u2026' : b.name, x, y + 24);
    });

    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.fillText('aguidetocloud.com/admin-badges', W / 2, H - 25);

    canvas.toBlob(function (blob) {
      if (!blob) return;
      var url = URL.createObjectURL(blob); var a = document.createElement('a');
      a.href = url; a.download = 'my-admin-badges.png'; a.click();
      setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
    }, 'image/png');
  }

  /* ── Event delegation ───────────────────────────────────── */
  function handleCardClick(e) {
    var shareBtn = e.target.closest('.badges-share-btn');
    if (shareBtn) { e.stopPropagation(); shareBadge(shareBtn.getAttribute('data-id')); return; }
    var card = e.target.closest('.badges-card');
    if (!card) return;
    var id = card.getAttribute('data-id');
    if (!id) return;
    if (isEarned(id)) { removeBadge(id); }
    else { showEarnModal(id); }
  }

  function handleCardKeydown(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var card = e.target.closest('.badges-card');
    if (!card) return;
    e.preventDefault();
    var id = card.getAttribute('data-id');
    if (!id) return;
    if (isEarned(id)) { removeBadge(id); }
    else { showEarnModal(id); }
  }

  /* ── Init ───────────────────────────────────────────────── */
  function init() {
    if (!badges.length) return;
    initTabs('badges');

    document.querySelectorAll('.badges-filter').forEach(function (btn) {
      btn.addEventListener('click', function () {
        renderAllBadges(btn.getAttribute('data-cat') || 'all');
      });
    });

    var grid = document.getElementById('all-badges-grid');
    if (grid) { grid.addEventListener('click', handleCardClick); grid.addEventListener('keydown', handleCardKeydown); }

    var dlBtn = document.getElementById('btn-download-wall');
    if (dlBtn) dlBtn.addEventListener('click', downloadWall);

    var clrBtn = document.getElementById('btn-clear-all');
    if (clrBtn) clrBtn.addEventListener('click', function () {
      if (confirm('Clear all earned badges? This cannot be undone.')) {
        setEarned([]); renderAllBadges(activeFilter); renderBadgeWall();
      }
    });

    var dailySlot = document.getElementById('daily-challenge');
    if (dailySlot) renderDailyChallenge(dailySlot);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });

    renderAllBadges('all');
    renderBadgeWall();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
