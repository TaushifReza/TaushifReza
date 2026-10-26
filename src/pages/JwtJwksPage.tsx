import { useState } from 'react'
import PageLayout from '../components/PageLayout'
import { siteHref } from '../lib/sitePaths'
import styles from './Writing.module.css'

type Scenario = 'valid' | 'expired' | 'wrong-audience' | 'permission-denied'
const scenarios: Record<Scenario, string> = { valid: 'Valid request', expired: 'Expired token', 'wrong-audience': 'Wrong audience', 'permission-denied': 'Permission denied' }
const steps = ['Token issuance', 'Signature verification', 'Claim validation', 'Authorization']

function getStep(scenario: Scenario, step: number) {
  if (step === 0) return { status: 'Issued / not yet trusted by the service', title: 'The issuer signs a token.', text: 'In this example, the identity service uses a private signing key. The token identifies a subject and intended audience. The resource service still has to verify it.' }
  if (step === 1) return { status: 'Signature check / illustrative pass', title: 'The service verifies the signature.', text: 'A configured issuer publishes public keys in its JWKS. The service uses the key ID to find an allowed verification key, then checks the signature using its allowed algorithm. Reading the payload alone proves nothing.' }
  if (step === 2 && scenario === 'expired') return { status: 'Rejected / expired token', title: 'The token has expired.', text: 'The synthetic token’s expiration is before the fixed evaluation time. Its signature can still be valid, but the request fails authentication. Authorization is not evaluated.' }
  if (step === 2 && scenario === 'wrong-audience') return { status: 'Rejected / audience mismatch', title: 'This token belongs to another service.', text: 'The token names the jobs API; this request targets the certification API. Even with a valid signature and trusted issuer, the audience check fails. Authorization is not evaluated.' }
  if (step === 2) return { status: 'Claim checks / illustrative pass', title: 'The claims match this request.', text: 'The issuer matches the service’s configured issuer, the audience includes this API, and expiration is after the fixed evaluation time. These checks establish the token’s applicability before permissions are considered.' }
  if (scenario === 'permission-denied') return { status: 'Denied / authenticated, not authorized', title: 'A known identity still needs permission.', text: 'Authentication passed, but this subject lacks certification:issue. The service refuses the operation. A valid token does not grant every action or access to every record.' }
  return { status: 'Allowed / required permission present', title: 'The operation is authorized.', text: 'The synthetic subject has certification:issue. This example permits the request. A real service must also apply its resource, tenant, and other business rules.' }
}

