import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { regions } from "@/lib/regions";
import { getAllProvinces, getAllPlaces, getAllHotels } from "@/lib/content";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url;
  const [provinces, places, hotels] = await Promise.all([
    getAllProvinces(),
    getAllPlaces(),
    getAllHotels(),
  ]);

  // The per-category pages are deliberately absent: they carry `noindex`
  // (see [category]/page.tsx), so listing them here would only ask Google to
  // crawl 308 URLs it is told not to keep.
  return [
    { url: base, priority: 1 },
    { url: `${base}/privacy`, priority: 0.3 },
    { url: `${base}/terms`, priority: 0.3 },
    ...(hotels.length > 0 ? [{ url: `${base}/hotel`, priority: 0.7 }] : []),
    ...regions.map((r) => ({ url: `${base}/${r.slug}`, priority: 0.8 })),
    ...provinces.map((p) => ({ url: `${base}/${p.region}/${p.slug}`, priority: 0.7 })),
    ...places.map((p) => ({ url: `${base}/place/${p.slug}`, priority: 0.6 })),
    ...hotels.map((h) => ({ url: `${base}/hotel/${h.slug}`, priority: 0.6 })),
  ];
}
