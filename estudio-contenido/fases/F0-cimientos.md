# F0 · Cimientos

**Objetivo:** repo privado listo, entorno instalado, cuentas creadas, marca capturada y video de prueba grabado.
**Dónde:** computador de Rolando (Claude Code CLI o app de escritorio), con Sonnet.
**Lee antes:** `00-plan-maestro.md`, `01-agentes-y-skills.md`, `02-presupuesto-y-herramientas.md`.

## Tareas

### F0.1 Repo privado
- Crear repo privado `estudio-rh` en GitHub (Rolando lo crea o autoriza crearlo).
- Copiar `estudio-contenido/` a `estudio-rh/docs/` (las specs viajan con el código).
- Crear la estructura de carpetas de `01-agentes-y-skills.md` §1 con `.gitkeep`.
- `.gitignore`: `media/`, `.env`, `node_modules/`, `.venv/`, `__pycache__/`, `remotion/out/`.
- **Aceptación:** `git status` limpio; `tree -L 2` coincide con la estructura.

### F0.2 Entorno
- FFmpeg ≥ 6 con `blurdetect` (`ffmpeg -filters | grep -E "blurdetect|freezedetect|scdet|ebur128"` devuelve los 4).
- Node 22 LTS. Python 3.11+ con `.venv` y `tools/requirements.txt` (versiones fijadas):
  `faster-whisper, silero-vad, torch (CPU o CUDA según equipo), mediapipe, scenedetect[opencv], rapidfuzz, pyloudnorm, numpy, soundfile, duckdb, boto3, requests, python-dotenv, jsonschema, pytest, yt-dlp, rapidocr-onnxruntime, scikit-learn`.
- `tools/doctor.py`: verifica todo lo anterior, GPU disponible o no, espacio en disco, y que `.env` tenga las claves necesarias para la fase en curso.
- **Aceptación:** `python tools/doctor.py` en verde (las claves de fases futuras pueden figurar como "pendiente").

### F0.3 Proyecto Remotion
- `cd remotion && npx create-video@latest` (plantilla en blanco, TypeScript). Instalar `@remotion/captions`,
  `@remotion/transitions`, `@remotion/google-fonts`, `@remotion/media-utils`, `zod`.
- Instalar las skills oficiales de Remotion para agentes (consultar remotion.dev el comando vigente;
  hoy se distribuyen como `remotion-dev/skills`).
- Composición `Clip` vacía (1080×1920, 30 fps) que recibe `montaje.json` como `inputProps` validado con zod
  (esquema de `specs/contratos-de-datos.md` §6) y calcula la duración con `calculateMetadata`.
- **Aceptación:** `npx remotion render Clip out/test.mp4 --props=fixtures/montaje-vacio.json` produce un mp4 de 3 s.

### F0.4 Cuentas y claves
- Con Rolando, crear o verificar cada cuenta de `02-presupuesto-y-herramientas.md` §5 en este orden:
  GitHub privado → Upload-Post (plan gratis para probar) → Cloudflare R2 → Meta (IG profesional + página +
  app + usuario del sistema) → Google Cloud (YouTube APIs) → TikTok Business. Confirmar precios vigentes.
- `.env.example` con todas las variables (sin valores) y comentario de dónde se obtiene cada una.
- **Aceptación:** `doctor.py` confirma cada clave con una llamada mínima de lectura (p. ej. listar perfiles conectados).

### F0.5 Captura de marca
- Pedir a Rolando 2–3 videos o capturas de los estilos, captions y paletas que ya usa.
- Extraer: colores (frames → k-means), fuente más parecida en Google Fonts, tamaño y posición de captions,
  animación, uso de mayúsculas, overlays. Comparar con los presets de `specs/estilos-captions-paletas.md` §3.
- Escribir `brand/estilos/{toga,expediente,pulso,pizarra}.json` ajustados (o los que Rolando defina) y
  `brand/hashtags.json` inicial por pilar.
- **Aceptación:** Rolando confirma cada preset sobre una imagen de muestra (render de 1 frame por preset con `npx remotion still`).

### F0.6 Skills existentes y agentes
- Verificar en Claude Code local que están disponibles los skills de `00-plan-maestro.md` §2.6. Los que
  falten: pedir a Rolando que los exporte y copiarlos a `.claude/skills/`.
- Copiar `docs/plantillas/agents/*.md` a `.claude/agents/` y `docs/plantillas/skills/*` a `.claude/skills/`.
- Escribir `CLAUDE.md` (plantilla en `plantillas/CLAUDE.md`), con glosario jurídico y nivel de autonomía 0.
- `.claude/settings.json`: permitir `Bash(ffmpeg:*)`, `Bash(ffprobe:*)`, `Bash(python tools/*)`, `Bash(npx remotion:*)`, `Bash(git:*)`.
- **Aceptación:** `/agents` lista los agentes; los skills aparecen al escribir `/`.

### F0.7 Video de prueba (fixture)
- Rolando graba un video de 90–120 s siguiendo **mal a propósito** el protocolo (ver
  `specs/escenas-basura.md` §6) y otro bien grabado de 60 s con un guion corto.
- Rolando etiqueta la basura del primero en `tools/tests/fixtures/etiquetas.json` (`[{"startMs":…, "endMs":…, "motivo":"…"}]`)
  — el Director le ayuda reproduciendo el video y anotando lo que dicta.
- **Aceptación:** ambos videos en `media/brutos/`, etiquetas válidas.

## Salida de la fase
Commit "F0 cimientos", `CLAUDE.md` con estado `F0 completa`, y lista de pendientes (cuentas sin aprobar, etc.).
