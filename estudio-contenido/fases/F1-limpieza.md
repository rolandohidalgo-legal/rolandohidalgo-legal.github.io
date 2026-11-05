# F1 · Ingesta, transcripción y limpieza de escenas basura

**Objetivo:** `/editar <video>` ejecuta E1–E6 y se detiene con un corte en bruto para aprobar.
**Lee antes:** `specs/contratos-de-datos.md` §1–4, `specs/escenas-basura.md` completo.

## Tareas

### F1.1 Ingesta (E1) — `tools/ingesta/ingesta.py <bruto> [--guion ID]`
- `ffprobe` → `fuente` de `proyecto.json` (detectar VFR comparando `r_frame_rate` y `avg_frame_rate`, rotación).
- Normalizar a CFR 30 fps: `ffmpeg -i bruto -vf "fps=30,scale=-2:1920" -c:v libx264 -crf 16 -preset fast -c:a pcm_s16le cfr.mp4`
  (si el bruto es 4K, conservar 1080×1920 para trabajo; guardar la ruta del original para un futuro render 4K).
- Proxy 540p para análisis visual; `voz16k.wav` (mono 16 kHz) y `voz48k.wav` (mono 48 kHz).
- Asignar `video_id`, crear `data/proyectos/<id>/proyecto.json` y fila en `catalogo.jsonl` (`estado: grabado`).
- Caché por hash: si `bruto_sha1` no cambió, no repetir.
- **Aceptación:** con un video VFR de celular, `cfr.mp4` tiene `r_frame_rate=30/1` y la misma duración ±1 frame.

### F1.2 Transcripción (E2) — `tools/ingesta/transcribir.py`
- faster-whisper `large-v3` (o `large-v3-turbo` si no hay GPU y tarda > 1.5× la duración), `language="es"`,
  `word_timestamps=True`, `vad_filter=True`, `initial_prompt` con el glosario de `CLAUDE.md`.
- Escribir `transcript.json` (contratos §3) y `transcript.srt`. Frases según la regla de §3.
- Corrección del glosario: reemplazos de un diccionario (`tools/ingesta/glosario.json`) sobre palabras sueltas, sin tocar tiempos.
- **Aceptación:** en el video bueno de F0.7, WER ≤ 8% frente a una transcripción manual de 30 s; ninguna palabra con `endMs < startMs`.

### F1.3 Señales (E3) — `tools/limpieza/senales.py`
- Implementar cada señal de `escenas-basura.md` §2 como función independiente con prueba unitaria.
- **Aceptación:** sobre el video de prueba, detecta el silencio de 3 s, el tramo fuera de cuadro y el desenfocado (±300 ms).

### F1.4 Clasificación determinista (E4–E5a) — `tools/limpieza/clasificar.py`
- Segmentación y reglas de `escenas-basura.md` §3.1–3.2. Salida: `limpieza.json` con `decision` y `motivos`.
- **Aceptación:** pruebas unitarias para retoma, "corta", muletilla aislada vs "este" demostrativo
  ("este contrato" no es muletilla), silencio largo recortado.

### F1.5 Revisión con Claude (E5b, E5c)
- Skill `video-limpieza` (plantilla): el `editor-video` lee la tabla compacta y el guion, decide según §3.3,
  y pide hojas de contacto para `revisar` (`tools/limpieza/hojas.py`) que clasifica `revisor-frames` (§3.4).
- Escribir el resultado en `limpieza.json` (sin borrar los motivos de las reglas; agregar los suyos).
- **Aceptación:** el JSON valida contra `tools/limpieza/limpieza.schema.json`.

### F1.6 Checkpoint 1 (E6)
- `tools/limpieza/rough.py`: `rough.mp4` 540p con `segmento_id` quemado (`drawtext`) y `limpieza.md`.
- El Director muestra el resumen (duración bruta → conservada, n por motivo, lista de `revisar`) y espera.
- Órdenes que debe entender: "ok", "recupera S0014", "quita S0021", "quédate con la primera toma de G05".
- **Aceptación:** tras "recupera S0014", `limpieza.json` cambia solo ese segmento y `rough.mp4` se regenera.

### F1.7 Medición contra etiquetas
- `tools/tests/test_limpieza_calidad.py`: precisión y recall por duración contra `etiquetas.json`.
- **Aceptación:** precisión ≥ 0.9, recall ≥ 0.85, ninguna frase útil completa eliminada. Si no se cumple,
  ajustar umbrales (documentar en `CLAUDE.md`) antes de pasar a F2.

### F1.8 Modo B (opcional en esta fase, obligatorio antes de F5)
- Skill `clips-de-bruto-largo` según `escenas-basura.md` §5. Probar con un video de ≥ 10 min.
