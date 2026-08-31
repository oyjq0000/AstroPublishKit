# AstroPublishKit Source Audit

> Phase 1 audit of `oyjq0000/runningbai-blog` before extracting a public starter.
>
> Audited snapshot: `main` at `3ff7b52d680e7d9cd65c7ee7f4641341374e862e` (2026-08-30).

## 1. Executive decision

`runningbai-blog` is a production/personal site, not a clean public template. It combines:

- personal content and branding for `runningbai.cn`;
- a reusable Astro publishing/SEO layer;
- infrastructure explicitly derived from AnvilWiki;
- one-off Halo migration artifacts and production deployment material.

AstroPublishKit **must not be produced by renaming or re-pushing this repository**. The safe path is a clean implementation in a separate worktree/directory with a new Git history, generic configuration, fresh demo content, and explicit upstream attribution where applicable.

## 2. Provenance and licensing

Evidence in the audited source:

- `README.md` describes the site as a personal blog using "AnvilWiki verified SEO infrastructure".
- the latest `main` merge is `feat: sync reusable AnvilWiki blog infrastructure`;
- `LICENSE` is MIT and retains `Copyright (c) 2026 AnvilWiki contributors`;
- internal names such as the `wiki` content collection and `.agent/skills/anvil-*` still reflect that provenance.

Decision:

- AstroPublishKit will use a new project identity and new Git history.
- No `.git` directory, commit metadata, migration branch, or source-repository history will be copied.
- No code from unrelated reference themes will be copied.
- Any material adapted from AnvilWiki-derived source must retain the applicable MIT notice. A public release should include a third-party notice documenting this provenance.

This audit is an engineering provenance review, not legal advice.

## 3. Current reusable capability inventory

The source contains useful publishing primitives that are appropriate to *re-implement or carefully adapt* in a generic kit:

### Content model

- Astro Content Collections with Zod validation.
- Markdown/MDX authoring.
- categories and tags.
- draft/noindex metadata.
- published and last-modified dates.
- author metadata.

### Reading experience

- article layout and cover support.
- table of contents.
- back-to-top control.
- share control.
- gallery component.
- callout and accordion MDX components.
- lazy video/YouTube support.
- recent and tag listing pages.
- static Pagefind search.
- light/dark theme support.

### SEO / discovery

- canonical URLs and normalized URL handling.
- Open Graph / Twitter metadata.
- Article, BreadcrumbList, WebSite/Organization-style JSON-LD support.
- sitemap with `lastmod` and noindex exclusion.
- RSS.
- robots.txt.
- `llms.txt`.
- content checks for headings, alt text, links and freshness.

### Optional integrations

- Giscus comments.
- Google/Baidu/Umami/Cloudflare analytics hooks.
- AdSense slots.
- sponsor/donation card.
- cookie consent behavior for cookie-based analytics.

### Quality / operations

- type checking, linting and tests.
- CI workflow.
- configuration/content/link/i18n/sitemap checks.
- static Cloudflare-compatible build output.

## 4. NEVER COPY list

The following source material is site-specific, migration-specific, privacy-sensitive, branding-specific, or otherwise unsuitable for the public starter and must not enter AstroPublishKit:

| Source area | Decision | Reason |
|---|---|---|
| `.git/` and all source history | NEVER COPY | New project requires independent history; source history also contains personal commit metadata. |
| `src/content/wiki/zh/**` | NEVER COPY | Real personal articles and migrated content. |
| `public/images/posts/**` | NEVER COPY | Real article assets; provenance varies by post. |
| `src/assets/covers/**` | NEVER COPY | Site/article-specific covers. |
| `.migration/**` | NEVER COPY | Private one-off migration payload/archive. |
| `migration/**` | NEVER COPY | Halo migration inventories, scripts, reports and redirects. |
| `MIGRATION*.md`, `FINAL-APPLY.md` | NEVER COPY | One-off migration procedure. |
| `redirects.csv`, `public/_redirects` | NEVER COPY | Historical runningbai URL mappings. |
| `public/ads.txt` | NEVER COPY | Publisher/site-specific advertising declaration. |
| `ops/**` | NEVER COPY | runningbai production deployment procedure and assumptions. |
| `src/config/site.ts` values | NEVER COPY | Personal title, domain, tagline, legal notice, GitHub profile and author. |
| `src/config/authors.ts` values | NEVER COPY | Personal author identity/profile. |
| `wrangler.toml` values | NEVER COPY | runningbai project/domain plus live Baidu/Umami identifiers. |
| existing favicons/hero/manifest branding | NEVER COPY | runningbai identity. |
| `.agent/skills/anvil-*` as-is | NEVER COPY | Upstream-specific branding/workflow; rewrite later if a generic AI workflow is desired. |

## 5. Safe-to-carry concepts, not site data

The following may be re-created in AstroPublishKit after removing source-specific assumptions:

- static Astro + MDX architecture;
- generic typed site configuration;
- generic post schema;
- content listing/sorting/tagging utilities;
- accessible article/navigation components;
- Pagefind indexing and search UI;
- canonical/OG/JSON-LD/RSS/sitemap/robots/llms patterns;
- optional Giscus, analytics, ads and sponsor hooks that are **disabled by default**;
- generic CI and quality checks;
- Cloudflare static deployment configuration using `dist` as the asset directory.

The implementation should favor fresh code and simpler public APIs instead of copying large source components line-for-line.

## 6. Configuration sanitization requirements

AstroPublishKit configuration must satisfy all of the following:

1. no `runningbai.cn`, `阿白`, `runningbai`, production analytics IDs, or personal profile URLs;
2. `.env.example` contains placeholders only;
3. optional third-party integrations are off when variables are absent;
4. example site identity is obviously generic and safe to replace;
5. no secret/token-bearing files are committed;
6. no generated search index/build output is committed;
7. demo content and images are newly written/generated for AstroPublishKit.

## 7. v1 extraction strategy

Use this implementation rule:

**rebuild the publishing system, do not extract the personal site.**

Priority order:

1. generic content schema and config;
2. minimal neutral reading UI;
3. SEO/discovery primitives;
4. Pagefind search;
5. tags/archive/basic author pages;
6. optional comments/analytics/monetization hooks;
7. tests and CI;
8. Cloudflare Workers Static Assets + Cloudflare Pages documentation.

Defer migration tooling, multi-site operations, bulk AI content workflows and rich domain-specific wiki components until the clean public core is stable.

## 8. Release gate

Implementation may start only after:

- [x] source provenance is understood;
- [x] unsafe/site-specific material is enumerated;
- [x] reference projects are researched;
- [x] the feature matrix fixes the v1 scope;
- [ ] implementation is built in a separate temporary directory;
- [ ] only reviewed final files are written to `oyjq0000/AstroPublishKit`;
- [ ] repository history is verified to be independent of `runningbai-blog`.
