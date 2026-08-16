import { describe, expect, it } from "vitest";

import { buildFeed, escapeXml } from "~/lib/feed";
import { makeEvent } from "../../test/fixtures";

const SITE_URL = "https://www.techtrib.es";

function parseXml(xml: string): Document {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const error = doc.querySelector("parsererror");
  if (error) throw new Error(`XML failed to parse: ${error.textContent}`);
  return doc;
}

describe("escapeXml", () => {
  it("escapes ampersands", () => {
    expect(escapeXml("Rock & Roll")).toBe("Rock &amp; Roll");
  });

  it("escapes angle brackets", () => {
    expect(escapeXml("<script>")).toBe("&lt;script&gt;");
  });

  it("escapes double quotes", () => {
    expect(escapeXml('say "hi"')).toBe("say &quot;hi&quot;");
  });

  it("escapes single quotes", () => {
    expect(escapeXml("it's")).toBe("it&apos;s");
  });

  it("leaves plain text untouched", () => {
    expect(escapeXml("Helsinki JS")).toBe("Helsinki JS");
  });
});

describe("buildFeed", () => {
  const events = [
    makeEvent({
      name: "Older Meetup",
      location: "Tampere, Finland",
      tags: ["rust"],
      event: "https://example.com/older",
      isoDate: "2026-01-01",
      date: "01/01/2026",
    }),
    makeEvent({
      name: "Newer Meetup",
      location: "Helsinki, Finland",
      tags: ["javascript", "frontend"],
      event: "https://example.com/newer",
      isoDate: "2026-06-01",
      date: "01/06/2026",
    }),
  ];

  it("produces valid, well-formed XML", () => {
    const xml = buildFeed(events, { updated: "2026-06-15T12:00:00Z", siteUrl: SITE_URL });
    expect(() => parseXml(xml)).not.toThrow();
  });

  it("sets the channel title and link", () => {
    const xml = buildFeed(events, { updated: "2026-06-15T12:00:00Z", siteUrl: SITE_URL });
    const doc = parseXml(xml);
    expect(doc.querySelector("channel > title")?.textContent).toBe(
      "Techtribes - Tech Events in Finland",
    );
    expect(doc.querySelector("channel > link")?.textContent).toBe(`${SITE_URL}/`);
  });

  it("sets a self-referencing atom:link", () => {
    const xml = buildFeed(events, { updated: "2026-06-15T12:00:00Z", siteUrl: SITE_URL });
    const doc = parseXml(xml);
    const atomLink = doc.getElementsByTagNameNS("http://www.w3.org/2005/Atom", "link")[0];
    expect(atomLink.getAttribute("href")).toBe(`${SITE_URL}/feed.xml`);
    expect(atomLink.getAttribute("rel")).toBe("self");
    expect(atomLink.getAttribute("type")).toBe("application/rss+xml");
  });

  it("sorts items by date descending", () => {
    const xml = buildFeed(events, { updated: "2026-06-15T12:00:00Z", siteUrl: SITE_URL });
    const doc = parseXml(xml);
    const titles = [...doc.querySelectorAll("item > title")].map((n) => n.textContent);
    expect(titles).toEqual(["Newer Meetup", "Older Meetup"]);
  });

  it("uses RFC-822/UTC strings for pubDate and lastBuildDate", () => {
    const xml = buildFeed(events, { updated: "2026-06-15T12:00:00Z", siteUrl: SITE_URL });
    const doc = parseXml(xml);
    const lastBuildDate = doc.querySelector("channel > lastBuildDate")?.textContent ?? "";
    expect(lastBuildDate).toBe(new Date("2026-06-15T12:00:00Z").toUTCString());
    expect(lastBuildDate).toMatch(/GMT$/);

    const pubDates = [...doc.querySelectorAll("item > pubDate")].map((n) => n.textContent);
    expect(pubDates).toEqual([
      new Date("2026-06-01T00:00:00Z").toUTCString(),
      new Date("2026-01-01T00:00:00Z").toUTCString(),
    ]);
    for (const pubDate of pubDates) expect(pubDate).toMatch(/GMT$/);
  });

  it("includes location and tags in the item description", () => {
    const xml = buildFeed(events, { updated: "2026-06-15T12:00:00Z", siteUrl: SITE_URL });
    const doc = parseXml(xml);
    const descriptions = [...doc.querySelectorAll("item > description")].map((n) => n.textContent);
    expect(descriptions).toEqual([
      "Helsinki, Finland — javascript, frontend",
      "Tampere, Finland — rust",
    ]);
  });

  it("escapes &, <, > and quotes in names and urls", () => {
    const tricky = [
      makeEvent({
        name: `Rock & Roll <Club> "Meetup"`,
        event: "https://example.com/e?a=1&b=2",
        isoDate: "2026-06-01",
      }),
    ];
    const xml = buildFeed(tricky, { updated: "2026-06-15T12:00:00Z", siteUrl: SITE_URL });
    // The raw string should never contain a bare `&` that isn't part of an entity.
    expect(xml).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;)/);
    const doc = parseXml(xml);
    expect(doc.querySelector("item > title")?.textContent).toBe(`Rock & Roll <Club> "Meetup"`);
    expect(doc.querySelector("item > link")?.textContent).toBe("https://example.com/e?a=1&b=2");
  });

  it("renders an empty channel (no items) as valid XML when given no events", () => {
    const xml = buildFeed([], { updated: "2026-06-15T12:00:00Z", siteUrl: SITE_URL });
    const doc = parseXml(xml);
    expect(doc.querySelectorAll("item").length).toBe(0);
  });
});
