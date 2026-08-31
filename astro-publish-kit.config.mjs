const configuredUrl = process.env.SITE_URL || "https://example.com";
const repositoryUrl = "https://github.com/oyjq0000/AstroPublishKit";

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
      name: "AstroPublishKit contributors",
      url: repositoryUrl,
    },
    repository: repositoryUrl,
    brand: {
      mark: "A",
      favicon: "/favicon.svg",
      defaultOgImage: "/og.png",
    },
    copyright: "AstroPublishKit contributors",
  },
  navigation: [
    { label: "Posts", href: "/posts/" },
    { label: "Tags", href: "/tags/" },
    { label: "Archive", href: "/archive/" },
    { label: "Search", href: "/search/" },
    { label: "About", href: "/about/" },
  ],
  social: [
    { label: "GitHub", href: repositoryUrl },
    { label: "Live Demo", href: "https://astropublishkit.pages.dev/" },
  ],
  home: {
    eyebrow: "Static-first publishing starter",
    heading: "Publish without rebuilding your stack every time.",
    intro:
      "AstroPublishKit gives you a typed content model, static search, SEO primitives, quality checks, and Cloudflare-ready output while keeping the visual layer easy to replace.",
    primaryAction: {
      label: "Read the demo",
      href: "/posts/",
    },
    secondaryAction: {
      label: "View repository",
      href: repositoryUrl,
    },
  },
};

export default config;
