# SiamJourney — To-Do / Roadmap

เว็บท่องเที่ยวไทย 77 จังหวัด · Next.js 16 (App Router) + Tailwind v4 + TypeScript
Content: markdown + gray-matter + zod · Monetization: affiliate-first
อัปเดตล่าสุด: 2026-07-14

---

## ✅ เฟส 0 — MVP โครง (เสร็จแล้ว)
- [x] Scaffold Next.js 16 + Tailwind v4 + TypeScript
- [x] Config ที่เดียว: `lib/site.ts`, `lib/regions.ts`, `lib/categories.ts`
- [x] Content loader + Zod schema (`lib/content.ts`) อ่าน `.md`
- [x] ย้ายดีไซน์จาก template → `app/globals.css` (@theme) + components (โทนทอง, Kanit+Prompt)
- [x] Components: Navbar, Footer, Hero, ProvinceCard, PlaceCard, RegionGrid, ProvinceSearch, AffiliateButton, AdSlot, PageBanner, ScrollReveal
- [x] Routes: `/`, `/[region]`, `/[region]/[province]`, `/place/[slug]` (static ทุกหน้า)
- [x] SEO: generateMetadata + JSON-LD schema.org + sitemap.xml + robots.txt
- [x] Seed: ภาคเหนือ — เชียงใหม่ + น่าน (จังหวัดละ 4 แห่ง ครบ 4 หมวด)
- [x] `npm run build` ผ่าน → 22 static pages

---

## 🔜 เฟส 1 — เนื้อหา + SEO เต็ม (แตกเป็น 1.1–1.6 แต่ละอันจบแล้ว ship ได้)

### 1.1 — Content workflow + scale ✅ เสร็จครบ 77 จังหวัด (2026-07-15)
- [x] วางขั้นตอนเพิ่มไฟล์ `.md` ให้ repeatable → `content/README.md`
- [x] ครบทั้ง 77 จังหวัด ทุกภาค (เหนือ 9 · อีสาน 20 · กลาง 22 · ตะวันออก 7 · ตะวันตก 5 · ใต้ 14)
- [x] ทุกจังหวัดมีครบ 4 หมวด (attraction/restaurant/cafe/otop) — รวม 308 places
- [x] verify: build ผ่าน 397 pages, integrity สะอาด (slug/category/province ref ครบ), affiliate 154 (attraction+otop)
- แก้ bug: regions.ts ภาคกลาง 21→22 · featured 8 จังหวัด (1 iconic/ภาค + เหนือ 3)

### 1.2 — Category pages (SEO เชิงลึก) ✅ (2026-07-15)
- [x] หน้า `/[region]/[province]/[category]` (308 หน้า เช่น "คาเฟ่ในเชียงใหม่") + generateStaticParams + dynamicParams=false
- [x] generateMetadata (title = "<หมวด>ใน<จังหวัด>") + ItemList JSON-LD + sibling category nav
- [x] ลิงก์ "ดูทั้งหมด" จากหน้าจังหวัด + เพิ่มใน sitemap (รวม 700 URLs)
- [x] verify: build 705 pages, category filter ถูก, invalid → 404

### 1.3 — รูปภาพ ✅ โครง next/image เสร็จ (2026-07-15)
- [x] แปลง `<img>` ทั้งหมด → `next/image` (PlaceCard, ProvinceCard, PageBanner, หน้าแรก) + alt + sizes + fill
- [x] `next.config.ts` images.remotePatterns (unsplash) + optimizer verified ทำงานบน `next start` (Plesk-ready); fallback unoptimized เป็น 1 บรรทัด
- [x] แก้บั๊ก: placeholder ตาย 4 URL กระจาย 90 ไฟล์ (next/image เปิดโปง) → แทนด้วยรูป alive, สแกนครบ 12 URL alive หมด
- [x] คู่มือรูปให้ทีมใน `content/README.md`
- [ ] **งานทีม (content):** แทน placeholder ด้วยรูปจริงของแต่ละสถานที่ 308 แห่ง — โครงพร้อม แค่แก้ field `image:`

