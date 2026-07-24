import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageBanner from "@/components/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import HotelForm from "@/components/HotelForm";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "แก้ไขที่พัก (Admin)",
  robots: { index: false },
};

type Props = { params: Promise<{ id: string }> };

type Credit = { author?: string; source?: string; sourceUrl?: string; license?: string } | null;
type Aff = { label?: string; url?: string } | null;
type Gallery = { url: string; caption?: string }[] | null;

export default async function EditHotelPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const hotelId = Number(id);
  if (!Number.isInteger(hotelId)) notFound();

  const [hotel, provinces] = await Promise.all([
    prisma.hotel.findUnique({ where: { id: hotelId } }),
    prisma.province.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!hotel) notFound();

  const credit = hotel.imageCredit as Credit;
  const aff = hotel.affiliate as Aff;
  const gallery = (hotel.gallery as Gallery) ?? [];

  const values = {
    id: hotel.id,
    slug: hotel.slug,
    name: hotel.name,
    province: hotel.province,
    summary: hotel.summary,
    image: hotel.image,
    imageCreditAuthor: credit?.author ?? "",
    imageCreditSource: credit?.source ?? "",
    imageCreditSourceUrl: credit?.sourceUrl ?? "",
    imageCreditLicense: credit?.license ?? "",
    gallery,
    address: hotel.address ?? "",
    priceRange: hotel.priceRange ?? "",
    lat: hotel.lat != null ? String(hotel.lat) : "",
    lng: hotel.lng != null ? String(hotel.lng) : "",
    affiliateLabel: aff?.label ?? "",
    affiliateUrl: aff?.url ?? "",
    sponsored: String(hotel.sponsored),
    body: hotel.body,
  };

  return (
    <>
      <PageBanner title="แก้ไขที่พัก" subtitle={hotel.name} crumbs={[{ label: "Admin" }]} />
      <section className="py-16 bg-light">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <AdminNav />
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <HotelForm values={values} provinces={provinces} mode="edit" />
          </div>
        </div>
      </section>
    </>
  );
}
