import kit from "../astro-publish-kit.config.mjs";

const errors = [];
const warnings = [];

function requireText(value, label) {
  if (typeof value !== "string" || !value.trim()) errors.push(`${label} must be a non-empty string`);
}

function validateHttpsUrl(value, label, { originOnly = false } = {}) {
  requireText(value, label);
  if (typeof value !== "string" || !value.trim()) return;
  let url;
  try {
    url = new URL(value);
  } catch {
    errors.push(`${label} must be a valid absolute URL`);
    return;
  }
  if (url.protocol !== "https:") errors.push(`${label} must use https://`);
  if (url.username || url.password) errors.push(`${label} must not contain credentials`);
  if (originOnly && (url.pathname !== "/" || url.search || url.hash)) {
    errors.push(`${label} must be an origin only, without a path, query, or fragment`);
  }
}

function validatePagePath(value, label) {
  requireText(value, label);
  if (typeof value !== "string" || !value.trim()) return;
  if (!value.startsWith("/") || value.startsWith("//")) {
    errors.push(`${label} must be a root-relative internal path`);
    return;
  }
  if (value.includes("\\")) errors.push(`${label} must use forward slashes`);
  const pathname = value.split(/[?#]/, 1)[0];
  const lastSegment = pathname.split("/").filter(Boolean).at(-1) ?? "";
  const looksLikeAsset = /\.[A-Za-z0-9]{1,10}$/.test(lastSegment);
  if (!looksLikeAsset && pathname !== "/" && !pathname.endsWith("/")) {
    errors.push(`${label} must use the trailing-slash page URL convention`);
  }
}

requireText(kit.site?.title, "site.title");
requireText(kit.site?.description, "site.description");
requireText(kit.site?.language, "site.language");
requireText(kit.site?.locale, "site.locale");
requireText(kit.site?.author?.name, "site.author.name");
validateHttpsUrl(kit.site?.url, "site.url", { originOnly: true });
if (kit.site?.author?.url) validateHttpsUrl(kit.site.author.url, "site.author.url");
if (kit.site?.repository) validateHttpsUrl(kit.site.repository, "site.repository");

if (!Array.isArray(kit.navigation) || kit.navigation.length === 0) {
  errors.push("navigation must contain at least one entry");
} else {
  kit.navigation.forEach((item, index) => {
    requireText(item?.label, `navigation[${index}].label`);
    validatePagePath(item?.href, `navigation[${index}].href`);
  });
}

if (!Array.isArray(kit.social)) {
  errors.push("social must be an array");
} else {
  kit.social.forEach((item, index) => {
    requireText(item?.label, `social[${index}].label`);
    validateHttpsUrl(item?.href, `social[${index}].href`);
  });
}

for (const [label, action] of [
  ["home.primaryAction", kit.home?.primaryAction],
  ["home.secondaryAction", kit.home?.secondaryAction]
]) {
  requireText(action?.label, `${label}.label`);
  if (typeof action?.href === "string" && action.href.startsWith("/")) validatePagePath(action.href, `${label}.href`);
  else validateHttpsUrl(action?.href, `${label}.href`);
}

const giscusRequired = [
  "PUBLIC_GISCUS_REPO",
  "PUBLIC_GISCUS_REPO_ID",
  "PUBLIC_GISCUS_CATEGORY",
  "PUBLIC_GISCUS_CATEGORY_ID"
];
const giscusConfigured = giscusRequired.filter((key) => process.env[key]?.trim());
if (giscusConfigured.length > 0 && giscusConfigured.length < giscusRequired.length) {
  warnings.push("Giscus is only partially configured; it will remain safely disabled until all required values are present");
}

const umamiScript = process.env.PUBLIC_UMAMI_SCRIPT_URL?.trim();
const umamiId = process.env.PUBLIC_UMAMI_WEBSITE_ID?.trim();
if (Boolean(umamiScript) !== Boolean(umamiId)) {
  warnings.push("Umami is only partially configured; it will remain safely disabled until script URL and website ID are both present");
}
if (umamiScript) validateHttpsUrl(umamiScript, "PUBLIC_UMAMI_SCRIPT_URL");

if (kit.site?.url !== "https://example.com" && kit.site?.title === "AstroPublishKit") {
  warnings.push("site.url is no longer the demo origin but the AstroPublishKit demo title is still configured");
}

for (const warning of warnings) console.warn(`warning: ${warning}`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Config checks passed${warnings.length ? ` with ${warnings.length} warning(s)` : ""}.`);
