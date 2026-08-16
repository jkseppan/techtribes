import { describe, expect, it } from "vitest";

import { collectTags, filterEvents, matchesFilter } from "~/lib/filter";
import { makeEvent } from "../../test/fixtures";

describe("matchesFilter", () => {
  const event = makeEvent({
    name: "Helsinki JS",
    location: "Helsinki, Finland",
    eventLocation: "Maria 01, Helsinki",
    tags: ["JavaScript", "Frontend"],
  });

  it("matches case-insensitively on name", () => {
    expect(matchesFilter(event, "HELSINKI js", [])).toBe(true);
  });

  it("matches case-insensitively on location", () => {
    expect(matchesFilter(event, "finland", [])).toBe(true);
  });

  it("matches case-insensitively on eventLocation", () => {
    expect(matchesFilter(event, "maria 01", [])).toBe(true);
  });

  it("matches case-insensitively on tags", () => {
    expect(matchesFilter(event, "javascript", [])).toBe(true);
  });

  it("does not match unrelated text", () => {
    expect(matchesFilter(event, "rust", [])).toBe(false);
  });

  it("treats a whitespace-only query as matching everything", () => {
    expect(matchesFilter(event, "   ", [])).toBe(true);
  });

  it("treats an empty query as matching everything", () => {
    expect(matchesFilter(event, "", [])).toBe(true);
  });

  it("requires all selected tags to be present (AND semantics)", () => {
    expect(matchesFilter(event, "", ["JavaScript", "Frontend"])).toBe(true);
    expect(matchesFilter(event, "", ["JavaScript", "Backend"])).toBe(false);
  });

  it("compares tags case-insensitively", () => {
    expect(matchesFilter(event, "", ["javascript", "FRONTEND"])).toBe(true);
  });

  it("fails when the event has no tags and a tag filter is set", () => {
    const noTags = makeEvent({ tags: [] });
    expect(matchesFilter(noTags, "", ["javascript"])).toBe(false);
  });
});

describe("filterEvents", () => {
  const events = [
    makeEvent({ name: "Alpha", tags: ["a"] }),
    makeEvent({ name: "Beta", tags: ["b"] }),
    makeEvent({ name: "Gamma", tags: ["a", "b"] }),
  ];

  it("preserves the original order of matches", () => {
    expect(filterEvents(events, "", ["a"]).map((e) => e.name)).toEqual(["Alpha", "Gamma"]);
  });

  it("returns the exact same array reference when the filter is empty", () => {
    expect(filterEvents(events, "", [])).toBe(events);
    expect(filterEvents(events, "   ", [])).toBe(events);
  });

  it("returns a new filtered array when a query is given", () => {
    const result = filterEvents(events, "beta", []);
    expect(result).not.toBe(events);
    expect(result.map((e) => e.name)).toEqual(["Beta"]);
  });
});

describe("collectTags", () => {
  it("counts occurrences across events", () => {
    const events = [
      makeEvent({ tags: ["javascript", "frontend"] }),
      makeEvent({ tags: ["javascript"] }),
      makeEvent({ tags: ["rust"] }),
    ];
    const tags = collectTags(events);
    expect(tags).toEqual([
      { tag: "javascript", count: 2 },
      { tag: "frontend", count: 1 },
      { tag: "rust", count: 1 },
    ]);
  });

  it("orders by count descending, then tag name ascending (case-insensitive)", () => {
    const events = [
      makeEvent({ tags: ["zebra"] }),
      makeEvent({ tags: ["apple"] }),
      makeEvent({ tags: ["mango", "mango"] }),
    ];
    const tags = collectTags(events);
    expect(tags.map((t) => t.tag)).toEqual(["mango", "apple", "zebra"]);
  });

  it("merges tags that differ only in case, keeping the first spelling", () => {
    const events = [makeEvent({ tags: ["JavaScript"] }), makeEvent({ tags: ["javascript"] })];
    const tags = collectTags(events);
    expect(tags).toEqual([{ tag: "JavaScript", count: 2 }]);
  });

  it("skips blank/whitespace-only tags", () => {
    const events = [makeEvent({ tags: ["", "   ", "real"] })];
    const tags = collectTags(events);
    expect(tags).toEqual([{ tag: "real", count: 1 }]);
  });

  it("returns an empty array when there are no tags", () => {
    expect(collectTags([makeEvent({ tags: [] })])).toEqual([]);
  });
});
