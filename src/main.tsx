import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'

const pages = {
  home: lazy(() => import('./app/App')),
  'pdf-memory': lazy(() => import('./pages/PdfMemoryPage')),
  'jwt-jwks': lazy(() => import('./pages/JwtJwksPage')),
  'incident-classifier': lazy(() => import('./pages/IncidentClassifierPage')),
}
const page = document.documentElement.dataset.page ?? 'home'
const Page = pages[page as keyof typeof pages]
if (!Page) throw new Error(`Unknown page: ${page}`)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<p role="status">Loading page…</p>}><Page /></Suspense>
  </StrictMode>,
)
