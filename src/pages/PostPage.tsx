import PageLayout from '../components/PageLayout'
import { posts } from '../data/posts'
import { postContent } from '../posts'
import { useSiteHref } from '../lib/sitePaths'
import styles from './Writing.module.css'

export default function PostPage({ slug }: { slug: string }) {
    const siteHref = useSiteHref()
    const post = posts.find((entry) => entry.slug === slug)
    const content = postContent[slug]
    if (!post || !content) throw new Error(`Unknown post: ${slug}`)
    const Body = content.Body
    const metadata = <div className={styles.byline}>
        <a href={siteHref('#approach')}>Taushif Reza</a><span>{post.readingMinutes} min read</span>
        {post.publishedAt && <time dateTime={post.publishedAt}>{new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(post.publishedAt))}</time>}
        {post.updatedAt && <span>Updated <time dateTime={post.updatedAt}>{new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(post.updatedAt))}</time></span>}
        <span className={styles.postTopics}>{post.tags.join(' / ')}</span>
    </div>
    return <PageLayout article eyebrow="Posts / Engineering in practice" title={post.title} description={post.description} metadata={metadata}>
        <div className={styles.articleLayout}>
            <aside className={styles.contents}><nav aria-label="On this page"><p>In this post</p><ol>{content.sections.map((section) => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}</ol></nav></aside>
            <div className={styles.article}><Body /><section className={styles.morePosts} aria-labelledby="more-posts"><h2 id="more-posts">Keep reading</h2><ul>{posts.filter((entry) => entry.slug !== slug).map((entry) => <li key={entry.slug}><a href={siteHref(`posts/${entry.slug}/`)}>{entry.title} <span aria-hidden="true">↗</span></a></li>)}</ul><p><a href={siteHref('posts/')}>← All posts</a></p></section></div>
        </div>
    </PageLayout>
}
