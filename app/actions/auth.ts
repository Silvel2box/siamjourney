"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  createSession,
  deleteSession,
  issueVerifyToken,
  requireMerchant,
} from "@/lib/auth";
import { sendVerifyEmail } from "@/lib/email";
import { rateLimit, tooManyMessage } from "@/lib/rate-limit";

// Compared against when the email is unknown, so a wrong address and a wrong
// password take the same time to answer. Without it the miss returns before
// scrypt runs at all, which tells anyone timing the form which emails exist.
// Any well-formed hash works — this one is a throwaway.
const DUMMY_HASH =
  "0000000000000000000000000000000000000000000000000000000000000000:" +
  "0".repeat(128);

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

  // 5 new accounts an hour from one address is well past any real shop owner.
  const limit = await rateLimit("register", 5, 60);
  if (!limit.ok) return { error: tooManyMessage(limit.retryAfterMinutes) };

  const { shopName, email, password } = parsed.data;

  try {
    const passwordHash = await hashPassword(password);
    const merchant = await prisma.merchant.create({
      data: { shopName, email, passwordHash },
    });
    // Sending is best-effort on purpose: an account that exists with an
    // unconfirmed address is recoverable ("ส่งอีกครั้ง" on the dashboard), an
    // account that failed to be created because a mail API was down is not.
    await sendVerifyEmail(email, await issueVerifyToken(merchant.id));
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

  // 10 tries per 15 minutes. Enough for someone who forgot which password they
  // used, far too few to work through a list.
  const limit = await rateLimit("login", 10, 15);
  if (!limit.ok) return { error: tooManyMessage(limit.retryAfterMinutes) };

  const { email, password } = parsed.data;

  try {
    const merchant = await prisma.merchant.findUnique({ where: { email } });
    const ok = await verifyPassword(password, merchant?.passwordHash ?? DUMMY_HASH);
    if (!merchant || !ok) {
      return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
    }
    await createSession(merchant.id);
  } catch {
    return { error: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" };
  }

  redirect("/dashboard");
}

// Sends the verification link again — from the dashboard banner, for the address
// on the account. Not a form the visitor can aim anywhere: the address comes from
// the session, never from the request.
export async function resendVerification(): Promise<void> {
  const merchant = await requireMerchant();
  if (merchant.emailVerifiedAt) redirect("/dashboard?verify=ok");

  const limit = await rateLimit("verify-email", 3, 60);
  if (!limit.ok) redirect("/dashboard?verify=throttled");

  const sent = await sendVerifyEmail(merchant.email, await issueVerifyToken(merchant.id));
  redirect(`/dashboard?verify=${sent ? "sent" : "failed"}`);
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
