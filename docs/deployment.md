# Deployment

AstroPublishKit builds a plain static `dist/` directory. The default project does not require SSR, a database, a Node server, or a Cloudflare adapter.

## Cloudflare Pages — recommended

This is the default deployment path for most users.

1. Connect the GitHub repository in Cloudflare Pages.
2. Use the following production settings:

| Field             | Value                           |
| ----------------- | ------------------------------- |
| Production branch | `main`                          |
| Build command     | `npm run build:production`      |
| Output directory  | `dist`                          |
| `SITE_URL`        | `https://your-domain.example`   |
| Node version      | `22.13.0` or compatible Node 22 |

`build:production` validates `SITE_URL` before Astro/Pagefind run, preventing a successful deployment with placeholder canonical URLs.

Preview deployments can use `npm run build` when you intentionally do not want the production-origin guard, but evaluate SEO output against the production build before launch.

## Workers Static Assets — advanced

Use this path for Wrangler-driven deployment or when you expect to add Worker logic later.

1. Change `name` in `wrangler.jsonc`.
2. Set `SITE_URL` to the final HTTPS origin.
3. Run:

```bash
npm ci
npm run deploy:cf
```

The command runs the production config guard before building and deploying. `wrangler.jsonc` serves `./dist`, uses `auto-trailing-slash` HTML handling, and maps unknown paths to the project's `404.html` with HTTP 404. There is intentionally no Worker `main` entry.

Before a release you can validate configuration without uploading:

```bash
SITE_URL=https://example.org npm run deploy:cf -- --dry-run
```

## Other static hosts

Any platform that serves the contents of `dist/` can host the site. Use `npm run build:production` with the final `SITE_URL`, then upload `dist/` according to that host's static-site workflow.
