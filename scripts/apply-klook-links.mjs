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
    image: "https://res.klook.com/image/upload/activities/fm2hokjdojtimgu4rebd.jpg",
  },
  "cr-wat-rong-khun": {
    label: "จองทัวร์วัดร่องขุ่นพร้อมไกด์",
    url: "https://www.klook.com/th/activity/49271-visit-white-temple-with-online-tour-guide-in-thailand",
    image: "https://res.klook.com/image/upload/activities/bwjdqiv3hyvcnqsblqws.jpg",
  },
  "phetchabun-khao-kho": {
    label: "จองทัวร์เขาค้อ 3 วัน 2 คืน (ออกจากกรุงเทพฯ)",
    url: "https://www.klook.com/th/activity/12729-3d2n-khao-kho-private-tour-bangkok",
    image: "https://res.klook.com/image/upload/activities/bxmrgsexmwofwi3b2ikr.jpg",
  },
  "kanchanaburi-river-kwai-bridge": {
    label: "จองทัวร์น้ำตกเอราวัณ + เขตรักษาพันธุ์ช้าง",
    url: "https://www.klook.com/th/activity/66910-elephant-sanctuary-erawan-waterfall-from-bangkok-fullday-tour",
    image: "https://res.klook.com/image/upload/activities/qistubfsahv6wigdieyq.jpg",
  },
  "chon-buri-pattaya-beach": {
    label: "จองทัวร์ปางช้าง Living Green ชลบุรี",
    url: "https://www.klook.com/th/activity/144699-living-green-elephant-sanctuary-chonburi-from-bangkok-or-pattaya",
    image: "https://res.klook.com/image/upload/activities/grlbyaqlg3b0y6gljigp.jpg",
  },
  "phuket-patong": {
    label: "จองทัวร์เกาะพีพี + อ่าวมาหยา จากภูเก็ต",
    url: "https://www.klook.com/th/activity/138073-phuket-phi-phi-island-day-tour-by-speedboat-catamaran",
    image: "https://res.klook.com/image/upload/activities/bgzcwbtakhy5lm0lzzft.jpg",
  },
  "phang-nga-jamesbond": {
    label: "จองทัวร์เกาะตะปูเต็มวัน (ออกจากภูเก็ต)",
    url: "https://www.klook.com/th/activity/3227-james-bond-day-tour-big-boat-longtail-speedboat",
    image: "https://res.klook.com/image/upload/activities/py3fvxtvbxpubsmolb0t.jpg",
  },
  // The Krabi export replaced a stand-in: this page's own summary calls Railay
  // สวรรค์ของนักปีนผา, and the climbing school is on that beach — where the
  // placeholder was a Phi Phi tour boarding in another province entirely.
  "krabi-railay": {
    label: "จองคอร์สปีนผาที่หาดไร่เลย์",
    url: "https://www.klook.com/th/activity/25995-rock-climbing-courses-railay-beach",
    image: "https://res.klook.com/image/upload/activities/rbwje4keirzoxgnquq8a.jpg",
  },
};

// label + url, then the partner's product photo when their feed ships one.
const BLOCK = /^affiliate:\n {2}label: .*\n {2}url: .*\n( {2}image: .*\n)?/m;

const block = (p) =>
  `affiliate:\n  label: ${p.label}\n  url: '${p.url}'\n` +
  (p.image ? `  image: '${p.image}'\n` : "");

// Re-runnable in both directions: a later export can hand a product to a place
// whose button this script already took away, so it has to be able to put the
// block back. Slots in ahead of imageCredit, where it sat originally.
function withBlock(text, product) {
  if (BLOCK.test(text)) return text.replace(BLOCK, block(product));
  if (/^imageCredit:/m.test(text)) {
    return text.replace(/^imageCredit:/m, `${block(product)}imageCredit:`);
  }
  return text.replace(/^---\n([\s\S]*?)^---\n/m, (_, fm) => `---\n${fm}${block(product)}---\n`);
}

const dry = process.argv.includes("--dry");
const dir = path.join(process.cwd(), "content", "places");

let linked = 0, removed = 0, untouched = 0;
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
  const full = path.join(dir, file);
  const text = fs.readFileSync(full, "utf8");
  if (text.includes("shopee")) continue; // Shopee places are a separate job

  const slug = file.replace(/\.md$/, "");
  const product = PRODUCTS[slug];
  const next = product ? withBlock(text, product) : text.replace(BLOCK, "");

  if (next === text) { untouched++; continue; }
  if (!dry) fs.writeFileSync(full, next);
  product ? linked++ : removed++;
}

const missing = Object.keys(PRODUCTS).filter(
  (s) => !fs.existsSync(path.join(dir, `${s}.md`)),
);
if (missing.length) console.warn("  ! product mapped to a slug that does not exist:", missing);

console.log(
  `${dry ? "[dry] " : ""}klook links: ${linked} written, ${removed} buttons removed, ${untouched} already correct`,
);
