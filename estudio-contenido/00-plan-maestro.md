# Plan maestro

## 1. Qué construimos

Una agencia de contenido operada por Claude, con el abogado como talento y aprobador final.

```text
                         ┌──────────────────────────── bucle de aprendizaje ───────────────────────────┐
                         ▼                                                                              │
 DIAGNÓSTICO (I-01…I-08) ──► data/contexto/  (lo leen todos los agentes)
 INGENIERÍA INVERSA ─┐  (competencia y referentes: hooks, marcos, estilos, CTAs)
                     ▼
 RADAR ──► IDEA ──► GUION + FICHA DE GRABACIÓN ──► (Rolando graba) ──► EDICIÓN ──► COPY ──► PUBLICACIÓN ──► MÉTRICAS ──► PLAYBOOK
 tendencias  score   marco + hook + CTA              protocolo de        limpieza     por red    calendario     snapshots    decisiones
 noticias            fact-check + ética               claqueta            montaje                 API            score        ads
 preguntas                                                                transiciones                                         │
                                                                          sonido + QA                                          ▼
                                                                                                                ADS (solo ganadores
                                                                                                                 o campañas con tope)
```

**Lo que hace Rolando:** aprueba ideas, graba en bloque (1 día/semana), aprueba cortes y render final,
aprueba copy y calendario, aprueba gasto en ads. Todo lo demás lo ejecutan los agentes.

## 2. Decisiones de arquitectura (y por qué)

### 2.1 Motor de video: **Remotion** (HyperFrames como plan B)

| Criterio | Remotion | HyperFrames (HeyGen) |
|---|---|---|
| Madurez | Años en producción, documentación amplia | Open source desde 2026, más nuevo |
| Licencia para Rolando | Gratis: individuos y empresas de hasta 3 personas, uso comercial incluido | Apache-2.0, gratis siempre |
| Captions | `@remotion/captions` (formato `Caption`, estilo TikTok, por palabra) | HTML/CSS a mano |
| Transiciones | `@remotion/transitions` + componentes propios | GSAP/CSS |
| Velocidad de render | Rápido local; Lambda si hace falta | Más lento en pruebas independientes |
| Pensado para agentes | Tiene skills oficiales para agentes | Nació para agentes (skills incluidas) |

**Decisión:** Remotion, porque la precisión por frame (captions por palabra, cortes, SFX alineados) es el
núcleo del flujo, y el ecosistema de captions y transiciones ya existe. Si el equipo pasa de 3 personas
(Remotion exige licencia de empresa) o se quiere motion graphics más libres, los overlays se pueden
producir en HyperFrames y entrar a Remotion como video con alfa. La arquitectura lo permite porque el
montaje se describe en JSON (`montaje.json`), no en código.

### 2.2 Edición no destructiva, descrita en datos

El video nunca se corta a mano. La edición es una cadena de archivos JSON (contratos en
[`specs/contratos-de-datos.md`](specs/contratos-de-datos.md)):

```text
transcript.json ─► senales.json ─► limpieza.json ─► edl.json ─► montaje.json ─► render.mp4 ─► qa.json
```

Ventajas: cada etapa es auditable, se puede repetir solo la que falló, Rolando corrige un JSON o una
tabla en vez de una línea de tiempo, y el analista puede cruzar métricas con decisiones de edición
(¿los videos con más transiciones retienen más?).

### 2.3 Dos tipos de trabajo, dos lugares

| Trabajo | Dónde corre | Por qué |
|---|---|---|
| Edición (archivos pesados, render) | Claude Code en el computador de Rolando | Los brutos pesan GB; render local gratis |
| Estrategia, copy, publicación | Claude Code local o en la nube | Solo texto y llamadas a API |
| Recolección de métricas (diaria) | GitHub Actions con cron, script Python sin LLM | Gratis, confiable, no consume Claude |
| Informe semanal y playbook | Tarea programada de Claude Code (nube) sobre el repo | Analiza y hace commit del informe |

### 2.4 Persistencia

