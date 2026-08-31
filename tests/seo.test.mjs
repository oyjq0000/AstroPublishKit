import assert from "node:assert/strict";
import test from "node:test";
import { structuredDataGraph } from "../src/lib/seo.mjs";
import { absolutePageUrl } from "../src/lib/urls.mjs";

test("structured data graph keeps one schema context and preserves items", () => {
  const graph = structuredDataGraph([
    { "@context": "https://schema.org", "@type": "WebSite", name: "Example" },
    { "@type": "Article", headline: "A useful article" },
    { "@type": "BreadcrumbList", itemListElement: [] },
  ]);
  assert.equal(graph["@context"], "https://schema.org");
  assert.deepEqual(
    graph["@graph"].map((item) => item["@type"]),
    ["WebSite", "Article", "BreadcrumbList"],
  );
  assert.equal("@context" in graph["@graph"][0], false);
});

test("canonical and Open Graph URL helpers can share the same absolute URL", () => {
  const canonical = absolutePageUrl("/posts/quality-gates", "https://example.org");
  const ogUrl = absolutePageUrl("/posts/quality-gates/", "https://example.org/");
  assert.equal(canonical, ogUrl);
});
