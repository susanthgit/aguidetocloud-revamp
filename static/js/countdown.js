/* ──────────────────────────────────────────
   Countdown Timer & Event Countdown
   100% client-side · Zero API calls · $0 cost
   ────────────────────────────────────────── */
(function () {
'use strict';

/* ═══════ CONSTANTS ═══════ */
const ICONS = [
  { emoji: '🎂', label: 'Birthday' },
  { emoji: '🎄', label: 'Christmas' },
  { emoji: '💒', label: 'Wedding' },
  { emoji: '🚀', label: 'Launch' },
  { emoji: '🎓', label: 'Graduation' },
  { emoji: '📝', label: 'Exam' },
  { emoji: '✈️', label: 'Travel' },
  { emoji: '🎉', label: 'Party' },
  { emoji: '⚽', label: 'Sport' },
  { emoji: '📅', label: 'Custom' }
];

const COLORS = [
  '#FB923C', '#F59E0B', '#EF4444', '#EC4899', '#A855F7',
  '#3B82F6', '#06B6D4', '#10B981', '#84CC16', '#F97316',
  '#E11D48', '#8B5CF6'
];

var VALID_EMOJIS = ICONS.map(function(i){ return i.emoji; });
function safeIcon(icon) { return VALID_EMOJIS.indexOf(icon) >= 0 ? icon : '📅'; }
function safeColor(color) { return /^#[0-9A-Fa-f]{6}$/.test(color) ? color : '#FB923C'; }

const TIMER_PRESETS = [
  { label: '1 min', secs: 60 },
  { label: '3 min', secs: 180 },
  { label: '5 min', secs: 300 },
  { label: '10 min', secs: 600 },
  { label: '15 min', secs: 900 },
  { label: '25 min', secs: 1500 },
  { label: '30 min', secs: 1800 },
  { label: '45 min', secs: 2700 },
  { label: '1 hr', secs: 3600 }
];

function getTemplates() {
  var now = new Date();
  var yr = now.getFullYear();
  var next = yr + 1;
  function pick(m, d, y) {
    var t = new Date(y, m - 1, d);
    return t < now ? new Date(y + 1, m - 1, d) : t;
  }
  return [
    { name: 'Christmas ' + yr, date: pick(12, 25, yr).toISOString().slice(0, 16), icon: '🎄' },
    { name: 'New Year ' + next, date: pick(1, 1, next).toISOString().slice(0, 16), icon: '🎆' },
    { name: "Valentine's Day " + next, date: pick(2, 14, next).toISOString().slice(0, 16), icon: '💕' },
    { name: 'Halloween ' + yr, date: pick(10, 31, yr).toISOString().slice(0, 16), icon: '🎃' },
    { name: 'St Patrick\'s Day ' + next, date: pick(3, 17, next).toISOString().slice(0, 16), icon: '☘️' },
    { name: 'New Year\'s Eve ' + yr, date: pick(12, 31, yr).toISOString().slice(0, 16), icon: '🥂' }
  ];
}

var LS_KEY = 'cdown_events';
var LS_TPL = 'cdown_custom_tpl';

/* ═══════ STATE ═══════ */
var S = {
  events: [],
  sort: 'soonest',
  selIcon: '📅',
  selColor: COLORS[0],
  selBanner: null,
  editId: null,
  // Timer
  timerMode: 'timer',
  timerTotal: 0,
  timerRemaining: 0,
  timerRunning: false,
  timerInterval: null,
  timerElapsed: 0,
  timerBanner: null,
  laps: [],
  loop: false,
  soundOn: true,
  // Fullscreen
  fsId: null,
  fsMode: null, // 'event' or 'timer'
  fsParticleRaf: null,
  // Misc
  tab: 'events',
  completedSet: {}
};

/* ═══════ UTILITIES ═══════ */
function esc(s) {
  if (typeof s !== 'string') return '';
  var d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function genId() { return 'cd_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function pad2(n) { return n < 10 ? '0' + n : '' + n; }
function pad3(n) { return n < 10 ? '00' + n : n < 100 ? '0' + n : '' + n; }

function save() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(S.events)); } catch (e) { /* quota */ }
}
function load() {
  try {
    var d = localStorage.getItem(LS_KEY);
    if (d) S.events = JSON.parse(d);
  } catch (e) { S.events = []; }
}
function calcDiff(targetStr) {
  var target = new Date(targetStr).getTime();
  var now = Date.now();
  var diff = target - now;
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, total: 0, pct: 100, done: true };
  var s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    mins: Math.floor((s % 3600) / 60),
    secs: s % 60,
    total: s,
    pct: 0,
    done: false
  };
}

function calcProgress(createdStr, targetStr) {
  var c = new Date(createdStr).getTime();
  var t = new Date(targetStr).getTime();
  var now = Date.now();
  if (now >= t) return 100;
  if (now <= c) return 0;
  return Math.min(100, Math.round(((now - c) / (t - c)) * 100));
}

function formatTimerDisplay(totalSecs) {
  var h = Math.floor(totalSecs / 3600);
  var m = Math.floor((totalSecs % 3600) / 60);
  var s = totalSecs % 60;
  return { hours: h, mins: m, secs: s };
}

function tzName() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { return ''; }
}

function toast(msg) {
  var el = document.createElement('div');
  el.className = 'cdown-toast';
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(function () { el.classList.add('show'); });
  setTimeout(function () {
    el.classList.remove('show');
    setTimeout(function () { el.remove(); }, 300);
  }, 2500);
}

