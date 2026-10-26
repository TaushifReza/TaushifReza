import { useId } from 'react'
import type { ProjectId } from '../data/portfolio'
import styles from '../app/App.module.css'

export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? 'M6 18 18 6M6 6h12v12' : 'M4 12h15m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

export function Orbit({ compact = false }: { compact?: boolean }) {
  const titleId = useId()
  return <svg className={compact ? styles.footerOrbit : styles.orbit} viewBox="0 0 420 350" fill="none" role="img" aria-labelledby={titleId}>
    <title id={titleId}>An orbital line drawing: separate paths connected around a common center.</title>
    <g stroke="currentColor" strokeWidth="1">
      <path d="M210 17v34m0 248v34M49 175H15m390 0h-34" opacity=".35" />
      <circle cx="210" cy="175" r="135" opacity=".2" strokeDasharray="2 7" />
      <circle cx="210" cy="175" r="76" opacity=".18" />
      <ellipse cx="210" cy="175" rx="177" ry="61" transform="rotate(-31 210 175)" />
      <ellipse cx="210" cy="175" rx="177" ry="61" transform="rotate(31 210 175)" />
      <ellipse cx="210" cy="175" rx="61" ry="151" />
      <path d="M203 175h14m-7-7v14" opacity=".6" />
    </g>
    <g fill="currentColor"><circle cx="210" cy="25" r="5" /><circle cx="59" cy="263" r="6" /><circle cx="344" cy="252" r="5" /><circle cx="268" cy="129" r="4" /></g>
    <circle cx="210" cy="175" r="22" fill="var(--paper)" stroke="currentColor" />
    <path d="m199 175 7 7 15-15" stroke="currentColor" strokeWidth="1.6" />
  </svg>
}

export function BusDiagram() {
  const titleId = useId()
  return <figure className={styles.busDiagram}>
    <div className={styles.diagramTop}><span className={styles.mono}>FIG. 01 — SYSTEM MAP</span><span className={styles.diagramBadge}>HARDWARE → WEB</span></div>
    <svg className={styles.busDrawing} viewBox="0 0 480 155" fill="none" role="img" aria-labelledby={titleId}>
      <title id={titleId}>A bus connects to a location signal and a backend, representing hardware-integrated tracking.</title>
      <g stroke="currentColor" strokeWidth="1.5">
        <path d="M34 112h53c35 0 27-68 66-68h135c38 0 23 68 64 68h93" strokeDasharray="4 5" opacity=".5" />
        <path d="M162 76h151v43H162zM171 76V51h116l26 25M183 51v25m28-25v25m29-25v25m28-25v25M162 88h151M171 102h14m102 0h16" />
        <circle cx="193" cy="119" r="13" fill="var(--diagram)" /><circle cx="193" cy="119" r="5" />
        <circle cx="282" cy="119" r="13" fill="var(--diagram)" /><circle cx="282" cy="119" r="5" />
        <path d="M71 55c0 15-19 32-19 32S33 70 33 55a19 19 0 1 1 38 0Z" /><circle cx="52" cy="55" r="6" />
        <circle cx="400" cy="55" r="19" /><path d="m391 55 7 7 12-14M385 30a30 30 0 0 1 32 2m-37-12a43 43 0 0 1 47 3" />
        <path d="M239 19v11m-18-18 6 10m30-10-6 10" opacity=".6" />
      </g>
      <g fill="currentColor"><circle cx="19" cy="112" r="3" /><circle cx="457" cy="112" r="3" /></g>
    </svg>
    <div className={styles.layers}>
      {[
        ['01', 'Hardware', 'ESP32 · RFID · GPS'],
        ['02', 'Communication', 'GSM connectivity'],
        ['03', 'Backend', 'Attendance & location'],
        ['04', 'Frontend', 'WebSocket updates'],
      ].map(([number, title, subtitle]) => <div className={styles.layer} key={number}><span className={styles.layerNumber}>{number}</span><strong>{title}</strong><span>{subtitle}</span></div>)}
    </div>
    <figcaption>Four layers. One connected journey.<span>Simplified architecture schematic</span></figcaption>
  </figure>
}

export function MiniDiagram({ type, description }: { type: ProjectId; description: string }) {
  const titleId = useId()
  return <figure className={`${styles.miniDiagram} ${styles[type]}`}>
    <svg viewBox="0 0 280 150" fill="none" role="img" aria-labelledby={titleId}>
      <title id={titleId}>{description}</title>
      {type === 'intalent' && <>
        <g stroke="currentColor" strokeWidth="1.2"><path d="M140 54v26M51 80h178M51 80v16m89-16v16m89-16v16" /><rect x="96" y="18" width="88" height="36" rx="3" /><rect x="17" y="96" width="68" height="34" rx="3" /><rect x="106" y="96" width="68" height="34" rx="3" /><rect x="195" y="96" width="68" height="34" rx="3" /></g>
        <g fill="currentColor" textAnchor="middle" fontSize="12"><text x="140" y="41">Auth / JWKS</text><text x="51" y="117">Certify</text><text x="140" y="117">Jobs</text><text x="229" y="117">Notify</text></g>
        <circle cx="140" cy="80" r="3" fill="currentColor" />
      </>}
      {type === 'qr-ticketing' && <>
        <g stroke="currentColor" strokeWidth="1.2"><rect x="21" y="35" width="75" height="79" rx="4" /><path d="M31 26h-9a10 10 0 0 0-10 10v9m75-19h9a10 10 0 0 1 10 10v9M31 123h-9a10 10 0 0 1-10-10v-9m75 19h9a10 10 0 0 0 10-10v-9M118 75h45m-7-6 7 6-7 6" /><rect x="177" y="47" width="87" height="55" rx="4" /></g>
        <g fill="currentColor"><path d="M34 48h18v18H34zm5 5v8h8v-8zM64 48h18v18H64zm5 5v8h8v-8zM34 79h18v18H34zm5 5v8h8v-8z" fillRule="evenodd" /><path d="M64 79h7v7h-7zm11 0h7v13h-7zm-11 12h7v7h-7zm11 7h7v6h-7z" /><text x="220" y="70" textAnchor="middle" fontSize="12">Validate</text><text x="220" y="88" textAnchor="middle" fontSize="11">API response</text></g>
      </>}
      {type === 'pdf-generator' && <>
        <g stroke="currentColor" strokeWidth="1.2"><rect x="16" y="25" width="35" height="43" rx="2" /><rect x="16" y="84" width="35" height="43" rx="2" /><rect x="82" y="45" width="40" height="61" rx="2" /><path d="m51 46 31 17M51 105l31-17M123 75h42m-6-6 6 6-6 6" /><rect x="183" y="35" width="67" height="82" rx="3" /><path d="M194 55h30m-30 10h43m-43 10h43m-43 10h43m-43 10h24M25 37h17m-17 9h17m-17 50h17m-17 9h17" /></g>
        <g fill="currentColor"><text x="216" y="139" textAnchor="middle" fontSize="12">Final PDF</text><circle cx="144" cy="75" r="3" /></g>
      </>}
    </svg>
    <figcaption>{type === 'intalent' ? 'Service boundaries · design schematic' : type === 'qr-ticketing' ? 'Validation flow · simplified schematic' : 'Bounded merges · simplified schematic'}</figcaption>
  </figure>
}
