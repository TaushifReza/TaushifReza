import { useEffect } from 'react'
import { Arrow, BusDiagram, InTalentDiagram, MiniDiagram, Orbit } from '../components/Diagrams'
import ProjectEvidence from '../components/ProjectEvidence'
import { additionalProjects, education, experience, expertise, learningProjects, principles, profile, projectArchive, projects, type Project } from '../data/portfolio'
import { useSiteHref } from '../lib/sitePaths'
import { posts } from '../data/posts'
import styles from './App.module.css'

function SectionLabel({ number, children }: { number: string; children: React.ReactNode }) {
    return <p className={styles.sectionLabel}><span>{number}</span>{children}</p>
}

function CaseStudy({ project }: { project: Project }) {
    const siteHref = useSiteHref()
    return <details className={styles.caseStudy} id={`${project.id}-details`}>
        <summary><span>Read the engineering notes</span><span className={styles.disclosureIcon} aria-hidden="true" /></summary>
        <div className={styles.caseContent}>
            <p className={styles.caseContext}>{project.context}</p>
            <div><h4>The challenge</h4><p>{project.challenge}</p></div>
            <div><h4>My contribution</h4><p>{project.approach}</p></div>
            <div><h4>The result & context</h4><p>{project.outcome}</p></div>
            <p className={styles.diagramEquivalent}><span>System in words</span>{project.diagramDescription}</p>
            <ProjectEvidence items={project.evidence} />
            {project.article && <a className={styles.articleLink} href={siteHref(project.article.path)}>{project.article.label} <Arrow /></a>}
            <a className={styles.permalink} href={`#${project.id}-details`}>Link to this case study <Arrow diagonal /></a>
        </div>
    </details>
}

function ProjectEntry({ project, featured = false }: { project: Project; featured?: boolean }) {
    return <article id={project.id} className={featured ? styles.featuredProject : styles.project}>
        <div className={styles.projectBody}>
            <div className={styles.projectMeta}><span className={styles.projectNumber}>/{project.number}</span><span>{project.category}</span></div>
            <h3>{project.title}</h3>
            <p className={styles.projectSummary}>{project.summary}</p>
            <ul className={styles.stack} aria-label={`${project.title} technologies`}>{project.stack.map((item) => <li key={item}>{item}</li>)}</ul>
            {project.liveLink && <a className={`${styles.articleLink} ${styles.projectLiveLink}`} href={project.liveLink.href} target="_blank" rel="noopener noreferrer">{project.liveLink.label} <Arrow diagonal /></a>}
            <CaseStudy project={project} />
        </div>
        {project.id === 'bus-attendance' ? <BusDiagram /> : featured ? <InTalentDiagram /> : <MiniDiagram type={project.id} description={project.diagramDescription} />}
    </article>
}

