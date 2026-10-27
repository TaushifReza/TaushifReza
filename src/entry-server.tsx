import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import Page from './site/Page'
import { SitePathProvider } from './lib/sitePaths'
import { posts } from './data/posts'
import { profile } from './data/portfolio'

export const origin = 'https://taushifreza.com.np'
export const siteTitle = 'Taushif Reza — Software Engineer'
export const siteDescription = 'Backend engineering across authentication, workflows, real-time systems, and developer tooling. Projects and posts by Taushif Reza.'

export function getRoutes() {
    return [
        { path: '', page: 'home' as const, siteRoot: './', title: siteTitle, description: siteDescription },
        { path: 'posts/', page: 'posts' as const, siteRoot: '../', title: 'Posts — Taushif Reza', description: 'Source-backed posts about backend engineering, authentication, PDF generation, and survey systems.' },
        ...posts.map((post) => ({ path: `posts/${post.slug}/`, page: 'post' as const, slug: post.slug, siteRoot: '../../', title: `${post.title} — Taushif Reza`, description: post.description, post })),
    ]
}

export function renderRoute(route: ReturnType<typeof getRoutes>[number]) {
    return renderToString(<StrictMode><SitePathProvider siteRoot={route.siteRoot}>
        <Page page={route.page} slug={'slug' in route ? route.slug : undefined} />
    </SitePathProvider></StrictMode>)
}

export function getStructuredData(route: ReturnType<typeof getRoutes>[number]) {
    const author = { '@type': 'Person', '@id': `${origin}/#person`, name: 'Taushif Reza', url: `${origin}/`, sameAs: Object.values(profile.links) }
    const url = `${origin}/${route.path}`
    if (route.page === 'home') return { '@context': 'https://schema.org', '@type': 'ProfilePage', '@id': url, url, name: siteTitle, mainEntity: author }
    if (route.page === 'posts') return { '@context': 'https://schema.org', '@type': 'CollectionPage', url, name: 'Posts by Taushif Reza', mainEntity: { '@type': 'ItemList', itemListElement: posts.map((post, index) => ({ '@type': 'ListItem', position: index + 1, url: `${origin}/posts/${post.slug}/`, name: post.title })) } }
    if (!('post' in route)) throw new Error('Post metadata missing')
    const post = route.post
    return {
        '@context': 'https://schema.org', '@graph': [
            { '@type': 'BlogPosting', '@id': `${url}#article`, url, mainEntityOfPage: url, headline: post.title, description: post.description, image: `${origin}/social-card.png`, author, keywords: post.tags.join(', '), inLanguage: 'en', ...(post.publishedAt ? { datePublished: post.publishedAt } : {}), ...(post.updatedAt ? { dateModified: post.updatedAt } : {}) },
            { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` }, { '@type': 'ListItem', position: 2, name: 'Posts', item: `${origin}/posts/` }, { '@type': 'ListItem', position: 3, name: post.title, item: url }] },
        ]
    }
}

export { posts }
