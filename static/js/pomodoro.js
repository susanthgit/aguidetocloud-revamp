/* ──────────────────────────────────────────
   Pomodoro Focus Timer v2 — pomodoro.js
   Redesigned: single-page timer + layered audio
   ────────────────────────────────────────── */
(function () {
  'use strict';

  const $ = s => document.getElementById(s);
  const $$ = (s, p) => (p || document).querySelectorAll(s);
  const esc = t => { const d = document.createElement('span'); d.textContent = t; return d.innerHTML; };
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const pad = n => String(n).padStart(2, '0');
  const today = () => new Date().toISOString().slice(0, 10);

  const DEFAULTS = {
    workMin: 25, shortMin: 5, longMin: 15, interval: 4,
    autoBreak: false, autoFocus: false, notifications: false,
    soundType: 'chime', alertVol: 70, ambientVol: 50, ambient: null,
  };

  const S = {
    running: false, phase: 'focus', totalSec: 25 * 60, remainSec: 25 * 60,
    sessionIdx: 0, startedAt: null, pausedRemain: null, rafId: null,
    muted: false, autoStart: false, fullscreen: false,
    settings: { ...DEFAULTS }, tasks: [], currentTaskId: null, audioCtx: null,
  };

  const QUOTES = [
    { t: 'The secret of getting ahead is getting started.', a: 'Mark Twain' },
    { t: 'Focus on being productive instead of busy.', a: 'Tim Ferriss' },
    { t: 'Do the hard jobs first. The easy jobs will take care of themselves.', a: 'Dale Carnegie' },
    { t: 'The way to get started is to quit talking and begin doing.', a: 'Walt Disney' },
    { t: 'Starve your distractions, feed your focus.', a: 'Daniel Goleman' },
    { t: 'Action is the foundational key to all success.', a: 'Pablo Picasso' },
    { t: 'Your future is created by what you do today, not tomorrow.', a: 'Robert Kiyosaki' },
    { t: 'Where focus goes, energy flows.', a: 'Tony Robbins' },
    { t: "It's not that I'm so smart, it's just that I stay with problems longer.", a: 'Albert Einstein' },
    { t: 'The successful warrior is the average man, with laser-like focus.', a: 'Bruce Lee' },
    { t: 'Small daily improvements over time lead to stunning results.', a: 'Robin Sharma' },
    { t: "Don't count the days, make the days count.", a: 'Muhammad Ali' },
    { t: 'Either you run the day or the day runs you.', a: 'Jim Rohn' },
    { t: 'The only way to do great work is to love what you do.', a: 'Steve Jobs' },
    { t: 'Take rest; a field that has rested gives a bountiful crop.', a: 'Ovid' },
    { t: 'Almost everything will work again if you unplug it for a few minutes — including you.', a: 'Anne Lamott' },
    { t: "Amateurs sit and wait for inspiration; the rest of us just get up and go to work.", a: 'Stephen King' },
    { t: 'Simplicity boils down to two steps: identify the essential, eliminate the rest.', a: 'Leo Babauta' },
    { t: 'One thing at a time. Most important thing first.', a: 'Gail Blanke' },
    { t: 'Concentrate all your thoughts upon the work at hand.', a: 'Alexander Graham Bell' },
  ];

  /* ═══════════ PERSISTENCE ═══════════ */
  function loadSettings() {
    try { const r = localStorage.getItem('pomo_settings'); if (r) Object.assign(S.settings, JSON.parse(r)); } catch {}
  }
  function saveSettings() { localStorage.setItem('pomo_settings', JSON.stringify(S.settings)); }
  function loadTasks() {
    try { S.tasks = JSON.parse(localStorage.getItem('pomo_tasks') || '[]'); } catch { S.tasks = []; }
    S.currentTaskId = localStorage.getItem('pomo_current_task') || null;
  }
  function saveTasks() {
    localStorage.setItem('pomo_tasks', JSON.stringify(S.tasks));
    localStorage.setItem('pomo_current_task', S.currentTaskId || '');
  }
  function getStats() { try { return JSON.parse(localStorage.getItem('pomo_stats') || '{}'); } catch { return {}; } }
  function saveStats(s) { localStorage.setItem('pomo_stats', JSON.stringify(s)); }
  function todayStats() {
    const s = getStats(), d = today();
    if (!s[d]) s[d] = { focusMin: 0, sessions: 0, tasksDone: 0 };
    return { stats: s, day: s[d] };
  }

  /* ═══════════════════════════════════════════
     AUDIO ENGINE — Layered ambient sounds
     ═══════════════════════════════════════════ */
  function getCtx() {
    if (!S.audioCtx) S.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (S.audioCtx.state === 'suspended') S.audioCtx.resume();
    return S.audioCtx;
  }

  /* Alert sounds */
  function playAlert() {
    if (S.muted || S.settings.soundType === 'none') return;
    const ctx = getCtx(), vol = S.settings.alertVol / 100, t = ctx.currentTime;
    if (S.settings.soundType === 'chime') {
      [523.25, 659.25, 783.99].forEach((f, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(vol * 0.4, t + i * 0.18);
        g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.18 + 1.2);
        o.connect(g); g.connect(ctx.destination);
        o.start(t + i * 0.18); o.stop(t + i * 0.18 + 1.5);
      });
    } else if (S.settings.soundType === 'bell') {
      [440, 880, 1320, 1760].forEach((f, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(vol * (i === 0 ? 0.35 : 0.12 / (i + 1)), t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 3);
        o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 3.5);
      });
    } else if (S.settings.soundType === 'digital') {
      [0, 0.15, 0.3].forEach(d => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'square'; o.frequency.value = 880;
        g.gain.setValueAtTime(vol * 0.2, t + d);
        g.gain.setValueAtTime(0, t + d + 0.1);
        o.connect(g); g.connect(ctx.destination); o.start(t + d); o.stop(t + d + 0.12);
      });
    }
  }

  /* ── Ambient sound engine — realistic (WAV) + synthetic ── */
  let ambientState = null;
  const wavCache = {}; // cache decoded AudioBuffers

  function stopAmbient() {
    if (!ambientState) return;
    const old = ambientState;
    ambientState = null;
    if (old.intervals) old.intervals.forEach(id => clearInterval(id));
    try {
      old.master.gain.linearRampToValueAtTime(0, S.audioCtx.currentTime + 0.6);
      setTimeout(() => {
        try { old.sources.forEach(s => s.stop()); } catch {}
        try { old.oscs.forEach(o => o.stop()); } catch {}
      }, 700);
    } catch {
      try { old.sources.forEach(s => s.stop()); } catch {}
    }
  }

  /* ── Realistic sounds: load WAV files, loop via AudioBuffer ── */
  const WAV_MAP = {
    rain: '/audio/pomo-rain.wav',
    cafe: '/audio/pomo-cafe.wav',
    forest: '/audio/pomo-forest.wav',
    ocean: '/audio/pomo-ocean.wav',
    whitenoise: '/audio/pomo-whitenoise.wav',
    lofi: '/audio/pomo-lofi.wav',
  };

  async function loadWav(key) {
    if (wavCache[key]) return wavCache[key];
    const resp = await fetch(WAV_MAP[key]);
    const arrayBuf = await resp.arrayBuffer();
    const audioBuf = await getCtx().decodeAudioData(arrayBuf);
    wavCache[key] = audioBuf;
    return audioBuf;
  }

  async function startRealAmbient(key) {
    stopAmbient();
    const ctx = getCtx();
    const vol = S.settings.ambientVol / 100;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.5);
    master.connect(ctx.destination);
    try {
      const buf = await loadWav(key);
      if (S.settings.ambient !== key) return; // user switched during load
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      src.connect(master);
      src.start();
      ambientState = { master, sources: [src], oscs: [], intervals: [] };
    } catch (e) {
      /* silently ignore ambient load failure */
    }
  }

  /* ── Synthetic sounds: Web Audio API generated ── */
  function makeNoise(ctx, type, seconds) {
    const len = ctx.sampleRate * seconds;
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      if (type === 'white') {
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      } else if (type === 'brown') {
        let last = 0;
        for (let i = 0; i < len; i++) { last = (last + 0.04 * (Math.random() * 2 - 1)) / 1.04; d[i] = last * 8; }
      } else if (type === 'pink') {
        let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
        for (let i = 0; i < len; i++) {
          const w = Math.random() * 2 - 1;
          b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759; b2=0.96900*b2+w*0.1538520;
          b3=0.86650*b3+w*0.3104856; b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980;
          d[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11; b6=w*0.115926;
        }
      }
    }
    return buf;
  }

  function loopBuf(ctx, buf) {
    const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; return s;
  }

  function startSynthAmbient(key) {
    stopAmbient();
    const ctx = getCtx();
    const vol = S.settings.ambientVol / 100;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.6);
    master.connect(ctx.destination);
    const sources = [], oscs = [], intervals = [];

    if (key === 's-focus') {
      // Pink noise, bandpass around mid — warm, focused hum
      const s = loopBuf(ctx, makeNoise(ctx, 'pink', 3));
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 500; bp.Q.value = 0.5;
      const g = ctx.createGain(); g.gain.value = 0.6;
      s.connect(bp); bp.connect(g); g.connect(master); s.start(); sources.push(s);
    } else if (key === 's-calm') {
      // Very low brown noise — soothing deep drone
      const s = loopBuf(ctx, makeNoise(ctx, 'brown', 3));
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 300;
      const g = ctx.createGain(); g.gain.value = 0.7;
      s.connect(lp); lp.connect(g); g.connect(master); s.start(); sources.push(s);
      // Gentle LFO modulation
      const lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.type = 'sine'; lfo.frequency.value = 0.06; lg.gain.value = 100;
      lfo.connect(lg); lg.connect(lp.frequency); lfo.start(); oscs.push(lfo);
    } else if (key === 's-bright') {
      // High-passed white noise — sparkly, airy
      const s = loopBuf(ctx, makeNoise(ctx, 'white', 2));
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3000;
      const g = ctx.createGain(); g.gain.value = 0.25;
      s.connect(hp); hp.connect(g); g.connect(master); s.start(); sources.push(s);
    } else if (key === 's-deep') {
      // Brown noise, very low — rumbling depth
      const s = loopBuf(ctx, makeNoise(ctx, 'brown', 4));
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 150;
      const g = ctx.createGain(); g.gain.value = 0.8;
      s.connect(lp); lp.connect(g); g.connect(master); s.start(); sources.push(s);
      // Slow swell
      const lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.type = 'sine'; lfo.frequency.value = 0.04; lg.gain.value = 0.3;
      lfo.connect(lg); lg.connect(g.gain); lfo.start(); oscs.push(lfo);
    } else if (key === 's-static') {
      // Clean white noise
      const s = loopBuf(ctx, makeNoise(ctx, 'white', 3));
      const g = ctx.createGain(); g.gain.value = 0.3;
      s.connect(g); g.connect(master); s.start(); sources.push(s);
    } else if (key === 's-warm') {
      // Muffled brown noise + gentle tonal hum
      const s = loopBuf(ctx, makeNoise(ctx, 'brown', 3));
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 350;
      const g = ctx.createGain(); g.gain.value = 0.5;
      s.connect(lp); lp.connect(g); g.connect(master); s.start(); sources.push(s);
      // Chord tones
      [130.81, 164.81, 196.00].forEach(f => {
        const o = ctx.createOscillator(), og = ctx.createGain();
        o.type = 'sine'; o.frequency.value = f; og.gain.value = 0.05;
        o.connect(og); og.connect(master); o.start(); oscs.push(o);
      });
    }

    ambientState = { master, sources, oscs, intervals };
  }

  function startAmbient(key) {
    if (key && key.startsWith('s-')) startSynthAmbient(key);
    else if (key) startRealAmbient(key);
    else stopAmbient();
  }

  function updateAmbientVol() {
    if (!ambientState) return;
    const vol = S.settings.ambientVol / 100;
    ambientState.master.gain.linearRampToValueAtTime(vol, S.audioCtx.currentTime + 0.2);
  }

  /* ═══════════ NOTIFICATIONS ═══════════ */
  function requestNotifPermission() {
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
  }
  function sendNotif(title, body) {
    if (!S.settings.notifications || !('Notification' in window) || Notification.permission !== 'granted') return;
    new Notification(title, { body });
  }

  /* ═══════════════════════════════════════════
     TIMER CORE
     ═══════════════════════════════════════════ */
  const CIRC = 2 * Math.PI * 120;

  function phaseDur() {
    if (S.phase === 'focus') return S.settings.workMin * 60;
    if (S.phase === 'short') return S.settings.shortMin * 60;
    return S.settings.longMin * 60;
  }
  function phaseColor() { return S.phase === 'focus' ? '#EF4444' : S.phase === 'short' ? '#34D399' : '#3B82F6'; }
  function phaseLabel() { return S.phase === 'focus' ? 'Focus' : S.phase === 'short' ? 'Short Break' : 'Long Break'; }

  function initTimer() {
    S.totalSec = phaseDur(); S.remainSec = S.totalSec;
    S.running = false; S.startedAt = null; S.pausedRemain = null;
    if (S.rafId) cancelAnimationFrame(S.rafId); S.rafId = null;
    renderTimer(); updateTitle();
  }

  function renderTimer() {
    const min = Math.floor(S.remainSec / 60), sec = S.remainSec % 60;
    $('pomo-time').textContent = pad(min) + ':' + pad(sec);
    const progress = S.totalSec > 0 ? S.remainSec / S.totalSec : 1;
    $('pomo-ring-progress').style.strokeDashoffset = CIRC - CIRC * progress;
    $('pomo-ring-progress').style.stroke = phaseColor();
    const ph = $('pomo-phase');
    ph.textContent = phaseLabel();
    ph.className = 'pomo-phase' + (S.phase === 'short' ? ' short-break' : S.phase === 'long' ? ' long-break' : '');
    $('pomo-start').textContent = S.running ? '⏸ Pause' : '▶ Start';
    renderDots(); renderTodayCount(); updateQuote(); updateFocusTask();
  }

  function renderDots() {
    const c = $('pomo-sessions'), n = S.settings.interval;
    if (c.children.length !== n) {
      c.innerHTML = '';
      for (let i = 0; i < n; i++) { const s = document.createElement('span'); s.className = 'pomo-dot'; c.appendChild(s); }
    }
    Array.from(c.children).forEach((d, i) => {
      d.textContent = i < S.sessionIdx ? '🍅' : '○';
      d.classList.toggle('filled', i < S.sessionIdx);
    });
  }

  function renderTodayCount() { $('pomo-today-num').textContent = todayStats().day.sessions; }

  function updateTitle() {
    const m = Math.floor(S.remainSec / 60), s = S.remainSec % 60;
    document.title = pad(m) + ':' + pad(s) + ' - ' + (S.phase === 'focus' ? 'Focus' : 'Break') + ' | Pomodoro';
  }

  function updateQuote() {
    const el = $('pomo-quote');
    if (S.phase === 'focus') { el.style.display = 'none'; return; }
    el.style.display = '';
    const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    $('pomo-quote-text').textContent = '"' + q.t + '"';
    $('pomo-quote-author').textContent = '— ' + q.a;
  }

  function updateFocusTask() {
    const task = S.tasks.find(t => t.id === S.currentTaskId && !t.done);
    const wrap = $('pomo-focus-task'), name = $('pomo-focus-name');
    if (task) { name.textContent = task.name; wrap.classList.add('has-task'); }
    else { name.textContent = 'Click to add a task…'; wrap.classList.remove('has-task'); }
  }

  function tick() {
    if (!S.running) return;
    S.remainSec = Math.max(0, S.pausedRemain - Math.floor((Date.now() - S.startedAt) / 1000));
    renderTimer(); updateTitle();
    if (S.remainSec <= 0) { onPhaseEnd(); return; }
    S.rafId = requestAnimationFrame(tick);
  }

  function startTimer() {
    if (S.remainSec <= 0) return;
    getCtx(); S.running = true; S.startedAt = Date.now(); S.pausedRemain = S.remainSec;
    S.rafId = requestAnimationFrame(tick); renderTimer();
  }
  function pauseTimer() {
    S.running = false; if (S.rafId) cancelAnimationFrame(S.rafId); S.rafId = null; renderTimer();
  }
  function resetTimer() { pauseTimer(); S.remainSec = S.totalSec; renderTimer(); updateTitle(); }

  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible' && S.running) {
      S.remainSec = Math.max(0, S.pausedRemain - Math.floor((Date.now() - S.startedAt) / 1000));
      if (S.remainSec <= 0) { onPhaseEnd(); }
      else { renderTimer(); updateTitle(); }
    }
  });

  function onPhaseEnd() {
    pauseTimer(); playAlert();
    if (S.phase === 'focus') {
      const { stats, day } = todayStats();
      day.focusMin += S.settings.workMin; day.sessions += 1; saveStats(stats);
      if (S.currentTaskId) {
        const t = S.tasks.find(x => x.id === S.currentTaskId);
        if (t) { t.actual = (t.actual || 0) + 1; saveTasks(); renderTasks(); }
      }
      S.sessionIdx++;
      if (S.sessionIdx >= S.settings.interval) { S.phase = 'long'; S.sessionIdx = 0; }
      else S.phase = 'short';
      sendNotif('🍅 Focus complete!', 'Time for a ' + phaseLabel().toLowerCase() + '.');
    } else {
      S.phase = 'focus';
      sendNotif('⏰ Break over!', 'Ready to focus?');
    }
    S.totalSec = phaseDur(); S.remainSec = S.totalSec; renderTimer(); updateTitle();
    const shouldAuto = (S.phase === 'focus' && S.settings.autoFocus) || (S.phase !== 'focus' && S.settings.autoBreak) || S.autoStart;
    if (shouldAuto) setTimeout(startTimer, 500);
  }

  function skipPhase() {
    pauseTimer();
    if (S.phase === 'focus') {
      S.sessionIdx++; S.phase = S.sessionIdx >= S.settings.interval ? (S.sessionIdx = 0, 'long') : 'short';
    } else S.phase = 'focus';
    S.totalSec = phaseDur(); S.remainSec = S.totalSec; renderTimer(); updateTitle();
  }

  /* ═══════════ TASKS ═══════════ */
  function renderTasks() {
    const list = $('pomo-task-list');
    $('pomo-task-count').textContent = S.tasks.length + ' task' + (S.tasks.length !== 1 ? 's' : '');
    $('pomo-task-hint').style.display = S.tasks.length ? '' : 'none';
    if (!S.tasks.length) {
      list.innerHTML = '<p style="text-align:center;color:var(--pomo-text-dim);padding:1rem;font-size:0.85rem;">No tasks yet — add one above!</p>';
      return;
    }
    list.innerHTML = S.tasks.map((t, i) => `
      <div class="pomo-task-item${t.done ? ' done' : ''}${t.id === S.currentTaskId ? ' active-task' : ''}" data-id="${esc(t.id)}" draggable="true">
        <span class="pomo-task-drag" title="Drag">⠿</span>
        <div class="pomo-task-moves">
          <button class="pomo-task-move" data-dir="up"${i === 0 ? ' disabled' : ''}>▲</button>
          <button class="pomo-task-move" data-dir="down"${i === S.tasks.length - 1 ? ' disabled' : ''}>▼</button>
        </div>
        <button class="pomo-task-check">${t.done ? '✓' : ''}</button>
        <span class="pomo-task-name">${esc(t.name)}</span>
        <span class="pomo-task-pomos"><strong>${t.actual || 0}</strong>/${t.est}🍅</span>
        <button class="pomo-task-del">✕</button>
      </div>`).join('');

    list.querySelectorAll('.pomo-task-item').forEach(el => {
      const id = el.dataset.id;
      el.querySelector('.pomo-task-check').addEventListener('click', e => {
        e.stopPropagation();
        const t = S.tasks.find(x => x.id === id);
        if (t) {
          t.done = !t.done;
          if (t.done) { const { stats, day } = todayStats(); day.tasksDone++; saveStats(stats); }
          saveTasks(); renderTasks(); updateFocusTask();
        }
      });
      el.querySelector('.pomo-task-name').addEventListener('click', () => {
        const t = S.tasks.find(x => x.id === id);
        if (t && !t.done) { S.currentTaskId = S.currentTaskId === id ? null : id; saveTasks(); renderTasks(); updateFocusTask(); }
      });
      el.querySelector('.pomo-task-del').addEventListener('click', e => {
        e.stopPropagation(); S.tasks = S.tasks.filter(x => x.id !== id);
        if (S.currentTaskId === id) S.currentTaskId = null;
        saveTasks(); renderTasks(); updateFocusTask();
      });
      el.querySelectorAll('.pomo-task-move').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation(); const idx = S.tasks.findIndex(x => x.id === id);
          if (btn.dataset.dir === 'up' && idx > 0) [S.tasks[idx - 1], S.tasks[idx]] = [S.tasks[idx], S.tasks[idx - 1]];
          else if (btn.dataset.dir === 'down' && idx < S.tasks.length - 1) [S.tasks[idx + 1], S.tasks[idx]] = [S.tasks[idx], S.tasks[idx + 1]];
          saveTasks(); renderTasks();
        });
      });
      el.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', id); el.classList.add('dragging'); });
      el.addEventListener('dragend', () => el.classList.remove('dragging'));
      el.addEventListener('dragover', e => e.preventDefault());
      el.addEventListener('drop', e => {
        e.preventDefault(); const fId = e.dataTransfer.getData('text/plain');
        const fi = S.tasks.findIndex(x => x.id === fId), ti = S.tasks.findIndex(x => x.id === id);
        if (fi < 0 || ti < 0 || fi === ti) return;
        const [item] = S.tasks.splice(fi, 1); S.tasks.splice(ti, 0, item);
        saveTasks(); renderTasks();
      });
    });
  }

  function addTask(name, est) {
    name = (name || '').trim(); if (!name) return;
    est = clamp(parseInt(est) || 1, 1, 99);
    S.tasks.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name, est, actual: 0, done: false });
    saveTasks(); renderTasks();
  }

  /* ═══════════ SETTINGS MODAL ═══════════ */
  function openSettings() { $('pomo-modal-overlay').style.display = 'flex'; }
  function closeSettings() { $('pomo-modal-overlay').style.display = 'none'; }

  function applySettingsUI() {
    const s = S.settings;
    $('pomo-set-work').value = s.workMin; $('pomo-set-work-val').textContent = s.workMin + ' min';
    $('pomo-set-short').value = s.shortMin; $('pomo-set-short-val').textContent = s.shortMin + ' min';
    $('pomo-set-long').value = s.longMin; $('pomo-set-long-val').textContent = s.longMin + ' min';
    $('pomo-set-interval').value = s.interval; $('pomo-set-interval-val').textContent = s.interval + ' sessions';
    $('pomo-set-auto-break').checked = s.autoBreak;
    $('pomo-set-auto-focus').checked = s.autoFocus;
    $('pomo-set-notif').checked = s.notifications;
    $('pomo-set-vol').value = s.alertVol; $('pomo-set-vol-val').textContent = s.alertVol + '%';
    $$('#pomo-sound-pills .pomo-pill').forEach(p => p.classList.toggle('active', p.dataset.sound === s.soundType));
    // Ambient pills on timer — both groups
    $$('.pomo-ambient-pill').forEach(b => b.classList.toggle('active', b.dataset.ambient === s.ambient));
    $('pomo-ambient-vol-quick').value = s.ambientVol;
    // Presets
    $$('.pomo-preset').forEach(p => {
      if (p.dataset.w === '0') return;
      p.classList.toggle('active', parseInt(p.dataset.w) === s.workMin && parseInt(p.dataset.s) === s.shortMin);
    });
  }

  function bindSettings() {
    [['pomo-set-work', 'workMin', ' min'], ['pomo-set-short', 'shortMin', ' min'],
     ['pomo-set-long', 'longMin', ' min'], ['pomo-set-interval', 'interval', ' sessions'],
     ['pomo-set-vol', 'alertVol', '%']].forEach(([id, key, suf]) => {
      $(id).addEventListener('input', () => {
        S.settings[key] = parseInt($(id).value);
        $(id + '-val').textContent = S.settings[key] + suf;
        saveSettings();
        if (['workMin', 'shortMin', 'longMin', 'interval'].includes(key) && !S.running) initTimer();
        applySettingsUI();
      });
    });

    $('pomo-set-auto-break').addEventListener('change', () => { S.settings.autoBreak = $('pomo-set-auto-break').checked; saveSettings(); });
    $('pomo-set-auto-focus').addEventListener('change', () => { S.settings.autoFocus = $('pomo-set-auto-focus').checked; saveSettings(); });
    $('pomo-set-notif').addEventListener('change', () => { S.settings.notifications = $('pomo-set-notif').checked; if (S.settings.notifications) requestNotifPermission(); saveSettings(); });
    $('pomo-notif-test').addEventListener('click', e => { e.preventDefault(); requestNotifPermission(); sendNotif('🍅 Test', 'Notifications work!'); });
    $$('#pomo-sound-pills .pomo-pill').forEach(p => p.addEventListener('click', () => { S.settings.soundType = p.dataset.sound; saveSettings(); applySettingsUI(); }));
    $('pomo-vol-preview').addEventListener('click', playAlert);
    $('pomo-reset-settings').addEventListener('click', () => { if (!confirm('Reset all settings to defaults?')) return; Object.assign(S.settings, DEFAULTS); saveSettings(); applySettingsUI(); stopAmbient(); if (!S.running) initTimer(); });
    $('pomo-settings-btn').addEventListener('click', openSettings);
    $('pomo-modal-close').addEventListener('click', closeSettings);
    $('pomo-modal-overlay').addEventListener('click', e => { if (e.target === $('pomo-modal-overlay')) closeSettings(); });
  }

  /* ═══════════ STATS ═══════════ */
  function renderStats() {
    const stats = getStats(), d = today(), day = stats[d] || { focusMin: 0, sessions: 0, tasksDone: 0 };
    $('pomo-stat-focus').textContent = day.focusMin + ' min';
    $('pomo-stat-sessions').textContent = day.sessions;
    $('pomo-stat-tasks').textContent = day.tasksDone;
    let streak = 0; const dt = new Date();
    while (true) { const k = dt.toISOString().slice(0, 10); if (stats[k] && stats[k].sessions > 0) { streak++; dt.setDate(dt.getDate() - 1); } else break; }
    $('pomo-stat-streak').textContent = streak;
    const days = Object.keys(stats).sort();
    let totalMin = 0, totalSes = 0, best = 0, cur = 0;
    days.forEach(k => { totalMin += stats[k].focusMin || 0; totalSes += stats[k].sessions || 0; if (stats[k].sessions > 0) { cur++; best = Math.max(best, cur); } else cur = 0; });
    $('pomo-stat-total-hrs').textContent = (totalMin / 60).toFixed(1) + ' hrs';
    $('pomo-stat-total-sessions').textContent = totalSes;
    $('pomo-stat-longest').textContent = best + ' days';
    $('pomo-stat-avg').textContent = days.length ? Math.round(totalMin / days.length) + ' min' : '0 min';
    renderWeekChart(stats); renderHeatmap(stats);
  }

  function renderWeekChart(stats) {
    const canvas = $('pomo-week-chart'), ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.parentElement.clientWidth - 24, h = 180;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr); ctx.clearRect(0, 0, w, h);
    const now = new Date(), dow = now.getDay(), mon = new Date(now);
    mon.setDate(now.getDate() - ((dow + 6) % 7));
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const vals = [];
    for (let i = 0; i < 7; i++) { const d = new Date(mon); d.setDate(mon.getDate() + i); vals.push((stats[d.toISOString().slice(0, 10)] || {}).focusMin || 0); }
    const maxV = Math.max(...vals, 1), barW = Math.min(36, (w - 70) / 7 - 6), chartH = h - 35, sx = 36;
    ctx.fillStyle = '#9e98a8'; ctx.font = '10px Inter,sans-serif'; ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) { const y = 8 + chartH - chartH * i / 4; ctx.fillText(Math.round(maxV * i / 4) + 'm', sx - 6, y + 3); ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.beginPath(); ctx.moveTo(sx, y); ctx.lineTo(w, y); ctx.stroke(); }
    ctx.textAlign = 'center';
    vals.forEach((v, i) => {
      const x = sx + 6 + i * ((w - sx - 6) / 7) + ((w - sx - 6) / 7 - barW) / 2;
      const bH = v > 0 ? Math.max(3, v / maxV * chartH) : 0, y = 8 + chartH - bH;
      ctx.fillStyle = i === ((now.getDay() + 6) % 7) ? '#EF4444' : 'rgba(239,68,68,0.45)';
      ctx.beginPath(); ctx.roundRect(x, y, barW, bH, 3); ctx.fill();
      ctx.fillStyle = '#9e98a8'; ctx.font = '10px Inter,sans-serif'; ctx.fillText(labels[i], x + barW / 2, h - 4);
      if (v > 0) { ctx.fillStyle = '#e0dce6'; ctx.font = '9px Inter,sans-serif'; ctx.fillText(v + 'm', x + barW / 2, y - 4); }
    });
  }

  function renderHeatmap(stats) {
    const c = $('pomo-heatmap'); c.innerHTML = '';
    const end = new Date(), start = new Date(end); start.setDate(end.getDate() - 364); start.setDate(start.getDate() - start.getDay());
    const maxM = Math.max(1, ...Object.values(stats).map(s => s.focusMin || 0));
    const cells = []; const d = new Date(start);
    while (d <= end) { const k = d.toISOString().slice(0, 10); const m = (stats[k] || {}).focusMin || 0; cells.push({ k, l: m > 0 ? Math.min(4, Math.ceil(m / maxM * 4)) : 0 }); d.setDate(d.getDate() + 1); }
    const weeks = []; for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    c.style.gridTemplateColumns = `repeat(${weeks.length},1fr)`; c.style.gridTemplateRows = 'repeat(7,1fr)';
    weeks.forEach(w => { w.forEach(cell => { const e = document.createElement('div'); e.className = 'pomo-heat-cell'; e.dataset.level = cell.l; e.title = cell.k + ': ' + ((stats[cell.k] || {}).focusMin || 0) + ' min'; c.appendChild(e); }); for (let j = w.length; j < 7; j++) { const e = document.createElement('div'); e.className = 'pomo-heat-cell'; c.appendChild(e); } });
  }

  function exportCSV() {
    const stats = getStats(), rows = [['Date', 'Focus Minutes', 'Sessions', 'Tasks Done']];
    Object.keys(stats).sort().forEach(d => { const s = stats[d]; rows.push([d, s.focusMin || 0, s.sessions || 0, s.tasksDone || 0]); });
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'pomodoro-stats-' + today() + '.csv'; a.click();
  }

  /* ═══════════ TABS ═══════════ */
  function initTabs() {
    $$('.pomo-tab').forEach(tab => tab.addEventListener('click', () => {
      $$('.pomo-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      $$('.pomo-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active'); tab.setAttribute('aria-selected', 'true');
      const p = $('panel-' + tab.dataset.tab); if (p) p.classList.add('active');
      if (tab.dataset.tab === 'stats') renderStats();
    }));
  }

  /* ═══════════ FULLSCREEN ═══════════ */
  function toggleFS() {
    S.fullscreen = !S.fullscreen; document.body.classList.toggle('pomo-fullscreen', S.fullscreen);
    $('pomo-fullscreen').textContent = S.fullscreen ? '✕' : '⛶';
  }

  /* ═══════════ KEYBOARD ═══════════ */
  function initKeys() {
    document.addEventListener('keydown', e => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.ctrlKey || e.metaKey || e.altKey) return;
      switch (e.key.toLowerCase()) {
        case ' ': e.preventDefault(); S.running ? pauseTimer() : startTimer(); break;
        case 'r': resetTimer(); break;
        case 's': skipPhase(); break;
        case 'f': toggleFS(); break;
        case 'm': S.muted = !S.muted; $('pomo-mute-btn').textContent = S.muted ? '🔇' : '🔊'; if (S.muted) stopAmbient(); else if (S.settings.ambient) startAmbient(S.settings.ambient); break;
        case 'escape': if (S.fullscreen) toggleFS(); if ($('pomo-modal-overlay').style.display !== 'none') closeSettings(); break;
      }
    });
  }

  /* ═══════════ INIT ═══════════ */
  function init() {
    loadSettings(); loadTasks();
    $('pomo-ring-progress').style.strokeDasharray = CIRC;
    initTimer(); initTabs(); applySettingsUI(); bindSettings(); renderTasks(); renderStats(); initKeys();

    // Timer controls — init AudioContext on first user gesture (required for mobile)
    $('pomo-start').addEventListener('click', () => { getCtx(); S.running ? pauseTimer() : startTimer(); });
    $('pomo-reset').addEventListener('click', resetTimer);
    $('pomo-skip').addEventListener('click', skipPhase);
    $('pomo-fullscreen').addEventListener('click', toggleFS);
    $('pomo-mute-btn').addEventListener('click', () => {
      S.muted = !S.muted; $('pomo-mute-btn').textContent = S.muted ? '🔇' : '🔊';
      if (S.muted) stopAmbient(); else if (S.settings.ambient) startAmbient(S.settings.ambient);
    });
    $('pomo-auto-start').addEventListener('change', () => { S.autoStart = $('pomo-auto-start').checked; });

    // Duration presets
    $$('.pomo-preset').forEach(p => p.addEventListener('click', () => {
      if (p.dataset.w === '0') { openSettings(); return; }
      S.settings.workMin = parseInt(p.dataset.w); S.settings.shortMin = parseInt(p.dataset.s); S.settings.longMin = parseInt(p.dataset.l);
      saveSettings(); applySettingsUI(); if (!S.running) initTimer();
    }));

    // Ambient pills — both groups
    $$('.pomo-ambient-pill').forEach(b => b.addEventListener('click', () => {
      getCtx(); // init AudioContext on user gesture (mobile requirement)
      if (S.settings.ambient === b.dataset.ambient) { S.settings.ambient = null; stopAmbient(); }
      else { S.settings.ambient = b.dataset.ambient; startAmbient(S.settings.ambient); }
      saveSettings(); applySettingsUI();
    }));
    $('pomo-ambient-vol-quick').addEventListener('input', () => {
      S.settings.ambientVol = parseInt($('pomo-ambient-vol-quick').value); saveSettings(); updateAmbientVol();
    });

    // Focus task inline
    $('pomo-focus-task-display').addEventListener('click', () => {
      $('pomo-focus-task-display').style.display = 'none';
      $('pomo-focus-task-input').style.display = 'flex';
      $('pomo-quick-task').focus();
    });
    function commitQuickTask() {
      const v = $('pomo-quick-task').value.trim();
      if (v) { addTask(v, 1); S.currentTaskId = S.tasks[S.tasks.length - 1].id; saveTasks(); updateFocusTask(); renderTasks(); }
      $('pomo-quick-task').value = '';
      $('pomo-focus-task-input').style.display = 'none';
      $('pomo-focus-task-display').style.display = 'flex';
    }
    $('pomo-quick-task-ok').addEventListener('click', commitQuickTask);
    $('pomo-quick-task').addEventListener('keydown', e => { if (e.key === 'Enter') commitQuickTask(); if (e.key === 'Escape') { $('pomo-focus-task-input').style.display = 'none'; $('pomo-focus-task-display').style.display = 'flex'; } });

    // Tasks tab
    $('pomo-task-add').addEventListener('click', () => { addTask($('pomo-task-input').value, $('pomo-task-est').value); $('pomo-task-input').value = ''; $('pomo-task-est').value = '1'; $('pomo-task-input').focus(); });
    $('pomo-task-input').addEventListener('keydown', e => { if (e.key === 'Enter') { addTask($('pomo-task-input').value, $('pomo-task-est').value); $('pomo-task-input').value = ''; $('pomo-task-est').value = '1'; } });
    $('pomo-clear-done').addEventListener('click', () => { S.tasks = S.tasks.filter(t => !t.done); saveTasks(); renderTasks(); });

    // Stats
    $('pomo-export-csv').addEventListener('click', exportCSV);
    $('pomo-clear-data').addEventListener('click', () => { if (!confirm('Delete all Pomodoro stats permanently?')) return; localStorage.removeItem('pomo_stats'); renderStats(); });
  }

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
