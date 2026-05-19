import { getSupabaseClient } from "./supabaseClient";

const DEFAULT_CLASS_ID = "c-p4-2";
const DEFAULT_ALLOWED = {
  admin: ["saveState", "getState", "reportSummary", "audit", "whoami", "listUsers"],
  teacher: ["saveState", "getState", "reportSummary", "audit", "whoami", "listUsers"],
  parent: ["getState", "reportSummary", "audit", "whoami"],
  student: ["getState", "reportSummary", "audit", "whoami"],
};

export function makeSupabaseConfig(cloud) {
  return {
    url: cloud.supabaseUrl || import.meta.env.VITE_SUPABASE_URL || "",
    anonKey: cloud.supabaseAnonKey || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || "",
    email: cloud.email || "",
    password: cloud.password || "",
    role: cloud.role || "teacher",
    username: cloud.username || "",
    classId: cloud.classId || DEFAULT_CLASS_ID,
  };
}

export function createSchoolBackend(cloud) {
  const config = makeSupabaseConfig(cloud);
  if (!config.url || !config.anonKey) throw new Error("ยังไม่ได้ใส่ Supabase URL และ anon key");

  const supabase = getSupabaseClient(config.url, config.anonKey);

  async function checked(result) {
    const { error } = await result;
    if (error) throw error;
  }

  async function requireProfile() {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    const user = userData?.user;
    if (!user) throw new Error("unauthorized");

    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, role, full_name")
      .eq("id", user.id)
      .single();
    if (error) throw error;
    return {
      id: user.id,
      email: user.email,
      username: data?.username || user.email || "",
      role: data?.role || user.user_metadata?.role || "student",
      fullName: data?.full_name || "",
    };
  }

  function toUser(profile) {
    return {
      username: profile.username,
      role: profile.role,
      email: profile.email,
      allowedActions: DEFAULT_ALLOWED[profile.role] || [],
    };
  }

  async function login() {
    if (!config.email || !config.password) throw new Error("กรอกรหัสผู้ใช้และรหัสผ่านก่อน");
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: config.email,
      password: config.password,
    });
    if (error) throw error;
    let profile;
    try {
      profile = await requireProfile();
    } catch (profileError) {
      if (config.role !== "admin") {
        throw new Error("ยังไม่ได้ตั้งค่า profile/role ให้บัญชีนี้ ให้ผู้ดูแลระบบเพิ่มในตาราง profiles ก่อน");
      }
      const user = authData?.user;
      if (!user?.id) throw profileError;
      const username = config.username || user.email?.split("@")[0] || "admin";
      const { error: insertError } = await supabase.from("profiles").insert({
        id: user.id,
        username,
        role: "admin",
        full_name: "ผู้ดูแลระบบ",
        active: true,
      });
      if (insertError) {
        throw new Error(`ตั้งค่า admin role ไม่สำเร็จ: ${insertError.message}`);
      }
      profile = await requireProfile();
    }
    return { ok: true, user: toUser(profile), token: "supabase-session" };
  }

  async function saveState(state) {
    const profile = await requireProfile();
    if (!["admin", "teacher"].includes(profile.role)) throw new Error("forbidden_action");
    const classId = state.classId || DEFAULT_CLASS_ID;

    await replaceStudents(classId, state.students || []);
    await replaceAttendance(classId, state.attendanceByDate || {});
    await replaceScores(classId, state.scores || {});
    await replaceHomework(classId, state.homework || []);
    await replaceBehavior(classId, state.behavior || []);
    await replaceAnnouncements(classId, state.announcements || []);
    return { ok: true };
  }

  async function getState() {
    await requireProfile();
    const classId = config.classId;
    const [students, attendanceByDate, scores, homework, behavior, announcements] = await Promise.all([
      loadStudents(classId),
      loadAttendance(classId),
      loadScores(classId),
      loadHomework(classId),
      loadBehavior(classId),
      loadAnnouncements(classId),
    ]);

    return {
      ok: true,
      state: {
        classId,
        students,
        attendanceByDate,
        scores,
        homework,
        behavior,
        announcements,
        updatedAt: new Date().toISOString(),
      },
    };
  }

  async function reportSummary() {
    const data = await getState();
    return { ok: true, report: buildReport(data.state) };
  }

  async function whoami() {
    const profile = await requireProfile();
    return { ok: true, user: toUser(profile) };
  }

  async function listUsers(targetRole) {
    await requireProfile();
    let query = supabase.from("profiles").select("username, role").eq("active", true).order("username");
    if (targetRole) query = query.eq("role", targetRole);
    const { data, error } = await query;
    if (error) throw error;
    return { ok: true, users: data || [] };
  }

  async function audit(event, detail, at) {
    const profile = await requireProfile();
    await checked(
      supabase.from("audit_log").insert({
        at: at || new Date().toISOString(),
        user_id: profile.id,
        username: profile.username,
        role: profile.role,
        event,
        detail: detail || {},
      }),
    );
    return { ok: true };
  }

  async function replaceStudents(classId, students) {
    const rows = students.map((s) => ({
      student_id: s.student_id,
      classroom_id: classId,
      seq: s.seq || 0,
      student_code: s.student_code || "",
      full_name: s.full_name || "",
      sex: s.sex || "",
      birthdate_th: s.birthdate_th || "",
      phone: s.phone || "",
      guardian_name: s.guardian_name || "",
      guardian_relationship: s.guardian_relationship || "",
      parent_status: s.parent_status || "",
      registered_address: s.registered_address || "",
      current_address: s.current_address || "",
      status: s.status || "active",
    }));
    if (rows.length) await checked(supabase.from("students").upsert(rows, { onConflict: "student_id" }));
  }

  async function replaceAttendance(classId, attendanceByDate) {
    const rows = [];
    Object.entries(attendanceByDate || {}).forEach(([date, day]) => {
      Object.entries(day || {}).forEach(([studentId, status]) => {
        rows.push({ classroom_id: classId, date, student_id: studentId, status });
      });
    });
    await checked(supabase.from("attendance").delete().eq("classroom_id", classId));
    if (rows.length) await checked(supabase.from("attendance").insert(rows));
  }

  async function replaceScores(classId, scores) {
    const rows = [];
    Object.entries(scores || {}).forEach(([studentId, subjectMap]) => {
      Object.entries(subjectMap || {}).forEach(([subject, score]) => {
        if (typeof score === "number") rows.push({ classroom_id: classId, student_id: studentId, subject, score });
      });
    });
    await checked(supabase.from("scores").delete().eq("classroom_id", classId));
    if (rows.length) await checked(supabase.from("scores").insert(rows));
  }

  async function replaceHomework(classId, homework) {
    const workRows = (homework || []).map((h) => ({
      id: h.id,
      classroom_id: classId,
      title: h.title || "",
      due: h.due || null,
      subject: h.subject || "",
      score_max: Number(h.scoreMax || 0),
    }));
    const submissionRows = [];
    (homework || []).forEach((h) => {
      Object.entries(h.submissions || {}).forEach(([studentId, submitted]) => {
        submissionRows.push({
          classroom_id: classId,
          homework_id: h.id,
          student_id: studentId,
          submitted: Boolean(submitted),
        });
      });
    });
    await checked(supabase.from("homework_submissions").delete().eq("classroom_id", classId));
    await checked(supabase.from("homework").delete().eq("classroom_id", classId));
    if (workRows.length) await checked(supabase.from("homework").insert(workRows));
    if (submissionRows.length) await checked(supabase.from("homework_submissions").insert(submissionRows));
  }

  async function replaceBehavior(classId, behavior) {
    const rows = (behavior || []).map((b) => ({
      id: b.id,
      classroom_id: classId,
      student_id: b.student_id,
      text: b.text || "",
      points: Number(b.points || 0),
      date: b.date || null,
      recorded_by: b.by || "",
    }));
    await checked(supabase.from("behavior").delete().eq("classroom_id", classId));
    if (rows.length) await checked(supabase.from("behavior").insert(rows));
  }

  async function replaceAnnouncements(classId, announcements) {
    const rows = (announcements || []).map((a) => ({
      id: a.id,
      classroom_id: classId,
      title: a.title || "",
      date: a.date || null,
    }));
    await checked(supabase.from("announcements").delete().eq("classroom_id", classId));
    if (rows.length) await checked(supabase.from("announcements").insert(rows));
  }

  async function loadStudents(classId) {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("classroom_id", classId)
      .order("seq", { ascending: true });
    if (error) throw error;
    return (data || []).map((s) => ({
      student_id: s.student_id,
      seq: s.seq,
      student_code: s.student_code,
      full_name: s.full_name,
      sex: s.sex || "-",
      birthdate_th: s.birthdate_th || "-",
      phone: s.phone || "",
      guardian_name: s.guardian_name || "-",
      guardian_relationship: s.guardian_relationship || "-",
      parent_status: s.parent_status || "-",
      registered_address: s.registered_address || "-",
      current_address: s.current_address || "-",
      status: s.status || "active",
    }));
  }

  async function loadAttendance(classId) {
    const { data, error } = await supabase.from("attendance").select("date, student_id, status").eq("classroom_id", classId);
    if (error) throw error;
    const out = {};
    (data || []).forEach((r) => {
      if (!out[r.date]) out[r.date] = {};
      out[r.date][r.student_id] = r.status;
    });
    return out;
  }

  async function loadScores(classId) {
    const { data, error } = await supabase.from("scores").select("student_id, subject, score").eq("classroom_id", classId);
    if (error) throw error;
    const out = {};
    (data || []).forEach((r) => {
      if (!out[r.student_id]) out[r.student_id] = {};
      out[r.student_id][r.subject] = Number(r.score);
    });
    return out;
  }

  async function loadHomework(classId) {
    const [{ data: work, error: workError }, { data: submissions, error: subError }] = await Promise.all([
      supabase.from("homework").select("id, title, due, subject, score_max").eq("classroom_id", classId).order("due", { ascending: false }),
      supabase.from("homework_submissions").select("homework_id, student_id, submitted").eq("classroom_id", classId),
    ]);
    if (workError) throw workError;
    if (subError) throw subError;
    const submissionMap = {};
    (submissions || []).forEach((r) => {
      if (!submissionMap[r.homework_id]) submissionMap[r.homework_id] = {};
      submissionMap[r.homework_id][r.student_id] = Boolean(r.submitted);
    });
    return (work || []).map((h) => ({
      id: h.id,
      title: h.title,
      due: h.due || "",
      subject: h.subject || "",
      scoreMax: Number(h.score_max || 0),
      submissions: submissionMap[h.id] || {},
    }));
  }

  async function loadBehavior(classId) {
    const { data, error } = await supabase
      .from("behavior")
      .select("id, student_id, text, points, date, recorded_by")
      .eq("classroom_id", classId)
      .order("date", { ascending: false });
    if (error) throw error;
    return (data || []).map((b) => ({
      id: b.id,
      student_id: b.student_id,
      text: b.text,
      points: Number(b.points || 0),
      date: b.date || "",
      by: b.recorded_by || "",
    }));
  }

  async function loadAnnouncements(classId) {
    const { data, error } = await supabase
      .from("announcements")
      .select("id, title, date")
      .eq("classroom_id", classId)
      .order("date", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  return { login, saveState, getState, reportSummary, whoami, listUsers, audit };
}

function buildReport(state) {
  const students = state.students || [];
  const scores = state.scores || {};
  const attendance = state.attendanceByDate || {};
  const studentCount = students.length;
  const scoreRows = [];

  Object.entries(scores).forEach(([studentId, subjectMap]) => {
    Object.entries(subjectMap || {}).forEach(([subject, score]) => {
      const numeric = Number(score);
      if (!Number.isNaN(numeric)) scoreRows.push({ studentId, subject, score: numeric });
    });
  });

  const avgScore = scoreRows.length ? Math.round(scoreRows.reduce((sum, r) => sum + r.score, 0) / scoreRows.length) : 0;
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
    studentCount,
    avgScore,
    bySubject,
    attendance: { lastDate, present, late, absent, attendanceRate },
    trend14,
    generatedAt: new Date().toISOString(),
  };
}
