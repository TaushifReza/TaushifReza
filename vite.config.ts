import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const publicDirectory = fileURLToPath(new URL('./public', import.meta.url))
const allowedPublicAssets = new Set(['favicon.svg', 'social-card.svg', 'social-card.png'])

export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'portfolio-public-assets',
      configResolved() {
        for (const entry of readdirSync(publicDirectory, { withFileTypes: true })) {
          if (!entry.isFile() || !allowedPublicAssets.has(entry.name)) {
            throw new Error(`Public asset is not approved for publication: ${entry.name}`)
          }
        }
      },
    },
  ],
  server: {
    fs: {
      deny: [
        '.env', '.env.*', '*.{crt,pem}', '**/.git/**',
        '**/*.md', '**/*.pdf', '**/*_context.*', '**/docs/**',
      ],
    },
  },
})
