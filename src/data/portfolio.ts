import type { ProjectEvidenceItem } from './evidence'

export type ProjectId = 'bus-attendance' | 'intalent' | 'qr-ticketing' | 'pdf-generator'

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
    evidence?: readonly ProjectEvidenceItem[]
}

export const profile = {
    name: 'Taushif Reza',
    role: 'Backend-focused software engineer',
    location: 'Based in Nepal',
    introduction: 'I build the systems behind the experience. Reliable APIs, connected hardware, and real-time software — with care for the details that keep them working.',
    about: 'I’m Taushif, a software engineer based in Nepal. My work lives behind the interface: the API that handles a request, the transaction that protects a record, and the connection that keeps a system in sync.',
    perspective: 'I enjoy making complex requirements understandable, then choosing the simplest architecture that can support them. Python and Django are my foundation; Go gives me another way to think about building.',
    learning: 'Learning toward AI engineering',
    learningDescription: 'I’m building on my backend foundation with machine-learning study, exploring how reliable software can support useful AI systems.',
    links: {
        github: 'https://github.com/TaushifReza',
        linkedin: 'https://www.linkedin.com/in/taushif-reza',
    },
}

export const projects: Project[] = [
    {
        id: 'bus-attendance',
        number: '01',
        title: 'Bus Attendance System',
        category: 'Connected hardware · Real-time systems',
        summary: 'From a tap of an RFID card to a live view of the journey. An attendance and location system connecting physical hardware with the web.',
        context: 'Built at ING Skill Academy',
        stack: ['ESP32', 'RFID / GPS / GSM', 'WebSockets', 'Backend APIs'],
        challenge: 'Connect attendance events and vehicle location from physical devices to a useful, continuously updated web experience.',
        approach: 'I designed and built a four-layer system: Hardware → Communication → Backend → Frontend. ESP32 devices integrate RFID, GPS, and GSM; the backend handles attendance logging and distributes tracking updates through WebSockets.',
        outcome: 'Attendance is logged automatically, while live location updates reach the frontend through WebSockets every five seconds.',
        diagramDescription: 'Four-layer architecture: ESP32 with RFID and GPS hardware sends data through GSM communication to backend attendance and location handling, then WebSockets carry updates to the frontend.',
    },
    {
        id: 'intalent',
        number: '02',
        title: 'inTalent',
        category: 'Service architecture · Authentication',
        summary: 'Backend architecture work across authentication, certification, jobs, and notifications for a hiring and certification platform.',
        context: 'Backend architecture · Design study',
        stack: ['Django / DRF', 'PostgreSQL', 'Redis', 'JWT / JWKS'],
        challenge: 'Reason about clear service boundaries and consistent identity across certification and recruitment workflows.',
        approach: 'I contributed to backend design and implementation discussions covering authentication, certification, jobs, and notifications. My design work included separating token issuance from verification with RSA-signed JWTs and JWKS, plus reasoning through enrollment and application workflows.',
        outcome: 'The design separates identity issuance from service-level verification, giving each backend a clear authentication responsibility. This case study covers architecture contributions and design discussions.',
        diagramDescription: 'Simplified design schematic: authentication provides identity verification for certification, jobs, and notification service boundaries. It describes design discussions rather than a verified deployment topology.',
        article: { path: 'writing/jwt-jwks/', label: 'Explore JWT verification and authorization' },
    },
    {
        id: 'qr-ticketing',
        number: '03',
        title: 'Dynamic QR Ticketing',
        category: 'API design · Real-time validation',
        summary: 'Dynamic QR tickets backed by real-time validation APIs, connecting a ticket scan to a clear validation result.',
        context: 'Built at ING Skill Academy',
        stack: ['REST APIs', 'QR tickets', 'Real-time validation'],
        challenge: 'Give ticketing workflows a dependable way to validate a dynamic QR ticket as it is scanned.',
        approach: 'I developed a Dynamic QR Ticketing System with real-time validation and API design at ING Skill Academy. The central interaction is straightforward: submit a ticket for validation and return a result the scanning interface can use.',
        outcome: 'Real-time validation connects the ticket scan with an API result the scanning interface can act on.',
        diagramDescription: 'Simplified interaction schematic: a QR ticket is scanned, sent to a validation API, and returned as a validation result. It is not an exact deployment map.',
    },
    {
        id: 'pdf-generator',
        number: '04',
        title: 'Go PDF Generator',
        category: 'Memory management · Root-cause debugging',
        summary: 'Making large-batch ticket PDFs manageable by rethinking how sheets are generated and merged.',
        context: 'Go tooling · Engineering case study',
        stack: ['Go', 'Fpdf', 'pdfcpu'],
        challenge: 'A large-batch ticket-imposition tool encountered out-of-memory failures during PDF generation and merging.',
        approach: 'I addressed the memory problem by creating a separate Fpdf instance for each sheet and merging bounded groups recursively with pdfcpu. This keeps the work divided into smaller units instead of retaining one growing document throughout the process.',
        outcome: 'Per-sheet generation and bounded recursive merging resolved the two reported out-of-memory failures. The fix came from changing how much of the document was held in memory at each stage.',
        diagramDescription: 'Simplified processing schematic: generate individual PDF sheets, merge them in bounded groups, then recursively combine groups into the final PDF.',
        article: { path: 'writing/pdf-memory/', label: 'Read the full PDF memory case study' },
    },
]

