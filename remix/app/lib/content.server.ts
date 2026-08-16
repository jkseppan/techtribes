/**
 * Build-time markdown content loading. Only imported from route `loader`s,
 * which run in Node during `react-router build` (prerender) and
 * `react-router dev`; this code never ships to the browser.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

export const GUIDE_MD = path.resolve(process.cwd(), "app/content/guide.md");

interface Guide {
  title: string;
  description: string;
  html: string;
}

let cache: Promise<Guide> | undefined;

/** Read, parse and render app/content/guide.md (memoised for the build). */
export function loadGuide(): Promise<Guide> {
  cache ??= readGuide();
  return cache;
}

async function readGuide(): Promise<Guide> {
  const raw = await fs.readFile(GUIDE_MD, "utf8");
  const { data, content } = matter(raw);
  const html = await marked.parse(content, { gfm: true });
  return {
    title: data.title as string,
    description: data.description as string,
    html,
  };
}
