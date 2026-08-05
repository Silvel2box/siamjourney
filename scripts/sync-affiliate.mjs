// Push the affiliate field from content/places markdown into the DB — and
// nothing else.
//
// `import:content` would do it, but it upserts the whole row, and prod has more
// places than the markdown does because staff add them through the admin. A full
// import there overwrites their work. This touches one column, matched by slug,
// and leaves any place the markdown doesn't know about alone.
//
//   npm run sync:affiliate   (node scripts/sync-affiliate.mjs [--dry])
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
const dir = path.join(process.cwd(), "content", "places");

async function main() {
  let set = 0, cleared = 0, unchanged = 0, absent = 0;

  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
    const { data } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
    const wanted = data.affiliate ?? null;

    const row = await prisma.place.findUnique({
      where: { slug: data.slug },
      select: { affiliate: true },
    });
    if (!row) { absent++; continue; } // markdown-only place; nothing to update

    if (JSON.stringify(row.affiliate ?? null) === JSON.stringify(wanted)) {
      unchanged++;
      continue;
    }
    if (!dry) {
      await prisma.place.update({ where: { slug: data.slug }, data: { affiliate: wanted } });
    }
    wanted ? set++ : cleared++;
  }

  // Counted in JS on purpose. `count({ where: { affiliate: { not: DbNull } } })`
  // reports every row on MySQL — it does not filter a Json? column the way it
  // reads, and a summary line that overstates the result is worse than none.
  const rows = await prisma.place.findMany({ select: { affiliate: true } });
  const total = rows.length;
  const withAffiliate = rows.filter((r) => r.affiliate !== null).length;
  console.log(
    `${dry ? "[dry] " : ""}affiliate synced: ${set} set, ${cleared} cleared, ${unchanged} already correct` +
      (absent ? `, ${absent} not in DB` : "") +
      ` | DB now: places=${total}, with affiliate=${withAffiliate}`,
  );
}

main()
  .catch((e) => {
    console.error("sync failed:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
