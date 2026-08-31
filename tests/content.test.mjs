import assert from "node:assert/strict";
import test from "node:test";
import {
  filterPostsByCategory,
  filterPostsByTag,
  isDiscoverablePost,
  isPublishedPost,
  sortPostsByDate,
} from "../src/lib/posts.mjs";

function post(id, date, options = {}) {
  return {
    id,
    data: {
      date: new Date(date),
      category: options.category ?? "General",
      tags: options.tags ?? [],
      draft: options.draft ?? false,
      noindex: options.noindex ?? false,
    },
  };
}

test("draft and noindex semantics stay distinct", () => {
  assert.equal(isPublishedPost(post("draft", "2026-01-01", { draft: true })), false);
  assert.equal(isPublishedPost(post("noindex", "2026-01-01", { noindex: true })), true);
  assert.equal(isDiscoverablePost(post("noindex", "2026-01-01", { noindex: true })), false);
});

test("posts sort newest first without mutating the input", () => {
  const posts = [post("old", "2026-01-01"), post("new", "2026-03-01")];
  const sorted = sortPostsByDate(posts);
  assert.deepEqual(
    sorted.map((item) => item.id),
    ["new", "old"],
  );
  assert.deepEqual(
    posts.map((item) => item.id),
    ["old", "new"],
  );
});

test("category and tag filters use exact labels", () => {
  const posts = [
    post("one", "2026-01-01", { category: "Engineering", tags: ["Astro", "Web"] }),
    post("two", "2026-01-02", { category: "Notes", tags: ["Web"] }),
  ];
  assert.deepEqual(
    filterPostsByCategory(posts, "Engineering").map((item) => item.id),
    ["one"],
  );
  assert.deepEqual(
    filterPostsByTag(posts, "Web").map((item) => item.id),
    ["one", "two"],
  );
  assert.deepEqual(filterPostsByTag(posts, "web"), []);
});
