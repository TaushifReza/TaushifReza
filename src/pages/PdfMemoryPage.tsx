import PageLayout from '../components/PageLayout'
import { siteHref } from '../lib/sitePaths'
import styles from './Writing.module.css'

function SheetDiagram() {
  return <figure className={styles.figure}>
    <p className={styles.diagramLabel}>01 / CONCEPTUAL RESOURCE LIFETIMES</p>
    <div className={styles.diagramGrid}>
      <div className={styles.diagramPanel}><h3>The risk: work accumulates</h3>
        <svg viewBox="0 0 330 125" role="img" aria-label="A conceptual growing document retains more sheet data as a batch progresses.">
          <path d="M15 106H315M15 106V12" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M28 99H75V83H122V65H169V47H216V28H299" fill="none" stroke="currentColor" strokeWidth="2" />
          <text x="28" y="22" fontSize="11" fill="currentColor">Retained sheet data</text><text x="225" y="122" fontSize="10" fill="currentColor">Batch progress →</text>
        </svg><p>Keeping a growing document alive can allow sheet data to accumulate.</p>
      </div>
      <div className={styles.diagramPanel}><h3>The change: finish one sheet</h3>
        <svg viewBox="0 0 330 125" role="img" aria-label="Independent sheet lifetimes: start a document, render one sheet, write it, then repeat with a new document.">
          <g stroke="currentColor" fill="none"><path d="M15 106H315M15 106V12" /><path d="M28 99V48H75V99H104V48H151V99H180V48H227V99H256V48H303V99" strokeWidth="2" /></g>
          <text x="28" y="22" fontSize="11" fill="currentColor">Separate sheet lifetimes</text><text x="225" y="122" fontSize="10" fill="currentColor">Batch progress →</text>
        </svg><p>A separate Fpdf instance gives each sheet its own generation lifetime.</p>
      </div>
    </div>
    <figcaption><strong>Conceptual illustration, not a memory profile.</strong> These shapes explain retention and lifetime. They do not reconstruct the old implementation or show measured memory use.</figcaption>
  </figure>
}

function MergeDiagram() {
  return <figure className={styles.figure}>
    <p className={styles.diagramLabel}>02 / BOUNDED MERGING, REPEATED</p>
    <svg className={styles.mergeDrawing} viewBox="0 0 760 290" role="img" aria-labelledby="merge-title merge-desc">
      <title id="merge-title">A conceptual recursive merge tree</title><desc id="merge-desc">Six individual sheet PDFs become three intermediate PDFs in bounded groups. Those intermediates are combined until a final PDF remains. Counts are illustrative.</desc>
      <g stroke="currentColor" strokeWidth="1.5" fill="none"><path d="M55 62V94H125V123M195 62V94H125M310 62V94H380V123M450 62V94H380M565 62V94H635V123M705 62V94H635M125 171V208H380V237M380 171V237M635 171V208H380" /></g>
      {[20, 160, 275, 415, 530, 670].map((x, i) => <g key={x}><rect x={x} y="18" width="70" height="44" rx="2" fill="#f6f5f1" stroke="currentColor" /><text x={x + 35} y="45" textAnchor="middle" fontSize="12" fill="currentColor">Sheet {i + 1}</text></g>)}
      {[65, 320, 575].map((x, i) => <g key={x}><rect x={x} y="123" width="120" height="48" rx="2" fill="#e4ddec" stroke="currentColor" /><text x={x + 60} y="152" textAnchor="middle" fontSize="12" fill="currentColor">Group {i + 1}</text></g>)}
      <rect x="300" y="237" width="160" height="45" rx="2" fill="#6847bd" /><text x="380" y="265" textAnchor="middle" fontSize="13" fill="white">Final PDF</text>
    </svg>
    <ol className={styles.mobileMerge} aria-label="Conceptual bounded merge stages"><li><span>01 / GENERATE</span><strong>Individual sheet PDFs</strong><p>Each sheet is written from its own Fpdf instance.</p></li><li><span>02 / GROUP + REPEAT</span><strong>Intermediate PDFs</strong><p>Merge bounded groups with pdfcpu. Repeat on the outputs as needed.</p></li><li><span>03 / FINISH</span><strong>One final PDF</strong><p>The merge process ends when one output remains.</p></li></ol>
    <figcaption><strong>Conceptual flow; illustrative group sizes.</strong> Individual sheets become intermediate files through bounded pdfcpu merges. Repeat the grouping step on intermediates until one output remains. The diagram does not specify the production batch size or number of levels.</figcaption>
  </figure>
}

