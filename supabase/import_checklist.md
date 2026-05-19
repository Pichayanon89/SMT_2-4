# Import checklist for SMT ป.4/2

ใช้ checklist นี้ก่อนเปิดใช้จริงพรุ่งนี้

## ก่อน import

- รัน `schema.sql` สำเร็จใน Supabase SQL Editor
- สร้างผู้ใช้ครู 3 คนใน Supabase Auth
- แก้ `teacher_setup_template.sql` โดยแทน `AUTH_UID_*` ด้วย User UID จริง แล้วรัน
- เปิด Google Sheets แล้วตรวจว่าไม่มีแถวที่มีคำว่า `TEST`

## ลำดับ import ที่แนะนำ

1. Import `Students`
   - เพิ่มคอลัมน์ `classroom_id` ค่า `c-p4-2`
   - แปลง `active`: `1` เป็น `true`
   - ถ้ายังไม่มีรูปใน Supabase ให้เว้น `photo_path`
2. Import `Homework` เฉพาะถ้ามีงานจริง
3. Import `Attendance` เฉพาะข้อมูลจริง
4. Import `HomeworkStatus`
5. Import `Behavior`
6. Import `FollowUps`
7. Import `Scores`

## ทดสอบหลัง import

- `select count(*) from public.students where classroom_id = 'c-p4-2';` ต้องได้ `35`
- Login ครูแล้วอ่าน `students` ได้
- ครูเห็นข้อมูล `attendance`, `behavior`, `follow_ups`
- ผู้ใช้ที่ไม่ใช่ครูไม่ควรอ่านข้อมูลทั้งห้องได้

## หมายเหตุ

ถ้าจะใช้งานจริงพรุ่งนี้โดยไม่เสี่ยง ให้ใช้ Google Apps Script + Google Sheets เป็นระบบหลักต่อไปก่อน แล้วให้ Supabase เป็นฐานสำรอง/ฐานทดลองจนกว่าการ sync จะผ่านครบทุกหน้าจอ
