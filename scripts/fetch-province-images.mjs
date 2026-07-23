// One-off: replace the shared Unsplash placeholders in content/provinces/*.md
// with a real Wikimedia Commons photo of each province's iconic landmark
// (derived from the province's own attraction place, e.g. chiang-rai ->
// "wat rong khun"), Pexels scenery as fallback. Writes `image:` + `imageCredit:`
// and dedups against images already used by places so the site stays unique.
// Wikimedia images are localized separately (scripts/localize-wikimedia.mjs).
//
//   DRY=1 node scripts/fetch-province-images.mjs   # preview, no writes
//   node scripts/fetch-province-images.mjs         # apply
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

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

const PROV_DIR = path.join(process.cwd(), "content", "provinces");
const PLACES_DIR = path.join(process.cwd(), "content", "places");
const UA = "SiamJourney/1.0 (https://siam-journey.com; hello@siam-journey.com)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const stripTags = (s) =>
  String(s || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
const get = (url, opts = {}) =>
  fetch(url, { ...opts, signal: AbortSignal.timeout(10000) });

// filenames that are clearly not scenery
const JUNK =
  /(flag[_ ]?map|locator|coat[_ ]?of[_ ]?arms|\bseal\b|\blogo\b|\bmap\b|satellite|\d+\.\d+[ewns]|specimen|dorsal|ventral|holotype|moth|butterfly|typhoon|flood|damage|earthquake|riot|protest|election)/i;

// load places: build dedup set + province -> attraction landmark query
const used = new Set();
const landmark = {};
function descPart(slug, provinceSlug) {
  if (provinceSlug && slug.startsWith(provinceSlug + "-")) {
    return slug.slice(provinceSlug.length + 1);
  }
  const i = slug.indexOf("-");
  return i >= 0 ? slug.slice(i + 1) : slug;
}
for (const f of fs.readdirSync(PLACES_DIR).filter((f) => f.endsWith(".md"))) {
  const d = matter(fs.readFileSync(path.join(PLACES_DIR, f), "utf8")).data;
  if (d.image) used.add(d.image);
  if (d.category === "attraction" && !landmark[d.province]) {
    landmark[d.province] = descPart(d.slug, d.province).replace(/-/g, " ");
  }
}

async function wikimedia(query) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&generator=search" +
    "&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url|extmetadata" +
    "&iiurlwidth=1600&format=json&origin=*&gsrsearch=" +
    encodeURIComponent(query);
  let j;
  try {
    const res = await get(url, { headers: { "User-Agent": UA } });
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
    const orig = info.url || "";
    if (!/\.(jpe?g|png)$/i.test(orig)) continue; // skip svg maps/seals
    if (JUNK.test(orig)) continue;
    const thumb = info.thumburl || orig;
    if (!thumb || !/^https:\/\/upload\.wikimedia\.org\//.test(thumb)) continue;
    if (used.has(thumb)) continue;
    const license = stripTags(info.extmetadata?.LicenseShortName?.value);
    if (!license || /fair use|non-free|all rights reserved/i.test(license)) continue;
    const author =
      stripTags(info.extmetadata?.Artist?.value) || "Wikimedia contributor";
    if (/nasa/i.test(author)) continue; // satellite imagery
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

async function pexels(query) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=20&orientation=landscape`;
  try {
    const res = await get(url, { headers: { Authorization: PEXELS } });
    if (!res.ok) return [];
    return ((await res.json()).photos || []).map((p) => ({
      url: p.src.large2x || p.src.large,
      credit: { author: p.photographer, source: "Pexels", sourceUrl: p.url },
    }));
  } catch {
    return [];
  }
}

const files = fs.readdirSync(PROV_DIR).filter((f) => f.endsWith(".md"));
let real = 0;
let stock = 0;
let failed = 0;
let n = 0;

for (const file of files) {
  if (n >= LIMIT) break;
  const full = path.join(PROV_DIR, file);
  const g = matter(fs.readFileSync(full, "utf8"));
  const en = g.data.nameEn;
  const lm = landmark[g.data.slug];
  // try the province's iconic landmark first, then the bare province name
  const queries = [lm ? `${lm} ${en} Thailand` : null, `${en} province Thailand`].filter(Boolean);
  let pick = null;
  let via = "wikimedia";
  for (const q of queries) {
    pick = await wikimedia(q);
    if (pick) break;
  }
  if (!pick) {
    const cands = await pexels(`${en} Thailand landscape scenery`);
    pick = cands.find((c) => !used.has(c.url)) || null;
    via = "pexels-fallback";
  }
  if (!pick) {
    failed++;
    console.log(`  ✗ ${file} — no image (landmark="${lm || "-"}")`);
    continue;
  }
  used.add(pick.url);
  via === "wikimedia" ? real++ : stock++;
  console.log(
    `  ✓ [${via}] ${g.data.slug}  (lm="${lm || "-"}")\n      ${pick.url}\n      by ${pick.credit.author}${pick.credit.license ? " (" + pick.credit.license + ")" : ""}`,
  );
  g.data.image = pick.url;
  g.data.imageCredit = pick.credit;
  if (!DRY) fs.writeFileSync(full, matter.stringify(g.content, g.data));
  n++;
  await sleep(150);
}

console.log(
  `\n${DRY ? "[DRY] " : ""}done: ${n} · real(Wikimedia)=${real} · stock(Pexels)=${stock} · failed=${failed}`,
);
