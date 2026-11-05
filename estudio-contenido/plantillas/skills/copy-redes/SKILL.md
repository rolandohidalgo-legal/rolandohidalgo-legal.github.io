---
name: copy-redes
description: Genera copy.json de una pieza aprobada. Descripciones por red, hashtags, portada, comentario fijado, alt text, UTM, código de WhatsApp y aviso legal. Usar con "/copy <video_id>".
---

# Copy por red

Spec: `docs/specs/copy-y-publicacion.md` §1. Delegar en el subagente `copywriter`.

1. Entradas: guion, transcript final remapeado, catálogo, `brand/hashtags.json`, contexto de marca y audiencia.
2. Escribir `data/proyectos/<video_id>/copy.json` con todas las redes activas.
3. Portada: 3 frames candidatos → `npx remotion still` con el texto del hook → Rolando elige.
4. `python tools/publicar/copy.py validar <video_id>` y `marketing:brand-review`.
5. Mostrar vista previa por red. Al aprobar: catálogo `copy_aprobado`, `aprobado: true`; bitácora.
