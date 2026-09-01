import assert from "node:assert/strict";
import test from "node:test";
import { faqPageJsonLd, structuredDataGraph } from "../src/lib/seo.mjs";
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

test("FAQPage structured data maps visible FAQ items without mutating them", () => {
  const items = Object.freeze([
    Object.freeze({ question: "What is static-first FAQ?", answer: "It is rendered during the static build." }),
    Object.freeze({
      question: "Does it need client JavaScript?",
      answer: "No. The visible FAQ uses native details elements.",
    }),
  ]);
  const faq = faqPageJsonLd(items);

  assert.deepEqual(faq, {
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is static-first FAQ?",
        acceptedAnswer: { "@type": "Answer", text: "It is rendered during the static build." },
      },
      {
        "@type": "Question",
        name: "Does it need client JavaScript?",
        acceptedAnswer: { "@type": "Answer", text: "No. The visible FAQ uses native details elements." },
      },
    ],
  });
  assert.equal(items[0].question, "What is static-first FAQ?");
});

test("FAQPage structured data is omitted when no FAQ items exist", () => {
  assert.equal(faqPageJsonLd(), undefined);
  assert.equal(faqPageJsonLd([]), undefined);
});
