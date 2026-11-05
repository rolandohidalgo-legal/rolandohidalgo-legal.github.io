# Anuncios (ads)

## 1. Cuándo sí y cuándo no

**Sí:** (a) impulsar piezas orgánicas ganadoras en `negocio` o `utilidad`; (b) campañas con objetivo y
fecha (lanzar un servicio, una guía descargable, una fecha clave como cambios en el salario básico o
plazos tributarios); (c) retargeting a quien ya vio ≥ 50% de un video.
**No:** antes de 12 piezas publicadas con métricas de 7 días; sin seguimiento de leads funcionando;
para "dar a conocer la cuenta" sin objetivo medible.

## 2. Plataformas y objetivos

| Plataforma | Formato | Objetivo recomendado | Por qué |
|---|---|---|---|
| Meta (IG + FB) | Reel orgánico ganador como anuncio | **Mensajes a WhatsApp** (click-to-WhatsApp) | En Ecuador la consulta legal empieza por WhatsApp; costo por conversación medible |
| Meta | Formulario instantáneo (lead ads) | Clientes potenciales | Para guías descargables; requiere aviso de privacidad |
| Meta | Video views a público amplio + retargeting | Reconocimiento → mensajes | Construir audiencia de "vio 50%" para retargeting |
| TikTok | Spark Ads (impulsa el post orgánico, conserva interacciones) | Visitas al perfil / tráfico | Crecimiento con prueba social |

Google Ads (búsqueda "abogado laboral Quito") queda para una fase posterior, cuando haya landing por servicio.

## 3. Estructura y presupuesto

- **Campaña** = un objetivo. **Conjunto** = una audiencia. **Anuncios** = 2–3 piezas ganadoras.
- Audiencias iniciales: Ecuador; ciudades donde Rolando atiende (p. ej. Quito, Guayaquil, Cuenca); 24–60
  años; segmentación amplia (Advantage+) con exclusión de seguidores actuales en campañas de crecimiento.
- **Prueba:** $5/día por conjunto, 7 días, 2–3 anuncios. **Mensual de prueba:** ~$150.
- Código de WhatsApp propio por anuncio (`A` + 5 dígitos) para atribuir el lead al anuncio, y UTM con
  `utm_medium=paid&utm_content=<ad_id>`.
- CPL objetivo: se fija tras la primera prueba = la mitad del valor esperado de un lead
  (`valor medio de consulta × tasa lead→consulta`). Hasta tenerlo, tope de referencia de prueba: **$8 por
  conversación calificada** (hipótesis a corregir con datos).

## 4. Reglas automáticas (las propone el trafficker; las aplica Rolando o la API con aprobación)

| Regla | Condición | Acción |
|---|---|---|
| Corte | Gasto ≥ 3 × CPL objetivo y 0 leads | Pausar el anuncio |
| Corte por calidad | CTR < 0.6% tras 1.500 impresiones | Pausar y cambiar los primeros 3 s |
| Escala | CPL ≤ objetivo durante 3 días y frecuencia < 2.5 | +20% de presupuesto cada 72 h |
| Fatiga | Frecuencia > 3 o CTR cae 30% vs su primera semana | Rotar creatividad |
| Fin de aprendizaje | Pocos eventos por semana | Consolidar conjuntos antes de subir presupuesto |
| Tope | Gasto semanal alcanza el máximo aprobado | No proponer más gasto hasta la siguiente semana |

## 5. Flujo del agente `trafficker`

1. Leer playbook, informe y piezas `ganador` de los últimos 30 días.
2. Proponer (con `marketing:campaign-plan` como guía de formato): objetivo, piezas, audiencia, presupuesto
   diario y total, duración, CPL objetivo, reglas, riesgos de cumplimiento.
3. `legal:compliance-check` sobre el anuncio (publicidad profesional, políticas de anuncios, datos
   personales; si el tema roza asuntos sociales o políticos, Meta puede exigir autorización especial).
4. **Checkpoint 4:** Rolando aprueba montos.
5. Fase inicial: el trafficker entrega una guía paso a paso para crearla en Ads Manager / TikTok Ads
   Manager. Fase avanzada (nivel 3): creación por Marketing API dentro del tope aprobado.
6. Seguimiento diario (lectura por Marketing API `ads_read`, o captura de Ads Manager) y aplicación de reglas.
7. Cierre: resultados al informe y aprendizajes al playbook.

## 6. Investigación de anuncios de la competencia

`anthropic-skills:competitive-ads-extractor` sobre la Biblioteca de anuncios de Meta (abogados y servicios
legales en Ecuador): mensajes, ofertas, formatos. Resultado en `data/radar/ads-competencia-AAAA-MM.md`.
