/**
 * Generates out/sw.js after `next build` so the app opens and works offline
 * after the first visit.
 *
 * - Precache: every page's HTML plus JS, CSS, icons and manifest (~600 KB gzipped).
 *   Any screen can open offline as a full page load.
 * - Runtime cache: Next's RSC payloads (*.txt, used for client-side navigation)
 *   are ~60% of the export, so they are cached as you browse instead. If one is
 *   missing offline, Next falls back to a full page load, served from precache.
 *
 * Runs as part of `npm run build`.
 */
import path from "node:path";
import { generateSW } from "workbox-build";

const outDir = path.resolve(process.cwd(), "out");

async function main() {
  const { count, size, warnings } = await generateSW({
    globDirectory: outDir,
    globPatterns: ["**/*.{html,js,css,png,ico,svg,webmanifest}"],
    swDest: path.join(outDir, "sw.js"),
    // Pages are served from folders (trailingSlash: true): "/es/mesa/" -> "es/mesa/index.html".
    directoryIndex: "index.html",
    // The match setup lives in the query string (?me=...&moves=...) and Next adds
    // ?_rsc=... to client navigations: both must hit the same cached file.
    ignoreURLParametersMatching: [/.*/],
    runtimeCaching: [
      {
        urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.endsWith(".txt"),
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "oskoro-rsc",
          matchOptions: { ignoreSearch: true },
          expiration: { maxEntries: 200 },
        },
      },
    ],
    cleanupOutdatedCaches: true,
    clientsClaim: true,
    skipWaiting: true,
  });

  for (const w of warnings) console.warn(w);
  console.log(`sw.js: precached ${count} files (${(size / 1024).toFixed(0)} KB uncompressed)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
