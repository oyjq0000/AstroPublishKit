import assert from "node:assert/strict";
import test from "node:test";
import {
  adjacentPostsFor,
  filterPostsByCategory,
  filterPostsByTag,
  isDiscoverablePost,
  isPreviewablePost,
  isPublishedPost,
  relatedPostsFor,
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

test("drafts are previewable only when draft preview is explicitly enabled", () => {
  const draft = post("draft", "2026-01-01", { draft: true });
  assert.equal(isPreviewablePost(draft), false);
  assert.equal(isPreviewablePost(draft, true), true);
  assert.equal(isPreviewablePost(post("published", "2026-01-01")), true);
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

test("related posts exclude the current post, drafts, noindex posts and unrelated posts", () => {
  const current = post("current", "2026-04-01", { category: "Engineering", tags: ["Astro"] });
  const posts = [
    current,
    post("published", "2026-03-01", { category: "Notes", tags: ["Astro"] }),
    post("draft", "2026-05-01", { tags: ["Astro"], draft: true }),
    post("noindex", "2026-05-02", { tags: ["Astro"], noindex: true }),
    post("unrelated", "2026-06-01", { category: "News", tags: ["Fresh"] }),
  ];

  assert.deepEqual(
    relatedPostsFor(current, posts).map((item) => item.id),
    ["published"],
  );
});

test("shared tags are weighted more strongly and each exact shared tag adds relevance", () => {
  const current = post("current", "2026-04-01", { category: "Engineering", tags: ["Astro", "SEO"] });
  const posts = [
    post("two-tags", "2026-01-01", { category: "Notes", tags: ["Astro", "SEO"] }),
    post("tag-and-category", "2026-03-01", { category: "Engineering", tags: ["Astro"] }),
    post("category-only", "2026-04-02", { category: "Engineering", tags: [] }),
  ];

  assert.deepEqual(
    relatedPostsFor(current, posts).map((item) => item.id),
    ["two-tags", "tag-and-category", "category-only"],
  );
});

test("same category adds relevance without normalizing labels", () => {
  const current = post("current", "2026-04-01", { category: "Web", tags: ["Astro"] });
  const posts = [
    post("exact-category", "2026-02-01", { category: "Web", tags: ["Astro"] }),
    post("case-variant", "2026-03-01", { category: "web", tags: ["Astro"] }),
  ];

  assert.deepEqual(
    relatedPostsFor(current, posts).map((item) => item.id),
    ["exact-category", "case-variant"],
  );
});

test("related posts use deterministic date and id tie-breaks", () => {
  const current = post("current", "2026-04-01", { tags: ["Astro"] });
  const posts = [
    post("zeta", "2026-02-01", { tags: ["Astro"] }),
    post("alpha", "2026-02-01", { tags: ["Astro"] }),
    post("newer", "2026-03-01", { tags: ["Astro"] }),
  ];

  assert.deepEqual(
    relatedPostsFor(current, posts).map((item) => item.id),
    ["newer", "alpha", "zeta"],
  );
});

test("related posts default to three results and do not mutate input", () => {
  const current = post("current", "2026-06-01", { tags: ["Astro"] });
  const posts = [
    post("one", "2026-01-01", { tags: ["Astro"] }),
    post("two", "2026-02-01", { tags: ["Astro"] }),
    post("three", "2026-03-01", { tags: ["Astro"] }),
    post("four", "2026-04-01", { tags: ["Astro"] }),
  ];
  const originalOrder = posts.map((item) => item.id);

  assert.deepEqual(
    relatedPostsFor(current, posts).map((item) => item.id),
    ["four", "three", "two"],
  );
  assert.deepEqual(
    posts.map((item) => item.id),
    originalOrder,
  );
  assert.deepEqual(
    relatedPostsFor(current, posts, 2).map((item) => item.id),
    ["four", "three"],
  );
});

test("adjacent posts stay within the exact category and exclude non-discoverable candidates", () => {
  const current = post("current", "2026-04-01", { category: "Guides" });
  const posts = [
    post("newer", "2026-05-01", { category: "Guides" }),
    current,
    post("older", "2026-03-01", { category: "Guides" }),
    post("other-category", "2026-03-15", { category: "guides" }),
    post("draft", "2026-03-20", { category: "Guides", draft: true }),
    post("noindex", "2026-03-25", { category: "Guides", noindex: true }),
  ];

  const adjacent = adjacentPostsFor(current, posts);
  assert.equal(adjacent.previous?.id, "older");
  assert.equal(adjacent.next?.id, "newer");
});

test("adjacent posts expose only the available side at category boundaries", () => {
  const newest = post("newest", "2026-05-01", { category: "Guides" });
  const middle = post("middle", "2026-04-01", { category: "Guides" });
  const oldest = post("oldest", "2026-03-01", { category: "Guides" });
  const posts = [middle, oldest, newest];

  assert.deepEqual(
    { previous: adjacentPostsFor(newest, posts).previous?.id, next: adjacentPostsFor(newest, posts).next?.id },
    { previous: "middle", next: undefined },
  );
  assert.deepEqual(
    { previous: adjacentPostsFor(oldest, posts).previous?.id, next: adjacentPostsFor(oldest, posts).next?.id },
    { previous: undefined, next: "middle" },
  );
});

test("adjacent posts use deterministic id ordering for equal dates", () => {
  const current = post("middle", "2026-04-01", { category: "Guides" });
  const posts = [
    post("zeta", "2026-04-01", { category: "Guides" }),
    current,
    post("alpha", "2026-04-01", { category: "Guides" }),
  ];

  const adjacent = adjacentPostsFor(current, posts);
  assert.equal(adjacent.previous?.id, "zeta");
  assert.equal(adjacent.next?.id, "alpha");
});

test("adjacent-post ranking does not mutate input and returns empty neighbors when current is not discoverable", () => {
  const current = post("current", "2026-04-01", { category: "Guides", noindex: true });
  const posts = Object.freeze([
    post("older", "2026-03-01", { category: "Guides" }),
    current,
    post("newer", "2026-05-01", { category: "Guides" }),
  ]);
  const original = posts.map((item) => item.id);

  assert.deepEqual(adjacentPostsFor(current, posts), { previous: undefined, next: undefined });
  assert.deepEqual(
    posts.map((item) => item.id),
    original,
  );
});
