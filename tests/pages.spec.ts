import AxeBuilder from '@axe-core/playwright';
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { readdirSync } from 'node:fs';

const origin = 'https://taushifreza.com.np';
const articles = [
  { path: 'posts/jwt-jwks/', id: 'jwt-jwks', heading: 'Verifying JWTs across microservices with JWKS', fragment: 'intalent-details' },
  { path: 'posts/pdf-memory/', id: 'pdf-memory', heading: 'Why I use a fresh PDF renderer for every sheet', fragment: 'pdf-generator-details' },
  { path: 'posts/survey-question-snapshots/', id: 'survey-question-snapshots', heading: 'Why I freeze survey questions before collecting responses', fragment: 'survey-details' },
];
const pages = [{ path: 'posts/', id: 'posts', heading: 'Notes from the work.' }, ...articles];
const profileLinks = [
  'https://github.com/TaushifReza', 'https://www.linkedin.com/in/taushif-reza',
  'https://x.com/TaushifR786', 'https://bsky.app/profile/taushifreza.bsky.social',
  'https://www.instagram.com/taushifreza',
];
const publicLinks = new Set([
  ...profileLinks, 'https://intalentnepal.com',
  'https://github.com/TaushifReza/banking-app', 'https://github.com/TaushifReza/go-social',
  'https://www.rfc-editor.org/rfc/rfc7517', 'https://www.rfc-editor.org/rfc/rfc7519',
  'https://www.rfc-editor.org/rfc/rfc8725',
  'https://docs.djangoproject.com/en/5.2/topics/db/transactions',
  'https://pkg.go.dev/github.com/jung-kurt/gofpdf',
  'https://pkg.go.dev/github.com/pdfcpu/pdfcpu/pkg/api#MergeCreateFile',
]);

async function metadata(page: Page, request: APIRequestContext, baseURL: string, path: string) {
  const canonical = `${origin}/${path}`;
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical);
  const title = await page.title();
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', title);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S.{50}/);
  for (const selector of ['meta[property="og:image"]', 'meta[name="twitter:image"]']) {
    await expect(page.locator(selector)).toHaveAttribute('content', `${origin}/social-card.png`);
  }
  // Verify local bytes; never make CI depend on the production domain.
  expect((await request.get(new URL('./social-card.png', baseURL).href)).status()).toBe(200);
  const favicon = await page.locator('link[rel="icon"]').getAttribute('href');
  expect((await request.get(new URL(favicon!, page.url()).href)).status()).toBe(200);
  const feed = await page.locator('link[rel="alternate"][type="application/rss+xml"]').getAttribute('href');
  expect(new URL(feed!, page.url()).href).toBe(new URL('./feed.xml', baseURL).href);
}

