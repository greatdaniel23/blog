# Alpha Digital Agency — SEO Page Taxonomy and LLM Implementation Guide

**Document type:** SEO information architecture, page ownership, and LLM execution contract  
**System:** `alphadigitalagency.id`  
**Audience:** Coding LLMs, SEO agents, content agents, and engineers working in this repository  
**Last verified against repository:** 2026-08-31  
**Production warning:** Repository routes and copy are not proof of deployment. Verify live behavior before reporting a production change.

## 0. Purpose

This document defines which type of page should own each search intent. Use it before creating, deleting, renaming, or rewriting a public marketing page.

The central rule is:

> One page owns one distinct search intent. Multiple keyword variants with the same intent belong to one page. Do not create one page for every literal query.

Alpha uses four public page classes:

1. **Brand and entity pages** establish who Alpha and its people are.
2. **Product and service pages** explain what Alpha sells and how the offer works.
3. **Keyword-focused commercial pages** capture non-branded, high-value search demand.
4. **Editorial support pages** build topical authority and answer informational questions.

These page classes must cooperate through internal links. They must not compete for the same primary query.

## 1. Non-Negotiable Business Rules

Every LLM must preserve these rules unless the user explicitly changes the business model:

### 1.1 Market segments

Alpha serves hospitality businesses, especially:

- hotels;
- villas;
- restaurants where the selected service is relevant.

Hotel and villa offers are not identical.

| Capability | Hotel | Villa | Required wording |
|---|---:|---:|---|
| Google Ads | Yes | Yes | May target direct bookings and measurable revenue |
| SEO | Yes | Yes | Must use segment-relevant examples |
| GA4/GTM and conversion tracking | Yes | Yes | Track through to booking/revenue where technically possible |
| AI Agent | Yes | Yes | May assist guest questions and the booking journey |
| Existing PMS/booking-flow integration or tracking | Yes | Yes | Integration does not mean Alpha supplies its standalone engine |
| Alpha standalone booking engine product | **No** | **Yes** | Always state that Alpha's booking engine is for villas only |
| Airbnb calendar auto-sync | Not a hotel offer | Yes | Present only in villa/booking-engine context |

For hotels, Alpha may audit, track, or integrate an existing booking engine or PMS. Do not claim that Alpha installs or sells its standalone booking engine to hotels.

### 1.2 Branded keywords

Branded keyword variants may safely resolve to the brand/entity page. Do not create thin pages for variants such as:

- `alpha digital`;
- `alpha digital agency`;
- `alpha agency`;
- `alphadigital`;
- common brand misspellings.

The homepage should own Alpha brand demand. `/daniel-santoso` should own the `Daniel Santoso` person/entity query.

### 1.3 Money keywords

High-commercial-intent, non-branded queries may receive dedicated landing pages when their intent and promise are distinct. Current examples are:

- `marketing agency bali`;
- `digital marketing agency bali`;
- `digital agency bali`.
- `digital marketing bali`;
- `google ads bali` and closely related Google Ads service queries.

These are called **keyword-focused commercial pages** in this document. They are not blog posts and must not read like generic SEO essays.

### 1.4 No keyword cannibalization

Do not create separate pages for synonyms or word-order variants when the user expects the same answer.

Examples:

| Query variants | Owning page |
|---|---|
| `digital agency bali`, `agency di bali`, `agency bali`, `agensi bali` | `/digital-agency-bali` |
| `digital marketing agency bali`, `bali digital marketing agency`, `jasa digital marketing bali` | `/digital-marketing-agency-bali` |
| `marketing agency bali`, hospitality marketing partner variations | `/marketing-agency-bali` |
| Alpha brand variants | `/` |
| Daniel Santoso | `/daniel-santoso` |

If two proposed pages cannot be given materially different visitor problems, promises, proof, structure, and CTA, merge them instead of publishing both.

## 2. Page Taxonomy

## 2.1 Brand and entity pages

### Purpose

Establish identity, trust, expertise, location, and the relationship between Alpha, Daniel Santoso, and the hospitality market.

### Primary examples

| Route | Owner intent | Notes |
|---|---|---|
| `/` | Alpha Digital Agency brand and brand variants | Acts as the site hub; do not force every non-branded money keyword into the homepage |
| `/about` | Organization story and differentiation | Supports entity trust; not a duplicate homepage |
| `/daniel-santoso` | Daniel Santoso entity/person query | Supports founder expertise and Person schema |
| `/contact` | Contact/navigation intent | Conversion utility, not a search landing page |
| `/gallery` | Supporting evidence/visual reference | Must support primary pages rather than claim unrelated search intent |

