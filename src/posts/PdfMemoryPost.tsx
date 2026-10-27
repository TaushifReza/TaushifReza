import { useSiteHref } from '../lib/sitePaths'
import styles from '../pages/Writing.module.css'

function Pipeline() {
    return <figure className={styles.figure}><p className={styles.diagramLabel}>THE IMPLEMENTED PROCESS / SIMPLIFIED</p><ol className={styles.flow}><li><span>01 / PLAN</span><strong>Ordered images → sheets</strong><p>Work out placement and split contiguous sheet ranges between workers.</p></li><li><span>02 / RENDER</span><strong>One renderer per sheet</strong><p>Write temporary one-page PDFs, then merge the sheets for each worker.</p></li><li><span>03 / ASSEMBLE</span><strong>Chunks in their original order</strong><p>Collect worker results by chunk index and merge them into the final PDF.</p></li></ol><figcaption>The number of workers limits concurrent rendering. The merge operations still accept inputs whose size grows with the print job; this is not a constant-memory guarantee.</figcaption></figure>
}

export default function PdfMemoryPost() {
    const siteHref = useSiteHref()
    return <>
        <p className={styles.lead}>The output of a print job is one PDF. That does not mean I need one PDF renderer to stay alive for the whole job.</p>
        <p className={styles.opening}>I built a Go tool that places ticket images onto printable sheets. A useful change in that tool was quite small: instead of reusing a renderer across every sheet in a worker’s chunk, I started a fresh renderer for each sheet and wrote the result to a temporary file.</p>
        <section className={styles.section} aria-labelledby="pdf-job"><h2 id="pdf-job">There is more to the job than drawing an image</h2>
            <p>The tool takes a collection of images and turns them into imposed print sheets. It needs predictable ordering, a grid that fits the paper, margins, and cut marks. A preview mode helps check the arrangement before generating the full output.</p>
            <p>Ordering matters here. A filename sort that puts “10” before “2” would be a bad starting point for numbered tickets. The tool uses natural filename ordering, calculates the sheet arrangement, and divides the resulting sheets into contiguous chunks for workers.</p>
            <p>Memory pressure made me look at the lifetime of the rendering object. The earlier implementation created one <code>gofpdf.Fpdf</code> for an entire worker chunk. Each additional sheet became another page in that same document. The renderer’s lifetime was tied to the amount of work assigned to the worker.</p>
            <Pipeline />
        </section>
        <section className={styles.section} aria-labelledby="pdf-lifetime"><h2 id="pdf-lifetime">Finish the sheet, then start another document</h2>
            <p>The revised implementation creates a new renderer for a single sheet, draws the images and print marks, and writes a one-page PDF. The next sheet starts from a new renderer. After the worker has produced its sheets, a separate PDF merge assembles its chunk.</p>
            <p>That gives the generation stage a smaller unit of work. A renderer no longer needs to represent all the pages in the chunk at once. The completed sheet has a concrete handoff: a file path the next stage can consume.</p>
            <div className={styles.code}><p>SIMPLIFIED RENDERING EXAMPLE</p><pre><code>{`function renderChunk(sheets, temporaryDirectory):
    sheetPaths = []
    for sheet in sheets:
        renderer = newPdfDocument()
        drawSheet(renderer, sheet)
        path = uniqueTemporaryPath(temporaryDirectory)
        writePdf(renderer, path)
        sheetPaths.append(path)

    return mergeSheetFiles(sheetPaths)`}</code></pre></div>
            <p>The important change is where <code>newPdfDocument()</code> sits. The sketch is not the original application code, and it omits error propagation and naming details. It also does not mean the Go process returns memory to the operating system immediately after each iteration. Object lifetime, garbage collection, library allocations, and process memory are related but different things.</p>
        </section>
        <section className={styles.section} aria-labelledby="pdf-workers"><h2 id="pdf-workers">Parallel completion is not page order</h2>
            <p>The worker pool gives multiple chunks a chance to render concurrently. One chunk can finish before another even when it belongs later in the document. I collect the results by chunk index so that completion timing does not decide the final page order.</p>
            <p>This is easy to overlook when every worker returns the same type of value: a path to a valid PDF. A valid file can still be in the wrong position. The work needs an identity that survives the trip through the worker pool.</p>
            <p>The worker count is configurable and checked against available CPUs. That controls how many rendering tasks run at once. It does not make each chunk a fixed size: as the input grows, the number of sheets in a worker’s chunk can grow too.</p>
        </section>
        <section className={styles.section} aria-labelledby="pdf-tradeoffs"><h2 id="pdf-tradeoffs">Temporary files are part of the design</h2>
            <p>Moving completed sheets out of the renderer creates more files and more disk I/O. That is a tradeoff, not free memory management. The job needs enough temporary storage, unique filenames, useful errors when a write fails, and cleanup that also runs when later work fails.</p>
            <p>The tool uses temporary directories with deferred cleanup. I treat those directories as job resources rather than incidental files. If a job is interrupted or a process terminates unexpectedly, ordinary deferred cleanup is not a universal recovery mechanism; operational cleanup still needs consideration.</p>
            <p>Keeping the stages separate also makes failures easier to locate. There is a difference between failing to render a sheet, failing to merge a worker’s sheets, and failing to assemble the final document. I want the error to preserve that distinction.</p>
        </section>
        <section className={styles.section} aria-labelledby="pdf-limits"><h2 id="pdf-limits">A smaller renderer lifetime is not a bound on the whole pipeline</h2>
            <p>The implementation merges sheet files into chunk files, then merges the chunk files into the final PDF. Those are direct pdfcpu merge calls. The current implementation does not use a recursively bounded merge tree.</p>
            <p>That matters because the merge stage has its own resource requirements. Rendering one sheet at a time does not prove that the final merge is constant-memory. I do not have a measured peak-memory comparison or throughput benchmark to attach to this change.</p>
            <p>What I can show is the implementation boundary: a fresh renderer per sheet, temporary intermediates, a limited number of workers, and ordered assembly. If I were evaluating the next improvement, I would measure rendering and merging separately with representative input sizes, and record temporary-storage use as well as memory.</p>
            <p>The habit I took from this work is to follow a resource through the whole pipeline. Finishing one stage in a smaller unit is useful. The next stage still deserves its own limits and measurements.</p>
            <p><a href={siteHref('#pdf-generator-details')}>Read about the Go Print-Sheet Generator ↗</a></p>
        </section>
        <section className={styles.sources} aria-labelledby="pdf-sources"><h2 id="pdf-sources">References</h2><p>Library references for the rendering and merge operations discussed here.</p><ul><li><a href="https://pkg.go.dev/github.com/jung-kurt/gofpdf" target="_blank" rel="noopener noreferrer">gofpdf package documentation ↗</a></li><li><a href="https://pkg.go.dev/github.com/pdfcpu/pdfcpu/pkg/api#MergeCreateFile" target="_blank" rel="noopener noreferrer">pdfcpu merge API ↗</a></li></ul></section>
    </>
}
