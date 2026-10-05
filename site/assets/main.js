(function () {
  var root = document.documentElement;

  function $(s, c) { return (c || document).querySelector(s); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function getJSON(path) {
    return fetch(path, { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .catch(function () { return null; });
  }
  var fmt = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' });
  function fdate(s) {
    var p = String(s || '').split('-');
    if (p.length !== 3) return '';
    return fmt.format(new Date(+p[0], +p[1] - 1, +p[2])).replace('.', '');
  }
  // Solo enlaces seguros: https, mailto, anclas o rutas del propio sitio
  function safeUrl(u) {
    u = String(u || '');
    return /^(https:\/\/|mailto:|#|[a-z0-9_\-\/.]+(#[\w-]+)?$)/i.test(u) ? u : '';
  }

  // ---------- tema y año (todas las páginas) ----------
  var key = 'theme';
  try { var saved = localStorage.getItem(key); if (saved) root.setAttribute('data-theme', saved); } catch (e) {}
  var btn = $('#theme');
  if (btn) btn.addEventListener('click', function () {
    var dark = root.getAttribute('data-theme') === 'dark' ||
      (!root.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
    var next = dark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem(key, next); } catch (e) {}
  });
  var year = $('#year'); if (year) year.textContent = new Date().getFullYear();

  // ---------- portada ----------
  if (!$('#tabs-bar')) return;
  var all = $('#all');

  var TT_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 3v11.2a3.7 3.7 0 1 1-3.7-3.7"/><path d="M14.5 3c.3 2.4 1.9 4.2 4.5 4.4"/></svg>';
  var SOURCES = [
    { key: 'instagram', label: 'Instagram', file: 'data/instagram.json', icon: null, grid: '#grid-instagram', follow: '#ig-follow', profile: function (h) { return 'https://www.instagram.com/' + h + '/'; } },
    { key: 'tiktok', label: 'TikTok', file: 'data/tiktok.json', icon: TT_ICON, grid: '#grid-tiktok', follow: '#tt-follow', profile: function (h) { return 'https://www.tiktok.com/@' + h; } }
  ];
  var IG_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/></svg>';

  SOURCES[0].icon = IG_ICON;

  // Navegación con casillas tipo tabla periódica. Al pasar el puntero se muestra la descripción
  // de la sección; al hacer clic cambia el contenido. La URL (#blog, #instagram…) recuerda la elección.
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab[data-view]'));
  var hint = $('#hint'), views = {}, current = null, selected = tabs[0], capT = null;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sentinel = $('#tabs-sentinel'), tbar = $('#tabs-bar');
  tabs.forEach(function (t) { views[t.dataset.view] = document.getElementById('v-' + t.dataset.view); });

  // Al bajar, la barra queda fija arriba en versión compacta (solo las dos letras)
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) {
      tbar.classList.toggle('stuck', !e[0].isIntersecting && e[0].boundingClientRect.top < 0);
    }).observe(sentinel);
  }

  function setCaption(text) {
    if (!hint || hint.textContent === text) return;
    clearTimeout(capT);
    hint.classList.add('swap');
    capT = setTimeout(function () { hint.textContent = text; hint.classList.remove('swap'); }, reduced ? 0 : 140);
  }
  Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (t) {
    t.addEventListener('pointerenter', function () { setCaption(t.dataset.caption); });
    t.addEventListener('focus', function () { setCaption(t.dataset.caption); });
    if (!t.dataset.view) return;                      // WhatsApp: enlace externo, sin vista propia
    t.addEventListener('click', function (e) {
      e.preventDefault();
      if (location.hash === '#' + t.dataset.view) show(t.dataset.view, true);
      else location.hash = t.dataset.view;
    });
  });
  var navEl = $('.tabs');
  if (navEl) navEl.addEventListener('pointerleave', function () { setCaption(selected.dataset.caption); });

  function show(id, scroll) {
    if (!views[id]) id = tabs[0].dataset.view;
    if (id === current) { if (scroll) toBar(); return; }
    current = id;
    tabs.forEach(function (t) {
      var on = t.dataset.view === id;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      if (on) selected = t;
    });
    setCaption(selected.dataset.caption);
    Object.keys(views).forEach(function (k) {
      var v = views[k]; if (!v) return;
      var on = k === id;
      v.hidden = !on;
      v.classList.remove('show');
      if (on) { void v.offsetWidth; v.classList.add('show'); }
    });
    if (scroll) toBar();
  }
  function toBar() {
    var start = sentinel.getBoundingClientRect().top + window.scrollY;
    if (window.scrollY > start) window.scrollTo({ top: start, behavior: reduced ? 'auto' : 'smooth' });
  }
  function fromHash() { return decodeURIComponent(location.hash.slice(1)) || tabs[0].dataset.view; }
  window.addEventListener('hashchange', function () { show(fromHash(), true); });
  show(fromHash(), false);
  if (hint) hint.textContent = selected.dataset.caption;

  // Roles que se escriben y se borran bajo el nombre, como en una máquina de escribir
  var typed = $('#typed');
  if (typed) {
    var roles = [];
    try { roles = JSON.parse(typed.getAttribute('data-roles') || '[]'); } catch (e) {}
    // Con "reducir movimiento" activado en el sistema, los roles se reemplazan sin efecto de escritura
    if (roles.length > 1 && reduced) {
      var rj = 0;
      setInterval(function () { rj = (rj + 1) % roles.length; typed.textContent = roles[rj]; }, 3000);
    } else if (roles.length > 1) {
      var ri = 0, ci = roles[0].length, del = true;
      var tick = function () {
        var word = roles[ri];
        if (del) {
          ci--;
          if (ci <= 0) { del = false; ri = (ri + 1) % roles.length; ci = 0; }
        } else {
          ci++;
          if (ci >= roles[ri].length) { typed.textContent = roles[ri]; del = true; return setTimeout(tick, 2200); }
        }
        typed.textContent = roles[ri].slice(0, ci) || '​';
        setTimeout(tick, del ? 38 : 75 + Math.random() * 45);
      };
      setTimeout(tick, 2600);
    }
  }

  Promise.all([getJSON('data/site.json'), getJSON('data/activity.json'), getJSON('blog/posts.json')].concat(SOURCES.map(function (src) { return getJSON(src.file); })))
    .then(function (r) {
      var site = r[0] || {}, act = r[1] || [], posts = (r[2] || []).filter(function (p) { return /^[a-z0-9-]+$/.test(p.slug || ''); });
      var byDate = function (a) { a.sort(function (x, y) { return String(y.date).localeCompare(String(x.date)); }); };
      byDate(act); byDate(posts);
      var social = [];
      SOURCES.forEach(function (src, i) {
        var list = r[3 + i] || []; byDate(list);
        list.forEach(function (it) { social.push({ src: src, v: it }); });
        renderGrid(src, list);
      });
      renderSite(site);
      renderFeed(posts, social);
      renderPosts(posts);
      renderActivity(act);
    });

  function handleOf(site, key) { return String(site[key] || '').replace(/[^\w.]/g, ''); }

  function renderSite(site) {
    var items = [];
    SOURCES.forEach(function (src) {
      var h = handleOf(site, src.key);
      var f = $(src.follow);
      if (h) {
        if (f) { f.href = src.profile(h); f.textContent = 'Seguir a @' + h; f.hidden = false; }
        items.push({ label: src.label, url: src.profile(h) });
      }
    });
    (site.links || []).forEach(function (l) { if (l && l.label && /^https:\/\//.test(l.url || '')) items.push(l); });
    var box = $('#socials');
    if (box) items.forEach(function (l) {
      box.appendChild(el('span', 'sep', '·'));
      var a = el('a', null, l.label); a.href = l.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
      box.appendChild(a);
    });
  }

  function meta(kind, date, extra, sample) {
    var m = el('p', 'meta');
    m.appendChild(el('span', 'kind', kind));
    if (date) m.appendChild(el('span', null, fdate(date)));
    if (extra) m.appendChild(el('span', null, extra));
    if (sample) m.appendChild(el('span', 'chip', 'Ejemplo'));
    return m;
  }

  function blogItem(p, i, lead) {
    var a = el('a', 'item blog' + (lead ? ' lead' : ''));
    a.href = safeUrl(p.url) || '/blog/' + p.slug + '/';
    a.style.setProperty('--i', Math.min(i, 8));
    var cover = safeUrl(p.cover);
    if (lead && cover) { var fig = el('div', 'lead-cover'); var im = el('img'); im.src = cover; im.alt = ''; fig.appendChild(im); a.appendChild(fig); }
    a.appendChild(meta(p.section || 'Blog', p.date, p.minutes ? p.minutes + ' min de lectura' : '', p.sample));
    a.appendChild(el('h3', null, p.title));
    if (p.summary) a.appendChild(el('p', 'sum', p.summary));
    a.appendChild(el('span', 'go', 'Leer artículo'));
    return a;
  }

  function socialItem(src, it, i) {
    var url = safeUrl(it.url), img = safeUrl(it.image);
    var n = url ? el('a', 'item ig') : el('div', 'item ig');
    if (url) { n.href = url; n.target = '_blank'; n.rel = 'noopener noreferrer'; }
    n.style.setProperty('--i', Math.min(i, 8));
    var text = el('div');
    text.appendChild(meta(src.label, it.date, '', it.sample));
    text.appendChild(el('p', 'cap', it.caption || ''));
    n.appendChild(text);
    var th = el('div', 'thumb');
    if (img) { var im = el('img'); im.src = img; im.alt = ''; im.loading = 'lazy'; th.appendChild(im); }
    else th.innerHTML = src.icon;
    n.appendChild(th);
    return n;
  }

  // "Todo": entradas del blog y publicaciones de todas las redes, mezcladas por fecha
  function renderFeed(posts, social) {
    if (!all) return;
    all.replaceChildren();
    var items = posts.map(function (p) { return { t: 'blog', d: p.date, v: p }; })
      .concat(social.map(function (x) { return { t: 'social', d: x.v.date, v: x.v, src: x.src }; }));
    items.sort(function (a, b) { return String(b.d).localeCompare(String(a.d)); });
    if (!items.length) { all.appendChild(el('p', 'empty', 'Aquí aparecerán mis entradas y publicaciones.')); return; }
    items.forEach(function (it, i) {
      all.appendChild(it.t === 'blog' ? blogItem(it.v, i, i === 0) : socialItem(it.src, it.v, i));
    });
  }

  function renderPosts(posts) {
    var box = $('#posts'); box.replaceChildren();
    if (!posts.length) { box.appendChild(el('p', 'empty', 'Aquí aparecerán mis entradas del blog.')); return; }
    posts.forEach(function (p, i) { box.appendChild(blogItem(p, i, false)); });
  }

  function renderGrid(src, list) {
    var box = $(src.grid); if (!box) return;
    box.replaceChildren();
    if (!list.length) { box.appendChild(el('p', 'empty', 'Aquí aparecerán mis publicaciones de ' + src.label + '.')); return; }
    list.forEach(function (it, i) {
      var url = safeUrl(it.url), img = safeUrl(it.image);
      var t = url ? el('a', 'tile') : el('div', 'tile');
      if (url) { t.href = url; t.target = '_blank'; t.rel = 'noopener noreferrer'; }
      t.style.setProperty('--i', Math.min(i, 10));
      if (img) { t.classList.add('has-img'); var im = el('img'); im.src = img; im.alt = ''; im.loading = 'lazy'; t.appendChild(im); }
      var top = el('div', 'top'); if (it.sample) top.appendChild(el('span', 'chip', 'Ejemplo'));
      t.appendChild(top);
      t.appendChild(el('p', 'cap', it.caption || ''));
      var foot = el('div', 'foot');
      foot.appendChild(el('span', null, fdate(it.date)));
      if (url) foot.appendChild(el('span', null, 'Ver ↗'));
      t.appendChild(foot);
      box.appendChild(t);
    });
  }

  function renderActivity(act) {
    var box = $('#activity'); box.replaceChildren();
    if (!act.length) { box.appendChild(el('p', 'empty', 'Aquí aparecerá mi actividad reciente.')); return; }
    act.slice(0, 12).forEach(function (a, i) {
      var row = el('div', 'row'); row.style.setProperty('--i', Math.min(i, 10));
      var time = el('time', null, fdate(a.date)); time.setAttribute('datetime', a.date);
      row.appendChild(time);
      var p = el('p');
      p.appendChild(el('span', 'kind', a.type || 'Nota'));
      p.appendChild(document.createTextNode(a.text || ''));
      var u = safeUrl(a.url);
      if (u) { var l = el('a', 'go', 'Ver'); l.href = u; if (/^https:/.test(u)) { l.target = '_blank'; l.rel = 'noopener noreferrer'; } p.appendChild(l); }
      row.appendChild(p);
      box.appendChild(row);
    });
  }
})();
