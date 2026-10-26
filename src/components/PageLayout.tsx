import type { ReactNode } from 'react'
import { siteHref } from '../lib/sitePaths'
import styles from './PageLayout.module.css'

interface PageLayoutProps {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}

export default function PageLayout({ eyebrow, title, description, children }: PageLayoutProps) {
  return <>
    <a className={styles.skipLink} href="#main">Skip to content</a>
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <a className={styles.brand} href={siteHref('')} aria-label="Taushif Reza, home"><span className={styles.monogram}>tr<span>.</span></span><span>Taushif Reza</span></a>
        <nav aria-label="Main navigation"><a href={siteHref('#work')}>Work</a><a href={siteHref('#writing')}>Writing</a><a href={siteHref('lab/incident-classifier/')}>Lab</a><a href={siteHref('#contact')}>Contact</a></nav>
      </div>
    </header>
    <main id="main" tabIndex={-1} className={styles.container}>
      <div className={styles.intro}>
        <a className={styles.back} href={siteHref('')}>← Back to portfolio</a>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1>{title}</h1>
        <p className={styles.description}>{description}</p>
      </div>
      <div className={styles.content}>{children}</div>
    </main>
    <footer className={`${styles.container} ${styles.footer}`}><a href={siteHref('')}>Taushif Reza <span>Software engineer · Nepal</span></a><a href={siteHref('#writing')}>More from the notebook ↗</a></footer>
  </>
}
