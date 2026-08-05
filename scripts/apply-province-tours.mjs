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
  "chiang-mai": [
    { label: "ทัวร์ดอยอินทนนท์เต็มวัน", url: k(17443, "doi-inthanon-park-tour-chiang-mai"), image: img("jmwmaoq4q0q8wbfovcxn") },
    { label: "บัตรเข้าเชียงใหม่ไนท์ซาฟารี", url: k(1112, "night-safari-park-chiang-mai"), image: img("fh1kpaqwx9w98xp30hwf") },
    { label: "ขันโตกดินเนอร์ + การแสดงล้านนา", url: k(1180, "khantoke-dinner-cultural-show-chiang-mai"), image: img("c6llzjhyog4wsek350at") },
    { label: "Elephant Jungle Sanctuary เชียงใหม่", url: k(3631, "elephant-jungle-sanctuary-chiang-mai"), image: img("nksgoxtoqwu0glyj5g6f") },
    { label: "คลาสทำอาหารไทย + ทัวร์ตลาดสด", url: k(10239, "thai-akha-kitchen-cooking-class-local-market-tour-chiang-mai"), image: img("jhnm0nwy4un06cti8n3e") },
    { label: "ล่องแก่งแม่น้ำแม่แตง", url: k(1962, "rafting-8adventures-chiang-mai"), image: img("crsrl2gi2h3vvbljwme3") },
  ],
  "prachuap-khiri-khan": [
    { label: "บัตรเข้าสวนน้ำวานา นาวา หัวหิน", url: k(3871, "vana-nava-waterpark-hua-hin"), image: img("gul8thajn1spks2beec7") },
    { label: "บัตรเข้าสวนน้ำแบล็คเมาท์เทน", url: k(3970, "black-mountain-water-park-day-pass-hua-hin"), image: img("hjfeasz2jeaibh8ox550") },
    { label: "ทัวร์น้ำตกป่าละอู + ไร่องุ่นมอนซูนแวลลีย์", url: k(4134, "pa-la-u-waterfall-monsoon-valley-vineyards-tour-hua-hin"), image: img("mlkzifhqsox3c2ymcfie") },
    { label: "บัตรมวยไทยเวที Antza หัวหิน", url: k(122428, "antza-muay-thai-stadium-huahin"), image: img("z1oyitwome1rny1kmmto") },
    { label: "ซิปไลน์ Tree Top Adventure หัวหิน", url: k(44174, "zipline-experience-hua-hin"), image: img("eiuunucskvlwj5f3tvah") },
    { label: "ทัวร์ธรรมชาติเขาสามร้อยยอด", url: k(77299, "khao-sam-roi-yod-nature-tour-experience-start-from-hua-hin"), image: img("krizmulrprorggg18sgr") },
  ],
  "chiang-rai": [
    { label: "ทัวร์วัดร่องขุ่น + วัดร่องเสือเต้น + บ้านดำ", url: k(66954, "chiangrai-white-blue-temple-blackhouse-daytour"), image: img("i68munyq225hn0fz8v8v") },
    { label: "ทัวร์สามเหลี่ยมทองคำ + หมู่บ้านกะเหรี่ยงคอยาว", url: k(118527, "chiang-rai-day-trip-with-golden-triangle-and-long-neck-tribe"), image: img("amfelpglt54t6i8uh7gz") },
    { label: "ทัวร์ดอยตุง + ดอยแม่สลอง", url: k(36304, "doi-tung-doi-mea-salong-day-tour"), image: img("ekgqxo5jsdxaydeaokrl") },
    { label: "ทัวร์เดินป่าเชียงราย 1 วัน", url: k(35997, "chiang-rai-trekking-day-tour"), image: img("mcanoddzwksjnwatkwre") },
    { label: "ทัวร์จุดถ่ายรูปเด็ดเชียงราย", url: k(75512, "chiang-rai-instagrammable-places-day-tour-by-ak-travel"), image: img("y2y5ruazknyzig0anrvw") },
    { label: "ทัวร์เชียงรายเต็มวันแบบเลือกเส้นทางเอง", url: k(67411, "diy-chiangrai-fullday-tour"), image: img("ia3rnqfu2xq8cpxg8aip") },
  ],
  "chon-buri": [
    { label: "บัตรเข้าชมปราสาทสัจธรรม", url: k(1109, "the-sanctuary-of-truth-pattaya"), image: img("d2990de4-%E8%8A%AD%E6%8F%90%E9%9B%85%E7%9C%9F%E7%90%86%E5%AF%BA-KLOOK%E5%AE%A2%E8%B7%AF") },
    { label: "บัตรเข้าสวนน้ำรามายณะ", url: k(2322, "ramayana-water-park-pattaya"), image: img("tdpv3hbftfsowp6z5opx") },
    { label: "บัตรเข้าสวนน้ำโคลัมเบียพิคเจอร์ส อควาเวิร์ส", url: k(85772, "columbia-pictures-aquaverse-admission-ticket"), image: img("gkhzt7soog5732sz5g9r") },
    { label: "บัตรเข้า Underwater World พัทยา", url: k(1106, "underwater-world-pattaya"), image: img("82e136c5-Underwater-World-Pattaya") },
    { label: "บัตรแม็กซ์มวยไทย พัทยา", url: k(80757, "max-muay-thai-pattaya"), image: img("nq3kn6jhfibv2svctq9s") },
    { label: "ปางช้าง Elephant Jungle Sanctuary พัทยา", url: k(8053, "elephant-jungle-sanctuary-pattaya-experience"), image: img("amkbaveek2vfh5f6mgms") },
  ],
  "songkhla": [
    { label: "บัตรเข้า Bouncetopia เซ็นทรัลหาดใหญ่", url: k(137530, "bouncetopia-ticket-at-central-hatyai"), image: img("houa9itnnzf31efxahca") },
    { label: "พิพิธภัณฑ์มายากล หาดใหญ่", url: k(41392, "magic-museum-hatyai"), image: img("zhcqxhcs4gt3fwtmsj5s") },
  ],
  "phang-nga": [
    { label: "ทัวร์ดำน้ำตื้นหมู่เกาะสิมิลัน", url: k(89618, "join-similan-islands-snorkel-tour-fantastic-similan-phang-nga"), image: img("whs44hdfmx1k6x3vj0hc") },
    { label: "ทัวร์อ่าวพังงา + เกาะเจมส์บอนด์ + พายเรือแคนู", url: k(76625, "join-in-james-bond-by-chic-chic"), image: img("cqkbil8wxn25xoefvi68") },
    { label: "ล่องแก่ง + ขับ ATV เต็มวันในพังงา", url: k(75973, "rafting-experience-phang-nga"), image: img("kdrdtxeo2getxbjvbdfz") },
    { label: "บัตรมวยไทยสนามมวยเขาหลัก", url: k(80778, "join-khao-lak-boxing-stadium-muay-thai-phang-nga"), image: img("k8e2qdlx2qnv2p7uoioq") },
    { label: "คลาสทำอาหารไทย Riverside เขาหลัก", url: k(82126, "join-riverside-thai-cooking-class-khao-lak-phang-nga"), image: img("pqag1j0afhhyy0trzpas") },
    { label: "อควา สปา ที่ The Haven เขาหลัก", url: k(126218, "aqua-spa-at-the-heaven-khao-lak-experience-in-phang-nga"), image: img("rzwdfhyoncombvuqksuc") },
  ],
  "trat": [
    { label: "ล่องเรือกอนโดลาที่เกาะช้าง", url: k(57264, "thai-gondola-cruise-koh-chang-salak-kok"), image: img("cavzw44pkqfu7nopvw8z") },
    { label: "พายเรือยืน SUP ป่าชายเลนเกาะช้าง", url: k(57426, "sup-paddle-board-experience-iyara-seafood-koh-chang"), image: img("jmfljz0aaim0z56lrpcy") },
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
