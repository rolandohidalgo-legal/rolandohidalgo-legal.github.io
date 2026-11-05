# F0b · Diagnóstico inicial y base de conocimiento

**Objetivo:** poblar el sistema con el contexto del negocio, la historia del contenido, la audiencia, la
competencia y el conocimiento propio, antes de que los agentes empiecen a decidir.
**Prerrequisitos:** F0 (cuentas conectadas para exportar datos). I-02 y I-05 usan el pipeline de
ingeniería inversa (F4b.1–F4b.3); si F4b aún no existe, hacer I-02 solo con métricas y completar la
disección cuando F4b esté listo.
**Lee antes:** `specs/base-de-conocimiento.md` completo.

## Tareas

### F0b.1 Estructura y skill de entrevista
- Crear `data/contexto/`, `data/informes/diagnostico/`, `data/conocimiento/`, `data/sistema/bitacora.jsonl`, `data/decisiones.md`.
- Instalar `plantillas/skills/entrevista-diagnostico/SKILL.md`.
- Añadir a `CLAUDE.md`: "Antes de cualquier tarea, lee los archivos de `data/contexto/` que correspondan a tu rol".
- **Aceptación:** `/entrevista-diagnostico I-01` inicia la primera tanda de preguntas.

### F0b.2 Entrevistas (I-01, I-03, I-07, I-08)
- Una sesión por informe (15–25 min de Rolando cada una, por texto o audio).
- Escribir cada informe con el formato de la spec §3 y su archivo de contexto.
- **Aceptación:** los 4 informes existen, cada pregunta respondida o declarada como vacío; Rolando confirma los 4 resúmenes de contexto.

### F0b.3 Exportación del histórico (I-02)
- `tools/diagnostico/historico.py`: trae todas las piezas publicadas que las APIs permitan (Meta Graph,
  YouTube Analytics, Upload-Post si da histórico) con sus métricas; para TikTok, guiar a Rolando a
  exportar sus datos y estadísticas, o procesar capturas con visión.
- Poblar `catalogo.jsonl` con `estado: historico` y etiquetar atributos (Claude etiqueta a partir de la
  descripción, la transcripción y la portada; transcribir las piezas con `video-transcribir` si se pueden descargar).
- Calcular medianas y percentiles por red → `data/metricas/linea_base.json`.
- Disecar top 10 y bottom 10 con `disecar-referencia` (modo propio).
- **Aceptación:** informe I-02 con las 5 preguntas respondidas; `linea_base.json` existe; ≥ 3 entradas de
  playbook con `evidencia: historica` (o declaración explícita de que no hay datos suficientes).

### F0b.4 Audiencia (I-04)
- Exportar comentarios de las últimas 50 piezas; Rolando aporta 20–50 preguntas reales anonimizadas.
- Agrupar por tema e intención, contar, extraer vocabulario. Escribir `data/conocimiento/preguntas.csv`
  (`pregunta,palabras_textuales,tema,intencion,frecuencia,fuente`).
- **Aceptación:** informe I-04 + `contexto/audiencia.md` con 2–3 perfiles, aprobados por Rolando.

### F0b.5 Competencia (I-05)
- Con F4b listo: `/competencia` sobre 3–5 cuentas de la watchlist y `/patrones`.
- **Aceptación:** `contexto/competencia.md` con huecos concretos (temas o formatos que nadie cubre bien).

### F0b.6 Conocimiento propio (I-06)
- Rolando da acceso a la carpeta del vault de Obsidian (o la exporta), al Excel de ideas y a los artículos del blog.
- `tools/diagnostico/inventario.py`: lista de notas con tipo (ficha de sentencia, petitorio, alegación, nota) y fecha.
- Claude propone 0–3 ideas por activo relevante y 3–5 series candidatas.
- **Aceptación:** `contexto/conocimiento-propio.md` + ≥ 20 ideas en `ideas.csv` con `fuente: conocimiento:*`.

### F0b.7 Telemetría del sistema
- El Director registra cada checkpoint en `bitacora.jsonl` (spec §5.1). Implementar
  `tools/sistema/bitacora.py registrar …` y llamarlo desde los skills con checkpoint.
- Skill `revision-sistema` (`plantillas/skills/revision-sistema/SKILL.md`) para el informe del §5.
- **Aceptación:** un checkpoint de prueba queda registrado; `/revision-sistema` genera un informe vacío
  con las preguntas S1–S8 y "datos insuficientes" donde corresponda.

## Salida de la fase
`data/contexto/` completo (7 archivos), 8 informes de diagnóstico, línea base de métricas, ideas
iniciales y telemetría activa. Desde aquí, el estratega, el copywriter y el trafficker trabajan con contexto real.
