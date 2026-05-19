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
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

3. รันฐานข้อมูลใน Supabase SQL Editor

```text
supabase/schema.sql
supabase/teacher_setup_template.sql
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

1. สร้างผู้ใช้ครู 3 คนใน Supabase Auth
2. ใส่ UID ครูใน `supabase/teacher_setup_template.sql` แล้วรัน
3. Login ด้วยบัญชีครู
4. ไปหน้า `ตั้งค่า`
5. กด `นำเข้ารายชื่อ 35 คน`
6. ทดสอบเช็คชื่อและอัปโหลดรูปนักเรียน

## หมายเหตุ

ระบบ GAS เดิมยังควรเก็บไว้เป็น fallback จนกว่าเว็บ Supabase จะผ่านการทดสอบครบอย่างน้อย 1-2 วันเรียน
