-- Extra hardening for existing tables in the same Supabase project.
-- This protects the older lesson_records table from anonymous public access.

alter table public.lesson_records enable row level security;

drop policy if exists lesson_records_staff_select on public.lesson_records;
create policy lesson_records_staff_select on public.lesson_records
for select to authenticated
using (app_private.is_staff());

drop policy if exists lesson_records_staff_write on public.lesson_records;

drop policy if exists lesson_records_staff_insert on public.lesson_records;
create policy lesson_records_staff_insert on public.lesson_records
for insert to authenticated
with check (app_private.is_staff());

drop policy if exists lesson_records_staff_update on public.lesson_records;
create policy lesson_records_staff_update on public.lesson_records
for update to authenticated
using (app_private.is_staff())
with check (app_private.is_staff());

drop policy if exists lesson_records_staff_delete on public.lesson_records;
create policy lesson_records_staff_delete on public.lesson_records
for delete to authenticated
using (app_private.is_staff());

-- Public buckets can still serve public object URLs without a broad SELECT policy.
-- Dropping this policy prevents anonymous clients from listing every object.
drop policy if exists "Allow public lesson photo reads" on storage.objects;
