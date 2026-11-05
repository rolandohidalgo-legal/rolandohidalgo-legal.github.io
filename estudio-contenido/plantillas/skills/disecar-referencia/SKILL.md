---
name: disecar-referencia
description: Ingeniería inversa de un video de la competencia o de un referente (URL de TikTok, Instagram, YouTube o archivo). Extrae hook, marco, guion por bloques, CTA, ritmo, estilo de captions, transiciones, sonido, copy y rendimiento relativo, y propone qué transponer. Usar cuando el usuario diga "diseca", "destripa", "analiza este video de X", "ingeniería inversa", o pegue un enlace de un video ajeno.
---

# Disecar una referencia

Spec completa: `docs/specs/ingenieria-inversa.md`. Este skill la ejecuta para **una pieza**.
Delegar al subagente `investigador-competencia` si el Director tiene otras tareas en curso.

## Pasos
1. `ref_id = REF-<red>-<cuenta>-<id_post>`. Si ya existe `data/competencia/<ref_id>/ficha.json`, preguntar si se rehace.
2. Descarga y metadatos:
   `python tools/inversa/descargar.py "<url>" --ref-id <ref_id>`
3. Transcripción: `python tools/ingesta/transcribir.py media/referencias/<ref_id>/video.mp4 --salida data/competencia/<ref_id>/transcript.json`
4. Señales:
   `python tools/inversa/ritmo.py <ref_id>` · `python tools/inversa/texto_pantalla.py <ref_id>` · `python tools/inversa/audio.py <ref_id>` · `python tools/inversa/hojas.py <ref_id>`
5. Revisión visual de las hojas de contacto (transiciones, overlays, captions): `revisor-frames`.
6. Rendimiento relativo: si no hay mediana de la cuenta, correr `python tools/inversa/cuenta.py <url_perfil> --n 30`.
7. Análisis narrativo (tú): bloques del guion con tiempos y función, hook (verbal, texto, visual, tipo,
   segundos hasta la promesa), marco (de nuestro catálogo o `nuevo: true` con su estructura), dispositivos de
   retención, CTA (tipo, texto, momento), tono, persona, afirmaciones verificables.
8. Hipótesis de éxito (máx. 3) y lista `transponible` / `no_transponible`.
9. Escribir `ficha.json` (validar con `tools/inversa/ficha.schema.json`) y `ficha.md` con 6 fotogramas clave.
10. Preguntar a Rolando si quiere `/transponer` ahora.

## Salida al usuario
Tabla corta: hook · marco · CTA · ritmo (planos/min, palabras/min) · estilo de captions · atípico (×mediana),
y los 3 hallazgos transferibles.
