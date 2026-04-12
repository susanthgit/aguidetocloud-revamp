/* ──────────────────────────────────────────
   World Clock & Time Zone Converter
   100% client-side — zero API calls
   Uses native Intl.DateTimeFormat
   ────────────────────────────────────────── */

(function() {
'use strict';

/* ═══════════════════════════════════
   CITY DATABASE
   ═══════════════════════════════════ */

const CITIES = [
  // Oceania
  { city: 'Auckland', country: 'New Zealand', tz: 'Pacific/Auckland', flag: '🇳🇿' },
  { city: 'Wellington', country: 'New Zealand', tz: 'Pacific/Auckland', flag: '🇳🇿' },
  { city: 'Sydney', country: 'Australia', tz: 'Australia/Sydney', flag: '🇦🇺' },
  { city: 'Melbourne', country: 'Australia', tz: 'Australia/Melbourne', flag: '🇦🇺' },
  { city: 'Brisbane', country: 'Australia', tz: 'Australia/Brisbane', flag: '🇦🇺' },
  { city: 'Perth', country: 'Australia', tz: 'Australia/Perth', flag: '🇦🇺' },
  // Asia
  { city: 'Tokyo', country: 'Japan', tz: 'Asia/Tokyo', flag: '🇯🇵' },
  { city: 'Singapore', country: 'Singapore', tz: 'Asia/Singapore', flag: '🇸🇬' },
  { city: 'Hong Kong', country: 'China', tz: 'Asia/Hong_Kong', flag: '🇭🇰' },
  { city: 'Shanghai', country: 'China', tz: 'Asia/Shanghai', flag: '🇨🇳' },
  { city: 'Beijing', country: 'China', tz: 'Asia/Shanghai', flag: '🇨🇳' },
  { city: 'Seoul', country: 'South Korea', tz: 'Asia/Seoul', flag: '🇰🇷' },
  { city: 'Mumbai', country: 'India', tz: 'Asia/Kolkata', flag: '🇮🇳' },
  { city: 'Delhi', country: 'India', tz: 'Asia/Kolkata', flag: '🇮🇳' },
  { city: 'Bangalore', country: 'India', tz: 'Asia/Kolkata', flag: '🇮🇳' },
  { city: 'Kolkata', country: 'India', tz: 'Asia/Kolkata', flag: '🇮🇳' },
  { city: 'Dubai', country: 'UAE', tz: 'Asia/Dubai', flag: '🇦🇪' },
  { city: 'Abu Dhabi', country: 'UAE', tz: 'Asia/Dubai', flag: '🇦🇪' },
  { city: 'Riyadh', country: 'Saudi Arabia', tz: 'Asia/Riyadh', flag: '🇸🇦' },
  { city: 'Bangkok', country: 'Thailand', tz: 'Asia/Bangkok', flag: '🇹🇭' },
  { city: 'Jakarta', country: 'Indonesia', tz: 'Asia/Jakarta', flag: '🇮🇩' },
  { city: 'Kuala Lumpur', country: 'Malaysia', tz: 'Asia/Kuala_Lumpur', flag: '🇲🇾' },
  { city: 'Manila', country: 'Philippines', tz: 'Asia/Manila', flag: '🇵🇭' },
  { city: 'Taipei', country: 'Taiwan', tz: 'Asia/Taipei', flag: '🇹🇼' },
  { city: 'Karachi', country: 'Pakistan', tz: 'Asia/Karachi', flag: '🇵🇰' },
  { city: 'Doha', country: 'Qatar', tz: 'Asia/Qatar', flag: '🇶🇦' },
  // Europe
  { city: 'London', country: 'UK', tz: 'Europe/London', flag: '🇬🇧' },
  { city: 'Paris', country: 'France', tz: 'Europe/Paris', flag: '🇫🇷' },
  { city: 'Berlin', country: 'Germany', tz: 'Europe/Berlin', flag: '🇩🇪' },
  { city: 'Amsterdam', country: 'Netherlands', tz: 'Europe/Amsterdam', flag: '🇳🇱' },
  { city: 'Madrid', country: 'Spain', tz: 'Europe/Madrid', flag: '🇪🇸' },
  { city: 'Rome', country: 'Italy', tz: 'Europe/Rome', flag: '🇮🇹' },
  { city: 'Zurich', country: 'Switzerland', tz: 'Europe/Zurich', flag: '🇨🇭' },
  { city: 'Stockholm', country: 'Sweden', tz: 'Europe/Stockholm', flag: '🇸🇪' },
  { city: 'Dublin', country: 'Ireland', tz: 'Europe/Dublin', flag: '🇮🇪' },
  { city: 'Lisbon', country: 'Portugal', tz: 'Europe/Lisbon', flag: '🇵🇹' },
  { city: 'Warsaw', country: 'Poland', tz: 'Europe/Warsaw', flag: '🇵🇱' },
  { city: 'Athens', country: 'Greece', tz: 'Europe/Athens', flag: '🇬🇷' },
  { city: 'Istanbul', country: 'Turkey', tz: 'Europe/Istanbul', flag: '🇹🇷' },
  { city: 'Moscow', country: 'Russia', tz: 'Europe/Moscow', flag: '🇷🇺' },
  { city: 'Helsinki', country: 'Finland', tz: 'Europe/Helsinki', flag: '🇫🇮' },
  // Americas
  { city: 'New York', country: 'USA', tz: 'America/New_York', flag: '🇺🇸' },
  { city: 'Los Angeles', country: 'USA', tz: 'America/Los_Angeles', flag: '🇺🇸' },
  { city: 'Chicago', country: 'USA', tz: 'America/Chicago', flag: '🇺🇸' },
  { city: 'Denver', country: 'USA', tz: 'America/Denver', flag: '🇺🇸' },
  { city: 'San Francisco', country: 'USA', tz: 'America/Los_Angeles', flag: '🇺🇸' },
  { city: 'Seattle', country: 'USA', tz: 'America/Los_Angeles', flag: '🇺🇸' },
  { city: 'Toronto', country: 'Canada', tz: 'America/Toronto', flag: '🇨🇦' },
  { city: 'Vancouver', country: 'Canada', tz: 'America/Vancouver', flag: '🇨🇦' },
  { city: 'Mexico City', country: 'Mexico', tz: 'America/Mexico_City', flag: '🇲🇽' },
  { city: 'São Paulo', country: 'Brazil', tz: 'America/Sao_Paulo', flag: '🇧🇷' },
  { city: 'Buenos Aires', country: 'Argentina', tz: 'America/Argentina/Buenos_Aires', flag: '🇦🇷' },
  { city: 'Santiago', country: 'Chile', tz: 'America/Santiago', flag: '🇨🇱' },
  { city: 'Bogotá', country: 'Colombia', tz: 'America/Bogota', flag: '🇨🇴' },
  { city: 'Lima', country: 'Peru', tz: 'America/Lima', flag: '🇵🇪' },
  // Africa
  { city: 'Cairo', country: 'Egypt', tz: 'Africa/Cairo', flag: '🇪🇬' },
  { city: 'Lagos', country: 'Nigeria', tz: 'Africa/Lagos', flag: '🇳🇬' },
  { city: 'Johannesburg', country: 'South Africa', tz: 'Africa/Johannesburg', flag: '🇿🇦' },
  { city: 'Nairobi', country: 'Kenya', tz: 'Africa/Nairobi', flag: '🇰🇪' },
  { city: 'Casablanca', country: 'Morocco', tz: 'Africa/Casablanca', flag: '🇲🇦' },
  // Other
  { city: 'Honolulu', country: 'USA', tz: 'Pacific/Honolulu', flag: '🇺🇸' },
  { city: 'Anchorage', country: 'USA', tz: 'America/Anchorage', flag: '🇺🇸' },
  { city: 'Reykjavik', country: 'Iceland', tz: 'Atlantic/Reykjavik', flag: '🇮🇸' },
];

const QUICK_CITIES = ['London', 'New York', 'Tokyo', 'Sydney', 'Auckland', 'Dubai', 'Singapore'];

/* ═══════════════════════════════════
   STATE
   ═══════════════════════════════════ */

const S = {
  clocks: [],          // Tab 1
  use24h: true,
  targets: [],         // Tab 2
  participants: [],    // Tab 3
  participantHours: {}, // { "Auckland": { start: 9, end: 17 } }
  duration: 60,        // meeting duration in minutes
  teamPresets: [],     // [{ name: "APAC Team", cities: ["Auckland","London","Mumbai"] }]
  localTz: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

/* ═══════════════════════════════════
   UTILITY FUNCTIONS
   ═══════════════════════════════════ */

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function formatTime(date, tz, use24h) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: !use24h,
  }).format(date);
}

