import assert from "node:assert/strict";
import test from "node:test";
import { slugify } from "../src/lib/text.mjs";
import { taxonomySlugCollisions, taxonomySummaries } from "../src/lib/taxonomy.mjs";

test("slugify keeps Unicode labels usable", () => {
  assert.equal(slugify("内容 工程"), "内容-工程");
  assert.equal(slugify("Café Notes"), "cafe-notes");
});

test("taxonomy summaries count exact duplicate labels", () => {
  assert.deepEqual(taxonomySummaries(["Astro", "Astro"]), [{ name: "Astro", count: 2, slug: "astro" }]);
});

test("case variants remain distinct labels but collision detection protects their URL", () => {
  const summaries = taxonomySummaries(["Astro", "astro"]);
  assert.equal(summaries.length, 2);
  const collisions = taxonomySlugCollisions([
    { value: "Astro", file: "one.md" },
    { value: "astro", file: "two.md" }
  ]);
  assert.equal(collisions.length, 1);
  assert.equal(collisions[0].slug, "astro");
});
