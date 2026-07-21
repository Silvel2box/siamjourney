// Single source of truth for site identity. Change the domain here only.
export const site = {
  name: "SiamJourney",
  // The live domain has a hyphen (siamjourney.com is owned by someone else).
  domain: "siam-journey.com",
  url: "https://siam-journey.com",
  tagline: "เที่ยวไทย 77 จังหวัด",
  description:
    "แนะนำสถานที่ท่องเที่ยว ร้านอาหาร คาเฟ่ และสินค้า OTOP ประจำท้องถิ่นทั่วไทย 77 จังหวัด แยกตามภาคและจังหวัด",
  // Default social-share image (og:image). Replace with a branded 1200x630 later.
  ogImage:
    "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&h=630&q=80",
  email: "hello@siam-journey.com",
  social: {
    facebook: "#",
    instagram: "#",
    twitter: "#",
  },
} as const;

// openGraph in a page's generateMetadata REPLACES the root layout's openGraph
// wholesale (Next merges metadata shallowly), so a page that only sets `images`
// silently drops og:url / og:type / og:site_name / og:locale. Every page that
// customises its OG image should build the object with this instead.
// `path` is the same route-relative path used for alternates.canonical.
export function pageOpenGraph(path: string, image: string) {
  return {
    type: "website" as const,
    locale: "th_TH",
    siteName: site.name,
    url: `${site.url}${path}`,
    images: [image],
  };
}
