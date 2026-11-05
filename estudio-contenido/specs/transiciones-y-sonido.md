# Transiciones, sonido y QA

## 1. Transiciones (etapa E8, `tools/montaje/transiciones.py`)

### 1.1 Tipos de corte

| Tipo de corte | Cómo se detecta | Tratamiento por defecto |
|---|---|---|
| Jump cut (misma toma, se quitó algo) | Cortes consecutivos de la misma toma | **Corte seco + punch-in** (no es transición) |
| Cambio de bloque del guion | `linea_guion` pasa a otro bloque, o `titulo_seccion` | Transición "de bloque" |
| Elemento de lista | Overlay `lista` | Transición corta o solo SFX |
| Cierre / CTA | Último bloque | Fundido a color o corte con SFX |
| Cambio de toma o locación | `cortes_escena` o cara muy distinta | Transición de bloque |

### 1.2 Catálogo

Todas son **sin solapamiento**: los últimos N/2 frames del corte A animan la salida y los primeros N/2 del
corte B animan la entrada. La voz es pista aparte y no se toca. Duración `N` = 6–12 frames a 30 fps.

| Id | Efecto | Frames | SFX por defecto | Presets |
|---|---|---|---|---|
| `punch_in` | Escala 1.0→1.12 (o al revés) instantánea | 0 | ninguno (o `click_suave` 1 de cada 4) | todos |
| `slide_izq` / `slide_der` | Empuje horizontal con desenfoque de movimiento | 8 | `whoosh_corto` | toga, pulso, pizarra |
| `whip` | Paneo rápido con blur fuerte | 6 | `swish` | pulso |
| `zoom_through` | Zoom 1→1.6 con blur, entra B de 1.6→1 | 8 | `whoosh_grave` | pulso |
| `pagina` | Paso de página (hoja de expediente) | 10 | `papel` | toga, expediente |
| `fundido_color` | Fundido a color del preset y vuelta | 12 | `riser_corto` o nada | todos |
| `flash_suave` | Flash blanco 60% en 4 frames | 4 | `obturador` | toga, pulso |
| `glitch` | Desplazamiento RGB 3 frames | 4 | `glitch` | pulso, solo temas de tecnología/IA |
| `mascara_circular` | Círculo que revela B desde el centro de la cara | 10 | `whoosh_corto` | pizarra, pulso |

Implementación: componentes Remotion propios en `remotion/src/transiciones/` que reciben `progreso` 0→1
(usando `interpolate` y `spring`). Se puede reutilizar la lógica de presentaciones de `@remotion/transitions`
(`slide`, `wipe`, `fade`, `clockWipe`, `flip`) siempre que se monte sin solapamiento temporal.

### 1.3 Reglas (el motor las aplica en este orden)

1. **Nada en los primeros 1.5 s** salvo `punch_in` (el hook necesita estabilidad).
2. **Separación mínima:** 6 s entre transiciones "reales" (todas menos `punch_in` y corte seco).
3. **Densidad:** según preset (toga/expediente 3–5 por minuto, pizarra 3–4, pulso 5–7), contando solo reales.
4. **No repetir** el mismo tipo en dos transiciones reales consecutivas.
5. **Ningún tipo > 40%** de las transiciones reales de un video.
6. Solo tipos de `transiciones_permitidas` del preset.
7. Solo en cortes donde la voz tenga una pausa ≥ 120 ms alrededor (la transición cae en el silencio).
8. **Prioridad de ubicación:** cambio de bloque > cambio de toma > ítem de lista > resto.
9. Selección del tipo: rotación ponderada con semilla `hash(video_id)` (reproducible), pesos por preset y
   por tipo de corte. Ej. cambio de bloque en toga: `pagina 0.35, slide 0.35, fundido_color 0.15, flash_suave 0.15`.
10. Punch-in: alternar en jump cuts; tras 3 punch-ins seguidos, el siguiente jump cut puede ser corte seco.

El motor escribe `transiciones[]` y un resumen (`n`, tipos, separación mínima real) que el QA verifica.

## 2. Sonido (etapa E9, `tools/montaje/sonido.py`)

### 2.1 Biblioteca

`brand/sfx/manifest.json`:

