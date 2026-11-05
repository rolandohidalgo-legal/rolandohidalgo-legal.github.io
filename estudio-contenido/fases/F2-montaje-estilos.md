# F2 · Montaje, captions y estilos

**Objetivo:** de un `limpieza.json` aprobado a un mp4 1080×1920 con voz limpia, punch-ins, captions por
palabra, overlays y el preset elegido.
**Lee antes:** `specs/contratos-de-datos.md` §5–7, `specs/escenas-basura.md` §4, `specs/estilos-captions-paletas.md`.

## Tareas

### F2.1 EDL y voz — `tools/montaje/edl.py`, `tools/montaje/voz.py`
- Construir `edl.json` con márgenes, ajuste a silencio, fusión y `salidaMs` (escenas-basura §4.1–4.3).
- `voz_editada.wav`: concatenación con fundidos de 8 ms; paso alto 80 Hz; `afftdn` solo si el ruido de
  fondo medido en silencios supera −50 dBFS.
- **Aceptación:** prueba: la suma de duraciones de cortes = duración de `voz_editada.wav` ±1 frame; sin clics audibles (pico de diferencia en uniones < −30 dBFS).

### F2.2 Punch-in — en `edl.py`
- Detectar jump cuts (misma toma: cortes consecutivos sin cambio de escena entre ellos en la fuente) y
  alternar `zoom` con `centro` en la cara (escenas-basura §4.5).
- **Aceptación:** en el video de prueba, ningún punch-in deja la cara fuera de cuadro (bbox escalado dentro de 0–1).

### F2.3 Remapeo de captions y énfasis — `tools/montaje/captions.py`
- Remapear palabras (contratos §5), aplicar reglas de estilos §2, y pedir a Claude (skill `video-montaje`)
  marcar `enfasis` con las reglas.
- **Aceptación:** prueba unitaria de remapeo con 3 cortes sintéticos; ningún caption fuera de la duración.

### F2.4 Overlays
- Claude propone overlays según estilos §5 a partir del transcript remapeado y del guion
  (texto en pantalla de cada línea G). Validar posiciones contra el bbox de la cara.
- **Aceptación:** el `montaje.json` valida con el esquema zod y con `tools/montaje/montaje.schema.json`.

### F2.5 Componentes Remotion
- `remotion/src/Clip.tsx`: `Series` de `OffthreadVideo` (sin audio) por corte con `trimBefore`/`trimAfter`
  (en versiones antiguas `startFrom`/`endAt`), `transform: scale()` y `transformOrigin` según `centro`;
  pista `Audio` con `voz_editada.wav`.
- `remotion/src/captions/` un componente por preset; paginar con `createTikTokStyleCaptions`
  (`combineTokensWithinMilliseconds` según preset: pulso ~400 ms, otros ~1200 ms).
- `remotion/src/overlays/` un componente por tipo de overlay; estilos leídos del preset JSON.
- Barra de progreso opcional. Gradación con filtros CSS del preset.
- Fuentes con `@remotion/google-fonts` (Gelasio, Inter, IBM Plex Mono).
- **Aceptación:** `npx remotion studio` muestra el video de prueba con los 4 presets cambiando solo `preset`.

### F2.6 Render (E10 básico) — skill `video-render`
- `tools/render/render.py <video_id>`: copia `montaje.json` como props, `npx remotion render Clip`
  (H.264, CRF 18, `--concurrency` según núcleos), mide loudness y normaliza (contratos §7).
- **Aceptación:** render del video bueno de F0.7 en < 3× tiempo real en el equipo de Rolando; −14 ± 1 LUFS.

### F2.7 Checkpoint 2 provisional
- Mostrar a Rolando el render con cada preset (1 versión completa + stills de los otros 3). Ajustar presets con su feedback.
- **Aceptación:** Rolando aprueba al menos 2 presets como "listos".
