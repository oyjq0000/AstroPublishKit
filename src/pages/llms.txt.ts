import kit from "../../astro-publish-kit.config.mjs";
import { getPublishedPosts } from "../lib/content";

export async function GET() {
  const posts = await getPublishedPosts();
  const lines = [
    `# ${kit.site.title}`,
    "",
    `> ${kit.site.description}`,
    "",
    "## Main pages",
    `- [Posts](${new URL("/posts", kit.site.url).href})`,
    `- [Tags](${new URL("/tags", kit.site.url).href})`,
    `- [Archive](${new URL("/archive", kit.site.url).href})`,
    "",
    "## Published posts",
    ...posts.filter((post) => !post.data.noindex).map((post) => `- [${post.data.title}](${new URL(`/posts/${post.id}`, kit.site.url).href}): ${post.data.description}`),
    ""
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
