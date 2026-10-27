import type { ProjectEvidenceItem } from './evidence'

export type ProjectId = 'intalent' | 'survey' | 'bus-attendance' | 'attendance' | 'qr-ticketing' | 'pdf-generator' | 'mango'

export interface Project {
    id: ProjectId
    number: string
    title: string
    category: string
    summary: string
    context: string
    stack: string[]
    challenge: string
    approach: string
    outcome: string
    diagramDescription: string
    article?: { path: string; label: string }
    liveLink?: { href: string; label: string }
    evidence?: readonly ProjectEvidenceItem[]
}

export const profile = {
    name: 'Taushif Reza',
    role: 'Backend-focused software engineer',
    location: 'Based in Nepal',
    introduction: 'I build the backends behind hiring platforms, surveys, and attendance systems. Python and Django are my foundation; clear APIs, consistent data, and dependable workflows are what I care about.',
    about: 'I’m Taushif, a software engineer based in Nepal. I take backend work from the data model through the API and into the operational details: permissions, background jobs, imports, reports, and the requests that arrive at the same time.',
    perspective: 'Most of my work is in Python and Django. I also build tools in Go and explore C# and ASP.NET Core through learning projects. Trying another language helps me question habits and understand the tradeoffs in the tools I already use.',
    learning: 'Learning toward AI engineering',
    learningDescription: 'I’m continuing to study machine learning and how to build useful AI features on a reliable backend. It’s a direction I’m working toward alongside my software engineering work.',
    links: {
        github: 'https://github.com/TaushifReza',
        linkedin: 'https://www.linkedin.com/in/taushif-reza',
        x: 'https://x.com/TaushifR786',
        bluesky: 'https://bsky.app/profile/taushifreza.bsky.social',
        instagram: 'https://www.instagram.com/taushifreza',
    },
}

