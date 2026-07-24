import type { Metadata } from "next";
import Link from "next/link";
import { getAllHotels, getAllProvinces } from "@/lib/content";
import { site, pageOpenGraph } from "@/lib/site";
import PageBanner from "@/components/PageBanner";
import HotelCard from "@/components/HotelCard";
import AdSlot from "@/components/AdSlot";

// New hotels added via the admin render on-demand (ISR); no rebuild needed.
export const revalidate = 3600;

const title = "ที่พัก โรงแรม รีสอร์ท ทั่วไทย";
const description =
  "รวมโรงแรม รีสอร์ท และที่พักน่าจองทั่วไทย 77 จังหวัด แยกตามจังหวัด พร้อมลิงก์จองที่พัก";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/hotel" },
  openGraph: pageOpenGraph("/hotel", site.ogImage),
};

export default async function HotelIndexPage() {
  const [hotels, provinces] = await Promise.all([getAllHotels(), getAllProvinces()]);

  // Group by province, keep only provinces that have hotels, sort groups by Thai name.
  const groups = provinces
    .map((p) => ({
      province: p,
      hotels: hotels
        .filter((h) => h.province === p.slug)
        .sort((a, b) =>
          a.sponsored !== b.sponsored
            ? b.sponsored - a.sponsored
            : a.name.localeCompare(b.name, "th"),
        ),
    }))
    .filter((g) => g.hotels.length > 0)
    .sort((a, b) => a.province.name.localeCompare(b.province.name, "th"));

  return (
    <>
      <PageBanner title={title} subtitle={description} crumbs={[{ label: "ที่พัก" }]} />

      <div className="py-20 bg-light">
        <div className="container mx-auto px-6 md:px-12 space-y-20">
          {groups.length > 0 ? (
            groups.map(({ province, hotels }, i) => (
              <section key={province.slug} id={province.slug}>
                <div className="flex items-center justify-between gap-3 mb-8">
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl">
                      <i className="fas fa-bed" />
                    </span>
                    <h2 className="text-3xl font-heading font-bold text-dark">
                      ที่พักใน{province.name}
                    </h2>
                  </div>
                  <Link
                    href={`/${province.region}/${province.slug}`}
                    className="text-primary font-medium hover:underline whitespace-nowrap flex items-center gap-2"
                  >
                    เที่ยว{province.name} <i className="fas fa-arrow-right text-sm" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {hotels.map((hotel) => (
                    <HotelCard key={hotel.slug} hotel={hotel} />
                  ))}
                </div>
                {i === 0 && <AdSlot className="mt-12" />}
              </section>
            ))
          ) : (
            <p className="text-center text-gray-500 py-16">
              กำลังรวบรวมข้อมูลที่พัก เร็วๆ นี้
            </p>
          )}
        </div>
      </div>
    </>
  );
}
