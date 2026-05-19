import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Camera,
  CheckCircle2,
  ClipboardList,
  Edit3,
  Eye,
  EyeOff,
  FileDown,
  Home,
  Phone,
  RotateCcw,
  Save,
  Search,
  ShieldAlert,
  Sparkles,
  Trash2,
  X,
  UserRound,
  UsersRound,
} from "lucide-react";
import baseStudents from "./data/students.json";

const quickActions = [
  { label: "ส่งงานตรงเวลา", points: 5, type: "positive", category: "ความรับผิดชอบ" },
  { label: "ช่วยเพื่อน", points: 5, type: "positive", category: "สังคม/ช่วยเหลือ" },
  { label: "ตั้งใจเรียน", points: 3, type: "positive", category: "การเรียน" },
  { label: "มาสาย", points: -2, type: "negative", category: "การมาเรียน" },
  { label: "ไม่ส่งงาน", points: -3, type: "negative", category: "ความรับผิดชอบ" },
];

const riskyStatuses = ["แยก", "หย่า", "ถึงแก่กรรม"];
const editStorageKey = "p4-2-student-edits";
const logStorageKey = "p4-2-behavior-logs";
const recorderStorageKey = "p4-2-selected-recorder";

const homeroomTeachers = [
  "นางฐิติยาภรณ์ วิเศษโวหาร",
  "นายพิชญานนท์ วัจนสุนทร",
  "นายพงศกร วิบุญกุล",
];

const behaviorCategories = [
  "การเรียน",
  "ความรับผิดชอบ",
  "สังคม/ช่วยเหลือ",
  "ระเบียบวินัย",
  "อารมณ์/การปรับตัว",
  "การมาเรียน",
  "สุขภาพ",
  "อื่น ๆ",
];

const smtAttributes = [
  {
    key: "log",
    short: "LOG",
    name: "Analytical Logic",
    thai: "ตรรกะและคณิตศาสตร์",
    formula: "Math 60% + Logic/Coding 30% + Efficiency 10%",
  },
  {
    key: "sci",
    short: "SCI",
    name: "Scientific Inquiry",
    thai: "สืบเสาะทางวิทยาศาสตร์",
    formula: "Lab Process 50% + Science 30% + PBL 20%",
  },
  {
    key: "dig",
    short: "DIG",
    name: "Digital Fluency",
    thai: "ความฉลาดทางดิจิทัล",
    formula: "Digital Project 70% + Search 20% + Citizenship 10%",
  },
  {
    key: "lit",
    short: "LIT",
    name: "Linguistic Precision",
    thai: "ความแม่นยำทางภาษา",
    formula: "Speaking 40% + Writing 40% + Language 20%",
  },
  {
    key: "grt",
    short: "GRT",
    name: "Adaptive Grit",
    thai: "ความเพียรที่ปรับตัวได้",
    formula: "On-time 50% + Feedback 30% + Persistence 20%",
  },
];

const masteryRules = [
  {
    title: "Data Scientist",
    detail: "วิเคราะห์ข้อมูลและใช้เทคโนโลยีได้เด่น",
    test: (stats) => stats.log >= 80 && stats.dig >= 80,
  },
  {
    title: "Innovation Pioneer",
    detail: "สืบเสาะ ทดลอง และต่อยอดด้วยเทคโนโลยี",
    test: (stats) => stats.sci >= 80 && stats.dig >= 80,
  },
  {
    title: "Global Communicator",
    detail: "สื่อสารข้อมูลวิชาการด้วยภาษาและสื่อดิจิทัล",
    test: (stats) => stats.lit >= 80 && stats.dig >= 80,
  },
  {
    title: "Resilient Solver",
    detail: "พยายามแก้ปัญหายากและปรับตัวจาก feedback",
    test: (stats) => stats.grt >= 85 && stats.log >= 72,
  },
];

const defaultDetailedLog = {
  logDate: "",
  type: "positive",
  category: "การเรียน",
  points: 3,
  detail: "",
  recordedBy: "",
  followUp: false,
  guardianContact: false,
};

const editableFields = [
  ["full_name", "ชื่อ - สกุล"],
  ["student_no", "เลขประจำตัว"],
  ["sex", "เพศ"],
  ["birthdate_th", "วันเกิด"],
  ["citizen_id", "เลขประชาชน"],
  ["registered_address", "ที่อยู่ทะเบียนบ้าน"],
  ["current_address", "ที่อยู่ปัจจุบัน"],
  ["father_name", "ชื่อบิดา"],
  ["mother_name", "ชื่อมารดา"],
  ["parent_status", "สถานะบิดา - มารดา"],
  ["guardian_name", "ชื่อผู้ปกครอง"],
  ["guardian_relationship", "เกี่ยวข้องเป็น"],
  ["phone_1", "เบอร์โทร 1"],
  ["phone_2", "เบอร์โทร 2"],
  ["phone_3", "เบอร์โทร 3"],
  ["enroll_date_th", "วันที่สมัคร"],
  ["previous_class_note", "ห้องเดิม"],
];

function isRiskStudent(student) {
  const status = student.parent_status || "";
  return riskyStatuses.some((word) => status.includes(word)) || !status;
}

function maskId(value) {
  if (!value) return "-";
  return value.length > 4 ? `${value.slice(0, 2)}*********${value.slice(-2)}` : value;
}

function maskPhone(value, visible) {
  if (!value) return "-";
  if (visible) return value;
  return `${value.slice(0, 3)}***${value.slice(-2)}`;
}

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function toLocalDateInput(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatThaiDate(value) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
}

