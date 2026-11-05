---
name: radar-tendencias
description: Radar semanal o bajo demanda de temas. Noticias jurídicas de Ecuador, tendencias de búsqueda, preguntas de la audiencia, atípicos de la competencia y conocimiento propio, con score de ideas. Usar con "/radar", "qué grabo esta semana", "qué está en tendencia".
---

# Radar de tendencias

Spec: `docs/specs/estrategia-y-guiones.md` §2–3. Contexto: `data/contexto/*`.

1. Llama a `reporte-noticias-jrh` y `radar-temas-jrh` (actualidad jurídica).
2. `python tools/estrategia/trends.py --pais EC` (Google Trends + autocompletado de YouTube). Si falla una fuente, anótalo y sigue.
3. Lee atípicos recientes de la watchlist (`data/competencia/`) y preguntas nuevas (`data/conocimiento/preguntas.csv`).
4. Genera ideas (tema + ángulo), puntúa D, R, U, L, A, Riesgo y calcula el score con `python tools/estrategia/ideas.py score`.
5. Deduplica contra `ideas.csv` y el catálogo (60 días).
6. Escribe `data/radar/AAAA-SS.md` (top 10 con por qué, marco y tipo de hook sugeridos) y agrega filas a `ideas.csv`.
7. Pregunta a Rolando cuáles pasan a guion.
