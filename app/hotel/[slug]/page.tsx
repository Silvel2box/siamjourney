import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { marked } from "marked";
import { getAllHotels, getHotel, getProvince } from "@/lib/content";
import { regionBySlug } from "@/lib/regions";
import { site, pageOpenGraph } from "@/lib/site";
import PageBanner from "@/components/PageBanner";
import AffiliateButton from "@/components/AffiliateButton";
import AdSlot from "@/components/AdSlot";

// New hotels added via the admin render on-demand (ISR); no rebuild needed.
export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getAllHotels()).map((h) => ({ slug: h.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hotel = await getHotel(slug);
  if (!hotel) return {};
  return {
    title: hotel.name,
    description: hotel.summary,
    alternates: { canonical: `/hotel/${hotel.slug}` },
    openGraph: pageOpenGraph(`/hotel/${hotel.slug}`, hotel.image),
  };
}

export default async function HotelPage({ params }: Props) {
  const { slug } = await params;
  const hotel = await getHotel(slug);
  if (!hotel) notFound();

  const province = await getProvince(hotel.province);
  const region = province ? regionBySlug(province.region) : undefined;
  const bodyHtml = await marked.parse(hotel.body);

  const crumbs = [];
  if (region && province) {
    crumbs.push({ href: `/${region.slug}`, label: region.name });
    crumbs.push({ href: `/${region.slug}/${province.slug}`, label: province.name });
  }
  crumbs.push({ href: "/hotel", label: "ที่พัก" });
  crumbs.push({ label: hotel.name });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: hotel.name,
    description: hotel.summary,
    image: hotel.image,
    ...(hotel.address && { address: hotel.address }),
    ...(hotel.priceRange && { priceRange: hotel.priceRange }),
    ...(hotel.lat != null && hotel.lng != null && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: hotel.lat,
        longitude: hotel.lng,
      },
    }),
    url: `${site.url}/hotel/${hotel.slug}`,
  };

  // Map query: precise coords if provided, else the address, else the name.
  const mapQuery =
    hotel.lat != null && hotel.lng != null
      ? `${hotel.lat},${hotel.lng}`
      : hotel.address ?? hotel.name;
  const mapEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=14&output=embed`;
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageBanner
        title={hotel.name}
        subtitle={province ? `ที่พักใน${province.name}` : "ที่พัก"}
        image={hotel.image}
        credit={hotel.imageCredit}
        crumbs={crumbs}
      />

      <section className="py-16 bg-light">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Description */}
            <div className="lg:col-span-2">
              <div
                className="prose-body text-gray-700 text-lg"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
              {hotel.affiliate && (
                <div className="mt-10">
                  <AffiliateButton
                    label={hotel.affiliate.label}
                    url={hotel.affiliate.url}
                    placeSlug={hotel.slug}
                  />
                </div>
              )}
            </div>

            {/* Info card */}
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-lg p-8 sticky top-28 space-y-4">
                <h2 className="font-heading font-bold text-xl text-dark mb-2">
                  ข้อมูลที่พัก
                </h2>
                {hotel.address && (
                  <p className="flex items-start gap-3 text-gray-600">
                    <i className="fas fa-map-marker-alt mt-1 text-primary" />
                    <span>{hotel.address}</span>
                  </p>
                )}
                {hotel.priceRange && (
                  <p className="flex items-start gap-3 text-gray-600">
                    <i className="fas fa-coins mt-1 text-primary" />
                    <span>{hotel.priceRange} / คืน</span>
                  </p>
                )}
                {province && region && (
                  <p className="flex items-start gap-3 text-gray-600">
                    <i className="fas fa-location-dot mt-1 text-primary" />
                    <Link href={`/${region.slug}/${province.slug}`} className="hover:text-primary transition">
                      เที่ยว{province.name}
                    </Link>
                  </p>
                )}
                <div className="pt-2">
                  <div className="rounded-2xl overflow-hidden border border-gray-200">
                    <iframe
                      src={mapEmbed}
                      title={`แผนที่ ${hotel.name}`}
                      className="w-full h-56"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <a
                    href={mapLink}
                    target="_blank"
                    rel="noopener"
                    className="mt-3 inline-flex items-center gap-2 text-primary font-medium hover:underline"
                  >
                    <i className="fas fa-diamond-turn-right" /> เปิดใน Google Maps
                  </a>
                </div>

                <AdSlot className="mt-6" label="โฆษณา" />
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
