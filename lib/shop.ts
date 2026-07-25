import { z } from "zod";
import { getAllProvinces } from "./content";
import { categories } from "./categories";

// Shared shop-profile parsing for both the merchant self-edit (updateShop) and
// the admin edit-any-shop action (adminUpdateShop). Keeps validation identical.
export type ShopData = {
  shopName: string;
  description: string | null;
  province: string | null;
  category: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  image: string | null;
};

// "" (unfilled field) → undefined so optional fields clear instead of storing "".
const emptyToUndef = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const optText = z.preprocess(emptyToUndef, z.string().trim().max(2000).optional());
const optUrl = z.preprocess(
  emptyToUndef,
  z.string().trim().url("ลิงก์ต้องขึ้นต้นด้วย http:// หรือ https://").optional(),
);

const categorySlugs = categories.map((c) => c.slug);

export async function parseShopForm(
  formData: FormData,
): Promise<{ data: ShopData } | { error: string }> {
  const provinceSlugs = (await getAllProvinces()).map((p) => p.slug);
  const schema = z.object({
    shopName: z.string().trim().min(2, "กรุณากรอกชื่อร้าน (อย่างน้อย 2 ตัวอักษร)"),
    description: optText,
    province: z.preprocess(emptyToUndef, z.enum(provinceSlugs).optional()),
    category: z.preprocess(emptyToUndef, z.enum(categorySlugs).optional()),
    address: optText,
    phone: optText,
    website: optUrl,
    image: optUrl,
  });

  const parsed = schema.safeParse({
    shopName: formData.get("shopName"),
    description: formData.get("description"),
    province: formData.get("province"),
    category: formData.get("category"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    website: formData.get("website"),
    image: formData.get("image"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const d = parsed.data;
  return {
    data: {
      shopName: d.shopName,
      description: d.description ?? null,
      province: d.province ?? null,
      category: d.category ?? null,
      address: d.address ?? null,
      phone: d.phone ?? null,
      website: d.website ?? null,
      image: d.image ?? null,
    },
  };
}
