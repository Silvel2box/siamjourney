"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { parseShopForm } from "@/lib/shop";

type State = { error: string } | { ok: true } | null;

const schema = z.object({
  merchantId: z.coerce.number().int().positive(),
  status: z.enum(["pending", "approved", "suspended"]),
});

// Admin-only: change a shop's approval status.
export async function updateStatus(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = schema.safeParse({
    merchantId: formData.get("merchantId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return;

  await prisma.merchant.update({
    where: { id: parsed.data.merchantId },
    data: { status: parsed.data.status },
  });

  revalidatePath("/admin");
}

// Admin-only: edit ANY merchant's shop profile. Unlike updateShop (which binds
// to the session), this takes merchantId from the form — guarded by requireAdmin
// so a regular merchant can't target another shop. Reuses the same validation.
export async function adminUpdateShop(_prev: State, formData: FormData): Promise<State> {
  await requireAdmin();

  const merchantId = Number(formData.get("merchantId"));
  if (!Number.isInteger(merchantId) || merchantId <= 0) return { error: "merchant ไม่ถูกต้อง" };

  const r = await parseShopForm(formData);
  if ("error" in r) return r;

  await prisma.merchant.update({ where: { id: merchantId }, data: r.data });

  revalidatePath("/admin");
  revalidatePath(`/admin/merchants/${merchantId}/edit`);
  revalidatePath(`/shop/${merchantId}`);
  return { ok: true };
}
