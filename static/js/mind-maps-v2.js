/* ═══════════════════════════════════════════════════════
   Mind Maps v2 — Static Visual Renderer
   Free-form horizontal mind map: root center, branches
   spread left/right, children cascade outward.
   Plus Jakarta Sans + DM Sans · Organic Bezier curves
   Branch-colour palette · Pills, circles, tags
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var BRAND = 'aguidetocloud.com';

  /* ── Universal palette ── */
  var PALETTE = [
    '#6366F1', '#14B8A6', '#F43F5E', '#F59E0B', '#10B981',
    '#8B5CF6', '#F97316', '#06B6D4', '#EC4899', '#84CC16',
    '#F87171', '#0EA5E9'
  ];

  function tint(hex, amount) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    r = Math.round(r + (255 - r) * amount);
    g = Math.round(g + (255 - g) * amount);
    b = Math.round(b + (255 - b) * amount);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  /* ═══════ RENDER ═══════ */
  function render() {
    var dataEl = document.getElementById('mm-data');
    var container = document.getElementById('mm-canvas');
    if (!dataEl || !container) return;

    var data;
    try { data = JSON.parse(dataEl.textContent); }
    catch (e) { container.innerHTML = '<p style="color:#999;text-align:center;padding:60px">Could not load data.</p>'; return; }

    var palette = data.palette || PALETTE;
    var root = d3.hierarchy(data);
    var branches = root.children || [];
    var n = branches.length;

    /* ── Custom mind-map layout ──
       Root at center. Half branches go right, half go left.
       Children extend outward from each branch. */

    var branchH = 90;        /* vertical space per branch */
    var branchGap = 24;      /* extra gap between branches */
    var rootX = 0;
    var rootY = 0;
    var childGap = 190;      /* horizontal distance branch→children */
    var childSpacing = 32;   /* vertical space between children */

    /* Compute root pill width (matches the root rendering math below) */
    var rootTextLenForGap = data.name.length * 10 + 48;
    var rootWForGap = Math.max(180, rootTextLenForGap);

    /* Compute the widest branch pill (matches branch rendering math below) */
    var maxBranchPillW = 100;
    branches.forEach(function (b) {
      var bw = Math.max(100, b.data.name.length * 8 + 28);
      if (bw > maxBranchPillW) maxBranchPillW = bw;
    });

    /* Dynamic levelGap: keep at least 24px breathing room between root edge and nearest branch edge.
       Without this, long titles (large root pill) collide with branches sitting at the default 200px. */
    var levelGap = Math.max(200, rootWForGap / 2 + maxBranchPillW / 2 + 24);

    /* Split branches: first half right, second half left */
    var rightCount = Math.ceil(n / 2);
    var leftCount = n - rightCount;

    /* Calculate total height needed per side */
    function sideHeight(startIdx, count) {
      var h = 0;
      for (var i = startIdx; i < startIdx + count; i++) {
        var ch = branches[i].children ? branches[i].children.length : 0;
        h += Math.max(branchH, ch * childSpacing + 20) + branchGap;
      }
      return h - branchGap;
    }

    var rightH = sideHeight(0, rightCount);
    var leftH = sideHeight(rightCount, leftCount);
    var totalH = Math.max(rightH, leftH);

    /* Position each branch */
    var positions = []; /* { node, x, y, side, color, childPositions[] } */

    function layoutSide(startIdx, count, side) {
      var sH = sideHeight(startIdx, count);
      var yStart = -sH / 2;
      var y = yStart;

      for (var i = startIdx; i < startIdx + count; i++) {
        var branch = branches[i];
        var col = palette[(branch.data.color != null ? branch.data.color : i) % palette.length];
        var kids = branch.children || [];
        var blockH = Math.max(branchH, kids.length * childSpacing + 20);
        var bx = side === 'right' ? levelGap : -levelGap;
        var by = y + blockH / 2;

        var childPos = [];
        var kidsH = kids.length * childSpacing;
        var ky = by - kidsH / 2 + childSpacing / 2;
        for (var j = 0; j < kids.length; j++) {
          var cx = side === 'right' ? bx + childGap : bx - childGap;
          childPos.push({ node: kids[j], x: cx, y: ky, color: col });
          ky += childSpacing;
        }

        positions.push({ node: branch, x: bx, y: by, side: side, color: col, childPositions: childPos });
        y += blockH + branchGap;
      }
    }

    layoutSide(0, rightCount, 'right');
    layoutSide(rightCount, leftCount, 'left');

    /* Calculate viewBox from all positions — include leaf pill + tag extent */
    var allX = [0], allY = [0];
    positions.forEach(function (p) {
      allX.push(p.x);
      allY.push(p.y);
      p.childPositions.forEach(function (c) {
        var textW = c.node.data.name.length * 7 + 20;
        var leafW = Math.max(80, textW);
        var tagExtra = c.node.data.tag ? (c.node.data.tag.length * 6 + 22) : 0;
        if (p.side === 'right') {
          allX.push(c.x + leafW + tagExtra);
        } else {
          allX.push(c.x - leafW - tagExtra);
        }
        allY.push(c.y);
      });
    });
    var minX = Math.min.apply(null, allX) - 40;
    var maxX = Math.max.apply(null, allX) + 40;
    var minY = Math.min.apply(null, allY) - 100;
    var maxY = Math.max.apply(null, allY) + 60;
    var vw = maxX - minX;
    var vh = maxY - minY;

    container.innerHTML = '';
    var svg = d3.select(container).append('svg')
      .attr('width', '100%')
      .attr('height', vh)
      .attr('viewBox', [minX, minY, vw, vh].join(' '))
      .style('font-family', "'Plus Jakarta Sans', 'DM Sans', Inter, sans-serif")
      .style('user-select', 'none');

    var defs = svg.append('defs');
    var filter = defs.append('filter').attr('id', 'mm-shadow').attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
    filter.append('feDropShadow').attr('dx', 0).attr('dy', 1).attr('stdDeviation', 2.5).attr('flood-color', 'rgba(0,0,0,0.06)');

    /* Read category to pick background pattern */
    var category = (container.getAttribute('data-category') || 'general').toLowerCase();

    /* Define category-specific background patterns. Each pattern lives inside <defs>
       so it travels with the SVG when exported as PNG. */
    var patternId = 'mm-bg-' + category;
    if (category === 'licensing') {
      /* Graph paper — warm cream lines, notebook feel */
      var gp = defs.append('pattern').attr('id', patternId)
        .attr('width', 24).attr('height', 24).attr('patternUnits', 'userSpaceOnUse');
      gp.append('path').attr('d', 'M 24 0 L 0 0 L 0 24').attr('fill', 'none')
        .attr('stroke', '#E8DFCD').attr('stroke-width', 0.6);
    } else if (category === 'certifications') {
      /* Isometric diamonds — blueprint feel */
      var iso = defs.append('pattern').attr('id', patternId)
        .attr('width', 28).attr('height', 16).attr('patternUnits', 'userSpaceOnUse');
      iso.append('path').attr('d', 'M 0 8 L 14 0 L 28 8 L 14 16 Z').attr('fill', 'none')
        .attr('stroke', '#D8E0EC').attr('stroke-width', 0.5);
    } else {
      /* Default — dot grid (Copilot + general) */
      var dp = defs.append('pattern').attr('id', patternId)
        .attr('width', 20).attr('height', 20).attr('patternUnits', 'userSpaceOnUse');
      dp.append('circle').attr('cx', 10).attr('cy', 10).attr('r', 0.7).attr('fill', '#D4D4D8');
    }

    var g = svg.append('g');

    /* ── Category-specific canvas background ── */
    g.append('rect')
      .attr('x', minX).attr('y', minY).attr('width', vw).attr('height', vh)
      .attr('fill', 'url(#' + patternId + ')');

    /* ── Heading banner at top (like Merill's title bar) ── */
    var headingY = minY + 20;
    g.append('text')
      .attr('x', 0).attr('y', headingY)
      .attr('text-anchor', 'middle')
      .attr('font-family', "'Plus Jakarta Sans', sans-serif")
      .attr('font-weight', '800').attr('font-size', '28px')
      .attr('fill', '#111827')
      .text(data.name);
    g.append('line')
      .attr('x1', -120).attr('y1', headingY + 14)
      .attr('x2', 120).attr('y2', headingY + 14)
      .attr('stroke', palette[0]).attr('stroke-width', 2.5)
      .attr('stroke-linecap', 'round');

    /* ── Organic Bezier links ── */
    var linkG = g.append('g').attr('fill', 'none').attr('stroke-linecap', 'round');

    /* Root → branch links */
    positions.forEach(function (p) {
      var mx = (rootX + p.x) / 2;
      linkG.append('path')
        .attr('d', 'M' + rootX + ',' + rootY + ' C' + mx + ',' + rootY + ' ' + mx + ',' + p.y + ' ' + p.x + ',' + p.y)
        .attr('stroke', p.color).attr('stroke-opacity', 0.45).attr('stroke-width', 2.5);
    });

    /* Branch → child links — connect to pill edge */
    positions.forEach(function (p) {
      p.childPositions.forEach(function (c) {
        var isLeft = p.side === 'left';
        var leafEndX = isLeft ? c.x : c.x;
        var mx = (p.x + leafEndX) / 2;
        linkG.append('path')
          .attr('d', 'M' + p.x + ',' + p.y + ' C' + mx + ',' + p.y + ' ' + mx + ',' + c.y + ' ' + leafEndX + ',' + c.y)
          .attr('stroke', p.color).attr('stroke-opacity', 0.3).attr('stroke-width', 1.5);
      });
    });

    /* ── Root node — dark slate rounded rectangle, LARGER ── */
    var rootG = g.append('g').attr('transform', 'translate(' + rootX + ',' + rootY + ')');
    var rootTextLen = data.name.length * 10 + 48;
    var rootW = Math.max(180, rootTextLen);
    var rootH = 50;
    rootG.append('rect')
      .attr('x', -rootW / 2).attr('y', -rootH / 2)
      .attr('width', rootW).attr('height', rootH)
      .attr('rx', 16).attr('ry', 16)
      .attr('fill', '#1E293B')
      .attr('filter', 'url(#mm-shadow)');
    rootG.append('text')
      .attr('text-anchor', 'middle').attr('dy', '0.35em')
      .attr('font-family', "'Plus Jakarta Sans', sans-serif")
      .attr('font-weight', '700').attr('font-size', '16px')
      .attr('fill', '#FFFFFF')
      .text(data.name);

    /* ── Branch pills — vibrant solid fill, white text + count badge ── */
    positions.forEach(function (p) {
      var bG = g.append('g').attr('transform', 'translate(' + p.x + ',' + p.y + ')');
      var textLen = p.node.data.name.length * 8 + 28;
      var pillW = Math.max(100, textLen);
      var pillH = 32;
      var kidCount = p.childPositions.length;

      bG.append('rect')
        .attr('x', -pillW / 2).attr('y', -pillH / 2)
        .attr('width', pillW).attr('height', pillH)
        .attr('rx', pillH / 2).attr('ry', pillH / 2)
        .attr('fill', p.color)
        .attr('filter', 'url(#mm-shadow)');

      bG.append('text')
        .attr('text-anchor', 'middle').attr('dy', '0.35em')
        .attr('font-family', "'Plus Jakarta Sans', sans-serif")
        .attr('font-weight', '600').attr('font-size', '13px')
        .attr('fill', '#FFFFFF')
        .text(p.node.data.name);
    });

    /* ── Leaf nodes — small rounded pills with coloured dot + optional tag ── */
    positions.forEach(function (p) {
      p.childPositions.forEach(function (c) {
        var cG = g.append('g').attr('transform', 'translate(' + c.x + ',' + c.y + ')');
        var isLeft = p.side === 'left';
        var text = c.node.data.name;
        var tag = c.node.data.tag || null;
        var textW = text.length * 7 + 20;
        var leafW = Math.max(80, textW);
        var leafH = 24;

        /* Pill positioned to the outside of the branch */
        var px = isLeft ? -leafW : 0;

        /* Leaf pill — light tinted fill with coloured border */
        cG.append('rect')
          .attr('x', px).attr('y', -leafH / 2)
          .attr('width', leafW).attr('height', leafH)
          .attr('rx', leafH / 2).attr('ry', leafH / 2)
          .attr('fill', tint(p.color, 0.88))
          .attr('stroke', p.color).attr('stroke-width', 0.8).attr('stroke-opacity', 0.4);

        /* Coloured dot at the connecting edge */
        cG.append('circle')
          .attr('cx', 0).attr('cy', 0).attr('r', 3.5)
          .attr('fill', p.color);

        /* Text label — dark, inside the pill */
        var textX = isLeft ? -leafW / 2 : leafW / 2;
        cG.append('text')
          .attr('x', textX).attr('dy', '0.35em')
          .attr('text-anchor', 'middle')
          .attr('font-family', "'DM Sans', sans-serif")
          .attr('font-weight', '500').attr('font-size', '11px')
          .attr('fill', '#1F2937')
          .text(text);

        /* Tag badge — small coloured pill after the leaf */
        if (tag) {
          var tagW = tag.length * 6 + 14;
          var tagH = 16;
          var tagX = isLeft ? px - tagW - 6 : px + leafW + 6;
          var tagY = -tagH / 2;

          cG.append('rect')
            .attr('x', tagX).attr('y', tagY)
            .attr('width', tagW).attr('height', tagH)
            .attr('rx', tagH / 2).attr('ry', tagH / 2)
            .attr('fill', p.color);

          cG.append('text')
            .attr('x', tagX + tagW / 2).attr('y', 0).attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .attr('font-family', "'DM Sans', sans-serif")
            .attr('font-weight', '600').attr('font-size', '8px')
            .attr('fill', '#FFFFFF')
            .attr('text-transform', 'uppercase')
            .text(tag);
        }
      });
    });

    /* ── Branded footer — drives traffic when shared ── */
    var footerY = maxY - 16;
    var footerG = g.append('g');

    /* Divider line */
    footerG.append('line')
      .attr('x1', minX + 40).attr('y1', footerY - 8)
      .attr('x2', maxX - 40).attr('y2', footerY - 8)
      .attr('stroke', '#E5E7EB').attr('stroke-width', 0.5);

    /* Brand URL — left */
    footerG.append('text')
      .attr('x', minX + 40).attr('y', footerY + 6)
      .attr('text-anchor', 'start')
      .attr('font-family', "'DM Sans', sans-serif")
      .attr('font-size', '10px').attr('font-weight', '500')
      .attr('fill', '#9CA3AF')
      .text('aguidetocloud.com/mind-maps');

    /* Last updated date — right */
    var dateEl = document.querySelector('meta[property="article:modified_time"]');
    var lastmod = dateEl ? new Date(dateEl.content).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '';
    if (lastmod) {
      footerG.append('text')
        .attr('x', maxX - 40).attr('y', footerY + 6)
        .attr('text-anchor', 'end')
        .attr('font-family', "'DM Sans', sans-serif")
        .attr('font-size', '10px').attr('fill', '#9CA3AF')
        .text('Updated ' + lastmod);
    }

    wireDownload(svg.node());
  }

  /* ═══════ DOWNLOAD ═══════ */
  function wireDownload(svgEl) {
    var btn = document.getElementById('mm-download-png');
    if (btn) btn.addEventListener('click', function () { downloadPNG(svgEl); });
  }

  function downloadPNG(el) {
    var c = el.cloneNode(true);
    c.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    var vb = (c.getAttribute('viewBox') || '0 0 900 900').split(' ');
    var w = Math.abs(parseFloat(vb[2])), h = Math.abs(parseFloat(vb[3]));
    c.setAttribute('width', w); c.setAttribute('height', h);

    /* Embed fonts inline for export */
    var style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = "@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');";
    c.insertBefore(style, c.firstChild);

    /* 3x resolution for retina/print quality */
    var scale = 3;
    var pad = 40 * scale;
    var canvas = document.createElement('canvas');
    canvas.width = w * scale + pad * 2;
    canvas.height = h * scale + pad * 2;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var img = new Image();
    img.onload = function () {
      ctx.drawImage(img, pad, pad, w * scale, h * scale);
      canvas.toBlob(function (b) {
        if (b) {
          var fnEl = document.querySelector('.zt-title');
          var name = ((fnEl ? fnEl.textContent.trim() : 'mindmap') + '-mindmap').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          var u = URL.createObjectURL(b), a = document.createElement('a');
          a.href = u; a.download = name + '.png';
          document.body.appendChild(a); a.click();
          document.body.removeChild(a);
          setTimeout(function () { URL.revokeObjectURL(u); }, 5000);
        }
      }, 'image/png');
    };
    img.onerror = function () { alert('PNG export failed. Try right-clicking the map and "Save Image As".'); };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(c));
  }

  /* ═══════ LIGHTBOX ═══════ */
  function initLightbox() {
    var viewer = document.getElementById('mm-viewer');
    var closeBtn = document.getElementById('mm-close');
    if (!viewer) return;

    /* Expand to fullscreen */
    viewer.addEventListener('click', function (e) {
      if (e.target.closest('#mm-close') || e.target.closest('#mm-download-png')) return;
      if (!viewer.classList.contains('mm-expanded')) {
        viewer.classList.add('mm-expanded');
        document.body.style.overflow = 'hidden';
      }
    });

    /* Close button */
    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        viewer.classList.remove('mm-expanded');
        document.body.style.overflow = '';
      });
    }

    /* Escape key */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && viewer.classList.contains('mm-expanded')) {
        viewer.classList.remove('mm-expanded');
        document.body.style.overflow = '';
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('mm-canvas')) render();
    initLightbox();
  });
})();