/* ═══════ BANNER IMAGE UPLOAD ═══════ */
var MAX_BANNER_KB = 200;

function initBannerUpload(fileInputId, previewId, imgId, removeId, dropId, onSet) {
  var fileInput = document.getElementById(fileInputId);
  var preview = document.getElementById(previewId);
  var img = document.getElementById(imgId);
  var removeBtn = document.getElementById(removeId);
  var drop = document.getElementById(dropId);
  if (!fileInput || !preview || !drop) return;

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) { toast('Please select an image file'); return; }
    if (file.size > MAX_BANNER_KB * 1024) { toast('Image too large — max ' + MAX_BANNER_KB + ' KB'); return; }
    var reader = new FileReader();
    reader.onload = function (e) {
      var dataUrl = e.target.result;
      img.src = dataUrl;
      preview.style.display = '';
      drop.style.display = 'none';
      if (onSet) onSet(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  fileInput.addEventListener('change', function () { if (fileInput.files[0]) handleFile(fileInput.files[0]); });

  drop.addEventListener('dragover', function (e) { e.preventDefault(); drop.style.borderColor = '#FB923C'; });
  drop.addEventListener('dragleave', function () { drop.style.borderColor = ''; });
  drop.addEventListener('drop', function (e) {
    e.preventDefault(); drop.style.borderColor = '';
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });

  if (removeBtn) {
    removeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      img.src = '';
      preview.style.display = 'none';
      drop.style.display = '';
      fileInput.value = '';
      if (onSet) onSet(null);
    });
  }
}

function clearBannerUI(previewId, dropId, imgId, fileInputId) {
  var p = document.getElementById(previewId);
  var d = document.getElementById(dropId);
  var i = document.getElementById(imgId);
  var f = document.getElementById(fileInputId);
  if (p) p.style.display = 'none';
  if (d) d.style.display = '';
  if (i) i.src = '';
  if (f) f.value = '';
}

/* ═══════ SOUND — Web Audio API ═══════ */
function playChime() {
  if (!S.soundOn) return;
  try {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    var notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach(function (freq, i) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.8);
    });
  } catch (e) { /* audio not available */ }
}

/* ═══════ CONFETTI ═══════ */
function fireConfetti() {
  var canvas = document.getElementById('cdown-confetti');
  if (!canvas) return;
  canvas.style.display = 'block';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  var ctx = canvas.getContext('2d');
  var particles = [];
  var colors = ['#FB923C', '#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#fff'];
  for (var i = 0; i < 180; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 300,
      y: canvas.height * 0.6,
      vx: (Math.random() - 0.5) * 18,
      vy: Math.random() * -18 - 4,
      w: Math.random() * 10 + 4,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * 360,
      rv: (Math.random() - 0.5) * 12,
      gravity: 0.3,
      drag: 0.985,
      opacity: 1
    });
  }
  var frame = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var alive = false;
    particles.forEach(function (p) {
      if (p.opacity <= 0) return;
      alive = true;
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rv;
      if (p.y > canvas.height + 60) { p.opacity = 0; return; }
      if (frame > 80) p.opacity -= 0.015;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    frame++;
    if (alive && frame < 250) { requestAnimationFrame(animate); }
    else { ctx.clearRect(0, 0, canvas.width, canvas.height); canvas.style.display = 'none'; }
  }
  requestAnimationFrame(animate);
}

