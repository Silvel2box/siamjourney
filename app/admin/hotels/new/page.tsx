import type { Metadata } from "next";
import PageBanner from "@/components/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import HotelForm from "@/components/HotelForm";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "เพิ่มที่พัก (Admin)",
  robots: { index: false },
};

const empty = {
  slug: "",
  name: "",
  province: "",
  summary: "",
  image: "",
  imageCreditAuthor: "",
  imageCreditSource: "",
  imageCreditSourceUrl: "",
  imageCreditLicense: "",
  gallery: [],
  address: "",
  priceRange: "",
  lat: "",
  lng: "",
  affiliateLabel: "",
  affiliateUrl: "",
  sponsored: "0",
  body: "",
};

export default async function NewHotelPage() {
  await requireAdmin();
  const provinces = await prisma.province.findMany({
    select: { slug: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <PageBanner title="เพิ่มที่พัก" crumbs={[{ label: "Admin" }]} />
      <section className="py-16 bg-light">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <AdminNav />
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <HotelForm values={empty} provinces={provinces} mode="create" />
          </div>
        </div>
      </section>
    </>
  );
}
