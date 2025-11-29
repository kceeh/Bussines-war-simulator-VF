import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  // 🛑 CLAVE: Forzar rutas relativas para el build.
  base: './', 
  
  server: {
    open: true, 
  }
});