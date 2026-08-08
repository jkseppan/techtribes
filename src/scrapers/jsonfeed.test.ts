import assert from "assert";
import scrape, { parseJsonFeed } from "./jsonfeed.ts";

const feed = {
  version: "https://jsonfeed.org/version/1.1",
  title: "Test feed",
  _ext: { member_count: 42 },
  items: [
    { id: "a", url: "https://example.com/a", date_published: "1999-01-02T10:00:00Z" },
    {
      id: "b",
      url: "https://example.com/b",
      date_published: "1999-01-01T10:00:00Z",
      _ext_event: { start: "2099-01-01T18:00:00Z" },
    },
  ],
};

const upcoming = parseJsonFeed(feed);
assert.equal(upcoming.members, 42);
assert.equal(upcoming.event?.link, "https://example.com/b");
assert.equal(upcoming.event?.date, "01/01/2099");

const pastOnly = parseJsonFeed({ ...feed, items: [feed.items[0]] });
assert.equal(pastOnly.event?.date, "02/01/1999");

assert.equal(parseJsonFeed({ title: "empty", items: [] }).event, null);

console.log(await scrape("https://pydata-helsinki.fi/events.json"));
