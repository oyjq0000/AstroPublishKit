import fs from "node:fs";
import path from "node:path";
import {
  POST_DESCRIPTION_MIN_LENGTH,
  POST_DESCRIPTION_RECOMMENDED_MAX_LENGTH,
  POST_DESCRIPTION_RECOMMENDED_MIN_LENGTH,
  frontmatterList,
  frontmatterScalar,
} from "../src/lib/content-rules.mjs";
import { slugify } from "../src/lib/text.mjs";
import { taxonomySlugCollisions } from "../src/lib/taxonomy.mjs";

const root = path.resolve("src/content/posts");
const errors = [];
const warnings = [];
const tagEntries = [];
const categoryEntries = [];
const staleAfterDays = 365;
let checkedPosts = 0;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function addError(file, message, fix = "") {
  errors.push({ file, message, fix });
}

function addWarning(file, message, fix = "") {
  warnings.push({ file, message, fix });
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
    if (target.includes("\\")) {
      addError(relative, `Internal link "${target}" must use forward slashes.`, "Replace backslashes with /.");
    }
    let url;
    try {
      url = new URL(target, "https://internal.invalid");
      decodeURIComponent(url.pathname);
    } catch {
      addError(
        relative,
        `Malformed internal link "${target}".`,
        "Use a valid root-relative URL such as /posts/example/.",
      );
      continue;
    }
    if (url.pathname.includes("//")) {
      addError(
        relative,
        `Internal link "${target}" contains duplicate slashes.`,
        "Collapse repeated slashes in the path.",
      );
    }
    if (!isAssetPath(url.pathname) && url.pathname !== "/" && !url.pathname.endsWith("/")) {
      addError(
        relative,
        `Internal page link "${target}" must end with a trailing slash.`,
        `Use ${url.pathname}/ for page links.`,
      );
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
    if (depth > previousDepth + 1) {
      addWarning(
        relative,
        `Heading level jumps from H${previousDepth} to H${depth}.`,
        "Use sequential heading levels when practical.",
      );
    }
    previousDepth = depth;
  }
}

for (const file of walk(root).filter((file) => /\.(md|mdx)$/.test(file))) {
  checkedPosts += 1;
  const source = fs.readFileSync(file, "utf8");
  const relative = path.relative(process.cwd(), file).split(path.sep).join("/");
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    addError(
      relative,
      "Missing a valid YAML frontmatter fence.",
      "Add a --- frontmatter block at the top of the file.",
    );
    continue;
  }
  const [, frontmatter, body] = match;
  for (const key of ["title", "description", "date", "category", "tags"]) {
    if (!new RegExp(`^${key}:`, "m").test(frontmatter)) {
      addError(relative, `Missing required frontmatter field "${key}".`, `Add ${key}: to the frontmatter block.`);
    }
  }

  const description = frontmatterScalar(frontmatter, "description");
  if (description.length < POST_DESCRIPTION_MIN_LENGTH) {
    addError(
      relative,
      `Description must be at least ${POST_DESCRIPTION_MIN_LENGTH} characters.`,
      "Write a standalone summary for readers and search results.",
    );
  }
  if (description.length < POST_DESCRIPTION_RECOMMENDED_MIN_LENGTH) {
    addWarning(
      relative,
      `Description is shorter than the recommended ${POST_DESCRIPTION_RECOMMENDED_MIN_LENGTH} characters.`,
      `Aim for ${POST_DESCRIPTION_RECOMMENDED_MIN_LENGTH}-${POST_DESCRIPTION_RECOMMENDED_MAX_LENGTH} characters when practical.`,
    );
  }
  if (description.length > POST_DESCRIPTION_RECOMMENDED_MAX_LENGTH) {
    addWarning(
      relative,
      `Description is longer than the recommended ${POST_DESCRIPTION_RECOMMENDED_MAX_LENGTH} characters.`,
      `Aim for ${POST_DESCRIPTION_RECOMMENDED_MIN_LENGTH}-${POST_DESCRIPTION_RECOMMENDED_MAX_LENGTH} characters when practical.`,
    );
  }

  const cleanBody = stripFencedCode(body);
  if (/^#\s+/m.test(cleanBody)) {
    addError(
      relative,
      "The body contains an H1 even though the page already renders the title as H1.",
      "Remove the body H1.",
    );
  }
  for (const image of cleanBody.matchAll(/!\[([^\]]*)\]\([^)]+\)/g)) {
    if (!image[1].trim()) {
      addError(relative, "A Markdown image has empty alt text.", "Describe the image between the square brackets.");
    }
  }

  inspectHeadings(body, relative);
  const internalLinks = inspectInternalLinks(body, relative);
  if (internalLinks === 0) {
    addWarning(
      relative,
      "No root-relative internal page links were found.",
      "Add a relevant internal page link when the article should connect to other site content.",
    );
  }

  const date = new Date(frontmatterScalar(frontmatter, "lastModified") || frontmatterScalar(frontmatter, "date"));
  if (Number.isFinite(date.valueOf())) {
    const ageDays = (Date.now() - date.valueOf()) / 86_400_000;
    if (ageDays > staleAfterDays) {
      addWarning(
        relative,
        `Content has not been updated in more than ${staleAfterDays} days.`,
        "Review the article and update lastModified after a meaningful revision.",
      );
    }
  }

  const category = frontmatterScalar(frontmatter, "category");
  if (category) {
    const slug = slugify(category);
    if (!slug) {
      addError(
        relative,
        `Category "${category}" produces an empty slug.`,
        "Use letters or numbers in the category name.",
      );
    }
    categoryEntries.push({ value: category, file: relative });
  }
  for (const tag of frontmatterList(frontmatter, "tags")) {
    const slug = slugify(tag);
    if (!slug) addError(relative, `Tag "${tag}" produces an empty slug.`, "Use letters or numbers in the tag name.");
    tagEntries.push({ value: tag, file: relative });
  }
}

for (const [kind, entries] of [
  ["category", categoryEntries],
  ["tag", tagEntries],
]) {
  for (const collision of taxonomySlugCollisions(entries)) {
    addError(
      collision.second.file,
      `${kind} "${collision.second.value}" collides with "${collision.first.value}" at slug "${collision.slug}" (${collision.first.file}).`,
      `Rename one ${kind} so the normalized URL slug is unique.`,
    );
  }
}

function printDiagnostic(level, diagnostic) {
  const write = level === "ERROR" ? console.error : console.warn;
  write(`${level} ${diagnostic.file}`);
  write(`  ${diagnostic.message}`);
  if (diagnostic.fix) write(`  Fix: ${diagnostic.fix}`);
}

function plural(count, word) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

for (const error of errors) printDiagnostic("ERROR", error);
for (const warning of warnings) printDiagnostic("WARN", warning);

console.log("\nContent check summary");
console.log(`${plural(checkedPosts, "post")} checked`);
console.log(plural(errors.length, "error"));
console.log(plural(warnings.length, "warning"));

if (errors.length) process.exit(1);
console.log("✓ Content checks passed.");
