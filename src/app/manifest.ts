import type { MetadataRoute } from "next";

export const dynamic = "force-static";

// Manifest colors can't read CSS variables: keep in sync with styles/tokens.css
// (--accent and --background, light theme).
const THEME_COLOR = "#0f766e";
const BACKGROUND_COLOR = "#f7f7f5";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Oskoro",
    short_name: "Oskoro",
    description: "Unofficial companion for Plakoro matches / Acompañante no oficial para partidas de Plakoro",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    theme_color: THEME_COLOR,
    background_color: BACKGROUND_COLOR,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
