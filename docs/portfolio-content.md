# Portfolio content and evidence

This editorial evidence register is the content source of truth. It is excluded from the website build, but remains repository documentation and is publicly visible if committed to this public repository. Public content uses the owner's supplied context/CV, reviewed source, and explicit clarifications; no employer source, secrets, customer records, or private contact information may be copied into the website.

## Positioning and permissions

Taushif Reza is a backend-focused Software Engineer based in Nepal, with Python/Django as his strongest foundation and an explicit learning direction toward AI engineering. Go demonstrates tooling experience; C#/.NET is represented through a course-based learning project. React/TypeScript describe this portfolio rather than an unsupported professional frontend specialization.

On 27 October 2026, the owner confirmed backend ownership for inTalent, Survey, Bus Attendance, and Attendance. This supports first-person backend contribution language, not sole ownership of every platform component. He approved original explanatory examples instead of publishing proprietary source excerpts, and identified Mango as course-based learning.

The original transparent `public/bg_remove.png` is the sole approved public portrait. Keep its bytes/alpha unchanged. Other original photos and download sidecars remain local and unpublished.

## Featured project order

| Order | Project | Supported public scope | Limits |
| --- | --- | --- | --- |
| 1 | inTalent | Backend implementation across identity, certification, enrollment, imports/reports, job applications, resume snapshots, and notification processing. Public platform: `https://intalentnepal.com`. | A live platform does not prove every inspected change is deployed. AI-interview and Networking are not functioning in the inspected source's status notes; omit them as shipped features. |
| 2 | Survey System | Internal Django/DRF survey workflows, monthly rounds, question snapshots, invitation processing, project grants, response collection, and historical reporting. | Keep its deployment URL private. This checkout does not establish explicit timed token expiry. |
| 3 | Bus Attendance | Django backend with MQTT/MessagePack ingestion, RFID trip-linked attendance, routes/stops, historical locations, and school/bus/parent WebSocket distribution. | No source-confirmed five-second delivery cadence; do not claim hardware authorship or security guarantees from this audit. |
| 4 | Attendance System | Daily clock/break lifecycle, corrections, travel requests, departmental access, verification/approval, analytics, and spreadsheet exports. | Distinct from Bus Attendance. Source now supports implemented work; the old context-only “planned rewrite” label is obsolete for this inspected backend. No claim of universal race-proof behavior. |

Follow these with concise QR Ticketing and Go Print-Sheet Generator entries. Mango is a separate learning entry. Banking App and go-social remain the compact public repository archive.

## Source evidence locators

All paths below are local editorial locators, never source download links. Their inclusion does not publish or grant access to the corresponding repositories. No inspected employer repository was modified or executed during research. Test files establish that testing work exists, not that the tests passed during this audit.

### inTalent

Root: `/home/taushif/work/smarc/intalent`.

- `auth/account/services/jwt_token_service.py`: RS256 issuance, refresh rotation, account eligibility and current identity claims.
- `auth/account/views/public.py`: public-key/JWKS document.
- `backend/Job/myproject/authentication.py`: consumer signature, issuer, audience, expiry, and token-type verification.
- `auth/core/views.py` and `auth/config/utils/authentication.py`: distinct service identity and service scopes.
- `backend/Certification/cert_enrollments/enrollment/services/enrollment_service.py`: transactional enrollment and row locking.
- `backend/Certification/cert_enrollments/submissions/services/submission_service.py`: assessment submission/progress coordination.
- `backend/Job/job_applications/services/application_service.py` and `resume_snapshot_service.py`: application records and application-owned resumes.
- `backend/notification/src/consumer.py`: Redis LIST queue, not Redis Pub/Sub.

Auth and backend histories include substantial owner-attributed implementation commits. The Certification working tree contained a large uncommitted refactor; its source paths are implementation evidence, not a release manifest. Do not claim immediate access-token revocation, automatic key rotation, OAuth/OIDC compliance, or complete production rollout without separate evidence.

### Survey

Root: `/home/taushif/work/smarc/survey/backend`.

- `apps/survey_cycles/models.py`: project/client/month uniqueness and stored question snapshots.
- `apps/survey_cycles/services.py`: locked/idempotent round creation, snapshot-based public rendering and submission.
- `apps/survey_cycles/invitations.py`: delivery claims, eligibility rechecks, and receipt state.
- `apps/projects/permissions.py`: viewer/editor grants and administrative bypass.
- `apps/dashboards/services.py` and `cache.py`: historical reporting, pooled calculations, and best-effort caching.

Snapshot wording should describe preserved question content used by a generated survey, not promise universal database immutability. Link access is lifecycle/active-state gated; timed expiry was not found.

### Attendance

Root: `/home/taushif/work/smarc/attendance-backend`.

- `attendence/models.py` and `services/interns_attendance_service.py`: daily uniqueness, clock/break/clock-out lifecycle, and transactional clock-in.
- `attendance_requests/services/attendance_request_service.py`: correction/travel requests.
- `attendance_requests/services/attendance_verification_service.py`: staged verification/approval.
- `account/permissions.py`: departmental access.
- `attendence/services/export_services.py`, `analytics_service.py`, and `calculation_service.py`: exports, analytics, and calculations.

Git history supports the owner's implementation. The inspected app-level test modules had no meaningful cases; do not claim a tested production reliability level.

