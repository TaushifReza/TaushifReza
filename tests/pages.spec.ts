import AxeBuilder from '@axe-core/playwright';
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

const pages = [
  { path: 'writing/pdf-memory/', id: 'pdf-memory', heading: 'Smaller lifetimes. A more manageable PDF pipeline.' },
  { path: 'writing/jwt-jwks/', id: 'jwt-jwks', heading: 'A valid signature is only the beginning.' },
  { path: 'lab/incident-classifier/', id: 'incident-classifier', heading: 'Incident classifier' },
];
const publicLinks = new Set([
  'https://github.com/TaushifReza', 'https://www.linkedin.com/in/taushif-reza',
  'https://github.com/TaushifReza/banking-app', 'https://github.com/TaushifReza/go-social',
  'https://www.rfc-editor.org/rfc/rfc7517', 'https://www.rfc-editor.org/rfc/rfc7519',
  'https://www.rfc-editor.org/rfc/rfc8725',
  'https://huggingface.co/cross-encoder/nli-deberta-v3-xsmall',
]);

async function expectProductionMetadata(page: Page, request: APIRequestContext, baseURL: string, path: string) {
  const canonical = `https://taushifreza.com.np/${path}`;
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical);
  for (const selector of ['meta[property="og:image"]', 'meta[name="twitter:image"]']) {
    await expect(page.locator(selector)).toHaveAttribute('content', 'https://taushifreza.com.np/social-card.png');
  }
  // Production metadata must not make verification depend on a deployed site.
  expect((await request.get(new URL('./social-card.png', baseURL).href)).status()).toBe(200);
  const favicon = await page.locator('link[rel="icon"]').getAttribute('href');
  expect((await request.get(new URL(favicon!, page.url()).href)).status()).toBe(200);
}

