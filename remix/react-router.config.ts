import type { Config } from "@react-router/dev/config";

/**
 * Static site generation: no runtime server (`ssr: false`), every route is
 * pre-rendered at build time into `build/client/`.
 *
 * - "/"       -> build/client/index.html
 * - "/guide"  -> build/client/guide/index.html
 * - "/404"    -> build/client/404/index.html (copied to 404.html by scripts/postbuild.ts
 *                so GitHub Pages serves it for unknown URLs)
 * - "/feed.xml" is a resource route (loader only) and is written verbatim.
 */
export default {
  ssr: false,
  prerender: ["/", "/guide", "/404", "/feed.xml"],
} satisfies Config;
