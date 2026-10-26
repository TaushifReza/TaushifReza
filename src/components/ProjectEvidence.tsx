import type { ProjectEvidenceItem } from '../data/evidence'
import { siteHref } from '../lib/sitePaths'
import styles from './ProjectEvidence.module.css'

function publicHref(href: string) {
  return /^https:\/\//.test(href) ? href : siteHref(href)
}

function isArtifactPath(path: string) {
  return /^artifacts\/[a-zA-Z0-9_./-]+$/.test(path) && !path.split('/').some((part) => !part || part === '..' || part === '.')
}

function ArtifactLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={publicHref(href)} {...(/^https:\/\//.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{children}</a>
}

export default function ProjectEvidence({ items }: { items?: readonly ProjectEvidenceItem[] }) {
  if (!items?.length) return null
  const artifacts = items.filter((item) => item.kind === 'link' || (isArtifactPath(item.src) && (item.kind !== 'video' || !item.captions || isArtifactPath(item.captions.src))))
  if (!artifacts.length) return null
  return <div className={styles.evidence} aria-label="Project artifacts">{artifacts.map((item) => {
    if (item.kind === 'image') return <figure key={item.src}><img src={siteHref(item.src)} alt={item.alt} width={item.width} height={item.height} loading="lazy" decoding="async" /><figcaption>{item.caption}</figcaption></figure>
    if (item.kind === 'video') return <figure key={item.src}><video controls preload="metadata" playsInline aria-label={item.caption}><source src={siteHref(item.src)} />{item.captions && <track kind="captions" src={siteHref(item.captions.src)} srcLang={item.captions.language} label={item.captions.label} default />}</video><figcaption>{item.caption} <ArtifactLink href={item.transcriptHref}>Read the video transcript</ArtifactLink></figcaption></figure>
    return <p key={item.href}><ArtifactLink href={item.href}>{item.label} ↗</ArtifactLink>{item.description && <span>{item.description}</span>}</p>
  })}</div>
}
