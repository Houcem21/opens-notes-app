function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function createDocReferenceHtml({ type, id, label }) {
  const safeType = escapeHtml(type);
  const safeId = escapeHtml(id);
  const safeLabel = escapeHtml(label);

  return `<span class="docReference" data-ref-type="${safeType}" data-ref-id="${safeId}">${safeType}: ${safeLabel}</span>&nbsp;`;
}