# Estudio de contenido RH: plan de construcción

Sistema de agentes y skills de Claude Code que hace el trabajo de una agencia de marketing de contenido
para Rolando Hidalgo (abogado, Ecuador): **qué grabar → cómo grabarlo → edición → copy → publicación → métricas → anuncios → decisiones**.

Esta carpeta es el **plan**. No es parte del sitio web (el build solo publica `site/`).
La fase F0 la mueve a un repositorio privado (`estudio-rh`), donde se construye el sistema.

## Cómo leerlo

| Archivo | Para qué |
|---|---|
| [`00-plan-maestro.md`](00-plan-maestro.md) | Visión, decisiones de arquitectura, flujo completo, hoja de ruta |
| [`01-agentes-y-skills.md`](01-agentes-y-skills.md) | Qué agentes y skills existen, qué entra y sale de cada uno, puntos de aprobación |
| [`02-presupuesto-y-herramientas.md`](02-presupuesto-y-herramientas.md) | Suscripciones, repos, equipo de grabación, presupuesto de ads |
| `specs/` | Las reglas: contratos de datos, base de conocimiento e informes, escena basura, estilos, transiciones y sonido, guiones, ingeniería inversa de la competencia, copy, métricas, ads |
| `fases/` | **Las órdenes de trabajo para Sonnet**, F0 a F7 (más F0b, diagnóstico, y F4b, ingeniería inversa), con criterios de aceptación |
| `plantillas/` | Borradores de los agentes (`.claude/agents/`) y skills (`.claude/skills/`) listos para copiar |

## Cómo ejecutarlo con Sonnet

1. Abrir Claude Code (CLI o app de escritorio) **en el computador donde están los videos**, con modelo Sonnet.
2. Una fase por sesión. Mensaje de arranque:

   ```text
   Lee estudio-contenido/README.md, 00-plan-maestro.md y fases/F0-cimientos.md.
   Ejecuta F0 tarea por tarea. Al terminar cada tarea, verifica sus criterios de aceptación,
   haz commit y sigue. Si un criterio no se cumple, no avances: corrígelo o pregúntame.
   ```

3. Reglas para que Sonnet rinda al máximo (también van en el `CLAUDE.md` del repo privado):
   - Leer la spec referenciada **antes** de escribir código. Las specs mandan sobre la intuición.
   - Una tarea = un commit. Correr las pruebas de la tarea antes del commit.
   - Si una API externa no coincide con lo que dice el plan, leer su documentación actual (WebFetch) y
     ajustar el adaptador; no inventar endpoints.
   - Nunca gastar dinero (ads, compras) ni publicar sin aprobación explícita en el chat.
   - Al terminar la fase, actualizar `CLAUDE.md` con lo aprendido y el estado.

## Orden de las fases

```text
F0 Cimientos ──► F0b Diagnóstico (base de conocimiento; en paralelo con F1–F3)
   │
   └─────────► F1 Limpieza ──► F2 Montaje y estilos ──► F3 Transiciones, sonido y QA
                                                              │
F4 Estrategia y guiones (puede ir en paralelo a F1–F3) ───────┤
F4b Ingeniería inversa de la competencia (tras F1.2) ─────────┤
                                                              ▼
                               F5 Copy y publicación ──► F6 Métricas y decisiones ──► F7 Ads
```

Primer resultado útil: al cerrar **F2** ya hay clips editados con captions. Sistema completo: F7.

**Cómo se alimenta el sistema:** [`specs/base-de-conocimiento.md`](specs/base-de-conocimiento.md). Son ocho informes de
diagnóstico (negocio, histórico propio, proceso, audiencia, competencia, conocimiento propio, marca, embudo), un
contexto destilado que leen los agentes y una revisión periódica del propio sistema.
