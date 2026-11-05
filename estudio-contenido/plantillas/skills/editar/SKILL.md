---
name: editar
description: Edita un video en bruto de punta a punta. Ingesta, transcripción, detección de escenas basura, checkpoint de cortes, montaje con estilo y captions, transiciones, sonido, render, QA y checkpoint de render. Usar con "/editar <archivo> [--guion ID] [--preset X] [--desde etapa]" o cuando Rolando comparta un video en bruto para editar.
---

# /editar: orquestación del pipeline de edición

Specs: `docs/specs/contratos-de-datos.md`, `escenas-basura.md`, `estilos-captions-paletas.md`, `transiciones-y-sonido.md`.

## Pasos (el Director orquesta; el trabajo pesado lo hace el subagente `editor-video`)
1. **E1 Ingesta:** `python tools/ingesta/ingesta.py <bruto> [--guion ID]` → `video_id`.
2. **E2 Transcripción:** `python tools/ingesta/transcribir.py <video_id>`.
3. **E3–E5 Limpieza:** skill `video-limpieza` (señales, reglas, revisión de Claude, `revisor-frames` para hojas).
4. **E6 Checkpoint 1:** mostrar resumen (duración bruta → conservada, motivos, `revisar`) + `rough.mp4`.
   Esperar "ok" o correcciones ("recupera S0014", "quita S0021", "usa la primera toma de G05").
   Registrar en bitácora (`python tools/sistema/bitacora.py registrar …`).
5. **E7 Montaje:** skill `video-montaje` (EDL, voz, punch-in, captions, énfasis, overlays, preset).
6. **E8 Transiciones:** `python tools/montaje/transiciones.py <video_id>`.
7. **E9 Sonido:** `python tools/montaje/sonido.py <video_id>`.
8. **E10 Render:** `python tools/render/render.py <video_id>`.
9. **E11 QA:** subagente `qa-video`; si falla, `editor-video` aplica acciones y vuelve a E10 (máx. 2 ciclos).
10. **Checkpoint 2:** enviar el render a Rolando con el resumen de QA y pendientes. Registrar en bitácora.
11. Al aprobar: catálogo `estado: render_aprobado` + atributos (`preset`, `duracion_s`, `n_transiciones`, `n_sfx`).
    Ofrecer `/copy <video_id>`.

## Reanudar
`--desde <etapa>` recalcula desde esa etapa usando los JSON existentes. Las etapas con entradas sin cambios se saltan.

## Nivel de autonomía
Con nivel ≥ 2 y limpieza con confianza ≥ 0.9 y 0 segmentos `revisar`, se omite el checkpoint 1 (se informa igual).
