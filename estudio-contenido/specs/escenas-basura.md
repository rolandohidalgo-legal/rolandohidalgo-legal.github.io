# Escenas basura: detección y corte

**Definición operativa:** un segmento es basura si no aporta a hacer o completar el clip. Hay tres familias:

1. **Técnica:** no se ve o no se oye bien (negro, congelado, borroso, sin cara, ruido, cámara moviéndose).
2. **De toma:** el contenido está, pero hay una versión mejor o es un error (retomas, frases cortadas,
   muletillas, silencios largos, "¿ya está grabando?", marcadores "corta/repito").
3. **Editorial:** se ve y se oye bien, pero no sirve para la tesis del clip (digresiones, repetición de una
   idea ya dicha, relleno). En modo `guion`, todo lo que no cubre una línea del guion es candidato.

## 1. Protocolo de grabación (hace que todo lo demás funcione)

Va en cada ficha de grabación (ver [`estrategia-y-guiones.md`](estrategia-y-guiones.md) §6):

- Grabar en vertical 9:16, **30 fps fijos** (desactivar frame rate automático), 1080p o 4K.
- Al iniciar cada toma: **un aplauso** frente a la cámara (marca de sincronía y de inicio).
- Si te equivocas: **pausa de 2 segundos, di "repito"** y vuelve a decir **la frase completa** desde el inicio.
- Para descartar todo lo anterior de un bloque: di **"corta"**.
- Al terminar un guion: di **"fin"** y deja 1 s en silencio.
- Un archivo por guion cuando sea posible. Si son varios guiones seguidos, decir "guion dos", "guion tres".

Los marcadores (`repito`, `corta`, `fin`, `guion N`, aplauso) son basura por definición y además dan
contexto para decidir qué se descarta alrededor.

## 2. Señales (etapa E3, `tools/limpieza/senales.py`)

| Señal | Cómo | Parámetros iniciales |
|---|---|---|
| Silencios | Silero VAD sobre `voz16k.wav` (respaldo: `silencedetect=n=-35dB:d=0.35`) | habla mínima 200 ms |
| Negro | `blackdetect=d=0.2:pix_th=0.10` | |
| Congelado | `freezedetect=n=-60dB:d=0.5` | |
| Borroso | `blurdetect` por frame sobre proxy, umbral por percentil del propio video (p90) | |
| Cambio de escena | `scdet=threshold=10` o PySceneDetect `ContentDetector` | |
| Cara | MediaPipe Face Detection a 2 fps sobre proxy | presencia, bbox, confianza ≥ 0.6 |
| Aplauso | Picos de onset de banda ancha y < 80 ms de duración en `voz48k.wav` | |
| Marcadores de voz | Palabras del transcript: `repito`, `corta`, `otra vez`, `de nuevo`, `fin`, `guion <n>` (normalizado sin tildes) | |
| Muletillas | `eh`, `ehh`, `mmm`, `este` (solo aislado entre pausas ≥ 150 ms), `o sea` al inicio de frase, `bueno` al inicio de bloque | |
| Confianza ASR baja | promedio de `confidence` < 0.6 en la frase | |

## 3. Clasificación (etapa E5, `tools/limpieza/clasificar.py` + Claude)

### 3.1 Segmentación

Segmentos = frases del transcript + huecos entre frases. Un hueco es su propio segmento (normalmente basura).

### 3.2 Reglas deterministas (primero, sin LLM)

| Código de motivo | Regla | Decisión |
|---|---|---|
| `silencio_inicial` / `silencio_final` | Antes de la primera frase útil / después de "fin" | basura |
| `silencio_largo` | Hueco > 600 ms dentro del discurso | se recorta a 200 ms (no se elimina la frase) |
| `marcador` | Segmento que contiene un marcador de voz o aplauso | basura |
| `corta` | Todo lo que va desde la última frase conservada hasta "corta" | basura |
| `retoma_anterior` | Frase A seguida (≤ 3 frases después) por frase B con similitud `rapidfuzz.token_set_ratio ≥ 75` sobre los primeros 8 términos, o B precedida de "repito" | A basura, B conservar (`reemplazado_por`) |
| `frase_cortada` | Frase sin cierre seguida de silencio y de una frase que repite su inicio | basura |
| `muletilla` | Muletilla aislada | basura (se elimina solo la palabra con márgenes de 40 ms) |
| `negro` / `congelado` | > 50% del segmento | basura |
| `borroso`, `sin_cara`, `asr_baja` | > 40% del segmento | revisar |

