import kit from "../../astro-publish-kit.config.mjs";

export function GET() {
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${new URL("/sitemap-index.xml", kit.site.url).href}\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
