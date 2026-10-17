# ChatGPT content publishing

The editorial API updates SQLite content without redeploying. It is limited to sourced
homepage market updates (`market/home`), the five existing neighborhood-guide routes, current
blog articles (`blog/<slug>`), and client reviews (`review/<slug>`). New review IDs begin with
`review-`; existing review IDs are listed by the API. Static pages, layouts, fonts, routes, and
code features remain repository changes that require review and deployment. The old
`/market-stats` gallery redirects to the homepage and is excluded from the sitemap. Existing
published legacy market snapshots are set to draft once when this version starts; the site
shows no market figures until a reviewed update is published.

The site renders published editorial revisions on the server, including blog feeds, RSS, sitemap,
page titles, descriptions, and structured data. Existing imported articles and guide pages are
still the starting content; publishing an editorial revision overrides a particular page without
changing its route or template. An unpublished draft does not change the public page. A prior
revision can be republished, or an override can be unpublished to restore the original content
(or remove a new post, review, or market update). The original HTML of an imported article/guide is
returned as its baseline; replacement bodies use Markdown, rendered by the existing safe article
renderer.

Original client reviews remain in their existing groups; publishing an edit changes that review
without changing its group or ordering. New reviews appear in "Recent Client Experiences."
Reviews require a verifiable HTTPS source link and affirmative republication approval before
publishing. Existing static reviews lack source URLs, so confirm their source and publication
rights before editing them through the Action. As before, no self-serving `Review` structured
data is generated.

## First test deployment

After a pull request is **merged into `develop`**, inspect its GitHub Actions run and confirm
the deploy and health-check steps passed. Direct pushes do not trigger this workflow. Then:

1. Open `https://test-ainsleyhughes.fly.dev/health` and
   `https://test-ainsleyhughes.fly.dev/api/editorial/openapi.json`. Both should respond
   successfully, and the Action schema should describe bearer authentication.
2. Check that `GET /api/editorial` rejects requests without the test key and returns the
   available resources when called with the test key in the Authorization header. Never
   put the key in a URL, issue, or chat.
3. Confirm `/market-stats` redirects to the homepage and old placeholder figures are not
   displayed. Check that published articles and neighborhood guides still load.
4. With explicit owner approval, create a clearly labeled temporary blog draft on the
   **test app only**; preview, publish, check its public page, and unpublish it. Confirm
   that the page disappears. Do not use production content or credentials for this check.

## Configure

1. Back up the test and production Fly volumes. They hold the editorial database and uploaded
   media, and **must remain separate**. Keep the existing single-Machine deployment when using
   SQLite on a Fly volume.
2. Generate a separate random bearer key of at least 32 characters for **each** Fly app and
   configure it as `EDITOR_API_KEY` using Fly secrets. Never put the key in Git, a GPT instruction,
   a chat message, or a browser URL. Without a configured key, the write API returns HTTP 503.
3. Deploy the change to the test app. Register
   `https://test-ainsleyhughes.fly.dev/api/editorial/openapi.json` as a custom GPT Action and
   configure the key in the GPT's **authentication settings** as a bearer token. Only share that
   GPT with Ainsley and the owner. Configure the production Action and separate key only after
   testing the draft, preview, publish, and rollback flow on the test app.
4. Check the public page after publishing: visible text, links, alt text, page title and
   description, mobile layout, and any cited data. Confirm original URLs still work. When
   supplying images, upload only images licensed for this site using the JSON image action
   (`mimeType` and base64 image bytes) and use the returned `/media/` path. Uploads are
   limited to 10 MB and supported image formats. For a review, verify the original source and
   confirm permission to republish before setting `publicationApproved` to true.

The API requires `Authorization: Bearer <key>` for every editorial request. Retrieve available
resources with `GET /api/editorial`, then `GET /api/editorial/{kind}/{slug}` for the original
content, latest published revision, and history. Submit a complete content object and the
current `expectedPublishedRevision` (or `null`) to the resource's `POST` endpoint. Inspect the
saved revision at `GET /api/editorial/{kind}/{slug}/preview?revisionId=<id>`. **Only after explicit
owner approval**, call `POST /api/editorial/{kind}/{slug}/publish` with `revisionId`,
`expectedPublishedRevision`, and `confirm: true`. The publish action can also restore an earlier
revision. `POST /api/editorial/{kind}/{slug}/unpublish` removes an override with the current
revision ID and `confirm: true`. A stale revision returns HTTP 409 rather than overwriting a
newer publication.

Do not let the GPT claim it published a change until the publish response succeeds and the
public URL has been checked. Content changes need no redeploy; adding routes, features, new
templates, or altering the code-defined pages does. There is no `/admin` page or legacy admin
write API. Any server-to-server service may use the app's editorial bearer key, but that key
grants publishing access to all four content types: share it only with trusted services, and
rotate it if access must be revoked. The API does not enable cross-origin browser calls; do
not embed the key in client-side code. Earlier admin-managed records remain readable as
baselines; editorial revisions are their only supported update path.

## GPT instructions

Use the following instructions with the publishing Action:

> You help Ainsley update only homepage market reports, the existing neighborhood guides,
> current blog posts, and client reviews. Read the current resource before drafting. Preserve routes,
> templates, fonts, branding, and canonical URLs. Do not invent market figures, source dates,
> listing claims, or reviews. For market updates, require a real source URL and publication
> date; never reuse the retired market-stats charts. For client reviews, require the source URL
> and explicit republication approval; preserve the exact quote and attribution. Give images
> useful alt text and use only images cleared for this site. Save a draft, show Ainsley its
> text and metadata (and rendered article/guide HTML), and request explicit approval.
> Call publish only after she approves the exact
> revision. If publishing fails, report the error rather than claiming success. Check the
> public URL after publishing. For requests outside these four content types or requests to
> change layouts, routes, or code, use a separate reviewed GitHub/Codex workflow; never
> attempt to change them through the publishing API. Never ask for or repeat an API key.
