"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

// State returned to the form (null before first submit).
type State = { ok: boolean; message: string } | null;

const emailSchema = z.string().email();

export async function subscribe(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const email = String(formData.get("email") ?? "").trim();

  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) {
    return { ok: false, message: "กรุณากรอกอีเมลให้ถูกต้อง" };
  }

  try {
    await prisma.subscriber.create({ data: { email: parsed.data } });
    return { ok: true, message: "สมัครรับข่าวสารเรียบร้อยแล้ว ขอบคุณครับ" };
  } catch (e: unknown) {
    // P2002 = unique constraint → already subscribed (treat as success)
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      return { ok: true, message: "อีเมลนี้สมัครไว้แล้ว ขอบคุณครับ" };
    }
    return { ok: false, message: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" };
  }
}
