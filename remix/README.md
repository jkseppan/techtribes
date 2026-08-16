# Techtribes site

The [techtrib.es](https://www.techtrib.es) site: a static, prerendered React Router app.

## Stack

- [React Router v8](https://reactrouter.com/) in **framework mode**, `ssr: false` + `prerender` — every route is rendered to static HTML at build time by `react-router build`, no server at runtime
- React 19
- Vite 8
- Tailwind CSS v4
- [shadcn/ui](https://ui.shadcn.com/) components (`app/components/ui`)
- [lucide-react](https://lucide.dev/) icons
- `marked` + `gray-matter` for rendering the Markdown guide page
- Vitest for tests

## Commands

Run from this directory (`remix/`):

```bash
npm install
npm run dev          # dev server with HMR
npm run build        # react-router build + scripts/postbuild.ts -> build/client
npm run preview      # serve the built output locally (vite preview --outDir build/client)
npm run typecheck    # react-router typegen && tsc
npm run lint         # eslint
npm run format       # prettier --write
npm run test         # vitest run
```

Before running `dev` or `build`, scrape event data from the **repo root** at least once:

```bash
cd ..
npm install
npm run scrape
```

## Project structure

```
app/
  routes.ts               route config: "/" -> home, "/guide" -> guide,
                           "/feed.xml" -> resource route, "*" -> not-found (catch-all)
  root.tsx                document Layout + App, global providers
  app.css                 Tailwind v4 + shadcn theme tokens, dark mode (.dark class)
  routes/
    home.tsx               community list / home page
    guide.tsx               guide page (renders content/guide.md)
    feed[.]xml.ts            resource route producing the RSS/Atom feed
    not-found.tsx            catch-all, prerendered as /404 -> copied to 404.html
  components/
    layout/                 Header, Footer, ThemeToggle
    cards/                  CommunityCard
    events/                 EventList
    ui/                     shadcn/ui primitives (button, badge, card, input, tooltip)
  lib/
    types.ts                 Community / CommunityEvent / ScrapeOutput types
    site.ts                  site-wide constants (SITE_URL, SITE_NAME, ...)
    events.ts                 pure date/event helpers (upcoming/past split, formatting)
    data.server.ts             reads ../data/output.json (build-time only, from loaders)
    meta.ts                    SEO / <meta> / OpenGraph / JSON-LD helpers
    filter.ts                  community/tag filtering helpers
    feed.ts                    RSS/Atom feed generation
    content.server.ts           loads and renders content/guide.md
  content/
    guide.md                  Markdown source for the guide page
  styles/
    prose.css                  prose styling for rendered markdown
scripts/
  postbuild.ts               post-processing after react-router build (see below)
public/                      static files served as-is (in addition to the copied
                              site/assets, see below)
react-router.config.ts       ssr:false, prerender: ["/", "/guide", "/404", "/feed.xml"]
vite.config.ts                plugins + static copy of shared assets
```

## Data flow

1. From the **repo root**, `npm run scrape` runs `src/scrape.ts` against `data/communities.yml`, fetching events from each community's Meetup/Meetabit/Luma/JSON source, and writes `data/output.json`.
2. `app/lib/data.server.ts` reads `../data/output.json` at build time. It's only ever imported from route `loader`s, which React Router runs during `react-router build` (and in `react-router dev`) since `ssr: false` + `prerender` means every route is rendered ahead of time — there is no runtime server reading this file in production.
3. `react-router build` writes fully static HTML + assets to `build/client/`, which is what gets deployed.

## Static assets

Community logos, favicons and the social share image still live in the Jekyll tree at `../site/assets/{logos,favicons,social}` and `../site/favicon.ico`, so both sites can keep serving them from identical URLs while they coexist. `vite.config.ts` copies these into `build/client` (and serves them in `dev`) via `vite-plugin-static-copy`, so they resolve as `/assets/logos/*.png` etc. and `/favicon.ico`. Once the Jekyll site is retired, these will move into `public/` directly (see the repo root `TODO.md`).

## 404 page and feed

- `react-router.config.ts` prerenders `/404` (the catch-all `not-found.tsx` route). GitHub Pages doesn't know about `/404` as a special path, so `scripts/postbuild.ts` copies the generated `build/client/404/index.html` to `build/client/404.html` after the build, which GitHub Pages serves automatically for any unknown URL.
- `/feed.xml` is a resource route (`routes/feed[.]xml.ts`, loader only, no component) prerendered to a static XML file at `build/client/feed.xml`.
- `scripts/postbuild.ts` also writes an empty `.nojekyll` file (so GitHub Pages serves the output as-is, without running it through Jekyll) and removes a couple of build artifacts that only matter for a runtime SPA (`__spa-fallback.html`, `feed.xml.data`), which are meaningless on a static host.

## Deployment

The site is built and deployed to GitHub Pages by the root workflow, [`.github/workflows/build.yml`](../.github/workflows/build.yml): it scrapes data at the repo root, runs `npm ci && npm run build` here, and uploads `build/client` as the Pages artifact. It runs on every push to `main`, once a day (to pick up new events), and can be triggered manually.
