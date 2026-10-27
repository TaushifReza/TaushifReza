import { expect, test } from '@playwright/test';
import { createElement, type ComponentType, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import type { ProjectEvidenceItem } from '../src/data/evidence';

test('optional project evidence renders nothing empty and accessible artifacts when populated', async () => {
  const server = await createServer({
    cacheDir: 'node_modules/.cache/evidence-test-vite',
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true }, appType: 'custom',
  });
  try {
    const { default: ProjectEvidence } = await server.ssrLoadModule('/src/components/ProjectEvidence.tsx') as { default: ComponentType<{ items?: readonly ProjectEvidenceItem[] }> };
    const { SitePathProvider } = await server.ssrLoadModule('/src/lib/sitePaths.tsx') as { SitePathProvider: ComponentType<{ siteRoot: string; children?: ReactNode }> };
    const render = (items?: readonly ProjectEvidenceItem[]) => renderToStaticMarkup(createElement(SitePathProvider, { siteRoot: '../../' }, createElement(ProjectEvidence, { items })));
    expect(render()).toBe('');
    expect(render([])).toBe('');
    const items: ProjectEvidenceItem[] = [
      { kind: 'image', src: 'artifacts/example.webp', alt: 'A fixture dashboard with a route map', width: 800, height: 600, caption: 'Fixture dashboard.' },
      { kind: 'video', src: 'artifacts/example.webm', caption: 'Fixture walkthrough.', transcriptHref: 'artifacts/transcript.txt', captions: { src: 'artifacts/captions.vtt', language: 'en', label: 'English' } },
      { kind: 'link', href: 'https://github.com/TaushifReza', label: 'Fixture source', description: 'Public repository.' },
    ];
    const html = render(items);
    expect(html).toContain('aria-label="Project artifacts"');
    expect(html).toContain('src="../../artifacts/example.webp"');
    expect(html).toContain('alt="A fixture dashboard with a route map"');
    expect(html).toContain('width="800" height="600" loading="lazy"');
    expect(html).toContain('controls="" preload="metadata"');
    expect(html).toContain('kind="captions" src="../../artifacts/captions.vtt"');
    expect(html).toContain('href="../../artifacts/transcript.txt"');
    expect(html).toContain('target="_blank" rel="noopener noreferrer"');
    const artifact = /src="([^"]*example.webp)"/.exec(html)![1];
    expect(new URL(artifact, 'https://portfolio.example/portfolio/posts/pdf-memory/').href).toBe('https://portfolio.example/portfolio/artifacts/example.webp');
    expect(render([{ kind: 'image', src: 'artifacts/../private.png', alt: 'Invalid fixture', width: 10, height: 10, caption: 'Not published.' }])).toBe('');
  } finally {
    await server.close();
  }
});
