// Upgrade province banners whose image is too small / portrait for a full-width
// hero (width < 1000 or portrait). Re-fetch a landscape Wikimedia photo of the
// landmark (>=1000px, unique by content hash); fall back to a Pexels scenic shot
// (hotlinked) which is always landscape. Updates image file/URL + imageCredit.
//
//   node scripts/upgrade-small-provinces.mjs
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import matter from "gray-matter";
import sharp from "sharp";

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
const UA = "SiamJourney/1.0 (https://siam-journey.com; hello@siam-journey.com)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const stripTags = (s) => String(s || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
const md5 = (b) => crypto.createHash("md5").update(b).digest("hex");
const get = (u, o = {}) => fetch(u, { ...o, signal: AbortSignal.timeout(12000) });
const JUNK = /(flag[_ ]?map|locator|coat[_ ]?of[_ ]?arms|\bseal\b|\blogo\b|\bmap\b|satellite|\d+\.\d+[ewns]|specimen|dorsal|ventral|holotype|moth|butterfly|typhoon|flood|damage|earthquake|riot|protest|election)/i;

async function download(url) {
  let wait = 2000;
  for (let i = 0; i < 5; i++) {
    const res = await get(url, { headers: { "User-Agent": UA } });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if (res.status === 429) { await sleep(wait); wait *= 2; continue; }
    throw new Error(`HTTP ${res.status}`);
  }
  throw new Error("429");
}
async function wikimediaCandidates(query) {
  const url = "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrlimit=20&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1600&format=json&origin=*&gsrsearch=" + encodeURIComponent(query);
  let j; try { const r = await get(url, { headers: { "User-Agent": UA } }); if (!r.ok) return []; j = await r.json(); } catch { return []; }
  const pages = j?.query?.pages; if (!pages) return [];
  const out = [];
  for (const it of Object.values(pages).sort((a, b) => (a.index || 0) - (b.index || 0))) {
    const info = it.imageinfo?.[0]; if (!info) continue;
    const orig = info.url || ""; if (!/\.(jpe?g|png)$/i.test(orig) || JUNK.test(orig)) continue;
    const thumb = info.thumburl || orig; if (!/^https:\/\/upload\.wikimedia\.org\//.test(thumb)) continue;
    const license = stripTags(info.extmetadata?.LicenseShortName?.value);
    if (!license || /fair use|non-free|all rights reserved/i.test(license)) continue;
    const author = stripTags(info.extmetadata?.Artist?.value) || "Wikimedia contributor";
    if (/nasa/i.test(author)) continue;
    out.push({ url: thumb, credit: { author: author.slice(0, 80), source: "Wikimedia Commons", sourceUrl: info.descriptionurl || "", license } });
  }
  return out;
}
async function pexelsPick(query, used) {
  if (!PEXELS) return null;
  try {
    const r = await get(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=20&orientation=landscape`, { headers: { Authorization: PEXELS } });
    if (!r.ok) return null;
    for (const p of (await r.json()).photos || []) {
      const u = p.src.large2x || p.src.large;
      if (!used.has(u)) return { url: u, credit: { author: p.photographer, source: "Pexels", sourceUrl: p.url }, remote: true };
    }
  } catch { /* */ }
  return null;
}

function descPart(slug, prov) { if (prov && slug.startsWith(prov + "-")) return slug.slice(prov.length + 1); const i = slug.indexOf("-"); return i >= 0 ? slug.slice(i + 1) : slug; }
const landmark = {};
for (const f of fs.readdirSync(PLACES_DIR).filter((f) => f.endsWith(".md"))) {
  const d = matter(fs.readFileSync(path.join(PLACES_DIR, f), "utf8")).data;
  if (d.category === "attraction" && !landmark[d.province]) landmark[d.province] = descPart(d.slug, d.province).replace(/-/g, " ");
}
// global content-hash set of all local images (avoid re-introducing dupes)
const hashes = new Set();
for (const dir of ["places", "provinces"]) {
  const base = path.join(process.cwd(), "public", "images", dir);
  for (const f of fs.readdirSync(base)) hashes.add(md5(fs.readFileSync(path.join(base, f))));
}
const usedRemote = new Set();

let upgraded = 0, kept = 0, failed = 0;
for (const file of fs.readdirSync(PROV_DIR).filter((f) => f.endsWith(".md"))) {
  const full = path.join(PROV_DIR, file);
  const g = matter(fs.readFileSync(full, "utf8"));
  const img = g.data.image;
  if (!img.startsWith("/images/")) { kept++; continue; } // already remote/pexels
  const local = path.join(process.cwd(), "public", img.replace(/^\//, ""));
  const meta = await sharp(local).metadata();
  if (meta.width >= 1000 && meta.width >= meta.height) { kept++; continue; }
  // needs upgrade — drop this file's hash from the avoid-set (we're replacing it)
  hashes.delete(md5(fs.readFileSync(local)));
  const en = g.data.nameEn, lm = landmark[g.data.slug];
  const queries = [lm ? `${lm} ${en} Thailand` : null, `${en} province Thailand`].filter(Boolean);
  let chosen = null;
  for (const q of queries) {
    for (const c of await wikimediaCandidates(q)) {
      let buf; try { buf = await download(c.url); } catch { continue; }
      const h = md5(buf); if (hashes.has(h)) continue;
      const m = await sharp(buf).metadata();
      if (m.width < 1000 || m.width < m.height) continue; // require landscape ≥1000
      chosen = { c, buf, h }; break;
    }
    if (chosen) break;
  }
  const oldExt = path.extname(local);
  if (chosen) {
    const ext = /\.png$/i.test(chosen.c.url) ? ".png" : ".jpg";
    if (oldExt !== ext) fs.unlinkSync(local); // remove stale ext
    fs.writeFileSync(path.join(PROV_OUT, `${g.data.slug}${ext}`), chosen.buf);
    g.data.image = `/images/provinces/${g.data.slug}${ext}`;
    g.data.imageCredit = chosen.c.credit;
    hashes.add(chosen.h);
    console.log(`  ✓ ${g.data.slug} -> Wikimedia landscape by ${chosen.c.credit.author}`);
  } else {
    const px = await pexelsPick(`${en} Thailand landscape scenery`, usedRemote);
    if (!px) { failed++; console.log(`  ✗ ${g.data.slug} — no landscape found`); continue; }
    fs.unlinkSync(local); // remove the small local file; going remote
    usedRemote.add(px.url);
    g.data.image = px.url;
    g.data.imageCredit = px.credit;
    console.log(`  ✓ ${g.data.slug} -> Pexels scenic by ${px.credit.author} (hotlink)`);
  }
  fs.writeFileSync(full, matter.stringify(g.content, g.data));
  upgraded++;
  await sleep(250);
}
console.log(`\ndone: upgraded=${upgraded} kept=${kept} failed=${failed}`);
