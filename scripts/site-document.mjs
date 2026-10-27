const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
export const escapeXml = escapeHtml;

export function assetHref(route, asset, base = './') {
    return base === './' ? `${route.siteRoot}${asset}` : `${base}${asset}`;
}

export function renderDocument(site, route, { script, styles = [], base = './' }) {
    const canonical = `${site.origin}/${route.path}`;
    const structured = JSON.stringify(site.getStructuredData(route)).replaceAll('<', '\\u003c');
    const article = route.page === 'post';
    return `<!doctype html>
<html lang="en" data-page="${route.page}" data-site-root="${route.siteRoot}" data-prerendered="true"${route.slug ? ` data-post-slug="${escapeHtml(route.slug)}"` : ''}>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="theme-color" content="#f6f5f1" />
<title>${escapeHtml(route.title)}</title>
<meta name="description" content="${escapeHtml(route.description)}" />
<link rel="canonical" href="${canonical}" />
<meta property="og:url" content="${canonical}" />
<meta property="og:type" content="${article ? 'article' : 'website'}" />
<meta property="og:title" content="${escapeHtml(route.title)}" />
<meta property="og:description" content="${escapeHtml(route.description)}" />
<meta property="og:image" content="${site.origin}/social-card.png" />
<meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Taushif Reza — Software Engineer. Reliable systems, thoughtfully built." />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(route.title)}" />
<meta name="twitter:description" content="${escapeHtml(route.description)}" />
<meta name="twitter:image" content="${site.origin}/social-card.png" />
${article ? '<meta name="author" content="Taushif Reza" />' : ''}
<link rel="icon" type="image/svg+xml" href="${assetHref(route, 'favicon.svg', base)}" />
<link rel="alternate" type="application/rss+xml" title="Posts by Taushif Reza" href="${assetHref(route, 'feed.xml', base)}" />
${styles.map((file) => `<link rel="stylesheet" href="${assetHref(route, file, base)}" />`).join('\n')}
<script type="application/ld+json">${structured}</script>
</head>
<body><div id="root">${site.renderRoute(route)}</div>
<script type="module" src="${assetHref(route, script, base)}"></script>
</body></html>`;
}

export function renderMigration(origin, slug) {
    const canonical = `${origin}/posts/${slug}/`;
    const target = `../../posts/${slug}/`;
    return `<!doctype html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Post moved — Taushif Reza</title><link rel="canonical" href="${canonical}" /><meta http-equiv="refresh" content="0;url=${target}" /></head><body><main><h1>This post has moved</h1><p><a href="${target}">Continue to the post</a>.</p></main></body></html>`;
}

export function discoveryFiles(site) {
    const routes = site.getRoutes();
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((route) => `<url><loc>${escapeXml(`${site.origin}/${route.path}`)}</loc>${route.post?.updatedAt ? `<lastmod>${escapeXml(route.post.updatedAt)}</lastmod>` : ''}</url>`).join('')}</urlset>\n`;
    const feed = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Posts by Taushif Reza</title><link>${site.origin}/posts/</link><description>Practical posts about backend engineering.</description><language>en</language><atom:link href="${site.origin}/feed.xml" rel="self" type="application/rss+xml" />${site.posts.map((post) => {
        const url = `${site.origin}/posts/${post.slug}/`;
        return `<item><title>${escapeXml(post.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><description>${escapeXml(post.description)}</description>${post.publishedAt ? `<pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>` : ''}${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join('')}</item>`;
    }).join('')}</channel></rss>\n`;
    return { 'sitemap.xml': sitemap, 'feed.xml': feed, 'robots.txt': `User-agent: *\nAllow: /\n\nSitemap: ${site.origin}/sitemap.xml\n` };
}