function formatTimeShort(date, tz, use24h) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
    hour12: !use24h,
  }).format(date);
}

function formatDate(date, tz) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatDateShort(date, tz) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date);
}

function getUtcOffset(tz, date) {
  const d = date || new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    timeZoneName: 'shortOffset',
  }).formatToParts(d);
  const offsetPart = parts.find(p => p.type === 'timeZoneName');
  return offsetPart ? offsetPart.value : '';
}

function isDstActive(tz) {
  const jan = new Date(new Date().getFullYear(), 0, 1);
  const jul = new Date(new Date().getFullYear(), 6, 1);
  const janOff = getOffsetMinutes(jan, tz);
  const julOff = getOffsetMinutes(jul, tz);
  if (janOff === julOff) return null; // no DST
  const nowOff = getOffsetMinutes(new Date(), tz);
  return nowOff !== Math.min(janOff, julOff);
}

function getOffsetMinutes(date, tz) {
  const utcStr = date.toLocaleString('en-US', { timeZone: 'UTC' });
  const tzStr = date.toLocaleString('en-US', { timeZone: tz });
  return (new Date(tzStr) - new Date(utcStr)) / 60000;
}

function getRelativeDay(tz) {
  const now = new Date();
  const localParts = new Intl.DateTimeFormat('en-CA', { timeZone: S.localTz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const targetParts = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  if (localParts === targetParts) return { text: 'Same day', cls: 'same-day' };
  // Compare as ISO strings (YYYY-MM-DD) for correct ordering
  if (targetParts > localParts) return { text: 'Tomorrow', cls: 'diff-day' };
  return { text: 'Yesterday', cls: 'diff-day' };
}

function getRelativeOffset(tz) {
  const nowOff = getOffsetMinutes(new Date(), S.localTz);
  const targetOff = getOffsetMinutes(new Date(), tz);
  const diff = (targetOff - nowOff) / 60;
  if (diff === 0) return 'Same time as you';
  const abs = Math.abs(diff);
  const h = Math.floor(abs);
  const m = (abs - h) * 60;
  let str = h > 0 ? `${h}h` : '';
  if (m > 0) str += `${Math.round(m)}m`;
  return diff > 0 ? `${str} ahead` : `${str} behind`;
}

function getHourInTz(date, tz) {
  return parseInt(new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hour12: false }).format(date));
}

