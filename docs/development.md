# Local development and verification

Use Node.js 22.12+ (or a supported newer release) and npm. Install locked dependencies with `npm ci`; use `npm install` only when intentionally updating dependencies.

```sh
npm ci
npm run dev
```

Before handing off a change, run:

```sh
npm run typecheck
npm run lint
npm run build
npm run audit:dist
npm run test:e2e
```

The production build creates four separate HTML entries: `/`, `/writing/pdf-memory/`, `/writing/jwt-jwks/`, and `/lab/incident-classifier/`. Each entry declares its page and relative site root; React loads only that page's content. Native links navigate between the static documents without a client router. `siteHref` resolves internal links against the declared root, including pages reached through their explicit `index.html` URL.

## Static hosting and portable output

Vite uses relative asset paths by default (`base: './'`). Generated `dist/` stays untracked. The Pages workflow builds with `--base=/` for `https://taushifreza.com.np/`; Cloudflare provides DNS. See [deployment setup](deployment.md) for authenticated GitHub/Cloudflare configuration, publication, verification, and rollback. Adding the workflow does not itself deploy the new application. Serve the contents of `dist/`; never serve the repository root. A host must serve directory `index.html` files and return real 404 responses for unknown paths. SPA fallback rewrites are unnecessary and would conceal missing pages.

Playwright uses `scripts/serve-static.mjs`, a local-only server that serves `dist/` exclusively, redirects directory URLs to a trailing slash, and returns 404 for absent files. It does not use Vite preview or a development fallback. To inspect the build manually:

```sh
npm run build
npm run serve:static
```

The default URL is `http://127.0.0.1:4173/`. `PORT` overrides the local port, and `STATIC_BASE_PATH=/portfolio/` mounts the distribution beneath a prefix. `E2E_BASE_URL` configures the tested URL and the Playwright server's matching prefix and port. `E2E_NO_WEBSERVER=1` uses a separately started server. Playwright deliberately refuses to reuse an existing server, avoiding accidental tests against source-serving or fallback servers.

To verify an explicit nested hosting path:

```sh
npm run build -- --base=/portfolio/
npm run audit:dist
E2E_BASE_URL=http://127.0.0.1:4173/portfolio/ npm run test:e2e
npm run build
```

The final command restores the portable build. A production host must mount `dist/` at the configured prefix. Favicons use depth-relative paths; canonical and social metadata identify `https://taushifreza.com.np/`, with directory URLs for the articles and lab. Tests verify those production URLs without requesting the live domain and check the social image through the local test server.

## Browser and content checks

