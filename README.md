# rolandohidalgo-legal.github.io

Sitio personal y blog de Rolando Hidalgo.

- **Escribir y editar:** https://app.pagescms.org (entrar con GitHub). Formularios para artículos, Instagram, TikTok, actividad y datos del sitio.
- **Publicar:** automático. Cada cambio en `main` dispara `.github/workflows/deploy.yml`, que arma el sitio y lo publica en 1–2 minutos.
- **Qué arma el script** (`scripts/build.mjs`): una página por artículo en `/blog/<slug>/` con etiquetas Open Graph, la imagen para redes de 1200×630 (`scripts/og.mjs`), RSS, mapa del sitio.

| Carpeta | Qué hay |
|---|---|
| `content/blog/` | Un `.md` por artículo (datos arriba, texto abajo) |
| `site/` | Portada, estilos, scripts, datos JSON e imágenes subidas |
| `scripts/` | Armado del sitio y de las imágenes para redes |

Probar en local: `npm install && npm run build`, y servir `_site/`.
