// One-shot cleanup for the AdSense "low value content" enforcement (2026-08-10).
//
// The site shipped 154 cafe/restaurant listings that were not real businesses —
// generic names, district-level addresses, invented opening hours and price
// ranges, stock photos presented as the venue, all of it fed into
// Restaurant/CafeOrCoffeeShop JSON-LD. Those are gone from the repo; this
// removes them from the DB too, and repairs what the surviving pages claim.
//
//   npm run cleanup:adsense:dry    show what would change, write nothing
//   npm run cleanup:adsense        do it
//
// 🔴 Plesk "Run script" cannot pass arguments — that is why :dry is its own npm
// script (same reason as sync:tours:dry). Run it BEFORE `build`: the pages read
// the DB at build time, so cleaning up afterwards leaves the old ISR snapshot
// cached for an hour.
//
// Idempotent and re-runnable. Unlike `import:content` this touches only the
// rows and columns listed below, so places the admin added by hand are safe.
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
const tag = dry ? "[dry] " : "";
const dir = path.join(process.cwd(), "content", "places");

// Deleted by slug, never by `where: { category: "cafe" }` — prod has places the
// admin created that the markdown never knew about, and a real cafe added there
// must survive this.
const FABRICATED_PLACES = [
  "amnat-charoen-cafe",
  "amnat-charoen-krua-isan",
  "ang-thong-riverside-cafe",
  "ang-thong-riverside-kitchen",
  "ayutthaya-lung-daeng-kung-pao",
  "ayutthaya-riverside-cafe",
  "bangkok-jay-fai",
  "bangkok-roast-coffee",
  "bueng-kan-cafe",
  "bueng-kan-krua-riverside",
  "buriram-krua-isan",
  "buriram-stadium-cafe",
  "chachoengsao-cafe",
  "chachoengsao-riverside-restaurant",
  "chai-nat-chaophraya-kitchen",
  "chai-nat-dam-view-cafe",
  "chaiyaphum-cafe",
  "chaiyaphum-krua-chaiyaphum",
  "chanthaburi-mushamuang",
  "chanthaburi-riverside-cafe",
  "chon-buri-cafe",
  "chon-buri-seafood",
  "chumphon-cafe",
  "chumphon-seafood",
  "cm-khao-soi",
  "cm-ristr8to",
  "cr-chivit-thamma-da",
  "cr-khao-soi-por-joy",
  "kalasin-krua-kalasin",
  "kalasin-ponglang-cafe",
  "kamphaeng-phet-chakangrao-noodle",
  "kamphaeng-phet-riverside-cafe",
  "kanchanaburi-krua-rim-kwae",
  "kanchanaburi-meena-cafe",
  "khon-kaen-coffee-loft",
  "khon-kaen-lap-restaurant",
  "krabi-cafe",
  "krabi-seafood",
  "loei-chiang-khan-cafe",
  "loei-krua-isan",
  "lopburi-country-kitchen",
  "lopburi-sunflower-cafe",
  "lp-horse-carriage-cafe",
  "lp-huanglae-kitchen",
  "lpn-lamyai-noodle",
  "lpn-longan-garden-cafe",
  "maha-sarakham-cafe",
  "maha-sarakham-krua-isan",
  "mhs-coffee-in-love-pai",
  "mhs-tai-kitchen",
  "mukdahan-cafe",
  "mukdahan-riverside-restaurant",
  "nakhon-nayok-garden-cafe",
  "nakhon-nayok-riverside-kitchen",
  "nakhon-pathom-garden-cafe",
  "nakhon-pathom-mu-yang",
  "nakhon-phanom-mekong-restaurant",
  "nakhon-phanom-riverside-cafe",
  "nakhon-ratchasima-cafe",
  "nakhon-ratchasima-mee-korat",
  "nakhon-sawan-paknampho-noodle",
  "nakhon-sawan-riverside-cafe",
  "nakhon-si-thammarat-cafe",
  "nakhon-si-thammarat-khanomjeen",
  "nan-huean-restaurant",
  "nan-pua-cafe",
  "narathiwat-cafe",
  "narathiwat-khaoyam",
  "nong-bua-lamphu-cafe",
  "nong-bua-lamphu-krua-isan",
  "nong-khai-mekong-cafe",
  "nong-khai-naem-nueang",
  "nonthaburi-koh-kret-cafe",
  "nonthaburi-riverside-restaurant",
  "pathum-thani-boat-noodle",
  "pathum-thani-canal-cafe",
  "pattani-cafe",
  "pattani-restaurant",
  "phang-nga-cafe",
  "phang-nga-seafood",
  "phatthalung-cafe",
  "phatthalung-restaurant",
  "phetchabun-khaokho-kitchen",
  "phetchabun-pino-latte-cafe",
  "phetchaburi-cafe",
  "phetchaburi-khao-chae",
  "phichit-chalawan-kitchen",
  "phichit-riverside-cafe",
  "phitsanulok-hoi-kha-noodle",
  "phitsanulok-nan-river-cafe",
  "phuket-cafe",
  "phuket-hokkien",
  "pr-kad-sam-wai",
  "pr-teak-house-cafe",
  "prachin-buri-cafe",
  "prachin-buri-restaurant",
  "prachuap-khiri-khan-cafe",
  "prachuap-khiri-khan-seafood",
  "py-lakeside-cafe",
  "py-lakeside-restaurant",
  "ranong-cafe",
  "ranong-seafood",
  "ratchaburi-cafe",
  "ratchaburi-krua-rim-nam",
  "rayong-cafe",
  "rayong-seafood",
  "roi-et-cafe",
  "roi-et-krua-isan",
  "sa-kaeo-cafe",
  "sa-kaeo-restaurant",
  "sakon-nakhon-cafe",
  "sakon-nakhon-phon-yang-kham-beef",
  "samut-prakan-bangkrachao-cafe",
  "samut-prakan-paknam-seafood",
  "samut-sakhon-mahachai-seafood",
  "samut-sakhon-riverside-cafe",
  "samut-songkhram-amphawa-cafe",
  "samut-songkhram-maeklong-kitchen",
  "saraburi-farm-cafe",
  "saraburi-muaklek-kitchen",
  "satun-cafe",
  "satun-restaurant",
  "sing-buri-pla-chon-mae-la",
  "sing-buri-riverside-cafe",
  "sisaket-cafe",
  "sisaket-krua-isan",
  "songkhla-cafe",
  "songkhla-restaurant",
  "sukhothai-heritage-cafe",
  "sukhothai-noodle",
  "suphan-buri-fish-noodle",
  "suphan-buri-garden-cafe",
  "surat-thani-cafe",
  "surat-thani-restaurant",
  "surin-cafe",
  "surin-krua-isan",
  "tak-krua-khun-toi",
  "tak-teak-cafe",
  "trang-cafe",
  "trang-timsum",
  "trat-cafe",
  "trat-seafood",
  "ubon-ratchathani-cafe",
  "ubon-ratchathani-krua-isan",
  "udon-thani-cafe",
  "udon-thani-krua-isan",
  "ut-khao-pan-phak",
  "ut-laplae-cafe",
  "uthai-thani-old-town-cafe",
  "uthai-thani-raft-restaurant",
  "yala-cafe",
  "yala-chicken",
  "yasothon-cafe",
  "yasothon-krua-isan",
];

