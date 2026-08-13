// Push `image` + `imageCredit` from markdown into the DB — for a named list of
// slugs only.
//
//   npm run sync:images       (node scripts/sync-images.mjs [--dry])
//   npm run sync:images:dry
//
// `import:content` / `import:provinces` would do it, but they upsert whole rows
// and prod has content the markdown does not know about, so they are local-only.
// The one-column syncs (sync:tours, sync:affiliate) walk every markdown file;
// photos cannot work that way — staff replace photos through the admin, and those
// uploads are newer than the markdown. So this script carries an explicit list of
// the slugs whose photo actually changed in the repo, the same rule
// adsense-cleanup.mjs follows, and touches nothing else.
//
// Add to the list when a photo is replaced in the repo; it is a record of what
// this deploy is meant to change, not a permanent registry.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { PrismaClient } from "@prisma/client";

// 2026-08-13 — wrong photos taken off the live site (a moth for Doi Suthep, a pit
// viper for Phang Nga) plus four upgrades that gave the guides a body photo.
const SLUGS = {
  places: [
    "cm-doi-suthep",
    "bangkok-wat-phra-kaew",
    "nonthaburi-koh-kret",
    "cm-bosang-umbrella",
    "ayutthaya-roti-sai-mai",
  ],
  provinces: ["phang-nga"],
};

// Prisma CLI loads .env; a plain node script does not.
for (const line of fs.existsSync(".env") ? fs.readFileSync(".env", "utf8").split("\n") : []) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const prisma = new PrismaClient();
const dry = process.argv.includes("--dry");

async function syncCollection(dir, model, slugs) {
  let set = 0, unchanged = 0, absent = 0;

  for (const slug of slugs) {
    const file = path.join(process.cwd(), "content", dir, `${slug}.md`);
    if (!fs.existsSync(file)) throw new Error(`ไม่มีไฟล์ content/${dir}/${slug}.md`);
    const { data } = matter(fs.readFileSync(file, "utf8"));
    const wanted = { image: data.image, imageCredit: data.imageCredit ?? null };

    const row = await model.findUnique({
      where: { slug },
      select: { image: true, imageCredit: true },
    });
    if (!row) { absent++; continue; } // markdown-only; nothing to update

    if (
      row.image === wanted.image &&
      JSON.stringify(row.imageCredit ?? null) === JSON.stringify(wanted.imageCredit)
    ) {
      unchanged++;
      continue;
    }
    if (!dry) await model.update({ where: { slug }, data: wanted });
    set++;
    console.log(`  ${dry ? "[dry] " : ""}${dir}/${slug} → ${wanted.image}`);
  }

  console.log(
    `${dir}: ${set} updated, ${unchanged} already correct` + (absent ? `, ${absent} not in DB` : ""),
  );
  return set;
}

async function main() {
  const a = await syncCollection("places", prisma.place, SLUGS.places);
  const b = await syncCollection("provinces", prisma.province, SLUGS.provinces);
  console.log(`${dry ? "[dry] " : ""}images synced: ${a + b} row(s) changed`);
}

main()
  .catch((e) => {
    console.error("sync failed:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