/* ═══════ FULLSCREEN PARTICLES ═══════ */
function startFsParticles(canvas) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  var ctx = canvas.getContext('2d');
  var dots = [];
  for (var i = 0; i < 60; i++) {
    dots.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.4 - 0.1,
      alpha: Math.random() * 0.25 + 0.05,
      color: Math.random() > 0.5 ? '#FB923C' : 'rgba(255,255,255,0.8)'
    });
  }
  function draw() {
    if (!S.fsId) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dots.forEach(function (d) {
      d.x += d.vx;
      d.y += d.vy;
      if (d.y < -10) { d.y = canvas.height + 10; d.x = Math.random() * canvas.width; }
      if (d.x < -10) d.x = canvas.width + 10;
      if (d.x > canvas.width + 10) d.x = -10;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = d.color;
      ctx.globalAlpha = d.alpha;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    S.fsParticleRaf = requestAnimationFrame(draw);
  }
  draw();
}

/* ═══════ FLIP CLOCK ═══════ */
function createClockHtml(opts) {
  var size = opts.size || 'md';
  var dayDig = opts.dayDigits;
  if (dayDig === undefined || dayDig === null) dayDig = 2;
  var units = [];
  if (dayDig > 0) units.push({ key: 'days', label: 'Days', digits: dayDig });
  units.push({ key: 'hours', label: 'Hours', digits: 2 });
  units.push({ key: 'mins', label: 'Minutes', digits: 2 });
  units.push({ key: 'secs', label: 'Seconds', digits: 2 });
  var cls = 'cdown-clock';
  if (size === 'lg') cls += ' cdown-clock-lg';
  else if (size === 'xl') cls += ' cdown-clock-xl';
  else if (size === 'sm') cls += ' cdown-clock-sm';
  var html = '<div class="' + cls + '">';
  units.forEach(function (u, i) {
    html += '<div class="cdown-clock-unit" data-unit="' + u.key + '"><div class="cdown-clock-digits">';
    for (var d = 0; d < u.digits; d++) {
      html += '<div class="cdown-d" data-v="">' +
        '<div class="cdown-d-top"><span>0</span></div>' +
        '<div class="cdown-d-btm"><span>0</span></div>' +
        '</div>';
    }
    html += '</div><div class="cdown-clock-label">' + u.label + '</div></div>';
    if (i < 3) html += '<div class="cdown-clock-sep">:</div>';
  });
  html += '</div>';
  return html;
}

function flipDigit(el, val) {
  var v = String(val);
  var old = el.getAttribute('data-v');
  if (old === v) return;
  el.setAttribute('data-v', v);
  el.querySelector('.cdown-d-top span').textContent = v;
  if (old === '' || old === null) {
    el.querySelector('.cdown-d-btm span').textContent = v;
    return;
  }
  // Remove any existing flaps
  var existing = el.querySelectorAll('.cdown-flap');
  existing.forEach(function (f) { f.remove(); });

  var fold = document.createElement('div');
  fold.className = 'cdown-flap cdown-flap-fold';
  var fs = document.createElement('span');
  fs.textContent = old;
  fold.appendChild(fs);

  var unfold = document.createElement('div');
  unfold.className = 'cdown-flap cdown-flap-unfold';
  var us = document.createElement('span');
  us.textContent = v;
  unfold.appendChild(us);

  el.appendChild(fold);
  el.appendChild(unfold);

  setTimeout(function () {
    el.querySelector('.cdown-d-btm span').textContent = v;
    if (fold.parentNode) fold.remove();
    if (unfold.parentNode) unfold.remove();
  }, 600);
}

function updateClock(container, days, hours, mins, secs) {
  var units = container.querySelectorAll('.cdown-clock-unit');
  if (!units.length) return;
  var vals = [];
  // Days
  var dayUnit = units[0];
  var dayDigs = dayUnit.querySelectorAll('.cdown-d');
  var dStr = dayDigs.length === 3 ? pad3(Math.min(999, days)) : pad2(Math.min(99, days));
  vals.push(dStr);
  // Hours, mins, secs
  vals.push(pad2(hours));
  vals.push(pad2(mins));
  vals.push(pad2(secs));

  units.forEach(function (unit, i) {
    var digits = unit.querySelectorAll('.cdown-d');
    var str = vals[i];
    for (var j = 0; j < digits.length; j++) {
      flipDigit(digits[j], str[j] || '0');
    }
  });
}

/* ═══════ TABS ═══════ */
function initTabs() {
  document.querySelectorAll('.cdown-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var t = tab.getAttribute('data-tab');
      switchTab(t);
    });
  });
  // Hash-based tab
  var hash = window.location.hash.replace('#', '');
  if (hash === 'timer') switchTab(hash);
}

