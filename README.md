# Ainsley Hughes Real Estate

Production SvelteKit SSR site for Ainsley Hughes, an Ojai-based REALTOR®. The application includes migrated current and legacy articles, local neighborhood content, seller and buyer conversion paths, consent controls, structured data, feeds, secured lead delivery, and Fly.io deployment configuration.

## Local development

Requirements: Node.js 22 and npm.

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

Set `LEAD_WEBHOOK_URL` before testing form delivery in production. Without a webhook, development submissions are logged without contact details and receive a development delivery ID. Production submissions fail explicitly rather than pretending delivery succeeded.

## Content publishing and migration

Current and legacy Squarespace articles live in `src/lib/content/posts.json`. To repeat the authorized import:

```powershell
npm run migrate:content
npm run migrate:assets
```

The content importer follows collection pagination and preserves slugs, dates, authorship, categories, tags, source images, excerpts, and article markup. The asset importer downloads original authorized page and article images into `static/images/migrated`, creates a source manifest, and rewrites article images to local paths. Run the commands in that order. Rich content is sanitized on the server before rendering. The runtime filters future publication dates. After importing, review headings, image alt text, internal links, and any unusual Squarespace blocks before deployment.

Static editorial pages are typed in `src/lib/content/pages.ts`. Add a new one-level page by adding an entry keyed by its URL slug. Dedicated high-conversion pages live in `src/routes`.

### Content publishing

There is no browser admin page or password login. Market updates, existing neighborhood guides,
blog posts, and client reviews are published through the authenticated JSON editorial API. Any
server-to-server service with the app's `EDITOR_API_KEY` can read resources, save drafts, preview,
publish with explicit confirmation, unpublish, and upload images. Configure a separate key for
each Fly app; never place it in frontend code, a URL, or GPT instructions. The API has no
cross-origin browser access. See [the publishing guide](docs/chatgpt-publishing.md) for the Action
schema, content rules, and approval workflow.

Published content uses SQLite at `CONTENT_DB_PATH`; uploaded images use `CONTENT_UPLOAD_DIR`.
Previously published admin-managed content remains available as a read-only baseline, with new
editorial revisions taking precedence. The Fly configuration mounts the `ainsley_data` volume
at `/data`. Keep a single application Machine while using SQLite and include the volume in
the backup plan.

## APIs and discovery

- `POST /api/leads` validates, deduplicates, rate-limits, and forwards contact leads.
- `POST /api/valuation` handles the seller property-review funnel.
- `GET /api/llm-tools?area=ojai` returns sourced general neighborhood context.
- `POST /api/llm-tools` accepts authorized consultation requests using `x-api-key`.
- `GET /api/openapi.json` describes the separate neighborhood/lead tools.
- `GET /api/editorial/openapi.json` describes the bearer-authenticated content publishing Action.
- `/sitemap.xml`, `/rss.xml`, `/robots.txt`, and `/health` are generated or served directly.

Rate limits use Upstash Redis when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are
configured. A process-local limiter is retained for local development and single-Machine deployment;
production logs an explicit warning when the shared limiter is not configured.

## Privacy

Optional analytics and marketing consent default to off. The consent component dispatches a browser `consentchange` event after a choice; load vendor scripts only from a listener that checks the matching category. No analytics or marketing scripts are bundled today. Final policy wording, retention periods, vendors, and regional rules require owner/counsel approval.

## Validation

```powershell
npm run check
npm run lint
npm run test:unit -- --run
npm run build
```

## Fly.io deployment

The `develop` branch deploys to the separate `test-ainsleyhughes` Fly app after a pull
request is merged. A merge into `main` deploys to the `ainsley-hughes` production app.
The workflow checks types, formatting, and unit tests, builds on Fly, and checks `/health`.
Closing a pull request without merging does not deploy. Direct branch pushes do not deploy;
use pull requests for releases. The two apps must have separate volumes, secrets, and content:
a deploy changes code, not the SQLite data or uploaded images stored on each volume.
Both Fly apps and their separate volumes now exist; production has no Machine until its first
deployment.

One-time setup:

1. Create `develop` from `main`. The test app already exists; create the production app
   before merging to `main`:

   ```powershell
   flyctl apps create ainsley-hughes
   ```

2. Create a **separate** persistent volume for production (the test app already has its own):

   ```powershell
   flyctl volumes create ainsley_data --app ainsley-hughes --region lax --size 1
   ```

   Keep each SQLite app at one Machine; multiple Machines cannot safely share this local
   database. Back up the volume before any data migration or manual replacement.

3. Configure runtime secrets **separately for each Fly app**. The two `EDITOR_API_KEY` values
   are already configured on their respective apps; remove obsolete `ADMIN_PASSWORD_HASH` and
   `ADMIN_SESSION_SECRET` secrets when retiring an older deployment. Before production launch,
   configure email delivery ([issue #3](https://github.com/nmgray/ainsleyhughes-website/issues/3)).
   Do not copy test content or put credentials in this repository.

4. The `test` and `production` GitHub environments each have their own app-scoped
   `FLY_API_TOKEN`. Tokens expire October 17, 2027; rotate them before then:

   ```powershell
   flyctl tokens create deploy --app test-ainsleyhughes --expiry 8760h
   flyctl tokens create deploy --app ainsley-hughes --expiry 8760h
   ```

   Copy each token directly into its corresponding GitHub environment secret; do not
   paste tokens into source files or logs. Rotate them before expiry. Optionally require
   approval for the `production` environment; require pull requests on both branches.

5. Merge a pull request into `develop` to verify the test app. Once production is ready,
   merge a pull request into `main`. After checking the production Fly hostname, attach
   both `www.ainsleyhughes.com` and `ainsleyhughes.com` to **production only**, and then
   point DNS at Fly's provided records. The site currently uses the `www` hostname for
   canonical URLs.

   ```powershell
   flyctl certs add www.ainsleyhughes.com --app ainsley-hughes
   flyctl certs add ainsleyhughes.com --app ainsley-hughes
   flyctl certs check www.ainsleyhughes.com --app ainsley-hughes
   flyctl certs check ainsleyhughes.com --app ainsley-hughes
   ```

6. Confirm `/health`, form delivery, editorial API authentication, redirects, canonical URLs,
   and sitemap output on the production hostname before directing visitors there.

Fly deploys with health checks. Inspect releases using `fly releases`; roll back with `fly releases rollback <version>`. Application logs are available through `fly logs`.
The Node adapter derives the public request origin from Fly's trusted `x-forwarded-proto` and
`host` headers. Do not hard-code `ORIGIN`: doing so can make legitimate same-origin browser
requests fail when the Fly preview hostname and production custom domain differ.
