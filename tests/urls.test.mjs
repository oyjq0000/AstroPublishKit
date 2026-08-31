import assert from "node:assert/strict";
import test from "node:test";
import { absolutePageUrl, withTrailingSlash } from "../src/lib/urls.mjs";

test("withTrailingSlash normalizes page paths", () => {
  assert.equal(withTrailingSlash("/"), "/");
  assert.equal(withTrailingSlash("/posts"), "/posts/");
  assert.equal(withTrailingSlash("/posts/"), "/posts/");
});

test("absolutePageUrl emits canonical page URLs with trailing slashes", () => {
  assert.equal(absolutePageUrl("/posts/example", "https://example.org"), "https://example.org/posts/example/");
});
