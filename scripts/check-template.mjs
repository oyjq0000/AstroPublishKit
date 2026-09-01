import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = process.cwd();
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "astro-publish-kit-template-"));
const npmExecPath = process.env.npm_execpath;
const fakeSiteUrl = "https://template-smoke.test";
const injectedFaqValue = '</script><script id="apk-validation-injected">injected</script>';

const fakeConfig = `const configuredUrl = process.env.SITE_URL || "https://local.invalid";\n\nexport default {\n  site: {\n    title: "Template Smoke Site",\n    shortTitle: "Smoke Site",\n    description: "A fake site identity used by the template regression check.",\n    url: configuredUrl.replace(/\\/+$/, ""),\n    language: "en",\n    locale: "en_US",\n    author: { name: "Template Author", url: "https://example.org/author" },\n    repository: "https://example.org/repository",\n    brand: { mark: "T", favicon: "/favicon.svg", defaultOgImage: "/og.png" },\n    copyright: "Template Author"\n  },\n  navigation: [\n    { label: "Posts", href: "/posts/" },\n    { label: "Tags", href: "/tags/" },\n    { label: "Archive", href: "/archive/" },\n    { label: "Search", href: "/search/" },\n    { label: "About", href: "/about/" }\n  ],\n  social: [{ label: "Profile", href: "https://example.org/profile" }],\n  home: {\n    eyebrow: "Template smoke test",\n    heading: "A clean user-owned site identity.",\n    intro: "This copy verifies that runtime identity comes from the main configuration file.",\n    primaryAction: { label: "Read posts", href: "/posts/" },\n    secondaryAction: { label: "Profile", href: "https://example.org/profile" }\n  }\n};\n`;

function copyFilter(source) {
  const relative = path.relative(root, source);
  if (!relative) return true;
  const first = relative.split(path.sep)[0];
  return ![".git", "node_modules", "dist"].includes(first);
}

function run(args, env = {}) {
  if (!npmExecPath) throw new Error("check-template must be run through npm.");
  execFileSync(process.execPath, [npmExecPath, ...args], {
    cwd: temp,
    env: { ...process.env, ...env },
    stdio: "inherit",
  });
}

function walk(target) {
  if (!fs.existsSync(target)) return [];
  const stat = fs.statSync(target);
  if (stat.isFile()) return [target];
  return fs.readdirSync(target, { withFileTypes: true }).flatMap((entry) => walk(path.join(target, entry.name)));
}

async function searchPagefind(dist, queries) {
  const nativeFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = input instanceof URL ? new URL(input) : new URL(typeof input === "string" ? input : input.url);
    if (url.protocol !== "file:") return nativeFetch(input, init);
    url.search = "";
    try {
      return new Response(await fs.promises.readFile(fileURLToPath(url)), { status: 200 });
    } catch (error) {
      if (error?.code === "ENOENT") return new Response("Not found", { status: 404 });
      throw error;
    }
  };

  let pagefind;
  try {
    const bundle = pathToFileURL(path.join(dist, "pagefind/pagefind.js")).href;
    pagefind = await import(`${bundle}?template-regression=${Date.now()}`);
    await pagefind.options({ baseUrl: fakeSiteUrl });
    const results = new Map();
    for (const query of queries) {
      const search = await pagefind.search(query);
      const urls = [];
      for (const hit of search.results) {
        const data = await hit.data();
        urls.push(data.raw_url ?? new URL(data.url).pathname);
      }
      results.set(query, urls);
    }
    return results;
  } finally {
    if (pagefind) await pagefind.destroy();
    globalThis.fetch = nativeFetch;
  }
}

