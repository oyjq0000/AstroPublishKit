import assert from "node:assert/strict";
import test from "node:test";
import {
  adjacentPostsFor,
  effectivePostDate,
  filterPostsByCategory,
  filterPostsByTag,
  freshnessFor,
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
      lastModified: options.lastModified ? new Date(options.lastModified) : undefined,
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

test("effective post date prefers lastModified and otherwise uses the publication date", () => {
  assert.equal(effectivePostDate(post("published", "2026-01-01")).toISOString(), "2026-01-01T00:00:00.000Z");
  assert.equal(
    effectivePostDate(post("modified", "2026-01-01", { lastModified: "2026-02-01" })).toISOString(),
    "2026-02-01T00:00:00.000Z",
  );
});

test("freshness shows Updated only when lastModified is on a later calendar day", () => {
  const now = new Date("2026-06-01T00:00:00.000Z");
  const sameDay = post("same-day", "2026-01-01T00:00:00.000Z", {
    lastModified: "2026-01-01T18:00:00.000Z",
  });
  const laterDay = post("later-day", "2026-01-01T00:00:00.000Z", { lastModified: "2026-01-02T00:00:00.000Z" });

  assert.equal(freshnessFor(sameDay, now).updatedDate, undefined);
  assert.equal(freshnessFor(laterDay, now).updatedDate?.toISOString(), "2026-01-02T00:00:00.000Z");
});

test("freshness stale threshold is deterministic at 364, 365 and more than 365 days", () => {
  const day = 86_400_000;
  const now = new Date("2026-01-01T00:00:00.000Z");
  const agedPost = (days) => post(`age-${days}`, new Date(now.valueOf() - days * day));

  assert.equal(freshnessFor(agedPost(364), now).isStale, false);
  assert.equal(freshnessFor(agedPost(365), now).isStale, true);
  assert.equal(freshnessFor(agedPost(366), now).isStale, true);
});

test("future effective dates do not produce stale content", () => {
  const now = new Date("2026-01-01T00:00:00.000Z");
  const future = post("future", "2026-01-02T00:00:00.000Z");
  const futureModified = post("future-modified", "2025-01-01T00:00:00.000Z", {
    lastModified: "2026-01-02T00:00:00.000Z",
  });

  assert.equal(freshnessFor(future, now).isStale, false);
  assert.equal(freshnessFor(futureModified, now).isStale, false);
});

test("freshness uses the explicit now value and does not mutate the post", () => {
  const candidate = post("immutable", "2025-01-01T00:00:00.000Z", { lastModified: "2025-06-01T00:00:00.000Z" });
  const originalDate = candidate.data.date;
  const originalLastModified = candidate.data.lastModified;
  const first = freshnessFor(candidate, new Date("2026-05-31T00:00:00.000Z"));
  const second = freshnessFor(candidate, new Date("2026-06-01T00:00:00.000Z"));

  assert.equal(first.isStale, false);
  assert.equal(second.isStale, true);
  assert.equal(candidate.data.date, originalDate);
  assert.equal(candidate.data.lastModified, originalLastModified);
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
