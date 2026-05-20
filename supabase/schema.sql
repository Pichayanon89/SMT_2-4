-- Teacher Cockpit SMT P.4/2 - Supabase schema
-- Run in Supabase SQL Editor before importing CSV data from Google Sheets.

create extension if not exists pgcrypto;

create schema if not exists app_private;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null check (role in ('admin', 'teacher', 'viewer')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.classrooms (
  classroom_id text primary key,
  class_label text not null,
  school_name text not null,
  school_year text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.classroom_teachers (
  classroom_id text not null references public.classrooms(classroom_id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  teacher_name text not null,
  teacher_order integer not null default 1,
  active boolean not null default true,
  primary key (classroom_id, profile_id)
);

create table if not exists public.students (
  student_id text primary key,
  classroom_id text not null references public.classrooms(classroom_id) on delete restrict default 'c-p4-2',
  seq integer not null,
  student_code text,
  full_name text not null,
  display_name text,
  sex text,
  citizen_id text,
  birthdate_th text,
  registered_address text,
  current_address text,
  father_name text,
  father_citizen_id text,
  mother_name text,
  mother_citizen_id text,
  phone text,
  phone_2 text,
  phone_3 text,
  guardian_name text,
  guardian_citizen_id text,
  guardian_relationship text,
  parent_status text,
  enrolled_date text,
  previous_class_note text,
  note text,
  needs_review text,
  active boolean not null default true,
  photo_path text,
  photo_file_id text,
  photo_updated_at timestamptz,
  photo_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_access_maps (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  student_id text not null references public.students(student_id) on delete cascade,
  relationship text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (profile_id, student_id)
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  classroom_id text not null references public.classrooms(classroom_id) on delete restrict default 'c-p4-2',
  date date not null,
  student_id text not null references public.students(student_id) on delete cascade,
  status text not null check (status in ('present', 'late', 'absent', 'leave')),
  note text,
  updated_at timestamptz not null default now(),
  updated_by text,
  unique (date, student_id)
);

create table if not exists public.homework (
  homework_id text primary key,
  classroom_id text not null references public.classrooms(classroom_id) on delete restrict default 'c-p4-2',
  title text not null,
  subject text,
  due date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by text
);

create table if not exists public.homework_status (
  homework_id text not null references public.homework(homework_id) on delete cascade,
  student_id text not null references public.students(student_id) on delete cascade,
  status text not null check (status in ('done', 'missing', 'late', 'excused')),
  updated_at timestamptz not null default now(),
  updated_by text,
  primary key (homework_id, student_id)
);

create table if not exists public.behavior (
  id text primary key,
  classroom_id text not null references public.classrooms(classroom_id) on delete restrict default 'c-p4-2',
  date date not null,
  student_id text not null references public.students(student_id) on delete cascade,
  category text not null,
  tone text not null check (tone in ('positive', 'negative', 'follow', 'note')),
  points integer not null default 0,
  note text,
  follow_up boolean not null default false,
  created_at timestamptz not null default now(),
  created_by text
);

create table if not exists public.follow_ups (
  followup_id text primary key,
  classroom_id text not null references public.classrooms(classroom_id) on delete restrict default 'c-p4-2',
  date date not null,
  student_id text not null references public.students(student_id) on delete cascade,
  topic text not null,
  method text,
  status text not null default 'open' check (status in ('open', 'done', 'cancelled')),
  next_date date,
  note text,
  created_at timestamptz not null default now(),
  closed_at timestamptz,
  created_by text,
  closed_by text
);

create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  classroom_id text not null references public.classrooms(classroom_id) on delete restrict default 'c-p4-2',
  date date not null,
  student_id text not null references public.students(student_id) on delete cascade,
  area text not null,
  score numeric(5,2) not null check (score >= 0 and score <= 100),
  note text,
  updated_at timestamptz not null default now(),
  updated_by text,
  unique (date, student_id, area)
);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  event text not null,
  detail jsonb not null default '{}'::jsonb,
  created_by text
);

create table if not exists public.sync_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'google_sheets',
  mode text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running',
  detail jsonb not null default '{}'::jsonb
);

insert into public.classrooms (classroom_id, class_label, school_name, school_year)
values ('c-p4-2', 'SMT ป.4/2', 'โรงเรียนอนุบาลหนองหานวิทยายน', '2569')
on conflict (classroom_id) do update
set class_label = excluded.class_label,
    school_name = excluded.school_name,
    school_year = excluded.school_year,
    active = true;

create index if not exists students_classroom_seq_idx on public.students(classroom_id, seq);
create index if not exists students_code_idx on public.students(student_code);
create index if not exists student_access_profile_idx on public.student_access_maps(profile_id) where active;
create index if not exists student_access_maps_student_id_idx on public.student_access_maps(student_id);
create index if not exists classroom_teachers_profile_id_idx on public.classroom_teachers(profile_id);
create index if not exists attendance_student_date_idx on public.attendance(student_id, date desc);
create index if not exists attendance_classroom_date_idx on public.attendance(classroom_id, date desc);
create index if not exists homework_due_idx on public.homework(classroom_id, active, due);
create index if not exists homework_status_student_idx on public.homework_status(student_id);
create index if not exists behavior_student_date_idx on public.behavior(student_id, date desc);
create index if not exists behavior_tone_date_idx on public.behavior(classroom_id, tone, date desc);
create index if not exists follow_ups_status_next_idx on public.follow_ups(classroom_id, status, next_date);
create index if not exists follow_ups_student_id_idx on public.follow_ups(student_id);
create index if not exists scores_student_date_idx on public.scores(student_id, date desc);
create index if not exists scores_classroom_id_idx on public.scores(classroom_id);
create index if not exists audit_logs_at_idx on public.audit_logs(at desc);

create or replace function app_private.current_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role
  from public.profiles
  where id = auth.uid()
    and active = true
$$;

create or replace function app_private.is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(app_private.current_role() in ('admin', 'teacher'), false)
$$;

create or replace function app_private.can_access_classroom(target_classroom_id text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(app_private.current_role() = 'admin', false)
    or exists (
      select 1
      from public.classroom_teachers ct
      where ct.profile_id = auth.uid()
        and ct.classroom_id = target_classroom_id
        and ct.active = true
    )
$$;

create or replace function app_private.can_read_student(target_student_id text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
      select 1
      from public.students s
      where s.student_id = target_student_id
        and app_private.can_access_classroom(s.classroom_id)
    )
    or exists (
      select 1
      from public.student_access_maps sam
      where sam.profile_id = auth.uid()
        and sam.student_id = target_student_id
        and sam.active = true
    )
$$;

grant usage on schema app_private to authenticated;
grant execute on all functions in schema app_private to authenticated;

alter table public.profiles enable row level security;
alter table public.classrooms enable row level security;
alter table public.classroom_teachers enable row level security;
alter table public.students enable row level security;
alter table public.student_access_maps enable row level security;
alter table public.attendance enable row level security;
alter table public.homework enable row level security;
alter table public.homework_status enable row level security;
alter table public.behavior enable row level security;
alter table public.follow_ups enable row level security;
alter table public.scores enable row level security;
alter table public.audit_logs enable row level security;
alter table public.sync_runs enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles, public.classrooms, public.classroom_teachers, public.students, public.student_access_maps, public.attendance, public.homework, public.homework_status, public.behavior, public.follow_ups, public.scores, public.audit_logs, public.sync_runs to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- Remove older broad policies before installing action-specific policies.
drop policy if exists profiles_insert_first_admin on public.profiles;
drop policy if exists profiles_staff_write on public.profiles;
drop policy if exists classrooms_admin_write on public.classrooms;
drop policy if exists classroom_teachers_admin_write on public.classroom_teachers;
drop policy if exists students_staff_write on public.students;
drop policy if exists student_access_maps_staff_write on public.student_access_maps;
drop policy if exists attendance_staff_write on public.attendance;
drop policy if exists homework_staff_write on public.homework;
drop policy if exists homework_status_staff_write on public.homework_status;
drop policy if exists behavior_staff_write on public.behavior;
drop policy if exists follow_ups_staff_write on public.follow_ups;
drop policy if exists scores_staff_write on public.scores;
drop policy if exists sync_runs_staff_all on public.sync_runs;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
for select to authenticated
using (id = (select auth.uid()) or app_private.is_staff());

drop policy if exists profiles_admin_insert on public.profiles;
create policy profiles_admin_insert on public.profiles
for insert to authenticated
with check (app_private.current_role() = 'admin');

drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update on public.profiles
for update to authenticated
using (app_private.current_role() = 'admin')
with check (app_private.current_role() = 'admin');

drop policy if exists profiles_admin_delete on public.profiles;
create policy profiles_admin_delete on public.profiles
for delete to authenticated
using (app_private.current_role() = 'admin');

drop policy if exists classrooms_select on public.classrooms;
create policy classrooms_select on public.classrooms
for select to authenticated
using (active = true);

drop policy if exists classrooms_admin_insert on public.classrooms;
create policy classrooms_admin_insert on public.classrooms
for insert to authenticated
with check (app_private.current_role() = 'admin');

drop policy if exists classrooms_admin_update on public.classrooms;
create policy classrooms_admin_update on public.classrooms
for update to authenticated
using (app_private.current_role() = 'admin')
with check (app_private.current_role() = 'admin');

drop policy if exists classrooms_admin_delete on public.classrooms;
create policy classrooms_admin_delete on public.classrooms
for delete to authenticated
using (app_private.current_role() = 'admin');

drop policy if exists classroom_teachers_select on public.classroom_teachers;
create policy classroom_teachers_select on public.classroom_teachers
for select to authenticated
using (app_private.is_staff());

drop policy if exists classroom_teachers_admin_insert on public.classroom_teachers;
create policy classroom_teachers_admin_insert on public.classroom_teachers
for insert to authenticated
with check (app_private.current_role() = 'admin');

drop policy if exists classroom_teachers_admin_update on public.classroom_teachers;
create policy classroom_teachers_admin_update on public.classroom_teachers
for update to authenticated
using (app_private.current_role() = 'admin')
with check (app_private.current_role() = 'admin');

drop policy if exists classroom_teachers_admin_delete on public.classroom_teachers;
create policy classroom_teachers_admin_delete on public.classroom_teachers
for delete to authenticated
using (app_private.current_role() = 'admin');

drop policy if exists students_select on public.students;
create policy students_select on public.students
for select to authenticated
using (app_private.can_read_student(student_id));

drop policy if exists students_staff_insert on public.students;
create policy students_staff_insert on public.students
for insert to authenticated
with check (app_private.can_access_classroom(classroom_id));

drop policy if exists students_staff_update on public.students;
create policy students_staff_update on public.students
for update to authenticated
using (app_private.can_access_classroom(classroom_id))
with check (app_private.can_access_classroom(classroom_id));

drop policy if exists students_staff_delete on public.students;
create policy students_staff_delete on public.students
for delete to authenticated
using (app_private.can_access_classroom(classroom_id));

drop policy if exists student_access_maps_select on public.student_access_maps;
create policy student_access_maps_select on public.student_access_maps
for select to authenticated
using (profile_id = (select auth.uid()) or app_private.is_staff());

drop policy if exists student_access_maps_staff_insert on public.student_access_maps;
create policy student_access_maps_staff_insert on public.student_access_maps
for insert to authenticated
with check (app_private.is_staff());

drop policy if exists student_access_maps_staff_update on public.student_access_maps;
create policy student_access_maps_staff_update on public.student_access_maps
for update to authenticated
using (app_private.is_staff())
with check (app_private.is_staff());

drop policy if exists student_access_maps_staff_delete on public.student_access_maps;
create policy student_access_maps_staff_delete on public.student_access_maps
for delete to authenticated
using (app_private.is_staff());

drop policy if exists attendance_select on public.attendance;
create policy attendance_select on public.attendance
for select to authenticated
using (app_private.can_read_student(student_id));

drop policy if exists attendance_staff_insert on public.attendance;
create policy attendance_staff_insert on public.attendance
for insert to authenticated
with check (app_private.can_access_classroom(classroom_id));

drop policy if exists attendance_staff_update on public.attendance;
create policy attendance_staff_update on public.attendance
for update to authenticated
using (app_private.can_access_classroom(classroom_id))
with check (app_private.can_access_classroom(classroom_id));

drop policy if exists attendance_staff_delete on public.attendance;
create policy attendance_staff_delete on public.attendance
for delete to authenticated
using (app_private.can_access_classroom(classroom_id));

drop policy if exists homework_select on public.homework;
create policy homework_select on public.homework
for select to authenticated
using (app_private.can_access_classroom(classroom_id) or app_private.current_role() in ('viewer'));

drop policy if exists homework_staff_insert on public.homework;
create policy homework_staff_insert on public.homework
for insert to authenticated
with check (app_private.can_access_classroom(classroom_id));

drop policy if exists homework_staff_update on public.homework;
create policy homework_staff_update on public.homework
for update to authenticated
using (app_private.can_access_classroom(classroom_id))
with check (app_private.can_access_classroom(classroom_id));

drop policy if exists homework_staff_delete on public.homework;
create policy homework_staff_delete on public.homework
for delete to authenticated
using (app_private.can_access_classroom(classroom_id));

drop policy if exists homework_status_select on public.homework_status;
create policy homework_status_select on public.homework_status
for select to authenticated
using (app_private.can_read_student(student_id));

drop policy if exists homework_status_staff_insert on public.homework_status;
create policy homework_status_staff_insert on public.homework_status
for insert to authenticated
with check (
  exists (
    select 1 from public.homework h
    where h.homework_id = homework_status.homework_id
      and app_private.can_access_classroom(h.classroom_id)
  )
);

drop policy if exists homework_status_staff_update on public.homework_status;
create policy homework_status_staff_update on public.homework_status
for update to authenticated
using (
  exists (
    select 1 from public.homework h
    where h.homework_id = homework_status.homework_id
      and app_private.can_access_classroom(h.classroom_id)
  )
)
with check (
  exists (
    select 1 from public.homework h
    where h.homework_id = homework_status.homework_id
      and app_private.can_access_classroom(h.classroom_id)
  )
);

drop policy if exists homework_status_staff_delete on public.homework_status;
create policy homework_status_staff_delete on public.homework_status
for delete to authenticated
using (
  exists (
    select 1 from public.homework h
    where h.homework_id = homework_status.homework_id
      and app_private.can_access_classroom(h.classroom_id)
  )
);

drop policy if exists behavior_select on public.behavior;
create policy behavior_select on public.behavior
for select to authenticated
using (app_private.can_read_student(student_id));

drop policy if exists behavior_staff_insert on public.behavior;
create policy behavior_staff_insert on public.behavior
for insert to authenticated
with check (app_private.can_access_classroom(classroom_id));

drop policy if exists behavior_staff_update on public.behavior;
create policy behavior_staff_update on public.behavior
for update to authenticated
using (app_private.can_access_classroom(classroom_id))
with check (app_private.can_access_classroom(classroom_id));

drop policy if exists behavior_staff_delete on public.behavior;
create policy behavior_staff_delete on public.behavior
for delete to authenticated
using (app_private.can_access_classroom(classroom_id));

drop policy if exists follow_ups_select on public.follow_ups;
create policy follow_ups_select on public.follow_ups
for select to authenticated
using (app_private.can_read_student(student_id));

drop policy if exists follow_ups_staff_insert on public.follow_ups;
create policy follow_ups_staff_insert on public.follow_ups
for insert to authenticated
with check (app_private.can_access_classroom(classroom_id));

drop policy if exists follow_ups_staff_update on public.follow_ups;
create policy follow_ups_staff_update on public.follow_ups
for update to authenticated
using (app_private.can_access_classroom(classroom_id))
with check (app_private.can_access_classroom(classroom_id));

drop policy if exists follow_ups_staff_delete on public.follow_ups;
create policy follow_ups_staff_delete on public.follow_ups
for delete to authenticated
using (app_private.can_access_classroom(classroom_id));

drop policy if exists scores_select on public.scores;
create policy scores_select on public.scores
for select to authenticated
using (app_private.can_read_student(student_id));

drop policy if exists scores_staff_insert on public.scores;
create policy scores_staff_insert on public.scores
for insert to authenticated
with check (app_private.can_access_classroom(classroom_id));

drop policy if exists scores_staff_update on public.scores;
create policy scores_staff_update on public.scores
for update to authenticated
using (app_private.can_access_classroom(classroom_id))
with check (app_private.can_access_classroom(classroom_id));

drop policy if exists scores_staff_delete on public.scores;
create policy scores_staff_delete on public.scores
for delete to authenticated
using (app_private.can_access_classroom(classroom_id));

drop policy if exists audit_logs_staff_select on public.audit_logs;
create policy audit_logs_staff_select on public.audit_logs
for select to authenticated
using (app_private.is_staff());

drop policy if exists audit_logs_staff_insert on public.audit_logs;
create policy audit_logs_staff_insert on public.audit_logs
for insert to authenticated
with check (app_private.is_staff());

drop policy if exists sync_runs_staff_select on public.sync_runs;
create policy sync_runs_staff_select on public.sync_runs
for select to authenticated
using (app_private.is_staff());

drop policy if exists sync_runs_staff_insert on public.sync_runs;
create policy sync_runs_staff_insert on public.sync_runs
for insert to authenticated
with check (app_private.is_staff());

drop policy if exists sync_runs_staff_update on public.sync_runs;
create policy sync_runs_staff_update on public.sync_runs
for update to authenticated
using (app_private.is_staff())
with check (app_private.is_staff());

drop policy if exists sync_runs_staff_delete on public.sync_runs;
create policy sync_runs_staff_delete on public.sync_runs
for delete to authenticated
using (app_private.is_staff());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'student-photos',
  'student-photos',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists student_photos_staff_read on storage.objects;
create policy student_photos_staff_read on storage.objects
for select to authenticated
using (bucket_id = 'student-photos' and app_private.is_staff());

drop policy if exists student_photos_staff_write on storage.objects;
create policy student_photos_staff_write on storage.objects
for all to authenticated
using (bucket_id = 'student-photos' and app_private.is_staff())
with check (bucket_id = 'student-photos' and app_private.is_staff());
