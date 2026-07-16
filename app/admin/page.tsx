import type { Metadata } from "next";
import PageBanner from "@/components/PageBanner";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateStatus } from "@/app/actions/admin";

export const metadata: Metadata = {
  title: "จัดการร้านค้า (Admin)",
  robots: { index: false },
};

const STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: "รอตรวจสอบ", className: "bg-amber-100 text-amber-700" },
  approved: { label: "อนุมัติแล้ว", className: "bg-green-100 text-green-700" },
  suspended: { label: "ถูกระงับ", className: "bg-red-100 text-red-700" },
};

// A single status-change button (posts merchantId + target status to the action).
function ActionButton({
  merchantId,
  status,
  label,
  className,
}: {
  merchantId: number;
  status: string;
  label: string;
  className: string;
}) {
  return (
    <form action={updateStatus}>
      <input type="hidden" name="merchantId" value={merchantId} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        className={`px-3 py-1 rounded-full text-xs font-medium transition ${className}`}
      >
        {label}
      </button>
    </form>
  );
}

export default async function AdminPage() {
  await requireAdmin();

  const merchants = await prisma.merchant.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      shopName: true,
      email: true,
      status: true,
      role: true,
      createdAt: true,
    },
  });

  const pendingCount = merchants.filter((m) => m.status === "pending").length;

  return (
    <>
      <PageBanner
        title="จัดการร้านค้า"
        subtitle={`ทั้งหมด ${merchants.length} ร้าน · รอตรวจสอบ ${pendingCount} ร้าน`}
        crumbs={[{ label: "Admin" }]}
      />
      <section className="py-16 bg-light">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {merchants.length === 0 ? (
              <p className="p-8 text-center text-gray-500">ยังไม่มีร้านค้าสมัคร</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-gray-500">
                      <th className="px-5 py-3 font-medium">ร้าน</th>
                      <th className="px-5 py-3 font-medium">สมัครเมื่อ</th>
                      <th className="px-5 py-3 font-medium">สถานะ</th>
                      <th className="px-5 py-3 font-medium">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {merchants.map((m) => {
                      const badge = STATUS[m.status] ?? STATUS.pending;
                      return (
                        <tr key={m.id} className="border-b border-gray-50 last:border-0">
                          <td className="px-5 py-4">
                            <div className="font-medium text-gray-800">
                              {m.shopName}
                              {m.role === "admin" && (
                                <span className="ml-2 text-xs text-primary">(admin)</span>
                              )}
                            </div>
                            <div className="text-gray-500">{m.email}</div>
                          </td>
                          <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                            {m.createdAt.toLocaleDateString("th-TH", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-2">
                              {m.status !== "approved" && (
                                <ActionButton
                                  merchantId={m.id}
                                  status="approved"
                                  label="อนุมัติ"
                                  className="bg-green-600 text-white hover:bg-green-700"
                                />
                              )}
                              {m.status !== "suspended" && (
                                <ActionButton
                                  merchantId={m.id}
                                  status="suspended"
                                  label="ระงับ"
                                  className="bg-red-600 text-white hover:bg-red-700"
                                />
                              )}
                              {m.status !== "pending" && (
                                <ActionButton
                                  merchantId={m.id}
                                  status="pending"
                                  label="คืนเป็นรอตรวจสอบ"
                                  className="border border-gray-300 text-gray-600 hover:bg-gray-100"
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
