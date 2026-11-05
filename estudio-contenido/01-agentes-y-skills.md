# Agentes, skills y cómo se pasan el trabajo

## 1. Estructura del repo privado `estudio-rh`

```text
estudio-rh/
├─ CLAUDE.md                     # reglas del proyecto, estado, glosario (lo lee toda sesión)
├─ .claude/
│  ├─ settings.json              # permisos (ffmpeg, python, npx remotion, git)
│  ├─ agents/                    # subagentes (plantillas en plantillas/agents/)
│  └─ skills/                    # skills (plantillas en plantillas/skills/)
├─ brand/
│  ├─ estilos/*.json             # presets: toga, expediente, pulso, pizarra
│  ├─ fuentes/  logos/
│  ├─ sfx/  sfx/manifest.json    # biblioteca de efectos con licencia y etiquetas
│  ├─ musica/ musica/manifest.json
│  ├─ hooks.md  ctas.md  hashtags.json   # bancos alimentados por la ingeniería inversa
│  └─ estilos/propuestas/        # presets inspirados, pendientes de aprobación
├─ remotion/                     # proyecto Remotion (composición Clip y componentes)
├─ tools/                        # Python: ingesta, limpieza, montaje, audio, publicar, metricas
│  └─ tests/
├─ data/
│  ├─ ideas.csv  calendario.csv  catalogo.jsonl  leads.csv
│  ├─ playbook.md                # lo aprendido: hipótesis, evidencia, decisiones
│  ├─ decisiones.md              # decisiones con resultado esperado y fecha de revisión
│  ├─ contexto/                  # contexto destilado (≤ 1 página c/u): negocio, audiencia, marca-y-voz, …
│  ├─ conocimiento/              # preguntas.csv, inventario del vault
│  ├─ sistema/                   # bitacora.jsonl, costos.csv
│  ├─ radar/AAAA-SS.md
│  ├─ competencia/               # watchlist.csv, <ref_id>/ficha.json|md, cuentas/, patrones-AAAA-MM.md
│  ├─ guiones/<video_id>.md
│  ├─ proyectos/<video_id>/      # JSON de cada etapa (sin video)
│  ├─ metricas/snapshots/*.jsonl
│  └─ informes/                  # diagnostico/I-0x-*.md, semana-*, mes-*, sistema-*
├─ media/                        # en .gitignore: brutos/, trabajo/, renders/, referencias/
└─ .github/workflows/metricas-diario.yml
```

## 2. Catálogo de skills

Cada skill vive en `.claude/skills/<nombre>/SKILL.md`. Los que tienen scripts los llaman desde `tools/`.
Las plantillas están en [`plantillas/skills/`](plantillas/skills/).

### Producción de video

| Skill | Entrada | Salida | Spec |
|---|---|---|---|
| `video-ingesta` | ruta del bruto | `proyecto.json`, `media/trabajo/<id>/{cfr.mp4, proxy.mp4, voz16k.wav, voz48k.wav}` | contratos §2 |
| `video-transcribir` | `voz16k.wav`, glosario | `transcript.json`, `transcript.srt` | contratos §3 |
| `video-limpieza` | transcript, video, guion opcional | `senales.json`, `limpieza.json`, `limpieza.md`, `rough.mp4` | escenas-basura |
| `video-montaje` | `limpieza.json` aprobado, preset | `edl.json`, `montaje.json` (captions, overlays, zoom) | contratos §5–6, estilos |
| `video-transiciones` | `montaje.json` | `montaje.json` con `transiciones[]` | transiciones-y-sonido §1 |
| `video-sonido` | `montaje.json` | `montaje.json` con `sfx[]`, `musica`, plan de loudness | transiciones-y-sonido §2 |
| `video-render` | `montaje.json` | `renders/<id>.mp4` normalizado a −14 LUFS | contratos §7 |
| `video-qa` | render + montaje | `qa.json`, `qa.md`, hasta 2 ciclos de corrección | transiciones-y-sonido §3 |
| `clips-de-bruto-largo` | transcript de un video largo | `candidatos.json` (clips con score) → un proyecto por clip | escenas-basura §5 |

### Estrategia, publicación y análisis

| Skill | Entrada | Salida | Spec |
|---|---|---|---|
| `radar-tendencias` | fuentes, playbook | `data/radar/AAAA-SS.md`, filas en `ideas.csv` | estrategia §2–3 |
| `guion-estrategico` | idea | `data/guiones/<id>.md` con ficha de grabación | estrategia §4–6 |
| `plan-semanal` | ideas, playbook, calendario | 4–5 guiones + agenda de grabación | estrategia §7 |
| `disecar-referencia` | URL o archivo ajeno | `data/competencia/<ref_id>/ficha.{json,md}` | ingenieria-inversa §2–3 |
| `auditar-cuenta` | perfil ajeno | informe de cuenta + fichas de top 5 / bottom 3 | ingenieria-inversa §4 |
| `patrones-competencia` | fichas | `patrones-AAAA-MM.md` + entradas de playbook (evidencia externa) | ingenieria-inversa §5 |
| `transponer` | ficha o patrón | hooks, marcos, presets propuestos, CTAs, ideas | ingenieria-inversa §6 |
| `copy-redes` | guion + transcript final | `copy.json` por red | copy-y-publicacion §1 |
| `publicar` | render + copy + fecha | publicación programada, `catalogo.jsonl` actualizado | copy-y-publicacion §2–3 |
| `metricas-ingesta` | APIs | `data/metricas/snapshots/*.jsonl` | metricas §2 |
| `informe-semanal` | snapshots, catálogo, leads | informe + `playbook.md` actualizado | metricas §3–5 |
| `ads-campana` | playbook, ganadores, objetivo | propuesta de campaña, seguimiento, reglas | ads |

