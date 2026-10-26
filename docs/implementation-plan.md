# Portfolio implementation plan

## Scope

Rebuild the current portfolio as a responsive, accessible single-page React application. The current repository baseline is a root `index.html`, README, GitHub profile trophy asset, and `.github` metadata. Preserve the README, trophy asset, and repository metadata. The prior portfolio can be consulted through version history; do not remove unrelated assets.

## Technical choices

- Vite + React + strict TypeScript.
- CSS custom-property design tokens and scoped CSS modules.
- Content kept in structured TypeScript data, separate from presentational components.
- Native anchor navigation and native expandable case studies; no router, backend, analytics, or animation dependency.
- Client-rendered React with a JavaScript-disabled explanation; no prerendering requirement. Anchors/disclosures remain native browser interactions after the initial render.
- Inline SVG diagrams with accessible labels and equivalent nearby explanatory text.
- Produce the application source and build configuration only. Do not deploy or commit a generated portable `dist` directory.

## Implementation sequence

1. Inspect the existing files and git history; retain README and trophy behavior/assets.
2. Add Vite/React/TypeScript configuration and package scripts.
3. Define typed portfolio content from `portfolio-content.md`.
4. Build semantic page sections, navigation, case-study disclosures, and diagrams.
5. Add responsive styling, focus states, reduced-motion support, and fragment auto-open enhancement.
6. Review public text and assets for unsupported claims, private details, external dependencies, and path assumptions.
7. Run the checks below and resolve issues before handoff.

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
- Verify local assets load, no console errors occur, and no remote asset requests or analytics are present.
- Run lint, typecheck, production build, Playwright, and axe accessibility checks.
- Confirm README, trophy SVG, and `.github` files remain intact.

## Out of scope

Deployment, email/contact forms, résumé downloads, analytics, backend services, router-based navigation, and generated distribution artifacts.

