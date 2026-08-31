export function isPublishedPost(post) {
  return !post.data.draft;
}

export function isDiscoverablePost(post) {
  return isPublishedPost(post) && !post.data.noindex;
}

export function sortPostsByDate(posts) {
  return [...posts].sort((a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf());
}

export function filterPostsByCategory(posts, category) {
  return posts.filter((post) => post.data.category === category);
}

export function filterPostsByTag(posts, tag) {
  return posts.filter((post) => post.data.tags.includes(tag));
}
