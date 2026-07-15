import Link from "next/link";
import Image from "next/image";
import type { Province } from "@/lib/content";
import { regionBySlug } from "@/lib/regions";

export default function ProvinceCard({ province }: { province: Province }) {
  const region = regionBySlug(province.region);

  return (
    <Link
      href={`/${province.region}/${province.slug}`}
      className="group relative rounded-3xl overflow-hidden shadow-lg block reveal"
    >
      <div className="img-zoom-container relative h-[400px]">
        <Image
          src={province.image}
          alt={province.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 p-8 w-full transform translate-y-4 group-hover:translate-y-0 transition duration-500">
        {region && (
          <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-3 inline-block">
            {region.name}
          </span>
        )}
        <h3 className="text-3xl font-heading font-bold text-white mb-2">
          {province.name}
        </h3>
        <p className="text-gray-300 text-sm mb-4 opacity-0 group-hover:opacity-100 transition duration-500 line-clamp-2">
          {province.summary}
        </p>
        <span className="text-white font-medium flex items-center gap-2 group-hover:text-primary transition opacity-0 group-hover:opacity-100">
          ดูข้อมูล <i className="fas fa-arrow-right text-sm" />
        </span>
      </div>
    </Link>
  );
}
