---
name: ads-campana
description: Propone, documenta, sigue y cierra campañas de anuncios en Meta y TikTok con presupuesto, CPL objetivo, códigos de atribución y reglas de corte y escala. Nunca gasta sin aprobación. Usar con "/ads".
---

# Campaña de anuncios

Spec: `docs/specs/ads.md`. Delegar en el subagente `trafficker`.

1. Verificar prerrequisitos (≥ 12 piezas medidas a 7 días, leads rastreados, valor de lead en `contexto/negocio.md`). Si faltan, decir cuáles y parar.
2. Elegir piezas ganadoras (score y negocio), objetivo y audiencia; calcular CPL objetivo.
3. Propuesta con la plantilla de F7.2; `legal:compliance-check`; referencias con `competitive-ads-extractor` si ayuda.
4. **Checkpoint 4:** aprobación de montos por Rolando (registrar en bitácora y `decisiones.md`).
5. Guía de creación en Ads Manager o API (solo nivel 3, dentro del tope). Registrar en `data/ads/campanas.csv`.
6. Seguimiento: `python tools/ads/seguimiento.py` → reglas → `data/ads/acciones-pendientes.md`.
7. Cierre: resultados al informe y playbook.
