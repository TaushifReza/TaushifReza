# Portfolio design and interaction spec

## Direction

A light, technical editorial portfolio for backend engineering: warm off-white surfaces, ink-colored text, and restrained violet accents. Favor quiet typography, generous spacing, fine rules, and clear information hierarchy. Project stories should use architecture diagrams as the main visual evidence. Keep the presentation calm and readable rather than imitating a terminal or dashboard.

## Page structure

Portfolio home with anchor navigation and these sections:

1. Compact introduction and social links.
2. Selected work with concise summaries and expandable case studies.
3. Compact public-repository archive.
4. Writing cards linking dedicated articles.
5. Engineering approach, with a lab link in the learning aside.
6. Experience and education.
7. Expertise.
8. Contact links.

Dedicated pages at `/writing/pdf-memory/`, `/writing/jwt-jwks/`, and `/lab/incident-classifier/` share a header, home/section links, readable article typography, and footer. Navigation uses native links. Preserve selected-work IDs and disclosures. Article prose stays within 68 characters per line where space permits; full-width conceptual figures break up the reading rhythm.

Use a compact sticky or static anchor nav depending on layout fit. All section IDs must be stable and directly addressable. Native `<details>` / `<summary>` should hold case-study expansions; opening a matching fragment on initial load should expand the appropriate case study.

## Visual system

- Define color, type, spacing, border, and focus tokens in CSS custom properties.
- Use a readable sans-serif for body content and a restrained display/mono pairing for labels and technical annotations.
- Keep the content column comfortable at desktop widths and reduce padding gracefully on narrow viewports.
- Use violet for emphasis and interactive states with sufficient contrast; do not rely on color alone to convey state.
- Prefer inline, accessible SVG diagrams with visible labels, directional arrows, and a nearby text explanation. Diagrams must remain understandable when enlarged and must have text equivalents.
- Avoid decorative stock imagery, remote widgets, external fonts, trackers, animation libraries, and unnecessary motion. Respect `prefers-reduced-motion`.
- Replace wide merge/auth diagrams with readable stacked stage lists at narrow widths. Label conceptual visuals and explanatory pseudocode; do not imply production traces or source-code evidence.
- Optional artifact components render only supplied real assets. Empty evidence fields produce no UI.

The introduction uses the owner-approved transparent `public/bg_remove.png` portrait in place of the large orbit illustration. Preserve the original PNG, colors, opacity, natural aspect ratio, arms, and transparent breathing room; place it directly on the warm page background without a frame, card, glow, filter, or shadow. Use a 320px-wide portrait beside the introduction on desktop and approximately 240px at tablet widths. Below 760px, keep the headline, introduction, and actions full width, followed by a compact row pairing a 120px-wide portrait with the name and role. Reserve the image dimensions and prioritize its initial loading. The Approach section keeps its name, role, biography, and principles as text, so there is only one portrait. Retain the small footer orbit.

## Project story pattern

Each case study should make these points easy to scan: context and status, the engineering challenge, contribution/approach, a labelled architecture or flow diagram, and outcome/limits. Mark unverified or design-stage details plainly. Do not turn unknown outcomes into metrics or product claims.

## Accessibility and resilience

- Semantic landmarks, one page-level heading, ordered heading levels, skip link, visible keyboard focus, and logical keyboard navigation.
- Native links and buttons with descriptive accessible names; no pointer-only interactions.
- Support zoom/reflow and reduced motion. Ensure expanded content and SVG captions are available to screen readers.
- Maintain readable contrast, including focus indicators and muted text.
- Dedicated static HTML entry points supply metadata and no-JavaScript guidance. React renders their interactive content. Native anchors and disclosures remain browser controls; JavaScript opens matching case-study fragments. Direct page loads must work on static hosting and configured nested paths.
- JWT controls use native select/buttons, current-stage text, and live status. Invalid token scenarios stop before authorization; fixtures execute no cryptography.
- No external assets are required for initial rendering. Only explicit lab model loading may download the reviewed model artifacts; the lab explains download size, source, local inference, and limitations before that action.

