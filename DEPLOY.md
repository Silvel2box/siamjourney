# SiamJourney — Deploy Runbook (Plesk)

Live: **https://siam-journey.com** · Plesk (UI + Git, **no SSH**) · Passenger/Node · MySQL

Plesk รันคำสั่งได้แค่ผ่าน **Node.js panel → "Run script"** (= `npm run <script>`) — ไม่มี shell.
build/migrate/seed จึงทำผ่าน npm scripts ที่เตรียมไว้แล้วใน `package.json`.

---

## 🔁 Redeploy (กรณีปกติ — อัปเดตโค้ด)

1. **Git pull** — Plesk Git → pull `master` ล่าสุด
2. **NPM install** — *เฉพาะเมื่อ dependency เปลี่ยน* (postinstall จะ `prisma generate` ให้เอง)
3. **Run script → `migrate:deploy`** — *เฉพาะเมื่อมี migration ใหม่* (มี `prisma/migrations/*` เพิ่ม)
4. **Run script → `build`**
5. **Restart App**
6. เช็ก https://siam-journey.com โหลดปกติ

> ถ้าแก้แค่เนื้อหา/UI ไม่มี dep/migration ใหม่ → แค่ pull → build → restart

---

## 🆕 First-time setup (ทำครั้งเดียว)

**Pre:** Node.js panel → Node **≥ 20**, Application Root = โฟลเดอร์ repo, Application Startup File = **`server.js`**, Application Mode = production

1. **สร้าง DB** — Plesk → Databases → MySQL/MariaDB + user (จด name/user/pass/host)
2. **ตั้ง env (runtime)** — Node.js panel → Custom environment variables:
   ```
   DATABASE_URL = mysql://USER:PASS@localhost:3306/DBNAME
   ADMIN_EMAIL  = <อีเมล admin>
   NODE_ENV     = production
   ```
   ⚠️ ถ้า PASS มีอักขระพิเศษ (`@ # : / % ? &`) ต้อง URL-encode
3. **สร้าง `.env`** ใน Application Root (File Manager) — ค่าเดียวกับข้อ 2 (`DATABASE_URL` + `ADMIN_EMAIL`)
   → **จำเป็น** เพราะ env ของ panel ไม่ถึง "Run script" (CLI), Prisma CLI โหลด `.env` เอง
4. **Git pull** repo เข้า Application Root
5. **NPM install** (postinstall → prisma generate)
6. **Run script → `migrate:deploy`** (สร้างตาราง)
7. **Run script → `build`**
8. **SSL** — Plesk → SSL/TLS Certificates → Let's Encrypt + บังคับ https
   → **จำเป็นต่อ auth**: session cookie เป็น `secure` จะไม่ถูกเก็บบน http
9. ปิด **ModSecurity react2shell rule** (ดู Gotcha #4 ล่าง) — ไม่งั้น register/login/บันทึกร้าน จะ 403
10. **Restart App**
11. ตั้ง admin: register บัญชี `ADMIN_EMAIL` ที่หน้าเว็บ → **Run script → `db:seed`** → promote เป็น admin

---

## ⚠️ Gotchas (ปัญหาที่เจอจริง + วิธีแก้)

**1. `P1012 Environment variable not found: DATABASE_URL` ตอน migrate/seed**
Panel env vars ไม่ถึง "Run script". → สร้าง `.env` ใน Application Root (ข้อ 3).

**2. `P3018 / error 1146 table 'merchant' doesn't exist`** (casing Windows→Linux)
Windows XAMPP เก็บชื่อตารางตัวเล็ก, Linux case-sensitive. ทุก model ต้องมี `@@map("ตัวเล็ก")` แล้ว.
→ migration ที่ generate บน Windows ต้องเช็กว่าชื่อตาราง consistent ก่อน push. ถ้าเพี้ยน + ยังไม่มี prod data: `@@map` + squash migration ใหม่.

**3. `P3009 migrate found failed migrations`**
migrate รอบก่อนล้มค้าง. ถ้า **ยังไม่มี prod data**: **Run script → `migrate:reset`** (drop+apply ใหม่หมด). ถ้ามี data แล้ว: ใช้ `prisma migrate resolve` (อย่า reset).

**4. register/login/บันทึกร้าน ขึ้น "This page couldn't load" (403)** — ModSecurity บล็อก Server Actions
WAF rule `react2shell` (CVE-2025-55182) จับ `"$@1"` Flight sentinel ของ Server Action.
→ Plesk → domain → **Web Application Firewall (ModSecurity)** → คง mode **On** → **"Switch off security rules" → Security rule IDs**:
```
1055182000-1055182099
```
ปลอดภัยเพราะแอป patched แล้ว (react ≥19.2.1, next ≥16.0.7). **อย่าใช้ `.htaccess SecRuleRemoveById`** — โฮสต์ล็อก override → 500 ทั้งเว็บ.
เช็กสาเหตุจริงเสมอที่ **Plesk → Logs** (Apache error) ก่อนแก้ อย่าเดา.

---

## ✅ Verify หลัง deploy

```
curl -I https://siam-journey.com/                    # 200
curl -o /dev/null -w '%{http_code}' https://siam-journey.com/north/chiang-mai   # 200 (SSG)
```
แล้วทดสอบใน browser: register → dashboard → แก้ข้อมูลร้าน+บันทึก ("บันทึกข้อมูลร้านแล้ว") → `/shop/<id>` → `/admin`

## Scripts (`package.json`)
- `build` = `next build`
- `start` = `node server.js` (Passenger entry)
- `migrate:deploy` = `prisma migrate deploy` (prod, ไม่ต้อง shadow DB)
- `migrate:reset` = `prisma migrate reset --force --skip-seed` (ล้าง+สร้างใหม่ — dev/pre-launch เท่านั้น)
- `db:seed` = `prisma db seed` (promote `ADMIN_EMAIL` → admin)