async function noOverflow(page: Page) {
  expect(await page.evaluate(() => Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
}

for (const entry of pages) {
  test(`${entry.id}: complete response HTML, directory/index loads, metadata and hydration`, async ({ page, request, baseURL }) => {
    const problems: string[] = [];
    const external: string[] = [];
    page.on('pageerror', error => problems.push(error.message));
    page.on('console', message => { if (message.type() === 'error') problems.push(message.text()); });
    page.on('response', response => { if (response.status() >= 400) problems.push(`${response.status()} ${response.url()}`); });
    page.on('requestfailed', value => problems.push(value.url()));
    page.on('request', value => { if (/^https?:/.test(value.url()) && new URL(value.url()).origin !== new URL(baseURL!).origin) external.push(value.url()); });
    for (const suffix of ['', 'index.html']) {
      const raw = await request.get(`./${entry.path}${suffix}`);
      expect(raw.status()).toBe(200);
      const html = await raw.text();
      expect(html).toContain('data-prerendered="true"');
      expect(html).toContain('<h1');
      expect(html).toContain(entry.heading);
      if (entry.id !== 'posts') {
        expect(html.match(/<h2\b/g)!.length).toBeGreaterThanOrEqual(5);
        expect(html).toContain('Taushif Reza');
        expect(html).toContain('On this page');
      } else for (const article of articles) expect(html).toContain(article.heading);
      expect((await page.goto(`./${entry.path}${suffix}`))?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1, name: entry.heading })).toBeVisible();
      await expect(page.getByRole('main')).toHaveCount(1);
      await expect(page.locator('html')).toHaveAttribute('data-page', entry.id === 'posts' ? 'posts' : 'post');
      await metadata(page, request, baseURL!, entry.path);
      await page.reload();
      await expect(page.getByRole('heading', { level: 1, name: entry.heading })).toBeVisible();
      const links = await page.locator('a[href]').evaluateAll(elements => elements.map(element => ({ href: element.getAttribute('href')!, target: element.getAttribute('target'), rel: element.getAttribute('rel') ?? '' })));
      for (const link of links) {
        expect(link.href).not.toMatch(/^(?:mailto:|tel:)|\.(?:pdf|docx?)(?:[?#]|$)/i);
        if (/^https?:/.test(link.href)) {
          expect(publicLinks.has(link.href.replace(/\/$/, ''))).toBe(true);
          if (link.target === '_blank') expect(link.rel.split(/\s+/)).toEqual(expect.arrayContaining(['noopener', 'noreferrer']));
        } else {
          const target = new URL(link.href, page.url());
          expect(target.pathname.startsWith(new URL(baseURL!).pathname)).toBe(true);
          if (target.pathname === new URL(page.url()).pathname && target.hash) await expect(page.locator(target.hash)).toHaveCount(1);
        }
      }
    }
    await page.waitForLoadState('networkidle');
    expect(problems).toEqual([]);
    expect(external).toEqual([]);
  });

  for (const width of [320, 390, 768, 1440, 1920]) {
    test(`${entry.id}: reflow at ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`./${entry.path}`);
      await expect(page.getByRole('heading', { level: 1, name: entry.heading })).toBeVisible();
      await noOverflow(page);
      if (width === 390 || width === 1440) {
        await page.screenshot({ path: testInfo.outputPath(`${entry.id}-${width}-viewport.png`) });
        await page.screenshot({ path: testInfo.outputPath(`${entry.id}-${width}.png`), fullPage: true });
      }
    });
  }
  for (const width of [390, 1440]) {
    test(`${entry.id}: WCAG AA at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`./${entry.path}`);
      await expect(page.getByRole('heading', { level: 1, name: entry.heading })).toBeVisible();
      if (entry.id === 'jwt-jwks') {
        for (let step = 0; step < 3; step++) await page.getByRole('button', { name: 'Next step' }).click();
        await expect(page.getByRole('status')).toContainText('Allowed');
      }
      expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
    });
  }
  test(`${entry.id}: full content and native navigation without JavaScript`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
    try {
      const page = await context.newPage();
      await page.goto(`./${entry.path}`);
      await expect(page.getByRole('heading', { level: 1, name: entry.heading })).toBeVisible();
      if (entry.id === 'posts') {
        for (const article of articles) await expect(page.getByRole('heading', { level: 2, name: article.heading })).toBeVisible();
        await page.getByRole('heading', { level: 2 }).first().getByRole('link').click();
        await expect(page.getByRole('heading', { level: 1, name: articles[0].heading })).toBeVisible();
      } else {
        expect(await page.locator('main article p').count()).toBeGreaterThan(10);
        await expect(page.getByRole('heading', { level: 2, name: 'References' })).toBeVisible();
        const contents = page.getByRole('navigation', { name: 'On this page' }).getByRole('link');
        expect(await contents.count()).toBeGreaterThanOrEqual(4);
        const hash = await contents.first().getAttribute('href');
        await contents.first().click();
        expect(new URL(page.url()).hash).toBe(hash);
        await expect(page.locator(hash!)).toBeInViewport();
      }
    } finally { await context.close(); }
  });
}

