import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { marked } from "marked";
import {
  getAllProvinces,
  getProvince,
  getPlacesByProvinceCategory,
  getHotelsByProvince,
  getGuidesByProvince,
} from "@/lib/content";
import { regionBySlug } from "@/lib/regions";
import { categories } from "@/lib/categories";
import { site, pageOpenGraph } from "@/lib/site";
import PageBanner from "@/components/PageBanner";
import PlaceCard from "@/components/PlaceCard";
import HotelCard from "@/components/HotelCard";
import GuideCard from "@/components/GuideCard";
import AdSlot from "@/components/AdSlot";
import AffiliateButton from "@/components/AffiliateButton";

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
  const [sectionsRaw, hotels, guides] = await Promise.all([
    Promise.all(
      categories.map(async (c) => ({
        category: c,
        places: await getPlacesByProvinceCategory(slug, c.slug),
      })),
    ),
    getHotelsByProvince(slug),
    getGuidesByProvince(slug),
  ]);
  const sections = sectionsRaw.filter((s) => s.places.length > 0);
  const bodyHtml = province.body ? await marked.parse(province.body) : "";

  // "รู้ก่อนไป" — only the fields that have been written up for this province.
  const tips = [
    { icon: "calendar-days", label: "ช่วงเวลาที่ควรไป", text: province.bestTime },
    { icon: "route", label: "การเดินทาง", text: province.gettingThere },
    { icon: "bowl-food", label: "ของกินขึ้นชื่อ", text: province.localFood },
  ].filter((t) => t.text);

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
          {province.body && (
            <section className="max-w-3xl">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-dark mb-4">
                เกี่ยวกับ{province.name}
              </h2>
              <div
                className="prose-body text-gray-700 text-lg"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            </section>
          )}

          {province.highlights && province.highlights.length > 0 && (
            <section id="highlights">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-dark mb-8">
                ไฮไลต์ของ{province.name}
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {province.highlights.map((h) => (
                  <li
                    key={h}
                    className="bg-white rounded-2xl p-6 shadow-sm flex items-start gap-4"
                  >
                    <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <i className="fas fa-star" />
                    </span>
                    <span className="text-gray-700 leading-relaxed">{h}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {tips.length > 0 && (
            <section id="tips">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-dark mb-8">
                รู้ก่อนไป{province.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tips.map((t) => (
                  <div key={t.icon} className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <i className={`fas fa-${t.icon}`} />
                      </span>
                      <h3 className="font-heading font-bold text-dark">{t.label}</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{t.text}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Editorial before commercial: a reader who wants to plan a trip
              gets the guides first, the partner tours after. */}
          {guides.length > 0 && (
            <section id="guides">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-dark">
                  บทความเกี่ยวกับ{province.name}
                </h2>
                <Link
                  href="/guide"
                  className="text-primary font-medium hover:underline whitespace-nowrap flex items-center gap-2"
                >
                  บทความทั้งหมด <i className="fas fa-arrow-right text-sm" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {guides.map((g) => (
                  <GuideCard key={g.slug} guide={g} />
                ))}
              </div>
            </section>
          )}

          {province.tours && province.tours.length > 0 && (
            <section id="tours">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-dark mb-2">
                ทัวร์และกิจกรรมใน{province.name}
              </h2>
              <p className="text-gray-500 mb-8">
                จองผ่านพาร์ทเนอร์ของเรา — เราอาจได้ค่าตอบแทนเมื่อคุณจอง โดยคุณจ่ายเท่าเดิม
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {province.tours.map((t) => (
                  <AffiliateButton
                    key={t.url}
                    label={t.label}
                    url={t.url}
                    image={t.image}
                    placeSlug={province.slug}
                  />
                ))}
              </div>
            </section>
          )}

          {sections.length > 0 ? (
            sections.map(({ category, places }, i) => (
              <section key={category.slug} id={category.slug}>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl">
                      <i className={`fas fa-${category.icon}`} />
                    </span>
                    <h2 className="text-2xl md:text-3xl font-heading font-bold text-dark">
                      {category.name}
                    </h2>
                  </div>
                  {/* Everything in this category is already on screen when
                      there is only one of it — the link would lead to the
                      same card again. */}
                  {places.length > 1 && (
                    <Link
                      href={`/${province.region}/${province.slug}/${category.slug}`}
                      className="text-primary font-medium hover:underline whitespace-nowrap flex items-center gap-2"
                    >
                      ดูทั้งหมด <i className="fas fa-arrow-right text-sm" />
                    </Link>
                  )}
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
              <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
                <div className="flex items-center gap-3">
                  <span className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl">
                    <i className="fas fa-bed" />
                  </span>
                  <h2 className="text-2xl md:text-3xl font-heading font-bold text-dark">
                    ที่พัก
                  </h2>
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
