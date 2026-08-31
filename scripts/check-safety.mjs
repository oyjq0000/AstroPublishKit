import fs from "node:fs";
import path from "node:path";

const roots = ["src", "public", "docs"];
const topLevel = [".env.example", "astro-publish-kit.config.mjs", "astro.config.mjs", "wrangler.jsonc", "README.md", "LICENSE", "THIRD_PARTY_NOTICES.md"];
const forbidden = [
  { pattern: /www\.runningbai\.cn|umami\.runningbai\.cn/gi, label: "source production domain" },
  { pattern: /17b16bd8-b4ee-45df-b63e-098824495efd/gi, label: "source analytics identifier" },
  { pattern: /44e6d114b79b25830220fb01c31e714d/gi, label: "source analytics identifier" },
  { pattern: /阿白/g, label: "source personal author identity" },
  { pattern: /\bghp_[A-Za-z0-9]{20,}\b/g, label: "GitHub token-like value" },
  { pattern: /\bAKIA[0-9A-Z]{16}\b/g, label: "AWS access-key-like value" },
  { pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g, label: "private key" }
];

function walk(target) {
  if (!fs.existsSync(target)) return [];
  const stat = fs.statSync(target);
  if (stat.isFile()) return [target];
  return fs.readdirSync(target, { withFileTypes: true }).flatMap((entry) => walk(path.join(target, entry.name)));
}

const files = [...roots.flatMap(walk), ...topLevel.filter(fs.existsSync)].filter((file) => !/\.(png|jpe?g|webp|gif|ico)$/i.test(file));
const errors = [];
for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  for (const rule of forbidden) {
    rule.pattern.lastIndex = 0;
    if (rule.pattern.test(source)) errors.push(`${file}: contains ${rule.label}`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Safety checks passed.");
