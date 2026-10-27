# GitHub Pages deployment

The deployment target is **https://taushifreza.com.np/**, with GitHub Pages hosting the static build and Cloudflare managing DNS. `www.taushifreza.com.np` will redirect to the apex domain after setup. No container registry, Docker server, or backend is needed.

The repository contains the deployment configuration. Adding this configuration does not publish the new React site or change GitHub/Cloudflare account settings. On 26 October 2026, read-only checks found the four expected apex A records and an HTTPS 200 response served by GitHub; `www` did not resolve. This confirms an existing endpoint, not that the new build is deployed. Recheck current settings and records before making changes. Complete the authenticated setup below, then commit and push the reviewed changes when ready. Do not commit `dist/`, credentials, or private context documents.

## Workflow and build

The Pages workflow checks pull requests, pushes to `main`, and manual runs. Only a successful push to `main` or a manual run explicitly targeting `main` may deploy. It uses Node.js 24 and locked npm dependencies, runs lint and type checking, builds with `--base=/`, audits the output, installs Chromium and its system dependencies, and runs the full Playwright suite against the production build. It uploads only `dist/` for Pages publication. The existing trophy workflow is separate.

The custom domain serves the website at `/`; the repository name is not part of the production path. This differs from the default project URL `https://taushifreza.github.io/TaushifReza/`, which requires a `/TaushifReza/` build base. Configure the custom domain before relying on the root-base production build. Keep the default portable local build and nested-path checks available for development.

The build prerenders five complete public documents: home, the Posts index, and three articles. It also generates sitemap, RSS, robots policy, and two legacy Writing migration documents. A temporary SSR bundle remains beneath ignored `node_modules/.cache/portfolio-prerender`; only final `dist/` is published. Do not add SPA fallback rewrites. Canonical and social URLs identify the custom domain; metadata tests verify images through the local test server rather than depending on a live deployment. Node.js 24+ is required.

The workflow needs no personal access token or Cloudflare API token. Build jobs have read-only repository access; only the deployment job receives Pages write and OIDC permissions. The `github-pages` environment identifies the production deployment.

## 1. Verify domain ownership

In your **GitHub account settings → Pages**, add `taushifreza.com.np` as a verified domain. GitHub displays the exact TXT record name and value to create in Cloudflare. Copy those values exactly; do not invent the token.

In **Cloudflare → taushifreza.com.np → DNS → Records**, add that TXT record. Return to GitHub and complete verification once it resolves. Keep the TXT record permanently. Verification is an account setting, distinct from the repository's custom-domain setting.

## 2. Configure the repository

In **TaushifReza/TaushifReza → Settings → Pages**:

1. Select **GitHub Actions** as the build and deployment source, replacing a previous branch-based source if one is configured. Preserve the existing live site until the reviewed workflow is ready to publish.
2. Set **Custom domain** to `taushifreza.com.np` and save it before pointing web DNS at Pages.
3. Under **Settings → Environments → github-pages**, restrict deployment branches to `main`.

For a custom Actions deployment, GitHub stores the domain in Pages settings; a repository `CNAME` file is not required. Do not bypass the reviewed public-asset allowlist to add one.

## 3. Configure Cloudflare DNS

Inspect existing apex and `www` A, AAAA, and CNAME records before changing them. Replace only confirmed conflicting web records. Preserve MX records, email/verification TXT records, and unrelated subdomains. Existing restrictive CAA records must permit `letsencrypt.org` for GitHub's certificate issuance. Do not add wildcard DNS records.

Confirm the existing apex records match this table; add the missing `www` record. Use **Proxy status: DNS only** (grey cloud) and **TTL: Auto**:

| Type | Name | Content |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `taushifreza.github.io` |

The `www` CNAME target contains neither a scheme nor `/TaushifReza/`. GitHub Pages redirects `www` to the configured apex domain. Cloudflare proxying is deliberately disabled so GitHub handles HTTPS and redirects directly. IPv6 records are not required for this setup; remove or correct an existing conflicting web AAAA record rather than leaving it pointed at an old host.

