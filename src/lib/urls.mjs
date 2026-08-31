export function withTrailingSlash(pathname) {
  if (!pathname || pathname === "/") return "/";
  return `${pathname.replace(/\/+$/, "")}/`;
}

export function absolutePageUrl(pathname, baseUrl) {
  return new URL(withTrailingSlash(pathname), `${baseUrl.replace(/\/+$/, "")}/`).href;
}
