import { expect, test } from '@playwright/test';
import { createServer } from 'vite';

test('development rendering prefixes entry, favicon and feed URLs exactly once', async ({ request }) => {
  test.setTimeout(60_000);
  for (const base of ['/', '/portfolio/']) {
    await test.step(`development base ${base}`, async () => {
      const server = await createServer({
        base,
        cacheDir: `node_modules/.cache/development-test-vite/${base === '/' ? 'root' : 'prefix'}`,
        optimizeDeps: { noDiscovery: true, include: [] },
        server: { host: '127.0.0.1', port: 4193, strictPort: true },
      });
      try {
        await server.listen();
        const origin = 'http://127.0.0.1:4193';
        const response = await request.get(`${origin}${base}posts/jwt-jwks/`);
        expect(response.status()).toBe(200);
        const html = await response.text();
        expect(html).toContain('data-prerendered="true"');
        expect(html).toContain('<h1>Verifying JWTs across microservices with JWKS</h1>');
        const scripts = [...html.matchAll(/<script\b[^>]*src="([^"]+)"[^>]*>/g)].map(match => match[1]);
        const main = scripts.find(src => src.endsWith('/src/main.tsx'));
        expect(main).toBe(`${base}src/main.tsx`);
        expect(scripts).toContain(`${base}@vite/client`);
        const favicon = /<link\b[^>]*rel="icon"[^>]*href="([^"]+)"/.exec(html)?.[1];
        expect(favicon).toBe(`${base}favicon.svg`);
        const feed = /<link\b[^>]*rel="alternate"[^>]*href="([^"]+)"/.exec(html)?.[1];
        expect(feed).toBe(`${base}feed.xml`);

        const scriptResponse = await request.get(new URL(main!, origin).href);
        expect(scriptResponse.status()).toBe(200);
        expect(scriptResponse.headers()['content-type']).toContain('javascript');
        expect(await scriptResponse.text()).toContain('hydrateRoot');
        const faviconResponse = await request.get(new URL(favicon!, origin).href);
        expect(faviconResponse.status()).toBe(200);
        expect(faviconResponse.headers()['content-type']).toContain('image/svg+xml');
        expect(await faviconResponse.text()).toContain('<svg');
        const feedResponse = await request.get(new URL(feed!, origin).href);
        expect(feedResponse.status()).toBe(200);
        expect(feedResponse.headers()['content-type']).toContain('xml');
        expect(await feedResponse.text()).toContain('<rss');
      } finally {
        await server.close();
      }
    });
  }
});
