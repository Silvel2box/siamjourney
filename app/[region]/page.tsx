import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { regions, regionBySlug } from "@/lib/regions";
import { getProvincesByRegion } from "@/lib/content";
import { site } from "@/lib/site";
import PageBanner from "@/components/PageBanner";
import ProvinceCard from "@/components/ProvinceCard";

export const dynamicParams = false;

export function generateStaticParams() {
  return regions.map((r) => ({ region: r.slug }));
}

type Props = { params: Promise<{ region: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region: slug } = await params;
  const region = regionBySlug(slug);
  if (!region) return {};
  return {
    title: `เที่ยว${region.name}`,
    description: `รวมจังหวัดน่าเที่ยวใน${region.name} — ${region.blurb}`,
    alternates: { canonical: `/${region.slug}` },
    openGraph: { images: [site.ogImage] },
  };
}

export default async function RegionPage({ params }: Props) {
  const { region: slug } = await params;
  const region = regionBySlug(slug);
  if (!region) notFound();

  const provinces = getProvincesByRegion(slug);

  return (
    <>
      <PageBanner
        title={`เที่ยว${region.name}`}
        subtitle={`${region.blurb} · ${region.provinceCount} จังหวัด`}
        crumbs={[{ label: region.name }]}
      />

      <section className="py-20 bg-light">
        <div className="container mx-auto px-6 md:px-12">
          {provinces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {provinces.map((p) => (
                <ProvinceCard key={p.slug} province={p} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-16">
              กำลังรวบรวมข้อมูลจังหวัดในภูมิภาคนี้ เร็วๆ นี้
            </p>
          )}
        </div>
      </section>
    </>
  );
}
