import App from '../app/App'
import PostsPage from '../pages/PostsPage'
import PostPage from '../pages/PostPage'

export interface PageIdentity {
    page: 'home' | 'posts' | 'post'
    slug?: string
}

export default function Page({ page, slug }: PageIdentity) {
    if (page === 'home') return <App />
    if (page === 'posts') return <PostsPage />
    if (!slug) throw new Error('A post slug is required')
    return <PostPage slug={slug} />
}
