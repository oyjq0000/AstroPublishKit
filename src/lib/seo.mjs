export function structuredDataGraph(items) {
  const values = (Array.isArray(items) ? items : [items]).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@graph": values.map((item) => {
      const copy = { ...item };
      delete copy["@context"];
      return copy;
    }),
  };
}

export function serializeJsonLdForHtml(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function faqPageJsonLd(items) {
  if (!Array.isArray(items) || items.length === 0) return undefined;
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
