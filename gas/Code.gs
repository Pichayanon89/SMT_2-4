const SHEET_NAMES = {
  users: "Users",
  accessMap: "AccessMap",
  students: "Students",
  attendance: "Attendance",
  scores: "Scores",
  homework: "Homework",
  behavior: "Behavior",
  announcements: "Announcements",
  audit: "AuditLog",
  backups: "Backups",
};

const TOKEN_TTL_SECONDS = 60 * 60 * 12; // 12 hours

function doPost(e) {
  try {
    const req = JSON.parse(e.postData.contents || "{}");
    const action = req.action || "";
    enforceActionRole(action, req);
    if (action === "login") return jsonOut(handleLogin(req));
    if (action === "saveState") return jsonOut(handleSaveState(req));
    if (action === "getState") return jsonOut(handleGetState(req));
    if (action === "reportSummary") return jsonOut(handleReportSummary(req));
    if (action === "whoami") return jsonOut(handleWhoAmI(req));
    if (action === "listUsers") return jsonOut(handleListUsers(req));
    if (action === "audit") return jsonOut(handleAudit(req));
    if (action === "backup") return jsonOut(handleBackup(req));
    return jsonOut({ ok: false, error: "unknown_action" });
  } catch (err) {
    return jsonOut({ ok: false, error: err.message });
  }
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function ss() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function ensureSheet(name, headers) {
  const book = ss();
  let sh = book.getSheetByName(name);
  if (!sh) sh = book.insertSheet(name);
  if (sh.getLastRow() === 0) sh.appendRow(headers);
  return sh;
}

function handleLogin(req) {
  const sh = ensureSheet(SHEET_NAMES.users, ["username", "role", "pin_hash", "salt", "active"]);
  const values = sh.getDataRange().getValues();
  const username = String(req.username || "");
  const role = String(req.role || "");
  const pin = String(req.pin || "");
  const rowIdx = values.findIndex((r, i) => i > 0 && String(r[0]) === username && String(r[1]) === role && String(r[4]) === "1");
  if (rowIdx < 1) return { ok: false, error: "invalid_credentials" };
  const row = values[rowIdx];
  const storedHash = String(row[2] || "");
  const salt = String(row[3] || "");
  let ok = false;
  if (storedHash && salt) {
    ok = verifyPin(pin, salt, storedHash);
  } else {
    // Migration-safe fallback: if old sheet still has plaintext in col 3, allow once then auto-upgrade
    const legacyPin = String(row[2] || "");
    if (legacyPin && legacyPin === pin) {
      const migratedSalt = generateSalt();
      const migratedHash = hashPin(pin, migratedSalt);
      sh.getRange(rowIdx + 1, 3, 1, 2).setValues([[migratedHash, migratedSalt]]);
      ok = true;
    }
  }
  if (!ok) return { ok: false, error: "invalid_credentials" };
  const tokenObj = {
    username,
    role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };
  const token = issueSignedToken(tokenObj);
  return { ok: true, token };
}

function authOrThrow(token) {
  if (!token) throw new Error("unauthorized");
  return parseToken(token);
}

function parseToken(token) {
  try {
    const obj = verifySignedToken(token);
    if (!obj || !obj.username || !obj.role) throw new Error("invalid_token");
    const now = Math.floor(Date.now() / 1000);
    if (!obj.exp || now > Number(obj.exp)) throw new Error("token_expired");
    return obj;
  } catch (err) {
    throw new Error("invalid_token");
  }
}

function enforceActionRole(action, req) {
  // login ต้องเปิดให้ทุกคนเข้าถึงเพื่อขอ token
  if (action === "login") return true;

  const tokenUser = authOrThrow(req.token || "");
  // กันการปลอม role/username จาก body
  if (String(req.username || "") && String(req.username) !== String(tokenUser.username)) {
    throw new Error("forbidden_username_mismatch");
  }
  if (String(req.role || "") && String(req.role) !== String(tokenUser.role)) {
    throw new Error("forbidden_role_mismatch");
  }

  const role = String(tokenUser.role || "");
  const rolePolicy = {
    admin: ["saveState", "getState", "reportSummary", "audit", "backup", "whoami", "listUsers"],
    teacher: ["saveState", "getState", "reportSummary", "audit", "whoami", "listUsers"],
    parent: ["getState", "reportSummary", "audit", "whoami"],
    student: ["getState", "reportSummary", "audit", "whoami"],
  };
  const allowed = rolePolicy[role] || [];
  if (!allowed.includes(action)) throw new Error("forbidden_action");
  return true;
}

function handleSaveState(req) {
  authOrThrow(req.token);
  const state = req.state || {};
  writeStudents(state.students || []);
  writeAttendance(state.attendanceByDate || {});
  writeScores(state.scores || {});
  writeHomework(state.homework || []);
  writeBehavior(state.behavior || []);
  writeAnnouncements(state.announcements || []);
  return { ok: true };
}

function handleGetState(req) {
  const user = authOrThrow(req.token);
  const scope = getAccessScope(user);
  const students = readStudents();
  const scopedStudents = filterStudentsByScope(students, scope);
  const scopedIds = new Set(scopedStudents.map((s) => s.student_id));
  return {
    ok: true,
    state: {
      classId: "c-p4-2",
      students: scopedStudents,
      attendanceByDate: filterAttendanceByStudents(readAttendance(), scopedIds),
      scores: filterScoresByStudents(readScores(), scopedIds),
      homework: filterHomeworkByStudents(readHomework(), scopedIds),
      behavior: readBehavior().filter((b) => scopedIds.has(String(b.student_id || ""))),
      announcements: readAnnouncements(),
      updatedAt: new Date().toISOString(),
    },
  };
}

function handleAudit(req) {
  const tokenUser = authOrThrow(req.token);
  const sh = ensureSheet(SHEET_NAMES.audit, ["at", "username", "role", "event", "detail"]);
  sh.appendRow([
    req.at || new Date().toISOString(),
    tokenUser.username || "",
    tokenUser.role || "",
    req.event || "",
    JSON.stringify(req.detail || {}),
  ]);
  return { ok: true };
}

function handleBackup(req) {
  const tokenUser = authOrThrow(req.token);
  const sh = ensureSheet(SHEET_NAMES.backups, ["at", "username", "payload"]);
  sh.appendRow([new Date().toISOString(), tokenUser.username || "", JSON.stringify(req.payload || {})]);
  return { ok: true };
}

function writeStudents(students) {
  const sh = ensureSheet(SHEET_NAMES.students, [
    "student_id",
    "seq",
    "student_code",
    "full_name",
    "phone",
    "guardian_name",
    "status",
  ]);
  sh.clearContents();
  sh.appendRow(["student_id", "seq", "student_code", "full_name", "phone", "guardian_name", "status"]);
  const rows = students.map((s) => [
    s.student_id || "",
    s.seq || "",
    s.student_code || "",
    s.full_name || "",
    s.phone || "",
    s.guardian_name || "",
    s.status || "active",
  ]);
  if (rows.length) sh.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}

function readStudents() {
  const sh = ensureSheet(SHEET_NAMES.students, [
    "student_id",
    "seq",
    "student_code",
    "full_name",
    "phone",
    "guardian_name",
    "status",
  ]);
  const data = sh.getDataRange().getValues();
  return data.slice(1).filter((r) => r[0]).map((r) => ({
    student_id: String(r[0]),
    seq: Number(r[1]) || 0,
    student_code: String(r[2] || ""),
    full_name: String(r[3] || ""),
    phone: String(r[4] || ""),
    guardian_name: String(r[5] || ""),
    status: String(r[6] || "active"),
  }));
}

function writeAttendance(attendanceByDate) {
  const sh = ensureSheet(SHEET_NAMES.attendance, ["date", "student_id", "status"]);
  sh.clearContents();
  sh.appendRow(["date", "student_id", "status"]);
  const rows = [];
  Object.keys(attendanceByDate || {}).forEach((date) => {
    const m = attendanceByDate[date] || {};
    Object.keys(m).forEach((studentId) => {
      rows.push([date, studentId, m[studentId]]);
    });
  });
  if (rows.length) sh.getRange(2, 1, rows.length, 3).setValues(rows);
}

function readAttendance() {
  const sh = ensureSheet(SHEET_NAMES.attendance, ["date", "student_id", "status"]);
  const data = sh.getDataRange().getValues();
  const out = {};
  data.slice(1).forEach((r) => {
    const date = String(r[0] || "");
    const studentId = String(r[1] || "");
    const status = String(r[2] || "");
    if (!date || !studentId) return;
    if (!out[date]) out[date] = {};
    out[date][studentId] = status;
  });
  return out;
}

function writeScores(scores) {
  const sh = ensureSheet(SHEET_NAMES.scores, ["student_id", "subject", "score"]);
  sh.clearContents();
  sh.appendRow(["student_id", "subject", "score"]);
  const rows = [];
  Object.keys(scores || {}).forEach((studentId) => {
    const subMap = scores[studentId] || {};
    Object.keys(subMap).forEach((subject) => {
      rows.push([studentId, subject, Number(subMap[subject])]);
    });
  });
  if (rows.length) sh.getRange(2, 1, rows.length, 3).setValues(rows);
}

function readScores() {
  const sh = ensureSheet(SHEET_NAMES.scores, ["student_id", "subject", "score"]);
  const data = sh.getDataRange().getValues();
  const out = {};
  data.slice(1).forEach((r) => {
    const studentId = String(r[0] || "");
    const subject = String(r[1] || "");
    const score = Number(r[2]);
    if (!studentId || !subject || Number.isNaN(score)) return;
    if (!out[studentId]) out[studentId] = {};
    out[studentId][subject] = score;
  });
  return out;
}

function writeHomework(homework) {
  const sh = ensureSheet(SHEET_NAMES.homework, ["id", "title", "due", "subject", "scoreMax", "submissions_json"]);
  sh.clearContents();
  sh.appendRow(["id", "title", "due", "subject", "scoreMax", "submissions_json"]);
  const rows = (homework || []).map((h) => [
    h.id || "",
    h.title || "",
    h.due || "",
    h.subject || "",
    Number(h.scoreMax || 0),
    JSON.stringify(h.submissions || {}),
  ]);
  if (rows.length) sh.getRange(2, 1, rows.length, 6).setValues(rows);
}

function readHomework() {
  const sh = ensureSheet(SHEET_NAMES.homework, ["id", "title", "due", "subject", "scoreMax", "submissions_json"]);
  const data = sh.getDataRange().getValues();
  return data.slice(1).filter((r) => r[0]).map((r) => ({
    id: String(r[0]),
    title: String(r[1] || ""),
    due: String(r[2] || ""),
    subject: String(r[3] || ""),
    scoreMax: Number(r[4]) || 0,
    submissions: JSON.parse(String(r[5] || "{}")),
  }));
}

function writeAnnouncements(announcements) {
  const sh = ensureSheet(SHEET_NAMES.announcements, ["id", "title", "date"]);
  sh.clearContents();
  sh.appendRow(["id", "title", "date"]);
  const rows = (announcements || []).map((a) => [a.id || "", a.title || "", a.date || ""]);
  if (rows.length) sh.getRange(2, 1, rows.length, 3).setValues(rows);
}

function readAnnouncements() {
  const sh = ensureSheet(SHEET_NAMES.announcements, ["id", "title", "date"]);
  const data = sh.getDataRange().getValues();
  return data.slice(1).filter((r) => r[0]).map((r) => ({
    id: String(r[0]),
    title: String(r[1] || ""),
    date: String(r[2] || ""),
  }));
}

function writeBehavior(items) {
  const sh = ensureSheet(SHEET_NAMES.behavior, ["id", "student_id", "text", "points", "date"]);
  sh.clearContents();
  sh.appendRow(["id", "student_id", "text", "points", "date"]);
  const rows = (items || []).map((b) => [
    b.id || "",
    b.student_id || "",
    b.text || "",
    Number(b.points || 0),
    b.date || "",
  ]);
  if (rows.length) sh.getRange(2, 1, rows.length, 5).setValues(rows);
}

function readBehavior() {
  const sh = ensureSheet(SHEET_NAMES.behavior, ["id", "student_id", "text", "points", "date"]);
  const data = sh.getDataRange().getValues();
  return data.slice(1).filter((r) => r[0]).map((r) => ({
    id: String(r[0]),
    student_id: String(r[1] || ""),
    text: String(r[2] || ""),
    points: Number(r[3]) || 0,
    date: String(r[4] || ""),
  }));
}

function handleReportSummary(req) {
  const user = authOrThrow(req.token);
  const scope = getAccessScope(user);
  const students = filterStudentsByScope(readStudents(), scope);
  const studentIdSet = new Set(students.map((s) => s.student_id));
  const attendance = filterAttendanceByStudents(readAttendance(), studentIdSet);
  const scores = filterScoresByStudents(readScores(), studentIdSet);

  const studentCount = students.length;
  const scoreRows = [];
  Object.keys(scores).forEach((studentId) => {
    const subMap = scores[studentId] || {};
    Object.keys(subMap).forEach((subject) => {
      const sc = Number(subMap[subject]);
      if (!Number.isNaN(sc)) scoreRows.push({ studentId, subject, score: sc });
    });
  });

  const avgScore = scoreRows.length
    ? Math.round(scoreRows.reduce((sum, r) => sum + r.score, 0) / scoreRows.length)
    : 0;

  const bySubjectMap = {};
  scoreRows.forEach((r) => {
    if (!bySubjectMap[r.subject]) bySubjectMap[r.subject] = [];
    bySubjectMap[r.subject].push(r.score);
  });
  const bySubject = Object.keys(bySubjectMap).map((subject) => ({
    subject,
    avg: Math.round(bySubjectMap[subject].reduce((a, b) => a + b, 0) / bySubjectMap[subject].length),
    count: bySubjectMap[subject].length,
  }));

  const dateKeys = Object.keys(attendance).sort();
  const lastDate = dateKeys[dateKeys.length - 1] || "";
  const dayMap = lastDate ? attendance[lastDate] || {} : {};
  const present = Object.values(dayMap).filter((v) => v === "present").length;
  const late = Object.values(dayMap).filter((v) => v === "late").length;
  const absent = Object.values(dayMap).filter((v) => v === "absent").length;
  const attendanceRate = studentCount ? Math.round(((present + late) / studentCount) * 100) : 0;

  const trend14 = dateKeys.slice(-14).map((date) => {
    const m = attendance[date] || {};
    const p = Object.values(m).filter((v) => v === "present").length;
    const l = Object.values(m).filter((v) => v === "late").length;
    const a = Object.values(m).filter((v) => v === "absent").length;
    const rate = studentCount ? Math.round(((p + l) / studentCount) * 100) : 0;
    return { date, present: p, late: l, absent: a, rate };
  });

  return {
    ok: true,
    report: {
      studentCount,
      avgScore,
      bySubject,
      attendance: {
        lastDate,
        present,
        late,
        absent,
        attendanceRate,
      },
      trend14,
      generatedAt: new Date().toISOString(),
    },
  };
}

function getSecret() {
  const props = PropertiesService.getScriptProperties();
  let secret = props.getProperty("APP_SECRET");
  if (!secret) {
    secret = Utilities.getUuid() + Utilities.getUuid();
    props.setProperty("APP_SECRET", secret);
  }
  return secret;
}

function signPayload(payloadB64) {
  const secret = getSecret();
  const signatureBytes = Utilities.computeHmacSha256Signature(payloadB64, secret);
  return Utilities.base64EncodeWebSafe(signatureBytes);
}

function issueSignedToken(payloadObj) {
  const payloadB64 = Utilities.base64EncodeWebSafe(JSON.stringify(payloadObj));
  const sigB64 = signPayload(payloadB64);
  return `${payloadB64}.${sigB64}`;
}

function verifySignedToken(token) {
  const parts = String(token || "").split(".");
  if (parts.length !== 2) throw new Error("invalid_token_format");
  const payloadB64 = parts[0];
  const sigB64 = parts[1];
  const expected = signPayload(payloadB64);
  if (sigB64 !== expected) throw new Error("invalid_signature");
  const text = Utilities.newBlob(Utilities.base64DecodeWebSafe(payloadB64)).getDataAsString();
  return JSON.parse(text);
}

function generateSalt() {
  return Utilities.base64EncodeWebSafe(Utilities.getUuid());
}

function hashPin(pin, salt) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, `${salt}:${pin}`);
  return Utilities.base64EncodeWebSafe(digest);
}

