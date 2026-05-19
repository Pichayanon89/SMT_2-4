const APP = {
  classId: "c-p4-2",
  classLabel: "SMT ป.4/2",
  teacherPinDefault: "4242",
  tokenTtlSeconds: 60 * 60 * 12,
  studentDataVersion: "p4-2-full-v4",
  homeroomTeachersDefault: [
    "นางฐิติยาภรณ์ วิเศษโวหาร",
    "นายพิชญานนท์ วัจนสุนทร",
    "นายพงศกร วิบุญกุล",
  ],
};

const SHEETS = {
  settings: "Settings",
  students: "Students",
  attendance: "Attendance",
  homework: "Homework",
  homeworkStatus: "HomeworkStatus",
  behavior: "Behavior",
  followUps: "FollowUps",
  scores: "Scores",
  audit: "AuditLog",
};

const CACHE = {
  ttlSeconds: 300,
  maxChars: 90000,
  prefix: "speed-v1",
};

const HEADERS = {
  Settings: ["key", "value"],
  Students: ["student_id","seq","student_code","full_name","display_name","sex","citizen_id","birthdate_th","registered_address","current_address","father_name","father_citizen_id","mother_name","mother_citizen_id","phone","phone_2","phone_3","guardian_name","guardian_citizen_id","guardian_relationship","parent_status","enrolled_date","previous_class_note","note","needs_review","active","photo_file_id","photo_updated_at","photo_by"],
  Attendance: ["date", "student_id", "status", "note", "updated_at", "by"],
  Homework: ["homework_id", "title", "subject", "due", "created_at", "active", "created_by"],
  HomeworkStatus: ["homework_id", "student_id", "status", "updated_at", "updated_by"],
  Behavior: ["id", "date", "student_id", "category", "tone", "points", "note", "follow_up", "created_at", "by"],
  FollowUps: ["followup_id", "date", "student_id", "topic", "method", "status", "next_date", "note", "created_at", "closed_at", "created_by", "closed_by"],
  Scores: ["date", "student_id", "area", "score", "note", "updated_at", "by"],
  AuditLog: ["at", "event", "detail"],
};

