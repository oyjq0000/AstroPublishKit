# AstroPublishKit Feature Matrix

This file records implementation status rather than aspiration.

Status legend:

- ✅ **Implemented** — shipped in the listed version and covered by the normal project workflow.
- 🟡 **Partial** — useful support exists, but the full capability is intentionally incomplete.
- ⏳ **Planned** — in the roadmap, not implemented yet.
- ❌ **Out of scope** — intentionally not part of the reusable core.

## Current status

| Capability                               | Status          | Target / first version | Notes                                                              |
| ---------------------------------------- | --------------- | ---------------------- | ------------------------------------------------------------------ |
| Astro static-first output                | ✅ Implemented  | v0.1.0                 | Plain static `dist/`; no SSR runtime required.                     |
| Markdown + MDX                           | ✅ Implemented  | v0.1.0                 | Typed Content Collection schema.                                   |
| Categories, tags, archive                | ✅ Implemented  | v0.1.0                 | Generated static routes.                                           |
| Draft support                            | ✅ Implemented  | v0.1.0                 | Draft pages are not generated.                                     |
| Per-page `noindex`                       | ✅ Implemented  | v0.1.0                 | Excluded from discovery surfaces and marked `noindex`.             |
| Pagefind static search                   | ✅ Implemented  | v0.1.0                 | Generated after the Astro build.                                   |
| TOC, share, back-to-top                  | ✅ Implemented  | v0.1.0                 | Lightweight article UI.                                            |
| Callout / Accordion / YouTube            | ✅ Implemented  | v0.1.0                 | Small MDX primitives.                                              |
| Canonical + Open Graph + Twitter         | ✅ Implemented  | v0.1.0                 | Uses the configured site origin.                                   |
| Article / Breadcrumb / WebSite JSON-LD   | ✅ Implemented  | v0.1.0                 | Visible page data and metadata share the same sources.             |
| Sitemap + `lastModified`                 | ✅ Implemented  | v0.1.0                 | `draft` / `noindex` behavior is verified by the quality gate.      |
| RSS / robots.txt / llms.txt              | ✅ Implemented  | v0.1.0                 | Static discovery outputs.                                          |
| Giscus                                   | ✅ Implemented  | v0.1.0                 | Optional and off by default.                                       |
| Cloudflare / Umami analytics hooks       | ✅ Implemented  | v0.1.0                 | Optional and off by default.                                       |
| `new-post` command                       | ✅ Implemented  | v0.1.0                 | Generates a draft post.                                            |
| Reproducible npm install                 | ✅ Implemented  | v0.1.1                 | Committed lockfile; CI uses `npm ci`.                              |
| ESLint                                   | ✅ Implemented  | v0.1.1                 | JS, MJS, TS and Astro.                                             |
| Prettier                                 | ✅ Implemented  | v0.1.1                 | Astro, JS, TS, JSON and Markdown.                                  |
| Config validation                        | ✅ Implemented  | v0.1.1                 | Site identity, URLs, navigation and optional integrations.         |
| Content validation                       | ✅ Implemented  | v0.1.1                 | Blocking errors plus non-blocking editorial warnings.              |
| Built internal-link validation           | ✅ Implemented  | v0.1.1                 | Offline validation against `dist/`; no public network dependency.  |
| Sitemap validation                       | ✅ Implemented  | v0.1.1                 | Origin, duplicates, generated pages, exclusions and `lastmod`.     |
| Unit tests                               | ✅ Implemented  | v0.1.1                 | URL, text, content semantics, SEO graph and taxonomy behavior.     |
| Single release gate                      | ✅ Implemented  | v0.1.1                 | `npm run check` is the CI release gate.                            |
| Related posts                            | ⏳ Planned      | v0.2.0                 | Simple shared-tag/category/recent scoring.                         |
| Previous / next article                  | ⏳ Planned      | v0.2.0                 | Same-category navigation by date.                                  |
| Quick Answer / Summary                   | ⏳ Planned      | v0.2.0                 | Optional article summary field.                                    |
| FAQ + FAQPage JSON-LD                    | ⏳ Planned      | v0.2.0                 | Visible FAQ and structured data must share one source.             |
| Gallery + lightbox                       | ⏳ Planned      | v0.2.0                 | Lightweight and accessible; no large JS dependency.                |
| Reading progress                         | ⏳ Planned      | v0.2.0                 | Progressive enhancement.                                           |
| Last updated / freshness notice          | ⏳ Planned      | v0.2.0                 | Generic configurable freshness behavior.                           |
| Full i18n routing / fallback / hreflang  | ⏳ Planned      | v0.3.0+                | v0.1.x language fields are metadata only.                          |
| Dynamic OG image generation              | ⏳ Planned      | v0.3.0+                | Not part of v0.2.0.                                                |
| AdSense integration                      | ⏳ Planned      | v0.3.0+                | Optional integration, not default core UI.                         |
| Sponsor / affiliate components           | ⏳ Planned      | v0.3.0+                | Optional.                                                          |
| Cookie consent                           | ⏳ Planned      | v0.3.0+                | Only when cookie-based integrations need it.                       |
| Mermaid / LaTeX                          | ⏳ Planned      | v0.3.0+                | Optional content extensions.                                       |
| Author profiles                          | ⏳ Planned      | v0.3.0+                | Separate from the current simple author override.                  |
| AI authoring workflow                    | ⏳ Planned      | v0.3.0+                | Generic workflow only; no bulk content pipeline in core.           |
| Database / CMS / auth                    | ❌ Out of scope | —                      | Static publishing core stays independent of a backend.             |
| Halo migration tooling                   | ❌ Out of scope | —                      | Site migration logic does not belong in the starter.               |
| Production-site redirects/content/assets | ❌ Out of scope | —                      | Never copy production-specific content or configuration into core. |
| Game / wiki-specific features            | ❌ Out of scope | —                      | Keep the starter generic.                                          |

## Version scope

### v0.1.0 — Public starter baseline

Static publishing, content collections, article/listing routes, Pagefind, core SEO/discovery outputs, lightweight MDX components, optional comments/analytics and Cloudflare-friendly deployment.

### v0.1.1 — Quality Hardening

Engineering and release reliability: reproducible installs, ESLint, Prettier, config/content/link/sitemap checks, broader unit tests, CI consolidation, template regression checks and truthful status documentation.

### v0.2.0 — Publishing Experience

Planned article-facing improvements: summary, FAQ, related posts, previous/next navigation, gallery/lightbox, reading progress and freshness metadata. These features are not implemented by v0.1.1.

### v0.3.0+

Candidates that add more optional complexity: full i18n, dynamic OG generation, ads/sponsor/affiliate integrations, cookie consent, Mermaid, LaTeX, richer author profiles and generic AI-assisted authoring workflows.

## Product boundary

The reusable kit should absorb only generic behavior that has been proven useful in production. Production-site branding, private content, redirects, analytics IDs, migration logic and environment-specific configuration stay outside this repository.
