import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BookOpenCheck,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Database,
  FileText,
  LogOut,
  PhoneCall,
  Plus,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import studentSeed from "./data/students_p4_2_35.json";
import { getSupabaseClient } from "./supabaseClient";

const CLASS_ID = "c-p4-2";
const CLASS_LABEL = "SMT ป.4/2";
const SCHOOL_NAME = "โรงเรียนอนุบาลหนองหานวิทยายน";
const TODAY = () => new Date().toISOString().slice(0, 10);
const ASSET_BASE = import.meta.env.BASE_URL || "/";
const brandAsset = (fileName) => `${ASSET_BASE}brand/${fileName}`;
const TEACHERS = [
  "นางฐิติยาภรณ์ วิเศษโวหาร",
  "นายพิชญานนท์ วัจนสุนทร",
  "นายพงศกร วิบุญกุล",
];
const navItems = [
  ["dashboard", BarChart3, "แดชบอร์ด"],
  ["attendance", ClipboardCheck, "เช็คชื่อ"],
  ["students", Users, "นักเรียน"],
  ["work", BookOpenCheck, "งาน/พฤติกรรม"],
  ["setup", Database, "ตั้งค่า"],
];

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function statusText(status) {
  return { present: "มา", late: "สาย", absent: "ขาด", leave: "ลา" }[status] || "-";
}

function timeText(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function dateText(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return value;
  }
}

function normalizeRosterStudent(row) {
  return {
    student_id: row.student_id,
    classroom_id: CLASS_ID,
    seq: Number(row.seq || 0),
    student_code: row.student_code || "",
    full_name: row.full_name || "",
    display_name: row.display_name || row.full_name || "",
    sex: row.sex || "",
    birthdate_th: row.birthdate_th || "",
    registered_address: row.registered_address || "",
    current_address: row.current_address || "",
    guardian_name: row.guardian_name || "",
    guardian_relationship: row.guardian_relationship || "",
    parent_status: row.parent_status || "",
    phone: row.phone || "",
    phone_2: row.phone_2 || row.phone2 || "",
    phone_3: row.phone_3 || row.phone3 || "",
    nickname: row.nickname || "",
    health_note: row.health_note || "",
    enrolled_date: row.enrolled_date || row.enrolled_at_th || "",
    previous_class_note: row.previous_class_note || "",
    note: row.note || "",
    needs_review: row.needs_review || "",
    active: true,
  };
}

