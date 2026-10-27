# Portfolio design and interaction specification

## Direction

Keep the light technical editorial identity: warm off-white, ink text, restrained violet, deliberate spacing, fine rules, and readable typography. The audience is backend hiring teams, technical peers, and potential collaborators. Emphasize real engineering work rather than a catalogue of technologies or decorative dashboards.

The single original transparent portrait remains in the hero: 320px desktop, approximately 240px tablet, and a compact 120px portrait/name row below full-width mobile introduction/actions. Preserve its bytes, alpha, and aspect ratio; do not add framing, filters, or a duplicate About photo. Retain the small footer orbit.

## Information architecture

- Home: compact introduction, four ordered flagship projects, concise additional projects/learning, repository archive, Posts preview, approach, experience, toolkit, and contact.
- `/posts/`: complete article collection, summaries, topic labels, reading estimates, author context, and RSS link.
- `/posts/jwt-jwks/`, `/posts/pdf-memory/`, `/posts/survey-question-snapshots/`: readable articles with byline, table of contents, anchored sections, references, and related links.
- Old `/writing/` article URLs: lightweight HTML migration documents with a visible link and meta refresh; they are not HTTP 301 responses.
- Removed lab URLs: real 404, with no navigation or discovery references.

Use native links for navigation and native details/summary for project expansions. Preserve existing project IDs where applicable. JavaScript expands a matching project fragment; content itself remains present without JavaScript.

## Project presentation

Order flagship work: inTalent, Survey System, Bus Attendance, Attendance System. Give inTalent the most prominent treatment and its approved live link. Keep Survey deployment private. Follow with QR Ticketing, Go Print-Sheet Generator, course-based Mango, and the compact public repository archive.

Each project explains the problem, personal backend contribution, important decision, supported result, and limitation where material. Architecture diagrams have nearby text equivalents. Distinguish simplified diagrams from deployment maps and learning projects from professional work. No unsupported performance metrics, security guarantees, or project-wide ownership claims.

## Posts

Article pages use a comfortable text measure and clear paragraph rhythm rather than portfolio-card styling. A table of contents provides direct section links; diagrams and code can use more width while retaining narrow-screen alternatives and sensible inner scrolling. Keep author, reading estimate, references, and related content visible and consistent.

The JWT post teaches a general microservice authentication pattern with Django examples. Its interactive select/buttons supplement a complete static explanation and use deterministic synthetic cases; no real cryptography or network request runs. The PDF article describes actual renderer lifetimes and direct merge limitations. The Survey article explains stored question snapshots and tradeoffs without universal immutability claims.

Use direct, specific first-person drafts. Original explanatory code must be visibly distinguished from proprietary production source. Dates are optional until actual publication/modification information is available.

## Toolkit and public identity

Lead with Python/Django backend engineering. Group data/background processing and systems/deployment clearly; describe Go tooling and course-based .NET experience with context. React/TypeScript describe this portfolio. AI engineering remains a learning direction without a lab or implied specialization. Contact uses approved GitHub, LinkedIn, X, Bluesky, and Instagram links; no private contact details.

## Accessibility and resilience

Use semantic landmarks, one h1, ordered headings, skip links, visible focus, meaningful accessible names, and keyboard-accessible native controls. Support 320px layouts, reflow, reduced motion, readable contrast, and accessible diagram descriptions.

Build-time rendering supplies complete content, links, headings, and metadata in the response HTML; React hydrates only to add behavior. Home, listing, and article reading must work with JavaScript disabled. Keep server/client initial states identical and avoid hydration warnings.

Do not add remote fonts, trackers, embedded social feeds, stock imagery, or animation libraries. No external requests are necessary to read the website. Structured data and crawler files describe the same public content visitors can read; they do not guarantee rankings or AI citations.
