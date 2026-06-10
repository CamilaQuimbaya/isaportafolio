# Isaac Zapata — Portafolio

Portafolio de **Isaac Zapata** (Copywriter & Publicista), reconstruido como proyecto a partir del HTML standalone original, **sin alterar el diseño ni el comportamiento**.

## Stack

- [Vite](https://vitejs.dev/) (vanilla) — servidor de desarrollo + build.
- La página en sí es **HTML + CSS + JS planos**. No usa frameworks de UI.

## Estructura

```
index.html              ← la página (CSS inline, fuentes Archivo, contenido)
public/
  assets/
    isaac-photo.png      ← foto
    fonts/               ← 10 fuentes Archivo (woff2)
    js/
      components.js      ← componentes (scaffold "omelette")
      interactions.js    ← interacciones / movimiento
```

> Los archivos de `public/` se sirven **tal cual, byte por byte** (Vite no los procesa ni renombra), por eso el resultado es idéntico al original.

## Comandos

```bash
npm install     # instalar dependencias (solo la primera vez)
npm run dev      # servidor de desarrollo con recarga en caliente
npm run build    # genera la versión de producción en dist/
npm run preview  # sirve la build de producción para revisarla
```

## Notas

- El HTML original venía empaquetado (los assets se referenciaban por UUID y un runtime los reconstruía). Aquí se extrajeron a archivos reales y se reescribieron las rutas a `assets/...`, manteniendo el mismo orden de carga de scripts (`components.js` antes que `interactions.js`).
- Para editar contenido (textos, casos, links de YouTube en `data-yt`, etc.) trabajá directamente sobre `index.html`.
