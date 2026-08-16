import { describe, expect, it } from "vitest";

import {
  eventIsoDate,
  formatDisplayDate,
  logoUrl,
  parseDisplayDate,
  splitEvents,
  todayIso,
} from "~/lib/events";
import { makeEvent } from "../../test/fixtures";

describe("parseDisplayDate", () => {
  it("parses a dd/mm/yyyy string into a local-midnight Date", () => {
    const date = parseDisplayDate("05/03/2026");
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(2); // 0-indexed: March
    expect(date.getDate()).toBe(5);
    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
  });

  it("parses single-digit day/month", () => {
    const date = parseDisplayDate("1/2/2026");
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(1);
    expect(date.getDate()).toBe(1);
  });
});

describe("eventIsoDate", () => {
  it("returns event.isoDate when present", () => {
    expect(eventIsoDate({ date: "01/02/2020", isoDate: "2026-03-05" })).toBe("2026-03-05");
  });

  it("derives yyyy-mm-dd from date when isoDate is absent (falsy)", () => {
    expect(eventIsoDate({ date: "5/3/2026", isoDate: "" })).toBe("2026-03-05");
  });

  it("zero-pads single-digit day and month", () => {
    expect(eventIsoDate({ date: "1/2/2026", isoDate: "" })).toBe("2026-02-01");
  });

  it("does not zero-pad when already two digits", () => {
    expect(eventIsoDate({ date: "15/08/2026", isoDate: "" })).toBe("2026-08-15");
  });
});

describe("todayIso", () => {
  it("returns yyyy-mm-dd for a fixed instant, converted to Europe/Helsinki", () => {
    // 2026-03-01T22:30:00Z is EET (UTC+2) in Helsinki before the March DST
    // change, so local time is 2026-03-02 00:30.
    expect(todayIso(new Date("2026-03-01T22:30:00Z"))).toBe("2026-03-02");
  });

  it("stays on the same day when the UTC offset doesn't cross midnight", () => {
    // August is EEST (UTC+3) in Helsinki.
    expect(todayIso(new Date("2026-08-15T10:00:00Z"))).toBe("2026-08-15");
  });

  it("rolls over to the next day near midnight UTC in summer (UTC+3)", () => {
    expect(todayIso(new Date("2026-08-15T21:30:00Z"))).toBe("2026-08-16");
  });
});

describe("splitEvents", () => {
  it("splits into upcoming (today or later, ascending) and past (descending)", () => {
    const today = "2026-06-15";
    const events = [
      makeEvent({ name: "Future far", isoDate: "2026-08-01" }),
      makeEvent({ name: "Today", isoDate: "2026-06-15" }),
      makeEvent({ name: "Future near", isoDate: "2026-06-20" }),
      makeEvent({ name: "Past near", isoDate: "2026-06-10" }),
      makeEvent({ name: "Past far", isoDate: "2026-01-01" }),
    ];

    const { upcoming, past } = splitEvents(events, today);

    expect(upcoming.map((e) => e.name)).toEqual(["Today", "Future near", "Future far"]);
    expect(past.map((e) => e.name)).toEqual(["Past near", "Past far"]);
  });

  it("includes an event dated exactly today in upcoming", () => {
    const today = "2026-06-15";
    const { upcoming, past } = splitEvents(
      [makeEvent({ name: "Today", isoDate: "2026-06-15" })],
      today,
    );
    expect(upcoming.map((e) => e.name)).toEqual(["Today"]);
    expect(past).toEqual([]);
  });

  it("defaults `today` to todayIso() when not given", () => {
    const events = [
      makeEvent({ name: "Way in the past", isoDate: "2000-01-01" }),
      makeEvent({ name: "Way in the future", isoDate: "2999-01-01" }),
    ];
    const { upcoming, past } = splitEvents(events);
    expect(upcoming.map((e) => e.name)).toEqual(["Way in the future"]);
    expect(past.map((e) => e.name)).toEqual(["Way in the past"]);
  });
});

describe("logoUrl", () => {
  it("returns undefined when logo is undefined", () => {
    expect(logoUrl(undefined)).toBeUndefined();
  });

  it("resolves a bare filename under /assets/logos/", () => {
    expect(logoUrl("acme.png")).toBe("/assets/logos/acme.png");
  });

  it("passes through absolute http URLs", () => {
    expect(logoUrl("http://example.com/logo.png")).toBe("http://example.com/logo.png");
  });

  it("passes through absolute https URLs", () => {
    expect(logoUrl("https://example.com/logo.png")).toBe("https://example.com/logo.png");
  });
});

describe("formatDisplayDate", () => {
  it("formats an ISO timestamp as dd/mm/yyyy in Europe/Helsinki", () => {
    expect(formatDisplayDate("2026-08-15T21:30:00Z")).toBe("16/08/2026");
  });

  it("formats a timestamp that stays on the same Helsinki day", () => {
    expect(formatDisplayDate("2026-08-15T10:00:00Z")).toBe("15/08/2026");
  });
});
