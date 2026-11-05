# F4 · Estrategia, radar y guiones

**Objetivo:** `/radar`, `/guion` y `/semana` producen ideas con score y guiones listos para grabar, con
fact-check, revisión de cumplimiento y ficha de grabación.
**Prerrequisitos:** F0 y, idealmente, F0b (sin contexto, el radar usa supuestos marcados).
**Lee antes:** `specs/estrategia-y-guiones.md`, `specs/base-de-conocimiento.md` §1, `data/contexto/*`.

## Tareas

### F4.1 Datos base
- `data/ideas.csv` con las columnas de estrategia §3; `brand/hooks.md` con 3 ejemplos por tipo de hook
  adaptados a derecho ecuatoriano; `brand/ctas.md` por embudo.
- **Aceptación:** `tools/estrategia/ideas.py validar` en verde (columnas, rangos 1–5, score recalculado).

### F4.2 Radar — skill `radar-tendencias`
- Orquestar las fuentes de estrategia §2. Llamar a `reporte-noticias-jrh` y `radar-temas-jrh`.
- `tools/estrategia/trends.py`: Google Trends Ecuador (pytrends; si falla, marcar la fuente como no disponible
  y seguir) y autocompletado de YouTube (`suggestqueries.google.com` con `ds=yt`, `hl=es`, `gl=EC`).
- Incorporar atípicos recientes de la watchlist (F4b) y preguntas nuevas de `data/conocimiento/preguntas.csv`.
- Puntuar, deduplicar contra `ideas.csv` y el catálogo (no repetir un tema publicado hace < 60 días salvo serie).
- Salida: `data/radar/AAAA-SS.md` (top 10 con por qué, marco y hook sugeridos) + filas nuevas en `ideas.csv`.
- **Aceptación:** una corrida real deja ≥ 10 ideas con fuente trazable; ninguna duplicada.

### F4.3 Guion — skill `guion-estrategico`
- Formato exacto de estrategia §5, con 3 hooks de tipos distintos y ficha de grabación §6.
- Investigación con `investigacion-contenido-jrh` (y `ficha-sentencia` si es `caso_real`).
- Pasar `fact-checker-guion`; corregir. Pasar `legal:compliance-check`; corregir o marcar `revisar`.
- Consultar playbook (formatos ganadores), `brand/hooks.md` y marcos `origen: inversa`.
- **Aceptación:** 3 guiones de prueba (marcos distintos) aprobados por Rolando con ≤ 1 ronda de cambios cada uno.

### F4.4 Plan semanal — skill `plan-semanal`
- Algoritmo de estrategia §7; agenda de grabación ordenada por locación/vestuario con lista de B-roll.
- Registrar cada guion aprobado en el catálogo (`estado: guion_aprobado`).
- **Aceptación:** plan de una semana que cumple las restricciones de mezcla (verificado por `tools/estrategia/plan.py validar`).

### F4.5 Carrusel derivado (opcional)
- A partir de un guion aprobado, generar el texto de un carrusel de 6–8 láminas con `content-creator-social`
  y renderizar las láminas como stills de Remotion con el preset (`npx remotion still`).
- **Aceptación:** 1 carrusel de prueba aprobado.
