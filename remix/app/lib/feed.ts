/**
 * Pure RSS 2.0 feed builder, ported from site/feed.xml. No Node APIs here: it
 * only takes already-loaded events and returns a string, so it's easy to
 * unit test.
 */
import { eventIsoDate } from "./events";
import type { CommunityEvent } from "./types";

export interface BuildFeedOptions {
  /** ISO timestamp used for <lastBuildDate>, e.g. ScrapeOutput.updated. */
  updated: string;
  /** Site origin, no trailing slash, e.g. "https://www.techtrib.es". */
  siteUrl: string;
}

/** Escape text for use in XML element content. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Build the techtribes RSS 2.0 feed as an XML string. */
export function buildFeed(events: CommunityEvent[], opts: BuildFeedOptions): string {
  const { updated, siteUrl } = opts;
  const sorted = [...events].sort((a, b) => eventIsoDate(b).localeCompare(eventIsoDate(a)));

  const items = sorted
    .map((event) => {
      const isoDate = eventIsoDate(event);
      const pubDate = new Date(`${isoDate}T00:00:00Z`).toUTCString();
      const descriptionParts = [event.location, event.tags?.join(", ")].filter(Boolean);
      return `    <item>
      <title>${escapeXml(event.name)}</title>
      <link>${escapeXml(event.event)}</link>
      <guid>${escapeXml(event.event)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(descriptionParts.join(" — "))}</description>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Techtribes - Tech Events in Finland</title>
    <description>Active tech community events and meetups in Finland</description>
    <link>${siteUrl}/</link>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <language>en</language>
    <lastBuildDate>${new Date(updated).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;
}
