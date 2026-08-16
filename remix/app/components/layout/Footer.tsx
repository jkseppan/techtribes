import { Link, useRouteLoaderData } from "react-router";

import { formatDisplayDate } from "~/lib/events";
import { REPO_URL } from "~/lib/site";
import type { loader as rootLoader } from "~/root";

const linkClass = "hover:text-primary duration-150";

export function Footer() {
  // The root loader supplies the scrape timestamp; it is unavailable while the
  // root ErrorBoundary is rendering, hence the optional chaining.
  const root = useRouteLoaderData<typeof rootLoader>("root");
  const updated = root?.updated ? formatDisplayDate(root.updated) : undefined;

  return (
    <footer className="bg-muted print:hidden">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6 text-center">
          <div className="w-full lg:w-auto">
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground text-sm">
              {updated ? <li className="flex items-center">Last updated on {updated}</li> : null}
              <li className="flex items-center gap-2">
                {updated ? <span>·</span> : null}
                <a href={REPO_URL} className={linkClass}>
                  Code
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span>·</span>
                <a href="/feed.xml" className={linkClass}>
                  Feed
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span>·</span>
                <Link to="/guide" className={linkClass}>
                  Organizer guide
                </Link>
              </li>
            </ul>
          </div>
          <div className="w-full lg:w-auto lg:ml-auto">
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground text-sm">
              <li className="flex items-center">
                Host a community on
                <a href="https://www.meetabit.com/communities/new" className={`ml-1 ${linkClass}`}>
                  Meetabit
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span>·</span>
                <span>Sponsored by</span>
                <a href="https://www.toughbyte.com/about" className={`ml-1 ${linkClass}`}>
                  Toughbyte
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