const STUDENT_SEED = [
  ["stu-c-p4-2-10282","1","10282","เด็กชายชนะพล สุโขยะชัย","ชนะพล สุโขยะชัย","ชาย","1419903166642","6-ก.ค.-59","357/1 หมู่ที่ 6 ต.หนองหาน อ.หนองหาน จ.อุดรธานี","ตามทะเบียนบ้าน","นายธนพล สุโขยะชัย","1419900505624","นางสาวมาริษา สุโขยะชัย","1309901165607","0844283304","0802394793","0653561814","นางเสาวคนธุ์ สุโขยะชัย","3410600622534","ย่า","อยู่ด้วยกัน","12-มี.ค.-69","เด็กเก่า ห้อง 3/3","","","1","","",""],
  ["stu-c-p4-2-10285","2","10285","เด็กชายนันทภพ ปรึกษาสนิท","นันทภพ ปรึกษาสนิท","ชาย","1418000169201","24-มิ.ย.-59","54 หมู่ที่ 11 ต.หนองเม็ก อ.หนองหาน จ.อุดรธานี 41130","-","นายมาณพ ปรีกษาสนิท","1410600239017","นางสาวธิดารัตน์ เหล่ามูล","1410600231270","0891493480","0886342542","0891493480","นางบุญยัง ปรึกษาสนิท","3410600203388","","หย่าร้าง","20-มี.ค.-64","","","","1","","",""],
  ["stu-c-p4-2-10529","3","10529","เด็กชายกฤษณะ โพธิดอกไม้","กฤษณะ โพธิดอกไม้","ชาย","1418000168558","10-มิ.ย.-59","9 หมู่ที่ 6 ต.หนองหาน อ.หนองหาน จ.อุดรธานี 41130","ตามทะเบียนบ้าน","นายสรศักดิ์ โพธิดอกไม้","3410600597530","นางสาววิจิตรา ราษฎร์บำรุง","3410600751661","0838976589","0954800622","","นางสาววิจิตรา ราษฎร์บำรุง","3410600751661","แม่","อยู่ด้วยกัน","","","","","1","","",""],
  ["stu-c-p4-2-10539","4","10539","เด็กชายชนายุตม์ ลุนพิจิตร","ชนายุตม์ ลุนพิจิตร","ชาย","1418000170269","7-ส.ค.-59","65 หมู่ที่ 19 ต.หนองเม็ก อ.หนองหาน จ.อุดรธานี 41130","ตามทะเบียนบ้าน","นายชานนต์ ลุนพิจิตร","3410600294405","นางสาวฤทัย ศรียอด","1410600133448","0942575885","0619424558","","นางสาวฤทัย ศรียอด","1410600133448","แม่","อยู่ด้วยกัน","9-มี.ค.-69","เด็กเก่า ห้อง 3/3","","","1","","",""],
  ["stu-c-p4-2-10551","5","10551","เด็กชายณฐพงศ์ วงมล","ณฐพงศ์ วงมล","ชาย","1418000170811","22-ส.ค.-59","90 หมู่ที่ 11 ต.หนองเม็ก อ.หนองหาน จ.อุดรธานี 41130","ตามทะเบียนบ้าน","นายศรัณย์ จันทร์ปัญญา","1410600231806","นางสาวพรพรรณ วงมล","1410600331762","","","","นางเหนือลม วงมล","3410600006574","ยาย","แยกกันอยู่","","เด็กเก่า ห้อง 3/4","","","1","","",""],
  ["stu-c-p4-2-10552","6","10552","เด็กชายทิพสาร มากไธสง","ทิพสาร มากไธสง","ชาย","1103400386631","11-ต.ค.-59","236 หมู่ 3 ต.หนองหาน อ.หนองหาน จ.อุดรธานี 41130","ตามทะเบียนบ้าน","นายทนงศักดิ์ มากไธสง","1101500913640","นางรุ่งเรือง ภูกิ่งพลอย","5410700017329","0635836740","0860326019","","นางสาววริศฐิภา มากไธสง","1410600231008","ป้า","มารดาถึงแก่กรรม","11-ก.พ.-69","เด็กเก่า ห้อง 3/4","","","1","","",""],
  ["stu-c-p4-2-10554","7","10554","เด็กชายจิรพัฒน์ ราชศรีเมือง","จิรพัฒน์ ราชศรีเมือง","ชาย","1418000172041","6-ต.ค.-59","262 หมู่ที่ 12 ต.หนองหาน อ.หนองหาน จ.อุดรธานี 41130","1 หมู่ที่ 12 ต.หนองหาน อ.หนองหาน จ.อุดรธานี 41130","นายกิตติราชนรินทร์ ราชศรีเมือง","1419900342580","นางสาวเจนจิรา ทิพพิชชัย","1410600302681","0923688846","","","นางสาวพรฤดี นรินทร์","34106008839982","ย่า","แยกกันอยู่","15-ก.พ.-69","เด็กเก่า ห้อง 3/4","","","1","","",""],
  ["stu-c-p4-2-10736","8","10736","เด็กชายจิรภัทท์ อุดมสุวรรณ์","จิรภัทท์ อุดมสุวรรณ์","ชาย","1419903224511","16-เม.ย.-60","24 หมู่ที่ 1 ต.สร้อยพร้าว อ.หนองหาน จ.อุดรธานี 41130","ตามทะเบียนบ้าน","นายพนม อุดมสุวรรณ์","3412100022149","นางสาวน้ำฝน นาโสม","1410600166826","0956729109","","","นางสาวน้ำฝน นาโสม","1410600166826","มารดา","แยกกันอยู่","24-ก.พ.-69","เด็กเก่า ห้อง 3/3","","","1","","",""],
  ["stu-c-p4-2-10737","9","10737","เด็กชายณัฏชานันท์ ทองเขียว","ณัฏชานันท์ ทองเขียว","ชาย","1209703048257","3-เม.ย.-59","137 หมู่ที่ 12 ต.หนองเม็ก อ.หนองหาน จ.อุดรธานี","-","นายชาตรี ทองเขียว","3670400435828","นางสาวนิภาพร นาอิสาน","1410600049455","0872356561","0942492124","","นางสาวนิภาพร นาอิสาน","1410600049455","มารดา","หย่าร้าง","16-ก.พ.-69","เด็กเก่า ห้อง 3/3","","","1","","",""],
  ["stu-c-p4-2-10964","10","10964","เด็กชายณัฐวรรธน์ ภูดิน","ณัฐวรรธน์ ภูดิน","ชาย","1419903197742","29-พ.ย.-59","35 หมู่ที่ 11 ต.บ้านผือ อ.บ้านผือ จ.อุดรธานี 41160","ตามทะเบียนบ้าน","นายสราวุธ เสี่ยงตรง","3320101305526","นางสาวศิรินันท์ ภูดิน","1411700062268","0857472288","","","นางสาวศิรินันท์ ภูดิน","1411700062268","แม่","หย่าร้าง","14-ก.พ.-69","เด็กเก่า ห้อง 3/3","","","1","","",""],
  ["stu-c-p4-2-seq-11","11","","เด็กชายณัฐพัชร์ สารพิมพา","ณัฐพัชร์ สารพิมพา","ชาย","1419903205231","27-ธ.ค.-59","766/133 หมู่ที่ 1 ต.บ้านเลื่อม อ.เมือง จ.อุดรธานี 41000","577 หมู่ที่ 6 ถ.เด่นชัย ต.หนองหาน อ.หนองหาน จ.อุดรธานี 41130","นายเจติษฐา สารพิมพา","1309900879053","นางสาวมัณฑนา อธิรัตนทรัณฑ์","1410100250135","0876369363","0801762073","","นายนพดล อธิรัตนทรัณฑ์","","ตา","อยู่ด้วยกัน (จดทะเบียน)","11-มี.ค.-69","","","","1","","",""],
  ["stu-c-p4-2-seq-12","12","","เด็กชายพีรภัทร จันทร์แจ่ม","พีรภัทร จันทร์แจ่ม","ชาย","5410601172237","19-มี.ค.-60","103 หมู่ที่ 2 บ้านผักตบ ต.ผักตบ อ.หนองหาน จ.อุดรธานี 41130","ตามทะเบียนบ้าน","นายประสิทธิ์ จันทร์แจ่ม","3630200082654","นางสาววาริณี ขามอุดม","1419900201684","0611690988","","","นางฉวีวรรณ์ ขามอุดม","3410601151691","ยาย","อยู่ด้วยกัน(ไม่จดทะเบียน)","1-ก.พ.-69","","","","1","","",""],
  ["stu-c-p4-2-seq-13","13","","เด็กชายจักรภัทร มีจันที","จักรภัทร มีจันที","ชาย","1418000170714","29-ส.ค.-59","90 หมู่ที่ 4 ต.สะแบง อ.หนองหาน จ.อุดรธานี 41130","ตามทะเบียนบ้าน","นายวิสิทธิ์ มีจันที","","นางสาวอรอนงค์ คำศรีระภาพ","","0622702906","0981540359","","นางศรีไพร คำศรีระภาพ","","ยาย","อยู่ด้วยกัน (จดทะเบียน)","11-พ.ค.-69","","","","1","","",""],
  ["stu-c-p4-2-seq-14","14","","เด็กชายธนโชติ ลุนไชยภา","ธนโชติ ลุนไชยภา","ชาย","1419903156191","10-พ.ค.-59","140 หมู่ที่ 4 บ้านบ่อปัทม์ ต.สะแบง อ.หนองหาน จ.อุดรธานี 41130","ตามทะเบียนบ้าน","นายจักรรัตน์ หารเสนา","","นางสาวทิพย์วรรณ ลุนไขยภา","","0630079304","","","นางสาวทิพย์วรรณ ลุนไขยภา","","มารดา","แยกกันอยู่","11-พ.ค.-69","","","","1","","",""],
  ["stu-c-p4-2-10262","15","10262","เด็กหญิงญาณิศา ริเกษกัน","ญาณิศา ริเกษกัน","หญิง","1416700004068","23-ก.ย.-59","100 หมู่ที่ 6 ต.หนองไผ่ อ.หนองหาน จ.อุดรธานี 41130","ตามทะเบียนบ้าน","นายสุริยะ ริเกษกัน","5410600020697","นางรัชฎาพร ริเกษกัน","3410600175043","0637267256","","","นางรัชฎาพร ริเกษกัน","3410600175043","มารดา","อยู่ด้วยกัน","10-มี.ค.-69","เด็กเก่า ห้อง 3/2","","","1","","",""],
  ["stu-c-p4-2-10270","16","10270","เด็กหญิงพิมพ์มาดา แพนดี","พิมพ์มาดา แพนดี","หญิง","1418000170374","12-ส.ค.-59","236 หมู่ที่ 2 ต.หนองหาน อ.หนองหาน จ.อุดรธานี 41130","ตามทะเบียนบ้าน","นายศุภชัย แพนดี","1411300016552","นางลำไพ วงพะจัน","","0979525488","","","","","","อยู่ด้วยกัน","9-มี.ค.-69","เด็กเก่า ห้อง 3/3","","","1","","",""],
  ["stu-c-p4-2-10276","17","10276","เด็กหญิงกวินธิดา ทิพย์มะณี","กวินธิดา ทิพย์มะณี","หญิง","1418000172326","23-ต.ค.-59","5 หมู่ที่ 5 ต.ค้อใหญ่ อ.กู่แก้ว จ.อุดรธานี 41130","ตามทะเบียนบ้าน","นายวิจิตร ทิพย์มณี","1450590002150","นางสาวสำฤทธิ์ พันธุ์พรม","1410600044496","0843553840","0807503404","","นางสาวสำฤทธิ์ พันธุ์พรม","1410600044496","มารดา","อยู่ด้วยกัน(ไม่จดทะเบียน)","9-ก.พ.-69","เด็กเก่า ห้อง 3/1 MEP","","","1","","",""],
  ["stu-c-p4-2-10294","18","10294","เด็กหญิงกิตติกานต์ จิโนเป็ง","กิตติกานต์ จิโนเป็ง","หญิง","1419903194794","11-พ.ย.-59","207 หมู่ที่ 11 ต.หนองหาน อ.หนองหาน จ.อุดรธานี 41130","ตามทะเบียนบ้าน","นายวิริยะ จิโนเป็ง","1410600115024","นางสาวอรพรรณ พูลทอง","1410600047401","0651020991","0953651096","","นางสาวอรพรรณ พูลทอง","1410600047401","มารดา","อยู่ด้วยกัน","11-มี.ค.-69","เด็กเก่า ห้อง 3/2","","","1","","",""],
  ["stu-c-p4-2-10297","19","10297","เด็กหญิงนัชนิชา แก้วทองคำ","นัชนิชา แก้วทองคำ","หญิง","1419903191400","29-ต.ค.-59","162 หมู่ที่ 2 ต.หนองไผ่ อ.หนองหาน จ.อุดรธานี 41130","ตามทะเบียนบ้าน","นายอุทัย แก้วทองคำ","347120036643","นางสาวนวลจันทร์ นาไชยสินธ์","1410600085940","0898885886","0623749978","","นางสาวนวลจันทร์ นาไชยสินธ์","1410600085940","มารดา","อยู่ด้วยกัน","16-มี.ค.-69","เด็กเก่า ห้อง 3/2","","","1","","",""],
  ["stu-c-p4-2-10303","20","10303","เด็กหญิงพิมพ์ชนก นนทะคำจันทร์","พิมพ์ชนก นนทะคำจันทร์","หญิง","1418000168159","21-พ.ค.-59","262 หมู่ที่ 10 ต.หนองหาน อ.หนองหาน จ.อุดรธานี 41130","ตามทะเบียนบ้าน","นายศราวุฒิ นนทะคำจันทร์","2410600018906","นางสาวอุบลศิริ วงษ์สินธ์","1410600310501","0612606442","","","นางเนาวนิต นนทะคำจันทร์","5410600083966","ย่า","แยกกันอยู่(ไม่จดทะเบียน)","10-มี.ค.-69","เด็กเก่า ห้อง 3/4","","","1","","",""],
  ["stu-c-p4-2-10523","21","10523","เด็กหญิงกัญญาวีร์ ชิณวงษ์","กัญญาวีร์ ชิณวงษ์","หญิง","1419903159964","3-มิ.ย.-59","134 หมู่ที่ 3 ต.พังงู อ.หนองหาน จ.อุดรธานี 41130","ตามทะเบียนบ้าน","นายสุเทพ ชิณวงษ์","1410600248041","นางสาวคนึงนิจ ภูมิมิตร","1410600321759","0886988504","","","นางสาวคนึงนิจ ภูมิมิตร","1410600321759","แม่","อยู่ด้วยกัน","9-มี.ค.-69","เด็กเก่า ห้อง 3/1 MEP","","","1","","",""],
  ["stu-c-p4-2-10527","22","10527","เด็กหญิงศิรินภา แสนบุญ","ศิรินภา แสนบุญ","หญิง","1409904544331","25-ส.ค.-59","150 หมู่ที่ 1 ต.หนองโน อ.กระนวน จ.ขอนแก่น 40170","173 หมู่ที่ 16 ต.โพนงาม อ.หนองหาน จ.อุดรธานี 41130","นายวทัญญู แฟนพิมาย","1411800120561","นางสาวเพ็ญพักต์ แสนบุญ","1400900128890","0801544958","","","นางสาวเพ็ญพักต์ แสนบุญ","1400900128890","แม่","แยกกันอยู่","","เด็กเก่า ห้อง 3/1 MEP","","","1","","",""],
  ["stu-c-p4-2-10534","23","10534","เด็กหญิงณัชชา พิลาแหวน","ณัชชา พิลาแหวน","หญิง","1419903210064","29-ม.ค.-60","133 หมู่ที่ 7 ต.หนองเม็ก อ.หนองหาน จ.อุดรธานี 41130","ตามทะเบียนบ้าน","นายวีรวัฒน์ พิลาแหวน","1410600201451","นางสาวสุกัญญา บัวทอง","1341500208430","0821192991","0933199958","0836715649","นางนิตยา พิลาแหวน","3410600077978","ยาย","อยู่ด้วยกัน","10-มี.ค.-69","เด็กเก่า ห้อง 3/2","","","1","","",""],
  ["stu-c-p4-2-10542","24","10542","เด็กหญิงกมลชนก จันทร์ปัญญา","กมลชนก จันทร์ปัญญา","หญิง","1419903195103","14-พ.ย.-59","133 หมู่ที่ 9 ต.ทุ่งใหญ่ อ.ทุ่งฝน จ.อุดรธานี 41310","ตามทะเบียนบ้าน","นายวรวิทย์ จันทร์ปัญญา","1410600220511","นางกัลญา จันทร์ปัญญา","1410700043688","0923281242","0624403714","0939902714","นางนิ่มนวล สร้อยสองสี","3410700210009","ยาย","อยู่ด้วยกัน","11-มี.ค.-69","เด็กเก่า ห้อง 3/3","","","1","","",""],
  ["stu-c-p4-2-10543","25","10543","เด็กหญิงปทิตตา บุญสุนทร","ปทิตตา บุญสุนทร","หญิง","1418000169929","19-ก.ค.-59","130 หมู่ที่ 19 ต.หนองเม็ก อ.หนองหาน จ.อุดรธานี 41130","ตามทะเบียนบ้าน","นายวรายุทธ์ บุญสุนทร","1410600018827","นางสาวนิโลบล ประการแก้ว","1418000081859","0825182484","0649959961","","นางสาวนิโลบล ประการแก้ว","1418000081859","แม่","อยู่ด้วยกัน","16-มี.ค.-69","เด็กเก่า ห้อง 3/3","","","1","","",""],
  ["stu-c-p4-2-10544","26","10544","เด็กหญิงสิรินาถ สุขศิลป์","สิรินาถ สุขศิลป์","หญิง","1418000168175","21-พ.ค.-59","5 หมู่ที่ 19 ต.หนองเม็ก อ.หนองหาน จ.อุดรธานี 41130","ตามทะเบียนบ้าน","นายสมศักดิ์ สุขศิลป์","3320500295761","นางสาวรัตนา รักษาเมือง","1410600035659","0610294386","0634727683","","นางสาวรัตนา รักษาเมือง","1410600035659","แม่","อยู่ด้วยกัน","9-มี.ค.-69","เด็กเก่า ห้อง 3/3","","","1","","",""],
  ["stu-c-p4-2-10546","27","10546","เด็กหญิงเบญญาพร นารีโภชน์","เบญญาพร นารีโภชน์","หญิง","1419903159930","2-มิ.ย.-59","147 หมู่ที่ 18 ต.หนองเม็ก อ.หนองหาน จ.อุดรธานี 41130","ตามทะเบียนบ้าน","นายคมสัน นารีโภชน์","1410600305087","นางสาวเพ็ญพักตร์ แสงจันทร์","1410600185669","0894207772","","","นางสาวปราณี สังกะสี","3410600023924","ย่า","แยกกันอยู่","9-มี.ค.-69","เด็กเก่า ห้อง 3/3","","","1","","",""],
  ["stu-c-p4-2-10558","28","10558","เด็กหญิงปิยะธิดา รัตนพลแสน","ปิยะธิดา รัตนพลแสน","หญิง","1418000177115","7-พ.ค.-60","66 หมู่ที่ 2 ต.พังงู อ.หนองหาน จ.อุดรธานี 41130","ตามทะเบียนบ้าน","นายจีรวัฒน์ รัตนพลแสน","1418000096309","นางสาวเกศสุดา โชคดี","1410601351317","0612826840","","","นางทองใบ โชคดี","3410601314396","ยาย","แยกกันอยู่","6-มี.ค.-69","เด็กเก่า ห้อง 3/4","","","1","","",""],
  ["stu-c-p4-2-10960","29","10960","เด็กหญิงธัญวรัตน์ สุริวงศ์","ธัญวรัตน์ สุริวงศ์","หญิง","1328600072111","25-พ.ค.-59","167 หมู่ที่ 3 ต.หนองไผ่ อ.หนองหาน จ.อุดรธานี 41130","ตามทะเบียนบ้าน","นายวิรัตน์ สุริวงศ์","","นางสาวดวงเดือน นามจิตต์","","0629484527","0933377384","","นางสาวดวงเดือน นามจิตต์","","แม่","อยู่ด้วยกัน","","","","","1","","",""],
  ["stu-c-p4-2-10961","30","10961","เด็กหญิงเกวลิน บุญสา","เกวลิน บุญสา","หญิง","1418000171095","9-ก.ย.-59","23 หมู่ที่ 13 บ้านผักตบ ต.ผักตบ อ.หนองหาน จ.อุดรธานี 41130","ตามทะเบียนบ้าน","นายสมัคร บุญสา","1419900328021","นางสาวสุภาวดี ภูมิมิตร","1419900411221","0800061938","","","นางสาวสุภาวดี ภูมิมิตร","1419900411221","แม่","อยู่ด้วยกัน(จดทะเบียนสมรส)","10-มี.ค.-69","เด็กเก่า ห้อง 3/2","","","1","","",""],
  ["stu-c-p4-2-10967","31","10967","เด็กหญิงณัฐนิชา ดวงจันทร์","ณัฐนิชา ดวงจันทร์","หญิง","1419903164038","22-มิ.ย.-59","49 หมู่ที่ 2 บ้านน้ำรอด ต.นาทราย อ.พิบูลย์รักษ์ จ.อุดรธานี 41130","ตามทะเบียนบ้าน","นายวรากร ดวงจันทร์","1410601360791","นางสาวแสงดาว ทัพธานี","1410600328818","0623544805","","","นางสาวแสงดาว ทัพธานี","1410600328818","แม่","อยู่ด้วยกัน(ไม่จดทะเบียน)","10-มี.ค.-69","เด็กเก่า ห้อง 3/4","","","1","","",""],
  ["stu-c-p4-2-10968","32","10968","เด็กหญิงพรธิดา ขุนหาร","พรธิดา ขุนหาร","หญิง","1418000173675","12-ธ.ค.-59","103 หมู่ที่ 7 ต.สะแบง อ.หนองหาน จ.อุดรธานี 41130","39 หมู่ที่ 3 บ้านไร่พัฒนา ต.สะแบง อ.หนองหาน จ.อุดรธานี 41130","นายขจรศักดิ์ ขุนหาร","1410600224745","นางสาวสประกายแก้ว นาทันรีบ","1410600296916","0972296741","0933987122","","นายจรัญ นาทันรีบ","3410600965377","ตา","อยู่ด้วยกัน(ไม่จดทะเบียน)","10-มี.ค.-69","เด็กเก่า ห้อง 3/4","","","1","","",""],
  ["stu-c-p4-2-seq-31","33","","เด็กหญิงธันยพร พรมเภา","ธันยพร พรมเภา","หญิง","1419903166294","6-ก.ค.-59","118 หมู่ที่ 1 บ้านโพนสูงสวัสดี ต.โพนสูง อ.บ้านดุง จ.อุดรธานี 41190","ตามทะเบียนบ้าน","นายดาวนคร พรมเภา","3411100342550","นางกีรพร พรมเภา","1410600051603","0840247489","0917903061","","นางกีรพร พรมเภา","1410600051603","มารดา","อยู่ด้วยกัน (จดทะเบียน)","21-ก.พ.-69","","","","1","","",""],
  ["stu-c-p4-2-seq-32","34","","เด็กหญิงพรนภา สีแสง","พรนภา สีแสง","หญิง","1419903227692","1-พ.ค.-60","188 หมู่ที่ 4 บ้านบ่อปัทม์ ต.สะแบง อ.หนองหาน จ.อุดรธานี 41130","ตามทะเบียนบ้าน","นายทินกร สีแสง","1410400293255","นางสาวอังศนา ราชภักดี","1410600298013","0630057311","0931100074","0656190400","นางนันทยา ศิริทา","3410600538541","ยาย","อยู่ด้วยกัน(ไม่จดทะเบียน)","11-มี.ค.-26","","","","1","","",""],
  ["stu-c-p4-2-seq-35","35","","เด็กหญิงภัทรานิษฐ์ หลงน้อย","ภัทรานิษฐ์ หลงน้อย","หญิง","1419903181625","14-ก.ย.-59","87/1 หมู่ที่ 8 บ้านหนองนาดี ต.สำโรง อ.หนองสองห้อง จ.ขอนแก่น","175 หมู่ที่ 2 บ้านโนนสะสาด ต.ทุ่งฝน อ.ทุ่งฝน จ.อุดรธานี 41310","นายทวี หลงน้อย","","นางสาวนฤมล หลงน้อย","","0958957393","0801813058","","นางสาวนฤมล หลงน้อย","","มารดา","อยู่ด้วยกัน (จดทะเบียน)","20-เม.ย.-26","สอบวันที่ 11 พ.ค. 69","","","1","","",""]
];

