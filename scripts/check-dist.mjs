import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { resolve, relative, extname, basename, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { posts } from '../src/data/posts.ts';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, process.argv[2] ?? 'dist');
const failures = [];
const files = [];

function walk(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) walk(path);
        else if (entry.isFile()) files.push(path);
        else failures.push('Distribution contains a non-regular filesystem entry.');
    }
}

const pages = ['index.html', 'posts/index.html', ...posts.map((post) => `posts/${post.slug}/index.html`), 'writing/pdf-memory/index.html', 'writing/jwt-jwks/index.html'];
const discovery = new Set(['sitemap.xml', 'feed.xml', 'robots.txt']);
const publicAssets = new Set(['favicon.svg', 'social-card.svg', 'social-card.png', 'bg_remove.png']);
if (pages.some((page) => !existsSync(join(output, page)))) {
    console.error('Build audit failed: expected multipage HTML output missing. Run npm run build first.');
    process.exit(1);
}
walk(output);
for (const name of discovery) if (!existsSync(join(output, name))) failures.push(`Discovery file missing: ${name}`);

for (const name of publicAssets) {
    const published = join(output, name);
    if (!existsSync(published)) failures.push(`Approved public asset missing: ${name}`);
    else if (!readFileSync(published).equals(readFileSync(join(root, 'public', name)))) {
        failures.push(`Approved public asset was changed during publication: ${name}`);
    }
}

// Contact values are collected only for exact matching and never logged.
// PDF extraction is optional; a missing pdftotext executable limits this check.
const privateInputs = readdirSync(root).filter((name) => /(?:_context\.md|\.pdf)$/i.test(name));
let pdfExamined = false;
const privateContacts = new Set();
for (const name of privateInputs) {
    const path = join(root, name);
    let text = '';
    if (/\.pdf$/i.test(name)) {
        const extraction = spawnSync('pdftotext', [path, '-'], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
        if (extraction.status === 0) {
            text = extraction.stdout;
            pdfExamined = true;
        }
    } else {
        text = readFileSync(path, 'utf8');
    }
    for (const match of text.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)) privateContacts.add(match[0]);
    // Only labelled contact lines yield phone candidates; numeric code is ignored.
    for (const line of text.split('\n').filter((line) => /(?:phone|mobile|contact|tel)\s*[:+]/i.test(line))) {
        for (const match of line.matchAll(/\+?\d[\d ()-]{6,}\d/g)) privateContacts.add(match[0]);
    }
}

for (const file of files) {
    const name = relative(output, file);
    const extension = extname(file);
    if (/(?:^|\/)(?:pp\.jpg|half_body\.jpg|.*:Zone\.Identifier)$/i.test(name)) {
        failures.push(`Unapproved original image or download sidecar in distribution: ${name}`);
    }
    if (/\.(?:pdf|md|docx?|map)$/i.test(name) || /(?:^|\/)(?:AGENTS|README|.*_context)(?:\.|\/)/i.test(name)) {
        failures.push(`Private/source document or source map in distribution: ${name}`);
    }
    const artifact = /^artifacts\/[\w/-]+\.(?:png|jpe?g|webp|svg|mp4|webm|vtt|txt|json)$/.test(name);
    if (!pages.includes(name) && !publicAssets.has(name) && !discovery.has(name) && !artifact && !name.startsWith('assets/')) {
        failures.push(`File is outside the approved page/public/generated-asset manifest: ${name}`);
    }
    if (/\.(?:wasm|onnx)$/i.test(name) || /(?:classifier\.worker|ort-wasm|transformers\.web)/i.test(name)) failures.push(`Removed lab runtime asset in distribution: ${name}`);
    if (!artifact && !['.html', '.js', '.mjs', '.css', '.json', '.svg', '.txt', '.png', '.xml'].includes(extension)) {
        failures.push(`Unexpected distribution file type: ${name}`);
        continue;
    }
    if (['.png', '.jpg', '.jpeg', '.webp', '.mp4', '.webm'].includes(extension)) continue;
    if (statSync(file).size > 10 * 1024 * 1024) {
        failures.push(`Text asset unexpectedly exceeds 10 MiB: ${name}`);
        continue;
    }
    const text = readFileSync(file, 'utf8');
    if (/lab\/incident-classifier|huggingface\.co|onnxruntime/i.test(text)) failures.push(`Removed lab reference in ${name}`);
    // Match protocols at the start of a quoted value, not JS keys such as tel:!0.
    if (/["'`]\s*(?:mailto:|tel:)/i.test(text)) failures.push(`Contact protocol found in ${name}`);
    if (/(?:claude_context|gemini_context|gpt_context|MOHAMMAD TAUSHIF REZA\.CV)/i.test(text)) failures.push(`Private input reference found in ${name}`);
    if (/\b(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})\b/.test(text)) {
        failures.push(`Private-network IPv4 pattern found in ${name}`);
    }
    if ([...privateContacts].some((contact) => text.includes(contact))) failures.push(`Private contact value found in ${name}`);
    if (basename(file) === 'index.html' && /(?:src|href)=["'](?:\/home\/|file:)/i.test(text)) failures.push('Nonportable local path in index.html');
}

if (failures.length) {
    console.error(`Build audit failed (${failures.length} finding(s)):\n${failures.map((failure) => `- ${failure}`).join('\n')}`);
    process.exit(1);
}
console.log(`Build audit passed: ${files.length} output files; expected HTML pages present; no private documents, contact matches, private-network patterns, or local filesystem links detected in scanned text assets.`);
console.log(`PDF contact extraction: ${pdfExamined ? 'examined local PDF input' : 'unavailable; exact PDF contact matching not performed'}. Pattern checks are limited assurance and supplement manual content review.`);
