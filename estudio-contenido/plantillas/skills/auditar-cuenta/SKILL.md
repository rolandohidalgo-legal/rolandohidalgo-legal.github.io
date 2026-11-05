---
name: auditar-cuenta
description: Auditoría de una cuenta de la competencia o de un referente. Últimas 30–50 piezas con métricas, atípicos, disección de las 5 mejores y 3 peores, informe de frecuencia, temas, formatos, estilo, CTAs, oferta y huecos. Usar con "/competencia <cuenta>".
---

# Auditar cuenta

Spec: `docs/specs/ingenieria-inversa.md` §4. Delegar en `investigador-competencia`.

1. `python tools/inversa/cuenta.py <url_perfil> --n 40` → lista con métricas y `atipico`.
2. Top 5, bottom 3: `disecar-referencia` completo. Resto: análisis liviano (hook verbal, marco, CTA desde transcript).
3. Informe `data/competencia/cuentas/<cuenta>-AAAA-MM.md`: frecuencia, temas, formatos, estilo, CTA/oferta,
   qué separa atípicos de bajos (con n), huecos y oportunidades para Rolando.
4. Actualizar `data/contexto/competencia.md` y proponer ideas a `ideas.csv` (`fuente: inversa:<cuenta>`).
