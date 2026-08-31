export function slugify(value) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export function stripTrailingSlash(value) {
  if (value === "/") return value;
  return value.replace(/\/+$/, "");
}

export function estimateReadingMinutes(source = "") {
  const withoutCode = source.replace(/```[\s\S]*?```/g, " ");
  const latinWords = withoutCode.match(/[\p{Letter}\p{Number}]+/gu)?.length ?? 0;
  const cjkChars = withoutCode.match(/[\u3400-\u9fff\uf900-\ufaff]/g)?.length ?? 0;
  return Math.max(1, Math.ceil(latinWords / 220 + cjkChars / 500));
}
