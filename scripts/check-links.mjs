import fs from "node:fs";
import path from "node:path";
import kit from "../astro-publish-kit.config.mjs";

const dist = path.resolve("dist");
const errors = [];
const origin = new URL(kit.site.url).origin;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function routeForHtml(file) {
  const relative = path.relative(dist, file).split(path.sep).join("/");
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) return `/${relative.slice(0, -"index.html".length)}`;
  return `/${relative}`;
}

function isAssetPath(pathname) {
  const lastSegment = pathname.split("/").filter(Boolean).at(-1) ?? "";
  return /\.[A-Za-z0-9]{1,10}$/.test(lastSegment) && !lastSegment.endsWith(".html");
}

function localPageFile(pathname) {
  const decoded = decodeURIComponent(pathname);
  if (decoded === "/") return path.join(dist, "index.html");
  if (decoded.endsWith(".html")) return path.join(dist, decoded.replace(/^\//, ""));
  return path.join(dist, decoded.replace(/^\//, ""), "index.html");
}

if (!fs.existsSync(dist)) {
  console.error("dist/ is missing; run the build before check:links");
  process.exit(1);
}

for (const file of walk(dist).filter((file) => file.endsWith(".html"))) {
  const sourceRoute = routeForHtml(file);
  const pageUrl = new URL(sourceRoute, `${origin}/`);
  const html = fs
    .readFileSync(file, "utf8")
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<!--([\s\S]*?)-->/g, "");

  for (const match of html.matchAll(/<a\b[^>]*\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
    const href = (match[1] ?? match[2] ?? match[3] ?? "").replaceAll("&amp;", "&").trim();
    if (!href || href.startsWith("#")) continue;
    if (/^(?:mailto:|tel:|javascript:|data:)/i.test(href) || href.startsWith("//")) continue;

    let target;
    try {
      target = new URL(href, pageUrl);
    } catch {
      errors.push(`${sourceRoute}: malformed href "${href}"`);
      continue;
    }
    if (target.protocol !== "http:" && target.protocol !== "https:") continue;
    if (target.origin !== origin) continue;

    let pathname;
    try {
      pathname = decodeURIComponent(target.pathname);
    } catch {
      errors.push(`${sourceRoute}: malformed encoded internal href "${href}"`);
      continue;
    }
    if (pathname.includes("\\") || pathname.includes("//")) {
      errors.push(`${sourceRoute}: malformed internal path "${href}"`);
      continue;
    }
    if (isAssetPath(pathname)) continue;
    if (pathname !== "/" && !pathname.endsWith("/") && !pathname.endsWith(".html")) {
      errors.push(`${sourceRoute}: internal page href "${href}" must end with a trailing slash`);
      continue;
    }
    const targetFile = localPageFile(target.pathname);
    if (!fs.existsSync(targetFile)) errors.push(`${sourceRoute}: internal page href "${href}" has no generated page`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Internal link checks passed.");