function getBizClass(hour, workStart, workEnd) {
  const ws = workStart !== undefined ? workStart : 9;
  const we = workEnd !== undefined ? workEnd : 17;
  const extBefore = Math.max(ws - 2, 0);
  const extAfter = Math.min(we + 3, 24);
  if (hour >= ws && hour < we) return 'biz';
  if ((hour >= extBefore && hour < ws) || (hour >= we && hour < extAfter)) return 'ext';
  return 'off';
}

function getBizLabel(hour, workStart, workEnd) {
  const ws = workStart !== undefined ? workStart : 9;
  const we = workEnd !== undefined ? workEnd : 17;
  const extBefore = Math.max(ws - 2, 0);
  const extAfter = Math.min(we + 3, 24);
  if (hour >= ws && hour < we) return { text: 'Business hours', cls: 'biz-green' };
  if ((hour >= extBefore && hour < ws) || (hour >= we && hour < extAfter)) return { text: 'Extended hours', cls: 'biz-yellow' };
  return { text: 'Outside hours', cls: 'biz-red' };
}

function findCity(name) {
  return CITIES.find(c => c.city === name);
}

function searchCities(query) {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase();
  return CITIES.filter(c =>
    c.city.toLowerCase().includes(q) ||
    c.country.toLowerCase().includes(q) ||
    c.tz.toLowerCase().includes(q)
  ).slice(0, 10);
}

function saveState() {
  try {
    localStorage.setItem('wclk_clocks', JSON.stringify(S.clocks.map(c => c.city)));
    localStorage.setItem('wclk_24h', S.use24h ? '1' : '0');
    localStorage.setItem('wclk_presets', JSON.stringify(S.teamPresets));
    localStorage.setItem('wclk_hours', JSON.stringify(S.participantHours));
    localStorage.setItem('wclk_duration', String(S.duration));
  } catch(e) {}
}

