# Content authoring

Posts live in `src/content/posts/` and can use `.md` or `.mdx`.

## Create a draft

```bash
npm run new-post -- my-post-slug
```

The generated file starts with `draft: true`. Change it to `false` when the post is ready to publish.

## Frontmatter

```yaml
---
title: A useful, specific title
description: A standalone summary for readers and search results.
date: 2026-08-31
lastModified: 2026-08-31
category: Engineering
tags: [Astro, Static Sites]
draft: false
noindex: false
featured: false
author: Your Name
lang: en
cover:
  src: /images/my-post-cover.webp
  alt: Diagram showing the publishing workflow
---
```

### Field behavior

- `title`: 1–120 characters. The article route renders it as the page H1; do not add another Markdown H1 in the body.
- `description`: 20–240 characters, reused for page metadata and previews.
- `date`: publication date.
- `lastModified`: optional; falls back to `date` for modified-time metadata.
- `category`: one broad section for the article.
- `tags`: zero or more specific topics.
- `draft: true`: the page is not generated.
- `noindex: true`: the page still builds and is directly accessible, but gets robots `noindex` and is excluded from the sitemap, Pagefind body index and llms.txt.
- `featured`: allows the homepage to prefer the article in its recent-post selection.
- `author`: optional single-post override; when omitted, `site.author.name` from the main config is used.
- `lang`: article metadata only in v0.1.x; it does not enable multilingual routes, translated UI or hreflang.

## Cover images

Put public cover files under `public/`, for example:

```text
public/images/my-post-cover.webp
```

Then reference them with a root-relative URL:

```yaml
cover:
  src: /images/my-post-cover.webp
  alt: Screenshot of the search results page
```

`alt` is required and must be non-empty. The cover is displayed at the top of the article and is also used as that article's Open Graph image. If no cover is set, `site.brand.defaultOgImage` is used.

A 1200×630 image is a practical default when the same asset should work well for social sharing; article-only covers can use another aspect ratio if the design requires it.

## Taxonomy safety

`npm run check:content` rejects empty taxonomy slugs and collisions such as two different labels normalizing to the same URL slug. Rename one of the conflicting labels rather than relying on ambiguous routes.

## MDX components

The starter includes small primitives:

- `Callout.astro`
- `Accordion.astro`
- `YouTube.astro`

Import only what the article needs. The demo MDX article provides a compact reference for these components.
