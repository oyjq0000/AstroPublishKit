import test from "node:test";
import assert from "node:assert/strict";
import { estimateReadingMinutes, slugify, stripTrailingSlash } from "../src/lib/text.mjs";

test("slugify keeps unicode words and normalizes separators", () => {
  assert.equal(slugify("Astro Publishing Kit"), "astro-publishing-kit");
  assert.equal(slugify("内容 工程"), "内容-工程");
});

test("stripTrailingSlash keeps root stable", () => {
  assert.equal(stripTrailingSlash("/"), "/");
  assert.equal(stripTrailingSlash("/posts/"), "/posts");
});

test("reading estimate never returns zero", () => {
  assert.equal(estimateReadingMinutes(""), 1);
  assert.ok(estimateReadingMinutes("word ".repeat(500)) >= 2);
});
