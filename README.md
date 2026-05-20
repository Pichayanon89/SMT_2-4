# Teacher Cockpit SMT ป.4/2

เว็บเวอร์ชันใหม่สำหรับย้ายออกจาก Google Apps Script ไปใช้ GitHub + Supabase

## Stack

- React + Vite
- Supabase Auth
- Supabase Postgres
- Supabase Storage สำหรับรูปนักเรียน

## ตั้งค่า local

1. ติดตั้ง dependency

```bash
npm install
```

2. สร้างไฟล์ `.env.local`

```env
VITE_SUPABASE_URL=https://dqudvtapdypzngmwaega.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_PzeH2jrH8EQI-HmIpOhQ1g_eFySvIhH
```

3. รันฐานข้อมูลใน Supabase SQL Editor

```text
supabase/schema.sql
supabase/teacher_setup_template.sql
supabase/seed_students_p4_2.sql
```

4. เปิด local

```bash
npm run dev
```

## Deploy

แนะนำเริ่มด้วย Vercel เพราะตั้ง environment variables ง่ายกว่า GitHub Pages

Environment variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

ถ้าจะใช้ GitHub Pages ให้ตั้ง repository secrets/variables แล้วใช้ workflow ใน `.github/workflows/deploy.yml`

## การใช้งานวันแรก

1. Login ด้วยบัญชีครูที่สร้างไว้ใน Supabase Auth
2. ตรวจรายชื่อในหน้า `นักเรียน`
3. ทดสอบเช็คชื่อและอัปโหลดรูปนักเรียน
4. ถ้ารายชื่อหาย ให้ไปหน้า `ตั้งค่า` แล้วกด `นำเข้ารายชื่อ 35 คน`

ปุ่ม `นำเข้ารายชื่อ 35 คน` ใช้ข้อมูลจาก `src/data/students_p4_2_35.json` ซึ่งสร้างจากชุดข้อมูลจริงเดียวกับระบบ GAS

ถ้าต้องการนำเข้ารายชื่อโดยตรงผ่าน SQL ให้รัน `supabase/seed_students_p4_2.sql` แทนข้อ 5 ได้ ไฟล์นี้เป็นรายชื่อจริง 35 คนและไม่มีข้อมูลทดสอบ

## Push ขึ้น GitHub

หลังสร้าง repository ว่างบน GitHub แล้วรัน:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

ถ้าใช้ GitHub Pages ให้เข้า Settings > Pages แล้วเลือก GitHub Actions จากนั้นตั้ง Repository Variables:

- `VITE_SUPABASE_URL` = `https://dqudvtapdypzngmwaega.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY` = `sb_publishable_PzeH2jrH8EQI-HmIpOhQ1g_eFySvIhH`

ถ้าใช้ Vercel ให้ Import repository แล้วตั้ง Environment Variables ชื่อเดียวกัน

## หมายเหตุ

ระบบ GAS เดิมยังควรเก็บไว้เป็น fallback จนกว่าเว็บ Supabase จะผ่านการทดสอบครบอย่างน้อย 1-2 วันเรียน
