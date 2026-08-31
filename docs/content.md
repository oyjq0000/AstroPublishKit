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
---
```

Do not add another Markdown H1 in the body. The article route renders `title` as the single H1.

`noindex: true` adds a robots directive, removes the article from `llms.txt`, excludes it from the sitemap metadata filter, and prevents Pagefind from indexing the article body.

## MDX components

The starter includes small, freshly implemented primitives:

- `Callout.astro`
- `Accordion.astro`
- `YouTube.astro`

Import only what the article needs.
