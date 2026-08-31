# MDX components

AstroPublishKit includes three small MDX primitives. They are optional: ordinary `.md` posts do not import or depend on them.

For a post directly under `src/content/posts/`, import only the components you need:

```mdx
import Callout from "../../components/Callout.astro";
import Accordion from "../../components/Accordion.astro";
import YouTube from "../../components/YouTube.astro";
```

If you place an MDX file in a nested content directory, adjust the relative import path accordingly.

## Callout

Props:

- `title?: string` — defaults to `Note`.
- `tone?: "note" | "tip" | "warning"` — defaults to `note`.

```mdx
<Callout title="Release note" tone="tip">
  Keep the article as a draft while reviewing it locally.
</Callout>
```

The component intentionally contains no large icon system or client-side JavaScript.

## Accordion

Props:

- `summary: string` — required label shown in the native disclosure control.
- `open?: boolean` — defaults to `false`.

```mdx
<Accordion summary="Why keep this static?">
  The content remains usable without a database or client-side application runtime.
</Accordion>
```

It uses native `<details>` / `<summary>` behavior and does not require hydration.

## YouTube

Props:

- `id: string` — required YouTube video ID, not a full URL.
- `title: string` — required accessible iframe title.

```mdx
<YouTube id="VIDEO_ID" title="Publishing workflow walkthrough" />
```

The embed uses YouTube's privacy-enhanced `youtube-nocookie.com` host and lazy-loads the iframe.

## Minimal complete MDX example

```mdx
---
title: "An MDX example"
description: "A small example showing how optional MDX components fit into an article."
date: 2026-08-31
category: "Examples"
tags: ["MDX"]
draft: true
noindex: false
featured: false
lang: "en"
---

import Callout from "../../components/Callout.astro";

Start with normal Markdown content.

<Callout title="Optional enhancement" tone="note">
  Import a component only when the article actually needs it.
</Callout>

## Continue with Markdown

The rest of the article can remain ordinary Markdown.
```

Keep component usage small and article-driven. AstroPublishKit does not aim to provide a general-purpose MDX component library.
