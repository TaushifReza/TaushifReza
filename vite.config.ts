import { lstatSync, readFileSync, readdirSync } from 'node:fs'
import { isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { discoveryFiles, renderDocument, renderMigration } from './scripts/site-document.mjs'
import type { SiteModule } from './scripts/site-document.mjs'

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
  appType: 'mpa',
  build: {
    copyPublicDir: false,
  },
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
        server.middlewares.use(async (request, response, next) => {
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
          if (requestPath === '/lab' || requestPath.startsWith('/lab/')) {
            response.statusCode = 404
            response.end('Not found')
            return
          }
          const candidate = requestPath.replace(/index\.html$/, '')
          if (candidate === '/' || candidate === '/posts' || candidate.startsWith('/posts/') || candidate.startsWith('/writing/') || ['sitemap.xml', 'feed.xml', 'robots.txt'].some((name) => requestPath === `/${name}`)) {
            try {
              const site = await server.ssrLoadModule('/src/entry-server.tsx') as SiteModule
              const discovery = discoveryFiles(site)[requestPath.slice(1)]
              if (discovery) {
                response.setHeader('Content-Type', requestPath.endsWith('.xml') ? 'application/xml; charset=utf-8' : 'text/plain; charset=utf-8')
                response.end(discovery)
                return
              }
              const legacy = /^\/writing\/(pdf-memory|jwt-jwks)\/$/.exec(candidate)
              if (legacy) {
                response.setHeader('Content-Type', 'text/html; charset=utf-8')
                response.end(renderMigration(site.origin, legacy[1]))
                return
              }
              const route = site.getRoutes().find((entry) => `/${entry.path}` === candidate || `/${entry.path}` === `${candidate}/`)
              if (route) {
                if (!requestPath.endsWith('/') && !requestPath.endsWith('index.html')) {
                  response.statusCode = 301
                  response.setHeader('Location', `${pathname}/${new URL(request.url ?? '/', 'http://vite.local').search}`)
                  response.end()
                  return
                }
                // Vite's HTML transform applies the configured development base.
                // Give it root-relative asset URLs so that prefix is applied once.
                const html = renderDocument(site, route, { script: 'src/main.tsx', base: '/' })
                response.setHeader('Content-Type', 'text/html; charset=utf-8')
                response.end(await server.transformIndexHtml(pathname, html))
                return
              }
              response.statusCode = 404
              response.end('Not found')
              return
            } catch (error) {
              next(error)
              return
            }
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
