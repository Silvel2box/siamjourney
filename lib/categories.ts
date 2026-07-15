// The 4 content categories shown per province. `slug` is used in URLs and in
// place frontmatter `category`.
export const categories = [
  { slug: "attraction", name: "สถานที่ท่องเที่ยว", icon: "camera-retro" },
  { slug: "restaurant", name: "ร้านอาหาร", icon: "utensils" },
  { slug: "cafe", name: "คาเฟ่", icon: "mug-hot" },
  { slug: "otop", name: "สินค้า OTOP", icon: "store" },
] as const;

export type CategorySlug = (typeof categories)[number]["slug"];

export const categoryBySlug = (slug: string) =>
  categories.find((c) => c.slug === slug);