function doGet(e) {
  setupIfNeeded_();
  return HtmlService.createTemplateFromFile("Index")
    .evaluate()
    .setTitle("SMT ป.4/2")
    .addMetaTag("viewport", "width=device-width, initial-scale=1, viewport-fit=cover");
}

function include(name) {
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}

function setupMvp() {
  Object.keys(SHEETS).forEach((key) => ensureSheet_(SHEETS[key]));
  const settings = ensureSheet_(SHEETS.settings);
  if (settings.getLastRow() <= 1) {
    settings.getRange(2, 1, 7, 2).setValues([
      ["teacher_pin", APP.teacherPinDefault],
      ["class_id", APP.classId],
      ["class_label", APP.classLabel],
      ["school_year", "2569"],
      ["homeroom_teacher_1", APP.homeroomTeachersDefault[0]],
      ["homeroom_teacher_2", APP.homeroomTeachersDefault[1]],
      ["homeroom_teacher_3", APP.homeroomTeachersDefault[2]],
    ]);
  }
  ensureDefaultSettings_();
  const students = ensureSheet_(SHEETS.students);
  if (students.getLastRow() <= 1) {
    students.getRange(2, 1, STUDENT_SEED.length, STUDENT_SEED[0].length).setValues(STUDENT_SEED);
  }
  migrateStudentDataIfNeeded_();
  log_("setup", { students: STUDENT_SEED.length });
  return { ok: true, message: "setup complete", students: STUDENT_SEED.length };
}

