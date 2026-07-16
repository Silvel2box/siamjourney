import type { Metadata } from "next";
import PageBanner from "@/components/PageBanner";
import { requireMerchant } from "@/lib/auth";
import { logout } from "@/app/actions/auth";

export const metadata: Metadata = {
  title: "แดชบอร์ดร้านค้า",
  robots: { index: false },
};

const STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: "รอตรวจสอบ", className: "bg-amber-100 text-amber-700" },
  approved: { label: "อนุมัติแล้ว", className: "bg-green-100 text-green-700" },
  suspended: { label: "ถูกระงับ", className: "bg-red-100 text-red-700" },
};

export default async function DashboardPage() {
  const merchant = await requireMerchant();
  const status = STATUS[merchant.status] ?? STATUS.pending;

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
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-heading font-bold">{merchant.shopName}</h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${status.className}`}
              >
                {status.label}
              </span>
            </div>

            <dl className="space-y-3 text-gray-700">
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 text-gray-500">อีเมล</dt>
                <dd>{merchant.email}</dd>
              </div>
            </dl>

            <p className="mt-6 rounded-xl bg-primary/10 border border-primary/20 p-4 text-sm text-gray-700">
              บัญชีร้านค้าพร้อมใช้งานแล้ว — ระบบจัดการข้อมูลร้าน แพ็กเกจโปรโมต และสถิติ จะเปิดให้ใช้ในเร็ว ๆ นี้
            </p>

            <form action={logout} className="mt-8">
              <button
                type="submit"
                className="px-6 py-3 border border-gray-300 rounded-full font-medium hover:bg-gray-100 transition"
              >
                ออกจากระบบ
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
