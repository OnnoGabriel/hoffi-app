import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true })
  ],
  server: {
    port: 3000,
    host: true, // Allow access from network
    // Note: HTTPS is recommended for camera access on mobile devices
    // Uncomment the line below to enable HTTPS (requires certificate):
    // https: true
  }
})