### Bus Attendance and QR Ticketing

Bus root: `/mnt/d/Work/ING Skill Museum/BusAttendance/Backend`.

- `transportation/mqtt_client.py`: MessagePack ingestion, attendance processing, and audience-specific broadcasts.
- `transportation/consumers.py`: school/bus/parent subscriptions.
- `routes/models.py`: routes/stops/assignments.

The CV's five-second statement is not corroborated by backend scheduling. Nearby demo sketches also do not establish that interval. Keep timing unquantified. The inspected source does not establish a verified end-to-end security guarantee; avoid publishing security assurances unsupported by independent validation.

QR source: the `ticket_system/backend` project beneath the same Windows work tree. `core/views.py` supports numbered QR ticket generation, ZIP output, lookup validation, and used-ticket state. It is implemented with Django views; do not describe it as necessarily DRF, rotating QR codes, or race-proof redemption.

### Go Print-Sheet Generator

Root: `/home/taushif/work/smarc/helper_script_projects/go-print-file-generator`.

- `internal/pdfbuilder/pdfbuilder.go`: current fresh Fpdf per sheet, temporary single-sheet files, direct chunk merge.
- `internal/worker/pool.go`: concurrency and ordered collection.
- `internal/chunker/chunker.go`: contiguous chunks whose size grows with the job.
- `internal/merger/merger.go`: direct final `pdfcpu` merge.
- `cmd/ticket-imposition/main.go`: preview, orchestration, and temporary-directory cleanup.
- `internal/autogrid/autogrid.go`: orientation-aware grid calculation.

History confirms a change from one renderer per chunk (`0ce6a05`) to one renderer per sheet (`3c40dc6`). The current source and inspected history do not substantiate bounded recursive merges, constant memory, or streaming throughout. This corrects the earlier context-derived narrative. The reported production OOM incidents may be described as owner-reported context, without inventing measurements or asserting an unverified second fix. The sibling Python/ReportLab generator is distinct.

### Mango

Root: `/mnt/d/C#Project/Microservices/Mango`.

Course-based .NET 8 learning project: ASP.NET Identity, HS256 JWT, EF Core/SQL Server, product/coupon/cart/order services, Stripe handling in OrderAPI, Azure Service Bus publishing, and a rewards consumer. Do not infer an Ocelot gateway or standalone payment service from README claims unsupported by source. Email code inspected stores logs; actual delivery was not established. Do not expose or link private source/configuration containing credentials.

## Posts

Three source-backed drafts:

1. **Verifying JWTs across microservices with JWKS** — general trust boundaries with Django examples from implemented inTalent services. Separate access, refresh, and service tokens; key discovery, signature/claims validation, then authorization. Synthetic interactive scenarios execute no cryptography.
2. **Why I use a fresh PDF renderer for every sheet** — verified renderer lifetime change, ordered workers, intermediate files, I/O tradeoffs, and remaining merge limits.
3. **Why I freeze survey questions before collecting responses** — template changes, stored question content, survey-round boundaries, and historical reporting tradeoffs.

Use direct first-person prose, independently written examples, and official technical references. Do not invent debugging memories or claim independent human authorship. Unknown first-publication dates stay omitted; actual visible dates, feed dates, and structured data must agree when added.

## Skills

- Backend: Python, Django/DRF, API design, authentication, transactional workflows.
- Data/background processing: PostgreSQL, Redis, Celery; MQTT/Channels in relevant project context.
- Systems: Docker, Linux, NGINX.
- Other tooling/learning: Go tooling; C#, ASP.NET Core, EF Core, SQL Server, Azure Service Bus through Mango.
- Portfolio frontend: React, TypeScript, Vite.

Do not turn dependency presence into an expertise claim or give arbitrary skill percentages.

## Experience and education

Owner-confirmed CV history remains:

- Software Engineer, ING Skill Academy — February 2024–present.
- Backend Developer, Prince Lab — September 2023–January 2024.
- BSc (Hons) Computing, Islington College / London Metropolitan University — February 2022–May 2024.

Keep the employer name from the CV; do not silently equate ING Skill Academy and ING Skill Museum. AWS Academy completions are coursework, not professional certifications, and remain omitted from the public page.

## Public destinations

Owner-approved profiles: GitHub `https://github.com/TaushifReza`, LinkedIn `https://www.linkedin.com/in/taushif-reza`, X `https://x.com/TaushifR786`, Bluesky `https://bsky.app/profile/taushifreza.bsky.social`, Instagram `https://www.instagram.com/taushifreza`.

The supplied inTalent live URL returned HTML during research; individual feature rollout was not established through that response. Social platforms may restrict automated retrieval. Profile links are owner-supplied, not claims that every automated availability check succeeded.

Previously reviewed public repositories: `https://github.com/TaushifReza/banking-app` supports account/auth/profile workflows, not a completed banking transaction system; `https://github.com/TaushifReza/go-social` supports its social API scope, not the article's RSA/JWKS design or production readiness.

## Publication exclusions

No private email/phone, résumé download, raw context/CV, employer source paths, customer/resume data, internal endpoints, credentials, invented metrics, testimonials, or unverified live demos. The removed incident-classifier lab is not public portfolio content. Removing the portfolio lab does not erase the separate AI learning aspiration.
