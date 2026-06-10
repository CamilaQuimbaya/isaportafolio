import { defineConfig } from 'vite'

// El portafolio es una página estática (HTML + CSS + JS planos).
// Mantenemos las rutas relativas para que funcione igual en dev, build y al abrir el archivo directamente.
export default defineConfig({
  base: './',
  server: {
    open: true,
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0, // no inlinear: conservamos las fuentes/imagen como archivos, igual que el original
  },
})
