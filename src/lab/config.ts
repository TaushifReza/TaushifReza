export const MODEL = {
  id: 'Xenova/nli-deberta-v3-xsmall',
  revision: '2a4f614a701367a02d51389039afc998faeda637',
  dtype: 'q8',
  libraryVersion: '4.3.1',
  maxTokens: 256,
  maxCharacters: 2000,
  hypothesis: 'This incident concerns {}.',
  minimumScore: 0.5,
  minimumMargin: 0.15,
} as const

export const CATEGORIES = ['Authentication/access control', 'Database', 'Infrastructure', 'Application logic'] as const
export type Category = typeof CATEGORIES[number]
