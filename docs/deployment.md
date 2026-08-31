# Deployment

AstroPublishKit builds a static `dist/` directory. The default project does not require SSR, a database, or a Cloudflare adapter.

## Cloudflare Workers Static Assets

1. Change the `name` in `wrangler.jsonc`.
2. Set `SITE_URL` to the final HTTPS origin.
3. Run:

```bash
npm install
npm run deploy:cf
```

`wrangler.jsonc` points `assets.directory` at `./dist`. There is intentionally no Worker `main` entry.

## Cloudflare Pages

Connect the repository in Cloudflare Pages and use:

- production branch: `main`
- build command: `npm run build`
- output directory: `dist`
- environment variable: `SITE_URL=https://your-domain.example`

Preview deployments can use the same build command.

## Other static hosts

Any host that can serve the contents of `dist/` works. The only requirement for correct canonical/SEO URLs is a production `SITE_URL`.
