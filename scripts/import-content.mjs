// One-off (idempotent) migration: load content/places + content/provinces
// markdown into the DB (Place / Province tables). Safe to re-run — upserts by
// slug. Markdown files stay as a backup. Run once per environment after the
// add_content_models migration:  node scripts/import-content.mjs
//
// `--provinces` (npm run import:provinces) imports provinces only — it still
// overwrites the whole province row from markdown.
//
// 🔴 LOCAL ONLY, both modes. The upsert's `update: row` replaces every column,
// and prod content is edited through the admin (places were first, province
// pages since) — an import there throws that work away with no backup. To move
// content to prod use the one-column syncs instead: `report:drift` to see what
// would be lost, then `sync:tours` / `sync:affiliate`. See DEPLOY.md.
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
const CONTENT = path.join(process.cwd(), "content");
const read = (dir) =>
  fs.readdirSync(path.join(CONTENT, dir))
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const g = matter(fs.readFileSync(path.join(CONTENT, dir, f), "utf8"));
      return { data: g.data, body: g.content.trim() };
    });

async function main() {
  const provincesOnly = process.argv.includes("--provinces");
  const provinces = read("provinces");
  const places = provincesOnly ? [] : read("places");

  let pv = 0;
  for (const { data, body } of provinces) {
    const row = {
      name: data.name,
      nameEn: data.nameEn,
      region: data.region,
      summary: data.summary,
      image: data.image,
      imageCredit: data.imageCredit ?? null,
      featured: Boolean(data.featured),
      highlights: data.highlights ?? null,
      bestTime: data.bestTime ?? null,
      gettingThere: data.gettingThere ?? null,
      localFood: data.localFood ?? null,
      tours: data.tours ?? null,
      body,
    };
    await prisma.province.upsert({
      where: { slug: data.slug },
      create: { slug: data.slug, ...row },
      update: row,
    });
    pv++;
  }

  let pl = 0;
  for (const { data, body } of places) {
    const row = {
      name: data.name,
      category: data.category,
      province: data.province,
      summary: data.summary,
      image: data.image,
      imageCredit: data.imageCredit ?? null,
      address: data.address ?? null,
      hours: data.hours ?? null,
      priceRange: data.priceRange ?? null,
      lat: data.lat ?? null,
      lng: data.lng ?? null,
      affiliate: data.affiliate ?? null,
      sponsored: data.sponsored ?? 0,
      body,
    };
    await prisma.place.upsert({
      where: { slug: data.slug },
      create: { slug: data.slug, ...row },
      update: row,
    });
    pl++;
  }

  const [pvTotal, plTotal] = await Promise.all([prisma.province.count(), prisma.place.count()]);
  console.log(`imported provinces=${pv} places=${pl} | DB now: provinces=${pvTotal} places=${plTotal}`);
}

main()
  .catch((e) => {
    console.error("import failed:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