function loadState() {
  try {
    const saved = localStorage.getItem('wclk_clocks');
    if (saved) {
      const names = JSON.parse(saved);
      names.forEach(name => {
        const c = findCity(name);
        if (c && !S.clocks.find(x => x.city === name)) S.clocks.push(c);
      });
    }
    const fmt = localStorage.getItem('wclk_24h');
    if (fmt !== null) S.use24h = fmt === '1';
    const presets = localStorage.getItem('wclk_presets');
    if (presets) S.teamPresets = JSON.parse(presets);
    const hours = localStorage.getItem('wclk_hours');
    if (hours) S.participantHours = JSON.parse(hours);
    const dur = localStorage.getItem('wclk_duration');
    if (dur) S.duration = parseInt(dur) || 60;
  } catch(e) {}
}

/* ═══════════════════════════════════
   TAB SWITCHING
   ═══════════════════════════════════ */

function initTabs() {
  document.querySelectorAll('.wclk-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.wclk-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      document.querySelectorAll('.wclk-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const panel = document.getElementById('panel-' + tab.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });
}

/* ═══════════════════════════════════
   SEARCH DROPDOWN (reusable)
   ═══════════════════════════════════ */

function setupSearch(inputId, resultsId, onSelect, excludeFn) {
  const input = document.getElementById(inputId);
  const results = document.getElementById(resultsId);
  if (!input || !results) return;
  let highlighted = -1;

  input.addEventListener('input', () => {
    const q = input.value.trim();
    let matches = searchCities(q);
    if (excludeFn) matches = matches.filter(c => !excludeFn(c));
    highlighted = -1;
    if (matches.length === 0) { results.classList.remove('open'); return; }
    results.innerHTML = matches.map((c, i) =>
      `<div class="wclk-search-item" data-idx="${i}">${esc(c.flag)} ${esc(c.city)}, ${esc(c.country)} <span class="wclk-search-item-tz">${esc(getUtcOffset(c.tz))}</span></div>`
    ).join('');
    results.classList.add('open');
    results.querySelectorAll('.wclk-search-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.idx);
        onSelect(matches[idx]);
        input.value = '';
        results.classList.remove('open');
      });
    });
  });

  input.addEventListener('keydown', (e) => {
    const items = results.querySelectorAll('.wclk-search-item');
    if (!items.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); highlighted = Math.min(highlighted + 1, items.length - 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); highlighted = Math.max(highlighted - 1, 0); }
    else if (e.key === 'Enter' && highlighted >= 0) { e.preventDefault(); items[highlighted].click(); return; }
    else if (e.key === 'Escape') { results.classList.remove('open'); return; }
    else return;
    items.forEach((it, i) => it.classList.toggle('highlighted', i === highlighted));
  });

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !results.contains(e.target)) results.classList.remove('open');
  });
}

/* ═══════════════════════════════════
   TAB 1: WORLD CLOCK
   ═══════════════════════════════════ */

function initWorldClock() {
  loadState();

  // Format toggle
  const toggle = document.getElementById('wclk-format-toggle');
  if (toggle) {
    toggle.textContent = S.use24h ? '24h' : '12h';
    toggle.addEventListener('click', () => {
      S.use24h = !S.use24h;
      toggle.textContent = S.use24h ? '24h' : '12h';
      saveState();
      renderClocks();
      renderConvertResults();
      renderMeetingTimeline();
    });
  }

  // Quick add buttons
  const quickContainer = document.getElementById('wclk-quick-adds');
  if (quickContainer) {
    QUICK_CITIES.forEach(name => {
      const c = findCity(name);
      if (!c) return;
      const btn = document.createElement('button');
      btn.className = 'wclk-quick-btn';
      btn.textContent = `${c.flag} ${c.city}`;
      btn.addEventListener('click', () => {
        if (!S.clocks.find(x => x.city === c.city)) {
          S.clocks.push(c);
          saveState();
          renderClocks();
          updateQuickButtons();
        }
      });
      quickContainer.appendChild(btn);
    });
  }

  // Search
  setupSearch('wclk-city-search', 'wclk-search-results', (city) => {
    if (!S.clocks.find(c => c.city === city.city)) {
      S.clocks.push(city);
      saveState();
      renderClocks();
      updateQuickButtons();
    }
  }, (c) => S.clocks.some(x => x.city === c.city));

  renderClocks();
  updateQuickButtons();
  startTicking();
}

