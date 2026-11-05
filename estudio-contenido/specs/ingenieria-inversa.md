# Ingeniería inversa de contenido de la competencia

**Objetivo:** desarmar videos de otros creadores (competencia directa, referentes de otros nichos, piezas
virales) en sus piezas reutilizables, es decir estilo, marco narrativo, hook, guion, CTA, ritmo, sonido y copy, y
**transponerlas** a activos propios: banco de hooks, marcos de guion, presets de estilo, reglas de ritmo y CTAs.

Se copia la **estructura**, no la expresión: nunca se reutilizan sus imágenes, música, textos literales,
marca ni apariencia idéntica (ver §8).

## 1. Modos

| Comando | Entrada | Qué hace |
|---|---|---|
| `/disecar <url o archivo>` | Un video | Ficha completa de esa pieza |
| `/competencia <cuenta>` | Perfil de TikTok, IG o YouTube | Auditoría de la cuenta: últimas 30–50 piezas, atípicos, disección de las 5 mejores y 3 peores para contrastar |
| `/patrones [grupo]` | Fichas acumuladas | Patrones cruzados: qué separa a los atípicos de lo normal, por cuenta y en general |
| `/transponer <ref_id o patrón>` | Ficha o patrón | Convierte el hallazgo en activos propios (hook, marco, preset, CTA) y en 1–3 ideas para `ideas.csv` |

Lista de seguimiento: `data/competencia/watchlist.csv`
(`cuenta,red,url,tipo[competencia|referente|otro_nicho],pais,seguidores,notas`). Revisión mensual
automática de la lista (tarea programada) + bajo demanda.

## 2. Pipeline por pieza (`tools/inversa/`)

| Paso | Herramienta | Salida |
|---|---|---|
| R1 Descarga y metadatos | `yt-dlp` (videos públicos) + Apify o metadatos de yt-dlp para métricas | `media/referencias/<ref_id>/video.mp4`, `data/competencia/<ref_id>/meta.json` |
| R2 Transcripción | Reutiliza `video-transcribir` | `transcript.json` |
| R3 Ritmo visual | PySceneDetect (planos), MediaPipe (cara), detección de zoom por flujo óptico simple | planos/min, duración media de plano, % con cara, punch-ins/min |
| R4 Texto en pantalla | Frames a 2 fps → OCR (`rapidocr` o Tesseract) + visión de Claude en hojas de contacto | captions: palabras por página, mayúsculas, posición Y, colores dominantes (k-means sobre la región), contorno o caja, animación (comparando frames seguidos), método de énfasis |
| R5 Transiciones y overlays | Frames ±4 alrededor de cada corte → `revisor-frames` | tipo de transición por corte, tipos de overlay, uso de B-roll, emojis, stickers |
| R6 Audio | VAD + onsets fuera de la voz + `ebur128` | palabras por minuto, pausas, presencia de música (y energía), SFX por minuto y dónde caen (cortes, textos), loudness |
| R7 Estructura y guion (Claude) | Transcript + línea de tiempo de R3–R6 | ver §3 |
| R8 Copy | Descripción, hashtags, comentario fijado (de metadatos o captura) | palabras clave, longitud, CTA escrito, hashtags |
| R9 Rendimiento relativo | Métricas de la cuenta | `atipico = vistas / mediana(vistas últimas 30 piezas de la cuenta)`; guardados+compartidos por 1k; comentarios por 1k |

`ref_id`: `REF-<red>-<cuenta>-<id_post>`.

## 3. Ficha de disección (`data/competencia/<ref_id>/ficha.json` + `ficha.md`)

```json
{
  "version": 1, "ref_id": "REF-tt-abogadoxyz-7301…", "url": "…", "cuenta": "abogadoxyz", "red": "tiktok",
  "fecha_pub": "2026-10-21", "duracion_s": 48,
  "rendimiento": { "vistas": 412000, "atipico": 6.8, "utilidad_por_1k": 31.2, "comentarios_por_1k": 4.1 },
  "hook": {
    "verbal": "Si tu jefe te dice esto, grábalo.",
    "texto_pantalla": "NO firmes esto",
    "visual": "plano cerrado + documento en mano, punch-in a los 0.4 s",
    "tipo": ["consecuencia", "negacion"], "segundos_hasta_promesa": 1.6
  },
  "marco": { "id": "error_comun", "coincidencia": 0.8, "nuevo": false,
             "estructura": ["amenaza concreta", "por qué es ilegal", "qué decir/hacer", "CTA"] },
  "guion": {
    "bloques": [{ "bloque": "hook", "inicio_s": 0, "fin_s": 3.1, "funcion": "detener scroll", "texto": "…" }],
    "dispositivos_retencion": ["bucle abierto a los 5 s ('lo tercero es lo que nadie hace')", "interrupción visual cada ~4 s"],
    "tono": "cercano, urgente", "persona": "abogado que protege al trabajador",
    "afirmaciones": [{ "texto": "…", "verificable": true }]
  },
  "cta": { "tipo": "comenta_palabra", "texto": "Comenta CONTRATO", "momento_s": 44, "tambien_en_copy": true },
  "ritmo": { "planos_por_min": 22, "duracion_media_plano_s": 2.7, "punch_ins_por_min": 9, "palabras_por_min": 178 },
  "estilo": {
    "captions": { "palabras_por_pagina": 2, "mayusculas": true, "y": 0.62, "colores": ["#FFFFFF", "#FFE14D"],
                  "contorno": "negro grueso", "caja": null, "animacion": "pop", "enfasis": "color amarillo en 1 palabra" },
    "overlays": ["texto de hook arriba", "flechas"], "broll_pct": 0.15, "paleta_video": ["#…"], "gradacion": "cálida, contraste alto"
  },
  "transiciones": { "total": 3, "tipos": { "whip": 2, "zoom_through": 1 }, "en_cambios_de_bloque": 3 },
  "sonido": { "musica": "trap suave a −24 LUFS aprox.", "sfx_por_min": 11, "sfx_en": ["cortes", "aparición de texto"] },
  "copy": { "descripcion_chars": 180, "hashtags": ["…"], "palabra_clave_inicial": "despido", "cta_copy": "…" },
  "hipotesis_exito": ["la amenaza concreta en 1.6 s", "promesa de lista con lo mejor al final"],
  "transponible": [
    { "activo": "hook", "plantilla": "Si tu {figura_de_poder} te dice '{frase}', {acción_inmediata}." },
    { "activo": "dispositivo", "plantilla": "Anunciar en los primeros 5 s que el último punto es el más importante." }
  ],
  "no_transponible": ["la música (sin licencia)", "su gráfica de marca"]
}
```