function api(req) {
  try {
    setupIfNeeded_();
    const action = String(req && req.action || "");
    if (action === "publicConfig") return clientSafe_({ ok: true, teachers: teacherList_(), classLabel: APP.classLabel });
    if (action === "login") return clientSafe_(handleLogin_(req));
    const user = requireToken_(req && req.token);
    if (action === "bootstrap") return clientSafe_(handleBootstrap_(user));
    if (action === "saveAttendance") return clientSafe_(handleSaveAttendance_(req, user));
    if (action === "createHomework") return clientSafe_(handleCreateHomework_(req, user));
    if (action === "updateHomeworkStatus") return clientSafe_(handleUpdateHomeworkStatus_(req, user));
    if (action === "addBehavior") return clientSafe_(handleAddBehavior_(req, user));
    if (action === "addFollowUp") return clientSafe_(handleAddFollowUp_(req, user));
    if (action === "updateFollowUpStatus") return clientSafe_(handleUpdateFollowUpStatus_(req, user));
    if (action === "addScore") return clientSafe_(handleAddScore_(req, user));
    if (action === "studentProfile") return clientSafe_(handleStudentProfile_(req, user));
    if (action === "uploadStudentPhoto") return clientSafe_(handleUploadStudentPhoto_(req, user));
    if (action === "exportStudentReport") return clientSafe_(handleExportStudentReport_(req, user));
    if (action === "runBackup") return clientSafe_(handleRunBackup_(user));
    if (action === "installWeeklyBackup") return clientSafe_(handleInstallWeeklyBackup_(user));
    return { ok: false, error: "unknown_action" };
  } catch (err) {
    return { ok: false, error: err.message || String(err) };
  }
}

function handleLogin_(req) {
  const pin = String(req.pin || "");
  const expected = setting_("teacher_pin", APP.teacherPinDefault);
  if (!pin || pin !== expected) return { ok: false, error: "PIN ไม่ถูกต้อง" };
  const now = Math.floor(Date.now() / 1000);
  const teachers = teacherList_();
  const safeTeachers = teachers.length ? teachers : APP.homeroomTeachersDefault.map((name, index) => ({ index: index + 1, name }));
  const teacherIndex = Math.max(1, Math.min(safeTeachers.length, Number(req.teacher_index || 1)));
  const teacher = safeTeachers[teacherIndex - 1] || safeTeachers[0];
  const user = {
    role: "teacher",
    username: `teacher${teacher.index}`,
    teacher_index: teacher.index,
    teacher_name: teacher.name,
    iat: now,
    exp: now + APP.tokenTtlSeconds,
  };
  return { ok: true, token: issueToken_(user), user, bootstrap: buildBootstrap_(user) };
}

function handleBootstrap_(user) {
  return { ok: true, user: normalizeUser_(user), bootstrap: buildBootstrap_(user) };
}

function handleSaveAttendance_(req, user) {
  const rows = readObjects_(SHEETS.attendance);
  const date = String(req.date || today_());
  const changes = req.items || [];
  const byKey = {};
  rows.forEach((row, index) => {
    byKey[`${row.date}|${row.student_id}`] = { row, index };
  });
  changes.forEach((item) => {
    const studentId = String(item.student_id || "");
    if (!studentId) return;
    const key = `${date}|${studentId}`;
    const previous = byKey[key] ? Object.assign({}, byKey[key].row) : null;
    const next = {
      date,
      student_id: studentId,
      status: String(item.status || ""),
      note: String(item.note || ""),
      updated_at: new Date().toISOString(),
      by: recorder_(user),
    };
    if (byKey[key]) rows[byKey[key].index] = next;
    else rows.push(next);
    if (previous && (String(previous.status || "") !== String(next.status || "") || String(previous.by || "") !== String(next.by || ""))) {
      log_("attendanceOverwrite", {
        date,
        studentId,
        fromStatus: previous.status || "",
        toStatus: next.status || "",
        previousBy: previous.by || "",
        by: recorder_(user),
      });
    }
  });
  writeObjects_(SHEETS.attendance, rows);
  log_("saveAttendance", { date, count: changes.length, by: recorder_(user) });
  return { ok: true, bootstrap: buildBootstrap_(user, { forceRefresh: true }) };
}

function handleCreateHomework_(req, user) {
  const title = String(req.title || "").trim();
  if (!title) throw new Error("กรอกชื่องานก่อน");
  const rows = readObjects_(SHEETS.homework);
  rows.push({
    homework_id: Utilities.getUuid(),
    title,
    subject: String(req.subject || "ทั่วไป"),
    due: String(req.due || ""),
    created_at: new Date().toISOString(),
    created_by: recorder_(user),
    active: "1",
  });
  writeObjects_(SHEETS.homework, rows);
  log_("createHomework", { title, by: recorder_(user) });
  return { ok: true, bootstrap: buildBootstrap_(user, { forceRefresh: true }) };
}

function handleUpdateHomeworkStatus_(req, user) {
  const homeworkId = String(req.homework_id || "");
  const studentId = String(req.student_id || "");
  if (!homeworkId || !studentId) throw new Error("missing_homework_or_student");
  const status = String(req.status || "missing");
  const rows = readObjects_(SHEETS.homeworkStatus);
  const index = rows.findIndex((r) => String(r.homework_id) === homeworkId && String(r.student_id) === studentId);
  const next = { homework_id: homeworkId, student_id: studentId, status, updated_at: new Date().toISOString(), updated_by: recorder_(user) };
  if (index >= 0) rows[index] = next;
  else rows.push(next);
  writeObjects_(SHEETS.homeworkStatus, rows);
  return { ok: true, bootstrap: buildBootstrap_(user, { forceRefresh: true }) };
}

function handleAddBehavior_(req, user) {
  const studentId = String(req.student_id || "");
  if (!studentId) throw new Error("เลือกนักเรียนก่อน");
  const rows = readObjects_(SHEETS.behavior);
  const tone = String(req.tone || "note");
  const points = tone === "positive" ? 5 : tone === "negative" ? -5 : tone === "follow" ? -3 : 0;
  rows.push({
    id: Utilities.getUuid(),
    date: String(req.date || today_()),
    student_id: studentId,
    category: String(req.category || "ทั่วไป"),
    tone,
    points,
    note: String(req.note || ""),
    follow_up: req.follow_up ? "1" : "0",
    created_at: new Date().toISOString(),
    by: recorder_(user),
  });
  writeObjects_(SHEETS.behavior, rows);
  log_("addBehavior", { studentId, tone, by: recorder_(user) });
  return { ok: true, bootstrap: buildBootstrap_(user, { forceRefresh: true }) };
}

function handleAddFollowUp_(req, user) {
  const studentId = String(req.student_id || "");
  if (!studentId) throw new Error("เลือกนักเรียนก่อน");
  const topic = String(req.topic || "").trim();
  if (!topic) throw new Error("กรอกเรื่องที่ต้องติดตามก่อน");
  const rows = readObjects_(SHEETS.followUps);
  rows.push({
    followup_id: Utilities.getUuid(),
    date: String(req.date || today_()),
    student_id: studentId,
    topic,
    method: String(req.method || "พูดคุยนักเรียน"),
    status: String(req.status || "open"),
    next_date: String(req.next_date || ""),
    note: String(req.note || ""),
    created_at: new Date().toISOString(),
    created_by: recorder_(user),
    closed_at: "",
    closed_by: "",
  });
  writeObjects_(SHEETS.followUps, rows);
  log_("addFollowUp", { studentId, topic, by: recorder_(user) });
  return { ok: true, bootstrap: buildBootstrap_(user, { forceRefresh: true }) };
}

function handleUpdateFollowUpStatus_(req, user) {
  const id = String(req.followup_id || "");
  if (!id) throw new Error("missing_followup_id");
  const rows = readObjects_(SHEETS.followUps);
  const index = rows.findIndex((r) => String(r.followup_id) === id);
  if (index < 0) throw new Error("ไม่พบรายการติดตาม");
  rows[index].status = String(req.status || "done");
  rows[index].closed_at = rows[index].status === "done" ? new Date().toISOString() : "";
  rows[index].closed_by = rows[index].status === "done" ? recorder_(user) : "";
  writeObjects_(SHEETS.followUps, rows);
  log_("updateFollowUpStatus", { id, status: rows[index].status, by: recorder_(user) });
  return { ok: true, bootstrap: buildBootstrap_(user, { forceRefresh: true }) };
}

function handleAddScore_(req, user) {
  const studentId = String(req.student_id || "");
  if (!studentId) throw new Error("เลือกนักเรียนก่อน");
  const score = Number(req.score);
  if (Number.isNaN(score)) throw new Error("กรอกคะแนนเป็นตัวเลข");
  const rows = readObjects_(SHEETS.scores);
  rows.push({
    date: String(req.date || today_()),
    student_id: studentId,
    area: String(req.area || "ประเมินสั้น"),
    score: Math.max(0, Math.min(100, Math.round(score))),
    note: String(req.note || ""),
    updated_at: new Date().toISOString(),
    by: recorder_(user),
  });
  writeObjects_(SHEETS.scores, rows);
  return { ok: true, bootstrap: buildBootstrap_(user, { forceRefresh: true }) };
}

