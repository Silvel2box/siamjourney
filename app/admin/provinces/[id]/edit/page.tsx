import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageBanner from "@/components/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import ProvinceForm from "@/components/ProvinceForm";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { regions } from "@/lib/regions";

export const metadata: Metadata = {
  title: "แก้ไขจังหวัด (Admin)",
  robots: { index: false },
};

type Props = { params: Promise<{ id: string }> };
type Credit = { author?: string; source?: string; sourceUrl?: string; license?: string } | null;

export default async function EditProvincePage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const provinceId = Number(id);
  if (!Number.isInteger(provinceId)) notFound();

  const province = await prisma.province.findUnique({ where: { id: provinceId } });
  if (!province) notFound();

  const credit = province.imageCredit as Credit;

  const values = {
    id: province.id,
    slug: province.slug,
    name: province.name,
    nameEn: province.nameEn,
    region: province.region,
    summary: province.summary,
    image: province.image,
    imageCreditAuthor: credit?.author ?? "",
    imageCreditSource: credit?.source ?? "",
    imageCreditSourceUrl: credit?.sourceUrl ?? "",
    imageCreditLicense: credit?.license ?? "",
    featured: province.featured,
    body: province.body,
  };

  return (
    <>
      <PageBanner title="แก้ไขจังหวัด" subtitle={province.name} crumbs={[{ label: "Admin" }]} />
      <section className="py-16 bg-light">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <AdminNav />
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <ProvinceForm
              values={values}
              regions={regions.map((r) => ({ slug: r.slug, name: r.name }))}
              mode="edit"
            />
          </div>
        </div>
      </section>
    </>
  );
}
