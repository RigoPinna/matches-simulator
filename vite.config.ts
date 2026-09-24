import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Never inline club logos as base64. The app snapshots each club
    // (image included) into every match/table row it persists to
    // localStorage every season — a base64 string duplicated hundreds of
    // times per season blows past Safari's ~5MB localStorage quota after
    // just a few seasons, crashing the app to a blank page. Keeping every
    // logo as a short external file path (like the original Primera logos,
    // which are all >4KB and were never inlined) keeps that snapshot cheap.
    assetsInlineLimit: 0,
  },
})
