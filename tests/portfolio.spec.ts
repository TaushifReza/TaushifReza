import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const projectIds = ['intalent', 'survey', 'bus-attendance', 'attendance', 'qr-ticketing', 'pdf-generator', 'mango'];
const sectionIds = ['work', 'approach', 'experience', 'expertise', 'contact'];

async function expectNoOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
}

async function expectHeroPortraitLayout(page: Page, width: number) {
  const portrait = page.locator('#top').getByRole('img', { name: 'Portrait of Taushif Reza' });
  await expect(portrait).toBeVisible();
  await expect(portrait).toBeInViewport({ ratio: 1 });
  await page.evaluate(() => document.fonts.ready);
  const layout = await portrait.evaluate((element) => {
    const image = element as HTMLImageElement;
    const bounds = image.getBoundingClientRect();
    const caption = image.closest('figure')!.querySelector('figcaption')!.getBoundingClientRect();
    let clipped = false;
    for (let ancestor = image.parentElement; ancestor; ancestor = ancestor.parentElement) {
      const style = getComputedStyle(ancestor);
      const container = ancestor.getBoundingClientRect();
      if (['hidden', 'clip'].includes(style.overflowX) && (bounds.left < container.left - 1 || bounds.right > container.right + 1)) clipped = true;
      if (['hidden', 'clip'].includes(style.overflowY) && (bounds.top < container.top - 1 || bounds.bottom > container.bottom + 1)) clipped = true;
    }
    return {
      image: { left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom, width: bounds.width, height: bounds.height },
      caption: { left: caption.left, top: caption.top, bottom: caption.bottom },
      clipped,
    };
  });
  expect(layout.image.left).toBeGreaterThanOrEqual(0);
  expect(layout.image.right).toBeLessThanOrEqual(width);
  expect(layout.image.width / layout.image.height).toBeCloseTo(419 / 595, 2);
  expect(layout.clipped).toBe(false);
  expect(layout.image.width).toBeLessThanOrEqual(320);
  if (width <= 760) {
    expect(layout.image.width).toBeCloseTo(120, 0);
    expect(layout.caption.left).toBeGreaterThanOrEqual(layout.image.right);
    expect(layout.caption.top).toBeGreaterThanOrEqual(layout.image.top);
    expect(layout.caption.bottom).toBeLessThanOrEqual(layout.image.bottom);
  } else {
    expect(layout.caption.top).toBeGreaterThanOrEqual(layout.image.bottom);
  }
  for (const name of ['Explore my work', 'Let’s connect']) {
    const action = page.locator('#top').getByRole('link', { name, exact: false });
    await expect(action).toBeVisible();
    expect(await action.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return element.contains(document.elementFromPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2));
    })).toBe(true);
    const bounds = (await action.boundingBox())!;
    const overlapsPortrait = bounds.x < layout.image.right && bounds.x + bounds.width > layout.image.left
      && bounds.y < layout.image.bottom && bounds.y + bounds.height > layout.image.top;
    expect(overlapsPortrait).toBe(false);
    if (width <= 760) expect(bounds.y + bounds.height).toBeLessThanOrEqual(layout.image.top);
  }
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
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toHaveCount(1);
  await expect(page.getByRole('navigation', { name: 'More social profiles' })).toHaveCount(1);
  await expect(page.getByRole('main')).toContainText(/software engineer/i);
  const portrait = page.locator('#top').getByRole('img', { name: 'Portrait of Taushif Reza' });
  await expect(page.getByRole('img', { name: 'Portrait of Taushif Reza' })).toHaveCount(1);
  await expect(page.locator('#approach img')).toHaveCount(0);
  await expect(portrait).toBeVisible();
  await expect.poll(() => portrait.evaluate((image) => {
    const portrait = image as HTMLImageElement;
    return [portrait.naturalWidth, portrait.naturalHeight];
  })).toEqual([419, 595]);
  await expect(portrait).toHaveAttribute('src', /\/bg_remove\.png$/);
  await expect(portrait).toHaveAttribute('width', '419');
  await expect(portrait).toHaveAttribute('height', '595');
  await expect(portrait).toHaveAttribute('loading', 'eager');
  await expect(portrait).toHaveAttribute('fetchpriority', 'high');
  await expect(portrait).toHaveAttribute('decoding', 'async');
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
      'https://github.com/TaushifReza/banking-app',
      'https://github.com/TaushifReza/go-social',
      'https://intalentnepal.com',
      'https://x.com/TaushifR786',
      'https://bsky.app/profile/taushifreza.bsky.social',
      'https://www.instagram.com/taushifreza',
    ]).toContain(href.replace(/\/$/, ''));
    if (target === '_blank') expect(rel.split(/\s+/)).toEqual(expect.arrayContaining(['noopener', 'noreferrer']));
  }
  expect(links.some(({ href }) => /\.(?:pdf|docx?)(?:[?#]|$)/i.test(href))).toBe(false);
  expect(await page.locator('#work article[id]').evaluateAll(elements => elements.slice(0, 4).map(element => element.id))).toEqual(projectIds.slice(0, 4));
  await expect(page.locator('#survey a[href^="https:"]')).toHaveCount(0);
  await expect(page.locator('details#intalent-details')).not.toHaveAttribute('open', '');
  const liveLink = page.getByRole('link', { name: 'Visit inTalent', exact: true });
  await expect(liveLink).toHaveCount(1);
  await expect(liveLink).toBeVisible();
  await expect(liveLink).toHaveAttribute('href', 'https://intalentnepal.com');
  await expect(page.locator('#mango')).toContainText(/course-based/i);
  await expect(page.locator('#expertise')).toContainText('Python');
  await expect(page.locator('#expertise')).toContainText('C#');
  for (const [name, href] of [['X', 'https://x.com/TaushifR786'], ['Bluesky', 'https://bsky.app/profile/taushifreza.bsky.social'], ['Instagram', 'https://www.instagram.com/taushifreza']]) {
    await expect(page.getByRole('navigation', { name: 'More social profiles' }).getByRole('link', { name, exact: false })).toHaveAttribute('href', href);
  }
  await expect(page.getByRole('link', { name: 'Lab', exact: true })).toHaveCount(0);
  await expect(page.locator('a[href*="lab/incident-classifier"]')).toHaveCount(0);
});

test('keyboard skip navigation, section anchors, and case studies', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.keyboard.press('Tab');
  const skipLink = page.getByRole('link', { name: /skip/i });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();

  for (const id of sectionIds) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
    const navLink = page.getByRole('navigation', { name: 'Main navigation' }).locator(`a[href="#${id}"]`);
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

for (const width of [320, 390, 768, 1024, 1440, 1920]) {
  test(`reflows at ${width}px, including all expanded diagrams`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('./');
    await expectNoOverflow(page);
    await expectHeroPortraitLayout(page, width);
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

test('JavaScript-disabled visitors can read the portfolio and expand project details', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  try {
    await page.goto('./');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Good systems.');
    await expect(page.locator('#expertise')).toContainText('Python');
    for (const id of projectIds) {
      const disclosure = page.locator(`details#${id}-details`);
      await disclosure.locator('summary').click();
      await expect(disclosure).toHaveAttribute('open', '');
      await expect(disclosure).toContainText('My contribution');
    }
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Posts', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Notes from the work.');
  } finally { await context.close(); }
});
