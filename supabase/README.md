# Supabase migration - Teacher Cockpit SMT ป.4/2

เป้าหมายของโฟลเดอร์นี้คือเตรียมฐานข้อมูล Supabase ให้ตรงกับ Google Apps Script เวอร์ชันใช้งานจริงของห้อง `SMT ป.4/2` โดยยังเก็บ Google Sheets เป็นฐานหลัก/backup ได้ในช่วงแรก

## สถานะล่าสุด

- ล้างข้อมูลทดสอบ `TEST` ออกจาก Google Sheets แล้ว
- Schema Supabase พร้อมสำหรับข้อมูลจริง 35 คน
- รองรับตารางหลักของระบบปัจจุบัน:
  - `students`
  - `attendance`
  - `homework`
  - `homework_status`
  - `behavior`
  - `follow_ups`
  - `scores`
  - `audit_logs`
  - `sync_runs`
- รองรับรูปนักเรียนด้วย Supabase Storage bucket `student-photos`
- เปิด Row Level Security ทุกตารางใน `public`

## วิธีสร้างฐานข้อมูลบน Supabase

1. เข้า Supabase Dashboard แล้วสร้าง Project
2. ไปที่ SQL Editor
3. เปิดไฟล์ `supabase/schema.sql`
4. คัดลอก SQL ทั้งไฟล์ไปรันใน SQL Editor
5. ตรวจว่ามีตาราง `students`, `attendance`, `homework`, `behavior`, `follow_ups`, `scores`
6. ตรวจ Storage ว่ามี bucket `student-photos`

## ตั้งค่าผู้ใช้ครู

สร้างผู้ใช้ใน Authentication ก่อน แล้วคัดลอก `User UID` มาใส่ใน `profiles`

```sql
insert into public.profiles (id, display_name, role)
values
  ('AUTH_UID_ครูฐิติยาภรณ์', 'นางฐิติยาภรณ์ วิเศษโวหาร', 'teacher'),
  ('AUTH_UID_ครูพิชญานนท์', 'นายพิชญานนท์ วัจนสุนทร', 'teacher'),
  ('AUTH_UID_ครูพงศกร', 'นายพงศกร วิบุญกุล', 'teacher');
```

จากนั้นผูกครูกับห้อง

```sql
insert into public.classroom_teachers (classroom_id, profile_id, teacher_name, teacher_order)
values
  ('c-p4-2', 'AUTH_UID_ครูฐิติยาภรณ์', 'นางฐิติยาภรณ์ วิเศษโวหาร', 1),
  ('c-p4-2', 'AUTH_UID_ครูพิชญานนท์', 'นายพิชญานนท์ วัจนสุนทร', 2),
  ('c-p4-2', 'AUTH_UID_ครูพงศกร', 'นายพงศกร วิบุญกุล', 3)
on conflict (classroom_id, profile_id) do update
set teacher_name = excluded.teacher_name,
    teacher_order = excluded.teacher_order,
    active = true;
```

## Import ข้อมูลจาก Google Sheets

แนะนำให้ทำตามลำดับนี้ เพราะมี foreign key:

1. `students`
2. `homework`
3. `attendance`
4. `homework_status`
5. `behavior`
6. `follow_ups`
7. `scores`

ในช่วงแรกให้ import เฉพาะ `students` ก่อนก็พอ เพื่อให้ระบบพร้อมใช้จริงพรุ่งนี้ ส่วนข้อมูลเช็คชื่อ/พฤติกรรมให้เริ่มบันทึกจริงจากระบบเดิม แล้วค่อย sync ไป Supabase ภายหลัง

ถ้าต้องการนำเข้ารายชื่อจริงแบบเร็ว ให้รันไฟล์นี้หลัง `schema.sql`:

```sql
-- SQL Editor
-- supabase/seed_students_p4_2.sql
```

ไฟล์นี้มีนักเรียนจริง 35 คนของ SMT ป.4/2 และไม่มีข้อมูล TEST

## Mapping จากชีตเดิม

### Students

ชีต `Students` มีหัวคอลัมน์ตรงกับตาราง `students` เกือบทั้งหมด ให้เพิ่มคอลัมน์ `classroom_id` เป็น `c-p4-2` ก่อน import เข้า Supabase

ฟิลด์รูป:

- Google Sheets เดิม: `photo_file_id`, `photo_updated_at`, `photo_by`
- Supabase เพิ่ม: `photo_path` สำหรับ path ใน bucket `student-photos`

แนะนำ path รูปนักเรียน:

```text
c-p4-2/<student_id>/profile.webp
```

### Attendance

ชีต `Attendance` -> ตาราง `attendance`

- เพิ่ม `classroom_id = c-p4-2`
- `by` ในชีตเดิม -> `updated_by`

### Homework

ชีต `Homework` -> ตาราง `homework`

- เพิ่ม `classroom_id = c-p4-2`
- `active` แปลงเป็น boolean: `1` = true

### HomeworkStatus

ชีต `HomeworkStatus` -> ตาราง `homework_status`

### Behavior

ชีต `Behavior` -> ตาราง `behavior`

- เพิ่ม `classroom_id = c-p4-2`
- `by` ในชีตเดิม -> `created_by`
- `follow_up` แปลงเป็น boolean

### FollowUps

ชีต `FollowUps` -> ตาราง `follow_ups`

- เพิ่ม `classroom_id = c-p4-2`

### Scores

ชีต `Scores` -> ตาราง `scores`

- เพิ่ม `classroom_id = c-p4-2`
- `by` ในชีตเดิม -> `updated_by`

## Security notes

- ห้ามใส่ `service_role` key ในหน้าเว็บหรือ Google Apps Script ที่แชร์ให้คนอื่น
- ใช้ `publishable/anon key` เฉพาะกับ client ได้ แต่ต้องเปิด RLS ตาม schema นี้
- ถ้าจะ sync จาก Google Apps Script ไป Supabase แบบเขียนข้อมูลจริง แนะนำให้ใช้ Supabase Edge Function หรือ server-side endpoint ที่เก็บ `service_role` เป็น secret แทนการฝังคีย์ใน GAS

## ขั้นถัดไป

1. รัน `schema.sql` ใน Supabase SQL Editor
2. Import `Students` จาก Google Sheets
3. ทดสอบ login ครู 3 คน
4. ตั้ง sync แบบอ่าน/เขียนทีละตาราง
5. ย้ายรูปนักเรียนจาก Google Drive ไป bucket `student-photos`
