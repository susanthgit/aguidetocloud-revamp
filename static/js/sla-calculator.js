(function () {
  'use strict';
  const TIERS = window.__slaTiers || [];
  const M365 = window.__m365Slas || [];

  function esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

  /* ── Time math ── */
  const MINS_YEAR = 525960, MINS_MONTH = 43830, MINS_WEEK = 10080, MINS_DAY = 1440;

  function downtimeMins(pct, totalMins) { return totalMins * (1 - pct / 100); }

  function fmtDuration(mins) {
    if (mins <= 0) return '0s';
    const d = Math.floor(mins / 1440);
    const h = Math.floor((mins % 1440) / 60);
    const m = Math.floor(mins % 60);
    const s = Math.round((mins % 1) * 60);
    const parts = [];
    if (d) parts.push(d + 'd');
    if (h) parts.push(h + 'h');
    if (m) parts.push(m + 'm');
    if (s || !parts.length) parts.push(s + 's');
    return parts.join(' ');
  }

  function fmtPrecise(mins) {
    const h = Math.floor(mins / 60);
    const m = Math.floor(mins % 60);
    const s = Math.round((mins % 1) * 60);
    return (h ? h + ' hr ' : '') + (m ? m + ' min ' : '') + s + ' sec';
  }

  function ninesLabel(pct) {
    if (pct >= 99.999) return 'Five Nines';
    if (pct >= 99.99) return 'Four Nines';
    if (pct >= 99.95) return 'Three-and-a-Half Nines';
    if (pct >= 99.9) return 'Three Nines';
    if (pct >= 99.5) return 'Two-and-a-Half Nines';
    if (pct >= 99) return 'Two Nines';
    return '';
  }

  /* ── Tabs ── */
  function initTabs() {
    document.querySelectorAll('.slacalc-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.slacalc-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        document.querySelectorAll('.slacalc-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active'); tab.setAttribute('aria-selected', 'true');
        const p = document.getElementById('panel-' + tab.dataset.tab);
        if (p) p.classList.add('active');
      });
    });
  }

  /* ── Mode switching ── */
  function initModes() {
    document.querySelectorAll('.slacalc-mode').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.slacalc-mode').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        ['forward', 'reverse', 'incident'].forEach(m => {
          const el = document.getElementById('mode-' + m);
          if (el) el.style.display = m === btn.dataset.mode ? '' : 'none';
        });
      });
    });
  }

  /* ── Forward calc ── */
  function calcForward() {
    const pct = parseFloat(document.getElementById('sla-input').value);
    if (isNaN(pct) || pct < 0 || pct > 100) return;
    const label = ninesLabel(pct);
    const year = downtimeMins(pct, MINS_YEAR);
    const month = downtimeMins(pct, MINS_MONTH);
    const week = downtimeMins(pct, MINS_WEEK);
    const day = downtimeMins(pct, MINS_DAY);

    const el = document.getElementById('forward-results');
    el.innerHTML =
      (label ? '<div class="slacalc-nines-label"><strong>' + esc(pct + '%') + '</strong> — ' + esc(label) + '</div>' : '') +
      '<div class="slacalc-result-grid">' +
      card('Per Year', fmtDuration(year), fmtPrecise(year)) +
      card('Per Month', fmtDuration(month), fmtPrecise(month)) +
      card('Per Week', fmtDuration(week), fmtPrecise(week)) +
      card('Per Day', fmtDuration(day), fmtPrecise(day)) +
      '</div>' +
      '<div class="slacalc-plain-english">' + plainEnglish(pct, month) + '</div>';
    syncURL('sla', pct);
  }

  function plainEnglish(pct, monthMins) {
    const outages = Math.floor(monthMins / 15) || 0;
    let msg = '';
    if (pct >= 99.999) msg = 'Practically zero tolerance — even a router reboot could breach this SLA.';
    else if (pct >= 99.99) msg = 'You can afford roughly <strong>1 brief outage per month</strong> (under 5 minutes). Planned maintenance windows must be surgical.';
    else if (pct >= 99.95) msg = 'Room for about <strong>1 short outage</strong> (~22 min/month). Most Azure Availability Zone SLAs sit here.';
    else if (pct >= 99.9) msg = 'The most common cloud SLA. You get about <strong>' + esc(fmtDuration(monthMins)) + ' per month</strong> — roughly one 43-minute outage or a few shorter ones.';
    else if (pct >= 99.5) msg = 'About <strong>' + esc(fmtDuration(monthMins)) + ' downtime per month</strong>. Acceptable for non-critical internal tools.';
    else if (pct >= 99) msg = 'Nearly <strong>7.5 hours per month</strong> of allowed downtime. Only appropriate for best-effort services.';
    else msg = 'This SLA allows significant downtime. Consider whether this meets your business requirements.';
    return '<div class="slacalc-context-card"><span class="slacalc-context-icon">💡</span><div>' + msg + '</div></div>';
  }

  function card(period, value, detail) {
    return '<div class="slacalc-result-card"><div class="period">' + esc(period) +
      '</div><div class="value">' + esc(value) + '</div><div class="detail">' + esc(detail) + '</div></div>';
  }

  /* ── Reverse calc ── */
  function calcReverse() {
    const h = parseFloat(document.getElementById('rev-hours').value) || 0;
    const m = parseFloat(document.getElementById('rev-mins').value) || 0;
    const period = document.getElementById('rev-period').value;
    const totalDown = h * 60 + m;
    const totalPeriod = period === 'year' ? MINS_YEAR : period === 'month' ? MINS_MONTH : MINS_WEEK;
    const pct = totalPeriod > 0 ? ((1 - totalDown / totalPeriod) * 100) : 100;
    const clamped = Math.max(0, Math.min(100, pct));
    const label = ninesLabel(clamped);

    document.getElementById('reverse-results').innerHTML =
      '<div class="slacalc-reverse-result"><div class="big-pct">' + esc(clamped.toFixed(4) + '%') +
      '</div><div class="sub">' + esc(fmtDuration(totalDown) + ' downtime in a ' + period) +
      (label ? ' — ' + esc(label) : '') + '</div></div>';
  }

  /* ── Incident impact ── */
  function calcIncident() {
    const h = parseFloat(document.getElementById('inc-hours').value) || 0;
    const m = parseFloat(document.getElementById('inc-mins').value) || 0;
    const period = document.getElementById('inc-period').value;
    const totalDown = h * 60 + m;
    const totalPeriod = period === 'year' ? MINS_YEAR : MINS_MONTH;

    const el = document.getElementById('incident-results');
    let html = '<div class="slacalc-breach-list">';
    TIERS.forEach(tier => {
      const allowed = downtimeMins(tier.pct, totalPeriod);
      const breached = totalDown > allowed;
      html += '<div class="slacalc-breach-item ' + (breached ? 'breached' : 'safe') + '">' +
        '<span class="sla-name">' + esc(tier.name) + ' (' + esc(tier.label) + ')</span>' +
        '<span>Budget: ' + esc(fmtDuration(allowed)) + '</span>' +
        '<span class="badge">' + (breached ? 'BREACHED' : 'SAFE') + '</span></div>';
    });
    html += '</div>';
    el.innerHTML = html;
  }

  /* ── Compare table ── */
  function buildCompare() {
    const tbody = document.querySelector('#compare-table tbody');
    if (!tbody) return;
    tbody.innerHTML = TIERS.map(t =>
      '<tr><td><strong>' + esc(t.name) + '</strong></td><td>' + esc(t.label) + '</td>' +
      '<td>' + esc(fmtDuration(downtimeMins(t.pct, MINS_YEAR))) + '</td>' +
      '<td>' + esc(fmtDuration(downtimeMins(t.pct, MINS_MONTH))) + '</td>' +
      '<td>' + esc(fmtDuration(downtimeMins(t.pct, MINS_WEEK))) + '</td>' +
      '<td style="color:rgba(255,255,255,0.5)">' + esc(t.typical) + '</td></tr>'
    ).join('');
  }

  /* ── M365 SLAs table ── */
  function buildM365() {
    const tbody = document.querySelector('#m365-table tbody');
    if (!tbody) return;
    tbody.innerHTML = M365.map(s =>
      '<tr class="clickable" data-pct="' + s.sla_pct + '">' +
      '<td><strong>' + esc(s.service) + '</strong></td>' +
      '<td>' + esc(s.sla_pct + '%') + '</td>' +
      '<td>' + esc(fmtDuration(downtimeMins(s.sla_pct, MINS_YEAR))) + '</td>' +
      '<td>' + esc(fmtDuration(downtimeMins(s.sla_pct, MINS_MONTH))) + '</td>' +
      '<td style="color:rgba(255,255,255,0.5)">' + esc(s.notes) + '</td></tr>'
    ).join('');
    tbody.addEventListener('click', function (e) {
      const row = e.target.closest('tr[data-pct]');
      if (!row) return;
      document.getElementById('sla-input').value = row.dataset.pct;
      document.getElementById('sla-slider').value = Math.min(99.9999, parseFloat(row.dataset.pct));
      document.querySelector('.slacalc-tab[data-tab="calc"]').click();
      calcForward();
    });
  }

  /* ── URL state ── */
  function syncURL(key, val) {
    const u = new URL(location.href);
    u.searchParams.set(key, val);
    history.replaceState(null, '', u);
  }

  function restoreURL() {
    const u = new URL(location.href);
    const sla = u.searchParams.get('sla');
    if (sla) {
      document.getElementById('sla-input').value = sla;
      document.getElementById('sla-slider').value = Math.min(99.9999, parseFloat(sla));
      updatePresets(parseFloat(sla));
    }
  }

  function updatePresets(val) {
    document.querySelectorAll('.slacalc-preset').forEach(p => {
      p.classList.toggle('active', parseFloat(p.dataset.val) === val);
    });
  }

  /* ── Init ── */
  function init() {
    initTabs();
    initModes();
    buildCompare();
    buildM365();

    const inp = document.getElementById('sla-input');
    const slider = document.getElementById('sla-slider');
    inp.addEventListener('input', () => { slider.value = Math.min(99.9999, parseFloat(inp.value) || 99); updatePresets(parseFloat(inp.value)); calcForward(); });
    slider.addEventListener('input', () => { inp.value = parseFloat(slider.value).toFixed(4).replace(/0+$/, '').replace(/\.$/, ''); updatePresets(parseFloat(inp.value)); calcForward(); });

    document.querySelectorAll('.slacalc-preset').forEach(p => {
      p.addEventListener('click', () => {
        inp.value = p.dataset.val; slider.value = parseFloat(p.dataset.val);
        updatePresets(parseFloat(p.dataset.val)); calcForward();
      });
    });

    ['rev-hours', 'rev-mins', 'rev-period'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', calcReverse);
    });
    ['inc-hours', 'inc-mins', 'inc-period'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', calcIncident);
    });

    restoreURL();
    calcForward();
    calcReverse();
    calcIncident();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
