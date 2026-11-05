---
name: video-montaje
description: Convierte un limpieza.json aprobado en edl.json y montaje.json. Voz continua, punch-ins centrados en la cara, captions remapeados con énfasis, overlays según el guion y el preset de estilo.
---

# Montaje

Specs: `docs/specs/contratos-de-datos.md` §5–6, `escenas-basura.md` §4, `estilos-captions-paletas.md`.

1. `python tools/montaje/edl.py <video_id>` → `edl.json` (márgenes, ajuste a silencio, fusión, punch-in).
2. `python tools/montaje/voz.py <video_id>` → `voz_editada.wav`.
3. `python tools/montaje/captions.py <video_id>` → captions remapeados en `montaje.json`.
4. Tú marcas `enfasis` (máx. 1 por página, ~1 cada 3 s; términos legales clave, cifras, plazos, negaciones, palabra del CTA)
   y corriges ortografía con el glosario de `CLAUDE.md`.
5. Tú propones `overlays` con la tabla de estilos §5, usando el texto en pantalla del guion. Comprueba con
   `python tools/montaje/overlays.py validar <video_id>` que no tapan la cara ni se superponen.
6. Preset: el del guion (`preset_sugerido`) salvo instrucción de Rolando o regla de rotación (estilos §4).
7. Valida `montaje.json` (`tools/montaje/montaje.schema.json`).
