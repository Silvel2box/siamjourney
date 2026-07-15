import Link from "next/link";
import Image from "next/image";
import { site } from "@/lib/site";

type Crumb = { href?: string; label: string };

// Top banner for inner pages. Adds padding to clear the fixed navbar and gives
// the transparent white-text navbar a dark backdrop to sit on.
export default function PageBanner({
  title,
  subtitle,
  image,
  crumbs = [],
}: {
  title: string;
  subtitle?: string;
  image?: string;
  crumbs?: Crumb[];
}) {
  // BreadcrumbList JSON-LD mirroring the visual breadcrumb (home + crumbs).
  const trail = [{ label: "หน้าแรก", href: "/" }, ...crumbs];
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${site.url}${c.href}` } : {}),
    })),
  };

  return (
    <section className="relative pt-36 pb-20 bg-dark text-white overflow-hidden">
      {crumbs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
      )}
      {image && (
        <>
          <Image
            src={image}
            alt={title}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-dark/30" />
        </>
      )}
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        {crumbs.length > 0 && (
          <nav className="text-sm text-gray-300 mb-4 flex flex-wrap gap-2">
            <Link href="/" className="hover:text-primary transition">หน้าแรก</Link>
            {crumbs.map((c) => (
              <span key={c.label} className="flex gap-2">
                <span>/</span>
                {c.href ? (
                  <Link href={c.href} className="hover:text-primary transition">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-white">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4">{title}</h1>
        {subtitle && (
          <p className="text-lg text-gray-300 max-w-2xl">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