test('static server redirects directories; removed lab, unknown and private paths return 404', async ({ request }) => {
  for (const path of ['posts', ...articles.map(article => article.path.slice(0, -1))]) {
    const response = await request.get(`./${path}?check=1`, { maxRedirects: 0 });
    expect(response.status()).toBe(301);
    expect(response.headers().location).toContain(`/${path}/?check=1`);
  }
  for (const path of ['lab/incident-classifier/', 'lab/incident-classifier/index.html', 'missing-page/', 'posts/not-a-post/', 'docs/development.md', 'AGENTS.md', 'claude_context.md', 'gemini_context.md', 'gpt_context.md', 'MOHAMMAD%20TAUSHIF%20REZA.CV.pdf']) {
    expect((await request.get(`./${path}`)).status()).toBe(404);
  }
  expect((await request.get('./%2e%2e%2fAGENTS.md')).status()).toBe(404);
  expect((await request.get('./%zz')).status()).toBe(400);
  const outputs = readdirSync(new URL('../dist/', import.meta.url), { recursive: true }).map(String);
  expect(outputs.filter(path => /(?:\.(?:wasm|onnx)$|classifier\.worker|transformers|ort-wasm|(?:^|\/)lab\/)/i.test(path))).toEqual([]);
});

test('legacy writing documents preserve a visible destination, canonical and HTML migration', async ({ page, request, baseURL }) => {
  for (const slug of ['pdf-memory', 'jwt-jwks']) {
    const response = await request.get(`./writing/${slug}/`);
    expect(response.status()).toBe(200); // Pages migration is HTML, not an HTTP 301.
    const parsed = await page.evaluate(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return { canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute('href'), refresh: doc.querySelector('meta[http-equiv="refresh"]')?.getAttribute('content'), href: doc.querySelector('main a')?.getAttribute('href'), text: doc.querySelector('main a')?.textContent };
    }, await response.text());
    expect(parsed.canonical).toBe(`${origin}/posts/${slug}/`);
    expect(parsed.refresh).toBe(`0;url=../../posts/${slug}/`);
    expect(parsed.text).toContain('Continue to the post');
    expect(new URL(parsed.href!, new URL(`writing/${slug}/`, baseURL)).href).toBe(new URL(`posts/${slug}/`, baseURL).href);
    await page.goto(`./writing/${slug}/`);
    await expect(page).toHaveURL(new URL(`posts/${slug}/`, baseURL!).href);
    await expect(page.getByRole('heading', { level: 1, name: articles.find(article => article.id === slug)!.heading })).toBeVisible();
  }
});

test('posts support keyboard skip navigation and heading anchors', async ({ page }) => {
  for (const entry of pages) {
    await page.goto(`./${entry.path}`);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('main')).toBeFocused();
    if (entry.id !== 'posts') {
      for (const href of await page.getByRole('navigation', { name: 'On this page' }).getByRole('link').evaluateAll(links => links.map(link => link.getAttribute('href')!))) {
        await expect(page.locator(href)).toHaveCount(1);
      }
    }
  }
});

test('homepage directory/index metadata and Posts index navigation', async ({ page, request, baseURL }) => {
  for (const suffix of ['', 'index.html']) {
    const raw = await request.get(`./${suffix}`);
    const html = await raw.text();
    expect(html).toContain('Good systems.');
    expect(html).toContain('Survey System');
    expect(html).toContain('<details');
    await page.goto(`./${suffix}`);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Good systems.');
    await metadata(page, request, baseURL!, '');
  }
  await page.reload();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Posts', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Notes from the work.' })).toBeVisible();
  for (const article of articles) await expect(page.getByRole('heading', { level: 2, name: article.heading })).toHaveCount(1);
});

test('related project links resolve to homepage disclosures after explicit index.html load', async ({ page }) => {
  for (const article of articles) {
    await page.goto(`./${article.path}index.html`);
    await page.locator(`a[href$="#${article.fragment}"]`).click();
    await expect(page.locator(`details#${article.fragment}`)).toHaveAttribute('open', '');
  }
});

test('JWT stepper hydrates, models all scenarios and resets deterministically', async ({ page }) => {
  await page.goto('./posts/jwt-jwks/');
  const next = page.getByRole('button', { name: 'Next step' });
  const previous = page.getByRole('button', { name: 'Previous' });
  for (const [scenario, outcome, steps] of [['valid', 'Allowed', 3], ['expired', 'expired token', 2], ['wrong-audience', 'audience mismatch', 2], ['permission-denied', 'authenticated, not authorized', 3]] as const) {
    await page.getByRole('combobox', { name: 'Scenario', exact: true }).selectOption(scenario);
    await expect(previous).toBeDisabled();
    for (let step = 0; step < steps; step++) await next.click();
    await expect(page.getByRole('status')).toContainText(outcome);
    await expect(next).toBeDisabled();
    await previous.click();
    await expect(next).toBeEnabled();
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'Scenario', exact: true })).toHaveValue('valid');
    await expect(previous).toBeDisabled();
    await expect(page.getByRole('status')).toContainText('Step 1');
  }
});

