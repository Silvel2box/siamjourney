"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireMerchant } from "@/lib/auth";
import { getAllProvinces } from "@/lib/content";
import { categories } from "@/lib/categories";

// State returned to the form (null before first submit).
type State = { error: string } | { ok: true } | null;

// "" (unfilled field) → undefined so optional fields clear instead of storing "".
const emptyToUndef = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const optText = z.preprocess(emptyToUndef, z.string().trim().max(2000).optional());
const optUrl = z.preprocess(
  emptyToUndef,
  z.string().trim().url("ลิงก์ต้องขึ้นต้นด้วย http:// หรือ https://").optional(),
);

const categorySlugs = categories.map((c) => c.slug);

// Merchant edits their own shop profile. The record is always the session's
// merchant — the form never carries an id.
export async function updateShop(_prev: State, formData: FormData): Promise<State> {
  const { id } = await requireMerchant();

  const provinceSlugs = getAllProvinces().map((p) => p.slug);
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
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const d = parsed.data;
  await prisma.merchant.update({
    where: { id },
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
  });

  revalidatePath("/dashboard");
  revalidatePath(`/shop/${id}`);
  return { ok: true };
}
