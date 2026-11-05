---
name: entrevista-diagnostico
description: Entrevista estructurada a Rolando para los informes de diagnóstico (I-01 negocio y objetivos, I-03 proceso, I-04 audiencia, I-07 marca y voz, I-08 embudo y atribución). Pregunta en tandas, acepta respuestas escritas o en audio, repregunta lo ambiguo y escribe el informe y su contexto destilado. Usar con "/entrevista-diagnostico I-0x", "diagnóstico", "quiero alimentar el sistema", "actualiza mi contexto".
---

# Entrevista de diagnóstico

Spec: `docs/specs/base-de-conocimiento.md` §2–3.

## Pasos
1. Identificar el informe (I-01…I-08). Si existe una versión anterior, leerla y preguntar solo lo que cambió.
2. Tomar las preguntas del informe en la spec. Hacer **3–5 por tanda**, numeradas, en lenguaje simple,
   con un ejemplo de respuesta cuando ayude.
3. Si Rolando responde con un audio: transcribirlo
   (`python tools/ingesta/transcribir.py <audio> --salida data/informes/diagnostico/audios/<archivo>.json`) y extraer las respuestas.
4. Repreguntar lo ambiguo o lo que no tenga número cuando la pregunta lo pide (metas, tiempos, precios).
5. Anonimizar: quitar nombres de clientes, números de causa y datos sensibles.
6. Mostrar un resumen de 8–12 viñetas y pedir confirmación.
7. Escribir `data/informes/diagnostico/I-0x-<nombre>-AAAA-MM-DD.md` con: Preguntas → Hechos →
   Interpretación (con confianza) → Decisiones → Vacíos.
8. Actualizar el archivo de `data/contexto/` correspondiente (≤ 1 página, fecha, enlace al informe).
9. Registrar decisiones nuevas en `data/decisiones.md`.

## Reglas
- No inventar respuestas ni completar con supuestos sin marcarlos como "supuesto, confirmar".
- Una sesión no debería pasar de 25 minutos de Rolando; si faltan preguntas, guardar avance y seguir otro día.
