# Portfolio content and evidence

This document is the content source of truth for the portfolio. Public copy should remain concise, specific, and limited to claims supported by the CV or project context. Keep this editorial guidance private; do not publish the source context files or CV.

## Positioning

**Name:** Taushif Reza  
**Role:** Software Engineer, building toward AI engineering  
**Short introduction:** Backend-focused software engineer building reliable APIs and real-time systems, with experience across Django, Go, and connected hardware. Interested in applying that systems foundation to AI engineering.

The AI direction is an aspiration, not a claim of AI/ML specialization. Use “Software Engineer” rather than senior, architect, or another unsupported level.

## Public sections

1. **Introduction:** Name, role, concise positioning, and GitHub/LinkedIn links.
2. **Selected work:** Bus Attendance System, Dynamic QR Ticketing System, inTalent, and Go PDF generator. Each entry distinguishes project context, contribution, evidence, and status where relevant.
3. **How I work:** Transactional correctness, clear service boundaries, access control, and root-cause debugging. Frame these as recurring engineering interests/practices, not quantified outcomes.
4. **Experience and education:** Current CV-confirmed roles and degree.
5. **Expertise:** Evidence-based technologies only; avoid proficiency scales.
6. **Contact:** Public GitHub and LinkedIn links only.

## Experience and education

- **Software Engineer, ING Skill Academy** — February 2024–present.
- **Backend Developer, Prince Lab** — September 2023–January 2024.
- **BSc (Hons) Computing, Islington College / London Metropolitan University** — February 2022–May 2024.

Use “ING Skill Academy” exactly as in the CV. Do not conflate it with “ING Skill Museum” appearing in project context. No employment relationship to inTalent is established in the source material.

## Project cards and case-study guidance

### Bus Attendance System

CV-supported work at ING Skill Academy. Describe the system as hardware-integrated attendance and live location tracking, involving ESP32, RFID, GPS, GSM, a backend, and a frontend. The CV describes WebSocket updates every five seconds and automated attendance logging. Present the stated architecture as Hardware → Communication → Backend → Frontend. Do not equate this system with the separately discussed InOut attendance rewrite; that rewrite is planned and its implementation status is unknown.

### Dynamic QR Ticketing System

CV-supported work at ING Skill Academy. Describe dynamic QR ticketing with real-time validation and API design. A separate project context describes a Django event-ticketing platform with manual payment verification, multiple tickets per purchase, QR tickets, and admin bulk actions; present those details only as contextual project notes unless the connection and personal contribution are clear in the UI copy.

### inTalent

Context describes a certification-based hiring and applicant-tracking platform using Django REST services. Safe summary: “Contributed to backend design and implementation discussions for a hiring and certification platform, including service boundaries, authentication, and application workflows.” The contexts vary on authorship and status; label individual features as discussed, designed, or implemented only when the source explicitly supports that status. Do not present the proposed AI Interview feature as shipped. Do not attribute colleague-authored changes to Taushif.

### Go PDF generator

Context describes a Go tool for large-batch ticket-imposition PDFs and two production out-of-memory failures addressed by creating an Fpdf instance per sheet and merging bounded groups recursively with pdfcpu. Safe case study: explain the memory issue and these design changes; state that the failures were reported as solved, with no public metrics available. Do not invent throughput, batch size, memory savings, or uptime.

### Additional evidence-led topics

The contexts also record work/discussion involving enrollment race handling with row locks and atomic transactions, exam-integrity review, framework-free Go layering, and inTalent service authentication. Use only where useful and clearly distinguish design/review from verified implementation. Avoid the AI Interview project and VAPT mitigation as shipped case studies unless independent implementation evidence is established.

## Skills and evidence

Good primary skills for the page: Python, Django/DRF, REST APIs, PostgreSQL, Redis, Docker, and Go. React, FastAPI, WebSockets, JWT/RBAC, Celery, and hardware integration may appear in relevant project details. Treat Go as demonstrated in project context but avoid implying equal depth to Django/Python. Omit tools that were only proposed, mentioned, or attributed to colleagues.

## Claims to exclude

- 99.9% uptime, cost reduction, user growth, or performance improvements: not independently supported with evidence.
- “AI interview service shipped” and any claim that AI Interview is production work.
- Senior/architect titles, team leadership, or unverified ownership of inTalent features.
- “InOut rewrite shipped” or merging InOut with the CV Bus Attendance System.
- Private reviews, colleagues’ names/contributions, internal infrastructure addresses, raw CV/context content, email, phone, résumé download, or contact form.
- AWS Academy coursework described as a professional certification; if certifications are ever listed, label these accurately as course completions.

