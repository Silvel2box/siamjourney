"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

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
