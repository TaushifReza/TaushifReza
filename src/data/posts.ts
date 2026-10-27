export interface PostMetadata {
    slug: string
    title: string
    description: string
    tags: string[]
    readingMinutes: number
    publishedAt?: string
    updatedAt?: string
}

// Dates are optional: an unknown original publication date is not a new date.
export const posts: PostMetadata[] = [
    {
        slug: 'jwt-jwks',
        title: 'Verifying JWTs across microservices with JWKS',
        description: 'How I separate token issuance, verification, and permissions across services, with Django examples from my work on inTalent.',
        tags: ['Microservices', 'JWT / JWKS', 'Django'],
        readingMinutes: 6,
    },
    {
        slug: 'pdf-memory',
        title: 'Why I use a fresh PDF renderer for every sheet',
        description: 'A Go print tool, shorter renderer lifetimes, ordered workers, and the tradeoffs that remain when the final output is one PDF.',
        tags: ['Go', 'PDF generation', 'Resource lifetimes'],
        readingMinutes: 5,
    },
    {
        slug: 'survey-question-snapshots',
        title: 'Why I freeze survey questions before collecting responses',
        description: 'Keeping historical responses meaningful when administrators need to edit the questionnaire: a practical backend design from an internal survey system.',
        tags: ['Django', 'Data modelling', 'Survey systems'],
        readingMinutes: 5,
    },
]
