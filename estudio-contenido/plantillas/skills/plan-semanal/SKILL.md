---
name: plan-semanal
description: Arma el plan de la semana. Elige 4–5 ideas balanceadas por pilar y embudo con la regla 70/20/10, escribe los guiones, arma la agenda de grabación en bloque y propone huecos de calendario. Usar con "/semana".
---

# Plan semanal

Spec: `docs/specs/estrategia-y-guiones.md` §7.

1. Lee el último informe semanal, `playbook.md`, `ideas.csv` y `calendario.csv`.
2. Selecciona ideas cumpliendo: mezcla de embudo vigente, máx. 2 por pilar, ≥ 1 experimento, ≥ 2 formatos ganadores, urgentes primero.
3. Valida con `python tools/estrategia/plan.py validar`.
4. Escribe los guiones (skill `guion-estrategico`; puedes lanzar un subagente `estratega` por guion).
5. Agenda de grabación: orden por locación y vestuario, minutos estimados, B-roll consolidado, checklist del protocolo.
6. Propón huecos del calendario y pide aprobación del paquete completo.
