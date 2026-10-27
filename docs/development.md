# Local development and verification

Use **Node.js 24+** and npm. Node 24 is used in CI and supports the typed metadata import used by the distribution audit. React and ReactDOM are the only runtime dependencies; the former model library and its transitive runtime packages have been removed.

```sh
npm ci
npm run dev
```

The development server renders the registered routes through Vite's SSR loader, then hydrates their React tree. It also serves generated discovery files and legacy migration documents. Removed lab paths return 404. No employer source or private context is needed to run the site.

## Build and static hosting

```sh
npm run lint
npm run typecheck
npm run build
npm run audit:dist
npm run test:e2e
```

The build runs a Vite client build followed by a temporary SSR build under ignored `node_modules/.cache/portfolio-prerender`. It uses React rendering to write full response HTML, then the browser hydrates the identical component tree. The generated client manifest is used to locate JavaScript/CSS and removed before publication. Server build files stay outside `dist/`.

Current public pages:

- `/`
- `/posts/`
- `/posts/jwt-jwks/`
- `/posts/pdf-memory/`
- `/posts/survey-question-snapshots/`

The registry also generates `/sitemap.xml`, `/feed.xml`, and `/robots.txt`, with truthful metadata and no invented dates. `/writing/jwt-jwks/` and `/writing/pdf-memory/` are small HTML migration pages with a canonical destination, visible link, and meta refresh. They are not HTTP 301 redirects. The former lab URL is absent and returns 404.

Vite defaults to portable relative assets (`base: './'`). The Pages workflow builds with `--base=/` for `https://taushifreza.com.np/`. Native links use the same depth-relative `SitePathProvider`/`useSiteHref` contract during server rendering and hydration, including explicit `index.html` loads. There is no client router or SPA fallback.

Serve **only `dist/`**, never the repository root. The local production harness serves directory index files, redirects missing directory slashes, supplies XML MIME types, and returns real 404s:

```sh
npm run build
npm run serve:static
```

Default URL: `http://127.0.0.1:4173/`. `PORT` overrides the port; `STATIC_BASE_PATH=/portfolio/` mounts output at a prefix. `E2E_BASE_URL` configures browser tests and the matching harness prefix/port. `E2E_NO_WEBSERVER=1` uses a separately started server. Tests intentionally do not reuse another server.

```sh
npm run build -- --base=/portfolio/
npm run audit:dist
E2E_BASE_URL=http://127.0.0.1:4173/portfolio/ npm run test:e2e
npm run build
npm run audit:dist
```

The final commands restore and audit the portable build. Canonical/social/feed URLs still identify the production domain; local tests assert those values while checking assets through the local server, without depending on the live site.

## Adding a post

1. Create an article component under `src/posts/`, with original prose/examples, semantic headings, stable section IDs, and public references. Use `useSiteHref()` for site links.
2. Register its `Body` and section navigation in `src/posts/index.ts`.
3. Add metadata to `src/data/posts.ts`: unique lowercase hyphenated slug, title, description, topic tags, and positive integer reading-minute estimate. Add publication/update dates only when known and truthful; use valid ISO date values.
4. Run the commands above. Listing, preview, route HTML, head metadata, structured data, sitemap, and RSS derive from the registry automatically. No new hand-written HTML entry is needed.

All articles must have a content registration matching their metadata slug. Do not publish employer excerpts, internal addresses, credentials, customer records, or local source paths. Original simplified examples should be identified as explanatory rather than production code.

## Browser and accessibility checks

Install Chromium when needed with `npx playwright install chromium`. CI installs its system dependencies with `npx playwright install --with-deps chromium`. The config detects a Linux Playwright cache or accepts `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Screenshots/traces/reports are ignored under `tests/results` and `tests/report`.

The suite checks production documents rather than development fallbacks: complete response HTML and JavaScript-disabled reading, hydration/console errors, direct directory/index loads, page metadata, local assets, legacy migration, discovery files, private/unknown/lab 404s, keyboard navigation, case-study fragments, responsive layout, reduced motion, and JWT synthetic scenarios. Article text, references, and navigation must be available without JavaScript; the JWT interaction supplements that content.

The single eager/high-priority 419×595 portrait retains its natural ratio, with a compact mobile caption row and no duplicate About photo. Layout checks and axe scans supplement visual/keyboard review. A 640px layout viewport is a reflow proxy, not a verified browser-chrome 200% zoom test. Actual browser zoom, text enlargement, and manual screen-reader conformance remain separate checks.

## Publication privacy

The build copies only reviewed favicon/social assets, original approved `public/bg_remove.png`, and reviewed evidence files beneath `public/artifacts/`. It skips symlinks. Original unused photos, sidecars, raw context/CV, private documents, and source maps remain excluded. The development server preserves matching public-file restrictions and private-path denial.

The distribution audit requires expected pages/discovery documents, checks approved asset bytes, enforces its output manifest, rejects removed model/runtime assets, scans supported text for private input references/contact protocols/private-network patterns/local paths, and optionally compares exact contact values extracted from local context/PDF inputs. It never prints those private values. CI cannot compare absent ignored private inputs. Image/video binary contents are not privacy-scanned; automated checks supplement manual review rather than prove absence of every private detail.

No model download, inference library, worker, or WebAssembly runtime is part of this portfolio. The removed lab evaluator and its tests are no longer available.

## Verification record

On 27 October 2026, the Posts migration passed lint, TypeScript, the root production build, the 16-output distribution audit, and whitespace checks. The production Playwright suite passed all 62 tests at the root (58.8 seconds) and all 62 under `/portfolio/` (45.4 seconds). Desktop and mobile home, Posts, JWT, and Survey views received visual review; the table-of-contents wrapping correction was verified.

Development smoke checks passed at both root and `/portfolio/`: all five routes loaded in directory and explicit `index.html` forms, all five remained readable without JavaScript, JWT interaction worked, legacy migration documents pointed to their posts, and the approved PNG retained its exact bytes. Private-path and synthetic unapproved-public-file probes returned 403 through the tested aliases. A development-only doubled asset prefix was found and corrected; the prefixed development pages then loaded and hydrated successfully. The lasting development regression test passed separately (1/1, 2.1 seconds), covering real JavaScript, SVG, and RSS responses at root and prefix paths. The default portable build was restored; lint, TypeScript, build, the 16-output audit, and whitespace checking passed again. The combined suite passed all 63 tests against the portable build (39.7 seconds). A subsequent presentation-only change made the inTalent live link visible on its project card. All 17 homepage tests passed afterward (19.5 seconds), including an assertion that the link is visible while its case study is closed. Final lint, TypeScript, default portable build, 16-output distribution audit, and whitespace checks passed again.

No commit, push, deployment, or employer-repository modification was performed during this migration. Actual browser-chrome zoom, text enlargement, and manual screen-reader behavior remain unverified; automated accessibility checks do not establish complete conformance. Crawlability and structured data do not guarantee indexing, search ranking, or AI citation.

The previous 54-test runs from 26 October applied to the earlier portfolio and are superseded for this migration by the results above.

Read-only domain checks on 26 October 2026 found the four GitHub Pages apex A records and an HTTPS 200 response, while `www` did not resolve. That established an existing endpoint, not deployment of this new build. See [deployment instructions](deployment.md); no authenticated setting or publication is implied by local checks.
