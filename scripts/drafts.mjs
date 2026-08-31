import fs from "node:fs";
import path from "node:path";
import { extractFrontmatter, frontmatterBoolean, frontmatterScalar } from "../src/lib/content-rules.mjs";

const postsDir = path.resolve("src/content/posts");

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function relative(file) {
  return path.relative(process.cwd(), file).split(path.sep).join("/");
}

function postSlug(file) {
  return path
    .relative(postsDir, file)
    .replace(/\.(md|mdx)$/i, "")
    .split(path.sep)
    .join("/");
}

function main() {
  const drafts = [];
  for (const file of walk(postsDir).filter((item) => /\.(md|mdx)$/i.test(item))) {
    const frontmatter = extractFrontmatter(fs.readFileSync(file, "utf8"));
    if (!frontmatter || !frontmatterBoolean(frontmatter, "draft")) continue;
    drafts.push({
      slug: postSlug(file),
      title: frontmatterScalar(frontmatter, "title") || postSlug(file),
      file: relative(file),
    });
  }

  drafts.sort((a, b) => a.file.localeCompare(b.file));
  if (!drafts.length) {
    console.log("✓ No draft posts found.");
    return;
  }

  console.log(`Draft posts (${drafts.length})`);
  for (const draft of drafts) console.log(`- ${draft.slug} — ${draft.title}\n  ${draft.file}`);
}

try {
  main();
} catch (error) {
  console.error(`✗ ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