function switchTab(t) {
  S.tab = t;
  document.querySelectorAll('.cdown-tab').forEach(function (tab) {
    var active = tab.getAttribute('data-tab') === t;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  document.querySelectorAll('.cdown-panel').forEach(function (p) {
    p.classList.toggle('active', p.id === 'panel-' + t);
  });
  history.replaceState(null, '', '#' + t);
}

/* ═══════ ICON & COLOUR PICKERS ═══════ */
function initPickers() {
  var iconGrid = document.getElementById('cdown-icon-grid');
  var colorGrid = document.getElementById('cdown-color-grid');
  if (iconGrid) {
    iconGrid.innerHTML = ICONS.map(function (ic) {
      var cls = ic.emoji === S.selIcon ? ' active' : '';
      return '<button class="cdown-icon-btn' + cls + '" data-icon="' + ic.emoji + '" title="' + esc(ic.label) + '">' + ic.emoji + '</button>';
    }).join('');
    iconGrid.addEventListener('click', function (e) {
      var btn = e.target.closest('.cdown-icon-btn');
      if (!btn) return;
      iconGrid.querySelectorAll('.cdown-icon-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      S.selIcon = btn.getAttribute('data-icon');
    });
  }
  if (colorGrid) {
    colorGrid.innerHTML = COLORS.map(function (c) {
      var cls = c === S.selColor ? ' active' : '';
      return '<button class="cdown-color-btn' + cls + '" data-color="' + c + '" style="background:' + c + '" title="' + c + '"></button>';
    }).join('');
    colorGrid.addEventListener('click', function (e) {
      var btn = e.target.closest('.cdown-color-btn');
      if (!btn) return;
      colorGrid.querySelectorAll('.cdown-color-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      S.selColor = btn.getAttribute('data-color');
    });
  }
}

/* ═══════ EVENT CRUD ═══════ */
function createEvent() {
  var nameEl = document.getElementById('cdown-name');
  var dateEl = document.getElementById('cdown-date');
  var msgEl = document.getElementById('cdown-message');
  if (!nameEl || !dateEl) return;
  var name = nameEl.value.trim();
  var date = dateEl.value;
  var message = msgEl ? msgEl.value.trim() : '';
  if (!name) { toast('Please enter an event name'); nameEl.focus(); return; }
  if (!date) { toast('Please pick a date & time'); dateEl.focus(); return; }
  if (new Date(date) <= new Date()) { toast('Please pick a future date'); return; }

  if (S.editId) {
    var ev = S.events.find(function (e) { return e.id === S.editId; });
    if (ev) {
      ev.name = name;
      ev.date = date;
      ev.icon = S.selIcon;
      ev.color = S.selColor;
      ev.banner = S.selBanner;
      ev.message = message;
    }
    S.editId = null;
    document.getElementById('cdown-create-btn').textContent = '⏳ Create Countdown';
  } else {
    S.events.push({
      id: genId(),
      name: name,
      date: date,
      icon: S.selIcon,
      color: S.selColor,
      banner: S.selBanner,
      message: message,
      created: new Date().toISOString()
    });
  }
  save();
  S.selBanner = null;
  nameEl.value = '';
  dateEl.value = '';
  if (msgEl) msgEl.value = '';
  clearBannerUI('cdown-banner-preview', 'cdown-banner-drop', 'cdown-banner-img', 'cdown-banner-file');
  renderDashboard();
  toast('Countdown created!');
}

function deleteEvent(id) {
  S.events = S.events.filter(function (e) { return e.id !== id; });
  save();
  renderDashboard();
  toast('Countdown deleted');
}

function editEvent(id) {
  var ev = S.events.find(function (e) { return e.id === id; });
  if (!ev) return;
  S.editId = id;
  document.getElementById('cdown-name').value = ev.name;
  document.getElementById('cdown-date').value = ev.date;
  var msgEl = document.getElementById('cdown-message');
  if (msgEl) msgEl.value = ev.message || '';
  S.selIcon = safeIcon(ev.icon);
  S.selColor = safeColor(ev.color);
  S.selBanner = ev.banner || null;
  initPickers();
  // Restore banner preview if exists
  if (ev.banner) {
    var img = document.getElementById('cdown-banner-img');
    var preview = document.getElementById('cdown-banner-preview');
    var drop = document.getElementById('cdown-banner-drop');
    if (img) img.src = ev.banner;
    if (preview) preview.style.display = '';
    if (drop) drop.style.display = 'none';
  } else {
    clearBannerUI('cdown-banner-preview', 'cdown-banner-drop', 'cdown-banner-img', 'cdown-banner-file');
  }
  document.getElementById('cdown-create-btn').textContent = '✏️ Update Countdown';
  document.getElementById('cdown-create').scrollIntoView({ behavior: 'smooth' });
}

/* ═══════ SHARE / EMBED ═══════ */
function buildShareUrl(ev) {
  var base = window.location.origin + window.location.pathname;
  var p = new URLSearchParams();
  p.set('name', ev.name);
  p.set('date', ev.date);
  if (ev.icon) p.set('icon', ev.icon);
  if (ev.color) p.set('color', ev.color);
  return base + '?' + p.toString() + '#events';
}

function shareEvent(ev) {
  var url = buildShareUrl(ev);
  navigator.clipboard.writeText(url).then(function () {
    toast('Link copied to clipboard!');
  }).catch(function () {
    prompt('Copy this link:', url);
  });
}

function embedEvent(ev) {
  var url = buildShareUrl(ev) + '&embed=1';
  var code = '<iframe src="' + esc(url) + '" width="600" height="320" frameborder="0" style="border-radius:12px;overflow:hidden"></iframe>';
  navigator.clipboard.writeText(code).then(function () {
    toast('Embed code copied!');
  }).catch(function () {
    prompt('Copy embed code:', code);
  });
}

/* ═══════ FULLSCREEN ═══════ */
function openFullscreen(id) {
  var ev = S.events.find(function (e) { return e.id === id; });
  if (!ev) return;
  S.fsId = id;
  S.fsMode = 'event';
  showFsOverlay(safeIcon(ev.icon), ev.name, ev.banner, ev.message, true);
  updateFsDisplay();
}

function openTimerFullscreen() {
  S.fsMode = 'timer';
  S.fsId = '__timer__';
  var label = (document.getElementById('cdown-timer-label') || {}).value || (S.timerMode === 'stopwatch' ? 'Stopwatch' : 'Timer');
  var banner = S.timerBanner;
  showFsOverlay('⏱️', label, banner, '', false);
  // Show timer controls in FS
  var ctrls = document.getElementById('cdown-fs-timer-ctrls');
  if (ctrls) ctrls.style.display = 'flex';
  updateTimerFsDisplay();
}

function showFsOverlay(icon, name, banner, message, showProgress) {
  var fs = document.getElementById('cdown-fs');
  var done = document.getElementById('cdown-fs-done');
  done.style.display = 'none';
  fs.style.display = 'flex';

  document.getElementById('cdown-fs-icon').textContent = icon;
  document.getElementById('cdown-fs-name').textContent = name;
  document.getElementById('cdown-fs-tz').textContent = 'In your local time · ' + tzName();

  // Banner
  var bannerEl = document.getElementById('cdown-fs-banner');
  var bannerImg = document.getElementById('cdown-fs-banner-img');
  if (banner && bannerEl && bannerImg) {
    bannerImg.src = banner;
    bannerEl.style.display = '';
  } else if (bannerEl) {
    bannerEl.style.display = 'none';
  }

  // Message
  var msgEl = document.getElementById('cdown-fs-msg');
  if (msgEl) msgEl.textContent = message || '';

  // Progress bar
  var barWrap = document.getElementById('cdown-fs-bar-wrap');
  if (barWrap) barWrap.style.display = showProgress ? '' : 'none';

  // Timer controls hidden by default
  var ctrls = document.getElementById('cdown-fs-timer-ctrls');
  if (ctrls) ctrls.style.display = 'none';

  var clockEl = document.getElementById('cdown-fs-clock');
  clockEl.innerHTML = createClockHtml({ size: 'xl', dayDigits: showProgress ? 3 : 0 });

  var canvas = document.getElementById('cdown-fs-canvas');
  startFsParticles(canvas);

  try {
    if (fs.requestFullscreen) fs.requestFullscreen();
    else if (fs.webkitRequestFullscreen) fs.webkitRequestFullscreen();
  } catch (e) { /* not supported */ }
}

function closeFullscreen() {
  S.fsId = null;
  S.fsMode = null;
  if (S.fsParticleRaf) cancelAnimationFrame(S.fsParticleRaf);
  document.getElementById('cdown-fs').style.display = 'none';
  try {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
  } catch (e) { /* ignore */ }
}

function updateFsDisplay() {
  if (S.fsMode !== 'event' || !S.fsId) return;
  var ev = S.events.find(function (e) { return e.id === S.fsId; });
  if (!ev) { closeFullscreen(); return; }
  var d = calcDiff(ev.date);
  var clockEl = document.getElementById('cdown-fs-clock');
  updateClock(clockEl, d.days, d.hours, d.mins, d.secs);
  var pct = calcProgress(ev.created, ev.date);
  document.getElementById('cdown-fs-bar').style.width = pct + '%';
  if (d.done) {
    document.getElementById('cdown-fs-done').style.display = 'flex';
    if (!S.completedSet['fs_' + ev.id]) {
      S.completedSet['fs_' + ev.id] = true;
      playChime();
      fireConfetti();
    }
  }
}

function updateTimerFsDisplay() {
  if (S.fsMode !== 'timer') return;
  var secs = S.timerMode === 'timer' ? S.timerRemaining : S.timerElapsed;
  var t = formatTimerDisplay(Math.max(0, secs));
  var clockEl = document.getElementById('cdown-fs-clock');
  var units = clockEl.querySelectorAll('.cdown-clock-unit');
  if (!units.length) return;
  var vals = [pad2(t.hours), pad2(t.mins), pad2(t.secs)];
  units.forEach(function (unit, i) {
    var digits = unit.querySelectorAll('.cdown-d');
    var str = vals[i] || '00';
    for (var j = 0; j < digits.length; j++) {
      flipDigit(digits[j], str[j] || '0');
    }
  });
}

/* ═══════ DASHBOARD ═══════ */
function renderDashboard() {
  var container = document.getElementById('cdown-dashboard');
  var sortEl = document.getElementById('cdown-sort');
  if (!container) return;

  if (!S.events.length) {
    container.innerHTML = '<div class="cdown-hint" style="text-align:center;padding:2rem 0">No countdowns yet — create one above! ⏳</div>';
    if (sortEl) sortEl.style.display = 'none';
    return;
  }

  if (sortEl) sortEl.style.display = 'flex';

  var sorted = S.events.slice();
  if (S.sort === 'soonest') sorted.sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
  else if (S.sort === 'newest') sorted.sort(function (a, b) { return new Date(b.created) - new Date(a.created); });
  else if (S.sort === 'name') sorted.sort(function (a, b) { return a.name.localeCompare(b.name); });

  container.innerHTML = sorted.map(function (ev) {
    var d = calcDiff(ev.date);
    var pct = calcProgress(ev.created, ev.date);
    var color = safeColor(ev.color);
    var cardContent;
    if (d.done) {
      cardContent = '<div class="cdown-card-done"><div class="cdown-card-done-icon">🎉</div>' +
        '<div class="cdown-card-done-text">It\'s time!</div></div>';
    } else {
      cardContent = '<div class="cdown-card-clock" id="clock-' + ev.id + '">' +
        createClockHtml({ size: 'md', dayDigits: 2 }) + '</div>' +
        '<div class="cdown-card-progress"><div class="cdown-card-progress-bar" style="width:' + pct + '%;background:' + color + '"></div></div>';
    }
    var dateStr = new Date(ev.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    return '<div class="cdown-card" data-id="' + ev.id + '">' +
      '<div class="cdown-card-accent" style="background:' + color + '"></div>' +
      '<div class="cdown-card-header">' +
        '<div class="cdown-card-icon">' + safeIcon(ev.icon) + '</div>' +
        '<div class="cdown-card-name">' + esc(ev.name) + '</div>' +
      '</div>' +
      '<div class="cdown-card-date">' + esc(dateStr) + '</div>' +
      cardContent +
      '<div class="cdown-card-actions">' +
        '<button class="cdown-btn cdown-btn-sm" data-action="share" data-id="' + ev.id + '" title="Share">🔗 Share</button>' +
        '<button class="cdown-btn cdown-btn-sm" data-action="embed" data-id="' + ev.id + '" title="Embed">📋 Embed</button>' +
        '<button class="cdown-btn cdown-btn-sm" data-action="fs" data-id="' + ev.id + '" title="Full Screen">🖥️ Full Screen</button>' +
        '<button class="cdown-btn cdown-btn-sm" data-action="edit" data-id="' + ev.id + '" title="Edit">✏️</button>' +
        '<button class="cdown-btn cdown-btn-sm cdown-btn-danger" data-action="delete" data-id="' + ev.id + '" title="Delete">🗑️</button>' +
      '</div>' +
    '</div>';
  }).join('');

  // Initial clock update for each card
  sorted.forEach(function (ev) {
    if (!calcDiff(ev.date).done) {
      var d = calcDiff(ev.date);
      var clockEl = document.getElementById('clock-' + ev.id);
      if (clockEl) updateClock(clockEl, d.days, d.hours, d.mins, d.secs);
    }
  });
}

function initDashboardEvents() {
  var container = document.getElementById('cdown-dashboard');
  if (!container) return;
  container.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var action = btn.getAttribute('data-action');
    var id = btn.getAttribute('data-id');
    var ev = S.events.find(function (e) { return e.id === id; });
    if (!ev) return;
    if (action === 'share') shareEvent(ev);
    else if (action === 'embed') embedEvent(ev);
    else if (action === 'fs') openFullscreen(id);
    else if (action === 'edit') editEvent(id);
    else if (action === 'delete') deleteEvent(id);
  });
}

function initSort() {
  document.querySelectorAll('.cdown-sort-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.cdown-sort-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      S.sort = btn.getAttribute('data-sort');
      renderDashboard();
    });
  });
}

