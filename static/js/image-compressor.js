/* ══════════════════════════════════════════════════════════
   Image Compressor — image-compressor.js  (v3 — world-class)
   100% client-side, zero API calls
   Uses: JSZip (CDN, lazy), heic2any (CDN, lazy for HEIC)
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Helpers ── */
  const $ = (s, p) => (p || document).querySelector(s);
  const $$ = (s, p) => [...(p || document).querySelectorAll(s)];
  const esc = s => { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; };

  function fmtSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  }

  function pct(a, b) { return b ? Math.round((1 - a / b) * 100) : 0; }

  /* Accessible toast with aria-live */
  const toastLive = document.createElement('div');
  toastLive.setAttribute('aria-live', 'polite');
  toastLive.setAttribute('role', 'status');
  toastLive.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:9999;pointer-events:none';
  document.body.appendChild(toastLive);

  function toast(msg, type) {
    const el = document.createElement('div');
    el.className = 'imgcomp-toast' + (type === 'success' ? ' success' : '');
    el.textContent = msg;
    toastLive.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }

  function uid() { return 'img_' + Math.random().toString(36).slice(2, 10); }

  /* Canvas dimension safety */
  const MAX_CANVAS_AREA = 200000000;
  const MAX_CANVAS_DIM = 16384;

  function safeDimensions(w, h) {
    if (w > MAX_CANVAS_DIM) { h = Math.round(h * (MAX_CANVAS_DIM / w)); w = MAX_CANVAS_DIM; }
    if (h > MAX_CANVAS_DIM) { w = Math.round(w * (MAX_CANVAS_DIM / h)); h = MAX_CANVAS_DIM; }
    if (w * h > MAX_CANVAS_AREA) {
      const scale = Math.sqrt(MAX_CANVAS_AREA / (w * h));
      w = Math.round(w * scale);
      h = Math.round(h * scale);
    }
    return [Math.max(1, w), Math.max(1, h)];
  }

  /* ── AVIF support detection ── */
  let avifSupported = false;
  (function detectAvif() {
    const c = document.createElement('canvas');
    c.width = 1; c.height = 1;
    c.toBlob(function (blob) {
      avifSupported = !!(blob && blob.size > 0);
      var opt = $('#imgcomp-avif-opt');
      if (opt) {
        if (avifSupported) { opt.disabled = false; opt.textContent = 'AVIF'; }
        else { opt.textContent = 'AVIF (not supported in this browser)'; }
      }
    }, 'image/avif', 0.8);
  })();

  function outMime(entry) {
    var m = entry.format || entry.file.type;
    if (m === 'image/gif') return 'image/png';
    if (m === 'image/heic' || m === 'image/heif') return 'image/jpeg';
    if (m === 'image/avif' && !avifSupported) return 'image/webp';
    return m;
  }

  function extFor(mime) {
    if (mime === 'image/webp') return '.webp';
    if (mime === 'image/png') return '.png';
    if (mime === 'image/avif') return '.avif';
    return '.jpg';
  }

  /* ── Smart Presets ── */
  var PRESETS = {
    web:       { quality: 82, format: 'image/webp',  maxW: 1920, maxH: 0 },
    email:     { quality: 70, format: 'image/jpeg',   maxW: 1200, maxH: 0 },
    social:    { quality: 85, format: 'image/jpeg',   maxW: 1080, maxH: 0 },
    thumbnail: { quality: 75, format: 'image/webp',  maxW: 400,  maxH: 0 },
    print:     { quality: 95, format: 'image/png',    maxW: 4096, maxH: 0 },
    max:       { quality: 60, format: 'image/webp',  maxW: 1600, maxH: 0 }
  };

  /* ── State ── */
  var S = {
    images: [],
    maxBatch: 20,
    maxFileSize: 50 * 1024 * 1024,
    activePreset: null
  };

  /* Processing queue — concurrency=2 */
  var QUEUE_CONCURRENCY = 2;
  var queueRunning = 0;
  var queue = [];

  function enqueue(fn) {
    return new Promise(function (resolve, reject) {
      queue.push({ fn: fn, resolve: resolve, reject: reject });
      drainQueue();
    });
  }

  function drainQueue() {
    while (queueRunning < QUEUE_CONCURRENCY && queue.length) {
      var item = queue.shift();
      queueRunning++;
      item.fn().then(item.resolve, item.reject).finally(function () { queueRunning--; drainQueue(); });
    }
  }

  /* ── DOM refs ── */
  var dropZone     = $('#imgcomp-drop');
  var fileInput    = $('#imgcomp-file-input');
  var batchPanel   = $('#imgcomp-batch');
  var batchStats   = $('#imgcomp-batch-stats');
  var listEl       = $('#imgcomp-list');
  var dlZipBtn     = $('#imgcomp-download-zip');
  var dlAllBtn     = $('#imgcomp-download-all');
  var clearAllBtn  = $('#imgcomp-clear-all');
  var applyBtn     = $('#imgcomp-apply-btn');
  var globalQ      = $('#imgcomp-global-quality');
  var globalQVal   = $('#imgcomp-global-quality-val');
  var globalFmt    = $('#imgcomp-global-format');
  var globalResize = $('#imgcomp-global-resize');
  var globalMaxW   = $('#imgcomp-global-maxw');
  var globalMaxH   = $('#imgcomp-global-maxh');
  var globalTarget = $('#imgcomp-global-target');
  var presetsPanel = $('#imgcomp-presets');
  var modal        = $('#imgcomp-modal');
  var modalBody    = $('#imgcomp-modal-body');
  var modalTitle   = $('#imgcomp-modal-title');

  /* ══════════════════════════════════════════════════════════
     HEIC / HEIF SUPPORT — lazy-load heic2any
     ══════════════════════════════════════════════════════════ */
  var heic2anyLoaded = false;
  function loadHeic2any() {
    if (heic2anyLoaded) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js';
      s.onload = function () { heic2anyLoaded = true; resolve(); };
      s.onerror = function () { reject(new Error('Failed to load HEIC converter')); };
      document.head.appendChild(s);
    });
  }

  function isHEIC(file) {
    return file.type === 'image/heic' || file.type === 'image/heif' ||
           /\.heic$/i.test(file.name) || /\.heif$/i.test(file.name);
  }

  async function convertHEIC(file) {
    await loadHeic2any();
    var blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
    var result = Array.isArray(blob) ? blob[0] : blob;
    return new File([result], file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg'), { type: 'image/jpeg' });
  }

  /* ══════════════════════════════════════════════════════════
     FILE INPUT
     ══════════════════════════════════════════════════════════ */

  dropZone.addEventListener('click', function () { fileInput.click(); });
  dropZone.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); } });

  ['dragenter', 'dragover'].forEach(function (ev) {
    dropZone.addEventListener(ev, function (e) { e.preventDefault(); dropZone.classList.add('dragover'); });
  });
  ['dragleave', 'drop'].forEach(function (ev) {
    dropZone.addEventListener(ev, function (e) { e.preventDefault(); dropZone.classList.remove('dragover'); });
  });

  dropZone.addEventListener('drop', function (e) {
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener('change', function () {
    if (fileInput.files.length) addFiles(fileInput.files);
    fileInput.value = '';
  });

  /* Clipboard paste — skip when text input focused */
  document.addEventListener('paste', function (e) {
    var tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (document.activeElement && document.activeElement.isContentEditable) return;
    var items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    var files = [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image/') === 0) {
        var f = items[i].getAsFile();
        if (f) files.push(f);
      }
    }
    if (files.length) addFiles(files);
  });

  /* ── Validate & add files ── */
  function addFiles(fileList) {
    var accepted = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];
    var remaining = S.maxBatch - S.images.length;
    if (remaining <= 0) { toast('Maximum 20 images reached'); return; }

    var added = 0, skippedFmt = 0, skippedSize = 0;
    for (var i = 0; i < fileList.length && added < remaining; i++) {
      var f = fileList[i];
      var isHeic = isHEIC(f);
      if (!accepted.includes(f.type) && !isHeic) { skippedFmt++; continue; }
      if (f.size > S.maxFileSize) { skippedSize++; continue; }

      var preset = S.activePreset ? PRESETS[S.activePreset] : null;
      var entry = {
        id: uid(), file: f, origUrl: null, origW: 0, origH: 0,
        compBlob: null, compUrl: null,
        quality: preset ? preset.quality : 80,
        format: preset ? preset.format : '',
        maxW: preset ? preset.maxW : 0,
        maxH: preset ? preset.maxH : 0,
        processing: false, elapsed: 0, error: null,
        jobVersion: 0, gifWarning: false, useOriginal: false, targetWarning: null,
        isHeic: isHeic, heicConverted: false
      };
      S.images.push(entry);
      enqueue(function () { return loadAndCompress(entry); });
      added++;
    }

    var msgs = [];
    if (added) msgs.push(added + ' image' + (added > 1 ? 's' : '') + ' added');
    if (skippedFmt) msgs.push(skippedFmt + ' unsupported format');
    if (skippedSize) msgs.push(skippedSize + ' too large (>' + fmtSize(S.maxFileSize) + ')');
    if (msgs.length) toast(msgs.join(' · '), added > 0 ? 'success' : 'error');

    if (added > 0) updateUI();
  }

  /* ── Load + initial compress ── */
  async function loadAndCompress(entry) {
    renderCard(entry);

    // HEIC conversion
    if (entry.isHeic && !entry.heicConverted) {
      entry.processing = true;
      renderCard(entry);
      try {
        entry.file = await convertHEIC(entry.file);
        entry.heicConverted = true;
      } catch (err) {
        entry.error = 'HEIC conversion failed — check your internet connection or try a JPEG/PNG instead';
        entry.processing = false;
        renderCard(entry);
        updateBatchStats();
        return;
      }
    }

    var url = URL.createObjectURL(entry.file);
    entry.origUrl = url;

    try {
      // createImageBitmap for faster decoding
      var w, h;
      if (typeof createImageBitmap === 'function') {
        var bmp = await createImageBitmap(entry.file);
        w = bmp.width; h = bmp.height;
        bmp.close();
      } else {
        var dims = await new Promise(function (res, rej) {
          var img = new Image();
          img.onload = function () { res({ w: img.naturalWidth, h: img.naturalHeight }); };
          img.onerror = function () { rej(new Error('Decode failed')); };
          img.src = url;
        });
        w = dims.w; h = dims.h;
      }
      entry.origW = w;
      entry.origH = h;
      if (entry.file.type === 'image/gif') entry.gifWarning = true;
      await compress(entry);
    } catch (err) {
      entry.error = 'Could not decode image';
      entry.processing = false;
      renderCard(entry);
      updateBatchStats();
    }
  }

  /* ══════════════════════════════════════════════════════════
     COMPRESSION ENGINE
     ══════════════════════════════════════════════════════════ */

  function compress(entry) {
    var version = ++entry.jobVersion;
    entry.processing = true;
    entry.error = null;
    entry.targetWarning = null;
    renderCard(entry);
    var t0 = performance.now();

    return new Promise(function (resolve) {
      var img = new Image();
      img.onerror = function () {
        if (entry.jobVersion !== version) { resolve(); return; }
        entry.error = 'Decode failed during compression';
        entry.processing = false;
        renderCard(entry);
        resolve();
      };
      img.onload = function () {
        if (entry.jobVersion !== version) { resolve(); return; }

        var w = img.naturalWidth, h = img.naturalHeight;
        if (entry.maxW > 0 && w > entry.maxW) { h = Math.round(h * (entry.maxW / w)); w = entry.maxW; }
        if (entry.maxH > 0 && h > entry.maxH) { w = Math.round(w * (entry.maxH / h)); h = entry.maxH; }
        var safe = safeDimensions(w, h); w = safe[0]; h = safe[1];

        var canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        var ctx = canvas.getContext('2d');
        if (!ctx) { entry.error = 'Canvas context unavailable'; entry.processing = false; renderCard(entry); resolve(); return; }

        var mime = outMime(entry);
        var preserveAlpha = $('#imgcomp-preserve-alpha') && $('#imgcomp-preserve-alpha').checked;

        if (mime === 'image/jpeg' || (!preserveAlpha && (mime === 'image/png' || mime === 'image/webp'))) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
        }

        ctx.drawImage(img, 0, 0, w, h);

        canvas.toBlob(function (blob) {
          if (entry.jobVersion !== version) { resolve(); return; }
          if (!blob) { entry.error = 'Compression produced no output'; entry.processing = false; renderCard(entry); resolve(); return; }

          if (entry.compUrl) URL.revokeObjectURL(entry.compUrl);
          entry.compBlob = blob;
          entry.compUrl = URL.createObjectURL(blob);
          entry.processing = false;
          entry.elapsed = Math.round(performance.now() - t0);
          entry.useOriginal = blob.size >= entry.file.size;
          renderCard(entry);
          updateBatchStats();
          resolve();
        }, mime, entry.quality / 100);
      };
      img.src = entry.origUrl;
    });
  }

  /* ── Target file size: binary search ── */
  function compressToTarget(entry, targetKB) {
    var version = ++entry.jobVersion;
    entry.processing = true;
    entry.error = null;
    entry.targetWarning = null;
    renderCard(entry);
    var t0 = performance.now();
    var targetBytes = targetKB * 1024;

    return new Promise(function (resolve) {
      var img = new Image();
      img.onerror = function () { if (entry.jobVersion !== version) { resolve(); return; } entry.error = 'Decode failed'; entry.processing = false; renderCard(entry); resolve(); };
      img.onload = function () {
        if (entry.jobVersion !== version) { resolve(); return; }

        var w = img.naturalWidth, h = img.naturalHeight;
        if (entry.maxW > 0 && w > entry.maxW) { h = Math.round(h * (entry.maxW / w)); w = entry.maxW; }
        if (entry.maxH > 0 && h > entry.maxH) { w = Math.round(w * (entry.maxH / h)); h = entry.maxH; }
        var safe = safeDimensions(w, h); w = safe[0]; h = safe[1];

        var canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        var ctx = canvas.getContext('2d');
        if (!ctx) { entry.error = 'Canvas unavailable'; entry.processing = false; renderCard(entry); resolve(); return; }

        var mime = outMime(entry);
        if (mime === 'image/jpeg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h); }
        ctx.drawImage(img, 0, 0, w, h);

        var lo = 1, hi = 100, best = null, bestQ = 1;
        function tryQ(q) { return new Promise(function (res) { canvas.toBlob(function (blob) { res(blob); }, mime, q / 100); }); }

        (async function search() {
          if (entry.jobVersion !== version) { resolve(); return; }

          if (mime === 'image/png') {
            var b = await tryQ(100);
            best = b; bestQ = 100;
            if (b && b.size > targetBytes) entry.targetWarning = 'PNG is lossless — try WebP or JPEG to hit target';
          } else {
            var minBlob = await tryQ(1);
            if (!minBlob) { entry.error = 'Compression failed'; entry.processing = false; renderCard(entry); resolve(); return; }
            if (minBlob.size > targetBytes) {
              best = minBlob; bestQ = 1;
              entry.targetWarning = 'Min quality \u2192 ' + fmtSize(minBlob.size) + '. Try reducing dimensions or switching format.';
            } else {
              for (var i = 0; i < 8; i++) {
                var mid = Math.round((lo + hi) / 2);
                var blob = await tryQ(mid);
                if (blob && blob.size <= targetBytes) { best = blob; bestQ = mid; lo = mid + 1; }
                else { hi = mid - 1; }
              }
              if (!best) { best = await tryQ(lo); bestQ = lo; }
            }
          }

          if (entry.jobVersion !== version) { resolve(); return; }
          if (entry.compUrl) URL.revokeObjectURL(entry.compUrl);
          entry.quality = bestQ;
          entry.compBlob = best;
          entry.compUrl = best ? URL.createObjectURL(best) : null;
          entry.processing = false;
          entry.useOriginal = best ? best.size >= entry.file.size : false;
          entry.elapsed = Math.round(performance.now() - t0);
          renderCard(entry);
          updateBatchStats();
          resolve();
        })();
      };
      img.src = entry.origUrl;
    });
  }

  /* ══════════════════════════════════════════════════════════
     RENDER IMAGE CARD
     ══════════════════════════════════════════════════════════ */

  function renderCard(entry) {
    var card = $('#card-' + entry.id);
    if (!card) {
      card = document.createElement('div');
      card.className = 'imgcomp-card';
      card.id = 'card-' + entry.id;
      card.setAttribute('tabindex', '0');
      listEl.appendChild(card);
    }

    var savings = entry.compBlob ? pct(entry.compBlob.size, entry.file.size) : 0;
    var badgeClass = savings > 0 ? 'positive' : savings < 0 ? 'negative' : 'neutral';
    var badgeText = savings > 0 ? 'Saved ' + savings + '%' : savings < 0 ? Math.abs(savings) + '% larger' : 'Same size';

    var warnings = '';
    if (entry.gifWarning) warnings += '<div class="imgcomp-card-warn">\u26a0\ufe0f Animated GIFs are flattened to a single frame</div>';
    if (entry.useOriginal && entry.compBlob) warnings += '<div class="imgcomp-card-warn">\ud83d\udca1 Compressed is larger \u2014 consider using the original</div>';
    if (entry.targetWarning) warnings += '<div class="imgcomp-card-warn">\u26a0\ufe0f ' + esc(entry.targetWarning) + '</div>';
    if (entry.error) warnings += '<div class="imgcomp-card-warn imgcomp-card-error">\u274c ' + esc(entry.error) + '</div>';

    var processingLabel = entry.isHeic && !entry.heicConverted ? 'Converting HEIC\u2026' : 'Compressing\u2026';

    var resizeOpts = '<option value="">No resize</option>' +
      '<option value="3840"' + (entry.maxW === 3840 ? ' selected' : '') + '>4K (3840px)</option>' +
      '<option value="1920"' + (entry.maxW === 1920 ? ' selected' : '') + '>Full HD (1920px)</option>' +
      '<option value="1280"' + (entry.maxW === 1280 ? ' selected' : '') + '>HD (1280px)</option>' +
      '<option value="1080"' + (entry.maxW === 1080 ? ' selected' : '') + '>Social (1080px)</option>' +
      '<option value="800"' + (entry.maxW === 800 ? ' selected' : '') + '>Blog (800px)</option>' +
      '<option value="400"' + (entry.maxW === 400 ? ' selected' : '') + '>Thumbnail (400px)</option>' +
      '<option value="custom"' + (entry.maxW && ![0,3840,1920,1280,1080,800,400].includes(entry.maxW) ? ' selected' : '') + '>Custom\u2026</option>';

    var standardSizes = [0,3840,1920,1280,1080,800,400];
    var showCustom = (entry.maxW && !standardSizes.includes(entry.maxW)) || (entry.maxH && entry.maxH > 0);
    var avifOpt = avifSupported ? '<option value="image/avif"' + (entry.format === 'image/avif' ? ' selected' : '') + '>AVIF</option>' : '';

    card.innerHTML =
      '<div class="imgcomp-card-top">' +
        '<div class="imgcomp-thumb-wrap">' +
          (entry.compUrl || entry.origUrl
            ? '<img class="imgcomp-thumb" src="' + (entry.compUrl || entry.origUrl) + '" alt="' + esc(entry.file.name) + '" loading="lazy">'
            : '<div class="imgcomp-thumb-placeholder">\ud83d\uddbc\ufe0f</div>') +
        '</div>' +
        '<div class="imgcomp-info">' +
          '<div class="imgcomp-filename" title="' + esc(entry.file.name) + '">' + esc(entry.file.name) + '</div>' +
          '<div class="imgcomp-meta">' +
            (entry.origW ? '<span>' + entry.origW + '\u00d7' + entry.origH + '</span>' : '') +
            '<span>Original: ' + fmtSize(entry.file.size) + '</span>' +
            (entry.compBlob ? '<span>Compressed: ' + fmtSize(entry.compBlob.size) + '</span>' : '') +
          '</div>' +
          (entry.processing
            ? '<div class="imgcomp-processing"><div class="imgcomp-spinner"></div> ' + processingLabel + '</div>'
            : entry.compBlob
              ? '<div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap">' +
                  '<span class="imgcomp-savings-badge ' + badgeClass + '">' + badgeText + '</span>' +
                  '<span class="imgcomp-time">\u26a1 ' + entry.elapsed + 'ms</span>' +
                '</div>'
              : '') +
          warnings +
        '</div>' +
        '<div class="imgcomp-card-actions">' +
          (entry.compBlob ? '<button class="imgcomp-btn imgcomp-btn-success imgcomp-btn-sm" data-dl="' + entry.id + '" aria-label="Download compressed ' + esc(entry.file.name) + '">\u2b07 Download</button>' : '') +
          (entry.error ? '<button class="imgcomp-btn imgcomp-btn-accent imgcomp-btn-sm" data-retry="' + entry.id + '" aria-label="Retry ' + esc(entry.file.name) + '">\ud83d\udd04 Retry</button>' : '') +
          '<button class="imgcomp-btn imgcomp-btn-danger imgcomp-btn-sm" data-rm="' + entry.id + '" aria-label="Remove ' + esc(entry.file.name) + '">\u2715</button>' +
        '</div>' +
      '</div>' +

      (!entry.processing && !entry.error ?
      '<div class="imgcomp-controls">' +
        '<div class="imgcomp-control">' +
          '<label class="imgcomp-label" for="q-' + entry.id + '">Quality</label>' +
          '<div class="imgcomp-slider-row">' +
            '<input type="range" class="imgcomp-range" id="q-' + entry.id + '" data-quality="' + entry.id + '" min="1" max="100" value="' + entry.quality + '" aria-valuenow="' + entry.quality + '">' +
            '<span class="imgcomp-range-val">' + entry.quality + '%</span>' +
          '</div>' +
        '</div>' +
        '<div class="imgcomp-control">' +
          '<label class="imgcomp-label" for="fmt-' + entry.id + '">Output Format</label>' +
          '<select class="imgcomp-select" id="fmt-' + entry.id + '" data-format="' + entry.id + '">' +
            '<option value=""' + (!entry.format ? ' selected' : '') + '>Same as original</option>' +
            '<option value="image/jpeg"' + (entry.format === 'image/jpeg' ? ' selected' : '') + '>JPEG</option>' +
            '<option value="image/png"' + (entry.format === 'image/png' ? ' selected' : '') + '>PNG</option>' +
            '<option value="image/webp"' + (entry.format === 'image/webp' ? ' selected' : '') + '>WebP</option>' +
            avifOpt +
          '</select>' +
        '</div>' +
        '<div class="imgcomp-control">' +
          '<label class="imgcomp-label" for="rsz-' + entry.id + '">Resize</label>' +
          '<select class="imgcomp-select" id="rsz-' + entry.id + '" data-resize="' + entry.id + '">' + resizeOpts + '</select>' +
        '</div>' +
        '<div class="imgcomp-control ' + (showCustom ? '' : 'imgcomp-hidden') + '" data-custom-w="' + entry.id + '">' +
          '<label class="imgcomp-label" for="mw-' + entry.id + '">Max Width (px)</label>' +
          '<input type="number" class="imgcomp-input" id="mw-' + entry.id + '" data-maxw="' + entry.id + '" value="' + (entry.maxW || '') + '" placeholder="e.g. 1920" min="1">' +
        '</div>' +
        '<div class="imgcomp-control ' + (showCustom ? '' : 'imgcomp-hidden') + '" data-custom-h="' + entry.id + '">' +
          '<label class="imgcomp-label" for="mh-' + entry.id + '">Max Height (px)</label>' +
          '<input type="number" class="imgcomp-input" id="mh-' + entry.id + '" data-maxh="' + entry.id + '" value="' + (entry.maxH || '') + '" placeholder="e.g. 1080" min="1">' +
        '</div>' +
      '</div>' +

      (entry.compBlob ?
      '<div class="imgcomp-compare-wrap">' +
        '<button class="imgcomp-compare-toggle" data-cmp="' + entry.id + '" aria-expanded="false">\ud83d\udc41 Before / After</button>' +
        '<button class="imgcomp-compare-toggle" data-fullcmp="' + entry.id + '" style="margin-left:0.75rem">\ud83d\udd0d Full-Size Compare</button>' +
        '<div class="imgcomp-compare imgcomp-hidden" id="compare-' + entry.id + '" role="img" aria-label="Comparison of ' + esc(entry.file.name) + '"></div>' +
      '</div>' : '')
      : '');

    bindCardEvents(entry);
  }

  /* ── Card event binding ── */
  function bindCardEvents(entry) {
    var card = $('#card-' + entry.id);
    if (!card) return;

    function on(sel, evt, fn) { var el = card.querySelector(sel); if (el) el.addEventListener(evt, fn); }

    on('[data-dl="' + entry.id + '"]', 'click', function () { downloadSingle(entry); });
    on('[data-rm="' + entry.id + '"]', 'click', function () { removeImage(entry.id); });
    on('[data-retry="' + entry.id + '"]', 'click', function () { enqueue(function () { return loadAndCompress(entry); }); });
    on('[data-cmp="' + entry.id + '"]', 'click', function () { toggleCompare(entry); });
    on('[data-fullcmp="' + entry.id + '"]', 'click', function () { openFullCompare(entry); });

    // Quality slider
    var qSlider = card.querySelector('[data-quality="' + entry.id + '"]');
    if (qSlider) {
      var db = null;
      qSlider.addEventListener('input', function () {
        entry.quality = parseInt(qSlider.value);
        qSlider.setAttribute('aria-valuenow', entry.quality);
        qSlider.nextElementSibling.textContent = entry.quality + '%';
        clearTimeout(db);
        db = setTimeout(function () { enqueue(function () { return compress(entry); }); }, 400);
      });
    }

    // Format
    on('[data-format="' + entry.id + '"]', 'change', function () { entry.format = this.value; enqueue(function () { return compress(entry); }); });

    // Resize preset
    var rszSel = card.querySelector('[data-resize="' + entry.id + '"]');
    if (rszSel) {
      rszSel.addEventListener('change', function () {
        var v = rszSel.value;
        var customW = card.querySelector('[data-custom-w="' + entry.id + '"]');
        var customH = card.querySelector('[data-custom-h="' + entry.id + '"]');
        if (v === 'custom') {
          if (customW) customW.classList.remove('imgcomp-hidden');
          if (customH) customH.classList.remove('imgcomp-hidden');
        } else {
          if (customW) customW.classList.add('imgcomp-hidden');
          if (customH) customH.classList.add('imgcomp-hidden');
          entry.maxW = parseInt(v) || 0;
          entry.maxH = 0;
          enqueue(function () { return compress(entry); });
        }
      });
    }

    // Custom width/height
    ['maxw', 'maxh'].forEach(function (key) {
      var inp = card.querySelector('[data-' + key + '="' + entry.id + '"]');
      if (!inp) return;
      var db2 = null;
      inp.addEventListener('input', function () {
        entry[key === 'maxw' ? 'maxW' : 'maxH'] = parseInt(inp.value) || 0;
        clearTimeout(db2);
        db2 = setTimeout(function () { enqueue(function () { return compress(entry); }); }, 600);
      });
    });
  }

  /* ══════════════════════════════════════════════════════════
     BEFORE / AFTER COMPARISON (shared builder)
     ══════════════════════════════════════════════════════════ */

  function buildCompareSlider(container, origUrl, compUrl, onReady) {
    container.innerHTML = '';

    var afterImg = document.createElement('img');
    afterImg.className = 'imgcomp-compare-img';
    afterImg.src = compUrl;
    afterImg.alt = 'After compression';
    afterImg.draggable = false;

    var overlay = document.createElement('div');
    overlay.className = 'imgcomp-compare-overlay';
    var beforeImg = document.createElement('img');
    beforeImg.src = origUrl;
    beforeImg.alt = 'Before compression';
    beforeImg.draggable = false;
    overlay.appendChild(beforeImg);

    var handle = document.createElement('div');
    handle.className = 'imgcomp-compare-handle';
    handle.setAttribute('role', 'slider');
    handle.setAttribute('aria-label', 'Comparison position');
    handle.setAttribute('aria-valuemin', '0');
    handle.setAttribute('aria-valuemax', '100');
    handle.setAttribute('aria-valuenow', '50');
    handle.setAttribute('tabindex', '0');

    var lbl1 = document.createElement('span');
    lbl1.className = 'imgcomp-compare-label imgcomp-compare-label-before';
    lbl1.textContent = 'Original';
    var lbl2 = document.createElement('span');
    lbl2.className = 'imgcomp-compare-label imgcomp-compare-label-after';
    lbl2.textContent = 'Compressed';

    container.appendChild(afterImg);
    container.appendChild(overlay);
    container.appendChild(handle);
    container.appendChild(lbl1);
    container.appendChild(lbl2);

    var currentRatio = 0.5;

    function setPosition(ratio) {
      ratio = Math.max(0, Math.min(1, ratio));
      currentRatio = ratio;
      var w = container.offsetWidth;
      var x = ratio * w;
      overlay.style.width = x + 'px';
      handle.style.left = (x - 2) + 'px';
      handle.setAttribute('aria-valuenow', Math.round(ratio * 100));
    }

    afterImg.onload = function () {
      var w = container.offsetWidth;
      var h = afterImg.offsetHeight || afterImg.naturalHeight;
      container.style.height = h + 'px';
      beforeImg.style.width = w + 'px';
      beforeImg.style.height = h + 'px';
      afterImg.style.width = w + 'px';
      setPosition(0.5);
      if (onReady) onReady();
    };

    handle.addEventListener('keydown', function (e) {
      var step = e.shiftKey ? 0.1 : 0.02;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); setPosition(currentRatio - step); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); setPosition(currentRatio + step); }
      else if (e.key === 'Home') { e.preventDefault(); setPosition(0); }
      else if (e.key === 'End') { e.preventDefault(); setPosition(1); }
    });

    var dragging = false;
    function onStart(e) { e.preventDefault(); dragging = true; container.style.cursor = 'ew-resize'; }
    function onMove(e) {
      if (!dragging) return;
      var rect = container.getBoundingClientRect();
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      setPosition((clientX - rect.left) / rect.width);
    }
    function onEnd() { dragging = false; container.style.cursor = ''; }

    handle.addEventListener('mousedown', onStart);
    handle.addEventListener('touchstart', onStart, { passive: false });
    container.addEventListener('mousedown', function (e) {
      if (e.target === handle) return;
      var rect = container.getBoundingClientRect();
      setPosition((e.clientX - rect.left) / rect.width);
      onStart(e);
    });
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchend', onEnd);
  }

  function toggleCompare(entry) {
    var wrap = $('#compare-' + entry.id);
    var btn = $('[data-cmp="' + entry.id + '"]');
    if (!wrap) return;

    if (!wrap.classList.contains('imgcomp-hidden')) {
      wrap.classList.add('imgcomp-hidden');
      wrap.innerHTML = '';
      if (btn) btn.setAttribute('aria-expanded', 'false');
      return;
    }

    wrap.classList.remove('imgcomp-hidden');
    if (btn) btn.setAttribute('aria-expanded', 'true');
    buildCompareSlider(wrap, entry.origUrl, entry.compUrl);
  }

  /* ══════════════════════════════════════════════════════════
     FULLSCREEN COMPARE MODAL (zoom support)
     ══════════════════════════════════════════════════════════ */

  var modalZoom = 100;

  function openFullCompare(entry) {
    if (!entry.compUrl || !entry.origUrl) return;
    modal.classList.remove('imgcomp-hidden');
    document.body.style.overflow = 'hidden';
    modalTitle.textContent = entry.file.name + ' \u2014 ' + entry.origW + '\u00d7' + entry.origH;
    modalZoom = 100;
    updateZoomLabel();

    var compareBox = document.createElement('div');
    compareBox.className = 'imgcomp-modal-compare';
    modalBody.innerHTML = '';
    modalBody.appendChild(compareBox);

    buildCompareSlider(compareBox, entry.origUrl, entry.compUrl, function () {
      var img = compareBox.querySelector('.imgcomp-compare-img');
      if (img) {
        var maxW = modalBody.clientWidth - 32;
        var maxH = modalBody.clientHeight - 32;
        var ratio = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
        modalZoom = Math.round(ratio * 100);
        applyZoom(compareBox, img);
      }
    });
  }

  function applyZoom(box, img) {
    if (!box || !img) return;
    var scale = modalZoom / 100;
    var w = img.naturalWidth * scale;
    var h = img.naturalHeight * scale;
    box.style.width = w + 'px';
    box.style.height = h + 'px';
    var afterImgEl = box.querySelector('.imgcomp-compare-img');
    if (afterImgEl) { afterImgEl.style.width = w + 'px'; afterImgEl.style.height = h + 'px'; }
    var overlayImg = box.querySelector('.imgcomp-compare-overlay img');
    if (overlayImg) { overlayImg.style.width = w + 'px'; overlayImg.style.height = h + 'px'; }
    updateZoomLabel();
  }

  function updateZoomLabel() {
    var el = $('#imgcomp-modal-zoom-val');
    if (el) el.textContent = modalZoom + '%';
  }

  function closeModal() {
    modal.classList.add('imgcomp-hidden');
    modalBody.innerHTML = '';
    document.body.style.overflow = '';
  }

  $('#imgcomp-modal-close').addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) { if (e.target === modal || e.target === modalBody) closeModal(); });

  $('#imgcomp-modal-zoom-in').addEventListener('click', function () {
    modalZoom = Math.min(400, modalZoom + 25);
    var box = modalBody.querySelector('.imgcomp-modal-compare');
    var img = box && box.querySelector('.imgcomp-compare-img');
    if (box && img) applyZoom(box, img);
  });

  $('#imgcomp-modal-zoom-out').addEventListener('click', function () {
    modalZoom = Math.max(25, modalZoom - 25);
    var box = modalBody.querySelector('.imgcomp-modal-compare');
    var img = box && box.querySelector('.imgcomp-compare-img');
    if (box && img) applyZoom(box, img);
  });

  document.addEventListener('keydown', function (e) {
    if (!modal.classList.contains('imgcomp-hidden')) {
      if (e.key === 'Escape') closeModal();
      if (e.key === '+' || e.key === '=') { e.preventDefault(); $('#imgcomp-modal-zoom-in').click(); }
      if (e.key === '-' || e.key === '_') { e.preventDefault(); $('#imgcomp-modal-zoom-out').click(); }
    }
  });

  /* ══════════════════════════════════════════════════════════
     SMART PRESETS
     ══════════════════════════════════════════════════════════ */

  $$('.imgcomp-preset-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.dataset.preset;
      var wasActive = btn.classList.contains('active');

      $$('.imgcomp-preset-btn').forEach(function (b) { b.classList.remove('active'); });

      if (wasActive) {
        S.activePreset = null;
      } else {
        btn.classList.add('active');
        S.activePreset = key;
        if (S.images.length > 0) applyPresetToAll(PRESETS[key]);
      }
    });
  });

  async function applyPresetToAll(p) {
    for (var i = 0; i < S.images.length; i++) {
      var entry = S.images[i];
      entry.quality = p.quality;
      entry.format = p.format;
      entry.maxW = p.maxW;
      entry.maxH = p.maxH;
      entry.targetWarning = null;
      await compress(entry);
    }
    toast('Preset applied to ' + S.images.length + ' images', 'success');
  }

  /* ══════════════════════════════════════════════════════════
     BATCH OPERATIONS
     ══════════════════════════════════════════════════════════ */

  function updateUI() {
    batchPanel.classList.toggle('imgcomp-hidden', S.images.length === 0);
    presetsPanel.classList.toggle('imgcomp-hidden', S.images.length === 0);
    updateBatchStats();
  }

  function updateBatchStats() {
    if (!S.images.length) { batchStats.innerHTML = ''; return; }
    var total = S.images.length;
    var done = S.images.filter(function (e) { return e.compBlob && !e.processing; }).length;
    var failed = S.images.filter(function (e) { return e.error; }).length;
    var origTotal = S.images.reduce(function (s, e) { return s + e.file.size; }, 0);
    var compTotal = S.images.reduce(function (s, e) { return s + (e.compBlob ? e.compBlob.size : e.file.size); }, 0);
    var saved = origTotal - compTotal;
    var savePct = pct(compTotal, origTotal);

    var html = '<strong>' + total + ' image' + (total > 1 ? 's' : '') + '</strong>';
    if (done < total) html += ' \u00b7 <span class="imgcomp-processing-inline">' + done + '/' + total + ' processed</span>';
    if (failed) html += ' \u00b7 <span style="color:#f87171">' + failed + ' failed</span>';
    if (done === total && saved > 0) html += ' \u00b7 You saved <strong>' + fmtSize(saved) + '</strong> (' + savePct + '% reduction)';
    else if (done === total) html += ' \u00b7 Total: ' + fmtSize(compTotal);
    batchStats.innerHTML = html;

    // Gate downloads while processing
    var allDone = done + failed >= total;
    dlZipBtn.disabled = !allDone;
    dlAllBtn.disabled = !allDone;
    dlZipBtn.title = allDone ? 'Download all as ZIP' : 'Wait for processing to finish\u2026';
    dlAllBtn.title = allDone ? 'Download all individually' : 'Wait for processing to finish\u2026';
  }

  function removeImage(id) {
    var idx = S.images.findIndex(function (e) { return e.id === id; });
    if (idx === -1) return;
    var entry = S.images[idx];
    if (entry.origUrl) URL.revokeObjectURL(entry.origUrl);
    if (entry.compUrl) URL.revokeObjectURL(entry.compUrl);
    S.images.splice(idx, 1);
    var card = $('#card-' + id);
    if (card) card.remove();
    updateUI();
  }

  clearAllBtn.addEventListener('click', function () {
    if (S.images.length > 3 && !confirm('Remove all images?')) return;
    S.images.forEach(function (e) {
      if (e.origUrl) URL.revokeObjectURL(e.origUrl);
      if (e.compUrl) URL.revokeObjectURL(e.compUrl);
    });
    S.images = [];
    listEl.innerHTML = '';
    updateUI();
  });

  /* ── Downloads ── */
  function downloadSingle(entry) {
    if (!entry.compBlob) return;
    var name = entry.file.name.replace(/\.[^.]+$/, '') + '_compressed' + extFor(outMime(entry));
    var a = document.createElement('a');
    a.href = entry.compUrl;
    a.download = name;
    a.click();
  }

  dlAllBtn.addEventListener('click', function () {
    var count = 0;
    S.images.forEach(function (entry) { if (entry.compBlob) { downloadSingle(entry); count++; } });
    if (count) toast(count + ' file' + (count > 1 ? 's' : '') + ' downloaded', 'success');
  });

  dlZipBtn.addEventListener('click', async function () {
    if (!S.images.some(function (e) { return e.compBlob; })) { toast('No compressed images yet'); return; }
    dlZipBtn.disabled = true;
    dlZipBtn.textContent = '\u23f3 Building ZIP\u2026';

    try {
      await loadJSZip();
      var zip = new JSZip();
      S.images.forEach(function (entry) {
        if (!entry.compBlob) return;
        var name = entry.file.name.replace(/\.[^.]+$/, '') + '_compressed' + extFor(outMime(entry));
        zip.file(name, entry.compBlob);
      });
      var blob = await zip.generateAsync({ type: 'blob' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'compressed-images.zip';
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
      toast('ZIP downloaded!', 'success');
    } catch (err) {
      toast('Failed to create ZIP: ' + err.message);
    } finally {
      dlZipBtn.disabled = false;
      dlZipBtn.textContent = '\u2b07 Download All (ZIP)';
    }
  });

  var jsZipLoaded = false;
  function loadJSZip() {
    if (jsZipLoaded) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/jszip@3/dist/jszip.min.js';
      s.onload = function () { jsZipLoaded = true; resolve(); };
      s.onerror = function () { reject(new Error('Failed to load JSZip')); };
      document.head.appendChild(s);
    });
  }

  /* ══════════════════════════════════════════════════════════
     APPLY TO ALL + RESIZE PRESET
     ══════════════════════════════════════════════════════════ */

  globalQ.addEventListener('input', function () { globalQVal.textContent = globalQ.value + '%'; });

  globalResize.addEventListener('change', function () {
    var v = globalResize.value;
    var customW = $('#imgcomp-custom-resize');
    var customH = $('#imgcomp-custom-resize-h');
    if (v === 'custom') {
      if (customW) customW.classList.remove('imgcomp-hidden');
      if (customH) customH.classList.remove('imgcomp-hidden');
    } else {
      if (customW) customW.classList.add('imgcomp-hidden');
      if (customH) customH.classList.add('imgcomp-hidden');
    }
  });

  applyBtn.addEventListener('click', async function () {
    var q = parseInt(globalQ.value);
    var fmt = globalFmt.value;
    var resizeVal = globalResize.value;
    var maxW = 0, maxH = 0;
    if (resizeVal === 'custom') {
      maxW = parseInt(globalMaxW.value) || 0;
      maxH = parseInt(globalMaxH.value) || 0;
    } else if (resizeVal) {
      maxW = parseInt(resizeVal) || 0;
    }
    var targetKB = parseInt(globalTarget.value) || 0;

    applyBtn.disabled = true;
    applyBtn.textContent = '\u23f3 Processing\u2026';

    for (var i = 0; i < S.images.length; i++) {
      var entry = S.images[i];
      entry.quality = q;
      entry.format = fmt;  // always set — empty string = "same as original"
      entry.maxW = maxW;
      entry.maxH = maxH;
      entry.targetWarning = null;

      if (targetKB > 0) await compressToTarget(entry, targetKB);
      else await compress(entry);
    }

    applyBtn.disabled = false;
    applyBtn.textContent = 'Apply to All';
    toast('Applied to ' + S.images.length + ' images', 'success');
  });

  /* ══════════════════════════════════════════════════════════
     KEYBOARD SUPPORT
     ══════════════════════════════════════════════════════════ */

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.closest('.imgcomp-card') && !e.target.closest('input, select, button')) {
      var card = e.target.closest('.imgcomp-card');
      var id = card.id.replace('card-', '');
      var entry = S.images.find(function (x) { return x.id === id; });
      if (entry && entry.compBlob) downloadSingle(entry);
    }
  });

})();