### Required content

- clear entity name;
- hospitality specialization;
- location and service area;
- credible experience and proof;
- relationships among founder, organization, services, and relevant properties;
- links to commercial keyword pages and product/service pages.

### Must not do

- create separate pages for each brand spelling;
- repeat the full sales copy of every service;
- target all generic agency keywords in the title, H1, and every section;
- make unsupported claims such as “best agency”.

### Homepage metadata direction

The homepage title should lead with the brand/entity and positioning. Example direction:

```text
Alpha Digital Agency Bali | Direct Booking for Hotels & Villas
```

The homepage description may summarize the connected system, but it must say that Alpha's booking engine is villa-only whenever the engine is mentioned.

## 2.2 Product and service pages

### Purpose

Explain a defined offer: the problem it solves, who it is for, what is included, how delivery works, integrations or limitations, evidence, and the next action.

### Repository examples

| Route family | Offer ownership |
|---|---|
| `/ai-agent` | AI Agent solution for hospitality |
| `/booking-engine` | Alpha booking engine product for villas only |
| `/seo-villa` | Villa website/SEO offer, including villa booking-engine context where applicable |
| `/services/growth` | Growth/Google Ads service |
| `/services/foundation` | Tracking and measurement foundation |
| `/services/authority` | SEO/authority service |
| `/services/booking-integration` | Booking integration/service detail; must preserve the villa-only Alpha engine rule |
| `/ekosistem` | Connected digital ecosystem explanation |
| `/products/*` | Product-level explanation where a distinct product exists |

### Required content contract

Every product/service page should answer:

1. Who is this for?
2. What business problem does it solve?
3. What exactly is included and excluded?
4. How does it work?
5. What evidence or operational detail makes the offer credible?
6. What is the primary CTA?
7. Which keyword-focused page should link to it?

### Metadata direction

- Title begins with the product/service and meaningful market qualifier.
- Description states audience, outcome, and key constraint.
- H1 describes the offer, not the agency category.
- Use `Service`, `Product`, or relevant structured data only when the page genuinely represents that entity.

### Booking-engine wording contract

Allowed:

```text
Booking Engine untuk Villa
Standalone booking engine for villas
Integrate hotel booking data into GA4
Audit an existing hotel booking flow
```

Not allowed:

```text
Our standalone booking engine for hotels and villas
We install our booking engine for hotels
Booking engine product for every hospitality business
```

## 2.3 Keyword-focused commercial pages

### Purpose

Capture non-branded queries with demonstrated or expected commercial value, then route qualified visitors to the relevant service or product.

These pages sell the **category-level reason to choose Alpha**. They do not replace detailed product/service pages.

### Current repository routes

| Route | Primary keyword cluster | Distinct commercial angle |
|---|---|---|
| `/marketing-agency-bali` | `marketing agency bali` | Strategy, accountable growth, acquisition, measurement, conversion, and revenue decisions |
| `/digital-marketing-agency-bali` | `digital marketing agency bali`, `bali digital marketing agency`, `jasa digital marketing bali` | Connected digital marketing execution for measurable direct bookings |
| `/digital-agency-bali` | `digital agency bali`, `agency di bali`, `agency bali`, `agensi bali` | Connected hospitality digital infrastructure rather than disconnected vendors |
| `/digital-marketing-bali` | `digital marketing bali` and general category discovery | General digital-marketing framework that qualifies Alpha's hospitality-only fit |
| `/google-ads-bali` | `google ads bali`, `jasa google ads bali`, `google ads agency bali` | Commercial Google Ads search intent and qualification before the detailed Growth service |

English counterparts belong under `/en/...` and must use English copy, locale-correct canonicals, hreflang, schema URLs, and internal links.

### Required content contract

Each keyword-focused page must contain materially unique:

- SERP title and meta description;
- H1 and opening promise;
- problem framing;
- commercial angle;
- supporting proof or operating logic;
- relevant segment distinctions;
- FAQs;
- CTA;
- links to the appropriate product/service pages;
- links back to the brand/entity where trust is needed.

Avoid fake proof, invented client outcomes, fabricated certifications, and generic “number one agency” claims.

### Separation of current money pages

The three current pages must remain distinct:

