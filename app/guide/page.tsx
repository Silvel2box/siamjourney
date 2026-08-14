import type { Metadata } from "next";
import { getAllGuides } from "@/lib/content";
import { site, pageOpenGraph } from "@/lib/site";
import PageBanner from "@/components/PageBanner";
import GuideCard from "@/components/GuideCard";
import AdSlot from "@/components/AdSlot";
import { jsonLdHtml } from "@/lib/jsonld";

// New guides added via the admin render on-demand (ISR); no rebuild needed.
export const revalidate = 3600;

const title = "บทความและไกด์เที่ยวไทย";
const description =
  "แผนเที่ยว เส้นทาง และไกด์เที่ยวไทยแบบลงมือทำได้จริง เลือกจังหวัดตามฤดู วางทริปตามวันที่มี และรู้ว่าของฝากแต่ละจังหวัดคืออะไร";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/guide" },
  openGraph: pageOpenGraph("/guide", site.ogImage),
};

export default async function GuideIndexPage() {
  const guides = await getAllGuides();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    itemListElement: guides.map((g, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: g.title,
      url: `${site.url}/guide/${g.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }}
      />

      <PageBanner title={title} subtitle={description} crumbs={[{ label: "บทความ" }]} />

      <section className="py-20 bg-light">
        <div className="container mx-auto px-6 md:px-12">
          {guides.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {guides.map((g) => (
                  <GuideCard key={g.slug} guide={g} />
                ))}
              </div>
              <AdSlot className="mt-16" />
            </>
          ) : (
            <p className="text-center text-gray-500 py-16">กำลังเขียนบทความ เร็วๆ นี้</p>
          )}
        </div>
      </section>
    </>
  );
}
