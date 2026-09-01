# Content authoring

Posts live in `src/content/posts/` and can use `.md` or `.mdx`.

For the end-to-end create → write → preview → check → publish path, start with [Writing workflow](writing-workflow.md).

## Create a draft

Run the guided creator:

```bash
npm run new-post
```

It suggests a slug from the title, validates the authoring fields, supports Markdown or MDX and creates a safe draft by default.

The original non-interactive workflow remains available:

```bash
npm run new-post -- my-post-slug
```

For MDX, use either form:

```bash
npm run new-post -- my-post-slug.mdx
npm run new-post -- my-post-slug --mdx
```

The command refuses to overwrite an existing slug, even if the existing file uses the other supported extension. Successful creation prints the generated repository-relative path.

List current drafts with:

```bash
npm run drafts
```

## Frontmatter

The schema and the post generator share the same core authoring rules. Generated posts use a stable field order, while optional fields are omitted when they are not needed.

A complete example is:

```yaml
---
title: "A useful, specific title"
description: "A standalone summary for readers and search results."
summary: "A concise direct answer shown near the top of the article."
date: 2026-08-31
lastModified: 2026-08-31
category: "Engineering"
tags: ["Astro", "Static Sites"]
draft: false
noindex: false
featured: false
author: "Your Name"
lang: "en"
cover:
  src: "/images/posts/my-post/cover.webp"
  alt: "Diagram showing the publishing workflow"
---
```

You do not need to include every optional field in every article.

### Field behavior

- `title`: required, 1–120 characters. The article route renders it as the page H1; do not add another Markdown H1 in the body.
- `description`: required, 20–240 characters. It is reused for page metadata and article previews; the content checker recommends 50–160 characters when practical.
- `summary`: optional plain text, 20–500 characters when present. It renders as a visible **Quick answer** block near the top of the article. Keep it concise and answer-oriented; it does not replace `description` and is not required for every post.
- `date`: required publication date. Use `YYYY-MM-DD` in source frontmatter for a predictable human-readable format.
- `lastModified`: optional. Use `YYYY-MM-DD`; when omitted, metadata falls back to `date`.
- `category`: one broad section for the article. The default is `General`.
- `tags`: zero or more specific topics. The generator writes a stable inline array.
- `draft`: defaults to `false` at schema level, while newly generated posts deliberately start as `true`. Draft pages are available by direct URL during `npm run dev` but are excluded from production builds and normal published-content lists.
- `noindex`: defaults to `false`. When `true`, the published page still builds and is directly accessible, but gets robots `noindex` and is excluded from sitemap discovery, Pagefind body indexing and llms.txt.
- `featured`: defaults to `false` and allows the homepage to prefer the article in its recent-post selection.
- `author`: optional single-post author name override. When omitted, `site.author.name` from the main config is used.
- `lang`: defaults to `en` and remains article metadata only in v0.2.0. It does not enable multilingual routes, translated UI, fallback behavior or hreflang.
- `cover`: optional object containing a public root-relative `src` and non-empty `alt` text.

## Related Posts

Article pages automatically render up to three related, discoverable published posts when the taxonomy provides a real relationship. Matching uses the existing exact labels: each shared tag is a stronger relevance signal than matching the same category. Drafts, `noindex` posts, the current post and posts with no shared tag/category are excluded. Ties are resolved deterministically by newer publication date and then stable post ID ordering.

Related Posts add no authoring field or manual relation IDs. They are computed during the static build and rendered as normal article links, with no backend, client fetch or AI recommendation service. If no related post qualifies, the block is omitted entirely rather than falling back to recent posts.

## Draft preview and publishing

Keep a work-in-progress article as:

```yaml
draft: true
```

Then run:

```bash
npm run dev
```

and open the article directly, for example `/posts/my-post/`. Development mode includes the draft route specifically for local author preview. Production builds still exclude it.

When the article is ready, change `draft` to `false`, run `npm run check`, and use `npm run build && npm run preview` for final static-output review.

## Cover images

Cover paths use Astro's public-root semantics. Put a file under `public/`, then reference it without the `public` prefix.

A recommended organizational convention is:

```text
public/images/posts/<slug>/
```

For example:

```text
public/images/posts/my-post/cover.webp
```

is referenced as:

```yaml
cover:
  src: "/images/posts/my-post/cover.webp"
  alt: "Screenshot of the search results page"
```

The `public/images/posts/<slug>/` structure is a convention only; it is not required by the schema or build.

`alt` is required whenever `cover` is present and must be non-empty. The cover is displayed at the top of the article, used as the article Open Graph/Twitter image, and included in Article structured data. If no cover is set, the layout falls back to `site.brand.defaultOgImage`; the starter default is the 1200×630 `public/og.png` asset.

## Body images

Use standard Markdown image syntax in both Markdown and MDX body content:

```md
![Diagram showing the build flow](/images/posts/my-post/flow.webp)
```

Astro supports public-root image URLs, remote URLs and content-relative local images in Markdown. For local files under `src/`, resolve them relative to the Markdown/MDX file; for files under `public/`, use a root-relative URL without the `public` prefix.

`npm run check:content` also checks standard Markdown `![alt](src)` destinations for portability. It accepts normal Web URLs (`http://` and `https://`) plus site-root and relative URLs such as `/images/...`, `./image.webp` and `../images/image.webp`. It blocks clear machine-local paths (`file://`, Windows drive/UNC paths, `/Users/...`, `/home/...` and other common local filesystem roots) and non-Web/custom URI schemes such as `en-resource://` or `custom-protocol://`.

The portability check is intentionally narrow: it does not prove that a referenced public or remote asset exists, and custom HTML/MDX image components need their own review.

## Taxonomy safety

`npm run check:content` rejects empty taxonomy slugs and collisions such as two different labels normalizing to the same URL slug. Rename one of the conflicting labels rather than relying on ambiguous routes.

## MDX components

The starter includes three small primitives:

- `Callout.astro`
- `Accordion.astro`
- `YouTube.astro`

They are optional and affect only `.mdx` articles that explicitly import them. Ordinary Markdown posts do not use the MDX component layer.

See [MDX components](mdx-components.md) for props and minimal copyable examples.
