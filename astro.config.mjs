import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import kit from "./astro-publish-kit.config.mjs";
import { withTrailingSlash } from "./src/lib/urls.mjs";

const postsRoot = path.resolve("src/content/posts");

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function frontmatterValue(source, key) {
  const match = source.match(new RegExp(`^${key}:\\s*["']?([^\\n"']+)["']?\\s*$`, "m"));
  return match?.[1]?.trim();
}

const sitemapMeta = new Map();
for (const file of walk(postsRoot).filter((file) => /\.(md|mdx)$/.test(file))) {
  const source = fs.readFileSync(file, "utf8");
  const relative = path
    .relative(postsRoot, file)
    .replace(/\\/g, "/")
    .replace(/\.(md|mdx)$/, "");
  const pathname = withTrailingSlash(`/posts/${relative}`);
  const noindex = frontmatterValue(source, "noindex") === "true";
  const lastmod = frontmatterValue(source, "lastModified") || frontmatterValue(source, "date");
  sitemapMeta.set(pathname, { noindex, lastmod });
}

function pathnameOf(value) {
  try {
    return new URL(value).pathname;
  } catch {
    return value;
  }
}

export default defineConfig({
  site: kit.site.url,
  output: "static",
  trailingSlash: "always",
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !sitemapMeta.get(pathnameOf(page))?.noindex,
      serialize(item) {
        const meta = sitemapMeta.get(pathnameOf(item.url));
        if (meta?.lastmod) item.lastmod = new Date(meta.lastmod);
        return item;
      },
    }),
  ],
});
