# Quality checks

AstroPublishKit treats `npm run check` as the local and CI release gate.

Run dependencies from the committed lockfile first:

```bash
npm ci
npm run check
```

The gate runs in this order:

1. `npm run typecheck`
2. `npm run lint`
3. `npm run format:check`
4. `npm run test`
5. `npm run check:config`
6. `npm run check:content`
7. `npm run build`
8. `npm run check:links`
9. `npm run check:sitemap`
10. `npm run check:safety`
11. `npm run check:template`

A blocking failure exits non-zero and should stop a release. Editorial warnings are printed but do not fail CI.

## `typecheck`

Runs Astro's TypeScript diagnostics across Astro, TypeScript and content-driven routes. Content Collection validation also enforces that an optional `faq` is a non-empty array of non-empty plain-text `question` / `answer` pairs.

## `lint`

Runs ESLint across JavaScript, MJS, TypeScript and Astro files. CI requires zero lint errors.

## `format:check`

Uses Prettier to verify the committed source without modifying it. The configuration supports Astro, JavaScript, TypeScript, JSON, Markdown and other formats Prettier understands.

Use `npm run format` locally when formatting changes are needed.

## `test`

Runs the Node test suite. The suite covers:

- URL and canonical normalization;
- reading-time and text helpers;
- draft / noindex publishing semantics and development draft preview semantics;
- date sorting and category / tag filtering;
- Related Posts eligibility, exact shared-taxonomy scoring, deterministic date/ID tie-breaks, limits and input immutability;
- Previous / Next same-category eligibility, chronology, boundary behavior, deterministic equal-date ordering and input immutability;
- taxonomy slug behavior, including Unicode and collisions;
- JSON-LD graph assembly and SEO URL invariants;
- FAQPage mapping, empty omission and source immutability;
- authoring helpers such as post slug normalization, title-to-slug suggestions, tags parsing, Markdown/MDX selection and frontmatter serialization;
- `new-post` default draft behavior, optional summary serialization and duplicate-file protection using synthetic temporary projects;
- optional Summary / Quick Answer length validation;
- Markdown image parsing and URI portability, including CLI exit behavior for synthetic `.md` / `.mdx` fixtures.

Tests use synthetic fixtures rather than private production posts and do not require network or Cloudflare access.

## `check:config`

Validates the generic starter configuration, including:

- site title, description, author, language and locale;
- the configured canonical origin;
- HTTPS repository, author and social URLs;
- navigation labels and root-relative page URLs;
- the trailing-slash page convention;
- homepage actions;
- optional Giscus and Umami configuration groups.

The normal starter check allows the `https://example.com` demo origin so a fresh clone can pass development checks. `npm run build:production` is stricter and rejects a missing, malformed, non-HTTPS or placeholder production `SITE_URL`.

Partially configured optional integrations produce warnings when the implementation safely keeps the integration disabled.

## `check:content`

Blocking content errors include:

- missing required frontmatter keys;
- an optional `summary` outside the supported 20–500 character range;
- `lastModified` earlier than the publication `date`;
- a body H1 when the page template already renders the title as H1;
- Markdown images with empty alt text;
- Markdown image sources that use clear local filesystem paths or non-Web URI schemes;
- taxonomy values that normalize to an empty or colliding slug;
- malformed root-relative internal links;
- internal page links that violate the trailing-slash convention.

Image URI portability is deterministic and blocking rather than editorial: `http://`, `https://`, site-root and relative paths are accepted, while `file://`, Windows absolute paths, known machine-local POSIX roots and other URI schemes such as `en-resource://` are errors. Exact duplicate bad image sources are reported once per file to keep diagnostics useful.

Non-blocking warnings include:

- heading-level jumps;
- no root-relative internal page links in an article;
- content whose effective update date has reached the shared 365-day stale threshold;
- descriptions outside the recommended editorial length range.

Diagnostics are author-facing and grouped by severity and file. A typical item looks like:

```text
WARN src/content/posts/example.md
  Description is shorter than the recommended 50 characters.
  Fix: Aim for 50-160 characters when practical.
```

The command ends with a compact summary of posts checked, errors and warnings. Warnings remain non-blocking.

These checks are language-neutral; they do not encode Chinese- or English-specific writing rules.

## `build`

Generates the static Astro site and then builds the Pagefind index from `dist/`. Later checks deliberately validate the generated output rather than only source files.

Draft routes are available only during `npm run dev` for direct local author preview. A normal or production build still excludes drafts.

## `check:links`

Reads generated HTML from `dist/` and validates internal page links without requesting the public internet.

It checks that:

- internal page URLs use the configured trailing-slash convention;
- malformed encoded or duplicate-slash paths are rejected;
- each internal page link points to generated HTML;
- assets, external URLs, mail/tel links and hash-only links are not treated as page links.

Inline scripts and styles are removed before anchor extraction so client-side HTML templates do not create false positives.

## `check:sitemap`

Validates `sitemap-index.xml` plus child sitemaps, or a direct `sitemap.xml` when that form is generated.

It checks:

- sitemap files exist;
- sitemap URLs use the configured origin;
- page URLs use the trailing-slash convention;
- URLs are unique;
- every sitemap URL maps to generated HTML;
- draft and noindex posts are absent;
- published indexable posts are present;
- a post with `lastModified` has a matching sitemap `lastmod` value.

The demo origin is structurally valid here; production placeholder rejection belongs to `build:production`.

## `check:safety`

Scans for common secret patterns and accidental environment-file commits. It remains a repository hygiene check, not a substitute for a dedicated secret-management system.

## `check:template`

Copies the starter into a temporary clean template scenario, replaces the identity with a synthetic user, creates content with the non-interactive `new-post` command and runs a production build. The generated output is scanned for identity leakage from the original demo/template. It also asserts that the demo article HTML contains the expected static Related Posts links and that a Related Posts block never links to its own current article. Synthetic published fixtures verify Previous / Next links in generated HTML, including middle and category-boundary behavior. Separate freshness fixtures verify visible `Updated` metadata with the expected `<time datetime>` value and a reader-facing notice for a deliberately old article. An FAQ fixture verifies that visible questions/answers and `FAQPage` structured data contain the same pairs, while a normal article without `faq` emits neither FAQ output.

This is part of `npm run check`, so CI does not need a separate template step.

## Production smoke check

Before a real deployment, supply the final HTTPS origin and run:

```bash
SITE_URL=https://your-domain.example npm run build:production
```

`build:production` verifies the production origin before running the same static build path.