export const projects: Project[] = [
    {
        id: 'intalent', number: '01', title: 'inTalent',
        category: 'Recruitment & certification · Backend engineering',
        summary: 'A hiring and certification platform where identity, enrollment, assessment, and job applications cross service boundaries. One of my largest backend projects.',
        context: 'Backend owner · Live platform',
        stack: ['Python', 'Django / DRF', 'PostgreSQL', 'Redis', 'JWT / JWKS'],
        challenge: 'Keep identity and permissions consistent across services while supporting certification workflows and preserving the history of a job application.',
        approach: 'I implemented backend workflows across authentication, certification, and job applications. That includes RSA-signed JWTs and JWKS verification, refresh-token rotation, transactional enrollment, bulk invitation imports, reporting, and application-specific resume snapshots. Notification processing uses a separate Redis-backed worker.',
        outcome: 'The platform is live. The backend separates token issuance from service verification, supports operational certification workflows, and keeps application resumes separate from later profile edits. Recent backend changes may be ahead of the live release.',
        diagramDescription: 'Simplified service map: an identity service issues signed tokens and publishes public verification keys. Certification and job services verify identity and apply their own access rules; a separate worker processes notification jobs.',
        article: { path: 'posts/jwt-jwks/', label: 'Read about JWT verification across services' },
        liveLink: { href: 'https://intalentnepal.com', label: 'Visit inTalent' },
    },
    {
        id: 'survey', number: '02', title: 'Survey System',
        category: 'Internal platform · Historical reporting',
        summary: 'An internal survey backend covering question setup, survey rounds, invitation delivery, responses, and reporting. Admin teams manage the process; clients receive an individual survey link.',
        context: 'Backend owner · Internal system in use',
        stack: ['Django / DRF', 'PostgreSQL', 'Redis', 'Celery'],
        challenge: 'Let teams change survey templates without changing the meaning of past responses, while keeping invitations and survey rounds consistent.',
        approach: 'I built questionnaire and round-generation workflows, project-level viewer/editor permissions, token-based response collection, and reporting. Generated surveys preserve question snapshots. Round creation uses locking and uniqueness constraints; invitation receipts track the handoff and delivery state of background jobs.',
        outcome: 'Administrators can manage survey rounds and review historical responses against the questions captured for that round. Invitation states distinguish queued work from delivery progress. The deployment is internal, so there is no public demo link.',
        diagramDescription: 'Question templates are captured as snapshots when survey rounds are generated. Invitations lead clients to their survey; responses and the saved question snapshots support historical reporting.',
        article: { path: 'posts/survey-question-snapshots/', label: 'Read why I preserve question snapshots' },
    },
    {
        id: 'bus-attendance', number: '03', title: 'Bus Attendance System',
        category: 'Device integration · Real-time updates',
        summary: 'The backend between an RFID tap on a bus and the attendance and location views used by school teams and parents.',
        context: 'Backend owner · Hardware-integrated system',
        stack: ['Django / DRF', 'MQTT / MessagePack', 'Django Channels', 'PostgreSQL'],
        challenge: 'Turn device messages into trip-linked attendance records and deliver the right attendance and location updates to each audience.',
        approach: 'I built backend processing for MQTT messages, RFID check-in and check-out events, trip records, and onboard counts. Django Channels distributes school-wide, bus-specific, and parent-specific updates. The backend also manages bus routes, stops, assignments, and location history.',
        outcome: 'Device events feed attendance records and live web updates, while routes and trip history remain available for administration. My role covered the backend integration, attendance processing, and delivery of updates to the web interface.',
        diagramDescription: 'RFID and location devices send messages through MQTT. The backend records trip attendance and location, then Django Channels distributes updates to school, bus, and parent views.',
    },
    {
        id: 'attendance', number: '04', title: 'Attendance System',
        category: 'Workflows · Department-level access',
        summary: 'An administrative attendance backend that handles the exceptions as well as the daily clock-in: breaks, corrections, travel requests, and approval steps.',
        context: 'Backend owner · Administrative workflows',
        stack: ['Django / DRF', 'PostgreSQL', 'Role-based access', 'Spreadsheet exports'],
        challenge: 'Represent a working day clearly while giving supervisors and managers a way to review corrections and attendance requests within their departments.',
        approach: 'I implemented the daily attendance lifecycle, working-hour calculations, correction and travel requests, and staged verification. Department-scoped permissions control access, with date-based reporting and spreadsheet exports for administrative work.',
        outcome: 'Daily attendance and exceptional requests have explicit records and review steps, instead of relying on one editable timestamp. This is a separate administrative system from Bus Attendance.',
        diagramDescription: 'Staff record attendance or submit a correction or travel request. Department-scoped supervisor and manager review leads to approved records, working-hour calculations, and reports.',
    },
]

export const additionalProjects: Project[] = [
    {
        id: 'qr-ticketing', number: '05', title: 'QR Ticketing',
        category: 'Django · Ticket operations',
        summary: 'Ticket generation, QR validation, and used-ticket records for event operations, including bulk ZIP exports and attendee details.',
        context: 'Backend development · Event tooling',
        stack: ['Python', 'Django', 'QR generation', 'ZIP exports'],
        challenge: 'Generate tickets in batches and give event staff a direct way to look up and validate a ticket.',
        approach: 'I implemented numbered QR tickets, bulk exports, and validation using ticket identifiers or numbers. The system records when a ticket has been used and can associate it with attendee information.',
        outcome: 'Ticket preparation and validation are supported in one workflow. Ticket identifiers connect the printed code to its stored validation state.',
        diagramDescription: 'Generate and export QR tickets, scan or enter an identifier, then validate the ticket and record its used state.',
    },
    {
        id: 'pdf-generator', number: '06', title: 'Go Print-Sheet Generator',
        category: 'Go tooling · PDF generation',
        summary: 'A print-imposition tool that sorts ticket images, places them on sheets, and combines the result into a printable PDF.',
        context: 'Engineering tooling · Resource-lifetime changes',
        stack: ['Go', 'gofpdf', 'pdfcpu', 'Worker pool'],
        challenge: 'Generate correctly ordered print sheets while managing the lifetime of PDF renderers during large jobs.',
        approach: 'I changed generation from one renderer per worker chunk to a fresh Fpdf instance per sheet. Workers write temporary sheet files; their results are collected in order, merged into chunks, and combined into the final PDF. Preview, grid orientation, margins, and cut marks support print preparation.',
        outcome: 'The renderer now has a smaller unit of work, with temporary files connecting the stages. Merging can still grow with the input size, so I do not describe the whole pipeline as constant-memory or recursively bounded.',
        diagramDescription: 'Images are ordered and assigned to workers. Each sheet gets its own renderer and temporary PDF; sheet files become chunk PDFs, then one final PDF.',
        article: { path: 'posts/pdf-memory/', label: 'Read about the per-sheet renderer change' },
    },
]

