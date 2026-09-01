import assert from "node:assert/strict";
import test from "node:test";
import { faqPageJsonLd, serializeJsonLdForHtml, structuredDataGraph } from "../src/lib/seo.mjs";
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

test("HTML-safe JSON-LD serialization preserves a normal Article", () => {
  const article = {
    "@type": "Article",
    headline: "A normal article",
    description: "A normal structured-data description.",
  };
  const serialized = serializeJsonLdForHtml(article);

  assert.deepEqual(JSON.parse(serialized), article);
});

test("HTML-safe JSON-LD serialization preserves a normal FAQPage", () => {
  const faq = faqPageJsonLd([
    { question: "Is this visible?", answer: "Yes. The same content is rendered for readers." },
  ]);
  const serialized = serializeJsonLdForHtml(faq);

  assert.deepEqual(JSON.parse(serialized), faq);
});

test("HTML-safe JSON-LD serialization neutralizes script boundaries without changing values", () => {
  const closingScript = '</script><script id="apk-validation-injected">injected</script>';
  const openingScript = '<script id="apk-validation-injected">injected</script>';
  const faq = faqPageJsonLd([
    { question: closingScript, answer: openingScript },
    { question: "Can the answer close the element?", answer: closingScript },
  ]);
  const graph = structuredDataGraph([
    { "@type": "Article", headline: `Article ${openingScript}`, description: closingScript },
    { "@type": "BreadcrumbList", itemListElement: [] },
    faq,
  ]);
  const serialized = serializeJsonLdForHtml(graph);
  const parsed = JSON.parse(serialized);

  assert.equal(serialized.includes("<"), false);
  assert.equal(serialized.includes("</script>"), false);
  assert.equal(serialized.includes('<script id="apk-validation-injected">'), false);
  assert.match(serialized, /\\u003c\/script>/);
  assert.equal(parsed["@graph"][0].headline, `Article ${openingScript}`);
  assert.equal(parsed["@graph"][0].description, closingScript);
  assert.equal(parsed["@graph"][2].mainEntity[0].name, closingScript);
  assert.equal(parsed["@graph"][2].mainEntity[0].acceptedAnswer.text, openingScript);
  assert.equal(parsed["@graph"][2].mainEntity[1].acceptedAnswer.text, closingScript);
});
