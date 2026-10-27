import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import Page, { type PageIdentity } from './site/Page'
import { SitePathProvider } from './lib/sitePaths'
import './styles/global.css'

const documentData = document.documentElement.dataset
const page = documentData.page ?? 'home'
if (!['home', 'posts', 'post'].includes(page)) throw new Error(`Unknown page: ${page}`)
const tree = <StrictMode><SitePathProvider siteRoot={documentData.siteRoot ?? './'}>
    <Page page={page as PageIdentity['page']} slug={documentData.postSlug} />
</SitePathProvider></StrictMode>
const root = document.getElementById('root')!
if (documentData.prerendered === 'true') hydrateRoot(root, tree)
else createRoot(root).render(tree)
