import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const result = {
  rankings: [
    { label: 'Database', score: 0.7 }, { label: 'Infrastructure', score: 0.15 },
    { label: 'Application logic', score: 0.1 }, { label: 'Authentication/access control', score: 0.05 },
  ],
  predictedLabel: 'Database', uncertain: false, margin: 0.55, durationMs: 160, maxInputTokens: 256,
};

async function mockWorker(page: Page, failFirst = false) {
  await page.addInitScript(`(() => {
    const workers = [];
    window.__labWorkers = workers;
    window.Worker = class {
      constructor() { this.onmessage = null; this.onerror = null; this.messages = []; this.terminated = false; workers.push(this); }
      postMessage(message) {
        this.messages.push(message);
        if (message.type === 'load') setTimeout(() => this.deliver(${failFirst} && workers.length === 1
          ? {type:'error',requestId:message.requestId,message:'Synthetic model download failure'}
          : {type:'ready',requestId:message.requestId}), 10);
      }
      deliver(data) { this.onmessage?.({data}); }
      terminate() { this.terminated = true; }
    };
  })();`);
}

type MockWorker = { messages: { type: string; requestId: number; text?: string }[]; terminated: boolean; deliver: (data: unknown) => void }
type MockWindow = Window & { __labWorkers: MockWorker[] }

test('production worker loads local runtime only after opt-in and reports blocked model download', async ({ page, context, baseURL }) => {
  const external: { url: string; method: string; body: string | null }[] = [];
  const local: string[] = [];
  const localFailures: string[] = [];
  const origin = new URL(baseURL!).origin;
  await context.route('**/*', async route => {
    const request = route.request();
    if (new URL(request.url()).origin !== origin) {
      external.push({ url: request.url(), method: request.method(), body: request.postData() });
      await route.abort('failed');
    } else {
      local.push(request.url());
      await route.continue();
    }
  });
  context.on('response', response => { if (new URL(response.url()).origin === origin && response.status() >= 400) localFailures.push(response.url()); });
  await page.goto('./lab/incident-classifier/');
  await expect(page.getByRole('heading', { level: 1, name: 'Incident classifier' })).toBeVisible();
  expect(external).toEqual([]);
  expect(local.filter(url => /classifier\.worker-|transformers\.web-|ort-wasm-/.test(url))).toEqual([]);
  const summary = 'private-test-sentinel-never-upload';
  await page.getByLabel('Incident summary', { exact: true }).fill(summary);
  await page.getByRole('button', { name: 'Load model', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Retry loading model', exact: true })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole('alert')).toBeVisible();
  expect(local.some(url => /classifier\.worker-/.test(url))).toBe(true);
  expect(local.some(url => /transformers\.web-/.test(url))).toBe(true);
  expect(localFailures).toEqual([]);
  expect(external.length).toBeGreaterThan(0);
  for (const request of external) {
    expect(new URL(request.url).hostname).toBe('huggingface.co');
    expect(new URL(request.url).pathname).toMatch(/^\/Xenova\/nli-deberta-v3-xsmall\/resolve\/[a-f\d]{40}\//);
    expect(['GET', 'HEAD']).toContain(request.method);
    expect(request.body).toBeNull();
    expect(request.url).not.toContain(summary);
  }
});

test('lab opt-in, recoverable load error, validation, ranking and reset', async ({ page }) => {
  await mockWorker(page, true);
  await page.goto('./lab/incident-classifier/');
  await expect(page.getByRole('heading', { level: 1, name: 'Incident classifier' })).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as MockWindow).__labWorkers.length)).toBe(0);
  await expect(page.getByRole('button', { name: 'Classify incident', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Load model', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Synthetic model download failure');
  await page.getByRole('button', { name: 'Retry loading model', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Model ready');
  await page.getByRole('button', { name: 'Classify incident', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Enter an incident summary');
  await page.getByLabel('Incident summary', { exact: true }).fill('The database query is waiting for a row lock.');
  await page.getByRole('button', { name: 'Classify incident', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Analyzing…', exact: true })).toBeDisabled();
  await page.evaluate((classification) => {
    const current = (window as unknown as MockWindow).__labWorkers.at(-1)!;
    current.deliver({ type: 'result', requestId: current.messages.at(-1)!.requestId, result: classification });
  }, result);
  await expect(page.getByRole('heading', { name: 'Database', exact: true })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Analysis complete');
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page.getByLabel('Incident summary', { exact: true })).toHaveValue('');
  await expect(page.getByRole('heading', { name: 'Database', exact: true })).toHaveCount(0);
  await expect(page.getByRole('status')).toContainText('Model remains ready');
});

test('lab cancels active inference and ignores stale worker results', async ({ page }) => {
  await mockWorker(page);
  await page.goto('./lab/incident-classifier/');
  await page.getByRole('button', { name: 'Load model', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Model ready');
  await page.getByRole('button', { name: 'Example 2', exact: false }).click();
  await page.getByRole('button', { name: 'Classify incident', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Analyzing…', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await page.evaluate((classification) => {
    const current = (window as unknown as MockWindow).__labWorkers.at(-1)!;
    current.deliver({ type: 'result', requestId: current.messages.at(-1)!.requestId, result: classification });
  }, result);
  expect(await page.evaluate(() => (window as unknown as MockWindow).__labWorkers.at(-1)!.terminated)).toBe(true);
  await expect(page.getByRole('heading', { name: 'Database', exact: true })).toHaveCount(0);
  await expect(page.getByLabel('Incident summary', { exact: true })).toHaveValue('');
  await expect(page.getByRole('button', { name: 'Load model', exact: true })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Classify incident', exact: true })).toBeDisabled();
});