| Page | Visitor's central question | Page must emphasize | Page must not become |
|---|---|---|---|
| `/marketing-agency-bali` | “Who can help decide and operate where marketing budget should go?” | Acquisition, measurement, conversion, accountable growth | A duplicate list of digital tools |
| `/digital-marketing-agency-bali` | “Who can execute the digital channels that generate measurable direct bookings?” | Google Ads, SEO, GA4/GTM, AI, direct-booking measurement | A generic business-strategy page |
| `/digital-agency-bali` | “Who can connect the website, data, automation, and acquisition stack?” | Connected infrastructure, fewer disconnected vendors, system ownership | A duplicate Google Ads landing page |
| `/digital-marketing-bali` | “What should digital marketing in Bali include, and is Alpha relevant to my business?” | General framework, channel prioritisation, hospitality fit | A claim that Alpha serves every Bali industry |
| `/google-ads-bali` | “Who can manage Google Ads in Bali and measure business outcomes?” | Search/PMax, conversion data, ROAS, hospitality qualification | A duplicate of the Growth product-detail page |

### When to create another keyword-focused page

Create a new page only when all answers below are **yes**:

1. Is the query non-branded and commercially valuable?
2. Is its search intent materially different from an existing page?
3. Can Alpha make a relevant, truthful offer for that intent?
4. Can the page have unique content, proof, and CTA?
5. Is there a clear internal-link path from the site hub?
6. Can one existing page be prevented from competing for the same primary query?
7. Will the page be maintained after publication?

If the query is merely a synonym, assign it as a secondary keyword to the current owner page.

## 2.4 Editorial support pages

### Purpose

Answer informational questions, build topical authority, support product/keyword pages, and earn discovery earlier in the buying journey.

### Examples

- hotel revenue definitions such as ADR, RevPAR, and occupancy;
- how AI agents affect hotel/villa guest journeys;
- booking-funnel diagnostics;
- Google Ads and GA4 implementation guidance;
- villa SEO and direct-booking education.

### Editorial page rules

- A blog article may rank for a commercial query, but it should link to the commercial owner page.
- Do not convert every ranking article into a sales page.
- Do not let article titles duplicate the exact title and promise of a product or keyword-focused page.
- Maintain the production editorial revision/approval workflow. Do not bypass D1 live-content guards.

## 3. Keyword Ownership Map

This table is the starting assignment based on the GSC analysis performed in August 2026. Re-query GSC before making future decisions.

| Keyword/query family | Page class | Canonical owner | Notes |
|---|---|---|---|
| Alpha Digital brand variants | Brand/entity | `/` | Brand variations may all point to the homepage |
| Daniel Santoso | Brand/entity | `/daniel-santoso` | Person intent |
| marketing agency bali | Keyword-focused | `/marketing-agency-bali` | Money keyword; dedicated page |
| digital marketing agency bali | Keyword-focused | `/digital-marketing-agency-bali` | Money keyword; dedicated page |
| jasa digital marketing bali | Keyword-focused | `/digital-marketing-agency-bali` | Same execution/service intent |
| digital agency bali | Keyword-focused | `/digital-agency-bali` | Money keyword; dedicated page |
| agency di bali / agency bali / agensi bali | Keyword-focused | `/digital-agency-bali` | Same broad agency-selection intent |
| digital marketing bali | Keyword-focused | `/digital-marketing-bali` | General category intent; explicitly qualify hospitality fit |
| google ads bali / jasa google ads bali | Keyword-focused | `/google-ads-bali` | Commercial acquisition page |
| Google Ads management product detail | Product/service | `/services/growth` | Detailed scope and delivery; receives qualified traffic from `/google-ads-bali` |
| AI Agent for hotel/villa | Product/service | `/ai-agent` | Product intent; use segment-specific copy |
| AI agent booking hotel informational queries | Editorial + product support | Relevant article, linking to `/ai-agent` | Do not claim Alpha booking-engine product is for hotels |
| booking engine villa / direct booking engine villa | Product/service | `/booking-engine` | Alpha standalone product is villa-only |
| SEO villa | Product/service | `/seo-villa` | Villa-specific offer |
| Google Ads hospitality | Product/service or future keyword page after evidence review | `/services/growth` by default | Create a keyword page only if intent and GSC evidence justify it |

## 4. Internal Linking Contract

Internal links declare ownership and help prevent orphan pages.

### 4.1 Required link flow

```text
Brand homepage
  -> keyword-focused commercial pages
  -> primary product/service pages

Keyword-focused commercial page
  -> relevant product/service page
  -> brand/about/person proof where useful
  -> contact/WhatsApp CTA

Product/service page
  -> relevant keyword-focused category page
  -> supporting editorial content
  -> CTA

Editorial article
  -> one primary commercial owner page
  -> one relevant product/service page when helpful
```

