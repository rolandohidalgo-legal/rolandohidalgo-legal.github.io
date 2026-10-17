// Genera las piezas de marca: el letrero del pie de página y el ícono del sitio.
// Se corre a mano cuando se quiera cambiar el diseño:  npm run brand
//
// Letras: contornos de Gelasio Cursiva (OFL, la misma tipografía del sitio), convertidos en dibujo.
// El rayado, el borde irregular y el punto se generan con una semilla fija: cada corrida da el mismo resultado.
// Todo queda "horneado" en el dibujo (sin filtros), así se ve igual en el navegador, en una pestaña y en un PNG.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const o = require('opentype.js');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRAND = path.join(ROOT, 'site', 'assets', 'brand');
fs.mkdirSync(BRAND, { recursive: true });

const fb = fs.readFileSync(path.join(ROOT, 'node_modules/@fontsource/gelasio/files/gelasio-latin-400-italic.woff'));
const font = o.parse(fb.buffer.slice(fb.byteOffset, fb.byteOffset + fb.length));

// Paletas: claro = bloque oscuro con letra crema; oscuro = bloque crema con letra oscura
const LIGHT = { block: '#26231e', tex: '#6a6154', letters: '#f4eee2', dot: '#e0806e' };
const DARK = { block: '#efe7d6', tex: '#b9ad94', letters: '#26231e', dot: '#c8553e' };


// Composición letra por letra (la librería no soporta algunas funciones de diseño de Gelasio)
const scale = (size) => size / font.unitsPerEm;
const adv = (text, size) => [...text].reduce((w, ch) => w + font.charToGlyph(ch).advanceWidth * scale(size), 0);
function textPath(text, x, y, size) {
  let cx = x, d = '';
  for (const ch of text) {
    const g = font.charToGlyph(ch);
    d += g.getPath(cx, y, size).toPathData(2);
    cx += g.advanceWidth * scale(size);
  }
  return d;
}
function textBox(text, size) {
  const g = font.charToGlyph(text);
  return g.getPath(0, 0, size).getBoundingBox();
}

let seed = 11;
const rnd = () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const rr = (a, b) => a + (b - a) * rnd();
const f1 = (n) => n.toFixed(1);

// Rayado de bolígrafo: vaivén de trazos curvos sobre un área (x0,y0)-(x1,y1)
function scribble(x0, y0, x1, y1, gap, overshoot, tilt = 0) {
  let d = '', y = y0, dir = 1, k = 0;
  const w = x1 - x0;
  while (y < y1) {
    const xa = dir > 0 ? x0 - rr(0, overshoot) : x1 + rr(0, overshoot);
    const xb = dir > 0 ? x1 + rr(0, overshoot) : x0 - rr(0, overshoot);
    const y2 = y + gap * rr(0.8, 1.3);
    d += `${k ? 'L' : 'M'}${f1(xa)},${f1(y + tilt * ((xa - x0) / w))}Q${f1((xa + xb) / 2)},${f1(y + rr(-3.5, 3.5))} ${f1(xb)},${f1(y2 + tilt * ((xb - x0) / w))}`;
    y = y2; dir = -dir; k++;
  }
  return d;
}

// Rectángulo de borde irregular (cortado a mano)
function roughRect(x0, y0, x1, y1, j = 1.8, step = 14) {
  const pts = [];
  for (let x = x0; x < x1; x += step) pts.push([x, y0 + rr(-j, j)]);
  for (let y = y0; y < y1; y += step) pts.push([x1 + rr(-j, j), y]);
  for (let x = x1; x > x0; x -= step) pts.push([x, y1 + rr(-j, j)]);
  for (let y = y1; y > y0; y -= step) pts.push([x0 + rr(-j, j), y]);
  return 'M' + pts.map((p) => `${f1(p[0])},${f1(p[1])}`).join('L') + 'Z';
}