### 3.3 Revisión con Claude (texto)

El `editor-video` recibe una tabla compacta (id, tiempos, texto, motivos ya asignados) y, en modo `guion`,
el guion numerado por líneas `G01…Gnn`. Decide:

- Alinear cada segmento a una línea del guion (`linea_guion`) o marcar `fuera_de_guion`.
- Si dos segmentos cubren la misma línea: conservar el más fluido y completo (menos muletillas, mayor
  confianza ASR, más cercano al texto del guion), salvo que el anterior sea claramente mejor.
- `fuera_de_guion` → conservar solo si añade valor (ejemplo concreto, aclaración); si no, `basura` con
  motivo `editorial_digresion` o `editorial_repeticion`.
- En modo `libre`: identificar la tesis del clip en una frase y aplicar el mismo criterio editorial.
- Verificar que lo conservado se entiende de corrido: ninguna referencia a algo eliminado ("como dije…").

### 3.4 Revisión visual con `revisor-frames` (Haiku)

Solo para segmentos `revisar` y para los 300 ms alrededor de cada corte propuesto.

- `tools/limpieza/hojas.py` arma hojas de contacto de 4×4 miniaturas (360 px de ancho) con el `segmento_id`
  y el tiempo impresos en cada celda.
- El revisor devuelve JSON por celda: `ok | fuera_de_cuadro | ajustando_camara | mirando_fuera | obstruido | desenfocado | expresion_incomoda`.
- Un segmento con ≥ 50% de celdas no `ok` pasa a `basura` (motivo visual); si 20–50%, se mantiene
  `revisar` y va al checkpoint.

### 3.5 Salidas para el checkpoint 1

- `limpieza.md`: tabla con id, tiempos, decisión, motivo y texto; los `revisar` arriba.
- `rough.mp4`: corte en bruto a 540p, sin efectos (concatenación ffmpeg de lo conservado), con el
  `segmento_id` quemado en una esquina para que Rolando diga "recupera S0014" o "quita S0021".

## 4. Del corte aprobado a la EDL (etapa E7)

1. **Márgenes:** `inMs = inicio_primera_palabra − 80`, `outMs = fin_ultima_palabra + 120`, sin invadir la
   palabra vecina descartada.
2. **Ajuste a silencio:** mover cada borde al punto de menor energía dentro de ±40 ms.
3. **Fusionar** cortes contiguos separados por < 120 ms en la fuente.
4. **Voz continua:** `tools/montaje/voz.py` concatena los tramos de `voz48k.wav` con fundidos de 8 ms en
   cada unión → `voz_editada.wav`. Silencios internos recortados a ≤ 200 ms.
5. **Punch-in en jump cuts:** cuando dos cortes consecutivos vienen de la misma toma continua (cara en
   posición similar), alternar `zoom` 1.0 ↔ 1.12, centrado en el bbox de la cara (`centro`), para ocultar el
   salto. No aplicar en los primeros 1.5 s si hay overlay de hook encima del rostro.
6. **Duración objetivo:** según el guion (`duracion_objetivo_s`); si se pasa en > 15%, proponer qué recortar
   (segmentos `editorial` de menor valor) en vez de acelerar la voz.

## 5. Modo B: varios clips de un bruto largo (`clips-de-bruto-largo`)

Para charlas, entrevistas, lives o podcasts.

1. Transcribir completo; dividir en bloques temáticos (cambio de tema por similitud de embeddings o, más
   simple, Claude sobre ventanas de 3 minutos con solapamiento de 30 s).
2. Para cada candidato (20–90 s) puntuar 0–10: **hook** en los primeros 3 s, **autonomía** (se entiende sin
   contexto), **valor** (enseña o sorprende), **cierre** (termina en idea completa), **encaje con pilares**.
3. Proponer los 5–10 mejores con hook sugerido (texto en pantalla) y razón. Rolando elige.
4. Cada clip elegido se convierte en un proyecto `modo: clip` que sigue el pipeline desde E5.

## 6. Prueba de calidad (F1)

Video de prueba de 90–120 s grabado a propósito con: 2 retomas con "repito", 1 "corta", muletillas,
un silencio de 3 s, 2 s fuera de cuadro y un tramo desenfocado. Rolando etiqueta a mano qué es basura
(`tools/tests/fixtures/etiquetas.json`). Aceptación: **precisión ≥ 0.9 y recall ≥ 0.85** sobre la duración
etiquetada como basura, y cero frases útiles completas eliminadas.
