import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts', // File to configure @testing-library/jest-dom
    css: false, // Disable CSS processing for tests
    deps: {
      inline: ['parse5', 'jsdom'], // Inline parse5 and jsdom to resolve ERR_REQUIRE_ESM
    },
  },
})
