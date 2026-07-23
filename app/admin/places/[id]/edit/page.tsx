import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageBanner from "@/components/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import PlaceForm from "@/components/PlaceForm";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { categories } from "@/lib/categories";

export const metadata: Metadata = {
  title: "แก้ไขสถานที่ (Admin)",
  robots: { index: false },
};

type Props = { params: Promise<{ id: string }> };

type Credit = { author?: string; source?: string; sourceUrl?: string; license?: string } | null;
type Aff = { label?: string; url?: string } | null;

export default async function EditPlacePage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const placeId = Number(id);
  if (!Number.isInteger(placeId)) notFound();

  const [place, provinces] = await Promise.all([
    prisma.place.findUnique({ where: { id: placeId } }),
    prisma.province.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!place) notFound();

  const credit = place.imageCredit as Credit;
  const aff = place.affiliate as Aff;

  const values = {
    id: place.id,
    slug: place.slug,
    name: place.name,
    category: place.category,
    province: place.province,
    summary: place.summary,
    image: place.image,
    imageCreditAuthor: credit?.author ?? "",
    imageCreditSource: credit?.source ?? "",
    imageCreditSourceUrl: credit?.sourceUrl ?? "",
    imageCreditLicense: credit?.license ?? "",
    address: place.address ?? "",
    hours: place.hours ?? "",
    priceRange: place.priceRange ?? "",
    lat: place.lat != null ? String(place.lat) : "",
    lng: place.lng != null ? String(place.lng) : "",
    affiliateLabel: aff?.label ?? "",
    affiliateUrl: aff?.url ?? "",
    sponsored: String(place.sponsored),
    body: place.body,
  };

  return (
    <>
      <PageBanner title="แก้ไขสถานที่" subtitle={place.name} crumbs={[{ label: "Admin" }]} />
      <section className="py-16 bg-light">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <AdminNav />
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <PlaceForm
              values={values}
              provinces={provinces}
              categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
              mode="edit"
            />
          </div>
        </div>
      </section>
    </>
  );
}
