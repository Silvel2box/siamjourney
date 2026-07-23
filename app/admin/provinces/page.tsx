import type { Metadata } from "next";
import Link from "next/link";
import PageBanner from "@/components/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import DeleteButton from "@/components/admin/DeleteButton";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteProvince } from "@/app/actions/content";
import { regionBySlug } from "@/lib/regions";

export const metadata: Metadata = {
  title: "จัดการจังหวัด (Admin)",
  robots: { index: false },
};

export default async function AdminProvincesPage() {
  await requireAdmin();

  const [provinces, grouped] = await Promise.all([
    prisma.province.findMany({
      orderBy: [{ region: "asc" }, { name: "asc" }],
      select: { id: true, slug: true, name: true, nameEn: true, region: true, featured: true },
    }),
    prisma.place.groupBy({ by: ["province"], _count: { _all: true } }),
  ]);
  const placeCount = Object.fromEntries(grouped.map((g) => [g.province, g._count._all]));

  return (
    <>
      <PageBanner title="จัดการจังหวัด" subtitle={`ทั้งหมด ${provinces.length} จังหวัด`} crumbs={[{ label: "Admin" }]} />
      <section className="py-16 bg-light">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <AdminNav />

          <div className="flex justify-end mb-6">
            <Link
              href="/admin/provinces/new"
              className="px-5 py-2 rounded-full bg-primary text-white font-medium hover:bg-yellow-600 transition"
            >
              + เพิ่มจังหวัด
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="px-5 py-3 font-medium">จังหวัด</th>
                  <th className="px-5 py-3 font-medium">ภูมิภาค</th>
                  <th className="px-5 py-3 font-medium">สถานที่</th>
                  <th className="px-5 py-3 font-medium">หน้าแรก</th>
                  <th className="px-5 py-3 font-medium">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {provinces.map((p) => {
                  const count = placeCount[p.slug] ?? 0;
                  return (
                    <tr key={p.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-800">{p.name}</div>
                        <div className="text-gray-400 text-xs">{p.nameEn} · {p.slug}</div>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{regionBySlug(p.region)?.name ?? p.region}</td>
                      <td className="px-5 py-4 text-gray-600">{count}</td>
                      <td className="px-5 py-4">
                        {p.featured && <span className="text-primary text-xs font-medium">★ ปักหมุด</span>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/admin/provinces/${p.id}/edit`}
                            className="px-3 py-1 rounded-full text-xs font-medium border border-gray-300 text-gray-600 hover:border-primary hover:text-primary transition"
                          >
                            แก้ไข
                          </Link>
                          <DeleteButton
                            action={deleteProvince}
                            id={p.id}
                            name={p.name}
                            disabledReason={count > 0 ? `มี ${count} สถานที่ในจังหวัดนี้ ลบไม่ได้` : undefined}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
