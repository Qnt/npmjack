import { defineConfig } from 'vite'
import netlify from '@netlify/vite-plugin-tanstack-start'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [tailwindcss(), tanstackStart(), netlify(), viteReact()],
})

export default config
