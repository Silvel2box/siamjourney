"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "ร้านค้า" },
  { href: "/admin/places", label: "สถานที่" },
  { href: "/admin/hotels", label: "ที่พัก" },
  { href: "/admin/provinces", label: "จังหวัด" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {TABS.map((t) => {
        const active = t.href === "/admin" ? pathname === "/admin" : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`px-5 py-2 rounded-full text-sm font-medium transition ${
              active
                ? "bg-primary text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
