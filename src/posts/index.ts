import type { ComponentType } from 'react'
import JwtJwksPost from './JwtJwksPost'
import PdfMemoryPost from './PdfMemoryPost'
import SurveySnapshotsPost from './SurveySnapshotsPost'

interface PostContent {
    Body: ComponentType
    sections: { id: string; title: string }[]
}

export const postContent: Record<string, PostContent> = {
    'jwt-jwks': {
        Body: JwtJwksPost, sections: [
            { id: 'jwt-boundary', title: 'Where trust starts' },
            { id: 'jwt-verification', title: 'The verification path' },
            { id: 'jwt-request', title: 'Follow a request' },
            { id: 'jwt-token-types', title: 'Different tokens, different jobs' },
            { id: 'jwt-permissions', title: 'Authorization stays local' },
            { id: 'jwt-sources', title: 'References' },
        ]
    },
    'pdf-memory': {
        Body: PdfMemoryPost, sections: [
            { id: 'pdf-job', title: 'The print job' },
            { id: 'pdf-lifetime', title: 'A renderer per sheet' },
            { id: 'pdf-workers', title: 'Parallel work, ordered output' },
            { id: 'pdf-tradeoffs', title: 'The cost of intermediate files' },
            { id: 'pdf-limits', title: 'What this does not guarantee' },
            { id: 'pdf-sources', title: 'References' },
        ]
    },
    'survey-question-snapshots': {
        Body: SurveySnapshotsPost, sections: [
            { id: 'survey-edit', title: 'When a template changes' },
            { id: 'survey-snapshot', title: 'Copy the meaning, not just the ID' },
            { id: 'survey-round', title: 'The round is the boundary' },
            { id: 'survey-report', title: 'Reporting from the same record' },
            { id: 'survey-tradeoffs', title: 'What snapshots cost' },
            { id: 'survey-sources', title: 'References' },
        ]
    },
}
