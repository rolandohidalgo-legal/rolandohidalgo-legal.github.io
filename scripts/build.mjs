// Arma el sitio publicable en _site/ a partir de:
//   site/            páginas, estilos, datos (Instagram, TikTok, actividad) e imágenes subidas
//   content/blog/    un .md por artículo, con sus datos arriba (título, bajada, sección…)
// Por cada artículo genera una página real (blog/<slug>/) con las etiquetas que leen
// WhatsApp, LinkedIn, X y Facebook, y su imagen para redes (og/<slug>.png).
// Lo corre GitHub Actions en cada cambio; en local: npm run build.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { marked } from 'marked';
import sharp from 'sharp';
import { ogImage } from './og.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'site');
const OUT = path.join(ROOT, '_site');
const POSTS_DIR = path.join(ROOT, 'content', 'blog');

const site = JSON.parse(fs.readFileSync(path.join(SRC, 'data', 'site.json'), 'utf8'));
const BASE = String(site.url || '').replace(/\/$/, '');

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const isoDate = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d || '').slice(0, 10));
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const longDate = (s) => { const [y, m, d] = s.split('-').map(Number); return y ? `${d} de ${MONTHS[m - 1]} de ${y}` : ''; };
const abs = (p) => (/^https?:\/\//.test(p) ? p : BASE + (p.startsWith('/') ? p : '/' + p));

// ---------- 1. copia lo estático ----------
fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(SRC, OUT, { recursive: true });
for (const d of ['blog', 'og', 'images/_c']) fs.mkdirSync(path.join(OUT, d), { recursive: true });

// ---------- 2. lee los artículos ----------
const posts = fs.existsSync(POSTS_DIR) ? fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md')).map((file) => {
  const { data, content } = matter(fs.readFileSync(path.join(POSTS_DIR, file), 'utf8'));
  const slug = String(data.slug || file.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, ''))
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const words = content.split(/\s+/).filter(Boolean).length;
  return {
    file, slug, body: content,
    title: String(data.title || slug),
    dek: String(data.dek || ''),
    section: String(data.section || 'Blog'),
    date: isoDate(data.date) || isoDate(fs.statSync(path.join(POSTS_DIR, file)).mtime),
    cover: String(data.cover || ''),
    caption: String(data.cover_caption || ''),
    sample: !!data.sample,
    draft: !!data.draft,
    minutes: Math.max(1, Math.round(words / 220)),
  };
}).filter((p) => !p.draft).sort((a, b) => b.date.localeCompare(a.date)) : [];

// Portada del artículo: la imagen subida se reduce a un tamaño de web y se guarda aparte
async function coverFor(p) {
  if (!p.cover) return null;
  const src = path.join(SRC, p.cover.replace(/^\//, ''));
  if (!fs.existsSync(src)) { console.warn(`⚠ ${p.file}: no encuentro la portada ${p.cover}`); return null; }
  const rel = `/images/_c/${p.slug}.jpg`;
  await sharp(src).rotate().resize({ width: 1600, withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(OUT, rel));
  return { rel, src };
}

// ---------- 3. página de cada artículo ----------
const ICON = '<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27%3E%3Crect width=%2732%27 height=%2732%27 rx=%278%27 fill=%27%2326231e%27/%3E%3Ctext x=%2715%27 y=%2723%27 font-size=%2722%27 font-family=%27Georgia,serif%27 font-weight=%27700%27 fill=%27%23ffffff%27 text-anchor=%27middle%27%3ER%3C/text%3E%3Ccircle cx=%2725%27 cy=%2723%27 r=%272.6%27 fill=%27%23e0806e%27/%3E%3C/svg%3E">';
const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gelasio:ital,wght@0,400;0,700;1,400&display=swap">';
const THEME_BTN = '<button class="theme" id="theme" type="button" aria-label="Cambiar tema claro u oscuro"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></button>';

function socialMeta({ title, description, url, image, type, date, section }) {
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}">`,
    `<link rel="canonical" href="${esc(url)}">`,
    `<meta property="og:site_name" content="${esc(site.name)}">`,
    `<meta property="og:locale" content="es_EC">`,
    `<meta property="og:type" content="${type}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:url" content="${esc(url)}">`,
    `<meta property="og:image" content="${esc(image)}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${esc(title)}">`,
    date ? `<meta property="article:published_time" content="${date}">` : '',
    date ? `<meta property="article:author" content="${esc(site.name)}">` : '',
    section ? `<meta property="article:section" content="${esc(section)}">` : '',
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(description)}">`,
    `<meta name="twitter:image" content="${esc(image)}">`,
    `<link rel="alternate" type="application/rss+xml" title="${esc(site.name)}" href="${BASE}/feed.xml">`,
  ].filter(Boolean).join('\n');
}

