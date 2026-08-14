import { cache } from "react";
import { prisma } from "@/lib/prisma";

// Reading the clock counts as impure inside a component body, so the window and
// the queries that depend on it live here instead.
const clicksInLastDays = cache(async (days: number) => {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const where = { createdAt: { gte: since } };

  return Promise.all([
    prisma.affiliateClick.count({ where }),
    prisma.affiliateClick.groupBy({
      by: ["network"],
      where,
      _count: { _all: true },
      orderBy: { _count: { network: "desc" } },
    }),
    prisma.affiliateClick.groupBy({
      by: ["source"],
      where,
      _count: { _all: true },
      orderBy: { _count: { source: "desc" } },
      take: 8,
    }),
  ]);
});

// Partner-link clicks from the last 30 days, as recorded by app/go. Small on
// purpose: a table nobody can read is a table nobody trusts, but the real
// reporting job (revenue, conversion) belongs to each network's own dashboard.
export default async function ClickSummary() {
  const [total, byNetwork, bySource] = await clicksInLastDays(30);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-baseline justify-between gap-4 mb-4">
        <h2 className="font-heading font-bold text-dark">คลิกลิงก์พาร์ทเนอร์</h2>
        <span className="text-sm text-gray-500">30 วันล่าสุด · {total} คลิก</span>
      </div>

      {total === 0 ? (
        <p className="text-sm text-gray-500">
          ยังไม่มีคลิกในช่วงนี้ — ตัวเลขจะเริ่มนับเมื่อมีคนกดปุ่มพาร์ทเนอร์บนหน้าเว็บ
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 text-sm">
          <div>
            <p className="text-gray-500 mb-2">แยกตามเครือข่าย</p>
            <ul className="space-y-1">
              {byNetwork.map((n) => (
                <li key={n.network} className="flex justify-between gap-4">
                  <span className="text-gray-700">{n.network}</span>
                  <span className="font-medium text-dark">{n._count._all}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-gray-500 mb-2">หน้าที่คนกดมากที่สุด</p>
            <ul className="space-y-1">
              {bySource.map((s) => (
                <li key={s.source} className="flex justify-between gap-4">
                  <span className="text-gray-700 truncate">{s.source || "—"}</span>
                  <span className="font-medium text-dark">{s._count._all}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