```json
[{ "id": "whoosh_corto_02", "archivo": "brand/sfx/whoosh_corto_02.wav", "familia": ["sobria", "energica"],
   "etiquetas": ["transicion", "slide"], "duracion_ms": 420, "pico_ms": 180, "lufs": -18.5,
   "fuente": "Pixabay", "licencia": "Pixabay Content License", "url": "…" }]
```

- `pico_ms`: dónde está el golpe del sonido; se alinea con el frame central de la transición.
- Kit mínimo (F3): 4 whoosh, 3 swish, 3 pop, 2 click, 2 papel, 2 teclas, 2 obturador, 2 riser, 2 impacto
  suave, 2 ding, 1 glitch. 2–3 variantes por tipo para no repetir el mismo archivo seguido.
- Fuentes: Pixabay y Freesound filtrado por CC0 (gratis), Epidemic Sound (si hay suscripción), ElevenLabs
  Sound Effects para sonidos a medida. Guardar licencia y URL de cada archivo.
- Música: `brand/musica/manifest.json` con `energia` (1–5), `mood`, `bpm`, `licencia`. Solo música con
  licencia para redes. El audio en tendencia de TikTok se agrega a mano en la app (pieza `publicacion: manual`).

### 2.2 Dónde va un SFX

| Evento | SFX | Ganancia relativa |
|---|---|---|
| Transición real | El de la transición (tabla 1.2) | −14 a −18 dB |
| Aparición de `hook` | `impacto_suave` o `pop` | −14 dB |
| `cita_legal` | `papel` o `click` | −18 dB |
| `lista` (cada ítem) | `pop` o `tick` (alternando variantes) | −18 dB |
| `dato` / cifra | `ding` suave | −20 dB |
| `palabra_clave` | `click_suave` | −20 dB |
| Texto que se escribe (expediente) | `teclas` en loop corto | −24 dB |
| `cta` | `riser_corto` → `pop` | −16 dB |

Reglas:
- Máximo 1 SFX cada 2 s; si chocan, gana el de mayor prioridad (transición > hook > lista > cita > dato > clave).
- Un SFX no puede tapar el inicio de una palabra enfatizada: si su pico cae dentro de una palabra, moverlo
  al silencio más cercano dentro de ±150 ms o descartarlo.
- No repetir el mismo archivo en dos SFX consecutivos.
- Preset `toga`/`expediente`: familia sobria y ~50% de la densidad de `pulso`.

### 2.3 Música y mezcla

- Música opcional por preset: toga y expediente bajo y sin percusión marcada; pulso con ritmo; pizarra neutro.
- Cama de música a −26 dB relativa a la voz, con **ducking** (−8 dB extra cuando hay voz, ataque 80 ms,
  liberación 300 ms; en Remotion, volumen por frame calculado a partir de los intervalos de habla de la EDL).
- Fade in 600 ms, fade out 1200 ms. La música termina con el video, no se corta en seco.
- Objetivo final: **−14 LUFS integrado, −1 dBTP**. Voz limpia antes: filtro paso alto 80 Hz y, si hay
  ruido, `afftdn` suave.

## 3. QA (etapa E11, agente `qa-video`)

| Check | Cómo | Umbral |
|---|---|---|
| `loudness` | `ffmpeg -af ebur128` | −14 ± 1 LUFS, pico ≤ −1 dBTP |
| `sincronia` | Para 10 palabras al azar, comparar `startMs` del caption con el onset de voz en el render | ≤ 80 ms |
| `zona_segura_captions` | Capturas en el centro de cada página de captions; revisar posición | dentro de la zona útil |
| `cara_tapada` | Overlays vs bbox de cara | 0 casos |
| `transiciones` | Releer `montaje.json`: reglas 1.3.1–1.3.6 | todas cumplen |
| `sfx_densidad` | Reglas 2.2 | todas cumplen |
| `ortografia` | Captions contra glosario y corrector | 0 errores en términos del glosario |
| `duracion` | vs `duracion_objetivo_s` | ±15% |
| `primer_frame` | Primer frame con rostro u overlay de hook (sin negro, sin parpadeo) | sí |
| `revision_visual` | Hoja de contacto de 16 frames + frames de cada transición; el agente comenta | sin defectos graves |

Si falla, `qa-video` escribe acciones concretas en `qa.json`; el `editor-video` las aplica y re-renderiza.
Máximo 2 ciclos; después, va al checkpoint 2 con la lista de pendientes.
