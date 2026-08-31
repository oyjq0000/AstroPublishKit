# Configuration reference

AstroPublishKit deliberately keeps configuration small. Site identity lives in `astro-publish-kit.config.mjs`; the production origin is supplied with `SITE_URL`.

## Required before production

### `SITE_URL`

Set this environment variable to a plain HTTPS origin:

```bash
SITE_URL=https://example.org
```

Do not include a path, query string or fragment. `npm run build:production` rejects a missing value, a non-HTTPS URL, a URL with a path, or the `https://example.com` placeholder.

It is the base origin for canonical URLs, sitemap, RSS, robots.txt, JSON-LD, llms.txt and social/share URLs.

### `site.title`

The public site name used in page titles and metadata.

### `site.author`

The default author object:

```js
author: {
  name: "Your Name",
  url: "https://example.org/about/"
}
```

A post-level `author` string overrides `site.author.name` for that article only.

## Recommended

### Site identity

```js
site: {
  title: "Your Site",
  shortTitle: "Your Site",
  description: "A concise site description.",
  repository: "https://github.com/you/your-site",
  copyright: "Your Name"
}
```

### Brand assets

```js
brand: {
  mark: "Y",
  favicon: "/favicon.svg",
  defaultOgImage: "/og.png"
}
```

Files beginning with `/` are served from `public/`. The default OG image is 1200×630 PNG.

### Navigation and social links

Both are small arrays of `{ label, href }`. Keep internal page links in trailing-slash form such as `/posts/`.

### Homepage

`home.eyebrow`, `home.heading`, `home.intro`, `home.primaryAction` and `home.secondaryAction` control the demo homepage without editing the route component.

## Optional

### Language metadata

`site.language` sets the document language and `site.locale` sets Open Graph locale metadata. These fields do not provide multilingual routing.

### Navigation changes

Add, remove or reorder entries in `navigation`. Static routes are not generated from this array; it only controls navigation links.

### Giscus

Configure all required `PUBLIC_GISCUS_*` values from `.env.example`. The comments section is rendered below article content only when the required values are present.

### Analytics

- `PUBLIC_CF_BEACON_TOKEN`: enables Cloudflare Web Analytics globally.
- `PUBLIC_UMAMI_SCRIPT_URL` + `PUBLIC_UMAMI_WEBSITE_ID`: both are required to enable Umami globally.

Leaving optional integration variables empty keeps the related scripts out of the rendered site.

## What configuration does not try to do

v0.1.x does not expose a large theme system. Replace CSS or components directly when you need a different visual system; keep the configuration focused on site identity and publishing behavior.
