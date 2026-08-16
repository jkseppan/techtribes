/**
 * Post-processing for the static build (runs after `react-router build`).
 *
 * - GitHub Pages serves `404.html` for unknown URLs, but React Router
 *   pre-renders the catch-all route at /404 as `404/index.html`. Copy it.
 * - `.nojekyll` tells GitHub Pages not to run the output through Jekyll.
 * - Remove build artifacts that are meaningless for a static host.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

const clientDir = path.resolve(import.meta.dirname, "../build/client");

async function main() {
  const notFoundSrc = path.join(clientDir, "404", "index.html");
  const notFoundDest = path.join(clientDir, "404.html");
  await fs.copyFile(notFoundSrc, notFoundDest);
  console.log(`Postbuild: copied 404/index.html -> 404.html`);

  await fs.writeFile(path.join(clientDir, ".nojekyll"), "");
  console.log(`Postbuild: wrote .nojekyll`);

  // Not needed on a static host: unknown URLs are served 404.html directly,
  // and the feed is fetched as a document, never via client-side navigation.
  for (const stray of ["__spa-fallback.html", "feed.xml.data"]) {
    await fs.rm(path.join(clientDir, stray), { force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
