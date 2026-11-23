import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  // Dev only: lets a phone on the same Wi-Fi use `npm run dev` via the LAN IP
  // (Next blocks cross-origin dev requests by default). No effect on the build.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
