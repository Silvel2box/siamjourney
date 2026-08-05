// One-off content edit: point the Klook buttons at real products, and take the
// button away everywhere Klook has nothing to sell.
//
// Every one of the 77 attraction places shipped with the same placeholder —
// affiliate.url = the bare Klook homepage — so a button promising "จองทัวร์บึงกาฬ"
// dropped the visitor on a generic front page. A homepage link earns nothing and
// costs trust, so a place either gets a product that matches it or no button.
//
// Rewrites the frontmatter as text rather than via gray-matter: re-serialising
// the YAML would reflow every file (quoting, key order, the folded `>-` blocks
// in imageCredit) and bury the real change in noise.
//
//   node scripts/apply-klook-links.mjs [--dry]
import fs from "node:fs";
import path from "node:path";

// Products taken from the affiliate dashboard export. The label names the actual
// product rather than the province: the visitor should know what they are about
// to book before they leave the site.
const PRODUCTS = {
  "bangkok-wat-phra-kaew": {
    label: "จองบัตรเข้าพระบรมมหาราชวัง (ไม่ต้องต่อคิว)",
    url: "https://www.klook.com/th/activity/129462-skip-the-line-grand-palace-and-emerald-buddha-ticket-in-bangkok",
  },
  "cr-wat-rong-khun": {
    label: "จองทัวร์วัดร่องขุ่นพร้อมไกด์",
    url: "https://www.klook.com/th/activity/49271-visit-white-temple-with-online-tour-guide-in-thailand",
  },
  "phetchabun-khao-kho": {
    label: "จองทัวร์เขาค้อ 3 วัน 2 คืน (ออกจากกรุงเทพฯ)",
    url: "https://www.klook.com/th/activity/12729-3d2n-khao-kho-private-tour-bangkok",
  },
  "kanchanaburi-river-kwai-bridge": {
    label: "จองทัวร์น้ำตกเอราวัณ + เขตรักษาพันธุ์ช้าง",
    url: "https://www.klook.com/th/activity/66910-elephant-sanctuary-erawan-waterfall-from-bangkok-fullday-tour",
  },
  "chon-buri-pattaya-beach": {
    label: "จองทัวร์ปางช้าง Living Green ชลบุรี",
    url: "https://www.klook.com/th/activity/144699-living-green-elephant-sanctuary-chonburi-from-bangkok-or-pattaya",
  },
};

// The block is always these three lines, in this order, at the top level.
const BLOCK = /^affiliate:\n {2}label: .*\n {2}url: .*\n/m;

const dry = process.argv.includes("--dry");
const dir = path.join(process.cwd(), "content", "places");

let linked = 0, removed = 0, skipped = 0;
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
  const full = path.join(dir, file);
  const text = fs.readFileSync(full, "utf8");
  if (!text.includes("klook.com")) continue; // Shopee places are a separate job

  const slug = file.replace(/\.md$/, "");
  if (!BLOCK.test(text)) {
    console.warn(`  ! ${slug}: affiliate block is not the expected shape — left alone`);
    skipped++;
    continue;
  }

  const product = PRODUCTS[slug];
  const next = product
    ? text.replace(BLOCK, `affiliate:\n  label: ${product.label}\n  url: '${product.url}'\n`)
    : text.replace(BLOCK, "");

  if (!dry) fs.writeFileSync(full, next);
  product ? linked++ : removed++;
}

const missing = Object.keys(PRODUCTS).filter(
  (s) => !fs.existsSync(path.join(dir, `${s}.md`)),
);
if (missing.length) console.warn("  ! product mapped to a slug that does not exist:", missing);

console.log(
  `${dry ? "[dry] " : ""}klook links: ${linked} pointed at a product, ${removed} buttons removed` +
    (skipped ? `, ${skipped} skipped` : ""),
);
