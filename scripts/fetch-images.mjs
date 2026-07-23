// One-off: replace the shared stock placeholders in content/places/*.md with
// per-place images.
//   attraction  -> real photo from Wikimedia Commons (records CC credit)
//   others       -> unique Pexels stock, grouped by query (1 API call / query)
// Writes `image:` and `imageCredit:` back into each file's frontmatter.
//
//   node scripts/fetch-images.mjs            # apply to all
//   DRY=1 LIMIT=6 node scripts/fetch-images.mjs   # preview first 6, no writes
//
// Reads PEXELS_API_KEY from .env (never printed). Wikimedia needs no key.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// --- env ---
function loadEnv() {
  const p = path.join(process.cwd(), ".env");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}
loadEnv();
const PEXELS = process.env.PEXELS_API_KEY;
if (!PEXELS) {
  console.error("Missing PEXELS_API_KEY in .env");
  process.exit(1);
}
const DRY = process.env.DRY === "1";
const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : Infinity;

const PLACES_DIR = path.join(process.cwd(), "content", "places");
const PROV_DIR = path.join(process.cwd(), "content", "provinces");
const UA = "SiamJourney/1.0 (https://siam-journey.com; hello@siam-journey.com)";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const stripTags = (s) =>
  String(s || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

// province slug -> frontmatter (for English name)
const provinces = {};
for (const f of fs.readdirSync(PROV_DIR).filter((f) => f.endsWith(".md"))) {
  const { data } = matter(fs.readFileSync(path.join(PROV_DIR, f), "utf8"));
  provinces[data.slug] = data;
}

// descriptive part of a slug = slug minus its province prefix
function descPart(slug, provinceSlug) {
  if (provinceSlug && slug.startsWith(provinceSlug + "-")) {
    return slug.slice(provinceSlug.length + 1);
  }
  const i = slug.indexOf("-");
  return i >= 0 ? slug.slice(i + 1) : slug;
}

// generic tokens that add no visual meaning to a stock search
const NOISE = new Set([
  "cafe", "coffee", "restaurant", "krua", "kitchen", "riverside", "seafood",
  "house", "shop", "the", "ban", "rim", "nam", "kwae", "lakeside", "garden",
]);

function otopQuery(desc) {
  const d = desc.toLowerCase();
  if (/silk/.test(d)) return "thai silk fabric weaving";
  if (/cotton/.test(d)) return "thai cotton textile handwoven";
  if (/(ceramic|pottery|jar|celadon)/.test(d)) return "thai ceramic pottery craft";
  if (/benjarong/.test(d)) return "benjarong porcelain thailand";
  if (/(krajood|basket|weav|wicker)/.test(d)) return "thai woven basket handicraft";
  if (/(gem|niello|silver|jewel)/.test(d)) return "thai handmade jewelry silver";
  if (/(cloth|textile|mudmee|teen-jok|mor-hom|praewa|hom)/.test(d))
    return "thai handwoven textile pattern";
  if (/doll/.test(d)) return "thai handicraft souvenir";
  return "thai handicraft otop souvenir";
}

// known Thai dish keywords (romanized) — only these steer the restaurant query;
// anything else (place/proper names) collapses to a generic, well-stocked query.
const DISH = new Set([
  "khao", "soi", "seafood", "noodle", "mee", "lap", "laab", "som", "tam",
  "somtam", "tom", "yum", "curry", "kaeng", "kung", "pao", "roti", "sai", "mai",
  "timsum", "dimsum", "khanomjeen", "khanom", "moo", "gai", "satay", "boat",
  "korat", "lamyai", "ngob", "chae", "banana", "mango", "pineapple", "khaoyam",
  "mushamuang", "kungpao",
]);

// build a Pexels search query for a non-attraction place
function pexelsQuery(place) {
  const tokens = descPart(place.slug, place.province).toLowerCase().split("-");
  if (place.category === "cafe") return "cozy coffee shop cafe thailand";
  if (place.category === "otop") return otopQuery(tokens.join(" "));
  // restaurant: keep only recognised dish words, else generic thai food
  const dish = tokens.filter((t) => DISH.has(t));
  return dish.length ? `${dish.join(" ")} thai food` : "thai food dish traditional";
}

// generic, well-stocked fallback query per category (used when a group's photos
// run out) so every place still gets a unique image
const GENERIC = {
  restaurant: "thai food dish traditional cuisine",
  cafe: "coffee shop cafe interior cozy",
  otop: "thai handicraft souvenir market",
};

// --- Wikimedia Commons (attractions) ---
async function wikimedia(query) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&generator=search" +
    "&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|extmetadata" +
    "&iiurlwidth=1600&format=json&origin=*&gsrsearch=" +
    encodeURIComponent(query);
  let j;
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) return null;
    j = await res.json();
  } catch {
    return null;
  }
  const pages = j?.query?.pages;
  if (!pages) return null;
  const items = Object.values(pages).sort((a, b) => (a.index || 0) - (b.index || 0));
  for (const it of items) {
    const info = it.imageinfo?.[0];
    if (!info) continue;
    if (!/\.(jpe?g|png)$/i.test(info.url || "")) continue; // skip svg/pdf/audio
    const thumb = info.thumburl || info.url;
    if (!thumb || !/^https:\/\/upload\.wikimedia\.org\//.test(thumb)) continue;
    const license = stripTags(info.extmetadata?.LicenseShortName?.value);
    if (!license || /fair use|non-free|all rights reserved/i.test(license)) continue;
    const author =
      stripTags(info.extmetadata?.Artist?.value) || "Wikimedia contributor";
    return {
      url: thumb,
      credit: {
        author: author.slice(0, 80),
        source: "Wikimedia Commons",
        sourceUrl: info.descriptionurl || "",
        license,
      },
    };
  }
  return null;
}

