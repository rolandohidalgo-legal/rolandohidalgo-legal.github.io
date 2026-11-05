# Presupuesto, herramientas y repos

Precios aproximados en USD, revisados en noviembre de 2026 con fuentes públicas (varias son páginas de
los propios proveedores). **Tarea F0.4: confirmar cada precio en la web oficial antes de pagar.**

## 1. Suscripciones mensuales

| Herramienta | Para qué | Precio aprox. | Nivel |
|---|---|---|---|
| Claude (plan actual) | Todo el sistema | Plan vigente; subir a Max si los límites cortan sesiones de edición | Esencial |
| Remotion | Motor de video | $0 (individuo o ≤3 personas, uso comercial incluido) | Esencial |
| Upload-Post | Publicar en TikTok, IG, FB, YouTube, LinkedIn, X por API + analíticas | ~$16–24/mes | Esencial |
| Cloudflare R2 | Alojar renders para publicar por URL | ~$0–2/mes | Esencial |
| Biblioteca SFX gratis (Pixabay, Freesound CC0) | Efectos de sonido | $0 | Esencial |
| ManyChat Pro | Palabra clave en comentarios → DM con enlace (IG/FB) | ~$15/mes | Recomendado |
| Epidemic Sound (plan personal/creador) | Música y SFX con licencia para redes | ~$10–20/mes | Recomendado |
| Apify | Scrapers de TikTok/IG para tendencias y competencia | Crédito gratis mensual; plan inicial ~$39–49/mes | Recomendado |
| ElevenLabs (plan inicial) | Generar SFX a medida; transcripción de respaldo | ~$5–22/mes | Opcional |
| Ayrshare | Alternativa a Upload-Post, más cara y con métricas nativas | desde ~$149/mes | Solo si Upload-Post falla |

| Escenario | Total herramientas/mes (sin Claude ni ads) |
|---|---|
| Esencial | ~$20–30 |
| Recomendado | ~$90–120 |
| Completo | ~$110–145 |

## 2. Presupuesto de anuncios

Detalle y reglas en [`specs/ads.md`](specs/ads.md).

| Etapa | Mensual | Uso |
|---|---|---|
| Prueba (mes 2–3) | $150 | Impulsar 2–3 ganadores orgánicos, objetivo: conversaciones de WhatsApp |
| Crecimiento | $300–500 | 1 campaña siempre activa + impulsos de ganadores |
| Campaña puntual | $200–400 por 2 semanas | Lanzamiento de servicio, lead magnet o fecha clave |

Regla: no correr ads hasta tener **al menos 12 videos publicados con métricas de 7 días** (base para saber
qué es un ganador) y el seguimiento de leads funcionando (F6).

## 3. Equipo de grabación (pago único, opcional pero alto impacto)

| Equipo | Por qué | Aprox. |
|---|---|---|
| Micrófono inalámbrico de solapa (2 transmisores) | El audio limpio mejora transcripción, retención y detección de cortes | $100–250 |
| Panel LED con difusor o softbox | Rostro bien iluminado = mejor detección de cara y mejor imagen | $40–120 |
| Trípode con soporte vertical para celular | Encuadre fijo = punch-ins limpios | $20–40 |

## 4. Repositorios y librerías

| Repo / paquete | Uso en el sistema |
|---|---|
| `remotion-dev/remotion` (`remotion`, `@remotion/cli`, `@remotion/renderer`, `@remotion/captions`, `@remotion/transitions`, `@remotion/google-fonts`, `@remotion/media-utils`) | Motor de render, captions, transiciones, fuentes |
| Skills oficiales de Remotion para agentes (`remotion-dev/skills`) | Instalar en el repo para que Sonnet escriba Remotion correcto. Verificar el comando de instalación en remotion.dev |
| `heygen-com/hyperframes` | Plan B / overlays de motion graphics en HTML |
| `SYSTRAN/faster-whisper` | Transcripción local con marcas de tiempo por palabra |
| `m-bain/whisperX` | Alternativa con alineación forzada si faster-whisper no basta |
| `snakers4/silero-vad` | Detección de voz y silencios |
| `Breakthrough/PySceneDetect` | Cambios de escena |
| `google-ai-edge/mediapipe` | Detección de cara (encuadre, punch-in centrado) |
| `rapidfuzz` | Detectar retomas (frases repetidas) |
| `pyloudnorm`, `slhck/ffmpeg-normalize` | Medir y normalizar loudness |
| `duckdb` | Consultas sobre métricas |
| `WyattBlue/auto-editor` | Referencia y comparación para el corte de silencios (no dependencia) |
| FFmpeg ≥ 6 (filtros `silencedetect`, `blackdetect`, `freezedetect`, `blurdetect`, `scdet`, `loudnorm`, `ebur128`) | Señales y audio |

## 5. Cuentas y accesos a crear (F0)

| Cuenta | Requisito | Lo usa |
|---|---|---|
| GitHub repo privado `estudio-rh` | — | Todo |
| Instagram profesional + página de Facebook vinculada + Meta Business Suite | Para insights y ads | Analista, trafficker |
| App de Meta for Developers + usuario del sistema (token sin vencimiento) | Leer insights de IG/FB | `metricas-ingesta` |
| Google Cloud: YouTube Data API v3 + YouTube Analytics API (OAuth) | Métricas de Shorts | `metricas-ingesta` |
| Upload-Post (o Ayrshare) | Conectar perfiles de redes | `publicar` |
| TikTok Business / Creator + TikTok Ads Manager | Spark Ads, exportar estadísticas | Analista, trafficker |
| Cloudflare R2 (bucket + token de API) | Alojar renders | `publicar` |
| WhatsApp Business (app) | Recibir leads con código | Leads |

Credenciales en `.env` (en `.gitignore`), con `.env.example` versionado. En GitHub Actions, como secrets.

## 6. Fuentes consultadas (noviembre de 2026)

- HyperFrames: [themenonlab.blog](https://themenonlab.blog/blog/heygen-hyperframes-video-as-code), [noqta.tn](https://www.noqta.tn/en/blog/heygen-hyperframes-html-to-mp4-ai-agent-video-2026), repo `heygen-com/hyperframes`.
- Licencia de Remotion: [remotion.dev/docs/license](https://remotion.dev/docs/license), [remotion.dev/docs/pricing](https://www.remotion.dev/docs/pricing).
- Upload-Post vs Ayrshare: [upload-post.com/pricing-comparison](https://www.upload-post.com/pricing-comparison), [ayrshare.com/compare/upload-post-api-alternative](https://www.ayrshare.com/compare/upload-post-api-alternative/) (ambas son páginas de proveedores; confirmar precios).
