# F6 · Métricas, informes y decisiones

**Objetivo:** recolección diaria automática, score por pieza, informe semanal y mensual, playbook vivo y
revisión del sistema.
**Prerrequisitos:** F5 (piezas publicadas con `post_id`), F0b (línea base y metas).
**Lee antes:** `specs/metricas-y-decisiones.md`, `specs/base-de-conocimiento.md` §4–5, `specs/contratos-de-datos.md` §9–10.

## Tareas

### F6.1 Recolectores — `tools/metricas/`
- `meta.py` (IG/FB insights por pieza y cuenta), `youtube.py` (YouTube Analytics), `upload_post.py`
  (lo que dé para TikTok y otras), `tiktok_manual.py` (extrae de capturas/exportaciones con ayuda de Claude
  y escribe snapshots con `fuente: tiktok_studio_manual`).
- **Verificar nombres de métricas vigentes en la documentación de cada API**; los no disponibles → `null`.
- **Aceptación:** una corrida escribe snapshots válidos (`tools/metricas/snapshot.schema.json`) para todas las piezas publicadas.

### F6.2 GitHub Actions
- `.github/workflows/metricas-diario.yml`: cron `10 12 * * *`, Python, secrets, commit de snapshots;
  si un token falla, abrir issue con el error.
- **Aceptación:** corrida manual (`workflow_dispatch`) en verde y commit generado.

### F6.3 DuckDB y score — `tools/metricas/db.py`, `score.py`
- Vistas `v_piezas`, `v_leads`, `v_referencias` (F4b); score de la spec §3 con percentiles sobre
  `linea_base.json` + piezas nuevas.
- **Aceptación:** pruebas unitarias del score (pesos que se redistribuyen cuando falta un componente).

### F6.4 Informe semanal — skill `informe-semanal`, agente `analista`
- Estructura de la spec §4; decisiones con la tabla §5; actualización de `playbook.md` y de
  `contexto/lo-que-funciona.md`.
- Tarea programada de Claude Code (nube) los lunes 08:40 hora de Ecuador sobre el repo `estudio-rh`, que
  corre `/informe` y hace commit. Rolando recibe el resumen.
- **Aceptación:** primer informe real con todas las secciones y n visible en cada afirmación.

### F6.5 Informe mensual y revisión del sistema
- Skill `revision-sistema` (F0b.7) + informe mensual de estrategia (spec métricas §4).
- `data/sistema/costos.csv` (`mes,concepto,usd`), que Rolando confirma.
- **Aceptación:** primer informe mensual con S1–S8 respondidas o con el vacío declarado.

### F6.6 Leads
- El Director pregunta en cada sesión semanal por leads nuevos y los registra en `leads.csv`.
- Opcional: integración con HubSpot gratis (plugin de marketing) si Rolando lo usa como CRM.
- **Aceptación:** el embudo del informe semanal muestra vistas → leads → clientes con datos reales.
