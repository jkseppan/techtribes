import type { Route } from "./+types/home";
import { EventList } from "~/components/events/EventList";
import { getScrapeOutput } from "~/lib/data.server";
import { splitEvents } from "~/lib/events";
import { eventListNodes, pageMeta } from "~/lib/meta";
import { SITE_TITLE } from "~/lib/site";

export async function loader() {
  const { events } = await getScrapeOutput();
  const { upcoming, past } = splitEvents(events);
  return { upcoming, past };
}

/**
 * The data is baked in at build time and never changes, so the search-param
 * updates the filter UI makes must not trigger a pointless `.data` refetch.
 */
export function shouldRevalidate() {
  return false;
}

export function meta({ loaderData }: Route.MetaArgs) {
  return pageMeta({
    title: SITE_TITLE,
    description:
      "Discover active tech communities and meetups in Finland. Find upcoming events, past meetups, and connect with tech enthusiasts in your area.",
    path: "/",
    graph: eventListNodes(loaderData?.upcoming ?? []),
  });
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { upcoming, past } = loaderData;
  return (
    <>
      {/* The visible page starts at the "Upcoming events" h2;
          give assistive tech and crawlers a document-level heading anyway. */}
      <h1 className="sr-only">{SITE_TITLE}</h1>
      <EventList upcoming={upcoming} past={past} />
    </>
  );
}
