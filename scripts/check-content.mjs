import fs from "node:fs";
import path from "node:path";
import { slugify } from "../src/lib/text.mjs";

const root = path.resolve("src/content/posts");
const errors = [];
const tagSlugs = new Map();
const categorySlugs = new Map();

function walk(dir) {
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

function recordSlug(map, kind, value, relative) {
  const slug = slugify(value);
  if (!slug) {
    errors.push(`${relative}: ${kind} "${value}" produces an empty slug`);
    return;
  }
  const existing = map.get(slug);
  if (existing && existing.value !== value) {
    errors.push(`${relative}: ${kind} "${value}" collides with "${existing.value}" at slug "${slug}" (${existing.file})`);
    return;
  }
  if (!existing) map.set(slug, { value, file: relative });
}

for (const file of walk(root).filter((file) => /\.(md|mdx)$/.test(file))) {
  const source = fs.readFileSync(file, "utf8");
  const relative = path.relative(process.cwd(), file);
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
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
  if (/^#\s+/m.test(body)) errors.push(`${relative}: do not add an H1 in the body; the page renders title as H1`);
  for (const image of body.matchAll(/!\[([^\]]*)\]\([^)]+\)/g)) {
    if (!image[1].trim()) errors.push(`${relative}: Markdown image has empty alt text`);
  }

  const category = scalarValue(frontmatter, "category");
  if (category) recordSlug(categorySlugs, "category", category, relative);
  for (const tag of listValues(frontmatter, "tags")) recordSlug(tagSlugs, "tag", tag, relative);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Content checks passed.");