test('structured data agrees with visible authorship, titles and dates', async ({ page }) => {
  await page.goto('./');
  const profile = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
  expect(profile).toMatchObject({ '@type': 'ProfilePage', mainEntity: { '@type': 'Person', name: 'Taushif Reza', sameAs: expect.arrayContaining(profileLinks) } });
  await page.goto('./posts/');
  const collection = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
  expect(collection).toMatchObject({ '@type': 'CollectionPage', mainEntity: { '@type': 'ItemList', itemListElement: articles.map((article, index) => ({ '@type': 'ListItem', position: index + 1, url: `${origin}/${article.path}`, name: article.heading })) } });
  for (const article of articles) {
    await page.goto(`./${article.path}`);
    const schema = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!) as { '@graph': Record<string, unknown>[] };
    const post = schema['@graph'].find(item => item['@type'] === 'BlogPosting')!;
    expect(post).toMatchObject({ headline: article.heading, url: `${origin}/${article.path}`, author: { '@type': 'Person', name: 'Taushif Reza', url: `${origin}/`, sameAs: expect.arrayContaining(profileLinks) } });
    expect(schema['@graph'].find(item => item['@type'] === 'BreadcrumbList')).toMatchObject({ itemListElement: [{ position: 1, name: 'Home', item: `${origin}/` }, { position: 2, name: 'Posts', item: `${origin}/posts/` }, { position: 3, name: article.heading, item: `${origin}/${article.path}` }] });
    await expect(page.locator('main article').first()).toContainText('Taushif Reza');
    const visibleDates = await page.locator('main time').evaluateAll(elements => elements.map(element => element.getAttribute('datetime')));
    for (const key of ['datePublished', 'dateModified']) {
      if (post[key]) expect(visibleDates).toContain(post[key]);
    }
    if (!visibleDates.length) {
      expect(post).not.toHaveProperty('datePublished');
      expect(post).not.toHaveProperty('dateModified');
    }
  }
});

test('sitemap, RSS and robots expose only canonical public pages with valid XML', async ({ page, request }) => {
  const sitemapResponse = await request.get('./sitemap.xml');
  const feedResponse = await request.get('./feed.xml');
  expect(sitemapResponse.status()).toBe(200);
  expect(feedResponse.status()).toBe(200);
  expect(sitemapResponse.headers()['content-type']).toContain('xml');
  expect(feedResponse.headers()['content-type']).toContain('xml');
  const sitemap = await page.evaluate(xml => {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    return { errors: doc.querySelectorAll('parsererror').length, urls: [...doc.getElementsByTagName('loc')].map(node => node.textContent) };
  }, await sitemapResponse.text());
  expect(sitemap.errors).toBe(0);
  expect(sitemap.urls).toEqual([`${origin}/`, `${origin}/posts/`, ...articles.map(article => `${origin}/${article.path}`)]);
  const feed = await page.evaluate(xml => {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    return { errors: doc.querySelectorAll('parsererror').length, items: [...doc.querySelectorAll('item')].map(item => ({ title: item.querySelector('title')?.textContent, link: item.querySelector('link')?.textContent, guid: item.querySelector('guid')?.textContent, description: item.querySelector('description')?.textContent })) };
  }, await feedResponse.text());
  expect(feed.errors).toBe(0);
  expect(feed.items.map(item => ({ title: item.title, link: item.link, guid: item.guid }))).toEqual(articles.map(article => ({ title: article.heading, link: `${origin}/${article.path}`, guid: `${origin}/${article.path}` })));
  expect(feed.items.every(item => Boolean(item.description))).toBe(true);
  const robots = await request.get('./robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain(`Sitemap: ${origin}/sitemap.xml`);
  expect(await robots.text()).toMatch(/User-agent: \*[\s\S]*Allow: \//);
});
