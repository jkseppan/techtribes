/**
 * Build-time data access. Only imported from route `loader`s, which run in
 * Node during `react-router build` (prerender) and `react-router dev`; this
 * code never ships to the browser.
 *
 * The scraper (`npm run scrape` in the repository root) writes
 * data/output.json; all npm scripts in this package run from `remix/`, so the
 * repository root is one directory up.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import type { ScrapeOutput } from "./types";

export const REPO_ROOT = path.resolve(process.cwd(), "..");
export const OUTPUT_JSON = path.join(REPO_ROOT, "data", "output.json");

let cache: Promise<ScrapeOutput> | undefined;

/** Read and parse data/output.json (memoised for the lifetime of the build). */
export function getScrapeOutput(): Promise<ScrapeOutput> {
  cache ??= readScrapeOutput();
  return cache;
}

async function readScrapeOutput(): Promise<ScrapeOutput> {
  let text: string;
  try {
    text = await fs.readFile(OUTPUT_JSON, "utf8");
  } catch (error) {
    throw new Error(
      `Could not read ${OUTPUT_JSON}. Run \`npm run scrape\` in the repository root first.`,
      { cause: error },
    );
  }
  const data = JSON.parse(text) as ScrapeOutput;
  if (!Array.isArray(data.events)) {
    throw new Error(`${OUTPUT_JSON} does not contain an "events" array.`);
  }
  return data;
}
