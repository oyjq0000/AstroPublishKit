const configuredUrl = process.env.SITE_URL || "https://example.com";

/** @type {const} */
const config = {
  site: {
    title: "AstroPublishKit",
    shortTitle: "AstroPublishKit",
    description:
      "A static-first Astro publishing starter with MDX, Pagefind, SEO, quality gates, and Cloudflare deployment.",
    url: configuredUrl.replace(/\/+$/, ""),
    language: "en",
    locale: "en_US",
    author: {
      name: "oyjq0000",
      url: "https://github.com/oyjq0000"
    },
    defaultOgImage: "/og.svg"
  },
  navigation: [
    { label: "Posts", href: "/posts" },
    { label: "Tags", href: "/tags" },
    { label: "Archive", href: "/archive" },
    { label: "Search", href: "/search" },
    { label: "About", href: "/about" }
  ],
  social: [
    { label: "GitHub", href: "https://github.com/oyjq0000/AstroPublishKit" },
    { label: "Live Demo", href: "https://astropublishkit.pages.dev/" }
  ],
  home: {
    heading: "Publish without rebuilding your stack every time.",
    intro:
      "AstroPublishKit gives you a typed content model, static search, SEO primitives, quality checks, and Cloudflare-ready output while keeping the visual layer easy to replace."
  }
};

export default config;
