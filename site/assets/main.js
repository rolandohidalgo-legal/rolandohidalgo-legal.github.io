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
    var dark = root.getAttribute('data-theme') === 'dark';
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

  // ---------- paleta de comandos: Ctrl K / ⌘K o "/" (todas las páginas) ----------
  // Un buscador al estilo de las herramientas de programación: artículos, secciones y acciones en un solo lugar.
  var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  var modKey = isMac ? '⌘' : 'Ctrl';
  function norm(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function svg(d) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + d + '</svg>'; }
  var IC = {
    search: svg('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>'),
    home: svg('<path d="M4 11.5 12 5l8 6.5"/><path d="M6 10v9h12v-9"/>'),
    user: svg('<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>'),
    pen: svg('<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z"/><path d="M13.5 6.5l4 4"/>'),
    pulse: svg('<path d="M3 12h4l3-7 4 14 3-7h4"/>'),
    doc: svg('<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>'),
    moon: svg('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>'),
    link: svg('<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>'),
    rss: svg('<path d="M5 5a14 14 0 0 1 14 14M5 11a8 8 0 0 1 8 8"/><circle cx="6" cy="18" r="1.2"/>'),
    code: svg('<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>'),
    chat: svg('<path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4l-4.5 1.1Z"/>'),
    out: svg('<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v6H4V6h6"/>'),
  };
  var onHome = !!$('#tabs-bar');
  function go(hash) { return function () { if (onHome && hash) location.hash = hash; else location.href = '/' + (hash ? '#' + hash : ''); }; }
  function openUrl(u) { return function () { if (/^https?:/.test(u)) window.open(u, '_blank', 'noopener'); else location.href = u; }; }
  function isDark() { return root.getAttribute('data-theme') === 'dark'; }

  var cmdItems = null, postsLoaded = false;
  function baseItems() {
    var list = [
      { g: 'Navegación', label: 'Inicio', icon: IC.home, run: go(''), kw: 'portada principal' },
      { g: 'Navegación', label: 'Sobre mí', icon: IC.user, run: go('sobre-mi'), kw: 'quien soy perfil ficha abogado' },
      { g: 'Navegación', label: 'Blog', icon: IC.pen, run: go('blog'), kw: 'articulos entradas' },
      { g: 'Navegación', label: 'Actividad', icon: IC.pulse, run: go('actividad'), kw: 'reciente novedades' },
      btn ? { g: 'Acciones', label: 'Cambiar a tema ' + (isDark() ? 'claro' : 'oscuro'), icon: IC.moon, run: function () { btn.click(); }, kw: 'modo noche dark light apariencia' } : null,
      { g: 'Acciones', label: 'Copiar enlace de esta página', icon: IC.link, run: function () { if (navigator.clipboard) navigator.clipboard.writeText(location.href); }, kw: 'compartir url' },
      { g: 'Acciones', label: 'Suscribirse por RSS', icon: IC.rss, run: openUrl('/feed.xml'), kw: 'feed lector' },
    ].filter(Boolean);
    var wa = $('a[data-wa]');
    if (wa) list.push({ g: 'Contacto', label: 'Escribirme por WhatsApp', icon: IC.chat, run: openUrl(wa.href), kw: 'contacto consulta mensaje' });
    Array.prototype.forEach.call(document.querySelectorAll('.sf-nav a[target="_blank"]:not([data-wa])'), function (a) {
      list.push({ g: 'Contacto', label: a.textContent.trim(), icon: IC.out, run: openUrl(a.href), kw: 'red social' });
    });
    var repo = $('.sf-colophon a');
    if (repo) list.push({ g: 'Acciones', label: 'Ver el código de este sitio', icon: IC.code, run: openUrl(repo.href), kw: 'github fuente colofon' });
    return list;
  }
  function loadPosts() {
    if (postsLoaded) return Promise.resolve();
    postsLoaded = true;
    return getJSON('/blog/posts.json').then(function (posts) {
      (posts || []).forEach(function (p) {
        if (!/^[a-z0-9-]+$/.test(p.slug || '')) return;
        cmdItems.push({ g: 'Artículos', label: p.title, hint: [p.section, fdate(p.date)].filter(Boolean).join(' · '), icon: IC.doc, run: openUrl('/blog/' + p.slug + '/'), kw: (p.summary || '') + ' ' + (p.section || '') });
      });
    });
  }
  function score(it, q) {
    if (!q) return it.g === 'Artículos' ? 1 : 2;
    var l = norm(it.label), k = norm(it.kw + ' ' + (it.hint || '') + ' ' + it.g);
    if (l.indexOf(q) === 0) return 100;
    if ((' ' + l).indexOf(' ' + q) >= 0) return 80;
    if (l.indexOf(q) >= 0) return 60;
    var words = q.split(/\s+/), all = l + ' ' + k;
    if (words.every(function (w) { return all.indexOf(w) >= 0; })) return 40;
    var i = 0; for (var c = 0; c < l.length && i < q.length; c++) if (l[c] === q[i]) i++;
    return i === q.length ? 10 : 0;               // letras en orden: "sbm" encuentra "Sobre mí"
  }

  var dlg = null, qIn, listEl, active = 0, shown = [], lastFocus = null;
  function buildDialog() {
    dlg = el('dialog', 'cmdk');
    dlg.setAttribute('aria-label', 'Buscar y navegar');
    dlg.innerHTML =
      '<div class="cmdk-box">' +
      '<label class="cmdk-search">' + IC.search +
      '<input id="cmdk-q" type="text" role="combobox" aria-expanded="true" aria-controls="cmdk-list" aria-autocomplete="list" autocomplete="off" spellcheck="false" placeholder="Busca un artículo o escribe un comando…">' +
      '<kbd>esc</kbd></label>' +
      '<ul class="cmdk-list" id="cmdk-list" role="listbox" aria-label="Resultados"></ul>' +
      '<div class="cmdk-foot" aria-hidden="true"><span><kbd>↑</kbd><kbd>↓</kbd> moverse</span><span><kbd>↵</kbd> abrir</span><span class="cmdk-brand">' + modKey + ' K</span></div>' +
      '</div>';
    document.body.appendChild(dlg);
    qIn = $('#cmdk-q', dlg); listEl = $('#cmdk-list', dlg);
    if (matchMedia('(max-width: 560px)').matches) qIn.placeholder = 'Buscar en el sitio…';
    qIn.addEventListener('input', function () { active = 0; renderCmd(); });
    qIn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!shown.length) return;
        active = (active + (e.key === 'ArrowDown' ? 1 : -1) + shown.length) % shown.length;
        markActive(true);
      } else if (e.key === 'Enter') {
        e.preventDefault(); runItem(shown[active]);
      }
    });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) closeCmd(); });   // clic fuera de la caja
    dlg.addEventListener('close', function () { root.classList.remove('cmdk-open'); if (lastFocus && lastFocus.focus) lastFocus.focus(); });
  }
  function renderCmd() {
    var q = norm(qIn.value.trim());
    shown = cmdItems.map(function (it, i) { return { it: it, s: score(it, q), i: i }; })
      .filter(function (x) { return x.s > 0; })
      .sort(function (a, b) { return b.s - a.s || a.i - b.i; });
    if (!q) {   // sin texto: secciones, acciones y los artículos más recientes, agrupados
      var order = ['Navegación', 'Artículos', 'Acciones', 'Contacto'], perG = { 'Artículos': 5 };
      shown = order.reduce(function (acc, g) {
        return acc.concat(shown.filter(function (x) { return x.it.g === g; }).slice(0, perG[g] || 99));
      }, []);
    }
    shown = shown.slice(0, 40).map(function (x) { return x.it; });
    listEl.replaceChildren();
    if (!shown.length) {
      var none = el('li', 'cmdk-empty', 'Nada coincide con «' + qIn.value.trim() + '».');
      listEl.appendChild(none); qIn.removeAttribute('aria-activedescendant'); return;
    }
    var lastG = null;
    shown.forEach(function (it, i) {
      if (it.g !== lastG && !q) { var h = el('li', 'cmdk-group', it.g); h.setAttribute('role', 'presentation'); listEl.appendChild(h); lastG = it.g; }
      var li = el('li', 'cmdk-item');
      li.id = 'cmdk-o' + i; li.setAttribute('role', 'option');
      var ic = el('span', 'cmdk-ic'); ic.innerHTML = it.icon || ''; li.appendChild(ic);
      li.appendChild(el('span', 'cmdk-label', it.label));
      if (it.hint) li.appendChild(el('span', 'cmdk-hint', it.hint));
      else if (q) li.appendChild(el('span', 'cmdk-hint', it.g));
      li.addEventListener('mousemove', function () { if (active !== i) { active = i; markActive(false); } });
      li.addEventListener('click', function () { runItem(it); });
      listEl.appendChild(li);
    });
    markActive(false);
  }
  function markActive(scroll) {
    Array.prototype.forEach.call(listEl.querySelectorAll('.cmdk-item'), function (li, i) {
      var on = i === active;
      li.setAttribute('aria-selected', on ? 'true' : 'false');
      if (on) { qIn.setAttribute('aria-activedescendant', li.id); if (scroll) li.scrollIntoView({ block: 'nearest' }); }
    });
  }
  function runItem(it) { if (!it) return; closeCmd(); setTimeout(it.run, 0); }
  function openCmd() {
    if (!dlg) buildDialog();
    if (dlg.open) return;
    lastFocus = document.activeElement;
    cmdItems = baseItems().concat((cmdItems || []).filter(function (x) { return x.g === 'Artículos'; }));
    qIn.value = ''; active = 0;
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    root.classList.add('cmdk-open');
    renderCmd(); qIn.focus();
    loadPosts().then(function () { if (dlg.open) renderCmd(); });
  }
  function closeCmd() { if (dlg && dlg.open) { if (dlg.close) dlg.close(); else { dlg.removeAttribute('open'); root.classList.remove('cmdk-open'); } } }

  addEventListener('keydown', function (e) {
    var k = (e.key || '').toLowerCase();
    if ((e.metaKey || e.ctrlKey) && k === 'k') { e.preventDefault(); if (dlg && dlg.open) closeCmd(); else openCmd(); return; }
    var t = e.target, typing = t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName));
    if (k === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); openCmd(); }
  });
  // Botón "Buscar" junto al del tema
  var tools = $('.topbar .tools');
  if (tools) {
    var sb = el('button', 'kbar-btn'); sb.type = 'button';
    sb.setAttribute('aria-label', 'Buscar y navegar (' + modKey + ' K)');
    sb.innerHTML = IC.search + '<span class="kbar-t">Buscar</span><kbd>' + modKey + ' K</kbd>';
    sb.addEventListener('click', openCmd);
    tools.insertBefore(sb, tools.firstChild);
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-open-cmdk]'), function (b) { b.hidden = false; b.addEventListener('click', openCmd); });
  Array.prototype.forEach.call(document.querySelectorAll('.sf-kbd kbd:first-child'), function (k) { k.textContent = modKey; });

  // Para quien abre la consola del navegador
  try {
    console.log('%cRolando Hidalgo.%c\nAbogado que también programa. ¿Revisando el código?\nEstá abierto: ' + (($('.sf-colophon a') || {}).href || '') + '\nAtajo: ' + modKey + ' K abre la paleta de comandos.',
      'font: 700 22px Georgia, serif; color: #a23c30', 'font: 13px ui-monospace, monospace; color: inherit');
  } catch (e) {}

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

  // Hora local junto a la ciudad, como en la barra de estado de un editor de código
  var clock = $('#clock');
  if (clock) {
    try {
      var tf = new Intl.DateTimeFormat('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: clock.getAttribute('data-tz') || undefined });
      var tickClock = function () { var now = new Date(); clock.textContent = tf.format(now); clock.setAttribute('datetime', now.toISOString()); };
      tickClock(); setInterval(tickClock, 20000);
      clock.parentNode.hidden = false;
    } catch (e) {}
  }

  // Ficha de "Sobre mí": se puede ver como tabla o como JSON
  var facts = $('#facts'), fjson = $('#facts-json'), seg = $('.seg');
  if (facts && fjson && seg) {
    var jesc = function (s) { return JSON.stringify(String(s)).replace(/</g, '\\u003c'); };
    var span = function (cls, html) { return '<span class="' + cls + '">' + html + '</span>'; };
    var pairs = Array.prototype.map.call(facts.querySelectorAll('div'), function (d) {
      return [norm($('dt', d).textContent).replace(/\s+(\w)/g, function (_, c) { return c.toUpperCase(); }), $('dd', d).textContent.trim()];
    });
    var rolesData = [];
    try { rolesData = JSON.parse(($('#typed') || { getAttribute: function () { return '[]'; } }).getAttribute('data-roles') || '[]'); } catch (e) {}
    var lines = pairs.map(function (p) { return '  ' + span('j-k', jesc(p[0])) + span('j-p', ': ') + span('j-s', jesc(p[1])); });
    if (rolesData.length) lines.push('  ' + span('j-k', '"roles"') + span('j-p', ': [') + '\n' + rolesData.map(function (r) { return '    ' + span('j-s', jesc(r)); }).join(span('j-p', ',') + '\n') + '\n  ' + span('j-p', ']'));
    fjson.innerHTML = span('j-c', '// sobre-mi.json') + '\n' + span('j-p', '{') + '\n' + lines.join(span('j-p', ',') + '\n') + '\n' + span('j-p', '}');
    seg.hidden = false;
    Array.prototype.forEach.call(seg.querySelectorAll('button'), function (b) {
      b.addEventListener('click', function () {
        var json = b.dataset.fmt === 'json';
        facts.hidden = json; fjson.hidden = !json;
        Array.prototype.forEach.call(seg.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      });
    });
  }

  // Actividad: un mapa del último año (como el de contribuciones de GitHub), filtros por tipo y la lista
  var actAll = [], actFilter = '';
  var DAY = 864e5;
  function ymd(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  var monthFmt = new Intl.DateTimeFormat('es', { month: 'short' });

  function renderHeat(act) {
    var wrap = $('#heat-wrap'); if (!wrap) return;
    wrap.replaceChildren();
    var byDay = {};
    act.forEach(function (a) { var k = String(a.date || '').slice(0, 10); (byDay[k] = byDay[k] || []).push(a); });
    var today = new Date(); today.setHours(12, 0, 0, 0);
    var weeks = 53;
    // la semana empieza el lunes; la última columna es la semana actual
    var lastMon = new Date(today.getTime() - ((today.getDay() + 6) % 7) * DAY);
    var start = new Date(lastMon.getTime() - (weeks - 1) * 7 * DAY);
    var total = 0, activeDays = 0;
    var head = el('div', 'heat-head');
    var sum = el('p', 'heat-sum');
    head.appendChild(sum);
    var legend = el('p', 'heat-legend'); legend.setAttribute('aria-hidden', 'true');
    legend.appendChild(el('span', null, 'Menos'));
    [0, 1, 2, 3].forEach(function (l) { var c = el('i', 'hc'); c.dataset.l = l; legend.appendChild(c); });
    legend.appendChild(el('span', null, 'Más'));
    head.appendChild(legend);
    wrap.appendChild(head);

    var scroller = el('div', 'heat-scroll');
    var grid = el('div', 'heat');
    grid.style.setProperty('--weeks', weeks);
    var months = el('div', 'heat-months'); months.setAttribute('aria-hidden', 'true');
    months.style.setProperty('--weeks', weeks);
    var prevM = -1;
    for (var w = 0; w < weeks; w++) {
      var col = el('div', 'hw');
      var monday = new Date(start.getTime() + w * 7 * DAY);
      if (monday.getMonth() !== prevM) {
        var ml = el('span', null, monthFmt.format(monday).replace('.', ''));
        ml.style.gridColumn = (w + 1) + ' / span 3';
        if (w < weeks - 2) months.appendChild(ml);
        prevM = monday.getMonth();
      }
      for (var d = 0; d < 7; d++) {
        var day = new Date(monday.getTime() + d * DAY);
        var c = el('i', 'hc');
        if (day > today) { c.className = 'hc future'; col.appendChild(c); continue; }
        var items = byDay[ymd(day)] || [];
        var n = items.length;
        total += n; if (n) activeDays++;
        c.dataset.l = Math.min(n, 3);
        if (n) {
          c.title = fdate(ymd(day)) + ' · ' + items.map(function (a) { return a.type || 'Nota'; }).join(', ');
          c.addEventListener('click', (function (k) { return function () { var r = document.querySelector('.row[data-date="' + k + '"]'); if (r) { r.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' }); r.classList.remove('flash'); void r.offsetWidth; r.classList.add('flash'); } }; })(ymd(day)));
        }
        col.appendChild(c);
      }
      grid.appendChild(col);
    }
    var lbl = total + (total === 1 ? ' registro' : ' registros') + ' en el último año' + (actFilter ? ' (' + actFilter + ')' : '');
    grid.setAttribute('role', 'img');
    grid.setAttribute('aria-label', 'Mapa de actividad: ' + lbl + ', en ' + activeDays + ' días distintos.');
    sum.innerHTML = '';
    sum.appendChild(el('strong', null, String(total)));
    sum.appendChild(document.createTextNode(' ' + lbl.replace(/^\d+ /, '')));
    var inner = el('div', 'heat-inner'); inner.appendChild(months); inner.appendChild(grid);
    scroller.appendChild(inner);
    wrap.appendChild(scroller);
  }

  function renderFilters(act) {
    var box = $('#filters'); if (!box) return;
    box.replaceChildren();
    if (!act.length) return;
    var counts = {};
    act.forEach(function (a) { var t = a.type || 'Nota'; counts[t] = (counts[t] || 0) + 1; });
    var types = [''].concat(Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a] || a.localeCompare(b); }));
    types.forEach(function (t) {
      var b = el('button', 'filter');
      b.type = 'button';
      b.setAttribute('aria-pressed', t === actFilter ? 'true' : 'false');
      b.appendChild(document.createTextNode(t || 'Todo'));
      b.appendChild(el('span', 'filter-n', String(t ? counts[t] : act.length)));
      b.addEventListener('click', function () { actFilter = t; renderActivityAll(); });
      box.appendChild(b);
    });
  }
  function renderActivityAll() {
    var list = actFilter ? actAll.filter(function (a) { return (a.type || 'Nota') === actFilter; }) : actAll;
    renderHeat(list);
    renderFilters(actAll);
    renderActivity(list);
  }

  Promise.all([getJSON('data/activity.json'), getJSON('blog/posts.json')])
    .then(function (r) {
      var act = r[0] || [], posts = (r[1] || []).filter(function (p) { return /^[a-z0-9-]+$/.test(p.slug || ''); });
      var byDate = function (a) { a.sort(function (x, y) { return String(y.date).localeCompare(String(x.date)); }); };
      byDate(act); byDate(posts);
      renderPosts(posts);
      actAll = act;
      renderActivityAll();
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
    if (!act.length) { box.appendChild(el('p', 'empty', actFilter ? 'Nada de este tipo todavía.' : 'Aquí aparecerá mi actividad reciente.')); return; }
    act.slice(0, 24).forEach(function (a, i) {
      var row = el('div', 'row'); row.style.setProperty('--i', Math.min(i, 10));
      row.dataset.date = String(a.date || '').slice(0, 10);
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
