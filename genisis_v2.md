# GENESIS PROMPT: SvelteKit Clone of AinsleyHughes.com & AI-Optimized Lead Capture Engine

Copy and paste the following prompt into an advanced AI development agent or code generator to rebuild and improve https://www.ainsleyhughes.com/ using SvelteKit and TypeScript.

---

### Role & Objective

You are an expert full-stack web developer, website migration specialist, and Generative Engine Optimization (GEO) architect. Rebuild **https://www.ainsleyhughes.com/** as a production-ready, high-performance website using **SvelteKit, TypeScript, and Server-Side Rendering (SSR)**. Treat the live website, its sitemap, and its mobile and desktop behavior as the source of truth. Preserve all existing public content, routes, visual identity, navigation, interactions, forms, integrations, legal notices, and functional features while improving accessibility, maintainability, Core Web Vitals, SEO, and GEO. Use only content and assets owned by or licensed to the site owner; do not copy Squarespace platform code or dependencies.

The replacement must be functionally complete rather than a static visual mockup. Optimize it to be discovered, cited, and recommended by conversational search engines (like ChatGPT, Gemini, and Perplexity) while aggressively capturing seller leads and integrating with CRM and automation platforms (such as ChatGPT custom actions, KW Command, and Zapier webhooks).

---

### Key System Specifications & Architecture

#### 1. Framework & Rendering Strategy (SvelteKit SSR)

- **Core Framework:** Use SvelteKit with strict TypeScript, SSR enabled, and `@sveltejs/adapter-node` so fully formed, semantic HTML is served instantly to users, search crawlers, and AI bots.
- **Routing & Layouts:** Leverage SvelteKit's file-based routing (`+layout.svelte`, `+page.svelte`, `+page.ts`, and `+server.ts`) for clean separation of concerns and minimal boilerplate.
- **Metadata Management:** Utilize `<svelte:head>` blocks natively on every page to inject dynamic Open Graph tags, canonical URLs, and structured data.
- **Fly.io Deployment:** Package the Node server in a production Docker image and include a secure `fly.toml`, health-check endpoint, environment-variable documentation, graceful shutdown behavior, and Fly.io deployment instructions.

#### 2. Complete Existing-Site Audit & Migration

- **Discovery Before Implementation:** Crawl the live site's navigation, sitemap, linked pages, footer, mobile menu, forms, buttons, embeds, downloads, images, social links, metadata, cookie controls, and responsive states. Create an internal route-and-feature inventory before building. Do not silently omit a feature because it is not listed in this prompt.
- **Route Preservation:** Preserve existing public URLs and deep links wherever practical, including `/home`, `/about`, `/buy`, `/sell`, `/contact`, `/ojai-real-estate-reviews`, `/featured-properties`, `/buyers-consultation`, `/blog`, existing `/blog/[slug]` URLs, `/oldblog` and its post URLs, `/magazine`, `/market-stats`, and `/new-gallery`. Redirect obsolete or consolidated URLs with permanent `301` redirects and provide a redirect map.
- **Visual and Responsive Fidelity:** Reproduce the site's brand identity, typography, color palette, imagery, page hierarchy, header, navigation, footer, calls to action, content sections, galleries, and responsive behavior. Improve implementation quality without unexpectedly changing the established visitor experience.
- **Content and Asset Migration:** Migrate all authorized page copy, blog posts, images, downloadable guides, magazine links, testimonials, property content, contact details, social profiles, alt text, and relevant metadata. Optimize responsive images while preserving originals and attribution where required. Do not use placeholder content in the completed implementation.
- **Functional Parity:** Reimplement every user-facing interaction, including contact and consultation forms, property and gallery displays, review/testimonial sections, external links, downloads, scheduling embeds, social links, validation, loading states, success confirmations, and explicit error states. Verify that submissions reach their intended destination.
- **SEO Preservation:** Preserve or improve page titles, descriptions, canonical URLs, indexability, robots directives, structured data, Open Graph data, sitemap coverage, internal linking, and URL authority. Prevent accidental duplicate content and broken inbound links.

