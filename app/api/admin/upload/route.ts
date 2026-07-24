import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { getMerchant } from "@/lib/auth";

// Admin image upload. Resizes to max 1500px wide (auto-oriented from EXIF) and
// stores under public/uploads (served at /uploads/<name>.jpg, no remote pattern
// needed). Files are gitignored — back them up with the server.
export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(req: Request) {
  const merchant = await getMerchant();
  if (!merchant || merchant.role !== "admin") {
    return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "ไม่พบไฟล์" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "ต้องเป็นไฟล์รูปภาพ" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "ไฟล์ใหญ่เกิน 10MB" }, { status: 400 });
  }

  let out: Buffer;
  try {
    out = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate() // honour EXIF orientation (phone photos)
      .resize({ width: 1500, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
  } catch {
    return NextResponse.json({ error: "ไฟล์รูปเสียหรืออ่านไม่ได้" }, { status: 400 });
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  fs.mkdirSync(dir, { recursive: true });
  const name = `${randomUUID()}.jpg`;
  fs.writeFileSync(path.join(dir, name), out);

  // served by app/api/uploads/[name] (Next won't serve runtime-added public files)
  return NextResponse.json({ url: `/api/uploads/${name}` });
}