Install Chromium with `npx playwright install chromium` if needed. The config detects an existing Linux Playwright Chromium cache, or accepts `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Screenshots, traces, and HTML reports live under ignored `tests/results` and `tests/report` directories.

The browser suite preserves the original homepage checks and covers direct directory and `index.html` loads, refresh, static redirects and real 404s, per-page metadata/assets, return fragments, allowed public links, JavaScript-disabled explanations, and absence of external requests before model opt-in. All pages are checked for overflow at 320, 390, 768, 1440, and 1920 CSS pixels; the homepage also covers 1024 pixels. Homepage checks verify the single eager/high-priority 419 × 595 hero portrait, its full aspect ratio and visibility, unblocked action links, a compact 120px image beside its caption on mobile, and a portrait no wider than 320px on desktop. The About section has no second portrait. Mobile/desktop axe scans include the expanded JWT stepper and a populated classifier result. Stepper tests exercise all four scenarios, previous/next, terminal rejection, and reset. Mocked worker tests exercise opt-in creation, download failure/retry, empty-input validation, ranking, reset, and stale response rejection; these interface tests do not establish model accuracy. A server-rendered fixture validates both empty optional evidence and populated image/video/link markup without publishing invented artifacts.

A 640px homepage reflow check approximates the layout viewport of a 1280px window at 200% zoom. It does not verify browser chrome zoom or text enlargement. Automated axe and keyboard checks supplement manual accessibility review and do not establish complete accessibility conformance.

## AI lab and evaluation

The lab pins `@huggingface/transformers` to 4.3.1. Inference runs in a dedicated browser worker using a local WebAssembly runtime. Neither the model nor the inference library is requested until the visitor chooses Load model. Model files download from the pinned Hugging Face revision; incident text is never sent to a remote inference endpoint. Building the site bundles runtime assets and does not download model weights.

```sh
npm run build
npm run evaluate:lab
```

The separate opt-in evaluator serves production `dist/` with `scripts/serve-static.mjs` on port 4187 and runs the real pinned browser worker over the frozen synthetic dataset; it does not use Vite's development server or source imports. A first model load downloads about 96 MB of model/tokenizer files and fetches the regular ~14 MB WebAssembly runtime from this site. Default browser tests never download the model. See [AI lab documentation](ai-lab.md) for the completed metrics, configuration, dataset limitations, report format, and evaluation procedure.

## Publication privacy checks

The build copies only the reviewed favicon/social assets, the owner-approved `public/bg_remove.png` hero portrait, and approved media, captions, text, or JSON beneath `public/artifacts/`; it skips symbolic links. The transparent 419 × 595 PNG is published as the original bytes, preserving its pixels and alpha. Its reviewed source contains only PNG image/header/end chunks and needs no metadata transformation. The development server serves the same approved file normally. The original `pp.jpg`, unused `half_body.jpg`, and all download sidecars remain untouched on disk, are excluded from the build, and cannot be served by the development server. Add real project evidence only after its content and publication rights have been reviewed. No current project evidence media is populated. PDFs, download sidecars, and raw editorial/private documents remain forbidden.

The distribution audit requires all four HTML outputs and the explicit public-asset manifest, verifies that published public assets exactly match their source bytes, and rejects files outside the page/public/generated-asset manifest. It also rejects original JPEG portraits, download sidecars, private/source documents, source maps, unexpected file types, raw private input references, contact protocols, exact contact values extracted from local context/PDF files, private-network IPv4 patterns, and local filesystem asset links. It scans JavaScript including `.mjs`, CSS, HTML, JSON, SVG, captions, and text. Optional `pdftotext` enables exact PDF contact matching. It never prints extracted private values. CI cannot perform exact contact comparisons against ignored private source documents absent from its checkout; the public-asset allowlist and general pattern checks still run.

Bundled ONNX WebAssembly binaries receive approved filename, size, and format checks. Compiled binary contents and image/video contents are not privacy-scanned. These limited checks supplement manual review; they do not prove that all private information is absent. The development server also denies documents, private context inputs, credentials, and direct filesystem access to those paths.

## Public link review

GitHub/LinkedIn profile and repository links use the source-supported public destinations. The articles link to official RFCs; the lab links to its pinned Hugging Face model revision and upstream model. Automated URL allowlists check those intended destinations but do not guarantee their future availability. LinkedIn may return an automated-access restriction rather than its normal interactive page.

## Verification record

On 26 October 2026, the root-path Playwright run passed all 53 tests (55.9 seconds), and the `/portfolio/` run passed all 53 (50.2 seconds). The TypeScript check, lint, production builds, 27-output distribution audits, and whitespace diff check passed. The real browser-worker evaluation completed successfully on the frozen 40-example synthetic dataset: 36 correct (90.0% accuracy), macro F1 0.9032, and 13 uncertain results; the dataset hash was unchanged. Results describe this synthetic set and do not establish performance on real incidents. The model opt-in downloads about 96 MB of model/tokenizer files and uses the site's approximately 14 MB WebAssembly runtime.

In that earlier verification, root and `/portfolio/` development-server privacy checks passed: the then-published portrait was served as a sanitized 413 × 531 JPEG, while aliases for the unused `half_body.jpg` and private zone files returned 403. Desktop and mobile pages, both articles, the portrait, and the classifier interface received visual review. The current hero uses the original transparent PNG described above; the JPEG sanitizer has been removed. Actual browser chrome zoom, text enlargement, and manual screen-reader review remain unverified. Automated axe and keyboard checks do not establish complete accessibility conformance.

## Deployment verification

The GitHub Pages workflow and production metadata are prepared for `https://taushifreza.com.np/`. Read-only checks on 26 October 2026 found the four GitHub Pages apex A records and an HTTPS 200 response from GitHub; `www` did not resolve. These checks establish an existing endpoint, not publication of the new React build. Authenticated Pages settings, domain verification, the `www` record, workflow publication, and live smoke checks must be confirmed during rollout. See [deployment instructions](deployment.md).

On 26 October 2026, deployment preparation passed lint, TypeScript checking, the root production build (`--base=/`), the 27-output distribution audit, and whitespace checking. Playwright passed all 54 tests at the root and all 54 under `/portfolio/` (approximately 1.3 minutes per run); the nested build also passed its distribution audit. The default portable build was restored afterward and passed the 27-output audit. The Pages workflow YAML parsed successfully and independent code review found no blockers. These are local checks: no GitHub Actions run or new deployment was performed, and authenticated GitHub/Cloudflare settings remain to be confirmed. The existing real-model evaluation was not rerun for this deployment change.