### 1.4 — Affiliate wiring ✅ ระบบกลางเสร็จ (2026-07-15)
- [x] `lib/affiliate.ts` — config กลางที่เดียว (klook/agoda/booking/shopee/lazada) + `buildAffiliateUrl()`
- [x] ทุกลิงก์เติม sub-id ต่อสถานที่ (per-place tracking) + UTM อัตโนมัติ ผ่าน AffiliateButton — verify แล้ว
- [x] เมื่อกรอก id จริงใน config → เติม affiliate id param ให้เองโดยไม่ต้องแตะ markdown 154 จุด
- [ ] **งานคุณ (บัญชี):** สมัคร Agoda/Klook/Shopee affiliate → กรอก `id` + ตรวจชื่อ `idParam`/`subIdParam` ใน `lib/affiliate.ts`
- [ ] (ทางเลือก) deep-link สินค้า/โรงแรมเฉพาะต่อสถานที่ในฟิลด์ `affiliate.url` เพื่อ conversion สูงขึ้น

### 1.5 — SEO polish ✅ (2026-07-15)
- [x] Breadcrumb JSON-LD ต่อหน้า (ทำใน PageBanner → ครอบ province/category/place อัตโนมัติ)
- [x] OpenGraph image ต่อหน้า (place/province/category = รูปของหน้านั้น, region/home = site.ogImage)
- [x] canonical ครบทุกหน้า (home/region/province/category/place)
- [x] field พิกัด lat/lng (zod optional) + geo JSON-LD (GeoCoordinates) + ฝัง Google Map (iframe output=embed) + ลิงก์เปิด Maps — ทุก place มีแผนที่ (ใช้พิกัด/ที่อยู่/ชื่อตามลำดับ)
- [x] verify: breadcrumb/geo/map/OG/canonical ผ่านทุกหน้า; ใส่พิกัดจริงตัวอย่างที่ ดอยสุเทพ
- [ ] hreflang จริง: เตรียมโครง alternates ไว้แล้ว รอ /en/ (เฟส 3)

### 1.6 — หน้าเสริม + launch prep ✅ (2026-07-15)
- [x] หน้า `/privacy` + `/terms` (แบบร่าง template ครอบ affiliate/ads/cookies/PDPA + disclaimer ให้ทนายตรวจ) + ใน sitemap
- [x] custom 404 (`app/not-found.tsx`) ธีมทอง/ดำ + ปุ่มกลับหน้าแรก/ค้นหาจังหวัด — verify status 404 + content ถูก

---
## 🎉 เฟส 1 เสร็จครบ (engineering) — 2026-07-15
build 707 static pages ผ่าน. เหลือ **งาน content/บัญชีของทีม**: รูปจริง 308 แห่ง (1.3), affiliate ID จริง (1.4), พิกัด lat/lng (1.5, ทางเลือก), และให้ทนายตรวจ privacy/terms.
พร้อมไป **Deploy (Plesk)** หรือ **เฟส 2 (ระบบร้านค้า/DB)**.