`ficha.md`: la misma información en lectura rápida, con 6 fotogramas clave (hook, cada bloque, CTA).

## 4. Auditoría de cuenta (`/competencia`)

1. Traer las últimas 30–50 piezas con métricas (Apify o yt-dlp `--flat-playlist` + metadatos).
2. Calcular `atipico` por pieza; separar top 5, bottom 3 y la mediana.
3. Disecar esas 8 (R1–R9). Las demás solo con metadatos + transcript (análisis liviano: hook verbal, marco, CTA).
4. Informe `data/competencia/cuentas/<cuenta>-AAAA-MM.md`: frecuencia de publicación, pilares/temas,
   formatos dominantes, qué tienen los atípicos que no tienen los bajos (con n), estilo de marca,
   CTA y oferta (¿a qué servicio llevan?), huecos que no cubren (oportunidades para Rolando).

## 5. Patrones cruzados (`/patrones`)

Sobre la tabla DuckDB `v_referencias` (todas las fichas):

- Por atributo (tipo de hook, marco, palabras por página, planos/min, SFX/min, duración, CTA): mediana
  de `atipico` y de `utilidad_por_1k`, con n. Solo se reportan diferencias con n ≥ 5 por grupo.
- Comparar con nuestras propias piezas (`v_piezas`): qué hacen los atípicos de afuera que nosotros no
  hacemos todavía → experimentos candidatos.
- Salida: `data/competencia/patrones-AAAA-MM.md` y propuestas de entradas para el playbook con
  `evidencia: externa` (pesan menos que la evidencia propia; se confirman con un experimento).

## 6. Transposición (`/transponer`)

| Hallazgo | Activo propio que se crea o actualiza |
|---|---|
| Hook que funciona | `brand/hooks.md`: plantilla con variables, tipo, ejemplo adaptado a derecho ecuatoriano, `ref_id` de origen |
| Estructura narrativa nueva | Nuevo marco en `estrategia-y-guiones.md` §4 (id, estructura, duración, embudo, preset) marcado `origen: inversa` |
| Estilo visual | `brand/estilos/propuestas/<nombre>.json` (preset propio inspirado, no idéntico); render de prueba con un video nuestro; Rolando aprueba antes de pasar a `brand/estilos/` |
| Ritmo (planos/min, SFX/min) | Ajuste propuesto a la densidad del preset correspondiente |
| Transición o SFX característico | Nuevo componente/archivo en el catálogo si encaja con la marca |
| CTA y oferta | `brand/ctas.md`: plantilla por embudo |
| Tema con demanda que no cubrimos | Ideas en `ideas.csv` con `fuente: inversa:<ref_id>` |

Cada activo transpuesto guarda su `ref_id` para que el analista mida después si el préstamo funcionó
en nuestra cuenta (atributo `origen_inversa` en el catálogo).

## 7. Conexiones con el resto del sistema

```text
watchlist ─► /competencia ─► fichas ─► /patrones ─► playbook (evidencia externa) ─► plan-semanal
                 │                        │
                 └─► atípicos ─► radar-tendencias (temas)          └─► /transponer ─► hooks, marcos, presets, CTAs
```

- `radar-tendencias` usa los atípicos recientes de la watchlist como fuente de temas.
- `guion-estrategico` consulta `brand/hooks.md` y los marcos `origen: inversa`.
- `ads-campana` combina esto con `competitive-ads-extractor` (anuncios pagados de la competencia).

## 8. Límites éticos y legales

- Solo contenido público. Los videos descargados se guardan **solo en local** (`media/referencias/`, en
  `.gitignore`), para análisis, y se borran a los 60 días (`tools/inversa/limpiar.py`). En git solo van fichas,
  transcripciones resumidas y fotogramas clave en baja resolución.
- No republicar, no reutilizar fragmentos, música, gráfica ni guiones literales. Estructuras, ideas y
  técnicas sí; expresión no.
- No imitar la marca de otra persona de forma que pueda confundir (colores + tipografía + muletillas de un
  creador concreto). Un preset inspirado debe diferir en al menos paleta y tipografía.
- Respetar los términos de servicio de cada plataforma; si una descarga no está permitida o falla, trabajar
  con la URL, capturas y metadatos.
- Afirmaciones jurídicas de terceros: no se repiten sin pasar `fact-checker-guion` (muchas piezas virales
  de derecho tienen errores, y ahí suele haber una oportunidad de contenido: "lo que ese video no te dijo").

## 9. Prueba de calidad

Disecar 5 videos elegidos por Rolando; él revisa las fichas. Aceptación: hook, marco y CTA correctos en
5/5; métricas de ritmo dentro de ±15% de un conteo manual en 2 videos; ≥ 1 activo transpuesto útil por
video aprobado por Rolando.
