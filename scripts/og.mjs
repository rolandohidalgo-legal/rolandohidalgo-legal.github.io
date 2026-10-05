// Imagen de 1200×630 que muestran WhatsApp, LinkedIn, X y Facebook al compartir un enlace.
// Dos diseños: con foto de portada (foto a sangre con el titular encima) o sin ella
// (portada tipográfica en papel crema, como la tapa de una revista).
import fs from 'node:fs';
import { createRequire } from 'node:module';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const font = (pkg, file) => fs.readFileSync(require.resolve(`${pkg}/files/${file}`));
const FONTS = [
  { name: 'Gelasio', data: font('@fontsource/gelasio', 'gelasio-latin-700-normal.woff'), weight: 700, style: 'normal' },
  { name: 'Gelasio', data: font('@fontsource/gelasio', 'gelasio-latin-400-italic.woff'), weight: 400, style: 'italic' },
  { name: 'Inter', data: font('@fontsource/inter', 'inter-latin-600-normal.woff'), weight: 600, style: 'normal' },
];

const C = { paper: '#f7f2e8', ink: '#26231e', muted: '#5f594f', tan: '#9d937c', rule: '#ddd5c4', accent: '#a23c30', soft: '#e0806e' };
const W = 1200, H = 630;

// Nodo para satori: todo contenedor con varios hijos necesita display:flex
const h = (type, style, ...children) => ({ type, props: { style: { display: 'flex', ...style }, children: children.flat().filter((c) => c !== null && c !== false && c !== '') } });
const clip = (s, n) => (s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s);
const titleSize = (t, cover) => { const L = t.length; return (L <= 32 ? 84 : L <= 60 ? 70 : L <= 90 ? 58 : 48) - (cover ? 4 : 0); };

const sans = (size, color, extra = {}) => ({ fontFamily: 'Inter', fontWeight: 600, fontSize: size, letterSpacing: size * 0.18, textTransform: 'uppercase', color, ...extra });

function masthead(site, color, dot) {
  return h('div', { alignItems: 'baseline', fontFamily: 'Gelasio', fontWeight: 700, fontSize: 30, color, letterSpacing: -0.5 },
    site.name, h('span', { color: dot }, '.'));
}

function plain({ title, kicker, dek, date, site, home }) {
  return h('div', { width: W, height: H, flexDirection: 'column', justifyContent: 'space-between', background: C.paper, padding: '58px 72px', borderTop: `14px solid ${C.accent}` },
    h('div', { justifyContent: 'space-between', alignItems: 'center' },
      home ? h('div', sans(19, C.tan), 'Sitio personal') : masthead(site, C.ink, C.accent),
      kicker ? h('div', sans(19, C.accent), kicker) : null),
    h('div', { flexDirection: 'column' },
      h('div', { fontFamily: 'Gelasio', fontWeight: 700, fontSize: home ? 104 : titleSize(title), lineHeight: 1.06, letterSpacing: -1.5, color: C.ink, maxWidth: 1040 },
        home ? [title, h('span', { color: C.accent }, '.')] : clip(title, 120)),
      dek ? h('div', { fontFamily: 'Gelasio', fontStyle: 'italic', fontSize: 30, lineHeight: 1.35, color: C.muted, marginTop: 22, maxWidth: 980 }, clip(dek, 140)) : null),
    h('div', { justifyContent: 'space-between', alignItems: 'center', borderTop: `2px solid ${C.rule}`, paddingTop: 22 },
      h('div', sans(17, C.tan), home ? (site.url || '').replace(/^https?:\/\//, '') : `Por ${site.name}`),
      h('div', sans(17, C.tan), home ? 'Blog · Instagram · TikTok' : date || '')));
}

function withCover({ title, kicker, date, site }, img) {
  return h('div', { width: W, height: H, position: 'relative', background: C.ink },
    { type: 'img', props: { src: img, width: W, height: H, style: { position: 'absolute', top: 0, left: 0, width: W, height: H, objectFit: 'cover' } } },
    h('div', { position: 'absolute', top: 0, left: 0, width: W, height: H, backgroundImage: 'linear-gradient(180deg, rgba(20,16,12,.25) 0%, rgba(20,16,12,.15) 35%, rgba(20,16,12,.88) 100%)' }),
    h('div', { position: 'absolute', top: 0, left: 0, width: W, height: H, flexDirection: 'column', justifyContent: 'space-between', padding: '52px 64px' },
      h('div', { justifyContent: 'space-between', alignItems: 'center' },
        masthead(site, '#ffffff', C.soft),
        kicker ? h('div', { ...sans(18, '#ffffff'), background: C.accent, padding: '8px 16px', borderRadius: 4 }, kicker) : null),
      h('div', { flexDirection: 'column' },
        h('div', { fontFamily: 'Gelasio', fontWeight: 700, fontSize: titleSize(title, true), lineHeight: 1.06, letterSpacing: -1.2, color: '#ffffff', maxWidth: 1060 }, clip(title, 120)),
        h('div', { ...sans(17, 'rgba(255,255,255,.8)'), marginTop: 24 }, `Por ${site.name}${date ? '  ·  ' + date : ''}`))));
}

export async function ogImage(opts) {
  let tree;
  if (opts.cover) {
    const buf = await sharp(opts.cover).rotate().resize(W, H, { fit: 'cover', position: 'attention' }).jpeg({ quality: 85 }).toBuffer();
    tree = withCover(opts, `data:image/jpeg;base64,${buf.toString('base64')}`);
  } else {
    tree = plain(opts);
  }
  const svg = await satori(tree, { width: W, height: H, fonts: FONTS });
  return new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng();
}
