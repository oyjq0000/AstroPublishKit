# AstroPublishKit Reference Projects

> Phase 1.5 research. These projects are references for product/design decisions, not a pool of files to copy.

Research date: 2026-08-31.

## Selection principles

AstroPublishKit should combine the strongest *publishing engineering* ideas while keeping a distinct codebase and a restrained v1:

- static-first and Cloudflare-friendly;
- good authoring ergonomics;
- SEO and discovery built in;
- accessible and fast by default;
- neutral visual system that users can brand themselves;
- optional integrations remain optional;
- no dependency on a backend/CMS for the default path.

## 1. PNGTRID/AnvilWiki

Repository: `https://github.com/PNGTRID/AnvilWiki`

License: MIT (`Copyright (c) 2026 AnvilWiki contributors`).

Why it matters:

- It is the direct infrastructure ancestor of parts of `runningbai-blog`, so it is a provenance reference as well as a feature reference.
- It demonstrates Cloudflare-oriented static publishing, SEO automation, content checks, AI-assisted workflows, ads/affiliate hooks, i18n, `llms.txt`, comments, and a strong onboarding/documentation layer.

What AstroPublishKit should learn:

- make the site operable by configuration rather than code edits;
- treat content quality checks as part of the product;
- keep monetization and comments opt-in;
- document deployment and authoring workflows as first-class features.

What AstroPublishKit should *not* inherit in v1:

- game/wiki-specific information architecture;
- upstream `Anvil*` branding;
- domain-specific cards/codes workflows;
- bulk AI content production pipeline;
- large beginner handbook / multi-site operations layer.

## 2. satnaing/astro-paper

Repository: `https://github.com/satnaing/astro-paper`

License: MIT (`Copyright (c) 2023 Sat Naing`).

Relevant current features:

- type-safe Markdown/MDX;
- accessibility-focused responsive layout;
- Pagefind static search;
- draft posts and pagination;
- sitemap and RSS;
- collapsible TOC;
- dynamic OG generation;
- i18n readiness;
- a clear user-facing configuration file.

What AstroPublishKit should learn:

- a small, explicit configuration surface is easier to fork and maintain than scattered constants;
- accessibility and keyboard behavior should be acceptance criteria, not polish;
- search and SEO should work on a fully static deployment;
- theme code can stay minimal while authoring remains capable.

Do not copy AstroPaper theme/layout code; use it only as a benchmark.

## 3. saicaca/fuwari

Repository: `https://github.com/saicaca/fuwari`

License: MIT (`Copyright (c) 2024 saicaca`).

Relevant current features:

- configurable colors and banner;
- responsive light/dark design;
- Pagefind search;
- table of contents and RSS;
- post creation command;
- extended Markdown features such as admonitions and enhanced code blocks;
- broad community documentation/localization.

What AstroPublishKit should learn:

- make brand customization possible without forking core components;
- provide a `new-post` workflow early;
- give Markdown authors a small set of useful content primitives.

What to avoid in v1:

- animation-heavy defaults;
- copying a recognizable theme aesthetic;
- accumulating many Markdown plugins before the core schema is stable.

## 4. radishzzz/astro-theme-retypeset

Repository: `https://github.com/radishzzz/astro-theme-retypeset`

License: MIT (`Copyright (c) 2025 radishzz`).

Relevant current features:

- typography-first reading experience;
- SEO, sitemap, OpenGraph, RSS and MDX;
- LaTeX, Mermaid and TOC support;
- i18n, comments and theme customization;
- responsive light/dark presentation.

What AstroPublishKit should learn:

- long-form readability deserves its own design budget;
- optional advanced content renderers can be layered onto a stable Markdown core.

Decision for v1:

- adopt typography/readability principles;
- defer LaTeX and Mermaid to optional follow-up integrations rather than mandatory dependencies.

## 5. Cloudflare Astro starter / current Cloudflare guidance

Reference repository: `https://github.com/cloudflare/astro-blog-starter-template-brayden`

Documentation:

- `https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/`
- `https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/`

Why it matters:

Cloudflare's current guidance supports two simple static deployment paths:

- **Workers Static Assets**: for an entirely prerendered Astro site, Wrangler only needs `assets.directory = "./dist"`; no Worker `main` entry or SSR adapter is required.
- **Cloudflare Pages**: build command `npm run build`/equivalent, output directory `dist`, production branch typically `main`.

AstroPublishKit decision:

- remain fully static by default;
- ship a small `wrangler.jsonc` for Workers Static Assets;
- document Pages as an equally valid Git-connected deployment;
- do not add `@astrojs/cloudflare`, D1, KV or R2 until a server feature actually requires them.

## 6. Combined design direction

The useful overlap across references is strong:

- Markdown/MDX + typed content;
- static output;
- fast, accessible responsive reading UI;
- light/dark mode;
- search;
- TOC/tags/archive;
- RSS/sitemap/canonical/OpenGraph;
- easy configuration;
- deploy without a database.

The differentiator for AstroPublishKit should be **a clean publishing kit with quality gates and deployment-ready defaults**, not another theme clone.

## 7. Reference-use policy

For the initial release:

- reference projects may influence requirements and acceptance tests;
- no reference repository is cloned into the AstroPublishKit build directory;
- no reference `.git` data is used;
- no component is copied verbatim from AstroPaper, Fuwari, Retypeset or the Cloudflare starter;
- AnvilWiki provenance is documented separately because `runningbai-blog` already contains AnvilWiki-derived infrastructure.