### 4.2 Anchor-text rules

- Use descriptive anchors naturally.
- Do not repeat exact-match anchor text in every block.
- Do not link one query to multiple competing destination pages.
- A page must not repeatedly link to itself as though it were a different topic.
- ID pages should link to ID routes; EN pages should link to `/en/...` routes.

### 4.3 Homepage role

The homepage is the brand hub. It may summarize commercial categories and link outward, but dedicated money pages own their specific non-branded queries.

## 5. Metadata and On-Page SEO Contract

### 5.1 Title

- One unique title per canonical page and locale.
- Put the primary query or entity near the beginning.
- Add a truthful differentiator or outcome.
- Add the Alpha brand at the end when space permits.
- Prefer a useful title over mechanically targeting an exact character count.
- Avoid repeating the same title formula across every route.

Example:

```text
Marketing Agency Bali for Hospitality Growth | Alpha
```

### 5.2 Meta description

- Write one unique description per page and locale.
- State audience, offer/outcome, and meaningful differentiation.
- Use a benefit-led hook, but never deceptive clickbait.
- If mentioning Alpha's booking engine, state that it is villa-only.
- Do not list every service when the list makes the promise unclear.

### 5.3 H1 and heading structure

- Exactly one primary H1 in the rendered main content.
- H1 owns the page intent and may differ slightly from the title.
- H2 sections answer distinct buying questions.
- Avoid blocks written only to repeat the keyword.

### 5.4 Canonical and hreflang

- ID page canonical points to the ID URL.
- EN page canonical points to `/en/...`.
- ID and EN alternates must reference each other.
- Schema `url` must match the locale-correct canonical.
- Do not canonicalize a unique English page to Indonesian merely because they share a component.

### 5.5 Structured data

| Page class | Typical schema |
|---|---|
| Homepage/brand | Organization, WebSite, LocalBusiness/ProfessionalService when accurate |
| Person/entity | Person |
| Product/service | Service or Product, plus FAQ when visible |
| Keyword-focused commercial | Service/ProfessionalService plus visible FAQ when accurate |
| Editorial article | Article/BlogPosting plus other supported visible entities |

Schema must describe visible page content. Never create fake ratings, reviews, prices, or results.

## 6. Repository Implementation Pattern

### Main locations

| Concern | Location |
|---|---|
| Route wrappers | `src/pages/**/*.astro` |
| Shared page components | `src/components/*.astro` |
| Localized copy | `src/i18n/pages/*.ts` or typed component copy when intentionally local |
| Global metadata/canonical/schema rendering | `src/layouts/Layout.astro` |
| Schema helpers | `src/lib/schema.ts` |
| Sitemap | `src/pages/sitemap.xml.ts` |
| Redirects and gone routes | `src/middleware.ts` |

### New page implementation requirements

For every new ID page:

1. Add an ID route.
2. Add an EN route if English is in scope.
3. Use locale-specific copy, links, metadata, canonical, hreflang, and schema URL.
4. Add the static route to `src/pages/sitemap.xml.ts`.
5. Add at least one crawlable internal link from an existing relevant page.
6. Add links from the new page to its service/product owner and CTA.
7. Verify mobile and desktop rendering.
8. Verify the rendered `<title>`, meta description, canonical, hreflang, H1, and schema.

Do not create route files alone and assume Google will understand their ownership.

## 7. LLM Decision Procedure

Before editing, the LLM must complete this brief:

```text
Requested query/topic:
Page class:
Primary search intent:
Primary keyword/entity:
Secondary variants:
Existing owner page candidates:
Why a new page is or is not required:
Target market segment:
Offer allowed for this segment:
Offer explicitly excluded:
Canonical ID route:
Canonical EN route:
Primary CTA:
Internal links in:
Internal links out:
Schema type:
GSC evidence date/source:
```

Then follow this sequence:

1. Inspect `git status` and preserve unrelated work.
2. Read this document and the architecture guide.
3. Search existing titles, H1s, descriptions, routes, sitemap entries, and internal links.
4. Check current GSC query/page data when keyword ownership is the reason for the change.
5. Decide whether to update an owner page, create a new intent page, or merge duplicate intent.
6. Implement ID/EN consistently.
7. Validate source and rendered output.
8. Report what changed, what remains local, and whether production was modified.

## 8. Acceptance Checklist

