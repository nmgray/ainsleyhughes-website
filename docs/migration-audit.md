# Migration audit

Audit date: 2026-09-25. Sources: live navigation, page JSON, `sitemap.xml`, `robots.txt`, desktop markup, and collection pagination.

## Inventory

- 72 sitemap URLs: 37 current blog posts, 12 retained legacy posts, three legacy category URLs, and 20 page/index URLs.
- Primary navigation: About, Buy, Sell, Properties, Neighborhoods, Blog, and Contact.
- Identity: Ainsley Hughes; DRE #02105320; Keller Williams World Class; Ojai, California.
- Contact: 805-896-5383 and ainsleyhughes@kw.com.
- Social profiles: Instagram, Facebook, and LinkedIn.
- Cookie UX: Accept all, Decline all, Manage cookies, and persistent Cookie Preferences.
- Core interactions: contact inquiry, seller valuation, buyer consultation, property cards, articles, neighborhood guides, external social/contact links, and responsive navigation.
- Asset migration: 160 original images referenced by the audited routes were downloaded into `static/images/migrated`; runtime pages no longer depend on Squarespace CDN image delivery.

## Route handling

All current and legacy article slugs are imported repeatably and rendered at their original URLs. `/home` redirects permanently to `/`; `/new-gallery` redirects permanently to `/featured-properties`; `/home-five` redirects permanently to `/` because it is an obsolete Squarespace demo template. Legacy category pages remain available but are `noindex`.

The live `/home-five` route contained untouched hospitality-template placeholder copy and was intentionally not migrated. The old gallery contained no crawlable content and was consolidated. Existing `/magazine` labels are retained; original external magazine targets require owner verification because the source JSON did not expose usable crawlable links.

## Integrations requiring owner configuration

- The live contact page reported that its Squarespace form had no storage destination. The replacement refuses success-shaped production responses unless `LEAD_WEBHOOK_URL` is configured.
- KW Command does not provide a universal public webhook contract. Use a reviewed KW-supported Zapier action or an owner-provided endpoint as `LEAD_WEBHOOK_URL`.
- Scheduling is implemented as consultation capture, not a third-party iframe. Add a Calendly/SavvyCal vendor only after the owner selects one and place it behind marketing consent.
- No reliable automated valuation data source was identified. The seller funnel collects details for a personalized CMA instead of presenting a fabricated instant estimate.
- Property availability, prices, magazine links, legal policy text, and review publication rights must receive owner review immediately before launch.

## Acceptance checklist

- SSR HTML, canonical metadata, Open Graph, structured data, sitemap, RSS, robots, future-post filtering, and 301 routes.
- Keyboard-accessible navigation, forms, focus states, reduced-motion support, and equally prominent consent choices.
- Server validation, same-origin checks, honeypot, rate limiting, deduplication, webhook timeout, server-only secrets, and explicit integration errors.
- Docker multi-stage build, non-root runtime, Fly health check, secret instructions, custom-domain steps, logs, and rollback guidance.

## Accessibility and UX audit

Audited on 2026-09-26 against the deployed homepage, contact, seller, reviews, and blog
routes. Lighthouse accessibility scores are 100 for all five audited pages after remediation.
Automated checks were supplemented with keyboard, mobile-width, form, navigation, focus, and
content-hierarchy browser tests.

Remediation completed:

- Increased low-contrast secondary form text from `#777` to `#666`.
- Enlarged contact sidebar links and social controls to meet minimum target sizes.
- Added valid progressbar semantics and current-step text to the two-step valuation form.
- Made the skip-link destination programmatically focusable.
- Added an accurate open/close accessible name to the mobile navigation control.
- Increased mobile body and consent-control text for readability.
- Prevented the floating assistant from competing with or obscuring the mobile consent panel.
- Added regression coverage for horizontal overflow, a single primary heading, mobile text size,
  skip-link behavior, navigation state, and valuation progress semantics.

Automated conformance does not replace testing with disabled users and representative assistive
technologies. Before production launch, complete a short VoiceOver/Safari and NVDA/Chrome review of
navigation, the inquiry form, and the valuation workflow.

## SEO and GEO recommendation status

Implemented in the replacement:

- AI crawlers are allowed and `/llms.txt` provides an authoritative machine-readable site summary.
- The connected homepage entity graph includes `RealEstateAgent`, brokerage `Organization`, `WebSite`, `WebPage`, `ImageObject`, service offers, contact details, DRE license, professional credentials, coordinates, service areas, expertise, and corroborating social profiles.
- Homepage and seller/how-I-work FAQs include matching visible answers and `FAQPage` schema.
- Homepage service and service-area context is explicit and internally linked.
- Breadcrumb navigation and `BreadcrumbList` schema are present on imported pages and current articles.
- Four opaque current-blog URLs permanently redirect to descriptive canonical URLs; sitemap and internal article links emit only the canonical forms.
- Open Graph and Twitter metadata are emitted on all indexed page templates.
- Sitemap image locations are absolute URLs.
- Neighborhood guides include consent-aware maps and dedicated local content.
- The private content editor uses section navigation and complete create, edit, delete, visibility,
  and priority controls for managed posts, market snapshots, and client reviews.
- It supports dated, source-attributed homepage market snapshots with draft/published states and
  matching `Dataset` schema.
- It supports source-aware review drafts and visible attribution. It does
  not emit self-controlled local-business `Review` schema, following Google review-snippet policy.

Owner/editorial review still required:

- Choose a single canonical article before consolidating the three overlapping post-offer/escrow articles. No editorial content has been deleted automatically.
- Decide which legacy-blog articles remain useful before pruning or redirecting them.
- Confirm publication rights and source URLs before migrating legacy testimonials into the managed
  review workflow; do not add self-serving local-business review markup.
- Enter and approve dated primary-source figures in the market snapshot editor before publishing
  citable local-market statistics.
- Supply or approve original expert commentary before publishing attributed market, fire-risk, zoning, water, septic, or transaction guidance.
- Supply or approve new East End, Arbolada, Mira Monte, Casitas Springs, water-rights, septic, and regional-market content.
- Verify exact NAP and profile descriptions in Google Business Profile, Zillow, Realtor.com, Keller Williams, and local directories; these are external systems.
- Pursue local press and citation opportunities off-site.
