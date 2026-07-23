import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getProvince } from "@/lib/content";
import { categoryBySlug } from "@/lib/categories";
import { regionBySlug } from "@/lib/regions";
import { site, pageOpenGraph } from "@/lib/site";
import PageBanner from "@/components/PageBanner";

type Props = { params: Promise<{ id: string }> };

// Load an approved shop by numeric id. Returns null for bad ids or any shop that
// is not publicly visible (pending / suspended / missing) → the page 404s.
async function getApprovedShop(idParam: string) {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) return null;
  const shop = await prisma.merchant.findUnique({
    where: { id },
    select: {
      id: true,
      shopName: true,
      status: true,
      description: true,
      province: true,
      category: true,
      address: true,
      phone: true,
      website: true,
      image: true,
    },
  });
  if (!shop || shop.status !== "approved") return null;
  return shop;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const shop = await getApprovedShop(id);
  if (!shop) return {};
  return {
    title: shop.shopName,
    description: shop.description ?? undefined,
    alternates: { canonical: `/shop/${shop.id}` },
    openGraph: pageOpenGraph(`/shop/${shop.id}`, shop.image || site.ogImage),
  };
}

export default async function ShopPage({ params }: Props) {
  const { id } = await params;
  const shop = await getApprovedShop(id);
  if (!shop) notFound();

  const province = shop.province ? await getProvince(shop.province) : undefined;
  const region = province ? regionBySlug(province.region) : undefined;
  const category = shop.category ? categoryBySlug(shop.category) : undefined;

  const crumbs = [];
  if (region && province) {
    crumbs.push({ href: `/${region.slug}`, label: region.name });
    crumbs.push({ href: `/${region.slug}/${province.slug}`, label: province.name });
  }
  crumbs.push({ label: shop.shopName });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: shop.shopName,
    ...(shop.description && { description: shop.description }),
    ...(shop.image && { image: shop.image }),
    ...(shop.address && { address: shop.address }),
    ...(shop.phone && { telephone: shop.phone }),
    url: `${site.url}/shop/${shop.id}`,
  };

  const mapQuery = shop.address ?? `${province?.name ?? ""} ${shop.shopName}`.trim();
  const mapEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=14&output=embed`;
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageBanner title={shop.shopName} subtitle={category?.name} crumbs={crumbs} />

      <section className="py-16 bg-light">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {shop.image && (
                // Merchant-supplied URL from any host → plain <img> (next/image
                // remotePatterns only allows the content CDN).
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={shop.image}
                  alt={shop.shopName}
                  loading="lazy"
                  className="w-full rounded-3xl object-cover max-h-96 mb-8"
                />
              )}
              {shop.description ? (
                <p className="text-gray-700 text-lg whitespace-pre-line">
                  {shop.description}
                </p>
              ) : (
                <p className="text-gray-400">ร้านนี้ยังไม่ได้เพิ่มรายละเอียด</p>
              )}
            </div>

            <aside className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-lg p-8 sticky top-28 space-y-4">
                <h2 className="font-heading font-bold text-xl text-dark mb-2">
                  ข้อมูลติดต่อ
                </h2>
                {shop.address && (
                  <p className="flex items-start gap-3 text-gray-600">
                    <i className="fas fa-map-marker-alt mt-1 text-primary" />
                    <span>{shop.address}</span>
                  </p>
                )}
                {shop.phone && (
                  <p className="flex items-start gap-3 text-gray-600">
                    <i className="fas fa-phone mt-1 text-primary" />
                    <span>{shop.phone}</span>
                  </p>
                )}
                {shop.website && (
                  <p className="flex items-start gap-3 text-gray-600 break-all">
                    <i className="fas fa-globe mt-1 text-primary" />
                    <a
                      href={shop.website}
                      target="_blank"
                      rel="noopener nofollow"
                      className="text-primary hover:underline"
                    >
                      {shop.website}
                    </a>
                  </p>
                )}
                <div className="pt-2">
                  <div className="rounded-2xl overflow-hidden border border-gray-200">
                    <iframe
                      src={mapEmbed}
                      title={`แผนที่ ${shop.shopName}`}
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
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