try {
  fs.cpSync(root, temp, { recursive: true, filter: copyFilter });
  const nodeModulesLinkType = process.platform === "win32" ? "junction" : "dir";
  fs.symlinkSync(path.join(root, "node_modules"), path.join(temp, "node_modules"), nodeModulesLinkType);
  fs.writeFileSync(path.join(temp, "astro-publish-kit.config.mjs"), fakeConfig);
  fs.writeFileSync(
    path.join(temp, "public/favicon.svg"),
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-label="Template Smoke Site"><rect width="64" height="64" rx="12"/><text x="32" y="42" text-anchor="middle" font-size="32" fill="white">T</text></svg>\n',
  );

  run(["run", "new-post", "--", "template-smoke"]);
  fs.writeFileSync(
    path.join(temp, "src/content/posts/navigation-middle.md"),
    `---
title: "Navigation middle fixture"
description: "A synthetic published article used to verify deterministic previous and next article navigation."
date: 2026-08-20
category: "Getting Started"
tags: ["Navigation"]
---

Synthetic navigation regression content.
`,
  );
  fs.writeFileSync(
    path.join(temp, "src/content/posts/navigation-older.md"),
    `---
title: "Navigation older fixture"
description: "An older synthetic article used to verify the previous edge of article navigation."
date: 2026-08-10
category: "Getting Started"
tags: ["Navigation"]
---

Synthetic navigation regression content.
`,
  );
  fs.writeFileSync(
    path.join(temp, "src/content/posts/freshness-updated.md"),
    `---
title: "Freshness updated fixture"
description: "A synthetic article used to verify visible updated metadata in generated article HTML."
date: 2025-01-01
lastModified: 2026-01-01
category: "Freshness"
tags: ["Freshness"]
---

Synthetic freshness regression content.
`,
  );
  fs.writeFileSync(
    path.join(temp, "src/content/posts/faq.md"),
    `---
title: "FAQ fixture"
description: "A synthetic article used to verify visible FAQ content and matching FAQPage structured data."
date: 2026-08-25
category: "FAQ"
tags: ["FAQ"]
faq:
  - question: "What does this FAQ fixture verify?"
    answer: "It verifies that visible FAQ content and structured data share one source."
  - question: "Does the FAQ need client JavaScript?"
    answer: "No. It is rendered as static HTML with native details elements."
---

Synthetic FAQ regression content.
`,
  );
  fs.writeFileSync(
    path.join(temp, "src/content/posts/faq-injection.md"),
    `---
title: "FAQ injection fixture"
description: "A synthetic article used to verify JSON-LD script-boundary safety without changing reader-visible FAQ values."
date: 2026-08-26
category: "FAQ"
tags: ["FAQ"]
faq:
  - question: "Can structured data safely preserve an HTML-looking answer?"
    answer: '${injectedFaqValue}'
---

Synthetic JSON-LD security regression content.
`,
  );
  fs.writeFileSync(
    path.join(temp, "src/content/posts/search-boundary-source.md"),
    `---
title: "Search boundary source fixture"
description: "A synthetic source article used to verify Pagefind boundaries around article-to-article recommendation UI."
summary: "quickanswermeteorite appears only in this source article's visible Quick Answer block."
date: 2026-08-28
category: "Search Boundary"
tags: ["Search Boundary"]
faq:
  - question: "Where is faqcobaltorchid documented?"
    answer: "faqansweramberlily appears only in this source article's visible FAQ."
---

bodynarwhalquartz appears only in this source article body.
`,
  );
  fs.writeFileSync(
    path.join(temp, "src/content/posts/search-boundary-target.md"),
    `---
title: "Zephyrquasarnautilus target fixture"
description: "A synthetic target article whose globally unique title token verifies Pagefind cross-article indexing boundaries."
date: 2026-08-29
category: "Search Boundary"
tags: ["Search Boundary"]
---

This synthetic target body contains no source-article search needles.
`,
  );
  fs.writeFileSync(
    path.join(temp, "src/content/posts/freshness-stale.md"),
    `---
title: "Freshness stale fixture"
description: "A deliberately old synthetic article used to verify the reader-facing freshness notice."
date: 2020-01-01
category: "Freshness"
tags: ["Freshness"]
---

Synthetic stale-content regression content.
`,
  );
  run(["run", "build:production"], {
    SITE_URL: fakeSiteUrl,
    PUBLIC_GISCUS_REPO: "example/repository",
    PUBLIC_GISCUS_REPO_ID: "R_template_regression",
    PUBLIC_GISCUS_CATEGORY: "General",
    PUBLIC_GISCUS_CATEGORY_ID: "DIC_template_regression",
  });

  const dist = path.join(temp, "dist");
  const textFiles = walk(dist).filter((file) => /\.(?:html?|xml|txt|json|svg|css)$/i.test(file));
  const forbidden = ["oyjq0000", "astropublishkit.pages.dev", "https://example.com"];
  const demoBrandPages = new Set(["posts/getting-started/index.html", "posts/publishing-workflow/index.html"]);
  const errors = [];
  for (const file of textFiles) {
    const relative = path.relative(dist, file).split(path.sep).join("/");
    const content = fs.readFileSync(file, "utf8");
    for (const value of forbidden) {
      if (content.includes(value)) errors.push(`${relative} contains ${value}`);
    }
    if (relative.endsWith(".html") && content.includes("AstroPublishKit") && !demoBrandPages.has(relative)) {
      errors.push(`${relative} contains AstroPublishKit outside an explicitly allowed demo article`);
    }
  }
  const demoRelations = [
    ["getting-started", "publishing-workflow"],
    ["publishing-workflow", "getting-started"],
  ];
  for (const [currentId, relatedId] of demoRelations) {
    const articleFile = path.join(dist, "posts", currentId, "index.html");
    const html = fs.readFileSync(articleFile, "utf8");
    const relatedSection = html.match(/<section[^>]*data-related-posts[^>]*>[\s\S]*?<\/section>/)?.[0];
    if (!relatedSection) {
      errors.push(`posts/${currentId}/index.html is missing the Related posts section`);
      continue;
    }
    if (!relatedSection.includes("Related posts")) {
      errors.push(`posts/${currentId}/index.html is missing the Related posts heading`);
    }
    if (!relatedSection.includes("data-pagefind-ignore")) {
      errors.push(`posts/${currentId}/index.html Related posts is missing data-pagefind-ignore`);
    }
    if (!relatedSection.includes(`/posts/${relatedId}/`)) {
      errors.push(`posts/${currentId}/index.html is missing related link /posts/${relatedId}/`);
    }
    if (relatedSection.includes(`/posts/${currentId}/`)) {
      errors.push(`posts/${currentId}/index.html includes its own URL inside Related posts`);
    }
  }

  const navigationExpectations = [
    {
      page: "posts/navigation-middle/index.html",
      previousHref: "/posts/navigation-older/",
      nextHref: "/posts/getting-started/",
    },
    {
      page: "posts/getting-started/index.html",
      previousHref: "/posts/navigation-middle/",
      nextHref: undefined,
    },
    {
      page: "posts/navigation-older/index.html",
      previousHref: undefined,
      nextHref: "/posts/navigation-middle/",
    },
  ];
  for (const expectation of navigationExpectations) {
    const articleFile = path.join(dist, expectation.page);
    const html = fs.readFileSync(articleFile, "utf8");
    const navigation = html.match(/<nav[^>]*data-post-navigation[^>]*>[\s\S]*?<\/nav>/)?.[0];
    if (!navigation) {
      errors.push(`${expectation.page} is missing article navigation`);
      continue;
    }
    if (!navigation.includes("data-pagefind-ignore")) {
      errors.push(`${expectation.page} article navigation is missing data-pagefind-ignore`);
    }
    if (
      expectation.previousHref &&
      !navigation.includes(`data-post-navigation-previous href="${expectation.previousHref}"`)
    ) {
      errors.push(`${expectation.page} is missing previous article link ${expectation.previousHref}`);
    }
    if (!expectation.previousHref && navigation.includes("data-post-navigation-previous")) {
      errors.push(`${expectation.page} unexpectedly renders a previous article link`);
    }
    if (expectation.nextHref && !navigation.includes(`data-post-navigation-next href="${expectation.nextHref}"`)) {
      errors.push(`${expectation.page} is missing next article link ${expectation.nextHref}`);
    }
    if (!expectation.nextHref && navigation.includes("data-post-navigation-next")) {
      errors.push(`${expectation.page} unexpectedly renders a next article link`);
    }
  }

  const updatedArticleFile = path.join(dist, "posts/freshness-updated/index.html");
  const updatedArticleHtml = fs.readFileSync(updatedArticleFile, "utf8");
  if (!updatedArticleHtml.includes("Updated")) {
    errors.push("posts/freshness-updated/index.html is missing visible Updated metadata");
  }
  if (!updatedArticleHtml.includes('datetime="2026-01-01T00:00:00.000Z"')) {
    errors.push("posts/freshness-updated/index.html is missing the lastModified time datetime value");
  }

  const faqArticleFile = path.join(dist, "posts/faq/index.html");
  const faqArticleHtml = fs.readFileSync(faqArticleFile, "utf8");
  if (!faqArticleHtml.includes("data-faq")) {
    errors.push("posts/faq/index.html is missing the visible FAQ section");
  }
  for (const text of [
    "What does this FAQ fixture verify?",
    "It verifies that visible FAQ content and structured data share one source.",
    "Does the FAQ need client JavaScript?",
    "No. It is rendered as static HTML with native details elements.",
  ]) {
    if (!faqArticleHtml.includes(text)) errors.push(`posts/faq/index.html is missing visible FAQ text: ${text}`);
  }
  const faqJsonText = faqArticleHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  if (!faqJsonText) {
    errors.push("posts/faq/index.html is missing structured data");
  } else {
    const faqGraph = JSON.parse(faqJsonText);
    const faqPage = faqGraph["@graph"]?.find((item) => item["@type"] === "FAQPage");
    const graphTypes = new Set(faqGraph["@graph"]?.map((item) => item["@type"]));
    for (const expectedType of ["WebSite", "Article", "BreadcrumbList", "FAQPage"]) {
      if (!graphTypes.has(expectedType)) {
        errors.push(`posts/faq/index.html is missing ${expectedType} structured data`);
      }
    }
    if (!faqPage) {
      errors.push("posts/faq/index.html is missing FAQPage structured data");
    } else {
      const pairs = faqPage.mainEntity?.map((item) => [item.name, item.acceptedAnswer?.text]);
      if (
        JSON.stringify(pairs) !==
        JSON.stringify([
          [
            "What does this FAQ fixture verify?",
            "It verifies that visible FAQ content and structured data share one source.",
          ],
          ["Does the FAQ need client JavaScript?", "No. It is rendered as static HTML with native details elements."],
        ])
      ) {
        errors.push("posts/faq/index.html FAQPage data does not match the visible FAQ source");
      }
    }
  }
  const noFaqHtml = fs.readFileSync(path.join(dist, "posts/getting-started/index.html"), "utf8");
  if (noFaqHtml.includes("data-faq") || noFaqHtml.includes('"@type":"FAQPage"')) {
    errors.push("posts/getting-started/index.html unexpectedly renders FAQ content or FAQPage data");
  }

  const injectionArticleHtml = fs.readFileSync(path.join(dist, "posts/faq-injection/index.html"), "utf8");
  const injectionVisibleFaq = injectionArticleHtml.match(/<section[^>]*data-faq[^>]*>[\s\S]*?<\/section>/)?.[0];
  if (!injectionVisibleFaq) {
    errors.push("posts/faq-injection/index.html is missing the visible FAQ section");
  } else {
    if (!injectionVisibleFaq.includes("&lt;/script&gt;")) {
      errors.push("posts/faq-injection/index.html does not HTML-escape the visible FAQ script boundary");
    }
    if (injectionVisibleFaq.includes('<script id="apk-validation-injected">')) {
      errors.push("posts/faq-injection/index.html renders an injected script element inside the visible FAQ");
    }
  }
  const injectionJsonText = injectionArticleHtml.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
  )?.[1];
  if (!injectionJsonText) {
    errors.push("posts/faq-injection/index.html is missing structured data");
  } else {
    if (injectionJsonText.includes("<")) {
      errors.push("posts/faq-injection/index.html structured data still contains a literal HTML script boundary");
    }
    const injectionGraph = JSON.parse(injectionJsonText);
    const injectionFaqPage = injectionGraph["@graph"]?.find((item) => item["@type"] === "FAQPage");
    const recovered = injectionFaqPage?.mainEntity?.[0]?.acceptedAnswer?.text;
    if (recovered !== injectedFaqValue) {
      errors.push("posts/faq-injection/index.html structured data does not preserve the original FAQ value");
    }
  }
  const executableInjectedScripts = [...injectionArticleHtml.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].filter(
    (match) => match[1].trim() === "injected",
  );
  if (executableInjectedScripts.length > 0) {
    errors.push("posts/faq-injection/index.html contains an injected executable script node");
  }

  const shareRoot = faqArticleHtml.match(/<div[^>]*data-share-root[^>]*>/)?.[0];
  if (!shareRoot?.includes("data-pagefind-ignore")) {
    errors.push("posts/faq/index.html share controls are missing data-pagefind-ignore");
  }
  const commentsRoot = faqArticleHtml.match(/<section[^>]*class="comments"[^>]*>/)?.[0];
  if (!commentsRoot?.includes("data-pagefind-ignore")) {
    errors.push("posts/faq/index.html comments module is missing data-pagefind-ignore");
  }

  const pagefindQueries = ["zephyrquasarnautilus", "bodynarwhalquartz", "quickanswermeteorite", "faqcobaltorchid"];
  const pagefindResults = await searchPagefind(dist, pagefindQueries);
  const sourceUrl = "/posts/search-boundary-source/";
  const targetUrl = "/posts/search-boundary-target/";
  const targetResults = pagefindResults.get("zephyrquasarnautilus") ?? [];
  if (!targetResults.includes(targetUrl)) {
    errors.push(`Pagefind unique-title query is missing ${targetUrl}: ${JSON.stringify(targetResults)}`);
  }
  if (targetResults.includes(sourceUrl)) {
    errors.push(`Pagefind unique-title query falsely matches ${sourceUrl}: ${JSON.stringify(targetResults)}`);
  }
  for (const query of ["bodynarwhalquartz", "quickanswermeteorite", "faqcobaltorchid"]) {
    const urls = pagefindResults.get(query) ?? [];
    if (!urls.includes(sourceUrl)) {
      errors.push(`Pagefind query ${query} is missing ${sourceUrl}: ${JSON.stringify(urls)}`);
    }
  }

  const staleArticleFile = path.join(dist, "posts/freshness-stale/index.html");
  const staleArticleHtml = fs.readFileSync(staleArticleFile, "utf8");
  if (!staleArticleHtml.includes('aria-label="Content freshness"')) {
    errors.push("posts/freshness-stale/index.html is missing the freshness notice");
  }
  if (!staleArticleHtml.includes("Some details may have changed.")) {
    errors.push("posts/freshness-stale/index.html is missing the freshness notice copy");
  }

  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  } else {
    console.log("Template regression check passed.");
  }
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
