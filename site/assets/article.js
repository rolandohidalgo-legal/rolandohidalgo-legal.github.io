// Página de artículo: barra de progreso de lectura y botón "copiar enlace".
(function () {
  var bar = document.getElementById('progress');
  if (bar) {
    var tick = function () {
      var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, h.scrollTop / max) : 0) + ')';
    };
    addEventListener('scroll', tick, { passive: true }); addEventListener('resize', tick); tick();
  }
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var url = b.getAttribute('data-copy');
      if (navigator.share && matchMedia('(pointer: coarse)').matches) { navigator.share({ title: document.title, url: url }).catch(function () {}); return; }
      navigator.clipboard.writeText(url).then(function () {
        b.classList.add('ok'); b.setAttribute('aria-label', 'Enlace copiado');
        setTimeout(function () { b.classList.remove('ok'); b.setAttribute('aria-label', 'Copiar enlace'); }, 1800);
      });
    });
  });
})();

// Notas al margen, índice que sigue la lectura y "Cómo citar".
(function () {
  var wide = matchMedia('(min-width: 1180px)');

  // ---- notas: en pantalla ancha viven en el margen derecho; en el celular se abren bajo el párrafo ----
  var notes = Array.prototype.slice.call(document.querySelectorAll('.md .sidenote'));
  function place() {
    var prevBottom = -Infinity;
    notes.forEach(function (n) {
      n.style.marginTop = '';
      if (!wide.matches) return;
      var top = n.getBoundingClientRect().top + window.scrollY;
      if (top < prevBottom + 14) n.style.marginTop = (prevBottom + 14 - top) + 'px';   // que no se encimen
      prevBottom = n.getBoundingClientRect().bottom + window.scrollY;
    });
  }
  if (notes.length) {
    place();
    addEventListener('resize', place);
    if (wide.addEventListener) wide.addEventListener('change', place);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    addEventListener('load', place);
  }
  document.querySelectorAll('.fn-ref').forEach(function (b) {
    b.addEventListener('click', function () {
      var fn = b.parentNode, note = fn.querySelector('.sidenote');
      if (wide.matches) {                     // ancho: resalta la nota del margen
        note.classList.remove('flash'); void note.offsetWidth; note.classList.add('flash');
        return;
      }
      var open = fn.classList.toggle('open');
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  // ---- índice: marca la sección que se está leyendo ----
  var links = Array.prototype.slice.call(document.querySelectorAll('.toc a'));
  if (links.length) {
    var heads = links.map(function (a) { return document.getElementById(decodeURIComponent(a.hash.slice(1))); }).filter(Boolean);
    var spy = function () {
      var y = window.innerHeight * 0.3, cur = -1;
      heads.forEach(function (h, i) { if (h.getBoundingClientRect().top < y) cur = i; });
      links.forEach(function (a, i) { if (i === cur) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    };
    var t = false;
    addEventListener('scroll', function () { if (t) return; t = true; requestAnimationFrame(function () { t = false; spy(); }); }, { passive: true });
    spy();
  }

  // ---- copiar la cita ----
  document.querySelectorAll('[data-cite]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(b.getAttribute('data-cite')).then(function () {
        var t = b.textContent; b.textContent = 'Cita copiada'; b.classList.add('ok');
        setTimeout(function () { b.textContent = t; b.classList.remove('ok'); }, 1800);
      });
    });
  });
})();
