// Replace the photo of one place/province with a Wikimedia Commons image —
// after looking at the candidates.
//
//   node scripts/replace-image.mjs --find "Wat Phra That Doi Suthep" [--n 10] [--out DIR]
//   node scripts/replace-image.mjs --apply places/cm-doi-suthep --pick 3 --as cm-doi-suthep-2 [--dry]
//
// Why this exists: the bulk fetchers picked a moth for Doi Suthep and a pit
// viper for Phang Nga, because Commons ranks "species named after the place"
// right next to the place itself and a filename cannot be trusted. --find
// downloads every candidate so it can be opened and looked at; --apply then
// takes the one that was chosen by index, so the credit is copied from the API
// response and never typed by hand.
//
// --apply is deliberately narrow: one file, a new filename (the old path stays
// cached for a year by the image optimizer, so reusing it would keep serving the
// wrong photo), a content-hash check against every image already in public/, and
// a refusal to delete the old file if anything else still points at it.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import matter from "gray-matter";
import sharp from "sharp";

const ROOT = process.cwd();
const UA = "SiamJourney/1.0 (https://siam-journey.com; hello@siam-journey.com)";
const MAX_W = 1500; // project standard: 1500px q82
const QUALITY = 82;

const argv = process.argv.slice(2);
const flag = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? undefined : argv[i + 1];
};
const has = (name) => argv.includes(`--${name}`);

const outDir = flag("out") || path.join(os.tmpdir(), "siamjourney-image-candidates");
const manifest = path.join(outDir, "candidates.json");

// Same junk filter as scripts/fetch-province-images.mjs — kept as a *warning*
// here, not a filter, because the eye is the real check.
const JUNK =
  /(flag[_ ]?map|locator|coat[_ ]?of[_ ]?arms|\bseal\b|\blogo\b|\bmap\b|satellite|\d+\.\d+[ewns]|specimen|dorsal|ventral|holotype|moth|butterfly|viper|snake|beetle|spider|typhoon|flood|damage|earthquake|riot|protest|election)/i;

