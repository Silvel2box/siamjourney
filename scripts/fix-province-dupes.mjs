// Fix: 65/77 province banners ended up byte-identical to their own attraction
// place image (province fetch ran after places were localized, so URL-based
// dedup couldn't see the place URLs). Re-fetch a DIFFERENT Wikimedia photo of
// the same landmark for each duplicated province, deduping by content hash
// against place images and other provinces. Updates image file + imageCredit.
//
//   node scripts/fix-province-dupes.mjs
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import matter from "gray-matter";

function loadEnv() {
  const p = path.join(process.cwd(), ".env");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnv();
const PEXELS = process.env.PEXELS_API_KEY;

const PROV_DIR = path.join(process.cwd(), "content", "provinces");
const PLACES_DIR = path.join(process.cwd(), "content", "places");
const PROV_OUT = path.join(process.cwd(), "public", "images", "provinces");
const PLACES_OUT = path.join(process.cwd(), "public", "images", "places");
const UA = "SiamJourney/1.0 (https://siam-journey.com; hello@siam-journey.com)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const stripTags = (s) => String(s || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
const md5 = (buf) => crypto.createHash("md5").update(buf).digest("hex");
const get = (url, opts = {}) => fetch(url, { ...opts, signal: AbortSignal.timeout(12000) });
const JUNK =
  /(flag[_ ]?map|locator|coat[_ ]?of[_ ]?arms|\bseal\b|\blogo\b|\bmap\b|satellite|\d+\.\d+[ewns]|specimen|dorsal|ventral|holotype|moth|butterfly|typhoon|flood|damage|earthquake|riot|protest|election)/i;

async function download(url) {
  let wait = 2000;
  for (let i = 0; i < 5; i++) {
    const res = await get(url, { headers: { "User-Agent": UA } });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if (res.status === 429) { await sleep(wait); wait *= 2; continue; }
    throw new Error(`HTTP ${res.status}`);
  }
  throw new Error("429 after retries");
}

// all valid Wikimedia candidates for a query (not just the first)
async function wikimediaCandidates(query) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&generator=search" +
    "&gsrnamespace=6&gsrlimit=20&prop=imageinfo&iiprop=url|extmetadata" +
    "&iiurlwidth=1600&format=json&origin=*&gsrsearch=" + encodeURIComponent(query);
  let j;
  try { const res = await get(url, { headers: { "User-Agent": UA } }); if (!res.ok) return []; j = await res.json(); }
  catch { return []; }
  const pages = j?.query?.pages; if (!pages) return [];
  const out = [];
  for (const it of Object.values(pages).sort((a, b) => (a.index || 0) - (b.index || 0))) {
    const info = it.imageinfo?.[0]; if (!info) continue;
    const orig = info.url || "";
    if (!/\.(jpe?g|png)$/i.test(orig) || JUNK.test(orig)) continue;
    const thumb = info.thumburl || orig;
    if (!/^https:\/\/upload\.wikimedia\.org\//.test(thumb)) continue;
    const license = stripTags(info.extmetadata?.LicenseShortName?.value);
    if (!license || /fair use|non-free|all rights reserved/i.test(license)) continue;
    const author = stripTags(info.extmetadata?.Artist?.value) || "Wikimedia contributor";
    if (/nasa/i.test(author)) continue;
    out.push({ url: thumb, credit: { author: author.slice(0, 80), source: "Wikimedia Commons", sourceUrl: info.descriptionurl || "", license } });
  }
  return out;
}

async function pexelsCandidates(query) {
  if (!PEXELS) return [];
  try {
    const res = await get(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=20&orientation=landscape`, { headers: { Authorization: PEXELS } });
    if (!res.ok) return [];
    return ((await res.json()).photos || []).map((p) => ({ url: p.src.large2x || p.src.large, credit: { author: p.photographer, source: "Pexels", sourceUrl: p.url }, pexels: true }));
  } catch { return []; }
}

// province -> attraction landmark query part
function descPart(slug, prov) {
  if (prov && slug.startsWith(prov + "-")) return slug.slice(prov.length + 1);
  const i = slug.indexOf("-"); return i >= 0 ? slug.slice(i + 1) : slug;
}
const landmark = {};
const placeHashes = new Set();
for (const f of fs.readdirSync(PLACES_DIR).filter((f) => f.endsWith(".md"))) {
  const d = matter(fs.readFileSync(path.join(PLACES_DIR, f), "utf8")).data;
  if (d.category === "attraction" && !landmark[d.province]) landmark[d.province] = descPart(d.slug, d.province).replace(/-/g, " ");
}
for (const f of fs.readdirSync(PLACES_OUT)) placeHashes.add(md5(fs.readFileSync(path.join(PLACES_OUT, f))));

const provHashes = new Set(); // provinces we keep/assign (avoid prov-prov dup)
let fixed = 0, kept = 0, failed = 0;

// deterministic order
const provFiles = fs.readdirSync(PROV_DIR).filter((f) => f.endsWith(".md")).sort();

// first pass: hash current province images; non-dup ones we keep
const dupWork = [];
for (const file of provFiles) {
  const g = matter(fs.readFileSync(path.join(PROV_DIR, file), "utf8"));
  const localPath = path.join(process.cwd(), "public", g.data.image.replace(/^\//, ""));
  const h = fs.existsSync(localPath) ? md5(fs.readFileSync(localPath)) : null;
  if (h && !placeHashes.has(h) && !provHashes.has(h)) { provHashes.add(h); kept++; }
  else dupWork.push({ file, g });
}

// second pass: re-fetch a unique photo for duplicated provinces
for (const { file, g } of dupWork) {
  const en = g.data.nameEn;
  const lm = landmark[g.data.slug];
  const queries = [lm ? `${lm} ${en} Thailand` : null, `${en} province Thailand`, `${en} Thailand landscape scenery`].filter(Boolean);
  let chosen = null;
  for (const q of queries) {
    const wiki = await wikimediaCandidates(q);
    const cands = wiki.length ? wiki : (q === queries[queries.length - 1] ? await pexelsCandidates(q) : []);
    for (const c of cands) {
      let buf;
      try { buf = await download(c.url); } catch { continue; }
      const h = md5(buf);
      if (placeHashes.has(h) || provHashes.has(h)) continue; // still a dup, try next
      chosen = { c, buf, h };
      break;
    }
    if (chosen) break;
  }
  if (!chosen) { failed++; console.log(`  ✗ ${g.data.slug} — no unique alternative`); continue; }
  const ext = chosen.c.pexels ? "jpg" : (/\.png$/i.test(chosen.c.url) ? "png" : "jpg");
  provHashes.add(chosen.h);
  if (chosen.c.pexels) {
    // keep Pexels hotlinked (don't self-host); remove any stale local file
    g.data.image = chosen.c.url;
  } else {
    fs.writeFileSync(path.join(PROV_OUT, `${g.data.slug}.${ext}`), chosen.buf);
    g.data.image = `/images/provinces/${g.data.slug}.${ext}`;
  }
  g.data.imageCredit = chosen.c.credit;
  fs.writeFileSync(path.join(PROV_DIR, file), matter.stringify(g.content, g.data));
  fixed++;
  console.log(`  ✓ ${g.data.slug} -> ${chosen.c.credit.source} by ${chosen.c.credit.author} (${(chosen.buf.length / 1024).toFixed(0)} KB)`);
  await sleep(300);
}

console.log(`\ndone: kept=${kept} fixed=${fixed} failed=${failed}`);
