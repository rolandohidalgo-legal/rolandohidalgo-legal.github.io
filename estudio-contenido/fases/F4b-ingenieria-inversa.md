# F4b · Ingeniería inversa de la competencia

**Objetivo:** `/disecar`, `/competencia`, `/patrones` y `/transponer` funcionando según
[`specs/ingenieria-inversa.md`](../specs/ingenieria-inversa.md).
**Prerrequisitos:** F0, `video-transcribir` de F1. Puede ir en paralelo a F2–F4.
**Lee antes:** `specs/ingenieria-inversa.md`, `specs/estrategia-y-guiones.md` §4, `specs/estilos-captions-paletas.md` §3.

## Tareas

### F4b.1 Watchlist y descarga
- Crear `data/competencia/watchlist.csv` con 5–10 cuentas que Rolando indique (pedírselas: competencia
  directa en Ecuador, referentes legales en Latam/España, 2 de otros nichos con gran edición).
- `tools/inversa/descargar.py <url> --ref-id` con `yt-dlp` (versión fijada en `requirements.txt`):
  guarda video en `media/referencias/<ref_id>/` y `meta.json` (vistas, me gusta, comentarios,
  compartidos, fecha, duración, descripción, hashtags, cuenta, seguidores si hay).
- `tools/inversa/cuenta.py <url_perfil> --n 40`: lista de piezas con métricas (yt-dlp playlist o actor de
  Apify; implementar ambos detrás de una interfaz, Apify opcional por `.env`).
- **Aceptación:** descarga 1 video de TikTok, 1 de YouTube Shorts y, si es posible, 1 de IG; si IG falla,
  el script cae a "solo metadatos + URL" sin romperse.

### F4b.2 Análisis técnico (R3–R6)
- `tools/inversa/ritmo.py`: planos (PySceneDetect), cara (MediaPipe), punch-ins (cambio de escala del bbox
  de la cara entre planos consecutivos > 8%).
- `tools/inversa/texto_pantalla.py`: frames a 2 fps, OCR, agrupación en páginas de caption, posición Y
  media, colores dominantes de la región del texto (k-means k=3), palabras por página, % en mayúsculas.
- `tools/inversa/audio.py`: palabras/min (del transcript), pausas, música sí/no (energía fuera de habla),
  SFX/min (onsets fuera de habla), LUFS.
- `tools/inversa/hojas.py`: hojas de contacto alrededor de cada corte y de cada página de caption para
  `revisor-frames`.
- **Aceptación:** en 2 videos, planos/min y palabras/min a ±15% del conteo manual.

### F4b.3 Ficha (R7–R9) y agente
- Instalar `plantillas/agents/investigador-competencia.md` y `plantillas/skills/disecar-referencia/SKILL.md`.
- El agente arma `ficha.json` (esquema de la spec §3, validar con un JSON Schema en
  `tools/inversa/ficha.schema.json`) y `ficha.md` con 6 fotogramas clave.
- **Aceptación:** prueba de calidad §9 con 5 videos.

### F4b.4 Auditoría de cuenta y patrones
- Skill `auditar-cuenta` (`/competencia`) y `patrones-competencia` (`/patrones`) según §4–5.
- `tools/inversa/db.py`: vista DuckDB `v_referencias` aplanando las fichas.
- **Aceptación:** informe de 1 cuenta real con top 5 / bottom 3 disecados y una lista de huecos;
  `/patrones` corre con ≥ 10 fichas y respeta n ≥ 5.

### F4b.5 Transposición
- Skill `transponer` según §6: crea/actualiza `brand/hooks.md`, `brand/ctas.md`, marcos `origen: inversa`,
  `brand/estilos/propuestas/*.json`, filas en `ideas.csv`.
- Para un preset propuesto: render de prueba con el video de F2 (`npx remotion render … --props` con el preset).
- Añadir `origen_inversa` al catálogo (`contratos-de-datos.md` §8) para medir préstamos.
- **Aceptación:** 1 hook, 1 marco y 1 preset propuestos, aprobados o corregidos por Rolando.

### F4b.6 Limpieza y programación
- `tools/inversa/limpiar.py`: borra videos de referencia de más de 60 días.
- Tarea programada mensual: `/competencia` sobre toda la watchlist + `/patrones` + resumen al informe mensual.
- **Aceptación:** dry-run del borrado lista lo correcto; la tarea programada existe y su primera corrida deja un informe.

## No hacer
- No subir videos de terceros a git ni a R2.
- No crear presets idénticos a la marca de un creador.
- No usar afirmaciones jurídicas de terceros sin fact-check.
