// Authoring aid for body photos in guides. Two modes:
//
//   node scripts/guide-image-candidates.mjs [guide-slug]
//     list the images already in the repo for the places/provinces a guide
//     links to, with the credit read from their frontmatter — so no path or
//     photographer name is ever typed by hand (project verify rule #4).
//
//   node scripts/guide-image-candidates.mjs --verify
//     check every image used in a guide body: the file exists, it is landscape,
//     it is not the guide's own cover, and the credit in the caption matches the
//     frontmatter of the place/province that image belongs to.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import sharp from "sharp";

const ROOT = "E:/Doc-IT/claude-workspace/siamjourney";
const read = (dir) =>
  fs
    .readdirSync(path.join(ROOT, dir))
    .filter((f) => f.endsWith(".md"))
    .map((f) => matter.read(path.join(ROOT, dir, f)).data);

const places = new Map(read("content/places").map((d) => [d.slug, d]));
const provinces = new Map(read("content/provinces").map((d) => [d.slug, d]));

const creditOf = (d) => {
  const c = d.imageCredit;
  if (!c) return "(ไม่มีเครดิต)";
  const lead = c.source === "Pexels" ? "ภาพประกอบ" : "ภาพ";
  return `${lead}: ${c.author} · ${c.source}`;
};

const onDisk = (img) =>
  img && img.startsWith("/images/") && fs.existsSync(path.join(ROOT, "public", img));

const guideFiles = fs.readdirSync(path.join(ROOT, "content/guides")).sort();

if (process.argv[2] === "--verify") {
  const byImage = new Map();
  for (const d of [...places.values(), ...provinces.values()]) byImage.set(d.image, d);

  let used = 0;
  let bad = 0;
  const fail = (msg) => {
    console.log(`  FAIL ${msg}`);
    bad++;
  };

  for (const file of guideFiles) {
    const { content, data } = matter.read(path.join(ROOT, "content/guides", file));
    const imgs = [...content.matchAll(/!\[([^\]]*)\]\(([^\s)]+)(?:\s+"([^"]*)")?\)/g)];
    if (!imgs.length) continue;
    console.log(`\n=== ${data.slug} (${imgs.length} รูป)`);
    for (const [, alt, src, caption] of imgs) {
      used++;
      const owner = byImage.get(src);
      if (!onDisk(src)) fail(`${src} ไม่มีไฟล์ใน public/`);
      else {
        // .prose-body puts body photos in a 16:9 box, so a portrait shot is cut
        // down to a strip through its middle.
        const { width, height } = await sharp(path.join(ROOT, "public", src)).metadata();
        if (width / height < 1.2) fail(`${src} เป็นรูปแนวตั้ง ${width}x${height} — กรอบ 16:9 จะครอปจนเสียภาพ`);
      }
      if (src === data.image) fail(`${src} ซ้ำกับรูปปกของบทนี้`);
      if (!alt.trim()) fail(`${src} ไม่มี alt`);
      if (!owner) fail(`${src} ไม่รู้ว่าเป็นของสถานที่/จังหวัดไหน — เช็คเครดิตเองไม่ได้`);
      else if (!caption?.includes(creditOf(owner)))
        fail(`${src} เครดิตในคำบรรยายไม่ตรงกับ frontmatter\n       ควรมี: ${creditOf(owner)}\n       เจอ:   ${caption ?? "(ไม่มีคำบรรยาย)"}`);
      else console.log(`  OK   ${src} — ${creditOf(owner)}`);
    }
  }
  console.log(`\nรวม ${used} รูป · ผิด ${bad}`);
  process.exit(bad ? 1 : 0);
}

const only = process.argv[2];
for (const file of guideFiles) {
  const slug = file.replace(/\.md$/, "");
  if (only && slug !== only) continue;
  const { content, data } = matter.read(path.join(ROOT, "content/guides", file));

  const placeSlugs = [...content.matchAll(/\]\(\/place\/([a-z0-9-]+)\)/g)].map((m) => m[1]);
  const provSlugs = data.provinces ?? [];

  console.log(`\n=== ${slug} — ปก: ${data.image}`);
  for (const s of [...new Set(placeSlugs)]) {
    const d = places.get(s);
    if (!d) {
      console.log(`  !! /place/${s} ไม่มีใน content/places`);
      continue;
    }
    console.log(
      `  ${onDisk(d.image) ? "OK " : "-- "} ${d.image}  | ${d.name} | ${creditOf(d)}`,
    );
  }
  for (const s of provSlugs) {
    const d = provinces.get(s);
    if (!d) {
      console.log(`  !! จังหวัด ${s} ไม่มีใน content/provinces`);
      continue;
    }
    console.log(
      `  ${onDisk(d.image) ? "OK " : "-- "} ${d.image}  | จ.${d.name} | ${creditOf(d)}`,
    );
  }
}
