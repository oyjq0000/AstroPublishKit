import { getCollection, type CollectionEntry } from "astro:content";
import { slugify } from "./text.mjs";

export type Post = CollectionEntry<"posts">;

export function sortPosts(posts: Post[]) {
  return [...posts].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getPublishedPosts() {
  const posts = await getCollection("posts", ({ data }) => !data.draft);
  return sortPosts(posts);
}

export function postUrl(post: Post) {
  return `/posts/${post.id}`;
}

export function getTagSummaries(posts: Post[]) {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count, slug: slugify(name) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getCategorySummaries(posts: Post[]) {
  const counts = new Map<string, number>();
  for (const post of posts) {
    const category = post.data.category;
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count, slug: slugify(name) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
