// Put body photos into the guide markdown.
//
//   node scripts/apply-guide-images.mjs [--dry]
//
// IMAGES below is the source of truth: guide slug → the photo to drop in after
// the first block under a given ## heading. Only the caption *text* is written
// here — the credit is read from the frontmatter of the place or province the
// photo belongs to, so no photographer name is ever typed by hand (verify rule
// #4). Idempotent: a photo already present in the file is skipped.
//
// Every photo listed here was opened and looked at first. Two rules came out of
// that: the subject has to be what the section is actually about (the Wikimedia
// search once returned a moth for Doi Suthep), and the file has to be landscape
// — .prose-body locks body photos into a 16:9 box, so a portrait shot survives
// only as a strip through its middle.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const IMAGES = {
  "bangkok-old-town-1-day": [
    {
      after: "เริ่มเช้าที่วัดพระแก้ว",
      src: "/images/places/bangkok-wat-phra-kaew-2.jpg",
      alt: "พระศรีรัตนเจดีย์ พระมณฑป และปราสาทพระเทพบิดร ในวัดพระแก้ว",
      note: "ยอดทองคือพระศรีรัตนเจดีย์ ถัดมาเป็นพระมณฑปและปราสาทพระเทพบิดร ทั้งหมดอยู่ในลานเดียวกัน",
    },
    {
      after: "ถ้ามีอีกวัน ต่อไปเกาะเกร็ด",
      src: "/images/places/nonthaburi-koh-kret-2.jpg",
      alt: "พระเจดีย์เอียงริมแม่น้ำที่วัดปรมัยยิกาวาส เกาะเกร็ด",
      note: "พระเจดีย์เอียงตั้งริมน้ำหน้าวัดปรมัยยิกาวาส เอนออกไปทางแม่น้ำจนเห็นได้จากเรือข้ามฟาก",
    },
  ],
  "chiang-mai-3-days": [
    {
      after: "ถ้ามีวันที่สี่ ต่อไปทางไหนดี",
      src: "/images/places/lp-wat-lampang-luang.jpg",
      alt: "จิตรกรรมบนแผงไม้ภายในวัดพระธาตุลำปางหลวง",
      note: "งานเขียนสีบนแผงไม้ในวิหารของวัดพระธาตุลำปางหลวง สีซีดตามอายุจนต้องเข้าไปดูใกล้ ๆ ถึงจะเห็นรายละเอียด",
    },
  ],
  "isan-mekong-route": [
    {
      after: "เริ่มที่เลย เมืองหนาวริมโขง",
      src: "/images/places/loei-phu-kradueng.jpg",
      alt: "ลานกางเต็นท์ใต้ป่าสนบนภูกระดึง จังหวัดเลย",
      note: "บนภูกระดึงต้องค้างคืนในลานกางเต็นท์ ขึ้นไปเช้ากลับเย็นไม่ได้",
    },
    {
      after: "หนองคายและบึงกาฬ",
      src: "/images/places/nong-khai-sala-kaew-ku.jpg",
      alt: "ประติมากรรมปูนปั้นขนาดใหญ่ในศาลาแก้วกู่ หนองคาย",
      note: "ศาลาแก้วกู่เป็นสวนประติมากรรมปูนปั้นขนาดเท่าตึกหลายชั้น ไม่เหมือนวัดที่ไหนในประเทศ",
    },
    {
      after: "นครพนมและมุกดาหาร",
      src: "/images/provinces/nakhon-phanom.jpg",
      alt: "องค์พระธาตุพนมและกำแพงแก้วโดยรอบ จังหวัดนครพนม",
      note: "พระธาตุพนมเป็นที่เคารพของคนสองฝั่งโขง ลานรอบองค์พระธาตุกว้างและร้อนจัดตอนบ่าย",
    },
    {
      after: "จบที่อุบลราชธานี",
      src: "/images/places/ubon-ratchathani-pha-taem.jpg",
      alt: "พระอาทิตย์ขึ้นเหนือแม่น้ำโขงมองจากหน้าผาที่ผาแต้ม",
      note: "ผาแต้มอยู่ตะวันออกสุดของประเทศ จึงเห็นพระอาทิตย์ขึ้นก่อนที่อื่น",
    },
  ],
  "krabi-phang-nga-islands": [
    {
      after: "วันแรก อ่าวไร่เลย์",
      src: "/images/places/krabi-railay.jpg",
      alt: "หน้าผาหินปูนขนาบหาดทรายที่อ่าวไร่เลย์ กระบี่",
      note: "หน้าผาหินปูนที่ตัดไร่เลย์ขาดจากแผ่นดินใหญ่ ทำให้เข้าได้ทางเรือทางเดียว",
    },
  ],
  "nan-phrae-slow-travel": [
    {
      after: "น่าน เดินเมืองเก่าในระยะไม่กี่ร้อยเมตร",
      src: "/images/places/nan-wat-phumin.jpg",
      alt: "วัดภูมินทร์ทรงจตุรมุขและบันไดนาคด้านหน้า จังหวัดน่าน",
      note: "วัดภูมินทร์เป็นทรงจตุรมุขที่มีบันไดนาคทอดขึ้นทั้งสี่ด้าน",
    },
    {
      after: "แพร่ เมืองผ้าครามและหินรูปประหลาด",
      src: "/images/places/pr-phae-mueang-phi.jpg",
      alt: "เสาดินและหน้าผาทรายรูปทรงแปลกตาที่แพะเมืองผี จังหวัดแพร่",
      note: "เสาดินที่แพะเมืองผีเปลี่ยนรูปทุกปีตามฝน ต้นที่เห็นในภาพเก่าจึงไม่เหมือนเดิมแล้ว",
    },
  ],
  "otop-77-provinces": [
    {
      after: "ของฝากภาคเหนือ",
      src: "/images/places/cm-bosang-umbrella-2.jpg",
      alt: "ร่มกระดาษสาเขียนลายดอกไม้ด้วยมือจากบ่อสร้าง จังหวัดเชียงใหม่",
      note: "ร่มบ่อสร้างขึงกระดาษสาแล้วเขียนลายด้วยมือทีละคัน คันในภาพเขียนขึ้นสำหรับงานเทศกาลร่มของหมู่บ้าน",
    },
    {
      after: "ของฝากภาคกลาง",
      src: "/images/places/ayutthaya-roti-sai-mai-2.jpg",
      alt: "โรตีสายไหม แผ่นแป้งสีชมพูกับเส้นน้ำตาลปั่น ของฝากอยุธยา",
      note: "แผ่นแป้งสีชมพูและขาวใช้ห่อเส้นน้ำตาลปั่นเป็นคำ ๆ อร่อยที่สุดตอนแผ่นยังนุ่ม",
    },
  ],
  "phra-that-year-of-birth": [
    {
      after: "วางเส้นทางอย่างไรให้ไหว้ได้หลายองค์ในทริปเดียว",
      src: "/images/provinces/nakhon-phanom.jpg",
      alt: "องค์พระธาตุพนมในจังหวัดนครพนม",
      note: "พระธาตุพนม (ปีวอก) อยู่คนละภาคกับอีกเจ็ดองค์ ต้องแยกเป็นทริปของตัวเอง",
    },
  ],
  "thai-sea-when-to-go": [
    {
      after: "ฝั่งอันดามัน ดีที่สุดช่วงปลายปีถึงต้นร้อน",
      src: "/images/places/phuket-patong.jpg",
      alt: "หาดป่าตองและแนวเขาด้านหลัง จังหวัดภูเก็ต",
      note: "หาดป่าตองเป็นศูนย์กลางฝั่งอันดามัน ช่วงมรสุมจะมีธงแดงปักเตือนคลื่นดูดเป็นระยะ",
    },
    {
      after: "ฝั่งอ่าวไทย ดีที่สุดช่วงต้นปีถึงกลางปี",
      src: "/images/places/trat-koh-chang.jpg",
      alt: "หาดทรายและแนวมะพร้าวบนเกาะช้าง จังหวัดตราด",
      note: "เกาะช้างเป็นทะเลตะวันออกที่ไปจากกรุงเทพฯ ได้ในวันเดียว",
    },
  ],
  "unesco-world-heritage-thailand": [
    {
      after: "นครประวัติศาสตร์พระนครศรีอยุธยา",
      src: "/images/provinces/ayutthaya.jpg",
      alt: "เจดีย์อิฐในเกาะเมืองอยุธยาที่มีนั่งร้านล้อมระหว่างบูรณะ",
      note: "โบราณสถานในเกาะเมืองมีงานบูรณะหมุนเวียนตลอด บางองค์จึงมีนั่งร้านล้อมอยู่",
    },
    {
      after: "กลุ่มป่าดงพญาเย็น-เขาใหญ่",
      src: "/images/places/prachin-buri-khao-yai.jpg",
      alt: "ลำธารในป่าเขาใหญ่ที่มีบัวขึ้นเต็มผิวน้ำ",
      note: "ฝั่งปราจีนบุรีเป็นด้านที่ป่าดิบชื้นสมบูรณ์ที่สุดของเขาใหญ่",
    },
  ],
};