/* ═══════ TIMER TAB ═══════ */
function initTimerTab() {
  // Create clock (H:M:S only — no days for timer)
  var display = document.getElementById('cdown-timer-display');
  if (display) display.innerHTML = createClockHtml_Timer({ size: 'lg' });

  // Render presets
  var grid = document.getElementById('cdown-preset-grid');
  if (grid) {
    grid.innerHTML = TIMER_PRESETS.map(function (p) {
      return '<button class="cdown-preset-btn" data-secs="' + p.secs + '">' + p.label + '</button>';
    }).join('');
    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('.cdown-preset-btn');
      if (!btn) return;
      setTimer(parseInt(btn.getAttribute('data-secs'), 10));
    });
  }

  // Mode toggle
  document.getElementById('cdown-mode-timer').addEventListener('click', function () { setTimerMode('timer'); });
  document.getElementById('cdown-mode-sw').addEventListener('click', function () { setTimerMode('stopwatch'); });

  // Controls
  document.getElementById('cdown-start').addEventListener('click', startTimer);
  document.getElementById('cdown-pause').addEventListener('click', pauseTimer);
  document.getElementById('cdown-reset').addEventListener('click', resetTimer);
  document.getElementById('cdown-plus1').addEventListener('click', function () { addTime(60); });
  document.getElementById('cdown-lap').addEventListener('click', recordLap);

  // Options
  document.getElementById('cdown-loop').addEventListener('change', function () { S.loop = this.checked; });
  document.getElementById('cdown-sound').addEventListener('change', function () { S.soundOn = this.checked; });

  updateTimerDisplay();
}

