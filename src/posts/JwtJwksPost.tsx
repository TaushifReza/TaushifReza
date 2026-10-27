import { useState } from 'react'
import { useSiteHref } from '../lib/sitePaths'
import styles from '../pages/Writing.module.css'

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

export default function JwtJwksPost() {
    const siteHref = useSiteHref()
    return <>
        <p className={styles.lead}>Once authentication belongs to one service, every other service still has a decision to make: why should it trust the token attached to this request?</p>
        <p className={styles.opening}>I worked on this boundary in inTalent, where identity, certification, and job applications have separate backend responsibilities. The identity service issues tokens. The services handling business operations verify them and apply their own access rules. Django is the implementation I use here, but the boundary is the same in a service written in another language.</p>
        <section className={styles.section} aria-labelledby="jwt-boundary"><h2 id="jwt-boundary">The token does not get to choose who I trust</h2>
            <p>The identity backend signs access tokens using RS256 and holds the private signing key. It also publishes public verification keys as a JSON Web Key Set, or JWKS. A consuming service can verify a signature without receiving the ability to issue tokens itself.</p>
            <p>That separation is useful, but it is only useful if the consumer already knows which issuer it trusts. I configure the issuer, audience, accepted algorithm, and key source on the service side. The token’s <code>kid</code> identifies a candidate key within that trusted set. It is a lookup hint, not permission to fetch keys from an arbitrary address supplied by the caller.</p>
            <p>JWKS gives the consumer a standard key representation. It does not, on its own, implement a safe rotation policy. Caching, refresh failures, and how long an old key remains acceptable are separate operational decisions.</p>
            <AuthDiagram />
        </section>
        <section className={styles.section} aria-labelledby="jwt-verification"><h2 id="jwt-verification">I want one clear path from token to identity</h2>
            <p>In the Django services, the authentication layer handles verification before the view performs its business operation. That keeps the same checks from being re-created, and gradually diverging, across individual endpoints.</p>
            <p>The useful distinction is between reading a token and accepting it. A JWT payload can be decoded without proving who created it. My consumer needs a valid signature from an allowed key and algorithm, then claims that match this particular service: the expected issuer, the intended audience, an acceptable expiry, and the expected token type.</p>
            <div className={styles.code}><p>SIMPLIFIED VERIFICATION EXAMPLE</p><pre><code>{`policy = service.authentication_policy
key = policy.trusted_jwks.find_key(token.header.kid)

claims = verify_signature_and_claims(
    token,
    key,
    algorithms = policy.allowed_algorithms,
    issuer = policy.issuer,
    audience = policy.audience,
    require = ["exp", "iss", "aud"]
)

require_token_type(claims, "access")
identity = resolve_identity(claims.subject)
return identity`}</code></pre></div>
            <p>This sketch leaves out library-specific errors and key-cache handling. In an implementation, malformed tokens and failed checks must stop authentication; they must not fall through to a partially trusted user. The library’s claim-validation settings need explicit review rather than an assumption that every check is enabled by default.</p>
        </section>
        <section className={styles.section} aria-labelledby="jwt-request"><h2 id="jwt-request">A valid signature can still end in rejection</h2>
            <p>An expired token can have a perfectly valid signature. So can a token intended for a different API. I find it easier to explain the difference by walking through a request than by treating “JWT valid” as one yes-or-no box.</p>
            <JwtStepper />
            <p>The interactive example uses predetermined results. It illustrates the order of the decisions; it does not execute the authentication code or test a live inTalent service.</p>
        </section>
        <section className={styles.section} aria-labelledby="jwt-token-types"><h2 id="jwt-token-types">Access, refresh, and service tokens have different jobs</h2>
            <p>In the identity backend, an access token is used for ordinary authenticated requests. A refresh token is used with the issuer to obtain fresh access credentials. Accepting a refresh token at a normal business endpoint would blur that separation, so the consuming APIs check the token type as well as its signature.</p>
            <p>I also worked on refresh rotation and revocation. A refresh can be consumed transactionally and replaced, while account eligibility and current identity claims are checked again. That is different from instantly invalidating every existing access token across every service. An already-issued access token may remain acceptable until expiry unless the system provides another revocation mechanism.</p>
            <p>Service identities are another boundary. A backend calling another backend should receive explicitly granted service scopes. A trusted service is not automatically an administrator, and a service credential should not silently inherit the permissions of a human user.</p>
        </section>
        <section className={styles.section} aria-labelledby="jwt-permissions"><h2 id="jwt-permissions">Knowing the caller is the start of the access decision</h2>
            <p>After authentication, the service still owns authorization. Can this caller perform this operation? Does the record belong to the relevant organization? Is the operation valid in the record’s current state? Those answers depend on the service’s data and rules.</p>
            <p>For example, a caller allowed to read a certification is not necessarily allowed to issue one. A claim naming the right API does not replace that permission check. I want the request’s identity and its requested action to remain separate inputs to the decision.</p>
            <div className={styles.callout}><span>One detail worth keeping in mind</span><p>A signed JWT is not an encrypted payload. I avoid treating claims as a private place to store application data. Signing lets the consumer check integrity and origin; it does not hide the content from whoever holds the token.</p></div>
            <p>The practical result is a boundary I can follow: the issuer creates identity credentials, the consumer verifies their applicability, and the business service decides what the caller may do.</p>
            <p><a href={siteHref('#intalent-details')}>Read about my backend work on inTalent ↗</a></p>
        </section>
        <section className={styles.sources} aria-labelledby="jwt-sources"><h2 id="jwt-sources">References</h2><p>The examples above are original explanations. These specifications describe the underlying formats and validation guidance.</p><ul><li><a href="https://www.rfc-editor.org/rfc/rfc7519" target="_blank" rel="noopener noreferrer">RFC 7519: JSON Web Token ↗</a></li><li><a href="https://www.rfc-editor.org/rfc/rfc7517" target="_blank" rel="noopener noreferrer">RFC 7517: JSON Web Key ↗</a></li><li><a href="https://www.rfc-editor.org/rfc/rfc8725" target="_blank" rel="noopener noreferrer">RFC 8725: JWT best current practices ↗</a></li></ul></section>
    </>
}
