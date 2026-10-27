interface PostMetadata {
    slug: string
    title: string
    description: string
    tags: string[]
    readingMinutes: number
    publishedAt?: string
    updatedAt?: string
}
interface Route {
    path: string
    page: 'home' | 'posts' | 'post'
    siteRoot: string
    title: string
    description: string
    slug?: string
    post?: PostMetadata
}
export interface SiteModule {
    origin: string
    posts: PostMetadata[]
    getRoutes(): Route[]
    getStructuredData(route: Route): unknown
    renderRoute(route: Route): string
}
export function escapeXml(value: unknown): string
export function assetHref(route: Route, asset: string, base?: string): string
export function renderDocument(site: SiteModule, route: Route, options: { script: string; styles?: string[]; base?: string }): string
export function renderMigration(origin: string, slug: string): string
export function discoveryFiles(site: SiteModule): Record<string, string>
