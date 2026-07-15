import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { regions } from "@/lib/regions";
import { categories } from "@/lib/categories";
import {
  getAllProvinces,
  getAllPlaces,
  getPlacesByProvinceCategory,
} from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url;

  const categoryUrls = getAllProvinces().flatMap((p) =>
    categories
      .filter((c) => getPlacesByProvinceCategory(p.slug, c.slug).length > 0)
      .map((c) => ({ url: `${base}/${p.region}/${p.slug}/${c.slug}`, priority: 0.65 })),
  );

  return [
    { url: base, priority: 1 },
    { url: `${base}/privacy`, priority: 0.3 },
    { url: `${base}/terms`, priority: 0.3 },
    ...regions.map((r) => ({ url: `${base}/${r.slug}`, priority: 0.8 })),
    ...getAllProvinces().map((p) => ({
      url: `${base}/${p.region}/${p.slug}`,
      priority: 0.7,
    })),
    ...categoryUrls,
    ...getAllPlaces().map((p) => ({
      url: `${base}/place/${p.slug}`,
      priority: 0.6,
    })),
  ];
}
