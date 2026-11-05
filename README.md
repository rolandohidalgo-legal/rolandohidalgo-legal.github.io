# rolandohidalgo-legal.github.io

Sitio personal y blog de Rolando Hidalgo.

- **Escribir y editar:** https://app.pagescms.org (entrar con GitHub). Formularios para artículos, Instagram, TikTok, actividad y datos del sitio.
- **Publicar:** automático. Cada cambio en `main` dispara `.github/workflows/deploy.yml`, que arma el sitio y lo publica en 1–2 minutos.
- **Qué arma el script** (`scripts/build.mjs`): una página por artículo en `/blog/<slug>/` con etiquetas Open Graph, la imagen para redes de 1200×630 (`scripts/og.mjs`), RSS, mapa del sitio.

- **Notas al margen en los artículos:** escribe `[^1]` donde va el número y, en una línea aparte, `[^1]: texto de la nota`. En pantallas anchas la nota aparece en el margen; en el celular se abre al tocar el número.
- **Atajos:** `Ctrl K` (o `⌘K`, o `/`) abre la paleta para buscar artículos, ir a una sección o cambiar el tema.

| Carpeta | Qué hay |
|---|---|
| `content/blog/` | Un `.md` por artículo (datos arriba, texto abajo) |
| `site/` | Portada, estilos, scripts, datos JSON e imágenes subidas |
| `scripts/` | Armado del sitio y de las imágenes para redes |

Probar en local: `npm install && npm run build`, y servir `_site/`.
