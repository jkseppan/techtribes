/**
 * Pure client-side filtering helpers for the community list.
 * No React, no Node APIs: shared between components and unit tests.
 */
import type { CommunityEvent } from "./types";

/** Lower-case, trimmed haystack of the fields the search box looks at. */
function searchableText(event: CommunityEvent): string {
  return [event.name, event.location, event.eventLocation, ...(event.tags ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/** Case-insensitive tag comparison (tags are matched exactly, ignoring case/space). */
function normaliseTag(tag: string): string {
  return tag.trim().toLowerCase();
}

/**
 * Does an event pass the current filter?
 *
 * - `query` matches as a case-insensitive substring over the community name,
 *   location, event location and tags. An empty/whitespace query matches all.
 * - `tags` is an AND filter: the event must carry *every* selected tag
 *   (compared case-insensitively). An empty array matches all.
 */
export function matchesFilter(event: CommunityEvent, query: string, tags: string[]): boolean {
  const trimmed = query.trim().toLowerCase();
  if (trimmed && !searchableText(event).includes(trimmed)) return false;
  if (tags.length === 0) return true;
  const own = new Set((event.tags ?? []).map(normaliseTag));
  return tags.every((tag) => own.has(normaliseTag(tag)));
}

/** Filter a list of events, preserving order. */
export function filterEvents(
  events: CommunityEvent[],
  query: string,
  tags: string[],
): CommunityEvent[] {
  if (!query.trim() && tags.length === 0) return events;
  return events.filter((event) => matchesFilter(event, query, tags));
}

/**
 * Collect the distinct tags used by a list of events with their occurrence
 * count, sorted by count descending then tag name ascending (case-insensitive).
 * The first spelling encountered wins for tags that differ only in case.
 */
export function collectTags(events: CommunityEvent[]): { tag: string; count: number }[] {
  const counts = new Map<string, { tag: string; count: number }>();
  for (const event of events) {
    for (const tag of event.tags ?? []) {
      const key = normaliseTag(tag);
      if (!key) continue;
      const existing = counts.get(key);
      if (existing) existing.count += 1;
      else counts.set(key, { tag, count: 1 });
    }
  }
  return [...counts.values()].sort(
    (a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "en", { sensitivity: "base" }),
  );
}