#### 3. Technical Framework & AI Readability (GEO)

- **Structured Data (JSON-LD):** Implement robust, nested schema markup across all pages via reusable, type-safe Svelte components (`LocalBusiness`, `RealEstateAgent`, `Service`, `FAQPage`, and `Review`). Ensure `sameAs` properties link directly to social profiles (Instagram, Facebook, LinkedIn) and official directory listings.
- **Semantic HTML & Clean DOM:** Use explicit heading hierarchies (`H1`, `H2`, `H3`) structured around natural language Q&A queries that target local real estate intent (e.g., _"How to price a home in [Location]"_, _"What are closing costs for sellers in [Location]"_).
- **Machine-Readable Content Blocks:** Provide dedicated FAQ sections and concise summary blocks designed for LLM extraction and zero-click search snippets.
- **Automated Sitemaps & Metadata:** Generate dynamic XML sitemaps using SvelteKit endpoint routes (`+server.ts`) and provide AI-assisted metadata generation for all property listings, neighborhood guides, and market reports.

#### 4. Complete Blog & Content Publishing

- **Blog Migration:** Migrate every current `/blog/[slug]` article and all intentionally retained `/oldblog/[slug]` articles with their original slugs, titles, publication and modification dates, authorship, body structure, images, alt text, categories, tags, excerpts, and metadata.
- **Blog Experience:** Build an SSR blog index and article template with pagination, category and tag filtering, related posts, previous/next navigation, share metadata, responsive media, reading-friendly typography, and accessible navigation. Preserve existing URLs or add explicit `301` redirects.
- **Publishing Workflow:** Use a maintainable, documented content source such as a headless CMS or repository-managed Markdown/MDsveX. Define a typed content schema and support drafts, scheduled publication, slugs, excerpts, hero images, image alt text, categories, tags, canonical URLs, SEO fields, and Open Graph images without requiring code changes for each article.
- **Blog Discovery:** Include published posts in XML and image sitemaps, expose an RSS/Atom feed, add `Blog` and `BlogPosting` JSON-LD, and ensure drafts and future-dated posts are never publicly rendered or indexed before publication.
- **Content Safety:** Sanitize rendered rich content, validate external URLs, optimize images, and preserve heading hierarchy. Provide a migration script or repeatable import process rather than manually hard-coding each article into page components.

#### 5. Privacy, Cookie Consent & Legal UX

- **Restrictive Opt-In Consent:** Reproduce the site's cookie banner with **Accept all**, **Decline all**, and **Manage cookies** controls. Default all non-essential categories to off until affirmative consent; essential cookies may remain active.
- **Granular Preferences:** Provide separately configurable analytics/performance and marketing categories, persist the visitor's choices, expose a permanent **Cookie Preferences** control, and allow consent to be changed or withdrawn at any time.
- **Script Gating:** Do not load or execute non-essential analytics, advertising, tracking pixels, embedded media, or marketing scripts before the corresponding consent is granted. Revoking consent must prevent future non-essential processing and remove cookies when technically possible.
- **Accessible Consent UI:** Make the banner and preferences dialog keyboard accessible, screen-reader friendly, responsive, focus-managed, and non-coercive. Accept and decline choices must be equally clear.
- **Compliance Configuration:** Centralize cookie categories, vendors, purposes, and retention descriptions. Link the consent interface to the site's privacy and cookie policies, record only the minimum consent state needed, and make policy text and regional behavior configurable. Do not claim legal compliance without owner or counsel review.

#### 6. Seller Lead Generation Engine

- **High-Value Lead Magnets:**
  - _Instant Home Valuation / Comparative Market Analysis (CMA) Calculator:_ Build a reactive, type-safe, multi-step Svelte form that collects property details in exchange for an instant automated valuation report.
  - _Hyper-Local Seller Guides & Market Trend Reports:_ Gated PDF/digital guides providing local inventory data, days-on-market stats, and staging checklists.
