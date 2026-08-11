import type { Metadata } from "next";
import Link from "next/link";
import PageBanner from "@/components/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import DeleteButton from "@/components/admin/DeleteButton";
import AdminSearchBar from "@/components/admin/AdminSearchBar";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteGuide } from "@/app/actions/content";

export const metadata: Metadata = {
  title: "จัดการบทความ (Admin)",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ q?: string; featured?: string }> };

export default async function AdminGuidesPage({ searchParams }: Props) {
  await requireAdmin();
  const { q, featured } = await searchParams;

  const where = {
    ...(featured ? { featured: featured === "1" } : {}),
    ...(q ? { OR: [{ title: { contains: q } }, { slug: { contains: q } }] } : {}),
  };

  const [provinces, guides] = await Promise.all([
    prisma.province.findMany({ select: { slug: true, name: true } }),
    prisma.guide.findMany({
      where,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }, { id: "desc" }],
      select: { id: true, slug: true, title: true, featured: true, provinces: true },
    }),
  ]);
  const provName = Object.fromEntries(provinces.map((p) => [p.slug, p.name]));

  return (
    <>
      <PageBanner
        title="จัดการบทความ"
        subtitle={`ทั้งหมด ${guides.length} บท`}
        crumbs={[{ label: "Admin" }]}
      />
      <section className="py-16 bg-light">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <AdminNav />

          <div className="flex justify-end mb-4">
            <Link
              href="/admin/guides/new"
              className="px-5 py-2 rounded-full bg-primary text-white font-medium hover:bg-primary-dark transition"
            >
              + เพิ่มบทความ
            </Link>
          </div>

          <AdminSearchBar
            placeholder="ค้นหาหัวข้อ หรือ slug…"
            filters={[
              {
                key: "featured",
                label: "ทุกบทความ",
                options: [
                  { value: "1", label: "แนะนำ" },
                  { value: "0", label: "ปกติ" },
                ],
              },
            ]}
          />

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="px-5 py-3 font-medium">บทความ</th>
                  <th className="px-5 py-3 font-medium">จังหวัดที่พูดถึง</th>
                  <th className="px-5 py-3 font-medium">สถานะ</th>
                  <th className="px-5 py-3 font-medium">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {guides.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      ไม่มีบทความ
                    </td>
                  </tr>
                ) : (
                  guides.map((g) => {
                    const slugs = (g.provinces as string[] | null) ?? [];
                    return (
                      <tr key={g.id} className="border-b border-gray-50 last:border-0">
                        <td className="px-5 py-4">
                          <div className="font-medium text-gray-800">{g.title}</div>
                          <div className="text-gray-400 text-xs">{g.slug}</div>
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          {slugs.length === 0
                            ? "-"
                            : slugs.length > 3
                              ? `${slugs.length} จังหวัด`
                              : slugs.map((s) => provName[s] ?? s).join(", ")}
                        </td>
                        <td className="px-5 py-4 text-gray-600">{g.featured ? "แนะนำ" : "-"}</td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={`/admin/guides/${g.id}/edit`}
                              className="px-3 py-1 rounded-full text-xs font-medium border border-gray-300 text-gray-600 hover:border-primary hover:text-primary transition"
                            >
                              แก้ไข
                            </Link>
                            <DeleteButton action={deleteGuide} id={g.id} name={g.title} />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
