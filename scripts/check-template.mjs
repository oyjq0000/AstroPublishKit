import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "astro-publish-kit-template-"));
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const fakeSiteUrl = "https://template-smoke.test";

const fakeConfig = `const configuredUrl = process.env.SITE_URL || "https://local.invalid";\n\nexport default {\n  site: {\n    title: "Template Smoke Site",\n    shortTitle: "Smoke Site",\n    description: "A fake site identity used by the template regression check.",\n    url: configuredUrl.replace(/\\/+$/, ""),\n    language: "en",\n    locale: "en_US",\n    author: { name: "Template Author", url: "https://example.org/author" },\n    repository: "https://example.org/repository",\n    brand: { mark: "T", favicon: "/favicon.svg", defaultOgImage: "/og.png" },\n    copyright: "Template Author"\n  },\n  navigation: [\n    { label: "Posts", href: "/posts/" },\n    { label: "Tags", href: "/tags/" },\n    { label: "Archive", href: "/archive/" },\n    { label: "Search", href: "/search/" },\n    { label: "About", href: "/about/" }\n  ],\n  social: [{ label: "Profile", href: "https://example.org/profile" }],\n  home: {\n    eyebrow: "Template smoke test",\n    heading: "A clean user-owned site identity.",\n    intro: "This copy verifies that runtime identity comes from the main configuration file.",\n    primaryAction: { label: "Read posts", href: "/posts/" },\n    secondaryAction: { label: "Profile", href: "https://example.org/profile" }\n  }\n};\n`;

function copyFilter(source) {
  const relative = path.relative(root, source);
  if (!relative) return true;
  const first = relative.split(path.sep)[0];
  return ![".git", "node_modules", "dist"].includes(first);
}

function run(args, env = {}) {
  execFileSync(npm, args, {
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

try {
  fs.cpSync(root, temp, { recursive: true, filter: copyFilter });
  fs.symlinkSync(path.join(root, "node_modules"), path.join(temp, "node_modules"), "dir");
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
  run(["run", "build:production"], { SITE_URL: fakeSiteUrl });

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

  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  } else {
    console.log("Template regression check passed.");
  }
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
