// Read-only: shows what a deploy would overwrite. Compares the DB against the
// markdown for exactly the columns the two writers touch — the whole province
// row `import:provinces` upserts, and the `affiliate` column `sync:affiliate`
// pushes onto places. Writes nothing, ever.
//
// Run this on prod BEFORE any sync/import: rows listed here were edited through
// the admin (or are stale in markdown), and `import:provinces` would silently
// throw those edits away.
//
//   npm run report:drift
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

// CRLF vs LF is a git checkout artifact, not an edit — and object key order is
// a serialisation artifact. Neither is drift, so normalise both away; otherwise
// the report cries wolf and stops being read.
const norm = (v) => (typeof v === "string" ? v.replace(/\r\n/g, "\n") : v ?? null);
const stable = (v) =>
  JSON.stringify(norm(v), (_k, val) =>
    val && typeof val === "object" && !Array.isArray(val)
      ? Object.fromEntries(Object.keys(val).sort().map((k) => [k, val[k]]))
      : val,
  );
const differs = (a, b) => stable(a) !== stable(b);

const show = (v) => {
  const s = (typeof v === "string" ? v : JSON.stringify(v ?? null)) ?? "null";
  const one = s.replace(/\s+/g, " ");
  return one.length > 90 ? `${one.slice(0, 90)}…` : one;
};

async function main() {
  // Mirrors the row import-content.mjs writes — keep the two in step.
  const provinceRow = ({ data, body }) => ({
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
  });

  const provinces = read("provinces");
  const dbProvinces = await prisma.province.findMany();
  const byProvince = new Map(dbProvinces.map((p) => [p.slug, p]));

  console.log("=== PROVINCES — `import:provinces` would overwrite these ===");
  let pvDrift = 0;
  for (const entry of provinces) {
    const db = byProvince.get(entry.data.slug);
    if (!db) { console.log(`${entry.data.slug} — not in DB (import would CREATE it)`); continue; }
    const md = provinceRow(entry);
    const fields = Object.keys(md).filter((k) => differs(db[k], md[k]));
    if (!fields.length) continue;
    pvDrift++;
    console.log(`\n${entry.data.slug} (${db.name}) — ${fields.length} field(s)`);
    for (const k of fields) {
      console.log(`  ${k}`);
      console.log(`    DB : ${show(db[k])}`);
      console.log(`    MD : ${show(md[k])}`);
    }
  }
  const mdProvinceSlugs = new Set(provinces.map((p) => p.data.slug));
  const pvDbOnly = dbProvinces.filter((p) => !mdProvinceSlugs.has(p.slug)).map((p) => p.slug);
  console.log(
    `\n${provinces.length} markdown provinces checked · ${pvDrift} differ from DB` +
      (pvDbOnly.length ? ` · ${pvDbOnly.length} in DB only: ${pvDbOnly.join(", ")}` : ""),
  );

  // sync:affiliate only ever writes this one column, so that is all it can lose.
  const places = read("places");
  const dbPlaces = await prisma.place.findMany({ select: { slug: true, name: true, affiliate: true } });
  const byPlace = new Map(dbPlaces.map((p) => [p.slug, p]));

  console.log("\n=== PLACES — `sync:affiliate` would change these (affiliate column only) ===");
  let plDrift = 0, plAbsent = 0;
  for (const { data } of places) {
    const db = byPlace.get(data.slug);
    if (!db) { plAbsent++; continue; }
    const wanted = data.affiliate ?? null;
    if (!differs(db.affiliate, wanted)) continue;
    plDrift++;
    console.log(`\n${data.slug} (${db.name})`);
    console.log(`  DB : ${show(db.affiliate)}`);
    console.log(`  MD : ${show(wanted)}`);
  }
  const mdPlaceSlugs = new Set(places.map((p) => p.data.slug));
  const plDbOnly = dbPlaces.filter((p) => !mdPlaceSlugs.has(p.slug)).map((p) => p.slug);
  console.log(
    `\n${places.length} markdown places checked · ${plDrift} differ from DB` +
      (plAbsent ? ` · ${plAbsent} not in DB` : "") +
      ` · ${plDbOnly.length} in DB only (untouched by sync:affiliate)` +
      (plDbOnly.length ? `: ${plDbOnly.join(", ")}` : ""),
  );
  console.log("\nNothing was written.");
}

main()
  .catch((e) => {
    console.error("report failed:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
