import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageBanner from "@/components/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import ShopForm from "@/components/ShopForm";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminUpdateShop } from "@/app/actions/admin";
import { getAllProvinces } from "@/lib/content";
import { categories } from "@/lib/categories";

export const metadata: Metadata = {
  title: "แก้ไขร้านค้า (Admin)",
  robots: { index: false },
};

type Props = { params: Promise<{ id: string }> };

const statusLabel: Record<string, string> = {
  pending: "รอตรวจสอบ",
  approved: "อนุมัติแล้ว",
  suspended: "ระงับ",
};

export default async function AdminEditMerchantPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const merchantId = Number(id);
  if (!Number.isInteger(merchantId)) notFound();

  const [merchant, provinces] = await Promise.all([
    prisma.merchant.findUnique({
      where: { id: merchantId },
      select: {
        id: true,
        email: true,
        shopName: true,
        status: true,
        role: true,
        description: true,
        province: true,
        category: true,
        address: true,
        phone: true,
        website: true,
        image: true,
      },
    }),
    getAllProvinces(),
  ]);
  if (!merchant) notFound();

  const values = {
    shopName: merchant.shopName ?? "",
    description: merchant.description ?? "",
    province: merchant.province ?? "",
    category: merchant.category ?? "",
    address: merchant.address ?? "",
    phone: merchant.phone ?? "",
    website: merchant.website ?? "",
    image: merchant.image ?? "",
  };

  return (
    <>
      <PageBanner title="แก้ไขร้านค้า" subtitle={merchant.shopName} crumbs={[{ label: "Admin" }]} />
      <section className="py-16 bg-light">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <AdminNav />

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6 flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div>
              <span className="text-gray-400">อีเมล (แก้ไม่ได้): </span>
              <span className="text-gray-700 font-medium">{merchant.email}</span>
            </div>
            <div>
              <span className="text-gray-400">สถานะ: </span>
              <span className="text-gray-700 font-medium">
                {statusLabel[merchant.status] ?? merchant.status}
              </span>
              <span className="text-gray-400"> (เปลี่ยนที่หน้ารายการร้านค้า)</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <ShopForm
              values={values}
              provinces={provinces.map((p) => ({ slug: p.slug, name: p.name }))}
              categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
              action={adminUpdateShop}
              merchantId={merchant.id}
            />
          </div>
        </div>
      </section>
    </>
  );
}
