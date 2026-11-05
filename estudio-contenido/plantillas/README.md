# Plantillas

Copiar al repo privado en F0.6:

- `agents/*.md` → `.claude/agents/`
- `skills/*/SKILL.md` → `.claude/skills/*/SKILL.md`
- `CLAUDE.md` → raíz del repo

Las etapas que solo corren un script (ingesta, transcripción, transiciones, sonido, render, recolección de
métricas) no tienen skill propio: las llama `editar` o el workflow diario. Si Sonnet lo prefiere, puede
crear un skill fino para cada una con el mismo formato.

Las rutas `docs/specs/...` suponen que la carpeta `estudio-contenido/` se copió como `docs/` (F0.1).
