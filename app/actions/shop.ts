"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireMerchant } from "@/lib/auth";
import { parseShopForm } from "@/lib/shop";

// State returned to the form (null before first submit).
type State = { error: string } | { ok: true } | null;

// Merchant edits their own shop profile. The record is always the session's
// merchant — the form never carries an id.
export async function updateShop(_prev: State, formData: FormData): Promise<State> {
  const { id } = await requireMerchant();

  const r = await parseShopForm(formData);
  if ("error" in r) return r;

  await prisma.merchant.update({ where: { id }, data: r.data });

  revalidatePath("/dashboard");
  revalidatePath(`/shop/${id}`);
  return { ok: true };
}
