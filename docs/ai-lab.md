# Browser incident classifier

The `/lab/incident-classifier/` page is a real pretrained-model experiment. It uses zero-shot natural-language inference to rank four categories: Authentication/access control, Database, Infrastructure, and Application logic. It is not a production diagnostic tool. No incident-specific model training or fine-tuning was performed.

## Provenance and pinned configuration

- Transformers.js: `@huggingface/transformers` **4.3.1**, pinned in `package.json` and lockfile.
- Converted ONNX model: [Xenova/nli-deberta-v3-xsmall](https://huggingface.co/Xenova/nli-deberta-v3-xsmall/tree/2a4f614a701367a02d51389039afc998faeda637), revision `2a4f614a701367a02d51389039afc998faeda637`, `q8` weights.
- Upstream: [cross-encoder/nli-deberta-v3-xsmall](https://huggingface.co/cross-encoder/nli-deberta-v3-xsmall), Apache 2.0. Its model card describes pretrained NLI training using SNLI and MultiNLI; those model-card benchmark numbers are not this lab's evaluation.
- Hypothesis template: `This incident concerns {}.`; `multi_label: false`. The four labels are fixed in `src/lab/config.ts`.
- Execution: dedicated Web Worker, `device: 'wasm'`, `numThreads: 1`, `proxy: false`. No server inference API or WebGPU requirement.
- ONNX Runtime Web resolved dependency: `1.31.0-dev.20260914-8d85527a0`. The regular `ort-wasm-simd-threaded.mjs` and `.wasm` exports are imported with Vite `?url` and explicitly mapped to `env.backends.onnx.wasm.wasmPaths = {mjs, wasm}`. Despite the artifact's name, `numThreads: 1` ensures single-thread operation without cross-origin isolation. The regular CPU build is used instead of the larger asyncify build; the inference library's default jsDelivr URLs are overridden.

Transformers.js 4.3.1's pipeline discovery and progress-metadata helpers omit the `revision` option. The worker also fixes `env.remotePathTemplate` to the pinned revision, ensuring those preliminary requests cannot fetch `main`.

The upstream ONNX conversion contains 87,246,587 bytes of q8 weights and an 8,656,551-byte tokenizer, approximately 96 MB combined, plus configuration files. On first opt-in, the browser also fetches the regular WebAssembly runtime from this site (about 14 MB); it is not part of the model download. The emitted asyncify runtime asset is about 26 MB but is not requested by this configuration. These are asset sizes, not promises about compressed transfer size. Parsing, initialization, CPU inference, and memory cost vary by browser and device; this implementation makes no low-latency promise.

## Loading and privacy

The initial page imports no inference library and requests no model files. The explicit **Load model** action creates the worker; only then does its dynamic Transformers.js import run and fetch the pinned model from Hugging Face. The runtime JavaScript and WASM are served by this site. Model hosting can redirect to Hugging Face's file infrastructure. This is an opt-in external download; the host receives IP/request metadata.

Summaries pass from the page to its worker using `postMessage`. They do not appear in URLs or go to any remote inference service, analytics system, localStorage, or a training endpoint. They exist in tab/worker memory until reset, replacement, or page close. Model files can remain in the browser Cache API. Clearing site data/browser storage, private mode, storage pressure, or cache expiry can require a new download. Reset clears the summary and visible results. Reset during loading or inference terminates the worker; model files already cached remain cached. No private source context is included in this lab or dataset.

## Input, scores, and uncertainty

The form accepts 1–2,000 characters and recommends English. In pinned Transformers.js 4.3.1, the zero-shot pipeline's `_call` accepts the hypothesis and multi-label settings but does not forward caller `max_length`. The tokenizer's `model_max_length` property is getter-only. Its constructor aliases `config` and `_tokenizerConfig` to the same object, and that getter reads `_tokenizerConfig.model_max_length`. Therefore the worker sets `classifier.tokenizer.config.model_max_length = 256`, checks the getter, and verifies actual tokenized category-pair lengths before inference. This caps the combined summary/hypothesis token sequence at 256, with long input truncated. It is not a claim that all 2,000 characters are read.

The model compares premise/hypothesis pairs and the pipeline softmaxes entailment logits across the four labels. Displayed scores are relative rankings, not calibrated probabilities. The interface shows **No clear category** when the leading score is below 0.50 or its margin over second place is below 0.15. It still exposes all four scores. The raw leading label is retained for evaluation, independently of this display policy. Categories can overlap in real incidents, and no score establishes root cause.

The worker protocol is typed in `src/lab/types.ts`: load/classify requests and progress/ready/result/error responses all carry a `requestId`. The form disables concurrent inference. Reset invalidates outstanding IDs; inference/loading reset also terminates work. Network, unsupported WebAssembly, worker startup, model initialization, and inference failures receive visible recovery guidance. No simulated response fallback is used.

## Reproducible evaluation

`src/lab/evaluation-dataset.json` contains **40 hand-authored synthetic English examples**, ten per category. It was frozen before the first model run. Dataset SHA-256 is computed from the file's exact bytes by the evaluator and recorded in the report; it is checked again before results are saved. Do not adjust this set to improve observed results without explicitly versioning and documenting the change.

Run:

```sh
npm run build
npm run evaluate:lab
```

After `npm run build`, this serves the production `dist/` output with `scripts/serve-static.mjs` on port **4187**; it does not use Vite's development server or import source files. It launches cached Playwright Chromium (or `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`), visits the actual page, and checks that no external requests precede opt-in. It clicks **Load model**, submits a synthetic example through the real form, verifies rendered results, and saves a review screenshot to the operating system temporary directory as `taushif-ai-lab-real-ui.png`. The test checks all page and worker HTTP requests use GET/HEAD without bodies and all model resolve URLs use the pinned revision. The test then reuses that same native browser worker for all 40 samples and a 2,000-character token-limit check. It never substitutes a Node/Python model or mocked inference. Progress is printed during download and evaluation.

The test-only browser profile defaults to the operating system temporary directory `taushif-incident-classifier-browser`, preserving downloaded model artifacts between runs. Set `LAB_BROWSER_CACHE` to override it and `LAB_EVAL_PORT` to change the port. `LAB_IGNORE_HTTPS_ERRORS=1` is an explicit local test escape hatch for an intercepting proxy's certificate and is disabled by default. Model weights and this profile are not stored in the repository or published assets.

The completed report at `src/lab/evaluation-results.json` was generated on **26 October 2026**. It records **90.0% accuracy** (36/40), **0.9032 macro F1**, and **13/40 uncertain** predictions, using each raw top-ranked label whether uncertain or not. Four examples were misclassified: `auth-06` (Infrastructure), `db-07` (Authentication/access control), `infra-04` (Authentication/access control), and `app-09` (Authentication/access control). The report includes per-category precision/recall/F1, confusion matrix with explicit expected-row/predicted-column axes, every example and raw ranking, uncertainty flags, token counts, revision/config, dataset hash, browser/Node environment, observed external hosts, sanitized request methods and pathnames, and UI/boundary smoke checks. The script throws on failure and does not manufacture metrics. Rebuild the site after regenerating the report so it is included in the output.

Metrics use raw top-label predictions, including those flagged uncertain. Accuracy is correct predictions divided by 40. Macro F1 is the unweighted mean of four per-category F1 scores. Loading/inference durations document this run only, not device-independent performance.

This is a small, clean, single-category synthetic set created for the demo. It is not a held-out production dataset, a model-training benchmark, independent validation, or evidence that the model can reliably classify unfamiliar/ambiguous incidents. No target accuracy was used to select a passing result.

## Checks

Run the project's lint, typecheck, build, and Playwright commands. Normal browser tests mock the worker to cover loading, validation, uncertainty, stale responses/reset, and accessible interaction without recurring external downloads. `npm run evaluate:lab` separately proves real model loading, the page/worker integration, input cap, and synthetic benchmark behavior.
