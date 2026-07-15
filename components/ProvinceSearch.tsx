"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Item = { slug: string; name: string; region: string };

export default function ProvinceSearch({ provinces }: { provinces: Item[] }) {
  const [q, setQ] = useState("");

  const matches = useMemo(() => {
    const term = q.trim();
    if (!term) return [];
    return provinces
      .filter((p) => p.name.includes(term))
      .slice(0, 6);
  }, [q, provinces]);

  return (
    <div className="relative max-w-md">
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="ค้นหาจังหวัด เช่น เชียงใหม่, น่าน..."
        className="w-full bg-white/10 border border-white/20 rounded-full py-4 pl-6 pr-14 text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary backdrop-blur-sm transition"
      />
      <span className="absolute right-2 top-2 bottom-2 bg-primary text-white w-12 rounded-full flex items-center justify-center">
        <i className="fas fa-search" />
      </span>

      {matches.length > 0 && (
        <ul className="absolute z-20 mt-2 w-full bg-white text-dark rounded-2xl shadow-xl overflow-hidden">
          {matches.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/${p.region}/${p.slug}`}
                className="block px-6 py-3 hover:bg-light transition"
              >
                {p.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
