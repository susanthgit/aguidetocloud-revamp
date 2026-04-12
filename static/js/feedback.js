/* ──────────────────────────────────────────
   Community Feedback Portal — JS
   Handles: URL params, form, accordions
   Uses event delegation (Prompts pattern)
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

  // ── ACCORDION TOGGLE (event delegation — proven Prompts pattern) ──
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

      fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: document.getElementById('fb-name').value.trim(),
          email: document.getElementById('fb-email').value.trim(),
          category: category, tool: document.getElementById('fb-tool').value,
          subject: subject, message: message
        })
      }).then(function (res) {
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
      }).catch(function () {
        showStatus('error', 'Network error — check your connection.');
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

  // ── Load discussions as accordions ──
  var recentList = document.getElementById('feedback-recent-list');
  var TITLE_RE = /^\[([^\]]+)\]\s*/;
  var CAT_EMOJI = { 'Questions':'❓','Feature Requests':'💡','Video Requests':'🎬',
    'Bug Reports':'🐛','Tool Feedback':'🔧','Content Ideas':'📝','General':'💬' };

  function esc(s) { var el = document.createElement('span'); el.textContent = s; return el.innerHTML; }

  fetch('/api/discussions').then(function (res) {
    if (!res.ok) throw new Error('fail');
    return res.json();
  }).then(function (data) {
    var list = data.discussions;
    if (!list || !list.length) return;
    recentList.innerHTML = '';

    list.forEach(function (d) {
      var m = d.title.match(TITLE_RE);
      var catLabel = m ? m[1] : (d.category && d.category.name || 'General');
      var title = m ? d.title.replace(TITLE_RE, '') : d.title;
      var emoji = CAT_EMOJI[d.category && d.category.name] || '💬';
      var hasReplies = d.comments && d.comments.totalCount > 0;
      var date = new Date(d.createdAt).toLocaleDateString('en-NZ', { day:'numeric', month:'short', year:'numeric' });
      var bodyText = (d.body || '').split('---')[0].trim();

      var repliesHtml = '';
      if (d.comments && d.comments.nodes && d.comments.nodes.length) {
        d.comments.nodes.forEach(function (c) {
          repliesHtml += '<div class="feedback-reply">' +
            '<div class="feedback-reply-author">💬 ' + esc(c.author && c.author.login || 'Team') + '</div>' +
            '<div class="feedback-reply-body">' + (c.body || '').replace(/\n/g, '<br>') + '</div></div>';
        });
      }

      var row = document.createElement('div');
      row.className = 'feedback-acc';
      row.innerHTML =
        '<div class="feedback-acc-header" role="button" tabindex="0" aria-expanded="false">' +
          '<span class="feedback-acc-arrow">▸</span>' +
          '<span class="feedback-acc-emoji">' + emoji + '</span>' +
          '<div class="feedback-acc-info">' +
            '<div class="feedback-acc-title">' + esc(title) + '</div>' +
            '<div class="feedback-acc-meta">' + esc(catLabel) + ' · ' + date +
              (hasReplies ? ' · ' + d.comments.totalCount + (d.comments.totalCount === 1 ? ' reply' : ' replies') : '') +
            '</div>' +
          '</div>' +
          '<span class="feedback-badge ' + (hasReplies ? 'answered' : 'open') + '">' +
            (hasReplies ? 'Answered' : 'Open') + '</span>' +
        '</div>' +
        '<div class="feedback-acc-body" hidden>' +
          '<div class="feedback-acc-question">' + esc(bodyText) + '</div>' +
          repliesHtml +
          '<a href="' + d.url + '" target="_blank" rel="noopener" class="feedback-acc-link">View full thread on GitHub →</a>' +
        '</div>';
      recentList.appendChild(row);
    });
  }).catch(function () { /* silent */ });

})();
