# Estilos, captions y paletas

> **Primero lo que ya usan.** Tarea F0.5: Rolando entrega 2–3 videos o capturas de los estilos actuales.
> Sonnet extrae colores (cuentagotas sobre frames), fuentes (o la más parecida en Google Fonts), tamaño,
> posición y animación de captions, y **sobrescribe** los presets de abajo. Los valores de este documento
> son el punto de partida, basados en la paleta del sitio web (`site/assets/style.css`).

## 1. Lienzo y zonas seguras (1080×1920)

```text
 y=0    ┌─────────────────────────┐
        │  ZONA SUPERIOR  (0–220) │  nombre de cuenta, pestañas: nada importante aquí
 y=220  ├─────────────────────────┤
        │                         │
        │  ZONA ÚTIL              │  overlays de hook y títulos: 260–700
        │                         │  rostro: idealmente 450–1100
        │                         │  captions: centro de la caja en y≈1230 (64%)
        │                    ┌────┤
 y=1500 ├────────────────────┤ UI │  botones laterales: x>960 de 900 a 1700
        │  ZONA INFERIOR      │    │  descripción, audio, botones: nada importante
 y=1920 └─────────────────────┴────┘
```

- Márgenes laterales del texto: 90 px. Nada importante en `x > 960` entre `y=900` y `y=1700`.
- Si el bbox de la cara invade la zona de captions, subir captions a `y≈0.30` (encima de la cabeza) para ese tramo.

## 2. Reglas de captions (todas los presets)

- Páginas de 1–2 líneas, máximo **22 caracteres por línea** (Inter 68 px) o lo que defina el preset.
- Cortar página en: puntuación, pausa ≥ 250 ms, o al llegar al máximo. Nunca dejar un artículo o
  preposición solo al final de línea.
- Tiempo mínimo en pantalla por página: 500 ms. Sin huecos < 120 ms entre páginas (se extiende la anterior).
- Palabra activa resaltada (modo karaoke) según preset.
- **Énfasis:** máximo 1 palabra por página y ~1 cada 3 s. Claude elige: términos legales clave, cifras,
  plazos, negaciones fuertes ("NO", "nunca"), la palabra del CTA. Se marca `enfasis: true` en `montaje.json`.
- Ortografía: corregir con el glosario (`CLAUDE.md` §Glosario): COIP, COGEP, Código del Trabajo, LOPDP,
  Corte Constitucional, IESS, SRI, nombres propios. Números como cifras ("15 días", "art. 188").
- Sin emojis en captions (marca de abogado). Excepción: preset `pulso`, máximo 2 por video, y solo ✅ ❌ ⚠️.
- Implementación: `createTikTokStyleCaptions` de `@remotion/captions` para paginar; componente propio
  `CaptionPage` por preset.

## 3. Presets

Cada preset es `brand/estilos/<nombre>.json` con esta forma:

```json
{
  "nombre": "toga",
  "paleta": { "fondo": "#faf9f6", "tinta": "#26231e", "acento": "#a23c30", "suave": "#f5e4dd", "contorno": "#00000080" },
  "fuentes": { "titulo": "Gelasio", "texto": "Inter" },
  "captions": {
    "fuente": "Inter", "peso": 800, "tamano": 68, "max_chars_linea": 22, "lineas": 2,
    "color": "#ffffff", "activa": "#f5e4dd", "enfasis": { "color": "#ffffff", "fondo": "#a23c30", "escala": 1.08 },
    "sombra": "0 4px 18px rgba(0,0,0,.55)", "caja": null, "y": 0.64,
    "animacion": "fade_up_6f", "mayusculas": false
  },
  "overlays": {
    "hook": { "fuente": "Gelasio", "peso": 700, "tamano": 84, "color": "#26231e", "fondo": "#faf9f6", "radio": 18, "animacion": "slide_down_10f" },
    "cita_legal": { "estilo": "ficha", "icono": "balanza", "fondo": "#faf9f6", "borde": "#a23c30" },
    "lista": { "numero_color": "#a23c30", "fondo": "#faf9f6" },
    "lower_third": { "texto": "Rolando Hidalgo · Abogado", "segundos": [2, 6] },
    "cta": { "fondo": "#a23c30", "color": "#ffffff" }
  },
  "barra_progreso": { "color": "#a23c30", "alto": 6 },
  "gradacion": { "lut": null, "contraste": 1.04, "saturacion": 0.96, "calidez": 0.02 },
  "transiciones_permitidas": ["corte", "punch_in", "slide_izq", "slide_der", "pagina", "fundido_color", "flash_suave"],
  "sfx_familia": "sobria"
}
```

| Preset | Cuándo | Paleta | Captions | Overlays y ritmo |
|---|---|---|---|---|
| **toga** (sobrio, autoridad) | MOFU, sentencias explicadas, opinión | crema `#faf9f6`, tinta `#26231e`, vino `#a23c30`, rosa suave `#f5e4dd` | Inter 800, blanco con sombra, énfasis con fondo vino | Fichas tipo papel, Gelasio en títulos, 3–5 transiciones/min |
| **expediente** (documental, oscuro) | Casos reales, historias, actualidad | fondo `#1b1815`, tinta `#efe9de`, acento `#e0806e`, papel `#f4eee2` | IBM Plex Mono 600 en cinta (caja papel, texto tinta), aparición tipo máquina de escribir | Hojas de expediente, sellos, resaltador; SFX de papel y teclas |
| **pulso** (alto ritmo, alcance) | TOFU, mitos, listas rápidas, tendencias | blanco, negro, amarillo `#FFD84D`, vino `#a23c30` | Inter 900 MAYÚSCULAS, 1–3 palabras por página, contorno negro 6 px, pop 0.85→1 en 5 frames, énfasis amarillo | Punch-ins frecuentes, 5–7 transiciones/min, más SFX |
| **pizarra** (explicativo, tutorial) | Pasos de un trámite, plazos, cálculos | grafito `#22262b`, blanco, verde tiza `#9ad1a5`, acento `#e0806e` | Inter 700 blanco en caja semitransparente `#000000A6` radio 14 | Pasos numerados, barra de progreso por pasos, flechas y subrayados dibujados |

## 4. Elección del preset

1. El guion trae `preset_sugerido` según marco y embudo (tabla de arriba).
2. Series: una serie mantiene su preset (consistencia reconocible).
3. Rotación: no más de 3 videos seguidos con el mismo preset fuera de una serie.
4. El analista puede recomendar cambios en el playbook ("pulso supera a toga en TOFU: +18% retención 3 s, n=8").

## 5. Overlays: cuándo los pone Claude (etapa E7)

| Tipo | Disparador en el transcript | Límite |
|---|---|---|
| `hook` | Siempre, 0–2.6 s, texto del hook del guion (3–7 palabras) | 1 |
| `cita_legal` | Mención de norma, artículo o sentencia | 1 cada 15 s |
| `lista` | Enumeraciones ("primero", "segundo", "tres cosas") | por ítem |
| `dato` | Cifras, plazos, montos | 1 cada 10 s |
| `palabra_clave` | Concepto central dicho por primera vez | 2 por video |
| `titulo_seccion` | Cambio de bloque del guion | por bloque, en videos > 45 s |
| `broll` | Sugerido por el guion (imágenes propias o Pexels con licencia) | opcional |
| `lower_third` | Nombre y rol, 2–6 s, en videos de autoridad | 1 |
| `cta` | Últimos 3–5 s | 1 |

Ningún overlay tapa la cara (usar bbox de `senales.json`) ni coincide con más de un overlay a la vez.
