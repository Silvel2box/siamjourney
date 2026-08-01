// Seed the Hotel table so /hotel is not an empty page while the team prepares
// its own listings. Idempotent — upserts by slug, never deletes. Run once per
// environment:  npm run seed:hotels
//
// These are real, long-established properties, and every line below is limited
// to where the place is and what the surrounding area is like — no prices, no
// phone numbers, no room or facility claims, because none of that can be
// verified from here and it belongs to someone else's business.
//
// Photos are generic Pexels stock credited as "ภาพประกอบ" (same convention the
// 242 restaurant/cafe/OTOP places already use) — they are illustrative, NOT
// photographs of these properties. Swap in owner-supplied photos before
// treating any of this as final.
//
// The team deletes these from /admin/hotels once real listings exist; the slugs
// are listed in TODO.md.
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";

// Prisma CLI loads .env; a plain node script does not.
for (const line of fs.existsSync(".env") ? fs.readFileSync(".env", "utf8").split("\n") : []) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const prisma = new PrismaClient();

const credit = (author, sourceUrl) => ({ author, source: "Pexels", sourceUrl });

const HOTELS = [
  {
    slug: "mandarin-oriental-bangkok",
    name: "แมนดาริน โอเรียนเต็ล กรุงเทพฯ",
    province: "bangkok",
    summary: "โรงแรมริมแม่น้ำเจ้าพระยาย่านบางรัก หนึ่งในโรงแรมเก่าแก่ที่สุดของกรุงเทพฯ",
    image:
      "https://images.pexels.com/photos/237745/pexels-photo-237745.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    imageCredit: credit(
      "Vaibhav Kashyap",
      "https://www.pexels.com/photo/lighted-buildings-near-body-water-237745/",
    ),
    body: "ตั้งอยู่ริมแม่น้ำเจ้าพระยาฝั่งพระนคร ในย่านบางรักซึ่งเป็นย่านการค้าเก่าที่มีอาคารสมัยรัตนโกสินทร์ตอนปลายเรียงอยู่ตามถนนเจริญกรุง\n\nเดินทางด้วยเรือด่วนเจ้าพระยาหรือลงรถไฟฟ้าที่สะพานตากสินแล้วต่อเรือ จากฝั่งนี้ข้ามฟากไปธนบุรีเพื่อไปวัดอรุณราชวรารามได้ในไม่กี่นาที และเดินไปวัดโพธิ์กับท่าเตียนต่อได้ในทริปเดียว",
  },
  {
    slug: "peninsula-bangkok",
    name: "เดอะ เพนนินซูลา กรุงเทพฯ",
    province: "bangkok",
    summary: "โรงแรมริมน้ำฝั่งธนบุรี มองเห็นแนวตึกฝั่งพระนครเต็มตา",
    image:
      "https://images.pexels.com/photos/32755079/pexels-photo-32755079.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    imageCredit: credit(
      "Thể Phạm",
      "https://www.pexels.com/photo/lotte-hotels-in-vibrant-night-cityscape-32755079/",
    ),
    body: "อยู่ริมแม่น้ำเจ้าพระยาฝั่งธนบุรี ตรงข้ามย่านบางรักและถนนเจริญกรุง จึงเห็นแนวตึกและโค้งแม่น้ำฝั่งพระนครได้ทั้งแนว\n\nฝั่งธนบุรีแถบนี้ยังมีคลองสายเล็กและชุมชนเก่าให้เดินสำรวจ ส่วนการข้ามไปฝั่งพระนครใช้เรือข้ามฟากซึ่งเป็นวิธีเดินทางปกติของคนแถวนี้อยู่แล้ว",
  },
  {
    slug: "four-seasons-chiang-mai",
    name: "โฟร์ซีซั่นส์ รีสอร์ท เชียงใหม่",
    province: "chiang-mai",
    summary: "รีสอร์ทในหุบเขาแม่ริม ล้อมด้วยนาขั้นบันไดนอกตัวเมืองเชียงใหม่",
    image:
      "https://images.pexels.com/photos/8645135/pexels-photo-8645135.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    imageCredit: credit(
      "HONG SON",
      "https://www.pexels.com/photo/exotic-resort-in-green-mountain-landscape-8645135/",
    ),
    body: "ตั้งอยู่ในอำเภอแม่ริม ทางเหนือของตัวเมืองเชียงใหม่ ในหุบเขาแม่สาที่มีนาขั้นบันไดและลำธารไหลผ่าน อากาศเย็นกว่าในเมืองอย่างรู้สึกได้\n\nเส้นทางแม่ริมสายนี้เป็นทางเดียวกับที่ไปน้ำตกแม่สา สวนพฤกษศาสตร์สมเด็จพระนางเจ้าสิริกิติ์ และหมู่บ้านหัตถกรรม จึงเหมาะกับทริปที่อยากอยู่นอกเมืองแต่เข้าเมืองได้ในวันเดียว",
  },
  {
    slug: "anantara-golden-triangle",
    name: "อนันตรา สามเหลี่ยมทองคำ เชียงราย",
    province: "chiang-rai",
    summary: "รีสอร์ทบนเนินเขาเหนือจุดบรรจบแม่น้ำโขงในเขตสามเหลี่ยมทองคำ",
    image:
      "https://images.pexels.com/photos/17727573/pexels-photo-17727573.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    imageCredit: credit("Kirandeep Singh Walia", "https://www.pexels.com/photo/forest-resorts-17727573/"),
    body: "อยู่ในอำเภอเชียงแสน บนเนินเหนือบริเวณที่แม่น้ำรวกไหลมาบรรจบแม่น้ำโขง ซึ่งเป็นจุดที่แผ่นดินไทย ลาว และเมียนมามาชนกันจนได้ชื่อว่าสามเหลี่ยมทองคำ\n\nจากแถบนี้ไปเมืองเก่าเชียงแสนที่ยังมีกำแพงเมืองและเจดีย์สมัยล้านนาได้ไม่ไกล และเป็นจุดตั้งต้นของเส้นทางเลียบแม่น้ำโขงขึ้นไปทางเชียงของ",
  },
  {
    slug: "katathani-phuket",
    name: "กะตะธานี ภูเก็ต บีช รีสอร์ท",
    province: "phuket",
    summary: "รีสอร์ทริมหาดกะตะน้อย ทางใต้ของเกาะภูเก็ต",
    image:
      "https://images.pexels.com/photos/6821435/pexels-photo-6821435.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    imageCredit: credit("Lelani Badenhorst", "https://www.pexels.com/photo/the-poolside-of-a-beach-resort-6821435/"),
    body: "ตั้งอยู่ริมหาดกะตะน้อย อ่าวเล็กทางใต้ของเกาะที่เงียบกว่าหาดป่าตองมาก และอยู่ถัดจากหาดกะตะไปทางใต้เพียงคนละแหลม\n\nโซนนี้ของภูเก็ตเดินทางต่อไปหาดในหาน แหลมพรหมเทพ และวัดฉลองได้สะดวก เหมาะกับคนที่อยากได้ทะเลแบบไม่พลุกพล่านแต่ยังเข้าเมืองภูเก็ตได้ในครึ่งชั่วโมงกว่าๆ",
  },
  {
    slug: "rayavadee-krabi",
    name: "รายาวดี กระบี่",
    province: "krabi",
    summary: "รีสอร์ทกลางผาหินปูนย่านไร่เลย์ เข้าถึงได้ด้วยเรือเท่านั้น",
    image:
      "https://images.pexels.com/photos/14574663/pexels-photo-14574663.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    imageCredit: credit("Dan Voican", "https://www.pexels.com/photo/cliff-rocks-view-from-the-beach-bay-14574663/"),
    body: "อยู่ในบริเวณไร่เลย์และหาดถ้ำพระนาง ซึ่งเป็นพื้นที่ที่ไม่มีถนนเข้าถึง ต้องนั่งเรือหางยาวเข้ามาจากอ่าวนางหรือคลองจิหลาดเท่านั้น\n\nรอบด้านเป็นหน้าผาหินปูนสูงชันที่เป็นแหล่งปีนผาระดับโลก และเดินถึงหาดพระนางกับหาดไร่เลย์ตะวันตกได้จากที่พัก",
  },
  {
    slug: "four-seasons-koh-samui",
    name: "โฟร์ซีซั่นส์ รีสอร์ท เกาะสมุย",
    province: "surat-thani",
    summary: "รีสอร์ทไหล่เขาริมอ่าวเงียบทางตะวันตกเฉียงเหนือของเกาะสมุย",
    image:
      "https://images.pexels.com/photos/7903130/pexels-photo-7903130.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    imageCredit: credit("Vlada Karpovich", "https://www.pexels.com/photo/concrete-houses-built-on-a-mountain-7903130/"),
    body: "ตั้งอยู่บนไหล่เขาที่ลาดลงสู่อ่าวเล็กทางตะวันตกเฉียงเหนือของเกาะสมุย ห่างจากย่านเฉวงและละไมที่เป็นศูนย์กลางความคึกคักพอสมควร\n\nฝั่งนี้ของเกาะหันไปทางแผ่นดินใหญ่ จึงเห็นพระอาทิตย์ตกและทะเลที่คลื่นค่อนข้างสงบ เดินทางต่อไปท่าเรือเพื่อไปเกาะพะงันหรือเกาะเต่าได้ในวันเดียว",
  },
  {
    slug: "centara-grand-hua-hin",
    name: "เซ็นทารา แกรนด์ บีช รีสอร์ท แอนด์ วิลลา หัวหิน",
    province: "prachuap-khiri-khan",
    summary: "อาคารโรงแรมรถไฟหัวหินเดิม ริมหาดหัวหินใจกลางเมือง",
    image:
      "https://images.pexels.com/photos/1658083/pexels-photo-1658083.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    imageCredit: credit(
      "Frans van Heerden",
      "https://www.pexels.com/photo/patio-benches-and-chairs-outside-2-storey-building-1658083/",
    ),
    body: "เป็นอาคารโรงแรมรถไฟหัวหินเดิมที่สร้างขึ้นในยุคที่ทางรถไฟสายใต้ทำให้หัวหินกลายเป็นเมืองตากอากาศ ตัวอาคารไม้และสวนยังคงเค้าโครงเดิมไว้\n\nที่ตั้งอยู่ริมหาดหัวหินพอดี เดินไปสถานีรถไฟหัวหินที่ขึ้นชื่อเรื่องพลับพลาไม้ ตลาดโต้รุ่ง และย่านร้านอาหารในเมืองได้",
  },
  {
    slug: "hilton-pattaya",
    name: "ฮิลตัน พัทยา",
    province: "chon-buri",
    summary: "โรงแรมบนถนนเลียบหาดพัทยา มองเห็นอ่าวพัทยาทั้งอ่าว",
    image:
      "https://images.pexels.com/photos/36386162/pexels-photo-36386162.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    imageCredit: credit("SweeMing YOUNG", "https://www.pexels.com/photo/cityscape-view-from-modern-hotel-room-36386162/"),
    body: "ตั้งอยู่บนถนนเลียบชายหาดพัทยา อยู่ในอาคารเดียวกับศูนย์การค้าใจกลางเมือง จึงลงจากที่พักแล้วเดินถึงหาดและร้านค้าได้ทันที\n\nจากจุดนี้ต่อรถไปแหลมบาลีฮาย เพื่อลงเรือไปเกาะล้าน หรือขึ้นไปทางเหนือสู่หาดวงศ์อมาตย์และนาเกลือที่เงียบกว่าได้สะดวก",
  },
  {
    slug: "sala-ayutthaya",
    name: "ศาลา อยุธยา",
    province: "ayutthaya",
    summary: "ที่พักขนาดเล็กริมแม่น้ำ ตรงข้ามวัดพุทไธศวรรย์",
    image:
      "https://images.pexels.com/photos/31262576/pexels-photo-31262576.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    imageCredit: credit(
      "ZHIGANG MENG",
      "https://www.pexels.com/photo/charming-courtyard-with-vintage-shuttered-windows-31262576/",
    ),
    body: "อยู่ริมแม่น้ำเจ้าพระยาฝั่งตรงข้ามวัดพุทไธศวรรย์ จึงมองเห็นพระปรางค์ของวัดจากฝั่งที่พักโดยตรง โดยเฉพาะช่วงเย็นที่แสงลงบนองค์ปรางค์\n\nจากจุดนี้ข้ามไปเกาะเมืองอยุธยาเพื่อเที่ยวอุทยานประวัติศาสตร์ วัดมหาธาตุ และวัดไชยวัฒนารามได้ในระยะขับรถไม่นาน",
  },
  {
    slug: "float-house-river-kwai",
    name: "เดอะ โฟลท์เฮ้าส์ ริเวอร์แคว",
    province: "kanchanaburi",
    summary: "เรือนแพลอยน้ำบนแม่น้ำแควน้อย ในเขตอำเภอไทรโยค",
    image:
      "https://images.pexels.com/photos/6025382/pexels-photo-6025382.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    imageCredit: credit("Klang Lumpikanon", "https://www.pexels.com/photo/houses-with-thatched-roofs-by-the-river-6025382/"),
    body: "เป็นเรือนแพที่ลอยอยู่บนแม่น้ำแควน้อยในเขตอำเภอไทรโยค ล้อมด้วยหุบเขาและป่าทั้งสองฝั่ง มองไม่เห็นถนนจากตัวแพ การเข้าถึงช่วงสุดท้ายใช้เรือ\n\nโซนไทรโยคเป็นเส้นทางเดียวกับน้ำตกไทรโยคน้อย ถ้ำกระแซ และทางรถไฟสายมรณะช่วงที่เลาะหน้าผา จึงมักจัดรวมไว้ในทริปค้างคืนของกาญจนบุรี",
  },
];

async function main() {
  const provinceSlugs = new Set(
    (await prisma.province.findMany({ select: { slug: true } })).map((p) => p.slug),
  );

  let written = 0;
  for (const h of HOTELS) {
    if (!provinceSlugs.has(h.province)) {
      console.warn(`skip ${h.slug}: province "${h.province}" not in DB`);
      continue;
    }
    const row = {
      name: h.name,
      province: h.province,
      summary: h.summary,
      image: h.image,
      imageCredit: h.imageCredit,
      body: h.body,
    };
    await prisma.hotel.upsert({
      where: { slug: h.slug },
      update: row,
      create: { slug: h.slug, ...row },
    });
    written++;
  }

  console.log(`seeded hotels=${written} | DB now: hotels=${await prisma.hotel.count()}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