const ROOT = process.cwd();
const dry = process.argv.includes("--dry");

const read = (dir) =>
  fs
    .readdirSync(path.join(ROOT, dir))
    .filter((f) => f.endsWith(".md"))
    .map((f) => matter.read(path.join(ROOT, dir, f)).data);

const byImage = new Map();
for (const d of [...read("content/places"), ...read("content/provinces")]) {
  if (d.image) byImage.set(d.image, d);
}

function credit(src) {
  const c = byImage.get(src)?.imageCredit;
  if (!c) throw new Error(`ไม่พบเครดิตของ ${src} ใน content/places|provinces`);
  const lead = c.source === "Pexels" ? "ภาพประกอบ" : "ภาพ";
  return `${lead}: ${c.author} · ${c.source}`;
}

let added = 0;
for (const [slug, entries] of Object.entries(IMAGES)) {
  const file = path.join(ROOT, "content", "guides", `${slug}.md`);
  let text = fs.readFileSync(file, "utf8");

  for (const e of entries) {
    if (!fs.existsSync(path.join(ROOT, "public", e.src))) {
      throw new Error(`ไม่มีไฟล์รูป ${e.src}`);
    }
    if (text.includes(e.src)) continue; // already there

    const lines = text.split("\n");
    const at = lines.findIndex((l) => l.startsWith("## ") && l.includes(e.after));
    if (at === -1) throw new Error(`${slug}: ไม่เจอหัวข้อ "${e.after}"`);

    // Drop the photo after the block that follows the heading, not straight
    // under it — the first paragraph is what tells the reader what they are
    // looking at.
    let end = at + 1;
    while (end < lines.length && lines[end].trim() !== "") end++;

    const md = `![${e.alt}](${e.src} "${e.note} · ${credit(e.src)}")`;
    lines.splice(end, 0, "", md);
    text = lines.join("\n");
    added++;
    console.log(`+ ${slug} → ${e.src}`);
  }

  if (!dry) fs.writeFileSync(file, text);
}

console.log(`${dry ? "[dry] " : ""}เพิ่มรูป ${added} ใบ`);