- **Interactive Conversion Paths:**
  - Integrated scheduling widgets (e.g., Calendly/SavvyCal) for listing consultations embedded directly within high-intent landing pages.
  - Intelligent conversational capture widget/chatbot trained on local real estate FAQs to pre-qualify sellers and gather contact info 24/7.
- **Traffic Tracking & Attribution:** Append UTM tracking parameters dynamically across all inbound social/AI channels to monitor lead origin and conversion efficiency.

#### 7. Integrations & Tooling Connectors (SvelteKit Endpoints)

- **ChatGPT Custom Actions / GPTs:** Expose an OpenAPI-compliant SvelteKit endpoint (`+server.ts` at `/api/llm-tools`) allowing custom GPTs to fetch up-to-date neighborhood market data, schedule consultations, or query valuation logic directly.
- **CRM Webhooks (KW Command / Zapier):** Implement a secure `POST /api/leads` SvelteKit server endpoint (`+server.ts`) that instantly pushes captured seller lead data (name, property address, contact info, valuation metrics, UTM source) directly into KW Command or Zapier automation pipelines.
- **Social Media Synergy:** Embed Open Graph meta tags (`og:title`, `og:description`, `og:image`) optimized for Instagram, Facebook, and LinkedIn sharing, ensuring visual cards load cleanly when shared.
- **Security & Reliability:** Validate and normalize all server inputs, add bot and spam protection, rate-limit public endpoints, keep secrets server-side, use timeouts for external calls, surface failures clearly, and prevent duplicate lead submissions. Never expose CRM credentials or webhook secrets to browser code.

---

### Implementation Instructions for the AI Builder

1. **Audit Before Building:** Crawl the source site and produce a route, content, asset, metadata, integration, and interaction inventory. Use it as an acceptance checklist and document anything that cannot be migrated automatically.
2. **Initialize the SvelteKit Project:** Set up a clean SvelteKit project configured with strict TypeScript, SSR, `@sveltejs/adapter-node`, production dependencies, and fast Core Web Vitals.
3. **Rebuild and Migrate:** Implement every inventoried page and responsive interaction, migrate authorized content and assets, preserve URLs, and add tested redirects where necessary.
4. **Implement Blog Publishing:** Add the typed CMS or content layer, import existing blog content, build index and article experiences, and generate feeds, metadata, structured data, and sitemap entries.
5. **Implement Privacy Controls:** Build the restrictive opt-in cookie banner and preference center, then verify that non-essential scripts and cookies are blocked before consent and respond correctly when preferences change.
6. **Implement SSR Meta & Schema:** Build reusable, type-safe Svelte components for dynamic JSON-LD injection, canonical URLs, AI-assisted metadata, and `<svelte:head>` Open Graph tags.
7. **Build Seller Funnels & Reactive Forms:** Create the multi-step valuation calculator, gated resource download forms, and consultation booking components using Svelte's reactive state and SvelteKit form actions.
8. **Configure TypeScript Endpoints (`+server.ts`):** Write backend route handlers that validate inputs, securely transmit lead payloads to external CRMs (KW Command/Zapier), and serve structured data endpoints for AI consumption.
9. **Deploy to Fly.io:** Provide a production Dockerfile, `fly.toml`, health checks, secret configuration, custom-domain and TLS instructions, observability guidance, and rollback steps.
10. **Verify Acceptance:** Test all inventoried routes, forms, redirects, blog publishing behavior, consent states, integrations, metadata, sitemap entries, responsive breakpoints, keyboard navigation, accessibility, and error paths. Resolve broken links and missing assets before declaring completion.
11. **Output Clean, Modular Code:** Provide the complete working project, configuration templates, migration utilities, automated tests, and setup, content-editing, deployment, and maintenance instructions. Do not return disconnected snippets or a partial scaffold.
