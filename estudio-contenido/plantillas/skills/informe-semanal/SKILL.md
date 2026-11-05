---
name: informe-semanal
description: Informe semanal (y mensual con --mes) de desempeño. Score por pieza, embudo hasta leads y clientes, análisis por atributos con n, decisiones propuestas, actualización del playbook y del contexto "lo que funciona". Usar con "/informe" o desde la tarea programada de los lunes.
---

# Informe semanal

Spec: `docs/specs/metricas-y-decisiones.md` §3–5 y `base-de-conocimiento.md` §3. Delegar en el subagente `analista`.

1. `git pull`; comprobar que hay snapshots de los últimos 7 días (si faltan, avisar qué recolector falló).
2. `python tools/metricas/score.py --ventana 7d` y consultas DuckDB por atributo (solo n ≥ 3).
3. Escribir `data/informes/semana-AAAA-SS.md` con las 7 secciones de la spec §4 (formato apoyado en `marketing:performance-report`).
4. Proponer decisiones con la tabla §5; actualizar `playbook.md` y `data/contexto/lo-que-funciona.md`.
5. Revisar decisiones con fecha vencida en `data/decisiones.md`.
6. Commit y resumen de 5 líneas para Rolando + pedidos pendientes (capturas de TikTok, leads).
Con `--mes`: ventana 28d, metas de `contexto/negocio.md`, y luego `revision-sistema`.
