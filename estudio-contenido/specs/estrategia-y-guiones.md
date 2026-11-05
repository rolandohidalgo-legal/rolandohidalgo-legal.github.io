# Estrategia, tendencias y guiones

## 1. Posicionamiento y pilares

**Promesa** (del sitio): explicar el derecho ecuatoriano con rigor técnico y lenguaje claro: sentencias,
normas y casos reales, sin jerga.

| Pilar | Contenido | Embudo dominante | Objetivo |
|---|---|---|---|
| `derechos_cotidianos` | Trabajo, arriendo, tránsito, consumidor, familia, deudas | TOFU | Alcance y seguidores |
| `sentencias_explicadas` | Fallos de la Corte Constitucional y Corte Nacional en lenguaje claro | MOFU | Autoridad, guardados |
| `actualidad_juridica` | Leyes nuevas, reformas, noticias con efecto legal | TOFU/MOFU | Alcance oportuno |
| `detras_del_litigio` | Cómo es un proceso, audiencias, errores que cuestan casos (sin datos de clientes) | MOFU/BOFU | Confianza, leads |
| `ia_y_derecho` | IA aplicada al derecho, herramientas, riesgos | TOFU/MOFU | Diferenciación |

**Mezcla semanal inicial:** 50% TOFU, 30% MOFU, 20% BOFU. El analista la ajusta cada mes.
**Cadencia inicial:** 4–5 videos cortos por semana + 1 carrusel (reutilizando el guion). Grabación en bloque 1 día por semana.

## 2. Fuentes del radar (`radar-tendencias`, semanal + bajo demanda)

| Fuente | Qué aporta | Cómo |
|---|---|---|
| `reporte-noticias-jrh`, `radar-temas-jrh` (skills existentes) | Actualidad jurídica y noticias de Ecuador | Llamar al skill |
| Corte Constitucional, Registro Oficial, Asamblea, Corte Nacional | Sentencias y normas nuevas | WebSearch/WebFetch a sus portales |
| Google Trends (Ecuador, 7 y 30 días) | Demanda de búsqueda y consultas en alza | WebFetch / pytrends; respaldo: buscar manualmente |
| Autocompletado de YouTube y TikTok | Cómo pregunta la gente ("cuánto me deben si me despiden…") | Scripts de sugerencias o Apify |
| **Preguntas de la propia audiencia** | Comentarios y DMs de los últimos 30 días | Exportación de comentarios vía API / Upload-Post; DMs que Rolando reenvía |
| Competencia y referentes (abogados creadores de Ecuador y Latam) | Formatos y temas que rinden | Apify (perfiles públicos): videos atípicos = vistas > 3× la mediana de la cuenta |
| TikTok Creative Center | Hashtags y sonidos en tendencia (Latam si Ecuador no está disponible) | WebFetch / Apify |
| `data/playbook.md` | Lo que ya sabemos que funciona | Lectura obligatoria |

## 3. Score de ideas (`ideas.csv`)

Columnas: `idea_id, fecha, tema, angulo, pilar, embudo, fuente, urgencia_dias, D, R, U, L, A, Riesgo, score, estado`.

Cada dimensión de 1 a 5:

- **D**emanda: búsquedas/menciones/preguntas reales.
- **R**elevancia para los pilares y la promesa de marca.
- **U**rgencia: ventana noticiosa (5 = vence en < 72 h).
- **L**ead: probabilidad de que alguien necesite un abogado por este tema.
- **A**utoridad: qué tan bien muestra el criterio de Rolando (y no lo que dice cualquiera).
- **Riesgo**: ético, reputacional o legal (1 = bajo).

`score = 0.25·D + 0.15·R + 0.15·U + 0.2·L + 0.15·A + 0.10·(6 − Riesgo)`; temas con Riesgo 5 se descartan
o pasan a revisión de Rolando. El radar entrega el top 10 con una línea de por qué y el marco sugerido.

## 4. Marcos de guion

| Marco | Estructura | Duración | Embudo | Preset sugerido |
|---|---|---|---|---|
| `error_comun` (PAS) | Problema → agitación (consecuencia) → solución en pasos | 45–70 s | TOFU/BOFU | pulso / pizarra |
| `mito_realidad` | Afirmación popular → "falso" → qué dice la norma → qué hacer | 30–50 s | TOFU | pulso |
| `caso_real` | Qué pasó → qué decidió el tribunal → qué significa para ti (usa `ficha-sentencia`) | 60–90 s | MOFU | expediente / toga |
| `lista_n` | "3 cosas que…" con un gancho por ítem y el mejor al final | 40–60 s | TOFU | pulso / pizarra |
| `paso_a_paso` | Resultado → pasos numerados → error a evitar → CTA guía | 50–80 s | BOFU | pizarra |
| `noticia_impacto` | Noticia en 1 frase → a quién afecta → qué hacer ya | 30–60 s | TOFU | toga / expediente |
| `respuesta_comentario` | Captura del comentario → respuesta directa → matiz | 30–60 s | MOFU | toga |
| `scqa` | Situación → complicación → pregunta → respuesta (`scqa-writing-framework`) | 60–90 s | MOFU | toga |
| `contrario` | Opinión contraria a lo común, argumentada | 45–75 s | MOFU | toga |
| `detras_de_camaras` | Un día de audiencia, preparación, lecciones (sin datos de casos) | 40–70 s | BOFU | expediente |

