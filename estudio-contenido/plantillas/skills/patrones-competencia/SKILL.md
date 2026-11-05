---
name: patrones-competencia
description: Busca patrones cruzados entre todas las fichas de referencias (y las propias). Qué atributos se asocian a atípicos, comparado con lo que ya hacemos, con n mínimo. Usar con "/patrones".
---

# Patrones de la competencia

Spec: `docs/specs/ingenieria-inversa.md` §5.

1. `python tools/inversa/db.py refrescar` (vista `v_referencias`).
2. Por atributo: mediana de `atipico` y `utilidad_por_1k`, n por grupo; reportar solo diferencias con n ≥ 5.
3. Comparar con `v_piezas` propias: qué hacen los atípicos de afuera que nosotros no hacemos.
4. Escribir `data/competencia/patrones-AAAA-MM.md` y proponer entradas de playbook con `evidencia: externa` y un experimento para confirmarlas.
