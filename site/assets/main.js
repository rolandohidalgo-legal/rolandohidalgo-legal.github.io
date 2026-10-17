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

  // ---------- títulos que ganan contraste al avanzar (todas las páginas) ----------
  // Cada palabra pasa de gris pálido a tinta plena según la posición del texto en la pantalla.
  // Se aplica a los elementos con [data-reveal] y a los subtítulos (h2) de los artículos.
  var rvItems = [];
  var rvMotion = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  function rvPrepare(node) {
    if (node.children.length || node.dataset.rv) return;       // solo texto plano
    var text = node.textContent.trim().replace(/\s+/g, ' ');
    if (!text) return;
    node.dataset.rv = '1';
    var words = text.split(' ');
    var vis = el('span', 'rv'); vis.setAttribute('aria-hidden', 'true');
    var spans = words.map(function (w, i) {
      var s = el('span', 'rv-w', w);
      vis.appendChild(s);
      if (i < words.length - 1) vis.appendChild(document.createTextNode(' '));
      return s;
    });
    node.textContent = '';
    node.appendChild(el('span', 'sr-only', text));
    node.appendChild(vis);
    rvItems.push({ node: node, spans: spans });
  }
  function rvUpdate() {
    var vh = window.innerHeight, from = vh * 0.92, to = vh * 0.38;
    rvItems.forEach(function (it) {
      var r = it.node.getBoundingClientRect();
      if (!r.height) return;                                    // oculto (otra pestaña)
      var p = Math.max(0, Math.min(1, (from - r.top) / (from - to)));
      var n = it.spans.length, span = n + 3;                    // las últimas palabras llegan juntas al final
      it.spans.forEach(function (s, i) {
        var t = Math.max(0, Math.min(1, p * span - i));
        s.style.opacity = (0.16 + 0.84 * t).toFixed(3);
      });
    });
  }
  var rvTick = false;
  function rvSchedule() {
    if (rvTick) return; rvTick = true;
    requestAnimationFrame(function () { rvTick = false; rvUpdate(); });
  }
  if (rvMotion) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-reveal], .md h2'), rvPrepare);
    if (rvItems.length) {
      addEventListener('scroll', rvSchedule, { passive: true });
      addEventListener('resize', rvSchedule);
      addEventListener('reveal:update', rvSchedule);
      rvUpdate();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(rvUpdate);
    }
  }

  // ---------- portada ----------
  if (!$('#tabs-bar')) return;
  // Navegación en píldoras. Al pasar el puntero el texto da paso al ícono y se muestra la descripción
  // de la sección; al hacer clic cambia el contenido. La URL (#blog, #actividad…) recuerda la elección.
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
    dispatchEvent(new Event('reveal:update'));
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

  Promise.all([getJSON('data/activity.json'), getJSON('blog/posts.json')])
    .then(function (r) {
      var act = r[0] || [], posts = (r[1] || []).filter(function (p) { return /^[a-z0-9-]+$/.test(p.slug || ''); });
      var byDate = function (a) { a.sort(function (x, y) { return String(y.date).localeCompare(String(x.date)); }); };
      byDate(act); byDate(posts);
      renderPosts(posts);
      renderActivity(act);
    });

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

  function renderPosts(posts) {
    var box = $('#posts'); box.replaceChildren();
    if (!posts.length) { box.appendChild(el('p', 'empty', 'Aquí aparecerán mis entradas del blog.')); return; }
    posts.forEach(function (p, i) { box.appendChild(blogItem(p, i, false)); });
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
