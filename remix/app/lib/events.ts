/**
 * Pure helpers for working with scraped community events.
 * No Node APIs here: this module is shared between loaders, components and tests.
 */
import type { CommunityEvent } from "./types";
import { SITE_TIMEZONE } from "./site";

/** Parse a dd/mm/yyyy string into a Date at local midnight. */
export function parseDisplayDate(date: string): Date {
  const [day, month, year] = date.split("/").map(Number);
  return new Date(year, month - 1, day);
}

/** Return the yyyy-mm-dd of an event, preferring the scraped isoDate. */
export function eventIsoDate(event: Pick<CommunityEvent, "date" | "isoDate">): string {
  if (event.isoDate) return event.isoDate;
  const [day, month, year] = event.date.split("/");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

/** Today's date as yyyy-mm-dd in the site's time zone (Europe/Helsinki). */
export function todayIso(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SITE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/**
 * Split events into upcoming (today or later, soonest first) and past
 * (most recent first). `today` is a yyyy-mm-dd string; ISO date strings sort
 * lexicographically so no Date objects are needed.
 */
export function splitEvents(
  events: CommunityEvent[],
  today: string = todayIso(),
): { upcoming: CommunityEvent[]; past: CommunityEvent[] } {
  const upcoming: CommunityEvent[] = [];
  const past: CommunityEvent[] = [];
  for (const event of events) {
    (eventIsoDate(event) >= today ? upcoming : past).push(event);
  }
  upcoming.sort((a, b) => eventIsoDate(a).localeCompare(eventIsoDate(b)));
  past.sort((a, b) => eventIsoDate(b).localeCompare(eventIsoDate(a)));
  return { upcoming, past };
}

/** Resolve a community logo to a URL usable in <img src>. */
export function logoUrl(logo: string | undefined): string | undefined {
  if (!logo) return undefined;
  return /^https?:\/\//.test(logo) ? logo : `/assets/logos/${logo}`;
}

/** Format an ISO timestamp as dd/mm/yyyy in the site's time zone. */
export function formatDisplayDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: SITE_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}
