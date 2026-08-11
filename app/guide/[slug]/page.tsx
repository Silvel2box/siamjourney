import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { marked } from "marked";
import { getAllGuides, getGuide, getAllProvinces } from "@/lib/content";
import { site, pageOpenGraph } from "@/lib/site";
import PageBanner from "@/components/PageBanner";
import ProvinceCard from "@/components/ProvinceCard";
import GuideCard from "@/components/GuideCard";
import AdSlot from "@/components/AdSlot";

// New guides added via the admin render on-demand (ISR); no rebuild needed.
export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getAllGuides()).map((g) => ({ slug: g.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.summary,
    alternates: { canonical: `/guide/${guide.slug}` },
    openGraph: {
      ...pageOpenGraph(`/guide/${guide.slug}`, guide.image),
      type: "article",
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) notFound();

  const bodyHtml = await marked.parse(guide.body);

  // Keep the admin's ordering rather than the alphabetical one getAllProvinces
  // returns — the list is written as a route, not as an index.
  const all = await getAllProvinces();
  const covered = (guide.provinces ?? [])
    .map((s) => all.find((p) => p.slug === s))
    .filter((p) => p !== undefined);

  const related = (await getAllGuides()).filter((g) => g.slug !== guide.slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.summary,
    image: guide.image,
    dateModified: guide.updatedAt.toISOString(),
    author: { "@type": "Organization", name: site.name },
    publisher: { "@type": "Organization", name: site.name },
    mainEntityOfPage: `${site.url}/guide/${guide.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageBanner
        title={guide.title}
        subtitle={guide.summary}
        image={guide.image}
        credit={guide.imageCredit}
        crumbs={[{ href: "/guide", label: "บทความ" }, { label: guide.title }]}
      />

      <section className="py-16 bg-light">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <article className="lg:col-span-2">
              <div
                className="prose-body text-gray-700 text-lg"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            </article>

            <aside className="lg:col-span-1">
              <AdSlot className="sticky top-28" label="โฆษณา" />
            </aside>
          </div>

          {covered.length > 0 && (
            <div className="mt-20">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-dark mb-8">
                จังหวัดในบทความนี้
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {covered.map((p) => (
                  <ProvinceCard key={p.slug} province={p} />
                ))}
              </div>
            </div>
          )}

          {related.length > 0 && (
            <div className="mt-20">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-dark">
                  บทความอื่น
                </h2>
                <Link
                  href="/guide"
                  className="text-primary font-medium hover:underline whitespace-nowrap flex items-center gap-2"
                >
                  ดูทั้งหมด <i className="fas fa-arrow-right text-sm" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {related.map((g) => (
                  <GuideCard key={g.slug} guide={g} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
