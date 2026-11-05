# Métricas, digestión y decisiones

## 1. Qué se mide y de dónde sale

| Métrica | IG / FB (Meta Graph API) | YouTube Shorts (YouTube Analytics API) | TikTok |
|---|---|---|---|
| Vistas / reproducciones | sí | sí | Upload-Post / Display API |
| Alcance | sí | — | — |
| Me gusta, comentarios, compartidos | sí | sí | sí |
| Guardados | sí | — | sí (Studio) |
| Tiempo medio de visualización | sí (reels) | sí (`averageViewDuration`) | Studio |
| % visto / completado | derivado | `averageViewPercentage` | Studio |
| Retención a 3 s / tasa de salto | según disponibilidad en Insights | curva de retención | Studio |
| Seguidores ganados | por cuenta y día; por pieza si está disponible | `subscribersGained` | Studio |
| Visitas al perfil, clics en enlace | sí (cuenta) | — | Studio |
| Leads | `leads.csv` (código de WhatsApp, UTM, palabra ManyChat) | ídem | ídem |

**TikTok:** la API pública no da retención. Semanalmente, Rolando exporta o captura las estadísticas de
TikTok Studio de las piezas de la semana; el `analista` las extrae con visión a snapshots con
`fuente: tiktok_studio_manual`. Si Upload-Post entrega más campos en su plan, se usan y se documenta.

**Accesos:** usuario del sistema de Meta Business (token sin vencimiento) con permisos
`instagram_basic`, `instagram_manage_insights`, `pages_read_engagement`, `read_insights`, `ads_read`;
OAuth de Google para YouTube Analytics (refresh token en secrets). Verificar nombres de permisos y
métricas vigentes en la documentación de Meta antes de implementar: Meta los renombra con frecuencia.

## 2. Recolección (`metricas-ingesta`, sin LLM)

- `tools/metricas/recolectar.py`: para cada pieza publicada en los últimos 35 días, pide métricas y
  escribe una línea por pieza y red en `data/metricas/snapshots/AAAA-MM-DD.jsonl` (formato en
  `contratos-de-datos.md` §9).
- Ventanas fijas para comparar: **24 h, 72 h, 7 d, 28 d** (el script marca `horas_desde_pub`; el análisis
  toma el snapshot más cercano a cada ventana).
- `tools/metricas/cuenta.py`: métricas diarias de cuenta (seguidores, alcance, visitas al perfil).
- GitHub Actions `metricas-diario.yml`: cron diario 07:10 hora Ecuador (`10 12 * * *` UTC), corre ambos
  scripts y hace commit. Falla ruidosa si un token venció (issue automático en el repo).
- `tools/metricas/db.py`: vistas DuckDB `v_piezas` (catálogo + última métrica por ventana) y `v_leads`.

## 3. Score de pieza

Por red, a 7 días. Cada componente se convierte en **percentil** frente a las últimas 30 piezas de la
misma red (con menos de 10 piezas, usar valores de referencia y marcarlo como "provisional").

| Componente | Fórmula | Peso |
|---|---|---|
| Gancho | retención 3 s (o `1 − tasa de salto`) | 0.20 |
| Retención | tiempo medio / duración | 0.20 |
| Utilidad | (guardados + compartidos) por 1.000 vistas | 0.20 |
| Crecimiento | seguidores ganados por 1.000 vistas | 0.15 |
| Conversación | comentarios por 1.000 vistas | 0.05 |
| Negocio | leads atribuidos (código, UTM, palabra) por 1.000 vistas | 0.20 |

`score = Σ peso × percentil` (0–100). Si falta un componente, se reparte su peso entre los demás y se anota.
Etiquetas: **ganador** ≥ p75 · **normal** p25–p75 · **bajo** < p25.

## 4. Informe semanal (`informe-semanal`, lunes)

`data/informes/semana-AAAA-SS.md`, con formato apoyado en `marketing:performance-report`:

1. **Resumen en 5 líneas:** lo que pasó, número clave, mejor pieza, peor pieza, una decisión.
2. **Tabla de piezas** de la semana (score por red, etiqueta, atributo más distintivo).
3. **Embudo:** vistas → visitas al perfil → clics → conversaciones → leads → consultas → clientes, con tasa por paso.
4. **Atributos:** mediana de score por cada valor de `pilar`, `marco`, `tipo_hook`, `preset`, duración
   (tramos de 15 s), `n_transiciones` (tramos), hora y día, `tendencia`, `cta` — solo valores con n ≥ 3,
   indicando n.
5. **Decisiones propuestas** (tabla §5) y cambios al playbook.
6. **Ads** (si hay): gasto, CPL, conversaciones, decisiones del trafficker.
7. **Pedidos a Rolando:** capturas de TikTok, leads sin registrar, aprobaciones pendientes.

Informe mensual (primer lunes de mes): mismo análisis a 28 días, revisión de pilares, mezcla de embudo,
cadencia, presupuesto de ads y nivel de autonomía. Opcionalmente con Opus.

## 5. Reglas de decisión

| Situación | Decisión | Quién la aplica |
|---|---|---|
| Un `marco`/`tipo_hook`/`preset` está en ganador en ≥ 3 piezas y su mediana supera en ≥ 15% a la general | Pasa a "formato ganador": ≥ 50% de los huecos de la semana siguiente | estratega (plan-semanal) |
| Un atributo está en bajo en ≥ 3 piezas | Se retira 4 semanas; se anota la hipótesis de por qué | estratega |
| Gancho bajo (< p25) pero retención normal | El problema es el inicio: probar otro tipo de hook en el mismo tema | estratega |
| Gancho alto y retención baja | Se promete algo que no se entrega rápido: acortar, mover el valor al inicio | estratega + editor (duración objetivo) |
| Utilidad alta y negocio bajo | Buen contenido sin CTA efectivo: cambiar CTA a palabra ManyChat o código | copywriter + estratega |
| Pieza ganadora en negocio (leads) | Candidata a ads y a serie (parte 2, 3) | trafficker + estratega |
| Una hora/día rinde ≥ 20% sobre la mediana con n ≥ 4 | Mover huecos del calendario | publicador |
| Densidad de transiciones alta asociada a peor retención en `toga` (n ≥ 5) | Bajar densidad del preset | editor (preset) |
| 3 semanas sin crecimiento de seguidores | Revisión de pilares y prueba de 2 formatos nuevos | informe mensual |

**Playbook (`data/playbook.md`):** una entrada por aprendizaje:

```markdown
### P-014 · Hook de negación supera a pregunta en TOFU laboral
- Evidencia: mediana gancho p71 vs p48 (n=6 vs 5), semanas 46–48.
- Decisión: usar negación como H1 por defecto en derechos_cotidianos.
- Estado: vigente desde 2026-12-01 · revisar 2027-01-05.
```

El estratega, el copywriter, el editor y el trafficker leen el playbook al empezar cada tarea.

## 6. Experimentos

- Uno por semana como máximo, con hipótesis escrita antes de publicar (`experimento: P-0xx` en el catálogo).
- A/B de hooks: misma pieza con H1 en TikTok y H2 en IG no es un A/B limpio (redes distintas); preferir
  publicar dos versiones en semanas distintas o usar la prueba de variantes de la propia red si existe.
- Cerrar con resultado en el playbook (confirmada, descartada, inconclusa).