- **Repo privado `estudio-rh`** (GitHub): código, agentes, skills, guiones, JSON de proyectos, métricas
  (JSONL), playbook, informes. Todo versionado.
- **Videos fuera de git:** `media/` local (en `.gitignore`). Para publicar por API, el render final se sube
  a **Cloudflare R2** (o Google Drive) y se pasa la URL al publicador.
- **Base analítica:** DuckDB leyendo los JSONL de `data/metricas/`. Sin servidor.

### 2.5 Agentes: un director + especialistas

Los subagentes de Claude Code no pueden lanzar otros subagentes, así que la sesión principal es el
**Director** y los especialistas son subagentes con contexto aislado. Detalle en
[`01-agentes-y-skills.md`](01-agentes-y-skills.md).

| Agente | Modelo | Rol |
|---|---|---|
| Director (sesión principal) | Sonnet | Orquesta skills, pide aprobaciones, mantiene el catálogo |
| `estratega` | Sonnet | Radar de tendencias, ideas con score, guiones, ficha de grabación |
| `investigador-competencia` | Sonnet | Ingeniería inversa de videos y cuentas ajenas; transpone hallazgos a activos propios |
| `editor-video` | Sonnet | Pipeline de edición E1–E10 |
| `revisor-frames` | Haiku | Clasifica hojas de contacto (barato, en lote) |
| `qa-video` | Sonnet | Revisión independiente del render |
| `copywriter` | Sonnet | Descripciones por red, hashtags, portada, comentario fijado |
| `publicador` | Sonnet | Calendario y publicación por API |
| `analista` | Sonnet | Métricas, score, informe semanal, playbook |
| `trafficker` | Sonnet | Propuestas de ads, seguimiento, reglas de corte y escala |

Opcional: correr el informe **mensual** de estrategia con Opus (decisiones de mayor peso, una vez al mes).

### 2.6 Reutilizar los skills que ya existen

Ya están en la cuenta: `radar-temas-jrh`, `reporte-noticias-jrh`, `investigacion-contenido-jrh`,
`content-brainstorm`, `content-creator-social`, `marketing-master-v2`, `fact-checker-guion`,
`scqa-writing-framework`, `ficha-sentencia`, `legal:compliance-check`, `marketing:performance-report`,
`marketing:campaign-plan`. El sistema los **llama**, no los duplica. Tarea F0.6: comprobar que están
disponibles en Claude Code local; si no, copiarlos a `.claude/skills/` del repo privado.

## 3. Flujos de trabajo (lo que Rolando escribe)

| Comando | Qué pasa | Aprobación |
|---|---|---|
| `/disecar <url>` | Ingeniería inversa de un video ajeno: hook, marco, guion, CTA, ritmo, estilo, sonido, copy | — |
| `/competencia <cuenta>` | Auditoría de una cuenta: atípicos, contraste mejores/peores, huecos | — |
| `/patrones` · `/transponer` | Patrones cruzados entre fichas · convertir hallazgos en hooks, marcos, presets, CTAs e ideas | Aprueba activos |
| `/entrevista-diagnostico I-0x` | Entrevista en tandas (texto o audio) para un informe de diagnóstico | Confirma resumen |
| `/revision-sistema` | ¿El sistema cumple sus metas y a qué costo? Cambios propuestos al sistema | Aprueba cambios |
| `/radar` | Tendencias, noticias y preguntas de la audiencia → top 10 temas con score | Elige temas |
| `/guion <tema>` | Guion con marco, 3 hooks, texto en pantalla, CTA, ficha de grabación, fact-check y ética | Aprueba guion |
| `/semana` | Plan semanal: 4–5 guiones balanceados por pilar y embudo + agenda de grabación | Aprueba plan |
| `/editar <video> [--guion ID]` | E1–E6, se detiene a mostrar los cortes; luego E7–E11 | Cortes y render |
| `/clips <video largo>` | Modo B: extrae varios clips de un bruto largo (charla, live, podcast) | Elige clips |
| `/copy <ID>` | Copy por red, portada, comentario fijado | Aprueba copy |
| `/publicar <ID>` | Programa en el calendario vía API | Aprueba fecha |
| `/informe` | Informe semanal y actualización del playbook | Lee y comenta |
| `/ads` | Propone campañas o impulsos con presupuesto y reglas | Aprueba gasto |

