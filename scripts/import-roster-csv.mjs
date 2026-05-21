import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const CLASS_ID = "c-p4-2";
const DEFAULT_INPUT = "C:/Users/picha/Desktop/ประจำชั้น ป.4-2 2569/รายชื่อนักเรียน ปีการศึกษา 2569 - ห้อง4-2.csv";
const DATA_FILE = "src/data/students_p4_2_35.json";
const SQL_FILE = "supabase/seed_students_p4_2.sql";
const PUSH = process.argv.includes("--push");
const inputArg = process.argv.find((arg) => !arg.startsWith("--") && arg !== process.argv[0] && arg !== process.argv[1]);
const inputFile = inputArg || DEFAULT_INPUT;

const buffer = await fs.readFile(inputFile);
const csvText = new TextDecoder("windows-874").decode(buffer).replace(/^\uFEFF/, "");
const rows = parseCsv(csvText);
if (rows.length < 2) throw new Error("CSV has no student rows.");

const existing = JSON.parse(await fs.readFile(DATA_FILE, "utf8"));
const existingByCode = new Map(existing.filter((row) => row.student_code).map((row) => [row.student_code, row]));
const existingBySeq = new Map(existing.map((row) => [String(row.seq), row]));
const existingByName = new Map(existing.map((row) => [clean(row.full_name), row]));

const students = rows.slice(1)
  .filter((row) => clean(row[0]) || clean(row[2]))
  .map((row, index) => normalizeStudent(row, index + 1));

await fs.writeFile(DATA_FILE, `${JSON.stringify(students, null, 2)}\n`, "utf8");
await fs.writeFile(SQL_FILE, buildSql(students), "utf8");

console.log(`Imported ${students.length} students from ${inputFile}`);
console.log(`Updated ${DATA_FILE}`);
console.log(`Updated ${SQL_FILE}`);

if (PUSH) {
  const env = await readDotEnv(".env.local");
  const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) throw new Error("Missing Supabase env. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.");
  const supabase = createClient(supabaseUrl, supabaseKey);
  if (process.env.SUPABASE_AUTH_EMAIL && process.env.SUPABASE_AUTH_PASSWORD) {
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: process.env.SUPABASE_AUTH_EMAIL,
      password: process.env.SUPABASE_AUTH_PASSWORD,
    });
    if (authError) throw authError;
  }
  const { error } = await supabase.from("students").upsert(students, { onConflict: "student_id" });
  if (error) throw error;
  console.log("Pushed roster to Supabase students table.");
}

function normalizeStudent(row, fallbackSeq) {
  const seq = Number(clean(row[0]) || fallbackSeq);
  const studentCode = clean(row[1]);
  const fullName = squash(row[2]);
  const current = existingByCode.get(studentCode) || existingBySeq.get(String(seq)) || existingByName.get(clean(fullName)) || {};
  const studentId = current.student_id || (studentCode ? `stu-${CLASS_ID}-${studentCode}` : `stu-${CLASS_ID}-seq-${seq}`);
  return {
    student_id: studentId,
    classroom_id: CLASS_ID,
    seq,
    student_code: studentCode || "",
    full_name: fullName,
    display_name: displayName(fullName),
    sex: sexFromName(fullName),
    citizen_id: exactId(row[3], current.citizen_id),
    birthdate_th: normalizeDate(row[4]),
    registered_address: squash(row[5]),
    current_address: squash(row[6]),
    father_name: squash(row[7]),
    father_citizen_id: exactId(row[8], current.father_citizen_id),
    mother_name: squash(row[9]),
    mother_citizen_id: exactId(row[10], current.mother_citizen_id),
    parent_status: squash(row[11]),
    guardian_name: squash(row[12]),
    guardian_citizen_id: exactId(row[13], current.guardian_citizen_id),
    guardian_relationship: squash(row[14]),
    phone: phone(row[15]),
    phone_2: phone(row[16]),
    phone_3: phone(row[17]),
    nickname: current.nickname || "",
    health_note: current.health_note || "",
    enrolled_date: normalizeDate(row[18]),
    previous_class_note: squash(row[19]),
    note: current.note || "",
    needs_review: current.needs_review || "",
    active: true,
    photo_path: current.photo_path || undefined,
    photo_file_id: current.photo_file_id || undefined,
    photo_updated_at: current.photo_updated_at || undefined,
    photo_by: current.photo_by || undefined,
  };
}

function parseCsv(text) {
  const out = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (quoted) {
      if (ch === "\"" && next === "\"") {
        field += "\"";
        i += 1;
      } else if (ch === "\"") {
        quoted = false;
      } else {
        field += ch;
      }
    } else if (ch === "\"") {
      quoted = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field.replace(/\r$/, ""));
      out.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field || row.length) {
    row.push(field.replace(/\r$/, ""));
    out.push(row);
  }
  return out;
}

function clean(value) {
  return String(value ?? "").trim();
}

function squash(value) {
  return clean(value).replace(/\s+/g, " ");
}

function displayName(fullName) {
  return squash(fullName).replace(/^เด็กชาย/, "").replace(/^เด็กหญิง/, "").trim();
}

function sexFromName(fullName) {
  if (fullName.startsWith("เด็กชาย")) return "ชาย";
  if (fullName.startsWith("เด็กหญิง")) return "หญิง";
  return "";
}

function exactId(value, fallback = "") {
  const text = clean(value);
  const digits = text.replace(/\D/g, "");
  if (digits.length === 13 && !/[eE]/.test(text)) return digits;
  return fallback || "";
}

function phone(value) {
  const digits = clean(value).replace(/\D/g, "");
  return digits || "";
}

function normalizeDate(value) {
  return squash(value).replace(/\s+/g, "-");
}

function sqlValue(value) {
  if (value === undefined || value === null || value === "") return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  return `'${String(value).replace(/'/g, "''")}'`;
}

function buildSql(students) {
  const columns = [
    "student_id", "classroom_id", "seq", "student_code", "full_name", "display_name", "sex", "citizen_id",
    "birthdate_th", "registered_address", "current_address", "father_name", "father_citizen_id", "mother_name",
    "mother_citizen_id", "phone", "phone_2", "phone_3", "guardian_name", "guardian_citizen_id",
    "guardian_relationship", "parent_status", "nickname", "health_note", "enrolled_date", "previous_class_note",
    "note", "needs_review", "active", "photo_path", "photo_file_id", "photo_updated_at", "photo_by",
  ];
  const values = students
    .map((student) => `  (${columns.map((column) => sqlValue(student[column])).join(", ")})`)
    .join(",\n");
  const updates = columns
    .filter((column) => column !== "student_id")
    .map((column) => `  ${column} = excluded.${column}`)
    .join(",\n");
  return `-- Seed real student roster for SMT ป.4/2, school year 2569.\n-- Generated from Windows-874 CSV by scripts/import-roster-csv.mjs.\n\ninsert into public.students (${columns.join(", ")})\nvalues\n${values}\non conflict (student_id) do update set\n${updates},\n  updated_at = now();\n`;
}

async function readDotEnv(file) {
  try {
    const text = await fs.readFile(file, "utf8");
    return Object.fromEntries(text.split(/\r?\n/).map((line) => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      return match ? [match[1].trim(), match[2].trim()] : null;
    }).filter(Boolean));
  } catch {
    return {};
  }
}