function updateQuickButtons() {
  document.querySelectorAll('.wclk-quick-btn').forEach(btn => {
    const name = btn.textContent.slice(btn.textContent.indexOf(' ') + 1);
    btn.classList.toggle('added', S.clocks.some(c => c.city === name));
  });
}

function renderClocks() {
  const grid = document.getElementById('wclk-grid');
  const hint = document.getElementById('wclk-empty-hint');
  if (!grid) return;

  if (S.clocks.length === 0) {
    grid.innerHTML = '';
    if (hint) hint.style.display = '';
    return;
  }
  if (hint) hint.style.display = 'none';

  const now = new Date();
  grid.innerHTML = S.clocks.map((c, i) => {
    const dst = isDstActive(c.tz);
    const rel = getRelativeDay(c.tz);
    const offset = getRelativeOffset(c.tz);
    return `<div class="wclk-card" data-idx="${i}">
      <div class="wclk-card-header">
        <div class="wclk-card-city">${esc(c.flag)} ${esc(c.city)}, ${esc(c.country)}</div>
        <button class="wclk-card-remove" data-idx="${i}" title="Remove">✕</button>
      </div>
      <div class="wclk-card-time" data-tz="${esc(c.tz)}">${formatTime(now, c.tz, S.use24h)}</div>
      <div class="wclk-card-date">${formatDateShort(now, c.tz)}</div>
      <div class="wclk-card-meta">
        <span class="wclk-card-badge">${esc(getUtcOffset(c.tz))}</span>
        <span class="wclk-card-badge">${esc(offset)}</span>
        ${dst !== null ? `<span class="wclk-card-badge dst-active">${dst ? '🌞 DST' : '⏰ Standard'}</span>` : ''}
        <span class="wclk-card-badge ${rel.cls}">${rel.text}</span>
      </div>
    </div>`;
  }).join('');

  grid.querySelectorAll('.wclk-card-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.idx);
      S.clocks.splice(idx, 1);
      saveState();
      renderClocks();
      updateQuickButtons();
    });
  });
}

function startTicking() {
  let lastMinute = -1;
  setInterval(() => {
    const now = new Date();
    const currentMinute = now.getMinutes();
    // Local time
    const localEl = document.getElementById('wclk-local-time');
    const localDet = document.getElementById('wclk-local-details');
    if (localEl) localEl.textContent = formatTime(now, S.localTz, S.use24h);
    if (localDet) {
      const dst = isDstActive(S.localTz);
      localDet.textContent = `${formatDate(now, S.localTz)} · ${getUtcOffset(S.localTz)}${dst !== null ? (dst ? ' · 🌞 DST Active' : ' · ⏰ Standard Time') : ''}`;
    }
    // Clock cards — update time every second
    document.querySelectorAll('.wclk-card-time[data-tz]').forEach(el => {
      el.textContent = formatTime(now, el.dataset.tz, S.use24h);
    });
    // Full card refresh every minute (catches date/DST/offset changes)
    if (currentMinute !== lastMinute) {
      lastMinute = currentMinute;
      if (S.clocks.length > 0) renderClocks();
    }
  }, 1000);
}

/* ═══════════════════════════════════
   TAB 2: CONVERT
   ═══════════════════════════════════ */

function initConvert() {
  const dtInput = document.getElementById('wclk-conv-datetime');
  const sourceSelect = document.getElementById('wclk-conv-source');
  if (!dtInput || !sourceSelect) return;

  // Set default to now
  const now = new Date();
  dtInput.value = toLocalISOString(now);

  // Populate source dropdown with all IANA zones grouped
  const allZones = getAllTimezones();
  sourceSelect.innerHTML = allZones.map(tz =>
    `<option value="${esc(tz)}" ${tz === S.localTz ? 'selected' : ''}>${esc(tz.replace(/_/g, ' '))} (${esc(getUtcOffset(tz))})</option>`
  ).join('');

  // Presets
  document.querySelectorAll('.wclk-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = btn.dataset.preset;
      const d = new Date();
      if (p === 'now') { /* already now */ }
      else if (p === 'tomorrow9') { d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); }
      else if (p === 'monday10') {
        const day = d.getDay();
        const daysUntilMon = day === 0 ? 1 : day === 1 ? 7 : 8 - day;
        d.setDate(d.getDate() + daysUntilMon);
        d.setHours(10, 0, 0, 0);
      }
      dtInput.value = toLocalISOString(d);
      renderConvertResults();
    });
  });

  // Target search
  setupSearch('wclk-target-search', 'wclk-target-results', (city) => {
    if (!S.targets.find(t => t.city === city.city)) {
      S.targets.push(city);
      renderConvertResults();
    }
  }, (c) => S.targets.some(t => t.city === c.city));

  dtInput.addEventListener('change', renderConvertResults);
  sourceSelect.addEventListener('change', renderConvertResults);
}

