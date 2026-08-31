# Customization

## Site identity first

Edit `astro-publish-kit.config.mjs` before changing components. It is the small, intentional configuration surface for site title/description, author, repository, brand mark/assets, navigation/social links, copyright and homepage copy.

Set the production origin separately with `SITE_URL`. See `docs/configuration.md` for the full reference.

## Visual system

The starter intentionally uses plain CSS instead of a theme framework. Edit CSS variables near the top of `src/styles/global.css` for quick rebranding, or replace the stylesheet/components entirely without changing the content model.

## Files to replace for a clean template identity

At minimum review:

- `astro-publish-kit.config.mjs`
- `public/favicon.svg`
- `public/og.png`
- `src/pages/about.astro` if you want a custom About page
- demo posts under `src/content/posts/`

After replacing the identity, run `npm run check:template` to build with a fake identity and detect accidental source-site residue in generated outputs.

## Optional integrations

Copy `.env.example` to `.env` locally. Empty values disable the integration.

- Giscus appears below article content when all required Giscus values exist.
- Cloudflare Web Analytics loads globally when its token is configured.
- Umami loads globally only when both script URL and website ID exist.

No production account identifiers should be committed to the public starter.
