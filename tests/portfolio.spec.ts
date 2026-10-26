import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const projectIds = ['bus-attendance', 'intalent', 'qr-ticketing', 'pdf-generator'];
const sectionIds = ['work', 'approach', 'experience', 'expertise', 'contact'];

async function expectNoOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
}

async function openProjects(page: Page) {
  for (const id of projectIds) {
    const disclosure = page.locator(`details#${id}-details`);
    if (!(await disclosure.evaluate((element) => (element as HTMLDetailsElement).open))) {
      await disclosure.locator('summary').click();
    }
    await expect(disclosure).toHaveAttribute('open', '');
  }
}

test('public identity, landmarks, links, and contact privacy', async ({ page }) => {
  await page.goto('./');
  await expect(page).toHaveTitle(/Taushif Reza/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('main')).toContainText('Taushif');
  await expect(page.getByRole('main')).toHaveCount(1);
  await expect(page.getByRole('navigation')).toHaveCount(1);
  await expect(page.getByRole('main')).toContainText(/software engineer/i);
  await expect(page.locator('a[href^="mailto:"], a[href^="tel:"], a[download], form')).toHaveCount(0);
  const links = await page.locator('a[href]').evaluateAll((elements) =>
    elements.map((element) => ({
      href: element.getAttribute('href') ?? '',
      target: element.getAttribute('target'),
      rel: element.getAttribute('rel') ?? '',
    })),
  );
  const externalLinks = links.filter(({ href }) => /^https?:/.test(href));
  expect(externalLinks.length).toBeGreaterThanOrEqual(2);
  for (const { href, target, rel } of externalLinks) {
    expect([
      'https://github.com/TaushifReza',
      'https://www.linkedin.com/in/taushif-reza',
    ]).toContain(href.replace(/\/$/, ''));
    if (target === '_blank') expect(rel.split(/\s+/)).toEqual(expect.arrayContaining(['noopener', 'noreferrer']));
  }
  expect(links.some(({ href }) => /\.(?:pdf|docx?)(?:[?#]|$)/i.test(href))).toBe(false);
});

test('keyboard skip navigation, section anchors, and case studies', async ({ page }) => {
  await page.goto('./');
  await page.keyboard.press('Tab');
  const skipLink = page.getByRole('link', { name: /skip/i });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();

  for (const id of sectionIds) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
    const navLink = page.getByRole('navigation').locator(`a[href="#${id}"]`);
    if (!(await navLink.count())) continue;
    await navLink.click();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect(page.locator(`#${id}`)).toBeInViewport();
  }

  for (const id of projectIds) {
    const disclosure = page.locator(`details#${id}-details`);
    const summary = disclosure.locator('summary');
    await summary.focus();
    await expect(summary).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(disclosure).toHaveAttribute('open', '');
    await page.keyboard.press('Space');
    await expect(disclosure).not.toHaveAttribute('open', '');
  }
});

test('case-study fragments expand on first load and hash navigation', async ({ page }) => {
  for (const id of projectIds) {
    await page.goto(`./#${id}-details`);
    await expect(page.locator(`details#${id}-details`)).toHaveAttribute('open', '');
  }
  await page.goto('./');
  for (const id of projectIds) {
    await page.evaluate((fragment) => { window.location.hash = fragment; }, `${id}-details`);
    await expect(page.locator(`details#${id}-details`)).toHaveAttribute('open', '');
  }
});

for (const width of [320, 390, 768, 1440, 1920]) {
  test(`reflows at ${width}px, including all expanded diagrams`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('./');
    await expectNoOverflow(page);
    await page.screenshot({ path: testInfo.outputPath(`portfolio-${width}-viewport.png`) });
    await openProjects(page);
    await expectNoOverflow(page);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({ path: testInfo.outputPath(`portfolio-${width}.png`), fullPage: true });
  });
}

for (const width of [390, 1440]) {
  for (const expanded of [false, true]) {
    test(`WCAG 2 AA scan at ${width}px, ${expanded ? 'expanded' : 'closed'} studies`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('./');
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.locator('#work').getByRole('heading', { level: 2 })).toBeVisible();
      if (expanded) await openProjects(page);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      expect(results.violations).toEqual([]);
    });
  }
}

test('reflow at a 200%-zoom-equivalent 640px viewport', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 640, height: 1000 });
  await page.goto('./');
  // A 640px layout viewport approximates a 1280px window at 200% zoom.
  // This does not automate browser chrome zoom or verify text enlargement.
  await openProjects(page);
  await expectNoOverflow(page);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('#contact')).toBeVisible();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: testInfo.outputPath('portfolio-zoom-equivalent-reflow.png'), fullPage: true });
});

test('reduced-motion preference preserves usable navigation and disclosures', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'auto');
  await openProjects(page);
  const movingElements = await page.locator('*').evaluateAll((elements) =>
    elements.filter((element) => {
      const style = getComputedStyle(element);
      return style.animationName !== 'none' && style.animationDuration.split(',').some((duration) => parseFloat(duration) > 0.01);
    }).length,
  );
  expect(movingElements).toBe(0);
});

test('production page loads local assets without errors or external requests', async ({ page, baseURL }) => {
  const errors: string[] = [];
  const failures: string[] = [];
  const externalRequests: string[] = [];
  const origin = new URL(baseURL!).origin;
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('requestfailed', (request) => failures.push(request.url()));
  page.on('response', (response) => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
  page.on('request', (request) => {
    if (/^https?:/.test(request.url()) && new URL(request.url()).origin !== origin) externalRequests.push(request.url());
  });
  await page.goto('./');
  await openProjects(page);
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);
  expect(failures).toEqual([]);
  expect(externalRequests).toEqual([]);
});

test('JavaScript-disabled visitors receive an explanation', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  try {
    await page.goto('./');
    const explanation = page.locator('noscript p');
    await expect(explanation).toBeVisible();
    await expect(explanation).toContainText(/JavaScript/i);
    await expect(explanation.getByRole('link', { name: 'GitHub', exact: true })).toBeVisible();
    await expect(explanation.getByRole('link', { name: 'LinkedIn', exact: true })).toBeVisible();
  } finally {
    await context.close();
  }
});
