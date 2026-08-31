import fs from "node:fs";
import path from "node:path";

const root = path.resolve("src/content/posts");
const errors = [];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
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
  const description = frontmatter.match(/^description:\s*["']?(.+?)["']?\s*$/m)?.[1]?.trim() ?? "";
  if (description.length < 20) errors.push(`${relative}: description should be at least 20 characters`);
  if (/^#\s+/m.test(body)) errors.push(`${relative}: do not add an H1 in the body; the page renders title as H1`);
  for (const image of body.matchAll(/!\[([^\]]*)\]\([^)]+\)/g)) {
    if (!image[1].trim()) errors.push(`${relative}: Markdown image has empty alt text`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Content checks passed.");
