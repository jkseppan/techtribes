import { formatDate } from "../utils.ts";

// JSON Feed has no standard way to represent member count or event start,
// so read them from any _extension object (PyData Helsinki has _pydata_helsinki
// with member_count and _pydata_helsinki_event with start)
function extensions(object: Record<string, any>) {
  return Object.entries(object)
    .filter(([key, value]) => key.startsWith("_") && value && typeof value === "object")
    .map(([, value]) => value);
}

function findMembers(feed: Record<string, any>) {
  for (const extension of extensions(feed)) {
    for (const key of ["member_count", "members"]) {
      if (typeof extension[key] === "number") return extension[key];
    }
  }
  return undefined;
}

function findStart(item: Record<string, any>) {
  for (const extension of extensions(item)) {
    for (const key of ["start", "start_date", "date"]) {
      const date = new Date(extension[key]);
      if (extension[key] && !isNaN(date.getTime())) return date;
    }
  }
  const published = new Date(item.date_published);
  return isNaN(published.getTime()) ? null : published;
}

export function isJsonFeed(data: any) {
  return typeof data?.version === "string" &&
    data.version.startsWith("https://jsonfeed.org/version/");
}

export function parseJsonFeed(feed: Record<string, any>) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dated = (feed.items ?? [])
    .map((item: any) => ({ item, date: findStart(item) }))
    .filter(({ date }: any) => date)
    .sort((a: any, b: any) => a.date.getTime() - b.date.getTime());

  if (!dated.length) return { event: null, name: feed.title, members: undefined };

  const { item, date } =
    dated.find(({ date }: any) => date >= today) ?? dated[dated.length - 1];

  return {
    name: feed.title,
    logo: feed.icon,
    members: findMembers(feed),
    event: {
      date: formatDate(date),
      link: item.url ?? item.id,
    },
  };
}

export default async function scrape(events: string | URL | Request) {
  return parseJsonFeed(await (await fetch(events)).json());
}
