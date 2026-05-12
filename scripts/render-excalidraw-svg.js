#!/usr/bin/env node
// Render an Excalidraw JSON file to clean SVG.
// Maps rectangles, text, and arrows to SVG primitives.
// Does NOT replicate roughjs hand-drawn look — produces sharp output suited for embed/share.

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node render-excalidraw-svg.js <input.excalidraw> <output.svg>');
  process.exit(1);
}

const [inputPath, outputPath] = args;
const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

// Compute viewBox from element extents
let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
for (const el of data.elements) {
  if (typeof el.x !== 'number') continue;
  const w = el.width || 0;
  const h = el.height || 0;
  if (el.x < minX) minX = el.x;
  if (el.y < minY) minY = el.y;
  if (el.x + w > maxX) maxX = el.x + w;
  if (el.y + h > maxY) maxY = el.y + h;
}
const padding = 30;
const vbX = Math.floor(minX - padding);
const vbY = Math.floor(minY - padding);
const vbW = Math.ceil(maxX - vbX + padding);
const vbH = Math.ceil(maxY - vbY + padding);

const escapeXml = (s) =>
  String(s).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));

// Font mapping — Excalidraw uses Virgil (1), Helvetica (2), Cascadia (3)
// We use a web-safe fallback stack for portability.
const fontFamilyMap = {
  1: '"Comic Sans MS", "Marker Felt", system-ui, sans-serif',
  2: 'Helvetica, Arial, sans-serif',
  3: '"Cascadia Code", Consolas, monospace',
};

const elements = data.elements;
const byId = new Map(elements.map((el) => [el.id, el]));

const svgParts = [];
svgParts.push(`<?xml version="1.0" encoding="UTF-8"?>`);
svgParts.push(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbX} ${vbY} ${vbW} ${vbH}" width="${vbW}" height="${vbH}" role="img" aria-labelledby="title">`
);
svgParts.push(`<title id="title">${escapeXml(data.source || 'Excalidraw diagram')}</title>`);
svgParts.push(`<rect x="${vbX}" y="${vbY}" width="${vbW}" height="${vbH}" fill="${data.appState?.viewBackgroundColor || '#ffffff'}" />`);

// Arrow marker
svgParts.push(`<defs>
  <marker id="arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="#1e1e1e" />
  </marker>
</defs>`);

// Render rectangles first (background layer)
for (const el of elements) {
  if (el.type !== 'rectangle') continue;
  const rx = el.roundness ? Math.min(20, (el.width || 0) * 0.08) : 0;
  const fill = el.backgroundColor && el.backgroundColor !== 'transparent' ? el.backgroundColor : 'none';
  const stroke = el.strokeColor || '#000000';
  const sw = el.strokeWidth || 2;
  svgParts.push(
    `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${rx}" ry="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" />`
  );
}

// Render arrows
for (const el of elements) {
  if (el.type !== 'arrow') continue;
  if (!Array.isArray(el.points) || el.points.length < 2) continue;
  const stroke = el.strokeColor || '#1e1e1e';
  const sw = el.strokeWidth || 2;
  const pts = el.points
    .map((p) => `${el.x + p[0]},${el.y + p[1]}`)
    .join(' ');
  svgParts.push(
    `<polyline points="${pts}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#arrowhead)" />`
  );
}

// Render text last (foreground layer)
for (const el of elements) {
  if (el.type !== 'text') continue;
  const fontSize = el.fontSize || 16;
  const fontFamily = fontFamilyMap[el.fontFamily] || fontFamilyMap[1];
  const color = el.strokeColor || '#000000';
  const align = el.textAlign || 'left';
  const vAlign = el.verticalAlign || 'top';
  const lines = String(el.text || '').split('\n');
  const lineHeight = fontSize * 1.25;

  // For bound text, position is relative to container; the element's x/y already accounts for inner offset.
  const boxW = el.width || 200;
  const boxH = el.height || lineHeight * lines.length;

  // Calculate vertical start
  const blockHeight = lineHeight * lines.length;
  let yStart;
  if (vAlign === 'middle') {
    yStart = el.y + (boxH - blockHeight) / 2 + fontSize * 0.85;
  } else if (vAlign === 'bottom') {
    yStart = el.y + boxH - blockHeight + fontSize * 0.85;
  } else {
    yStart = el.y + fontSize * 0.85;
  }

  // Calculate horizontal anchor
  let xPos, anchor;
  if (align === 'center') {
    xPos = el.x + boxW / 2;
    anchor = 'middle';
  } else if (align === 'right') {
    xPos = el.x + boxW;
    anchor = 'end';
  } else {
    xPos = el.x;
    anchor = 'start';
  }

  for (let i = 0; i < lines.length; i++) {
    const ly = yStart + i * lineHeight;
    svgParts.push(
      `<text x="${xPos}" y="${ly}" font-family='${fontFamily}' font-size="${fontSize}" fill="${color}" text-anchor="${anchor}" xml:space="preserve">${escapeXml(lines[i])}</text>`
    );
  }
}

svgParts.push('</svg>');
const svg = svgParts.join('\n');
fs.writeFileSync(outputPath, svg, 'utf8');
console.log(`Wrote ${outputPath} (viewBox: ${vbX} ${vbY} ${vbW} ${vbH})`);