function createClockHtml_Timer(opts) {
  // Timer: Hours, Minutes, Seconds only (no days)
  var size = opts.size || 'lg';
  var units = [
    { key: 'hours', label: 'Hours', digits: 2 },
    { key: 'mins', label: 'Minutes', digits: 2 },
    { key: 'secs', label: 'Seconds', digits: 2 }
  ];
  var cls = 'cdown-clock';
  if (size === 'lg') cls += ' cdown-clock-lg';
  var html = '<div class="' + cls + '">';
  units.forEach(function (u, i) {
    html += '<div class="cdown-clock-unit" data-unit="' + u.key + '"><div class="cdown-clock-digits">';
    for (var d = 0; d < u.digits; d++) {
      html += '<div class="cdown-d" data-v="">' +
        '<div class="cdown-d-top"><span>0</span></div>' +
        '<div class="cdown-d-btm"><span>0</span></div>' +
        '</div>';
    }
    html += '</div><div class="cdown-clock-label">' + u.label + '</div></div>';
    if (i < units.length - 1) html += '<div class="cdown-clock-sep">:</div>';
  });
  html += '</div>';
  return html;
}

function setTimerMode(mode) {
  S.timerMode = mode;
  resetTimer();
  document.querySelectorAll('.cdown-mode-btn').forEach(function (b) {
    b.classList.toggle('active', b.getAttribute('data-mode') === mode);
  });
  var isTimer = mode === 'timer';
  document.getElementById('cdown-presets').style.display = isTimer ? '' : 'none';
  document.getElementById('cdown-custom-time').style.display = isTimer ? '' : 'none';
  document.getElementById('cdown-plus1').style.display = isTimer ? '' : 'none';
  document.getElementById('cdown-loop').parentElement.style.display = isTimer ? '' : 'none';
  document.getElementById('cdown-lap').textContent = isTimer ? '🏁 Lap' : '🏁 Lap';
}

function setTimer(secs) {
  if (S.timerRunning) return;
  S.timerTotal = secs;
  S.timerRemaining = secs;
  var t = formatTimerDisplay(secs);
  document.getElementById('cdown-th').value = t.hours;
  document.getElementById('cdown-tm').value = t.mins;
  document.getElementById('cdown-ts').value = t.secs;
  updateTimerDisplay();
}

function getCustomTime() {
  var h = parseInt(document.getElementById('cdown-th').value, 10) || 0;
  var m = parseInt(document.getElementById('cdown-tm').value, 10) || 0;
  var s = parseInt(document.getElementById('cdown-ts').value, 10) || 0;
  return h * 3600 + m * 60 + s;
}

function startTimer() {
  if (S.timerRunning) return;

  if (S.timerMode === 'timer') {
    if (S.timerRemaining <= 0) {
      var custom = getCustomTime();
      if (custom <= 0) { toast('Set a time first'); return; }
      S.timerTotal = custom;
      S.timerRemaining = custom;
    }
    S.timerRunning = true;
    S.timerInterval = setInterval(function () {
      S.timerRemaining--;
      updateTimerDisplay();
      if (S.timerRemaining <= 0) {
        S.timerRemaining = 0;
        updateTimerDisplay();
        playChime();
        fireConfetti();
        if (S.loop) {
          S.timerRemaining = S.timerTotal;
        } else {
          clearInterval(S.timerInterval);
          S.timerRunning = false;
        }
      }
    }, 1000);
  } else {
    // Stopwatch mode
    S.timerRunning = true;
    S.timerInterval = setInterval(function () {
      S.timerElapsed++;
      updateTimerDisplay();
    }, 1000);
  }

  document.getElementById('cdown-start').disabled = true;
  document.getElementById('cdown-pause').disabled = false;
}

