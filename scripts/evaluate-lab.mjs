/* global window, document */
import { createHash } from 'node:crypto'
import { existsSync, readdirSync } from 'node:fs'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { homedir, tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import { chromium } from '@playwright/test'
import { transpileModule, ModuleKind } from 'typescript'

const root = fileURLToPath(new URL('../', import.meta.url))
const datasetPath = join(root, 'src/lab/evaluation-dataset.json')
const reportPath = join(root, 'src/lab/evaluation-results.json')
const datasetBytes = await readFile(datasetPath)
const datasetSha256 = createHash('sha256').update(datasetBytes).digest('hex')
const dataset = JSON.parse(datasetBytes.toString('utf8'))
const configSource = await readFile(join(root, 'src/lab/config.ts'), 'utf8')
const configModule = transpileModule(configSource, { compilerOptions: { module: ModuleKind.ESNext } }).outputText
const { MODEL, CATEGORIES } = await import(`data:text/javascript;base64,${Buffer.from(configModule).toString('base64')}`)
const labels = [...CATEGORIES]
if (dataset.length !== 40 || labels.some(label => dataset.filter(item => item.label === label).length !== 10)) throw new Error('Expected the frozen balanced 40-example dataset.')
console.log(`Frozen dataset SHA-256: ${datasetSha256}`)
console.log('Running the actual browser worker with the pretrained model. First download can take several minutes.')

const cache = join(homedir(), '.cache/ms-playwright')
const cachedChromium = existsSync(cache) ? readdirSync(cache).filter(name => name.startsWith('chromium-')).sort((a, b) => b.localeCompare(a, undefined, { numeric: true })).map(name => join(cache, name, 'chrome-linux64/chrome')).find(path => existsSync(path)) : undefined
const port = process.env.LAB_EVAL_PORT ?? '4187'
const origin = `http://127.0.0.1:${port}`
if (!existsSync(join(root, 'dist/lab/incident-classifier/index.html'))) throw new Error('Run npm run build before evaluating the production browser worker.')
const vite = spawn(process.execPath, [join(root, 'scripts/serve-static.mjs')], { cwd: root, env: { ...process.env, PORT: port, STATIC_BASE_PATH: '/' }, stdio: ['ignore', 'pipe', 'pipe'] })
let serverOutput = ''
vite.stdout.on('data', chunk => { serverOutput += chunk.toString() })
vite.stderr.on('data', chunk => { serverOutput += chunk.toString() })
const profileDirectory = process.env.LAB_BROWSER_CACHE ?? join(tmpdir(), 'taushif-incident-classifier-browser')
await mkdir(profileDirectory, { recursive: true })
let context
let diagnosticPage
try {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (vite.exitCode !== null) throw new Error(`Static server exited: ${serverOutput}`)
    try { const response = await fetch(origin); if (response.ok) break } catch { /* wait for server */ }
    if (attempt === 99) throw new Error(`Static server failed to start: ${serverOutput}`)
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  console.log('Local server ready; launching Chromium.')
  context = await chromium.launchPersistentContext(profileDirectory, {
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ?? cachedChromium,
    headless: true,
    // Model files are public; enable only when an explicit local proxy requires its test certificate.
    ignoreHTTPSErrors: process.env.LAB_IGNORE_HTTPS_ERRORS === '1',
  })
  console.log('Chromium ready; opening the lab page.')
  const page = await context.newPage()
  diagnosticPage = page
  page.setDefaultTimeout(1_200_000)
  const externalHosts = new Set()
  const networkRequests = []
  context.on('request', request => {
    const url = new URL(request.url())
    if (!url.protocol.startsWith('http')) return
    if (url.origin !== origin) externalHosts.add(url.hostname)
    networkRequests.push({ method: request.method(), url: `${url.origin}${url.pathname}`, hasBody: request.postData() !== null })
  })
  page.on('pageerror', error => console.error(`Browser error: ${error.message}`))
  page.on('requestfailed', request => console.error(`Request failed: ${new URL(request.url()).hostname}${new URL(request.url()).pathname} ${request.failure()?.errorText}`))
  const seenProgress = new Set()
  await page.exposeFunction('reportLabProgress', message => {
    const key = message.replace(/\(\d+%\)/, '')
    if (!seenProgress.has(key) || /100%/.test(message)) { seenProgress.add(key); console.log(message) }
  })
  await page.addInitScript(() => {
    const NativeWorker = window.Worker
    window.Worker = class extends NativeWorker {
      constructor(...args) {
        super(...args)
        window.__labEvaluationWorker = this
        this.addEventListener('message', ({ data }) => {
          if (data.type === 'progress') void window.reportLabProgress(data.message)
          if (data.type === 'result') window.__labLastResult = data.result
          if (data.type === 'error') void window.reportLabProgress(`Worker error: ${data.message}`)
        })
      }
    }
  })
  await page.goto(`${origin}/lab/incident-classifier/`, { waitUntil: 'domcontentloaded', timeout: 60_000 })
  await page.getByRole('button', { name: 'Load model', exact: true }).waitFor({ timeout: 60_000 })
  console.log('Lab page rendered; starting opt-in model load.')
  if (externalHosts.size) throw new Error(`Unexpected external requests before model opt-in: ${[...externalHosts].join(', ')}`)
  const loadStarted = Date.now()
  await page.getByRole('button', { name: 'Load model', exact: true }).click()
  await Promise.race([
    page.getByRole('button', { name: 'Model loaded', exact: true }).waitFor({ timeout: 1_200_000 }),
    page.getByRole('alert').waitFor({ timeout: 1_200_000 }).then(async () => { throw new Error(await page.getByRole('alert').innerText()) }),
  ])
  console.log('Model ready; submitting a real UI sample.')
  const loadDurationMs = Date.now() - loadStarted
  await page.getByLabel('Incident summary', { exact: true }).fill(dataset[0].text)
  await page.getByRole('button', { name: 'Classify incident', exact: true }).click()
  await Promise.race([
    page.locator('#ranking-heading').waitFor({ timeout: 1_200_000 }),
    page.getByRole('alert').waitFor({ timeout: 1_200_000 }).then(async () => { throw new Error(await page.getByRole('alert').innerText()) }),
  ])
  const uiSmoke = await page.evaluate(() => ({ heading: document.querySelector('#ranking-heading')?.textContent, result: window.__labLastResult }))
  if (!uiSmoke.result?.rankings?.length) throw new Error('The actual page did not render a model result.')
  const screenshotPath = join(tmpdir(), 'taushif-ai-lab-real-ui.png')
  await page.screenshot({ path: screenshotPath, fullPage: true })
  console.log(`Real page inference passed; review screenshot: ${screenshotPath}`)
  const measured = await page.evaluate(async ({ dataset, MODEL, CATEGORIES }) => {
    const worker = window.__labEvaluationWorker
    let requestId = 10000
    function send(request) {
      return new Promise((resolve, reject) => {
        const id = ++requestId
        const timeout = setTimeout(() => { worker.removeEventListener('message', listener); reject(new Error('Worker timed out after 20 minutes.')) }, 1_200_000)
        function listener({ data }) {
          if (data.requestId !== id) return
          if (data.type === 'progress') { void window.reportLabProgress(data.message); return }
          clearTimeout(timeout)
          worker.removeEventListener('message', listener)
          if (data.type === 'error') reject(new Error(data.message))
          else resolve(data)
        }
        worker.addEventListener('message', listener)
        worker.postMessage({ ...request, requestId: id })
      })
    }
    try {
      const predictions = []
      for (const sample of dataset) {
        const { result } = await send({ type: 'classify', text: sample.text })
        predictions.push({ ...sample, ...result, correct: result.predictedLabel === sample.label })
        await window.reportLabProgress(`Evaluated ${predictions.length}/${dataset.length}: ${sample.id} → ${result.predictedLabel}`)
      }
      const { result: longInput } = await send({ type: 'classify', text: 'The service failed after a deployment. '.repeat(54).slice(0, MODEL.maxCharacters) })
      if (longInput.maxInputTokens > MODEL.maxTokens || longInput.maxInputTokens < 1) throw new Error('Input token limit validation failed.')
      return { predictions, config: { ...MODEL, categories: [...CATEGORIES], device: 'wasm', numThreads: 1, multiLabel: false, runtimeAssets: 'same-origin regular WASM' }, boundaryCheck: { characters: MODEL.maxCharacters, maxInputTokens: longInput.maxInputTokens, passed: true }, userAgent: navigator.userAgent }
    } finally { worker.terminate() }
  }, { dataset, MODEL, CATEGORIES })
  if (networkRequests.some(request => !['GET', 'HEAD'].includes(request.method) || request.hasBody)) throw new Error('Unexpected network write or request body during local inference.')
  if (networkRequests.some(request => request.url.includes('/resolve/') && !request.url.includes(`/resolve/${MODEL.revision}/`))) throw new Error('An unpinned model revision was requested.')
  const currentHash = createHash('sha256').update(await readFile(datasetPath)).digest('hex')
  if (currentHash !== datasetSha256) throw new Error('Dataset changed during evaluation. Refusing to save metrics.')
  const confusionMatrix = labels.map(expected => labels.map(predicted => measured.predictions.filter(item => item.label === expected && item.predictedLabel === predicted).length))
  const accuracy = measured.predictions.filter(item => item.correct).length / dataset.length
  const perCategory = labels.map((label, index) => {
    const truePositive = confusionMatrix[index][index]
    const falsePositive = confusionMatrix.reduce((sum, row, rowIndex) => sum + (rowIndex === index ? 0 : row[index]), 0)
    const falseNegative = confusionMatrix[index].reduce((sum, count, column) => sum + (column === index ? 0 : count), 0)
    const precision = truePositive / (truePositive + falsePositive) || 0
    const recall = truePositive / (truePositive + falseNegative) || 0
    return { label, precision, recall, f1: 2 * precision * recall / (precision + recall) || 0, support: 10 }
  })
  const report = {
    status: 'complete', completedAt: new Date().toISOString(), samples: dataset.length, datasetSha256,
    datasetDescription: '40 frozen hand-authored synthetic English summaries, 10 per category; no production incidents. No model tuning against this set.',
    accuracy, macroF1: perCategory.reduce((sum, item) => sum + item.f1, 0) / labels.length,
    uncertainCount: measured.predictions.filter(item => item.uncertain).length,
    labels, confusionMatrixAxes: { rows: 'expected', columns: 'predicted' }, confusionMatrix, perCategory,
    metricPolicy: 'Raw top-ranked label, including uncertain predictions; uncertainty thresholds fixed before evaluation.',
    config: measured.config, loadDurationMs, uiSmoke: { sampleId: dataset[0].id, heading: uiSmoke.heading, predictedLabel: uiSmoke.result.predictedLabel, maxInputTokens: uiSmoke.result.maxInputTokens, passed: true }, boundaryCheck: measured.boundaryCheck,
    environment: { browser: context.browser()?.version() ?? 'persistent Chromium', userAgent: measured.userAgent, node: process.version, platform: process.platform, architecture: process.arch, externalHosts: [...externalHosts].sort(), browserCache: 'persistent local temporary directory; warm or cold cache not guaranteed' },
    networkPolicyCheck: { passed: true, onlyReadRequestsWithoutBodies: true, pinnedModelRevision: true, requests: networkRequests.map(request => { const url = new URL(request.url); return { method: request.method, host: url.origin === origin ? 'site' : url.hostname, pathname: url.pathname, hasBody: request.hasBody } }) },
    predictions: measured.predictions,
  }
  await mkdir(dirname(reportPath), { recursive: true })
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`)
  console.log(`Saved ${reportPath}\nAccuracy: ${(accuracy * 100).toFixed(1)}%; macro F1: ${report.macroF1.toFixed(3)}; uncertain: ${report.uncertainCount}/40`)
} catch (error) {
  if (diagnosticPage) {
    await diagnosticPage.screenshot({ path: join(tmpdir(), 'taushif-ai-lab-error.png'), fullPage: true }).catch(() => {})
    console.error((await diagnosticPage.locator('body').innerText().catch(() => '')).slice(0, 2000))
  }
  throw error
} finally {
  await context?.close()
  vite.kill('SIGTERM')
}
