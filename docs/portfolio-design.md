# Portfolio design and interaction spec

## Direction

A light, technical editorial portfolio for backend engineering: warm off-white surfaces, ink-colored text, and restrained violet accents. Favor quiet typography, generous spacing, fine rules, and clear information hierarchy. Project stories should use architecture diagrams as the main visual evidence. Keep the presentation calm and readable rather than imitating a terminal or dashboard.

## Page structure

Single-page site with anchor navigation and these sections:

1. Compact introduction and social links.
2. Selected work with concise summaries and expandable case studies.
3. Engineering approach.
4. Experience and education.
5. Expertise.
6. Contact links.

Use a compact sticky or static anchor nav depending on layout fit. All section IDs must be stable and directly addressable. Native `<details>` / `<summary>` should hold case-study expansions; opening a matching fragment on initial load should expand the appropriate case study.

## Visual system

- Define color, type, spacing, border, and focus tokens in CSS custom properties.
- Use a readable sans-serif for body content and a restrained display/mono pairing for labels and technical annotations.
- Keep the content column comfortable at desktop widths and reduce padding gracefully on narrow viewports.
- Use violet for emphasis and interactive states with sufficient contrast; do not rely on color alone to convey state.
- Prefer inline, accessible SVG diagrams with visible labels, directional arrows, and a nearby text explanation. Diagrams must remain understandable when enlarged and must have text equivalents.
- Avoid decorative stock imagery, remote widgets, external fonts, trackers, animation libraries, and unnecessary motion. Respect `prefers-reduced-motion`.

## Project story pattern

Each case study should make these points easy to scan: context and status, the engineering challenge, contribution/approach, a labelled architecture or flow diagram, and outcome/limits. Mark unverified or design-stage details plainly. Do not turn unknown outcomes into metrics or product claims.

## Accessibility and resilience

- Semantic landmarks, one page-level heading, ordered heading levels, skip link, visible keyboard focus, and logical keyboard navigation.
- Native links and buttons with descriptive accessible names; no pointer-only interactions.
- Support zoom/reflow and reduced motion. Ensure expanded content and SVG captions are available to screen readers.
- Maintain readable contrast, including focus indicators and muted text.
- The approved application renders with client-side React. Once rendered, navigation uses native anchors and disclosures use native `<details>`; JavaScript additionally opens matching case-study fragments. Provide a `<noscript>` explanation for visitors with JavaScript disabled. Static rendering/prerendering is outside the approved implementation scope.
- No external assets are required for the page to render.