function pauseTimer() {
  if (!S.timerRunning) return;
  clearInterval(S.timerInterval);
  S.timerRunning = false;
  document.getElementById('cdown-start').disabled = false;
  document.getElementById('cdown-pause').disabled = true;
  document.getElementById('cdown-start').textContent = '▶ Resume';
}

function resetTimer() {
  clearInterval(S.timerInterval);
  S.timerRunning = false;
  S.timerRemaining = 0;
  S.timerTotal = 0;
  S.timerElapsed = 0;
  S.laps = [];
  document.getElementById('cdown-start').disabled = false;
  document.getElementById('cdown-start').textContent = '▶ Start';
  document.getElementById('cdown-pause').disabled = true;
  document.getElementById('cdown-laps').style.display = 'none';
  if (S.timerMode === 'timer') {
    document.getElementById('cdown-th').value = 0;
    document.getElementById('cdown-tm').value = 0;
    document.getElementById('cdown-ts').value = 0;
  }
  updateTimerDisplay();
}

function addTime(secs) {
  if (S.timerMode !== 'timer') return;
  S.timerRemaining += secs;
  S.timerTotal += secs;
  updateTimerDisplay();
  toast('+1 minute added');
}

function recordLap() {
  var val;
  if (S.timerMode === 'stopwatch') {
    val = S.timerElapsed;
  } else {
    val = S.timerTotal - S.timerRemaining;
  }
  S.laps.push(val);
  renderLaps();
}

function renderLaps() {
  var el = document.getElementById('cdown-laps');
  var list = document.getElementById('cdown-laps-list');
  if (!S.laps.length) { el.style.display = 'none'; return; }
  el.style.display = '';
  list.innerHTML = S.laps.map(function (l, i) {
    var t = formatTimerDisplay(l);
    return '<div class="cdown-lap-item"><span>Lap ' + (i + 1) + '</span><span>' +
      pad2(t.hours) + ':' + pad2(t.mins) + ':' + pad2(t.secs) + '</span></div>';
  }).reverse().join('');
}

function updateTimerDisplay() {
  var display = document.getElementById('cdown-timer-display');
  if (!display) return;
  var secs = S.timerMode === 'timer' ? S.timerRemaining : S.timerElapsed;
  var t = formatTimerDisplay(Math.max(0, secs));
  // Timer display uses H:M:S (no days)
  var units = display.querySelectorAll('.cdown-clock-unit');
  if (!units.length) {
    display.innerHTML = createClockHtml_Timer({ size: 'lg' });
    units = display.querySelectorAll('.cdown-clock-unit');
  }
  var vals = [pad2(t.hours), pad2(t.mins), pad2(t.secs)];
  units.forEach(function (unit, i) {
    var digits = unit.querySelectorAll('.cdown-d');
    var str = vals[i];
    for (var j = 0; j < digits.length; j++) {
      flipDigit(digits[j], str[j] || '0');
    }
  });
}

/* ═══════ TEMPLATES TAB ═══════ */
function renderTemplates() {
  var grid = document.getElementById('cdown-tpl-grid');
  if (!grid) return;
  var templates = getTemplates();
  grid.innerHTML = templates.map(function (t) {
    var d = calcDiff(t.date);
    var away = d.done ? 'Today!' : d.days + ' day' + (d.days !== 1 ? 's' : '') + ' away';
    return '<div class="cdown-tpl-card" data-tpl-name="' + esc(t.name) + '" data-tpl-date="' + t.date + '" data-tpl-icon="' + safeIcon(t.icon) + '">' +
      '<div class="cdown-tpl-icon">' + safeIcon(t.icon) + '</div>' +
      '<div class="cdown-tpl-info"><div class="cdown-tpl-name">' + esc(t.name) + '</div>' +
      '<div class="cdown-tpl-days">' + away + '</div></div>' +
      '<button class="cdown-tpl-btn">Start →</button>' +
    '</div>';
  }).join('');

  grid.addEventListener('click', function (e) {
    var card = e.target.closest('.cdown-tpl-card');
    if (!card) return;
    var name = card.getAttribute('data-tpl-name');
    var date = card.getAttribute('data-tpl-date');
    var icon = safeIcon(card.getAttribute('data-tpl-icon'));
    var exists = S.events.some(function (ev) { return ev.name === name; });
    if (exists) { toast('This countdown already exists'); return; }
    S.events.push({
      id: genId(),
      name: name,
      date: date,
      icon: icon,
      color: COLORS[0],
      created: new Date().toISOString()
    });
    save();
    renderDashboard();
    toast('Countdown created!');
  });
}