### Taxonomy

- [ ] Page class is declared.
- [ ] Primary intent has exactly one canonical owner.
- [ ] Secondary variants are clustered instead of turned into thin pages.
- [ ] Brand variants remain with the brand/entity owner.
- [ ] Product details remain with the product/service owner.

### Segment accuracy

- [ ] Hotel and villa promises are not treated as identical.
- [ ] Alpha standalone booking engine is described as villa-only.
- [ ] Hotel copy may describe tracking/integration of an existing booking flow without implying product supply.
- [ ] No unsupported performance, client, certification, “best”, or ranking claims were added.

### SEO

- [ ] Unique title, description, and H1.
- [ ] Canonical and hreflang are locale-correct.
- [ ] Schema URL and content match the rendered page.
- [ ] Sitemap includes the canonical route.
- [ ] At least one crawlable inbound internal link exists.
- [ ] Outbound links support the visitor's next decision.
- [ ] No existing page still strongly targets the same primary query without a deliberate reason.

### Engineering

- [ ] Unrelated dirty-worktree changes were preserved.
- [ ] `git diff --check` passes, ignoring platform line-ending notices.
- [ ] New/changed files introduce no new Astro or TypeScript diagnostics.
- [ ] Relevant routes render locally or in an approved preview environment.
- [ ] Metadata and H1 were checked in rendered HTML, not only source strings.
- [ ] Existing project-wide build failures are reported separately from new failures.
- [ ] No production deploy or remote data mutation occurred without explicit approval.

## 9. Current Repository Mapping

As of 2026-08-31, these keyword-focused source routes exist in the shared worktree:

```text
/marketing-agency-bali
/digital-marketing-agency-bali
/digital-agency-bali
/digital-marketing-bali
/google-ads-bali
/en/marketing-agency-bali
/en/digital-marketing-agency-bali
/en/digital-agency-bali
/en/digital-marketing-bali
/en/google-ads-bali
```

Related source files include:

```text
src/components/MarketingAgencyBali.astro
src/components/AgencyKeywordLanding.astro
src/components/CommercialSearchLanding.astro
src/pages/marketing-agency-bali.astro
src/pages/digital-marketing-agency-bali.astro
src/pages/digital-agency-bali.astro
src/pages/digital-marketing-bali.astro
src/pages/google-ads-bali.astro
src/pages/en/marketing-agency-bali.astro
src/pages/en/digital-marketing-agency-bali.astro
src/pages/en/digital-agency-bali.astro
src/pages/en/digital-marketing-bali.astro
src/pages/en/google-ads-bali.astro
src/pages/sitemap.xml.ts
```

This list records repository state only. The next LLM must verify deployment status and live rendered metadata before claiming the pages are available in production.

### 9.1 Known policy conflicts in the current source

The business rule in section 1.1 is authoritative for future page work, but the repository still contains older wording that may imply the Alpha booking engine is offered to hotels.

Before the next approved public release, audit and correct at least:

| Source area | Observed risk |
|---|---|
| `src/layouts/Layout.astro` | Global organization/service/default descriptions group Direct Booking Engine together with hotel, villa, and restaurant audiences |
| `src/lib/schema.ts` | LocalBusiness descriptions group Direct Booking Engine with hotel, villa, and restaurant services |
| `src/i18n/pages/services-detail.ts` | Booking-integration copy still mentions “villa dan hotel kecil” / “villas and small hotels” |
| `src/pages/links.astro` | Static description lists Direct Booking Engine without the villa-only constraint |
| Person/profile and ecosystem copy | Some wording may say Daniel connects booking engines for hotels; clarify that hotel work means integration/tracking of an existing system, not supply of Alpha's standalone engine |

Do not perform a blind global text replacement. Review each occurrence to distinguish:

- supplying Alpha's standalone booking-engine product, which is villa-only; from
- tracking, auditing, or integrating an existing third-party hotel booking engine/PMS, which remains valid.

## 10. Required Handoff From Any LLM

Every LLM that changes public SEO pages must finish with:

1. page class and keyword ownership decision;
2. files changed;
3. metadata before/after;
4. ID/EN routes affected;
5. internal links added or changed;
6. sitemap, canonical, hreflang, and schema verification;
7. commands and tests run with pass/fail status;
8. known cannibalization or segment risks;
9. whether any remote state or production deployment changed.

Do not say “SEO is fixed” merely because source files were edited. Indexing, canonical selection, rankings, and CTR must be measured after deployment through GSC.