### Tipos de hook (los primeros 1–3 s)

`negacion` ("Tu jefe NO puede…"), `pregunta` ("¿Te despidieron sin aviso?"), `dato` ("15 días: es lo que
tienes para…"), `consecuencia` ("Si firmas esto, pierdes…"), `identificacion` ("Si arriendas en Quito, mira
esto"), `autoridad` ("La Corte Constitucional acaba de decidir…"), `contraste` ("Todos creen X. Es al revés.").

Reglas: el hook se dice **y** se escribe en pantalla (overlay `hook`); el problema o la promesa aparecen
antes de los 3 s; nada de saludos ni "hola, soy…" al inicio; el guion entrega **3 variantes** de hook
(tipos distintos) y Rolando graba las 3 (el editor elige o se hace prueba A/B en distintas redes).

### CTA por embudo

| Embudo | CTA | Medición |
|---|---|---|
| TOFU | "Sígueme para la parte 2" / "Guárdalo" | seguidores y guardados por 1k |
| MOFU | "Comenta PALABRA y te envío la guía" (ManyChat) | comentarios con palabra, DMs enviados |
| BOFU | "Escríbeme al WhatsApp del perfil con el código 110502" | leads con código |

## 5. Formato del guion (`data/guiones/<video_id>.md`)

```markdown
---
video_id: RH-20261105-02
tema: Despido intempestivo
pilar: derechos_cotidianos
embudo: TOFU
marco: error_comun
tipo_hook: negacion
preset_sugerido: pulso
duracion_objetivo_s: 60
cta: comenta_palabra
palabra_cta: DESPIDO
fuentes: [Código del Trabajo arts. 188 y 185, …]
fact_check: ok        # resultado de fact-checker-guion
compliance: ok        # resultado de legal:compliance-check
estado: borrador      # → aprobado
---

## Hooks (grabar los 3)
H1 (negacion): …
H2 (pregunta): …
H3 (dato): …

## Guion
| Línea | Bloque | Texto dicho | Texto en pantalla | Visual / B-roll | Seg. |
|---|---|---|---|---|---|
| G01 | problema | … | … | Rostro, plano medio | 0–5 |
| G02 | agitacion | … | dato: "3 meses de sueldo" | punch-in | 5–14 |

## CTA
…

## Aviso
Información general; no reemplaza asesoría para tu caso.

## Ficha de grabación
(ver §6)
```

Reglas de escritura: frases de ≤ 14 palabras, una idea por línea, lenguaje de conversación, cada término
técnico se explica en la misma frase, cifras exactas con fuente, nunca prometer resultados.

## 6. Ficha de grabación ("cómo grabarlo")

Va al final de cada guion:

- **Encuadre:** plano medio corto, ojos a 1/3 superior, cámara a la altura de los ojos, 9:16, 30 fps fijos.
- **Lugar y fondo:** según pilar (escritorio con libros para autoridad; exterior/tribunal para
  detrás del litigio; fondo limpio para pulso). Separación del fondo ≥ 1 m.
- **Luz:** principal a 45°, ventana o panel suave; evitar contraluz.
- **Audio:** micrófono de solapa; sin ventilador ni aire acondicionado.
- **Vestuario:** según pilar (toga = formal; pulso = casual elegante).
- **Intención de voz:** por bloque ("hook: firme y rápido", "solución: calmado").
- **B-roll a grabar:** lista concreta (manos firmando, pantalla con la norma, fachada de la Corte…).
- **Protocolo:** aplauso, "repito", "corta", "fin" (ver [`escenas-basura.md`](escenas-basura.md) §1).
- **Checklist previo:** batería, espacio, lente limpio, modo avión, 30 fps.

## 7. Plan semanal (`plan-semanal`)

1. Leer `playbook.md`, el último informe y `ideas.csv` (top por score, estado `nueva`).
2. Elegir 4–5 ideas respetando: mezcla de embudo, máximo 2 del mismo pilar, ≥ 1 experimento (10%),
   ≥ 2 formatos ganadores del playbook (70%), alguna idea urgente si la hay.
3. Escribir guiones (un subagente `estratega` por guion si se quiere paralelizar).
4. Pasar `fact-checker-guion` y `legal:compliance-check` a cada uno; corregir.
5. Agenda de grabación: orden por locación y vestuario, tiempo estimado, lista de B-roll consolidada.
6. Proponer huecos de calendario (ver `copy-y-publicacion.md` §3).

## 8. Ética y cumplimiento (bloqueante)

Antes de aprobar un guion o un anuncio, `legal:compliance-check` revisa como mínimo:
normas de publicidad y deontología del ejercicio profesional aplicables en Ecuador (Código Orgánico de la
Función Judicial y normas éticas del foro), no prometer resultados, no referirse a causas en trámite de
forma que afecte a las partes, no usar datos ni imágenes de clientes sin consentimiento escrito,
protección de datos personales de quienes escriben (LOPDP), políticas de cada red y de Meta/TikTok para
anuncios. Si hay duda, el guion se marca `compliance: revisar` y decide Rolando.
