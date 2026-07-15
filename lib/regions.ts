// The 6 regions of Thailand. `slug` is used in URLs: /north, /northeast, ...
// `provinceCount` is the official number of provinces per region (total 77).
export type Region = {
  slug: string;
  name: string; // Thai display name
  provinceCount: number;
  icon: string; // FontAwesome class suffix, e.g. "mountain" -> fa-mountain
  blurb: string;
};

export const regions: Region[] = [
  { slug: "north", name: "ภาคเหนือ", provinceCount: 9, icon: "mountain", blurb: "ทะเลหมอก ภูเขาสูง และมนต์เสน่ห์ล้านนา" },
  { slug: "northeast", name: "ภาคอีสาน", provinceCount: 20, icon: "tractor", blurb: "อารยธรรมโบราณและวิถีชีวิตริมโขง" },
  { slug: "central", name: "ภาคกลาง", provinceCount: 22, icon: "city", blurb: "เมืองหลวงและแหล่งประวัติศาสตร์" },
  { slug: "east", name: "ภาคตะวันออก", provinceCount: 7, icon: "sun", blurb: "ทะเลตะวันออกและสวนผลไม้" },
  { slug: "west", name: "ภาคตะวันตก", provinceCount: 5, icon: "water", blurb: "ผืนป่าตะวันตกและเมืองริมทะเล" },
  { slug: "south", name: "ภาคใต้", provinceCount: 14, icon: "umbrella-beach", blurb: "ทะเลสองฝั่งและหาดทรายขาว" },
];

export const regionBySlug = (slug: string) => regions.find((r) => r.slug === slug);
