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
