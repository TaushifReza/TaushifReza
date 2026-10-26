import { expect, test } from '@playwright/test';
import { createElement, type ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import type { ProjectEvidenceItem } from '../src/data/evidence';

test('optional project evidence renders nothing empty and accessible artifacts when populated', async () => {
  const server = await createServer({
    cacheDir: 'node_modules/.cache/evidence-test-vite',
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true }, appType: 'custom',
  });
  const priorDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', { configurable: true, value: {
    documentElement: { dataset: { siteRoot: '../../' } },
    baseURI: 'https://portfolio.example/portfolio/writing/pdf-memory/index.html',
  } });
  try {
    const { default: ProjectEvidence } = await server.ssrLoadModule('/src/components/ProjectEvidence.tsx') as { default: ComponentType<{ items?: readonly ProjectEvidenceItem[] }> };
    expect(renderToStaticMarkup(createElement(ProjectEvidence))).toBe('');
    expect(renderToStaticMarkup(createElement(ProjectEvidence, { items: [] }))).toBe('');
    const items: ProjectEvidenceItem[] = [
      { kind: 'image', src: 'artifacts/example.webp', alt: 'A fixture dashboard with a route map', width: 800, height: 600, caption: 'Fixture dashboard.' },
      { kind: 'video', src: 'artifacts/example.webm', caption: 'Fixture walkthrough.', transcriptHref: 'artifacts/transcript.txt', captions: { src: 'artifacts/captions.vtt', language: 'en', label: 'English' } },
      { kind: 'link', href: 'https://github.com/TaushifReza', label: 'Fixture source', description: 'Public repository.' },
    ];
    const html = renderToStaticMarkup(createElement(ProjectEvidence, { items }));
    expect(html).toContain('aria-label="Project artifacts"');
    expect(html).toContain('src="/portfolio/artifacts/example.webp"');
    expect(html).toContain('alt="A fixture dashboard with a route map"');
    expect(html).toContain('width="800" height="600" loading="lazy"');
    expect(html).toContain('controls="" preload="metadata"');
    expect(html).toContain('kind="captions" src="/portfolio/artifacts/captions.vtt"');
    expect(html).toContain('href="/portfolio/artifacts/transcript.txt"');
    expect(html).toContain('target="_blank" rel="noopener noreferrer"');
  } finally {
    if (priorDocument) Object.defineProperty(globalThis, 'document', priorDocument);
    else Reflect.deleteProperty(globalThis, 'document');
    await server.close();
  }
});