function toLocalISOString(d) {
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getAllTimezones() {
  try { return Intl.supportedValuesOf('timeZone'); }
  catch(e) {
    return CITIES.map(c => c.tz).filter((v,i,a) => a.indexOf(v) === i).sort();
  }
}

function renderConvertResults() {
  const container = document.getElementById('wclk-convert-results');
  const hint = document.getElementById('wclk-convert-hint');
  if (!container) return;

  if (S.targets.length === 0) {
    container.innerHTML = '';
    if (hint) hint.style.display = '';
    return;
  }
  if (hint) hint.style.display = 'none';

  const dtInput = document.getElementById('wclk-conv-datetime');
  const sourceSelect = document.getElementById('wclk-conv-source');
  const sourceTz = sourceSelect.value;

  // Parse the input datetime in the source timezone
  const inputDate = new Date(dtInput.value);
  // Adjust: inputDate is in local browser time, we need it in sourceTz
  const localOff = getOffsetMinutes(inputDate, S.localTz);
  const sourceOff = getOffsetMinutes(inputDate, sourceTz);
  const adjusted = new Date(inputDate.getTime() + (localOff - sourceOff) * 60000);

  container.innerHTML = S.targets.map((c, i) => {
    const hour = getHourInTz(adjusted, c.tz);
    const biz = getBizLabel(hour);
    return `<div class="wclk-result-card">
      <div>
        <div class="wclk-result-city">${esc(c.flag)} ${esc(c.city)}</div>
        <div class="wclk-result-day">${formatDateShort(adjusted, c.tz)}</div>
        <span class="wclk-result-biz ${biz.cls}">${biz.text}</span>
      </div>
      <div style="text-align:right;display:flex;align-items:center;gap:0.5rem">
        <div>
          <div class="wclk-result-time">${formatTimeShort(adjusted, c.tz, S.use24h)}</div>
          <div style="font-size:0.72rem;color:var(--wclk-text-dim)">${esc(getUtcOffset(c.tz))}</div>
        </div>
        <button class="wclk-result-remove" data-idx="${i}" title="Remove">✕</button>
      </div>
    </div>`;
  }).join('');

  container.querySelectorAll('.wclk-result-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      S.targets.splice(parseInt(btn.dataset.idx), 1);
      renderConvertResults();
    });
  });
}

/* ═══════════════════════════════════
   TAB 3: MEETING PLANNER
   ═══════════════════════════════════ */

function initMeetingPlanner() {
  const dateInput = document.getElementById('wclk-meeting-date');
  if (!dateInput) return;

  // Default to today
  const now = new Date();
  dateInput.value = toLocalISOString(now).split('T')[0];

  // Add local user as first participant
  const localCity = CITIES.find(c => c.tz === S.localTz);
  if (localCity && !S.participants.find(p => p.tz === S.localTz)) {
    S.participants.push(localCity);
  }

  setupSearch('wclk-participant-search', 'wclk-participant-results', (city) => {
    if (!S.participants.find(p => p.city === city.city)) {
      S.participants.push(city);
      renderMeetingTimeline();
    }
  }, (c) => S.participants.some(p => p.city === c.city));

  dateInput.addEventListener('change', renderMeetingTimeline);
  renderMeetingTimeline();
}