export default function App() {
    const siteHref = useSiteHref()
    useEffect(() => {
        const openFragment = () => {
            let id: string
            try { id = decodeURIComponent(window.location.hash.slice(1)) } catch { return }
            if (!id) return
            const target = document.getElementById(id)
            if (!target) return
            const disclosure = target.closest('details')
            if (disclosure) {
                disclosure.open = true
                requestAnimationFrame(() => target.scrollIntoView({ block: 'start', behavior: 'instant' }))
            }
        }
        openFragment()
        window.addEventListener('hashchange', openFragment)
        return () => window.removeEventListener('hashchange', openFragment)
    }, [])

    return <>
        <a className={styles.skipLink} href="#main">Skip to content</a>
        <header className={styles.header}>
            <div className={styles.headerInner}>
                <a href="#top" className={styles.brand} aria-label="Taushif Reza, back to top"><span className={styles.monogram}>tr<span>.</span></span><span>Taushif Reza</span></a>
                <nav aria-label="Main navigation"><a href="#work">Work</a><a href={siteHref('posts/')}>Posts</a><a className={styles.navContact} href="#contact">Let’s connect <Arrow diagonal /></a></nav>
            </div>
        </header>
        <main id="main" tabIndex={-1}>
            <section className={`${styles.hero} ${styles.container}`} id="top" aria-labelledby="hero-heading">
                <div className={styles.heroContent}>
                    <p className={styles.eyebrow}><span className={styles.locationDot} />SOFTWARE ENGINEER <span className={styles.eyebrowDivider}>/</span> NEPAL</p>
                    <h1 id="hero-heading">Good systems.<br /><em>Thoughtfully built.</em></h1>
                    <p className={styles.introduction}>{profile.introduction}</p>
                    <div className={styles.heroActions}><a className={styles.primaryButton} href="#work">Explore my work <Arrow /></a><a className={styles.textLink} href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">Let’s connect <Arrow diagonal /></a></div>
                </div>
                <figure className={styles.heroGraphic}>
                    <img className={styles.heroPortrait} src={siteHref('bg_remove.png')} alt="Portrait of Taushif Reza" width={419} height={595} loading="eager" fetchPriority="high" decoding="async" />
                    <figcaption className={styles.portraitCaption}><strong>{profile.name}</strong><span>Software Engineer</span></figcaption>
                </figure>
                <div className={styles.heroFoot}><span>Backend engineering <span aria-hidden="true">↔</span> Real-world problems</span><a href="#expertise">Python & Django · Go tooling <Arrow diagonal /></a></div>
            </section>

            <section className={`${styles.work} ${styles.container}`} id="work" aria-labelledby="work-heading">
                <div className={styles.sectionHeader}><div><SectionLabel number="01">SELECTED WORK</SectionLabel><h2 id="work-heading">Behind the interface.</h2></div><p>A few systems I’ve worked on.<br />The decisions behind the details.</p></div>
                {projects.map((project, index) => <ProjectEntry key={project.id} project={project} featured={index === 0} />)}
                <div className={styles.moreWork}><h3 className={styles.subsectionHeading}>More work, different problems.</h3>{additionalProjects.map((project) => <ProjectEntry key={project.id} project={project} />)}</div>
                <div className={styles.learningProjects}><p className={styles.subsectionLabel}>LEARNING BY BUILDING</p><h3 className={styles.subsectionHeading}>Another stack. A different perspective.</h3>{learningProjects.map((project) => <ProjectEntry key={project.id} project={project} />)}</div>
                <div className={styles.archive} aria-labelledby="archive-heading"><div className={styles.archiveHeading}><h3 id="archive-heading">Elsewhere in the workshop.</h3><p>Smaller projects, open source.</p></div><div className={styles.archiveGrid}>{projectArchive.map((project) => <a key={project.title} href={project.href} target="_blank" rel="noopener noreferrer"><span className={styles.archiveMeta}>{project.label}</span><h4>{project.title} <Arrow diagonal /></h4><p>{project.description}</p><span className={styles.repositoryLink}>View repository ↗</span></a>)}</div></div>
            </section>

            <section className={`${styles.writingSection} ${styles.container}`} id="posts" aria-labelledby="posts-heading">
                <span id="writing" className={styles.fragmentAlias} aria-hidden="true" />
                <div className={styles.sectionHeader}><div><SectionLabel number="02">POSTS</SectionLabel><h2 id="posts-heading">Notes from the backend.</h2></div><p>What I built, what I changed,<br />and the reasoning behind it.</p></div>
                <div className={styles.writingGrid}>{posts.slice(0, 3).map((post, index) => <a className={styles.writingCard} key={post.slug} href={siteHref(`posts/${post.slug}/`)}><div className={styles.writingMeta}><span>{post.tags.join(' · ')}</span><span>/0{index + 1}</span></div><h3>{post.title}</h3><p>{post.description}</p><span className={styles.writingFooter}>{post.readingMinutes} min read<Arrow /></span></a>)}</div>
                <a className={styles.allPosts} href={siteHref('posts/')}>View all posts <Arrow /></a>
            </section>

            <section className={styles.approachSection} id="approach" aria-labelledby="approach-heading">
                <div className={styles.container}>
                    <div className={styles.approachIntro}><div><SectionLabel number="03">THE APPROACH</SectionLabel><h2 id="approach-heading">Useful software.<br /><em>Considered decisions.</em></h2></div><div className={styles.aboutCopy}>
                        <div className={styles.aboutIdentity}><strong>{profile.name}</strong><span>Software Engineer</span></div>
                        <p>{profile.about}</p><p>{profile.perspective}</p>
                    </div></div>
                    <div className={styles.principles}>{principles.map((principle) => <article key={principle.number}><span className={styles.principleNumber}>{principle.number} /</span><h3>{principle.title}</h3><p>{principle.text}</p><span className={styles.principleLabel}>{principle.label}</span></article>)}</div>
                    <aside className={styles.learning}><span className={styles.learningSymbol} aria-hidden="true">↗</span><div><h3>{profile.learning}</h3><p>{profile.learningDescription}</p></div><span className={styles.mono}>THE NEXT CHAPTER</span></aside>
                </div>
            </section>

            <section className={`${styles.experienceSection} ${styles.container}`} id="experience" aria-labelledby="experience-heading">
                <div className={styles.experienceHeading}><SectionLabel number="04">ALONG THE WAY</SectionLabel><h2 id="experience-heading">Built on<br /><em>experience.</em></h2><p>Learning by building.<br />Growing through the work.</p></div>
                <div className={styles.timeline}>{experience.map((job, index) => <article className={styles.timelineItem} key={job.organization}><div className={styles.timelineMeta}><span>{job.dates}</span>{index === 0 && <span className={styles.current}>CURRENT</span>}</div><h3>{job.title}</h3><p className={styles.organization}>{job.organization} <span>· Nepal</span></p><p className={styles.jobDescription}>{job.description}</p></article>)}<article className={`${styles.timelineItem} ${styles.education}`}><div className={styles.timelineMeta}><span>{education.dates}</span><span>EDUCATION</span></div><h3>{education.title}</h3><p className={styles.organization}>{education.organization}</p><p className={styles.jobDescription}>{education.university}</p></article></div>
            </section>

            <section className={`${styles.expertiseSection} ${styles.container}`} id="expertise" aria-labelledby="expertise-heading"><div className={styles.sectionHeader}><div><SectionLabel number="05">THE TOOLKIT</SectionLabel><h2 id="expertise-heading">Tools, chosen for the job.</h2></div><p>A strong backend foundation.<br />Room to keep learning.</p></div><div className={styles.expertiseGrid}>{expertise.map((group) => <div className={styles.expertiseGroup} key={group.label}><h3>{group.label}</h3><ul>{group.values.map((value) => <li key={value}>{value}</li>)}</ul></div>)}</div></section>

            <section className={styles.contactSection} id="contact" aria-labelledby="contact-heading"><div className={`${styles.container} ${styles.contactInner}`}><div><SectionLabel number="06">START A CONVERSATION</SectionLabel><h2 id="contact-heading">Good things start<br /><em>with a hello.</em></h2><p>Have an interesting engineering problem,<br className={styles.desktopBreak} /> or just want to exchange ideas? Let’s talk.</p><div className={styles.contactLinks}><a className={styles.primaryButton} href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">Say hello on LinkedIn <Arrow diagonal /></a><a className={styles.textLink} href={profile.links.github} target="_blank" rel="noopener noreferrer">Explore my GitHub <Arrow diagonal /></a></div><nav className={styles.socialLinks} aria-label="More social profiles"><a href={profile.links.x} target="_blank" rel="noopener noreferrer">X <Arrow diagonal /></a><a href={profile.links.bluesky} target="_blank" rel="noopener noreferrer">Bluesky <Arrow diagonal /></a><a href={profile.links.instagram} target="_blank" rel="noopener noreferrer">Instagram <Arrow diagonal /></a></nav></div><div className={styles.contactNote}><span className={styles.contactAsterisk} aria-hidden="true">✳</span><span>Thoughtful code.<br />Clear communication.<br />Always curious.</span><span className={styles.mono}>FROM NEPAL, WITH CARE.</span></div></div></section>
        </main>
        <footer className={`${styles.footer} ${styles.container}`}><a className={styles.footerBrand} href="#top">Taushif Reza<span>Software engineer · Nepal</span></a><div className={styles.footerMiddle}><Orbit compact /><span>Small details. Strong foundations.</span></div><a className={styles.backTop} href="#top">Back to top <span aria-hidden="true">↑</span></a></footer>
    </>
}