// Seeded from scripts/seed-hotels.mjs (now deleted) to keep /hotel from looking
// empty during the first AdSense review. They are real properties described from
// public knowledge, but the photos are stock and the team never replaced them
// with its own listings — so they read as filler. /hotel 404s while empty.
const SEEDED_HOTELS = [
  "mandarin-oriental-bangkok",
  "peninsula-bangkok",
  "four-seasons-chiang-mai",
  "anantara-golden-triangle",
  "katathani-phuket",
  "rayavadee-krabi",
  "four-seasons-koh-samui",
  "centara-grand-hua-hin",
  "hilton-pattaya",
  "sala-ayutthaya",
  "float-house-river-kwai",
];

async function main() {
  // 1. Drop the fabricated listings.
  const doomed = await prisma.place.findMany({
    where: { slug: { in: FABRICATED_PLACES } },
    select: { slug: true },
  });
  if (!dry && doomed.length > 0) {
    await prisma.place.deleteMany({ where: { slug: { in: doomed.map((p) => p.slug) } } });
  }
  console.log(`${tag}places deleted: ${doomed.length} (of ${FABRICATED_PLACES.length} listed)`);

  // 2. Drop the seeded hotels.
  const hotels = await prisma.hotel.findMany({
    where: { slug: { in: SEEDED_HOTELS } },
    select: { slug: true },
  });
  if (!dry && hotels.length > 0) {
    await prisma.hotel.deleteMany({ where: { slug: { in: hotels.map((h) => h.slug) } } });
  }
  console.log(`${tag}hotels deleted: ${hotels.length} (of ${SEEDED_HOTELS.length} listed)`);

  // 3 + 4. Walk the markdown that survived and repair the rows it maps to.
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  let bodySet = 0, fieldsCleared = 0, unchanged = 0, absent = 0;

  for (const file of files) {
    const { data, content } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
    const body = content.trim();

    const row = await prisma.place.findUnique({
      where: { slug: data.slug },
      select: { body: true, address: true, hours: true, priceRange: true },
    });
    if (!row) { absent++; continue; } // markdown-only place; nothing to update

    const update = {};
    if (row.body !== body) update.body = body;

    // OTOP entries are products — ผ้าไหม, โรตีสายไหม, พลอย — not shopfronts. The
    // address/hours/priceRange they carried were invented, and `address` was
    // going straight into JSON-LD. The markdown no longer has these keys, so
    // anything still in the DB is stale.
    for (const key of ["address", "hours", "priceRange"]) {
      if (data[key] === undefined && row[key] !== null) update[key] = null;
    }

    if (Object.keys(update).length === 0) { unchanged++; continue; }
    if (!dry) await prisma.place.update({ where: { slug: data.slug }, data: update });
    if (update.body !== undefined) bodySet++;
    if (update.address !== undefined || update.hours !== undefined || update.priceRange !== undefined) {
      fieldsCleared++;
    }
  }

  const [placesLeft, hotelsLeft] = await Promise.all([
    prisma.place.count(),
    prisma.hotel.count(),
  ]);
  console.log(`${tag}body rewritten: ${bodySet} | address/hours/priceRange cleared: ${fieldsCleared}`);
  console.log(`${tag}unchanged: ${unchanged} | in markdown but not in DB: ${absent}`);
  console.log(`${tag}DB ${dry ? "still" : "now"}: places=${placesLeft} hotels=${hotelsLeft}`);
  if (dry) console.log("\n[dry] nothing was written. Run `npm run cleanup:adsense` to apply.");
}

main()
  .catch((e) => {
    console.error("cleanup failed:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
