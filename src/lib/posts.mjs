export function isPublishedPost(post) {
  return !post.data.draft;
}

export function isPreviewablePost(post, includeDrafts = false) {
  return includeDrafts || isPublishedPost(post);
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

export function relatedPostsFor(post, posts, limit = 3) {
  const currentTags = new Set(post.data.tags);
  const maxResults = Number.isFinite(limit) ? Math.max(0, Math.trunc(limit)) : 3;

  return posts
    .filter((candidate) => candidate.id !== post.id && isDiscoverablePost(candidate))
    .map((candidate) => {
      const sharedTags = new Set(candidate.data.tags.filter((tag) => currentTags.has(tag))).size;
      const sameCategory = candidate.data.category === post.data.category;
      return { post: candidate, score: sharedTags * 3 + (sameCategory ? 2 : 0) };
    })
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const dateDifference = new Date(b.post.data.date).valueOf() - new Date(a.post.data.date).valueOf();
      if (dateDifference !== 0) return dateDifference;
      return a.post.id < b.post.id ? -1 : a.post.id > b.post.id ? 1 : 0;
    })
    .slice(0, maxResults)
    .map((candidate) => candidate.post);
}
