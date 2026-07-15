# วิธีเพิ่มเนื้อหา (สำหรับทีม)

เนื้อหาทั้งหมดเป็นไฟล์ `.md` ในโฟลเดอร์นี้ เมื่อเพิ่มไฟล์แล้ว Next จะ generate หน้าเว็บให้อัตโนมัติตอน build ไม่ต้องแตะโค้ด

```
content/
  provinces/   # 1 ไฟล์ = 1 จังหวัด
  places/      # 1 ไฟล์ = 1 สถานที่/ร้าน/คาเฟ่/OTOP
```

URL ที่ได้: จังหวัด → `/<ภาค>/<slug จังหวัด>` · สถานที่ → `/place/<slug สถานที่>`

---

## เพิ่มจังหวัดใหม่

สร้างไฟล์ `content/provinces/<slug>.md` (slug เป็นภาษาอังกฤษ ตัวเล็ก คั่นด้วย `-`)

```md
---
slug: chiang-mai          # ต้องตรงกับชื่อไฟล์
name: เชียงใหม่            # ชื่อไทย
nameEn: Chiang Mai         # ชื่ออังกฤษ
region: north             # ต้องเป็น 1 ใน: north, northeast, central, east, west, south
summary: คำโปรยสั้นๆ 1 บรรทัด
image: https://.../ภาพจังหวัด.jpg
featured: false           # true = ขึ้นหน้าแรก (ช่อง "จุดหมายยอดฮิต")
---
เนื้อหาแนะนำจังหวัด 1-2 ย่อหน้า (markdown ได้)
```

## เพิ่มสถานที่ / ร้าน / คาเฟ่ / OTOP

สร้างไฟล์ `content/places/<slug>.md` (แนะนำใช้ prefix จังหวัด เช่น `cm-` = เชียงใหม่ กันชื่อชนกัน)

```md
---
slug: cm-doi-suthep       # ต้องตรงกับชื่อไฟล์
name: วัดพระธาตุดอยสุเทพ
category: attraction      # ต้องเป็น 1 ใน: attraction, restaurant, cafe, otop
province: chiang-mai      # ต้องตรงกับ slug จังหวัดที่มีอยู่จริง
summary: คำโปรยสั้นๆ 1 บรรทัด
image: https://.../ภาพ.jpg
address: ที่อยู่           # (ไม่บังคับ)
hours: เวลาเปิด-ปิด        # (ไม่บังคับ)
priceRange: ช่วงราคา       # (ไม่บังคับ)
lat: 18.8047              # (ไม่บังคับ) พิกัดละติจูด — ใส่แล้วแผนที่จะแม่นขึ้น + ได้ geo schema
lng: 98.9218              # (ไม่บังคับ) พิกัดลองจิจูด
sponsored: 0              # 0 = ปกติ, 1 = แนะนำ (ขึ้นบน), 2 = พาร์ทเนอร์จ่ายเงิน
affiliate:               # (ไม่บังคับ) ปุ่มลิงก์ขาย
  label: จองที่พัก
  url: https://www.agoda.com/...
---
รายละเอียดสถานที่ (markdown ได้ ใส่หัวข้อ ## และ list ได้)
```

---

## กติกาสำคัญ
- `category` ต้องเป็น: `attraction` · `restaurant` · `cafe` · `otop` เท่านั้น
- `region` ต้องเป็น: `north` · `northeast` · `central` · `east` · `west` · `south` เท่านั้น
- `province` ในไฟล์ place ต้องตรงกับ `slug` ของจังหวัดที่มีอยู่จริง (ไม่งั้น build fail)
- ถ้า frontmatter ผิด/ขาด field ที่จำเป็น → `npm run build` จะ error พร้อมบอกชื่อไฟล์ (ตรวจ schema ที่ `lib/content.ts`)
- การเรียงในหน้าจังหวัด: `sponsored` สูงขึ้นก่อน แล้วเรียงตามชื่อ

## รูปภาพ (image:)
- ใส่เป็น URL ในฟิลด์ `image:` ของทั้ง province และ place
- เว็บใช้ **next/image** ปรับขนาด/บีบอัด/lazy-load ให้อัตโนมัติ — แค่ให้ URL ที่ถูกต้อง
- **รูปจาก host ภายนอก** ต้องเพิ่ม hostname ใน `next.config.ts` → `images.remotePatterns` ก่อน ไม่งั้น build ไม่ผ่าน
- **หรือ** วางไฟล์รูปไว้ใน `public/images/` แล้วอ้างเป็น `/images/ชื่อไฟล์.jpg` (same-origin ไม่ต้องตั้ง remotePatterns)
- แนะนำรูปแนวนอน กว้าง ~1200px ขึ้นไป (อัตราส่วนราว 3:2 หรือ 16:9)
- ⚠️ **ต้องเช็คว่า URL เปิดเป็นรูปจริง (200)** — ลิงก์ตายจะทำให้รูปแตก/หน้าเสีย ตอนนี้ทุกรูปเป็น placeholder ที่ยัง alive รอทีมแทนด้วยรูปจริงของแต่ละสถานที่

## ตรวจงานก่อน commit
```
npm run build      # ต้องผ่าน = frontmatter ถูกทุกไฟล์
npm run dev        # เปิด http://localhost:3000 ดูผลจริง
```