## 💰 เฟส 2 — Monetization + ระบบร้านค้า (ต้องมี backend)
### DB groundwork ✅ (2026-07-15)
- [x] ติดตั้ง Prisma 6 + ต่อ XAMPP MySQL (dev) — schema `Subscriber`, migrate init สำเร็จ
- [x] `lib/prisma.ts` singleton + `postinstall: prisma generate` (เตรียม deploy)
- [x] newsletter form ต่อ DB จริง (Server Action `subscribe` + Prisma) — verify: create/read/duplicate(P2002)/render ผ่าน
- [ ] **Plesk:** สร้าง MySQL DB+user, ตั้ง DATABASE_URL, รัน `prisma migrate deploy` (ไม่ใช่ migrate dev — user prod ไม่มีสิทธิ์ shadow DB)
### ร้านค้าสมัคร + auth ✅ (2026-07-16)
- [x] Prisma models `Merchant` (email/passwordHash/shopName/status) + `Session` (opaque token) — migrate `merchant_auth`
- [x] `lib/auth.ts` — hash/verify ด้วย `crypto.scrypt` (native, ไม่ต้อง bcrypt binding บน Plesk), DB-backed session (random token ใน httpOnly cookie), DAL `getMerchant()` (React cache, คืน DTO ไม่รวม passwordHash) + `requireMerchant()` guard
- [x] Server Actions `app/actions/auth.ts` — register/login/logout (Zod validate, กัน email ซ้ำ P2002, redirect)
- [x] หน้า `app/(shop)/register|login|dashboard` + `components/AuthForm.tsx` (client, useActionState) — dashboard เป็น stub มี logout + status badge
- [x] **ไม่เพิ่ม npm dependency** — ใช้ node crypto + Prisma + Zod ที่มีอยู่
- [x] verify: build 710 pages; guard (/dashboard→/login), valid cookie→dashboard 200, invalid→redirect, login-แล้ว→dashboard; hash round-trip/reject, P2002, session expiry+cascade ผ่านหมด
- [x] admin approval UI ✅ (2026-07-16) — Merchant.role + requireAdmin() + /admin (อนุมัติ/ระงับ) + seed.mjs ตั้ง admin ตาม ADMIN_EMAIL
- [x] แดชบอร์ดแก้ข้อมูลร้านจริง ✅ (2026-07-17) — profile fields ใน Merchant (description/province/category/address/phone/website/image) + ShopForm + updateShop action (zod, own-record) + หน้าสาธารณะ `/shop/[id]` (dynamic, approved-only → 404); verify: /shop approved 200 + pending/missing/non-numeric 404, dashboard prefill, build ผ่าน. **write path (ปุ่ม save) ยัง type-guaranteed แต่ยังไม่ browser-click test — Next action protocol ยิงตรงไม่ได้**
- [ ] (ต่อยอด #4) email verify, rate limit

### ต่อไป
- [ ] ใส่ Google AdSense จริงใน `AdSlot`
- [ ] แพ็กเกจ featured/sponsored + จัดการสถานะจ่ายเงิน (sponsored 1/2)
- [x] แดชบอร์ดร้านค้า — แก้ข้อมูล ✅ (2026-07-17); ดูสถิติ ยังไม่ทำ
- [ ] ระบบคอมมิชชั่น / บันทึกคลิก affiliate (ตาราง click log)
- [ ] (พิจารณา) migrate content จาก markdown → DB ถ้าต้องให้ non-dev แก้ผ่าน admin

## 🌐 เฟส 3 — ขยาย
- [ ] i18n `/en/` เป็นหน้าจริง + hreflang (ไม่พึ่ง Google Translate)
- [ ] ระบบค้นหา/ฟิลเตอร์ขั้นสูง (หมวด, ราคา, ภูมิภาค)
- [ ] รีวิว/ให้ดาว
- [ ] PWA / performance tuning (คุม "use client" ไม่ให้บวม)

---

## 🚀 Deploy (Plesk)
- [ ] ตั้ง Node app บน Plesk (Passenger) → `npm run build` + `npm start`
- [ ] โดเมน siamjourney.com + SSL (Let's Encrypt)
- [ ] ตั้ง Git deploy / build hook
- [ ] เช็ก `next/image` optimizer ทำงานบน Plesk (หรือใช้ unoptimized)

---

## 📝 หนี้ทางเทคนิค / หมายเหตุ
- รูปทั้งหมดเป็น Unsplash placeholder
- affiliate URL เป็นตัวอย่าง (ยังไม่มี tag รายได้)
- ใช้ `<img>` ธรรมดา ยังไม่ใช้ `next/image`
- newsletter form เป็น UI เปล่า ไม่ต่อ backend
- ยังไม่ตั้ง deploy จริง
- content เป็น markdown — ถ้าโตมากพิจารณา Velite หรือย้ายเข้า DB
