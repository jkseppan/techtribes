import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { ArrowLeft } from "lucide-react";

import type { Route } from "./+types/root";
import { Footer } from "~/components/layout/Footer";
import { Header } from "~/components/layout/Header";
import { Button } from "~/components/ui/button";
import { TooltipProvider } from "~/components/ui/tooltip";
import { getScrapeOutput } from "~/lib/data.server";
import { pageMeta } from "~/lib/meta";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "~/lib/site";
import "./app.css";

/**
 * Applies the stored theme before first paint so there is no flash of the wrong
 * colour scheme. Kept deliberately tiny; it runs from the document head.
 */
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.classList.toggle("dark",t==="dark");}catch(e){}})();`;

/** Simple Analytics' no-JS tracking pixel. */
const ANALYTICS_NOSCRIPT_SRC = "https://queue.simpleanalyticscdn.com/noscript.gif";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
  { rel: "icon", type: "image/png", sizes: "16x16", href: "/assets/favicons/favicon-16x16.png" },
  { rel: "icon", type: "image/png", sizes: "32x32", href: "/assets/favicons/favicon-32x32.png" },
  { rel: "apple-touch-icon", sizes: "180x180", href: "/assets/favicons/apple-touch-icon.png" },
  {
    rel: "alternate",
    type: "application/rss+xml",
    title: SITE_TITLE,
    href: `${SITE_URL}/feed.xml`,
  },
];

// Site-wide defaults. Child routes export their own `meta` (built with the same
// `pageMeta` helper), which replaces this list entirely.
export const meta: Route.MetaFunction = () =>
  pageMeta({ title: SITE_TITLE, description: SITE_DESCRIPTION, path: "/" });

/**
 * The scrape timestamp, shown as "Last updated on …" in the footer. The Jekyll
 * site used the build time; the scrape time is more truthful and does not
 * change when the site is rebuilt without new data.
 */
export async function loader() {
  const { updated } = await getScrapeOutput();
  return { updated };
}

/**
 * Everything is baked in at build time, so the root loader never has to run
 * again on the client. Opting out keeps client-side navigations (including the
 * home page's search-param updates) from fetching a `.data` file on the static
 * host.
 */
export function shouldRevalidate() {
  return false;
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light dark" />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <Meta />
        <Links />
      </head>
      <body>
        <TooltipProvider>
          <div className="min-h-screen flex flex-col pt-20">
            <Header />
            <main className="flex-1">
              <div className="container mx-auto px-4">{children}</div>
            </main>
            <Footer />
          </div>
        </TooltipProvider>
        <ScrollRestoration />
        <Scripts />
        <script async src="https://scripts.simpleanalyticscdn.com/latest.js"></script>
        {/* Raw HTML so the attribute is emitted lowercase, exactly as the
            Simple Analytics snippet prescribes (React would render the JSX
            prop name verbatim inside <noscript>). */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<img src="${ANALYTICS_NOSCRIPT_SRC}" alt="" referrerpolicy="no-referrer-when-downgrade" />`,
          }}
        />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let heading = "Error";
  let title = "Something went wrong";
  let message = "An unexpected error occurred. Please try again.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    heading = String(error.status);
    title = error.status === 404 ? "Not found" : error.statusText || "Request failed";
    message =
      error.status === 404
        ? "The page you were looking for doesn't exist."
        : typeof error.data === "string" && error.data
          ? error.data
          : message;
  } else if (error instanceof Error) {
    message = error.message;
    if (import.meta.env.DEV) stack = error.stack;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-12 text-center">
      <header className="flex max-w-sm flex-col items-center gap-3">
        <div className="text-6xl font-bold text-muted-foreground">{heading}</div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground text-sm/relaxed">{message}</p>
      </header>
      <section className="flex gap-2">
        <Button asChild>
          <Link to="/">
            <ArrowLeft aria-hidden="true" />
            Go home
          </Link>
        </Button>
      </section>
      {stack ? (
        <pre className="w-full max-w-3xl overflow-x-auto rounded-xl bg-muted p-4 text-left text-xs">
          <code>{stack}</code>
        </pre>
      ) : null}
    </div>
  );
}
