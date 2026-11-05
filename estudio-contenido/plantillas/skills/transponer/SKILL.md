---
name: transponer
description: Convierte hallazgos de la ingeniería inversa (una ficha o un patrón) en activos propios como plantillas de hook, marcos de guion, presets de estilo propuestos, CTAs e ideas, sin copiar expresión ni marca ajena. Usar con "/transponer <ref_id|patrón>".
---

# Transponer

Spec: `docs/specs/ingenieria-inversa.md` §6 y §8.

1. Lee la ficha o el patrón y la lista `transponible`.
2. Para cada elemento, crea el activo según la tabla §6 con su `ref_id` de origen:
   `brand/hooks.md`, `brand/ctas.md`, marco nuevo (`origen: inversa`), `brand/estilos/propuestas/<nombre>.json`, filas en `ideas.csv`.
3. Presets: deben diferir en paleta y tipografía del original; render de prueba con un video propio (`npx remotion still` + 10 s de render).
4. Muestra a Rolando los activos y pide aprobación; los presets aprobados pasan a `brand/estilos/`.
