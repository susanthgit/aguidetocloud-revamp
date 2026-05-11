/* ──────────────────────────────────────────
   Community Feedback Portal — JS
   Handles: URL params, form, accordions,
   search filter, status labels, pinned
   ────────────────────────────────────────── */

(function () {
  'use strict';

  var categorySelect = document.getElementById('fb-category');
  var toolSelect = document.getElementById('fb-tool');

  // URL params pre-fill
  var params = new URLSearchParams(window.location.search);
  var urlCat = params.get('category');
  var urlTool = params.get('tool');
  if (urlCat && categorySelect) categorySelect.value = urlCat;
  if (urlTool && toolSelect) toolSelect.value = urlTool;
  if (urlCat || urlTool) {
    var fs = document.getElementById('feedback-form-section');
    if (fs) setTimeout(function () { fs.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 300);
  }

  // Character counters
  function setupCC(inputId, counterId, max) {
    var input = document.getElementById(inputId);
    var counter = document.getElementById(counterId);
    if (!input || !counter) return;
    function upd() {
      var len = input.value.length;
      counter.textContent = len.toLocaleString() + ' / ' + max.toLocaleString();
      counter.classList.toggle('warn', len > max * 0.9);
      counter.classList.toggle('over', len > max);
    }
    input.addEventListener('input', upd);
    upd();
  }
  setupCC('fb-subject', 'fb-subject-count', 150);
  setupCC('fb-message', 'fb-message-count', 2000);

  // ── ACCORDION TOGGLE (event delegation) ──
  document.addEventListener('click', function (e) {
    var header = e.target.closest('.feedback-acc-header');
    if (!header) return;
    if (e.target.closest('a')) return;
    var row = header.closest('.feedback-acc');
    if (!row) return;
    var body = row.querySelector('.feedback-acc-body');
    var arrow = header.querySelector('.feedback-acc-arrow');
    if (!body) return;
    var isOpen = !body.hidden;
    body.hidden = isOpen;
    if (arrow) arrow.textContent = isOpen ? '▸' : '▾';
    header.setAttribute('aria-expanded', String(!isOpen));
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var header = e.target.closest('.feedback-acc-header');
    if (!header || e.target.closest('a')) return;
    e.preventDefault();
    header.click();
  });

  // ── SEARCH FILTER ──
  var searchInput = document.getElementById('fb-search');
  var noResults = document.getElementById('fb-no-results');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      var q = searchInput.value.toLowerCase().trim();
      var rows = document.querySelectorAll('.feedback-acc');
      var visible = 0;
      rows.forEach(function (row) {
        var title = (row.querySelector('.feedback-acc-title') || {}).textContent || '';
        var meta = (row.querySelector('.feedback-acc-meta') || {}).textContent || '';
        var match = !q || title.toLowerCase().indexOf(q) !== -1 || meta.toLowerCase().indexOf(q) !== -1;
        row.style.display = match ? '' : 'none';
        if (match) visible++;
      });
      if (noResults) noResults.hidden = visible > 0 || !q;
    });
  }

  // ── Form submission ──
  var form = document.getElementById('feedback-form');
  var submitBtn = document.getElementById('fb-submit');
  var submitText = document.getElementById('fb-submit-text');
  var statusEl = document.getElementById('fb-status');
  var successDetail = document.getElementById('fb-success-detail');
  var successLink = document.getElementById('fb-success-link');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var hp = document.getElementById('fb-website');
      if (hp && hp.value) return;
      var category = document.getElementById('fb-category').value;
      var subject = document.getElementById('fb-subject').value.trim();
      var message = document.getElementById('fb-message').value.trim();
      if (!category) return showStatus('error', 'Please select a category.');
      if (!subject || subject.length < 5) return showStatus('error', 'Subject must be at least 5 characters.');
      if (!message || message.length < 10) return showStatus('error', 'Message must be at least 10 characters.');
      var ls = sessionStorage.getItem('fb_last_submit');
      if (ls && Date.now() - parseInt(ls) < 30000) return showStatus('error', 'Please wait before submitting again.');

      submitBtn.disabled = true;
      submitText.textContent = 'Sending…';

      var controller = new AbortController();
      var timeoutId = setTimeout(function () { controller.abort(); }, 15000);

      fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          name: document.getElementById('fb-name').value.trim(),
          email: document.getElementById('fb-email').value.trim(),
          category: category, tool: document.getElementById('fb-tool').value,
          subject: subject, message: message
        })
      }).then(function (res) {
        clearTimeout(timeoutId);
        if (res.ok) {
          return res.json().then(function (result) {
            sessionStorage.setItem('fb_last_submit', Date.now().toString());
            showStatus('success', '✅ Thank you! Your feedback has been submitted.');
            if (successDetail && result.url) { successLink.href = result.url; successDetail.style.display = 'block'; }
            form.reset();
            setupCC('fb-subject', 'fb-subject-count', 150);
            setupCC('fb-message', 'fb-message-count', 2000);
          });
        }
        return res.json().catch(function () { return {}; }).then(function (err) {
          showStatus('error', err.error || 'Something went wrong.');
        });
      }).catch(function (e) {
        clearTimeout(timeoutId);
        showStatus('error', e.name === 'AbortError' ? 'Request timed out — please try again.' : 'Network error — check your connection.');
      }).finally(function () {
        submitBtn.disabled = false;
        submitText.textContent = 'Send Feedback';
      });
    });
  }

  function showStatus(type, msg) {
    if (!statusEl) return;
    statusEl.className = 'feedback-status ' + type;
    statusEl.textContent = msg;
    statusEl.style.display = 'block';
    if (successDetail && type !== 'success') successDetail.style.display = 'none';
    statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    if (type === 'success') setTimeout(function () {
      statusEl.style.display = 'none';
      if (successDetail) successDetail.style.display = 'none';
    }, 12000);
  }

  // ── Load discussions ──
  var recentList = document.getElementById('feedback-recent-list');
  var TITLE_RE = /^\[([^\]]+)\]\s*/;
  var CAT_EMOJI = { 'Questions':'❓','Feature Requests':'💡','Video Requests':'🎬',
    'Bug Reports':'🐛','Tool Feedback':'🔧','Content Ideas':'📝','General':'💬' };

  // Status label mapping (GitHub label name → display)
  var STATUS_MAP = {
    'shipped': { text: '✅ Shipped', cls: 'shipped' },
    'planned': { text: '🗓️ Planned', cls: 'planned' },
    'in-progress': { text: '🔨 In Progress', cls: 'in-progress' },
    'wont-fix': { text: '⏸️ Won\'t Fix', cls: 'wont-fix' }
  };

  function esc(s) { var el = document.createElement('span'); el.textContent = s || ''; return el.innerHTML; }

  // ── Lightweight Markdown renderer ──
  // Escape-first, then transform: safe even if a reply body contains <script>.
  // Supports: **bold**, *italic* / _italic_, `inline code`, ```code blocks```,
  // [text](url), unordered (- / *) and ordered (1.) lists, paragraph breaks.
  function md(raw) {
    if (!raw) return '';
    var s = esc(raw);
    // Code blocks first (protect from other transforms)
    var codeBlocks = [];
    s = s.replace(/```([\s\S]*?)```/g, function (_, code) {
      codeBlocks.push(code.replace(/^\n/, '').replace(/\n$/, ''));
      return '\u0000CB' + (codeBlocks.length - 1) + '\u0000';
    });
    var inlineCodes = [];
    s = s.replace(/`([^`\n]+)`/g, function (_, code) {
      inlineCodes.push(code);
      return '\u0000IC' + (inlineCodes.length - 1) + '\u0000';
    });
    // Bold then italic (order matters for greedy matching)
    s = s.replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[\s(])\*([^*\n]+?)\*(?=[\s).,!?:;]|$)/g, '$1<em>$2</em>');
    s = s.replace(/(^|[\s(])_([^_\n]+?)_(?=[\s).,!?:;]|$)/g, '$1<em>$2</em>');
    // Links — validate URL scheme (block javascript:, data:, etc.)
    s = s.replace(/\[([^\]]+?)\]\(([^)\s]+?)\)/g, function (_, text, url) {
      if (!/^(https?:|mailto:|\/)/i.test(url)) return text;
      return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + text + '</a>';
    });
    // Unordered lists
    s = s.replace(/(?:^|\n)((?:[-*]\s+[^\n]+\n?)+)/g, function (_, block) {
      var items = block.trim().split('\n').map(function (line) {
        return '<li>' + line.replace(/^[-*]\s+/, '') + '</li>';
      }).join('');
      return '\n<ul class="feedback-ul">' + items + '</ul>';
    });
    // Ordered lists
    s = s.replace(/(?:^|\n)((?:\d+\.\s+[^\n]+\n?)+)/g, function (_, block) {
      var items = block.trim().split('\n').map(function (line) {
        return '<li>' + line.replace(/^\d+\.\s+/, '') + '</li>';
      }).join('');
      return '\n<ol class="feedback-ol">' + items + '</ol>';
    });
    // Paragraphs + soft line breaks
    s = s.split(/\n{2,}/).map(function (para) {
      var t = para.trim();
      if (!t) return '';
      if (/^<(ul|ol|pre)/.test(t)) return t;
      return '<p>' + t.replace(/\n/g, '<br>') + '</p>';
    }).join('');
    // Restore code placeholders
    s = s.replace(/\u0000CB(\d+)\u0000/g, function (_, i) {
      return '<pre class="feedback-code">' + codeBlocks[+i] + '</pre>';
    });
    s = s.replace(/\u0000IC(\d+)\u0000/g, function (_, i) {
      return '<code class="feedback-code-inline">' + inlineCodes[+i] + '</code>';
    });
    return s;
  }

  // ── Relative timestamp ──
  function relTime(iso) {
    if (!iso) return '';
    var then = new Date(iso).getTime();
    var diff = (Date.now() - then) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'min ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 86400 * 7) return Math.floor(diff / 86400) + 'd ago';
    if (diff < 86400 * 30) return Math.floor(diff / 86400 / 7) + 'w ago';
    return new Date(iso).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // ── Author rendering (avatar + name + Author badge for Susanth) ──
  function renderAuthor(login) {
    var safeLogin = (login || '').replace(/[^a-zA-Z0-9-]/g, '') || 'anonymous';
    var isAuthor = safeLogin === 'susanthgit';
    var displayName = isAuthor ? 'Susanth' : esc(safeLogin);
    var avatar = '<img class="feedback-a-avatar" src="https://avatars.githubusercontent.com/' +
      safeLogin + '?size=56" alt="" loading="lazy" width="28" height="28">';
    var badge = isAuthor
      ? '<span class="feedback-a-badge" title="Site author">✓ Author</span>'
      : '';
    return avatar + '<span class="feedback-a-author">' + displayName + '</span>' + badge;
  }

  function buildRow(d, isPinned) {
    var m = d.title.match(TITLE_RE);
    var catLabel = m ? m[1] : (d.category && d.category.name || 'General');
    var title = m ? d.title.replace(TITLE_RE, '') : d.title;
    var emoji = CAT_EMOJI[d.category && d.category.name] || '💬';
    var hasReplies = d.comments && d.comments.totalCount > 0;
    var dateStr = new Date(d.createdAt).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });

    // Question body: split off the "**From:**" footer; extract asker name
    var bodyRaw = d.body || '';
    var bodyParts = bodyRaw.split(/\n---\n/);
    var questionText = bodyParts[0].trim();
    var meta = bodyParts[1] || '';
    var fromMatch = meta.match(/\*\*From:\*\*\s*([^·\n]+)/);
    var askerName = fromMatch ? fromMatch[1].trim() : null;

    // Status label badge (Shipped / Planned / In Progress / Won't Fix)
    var statusHtml = '';
    if (d.labels && d.labels.nodes) {
      d.labels.nodes.forEach(function (lbl) {
        var key = lbl.name.toLowerCase();
        var info = STATUS_MAP[key];
        if (info) {
          statusHtml += '<span class="feedback-status-label feedback-sl-' + info.cls + '">' + info.text + '</span>';
        }
      });
    }
    var badgeHtml = statusHtml ||
      '<span class="feedback-badge ' + (hasReplies ? 'answered' : 'open') + '">' +
        (hasReplies ? 'Answered' : 'Open') + '</span>';

    // Question section — clear "❓ Question from X" header + rendered body
    var qLabel = '<div class="feedback-q-label">' +
      '<span class="feedback-q-label-emoji" aria-hidden="true">' + emoji + '</span>' +
      '<span>' + esc(catLabel) + ' · from ' + (askerName ? esc(askerName) : 'anonymous') + ' · ' + dateStr + '</span>' +
    '</div>';
    var qSection = '<div class="feedback-q">' + qLabel +
      '<div class="feedback-q-body">' + md(questionText) + '</div>' +
    '</div>';

    // Replies — each with avatar + author + relative time + markdown body
    var repliesHtml = '';
    if (hasReplies && d.comments.nodes && d.comments.nodes.length) {
      d.comments.nodes.forEach(function (c) {
        var login = (c.author && c.author.login) || 'unknown';
        repliesHtml += '<div class="feedback-a">' +
          '<div class="feedback-a-header">' +
            renderAuthor(login) +
            '<span class="feedback-a-time">' + relTime(c.createdAt) + '</span>' +
          '</div>' +
          '<div class="feedback-a-body">' + md(c.body || '') + '</div>' +
        '</div>';
      });
    }

    // Thread connector (only shown when there's at least one reply)
    var connector = hasReplies
      ? '<div class="feedback-thread-arrow" aria-hidden="true">↓ ' +
          d.comments.totalCount + ' ' + (d.comments.totalCount === 1 ? 'reply' : 'replies') +
        '</div>'
      : '';

    // GitHub link — bigger, friendlier CTA pill
    var ghLink = '<a href="' + d.url + '" target="_blank" rel="noopener noreferrer" class="feedback-acc-link">' +
      'See the full thread on GitHub →' +
    '</a>';

    var row = document.createElement('div');
    row.className = 'feedback-acc' + (isPinned ? ' feedback-acc-pinned' : '');
    row.innerHTML =
      '<div class="feedback-acc-header" role="button" tabindex="0" aria-expanded="false">' +
        '<span class="feedback-acc-arrow">▸</span>' +
        '<span class="feedback-acc-emoji">' + emoji + '</span>' +
        '<div class="feedback-acc-info">' +
          '<div class="feedback-acc-title">' + (isPinned ? '📌 ' : '') + esc(title) + '</div>' +
          '<div class="feedback-acc-meta">' + esc(catLabel) + ' · ' + dateStr +
            (hasReplies ? ' · ' + d.comments.totalCount + (d.comments.totalCount === 1 ? ' reply' : ' replies') : '') +
          '</div>' +
        '</div>' +
        badgeHtml +
      '</div>' +
      '<div class="feedback-acc-body" hidden>' +
        qSection +
        connector +
        repliesHtml +
        ghLink +
      '</div>';
    return row;
  }

  var discCtrl = new AbortController();
  var discTimeout = setTimeout(function () { discCtrl.abort(); }, 10000);

  fetch('/api/discussions', { signal: discCtrl.signal }).then(function (res) {
    clearTimeout(discTimeout);
    if (!res.ok) throw new Error('fail');
    return res.json();
  }).then(function (data) {
    var list = data.discussions || [];
    var pinned = data.pinned || [];
    if (!list.length && !pinned.length) return;
    recentList.innerHTML = '';

    // Render pinned first (deduplicate from main list)
    var pinnedIds = {};
    pinned.forEach(function (d) {
      pinnedIds[d.number] = true;
      recentList.appendChild(buildRow(d, true));
    });

    // Render remaining
    list.forEach(function (d) {
      if (pinnedIds[d.number]) return;
      recentList.appendChild(buildRow(d, false));
    });
  }).catch(function () { /* silent */ });

})();