function handleStudentProfile_(req) {
  const id = String(req.student_id || "");
  const data = loadAll_();
  const student = data.students.find((s) => s.student_id === id);
  if (!student) throw new Error("student_not_found");
  return { ok: true, profile: buildStudentProfile_(student, data, { includePhoto: true }) };
}

function handleUploadStudentPhoto_(req, user) {
  const studentId = String(req.student_id || "");
  const dataUri = String(req.data_uri || "");
  if (!studentId) throw new Error("เลือกนักเรียนก่อน");
  if (!/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(dataUri)) throw new Error("ไฟล์รูปไม่ถูกต้อง");
  if (dataUri.length > 900000) throw new Error("รูปใหญ่เกินไป กรุณาเลือกรูปใหม่");
  const rows = readObjects_(SHEETS.students);
  const index = rows.findIndex((row) => String(row.student_id) === studentId);
  if (index < 0) throw new Error("ไม่พบนักเรียน");
  const student = rows[index];
  const match = dataUri.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,(.+)$/i);
  const contentType = match[1].toLowerCase() === "image/jpg" ? "image/jpeg" : match[1].toLowerCase();
  const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
  const bytes = Utilities.base64Decode(match[2]);
  const name = `${String(student.seq || "0").padStart(2, "0")}_${safeFileName_(student.full_name || studentId)}.${ext}`;
  const blob = Utilities.newBlob(bytes, contentType, name);
  const folder = studentPhotoFolder_();
  const file = folder.createFile(blob);
  if (student.photo_file_id) {
    try {
      DriveApp.getFileById(String(student.photo_file_id)).setTrashed(true);
    } catch (err) {
      // Ignore stale file IDs; the new photo was already saved.
    }
  }
  rows[index].photo_file_id = file.getId();
  rows[index].photo_updated_at = new Date().toISOString();
  rows[index].photo_by = recorder_(user);
  writeObjects_(SHEETS.students, rows);
  const fresh = loadAll_();
  const updatedStudent = fresh.students.find((row) => String(row.student_id) === studentId);
  log_("uploadStudentPhoto", { studentId, by: recorder_(user) });
  return {
    ok: true,
    student: listStudent_(updatedStudent),
    profile: buildStudentProfile_(updatedStudent, fresh, { includePhoto: true }),
  };
}

function handleExportStudentReport_(req, user) {
  const id = String(req.student_id || "");
  const data = loadAll_();
  const student = data.students.find((s) => String(s.student_id) === id);
  if (!student) throw new Error("ไม่พบนักเรียน");
  const profile = buildStudentProfile_(student, data);
  const file = createStudentReportPdf_(profile, user);
  log_("exportStudentReport", { studentId: id, fileId: file.getId(), by: recorder_(user) });
  return { ok: true, url: file.getUrl(), fileId: file.getId(), name: file.getName() };
}

function handleRunBackup_(user) {
  const file = createBackupSpreadsheet_("manual", user);
  return { ok: true, url: file.getUrl(), fileId: file.getId(), name: file.getName(), bootstrap: buildBootstrap_(user, { forceRefresh: true }) };
}

function handleInstallWeeklyBackup_(user) {
  installWeeklyBackupTrigger_();
  setSetting_("weekly_backup_enabled", "1");
  setSetting_("weekly_backup_by", recorder_(user));
  setSetting_("weekly_backup_updated_at", new Date().toISOString());
  log_("installWeeklyBackup", { by: recorder_(user) });
  return { ok: true, bootstrap: buildBootstrap_(user, { forceRefresh: true }) };
}

function scheduledWeeklyBackup() {
  setupIfNeeded_();
  createBackupSpreadsheet_("weekly", { teacher_name: "ระบบอัตโนมัติ", teacher_index: 0, username: "system" });
}

function buildBootstrap_(user, options) {
  const opts = options || {};
  const coreKey = cacheKey_("bootstrap-core");
  const cached = opts.forceRefresh ? null : cacheGetJson_(coreKey);
  if (cached) {
    return Object.assign({}, cached, {
      currentUser: user ? normalizeUser_(user) : null,
      updatedAt: new Date().toISOString(),
      cache: { hit: true },
    });
  }
  const data = loadAll_();
  const core = {
    classId: APP.classId,
    classLabel: APP.classLabel,
    teachers: teacherList_(),
    today: today_(),
    students: data.students.map((student) => listStudent_(student)),
    homework: data.homework,
    followUps: data.followUps,
    attendanceToday: attendanceDetailMapForDate_(data.attendance, today_()),
    homeworkStatus: data.homeworkStatus,
    dashboard: buildDashboard_(data),
    weekly: buildWeeklySummary_(data),
    backup: backupInfo_(),
  };
  cachePutJson_(coreKey, core, CACHE.ttlSeconds);
  return Object.assign({}, core, {
    currentUser: user ? normalizeUser_(user) : null,
    updatedAt: new Date().toISOString(),
    cache: { hit: false },
  });
}

function buildDashboard_(data) {
  const today = today_();
  const students = data.students;
  const todayMap = attendanceMapForDate_(data.attendance, today);
  const present = countStatus_(todayMap, "present");
  const late = countStatus_(todayMap, "late");
  const absent = countStatus_(todayMap, "absent");
  const leave = countStatus_(todayMap, "leave");
  const activeHomework = data.homework.filter((h) => String(h.active || "1") === "1");
  const missingHomework = countMissingHomework_(activeHomework, data.homeworkStatus, students);
  const profiles = students.map((s) => buildStudentProfile_(s, data));
  const alerts = buildAlertItems_(profiles, todayMap);
  const watchList = profiles
    .filter((p) => p.analysis.riskScore >= 25)
    .sort((a, b) => b.analysis.riskScore - a.analysis.riskScore || a.student.seq - b.student.seq)
    .slice(0, 8);
  const classAvg = average_(profiles.map((p) => p.analysis.avgScore).filter((v) => v !== null));
  const charts = buildDashboardCharts_(data, profiles);
  return {
    studentCount: students.length,
    attendance: { present, late, absent, leave, unchecked: Math.max(0, students.length - present - late - absent - leave) },
    activeHomework: activeHomework.length,
    missingHomework,
    openFollowUps: data.followUps.filter((r) => String(r.status || "open") === "open").length,
    alerts,
    alertSummary: {
      total: alerts.length,
      focus: alerts.filter((item) => item.severity === "focus").length,
      watch: alerts.filter((item) => item.severity === "watch").length,
    },
    watchList: watchList.map((profile) => publicProfile_(profile)),
    classAvgScore: classAvg === null ? 0 : Math.round(classAvg),
    behavior30: data.behavior.filter((b) => withinDays_(b.date, today, 30)).length,
    charts,
  };
}

function buildDashboardCharts_(data, profiles) {
  const today = today_();
  const students = data.students;
  const activeHomework = data.homework.filter((h) => String(h.active || "1") === "1");
  const done = {};
  data.homeworkStatus.forEach((row) => {
    if (String(row.status) === "done") done[`${row.homework_id}|${row.student_id}`] = true;
  });
  const homeworkTop = students.map((student) => {
    const missing = activeHomework.filter((homework) => !done[`${homework.homework_id}|${student.student_id}`]).length;
    return {
      student_id: student.student_id,
      seq: student.seq,
      name: student.display_name || student.full_name,
      missing,
    };
  }).filter((item) => item.missing > 0)
    .sort((a, b) => b.missing - a.missing || Number(a.seq || 0) - Number(b.seq || 0))
    .slice(0, 10);

  const attendance7 = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = addDays_(today, -offset);
    const map = attendanceMapForDate_(data.attendance, date);
    attendance7.push({
      date,
      label: Utilities.formatDate(new Date(`${date}T00:00:00`), Session.getScriptTimeZone(), "d/M"),
      present: countStatus_(map, "present"),
      late: countStatus_(map, "late"),
      absent: countStatus_(map, "absent"),
      leave: countStatus_(map, "leave"),
    });
  }

  const behavior30Rows = data.behavior.filter((row) => withinDays_(row.date, today, 30));
  const behavior30 = {
    positive: behavior30Rows.filter((row) => Number(row.points || 0) > 0).length,
    negative: behavior30Rows.filter((row) => Number(row.points || 0) < 0).length,
    neutral: behavior30Rows.filter((row) => Number(row.points || 0) === 0).length,
  };
  behavior30.total = behavior30.positive + behavior30.negative + behavior30.neutral;

  const riskDistribution = {
    normal: profiles.filter((profile) => profile.analysis.level === "normal").length,
    watch: profiles.filter((profile) => profile.analysis.level === "watch").length,
    focus: profiles.filter((profile) => profile.analysis.level === "focus").length,
  };
  riskDistribution.total = riskDistribution.normal + riskDistribution.watch + riskDistribution.focus;

  return { attendance7, homeworkTop, behavior30, riskDistribution };
}

