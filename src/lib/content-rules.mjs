import { slugify } from "./text.mjs";

export const POST_TITLE_MIN_LENGTH = 1;
export const POST_TITLE_MAX_LENGTH = 120;
export const POST_DESCRIPTION_MIN_LENGTH = 20;
export const POST_DESCRIPTION_MAX_LENGTH = 240;
export const POST_DESCRIPTION_RECOMMENDED_MIN_LENGTH = 50;
export const POST_DESCRIPTION_RECOMMENDED_MAX_LENGTH = 160;
export const DEFAULT_POST_CATEGORY = "General";
export const DEFAULT_POST_LANG = "en";
export const DEFAULT_POST_DESCRIPTION =
  "Replace this description with a useful summary of at least twenty characters.";
export const POST_EXTENSIONS = ["md", "mdx"];

function requiredText(value, label) {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`Missing ${label}.`);
  return text;
}

function yamlString(value) {
  return JSON.stringify(String(value));
}

function unquoteScalar(value) {
  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      return String(JSON.parse(trimmed)).trim();
    } catch {
      return trimmed.slice(1, -1).trim();
    }
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) return trimmed.slice(1, -1).trim();
  return trimmed;
}

export function normalizePostExtension(value = "md") {
  const extension = String(value).trim().toLowerCase().replace(/^\./, "");
  if (!POST_EXTENSIONS.includes(extension)) {
    throw new Error(`Invalid post format: use ${POST_EXTENSIONS.join(" or ")}.`);
  }
  return extension;
}

export function stripPostExtension(value) {
  return String(value ?? "")
    .trim()
    .replace(/\.(md|mdx)$/i, "");
}

export function normalizePostSlug(value) {
  const slug = slugify(stripPostExtension(value));
  if (!slug) throw new Error("Invalid slug: use at least one letter or number.");
  return slug;
}

export function postSlugFromTitle(title) {
  return normalizePostSlug(requiredText(title, "title"));
}

export function titleFromSlug(value) {
  return normalizePostSlug(value)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function parseTags(value) {
  const values = Array.isArray(value) ? value : String(value ?? "").split(",");
  const seen = new Set();
  const tags = [];
  for (const item of values) {
    const tag = String(item).trim();
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    tags.push(tag);
  }
  return tags;
}

export function formatPostDate(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.valueOf())) throw new Error("Invalid post date.");
  return date.toISOString().slice(0, 10);
}

export function createPostFrontmatter(options = {}) {
  const title = requiredText(options.title, "title");
  const description = requiredText(options.description ?? DEFAULT_POST_DESCRIPTION, "description");
  const category = requiredText(options.category ?? DEFAULT_POST_CATEGORY, "category");
  const lang = requiredText(options.lang ?? DEFAULT_POST_LANG, "language");
  const tags = parseTags(options.tags);

  if (title.length < POST_TITLE_MIN_LENGTH || title.length > POST_TITLE_MAX_LENGTH) {
    throw new Error(`Title must be ${POST_TITLE_MIN_LENGTH}-${POST_TITLE_MAX_LENGTH} characters.`);
  }
  if (description.length < POST_DESCRIPTION_MIN_LENGTH || description.length > POST_DESCRIPTION_MAX_LENGTH) {
    throw new Error(
      `Description must be ${POST_DESCRIPTION_MIN_LENGTH}-${POST_DESCRIPTION_MAX_LENGTH} characters.`,
    );
  }

  const lines = [
    "---",
    `title: ${yamlString(title)}`,
    `description: ${yamlString(description)}`,
    `date: ${formatPostDate(options.date)}`,
  ];

  if (options.lastModified) lines.push(`lastModified: ${formatPostDate(options.lastModified)}`);

  lines.push(
    `category: ${yamlString(category)}`,
    `tags: [${tags.map(yamlString).join(", ")}]`,
    `draft: ${options.draft ?? true}`,
    `noindex: ${options.noindex ?? false}`,
    `featured: ${options.featured ?? false}`,
  );

  const author = String(options.author ?? "").trim();
  if (author) lines.push(`author: ${yamlString(author)}`);

  lines.push(`lang: ${yamlString(lang)}`);

  if (options.cover) {
    const src = requiredText(options.cover.src, "cover src");
    const alt = requiredText(options.cover.alt, "cover alt");
    lines.push("cover:", `  src: ${yamlString(src)}`, `  alt: ${yamlString(alt)}`);
  }

  lines.push("---");
  return lines.join("\n");
}

export function createPostDocument(options = {}) {
  const body = String(options.body ?? "Start writing here.").trimEnd();
  return `${createPostFrontmatter(options)}\n\n${body}\n`;
}

export function extractFrontmatter(source) {
  const match = String(source ?? "").match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  return match ? match[1] : null;
}

export function frontmatterScalar(frontmatter, key) {
  const match = String(frontmatter ?? "").match(new RegExp(`^${key}:\\s*(.*?)\\s*$`, "m"));
  return match ? unquoteScalar(match[1]) : "";
}

export function frontmatterBoolean(frontmatter, key, fallback = false) {
  const value = frontmatterScalar(frontmatter, key).toLowerCase();
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

export function frontmatterList(frontmatter, key) {
  const line = String(frontmatter ?? "").match(new RegExp(`^${key}:\\s*(.*?)\\s*$`, "m"));
  if (!line) return [];

  const inline = line[1].trim();
  if (inline.startsWith("[") && inline.endsWith("]")) {
    try {
      const parsed = JSON.parse(inline);
      if (Array.isArray(parsed)) return parseTags(parsed);
    } catch {
      const body = inline.slice(1, -1).trim();
      return body ? parseTags(body.split(",").map(unquoteScalar)) : [];
    }
  }
  if (inline) return parseTags([unquoteScalar(inline)]);

  const after = String(frontmatter).slice((line.index ?? 0) + line[0].length);
  const values = [];
  for (const blockLine of after.split("\n").slice(1)) {
    const item = blockLine.match(/^\s+-\s+(.+?)\s*$/);
    if (item) {
      values.push(unquoteScalar(item[1]));
      continue;
    }
    if (blockLine.trim() && !/^\s/.test(blockLine)) break;
  }
  return parseTags(values);
}
