export function slugify(text: string) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createUniqueSlug(title: string) {
  const base = slugify(title) || "untitled";
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}