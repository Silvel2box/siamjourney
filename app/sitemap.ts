import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { regions } from "@/lib/regions";
import { categories } from "@/lib/categories";
import {
  getAllProvinces,
  getAllPlaces,
  getPlacesByProvinceCategory,
} from "@/lib/content";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url;
  const [provinces, places] = await Promise.all([getAllProvinces(), getAllPlaces()]);

  const categoryUrls = (
    await Promise.all(
      provinces.map(async (p) => {
        const cats = await Promise.all(
          categories.map(async (c) => ({
            slug: c.slug,
            has: (await getPlacesByProvinceCategory(p.slug, c.slug)).length > 0,
          })),
        );
        return cats
          .filter((c) => c.has)
          .map((c) => ({ url: `${base}/${p.region}/${p.slug}/${c.slug}`, priority: 0.65 }));
      }),
    )
  ).flat();

  return [
    { url: base, priority: 1 },
    { url: `${base}/privacy`, priority: 0.3 },
    { url: `${base}/terms`, priority: 0.3 },
    ...regions.map((r) => ({ url: `${base}/${r.slug}`, priority: 0.8 })),
    ...provinces.map((p) => ({ url: `${base}/${p.region}/${p.slug}`, priority: 0.7 })),
    ...categoryUrls,
    ...places.map((p) => ({ url: `${base}/place/${p.slug}`, priority: 0.6 })),
  ];
}