function verifyPin(pin, salt, expectedHash) {
  return hashPin(pin, salt) === expectedHash;
}

function getAccessScope(user) {
  const role = String(user.role || "");
  if (role === "admin" || role === "teacher") return { type: "all", ids: [] };
  const sh = ensureSheet(SHEET_NAMES.accessMap, ["username", "role", "student_id", "active"]);
  const data = sh.getDataRange().getValues();
  const ids = data
    .slice(1)
    .filter((r) => String(r[0]) === String(user.username || ""))
    .filter((r) => String(r[1]) === role)
    .filter((r) => String(r[3]) === "1")
    .map((r) => String(r[2] || ""))
    .filter(Boolean);
  return { type: "restricted", ids };
}

function filterStudentsByScope(students, scope) {
  if (!scope || scope.type === "all") return students;
  const set = new Set(scope.ids || []);
  return students.filter((s) => set.has(String(s.student_id || "")));
}

function filterAttendanceByStudents(attendanceByDate, studentIdSet) {
  const out = {};
  Object.keys(attendanceByDate || {}).forEach((date) => {
    const m = attendanceByDate[date] || {};
    const mm = {};
    Object.keys(m).forEach((sid) => {
      if (studentIdSet.has(String(sid))) mm[sid] = m[sid];
    });
    out[date] = mm;
  });
  return out;
}

