---
title: Start publishing with AstroPublishKit
description: Configure the starter, create your first post, run the quality checks, and produce a static build ready for deployment.
date: 2026-08-31
category: Getting Started
tags: [Astro, Publishing]
featured: true
---

AstroPublishKit is intentionally small at the point where your project identity begins. The content model, routes, search index and SEO outputs are already wired; your first job is to replace the demo identity with your own.

## Change the site identity

Open `astro-publish-kit.config.mjs` and replace the title, description, canonical URL, author and social links. For deployment environments, `SITE_URL` can override the configured URL without changing source code.

## Create a post

Run:

```bash
npm run new-post -- my-first-post
```

The generated file lives in `src/content/posts/`. Its frontmatter is validated by Astro's Content Collection schema during the build.

## Run the release checks

Before pushing a change, run:

```bash
npm run check
```

That command type-checks the Astro project, runs unit tests, validates content conventions, scans the public implementation for unsafe source-specific values, builds the static site and creates a Pagefind index.

## Deploy the output

The final site is in `dist/`. You can connect the repository to Cloudflare Pages, or run `npm run deploy:cf` to publish the same static output with Workers Static Assets.