const stripTags = (s) =>
  String(s || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

// Commons now appends ?utm_source=…&utm_content=… to every imageinfo URL, so the
// extension is no longer at the end of the string.
const bare = (u) => String(u || "").split("?")[0];

async function download(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function find(query, n) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&generator=search" +
    `&gsrnamespace=6&gsrlimit=${n}&prop=imageinfo&iiprop=url|size|extmetadata` +
    "&iiurlwidth=1600&format=json&origin=*&gsrsearch=" +
    encodeURIComponent(query);
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Commons API HTTP ${res.status}`);
  const pages = (await res.json())?.query?.pages;
  if (!pages) return [];

  const out = [];
  for (const it of Object.values(pages).sort((a, b) => (a.index || 0) - (b.index || 0))) {
    const info = it.imageinfo?.[0];
    if (!info) continue;
    if (!/\.(jpe?g|png)$/i.test(bare(info.url))) continue; // svg maps/seals
    const license = stripTags(info.extmetadata?.LicenseShortName?.value);
    if (!license || /fair use|non-free|all rights reserved/i.test(license)) continue;
    out.push({
      title: it.title,
      thumb: bare(info.thumburl || info.url),
      width: info.width,
      height: info.height,
      credit: {
        author: stripTags(info.extmetadata?.Artist?.value).slice(0, 80) || "Wikimedia contributor",
        source: "Wikimedia Commons",
        sourceUrl: bare(info.descriptionurl),
        license,
      },
    });
  }
  return out;
}

async function runFind() {
  const query = flag("find");
  const n = Number(flag("n") || 10);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const cands = await find(query, n);
  if (!cands.length) {
    console.log(`ไม่พบรูปที่ใช้ได้สำหรับ "${query}"`);
    return;
  }

  console.log(`\n"${query}" → ${cands.length} รูป · โหลดไว้ที่ ${outDir}\n`);
  for (let i = 0; i < cands.length; i++) {
    const c = cands[i];
    const file = path.join(outDir, `${String(i + 1).padStart(2, "0")}.jpg`);
    try {
      fs.writeFileSync(file, await download(c.thumb));
      c.file = file;
    } catch (e) {
      c.error = e.message;
    }
    const ratio = (c.width / c.height).toFixed(2);
    const flags = [
      c.width / c.height < 1.2 ? "แนวตั้ง/จตุรัส" : null,
      JUNK.test(c.title) ? "ชื่อไฟล์น่าสงสัย" : null,
      c.error ? `โหลดไม่ได้: ${c.error}` : null,
    ].filter(Boolean);
    console.log(
      `${String(i + 1).padStart(2)}. ${c.width}x${c.height} (${ratio})` +
        `${flags.length ? "  ⚠ " + flags.join(" · ") : ""}\n` +
        `    ${c.title}\n` +
        `    ${c.credit.author} · ${c.credit.license}\n` +
        `    ${c.file || "-"}`,
    );
  }
  fs.writeFileSync(manifest, JSON.stringify({ query, cands }, null, 2));
  console.log(`\nเปิดดูไฟล์ข้างบนก่อนเลือก แล้ว:\n  node scripts/replace-image.mjs --apply <places|provinces>/<slug> --pick <n> --as <ชื่อไฟล์ใหม่>`);
}

function hashesInPublic() {
  const dir = path.join(ROOT, "public", "images");
  const map = new Map();
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(jpe?g|png)$/i.test(e.name)) {
        map.set(crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex"), p);
      }
    }
  };
  if (fs.existsSync(dir)) walk(dir);
  return map;
}

function referencedElsewhere(imgPath, exceptFile) {
  const hits = [];
  for (const col of ["places", "provinces", "guides"]) {
    const dir = path.join(ROOT, "content", col);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
      const full = path.join(dir, f);
      if (full === exceptFile) continue;
      if (fs.readFileSync(full, "utf8").includes(imgPath)) hits.push(`content/${col}/${f}`);
    }
  }
  return hits;
}

async function runApply() {
  const target = flag("apply"); // places/cm-doi-suthep
  const pick = Number(flag("pick"));
  const as = flag("as");
  const dry = has("dry");
  const [col, slug] = String(target).split("/");
  if (!["places", "provinces"].includes(col) || !slug || !pick || !as) {
    throw new Error("ใช้: --apply <places|provinces>/<slug> --pick <n> --as <ชื่อไฟล์ใหม่>");
  }

  const { cands } = JSON.parse(fs.readFileSync(manifest, "utf8"));
  const c = cands[pick - 1];
  if (!c) throw new Error(`--pick ${pick} ไม่มีใน ${manifest}`);

  const mdFile = path.join(ROOT, "content", col, `${slug}.md`);
  const g = matter(fs.readFileSync(mdFile, "utf8"));
  const oldImage = String(g.data.image || "");
  const rel = `/images/${col}/${as}.jpg`;
  const dest = path.join(ROOT, "public", rel.slice(1).replace(/\//g, path.sep));

  const buf = await sharp(await download(c.thumb))
    .resize({ width: MAX_W, withoutEnlargement: true })
    .jpeg({ quality: QUALITY })
    .toBuffer();
  const meta = await sharp(buf).metadata();
  if (meta.width / meta.height < 1.2) {
    throw new Error(`รูปนี้ ${meta.width}x${meta.height} = แนวตั้ง ใช้ในเนื้อบทความไม่ได้`);
  }

  const hash = crypto.createHash("sha256").update(buf).digest("hex");
  const dup = hashesInPublic().get(hash);
  if (dup && path.resolve(dup) !== path.resolve(dest)) {
    throw new Error(`รูปนี้ซ้ำกับ ${path.relative(ROOT, dup)} (hash เดียวกัน)`);
  }

  g.data.image = rel;
  g.data.imageCredit = c.credit;

  const stillUsed = oldImage.startsWith("/images/") ? referencedElsewhere(oldImage, mdFile) : [];

  if (!dry) {
    fs.writeFileSync(dest, buf);
    fs.writeFileSync(mdFile, matter.stringify(g.content, g.data));
    if (oldImage.startsWith("/images/") && !stillUsed.length) {
      const oldFile = path.join(ROOT, "public", oldImage.slice(1).replace(/\//g, path.sep));
      if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
    }
  }

  console.log(
    `${dry ? "[dry] " : ""}${col}/${slug}\n` +
      `  ${oldImage}\n  → ${rel}  ${meta.width}x${meta.height} ${(buf.length / 1024) | 0}KB\n` +
      `  เครดิต: ${c.credit.author} · ${c.credit.license}\n  ${c.credit.sourceUrl}`,
  );
  if (stillUsed.length) {
    console.log(`  ⚠ ไม่ลบไฟล์เก่า — ยังถูกอ้างที่: ${stillUsed.join(", ")}`);
  }
}

const main = has("find") ? runFind : has("apply") ? runApply : null;
if (!main) {
  console.log("ใช้: --find \"<query>\" [--n 10] | --apply <col>/<slug> --pick <n> --as <ชื่อใหม่> [--dry]");
  process.exit(1);
}
main().catch((e) => {
  console.error("ล้มเหลว:", e.message);
  process.exit(1);
});
