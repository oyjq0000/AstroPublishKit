import kit from "../../astro-publish-kit.config.mjs";
import { getPublishedPosts, postUrl } from "../lib/content";
import { absolutePageUrl } from "../lib/urls.mjs";

export async function GET() {
  const posts = await getPublishedPosts();
  const lines = [
    `# ${kit.site.title}`,
    "",
    `> ${kit.site.description}`,
    "",
    "## Main pages",
    `- [Posts](${absolutePageUrl("/posts", kit.site.url)})`,
    `- [Tags](${absolutePageUrl("/tags", kit.site.url)})`,
    `- [Archive](${absolutePageUrl("/archive", kit.site.url)})`,
    "",
    "## Published posts",
    ...posts
      .filter((post) => !post.data.noindex)
      .map((post) => `- [${post.data.title}](${new URL(postUrl(post), `${kit.site.url}/`).href}): ${post.data.description}`),
    ""
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
