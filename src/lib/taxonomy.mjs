import { slugify } from "./text.mjs";

export function taxonomySummaries(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count, slug: slugify(name) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function taxonomySlugCollisions(entries) {
  const slugs = new Map();
  const collisions = [];
  for (const entry of entries) {
    const slug = slugify(entry.value);
    const existing = slugs.get(slug);
    if (existing && existing.value !== entry.value) {
      collisions.push({ slug, first: existing, second: entry });
    } else if (!existing) {
      slugs.set(slug, entry);
    }
  }
  return collisions;
}
