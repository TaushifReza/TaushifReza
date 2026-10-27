import { useSiteHref } from '../lib/sitePaths'
import styles from '../pages/Writing.module.css'

export default function SurveySnapshotsPost() {
    const siteHref = useSiteHref()
    return <>
        <p className={styles.lead}>An administrator should be able to improve next month’s questionnaire without changing what last month’s answers mean.</p>
        <p className={styles.opening}>That requirement shaped how I built survey rounds in an internal survey backend. The system lets administrators manage projects and questions, send invitations, collect responses, and review reports. I keep the editable questionnaire separate from the question content attached to a generated survey.</p>
        <section className={styles.section} aria-labelledby="survey-edit"><h2 id="survey-edit">An answer is more than a value and a question ID</h2>
            <p>Consider a question asking, “How clear was the onboarding information?” with a five-point answer scale. An answer of <code>4</code> only makes sense alongside the question and the meaning of that scale.</p>
            <p>Now suppose an administrator edits the template to ask about the speed of onboarding instead. If an old response reads its label from the current template, it can appear to answer a different question. No response row changed, but the report changed meaning.</p>
            <p>The same problem applies to smaller edits: renamed options, different labels on the ends of a scale, or reordered questions. Keeping the foreign key is useful for tracing where the question came from. It is not enough to preserve the question as the respondent encountered it.</p>
            <div className={styles.callout}><span>A simple distinction</span><p>The template describes what I want to ask next. The snapshot records what a particular survey was generated to ask. They have different lifetimes, even when their content starts out identical.</p></div>
        </section>
        <section className={styles.section} aria-labelledby="survey-snapshot"><h2 id="survey-snapshot">I copy the question content into the survey round</h2>
            <p>When the backend generates a survey instance, it creates question snapshots for that instance. Those snapshots keep the relevant question text, ordering, and labels. Public rendering uses the generated content rather than rebuilding the form from whatever the template happens to contain today.</p>
            <p>The respondent’s answers belong to that generated survey. The template can continue to evolve, while the generated survey keeps the content it was created with. I do not need a later template lookup to explain an answer.</p>
            <figure className={styles.figure}><p className={styles.diagramLabel}>ONE TEMPLATE, SEPARATE SURVEY ROUNDS</p><div className={styles.snapshotGrid}><div><span>EDITABLE TEMPLATE</span><h3>Current question configuration</h3><p>Changes apply when future rounds are generated.</p></div><div><span>GENERATED ROUND</span><h3>Question snapshots + responses</h3><p>The generated content is used to present questions and interpret answers.</p></div></div><figcaption>Snapshots separate an editable configuration from a survey’s generated content. This diagram is an explanation of the data relationship, not a view of an internal dashboard.</figcaption></figure>
            <div className={styles.code}><p>SIMPLIFIED EXAMPLE / SYNTHETIC QUESTION</p><pre><code>{`templateQuestion = {
    text: "How clear was the onboarding information?",
    labels: { low: "Not clear", high: "Very clear" }
}

snapshot = copyQuestionContent(templateQuestion)
attachToSurvey(surveyRound, snapshot)

// A later template edit does not rewrite the snapshot.
answer = saveAnswer(surveyRound, snapshot, value = 4)
reportRow = { question: snapshot.text, value: answer.value }`}</code></pre></div>
            <p>The copy has to include the content needed to render and interpret the question. Copying the title but continuing to resolve answer labels through the live template would leave the same dependency in a less obvious place.</p>
        </section>
        <section className={styles.section} aria-labelledby="survey-round"><h2 id="survey-round">Generation needs a consistency boundary too</h2>
            <p>The backend generates recurring survey rounds for project and client combinations. A round has a monthly identity, and the database enforces one instance for the relevant project, client, and month combination.</p>
            <p>I use a transaction and a project lock around round generation. The generation operation is idempotent: running it again should recognize the round that already exists rather than produce another set of invitations and snapshots for the same work.</p>
            <p>That is related to snapshots, but it solves a different problem. The snapshot preserves question content. The generation boundary controls which survey instance and question set get created. I need both for a predictable workflow.</p>
            <p>Submission then follows the generated record. Answers are checked against that survey’s question set, and the completed-survey state prevents a later ordinary submission from overwriting the finished responses. The editable template is not the authority for that historical submission.</p>
        </section>
        <section className={styles.section} aria-labelledby="survey-report"><h2 id="survey-report">The form and report should read the same history</h2>
            <p>It would be easy to preserve a snapshot for the respondent and accidentally ignore it in a reporting query. I want both paths to interpret the same generated question content.</p>
            <p>The survey backend includes project dashboards, client histories, and historical calculations. Those views need to keep the question and its labels tied to the right round. Otherwise, a dashboard can make an old answer look current even though the collection flow was correct.</p>
            <p>There is still a product decision when questions change substantially. Preserving two snapshots does not make the answers directly comparable. If one round asks about clarity and another asks about speed, I should not combine them into a single trend simply because they occupy the same position in the template.</p>
            <p>That distinction helps me separate storage correctness from interpretation. The backend can retain what was asked; a report still has to choose comparisons that make sense.</p>
        </section>
        <section className={styles.section} aria-labelledby="survey-tradeoffs"><h2 id="survey-tradeoffs">Snapshots duplicate data, deliberately</h2>
            <p>This design stores repeated question content. It also means a typo fixed in a template is not silently corrected in every generated survey. Those are real costs, but a shared live reference would make history depend on future edits.</p>
            <p>I treat corrections to generated records as a separate operation with its own rules. A snapshot is not a promise that no administrator could ever alter the database. It is an application boundary that prevents normal template editing from rewriting already-generated survey content.</p>
            <p>For this system, that boundary is useful: administrators can prepare the next round, respondents answer the generated questions, and reports can explain an answer using the content attached to its round. I do not have to choose between an editable questionnaire and a readable history.</p>
            <p><a href={siteHref('#survey-details')}>Read about the internal Survey System ↗</a></p>
        </section>
        <section className={styles.sources} aria-labelledby="survey-sources"><h2 id="survey-sources">References</h2><p>The examples are independently written to explain the backend design. Django’s transaction documentation covers the consistency tools mentioned above.</p><ul><li><a href="https://docs.djangoproject.com/en/5.2/topics/db/transactions/" target="_blank" rel="noopener noreferrer">Django database transactions ↗</a></li></ul></section>
    </>
}
