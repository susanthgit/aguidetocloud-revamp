/* ═══════════════════════════════════════════════════════
   Mind Maps — D3.js Multi-Layout Renderer
   Adapter pattern: radial cluster, horizontal tree,
   waterfall (vertical tree). Shared pipeline for zoom,
   search, hover, focus, breadcrumbs, exports, deep links.
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var BRAND = 'aguidetocloud.com/mind-maps';

  /* Zen depth colours */
  var DCOL = [
    '#6366F1', /* depth 0 — root */
    '#818CF8', /* depth 1 */
    '#A5B4FC', /* depth 2 */
    '#C7D2FE', /* depth 3 */
    '#DDD6FE'  /* depth 4+ */
  ];
  function dc(d) { return DCOL[Math.min(d, DCOL.length - 1)]; }

  /* Label text colour by depth */
  function textCol(d) {
    return d.depth === 0 ? '#111827' : d.depth === 1 ? '#1F2937' : d.children ? '#374151' : '#6B7280';
  }
  function textWeight(d) { return d.depth <= 1 ? '600' : d.children ? '500' : '400'; }
  function textSize(d) { return d.depth === 0 ? '16px' : d.depth === 1 ? '13px' : d.depth === 2 ? '12px' : '11px'; }

  var state = {
    svg: null, g: null, root: null, allNodes: null, allLinks: null,
    focused: null, width: 0, height: 0, adapter: null, zoomBehavior: null
  };

  /* ═══════════════════════════════════════════════════════
     RENDERER ADAPTERS — geometry contract per layout
     Each adapter returns: { layout, viewBox, nodeTransform,
     linkGen, labelX, labelAnchor, labelRotate, depthGuides,
     focusCoords, initialTransform, heightForContainer,
     badgeDy, badgeAnchor }
     ═══════════════════════════════════════════════════════ */

  var adapters = {};

  /* ── RADIAL CLUSTER ── */
  adapters.radial = function (root) {
    var leaves = root.leaves().length;
    var size = Math.max(1000, Math.min(1600, leaves * 20));
    var w = size, h = size, r = size / 2 - 160;

    d3.cluster().size([360, r])
      .separation(function (a, b) { return a.parent === b.parent ? 1 : 2; })(root);

    return {
      w: w, h: h,
      viewBox: function () { return [-w / 2, -h / 2, w, h].join(' '); },
      svgHeight: function () { return Math.min(h, 900); },

      nodeTransform: function (d) {
        if (d.depth === 0) return 'translate(0,0)';
        return 'rotate(' + (d.x - 90) + ') translate(' + d.y + ',0)';
      },

      linkGen: function () {
        return d3.linkRadial()
          .angle(function (d) { return d.x / 180 * Math.PI; })
          .radius(function (d) { return d.y; });
      },

      labelX: function (d) {
        if (d.depth === 0) return 0;
        return (d.x < 180) === !d.children ? 8 : -8;
      },
      labelAnchor: function (d) {
        if (d.depth === 0) return 'middle';
        return (d.x < 180) === !d.children ? 'start' : 'end';
      },
      labelRotate: function (d) {
        if (d.depth === 0) return null;
        return d.x >= 180 ? 'rotate(180)' : null;
      },

      badgeDy: '-0.6em',
      badgeAnchor: 'middle',

      depthGuides: function (g) {
        var depthR = {};
        root.each(function (n) { if (n.depth > 0) depthR[n.depth] = n.y; });
        var rings = g.append('g').attr('class', 'mm-rings');
        Object.keys(depthR).forEach(function (d) {
          rings.append('circle').attr('cx', 0).attr('cy', 0).attr('r', depthR[d])
            .attr('fill', 'none')
            .attr('stroke', dc(parseInt(d))).attr('stroke-opacity', d == 1 ? 0.12 : 0.06)
            .attr('stroke-width', d == 1 ? 1 : 0.5)
            .attr('stroke-dasharray', d > 1 ? '2,6' : 'none')
            .style('opacity', 0).transition().duration(700).delay(d * 200).style('opacity', 1);
        });
        /* Root glow */
        g.append('circle').attr('cx', 0).attr('cy', 0).attr('r', 30)
          .attr('fill', 'rgba(99,102,241,0.06)').attr('stroke', 'rgba(99,102,241,0.15)').attr('stroke-width', 1)
          .style('opacity', 0).transition().duration(500).style('opacity', 1);
      },

      focusCoords: function (d) {
        var angle = d.x / 180 * Math.PI - Math.PI / 2;
        return { cx: Math.cos(angle) * d.y, cy: Math.sin(angle) * d.y };
      },

      initialTransform: function () {
        return d3.zoomIdentity.scale(1.3);
      },

      heightForContainer: function (cw) {
        return Math.min(h, Math.max(600, cw * 0.8));
      },

      legendPos: function () { return 'translate(' + (-w / 2 + 20) + ',' + (-h / 2 + 20) + ')'; }
    };
  };

  /* ── HORIZONTAL TREE (left → right) ── */
  adapters.horizontal = function (root) {
    var leaves = root.leaves().length;
    var maxDepth = 0;
    root.each(function (n) { if (n.depth > maxDepth) maxDepth = n.depth; });

    /* Generous spacing: 28px per leaf, 220px per depth level, plus margins for labels */
    var nodeSpacing = 28;
    var depthSpacing = 220;
    var labelMargin = 120;
    var h = Math.max(500, leaves * nodeSpacing);
    var w = Math.max(800, maxDepth * depthSpacing + labelMargin * 2);

    d3.tree().size([h, w - labelMargin * 2])
      .separation(function (a, b) { return a.parent === b.parent ? 1 : 1.4; })(root);

    return {
      w: w, h: h,
      viewBox: function () { return [-labelMargin, -40, w, h + 80].join(' '); },
      svgHeight: function () { return Math.min(h + 80, 900); },

      nodeTransform: function (d) {
        return 'translate(' + d.y + ',' + d.x + ')';
      },

      linkGen: function () {
        return d3.linkHorizontal()
          .x(function (d) { return d.y; })
          .y(function (d) { return d.x; });
      },

      labelX: function (d) {
        if (d.depth === 0) return -8;
        return d.children ? -8 : 8;
      },
      labelAnchor: function (d) {
        if (d.depth === 0) return 'end';
        return d.children ? 'end' : 'start';
      },
      labelRotate: function () { return null; },

      badgeDy: '-0.8em',
      badgeAnchor: 'middle',

      depthGuides: function (g) {
        var depthX = {};
        root.each(function (n) { if (n.depth > 0) depthX[n.depth] = n.y; });
        var guides = g.append('g').attr('class', 'mm-guides');
        Object.keys(depthX).forEach(function (d) {
          guides.append('line')
            .attr('x1', depthX[d]).attr('y1', -20)
            .attr('x2', depthX[d]).attr('y2', h + 20)
            .attr('stroke', dc(parseInt(d))).attr('stroke-opacity', d == 1 ? 0.1 : 0.05)
            .attr('stroke-width', 0.5)
            .attr('stroke-dasharray', '4,8')
            .style('opacity', 0).transition().duration(700).delay(d * 200).style('opacity', 1);
        });
      },

      focusCoords: function (d) {
        return { cx: d.y, cy: d.x };
      },

      initialTransform: function () {
        return d3.zoomIdentity.scale(1.1).translate(30, 0);
      },

      heightForContainer: function (cw) {
        return Math.min(h + 80, Math.max(600, cw * 0.55));
      },

      legendPos: function () { return 'translate(' + (-labelMargin + 10) + ',0)'; }
    };
  };

  /* ── WATERFALL / VERTICAL TREE (top → down) ── */
  adapters.waterfall = function (root) {
    var maxDepth = 0;
    root.each(function (n) { if (n.depth > maxDepth) maxDepth = n.depth; });

    /* nodeSize gives tighter control than size — tree grows to fit content */
    var nx = 42;   /* horizontal space between sibling nodes */
    var ny = 160;  /* vertical space between depth levels */

    d3.tree().nodeSize([nx, ny])
      .separation(function (a, b) { return a.parent === b.parent ? 1 : 1.8; })(root);

    /* Calculate actual bounds after layout */
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    root.each(function (n) {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    });

    var pad = 120; /* padding for labels — extra bottom for rotated leaf labels */
    var w = maxX - minX + pad * 2;
    var h = maxY - minY + pad * 2;

    return {
      w: w, h: h,
      viewBox: function () { return [minX - pad, minY - pad, w, h].join(' '); },
      svgHeight: function () { return Math.min(h, 900); },

      nodeTransform: function (d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      },

      linkGen: function () {
        /* Smooth S-curve links for waterfall */
        return function (d) {
          var sx = d.source.x, sy = d.source.y, tx = d.target.x, ty = d.target.y;
          var my = (sy + ty) / 2;
          return 'M' + sx + ',' + sy + 'C' + sx + ',' + my + ' ' + tx + ',' + my + ' ' + tx + ',' + ty;
        };
      },

      labelX: function (d) { return d.children ? 0 : 6; },
      labelAnchor: function (d) { return d.children ? 'middle' : 'start'; },
      labelRotate: function (d) { return !d.children ? 'rotate(35)' : null; },

      /* Labels above branch nodes, below leaf nodes */
      labelDy: function (d) { return d.children ? '-1em' : '0.35em'; },
      badgeDy: '-1.4em',
      badgeAnchor: 'middle',

      depthGuides: function (g) {
        var depthY = {};
        root.each(function (n) { if (n.depth > 0 && !depthY[n.depth]) depthY[n.depth] = n.y; });
        var guides = g.append('g').attr('class', 'mm-guides');
        Object.keys(depthY).forEach(function (d) {
          guides.append('line')
            .attr('x1', minX - pad + 20).attr('y1', depthY[d])
            .attr('x2', maxX + pad - 20).attr('y2', depthY[d])
            .attr('stroke', dc(parseInt(d))).attr('stroke-opacity', d == 1 ? 0.1 : 0.05)
            .attr('stroke-width', 0.5)
            .attr('stroke-dasharray', '4,8')
            .style('opacity', 0).transition().duration(700).delay(d * 200).style('opacity', 1);
        });
      },

      focusCoords: function (d) {
        return { cx: d.x, cy: d.y };
      },

      initialTransform: function () {
        /* Start zoomed to show the top half clearly */
        return d3.zoomIdentity.scale(1.2).translate(0, -40);
      },

      heightForContainer: function (cw) {
        return Math.min(h, Math.max(600, cw * 0.65));
      },

      legendPos: function () { return 'translate(' + (minX - pad + 10) + ',' + (minY - pad + 10) + ')'; }
    };
  };

  /* ═══════ MAIN RENDER PIPELINE ═══════ */
  function render() {
    var dataEl = document.getElementById('mm-data');
    var container = document.getElementById('mm-canvas');
    if (!dataEl || !container) return;

    var data;
    try { data = JSON.parse(dataEl.textContent); }
    catch (e) { container.innerHTML = '<p style="color:#999;text-align:center;padding:60px">Could not load data.</p>'; return; }

    /* Determine renderer — normalise and fallback */
    var rendererName = (container.getAttribute('data-renderer') || 'radial').toLowerCase().trim();
    if (!adapters[rendererName]) rendererName = 'radial';

    var root = d3.hierarchy(data);
    var adapter = adapters[rendererName](root);
    state.adapter = adapter;

    container.innerHTML = '';
    var svg = d3.select(container).append('svg')
      .attr('width', '100%').attr('height', adapter.svgHeight())
      .attr('viewBox', adapter.viewBox())
      .style('font-family', 'Inter, system-ui, sans-serif')
      .style('user-select', 'none');

    var g = svg.append('g');

    /* Single zoom behavior — stored in state for reuse */
    var zoomBehavior = d3.zoom().scaleExtent([0.3, 5])
      .on('zoom', function (ev) { g.attr('transform', ev.transform); });
    svg.call(zoomBehavior);

    state.svg = svg; state.g = g; state.root = root;
    state.width = adapter.w; state.height = adapter.h;
    state.zoomBehavior = zoomBehavior;

    /* ── Depth guides (per adapter) ── */
    adapter.depthGuides(g);

    /* ── Links ── */
    var linkG = g.append('g').attr('fill', 'none').attr('stroke-width', 1);
    linkG.selectAll('path').data(root.links()).join('path')
      .attr('stroke', function (d) { return dc(d.target.depth); })
      .attr('stroke-opacity', 0)
      .attr('d', adapter.linkGen())
      .transition().duration(500).delay(function (d) { return d.target.depth * 120 + 200; })
      .attr('stroke-opacity', 0.3);

    state.allLinks = linkG.selectAll('path');

    /* ── Nodes ── */
    var nodeG = g.append('g');
    nodeG.selectAll('g').data(root.descendants()).join('g')
      .attr('transform', adapter.nodeTransform)
      .style('opacity', 0)
      .transition().duration(400).delay(function (d) { return d.depth * 150 + 300; })
      .style('opacity', 1);

    var nodeAll = nodeG.selectAll('g');
    state.allNodes = nodeAll;

    /* Dots */
    nodeAll.append('circle')
      .attr('r', function (d) { return d.depth === 0 ? 5 : d.children ? 3 : 1.5; })
      .attr('fill', function (d) { return d.depth === 0 ? '#6366F1' : d.children ? dc(d.depth) : '#D1D5DB'; })
      .attr('stroke', function (d) { return d.depth === 0 ? '#4F46E5' : 'none'; })
      .attr('stroke-width', function (d) { return d.depth === 0 ? 2 : 0; });

    /* ── Node count badges on branches ── */
    nodeAll.filter(function (d) { return d.children && d.depth > 0; })
      .append('text')
      .attr('dy', adapter.badgeDy)
      .attr('text-anchor', adapter.badgeAnchor)
      .attr('fill', dc(1)).attr('font-size', '9px').attr('font-weight', '600')
      .text(function (d) { return d.descendants().length - 1; });

    /* ── Text halo ── */
    nodeAll.append('text').attr('class', 'mm-halo')
      .attr('dy', adapter.labelDy ? adapter.labelDy : function () { return '0.32em'; })
      .attr('x', adapter.labelX)
      .attr('text-anchor', adapter.labelAnchor)
      .attr('transform', adapter.labelRotate)
      .attr('fill', 'none').attr('stroke', 'white').attr('stroke-width', 3).attr('stroke-linejoin', 'round')
      .attr('font-size', textSize)
      .text(function (d) { return d.data.name; });

    /* ── Text label ── */
    nodeAll.append('text').attr('class', 'mm-label')
      .attr('dy', adapter.labelDy ? adapter.labelDy : function () { return '0.32em'; })
      .attr('x', adapter.labelX)
      .attr('text-anchor', adapter.labelAnchor)
      .attr('transform', adapter.labelRotate)
      .attr('fill', textCol)
      .attr('font-weight', textWeight)
      .attr('font-size', textSize)
      .text(function (d) { return d.data.name; });

    /* ── Hover: highlight subtree ── */
    nodeAll.style('cursor', function (d) { return d.children ? 'pointer' : 'default'; })
      .on('mouseover', function (ev, d) {
        if (d.depth === 0) return;
        var ids = subtreeIds(d);
        nodeAll.selectAll('.mm-label').transition().duration(150).attr('fill-opacity', function (n) { return ids.has(n.data.id) ? 1 : 0.12; });
        state.allLinks.transition().duration(150)
          .attr('stroke-opacity', function (l) { return ids.has(l.source.data.id) && ids.has(l.target.data.id) ? 0.6 : 0.05; })
          .attr('stroke', function (l) { return ids.has(l.target.data.id) ? '#6366F1' : dc(l.target.depth); });
        nodeAll.selectAll('.mm-label').filter(function (n) { return ids.has(n.data.id); }).attr('fill', '#6366F1');
      })
      .on('mouseout', function () { resetHighlight(); })
      .on('click', function (ev, d) {
        ev.stopPropagation();
        if (d.children && d.depth > 0) focusBranch(d);
      });

    /* Click background to reset focus */
    svg.on('click', function () { if (state.focused) unfocus(); });

    /* ── Legend ── */
    var leg = svg.append('g').attr('transform', adapter.legendPos());
    var legItems = [
      { label: 'Root', r: 5, fill: '#6366F1' },
      { label: 'Category', r: 3, fill: '#818CF8' },
      { label: 'Topic', r: 2.5, fill: '#A5B4FC' },
      { label: 'Detail', r: 1.5, fill: '#D1D5DB' }
    ];
    legItems.forEach(function (item, i) {
      var ly = i * 18;
      leg.append('circle').attr('cx', 6).attr('cy', ly).attr('r', item.r).attr('fill', item.fill);
      leg.append('text').attr('x', 16).attr('y', ly).attr('dy', '0.35em')
        .attr('fill', '#9CA3AF').attr('font-size', '10px').text(item.label);
    });

    /* ── Breadcrumb bar ── */
    var bcBar = document.getElementById('mm-breadcrumb');
    if (!bcBar) {
      bcBar = document.createElement('div');
      bcBar.id = 'mm-breadcrumb';
      bcBar.className = 'mm-breadcrumb';
      bcBar.style.display = 'none';
      container.parentNode.insertBefore(bcBar, container);
    }

    /* ── Search ── */
    var searchEl = document.getElementById('mm-search');
    if (searchEl) {
      searchEl.addEventListener('input', function () {
        var q = this.value.toLowerCase().trim();
        if (!q) { resetHighlight(); return; }
        var matchIds = new Set();
        root.each(function (n) {
          if (n.data.name.toLowerCase().indexOf(q) >= 0) {
            var p = n; while (p) { matchIds.add(p.data.id); p = p.parent; }
          }
        });
        if (matchIds.size === 0) { resetHighlight(); return; }
        nodeAll.selectAll('.mm-label').transition().duration(150)
          .attr('fill-opacity', function (n) { return matchIds.has(n.data.id) ? 1 : 0.1; })
          .attr('fill', function (n) { return matchIds.has(n.data.id) && !n.children ? '#6366F1' : textCol(n); });
        state.allLinks.transition().duration(150)
          .attr('stroke-opacity', function (l) { return matchIds.has(l.target.data.id) ? 0.5 : 0.04; });
      });
    }

    /* ── Deep link ── */
    handleDeepLink();

    /* ── Toolbar ── */
    wireToolbar(svg.node());
    handleResize(container, svg, adapter);

    /* ── Onboarding hint ── */
    var hint = document.querySelector('.mm-hint');
    if (hint) {
      hint.style.display = '';
      var dismissHint = function () {
        hint.classList.add('mm-hint--hidden');
        setTimeout(function () { hint.style.display = 'none'; }, 700);
        svg.node().removeEventListener('wheel', dismissHint);
        svg.node().removeEventListener('mousedown', dismissHint);
        svg.node().removeEventListener('touchstart', dismissHint);
      };
      svg.node().addEventListener('wheel', dismissHint, { once: true });
      svg.node().addEventListener('mousedown', dismissHint, { once: true });
      svg.node().addEventListener('touchstart', dismissHint, { once: true });
      setTimeout(function () { if (hint.style.display !== 'none') dismissHint(); }, 6000);
    }

    /* ── Initial transform (per adapter) ── */
    if (!window.location.hash) {
      var t0 = adapter.initialTransform();
      svg.call(zoomBehavior.transform, t0);
    }
  }

  /* ═══════ SUBTREE HELPERS ═══════ */
  function subtreeIds(d) {
    var ids = new Set();
    function walk(n) { ids.add(n.data.id); if (n.children) n.children.forEach(walk); }
    walk(d);
    var p = d.parent; while (p) { ids.add(p.data.id); p = p.parent; }
    return ids;
  }

  function resetHighlight() {
    if (!state.allNodes || !state.allLinks) return;
    state.allNodes.selectAll('.mm-label').transition().duration(200)
      .attr('fill-opacity', 1)
      .attr('fill', textCol);
    state.allLinks.transition().duration(200)
      .attr('stroke-opacity', 0.3)
      .attr('stroke', function (d) { return dc(d.target.depth); });
  }

  /* ═══════ CLICK-TO-ZOOM ═══════ */
  function focusBranch(d) {
    state.focused = d;
    var ids = subtreeIds(d);
    state.allNodes.transition().duration(400).style('opacity', function (n) { return ids.has(n.data.id) ? 1 : 0.05; });
    state.allLinks.transition().duration(400)
      .attr('stroke-opacity', function (l) { return ids.has(l.source.data.id) && ids.has(l.target.data.id) ? 0.5 : 0.02; });

    /* Zoom to branch — adapter provides coordinates */
    var coords = state.adapter.focusCoords(d);
    state.svg.transition().duration(600)
      .call(state.zoomBehavior.transform,
        d3.zoomIdentity.translate(0, 0).scale(2).translate(-coords.cx, -coords.cy));

    showBreadcrumb(d);
    var path = []; var p = d; while (p && p.depth > 0) { path.unshift(p.data.id); p = p.parent; }
    history.replaceState(null, '', '#' + path.join('/'));
  }

  function unfocus() {
    state.focused = null;
    state.allNodes.transition().duration(400).style('opacity', 1);
    state.allLinks.transition().duration(400).attr('stroke-opacity', 0.3);
    state.svg.transition().duration(600)
      .call(state.zoomBehavior.transform, d3.zoomIdentity);
    hideBreadcrumb();
    history.replaceState(null, '', window.location.pathname);
  }

  /* ═══════ BREADCRUMB ═══════ */
  function showBreadcrumb(d) {
    var bar = document.getElementById('mm-breadcrumb');
    if (!bar) return;
    var trail = []; var p = d; while (p) { trail.unshift(p.data.name); p = p.parent; }
    bar.innerHTML = trail.map(function (t) {
      return '<span class="mm-bc-item">' + t + '</span>';
    }).join('<span class="mm-bc-sep"> → </span>');
    bar.style.display = 'flex';
  }

  function hideBreadcrumb() {
    var bar = document.getElementById('mm-breadcrumb');
    if (bar) { bar.style.display = 'none'; bar.innerHTML = ''; }
  }

  /* ═══════ DEEP LINK ═══════ */
  function handleDeepLink() {
    var hash = window.location.hash.replace('#', '');
    if (!hash) return;
    var parts = hash.split('/');
    var target = null;
    state.root.each(function (n) { if (n.data.id === parts[parts.length - 1] && n.children) target = n; });
    if (target) setTimeout(function () { focusBranch(target); }, 1200);
  }

  /* ═══════ RESPONSIVE — adapter-aware ═══════ */
  function handleResize(container, svg, adapter) {
    var ro = new ResizeObserver(function () {
      var cw = container.offsetWidth;
      if (cw > 0) svg.attr('height', adapter.heightForContainer(cw));
    });
    ro.observe(container);
  }

  /* ═══════ EXPORTS ═══════ */
  function downloadSVG(el) {
    var c = el.cloneNode(true); c.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    var vb = (c.getAttribute('viewBox') || '0 0 900 900').split(' ');
    c.setAttribute('width', Math.abs(parseFloat(vb[2]))); c.setAttribute('height', Math.abs(parseFloat(vb[3])));
    var t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', String(parseFloat(vb[2]) / 2 + parseFloat(vb[0])));
    t.setAttribute('y', String(parseFloat(vb[3]) + parseFloat(vb[1]) - 10));
    t.setAttribute('fill', '#9CA3AF'); t.setAttribute('font-size', '10'); t.setAttribute('text-anchor', 'middle');
    t.setAttribute('font-family', 'Inter, system-ui, sans-serif'); t.textContent = BRAND;
    var gEl = c.querySelector('g'); if (gEl) gEl.appendChild(t);
    dl(new Blob([new XMLSerializer().serializeToString(c)], { type: 'image/svg+xml;charset=utf-8' }), fn() + '.svg');
  }

  function downloadPNG(el) {
    var c = el.cloneNode(true); c.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    var vb = (c.getAttribute('viewBox') || '0 0 900 900').split(' ');
    var w = Math.abs(parseFloat(vb[2])), h = Math.abs(parseFloat(vb[3]));
    c.setAttribute('width', w); c.setAttribute('height', h);
    var s = 2, cv = document.createElement('canvas'); cv.width = w * s; cv.height = h * s;
    var ctx = cv.getContext('2d'); ctx.fillStyle = '#FFF'; ctx.fillRect(0, 0, cv.width, cv.height);
    var img = new Image();
    img.onload = function () {
      ctx.drawImage(img, 0, 0, cv.width, cv.height);
      ctx.fillStyle = '#9CA3AF'; ctx.font = (10 * s) + 'px Inter, sans-serif';
      ctx.textAlign = 'center'; ctx.fillText(BRAND, cv.width / 2, cv.height - 16);
      cv.toBlob(function (b) { if (b) dl(b, fn() + '.png'); }, 'image/png');
    };
    img.onerror = function () { alert('PNG failed — try SVG.'); };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(c));
  }

  function toggleFS() {
    var v = document.getElementById('mm-viewer'); if (!v) return;
    v.classList.toggle('mm-fullscreen');
    var b = document.getElementById('mm-fullscreen');
    if (b) b.textContent = v.classList.contains('mm-fullscreen') ? '✕ Exit' : '⛶ Fullscreen';
  }

  function fn() {
    var el = document.querySelector('.zt-title');
    return ((el ? el.textContent.trim() : 'mindmap') + '-mindmap').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  function dl(blob, name) {
    var u = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = u; a.download = name; document.body.appendChild(a); a.click();
    document.body.removeChild(a); setTimeout(function () { URL.revokeObjectURL(u); }, 5000);
  }

  function wireToolbar(el) {
    var s = document.getElementById('mm-download-svg'), p = document.getElementById('mm-download-png'), f = document.getElementById('mm-fullscreen');
    if (s) s.addEventListener('click', function () { downloadSVG(el); });
    if (p) p.addEventListener('click', function () { downloadPNG(el); });
    if (f) f.addEventListener('click', toggleFS);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (state.focused) { unfocus(); return; }
        var v = document.getElementById('mm-viewer'); if (v && v.classList.contains('mm-fullscreen')) toggleFS();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () { if (document.getElementById('mm-canvas')) render(); });
  window.addEventListener('hashchange', function () { if (state.root) handleDeepLink(); });
})();
