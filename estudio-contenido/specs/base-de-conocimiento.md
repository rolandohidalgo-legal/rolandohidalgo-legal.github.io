# Base de conocimiento: cómo se alimenta el sistema y cómo decide sobre sí mismo

Sin contexto, los agentes deciden con promedios genéricos de internet. Con contexto, deciden como alguien
que conoce el negocio de Rolando. Este documento define **qué información entra, con qué informes, qué
preguntas responde cada uno, cómo se hacen y cómo se convierte en decisiones**, incluidas las decisiones
sobre el propio sistema.

## 1. Tres capas

```text
FUENTES CRUDAS                    INFORMES (largos, con evidencia)          CONTEXTO DESTILADO (corto, lo leen los agentes)
exportaciones de redes,     ──►   data/informes/diagnostico/I-0x-*.md  ──►  data/contexto/negocio.md
entrevistas (texto o audio),      data/informes/semana-*.md                 data/contexto/audiencia.md
comentarios y DMs, vault,         data/informes/mes-*.md                    data/contexto/marca-y-voz.md
métricas, bitácora del sistema    data/informes/sistema-*.md                data/contexto/lo-que-funciona.md  (= playbook)
                                                                            data/contexto/competencia.md
                                                                            data/contexto/conocimiento-propio.md
                                                                            data/contexto/sistema.md
```

- **Informes:** completos, con datos, n y fuentes. Se guardan para siempre.
- **Contexto destilado:** máximo 1 página por archivo, en viñetas, con fecha de actualización y enlace al
  informe que lo respalda. Es lo que cada agente lee al empezar (lo indica `CLAUDE.md`). Se regenera
  cuando cambia un informe. Así el contexto de los agentes no se satura.
- **Bitácoras:** `data/sistema/bitacora.jsonl` (qué pasó en cada checkpoint) y `data/decisiones.md`
  (qué se decidió, qué se esperaba, cuándo se revisa).

## 2. Diagnóstico inicial (fase F0b): ocho informes

Cada informe responde **preguntas explícitas**. Si una pregunta no se puede responder, se anota como
vacío y qué haría falta para responderla.

### I-01 · Negocio y objetivos (fuente: entrevista a Rolando)
Preguntas:
1. ¿Qué servicios ofreces, a qué precio aproximado y cuáles quieres vender más?
2. ¿Qué cliente quieres y cuál no (materias, ciudades, capacidad de pago, tipo de caso)?
3. ¿Cuántos clientes nuevos al mes puedes atender? ¿Qué pasa si llegan más?
4. ¿Qué es un lead útil para ti? ¿Qué pasa hoy cuando alguien escribe?
5. Metas a 3, 6 y 12 meses: seguidores, leads/mes, consultas/mes, clientes/mes, ingresos atribuibles, autoridad (charlas, prensa).
6. ¿Cuánto tiempo a la semana puedes dar al contenido (grabar, aprobar)?
7. ¿Qué no harías nunca en redes? (límites éticos, de imagen, temas)
8. ¿Cuánto puedes invertir al mes en herramientas y en ads?
Salida: `contexto/negocio.md` con metas numéricas que el informe mensual mide.

### I-02 · Auditoría retrospectiva del contenido propio (fuente: datos)
Preguntas:
1. ¿Qué has publicado (cuántas piezas, en qué redes, con qué frecuencia, desde cuándo)?
2. ¿Cuáles son las medianas por red (vistas, retención, guardados+compartidos/1k, seguidores/1k)? → **línea base**.
3. ¿Cuáles son tus 10 mejores y 10 peores piezas, y en qué se diferencian (tema, marco, hook, duración, estilo, hora)?
4. ¿Qué piezas trajeron conversaciones o clientes (según tu memoria y tus chats)?
5. ¿Qué temas o formatos dejaste de hacer y por qué?
Método: exportar el historial (Graph API de Meta para cuentas profesionales; YouTube Analytics; TikTok
Studio y la descarga de datos de la cuenta; si falta algo, capturas), etiquetar cada pieza con los
atributos del catálogo (`contratos-de-datos.md` §8) y **disecar** las 10 mejores y 10 peores con el pipeline de
ingeniería inversa aplicado a contenido propio (`ingenieria-inversa.md` §2–3).
Salida: `catalogo.jsonl` poblado con el histórico (estado `historico`), percentiles iniciales para el score
(el sistema deja de marcar "provisional"), y primeras entradas del playbook con `evidencia: historica`.

