import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { discoveryFiles, renderDocument, renderMigration } from './site-document.mjs';

const root = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
let base = './';
for (let index = 0; index < args.length; index++) {
    const argument = args[index];
    if (argument.startsWith('--base=')) base = argument.slice(7);
    else if (argument === '--base') base = args[++index];
    else throw new Error(`Unsupported build argument: ${argument}`);
}
if (base !== './' && !/^\/(?:[\w-]+\/)*$/.test(base)) throw new Error('Build base must be ./ or an absolute directory path');
const dist = resolve(root, 'dist');
const serverOutput = resolve(root, 'node_modules/.cache/portfolio-prerender');
await build({ root, base, build: { manifest: true } });
await build({
    root, configFile: false, base, plugins: [react()], publicDir: false,
    build: {
        ssr: resolve(root, 'src/entry-server.tsx'), outDir: serverOutput, emptyOutDir: true,
        rolldownOptions: { output: { entryFileNames: 'entry-server.mjs' } },
    },
});
const site = await import(pathToFileURL(resolve(serverOutput, 'entry-server.mjs')).href);
const slugs = new Set();
for (const post of site.posts) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug) || slugs.has(post.slug)) throw new Error('Post slugs must be unique lowercase URL segments');
    slugs.add(post.slug);
    if (!post.title?.trim() || !post.description?.trim() || !Number.isInteger(post.readingMinutes) || post.readingMinutes <= 0) throw new Error(`Invalid post metadata: ${post.slug}`);
    for (const date of [post.publishedAt, post.updatedAt]) {
        if (date && (!/^\d{4}-\d{2}-\d{2}(?:T[^\s]+)?$/.test(date) || Number.isNaN(Date.parse(date)))) throw new Error(`Invalid post date: ${post.slug}`);
    }
}
const manifest = JSON.parse(await readFile(resolve(dist, '.vite/manifest.json'), 'utf8'));
const entry = manifest['index.html'];
if (!entry?.file) throw new Error('Client entry is missing from the build manifest');
const styles = new Set();
const visited = new Set();
function collectStyles(chunk) {
    if (visited.has(chunk.file)) return;
    visited.add(chunk.file);
    for (const file of chunk.css ?? []) styles.add(file);
    for (const imported of chunk.imports ?? []) collectStyles(manifest[imported]);
}
collectStyles(entry);
async function output(path, text) {
    const destination = resolve(dist, path);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, text);
}
for (const route of site.getRoutes()) {
    await output(`${route.path}index.html`, renderDocument(site, route, { script: entry.file, styles: [...styles], base }));
}
for (const slug of ['pdf-memory', 'jwt-jwks']) await output(`writing/${slug}/index.html`, renderMigration(site.origin, slug));
for (const [path, content] of Object.entries(discoveryFiles(site))) await output(path, content);
// This Vite bookkeeping file is an input to generation, not public site content.
await rm(resolve(dist, '.vite'), { recursive: true });
console.log(`Prerendered ${site.getRoutes().length} pages, two legacy migration pages, sitemap, RSS, and robots policy.`);
