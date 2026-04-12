/* ──────────────────────────────────────────
   Community Feedback Portal — JS
   Handles: category selection, URL params,
   form validation, submission, recent items,
   quick reactions, char counters, stats
   ────────────────────────────────────────── */

(function () {
  'use strict';

  // ── Category card selection ──
  const cards = document.querySelectorAll('.feedback-cat-card');
  const categorySelect = document.getElementById('fb-category');
  const toolSelect = document.getElementById('fb-tool');

  function selectCategory(cat, scrollToForm) {
    cards.forEach(c => {
      const isActive = c.dataset.category === cat;
      c.classList.toggle('active', isActive);
      c.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });
    if (categorySelect) {
      categorySelect.value = cat;
      // Pulse animation on the dropdown to show it changed
      categorySelect.classList.remove('feedback-pulse');
      void categorySelect.offsetWidth; // force reflow
      categorySelect.classList.add('feedback-pulse');
    }
    // Smooth scroll to form when clicking a card
    if (scrollToForm) {
      const formSection = document.getElementById('feedback-form-section');
      if (formSection) {
        setTimeout(() => formSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
      }
    }
  }

  cards.forEach(card => {
    card.addEventListener('click', () => selectCategory(card.dataset.category, true));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectCategory(card.dataset.category, true);
      }
    });
  });

  // Sync dropdown → cards (no scroll)
  if (categorySelect) {
    categorySelect.addEventListener('change', () => selectCategory(categorySelect.value, false));
  }

  // ── URL params pre-fill ──
  const params = new URLSearchParams(window.location.search);
  const urlCat = params.get('category');
  const urlTool = params.get('tool');

  if (urlCat) selectCategory(urlCat, false);
  if (urlTool && toolSelect) {
    toolSelect.value = urlTool;
  }

  // If coming from a tool page, scroll to form
  if (urlCat || urlTool) {
    const formSection = document.getElementById('feedback-form-section');
    if (formSection) {
      setTimeout(() => formSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    }
  }

  // ── Character counters ──
  function setupCharCounter(inputId, counterId, max) {
    const input = document.getElementById(inputId);
    const counter = document.getElementById(counterId);
    if (!input || !counter) return;
    function update() {
      const len = input.value.length;
      counter.textContent = len.toLocaleString() + ' / ' + max.toLocaleString();
      counter.classList.toggle('warn', len > max * 0.9);
      counter.classList.toggle('over', len > max);
    }
    input.addEventListener('input', update);
    update();
  }
  setupCharCounter('fb-subject', 'fb-subject-count', 150);
  setupCharCounter('fb-message', 'fb-message-count', 2000);

  // ── Quick Reactions ──
  const quickBtns = document.querySelectorAll('.feedback-quick-btn');
  quickBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const reaction = btn.dataset.reaction;
      const cat = btn.dataset.category;

      // Visual feedback — highlight the clicked button
      quickBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      selectCategory(cat, true);

      if (reaction === 'love') {
        // Auto-submit for "love" reactions
        btn.classList.add('sending');
        btn.innerHTML = '✨ Sending…';
        try {
          const res = await fetch('/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              category: cat,
              subject: 'Love the tools!',
              message: 'Just wanted to say — I love the free tools on this site. Keep up the amazing work! 🎉',
              name: '', email: '',
              tool: toolSelect?.value || '',
            }),
          });
          if (res.ok) {
            btn.innerHTML = '✅ Thank you!';
            btn.classList.remove('sending');
            btn.classList.add('sent');
            setTimeout(() => {
              btn.innerHTML = `<span class="feedback-quick-emoji">🤩</span><span class="feedback-quick-label">Love the tools!</span>`;
              btn.classList.remove('sent', 'selected');
            }, 3000);
          }
        } catch (e) {
          btn.innerHTML = `<span class="feedback-quick-emoji">🤩</span><span class="feedback-quick-label">Love the tools!</span>`;
          btn.classList.remove('sending', 'selected');
        }
      } else {
        // For idea/video/bug — scroll to form, focus subject, flash the form
        const formSection = document.getElementById('feedback-form-section');
        if (formSection) {
          formSection.classList.remove('feedback-flash');
          void formSection.offsetWidth;
          formSection.classList.add('feedback-flash');
        }
        setTimeout(() => {
          const subjectInput = document.getElementById('fb-subject');
          if (subjectInput) subjectInput.focus();
        }, 400);
      }
        }, 400);
      }
    });
  });

  // ── Form submission ──
  const form = document.getElementById('feedback-form');
  const submitBtn = document.getElementById('fb-submit');
  const submitText = document.getElementById('fb-submit-text');
  const statusEl = document.getElementById('fb-status');
  const successDetail = document.getElementById('fb-success-detail');
  const successLink = document.getElementById('fb-success-link');

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Honeypot check
      const hp = document.getElementById('fb-website');
      if (hp && hp.value) return;

      // Basic validation
      const category = document.getElementById('fb-category').value;
      const subject = document.getElementById('fb-subject').value.trim();
      const message = document.getElementById('fb-message').value.trim();

      if (!category) return showStatus('error', 'Please select a category.');
      if (!subject) return showStatus('error', 'Please enter a subject.');
      if (subject.length < 5) return showStatus('error', 'Subject must be at least 5 characters.');
      if (!message) return showStatus('error', 'Please enter a message.');
      if (message.length < 10) return showStatus('error', 'Message must be at least 10 characters.');

      // Rate limit (1 submission per 30 seconds)
      const lastSubmit = sessionStorage.getItem('fb_last_submit');
      if (lastSubmit && Date.now() - parseInt(lastSubmit) < 30000) {
        return showStatus('error', 'Please wait a moment before submitting again.');
      }

      // Collect form data
      const data = {
        name: document.getElementById('fb-name').value.trim(),
        email: document.getElementById('fb-email').value.trim(),
        category: category,
        tool: document.getElementById('fb-tool').value,
        subject: subject,
        message: message,
      };

      // Submit
      submitBtn.disabled = true;
      submitText.textContent = 'Sending…';

      try {
        const res = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          const result = await res.json().catch(() => ({}));
          sessionStorage.setItem('fb_last_submit', Date.now().toString());
          showStatus('success', '✅ Thank you! Your feedback has been submitted.');

          // Show the detailed success state with link
          if (successDetail && result.url) {
            successLink.href = result.url;
            successDetail.style.display = 'block';
          }

          form.reset();
          cards.forEach(c => {
            c.classList.remove('active');
            c.setAttribute('aria-checked', 'false');
          });
          // Reset char counters
          setupCharCounter('fb-subject', 'fb-subject-count', 150);
          setupCharCounter('fb-message', 'fb-message-count', 2000);
        } else {
          const err = await res.json().catch(() => ({}));
          showStatus('error', err.error || 'Something went wrong. Please try again.');
        }
      } catch (err) {
        showStatus('error', 'Network error — please check your connection and try again.');
      } finally {
        submitBtn.disabled = false;
        submitText.textContent = 'Send Feedback';
      }
    });
  }

  function showStatus(type, msg) {
    if (!statusEl) return;
    statusEl.className = 'feedback-status ' + type;
    statusEl.textContent = msg;
    statusEl.style.display = 'block';
    if (successDetail && type !== 'success') successDetail.style.display = 'none';
    statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    if (type === 'success') {
      setTimeout(() => {
        statusEl.style.display = 'none';
        if (successDetail) successDetail.style.display = 'none';
      }, 12000);
    }
  }

  // ── Fetch recent discussions + stats from GitHub ──
  const REPO = 'susanthgit/aguidetocloud-feedback';
  const recentList = document.getElementById('feedback-recent-list');
  const statsText = document.getElementById('feedback-stats-text');

  const TITLE_PREFIX_RE = /^\[([^\]]+)\]\s*/;

  const CATEGORY_EMOJI = {
    'Questions': '❓',
    'Feature Requests': '💡',
    'Video Requests': '🎬',
    'Bug Reports': '🐛',
    'Tool Feedback': '🔧',
    'Content Ideas': '📝',
    'General': '💬',
  };

  async function loadRecent() {
    try {
      // Use GraphQL to fetch discussions WITH their comments
      const query = `{
        repository(owner: "susanthgit", name: "aguidetocloud-feedback") {
          discussions(first: 10, orderBy: {field: CREATED_AT, direction: DESC}) {
            nodes {
              title url number createdAt
              category { name }
              comments(first: 5) {
                totalCount
                nodes { body createdAt author { login } }
              }
              body
            }
          }
        }
      }`;

      const res = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github+json',
        },
        body: JSON.stringify({ query }),
      });

      // GraphQL needs auth for reading — fall back to REST if unauthenticated
      let discussions = [];
      if (res.ok) {
        const data = await res.json();
        discussions = data.data?.repository?.discussions?.nodes || [];
      }

      // Fallback to REST API (no comments, but works without auth)
      if (!discussions.length) {
        const restRes = await fetch(
          `https://api.github.com/repos/${REPO}/discussions?per_page=10&sort=created&direction=desc`,
          { headers: { Accept: 'application/vnd.github+json' } }
        );
        if (restRes.ok) {
          const restData = await restRes.json();
          discussions = restData.map(d => ({
            title: d.title,
            url: d.html_url,
            number: d.number,
            createdAt: d.created_at,
            category: d.category,
            body: d.body || '',
            comments: { totalCount: d.comments || 0, nodes: [] },
          }));
        }
      }

      // Stats counter
      if (statsText) {
        const count = discussions.length;
        if (count === 0) {
          statsText.textContent = 'Share your feedback — be the first!';
        } else {
          const answered = discussions.filter(d => d.comments?.totalCount > 0).length;
          statsText.textContent = `${count} feedback item${count !== 1 ? 's' : ''} shared · ${answered} answered`;
        }
      }

      if (!discussions.length) return;

      recentList.innerHTML = '';

      discussions.forEach(d => {
        const titleMatch = d.title.match(TITLE_PREFIX_RE);
        const catLabel = titleMatch ? titleMatch[1] : (d.category?.name || 'General');
        const displayTitle = titleMatch ? d.title.replace(TITLE_PREFIX_RE, '') : d.title;
        const emoji = catLabel.match(/^(\p{Emoji})/u)?.[1] || CATEGORY_EMOJI[d.category?.name] || '💬';
        const hasReplies = d.comments?.totalCount > 0;
        const date = new Date(d.createdAt).toLocaleDateString('en-NZ', {
          day: 'numeric', month: 'short', year: 'numeric'
        });

        // Build the accordion item
        const item = document.createElement('div');
        item.className = 'feedback-accordion';

        // Clean the body — remove metadata footer
        const bodyText = (d.body || '').split('---')[0].trim();
        const preview = bodyText.length > 120 ? bodyText.substring(0, 120) + '…' : bodyText;

        // Build replies HTML
        let repliesHtml = '';
        if (d.comments?.nodes?.length) {
          repliesHtml = d.comments.nodes.map(c => {
            const replyBody = (c.body || '').replace(/\n/g, '<br>');
            return `<div class="feedback-reply">
              <div class="feedback-reply-header">
                <span class="feedback-reply-author">💬 ${escapeHtml(c.author?.login || 'Team')}</span>
              </div>
              <div class="feedback-reply-body">${replyBody}</div>
            </div>`;
          }).join('');
        }

        item.innerHTML = `
          <button class="feedback-accordion-header" aria-expanded="false" aria-controls="fb-acc-${d.number}">
            <span class="feedback-recent-cat">${emoji}</span>
            <div class="feedback-recent-body">
              <div class="feedback-recent-body-title">${escapeHtml(displayTitle)}</div>
              <div class="feedback-recent-meta">${escapeHtml(catLabel)} · ${date}${hasReplies ? ' · ' + d.comments.totalCount + ' repl' + (d.comments.totalCount === 1 ? 'y' : 'ies') : ''}</div>
            </div>
            <span class="feedback-badge ${hasReplies ? 'answered' : 'open'}">${hasReplies ? 'Answered' : 'Open'}</span>
            <span class="feedback-accordion-chevron">▼</span>
          </button>
          <div class="feedback-accordion-body" id="fb-acc-${d.number}" hidden>
            <div class="feedback-accordion-question">
              <p>${escapeHtml(preview)}</p>
            </div>
            ${repliesHtml}
            <a href="${d.url}" target="_blank" rel="noopener" class="feedback-accordion-link">
              View full thread on GitHub →
            </a>
          </div>`;

        // Toggle accordion
        const headerBtn = item.querySelector('.feedback-accordion-header');
        const bodyEl = item.querySelector('.feedback-accordion-body');
        headerBtn.addEventListener('click', () => {
          const expanded = headerBtn.getAttribute('aria-expanded') === 'true';
          headerBtn.setAttribute('aria-expanded', !expanded);
          bodyEl.hidden = expanded;
        });

        recentList.appendChild(item);
      });
    } catch (e) {
      if (statsText) statsText.textContent = 'Share your feedback below!';
    }
  }

  function escapeHtml(str) {
    const el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
  }

  loadRecent();
})();