function renderMeetingTimeline() {
  const container = document.getElementById('wclk-meeting-timeline');
  const goldenContainer = document.getElementById('wclk-meeting-golden');
  const summaryContainer = document.getElementById('wclk-meeting-summary');
  const hint = document.getElementById('wclk-meeting-hint');
  if (!container) return;

  if (S.participants.length === 0) {
    container.innerHTML = '';
    if (goldenContainer) goldenContainer.innerHTML = '';
    if (summaryContainer) summaryContainer.innerHTML = '';
    if (hint) hint.style.display = '';
    return;
  }
  if (hint) hint.style.display = 'none';

  const dateInput = document.getElementById('wclk-meeting-date');
  const baseDate = new Date(dateInput.value + 'T00:00:00');

  // Hour labels
  let html = '<div class="wclk-timeline-hours">';
  for (let h = 0; h < 24; h++) html += `<span>${h}</span>`;
  html += '</div>';

  // Legend
  html += `<div class="wclk-timeline-legend">
    <div class="wclk-legend-item"><div class="wclk-legend-swatch biz"></div> Business (9-5)</div>
    <div class="wclk-legend-item"><div class="wclk-legend-swatch ext"></div> Extended (7-9, 5-8)</div>
    <div class="wclk-legend-item"><div class="wclk-legend-swatch off"></div> Off hours</div>
  </div>`;

  // Find golden hours (all participants in business hours)
  const goldenHours = [];
  for (let h = 0; h < 24; h++) {
    const testDate = new Date(baseDate.getTime());
    // Set hour in UTC perspective
    const localOff = getOffsetMinutes(testDate, S.localTz);
    testDate.setHours(h);
    testDate.setMinutes(0);
    // Adjust to local user's timezone
    const adjustedDate = new Date(testDate.getTime() - (localOff - getOffsetMinutes(testDate, S.localTz)) * 60000);

    const allBiz = S.participants.every(p => {
      const pHour = getHourInTz(adjustedDate, p.tz);
      return pHour >= 9 && pHour < 17;
    });
    if (allBiz) goldenHours.push(h);
  }

  // Timeline rows
  S.participants.forEach((p, i) => {
    html += `<div class="wclk-timeline-row">
      <div class="wclk-timeline-label">${esc(p.flag)} ${esc(p.city)}<br><span class="wclk-timeline-label-sub">${esc(getUtcOffset(p.tz))}</span></div>
      <div class="wclk-timeline-bar">`;

    for (let h = 0; h < 24; h++) {
      const testDate = new Date(baseDate.getTime());
      testDate.setHours(h, 0, 0, 0);
      const pHour = getHourInTz(testDate, p.tz);
      const cls = getBizClass(pHour);
      const isGolden = goldenHours.includes(h);
      html += `<div class="wclk-timeline-hour ${cls}${isGolden ? ' golden' : ''}" title="${pHour}:00 in ${esc(p.city)}"></div>`;
    }

    html += `</div><button class="wclk-timeline-remove" data-idx="${i}" title="Remove">✕</button></div>`;
  });

  container.innerHTML = html;

  // Remove buttons
  container.querySelectorAll('.wclk-timeline-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      S.participants.splice(parseInt(btn.dataset.idx), 1);
      renderMeetingTimeline();
    });
  });

  // Golden window
  if (goldenContainer) {
    if (goldenHours.length > 0) {
      // Group into contiguous ranges
      const ranges = [];
      let start = goldenHours[0];
      let prev = goldenHours[0];
      for (let i = 1; i < goldenHours.length; i++) {
        if (goldenHours[i] !== prev + 1) {
          ranges.push({ start, end: prev + 1 });
          start = goldenHours[i];
        }
        prev = goldenHours[i];
      }
      ranges.push({ start, end: prev + 1 });

      const bestRange = ranges.reduce((a, b) => (b.end - b.start) > (a.end - a.start) ? b : a);
      let details = S.participants.map(p => {
        const testDate = new Date(baseDate.getTime());
        testDate.setHours(bestRange.start, 0, 0, 0);
        return `${p.flag} ${p.city}: ${formatTimeShort(testDate, p.tz, S.use24h)}`;
      }).join(' · ');
      const totalHours = goldenHours.length;
      const rangeText = ranges.length === 1
        ? `${bestRange.start}:00 – ${bestRange.end}:00 (your time)`
        : ranges.map(r => `${r.start}:00–${r.end}:00`).join(', ') + ' (your time)';
      goldenContainer.innerHTML = `<div class="wclk-golden-box">
        <div class="wclk-golden-title">✅ Golden Window Found</div>
        <div class="wclk-golden-time">${rangeText}</div>
        <div class="wclk-golden-details">${totalHours} hour${totalHours > 1 ? 's' : ''} where everyone is in business hours<br>${esc(details)}</div>
      </div>`;
    } else if (S.participants.length >= 2) {
      goldenContainer.innerHTML = `<div class="wclk-golden-box wclk-no-golden">
        <div class="wclk-golden-title">⚠️ No Full Overlap</div>
        <div class="wclk-golden-details">There's no hour where all participants are in 9-5 business hours. Look for the most green overlap in the timeline above.</div>
      </div>`;
    } else {
      goldenContainer.innerHTML = '';
    }
  }

  // Copy summary button
  if (summaryContainer && S.participants.length >= 2) {
    summaryContainer.innerHTML = `<button class="wclk-copy-btn" id="wclk-copy-meeting">📋 Copy Meeting Summary</button>`;
    document.getElementById('wclk-copy-meeting').addEventListener('click', () => {
      let text = `Meeting Time Comparison (${dateInput.value}):\n`;
      if (goldenHours.length > 0) {
        text += `\n✅ Best time: ${goldenHours[0]}:00 – ${goldenHours[goldenHours.length-1]+1}:00 (${S.participants[0].city} time)\n`;
      }
      S.participants.forEach(p => {
        const testDate = new Date(baseDate.getTime());
        testDate.setHours(goldenHours.length > 0 ? goldenHours[0] : 9, 0, 0, 0);
        text += `${p.flag} ${p.city}: ${formatTimeShort(testDate, p.tz, S.use24h)} (${getUtcOffset(p.tz)})\n`;
      });
      navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('wclk-copy-meeting');
        btn.textContent = '✅ Copied!';
        setTimeout(() => { btn.textContent = '📋 Copy Meeting Summary'; }, 2000);
      }).catch(() => {
        prompt('Copy this meeting summary:', text);
      });
    });
  } else if (summaryContainer) {
    summaryContainer.innerHTML = '';
  }
}

