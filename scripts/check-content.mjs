import fs from "node:fs";
import path from "node:path";
import { slugify } from "../src/lib/text.mjs";
import { taxonomySlugCollisions } from "../src/lib/taxonomy.mjs";

const root = path.resolve("src/content/posts");
const errors = [];
const warnings = [];
const tagEntries = [];
const categoryEntries = [];
const staleAfterDays = 365;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function unquote(value) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function scalarValue(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.*?)\\s*$`, "m"));
  return match ? unquote(match[1]) : "";
}

function listValues(frontmatter, key) {
  const line = frontmatter.match(new RegExp(`^${key}:\\s*(.*?)\\s*$`, "m"));
  if (!line) return [];
  const inline = line[1].trim();
  if (inline.startsWith("[") && inline.endsWith("]")) {
    const body = inline.slice(1, -1).trim();
    return body ? body.split(",").map(unquote).filter(Boolean) : [];
  }
  if (inline) return [unquote(inline)].filter(Boolean);
  const after = frontmatter.slice((line.index ?? 0) + line[0].length);
  const values = [];
  for (const blockLine of after.split("\n").slice(1)) {
    const item = blockLine.match(/^\s+-\s+(.+?)\s*$/);
    if (item) {
      values.push(unquote(item[1]));
      continue;
    }
    if (blockLine.trim() && !/^\s/.test(blockLine)) break;
  }
  return values.filter(Boolean);
}

function stripFencedCode(source) {
  return source.replace(/```[\s\S]*?```/g, "").replace(/~~~[\s\S]*?~~~/g, "");
}

function isAssetPath(pathname) {
  const lastSegment = pathname.split("/").filter(Boolean).at(-1) ?? "";
  return /\.[A-Za-z0-9]{1,10}$/.test(lastSegment);
}

function inspectInternalLinks(body, relative) {
  const clean = stripFencedCode(body);
  let count = 0;
  for (const match of clean.matchAll(/(?<!!)\[[^\]]*\]\(([^)]+)\)/g)) {
    let target = match[1].trim().split(/\s+["']/)[0];
    if (target.startsWith("<") && target.endsWith(">")) target = target.slice(1, -1);
    if (!target.startsWith("/") || target.startsWith("//")) continue;
    count += 1;
    if (target.includes("\\")) errors.push(`${relative}: internal link "${target}" must use forward slashes`);
    let url;
    try {
      url = new URL(target, "https://internal.invalid");
      decodeURIComponent(url.pathname);
    } catch {
      errors.push(`${relative}: malformed internal link "${target}"`);
      continue;
    }
    if (url.pathname.includes("//")) errors.push(`${relative}: internal link "${target}" contains duplicate slashes`);
    if (!isAssetPath(url.pathname) && url.pathname !== "/" && !url.pathname.endsWith("/")) {
      errors.push(`${relative}: internal page link "${target}" must end with a trailing slash`);
    }
  }
  return count;
}

function inspectHeadings(body, relative) {
  const clean = stripFencedCode(body);
  let previousDepth = 1;
  for (const match of clean.matchAll(/^(#{1,6})\s+/gm)) {
    const depth = match[1].length;
    if (depth === 1) continue;
    if (depth > previousDepth + 1) warnings.push(`${relative}: heading level jumps from H${previousDepth} to H${depth}`);
    previousDepth = depth;
  }
}

for (const file of walk(root).filter((file) => /\.(md|mdx)$/.test(file))) {
  const source = fs.readFileSync(file, "utf8");
  const relative = path.relative(process.cwd(), file).split(path.sep).join("/");
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    errors.push(`${relative}: missing valid YAML frontmatter fence`);
    continue;
  }
  const [, frontmatter, body] = match;
  for (const key of ["title", "description", "date", "category", "tags"]) {
    if (!new RegExp(`^${key}:`, "m").test(frontmatter)) errors.push(`${relative}: missing ${key}`);
  }

  const description = scalarValue(frontmatter, "description");
  if (description.length < 20) errors.push(`${relative}: description should be at least 20 characters`);
  if (description.length < 50) warnings.push(`${relative}: description is shorter than the recommended 50 characters`);
  if (description.length > 160) warnings.push(`${relative}: description is longer than the recommended 160 characters`);

  const cleanBody = stripFencedCode(body);
  if (/^#\s+/m.test(cleanBody)) errors.push(`${relative}: do not add an H1 in the body; the page renders title as H1`);
  for (const image of cleanBody.matchAll(/!\[([^\]]*)\]\([^)]+\)/g)) {
    if (!image[1].trim()) errors.push(`${relative}: Markdown image has empty alt text`);
  }

  inspectHeadings(body, relative);
  const internalLinks = inspectInternalLinks(body, relative);
  if (internalLinks === 0) warnings.push(`${relative}: no root-relative internal page links found`);

  const date = new Date(scalarValue(frontmatter, "lastModified") || scalarValue(frontmatter, "date"));
  if (Number.isFinite(date.valueOf())) {
    const ageDays = (Date.now() - date.valueOf()) / 86_400_000;
    if (ageDays > staleAfterDays) warnings.push(`${relative}: content has not been updated in more than ${staleAfterDays} days`);
  }

  const category = scalarValue(frontmatter, "category");
  if (category) {
    const slug = slugify(category);
    if (!slug) errors.push(`${relative}: category "${category}" produces an empty slug`);
    categoryEntries.push({ value: category, file: relative });
  }
  for (const tag of listValues(frontmatter, "tags")) {
    const slug = slugify(tag);
    if (!slug) errors.push(`${relative}: tag "${tag}" produces an empty slug`);
    tagEntries.push({ value: tag, file: relative });
  }
}

for (const [kind, entries] of [
  ["category", categoryEntries],
  ["tag", tagEntries]
]) {
  for (const collision of taxonomySlugCollisions(entries)) {
    errors.push(`${collision.second.file}: ${kind} "${collision.second.value}" collides with "${collision.first.value}" at slug "${collision.slug}" (${collision.first.file})`);
  }
}

for (const warning of warnings) console.warn(`warning: ${warning}`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Content checks passed${warnings.length ? ` with ${warnings.length} warning(s)` : ""}.`);
