import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. Without it Next picks up the parent
  // folder's stray lockfile and infers the wrong root.
  turbopack: {
    root: import.meta.dirname,
  },
  images: {
    // Pexels stock is hotlinked (their CDN allows it; next/image caches the
    // optimized result). Wikimedia photos are self-hosted under public/images
    // (Commons rate-limits hotlinking) so they need no remote pattern.
    // Optimizer stays on (runs under `next start` on Plesk); add
    // `unoptimized: true` here if Plesk can't handle it.
    // res.klook.com serves the product photos that come with the affiliate
    // feed. Hotlinked on purpose, unlike our editorial images: the photo
    // belongs to the operator, and keeping Klook's copy means the card follows
    // the product if they reshoot it rather than showing a frozen old one.
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "res.klook.com" },
    ],
  },
};

export default nextConfig;