// Punto dibujado con rayado: cuerdas de vaivén dentro de un círculo + un contorno trazado a mano
function dotScribble(cx, cy, r, gap, wobble = 1.2) {
  let d = '', dir = 1, k = 0;
  for (let y = cy - r + 1; y <= cy + r - 1; y += gap * rr(0.85, 1.2)) {
    const half = Math.sqrt(Math.max(0, r * r - (y - cy) * (y - cy))) + rr(-wobble, wobble);
    const xa = dir > 0 ? cx - half : cx + half, xb = dir > 0 ? cx + half : cx - half;
    d += `${k ? 'L' : 'M'}${f1(xa)},${f1(y)}Q${f1(cx)},${f1(y + rr(-2, 2))} ${f1(xb)},${f1(y + gap * 0.5)}`;
    dir = -dir; k++;
  }
  return d;
}
function dotRing(cx, cy, r) {
  const n = 18, start = rr(0, Math.PI * 2), over = 0.45;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const a = start + ((Math.PI * 2 + over) * i) / n, rad = r * (1 + rr(-0.05, 0.05)) + (i / n) * 1.8;
    d += `${i ? 'L' : 'M'}${f1(cx + Math.cos(a) * rad)},${f1(cy + Math.sin(a) * rad)}`;
  }
  return d;
}

// Barrido que se afina en los extremos (trazo de pluma)
const swash = (x0, y0, x1, y1, lift, thick) => {
  const mx = (x0 + x1) / 2;
  return `M${f1(x0)},${f1(y0)}Q${f1(mx)},${f1(y0 + lift - thick)} ${f1(x1)},${f1(y1)}Q${f1(mx)},${f1(y0 + lift + thick)} ${f1(x0)},${f1(y0)}Z`;
};

// ---------------- Letrero ----------------
// mode: 'inline' → clases CSS (el sitio las pinta según tema); 'light' / 'dark' → colores fijos
function letrero(mode) {
  seed = 11;
  const W = 780, H = 250, fs = 116, rs = 1.5, base = 170;
  const rw = adv('R', fs * rs), restW = adv('olando', fs);
  const x0 = (W - (rw + restW + 86)) / 2;
  const R = textPath('R', x0, base, fs * rs);
  const T = textPath('olando', x0 + rw - 8, base, fs);
  const dx = x0 + rw + restW + 42, dy = base - 12, dr = 23;
  const blockPath = roughRect(20, 20, W - 20, H - 20);
  const over = scribble(20, 20, W - 20, H - 20, 4.4, 12, -8);
  const tex = scribble(24, 24, W - 24, H - 24, 4.4, 0, -8);
  const sw = swash(x0 + 6, base + 14, x0 + rw + restW - 14, base + 22, 13, 3.2);
  const dotFill = dotScribble(dx, dy, dr, 3.1), dotOut = dotRing(dx, dy, dr + 1);

  const pal = mode === 'dark' ? DARK : LIGHT;
  const c = (cls, attr, color) => (mode === 'inline' ? `class="${cls}"` : `${attr}="${color}"`);
  const defs = `<clipPath id="sg-clip"><path d="${blockPath}"/></clipPath>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Rolando.">
<defs>${defs}</defs>
<path ${c('sg-block', 'fill', pal.block)} d="${blockPath}"/>
<path ${c('sg-over', 'stroke', pal.block)} d="${over}" fill="none" stroke-width="2.2" stroke-linecap="round"/>
<g clip-path="url(#sg-clip)"><path ${c('sg-tex', 'stroke', pal.tex)} d="${tex}" fill="none" stroke-width="1.5" stroke-linecap="round" opacity=".5"/></g>
<g ${c('sg-letters', 'fill', pal.letters)}><path d="${R}"/><path d="${T}"/><path d="${sw}"/></g>
<g class="sg-dot" fill="none" stroke-linecap="round" stroke-linejoin="round">
<path ${c('sg-dotline', 'stroke', pal.dot)} pathLength="1" d="${dotFill}" stroke-width="2.7"/>
<path ${c('sg-dotline', 'stroke', pal.dot)} pathLength="1" d="${dotOut}" stroke-width="2.2"/>
</g>
</svg>
`;
}