### I-03 · Proceso de producción actual (fuente: entrevista + observación)
Preguntas:
1. Paso a paso, ¿cómo produces hoy un video, de la idea a la publicación?
2. ¿Cuánto tiempo te toma cada paso? ¿Cuál odias o postergas?
3. ¿Qué herramientas usas y cuánto pagas?
4. ¿Dónde se pierde calidad (audio, iluminación, guion, edición, constancia)?
Salida: tiempos de referencia por etapa (para medir el ahorro del sistema) y prioridades de automatización.

### I-04 · Audiencia y voz del cliente (fuente: datos + entrevista)
Preguntas:
1. ¿Quién te ve (edad, ciudad, género según insights) y quién te contrata? ¿Coinciden?
2. ¿Qué te preguntan en comentarios, DMs y consultas, **con qué palabras exactas**?
3. ¿Qué miedos, objeciones y malentendidos se repiten?
4. ¿En qué momento de su problema te encuentran (antes del conflicto, en medio, tarde)?
Método: exportar comentarios (API) y pedir a Rolando 20–50 preguntas reales de clientes **anonimizadas**
(sin nombres ni datos del caso); agrupar por tema e intención; contar frecuencias.
Salida: `contexto/audiencia.md` con 2–3 perfiles de audiencia, banco de preguntas (`data/conocimiento/preguntas.csv`),
y el "vocabulario del cliente" (cómo dicen las cosas) que usa el copywriter para SEO en TikTok.

### I-05 · Mercado y competencia (fuente: ingeniería inversa)
Preguntas: ¿quién compite por la atención y quién por el cliente? ¿qué formatos y ofertas usan? ¿qué
huecos dejan? ¿qué anuncios corren? Método: `/competencia` sobre la watchlist + `competitive-ads-extractor`.
Salida: `contexto/competencia.md`.

### I-06 · Conocimiento propio y activos (fuente: vault de Obsidian, blog, Excel de ideas, documentos)
Preguntas:
1. ¿Qué sabes que otros creadores no explican (sentencias fichadas, petitorios, experiencia de audiencias)?
2. ¿Qué material ya existe y puede volverse contenido (fichas, artículos, borradores, ideas guardadas)?
3. ¿Qué series naturales salen de ahí?
Método: inventario de notas (fichas de `ficha-sentencia`, `ficha-petitorio`, `ficha-alegacion`, notas de
`obsidian-notes-jrh`), artículos del blog, Excel de ideas; cada activo → 0–3 ideas en `ideas.csv` con `fuente: conocimiento:<archivo>`.
Salida: `contexto/conocimiento-propio.md` (índice de activos y series candidatas).

### I-07 · Marca y voz (fuente: videos actuales + entrevista)
Preguntas: ¿cómo quieres que te perciban en 3 palabras? ¿qué palabras usas y cuáles nunca? ¿tuteo o
usted? ¿humor sí o no? ¿qué estilos visuales usas hoy (F0.5)? Salida: `contexto/marca-y-voz.md`, presets.

### I-08 · Embudo y atribución actual (fuente: entrevista + últimos clientes)
Preguntas:
1. De tus últimos 10–20 clientes, ¿cómo llegó cada uno (referido, redes, buscador, otro)?
2. ¿Cuánto tarda alguien entre el primer mensaje y contratarte?
3. ¿Qué porcentaje de conversaciones se vuelve consulta y cuánto vale un cliente?
Salida: valor de un lead (base del CPL objetivo de ads) y línea base del embudo.

## 3. Cómo se hacen los informes (reglas para cualquier informe)

1. **Empiezan por las preguntas** (copiadas de esta spec) y terminan respondiéndolas una por una.
2. **Fuentes y n visibles:** cada cifra dice de dónde sale y sobre cuántos casos.
3. **Tres secciones separadas:** *Hechos* (datos) · *Interpretación* (hipótesis, con nivel de confianza) ·
   *Decisiones* (qué cambia, quién, desde cuándo, cuándo se revisa).
4. **Vacíos declarados:** lo que no se pudo responder y cómo conseguirlo.
5. **Salida doble:** el informe largo + actualización del archivo de `contexto/` que corresponda.
6. **Entrevistas en tandas:** el skill `entrevista-diagnostico` hace 3–5 preguntas por tanda. Rolando puede
   responder escribiendo o con un **audio** (se transcribe con `video-transcribir`); Claude extrae las respuestas,
   repregunta lo ambiguo y muestra el resumen para confirmar antes de guardarlo.
7. **Privacidad:** nada de nombres de clientes, números de causa ni datos sensibles. Si aparecen, se anonimizan antes de guardar.

