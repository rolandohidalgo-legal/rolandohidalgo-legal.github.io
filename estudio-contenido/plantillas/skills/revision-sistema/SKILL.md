---
name: revision-sistema
description: Revisión del propio sistema de contenido (mensual corta, trimestral completa). Responde si el sistema cumple su propósito y a qué costo, usando la bitácora de checkpoints, métricas, costos y decisiones pasadas, y propone cambios al sistema (umbrales, reglas, skills, nivel de autonomía, herramientas, modelos). Usar con "/revision-sistema", "¿está funcionando el sistema?", "qué mejoramos del sistema".
---

# Revisión del sistema

Spec: `docs/specs/base-de-conocimiento.md` §5.

## Pasos
1. Leer `data/contexto/negocio.md` (metas), `data/contexto/sistema.md`, `data/decisiones.md`,
   `data/sistema/bitacora.jsonl` del periodo, `data/metricas/` (vía `python tools/metricas/db.py`), costos en `data/sistema/costos.csv`.
2. Responder S1–S8 en orden, cada una con: dato, n, fuente, interpretación.
   - S3/S4: `python tools/sistema/bitacora.py resumen --desde AAAA-MM-DD` (correcciones por etapa y tipo, tasas de aprobación sin cambios).
   - S6: para cada decisión con fecha de revisión vencida, completar "Resultado" en `decisiones.md`.
3. Proponer máximo 5 cambios priorizados (impacto ÷ esfuerzo). Cada uno con: qué archivo/skill/umbral
   cambia, resultado esperado, fecha de revisión.
4. Regla de 3: si una misma corrección manual aparece ≥ 3 veces, proponer convertirla en regla o skill.
5. Escribir `data/informes/sistema-AAAA-MM.md` y actualizar `data/contexto/sistema.md`.
6. Pedir aprobación a Rolando para cada cambio; registrar los aprobados como D-xxx en `decisiones.md`.
   Los cambios de nivel de autonomía solo los aprueba Rolando explícitamente.