async function noOverflow(page: Page) {
  expect(await page.evaluate(() => Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
}

for (const entry of pages) {
  test(`${entry.id}: direct directory, refresh, index.html, metadata and local assets`, async ({ page, request, baseURL }) => {
    const problems: string[] = [];
    const external: string[] = [];
    const inferenceRequests: string[] = [];
    page.on('pageerror', error => problems.push(error.message));
    page.on('response', response => { if (response.status() >= 400) problems.push(`${response.status()} ${response.url()}`); });
    page.on('requestfailed', value => problems.push(value.url()));
    page.on('request', value => { if (/^https?:/.test(value.url()) && new URL(value.url()).origin !== new URL(baseURL!).origin) external.push(value.url()); });
    page.on('request', value => { if (/\/(?:classifier\.worker-|transformers\.web-|ort-wasm-)/.test(new URL(value.url()).pathname)) inferenceRequests.push(value.url()); });
    for (const suffix of ['', 'index.html']) {
      const response = await page.goto(`./${entry.path}${suffix}`);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1, name: entry.heading })).toBeVisible();
      const title = await page.title();
      expect(title).toContain(entry.id === 'incident-classifier' ? 'Browser-local incident classifier' : entry.heading);
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
      await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', title);
      await expect(page.locator('html')).toHaveAttribute('data-page', entry.id);
      await expect(page.getByRole('main')).toHaveCount(1);
      await expect(page.locator('#work')).toHaveCount(0);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S.{50}/);
      await expectProductionMetadata(page, request, baseURL!, entry.path);
      await page.reload();
      await expect(page.getByRole('heading', { level: 1, name: entry.heading })).toBeVisible();
      const links = await page.locator('a[href]').evaluateAll(elements => elements.map(element => ({ href: element.getAttribute('href')!, target: element.getAttribute('target'), rel: element.getAttribute('rel') ?? '' })));
      for (const link of links) {
        expect(link.href).not.toMatch(/^(?:mailto:|tel:)|\.(?:pdf|docx?)(?:[?#]|$)/i);
        if (/^https?:/.test(link.href)) {
          expect(publicLinks.has(link.href.replace(/\/$/, '')) || /^https:\/\/huggingface\.co\/Xenova\/nli-deberta-v3-xsmall\/tree\/[a-f\d]{40}$/.test(link.href)).toBe(true);
          if (link.target === '_blank') expect(link.rel.split(/\s+/)).toEqual(expect.arrayContaining(['noopener', 'noreferrer']));
        } else {
          const target = new URL(link.href, page.url());
          expect(target.pathname).toMatch(new RegExp(`^${new URL(baseURL!).pathname}`));
          if (target.pathname === new URL(page.url()).pathname && target.hash) await expect(page.locator(target.hash)).toHaveCount(1);
        }
      }
    }
    await page.waitForLoadState('networkidle');
    expect(problems).toEqual([]);
    expect(external).toEqual([]);
    expect(inferenceRequests).toEqual([]);
  });

  for (const width of [320, 390, 768, 1440, 1920]) {
    test(`${entry.id}: reflow at ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`./${entry.path}`);
      await expect(page.getByRole('heading', { level: 1, name: entry.heading })).toBeVisible();
      await noOverflow(page);
      if (entry.id === 'incident-classifier') {
        const matrix = page.getByRole('region', { name: 'Evaluation confusion matrix. Scroll horizontally to view all columns.' });
        await expect(matrix.getByRole('table')).toBeVisible();
        await expect(matrix.getByRole('row')).toHaveCount(5);
        if (width <= 390) {
          expect(await matrix.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true);
          await matrix.focus();
          await expect(matrix).toBeFocused();
          await page.keyboard.press('ArrowRight');
          await expect.poll(() => matrix.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
          await noOverflow(page);
        }
        await page.getByText('Inspect all 40 predictions and errors', { exact: true }).click();
        const predictions = page.locator('details').filter({ has: page.getByText('Inspect all 40 predictions and errors', { exact: true }) });
        await expect(predictions.locator('li')).toHaveCount(40);
        await expect(predictions.locator('li').last()).toBeVisible();
        await noOverflow(page);
      }
      if (width === 390 || width === 1440) await page.screenshot({ path: testInfo.outputPath(`${entry.id}-${width}.png`), fullPage: true });
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
  test(`${entry.id}: meaningful JavaScript-disabled fallback`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
    try {
      const page = await context.newPage();
      await page.goto(`./${entry.path}`);
      await expect(page.locator('noscript p').first()).toContainText(/JavaScript/);
      await expect(page.locator('noscript h1')).toBeVisible();
      await expect(page.locator('noscript').getByRole('link', { name: 'GitHub', exact: true })).toBeVisible();
      await expect(page.locator('noscript').getByRole('link', { name: 'LinkedIn', exact: true })).toBeVisible();
    } finally { await context.close(); }
  });
}

test('static server redirects directories and returns real 404 for unknown/private paths', async ({ request }) => {
  for (const path of ['writing/pdf-memory', 'writing/jwt-jwks', 'lab/incident-classifier']) {
    const response = await request.get(`./${path}?check=1`, { maxRedirects: 0 });
    expect(response.status()).toBe(301);
    expect(response.headers().location).toContain(`/${path}/?check=1`);
  }
  for (const path of ['missing-page/', 'writing/not-an-article/', 'docs/development.md', 'AGENTS.md', 'claude_context.md', 'gemini_context.md', 'gpt_context.md', 'MOHAMMAD%20TAUSHIF%20REZA.CV.pdf']) {
    expect((await request.get(`./${path}`)).status()).toBe(404);
  }
  expect((await request.get('./%2e%2e%2fAGENTS.md')).status()).toBe(404);
  expect((await request.get('./%zz')).status()).toBe(400);
});

test('new pages support keyboard skip navigation', async ({ page }) => {
  for (const entry of pages) {
    await page.goto(`./${entry.path}`);
    await expect(page.getByRole('heading', { level: 1, name: entry.heading })).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('main')).toBeFocused();
  }
});

test('homepage supports directory and index.html metadata, refresh, and writing navigation', async ({ page, request, baseURL }) => {
  for (const suffix of ['', 'index.html']) {
    await page.goto(`./${suffix}`);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Good systems.');
    await expectProductionMetadata(page, request, baseURL!, '');
  }
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Good systems.');
  await page.locator('#writing a[href$="/writing/pdf-memory/"]').click();
  await expect(page.getByRole('heading', { level: 1, name: pages[0].heading })).toBeVisible();
});

test('article return links resolve to homepage fragments after index.html load', async ({ page }) => {
  for (const [path, fragment] of [['writing/pdf-memory/', 'pdf-generator-details'], ['writing/jwt-jwks/', 'intalent-details']]) {
    await page.goto(`./${path}index.html`);
    await page.locator(`a[href$="#${fragment}"]`).click();
    await expect(page.locator(`details#${fragment}`)).toHaveAttribute('open', '');
  }
});

test('JWT native stepper models all scenarios and resets deterministically', async ({ page }) => {
  await page.goto('./writing/jwt-jwks/');
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
