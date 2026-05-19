# Google Apps Script Backend (MVP)

ใช้ไฟล์นี้เพื่อทำระบบหลายคนใช้งานพร้อมกันจริง (แทน `localStorage`)

## 1) สร้าง Google Sheet
1. สร้าง Spreadsheet ใหม่
2. เปิด Extensions > Apps Script
3. วางโค้ดจาก `Code.gs`
4. Deploy > New deployment > Web app
5. Execute as: `Me`, Who has access: `Anyone with the link`
6. คัดลอก URL Web App

## 2) เตรียมผู้ใช้
ในชีต `Users` เพิ่มแถวตัวอย่าง (header ถูกสร้างอัตโนมัติ):
- `username`, `role`, `pin_hash`, `salt`, `active`
- แนะนำให้ใช้ฟังก์ชัน `upsertUser(username, role, pin, active)` ใน `Code.gs` เพื่อสร้างผู้ใช้แบบ hash อัตโนมัติ

บทบาทที่รองรับ:
- `admin`
- `teacher`
- `parent`
- `student`

## 2.1) ผูกสิทธิ์นักเรียนรายบัญชี
สร้างชีต `AccessMap` (ระบบจะสร้างอัตโนมัติ) โครง:
- `username`, `role`, `student_id`, `active`

ตัวอย่าง:
- `parent1,parent,stu-c-p4-2-10282,1`
- `parent1,parent,stu-c-p4-2-10285,1`
- `student1,student,stu-c-p4-2-10282,1`

## 3) เชื่อมจากหน้าเว็บ
1. เปิดแท็บ `Cloud Sync`
2. ใส่ `GAS Web App URL`
3. ใส่ role/username/pin
4. กด `Login`
5. กด `บันทึกขึ้น Cloud` หรือ `ดึงข้อมูลจาก Cloud`

สำคัญ:
- parent/student จะเห็นเฉพาะ student_id ที่ผูกใน `AccessMap` จากฝั่งเซิร์ฟเวอร์

## 4) โมดูลที่ครอบคลุมตอนนี้ (แยกตารางจริง)
- `Students`
- `Attendance`
- `Scores`
- `Homework`
- `Behavior`
- `Announcements`
- `AuditLog`
- `Backups`
- `Users`

## 5) รูปแบบการ sync ปัจจุบัน
- ฝั่งเว็บยังเรียก `saveState/getState` เหมือนเดิม
- แต่ฝั่ง GAS จะแตกข้อมูลลง 5 ตารางจริงอัตโนมัติ
- เวลา `getState` จะประกอบกลับจากตารางจริงเพื่อให้หน้าเว็บใช้ต่อได้

หมายเหตุ: ตอนนี้เป็น 6 ตารางหลักแล้ว (เพิ่ม `Behavior`)

## 6) รายงานสรุปจาก GAS โดยตรง
เรียก action:
- `reportSummary`
- `whoami` (ตรวจ session/role ปัจจุบัน)
- `listUsers` (ดึงรายชื่อผู้ใช้ตาม role)

ตัวอย่าง payload:
```json
{
  "action": "reportSummary",
  "token": "TOKEN_FROM_LOGIN",
  "username": "admin1",
  "role": "admin"
}
```

ผลลัพธ์หลัก:
- `studentCount`
- `avgScore`
- `bySubject[]` ค่าเฉลี่ยรายวิชา
- `attendance` สรุปวันล่าสุด
- `trend14[]` แนวโน้มเข้าเรียน 14 วัน

ตัวอย่าง `whoami`:
```json
{
  "action": "whoami",
  "token": "TOKEN_FROM_LOGIN"
}
```

ตัวอย่าง `listUsers`:
```json
{
  "action": "listUsers",
  "token": "TOKEN_FROM_LOGIN",
  "targetRole": "teacher"
}
```

## 7) สิทธิ์การเข้าถึง (Role Guard)
ระบบจะตรวจสิทธิ์จาก token หลัง login:
- `admin`: `saveState`, `getState`, `reportSummary`, `audit`, `backup`, `whoami`
- `teacher`: `saveState`, `getState`, `reportSummary`, `audit`, `whoami`
- `parent`: `getState`, `reportSummary`, `audit`, `whoami`
- `student`: `getState`, `reportSummary`, `audit`, `whoami`

เงื่อนไขเพิ่ม:
- ถ้า `username` หรือ `role` ใน request ไม่ตรง token จะถูกปฏิเสธ
- action `login` ไม่ต้องใช้ token
- token มีลายเซ็น HMAC และหมดอายุ (TTL)

## 8) หมายเหตุ Production
- สำหรับโรงเรียนจริง ควรย้าย auth ไป Google Identity หรือ JWT + secret ที่ปลอดภัยกว่า PIN ธรรมดา
- ตั้งสิทธิ์ Web App ให้เหมาะกับนโยบายข้อมูลนักเรียน
