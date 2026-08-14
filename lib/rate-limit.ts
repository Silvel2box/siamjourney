import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

// Fixed-window rate limiting for the handful of unauthenticated actions: login,
// register, newsletter. Kept in the database on purpose — Passenger can run more
// than one process, and a counter in module scope would give each of them its own
// allowance and reset every restart.

// The caller's address, as far as it can be trusted.
//
// `x-real-ip` comes first because Plesk's nginx sets it to the socket address and
// overwrites whatever the client sent. `x-forwarded-for` is a chain the client can
// start ("X-Forwarded-For: 1.2.3.4" arrives as "1.2.3.4, <real ip>"), so the entry
// worth reading is the LAST one — the one nginx appended. Taking the first would
// let anyone reset their own limit with a header.
export async function clientIp(): Promise<string> {
  const h = await headers();
  const real = h.get("x-real-ip")?.trim();
  if (real) return real.slice(0, 45);
  const chain = h.get("x-forwarded-for");
  const last = chain?.split(",").pop()?.trim();
  return (last || "unknown").slice(0, 45);
}

export type RateLimitResult = { ok: true } | { ok: false; retryAfterMinutes: number };

export async function rateLimit(
  action: string,
  limit: number,
  windowMinutes: number,
): Promise<RateLimitResult> {
  const key = `${action}:${await clientIp()}`;
  const now = new Date();

  const row = await prisma.rateLimit.findUnique({ where: { key } });

  if (!row || row.expiresAt <= now) {
    const expiresAt = new Date(now.getTime() + windowMinutes * 60_000);
    await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, expiresAt },
      update: { count: 1, expiresAt },
    });
    // Sweep on window starts only — the table would otherwise keep a row per
    // address forever, and this is the moment we already know rows have expired.
    await prisma.rateLimit.deleteMany({ where: { expiresAt: { lt: now } } });
    return { ok: true };
  }

  if (row.count >= limit) {
    return {
      ok: false,
      retryAfterMinutes: Math.max(1, Math.ceil((row.expiresAt.getTime() - now.getTime()) / 60_000)),
    };
  }

  await prisma.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
  return { ok: true };
}

export function tooManyMessage(retryAfterMinutes: number): string {
  return `พยายามหลายครั้งเกินไป กรุณารออีก ${retryAfterMinutes} นาทีแล้วลองใหม่`;
}
