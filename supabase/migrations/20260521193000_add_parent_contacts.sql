create table if not exists public.parent_contacts (
  contact_id text primary key,
  classroom_id text not null references public.classrooms(classroom_id) on delete restrict default 'c-p4-2',
  date date not null,
  student_id text not null references public.students(student_id) on delete cascade,
  method text not null check (method in ('phone', 'line', 'meeting', 'home_visit', 'other')),
  topic text not null,
  result text,
  next_date date,
  created_at timestamptz not null default now(),
  created_by text
);

create index if not exists parent_contacts_student_date_idx on public.parent_contacts(student_id, date desc);
create index if not exists parent_contacts_classroom_date_idx on public.parent_contacts(classroom_id, date desc);

alter table public.parent_contacts enable row level security;
grant select, insert, update, delete on public.parent_contacts to authenticated;

drop policy if exists parent_contacts_select on public.parent_contacts;
create policy parent_contacts_select on public.parent_contacts
for select to authenticated
using (app_private.can_read_student(student_id));

drop policy if exists parent_contacts_staff_insert on public.parent_contacts;
create policy parent_contacts_staff_insert on public.parent_contacts
for insert to authenticated
with check (app_private.can_access_classroom(classroom_id));

drop policy if exists parent_contacts_staff_update on public.parent_contacts;
create policy parent_contacts_staff_update on public.parent_contacts
for update to authenticated
using (app_private.can_access_classroom(classroom_id))
with check (app_private.can_access_classroom(classroom_id));

drop policy if exists parent_contacts_staff_delete on public.parent_contacts;
create policy parent_contacts_staff_delete on public.parent_contacts
for delete to authenticated
using (app_private.can_access_classroom(classroom_id));
