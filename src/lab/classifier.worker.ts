import wasmModuleUrl from 'onnxruntime-web/ort-wasm-simd-threaded.mjs?url'
import wasmBinaryUrl from 'onnxruntime-web/ort-wasm-simd-threaded.wasm?url'
import { CATEGORIES, MODEL, type Category } from './config'
import type { Classification, Ranking, WorkerRequest, WorkerResponse } from './types'
import type { ZeroShotClassificationPipeline } from '@huggingface/transformers'

let classifier: ZeroShotClassificationPipeline | null = null
let loading = false
let classifying = false

function respond(message: WorkerResponse) { self.postMessage(message) }

async function load(requestId: number) {
  if (classifier) { respond({ type: 'ready', requestId }); return }
  if (loading) { respond({ type: 'error', requestId, message: 'The model is already loading.' }); return }
  loading = true
  try {
    if (typeof WebAssembly === 'undefined') throw new Error('WebAssembly is unavailable in this browser. Use a current browser with WebAssembly enabled.')
    // This is the first inference-library import. The page creates this worker only after opt-in.
    const { pipeline, env } = await import('@huggingface/transformers')
    // v4.3.1's pipeline discovery/metadata helpers omit the revision option.
    // Pin the host template too so those preliminary requests cannot use main.
    env.remotePathTemplate = `{model}/resolve/${MODEL.revision}/`
    env.allowLocalModels = false
    env.useBrowserCache = true
    const wasm = env.backends.onnx.wasm
    if (!wasm) throw new Error('The WebAssembly runtime is unavailable.')
    wasm.numThreads = 1
    wasm.proxy = false
    // Override the library's jsDelivr default with explicitly bundled, same-origin assets.
    // The regular WASM build supports CPU inference without asyncify's extra binary size.
    wasm.wasmPaths = { mjs: wasmModuleUrl, wasm: wasmBinaryUrl }
    classifier = await pipeline('zero-shot-classification', MODEL.id, {
      revision: MODEL.revision,
      dtype: MODEL.dtype,
      device: 'wasm',
      progress_callback: info => {
        if (info.status === 'progress') {
          respond({ type: 'progress', requestId, message: `Downloading ${info.file} (${Math.round(info.progress)}%).`, progress: info.progress })
        } else if (info.status === 'initiate') {
          respond({ type: 'progress', requestId, message: `Preparing ${info.file}.` })
        } else if (info.status === 'done') {
          respond({ type: 'progress', requestId, message: `Downloaded ${info.file}. Preparing the model can take a moment.` })
        }
      },
    })
    // v4's zero-shot pipeline ignores caller max_length. This config is the same object
    // used by the tokenizer's getter-only model_max_length (verified in pinned 4.3.1).
    classifier.tokenizer.config.model_max_length = MODEL.maxTokens
    if (classifier.tokenizer.model_max_length !== MODEL.maxTokens) throw new Error('Could not enforce the model input token limit.')
    respond({ type: 'ready', requestId })
  } catch (error) {
    classifier = null
    const detail = error instanceof Error ? error.message : String(error)
    respond({ type: 'error', requestId, message: `Unable to load the model. Check your connection, available memory, and WebAssembly support, then retry. ${detail}` })
  } finally { loading = false }
}

async function classify(requestId: number, text: string) {
  if (!classifier) { respond({ type: 'error', requestId, message: 'Load the model before classifying an incident.' }); return }
  if (classifying) { respond({ type: 'error', requestId, message: 'An analysis is already running. Wait or reset before trying again.' }); return }
  if (!text.trim() || text.length > MODEL.maxCharacters) {
    respond({ type: 'error', requestId, message: 'Enter a summary between 1 and 2,000 characters.' }); return
  }
  classifying = true
  const started = performance.now()
  try {
    let maxInputTokens = 0
    for (const label of CATEGORIES) {
      const tokens = classifier.tokenizer(text, { text_pair: MODEL.hypothesis.replace('{}', label), padding: true, truncation: true })
      const tokenCount = tokens.input_ids.dims.at(-1) ?? 0
      if (tokenCount > MODEL.maxTokens) throw new Error('The tokenizer exceeded the configured input limit.')
      maxInputTokens = Math.max(maxInputTokens, tokenCount)
    }
    const output = await classifier(text, [...CATEGORIES], { hypothesis_template: MODEL.hypothesis, multi_label: false })
    const ranked = Array.isArray(output) ? output[0] : output
    const rankings: Ranking[] = ranked.labels.map((label: string, index: number) => ({ label: label as Category, score: ranked.scores[index] }))
    if (rankings.length !== CATEGORIES.length || rankings.some(item => !CATEGORIES.includes(item.label) || !Number.isFinite(item.score))) throw new Error('The model returned an invalid ranking.')
    const margin = rankings[0].score - rankings[1].score
    const result: Classification = {
      rankings,
      predictedLabel: rankings[0].label,
      uncertain: rankings[0].score < MODEL.minimumScore || margin < MODEL.minimumMargin,
      margin,
      maxInputTokens,
      durationMs: performance.now() - started,
    }
    respond({ type: 'result', requestId, result })
  } catch (error) {
    respond({ type: 'error', requestId, message: `Analysis failed. ${error instanceof Error ? error.message : String(error)}` })
  } finally { classifying = false }
}

self.onmessage = ({ data }: MessageEvent<WorkerRequest>) => {
  if (data.type === 'load') void load(data.requestId)
  else if (data.type === 'classify') void classify(data.requestId, data.text)
}
