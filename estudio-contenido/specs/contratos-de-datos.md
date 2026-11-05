# Contratos de datos

Todos los tiempos en **milisegundos enteros** salvo que se diga lo contrario. Video de trabajo a **30 fps
constantes**. Conversión: `frame = round(ms * 30 / 1000)`. Todos los JSON llevan `"version": 1`.

## 1. Identificadores

- `video_id`: `RH-AAAAMMDD-NN` (fecha de grabación + correlativo). Ejemplo: `RH-20261105-02`.
- `segmento_id`: `S0001`, `S0002`, … (orden en el bruto).
- Cada pieza publicada hereda el `video_id`. UTM: `utm_source=<red>&utm_medium=organic&utm_campaign=<pilar>&utm_content=<video_id>`.
- Código de WhatsApp: últimos 6 caracteres del `video_id` sin guiones, ej. `110502` → mensaje prellenado
  `Hola, vi tu video 110502 y quiero consultar sobre…`.

## 2. `proyecto.json`

```json
{
  "version": 1,
  "video_id": "RH-20261105-02",
  "bruto": "media/brutos/IMG_4411.MOV",
  "bruto_sha1": "…",
  "guion_id": "RH-20261105-02",
  "modo": "guion",                       
  "fuente": { "ancho": 2160, "alto": 3840, "fps_original": 29.87, "vfr": true, "duracion_ms": 412300, "rotacion": 0 },
  "trabajo": {
    "cfr": "media/trabajo/RH-20261105-02/cfr.mp4",
    "proxy": "media/trabajo/RH-20261105-02/proxy.mp4",
    "voz16k": "media/trabajo/RH-20261105-02/voz16k.wav",
    "voz48k": "media/trabajo/RH-20261105-02/voz48k.wav"
  },
  "preset": "toga",
  "etapas": { "ingesta": "ok", "transcripcion": "ok", "limpieza": "pendiente_aprobacion" }
}
```

`modo`: `guion` (se grabó un guion del sistema) o `libre` (bruto sin guion) o `clip` (salió de un bruto largo).
Cada etapa guarda en `etapas` su estado y el hash de sus entradas; si las entradas no cambiaron, la etapa no se repite.

## 3. `transcript.json`

Formato de palabra compatible con `Caption` de `@remotion/captions`, más datos propios.

```json
{
  "version": 1,
  "idioma": "es",
  "modelo": "faster-whisper large-v3",
  "palabras": [
    { "i": 0, "text": "¿Sabías", "startMs": 1220, "endMs": 1610, "confidence": 0.97 },
    { "i": 1, "text": "que", "startMs": 1610, "endMs": 1740, "confidence": 0.99 }
  ],
  "frases": [
    { "id": "F001", "palabras": [0, 14], "startMs": 1220, "endMs": 5400, "texto": "¿Sabías que tu jefe no puede…?" }
  ]
}
```

Frases: se cortan en puntuación final o en pausa ≥ 450 ms.

## 4. `senales.json` y `limpieza.json`

`senales.json` guarda señales crudas por intervalo (ver [`escenas-basura.md`](escenas-basura.md) §2):

```json
{ "version": 1,
  "silencios": [[0, 1180], [5400, 6900]],
  "negro": [], "congelado": [], "borroso": [[60200, 61100]],
  "cortes_escena": [60150],
  "cara": [{ "t": 0, "presente": false }, { "t": 500, "presente": true, "bbox": [0.31, 0.18, 0.38, 0.27] }],
  "aplausos": [800],
  "marcadores_voz": [{ "t": 33100, "palabra": "repito" }] }
```

`limpieza.json` es la decisión por segmento:

```json
{
  "version": 1,
  "segmentos": [
    { "id": "S0001", "startMs": 0, "endMs": 1180, "texto": "", "decision": "basura", "motivos": ["silencio_inicial"], "confianza": 0.99 },
    { "id": "S0002", "startMs": 1180, "endMs": 5450, "texto": "¿Sabías que…", "decision": "conservar", "motivos": [], "confianza": 0.95, "linea_guion": "G01" },
    { "id": "S0007", "startMs": 30100, "endMs": 33000, "texto": "El artículo dice que el…", "decision": "basura", "motivos": ["retoma_anterior"], "confianza": 0.91, "reemplazado_por": "S0008" },
    { "id": "S0012", "startMs": 60100, "endMs": 61200, "texto": "", "decision": "revisar", "motivos": ["borroso", "sin_cara"], "confianza": 0.55 }
  ],
  "resumen": { "duracion_bruto_ms": 412300, "duracion_conservada_ms": 74800, "segmentos_revisar": 1 },
  "aprobado": false
}
```

`decision`: `conservar` | `basura` | `revisar`. Códigos de `motivos` en `escenas-basura.md` §3.
Rolando aprueba cambiando `aprobado` a `true` (o lo hace el Director al recibir "ok" en el chat).

## 5. `edl.json` (lista de edición)

```json
{
  "version": 1,
  "fps": 30,
  "fuente": "media/trabajo/RH-20261105-02/cfr.mp4",
  "cortes": [
    { "seg": "S0002", "inMs": 1100, "outMs": 5570, "salidaMs": 0,    "zoom": 1.0,  "centro": [0.5, 0.42] },
    { "seg": "S0003", "inMs": 6820, "outMs": 9930, "salidaMs": 4470, "zoom": 1.12, "centro": [0.5, 0.40] }
  ],
  "duracion_ms": 74800
}
```

