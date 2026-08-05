// Fill the `tours` block on province markdown from the affiliate exports.
//
// A place carries one partner link; a province page is the top of the funnel and
// can carry a few. The exports hand over far more products than one button per
// province could ever use — 132 rows across three files against 8 links — and
// this is where the rest of them go.
//
// Same text-editing approach as apply-klook-links: re-serialising the YAML would
// reflow every file and bury the change. Re-runnable in both directions.
//
//   node scripts/apply-province-tours.mjs [--dry]
import fs from "node:fs";
import path from "node:path";

const k = (id, slug) => `https://www.klook.com/th/activity/${id}-${slug}`;
const img = (h) => `https://res.klook.com/image/upload/activities/${h}.jpg`;

// Picked by reading the product URLs, not the export's City column, which names
// where a tour departs rather than where it goes. Chosen to spread across what a
// visitor to that province would actually do rather than stacking near-identical
// island tours.
const TOURS = {
  krabi: [
    { label: "คอร์สปีนผาที่หาดไร่เลย์", url: k(25995, "rock-climbing-courses-railay-beach"), image: img("rbwje4keirzoxgnquq8a") },
    { label: "ทัวร์เกาะห้องเต็มวัน โดยเรือสปีดโบ๊ท", url: k(1434, "koh-hong-day-tour-krabi-speedboat-longtail-boat-krabi"), image: img("pir0km8v3iiy8yju3tij") },
    { label: "ทัวร์ 4 เกาะกระบี่เต็มวัน", url: k(1433, "4-islands-day-tour-krabi"), image: img("wgcw9te4eamfoanb9lm5") },
    { label: "ทัวร์วัดถ้ำเสือ + สระมรกต", url: k(1454, "tiger-cave-emerald-pool-jungle-tour-krabi"), image: img("vvangr8rw3fhsliy8y1d") },
    { label: "พายเรือคายัคป่าโกงกางอ่าวท่าเลน", url: k(29776, "krabi-mangrove-kayak-tour"), image: img("ustoklsotoxscug4wnrz") },
    { label: "ทัวร์ 7 เกาะยามพระอาทิตย์ตก + บุฟเฟต์", url: k(77264, "join-7-islands-sunset-tour-bbq-dinner-krabi-bioluminescent-plankton"), image: img("yyisqciippyexdymd06k") },
  ],
  phuket: [
    { label: "ทัวร์เกาะพีพี + อ่าวมาหยา โดยสปีดคาตามารัน", url: k(138073, "phuket-phi-phi-island-day-tour-by-speedboat-catamaran"), image: img("bgzcwbtakhy5lm0lzzft") },
    { label: "บัตรเข้าสวนน้ำ Andamanda Phuket", url: k(71806, "andamanda-phuket-admission-phuket"), image: img("zxkrd2cmgvdqr7cmvont") },
    { label: "บัตรเข้าชมสยามนิรมิตภูเก็ต", url: k(295, "siam-niramit-phuket"), image: img("b6jclpddsea2jkbx27kd") },
    { label: "ซิปไลน์ที่ Hanuman World", url: k(3732, "zipline-adventure-hanuman-world-phuket-skywalk"), image: img("nylogkeodoztxkxxgc8w") },
    { label: "บัตรมวยไทยสนามมวยป่าตอง", url: k(80747, "patong-boxing-stadium-ticket-phuket"), image: img("ydi9bzzrmin0dlmtwi2m") },
    { label: "ศูนย์อนุรักษ์ช้างภูเก็ต ครึ่งวัน", url: k(3595, "half-day-visit-elephant-jungle-sanctuary-phuket"), image: img("tmhwuj0zyx7sgukyvxfr") },
  ],
  bangkok: [
    { label: "บัตรพระบรมมหาราชวัง + วัดพระแก้ว (ไม่ต้องต่อคิว)", url: k(129462, "skip-the-line-grand-palace-and-emerald-buddha-ticket-in-bangkok"), image: img("fm2hokjdojtimgu4rebd") },
    { label: "บัตรมวยไทยเวทีราชดำเนิน", url: k(92826, "muay-thai-rajadamnern-stadium-bangkok"), image: img("grlpyy9aulohrcwhym1z") },
    { label: "ล่องเรือชมแม่น้ำเจ้าพระยา", url: k(10538, "chao-phraya-white-orchid-river-cruise-bangkok"), image: img("zax7udiixb5zpdz6ipdk") },
    { label: "คลาสทำอาหารไทยที่สีลม", url: k(3965, "silom-thai-cooking-school-bangkok"), image: img("zzc28jy9fcvsbowkohdk") },
    { label: "บัตรเข้าชมมาดามทุสโซ กรุงเทพฯ", url: k(77176, "madame-tussaudmadame-tussauds-bangkok-thailands-bangkok-thailand"), image: img("z0trfwzwm8jdvwunhloq") },
    { label: "ทัวร์ปั่นจักรยานรอบกรุงเทพฯ", url: k(8633, "bangkok-cultural-tour-bangkok"), image: img("hi7wzrituzgsaktvuwqu") },
  ],
};

// tours is the last key in the frontmatter, so it runs to the closing fence.
const BLOCK = /^tours:\n(?: {2}- .*\n(?: {4}.*\n)*)+/m;

const toYaml = (list) =>
  "tours:\n" +
  list
    .map(
      (t) =>
        `  - label: ${t.label}\n    url: '${t.url}'\n` +
        (t.image ? `    image: '${t.image}'\n` : ""),
    )
    .join("");

const dry = process.argv.includes("--dry");
const dir = path.join(process.cwd(), "content", "provinces");

let written = 0, cleared = 0, untouched = 0;
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
  const full = path.join(dir, file);
  const text = fs.readFileSync(full, "utf8");
  const slug = file.replace(/\.md$/, "");
  const list = TOURS[slug];

  let next;
  if (list) {
    const yaml = toYaml(list);
    next = BLOCK.test(text)
      ? text.replace(BLOCK, yaml)
      : text.replace(/^---\n([\s\S]*?)^---\n/m, (_, fm) => `---\n${fm}${yaml}---\n`);
  } else {
    next = text.replace(BLOCK, "");
  }

  if (next === text) { untouched++; continue; }
  if (!dry) fs.writeFileSync(full, next);
  list ? written++ : cleared++;
}

const missing = Object.keys(TOURS).filter((s) => !fs.existsSync(path.join(dir, `${s}.md`)));
if (missing.length) console.warn("  ! tours mapped to a province that does not exist:", missing);

console.log(
  `${dry ? "[dry] " : ""}province tours: ${written} written, ${cleared} cleared, ${untouched} unchanged`,
);
