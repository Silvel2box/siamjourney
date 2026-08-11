import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageBanner from "@/components/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import GuideForm from "@/components/GuideForm";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "แก้ไขบทความ (Admin)",
  robots: { index: false },
};

type Props = { params: Promise<{ id: string }> };

type Credit = { author?: string; source?: string; sourceUrl?: string; license?: string } | null;

export default async function EditGuidePage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const guideId = Number(id);
  if (!Number.isInteger(guideId)) notFound();

  const [guide, provinces] = await Promise.all([
    prisma.guide.findUnique({ where: { id: guideId } }),
    prisma.province.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!guide) notFound();

  const credit = guide.imageCredit as Credit;

  const values = {
    id: guide.id,
    slug: guide.slug,
    title: guide.title,
    summary: guide.summary,
    image: guide.image,
    imageCreditAuthor: credit?.author ?? "",
    imageCreditSource: credit?.source ?? "",
    imageCreditSourceUrl: credit?.sourceUrl ?? "",
    imageCreditLicense: credit?.license ?? "",
    provinces: (guide.provinces as string[] | null) ?? [],
    featured: guide.featured,
    body: guide.body,
  };

  return (
    <>
      <PageBanner title="แก้ไขบทความ" subtitle={guide.title} crumbs={[{ label: "Admin" }]} />
      <section className="py-16 bg-light">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <AdminNav />
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <GuideForm values={values} provinces={provinces} mode="edit" />
          </div>
        </div>
      </section>
    </>
  );
}
