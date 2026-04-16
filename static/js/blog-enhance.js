// Blog enhancements: progress bar + code copy buttons + semantic callout cards
(function() {
  // Reading progress bar
  var bar = document.querySelector('.blog-progress-bar');
  if (bar) {
    var ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          var h = document.documentElement.scrollHeight - window.innerHeight;
          bar.style.width = h > 0 ? (window.scrollY / h * 100) + '%' : '0%';
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // Code copy buttons
  document.querySelectorAll('.content-body pre').forEach(function(pre) {
    if (pre.classList.contains('mermaid')) return;
    var wrap = document.createElement('div');
    wrap.className = 'code-copy-wrap';
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);
    var btn = document.createElement('button');
    btn.className = 'code-copy-btn';
    btn.textContent = 'Copy';
    btn.setAttribute('aria-label', 'Copy code to clipboard');
    btn.addEventListener('click', function() {
      var code = pre.querySelector('code');
      var text = code ? code.textContent : pre.textContent;
      navigator.clipboard.writeText(text).then(function() {
        btn.textContent = '✅ Copied!';
        setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
      });
    });
    wrap.appendChild(btn);
  });

  // Semantic callout cards — auto-classify blockquotes by emoji/keyword, then strip emoji
  var calloutMap = [
    { pattern: /^[\s]*💡/, cls: 'callout-tip' },
    { pattern: /^[\s]*⚠️/, cls: 'callout-warn' },
    { pattern: /^[\s]*📚/, cls: 'callout-ref' },
    { pattern: /^[\s]*📖/, cls: 'callout-ref' },
    { pattern: /^[\s]*📌/, cls: 'callout-action' },
    { pattern: /^[\s]*📋/, cls: 'callout-action' },
    { pattern: /^[\s]*🔍/, cls: 'callout-ref' },
    { pattern: /^[\s]*(Situation:|Scenario:)/, cls: 'callout-scenario' },
    { pattern: /^[\s]*Disclaimer:/, cls: 'callout-disclaimer' },
  ];
  document.querySelectorAll('.content-body blockquote').forEach(function(bq) {
    var text = bq.textContent.trim();
    for (var i = 0; i < calloutMap.length; i++) {
      if (calloutMap[i].pattern.test(text)) {
        bq.classList.add('callout', calloutMap[i].cls);
        // Strip leading emoji from first paragraph
        var firstP = bq.querySelector('p');
        if (firstP) {
          firstP.innerHTML = firstP.innerHTML.replace(/^[\s]*(💡|⚠️|📚|📌|🔍|💬|📖|📋)\s*/g, '');
        }
        break;
      }
    }
  });
})();