function createDetailedDraft(recordedBy = "") {
  return {
    ...defaultDetailedLog,
    logDate: toLocalDateInput(),
    recordedBy,
  };
}

function getLogLabel(log) {
  return log.label || log.category || "บันทึกพฤติกรรม";
}

function getLogCategory(log) {
  return log.category || "อื่น ๆ";
}

function getBehaviorAnalytics(logItems) {
  const total = logItems.length;
  const positive = logItems.filter((log) => log.type === "positive").length;
  const negative = logItems.filter((log) => log.type === "negative").length;
  const followUp = logItems.filter((log) => log.followUp || log.guardianContact).length;
  const score = logItems.reduce((sum, log) => sum + Number(log.points || 0), 0);
  const categoryCounts = logItems.reduce((counts, log) => {
    const category = getLogCategory(log);
    counts[category] = (counts[category] || 0) + 1;
    return counts;
  }, {});
  const topCategory =
    Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
  const recent = [...logItems].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
  const negativeStreak = recent.length >= 3 && recent.every((log) => log.type === "negative");
  return {
    total,
    positive,
    negative,
    followUp,
    score,
    categoryCounts,
    topCategory,
    negativeStreak,
    needsAttention: negativeStreak || negative >= 3 || followUp >= 2,
  };
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getSeedScore(seq, offset = 0) {
  return ((Number(seq || 0) * 17 + offset) % 13) - 6;
}

function getLogsForStudent(logItems, seq) {
  return logItems.filter((log) => log.studentSeq === seq);
}

function calculateSmtStats(student, logItems) {
  const previous = student.previous_class_note || "";
  const address = `${student.registered_address || ""} ${student.current_address || ""}`;
  const isMep = previous.includes("MEP");
  const isNearSchool = address.includes("ต.หนองหาน");
  const stats = {
    log: 70 + getSeedScore(student.seq, 2),
    sci: 70 + getSeedScore(student.seq, 5),
    dig: 68 + getSeedScore(student.seq, 8),
    lit: 68 + getSeedScore(student.seq, 11),
    grt: 72 + getSeedScore(student.seq, 14),
  };

  if (isMep) {
    stats.lit += 10;
    stats.dig += 8;
    stats.log += 3;
  }
  if (previous.includes("3/2")) stats.sci += 3;
  if (previous.includes("3/3")) stats.log += 2;
  if (previous.includes("3/4")) stats.grt += 2;
  if (!isNearSchool && address) stats.grt += 3;

  for (const log of logItems) {
    const points = Number(log.points || 0);
    const direction = log.type === "negative" ? -1 : 1;
    const magnitude = Math.min(6, Math.max(1, Math.abs(points)));
    const text = `${log.category || ""} ${log.detail || ""}`.toLowerCase();

    if (log.category === "การเรียน") {
      stats.log += direction * magnitude * 0.8;
      stats.sci += direction * magnitude * 0.6;
    }
    if (log.category === "ความรับผิดชอบ" || text.includes("ส่งงาน")) {
      stats.grt += direction * magnitude * 1.1;
    }
    if (log.category === "สังคม/ช่วยเหลือ") {
      stats.lit += direction * magnitude * 0.7;
      stats.grt += direction * magnitude * 0.5;
    }
    if (log.category === "ระเบียบวินัย" || log.category === "การมาเรียน") {
      stats.grt += direction * magnitude * 0.9;
    }
    if (log.category === "อารมณ์/การปรับตัว") {
      stats.grt += direction * magnitude * 1.2;
    }
    if (text.includes("coding") || text.includes("โปรแกรม") || text.includes("ดิจิทัล") || text.includes("คอม")) {
      stats.dig += direction * magnitude * 1.2;
      stats.log += direction * magnitude * 0.5;
    }
    if (text.includes("ทดลอง") || text.includes("วิทยา") || text.includes("โครงงาน")) {
      stats.sci += direction * magnitude * 1.2;
    }
    if (text.includes("นำเสนอ") || text.includes("รายงาน") || text.includes("อธิบาย")) {
      stats.lit += direction * magnitude * 1.1;
    }
    if (log.followUp || log.guardianContact) {
      stats.grt -= 1;
    }
  }

  return Object.fromEntries(Object.entries(stats).map(([key, value]) => [key, clampScore(value)]));
}

function averageSmtStats(items) {
  if (!items.length) {
    return { log: 0, sci: 0, dig: 0, lit: 0, grt: 0 };
  }
  const sums = items.reduce(
    (acc, stat) => {
      for (const attr of smtAttributes) {
        acc[attr.key] += stat[attr.key];
      }
      return acc;
    },
    { log: 0, sci: 0, dig: 0, lit: 0, grt: 0 },
  );
  return Object.fromEntries(
    Object.entries(sums).map(([key, value]) => [key, Math.round(value / items.length)]),
  );
}

function getSmtInsight(stats, classAverage) {
  const ranked = smtAttributes
    .map((attr) => ({
      ...attr,
      value: stats[attr.key],
      diff: stats[attr.key] - classAverage[attr.key],
    }))
    .sort((a, b) => b.value - a.value);
  const strongest = ranked[0];
  const growth = [...ranked].sort((a, b) => a.value - b.value)[0];
  if (strongest.diff >= 6 && growth.diff <= -4) {
    return `โดดเด่นด้าน ${strongest.short} (${strongest.thai}) แต่ควรเสริม ${growth.short} (${growth.thai}) เพื่อให้สมรรถนะ SMT สมดุลขึ้น`;
  }
  if (stats.grt >= 85) {
    return "มีความเพียรและการปรับตัวสูง เหมาะกับงานโครงงานระยะยาวหรือโจทย์ที่ต้องแก้หลายรอบ";
  }
  if (stats.dig >= 80 && stats.log >= 78) {
    return "เหมาะกับกิจกรรมวิเคราะห์ข้อมูล Coding หรือใช้เครื่องมือดิจิทัลเพื่ออธิบายคำตอบเชิงเหตุผล";
  }
  return `ภาพรวมสมรรถนะค่อนข้างสมดุล จุดที่ควรต่อยอดคือ ${strongest.short} และควรเก็บหลักฐานเพิ่มใน ${growth.short}`;
}

function readLocalJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function getInitials(student) {
  const name = (student.display_name || student.full_name || "?")
    .replace("เด็กชาย", "")
    .replace("เด็กหญิง", "")
    .trim();
  return name.slice(0, 1) || "?";
}

function createEditDraft(student) {
  return editableFields.reduce(
    (draft, [field]) => ({
      ...draft,
      [field]: student[field] || "",
    }),
    { needs_review: student.needs_review || "", photo: student.photo || "" },
  );
}

function resizeStudentPhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Cannot read image file"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Cannot load image file"));
      image.onload = () => {
        const size = 180;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d");
        const scale = Math.max(size / image.width, size / image.height);
        const width = image.width * scale;
        const height = image.height * scale;
        const left = (size - width) / 2;
        const top = (size - height) / 2;
        context.fillStyle = "#f8fafc";
        context.fillRect(0, 0, size, size);
        context.drawImage(image, left, top, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function App() {
  const [selectedSeq, setSelectedSeq] = useState(baseStudents[0]?.seq);
  const [query, setQuery] = useState("");
  const [sexFilter, setSexFilter] = useState("ทั้งหมด");
  const [groupFilter, setGroupFilter] = useState("ทั้งหมด");
  const [showSensitive, setShowSensitive] = useState(false);
  const [studentEdits, setStudentEdits] = useState(() => readLocalJson(editStorageKey, {}));
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(null);
  const [selectedRecorder, setSelectedRecorder] = useState(() => localStorage.getItem(recorderStorageKey) || "");
  const [detailedLog, setDetailedLog] = useState(() =>
    createDetailedDraft(localStorage.getItem(recorderStorageKey) || ""),
  );
  const [logs, setLogs] = useState(() => {
    return readLocalJson(logStorageKey, []);
  });

  const students = useMemo(
    () =>
      baseStudents.map((student) => ({
        ...student,
        ...(studentEdits[student.seq] || {}),
      })),
    [studentEdits],
  );

  const selectedStudent = students.find((student) => student.seq === selectedSeq) || students[0];

  const stats = useMemo(() => {
    const boys = students.filter((student) => student.sex === "ชาย").length;
    const girls = students.filter((student) => student.sex === "หญิง").length;
    const needsReview = students.filter((student) => student.needs_review).length;
    const risk = students.filter(isRiskStudent).length;
    return { total: students.length, boys, girls, needsReview, risk };
  }, [students]);

  const previousClassGroups = useMemo(() => {
    const counts = new Map();
    for (const student of students) {
      const key = student.previous_class_note || "ไม่ระบุ";
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return Array.from(counts, ([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [students]);

  const filteredStudents = useMemo(() => {
    const q = normalize(query);
    return students.filter((student) => {
      const haystack = normalize(
        [
          student.full_name,
          student.display_name,
          student.student_no,
          student.guardian_name,
          student.phone_1,
          student.previous_class_note,
        ].join(" "),
      );
      const matchesQuery = !q || haystack.includes(q);
      const matchesSex = sexFilter === "ทั้งหมด" || student.sex === sexFilter;
      const matchesGroup =
        groupFilter === "ทั้งหมด" ||
        (groupFilter === "กลุ่มเฝ้าระวัง" && isRiskStudent(student)) ||
        (groupFilter === "ต้องตรวจทานข้อมูล" && Boolean(student.needs_review)) ||
        student.previous_class_note === groupFilter;
      return matchesQuery && matchesSex && matchesGroup;
    });
  }, [query, sexFilter, groupFilter]);

  const selectedLogs = useMemo(
    () =>
      logs
        .filter((log) => log.studentSeq === selectedStudent.seq)
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [logs, selectedStudent.seq],
  );
  const behaviorAnalytics = useMemo(() => getBehaviorAnalytics(selectedLogs), [selectedLogs]);
  const classBehaviorAnalytics = useMemo(() => getBehaviorAnalytics(logs), [logs]);
  const score = behaviorAnalytics.score;
  const classSmtStats = useMemo(
    () =>
      students.map((student) =>
        calculateSmtStats(student, getLogsForStudent(logs, student.seq)),
      ),
    [students, logs],
  );
  const classSmtAverage = useMemo(() => averageSmtStats(classSmtStats), [classSmtStats]);
  const selectedSmtStats = useMemo(
    () => calculateSmtStats(selectedStudent, selectedLogs),
    [selectedStudent, selectedLogs],
  );
  const selectedMasteries = useMemo(
    () => masteryRules.filter((rule) => rule.test(selectedSmtStats)),
    [selectedSmtStats],
  );
  const selectedSmtInsight = useMemo(
    () => getSmtInsight(selectedSmtStats, classSmtAverage),
    [selectedSmtStats, classSmtAverage],
  );

  function persistStudentEdits(nextEdits) {
    setStudentEdits(nextEdits);
    localStorage.setItem(editStorageKey, JSON.stringify(nextEdits));
  }

  function selectStudent(seq) {
    setSelectedSeq(seq);
    setIsEditing(false);
    setEditDraft(null);
  }

  function startEditing() {
    setEditDraft(createEditDraft(selectedStudent));
    setIsEditing(true);
  }

  function updateDraft(field, value) {
    setEditDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function saveEdit() {
    const nextEdits = {
      ...studentEdits,
      [selectedStudent.seq]: {
        ...(studentEdits[selectedStudent.seq] || {}),
        ...editDraft,
      },
    };
    persistStudentEdits(nextEdits);
    setIsEditing(false);
  }

  function resetSelectedStudent() {
    const nextEdits = { ...studentEdits };
    delete nextEdits[selectedStudent.seq];
    persistStudentEdits(nextEdits);
    setEditDraft(null);
    setIsEditing(false);
  }

  async function handlePhotoUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const photo = await resizeStudentPhoto(file);
    const nextEdits = {
      ...studentEdits,
      [selectedStudent.seq]: {
        ...(studentEdits[selectedStudent.seq] || {}),
        photo,
      },
    };
    persistStudentEdits(nextEdits);
    if (isEditing) {
      updateDraft("photo", photo);
    }
  }

  function addLog(action) {
    if (!selectedRecorder) return;
    const nextLog = {
      id: crypto.randomUUID(),
      studentSeq: selectedStudent.seq,
      label: action.label,
      points: action.points,
      type: action.type,
      category: action.category,
      detail: action.label,
      recordedBy: selectedRecorder,
      followUp: false,
      guardianContact: false,
      date: new Date().toISOString(),
    };
    const nextLogs = [nextLog, ...logs].slice(0, 200);
    setLogs(nextLogs);
    localStorage.setItem(logStorageKey, JSON.stringify(nextLogs));
  }

  function updateDetailedLog(field, value) {
    setDetailedLog((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function chooseRecorder(name) {
    setSelectedRecorder(name);
    localStorage.setItem(recorderStorageKey, name);
    setDetailedLog((current) => ({
      ...current,
      recordedBy: name,
    }));
  }

  function saveDetailedLog(event) {
    event.preventDefault();
    if (!selectedRecorder) return;
    const points = Number(detailedLog.points || 0);
    const nextLog = {
      id: crypto.randomUUID(),
      studentSeq: selectedStudent.seq,
      label: detailedLog.category,
      points,
      type: detailedLog.type,
      category: detailedLog.category,
      detail: detailedLog.detail.trim() || detailedLog.category,
      recordedBy: selectedRecorder,
      followUp: detailedLog.followUp,
      guardianContact: detailedLog.guardianContact,
      date: new Date(`${detailedLog.logDate}T12:00:00`).toISOString(),
    };
    const nextLogs = [nextLog, ...logs].slice(0, 500);
    setLogs(nextLogs);
    localStorage.setItem(logStorageKey, JSON.stringify(nextLogs));
    setDetailedLog(createDetailedDraft(selectedRecorder));
  }

  function removeLog(id) {
    const nextLogs = logs.filter((log) => log.id !== id);
    setLogs(nextLogs);
    localStorage.setItem(logStorageKey, JSON.stringify(nextLogs));
  }

  function exportBehaviorCsv() {
    const headers = [
      "เลขที่",
      "ชื่อ",
      "วันที่",
      "ประเภท",
      "หมวดหมู่",
      "คะแนน",
      "รายละเอียด",
      "ผู้บันทึก",
      "ติดตามต่อ",
      "ติดต่อผู้ปกครอง",
    ];
    const rows = selectedLogs.map((log) => [
      selectedStudent.seq,
      selectedStudent.full_name,
      formatThaiDate(log.date),
      log.type === "positive" ? "บวก" : "ลบ",
      getLogCategory(log),
      log.points || 0,
      log.detail || getLogLabel(log),
      log.recordedBy || "",
      log.followUp ? "ใช่" : "ไม่",
      log.guardianContact ? "ใช่" : "ไม่",
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `behavior-${selectedStudent.seq}-${selectedStudent.student_no || "student"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="topbar">
          <div className="topbar-brand">
            <img className="school-emblem" src="/brand/anbnhs.jpg" alt="ตราโรงเรียนอนุบาลหนองหานวิทยายน" />
            <div>
              <h1>ระบบประจำชั้น ป.4/2</h1>
              <p>โรงเรียนอนุบาลหนองหานวิทยายน ปีการศึกษา 2569</p>
            </div>
          </div>
          <div className="topbar-actions">
            <button
              className="icon-button"
              type="button"
              onClick={() => setShowSensitive((value) => !value)}
              aria-pressed={showSensitive}
            >
              {showSensitive ? <EyeOff size={18} /> : <Eye size={18} />}
              {showSensitive ? "ซ่อนข้อมูลสำคัญ" : "แสดงข้อมูลสำคัญ"}
            </button>
          </div>
        </header>

        <section className="recorder-panel" aria-label="เลือกครูผู้บันทึก">
          <div className="recorder-identity">
            <img className="smt-emblem" src="/brand/smt4-2.png" alt="ตราห้อง SMT 4/2" />
            <div>
              <strong>หลังบ้านระบบ ประถมศึกษาปีที่ 4/2</strong>
              <span>{selectedRecorder ? `ผู้บันทึกปัจจุบัน: ${selectedRecorder}` : "กรุณาเลือกครูประจำชั้นก่อนบันทึกข้อมูล"}</span>
            </div>
          </div>
          <div className="teacher-switcher">
            {homeroomTeachers.map((teacher) => (
              <button
                key={teacher}
                type="button"
                className={selectedRecorder === teacher ? "active" : ""}
                onClick={() => chooseRecorder(teacher)}
              >
                {teacher}
              </button>
            ))}
          </div>
        </section>

        <section className="summary-grid" aria-label="ภาพรวมห้องเรียน">
          <Metric icon={UsersRound} label="นักเรียนทั้งหมด" value={`${stats.total} คน`} tone="blue" />
          <Metric icon={UserRound} label="ชาย / หญิง" value={`${stats.boys} / ${stats.girls}`} tone="green" />
          <Metric icon={ShieldAlert} label="กลุ่มเฝ้าระวัง" value={`${stats.risk} คน`} tone="amber" />
          <Metric icon={AlertTriangle} label="ต้องตรวจทานข้อมูล" value={`${stats.needsReview} คน`} tone="red" />
        </section>

        <section className="insights-row">
          <div className="panel family-panel">
            <div className="panel-heading">
              <h2>สถานะครอบครัว</h2>
              <span>{stats.risk} คนอยู่ในกลุ่มที่ควรติดตาม</span>
            </div>
            <div
              className="risk-donut"
              style={{
                "--risk": `${Math.round((stats.risk / stats.total) * 100)}%`,
              }}
              aria-label={`กลุ่มเฝ้าระวัง ${stats.risk} จาก ${stats.total} คน`}
            >
              <strong>{Math.round((stats.risk / stats.total) * 100)}%</strong>
              <span>เฝ้าระวัง</span>
            </div>
          </div>
          <div className="panel group-panel">
            <div className="panel-heading">
              <h2>ห้องเดิม</h2>
              <span>ใช้ดูพื้นฐานก่อนเข้า ป.4/2</span>
            </div>
            <div className="bar-list">
              {previousClassGroups.map((group) => (
                <button
                  className="bar-row"
                  type="button"
                  key={group.name}
                  onClick={() => setGroupFilter(group.name === "ไม่ระบุ" ? "ทั้งหมด" : group.name)}
                >
                  <span>{group.name}</span>
                  <div className="bar-track">
                    <i style={{ width: `${(group.count / stats.total) * 100}%` }} />
                  </div>
                  <strong>{group.count}</strong>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="behavior-overview panel">
          <div className="panel-heading">
            <h2>วิเคราะห์พฤติกรรมทั้งห้อง</h2>
            <span>ใช้จากบันทึกที่ครูเพิ่มในเครื่องนี้</span>
          </div>
          <div className="analysis-grid">
            <AnalysisItem label="บันทึกทั้งหมด" value={`${classBehaviorAnalytics.total} ครั้ง`} />
            <AnalysisItem label="เชิงบวก" value={`${classBehaviorAnalytics.positive} ครั้ง`} tone="good" />
            <AnalysisItem label="เชิงลบ" value={`${classBehaviorAnalytics.negative} ครั้ง`} tone="bad" />
            <AnalysisItem label="ควรติดตาม" value={`${classBehaviorAnalytics.followUp} ครั้ง`} tone="warn" />
          </div>
        </section>

        <section className="smt-overview panel">
          <div className="panel-heading">
            <h2>SMT Academic Attributes เฉลี่ยทั้งห้อง</h2>
            <span>คำนวณจากฐานข้อมูลตั้งต้นและ log พฤติกรรม</span>
          </div>
          <div className="smt-class-bars">
            {smtAttributes.map((attr) => (
              <StatBar
                key={attr.key}
                label={`${attr.short} · ${attr.thai}`}
                value={classSmtAverage[attr.key]}
              />
            ))}
          </div>
        </section>

        <section className="directory">
          <div className="directory-heading">
            <div>
              <h2>รายชื่อนักเรียน ป.4/2 SMT</h2>
              <span>แสดง {filteredStudents.length} จาก {stats.total} คน</span>
            </div>
            <strong>{selectedStudent.display_name || selectedStudent.full_name}</strong>
          </div>
          <div className="directory-tools">
            <label className="search-field">
              <Search size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ค้นหาชื่อ เลขประจำตัว ผู้ปกครอง หรือเบอร์โทร"
              />
            </label>
            <div className="filters" aria-label="ตัวกรองรายชื่อ">
              {["ทั้งหมด", "ชาย", "หญิง"].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={sexFilter === value ? "active" : ""}
                  onClick={() => setSexFilter(value)}
                >
                  {value}
                </button>
              ))}
              {["กลุ่มเฝ้าระวัง", "ต้องตรวจทานข้อมูล"].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={groupFilter === value ? "active alert" : ""}
                  onClick={() => setGroupFilter(groupFilter === value ? "ทั้งหมด" : value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>ที่</th>
                  <th>นักเรียน</th>
                  <th>ห้องเดิม</th>
                  <th>ผู้ปกครอง</th>
                  <th>โทร</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr
                    key={student.seq}
                    className={selectedStudent.seq === student.seq ? "selected" : ""}
                    onClick={() => selectStudent(student.seq)}
                  >
                    <td>{student.seq}</td>
                    <td>
                      <div className="student-cell">
                        <StudentPhoto student={student} size="small" />
                        <div>
                          <strong>{student.full_name}</strong>
                          <span>{student.student_no ? `เลขประจำตัว ${student.student_no}` : "ยังไม่มีเลขประจำตัว"}</span>
                        </div>
                      </div>
                    </td>
                    <td>{student.previous_class_note || "-"}</td>
                    <td>{student.guardian_name || "-"}</td>
                    <td>{maskPhone(student.phone_1, showSensitive)}</td>
                    <td>
                      <StatusPill student={student} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      <aside className="profile-pane">
        <div className="profile-header">
          <div className="profile-title">
            <StudentPhoto student={selectedStudent} size="large" />
            <div>
              <span>เลขที่ {selectedStudent.seq}</span>
              <h2>{selectedStudent.full_name}</h2>
              <p>{selectedStudent.student_no ? `เลขประจำตัว ${selectedStudent.student_no}` : "ยังไม่มีเลขประจำตัว"}</p>
            </div>
          </div>
          <StatusPill student={selectedStudent} />
        </div>

        <div className="profile-tools">
          <label className="photo-upload">
            <Camera size={17} />
            เพิ่มรูป
            <input type="file" accept="image/*" onChange={handlePhotoUpload} />
          </label>
          <button className="edit-button" type="button" onClick={startEditing}>
            <Edit3 size={17} />
            แก้ไขข้อมูล
          </button>
        </div>

        {isEditing && (
          <section className="edit-panel">
            <div className="panel-heading">
              <h2>แก้ไขข้อมูลนักเรียน</h2>
              <button className="text-button" type="button" onClick={() => setIsEditing(false)}>
                <X size={16} />
                ยกเลิก
              </button>
            </div>
            <div className="edit-grid">
              {editableFields.map(([field, label]) =>
                field.includes("address") ? (
                  <label className="edit-field wide" key={field}>
                    <span>{label}</span>
                    <textarea
                      data-testid={`edit-${field}`}
                      value={editDraft?.[field] || ""}
                      onChange={(event) => updateDraft(field, event.target.value)}
                      rows={3}
                    />
                  </label>
                ) : (
                  <label className="edit-field" key={field}>
                    <span>{label}</span>
                    <input
                      data-testid={`edit-${field}`}
                      value={editDraft?.[field] || ""}
                      onChange={(event) => updateDraft(field, event.target.value)}
                    />
                  </label>
                ),
              )}
              <label className="check-row wide">
                <input
                  type="checkbox"
                  checked={!editDraft?.needs_review}
                  onChange={(event) =>
                    updateDraft("needs_review", event.target.checked ? "" : "manual_review")
                  }
                />
                ตรวจทานข้อมูลนี้แล้ว
              </label>
            </div>
            <div className="edit-actions">
              <button className="save-button" type="button" onClick={saveEdit}>
                <Save size={17} />
                บันทึกข้อมูล
              </button>
              <button className="reset-button" type="button" onClick={resetSelectedStudent}>
                <RotateCcw size={17} />
                คืนค่าจากต้นฉบับ
              </button>
            </div>
          </section>
        )}

        <div className="call-actions">
          {[selectedStudent.phone_1, selectedStudent.phone_2, selectedStudent.phone_3]
            .filter(Boolean)
            .map((phone, index) => (
              <a key={`${phone}-${index}`} href={`tel:${phone}`} className="call-button">
                <Phone size={17} />
                {maskPhone(phone, showSensitive)}
              </a>
            ))}
        </div>

        <InfoBlock icon={UserRound} title="ข้อมูลส่วนตัว">
          <DataRow label="เพศ" value={selectedStudent.sex || "-"} />
          <DataRow label="วันเกิด" value={selectedStudent.birthdate_th || "-"} />
          <DataRow label="เลขประชาชน" value={showSensitive ? selectedStudent.citizen_id || "-" : maskId(selectedStudent.citizen_id)} />
          <DataRow label="ที่อยู่ทะเบียนบ้าน" value={selectedStudent.registered_address || "-"} wide />
        </InfoBlock>

        <InfoBlock icon={Home} title="ครอบครัวและผู้ดูแล">
          <DataRow label="บิดา" value={selectedStudent.father_name || "-"} />
          <DataRow label="มารดา" value={selectedStudent.mother_name || "-"} />
          <DataRow label="สถานะ" value={selectedStudent.parent_status || "-"} />
          <DataRow label="ผู้ปกครอง" value={selectedStudent.guardian_name || "-"} />
          <DataRow label="เกี่ยวข้องเป็น" value={selectedStudent.guardian_relationship || "-"} />
          <DataRow label="ที่อยู่ปัจจุบัน" value={selectedStudent.current_address || "-"} wide />
        </InfoBlock>

        <InfoBlock icon={BookOpen} title="พื้นฐานการเรียน">
          <DataRow label="วันที่สมัคร" value={selectedStudent.enroll_date_th || "-"} />
          <DataRow label="ห้องเดิม" value={selectedStudent.previous_class_note || "-"} />
        </InfoBlock>

        <section className="smt-profile game-style">
          <div className="smt-game-layout">
            <div className="smt-base-card">
              <div className="base-card-title">
                <h2>Base stats</h2>
                <span>SMT Competency</span>
              </div>
              <div className="base-stat-list">
                {smtAttributes.map((attr) => (
                  <StatBar
                    key={attr.key}
                    label={attr.short}
                    title={attr.thai}
                    value={selectedSmtStats[attr.key]}
                    sublabel={attr.formula}
                    variant="base"
                  />
                ))}
                <div className="base-stat-total">
                  <span>Total</span>
                  <strong>{getStatTotal(selectedSmtStats)}</strong>
                </div>
              </div>
            </div>
            <div className="smt-radar-card">
              <div className="radar-card-heading">
                <BarChart3 size={18} />
                <span>เทียบค่าเฉลี่ยห้อง</span>
              </div>
              <RadarChart stats={selectedSmtStats} average={classSmtAverage} variant="game" />
              <div className="smt-legend radar-legend">
                <span><i className="student-line" /> นักเรียน</span>
                <span><i className="average-line" /> ค่าเฉลี่ยห้อง</span>
              </div>
            </div>
          </div>
          <div className="smt-insight">
            <strong>Insight</strong>
            <span>{selectedSmtInsight}</span>
          </div>
          <div className="mastery-list">
            {selectedMasteries.length ? (
              selectedMasteries.map((mastery) => (
                <div className="mastery-badge" key={mastery.title}>
                  <Sparkles size={16} />
                  <span>
                    <strong>{mastery.title}</strong>
                    <small>{mastery.detail}</small>
                  </span>
                </div>
              ))
            ) : (
              <div className="mastery-empty">ยังไม่มี Achievement ที่ปลดล็อก เก็บหลักฐานเพิ่มจากคะแนนและพฤติกรรม</div>
            )}
          </div>
        </section>

        {selectedStudent.needs_review && (
          <div className="review-note">
            <AlertTriangle size={18} />
            <span>ควรตรวจทานข้อมูลจาก PDF ต้นฉบับ: {selectedStudent.needs_review}</span>
          </div>
        )}

        <section className="behavior-analysis">
          <div className="panel-heading">
            <h2>วิเคราะห์พฤติกรรมรายบุคคล</h2>
            <button className="text-button" type="button" onClick={exportBehaviorCsv}>
              <FileDown size={16} />
              ส่งออก CSV
            </button>
          </div>
          <div className="analysis-grid compact">
            <AnalysisItem label="คะแนนรวม" value={score > 0 ? `+${score}` : score} />
            <AnalysisItem label="บวก / ลบ" value={`${behaviorAnalytics.positive} / ${behaviorAnalytics.negative}`} />
            <AnalysisItem label="หมวดเด่น" value={behaviorAnalytics.topCategory} />
            <AnalysisItem label="ติดตามต่อ" value={`${behaviorAnalytics.followUp} ครั้ง`} />
          </div>
          {behaviorAnalytics.needsAttention && (
            <div className="warning-strip">
              <AlertTriangle size={17} />
              <span>มีสัญญาณที่ควรติดตาม: พฤติกรรมลบหลายครั้งหรือต้องติดต่อผู้ปกครอง</span>
            </div>
          )}
        </section>

        <section className="quick-log">
          <div className="panel-heading">
            <h2>บันทึกพฤติกรรมเร็ว</h2>
            <span>คะแนนสะสม {score > 0 ? `+${score}` : score}</span>
          </div>
          <div className="quick-buttons">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                className={action.type}
                onClick={() => addLog(action)}
                disabled={!selectedRecorder}
              >
                {action.type === "positive" ? <Sparkles size={16} /> : <AlertTriangle size={16} />}
                {action.label}
                <strong>{action.points > 0 ? `+${action.points}` : action.points}</strong>
              </button>
            ))}
          </div>
          {!selectedRecorder && (
            <div className="recorder-warning">
              <AlertTriangle size={17} />
              <span>เลือกครูประจำชั้นด้านบนก่อนบันทึกพฤติกรรม</span>
            </div>
          )}
          <form className="detailed-log-form" onSubmit={saveDetailedLog}>
            <h3>
              <ClipboardList size={18} />
              บันทึกพฤติกรรมละเอียด
            </h3>
            <div className="log-form-grid">
              <label>
                <span>วันที่</span>
                <input
                  data-testid="log-date"
                  type="date"
                  value={detailedLog.logDate}
                  onChange={(event) => updateDetailedLog("logDate", event.target.value)}
                  required
                />
              </label>
              <label>
                <span>ประเภท</span>
                <select
                  data-testid="log-type"
                  value={detailedLog.type}
                  onChange={(event) => {
                    const type = event.target.value;
                    updateDetailedLog("type", type);
                    updateDetailedLog("points", type === "positive" ? 3 : -2);
                  }}
                >
                  <option value="positive">เชิงบวก</option>
                  <option value="negative">เชิงลบ</option>
                </select>
              </label>
              <label>
                <span>หมวดหมู่</span>
                <select
                  data-testid="log-category"
                  value={detailedLog.category}
                  onChange={(event) => updateDetailedLog("category", event.target.value)}
                >
                  {behaviorCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>คะแนน</span>
                <input
                  data-testid="log-points"
                  type="number"
                  value={detailedLog.points}
                  onChange={(event) => updateDetailedLog("points", event.target.value)}
                />
              </label>
              <label className="wide">
                <span>รายละเอียดเหตุการณ์</span>
                <textarea
                  data-testid="log-detail"
                  value={detailedLog.detail}
                  onChange={(event) => updateDetailedLog("detail", event.target.value)}
                  placeholder="เช่น ช่วยเพื่อนเก็บอุปกรณ์หลังเรียน หรือไม่ส่งงาน 2 ครั้งติดต่อกัน"
                  rows={3}
                  required
                />
              </label>
              <label>
                <span>ผู้บันทึก</span>
                <input
                  data-testid="log-recorder"
                  value={selectedRecorder || "กรุณาเลือกครูผู้บันทึก"}
                  readOnly
                />
              </label>
              <div className="log-checks">
                <label>
                  <input
                    type="checkbox"
                    checked={detailedLog.followUp}
                    onChange={(event) => updateDetailedLog("followUp", event.target.checked)}
                  />
                  ติดตามต่อ
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={detailedLog.guardianContact}
                    onChange={(event) => updateDetailedLog("guardianContact", event.target.checked)}
                  />
                  ติดต่อผู้ปกครองแล้ว
                </label>
              </div>
            </div>
            <button className="save-button log-submit" type="submit" disabled={!selectedRecorder}>
              <Save size={17} />
              บันทึกละเอียด
            </button>
          </form>
          <div className="timeline">
            {selectedLogs.length === 0 ? (
              <p>ยังไม่มีบันทึกพฤติกรรมของนักเรียนคนนี้</p>
            ) : (
              selectedLogs.slice(0, 5).map((log) => (
                <div className="timeline-item" key={log.id}>
                  <CheckCircle2 size={16} />
                  <span>
                    <strong>{getLogLabel(log)}</strong>
                    <em>
                      {formatThaiDate(log.date)} · {getLogCategory(log)}
                      {log.recordedBy ? ` · ${log.recordedBy}` : ""}
                      {log.followUp ? " · ติดตามต่อ" : ""}
                      {log.guardianContact ? " · ติดต่อผู้ปกครอง" : ""}
                    </em>
                    {log.detail && <small>{log.detail}</small>}
                  </span>
                  <strong>{log.points > 0 ? `+${log.points}` : log.points}</strong>
                  <button type="button" aria-label="ลบบันทึก" onClick={() => removeLog(log.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </aside>
    </main>
  );
}

function StudentPhoto({ student, size }) {
  return (
    <div className={`student-photo ${size}`} aria-label={`รูปนักเรียน ${student.full_name}`}>
      {student.photo ? <img src={student.photo} alt="" /> : <span>{getInitials(student)}</span>}
    </div>
  );
}

function getRadarPoints(values, radius, center) {
  return smtAttributes
    .map((attr, index) => {
      const angle = -Math.PI / 2 + (index * 2 * Math.PI) / smtAttributes.length;
      const valueRadius = radius * ((values[attr.key] || 0) / 100);
      const x = center + Math.cos(angle) * valueRadius;
      const y = center + Math.sin(angle) * valueRadius;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function getStatTotal(stats) {
  return smtAttributes.reduce((sum, attr) => sum + Number(stats[attr.key] || 0), 0);
}

function getStatTone(value) {
  if (value >= 80) return "high";
  if (value >= 65) return "mid";
  return "low";
}

function RadarChart({ stats, average, variant = "default" }) {
  const isGame = variant === "game";
  const size = isGame ? 290 : 230;
  const center = size / 2;
  const radius = isGame ? 92 : 78;
  const rings = [20, 40, 60, 80, 100];
  const studentPoints = getRadarPoints(stats, radius, center);
  const averagePoints = getRadarPoints(average, radius, center);

  return (
    <svg className={`radar-chart ${isGame ? "game-radar" : ""}`} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="SMT radar chart">
      {rings.map((ring) => {
        const ringValues = Object.fromEntries(smtAttributes.map((attr) => [attr.key, ring]));
        return <polygon key={ring} points={getRadarPoints(ringValues, radius, center)} className="radar-ring" />;
      })}
      {smtAttributes.map((attr, index) => {
        const angle = -Math.PI / 2 + (index * 2 * Math.PI) / smtAttributes.length;
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        const labelX = center + Math.cos(angle) * (radius + (isGame ? 40 : 24));
        const labelY = center + Math.sin(angle) * (radius + (isGame ? 40 : 24));
        return (
          <g key={attr.key}>
            <line x1={center} y1={center} x2={x} y2={y} className="radar-axis" />
            <text x={labelX} y={labelY} className="radar-label" textAnchor="middle" dominantBaseline="middle">
              {isGame ? (
                <>
                  <tspan className="radar-label-code" x={labelX} dy="-0.5em">{attr.short}</tspan>
                  <tspan className="radar-label-value" x={labelX} dy="1.15em">{stats[attr.key]}</tspan>
                </>
              ) : (
                attr.short
              )}
            </text>
          </g>
        );
      })}
      <polygon points={averagePoints} className="radar-average" />
      <polygon points={studentPoints} className="radar-student" />
      {smtAttributes.map((attr, index) => {
        const angle = -Math.PI / 2 + (index * 2 * Math.PI) / smtAttributes.length;
        const pointRadius = radius * ((stats[attr.key] || 0) / 100);
        return (
          <circle
            key={attr.key}
            cx={center + Math.cos(angle) * pointRadius}
            cy={center + Math.sin(angle) * pointRadius}
            r="3.5"
            className="radar-dot"
          />
        );
      })}
    </svg>
  );
}

function StatBar({ label, value, sublabel, title, variant = "default" }) {
  return (
    <div className={`stat-bar ${variant} ${getStatTone(value)}`}>
      <div>
        <span>
          {label}
          {title && <small>{title}</small>}
        </span>
        <strong>{value}</strong>
      </div>
      <i>
        <b style={{ width: `${value}%` }} />
      </i>
      {sublabel && <small>{sublabel}</small>}
    </div>
  );
}

function AnalysisItem({ label, value, tone = "" }) {
  return (
    <div className={`analysis-item ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Metric({ icon: Icon, label, value, tone }) {
  return (
    <article className={`metric ${tone}`}>
      <Icon size={22} />
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function StatusPill({ student }) {
  if (student.needs_review) {
    return <span className="status-pill review">ตรวจทาน</span>;
  }
  if (isRiskStudent(student)) {
    return <span className="status-pill risk">เฝ้าระวัง</span>;
  }
  return <span className="status-pill normal">ปกติ</span>;
}

function InfoBlock({ icon: Icon, title, children }) {
  return (
    <section className="info-block">
      <h3>
        <Icon size={18} />
        {title}
      </h3>
      <div className="info-grid">{children}</div>
    </section>
  );
}

function DataRow({ label, value, wide = false }) {
  return (
    <div className={wide ? "data-row wide" : "data-row"}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default App;
