/** Converts stored rich-text HTML into plain text for search, counts, and exports. */
export function stripHtml(html: string | undefined | null): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(div|p|li)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\u200B/g, "");
}

/** True when the stored rich-text HTML has no visible characters. */
export function isEmptyHtml(html: string | undefined | null): boolean {
  return stripHtml(html).trim().length === 0;
}
