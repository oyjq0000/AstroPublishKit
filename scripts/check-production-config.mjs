const rawSiteUrl = process.env.SITE_URL?.trim();

function fail(message) {
  console.error(`Production config check failed: ${message}`);
  process.exit(1);
}

if (!rawSiteUrl) {
  fail("SITE_URL is required. Set it to your production HTTPS origin, for example https://example.org");
}

let siteUrl;
try {
  siteUrl = new URL(rawSiteUrl);
} catch {
  fail("SITE_URL must be a valid absolute URL.");
}

if (siteUrl.protocol !== "https:") {
  fail("SITE_URL must use https:// in production.");
}

if (siteUrl.username || siteUrl.password || siteUrl.search || siteUrl.hash) {
  fail("SITE_URL must be a plain origin without credentials, query parameters, or a fragment.");
}

if (siteUrl.pathname !== "/") {
  fail("SITE_URL must be an origin only and must not include a path.");
}

if (siteUrl.origin === "https://example.com") {
  fail("SITE_URL is still set to the example.com placeholder.");
}

console.log(`Production config OK: ${siteUrl.origin}`);
