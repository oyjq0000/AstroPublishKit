import fs from "node:fs";
import path from "node:path";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import {
  DEFAULT_POST_CATEGORY,
  DEFAULT_POST_DESCRIPTION,
  DEFAULT_POST_LANG,
  POST_DESCRIPTION_MAX_LENGTH,
  POST_DESCRIPTION_MIN_LENGTH,
  createPostDocument,
  normalizePostExtension,
  normalizePostSlug,
  parseTags,
  postSlugFromTitle,
  titleFromSlug,
} from "../src/lib/content-rules.mjs";

const postsDir = path.resolve("src/content/posts");

class CliError extends Error {
  constructor(message, detail = "") {
    super(message);
    this.detail = detail;
  }
}

function relative(file) {
  return path.relative(process.cwd(), file).split(path.sep).join("/");
}

function parseArgs(argv) {
  let requested = "";
  let extension = "";

  for (const arg of argv) {
    if (arg === "--mdx") {
      extension = "mdx";
      continue;
    }
    if (arg === "--md") {
      extension = "md";
      continue;
    }
    if (arg.startsWith("--")) throw new CliError(`Unknown option: ${arg}`);
    if (requested) throw new CliError("Only one post slug may be provided.");
    requested = arg;
  }

  const explicit = requested.match(/\.(md|mdx)$/i)?.[1]?.toLowerCase();
  if (explicit && extension && explicit !== extension) {
    throw new CliError(`Conflicting post formats: .${explicit} and --${extension}.`);
  }

  return {
    requested: requested.replace(/\.(md|mdx)$/i, ""),
    extension: explicit || extension,
  };
}

function findExistingPost(slug) {
  for (const extension of ["md", "mdx"]) {
    const file = path.join(postsDir, `${slug}.${extension}`);
    if (fs.existsSync(file)) return file;
  }
  return "";
}

function ensureAvailable(slug) {
  const existing = findExistingPost(slug);
  if (existing) throw new CliError("Post already exists:", relative(existing));
}

async function askRequired(rl, label) {
  while (true) {
    const value = (await rl.question(`${label}: `)).trim();
    if (value) return value;
    console.error(`✗ Missing ${label.toLowerCase()}.`);
  }
}

async function askDescription(rl) {
  while (true) {
    const value = await askRequired(rl, "Description");
    if (value.length >= POST_DESCRIPTION_MIN_LENGTH && value.length <= POST_DESCRIPTION_MAX_LENGTH) return value;
    console.error(`✗ Description must be ${POST_DESCRIPTION_MIN_LENGTH}-${POST_DESCRIPTION_MAX_LENGTH} characters.`);
  }
}

async function askWithDefault(rl, label, defaultValue) {
  const value = (await rl.question(`${label} [${defaultValue}]: `)).trim();
  return value || defaultValue;
}

async function askBoolean(rl, label, defaultValue) {
  const hint = defaultValue ? "Y/n" : "y/N";
  while (true) {
    const value = (await rl.question(`${label} [${hint}]: `)).trim().toLowerCase();
    if (!value) return defaultValue;
    if (["y", "yes", "true"].includes(value)) return true;
    if (["n", "no", "false"].includes(value)) return false;
    console.error("✗ Enter yes or no.");
  }
}

async function askExtension(rl, preset = "") {
  if (preset) return normalizePostExtension(preset);
  while (true) {
    const value = await askWithDefault(rl, "Format (md/mdx)", "md");
    try {
      return normalizePostExtension(value);
    } catch (error) {
      console.error(`✗ ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

async function interactiveOptions(presetExtension = "") {
  const rl = createInterface({ input, output });
  try {
    const title = await askRequired(rl, "Title");
    const suggestedSlug = postSlugFromTitle(title);
    const requestedSlug = await askWithDefault(rl, "Slug", suggestedSlug);
    const slug = normalizePostSlug(requestedSlug);
    if (slug !== requestedSlug) console.log(`  Slug normalized to: ${slug}`);
    ensureAvailable(slug);

    const description = await askDescription(rl);
    const category = await askWithDefault(rl, "Category", DEFAULT_POST_CATEGORY);
    const tags = parseTags(await rl.question("Tags (comma-separated): "));
    const author = (await rl.question("Author (optional): ")).trim();
    const lang = await askWithDefault(rl, "Language", DEFAULT_POST_LANG);
    const draft = await askBoolean(rl, "Draft?", true);
    const featured = await askBoolean(rl, "Featured?", false);
    const extension = await askExtension(rl, presetExtension);

    return { title, slug, description, category, tags, author, lang, draft, featured, extension };
  } finally {
    rl.close();
  }
}

function nonInteractiveOptions(requested, extension = "") {
  const slug = normalizePostSlug(requested);
  return {
    title: titleFromSlug(slug),
    slug,
    description: DEFAULT_POST_DESCRIPTION,
    category: DEFAULT_POST_CATEGORY,
    tags: [],
    author: "",
    lang: DEFAULT_POST_LANG,
    draft: true,
    featured: false,
    extension: normalizePostExtension(extension || "md"),
  };
}

function writePost(options) {
  ensureAvailable(options.slug);
  fs.mkdirSync(postsDir, { recursive: true });
  const file = path.join(postsDir, `${options.slug}.${options.extension}`);
  fs.writeFileSync(
    file,
    createPostDocument({
      title: options.title,
      description: options.description,
      category: options.category,
      tags: options.tags,
      author: options.author,
      lang: options.lang,
      draft: options.draft,
      noindex: false,
      featured: options.featured,
    }),
    "utf8",
  );
  console.log(`✓ Created ${relative(file)}`);
}

function printError(error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`✗ ${message}`);
  if (error instanceof CliError && error.detail) console.error(`  ${error.detail}`);
}

async function main() {
  const { requested, extension } = parseArgs(process.argv.slice(2));
  const options = requested ? nonInteractiveOptions(requested, extension) : await interactiveOptions(extension);
  writePost(options);
}

main().catch((error) => {
  printError(error);
  process.exitCode = 1;
});
