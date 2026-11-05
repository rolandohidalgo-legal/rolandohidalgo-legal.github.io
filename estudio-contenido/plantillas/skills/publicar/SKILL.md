---
name: publicar
description: Programa o publica una pieza con copy aprobado en las redes elegidas usando el adaptador configurado (Upload-Post, Ayrshare o manual), y actualiza catálogo y calendario. Usar con "/publicar <video_id> [fecha]".
---

# Publicar

Spec: `docs/specs/copy-y-publicacion.md` §2–3. Delegar en el subagente `publicador`.

1. Verificar en `catalogo.jsonl`: `aprobado: true` y `estado: copy_aprobado`. Si no, detenerse y explicar.
2. Fecha: la indicada o `python tools/publicar/calendario.py siguiente-hueco`. Confirmar con Rolando (nivel 0).
3. `python tools/publicar/r2.py subir media/renders/<video_id>.mp4` → URL.
4. `python tools/publicar/publicar.py <video_id> --redes ... --fecha ...` (adaptador según `.env`).
5. Guardar `post_id` y `programado` por red; `estado: programado`; actualizar calendario; bitácora.
6. Si alguna red es `manual`: `python tools/publicar/manual.py <video_id>` y pasos para Rolando.
