# AstroPublishKit Feature Matrix

This file records implementation status rather than aspiration.

Status legend:

- ✅ **Implemented** — shipped in the listed version and covered by the normal project workflow.
- 🟡 **Partial** — useful support exists, but the full capability is intentionally incomplete.
- ⏳ **Planned** — in the roadmap, not implemented yet.
- ❌ **Out of scope** — intentionally not part of the reusable core.

## Current status

| Capability                               | Status          | Target / first version | Notes                                                                                              |
| ---------------------------------------- | --------------- | ---------------------- | -------------------------------------------------------------------------------------------------- |
| Astro static-first output                | ✅ Implemented  | v0.1.0                 | Plain static `dist/`; no SSR runtime required.                                                     |
| Markdown + MDX                           | ✅ Implemented  | v0.1.0                 | Typed Content Collection schema.                                                                   |
| Categories, tags, archive                | ✅ Implemented  | v0.1.0                 | Generated static routes.                                                                           |
| Draft support                            | ✅ Implemented  | v0.1.0                 | Draft pages are excluded from production output.                                                   |
| Per-page `noindex`                       | ✅ Implemented  | v0.1.0                 | Excluded from discovery surfaces and marked `noindex`.                                             |
| Pagefind static search                   | ✅ Implemented  | v0.1.0                 | Generated after the Astro build.                                                                   |
| TOC, share, back-to-top                  | ✅ Implemented  | v0.1.0                 | Lightweight article UI.                                                                            |
| Callout / Accordion / YouTube            | ✅ Implemented  | v0.1.0                 | Small optional MDX primitives.                                                                     |
| Canonical + Open Graph + Twitter         | ✅ Implemented  | v0.1.0                 | Uses the configured site origin.                                                                   |
| Article / Breadcrumb / WebSite JSON-LD   | ✅ Implemented  | v0.1.0                 | Visible page data and metadata share the same sources.                                             |
| Sitemap + `lastModified`                 | ✅ Implemented  | v0.1.0                 | `draft` / `noindex` behavior is verified by the quality gate.                                      |
| RSS / robots.txt / llms.txt              | ✅ Implemented  | v0.1.0                 | Static discovery outputs.                                                                          |
| Giscus                                   | ✅ Implemented  | v0.1.0                 | Optional and off by default.                                                                       |
| Cloudflare / Umami analytics hooks       | ✅ Implemented  | v0.1.0                 | Optional and off by default.                                                                       |
| `new-post` command                       | ✅ Implemented  | v0.1.0                 | Enhanced in v0.2.0 with guided and non-interactive authoring.                                      |
| Reproducible npm install                 | ✅ Implemented  | v0.1.1                 | Committed lockfile; CI uses `npm ci`.                                                              |
| ESLint                                   | ✅ Implemented  | v0.1.1                 | JS, MJS, TS and Astro.                                                                             |
| Prettier                                 | ✅ Implemented  | v0.1.1                 | Astro, JS, TS, JSON and Markdown.                                                                  |
| Config validation                        | ✅ Implemented  | v0.1.1                 | Site identity, URLs, navigation and optional integrations.                                         |
| Content validation                       | ✅ Implemented  | v0.1.1                 | Blocking errors plus non-blocking editorial warnings.                                              |
| Built internal-link validation           | ✅ Implemented  | v0.1.1                 | Offline validation against `dist/`; no public network dependency.                                  |
| Sitemap validation                       | ✅ Implemented  | v0.1.1                 | Origin, duplicates, generated pages, exclusions and `lastmod`.                                     |
| Unit tests                               | ✅ Implemented  | v0.1.1                 | URL, text, content semantics, SEO graph and taxonomy behavior.                                     |
| Single release gate                      | ✅ Implemented  | v0.1.1                 | `npm run check` is the CI release gate.                                                            |
| Guided post creation                     | ✅ Implemented  | v0.2.0                 | Native readline prompts; no heavy CLI framework.                                                   |
| Non-interactive post creation            | ✅ Implemented  | v0.2.0                 | `npm run new-post -- my-post` remains compatible; `.md` / `.mdx` supported.                        |
| Shared authoring / frontmatter rules     | ✅ Implemented  | v0.2.0                 | Schema, generator and content checker reuse common constants/parsers.                              |
| Draft listing                            | ✅ Implemented  | v0.2.0                 | `npm run drafts` lists local draft files without mutating them.                                    |
| Draft preview in development             | ✅ Implemented  | v0.2.0                 | Direct draft routes work in `npm run dev`; production builds still exclude drafts.                 |
| Author-friendly content diagnostics      | ✅ Implemented  | v0.2.0                 | Severity, file, problem, fix hint and final summary.                                               |
| Cover authoring convention               | ✅ Implemented  | v0.2.0                 | Public-root path semantics, alt requirement and optional per-post directory convention documented. |
| MDX component authoring guide            | ✅ Implemented  | v0.2.0                 | Central props/import/examples guide for the three existing primitives.                             |
| End-to-end writing workflow              | ✅ Implemented  | v0.2.0                 | Create → write → preview → check → publish documentation.                                          |
| Image URI portability validation         | ✅ Implemented  | v0.2.1                 | Standard Markdown body images reject machine-local paths and non-Web URI schemes.                  |
| Existing-site migration checklist        | ✅ Implemented  | v0.2.1                 | Generic content, image, URL/SEO, discovery and final-verification guidance.                        |
| Quick Answer / Summary                   | ✅ Implemented  | v0.3.0                 | Optional validated `summary` field rendered as a concise reader-facing article block.              |
| Related posts                            | ✅ Implemented  | v0.3.0                 | Deterministic static ranking from exact shared tags/category; no unrelated recent fallback.        |
| Previous / next article                  | ✅ Implemented  | v0.3.0                 | Deterministic same-category discoverable timeline by date, with stable ID tie-breaks.              |
| FAQ + FAQPage JSON-LD                    | ✅ Implemented  | v0.3.0                 | Optional plain-text FAQ renders visible accordions and matching structured data from one source.   |
| Gallery + lightbox                       | ⏳ Planned      | v0.3.0+                | Not part of v0.2.0.                                                                                |
| Reading progress                         | ⏳ Planned      | v0.3.0+                | Candidate progressive enhancement.                                                                 |
| Last updated / freshness notice          | ✅ Implemented  | v0.3.0                 | Existing `lastModified` drives visible Updated metadata and a deterministic 365-day static notice. |
| Full i18n routing / fallback / hreflang  | ⏳ Planned      | v0.3.0+                | Current `lang` remains metadata only.                                                              |
| Dynamic OG image generation              | ⏳ Planned      | v0.3.0+                | Current static default OG asset remains the supported path.                                        |
| AdSense integration                      | ⏳ Planned      | v0.3.0+                | Optional integration candidate, not default core UI.                                               |
| Sponsor / affiliate components           | ⏳ Planned      | v0.3.0+                | Optional candidate.                                                                                |
| Cookie consent                           | ⏳ Planned      | v0.3.0+                | Only relevant if cookie-based integrations require it.                                             |
| Mermaid / LaTeX                          | ⏳ Planned      | v0.3.0+                | Optional content-extension candidates.                                                             |
| Author profiles                          | ⏳ Planned      | v0.3.0+                | Separate from the current simple author override.                                                  |
| AI authoring workflow                    | ⏳ Planned      | v0.3.0+                | Not part of v0.2.0.                                                                                |
| Database / CMS / auth                    | ❌ Out of scope | —                      | Static publishing core stays independent of a backend.                                             |
| Halo migration tooling                   | ❌ Out of scope | —                      | Site migration logic does not belong in the starter.                                               |
| Production-site redirects/content/assets | ❌ Out of scope | —                      | Never copy production-specific content or configuration into core.                                 |
| Game / wiki-specific features            | ❌ Out of scope | —                      | Keep the starter generic.                                                                          |

