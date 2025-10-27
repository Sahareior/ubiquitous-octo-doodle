import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '10.10.13.13', // your local IP
    port: 5173,          // choose any free port (default is 5173)
  }
})
