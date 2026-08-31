const configuredUrl = process.env.SITE_URL || "https://example.com";

/** @type {const} */
const config = {
  site: {
    title: "AstroPublishKit",
    shortTitle: "APK",
    description: "A clean Astro starter for publishing fast, searchable, SEO-ready content sites.",
    url: configuredUrl.replace(/\/+$/, ""),
    language: "en",
    locale: "en_US",
    author: {
      name: "Your Name",
      url: "/about"
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
    { label: "GitHub", href: "https://github.com/your-name" }
  ],
  home: {
    heading: "Publish without rebuilding your stack every time.",
    intro: "AstroPublishKit gives you a typed content model, static search, SEO primitives, quality checks, and Cloudflare-ready output while keeping the visual layer easy to replace."
  }
};

export default config;
