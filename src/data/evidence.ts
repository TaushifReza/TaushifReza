/** Public-folder paths, e.g. artifacts/bus-dashboard.webp; omit the hosting prefix. */
export type ProjectArtifactPath = `artifacts/${string}`

/** Add entries only when a real public artifact is available and reviewed. */
export type ProjectEvidenceItem =
  | { kind: 'image'; src: ProjectArtifactPath; alt: string; width: number; height: number; caption: string }
  | { kind: 'video'; src: ProjectArtifactPath; caption: string; transcriptHref: string; captions?: { src: ProjectArtifactPath; language: string; label: string } }
  | { kind: 'link'; href: string; label: string; description?: string }
