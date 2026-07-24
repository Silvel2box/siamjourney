import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

// Serves admin-uploaded images from disk. Next's static handler only serves
// public/ files that existed at startup, so runtime uploads are served here
// instead. Stored under public/uploads; referenced as /api/uploads/<name>.jpg.
export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  // only our generated names (uuid.jpg) — blocks path traversal
  if (!/^[a-f0-9-]+\.jpg$/i.test(name)) {
    return new NextResponse("not found", { status: 404 });
  }
  const file = path.join(process.cwd(), "public", "uploads", name);
  let buf: Buffer;
  try {
    buf = fs.readFileSync(file);
  } catch {
    return new NextResponse("not found", { status: 404 });
  }
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
