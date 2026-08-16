import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("guide", "routes/guide.tsx"),
  route("feed.xml", "routes/feed[.]xml.ts"),
  // Catch-all renders the not-found page. It is prerendered at /404 and copied
  // to build/client/404.html (see scripts/postbuild.ts) for GitHub Pages.
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
