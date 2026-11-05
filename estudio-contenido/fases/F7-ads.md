# F7 · Anuncios

**Objetivo:** proponer, lanzar (con aprobación), seguir y cerrar campañas con reglas explícitas de corte y escala.
**Prerrequisitos:** F6 con ≥ 12 piezas medidas a 7 días, leads rastreados, valor de lead (I-08).
**Lee antes:** `specs/ads.md`, `data/contexto/negocio.md`, `data/playbook.md`.

## Tareas

### F7.1 Preparación de cuentas
- Meta Business: cuenta publicitaria, método de pago, WhatsApp Business conectado a la página, Pixel de Meta en
  `/consulta/` del sitio (con aviso de cookies). TikTok Ads Manager con Spark Ads autorizado.
- Usuario del sistema con `ads_read` (y `ads_management` solo cuando se llegue al nivel de autonomía 3).
- **Aceptación:** `tools/ads/meta.py cuentas` lista la cuenta publicitaria.

### F7.2 Propuesta — skill `ads-campana`, agente `trafficker`
- Flujo de la spec §5, pasos 1–4. Plantilla de propuesta: objetivo, piezas (con score), audiencia,
  presupuesto diario/total, duración, CPL objetivo y cómo se calculó, reglas, riesgos, códigos de WhatsApp por anuncio.
- **Aceptación:** propuesta de prueba ($150/mes) aprobada por Rolando.

### F7.3 Lanzamiento asistido
- Guía paso a paso para crear la campaña en Ads Manager (capturas descritas, valores exactos por campo).
- Registrar la campaña en `data/ads/campanas.csv` (`campana_id,objetivo,inicio,fin,presupuesto_total,cpl_objetivo,estado`).
- **Aceptación:** campaña activa y registrada.

### F7.4 Seguimiento y reglas — `tools/ads/seguimiento.py`
- Diario (en el mismo workflow de métricas): gasto, impresiones, CTR, frecuencia, conversaciones, CPL por anuncio → `data/ads/snapshots/*.jsonl`.
- Evaluar las reglas de la spec §4 y escribir recomendaciones en `data/ads/acciones-pendientes.md`
  (el Director las presenta; Rolando aplica o aprueba).
- **Aceptación:** con datos simulados, cada regla dispara la acción correcta (pruebas unitarias).

### F7.5 Cierre y aprendizaje
- Al terminar: resultados al informe semanal/mensual y entradas al playbook (qué pieza, qué audiencia, qué CPL).
- **Aceptación:** primera campaña cerrada con informe y entradas en el playbook.

### F7.6 Autonomía nivel 3 (solo si Rolando lo aprueba)
- Creación e impulso por Marketing API dentro de un tope semanal escrito en `CLAUDE.md`; cualquier
  acción que exceda el tope se detiene y pide aprobación.
