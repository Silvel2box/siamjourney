// Push the tours field from content/provinces markdown into the DB — and
// nothing else.
//
// `import:provinces` would do it, but it upserts the whole province row, and
// the province pages have been edited through the admin since the last import
// (hero image, highlights, body). A full import there overwrites that work.
// This touches one column, matched by slug — the same deal `sync-affiliate.mjs`
// makes for places.
//
//   npm run sync:tours   (node scripts/sync-tours.mjs [--dry])
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
const dry = process.argv.includes("--dry");
const dir = path.join(process.cwd(), "content", "provinces");

async function main() {
  let set = 0, cleared = 0, unchanged = 0, absent = 0;

  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
    const { data } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
    const wanted = data.tours ?? null;

    const row = await prisma.province.findUnique({
      where: { slug: data.slug },
      select: { tours: true },
    });
    if (!row) { absent++; continue; } // markdown-only province; nothing to update

    if (JSON.stringify(row.tours ?? null) === JSON.stringify(wanted)) {
      unchanged++;
      continue;
    }
    if (!dry) {
      await prisma.province.update({ where: { slug: data.slug }, data: { tours: wanted } });
    }
    wanted ? set++ : cleared++;
  }

  // Counted in JS on purpose — same reason as sync-affiliate: a `where` on a
  // Json? column does not filter on MySQL the way it reads.
  const rows = await prisma.province.findMany({ select: { tours: true } });
  const withTours = rows.filter((r) => r.tours !== null).length;
  console.log(
    `${dry ? "[dry] " : ""}tours synced: ${set} set, ${cleared} cleared, ${unchanged} already correct` +
      (absent ? `, ${absent} not in DB` : "") +
      ` | DB now: provinces=${rows.length}, with tours=${withTours}`,
  );
}

main()
  .catch((e) => {
    console.error("sync failed:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
