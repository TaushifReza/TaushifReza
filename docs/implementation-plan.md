# Portfolio implementation plan

## Scope

Extend the responsive React portfolio with dedicated engineering articles, a compact verified repository archive, optional real project artifacts, and a newly built pretrained-model lab. Preserve the homepage identity, existing project IDs/disclosures, README, trophy asset, and repository metadata. Do not deploy.

## Technical choices

- Vite + React + strict TypeScript.
- CSS custom-property design tokens and scoped CSS modules.
- Content kept in structured TypeScript data, separate from presentational components.
- Native anchor navigation and native expandable case studies; no router, backend, analytics, or animation dependency.
- Multiple static HTML entry points with page-specific metadata and JavaScript-disabled explanations; lazy-load dedicated page modules. Shared path resolution supports root and configured nested hosting. No router or external embeds.
- Inline SVG diagrams with accessible labels and equivalent nearby explanatory text.
- Native JWT scenario/step controls operate on fixed synthetic fixtures; execute no cryptography. Mobile diagram alternatives preserve readable labels.
- New browser lab uses an explicitly loaded, pinned pretrained model in a worker; keep its runtime out of the initial homepage path. Record model license/provenance and honest evaluation in `ai-lab.md`.
- Produce the application source and build configuration only. Do not deploy or commit a generated portable `dist` directory.

## Implementation sequence

1. Review supplied evidence and public repositories; keep banking-app scope limited to verified account workflows.
2. Add static page entries, portable links, metadata, and lazy page selection.
3. Build home writing/archive additions, shared layout, optional artifact rendering, and the factual PDF article.
4. Build synthetic JWT controls and conceptual diagrams; keep claims separate from production verification.
5. Integrate the pretrained-model lab with explicit download, local worker inference, loading/retry/error/cancel states, and clear limitations.
6. Check privacy, keyboard/reflow, direct static loads, nested hosting, external requests, factual boundaries, and the initial bundle.
7. Run typecheck, lint, production build, distribution audit, and browser tests; review representative screenshots.

## Scripts

Configure these npm scripts:

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "typecheck": "tsc -b --pretty",
  "lint": "eslint .",
  "test:e2e": "playwright test"
}
```

Development and build commands: `npm run dev`, `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run test:e2e`. Keep browser-test dependencies and config explicit in the package manifest. If scripts cannot yet run due to missing dependencies, report that clearly.

## Acceptance and QA

- Desktop, tablet, and narrow-mobile layouts have no horizontal overflow; check at 320 CSS pixels and common larger widths.
- Keyboard-only navigation reaches every link/disclosure and has clear focus; heading structure and landmarks are semantic.
- Check browser zoom/reflow, reduced-motion preference, direct section links, and direct case-study fragments that should auto-open.
- Check diagrams at narrow widths and high zoom, including their text equivalents.
- Verify local assets load without console errors, initial pages make no remote requests, and only explicit lab loading accesses approved model sources. No analytics.
- Test direct entry pages, nested hosting, back navigation, JWT scenarios/reset, and lab lifecycle states. Verify source-backed public links and no-JavaScript guidance.
- Run lint, typecheck, production build, Playwright, and axe accessibility checks.
- Confirm README, trophy SVG, and `.github` files remain intact.

## Out of scope

Deployment, email/contact forms, résumé downloads, analytics, backend services, router-based navigation, and generated distribution artifacts.