function buildWeeklySummary_(data) {
  const today = today_();
  const weekStart = addDays_(today, -6);
  const students = data.students;
  const attendanceRows = data.attendance.filter((row) => isDateBetween_(row.date, weekStart, today));
  const statusCounts = { present: 0, late: 0, absent: 0, leave: 0 };
  attendanceRows.forEach((row) => {
    const status = String(row.status || "");
    if (statusCounts[status] !== undefined) statusCounts[status] += 1;
  });
  const activeHomework = data.homework.filter((h) => String(h.active || "1") === "1");
  const missingHomework = countMissingHomework_(activeHomework, data.homeworkStatus, students);
  const behaviorRows = data.behavior.filter((row) => isDateBetween_(row.date, weekStart, today));
  const positive = behaviorRows.filter((row) => Number(row.points || 0) > 0).length;
  const negative = behaviorRows.filter((row) => Number(row.points || 0) < 0).length;
  const profiles = students.map((student) => buildStudentProfile_(student, data));
  const followStudents = profiles
    .filter((profile) => profile.analysis.riskScore >= 25 || profile.analysis.openFollowUps > 0)
    .sort((a, b) => b.analysis.riskScore - a.analysis.riskScore || Number(a.student.seq || 0) - Number(b.student.seq || 0))
    .slice(0, 12)
    .map((profile) => publicProfile_(profile));
  return {
    start: weekStart,
    end: today,
    attendance: statusCounts,
    attendanceRecords: attendanceRows.length,
    activeHomework: activeHomework.length,
    missingHomework,
    behavior: { total: behaviorRows.length, positive, negative, neutral: Math.max(0, behaviorRows.length - positive - negative) },
    openFollowUps: data.followUps.filter((row) => String(row.status || "open") === "open").length,
    followStudents,
  };
}

function publicProfile_(profile) {
  return Object.assign({}, profile, { student: publicStudent_(profile.student) });
}

function listStudent_(student) {
  return {
    student_id: student.student_id,
    seq: student.seq,
    student_code: student.student_code,
    full_name: student.full_name,
    display_name: student.display_name,
    sex: student.sex,
    phone: student.phone,
    phone_2: student.phone_2,
    phone_3: student.phone_3,
    active: student.active,
    photo_updated_at: student.photo_updated_at,
    photo_by: student.photo_by,
  };
}

function publicStudent_(student) {
  const copy = Object.assign({}, student);
  ["citizen_id", "father_citizen_id", "mother_citizen_id", "guardian_citizen_id"].forEach((field) => delete copy[field]);
  return copy;
}

function buildAlertItems_(profiles, todayMap) {
  return profiles.map((profile) => {
    const student = profile.student;
    const analysis = profile.analysis;
    const todayStatus = String(todayMap[student.student_id] || "");
    const todayIssue = todayStatus === "absent" || todayStatus === "late";
    const shouldShow = todayIssue || analysis.riskScore >= 25 || analysis.openFollowUps > 0;
    if (!shouldShow) return null;
    const severity = analysis.riskScore >= 60 || todayStatus === "absent" || analysis.openFollowUps > 0 ? "focus" : "watch";
    const reason = todayStatus === "absent"
      ? "ขาดเรียนวันนี้"
      : todayStatus === "late"
        ? "มาสายวันนี้"
        : analysis.reasons[0] || "ควรติดตาม";
    return {
      student_id: student.student_id,
      seq: student.seq,
      full_name: student.full_name,
      phone: student.phone,
      riskScore: analysis.riskScore,
      severity,
      severityLabel: severity === "focus" ? "เร่งด่วน" : "เฝ้าดู",
      statusToday: todayStatus,
      statusLabel: statusLabel_(todayStatus),
      reason,
      action: alertAction_(analysis, todayStatus),
    };
  }).filter(Boolean)
    .sort((a, b) => {
      const severityDiff = (b.severity === "focus" ? 1 : 0) - (a.severity === "focus" ? 1 : 0);
      if (severityDiff) return severityDiff;
      return Number(b.riskScore || 0) - Number(a.riskScore || 0) || Number(a.seq || 0) - Number(b.seq || 0);
    })
    .slice(0, 10);
}

function alertAction_(analysis, todayStatus) {
  if (todayStatus === "absent" || analysis.absent >= 3) return "ติดต่อผู้ปกครองและบันทึกผล";
  if (analysis.openFollowUps > 0) return "อัปเดตรายการติดตามที่เปิดอยู่";
  if (analysis.missingHomework >= 3) return "นัดเคลียร์งานค้าง";
  if (analysis.negative >= 2) return "พูดคุยรายบุคคล";
  if (analysis.avgScore !== null && analysis.avgScore < 50) return "วางแผนเสริมทักษะ";
  if (todayStatus === "late" || analysis.late >= 4) return "ติดตามเรื่องการมาเรียน";
  return "บันทึกการติดตามสั้น ๆ";
}

function statusLabel_(status) {
  const labels = { present: "มา", late: "สาย", absent: "ขาด", leave: "ลา" };
  return labels[String(status || "")] || "";
}

function buildStudentProfile_(student, data, options) {
  const opts = options || {};
  const today = today_();
  const att = data.attendance.filter((r) => String(r.student_id) === student.student_id && withinDays_(r.date, today, 30));
  const absent = att.filter((r) => r.status === "absent").length;
  const late = att.filter((r) => r.status === "late").length;
  const leave = att.filter((r) => r.status === "leave").length;
  const submittedMap = {};
  data.homeworkStatus.forEach((r) => {
    if (String(r.student_id) === student.student_id) submittedMap[String(r.homework_id)] = String(r.status || "");
  });
  const activeHomework = data.homework.filter((h) => String(h.active || "1") === "1");
  const missingHomework = activeHomework.filter((h) => submittedMap[String(h.homework_id)] !== "done").length;
  const behavior30 = data.behavior.filter((b) => String(b.student_id) === student.student_id && withinDays_(b.date, today, 30));
  const negative = behavior30.filter((b) => Number(b.points || 0) < 0).length;
  const positive = behavior30.filter((b) => Number(b.points || 0) > 0).length;
  const followUp = behavior30.filter((b) => String(b.follow_up) === "1").length;
  const openFollowUps = data.followUps.filter((r) => String(r.student_id) === student.student_id && String(r.status || "open") === "open").length;
  const scores = data.scores.filter((s) => String(s.student_id) === student.student_id);
  const avgScore = average_(scores.map((s) => Number(s.score)).filter((v) => !Number.isNaN(v)));
  const reasons = [];
  let risk = 0;
  if (absent >= 3) { risk += absent * 10; reasons.push(`ขาดเรียน ${absent} วันใน 30 วัน`); }
  if (late >= 4) { risk += late * 4; reasons.push(`มาสาย ${late} ครั้ง`); }
  if (missingHomework >= 3) { risk += missingHomework * 8; reasons.push(`งานค้าง ${missingHomework} งาน`); }
  if (negative >= 2) { risk += negative * 10; reasons.push(`พฤติกรรมที่ต้องติดตาม ${negative} ครั้ง`); }
  if (followUp > 0) { risk += followUp * 12; reasons.push(`มีบันทึก follow-up ${followUp} รายการ`); }
  if (openFollowUps > 0) { risk += openFollowUps * 14; reasons.push(`มีรายการติดตามเปิดอยู่ ${openFollowUps} รายการ`); }
  if (avgScore !== null && avgScore < 50) { risk += 25; reasons.push(`คะแนนเฉลี่ยต่ำกว่า 50 (${Math.round(avgScore)})`); }
  if (!student.phone) { risk += 8; reasons.push("ไม่มีเบอร์ผู้ปกครอง"); }
  risk = Math.max(0, Math.min(100, risk - Math.min(15, positive * 4)));
  const level = risk >= 60 ? "focus" : risk >= 25 ? "watch" : "normal";
  const suggestions = [];
  if (absent >= 3 || late >= 4) suggestions.push("ติดต่อผู้ปกครองเรื่องการมาเรียน");
  if (missingHomework >= 3) suggestions.push("จัดช่วงติดตามงานค้าง");
  if (negative >= 2 || followUp > 0 || openFollowUps > 0) suggestions.push("พูดคุยรายบุคคลและบันทึกแผนติดตาม");
  if (avgScore !== null && avgScore < 50) suggestions.push("เสริมทักษะรายวิชาที่ต่ำกว่าเกณฑ์");
  if (!suggestions.length) suggestions.push("ติดตามตามปกติ");
  return {
    student,
    photoDataUri: opts.includePhoto ? photoDataUri_(student.photo_file_id) : "",
    analysis: {
      riskScore: Math.round(risk),
      level,
      avgScore: avgScore === null ? null : Math.round(avgScore),
      absent,
      late,
      leave,
      missingHomework,
      behavior30: behavior30.length,
      openFollowUps,
      positive,
      negative,
      reasons: reasons.length ? reasons : ["ยังไม่มีสัญญาณเสี่ยงเด่น"],
      suggestions,
    },
    recentBehavior: behavior30.slice(-8).reverse(),
    recentFollowUps: data.followUps.filter((r) => String(r.student_id) === student.student_id).slice(-8).reverse(),
    recentScores: scores.slice(-8).reverse(),
  };
}

function loadAll_() {
  return {
    students: cachedReadObjects_(SHEETS.students).filter((s) => String(s.active || "1") === "1").sort((a, b) => Number(a.seq) - Number(b.seq)),
    attendance: cachedReadObjects_(SHEETS.attendance),
    homework: cachedReadObjects_(SHEETS.homework),
    homeworkStatus: cachedReadObjects_(SHEETS.homeworkStatus),
    behavior: cachedReadObjects_(SHEETS.behavior),
    followUps: cachedReadObjects_(SHEETS.followUps),
    scores: cachedReadObjects_(SHEETS.scores),
  };
}

function cachedReadObjects_(name) {
  const key = cacheKey_(`sheet:${name}`);
  const cached = cacheGetJson_(key);
  if (cached) return cached;
  const rows = readObjects_(name);
  cachePutJson_(key, rows, CACHE.ttlSeconds);
  return rows;
}

