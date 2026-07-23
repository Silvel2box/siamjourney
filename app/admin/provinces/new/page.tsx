import type { Metadata } from "next";
import PageBanner from "@/components/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import ProvinceForm from "@/components/ProvinceForm";
import { requireAdmin } from "@/lib/auth";
import { regions } from "@/lib/regions";

export const metadata: Metadata = {
  title: "เพิ่มจังหวัด (Admin)",
  robots: { index: false },
};

const empty = {
  slug: "",
  name: "",
  nameEn: "",
  region: "",
  summary: "",
  image: "",
  imageCreditAuthor: "",
  imageCreditSource: "",
  imageCreditSourceUrl: "",
  imageCreditLicense: "",
  featured: false,
  body: "",
};

export default async function NewProvincePage() {
  await requireAdmin();
  return (
    <>
      <PageBanner title="เพิ่มจังหวัด" crumbs={[{ label: "Admin" }]} />
      <section className="py-16 bg-light">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <AdminNav />
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <ProvinceForm
              values={empty}
              regions={regions.map((r) => ({ slug: r.slug, name: r.name }))}
              mode="create"
            />
          </div>
        </div>
      </section>
    </>
  );
}
