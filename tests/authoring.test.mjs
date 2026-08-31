import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  DEFAULT_POST_DESCRIPTION,
  createPostDocument,
  extractFrontmatter,
  frontmatterBoolean,
  frontmatterList,
  frontmatterScalar,
  normalizePostExtension,
  normalizePostSlug,
  parseTags,
  postSlugFromTitle,
} from "../src/lib/content-rules.mjs";

const newPostScript = path.resolve("scripts/new-post.mjs");

function tempProject() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "astro-publish-kit-authoring-"));
  fs.mkdirSync(path.join(root, "src/content/posts"), { recursive: true });
  return root;
}

test("slug normalization keeps letters and numbers and removes unsafe separators", () => {
  assert.equal(normalizePostSlug("  Hello, Astro 7!  "), "hello-astro-7");
  assert.equal(normalizePostSlug("你好 Astro.mdx"), "你好-astro");
});

test("invalid slug is rejected", () => {
  assert.throws(() => normalizePostSlug("--- !!! ---"), /Invalid slug/);
});

test("title suggests a normalized slug", () => {
  assert.equal(postSlugFromTitle("A Better Writing Workflow"), "a-better-writing-workflow");
});

test("tags parsing trims, removes blanks and keeps stable order", () => {
  assert.deepEqual(parseTags("Astro, MDX, Astro,  , Static Sites"), ["Astro", "MDX", "Static Sites"]);
});

test("post formats accept Markdown and MDX only", () => {
  assert.equal(normalizePostExtension(".md"), "md");
  assert.equal(normalizePostExtension("MDX"), "mdx");
  assert.throws(() => normalizePostExtension("txt"), /Invalid post format/);
});

test("generated frontmatter is schema-aligned and draft-safe by default", () => {
  const source = createPostDocument({
    title: "Authoring helpers",
    description: "A sufficiently detailed description for the generated post fixture.",
    category: "Engineering",
    tags: ["Astro", "MDX"],
    date: "2026-08-31",
  });
  const frontmatter = extractFrontmatter(source);
  assert.ok(frontmatter);
  assert.equal(frontmatterScalar(frontmatter, "title"), "Authoring helpers");
  assert.equal(frontmatterScalar(frontmatter, "date"), "2026-08-31");
  assert.deepEqual(frontmatterList(frontmatter, "tags"), ["Astro", "MDX"]);
  assert.equal(frontmatterBoolean(frontmatter, "draft"), true);
  assert.equal(frontmatterBoolean(frontmatter, "noindex"), false);
  assert.equal(frontmatterBoolean(frontmatter, "featured"), false);
  assert.equal(frontmatterScalar(frontmatter, "lang"), "en");
});

test("non-interactive new-post keeps compatibility and supports mdx", () => {
  const root = tempProject();
  try {
    const output = execFileSync(process.execPath, [newPostScript, "my-test-post.mdx"], {
      cwd: root,
      encoding: "utf8",
    });
    const file = path.join(root, "src/content/posts/my-test-post.mdx");
    const source = fs.readFileSync(file, "utf8");
    assert.match(output, /✓ Created src\/content\/posts\/my-test-post\.mdx/);
    assert.match(source, /draft: true/);
    assert.match(source, new RegExp(DEFAULT_POST_DESCRIPTION.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("new-post protects an existing slug across Markdown and MDX", () => {
  const root = tempProject();
  try {
    fs.writeFileSync(path.join(root, "src/content/posts/existing.md"), "existing", "utf8");
    const result = spawnSync(process.execPath, [newPostScript, "existing", "--mdx"], {
      cwd: root,
      encoding: "utf8",
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /✗ Post already exists:/);
    assert.match(result.stderr, /src\/content\/posts\/existing\.md/);
    assert.equal(fs.existsSync(path.join(root, "src/content/posts/existing.mdx")), false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
