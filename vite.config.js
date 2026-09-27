import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// GitHub Pages project site: https://<user>.github.io/nth-birthday/
// Change production base if your repo name differs.
export default defineConfig(({ command }) => ({
  plugins: [vue()],
  base: command === 'build' ? '/nth-birthday/' : '/',
  test: {
    environment: 'node',
  },
}))
