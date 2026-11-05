# F3 · Transiciones, sonido y QA

**Objetivo:** el video final con transiciones variadas y espaciadas, SFX alineados, música con ducking y
QA automático con ciclo de corrección.
**Lee antes:** `specs/transiciones-y-sonido.md` completo, `specs/contratos-de-datos.md` §6–7.

## Tareas

### F3.1 Biblioteca de sonido
- Reunir el kit mínimo (transiciones-y-sonido §2.1) desde Pixabay/Freesound CC0 (y Epidemic si hay
  suscripción). Normalizar cada archivo a −18 LUFS, recortar silencios, detectar `pico_ms` (máximo de envolvente).
- `brand/sfx/manifest.json` y `brand/musica/manifest.json` con licencia y URL. 5–8 pistas de música por energía.
- `tools/audio/biblioteca.py validar`: verifica que todo archivo del manifest exista y tenga licencia.
- **Aceptación:** validación en verde; ≥ 2 variantes por tipo de SFX.

### F3.2 Componentes de transición
- `remotion/src/transiciones/`: cada tipo del catálogo (§1.2) como componente sin solapamiento que recibe
  `progreso` de salida y de entrada. Renderizar una hoja de prueba con todas (`fixtures/transiciones-demo.json`).
- **Aceptación:** Rolando ve la demo y marca cuáles descartar o ajustar; se actualiza `transiciones_permitidas` por preset.

### F3.3 Motor de transiciones — `tools/montaje/transiciones.py`
- Clasificar cortes (§1.1), aplicar las 10 reglas (§1.3) en orden, semilla `hash(video_id)`.
- Pruebas: propiedades (`hypothesis` o casos fijos) que verifiquen separación mínima, no repetición
  consecutiva, máx 40% por tipo, nada en los primeros 1.5 s.
- **Aceptación:** 100 videos sintéticos aleatorios → 0 violaciones.

### F3.4 Motor de sonido — `tools/montaje/sonido.py`
- Colocar SFX según tabla §2.2 con prioridades, desplazamiento a silencios y no repetición de archivo.
- Música: elegir por preset y energía; volumen por frame con ducking (calcular intervalos de habla desde la EDL).
- En Remotion: `Audio` por SFX con `volume` en dB→lineal; música con función de volumen por frame.
- **Aceptación:** pruebas de densidad (≤ 1 SFX / 2 s) y de no solapamiento con inicio de palabras enfatizadas.

### F3.5 QA — skill `video-qa`, agente `qa-video`
- `tools/qa/checks.py` implementa los checks automáticos de §3 y produce `qa.json`.
- `tools/qa/hojas.py`: hoja de contacto de 16 frames + frames de cada transición para la revisión visual.
- El agente `qa-video` lee todo, escribe acciones concretas; el `editor-video` las aplica; máx 2 ciclos.
- **Aceptación:** sembrar 3 defectos a propósito (caption en zona inferior, SFX sobre palabra enfatizada,
  dos `slide` seguidos) → QA detecta los 3 y el ciclo los corrige.

### F3.6 Flujo completo `/editar`
- Encadenar E1–E11 en el skill `editar` (orquestación del Director) con checkpoints 1 y 2, caché por etapa y
  reanudación (`/editar RH-… --desde montaje`).
- Al aprobar: catálogo `estado: render_aprobado` con `preset`, `duracion_s`, `n_transiciones`, `n_sfx`.
- **Aceptación:** de bruto a render aprobado del video bueno de F0.7 sin intervención técnica de Rolando,
  solo aprobaciones. Medir y anotar tiempo total en `CLAUDE.md`.
