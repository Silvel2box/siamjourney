// Download the Wikimedia Commons photos (places + provinces) into public/ so we
// don't hotlink upload.wikimedia.org — Commons rate-limits hotlinking (429).
// Pexels images stay hotlinked (their CDN allows it). Rewrites each affected
// file's `image:` to /images/<collection>/<slug>.<ext>; keeps imageCredit.
//
//   node scripts/localize-wikimedia.mjs
//
// Idempotent: files already localized (image starts with /images/) are skipped.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const COLLECTIONS = ["places", "provinces"];
const UA = "SiamJourney/1.0 (https://siam-journey.com; hello@siam-journey.com)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// fetch with retry/backoff on 429
async function download(url) {
  let wait = 2000;
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if (res.status === 429) {
      await sleep(wait);
      wait *= 2;
      continue;
    }
    throw new Error(`HTTP ${res.status}`);
  }
  throw new Error("429 after retries");
}

let done = 0;
let skipped = 0;
const failed = [];

for (const col of COLLECTIONS) {
  const dir = path.join(process.cwd(), "content", col);
  const outDir = path.join(process.cwd(), "public", "images", col);
  if (!fs.existsSync(dir)) continue;
  fs.mkdirSync(outDir, { recursive: true });
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
    const full = path.join(dir, file);
    const g = matter(fs.readFileSync(full, "utf8"));
    if (g.data.imageCredit?.source !== "Wikimedia Commons") continue;
    if (String(g.data.image).startsWith("/images/")) {
      skipped++;
      continue;
    }
    const slug = g.data.slug;
    const ext = /\.png$/i.test(g.data.image) ? "png" : "jpg";
    const rel = `/images/${col}/${slug}.${ext}`;
    try {
      const buf = await download(g.data.image);
      fs.writeFileSync(path.join(outDir, `${slug}.${ext}`), buf);
      g.data.image = rel;
      fs.writeFileSync(full, matter.stringify(g.content, g.data));
      done++;
      console.log(`  ✓ ${col}/${slug} (${(buf.length / 1024).toFixed(0)} KB)`);
    } catch (e) {
      failed.push({ slug: `${col}/${slug}`, err: e.message });
      console.log(`  ✗ ${col}/${slug} — ${e.message}`);
    }
    await sleep(700); // stay under Commons' rate limit
  }
}

console.log(`\ndone: localized=${done} skipped=${skipped} failed=${failed.length}`);
if (failed.length) {
  console.log("FAILED (still hotlinked, keep wikimedia remotePattern):");
  failed.forEach((f) => console.log("  " + f.slug + " — " + f.err));
}
