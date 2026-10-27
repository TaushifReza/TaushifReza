import PageLayout from '../components/PageLayout'
import { posts } from '../data/posts'
import { useSiteHref } from '../lib/sitePaths'
import styles from './Writing.module.css'

export default function PostsPage() {
    const siteHref = useSiteHref()
    return <PageLayout eyebrow="Posts / Engineering in practice" title="Notes from the work." description="Backend decisions, small tools, and things I’ve learned while building. Written with enough detail to explain the tradeoff, not just the final answer.">
        <div className={styles.collectionIntro}><p>By Taushif Reza</p><a href={siteHref('feed.xml')}>Subscribe via RSS ↗</a></div>
        <ol className={styles.postList}>
            {posts.map((post, index) => <li key={post.slug}>
                <span className={styles.postNumber}>/{String(index + 1).padStart(2, '0')}</span>
                <article><p className={styles.listTags}>{post.tags.join(' / ')}</p><h2><a href={siteHref(`posts/${post.slug}/`)}>{post.title}<span aria-hidden="true"> ↗</span></a></h2><p className={styles.listDescription}>{post.description}</p><p className={styles.reading}>{post.readingMinutes} min read <span>·</span> Engineering post</p></article>
            </li>)}
        </ol>
        <p className={styles.collectionNote}>These posts draw on my own backend work. Examples are written for explanation; private application code and production data stay private.</p>
    </PageLayout>
}