function App() {
  const [supabaseReady, setSupabaseReady] = useState(true);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [data, setData] = useState(emptyData());
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [form, setForm] = useState({});

  const supabase = useMemo(() => {
    try {
      return getSupabaseClient();
    } catch {
      setSupabaseReady(false);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: auth }) => setSession(auth.session || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession || null));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!session || !supabase) return;
    loadAll();
  }, [session, supabase]);

  const students = data.students;
  const selectedStudent = students.find((student) => student.student_id === selectedId) || students[0] || null;
  const filteredStudents = students.filter((student) => {
    const text = `${student.seq} ${student.full_name} ${student.student_code || ""}`.toLowerCase();
    return text.includes(query.trim().toLowerCase());
  });
  const dashboard = useMemo(() => buildDashboard(data), [data]);

  async function login(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const email = form.email || "";
      const password = form.password || "";
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      setMessage(error.message || "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setData(emptyData());
  }

  async function loadAll() {
    setLoading(true);
    setMessage("");
    try {
      const userId = session?.user?.id;
      const [
        profileRes,
        teacherRes,
        studentsRes,
        attendanceRes,
        homeworkRes,
        homeworkStatusRes,
        behaviorRes,
        followRes,
        contactRes,
        scoreRes,
      ] = await Promise.all([
        supabase.from("profiles").select("id,display_name,role").eq("id", userId).single(),
        supabase.from("classroom_teachers").select("teacher_name,teacher_order").eq("classroom_id", CLASS_ID).eq("active", true).order("teacher_order"),
        supabase.from("students").select("*").eq("classroom_id", CLASS_ID).eq("active", true).order("seq"),
        supabase.from("attendance").select("*").eq("classroom_id", CLASS_ID).gte("date", addDays(TODAY(), -45)).order("date", { ascending: false }),
        supabase.from("homework").select("*").eq("classroom_id", CLASS_ID).eq("active", true).order("due", { ascending: true }),
        supabase.from("homework_status").select("*"),
        supabase.from("behavior").select("*").eq("classroom_id", CLASS_ID).gte("date", addDays(TODAY(), -45)).order("date", { ascending: false }),
        supabase.from("follow_ups").select("*").eq("classroom_id", CLASS_ID).order("date", { ascending: false }),
        supabase.from("parent_contacts").select("*").eq("classroom_id", CLASS_ID).order("date", { ascending: false }),
        supabase.from("scores").select("*").eq("classroom_id", CLASS_ID).order("date", { ascending: false }),
      ]);
      [profileRes, teacherRes, studentsRes, attendanceRes, homeworkRes, homeworkStatusRes, behaviorRes, followRes, contactRes, scoreRes].forEach((res) => {
        if (res.error) throw res.error;
      });
      setProfile(profileRes.data);
      setData({
        teachers: teacherRes.data?.length ? teacherRes.data.map((row) => row.teacher_name) : TEACHERS,
        students: studentsRes.data || [],
        attendance: attendanceRes.data || [],
        homework: homeworkRes.data || [],
        homeworkStatus: homeworkStatusRes.data || [],
        behavior: behaviorRes.data || [],
        followUps: followRes.data || [],
        parentContacts: contactRes.data || [],
        scores: scoreRes.data || [],
      });
      if (!selectedId && studentsRes.data?.[0]) setSelectedId(studentsRes.data[0].student_id);
    } catch (error) {
      setMessage(error.message || "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  async function seedStudents() {
    if (!window.confirm("นำเข้ารายชื่อนักเรียน ป.4/2 จำนวน 35 คนเข้า Supabase ใช่ไหม?")) return;
    setLoading(true);
    try {
      const rows = studentSeed.map(normalizeRosterStudent);
      const { error } = await supabase.from("students").upsert(rows, { onConflict: "student_id" });
      if (error) throw error;
      await loadAll();
      setMessage("นำเข้ารายชื่อนักเรียนแล้ว");
    } catch (error) {
      setMessage(error.message || "นำเข้ารายชื่อไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  async function setAttendance(student, status) {
    const existing = data.attendance.find((row) => row.date === TODAY() && row.student_id === student.student_id);
    const recorder = profile?.display_name || session?.user?.email || "";
    if (existing && existing.status !== status && existing.updated_by && existing.updated_by !== recorder) {
      const ok = window.confirm(`${existing.updated_by} เช็คไว้แล้ว (${statusText(existing.status)}) ต้องการแก้เป็น "${statusText(status)}" โดย ${recorder} ใช่ไหม?`);
      if (!ok) return;
    }
    const row = {
      classroom_id: CLASS_ID,
      date: TODAY(),
      student_id: student.student_id,
      status,
      updated_at: new Date().toISOString(),
      updated_by: recorder,
    };
    const { error } = await supabase.from("attendance").upsert(row, { onConflict: "date,student_id" });
    if (error) return setMessage(error.message);
    await loadAll();
  }

  async function markAllPresent() {
    if (!window.confirm("เช็คชื่อเป็น 'มา' ทั้งหมดสำหรับวันนี้ใช่ไหม?")) return;
    const recorder = profile?.display_name || session?.user?.email || "";
    const rows = students.map((student) => ({
      classroom_id: CLASS_ID,
      date: TODAY(),
      student_id: student.student_id,
      status: "present",
      updated_at: new Date().toISOString(),
      updated_by: recorder,
    }));
    const { error } = await supabase.from("attendance").upsert(rows, { onConflict: "date,student_id" });
    if (error) return setMessage(error.message);
    await loadAll();
  }

  async function addHomework(event) {
    event.preventDefault();
    const title = form.homeworkTitle?.trim();
    if (!title) return;
    const { error } = await supabase.from("homework").insert({
      homework_id: crypto.randomUUID(),
      classroom_id: CLASS_ID,
      title,
      subject: form.homeworkSubject || "ทั่วไป",
      due: form.homeworkDue || null,
      active: true,
      created_by: profile?.display_name || "",
    });
    if (error) return setMessage(error.message);
    setForm((prev) => ({ ...prev, homeworkTitle: "", homeworkSubject: "", homeworkDue: "" }));
    await loadAll();
  }

  async function setHomeworkDone(homeworkId, studentId) {
    if (!studentId) return;
    const { error } = await supabase.from("homework_status").upsert({
      homework_id: homeworkId,
      student_id: studentId,
      status: "done",
      updated_at: new Date().toISOString(),
      updated_by: profile?.display_name || "",
    }, { onConflict: "homework_id,student_id" });
    if (error) return setMessage(error.message);
    await loadAll();
  }

  async function addBehavior(event) {
    event.preventDefault();
    if (!form.behaviorStudent) return;
    const tone = form.behaviorTone || "note";
    const points = tone === "positive" ? 5 : tone === "negative" ? -5 : tone === "follow" ? -3 : 0;
    const { error } = await supabase.from("behavior").insert({
      id: crypto.randomUUID(),
      classroom_id: CLASS_ID,
      date: TODAY(),
      student_id: form.behaviorStudent,
      category: form.behaviorCategory || "ทั่วไป",
      tone,
      points,
      note: form.behaviorNote || "",
      follow_up: tone === "follow",
      created_by: profile?.display_name || "",
    });
    if (error) return setMessage(error.message);
    setForm((prev) => ({ ...prev, behaviorNote: "" }));
    await loadAll();
  }

  async function addFollowUp(studentId, topic) {
    const { error } = await supabase.from("follow_ups").insert({
      followup_id: crypto.randomUUID(),
      classroom_id: CLASS_ID,
      date: TODAY(),
      student_id: studentId,
      topic: topic || "ติดตามรายบุคคล",
      method: "พูดคุยนักเรียน/ผู้ปกครอง",
      status: "open",
      created_by: profile?.display_name || "",
    });
    if (error) return setMessage(error.message);
    await loadAll();
  }

  async function addParentContact(studentId, contact) {
    const topic = contact.topic?.trim();
    if (!studentId || !topic) return;
    const { error } = await supabase.from("parent_contacts").insert({
      contact_id: crypto.randomUUID(),
      classroom_id: CLASS_ID,
      date: contact.date || TODAY(),
      student_id: studentId,
      method: contact.method || "phone",
      topic,
      result: contact.result?.trim() || "",
      next_date: contact.next_date || null,
      created_by: profile?.display_name || "",
    });
    if (error) return setMessage(error.message);
    setMessage("บันทึกการติดต่อผู้ปกครองแล้ว");
    await loadAll();
  }

  async function closeFollowUp(id) {
    const { error } = await supabase.from("follow_ups").update({
      status: "done",
      closed_at: new Date().toISOString(),
      closed_by: profile?.display_name || "",
    }).eq("followup_id", id);
    if (error) return setMessage(error.message);
    await loadAll();
  }

  async function addScore(event) {
    event.preventDefault();
    if (!form.scoreStudent || !form.scoreValue) return;
    const { error } = await supabase.from("scores").upsert({
      classroom_id: CLASS_ID,
      date: TODAY(),
      student_id: form.scoreStudent,
      area: form.scoreArea || "ประเมินสั้น",
      score: Number(form.scoreValue),
      note: form.scoreNote || "",
      updated_at: new Date().toISOString(),
      updated_by: profile?.display_name || "",
    }, { onConflict: "date,student_id,area" });
    if (error) return setMessage(error.message);
    setForm((prev) => ({ ...prev, scoreValue: "", scoreNote: "" }));
    await loadAll();
  }

  async function uploadPhoto(student, file) {
    if (!file) return;
    setLoading(true);
    try {
      const blob = await resizeImage(file);
      const path = `${CLASS_ID}/${student.student_id}/profile.jpg`;
      const { error: uploadError } = await supabase.storage.from("student-photos").upload(path, blob, {
        upsert: true,
        contentType: "image/jpeg",
      });
      if (uploadError) throw uploadError;
      const { error: updateError } = await supabase.from("students").update({
        photo_path: path,
        photo_updated_at: new Date().toISOString(),
        photo_by: profile?.display_name || "",
      }).eq("student_id", student.student_id);
      if (updateError) throw updateError;
      await loadAll();
      await loadPhoto(path);
      setMessage("อัปโหลดรูปแล้ว");
    } catch (error) {
      setMessage(error.message || "อัปโหลดรูปไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  async function updateStudentDetails(studentId, changes) {
    if (!studentId) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("students").update({
        nickname: changes.nickname?.trim() || null,
        health_note: changes.health_note?.trim() || null,
        phone: changes.phone?.trim() || null,
        phone_2: changes.phone_2?.trim() || null,
        phone_3: changes.phone_3?.trim() || null,
        updated_at: new Date().toISOString(),
      }).eq("student_id", studentId);
      if (error) throw error;
      await loadAll();
      setMessage("บันทึกข้อมูลโปรไฟล์แล้ว");
    } catch (error) {
      setMessage(error.message || "บันทึกข้อมูลโปรไฟล์ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  async function loadPhoto(path) {
    setPhotoUrl("");
    if (!path) return;
    const { data: signed, error } = await supabase.storage.from("student-photos").createSignedUrl(path, 60 * 10);
    if (!error) setPhotoUrl(signed.signedUrl);
  }

  useEffect(() => {
    if (selectedStudent?.photo_path) loadPhoto(selectedStudent.photo_path);
    else setPhotoUrl("");
  }, [selectedStudent?.student_id, selectedStudent?.photo_path]);

  if (!supabaseReady) return <SetupMissing />;
  if (!session) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="logo-pair">
            <img src={brandAsset("anbnhs.jpg")} alt="โรงเรียน" />
            <img src={brandAsset("smt4-2.png")} alt="SMT 4/2" />
          </div>
          <h1>Teacher Cockpit</h1>
          <p>{CLASS_LABEL} · {SCHOOL_NAME}</p>
          <form onSubmit={login} className="form">
            <label>อีเมลครู<input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            <label>รหัสผ่าน<input type="password" value={form.password || ""} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
            <button className="primary" disabled={loading}>{loading ? "กำลังเข้า..." : "เข้าสู่ระบบ"}</button>
          </form>
          {message && <div className="notice danger">{message}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside>
        <div className="brand">
          <img src={brandAsset("smt4-2.png")} alt="SMT" />
          <div><strong>{CLASS_LABEL}</strong><span>{SCHOOL_NAME}</span></div>
        </div>
        <nav>
          {navItems.map(([id, Icon, label]) => (
            <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>
        <div className="side-foot">
          <span>ผู้ใช้: {profile?.display_name || session.user.email}</span>
          <button onClick={logout}><LogOut size={16} /> ออก</button>
        </div>
      </aside>
      <main>
        <header>
          <div>
            <h1>{navItems.find(([id]) => id === tab)?.[2] || CLASS_LABEL}</h1>
            <p>{CLASS_LABEL} · ข้อมูลจาก Supabase</p>
          </div>
          <button className="ghost" onClick={loadAll}><RefreshCw size={16} /> โหลดใหม่</button>
        </header>
        {message && <div className="notice">{message}</div>}
        {loading && <div className="notice">กำลังทำงาน...</div>}
        {tab === "dashboard" && <Dashboard dashboard={dashboard} students={students} setTab={setTab} setSelectedId={setSelectedId} />}
        {tab === "attendance" && <Attendance students={students} data={data} setAttendance={setAttendance} markAllPresent={markAllPresent} />}
        {tab === "students" && (
          <Students
            students={filteredStudents}
            query={query}
            setQuery={setQuery}
            selectedStudent={selectedStudent}
            setSelectedId={setSelectedId}
            photoUrl={photoUrl}
            uploadPhoto={uploadPhoto}
            updateStudentDetails={updateStudentDetails}
            addParentContact={addParentContact}
            profile={studentProfile(selectedStudent, data)}
            data={data}
            teacherName={profile?.display_name || session.user.email}
            addFollowUp={addFollowUp}
          />
        )}
        {tab === "work" && (
          <Work
            data={data}
            form={form}
            setForm={setForm}
            addHomework={addHomework}
            setHomeworkDone={setHomeworkDone}
            addBehavior={addBehavior}
            addScore={addScore}
            closeFollowUp={closeFollowUp}
          />
        )}
        {tab === "setup" && <SetupPanel students={students} teachers={data.teachers} seedStudents={seedStudents} profile={profile} />}
      </main>
    </div>
  );
}

function Dashboard({ dashboard, students, setTab, setSelectedId }) {
  return (
    <>
      <section className="metrics">
        <Metric icon={Users} label="นักเรียน" value={students.length} note={CLASS_LABEL} />
        <Metric icon={ClipboardCheck} label="มาเรียนวันนี้" value={`${dashboard.attendanceRate}%`} note={`มา ${dashboard.present} / สาย ${dashboard.late} / ขาด ${dashboard.absent}`} />
        <Metric icon={BookOpenCheck} label="งานค้าง" value={dashboard.missingHomework} note={`งานที่เปิด ${dashboard.activeHomework} งาน`} />
        <Metric icon={ShieldCheck} label="ต้องติดตาม" value={dashboard.watch.length} note="จากความเสี่ยง/ติดตามเปิดอยู่" />
      </section>
      <section className="grid-2">
        <Panel title="นักเรียนที่ควรติดตาม">
          {dashboard.watch.length ? dashboard.watch.map((item) => (
            <button className="row-btn" key={item.student.student_id} onClick={() => { setSelectedId(item.student.student_id); setTab("students"); }}>
              <span className="seq">{item.student.seq}</span>
              <div><strong>{item.student.full_name}</strong><small>{item.reasons[0]}</small></div>
              <b className={cx("risk", item.level)}>{item.risk}</b>
            </button>
          )) : <Empty text="ยังไม่มีรายการเร่งด่วน" />}
        </Panel>
        <Panel title="พฤติกรรม 30 วัน">
          <div className="bar-list">
            <Bar label="บวก" value={dashboard.behaviorPositive} total={dashboard.behaviorTotal || 1} tone="ok" />
            <Bar label="ต้องติดตาม" value={dashboard.behaviorNegative} total={dashboard.behaviorTotal || 1} tone="danger" />
            <Bar label="ทั้งหมด" value={dashboard.behaviorTotal} total={dashboard.behaviorTotal || 1} tone="neutral" />
          </div>
        </Panel>
      </section>
    </>
  );
}

function Attendance({ students, data, setAttendance, markAllPresent }) {
  const todayRows = Object.fromEntries(data.attendance.filter((row) => row.date === TODAY()).map((row) => [row.student_id, row]));
  return (
    <>
      <section className="panel action-panel">
        <div><h2>เช็คชื่อวันนี้</h2><p>{dateText(TODAY())}</p></div>
        <button className="primary" onClick={markAllPresent}><CheckCircle2 size={17} /> มาทั้งหมด</button>
      </section>
      <section className="student-list">
        {students.map((student) => {
          const row = todayRows[student.student_id];
          return (
            <article className="student-card" key={student.student_id}>
              <div className="student-line">
                <span className="seq">{student.seq}</span>
                <div><strong>{student.full_name}</strong><small>{row?.updated_by ? `เช็คแล้วโดย ${row.updated_by} · ${timeText(row.updated_at)}` : "ยังไม่มีผู้บันทึกวันนี้"}</small></div>
              </div>
              <div className="status-grid">
                {["present", "late", "absent", "leave"].map((status) => (
                  <button key={status} className={cx(row?.status === status && "active", status)} onClick={() => setAttendance(student, status)}>
                    {statusText(status)}
                  </button>
                ))}
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}

function Students({ students, query, setQuery, selectedStudent, setSelectedId, photoUrl, uploadPhoto, updateStudentDetails, addParentContact, profile, data, teacherName, addFollowUp }) {
  const [showCitizenIds, setShowCitizenIds] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [draft, setDraft] = useState({ nickname: "", health_note: "", phone: "", phone_2: "", phone_3: "" });
  const [contactDraft, setContactDraft] = useState({ date: TODAY(), method: "phone", topic: "", result: "", next_date: "" });
  const [reportDraft, setReportDraft] = useState({ summary: "", support: "", teacherNote: "" });
  const phoneText = selectedStudent ? [selectedStudent.phone, selectedStudent.phone_2, selectedStudent.phone_3].filter(Boolean).join(" / ") : "";
  const citizenValue = (value) => formatCitizenId(value, showCitizenIds);
  const primaryPhone = [draft.phone, draft.phone_2, draft.phone_3].find((value) => normalizePhone(value));
  const timeline = useMemo(() => buildStudentTimeline(selectedStudent, data), [selectedStudent?.student_id, data]);

  useEffect(() => {
    setDraft({
      nickname: selectedStudent?.nickname || "",
      health_note: selectedStudent?.health_note || "",
      phone: selectedStudent?.phone || "",
      phone_2: selectedStudent?.phone_2 || "",
      phone_3: selectedStudent?.phone_3 || "",
    });
    setIsEditingProfile(false);
    setContactDraft({ date: TODAY(), method: "phone", topic: "", result: "", next_date: "" });
  }, [selectedStudent?.student_id]);

  useEffect(() => {
    setReportDraft(buildReportDraft(selectedStudent, profile, data));
  }, [selectedStudent?.student_id, profile.risk, profile.missingHomework, profile.openFollowUps, data]);

  async function saveDraft(event) {
    event.preventDefault();
    await updateStudentDetails(selectedStudent.student_id, draft);
    setIsEditingProfile(false);
  }

  function resetDraft() {
    setDraft({
      nickname: selectedStudent?.nickname || "",
      health_note: selectedStudent?.health_note || "",
      phone: selectedStudent?.phone || "",
      phone_2: selectedStudent?.phone_2 || "",
      phone_3: selectedStudent?.phone_3 || "",
    });
    setIsEditingProfile(false);
  }

  async function saveContact(event) {
    event.preventDefault();
    await addParentContact(selectedStudent.student_id, contactDraft);
    setContactDraft({ date: TODAY(), method: "phone", topic: "", result: "", next_date: "" });
  }

  return (
    <section className="student-layout">
      <Panel title="รายชื่อนักเรียน">
        <div className="search"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหาเลขที่/ชื่อ" /></div>
        <div className="compact-list">
          {students.map((student) => (
            <button key={student.student_id} className={cx("row-btn", selectedStudent?.student_id === student.student_id && "active")} onClick={() => setSelectedId(student.student_id)}>
              <span className="seq">{student.seq}</span><div><strong>{student.full_name}</strong><small>{student.student_code || "-"}</small></div>
            </button>
          ))}
        </div>
      </Panel>
      <Panel title="โปรไฟล์รายบุคคล">
        {selectedStudent ? (
          <div className="profile">
            <div className="profile-head">
              {photoUrl ? <img className="profile-photo" src={photoUrl} alt={selectedStudent.full_name} /> : <div className="profile-avatar">{selectedStudent.display_name?.[0] || "น"}</div>}
              <div>
                <div className="nickname">{selectedStudent.nickname || "ยังไม่ระบุชื่อเล่น"}</div>
                <h2>{selectedStudent.full_name}</h2>
                <p>เลขที่ {selectedStudent.seq} · เลขประจำตัว {selectedStudent.student_code || "-"}</p>
                <div className="profile-actions">
                  <label className="upload-btn"><Camera size={16} /> อัปโหลดรูป<input type="file" accept="image/*" onChange={(e) => uploadPhoto(selectedStudent, e.target.files?.[0])} /></label>
                  <button className="secondary" onClick={() => setShowCitizenIds((value) => !value)} type="button">
                    <ShieldCheck size={16} /> {showCitizenIds ? "ซ่อนเลขบัตร" : "แสดงเลขบัตร"}
                  </button>
                  {primaryPhone && <a className="secondary call-btn" href={`tel:${normalizePhone(primaryPhone)}`}>โทรด่วน</a>}
                </div>
              </div>
            </div>

            <form className="profile-edit" onSubmit={saveDraft}>
              <div className="profile-edit-head wide">
                <strong>แก้ไขข้อมูลติดต่อ/สุขภาพ</strong>
                {!isEditingProfile ? (
                  <button className="secondary" type="button" onClick={() => setIsEditingProfile(true)}>แก้ไขข้อมูล</button>
                ) : (
                  <button className="ghost" type="button" onClick={resetDraft}>ยกเลิก</button>
                )}
              </div>
              <label>ชื่อเล่น<input disabled={!isEditingProfile} value={draft.nickname} onChange={(e) => setDraft({ ...draft, nickname: e.target.value })} placeholder="เช่น ต้น / แก้ม / ภูมิ" /></label>
              <label className="wide">ประวัติส่วนตัว/โรคประจำตัว<textarea disabled={!isEditingProfile} value={draft.health_note} onChange={(e) => setDraft({ ...draft, health_note: e.target.value })} placeholder="โรคประจำตัว แพ้ยา อาหารที่แพ้ หรือข้อมูลสำคัญที่ครูควรรู้" /></label>
              <label>เบอร์ผู้ปกครองหลัก<input disabled={!isEditingProfile} inputMode="tel" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="เบอร์หลัก" /></label>
              <label>เบอร์สำรอง 1<input disabled={!isEditingProfile} inputMode="tel" value={draft.phone_2} onChange={(e) => setDraft({ ...draft, phone_2: e.target.value })} placeholder="เบอร์สำรอง" /></label>
              <label>เบอร์สำรอง 2<input disabled={!isEditingProfile} inputMode="tel" value={draft.phone_3} onChange={(e) => setDraft({ ...draft, phone_3: e.target.value })} placeholder="เบอร์สำรอง" /></label>
              <div className="quick-call-row wide">
                {[draft.phone, draft.phone_2, draft.phone_3].filter((value) => normalizePhone(value)).map((value, index) => (
                  <a key={`${value}-${index}`} className="secondary call-btn" href={`tel:${normalizePhone(value)}`}>โทรเบอร์ {index + 1}</a>
                ))}
              </div>
              {isEditingProfile && <button className="primary wide" type="submit">บันทึกชื่อเล่น/สุขภาพ/เบอร์โทร</button>}
            </form>

            <ProfileSection title="บันทึกติดต่อผู้ปกครอง">
              <form className="contact-form wide" onSubmit={saveContact}>
                <input type="date" value={contactDraft.date} onChange={(e) => setContactDraft({ ...contactDraft, date: e.target.value })} />
                <select value={contactDraft.method} onChange={(e) => setContactDraft({ ...contactDraft, method: e.target.value })}>
                  <option value="phone">โทรศัพท์</option>
                  <option value="line">LINE</option>
                  <option value="meeting">พบที่โรงเรียน</option>
                  <option value="home_visit">เยี่ยมบ้าน</option>
                  <option value="other">อื่น ๆ</option>
                </select>
                <input className="wide" value={contactDraft.topic} onChange={(e) => setContactDraft({ ...contactDraft, topic: e.target.value })} placeholder="หัวข้อที่ติดต่อ เช่น แจ้งงานค้าง / แจ้งขาดเรียน / ชื่นชมพฤติกรรม" />
                <textarea className="wide" value={contactDraft.result} onChange={(e) => setContactDraft({ ...contactDraft, result: e.target.value })} placeholder="ผลการพูดคุยหรือข้อตกลง" />
                <label>นัดติดตามครั้งหน้า<input type="date" value={contactDraft.next_date} onChange={(e) => setContactDraft({ ...contactDraft, next_date: e.target.value })} /></label>
                <button className="primary" type="submit"><PhoneCall size={16} /> บันทึกการติดต่อ</button>
              </form>
            </ProfileSection>

            <ProfileSection title="Timeline รายบุคคล">
              <div className="timeline wide">
                {timeline.length ? timeline.slice(0, 12).map((item) => (
                  <article className={cx("timeline-item", item.tone)} key={`${item.type}-${item.id}`}>
                    <span>{dateText(item.date)}</span>
                    <strong>{item.title}</strong>
                    <p>{item.detail || "-"}</p>
                    {item.by && <small>บันทึกโดย {item.by}</small>}
                  </article>
                )) : <Empty text="ยังไม่มี Timeline รายบุคคล" />}
              </div>
            </ProfileSection>

            <ProfileSection title="รายงานสำหรับผู้ปกครอง">
              <div className="report-editor wide">
                <label>สรุปผลอัตโนมัติ<textarea value={reportDraft.summary} onChange={(e) => setReportDraft({ ...reportDraft, summary: e.target.value })} /></label>
                <label>แนวทางส่งเสริม/ช่วยเหลือ<textarea value={reportDraft.support} onChange={(e) => setReportDraft({ ...reportDraft, support: e.target.value })} /></label>
                <label>ข้อความจากครู<textarea value={reportDraft.teacherNote} onChange={(e) => setReportDraft({ ...reportDraft, teacherNote: e.target.value })} /></label>
                <button className="primary" type="button" onClick={() => window.print()}><Printer size={16} /> พิมพ์/บันทึกเป็น PDF</button>
              </div>
              <StudentReport
                student={selectedStudent}
                profile={profile}
                report={reportDraft}
                teacherName={teacherName}
                timeline={timeline}
              />
            </ProfileSection>

            <ProfileSection title="ข้อมูลนักเรียน">
              <Info label="เลขที่" value={selectedStudent.seq} />
              <Info label="เลขประจำตัว" value={selectedStudent.student_code} />
              <Info label="ชื่อเล่น" value={selectedStudent.nickname} />
              <Info label="ชื่อ-สกุล" value={selectedStudent.full_name} />
              <Info label="ชื่อแสดง" value={selectedStudent.display_name} />
              <Info label="เพศ" value={selectedStudent.sex} />
              <Info label="วันเกิด" value={selectedStudent.birthdate_th} />
              <Info label="เลขบัตรประชาชนนักเรียน" value={citizenValue(selectedStudent.citizen_id)} sensitive />
              <Info label="สถานะในระบบ" value={selectedStudent.active === false ? "ปิดใช้งาน" : "กำลังเรียน"} />
              <Info label="วันที่เข้าเรียน" value={selectedStudent.enrolled_date} />
              <Info label="ห้องเดิม/ที่มา" value={selectedStudent.previous_class_note} />
            </ProfileSection>

            <ProfileSection title="ครอบครัวและผู้ปกครอง">
              <Info label="บิดา" value={selectedStudent.father_name} />
              <Info label="เลขบัตรบิดา" value={citizenValue(selectedStudent.father_citizen_id)} sensitive />
              <Info label="มารดา" value={selectedStudent.mother_name} />
              <Info label="เลขบัตรมารดา" value={citizenValue(selectedStudent.mother_citizen_id)} sensitive />
              <Info label="ผู้ปกครอง" value={selectedStudent.guardian_name} />
              <Info label="เลขบัตรผู้ปกครอง" value={citizenValue(selectedStudent.guardian_citizen_id)} sensitive />
              <Info label="ความสัมพันธ์" value={selectedStudent.guardian_relationship} />
              <Info label="สถานะครอบครัว" value={selectedStudent.parent_status} />
            </ProfileSection>

            <ProfileSection title="การติดต่อและที่อยู่">
              <Info label="โทรศัพท์ทั้งหมด" value={phoneText} wide />
              <Info label="เบอร์หลัก" value={selectedStudent.phone} />
              <Info label="เบอร์สำรอง 1" value={selectedStudent.phone_2} />
              <Info label="เบอร์สำรอง 2" value={selectedStudent.phone_3} />
              <Info label="ที่อยู่ทะเบียนบ้าน" value={selectedStudent.registered_address} wide />
              <Info label="ที่อยู่ปัจจุบัน" value={selectedStudent.current_address} wide />
            </ProfileSection>

            <ProfileSection title="วิเคราะห์และติดตาม">
              <Info label="ขาด/สาย/ลา 30 วัน" value={`${profile.absent}/${profile.late}/${profile.leave}`} />
              <Info label="งานค้าง" value={profile.missingHomework} />
              <Info label="ติดตามเปิดอยู่" value={profile.openFollowUps} />
              <Info label="ระดับความเสี่ยง" value={`${profile.risk}/100`} />
              <Info label="ประวัติส่วนตัว/โรคประจำตัว" value={selectedStudent.health_note} wide />
              <Info label="ต้องติดตามพิเศษ" value={selectedStudent.needs_review} wide />
              <Info label="หมายเหตุ" value={selectedStudent.note} wide />
            </ProfileSection>

            <ProfileSection title="ข้อมูลรูปและระบบ">
              <Info label="ไฟล์รูป Supabase" value={selectedStudent.photo_path} wide />
              <Info label="ไฟล์รูปเดิม Google Drive" value={selectedStudent.photo_file_id} wide />
              <Info label="อัปรูปล่าสุด" value={dateText(selectedStudent.photo_updated_at)} />
              <Info label="อัปโหลดโดย" value={selectedStudent.photo_by} />
              <Info label="สร้างข้อมูล" value={dateText(selectedStudent.created_at)} />
              <Info label="แก้ไขล่าสุด" value={dateText(selectedStudent.updated_at)} />
            </ProfileSection>

            <div className="chip-row">
              {profile.reasons.map((reason) => <span className="chip warn" key={reason}>{reason}</span>)}
            </div>
            <button className="secondary" onClick={() => addFollowUp(selectedStudent.student_id, profile.reasons[0] || "ติดตามรายบุคคล")}><Plus size={16} /> เพิ่มรายการติดตาม</button>
          </div>
        ) : <Empty text="เลือกนักเรียน" />}
      </Panel>
    </section>
  );
}

function StudentReport({ student, profile, report, teacherName, timeline }) {
  const latestContact = timeline.find((item) => item.type === "contact");
  return (
    <article className="print-report wide">
      <div className="report-head">
        <img src={brandAsset("anbnhs.jpg")} alt="ตราโรงเรียน" />
        <div>
          <h2>รายงานข้อมูลนักเรียนรายบุคคล</h2>
          <p>{SCHOOL_NAME} · {CLASS_LABEL}</p>
        </div>
      </div>
      <div className="report-student">
        <Info label="ชื่อเล่น" value={student.nickname} />
        <Info label="ชื่อ-สกุล" value={student.full_name} />
        <Info label="เลขที่/เลขประจำตัว" value={`${student.seq} / ${student.student_code || "-"}`} />
        <Info label="ผู้ปกครอง/โทร" value={`${student.guardian_name || "-"} · ${[student.phone, student.phone_2, student.phone_3].filter(Boolean).join(" / ") || "-"}`} />
      </div>
      <div className="report-box">
        <h3><FileText size={16} /> สรุปผลอัตโนมัติ</h3>
        <p>{report.summary || "-"}</p>
      </div>
      <div className="report-box">
        <h3>แนวทางส่งเสริม/ช่วยเหลือ</h3>
        <p>{report.support || "-"}</p>
      </div>
      <div className="report-grid">
        <Info label="ขาด/สาย/ลา 30 วัน" value={`${profile.absent}/${profile.late}/${profile.leave}`} />
        <Info label="งานค้าง" value={profile.missingHomework} />
        <Info label="รายการติดตามเปิดอยู่" value={profile.openFollowUps} />
        <Info label="ติดต่อล่าสุด" value={latestContact ? `${dateText(latestContact.date)} · ${latestContact.title}` : "-"} />
      </div>
      <div className="report-box">
        <h3>ข้อความจากครู</h3>
        <p>{report.teacherNote || "-"}</p>
      </div>
      <div className="signature-row">
        <div>
          <span>ลงชื่อ</span>
          <b>{teacherName}</b>
          <small>ครูผู้ออกเอกสาร</small>
        </div>
        <div>
          <span>วันที่ออกเอกสาร</span>
          <b>{dateText(TODAY())}</b>
        </div>
      </div>
    </article>
  );
}

function Work({ data, form, setForm, addHomework, setHomeworkDone, addBehavior, addScore, closeFollowUp }) {
  return (
    <section className="grid-2">
      <Panel title="เพิ่มงาน">
        <form className="form" onSubmit={addHomework}>
          <input placeholder="ชื่องาน" value={form.homeworkTitle || ""} onChange={(e) => setForm({ ...form, homeworkTitle: e.target.value })} />
          <div className="form-row"><input placeholder="วิชา" value={form.homeworkSubject || ""} onChange={(e) => setForm({ ...form, homeworkSubject: e.target.value })} /><input type="date" value={form.homeworkDue || ""} onChange={(e) => setForm({ ...form, homeworkDue: e.target.value })} /></div>
          <button className="primary"><Plus size={16} /> เพิ่มงาน</button>
        </form>
        <div className="compact-list">
          {data.homework.map((hw) => <HomeworkRow key={hw.homework_id} hw={hw} data={data} setHomeworkDone={setHomeworkDone} />)}
        </div>
      </Panel>
      <Panel title="บันทึกพฤติกรรม/คะแนน">
        <form className="form" onSubmit={addBehavior}>
          <select value={form.behaviorStudent || ""} onChange={(e) => setForm({ ...form, behaviorStudent: e.target.value })}><option value="">เลือกนักเรียน</option>{data.students.map((s) => <option key={s.student_id} value={s.student_id}>{s.seq}. {s.full_name}</option>)}</select>
          <div className="form-row"><select value={form.behaviorTone || "note"} onChange={(e) => setForm({ ...form, behaviorTone: e.target.value })}><option value="positive">บวก</option><option value="negative">ต้องติดตาม</option><option value="follow">Follow-up</option><option value="note">หมายเหตุ</option></select><input placeholder="ประเภท" value={form.behaviorCategory || ""} onChange={(e) => setForm({ ...form, behaviorCategory: e.target.value })} /></div>
          <textarea placeholder="บันทึกสั้น ๆ" value={form.behaviorNote || ""} onChange={(e) => setForm({ ...form, behaviorNote: e.target.value })} />
          <button className="primary">บันทึกพฤติกรรม</button>
        </form>
        <form className="form score-form" onSubmit={addScore}>
          <select value={form.scoreStudent || ""} onChange={(e) => setForm({ ...form, scoreStudent: e.target.value })}><option value="">เลือกนักเรียน</option>{data.students.map((s) => <option key={s.student_id} value={s.student_id}>{s.seq}. {s.full_name}</option>)}</select>
          <div className="form-row"><input placeholder="ด้าน/วิชา" value={form.scoreArea || ""} onChange={(e) => setForm({ ...form, scoreArea: e.target.value })} /><input type="number" min="0" max="100" placeholder="คะแนน" value={form.scoreValue || ""} onChange={(e) => setForm({ ...form, scoreValue: e.target.value })} /></div>
          <button className="secondary">บันทึกคะแนน</button>
        </form>
      </Panel>
      <Panel title="รายการติดตามที่เปิดอยู่">
        <div className="compact-list">
          {data.followUps.filter((row) => row.status === "open").map((row) => {
            const student = data.students.find((s) => s.student_id === row.student_id);
            return <button className="row-btn" key={row.followup_id} onClick={() => closeFollowUp(row.followup_id)}><Clock3 size={16} /><div><strong>{row.topic}</strong><small>{student?.full_name || row.student_id} · แตะเพื่อปิดรายการ</small></div></button>;
          })}
        </div>
      </Panel>
    </section>
  );
}

function HomeworkRow({ hw, data, setHomeworkDone }) {
  const done = new Set(data.homeworkStatus.filter((row) => row.homework_id === hw.homework_id && row.status === "done").map((row) => row.student_id));
  return (
    <article className="work-row">
      <strong>{hw.title}</strong><small>{hw.subject || "ทั่วไป"} · {hw.due || "ไม่กำหนด"} · ส่งแล้ว {done.size}/{data.students.length}</small>
      <select onChange={(e) => setHomeworkDone(hw.homework_id, e.target.value)} value="">
        <option value="">ติ๊กส่งงาน</option>
        {data.students.filter((s) => !done.has(s.student_id)).map((s) => <option key={s.student_id} value={s.student_id}>{s.seq}. {s.full_name}</option>)}
      </select>
    </article>
  );
}

function SetupPanel({ students, teachers, seedStudents, profile }) {
  return (
    <section className="grid-2">
      <Panel title="สถานะระบบ">
        <Info label="ห้อง" value={CLASS_LABEL} />
        <Info label="นักเรียนใน Supabase" value={`${students.length} คน`} />
        <Info label="ครูประจำชั้น" value={teachers.join(" / ")} />
        <Info label="บัญชี" value={`${profile?.display_name || "-"} (${profile?.role || "-"})`} />
        <button className="primary" onClick={seedStudents}>นำเข้ารายชื่อ 35 คน</button>
      </Panel>
      <Panel title="ขั้นตอนขึ้น GitHub">
        <ol className="steps">
          <li>สร้าง repository ใหม่</li>
          <li>ตั้งค่า Secrets/Variables สำหรับ Supabase URL และ Publishable Key</li>
          <li>Deploy ด้วย GitHub Pages หรือ Vercel</li>
          <li>ให้ครูใช้ URL ใหม่หลังทดสอบเช็คชื่อและรูปผ่าน</li>
        </ol>
      </Panel>
    </section>
  );
}

function Metric({ icon: Icon, label, value, note }) {
  return <article className="metric"><span><Icon size={18} /></span><div><small>{label}</small><strong>{value}</strong><em>{note}</em></div></article>;
}

function Panel({ title, children }) {
  return <section className="panel"><h2>{title}</h2>{children}</section>;
}

function ProfileSection({ title, children }) {
  return (
    <section className="profile-section">
      <h3>{title}</h3>
      <div className="profile-grid">{children}</div>
    </section>
  );
}

function Info({ label, value, wide, sensitive }) {
  return <div className={cx("info", wide && "wide", sensitive && "sensitive")}><span>{label}</span><strong>{displayValue(value)}</strong></div>;
}

function displayValue(value) {
  if (value === 0) return "0";
  if (typeof value === "boolean") return value ? "ใช่" : "ไม่ใช่";
  return value || "-";
}

function formatCitizenId(value, show) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (!show) return `ปิดบังอยู่ •••••••••${digits.slice(-4)}`;
  if (digits.length !== 13) return value;
  return `${digits[0]}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10, 12)}-${digits[12]}`;
}

function normalizePhone(value) {
  return String(value || "").replace(/[^\d+]/g, "");
}

function contactMethodText(method) {
  return {
    phone: "โทรศัพท์",
    line: "LINE",
    meeting: "พบที่โรงเรียน",
    home_visit: "เยี่ยมบ้าน",
    other: "อื่น ๆ",
  }[method] || "ติดต่อ";
}

function buildStudentTimeline(student, data) {
  if (!student) return [];
  const attendance = data.attendance
    .filter((row) => row.student_id === student.student_id)
    .map((row) => ({
      id: row.id || `${row.date}-${row.status}`,
      type: "attendance",
      date: row.date,
      title: `เช็คชื่อ: ${statusText(row.status)}`,
      detail: row.note || "",
      by: row.updated_by,
      tone: row.status === "present" ? "ok" : row.status === "late" ? "warn" : "danger",
    }));
  const behavior = data.behavior
    .filter((row) => row.student_id === student.student_id)
    .map((row) => ({
      id: row.id,
      type: "behavior",
      date: row.date,
      title: `พฤติกรรม: ${row.category}`,
      detail: row.note || `คะแนน ${row.points}`,
      by: row.created_by,
      tone: Number(row.points) < 0 ? "danger" : Number(row.points) > 0 ? "ok" : "neutral",
    }));
  const followUps = data.followUps
    .filter((row) => row.student_id === student.student_id)
    .map((row) => ({
      id: row.followup_id,
      type: "follow",
      date: row.date,
      title: `ติดตาม: ${row.topic}`,
      detail: `${row.status || "open"}${row.next_date ? ` · นัด ${dateText(row.next_date)}` : ""}`,
      by: row.created_by,
      tone: row.status === "done" ? "ok" : "warn",
    }));
  const contacts = data.parentContacts
    .filter((row) => row.student_id === student.student_id)
    .map((row) => ({
      id: row.contact_id,
      type: "contact",
      date: row.date,
      title: `ติดต่อผู้ปกครอง: ${contactMethodText(row.method)} - ${row.topic}`,
      detail: `${row.result || ""}${row.next_date ? ` · ติดตามอีกครั้ง ${dateText(row.next_date)}` : ""}`,
      by: row.created_by,
      tone: "neutral",
    }));
  return [...attendance, ...behavior, ...followUps, ...contacts]
    .sort((a, b) => `${b.date}`.localeCompare(`${a.date}`));
}

function buildReportDraft(student, profile, data) {
  if (!student) return { summary: "", support: "", teacherNote: "" };
  const contacts = data.parentContacts.filter((row) => row.student_id === student.student_id);
  const positives = data.behavior.filter((row) => row.student_id === student.student_id && Number(row.points) > 0).length;
  const concerns = profile.reasons.filter((reason) => reason !== "ยังไม่มีสัญญาณเสี่ยงเด่น" && reason !== "ยังไม่มีข้อมูล");
  return {
    summary: [
      `${student.full_name}${student.nickname ? ` (${student.nickname})` : ""} ห้อง ${CLASS_LABEL}`,
      `สถิติ 30 วัน: ขาด ${profile.absent} วัน, สาย ${profile.late} ครั้ง, ลา ${profile.leave} วัน`,
      `งานค้าง ${profile.missingHomework} งาน, รายการติดตามเปิดอยู่ ${profile.openFollowUps} รายการ, พฤติกรรมเชิงบวก ${positives} ครั้ง`,
      contacts.length ? `มีการติดต่อผู้ปกครองแล้ว ${contacts.length} ครั้ง` : "ยังไม่มีประวัติติดต่อผู้ปกครองในระบบ",
    ].join("\n"),
    support: concerns.length
      ? `ประเด็นที่ควรติดตาม: ${concerns.join(", ")}\nแนวทาง: ครูประจำชั้นควรติดตามต่อเนื่องร่วมกับผู้ปกครอง และบันทึกผลทุกครั้งหลังพูดคุย`
      : "ไม่พบสัญญาณเสี่ยงเด่นในช่วงข้อมูลล่าสุด ควรส่งเสริมจุดแข็งและติดตามการมาเรียนอย่างสม่ำเสมอ",
    teacherNote: student.health_note ? `ข้อมูลสุขภาพ/ข้อควรระวัง: ${student.health_note}` : "ครูสามารถแก้ข้อความส่วนนี้ก่อนพิมพ์รายงานได้",
  };
}

function Empty({ text }) {
  return <div className="empty">{text}</div>;
}

function Bar({ label, value, total, tone }) {
  const width = total ? Math.round((Number(value || 0) / total) * 100) : 0;
  return <div className={cx("hbar", tone)}><div><span>{label}</span><b>{value}</b></div><i><em style={{ width: `${Math.max(value ? 6 : 0, width)}%` }} /></i></div>;
}

function emptyData() {
  return { teachers: TEACHERS, students: [], attendance: [], homework: [], homeworkStatus: [], behavior: [], followUps: [], parentContacts: [], scores: [] };
}

function addDays(dateValue, days) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function buildDashboard(data) {
  const todayRows = data.attendance.filter((row) => row.date === TODAY());
  const present = todayRows.filter((row) => row.status === "present").length;
  const late = todayRows.filter((row) => row.status === "late").length;
  const absent = todayRows.filter((row) => row.status === "absent").length;
  const activeHomework = data.homework.filter((row) => row.active !== false);
  const done = new Set(data.homeworkStatus.filter((row) => row.status === "done").map((row) => `${row.homework_id}|${row.student_id}`));
  const missingHomework = activeHomework.reduce((sum, hw) => sum + data.students.filter((s) => !done.has(`${hw.homework_id}|${s.student_id}`)).length, 0);
  const profiles = data.students.map((student) => studentProfile(student, data));
  const watch = profiles.filter((p) => p.risk >= 25 || p.openFollowUps > 0).sort((a, b) => b.risk - a.risk).slice(0, 8);
  const behavior30 = data.behavior.filter((row) => row.date >= addDays(TODAY(), -30));
  return {
    present,
    late,
    absent,
    attendanceRate: data.students.length ? Math.round(((present + late) / data.students.length) * 100) : 0,
    activeHomework: activeHomework.length,
    missingHomework,
    watch,
    behaviorTotal: behavior30.length,
    behaviorPositive: behavior30.filter((row) => Number(row.points) > 0).length,
    behaviorNegative: behavior30.filter((row) => Number(row.points) < 0).length,
  };
}

function studentProfile(student, data) {
  if (!student) return { absent: 0, late: 0, leave: 0, missingHomework: 0, openFollowUps: 0, risk: 0, level: "normal", reasons: ["ยังไม่มีข้อมูล"] };
  const recentAttendance = data.attendance.filter((row) => row.student_id === student.student_id && row.date >= addDays(TODAY(), -30));
  const absent = recentAttendance.filter((row) => row.status === "absent").length;
  const late = recentAttendance.filter((row) => row.status === "late").length;
  const leave = recentAttendance.filter((row) => row.status === "leave").length;
  const activeHomework = data.homework.filter((row) => row.active !== false);
  const done = new Set(data.homeworkStatus.filter((row) => row.student_id === student.student_id && row.status === "done").map((row) => row.homework_id));
  const missingHomework = activeHomework.filter((hw) => !done.has(hw.homework_id)).length;
  const behavior30 = data.behavior.filter((row) => row.student_id === student.student_id && row.date >= addDays(TODAY(), -30));
  const negative = behavior30.filter((row) => Number(row.points) < 0).length;
  const openFollowUps = data.followUps.filter((row) => row.student_id === student.student_id && row.status === "open").length;
  const reasons = [];
  let risk = 0;
  if (absent >= 2) { risk += absent * 14; reasons.push(`ขาดเรียน ${absent} วัน`); }
  if (late >= 3) { risk += late * 6; reasons.push(`มาสาย ${late} ครั้ง`); }
  if (missingHomework >= 3) { risk += missingHomework * 8; reasons.push(`งานค้าง ${missingHomework} งาน`); }
  if (negative >= 2) { risk += negative * 12; reasons.push(`พฤติกรรมติดตาม ${negative} ครั้ง`); }
  if (openFollowUps) { risk += openFollowUps * 14; reasons.push(`มี follow-up เปิดอยู่ ${openFollowUps} รายการ`); }
  if (!student.phone) { risk += 8; reasons.push("ไม่มีเบอร์ผู้ปกครอง"); }
  risk = Math.min(100, risk);
  return { student, absent, late, leave, missingHomework, openFollowUps, risk, level: risk >= 60 ? "focus" : risk >= 25 ? "watch" : "normal", reasons: reasons.length ? reasons : ["ยังไม่มีสัญญาณเสี่ยงเด่น"] };
}

async function resizeImage(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("อ่านไฟล์รูปไม่ได้"));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = () => reject(new Error("เปิดรูปไม่ได้ หากเป็น HEIC ให้แปลงเป็น JPG ก่อน"));
    img.onload = () => resolve(img);
    img.src = dataUrl;
  });
  const max = 720;
  const ratio = Math.min(1, max / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * ratio));
  canvas.height = Math.max(1, Math.round(image.height * ratio));
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.72));
}

function SetupMissing() {
  return (
    <div className="login-page">
      <div className="login-card">
        <h1>ยังไม่ได้ตั้งค่า Supabase</h1>
        <p>เพิ่ม `VITE_SUPABASE_URL` และ `VITE_SUPABASE_PUBLISHABLE_KEY` ใน `.env.local` ก่อนรันระบบ</p>
      </div>
    </div>
  );
}

export default App;
