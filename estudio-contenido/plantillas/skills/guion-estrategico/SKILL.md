---
name: guion-estrategico
description: Escribe un guion de video corto con marco narrativo, 3 hooks, texto en pantalla, CTA por embudo, aviso legal y ficha de grabación. Lo verifica con fact-checker-guion y legal:compliance-check. Usar con "/guion <tema o idea_id>".
---

# Guion estratégico

Spec: `docs/specs/estrategia-y-guiones.md` §4–6, §8.

1. Lee la idea (`ideas.csv`), el contexto (`negocio`, `audiencia`, `marca-y-voz`, `lo-que-funciona`), `brand/hooks.md`, `brand/ctas.md`.
2. Elige marco (prioriza formatos ganadores del playbook) y preset sugerido.
3. Investiga con `investigacion-contenido-jrh` (y `ficha-sentencia` si es un caso real). Anota fuentes exactas.
4. Escribe con el formato de la spec §5: 3 hooks de tipos distintos, tabla por líneas `G01…`, CTA, aviso, ficha de grabación.
5. `fact-checker-guion` → corrige. `legal:compliance-check` → corrige o marca `compliance: revisar`.
6. Guarda `data/guiones/<video_id>.md` (`estado: borrador`) y muéstralo a Rolando.
7. Al aprobar: `estado: aprobado`, fila en catálogo `guion_aprobado`, registro en bitácora (cambios pedidos).