/* ═══════ URL PARAMS ═══════ */
function parseUrlParams() {
  var params = new URLSearchParams(window.location.search);
  if (!params.has('name') || !params.has('date')) return;

  var name = params.get('name');
  var date = params.get('date');
  var icon = safeIcon(params.get('icon'));
  var color = safeColor(params.get('color'));
  var embed = params.get('embed') === '1';

  if (embed) {
    document.body.classList.add('cdown-embed-mode');
  }

  // Check if already exists
  var exists = S.events.some(function (ev) { return ev.name === name && ev.date === date; });
  if (!exists) {
    var ev = {
      id: genId(),
      name: name,
      date: date,
      icon: icon,
      color: color,
      created: new Date().toISOString()
    };
    S.events.push(ev);
    save();
  }

  if (embed) {
    var ev2 = S.events.find(function (e) { return e.name === name && e.date === date; });
    if (ev2) {
      setTimeout(function () { openFullscreen(ev2.id); }, 100);
    }
  }
}

/* ═══════ KEYBOARD SHORTCUTS ═══════ */
function initKeyboard() {
  document.addEventListener('keydown', function (e) {
    // Ignore when typing in input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      if (S.tab === 'timer') {
        if (S.timerRunning) pauseTimer();
        else startTimer();
      }
    }
    if (e.key === 'f' || e.key === 'F') {
      if (S.fsId) { closeFullscreen(); return; }
      if (S.events.length) openFullscreen(S.events[0].id);
    }
    if (e.key === 'n' || e.key === 'N') {
      switchTab('events');
      document.getElementById('cdown-name').focus();
    }
    if (e.key === 'Escape') {
      if (S.fsId) closeFullscreen();
    }
  });
}

/* ═══════ PAGE TITLE UPDATE ═══════ */
function updatePageTitle() {
  // Show first active countdown in title
  if (!S.events.length) return;
  var sorted = S.events.slice().sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
  var next = sorted.find(function (ev) { return !calcDiff(ev.date).done; });
  if (!next) { document.title = '🎉 All events reached! | Countdown'; return; }
  var d = calcDiff(next.date);
  var parts = [];
  if (d.days > 0) parts.push(d.days + 'd');
  parts.push(d.hours + 'h');
  parts.push(d.mins + 'm');
  document.title = parts.join(' ') + ' — ' + next.name + ' | Countdown';
}

/* ═══════ MAIN TICK ═══════ */
function tick() {
  // Update dashboard cards
  S.events.forEach(function (ev) {
    var clockEl = document.getElementById('clock-' + ev.id);
    if (!clockEl) return;
    var d = calcDiff(ev.date);
    if (d.done) {
      if (!S.completedSet[ev.id]) {
        S.completedSet[ev.id] = true;
        renderDashboard();
        playChime();
        fireConfetti();
      }
      return;
    }
    updateClock(clockEl, d.days, d.hours, d.mins, d.secs);
    var bar = clockEl.parentElement.querySelector('.cdown-card-progress-bar');
    if (bar) bar.style.width = calcProgress(ev.created, ev.date) + '%';
  });

  // Update fullscreen
  if (S.fsMode === 'event') updateFsDisplay();
  else if (S.fsMode === 'timer') updateTimerFsDisplay();

  // Update page title
  updatePageTitle();
}

/* ═══════ INIT ═══════ */
function init() {
  load();
  parseUrlParams();
  initTabs();
  initPickers();
  initSort();
  initDashboardEvents();
  renderDashboard();

  // Attach critical handlers first (before any tab init that might error)
  document.getElementById('cdown-create-btn').addEventListener('click', createEvent);
  document.getElementById('cdown-fs-close').addEventListener('click', closeFullscreen);

  // Fullscreen exit on browser fullscreen exit
  document.addEventListener('fullscreenchange', function () {
    if (!document.fullscreenElement && S.fsId) closeFullscreen();
  });

  // Banner uploads
  initBannerUpload('cdown-banner-file', 'cdown-banner-preview', 'cdown-banner-img', 'cdown-banner-remove', 'cdown-banner-drop', function (data) { S.selBanner = data; });
  initBannerUpload('cdown-timer-banner-file', 'cdown-timer-banner-preview', 'cdown-timer-banner-img', 'cdown-timer-banner-remove', 'cdown-timer-banner-drop', function (data) { S.timerBanner = data; });

  // Timer fullscreen button
  var timerFsBtn = document.getElementById('cdown-timer-fs');
  if (timerFsBtn) timerFsBtn.addEventListener('click', openTimerFullscreen);

  // Fullscreen timer controls
  var fsPause = document.getElementById('cdown-fs-pause');
  var fsReset = document.getElementById('cdown-fs-reset');
  var fsPlus1 = document.getElementById('cdown-fs-plus1');
  if (fsPause) fsPause.addEventListener('click', function () { if (S.timerRunning) pauseTimer(); else startTimer(); });
  if (fsReset) fsReset.addEventListener('click', function () { resetTimer(); closeFullscreen(); });
  if (fsPlus1) fsPlus1.addEventListener('click', function () { addTime(60); });

  // Timer tab
  initTimerTab();

  // Templates (inline in events panel)
  renderTemplates();

  // Keyboard
  initKeyboard();

  // Set default date to tomorrow
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(12, 0, 0, 0);
  var dateEl = document.getElementById('cdown-date');
  if (dateEl && !dateEl.value) {
    dateEl.value = tomorrow.toISOString().slice(0, 16);
  }

  // Tick every second
  tick();
  setInterval(tick, 1000);

  // Handle resize for fullscreen canvas
  window.addEventListener('resize', function () {
    if (S.fsId) {
      var canvas = document.getElementById('cdown-fs-canvas');
      if (canvas) { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    }
  });
}

document.addEventListener('DOMContentLoaded', init);

})();
