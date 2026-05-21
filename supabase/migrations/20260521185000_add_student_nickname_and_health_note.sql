alter table public.students
  add column if not exists nickname text,
  add column if not exists health_note text;

comment on column public.students.nickname is 'Student nickname for teacher-facing profile display.';
comment on column public.students.health_note is 'Personal history, health conditions, allergies, or important care notes.';
