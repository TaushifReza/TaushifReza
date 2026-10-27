import { createContext, useContext, type ReactNode } from 'react'

const SiteRootContext = createContext('./')

/** Both server and browser receive the same depth-relative site root. */
export function SitePathProvider({ siteRoot, children }: { siteRoot: string; children: ReactNode }) {
    if (!/^(?:\.\/|(?:\.\.\/)+)$/.test(siteRoot)) throw new Error('Invalid relative site root')
    return <SiteRootContext.Provider value={siteRoot}>{children}</SiteRootContext.Provider>
}

// Pure link resolution is intentionally shared by the provider's consumers.
// eslint-disable-next-line react-refresh/only-export-components
export function resolveSiteHref(siteRoot: string, path: string): string {
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(path) || path.includes('\\') || [...path].some((character) => character.charCodeAt(0) < 32)) throw new Error('Site links must be internal paths')
    const normalized = path.replace(/^\/+/, '')
    const pathname = normalized.split(/[?#]/, 1)[0]
    if (pathname.split('/').some((part) => {
        let decoded: string
        try { decoded = decodeURIComponent(part) } catch { return true }
        return decoded === '..' || decoded === '.' || /[\\/]/.test(decoded)
    })) throw new Error('Site link must stay within the site root')
    return `${siteRoot}${normalized}`
}

// The context and its hook form one shared server/browser link contract.
// eslint-disable-next-line react-refresh/only-export-components
export function useSiteHref() {
    const siteRoot = useContext(SiteRootContext)
    return (path: string) => resolveSiteHref(siteRoot, path)
}
