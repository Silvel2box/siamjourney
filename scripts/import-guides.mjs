// Load content/guides markdown into the Guide table.
//
//   npm run import:guides
//
// Unlike import:content this one is SAFE ON PROD. Guides are written in the
// repo and reviewed there, so markdown is the source of truth for them — the
// upsert deliberately overwrites the row. Guides the team writes through the
// admin have no markdown file and are never touched.
//
// Run it BEFORE `build`: generateStaticParams reads the DB at build time, so a
// later import leaves the empty /guide index cached for an hour.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { PrismaClient } from "@prisma/client";

// Prisma CLI loads .env; a plain node script does not.
for (const line of fs.existsSync(".env") ? fs.readFileSync(".env", "utf8").split("\n") : []) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const prisma = new PrismaClient();
const dir = path.join(process.cwd(), "content", "guides");

async function main() {
  const known = new Set(
    (await prisma.province.findMany({ select: { slug: true } })).map((p) => p.slug),
  );

  let n = 0;
  const dropped = [];
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
    const { data, content } = matter(fs.readFileSync(path.join(dir, file), "utf8"));

    // A guide pointing at a province that isn't in the DB would render a dead
    // card, so drop the slug and say so rather than importing it quietly.
    const provinces = (data.provinces ?? []).filter((s) => {
      if (known.has(s)) return true;
      dropped.push(`${data.slug} → ${s}`);
      return false;
    });

    const row = {
      title: data.title,
      summary: data.summary,
      image: data.image,
      imageCredit: data.imageCredit ?? null,
      provinces: provinces.length ? provinces : null,
      featured: Boolean(data.featured),
      body: content.trim(),
    };
    await prisma.guide.upsert({
      where: { slug: data.slug },
      create: { slug: data.slug, ...row },
      update: row,
    });
    n++;
  }

  const total = await prisma.guide.count();
  console.log(`imported guides=${n} | DB now: guides=${total}`);
  if (dropped.length) console.log(`ข้ามจังหวัดที่ไม่มีใน DB: ${dropped.join(", ")}`);
}

main()
  .catch((e) => {
    console.error("import failed:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
