import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

// Shared static assets (community logos, icons, favicons, social image) still
// live in the Jekyll tree at ../site/assets while both sites coexist. They are
// served in dev and copied into build/client at build time so URLs stay
// identical to the Jekyll site (/assets/logos/*.png etc.).
export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    viteStaticCopy({
      // The plugin preserves the source directory structure, so copy each
      // (flat) directory's files individually with the base stripped.
      targets: [
        ...["icons", "logos", "favicons", "social"].map((dir) => ({
          src: `../site/assets/${dir}/*`,
          dest: `assets/${dir}`,
          rename: { stripBase: true as const },
        })),
        { src: "../site/favicon.ico", dest: "", rename: { stripBase: true as const } },
      ],
    }),
  ],
  resolve: {
    alias: {
      "~": path.resolve(import.meta.dirname, "app"),
    },
  },
});
