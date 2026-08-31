# Customization

## Site identity

Edit `astro-publish-kit.config.mjs` first. It is the main configuration surface for:

- site title and description;
- canonical URL;
- language and locale;
- author;
- navigation;
- social links;
- homepage copy.

Production can override only the canonical origin with `SITE_URL`.

## Visual system

The starter intentionally uses plain CSS instead of a theme framework. Edit CSS variables near the top of `src/styles/global.css` for quick rebranding, or replace the stylesheet/components entirely without changing the content model.

## Optional integrations

Copy `.env.example` to `.env` locally. Empty values disable the integration.

Supported in v1:

- Cloudflare Web Analytics;
- Umami;
- Giscus.

No production account identifiers ship with the repository.