export default function PdfMemoryPage() {
  return <PageLayout eyebrow="Engineering notes / Go · Memory" title="Smaller lifetimes. A more manageable PDF pipeline." description="How per-sheet generation and bounded recursive merging addressed two out-of-memory failures in a Go ticket-imposition tool.">
    <article className={styles.article}>
      <div className={styles.meta}><span>CASE STUDY</span><span>Go / Fpdf / pdfcpu</span><span>Conceptual diagrams + explanatory pseudocode</span></div>
      <p className={styles.lead}>A large print job has a simple destination: one PDF. Getting there does not have to mean keeping the whole job alive in memory.</p>
      <section className={styles.section} aria-labelledby="pdf-problem"><h2 id="pdf-problem">Two failures. Two boundaries to reconsider.</h2>
        <p>A Go tool generating large-batch ticket-imposition PDFs encountered two production out-of-memory failures. The documented changes were to create a separate Fpdf instance for each sheet and to merge bounded groups recursively with pdfcpu.</p>
        <p>Both failures were reported as resolved. The useful engineering lesson is in the boundaries: how long a generated document lives, and how much work a merge operation accepts at once.</p>
        <div className={styles.callout}><span>What this case study can establish</span><p>The failures, the two design changes, and the reported resolution are documented. A diagnostic trace, the exact earlier pipeline, and before-and-after memory measurements are unavailable. The illustrations below explain the design reasoning.</p></div>
      </section>
      <section className={styles.section} aria-labelledby="pdf-lifetime"><h2 id="pdf-lifetime">Give each sheet a lifetime of its own.</h2>
        <p>A generation object is also a boundary around the data it retains. When a document grows throughout a batch, its lifetime can become tied to the entire job. A separate Fpdf instance per sheet makes the unit of generation smaller and gives completed sheet output a clear handoff.</p>
        <p>This is a resource-lifetime decision. It does not guarantee an immediate drop in process memory after every sheet; the runtime and library still govern allocation and reclamation.</p>
        <SheetDiagram />
      </section>
      <section className={styles.section} aria-labelledby="pdf-merge"><h2 id="pdf-merge">Keep the merge boundary small, too.</h2>
        <p>Splitting generation leaves another question: how do the sheets become one file? The documented approach uses pdfcpu to merge bounded groups, then repeats the process on the resulting files.</p>
        <p>The same operation can serve every level: take a bounded set of inputs, produce an intermediate, and continue until there is one output. Choosing an input limit constrains one dimension of the work. File sizes and the merge library’s behavior still matter.</p>
        <MergeDiagram />
        <div className={styles.code}><p>EXPLANATORY PSEUDOCODE / NOT THE ORIGINAL IMPLEMENTATION</p><pre><code>{`sheetFiles = []
for each sheet in printJob:
    document = new Fpdf()
    renderSheet(document, sheet)
    sheetFiles.append(writeSheet(document))
    // Next sheet starts with a new document.

files = sheetFiles
while count(files) > 1:
    nextLevel = []
    for group in boundedGroups(files, limit >= 2):
        nextLevel.append(mergeWithPdfcpu(group))
    files = nextLevel

return files[0]`}</code></pre></div>
        <p>This sketch omits empty-input handling, file naming, I/O errors, cancellation, and cleanup. A real implementation also needs an explicit policy for intermediate files and failed jobs.</p>
      </section>
      <section className={styles.section} aria-labelledby="pdf-outcome"><h2 id="pdf-outcome">The outcome, and the habit to keep.</h2>
        <p>Per-sheet Fpdf generation and bounded recursive pdfcpu merging resolved the two reported production OOM failures. There are no published batch sizes, peak-memory figures, or throughput measurements to attach to that result.</p>
        <div className={styles.takeaways}><div><span>01 / LIFETIME</span><h3>Finish a smaller unit.</h3><p>Align an object’s lifetime with the work it needs to represent.</p></div><div><span>02 / BOUNDARY</span><h3>Bound the next stage.</h3><p>A smaller generation step still needs a manageable merge strategy.</p></div><div><span>03 / EVIDENCE</span><h3>Measure the next change.</h3><p>Capture representative input sizes and memory behavior when evaluating a similar pipeline.</p></div></div>
      </section>
      <p className={styles.related}><a href={siteHref('#pdf-generator-details')}>← Return to the Go PDF Generator project</a></p>
    </article>
  </PageLayout>
}