// ---------------- Ícono ----------------
// rich: con rayado y punto dibujado (PNG grandes). Sin rich: bloque liso y punto relleno (pestañas, 16–32 px)
function icono({ rich, dark = false, size = 512, style = false }) {
  seed = 23;
  const pal = dark ? DARK : LIGHT, S = 512;
  const b = textBox('R', 420);
  const px = 236 - (b.x1 + b.x2) / 2, py = 262 - (b.y1 + b.y2) / 2;
  const R = textPath('R', px, py, 420);
  const block = roughRect(22, 22, S - 22, S - 22, rich ? 2.2 : 0, 16);
  const dx = 398, dy = 386, dr = 36;
  const parts = [];
  if (rich) {
    parts.push(`<path fill="${pal.block}" d="${block}"/>`);
    parts.push(`<path stroke="${pal.block}" d="${scribble(22, 22, S - 22, S - 22, 5, 12, -10)}" fill="none" stroke-width="2.6" stroke-linecap="round"/>`);
    parts.push(`<clipPath id="ic"><path d="${block}"/></clipPath><g clip-path="url(#ic)"><path stroke="${pal.tex}" d="${scribble(26, 26, S - 26, S - 26, 5, 0, -10)}" fill="none" stroke-width="1.8" stroke-linecap="round" opacity=".5"/></g>`);
    parts.push(`<path fill="${pal.letters}" d="${R}"/>`);
    parts.push(`<g fill="none" stroke="${pal.dot}" stroke-linecap="round" stroke-linejoin="round"><path d="${dotScribble(dx, dy, dr, 4.2, 1.8)}" stroke-width="3.6"/><path d="${dotRing(dx, dy, dr + 1.5)}" stroke-width="3"/></g>`);
  } else {
    const rx = `<rect x="14" y="14" width="${S - 28}" height="${S - 28}" rx="64"`;
    parts.push(style
      ? `<style>.b{fill:${LIGHT.block}}.l{fill:${LIGHT.letters}}.d{fill:${LIGHT.dot}}@media (prefers-color-scheme:dark){.b{fill:${DARK.block}}.l{fill:${DARK.letters}}.d{fill:${DARK.dot}}}</style>${rx} class="b"/><path class="l" d="${R}"/><circle class="d" cx="${dx}" cy="${dy}" r="${dr + 4}"/>`
      : `${rx} fill="${pal.block}"/><path fill="${pal.letters}" d="${R}"/><circle fill="${pal.dot}" cx="${dx}" cy="${dy}" r="${dr + 4}"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${size}" height="${size}">${parts.join('')}</svg>\n`;
}

const out = (p, s) => fs.writeFileSync(p, s);
out(path.join(BRAND, 'letrero.svg'), letrero('inline'));
out(path.join(BRAND, 'letrero-claro.svg'), letrero('light'));
out(path.join(BRAND, 'letrero-oscuro.svg'), letrero('dark'));
out(path.join(BRAND, 'icono-rico.svg'), icono({ rich: true }));
out(path.join(BRAND, 'icono-rico-oscuro.svg'), icono({ rich: true, dark: true }));
out(path.join(ROOT, 'site', 'favicon.svg'), icono({ rich: false, style: true, size: 64 }));

const png = (svg, size, file) => sharp(Buffer.from(svg)).resize(size, size).png().toFile(path.join(ROOT, 'site', file));
await png(icono({ rich: false, size: 64 }), 32, 'favicon-32.png');
await png(icono({ rich: true }), 180, 'apple-touch-icon.png');
await png(icono({ rich: true }), 512, 'icon-512.png');
console.log('Marca generada en site/assets/brand y site/');
