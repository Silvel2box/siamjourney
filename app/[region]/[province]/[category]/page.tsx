import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getAllProvinces,
  getProvince,
  getPlacesByProvince,
  getPlacesByProvinceCategory,
} from "@/lib/content";
import { categories, categoryBySlug } from "@/lib/categories";
import { regionBySlug } from "@/lib/regions";
import { site, pageOpenGraph } from "@/lib/site";
import PageBanner from "@/components/PageBanner";
import PlaceCard from "@/components/PlaceCard";
import AdSlot from "@/components/AdSlot";
import { jsonLdHtml } from "@/lib/jsonld";

export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
  const params: { region: string; province: string; category: string }[] = [];
  for (const province of await getAllProvinces()) {
    for (const category of categories) {
      // Only build a page when the category actually has places (no thin pages).
      if ((await getPlacesByProvinceCategory(province.slug, category.slug)).length > 0) {
        params.push({
          region: province.region,
          province: province.slug,
          category: category.slug,
        });
      }
    }
  }
  return params;
}

type Props = {
  params: Promise<{ region: string; province: string; category: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region, province: slug, category: cat } = await params;
  const province = await getProvince(slug);
  const category = categoryBySlug(cat);
  if (!province || province.region !== region || !category) return {};
  return {
    title: `${category.name}ใน${province.name}`,
    description: `รวม${category.name}แนะนำใน${province.name} คัดสรรที่เที่ยวและของดีประจำถิ่นให้คุณ`,
    // Filtered view of the province page — every card here already appears
    // there, and the page adds no prose of its own. Useful to click through,
    // not worth an index entry. `follow` keeps the crawl path to the places.
    robots: { index: false, follow: true },
    alternates: {
      canonical: `/${province.region}/${province.slug}/${category.slug}`,
    },
    openGraph: pageOpenGraph(
      `/${province.region}/${province.slug}/${category.slug}`,
      province.image,
    ),
  };
}

export default async function CategoryPage({ params }: Props) {
  const { region, province: slug, category: cat } = await params;
  const province = await getProvince(slug);
  const category = categoryBySlug(cat);
  if (!province || province.region !== region || !category) notFound();

  const places = await getPlacesByProvinceCategory(slug, cat);
  if (places.length === 0) notFound();

  const regionInfo = regionBySlug(province.region);

  // Top place of every OTHER category in this province — one card each, so the
  // block stays balanced no matter how many places a single category grows to.
  const siblings = await getPlacesByProvince(slug);
  const others = categories
    .filter((c) => c.slug !== category.slug)
    .map((c) => siblings.find((p) => p.category === c.slug))
    .filter((p) => p !== undefined);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${category.name}ใน${province.name}`,
    itemListElement: places.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name,
      url: `${site.url}/place/${p.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }}
      />

      <PageBanner
        title={`${category.name}ใน${province.name}`}
        subtitle={
          places.length > 1
            ? `${category.name}แนะนำ ${places.length} แห่งใน${province.name}`
            : `${category.name}แนะนำใน${province.name}`
        }
        image={province.image}
        crumbs={[
          { href: `/${province.region}`, label: regionInfo?.name ?? "ภูมิภาค" },
          { href: `/${province.region}/${province.slug}`, label: province.name },
          { label: category.name },
        ]}
      />

      <section className="py-20 bg-light">
        <div className="container mx-auto px-6 md:px-12">
          {/* Sibling categories to jump between */}
          <div className="flex flex-wrap gap-3 mb-12">
            {categories.map((c) => {
              const active = c.slug === category.slug;
              return (
                <Link
                  key={c.slug}
                  href={`/${province.region}/${province.slug}/${c.slug}`}
                  className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border transition ${
                    active
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
                  }`}
                >
                  <i className={`fas fa-${c.icon}`} />
                  {c.name}
                </Link>
              );
            })}
          </div>

          {/* A lone card in a 3-col grid reads as an empty page; widen it instead. */}
          <div
            className={`grid gap-8 ${
              places.length === 1
                ? "max-w-2xl"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {places.map((place) => (
              <PlaceCard key={place.slug} place={place} />
            ))}
          </div>

          {others.length > 0 && (
            <div className="mt-20">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-dark mb-8">
                หมวดอื่นใน{province.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {others.map((p) => (
                  <PlaceCard key={p.slug} place={p} />
                ))}
              </div>
            </div>
          )}

          <AdSlot className="mt-12" />
        </div>
      </section>
    </>
  );
}
