/**
 * Shared data types. The shape mirrors what the scraper at ../src/scrape.ts
 * writes to ../data/output.json (each event is the community entry from
 * data/communities.yml spread together with the scraped event fields).
 */

/** A community as defined in data/communities.yml */
export interface Community {
  name: string;
  /** "City, Country" */
  location: string;
  tags: string[];
  /** URL of the community's event platform page (Meetup, Meetabit, Luma) */
  events: string;
  /** Optional homepage */
  site?: string;
  /** Logo file name in /assets/logos/ or an absolute http(s) URL */
  logo?: string;
  /** Alternative to `events`: a JSON endpoint in the custom Techtribes format */
  url?: string;
}

/** A community together with its most relevant scraped event */
export interface CommunityEvent extends Community {
  /** Member count on the event platform, when available */
  members?: number;
  /** Event date as dd/mm/yyyy (legacy display format) */
  date: string;
  /** Event date as yyyy-mm-dd */
  isoDate: string;
  /** Link to the event page */
  event: string;
  /** Venue / city of the event when the platform provides one */
  eventLocation?: string;
}

/** Contents of data/output.json */
export interface ScrapeOutput {
  /** ISO timestamp of when the scrape ran */
  updated: string;
  events: CommunityEvent[];
  /** Names of communities skipped because they had no event in the past year */
  inactive?: string[];
}
