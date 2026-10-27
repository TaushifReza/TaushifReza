import type { ReactNode } from 'react'
import { useSiteHref } from '../lib/sitePaths'
import styles from './PageLayout.module.css'

interface PageLayoutProps {
    eyebrow: string
    title: string
    description: string
    children: ReactNode
    metadata?: ReactNode
    article?: boolean
}

export default function PageLayout({ eyebrow, title, description, children, metadata, article = false }: PageLayoutProps) {
    const siteHref = useSiteHref()
    const Content = article ? 'article' : 'div'
    return <>
        <a className={styles.skipLink} href="#main">Skip to content</a>
        <header className={styles.header}>
            <div className={styles.headerInner}>
                <a className={styles.brand} href={siteHref('')} aria-label="Taushif Reza, home"><span className={styles.monogram}>tr<span>.</span></span><span>Taushif Reza</span></a>
                <nav aria-label="Main navigation"><a href={siteHref('#work')}>Work</a><a href={siteHref('posts/')} aria-current={article ? undefined : 'page'}>Posts</a><a href={siteHref('#contact')}>Contact</a></nav>
            </div>
        </header>
        <main id="main" tabIndex={-1} className={styles.container}>
            <Content>
                <header className={styles.intro}>
                    <a className={styles.back} href={siteHref(article ? 'posts/' : '')}>{article ? '← All posts' : '← Back to portfolio'}</a>
                    <p className={styles.eyebrow}>{eyebrow}</p>
                    <h1>{title}</h1>
                    <p className={styles.description}>{description}</p>
                    {metadata}
                </header>
                <div className={styles.content}>{children}</div>
            </Content>
        </main>
        <footer className={`${styles.container} ${styles.footer}`}><a href={siteHref('')}>Taushif Reza <span>Software engineer · Nepal</span></a><a href={siteHref('posts/')}>Explore all posts ↗</a></footer>
    </>
}
