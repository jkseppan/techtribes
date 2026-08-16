# TODO

- Once the `remix/` React Router site has been verified in production (GitHub Pages, techtrib.es):
  - Remove the legacy Jekyll site: `site/` templates (`_layouts`, `_includes`, `index.html`, `guide.md`, `404.html`, `feed.xml`, `_config.yml`), `Gemfile`, `Gemfile.lock`, `.ruby-version`, and the Jekyll-related root npm scripts (`start`, `build`).
  - Move shared static assets from `site/assets/{logos,favicons,social}` and `site/favicon.ico` into `remix/public/assets` (and `remix/public/favicon.ico`), and drop the `vite-plugin-static-copy` step in `remix/vite.config.ts` that currently pulls them from `site/`.
  - Drop the `site/_data/output.yml` output from `src/scrape.ts` (keep only `data/output.json`).
