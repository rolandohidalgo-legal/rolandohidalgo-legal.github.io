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
