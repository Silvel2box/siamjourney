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
- [ ] **2E — Sponsored/payment** (= งาน monetization เดิม ข้อ "แพ็กเกจ featured/sponsored") สร้างบน CMS/DB ที่พร้อมแล้ว

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
- [ ] (เหลือ) build hook อัตโนมัติตอน git push (ตอนนี้ pull+build มือ), เช็ก `next/image` optimizer บน Passenger (ยังใช้ remotePatterns unsplash)

---

## 📝 หนี้ทางเทคนิค / หมายเหตุ
- รูป **สถานที่ (places)** = เฉพาะต่อแห่งแล้ว (Wikimedia จริง 66 + Pexels 242) · รูป **จังหวัด (provinces)** ยังเป็น Unsplash วนซ้ำ
- affiliate URL เป็นตัวอย่าง (ยังไม่มี tag รายได้)
- ใช้ `<img>` ธรรมดา ยังไม่ใช้ `next/image`
- newsletter form ต่อ DB แล้ว (Server Action + Prisma)
- **deployed จริงแล้ว** ที่ https://siam-journey.com (Plesk/Passenger/MySQL)
- content เป็น markdown — ถ้าโตมากพิจารณา Velite หรือย้ายเข้า DB
