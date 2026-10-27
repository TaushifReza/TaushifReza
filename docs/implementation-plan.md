# Portfolio implementation plan

## Approved result

A backend-first portfolio with source-backed project stories and a real Posts collection. Preserve the editorial design, transparent hero portrait, verified employment/education, original photo files, README, trophy workflow, and GitHub Pages configuration. Remove the incident-classifier lab completely.

## Implementation stages

1. **Evidence and content:** consolidate supplied context/CV with inspected project source and owner clarifications. Feature inTalent, Survey, Bus Attendance, and Attendance in that order; follow with QR/Go tooling and explicitly course-based Mango. Update skills and approved social links. Correct old PDF recursive-merge and Bus timing claims.
2. **Articles:** add a typed post metadata registry and React content components. Publish the JWT/JWKS microservices post, corrected per-sheet PDF renderer post, and Survey question-snapshot post. Add a Posts index, homepage preview, table of contents, references, and related content.
3. **Static rendering:** use Vite's client build and temporary SSR bundle to generate complete HTML; hydrate the same React tree. Share pure depth-relative path context between server and browser. Generate head metadata, accurate JSON-LD, sitemap, RSS, and robots policy from the registry.
4. **Migration and removal:** generate old Writing URLs as HTML migration documents, keep unknown/lab routes 404, and remove the lab dependency, worker/runtime files, evaluator, tests, and stale public copy. Update the distribution audit and local static server for discovery files.
5. **Verification and handoff:** run lint, TypeScript, builds/audits, root and nested-path browser suites, and representative visual checks. Document source limitations, future post authoring, and deployment behavior. Record actual results after they run.

## Architecture

React and ReactDOM are the only runtime dependencies. Node 24+ is required. Keep strict TypeScript, Vite, scoped CSS modules, and shared design tokens; no backend, CMS, client router, analytics, or state-management library.

`npm run build` runs TypeScript and `scripts/build-site.mjs`. The script produces a client build, creates its temporary SSR output beneath ignored `node_modules/.cache/portfolio-prerender`, writes full documents to `dist/`, generates migration/discovery documents, and removes the intermediate client manifest from publication. Only `dist/` is deployable.

Post metadata and content registrations drive new routes automatically; future posts do not require hand-writing HTML or editing the page renderer. Keep source examples original and dates truthful. Unknown first-publication dates remain absent.

## Acceptance

- Full home/listing/article content is present in response HTML and readable without JavaScript.
- Hydration is warning-free; JWT controls and project fragments work afterward.
- Metadata, structured data, feed, sitemap, and visible article content agree.
- Root, explicit index.html, directory, and configured nested paths load correctly.
- Old Writing URLs reach their matching post; lab/private/unknown paths return 404.
- No model, worker, WebAssembly, employer source, unpublished source documents, or unapproved photos enter output.
- Navigation, contact links, mobile layout, keyboard use, reduced motion, and accessibility scans pass relevant checks.
- Existing GitHub Pages workflow still builds at the production custom-domain root and publishes only audited output.

## Commands

```sh
npm ci
npm run lint
npm run typecheck
npm run build -- --base=/
npm run audit:dist
npm run test:e2e
```

Also build/test `/portfolio/` compatibility, then restore the default portable build. See development documentation for details.

## Boundaries

Do not modify inspected employer repositories or publish their source/configuration. Do not invent results, dates, implementation status, or independent human authorship. Do not commit, push, deploy, add email/contact forms, publish a résumé, or introduce Docker/GHCR infrastructure for this change.
