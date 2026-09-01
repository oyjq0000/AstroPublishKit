# Existing blog → AstroPublishKit migration checklist

Use this checklist when moving an existing content site into AstroPublishKit. It is deliberately platform-neutral: the starter can validate its own output, but the migration owner remains responsible for source-specific field mapping, assets, URL continuity and redirects.

## Content

- [ ] Inventory all Markdown and MDX files before changing them.
- [ ] Map required frontmatter fields: `title`, `description`, `date`, `category` and `tags`.
- [ ] Decide what to do with unsupported or custom frontmatter instead of silently dropping it.
- [ ] Map per-post `author` values only when they should override the site-level author.
- [ ] Preserve `date` and map meaningful update timestamps to `lastModified`.
- [ ] Map unpublished content to `draft: true`.
- [ ] Map intentionally published-but-not-indexable content to `noindex: true`.
- [ ] Review category and tag labels for taxonomy slug collisions.
- [ ] Move cover metadata to `cover.src` plus a non-empty `cover.alt` when a post has a cover.
- [ ] Identify custom MDX components and either migrate them explicitly or replace their usage with supported content.

## Images

- [ ] For files copied to `public/`, reference them from the site root, for example `/images/posts/example/image.webp`.
- [ ] Keep valid content-relative Markdown image paths such as `./image.webp` or `../images/image.webp` only when the referenced file is migrated with the content.
- [ ] Keep remote images on stable `http://` or `https://` URLs only when external hosting is intentional.
- [ ] Replace local filesystem paths such as `file:///Users/...`, `file:///home/...`, `C:\Users\...`, `/Users/...` or `/home/...`.
- [ ] Replace application-specific or non-Web URI schemes such as `en-resource://...` before publishing.
- [ ] Give every Markdown image meaningful alt text.
- [ ] Verify that every migrated local image asset actually exists after the move; a syntactically portable URL does not guarantee the file was copied.
- [ ] Review custom HTML or MDX image components separately; `check:content` targets standard Markdown `![alt](src)` body images.

AstroPublishKit treats clear local filesystem paths and non-Web URI schemes as blocking content errors. Copy those assets into the project or move them to stable Web hosting before release.

## URLs / SEO

> **Do not assume AstroPublishKit preserves an existing site's URL structure.**

Successful content migration does not mean SEO-safe URL migration. Before changing DNS or production routing:

- [ ] Export or capture the old sitemap.
- [ ] Build AstroPublishKit with the real target origin and capture the new sitemap.
- [ ] Compare old and new article URLs, not only page counts.
- [ ] Build an explicit redirect map for every intentional URL change.
- [ ] Check article path changes, including any move to the starter's default `/posts/<slug>/` route.
- [ ] Check category and tag path changes.
- [ ] Check trailing-slash differences.
- [ ] Check canonical URL changes.
- [ ] Preserve redirects at the hosting/platform layer appropriate for the deployment.

AstroPublishKit does not include a general redirect engine or promise URL-preserving migration. For Cloudflare deployment options, see [Deployment](deployment.md); keep site-specific redirect configuration outside the reusable starter core.

## Discovery

After the production-origin build, inspect the generated site and confirm:

- [ ] canonical URLs use the intended production origin and path;
- [ ] sitemap contains the intended indexable pages;
- [ ] RSS points at the intended public URLs;
- [ ] `robots.txt` is appropriate for production;
- [ ] `llms.txt` contains the intended published/indexable content;
- [ ] Pagefind indexes the intended pages and language;
- [ ] Open Graph images resolve correctly;
- [ ] Article, breadcrumb and WebSite JSON-LD use the intended public URLs and metadata.

## Final verification

From a clean checkout, run:

```bash
npm ci
npm run check
SITE_URL=https://your-domain.example npm run build:production
npm run preview
```

Then review representative migrated pages in the browser, including at least one post with local images, one with remote images, one MDX post when applicable, one draft/noindex case and the site's main discovery outputs.

Do not cut over the old site until content checks pass, required assets are present, old/new sitemap differences are understood and the redirect map is ready.
