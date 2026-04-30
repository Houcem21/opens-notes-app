export function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createUniqueSlug(text) {
  const base = slugify(text) || "untitled";
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}