const SHARE_ICONS = {
  whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.4-.3Z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.5h4v11H3v-11Zm7 0h3.8v1.6h.1a4.2 4.2 0 0 1 3.8-2c4 0 4.8 2.6 4.8 6v5.4h-4v-4.8c0-1.2 0-2.6-1.6-2.6s-1.9 1.2-1.9 2.5v4.9h-4v-11Z"/></svg>',
  x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.3L5.3 21H2.2l7.2-8.3L1.8 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 21v-7.5H16l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4a21 21 0 0 0-2.3-.1c-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.4V21h3.1Z"/></svg>',
  link: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>',
};

function shareBar(p, url) {
  const u = encodeURIComponent(url), t = encodeURIComponent(p.title);
  const a = (k, href, label) => `<a class="share-btn" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="Compartir en ${label}">${SHARE_ICONS[k]}</a>`;
  return `<div class="share" aria-label="Compartir">
  <span class="eyebrow">Compartir</span>
  ${a('whatsapp', `https://wa.me/?text=${t}%20${u}`, 'WhatsApp')}
  ${a('linkedin', `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, 'LinkedIn')}
  ${a('x', `https://twitter.com/intent/tweet?text=${t}&url=${u}`, 'X')}
  ${a('facebook', `https://www.facebook.com/sharer/sharer.php?u=${u}`, 'Facebook')}
  <button class="share-btn" type="button" data-copy="${esc(url)}" aria-label="Copiar enlace">${SHARE_ICONS.link}</button>
</div>`;
}

function articlePage(p, cover, more) {
  const url = `${BASE}/blog/${p.slug}/`;
  const description = p.dek || p.body.replace(/[#>*_`\[\]()-]/g, '').trim().slice(0, 180);
  const ld = {
    '@context': 'https://schema.org', '@type': 'BlogPosting',
    headline: p.title, description, datePublished: p.date, dateModified: p.date,
    image: [`${BASE}/og/${p.slug}.png`], articleSection: p.section, inLanguage: 'es',
    mainEntityOfPage: url,
    author: { '@type': 'Person', name: site.name, url: BASE + '/' },
  };
  const moreHtml = more.length ? `<aside class="more">
  <p class="eyebrow">Seguir leyendo</p>
  ${more.map((m) => `<a class="more-item" href="/blog/${m.slug}/"><span class="kicker">${esc(m.section)}</span><span class="more-title">${esc(m.title)}</span></a>`).join('\n  ')}
</aside>` : '';
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#ffffff">
${socialMeta({ title: p.title, description, url, image: `${BASE}/og/${p.slug}.png`, type: 'article', date: p.date, section: p.section })}
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
${ICON}
${FONTS}
<link rel="stylesheet" href="/assets/style.css">
</head>
<body class="reading">
<div class="progress" id="progress" aria-hidden="true"></div>
<div class="col">
  <div class="topbar">
    <a class="label" href="/#blog">← ${esc(site.name)}</a>
    ${THEME_BTN}
  </div>
</div>
<article class="story">
  <header class="col story-head">
    <p class="kicker">${esc(p.section)}${p.sample ? ' <span class="chip">Ejemplo</span>' : ''}</p>
    <h1>${esc(p.title)}</h1>
    ${p.dek ? `<p class="dek">${esc(p.dek)}</p>` : ''}
    <div class="byline">
      <span class="by">Por <strong>${esc(site.name)}</strong></span>
      <time datetime="${p.date}">${longDate(p.date)}</time>
      <span>${p.minutes} min de lectura</span>
    </div>
  </header>
  ${cover ? `<figure class="cover"><img src="${cover.rel}" alt="${esc(p.caption || p.title)}" width="1600">${p.caption ? `<figcaption class="col">${esc(p.caption)}</figcaption>` : ''}</figure>` : ''}
  <div class="col">
    <div class="md">
${marked.parse(p.body)}
    </div>
    ${shareBar(p, url)}
    <div class="author">
      <div class="avatar" aria-hidden="true">${esc(site.name.charAt(0))}<span>.</span></div>
      <div><p class="author-name">${esc(site.name)}</p><p class="author-bio">${esc(site.bio || '')}</p></div>
    </div>
    ${moreHtml}
    <div class="foot-note">
      <span>${esc(site.name)} · <span id="year">${new Date().getFullYear()}</span></span>
      <a href="/feed.xml">RSS</a>
    </div>
  </div>
</article>
<script src="/assets/main.js"></script>
<script src="/assets/article.js"></script>
</body>
</html>
`;
}

const index = [];
for (const p of posts) {
  const cover = await coverFor(p);
  const more = posts.filter((x) => x !== p).slice(0, 3);
  fs.mkdirSync(path.join(OUT, 'blog', p.slug), { recursive: true });
  fs.writeFileSync(path.join(OUT, 'blog', p.slug, 'index.html'), articlePage(p, cover, more));
  fs.writeFileSync(path.join(OUT, 'og', `${p.slug}.png`), await ogImage({ title: p.title, kicker: p.section, dek: p.dek, date: longDate(p.date), cover: cover?.src, site }));
  index.push({ slug: p.slug, url: `/blog/${p.slug}/`, title: p.title, summary: p.dek, section: p.section, date: p.date, minutes: p.minutes, cover: cover?.rel || '', sample: p.sample });
  console.log(`✓ ${p.slug}`);
}
fs.writeFileSync(path.join(OUT, 'blog', 'posts.json'), JSON.stringify(index, null, 2));

// ---------- 4. portada: etiquetas para redes ----------
fs.writeFileSync(path.join(OUT, 'og', 'home.png'), await ogImage({ title: site.name, kicker: site.role || '', dek: site.bio || '', site, home: true }));
const roles = (site.roles || []).map(String).filter(Boolean);
const rolesHtml = roles.length
  ? `<p class="roles"><span class="sr-only">${esc(roles.join(', '))}</span><span class="typed" id="typed" aria-hidden="true" data-roles="${esc(JSON.stringify(roles))}">${esc(roles[0])}</span><span class="caret" aria-hidden="true"></span></p>`
  : '';
const home = fs.readFileSync(path.join(OUT, 'index.html'), 'utf8')
  .replace('<!--ROLES-->', rolesHtml)
  .replace('<!--TAGLINE-->', esc(site.tagline || site.bio || ''))
  .replace('<!--META-->',
  socialMeta({ title: site.name, description: site.description || '', url: BASE + '/', image: `${BASE}/og/home.png`, type: 'website' }));
fs.writeFileSync(path.join(OUT, 'index.html'), home);

// ---------- 5. RSS, mapa del sitio y robots ----------
const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${esc(site.name)}</title>
<link>${BASE}/</link>
<description>${esc(site.description || '')}</description>
<language>es</language>
<atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml"/>
${posts.map((p) => `<item><title>${esc(p.title)}</title><link>${BASE}/blog/${p.slug}/</link><guid>${BASE}/blog/${p.slug}/</guid><pubDate>${new Date(p.date + 'T12:00:00Z').toUTCString()}</pubDate><description>${esc(p.dek)}</description></item>`).join('\n')}
</channel>
</rss>
`;
fs.writeFileSync(path.join(OUT, 'feed.xml'), rss);
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>${BASE}/</loc></url>
${posts.map((p) => `<url><loc>${BASE}/blog/${p.slug}/</loc><lastmod>${p.date}</lastmod></url>`).join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${BASE}/sitemap.xml\n`);
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
console.log(`Listo: ${posts.length} artículo(s) en _site/`);
