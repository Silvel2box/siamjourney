import Link from "next/link";
import Image from "next/image";
import type { Guide } from "@/lib/content";

// Deliberately not the PlaceCard/ProvinceCard shape (photo with text burned
// over it). An article is text first, so the title sits on white where it can
// be read at any length instead of fighting the image.
export default function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Link
      href={`/guide/${guide.slug}`}
      className="group flex flex-col rounded-3xl overflow-hidden shadow-lg bg-white block reveal"
    >
      <div className="img-zoom-container relative h-48 shrink-0">
        <Image
          src={guide.image}
          alt={guide.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
        {guide.featured && (
          <span className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
            แนะนำ
          </span>
        )}
      </div>
      <div className="p-6 flex flex-col gap-2">
        <h3 className="text-xl font-heading font-bold text-dark group-hover:text-primary transition">
          {guide.title}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{guide.summary}</p>
        <span className="mt-2 text-primary text-sm font-medium inline-flex items-center gap-2">
          อ่านต่อ <i className="fas fa-arrow-right text-xs" />
        </span>
      </div>
    </Link>
  );
}
