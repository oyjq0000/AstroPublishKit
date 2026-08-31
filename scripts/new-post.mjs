import fs from "node:fs";
import path from "node:path";

const requested = process.argv[2];
if (!requested) {
  console.error("Usage: npm run new-post -- my-post-slug");
  process.exit(1);
}

const slug = requested
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9-]+/g, "-")
  .replace(/^-+|-+$/g, "");

if (!slug) {
  console.error("The post slug must contain letters or numbers.");
  process.exit(1);
}

const file = path.resolve("src/content/posts", `${slug}.md`);
if (fs.existsSync(file)) {
  console.error(`Post already exists: ${file}`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const title = slug
  .split("-")
  .filter(Boolean)
  .map((part) => part[0].toUpperCase() + part.slice(1))
  .join(" ");
const content = `---\ntitle: ${title}\ndescription: Replace this sentence with a useful description of at least twenty characters.\ndate: ${today}\ncategory: General\ntags: []\ndraft: true\nnoindex: false\n---\n\nStart writing here.\n`;

fs.writeFileSync(file, content, "utf8");
console.log(`Created ${path.relative(process.cwd(), file)}`);