function JwtStepper() {
  const [scenario, setScenario] = useState<Scenario>('valid')
  const [step, setStep] = useState(0)
  const lastStep = scenario === 'expired' || scenario === 'wrong-audience' ? 2 : 3
  const current = getStep(scenario, step)
  function reset() { setScenario('valid'); setStep(0) }
  return <section className={styles.demo} aria-labelledby="jwt-demo-heading">
    <div className={styles.demoHeading}><h3 id="jwt-demo-heading">Follow a request.</h3><span>INTERACTIVE EXPLANATION<br />NO CRYPTOGRAPHY RUNS</span></div>
    <p>Static synthetic fixtures, a fixed evaluation time, and predetermined outcomes. No real token, signing key, or network request is used.</p>
    <label className={styles.selectLabel} htmlFor="jwt-scenario">Scenario<select id="jwt-scenario" value={scenario} onChange={(event) => { setScenario(event.target.value as Scenario); setStep(0) }}>{Object.entries(scenarios).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    <ol className={styles.steps} aria-label="Request validation stages">{steps.map((label, index) => <li key={label} aria-current={index === step ? 'step' : undefined}><span>0{index + 1}{index > lastStep ? ' / NOT REACHED' : ''}</span>{label}</li>)}</ol>
    <div className={styles.stepResult} role="status" aria-live="polite" aria-atomic="true"><p className={styles.stepStatus}>Step {step + 1} of {steps.length} · {current.status}</p><h4>{current.title}</h4><p>{current.text}</p></div>
    <dl className={styles.fixture}><div><dt>Synthetic issuer (iss)</dt><dd>identity.demo.invalid</dd></div><div><dt>Audience (aud)</dt><dd>{scenario === 'wrong-audience' ? 'jobs-api' : 'certification-api'}</dd></div><div><dt>Expiration / fixed evaluation time</dt><dd>{scenario === 'expired' ? '11:00 UTC / 12:00 UTC' : '13:00 UTC / 12:00 UTC'}<br />Same illustrative day</dd></div><div><dt>Permission / requested action</dt><dd>{scenario === 'permission-denied' ? 'certification:read' : 'certification:issue'}<br />Requested: certification:issue</dd></div></dl>
    <div className={styles.controls}><button type="button" disabled={step === 0} onClick={() => setStep(step - 1)}>← Previous</button><button type="button" disabled={step >= lastStep} onClick={() => setStep(step + 1)}>Next step →</button><button type="button" onClick={reset}>Reset</button></div>
  </section>
}

function AuthDiagram() {
  return <figure className={styles.figure}><p className={styles.diagramLabel}>CONCEPTUAL TRUST BOUNDARY / RSA-SIGNED TOKEN EXAMPLE</p>
    <svg className={styles.authDrawing} viewBox="0 0 760 225" role="img" aria-labelledby="auth-title auth-desc"><title id="auth-title">Issuing identity and checking access are separate responsibilities</title><desc id="auth-desc">An identity service signs a token with a private key. A resource service uses a public key from the configured issuer’s JWKS to verify its signature, validates claims, and checks permissions before allowing access.</desc>
      <rect x="12" y="28" width="200" height="159" rx="2" fill="#e4ddec" stroke="currentColor" /><text x="112" y="60" textAnchor="middle" fontSize="14" fill="currentColor">Identity service</text><text x="112" y="95" textAnchor="middle" fontSize="12" fill="currentColor">Private key → sign</text><path d="M35 113H189" stroke="currentColor" /><text x="112" y="143" textAnchor="middle" fontSize="12" fill="currentColor">JWKS → public keys</text>
      <path d="M212 80H345M212 149H345" stroke="currentColor" fill="none" /><path d="m337 75 8 5-8 5m0 59 8 5-8 5" stroke="currentColor" fill="none" /><text x="275" y="66" textAnchor="middle" fontSize="11" fill="currentColor">Signed token</text><text x="275" y="173" textAnchor="middle" fontSize="11" fill="currentColor">Trusted key source</text>
      <rect x="345" y="28" width="403" height="159" rx="2" fill="#f6f5f1" stroke="currentColor" /><text x="546" y="60" textAnchor="middle" fontSize="14" fill="currentColor">Resource service</text><text x="369" y="95" fontSize="12" fill="currentColor">1. Verify signature with allowed public key</text><text x="369" y="124" fontSize="12" fill="currentColor">2. Check issuer, audience, expiration</text><text x="369" y="153" fontSize="12" fill="currentColor">3. Apply permissions and resource rules</text>
    </svg><ol className={styles.mobileMerge} aria-label="Identity and access boundaries"><li><span>01 / IDENTITY SERVICE</span><strong>Private key signs the token.</strong><p>The configured issuer publishes public verification keys through its JWKS.</p></li><li><span>02 / RESOURCE SERVICE</span><strong>Verify, then validate claims.</strong><p>Use an allowed key and algorithm. Check issuer, audience, and expiration.</p></li><li><span>03 / ACCESS DECISION</span><strong>Apply permissions.</strong><p>Check whether this identity may act on this resource.</p></li></ol><figcaption><strong>System in words.</strong> Signing stays with the issuer. Resource services receive verification keys through a trusted JWKS source, validate the token, then decide whether the specific operation is allowed. This is an educational design, not a deployment map.</figcaption>
  </figure>
}

export default function JwtJwksPage() {
  return <PageLayout eyebrow="Engineering notes / Identity · Access" title="A valid signature is only the beginning." description="An interactive walk through JWT issuance, JWKS verification, claim validation, and the separate decision to authorize a request.">
    <article className={styles.article}>
      <div className={styles.meta}><span>EDUCATIONAL DESIGN STUDY</span><span>JWT / JWKS / Authorization</span><span>Four synthetic request scenarios</span></div>
      <p className={styles.lead}>A service needs to answer two questions: can I trust this identity, and may this identity perform this action?</p>
      <section className={styles.section} aria-labelledby="jwt-boundary"><h2 id="jwt-boundary">Give issuance and verification distinct jobs.</h2><p>In an asymmetric signing design, the issuer holds the private key. A resource service can verify signatures with a public key without gaining the ability to issue tokens. A JWKS is a set of JSON Web Keys; it can publish the issuer’s public verification keys.</p><p>The resource service trusts a configured issuer and key source. A token’s <code>kid</code> helps select a key from that trusted set; it does not establish trust by itself. The service must restrict accepted algorithms and handle key refresh deliberately.</p><AuthDiagram /></section>
      <section className={styles.section} aria-labelledby="jwt-request"><h2 id="jwt-request">Walk through the decisions.</h2><p>Choose a scenario, then move through the request. A failure stops the flow at the relevant check. Previous and reset let you revisit how a successful signature can still lead to rejection.</p><JwtStepper /></section>
      <section className={styles.section} aria-labelledby="jwt-claims"><h2 id="jwt-claims">Claims need context.</h2><p><code>iss</code> identifies the issuer. <code>aud</code> identifies the intended recipient. <code>exp</code> limits the acceptance period. Their presence alone is insufficient: the service checks their values against its own configuration and time policy. Additional required claims depend on the application.</p><p>After authentication, authorization evaluates the requested action and resource. An identity may have read access without permission to issue a certification. Token validity and that permission decision remain separate.</p><div className={styles.callout}><span>Decoded ≠ verified. Signed ≠ confidential.</span><p>Decoding a signed JWT reveals its claims without proving authenticity. A signature protects integrity; it does not hide the payload. Encryption is a separate mechanism. Avoid placing sensitive information in a token on the assumption that signing makes it private.</p></div></section>
      <section className={styles.section} aria-labelledby="jwt-context"><h2 id="jwt-context">A boundary worth making explicit.</h2><p>My inTalent design discussions included separating token issuance from service-level verification using RSA-signed JWTs and JWKS. This example explores that architecture independently, with invented identities and request outcomes. It does not represent a verified production authentication flow.</p></section>
      <section className={styles.sources} aria-labelledby="jwt-sources"><h2 id="jwt-sources">Further reading</h2><ul><li><a href="https://www.rfc-editor.org/rfc/rfc7519" target="_blank" rel="noopener noreferrer">RFC 7519 · JSON Web Token ↗</a></li><li><a href="https://www.rfc-editor.org/rfc/rfc7517" target="_blank" rel="noopener noreferrer">RFC 7517 · JSON Web Key ↗</a></li><li><a href="https://www.rfc-editor.org/rfc/rfc8725" target="_blank" rel="noopener noreferrer">RFC 8725 · JWT best practices ↗</a></li></ul></section>
      <p className={styles.related}><a href={siteHref('#intalent-details')}>← Return to the inTalent design study</a></p>
    </article>
  </PageLayout>
}