// --- Pexels (grouped by query, paginated) ---
const poolCache = new Map();
async function pexels(query, want) {
  if (poolCache.has(query)) return poolCache.get(query);
  const need = Math.min(200, want + 10);
  const out = [];
  for (let page = 1; page <= 4 && out.length < need; page++) {
    const per = Math.min(80, need - out.length + 5);
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${per}&page=${page}&orientation=landscape`;
    let photos;
    try {
      const res = await fetch(url, { headers: { Authorization: PEXELS } });
      if (!res.ok) break;
      photos = (await res.json()).photos || [];
    } catch {
      break;
    }
    for (const p of photos) {
      out.push({
        url: p.src.large2x || p.src.large,
        credit: { author: p.photographer, source: "Pexels", sourceUrl: p.url },
      });
    }
    if (photos.length < per) break; // no more pages
    await sleep(80);
  }
  poolCache.set(query, out);
  return out;
}

// first candidate whose URL isn't already used site-wide
function takeUnused(cands) {
  for (const c of cands) if (!used.has(c.url)) return c;
  return null;
}

// --- load places ---
const files = fs.readdirSync(PLACES_DIR).filter((f) => f.endsWith(".md"));
const places = files.map((f) => {
  const g = matter(fs.readFileSync(path.join(PLACES_DIR, f), "utf8"));
  return { file: f, data: g.data, body: g.content };
});

const used = new Set(); // dedup image URLs across the whole site
let processed = 0;
let okReal = 0;
let okStock = 0;
let failed = 0;

function apply(p, image, credit) {
  used.add(image);
  p.data.image = image;
  if (credit) p.data.imageCredit = credit;
  else delete p.data.imageCredit;
  const out = matter.stringify(p.body, p.data);
  if (!DRY) fs.writeFileSync(path.join(PLACES_DIR, p.file), out);
  processed++;
}

// 1) attractions -> Wikimedia (per place), fallback Pexels
const attractions = places.filter((p) => p.data.category === "attraction");
for (const p of attractions) {
  if (processed >= LIMIT) break;
  const prov = provinces[p.data.province];
  const landmark = descPart(p.data.slug, p.data.province).replace(/-/g, " ");
  const query = `${landmark} ${prov?.nameEn || ""} Thailand`.trim();
  let pick = await wikimedia(query);
  if (pick && used.has(pick.url)) pick = null; // avoid dup, fall through
  let via = "wikimedia";
  if (!pick) {
    const cands = await pexels(`${landmark} ${prov?.nameEn || ""} thailand landmark`, 5);
    pick = cands.find((c) => !used.has(c.url)) || cands[0] || null;
    via = "pexels-fallback";
  }
  if (!pick) {
    failed++;
    console.log(`  ✗ [attraction] ${p.file} — no image for "${query}"`);
    continue;
  }
  if (via === "wikimedia") okReal++;
  else okStock++;
  console.log(
    `  ✓ [${via}] ${p.file}\n      q="${query}"\n      ${pick.url}\n      by ${pick.credit.author}${pick.credit.license ? " (" + pick.credit.license + ")" : ""}`,
  );
  apply(p, pick.url, pick.credit);
  await sleep(150); // be polite to the Commons API
}

// 2) others -> group by query, one Pexels call per group
const others = places.filter((p) => p.data.category !== "attraction");
const groups = new Map();
for (const p of others) {
  const q = pexelsQuery(p.data);
  if (!groups.has(q)) groups.set(q, []);
  groups.get(q).push(p);
}
console.log(`\n[pexels] ${others.length} places in ${groups.size} query groups`);
for (const [q, members] of groups) {
  if (processed >= LIMIT) break;
  const cands = await pexels(q, members.length);
  for (const p of members) {
    if (processed >= LIMIT) break;
    let pick = takeUnused(cands);
    if (!pick) {
      // group exhausted -> pull from the category's generic pool
      const gp = await pexels(GENERIC[p.data.category] || GENERIC.restaurant, 90);
      pick = takeUnused(gp);
    }
    if (!pick) {
      failed++;
      console.log(`  ✗ [pexels] ${p.file} — no unique photo for "${q}"`);
      continue;
    }
    okStock++;
    console.log(`  ✓ [pexels] ${p.file}  q="${q}"  ${pick.url}`);
    apply(p, pick.url, pick.credit);
  }
  await sleep(120);
}

console.log(
  `\n${DRY ? "[DRY] " : ""}done: ${processed} written · real(Wikimedia)=${okReal} · stock(Pexels)=${okStock} · failed=${failed} · unique URLs=${used.size}`,
);
if (DRY && places[0]) {
  console.log("\n--- sample frontmatter (first place) ---");
  const s = places.find((p) => p.data.imageCredit) || places[0];
  console.log(matter.stringify("", s.data).slice(0, 500));
}
