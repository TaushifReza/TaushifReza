# Local development and verification

Use Node.js 22.12+ (or a supported newer release) and npm. Install the locked dependencies with `npm ci`; use `npm install` only when intentionally updating dependencies.

```sh
npm ci
npm run dev
```

Before handing off a change, run:

```sh
npm run typecheck
npm run lint
npm run build
node scripts/check-dist.mjs
npm run test:e2e
```

Playwright starts Vite preview on `http://127.0.0.1:4173/` and tests the production build. Install Chromium with `npx playwright install chromium` if no browser is available. The config detects an existing Linux Chromium Playwright cache, or accepts `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` for an explicit executable. `E2E_BASE_URL` overrides the tested URL; `E2E_NO_WEBSERVER=1` uses a server started separately. Screenshots, traces, and the HTML report are generated under `tests/results` and `tests/report` and must remain untracked.

The browser suite checks identity and contact links, keyboard navigation and disclosures, direct case-study fragments on first load and hash changes, widths from 320 to 1920 CSS pixels, expanded diagrams, mobile and desktop axe WCAG AA scans, reduced motion, missing assets, external requests, and JavaScript-disabled guidance. Automated accessibility scans supplement manual keyboard, diagram, contrast, and screen-reader review. An additional 640 CSS pixel viewport assesses the layout width of a 1280px window at 200% zoom. This is a viewport/reflow proxy: actual browser chrome zoom and text enlargement have not been verified. Review real browser 200% zoom separately.

The build audit rejects documents/source maps in output, private input references, contact protocols, exact contact values extracted from local context/PDF files, private-network IPv4 patterns, and local filesystem asset links. Optional `pdftotext` enables PDF contact extraction. It never prints private contact values. These limited checks supplement a manual comparison of public copy with `portfolio-content.md`; they do not prove absence of all private information.

## Portable production output

Vite uses relative asset paths by default (`base: './'`). `dist/` is generated locally and is excluded from version control. No hosting or deployment has been configured or performed.

The local 1200×630 social artwork is available as an editable SVG and a PNG. Metadata references the portable local image. Absolute public Open Graph image URLs and a canonical URL are deferred until the production host is chosen.

To verify an explicit nested hosting path:

```sh
npm run build -- --base=/portfolio/
node scripts/check-dist.mjs
E2E_BASE_URL=http://127.0.0.1:4173/portfolio/ npm run test:e2e
npm run build
```

The final command restores the default portable build after the nested-path check. The same test suite validates both paths. The Playwright server derives Vite preview's `--base` from the URL pathname so preview serves the built assets at the expected prefix. A production host must similarly mount `dist/` at the configured nested prefix.

## Public link review

The public GitHub and LinkedIn destinations are supported by the provided source material. During implementation GitHub returned HTTP 200; LinkedIn returned HTTP 999 (access/bot restriction), so its normal interactive response could not be verified by automated retrieval. No project demo URLs are presented without supporting evidence.

## Verification record

On 26 October 2026, `npm run lint`, `npm run typecheck`, and the production build passed. The root-path Playwright suite passed all 16 tests (41.9 seconds), including four axe scans at mobile/desktop widths with case studies closed/expanded. The coordinator visually reviewed the 1440px and 390px viewport screenshots. The build audit passed for six output files and examined the local PDF for exact contact matching. A build with `--base=/portfolio/` and its distribution audit also passed. The initial nested browser run exposed a preview-server base-path mismatch in the harness; the server command now forwards the tested pathname to Vite preview, and axe scans require rendered page content before analysis. The corrected nested-path suite passed all 16 tests (38.3 seconds), including four axe scans and the accurately named zoom-equivalent viewport proxy. Final lint, TypeScript, and whitespace checks also passed.

Development-server checks returned HTTP 200 for the page and public favicon/social image; requests for editorial documents, agent instructions, three private context files, CV, and direct filesystem forms of private document paths returned HTTP 403. GitHub profile retrieval returned 200; LinkedIn returned 999, so normal LinkedIn availability remains unverified by automated retrieval.

The 640px reflow test is a viewport proxy for a 1280px window at 200% zoom. Actual browser chrome zoom, text enlargement, and manual screen-reader testing have not been performed. Automated axe results and keyboard checks do not establish complete accessibility conformance.
