import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // /go is the outbound hop for partner links. Crawling it would count clicks
    // nobody made and send bots off to the partner sites.
    rules: { userAgent: "*", allow: "/", disallow: "/go" },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