## 4. Principios que rigen todo

1. **Cara y voz de Rolando, criterio de Rolando.** Los agentes proponen; él aprueba lo que sale al público.
2. **Rigor primero.** Todo guion pasa por `fact-checker-guion` y `legal:compliance-check` (publicidad de
   abogados, no prometer resultados, no exponer casos ni datos de clientes, protección de datos de leads).
3. **Todo medible.** Cada pieza lleva `video_id`, UTM y código de WhatsApp. Sin atribución no hay aprendizaje.
4. **Explorar y explotar.** 70% formatos ganadores, 20% variaciones, 10% experimentos.
5. **Variedad con reglas.** Transiciones, sonidos y estilos se rotan con reglas explícitas, no al azar ni
   iguales siempre.
6. **Decidir con contexto propio.** Los agentes leen `data/contexto/` (alimentado por los informes de
   diagnóstico y los recurrentes) antes de decidir; el sistema se revisa a sí mismo cada mes con su
   telemetría (ver [`specs/base-de-conocimiento.md`](specs/base-de-conocimiento.md)).
7. **Sin gasto ni publicación sin aprobación** hasta que Rolando suba el nivel de autonomía
   (ver [`01-agentes-y-skills.md`](01-agentes-y-skills.md) §5).

## 5. Hoja de ruta

| Fase | Resultado | Depende de |
|---|---|---|
| [F0 Cimientos](fases/F0-cimientos.md) | Repo privado, entorno, cuentas, marca capturada, video de prueba | — |
| [F0b Diagnóstico](fases/F0b-diagnostico.md) | Informes I-01…I-08, contexto destilado, línea base, telemetría del sistema | F0 |
| [F1 Limpieza](fases/F1-limpieza.md) | Transcripción, detección de escenas basura, corte en bruto aprobado | F0 |
| [F2 Montaje y estilos](fases/F2-montaje-estilos.md) | Render con captions y 4 estilos | F1 |
| [F3 Transiciones, sonido y QA](fases/F3-transiciones-sonido-qa.md) | Video final con transiciones, SFX, música y QA | F2 |
| [F4 Estrategia y guiones](fases/F4-estrategia-guiones.md) | Radar, ideas con score, guiones, plan semanal | F0 |
| [F4b Ingeniería inversa](fases/F4b-ingenieria-inversa.md) | Fichas de competencia, auditorías de cuentas, patrones, activos transpuestos | F0, F1.2 |
| [F5 Copy y publicación](fases/F5-copy-publicacion.md) | Copy por red y publicación programada | F3, F4 |
| [F6 Métricas y decisiones](fases/F6-metricas-decisiones.md) | Recolección diaria, score, informe semanal, playbook | F5 |
| [F7 Ads](fases/F7-ads.md) | Campañas con tope, reglas de corte y escala | F6 |

## 6. Riesgos y cómo se cubren

| Riesgo | Mitigación |
|---|---|
| APIs de redes cambian o exigen auditoría (TikTok exige auditoría para publicar público por API propia) | Publicar mediante agregador (Upload-Post / Ayrshare) detrás de un adaptador; adaptador `manual` como respaldo |
| Audio en tendencia de TikTok no se puede añadir por API | Marcar la pieza como `publicacion: manual` y entregar paquete listo para subir desde la app |
| Videos de celular con frame rate variable desincronizan captions | E1 convierte a 30 fps constantes antes de todo |
| La IA corta algo importante | Checkpoint de cortes con vista previa y tabla editable; nada se borra del bruto |
| Normas de publicidad profesional y datos personales | `legal:compliance-check` en cada guion y en cada campaña; aviso "información general" en el copy; leads con consentimiento |
| Métricas incompletas (TikTok no da retención por API) | Exportación o captura semanal de TikTok Studio, extraída con visión |
| Contexto de Claude saturado en videos largos | Subagentes con contexto aislado; resúmenes por etapa en JSON |
