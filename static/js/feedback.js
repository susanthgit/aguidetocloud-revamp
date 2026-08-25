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
            showStatus('success', '✅ Thank you — this came through. I read and reply to every one personally; my reply will appear right here on this page.');
            if (successDetail && result.url) { successLink.href = result.url; successDetail.style.display = 'block'; }
            if (result.url) { saveMyThread(result.url, subject); renderMine(); }
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
      // Keep the success detail (bookmark link) visible — it's the user's way back to their thread.
    }, 12000);
  }

  // ── "Your submissions" — pull-model loop, no email or account needed ──
  // Threads this browser submitted are remembered locally, then cross-referenced
  // with the public board so returning visitors can see when a reply has landed.
  var MY_THREADS_KEY = 'fb_my_threads';
  var repliesByNumber = {}; // discussion number -> reply count (filled when the board loads)

  // Entries are read back from localStorage, which is not a trusted store: any
  // past XSS on this origin could have written to it, and the value outlives the
  // hole that wrote it. So validate on the way OUT, not just on the way in.
  // Pinned to the one board we actually post to — a foreign github.com repo would
  // otherwise render as a trusted "your submission" link, which is a phishing path.
  var BOARD_URL_RE =
    /^https:\/\/github\.com\/susanthgit\/aguidetocloud-feedback\/discussions\/(\d+)$/;
  function getMyThreads() {
    var raw;
    try { raw = JSON.parse(localStorage.getItem(MY_THREADS_KEY) || '[]'); } catch (e) { return []; }
    if (!Array.isArray(raw)) return [];
    return raw.filter(function (t) {
      if (!t || typeof t !== 'object') return false;
      if (typeof t.number !== 'number' || !isFinite(t.number) || t.number <= 0 || t.number % 1 !== 0) return false;
      if (typeof t.url !== 'string') return false;
      var m = t.url.match(BOARD_URL_RE);
      return !!m && parseInt(m[1], 10) === t.number;
    }).map(function (t) {
      return {
        number: t.number,
        url: t.url,
        title: typeof t.title === 'string' ? t.title.slice(0, 140) : ('#' + t.number)
      };
    });
  }
  function saveMyThread(url, title) {
    var m = (url || '').match(/discussions\/(\d+)/);
    if (!m) return;
    var num = parseInt(m[1], 10);
    var threads = getMyThreads().filter(function (t) { return t.number !== num; });
    threads.unshift({ number: num, url: url, title: (title || ('#' + num)).slice(0, 140), ts: Date.now() });
    try { localStorage.setItem(MY_THREADS_KEY, JSON.stringify(threads.slice(0, 25))); } catch (e) {}
  }
  function renderMine() {
    var wrap = document.getElementById('fb-mine');
    var listEl = document.getElementById('fb-mine-list');
    if (!wrap || !listEl) return;
    var threads = getMyThreads();
    if (!threads.length) { wrap.hidden = true; return; }
    wrap.hidden = false;
    // Built as DOM nodes rather than an HTML string: these values come from
    // localStorage, and string concatenation is exactly how the href injection
    // on this page happened.
    listEl.textContent = '';
    threads.forEach(function (t) {
      var known = Object.prototype.hasOwnProperty.call(repliesByNumber, t.number);
      var replies = known ? repliesByNumber[t.number] : -1;
      var status, cls;
      if (replies > 0) { status = '✓ Replied'; cls = 'replied'; }
      else if (replies === 0) { status = 'Awaiting reply'; cls = 'waiting'; }
      else { status = 'View thread →'; cls = 'unknown'; }

      var a = document.createElement('a');
      a.className = 'feedback-mine-item ' + cls;
      a.href = t.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';

      var titleEl = document.createElement('span');
      titleEl.className = 'feedback-mine-item-title';
      titleEl.textContent = '#' + t.number + ' · ' + t.title;

      var statusEl = document.createElement('span');
      statusEl.className = 'feedback-mine-item-status ' + cls;
      statusEl.textContent = status;

      a.appendChild(titleEl);
      a.appendChild(statusEl);
      listEl.appendChild(a);
    });
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

  // Attribute-context escaper. esc() alone is NOT safe inside an attribute:
  // textContent->innerHTML encodes & < > but leaves " and ' untouched, so a
  // quote in user data closes the attribute and injects new ones. Use escAttr()
  // for anything interpolated between quotes in generated HTML.
  function escAttr(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // For values that have ALREADY been through esc(): & < > are encoded but the
  // quotes are not, so only the quotes still need closing off. Using the full
  // escAttr() here instead would double-encode every & in the URL.
  function escQuotes(s) { return String(s == null ? '' : s).replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }

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
    // esc() escapes & < > but NOT quotes, because textContent->innerHTML escapes
    // for *text* context, not *attribute* context. Without the escAttr() below a
    // raw " in the URL closes href and injects real event-handler attributes
    // (verified exploitable against production 2026-08-25).
    s = s.replace(/\[([^\]]+?)\]\(([^)\s]+?)\)/g, function (_, text, url) {
      if (!/^(https?:|mailto:|\/)/i.test(url)) return text;
      return '<a href="' + escQuotes(url) + '" target="_blank" rel="noopener noreferrer">' + text + '</a>';
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

  // ── GitHub-rendered body (preferred) ──
  // GitHub returns bodyHTML — its own Markdown rendering — which handles tables,
  // headings, thematic breaks, blockquotes and entities correctly. The hand-rolled
  // md() above cannot, and grew a real attribute-injection hole trying. We sanitize
  // GitHub's HTML locally anyway: never trust it just because GitHub produced it.
  //
  // Allowlist derived from what GitHub actually emits (measured 2026-08-25):
  //   a blockquote br code em g-emoji h2 h3 hr li markdown-accessiblity-table
  //   ol p strong table tbody td th thead tr ul
  // g-emoji and markdown-accessiblity-table are GitHub custom elements; they are
  // dropped while DOMPurify keeps their children, which is what we want.
  var PURIFY_CFG = {
    ALLOWED_TAGS: ['a', 'blockquote', 'br', 'code', 'del', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'hr', 'li', 'ol', 'p', 'pre', 'strong', 'table', 'tbody', 'td', 'th', 'thead', 'tr', 'ul'],
    ALLOWED_ATTR: ['href'],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
    RETURN_DOM_FRAGMENT: true
  };

  function purifyReady() {
    return typeof window.DOMPurify !== 'undefined' &&
           typeof window.DOMPurify.sanitize === 'function';
  }

  // The submission form appends a generated metadata footer to every body:
  //   \n\n---\n**From:** x · **Related Tool:** y · **Category:** z · *Reply contact…*
  // Only **Category:** is always present (functions/api/feedback.js), so anchoring
  // on "From:" missed every anonymous submission. Anchor on the whole known shape
  // instead, at the LAST separator — a user's own "---" earlier in the body must
  // survive, which the old split-on-first-separator behaviour silently ate.
  //
  // The category is a CLOSED set of seven server-side labels, so pin to those
  // exact strings. Matching any "**Category:** …" ate a real trailing section of
  // a hand-authored post, and using [^·]* to scan fields broke on a name that
  // itself contained "·" — leaking the footer and showing the asker as anonymous.
  var FOOTER_CATEGORIES = [
    '\u2753 Question', '\uD83D\uDCA1 Feature Request', '\uD83C\uDFAC Video Request',
    '\uD83D\uDC1B Bug Report', '\uD83D\uDD27 Tool Feedback', '\uD83D\uDCDD Content Idea',
    '\uD83D\uDCAC General'
  ];
  var FOOTER_RE = new RegExp(
    '^(?:\\*\\*From:\\*\\*\\s.*?·\\s*)?' +
    '(?:\\*\\*Related Tool:\\*\\*\\s.*?·\\s*)?' +
    '\\*\\*Category:\\*\\*\\s*(?:' +
      FOOTER_CATEGORIES.map(function (c) { return c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') +
    ')' +
    '(?:\\s*·\\s*\\*Reply contact provided via form\\*)?$'
  );

  function splitGeneratedFooter(bodyRaw) {
    var text = bodyRaw || '';
    var idx = text.lastIndexOf('\n---\n');
    if (idx === -1) return { body: text.trim(), meta: '', hasFooter: false };
    var tail = text.slice(idx + 5).trim();
    if (tail.indexOf('\n') !== -1 || !FOOTER_RE.test(tail)) {
      return { body: text.trim(), meta: '', hasFooter: false };
    }
    return { body: text.slice(0, idx).trim(), meta: tail, hasFooter: true };
  }

  // Removes that same footer from GitHub's rendered HTML. Only runs when the raw
  // body actually ended in one, so a legitimate "---" followed by prose starting
  // "From: first principles…" is left alone.
  function stripSubmissionFooter(frag, hasFooter) {
    if (!hasFooter) return;
    var kids = Array.prototype.slice.call(frag.childNodes);
    for (var i = kids.length - 1; i >= 0; i--) {
      if (kids[i].nodeName !== 'HR') continue;
      var tail = kids.slice(i + 1).map(function (n) { return n.textContent || ''; }).join(' ');
      if (/Category:/.test(tail)) { for (var j = kids.length - 1; j >= i; j--) kids[j].remove(); }
      return;
    }
  }

  // Images are deliberately NOT on the sanitizer allowlist: an <img> starts a
  // network request the moment it exists, even detached, so a hostile post could
  // use one as a tracking pixel and harvest every reader's IP. But dropping them
  // silently lost real evidence — GitHub wraps a pasted screenshot as
  // <a href="…png"><img …></a>, which sanitized down to an EMPTY link, and a bare
  // <img> vanished entirely (both measured 26 Aug 2026).
  //
  // So the images are read back out of an INERT DOMParser document. That parse
  // runs no scripts and fetches no resources — it is the same mechanism DOMPurify
  // itself uses — and it gives us the src/alt to rebuild a plain text link the
  // reader can click. Nothing is ever loaded from the post.
  function imageRefs(html) {
    var out = [];
    try {
      var doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
      doc.querySelectorAll('img[src]').forEach(function (img) {
        var src = img.getAttribute('src') || '';
        if (!/^https:\/\//i.test(src)) return;
        out.push({ src: src, alt: (img.getAttribute('alt') || '').trim() });
      });
    } catch (e) { /* no images recovered; the post still renders */ }
    return out;
  }

  function imageLabel(ref) {
    if (ref.alt && ref.alt.toLowerCase() !== 'image') return ref.alt;
    var name = '';
    try { name = decodeURIComponent(ref.src.split('?')[0].split('#')[0].split('/').pop() || ''); }
    catch (e) { name = ''; }
    return name && name.length < 80 ? name : 'View image';
  }

  function restoreImageLinks(frag, refs) {
    if (!refs.length) return;
    var linked = {};
    frag.querySelectorAll('a[href]').forEach(function (a) {
      linked[a.getAttribute('href')] = a;
    });
    refs.forEach(function (ref) {
      var existing = linked[ref.src];
      if (existing) {
        // GitHub's screenshot markup: the link survived, its only child (the
        // image) did not. Give it visible text instead of leaving a dead link.
        if (!(existing.textContent || '').trim()) {
          existing.textContent = imageLabel(ref);
          existing.classList.add('feedback-img-link');
        }
        return;
      }
      // A bare <img> with no wrapping link — append one so the evidence is
      // still reachable rather than disappearing without trace.
      var p = document.createElement('p');
      var a = document.createElement('a');
      a.setAttribute('href', ref.src);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
      a.className = 'feedback-img-link';
      a.textContent = imageLabel(ref);
      p.appendChild(a);
      frag.appendChild(p);
    });
  }

  function decorateFragment(frag) {
    // Headings: clamp to h3 so a thread body can never outrank the page structure.
    // GitHub renders "# Title" as <h1>, so h1 must be allowed through the
    // sanitizer and clamped here — otherwise the tag was simply dropped and the
    // heading arrived as ordinary paragraph text.
    frag.querySelectorAll('h1,h2').forEach(function (h) {
      var n = document.createElement('h3');
      n.innerHTML = h.innerHTML;
      h.replaceWith(n);
    });
    frag.querySelectorAll('h3,h4,h5,h6').forEach(function (h) { h.classList.add('feedback-h'); });
    frag.querySelectorAll('ul').forEach(function (n) { n.classList.add('feedback-ul'); });
    frag.querySelectorAll('ol').forEach(function (n) { n.classList.add('feedback-ol'); });
    frag.querySelectorAll('pre').forEach(function (n) { n.classList.add('feedback-code'); });
    frag.querySelectorAll('blockquote').forEach(function (n) { n.classList.add('feedback-quote'); });
    frag.querySelectorAll('code').forEach(function (n) {
      if (!n.closest('pre')) n.classList.add('feedback-code-inline');
    });
    frag.querySelectorAll('a[href]').forEach(function (a) {
      if (!/^(https?:|mailto:|\/|#)/i.test(a.getAttribute('href') || '')) { a.removeAttribute('href'); return; }
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    });
    // Tables get a focusable scroll region so a wide table scrolls itself instead
    // of stretching the card and forcing the whole page sideways on a phone.
    frag.querySelectorAll('table').forEach(function (t) {
      t.classList.add('feedback-table');
      // A markdown table written with a blank header row renders as an empty
      // grey bar. GitHub shows it too; we'd rather just not draw it.
      var head = t.querySelector('thead');
      if (head && [].every.call(head.querySelectorAll('th,td'), function (c) {
        return !(c.textContent || '').trim();
      })) head.remove();
      t.querySelectorAll('th').forEach(function (th) { th.setAttribute('scope', 'col'); });
      var wrap = document.createElement('div');
      wrap.className = 'feedback-table-scroll';
      wrap.setAttribute('role', 'region');
      wrap.setAttribute('aria-label', 'Scrollable table');
      wrap.setAttribute('tabindex', '0');
      t.replaceWith(wrap);
      wrap.appendChild(t);
    });
  }

  // Fills one body slot. Prefers sanitized GitHub HTML; falls back to the local
  // markdown renderer whenever bodyHTML is unavailable, DOMPurify is missing, or
  // sanitizing left nothing visible (e.g. an image-only post, since images are
  // deliberately not on the allowlist). Worst case equals the old behaviour.
  function fillBody(el, html, markdown, hasFooter) {
    if (!el) return;
    if (html && purifyReady()) {
      try {
        var frag = window.DOMPurify.sanitize(html, PURIFY_CFG);
        stripSubmissionFooter(frag, hasFooter);
        decorateFragment(frag);
        var probe = document.createElement('div');
        probe.appendChild(frag.cloneNode(true));
        // A surviving <table> is not proof of content: an image-only table
        // sanitizes down to empty cells, which counted as "visible" and
        // suppressed the fallback, leaving an empty bordered box on the page.
        var hasText = (probe.textContent || '').trim().length > 0;
        var visible = hasText || probe.querySelector('hr') !== null;
        // Deliberately AFTER the visibility test, never before: a post made only
        // of images must still fall back to Markdown exactly as it did before.
        // Rebuilding its links first would make such a post "visible" and quietly
        // change behaviour this suite has two checks pinning down.
        if (visible) {
          restoreImageLinks(frag, imageRefs(html));
          el.textContent = '';
          el.appendChild(frag);
          return;
        }
      } catch (e) { /* fall through to markdown */ }
    }
    el.innerHTML = md(markdown || '');
  }

  function hydrateBodies(row, d) {
    fillBody(row.querySelector('[data-fb-body="q"]'), d.bodyHTML,
      row.__fbQuestionText, row.__fbHasFooter);
    var nodes = (d.comments && d.comments.nodes) || [];
    nodes.forEach(function (c, i) {
      // Comments are written directly on GitHub, so they never carry the
      // generated submission footer.
      fillBody(row.querySelector('[data-fb-body="a' + i + '"]'), c.bodyHTML, c.body, false);
    });
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

    // Question body: split off the generated metadata footer; extract asker name
    var parsed = splitGeneratedFooter(d.body || '');
    var questionText = parsed.body;
    var meta = parsed.meta;
    // The name can itself contain "·" — the field separator — so stop at a real
    // structural boundary (the next **Field:** or end of line), never at the
    // first dot. Stopping at the dot rendered "Jane · Doe" as "from Jane".
    // Same defect class as the footer regex; it was fixed there and missed here.
    var fromMatch = meta.match(
      /\*\*From:\*\*\s*([\s\S]*?)\s*(?:·\s*\*\*(?:Related Tool|Category):\*\*|\n|$)/);
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
      '<div class="feedback-q-body" data-fb-body="q"></div>' +
    '</div>';

    // Replies — each with avatar + author + relative time + markdown body
    var repliesHtml = '';
    if (hasReplies && d.comments.nodes && d.comments.nodes.length) {
      d.comments.nodes.forEach(function (c, ci) {
        var login = (c.author && c.author.login) || 'unknown';
        repliesHtml += '<div class="feedback-a">' +
          '<div class="feedback-a-header">' +
            renderAuthor(login) +
            '<span class="feedback-a-time">' + relTime(c.createdAt) + '</span>' +
          '</div>' +
          '<div class="feedback-a-body" data-fb-body="a' + ci + '"></div>' +
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
    var ghLink = '<a href="' + escAttr(d.url) + '" target="_blank" rel="noopener noreferrer" class="feedback-acc-link">' +
      'See the full thread on GitHub →' +
    '</a>';

    var row = document.createElement('div');
    row.className = 'feedback-acc' + (isPinned ? ' feedback-acc-pinned' : '');
    row.id = 'discussion-' + d.number;
    row.innerHTML =
      '<div class="feedback-acc-header" role="button" tabindex="0" aria-expanded="false">' +
        '<span class="feedback-acc-arrow">▸</span>' +
        '<span class="feedback-acc-emoji">' + emoji + '</span>' +
        '<div class="feedback-acc-info">' +
          '<div class="feedback-acc-title">' + (isPinned ? '📌 ' : '') + '<span class="feedback-acc-num">#' + d.number + '</span> ' + esc(title) + '</div>' +
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
    row.__fbQuestionText = questionText;
    row.__fbHasFooter = parsed.hasFooter;
    hydrateBodies(row, d);
    return row;
  }

  var discCtrl = new AbortController();
  var discTimeout = setTimeout(function () { discCtrl.abort(); }, 10000);

  // Show any locally-saved submissions right away; the board fetch below upgrades
  // each one with a live "Replied / Awaiting reply" status once it resolves.
  renderMine();

  fetch('/api/discussions', { signal: discCtrl.signal }).then(function (res) {
    clearTimeout(discTimeout);
    if (!res.ok) throw new Error('fail');
    return res.json();
  }).then(function (data) {
    var list = data.discussions || [];
    var pinned = data.pinned || [];
    // Record reply counts so "Your submissions" can show live status.
    pinned.concat(list).forEach(function (d) {
      repliesByNumber[d.number] = (d.comments && d.comments.totalCount) || 0;
    });
    renderMine();
    if (!list.length && !pinned.length) {
      // Sidebar must still resolve, or it sits on "Loading questions…" forever.
      buildThreadNav([], [], {});
      return;
    }
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

    // Safety net: if the board ever outgrows the 50-thread fetch, say so out
    // loud instead of silently hiding threads again.
    if (data.hasMore) {
      var more = document.createElement('a');
      more.className = 'feedback-acc-link fb-nav-more';
      more.href = 'https://github.com/susanthgit/aguidetocloud-feedback/discussions';
      more.target = '_blank';
      more.rel = 'noopener noreferrer';
      more.textContent = 'Browse the full archive on GitHub →';
      recentList.appendChild(more);
    }

    buildThreadNav(pinned, list, pinnedIds);
    openFromHash();
  }).catch(function () {
    // Previously silent — a GitHub outage or rate-limit rendered as an empty
    // board, which reads as "nobody has ever asked a question".
    if (recentList) {
      recentList.innerHTML =
        '<p class="fb-nav-msg">Couldn\'t load the questions just now. ' +
        '<a href="https://github.com/susanthgit/aguidetocloud-feedback/discussions" ' +
        'target="_blank" rel="noopener noreferrer">Read them on GitHub</a> ' +
        'or refresh the page.</p>';
    }
    var navBox = document.getElementById('fb-nav-links');
    if (navBox) {
      navBox.setAttribute('aria-busy', 'false');
      navBox.innerHTML = '<p class="fb-nav-msg">Couldn\'t load questions.</p>';
    }
  });

  // ── Sidebar thread index (desktop only — .zt-sidebar is hidden <=1024px) ──
  function buildThreadNav(pinned, list, pinnedIds) {
    var navBox = document.getElementById('fb-nav-links');
    if (!navBox) return;

    var ordered = pinned.concat(list.filter(function (d) { return !pinnedIds[d.number]; }));
    navBox.setAttribute('aria-busy', 'false');
    navBox.innerHTML = '';

    if (!ordered.length) {
      navBox.innerHTML = '<p class="fb-nav-msg">No questions yet.</p>';
      return;
    }

    ordered.forEach(function (d, i) {
      var a = document.createElement('a');
      a.className = 'zt-lic-nav-link fb-nav-link';
      a.href = '#discussion-' + d.number;
      var num = document.createElement('span');
      num.className = 'fb-nav-num';
      num.textContent = (pinned.length && i < pinned.length ? '📌 ' : '') + '#' + d.number;
      var name = document.createElement('span');
      name.className = 'zt-lic-nav-link-name fb-nav-title';
      // textContent, never innerHTML — titles are anonymous public input.
      name.textContent = stripCat(d.title);
      a.title = stripCat(d.title);
      a.appendChild(num);
      a.appendChild(name);
      a.addEventListener('click', function (e) {
        // Let ctrl/cmd/middle-click open a new tab normally.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        revealThread(d.number);
        // replaceState, not pushState: the URL stays shareable/bookmarkable,
        // but 34 threads don't bury the user's real Back target under 34
        // history entries that each look like a no-op when reversed.
        if (window.history && history.replaceState) {
          history.replaceState(null, '', '#discussion-' + d.number);
        }
      });
      navBox.appendChild(a);
    });

    var count = document.getElementById('fb-nav-count');
    if (count) count.textContent = ordered.length;
  }

  // Titles arrive as "[💬 General] Real question here" — the bracket prefix is
  // noise in a narrow sidebar.
  function stripCat(t) {
    return String(t || '').replace(/^\s*\[[^\]]*\]\s*/, '') || String(t || '');
  }

  // One operation: switch to the right tab, clear any filter hiding the row,
  // expand it, then scroll. Skipping any step leaves the user staring at a
  // page that didn't visibly move.
  function revealThread(number) {
    var submitTab = document.querySelector('.feedback-tab[data-tab="submit"]');
    if (submitTab && !submitTab.classList.contains('active')) submitTab.click();

    var search = document.getElementById('fb-search');
    if (search && search.value) {
      search.value = '';
      search.dispatchEvent(new Event('input', { bubbles: true }));
    }

    var row = document.getElementById('discussion-' + number);
    if (!row) return;
    row.style.display = '';

    var header = row.querySelector('.feedback-acc-header');
    var body = row.querySelector('.feedback-acc-body');
    if (header && body && body.hidden) header.click();

    row.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.querySelectorAll('.fb-nav-link.active').forEach(function (el) {
      el.classList.remove('active');
    });
    var link = document.querySelector('.fb-nav-link[href="#discussion-' + number + '"]');
    if (link) link.classList.add('active');
  }

  // Deep links: rows render async, so the browser's native anchor jump fires
  // before #discussion-N exists. Re-run it once the list is on the page, and
  // again on Back/Forward.
  function openFromHash() {
    var m = /^#discussion-(\d+)$/.exec(window.location.hash || '');
    if (m) revealThread(m[1]);
  }
  window.addEventListener('hashchange', openFromHash);

})();
