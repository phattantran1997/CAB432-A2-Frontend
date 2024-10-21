import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Listen on all network interfaces
    port: 5173,  // Use a non-privileged port (Vite's default)
    strictPort: true,  // Exit if the port is already in use
  }
})

