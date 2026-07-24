import Link from "next/link";
import Image from "next/image";
import type { Hotel } from "@/lib/content";

export default function HotelCard({ hotel }: { hotel: Hotel }) {
  return (
    <Link
      href={`/hotel/${hotel.slug}`}
      className="group relative rounded-3xl overflow-hidden shadow-lg block reveal"
    >
      <div className="img-zoom-container relative h-64">
        <Image
          src={hotel.image}
          alt={hotel.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {hotel.sponsored > 0 && (
        <span className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
          {hotel.sponsored === 2 ? "พาร์ทเนอร์" : "แนะนำ"}
        </span>
      )}

      <div className="absolute bottom-0 left-0 p-6 w-full">
        <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full mb-2 inline-flex items-center gap-1">
          <i className="fas fa-bed" />
          {hotel.priceRange ?? "ที่พัก"}
        </span>
        <h3 className="text-2xl font-heading font-bold text-white">{hotel.name}</h3>
        <p className="text-gray-300 text-sm mt-1 line-clamp-2">{hotel.summary}</p>
      </div>
    </Link>
  );
}
