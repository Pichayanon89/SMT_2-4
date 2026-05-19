const SUBJECTS = ["ภาษาไทย", "คณิตศาสตร์", "วิทยาศาสตร์", "ภาษาอังกฤษ", "คอมพิวเตอร์"];

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(Number(value) || 0)));
}

function dateOnly(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function daysBetween(a, b) {
  const left = new Date(`${dateOnly(a)}T00:00:00`);
  const right = new Date(`${dateOnly(b)}T00:00:00`);
  if (Number.isNaN(left.getTime()) || Number.isNaN(right.getTime())) return 9999;
  return Math.round((right - left) / 86400000);
}

function isWithinDays(date, asOfDate, days) {
  const diff = daysBetween(date, asOfDate);
  return diff >= 0 && diff <= days;
}

function average(values) {
  const nums = values.map(Number).filter((v) => !Number.isNaN(v));
  if (!nums.length) return null;
  return nums.reduce((sum, value) => sum + value, 0) / nums.length;
}

function riskLevel(score) {
  if (score >= 75) return { level: "ด่วน", tone: "critical" };
  if (score >= 50) return { level: "ต้องติดตาม", tone: "danger" };
  if (score >= 25) return { level: "เฝ้าระวัง", tone: "warning" };
  return { level: "ปกติ", tone: "normal" };
}

function addReason(reasons, condition, text, points) {
  if (condition) reasons.push({ text, points });
}

function attendanceMetrics(studentId, attendanceByDate, asOfDate) {
  const recent = Object.entries(attendanceByDate || {})
    .filter(([date]) => isWithinDays(date, asOfDate, 30))
    .map(([date, day]) => ({ date, status: day?.[studentId] }))
    .filter((row) => row.status);
  const absent = recent.filter((row) => row.status === "absent").length;
  const late = recent.filter((row) => row.status === "late").length;
  const present = recent.filter((row) => row.status === "present").length;
  const rate = recent.length ? clamp(((present + late) / recent.length) * 100) : 100;
  const sorted = recent.slice().sort((a, b) => b.date.localeCompare(a.date));
  let consecutiveAbsent = 0;
  for (const row of sorted) {
    if (row.status !== "absent") break;
    consecutiveAbsent += 1;
  }
  return { absent, late, present, rate, consecutiveAbsent, recordedDays: recent.length };
}

function scoreMetrics(studentId, scores) {
  const subjectMap = scores?.[studentId] || {};
  const values = SUBJECTS.map((subject) => subjectMap[subject]).filter((value) => typeof value === "number");
  const overall = average(values);
  const lowSubjects = SUBJECTS.filter((subject) => typeof subjectMap[subject] === "number" && subjectMap[subject] < 50);
  return {
    overall: overall === null ? null : clamp(overall),
    recordedSubjects: values.length,
    lowSubjects,
  };
}

function homeworkMetrics(studentId, homework, asOfDate) {
  const assigned = homework?.length || 0;
  let submitted = 0;
  let missing = 0;
  let overdue = 0;
  for (const item of homework || []) {
    const isSubmitted = item.submissions?.[studentId] === true;
    if (isSubmitted) submitted += 1;
    const isPastDue = item.due && daysBetween(item.due, asOfDate) > 0;
    if (!isSubmitted) missing += 1;
    if (!isSubmitted && isPastDue) overdue += 1;
  }
  const completionRate = assigned ? clamp((submitted / assigned) * 100) : 100;
  const missingRate = assigned ? clamp((missing / assigned) * 100) : 0;
  return { assigned, submitted, missing, overdue, completionRate, missingRate };
}

function behaviorMetrics(studentId, behavior, asOfDate) {
  const recent = (behavior || []).filter((item) => item.student_id === studentId && isWithinDays(item.date, asOfDate, 30));
  const negative = recent.filter((item) => Number(item.points || 0) < 0);
  const positive = recent.filter((item) => Number(item.points || 0) > 0);
  const severeNegative = negative.filter((item) => Number(item.points || 0) <= -5);
  const points = recent.reduce((sum, item) => sum + Number(item.points || 0), 0);
  return {
    total: recent.length,
    positive: positive.length,
    negative: negative.length,
    severeNegative: severeNegative.length,
    points,
  };
}

function dataQualityMetrics(student) {
  const missing = [];
  if (!student?.student_code) missing.push("รหัสนักเรียน");
  if (!student?.guardian_name || student.guardian_name === "-") missing.push("ชื่อผู้ปกครอง");
  if (!student?.phone) missing.push("เบอร์โทร");
  if (!student?.birthdate_th || student.birthdate_th === "-") missing.push("วันเกิด");
  return { missing };
}

export function buildRiskProfile({ student, attendanceByDate, scores, homework, behavior, stats, asOfDate }) {
  const attendance = attendanceMetrics(student.student_id, attendanceByDate, asOfDate);
  const score = scoreMetrics(student.student_id, scores);
  const work = homeworkMetrics(student.student_id, homework, asOfDate);
  const conduct = behaviorMetrics(student.student_id, behavior, asOfDate);
  const dataQuality = dataQualityMetrics(student);
  const reasons = [];

  addReason(reasons, attendance.absent >= 3, `ขาดเรียน ${attendance.absent} วันใน 30 วัน`, 25);
  addReason(reasons, attendance.consecutiveAbsent >= 2, `ขาดเรียนต่อเนื่อง ${attendance.consecutiveAbsent} วัน`, 25);
  addReason(reasons, attendance.late >= 5, `มาสาย ${attendance.late} ครั้งใน 30 วัน`, 10);
  addReason(reasons, score.overall !== null && score.overall < 50, `คะแนนเฉลี่ยต่ำกว่า 50% (${score.overall}%)`, 30);
  addReason(reasons, score.overall !== null && score.overall >= 50 && score.overall < 60, `คะแนนเฉลี่ยอยู่ในช่วงเฝ้าระวัง (${score.overall}%)`, 20);
  addReason(reasons, score.lowSubjects.length > 0, `คะแนนต่ำกว่าเกณฑ์: ${score.lowSubjects.join(", ")}`, Math.min(20, score.lowSubjects.length * 8));
  addReason(reasons, work.assigned > 0 && work.missingRate >= 40, `ยังไม่ส่งงาน ${work.missingRate}%`, 25);
  addReason(reasons, work.assigned > 0 && work.missingRate >= 20 && work.missingRate < 40, `ยังไม่ส่งงาน ${work.missingRate}%`, 15);
  addReason(reasons, work.overdue > 0, `มีงานเลยกำหนด ${work.overdue} งาน`, Math.min(15, work.overdue * 5));
  addReason(reasons, conduct.severeNegative > 0, `มีพฤติกรรมลบระดับสูง ${conduct.severeNegative} ครั้ง`, 30);
  addReason(reasons, conduct.negative >= 3, `มีพฤติกรรมลบ ${conduct.negative} ครั้งใน 30 วัน`, 20);
  addReason(reasons, dataQuality.missing.length > 0, `ข้อมูลที่ควรตรวจทาน: ${dataQuality.missing.join(", ")}`, 8);

  const positiveAdjustment = Math.min(15, conduct.positive * 3 + (work.completionRate >= 90 ? 5 : 0) + (attendance.rate >= 95 ? 5 : 0));
  const rawScore = reasons.reduce((sum, item) => sum + item.points, 0) - positiveAdjustment;
  const riskScore = clamp(rawScore);
  const level = riskLevel(riskScore);
  const suggestedActions = [];
  if (attendance.absent >= 3 || attendance.consecutiveAbsent >= 2) suggestedActions.push("ติดต่อผู้ปกครองเรื่องการมาเรียน");
  if (score.overall !== null && score.overall < 60) suggestedActions.push("จัดเสริมทักษะรายวิชาที่ต่ำกว่าเกณฑ์");
  if (work.missingRate >= 20) suggestedActions.push("ติดตามงานค้างและกำหนดวันส่งซ่อม");
  if (conduct.negative >= 3 || conduct.severeNegative > 0) suggestedActions.push("นัดพูดคุยรายบุคคลและบันทึกแผนติดตาม");
  if (!suggestedActions.length) suggestedActions.push("ติดตามตามปกติ");

  return {
    studentId: student.student_id,
    seq: student.seq,
    name: student.full_name,
    riskScore,
    ...level,
    reasons: reasons.map((item) => item.text),
    suggestedActions,
    metrics: { attendance, score, homework: work, behavior: conduct, dataQuality, stats: stats || {} },
  };
}

export function buildRiskProfiles({ students, attendanceByDate, scores, homework, behavior, statsMap, asOfDate }) {
  const out = {};
  for (const student of students || []) {
    out[student.student_id] = buildRiskProfile({
      student,
      attendanceByDate,
      scores,
      homework,
      behavior,
      stats: statsMap?.[student.student_id],
      asOfDate,
    });
  }
  return out;
}

export function summarizeRiskProfiles(profileMap) {
  const rows = Object.values(profileMap || {});
  const counts = { normal: 0, warning: 0, danger: 0, critical: 0 };
  for (const row of rows) counts[row.tone] = (counts[row.tone] || 0) + 1;
  const watchList = rows
    .filter((row) => row.riskScore >= 25)
    .sort((a, b) => b.riskScore - a.riskScore || a.seq - b.seq);
  return { counts, watchList };
}