Reglas de construcción en [`escenas-basura.md`](escenas-basura.md) §4 (márgenes, ajuste a silencios, punch-in).

**Remapeo de tiempos (captions, SFX y overlays):** para una palabra con tiempo de fuente `t` dentro del
corte `c` (`c.inMs ≤ t < c.outMs`): `t_salida = c.salidaMs + (t − c.inMs)`. Palabras fuera de todo corte
se descartan; palabras que cruzan un borde se recortan al borde y se descartan si quedan < 80 ms.

## 6. `montaje.json` (lo que recibe Remotion como `inputProps`)

```json
{
  "version": 1,
  "video_id": "RH-20261105-02",
  "formato": { "ancho": 1080, "alto": 1920, "fps": 30 },
  "preset": "toga",
  "edl": "edl.json",
  "voz": "media/trabajo/RH-20261105-02/voz_editada.wav",
  "captions": [
    { "text": "¿Sabías", "startMs": 80, "endMs": 470, "enfasis": false },
    { "text": "despedirte", "startMs": 1900, "endMs": 2400, "enfasis": true }
  ],
  "paginas_captions": "auto",
  "overlays": [
    { "tipo": "hook", "texto": "Tu jefe NO puede hacer esto", "startMs": 0, "endMs": 2600 },
    { "tipo": "cita_legal", "texto": "Código del Trabajo, art. 188", "startMs": 21000, "endMs": 24500 },
    { "tipo": "lista", "numero": 2, "texto": "Pide tu liquidación por escrito", "startMs": 40100, "endMs": 43000 },
    { "tipo": "cta", "texto": "Comenta DESPIDO y te envío la guía", "startMs": 70000, "endMs": 74800 }
  ],
  "transiciones": [
    { "en_corte": 3, "tipo": "slide_izq", "frames": 8, "sfx": "whoosh_corto_02" }
  ],
  "sfx": [
    { "id": "pop_03", "startMs": 21000, "gananciaDb": -16, "motivo": "overlay_cita" }
  ],
  "musica": { "id": "bed_sobrio_07", "gananciaDb": -26, "ducking": true, "fadeInMs": 600, "fadeOutMs": 1200 },
  "audio": { "objetivo_lufs": -14, "pico_dbtp": -1 },
  "barra_progreso": true
}
```

- La voz va como pista continua aparte (`voz_editada.wav`, ver `escenas-basura.md` §4.4); los videos de
  cada corte se montan **sin audio**. Así las transiciones visuales nunca desfasan la voz.
- `tipo` de overlay válidos: `hook`, `titulo_seccion`, `cita_legal`, `lista`, `dato`, `palabra_clave`,
  `broll`, `lower_third`, `cta`. Cada preset define cómo se ve cada tipo.

## 7. Render y QA

- Salida: `media/renders/<video_id>.mp4`, H.264, CRF 18, `yuv420p`, AAC 48 kHz 192 kbps, 1080×1920, 30 fps.
- Después del render: medición con `ebur128`; si el integrado no está en −14 ± 1 LUFS o el pico supera
  −1 dBTP, se normaliza con `loudnorm` de dos pasadas solo el audio (`-c:v copy`).
- `qa.json`:

```json
{ "version": 1, "aprobado_qa": false, "ciclo": 1,
  "checks": [
    { "id": "loudness", "ok": true, "valor": -14.2 },
    { "id": "zona_segura_captions", "ok": false, "detalle": "frames 412–460: caption bajo y=1500" }
  ],
  "acciones": ["subir captions a y=0.64 en preset toga"] }
```

## 8. `catalogo.jsonl` (una línea por pieza, se reescribe la línea al cambiar)

```json
{"video_id":"RH-20261105-02","titulo_interno":"Despido intempestivo: 3 derechos","pilar":"derechos_cotidianos","embudo":"TOFU","marco":"error_comun","tipo_hook":"negacion","preset":"toga","duracion_s":75,"n_transiciones":5,"n_sfx":11,"estado":"programado","aprobado":true,"redes":{"tiktok":{"programado":"2026-11-10T19:30:00-05:00","post_id":null,"publicacion":"api"},"instagram":{"programado":"2026-11-10T19:30:00-05:00","post_id":null,"publicacion":"api"}},"utm_campaign":"derechos_cotidianos","codigo_wa":"110502","tendencia":true,"cta":"comenta_palabra"}
```

Estos atributos son los que el analista cruza con las métricas: si no están aquí, no se pueden aprender.

## 9. Métricas: `data/metricas/snapshots/AAAA-MM-DD.jsonl`

```json
{"fecha":"2026-11-13","video_id":"RH-20261105-02","red":"instagram","post_id":"…","horas_desde_pub":72,"vistas":5310,"alcance":4800,"me_gusta":210,"comentarios":34,"compartidos":61,"guardados":97,"seguidores_ganados":22,"tiempo_medio_s":31.5,"retencion_3s":0.58,"completado":0.27,"visitas_perfil":140,"clics_enlace":18,"fuente":"meta_graph"}
```

Campos no disponibles en una red: `null` (nunca 0 inventado). `fuente`: `meta_graph`, `youtube_analytics`,
`upload_post`, `tiktok_studio_manual`.

## 10. `leads.csv`

`fecha,canal,codigo_video,video_id,ads_id,nombre_o_alias,tema,estado,valor_usd,consentimiento`
Estados: `nuevo`, `calificado`, `consulta_agendada`, `cliente`, `descartado`. Sin datos sensibles del caso.
