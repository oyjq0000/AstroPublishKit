import { getCollection, type CollectionEntry } from "astro:content";
import { isPublishedPost, sortPostsByDate } from "./posts.mjs";
import { taxonomySummaries } from "./taxonomy.mjs";
import { withTrailingSlash } from "./urls.mjs";

export type Post = CollectionEntry<"posts">;

export function sortPosts(posts: Post[]) {
  return sortPostsByDate(posts);
}

export async function getPublishedPosts() {
  const posts = await getCollection("posts", isPublishedPost);
  return sortPosts(posts);
}

export function postUrl(post: Post) {
  return withTrailingSlash(`/posts/${post.id}`);
}

export function getTagSummaries(posts: Post[]) {
  return taxonomySummaries(posts.flatMap((post) => post.data.tags));
}

export function getCategorySummaries(posts: Post[]) {
  return taxonomySummaries(posts.map((post) => post.data.category));
}