export const writing = [
    { number: '01', label: 'Go · Bounded resources', title: 'Smaller lifetimes. A more manageable PDF pipeline.', description: 'The generation and merge boundaries behind a fix for two production out-of-memory failures.', path: 'writing/pdf-memory/', format: 'Case study' },
    { number: '02', label: 'JWT · JWKS · Access control', title: 'A valid signature is only the beginning.', description: 'Follow a request from token issuance to permission checks, with four interactive scenarios.', path: 'writing/jwt-jwks/', format: 'Interactive explainer' },
]

export const projectArchive = [
    { title: 'Banking App', label: 'Django REST · Account workflows', description: 'An account-focused API covering registration, email OTP verification, JWT cookies, and profiles.', href: 'https://github.com/TaushifReza/banking-app' },
    { title: 'go-social', label: 'Go · PostgreSQL · Redis', description: 'A social API with registration, posts, follows, and Redis-backed profile caching.', href: 'https://github.com/TaushifReza/go-social' },
]

export const principles = [
    { number: '01', title: 'Make correctness deliberate.', text: 'Think through concurrent writes, transaction boundaries, and failure paths. A successful request should leave the data in a state I can explain.', label: 'Transactions & data integrity' },
    { number: '02', title: 'Keep boundaries clear.', text: 'Give services a clear responsibility. Make access rules explicit, keep business logic understandable, and choose complexity only when it earns its place.', label: 'Architecture & access control' },
    { number: '03', title: 'Follow the problem down.', text: 'Trace a failure through the layers before reaching for a workaround. From PDF memory use to real-time connections, the cause matters more than the symptom.', label: 'Debugging & reliability' },
]

export const experience = [
    { title: 'Software Engineer', organization: 'ING Skill Academy', dates: 'Feb 2024 — Present', description: 'Backend APIs, hardware-integrated attendance, real-time tracking, and QR ticket validation. Deploying systems with Docker on Linux.' },
    { title: 'Backend Developer', organization: 'Prince Lab', dates: 'Sep 2023 — Jan 2024', description: 'Django REST APIs, asynchronous processing with Celery, and JWT authentication. Collaborating through code review and shared architecture decisions.' },
]

export const education = {
    title: 'BSc (Hons) Computing',
    organization: 'Islington College',
    university: 'London Metropolitan University',
    dates: 'Feb 2022 — May 2024',
}

export const expertise = [
    { label: 'Backend foundation', values: ['Python', 'Django', 'Django REST Framework', 'FastAPI'] },
    { label: 'Data & communication', values: ['PostgreSQL', 'Redis', 'REST APIs', 'WebSockets'] },
    { label: 'Security & delivery', values: ['JWT / RBAC', 'Docker', 'Linux', 'NGINX'] },
    { label: 'Beyond the core', values: ['Go for backend tooling', 'React for interfaces', 'Connected hardware'] },
]
