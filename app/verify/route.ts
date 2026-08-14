import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// The link from the verification email. Deliberately a GET a signed-out browser
// can follow: the mail may well be opened on a different device from the one the
// shop registered on, and the token is the proof, not the session.
export const dynamic = "force-dynamic";

const back = (state: string) =>
  new NextResponse(null, {
    status: 302,
    headers: { Location: `/dashboard?verify=${state}`, "Cache-Control": "no-store" },
  });

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return back("invalid");

  const merchant = await prisma.merchant.findUnique({
    where: { verifyToken: token },
    select: { id: true, verifyExpiresAt: true, emailVerifiedAt: true },
  });

  if (!merchant || !merchant.verifyExpiresAt || merchant.verifyExpiresAt < new Date()) {
    return back("expired");
  }
  if (merchant.emailVerifiedAt) return back("ok");

  await prisma.merchant.update({
    where: { id: merchant.id },
    // The token is cleared as it is spent, so the link works once.
    data: { emailVerifiedAt: new Date(), verifyToken: null, verifyExpiresAt: null },
  });

  return back("ok");
}
