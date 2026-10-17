# Deployment compliance review

Review date: 2026-10-17. Deployment: https://test-ainsleyhughes.fly.dev/

This is a review of the public test deployment, not a legal opinion or a certification of
accessibility. It covers sampled live pages, rendered forms, cookie behavior, browser requests,
mobile layout, response headers, and the site's published notices. Business practices, vendor
agreements, licensing records, and rights to publish third-party materials were not verified.
The owner has confirmed that the current market statistics are placeholder data intended for
removal before production. Findings below assess the intended deployment on that condition;
the test deployment still exposes that content.
The owner reports that website inquiries are delivered via email rather than a CRM integration.
The site's code forwards submissions to a configured delivery endpoint; the specific email
provider and any delivery intermediary have not been verified.

## Prioritized findings

| Priority | Finding and evidence                                                                                                                                                                                                                                                                                                          | Recommended action                                                                                                                                                                                  |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| High     | The deployed [privacy notice](https://test-ainsleyhughes.fly.dev/privacy) still refers to possible CRM delivery, contrary to the owner's account of email delivery. The local notice now describes the email workflow without naming unverified providers; their identities and retention periods remain unconfirmed.         | Verify the configured email delivery route, document provider and mailbox retention/deletion practices, finalize the notice, and have counsel assess applicable California privacy requirements.    |
| Medium   | The Keller Williams logo is displayed in the header, and the homepage displays Ainsley's DRE number, but direct-entry pages such as [contact](https://test-ainsleyhughes.fly.dev/contact) and [featured properties](https://test-ainsleyhughes.fly.dev/featured-properties) do not visibly display the license number.        | Ask the responsible broker or California real-estate counsel to verify brokerage identification and license-number placement against the rules for website advertising and first points of contact. |
| Medium   | Before a visitor chooses cookies, the browser requests an Adobe Typekit script. The deployed [privacy notice](https://test-ainsleyhughes.fly.dev/privacy) does not explain this provider; the local notice now discloses the request. No analytics or advertising requests were observed before consent on the sampled pages. | Confirm the font provider's data handling and decide whether it should load before consent or be self-hosted. Check that the disclosure is accurate once deployed.                                  |

## Market-data removal gate

The test deployment currently has two separate market-data exposures: an image-heavy
[/market-stats page](https://test-ainsleyhughes.fly.dev/market-stats), and a
[homepage snapshot](https://test-ainsleyhughes.fly.dev/) with the erroneous "August 20265"
label and a "Realtor.com Research" citation linking to `google.com`. The homepage also emits
`Dataset` structured data for its published snapshot. The sitemap includes `/market-stats`.
Because these are to be removed, correcting or adding alternatives to the placeholder figures
is **not** a production remediation recommendation.

Before launch, confirm that the obsolete page, homepage snapshot, structured data, and sitemap
entry are removed or retired as appropriate, and that the production URL no longer serves
unsubstantiated figures. If any of that material remains public, the inaccurate citation and
inaccessible image-based statistics remain open findings. This gate has not yet been verified.

## Additional owner checks

- Confirm permission to publish listing photographs and testimonials, and check any
  brokerage or MLS attribution requirements for the [featured properties](https://test-ainsleyhughes.fly.dev/featured-properties).
- If inquiry details will be used for promotional email, calls, or texts beyond responding to the
  requested service, review the applicable marketing-consent and opt-out requirements before doing so.
  The reviewed forms did not establish consent for such follow-up.
- Determine whether the business is subject to CCPA/CPRA obligations, including rights-request
  procedures and opt-out preference signals. Their applicability cannot be established from a website
  visit alone; do not assume that a cookie preference control fulfills every applicable privacy right.
- Obtain a manual VoiceOver/Safari and NVDA/Chrome review of the navigation, cookie preferences,
  inquiry and valuation forms, and maps. Sampled forms had visible labels,
  sampled mobile pages showed no horizontal overflow, and the consent banner offered accept and
  decline with a way to reopen preferences. Those observations do not prove WCAG conformance.
- Before publishing the test hostname broadly, decide whether it should be indexed: its `robots.txt`
  allows crawling while its sitemap points to the production hostname.

## Reference guidance

- [U.S. Department of Justice: accessibility of web content](https://www.ada.gov/resources/web-guidance/)
- [W3C: WCAG 2.2, non-text content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html)
- [California Privacy Protection Agency: privacy rights and business obligations](https://cppa.ca.gov/faq.html)
- [California Department of Real Estate: licensee information](https://www.dre.ca.gov/Licensees/index.html)

The licensee, responsible broker, site owner, and their counsel should approve final advertising and
privacy language. This review did not submit inquiries or verify backend lead delivery.
