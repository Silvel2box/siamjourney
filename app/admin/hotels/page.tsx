import type { Metadata } from "next";
import Link from "next/link";
import PageBanner from "@/components/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import DeleteButton from "@/components/admin/DeleteButton";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteHotel } from "@/app/actions/content";

export const metadata: Metadata = {
  title: "จัดการที่พัก (Admin)",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ province?: string }> };

export default async function AdminHotelsPage({ searchParams }: Props) {
  await requireAdmin();
  const { province } = await searchParams;

  const [provinces, hotels] = await Promise.all([
    prisma.province.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } }),
    prisma.hotel.findMany({
      where: province ? { province } : undefined,
      orderBy: [{ province: "asc" }, { name: "asc" }],
      select: { id: true, slug: true, name: true, province: true, priceRange: true, sponsored: true },
    }),
  ]);
  const provName = Object.fromEntries(provinces.map((p) => [p.slug, p.name]));

  return (
    <>
      <PageBanner title="จัดการที่พัก" subtitle={`ทั้งหมด ${hotels.length} แห่ง`} crumbs={[{ label: "Admin" }]} />
      <section className="py-16 bg-light">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <AdminNav />

          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <form className="flex gap-2">
              <select
                name="province"
                defaultValue={province ?? ""}
                className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-primary"
              >
                <option value="">ทุกจังหวัด</option>
                {provinces.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
              <button className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:border-primary transition">
                กรอง
              </button>
            </form>
            <Link
              href="/admin/hotels/new"
              className="px-5 py-2 rounded-full bg-primary text-white font-medium hover:bg-yellow-600 transition"
            >
              + เพิ่มที่พัก
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="px-5 py-3 font-medium">ที่พัก</th>
                  <th className="px-5 py-3 font-medium">จังหวัด</th>
                  <th className="px-5 py-3 font-medium">ราคา</th>
                  <th className="px-5 py-3 font-medium">สถานะ</th>
                  <th className="px-5 py-3 font-medium">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {hotels.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      ไม่มีที่พัก
                    </td>
                  </tr>
                ) : (
                  hotels.map((h) => (
                    <tr key={h.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-800">{h.name}</div>
                        <div className="text-gray-400 text-xs">{h.slug}</div>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{provName[h.province] ?? h.province}</td>
                      <td className="px-5 py-4 text-gray-600">{h.priceRange ?? "-"}</td>
                      <td className="px-5 py-4 text-gray-600">
                        {h.sponsored === 2 ? "พาร์ทเนอร์" : h.sponsored === 1 ? "แนะนำ" : "-"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/admin/hotels/${h.id}/edit`}
                            className="px-3 py-1 rounded-full text-xs font-medium border border-gray-300 text-gray-600 hover:border-primary hover:text-primary transition"
                          >
                            แก้ไข
                          </Link>
                          <DeleteButton action={deleteHotel} id={h.id} name={h.name} />
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
