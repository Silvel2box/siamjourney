"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import type { GalleryImage } from "@/lib/content";

// Thumbnail grid + fullscreen lightbox (prev/next/Esc). Dependency-free.
export default function HotelGallery({
  images,
  hotelName,
}: {
  images: GalleryImage[];
  hotelName: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const open = active !== null;

  const close = useCallback(() => setActive(null), []);
  const step = useCallback(
    (dir: -1 | 1) =>
      setActive((cur) => (cur === null ? cur : (cur + dir + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    // Lock body scroll while the lightbox is open.
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, step]);

  if (images.length === 0) return null;

  const alt = (img: GalleryImage) => (img.caption ? `${hotelName} – ${img.caption}` : hotelName);

  return (
    <section className="mt-14">
      <h2 className="font-heading font-bold text-2xl text-dark mb-6">รูปเพิ่มเติม</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`ดูรูป ${i + 1}`}
            className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Image
              src={img.url}
              alt={alt(img)}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover transition group-hover:scale-105"
            />
            {img.caption && (
              <span className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs px-3 py-2 text-left">
                {img.caption}
              </span>
            )}
          </button>
        ))}
      </div>

      {open && active !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={`รูป ${hotelName}`}
        >
          <button
            type="button"
            onClick={close}
            aria-label="ปิด"
            className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl leading-none"
          >
            ×
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); step(-1); }}
                aria-label="รูปก่อนหน้า"
                className="absolute left-3 md:left-6 text-white/80 hover:text-white text-4xl leading-none px-2"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); step(1); }}
                aria-label="รูปถัดไป"
                className="absolute right-3 md:right-6 text-white/80 hover:text-white text-4xl leading-none px-2"
              >
                ›
              </button>
            </>
          )}

          <figure className="max-w-5xl max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            {/* plain img: arbitrary source dims, full-screen view — optimizer not needed here */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[active].url}
              alt={alt(images[active])}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            {images[active].caption && (
              <figcaption className="text-white/80 text-sm mt-3 text-center">
                {images[active].caption}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </section>
  );
}
