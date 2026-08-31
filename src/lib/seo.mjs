export function structuredDataGraph(items) {
  const values = (Array.isArray(items) ? items : [items]).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@graph": values.map((item) => {
      const copy = { ...item };
      delete copy["@context"];
      return copy;
    })
  };
}
