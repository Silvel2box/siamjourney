// Reads markdown content from /content at build time, validates frontmatter with
// Zod, and exposes typed getters. Runs only in Server Components / build (uses fs).
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { categories } from "./categories";
import { regions } from "./regions";

const CONTENT_DIR = path.join(process.cwd(), "content");

const categorySlugs = categories.map((c) => c.slug) as [string, ...string[]];
const regionSlugs = regions.map((r) => r.slug) as [string, ...string[]];

const provinceSchema = z.object({
  slug: z.string(),
  name: z.string(),
  nameEn: z.string(),
  region: z.enum(regionSlugs),
  summary: z.string(),
  image: z.string(),
  featured: z.boolean().default(false),
});

const placeSchema = z.object({
  slug: z.string(),
  name: z.string(),
  category: z.enum(categorySlugs),
  province: z.string(),
  summary: z.string(),
  image: z.string(),
  address: z.string().optional(),
  hours: z.string().optional(),
  priceRange: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  // Affiliate / "ติดแท๊กขาย": outbound partner link (Agoda, Booking, Shopee, ...)
  affiliate: z
    .object({ label: z.string(), url: z.string() })
    .optional(),
  // 0 = ปกติ, 1 = featured (ขึ้นบน), 2 = พาร์ทเนอร์จ่ายเงิน. เตรียมสำหรับเฟสขายพื้นที่
  sponsored: z.union([z.literal(0), z.literal(1), z.literal(2)]).default(0),
});

export type Province = z.infer<typeof provinceSchema> & { body: string };
export type Place = z.infer<typeof placeSchema> & { body: string };

function readCollection<T>(dir: string, schema: z.ZodType<T>): (T & { body: string })[] {
  const full = path.join(CONTENT_DIR, dir);
  if (!fs.existsSync(full)) {
    return [];
  }
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(full, file), "utf8");
      const { data, content } = matter(raw);
      const parsed = schema.safeParse(data);
      if (!parsed.success) {
        throw new Error(
          `Invalid frontmatter in ${dir}/${file}: ${parsed.error.message}`,
        );
      }
      return { ...(parsed.data as T), body: content.trim() };
    });
}

// Sort so paid/featured places float to the top, then alphabetically by name.
function bySponsorThenName(a: Place, b: Place) {
  if (a.sponsored !== b.sponsored) {
    return b.sponsored - a.sponsored;
  }
  return a.name.localeCompare(b.name, "th");
}

export function getAllProvinces(): Province[] {
  return readCollection("provinces", provinceSchema);
}

export function getProvince(slug: string): Province | undefined {
  return getAllProvinces().find((p) => p.slug === slug);
}

export function getProvincesByRegion(regionSlug: string): Province[] {
  return getAllProvinces().filter((p) => p.region === regionSlug);
}

export function getFeaturedProvinces(): Province[] {
  return getAllProvinces().filter((p) => p.featured);
}

export function getAllPlaces(): Place[] {
  return readCollection("places", placeSchema);
}

export function getPlace(slug: string): Place | undefined {
  return getAllPlaces().find((p) => p.slug === slug);
}

export function getPlacesByProvince(provinceSlug: string): Place[] {
  return getAllPlaces()
    .filter((p) => p.province === provinceSlug)
    .sort(bySponsorThenName);
}

export function getPlacesByProvinceCategory(
  provinceSlug: string,
  category: string,
): Place[] {
  return getPlacesByProvince(provinceSlug).filter(
    (p) => p.category === category,
  );
}
