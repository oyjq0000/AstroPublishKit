# AstroPublishKit Feature Matrix

> Phase 1 + Phase 1.5 scope gate for the first public release.

Legend:

- **P0**: required for initial public release.
- **P1**: useful follow-up; architecture should not block it.
- **No**: intentionally excluded from the core kit.

| Capability | runningbai-blog | AnvilWiki | AstroPaper | Fuwari | Retypeset | AstroPublishKit v1 |
|---|---:|---:|---:|---:|---:|---|
| Astro static-first output | Yes | Yes | Yes | Yes | Yes | **P0** |
| Markdown + MDX | Yes | Yes | Yes | Yes | Yes | **P0** |
| Typed Content Collection schema | Yes | Yes | Yes | Yes | Yes | **P0** |
| Generic single config surface | Partial/site-specific | Strong | Strong | Strong | Strong | **P0** |
| Categories | Yes | Yes | Via structure/tags | Yes | Yes | **P0** |
| Tags | Yes | Yes | Yes | Yes | Yes | **P0** |
| Archive/recent listing | Yes | Yes | Yes | Yes | Yes | **P0** |
| Draft support | Yes | Yes | Yes | Yes | Yes | **P0** |
| Per-page noindex | Yes | Yes | — | — | — | **P0** |
| Light/dark mode | Yes | Yes | Yes | Yes | Yes | **P0** |
| Responsive accessible UI | Yes | Yes | Strong | Yes | Yes | **P0** |
| Pagefind static search | Yes | Yes | Yes | Yes | — | **P0** |
| Table of contents | Yes | Yes | Yes | Yes | Yes | **P0** |
| Back to top | Yes | Yes | — | — | — | **P0** |
| Share links | Yes | Yes | Add-on/current wiki | — | — | **P0** |
| Callout/admonition | Yes | Yes | Add-on/current wiki | Yes | — | **P0** (small native component) |
| Accordion/details | Yes | Yes | — | — | — | **P0** (native details) |
| Gallery/lightbox | Yes | Yes | Add-on/current wiki | — | — | **P1** |
| Lazy YouTube/video | Yes | Yes | — | — | — | **P0** |
| Canonical + OpenGraph/Twitter | Yes | Yes | Yes | — | Yes | **P0** |
| JSON-LD Article/Breadcrumb/WebSite | Yes | Yes | SEO support | — | SEO support | **P0** |
| Sitemap with lastmod | Yes | Yes | Yes | — | Yes | **P0** |
| RSS | Yes | Yes | Yes | Yes | Yes | **P0** |
| robots.txt | Yes | Yes | Yes | — | — | **P0** |
| llms.txt | Yes | Yes | — | — | — | **P0** |
| Dynamic OG image generation | Yes | Yes | Yes | — | — | **P1** |
| i18n routing/content fallback | Partial/current zh only | Strong | Ready | Community docs/content lang | Yes | **P1**; v1 config is locale-aware but no complex fallback engine |
| Giscus comments | Optional | Optional | Add-on | — | Yes | **P0 optional/off by default** |
| Analytics hooks | Optional | Optional | Add-on | — | — | **P0 optional/off by default** |
| AdSense slots | Optional | Yes | — | — | — | **P1**; keep core ad-free initially |
| Sponsor/affiliate components | Optional | Yes | — | — | — | **P1** |
| Cookie consent | Yes | Yes | — | — | — | **P1**, only needed with cookie-based integrations |
| `new-post` command | Yes | Yes | — | Yes | — | **P0** |
| Config/content/link checks | Strong | Strong | Build checks | Check command | — | **P0**, smaller clean set |
| Unit tests | Yes | Yes | — | — | — | **P0** for URL/content utilities |
| GitHub Actions CI | Yes | Yes | Yes | Yes | — | **P0** |
| Cloudflare Pages | Compatible | Native | Used | Generic deploy | Generic deploy | **P0** |
| Cloudflare Workers Static Assets | Not primary | — | — | — | — | **P0** |
| Vercel/Netlify/static hosting | Yes | Yes | Yes | Yes | Yes | **P0 compatible**, docs secondary |
| D1/KV/R2/backend CMS | No | No core | No | No | No | **No** |
| Halo migration tooling | Yes | No | No | No | No | **No** |
| runningbai redirects/content/assets | Yes | No | No | No | No | **No** |
| Game/wiki-specific cards/codes | No | Yes | No | No | No | **No** |
| Bulk AI content pipeline | Limited skills | Strong | No | No | No | **P1**, rewrite generically later |
| LaTeX/Mermaid | No | No core | Add-ons possible | Extended Markdown | Yes | **P1 optional** |

## v1 product contract

The first public release is successful when a user can:

1. fork/create from the repository and change one config file to establish site identity;
2. add a typed Markdown/MDX post without touching routing code;
3. browse home, posts, tags and archive pages on mobile and desktop;
4. search static content with Pagefind;
5. get canonical metadata, OpenGraph/Twitter, JSON-LD, sitemap, RSS, robots and llms output automatically;
6. enable Giscus/analytics only by supplying documented environment values;
7. pass the repository's local checks and GitHub Actions;
8. deploy the resulting `dist/` unchanged to Cloudflare Workers Static Assets or Cloudflare Pages.

## explicit non-goals for v1

- no database;
- no admin panel/CMS;
- no authentication;
- no server-side rendering requirement;
- no migration of runningbai content;
- no built-in ad network account/configuration;
- no production analytics identifiers;
- no game/wiki-specific features;
- no automatic mass AI article generation;
- no attempt to reproduce AstroPaper/Fuwari/Retypeset visual identity.

## implementation gate

Phase 1 + Phase 1.5 are complete when these three documents are committed. Only then should implementation files be introduced to AstroPublishKit.
