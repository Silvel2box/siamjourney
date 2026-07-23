import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { marked } from "marked";
import { getAllPlaces, getPlace, getProvince } from "@/lib/content";
import { categoryBySlug } from "@/lib/categories";
import { regionBySlug } from "@/lib/regions";
import { site, pageOpenGraph } from "@/lib/site";
import PageBanner from "@/components/PageBanner";
import AffiliateButton from "@/components/AffiliateButton";
import AdSlot from "@/components/AdSlot";

// New places added via the admin render on-demand (ISR); no rebuild needed.
export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getAllPlaces()).map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

const schemaType: Record<string, string> = {
  attraction: "TouristAttraction",
  restaurant: "Restaurant",
  cafe: "CafeOrCoffeeShop",
  otop: "Product",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const place = await getPlace(slug);
  if (!place) return {};
  return {
    title: place.name,
    description: place.summary,
    alternates: { canonical: `/place/${place.slug}` },
    openGraph: pageOpenGraph(`/place/${place.slug}`, place.image),
  };
}

export default async function PlacePage({ params }: Props) {
  const { slug } = await params;
  const place = await getPlace(slug);
  if (!place) notFound();

  const province = await getProvince(place.province);
  const region = province ? regionBySlug(province.region) : undefined;
  const category = categoryBySlug(place.category);
  const bodyHtml = await marked.parse(place.body);

  const crumbs = [];
  if (region && province) {
    crumbs.push({ href: `/${region.slug}`, label: region.name });
    crumbs.push({ href: `/${region.slug}/${province.slug}`, label: province.name });
  }
  crumbs.push({ label: place.name });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": schemaType[place.category] ?? "LocalBusiness",
    name: place.name,
    description: place.summary,
    image: place.image,
    ...(place.address && { address: place.address }),
    ...(place.lat != null && place.lng != null && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: place.lat,
        longitude: place.lng,
      },
    }),
    url: `${site.url}/place/${place.slug}`,
  };

  // Map query: precise coords if provided, else the address, else the name.
  const mapQuery =
    place.lat != null && place.lng != null
      ? `${place.lat},${place.lng}`
      : place.address ?? place.name;
  const mapEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=14&output=embed`;
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageBanner
        title={place.name}
        subtitle={category?.name}
        image={place.image}
        credit={place.imageCredit}
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
              {place.affiliate && (
                <div className="mt-10">
                  <AffiliateButton
                    label={place.affiliate.label}
                    url={place.affiliate.url}
                    placeSlug={place.slug}
                  />
                </div>
              )}
            </div>

            {/* Info card */}
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-lg p-8 sticky top-28 space-y-4">
                <h2 className="font-heading font-bold text-xl text-dark mb-2">
                  ข้อมูลติดต่อ
                </h2>
                {place.address && (
                  <p className="flex items-start gap-3 text-gray-600">
                    <i className="fas fa-map-marker-alt mt-1 text-primary" />
                    <span>{place.address}</span>
                  </p>
                )}
                {place.hours && (
                  <p className="flex items-start gap-3 text-gray-600">
                    <i className="fas fa-clock mt-1 text-primary" />
                    <span>{place.hours}</span>
                  </p>
                )}
                {place.priceRange && (
                  <p className="flex items-start gap-3 text-gray-600">
                    <i className="fas fa-coins mt-1 text-primary" />
                    <span>{place.priceRange}</span>
                  </p>
                )}
                <div className="pt-2">
                  <div className="rounded-2xl overflow-hidden border border-gray-200">
                    <iframe
                      src={mapEmbed}
                      title={`แผนที่ ${place.name}`}
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
