import type { Metadata } from "next";
import PageBanner from "@/components/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import PlaceForm from "@/components/PlaceForm";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { categories } from "@/lib/categories";

export const metadata: Metadata = {
  title: "เพิ่มสถานที่ (Admin)",
  robots: { index: false },
};

const empty = {
  slug: "",
  name: "",
  category: "",
  province: "",
  summary: "",
  image: "",
  imageCreditAuthor: "",
  imageCreditSource: "",
  imageCreditSourceUrl: "",
  imageCreditLicense: "",
  address: "",
  hours: "",
  priceRange: "",
  lat: "",
  lng: "",
  affiliateLabel: "",
  affiliateUrl: "",
  sponsored: "0",
  body: "",
};

export default async function NewPlacePage() {
  await requireAdmin();
  const provinces = await prisma.province.findMany({
    select: { slug: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <PageBanner title="เพิ่มสถานที่" crumbs={[{ label: "Admin" }]} />
      <section className="py-16 bg-light">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <AdminNav />
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <PlaceForm
              values={empty}
              provinces={provinces}
              categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
              mode="create"
            />
          </div>
        </div>
      </section>
    </>
  );
}