### Base de conocimiento y sistema

| Skill | Entrada | Salida | Spec |
|---|---|---|---|
| `entrevista-diagnostico` | preguntas del informe I-0x, respuestas (texto o audio) | informe de diagnóstico + archivo de `data/contexto/` | base-de-conocimiento §2–3 |
| `revision-sistema` | bitácora, métricas, costos, decisiones | `informes/sistema-AAAA-MM.md`, cambios propuestos al sistema | base-de-conocimiento §5 |

### Skills existentes que se reutilizan

| Se llama desde | Skill existente | Para qué |
|---|---|---|
| `radar-tendencias` | `radar-temas-jrh`, `reporte-noticias-jrh` | Actualidad jurídica y noticias |
| `guion-estrategico` | `investigacion-contenido-jrh`, `scqa-writing-framework`, `ficha-sentencia` | Investigación y estructura |
| `guion-estrategico` | `fact-checker-guion` | Verificación y vacíos |
| `guion-estrategico`, `ads-campana` | `legal:compliance-check` | Ética profesional, datos personales, políticas |
| `plan-semanal` | `content-brainstorm` | Variedad de ángulos |
| `copy-redes` | `marketing-master-v2` (paso de descripciones), `marketing:brand-review` | Descripciones y voz de marca |
| `informe-semanal` | `marketing:performance-report` | Formato del informe |
| `ads-campana` | `marketing:campaign-plan`, `anthropic-skills:competitive-ads-extractor` | Brief y referencias de la competencia |

## 3. Agentes

Plantillas en [`plantillas/agents/`](plantillas/agents/). Cada agente declara herramientas mínimas.

| Agente | Skills que usa | Herramientas | Nunca hace |
|---|---|---|---|
| `estratega` | radar-tendencias, guion-estrategico, plan-semanal | Read, Write, Edit, WebSearch, WebFetch, Bash (scripts de radar) | Publicar, gastar |
| `investigador-competencia` | disecar-referencia, auditar-cuenta, patrones-competencia, transponer | Read, Write, Edit, Bash, WebFetch, WebSearch | Subir videos ajenos, copiar expresión o marca |
| `editor-video` | video-* , clips-de-bruto-largo | Read, Write, Edit, Bash | Borrar brutos, publicar |
| `revisor-frames` | — (recibe hojas de contacto) | Read | Escribir archivos |
| `qa-video` | video-qa | Read, Bash | Editar `montaje.json` (solo reporta) |
| `copywriter` | copy-redes | Read, Write | Publicar |
| `publicador` | publicar | Read, Write, Bash | Publicar sin `aprobado: true` en el catálogo |
| `analista` | metricas-ingesta, informe-semanal, revision-sistema, entrevista-diagnostico (I-02, I-04) | Read, Write, Edit, Bash | Cambiar presupuestos |
| `trafficker` | ads-campana | Read, Write, Bash, WebFetch | Crear o activar anuncios sin aprobación |

## 4. Traspasos (quién entrega qué a quién)

```text
investigador-competencia ──(fichas, patrones, hooks.md, marcos, presets propuestos, ideas)──► estratega / editor-video
estratega ──(guiones/<id>.md + fila en catalogo: estado=guion_aprobado)──► Rolando graba
Rolando ──(media/brutos/<archivo>)──► Director: /editar
Director ──► editor-video E1–E5 ──► revisor-frames (lotes) ──► editor-video ──► CHECKPOINT 1 (cortes)
Director ──► editor-video E7–E10 ──► qa-video E11 ──(máx 2 ciclos)──► CHECKPOINT 2 (render)
Director ──► copywriter ──► CHECKPOINT 3 (copy + fecha) ──► publicador
GitHub Actions (diario) ──► snapshots ──► analista (semanal) ──► playbook.md ──► estratega y trafficker
trafficker ──► CHECKPOINT 4 (presupuesto) ──► Rolando activa / API activa
```

Estados de una pieza en `catalogo.jsonl`:
`idea → guion_aprobado → grabado → cortes_aprobados → render_aprobado → copy_aprobado → programado → publicado → medido_7d → medido_28d`
(+ `descartado` en cualquier punto, con motivo).

## 5. Niveles de autonomía

| Nivel | Qué hace solo el sistema | Cuándo subir |
|---|---|---|
| 0 (inicio) | Nada sale sin aprobación en cada checkpoint | — |
| 1 | Publica piezas con render y copy aprobados en los huecos del calendario | 10 piezas publicadas sin correcciones de copy |
| 2 | Omite el checkpoint 1 si la limpieza tiene confianza ≥ 0.9 y no hay segmentos `revisar` | Precisión de limpieza ≥ 90% en 10 videos |
| 3 | Impulsa ganadores con presupuesto dentro de un tope semanal fijado por Rolando | 1 mes de ads con CPL bajo el objetivo |

El nivel vigente se guarda en `CLAUDE.md` y solo Rolando lo cambia.
