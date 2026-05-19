# gas-mobile-mvp

ระบบประจำชั้น SMT ป.4/2 แบบ Google Apps Script + Google Sheets สำหรับใช้งานบนมือถือ ลดงานครูประจำชั้น และเก็บข้อมูลเพื่อนำไปวิเคราะห์ภาพรวม/รายบุคคล

## เป้าหมาย

- ใช้ Google Sheets เป็นฐานข้อมูล ไม่ต้องเช่า server
- เปิดใช้งานผ่าน Apps Script Web App บนมือถือ
- ใช้เฉพาะห้อง SMT ป.4/2
- เหลือเฉพาะงานที่ครูใช้จริงประจำวัน
- เก็บข้อมูลพฤติกรรม การมาเรียน งานค้าง และคะแนนสั้น ๆ เพื่อวิเคราะห์ผู้เรียน

## ไฟล์

- `Code.gs` backend + sheet database + analysis
- `Index.html` โครงหน้าเว็บ
- `Style.html` CSS มือถือ
- `Script.html` JavaScript หน้าเว็บ
- `appsscript.json` manifest แนะนำให้ใช้ timezone `Asia/Bangkok` และ V8 runtime

## วิธีติดตั้ง

1. สร้าง Google Sheet ใหม่
2. ไปที่ `Extensions > Apps Script`
3. สร้างไฟล์ 4 ไฟล์ตามชื่อด้านบน แล้ววางโค้ดจากโฟลเดอร์นี้
4. เปิด Project Settings แล้วเปิด `Show appsscript.json manifest file in editor`
5. วาง manifest จาก `appsscript.json` ถ้าต้องการตั้ง timezone/runtime ให้ตรง
6. ใน Apps Script editor เลือกฟังก์ชัน `setupMvp` แล้วกด Run หนึ่งครั้ง
7. กลับไปดู Google Sheet จะมีชีตฐานข้อมูลและรายชื่อ ป.4/2 จำนวน 32 คน
8. Deploy > New deployment > Web app
9. Execute as: `Me`
10. Who has access: ตามนโยบายโรงเรียน แนะนำเริ่มจาก `Anyone with the link` สำหรับทดสอบภายใน
11. เปิด Web App URL บนมือถือ

PIN เริ่มต้นสำหรับครู: `4242`

เปลี่ยน PIN ได้ในชีต `Settings` แถว `teacher_pin`

## ชีตฐานข้อมูล

- `Students`: รายชื่อนักเรียน
- `Attendance`: เช็คชื่อรายวัน
- `Homework`: รายการงาน
- `HomeworkStatus`: สถานะส่งงานรายคน
- `Behavior`: บันทึกพฤติกรรม/การติดตาม
- `Scores`: คะแนนสั้น ๆ หรือประเมินทักษะ
- `Settings`: ค่า config
- `AuditLog`: บันทึกการใช้งาน

## Workflow ครู

1. เปิดหน้าเว็บบนมือถือ
2. กรอก PIN
3. ดู Dashboard ว่าใครต้องติดตาม
4. กดเช็คชื่อวันนี้
5. เพิ่มงานและติ๊กส่ง/ไม่ส่ง
6. บันทึกพฤติกรรมสั้น ๆ เมื่อต้องติดตาม
7. เปิดรายชื่อนักเรียนเพื่อดูเบอร์ผู้ปกครองและวิเคราะห์รายบุคคล

## หมายเหตุ

เวอร์ชันนี้ตั้งใจเป็น MVP สำหรับครูประจำชั้น ไม่ใช่ระบบโรงเรียนเต็มรูปแบบ จึงไม่มีระบบหลายบทบาทหรือหลายห้อง เพื่อลดขั้นตอนและลดภาระงาน
