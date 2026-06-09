create table if not exists public.growth_records (
  id uuid primary key default gen_random_uuid(),
  classroom_id text not null references public.classrooms(classroom_id) on delete restrict default 'c-p4-2',
  date date not null,
  student_id text not null references public.students(student_id) on delete cascade,
  weight_kg numeric(5,2) not null check (weight_kg > 0 and weight_kg < 200),
  height_cm numeric(5,2) not null check (height_cm > 0 and height_cm < 250),
  note text,
  updated_at timestamptz not null default now(),
  updated_by text,
  unique (date, student_id)
);

create index if not exists growth_records_classroom_date_idx on public.growth_records (classroom_id, date desc);
create index if not exists growth_records_student_date_idx on public.growth_records (student_id, date desc);

alter table public.growth_records enable row level security;

grant select, insert, update, delete on public.growth_records to authenticated;

drop policy if exists growth_records_select on public.growth_records;
create policy growth_records_select on public.growth_records
for select to authenticated
using (app_private.can_read_student(student_id));

drop policy if exists growth_records_staff_insert on public.growth_records;
create policy growth_records_staff_insert on public.growth_records
for insert to authenticated
with check (app_private.can_access_classroom(classroom_id));

drop policy if exists growth_records_staff_update on public.growth_records;
create policy growth_records_staff_update on public.growth_records
for update to authenticated
using (app_private.can_access_classroom(classroom_id))
with check (app_private.can_access_classroom(classroom_id));

drop policy if exists growth_records_staff_delete on public.growth_records;
create policy growth_records_staff_delete on public.growth_records
for delete to authenticated
using (app_private.can_access_classroom(classroom_id));
