import { useEffect, useRef, useState } from 'react'
import PageLayout from '../components/PageLayout'
import { MODEL } from '../lab/config'
import evaluationData from '../lab/evaluation-results.json'
import type { Classification, EvaluationReport, WorkerRequest, WorkerResponse } from '../lab/types'
import styles from '../lab/Lab.module.css'

const evaluation = evaluationData as EvaluationReport
const examples = [
  'Customers cannot sign in after their access tokens expire.',
  'The orders query is waiting for a database row lock.',
  'The load balancer has no healthy servers after a network change.',
  'The checkout code applies a discount twice and calculates the wrong total.',
]

type ModelState = 'idle' | 'loading' | 'ready' | 'error'

export default function IncidentClassifierPage() {
  const worker = useRef<Worker | null>(null)
  const requestId = useRef(0)
  const loadingId = useRef<number | null>(null)
  const busyRef = useRef(false)
  const [modelState, setModelState] = useState<ModelState>('idle')
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('Model not loaded. Choose Load model when you are ready to download it.')
  const [error, setError] = useState('')
  const [result, setResult] = useState<Classification | null>(null)
  const [progress, setProgress] = useState<number | undefined>()

  useEffect(() => () => worker.current?.terminate(), [])

  function loadModel() {
    if (loadingId.current !== null || modelState === 'ready') return
    worker.current?.terminate()
    setError('')
    setProgress(undefined)
    setModelState('loading')
    setStatus('Loading the local inference runtime and downloading model files. This can take several minutes.')
    const id = ++requestId.current
    loadingId.current = id
    try {
      const nextWorker = new Worker(new URL('../lab/classifier.worker.ts', import.meta.url), { type: 'module' })
      worker.current = nextWorker
      nextWorker.onmessage = ({ data }: MessageEvent<WorkerResponse>) => {
        if (data.requestId !== requestId.current && data.requestId !== loadingId.current) return
        if (data.type === 'progress') {
          setStatus(data.message)
          setProgress(data.progress)
        } else if (data.type === 'ready') {
          loadingId.current = null
          setModelState('ready')
          setProgress(undefined)
          setStatus('Model ready. Inference runs on your device in a background worker.')
        } else if (data.type === 'result') {
          busyRef.current = false
          setBusy(false)
          setResult(data.result)
          setStatus(data.result.uncertain ? 'Analysis complete: no clear category. Review the ranking below.' : 'Analysis complete. Review the category ranking below.')
        } else {
          const failedLoading = loadingId.current !== null
          loadingId.current = null
          busyRef.current = false
          setBusy(false)
          setError(data.message)
          setProgress(undefined)
          if (failedLoading) setModelState('error')
          setStatus(failedLoading ? 'Model loading failed. You can retry the download.' : 'Analysis failed. Edit the summary or retry.')
        }
      }
      nextWorker.onerror = () => {
        if (worker.current !== nextWorker) return
        loadingId.current = null
        busyRef.current = false
        setBusy(false)
        setModelState('error')
        setError('The background worker could not start or stopped unexpectedly. Reload the model using a browser with WebAssembly support.')
        setStatus('Model unavailable. You can retry loading it.')
      }
      nextWorker.postMessage({ type: 'load', requestId: id } satisfies WorkerRequest)
    } catch {
      loadingId.current = null
      setModelState('error')
      setError('This browser could not create the background worker. Try a current browser with WebAssembly enabled.')
      setStatus('Model unavailable.')
    }
  }

  function classify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busyRef.current) return
    setError('')
    if (!text.trim()) { setError('Enter an incident summary before classifying.'); return }
    if (text.length > MODEL.maxCharacters) { setError('Keep the summary within 2,000 characters.'); return }
    if (modelState !== 'ready' || !worker.current) { setError('Load the model before classifying an incident.'); return }
    busyRef.current = true
    setBusy(true)
    setResult(null)
    setStatus('Analyzing on your device. CPU inference can take time; this page remains usable.')
    worker.current.postMessage({ type: 'classify', requestId: ++requestId.current, text: text.trim() } satisfies WorkerRequest)
  }

  function reset() {
    ++requestId.current
    setText('')
    setError('')
    setResult(null)
    if (busyRef.current) {
      worker.current?.terminate()
      worker.current = null
      busyRef.current = false
      loadingId.current = null
      setBusy(false)
      setModelState('idle')
      setStatus('Reset complete. Reload the model to start another analysis; downloaded files may remain cached.')
    } else if (modelState === 'loading') {
      worker.current?.terminate()
      worker.current = null
      loadingId.current = null
      setModelState('idle')
      setProgress(undefined)
      setStatus('Download cancelled. Files already downloaded may remain cached.')
    } else {
      setStatus(modelState === 'ready' ? 'Summary cleared. Model remains ready.' : 'Summary cleared. Load the model to begin.')
    }
  }

  return <PageLayout eyebrow="AI LAB / 01" title="Incident classifier" description="A small experiment in applying a real pretrained language model to engineering incident summaries. Runs in your browser, with room for uncertainty.">
    <div className={styles.lab}>
      <section className={styles.intro} aria-labelledby="model-heading">
        <div><p className={styles.kicker}>PRETRAINED MODEL · LOCAL INFERENCE</p><h2 id="model-heading">Read the signal.<br /><em>Keep the judgment.</em></h2><p>This zero-shot model ranks four possible categories: authentication/access control, database, infrastructure, and application logic. It suggests a direction for investigation; it cannot diagnose a system.</p></div>
        <div className={styles.modelNote}><h3>Before you load</h3><p>Download about 96 MB of model and tokenizer files from Hugging Face, plus roughly 14–27 MB of runtime files from this site. The first load may take several minutes. Inference uses your device’s CPU and memory.</p><p>Your browser may cache these files. Storage limits, private browsing, or clearing site data can trigger another download.</p><button type="button" className={styles.primary} onClick={loadModel} disabled={modelState === 'loading' || modelState === 'ready'}>{modelState === 'loading' ? 'Loading model…' : modelState === 'ready' ? 'Model loaded' : modelState === 'error' ? 'Retry loading model' : 'Load model'}</button><p className={styles.small}>No model or inference library is requested until you choose to load it.</p></div>
      </section>

      <section className={styles.workspace} aria-labelledby="try-heading">
        <div className={styles.sectionTitle}><span className={styles.kicker}>01 / TRY IT</span><h2 id="try-heading">A summary to investigate.</h2></div>
        <form onSubmit={classify} className={styles.form}>
          <label htmlFor="incident-summary">Incident summary</label>
          <p id="summary-help" className={styles.small}>Use an English summary without private data. Text stays in this tab: it is not sent to an inference API, stored, or used for training. Up to 2,000 characters; the model reads at most 256 tokens per category pair.</p>
          <textarea id="incident-summary" value={text} disabled={busy} onChange={event => { setText(event.target.value); setResult(null) }} maxLength={MODEL.maxCharacters} rows={6} aria-describedby="summary-help summary-count" placeholder="What happened, and what did you observe?" />
          <div className={styles.formFooter}><p id="summary-count" className={styles.small}>{text.length.toLocaleString()} / 2,000 characters</p><div className={styles.actions}><button className={styles.primary} type="submit" disabled={busy || modelState !== 'ready'}>{busy ? 'Analyzing…' : 'Classify incident'}</button><button className={styles.secondary} type="button" onClick={reset}>Reset</button></div></div>
          <div className={styles.examples}><span className={styles.small}>Or try an example:</span>{examples.map((example, index) => <button key={example} type="button" onClick={() => { setText(example); setResult(null); setError('') }} disabled={busy}>Example {index + 1}<span className={styles.exampleText}>{example}</span></button>)}</div>
        </form>
        <div className={styles.status} role="status" aria-live="polite" aria-atomic="true"><span className={styles.statusDot} aria-hidden="true" />{status}</div>
        {progress !== undefined && <progress className={styles.progress} max={100} value={progress} aria-label="Current model file download" />}
        {error && <p className={styles.error} role="alert">{error}</p>}
        {result && <section className={styles.results} aria-labelledby="ranking-heading"><div className={styles.resultHeading}><div><p className={styles.kicker}>CATEGORY RANKING</p><h3 id="ranking-heading">{result.uncertain ? 'No clear category' : result.predictedLabel}</h3></div><p className={styles.small}>{(result.durationMs / 1000).toFixed(1)}s on this device</p></div><p className={styles.small}>Scores are relative to these four labels, not calibrated probabilities or certainty. A leading score below 50% or a gap below 15 percentage points is flagged as unclear.</p><ol className={styles.rankings}>{result.rankings.map(item => <li key={item.label}><div><span>{item.label}</span><span>{(item.score * 100).toFixed(1)}%</span></div><div className={styles.track} aria-hidden="true"><span style={{ width: `${item.score * 100}%` }} /></div></li>)}</ol></section>}
      </section>

      <section className={styles.details} aria-labelledby="evaluation-heading"><div><p className={styles.kicker}>02 / EVALUATION</p><h2 id="evaluation-heading">A small, inspectable benchmark.</h2><p>40 hand-authored synthetic English summaries, with 10 examples per category, were frozen before running the model. These are clean, single-category examples, not production incidents or an independent real-world test.</p>{evaluation.status === 'complete' ? <><dl className={styles.metrics}><div><dt>Top-label accuracy</dt><dd>{((evaluation.accuracy ?? 0) * 100).toFixed(1)}%</dd></div><div><dt>Macro F1</dt><dd>{(evaluation.macroF1 ?? 0).toFixed(3)}</dd></div><div><dt>Flagged unclear</dt><dd>{evaluation.uncertainCount} / {evaluation.samples}</dd></div></dl><p className={styles.small}>Measured {evaluation.completedAt?.slice(0, 10)} using the same browser worker and pinned model. Metrics use the raw top-ranked label even when the interface flags uncertainty.</p>{evaluation.confusionMatrix && evaluation.labels && <div className={styles.tableWrap} role="region" aria-label="Evaluation confusion matrix. Scroll horizontally to view all columns." tabIndex={0}><table><caption>Confusion matrix. Rows: expected category. Columns: predicted category.</caption><thead><tr><th scope="col">Expected / predicted</th>{evaluation.labels.map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{evaluation.confusionMatrix.map((row, index) => <tr key={index}><th scope="row">{evaluation.labels?.[index]}</th>{row.map((count, column) => <td key={column}>{count}</td>)}</tr>)}</tbody></table></div>}{evaluation.predictions && <><p className={styles.small}>Observed errors: {evaluation.predictions.filter(item => !item.correct).length} / {evaluation.samples}. {evaluation.predictions.some(item => !item.correct) ? 'Inspect each mismatch and its scores below.' : 'No top-label errors on this synthetic set; this does not establish real-world reliability.'}</p><details className={styles.predictions}><summary>Inspect all {evaluation.samples} predictions and errors</summary><ol>{evaluation.predictions.map(item => <li key={item.id}><p className={styles.predictionId}>{item.id} · {item.correct ? 'Correct' : 'Error'}{item.uncertain ? ' · Flagged unclear' : ''}</p><p>{item.text}</p><p className={styles.small}>Expected: {item.label}<br />Predicted: {item.predictedLabel} · {(item.rankings[0].score * 100).toFixed(1)}% relative score</p><p className={styles.small}>All scores: {item.rankings.map(rank => `${rank.label}: ${(rank.score * 100).toFixed(1)}%`).join(' · ')}</p></li>)}</ol></details><p className={styles.small}>Frozen dataset SHA-256:<br /><code className={styles.revision}>{evaluation.datasetSha256}</code></p></>}</> : <p className={styles.pending}>This configuration has not been evaluated yet. No accuracy claim is available.</p>}<p className={styles.small}>A small synthetic set can overstate performance. Overlapping categories, terse logs, unfamiliar terms, non-English text, and input truncation can all change the result.</p></div><div><p className={styles.kicker}>03 / HOW IT WORKS</p><h2>A model, not a keyword list.</h2><p>The pretrained natural-language inference model compares your summary against “This incident concerns {'{}'}.” for each category. It ranks their entailment scores. No incident-specific training or fine-tuning was performed.</p><p><a href={`https://huggingface.co/${MODEL.id}/tree/${MODEL.revision}`} target="_blank" rel="noopener noreferrer">Xenova/nli-deberta-v3-xsmall · q8 ONNX</a><br /><a href="https://huggingface.co/cross-encoder/nli-deberta-v3-xsmall" target="_blank" rel="noopener noreferrer">Upstream model · Apache 2.0</a></p><p className={styles.small}>Transformers.js {MODEL.libraryVersion}. Revision <code className={styles.revision}>{MODEL.revision}</code>. WebAssembly, one CPU thread, in a dedicated worker. A model download reveals your IP and file request metadata to its host; your summary remains local.</p></div></section>
    </div>
  </PageLayout>
}
