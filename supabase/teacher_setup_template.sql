-- Replace AUTH_UID_* with real Supabase Auth user IDs after creating users.

insert into public.profiles (id, display_name, role)
values
  ('AUTH_UID_THITIYAPHON', 'นางฐิติยาภรณ์ วิเศษโวหาร', 'teacher'),
  ('AUTH_UID_PITCHAYANON', 'นายพิชญานนท์ วัจนสุนทร', 'teacher'),
  ('AUTH_UID_PONGSAKORN', 'นายพงศกร วิบุญกุล', 'teacher')
on conflict (id) do update
set display_name = excluded.display_name,
    role = excluded.role,
    active = true,
    updated_at = now();

insert into public.classroom_teachers (classroom_id, profile_id, teacher_name, teacher_order)
values
  ('c-p4-2', 'AUTH_UID_THITIYAPHON', 'นางฐิติยาภรณ์ วิเศษโวหาร', 1),
  ('c-p4-2', 'AUTH_UID_PITCHAYANON', 'นายพิชญานนท์ วัจนสุนทร', 2),
  ('c-p4-2', 'AUTH_UID_PONGSAKORN', 'นายพงศกร วิบุญกุล', 3)
on conflict (classroom_id, profile_id) do update
set teacher_name = excluded.teacher_name,
    teacher_order = excluded.teacher_order,
    active = true;
