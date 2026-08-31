import rss from "@astrojs/rss";
import kit from "../../astro-publish-kit.config.mjs";
import { getPublishedPosts, postUrl } from "../lib/content";

export async function GET() {
  const posts = await getPublishedPosts();
  return rss({
    title: kit.site.title,
    description: kit.site.description,
    site: kit.site.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: postUrl(post),
      categories: post.data.tags,
    })),
  });
}
