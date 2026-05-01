/* ══════════════════════════════════════════════════════════
   Colour Palette Generator — color-palette.js
   100% client-side, zero API calls, zero dependencies
   ══════════════════════════════════════════════════════════ */
'use strict';
(function() {

/* ── XSS helper ── */
const esc = s => { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; };

/* ══════════════════════════════════════════════════════════
   COLOUR UTILITIES
   ══════════════════════════════════════════════════════════ */

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  const n = parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(c => Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, '0')).join('').toUpperCase();
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1/6) return p + (q - p) * 6 * t; if (t < 1/2) return q; if (t < 2/3) return p + (q - p) * (2/3 - t) * 6; return p; };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function randomHsl() {
  return [Math.floor(Math.random() * 360), 50 + Math.floor(Math.random() * 40), 35 + Math.floor(Math.random() * 35)];
}

function randomHex() {
  const [h, s, l] = randomHsl();
  const [r, g, b] = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

/* Perceived brightness for text contrast */
function luminance(r, g, b) {
  const a = [r, g, b].map(c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function contrastRatio(hex1, hex2) {
  const l1 = luminance(...hexToRgb(hex1));
  const l2 = luminance(...hexToRgb(hex2));
  const lighter = Math.max(l1, l2), darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function textColorFor(hex) {
  const [r, g, b] = hexToRgb(hex);
  return luminance(r, g, b) > 0.35 ? '#000000' : '#FFFFFF';
}

/* ══════════════════════════════════════════════════════════
   COLOUR NAMING (~150 named colours)
   ══════════════════════════════════════════════════════════ */

const NAMED_COLORS = [
  ['#FF0000','Red'],['#DC143C','Crimson'],['#B22222','Firebrick'],['#8B0000','Dark Red'],
  ['#FF6347','Tomato'],['#FF4500','Orange Red'],['#FF7F50','Coral'],['#FF8C00','Dark Orange'],
  ['#FFA500','Orange'],['#FFD700','Gold'],['#FFFF00','Yellow'],['#FFFFE0','Light Yellow'],
  ['#FFFACD','Lemon Chiffon'],['#F0E68C','Khaki'],['#BDB76B','Dark Khaki'],
  ['#ADFF2F','Green Yellow'],['#7FFF00','Chartreuse'],['#7CFC00','Lawn Green'],
  ['#00FF00','Lime'],['#32CD32','Lime Green'],['#90EE90','Light Green'],
  ['#98FB98','Pale Green'],['#00FA9A','Medium Spring'],['#00FF7F','Spring Green'],
  ['#3CB371','Medium Sea Green'],['#2E8B57','Sea Green'],['#228B22','Forest Green'],
  ['#008000','Green'],['#006400','Dark Green'],['#9ACD32','Yellow Green'],
  ['#6B8E23','Olive Drab'],['#808000','Olive'],['#556B2F','Dark Olive'],
  ['#66CDAA','Medium Aquamarine'],['#8FBC8F','Dark Sea Green'],['#20B2AA','Light Sea Green'],
  ['#008B8B','Dark Cyan'],['#008080','Teal'],['#00FFFF','Cyan'],['#00CED1','Dark Turquoise'],
  ['#40E0D0','Turquoise'],['#48D1CC','Medium Turquoise'],['#AFEEEE','Pale Turquoise'],
  ['#7FFFD4','Aquamarine'],['#B0E0E6','Powder Blue'],['#5F9EA0','Cadet Blue'],
  ['#4682B4','Steel Blue'],['#6495ED','Cornflower Blue'],['#00BFFF','Deep Sky Blue'],
  ['#1E90FF','Dodger Blue'],['#ADD8E6','Light Blue'],['#87CEEB','Sky Blue'],
  ['#87CEFA','Light Sky Blue'],['#191970','Midnight Blue'],['#000080','Navy'],
  ['#00008B','Dark Blue'],['#0000CD','Medium Blue'],['#0000FF','Blue'],
  ['#4169E1','Royal Blue'],['#8A2BE2','Blue Violet'],['#4B0082','Indigo'],
  ['#483D8B','Dark Slate Blue'],['#6A5ACD','Slate Blue'],['#7B68EE','Medium Slate Blue'],
  ['#9370DB','Medium Purple'],['#9400D3','Dark Violet'],['#9932CC','Dark Orchid'],
  ['#BA55D3','Medium Orchid'],['#800080','Purple'],['#FF00FF','Magenta'],
  ['#FF69B4','Hot Pink'],['#FF1493','Deep Pink'],['#C71585','Medium Violet Red'],
  ['#DB7093','Pale Violet Red'],['#FFC0CB','Pink'],['#FFB6C1','Light Pink'],
  ['#FFF0F5','Lavender Blush'],['#E6E6FA','Lavender'],['#DDA0DD','Plum'],
  ['#EE82EE','Violet'],['#DA70D6','Orchid'],['#D8BFD8','Thistle'],
  ['#FAEBD7','Antique White'],['#FFE4C4','Bisque'],['#FFDEAD','Navajo White'],
  ['#F5DEB3','Wheat'],['#DEB887','Burlywood'],['#D2B48C','Tan'],
  ['#BC8F8F','Rosy Brown'],['#F4A460','Sandy Brown'],['#DAA520','Goldenrod'],
  ['#B8860B','Dark Goldenrod'],['#CD853F','Peru'],['#D2691E','Chocolate'],
  ['#8B4513','Saddle Brown'],['#A0522D','Sienna'],['#A52A2A','Brown'],
  ['#800000','Maroon'],['#FFFFFF','White'],['#FFFAFA','Snow'],['#F0FFF0','Honeydew'],
  ['#F5FFFA','Mint Cream'],['#F0FFFF','Azure'],['#F0F8FF','Alice Blue'],
  ['#F8F8FF','Ghost White'],['#FFF5EE','Seashell'],['#F5F5DC','Beige'],
  ['#FDF5E6','Old Lace'],['#FFFFF0','Ivory'],['#FAF0E6','Linen'],
  ['#DCDCDC','Gainsboro'],['#D3D3D3','Light Grey'],['#C0C0C0','Silver'],
  ['#A9A9A9','Dark Grey'],['#808080','Grey'],['#696969','Dim Grey'],
  ['#778899','Light Slate Grey'],['#708090','Slate Grey'],['#2F4F4F','Dark Slate Grey'],
  ['#000000','Black'],
  ['#F472B6','Hot Pink'],['#EC4899','Pink'],['#A78BFA','Violet'],
  ['#818CF8','Indigo'],['#60A5FA','Blue'],['#34D399','Emerald'],
  ['#FBBF24','Amber'],['#FB923C','Orange'],['#F87171','Rose'],
  ['#E879F9','Fuchsia'],['#C084FC','Purple'],['#22D3EE','Cyan'],
  ['#2DD4BF','Teal'],['#4ADE80','Green'],['#FDE047','Yellow'],
  ['#FB7185','Light Rose'],['#38BDF8','Sky'],['#A3E635','Lime'],
  ['#14B8A6','Teal Green'],['#F97316','Dark Orange'],
  ['#6366F1','Indigo Blue'],['#8B5CF6','Violet Purple'],['#D946EF','Magenta Pink'],
  ['#0EA5E9','Ocean Blue'],['#10B981','Emerald Green'],['#EF4444','Red'],
  ['#84CC16','Lime Green'],['#06B6D4','Cyan Blue'],['#7C3AED','Deep Purple'],
  ['#DC2626','Crimson Red'],['#059669','Green Teal'],['#D97706','Amber Dark'],
  ['#BE185D','Ruby'],['#9333EA','Grape'],['#2563EB','Royal Blue'],
  ['#16A34A','Forest'],['#CA8A04','Old Gold'],['#E11D48','Raspberry'],
  ['#7E22CE','Plum Purple'],['#0D9488','Pine Green'],
];

function nearestColorName(hex) {
  const [r1, g1, b1] = hexToRgb(hex);
  let best = 'Unknown', bestDist = Infinity;
  for (const [h, name] of NAMED_COLORS) {
    const [r2, g2, b2] = hexToRgb(h);
    const d = (r1-r2)**2 + (g1-g2)**2 + (b1-b2)**2;
    if (d < bestDist) { bestDist = d; best = name; }
  }
  return best;
}

/* ══════════════════════════════════════════════════════════
   COLOUR HARMONY GENERATION
   ══════════════════════════════════════════════════════════ */

function generateHarmony(mode, count, lockMap) {
  const colors = new Array(count);
  const baseH = Math.floor(Math.random() * 360);
  const baseS = 55 + Math.floor(Math.random() * 30);
  const baseL = 40 + Math.floor(Math.random() * 25);

  const make = (h, s, l) => rgbToHex(...hslToRgb(((h % 360) + 360) % 360, Math.max(10, Math.min(95, s)), Math.max(15, Math.min(85, l))));

  if (mode === 'random') {
    for (let i = 0; i < count; i++) {
      if (!lockMap[i]) colors[i] = randomHex();
    }
  } else if (mode === 'complementary') {
    const hues = [baseH, (baseH + 180) % 360];
    for (let i = 0; i < count; i++) {
      if (!lockMap[i]) {
        const h = hues[i % 2];
        const sVar = baseS + (Math.random() * 20 - 10);
        const lVar = baseL + (i * 8 - count * 4);
        colors[i] = make(h, sVar, lVar);
      }
    }
  } else if (mode === 'analogous') {
    for (let i = 0; i < count; i++) {
      if (!lockMap[i]) {
        const h = baseH + (i - Math.floor(count / 2)) * 25;
        colors[i] = make(h, baseS, baseL + (i * 6 - count * 3));
      }
    }
  } else if (mode === 'triadic') {
    const hues = [baseH, (baseH + 120) % 360, (baseH + 240) % 360];
    for (let i = 0; i < count; i++) {
      if (!lockMap[i]) {
        const h = hues[i % 3];
        colors[i] = make(h, baseS + (Math.random() * 15 - 7), baseL + (i * 6 - count * 3));
      }
    }
  } else if (mode === 'split') {
    const hues = [baseH, (baseH + 150) % 360, (baseH + 210) % 360];
    for (let i = 0; i < count; i++) {
      if (!lockMap[i]) {
        const h = hues[i % 3];
        colors[i] = make(h, baseS, baseL + (i * 7 - count * 3));
      }
    }
  } else if (mode === 'monochromatic') {
    for (let i = 0; i < count; i++) {
      if (!lockMap[i]) {
        const l = 25 + (i / (count - 1 || 1)) * 50;
        const s = baseS + (Math.random() * 10 - 5);
        colors[i] = make(baseH, s, l);
      }
    }
  } else if (mode === 'tetradic') {
    const hues = [baseH, (baseH + 90) % 360, (baseH + 180) % 360, (baseH + 270) % 360];
    for (let i = 0; i < count; i++) {
      if (!lockMap[i]) {
        const h = hues[i % 4];
        colors[i] = make(h, baseS, baseL + (i * 5 - count * 2));
      }
    }
  }

  return colors;
}

/* ══════════════════════════════════════════════════════════
   MEDIAN CUT COLOUR QUANTISATION (Image extraction)
   ══════════════════════════════════════════════════════════ */

function extractColors(imageData, numColors) {
  const pixels = [];
  const d = imageData.data;
  const step = Math.max(1, Math.floor(d.length / 4 / 10000));
  for (let i = 0; i < d.length; i += 4 * step) {
    const r = d[i], g = d[i+1], b = d[i+2], a = d[i+3];
    if (a < 128) continue;
    pixels.push([r, g, b]);
  }
  if (pixels.length === 0) return ['#000000'];

  function getRange(bucket, ch) {
    let min = 255, max = 0;
    for (const px of bucket) { if (px[ch] < min) min = px[ch]; if (px[ch] > max) max = px[ch]; }
    return max - min;
  }

  function medianCut(bucket, depth) {
    if (depth === 0 || bucket.length === 0) {
      if (bucket.length === 0) return [];
      let rSum = 0, gSum = 0, bSum = 0;
      for (const px of bucket) { rSum += px[0]; gSum += px[1]; bSum += px[2]; }
      const n = bucket.length;
      return [{ hex: rgbToHex(Math.round(rSum/n), Math.round(gSum/n), Math.round(bSum/n)), pop: n }];
    }
    const rRange = getRange(bucket, 0);
    const gRange = getRange(bucket, 1);
    const bRange = getRange(bucket, 2);
    let ch = 0;
    if (gRange >= rRange && gRange >= bRange) ch = 1;
    else if (bRange >= rRange && bRange >= gRange) ch = 2;
    bucket.sort((a, b) => a[ch] - b[ch]);
    const mid = Math.floor(bucket.length / 2);
    return [...medianCut(bucket.slice(0, mid), depth - 1), ...medianCut(bucket.slice(mid), depth - 1)];
  }

  const depth = Math.ceil(Math.log2(Math.max(numColors, 2)));
  let results = medianCut(pixels, depth);
  /* Sort by population (most dominant first) and deduplicate */
  results.sort((a, b) => b.pop - a.pop);
  const seen = new Set();
  const unique = [];
  for (const r of results) {
    if (!seen.has(r.hex)) { seen.add(r.hex); unique.push(r.hex); }
    if (unique.length >= numColors) break;
  }
  return unique.length > 0 ? unique : ['#000000'];
}

/* ══════════════════════════════════════════════════════════
   COLOUR BLINDNESS SIMULATION (Brettel/Viénot/Mollon)
   ══════════════════════════════════════════════════════════ */

const CB_MATRICES = {
  protanopia: [0.567,0.433,0,0.558,0.442,0,0,0.242,0.758],
  deuteranopia: [0.625,0.375,0,0.7,0.3,0,0,0.3,0.7],
  tritanopia: [0.95,0.05,0,0,0.433,0.567,0,0.475,0.525],
  achromatopsia: [0.299,0.587,0.114,0.299,0.587,0.114,0.299,0.587,0.114],
};

function simulateColorBlindness(hex, type) {
  if (type === 'normal') return hex;
  const [r, g, b] = hexToRgb(hex);
  const m = CB_MATRICES[type];
  if (!m) return hex;
  const nr = Math.round(m[0]*r + m[1]*g + m[2]*b);
  const ng = Math.round(m[3]*r + m[4]*g + m[5]*b);
  const nb = Math.round(m[6]*r + m[7]*g + m[8]*b);
  return rgbToHex(nr, ng, nb);
}

function colorDistance(hex1, hex2) {
  const [r1,g1,b1] = hexToRgb(hex1);
  const [r2,g2,b2] = hexToRgb(hex2);
  return Math.sqrt((r1-r2)**2 + (g1-g2)**2 + (b1-b2)**2);
}

/* ══════════════════════════════════════════════════════════
   CURATED PALETTES
   ══════════════════════════════════════════════════════════ */

const CURATED = [
  { name:'Forest Dawn', cat:'nature', colors:['#2D5016','#4A7C28','#8DB255','#C9E4A0','#F4F9EC'] },
  { name:'Emerald Garden', cat:'nature', colors:['#064E3B','#059669','#34D399','#6EE7B7','#D1FAE5'] },
  { name:'Autumn Leaves', cat:'nature', colors:['#7C2D12','#B45309','#D97706','#F59E0B','#FDE68A'] },
  { name:'Deep Forest', cat:'nature', colors:['#1A2E05','#2E4A0E','#3F6212','#65A30D','#A3E635'] },
  { name:'Wildflower', cat:'nature', colors:['#831843','#BE185D','#DB2777','#F472B6','#FBCFE8'] },
  { name:'Burning Sky', cat:'sunset', colors:['#7C2D12','#C2410C','#EA580C','#FB923C','#FED7AA'] },
  { name:'Golden Hour', cat:'sunset', colors:['#92400E','#B45309','#F59E0B','#FBBF24','#FEF3C7'] },
  { name:'Coral Dusk', cat:'sunset', colors:['#9F1239','#E11D48','#FB7185','#FDA4AF','#FFF1F2'] },
  { name:'Lavender Sunset', cat:'sunset', colors:['#581C87','#7E22CE','#A855F7','#D8B4FE','#F3E8FF'] },
  { name:'Tropical Sunset', cat:'sunset', colors:['#831843','#DB2777','#F97316','#FBBF24','#FDE047'] },
  { name:'Deep Ocean', cat:'ocean', colors:['#0C4A6E','#0369A1','#0EA5E9','#7DD3FC','#E0F2FE'] },
  { name:'Coral Reef', cat:'ocean', colors:['#164E63','#0891B2','#22D3EE','#67E8F9','#CFFAFE'] },
  { name:'Midnight Sea', cat:'ocean', colors:['#0F172A','#1E293B','#334155','#64748B','#94A3B8'] },
  { name:'Tidal Wave', cat:'ocean', colors:['#042F2E','#0D9488','#2DD4BF','#5EEAD4','#CCFBF1'] },
  { name:'Arctic Ice', cat:'ocean', colors:['#0C4A6E','#0284C7','#38BDF8','#BAE6FD','#F0F9FF'] },
  { name:'Electric Night', cat:'neon', colors:['#7C3AED','#A855F7','#D946EF','#F472B6','#FB923C'] },
  { name:'Cyberpunk', cat:'neon', colors:['#0F172A','#6366F1','#EC4899','#14B8A6','#FACC15'] },
  { name:'Neon Glow', cat:'neon', colors:['#BE123C','#E11D48','#F43F5E','#FF6B9D','#FF9EC6'] },
  { name:'Synthwave', cat:'neon', colors:['#1E1B4B','#4338CA','#7C3AED','#C026D3','#F472B6'] },
  { name:'Laser Grid', cat:'neon', colors:['#020617','#7C3AED','#06B6D4','#22C55E','#EAB308'] },
  { name:'Cotton Candy', cat:'pastel', colors:['#FDE2E4','#FAD2E1','#E2ECE9','#BEE1E6','#DFD8E8'] },
  { name:'Spring Bloom', cat:'pastel', colors:['#FECDD3','#FED7AA','#FDE68A','#BBF7D0','#BFDBFE'] },
  { name:'Soft Dreams', cat:'pastel', colors:['#F5D0FE','#E9D5FF','#C4B5FD','#A5B4FC','#BAE6FD'] },
  { name:'Baby Shower', cat:'pastel', colors:['#FFF1F2','#FFE4E6','#FBCFE8','#F5D0FE','#E9D5FF'] },
  { name:'Ice Cream', cat:'pastel', colors:['#FECACA','#FED7AA','#FEF08A','#BBF7D0','#BFDBFE'] },
  { name:'Vintage Tape', cat:'retro', colors:['#B91C1C','#EA580C','#CA8A04','#15803D','#1D4ED8'] },
  { name:'70s Groove', cat:'retro', colors:['#92400E','#B45309','#CA8A04','#A16207','#713F12'] },
  { name:'Arcade', cat:'retro', colors:['#7F1D1D','#1E3A5F','#065F46','#6B21A8','#C2410C'] },
  { name:'Film Noir', cat:'retro', colors:['#1C1917','#292524','#44403C','#78716C','#D6D3D1'] },
  { name:'Polaroid', cat:'retro', colors:['#FFFBEB','#FDE68A','#F59E0B','#78350F','#1C1917'] },
  { name:'Corporate Blue', cat:'corporate', colors:['#1E3A5F','#2563EB','#3B82F6','#93C5FD','#DBEAFE'] },
  { name:'Professional', cat:'corporate', colors:['#111827','#374151','#6B7280','#9CA3AF','#F3F4F6'] },
  { name:'Trust', cat:'corporate', colors:['#0C4A6E','#0369A1','#0EA5E9','#38BDF8','#E0F2FE'] },
  { name:'Enterprise', cat:'corporate', colors:['#1E293B','#334155','#475569','#94A3B8','#F1F5F9'] },
  { name:'Executive', cat:'corporate', colors:['#0F172A','#1E40AF','#3B82F6','#BFDBFE','#F8FAFC'] },
  { name:'Dark Slate', cat:'dark', colors:['#0F0F1A','#1A1A2E','#252547','#373766','#4A4A8A'] },
  { name:'Midnight', cat:'dark', colors:['#020617','#0F172A','#1E293B','#334155','#475569'] },
  { name:'Dark Rose', cat:'dark', colors:['#1A0A0E','#3D0F1F','#6D1A36','#A12350','#D53F6F'] },
  { name:'Obsidian', cat:'dark', colors:['#09090B','#18181B','#27272A','#3F3F46','#52525B'] },
  { name:'Deep Space', cat:'dark', colors:['#020617','#0C0A3E','#1B0F6E','#371BB3','#5B3FDB'] },
  { name:'Terracotta', cat:'warm', colors:['#7C2D12','#9A3412','#C2410C','#EA580C','#FDBA74'] },
  { name:'Cinnamon', cat:'warm', colors:['#451A03','#78350F','#92400E','#B45309','#D97706'] },
  { name:'Warm Sunset', cat:'warm', colors:['#881337','#BE123C','#E11D48','#F43F5E','#FDA4AF'] },
  { name:'Campfire', cat:'warm', colors:['#431407','#7C2D12','#C2410C','#F97316','#FED7AA'] },
  { name:'Spice Market', cat:'warm', colors:['#78350F','#B45309','#D97706','#EAB308','#A16207'] },
  { name:'Glacier', cat:'cool', colors:['#0C4A6E','#0284C7','#38BDF8','#7DD3FC','#E0F2FE'] },
  { name:'Mint Fresh', cat:'cool', colors:['#064E3B','#059669','#10B981','#6EE7B7','#D1FAE5'] },
  { name:'Steel', cat:'cool', colors:['#1E293B','#334155','#475569','#64748B','#94A3B8'] },
  { name:'Winter Sky', cat:'cool', colors:['#1E1B4B','#312E81','#4338CA','#6366F1','#A5B4FC'] },
  { name:'Frost', cat:'cool', colors:['#083344','#155E75','#0891B2','#22D3EE','#A5F3FC'] },
  { name:'Teams Blue', cat:'teams', colors:['#464EB8','#6264A7','#8B8CC7','#BDBDE6','#E8E8F4'] },
  { name:'Teams Dark', cat:'teams', colors:['#1B1A2E','#2B2B40','#464EB8','#7B83EB','#C5C7F2'] },
  { name:'Teams Warm', cat:'teams', colors:['#6264A7','#E74856','#FF8C00','#FFC300','#92C353'] },
  { name:'SharePoint Teal', cat:'corporate', colors:['#038387','#00B7C3','#30E5D0','#7FFFD4','#E6FFFA'] },
  { name:'Dashboard Pro', cat:'dashboard', colors:['#0F172A','#3B82F6','#22C55E','#EAB308','#EF4444'] },
  { name:'Analytics Dark', cat:'dashboard', colors:['#1E1E2E','#6366F1','#EC4899','#14B8A6','#F59E0B'] },
  { name:'KPI Board', cat:'dashboard', colors:['#111827','#2563EB','#059669','#D97706','#DC2626'] },
  { name:'Fluent Blue', cat:'teams', colors:['#0078D4','#2B88D8','#71AFE5','#C7E0F4','#EFF6FC'] },
  { name:'Brand System', cat:'corporate', colors:['#0F172A','#6366F1','#F472B6','#FBBF24','#F8FAFC'] },
  { name:'High Contrast', cat:'dashboard', colors:['#000000','#FFFFFF','#FFD700','#00FF00','#FF0000'] },
];

/* ══════════════════════════════════════════════════════════
   STATE
   ══════════════════════════════════════════════════════════ */

function safeParse(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}

const VALID_TABS = ['generate','extract','contrast','blindness','explore'];

const S = {
  colors: [],
  locked: {},
  focused: -1,
  mode: 'random',
  tab: 'explore',
  history: safeParse('palette-history', []),
  favourites: safeParse('palette-favs', []),
  detailIdx: -1,
  dragIdx: -1,
};

const $ = id => document.getElementById(id);

/* ══════════════════════════════════════════════════════════
   TOAST
   ══════════════════════════════════════════════════════════ */

let toastEl;
function toast(msg) {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'palette-toast';
    toastEl.setAttribute('role', 'status');
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = msg;
  toastEl.classList.add('visible');
  clearTimeout(toastEl._t);
  toastEl._t = setTimeout(() => toastEl.classList.remove('visible'), 1800);
}

function copyText(text) {
  if (!navigator.clipboard) {
    toast('Copy not supported in this browser');
    return;
  }
  navigator.clipboard.writeText(text).then(
    () => toast('✓ Copied: ' + text),
    () => toast('Copy failed — try manually')
  );
}

/* ══════════════════════════════════════════════════════════
   TABS
   ══════════════════════════════════════════════════════════ */

function initTabs() {
  document.querySelectorAll('.palette-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.palette-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      document.querySelectorAll('.palette-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const id = tab.dataset.tab;
      $('panel-' + id).classList.add('active');
      S.tab = id;
      updateURL();
      if (id === 'blindness') renderBlindness();
      if (id === 'contrast') updateContrastImports();
      if (id === 'explore') renderExplore();
    });
  });
}

/* ══════════════════════════════════════════════════════════
   GENERATE TAB — SWATCH RENDERING
   ══════════════════════════════════════════════════════════ */

function renderSwatches() {
  const container = $('palette-swatches');
  const existing = container.children;

  while (existing.length > S.colors.length) container.removeChild(container.lastChild);

  S.colors.forEach((hex, i) => {
    let el = existing[i];
    if (!el) {
      el = document.createElement('div');
      el.className = 'palette-swatch';
      el.draggable = true;
      el.innerHTML = `
        <button class="palette-swatch-lock" title="Lock colour"><span>🔓</span></button>
        <button class="palette-swatch-remove" title="Remove">✕</button>
        <div class="palette-swatch-info">
          <span class="palette-swatch-hex"></span>
          <span class="palette-swatch-name"></span>
        </div>`;
      container.appendChild(el);

      el.addEventListener('click', e => {
        if (e.target.closest('.palette-swatch-lock') || e.target.closest('.palette-swatch-remove')) return;
        const idx = [...container.children].indexOf(el);
        S.focused = idx;
        openDetail(idx);
        renderSwatches();
      });

      el.querySelector('.palette-swatch-lock').addEventListener('click', e => {
        e.stopPropagation();
        const idx = [...container.children].indexOf(el);
        S.locked[idx] = !S.locked[idx];
        renderSwatches();
      });

      el.querySelector('.palette-swatch-remove').addEventListener('click', e => {
        e.stopPropagation();
        if (S.colors.length <= 2) return toast('Minimum 2 colours');
        const idx = [...container.children].indexOf(el);
        S.colors.splice(idx, 1);
        const newLocked = {};
        Object.keys(S.locked).forEach(k => {
          const ki = parseInt(k);
          if (ki < idx) newLocked[ki] = S.locked[ki];
          else if (ki > idx) newLocked[ki - 1] = S.locked[ki];
        });
        S.locked = newLocked;
        closeDetail();
        renderSwatches();
        updateURL();
      });

      el.querySelector('.palette-swatch-hex').addEventListener('click', e => {
        e.stopPropagation();
        const idx = [...container.children].indexOf(el);
        copyText(S.colors[idx]);
      });

      /* Drag & drop */
      el.addEventListener('dragstart', e => {
        S.dragIdx = [...container.children].indexOf(el);
        el.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      el.addEventListener('dragend', () => {
        el.classList.remove('dragging');
        document.querySelectorAll('.palette-swatch').forEach(s => s.classList.remove('drag-over'));
      });
      el.addEventListener('dragover', e => {
        e.preventDefault();
        el.classList.add('drag-over');
      });
      el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
      el.addEventListener('drop', e => {
        e.preventDefault();
        el.classList.remove('drag-over');
        const toIdx = [...container.children].indexOf(el);
        if (S.dragIdx === toIdx) return;
        const [moved] = S.colors.splice(S.dragIdx, 1);
        S.colors.splice(toIdx, 0, moved);
        const wasLocked = S.locked[S.dragIdx];
        const newLocked = {};
        Object.keys(S.locked).forEach(k => {
          let ki = parseInt(k);
          if (ki === S.dragIdx) return;
          if (S.dragIdx < toIdx) { if (ki > S.dragIdx && ki <= toIdx) ki--; }
          else { if (ki >= toIdx && ki < S.dragIdx) ki++; }
          newLocked[ki] = S.locked[parseInt(k)];
        });
        if (wasLocked) newLocked[toIdx] = true;
        S.locked = newLocked;
        renderSwatches();
        updateURL();
      });
    }

    const tc = textColorFor(hex);
    el.style.backgroundColor = hex;
    el.style.color = tc;
    el.classList.toggle('focused', i === S.focused);
    el.querySelector('.palette-swatch-hex').textContent = hex;
    el.querySelector('.palette-swatch-name').textContent = nearestColorName(hex);
    const lockBtn = el.querySelector('.palette-swatch-lock span');
    lockBtn.textContent = S.locked[i] ? '🔒' : '🔓';
    el.querySelector('.palette-swatch-lock').classList.toggle('locked', !!S.locked[i]);
  });
}

/* ══════════════════════════════════════════════════════════
   GENERATE
   ══════════════════════════════════════════════════════════ */

function generate() {
  const newColors = generateHarmony(S.mode, S.colors.length, S.locked);
  for (let i = 0; i < S.colors.length; i++) {
    if (!S.locked[i] && newColors[i]) S.colors[i] = newColors[i];
  }
  renderSwatches();
  updateURL();
  addToHistory(S.colors.slice());
  if (S.detailIdx >= 0) openDetail(S.detailIdx);
}

function addToHistory(colors) {
  S.history.unshift(colors);
  if (S.history.length > 20) S.history.pop();
  localStorage.setItem('palette-history', JSON.stringify(S.history));
}

/* ══════════════════════════════════════════════════════════
   DETAIL PANEL
   ══════════════════════════════════════════════════════════ */

function openDetail(idx) {
  S.detailIdx = idx;
  const hex = S.colors[idx];
  if (!hex) return;
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);

  $('palette-detail').classList.add('open');
  $('palette-detail-swatch').style.background = hex;
  $('palette-detail-name').textContent = nearestColorName(hex);
  $('palette-detail-hex').value = hex;
  $('palette-detail-rgb').value = `rgb(${r}, ${g}, ${b})`;
  $('palette-detail-hsl').value = `hsl(${h}, ${s}%, ${l}%)`;
  $('palette-adj-h').value = h;
  $('palette-adj-s').value = s;
  $('palette-adj-l').value = l;
  renderPickerCanvas(h, s, l);
}

/* Custom colour picker — SV canvas + hue strip */
let pickerCanvas, pickerCtx, hueCanvas, hueCtx;

function initPicker() {
  pickerCanvas = $('palette-picker-sv');
  hueCanvas = $('palette-picker-hue');
  if (!pickerCanvas || !hueCanvas) return;
  pickerCtx = pickerCanvas.getContext('2d');
  hueCtx = hueCanvas.getContext('2d');

  /* SV area interaction */
  function svFromEvent(e) {
    const rect = pickerCanvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    return [Math.round(x * 100), Math.round((1 - y) * 100)];
  }
  let svDragging = false;
  const onSV = e => {
    if (S.detailIdx < 0) return;
    const [s, l] = svFromEvent(e);
    $('palette-adj-s').value = s;
    $('palette-adj-l').value = l;
    applyPickerChange();
  };
  pickerCanvas.addEventListener('pointerdown', e => { svDragging = true; pickerCanvas.setPointerCapture(e.pointerId); onSV(e); });
  pickerCanvas.addEventListener('pointermove', e => { if (svDragging) onSV(e); });
  pickerCanvas.addEventListener('pointerup', () => svDragging = false);

  /* Hue strip interaction */
  let hueDragging = false;
  const onHue = e => {
    if (S.detailIdx < 0) return;
    const rect = hueCanvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    $('palette-adj-h').value = Math.round(x * 360);
    applyPickerChange();
  };
  hueCanvas.addEventListener('pointerdown', e => { hueDragging = true; hueCanvas.setPointerCapture(e.pointerId); onHue(e); });
  hueCanvas.addEventListener('pointermove', e => { if (hueDragging) onHue(e); });
  hueCanvas.addEventListener('pointerup', () => hueDragging = false);

  drawHueStrip();
}

function drawHueStrip() {
  if (!hueCanvas) return;
  hueCanvas.width = 280; hueCanvas.height = 16;
  const grad = hueCtx.createLinearGradient(0, 0, 280, 0);
  for (let i = 0; i <= 360; i += 30) grad.addColorStop(i / 360, `hsl(${i},100%,50%)`);
  hueCtx.fillStyle = grad;
  hueCtx.fillRect(0, 0, 280, 16);
}

function renderPickerCanvas(h, s, l) {
  if (!pickerCanvas) return;
  const W = 220, H = 160;
  pickerCanvas.width = W; pickerCanvas.height = H;
  /* Draw SV gradient: white→hue horizontally, then black overlay vertically */
  const baseColor = `hsl(${h},100%,50%)`;
  /* Horizontal: white to pure hue */
  const gradH = pickerCtx.createLinearGradient(0, 0, W, 0);
  gradH.addColorStop(0, '#fff');
  gradH.addColorStop(1, baseColor);
  pickerCtx.fillStyle = gradH;
  pickerCtx.fillRect(0, 0, W, H);
  /* Vertical: transparent to black */
  const gradV = pickerCtx.createLinearGradient(0, 0, 0, H);
  gradV.addColorStop(0, 'rgba(0,0,0,0)');
  gradV.addColorStop(1, '#000');
  pickerCtx.fillStyle = gradV;
  pickerCtx.fillRect(0, 0, W, H);
  /* Draw indicator dot */
  const cx = (s / 100) * W;
  const cy = (1 - l / 100) * H;
  pickerCtx.beginPath();
  pickerCtx.arc(cx, cy, 7, 0, Math.PI * 2);
  pickerCtx.strokeStyle = '#fff';
  pickerCtx.lineWidth = 2;
  pickerCtx.stroke();
  pickerCtx.beginPath();
  pickerCtx.arc(cx, cy, 8, 0, Math.PI * 2);
  pickerCtx.strokeStyle = 'rgba(0,0,0,0.3)';
  pickerCtx.lineWidth = 1;
  pickerCtx.stroke();

  /* Draw hue indicator */
  if (hueCanvas) {
    drawHueStrip();
    const hx = (h / 360) * 280;
    hueCtx.beginPath();
    hueCtx.rect(hx - 3, 0, 6, 16);
    hueCtx.strokeStyle = '#fff';
    hueCtx.lineWidth = 2;
    hueCtx.stroke();
  }
}

function applyPickerChange() {
  if (S.detailIdx < 0) return;
  const h = parseInt($('palette-adj-h').value);
  const s = parseInt($('palette-adj-s').value);
  const l = parseInt($('palette-adj-l').value);
  S.colors[S.detailIdx] = rgbToHex(...hslToRgb(h, s, l));
  renderSwatches();
  openDetail(S.detailIdx);
  updateURL();
}

function closeDetail() {
  $('palette-detail').classList.remove('open');
  S.detailIdx = -1;
}

function initDetailAdjust() {
  ['palette-adj-h', 'palette-adj-s', 'palette-adj-l'].forEach(id => {
    $(id).addEventListener('input', () => {
      applyPickerChange();
    });
  });
  initPicker();
}

/* ══════════════════════════════════════════════════════════
   URL STATE
   ══════════════════════════════════════════════════════════ */

function updateURL() {
  const params = new URLSearchParams(location.search);
  params.set('colors', S.colors.map(c => c.replace('#', '')).join('-'));
  if (S.mode !== 'random') params.set('mode', S.mode);
  else params.delete('mode');
  if (S.tab !== 'explore') params.set('tab', S.tab);
  else params.delete('tab');
  history.replaceState(null, '', '?' + params.toString());
}

function loadFromURL() {
  const params = new URLSearchParams(location.search);
  const c = params.get('colors');
  if (c) {
    S.colors = c.split('-').map(h => '#' + h.toUpperCase()).filter(h => /^#[0-9A-F]{6}$/.test(h));
    if (S.colors.length < 2) S.colors = [];
    if (S.colors.length > 10) S.colors = S.colors.slice(0, 10);
  }
  const m = params.get('mode');
  if (m && ['random','complementary','analogous','triadic','split','monochromatic','tetradic'].includes(m)) {
    S.mode = m;
  }
  const tab = params.get('tab');
  if (tab && VALID_TABS.includes(tab)) {
    S.tab = tab;
    document.querySelectorAll('.palette-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tab);
      t.setAttribute('aria-selected', t.dataset.tab === tab ? 'true' : 'false');
    });
    document.querySelectorAll('.palette-panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + tab));
  }
}

/* ══════════════════════════════════════════════════════════
   HARMONY PILLS
   ══════════════════════════════════════════════════════════ */

function initHarmony() {
  document.querySelectorAll('#palette-harmony-pills .palette-pill').forEach(pill => {
    if (pill.dataset.mode === S.mode) pill.classList.add('active');
    else pill.classList.remove('active');
    pill.addEventListener('click', () => {
      document.querySelectorAll('#palette-harmony-pills .palette-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      S.mode = pill.dataset.mode;
      generate();
    });
  });
}

/* ══════════════════════════════════════════════════════════
   ACTIONS
   ══════════════════════════════════════════════════════════ */

function initActions() {
  $('palette-generate-btn').addEventListener('click', () => generate());

  $('palette-add-swatch').addEventListener('click', () => {
    if (S.colors.length >= 10) return toast('Maximum 10 colours');
    S.colors.push(randomHex());
    renderSwatches();
    updateURL();
  });

  $('palette-remove-swatch').addEventListener('click', () => {
    if (S.colors.length <= 2) return toast('Minimum 2 colours');
    S.colors.pop();
    delete S.locked[S.colors.length];
    closeDetail();
    renderSwatches();
    updateURL();
  });

  $('palette-copy-all').addEventListener('click', () => {
    copyText(S.colors.join(', '));
  });

  $('palette-share').addEventListener('click', () => {
    const url = location.href;
    copyText(url);
    toast('✓ Share link copied!');
  });

  $('palette-print').addEventListener('click', () => window.print());

  $('palette-detail-close').addEventListener('click', closeDetail);

  /* Copy buttons */
  document.querySelectorAll('.palette-copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = $(btn.dataset.target);
      if (input) copyText(input.value);
    });
  });

  /* Save favourite */
  $('palette-save-fav').addEventListener('click', () => {
    $('palette-save-modal').classList.add('open');
    $('palette-fav-name').value = '';
    setTimeout(() => $('palette-fav-name').focus(), 50);
  });
  $('palette-save-cancel').addEventListener('click', () => $('palette-save-modal').classList.remove('open'));
  $('palette-save-confirm').addEventListener('click', () => {
    const name = $('palette-fav-name').value.trim() || 'Untitled';
    S.favourites.push({ name, colors: S.colors.slice(), date: Date.now() });
    localStorage.setItem('palette-favs', JSON.stringify(S.favourites));
    $('palette-save-modal').classList.remove('open');
    toast('⭐ Saved: ' + name);
  });
  $('palette-save-modal').addEventListener('click', e => {
    if (e.target === $('palette-save-modal')) $('palette-save-modal').classList.remove('open');
  });
  /* Modal escape key + focus trap */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && $('palette-save-modal').classList.contains('open')) {
      $('palette-save-modal').classList.remove('open');
    }
    if (e.key === 'Tab' && $('palette-save-modal').classList.contains('open')) {
      const focusable = $('palette-save-modal').querySelectorAll('input, button');
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* Export */
  $('palette-export-btn').addEventListener('click', e => {
    e.stopPropagation();
    $('palette-export-menu').classList.toggle('open');
  });
  document.addEventListener('click', () => $('palette-export-menu').classList.remove('open'));
  $('palette-export-menu').addEventListener('click', e => {
    e.stopPropagation();
    const fmt = e.target.dataset.fmt;
    if (!fmt) return;
    exportPalette(fmt);
    $('palette-export-menu').classList.remove('open');
  });
}

/* ══════════════════════════════════════════════════════════
   EXPORT
   ══════════════════════════════════════════════════════════ */

function exportPalette(fmt) {
  const colors = S.colors;
  let text = '';

  if (fmt === 'css') {
    text = ':root {\n' + colors.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n') + '\n}';
  } else if (fmt === 'scss') {
    text = colors.map((c, i) => `$color-${i + 1}: ${c};`).join('\n');
  } else if (fmt === 'tailwind') {
    const obj = {};
    colors.forEach((c, i) => obj[`custom-${i + 1}`] = c);
    text = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: ${JSON.stringify(obj, null, 8).replace(/^/gm, '      ').trim()}\n    }\n  }\n}`;
  } else if (fmt === 'json') {
    text = JSON.stringify(colors.map((c, i) => ({ name: nearestColorName(c), hex: c, rgb: hexToRgb(c) })), null, 2);
  } else if (fmt === 'png') {
    exportPNG(); return;
  } else if (fmt === 'svg') {
    exportSVG(); return;
  }

  if (text) {
    copyText(text);
    toast('✓ ' + fmt.toUpperCase() + ' copied to clipboard');
  }
}

function exportPNG() {
  const canvas = document.createElement('canvas');
  const w = 200 * S.colors.length, h = 300;
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  const sw = w / S.colors.length;
  S.colors.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(i * sw, 0, sw, h);
    ctx.fillStyle = textColorFor(c);
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(c, i * sw + sw / 2, h - 30);
    ctx.font = '12px sans-serif';
    ctx.fillText(nearestColorName(c), i * sw + sw / 2, h - 12);
  });
  const link = document.createElement('a');
  link.download = 'palette.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
  toast('✓ PNG downloaded');
}

function exportSVG() {
  const sw = 200, h = 300, w = sw * S.colors.length;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">`;
  S.colors.forEach((c, i) => {
    const tc = textColorFor(c);
    svg += `<rect x="${i*sw}" y="0" width="${sw}" height="${h}" fill="${c}"/>`;
    svg += `<text x="${i*sw+sw/2}" y="${h-30}" fill="${tc}" font-family="monospace" font-size="16" font-weight="bold" text-anchor="middle">${esc(c)}</text>`;
    svg += `<text x="${i*sw+sw/2}" y="${h-12}" fill="${tc}" font-family="sans-serif" font-size="12" text-anchor="middle">${esc(nearestColorName(c))}</text>`;
  });
  svg += '</svg>';
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const link = document.createElement('a');
  link.download = 'palette.svg';
  link.href = URL.createObjectURL(blob);
  link.click();
  toast('✓ SVG downloaded');
}