Check public DNS without accessing account credentials:

```sh
dig taushifreza.com.np A +short
dig taushifreza.com.np AAAA +short
dig www.taushifreza.com.np CNAME +short
dig taushifreza.com.np CAA +short
```

Check the verification TXT using the exact hostname GitHub supplied. DNS updates and certificate provisioning can take up to 24 hours. Once GitHub's certificate is available, enable **Enforce HTTPS** in repository Pages settings. If provisioning fails, inspect conflicting A/AAAA/CNAME records and CAA restrictions before changing unrelated settings.

## 4. Publish the reviewed changes

Commit and push the reviewed source changes to `main` when ready. Alternatively, after the workflow exists on `main`, run it from the **Actions** tab with `main` selected. Pull-request checks do not publish preview sites.

Open the workflow run and confirm both checks and deployment succeed. A successful local build alone does not establish a live deployment. GitHub/Cloudflare account setup requires authenticated access; this repository does not contain credentials or automatically modify DNS.

Only the audited build output is uploaded. Raw AI context documents, the CV, original unused photos, download sidecars, and other repository files must not be served. CI cannot compare exact private contact values from local-only ignored documents absent from its checkout; the build allowlist and general audit checks still apply. Review new public content before publication.

## Verification

Before publishing, run:

```sh
npm ci
npm run lint
npm run typecheck
npm run build -- --base=/
npm run audit:dist
npx playwright install --with-deps chromium
npm run test:e2e
```

After a successful deployment, check the real site separately:

- Apex HTTPS returns the portfolio; HTTP redirects to HTTPS after enforcement is enabled.
- `https://www.taushifreza.com.np/` redirects to `https://taushifreza.com.np/`.
- Home, `/posts/`, `/posts/jwt-jwks/`, `/posts/pdf-memory/`, and `/posts/survey-question-snapshots/` load directly and after refresh. Explicit `index.html` URLs retain directory canonical URLs. Article text, references, and navigation remain readable with JavaScript disabled.
- Old `/writing/pdf-memory/` and `/writing/jwt-jwks/` documents have a visible destination link, new canonical target, and working HTML meta refresh. These are not HTTP 301 responses.
- Sitemap, RSS, robots policy, and JSON-LD identify the same public pages and production URLs; migration/lab URLs are excluded from discovery documents.
- Portrait, favicon, social image, styles, and scripts load without errors. Test keyboard navigation and narrow-mobile layout.
- An unknown page and private/source-document paths return real 404 responses.
- The former `/lab/incident-classifier/` URL returns 404. No model/worker/WebAssembly files or model downloads remain, and reading the site makes no external requests.

After the new site is live, the owner may verify it in Google Search Console, submit `https://taushifreza.com.np/sitemap.xml`, and inspect representative post URLs. This is an optional manual account step; the repository adds no analytics or tracking. Crawlable HTML, references, and accurate structured data improve accessibility to search and AI systems, but do not guarantee indexing, ranking, recommendation, or citation.

Do not run the complete local suite against the live domain: some assertions intentionally check the local server's specific redirect and malformed-path behavior. Use targeted live smoke checks instead. Record actual deployment and live-check results separately; they are not established merely by adding this guide.

## Rollback and maintenance

If a new release breaks the site, revert the relevant source changes through a reviewed commit on `main`; the workflow rebuilds and deploys that version. Do not rewrite Git history or point a deployment at an unreviewed branch. If checks fail before deployment, investigate the failed job; the workflow does not publish that failed build.

Keep the Pages custom-domain setting and verification TXT while the domain is in use. If retiring the site, remove the web DNS records as part of the shutdown so the domain does not remain pointed at an unconfigured Pages site. Preserve unrelated DNS records.

## Official references

- [Custom GitHub Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Verify a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)
- [Configure a custom domain and DNS](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [Secure a Pages site with HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)
- [Troubleshoot domains and CAA restrictions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages)
