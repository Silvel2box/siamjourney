import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const COOKIE = "shop_session";
const SESSION_DAYS = 30;
const KEYLEN = 64;

// --- Password hashing (scrypt, native — no bcrypt native binding needed) ---

function scryptAsync(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEYLEN, (err, derived) => {
      if (err) reject(err);
      else resolve(derived);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scryptAsync(password, salt);
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const derived = await scryptAsync(password, Buffer.from(saltHex, "hex"));
  const expected = Buffer.from(hashHex, "hex");
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

// --- Session management (opaque DB-backed token stored in an httpOnly cookie) ---

export async function createSession(merchantId: number): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: { id: token, merchantId, expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { id: token } });
  }
  cookieStore.delete(COOKIE);
}

// Merchant DTO for the current session, or null. Cached per request render pass.
// Only exposes non-sensitive fields (never passwordHash).
export const getMerchant = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { id: token },
    include: {
      merchant: {
        select: {
          id: true,
          email: true,
          shopName: true,
          status: true,
          role: true,
        },
      },
    },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.deleteMany({ where: { id: token } });
    return null;
  }

  return session.merchant;
});

// Guard for protected pages/actions — redirects to /login when not signed in.
export async function requireMerchant() {
  const merchant = await getMerchant();
  if (!merchant) redirect("/login");
  return merchant;
}

// Guard for admin-only pages/actions. Signed-out → /login, non-admin → /dashboard.
export async function requireAdmin() {
  const merchant = await requireMerchant();
  if (merchant.role !== "admin") redirect("/dashboard");
  return merchant;
}