export const learningProjects: Project[] = [
    {
        id: 'mango', number: '07', title: 'Mango — Food App Microservices',
        category: 'Course-based learning · C# / .NET',
        summary: 'A course-based food-commerce application I built to learn ASP.NET Core services, checkout workflows, and asynchronous messaging.',
        context: 'Learning project · Built while following a course',
        stack: ['C# / .NET 8', 'ASP.NET Core', 'EF Core / SQL Server', 'Azure Service Bus', 'Stripe'],
        challenge: 'Understand how separate services coordinate product, cart, authentication, orders, and rewards in a commerce workflow.',
        approach: 'Following the course, I implemented services and an MVC frontend using ASP.NET Identity, JWT authentication, and Entity Framework Core. The order service handles Stripe checkout and publishes a reward event after payment; a separate consumer stores the reward record.',
        outcome: 'The project gave me hands-on practice with C# service boundaries, persistence, and messaging. The course provided the architecture and exercises; this entry records my implementation and learning.',
        diagramDescription: 'An MVC client uses product, cart, authentication, and order services. After payment validation, the order service sends a message for a separate rewards consumer.',
    },
]

export const projectArchive = [
    { title: 'Banking App', label: 'Django REST · Account workflows', description: 'An account-focused API covering registration, email OTP verification, JWT cookies, and profiles.', href: 'https://github.com/TaushifReza/banking-app' },
    { title: 'go-social', label: 'Go · PostgreSQL · Redis', description: 'A social API with registration, posts, follows, and Redis-backed profile caching.', href: 'https://github.com/TaushifReza/go-social' },
]

export const principles = [
    { number: '01', title: 'Make correctness deliberate.', text: 'Think through concurrent writes, transaction boundaries, and failure paths. A successful request should leave the data in a state I can explain.', label: 'Transactions & data integrity' },
    { number: '02', title: 'Keep boundaries clear.', text: 'Give services a clear responsibility. Make access rules explicit, keep business logic understandable, and choose complexity only when it earns its place.', label: 'Architecture & access control' },
    { number: '03', title: 'Follow the problem down.', text: 'Trace a failure through the layers before reaching for a workaround. From PDF generation to device messages, understanding the cause gives me a better starting point for a fix.', label: 'Debugging & reliability' },
]

export const experience = [
    { title: 'Software Engineer', organization: 'ING Skill Academy', dates: 'Feb 2024 — Present', description: 'Backend APIs, hardware-integrated attendance, real-time tracking, and QR ticket validation. Deploying systems with Docker on Linux.' },
    { title: 'Backend Developer', organization: 'Prince Lab', dates: 'Sep 2023 — Jan 2024', description: 'Django REST APIs, asynchronous processing with Celery, and JWT authentication. Collaborating through code review and shared architecture decisions.' },
]

export const education = {
    title: 'BSc (Hons) Computing', organization: 'Islington College',
    university: 'London Metropolitan University', dates: 'Feb 2022 — May 2024',
}

export const expertise = [
    { label: 'Backend foundation', values: ['Python', 'Django & Django REST Framework', 'API design & authentication', 'Transactional workflows'] },
    { label: 'Data & background work', values: ['PostgreSQL', 'Redis', 'Celery', 'MQTT & Django Channels in device systems'] },
    { label: 'Systems & deployment', values: ['Docker', 'Linux', 'NGINX'] },
    { label: 'Tools & continued learning', values: ['Go for print and backend tooling', 'C# & ASP.NET Core — course project', 'EF Core, SQL Server & Azure Service Bus — Mango'] },
    { label: 'This portfolio', values: ['React', 'TypeScript', 'Vite'] },
]
