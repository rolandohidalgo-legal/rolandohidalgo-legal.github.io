# Copy por red y publicación

## 1. `copy.json` (`copy-redes`)

Entrada: guion, transcript final (lo que de verdad se dijo), catálogo. Salida:

```json
{
  "version": 1, "video_id": "RH-20261105-02",
  "portada": { "frame_ms": 1350, "texto": "¿Te despidieron sin aviso?" },
  "tiktok":    { "descripcion": "…", "hashtags": ["#abogadoecuador", "#derecholaboral", "#despido", "#ecuador"] },
  "instagram": { "descripcion": "…", "hashtags": ["…"], "comentario_fijado": "…", "alt_text": "…", "palabra_manychat": "DESPIDO" },
  "facebook":  { "descripcion": "…" },
  "youtube":   { "titulo": "…", "descripcion": "…", "tags": ["…"] },
  "linkedin":  { "texto": "…" },
  "utm": { "base": "https://rolandohidalgo-legal.github.io/consulta/", "por_red": { "instagram": "…?utm_source=instagram&utm_medium=organic&utm_campaign=derechos_cotidianos&utm_content=RH-20261105-02" } },
  "aviso": "Información general, no constituye asesoría legal para tu caso."
}
```

| Red | Reglas |
|---|---|
| TikTok | Primera línea = palabra clave de búsqueda + gancho (TikTok es buscador). 150–300 caracteres. 3–5 hashtags: 1 amplio, 2 de nicho, 1 local. |
| Instagram | Gancho en los primeros 125 caracteres; luego 2–4 líneas de valor; CTA con palabra de ManyChat; 3–5 hashtags al final. Comentario fijado con la pregunta que abre conversación. Alt text descriptivo. |
| Facebook | Similar a IG, más explicativo; sin palabra de ManyChat si no está conectado a la página. |
| YouTube Shorts | Título ≤ 100 caracteres con la palabra clave al inicio; descripción con enlace UTM y fuentes. |
| LinkedIn | Solo piezas MOFU/autoridad. Tono profesional, 600–1300 caracteres, primera línea fuerte, sin hashtags de relleno (máx. 3). |

Reglas comunes: no copiar y pegar entre redes (adaptar), sin promesas de resultado, aviso de información
general, fuentes en YouTube y LinkedIn, ortografía con glosario. Pasar `marketing:brand-review` al final.
Hashtags: mantener `brand/hashtags.json` con sets por pilar; el analista retira los que no aportan.

## 2. Publicación (`publicar`)

### 2.1 Adaptadores

`tools/publicar/` define una interfaz común y tres implementaciones:

```python
class Publicador(Protocol):
    def subir(self, video_url: str, copy: dict, redes: list[str], programado: datetime | None) -> dict: ...
    def estado(self, publicacion_id: str) -> dict: ...

# upload_post.py  → API de Upload-Post (principal)
# ayrshare.py     → API de Ayrshare (respaldo)
# manual.py       → exporta media/paquetes/<video_id>/ con mp4, portada.png y un .txt por red
```

- Sonnet debe leer la documentación **vigente** del proveedor (WebFetch) antes de implementar: endpoints,
  campos por red, formato de fecha programada, límites de tamaño y de caracteres.
- El render se sube a Cloudflare R2 (`tools/publicar/r2.py`, cliente S3 con `boto3`) y se usa la URL
  firmada o pública temporal.
- Respuesta guardada en `catalogo.jsonl` (`post_id`, `programado`, `publicacion`).

### 2.2 Cuándo usar `manual`

- Se quiere audio en tendencia de TikTok o Instagram (solo desde la app).
- Colaboraciones (coautoría en IG), carruseles con música, o la API rechazó la subida.
El sistema entrega el paquete y una lista de 5 pasos; Rolando confirma y el publicador registra el `post_id`.

### 2.3 Puerta de aprobación

`publicar` se niega a ejecutar si en el catálogo la pieza no tiene `aprobado: true` y `estado` en
`copy_aprobado`. En nivel de autonomía 1 puede programar sin preguntar las piezas que ya cumplen eso.

## 3. Calendario (`data/calendario.csv`)

`fecha,hora_local,red,video_id,estado`

- Horarios iniciales (Ecuador, UTC−5): lunes a viernes 12:30 y 19:30; sábado 10:00. Domingo libre.
- Misma pieza en todas las redes el mismo día, con 0–2 h de diferencia (TikTok primero).
- No dos piezas el mismo día en la misma red hasta superar 3k seguidores (evita canibalizar).
- Piezas de `actualidad_juridica` con urgencia saltan la cola.
- Desde el mes 2, el analista reemplaza los horarios por los mejores observados (`metricas-y-decisiones.md` §5).

## 4. Captura de leads (sitio web propio)

- Página `/consulta/` en `rolandohidalgo-legal.github.io` (este repo del sitio): botón de WhatsApp con
  mensaje prellenado que incluye el código del video (se lee de `?v=` o de `utm_content`), y formulario
  corto (Tally/Formspree) con consentimiento de datos.
- Enlace en bio → `/consulta/?utm_source=instagram&utm_medium=bio`.
- ManyChat (IG/FB): palabra clave → DM con el enlace UTM del video y la guía.
- Cada lead se registra en `data/leads.csv` (Rolando lo dicta o el Director lo agrega desde el chat; fase
  posterior: integración con HubSpot gratis).
