"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { categories } from "@/lib/categories";
import { regions } from "@/lib/regions";

// Admin CRUD for Place/Province (phase 2B). Returns an error string to the form
// on validation failure; on success it redirects to the list (revalidating the
// affected public pages so edits show up immediately — no rebuild).
type State = { error: string } | null;

const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim() : "";
};
const orNull = (v: string) => (v === "" ? null : v);

const categorySlugs = categories.map((c) => c.slug);
const regionSlugs = regions.map((r) => r.slug);

// Assemble the JSON blobs from their flat form fields (Prisma.DbNull = clear).
function imageCreditFrom(fd: FormData) {
  const author = str(fd, "imageCreditAuthor");
  if (!author) return Prisma.DbNull;
  const license = str(fd, "imageCreditLicense");
  return {
    author,
    source: str(fd, "imageCreditSource") || "unknown",
    sourceUrl: str(fd, "imageCreditSourceUrl"),
    ...(license ? { license } : {}),
  };
}
function coord(fd: FormData, k: string): number | null | undefined {
  const v = str(fd, k);
  if (v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined; // undefined = invalid
}

// Booking/partner link { label, url } → JSON (Prisma.DbNull = clear). Returns an
// error string when a url is given but malformed. Shared by place + hotel.
function affiliateFrom(
  fd: FormData,
): { affiliate: { label: string; url: string } | typeof Prisma.DbNull } | { error: string } {
  const label = str(fd, "affiliateLabel");
  const url = str(fd, "affiliateUrl");
  if (label && url && !/^https?:\/\//.test(url)) {
    return { error: "ลิงก์ affiliate ต้องขึ้นต้นด้วย http:// หรือ https://" };
  }
  return { affiliate: label && url ? { label, url } : Prisma.DbNull };
}

async function revalidatePlacePaths(p: { slug: string; province: string; category: string }) {
  const prov = await prisma.province.findUnique({
    where: { slug: p.province },
    select: { region: true },
  });
  revalidatePath(`/place/${p.slug}`);
  if (prov) {
    revalidatePath(`/${prov.region}/${p.province}`);
    revalidatePath(`/${prov.region}/${p.province}/${p.category}`);
  }
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
}

function revalidateProvincePaths(p: { slug: string; region: string }) {
  revalidatePath(`/${p.region}/${p.slug}`);
  revalidatePath(`/${p.region}`);
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
}

// ---------------- Place ----------------

export async function savePlace(_prev: State, fd: FormData): Promise<State> {
  await requireAdmin();
  const provinceSlugs = (await prisma.province.findMany({ select: { slug: true } })).map(
    (p) => p.slug,
  );
  if (provinceSlugs.length === 0) return { error: "ยังไม่มีจังหวัดในระบบ" };

  const schema = z.object({
    slug: z.string().trim().regex(/^[a-z0-9-]+$/, "slug ใช้ได้เฉพาะ a-z 0-9 และ -"),
    name: z.string().trim().min(1, "กรุณากรอกชื่อสถานที่"),
    category: z.enum(categorySlugs),
    province: z.enum(provinceSlugs),
    summary: z.string().trim().min(1, "กรุณากรอกคำโปรย"),
    image: z.string().trim().min(1, "กรุณากรอกรูป (URL หรือ /images/...)"),
    body: z.string().trim().min(1, "กรุณากรอกเนื้อหา"),
    sponsored: z.coerce.number().int().min(0).max(2),
  });
  const parsed = schema.safeParse({
    slug: str(fd, "slug"),
    name: str(fd, "name"),
    category: str(fd, "category"),
    province: str(fd, "province"),
    summary: str(fd, "summary"),
    image: str(fd, "image"),
    body: str(fd, "body"),
    sponsored: str(fd, "sponsored") || "0",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const lat = coord(fd, "lat");
  const lng = coord(fd, "lng");
  if (lat === undefined || lng === undefined) return { error: "พิกัดต้องเป็นตัวเลข" };

  const aff = affiliateFrom(fd);
  if ("error" in aff) return aff;

  const data = {
    name: parsed.data.name,
    category: parsed.data.category,
    province: parsed.data.province,
    summary: parsed.data.summary,
    image: parsed.data.image,
    body: parsed.data.body,
    sponsored: parsed.data.sponsored,
    address: orNull(str(fd, "address")),
    hours: orNull(str(fd, "hours")),
    priceRange: orNull(str(fd, "priceRange")),
    lat,
    lng,
    imageCredit: imageCreditFrom(fd),
    affiliate: aff.affiliate,
  };

  const idRaw = str(fd, "id");
  if (idRaw) {
    const id = Number(idRaw);
    const before = await prisma.place.findUnique({
      where: { id },
      select: { slug: true, province: true, category: true },
    });
    const updated = await prisma.place.update({ where: { id }, data });
    await revalidatePlacePaths(updated);
    // if it moved province/category, refresh the old listing pages too
    if (before && (before.province !== updated.province || before.category !== updated.category)) {
      await revalidatePlacePaths(before);
    }
  } else {
    try {
      const created = await prisma.place.create({ data: { slug: parsed.data.slug, ...data } });
      await revalidatePlacePaths(created);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return { error: `slug "${parsed.data.slug}" มีอยู่แล้ว` };
      }
      throw e;
    }
  }
  revalidatePath("/admin/places");
  redirect("/admin/places");
}

export async function deletePlace(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(str(fd, "id"));
  if (!id) return;
  const place = await prisma.place.findUnique({
    where: { id },
    select: { slug: true, province: true, category: true },
  });
  if (!place) return;
  await prisma.place.delete({ where: { id } });
  await revalidatePlacePaths(place);
  revalidatePath("/admin/places");
}

// ---------------- Province ----------------

export async function saveProvince(_prev: State, fd: FormData): Promise<State> {
  await requireAdmin();

  const schema = z.object({
    slug: z.string().trim().regex(/^[a-z0-9-]+$/, "slug ใช้ได้เฉพาะ a-z 0-9 และ -"),
    name: z.string().trim().min(1, "กรุณากรอกชื่อจังหวัด (ไทย)"),
    nameEn: z.string().trim().min(1, "กรุณากรอกชื่อจังหวัด (อังกฤษ)"),
    region: z.enum(regionSlugs),
    summary: z.string().trim().min(1, "กรุณากรอกคำโปรย"),
    image: z.string().trim().min(1, "กรุณากรอกรูป (URL หรือ /images/...)"),
    body: z.string().trim().min(1, "กรุณากรอกเนื้อหา"),
  });
  const parsed = schema.safeParse({
    slug: str(fd, "slug"),
    name: str(fd, "name"),
    nameEn: str(fd, "nameEn"),
    region: str(fd, "region"),
    summary: str(fd, "summary"),
    image: str(fd, "image"),
    body: str(fd, "body"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const data = {
    name: parsed.data.name,
    nameEn: parsed.data.nameEn,
    region: parsed.data.region,
    summary: parsed.data.summary,
    image: parsed.data.image,
    body: parsed.data.body,
    featured: str(fd, "featured") === "on",
    imageCredit: imageCreditFrom(fd),
  };

  const idRaw = str(fd, "id");
  if (idRaw) {
    const id = Number(idRaw);
    const before = await prisma.province.findUnique({
      where: { id },
      select: { slug: true, region: true },
    });
    const updated = await prisma.province.update({ where: { id }, data });
    revalidateProvincePaths(updated);
    if (before && before.region !== updated.region) revalidateProvincePaths(before);
  } else {
    try {
      const created = await prisma.province.create({ data: { slug: parsed.data.slug, ...data } });
      revalidateProvincePaths(created);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return { error: `slug "${parsed.data.slug}" มีอยู่แล้ว` };
      }
      throw e;
    }
  }
  revalidatePath("/admin/provinces");
  redirect("/admin/provinces");
}

export async function deleteProvince(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(str(fd, "id"));
  if (!id) return;
  const province = await prisma.province.findUnique({
    where: { id },
    select: { slug: true, region: true },
  });
  if (!province) return;
  // Don't orphan places/hotels that reference this province.
  const [placeCount, hotelCount] = await Promise.all([
    prisma.place.count({ where: { province: province.slug } }),
    prisma.hotel.count({ where: { province: province.slug } }),
  ]);
  if (placeCount > 0 || hotelCount > 0) return; // guarded in the UI too
  await prisma.province.delete({ where: { id } });
  revalidateProvincePaths(province);
  revalidatePath("/admin/provinces");
}

// ---------------- Hotel ----------------

async function revalidateHotelPaths(h: { slug: string; province: string }) {
  const prov = await prisma.province.findUnique({
    where: { slug: h.province },
    select: { region: true },
  });
  revalidatePath(`/hotel/${h.slug}`);
  revalidatePath("/hotel");
  if (prov) revalidatePath(`/${prov.region}/${h.province}`); // province page lists hotels
  revalidatePath("/sitemap.xml");
}

export async function saveHotel(_prev: State, fd: FormData): Promise<State> {
  await requireAdmin();
  const provinceSlugs = (await prisma.province.findMany({ select: { slug: true } })).map(
    (p) => p.slug,
  );
  if (provinceSlugs.length === 0) return { error: "ยังไม่มีจังหวัดในระบบ" };

  const schema = z.object({
    slug: z.string().trim().regex(/^[a-z0-9-]+$/, "slug ใช้ได้เฉพาะ a-z 0-9 และ -"),
    name: z.string().trim().min(1, "กรุณากรอกชื่อโรงแรม/ที่พัก"),
    province: z.enum(provinceSlugs),
    summary: z.string().trim().min(1, "กรุณากรอกคำโปรย"),
    image: z.string().trim().min(1, "กรุณากรอกรูป (URL หรือ /images/...)"),
    body: z.string().trim().min(1, "กรุณากรอกเนื้อหา"),
    sponsored: z.coerce.number().int().min(0).max(2),
  });
  const parsed = schema.safeParse({
    slug: str(fd, "slug"),
    name: str(fd, "name"),
    province: str(fd, "province"),
    summary: str(fd, "summary"),
    image: str(fd, "image"),
    body: str(fd, "body"),
    sponsored: str(fd, "sponsored") || "0",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const lat = coord(fd, "lat");
  const lng = coord(fd, "lng");
  if (lat === undefined || lng === undefined) return { error: "พิกัดต้องเป็นตัวเลข" };

  const aff = affiliateFrom(fd);
  if ("error" in aff) return aff;

  const data = {
    name: parsed.data.name,
    province: parsed.data.province,
    summary: parsed.data.summary,
    image: parsed.data.image,
    body: parsed.data.body,
    sponsored: parsed.data.sponsored,
    address: orNull(str(fd, "address")),
    priceRange: orNull(str(fd, "priceRange")),
    lat,
    lng,
    imageCredit: imageCreditFrom(fd),
    affiliate: aff.affiliate,
  };

  const idRaw = str(fd, "id");
  if (idRaw) {
    const id = Number(idRaw);
    const before = await prisma.hotel.findUnique({
      where: { id },
      select: { slug: true, province: true },
    });
    const updated = await prisma.hotel.update({ where: { id }, data });
    await revalidateHotelPaths(updated);
    if (before && before.province !== updated.province) await revalidateHotelPaths(before);
  } else {
    try {
      const created = await prisma.hotel.create({ data: { slug: parsed.data.slug, ...data } });
      await revalidateHotelPaths(created);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return { error: `slug "${parsed.data.slug}" มีอยู่แล้ว` };
      }
      throw e;
    }
  }
  revalidatePath("/admin/hotels");
  redirect("/admin/hotels");
}

export async function deleteHotel(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(str(fd, "id"));
  if (!id) return;
  const hotel = await prisma.hotel.findUnique({
    where: { id },
    select: { slug: true, province: true },
  });
  if (!hotel) return;
  await prisma.hotel.delete({ where: { id } });
  await revalidateHotelPaths(hotel);
  revalidatePath("/admin/hotels");
}