function setupIfNeeded_() {
  if (!SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.settings)) setupMvp();
  else {
    Object.keys(SHEETS).forEach((key) => ensureSheet_(SHEETS[key]));
    ensureDefaultSettings_();
    migrateStudentDataIfNeeded_();
  }
}

function ss_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function ensureSheet_(name) {
  const book = ss_();
  let sheet = book.getSheetByName(name);
  if (!sheet) sheet = book.insertSheet(name);
  const headers = HEADERS[name] || [];
  if (headers.length && sheet.getLastRow() === 0) sheet.appendRow(headers);
  else if (headers.length) ensureHeaders_(sheet, headers);
  return sheet;
}

function ensureHeaders_(sheet, expected) {
  const lastColumn = Math.max(sheet.getLastColumn(), expected.length);
  const current = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(String).filter(Boolean);
  const missing = expected.filter((header) => current.indexOf(header) < 0);
  if (!current.length) {
    sheet.getRange(1, 1, 1, expected.length).setValues([expected]);
    return;
  }
  if (missing.length) sheet.getRange(1, current.length + 1, 1, missing.length).setValues([missing]);
}

function readObjects_(name) {
  const sheet = ensureSheet_(name);
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length <= 1) return [];
  const headers = values[0].map(String);
  return values.slice(1).filter((row) => row.some((v) => v !== "")).map((row) => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function writeObjects_(name, rows) {
  const sheet = ensureSheet_(name);
  const headers = HEADERS[name];
  sheet.clearContents();
  sheet.appendRow(headers);
  const values = (rows || []).map((row) => headers.map((h) => row[h] === undefined ? "" : row[h]));
  if (values.length) {
    const range = sheet.getRange(2, 1, values.length, headers.length);
    if (name === SHEETS.students) range.setNumberFormat("@");
    range.setValues(values);
  }
  invalidateDataCache_();
}

function setting_(key, fallback) {
  const rows = readObjects_(SHEETS.settings);
  const found = rows.find((r) => String(r.key) === key);
  return found ? String(found.value || "") : fallback;
}

function ensureDefaultSettings_() {
  const defaults = [
    ["teacher_pin", APP.teacherPinDefault],
    ["class_id", APP.classId],
    ["class_label", APP.classLabel],
    ["school_year", "2569"],
    ["homeroom_teacher_1", APP.homeroomTeachersDefault[0]],
    ["homeroom_teacher_2", APP.homeroomTeachersDefault[1]],
    ["homeroom_teacher_3", APP.homeroomTeachersDefault[2]],
  ];
  const rows = readObjects_(SHEETS.settings);
  const keys = {};
  rows.forEach((row) => keys[String(row.key)] = true);
  let changed = false;
  defaults.forEach(([key, value]) => {
    if (!keys[key]) {
      rows.push({ key, value });
      changed = true;
    }
  });
  if (changed) writeObjects_(SHEETS.settings, rows);
}

function teacherList_() {
  return [1, 2, 3].map((index) => {
    const name = setting_(`homeroom_teacher_${index}`, APP.homeroomTeachersDefault[index - 1]);
    return { index, name };
  }).filter((teacher) => String(teacher.name || "").trim());
}

function normalizeUser_(user) {
  const teachers = teacherList_();
  const teacher = teachers.find((item) => Number(item.index) === Number(user && user.teacher_index)) || teachers[0];
  return {
    role: "teacher",
    username: user && user.username || `teacher${teacher.index}`,
    teacher_index: teacher.index,
    teacher_name: user && user.teacher_name || teacher.name,
  };
}

function recorder_(user) {
  return normalizeUser_(user).teacher_name;
}

function setSetting_(key, value) {
  const rows = readObjects_(SHEETS.settings);
  const index = rows.findIndex((r) => String(r.key) === key);
  const next = { key, value };
  if (index >= 0) rows[index] = next;
  else rows.push(next);
  writeObjects_(SHEETS.settings, rows);
}

function migrateStudentDataIfNeeded_() {
  if (setting_("students_data_version", "") === APP.studentDataVersion) return;
  const currentRows = readObjects_(SHEETS.students);
  const byId = {};
  currentRows.forEach((row) => {
    byId[String(row.student_id)] = row;
  });
  const seedRows = STUDENT_SEED.map((row) => rowToObject_(HEADERS.Students, row));
  const seedIds = {};
  const merged = seedRows.map((seed) => {
    const existing = byId[String(seed.student_id)] || {};
    seedIds[String(seed.student_id)] = true;
    const next = Object.assign({}, existing, seed, { active: existing.active || seed.active || "1" });
    ["note", "photo_file_id", "photo_updated_at", "photo_by"].forEach((field) => {
      if (existing[field]) next[field] = existing[field];
    });
    return next;
  });
  currentRows.forEach((row) => {
    if (!seedIds[String(row.student_id)]) merged.push(row);
  });
  writeObjects_(SHEETS.students, merged);
  setSetting_("students_data_version", APP.studentDataVersion);
}

function rowToObject_(headers, row) {
  const obj = {};
  headers.forEach((header, index) => obj[header] = row[index] === undefined ? "" : row[index]);
  return obj;
}

function studentPhotoFolder_() {
  const existing = setting_("student_photo_folder_id", "");
  if (existing) {
    try {
      return DriveApp.getFolderById(existing);
    } catch (err) {
      // Fall through and create a replacement folder.
    }
  }
  const folder = DriveApp.createFolder("SMT ป.4-2 Student Photos");
  setSetting_("student_photo_folder_id", folder.getId());
  return folder;
}

function photoDataUri_(fileId) {
  if (!fileId) return "";
  try {
    const blob = DriveApp.getFileById(String(fileId)).getBlob();
    return `data:${blob.getContentType()};base64,${Utilities.base64Encode(blob.getBytes())}`;
  } catch (err) {
    return "";
  }
}

function reportFolder_() {
  return folderFromSetting_("student_report_folder_id", "SMT ป.4-2 Student Reports");
}

function backupFolder_() {
  return folderFromSetting_("backup_folder_id", "SMT ป.4-2 Backups");
}

function folderFromSetting_(settingKey, folderName) {
  const existing = setting_(settingKey, "");
  if (existing) {
    try {
      return DriveApp.getFolderById(existing);
    } catch (err) {
      // Fall through and create a replacement folder.
    }
  }
  const folder = DriveApp.createFolder(folderName);
  setSetting_(settingKey, folder.getId());
  return folder;
}

function createStudentReportPdf_(profile, user) {
  const student = profile.student;
  const analysis = profile.analysis;
  const html = studentReportHtml_(profile, user);
  const fileName = `${String(student.seq || "0").padStart(2, "0")}_${safeFileName_(student.display_name || student.full_name)}_รายงานผู้ปกครอง_${today_()}.pdf`;
  const blob = Utilities.newBlob(html, "text/html", "report.html").getAs("application/pdf").setName(fileName);
  return reportFolder_().createFile(blob);
}

function studentReportHtml_(profile, user) {
  const student = profile.student;
  const analysis = profile.analysis;
  const recentFollow = profile.recentFollowUps.map((row) => `<li>${escapeHtml_(row.date)} ${escapeHtml_(row.topic)} (${escapeHtml_(row.status || "open")})</li>`).join("") || "<li>ยังไม่มีประวัติติดตาม</li>";
  const recentBehavior = profile.recentBehavior.map((row) => `<li>${escapeHtml_(row.date)} ${escapeHtml_(row.category)} ${Number(row.points || 0) > 0 ? "+" : ""}${escapeHtml_(row.points)} ${escapeHtml_(row.note)}</li>`).join("") || "<li>ยังไม่มีบันทึกพฤติกรรมล่าสุด</li>";
  const recentScores = profile.recentScores.map((row) => `<li>${escapeHtml_(row.date)} ${escapeHtml_(row.area)}: ${escapeHtml_(row.score)} คะแนน ${escapeHtml_(row.note)}</li>`).join("") || "<li>ยังไม่มีคะแนนที่บันทึก</li>";
  return `
    <!doctype html>
    <html lang="th">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: "Sarabun", Arial, sans-serif; color:#0f2040; line-height:1.55; padding:28px; }
          h1 { font-size:22px; margin:0 0 4px; }
          h2 { font-size:16px; margin:18px 0 8px; border-bottom:1px solid #dce4f5; padding-bottom:4px; }
          .muted { color:#64748b; font-size:12px; }
          .grid { display:grid; grid-template-columns:1fr 1fr; gap:8px 18px; }
          .box { border:1px solid #dce4f5; border-radius:10px; padding:12px; margin-top:12px; }
          .risk { font-size:24px; font-weight:700; }
          ul { margin:6px 0 0 20px; padding:0; }
          footer { margin-top:28px; font-size:11px; color:#64748b; }
        </style>
      </head>
      <body>
        <h1>รายงานรายบุคคลสำหรับประชุมผู้ปกครอง</h1>
        <div class="muted">ห้อง ${escapeHtml_(APP.classLabel)} · สร้างเมื่อ ${escapeHtml_(new Date().toLocaleString("th-TH"))} · ผู้บันทึก ${escapeHtml_(recorder_(user))}</div>
        <div class="box">
          <div class="grid">
            <div><strong>ชื่อ</strong><br>${escapeHtml_(student.full_name)}</div>
            <div><strong>เลขที่ / รหัส</strong><br>${escapeHtml_(student.seq)} / ${escapeHtml_(student.student_code || "-")}</div>
            <div><strong>ผู้ปกครอง</strong><br>${escapeHtml_(student.guardian_name || "-")} (${escapeHtml_(student.guardian_relationship || "-")})</div>
            <div><strong>โทร</strong><br>${escapeHtml_([student.phone, student.phone_2, student.phone_3].filter(Boolean).join(" / ") || "-")}</div>
          </div>
        </div>
        <h2>ภาพรวมการติดตาม</h2>
        <div class="grid">
          <div class="box"><div class="risk">${analysis.riskScore}</div><div class="muted">คะแนนความเสี่ยง</div></div>
          <div class="box"><div class="risk">${analysis.avgScore === null ? "-" : analysis.avgScore}</div><div class="muted">คะแนนเฉลี่ยที่บันทึก</div></div>
          <div class="box"><strong>ขาด/สาย/ลา 30 วัน</strong><br>${analysis.absent}/${analysis.late}/${analysis.leave}</div>
          <div class="box"><strong>งานค้าง</strong><br>${analysis.missingHomework} รายการ</div>
        </div>
        <h2>เหตุผลที่ระบบพบ</h2>
        <ul>${analysis.reasons.map((item) => `<li>${escapeHtml_(item)}</li>`).join("")}</ul>
        <h2>แนวทางติดตาม</h2>
        <ul>${analysis.suggestions.map((item) => `<li>${escapeHtml_(item)}</li>`).join("")}</ul>
        <h2>ประวัติติดตามล่าสุด</h2>
        <ul>${recentFollow}</ul>
        <h2>บันทึกพฤติกรรมล่าสุด</h2>
        <ul>${recentBehavior}</ul>
        <h2>คะแนนล่าสุด</h2>
        <ul>${recentScores}</ul>
        <footer>พัฒนาระบบโดย นายพิชญานนท์ วัจนสุนทร ครูชำนาญการ โรงเรียนอนุบาลหนองหานวิทยายน</footer>
      </body>
    </html>
  `;
}

function createBackupSpreadsheet_(mode, user) {
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd_HHmm");
  const name = `Backup_${APP.classLabel}_${stamp}_${mode || "manual"}`;
  const backup = SpreadsheetApp.create(name);
  const source = ss_();
  Object.keys(SHEETS).forEach((key, index) => {
    const sourceSheet = source.getSheetByName(SHEETS[key]);
    if (!sourceSheet) return;
    const target = index === 0 ? backup.getSheets()[0] : backup.insertSheet();
    target.setName(SHEETS[key].slice(0, 90));
    const values = sourceSheet.getDataRange().getDisplayValues();
    if (values.length && values[0].length) {
      target.getRange(1, 1, values.length, values[0].length).setNumberFormat("@").setValues(values);
    }
  });
  const file = DriveApp.getFileById(backup.getId());
  const folder = backupFolder_();
  folder.addFile(file);
  try {
    DriveApp.getRootFolder().removeFile(file);
  } catch (err) {
    // Some Drive configurations do not allow removing from root; the backup file remains accessible.
  }
  setSetting_("last_backup_at", new Date().toISOString());
  setSetting_("last_backup_name", file.getName());
  setSetting_("last_backup_url", file.getUrl());
  setSetting_("last_backup_mode", String(mode || "manual"));
  setSetting_("last_backup_by", recorder_(user));
  log_("backup", { mode, fileId: file.getId(), by: recorder_(user) });
  return file;
}

function installWeeklyBackupTrigger_() {
  ScriptApp.getProjectTriggers().forEach((trigger) => {
    if (trigger.getHandlerFunction && trigger.getHandlerFunction() === "scheduledWeeklyBackup") {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  ScriptApp.newTrigger("scheduledWeeklyBackup")
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.FRIDAY)
    .atHour(16)
    .create();
}

function backupInfo_() {
  return {
    lastAt: setting_("last_backup_at", ""),
    lastName: setting_("last_backup_name", ""),
    lastUrl: setting_("last_backup_url", ""),
    lastMode: setting_("last_backup_mode", ""),
    weeklyEnabled: setting_("weekly_backup_enabled", "") === "1",
    weeklyUpdatedAt: setting_("weekly_backup_updated_at", ""),
    weeklyBy: setting_("weekly_backup_by", ""),
  };
}

function escapeHtml_(value) {
  return String(value === undefined || value === null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeFileName_(value) {
  return String(value || "student").replace(/[\\/:*?"<>|#%{}~&]/g, "_").replace(/\s+/g, "_").slice(0, 80);
}

function today_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
}

function attendanceMapForDate_(rows, date) {
  const out = {};
  rows.filter((r) => String(r.date) === date).forEach((r) => out[String(r.student_id)] = String(r.status || ""));
  return out;
}

function attendanceDetailMapForDate_(rows, date) {
  const out = {};
  rows.filter((r) => String(r.date) === date).forEach((r) => {
    out[String(r.student_id)] = {
      status: String(r.status || ""),
      note: String(r.note || ""),
      updated_at: String(r.updated_at || ""),
      by: String(r.by || ""),
    };
  });
  return out;
}

function countStatus_(map, status) {
  return Object.values(map || {}).filter((v) => v === status).length;
}

function countMissingHomework_(homework, statusRows, students) {
  const done = {};
  statusRows.forEach((r) => {
    if (String(r.status) === "done") done[`${r.homework_id}|${r.student_id}`] = true;
  });
  let missing = 0;
  homework.forEach((h) => {
    students.forEach((s) => {
      if (!done[`${h.homework_id}|${s.student_id}`]) missing += 1;
    });
  });
  return missing;
}

function average_(values) {
  const nums = values.map(Number).filter((v) => !Number.isNaN(v));
  if (!nums.length) return null;
  return nums.reduce((sum, v) => sum + v, 0) / nums.length;
}

function addDays_(dateValue, days) {
  const date = new Date(`${String(dateValue).slice(0, 10)}T00:00:00`);
  date.setDate(date.getDate() + Number(days || 0));
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd");
}

function isDateBetween_(dateValue, startValue, endValue) {
  if (!dateValue) return false;
  const value = String(dateValue).slice(0, 10);
  return value >= String(startValue).slice(0, 10) && value <= String(endValue).slice(0, 10);
}

function withinDays_(dateValue, asOfValue, days) {
  if (!dateValue) return false;
  const left = new Date(`${String(dateValue).slice(0, 10)}T00:00:00`);
  const right = new Date(`${String(asOfValue).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(left.getTime()) || Number.isNaN(right.getTime())) return false;
  const diff = Math.round((right - left) / 86400000);
  return diff >= 0 && diff <= days;
}

function issueToken_(payload) {
  const body = Utilities.base64EncodeWebSafe(JSON.stringify(payload));
  const sig = sign_(body);
  return `${body}.${sig}`;
}

function requireToken_(token) {
  const parts = String(token || "").split(".");
  if (parts.length !== 2) throw new Error("กรุณาเข้าสู่ระบบใหม่");
  if (parts[1] !== sign_(parts[0])) throw new Error("token ไม่ถูกต้อง");
  const payload = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString());
  if (!payload.exp || Math.floor(Date.now() / 1000) > Number(payload.exp)) throw new Error("หมดเวลาใช้งาน กรุณาเข้าสู่ระบบใหม่");
  return payload;
}

function sign_(body) {
  const props = PropertiesService.getScriptProperties();
  let secret = props.getProperty("APP_SECRET");
  if (!secret) {
    secret = Utilities.getUuid() + Utilities.getUuid();
    props.setProperty("APP_SECRET", secret);
  }
  return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(body, secret));
}

function log_(event, detail) {
  const sheet = ensureSheet_(SHEETS.audit);
  sheet.appendRow([new Date().toISOString(), event, JSON.stringify(detail || {})]);
}

function cacheKey_(name) {
  return [CACHE.prefix, APP.classId, APP.studentDataVersion, name].join(":").slice(0, 240);
}

function cacheGetJson_(key) {
  try {
    const raw = CacheService.getScriptCache().get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

function cachePutJson_(key, value, ttlSeconds) {
  try {
    const raw = JSON.stringify(value);
    if (raw.length <= CACHE.maxChars) {
      CacheService.getScriptCache().put(key, raw, ttlSeconds || CACHE.ttlSeconds);
    }
  } catch (err) {
    // Cache is an optimization only; failures should never block the app.
  }
}

function invalidateDataCache_() {
  try {
    const keys = [
      cacheKey_("bootstrap-core"),
      cacheKey_(`sheet:${SHEETS.students}`),
      cacheKey_(`sheet:${SHEETS.attendance}`),
      cacheKey_(`sheet:${SHEETS.homework}`),
      cacheKey_(`sheet:${SHEETS.homeworkStatus}`),
      cacheKey_(`sheet:${SHEETS.behavior}`),
      cacheKey_(`sheet:${SHEETS.followUps}`),
      cacheKey_(`sheet:${SHEETS.scores}`),
      cacheKey_(`sheet:${SHEETS.settings}`),
    ];
    CacheService.getScriptCache().removeAll(keys);
  } catch (err) {
    // Cache invalidation is best effort; fresh reads still happen on misses.
  }
}

function clientSafe_(value) {
  return JSON.parse(JSON.stringify(value, function(_key, item) {
    if (item instanceof Date) return Utilities.formatDate(item, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    if (item === undefined) return "";
    return item;
  }));
}
