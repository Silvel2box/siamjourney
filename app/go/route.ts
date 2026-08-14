import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAffiliateHost } from "@/lib/affiliate";

// Outbound hop for partner links: writes the click down, then sends the visitor
// on. Every affiliate link on the site points here (see trackedHref).
//
// Two rules this route lives by:
//   1. Only hosts named in lib/affiliate go through. Redirecting to anything a
//      caller asks for would hand out an open redirect on our own domain.
//   2. A failed write must never cost a click. The insert is wrapped and its
//      error swallowed — losing a row is nothing, losing a sale is not.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get("u") ?? "";
  const source = (searchParams.get("s") ?? "").slice(0, 191);

  if (!isAffiliateHost(target)) {
    // Bad or unknown destination — send them to the front page rather than
    // showing an error for something they cannot fix. A relative Location on
    // purpose: building an absolute one from req.url picks up whatever host and
    // port the proxy passed through (locally that came out as :3000).
    return new NextResponse(null, {
      status: 302,
      headers: { Location: "/", "Cache-Control": "no-store" },
    });
  }

  try {
    await prisma.affiliateClick.create({
      data: { network: new URL(target).hostname.replace(/^www\./, ""), source },
    });
  } catch {
    /* counting is not worth a broken link */
  }

  const res = NextResponse.redirect(target, 302);
  res.headers.set("Cache-Control", "no-store");
  return res;
}
