import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getAllProvinces,
  getProvince,
  getPlacesByProvinceCategory,
  getHotelsByProvince,
} from "@/lib/content";
import { regionBySlug } from "@/lib/regions";
import { categories } from "@/lib/categories";
import { site, pageOpenGraph } from "@/lib/site";
import PageBanner from "@/components/PageBanner";
import PlaceCard from "@/components/PlaceCard";
import HotelCard from "@/components/HotelCard";
import AdSlot from "@/components/AdSlot";

export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getAllProvinces()).map((p) => ({ region: p.region, province: p.slug }));
}

type Props = { params: Promise<{ region: string; province: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region, province: slug } = await params;
  const province = await getProvince(slug);
  if (!province || province.region !== region) return {};
  return {
    title: `เที่ยว${province.name}`,
    description: province.summary,
    alternates: { canonical: `/${province.region}/${province.slug}` },
    openGraph: pageOpenGraph(
      `/${province.region}/${province.slug}`,
      province.image,
    ),
  };
}

export default async function ProvincePage({ params }: Props) {
  const { region, province: slug } = await params;
  const province = await getProvince(slug);
  if (!province || province.region !== region) notFound();

  const regionInfo = regionBySlug(province.region);
  const [sectionsRaw, hotels] = await Promise.all([
    Promise.all(
      categories.map(async (c) => ({
        category: c,
        places: await getPlacesByProvinceCategory(slug, c.slug),
      })),
    ),
    getHotelsByProvince(slug),
  ]);
  const sections = sectionsRaw.filter((s) => s.places.length > 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: province.name,
    description: province.summary,
    image: province.image,
    url: `${site.url}/${province.region}/${province.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageBanner
        title={province.name}
        subtitle={province.summary}
        image={province.image}
        credit={province.imageCredit}
        crumbs={[
          { href: `/${province.region}`, label: regionInfo?.name ?? "ภูมิภาค" },
          { label: province.name },
        ]}
      />

      <div className="py-20 bg-light">
        <div className="container mx-auto px-6 md:px-12 space-y-20">
          {sections.length > 0 ? (
            sections.map(({ category, places }, i) => (
              <section key={category.slug} id={category.slug}>
                <div className="flex items-center justify-between gap-3 mb-8">
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl">
                      <i className={`fas fa-${category.icon}`} />
                    </span>
                    <h2 className="text-3xl font-heading font-bold text-dark">
                      {category.name}
                    </h2>
                  </div>
                  <Link
                    href={`/${province.region}/${province.slug}/${category.slug}`}
                    className="text-primary font-medium hover:underline whitespace-nowrap flex items-center gap-2"
                  >
                    ดูทั้งหมด <i className="fas fa-arrow-right text-sm" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {places.map((place) => (
                    <PlaceCard key={place.slug} place={place} />
                  ))}
                </div>
                {i === 0 && <AdSlot className="mt-12" />}
              </section>
            ))
          ) : (
            <p className="text-center text-gray-500 py-16">
              กำลังรวบรวมข้อมูลของจังหวัดนี้ เร็วๆ นี้
            </p>
          )}

          {hotels.length > 0 && (
            <section id="hotel">
              <div className="flex items-center justify-between gap-3 mb-8">
                <div className="flex items-center gap-3">
                  <span className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl">
                    <i className="fas fa-bed" />
                  </span>
                  <h2 className="text-3xl font-heading font-bold text-dark">ที่พัก</h2>
                </div>
                <Link
                  href="/hotel"
                  className="text-primary font-medium hover:underline whitespace-nowrap flex items-center gap-2"
                >
                  ดูที่พักทั้งหมด <i className="fas fa-arrow-right text-sm" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {hotels.map((hotel) => (
                  <HotelCard key={hotel.slug} hotel={hotel} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
