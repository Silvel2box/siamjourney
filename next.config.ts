import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. Without it Next picks up the parent
  // folder's stray lockfile and infers the wrong root.
  turbopack: {
    root: import.meta.dirname,
  },
  images: {
    // Hosts allowed for next/image. Add your real image host here when the team
    // swaps placeholders for real photos. Optimizer stays on (runs under
    // `next start` on Plesk); add `unoptimized: true` here if Plesk can't handle it.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
