---
name: clips-de-bruto-largo
description: Extrae varios clips cortos de un video largo (charla, entrevista, live, podcast). Divide por temas, puntúa candidatos por hook, autonomía, valor, cierre y encaje, y crea un proyecto por clip elegido. Usar con "/clips <archivo>" o "saca clips de este video".
---

# Clips desde un bruto largo

Spec: `docs/specs/escenas-basura.md` §5.

1. Ingesta y transcripción completas (E1–E2).
2. Ventanas de 3 min con 30 s de solapamiento; por ventana, identificar candidatos de 20–90 s.
3. Puntuar 0–10: hook (primeros 3 s), autonomía, valor, cierre, encaje con pilares. Proponer hook en pantalla.
4. Presentar a Rolando los 5–10 mejores: tiempos, texto inicial, hook sugerido, puntaje y razón.
5. Por cada elegido: proyecto nuevo `modo: clip` (mismo bruto, rango de tiempos) y continuar `/editar --desde limpieza`.