## Public links

- GitHub: `https://github.com/TaushifReza`
- LinkedIn: `https://www.linkedin.com/in/taushif-reza`

## Private evidence register and inventory

This register is editorial documentation, excluded from the application build. Source locators refer to the supplied local context files and the one-page CV, not independently verified project repositories. **Supported** means present in a supplied source; **inference** means a conservative editorial interpretation; **missing** identifies evidence still needed. A context summary can conflict with another summary, so presence in a context is not proof of personal authorship or shipping status.

Source keys: **C** = `claude_context.md`, section D numbered inventory (lines 50–108); **G** = `gpt_context.md`, section D named project headings (lines 373–715); **CV** = `MOHAMMAD TAUSHIF REZA.CV.pdf`, page 1. `gemini_context.md` section D explicitly has no project evidence and supplies no additional project entries. Exact locators below let a reviewer find the source without copying raw context into public assets.

| Project / grouping | Locator | Decision | Supported; inference or missing evidence |
| --- | --- | --- | --- |
| Bus Attendance System | CV, Work Experience / ING Skill Academy | Feature | Four-layer hardware system, ESP32/RFID/GPS/GSM, five-second WebSocket updates, attendance/location. Public diagram is a simplified schematic; deployment topology and independent metrics missing. |
| Dynamic QR Ticketing System | CV, Work Experience / ING Skill Academy | Feature | Real-time validation and API design. Connection to C's event-ticketing or G's food/drink service missing; do not merge them. |
| inTalent platform | C D.1; G `inTalent Platform` (375) | Feature, qualified | Service/auth/application discussions supported. C reports implemented features; G warns authorship and deployment unverified. Personal ownership of each feature missing; show discussions/design contribution only. |
| Go print-file-generator | C D.8; F.1 (124–129) | Feature | Two OOM failures reported solved by per-sheet Fpdf and bounded recursive pdfcpu merges. No throughput/memory measurements; no independent production verification. |
| inTalent AI Interview Service | C D.2; G `AI Interview Service` (555) | Omit | C says built, G says proposed/not implemented. Conflicting implementation status and attribution; cannot publish as shipped. |
| inTalent certification/enrollment backend | C D.3; G `inTalent Platform` | Reserve | Eligibility/issuance, enrollment modes and race handling discussed. Individual authorship and implementation verification missing; eligible as a qualified engineering topic only. |
| inTalent exam integrity | C D.4; G F `Certification exam automation/VAPT` (752) | Reserve | Review/security concerns supported; mitigation completion and ownership unverified. |
| ING Skill Museum Global Survey | C D.5 | Reserve | Django/JWT/Celery/email/token-flow context. Employer relationship, personal scope and rollout missing. Do not rename employer to Skill Museum. |
| Template Studio | C D.6 | Reserve | Django/React template canvas and bulk generation described; individual authorship and public demo missing. |
| cec-print | C D.7 | Reserve | Pillow certificate tool described. Authorship, status and public repository missing. Keep distinct from Go PDF tool. |
| go-social | C D.9 | Reserve | Layered Go backend, registration/login/profile, mocks described; supplied repository text `github.com/TaushifReza/go-social` is not independently retrieved. |
| Go AI Interview | C D.10 | Omit | Go/Gin migration described; overlap with Go REST API/go-social and shipping status unresolved. |
| Go REST API | C D.11 | Reserve | Go API stack described; possible overlap with D.9/D.10 explicitly uncertain. No separate ownership/rollout proof. |
| Admission Pulse | C D.12; G `Admission Pulse` (411) | Reserve | FastAPI/async SQLAlchemy/JWT/reporting work discussed. Intended users are inferred; final debugging outcome, usage and deployment missing. |
| InOut / Intern Attendance rewrite | C D.13; G `Intern Attendance System` (483) | Reserve, planned | Existing attendance app and planned tenant-aware rewrite. Alias/grouping is a conservative editorial inference; original project identity and personal scope need confirmation. Distinct from CV bus system. |
| Multi-tenant SaaS consolidation / organizational suite | C D.14; G `Multi-tenant Organizational SaaS` (501) | Reserve, design | Tenant isolation and entitlements discussed; C says partly built, G says completed SaaS unverified. Their equivalence is inferred, not established. |
| Cookiecutter multi-stack template | C D.15 | Reserve | Django reference template/CLI described. Ownership, public artifact and reuse outcomes missing. |
| Django event ticketing platform | C D.16 | Reserve | Manual payment verification, multi-ticket purchase and QR/admin workflows described. Link to CV QR system and exact personal contribution missing. |
| Points/rewards / College Points / FYI points | C D.17; G `College Points / FYI student points` (429) | Reserve | Ledger/transaction discussion supported; grouping is inferred, some implementation belongs to colleagues. Personal authorship missing. |
| RBAC system | C D.18; G `POC System` (393) for related authorization concepts only | Reserve | DRF/React permission logic described in C. POC equivalence is not established; keep separate. |
| NFRS-9 Vision Report UI | C D.19 | Reserve | FastAPI/OCR/Docker context. User contribution and outcome missing; no shipped claim. |
| Django polling fix | C D.20 | Reserve | Constraint/deduplication fix reported. Personal authorship and verification missing. |
| World Cup 2026 prediction system | C D.21 | Reserve | Existing Django app, result/tiebreaker changes described. Authorship and deployed outcome missing. |
| Self-hosted Vaultwarden | C D.22 | Omit | Personal infrastructure context, not necessary public evidence; avoid infrastructure details. |
| POC System | G `POC System` (393) | Reserve | Django domain/RBAC design under development. Commissioning, personal role, rollout missing; separate from C RBAC entry. |
| Spin the Wheel | G `Spin the Wheel` (447) | Reserve | Atomic transaction discussion supported; related commits attributed elsewhere. Authorship and stress-test evidence missing. |
| FYI Plus2 | G `FYI Plus2` (465) | Reserve | DRF/schema/error debugging supported; final cause/fix and personal contribution missing. |
| QR Food & Drink Ticket API | G `QR Food & Drink Ticket API` (519) | Reserve | Endpoint/authentication discussion supported; personal authorship, deployment and relationship to CV ticketing missing. |
| Notification Service | C D.1; G `Notification Service` (537) | Reserve within inTalent | Async messaging described; queue mechanism differs between summaries. Delivery metrics, exact implementation and ownership missing. |
| RustFS / Cloudflare / LXC storage stack | G `RustFS / Cloudflare / LXC Storage Stack` (573) | Omit | Troubleshooting context supported; final access-policy outcome unconfirmed and infrastructure privacy requires omission. |
| Reusable Proxmox LXC template | G `Reusable Proxmox LXC Developer Template` (591) | Omit | Attempted template workflow, conversion outcome unconfirmed. |
| Alumni Graduation Invitation System | G `Alumni Graduation Invitation System` (609) | Omit | Colleague work; personal contribution missing. |
| inNepal | G `inNepal` (627) | Omit | Colleague work; personal contribution missing. |
| Cyber Centric Game | G `Cyber Centric Game` (645) | Omit | Colleague work; personal contribution missing. |
| Hack Arena | G `Hack Arena` (663) | Omit | Colleague work; personal contribution missing. |
| inTalent Landing Page | G `inTalent Landing Page` (681) | Omit | Assistant-proposed artifact; user authorship and outcome unconfirmed. |
| AI/ML learning experiments | G `AI/ML Learning Experiments` (699) | Omit as projects | Learning proposals only; completed experiments missing. AI direction may appear as aspiration. |
| Banking APP | CV, Projects | Reserve | CV reports Django-style banking API/security/async deployment work. Scope and implementation not independently inspected; no adoption or regulated-service claim. |
| E-Book Store | CV, Projects | Reserve | CV reports ASP.NET Core/Identity/EF, repository/UoW/N-tier, Stripe and Facebook login. Current repository state and demo missing. |

### Exact CV credentials, dates, and additional links

- Software Engineer, **ING Skill Academy**, Nepal: **Feb 24–Present** (display normalized to February 2024–present).
- Backend Developer, **Prince Lab**, Nepal: **Sept 23–Jan 24** (September 2023–January 2024).
- **BSc (Hons) Computing**, **Islington College Kathmandu (London Metropolitan University)**: **Feb 2022–May 2024**.
- **AWS Academy Graduate - AWS Academy Cloud Foundations**: **Sep 19, 2022**; CV annotation URL: `https://www.credly.com/go/JFOz4SiG`.
- **AWS Academy Graduate - AWS Academy Machine Learning Foundations**: **Nov 16, 2022**; CV annotation URL: `https://www.credly.com/go/HPWfg0vu`.

The AWS entries are course completions, not professional AWS certifications; they are not required public page content. Banking APP CV annotation points to `https://github.com/TaushifReza/banking-app`; E-Book Store points to `https://github.com/TaushifReza/eBookStore`. These project/credential URLs were extracted from CV annotations; retrieval and current content are unconfirmed. Keep them out of project CTAs until reviewed. Public GitHub profile retrieval returned 200; LinkedIn returned 999 (bot/access restriction), so automated retrieval cannot establish normal interactive availability.

