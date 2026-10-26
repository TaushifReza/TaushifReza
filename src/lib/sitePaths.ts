/** Resolve site links independently of the current page and hosting prefix. */
export function siteHref(path: string): string {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(path)) {
    throw new Error('siteHref expects an internal site path')
  }
  const root = new URL(document.documentElement.dataset.siteRoot ?? './', document.baseURI)
  const target = new URL(path.replace(/^\/+/, ''), root)
  if (target.origin !== root.origin || !target.pathname.startsWith(root.pathname)) {
    throw new Error('Site link must stay within the site root')
  }
  return `${target.pathname}${target.search}${target.hash}`
}
