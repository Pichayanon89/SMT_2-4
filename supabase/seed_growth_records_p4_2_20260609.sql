-- Weight/height record from class form: ครั้งที่ 1 ภาคเรียนที่ 1 ปีการศึกษา 2569.
-- Measurement date used in the app: 2026-06-09.

with source(student_code, weight_kg, height_cm) as (
  values
    ('10282', 22.00, 131),
    ('10285', 25.40, 136),
    ('10529', 45.95, 141),
    ('10539', 30.60, 132),
    ('10551', 28.95, 137),
    ('10552', 26.90, 127),
    ('10554', 37.15, 145),
    ('10736', 33.45, 131),
    ('10737', 41.40, 137),
    ('10964', 39.15, 131),
    ('11174', 22.70, 131),
    ('11175', 60.55, 143),
    ('11176', 29.05, 139),
    ('11177', 44.15, 139),
    ('10262', 40.20, 126),
    ('10270', 32.75, 139),
    ('10276', 35.45, 130),
    ('10294', 30.30, 139),
    ('10297', 22.20, 125),
    ('10303', 23.75, 127),
    ('10523', 76.10, 147),
    ('10527', 40.45, 157),
    ('10534', 35.65, 148),
    ('10542', 30.90, 144),
    ('10543', 25.40, 137),
    ('10544', 27.15, 139),
    ('10546', 26.95, 137),
    ('10558', 22.65, 130),
    ('10960', 28.95, 137),
    ('10961', 23.45, 131),
    ('10967', 30.15, 144),
    ('10968', 31.35, 134),
    ('11178', 40.95, 146),
    ('11179', 26.20, 131),
    ('11180', 27.65, 135)
)
insert into public.growth_records (
  classroom_id,
  date,
  student_id,
  weight_kg,
  height_cm,
  note,
  updated_at,
  updated_by
)
select
  s.classroom_id,
  date '2026-06-09',
  s.student_id,
  source.weight_kg,
  source.height_cm,
  'นำเข้าจากแบบบันทึกน้ำหนัก/ส่วนสูง ครั้งที่ 1 ภาคเรียนที่ 1/2569',
  now(),
  'Codex import'
from source
join public.students s on s.student_code = source.student_code
where s.classroom_id = 'c-p4-2'
on conflict (date, student_id) do update set
  weight_kg = excluded.weight_kg,
  height_cm = excluded.height_cm,
  note = excluded.note,
  updated_at = excluded.updated_at,
  updated_by = excluded.updated_by;
