import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const roots = ["src", "public", "docs"];
const topLevel = [
  ".env.example",
  "astro-publish-kit.config.mjs",
  "astro.config.mjs",
  "package.json",
  "wrangler.jsonc",
  "README.md",
  "README.zh-CN.md",
  "LICENSE",
  "THIRD_PARTY_NOTICES.md"
];
const forbidden = [
  { pattern: /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g, label: "GitHub token-like value" },
  { pattern: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/g, label: "GitHub fine-grained token-like value" },
  { pattern: /\bAKIA[0-9A-Z]{16}\b/g, label: "AWS access-key-like value" },
  { pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g, label: "private key" }
];

function walk(target) {
  if (!fs.existsSync(target)) return [];
  const stat = fs.statSync(target);
  if (stat.isFile()) return [target];
  return fs.readdirSync(target, { withFileTypes: true }).flatMap((entry) => walk(path.join(target, entry.name)));
}

const errors = [];
try {
  const tracked = execFileSync("git", ["ls-files"], { encoding: "utf8" })
    .split("\n")
    .filter(Boolean);
  for (const file of tracked) {
    const base = path.basename(file);
    if (/^\.env(?:\.|$)/.test(base) && base !== ".env.example") {
      errors.push(`${file}: tracked environment file; keep real environment files out of the repository`);
    }
  }
} catch {
  // The content scan still works outside a Git checkout.
}

const files = [...roots.flatMap(walk), ...topLevel.filter(fs.existsSync)].filter(
  (file) => !/\.(png|jpe?g|webp|gif|ico)$/i.test(file)
);
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
