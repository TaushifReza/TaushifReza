import type { Category } from './config'

export interface Ranking { label: Category; score: number }
export interface Classification {
  rankings: Ranking[]
  predictedLabel: Category
  uncertain: boolean
  margin: number
  durationMs: number
  maxInputTokens: number
}
export type WorkerRequest = { type: 'load'; requestId: number } | { type: 'classify'; requestId: number; text: string }
export type WorkerResponse =
  | { type: 'progress'; requestId: number; message: string; progress?: number }
  | { type: 'ready'; requestId: number }
  | { type: 'result'; requestId: number; result: Classification }
  | { type: 'error'; requestId: number; message: string }

export interface EvaluationReport {
  status: 'not-evaluated' | 'complete'
  completedAt?: string
  accuracy?: number
  macroF1?: number
  samples?: number
  uncertainCount?: number
  datasetSha256?: string
  confusionMatrix?: number[][]
  labels?: Category[]
  predictions?: (Classification & { id: string; text: string; label: Category; correct: boolean })[]
}