## 4. Informes recurrentes

| Informe | Cuándo | Pregunta central | Spec |
|---|---|---|---|
| Semanal | Lunes | ¿Qué funcionó esta semana y qué cambiamos la próxima? | `metricas-y-decisiones.md` §4 |
| Mensual de estrategia | Primer lunes del mes | ¿Vamos hacia las metas de I-01? ¿Ajustamos pilares, mezcla, cadencia y ads? | ídem |
| **Revisión del sistema** | Mensual (corto) y trimestral (completo) | ¿El sistema cumple su propósito y a qué costo? ¿Qué cambiamos de él? | §5 |
| Actualización de diagnóstico | Cada 6 meses | Repetir I-02, I-04, I-05, I-08 con datos nuevos | §2 |

## 5. Revisión del sistema (el sistema decide sobre sí mismo)

### 5.1 Telemetría que lo hace posible

`data/sistema/bitacora.jsonl`, una línea por evento de checkpoint o etapa:

```json
{"ts":"2026-11-12T10:41:00-05:00","video_id":"RH-20261110-01","etapa":"checkpoint_1","resultado":"aprobado_con_cambios","correcciones":[{"tipo":"recuperar_segmento","n":2},{"tipo":"quitar_segmento","n":1}],"minutos_rolando":4,"minutos_maquina":11,"costo_usd":0.0}
```

Tipos de corrección por etapa: limpieza (`recuperar_segmento`, `quitar_segmento`), montaje (`caption_error`,
`overlay_mal`, `preset_cambiado`), sonido/transición (`sfx_quitar`, `transicion_cambiar`), copy (`reescritura_parcial`,
`reescritura_total`), guion (`cambio_hook`, `cambio_estructura`, `error_juridico`). El Director registra cada
checkpoint automáticamente.

### 5.2 Preguntas de la revisión

| # | Pregunta | Cómo se responde |
|---|---|---|
| S1 | ¿Nos acercamos a las metas de I-01 (seguidores, leads, clientes, ingresos)? | Métricas vs metas, tendencia de 4 semanas |
| S2 | ¿Cuánto tiempo de Rolando cuesta una pieza hoy vs la línea base de I-03? | `minutos_rolando` por pieza |
| S3 | ¿Qué etapa genera más correcciones y de qué tipo? | Bitácora agrupada por etapa y tipo |
| S4 | ¿Qué tan precisa es cada etapa? (limpieza, copy aprobado sin cambios, guiones sin error jurídico) | Tasas por etapa |
| S5 | ¿Cuánto cuesta el sistema al mes y por pieza (herramientas, ads, uso de Claude)? ¿Qué herramienta no se usa? | Costos vs uso |
| S6 | ¿Qué decisiones pasadas (`decisiones.md`) acertaron o fallaron? | Comparar resultado esperado vs observado |
| S7 | ¿Qué nivel de autonomía se puede subir o hay que bajar? | Criterios de `01-agentes-y-skills.md` §5 |
| S8 | ¿Qué falta que pedirías a una agencia y el sistema no hace? | Pregunta abierta a Rolando |

### 5.3 Decisiones típicas que salen de aquí

- Ajustar umbrales o reglas de una etapa con muchas correcciones (p. ej. muletillas mal detectadas).
- Crear un skill o regla nueva para una corrección repetida (si Rolando corrige lo mismo 3 veces, se vuelve regla).
- Subir o bajar el nivel de autonomía.
- Cancelar, cambiar o comprar herramientas.
- Cambiar el modelo de un agente (p. ej. Haiku → Sonnet en `revisor-frames` si falla mucho).
- Registrar cada decisión en `decisiones.md`:

```markdown
### D-007 · 2026-12-01 · Subir umbral de similitud de retomas de 75 a 80
- Por qué: 6 de 9 correcciones de limpieza en noviembre fueron frases distintas marcadas como retoma.
- Esperado: correcciones de limpieza −50% en diciembre.
- Revisar: 2027-01-05 · Resultado: (pendiente)
```

## 6. Mantenimiento continuo (sin informes)

- Cada pieza publicada actualiza `catalogo.jsonl` y, a los 7 días, su score.
- Cada lead se registra en `leads.csv` el mismo día (el Director pregunta en la sesión semanal por los que falten).
- Cada pregunta interesante de un comentario o DM va a `data/conocimiento/preguntas.csv` (Rolando la reenvía o la dicta).
- Cada ficha nueva del vault de Obsidian es candidata a idea (revisión mensual del inventario I-06).