/* ══════════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS
   ══════════════════════════════════════════════════════════ */

function initKeyboard() {
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    if ($('palette-save-modal').classList.contains('open')) return;
    if (S.tab !== 'generate') return;

    if (e.code === 'Space') {
      e.preventDefault();
      generate();
    } else if (e.key === 'l' || e.key === 'L') {
      if (S.focused >= 0 && S.focused < S.colors.length) {
        S.locked[S.focused] = !S.locked[S.focused];
        renderSwatches();
      }
    } else if (e.key === 'ArrowRight') {
      S.focused = Math.min(S.focused + 1, S.colors.length - 1);
      if (S.focused < 0) S.focused = 0;
      renderSwatches();
    } else if (e.key === 'ArrowLeft') {
      S.focused = Math.max(S.focused - 1, 0);
      renderSwatches();
    } else if (e.key === 'c' || e.key === 'C') {
      if (S.focused >= 0 && S.focused < S.colors.length) {
        copyText(S.colors[S.focused]);
      }
    }
  });
}

/* ══════════════════════════════════════════════════════════
   EXTRACT TAB
   ══════════════════════════════════════════════════════════ */

function initExtract() {
  const dropZone = $('palette-drop-zone');
  const input = $('palette-image-input');
  const canvas = $('palette-extract-canvas');
  const ctx = canvas.getContext('2d');

  dropZone.addEventListener('click', () => input.click());
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) processImage(file);
  });
  input.addEventListener('change', () => {
    if (input.files[0]) processImage(input.files[0]);
  });

  $('palette-extract-count').addEventListener('input', function() {
    $('palette-extract-count-val').textContent = this.value;
  });

  $('palette-extract-again').addEventListener('click', () => {
    if (canvas._imageData) {
      const num = parseInt($('palette-extract-count').value) || 5;
      const colors = extractColors(canvas._imageData, num);
      renderExtractedColors(colors);
    }
  });

  $('palette-extract-use').addEventListener('click', () => {
    const swatches = document.querySelectorAll('#palette-extract-swatches .palette-extract-swatch');
    if (swatches.length === 0) return;
    S.colors = [...swatches].map(s => s.dataset.hex);
    S.locked = {};
    renderSwatches();
    updateURL();
    document.querySelector('[data-tab="generate"]').click();
    toast('✓ Palette loaded from image');
  });

  function processImage(file) {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 600;
        let w = img.width, h = img.height;
        if (w > maxDim || h > maxDim) {
          const ratio = Math.min(maxDim / w, maxDim / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        canvas._imageData = ctx.getImageData(0, 0, w, h);

        $('palette-extract-controls').classList.remove('palette-hidden');
        $('palette-extract-results').classList.remove('palette-hidden');
        dropZone.style.display = 'none';

        const num = parseInt($('palette-extract-count').value) || 5;
        const colors = extractColors(canvas._imageData, num);
        renderExtractedColors(colors);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function renderExtractedColors(colors) {
    const container = $('palette-extract-swatches');
    container.innerHTML = '';
    colors.forEach(hex => {
      const div = document.createElement('div');
      div.className = 'palette-extract-swatch';
      div.style.backgroundColor = hex;
      div.dataset.hex = hex;
      div.title = hex;
      div.innerHTML = `<span class="palette-extract-swatch-hex">${esc(hex)}</span>`;
      div.addEventListener('click', () => {
        if (S.colors.length < 10) {
          S.colors.push(hex);
          renderSwatches();
          updateURL();
          toast('✓ Added ' + hex);
        } else {
          toast('Maximum 10 colours');
        }
      });
      container.appendChild(div);
    });
  }
}

/* ══════════════════════════════════════════════════════════
   CONTRAST TAB
   ══════════════════════════════════════════════════════════ */

function initContrast() {
  const fgPicker = $('palette-fg-picker');
  const fgHex = $('palette-fg-hex');
  const bgPicker = $('palette-bg-picker');
  const bgHex = $('palette-bg-hex');

  function update() {
    const fg = fgHex.value;
    const bg = bgHex.value;
    if (!/^#[0-9A-Fa-f]{6}$/.test(fg) || !/^#[0-9A-Fa-f]{6}$/.test(bg)) return;

    fgPicker.value = fg;
    bgPicker.value = bg;

    const ratio = contrastRatio(fg, bg);
    $('palette-contrast-ratio').textContent = ratio.toFixed(1);

    const badges = [
      { el: document.querySelector('[data-level="aa-normal"]'), pass: ratio >= 4.5 },
      { el: document.querySelector('[data-level="aa-large"]'), pass: ratio >= 3 },
      { el: document.querySelector('[data-level="aaa-normal"]'), pass: ratio >= 7 },
      { el: document.querySelector('[data-level="aaa-large"]'), pass: ratio >= 4.5 },
    ];
    badges.forEach(({ el, pass }) => {
      el.classList.toggle('pass', pass);
      el.classList.toggle('fail', !pass);
      el.querySelector('.palette-badge-status').textContent = pass ? '✓ Pass' : '✗ Fail';
    });

    const preview = $('palette-contrast-preview');
    preview.style.backgroundColor = bg;
    preview.style.color = fg;
    preview.querySelector('.palette-contrast-preview-btn').style.color = fg;
    preview.querySelector('.palette-contrast-preview-btn').style.borderColor = fg;
  }

  fgPicker.addEventListener('input', () => { fgHex.value = fgPicker.value.toUpperCase(); update(); });
  fgHex.addEventListener('input', () => { if (/^#[0-9A-Fa-f]{6}$/.test(fgHex.value)) { fgPicker.value = fgHex.value; update(); } });
  bgPicker.addEventListener('input', () => { bgHex.value = bgPicker.value.toUpperCase(); update(); });
  bgHex.addEventListener('input', () => { if (/^#[0-9A-Fa-f]{6}$/.test(bgHex.value)) { bgPicker.value = bgHex.value; update(); } });

  $('palette-contrast-swap').addEventListener('click', () => {
    const tmp = fgHex.value;
    fgHex.value = bgHex.value;
    bgHex.value = tmp;
    update();
  });

  $('palette-fg-import').addEventListener('change', function() {
    if (this.value) { fgHex.value = this.value; fgPicker.value = this.value; update(); this.value = ''; }
  });
  $('palette-bg-import').addEventListener('change', function() {
    if (this.value) { bgHex.value = this.value; bgPicker.value = this.value; update(); this.value = ''; }
  });

  $('palette-suggest-fix').addEventListener('click', () => {
    const fg = fgHex.value;
    const bg = bgHex.value;
    const ratio = contrastRatio(fg, bg);
    if (ratio >= 4.5) return toast('Already passes AA!');

    const [fh, fs, fl] = rgbToHsl(...hexToRgb(fg));
    const [bh, bs, bl] = rgbToHsl(...hexToRgb(bg));

    /* Try adjusting foreground lightness */
    for (let delta = 1; delta <= 80; delta++) {
      const tryLight = fl > 50 ? Math.min(100, fl + delta) : Math.max(0, fl - delta);
      const tryHex = rgbToHex(...hslToRgb(fh, fs, tryLight));
      if (contrastRatio(tryHex, bg) >= 4.5) {
        fgHex.value = tryHex;
        fgPicker.value = tryHex;
        update();
        toast('Adjusted foreground to pass AA');
        return;
      }
      const tryLight2 = fl > 50 ? Math.max(0, fl - delta) : Math.min(100, fl + delta);
      const tryHex2 = rgbToHex(...hslToRgb(fh, fs, tryLight2));
      if (contrastRatio(tryHex2, bg) >= 4.5) {
        fgHex.value = tryHex2;
        fgPicker.value = tryHex2;
        update();
        toast('Adjusted foreground to pass AA');
        return;
      }
    }
    toast('Could not auto-fix — try changing the background');
  });

  update();
}

function updateContrastImports() {
  const options = S.colors.map(c => `<option value="${c}">${esc(c)} — ${esc(nearestColorName(c))}</option>`).join('');
  const base = '<option value="">— select —</option>' + options;
  $('palette-fg-import').innerHTML = base;
  $('palette-bg-import').innerHTML = base;
}

/* ══════════════════════════════════════════════════════════
   BLINDNESS TAB
   ══════════════════════════════════════════════════════════ */

function renderBlindness() {
  const types = [
    { key: 'normal', name: 'Normal Vision', desc: 'Full colour spectrum' },
    { key: 'protanopia', name: 'Protanopia', desc: 'No red cones (~1% of men)' },
    { key: 'deuteranopia', name: 'Deuteranopia', desc: 'No green cones (~5% of men)' },
    { key: 'tritanopia', name: 'Tritanopia', desc: 'No blue cones (very rare)' },
    { key: 'achromatopsia', name: 'Achromatopsia', desc: 'Total colour blindness' },
  ];

  const grid = $('palette-blindness-grid');
  grid.innerHTML = '';

  types.forEach(({ key, name, desc }) => {
    const card = document.createElement('div');
    card.className = 'palette-blindness-card';
    const simColors = S.colors.map(c => simulateColorBlindness(c, key));
    card.innerHTML = `
      <div class="palette-blindness-card-title">${key === 'normal' ? 'Normal' : 'Sim'} ${esc(name)} <span class="palette-blindness-card-subtitle">${esc(desc)}</span></div>
      <div class="palette-blindness-swatches">${simColors.map(c => `<div class="palette-blindness-swatch" style="background:${c}"></div>`).join('')}</div>
    `;
    grid.appendChild(card);
  });

  /* Accessibility warnings */
  const summary = $('palette-blindness-summary');
  summary.innerHTML = '';
  const warnings = [];
  const threshold = 30;

  ['protanopia', 'deuteranopia', 'tritanopia'].forEach(type => {
    const simColors = S.colors.map(c => simulateColorBlindness(c, type));
    for (let i = 0; i < simColors.length; i++) {
      for (let j = i + 1; j < simColors.length; j++) {
        if (colorDistance(simColors[i], simColors[j]) < threshold) {
          const typeName = type.charAt(0).toUpperCase() + type.slice(1);
          warnings.push(`<strong>${esc(typeName)}</strong>: Colours ${i+1} (${esc(S.colors[i])}) and ${j+1} (${esc(S.colors[j])}) may be indistinguishable.`);
        }
      }
    }
  });

  if (warnings.length === 0) {
    summary.innerHTML = '<div class="palette-blindness-pass">✅ Your palette appears distinguishable across all simulated colour vision deficiencies.</div>';
  } else {
    summary.innerHTML = warnings.map(w => `<div class="palette-blindness-warning">${w}</div>`).join('');
  }
}

/* ══════════════════════════════════════════════════════════
   EXPLORE TAB
   ══════════════════════════════════════════════════════════ */

function renderExplore() {
  const search = ($('palette-explore-search').value || '').toLowerCase();
  const activeCat = document.querySelector('#palette-explore-cats .palette-pill.active');
  const cat = activeCat ? activeCat.dataset.cat : 'all';

  const filtered = CURATED.filter(p => {
    if (cat !== 'all' && p.cat !== cat) return false;
    if (search && !p.name.toLowerCase().includes(search) && !p.cat.toLowerCase().includes(search)) return false;
    return true;
  });

  const grid = $('palette-explore-grid');
  grid.innerHTML = '';
  filtered.forEach(p => {
    const card = document.createElement('div');
    card.className = 'palette-explore-card';
    card.innerHTML = `
      <div class="palette-explore-card-colors">${p.colors.map(c => `<div class="palette-explore-card-color" style="background:${c}"></div>`).join('')}</div>
      <div class="palette-explore-card-info">
        <span class="palette-explore-card-name">${esc(p.name)}</span>
        <span class="palette-explore-card-use">Use This →</span>
      </div>`;
    card.addEventListener('click', () => {
      S.colors = p.colors.slice();
      S.locked = {};
      renderSwatches();
      updateURL();
      document.querySelector('[data-tab="generate"]').click();
      toast('✓ Loaded: ' + p.name);
    });
    grid.appendChild(card);
  });

  /* History */
  const historyGrid = $('palette-history-grid');
  if (S.history.length === 0) {
    historyGrid.innerHTML = '<p class="palette-muted">No palettes generated yet. Press spacebar on the Generate tab!</p>';
  } else {
    historyGrid.innerHTML = '';
    S.history.slice(0, 20).forEach(colors => {
      const card = document.createElement('div');
      card.className = 'palette-history-card';
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', 'Load palette ' + colors.join(' '));
      card.innerHTML = `
        <div class="palette-history-colors">${colors.map(c => `<div class="palette-history-color" style="background:${c}"></div>`).join('')}</div>
        <div class="palette-history-hex">${colors.map(c => esc(c)).join(' ')}</div>`;
      const load = () => {
        S.colors = colors.slice();
        S.locked = {};
        renderSwatches();
        updateURL();
        document.querySelector('[data-tab="generate"]').click();
        toast('✓ Loaded from history');
      };
      card.addEventListener('click', load);
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); load(); } });
      historyGrid.appendChild(card);
    });
  }

  /* Favourites */
  const favGrid = $('palette-fav-grid');
  if (S.favourites.length === 0) {
    favGrid.innerHTML = '<p class="palette-muted">No saved palettes yet. Use ⭐ Save on the Generate tab!</p>';
  } else {
    favGrid.innerHTML = '';
    S.favourites.forEach((fav, fi) => {
      const card = document.createElement('div');
      card.className = 'palette-explore-card';
      card.innerHTML = `
        <div class="palette-explore-card-colors">${fav.colors.map(c => `<div class="palette-explore-card-color" style="background:${c}"></div>`).join('')}</div>
        <div class="palette-explore-card-info">
          <span class="palette-explore-card-name">${esc(fav.name)}</span>
          <button class="palette-fav-delete" data-fi="${fi}" title="Delete" aria-label="Delete ${esc(fav.name)}">✕</button>
        </div>`;
      card.addEventListener('click', e => {
        if (e.target.closest('.palette-fav-delete')) return;
        S.colors = fav.colors.slice();
        S.locked = {};
        renderSwatches();
        updateURL();
        document.querySelector('[data-tab="generate"]').click();
        toast('✓ Loaded: ' + fav.name);
      });
      card.querySelector('.palette-fav-delete').addEventListener('click', e => {
        e.stopPropagation();
        S.favourites.splice(fi, 1);
        localStorage.setItem('palette-favs', JSON.stringify(S.favourites));
        renderExplore();
        toast('Deleted: ' + fav.name);
      });
      favGrid.appendChild(card);
    });
  }
}

function initExplore() {
  $('palette-explore-search').addEventListener('input', renderExplore);
  document.querySelectorAll('#palette-explore-cats .palette-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#palette-explore-cats .palette-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      renderExplore();
    });
  });
}

/* ══════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════ */

function init() {
  /* Default 5 colors */
  S.colors = ['#D946EF', '#EF4444', '#34D399', '#FB923C', '#818CF8'];

  loadFromURL();

  if (S.colors.length < 2) S.colors = ['#D946EF', '#EF4444', '#34D399', '#FB923C', '#818CF8'];

  initTabs();
  initHarmony();
  renderSwatches();
  initActions();
  initDetailAdjust();
  initKeyboard();
  initExtract();
  initContrast();
  initExplore();
  updateURL();

  /* Ensure the initially active tab is fully rendered */
  renderExplore();
  if (S.tab === 'blindness') renderBlindness();
  if (S.tab === 'contrast') updateContrastImports();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
