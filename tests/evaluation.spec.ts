import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { CATEGORIES, MODEL, type Category } from '../src/lab/config';
import type { EvaluationReport } from '../src/lab/types';

test('stored model evaluation matches the frozen dataset, configuration, and measured predictions', () => {
  const datasetBytes = readFileSync(new URL('../src/lab/evaluation-dataset.json', import.meta.url));
  const dataset = JSON.parse(datasetBytes.toString()) as { id: string; text: string; label: Category }[];
  const report = JSON.parse(readFileSync(new URL('../src/lab/evaluation-results.json', import.meta.url), 'utf8')) as EvaluationReport & {
    config: typeof MODEL & { categories: Category[]; device: string; numThreads: number; multiLabel: boolean };
    boundaryCheck: { characters: number; maxInputTokens: number; passed: boolean };
  };
  expect(report.status).toBe('complete');
  expect(Number.isFinite(Date.parse(report.completedAt!))).toBe(true);
  expect(report.samples).toBe(40);
  expect(dataset).toHaveLength(40);
  expect(new Set(dataset.map(item => item.id)).size).toBe(40);
  for (const label of CATEGORIES) expect(dataset.filter(item => item.label === label)).toHaveLength(10);
  expect(report.datasetSha256).toBe(createHash('sha256').update(datasetBytes).digest('hex'));
  expect(report.config).toMatchObject({ ...MODEL, categories: [...CATEGORIES], device: 'wasm', numThreads: 1, multiLabel: false });
  expect(report.labels).toEqual([...CATEGORIES]);
  expect(report.boundaryCheck).toMatchObject({ characters: MODEL.maxCharacters, passed: true });
  expect(report.boundaryCheck.maxInputTokens).toBeGreaterThan(0);
  expect(report.boundaryCheck.maxInputTokens).toBeLessThanOrEqual(MODEL.maxTokens);
  const predictions = report.predictions!;
  expect(predictions).toHaveLength(40);
  expect(predictions.map(item => ({ id: item.id, text: item.text, label: item.label }))).toEqual(dataset);
  for (const prediction of predictions) {
    expect(prediction.rankings).toHaveLength(4);
    expect([...new Set(prediction.rankings.map(item => item.label))].sort()).toEqual([...CATEGORIES].sort());
    expect(prediction.rankings.reduce((sum, item) => sum + item.score, 0)).toBeCloseTo(1, 5);
    for (const [index, ranking] of prediction.rankings.entries()) {
      expect(Number.isFinite(ranking.score)).toBe(true);
      expect(ranking.score).toBeGreaterThanOrEqual(0);
      expect(ranking.score).toBeLessThanOrEqual(1);
      if (index) expect(ranking.score).toBeLessThanOrEqual(prediction.rankings[index - 1].score);
    }
    expect(prediction.predictedLabel).toBe(prediction.rankings[0].label);
    expect(prediction.correct).toBe(prediction.predictedLabel === prediction.label);
    expect(prediction.margin).toBeCloseTo(prediction.rankings[0].score - prediction.rankings[1].score, 8);
    expect(prediction.uncertain).toBe(prediction.rankings[0].score < MODEL.minimumScore || prediction.margin < MODEL.minimumMargin);
    expect(prediction.maxInputTokens).toBeGreaterThan(0);
    expect(prediction.maxInputTokens).toBeLessThanOrEqual(MODEL.maxTokens);
    expect(Number.isFinite(prediction.durationMs)).toBe(true);
    expect(prediction.durationMs).toBeGreaterThanOrEqual(0);
  }
  const matrix = CATEGORIES.map(expected => CATEGORIES.map(predicted => predictions.filter(item => item.label === expected && item.predictedLabel === predicted).length));
  expect(report.confusionMatrix).toEqual(matrix);
  expect(report.accuracy).toBeCloseTo(predictions.filter(item => item.correct).length / 40, 10);
  const macroF1 = CATEGORIES.reduce((sum, _, index) => {
    const truePositive = matrix[index][index];
    const expectedCount = matrix[index].reduce((total, count) => total + count, 0);
    const predictedCount = matrix.reduce((total, row) => total + row[index], 0);
    return sum + (2 * truePositive / (expectedCount + predictedCount) || 0);
  }, 0) / CATEGORIES.length;
  expect(report.macroF1).toBeCloseTo(macroF1, 10);
  expect(report.uncertainCount).toBe(predictions.filter(item => item.uncertain).length);
});
