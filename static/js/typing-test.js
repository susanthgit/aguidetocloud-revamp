/* ═══════════════════════════════════════════════════
   Typing Speed Test — typing-test.js  v2
   100% client-side, zero API calls
   ═══════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─── Word Bank (200+) ─── */
  const WORDS = [
    'the','of','and','to','a','in','is','it','you','that','he','was','for','on','are','with',
    'as','his','they','be','at','one','have','this','from','or','had','by','but','some','what',
    'there','we','can','out','other','were','all','your','when','up','use','word','how','said',
    'an','each','she','which','do','their','time','if','will','way','about','many','then','them',
    'would','write','like','so','these','her','long','make','thing','see','him','two','has','look',
    'more','day','could','go','come','did','my','sound','no','most','number','who','over','know',
    'water','than','call','first','may','down','side','been','now','find','head','stand','own',
    'page','should','country','found','answer','school','grow','study','still','learn','plant',
    'cover','food','sun','four','thought','let','keep','eye','never','last','door','between',
    'city','tree','cross','since','hard','start','might','story','saw','far','sea','draw','left',
    'late','run','while','press','close','night','real','life','few','stop','open','seem',
    'together','next','white','children','begin','got','walk','example','ease','paper','often',
    'always','music','those','both','mark','book','letter','until','mile','river','car','feet',
    'care','second','group','carry','took','rain','eat','room','friend','began','idea','fish',
    'mountain','north','once','base','hear','horse','cut','sure','watch','color','face','wood',
    'main','enough','plain','girl','usual','young','ready','above','ever','red','list','though',
    'feel','talk','bird','soon','body','dog','family','direct','leave','song','measure','state',
    'product','black','short','space','clear','question','happen','complete','ship','area',
    'rock','order','fire','south','problem','piece','told','knew','pass','top','whole','king',
    'street','inch','nothing','course','stay','wheel','full','force','blue','object','decide',
    'surface','deep','moon','island','foot','yet','busy','test','record','boat','common','gold',
    'possible','plane','age','dry','wonder','laugh','thousand','ago','ran','check','game','shape',
    'yes','hot','miss','brought','heat','snow','bed','bring','sit','perhaps','fill','east','weight',
    'language','among','system','build','plan','create','simple','value','offer','level','effort',
    'design','team','power','point','share','field','try','today','spend','free','drive',
    'search','front','produce','nature','rest','total','energy','ready','rise','center',
    'method','change','follow','move','result','half','turn','speed','travel','morning',
    'table','class','earth','light','region','return','figure','market','practice','provide'
  ];

  /* ─── Quotes with attribution ─── */
  const QUOTES = [
    {text:"The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",author:"Steve Jobs"},
    {text:"Talk is cheap. Show me the code. Actions speak louder than words in the world of software development.",author:"Linus Torvalds"},
    {text:"Any sufficiently advanced technology is indistinguishable from magic. We are surrounded by magic every day.",author:"Arthur C. Clarke"},
    {text:"The best way to predict the future is to invent it. Don't wait for tomorrow, build it today.",author:"Alan Kay"},
    {text:"Simplicity is the ultimate sophistication. The most elegant solutions are often the simplest ones.",author:"Leonardo da Vinci"},
    {text:"First solve the problem. Then write the code. Understanding the problem is half the solution.",author:"John Johnson"},
    {text:"Innovation distinguishes between a leader and a follower. Keep pushing boundaries and exploring new ideas.",author:"Steve Jobs"},
    {text:"Technology is best when it brings people together. The most powerful tools connect us across distances.",author:"Matt Mullenweg"},
    {text:"The greatest glory in living lies not in never falling, but in rising every time we fall.",author:"Nelson Mandela"},
    {text:"In the middle of difficulty lies opportunity. Every challenge is a chance to learn and grow stronger.",author:"Albert Einstein"},
    {text:"It does not matter how slowly you go as long as you do not stop. Persistence beats perfection.",author:"Confucius"},
    {text:"The future belongs to those who believe in the beauty of their dreams. Dream big, start small.",author:"Eleanor Roosevelt"},
    {text:"Tell me and I forget. Teach me and I remember. Involve me and I learn. Experience is the best teacher.",author:"Benjamin Franklin"},
    {text:"Education is the most powerful weapon which you can use to change the world. Never stop learning.",author:"Nelson Mandela"},
    {text:"Success is not final, failure is not fatal. It is the courage to continue that counts the most.",author:"Winston Churchill"},
    {text:"Stay hungry, stay foolish. The people who are crazy enough to think they can change the world are the ones who do.",author:"Steve Jobs"},
    {text:"Code is like humor. When you have to explain it, it is bad. Write code that speaks for itself.",author:"Cory House"},
    {text:"Programs must be written for people to read, and only incidentally for machines to execute.",author:"Harold Abelson"},
    {text:"The best error message is the one that never shows up. Design systems that prevent errors from occurring.",author:"Thomas Fuchs"},
    {text:"Make it work, make it right, make it fast. In that order. Premature optimization is the root of all evil.",author:"Kent Beck"},
    {text:"Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.",author:"Antoine de Saint-Exupery"},
    {text:"Before software can be reusable it first has to be usable. Focus on the user experience above all else.",author:"Ralph Johnson"},
    {text:"Measuring programming progress by lines of code is like measuring aircraft building progress by weight.",author:"Bill Gates"},
    {text:"The Internet is becoming the town square for the global village of tomorrow. Connection is everything.",author:"Bill Gates"},
    {text:"We are stuck with technology when what we really want is just stuff that works. Keep it simple.",author:"Douglas Adams"},
    {text:"The only limit to our realization of tomorrow is our doubts of today. Believe in what you can achieve.",author:"Franklin D. Roosevelt"},
    {text:"The computer was born to solve problems that did not exist before. Technology creates as many questions as answers.",author:"Bill Gates"},
    {text:"Life is ten percent what happens to you and ninety percent how you respond to it. Attitude is everything.",author:"Charles Swindoll"},
    {text:"Do what you can, with what you have, where you are. Start now and improve as you go.",author:"Theodore Roosevelt"},
    {text:"The secret of getting ahead is getting started. The hardest part of any journey is the first step.",author:"Mark Twain"},
    {text:"It always seems impossible until it is done. Keep pushing forward even when the path seems unclear.",author:"Nelson Mandela"},
    {text:"Learning never exhausts the mind. The more you know, the more you realize how much there is to learn.",author:"Leonardo da Vinci"},
    {text:"A person who never made a mistake never tried anything new. Embrace failure as a stepping stone to success.",author:"Albert Einstein"}
  ];

  /* ─── Code Snippets ─── */
  const CODE = {
    javascript: [
      'function debounce(fn, ms) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), ms);\n  };\n}',
      'const unique = arr => [...new Set(arr)];\nconst sorted = unique([3, 1, 2, 1, 3]);\nconsole.log(sorted.sort((a, b) => a - b));',
      'async function fetchData(url) {\n  try {\n    const res = await fetch(url);\n    if (!res.ok) throw new Error(res.status);\n    return await res.json();\n  } catch (err) {\n    console.error("Fetch failed:", err);\n  }\n}',
      'document.querySelectorAll(".card").forEach(el => {\n  el.addEventListener("click", () => {\n    el.classList.toggle("active");\n  });\n});',
      'const pipe = (...fns) => x =>\n  fns.reduce((acc, fn) => fn(acc), x);\n\nconst transform = pipe(\n  s => s.trim(),\n  s => s.toLowerCase(),\n  s => s.split(" ")\n);'
    ],
    python: [
      'def flatten(lst):\n    return [item for sub in lst\n            for item in (flatten(sub)\n            if isinstance(sub, list) else [sub])]',
      'with open("data.csv", "r") as f:\n    reader = csv.DictReader(f)\n    for row in reader:\n        name = row["name"]\n        score = int(row["score"])\n        print(f"{name}: {score}")',
      'from collections import Counter\n\nwords = text.lower().split()\nfreq = Counter(words)\nfor word, count in freq.most_common(10):\n    print(f"{word}: {count}")',
      'import requests\n\ndef get_json(url):\n    response = requests.get(url, timeout=10)\n    response.raise_for_status()\n    return response.json()',
      'from datetime import datetime, timedelta\n\nnow = datetime.now()\nweek_ago = now - timedelta(days=7)\nformatted = now.strftime("%Y-%m-%d %H:%M")\nprint(f"Today: {formatted}")'
    ],
    powershell: [
      'Get-ADUser -Filter * -Properties LastLogonDate |\n  Where-Object { $_.Enabled -eq $true } |\n  Select-Object Name, LastLogonDate |\n  Sort-Object LastLogonDate',
      '$services = Get-Service | Where-Object {\n  $_.Status -eq "Stopped" -and\n  $_.StartType -eq "Automatic"\n}\n$services | Format-Table Name, Status',
      'Get-ChildItem -Path C:\\Logs -Recurse |\n  Where-Object { $_.LastWriteTime -lt\n    (Get-Date).AddDays(-30) } |\n  Remove-Item -WhatIf',
      '$users = Import-Csv "users.csv"\n$users | ForEach-Object {\n  $name = $_.DisplayName\n  $email = $_.Email\n  Write-Host "$name - $email"\n} | Export-Csv "output.csv"',
      '$params = @{\n  From = "admin@company.com"\n  To = "team@company.com"\n  Subject = "Daily Report"\n  Body = Get-Content report.html -Raw\n  SmtpServer = "smtp.company.com"\n}\nSend-MailMessage @params'
    ],
    html: [
      '<nav class="navbar">\n  <a href="/" class="logo">Brand</a>\n  <ul class="nav-links">\n    <li><a href="/about">About</a></li>\n    <li><a href="/blog">Blog</a></li>\n    <li><a href="/contact">Contact</a></li>\n  </ul>\n</nav>',
      '.card {\n  display: flex;\n  flex-direction: column;\n  background: #0a0a14;\n  border-radius: 12px;\n  padding: 1.5rem;\n  box-shadow: 0 4px 12px rgba(0,0,0,0.3);\n  transition: transform 0.2s ease;\n}',
      '<form id="contact-form">\n  <label for="name">Name</label>\n  <input type="text" id="name" required>\n  <label for="email">Email</label>\n  <input type="email" id="email" required>\n  <textarea id="message" rows="4"></textarea>\n  <button type="submit">Send</button>\n</form>',
      '@media (max-width: 768px) {\n  .grid {\n    grid-template-columns: 1fr;\n    gap: 1rem;\n    padding: 0 1rem;\n  }\n  .sidebar { display: none; }\n  .main { width: 100%; }\n}',
      '<div class="hero">\n  <h1>Welcome to Our Site</h1>\n  <p>Build something amazing today</p>\n  <a href="/start" class="btn">Get Started</a>\n</div>'
    ]
  };

  /* ─── Numbers & Symbols ─── */
  const NUMBER_PATTERNS = [
    '192.168.1.1','10.0.0.1','255.255.255.0','172.16.0.1','fe80::1',
    'user@email.com','admin@company.org','hello.world@test.co.uk',
    'https://example.com/path?q=1&page=2','http://localhost:3000/api/v2',
    '$49.99','$1,299.00','£29.50','€39.00','¥8,500',
    '(555) 123-4567','+1-800-555-0199','+44 20 7946 0958',
    '2024-01-15','15/03/2024','03-28-2025','12:30:45 PM','09:15 AM',
    '#FF5733','rgba(255, 99, 71, 0.5)','hsl(120, 60%, 50%)',
    'SELECT * FROM users WHERE id = 42;','DROP TABLE IF EXISTS temp;',
    'const x = (a + b) * c / d;','let arr = [1, 2, 3];',
    '{name: "John", age: 30, active: true}','["alpha", "beta", "gamma"]',
    'C:\\Users\\admin\\Documents\\file.txt','/usr/local/bin/node',
    'git commit -m "fix: resolve #42"','npm install --save-dev',
    'chmod 755 script.sh','sudo apt-get update && upgrade',
    'export API_KEY="sk-abc123xyz"','$env:PATH += ";C:\\tools"'
  ];

  const PUNCT_CHARS = '.,;:!?';
  const KB_ROWS = [
    ['`','1','2','3','4','5','6','7','8','9','0','-','='],
    ['q','w','e','r','t','y','u','i','o','p','[',']','\\'],
    ['a','s','d','f','g','h','j','k','l',';',"'"],
    ['z','x','c','v','b','n','m',',','.','/']
  ];

  /* ─── Helpers ─── */
  const $ = id => document.getElementById(id);
  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(a) { const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; }
  function clamp(v,lo,hi) { return Math.max(lo,Math.min(hi,v)); }

  /* ─── State ─── */
  const S = {
    mode: 'words',
    codeLang: 'javascript',
    duration: 60,
    wordCount: 25,
    testMode: 'time',       // time | wordcount
    punctuation: false,
    numbers: false,
    timerMode: 'countdown',
    timer: null,
    timeLeft: 60,
    elapsed: 0,
    started: false,
    finished: false,
    text: '',
    textChars: [],
    charSpans: [],
    wpmHistory: [],
    lastSample: -1,
    startTime: null,
    theme: 'modern',
    sound: true,
    keyErrors: {},
    keyAttempts: {},
    confusionPairs: [],
    quoteAuthor: null,
    lastResult: null,
    prevTypedLen: 0,
    originalTitle: document.title
  };
  try { S.theme = localStorage.getItem('typist_theme') || 'modern'; } catch {}
  try { var sv = localStorage.getItem('typist_sound'); if (sv !== null) S.sound = sv === 'true'; } catch {}

  let inputEl, textEl, textArea, focusHint, statsBar;
  let audioCtx = null;
  let resizeTimer = null;

  /* ═══════════════════════════════════════
     TEXT GENERATION
     ═══════════════════════════════════════ */
  function generateWords(count) {
    const w = [];
    for (let i = 0; i < count; i++) {
      let word = rand(WORDS);
      if (S.numbers && Math.random() < 0.12) {
        word = String(Math.floor(Math.random() * 9000) + 100);
      }
      if (S.punctuation && Math.random() < 0.18) {
        word += PUNCT_CHARS[Math.floor(Math.random() * PUNCT_CHARS.length)];
      }
      if (S.punctuation && i > 0 && Math.random() < 0.05) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
      w.push(word);
    }
    return w.join(' ');
  }

  function generateQuote() {
    const q = rand(QUOTES);
    S.quoteAuthor = q.author;
    return q.text;
  }

  function generateCode(lang) { return rand(CODE[lang] || CODE.javascript); }
  function generateNumbers() { return shuffle(NUMBER_PATTERNS).slice(0,12).join(' '); }

  function getTestText() {
    S.quoteAuthor = null;
    switch (S.mode) {
      case 'words':
        if (S.testMode === 'wordcount') return generateWords(S.wordCount);
        return generateWords(Math.ceil(S.duration / 60 * 350));
      case 'quote': return generateQuote();
      case 'code':  return generateCode(S.codeLang);
      case 'custom': return ($('typist-custom-text')?.value||'').trim()||'Please enter some custom text to practice with.';
      case 'numbers': return generateNumbers();
      default: return generateWords(80);
    }
  }

  /* ═══════════════════════════════════════
     CORE TYPING ENGINE
     ═══════════════════════════════════════ */
  function initTest() {
    S.started = false;
    S.finished = false;
    S.wpmHistory = [];
    S.lastSample = -1;
    S.startTime = null;
    S.elapsed = 0;
    S.keyErrors = {};
    S.keyAttempts = {};
    S.confusionPairs = [];
    S.prevTypedLen = 0;
    clearInterval(S.timer);
    S.timer = null;

    const isCountup = S.mode === 'quote' || S.mode === 'code' || S.mode === 'custom' ||
                       (S.mode === 'words' && S.testMode === 'wordcount');
    S.timerMode = isCountup ? 'countup' : 'countdown';
    S.timeLeft = S.duration;

    S.text = getTestText();
    S.textChars = S.text.split('');
    renderTextSpans();

    inputEl.value = '';
    inputEl.disabled = false;
    inputEl.focus();

    textArea.classList.remove('typist-has-text', 'typist-active');
    $('typist-results').classList.add('typist-hidden');
    updateStatsBar(0, 100, S.timerMode === 'countdown' ? S.duration : 0, '0/0');
    textArea.scrollTop = 0;
    document.title = S.originalTitle;
  }

  function renderTextSpans() {
    let html = '';
    for (let i = 0; i < S.textChars.length; i++) {
      const ch = S.textChars[i];
      const cls = i === 0 ? 'typist-char typist-current' : 'typist-char';
      if (ch === '\n') {
        html += '<span class="' + cls + ' typist-newline" data-i="' + i + '">\u21b5</span><br>';
      } else {
        const display = ch === ' ' ? ' ' : esc(ch);
        html += '<span class="' + cls + '" data-i="' + i + '">' + display + '</span>';
      }
    }
    textEl.innerHTML = html;
    S.charSpans = textEl.querySelectorAll('.typist-char');
  }

  function updateDisplay() {
    const typed = inputEl.value;
    const tLen = typed.length;
    const cLen = S.textChars.length;
    const prev = S.prevTypedLen;
    const lo = Math.max(0, Math.min(prev, tLen) - 1);
    const hi = Math.min(Math.max(prev, tLen) + 1, cLen);

    for (let i = lo; i < hi; i++) {
      const span = S.charSpans[i];
      if (!span) continue;
      span.classList.remove('typist-correct','typist-incorrect','typist-current','typist-space-error');
      if (i < tLen) {
        if (typed[i] === S.textChars[i]) { span.classList.add('typist-correct'); }
        else {
          span.classList.add('typist-incorrect');
          if (S.textChars[i] === ' ') span.classList.add('typist-space-error');
        }
      } else if (i === tLen) { span.classList.add('typist-current'); }
    }
    if (prev > 0 && prev <= cLen && prev !== tLen) {
      const oldCur = S.charSpans[prev];
      if (oldCur) { oldCur.classList.remove('typist-current'); }
    }

    textEl.querySelectorAll('.typist-extra').forEach(el => el.remove());
    for (let i = cLen; i < tLen; i++) {
      const span = document.createElement('span');
      span.className = 'typist-char typist-extra';
      span.textContent = typed[i];
      textEl.appendChild(span);
    }
    S.prevTypedLen = tLen;
  }

  function scrollToLine() {
    const idx = Math.min(inputEl.value.length, S.textChars.length - 1);
    const span = S.charSpans[idx];
    if (!span) return;
    const top = span.offsetTop;
    const areaH = textArea.clientHeight;
    if (top > textArea.scrollTop + areaH - 96) textArea.scrollTop = top - 48;
  }

  function extendText() {
    const extra = generateWords(40);
    const newChars = (' ' + extra).split('');
    S.text += ' ' + extra;
    S.textChars = S.textChars.concat(newChars);
    let html = '';
    for (let i = S.charSpans.length; i < S.textChars.length; i++) {
      const ch = S.textChars[i];
      const display = ch === ' ' ? ' ' : esc(ch);
      html += '<span class="typist-char" data-i="' + i + '">' + display + '</span>';
    }
    textEl.insertAdjacentHTML('beforeend', html);
    S.charSpans = textEl.querySelectorAll('.typist-char');
  }

  function handleInput() {
    if (S.finished) return;
    if (!S.started) {
      S.started = true;
      S.startTime = Date.now();
      textArea.classList.add('typist-active','typist-has-text');
      startTimer();
    }
    const typed = inputEl.value;
    const newLen = typed.length;
    const oldLen = S.prevTypedLen;

    // Only track key accuracy on forward typing (not backspace)
    if (newLen > oldLen) {
      for (let i = oldLen; i < newLen && i < S.textChars.length; i++) {
        const expected = S.textChars[i];
        const actual = typed[i];
        const ek = expected.toLowerCase();
        S.keyAttempts[ek] = (S.keyAttempts[ek]||0) + 1;
        if (actual !== expected) {
          S.keyErrors[ek] = (S.keyErrors[ek]||0) + 1;
          S.confusionPairs.push({expected, actual, pos: i});
        }
      }
    }
    if (S.sound) playKeySound();
    updateDisplay();
    updateLiveStats();
    scrollToLine();

    // Auto-extend text for timed tests if user is fast
    if (S.timerMode === 'countdown' && S.mode === 'words' && typed.length > S.textChars.length - 40) {
      extendText();
    }

    if (S.timerMode === 'countup' && typed.length >= S.textChars.length) endTest();
  }

  /* ─── Stats ─── */
  function countCorrect() { const t=inputEl.value; let c=0; for(let i=0;i<Math.min(t.length,S.textChars.length);i++) if(t[i]===S.textChars[i])c++; return c; }
  function countIncorrect() { const t=inputEl.value; let c=0; for(let i=0;i<Math.min(t.length,S.textChars.length);i++) if(t[i]!==S.textChars[i])c++; return c; }
  function countExtra() { return Math.max(0, inputEl.value.length - S.textChars.length); }
  function countMissed() { return Math.max(0, S.textChars.length - inputEl.value.length); }

  function calcWPM() {
    if (!S.startTime) return 0;
    const mins = (Date.now() - S.startTime) / 60000;
    return mins < 0.01 ? 0 : Math.round((countCorrect() / 5) / mins);
  }
  function calcRawWPM() {
    if (!S.startTime) return 0;
    const mins = (Date.now() - S.startTime) / 60000;
    return mins < 0.01 ? 0 : Math.round((inputEl.value.length / 5) / mins);
  }
  function calcAccuracy() {
    const t = inputEl.value.length;
    return t === 0 ? 100 : Math.round((countCorrect() / t) * 100);
  }
  function calcConsistency() {
    const h = S.wpmHistory.filter(v => v > 0);
    if (h.length < 2) return 100;
    const mean = h.reduce((a,b)=>a+b,0)/h.length;
    if (mean===0) return 100;
    const cv = Math.sqrt(h.reduce((a,b)=>a+(b-mean)**2,0)/h.length) / mean;
    return clamp(Math.round((1-cv)*100), 0, 100);
  }

  function updateLiveStats() {
    $('typist-wpm').textContent = calcWPM();
    $('typist-acc').textContent = calcAccuracy() + '%';
    $('typist-chars').textContent = inputEl.value.length + '/' + S.textChars.length;
  }
  function updateStatsBar(wpm, acc, time, chars) {
    $('typist-wpm').textContent = wpm;
    $('typist-acc').textContent = acc + '%';
    $('typist-time').textContent = typeof time === 'number' ? Math.ceil(time) : time;
    $('typist-chars').textContent = chars;
  }

  /* ═══════════════════════════════════════
     TIMER
     ═══════════════════════════════════════ */
  function startTimer() {
    S.timer = setInterval(() => {
      S.elapsed = (Date.now() - S.startTime) / 1000;
      if (S.timerMode === 'countdown') {
        S.timeLeft = Math.max(0, S.duration - S.elapsed);
        $('typist-time').textContent = Math.ceil(S.timeLeft);
        if (S.timeLeft <= 0) endTest();
      } else {
        $('typist-time').textContent = Math.floor(S.elapsed);
      }
      const si = Math.floor(S.elapsed / 2);
      if (si !== S.lastSample && si > 0) { S.lastSample = si; S.wpmHistory.push(calcWPM()); }
    }, 100);
  }

  function endTest() {
    if (S.finished) return;
    S.finished = true;
    clearInterval(S.timer); S.timer = null;
    inputEl.disabled = true;
    S.wpmHistory.push(calcWPM());
    showResults();
  }

  /* ═══════════════════════════════════════
     RESULTS
     ═══════════════════════════════════════ */
  function showResults() {
    const wpm = calcWPM();
    const rawWpm = calcRawWPM();
    const acc = calcAccuracy();
    const consistency = calcConsistency();
    const correct = countCorrect();
    const incorrect = countIncorrect();
    const extra = countExtra();
    const missed = countMissed();
    const legit = wpm <= 250;

    animateCounter($('typist-result-wpm'), wpm, 800);
    $('typist-result-raw').textContent = rawWpm;
    $('typist-result-acc').textContent = acc + '%';
    $('typist-result-consistency').textContent = consistency + '%';
    $('typist-result-correct').textContent = correct;
    $('typist-result-incorrect').textContent = incorrect;
    $('typist-result-extra').textContent = extra;
    $('typist-result-missed').textContent = missed;

    const warn = $('typist-cheat-warning');
    warn.classList.toggle('typist-hidden', legit);

    // PB check — compare same mode only
    const pb = $('typist-result-pb');
    const stats = loadStats();
    const sameMode = stats.results.filter(r => r.mode === S.mode);
    const prevBest = sameMode.length ? Math.max(...sameMode.map(r=>r.wpm)) : 0;
    pb.classList.toggle('typist-hidden', !(legit && wpm > prevBest && wpm > 0));

    // Quote attribution
    const qa = $('typist-result-quote');
    if (S.quoteAuthor) { qa.textContent = '\u2014 ' + S.quoteAuthor; qa.classList.remove('typist-hidden'); }
    else qa.classList.add('typist-hidden');

    // Error word breakdown
    renderErrorReview();

    drawSparkline($('typist-sparkline'), S.wpmHistory);

    $('typist-results').classList.remove('typist-hidden');
    setTimeout(() => $('typist-restart').focus(), 100);
    document.title = 'Typing Test \u2014 ' + wpm + ' WPM | A Guide to Cloud';

    S.lastResult = { wpm, rawWpm, acc, consistency, correct, incorrect, extra, missed, mode:S.mode, duration:Math.round(S.elapsed), date:new Date().toISOString(), codeLang:S.codeLang };
    if (legit) { saveResult(S.lastResult); mergeKeyStats(); }
  }

  function renderErrorReview() {
    const el = $('typist-error-review');
    const wordsEl = $('typist-error-words');
    if (!S.confusionPairs.length) { el.classList.add('typist-hidden'); return; }
    el.classList.remove('typist-hidden');
    const shown = S.confusionPairs.slice(0, 20);
    wordsEl.innerHTML = shown.map(p =>
      '<div class="typist-error-word"><span class="typist-error-expected">' + esc(p.expected === ' ' ? '␣' : p.expected) +
      '</span><span class="typist-error-actual">' + esc(p.actual === ' ' ? '␣' : p.actual) + '</span></div>'
    ).join('');
  }

  function animateCounter(el, target, ms) {
    const t0 = performance.now();
    function step(ts) {
      const p = clamp((ts-t0)/ms, 0, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1-p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ─── Sparkline ─── */
  function drawSparkline(canvas, data) {
    if (!data.length) return;
    const dpr = window.devicePixelRatio||1;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w*dpr; canvas.height = h*dpr;
    const ctx = canvas.getContext('2d'); ctx.scale(dpr,dpr);
    const max=Math.max(...data,1), min=Math.min(...data,0), range=max-min||1, pad=10;
    ctx.strokeStyle='#34D399'; ctx.lineWidth=2; ctx.lineJoin='round'; ctx.beginPath();
    data.forEach((v,i) => { const x=data.length===1?w/2:(i/(data.length-1))*w, y=pad+(1-(v-min)/range)*(h-pad*2); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
    ctx.stroke();
    ctx.lineTo(data.length===1?w/2:w, h); ctx.lineTo(0,h); ctx.closePath();
    const g=ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'rgba(52,211,153,0.25)'); g.addColorStop(1,'rgba(52,211,153,0)'); ctx.fillStyle=g; ctx.fill();
    ctx.fillStyle='#34D399';
    data.forEach((v,i) => { const x=data.length===1?w/2:(i/(data.length-1))*w, y=pad+(1-(v-min)/range)*(h-pad*2); ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2); ctx.fill(); });
  }

  /* ─── Share (Web Share API + fallback) ─── */
  function shareResult() {
    const r = S.lastResult;
    if (!r) return;
    const text = '\u2328\ufe0f Typing Speed: ' + r.wpm + ' WPM | Accuracy: ' + r.acc + '% | Consistency: ' + r.consistency + '%\nTest yours: aguidetocloud.com/typing-test';

    if (navigator.share) {
      navigator.share({ title: 'My Typing Speed', text: text, url: 'https://www.aguidetocloud.com/typing-test/' }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => showToast('\ud83d\udccb Copied to clipboard!')).catch(() => downloadShareCard(r));
    } else {
      downloadShareCard(r);
    }
  }

  function downloadShareCard(r) {
    const canvas = document.createElement('canvas'); canvas.width=600; canvas.height=340;
    const ctx = canvas.getContext('2d');
    const bg = ctx.createLinearGradient(0,0,600,340); bg.addColorStop(0,'#0f172a'); bg.addColorStop(1,'#1e293b'); ctx.fillStyle=bg; ctx.fillRect(0,0,600,340);
    ctx.strokeStyle='#34D399'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.roundRect(8,8,584,324,16); ctx.stroke();
    ctx.textAlign='center';
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='14px sans-serif'; ctx.fillText('TYPING SPEED TEST',300,45);
    ctx.fillStyle='#34D399'; ctx.font='bold 80px monospace'; ctx.fillText(String(r.wpm),300,140);
    ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='18px sans-serif'; ctx.fillText('WORDS PER MINUTE',300,170);
    ctx.font='16px monospace'; ctx.fillStyle='rgba(255,255,255,0.7)';
    ctx.fillText('Accuracy '+r.acc+'%   \u00b7   Consistency '+r.consistency+'%',300,215);
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='14px monospace';
    ctx.fillText(r.correct+' correct  \u00b7  '+r.incorrect+' errors  \u00b7  '+r.duration+'s '+r.mode+' mode',300,245);
    ctx.fillStyle='#34D399'; ctx.font='13px sans-serif'; ctx.fillText('aguidetocloud.com/typing-test',300,310);
    const link = document.createElement('a'); link.download='typing-test-'+r.wpm+'wpm.png'; link.href=canvas.toDataURL('image/png'); link.click();
    showToast('\ud83d\udcf8 Result image downloaded!');
  }

  /* ═══════════════════════════════════════
     LOCALSTORAGE
     ═══════════════════════════════════════ */
  function loadStats() { try { return JSON.parse(localStorage.getItem('typist_stats'))||defaultStats(); } catch { return defaultStats(); } }
  function defaultStats() { return {results:[],keyErrors:{},keyAttempts:{},totalTime:0}; }
  function saveResult(r) { try { const s=loadStats(); s.results.push(r); if(s.results.length>100)s.results=s.results.slice(-100); s.totalTime=(s.totalTime||0)+r.duration; localStorage.setItem('typist_stats',JSON.stringify(s)); } catch {} }
  function mergeKeyStats() { try { const s=loadStats(); for(const[k,v]of Object.entries(S.keyErrors))s.keyErrors[k]=(s.keyErrors[k]||0)+v; for(const[k,v]of Object.entries(S.keyAttempts))s.keyAttempts[k]=(s.keyAttempts[k]||0)+v; localStorage.setItem('typist_stats',JSON.stringify(s)); } catch {} }
  function clearStats() { if(!confirm('Clear all your typing stats? This cannot be undone.'))return; localStorage.removeItem('typist_stats'); renderStatsTab(); showToast('\ud83d\uddd1\ufe0f Stats cleared'); }

  /* ═══════════════════════════════════════
     STATS TAB
     ═══════════════════════════════════════ */
  function renderStatsTab() {
    const stats = loadStats(), results = stats.results||[];
    const total = results.length;
    const best = total ? Math.max(...results.map(r=>r.wpm)) : 0;
    const avg = total ? Math.round(results.reduce((a,r)=>a+r.wpm,0)/total) : 0;
    const avgAcc = total ? Math.round(results.reduce((a,r)=>a+r.acc,0)/total) : 0;
    const last10 = results.slice(-10);
    const avg10 = last10.length ? Math.round(last10.reduce((a,r)=>a+r.wpm,0)/last10.length) : 0;
    const mins = Math.round((stats.totalTime||0)/60);

    $('typist-stats-overview').innerHTML = [
      card(total,'Tests Taken'), card(best,'Best WPM'), card(avg,'Avg WPM'),
      card(avg10,'Last 10 Avg'), card(avgAcc+'%','Avg Accuracy'), card(mins+'m','Time Spent')
    ].join('');

    drawTrendChart($('typist-trend-chart'), results.slice(-20));
    $('typist-keyboard-heatmap').innerHTML = renderKeyboardHeatmap(stats);
    renderHistoryTable(results.slice(-20).reverse());
  }

  function card(v,l) { return '<div class="typist-overview-card"><span class="typist-overview-val">'+v+'</span><span class="typist-overview-lbl">'+esc(l)+'</span></div>'; }

  function drawTrendChart(canvas, data) {
    const dpr = window.devicePixelRatio||1;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w*dpr; canvas.height = h*dpr;
    const ctx = canvas.getContext('2d'); ctx.scale(dpr,dpr);
    if (!data.length) { ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.font='14px sans-serif'; ctx.textAlign='center'; ctx.fillText('Complete some tests to see your trend',w/2,h/2); return; }
    const wpm = data.map(r=>r.wpm), max = Math.max(...wpm,10);
    const p = {top:20,bottom:30,left:40,right:10}, cw=w-p.left-p.right, ch=h-p.top-p.bottom;
    ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=1;
    for(let i=0;i<=4;i++){const y=p.top+(ch/4)*i; ctx.beginPath();ctx.moveTo(p.left,y);ctx.lineTo(w-p.right,y);ctx.stroke(); ctx.fillStyle='rgba(255,255,255,0.25)';ctx.font='10px monospace';ctx.textAlign='right';ctx.fillText(Math.round(max-(max/4)*i),p.left-5,y+4);}
    ctx.strokeStyle='#34D399'; ctx.lineWidth=2; ctx.lineJoin='round'; ctx.beginPath();
    wpm.forEach((v,i)=>{const x=p.left+(wpm.length===1?cw/2:(i/(wpm.length-1))*cw),y=p.top+(1-v/max)*ch;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
    ctx.stroke();
    ctx.lineTo(p.left+(wpm.length===1?cw/2:cw),p.top+ch);ctx.lineTo(p.left,p.top+ch);ctx.closePath();
    const g=ctx.createLinearGradient(0,p.top,0,p.top+ch);g.addColorStop(0,'rgba(52,211,153,0.2)');g.addColorStop(1,'rgba(52,211,153,0)');ctx.fillStyle=g;ctx.fill();
    ctx.fillStyle='#34D399';
    wpm.forEach((v,i)=>{const x=p.left+(wpm.length===1?cw/2:(i/(wpm.length-1))*cw),y=p.top+(1-v/max)*ch;ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fill();});
    ctx.fillStyle='rgba(255,255,255,0.25)';ctx.font='10px monospace';ctx.textAlign='center';
    wpm.forEach((_,i)=>{if(wpm.length<=10||i%Math.ceil(wpm.length/10)===0){const x=p.left+(wpm.length===1?cw/2:(i/(wpm.length-1))*cw);ctx.fillText('#'+(i+1),x,h-8);}});
  }

  function renderKeyboardHeatmap(stats) {
    const errors=stats.keyErrors||{},attempts=stats.keyAttempts||{},has=Object.keys(attempts).length>0;
    let html = '<div class="typist-keyboard">';
    KB_ROWS.forEach((row,ri) => {
      html += '<div class="typist-kb-row" style="padding-left:'+ri*1.2+'rem">';
      row.forEach(key => {
        const err=errors[key]||0,att=attempts[key]||0,rate=att>0?err/att:-1;
        let bg = !has||rate<0 ? 'rgba(255,255,255,0.04)' : 'hsla('+Math.round(120*(1-clamp(rate*8,0,1)))+',65%,35%,0.7)';
        const title = att>0 ? key.toUpperCase()+': '+att+' typed, '+err+' errors ('+(rate*100).toFixed(1)+'%)' : key.toUpperCase()+': no data';
        html += '<div class="typist-key" style="background:'+bg+'" title="'+title+'">'+esc(key)+'</div>';
      });
      html += '</div>';
    });
    const se=errors[' ']||0,sa=attempts[' ']||0,sr=sa>0?se/sa:-1;
    let sb = !has||sr<0 ? 'rgba(255,255,255,0.04)' : 'hsla('+Math.round(120*(1-clamp(sr*8,0,1)))+',65%,35%,0.7)';
    html += '<div class="typist-kb-row" style="justify-content:center"><div class="typist-key typist-key-space" style="background:'+sb+'" title="Space: '+sa+' typed, '+se+' errors">space</div></div>';
    html += '</div>';
    // Accessible summary
    const topErr = Object.entries(errors).sort((a,b)=>b[1]-a[1]).slice(0,5);
    if (topErr.length) {
      html += '<p class="sr-only">Top problem keys: ' + topErr.map(([k,v])=>k.toUpperCase()+' ('+v+' errors)').join(', ') + '</p>';
    }
    return html;
  }

  function renderHistoryTable(results) {
    const el = $('typist-history-table');
    if (!results.length) { el.innerHTML='<p style="color:rgba(255,255,255,0.35);text-align:center;font-size:0.85rem">No tests yet. Complete a test to see your history.</p>'; return; }
    let html='<div class="typist-history-wrap"><table class="typist-history"><thead><tr><th>Date</th><th>Mode</th><th>WPM</th><th>Raw</th><th>Acc</th><th>Duration</th></tr></thead><tbody>';
    results.forEach(r=>{
      const d=new Date(r.date).toLocaleDateString(undefined,{month:'short',day:'numeric'});
      const m=r.mode==='code'?'Code ('+(r.codeLang||'js')+')':r.mode;
      html+='<tr><td>'+d+'</td><td>'+esc(m)+'</td><td class="typist-wpm-cell">'+r.wpm+'</td><td>'+(r.rawWpm||'-')+'</td><td>'+r.acc+'%</td><td>'+r.duration+'s</td></tr>';
    });
    html+='</tbody></table></div>'; el.innerHTML=html;
  }

  /* ═══════════════════════════════════════
     SOUND / THEME
     ═══════════════════════════════════════ */
  function playKeySound() {
    try {
      if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();
      const o=audioCtx.createOscillator(),g=audioCtx.createGain();
      o.connect(g);g.connect(audioCtx.destination);
      o.frequency.value=600+Math.random()*400;o.type='sine';
      g.gain.setValueAtTime(0.04,audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.05);
      o.start();o.stop(audioCtx.currentTime+0.06);
    } catch {}
  }

  function applyTheme() {
    const page=document.querySelector('.typist-page'); if(!page)return;
    page.classList.toggle('typist-retro', S.theme==='retro');
    $('typist-theme-toggle').textContent = S.theme==='retro' ? '\u2728 Modern' : '\ud83d\udda5\ufe0f Retro';
    $('typist-theme-toggle').classList.toggle('active', S.theme==='retro');
  }
  function toggleTheme() { S.theme=S.theme==='retro'?'modern':'retro'; try{localStorage.setItem('typist_theme',S.theme);}catch{} applyTheme(); }
  function toggleSound() {
    S.sound=!S.sound; try{localStorage.setItem('typist_sound',S.sound);}catch{}
    const b=$('typist-sound-toggle'); b.textContent=S.sound?'\ud83d\udd0a Sound On':'\ud83d\udd07 Sound Off'; b.classList.toggle('active',S.sound);
    if(S.sound&&!audioCtx) try{audioCtx=new(window.AudioContext||window.webkitAudioContext)();}catch{}
  }

  /* ═══════════════════════════════════════
     TABS
     ═══════════════════════════════════════ */
  function switchTab(tab) {
    document.querySelectorAll('.typist-tab').forEach(t=>{t.classList.toggle('active',t.dataset.tab===tab);t.setAttribute('aria-selected',t.dataset.tab===tab);});
    document.querySelectorAll('.typist-panel').forEach(p=>{p.classList.toggle('active',p.id==='panel-'+tab);});
    if(tab==='stats'){ renderStatsTab(); inputEl.blur(); }
    if(tab==='quick'){S.mode='words';initTest();}
    if(tab==='practice'){
      const ap=document.querySelector('.typist-mode.active');
      S.mode=ap?ap.dataset.mode:'quote';
      initTest();
    }
  }

  function showToast(msg) {
    const old=document.querySelector('.typist-toast'); if(old)old.remove();
    const el=document.createElement('div');el.className='typist-toast';el.textContent=msg;el.setAttribute('role','status');
    document.body.appendChild(el); setTimeout(()=>el.remove(),2500);
  }

  /* ═══════════════════════════════════════
     EVENTS
     ═══════════════════════════════════════ */
  function setupEvents() {
    inputEl=$('typist-input'); textEl=$('typist-text'); textArea=$('typist-text-area'); focusHint=$('typist-focus-hint'); statsBar=$('typist-stats-bar');

    inputEl.addEventListener('input', handleInput);
    inputEl.addEventListener('paste', e => { e.preventDefault(); showToast('\u26a0\ufe0f Pasting is disabled during typing tests'); });
    textArea.addEventListener('click', () => { if(!S.finished)inputEl.focus(); });

    // Shortcuts
    document.addEventListener('keydown', e => {
      if(e.key==='Enter'&&e.ctrlKey&&!e.altKey&&!e.metaKey){e.preventDefault();$('typist-results').classList.add('typist-hidden');initTest();return;}
      if(e.key==='Escape'&&S.started&&!S.finished){e.preventDefault();endTest();}
    });

    // Tabs
    document.querySelectorAll('.typist-tab').forEach(t=>t.addEventListener('click',()=>switchTab(t.dataset.tab)));

    // Test mode toggle (time/words)
    $('typist-test-mode-pills').addEventListener('click', e => {
      const pill = e.target.closest('.typist-pill'); if(!pill) return;
      document.querySelectorAll('#typist-test-mode-pills .typist-pill').forEach(p=>p.classList.remove('active'));
      pill.classList.add('active');
      S.testMode = pill.dataset.tmode;
      $('typist-duration-row').classList.toggle('typist-hidden', S.testMode==='wordcount');
      $('typist-wordcount-row').classList.toggle('typist-hidden', S.testMode==='time');
      S.mode='words'; initTest();
    });

    // Duration pills
    $('typist-duration-pills').addEventListener('click', e => {
      const pill=e.target.closest('.typist-pill'); if(!pill)return;
      document.querySelectorAll('#typist-duration-pills .typist-pill').forEach(p=>p.classList.remove('active'));
      pill.classList.add('active'); S.duration=parseInt(pill.dataset.dur); S.mode='words'; initTest();
    });

    // Word count pills
    $('typist-wordcount-pills').addEventListener('click', e => {
      const pill=e.target.closest('.typist-pill'); if(!pill)return;
      document.querySelectorAll('#typist-wordcount-pills .typist-pill').forEach(p=>p.classList.remove('active'));
      pill.classList.add('active'); S.wordCount=parseInt(pill.dataset.wc); S.mode='words'; initTest();
    });

    // Punctuation + numbers toggles
    $('typist-toggle-punct').addEventListener('click', function(){ S.punctuation=!S.punctuation; this.classList.toggle('active',S.punctuation); if(S.mode==='words')initTest(); });
    $('typist-toggle-nums').addEventListener('click', function(){ S.numbers=!S.numbers; this.classList.toggle('active',S.numbers); if(S.mode==='words')initTest(); });

    // Practice modes
    $('typist-mode-pills').addEventListener('click', e => {
      const btn=e.target.closest('.typist-mode'); if(!btn)return;
      document.querySelectorAll('.typist-mode').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active'); S.mode=btn.dataset.mode;
      $('typist-code-lang').classList.toggle('typist-hidden',S.mode!=='code');
      $('typist-custom-wrap').classList.toggle('typist-hidden',S.mode!=='custom');
      if(S.mode!=='custom')initTest();
    });
    $('typist-code-lang').addEventListener('click', e => {
      const btn=e.target.closest('.typist-lang'); if(!btn)return;
      document.querySelectorAll('.typist-lang').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active'); S.codeLang=btn.dataset.lang; initTest();
    });
    $('typist-custom-start').addEventListener('click', () => { S.mode='custom'; initTest(); });

    // Results
    $('typist-restart').addEventListener('click', () => { $('typist-results').classList.add('typist-hidden'); initTest(); });
    $('typist-next-test').addEventListener('click', () => { $('typist-results').classList.add('typist-hidden'); initTest(); });
    $('typist-share-btn').addEventListener('click', shareResult);

    $('typist-theme-toggle').addEventListener('click', toggleTheme);
    $('typist-sound-toggle').addEventListener('click', toggleSound);
    $('typist-clear-stats').addEventListener('click', clearStats);

    // Dismiss mobile hint
    const dismiss = $('typist-mobile-dismiss');
    if (dismiss) dismiss.addEventListener('click', () => { $('typist-mobile-hint').style.display='none'; });

    // Global focus capture (skip form elements)
    document.addEventListener('keydown', e => {
      if(S.finished||document.activeElement===inputEl)return;
      const tag=document.activeElement?.tagName;
      if(tag==='TEXTAREA'||tag==='INPUT'||tag==='SELECT')return;
      if(e.key.length===1&&!e.ctrlKey&&!e.altKey&&!e.metaKey){
        const ap=document.querySelector('.typist-panel.active');
        if(ap&&ap.id!=='panel-stats')inputEl.focus();
      }
    });
  }

  /* ═══════════════════════════════════════
     INIT
     ═══════════════════════════════════════ */
  function init() {
    setupEvents();
    applyTheme();
    const sb=$('typist-sound-toggle'); sb.textContent=S.sound?'\ud83d\udd0a Sound On':'\ud83d\udd07 Sound Off'; sb.classList.toggle('active',S.sound);
    if('ontouchstart' in window && window.innerWidth<768) $('typist-mobile-hint').style.display='block';

    // Resize observer for charts
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          const statsPanel = $('panel-stats');
          if (statsPanel && statsPanel.classList.contains('active')) renderStatsTab();
        }, 200);
      });
      ro.observe(document.querySelector('.typist-page'));
    }

    initTest();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();