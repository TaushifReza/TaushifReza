import { useEffect } from 'react'
import { Arrow, BusDiagram, MiniDiagram, Orbit } from '../components/Diagrams'
import { education, experience, expertise, principles, profile, projects, type Project } from '../data/portfolio'
import styles from './App.module.css'

function SectionLabel({ number, children }: { number: string; children: React.ReactNode }) {
  return <p className={styles.sectionLabel}><span>{number}</span>{children}</p>
}

function CaseStudy({ project }: { project: Project }) {
  return <details className={styles.caseStudy} id={`${project.id}-details`}>
    <summary><span>Read the engineering notes</span><span className={styles.disclosureIcon} aria-hidden="true" /></summary>
    <div className={styles.caseContent}>
      <p className={styles.caseContext}>{project.context}</p>
      <div><h4>The challenge</h4><p>{project.challenge}</p></div>
      <div><h4>My contribution</h4><p>{project.approach}</p></div>
      <div><h4>The result & context</h4><p>{project.outcome}</p></div>
      <p className={styles.diagramEquivalent}><span>System in words</span>{project.diagramDescription}</p>
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
      <CaseStudy project={project} />
    </div>
    {featured ? <BusDiagram /> : <MiniDiagram type={project.id} description={project.diagramDescription} />}
  </article>
}

export default function App() {
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
        <nav aria-label="Main navigation"><a href="#work">Work</a><a href="#approach">Approach</a><a href="#experience">Experience</a><a className={styles.navContact} href="#contact">Let’s connect <Arrow diagonal /></a></nav>
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
        <div className={styles.heroGraphic}>
          <span className={styles.orbitLabel}>INDEPENDENT PARTS.<br />CONNECTED THINKING.</span>
          <Orbit />
          <div className={styles.orbitCaption}><span className={styles.mono}>SYSTEMS, WITH INTENTION.</span><span>01 — A way of thinking</span></div>
        </div>
        <div className={styles.heroFoot}><span>Backend engineering <span aria-hidden="true">↔</span> Real-world problems</span><a href="#expertise">Python, Django & a little Go <Arrow diagonal /></a></div>
      </section>

      <section className={`${styles.work} ${styles.container}`} id="work" aria-labelledby="work-heading">
        <div className={styles.sectionHeader}><div><SectionLabel number="01">SELECTED WORK</SectionLabel><h2 id="work-heading">Behind the interface.</h2></div><p>A few systems I’ve worked on.<br />The decisions behind the details.</p></div>
        {projects.map((project, index) => <ProjectEntry key={project.id} project={project} featured={index === 0} />)}
      </section>

      <section className={styles.approachSection} id="approach" aria-labelledby="approach-heading">
        <div className={styles.container}>
          <div className={styles.approachIntro}><div><SectionLabel number="02">THE APPROACH</SectionLabel><h2 id="approach-heading">Useful software.<br /><em>Considered decisions.</em></h2></div><div className={styles.aboutCopy}><p>{profile.about}</p><p>{profile.perspective}</p></div></div>
          <div className={styles.principles}>{principles.map((principle) => <article key={principle.number}><span className={styles.principleNumber}>{principle.number} /</span><h3>{principle.title}</h3><p>{principle.text}</p><span className={styles.principleLabel}>{principle.label}</span></article>)}</div>
          <aside className={styles.learning}><span className={styles.learningSymbol} aria-hidden="true">↗</span><div><h3>{profile.learning}</h3><p>{profile.learningDescription}</p></div><span className={styles.mono}>THE NEXT CHAPTER</span></aside>
        </div>
      </section>

      <section className={`${styles.experienceSection} ${styles.container}`} id="experience" aria-labelledby="experience-heading">
        <div className={styles.experienceHeading}><SectionLabel number="03">ALONG THE WAY</SectionLabel><h2 id="experience-heading">Built on<br /><em>experience.</em></h2><p>Learning by building.<br />Growing through the work.</p></div>
        <div className={styles.timeline}>{experience.map((job, index) => <article className={styles.timelineItem} key={job.organization}><div className={styles.timelineMeta}><span>{job.dates}</span>{index === 0 && <span className={styles.current}>CURRENT</span>}</div><h3>{job.title}</h3><p className={styles.organization}>{job.organization} <span>· Nepal</span></p><p className={styles.jobDescription}>{job.description}</p></article>)}<article className={`${styles.timelineItem} ${styles.education}`}><div className={styles.timelineMeta}><span>{education.dates}</span><span>EDUCATION</span></div><h3>{education.title}</h3><p className={styles.organization}>{education.organization}</p><p className={styles.jobDescription}>{education.university}</p></article></div>
      </section>

      <section className={`${styles.expertiseSection} ${styles.container}`} id="expertise" aria-labelledby="expertise-heading"><div className={styles.sectionHeader}><div><SectionLabel number="04">THE TOOLKIT</SectionLabel><h2 id="expertise-heading">Tools, chosen for the job.</h2></div><p>A strong backend foundation.<br />Room to keep learning.</p></div><div className={styles.expertiseGrid}>{expertise.map((group) => <div className={styles.expertiseGroup} key={group.label}><h3>{group.label}</h3><ul>{group.values.map((value) => <li key={value}>{value}</li>)}</ul></div>)}</div></section>

      <section className={styles.contactSection} id="contact" aria-labelledby="contact-heading"><div className={`${styles.container} ${styles.contactInner}`}><div><SectionLabel number="05">START A CONVERSATION</SectionLabel><h2 id="contact-heading">Good things start<br /><em>with a hello.</em></h2><p>Have an interesting engineering problem,<br className={styles.desktopBreak} /> or just want to exchange ideas? Let’s talk.</p><div className={styles.contactLinks}><a className={styles.primaryButton} href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">Say hello on LinkedIn <Arrow diagonal /></a><a className={styles.textLink} href={profile.links.github} target="_blank" rel="noopener noreferrer">Explore my GitHub <Arrow diagonal /></a></div></div><div className={styles.contactNote}><span className={styles.contactAsterisk} aria-hidden="true">✳</span><span>Thoughtful code.<br />Clear communication.<br />Always curious.</span><span className={styles.mono}>FROM NEPAL, WITH CARE.</span></div></div></section>
    </main>
    <footer className={`${styles.footer} ${styles.container}`}><a className={styles.footerBrand} href="#top">Taushif Reza<span>Software engineer · Nepal</span></a><div className={styles.footerMiddle}><Orbit compact /><span>Small details. Strong foundations.</span></div><a className={styles.backTop} href="#top">Back to top <span aria-hidden="true">↑</span></a></footer>
  </>
}
