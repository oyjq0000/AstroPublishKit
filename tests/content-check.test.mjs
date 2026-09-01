import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  POST_SUMMARY_MAX_LENGTH,
  POST_SUMMARY_MIN_LENGTH,
  isPortableImageSource,
  markdownImages,
} from "../src/lib/content-rules.mjs";

const checkContentScript = path.resolve("scripts/check-content.mjs");

function tempProject() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "astro-publish-kit-content-check-"));
  fs.mkdirSync(path.join(root, "src/content/posts"), { recursive: true });
  return root;
}

function postSource(body, extraFrontmatter = "") {
  return `---\ntitle: "Synthetic content fixture"\ndescription: "A synthetic fixture with enough description text to keep editorial checks focused on the requested rule."\n${extraFrontmatter}date: 2026-09-01\ncategory: "Testing"\ntags: ["Images"]\n---\n\n${body}\n`;
}

function runContentCheck(root) {
  return spawnSync(process.execPath, [checkContentScript], {
    cwd: root,
    encoding: "utf8",
  });
}

test("Markdown image parsing keeps standard destinations and titles", () => {
  assert.deepEqual(markdownImages('![中文说明](https://example.com/a_(b).webp "Preview")'), [
    { alt: "中文说明", src: "https://example.com/a_(b).webp" },
  ]);
  assert.deepEqual(markdownImages("![Local](<../images/example image.webp>)"), [
    { alt: "Local", src: "../images/example image.webp" },
  ]);
});

test("image portability accepts web and relative sources and rejects local or non-Web sources", () => {
  for (const source of [
    "/images/posts/demo/image.webp",
    "/home/banner.webp",
    "https://example.com/a.webp",
    "http://example.com/a.png",
    "./image.webp",
    "../images/image.webp",
    "images/image.webp",
    "//cdn.example.com/image.webp",
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
  ]) {
    assert.equal(isPortableImageSource(source), true, source);
  }

  for (const source of [
    "en-resource://database/6730:1",
    "file:///Users/foo/a.png",
    "file:///home/foo/a.png",
    String.raw`C:\Users\foo\a.png`,
    "C:/Users/foo/a.png",
    "/Users/foo/a.png",
    "/home/foo/a.png",
    "custom-protocol://asset/123",
  ]) {
    assert.equal(isPortableImageSource(source), false, source);
  }
});

test("check-content enforces the optional summary length when the field is present", () => {
  const root = tempProject();
  try {
    fs.writeFileSync(
      path.join(root, "src/content/posts/short.md"),
      postSource("Body copy.", `summary: "${"x".repeat(POST_SUMMARY_MIN_LENGTH - 1)}"\n`),
      "utf8",
    );
    fs.writeFileSync(
      path.join(root, "src/content/posts/long.mdx"),
      postSource("Body copy.", `summary: "${"x".repeat(POST_SUMMARY_MAX_LENGTH + 1)}"\n`),
      "utf8",
    );

    const result = runContentCheck(root);
    assert.equal(result.status, 1);
    assert.equal(
      result.stderr.split(
        `Summary must be ${POST_SUMMARY_MIN_LENGTH}-${POST_SUMMARY_MAX_LENGTH} characters when provided.`,
      ).length - 1,
      2,
    );
    assert.match(result.stdout, /2 errors/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("check-content blocks lastModified values earlier than date", () => {
  const root = tempProject();
  try {
    fs.writeFileSync(
      path.join(root, "src/content/posts/invalid-order.md"),
      postSource("Body copy.", "lastModified: 2026-08-31\n"),
      "utf8",
    );

    const result = runContentCheck(root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /lastModified must not be earlier than date\./);
    assert.match(result.stdout, /1 error/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("check-content accepts lastModified on the publication date or later", () => {
  const root = tempProject();
  try {
    fs.writeFileSync(
      path.join(root, "src/content/posts/same-day.md"),
      postSource("Body copy.", "lastModified: 2026-09-01\n"),
      "utf8",
    );
    fs.writeFileSync(
      path.join(root, "src/content/posts/later.md"),
      postSource("Body copy.", "lastModified: 2026-09-02\n"),
      "utf8",
    );

    const result = runContentCheck(root);
    assert.equal(result.status, 0, result.stderr);
    assert.doesNotMatch(result.stderr, /lastModified must not be earlier than date\./);
    assert.match(result.stdout, /0 errors/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("check-content accepts portable Markdown image sources in .md", () => {
  const root = tempProject();
  try {
    const body = [
      "![站点图片](/images/posts/demo/image.webp)",
      "![HTTPS image](https://example.com/a.webp)",
      "![HTTP image](http://example.com/a.png)",
      "![Sibling image](./image.webp)",
      "![Parent image](../images/image.webp)",
    ].join("\n\n");
    fs.writeFileSync(path.join(root, "src/content/posts/valid.md"), postSource(body), "utf8");

    const result = runContentCheck(root);
    assert.equal(result.status, 0, result.stderr);
    assert.doesNotMatch(result.stderr, /non-portable URI/);
    assert.match(result.stdout, /1 post checked/);
    assert.match(result.stdout, /0 errors/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("check-content blocks non-portable image sources in .mdx", () => {
  const root = tempProject();
  const invalidSources = [
    "en-resource://database/6730:1",
    "file:///Users/foo/a.png",
    "file:///home/foo/a.png",
    String.raw`C:\Users\foo\a.png`,
    "C:/Users/foo/a.png",
    "/Users/foo/a.png",
    "/home/foo/a.png",
    "custom-protocol://asset/123",
  ];

  try {
    const body = invalidSources.map((source, index) => `![Synthetic ${index + 1}](${source})`).join("\n\n");
    fs.writeFileSync(path.join(root, "src/content/posts/invalid.mdx"), postSource(body), "utf8");

    const result = runContentCheck(root);
    assert.equal(result.status, 1);
    for (const source of invalidSources) {
      assert.match(
        result.stderr,
        new RegExp(`Image source uses a non-portable URI: ${source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
      );
    }
    assert.match(result.stderr, /Fix: Copy the image into public\/ or use a valid HTTP\(S\) image URL\./);
    assert.match(result.stdout, /8 errors/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("check-content reports distinct bad image sources once per file", () => {
  const root = tempProject();
  try {
    const repeated = "en-resource://database/6730:1";
    const body = [`![First](${repeated})`, `![Repeated](${repeated})`, "![Other](custom-protocol://asset/123)"].join(
      "\n\n",
    );
    fs.writeFileSync(path.join(root, "src/content/posts/dedup.md"), postSource(body), "utf8");

    const result = runContentCheck(root);
    assert.equal(result.status, 1);
    assert.equal(result.stderr.split(repeated).length - 1, 1);
    assert.match(result.stdout, /2 errors/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
