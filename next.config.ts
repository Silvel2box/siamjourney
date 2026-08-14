import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. Without it Next picks up the parent
  // folder's stray lockfile and infers the wrong root.
  turbopack: {
    root: import.meta.dirname,
  },
  // "X-Powered-By: Next.js" says which framework and, with Passenger's own
  // addition, which version to look up. Passenger's half has to come off in the
  // Plesk panel — see DEPLOY.md.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // A year of HTTPS-only. Deliberately without includeSubDomains: Plesk
          // serves webmail and the panel on subdomains of this domain, and the
          // directive would lock every one of them out of HTTP with no way back
          // until the max-age runs out.
          { key: "Strict-Transport-Security", value: "max-age=31536000" },
          // Stops a browser from guessing that an uploaded .jpg is really HTML.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Full URLs leak to affiliate networks on every outbound click; the
          // origin alone is all they need for attribution.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Clickjacking: nothing here is meant to be framed elsewhere. The
          // Google Maps embeds are us framing them, which is unaffected.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          // Features the site never uses. Ads and embeds inherit the refusal.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
        ],
      },
    ];
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
