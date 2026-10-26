import { lstatSync, readFileSync, readdirSync } from 'node:fs'
import { isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const publicDirectory = fileURLToPath(new URL('./public', import.meta.url))
const allowedPublicAssets = new Set(['favicon.svg', 'social-card.svg', 'social-card.png', 'bg_remove.png'])

function approvedPublicAssets(directory = publicDirectory, prefix = '', assets = new Map<string, string>()) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = `${prefix}${entry.name}`
    if (entry.isDirectory() && (path === 'artifacts' || prefix.startsWith('artifacts/'))) {
      approvedPublicAssets(`${directory}/${entry.name}`, `${path}/`, assets)
    } else if (entry.isFile() && (allowedPublicAssets.has(path) || /^artifacts\/[\w/-]+\.(?:png|jpe?g|webp|svg|mp4|webm|vtt|txt|json)$/.test(path))) {
      assets.set(path, `${directory}/${entry.name}`)
    }
  }
  return assets
}

function isUnapprovedPublicFile(path: string, approved: Map<string, string>) {
  const asset = relative(publicDirectory, path)
  if (!asset || asset === '..' || asset.startsWith('../') || isAbsolute(asset)) return false
  try {
    const entry = lstatSync(path)
    return (entry.isFile() || entry.isSymbolicLink()) && !approved.has(asset)
  } catch {
    return false
  }
}

export default defineConfig({
  base: './',
  build: {
    copyPublicDir: false,
    rolldownOptions: {
      input: {
        home: fileURLToPath(new URL('./index.html', import.meta.url)),
        pdfMemory: fileURLToPath(new URL('./writing/pdf-memory/index.html', import.meta.url)),
        jwtJwks: fileURLToPath(new URL('./writing/jwt-jwks/index.html', import.meta.url)),
        incidentClassifier: fileURLToPath(new URL('./lab/incident-classifier/index.html', import.meta.url)),
      },
    },
  },
  worker: { format: 'es' },
  plugins: [
    react(),
    {
      name: 'portfolio-public-assets',
      generateBundle() {
        for (const [fileName, path] of approvedPublicAssets()) {
          this.emitFile({ type: 'asset', fileName, source: readFileSync(path) })
        }
      },
      configureServer(server) {
        server.middlewares.use((request, response, next) => {
          let pathname: string
          try {
            pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://vite.local').pathname)
          } catch {
            response.statusCode = 400
            response.end('Invalid request path')
            return
          }
          const base = server.config.base
          const requestPath = base !== '/' && pathname.startsWith(base)
            ? `/${pathname.slice(base.length)}`
            : pathname
          const candidates = [
            resolve(publicDirectory, `.${requestPath}`),
            resolve(server.config.root, `.${requestPath}`),
          ]
          if (requestPath.startsWith('/@fs/')) candidates.push(resolve(requestPath.slice('/@fs'.length)))
          const approved = approvedPublicAssets()
          if (candidates.some((path) => isUnapprovedPublicFile(path, approved))) {
            response.statusCode = 403
            response.end('Public asset is not approved for publication')
            return
          }
          next()
        })
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