function filterScoresByStudents(scores, studentIdSet) {
  const out = {};
  Object.keys(scores || {}).forEach((sid) => {
    if (studentIdSet.has(String(sid))) out[sid] = scores[sid];
  });
  return out;
}

function filterHomeworkByStudents(homework, studentIdSet) {
  return (homework || []).map((h) => {
    const submissions = {};
    Object.keys(h.submissions || {}).forEach((sid) => {
      if (studentIdSet.has(String(sid))) submissions[sid] = h.submissions[sid];
    });
    return { ...h, submissions };
  });
}

function handleWhoAmI(req) {
  const user = authOrThrow(req.token);
  const role = String(user.role || "");
  const rolePolicy = {
    admin: ["saveState", "getState", "reportSummary", "audit", "backup", "whoami", "listUsers"],
    teacher: ["saveState", "getState", "reportSummary", "audit", "whoami", "listUsers"],
    parent: ["getState", "reportSummary", "audit", "whoami"],
    student: ["getState", "reportSummary", "audit", "whoami"],
  };
  return {
    ok: true,
    user: {
      username: user.username,
      role,
      iat: user.iat || "",
      allowedActions: rolePolicy[role] || [],
    },
  };
}

function handleListUsers(req) {
  authOrThrow(req.token);
  const sh = ensureSheet(SHEET_NAMES.users, ["username", "role", "pin_hash", "salt", "active"]);
  const values = sh.getDataRange().getValues();
  const roleFilter = String(req.targetRole || "");
  const users = values
    .slice(1)
    .filter((r) => String(r[4]) === "1")
    .filter((r) => !roleFilter || String(r[1]) === roleFilter)
    .map((r) => ({
      username: String(r[0] || ""),
      role: String(r[1] || ""),
    }));
  return { ok: true, users };
}

// Optional admin helper: run manually in Apps Script editor to create/update a user with hashed PIN.
function upsertUser(username, role, pin, active) {
  const sh = ensureSheet(SHEET_NAMES.users, ["username", "role", "pin_hash", "salt", "active"]);
  const data = sh.getDataRange().getValues();
  const idx = data.findIndex((r, i) => i > 0 && String(r[0]) === String(username) && String(r[1]) === String(role));
  const salt = generateSalt();
  const pinHash = hashPin(String(pin), salt);
  const row = [String(username), String(role), pinHash, salt, active ? "1" : "0"];
  if (idx > 0) sh.getRange(idx + 1, 1, 1, row.length).setValues([row]);
  else sh.appendRow(row);
}
