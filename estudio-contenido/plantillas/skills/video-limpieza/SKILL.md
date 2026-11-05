---
name: video-limpieza
description: Detecta y marca escenas basura de un video (técnicas, de toma y editoriales) combinando señales de audio y video, reglas deterministas, revisión del transcript contra el guion y revisión visual por hojas de contacto. Produce limpieza.json, limpieza.md y rough.mp4.
---

# Limpieza de escenas basura

Spec: `docs/specs/escenas-basura.md` (§2 señales, §3 clasificación).

1. `python tools/limpieza/senales.py <video_id>` → `senales.json`.
2. `python tools/limpieza/clasificar.py <video_id>` → `limpieza.json` con reglas deterministas.
3. `python tools/limpieza/tabla.py <video_id>` → tabla compacta (id, tiempos, texto, motivos).
4. Revisión de texto (tú), con el guion numerado si existe:
   - alinea cada segmento a `G01…Gnn` o márcalo `fuera_de_guion`;
   - entre tomas que cubren la misma línea, conserva la más fluida y completa;
   - `fuera_de_guion` sin valor → `basura` (`editorial_digresion` / `editorial_repeticion`);
   - verifica que lo conservado se entiende de corrido.
5. Segmentos `revisar` y bordes de corte: `python tools/limpieza/hojas.py <video_id>` → `revisor-frames`.
   Aplica la regla del 50% / 20–50%.
6. Escribe tus decisiones en `limpieza.json` (agrega motivos y `confianza`; no borres los de las reglas).
   Valida con `tools/limpieza/limpieza.schema.json`.
7. `python tools/limpieza/rough.py <video_id>` → `rough.mp4` y `limpieza.md`.

Nunca elimines una frase útil completa por una sola señal técnica: en la duda, `revisar`.
