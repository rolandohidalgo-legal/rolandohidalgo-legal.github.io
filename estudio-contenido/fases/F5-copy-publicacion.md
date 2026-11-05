# F5 · Copy y publicación

**Objetivo:** de un render aprobado a publicaciones programadas en todas las redes, con copy adaptado,
UTM, código de WhatsApp y registro en el catálogo.
**Prerrequisitos:** F3, F4. Cuentas de F0.4 conectadas.
**Lee antes:** `specs/copy-y-publicacion.md`, `specs/contratos-de-datos.md` §1, §8, `data/contexto/marca-y-voz.md`, `data/contexto/audiencia.md`.

## Tareas

### F5.1 Copy — skill `copy-redes`, agente `copywriter`
- `copy.json` según la spec §1, usando el transcript **final** (lo que se dijo) y el vocabulario de la audiencia.
- Portada: proponer 3 frames candidatos (rostro con expresión clara + espacio para texto); render de
  portada con `npx remotion still` y el texto del hook.
- `marketing:brand-review` como último paso.
- **Aceptación:** límites de caracteres por red validados por `tools/publicar/copy.py validar`; Rolando aprueba 3 copys seguidos con ≤ 1 cambio menor.

### F5.2 R2 y adaptadores
- `tools/publicar/r2.py subir <mp4>` → URL temporal.
- Adaptadores `upload_post.py`, `ayrshare.py` (solo esqueleto si no hay cuenta), `manual.py`, según la spec §2.1.
  **Leer la documentación vigente del proveedor antes de escribir el adaptador.**
- **Aceptación:** con la cuenta de pruebas, publicar un video **privado o en una cuenta de prueba** en al
  menos 2 redes y leer su estado; `manual.py` genera el paquete completo.

### F5.3 Calendario y puerta de aprobación — skill `publicar`, agente `publicador`
- `data/calendario.csv` con los huecos iniciales de la spec §3; `tools/publicar/calendario.py siguiente-hueco`.
- `publicar` verifica `aprobado: true` y `estado: copy_aprobado`; programa; actualiza el catálogo con `post_id`.
- **Aceptación:** intentar publicar una pieza sin aprobar → se niega con mensaje claro.

### F5.4 Página de consulta en el sitio web
- En **este** repo del sitio (`rolandohidalgo-legal.github.io`), crear `site/consulta/index.html` con el
  estilo del sitio: botón de WhatsApp con mensaje prellenado que incluye el código del video
  (leído de `?v=` o `utm_content`), formulario corto con consentimiento de datos (Tally o Formspree) y aviso de privacidad.
- No requiere tocar `scripts/build.mjs` (copia todo `site/`). Verificar con `npm run build`.
- **Aceptación:** `/consulta/?v=110502` abre WhatsApp con "…vi tu video 110502…".

### F5.5 ManyChat (si se contrata)
- Configurar la automatización palabra → DM con enlace UTM (lo hace Rolando con guía paso a paso del Director).
- **Aceptación:** comentar la palabra en una pieza de prueba devuelve el DM.

### F5.6 Flujo de publicación en `/editar`
- Tras el checkpoint 2: copy → checkpoint 3 → publicar. Registrar todo en la bitácora.
- **Aceptación:** una pieza real publicada de punta a punta.