## Version scope

### v0.1.0 — Public starter baseline

Static publishing, content collections, article/listing routes, Pagefind, core SEO/discovery outputs, lightweight MDX components, optional comments/analytics and Cloudflare-friendly deployment.

### v0.1.1 — Quality Hardening

Engineering and release reliability: reproducible installs, ESLint, Prettier, config/content/link/sitemap checks, broader unit tests, CI consolidation, template regression checks and truthful status documentation.

### v0.2.0 — Publishing Experience

Authoring workflow improvements without adding a backend: guided and non-interactive post creation, shared frontmatter rules, draft listing, safe draft preview during local development, clearer content diagnostics, cover/MDX authoring documentation and a single end-to-end writing workflow.

### v0.2.1 — Real-world Content Hardening

Targeted hardening from real migration validation: portable Markdown image-source checks and a generic existing-site migration checklist. This does not add redirect automation, URL-preserving migration or new article UI features.

### v0.3.0+

Current v0.3.0 development includes the optional Summary / Quick Answer block, deterministic static Related Posts, same-category Previous / Next navigation, build-time article freshness metadata/notices, and optional FAQ with matching `FAQPage` JSON-LD. Remaining candidates include reading progress, gallery/lightbox, full i18n, dynamic OG generation, ads/sponsor/affiliate integrations, cookie consent, Mermaid, LaTeX, richer author profiles and generic AI-assisted authoring workflows.

## Product boundary

The reusable kit should absorb only generic behavior that has been proven useful in production. Production-site branding, private content, redirects, analytics IDs, migration logic and environment-specific configuration stay outside this repository.