/* ═══════════════════════════════════
   TAB 4: DST GUIDE
   ═══════════════════════════════════ */

function initDstGuide() {
  setupSearch('wclk-dst-search', 'wclk-dst-results', (city) => {
    showDstInfo(city);
  });
}

function showDstInfo(city) {
  const info = document.getElementById('wclk-dst-info');
  if (!info) return;

  const dst = isDstActive(city.tz);
  const offset = getUtcOffset(city.tz);

  let html = `<h4>${esc(city.flag)} ${esc(city.city)}, ${esc(city.country)}</h4>`;
  html += `<p><strong>Time Zone:</strong> ${esc(city.tz)} (${esc(offset)})</p>`;

  if (dst === null) {
    html += `<p>🚫 <strong>${esc(city.city)} does not observe Daylight Saving Time.</strong></p>`;
    html += `<p>The UTC offset stays at ${esc(offset)} all year round. No clock changes — ever. This makes scheduling easier!</p>`;
  } else {
    html += `<p>${dst ? '🌞' : '⏰'} <strong>Currently in ${dst ? 'Daylight Saving Time (summer time)' : 'Standard Time (winter time)'}.</strong></p>`;

    // Find next DST transition by checking month boundaries
    const now = new Date();
    const currentOff = getOffsetMinutes(now, city.tz);
    let transitionDate = null;
    for (let m = 0; m < 12; m++) {
      const testDate = new Date(now.getFullYear(), now.getMonth() + m + 1, 1);
      const testOff = getOffsetMinutes(testDate, city.tz);
      if (testOff !== currentOff) {
        // Narrow down to the exact week
        let lo = new Date(now.getFullYear(), now.getMonth() + m, 1);
        let hi = testDate;
        while (hi - lo > 86400000) {
          const mid = new Date((lo.getTime() + hi.getTime()) / 2);
          if (getOffsetMinutes(mid, city.tz) === currentOff) lo = mid;
          else hi = mid;
        }
        transitionDate = hi;
        break;
      }
    }

    if (transitionDate) {
      const daysUntil = Math.ceil((transitionDate - now) / 86400000);
      const willSpring = !dst;
      html += `<p>📅 <strong>Next change:</strong> around ${formatDate(transitionDate, city.tz)} (${daysUntil} days from now)</p>`;
      html += `<p>Clocks will ${willSpring ? '⏩ spring forward (lose 1 hour)' : '⏪ fall back (gain 1 hour)'}.</p>`;
    }
  }

  info.innerHTML = html;
  info.classList.add('visible');
}

/* ═══════════════════════════════════
   INIT
   ═══════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initWorldClock();
  initConvert();
  initMeetingPlanner();
  initDstGuide();
});

})();
