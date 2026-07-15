import Link from "next/link";
import { regions } from "@/lib/regions";

export default function RegionGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {regions.map((r) => (
        <Link
          key={r.slug}
          href={`/${r.slug}`}
          className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50 transition duration-300 rounded-2xl p-6 text-center group backdrop-blur-sm"
        >
          <i
            className={`fas fa-${r.icon} text-3xl text-gray-500 group-hover:text-primary mb-3 transition`}
          />
          <h4 className="font-heading font-medium text-lg">{r.name}</h4>
          <p className="text-xs text-gray-500 mt-1">{r.provinceCount} จังหวัด</p>
        </Link>
      ))}
    </div>
  );
}
