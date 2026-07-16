"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  createSession,
  deleteSession,
} from "@/lib/auth";

// State returned to the form (null before first submit).
type State = { error: string } | null;

const registerSchema = z.object({
  shopName: z.string().trim().min(2, "กรุณากรอกชื่อร้าน (อย่างน้อย 2 ตัวอักษร)"),
  email: z.string().trim().email("กรุณากรอกอีเมลให้ถูกต้อง"),
  password: z.string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"),
});

const loginSchema = z.object({
  email: z.string().trim().email("กรุณากรอกอีเมลให้ถูกต้อง"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

export async function register(_prev: State, formData: FormData): Promise<State> {
  const parsed = registerSchema.safeParse({
    shopName: formData.get("shopName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { shopName, email, password } = parsed.data;

  try {
    const passwordHash = await hashPassword(password);
    const merchant = await prisma.merchant.create({
      data: { shopName, email, passwordHash },
    });
    await createSession(merchant.id);
  } catch (e: unknown) {
    // P2002 = unique constraint → email already registered
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      return { error: "อีเมลนี้ถูกใช้สมัครแล้ว กรุณาเข้าสู่ระบบ" };
    }
    return { error: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" };
  }

  redirect("/dashboard");
}

export async function login(_prev: State, formData: FormData): Promise<State> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email, password } = parsed.data;

  try {
    const merchant = await prisma.merchant.findUnique({ where: { email } });
    if (!merchant || !(await verifyPassword(password, merchant.passwordHash))) {
      return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
    }
    await createSession(merchant.id);
  } catch {
    return { error: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" };
  }

  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
