import fs from "node:fs";
import path from "node:path";
import kit from "../astro-publish-kit.config.mjs";

const dist = path.resolve("dist");
const postsRoot = path.resolve("src/content/posts");
const errors = [];
const expectedOrigin = new URL(kit.site.url).origin;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function xmlText(value) {
  return value.replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">").trim();
}

function tagValue(source, tag) {
  const match = source.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? xmlText(match[1]) : "";
}

function scalarValue(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*["']?([^\\n"']+)["']?\\s*$`, "m"));
  return match?.[1]?.trim() ?? "";
}

function localPageFile(pathname) {
  const decoded = decodeURIComponent(pathname);
  if (decoded === "/") return path.join(dist, "index.html");
  if (decoded.endsWith(".html")) return path.join(dist, decoded.replace(/^\//, ""));
  return path.join(dist, decoded.replace(/^\//, ""), "index.html");
}

if (!fs.existsSync(dist)) {
  console.error("dist/ is missing; run the build before check:sitemap");
  process.exit(1);
}

let sitemapFiles = [];
const indexFile = path.join(dist, "sitemap-index.xml");
const directFile = path.join(dist, "sitemap.xml");
if (fs.existsSync(indexFile)) {
  const source = fs.readFileSync(indexFile, "utf8");
  for (const locMatch of source.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)) {
    const loc = xmlText(locMatch[1]);
    let url;
    try {
      url = new URL(loc);
    } catch {
      errors.push(`sitemap index contains invalid loc: ${loc}`);
      continue;
    }
    if (url.origin !== expectedOrigin) errors.push(`sitemap index loc uses unexpected origin: ${loc}`);
    sitemapFiles.push(path.join(dist, decodeURIComponent(url.pathname).replace(/^\//, "")));
  }
} else if (fs.existsSync(directFile)) {
  sitemapFiles = [directFile];
} else {
  errors.push("sitemap-index.xml or sitemap.xml is missing from dist/");
}

const entries = new Map();
for (const file of sitemapFiles) {
  if (!fs.existsSync(file)) {
    errors.push(`referenced sitemap file is missing: ${path.relative(dist, file)}`);
    continue;
  }
  const source = fs.readFileSync(file, "utf8");
  for (const blockMatch of source.matchAll(/<url>([\s\S]*?)<\/url>/gi)) {
    const block = blockMatch[1];
    const loc = tagValue(block, "loc");
    const lastmod = tagValue(block, "lastmod");
    let url;
    try {
      url = new URL(loc);
    } catch {
      errors.push(`${path.basename(file)} contains invalid URL: ${loc}`);
      continue;
    }
    if (url.origin !== expectedOrigin) errors.push(`${loc} uses unexpected origin; expected ${expectedOrigin}`);
    if (url.search || url.hash) errors.push(`${loc} must not contain a query or fragment`);
    if (url.pathname !== "/" && !url.pathname.endsWith("/"))
      errors.push(`${loc} must follow the trailing-slash page URL convention`);
    if (entries.has(url.href)) errors.push(`duplicate sitemap URL: ${url.href}`);
    entries.set(url.href, { url, lastmod });
    try {
      if (!fs.existsSync(localPageFile(url.pathname))) errors.push(`${loc} has no matching generated HTML page`);
    } catch {
      errors.push(`${loc} contains invalid URL encoding`);
    }
  }
}

for (const file of walk(postsRoot).filter((file) => /\.(md|mdx)$/.test(file))) {
  const source = fs.readFileSync(file, "utf8");
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) continue;
  const frontmatter = match[1];
  const relative = path
    .relative(postsRoot, file)
    .split(path.sep)
    .join("/")
    .replace(/\.(md|mdx)$/, "");
  const href = new URL(`/posts/${relative}/`, `${expectedOrigin}/`).href;
  const draft = scalarValue(frontmatter, "draft") === "true";
  const noindex = scalarValue(frontmatter, "noindex") === "true";
  const entry = entries.get(href);
  if (draft || noindex) {
    if (entry) errors.push(`${href} must be excluded from the sitemap because it is ${draft ? "draft" : "noindex"}`);
    continue;
  }
  if (!entry) {
    errors.push(`${href} is a published indexable post but is missing from the sitemap`);
    continue;
  }
  const lastModified = scalarValue(frontmatter, "lastModified");
  if (lastModified) {
    const expected = new Date(lastModified);
    const actual = new Date(entry.lastmod);
    if (!entry.lastmod || !Number.isFinite(actual.valueOf()) || actual.valueOf() !== expected.valueOf()) {
      errors.push(`${href} sitemap lastmod does not match frontmatter lastModified (${lastModified})`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Sitemap checks passed for ${entries.size} URL(s).`);
