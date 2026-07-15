import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getAllProvinces,
  getProvince,
  getPlacesByProvinceCategory,
} from "@/lib/content";
import { categories, categoryBySlug } from "@/lib/categories";
import { regionBySlug } from "@/lib/regions";
import { site } from "@/lib/site";
import PageBanner from "@/components/PageBanner";
import PlaceCard from "@/components/PlaceCard";
import AdSlot from "@/components/AdSlot";

export const dynamicParams = false;

export function generateStaticParams() {
  const params: { region: string; province: string; category: string }[] = [];
  for (const province of getAllProvinces()) {
    for (const category of categories) {
      // Only build a page when the category actually has places (no thin pages).
      if (getPlacesByProvinceCategory(province.slug, category.slug).length > 0) {
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
  const province = getProvince(slug);
  const category = categoryBySlug(cat);
  if (!province || province.region !== region || !category) return {};
  return {
    title: `${category.name}ใน${province.name}`,
    description: `รวม${category.name}แนะนำใน${province.name} คัดสรรที่เที่ยวและของดีประจำถิ่นให้คุณ`,
    alternates: {
      canonical: `/${province.region}/${province.slug}/${category.slug}`,
    },
    openGraph: { images: [province.image] },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { region, province: slug, category: cat } = await params;
  const province = getProvince(slug);
  const category = categoryBySlug(cat);
  if (!province || province.region !== region || !category) notFound();

  const places = getPlacesByProvinceCategory(slug, cat);
  if (places.length === 0) notFound();

  const regionInfo = regionBySlug(province.region);

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageBanner
        title={`${category.name}ใน${province.name}`}
        subtitle={`${category.name}แนะนำ ${places.length} แห่งใน${province.name}`}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {places.map((place) => (
              <PlaceCard key={place.slug} place={place} />
            ))}
          </div>

          <AdSlot className="mt-12" />
        </div>
      </section>
    </>
  );
}
