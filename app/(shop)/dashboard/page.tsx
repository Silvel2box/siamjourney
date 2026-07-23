import type { Metadata } from "next";
import Link from "next/link";
import PageBanner from "@/components/PageBanner";
import ShopForm from "@/components/ShopForm";
import { requireMerchant } from "@/lib/auth";
import { logout } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import { getAllProvinces } from "@/lib/content";
import { categories } from "@/lib/categories";

export const metadata: Metadata = {
  title: "แดชบอร์ดร้านค้า",
  robots: { index: false },
};

const STATUS: Record<string, { label: string; className: string; note: string }> = {
  pending: {
    label: "รอตรวจสอบ",
    className: "bg-amber-100 text-amber-700",
    note: "ร้านของคุณกำลังรอทีมงานตรวจสอบ — ยังไม่แสดงบนเว็บจนกว่าจะอนุมัติ",
  },
  approved: {
    label: "อนุมัติแล้ว",
    className: "bg-green-100 text-green-700",
    note: "ร้านของคุณเผยแพร่บนเว็บแล้ว",
  },
  suspended: {
    label: "ถูกระงับ",
    className: "bg-red-100 text-red-700",
    note: "ร้านของคุณถูกระงับการแสดงผล กรุณาติดต่อทีมงาน",
  },
};

export default async function DashboardPage() {
  const merchant = await requireMerchant();
  const status = STATUS[merchant.status] ?? STATUS.pending;

  const shop = await prisma.merchant.findUnique({
    where: { id: merchant.id },
    select: {
      shopName: true,
      description: true,
      province: true,
      category: true,
      address: true,
      phone: true,
      website: true,
      image: true,
    },
  });

  const provinces = (await getAllProvinces())
    .map((p) => ({ slug: p.slug, name: p.name }))
    .sort((a, b) => a.name.localeCompare(b.name, "th"));

  const values = {
    shopName: shop?.shopName ?? merchant.shopName,
    description: shop?.description ?? "",
    province: shop?.province ?? "",
    category: shop?.category ?? "",
    address: shop?.address ?? "",
    phone: shop?.phone ?? "",
    website: shop?.website ?? "",
    image: shop?.image ?? "",
  };

  return (
    <>
      <PageBanner
        title="แดชบอร์ดร้านค้า"
        subtitle={`ยินดีต้อนรับ ${merchant.shopName}`}
        crumbs={[{ label: "แดชบอร์ด" }]}
      />
      <section className="py-16 bg-light">
        <div className="container mx-auto px-6 md:px-12 max-w-2xl">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between gap-4 mb-2">
              <h2 className="text-2xl font-heading font-bold">{merchant.shopName}</h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${status.className}`}
              >
                {status.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-2">{merchant.email}</p>
            <p className="rounded-xl bg-primary/10 border border-primary/20 p-4 text-sm text-gray-700">
              {status.note}
              {merchant.status === "approved" && (
                <>
                  {" "}
                  <Link href={`/shop/${merchant.id}`} className="text-primary font-medium hover:underline">
                    ดูหน้าร้าน
                  </Link>
                </>
              )}
            </p>

            <div className="mt-8">
              <ShopForm
                values={values}
                provinces={provinces}
                categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
              />
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-3">
              {merchant.role === "admin" && (
                <Link
                  href="/admin"
                  className="px-6 py-3 bg-dark text-white rounded-full font-medium hover:bg-primary transition"
                >
                  จัดการร้านค้า (Admin)
                </Link>
              )}
              <form action={logout}>
                <button
                  type="submit"
                  className="px-6 py-3 border border-gray-300 rounded-full font-medium hover:bg-gray-100 transition"
                >
                  ออกจากระบบ
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
