import fs from "node:fs";
import path from "node:path";
import {
  POST_DESCRIPTION_MIN_LENGTH,
  POST_DESCRIPTION_RECOMMENDED_MAX_LENGTH,
  POST_DESCRIPTION_RECOMMENDED_MIN_LENGTH,
  POST_SUMMARY_MAX_LENGTH,
  POST_SUMMARY_MIN_LENGTH,
  POST_STALE_AFTER_DAYS,
  frontmatterList,
  frontmatterScalar,
  isPortableImageSource,
  markdownImages,
} from "../src/lib/content-rules.mjs";
import { slugify } from "../src/lib/text.mjs";
import { taxonomySlugCollisions } from "../src/lib/taxonomy.mjs";

const root = path.resolve("src/content/posts");
const errors = [];
const warnings = [];
const tagEntries = [];
const categoryEntries = [];
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

  if (/^summary:/m.test(frontmatter)) {
    const summary = frontmatterScalar(frontmatter, "summary");
    if (summary.length < POST_SUMMARY_MIN_LENGTH || summary.length > POST_SUMMARY_MAX_LENGTH) {
      addError(
        relative,
        `Summary must be ${POST_SUMMARY_MIN_LENGTH}-${POST_SUMMARY_MAX_LENGTH} characters when provided.`,
        "Write one concise plain-text quick answer, or remove the optional summary field.",
      );
    }
  }

  const cleanBody = stripFencedCode(body);
  if (/^#\s+/m.test(cleanBody)) {
    addError(
      relative,
      "The body contains an H1 even though the page already renders the title as H1.",
      "Remove the body H1.",
    );
  }
  const reportedImageSources = new Set();
  for (const image of markdownImages(cleanBody)) {
    if (!image.alt.trim()) {
      addError(relative, "A Markdown image has empty alt text.", "Describe the image between the square brackets.");
    }
    if (image.src && !isPortableImageSource(image.src) && !reportedImageSources.has(image.src)) {
      reportedImageSources.add(image.src);
      addError(
        relative,
        `Image source uses a non-portable URI: ${image.src}`,
        "Copy the image into public/ or use a valid HTTP(S) image URL.",
      );
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

  const publishedDate = new Date(frontmatterScalar(frontmatter, "date"));
  const lastModifiedValue = frontmatterScalar(frontmatter, "lastModified");
  const lastModifiedDate = lastModifiedValue ? new Date(lastModifiedValue) : undefined;
  if (
    lastModifiedDate &&
    Number.isFinite(lastModifiedDate.valueOf()) &&
    Number.isFinite(publishedDate.valueOf()) &&
    lastModifiedDate.valueOf() < publishedDate.valueOf()
  ) {
    addError(
      relative,
      "lastModified must not be earlier than date.",
      "Remove lastModified or set it to the publication date or a later meaningful revision date.",
    );
  }

  const freshnessDate = lastModifiedDate || publishedDate;
  if (Number.isFinite(freshnessDate.valueOf())) {
    const ageDays = (Date.now() - freshnessDate.valueOf()) / 86_400_000;
    if (ageDays >= POST_STALE_AFTER_DAYS) {
      addWarning(
        relative,
        `Content has not been updated in at least ${POST_STALE_AFTER_DAYS} days.`,
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
