import { getScrapeOutput } from "~/lib/data.server";
import { buildFeed } from "~/lib/feed";
import { SITE_URL } from "~/lib/site";

export async function loader() {
  const { events, updated } = await getScrapeOutput();
  return new Response(buildFeed(events, { updated, siteUrl: SITE_URL }), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
