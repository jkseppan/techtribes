/**
 * Shared test fixtures for the Vitest suite.
 * Keep these small and deterministic — no network, no real data files.
 */
import type { CommunityEvent } from "~/lib/types";

/** Build a CommunityEvent with sensible defaults; override only what a test cares about. */
export function makeEvent(overrides: Partial<CommunityEvent> = {}): CommunityEvent {
  const { tags, ...rest } = overrides;
  return {
    name: "Helsinki JS",
    location: "Helsinki, Finland",
    tags: tags ?? ["javascript", "frontend"],
    events: "https://meetup.com/helsinki-js",
    site: "https://helsinkijs.org",
    logo: "helsinki-js.png",
    date: "15/08/2026",
    isoDate: "2026-08-15",
    event: "https://meetup.com/helsinki-js/events/1",
    eventLocation: "Maria 01, Helsinki",
    members: 1200,
    ...rest,
  };
}
