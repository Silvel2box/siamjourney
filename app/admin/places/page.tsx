import type { Metadata } from "next";
import Link from "next/link";
import PageBanner from "@/components/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import DeleteButton from "@/components/admin/DeleteButton";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminSearchBar from "@/components/admin/AdminSearchBar";
import { deletePlace } from "@/app/actions/content";
import { categories, categoryBySlug } from "@/lib/categories";

export const metadata: Metadata = {
  title: "จัดการสถานที่ (Admin)",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ province?: string; cat?: string; q?: string }> };

export default async function AdminPlacesPage({ searchParams }: Props) {
  await requireAdmin();
  const { province, cat, q } = await searchParams;

  const where = {
    ...(province ? { province } : {}),
    ...(cat ? { category: cat } : {}),
    ...(q ? { OR: [{ name: { contains: q } }, { slug: { contains: q } }] } : {}),
  };

  const [provinces, places] = await Promise.all([
    prisma.province.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } }),
    prisma.place.findMany({
      where,
      orderBy: [{ province: "asc" }, { name: "asc" }],
      select: { id: true, slug: true, name: true, province: true, category: true, sponsored: true },
    }),
  ]);
  const provName = Object.fromEntries(provinces.map((p) => [p.slug, p.name]));

  return (
    <>
      <PageBanner title="จัดการสถานที่" subtitle={`ทั้งหมด ${places.length} แห่ง`} crumbs={[{ label: "Admin" }]} />
      <section className="py-16 bg-light">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <AdminNav />

          <div className="flex justify-end mb-4">
            <Link
              href="/admin/places/new"
              className="px-5 py-2 rounded-full bg-primary text-white font-medium hover:bg-yellow-600 transition"
            >
              + เพิ่มสถานที่
            </Link>
          </div>

          <AdminSearchBar
            placeholder="ค้นหาชื่อสถานที่ หรือ slug…"
            filters={[
              {
                key: "province",
                label: "ทุกจังหวัด",
                options: provinces.map((p) => ({ value: p.slug, label: p.name })),
              },
              {
                key: "cat",
                label: "ทุกหมวด",
                options: categories.map((c) => ({ value: c.slug, label: c.name })),
              },
            ]}
          />

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="px-5 py-3 font-medium">สถานที่</th>
                  <th className="px-5 py-3 font-medium">จังหวัด</th>
                  <th className="px-5 py-3 font-medium">หมวด</th>
                  <th className="px-5 py-3 font-medium">สถานะ</th>
                  <th className="px-5 py-3 font-medium">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {places.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      ไม่มีสถานที่
                    </td>
                  </tr>
                ) : (
                  places.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-800">{p.name}</div>
                        <div className="text-gray-400 text-xs">{p.slug}</div>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{provName[p.province] ?? p.province}</td>
                      <td className="px-5 py-4 text-gray-600">
                        {categoryBySlug(p.category)?.name ?? p.category}
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {p.sponsored === 2 ? "พาร์ทเนอร์" : p.sponsored === 1 ? "แนะนำ" : "-"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/admin/places/${p.id}/edit`}
                            className="px-3 py-1 rounded-full text-xs font-medium border border-gray-300 text-gray-600 hover:border-primary hover:text-primary transition"
                          >
                            แก้ไข
                          </Link>
                          <DeleteButton action={deletePlace} id={p.id} name={p.name} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
