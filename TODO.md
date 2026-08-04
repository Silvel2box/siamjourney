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
- [x] **แทน placeholder ด้วยรูปเฉพาะต่อแห่ง ครบ 308 ✅ (2026-07-22)** — เดิมเป็นสต็อก Unsplash 11 รูปวนซ้ำตามหมวด (เจ๊ไฝ=ข้าวซอย รูปเดียวกัน) เสี่ยง duplicate/thin ตอน AdSense review
  - **Hybrid:** attraction 66 แห่ง → รูปจริงจาก Wikimedia Commons (ค้นจาก slug+nameEn) · restaurant/cafe/OTOP 242 แห่ง → Pexels เจาะจงต่อหมวด จัดกลุ่มตาม query (1 API call/กลุ่ม) unique ทุกใบ
  - `scripts/fetch-images.mjs` (ดึง+เขียน frontmatter, idempotent, DRY/LIMIT env) + `scripts/localize-wikimedia.mjs` (download Wikimedia ลง `public/images/places/` เพราะ Commons rate-limit hotlink 429 — Pexels คง hotlink)
  - เพิ่ม field `imageCredit{author,source,sourceUrl,license?}` ใน placeSchema + แสดง credit มุมล่างแบนเนอร์ (PageBanner) — CC ต้องเครดิต, Pexels แสดง "ภาพประกอบ"
  - `next.config.ts` remotePatterns เหลือ `images.pexels.com` (Wikimedia=local, unsplash เลิกใช้) · **public/ +47MB** (66 รูป, ลดเหลือ 1200px→~33MB ได้ถ้าต้องการ)
  - verify: build ผ่าน · 308 unique URL · credit ครบ 308 · curl attraction=local+Wikimedia credit / restaurant=Pexels+ภาพประกอบ ✅
  - 🔑 `PEXELS_API_KEY` ใน `.env` (local, มีแล้ว) ใช้แค่ตอน re-run script — **prod build ไม่ต้องใช้ key** (URL เขียนลง .md แล้ว) · deploy = pull+build ปกติ (public/*.jpg + .md ไปพร้อม git)
- [x] **รูปจังหวัด 77 ไฟล์ → Wikimedia ของจริง ✅ (2026-07-22)** — เดิม Unsplash ~6 รูปวนซ้ำ · `scripts/fetch-province-images.mjs` ค้นจาก **landmark ของ attraction place ในจังหวัดนั้น** (chiang-rai→วัดร่องขุ่น) ไม่ใช่แค่ชื่อจังหวัด (ที่ได้ผีเสื้อ/flag map/ภาพดาวเทียม) + junk filter · 77/77 real · provinceSchema เพิ่ม `imageCredit` (แชร์ `imageCreditSchema` กับ place) · credit ที่แบนเนอร์หน้าจังหวัด · localize ลง `public/images/provinces/`
  - 🐛 **แก้บั๊ก dedup:** province fetch รันหลัง place localize → `used` set เป็น local path ไม่ใช่ wikimedia URL → 65/77 จังหวัดได้รูปซ้ำกับ attraction place ตัวเอง · `scripts/fix-province-dupes.mjs` dedup by **content hash** re-fetch คนละใบ (kept 12 fixed 65) · `scripts/upgrade-small-provinces.mjs` เปลี่ยน 23 รูปที่ <1000px/portrait เป็น landscape ≥1000px
  - ✅ **trim ทั้งเว็บเหลือ 1500px q82 (sharp): 92MB → 39MB (−58%)** · verify: build ผ่าน · 143 unique 0 dup 0 orphan 0 รูปเล็ก · curl province/region/place render local+credit ครบ

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
- [x] **AdSense: ยืนยันความเป็นเจ้าของเว็บผ่านแล้ว ✅ (2026-07-21)** — pub ID `ca-pub-1938381370106852` ใน `lib/adsense.ts` + `public/ads.txt` LIVE
  - แยกเป็น 2 สวิตช์: `adsenseEnabled` (loader ขึ้น = พอ verify/review) กับ `adUnitsEnabled` (ต้องมี slot ID ด้วยถึง render `<ins>` — กัน ad unit เสียโผล่ตอนรอตรวจ)
  - ⚠️ **บทเรียน: `next/script` ใส่แค่ `<link rel="preload">` ใน HTML ฝั่งเซิร์ฟเวอร์** (ทั้ง afterInteractive **และ beforeInteractive** — doc บอกว่า inject จริงแต่ build ออกมาไม่ใช่) → verifier ที่อ่าน HTML ดิบมองไม่เห็น = ยืนยันไม่ผ่าน. แก้ด้วยการใส่ `<script async>` ดิบใน `<head>` ของ layout ตรงๆ
  - [ ] **เหลือ:** อนุมัติแล้ว → สร้าง ad unit → ใส่ slot ID ใน `lib/adsense.ts` → pull+build (โฆษณาขึ้นเอง 4 จุด: หน้าแรก/จังหวัด/หมวด/สถานที่)
- [x] 🚨 แก้บั๊กโดเมนผิดทั้งเว็บ ✅ (2026-07-21) — `lib/site.ts` เคยตั้ง `url: https://siamjourney.com` (**ไม่มีขีด = โดเมนของคนอื่น**) → canonical/OG/sitemap ทั้ง 707 URL disown เว็บตัวเอง แก้เป็น `siam-journey.com` (+ email ติดต่อ) · **ต้องสร้างเมลบ็อกซ์ `hello@siam-journey.com` ใน Plesk**
- [x] โครง Google AdSense พร้อมเสียบ ✅ (2026-07-18) — `lib/adsense.ts` (client/slot เว้นว่าง = ปิดสนิท), loader `<Script>` ใน layout โหลดเฉพาะเมื่อมี ID, `AdSlot` render `<ins class="adsbygoogle">` ในกล่องสะอาด (label + reserve height กัน CLS); ปิด = live ไม่แสดงอะไร (dev เห็น placeholder). verify build ทั้ง 2 สถานะ. **เหลืองานบัญชี:** สมัคร AdSense → กรอก `ca-pub-...` + slot id ใน `lib/adsense.ts` → เพิ่ม `public/ads.txt` → redeploy (checklist อยู่หัวไฟล์ `lib/adsense.ts`)
- [ ] แพ็กเกจ featured/sponsored + จัดการสถานะจ่ายเงิน (sponsored 1/2)
- [x] แดชบอร์ดร้านค้า — แก้ข้อมูล ✅ (2026-07-17); ดูสถิติ ยังไม่ทำ
- [ ] ระบบคอมมิชชั่น / บันทึกคลิก affiliate (ตาราง click log)
- [ ] (พิจารณา) migrate content จาก markdown → DB ถ้าต้องให้ non-dev แก้ผ่าน admin

## 🗂️ เฟส 2.5 — Admin CMS (ให้ทีม non-dev จัดการเอง) — วางแผน 2026-07-23
> **ตัดสินใจแล้ว:** content จะให้ทีม non-dev จัดการ → ต้องย้าย markdown → **DB + custom admin** (เลือก A ไม่ใช่ git-CMS เพราะ Plesk deploy มือ + มี Prisma/admin อยู่แล้ว → แก้แล้วขึ้นทันทีด้วย ISR on-demand revalidate ไม่ต้อง rebuild)
> เป้าหมายรวม: CMS สถานที่+รูป (non-dev) · จัดการร้านค้าเต็ม · ระบบโรงแรม · อัปโหลดรูปผ่าน admin

- [x] **2A — Foundation: ย้าย content → DB ✅ LIVE (2026-07-23, commit 60bc132)** — ยืนยัน header ไลฟ์ `s-maxage=3600` + `x-nextjs-cache` = ISR จาก DB จริง · ทุกหน้า 200/sitemap 702/invalid 404
  - Prisma model `Place` + `Province` (imageCredit/affiliate เก็บเป็น Json คง shape เดิม) · migration `add_content_models`
  - importer `scripts/import-content.mjs` (= `npm run import:content`): markdown 385 → DB (upsert idempotent, เก็บ .md เป็น backup) · dev import แล้ว 77+308
  - `lib/content.ts` อ่านจาก DB (getter async + React cache 1 query/collection/req, คง type/signature)
  - หน้า content → **ISR** (dynamicParams=true + revalidate 3600) รองรับ add/edit โดยไม่ rebuild · on-demand revalidate จะต่อใน 2B
  - verify local: build ผ่าน · render เหมือนเดิม (home 8/region 9/province+4/category 200/place local+pexels+credit/invalid 404/sitemap 702)
  - 🔴 **DEPLOY prod ต้องเรียงลำดับ:** pull → **NPM install** (⚠️ สำคัญ! trigger `prisma generate` ให้ client รู้จักตารางใหม่ — ข้ามแล้ว upsert = undefined) → `migrate:deploy` (สร้างตาราง) → `import:content` (โหลด md→DB 1 ครั้ง) → `build` (query DB) → restart
  - 🐛 บทเรียน: schema เปลี่ยน = ต้อง `prisma generate` เสมอ (มากับ npm install/postinstall) แม้ไม่มี dep ใหม่ · harden แล้ว: `import:content` = `prisma generate && node ...` (commit ถัดไป)
- [x] **2B — Admin CRUD สถานที่/จังหวัด ✅ LIVE + เทสต์ผ่าน (2026-07-23, commit a3ad340)** — curl ยืนยัน route guarded (307→/login) + user เทสต์ write path ในเบราว์เซอร์ผ่าน (ไม่ติด WAF)
  - `/admin/places` (กรองตามจังหวัด) + `/admin/provinces` list + edit/delete · `/admin/*/new` + `/[id]/edit`
  - `PlaceForm`/`ProvinceForm` (ทุก field รวม imageCredit+affiliate) · action `app/actions/content.ts` validate ด้วย zod + `requireAdmin`
  - **revalidatePath ตอน save/delete** → แก้ขึ้นทันทีไม่ต้อง rebuild (+ revalidate หน้าเก่าเมื่อย้ายจังหวัด/หมวด) · ลบจังหวัดที่มีสถานที่ไม่ได้ (กัน orphan) · AdminNav tabs
  - verify: build/types ผ่าน · guard anon→307 · ทุกหน้า admin 200 · edit prefill จาก DB · DB round-trip create/update/delete (JSON+DbNull) ผ่าน · **write path จริงต้องกดในเบราว์เซอร์ตอน deploy (Next-Action curl ตรงไม่ได้)**
  - **DEPLOY 2B = ปกติ:** pull → `build` → restart (ไม่มี migration/dep ใหม่) · รูปในฟอร์มยังเป็นช่องกรอก URL (upload จริงอยู่ 2C)
- [x] **2C — อัปโหลดรูปผ่าน admin ✅ LIVE (2026-07-24, commit f4824a0)** — curl ยืนยัน upload route 403 (guarded) + serve route handler ทำงาน (body "not found") · เลือก **Plesk dir (public/uploads)**
  - ปุ่ม "อัปโหลดจากเครื่อง" ใน PlaceForm/ProvinceForm (`ImageUploadField`) + คงช่องกรอก URL · `POST /api/admin/upload` (admin-guard, validate image/≤10MB, sharp resize ≤1500px q82 + auto-orient EXIF) เก็บ `public/uploads` (gitignore)
  - **🐛 บทเรียน: Next production ไม่เสิร์ฟไฟล์ที่เพิ่มลง public/ หลัง start** (public snapshot ตอน build → runtime upload = 404) → ต้องเสิร์ฟผ่าน route handler `GET /api/uploads/[name]` (อ่าน disk, กัน path traversal) · next/image ใช้ /api path ได้ (optimizer 200)
  - verify: upload→resize→served direct+next/image 200 · non-admin 403 · widget ในฟอร์ม · **DEPLOY ปกติ: pull→build→restart** (ไม่มี migration/dep) · uploads persist ข้าม deploy (git ไม่แตะ untracked) แต่ **ต้อง backup แยก** + dir ต้อง writable
- [x] **2D-b — ระบบโรงแรม ✅ (2026-07-24)** — `Hotel` entity (mirror `Place` ลบ category, reuse `affiliate{label,url}`+`imageCredit` JSON, `@@map("hotel")` ตัวเล็ก) migration `add_hotel`
  - `lib/content.ts`: Hotel DTO + `getAllHotels/getHotel/getHotelsByProvince` (React cache) · `bySponsorThenName` generalize เป็น structural type ใช้ร่วม place+hotel
  - Admin CRUD: `/admin/hotels` (list+filter จังหวัด) + new + edit · `HotelForm` · actions `saveHotel/deleteHotel` ใน `app/actions/content.ts` · **extract `affiliateFrom(fd)` helper** (rule-of-three: place+hotel ใช้ร่วม) · AdminNav tab "ที่พัก" · `deleteProvince` guard เพิ่มนับ hotel (กัน orphan)
  - หน้าสาธารณะ: `/hotel` index (จัดกลุ่มตามจังหวัด, ISR 3600) + `/hotel/[slug]` detail (LodgingBusiness JSON-LD + แผนที่ + ปุ่มจอง AffiliateButton) + `HotelCard` · sitemap +/hotel +detail (เฉพาะเมื่อมี hotel) · Navbar link · **เซคชัน "ที่พัก" ในหน้าจังหวัด** (internal linking กัน SEO island)
  - reuse `buildAffiliateUrl` เดิม → ลิงก์ agoda/booking เติม tag+utm อัตโนมัติ ไม่ต้อง config เพิ่ม
  - verify (next dev + seed test hotel): index/detail/province section render, 404 ถูก, admin guard anon→307 ทั้ง 3 route, sitemap มี, affiliate href = `?tag=<slug>&utm_*` ✅ · build ผ่าน (route table มี /hotel static, /hotel/[slug] SSG, /admin/hotels/* dynamic) · **write path (กด save) verify ตอน deploy ในเบราว์เซอร์** (Next-Action curl ตรงไม่ได้ เหมือน place)
  - **DEPLOY: pull → NPM install (prisma generate ตารางใหม่) → `migrate:deploy` → build → restart** (มี migration ใหม่ ห้ามข้าม install/migrate)
- [x] **2D-b+ — แกลเลอรีรูปโรงแรม ✅ (2026-07-24)** — รูปหลายรูป/มุมต่างๆ ต่อโรงแรม (รูปหลักเดิมยังเป็น hero)
  - เก็บเป็น `gallery Json?` = `[{url, caption?}]` บน Hotel (ไม่สร้างตารางใหม่ — reuse JSON pattern เหมือน imageCredit/affiliate) · migration `add_hotel_gallery` · cap 20 รูป
  - Admin: `GalleryField` (client) — อัปโหลด (reuse `/api/admin/upload` resize เดิม) / วาง URL / ลบ / ↑↓ จัดลำดับ / caption ต่อรูป → serialize JSON ลง hidden input · `saveHotel` เพิ่ม `galleryFrom(fd)` parse+zod
  - Public: `HotelGallery` (client) — กริดรูปย่อ (next/image) + **lightbox** เต็มจอ (prev/next/Esc/lock-scroll, ไม่พึ่ง lib) · ใส่รูปแกลเลอรีเข้า `image[]` array ของ LodgingBusiness JSON-LD (hero+gallery)
  - scope: แกลเลอรีอย่างเดียว (ไม่มีรีวิวข้อความ/ดาว) · โรงแรมก่อน (places ขยายทีหลังได้ด้วย JSON pattern เดิม) · caption optional
  - verify (next dev + seed hotel มี 3 รูป): กริด+caption render, JSON-LD image[]=hero+3, admin edit guard 307, build ผ่าน · lightbox interaction = browser-test ตอน deploy
  - **DEPLOY: มี migration → pull → NPM install → `migrate:deploy` → build → restart**
- [x] **แกลเลอรี places ✅ (2026-07-24)** — ขยายแกลเลอรี (จากโรงแรม) ไปที่ 308 places ด้วย (สถานที่/ร้าน/คาเฟ่/OTOP)
  - reuse ทั้งหมด: rename `HotelGallery`→**`PhotoGallery`** (generic, prop `hotelName`→`title`) ใช้ร่วม hotel+place · `GalleryField` + helper `galleryFrom` เดิม
  - `gallery Json?` บน Place + migration `add_place_gallery` · content.ts Place DTO+toPlace · `savePlace` + gallery · `PlaceForm` เสียบ `<GalleryField>` + 2 admin pages · หน้า `/place/[slug]` render + JSON-LD image[]
  - verify (next dev + seed gallery ใส่ 1 place แล้ว clear): กริด+caption render, image[]=hero+2, place ไม่มี gallery=ไม่โชว์ section, hotel/place page ยัง 200 หลัง rename, build ผ่าน
  - **DEPLOY: มี migration → pull → NPM install → `migrate:deploy` → build → restart**
- [x] **2D-a — จัดการร้านค้าเต็ม (Core) ✅ (2026-07-25)** — admin แก้โปรไฟล์ร้านใดก็ได้ (เดิมได้แค่เปลี่ยนสถานะ)
  - `lib/shop.ts` (ใหม่) — extract `parseShopForm(fd)` (zod 8 ฟิลด์ + data-mapping) ใช้ร่วม `updateShop`+`adminUpdateShop` กัน validation drift · `updateShop` (shop.ts) เรียก helper แทน (พฤติกรรมเดิมเป๊ะ)
  - `adminUpdateShop` (admin.ts) — `requireAdmin` ก่อนอ่าน `merchantId` จากฟอร์ม (แพทเทิร์นเดียวกับ `updateStatus`) → update ร้านใดก็ได้ · revalidate /admin + edit page + /shop/[id]
  - `ShopForm` เพิ่ม 2 props: `action` (default `updateShop`) + `merchantId` (→ hidden input) — reuse ฟอร์มเดียวทั้ง dashboard(session-bound) + admin(by-id) เหมือน PlaceForm mode
  - หน้าใหม่ `/admin/merchants/[id]/edit` (mirror places edit) — findUnique + prefill + แสดง email/สถานะ read-only · ลิงก์ "แก้ไข" ต่อแถวใน `/admin` · AdminNav ไฮไลต์แท็บร้านค้าครอบ /admin/merchants
  - scope Core: ไม่รวมลบร้าน/สร้างร้าน/ค้นหา · email ไม่แก้ (identity) · สถานะคุมที่ปุ่ม list เดิม
  - verify (next dev + forge admin session): guard anon 307, admin 200 + prefill + hidden merchantId + email/สถานะ, invalid id 404, /admin มีลิงก์แก้ไข, regression /dashboard 200 (ไม่มี merchantId=session-bound) + /shop/[id] 200, build ผ่าน · **write path (กด Save) = browser-test ตอน deploy**
  - **DEPLOY: ไม่มี migration → pull → build → restart เท่านั้น** (ไม่ต้อง install/migrate)
- [x] **Admin search/filter UX ✅ (2026-07-25)** — ปรับหน้า admin ให้ค้นหา+กรองได้ทุก list
  - component กลาง `components/admin/AdminSearchBar.tsx` (client) — ช่องค้นหา + dropdown filter → debounce 300ms อัปเดต URL searchParams (ไม่มีปุ่ม), หน้า server อ่าน searchParams สร้าง Prisma `where` (contains) กรองที่ DB (scale + URL แชร์ได้)
  - `/admin/places`: ค้นชื่อ/slug + filter จังหวัด+หมวด · `/admin/hotels`: ค้น + จังหวัด · `/admin` (ร้านค้า): ค้นชื่อ/อีเมล + filter สถานะ (เดิมไม่มีอะไรเลย) · `/admin/provinces`: ค้นชื่อไทย/อังกฤษ/slug + ภูมิภาค · empty state "ไม่พบ..." ทุกหน้า
  - a11y (รัน skill web-design-guidelines): native `<select>` (semantic), aria-label, type=search, `focus-visible:ring` (แก้ focus ring หาย), aria-hidden ไอคอน, spellCheck/autoComplete off, placeholder จบ …
  - 🔴 **บทเรียน: siamjourney globals.css ไม่มี a11y base** (focus-visible/touch/reduced-motion) — ที่ memory ว่ามีนั่นคือของ **Tarot** คนละโปรเจกต์ (สับสน) → `focus:outline-none focus:border-primary` ที่ใช้ทั่ว admin/ฟอร์ม = **ลบ focus ring ทิ้ง** ผิด WCAG 2.4.7. แก้เฉพาะ AdminSearchBar แล้ว · ✅ อุดทั้งเว็บแล้วด้านล่าง
  - verify (next dev + forge admin): filter narrows ถูก (region=north→9, cat=cafe&q=chiang→1, q=amnat→amnat-only), empty state, guard 307, build ผ่าน
  - **DEPLOY: ไม่มี migration → pull → build → restart**
- [x] **a11y base ใน `app/globals.css` ✅ (2026-07-29, commit 32d119d)** — 3 บล็อก ~40 บรรทัด อุดทั้งเว็บทีเดียว (ไม่ต้องไล่แก้ทุก input)
  - `:focus-visible { outline: 2px solid var(--color-primary) !important; outline-offset: 2px }` — **ต้องมี `!important`** เพราะ Tailwind คอมไพล์ `.focus\:outline-none:focus { outline-style: none }` (specificity 0,2,0 ชนะ `:focus-visible` 0,1,0) ที่ใช้อยู่ 12 จุดในฟอร์ม/admin → คืน focus ring ทุกที่ (WCAG 2.4.7)
  - `touch-action: manipulation` บน a/button/input/select/textarea/summary/[role=button] — ตัด tap delay 300ms บนมือถือ
  - `@media (prefers-reduced-motion: reduce)` — ตัด transition/animation + `.reveal` โชว์เลย (ปกติ opacity:0 รอ JS) + ปิด hover zoom + parallax→scroll
  - 🐛 **บทเรียน: บล็อก reduced-motion ต้องอยู่ท้ายไฟล์** — `@media` ไม่เพิ่ม specificity ตอนแรกวางไว้บนสุด `.reveal{opacity:1}` เลยแพ้ `.reveal{opacity:0}` ที่อยู่ล่างกว่า (dead code) · จับได้ตอน**อ่าน CSS ที่คอมไพล์จริง** ไม่ใช่ดูแค่ source
  - verify: curl `/_next/static/chunks/*.css` จาก dev → เห็นทั้ง 3 บล็อก + ลำดับถูก (`.reveal` opacity:0 บรรทัด 2578 → override 2661) + ยืนยัน utility `focus:outline-none` ไม่มี `!important` · `npm run build` ผ่าน
  - **DEPLOY: ไม่มี migration → pull → build → restart**
- [x] **แก้บั๊ก UI มือถือ + หน้าโล่ง ✅ (2026-07-29, commit 586d4e0)** — งานเก็บก่อนเริ่ม 2E · แก้ของที่พัง ไม่ใช่ redesign · ไม่เพิ่มคอนเทนต์ใหม่ (ใช้ข้อมูลที่มีอยู่)
  - 🔴 **บั๊กหลัก: `ProvinceCard` โชว์แค่ชื่อจังหวัดบนมือถือ** — คำอธิบาย+ปุ่ม CTA อยู่ใต้ `opacity-0 group-hover:opacity-100` และ **Tailwind v4 ห่อ `group-hover:` ทุกตัวด้วย `@media (hover: hover)`** (ยืนยันจาก CSS ที่คอมไพล์: `.group-hover\:opacity-100:is(:where(.group):hover *)` อยู่ในบล็อก hover) → มือถือ/แท็บเล็ตไม่มีทางเห็น · **แก้ด้วย `md:` ไม่ได้** เพราะ hover เป็นเรื่อง pointer ไม่ใช่ความกว้าง (iPad 768px = md แต่ไม่มี hover) → เอา hover gate ออก โชว์ตลอด (คีย์บอร์ดบนเดสก์ท็อปก็เพิ่งจะเห็นครั้งแรก) + `h-[400px]` → `h-80 md:h-[400px]`
  - hero: `h-screen` → `min-h-svh py-24` (100vh สูงเกินจอมือถือตอนมีแถบ URL) · **ลบ `.reveal` ออกจาก hero** — `<h1>` เป็น LCP แต่ `opacity:0` จนกว่า IntersectionObserver จะทำงาน · เพิ่ม `<link rel=preload as=image>` (React 19 hoist เอง) · **ไม่แปลงเป็น next/image** (จะฆ่า parallax = คนละการตัดสินใจ, รูป 302KB ยังไม่ผ่าน optimizer = หนี้ค้าง)
  - `globals.css`: `background-attachment: fixed` ย้ายเข้า `@media (hover: hover) and (pointer: fine)` (iOS Safari กระตุก) · เดสก์ท็อปเหมือนเดิมเป๊ะ · บล็อก reduced-motion ยังอยู่ท้ายสุดจึงยังชนะ
  - หัวข้อเซคชัน 3 จุด (`[province]` ×2, `/hotel`): `flex-wrap` + `text-2xl md:text-3xl` — ไทยไม่มีช่องว่างระหว่างคำ "ที่พักในประจวบคีรีขันธ์" ล้นที่ 360px · **ไม่ extract `<SectionHeader>`** (แก้แค่ 2 class × 3 จุด, extract จะ diff ใหญ่กว่าบั๊ก)
  - **หน้าโล่ง (ข้อมูลจริง = 1 สถานที่/หมวด/จังหวัด):** หน้าหมวด → การ์ดเดี่ยวขยายเป็น `max-w-2xl` (672×256) + subtitle ตัด "1 แห่ง" + เพิ่มบล็อก "หมวดอื่นใน<จังหวัด>" (1 ใบ/หมวดที่เหลือ ผ่าน `getPlacesByProvince` = React-cached **0 query เพิ่ม**) → 1 การ์ดเป็น 4
  - **`province.body` ไม่เคยแสดงบนเว็บเลย** ทั้งที่มีย่อหน้าจริงทุกจังหวัด + แก้ได้ในแอดมิน → render เป็นบล็อกแรกหน้าจังหวัด (`marked` + `.prose-body` แพทเทิร์นเดิมจาก place page)
  - หน้าสถานที่เพิ่ม "ที่เที่ยวอื่นใน<จังหวัด>" 3 ใบ (ตัดตัวเองด้วย slug) · หน้าภาคเพิ่ม `<RegionGrid>` "เที่ยวภาคอื่น" — 🔴 **ต้องครอบ `bg-dark`** เพราะ RegionGrid เป็น `bg-white/5` + ตัวอักษรขาว (มองไม่เห็นบน bg-light)
  - เศษงาน: ซ่อนปุ่มโซเชียลที่ href ยังเป็น `"#"` (filter — พอใส่ URL จริงกลับมาเอง) · `© 2026` → `getFullYear()` · ลบ import ที่ไม่ใช้ใน Navbar
  - **ตัดสินใจไม่ทำ:** ลิงก์ "ที่พัก" บน navbar คงไว้เหมือนเดิม (user สั่ง — ไม่แตะ root layout/ไม่เพิ่ม DB query) · `PlaceCard` `h-64` ไม่ได้พัง · จัดระบบดีไซน์ (ปุ่มทอง 4 ขนาด, radius 5 ค่า, `hover:bg-yellow-600` เพี้ยนเลมอน, Font Awesome CDN render-blocking) = รอบหน้า
  - verify: `tsc --noEmit` สะอาด · curl ครบ 8 เคส (hover gate=0, min-h-svh, hero ไม่มี reveal, flex-wrap 4 จุด, การ์ดเดี่ยว max-w-2xl, ลิงก์ place หน้าหมวด=4 ใบ, related=3 ใบไม่มีตัวเอง, href="#"=0) · CSS คอมไพล์: `100svh` + parallax ใน `@media (hover:hover)` + reduced-motion อยู่หลัง · `npm run build` 719 หน้า ไม่มีหน้าไหนหลุดจาก static/SSG
  - 📌 **ยังต้องเทสต์ในเบราว์เซอร์จริง** (curl พิสูจน์ไม่ได้): การ์ดจังหวัดบน iOS/Android จริง (DevTools ย่อจอเฉยๆ ยังรายงาน `hover: hover` = ผ่านหลอก) · hero พอดีจอตอนมีแถบ URL · h1 ขึ้นตอนปิด JS · หัวข้อที่ 360px
  - **DEPLOY: ไม่มี migration → pull → build → restart**
- [x] **รื้อเซคชัน "เกี่ยวกับเรา" หน้าแรก ✅ (2026-07-29, commit dd89af3)** — user เปิดมือถือจริงแล้วติว่า space เยอะ + เดสก์ท็อปดูไม่มีเนื้อ
  - **มือถือ: 660px → 392px ก่อนถึงหัวข้อ** — เดิม `py-24`(96) + รูป `h-[500px]` + `gap-16`(64) **ไม่มี breakpoint สักตัว** → `py-16 md:py-24` + `h-72 md:h-[420px] lg:h-[560px]` + ข้อความต่อทันที (`pt-10`)
  - 🐛 **การ์ด "77 จังหวัด" โดนตัดขาดทุกจอ** — มันอยู่ข้างใน `.img-zoom-container` ที่มี `overflow:hidden` แต่ตั้ง `-bottom-10 -right-10` ให้ล้นออก → โดน clip · **อย่าวาง absolute ที่ล้นกรอบไว้ใน .img-zoom-container** · แก้โดยเลิกใช้การ์ดลอย
  - **layout ใหม่ (asymmetric):** รูปชิดขอบจอซ้าย `lg:col-start-1 lg:col-span-7` + การ์ดขาวมีเงาซ้อนทับ `lg:col-start-7 lg:col-span-6 lg:-ml-12` (คอลัมน์ 7 ทับกันเอง + ดึงซ้ายอีก 48px) · ครอบ `max-w-[1536px]` = ค่าเดียวกับ `container` เพื่อให้จอ ultra-wide ตรงแนวเซคชันอื่น · eyebrow "— เกี่ยวกับเรา" ทอง (แพทเทิร์นเดียวกับ hero/destinations)
  - **แถบสถิติแทนการ์ดลอย:** `77 จังหวัด · 308 สถานที่แนะนำ · 6 ภูมิภาค · 4 หมวดหมู่` — **ดึงจากข้อมูลจริงหมด ไม่ hardcode** (`provinces.length` / `getPlaceCount()` ใหม่ = `prisma.place.count()` ไม่โหลด 308 แถวที่มี body / `regions.length` / `categories.length`) → เลขไม่เพี้ยนเมื่อเพิ่มสถานที่ในแอดมิน · มือถือ 2×2 เดสก์ท็อป 4 ช่อง · `<dl>` + `flex-col-reverse` (semantic dt ก่อน dd แต่โชว์เลขบน)
  - เอา `text-justify` ออก (ไทยไม่มีช่องว่างระหว่างคำ จัดชิดขอบทำช่องไฟฉีก · เป็นที่เดียวในเว็บที่ใช้)
  - verify: `tsc` สะอาด · build 719 หน้าเท่าเดิม · curl ยืนยันโครงใหม่ครบ + ของเก่าหาย 0 (`h-[500px]` เดิม / การ์ดลอย / text-justify)
  - **DEPLOY: ไม่มี migration → pull → build → restart**
- [~] **2E — Sponsored/payment = พับแล้ว (2026-07-30)** — ตัดสินใจร่วมกับ user ว่าไม่ทำ
  - **เหตุผล:** ขาย sponsored ได้ตั้งแต่วันนี้โดยไม่ต้องเขียนโค้ด — dropdown `sponsored` (0/1/2) มีในแอดมินทั้ง place และ hotel, `bySponsorThenName` (`lib/content.ts`) ดันขึ้นบนสุด, badge "แนะนำ/พาร์ทเนอร์" มีใน PlaceCard/HotelCard แล้ว → รับเงิน → กด dropdown จบ
  - สร้างระบบ order/ใบเสร็จ/วันหมดอายุ/payment gateway ให้สินค้าที่ยัง**ไม่มีลูกค้าแม้แต่รายเดียว** = speculative เต็มรูปแบบ · ถ้าวันหนึ่งขายได้จริงหลายเจ้าค่อยกลับมาทำ (ของที่ยังขาด: merchant↔listing link, plan/period/expiry, order table, webhook, admin การเงิน, email)
  - **สิ่งที่พบระหว่างวิเคราะห์ (สำคัญกว่า 2E):** ทุกช่องทางรายได้ที่สร้างไว้ยัง**ปิดอยู่หมด** — AdSense `slots.inContent: ""` → `adUnitsEnabled=false` → `<ins>` ไม่ render สักตัวใน prod (มีคนเข้าเท่าไรก็ได้ 0฿) · affiliate `id` ทั้ง 5 network = `""` → ปุ่ม 154 ปุ่มไม่มี publisher ID ติดไป · ลิงก์ affiliate ส่วนใหญ่ชี้หน้าแรกเปล่า (klook.com/th/ 77 + shopee.co.th/ 77 เหมือนกันทุกไฟล์) · **ไม่มี analytics ใดๆ ทั้ง GA4/GTM/Plausible** → "traffic น้อย" เป็นการเดา ไม่ใช่การวัด และข้อมูลย้อนหลังไม่มีทางได้คืน · `/privacy` เขียนว่าใช้ Google Analytics ซึ่งไม่จริง
  - ⚠️ **แก้ข้อมูลผิดในบันทึกเดิม (2026-07-31):** ที่เขียนว่า "ไม่ได้ verify GSC" **ผิด** — verify แล้วแบบ **Domain property ผ่าน DNS TXT** `google-site-verification=RScujAq6FVvsIRIBpGi5cvZ_jr-0YhTvD-b6dBHiahM` (เช็คด้วย `Resolve-DnsName siam-journey.com -Type TXT`) · **วิธี DNS ไม่ทิ้งร่องรอยในโค้ดหรือ HTML เลย** → grep repo/curl HTML แล้วไม่เจอ ไม่ได้แปลว่ายังไม่ได้ทำ ต้องเช็ค DNS ด้วยเสมอ
  - **ลำดับที่ตกลงกันแทน:** (1) เติมเนื้อหาหน้าจังหวัด ✅ (2) GA4 + แก้ /privacy + AdSense review ← ทำอยู่ (3) ลิงก์ค้นหาที่พักต่อจังหวัด (รอ Agoda/Booking partner ID — ตอนนี้มีแต่ Shopee)
- [x] **เติมเนื้อหาหน้าจังหวัด 77 หน้า ✅ ครบ 77/77 (2026-07-31, `017284a` → รอบสุดท้ายภาคใต้ 14 + ตะวันตก 5) — ยังไม่ deploy**
  - **ปัญหาที่วัดได้:** body จังหวัด median 335 ตัวอักษร (min 165 uttaradit / max 465 sukhothai) และ **ไม่มี `##` เลยแม้แต่ไฟล์เดียวใน 77 ไฟล์** · เนื้อหา unique ต่อหน้า ≈ 600 ตัวอักษร = เสี่ยง low value content ตอน AdSense review
  - **schema:** `Province` +4 คอลัมน์ `highlights Json?` (string[]), `bestTime/gettingThere/localFood String? @db.Text` · migration `20260730092013_add_province_content` (ADD COLUMN ล้วน ไม่แตะของเดิม)
  - **หน้าจังหวัด:** 2 บล็อกใหม่เขียน inline ใน `app/[region]/[province]/page.tsx` (call site เดียว ไม่ extract) — "ไฮไลต์ของ<จังหวัด>" กริดการ์ด 6 ข้อ + "รู้ก่อนไป<จังหวัด>" 3 กล่องไอคอน · **ทุกบล็อกมีเงื่อนไข** → 19 จังหวัดที่ยังไม่เขียนแสดงผลเหมือนเดิมเป๊ะ ไม่มีกล่องเปล่า
  - **แอดมิน:** `components/admin/HighlightsField.tsx` (repeatable text list เพิ่ม/ลบ/↑↓ → hidden JSON, ก๊อปโครง GalleryField ตัด upload ออก) + 3 textarea ใน ProvinceForm + `highlightsFrom()` ใน saveProvince (zod max 8, ว่าง → `Prisma.DbNull`)
  - 🔴 **importer มี guard ใหม่ `--provinces` (`npm run import:provinces`)** — importer เป็น upsert ที่ `update: row` = ทับ DB ด้วยค่าจาก markdown · **prod มี 309 places (local 308) เพราะ user เพิ่มเองผ่านแอดมิน** → รัน importer เต็มบน prod = ทับงานแอดมิน ห้ามเด็ดขาด
  - **มาตรฐานเนื้อหาที่ตกลงกับ user:** body ~700-1,100 ตัวอักษร (ลองยาว ~1,000-1,200 แล้ว user ว่ายาวไป) = ย่อหน้าเปิดเดิม + `##` 2 หัวข้อ**ที่ไม่ซ้ำแบบเทมเพลตข้ามจังหวัด** · ไฮไลต์ 6 ข้อ · 3 field สั้น · **เลี่ยงตัวเลขเจาะจง** (ราคา/เวลาเปิด-ปิด/วันจัดงาน/ระยะทาง กม.) ยึดของที่ไม่เปลี่ยน (ภูมิศาสตร์ แลนด์มาร์ก ฤดูกาลกว้างๆ ของกินขึ้นชื่อ) · ใช้ได้แค่ `p/h2/ul` เพราะ `.prose-body` มีสไตล์แค่ 3 ตัวนี้
  - เสร็จครบทุกภาค: เหนือ 9 · อีสาน 20 · กลาง 22 · ตะวันออก 7 · **ใต้ 14 · ตะวันตก 5 (รอบสุดท้าย)**
  - **ผลรวมทั้ง 77 ไฟล์:** body min 768 / median 989 / max 1,112 ตัวอักษร (เดิม median 335) · ไฮไลต์ 6 ข้อครบทุกจังหวัด · 3 field ครบ · `##` = 2 ทุกไฟล์ และ **หัวข้อ `##` ไม่ซ้ำกันเลยสักคู่ในทั้ง 77 ไฟล์ (154 หัวข้อ unique)** = ไม่ใช่เทมเพลต
  - 📌 **บทเรียนรอบสุดท้าย:** ดราฟต์แรกของภาคใต้ยาว 1,150-1,230 (เกินมาตรฐานที่ user เคยติว่ายาวไป) ต้องไล่ตัดทีหลัง · **เขียนรอบเดียวให้ลง 950-1,050 ตั้งแต่แรกเร็วกว่า** · ประโยคที่ตัดทิ้งได้ก่อนคือประโยคที่พูดซ้ำกับ `highlights`/`localFood` อยู่แล้ว
  - verify ทุก batch: `import:provinces` → เช็ค DB (ไฮไลต์ = 6, 3 field ครบ, `##` = 2, places ยัง 308) → `npm run build` 719 หน้าเท่าเดิม → curl หน้า enriched
  - ✅ verify รอบสุดท้าย: gray-matter parse 77/77 ผ่าน · DB 77 provinces (ใต้ 14/ตะวันตก 5 ครบ) + places ยัง 308 · `tsc --noEmit` สะอาด · build 719 หน้าเท่าเดิม · curl 5 หน้าใหม่ = 200 + `fa-star` 6 ใบ + กล่อง "รู้ก่อนไป" 3 กล่อง + `<h2>` ในเนื้อหา 2 หัวข้อ (เทียบกับหน้าที่ทำรอบก่อนแล้วเหมือนกัน)
  - 🔴 **DEPLOY (มี migration):** `pull → NPM install (ให้ prisma generate จบก่อน) → Run script: migrate:deploy → Run script: import:provinces → build → restart`
  - 🐛 **gotcha ที่เพิ่งเจอ:** `npm run import:provinces` พังด้วย `EPERM ... query_engine-windows.dll.node` เมื่อ node ตัวอื่น (dev server ค้าง) ล็อก engine อยู่ — schema ไม่เปลี่ยนก็ข้าม generate ได้ด้วย `node scripts/import-content.mjs --provinces` · และ `git push` ผ่าน PowerShell ที่มี `2>&1` จะรายงาน exit 255 ทั้งที่ push สำเร็จ (NativeCommandError) ให้ยืนยันด้วย `git status -sb`
- [x] **แก้บั๊กสีทอง: ปุ่ม hover แล้วเพี้ยนเป็นเลมอน ✅ (2026-08-04, `cd0927c`) — LIVE แล้ว**
  - **อาการ:** ปุ่มทองทุกใบ `hover:bg-yellow-600` = `#ca8a04` ทั้งที่สีแบรนด์คือ `#c28e46` · yellow-600 **สว่างกว่าและอิ่มสีกว่า** สีปกติ → hover แล้วอ่านเป็นปุ่มคนละใบ ไม่ใช่ใบเดิมที่เข้มขึ้น · **ตกทอดตรงๆ จาก `_reference/thailand_travel_template.html`** (ยังมีอยู่ในไฟล์นั้น 3 จุด — ปล่อยไว้ตามต้นฉบับ แต่ **ห้ามก๊อปสไตล์ปุ่มจากไฟล์นี้อีก** ไม่งั้นบั๊กกลับมา)
  - **แก้:** เพิ่ม token `--color-primary-dark: #a77a3c` ใน `@theme` (= ทอง ~86% lightness) → Tailwind v4 ปั้น `bg-primary-dark` ให้เอง → สวด **7 จุด**: `app/page.tsx` `app/not-found.tsx` `components/Navbar.tsx` `components/AffiliateButton.tsx` + admin list 3 หน้า (places/provinces/hotels) · **สีทองย้ายที่เดียวจบทั้ง base และ hover**
  - verify (ตามกฎโปรเจกต์ — **ดู CSS ที่คอมไพล์แล้ว ไม่ใช่ source**): ใน `.next/static/chunks/*.css` เจอ `--color-primary-dark:#a77a3c` + `.hover\:bg-primary-dark:hover{background-color:var(--color-primary-dark)}` · **`ca8a04` เหลือ 0 ครั้ง** · class โผล่ใน prerendered HTML จริง · `tsc` สะอาด · build 730 หน้าเท่าเดิม
  - 📋 **ที่ตรวจแล้วว่า "ไม่พัง" — อย่าไปรื้อ:** ไล่ `hover:bg-*/text-*/border-*` ทั้งเว็บ = yellow-600 เป็นตัวเดียวที่หลุดพาเลต (ที่เหลือ primary/dark/white + red/green สำหรับลบ/สำเร็จ) · `rounded` 5 ค่าเป็นสเกลจริง (full=ปุ่ม 46 · 2xl=การ์ด 30 · xl=กล่องย่อย 19 · md/lg อยู่ใน GalleryField/HighlightsField ไล่ตามขนาดปุ่ม) · `py` เป็นจังหวะ 3 ชั้น (หน้าแรก 24 / หน้าคอนเทนต์ 20 / ซับเซคชัน 16) · h2 เป็น 3 ชั้น (hero 4xl-5xl / เซคชัน 2xl-3xl / กล่องข้าง xl)
  - ✅ **verify บนไลฟ์หลัง deploy:** chunk จริง (`0lhks2tpny5-u.css`) มีทั้ง token + `.hover\:bg-primary-dark:hover` · `ca8a04` = 0 · `prefers-reduced-motion` ยังอยู่ท้ายไฟล์ (token ใหม่ไม่ดันลำดับ cascade) · HTML ไลฟ์: `/`=4 `/{จังหวัด}`=2 `/hotel`=2 `404`=4 ปุ่ม ไม่มี yellow-600 สักหน้า
  - 🐛 **gotcha verify:** `Invoke-WebRequest` อ่าน body ของ response 4xx ไม่ได้ใน PowerShell 5.1 (ได้ length 0 ทั้งที่หน้ามีจริง 24KB) → **หน้า 4xx ต้อง verify ด้วย `curl` เท่านั้น**
  - **DEPLOY: ไม่มี migration → pull → build → restart**
- [x] **Perf pass: ตัด Font Awesome CDN + ย่อรูป hero ✅ (2026-08-03) — ยังไม่ deploy**
  - **วัดก่อนแก้:** FA โหลด `all.min.css` **102KB แบบ render-blocking จากโดเมนนอก** + `fa-solid-900.woff2` **150KB** = 252KB เพื่อไอคอน 32 ตัว · `hero.jpg` **296KB** (1920×1280) เป็น CSS background จึงไม่ผ่าน next/image เลย และมี preload = โหลดหนักตั้งแต่วินาทีแรก
  - **ผลรวม first load (gzip, มือถือ):** 181KB (CSS 9.6 + FA css 21.6 + webfont 150) + hero 296KB = **~477KB → เหลือ ~74KB** (CSS 17.3 + hero 57)
  - **Font Awesome → subset self-host:** `scripts/build-icon-css.mjs` ดึง SVG ทางการจาก jsDelivr มา generate `app/icons.css` (32 ไอคอน 22.5KB raw / +7.7KB gzip) · แต่ละไอคอนเป็น **CSS mask ทับ `currentColor`** จึงรับสี/ขนาดจาก `text-*` เหมือน glyph เดิม · **ใช้ selector เดิม `.fas.fa-x` → ไม่ต้องแก้ call site สักจุดใน 28 ที่** · import ใน `globals.css` = รวมเข้า CSS chunk เดิม ไม่มี request เพิ่ม
  - 🔴 **กับดักชื่อไอคอน: FA6 เปลี่ยนชื่อของ FA4 หลายตัว** ที่ repo ยังเรียกชื่อเก่าอยู่ (CDN แอบ shim ให้) → `search`→`magnifying-glass`, `map-marker-alt`→`location-dot`, `times`→`xmark` · ต้องใส่ใน `ALIASES` ไม่งั้นไอคอนหายเงียบๆ
  - 🐛 **เกือบพลาด `fa-bars`/`fa-times` (ปุ่มเมนูมือถือ)** เพราะ `Navbar` เขียนเป็น `` `fas ${open ? "fa-times" : "fa-bars"}` `` — grep แพทเทิร์น `fas fa-` จับไม่เจอ · **วิธีตรวจที่เชื่อถือได้คือดึง `fa-*` จาก HTML ที่เรนเดอร์จริง 8 หน้า แล้วเทียบกับ CSS** (จับไอคอนไดนามิกจาก `lib/categories.ts`/`lib/regions.ts` ได้ด้วย) — ผ่าน 25/25 ตัว
  - **hero → WebP 2 ขนาด:** `hero-1080.webp` 57KB (มือถือ) / `hero.webp` 154KB (≥1024px) · ย้าย background จาก inline style ไปเป็น `.hero-bg` ใน `globals.css` เพื่อสลับด้วย media query ได้ · `url()` ธรรมดานำหน้า `image-set()` = fallback ให้เบราว์เซอร์ที่ไม่รู้จัก · preload แยก 2 ตัวด้วย `media=` · **parallax ยังอยู่ครบ** (ยังเป็น CSS background ไม่ได้แปลงเป็น next/image)
  - verify: `tsc` สะอาด · build 730 หน้าเท่าเดิม · curl ยืนยัน `cdnjs` = 0 ใน HTML · CSS ที่คอมไพล์แล้วมี `.fas,.fab` base + `--fa-icon` ครบ + `.hero-bg` 2 บล็อก + `image-set` 4 จุด
  - 📌 **ยังตรวจด้วยตาไม่ได้ — ต้องเปิดเบราว์เซอร์จริงหลัง deploy:** ไอคอนทุกจุดต้องขึ้นเหมือนเดิม (โดยเฉพาะปุ่มเมนูมือถือ + ไอคอนหมวดในการ์ด) และ hero ต้องไม่เพี้ยน/ไม่หาย
  - **DEPLOY: ไม่มี migration → pull → build → restart**
- [x] **ซ่อนช่องโฆษณาที่ Google เติมไม่ได้ ✅ (2026-08-03) — LIVE แล้ว**
  - **อาการ:** user เห็น "บล็อค ADS" แต่ไม่มีโฆษณาขึ้น · **ตรวจแล้วโค้ดฝั่งเราถูกหมด** — loader อยู่ใน `<head>` จริง + `<ins>` มี client/slot/format ครบ + `ads.txt` ตรง → สาเหตุคือ **บัญชียังไม่อนุมัติ** (ระหว่าง review AdSense ไม่เสิร์ฟโฆษณาเลย) หรือหน่วยเพิ่งสร้างยังไม่เริ่มเสิร์ฟ · **ไม่มีอะไรให้แก้ในโค้ดเรื่องโฆษณาไม่ขึ้น**
  - **แต่ที่ต้องแก้จริงคือกล่องเปล่า:** `AdSlot` โชว์ป้าย "โฆษณา" + จองที่ 90px ตลอดเวลา → ระหว่างยังไม่มีโฆษณา คนเข้าเว็บและ reviewer เห็นกล่องเปล่า 6 จุดทั่วเว็บ
  - **วิธีแก้ (CSS ล้วน ไม่มี JS):** AdSense จะ stamp `data-ad-status="unfilled"` ลง `<ins>` เมื่อเติมไม่ได้ → `.ad-placement:has(ins[data-ad-status="unfilled"]){display:none}` ใน `globals.css` + เพิ่ม class `ad-placement` ที่ wrapper ของ `AdSlot` · **ซ่อนทั้งป้ายและช่อง** แต่ markup โฆษณายังอยู่ใน HTML (สำคัญ — reviewer ยังเห็นว่าเราติดโค้ดแล้ว)
  - verify ตามบทเรียนเดิมของโปรเจกต์ (**ดู CSS ที่คอมไพล์แล้ว ไม่ใช่ source**): curl `/_next/static/chunks/*.css` เจอ `.ad-placement:has(ins[data-ad-status=unfilled]){display:none}` จริง และอยู่ **ก่อน** บล็อก `prefers-reduced-motion` (ซึ่งต้องอยู่ท้ายไฟล์เสมอ) · `tsc` สะอาด · build 730 หน้าเท่าเดิม
  - **DEPLOY: ไม่มี migration → pull → build → restart**
- [x] **Seed ที่พัก 11 แห่งให้หน้า `/hotel` ไม่โล่ง ✅ (2026-08-01) — LIVE แล้ว**
  - **ที่มา:** `/hotel` LIVE มาตั้งแต่ 2D-b แต่ **ไม่มีโรงแรมสักแห่งใน DB** → หน้าเหลือแค่หัวข้อ ไม่มีเนื้อหา + `AdSlot` ไม่เรนเดอร์ (อยู่ใน loop `{i === 0 && ...}`) · ไม่อยู่ใน sitemap แต่ navbar ลิงก์ไป = reviewer/crawler เจอได้ = เสี่ยง low value ตอน AdSense review
  - **ตัดสินใจร่วมกับ user: ใช้ที่พัก "จริง" + รูปสต็อกเป็นภาพประกอบ** (ไม่สร้างโรงแรมปลอม เพราะเว็บเปิดสาธารณะและ AdSense กำลังตรวจ = การเผยแพร่ข้อมูลธุรกิจที่ไม่มีอยู่จริง)
  - 🔴 **กติกาการเขียนที่ต้องรักษาไว้ถ้าเพิ่มอีก:** เขียนได้แค่ **ทำเล/ย่าน/สิ่งที่อยู่ใกล้** · **ห้ามใส่ราคา ที่อยู่ เบอร์โทร พิกัด หรือคำอ้างเรื่องห้อง/สิ่งอำนวยความสะดวก** เพราะยืนยันไม่ได้และเป็นธุรกิจของคนอื่น · `affiliate` = null ตั้งใจ → หน้ารายละเอียด**ไม่ขึ้นปุ่มจอง** (`{hotel.affiliate && ...}`) จะได้ไม่มีปุ่มตายชี้หน้าแรกเปล่า
  - **รูป:** Pexels stock credit `source: "Pexels"` → แสดงเป็น "ภาพประกอบ" (แพทเทิร์นเดียวกับร้านอาหาร/คาเฟ่ 242 แห่ง) · **ไม่ใช่รูปของที่พักนั้นจริง** — ถ้าจะใช้จริงจังต้องขอรูปจากเจ้าของ
  - `scripts/seed-hotels.mjs` + `npm run seed:hotels` — upsert by slug, idempotent, **ไม่ลบอะไรเลย** · 11 แห่ง/10 จังหวัด: `mandarin-oriental-bangkok` `peninsula-bangkok` `four-seasons-chiang-mai` `anantara-golden-triangle` `katathani-phuket` `rayavadee-krabi` `four-seasons-koh-samui` `centara-grand-hua-hin` `hilton-pattaya` `sala-ayutthaya` `float-house-river-kwai` ← **user ลบเองได้ที่ `/admin/hotels` เมื่อมีข้อมูลจริง**
  - verify local: build **730 หน้า** (719 + 11 หน้าที่พัก) · `/hotel` = 11 ลิงก์ 10 กลุ่มจังหวัด + **`<ins>` ขึ้นแล้ว** · หน้ารายละเอียด = LodgingBusiness JSON-LD + credit ภาพประกอบ + ไม่มีปุ่มจอง · เซคชัน "ที่พัก" โผล่ในหน้าจังหวัด (กระบี่/กรุงเทพ 2 แห่ง/เชียงใหม่)
  - 🔴 **DEPLOY: `pull → Run script: seed:hotels → build → restart`** (ไม่มี migration) — ข้อมูลอยู่ใน DB ไม่ใช่ไฟล์ ไม่รัน seed ก็ไม่มีโรงแรมบน prod
  - 🐛 **พลาดจริงตอน deploy รอบแรก: สั่งให้ seed *หลัง* build** → `/hotel` กับหน้าจังหวัดถูก generate ตอนที่ DB ยังว่าง แล้วเสิร์ฟ `x-nextjs-cache: HIT` ของหน้าเปล่าค้างไว้ (`s-maxage=3600`) · **กฎเดียวกับ `import:provinces` เป๊ะ: อะไรที่เขียนลง DB ต้องรันให้จบก่อน `build` เสมอ** เพราะ `generateStaticParams`/ISR snapshot อ่าน DB ตอน build · แก้ด้วยการสั่ง `build → restart` ซ้ำ (ไม่ต้อง seed ใหม่ เป็น upsert อยู่แล้ว) หรือรอ 1 ชม. ให้ ISR revalidate เอง
  - ℹ️ หน้ารายละเอียด `/hotel/[slug]` ตอบ 200 ได้ทันทีหลัง seed ทั้งที่ยังไม่ build ใหม่ (`dynamicParams` เรนเดอร์สดจาก DB) — **ใช้เป็นตัวเช็คว่าข้อมูลเข้า DB แล้วจริงไหม แยกจากปัญหาแคชหน้า index**
- [x] **เปิดหน่วยโฆษณา AdSense ✅ (2026-08-01) — ยังไม่ deploy** — `adsense.slots.inContent = "1608333357"` (หน่วย `siamjourney-incontent`) → `adUnitsEnabled` เป็น true ครั้งแรก = `<ins class="adsbygoogle">` เรนเดอร์จริงบนเว็บ
  - 🔴 **ชนิดหน่วยต้องเป็น "จอแสดงผล/Display responsive" เท่านั้น** — `AdSlot` เขียนไว้เป็น `data-ad-format="auto"` + `data-full-width-responsive="true"` · ถ้าไปสร้าง In-article (`fluid` + `layout=in-article`) มาจะไม่ตรงสเปก (user สร้างมาถูกชนิดพอดี)
  - **slot เดียวเปิด 6 จุด** — หน้าแรก/จังหวัด/หมวด/สถานที่/รวมที่พัก/ที่พักรายแห่ง ทุกจุดอ่านจาก `slots.inContent` ตัวเดียว
  - verify local: `tsc` สะอาด · build 719 หน้า · curl เจอ `<ins>` + `data-ad-slot="1608333357"` ที่หน้าแรก/จังหวัด/หมวด/สถานที่ · **`/hotel` ไม่มี `<ins>` เพราะ local DB มี hotel = 0 แถว** (AdSlot อยู่ใน loop `{i === 0 && ...}`) → ต้องเช็คบน prod ที่มีโรงแรมจริง
  - ⚠️ **ยังไม่มีโฆษณาขึ้นจนกว่าบัญชีจะอนุมัติ** — ระหว่างรอ `<ins>` จะว่างเปล่า แต่ยังมี label "โฆษณา" กับพื้นที่ `minHeight 90` จองไว้ → ต้องดูของจริงบนไลฟ์ว่าเป็นกล่องเปล่าน่าเกลียดไหม ถ้าใช่ค่อยทำ label ให้ขึ้นเฉพาะตอนโฆษณาเต็ม
- [x] **ติด GA4 ✅ (2026-07-31) — LIVE แล้ว** — วัดผลจริงได้ครั้งแรกของโปรเจกต์ (ก่อนหน้านี้ไม่มี analytics เลยสักตัว)
  - `lib/analytics.ts` = source of truth (ก๊อปแพทเทิร์น `lib/adsense.ts`) — `ga4MeasurementId = "G-QP3PRNDD29"` (ID เป็นข้อมูลสาธารณะอยู่แล้ว ไม่ต้องทำเป็น env) + `analyticsEnabled` เป็นสวิตช์ (ID ว่าง = ปิดทั้งระบบ)
  - `app/layout.tsx` เพิ่ม 2 tag ใน `<head>` — 🔴 **เขียน `<script>` ดิบ ห้ามใช้ `next/script`** (กับดักเดิมของโปรเจกต์: `next/script` ปล่อยแค่ `<link rel=preload>` ลง server HTML) · ตัว loader + inline `gtag('config', ...)` ต่อท้าย AdSense loader ที่ใช้เหตุผลเดียวกัน
  - **ไม่ต้องเขียน listener ดัก route change** — GA4 enhanced measurement ("page changes based on browser history events") เปิดมาโดยดีฟอลต์ ครอบ client-side nav ของ App Router ให้แล้ว = ไม่ต้องมี client component เพิ่ม
  - verify: `tsc` สะอาด · build 719 หน้าเท่าเดิม · **curl HTML ดิบ 4 แบบหน้า (home / จังหวัด SSG / place / privacy static) เจอ `gtag/js?id=G-QP3PRNDD29` + `gtag('js'` ครบทุกหน้า** (ไม่ดูจากเบราว์เซอร์ตามบทเรียนเดิม)
  - **`/privacy` ไม่ต้องแก้เนื้อหา** — ข้อความเดิมที่เขียนว่าใช้ Google Analytics + AdSense กลายเป็น**จริง**เมื่อติด GA4
  - **✅ เอากล่อง "เอกสารนี้เป็นแบบร่าง ควรให้ที่ปรึกษากฎหมายตรวจสอบ" ออกจาก `/privacy` + `/terms` (2026-08-01)** — user ยืนยันเองว่าเอกสาร "พอใช้งานได้อยู่" ก่อนยื่น AdSense review · เหลือบรรทัด `ปรับปรุงล่าสุด: สิงหาคม 2569` แบบ text-sm text-gray-500 · **ตัวเนื้อหานโยบายไม่แตะแม้แต่ตัวอักษรเดียว** (แก้แค่ 1 บรรทัดต่อไฟล์ ย้อนกลับง่าย)
  - **DEPLOY: ไม่มี migration → pull → build → restart**
- [x] **รูป hero อำนาจเจริญ ✅ (2026-07-31, `b3e011c`)** — ของเดิมเป็น**ธงประจำจังหวัด**จาก Wikimedia ไม่ใช่รูปสถานที่ → เปลี่ยนเป็นภาพจาก อบจ.อำนาจเจริญ (user ส่งลิงก์มา) · **ต้อง self-host เสมอ** เพราะ `next.config.ts` remotePatterns มีแค่ pexels · บีบ sharp q82 (300KB→61KB) · credit = องค์การบริหารส่วนจังหวัดอำนาจเจริญ (ไม่ใส่ license เพราะไม่ใช่ CC) · ลบ .png เดิม + grep ยืนยันไม่มีที่ไหนอ้างถึง
  - 📌 ค้าง: รูปนี้ 1030×450 (2.29:1) — บน hero สวย แต่ `ProvinceCard` เป็นกรอบแนวตั้ง (`h-80 md:h-[400px]` + object-cover) จะครอปจนฐานพระธาตุด้านขวาโดนตัด ถ้าจะแก้ต้องครอปใหม่ (เหลือ ~675×450 = hero ความละเอียดลด) หรือหารูปใหญ่กว่ามาแทน

## 🌐 เฟส 3 — ขยาย
- [ ] i18n `/en/` เป็นหน้าจริง + hreflang (ไม่พึ่ง Google Translate)
- [ ] ระบบค้นหา/ฟิลเตอร์ขั้นสูง (หมวด, ราคา, ภูมิภาค)
- [ ] รีวิว/ให้ดาว
- [ ] PWA / performance tuning (คุม "use client" ไม่ให้บวม)

---

## 🚀 Deploy (Plesk) — ✅ LIVE (2026-07-18) ที่ https://siam-journey.com
> 📖 ขั้นตอน redeploy + gotchas ทั้งหมด → **`DEPLOY.md`** (runbook)
- [x] Node app บน Plesk (Passenger) — startup file `server.js` (custom server CommonJS, Passenger ไม่ hook `next start` ตรง) → `npm run build`
- [x] โดเมน **siam-journey.com** (มีขีด ไม่ใช่ siamjourney.com) + SSL (Let's Encrypt) — auth ต้องมี HTTPS เพราะ session cookie `secure`
- [x] Git pull deploy ผ่าน Plesk panel (ไม่มี SSH — build/migrate/seed รันผ่าน "Run script" = npm scripts)
- [x] DB: MySQL `mutelu_siamjourney`, `migrate deploy`/`reset` ผ่าน npm scripts, admin ตั้งผ่าน `db:seed` (ADMIN_EMAIL)
- แก้ระหว่าง deploy (ดู PROJECT_MEMORY): (1) casing ตาราง Windows→Linux → `@@map` ตัวเล็ก + squash migration, (2) `.env` แยกสำหรับ CLI (panel env ไม่ถึง Run script), (3) **ModSecurity react2shell (CVE-2025-55182) บล็อก Server Action** → whitelist rule `1055182010` ใน WAF "Security rule IDs"
- [ ] (เหลือ) build hook อัตโนมัติตอน git push (ตอนนี้ pull+build มือ)
- [x] **`next/image` optimizer ทำงานบน Passenger ✅ verify ไลฟ์ (2026-08-04)** — เสิร์ฟ `image/webp` จริงเมื่อเบราว์เซอร์ส่ง `Accept: image/webp` + `Cache-Control: max-age=31536000` (remotePatterns = pexels เท่านั้นแล้ว ไม่มี unsplash)

---

## 📝 หนี้ทางเทคนิค / หมายเหตุ
- ⭐ **กฎรูปของโปรเจกต์ (verify ไลฟ์ 2026-08-04 — ไม่ต้องเช็คซ้ำ):** รูปที่ผ่าน `next/image` (จังหวัด/สถานที่/โรงแรม/แกลเลอรี/`culture.jpg` = **ทุกอย่างที่แก้ผ่านแอดมิน**) **optimizer แปลง WebP ให้อัตโนมัติต่อ request** ตาม `Accept` header + cache 1 ปี · พิสูจน์: รูปเดียวกัน `Accept: image/webp`→`image/webp` 23,324B / `Accept: */*`→`image/jpeg` 30,819B (−24%) · **อัปโหลด .jpg เข้าแอดมินได้เลย ไม่ต้องแปลงมือ** (route อัปโหลดมี sharp ย่อ ≤1500px q82 ให้อยู่แล้ว) · 🔴 **ข้อยกเว้นเดียว = รูปที่เป็น CSS background** — CSS ต่อรองฟอร์แมตกับเบราว์เซอร์ไม่ได้ ต้องเขียน `image-set()` เอง → ทั้งเว็บมีรูปเดียวคือ hero (ทำแล้ว) · **เพิ่ม CSS-background ตัวใหม่เมื่อไหร่ = ต้องแปลง WebP มือเมื่อนั้น**
- รูป **สถานที่ (places)** = เฉพาะต่อแห่งแล้ว (Wikimedia จริง 66 + Pexels 242) · รูป **จังหวัด (provinces)** = Wikimedia จริง 77/77 self-host แล้ว (ไม่ใช่ Unsplash วนซ้ำอีกต่อไป)
- affiliate URL เป็นตัวอย่าง (ยังไม่มี tag รายได้)
- ใช้ `next/image` ทุกจุดแล้ว (PageBanner/ProvinceCard/PlaceCard/HotelCard/PhotoGallery/หน้าแรก) — ยกเว้น `app/shop/[id]` ที่รูปมาจากโฮสต์ไหนก็ได้ที่ merchant กรอก จึงต้องเป็น `<img>` ธรรมดา (ไม่อยู่ใน remotePatterns)
- newsletter form ต่อ DB แล้ว (Server Action + Prisma)
- **deployed จริงแล้ว** ที่ https://siam-journey.com (Plesk/Passenger/MySQL)
- content เป็น markdown — ถ้าโตมากพิจารณา Velite หรือย้ายเข้า DB
